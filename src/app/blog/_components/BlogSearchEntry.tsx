import styles from "./BlogSearchEntry.module.css";
// import { BlogCategories } from "./BlogCategories";
import Link from "next/link";
export interface BlogSearchEntryProps {
  id: string;
  position: number;
  title: string;
  slug: string;
  score: number;
}
export const BlogSearchEntry = (
  props: BlogSearchEntryProps,
): React.ReactElement => {
  return (
    <article className={styles.blogSearchEntry} key={props.id}>
      <h2 className={styles.blogSearchEntryArticleTitle}>
        <Link href={`/blog/${props.slug}`}>
          {props.position + 1}{". "}
          {props.title} ({formatScore(props.score)})
        </Link>
      </h2>
      {/* <div className={styles.blogEntryDetails}>
        <span className={styles.blogEntryDate}>Posted: {props.date}</span>
        <BlogCategories categories={props.categories} />
      </div> */}
    </article>
  );
};

function formatScore(score: number): string {
  return (score * 100).toFixed(0) + "%";
}
