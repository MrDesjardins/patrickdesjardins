import styles from "./layout.module.css";
import "@fontsource/open-sans";
import "@fontsource/oswald";
import "@fontsource/ubuntu-mono";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return <div className={styles.bodystyle}>{children}</div>;
}
