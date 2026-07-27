import { type Metadata } from "next";
import { getAllPosts } from "../../../../lib/api";
import { sortByMetadataDateDesc } from "../../../../_utils/list";
import { BlogBody } from "../../_components/BlogBody";
import { BlogEntry } from "../../_components/BlogEntry";
import { categorySlug } from "../../_components/BlogCategories";

interface Props {
  params: { category: string };
  searchParams: Record<string, string | string[] | undefined>;
}

async function categoryName(slug: string): Promise<string> {
  const posts = await getAllPosts();
  for (const post of posts) {
    const category = post.frontmatter.categories.find(
      (value) => categorySlug(value) === slug,
    );
    if (category !== undefined) {
      return category;
    }
  }
  return slug;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const name = await categoryName(props.params.category);
  return {
    title: `${name} articles — Patrick Desjardins`,
    description: `Technical articles about ${name} by Patrick Desjardins.`,
  };
}

export async function generateStaticParams(): Promise<Array<{ category: string }>> {
  const posts = await getAllPosts();
  return [
    ...new Set(
      posts.flatMap((post) => post.frontmatter.categories.map(categorySlug)),
    ),
  ].map((category) => ({ category: category }));
}

export default async function Page(props: Props): Promise<React.ReactElement> {
  const posts = (await getAllPosts())
    .filter((post) =>
      post.frontmatter.categories.some(
        (category) => categorySlug(category) === props.params.category,
      ),
    )
    .sort(sortByMetadataDateDesc);
  const name = await categoryName(props.params.category);

  return (
    <BlogBody topTitle={`Articles about ${name}`}>
      {posts.map((post) => (
        <BlogEntry
          key={post.metadata.fileName}
          id={post.metadata.fileName}
          slug={post.metadata.slug}
          title={post.frontmatter.title}
          date={post.frontmatter.date}
          categories={post.frontmatter.categories}
        />
      ))}
    </BlogBody>
  );
}
