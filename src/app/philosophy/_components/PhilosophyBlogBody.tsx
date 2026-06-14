import styles from "./PhilosophyBlogBody.module.css";
import Link from "next/link";
import clsx from "clsx";
import {
  LAST_YEAR,
  PHILOSOPHY_FIRST_YEAR,
} from "../../../constants/constants";
import { type PropsWithChildren } from "react";

export interface PhilosophyBlogBodyProps extends PropsWithChildren {
  currentPage?: number;
  year?: number;
  totalPages?: number;
  topTitle: string;
  totalBlogPost?: number;
}

export function PhilosophyBlogBody(
  props: PhilosophyBlogBodyProps,
): React.ReactElement {
  const years = [];
  for (let i = LAST_YEAR; i >= PHILOSOPHY_FIRST_YEAR; i--) {
    years.push(i);
  }
  const pages = [];
  if (props.totalPages !== undefined && props.totalPages > 0) {
    for (let i = 1; i <= props.totalPages; i++) {
      pages.push(i);
    }
  }

  return (
    <div className={styles.blogBodyShell}>
      <header>
        <h1 className={styles.siteTitle}>Philosophy</h1>
        <p className={styles.siteSubtitle}>
          Patrick Desjardins — essays and notes
        </p>
        <div className={styles.paperEdge}>
          <nav aria-label="Philosophy">
            <ul className={styles.navLinks}>
              <li className={styles.navLinkItem}>
                <Link className={styles.navLinkText} href="/">
                  Main Page
                </Link>
              </li>
              <li className={styles.navLinkItem}>
                <Link className={styles.navLinkText} href="/blog">
                  Technical Blog
                </Link>
              </li>
              <li className={styles.navLinkItem}>
                <Link className={styles.navLinkText} href="/philosophy">
                  Philosophy
                </Link>
              </li>
              <li className={styles.navLinkItem}>
                <Link className={styles.navLinkText} href="/philosophy/search">
                  Search
                </Link>
              </li>
              {years.map((y) => (
                <li key={y} className={styles.navLinkItem}>
                  <Link
                    className={clsx(styles.navLinkText, {
                      [styles.currentLink]: y === props.year,
                    })}
                    href={`/philosophy/for/${y}`}
                  >
                    {y}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      <main className={styles.main}>
        <h2 className={styles.heading}>{props.topTitle}</h2>
        {props.children}
      </main>
      {pages.length > 0 || props.totalBlogPost !== undefined ? (
        <footer>
          {pages.length > 0 ? (
            <div className={styles.paginationBar}>
              <div className={styles.paginationTitle}>Essays by page</div>
              <div className={styles.paginationLinks}>
                {pages.map((page) => (
                  <Link
                    key={page}
                    className={clsx({
                      [styles.currentLink]: page === props.currentPage,
                    })}
                    href={`/philosophy/page/${page}`}
                  >
                    {page}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
          {props.totalBlogPost === undefined ? null : (
            <div className={styles.totalPosts}>
              Total essays: {props.totalBlogPost}
            </div>
          )}
        </footer>
      ) : null}
    </div>
  );
}
