import styles from "./BlogCategories.module.css";
import Link from "next/link";

export function categorySlug(category: string): string {
  return category
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export interface BlogCategoriesProps {
  categories?: string[];
}
export const BlogCategories = (
  props: BlogCategoriesProps,
): React.ReactElement => {
  return (
    <span className={styles.container}>
      {(props.categories ?? [])?.map((c) => (
        <Link
          key={c}
          className={styles.item}
          href={`/blog/category/${categorySlug(c)}`}
        >
          {c}
        </Link>
      ))}
    </span>
  );
};
