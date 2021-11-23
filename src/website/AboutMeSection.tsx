import "@fontsource/open-sans";
import "@fontsource/oswald";
import clsx from "clsx";
import * as React from "react";
import {
  sectionVisualTwo,
  sectionAboutMeContainer,
  sectionAboutMeContainerContent, sectionMainpage
} from "./index.module.css";
export const AboutMeSection = (): JSX.Element => {
  return (
    <section id="about-me" className={clsx(sectionMainpage, sectionVisualTwo)}>
      <header>About Me</header>
      <div className={sectionAboutMeContainer}>
        <div className={sectionAboutMeContainerContent}>
          <h5>Polyvalent</h5>
          <p>
            I adjust rapidly and efficiently to any environment. The proof is in
            my life. Relocated from a French’s world to an English one while
            changing country far from every anchor previously established. Moved
            between many teams and projects while being promoted continuously.
            Had to learn quickly new technologies and to be efficient within a
            few days. Rising from top companies to incredible ones while still
            moving across the United States.
          </p>
        </div>

        <div className={sectionAboutMeContainerContent}>
          <h5>Leader</h5>
          <p>
            In every position I was placed, I took the lead to improve the
            current situation or to put in place practices with the people
            around me. I am not a loud talker, but I bring pieces to every
            system at a regular pace to have a final result that could benefit
            every engineer as well as the company. I cannot stay in place and do
            the minimum -- I am naturally entrepreneur and want to innovate and
            push the limit of every assignment. I convey my love of performance
            to everyone who works with me and share as much as I can by
            presenting, emails or Slack any detail to bolster the team.
          </p>
        </div>

        <div className={sectionAboutMeContainerContent}>
          <h5>Doer</h5>
          <p>
            Expert in doing. Think, plan and execute. I design and write just
            enough to have the team understand the direction and to lift
            apparent impediments. I always have daily objectives and never jump
            in code until a first plan can be presented and then iterate. I
            master a balance between analyzing and coding, which allows me to
            have a steady delivery cadence. I polish user interfaces slowly
            while bringing more features that create the best experience for the
            user with time. Same for performance, usability, and tests:
            iterating is the key to success. At every step, I introduce a "wow"
            factor and innovations to go beyond expectation.
          </p>
        </div>

        <div className={sectionAboutMeContainerContent}>
          <h5>Naturally Initiative Seeker</h5>
          <p>
            While performing my main tasks, I thrive on discovering initiatives
            to improve my team and the products. I am known to quickly draft
            documentation to communicate ideas and to have working prototypes
            rapidly.
          </p>
        </div>

        <div className={sectionAboutMeContainerContent}>
          <h5>Sharer</h5>
          <p>
            I am naturally sharing my progress throughout my days to seek
            feedback and share the context of my decisions and progress. I share
            screenshots, video captures of my day-to-day work but also share
            nuggets of technology. The idea is to provide a constant stream of
            information that the team can strategically leverage.
          </p>
        </div>

        <div className={sectionAboutMeContainerContent}>
          <h5>Fast Pareto Practitioner</h5>
          <p>
            I lean toward simple and fast solutions with a preference to do the
            heavy 80% of the work using 20% of my time. I truly excel working on
            the breath instead of working in-depth. I prefer working iteratively
            to achieve the best solution over time.
          </p>
        </div>
      </div>
    </section>
  );
};
