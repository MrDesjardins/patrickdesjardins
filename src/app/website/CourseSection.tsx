import clsx from "clsx";
import { CardFixedWidth } from "./CardFixedWidth";
import styles from "./website.module.css";
import Image from "next/image";
export const CourseSection = (): JSX.Element => {
  return (
    <section id="course" className={clsx(styles.sectionMainpage, styles.sectionVisualOne)}>
      <header>Courses</header>
      <div className={styles.sectionFixedWitdh}>
        <CardFixedWidth
          title="Youtube Channel on TypeScript"
          description="Weekly episode on many series like gRPC, GraphQL, TypeScript and more web developments"
          link="https://www.youtube.com/channel/UCKBBbMaq3Q-MirzMecdJZCQ"
          image={
            <Image
              className={styles.cardFixedWidthImageImg}
              alt="Screenshot of me"
              src="/images/portfolio/youtube.jpg"
              width={350}
              height={350}
            />
          }
        />
        <CardFixedWidth
          title="Learn TypeScript"
          description="If you’re looking to move beyond vanilla JavaScript and take your skills to the next level, then you’ve come to the right place. TypeScript is an in-demand language that sits on top of JavaScript. That means you can do everything you can in JavaScript with TypeScript, but also enjoy countless other perks including support for JS libraries, NPM, static typing, and much more."
          link="http://typescriptbook.com/"
          image={
            <Image
              className={styles.cardFixedWidthImageImg}
              alt="Screenshot of the online course"
              src="/images/portfolio/course3.jpg"
              width={350}
              height={350}
            />
          }
        />
        <CardFixedWidth
          title="Building Pro Web Apps with TypeScript"
          description="In-depth content balanced with tutorials that put the theory into practice. The focus of this course is on giving you both the understanding and the practical examples that will allow you indulge in the art web development with TypeScript 2.x while taking you through core programming concepts."
          link="https://www.packtpub.com/application-development/building-pro-web-apps-typescript-2x-video"
          image={
            <Image
              className={styles.cardFixedWidthImageImg}
              alt="Screenshot of the online course"
              src="/images/portfolio/course2.jpg"
              width={350}
              height={350}
            />
          }
        />

        <CardFixedWidth
          title="Rapid Web Application with Typescript "
          description="A fast-paced guide that will take you on a journey through the various new features of TypeScript, with the help of real-world, practical videos that show you how to dive right into web application development using TypeScript’s essential."
          link="https://www.packtpub.com/application-development/rapid-web-application-development-typescript-2x-video"
          image={
            <Image
              className={styles.cardFixedWidthImageImg}
              alt="Screenshot of the online course"
              src="/images/portfolio/course1.jpg"
              width={350}
              height={350}
            />
          }
        />
      </div>
    </section>
  );
};
