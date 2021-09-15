
// prefer default export if available
const preferDefault = m => (m && m.default) || m


exports.components = {
  "component---src-pages-404-tsx": preferDefault(require("/Users/pdesjardins/code/perso/my_website/patrickdesjardins/src/pages/404.tsx")),
  "component---src-pages-blog-index-tsx": preferDefault(require("/Users/pdesjardins/code/perso/my_website/patrickdesjardins/src/pages/blog/index.tsx")),
  "component---src-pages-blog-mdx-slug-tsx": preferDefault(require("/Users/pdesjardins/code/perso/my_website/patrickdesjardins/src/pages/blog/{mdx.slug}.tsx")),
  "component---src-pages-index-tsx": preferDefault(require("/Users/pdesjardins/code/perso/my_website/patrickdesjardins/src/pages/index.tsx")),
  "component---src-pages-top-5-tsx": preferDefault(require("/Users/pdesjardins/code/perso/my_website/patrickdesjardins/src/pages/top5.tsx"))
}

