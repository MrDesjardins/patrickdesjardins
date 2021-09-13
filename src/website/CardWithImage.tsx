import * as React from "react";
import {
  cardWithImageContainer,
  cardWithImageContainerImage,
  cardWithImageContainerText,
  cardFixedWidthImage,
} from "./index.module.css";
export interface CardWithImageProps {
  title: string;
  subtitle: string;
  description: string;
  image: JSX.Element;
}
export const CardWithImage = (props: CardWithImageProps): JSX.Element => {
  return (
    <div className={cardWithImageContainer}>
      <div className={cardWithImageContainerImage}>
        <p className={cardFixedWidthImage}>{props.image}</p>
      </div>
      <div className={cardWithImageContainerText}>
        <h5>{props.title}</h5>
        <h6>{props.subtitle}</h6>
        <p>{props.description}</p>
      </div>
    </div>
  );
};
