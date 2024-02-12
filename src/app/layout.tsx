import styles from "./layout.module.css";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={styles.bodystyle}>{children}</body>
    </html>
  );
}
