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
          title="TypeScript Real Time Pixel"
          description="Main maintainer. Docker containers of a SolidJS frontend server and a NodeJS Socker.IO server for a small realtime pixel game where users place pixel to create image."
          link="https://github.com/MrDesjardins/realtimepixel"
          image={
            <StaticImage
              className={cardFixedWidthImageImg}
              alt="Screenshot of the realtime pixel game"
              src="../images/portfolio/realtimepixelgame.png"
            />
          }
        />
        <CardFixedWidth
          title="Gym Water Application"
          description="Main maintainer. SolidJS frontend application that communicate to a backend to change a Raspberri Pi GPIO pin to turn on/off a water pump. The project goals was to provide a user interface to a system that would automatically adjust weight using water for a home gym pulley system."
          link="https://github.com/MrDesjardins/gym-water-app"
          image={
            <StaticImage
              className={cardFixedWidthImageImg}
              alt="Screenshot of a workout screen of the gym app"
              src="../images/portfolio/gym-water-dev-panel.png"
            />
          }
        />
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
