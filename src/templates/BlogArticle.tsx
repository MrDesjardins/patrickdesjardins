import * as React from "react";
import { graphql } from "gatsby";
import Layout from "../layout/Layout";
import { CodeBlock } from "../components/CodeBlock";
import { TocAzureContainerSeries } from "../blogcomponents/TocAzureContainerSeries";
import * as containerStyles from "../layout/layout.module.css";
import { MDXProvider } from "@mdx-js/react";
const components = {
  pre: CodeBlock,
  TocAzureContainerSeries,
};
const BlogArticle = (queryInfo) => {
  const data = queryInfo.data;
  const context = queryInfo.pageContext;
  return (
    <Layout
      pageTitle={data.mdx.frontmatter.title}
      totalPages={context.totalPages}
    >
      <div className={containerStyles.blogPostContainer}>
        <p className={containerStyles.blogPostDate}>
          Posted on: {data.mdx.frontmatter.date}
        </p>
        <MDXProvider components={components}>{queryInfo.children}</MDXProvider>
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
    }
  }
`;

export default BlogArticle;
