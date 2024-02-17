import styles from "./layout.module.css";
import "@fontsource/open-sans";
import "@fontsource/oswald";
import "@fontsource/ubuntu-mono";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html lang="en">
      <body className={styles.bodystyle}>{children}</body>
    </html>
  );
}
