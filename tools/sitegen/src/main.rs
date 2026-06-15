use anyhow::{Context, Result, bail};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::collections::{BTreeMap, BTreeSet};
use std::env;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

const SCHEMA_VERSION: u32 = 1;
const FIRST_YEAR: i32 = 2011;
const PHILOSOPHY_FIRST_YEAR: i32 = 2026;
const MAX_POSTS_PER_PAGE: usize = 10;

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
}

#[derive(Deserialize)]
struct ViteEntry {
    file: String,
    #[serde(default)]
    css: Vec<String>,
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

fn route_source_changed(
    hasher: &mut SourceHasher<'_>,
    route: &Route,
    previous_source_hashes: &BTreeMap<String, String>,
) -> Result<bool> {
    let current = hasher.route_hashes(&route.dependencies)?;
    for (file, hash) in &current {
        if previous_source_hashes.get(file) != Some(hash) {
            return Ok(true);
        }
    }
    for file in previous_source_hashes.keys() {
        if route
            .dependencies
            .iter()
            .any(|dependency| file == dependency || file.starts_with(&format!("{dependency}/")))
            && !current.contains_key(file)
        {
            return Ok(true);
        }
    }
    Ok(false)
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

fn parse_frontmatter_date(content: &str) -> String {
    let raw = frontmatter_raw(content);
    raw.lines()
        .find_map(|line| {
            let (key, value) = line.split_once(':')?;
            (key.trim() == "date").then(|| value.trim().trim_matches(['"', '\'']).to_string())
        })
        .unwrap_or_default()
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

fn collection_posts(
    root: &Path,
    collection: &str,
    first_year: i32,
    last_year: i32,
) -> Result<Vec<Post>> {
    let today = today_utc()?;
    let mut posts = Vec::new();
    for year in first_year..=last_year {
        let dir = root.join(collection).join(year.to_string());
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
            let date = parse_frontmatter_date(&content);
            if date.get(..10).unwrap_or(&date) > today.as_str() {
                continue;
            }
            let file_stem = path
                .file_stem()
                .and_then(|value| value.to_str())
                .context("post file has no utf-8 stem")?
                .to_string();
            posts.push(Post {
                slug: file_stem,
                date,
                dependency: relative(root, &path)?,
                metadata_dependency: format!("meta:{}", relative(root, &path)?),
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
    let blog_posts = collection_posts(root, "src/_posts", FIRST_YEAR, last_year)?;
    let philosophy_posts =
        collection_posts(root, "src/_philosophy", PHILOSOPHY_FIRST_YEAR, last_year)?;
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

fn trim_ssr_output(out_dir: &Path) {
    for path in [".vite", "images", "videos", "output", "philosophy-output"] {
        let _ = fs::remove_dir_all(out_dir.join("server").join(path));
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

    let mut output_paths = routes
        .iter()
        .map(|route| route.output_path.clone())
        .collect::<BTreeSet<_>>();
    output_paths.extend(["sitemap.xml".into(), "robots.txt".into(), "_headers".into()]);
    output_paths.insert("server/render.js".into());
    for asset in asset_output_paths(&previous.assets) {
        output_paths.insert(asset);
    }

    for output_path in &output_paths {
        match output_hash(out_dir, output_path)? {
            None => reasons.push(format!("output missing: {output_path}")),
            Some(hash) if previous.output_hashes.get(output_path) != Some(&hash) => {
                reasons.push(format!("output changed: {output_path}"));
            }
            Some(_) => {}
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
                || path == "vite.config.ts"
                || path == "package.json"
                || path.ends_with(".module.css")
        })
}

fn main() -> Result<()> {
    let root = env::current_dir()?;
    let out_dir = root.join("out");
    let manifest_path = out_dir.join(".site-manifest.json");
    let args = env::args().skip(1).collect::<BTreeSet<_>>();
    let force_full = args.contains("--full");
    let check_only = args.contains("--check");

    let previous = load_manifest(&manifest_path)?;
    let mut planned_routes: Option<Vec<Route>> = None;
    let mut planned_source_hashes: Option<BTreeMap<String, String>> = None;
    if !force_full && !check_only {
        let routes = build_routes(&root)?;
        let mut source_hasher = SourceHasher::new(&root);
        let source_hashes = merge_hashes(&mut source_hasher, &routes)?;
        if stale_reasons(&routes, previous.as_ref(), &source_hashes, &out_dir)?.is_empty() {
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
            run_command(
                &root,
                "node_modules/.bin/vite",
                &["build", "--mode", "production"],
            )?;
            run_command(
                &root,
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
            )?;
            trim_ssr_output(&out_dir);
            write_static_module_css(&root, &out_dir)?;
        }
    }

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
    let previous_hashes = previous
        .as_ref()
        .map(|manifest| manifest.source_hashes.clone())
        .unwrap_or_default();

    let mut stale_routes = Vec::new();
    for route in &routes {
        let output = out_dir.join(&route.output_path);
        let should_render = force_full
            || previous.is_none()
            || did_assets_change
            || !file_exists(&output)
            || route_source_changed(&mut source_hasher, route, &previous_hashes)?;
        if should_render {
            stale_routes.push(route.clone());
        }
    }

    for stale_path in previous_route_paths.difference(&current_route_paths) {
        let absolute = out_dir.join(stale_path);
        if file_exists(&absolute) {
            fs::remove_file(absolute)?;
        }
    }

    render_routes(&root, &out_dir, &assets, &stale_routes)?;
    let headers = root.join("_headers");
    if file_exists(&headers) {
        fs::copy(headers, out_dir.join("_headers"))?;
    }

    let mut output_hashes = BTreeMap::new();
    for route in &routes {
        if let Some(hash) = output_hash(&out_dir, &route.output_path)? {
            output_hashes.insert(route.output_path.clone(), hash);
        }
    }
    for output_path in asset_output_paths(&assets) {
        if let Some(hash) = output_hash(&out_dir, &output_path)? {
            output_hashes.insert(output_path, hash);
        }
    }
    for output_path in ["sitemap.xml", "robots.txt", "_headers"] {
        if let Some(hash) = output_hash(&out_dir, output_path)? {
            output_hashes.insert(output_path.to_string(), hash);
        }
    }
    if let Some(hash) = output_hash(&out_dir, "server/render.js")? {
        output_hashes.insert("server/render.js".to_string(), hash);
    }

    let routes_manifest = routes
        .iter()
        .map(|route| {
            let dependencies = source_hasher
                .route_hashes(&route.dependencies)?
                .keys()
                .cloned()
                .collect::<Vec<_>>();
            Ok((
                route.path.clone(),
                ManifestRoute {
                    output_path: route.output_path.clone(),
                    dependencies,
                },
            ))
        })
        .collect::<Result<BTreeMap<_, _>>>()?;

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
        assets,
        source_hashes,
        output_hashes,
        routes: routes_manifest,
    };
    fs::write(
        manifest_path,
        format!("{}\n", serde_json::to_string_pretty(&manifest)?),
    )?;
    println!(
        "Generated {} stale route(s), {} total route(s).",
        stale_routes.len(),
        routes.len()
    );
    Ok(())
}
