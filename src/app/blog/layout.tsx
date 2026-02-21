import styles from "./layout.module.css";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return <div className={styles.blogbodystyle}>{children}</div>;
}
