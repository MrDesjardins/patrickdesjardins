const { createFilePath } = require("gatsby-source-filesystem");
const path = require("path");

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;
  // https://www.gatsbyjs.com/docs/mdx/programmatically-creating-pages/#generate-slugs
  if (node.internal.type === `Mdx`) {
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
          }
        }
      }
    }
  `);

  if (result.errors) {
    reporter.panicOnBuild('🚨  ERROR: Loading "createPages" query');
  }

  const posts = result.data.allMdx.edges;

  posts.forEach(({ node }, index) => {
    createPage({
      path: node.fields.slug,
      component: path.resolve(`./src/pages/blog/{mdx.slug}.tsx`),
      context: { id: node.id },
    });
  });
};
