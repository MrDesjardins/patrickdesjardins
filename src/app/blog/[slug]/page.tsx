import { type Metadata } from "next";
import { getAllPosts, getPostBySlug, getTotalPages } from "../../../lib/api";
import { BlogBody } from "../_components/BlogBody";
import styles from "./Page.module.css";
import "./linenumber.css";
import "./theme.css";
interface Props {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
}

/**
 * Dynamically generate the metadata for the page like the title for the browser tab.
 * @param props
 * @returns
 */
export async function generateMetadata(
  props: Props,
): Promise<Metadata> {
  const post = await getPostBySlug(props.params.slug);
  if (post === undefined) {
    throw new Error("Post not found");
  }

  return {
    title: "Patrick Desjardins Blog - " + post.frontmatter.title,
    description: post.frontmatter.title,
  };
}

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const posts = await getAllPosts();
  return posts.map((p) => ({ slug: p.metadata.slug }));
}

export default async function Page(props: {
  params: { slug: string };
}): Promise<React.ReactElement> {
  const posts = await getAllPosts();
  const totalPages = getTotalPages(posts);
  const post = posts.find((p) => p.metadata.slug === props.params.slug);
  if (post === undefined) {
    throw new Error("Post not found");
  }

  return (
    <BlogBody
      totalPages={totalPages}
      topTitle={post.frontmatter.title}
    >
      <div className={styles.blogPostContainer}>
        <p className={styles.blogPostDate}>
          Posted on: {post.frontmatter.date}
        </p>
        {post.contentReact}
      </div>
    </BlogBody>
  );
}
