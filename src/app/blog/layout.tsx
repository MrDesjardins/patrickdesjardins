import styles from "./layout.module.css"
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={styles.bodystyle}>{children}</div>
  );
}
