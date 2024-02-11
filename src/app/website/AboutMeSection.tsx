import clsx from "clsx";
import * as React from "react";
import styles from "./website.module.css";
import styles2 from "./AboutMeSection.module.css";
export const AboutMeSection = (): JSX.Element => {
  return (
    <section
      id="about-me"
      className={clsx(styles.sectionMainpage, styles.sectionVisualTwo)}
    >
      <header>About Me</header>
      <div className={styles2.sectionAboutMeContainer}>
        <div className={styles2.sectionAboutMeContainerContent}>
          <h5>Polyvalent</h5>
          <p>
            I adjust rapidly and efficiently to any environment. The proof is in
            my life. I have relocated from a French world to an English one.
            Changing countries and leaving my comfort zone to embrace new ones.
            At the same time, I moved between many teams and projects while
            being promoted continuously. I had to learn new technologies quickly
            and be efficient within a few days. As a result, I am rising from
            top companies to incredible ones while moving across the United
            States.
          </p>
        </div>

        <div className={styles2.sectionAboutMeContainerContent}>
          <h5>Leader</h5>
          <p>
            In every position, I took the lead to improve the current situation
            or put practices in place with the people around me. I am not a loud
            talker, but I regularly bring pieces to every system for a final
            result that could benefit every engineer and company. I cannot stay
            in place and do the minimum -- I am naturally an entrepreneur and
            want to innovate and push the limit of every assignment. I convey my
            love of efficiency to everyone who works with me and share as much
            as possible by presenting, emailing, or Slack any detail to bolster
            the team.
          </p>
        </div>

        <div className={styles2.sectionAboutMeContainerContent}>
          <h5>Doer</h5>
          <p>
            Expert in doing: think, plan, and execute. I design and write just
            enough to have the team understand the direction and lift apparent
            impediments. I master balancing analyzing and coding, giving me a
            steady delivery cadence. I polish user interfaces gradually while
            bringing more features that, with time, create the best experience
            for the user. Same for performance, usability, and tests: iterating
            is the key to success. I introduce a "wow" factor and innovations to
            surpass expectations at every step.
          </p>
        </div>

        <div className={styles2.sectionAboutMeContainerContent}>
          <h5>Naturally Initiative Seeker</h5>
          <p>
            My innate nature gave me the quality to find solutions to any
            problems. My experiences, motivation, and capability to learn fast
            are handy for zooming my way into fixing any existing codebase. It
            is the same with engineering solutions that require adjustment
            quickly or when facing a customer's challenging requirements.
          </p>
        </div>

        <div className={styles2.sectionAboutMeContainerContent}>
          <h5>Sharer</h5>
          <p>
            While performing my main tasks, I thrive on discovering initiatives
            to improve my team and the products. In addition, I am known to
            communicate visually and often by creating web prototypes rapidly.
          </p>
        </div>

        <div className={styles2.sectionAboutMeContainerContent}>
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
