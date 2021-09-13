import * as React from "react";
import {
  sectionFixedWitdhContent,
  cardFixedWidthImage,
} from "./index.module.css";
export interface CardFixedWidthProps {
  title: string;
  description: string;
  link: string;
  image: JSX.Element
}
export const CardFixedWidth = (props: CardFixedWidthProps): JSX.Element => {
  return (
    <div className={sectionFixedWitdhContent}>
      <h5>{props.title}</h5>
      <p className={cardFixedWidthImage}>{props.image}</p>
      <p>{props.description}</p>
      <p>
        <a href={props.link} target="_blank">
          Link
        </a>
      </p>
    </div>
  );
};
