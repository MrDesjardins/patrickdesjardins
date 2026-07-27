import styles from "./BlogSearchEntry.module.css";
import { BlogCategories } from "./BlogCategories";
import Link from "next/link";
export interface BlogSearchEntryProps {
  id: string;
  position: number;
  title: string;
  slug: string;
  score: number;
  date: string;
  categories: string[];
  excerpt: string;
}
export const BlogSearchEntry = (
  props: BlogSearchEntryProps,
): React.ReactElement => {
  return (
    <li key={props.id}>
      <article className={styles.blogSearchEntry}>
        <h2 className={styles.blogSearchEntryArticleTitle}>
          <Link href={`/blog/${props.slug}`}>
            {props.position + 1}{". "}
            {props.title}
          </Link>
        </h2>
        <div className={styles.blogEntryDetails}>
          <time className={styles.blogEntryDate} dateTime={props.date}>
            Posted: {props.date}
          </time>
          <BlogCategories categories={props.categories} />
        </div>
        <p>{props.excerpt}</p>
        <span className={styles.searchScore}>
          Relevance: {formatScore(props.score)}
        </span>
      </article>
    </li>
  );
};

function formatScore(score: number): string {
  return (Math.min(1, Math.max(0, score)) * 100).toFixed(0) + "%";
}
