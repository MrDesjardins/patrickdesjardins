import { type Metadata } from "next";
import { MastodonComments } from "../../_components/MastodonComments";
import {
  getAllPosts,
  getPostBySlug,
  getTotalPages,
  plainTextExcerpt,
} from "../../../lib/api";
import { BlogBody } from "../_components/BlogBody";
import styles from "./Page.module.css";
import "./linenumber.css";
import "./theme.css";
import Link from "next/link";
import { sortByMetadataDateDesc } from "../../../_utils/list";
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
    description: plainTextExcerpt(post.rawFileContent),
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
  posts.sort(sortByMetadataDateDesc);
  const totalPages = getTotalPages(posts);
  const post = await getPostBySlug(props.params.slug);
  if (post === undefined) {
    throw new Error("Post not found");
  }
  const postIndex = posts.findIndex(
    (candidate) => candidate.metadata.slug === post.metadata.slug,
  );
  const newerPost = postIndex > 0 ? posts[postIndex - 1] : undefined;
  const olderPost = postIndex >= 0 ? posts[postIndex + 1] : undefined;

  return (
    <BlogBody
      isArticle
      totalPages={totalPages}
      topTitle={post.frontmatter.title}
    >
      <div className={styles.blogPostContainer}>
        <p className={styles.blogPostDate}>
          Posted on:{" "}
          <time dateTime={post.frontmatter.date}>{post.frontmatter.date}</time>
        </p>
        {post.contentReact}
        {newerPost !== undefined || olderPost !== undefined ? (
          <nav
            className={styles.articleNavigation}
            aria-label="Adjacent articles"
          >
            {newerPost === undefined ? null : (
              <Link rel="prev" href={`/blog/${newerPost.metadata.slug}`}>
                ← Newer: {newerPost.frontmatter.title}
              </Link>
            )}
            {olderPost === undefined ? null : (
              <Link rel="next" href={`/blog/${olderPost.metadata.slug}`}>
                Older: {olderPost.frontmatter.title} →
              </Link>
            )}
          </nav>
        ) : null}
        <MastodonComments kind="blog" slug={post.metadata.slug} />
      </div>
    </BlogBody>
  );
}
