import * as React from "react";
import { container, item } from "./blogcategories.module.css";
export interface BlogCategoriesProps {
  categories?: string[];
}
export const BlogCategories = (props: BlogCategoriesProps): JSX.Element => {
  return (
    <span className={container}>
      {props.categories?.map((c) => (
        <span className={item}>{c}</span>
      ))}
    </span>
  );
};
