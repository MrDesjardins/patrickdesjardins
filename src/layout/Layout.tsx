import * as React from "react";
import { Link, useStaticQuery, graphql } from "gatsby";
import * as styles from "./layout.module.css";
import { StaticImage } from "gatsby-plugin-image";
import { URL_PER_YEAR, URL_BY_PAGE } from "../../constants";
export interface LayoutProps {
  pageTitle: string;
  children: JSX.Element;
  currentPageYear?: string;
  currentPage?: string;
  totalPages: number;
}
const Layout = (props: LayoutProps) => {
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
  const years: number[] = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear; i >= 2011; i--) {
    years.push(i);
  }
  const pages: number[] = [];
  for (let i = 1; i <= props.totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className={styles.container}>
      <title>
        {pageTitle} | {data.site.siteMetadata.title}
      </title>
      <header className={styles.siteTitle}>
        {data.site.siteMetadata.title}
      </header>
      <nav>
        <ul className={styles.navLinks}>
          <li className={styles.navLinkItem}>
            <Link className={styles.navLinkText} to="/">
              Main Page
            </Link>
            <Link className={styles.navLinkText} to="/blog">
              Blog
            </Link>
            {years.map((y) => {
              let classN: string = styles.navLinkText;
              if (y === Number(props.currentPageYear)) {
                classN += " " + styles.currentLink;
              }
              return (
                <Link
                  key={y}
                  className={classN}
                  to={URL_PER_YEAR.replace("{year}", y.toString())}
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
          className={styles.blogTopPicture}
          alt="Patrick Desjardins picture from a conference"
          src="../images/backgrounds/patrickdesjardins_conference_bw.jpeg"
        />
      </div>
      <main className={styles.main}>
        <h1 className={styles.heading}>{pageTitle}</h1>
        {children}
      </main>
      <div className={styles.paginationBar}>
        <div className={styles.paginationTitle}>
          Chronological Blog Articles by Page
        </div>
        <div className={styles.paginationLinks}>
          {pages.map((page) => {
            let classLink = "";
            if (page === Number(props.currentPage)) {
              classLink = styles.currentLink;
            }
            return (
              <Link
                key={page}
                className={classLink}
                to={URL_BY_PAGE.replace("{page}", page.toString())}
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

export default Layout;