const { createFilePath } = require("gatsby-source-filesystem");
const path = require("path");
const { LIMIT_BLOG_COUNT, URL_PER_YEAR, URL_BY_PAGE, URL_BLOG_ARTICLE } = require("./constants");

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;
  // https://www.gatsbyjs.com/docs/mdx/programmatically-creating-pages/#generate-slugs
  if (node.internal.type === `Mdx`) {
    // Step 1: Create a new field SLUG for the blog to be /blog/name-here
    // https://www.gatsbyjs.com/plugins/gatsby-source-filesystem/#helper-functions
    const relativeFilePath = createFilePath({
      node,
      getNode,
      trailingSlash: false,
    });
    const newSlug = relativeFilePath.substring(6); // Remove the year
    const url = URL_BLOG_ARTICLE.replace("{slug}", newSlug);
    createNodeField({
      name: `slug`,
      node,
      value: url,
    });

    // Step 2: Create a new field to store the year and the
    const blogDate = node.frontmatter.date; // Format is '2020-10-30'
  }
};

/**
 * Create the pages mean that they are creating the slug to the page. Here, we
 * are associating the new slug field because the `onCreateNode` function does
 * not change the slug but create a new field under the `fields` for each node.
 */
exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions;

  const result = await graphql(`
    query {
      allMdx {
        edges {
          node {
            id
            fields {
              slug
            }
            frontmatter {
              date(formatString: "YYYY-MM-DD")
            }
          }
        }
      }
    }
  `);

  if (result.errors) {
    reporter.panicOnBuild('🚨  ERROR: Loading "createPages" query');
  }

  const posts = result.data.allMdx.edges;
  const years = new Map();
  let pageCounter = 0;
  const totalPageCount = Math.ceil(posts.length / LIMIT_BLOG_COUNT);
  posts.forEach(({ node }, index) => {
    // ----------------------------------------------------------------------------------------
    // Page 1: Individual: Create the individual blog article page (1 per mdx file)
    // ----------------------------------------------------------------------------------------
    // Curly to dynamicaly change with a field: https://www.gatsbyjs.com/docs/reference/routing/creating-routes/#using-the-file-system-route-api
    createPage({
      path: node.fields.slug /*defined in `onCreateNode`*/,
      component: path.resolve(`./src/templates/BlogArticle.tsx`),
      context: { id: node.id, totalPages: totalPageCount },
    });

    // ----------------------------------------------------------------------------------------
    // Page 2: Yearly: All blog post for a specific year
    // ----------------------------------------------------------------------------------------
    const year = node.frontmatter.date.substr(0, 4);
    if (!years.has(year)) {
      const yearStart = year + "-01-01";
      const yearEnd = year + "-12-31";
      createPage({
        path: URL_PER_YEAR.replace("{year}", year),
        component: path.resolve(`./src/templates/BlogsByYear.tsx`),
        context: {
          yearStart: yearStart,
          yearEnd: yearEnd,
          year,
          totalPages: totalPageCount,
        },
      });
      years.set(year, year);
    }

    // ----------------------------------------------------------------------------------------
    // Page 3: All blog posts by page (offset + limit)
    // ----------------------------------------------------------------------------------------
    if (pageCounter % LIMIT_BLOG_COUNT === 0) {
      const pageNumber = pageCounter / LIMIT_BLOG_COUNT + 1;
      createPage({
        path: URL_BY_PAGE.replace("{page}", pageNumber),
        component: path.resolve(`./src/templates/BlogsByPage.tsx`),
        context: {
          limit: LIMIT_BLOG_COUNT,
          skip: LIMIT_BLOG_COUNT * (pageNumber - 1),
          currentPage: pageNumber,
          totalPages: totalPageCount,
        },
      });
    }
    pageCounter++;
  });

  // ----------------------------------------------------------------------------------------
  // Page 4: Redefining the Index page to be the first page (see page 3)
  // ----------------------------------------------------------------------------------------
  const pageNumber = pageCounter / LIMIT_BLOG_COUNT + 1;
  createPage({
    path: "blog",
    component: path.resolve(`./src/templates/BlogsByPage.tsx`),
    context: {
      limit: LIMIT_BLOG_COUNT,
      skip: 0,
      currentPage: 1,
      totalPages: totalPageCount,
    },
  });
};
