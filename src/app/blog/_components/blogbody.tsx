import "@fontsource/open-sans";
import "@fontsource/oswald";
import { Inter } from "next/font/google";
import styles from "../../layout.module.css";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import { FIRST_YEAR, LAST_YEAR } from "../../../constants/constants";
import { PropsWithChildren } from "react";
const inter = Inter({ subsets: ["latin"] });

export interface BlogBodyProps extends PropsWithChildren {
  currentPage?: number;
  year?: number;
  totalPages: number;
}

export function BlogBody(props: BlogBodyProps) {
  const years = [];
  for (let i = LAST_YEAR; i >= FIRST_YEAR; i--) {
    years.push(i);
  }
  const pages = [];
  for (let i = 1; i <= props.totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className={inter.className}>
      <div className={styles.container}>
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
        <div>
          <Image
            className={styles.blogTopPicture}
            alt="Patrick Desjardins picture from a conference"
            src="/images/backgrounds/patrickdesjardins_conference_bw.jpeg"
            width={1000}
            height={300}
          />
        </div>
        <main className={styles.main}>{props.children}</main>
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
      </div>
    </div>
  );
}
