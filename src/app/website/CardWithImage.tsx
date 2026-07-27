import styles from "./website.module.css";
import styles2 from "./CardWithImage.module.css";

export interface CardWithImageProps {
  title: string;
  subtitle: string;
  description: string;
  image: React.ReactElement;
}
export const CardWithImage = (
  props: CardWithImageProps,
): React.ReactElement => {
  return (
    <div className={styles2.cardWithImageContainer}>
      <div className={styles2.cardWithImageContainerImage}>
        <p className={styles.cardFixedWidthImage}>{props.image}</p>
      </div>
      <div className={styles2.cardWithImageContainerText}>
        <h3>{props.title}</h3>
        <h4>{props.subtitle}</h4>
        <p>{props.description}</p>
      </div>
    </div>
  );
};
