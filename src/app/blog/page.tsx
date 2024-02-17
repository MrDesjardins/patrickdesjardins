import { type Metadata } from "next";
import { MAX_POSTS_PER_PAGE } from "../../constants/constants";
import { getAllPosts, getTotalPages } from "../../lib/api";
import styles from "./_components/BlogBody.module.css";
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
  const props = {
    pageNumber: pageNumber,
    totalPages: totalPage,
    posts: pagePost,
  };
  return (
    <BlogBody
      currentPage={Number(props.pageNumber)}
      totalPages={props.totalPages}
    >
      <h1 className={styles.heading}>Blog Posts</h1>
      {pagePost.map((node) => (
        <BlogEntry
          key={node.metadata.fileName}
          id={node.metadata.fileName}
          slug={node.metadata.slug}
          title={node.frontmatter.title as string}
          date={node.frontmatter.date as string}
          categories={node.frontmatter.categories as string[]}
        />
      ))}
    </BlogBody>
  );
}
