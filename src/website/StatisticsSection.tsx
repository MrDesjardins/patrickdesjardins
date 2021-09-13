import "@fontsource/open-sans";
import "@fontsource/oswald";
import clsx from "clsx";
import { StaticImage } from "gatsby-plugin-image";
import * as React from "react";
import {
  sectionMainpage,
  sectionVisualOne,
  statisticContainer,
  statisticContainerCard,
} from "./index.module.css";
export const StatisticsSection = (): JSX.Element => {
  return (
    <section
      id="statistics"
      className={clsx(sectionMainpage, sectionVisualOne)}
    >
      <div className={statisticContainer}>
        <div className={statisticContainerCard}>
          <div className="counterup-photo">
            <StaticImage
              alt="Screenshot of the book TypeScript Quick Start"
              src="../images/counterup/1.png"
            />
          </div>
          <div className="counterup-content">
            <h5 className="count-number">12</h5>
            <h6>Compagnies</h6>
          </div>
        </div>

        <div className={statisticContainerCard}>
          <div className="counterup-photo">
            <StaticImage
              alt="Screenshot of the book TypeScript Quick Start"
              src="../images/counterup/2.png"
            />
          </div>
          <div className="counterup-content">
            <h5 className="count-number">18</h5>
            <h6>Years of programming</h6>
          </div>
        </div>

        <div className={statisticContainerCard}>
          <div className="counterup-photo">
            <StaticImage
              alt="Screenshot of the book TypeScript Quick Start"
              src="../images/counterup/3.png"
            />
          </div>
          <div className="counterup-content">
            <h5 className="count-number">26</h5>
            <h6>Projects finished</h6>
          </div>
        </div>

        <div className={statisticContainerCard}>
          <div className="counterup-photo">
            <StaticImage
              alt="Screenshot of the book TypeScript Quick Start"
              src="../images/counterup/4.png"
            />
          </div>
          <div className="counterup-content">
            <h5 className="count-number">642</h5>
            <h6>
              <a href="http://patrickdesjardins.com/blog/">Blog</a> Articles
            </h6>
          </div>
        </div>
      </div>
    </section>
  );
};
