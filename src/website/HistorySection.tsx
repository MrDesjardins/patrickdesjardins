import "@fontsource/open-sans";
import "@fontsource/oswald";
import clsx from "clsx";
import * as React from "react";
import {
  historyOverlay,
  historyOverlayColumn1,
  historyOverlayColumn2,
  historyContainerBackground,
  sectionMainpage,
  sectionVisualTwo,
} from "./index.module.css";
export const HistorySection = (): JSX.Element => {
  return (
    <section
      id="past"
      className={clsx(
        sectionMainpage,
        sectionVisualTwo,
        historyContainerBackground
      )}
    >
      <div className={historyOverlay}>
        <div className={historyOverlayColumn1}>
          <header>Past and Present</header>
          <p>
            During elementary and high school I did competitive karate and won
            more than 250 prizes over 9 years. Finish twice second in Germany in
            1990 in the world championship. I continued my scholarship with
            three years in Montreal CEGEP in computer science and followed with
            four years at the University named École de Technologie Supérieur
            (ETS). During these years I worked on many side projects and always
            been a top performer. One of my side projects became a small venture
            and grew to above 65 000 users.
          </p>
          <p>
            Mid part of University, I developed for few companies where I could
            use my web expertise to help a variety of software written in many
            languages like Asp, Asp.Net, Asp.Net MVC and I was a strong advocate
            to make website cross-browser wich the arrival of JQuery helped the
            whole process.
          </p>
        </div>
        <div className={historyOverlayColumn2}>
          <p>
            I continued doing formation and got my Microsoft Certified
            Professional Developer (MCPD) et Microsoft Certified Solutions
            Developer (MCSD). The more the years advanced, the less I was doing
            VB or PHP or Java and the more I was touching C#, Net, Entity
            Framework and JavaScript.
          </p>
          <p>
            In 2013, I became one of the sixth Canadian to be a Microsoft MVP in
            Asp.Net/IIS. A title that I got for two years in a row until I left
            Montreal to dwell in Redmond (WA) to work for Microsoft for three
            years. In 2017, I moved to Silicon Valley to join Netflix as a
            senior software engineer, bringing my React, Redux, TypeScript
            expertise into a brand new system that Netflix's partner uses to
            help to carry a third of the worldwide bandwidth. In parallel, I
            started a master degree in machine learning at Georgia Tech
            University, maintain few open source projects, and I deliver
            presentations at conferences.
          </p>
        </div>
      </div>
    </section>
  );
};
