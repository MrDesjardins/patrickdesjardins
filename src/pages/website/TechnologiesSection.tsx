import "@fontsource/open-sans";
import "@fontsource/oswald";
import clsx from "clsx";
import * as React from "react";
import { CardWithImage } from "./CardWithImage";
import styles from "./website.module.css";
import styles2 from "./TechnologiesSection.module.css";
import Image from "next/image";
export const TechnologiesSection = (): JSX.Element => {
  const imageSize = 110;
  return (
    <section
      id="technologies"
      className={clsx(styles.sectionMainpage, styles.sectionVisualTwo)}
    >
      <header>Technologies</header>
      <div className={styles2.technologiesColumn}>
        <CardWithImage
          title="Web Framework"
          subtitle="JavaScript, JQuery, Angular, React, Flux, Redux"
          description="I have built a dozen of web applications and web sites with many technologies. From classic ASP, to PHP, to ASP.NET with form or MVC I have embraced many eras where Internet Explorer was king and dethroned by Firefox and now Chrome. I built websites with custom frameworks to the most popular and recent with Angular and React."
          image={
            <Image
              alt="Screenshot of Netflix"
              src="/images/icon_pencil.png"
              width={imageSize}
              height={imageSize}
            />
          }
        />

        <CardWithImage
          title="TypeScript and C#"
          subtitle="Professional TypeScript and C# developer"
          description="I have been writing C# for more than a decade and recently have focused mostly in TypeScript on many different scale project from few developers to almost a thousand. I love how TypeScript enhances JavaScript to be more efficient and reduce errors. I've been doing internal formation, created online classes and wrote many posts on the subject."
          image={
            <Image
              alt="Screenshot of Netflix"
              src="/images/icon_star.png"
              width={imageSize}
              height={imageSize}
            />
          }
        />

        <CardWithImage
          title="AZURE AND AWS"
          subtitle="Develop but also deploy!"
          description="I have many Linux VPS around the worlds but moved in the last few years on Azure. Recently I had to touch AWS as well. Not only it's easier, faster but it also encourages better practice to separate systems to be more resilient."
          image={
            <Image
              alt="Screenshot of Netflix"
              src="/images/icon_cloud.png"
              width={imageSize}
              height={imageSize}
            />
          }
        />

        <CardWithImage
          title="GraphQL"
          subtitle="Server and Client"
          description="I created many GraphQL servers that are leveraging backend technologies like gRPC and Protobuf to generate TypeScript automatically. A firm believer that GraphQL improves the velocity of the consumers of the information for web applications and scripts."
          image={
            <Image
              alt="Screenshot of Netflix"
              src="/images/icon_rocket.png"
              width={imageSize}
              height={imageSize}
            />
          }
        />

        <CardWithImage
          title="FLUENT IN MANY SYSTEMS"
          subtitle="Windows or Mac, VSTS or Jira/Atlassian, it does not matter"
          description="I have been working mostly with Microsoft technologies but have experience on other systems. I am a fast learner, and even under high pressure like at Netflix, I was able to switch from a Windows to Mac environment within a few days. I am also quick to do 180 degrees. Configuring VSTS, or Jenkins or accessing third-party API is not an issue."
          image={
            <Image
              alt="Screenshot of Netflix"
              src="/images/icon_building.png"
              width={imageSize}
              height={imageSize}
            />
          }
        />
      </div>
    </section>
  );
};
