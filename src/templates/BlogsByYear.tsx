import * as React from "react";
import { graphql } from "gatsby";
import Layout from "../layout/layout";
import { BlogEntry } from "../components/BlogEntry";

const BlogsByYear = (queryInfo) => {
  const data = queryInfo.data;
  const context = queryInfo.pageContext;
  return (
    <Layout
      pageTitle="Blog Posts"
      currentPageYear={context.year}
      totalPages={context.totalPages}
    >
      {data.allMdx.nodes.map((node) => (
        <BlogEntry
          id={node.id}
          slug={node.fields.slug}
          title={node.frontmatter.title}
          date={node.frontmatter.date}
          categories={node.frontmatter.categories}
        />
      ))}
    </Layout>
  );
};

/**
 * the $yearStart$yearEnd are provided in the `context` of the gatsby-node.js `createPages` function
 */
export const query = graphql`
  query BlogsInYear($yearStart: Date!, $yearEnd: Date!, $currentDate: Date!) {
    allMdx(
      sort: { frontmatter: { date: DESC } }
      filter: {
        frontmatter: {
          date: { gte: $yearStart, lt: $yearEnd, lte: $currentDate }
        }
      }
    ) {
      nodes {
        frontmatter {
          date(formatString: "MMMM D, YYYY")
          title
          categories
        }
        id
        fields {
          slug
        }
      }
    }
  }
`;

export default BlogsByYear;
