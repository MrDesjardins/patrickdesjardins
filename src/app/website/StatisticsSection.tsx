import clsx from "clsx";
import styles from "./website.module.css";
import styles2 from "./StatisticsSection.module.css";
import Image from "next/image";
import { countBlogArticles } from "../../_utils/file";
import Link from "next/link";
export const StatisticsSection = (): React.ReactElement => {
  const blogCount = countBlogArticles();
  return (
    <section
      id="experiences"
      className={clsx(styles.sectionMainpage, styles.sectionVisualOne)}
    >
      <div className={styles2.statisticContainer}>
        <div className={styles2.statisticContainerCard}>
          <div className="counterup-photo">
            <Image
              alt="Screenshot of the book TypeScript Quick Start"
              src="/images/counterup/1.png"
              width={65}
              height={65}
            />
          </div>
          <div className="counterup-content">
            <h5 className="count-number">13</h5>
            <h6>Compagnies</h6>
          </div>
        </div>

        <div className={styles2.statisticContainerCard}>
          <div className="counterup-photo">
            <Image
              alt="Screenshot of the book TypeScript Quick Start"
              src="/images/counterup/2.png"
              width={65}
              height={65}
            />
          </div>
          <div className="counterup-content">
            <h5 className="count-number">
              {new Date().getFullYear() - 2004 + 1}
            </h5>
            <h6>Years of programming</h6>
          </div>
        </div>

        <div className={styles2.statisticContainerCard}>
          <div className="counterup-photo">
            <Image
              alt="Screenshot of the book TypeScript Quick Start"
              src="/images/counterup/3.png"
              width={65}
              height={65}
            />
          </div>
          <div className="counterup-content">
            <h5 className="count-number">28</h5>
            <h6>Projects finished</h6>
          </div>
        </div>

        <div className={styles2.statisticContainerCard}>
          <div className="counterup-photo">
            <Image
              alt="Screenshot of the book TypeScript Quick Start"
              src="/images/counterup/4.png"
              width={65}
              height={65}
            />
          </div>
          <div className="counterup-content">
            <h5 className="count-number">{blogCount}</h5>
            <h6>
              <Link href="/blog">Blog</Link>&nbsp; Articles
            </h6>
          </div>
        </div>
      </div>
    </section>
  );
};
