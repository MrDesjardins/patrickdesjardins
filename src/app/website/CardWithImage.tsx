import styles from "./website.module.css";
import styles2 from "./CardWithImage.module.css";

export interface CardWithImageProps {
  title: string;
  subtitle: string;
  description: string;
  image: JSX.Element;
}
export const CardWithImage = (props: CardWithImageProps): JSX.Element => {
  return (
    <div className={styles2.cardWithImageContainer}>
      <div className={styles2.cardWithImageContainerImage}>
        <p className={styles.cardFixedWidthImage}>{props.image}</p>
      </div>
      <div className={styles2.cardWithImageContainerText}>
        <h5>{props.title}</h5>
        <h6>{props.subtitle}</h6>
        <p>{props.description}</p>
      </div>
    </div>
  );
};
