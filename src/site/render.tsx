import { renderToStaticMarkup } from "react-dom/server";
import RootLayout, { metadata as rootMetadata } from "../app/layout";
import BlogLayout from "../app/blog/layout";
import HomePage, { metadata as homeMetadata } from "../app/page";
import BlogPage, { metadata as blogMetadata } from "../app/blog/page";
import BlogSearchPage from "../app/blog/search/page";
import BlogPostPage, {
  generateMetadata as generateBlogPostMetadata,
} from "../app/blog/[slug]/page";
import BlogYearPage, {
  generateMetadata as generateBlogYearMetadata,
} from "../app/blog/for/[year]/page";
import BlogPaginationPage, {
  generateMetadata as generateBlogPaginationMetadata,
} from "../app/blog/page/[pageNumber]/page";
import PhilosophyPage, {
  metadata as philosophyMetadata,
} from "../app/philosophy/page";
import PhilosophyLayout from "../app/philosophy/layout";
import PhilosophySearchPage from "../app/philosophy/search/page";
import PhilosophyPostPage, {
  generateMetadata as generatePhilosophyPostMetadata,
} from "../app/philosophy/[slug]/page";
import PhilosophyYearPage, {
  generateMetadata as generatePhilosophyYearMetadata,
} from "../app/philosophy/for/[year]/page";
import PhilosophyPaginationPage, {
  generateMetadata as generatePhilosophyPaginationMetadata,
} from "../app/philosophy/page/[pageNumber]/page";
import NotFoundPage from "../app/not-found";
import robots from "../app/robots";
import sitemap from "../app/sitemap";
import {
  FIRST_YEAR,
  LAST_YEAR,
  MAX_POSTS_PER_PAGE,
  PHILOSOPHY_FIRST_YEAR,
} from "../constants/constants";
import {
  getAllPhilosophyPosts,
  getAllPosts,
  getTotalPages,
  type MdxData,
} from "../lib/api";
import { sortByMetadataDateDesc } from "../_utils/list";
import { type Metadata } from "./next";

export interface AssetLinks {
  css: string[];
  js: string[];
}

export interface SiteRoute {
  path: string;
  outputPath: string;
  dependencies: string[];
  render: () => Promise<string>;
}

const BASE_URL = "https://patrickdesjardins.com";

function withBlogLayout(children: React.ReactNode): React.ReactElement {
  return <BlogLayout>{children}</BlogLayout>;
}

function withPhilosophyLayout(children: React.ReactNode): React.ReactElement {
  return <PhilosophyLayout>{children}</PhilosophyLayout>;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pageTitle(metadata: Metadata | undefined): string {
  const title = metadata?.title;
  return typeof title === "string" && title.length > 0
    ? title
    : String(rootMetadata.title ?? "Patrick Desjardins");
}

function pageDescription(metadata: Metadata | undefined): string {
  const description = metadata?.description;
  return typeof description === "string" && description.length > 0
    ? description
    : String(rootMetadata.description ?? "");
}

function gaScript(): string {
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (
    process.env.NODE_ENV !== "production" ||
    gaMeasurementId === undefined ||
    gaMeasurementId.length === 0
  ) {
    return "";
  }

  const id = escapeHtml(gaMeasurementId);
  return `<script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag("js",new Date());gtag("config","${id}");</script>`;
}

function renderDocument(
  body: React.ReactNode,
  metadata: Metadata | undefined,
  assets: AssetLinks,
): string {
  const app = renderToStaticMarkup(<RootLayout>{body}</RootLayout>);
  const css = assets.css
    .map((href) => `<link rel="stylesheet" href="${escapeHtml(href)}">`)
    .join("");
  const js = assets.js
    .map((src) => `<script type="module" src="${escapeHtml(src)}"></script>`)
    .join("");
  const head = [
    `<meta charset="utf-8">`,
    `<meta name="viewport" content="width=device-width, initial-scale=1">`,
    `<title>${escapeHtml(pageTitle(metadata))}</title>`,
    `<meta name="description" content="${escapeHtml(pageDescription(metadata))}">`,
    css,
    gaScript(),
  ].join("");

  const withHead = app.replace(/(<html[^>]*>)/, `$1<head>${head}</head>`);
  return `<!doctype html>${withHead.replace("</body>", `${js}</body>`)}`;
}

function routeFilePath(routePath: string): string {
  if (routePath === "/") {
    return "index.html";
  }
  return `${routePath.replace(/^\//, "")}.html`;
}

function postDependency(post: MdxData): string {
  return post.metadata.fullPathWithFileName;
}

function collectionDependencies(posts: MdxData[]): string[] {
  return posts.map(postDependency);
}

function sharedDependencies(): string[] {
  return [
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
  ];
}

function props<TParams extends Record<string, string>>(
  params: TParams,
): {
  params: TParams;
  searchParams: Record<string, string | string[] | undefined>;
} {
  return { params: params, searchParams: {} };
}

const value =
  <TValue,>(input: TValue): (() => TValue) =>
  () =>
    input;

async function renderRouteDocument(
  renderPage: () => Promise<React.ReactNode> | React.ReactNode,
  metadata: () => Promise<Metadata | undefined> | Metadata | undefined,
  assets: AssetLinks,
): Promise<string> {
  return renderDocument(await renderPage(), await metadata(), assets);
}

export async function renderPath(
  routePath: string,
  assets: AssetLinks,
): Promise<string> {
  if (routePath === "/") {
    return await renderRouteDocument(() => <HomePage />, value(homeMetadata), assets);
  }
  if (routePath === "/blog") {
    return await renderRouteDocument(
      async () => withBlogLayout(await BlogPage()),
      value(blogMetadata),
      assets,
    );
  }
  if (routePath === "/blog/search") {
    return await renderRouteDocument(
      () => withBlogLayout(<BlogSearchPage />),
      value({
        title: "Patrick Desjardins Blog Search",
        description: "Patrick Desjardins Blog Search",
      }),
      assets,
    );
  }
  if (routePath === "/philosophy") {
    return await renderRouteDocument(
      async () => withPhilosophyLayout(await PhilosophyPage()),
      value(philosophyMetadata),
      assets,
    );
  }
  if (routePath === "/philosophy/search") {
    return await renderRouteDocument(
      () => withPhilosophyLayout(<PhilosophySearchPage />),
      value({
        title: "Philosophy Search",
        description: "Search philosophy essays by Patrick Desjardins",
      }),
      assets,
    );
  }
  if (routePath === "/404") {
    return await renderRouteDocument(
      () => <NotFoundPage />,
      value({
        title: "Page not found",
        description: "Page not found",
      }),
      assets,
    );
  }

  const blogPageMatch = /^\/blog\/page\/([^/]+)$/.exec(routePath);
  if (blogPageMatch !== null) {
    const pageProps = props({ pageNumber: blogPageMatch[1] });
    return await renderRouteDocument(
      async () => withBlogLayout(await BlogPaginationPage(pageProps)),
      async () => await generateBlogPaginationMetadata(pageProps),
      assets,
    );
  }

  const blogYearMatch = /^\/blog\/for\/([^/]+)$/.exec(routePath);
  if (blogYearMatch !== null) {
    const yearProps = props({ year: blogYearMatch[1] });
    return await renderRouteDocument(
      async () => withBlogLayout(await BlogYearPage(yearProps)),
      async () => await generateBlogYearMetadata(yearProps),
      assets,
    );
  }

  const blogPostMatch = /^\/blog\/([^/]+)$/.exec(routePath);
  if (blogPostMatch !== null) {
    const postProps = props({ slug: blogPostMatch[1] });
    return await renderRouteDocument(
      async () => withBlogLayout(await BlogPostPage(postProps)),
      async () => await generateBlogPostMetadata(postProps),
      assets,
    );
  }

  const philosophyPageMatch = /^\/philosophy\/page\/([^/]+)$/.exec(routePath);
  if (philosophyPageMatch !== null) {
    const pageProps = props({ pageNumber: philosophyPageMatch[1] });
    return await renderRouteDocument(
      async () => withPhilosophyLayout(await PhilosophyPaginationPage(pageProps)),
      async () => await generatePhilosophyPaginationMetadata(pageProps),
      assets,
    );
  }

  const philosophyYearMatch = /^\/philosophy\/for\/([^/]+)$/.exec(routePath);
  if (philosophyYearMatch !== null) {
    const yearProps = props({ year: philosophyYearMatch[1] });
    return await renderRouteDocument(
      async () => withPhilosophyLayout(await PhilosophyYearPage(yearProps)),
      async () => await generatePhilosophyYearMetadata(yearProps),
      assets,
    );
  }

  const philosophyPostMatch = /^\/philosophy\/([^/]+)$/.exec(routePath);
  if (philosophyPostMatch !== null) {
    const postProps = props({ slug: philosophyPostMatch[1] });
    return await renderRouteDocument(
      async () => withPhilosophyLayout(await PhilosophyPostPage(postProps)),
      async () => await generatePhilosophyPostMetadata(postProps),
      assets,
    );
  }

  throw new Error(`Unknown route path: ${routePath}`);
}

export async function buildRoutes(assets: AssetLinks): Promise<SiteRoute[]> {
  const [blogPosts, philosophyPosts] = await Promise.all([
    getAllPosts(),
    getAllPhilosophyPosts(),
  ]);
  const sortedBlogPosts = [...blogPosts].sort(sortByMetadataDateDesc);
  const sortedPhilosophyPosts = [...philosophyPosts].sort(sortByMetadataDateDesc);
  const blogTotalPages = getTotalPages(sortedBlogPosts);
  const philosophyTotalPages = Math.max(1, getTotalPages(sortedPhilosophyPosts));
  const shared = sharedDependencies();
  const blogDeps = collectionDependencies(blogPosts);
  const philosophyDeps = collectionDependencies(philosophyPosts);
  const routes: SiteRoute[] = [];

  function add(
    routePath: string,
    dependencies: string[],
    renderPage: () => Promise<React.ReactNode> | React.ReactNode,
    metadata: () => Promise<Metadata | undefined> | Metadata | undefined,
  ): void {
    routes.push({
      path: routePath,
      outputPath: routeFilePath(routePath),
      dependencies: [...shared, ...dependencies],
      render: async () =>
        renderDocument(await renderPage(), await metadata(), assets),
    });
  }

  add("/", [], () => <HomePage />, value(homeMetadata));
  add(
    "/blog",
    blogDeps,
    async () => withBlogLayout(await BlogPage()),
    value(blogMetadata),
  );
  add("/blog/search", blogDeps, () => withBlogLayout(<BlogSearchPage />), value({
    title: "Patrick Desjardins Blog Search",
    description: "Patrick Desjardins Blog Search",
  }));
  add(
    "/philosophy",
    philosophyDeps,
    async () => withPhilosophyLayout(await PhilosophyPage()),
    value(philosophyMetadata),
  );
  add("/philosophy/search", philosophyDeps, () => withPhilosophyLayout(<PhilosophySearchPage />), value({
    title: "Philosophy Search",
    description: "Search philosophy essays by Patrick Desjardins",
  }));
  add("/404", [], () => <NotFoundPage />, value({
    title: "Page not found",
    description: "Page not found",
  }));

  for (let pageNumber = 1; pageNumber <= blogTotalPages; pageNumber += 1) {
    const pageProps = props({ pageNumber: String(pageNumber) });
    add(
      `/blog/page/${pageNumber}`,
      blogDeps,
      async () => withBlogLayout(await BlogPaginationPage(pageProps)),
      async () => await generateBlogPaginationMetadata(pageProps),
    );
  }

  for (let year = LAST_YEAR; year >= FIRST_YEAR; year -= 1) {
    const yearProps = props({ year: String(year) });
    add(
      `/blog/for/${year}`,
      blogDeps,
      async () => withBlogLayout(await BlogYearPage(yearProps)),
      async () => await generateBlogYearMetadata(yearProps),
    );
  }

  for (const post of sortedBlogPosts) {
    const postProps = props({ slug: post.metadata.slug });
    add(
      `/blog/${post.metadata.slug}`,
      [postDependency(post)],
      async () => withBlogLayout(await BlogPostPage(postProps)),
      async () => await generateBlogPostMetadata(postProps),
    );
  }

  for (let pageNumber = 1; pageNumber <= philosophyTotalPages; pageNumber += 1) {
    const pageProps = props({ pageNumber: String(pageNumber) });
    add(
      `/philosophy/page/${pageNumber}`,
      philosophyDeps,
      async () => withPhilosophyLayout(await PhilosophyPaginationPage(pageProps)),
      async () => await generatePhilosophyPaginationMetadata(pageProps),
    );
  }

  for (let year = LAST_YEAR; year >= PHILOSOPHY_FIRST_YEAR; year -= 1) {
    const yearProps = props({ year: String(year) });
    add(
      `/philosophy/for/${year}`,
      philosophyDeps,
      async () => withPhilosophyLayout(await PhilosophyYearPage(yearProps)),
      async () => await generatePhilosophyYearMetadata(yearProps),
    );
  }

  for (const post of sortedPhilosophyPosts) {
    const postProps = props({ slug: post.metadata.slug });
    add(
      `/philosophy/${post.metadata.slug}`,
      [postDependency(post)],
      async () => withPhilosophyLayout(await PhilosophyPostPage(postProps)),
      async () => await generatePhilosophyPostMetadata(postProps),
    );
  }

  return routes;
}

export async function renderSitemap(): Promise<string> {
  const entries = await sitemap();
  const urls = entries
    .map((entry) => {
      const lastModified =
        entry.lastModified instanceof Date
          ? `<lastmod>${entry.lastModified.toISOString()}</lastmod>`
          : "";
      const changeFrequency =
        entry.changeFrequency === undefined
          ? ""
          : `<changefreq>${entry.changeFrequency}</changefreq>`;
      const priority =
        entry.priority === undefined ? "" : `<priority>${entry.priority}</priority>`;
      return `<url><loc>${escapeHtml(entry.url)}</loc>${lastModified}${changeFrequency}${priority}</url>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}

export function renderRobots(): string {
  const value = robots();
  return [
    `User-agent: ${value.rules.userAgent}`,
    value.rules.allow === undefined ? "" : `Allow: ${value.rules.allow}`,
    value.rules.disallow === undefined ? "" : `Disallow: ${value.rules.disallow}`,
    value.sitemap === undefined ? "" : `Sitemap: ${value.sitemap}`,
    "",
  ]
    .filter((line) => line.length > 0)
    .join("\n");
}

export { BASE_URL, MAX_POSTS_PER_PAGE };
