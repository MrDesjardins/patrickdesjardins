import { type Metadata } from "next";
import {
  LAST_YEAR,
  PHILOSOPHY_FIRST_YEAR,
} from "../../../../constants/constants";
import { getAllPhilosophyPosts, getTotalPages } from "../../../../lib/api";
import { PhilosophyEntry } from "../../_components/PhilosophyEntry";
import { PhilosophyBlogBody } from "../../_components/PhilosophyBlogBody";
import { sortByMetadataDateDesc } from "../../../../_utils/list";

interface Props {
  params: { year: string };
  searchParams: Record<string, string | string[] | undefined>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  return {
    title: "Philosophy — " + String(props.params.year),
    description:
      "Philosophy essays from " + String(props.params.year) + " — Patrick Desjardins",
  };
}

export async function generateStaticParams(): Promise<Array<{ year: string }>> {
  const years = [];
  for (let year = LAST_YEAR; year >= PHILOSOPHY_FIRST_YEAR; year--) {
    years.push(year);
  }
  return years.map((y) => ({ year: String(y) }));
}

export default async function Page(props: {
  params: { year: string };
}): Promise<React.ReactElement> {
  const year = Number(props.params.year);
  const posts = await getAllPhilosophyPosts();
  const totalPages = getTotalPages(posts);
  const postForYear = posts
    .filter((file) => file.metadata.year === year)
    .sort(sortByMetadataDateDesc);

  return (
    <PhilosophyBlogBody totalPages={totalPages} year={year} topTitle="Essays">
      {postForYear.map((node) => (
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
