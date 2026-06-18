use anyhow::{Context, Result, bail};
use pulldown_cmark::{CodeBlockKind, CowStr, Event, Options, Parser, Tag, TagEnd, html};
use rayon::prelude::*;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::collections::{BTreeMap, BTreeSet};
use std::env;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::thread;
use std::time::Instant;

const SCHEMA_VERSION: u32 = 2;
const FIRST_YEAR: i32 = 2011;
const PHILOSOPHY_FIRST_YEAR: i32 = 2026;
const MAX_POSTS_PER_PAGE: usize = 10;
const MAX_RSS_ITEMS: usize = 50;
const BASE_URL: &str = "https://patrickdesjardins.com";
const MARKDOWN_RENDERER_VERSION: &str = "rust-md-2026-06-14";
const SHORTCODE_RENDERER_VERSION: &str = "shortcodes-2026-06-14";
const SHELL_TEMPLATE_VERSION: &str = "rust-shell-2026-06-14";

#[derive(Clone, Debug, Default, Deserialize, PartialEq, Serialize)]
struct Assets {
    css: Vec<String>,
    js: Vec<String>,
}

#[derive(Clone, Debug, Deserialize)]
struct Route {
    path: String,
    #[serde(rename = "outputPath")]
    output_path: String,
    dependencies: Vec<String>,
}

#[derive(Clone, Debug)]
struct Post {
    slug: String,
    date: String,
    dependency: String,
    metadata_dependency: String,
    collection: Collection,
    year: i32,
    title: String,
    categories: Vec<String>,
    content_hash: String,
    frontmatter_hash: String,
    body_hash: String,
    body: String,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
enum Collection {
    Blog,
    Philosophy,
}

impl Collection {
    fn route_prefix(self) -> &'static str {
        match self {
            Self::Blog => "blog",
            Self::Philosophy => "philosophy",
        }
    }

    fn first_year(self) -> i32 {
        match self {
            Self::Blog => FIRST_YEAR,
            Self::Philosophy => PHILOSOPHY_FIRST_YEAR,
        }
    }
}

#[derive(Clone, Debug, Default)]
struct Frontmatter {
    title: String,
    date: String,
    categories: Vec<String>,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
struct ContentCacheEntry {
    collection: String,
    slug: String,
    route_path: String,
    #[serde(rename = "outputPath")]
    output_path: String,
    #[serde(rename = "contentHash")]
    content_hash: String,
    #[serde(rename = "frontmatterHash")]
    frontmatter_hash: String,
    #[serde(rename = "bodyHash")]
    body_hash: String,
    #[serde(rename = "fragmentHash")]
    fragment_hash: String,
}

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
struct GlobalHashes {
    #[serde(rename = "assetsHash")]
    assets_hash: String,
    #[serde(rename = "shellTemplateHash")]
    shell_template_hash: String,
    #[serde(rename = "shortcodeRendererHash")]
    shortcode_renderer_hash: String,
    #[serde(rename = "markdownRendererHash")]
    markdown_renderer_hash: String,
    #[serde(rename = "sharedLayoutHash")]
    shared_layout_hash: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
struct ManifestRoute {
    #[serde(rename = "outputPath")]
    output_path: String,
    dependencies: Vec<String>,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
struct Manifest {
    #[serde(rename = "schemaVersion")]
    schema_version: u32,
    #[serde(rename = "generatedAt")]
    generated_at: String,
    assets: Assets,
    #[serde(rename = "sourceHashes")]
    source_hashes: BTreeMap<String, String>,
    #[serde(rename = "outputHashes")]
    output_hashes: BTreeMap<String, String>,
    routes: BTreeMap<String, ManifestRoute>,
    #[serde(default)]
    content: BTreeMap<String, ContentCacheEntry>,
    #[serde(default, rename = "globalHashes")]
    global_hashes: GlobalHashes,
}

#[derive(Deserialize)]
struct ViteEntry {
    file: String,
    #[serde(default)]
    css: Vec<String>,
}

struct PhaseTimer {
    enabled: bool,
    last: Instant,
}

impl PhaseTimer {
    fn new() -> Self {
        Self {
            enabled: env::var("SITEGEN_TIMING").ok().as_deref() == Some("1"),
            last: Instant::now(),
        }
    }

    fn mark(&mut self, label: &str) {
        if self.enabled {
            eprintln!(
                "sitegen timing {label}: {:.3}s",
                self.last.elapsed().as_secs_f64()
            );
            self.last = Instant::now();
        }
    }
}

fn slash(value: &Path) -> String {
    value
        .to_string_lossy()
        .replace(std::path::MAIN_SEPARATOR, "/")
}

fn relative(root: &Path, value: &Path) -> Result<String> {
    Ok(slash(value.strip_prefix(root).with_context(|| {
        format!("{} is not under {}", value.display(), root.display())
    })?))
}

fn file_exists(path: &Path) -> bool {
    path.is_file()
}

fn sha256(bytes: &[u8]) -> String {
    let mut hasher = Sha256::new();
    hasher.update(bytes);
    format!("{:x}", hasher.finalize())
}

fn hash_file(path: &Path) -> Result<String> {
    Ok(sha256(
        &fs::read(path).with_context(|| format!("read {}", path.display()))?,
    ))
}

fn walk_files(root: &Path, entry: &str) -> Result<Vec<PathBuf>> {
    let absolute = root.join(entry);
    if !absolute.exists() {
        return Ok(Vec::new());
    }
    let metadata = fs::metadata(&absolute)?;
    if metadata.is_file() {
        return Ok(vec![absolute]);
    }
    if !metadata.is_dir() {
        return Ok(Vec::new());
    }

    let mut files = Vec::new();
    let mut stack = vec![absolute];
    while let Some(dir) = stack.pop() {
        for entry in fs::read_dir(&dir).with_context(|| format!("read {}", dir.display()))? {
            let entry = entry?;
            let path = entry.path();
            let file_type = entry.file_type()?;
            if file_type.is_dir() {
                if path.components().any(|part| part.as_os_str() == ".git") {
                    continue;
                }
                stack.push(path);
            } else if file_type.is_file() {
                files.push(path);
            }
        }
    }
    files.sort();
    Ok(files)
}

fn source_hashes_for(root: &Path, dependencies: &[String]) -> Result<BTreeMap<String, String>> {
    let mut hashes = BTreeMap::new();
    for dependency in dependencies {
        if let Some(file_path) = dependency.strip_prefix("meta:") {
            let content = fs::read_to_string(root.join(file_path))
                .with_context(|| format!("read {}", root.join(file_path).display()))?;
            hashes.insert(
                dependency.clone(),
                sha256(frontmatter_raw(&content).as_bytes()),
            );
            continue;
        }
        for file in walk_files(root, dependency)? {
            hashes.insert(relative(root, &file)?, hash_file(&file)?);
        }
    }
    Ok(hashes)
}

struct SourceHasher<'a> {
    root: &'a Path,
    cache: BTreeMap<String, BTreeMap<String, String>>,
}

impl<'a> SourceHasher<'a> {
    fn new(root: &'a Path) -> Self {
        Self {
            root,
            cache: BTreeMap::new(),
        }
    }

    fn dependency_hashes(&mut self, dependency: &str) -> Result<&BTreeMap<String, String>> {
        if !self.cache.contains_key(dependency) {
            let hashes = source_hashes_for(self.root, &[dependency.to_string()])?;
            self.cache.insert(dependency.to_string(), hashes);
        }
        Ok(self
            .cache
            .get(dependency)
            .expect("dependency hash cache filled"))
    }

    fn route_hashes(&mut self, dependencies: &[String]) -> Result<BTreeMap<String, String>> {
        let mut hashes = BTreeMap::new();
        for dependency in dependencies {
            hashes.extend(self.dependency_hashes(dependency)?.clone());
        }
        Ok(hashes)
    }
}

fn merge_hashes(
    hasher: &mut SourceHasher<'_>,
    routes: &[Route],
) -> Result<BTreeMap<String, String>> {
    let mut hashes = BTreeMap::new();
    for route in routes {
        hashes.extend(hasher.route_hashes(&route.dependencies)?);
    }
    Ok(hashes)
}

fn output_hash(out_dir: &Path, output_path: &str) -> Result<Option<String>> {
    let absolute = out_dir.join(output_path);
    if file_exists(&absolute) {
        Ok(Some(hash_file(&absolute)?))
    } else {
        Ok(None)
    }
}

fn load_manifest(path: &Path) -> Result<Option<Manifest>> {
    if !file_exists(path) {
        return Ok(None);
    }
    Ok(Some(serde_json::from_slice(&fs::read(path)?)?))
}

fn assets_from_vite_manifest(out_dir: &Path) -> Result<Assets> {
    let manifest_path = out_dir.join(".vite/manifest.json");
    if !file_exists(&manifest_path) {
        return Ok(Assets::default());
    }
    let manifest: BTreeMap<String, ViteEntry> = serde_json::from_slice(&fs::read(manifest_path)?)?;
    let Some(client_entry) = manifest.get("src/site/client.tsx") else {
        return Ok(Assets::default());
    };
    let mut css = client_entry
        .css
        .iter()
        .map(|asset| format!("/{asset}"))
        .collect::<Vec<_>>();
    css.push("/assets/static-modules.css".to_string());
    Ok(Assets {
        css,
        js: vec![format!("/{}", client_entry.file)],
    })
}

fn asset_output_paths(assets: &Assets) -> Vec<String> {
    assets
        .css
        .iter()
        .chain(assets.js.iter())
        .map(|asset| asset.trim_start_matches('/').to_string())
        .collect()
}

fn today_utc() -> Result<String> {
    Ok(String::from_utf8(
        Command::new("date")
            .args(["-u", "+%Y-%m-%d"])
            .output()?
            .stdout,
    )?
    .trim()
    .to_string())
}

fn current_year_utc() -> Result<i32> {
    Ok(
        String::from_utf8(Command::new("date").args(["-u", "+%Y"]).output()?.stdout)?
            .trim()
            .parse()?,
    )
}

fn frontmatter_raw(content: &str) -> &str {
    let Some(rest) = content.strip_prefix("---") else {
        return "";
    };
    let Some(end) = rest.find("\n---") else {
        return "";
    };
    &rest[..end]
}

fn split_frontmatter_body(content: &str) -> (&str, &str) {
    let Some(rest) = content.strip_prefix("---") else {
        return ("", content);
    };
    let Some(end) = rest.find("\n---") else {
        return ("", content);
    };
    let body_start = end + "\n---".len();
    let body = rest[body_start..]
        .strip_prefix("\r\n")
        .or_else(|| rest[body_start..].strip_prefix('\n'))
        .unwrap_or(&rest[body_start..]);
    (&rest[..end], body)
}

fn strip_quotes(value: &str) -> String {
    value.trim().trim_matches(['"', '\'']).to_string()
}

fn parse_frontmatter(content: &str) -> Frontmatter {
    let raw = frontmatter_raw(content);
    let mut frontmatter = Frontmatter::default();
    let lines = raw.lines().collect::<Vec<_>>();
    let mut index = 0;
    while index < lines.len() {
        let line = lines[index];
        let Some((key, raw_value)) = line.split_once(':') else {
            index += 1;
            continue;
        };
        let key = key.trim();
        let raw_value = raw_value.trim();
        if raw_value.is_empty() {
            let mut values = Vec::new();
            while index + 1 < lines.len() {
                let next = lines[index + 1].trim_start();
                let Some(value) = next.strip_prefix("- ") else {
                    break;
                };
                values.push(strip_quotes(value));
                index += 1;
            }
            if key == "categories" {
                frontmatter.categories = values;
            }
        } else if key == "title" {
            frontmatter.title = strip_quotes(raw_value);
        } else if key == "date" {
            frontmatter.date = strip_quotes(raw_value);
        }
        index += 1;
    }
    frontmatter
}

fn collection_posts(
    root: &Path,
    collection: Collection,
    first_year: i32,
    last_year: i32,
) -> Result<Vec<Post>> {
    let today = today_utc()?;
    let mut posts = Vec::new();
    for year in first_year..=last_year {
        let collection_dir = match collection {
            Collection::Blog => "src/_posts",
            Collection::Philosophy => "src/_philosophy",
        };
        let dir = root.join(collection_dir).join(year.to_string());
        if !dir.is_dir() {
            continue;
        }
        for entry in fs::read_dir(&dir)? {
            let entry = entry?;
            if !entry.file_type()?.is_file() {
                continue;
            }
            let path = entry.path();
            let Some(extension) = path.extension().and_then(|value| value.to_str()) else {
                continue;
            };
            if extension != "md" && extension != "mdx" {
                continue;
            }
            let content = fs::read_to_string(&path)?;
            let frontmatter = parse_frontmatter(&content);
            let date = frontmatter.date.clone();
            if date.get(..10).unwrap_or(&date) > today.as_str() {
                continue;
            }
            let (frontmatter_raw, body) = split_frontmatter_body(&content);
            let file_stem = path
                .file_stem()
                .and_then(|value| value.to_str())
                .context("post file has no utf-8 stem")?
                .to_string();
            let dependency = relative(root, &path)?;
            posts.push(Post {
                slug: file_stem,
                date,
                metadata_dependency: format!("meta:{dependency}"),
                dependency,
                collection,
                year,
                title: frontmatter.title,
                categories: frontmatter.categories,
                content_hash: sha256(content.as_bytes()),
                frontmatter_hash: sha256(frontmatter_raw.as_bytes()),
                body_hash: sha256(body.as_bytes()),
                body: body.to_string(),
            });
        }
    }
    posts.sort_by(|a, b| b.date.cmp(&a.date).then_with(|| a.slug.cmp(&b.slug)));
    Ok(posts)
}

fn route_file_path(route_path: &str) -> String {
    if route_path == "/" {
        "index.html".to_string()
    } else {
        format!("{}.html", route_path.trim_start_matches('/'))
    }
}

fn total_pages(posts: &[Post]) -> usize {
    posts.len().div_ceil(MAX_POSTS_PER_PAGE)
}

fn shared_dependencies() -> Vec<String> {
    [
        "src/app",
        "src/site",
        "src/constants",
        "src/lib",
        "src/_utils",
        "scripts/build-site.mjs",
        "scripts/render-site.mjs",
        "tools/sitegen/Cargo.toml",
        "tools/sitegen/Cargo.lock",
        "tools/sitegen/src",
        "_headers",
        "public/output",
        "public/philosophy-output",
        "vite.config.ts",
        "package.json",
    ]
    .into_iter()
    .map(String::from)
    .collect()
}

fn route(path: &str, shared: &[String], dependencies: &[String]) -> Route {
    let mut route_dependencies = shared.to_vec();
    route_dependencies.extend_from_slice(dependencies);
    Route {
        path: path.to_string(),
        output_path: route_file_path(path),
        dependencies: route_dependencies,
    }
}

fn build_routes(root: &Path) -> Result<Vec<Route>> {
    let last_year = current_year_utc()?;
    let blog_posts = collection_posts(root, Collection::Blog, FIRST_YEAR, last_year)?;
    let philosophy_posts = collection_posts(
        root,
        Collection::Philosophy,
        PHILOSOPHY_FIRST_YEAR,
        last_year,
    )?;
    let blog_total_pages = total_pages(&blog_posts);
    let philosophy_total_pages = total_pages(&philosophy_posts).max(1);
    let blog_deps = blog_posts
        .iter()
        .map(|post| post.metadata_dependency.clone())
        .collect::<Vec<_>>();
    let philosophy_deps = philosophy_posts
        .iter()
        .map(|post| post.metadata_dependency.clone())
        .collect::<Vec<_>>();
    let shared = shared_dependencies();
    let mut routes = Vec::new();

    routes.push(route("/", &shared, &[]));
    routes.push(route("/blog", &shared, &blog_deps));
    routes.push(route("/blog/search", &shared, &blog_deps));
    routes.push(route("/philosophy", &shared, &philosophy_deps));
    routes.push(route("/philosophy/search", &shared, &philosophy_deps));
    routes.push(route("/404", &shared, &[]));

    for page in 1..=blog_total_pages {
        routes.push(route(&format!("/blog/page/{page}"), &shared, &blog_deps));
    }
    for year in (FIRST_YEAR..=last_year).rev() {
        routes.push(route(&format!("/blog/for/{year}"), &shared, &blog_deps));
    }
    for post in &blog_posts {
        routes.push(route(
            &format!("/blog/{}", post.slug),
            &shared,
            std::slice::from_ref(&post.dependency),
        ));
    }
    for page in 1..=philosophy_total_pages {
        routes.push(route(
            &format!("/philosophy/page/{page}"),
            &shared,
            &philosophy_deps,
        ));
    }
    for year in (PHILOSOPHY_FIRST_YEAR..=last_year).rev() {
        routes.push(route(
            &format!("/philosophy/for/{year}"),
            &shared,
            &philosophy_deps,
        ));
    }
    for post in &philosophy_posts {
        routes.push(route(
            &format!("/philosophy/{}", post.slug),
            &shared,
            std::slice::from_ref(&post.dependency),
        ));
    }

    Ok(routes)
}

fn class_names(css: &str) -> BTreeSet<String> {
    let mut names = BTreeSet::new();
    let chars = css.as_bytes();
    let mut index = 0;
    while index + 1 < chars.len() {
        if chars[index] == b'.' {
            let start = index + 1;
            let first = chars[start];
            if first == b'_' || first.is_ascii_alphabetic() {
                let mut end = start + 1;
                while end < chars.len()
                    && (chars[end] == b'_'
                        || chars[end] == b'-'
                        || chars[end].is_ascii_alphanumeric())
                {
                    end += 1;
                }
                names.insert(css[start..end].to_string());
                index = end;
                continue;
            }
        }
        index += 1;
    }
    names
}

fn css_module_class_name(root: &Path, local_name: &str, filename: &Path) -> Result<String> {
    let src = root.join("src");
    let mut relative = slash(filename.strip_prefix(src)?);
    relative = relative.trim_end_matches(".module.css").to_string();
    let safe = relative
        .chars()
        .map(|ch| {
            if ch.is_ascii_alphanumeric() || ch == '_' {
                ch
            } else {
                '_'
            }
        })
        .collect::<String>();
    Ok(format!("{safe}__{local_name}"))
}

fn protect_urls(css: &str) -> (String, Vec<String>) {
    let mut output = String::new();
    let mut protected = Vec::new();
    let mut rest = css;
    while let Some(start) = rest.find("url(") {
        let Some(end) = rest[start..].find(')') else {
            break;
        };
        output.push_str(&rest[..start]);
        let full_end = start + end + 1;
        let placeholder = format!("__STATIC_CSS_URL_{}__", protected.len());
        protected.push(rest[start..full_end].to_string());
        output.push_str(&placeholder);
        rest = &rest[full_end..];
    }
    output.push_str(rest);
    (output, protected)
}

fn transform_css_module(root: &Path, file: &Path) -> Result<String> {
    let css = fs::read_to_string(file)?;
    let names = class_names(&css);
    let (mut transformed, protected) = protect_urls(&css);
    for name in names {
        transformed = transformed.replace(
            &format!(".{name}"),
            &format!(".{}", css_module_class_name(root, &name, file)?),
        );
    }
    for (index, url) in protected.iter().enumerate() {
        transformed = transformed.replace(&format!("__STATIC_CSS_URL_{index}__"), url);
    }
    Ok(format!(
        "\n/* {} */\n{transformed}\n",
        relative(root, file)?
    ))
}

fn css_module_sort_key(root: &Path, file: &Path) -> Result<String> {
    let file = relative(root, file)?;
    let prefix = if file == "src/app/layout.module.css" {
        "00"
    } else if file.ends_with("/layout.module.css") {
        "10"
    } else if file == "src/app/website/website.module.css" {
        "20"
    } else {
        "30"
    };
    Ok(format!("{prefix}:{file}"))
}

fn write_static_module_css(root: &Path, out_dir: &Path) -> Result<()> {
    let mut css_files = walk_files(root, "src/app")?
        .into_iter()
        .filter(|file| file.to_string_lossy().ends_with(".module.css"))
        .collect::<Vec<_>>();
    css_files.sort_by_key(|file| css_module_sort_key(root, file).unwrap_or_default());
    let output_path = out_dir.join("assets/static-modules.css");
    if let Some(parent) = output_path.parent() {
        fs::create_dir_all(parent)?;
    }
    let mut output = String::new();
    for file in css_files {
        output.push_str(&transform_css_module(root, &file)?);
        output.push('\n');
    }
    fs::write(output_path, output)?;
    Ok(())
}

fn run_command(root: &Path, program: &str, args: &[&str]) -> Result<()> {
    let status = Command::new(program)
        .args(args)
        .current_dir(root)
        .env(
            "NODE_ENV",
            env::var("NODE_ENV").unwrap_or_else(|_| "production".to_string()),
        )
        .status()
        .with_context(|| format!("run {program} {}", args.join(" ")))?;
    if !status.success() {
        bail!("{program} {} exited with {status}", args.join(" "));
    }
    Ok(())
}

fn run_vite_builds(root: &Path, out_dir: &Path) -> Result<()> {
    let root = root.to_path_buf();
    let client_root = root.clone();
    let client = thread::spawn(move || {
        run_command(
            &client_root,
            "node_modules/.bin/vite",
            &["build", "--mode", "production"],
        )
    });
    let ssr_root = root.clone();
    let ssr = thread::spawn(move || {
        run_command(
            &ssr_root,
            "node_modules/.bin/vite",
            &[
                "build",
                "--ssr",
                "src/site/render.tsx",
                "--outDir",
                "out/server",
                "--emptyOutDir",
                "true",
                "--mode",
                "production",
            ],
        )
    });
    client
        .join()
        .map_err(|_| anyhow::anyhow!("client vite build thread panicked"))??;
    ssr.join()
        .map_err(|_| anyhow::anyhow!("ssr vite build thread panicked"))??;
    trim_ssr_output(out_dir);
    write_static_module_css(&root, out_dir)
}

fn trim_ssr_output(out_dir: &Path) {
    for path in [".vite", "images", "videos", "output", "philosophy-output"] {
        let _ = fs::remove_dir_all(out_dir.join("server").join(path));
    }
}

fn escape_html(value: &str) -> String {
    value
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
}

fn escape_xml(value: &str) -> String {
    value
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&apos;")
}

fn rss_pub_date(date: &str) -> Result<String> {
    let date_part = date.get(..10).unwrap_or(date);
    Ok(String::from_utf8(
        Command::new("date")
            .args(["-u", "-d", date_part, "+%a, %d %b %Y %H:%M:%S +0000"])
            .output()
            .with_context(|| format!("format RSS pubDate for {date_part}"))?
            .stdout,
    )?
    .trim()
    .to_string())
}

fn plain_text_excerpt(body: &str, max_len: usize) -> String {
    let mut excerpt = String::new();
    for line in body.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty()
            || trimmed.starts_with('#')
            || trimmed.starts_with('!')
            || trimmed.starts_with('<')
            || trimmed.starts_with("```")
            || trimmed.starts_with("~~~")
        {
            continue;
        }
        let mut text = trimmed.to_string();
        while let Some(start) = text.find('[') {
            let Some(end) = text[start..].find(']') else {
                break;
            };
            let after = start + end + 1;
            if text.get(after..after + 1) == Some("(") {
                if let Some(close) = text[after + 1..].find(')') {
                    text.replace_range(start..after + 2 + close, "");
                    continue;
                }
            }
            break;
        }
        text = text.replace('`', "");
        if text.is_empty() {
            continue;
        }
        if !excerpt.is_empty() {
            excerpt.push(' ');
        }
        excerpt.push_str(&text);
        if excerpt.len() >= max_len {
            break;
        }
    }
    if excerpt.len() > max_len {
        excerpt.truncate(max_len);
        excerpt = excerpt.trim_end().to_string();
        excerpt.push('…');
    }
    excerpt
}

fn rss_head_link(collection: Collection) -> String {
    let (title, path) = match collection {
        Collection::Blog => ("Patrick Desjardins Blog", "/blog/rss.xml"),
        Collection::Philosophy => ("Philosophy — Patrick Desjardins", "/philosophy/rss.xml"),
    };
    format!(
        r#"<link rel="alternate" type="application/rss+xml" title="{}" href="{BASE_URL}{path}">"#,
        escape_html(title),
    )
}

fn rss_channel_meta(collection: Collection) -> (&'static str, &'static str, &'static str) {
    match collection {
        Collection::Blog => (
            "Patrick Desjardins Blog",
            "/blog",
            "Technical blog posts by Patrick Desjardins",
        ),
        Collection::Philosophy => (
            "Philosophy — Patrick Desjardins",
            "/philosophy",
            "Essays and notes by Patrick Desjardins",
        ),
    }
}

fn render_rss_feed(out_dir: &Path, collection: Collection, posts: &[Post]) -> Result<()> {
    let (channel_title, channel_path, channel_description) = rss_channel_meta(collection);
    let prefix = collection.route_prefix();
    let build_date = rss_pub_date(&today_utc()?)?;
    let mut items = String::new();
    for post in posts.iter().take(MAX_RSS_ITEMS) {
        let link = format!("{BASE_URL}/{prefix}/{}", post.slug);
        let description = plain_text_excerpt(&post.body, 300);
        items.push_str(&format!(
            r#"<item><title>{}</title><link>{}</link><description>{}</description><pubDate>{}</pubDate><guid isPermaLink="true">{}</guid></item>"#,
            escape_xml(&post.title),
            escape_xml(&link),
            escape_xml(&description),
            escape_xml(&rss_pub_date(&post.date)?),
            escape_xml(&link),
        ));
    }
    let output_path = out_dir.join(format!("{prefix}/rss.xml"));
    if let Some(parent) = output_path.parent() {
        fs::create_dir_all(parent)?;
    }
    fs::write(
        output_path,
        format!(
            r#"<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>{}</title><link>{BASE_URL}{}</link><description>{}</description><language>en</language><lastBuildDate>{}</lastBuildDate>{items}</channel></rss>"#,
            escape_xml(channel_title),
            channel_path,
            escape_xml(channel_description),
            escape_xml(&build_date),
        ),
    )?;
    Ok(())
}

fn render_rss_feeds(
    out_dir: &Path,
    blog_posts: &[Post],
    philosophy_posts: &[Post],
) -> Result<()> {
    render_rss_feed(out_dir, Collection::Blog, blog_posts)?;
    render_rss_feed(out_dir, Collection::Philosophy, philosophy_posts)?;
    Ok(())
}

fn class(root: &Path, module: &str, local: &str) -> Result<String> {
    css_module_class_name(root, local, &root.join(module))
}

fn page_document(
    root: &Path,
    title: &str,
    description: &str,
    assets: &Assets,
    body: &str,
    head_extra: Option<&str>,
) -> Result<String> {
    let html_class = class(root, "src/app/layout.module.css", "htmlstyle")?;
    let body_class = class(root, "src/app/layout.module.css", "bodystyle")?;
    let css = assets
        .css
        .iter()
        .map(|href| format!(r#"<link rel="stylesheet" href="{}">"#, escape_html(href)))
        .collect::<String>();
    let js = assets
        .js
        .iter()
        .map(|src| {
            format!(
                r#"<script type="module" src="{}"></script>"#,
                escape_html(src)
            )
        })
        .collect::<String>();
    let extra = head_extra.unwrap_or("");
    Ok(format!(
        r#"<!doctype html><html lang="en" class="{html_class}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>{}</title><meta name="description" content="{}">{extra}{css}</head><body class="{body_class}">{body}{js}</body></html>"#,
        escape_html(title),
        escape_html(description),
    ))
}

fn posts_for(root: &Path, collection: Collection) -> Result<Vec<Post>> {
    collection_posts(
        root,
        collection,
        collection.first_year(),
        current_year_utc()?,
    )
}

fn all_content_posts(root: &Path) -> Result<(Vec<Post>, Vec<Post>)> {
    Ok((
        posts_for(root, Collection::Blog)?,
        posts_for(root, Collection::Philosophy)?,
    ))
}

fn post_from_dependency(root: &Path, dependency: &str, collection: Collection) -> Result<Post> {
    let path = root.join(dependency);
    let content = fs::read_to_string(&path)?;
    let frontmatter = parse_frontmatter(&content);
    let (frontmatter_raw, body) = split_frontmatter_body(&content);
    let slug = path
        .file_stem()
        .and_then(|value| value.to_str())
        .context("post file has no utf-8 stem")?
        .to_string();
    let year = frontmatter
        .date
        .get(..4)
        .unwrap_or_default()
        .parse()
        .unwrap_or_default();
    Ok(Post {
        slug,
        date: frontmatter.date.clone(),
        metadata_dependency: format!("meta:{dependency}"),
        dependency: dependency.to_string(),
        collection,
        year,
        title: frontmatter.title,
        categories: frontmatter.categories,
        content_hash: sha256(content.as_bytes()),
        frontmatter_hash: sha256(frontmatter_raw.as_bytes()),
        body_hash: sha256(body.as_bytes()),
        body: body.to_string(),
    })
}

fn detail_dependency(route: &Route) -> Option<(Collection, String)> {
    let collection = if route.path.starts_with("/blog/")
        && !route.path.starts_with("/blog/page/")
        && !route.path.starts_with("/blog/for/")
    {
        Collection::Blog
    } else if route.path.starts_with("/philosophy/")
        && !route.path.starts_with("/philosophy/page/")
        && !route.path.starts_with("/philosophy/for/")
    {
        Collection::Philosophy
    } else {
        return None;
    };
    route
        .dependencies
        .iter()
        .find(|dependency| {
            dependency.starts_with(match collection {
                Collection::Blog => "src/_posts/",
                Collection::Philosophy => "src/_philosophy/",
            })
        })
        .cloned()
        .map(|dependency| (collection, dependency))
}

fn route_total_pages(routes: &[Route], collection: Collection) -> usize {
    let prefix = match collection {
        Collection::Blog => "/blog/page/",
        Collection::Philosophy => "/philosophy/page/",
    };
    routes
        .iter()
        .filter_map(|route| route.path.strip_prefix(prefix))
        .filter_map(|value| value.parse::<usize>().ok())
        .max()
        .unwrap_or(0)
}

fn shortcode_attrs(input: &str) -> BTreeMap<String, String> {
    let mut attrs = BTreeMap::new();
    let bytes = input.as_bytes();
    let mut index = 0;
    while index < bytes.len() {
        while index < bytes.len() && bytes[index].is_ascii_whitespace() {
            index += 1;
        }
        let key_start = index;
        while index < bytes.len()
            && (bytes[index].is_ascii_alphanumeric()
                || bytes[index] == b'_'
                || bytes[index] == b'-')
        {
            index += 1;
        }
        if key_start == index || index >= bytes.len() || bytes[index] != b'=' {
            index += 1;
            continue;
        }
        let key = &input[key_start..index];
        index += 1;
        if index >= bytes.len() || (bytes[index] != b'"' && bytes[index] != b'\'') {
            continue;
        }
        let quote = bytes[index];
        index += 1;
        let value_start = index;
        while index < bytes.len() && bytes[index] != quote {
            index += 1;
        }
        attrs.insert(key.to_string(), input[value_start..index].to_string());
        index += 1;
    }
    attrs
}

fn render_shortcode(name: &str, attrs: &BTreeMap<String, String>) -> Result<String> {
    match name {
        "YouTube" => {
            let id = attrs
                .get("youTubeId")
                .context("YouTube shortcode missing youTubeId")?;
            let title = attrs
                .get("title")
                .cloned()
                .unwrap_or_else(|| format!("YouTube video {id}"));
            Ok(format!(
                r#"<iframe style="width:100%;height:500px;border:0;border-radius:4px;overflow:hidden" src="https://www.youtube.com/embed/{}" title="{}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"><a href="https://www.youtube.com/watch?v={}">Watch {}</a></iframe>"#,
                escape_html(id),
                escape_html(&title),
                escape_html(id),
                escape_html(&title),
            ))
        }
        "CodeSandbox" => {
            let id = attrs
                .get("codeSandboxId")
                .context("CodeSandbox shortcode missing codeSandboxId")?;
            let title = attrs
                .get("title")
                .cloned()
                .unwrap_or_else(|| format!("CodeSandbox example {id}"));
            Ok(format!(
                r#"<iframe src="https://codesandbox.io/embed/{}" style="width:100%;height:500px;border:0;border-radius:4px;overflow:hidden" title="{}" loading="lazy" allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"><a href="https://codesandbox.io/s/{}">Open {}</a></iframe>"#,
                escape_html(id),
                escape_html(&title),
                escape_html(id),
                escape_html(&title),
            ))
        }
        "SoundCloud" => {
            let link = attrs
                .get("soundCloudLink")
                .context("SoundCloud shortcode missing soundCloudLink")?;
            let title = attrs
                .get("title")
                .cloned()
                .unwrap_or_else(|| format!("SoundCloud audio {link}"));
            let soundcloud = format!("https://api.soundcloud.com/{link}");
            let encoded = soundcloud.replace(':', "%3A").replace('/', "%2F");
            Ok(format!(
                r##"<iframe title="{}" width="100%" height="300" loading="lazy" src="https://w.soundcloud.com/player/?url={}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"><a href="{}">Listen to {}</a></iframe>"##,
                escape_html(&title),
                encoded,
                escape_html(&soundcloud),
                escape_html(&title),
            ))
        }
        "TocAzureContainerSeries" => Ok(r#"<div><h2>Azure Blog Posts: Docker Images &amp; Kubernetes</h2><ol><li><a href="/blog/azure-docker-container-repository">How to host Docker images on Microsoft Azure</a></li><li><a href="/blog/azure-docker-container-repository-github">How to use Kubernetes with Microsoft Azure and GitHub and how to debug if it does not workout</a></li><li><a href="/blog/azure-intro-kubernetes">An Introduction to Microsoft Azure and Kubernetes using Helm and Docker Images</a></li><li><a href="/blog/azure-kubernetes-public-access">How to Access your Web Application on Kubernetes Azure</a></li><li><a href="/blog/azure-kubernetes-pod-debug-crash">How to Debug a Kubernetes Pod that Crash at Startup (works on Microsoft Azure Kubernetes)?</a></li><li><a href="/blog/helmchart-introduction">How to use Helm Chart to configure dynamically your Kubernetes file for beginner?</a></li></ol></div>"#.to_string()),
        _ => bail!("unsupported MDX shortcode <{name}>"),
    }
}

fn preprocess_mdx_shortcodes(path: &str, body: &str) -> Result<String> {
    let mut output = String::new();
    let mut in_fence = false;
    for (line_index, line) in body.lines().enumerate() {
        let trimmed = line.trim_start();
        if trimmed.starts_with("```") || trimmed.starts_with("~~~") {
            in_fence = !in_fence;
            output.push_str(line);
            output.push('\n');
            continue;
        }
        if !in_fence {
            let tag_start = trimmed.find('<');
            if let Some(start) = tag_start {
                let after = &trimmed[start + 1..];
                let candidate_name = after
                    .chars()
                    .take_while(|ch| ch.is_ascii_alphanumeric() || *ch == '_')
                    .collect::<String>();
                let looks_like_component = candidate_name
                    .chars()
                    .next()
                    .map(|ch| ch.is_ascii_uppercase())
                    .unwrap_or(false)
                    && candidate_name.chars().any(|ch| ch.is_ascii_lowercase());
                let known_shortcode = matches!(
                    candidate_name.as_str(),
                    "YouTube" | "CodeSandbox" | "SoundCloud" | "TocAzureContainerSeries"
                );
                if known_shortcode || (looks_like_component && trimmed.starts_with('<')) {
                    let Some(end) = after.find('>') else {
                        bail!("{path}:{} unsupported MDX JSX", line_index + 1);
                    };
                    let tag = &after[..end];
                    let self_closing = tag.trim_end().ends_with('/');
                    if !self_closing {
                        bail!(
                            "{path}:{} unsupported non-self-closing MDX JSX",
                            line_index + 1
                        );
                    }
                    let tag = tag.trim_end_matches('/').trim();
                    let mut parts = tag.splitn(2, char::is_whitespace);
                    let name = parts.next().unwrap_or_default();
                    let attrs = shortcode_attrs(parts.next().unwrap_or_default());
                    output.push_str(&render_shortcode(name, &attrs).with_context(|| {
                        format!("{path}:{} failed to render shortcode", line_index + 1)
                    })?);
                    output.push('\n');
                    continue;
                }
            }
        }
        output.push_str(line);
        output.push('\n');
    }
    Ok(output)
}

fn render_markdown(path: &str, body: &str) -> Result<String> {
    let markdown = preprocess_mdx_shortcodes(path, body)?;
    let mut options = Options::empty();
    options.insert(Options::ENABLE_TABLES);
    options.insert(Options::ENABLE_FOOTNOTES);
    options.insert(Options::ENABLE_STRIKETHROUGH);
    options.insert(Options::ENABLE_TASKLISTS);
    let parser = Parser::new_ext(&markdown, options).map(|event| match event {
        Event::Start(Tag::CodeBlock(kind)) => {
            let language = match &kind {
                CodeBlockKind::Fenced(value) if !value.is_empty() => value
                    .split_whitespace()
                    .next()
                    .map(ToOwned::to_owned)
                    .unwrap_or_else(|| "plaintext".to_string()),
                _ => "plaintext".to_string(),
            };
            Event::Html(CowStr::from(format!(
                r#"<pre class="language-{0}"><code class="language-{0} code-highlight">"#,
                escape_html(&language)
            )))
        }
        Event::End(TagEnd::CodeBlock) => Event::Html(CowStr::from("</code></pre>")),
        other => other,
    });
    let mut output = String::new();
    html::push_html(&mut output, parser);
    Ok(output)
}

fn read_or_render_fragment(root: &Path, out_dir: &Path, post: &Post) -> Result<(String, String)> {
    let key = sha256(
        format!(
            "{}:{}:{}:{}",
            MARKDOWN_RENDERER_VERSION, SHORTCODE_RENDERER_VERSION, post.dependency, post.body_hash
        )
        .as_bytes(),
    );
    let fragment_path = out_dir
        .join(".site-cache/fragments")
        .join(format!("{key}.html"));
    if file_exists(&fragment_path) {
        return Ok((fs::read_to_string(fragment_path)?, key));
    }
    let html = render_markdown(&post.dependency, &post.body)?;
    if let Some(parent) = fragment_path.parent() {
        fs::create_dir_all(parent)?;
    }
    fs::write(&fragment_path, &html)?;
    let _ = root;
    Ok((html, key))
}

fn render_categories(root: &Path, categories: &[String]) -> Result<String> {
    let container = class(
        root,
        "src/app/blog/_components/BlogCategories.module.css",
        "container",
    )?;
    let item = class(
        root,
        "src/app/blog/_components/BlogCategories.module.css",
        "item",
    )?;
    let mut html = format!(r#"<span class="{container}">"#);
    for category in categories {
        html.push_str(&format!(
            r#"<span class="{item}">{}</span>"#,
            escape_html(category)
        ));
    }
    html.push_str("</span>");
    Ok(html)
}

fn render_entry(root: &Path, post: &Post) -> Result<String> {
    let module = match post.collection {
        Collection::Blog => "src/app/blog/_components/BlogEntry.module.css",
        Collection::Philosophy => "src/app/philosophy/_components/PhilosophyEntry.module.css",
    };
    let entry = class(root, module, "blogEntry")?;
    let title = class(root, module, "blogEntryArticleTitle")?;
    let details = class(root, module, "blogEntryDetails")?;
    let date = class(root, module, "blogEntryDate")?;
    Ok(format!(
        r#"<article class="{entry}"><h2 class="{title}"><a href="/{}/{}">{}</a></h2><div class="{details}"><span class="{date}">Posted: {}</span>{}</div></article>"#,
        post.collection.route_prefix(),
        escape_html(&post.slug),
        escape_html(&post.title),
        escape_html(&post.date),
        render_categories(root, &post.categories)?,
    ))
}

struct BodyOptions<'a> {
    collection: Collection,
    top_title: &'a str,
    current_page: Option<usize>,
    year: Option<i32>,
    total_pages: Option<usize>,
    total_posts: Option<usize>,
}

fn content_body(root: &Path, options: BodyOptions<'_>, children: &str) -> Result<String> {
    let (layout_module, body_module, shell_class, site_title, subtitle) = match options.collection {
        Collection::Blog => (
            "src/app/blog/layout.module.css",
            "src/app/blog/_components/BlogBody.module.css",
            "blogbodystyle",
            "Patrick Desjardins Blog",
            None,
        ),
        Collection::Philosophy => (
            "src/app/philosophy/layout.module.css",
            "src/app/philosophy/_components/PhilosophyBlogBody.module.css",
            "philosophyRoot",
            "Philosophy",
            Some("Patrick Desjardins — essays and notes"),
        ),
    };
    let wrapper = class(root, layout_module, shell_class)?;
    let body = class(
        root,
        body_module,
        match options.collection {
            Collection::Blog => "BlogBody",
            Collection::Philosophy => "blogBodyShell",
        },
    )?;
    let site_title_class = class(root, body_module, "siteTitle")?;
    let nav_links = class(root, body_module, "navLinks")?;
    let nav_item = class(root, body_module, "navLinkItem")?;
    let nav_text = class(root, body_module, "navLinkText")?;
    let current = class(root, body_module, "currentLink")?;
    let main = class(root, body_module, "main")?;
    let heading = class(root, body_module, "heading")?;
    let mut nav = String::new();
    let last_year = current_year_utc()?;
    match options.collection {
        Collection::Blog => {
            for (href, text) in [
                ("/", "Main Page"),
                ("/blog", "Blog"),
                ("/blog/search", "Search"),
                ("/philosophy", "Philosophy"),
            ] {
                nav.push_str(&format!(
                    r#"<li class="{nav_item}"><a class="{nav_text}" href="{href}">{text}</a></li>"#
                ));
            }
            for year in (FIRST_YEAR..=last_year).rev() {
                let extra = if Some(year) == options.year {
                    format!(" {current}")
                } else {
                    String::new()
                };
                nav.push_str(&format!(
                    r#"<li class="{nav_item}"><a class="{nav_text}{extra}" href="/blog/for/{year}">{year}</a></li>"#
                ));
            }
        }
        Collection::Philosophy => {
            for (href, text) in [
                ("/", "Main Page"),
                ("/blog", "Technical Blog"),
                ("/philosophy", "Philosophy"),
                ("/philosophy/search", "Search"),
            ] {
                nav.push_str(&format!(
                    r#"<li class="{nav_item}"><a class="{nav_text}" href="{href}">{text}</a></li>"#
                ));
            }
            for year in (PHILOSOPHY_FIRST_YEAR..=last_year).rev() {
                let extra = if Some(year) == options.year {
                    format!(" {current}")
                } else {
                    String::new()
                };
                nav.push_str(&format!(
                    r#"<li class="{nav_item}"><a class="{nav_text}{extra}" href="/philosophy/for/{year}">{year}</a></li>"#
                ));
            }
        }
    }
    let mut header_extra = String::new();
    if let Some(subtitle) = subtitle {
        let subtitle_class = class(root, body_module, "siteSubtitle")?;
        let paper_edge = class(root, body_module, "paperEdge")?;
        header_extra.push_str(&format!(
            r#"<p class="{subtitle_class}">{}</p><div class="{paper_edge}">"#,
            escape_html(subtitle)
        ));
        header_extra.push_str(&format!(
            r#"<nav aria-label="Philosophy"><ul class="{nav_links}">{nav}</ul></nav></div>"#
        ));
    } else {
        let picture_container = class(root, body_module, "blogPictureContainer")?;
        let picture = class(root, body_module, "blogTopPicture")?;
        header_extra.push_str(&format!(
            r#"<nav aria-label="Blog"><ul class="{nav_links}">{nav}</ul></nav><div class="{picture_container}"><img class="{picture}" alt="Patrick Desjardins picture from a conference" src="/images/backgrounds/patrickdesjardins_conference_bw.webp" width="800" height="260"></div>"#
        ));
    }
    let mut footer = String::new();
    if options.total_pages.unwrap_or(0) > 0 || options.total_posts.is_some() {
        footer.push_str("<footer>");
        if let Some(total_pages) = options.total_pages.filter(|value| *value > 0) {
            let bar = class(root, body_module, "paginationBar")?;
            let title = class(root, body_module, "paginationTitle")?;
            let links = class(root, body_module, "paginationLinks")?;
            let label = if options.collection == Collection::Blog {
                "Chronological Blog Articles by Page"
            } else {
                "Essays by page"
            };
            footer.push_str(&format!(
                r#"<div class="{bar}"><div class="{title}">{label}</div><div class="{links}">"#
            ));
            for page in 1..=total_pages {
                let active = if Some(page) == options.current_page {
                    format!(r#" class="{current}""#)
                } else {
                    String::new()
                };
                footer.push_str(&format!(
                    r#"<a{active} href="/{}/page/{page}">{page}</a>"#,
                    options.collection.route_prefix()
                ));
            }
            footer.push_str("</div></div>");
        }
        if let Some(total_posts) = options.total_posts {
            let total_class = class(
                root,
                body_module,
                if options.collection == Collection::Blog {
                    "totalBlogPost"
                } else {
                    "totalPosts"
                },
            )?;
            let label = if options.collection == Collection::Blog {
                "Total Blog Posts"
            } else {
                "Total essays"
            };
            footer.push_str(&format!(
                r#"<div class="{total_class}">{label}: {total_posts}</div>"#
            ));
        }
        footer.push_str("</footer>");
    }
    Ok(format!(
        r#"<div class="{wrapper}"><div class="{body}"><header><h1 class="{site_title_class}">{}</h1>{header_extra}</header><main class="{main}"><h2 class="{heading}">{}</h2>{children}</main>{footer}</div></div>"#,
        escape_html(site_title),
        escape_html(options.top_title),
    ))
}

fn render_content_route(
    root: &Path,
    out_dir: &Path,
    assets: &Assets,
    route: &Route,
    blog_posts: &[Post],
    philosophy_posts: &[Post],
    content_manifest: &mut BTreeMap<String, ContentCacheEntry>,
) -> Result<bool> {
    let (collection, posts) = if route.path.starts_with("/blog") {
        (Collection::Blog, blog_posts)
    } else if route.path.starts_with("/philosophy") {
        (Collection::Philosophy, philosophy_posts)
    } else {
        return Ok(false);
    };
    let total_pages = if collection == Collection::Philosophy {
        total_pages(posts).max(1)
    } else {
        total_pages(posts)
    };
    let prefix = format!("/{}", collection.route_prefix());
    let mut title = match collection {
        Collection::Blog => "Patrick Desjardins Blog".to_string(),
        Collection::Philosophy => "Philosophy — Patrick Desjardins".to_string(),
    };
    let mut description = title.clone();
    let children;
    let body_options;
    if route.path == prefix {
        let page_posts = posts
            .iter()
            .take(MAX_POSTS_PER_PAGE)
            .map(|post| render_entry(root, post))
            .collect::<Result<String>>()?;
        children = page_posts;
        body_options = BodyOptions {
            collection,
            top_title: if collection == Collection::Blog {
                "Blog Posts"
            } else {
                "Essays"
            },
            current_page: Some(1),
            year: None,
            total_pages: Some(total_pages),
            total_posts: Some(posts.len()),
        };
    } else if route.path == format!("{prefix}/search") {
        children = format!(
            r#"<div id="{}-search-root"></div>"#,
            collection.route_prefix()
        );
        if collection == Collection::Blog {
            title = "Patrick Desjardins Blog Search".to_string();
            description = title.clone();
        } else {
            title = "Philosophy Search".to_string();
            description = "Search philosophy essays by Patrick Desjardins".to_string();
        }
        body_options = BodyOptions {
            collection,
            top_title: if collection == Collection::Blog {
                "Search Posts"
            } else {
                "Search essays"
            },
            current_page: None,
            year: None,
            total_pages: None,
            total_posts: None,
        };
    } else if let Some(page) = route
        .path
        .strip_prefix(&format!("{prefix}/page/"))
        .and_then(|value| value.parse::<usize>().ok())
    {
        let page_posts = posts
            .iter()
            .skip((page - 1) * MAX_POSTS_PER_PAGE)
            .take(MAX_POSTS_PER_PAGE)
            .map(|post| render_entry(root, post))
            .collect::<Result<String>>()?;
        children = page_posts;
        if collection == Collection::Blog {
            title = format!("Patrick Desjardins Blog - Page number {page}");
            description = title.clone();
        } else {
            title = format!("Philosophy — page {page}");
            description = format!("Philosophy essays by Patrick Desjardins — page {page}");
        }
        body_options = BodyOptions {
            collection,
            top_title: if collection == Collection::Blog {
                "Blog Posts"
            } else {
                "Essays"
            },
            current_page: Some(page),
            year: None,
            total_pages: Some(total_pages),
            total_posts: None,
        };
    } else if let Some(year) = route
        .path
        .strip_prefix(&format!("{prefix}/for/"))
        .and_then(|value| value.parse::<i32>().ok())
    {
        children = posts
            .iter()
            .filter(|post| post.year == year)
            .map(|post| render_entry(root, post))
            .collect::<Result<String>>()?;
        if collection == Collection::Blog {
            title = format!("Patrick Desjardins Blog - Year {year}");
            description = title.clone();
        } else {
            title = format!("Philosophy — {year}");
            description = format!("Philosophy essays from {year} — Patrick Desjardins");
        }
        body_options = BodyOptions {
            collection,
            top_title: if collection == Collection::Blog {
                "Blog Posts"
            } else {
                "Essays"
            },
            current_page: None,
            year: Some(year),
            total_pages: Some(total_pages),
            total_posts: None,
        };
    } else if let Some(slug) = route.path.strip_prefix(&format!("{prefix}/")) {
        let Some(post) = posts.iter().find(|post| post.slug == slug) else {
            return Ok(false);
        };
        let (fragment, fragment_hash) = read_or_render_fragment(root, out_dir, post)?;
        let module = match collection {
            Collection::Blog => "src/app/blog/[slug]/Page.module.css",
            Collection::Philosophy => "src/app/philosophy/[slug]/Page.module.css",
        };
        let container = class(root, module, "blogPostContainer")?;
        let date = class(root, module, "blogPostDate")?;
        let content = if collection == Collection::Philosophy {
            let content_class = class(root, module, "blogPostContent")?;
            format!(r#"<div class="{content_class}">{fragment}</div>"#)
        } else {
            fragment
        };
        children = format!(
            r#"<div class="{container}"><p class="{date}">Posted on: {}</p>{content}</div>"#,
            escape_html(&post.date)
        );
        title = if collection == Collection::Blog {
            format!("Patrick Desjardins Blog - {}", post.title)
        } else {
            format!("Philosophy — {}", post.title)
        };
        description = post.title.clone();
        content_manifest.insert(
            post.dependency.clone(),
            ContentCacheEntry {
                collection: post.collection.route_prefix().to_string(),
                slug: post.slug.clone(),
                route_path: route.path.clone(),
                output_path: route.output_path.clone(),
                content_hash: post.content_hash.clone(),
                frontmatter_hash: post.frontmatter_hash.clone(),
                body_hash: post.body_hash.clone(),
                fragment_hash,
            },
        );
        body_options = BodyOptions {
            collection,
            top_title: &post.title,
            current_page: None,
            year: None,
            total_pages: Some(total_pages),
            total_posts: None,
        };
    } else {
        return Ok(false);
    };
    let body = content_body(root, body_options, &children)?;
    let document = page_document(
        root,
        &title,
        &description,
        assets,
        &body,
        Some(&rss_head_link(collection)),
    )?;
    let output_path = out_dir.join(&route.output_path);
    if let Some(parent) = output_path.parent() {
        fs::create_dir_all(parent)?;
    }
    fs::write(output_path, document)?;
    Ok(true)
}

fn render_sitemap(out_dir: &Path, blog_posts: &[Post], philosophy_posts: &[Post]) -> Result<()> {
    let today = today_utc()?;
    let today_iso = format!("{today}T00:00:00.000Z");
    let mut urls = vec![
        format!(
            r#"<url><loc>{BASE_URL}</loc><lastmod>{today_iso}</lastmod><changefreq>daily</changefreq><priority>1</priority></url>"#
        ),
        format!(
            r#"<url><loc>{BASE_URL}/blog</loc><lastmod>{today_iso}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>"#
        ),
        format!(
            r#"<url><loc>{BASE_URL}/philosophy</loc><lastmod>{today_iso}</lastmod><changefreq>weekly</changefreq><priority>0.85</priority></url>"#
        ),
        format!(
            r#"<url><loc>{BASE_URL}/philosophy/search</loc><lastmod>{today_iso}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>"#
        ),
    ];
    for post in blog_posts {
        urls.push(format!(
            r#"<url><loc>{BASE_URL}/blog/{}</loc><lastmod>{}T00:00:00.000Z</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>"#,
            escape_html(&post.slug),
            escape_html(post.date.get(..10).unwrap_or(&post.date)),
        ));
    }
    for post in philosophy_posts {
        urls.push(format!(
            r#"<url><loc>{BASE_URL}/philosophy/{}</loc><lastmod>{}T00:00:00.000Z</lastmod><changefreq>monthly</changefreq><priority>0.65</priority></url>"#,
            escape_html(&post.slug),
            escape_html(post.date.get(..10).unwrap_or(&post.date)),
        ));
    }
    fs::write(
        out_dir.join("sitemap.xml"),
        format!(
            r#"<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{}</urlset>"#,
            urls.join("")
        ),
    )?;
    Ok(())
}

fn render_robots(out_dir: &Path) -> Result<()> {
    fs::write(
        out_dir.join("robots.txt"),
        format!("User-agent: *\nAllow: /\nSitemap: {BASE_URL}/sitemap.xml"),
    )?;
    Ok(())
}

fn render_detail_route(
    root: &Path,
    out_dir: &Path,
    assets: &Assets,
    all_routes: &[Route],
    route: &Route,
    collection: Collection,
    dependency: &str,
) -> Result<(String, ContentCacheEntry)> {
    let post = post_from_dependency(root, dependency, collection)?;
    let total_pages = route_total_pages(all_routes, collection);
    let (fragment, fragment_hash) = read_or_render_fragment(root, out_dir, &post)?;
    let module = match collection {
        Collection::Blog => "src/app/blog/[slug]/Page.module.css",
        Collection::Philosophy => "src/app/philosophy/[slug]/Page.module.css",
    };
    let container = class(root, module, "blogPostContainer")?;
    let date = class(root, module, "blogPostDate")?;
    let content = if collection == Collection::Philosophy {
        let content_class = class(root, module, "blogPostContent")?;
        format!(r#"<div class="{content_class}">{fragment}</div>"#)
    } else {
        fragment
    };
    let children = format!(
        r#"<div class="{container}"><p class="{date}">Posted on: {}</p>{content}</div>"#,
        escape_html(&post.date)
    );
    let title = if collection == Collection::Blog {
        format!("Patrick Desjardins Blog - {}", post.title)
    } else {
        format!("Philosophy — {}", post.title)
    };
    let body = content_body(
        root,
        BodyOptions {
            collection,
            top_title: &post.title,
            current_page: None,
            year: None,
            total_pages: Some(total_pages),
            total_posts: None,
        },
        &children,
    )?;
    let document = page_document(
        root,
        &title,
        &post.title,
        assets,
        &body,
        Some(&rss_head_link(collection)),
    )?;
    let output_path = out_dir.join(&route.output_path);
    if let Some(parent) = output_path.parent() {
        fs::create_dir_all(parent)?;
    }
    fs::write(output_path, document)?;
    Ok((
        post.dependency.clone(),
        ContentCacheEntry {
            collection: post.collection.route_prefix().to_string(),
            slug: post.slug.clone(),
            route_path: route.path.clone(),
            output_path: route.output_path.clone(),
            content_hash: post.content_hash.clone(),
            frontmatter_hash: post.frontmatter_hash.clone(),
            body_hash: post.body_hash.clone(),
            fragment_hash,
        },
    ))
}

fn render_routes_native_first(
    root: &Path,
    out_dir: &Path,
    assets: &Assets,
    all_routes: &[Route],
    routes: &[Route],
) -> Result<BTreeMap<String, ContentCacheEntry>> {
    let mut fallback = Vec::new();
    let mut content_manifest = BTreeMap::new();
    let detail_only = routes
        .iter()
        .all(|route| detail_dependency(route).is_some());
    if detail_only {
        let rendered = routes
            .par_iter()
            .map(|route| {
                let Some((collection, dependency)) = detail_dependency(route) else {
                    bail!("expected detail route: {}", route.path);
                };
                render_detail_route(root, out_dir, assets, all_routes, route, collection, &dependency)
            })
            .collect::<Result<Vec<_>>>()?;
        for (dependency, entry) in rendered {
            content_manifest.insert(dependency, entry);
        }
        if !fallback.is_empty() {
            render_routes(root, out_dir, assets, &fallback)?;
        }
        return Ok(content_manifest);
    }

    let (blog_posts, philosophy_posts) = all_content_posts(root)?;
    let rendered = routes
        .par_iter()
        .map(|route| {
            let mut cache_entry = None;
            let handled = {
                let mut temp_manifest = BTreeMap::new();
                let ok = render_content_route(
                    root,
                    out_dir,
                    assets,
                    route,
                    &blog_posts,
                    &philosophy_posts,
                    &mut temp_manifest,
                )?;
                if ok {
                    cache_entry = temp_manifest.into_iter().next();
                }
                ok
            };
            Ok((handled, cache_entry, route.clone()))
        })
        .collect::<Result<Vec<_>>>()?;
    for (handled, cache_entry, route) in rendered {
        if let Some((dependency, entry)) = cache_entry {
            content_manifest.insert(dependency, entry);
        }
        if !handled {
            fallback.push(route);
        }
    }
    if !fallback.is_empty() {
        render_routes(root, out_dir, assets, &fallback)?;
    }
    render_sitemap(out_dir, &blog_posts, &philosophy_posts)?;
    render_robots(out_dir)?;
    render_rss_feeds(out_dir, &blog_posts, &philosophy_posts)?;
    Ok(content_manifest)
}

fn global_hashes(source_hashes: &BTreeMap<String, String>, assets: &Assets) -> GlobalHashes {
    let shared_layout_hash = source_hashes
        .iter()
        .filter(|(path, _)| {
            path.starts_with("src/app/")
                || path.starts_with("src/site/")
                || path.starts_with("src/lib/")
                || path.starts_with("src/_utils/")
                || path.starts_with("src/constants/")
        })
        .map(|(path, hash)| format!("{path}:{hash}\n"))
        .collect::<String>();
    GlobalHashes {
        assets_hash: sha256(serde_json::to_string(assets).unwrap_or_default().as_bytes()),
        shell_template_hash: sha256(SHELL_TEMPLATE_VERSION.as_bytes()),
        shortcode_renderer_hash: sha256(SHORTCODE_RENDERER_VERSION.as_bytes()),
        markdown_renderer_hash: sha256(MARKDOWN_RENDERER_VERSION.as_bytes()),
        shared_layout_hash: sha256(shared_layout_hash.as_bytes()),
    }
}

#[derive(Serialize)]
struct RenderRoute<'a> {
    path: &'a str,
    #[serde(rename = "outputFile")]
    output_file: String,
}

#[derive(Serialize)]
struct RenderPayload<'a> {
    assets: &'a Assets,
    routes: Vec<RenderRoute<'a>>,
    #[serde(rename = "sitemapFile")]
    sitemap_file: String,
    #[serde(rename = "robotsFile")]
    robots_file: String,
}

fn render_routes(root: &Path, out_dir: &Path, assets: &Assets, routes: &[Route]) -> Result<()> {
    let payload_path = env::temp_dir().join(format!("sitegen-render-{}.json", std::process::id()));
    let payload = RenderPayload {
        assets,
        routes: routes
            .iter()
            .map(|route| RenderRoute {
                path: &route.path,
                output_file: out_dir
                    .join(&route.output_path)
                    .to_string_lossy()
                    .to_string(),
            })
            .collect(),
        sitemap_file: out_dir.join("sitemap.xml").to_string_lossy().to_string(),
        robots_file: out_dir.join("robots.txt").to_string_lossy().to_string(),
    };
    fs::write(&payload_path, serde_json::to_vec(&payload)?)?;
    let result = run_command(
        root,
        "node",
        &[
            "scripts/render-site.mjs",
            "render",
            payload_path.to_string_lossy().as_ref(),
        ],
    );
    let _ = fs::remove_file(payload_path);
    result
}

fn stale_reasons(
    routes: &[Route],
    previous: Option<&Manifest>,
    source_hashes: &BTreeMap<String, String>,
    out_dir: &Path,
) -> Result<Vec<String>> {
    let mut reasons = Vec::new();
    let Some(previous) = previous else {
        return Ok(vec!["missing out/.site-manifest.json".to_string()]);
    };
    if previous.schema_version != SCHEMA_VERSION {
        reasons.push("site manifest schema changed".to_string());
    }
    for (file, hash) in source_hashes {
        if previous.source_hashes.get(file) != Some(hash) {
            reasons.push(format!("source changed: {file}"));
        }
    }
    for file in previous.source_hashes.keys() {
        if !source_hashes.contains_key(file) {
            reasons.push(format!("source removed: {file}"));
        }
    }
    if !reasons.is_empty() {
        return Ok(reasons);
    }

    let mut output_paths = routes
        .iter()
        .map(|route| route.output_path.clone())
        .collect::<BTreeSet<_>>();
    output_paths.extend([
        "sitemap.xml".into(),
        "robots.txt".into(),
        "blog/rss.xml".into(),
        "philosophy/rss.xml".into(),
        "_headers".into(),
    ]);
    output_paths.insert("server/render.js".into());
    for asset in asset_output_paths(&previous.assets) {
        output_paths.insert(asset);
    }

    for output_path in &output_paths {
        if !file_exists(&out_dir.join(output_path)) {
            reasons.push(format!("output missing: {output_path}"));
        }
    }
    for output_path in previous.output_hashes.keys() {
        if !output_paths.contains(output_path) && output_path.ends_with(".html") {
            reasons.push(format!("stale output tracked in manifest: {output_path}"));
        }
    }
    Ok(reasons)
}

fn changed_source_paths(
    previous: Option<&Manifest>,
    current: &BTreeMap<String, String>,
) -> BTreeSet<String> {
    let mut changed = BTreeSet::new();
    let Some(previous) = previous else {
        changed.extend(current.keys().cloned());
        return changed;
    };
    for (file, hash) in current {
        if previous.source_hashes.get(file) != Some(hash) {
            changed.insert(file.clone());
        }
    }
    for file in previous.source_hashes.keys() {
        if !current.contains_key(file) {
            changed.insert(file.clone());
        }
    }
    changed
}

fn dependency_matches_changed_path(dependency: &str, changed_path: &str) -> bool {
    if dependency.starts_with("meta:") {
        return dependency == changed_path;
    }
    dependency == changed_path || changed_path.starts_with(&format!("{dependency}/"))
}

fn route_impacted_by_changes(route: &Route, changed_paths: &BTreeSet<String>) -> bool {
    route.dependencies.iter().any(|dependency| {
        changed_paths
            .iter()
            .any(|changed_path| dependency_matches_changed_path(dependency, changed_path))
    })
}

fn should_rebuild_assets(
    previous: Option<&Manifest>,
    source_hashes: &BTreeMap<String, String>,
    out_dir: &Path,
) -> bool {
    let Some(previous) = previous else {
        return true;
    };
    if !file_exists(&out_dir.join(".vite/manifest.json"))
        || !file_exists(&out_dir.join("assets/static-modules.css"))
        || !file_exists(&out_dir.join("server/render.js"))
    {
        return true;
    }
    for asset in asset_output_paths(&previous.assets) {
        if !file_exists(&out_dir.join(asset)) {
            return true;
        }
    }
    changed_source_paths(Some(previous), source_hashes)
        .iter()
        .any(|path| {
            path.starts_with("src/site/")
                || path.starts_with("src/app/blog/search/")
                || path.starts_with("src/app/philosophy/search/")
                || (path.starts_with("src/app/") && path.ends_with(".css"))
                || path == "src/app/OutboundLinkTelemetry.tsx"
                || path == "src/app/WebVitals.tsx"
                || path == "vite.config.ts"
                || path == "package.json"
                || path.ends_with(".module.css")
        })
}

fn main() -> Result<()> {
    let mut timer = PhaseTimer::new();
    let root = env::current_dir()?;
    let out_dir = root.join("out");
    let manifest_path = out_dir.join(".site-manifest.json");
    let args = env::args().skip(1).collect::<BTreeSet<_>>();
    let force_full = args.contains("--full");
    let check_only = args.contains("--check");

    let previous = load_manifest(&manifest_path)?;
    timer.mark("load manifest");
    let mut planned_routes: Option<Vec<Route>> = None;
    let mut planned_source_hashes: Option<BTreeMap<String, String>> = None;
    if !force_full && !check_only {
        let routes = build_routes(&root)?;
        timer.mark("build routes");
        let mut source_hasher = SourceHasher::new(&root);
        let source_hashes = merge_hashes(&mut source_hasher, &routes)?;
        timer.mark("merge source hashes");
        if stale_reasons(&routes, previous.as_ref(), &source_hashes, &out_dir)?.is_empty() {
            timer.mark("stale reasons");
            println!(
                "Generated 0 stale route(s), {} total route(s).",
                routes.len()
            );
            return Ok(());
        }
        planned_routes = Some(routes);
        planned_source_hashes = Some(source_hashes);
    }

    if !check_only {
        if force_full {
            let _ = fs::remove_dir_all(&out_dir);
        } else if should_rebuild_assets(
            previous.as_ref(),
            planned_source_hashes
                .as_ref()
                .expect("planned source hashes exist"),
            &out_dir,
        ) {
            let _ = fs::remove_dir_all(out_dir.join("assets"));
            let _ = fs::remove_dir_all(out_dir.join(".vite"));
            let _ = fs::remove_dir_all(out_dir.join("server"));
        }
        if force_full
            || !file_exists(&out_dir.join(".vite/manifest.json"))
            || !file_exists(&out_dir.join("assets/static-modules.css"))
            || !file_exists(&out_dir.join("server/render.js"))
        {
            run_vite_builds(&root, &out_dir)?;
        }
    }
    timer.mark("asset phase");

    let assets = assets_from_vite_manifest(&out_dir)?;
    let routes = match planned_routes {
        Some(routes) => routes,
        None => build_routes(&root)?,
    };
    let mut source_hasher = SourceHasher::new(&root);
    let source_hashes = match planned_source_hashes {
        Some(source_hashes) => source_hashes,
        None => merge_hashes(&mut source_hasher, &routes)?,
    };
    timer.mark("routes and hashes ready");

    if check_only {
        let reasons = stale_reasons(&routes, previous.as_ref(), &source_hashes, &out_dir)?;
        if reasons.is_empty() {
            println!("Generated site is fresh.");
            return Ok(());
        }
        eprintln!("Generated site is stale:");
        for reason in reasons.iter().take(50) {
            eprintln!("- {reason}");
        }
        if reasons.len() > 50 {
            eprintln!("- ...and {} more", reasons.len() - 50);
        }
        std::process::exit(1);
    }

    fs::create_dir_all(&out_dir)?;
    let did_assets_change = previous
        .as_ref()
        .map(|manifest| manifest.assets != assets)
        .unwrap_or(true);
    let current_route_paths = routes
        .iter()
        .map(|route| route.output_path.clone())
        .collect::<BTreeSet<_>>();
    let previous_route_paths = previous
        .as_ref()
        .map(|manifest| {
            manifest
                .routes
                .values()
                .map(|route| route.output_path.clone())
                .collect::<BTreeSet<_>>()
        })
        .unwrap_or_default();
    let changed_paths = changed_source_paths(previous.as_ref(), &source_hashes);

    let mut stale_routes = Vec::new();
    for route in &routes {
        let output = out_dir.join(&route.output_path);
        let should_render = force_full
            || previous.is_none()
            || did_assets_change
            || !file_exists(&output)
            || route_impacted_by_changes(route, &changed_paths);
        if should_render {
            stale_routes.push(route.clone());
        }
    }
    timer.mark("select stale routes");

    for stale_path in previous_route_paths.difference(&current_route_paths) {
        let absolute = out_dir.join(stale_path);
        if file_exists(&absolute) {
            fs::remove_file(absolute)?;
        }
    }

    let mut content_manifest =
        render_routes_native_first(&root, &out_dir, &assets, &routes, &stale_routes)?;
    timer.mark("render routes");
    let headers = root.join("_headers");
    if file_exists(&headers) {
        fs::copy(headers, out_dir.join("_headers"))?;
    }

    let stale_route_outputs = stale_routes
        .iter()
        .map(|route| route.output_path.clone())
        .collect::<BTreeSet<_>>();
    let current_route_outputs = routes
        .iter()
        .map(|route| route.output_path.clone())
        .collect::<BTreeSet<_>>();
    let current_asset_outputs = asset_output_paths(&assets)
        .into_iter()
        .collect::<BTreeSet<_>>();
    let mut tracked_outputs = current_route_outputs.clone();
    tracked_outputs.extend(current_asset_outputs.iter().cloned());
    tracked_outputs.extend([
        "sitemap.xml".to_string(),
        "robots.txt".to_string(),
        "blog/rss.xml".to_string(),
        "philosophy/rss.xml".to_string(),
        "_headers".to_string(),
        "server/render.js".to_string(),
    ]);
    let mut output_hashes = previous
        .as_ref()
        .map(|manifest| manifest.output_hashes.clone())
        .unwrap_or_default();
    output_hashes.retain(|path, _| tracked_outputs.contains(path));
    for route in &routes {
        if (previous.is_none()
            || force_full
            || did_assets_change
            || stale_route_outputs.contains(&route.output_path)
            || !output_hashes.contains_key(&route.output_path))
            && let Some(hash) = output_hash(&out_dir, &route.output_path)?
        {
            output_hashes.insert(route.output_path.clone(), hash);
        }
    }
    for output_path in &current_asset_outputs {
        if (previous.is_none()
            || force_full
            || did_assets_change
            || !output_hashes.contains_key(output_path))
            && let Some(hash) = output_hash(&out_dir, output_path)?
        {
            output_hashes.insert(output_path.clone(), hash);
        }
    }
    let detail_only = stale_routes
        .iter()
        .all(|route| detail_dependency(route).is_some());
    for output_path in [
        "sitemap.xml",
        "robots.txt",
        "blog/rss.xml",
        "philosophy/rss.xml",
    ] {
        if (!detail_only || !output_hashes.contains_key(output_path))
            && let Some(hash) = output_hash(&out_dir, output_path)?
        {
            output_hashes.insert(output_path.to_string(), hash);
        }
    }
    for output_path in ["_headers", "server/render.js"] {
        if (force_full
            || did_assets_change
            || output_path == "_headers"
            || !output_hashes.contains_key(output_path))
            && let Some(hash) = output_hash(&out_dir, output_path)?
        {
            output_hashes.insert(output_path.to_string(), hash);
        }
    }
    timer.mark("output hashes");
    if let Some(previous) = previous.as_ref() {
        for (key, entry) in &previous.content {
            if !content_manifest.contains_key(key)
                && file_exists(&out_dir.join(&entry.output_path))
                && source_hashes.get(key) == Some(&entry.content_hash)
            {
                content_manifest.insert(key.clone(), entry.clone());
            }
        }
    }

    let mut routes_manifest = previous
        .as_ref()
        .map(|manifest| manifest.routes.clone())
        .unwrap_or_default();
    let current_route_paths_by_route = routes
        .iter()
        .map(|route| route.path.clone())
        .collect::<BTreeSet<_>>();
    routes_manifest.retain(|path, _| current_route_paths_by_route.contains(path));
    let stale_route_paths = stale_routes
        .iter()
        .map(|route| route.path.clone())
        .collect::<BTreeSet<_>>();
    for route in &routes {
        if previous.is_none()
            || force_full
            || did_assets_change
            || stale_route_paths.contains(&route.path)
            || !routes_manifest.contains_key(&route.path)
        {
            let dependencies = source_hasher
                .route_hashes(&route.dependencies)?
                .keys()
                .cloned()
                .collect::<Vec<_>>();
            routes_manifest.insert(
                route.path.clone(),
                ManifestRoute {
                    output_path: route.output_path.clone(),
                    dependencies,
                },
            );
        }
    }
    timer.mark("route manifest");

    let generated_at = String::from_utf8(
        Command::new("date")
            .args(["-u", "+%Y-%m-%dT%H:%M:%SZ"])
            .output()?
            .stdout,
    )?
    .trim()
    .to_string();
    let manifest = Manifest {
        schema_version: SCHEMA_VERSION,
        generated_at,
        global_hashes: global_hashes(&source_hashes, &assets),
        assets,
        source_hashes,
        output_hashes,
        routes: routes_manifest,
        content: content_manifest,
    };
    fs::write(manifest_path, serde_json::to_vec(&manifest)?)?;
    timer.mark("write manifest");
    println!(
        "Generated {} stale route(s), {} total route(s).",
        stale_routes.len(),
        routes.len()
    );
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn splits_frontmatter_and_body_hash_inputs() {
        let content =
            "---\ntitle: \"Hello\"\ndate: \"2026-01-01\"\ncategories:\n - \"rust\"\n---\nBody";
        let (frontmatter, body) = split_frontmatter_body(content);
        assert!(frontmatter.contains("title: \"Hello\""));
        assert_eq!(body, "Body");
        let parsed = parse_frontmatter(content);
        assert_eq!(parsed.title, "Hello");
        assert_eq!(parsed.date, "2026-01-01");
        assert_eq!(parsed.categories, vec!["rust"]);
    }

    #[test]
    fn renders_supported_shortcodes() {
        let youtube = render_markdown("post.mdx", r#"<YouTube youTubeId="abc123" />"#)
            .expect("youtube shortcode renders");
        assert!(youtube.contains("youtube.com/embed/abc123"));

        let sandbox = render_markdown("post.mdx", r#"<CodeSandbox codeSandboxId="demo" />"#)
            .expect("codesandbox shortcode renders");
        assert!(sandbox.contains("codesandbox.io/embed/demo"));
    }

    #[test]
    fn rejects_unknown_mdx_component_outside_code() {
        assert!(render_markdown("post.mdx", r#"<UnknownWidget value="1" />"#).is_err());
    }

    #[test]
    fn ignores_jsx_looking_text_inside_fenced_code() {
        let rendered = render_markdown("post.mdx", "```tsx\n<UnknownWidget value=\"1\" />\n```\n")
            .expect("fenced JSX should render as code");
        assert!(rendered.contains("&lt;UnknownWidget"));
    }

    #[test]
    fn plain_text_excerpt_skips_markdown_noise() {
        let body = "# Heading\n\n![](/images/example.png)\n\nFirst paragraph text.\n\nSecond paragraph.";
        assert_eq!(
            plain_text_excerpt(body, 300),
            "First paragraph text. Second paragraph."
        );
    }

    #[test]
    fn rss_head_link_points_at_collection_feed() {
        assert!(rss_head_link(Collection::Blog).contains("/blog/rss.xml"));
        assert!(rss_head_link(Collection::Philosophy).contains("/philosophy/rss.xml"));
    }

    #[test]
    fn detects_route_impact_for_body_and_frontmatter_changes() {
        let detail = Route {
            path: "/blog/example".to_string(),
            output_path: "blog/example.html".to_string(),
            dependencies: vec![
                "src/app".to_string(),
                "src/_posts/2026/example.mdx".to_string(),
            ],
        };
        let listing = Route {
            path: "/blog".to_string(),
            output_path: "blog.html".to_string(),
            dependencies: vec![
                "src/app".to_string(),
                "meta:src/_posts/2026/example.mdx".to_string(),
            ],
        };
        let mut body_change = BTreeSet::new();
        body_change.insert("src/_posts/2026/example.mdx".to_string());
        assert!(route_impacted_by_changes(&detail, &body_change));
        assert!(!route_impacted_by_changes(&listing, &body_change));

        let mut frontmatter_change = BTreeSet::new();
        frontmatter_change.insert("meta:src/_posts/2026/example.mdx".to_string());
        assert!(!route_impacted_by_changes(&detail, &frontmatter_change));
        assert!(route_impacted_by_changes(&listing, &frontmatter_change));
    }
}
