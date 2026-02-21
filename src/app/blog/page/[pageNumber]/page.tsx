import { type Metadata } from "next";
import { MAX_POSTS_PER_PAGE } from "../../../../constants/constants";
import { getAllPosts, getTotalPages } from "../../../../lib/api";
import { BlogEntry } from "../../_components/BlogEntry";
import { BlogBody } from "../../_components/BlogBody";
import { sortByMetadataDateDesc } from "../../../../_utils/list";

interface Props {
  params: { pageNumber: string };
  searchParams: Record<string, string | string[] | undefined>;
}
export async function generateMetadata(
  props: Props,
): Promise<Metadata> {
  return {
    title:
      "Patrick Desjardins Blog - Page number " +
      String(props.params.pageNumber),
    description:
      "Patrick Desjardins Blog - Page number " +
      String(props.params.pageNumber),
  };
}

export async function generateStaticParams(): Promise<
  Array<{ pageNumber: string }>
> {
  const posts = await getAllPosts();
  const totalPagesCount = getTotalPages(posts);
  const result = [];
  for (let i = 1; i <= totalPagesCount; i++) {
    result.push(i);
  }
  return result.map((y) => ({ pageNumber: String(y) }));
}

export default async function Page(props: {
  params: { pageNumber: string };
}): Promise<React.ReactElement> {
  const posts = await getAllPosts();
  posts.sort(sortByMetadataDateDesc);

  const currentPage = Number(props.params.pageNumber);
  const result = posts.slice(
    (currentPage - 1) * MAX_POSTS_PER_PAGE,
    currentPage * MAX_POSTS_PER_PAGE,
  );
  const totalPagesCount = getTotalPages(posts);

  return (
    <BlogBody
      currentPage={currentPage}
      totalPages={totalPagesCount}
      topTitle="Blog Posts"
    >
      {result.map((node) => (
        <BlogEntry
          key={node.metadata.fileName}
          id={node.metadata.fileName}
          slug={node.metadata.slug}
          title={node.frontmatter.title}
          date={node.frontmatter.date}
          categories={node.frontmatter.categories}
        />
      ))}
    </BlogBody>
  );
}
