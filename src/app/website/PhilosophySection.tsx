import clsx from "clsx";
import styles from "./website.module.css";
import Link from "next/link";

export const PhilosophySection = (): React.ReactElement => {
  return (
    <section
      id="philosophy"
      className={clsx(styles.sectionMainpage, styles.sectionVisualTwo)}
    >
      <h2>Philosophy</h2>
      <h3 className={styles.sectionPhilosophySub}>
        Personal Essays and Notes
      </h3>
      <div className={styles.sectionSingleFixedWidth}>
        <p>
          Alongside my technical writing, I keep a separate space for
          philosophy: longer-form essays, careful argument, and notes that
          deserve a different pace and tone from day-to-day engineering posts.
        </p>
        <p>
          I will be trying to write more personal essays and notes here. I will be writing about my life, my thoughts, my experiences, and my opinions. I will also focus on AI and its impact on our lives.
        </p>
        <p className={styles.sectionPhilosophyCta}>
          <Link href="/philosophy">Open the philosophy journal</Link>
        </p>
      </div>
    </section>
  );
};
