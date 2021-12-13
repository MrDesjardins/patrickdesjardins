import clsx from "clsx";
import { StaticImage } from "gatsby-plugin-image";
import * as React from "react";
import {
  sectionMainpage,
  sectionVisualOne,
  sectionFixedWitdh,
  cardFixedWidthImageImg,
} from "../website/index.module.css";
import { CardFixedWidth } from "./CardFixedWidth";
export const OpenSourceSection = (): JSX.Element => {
  return (
    <section
      id="open-source"
      className={clsx(sectionMainpage, sectionVisualOne)}
    >
      <header>Open Source</header>
      <div className={sectionFixedWitdh}>
        <CardFixedWidth
          title="TypeScript Hilbert Curve"
          description="Main maintainer. TypeScript implementation of the Hilbert Curve algorithm. The project contains Github workflow that build the project for CommonJS and EcmaScript, has a matrix of NodeJS/OS version, unit tests and performance tests."
          link="https://github.com/MrDesjardins/hilbert-curve-ts/"
          image={
            <StaticImage
              className={cardFixedWidthImageImg}
              alt="Screenshot of the a 2d representation of a third order Hilbert Curve"
              src="../images/portfolio/hilbertcurve.png"
            />
          }
        />
        <CardFixedWidth
          title="Data Access Gateway Chrome Extension"
          description="Main maintainer. The goal of this Chrome Extension is to receive statistics about how the data is fetched and saved by the library. Build with TypeScript."
          link="https://github.com/MrDesjardins/dataaccessgatewaychromeextension"
          image={
            <StaticImage
              className={cardFixedWidthImageImg}
              alt="Screenshot of the Chrome extension for the Data Access gateway"
              src="../images/portfolio/dagextension.jpg"
            />
          }
        />
        <CardFixedWidth
          title="Data Access Gateway"
          description="Main maintainer. The goal of this TypeScript/JavaScript library is to provide a tiny abstraction to cache data when performing remote HTTP(s) API calls. It eases the request by caching the data in memory and/or in the browser memory with a limited set of options. The cache works with two levels of cache: the first one is a memory cache and the second use IndexDB as a persistent cache."
          link="https://github.com/MrDesjardins/dataaccessgateway"
          image={
            <StaticImage
              className={cardFixedWidthImageImg}
              alt="Screenshot of a UML diagram of the Data Access Gateway library"
              src="../images/portfolio/daglib.jpg"
            />
          }
        />
      </div>
    </section>
  );
};
