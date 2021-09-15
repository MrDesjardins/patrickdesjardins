// prefer default export if available
const preferDefault = m => (m && m.default) || m

exports.components = {
  "component---src-pages-404-tsx": () => import("./../../../src/pages/404.tsx" /* webpackChunkName: "component---src-pages-404-tsx" */),
  "component---src-pages-blog-index-tsx": () => import("./../../../src/pages/blog/index.tsx" /* webpackChunkName: "component---src-pages-blog-index-tsx" */),
  "component---src-pages-blog-mdx-slug-tsx": () => import("./../../../src/pages/blog/{mdx.slug}.tsx" /* webpackChunkName: "component---src-pages-blog-mdx-slug-tsx" */),
  "component---src-pages-index-tsx": () => import("./../../../src/pages/index.tsx" /* webpackChunkName: "component---src-pages-index-tsx" */),
  "component---src-pages-top-5-tsx": () => import("./../../../src/pages/top5.tsx" /* webpackChunkName: "component---src-pages-top-5-tsx" */)
}

