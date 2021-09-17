import * as React from "react";
import { Link, useStaticQuery, graphql } from "gatsby";
import {
  container,
  heading,
  navLinks,
  navLinkItem,
  navLinkText,
  siteTitle,
  blogTopPicture,
} from "./layout.module.css";
import { StaticImage } from "gatsby-plugin-image";
import { URL_PER_YEAR } from "../../constants";
export const Layout = ({
  pageTitle,
  children,
}: {
  pageTitle: string;
  children: JSX.Element;
}): JSX.Element => {
  const data = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          title
        }
      }
    }
  `);
  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear; i >= 2011; i--) {
    years.push(i);
  }
  return (
    <div className={container}>
      <title>
        {pageTitle} | {data.site.siteMetadata.title}
      </title>
      <header className={siteTitle}>{data.site.siteMetadata.title}</header>
      <nav>
        <ul className={navLinks}>
          <li className={navLinkItem}>
            <Link className={navLinkText} to="/">
              Back to Main Page
            </Link>
            {years.map((y) => (
              <Link
                className={navLinkText}
                to={URL_PER_YEAR.replace("{year}", y)}
              >
                {y}
              </Link>
            ))}
          </li>
        </ul>
      </nav>
      <div>
        <StaticImage
          className={blogTopPicture}
          alt="Patrick Desjardins picture from a conference"
          src="../images/backgrounds/patrickdesjardins_conference_bw.jpeg"
        />
      </div>
      <main>
        <h1 className={heading}>{pageTitle}</h1>
        {children}
      </main>
    </div>
  );
};
