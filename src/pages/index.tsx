import "@fontsource/open-sans";
import "@fontsource/oswald";
import { Link } from "gatsby";
import { StaticImage } from "gatsby-plugin-image";
import * as React from "react";
import { AboutMeSection } from "../website/AboutMeSection";
import { AchievementsSection } from "../website/AchievementsSection";
import { BookSection } from "../website/BookSection";
import { ConferencesSection } from "../website/ConferencesSection";
import { ContactSection } from "../website/ContactsSection";
import { EducationSection } from "../website/EducationSection";
import { HistorySection } from "../website/HistorySection";
import { CourseSection } from "../website/CourseSection";
import {
  container,
  homeContent,
  homeContentTitles,
  textOnPicture,
  topHeader,
  topHeaderAnchorLink,
  topHeaderBlog,
  topHeaderMyName,
  topMenu,
  topPicture,
} from "../website/index.module.css";
import { OpenSourceSection } from "../website/OpenSourceSection";
import { StatisticsSection } from "../website/StatisticsSection";
import { TechnologiesSection } from "../website/TechnologiesSection";
import { WorkSection } from "../website/WorkSection";

const IndexPage = (): JSX.Element => {
  return (
    <div className={container}>
      <title>Patrick Desjardins</title>
      <main>
        <nav className={topMenu}>
          <header className={topHeader}>
            <Link className={topHeaderMyName} to="/">
              Patrick Desjardins
            </Link>

            <a href="#about-me" className={topHeaderAnchorLink}>
              About Me
            </a>
            <a href="#work" className={topHeaderAnchorLink}>
              Works
            </a>
            <a href="#technologies" className={topHeaderAnchorLink}>
              Technologies
            </a>
            <a href="#achievements" className={topHeaderAnchorLink}>
              Achievements
            </a>
            <a href="experiences" className={topHeaderAnchorLink}>
              Experiences
            </a>
            <a href="#past" className={topHeaderAnchorLink}>
              Past
            </a>
            <a href="#conferences" className={topHeaderAnchorLink}>
              Conferences
            </a>
            <a href="#contact" className={topHeaderAnchorLink}>
              Contact
            </a>

            <Link to="/blog" className={topHeaderBlog}>
              Blog
            </Link>
          </header>
        </nav>

        <div className="home-wrapper">
          <div className={textOnPicture}>
            <div className={homeContent}>
              <h1>
                Patrick<strong>Desjardins</strong>
              </h1>
              <p className={homeContentTitles}>
                Netflix Senior Software Engineer
                <br />
                Formerly Microsoft Senior Software Engineer
              </p>
            </div>
          </div>
          <div className="home-photo">
            <StaticImage
              className={topPicture}
              alt="Patrick Desjardins sitting at Netflix Building F"
              src="../images/backgrounds/patrickdesjardinsatnetflix.jpg" />
          </div>
        </div>
        <AboutMeSection />
        <WorkSection />
        <BookSection />
        <OpenSourceSection />
        <TechnologiesSection />
        <CourseSection />
        <AchievementsSection />
        <StatisticsSection />
        <EducationSection />
        <HistorySection />
        <ConferencesSection />
        <ContactSection />
      </main>
    </div>
  );
};
export default IndexPage;
