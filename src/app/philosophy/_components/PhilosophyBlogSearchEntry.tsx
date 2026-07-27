import styles from "./PhilosophyBlogSearchEntry.module.css";
import Link from "next/link";

export interface PhilosophyBlogSearchEntryProps {
  id: string;
  position: number;
  title: string;
  slug: string;
  score: number;
  date: string;
  excerpt: string;
}

export const PhilosophyBlogSearchEntry = (
  props: PhilosophyBlogSearchEntryProps,
): React.ReactElement => {
  return (
    <li key={props.id}>
      <article className={styles.blogSearchEntry}>
        <h2 className={styles.blogSearchEntryArticleTitle}>
          <Link href={`/philosophy/${props.slug}`}>
            {props.position + 1}
            {". "}
            {props.title}
          </Link>
        </h2>
        <time dateTime={props.date}>Posted: {props.date}</time>
        <p>{props.excerpt}</p>
        <span>Relevance: {formatScore(props.score)}</span>
      </article>
    </li>
  );
};

function formatScore(score: number): string {
  return (Math.min(1, Math.max(0, score)) * 100).toFixed(0) + "%";
}
