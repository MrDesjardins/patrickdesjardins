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
  paginationBar,
  currentLink,
  paginationLinks,
  paginationTitle,
  main,
} from "./layout.module.css";
import { StaticImage } from "gatsby-plugin-image";
import { URL_PER_YEAR, URL_BY_PAGE } from "../../constants";
export interface LayoutProps {
  pageTitle: string;
  children: JSX.Element;
  currentPageYear?: string;
  currentPage?: string;
  totalPages: number;
}
export const Layout = (props: LayoutProps): JSX.Element => {
  const pageTitle = props.pageTitle;
  const children = props.children;

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
  const pages = [];
  for (let i = 1; i <= props.totalPages; i++) {
    pages.push(i);
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
              Main Page
            </Link>
            <Link className={navLinkText} to="/blog">
              Blog
            </Link>
            {years.map((y) => {
              let classN: string = navLinkText;
              if (y === Number(props.currentPageYear)) {
                classN += " " + currentLink;
              }
              return (
                <Link
                  key={y}
                  className={classN}
                  to={URL_PER_YEAR.replace("{year}", y)}
                >
                  {y}
                </Link>
              );
            })}
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
      <main className={main}>
        <h1 className={heading}>{pageTitle}</h1>
        {children}
      </main>
      <div className={paginationBar}>
        <div className={paginationTitle}>
          Chronological Blog Articles by Page
        </div>
        <div className={paginationLinks}>
          {pages.map((page) => {
            let classLink = "";
            if (page === props.currentPage) {
              classLink = currentLink;
            }
            return (
              <Link
                key={page}
                className={classLink}
                to={URL_BY_PAGE.replace("{page}", page)}
              >
                {page}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
