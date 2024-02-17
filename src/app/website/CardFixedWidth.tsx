import styles from "./website.module.css";
export interface CardFixedWidthProps {
  title: string;
  description: string;
  link: string;
  image: JSX.Element;
}
export const CardFixedWidth = (
  props: CardFixedWidthProps,
): React.ReactElement => {
  return (
    <div className={styles.sectionFixedWitdhContent}>
      <h5>{props.title}</h5>
      <p className={styles.cardFixedWidthImage}>{props.image}</p>
      <p>{props.description}</p>
      <p>
        <a href={props.link} target="_blank" rel="noopener noreferrer">
          Link
        </a>
      </p>
    </div>
  );
};
