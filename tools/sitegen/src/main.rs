use anyhow::{Context, Result, anyhow, bail};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::collections::{BTreeMap, BTreeSet};
use std::env;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

const SCHEMA_VERSION: u32 = 1;

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
        for file in walk_files(root, dependency)? {
            hashes.insert(relative(root, &file)?, hash_file(&file)?);
        }
    }
    Ok(hashes)
}

fn merge_hashes(root: &Path, routes: &[Route]) -> Result<BTreeMap<String, String>> {
    let mut hashes = BTreeMap::new();
    for route in routes {
        hashes.extend(source_hashes_for(root, &route.dependencies)?);
    }
    Ok(hashes)
}

fn route_source_changed(
    root: &Path,
    route: &Route,
    previous_source_hashes: &BTreeMap<String, String>,
) -> Result<bool> {
    let current = source_hashes_for(root, &route.dependencies)?;
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

fn route_metadata(root: &Path, assets: &Assets) -> Result<Vec<Route>> {
    let output = Command::new("node")
        .args([
            "scripts/render-site.mjs",
            "routes",
            &serde_json::to_string(assets)?,
        ])
        .current_dir(root)
        .env(
            "NODE_ENV",
            env::var("NODE_ENV").unwrap_or_else(|_| "production".to_string()),
        )
        .output()
        .context("load route metadata from React renderer")?;
    if !output.status.success() {
        return Err(anyhow!(
            "route metadata failed:\n{}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }
    Ok(serde_json::from_slice(&output.stdout)?)
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

fn main() -> Result<()> {
    let root = env::current_dir()?;
    let out_dir = root.join("out");
    let manifest_path = out_dir.join(".site-manifest.json");
    let args = env::args().skip(1).collect::<BTreeSet<_>>();
    let force_full = args.contains("--full");
    let check_only = args.contains("--check");

    let previous = load_manifest(&manifest_path)?;
    if !check_only {
        if force_full {
            let _ = fs::remove_dir_all(&out_dir);
        } else {
            let _ = fs::remove_dir_all(out_dir.join("assets"));
            let _ = fs::remove_dir_all(out_dir.join(".vite"));
        }
        run_command(
            &root,
            "node_modules/.bin/vite",
            &["build", "--mode", "production"],
        )?;
        write_static_module_css(&root, &out_dir)?;
    }

    let assets = assets_from_vite_manifest(&out_dir)?;
    let routes = route_metadata(&root, &assets)?;
    let source_hashes = merge_hashes(&root, &routes)?;

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
            || route_source_changed(&root, route, &previous_hashes)?;
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

    let routes_manifest = routes
        .iter()
        .map(|route| {
            let dependencies = source_hashes_for(&root, &route.dependencies)?
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
