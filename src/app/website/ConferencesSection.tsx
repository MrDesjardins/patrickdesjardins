import clsx from "clsx";
import styles from "./website.module.css";
import styles2 from "./Conference.module.css";
export const ConferencesSection = (): React.ReactElement => {
  return (
    <section
      id="conferences"
      className={clsx(styles.sectionMainpage, styles.sectionVisualOne)}
    >
      <header>CONFERENCES</header>
      <h3>Limited list with public recorded presentation only</h3>
      <div className={styles2.firstVideo}>
        <div>Croatia 2018, Split Conference</div>
        <div className={styles2.videoContainer}>
          <iframe
            className={styles2.video}
            src="https://www.youtube.com/embed/QWtNhelMv-k?rel=0&amp;controls=1&amp;showinfo=0"
            allow="autoplay; encrypted-media"
          ></iframe>
        </div>
      </div>
    </section>
  );
};
