import { type Metadata } from "next";
import {
  getAllPhilosophyPosts,
  getPhilosophyPostBySlug,
  getTotalPages,
  plainTextExcerpt,
} from "../../../lib/api";
import { MastodonComments } from "../../_components/MastodonComments";
import { PhilosophyBlogBody } from "../_components/PhilosophyBlogBody";
import styles from "./Page.module.css";
import "../../blog/[slug]/linenumber.css";
import "./paper-prism.css";
import Link from "next/link";
import { sortByMetadataDateDesc } from "../../../_utils/list";

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
    description: plainTextExcerpt(post.rawFileContent),
  };
}

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const posts = await getAllPhilosophyPosts();
  posts.sort(sortByMetadataDateDesc);
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
  const postIndex = posts.findIndex(
    (candidate) => candidate.metadata.slug === post.metadata.slug,
  );
  const newerPost = postIndex > 0 ? posts[postIndex - 1] : undefined;
  const olderPost = postIndex >= 0 ? posts[postIndex + 1] : undefined;

  return (
    <PhilosophyBlogBody
      isArticle
      totalPages={totalPages}
      topTitle={post.frontmatter.title}
    >
      <div className={styles.blogPostContainer}>
        <p className={styles.blogPostDate}>
          Posted on:{" "}
          <time dateTime={post.frontmatter.date}>{post.frontmatter.date}</time>
        </p>
        <div className={styles.blogPostContent}>{post.contentReact}</div>
        {newerPost !== undefined || olderPost !== undefined ? (
          <nav
            className={styles.articleNavigation}
            aria-label="Adjacent essays"
          >
            {newerPost === undefined ? null : (
              <Link rel="prev" href={`/philosophy/${newerPost.metadata.slug}`}>
                ← Newer: {newerPost.frontmatter.title}
              </Link>
            )}
            {olderPost === undefined ? null : (
              <Link rel="next" href={`/philosophy/${olderPost.metadata.slug}`}>
                Older: {olderPost.frontmatter.title} →
              </Link>
            )}
          </nav>
        ) : null}
        <MastodonComments kind="philosophy" slug={post.metadata.slug} />
      </div>
    </PhilosophyBlogBody>
  );
}
