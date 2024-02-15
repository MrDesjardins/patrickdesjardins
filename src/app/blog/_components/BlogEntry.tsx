import React from "react";
import styles from "./BlogEntry.module.css";
import { BlogCategories } from "./BlogCategories";
import Link from "next/link";
export interface BlogEntryProps {
  id: string;
  title: string;
  categories: string[];
  date: string;
  slug: string;
}
export const BlogEntry = (props: BlogEntryProps): JSX.Element => {
  return (
    <article className={styles.blogEntry} key={props.id}>
      <h2 className={styles.blogEntryArticleTitle}>
        <Link href={`/blog/${props.slug}`}>{props.title}</Link>
      </h2>
      <div className={styles.blogEntryDetails}>
        <span className={styles.blogEntryDate}>Posted: {props.date}</span>
        <BlogCategories categories={props.categories} />
      </div>
    </article>
  );
};
