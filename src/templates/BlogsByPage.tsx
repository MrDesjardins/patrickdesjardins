import * as React from "react";
import { graphql } from "gatsby";
import Layout from "../layout/layout";
import { BlogEntry } from "../components/BlogEntry";

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
          <BlogEntry
            id={node.id}
            slug={node.fields.slug}
            title={node.frontmatter.title}
            date={node.frontmatter.date}
            categories={node.frontmatter.categories}
          />
        ))}
      </>
    </Layout>
  );
};

export const query = graphql`
  query TopXBlogArticles($limit: Int!, $skip: Int!, $currentDate: Date!) {
    allMdx(
      sort: { frontmatter: { date: DESC } }
      limit: $limit
      skip: $skip
      filter: { frontmatter: { date: { lte: $currentDate } } }
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

export default BlogPage;
