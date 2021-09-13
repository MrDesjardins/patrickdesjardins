import "@fontsource/open-sans";
import "@fontsource/oswald";
import clsx from "clsx";
import { StaticImage } from "gatsby-plugin-image";
import * as React from "react";
import {
  sectionMainpage,
  sectionVisualOne,
  video,
  videoContainer,
  firstVideo,
} from "./index.module.css";
export const ConferencesSection = (): JSX.Element => {
  return (
    <section
      id="conferences"
      className={clsx(sectionMainpage, sectionVisualOne)}
    >
      <header>CONFERENCES</header>
      <h3>Limited list with public recorded presentation only</h3>
      <div className={firstVideo}>
        <div>Croatia 2018, Split Conference</div>
        <div className={videoContainer}>
          <iframe
            className={video}
            src="https://www.youtube.com/embed/QWtNhelMv-k?rel=0&amp;controls=1&amp;showinfo=0"
            allow="autoplay; encrypted-media"
          ></iframe>
        </div>
      </div>
    </section>
  );
};
