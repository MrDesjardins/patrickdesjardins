import styles from "./BlogBody.module.css";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import { FIRST_YEAR, LAST_YEAR } from "../../../constants/constants";
import { type PropsWithChildren } from "react";

export interface BlogBodyProps extends PropsWithChildren {
  currentPage?: number;
  year?: number;
  totalPages?: number;
  topTitle: string;
  totalBlogPost?: number;
}

/**
 * The blog body component acts like a layout. However, it has the capability of receiving props
 * that are from ALL the pages. The layout, when at the root of the blog, does no receive the
 * dynamic parameters of pages under its hierarchy.
 */
export function BlogBody(props: BlogBodyProps): React.ReactElement {
  const years = [];
  for (let i = LAST_YEAR; i >= FIRST_YEAR; i--) {
    years.push(i);
  }
  const pages = [];
  if (props.totalPages !== undefined && props.totalPages > 0) {
    for (let i = 1; i <= props.totalPages; i++) {
      pages.push(i);
    }
  }

  return (
    <div className={styles.BlogBody}>
      <header className={styles.siteTitle}>Patrick Desjardins Blog</header>
      <nav>
        <ul className={styles.navLinks}>
          <li className={styles.navLinkItem}>
            <Link className={styles.navLinkText} href="/">
              Main Page
            </Link>
            <Link className={styles.navLinkText} href="/blog">
              Blog
            </Link>
            <Link className={styles.navLinkText} href="/blog/search">
              Search
            </Link>
            {years.map((y) => {
              return (
                <Link
                  key={y}
                  className={clsx({
                    [styles.navLinkText]: true,
                    [styles.currentLink]: y === props.year,
                  })}
                  href={`/blog/for/${y}`}
                >
                  {y}
                </Link>
              );
            })}
          </li>
        </ul>
      </nav>
      <div className={styles.blogPictureContainer}>
        <Image
          className={styles.blogTopPicture}
          alt="Patrick Desjardins picture from a conference"
          src="/images/backgrounds/patrickdesjardins_conference_bw.webp"
          width={800}
          height={260}
        />
      </div>
      <main className={styles.main}>
        <h1 className={styles.heading}>{props.topTitle}</h1>
        {props.children}
      </main>
      {pages.length > 0 ? (
        <div className={styles.paginationBar}>
          <div className={styles.paginationTitle}>
            Chronological Blog Articles by Page
          </div>
          <div className={styles.paginationLinks}>
            {pages.map((page) => {
              return (
                <Link
                  key={page}
                  className={clsx({
                    [styles.currentLink]: page === props.currentPage,
                  })}
                  href={`/blog/page/${page}`}
                >
                  {page}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
      {props.totalBlogPost === undefined ? null : (
        <div className={styles.totalBlogPost}>
          Total Blog Posts: {props.totalBlogPost}
        </div>
      )}
    </div>
  );
}
