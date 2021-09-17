const { createFilePath } = require("gatsby-source-filesystem");
const path = require("path");

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
    const url = `/blog/${newSlug}`;
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
  posts.forEach(({ node }, index) => {
    // Create the individual blog article page (1 per mdx file)
    createPage({
      path: node.fields.slug /*defined in `onCreateNode`*/,
      component: path.resolve(`./src/pages/blog/{mdx.slug}.tsx`) /*Curly to dynamicaly change with a field: https://www.gatsbyjs.com/docs/reference/routing/creating-routes/#using-the-file-system-route-api*/,
      context: { id: node.id },
    });
    const year = node.frontmatter.date.substr(0, 4);
    if (!years.has(year)) {
      const yearStart = year + "-01-01";
      const yearEnd = year + "-12-31";
      createPage({
        path: `blog/${year}`,
        component: path.resolve(`./src/pages/blog/BlogsByYear.tsx`),
        context: { yearStart: yearStart, yearEnd: yearEnd },
      });
      years.set(year, year);
    }
  });
};
