import "@fontsource/eb-garamond/400.css";
import "@fontsource/eb-garamond/400-italic.css";
import "@fontsource/eb-garamond/500.css";
import "@fontsource/eb-garamond/500-italic.css";
import "@fontsource/eb-garamond/600.css";
import "@fontsource/eb-garamond/600-italic.css";
import "@fontsource/eb-garamond/700.css";
import "@fontsource/eb-garamond/700-italic.css";
import styles from "./layout.module.css";

export default function PhilosophyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <div className={`philosophy-site ${styles.philosophyRoot}`}>{children}</div>
  );
}
