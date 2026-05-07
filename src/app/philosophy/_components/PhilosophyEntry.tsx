import styles from "./PhilosophyEntry.module.css";
import { BlogCategories } from "../../blog/_components/BlogCategories";
import Link from "next/link";

export interface PhilosophyEntryProps {
  id: string;
  title: string;
  categories: string[];
  date: string;
  slug: string;
}

export const PhilosophyEntry = (
  props: PhilosophyEntryProps,
): React.ReactElement => {
  return (
    <article className={styles.blogEntry}>
      <h2 className={styles.blogEntryArticleTitle}>
        <Link href={`/philosophy/${props.slug}`}>{props.title}</Link>
      </h2>
      <div className={styles.blogEntryDetails}>
        <span className={styles.blogEntryDate}>Posted: {props.date}</span>
        <BlogCategories categories={props.categories} />
      </div>
    </article>
  );
};
