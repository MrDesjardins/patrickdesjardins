import { type ResolvingMetadata, type Metadata } from "next";
import { FIRST_YEAR, LAST_YEAR } from "../../../../constants/constants";
import { type MdxData, getAllPosts, getTotalPages } from "../../../../lib/api";
import { BlogEntry } from "../../_components/BlogEntry";
import { BlogBody } from "../../_components/BlogBody";
import { sortByMetadataDateDesc } from "../../../../_utils/list";

interface Props {
  params: { year: string };
  searchParams: Record<string, string | string[] | undefined>;
}
export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return {
    title: "Patrick Desjardins Blog - Year " + String(props.params.year),
    description: "Patrick Desjardins Blog - Year " + String(props.params.year),
  };
}

export interface GeneratedPageContentType {
  blogPosts: MdxData[];
  year: number;
  totalPages: number;
}
export async function generateStaticParams(): Promise<Array<{ year: string }>> {
  const years = [];
  for (let year = LAST_YEAR; year >= FIRST_YEAR; year--) {
    years.push(year);
  }
  return years.map((y) => ({ year: String(y) }));
}

export default async function Page(props: {
  params: { year: string };
}): Promise<React.ReactElement> {
  const year = Number(props.params.year);
  const posts = await getAllPosts();
  const totalPages = getTotalPages(posts);
  const postForYear = posts
    .filter((file) => file.metadata.year === year)
    .sort(sortByMetadataDateDesc);

  return (
    <BlogBody totalPages={totalPages} year={year} topTitle="Blog Posts">
      {(postForYear ?? []).map((node) => (
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
