import styles from "./BlogCategories.module.css";
export interface BlogCategoriesProps {
  categories?: string[];
}
export const BlogCategories = (
  props: BlogCategoriesProps,
): React.ReactElement => {
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
