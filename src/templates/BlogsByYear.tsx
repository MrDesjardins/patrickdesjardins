import * as React from "react";
import { Link, graphql } from "gatsby";
import { Layout } from "../blog/layout";
import { blogEntry } from "../blog/layout.module.css";

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
        <article className={blogEntry} key={node.id}>
          <h2>
            <Link to={`${node.fields.slug}`}>{node.frontmatter.title}</Link>
          </h2>
          <p>Posted: {node.frontmatter.date}</p>
        </article>
      ))}
    </Layout>
  );
};

/**
 * the $yearStart$yearEnd are provided in the `context` of the gatsby-node.js `createPages` function
 */
export const query = graphql`
  query BlogsInYear($yearStart: Date!, $yearEnd: Date!) {
    allMdx(
      sort: { fields: frontmatter___date, order: DESC }
      filter: { frontmatter: { date: { gte: $yearStart, lte: $yearEnd } } }
    ) {
      nodes {
        frontmatter {
          date(formatString: "MMMM D, YYYY")
          title
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
