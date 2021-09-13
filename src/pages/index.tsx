import * as React from "react";
import {
  container,
  topHeader,
  topHeaderMyName,
  topHeaderBlog,
  topMenu,
  homeContent,
  homeContentTitles,
  textOnPicture,
  topPicture,
  topHeaderAnchorLink,
  sectionMainpage,
  sectionAboutMe,
  sectionAboutMeContainer,
  sectionAboutMeContainerContent,
  sectionVisualOne,
  sectionVisualOneSubHeader,
  sectionFixedWitdh,
  cardFixedWidthImageImg,
  cardFixedWidthImage,
} from "../website/index.module.css";
import { StaticImage } from "gatsby-plugin-image";
import { Link } from "gatsby";
import "@fontsource/oswald";
import "@fontsource/open-sans";
import clsx from "clsx";
import { CardFixedWidth } from "../website/CardFixedWidth";
import { WorkSection } from "../website/WorkSection";
import { AboutMeSection } from "../website/AboutMeSection";
import { BookSection } from "../website/BookSection";
import { OpenSourceSection } from "../website/OpenSourceSection";
import { TechnologiesSection } from "../website/TechnologiesSection";
import { AchievementsSection } from "../website/AchievementsSection";
import { StatisticsSection } from "../website/StatisticsSection";
import { EducationSection } from "../website/EducationSection";
import { HistorySection } from "../website/HistorySection";
import { ConferencesSection } from "../website/ConferencesSection";
import { ContactSection } from "../website/ContactsSection";

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
            <a href="#" className={topHeaderAnchorLink}>
              Technologies
            </a>
            <a href="#" className={topHeaderAnchorLink}>
              Achievements
            </a>
            <a href="#" className={topHeaderAnchorLink}>
              Skills
            </a>
            <a href="#" className={topHeaderAnchorLink}>
              Sharing
            </a>
            <a href="#" className={topHeaderAnchorLink}>
              Past
            </a>
            <a href="#" className={topHeaderAnchorLink}>
              Conferences
            </a>
            <a href="#" className={topHeaderAnchorLink}>
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
              src="../images/patrickdesjardinsatnetflix.jpg"
            />
          </div>
        </div>
        <AboutMeSection />
        <WorkSection />
        <BookSection />
        <OpenSourceSection />
        <TechnologiesSection />
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
