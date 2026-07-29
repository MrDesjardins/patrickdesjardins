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
  /**
   * Base path the category links point to. Defaults to the technical blog
   * (`/blog/category`); philosophy essays pass `/philosophy/category` so their
   * category links resolve to statically generated philosophy pages.
   */
  basePath?: string;
}
export const BlogCategories = (
  props: BlogCategoriesProps,
): React.ReactElement => {
  const basePath = props.basePath ?? "/blog/category";
  return (
    <span className={styles.container}>
      {(props.categories ?? [])?.map((c) => (
        <Link
          key={c}
          className={styles.item}
          href={`${basePath}/${categorySlug(c)}`}
        >
          {c}
        </Link>
      ))}
    </span>
  );
};
