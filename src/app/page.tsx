import Image from "next/image";
import styles from "./layout.module.css";
import { AboutMeSection } from "./website/AboutMeSection";
import { AchievementsSection } from "./website/AchievementsSection";
import { BookSection } from "./website/BookSection";
import { ConferencesSection } from "./website/ConferencesSection";
import { ContactSection } from "./website/ContactsSection";
import { EducationSection } from "./website/EducationSection";
import { HistorySection } from "./website/HistorySection";
import { CourseSection } from "./website/CourseSection";

import { OpenSourceSection } from "./website/OpenSourceSection";
import { StatisticsSection } from "./website/StatisticsSection";
import { TechnologiesSection } from "./website/TechnologiesSection";
import { WorkSection } from "./website/WorkSection";
import Link from "next/link";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Patrick Desjardins Website and Blog",
  description: "Patrick Desjardins Website and Blog",
};
export default function Index(): React.ReactElement {
  return (
    <div className={styles.container}>
      <main>
        <nav className={styles.topMenu}>
          <header className={styles.topHeader}>
            <Link className={styles.topHeaderMyName} href="/">
              Patrick Desjardins
            </Link>

            <a href="#about-me" className={styles.topHeaderAnchorLink}>
              About Me
            </a>
            <a href="#work" className={styles.topHeaderAnchorLink}>
              Works
            </a>
            <a href="#technologies" className={styles.topHeaderAnchorLink}>
              Technologies
            </a>
            <a href="#achievements" className={styles.topHeaderAnchorLink}>
              Achievements
            </a>
            <a href="#experiences" className={styles.topHeaderAnchorLink}>
              Experiences
            </a>
            <a href="#past" className={styles.topHeaderAnchorLink}>
              Past
            </a>
            <a href="#conferences" className={styles.topHeaderAnchorLink}>
              Conferences
            </a>
            <a href="#contact" className={styles.topHeaderAnchorLink}>
              Contact
            </a>

            <Link href="/blog" className={styles.topHeaderBlog}>
              Blog
            </Link>
          </header>
        </nav>

        <div className={styles.wrapper}>
          <div className={styles.textOnPicture}>
            <div className={styles.homeContent}>
              <h1>
                Patrick<strong>Desjardins</strong>
              </h1>
              <p className={styles.homeContentTitles}>
                Roblox Principal Software Engineer
                <br />
                Formerly Netflix/Jump Trading/Microsoft/Adobe
              </p>
            </div>
          </div>
          <div className={styles.imageWrapper}>
            <Image
              priority={true}
              className={styles.topPicture}
              alt="Patrick Desjardins sitting at Netflix Building F"
              src="/images/backgrounds/patrickdesjardinsatnetflix.jpg"
              fill
              style={{
                objectFit: "cover",
              }}
            />
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
}
