import * as React from "react";
import { graphql } from "gatsby";
import { MDXRenderer } from "gatsby-plugin-mdx";
import { MDXProvider } from "@mdx-js/react";
import { Layout } from "../../blog/layout";
import CodeBlock from "../../blog/CodeBlock";

import { blogPostContainer, blogPostDate } from "../../blog/layout.module.css";

const components = {
  pre: CodeBlock,
};
const BlogPost = ({ data }): JSX.Element => {
  // highlight-line
  return (
    <Layout pageTitle={data.mdx.frontmatter.title}>
      <div className={blogPostContainer}>
        <p className={blogPostDate}>Posted on: {data.mdx.frontmatter.date}</p>
        <MDXProvider components={components}>
          <MDXRenderer>{data.mdx.body}</MDXRenderer>
        </MDXProvider>
      </div>
    </Layout>
  );
};

/**
 * the $id is provided in the `context` of the gatsby-node.js `createPages` function
 */
export const query = graphql`
  query ($id: String) {
    mdx(id: { eq: $id }) {
      frontmatter {
        title
        date(formatString: "MMMM D, YYYY")
      }
      body
    }
  }
`;
export default BlogPost;
