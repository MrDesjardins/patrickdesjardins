import clsx from "clsx";
import * as React from "react";
import styles from "./website.module.css";
import Image from "next/image";
import { CardFixedWidth } from "./CardFixedWidth";
export const WorkSection = (): JSX.Element => {
  return (
    <section
      id="work"
      className={clsx(styles.sectionMainpage, styles.sectionVisualOne)}
    >
      <header>My Work</header>
      <div className={styles.sectionVisualOneSubHeader}>
        An excerpt of some of my works from the last few years. See resume for
        full entries
      </div>
      <h3>Professional Application</h3>
      <div className={styles.sectionFixedWitdh}>
        <CardFixedWidth
          title="Adobe - Adobe Express"
          description="Leading the content production engineering themes, which include smarter content experiences and scale external creator base for Adobe Express"
          link="https://www.adobe.com/express/"
          image={
            <Image
              className={styles.cardFixedWidthImageImg}
              alt="Screenshot of Adobe Express"
              src="/images/portfolio/adobeExpress.png"
              width={350}
              height={350}
            />
          }
        />

        <CardFixedWidth
          title="Jump Trading - Order Management System"
          description="Web application to handle US equity orders from quantitative researcher algorithms. The web application displays real-time orders to the trader. The traders manage orders using the system and can customize how to display the data using a custom-made dashboard system. The dashboard consists of widgets with customizable connections to push information from one to another for highly unique visualization tailored to each trader."
          link="https://www.jumptrading.com/"
          image={
            <Image
              className={styles.cardFixedWidthImageImg}
              alt="Screenshot of Jump Trading"
              src="/images/portfolio/jumpTrading.png"
              width={350}
              height={350}
            />
          }
        />

        <CardFixedWidth
          title="Netflix - Partner Portal"
          description="Open Connect ISP partners with embedded Open Connect Appliances
      (OCAs) can use the Open Connect Partner Portal to do some basic
      monitoring of the appliances in their network and some other
      administrative tasks. Created and responsible for the whole
      portal."
          link="https://openconnect.netflix.com/en/partner-portal/"
          image={
            <Image
              className={styles.cardFixedWidthImageImg}
              alt="Screenshot of Netflix"
              src="/images/portfolio/netflix.jpg"
              width={350}
              height={350}
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
            <Image
              className={styles.cardFixedWidthImageImg}
              alt="Screenshot of Microsoft Teams"
              src="/images/portfolio/microsoftteam.jpg"
              width={350}
              height={350}
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
            <Image
              className={styles.cardFixedWidthImageImg}
              alt="Screenshot of Microsoft Visual Studio Delivery Timeline"
              src="/images/portfolio/vstsplan.jpg"
              width={350}
              height={350}
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
            <Image
              className={styles.cardFixedWidthImageImg}
              alt="Screenshot of Microsoft Visual Studio Dashboard"
              src="/images/portfolio/vstsdashboard.jpg"
              width={350}
              height={350}
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
            <Image
              className={styles.cardFixedWidthImageImg}
              alt="Screenshot of Microsoft VSTS Dashboard"
              src="/images/portfolio/msdn.jpg"
              width={350}
              height={350}
            />
          }
        />

        <CardFixedWidth
          title="CDPQ - CMG"
          description="Developing the whole application architecture, acting as a team leader for the team and coding critical part of the software. Private web application to handle the management of financial assets."
          link="https://www.cdpq.com/en/home"
          image={
            <Image
              className={styles.cardFixedWidthImageImg}
              alt="Screenshot of CDPQ"
              src="/images/portfolio/cdpq.jpg"
              width={350}
              height={350}
            />
          }
        />

        <CardFixedWidth
          title="CDPQ - DRT"
          description="Took the lead of an existing project by modernizing the user experience with drag and drop features and remove the dry CRUD website experience into a rich web application. Private web application to handle data, risks and transactions of billion of dollards."
          link="https://www.cdpq.com/en/home"
          image={
            <Image
              className={styles.cardFixedWidthImageImg}
              alt="Screenshot of CDPQ"
              src="/images/portfolio/cdpq.jpg"
              width={350}
              height={350}
            />
          }
        />

        <CardFixedWidth
          title="CDPQ - RDP"
          description="Advisor to guide the team with best practices for web and testings. Performance improvements and usability improvements of the existing system."
          link="https://www.cdpq.com/en/home"
          image={
            <Image
              className={styles.cardFixedWidthImageImg}
              alt="Screenshot of CDPQ"
              src="/images/portfolio/cdpq.jpg"
              width={350}
              height={350}
            />
          }
        />

        <CardFixedWidth
          title="Dynacom - Nutcache"
          description="I had the role of a Web expert for a team constituted of 6 developers for the whole 8 months. It was their first web project and I had to guide them for best practices for the architecture of the software but also with the use of Asp.Net MVC. I was the first resource for everything concerning Javascript and CSS"
          link="https://www.nutcache.com/"
          image={
            <Image
              className={styles.cardFixedWidthImageImg}
              alt="Screenshot of Nutcache"
              src="/images/portfolio/nutcache.jpg"
              width={350}
              height={350}
            />
          }
        />

        <CardFixedWidth
          title="Tenrox (Upland) - Timesheet.com"
          description="Working in many areas of the existing systems to improve features. Worked mainly in the visual graph that allowed to configure the flow of work."
          link="http://timesheet.com/"
          image={
            <Image
              className={styles.cardFixedWidthImageImg}
              alt="Screenshot of Tenrox TimeSheet"
              src="/images/portfolio/tenrox.jpg"
              width={350}
              height={350}
            />
          }
        />

        <CardFixedWidth
          title="StockVirtual.Com"
          description="Owner of StockVirtual.com which is a Asp.Net MVC, Entity Framework, Redis website hosted on Azure that has above 65 000 users that trade stocks in a safe virtualized environment. Thousands of unit tests, Application Insight for telemetry, Stride for transactions and SendGrid for email."
          link="http://stockvirtual.com/"
          image={
            <Image
              className={styles.cardFixedWidthImageImg}
              alt="Screenshot of StockVirtual.com"
              src="/images/portfolio/stockvirtual.jpg"
              width={350}
              height={350}
            />
          }
        />
      </div>
    </section>
  );
};
