import clsx from "clsx";
import { StaticImage } from "gatsby-plugin-image";
import * as React from "react";
import {
  sectionMainpage,
  sectionVisualOne,
  sectionVisualOneSubHeader,
  sectionFixedWitdh,
  cardFixedWidthImageImg,
} from "./index.module.css";
import { CardFixedWidth } from "./CardFixedWidth";
export const WorkSection = (): JSX.Element => {
  return (
    <section id="work" className={clsx(sectionMainpage, sectionVisualOne)}>
      <header>My Work</header>
      <div className={sectionVisualOneSubHeader}>
        An excerpt of some of my works from the last few years. See resume for
        full entries
      </div>
      <h3>Professional Application</h3>
      <div className={sectionFixedWitdh}>
        <CardFixedWidth
          title="Netflix - Partner Portal"
          description="Open Connect ISP partners with embedded Open Connect Appliances
      (OCAs) can use the Open Connect Partner Portal to do some basic
      monitoring of the appliances in their network and some other
      administrative tasks. Created and responsible for the whole
      portal."
          link="https://openconnect.netflix.com/en/partner-portal/"
          image={
            <StaticImage
              className={cardFixedWidthImageImg}
              alt="Screenshot of Netflix"
              src="../images/portfolio/netflix.jpg"
            />
          }
        />

        <CardFixedWidth
          title="Microsoft - Teams Web App"
          description="Developed in Microsoft Teams web application pre-release and
      post-release version 1. Responsible for the notifications and
      feeds."
          link="https://teams.microsoft.com/"
          image={
            <StaticImage
              className={cardFixedWidthImageImg}
              alt="Screenshot of Microsoft Teams"
              src="../images/portfolio/microsoftteam.jpg"
            />
          }
        />

        <CardFixedWidth
          title="Microsoft - VSTS Delivery Timeline"
          description="Leader for the front-end of the page named Delivery Timeline
      Plan which was the first page built entirely in React and Flux.
      Heavily optimized to support thousand of complex components with
      virtual scrolling and lazy loading."
          link="https://marketplace.visualstudio.com/items?itemName=ms.vss-plans"
          image={
            <StaticImage
              className={cardFixedWidthImageImg}
              alt="Screenshot of Microsoft Visual Studio Delivery Timeline"
              src="../images/portfolio/vstsplan.jpg"
            />
          }
        />

        <CardFixedWidth
          title="Microsoft - VSTS Dashboard"
          description="Main developer on the rebuilt of VSTS Dashboard. Responsible to
      create to implement the grid system, the concept of the edit
      mode, the blade menu for configurations and catalog of widgets.
      Worked on the third-party SDK as well as creating few widgets."
          link="https://www.visualstudio.com/en-us/docs/report/dashboards"
          image={
            <StaticImage
              className={cardFixedWidthImageImg}
              alt="Screenshot of Microsoft Visual Studio Dashboard"
              src="../images/portfolio/vstsdashboard.jpg"
            />
          }
        />

        <CardFixedWidth
          title="Microsoft - MSDN"
          description="Part of the team that maintened MSDN.com. Participated to the
        recast of the editing system to be more open for external
        contributions."
          link="https://msdn.microsoft.com/en-us"
          image={
            <StaticImage
              className={cardFixedWidthImageImg}
              alt="Screenshot of Microsoft VSTS Dashboard"
              src="../images/portfolio/msdn.jpg"
            />
          }
        />

        <CardFixedWidth
          title="CDPQ - CMG"
          description="Developing the whole application architecture, acting as a team leader for the team and coding critical part of the software. Private web application to handle the management of financial assets."
          link="https://www.cdpq.com/en/home"
          image={
            <StaticImage
              className={cardFixedWidthImageImg}
              alt="Screenshot of CDPQ"
              src="../images/portfolio/cdpq.jpg"
            />
          }
        />

        <CardFixedWidth
          title="CDPQ - DRT"
          description="Took the lead of an existing project by modernizing the user experience with drag and drop features and remove the dry CRUD website experience into a rich web application. Private web application to handle data, risks and transactions of billion of dollards."
          link="https://www.cdpq.com/en/home"
          image={
            <StaticImage
              className={cardFixedWidthImageImg}
              alt="Screenshot of CDPQ"
              src="../images/portfolio/cdpq.jpg"
            />
          }
        />

        <CardFixedWidth
          title="CDPQ - RDP"
          description="Advisor to guide the team with best practices for web and testings. Performance improvements and usability improvements of the existing system."
          link="https://www.cdpq.com/en/home"
          image={
            <StaticImage
              className={cardFixedWidthImageImg}
              alt="Screenshot of CDPQ"
              src="../images/portfolio/cdpq.jpg"
            />
          }
        />

        <CardFixedWidth
          title="Dynacom - Nutcache"
          description="I had the role of a Web expert for a team constituted of 6 developers for the whole 8 months. It was their first web project and I had to guide them for best practices for the architecture of the software but also with the use of Asp.Net MVC. I was the first resource for everything concerning Javascript and CSS"
          link="https://www.nutcache.com/"
          image={
            <StaticImage
              className={cardFixedWidthImageImg}
              alt="Screenshot of Nutcache"
              src="../images/portfolio/nutcache.jpg"
            />
          }
        />

        <CardFixedWidth
          title="Tenrox (Upland) - Timesheet.com"
          description="Working in many areas of the existing systems to improve features. Worked mainly in the visual graph that allowed to configure the flow of work."
          link="http://timesheet.com/"
          image={
            <StaticImage
              className={cardFixedWidthImageImg}
              alt="Screenshot of Tenrox TimeSheet"
              src="../images/portfolio/tenrox.jpg"
            />
          }
        />

        <CardFixedWidth
          title="StockVirtual.Com"
          description="Owner of StockVirtual.com which is a Asp.Net MVC, Entity Framework, Redis website hosted on Azure that has above 65 000 users that trade stocks in a safe virtualized environment. Thousands of unit tests, Application Insight for telemetry, Stride for transactions and SendGrid for email."
          link="http://stockvirtual.com/"
          image={
            <StaticImage
              className={cardFixedWidthImageImg}
              alt="Screenshot of StockVirtual.com"
              src="../images/portfolio/stockvirtual.jpg"
            />
          }
        />
      </div>
    </section>
  );
};
