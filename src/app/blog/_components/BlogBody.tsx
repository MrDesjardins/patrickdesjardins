import styles from "./BlogBody.module.css";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import { FIRST_YEAR, LAST_YEAR } from "../../../constants/constants";
import { type PropsWithChildren } from "react";

export interface BlogBodyProps extends PropsWithChildren {
  currentPage?: number;
  isArticle?: boolean;
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
  const totalPages =
    props.isArticle === true || props.year !== undefined
      ? 0
      : (props.totalPages ?? 0);
  const currentPage = props.currentPage ?? 1;
  const firstVisiblePage = Math.max(1, currentPage - 2);
  const lastVisiblePage = Math.min(totalPages, currentPage + 2);
  const pages = Array.from(
    { length: Math.max(0, lastVisiblePage - firstVisiblePage + 1) },
    (_, index) => firstVisiblePage + index,
  );

  return (
    <div className={styles.BlogBody}>
      <a className={styles.skipLink} href="#content">
        Skip to content
      </a>
      <header>
        {props.isArticle === true ? (
          <div className={styles.siteTitle}>Patrick Desjardins Blog</div>
        ) : (
          <h1 className={styles.siteTitle}>Patrick Desjardins Blog</h1>
        )}
        <nav aria-label="Blog">
          <ul className={styles.navLinks}>
            <li className={styles.navLinkItem}>
              <Link className={styles.navLinkText} href="/">
                Main Page
              </Link>
            </li>
            <li className={styles.navLinkItem}>
              <Link className={styles.navLinkText} href="/blog">
                Blog
              </Link>
            </li>
            <li className={styles.navLinkItem}>
              <Link className={styles.navLinkText} href="/blog/search">
                Search
              </Link>
            </li>
            <li className={styles.navLinkItem}>
              <Link className={styles.navLinkText} href="/philosophy">
                Philosophy
              </Link>
            </li>
            {years.map((y) => {
              return (
                <li key={y} className={styles.navLinkItem}>
                  <Link
                    className={clsx({
                      [styles.navLinkText]: true,
                      [styles.currentLink]: y === props.year,
                    })}
                    href={`/blog/for/${y}`}
                  >
                    {y}
                  </Link>
                </li>
              );
            })}
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
      </header>
      <main id="content" className={styles.main}>
        {props.isArticle === true ? (
          <>
            <Link className={styles.articleParentLink} href="/blog">
              ← All technical posts
            </Link>
            <h1 className={styles.heading}>{props.topTitle}</h1>
          </>
        ) : (
          <h2 className={styles.heading}>{props.topTitle}</h2>
        )}
        {props.children}
      </main>
      {pages.length > 0 || props.totalBlogPost !== undefined ? (
        <footer>
          {pages.length > 0 ? (
            <div className={styles.paginationBar}>
              <div className={styles.paginationTitle}>
                Chronological Blog Articles by Page
              </div>
              <div className={styles.paginationLinks}>
                {currentPage > 1 ? (
                  <Link rel="prev" href={`/blog/page/${currentPage - 1}`}>
                    ← Previous
                  </Link>
                ) : null}
                {firstVisiblePage > 1 ? (
                  <>
                    <Link href="/blog/page/1">1</Link>
                    <span aria-hidden="true">…</span>
                  </>
                ) : null}
                {pages.map((page) => {
                  return (
                    <Link
                      key={page}
                      aria-current={page === currentPage ? "page" : undefined}
                      className={clsx({
                        [styles.currentLink]: page === props.currentPage,
                      })}
                      href={`/blog/page/${page}`}
                    >
                      {page}
                    </Link>
                  );
                })}
                {lastVisiblePage < totalPages ? (
                  <>
                    <span aria-hidden="true">…</span>
                    <Link href={`/blog/page/${totalPages}`}>{totalPages}</Link>
                  </>
                ) : null}
                {currentPage < totalPages ? (
                  <Link rel="next" href={`/blog/page/${currentPage + 1}`}>
                    Next →
                  </Link>
                ) : null}
              </div>
            </div>
          ) : null}
          {props.totalBlogPost === undefined ? null : (
            <div className={styles.totalBlogPost}>
              Total Blog Posts: {props.totalBlogPost}
            </div>
          )}
        </footer>
      ) : null}
    </div>
  );
}
