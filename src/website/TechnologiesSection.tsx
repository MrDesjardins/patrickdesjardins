import "@fontsource/open-sans";
import "@fontsource/oswald";
import clsx from "clsx";
import { StaticImage } from "gatsby-plugin-image";
import * as React from "react";
import { CardWithImage } from "./CardWithImage";
import {
  sectionMainpage,
  sectionVisualTwo,
  technologiesColumn,
} from "./index.module.css";
export const TechnologiesSection = (): JSX.Element => {
  return (
    <section
      id="technologies"
      className={clsx(sectionMainpage, sectionVisualTwo)}
    >
      <header>Technologies</header>
      <div className={technologiesColumn}>
        <CardWithImage
          title="Web Framework"
          subtitle="JavaScript, JQuery, Angular, React, Flux, Redux"
          description="I have built a dozen of web applications and web sites with many technologies. From classic ASP, to PHP, to ASP.NET with form or MVC I have embraced many eras where Internet Explorer was king and dethroned by Firefox and now Chrome. I built websites with custom frameworks to the most popular and recent with Angular and React."
          image={
            <StaticImage
              alt="Screenshot of Netflix"
              src="../images/icon_pencil.png"
            />
          }
        />

        <CardWithImage
          title="TypeScript and C#"
          subtitle="Professional TypeScript and C# developer"
          description="I have been writing C# for more than a decade and recently have focused mostly in TypeScript on many different scale project from few developers to almost a thousand. I love how TypeScript enhances JavaScript to be more efficient and reduce errors. I've been doing internal formation, created online classes and wrote many posts on the subject."
          image={
            <StaticImage
              alt="Screenshot of Netflix"
              src="../images/icon_star.png"
            />
          }
        />

        <CardWithImage
          title="AZURE AND AWS"
          subtitle="Develop but also deploy!"
          description="I have many Linux VPS around the worlds but moved in the last few years on Azure. Recently I had to touch AWS as well. Not only it's easier, faster but it also encourages better practice to separate systems to be more resilient."
          image={
            <StaticImage
              alt="Screenshot of Netflix"
              src="../images/icon_cloud.png"
            />
          }
        />

        <CardWithImage
          title="GraphQL"
          subtitle="Server and Client"
          description="I created many GraphQL servers that are leveraging backend technologies like gRPC and Protobug to generate TypeScript automatically. A firm believer that GraphQL improves the velocity of the consumers of the information for web applications and scripts."
          image={
            <StaticImage
              alt="Screenshot of Netflix"
              src="../images/icon_rocket.png"
            />
          }
        />

        <CardWithImage
          title="FLUENT IN MANY SYSTEMS"
          subtitle="Windows or Mac, VSTS or Jira/Atlassian, it does not matter"
          description="I have been working mostly with Microsoft technologies but have experience on other systems. I am a fast learner, and even under high pressure like at Netflix, I was able to switch from a Windows to Mac environment within a few days. I am also quick to do 180 degrees. Configuring VSTS, or Jenkins or accessing third-party API is not an issue."
          image={
            <StaticImage
              alt="Screenshot of Netflix"
              src="../images/icon_building.png"
            />
          }
        />
      </div>
    </section>
  );
};
