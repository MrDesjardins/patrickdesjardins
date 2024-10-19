import clsx from "clsx";
import styles from "./website.module.css";
import styles2 from "./EducationSection.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGraduationCap,
  faCertificate,
} from "@fortawesome/free-solid-svg-icons";
export const EducationSection = (): React.ReactElement => {
  return (
    <section
      id="education"
      className={clsx(
        styles.sectionMainpage,
        styles.sectionVisualTwo,
        styles2.educationSection,
      )}
    >
      <header>Education</header>
      <div className={styles.sectionFixedWitdh}>
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
          <li>
            <FontAwesomeIcon icon={faCertificate} />
            <p>26 Plurasight and Udemy Classes</p>
          </li>
          <li>
            <FontAwesomeIcon icon={faCertificate} />
            <p>10 Microsoft Certifications</p>
          </li>
        </ul>
      </div>
    </section>
  );
};
