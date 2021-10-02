import * as React from "react";
import { graphql } from "gatsby";
import { MDXRenderer } from "gatsby-plugin-mdx";
import { MDXProvider } from "@mdx-js/react";
import { Layout } from "../layout/layout";
import {CodeBlock} from "../components/CodeBlock";

import { blogPostContainer, blogPostDate } from "../layout/layout.module.css";

const components = {
  pre: CodeBlock,
};
const BlogPost = (queryInfo): JSX.Element => {
  const data = queryInfo.data;
  const context = queryInfo.pageContext;
  return (
    <Layout
      pageTitle={data.mdx.frontmatter.title}
      totalPages={context.totalPages}
    >
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
