import { graphql } from "gatsby";
import * as React from "react";
import { Layout } from "../blog/layout";
import { MDXRenderer } from "gatsby-plugin-mdx";
import { MDXProvider } from "@mdx-js/react";
import CodeBlock from "../blog/CodeBlock";
export const query = graphql`
  query {
    allMdx(sort: { fields: frontmatter___date, order: DESC }, limit: 5) {
      nodes {
        frontmatter {
          date(formatString: "MMMM D, YYYY")
          title
        }
        id
        body
      }
    }
  }
`;
const components = {
  pre: CodeBlock,
};
const BlogPage = ({ data }): JSX.Element => {
  return (
    <Layout pageTitle="My Blog Posts">
      {data.allMdx.nodes.map((node) => (
        <article key={node.id}>
          <h2>{node.frontmatter.title}</h2>
          <p>Posted: {node.frontmatter.date}</p>
          <MDXProvider components={components}>
            <MDXRenderer>{node.body}</MDXRenderer>
          </MDXProvider>
        </article>
      ))}
    </Layout>
  );
};
export default BlogPage;
