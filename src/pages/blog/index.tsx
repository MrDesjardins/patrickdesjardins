import * as React from "react";
import { Link, graphql } from "gatsby";
import { Layout } from "../../blog/layout";
import { blogEntry } from "../../blog/layout.module.css";
const BlogPage = ({ data }) => {
  return (
    <Layout pageTitle="Blog Posts">
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

export const query = graphql`
  query TopArticles {
    allMdx(
      sort: { fields: frontmatter___date, order: DESC }
      limit: 10
      skip: 0
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

export default BlogPage;
