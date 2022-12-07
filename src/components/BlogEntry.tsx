import { Link } from "gatsby";
import React from "react";
import {
  blogEntry,
  blogEntryArticleTitle,
  blogEntryDate,
  blogEntryDetails,
} from "./blogentry.module.css";
import { BlogCategories } from "./BlogCategories";
export interface BlogEntryProps {
  id: string;
  title: string;
  categories: string[];
  date: string;
  slug: string;
}
export const BlogEntry = (props: BlogEntryProps): JSX.Element => {
  return (
    <article className={blogEntry} key={props.id}>
      <h2 className={blogEntryArticleTitle}>
        <Link to={`${props.slug}`}>{props.title}</Link>
      </h2>
      <div className={blogEntryDetails}>
        <span className={blogEntryDate}>Posted: {props.date}</span>
        <BlogCategories categories={props.categories} />
      </div>
    </article>
  );
};
