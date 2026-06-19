import { type Metadata } from "next";
import {
  getAllPhilosophyPosts,
  getPhilosophyPostBySlug,
  getTotalPages,
} from "../../../lib/api";
import { MastodonComments } from "../../_components/MastodonComments";
import { PhilosophyBlogBody } from "../_components/PhilosophyBlogBody";
import styles from "./Page.module.css";
import "../../blog/[slug]/linenumber.css";
import "./paper-prism.css";

const EMPTY_PHILOSOPHY_SLUG = "__no-published-essays";

interface Props {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  if (props.params.slug === EMPTY_PHILOSOPHY_SLUG) {
    return {
      title: "Philosophy — Patrick Desjardins",
      description: "Essays and notes on philosophy by Patrick Desjardins.",
    };
  }

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
  if (posts.length === 0) {
    return [{ slug: EMPTY_PHILOSOPHY_SLUG }];
  }
  return posts.map((p) => ({ slug: p.metadata.slug }));
}

export default async function Page(props: {
  params: { slug: string };
}): Promise<React.ReactElement> {
  const posts = await getAllPhilosophyPosts();
  const totalPages = getTotalPages(posts);
  const post = await getPhilosophyPostBySlug(props.params.slug);
  if (post === undefined && props.params.slug === EMPTY_PHILOSOPHY_SLUG) {
    return (
      <PhilosophyBlogBody totalPages={totalPages} topTitle="Essays">
        <div className={styles.blogPostContainer}>
          <p className={styles.blogPostDate}>
            No philosophy essays are published yet.
          </p>
        </div>
      </PhilosophyBlogBody>
    );
  }

  if (post === undefined) {
    throw new Error("Philosophy post not found");
  }

  return (
    <PhilosophyBlogBody
      isArticle
      totalPages={totalPages}
      topTitle={post.frontmatter.title}
    >
      <div className={styles.blogPostContainer}>
        <p className={styles.blogPostDate}>
          Posted on: {post.frontmatter.date}
        </p>
        <div className={styles.blogPostContent}>{post.contentReact}</div>
        <MastodonComments kind="philosophy" slug={post.metadata.slug} />
      </div>
    </PhilosophyBlogBody>
  );
}
