import * as React from "react";
import { Link, graphql } from "gatsby";
import { Layout } from "../../blog/layout";
import {
  blogEntry,
  paginationBar,
  currentLink,
  paginationLinks,
  paginationTitle,
} from "../../blog/layout.module.css";
import { URL_BY_PAGE } from "../../../constants";
const BlogPage = (queryInfo) => {
  console.log(queryInfo);
  const data = queryInfo.data;
  const context = queryInfo.pageContext;
  const pages = [];
  for (let i = 1; i <= context.totalPages; i++) {
    pages.push(i);
  }
  return (
    <Layout pageTitle="Blog Posts">
      <>
        {data.allMdx.nodes.map((node) => (
          <article className={blogEntry} key={node.id}>
            <h2>
              <Link to={`${node.fields.slug}`}>{node.frontmatter.title}</Link>
            </h2>
            <p>Posted: {node.frontmatter.date}</p>
          </article>
        ))}
        <div className={paginationBar}>
          <div className={paginationTitle}>Page</div>
          <div className={paginationLinks}>
            {pages.map((page) => {
              let classLink = "";
              if (page === context.currentPage) {
                classLink = currentLink;
              }
              return (
                <Link
                  className={classLink}
                  to={URL_BY_PAGE.replace("{page}", page)}
                >
                  {page}
                </Link>
              );
            })}
          </div>
        </div>
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
