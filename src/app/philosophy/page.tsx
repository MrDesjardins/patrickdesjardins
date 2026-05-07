import { type Metadata } from "next";
import { MAX_POSTS_PER_PAGE } from "../../constants/constants";
import { getAllPhilosophyPosts, getTotalPages } from "../../lib/api";
import { PhilosophyEntry } from "./_components/PhilosophyEntry";
import { PhilosophyBlogBody } from "./_components/PhilosophyBlogBody";
import { sortByMetadataDateDesc } from "../../_utils/list";

export const metadata: Metadata = {
  title: "Philosophy — Patrick Desjardins",
  description: "Essays and notes on philosophy by Patrick Desjardins.",
};

export default async function Page(): Promise<React.ReactElement> {
  const pageNumber = 1;
  const posts = await getAllPhilosophyPosts();
  const totalPage = getTotalPages(posts);
  posts.sort(sortByMetadataDateDesc);
  const pagePost = posts.slice(
    (pageNumber - 1) * MAX_POSTS_PER_PAGE,
    pageNumber * MAX_POSTS_PER_PAGE,
  );
  const totalCount = posts.length;
  return (
    <PhilosophyBlogBody
      currentPage={pageNumber}
      totalPages={totalPage}
      topTitle="Essays"
      totalBlogPost={totalCount}
    >
      {pagePost.map((node) => (
        <PhilosophyEntry
          key={node.metadata.fileName}
          id={node.metadata.fileName}
          slug={node.metadata.slug}
          title={node.frontmatter.title}
          date={node.frontmatter.date}
          categories={node.frontmatter.categories}
        />
      ))}
    </PhilosophyBlogBody>
  );
}
