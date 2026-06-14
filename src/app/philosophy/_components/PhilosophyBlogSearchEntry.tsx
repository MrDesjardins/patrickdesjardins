import styles from "./PhilosophyBlogSearchEntry.module.css";
import Link from "next/link";

export interface PhilosophyBlogSearchEntryProps {
  id: string;
  position: number;
  title: string;
  slug: string;
  score: number;
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
            {props.title} ({formatScore(props.score)})
          </Link>
        </h2>
      </article>
    </li>
  );
};

function formatScore(score: number): string {
  return (score * 100).toFixed(0) + "%";
}
