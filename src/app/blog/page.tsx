import { type Metadata } from "next";
import { MAX_POSTS_PER_PAGE } from "../../constants/constants";
import { getAllPosts, getTotalPages } from "../../lib/api";
import { BlogEntry } from "./_components/BlogEntry";
import { BlogBody } from "./_components/BlogBody";

export const metadata: Metadata = {
  title: "Patrick Desjardins Blog",
  description: "Patrick Desjardins Blog",
};

export default async function Page(): Promise<React.ReactElement> {
  const pageNumber = 1;
  const posts = await getAllPosts();
  const totalPage = getTotalPages(posts);
  posts.sort((a, b) =>
    new Date(a.metadata.date) > new Date(b.metadata.date) ? -1 : 1,
  );
  const pagePost = posts.slice(
    (pageNumber - 1) * MAX_POSTS_PER_PAGE,
    pageNumber * MAX_POSTS_PER_PAGE,
  );
  const computedBlogProps = {
    pageNumber: pageNumber,
    totalPages: totalPage,
    posts: pagePost,
  };
  const totalBlogPost = posts.length;
  return (
    <BlogBody
      currentPage={Number(computedBlogProps.pageNumber)}
      totalPages={computedBlogProps.totalPages}
      topTitle="Blog Posts"
      totalBlogPost={totalBlogPost}
    >
      {pagePost.map((node) => (
        <BlogEntry
          key={node.metadata.fileName}
          id={node.metadata.fileName}
          slug={node.metadata.slug}
          title={typeof node.frontmatter.title === "string" ? node.frontmatter.title : ""}
          date={typeof node.frontmatter.date === "string" ? node.frontmatter.date : ""}
          categories={Array.isArray(node.frontmatter.categories) ? node.frontmatter.categories.filter((c): c is string => typeof c === "string") : []}
        />
      ))}
    </BlogBody>
  );
}
