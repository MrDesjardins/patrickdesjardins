import * as React from "react";
import styles from "./blogcategories.module.css";
export interface BlogCategoriesProps {
  categories?: string[];
}
export const BlogCategories = (props: BlogCategoriesProps): JSX.Element => {
  return (
    <span className={styles.container}>
      {(props.categories ?? [])?.map((c) => (
        <span key={c} className={styles.item}>
          {c}
        </span>
      ))}
    </span>
  );
};
