import * as React from "react";
import { Link, graphql } from "gatsby";
import { Layout } from "../../blog/layout";
import { blogEntry } from "../../blog/layout.module.css";

const BlogPage = (queryInfo) => {
  const data = queryInfo.data;
  const context = queryInfo.pageContext;
  return (
    <Layout
      pageTitle="Blog Posts"
      currentPage={context.currentPage}
      totalPages={context.totalPages}
    >
      <>
        {data.allMdx.nodes.map((node) => (
          <article className={blogEntry} key={node.id}>
            <h2>
              <Link to={`${node.fields.slug}`}>{node.frontmatter.title}</Link>
            </h2>
            <p>Posted: {node.frontmatter.date}</p>
          </article>
        ))}
      </>
    </Layout>
  );
};

export const query = graphql`
  query TopXBlogArticles($limit: Int!, $skip: Int!) {
    allMdx(
      sort: { fields: frontmatter___date, order: DESC }
      limit: $limit
      skip: $skip
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
