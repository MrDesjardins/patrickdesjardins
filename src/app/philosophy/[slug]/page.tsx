import { type Metadata } from "next";
import {
  getAllPhilosophyPosts,
  getPhilosophyPostBySlug,
  getTotalPages,
} from "../../../lib/api";
import { PhilosophyBlogBody } from "../_components/PhilosophyBlogBody";
import styles from "./Page.module.css";
import "../../blog/[slug]/linenumber.css";
import "./paper-prism.css";

interface Props {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const post = await getPhilosophyPostBySlug(props.params.slug);
  if (post === undefined) {
    throw new Error("Philosophy post not found");
  }

  return {
    title: "Philosophy — " + post.frontmatter.title,
    description: post.frontmatter.title,
  };
}

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const posts = await getAllPhilosophyPosts();
  return posts.map((p) => ({ slug: p.metadata.slug }));
}

export default async function Page(props: {
  params: { slug: string };
}): Promise<React.ReactElement> {
  const posts = await getAllPhilosophyPosts();
  const totalPages = getTotalPages(posts);
  const post = posts.find((p) => p.metadata.slug === props.params.slug);
  if (post === undefined) {
    throw new Error("Philosophy post not found");
  }

  return (
    <PhilosophyBlogBody totalPages={totalPages} topTitle={post.frontmatter.title}>
      <div className={styles.blogPostContainer}>
        <p className={styles.blogPostDate}>
          Posted on: {post.frontmatter.date}
        </p>
        <div className={styles.blogPostContent}>{post.contentReact}</div>
      </div>
    </PhilosophyBlogBody>
  );
}
