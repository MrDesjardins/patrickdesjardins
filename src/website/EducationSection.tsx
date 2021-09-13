import "@fontsource/open-sans";
import "@fontsource/oswald";
import clsx from "clsx";
import { StaticImage } from "gatsby-plugin-image";
import * as React from "react";
import {
  sectionMainpage,
  sectionVisualTwo,
  sectionFixedWitdh,
  educationSection,
} from "./index.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGraduationCap,
  faCertificate,
} from "@fortawesome/free-solid-svg-icons";
export const EducationSection = (): JSX.Element => {
  return (
    <section
      id="education"
      className={clsx(sectionMainpage, sectionVisualTwo, educationSection)}
    >
      <header>Education</header>
      <div className={sectionFixedWitdh}>
        <ul>
          <li>
            <FontAwesomeIcon icon={faGraduationCap} />
            <p>
              Master Degree 4 years in Machine Learning at Georgia Tech
              (Atlanta, USA)
            </p>
          </li>
          <li>
            <FontAwesomeIcon icon={faGraduationCap} />
            <p>
              Bachelor Degree 4 years in Software Engineering at University ETS
              (Montreal, Canada)
            </p>
          </li>
          <li>
            <FontAwesomeIcon icon={faGraduationCap} />
            <p>Pre-University 3 years in Computer Science (Montreal, Canada)</p>
          </li>
          <li><FontAwesomeIcon icon={faCertificate} /><p>26 Plurasight and Udemy Classes</p></li>
          <li><FontAwesomeIcon icon={faCertificate} /><p>10 Microsoft Certificaftions</p></li>
        </ul>
      </div>
    </section>
  );
};
