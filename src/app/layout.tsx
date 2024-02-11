import Head from "next/head";
import styles from "./layout.module.css";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Patrick Desjardins Website and Blog</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        ></meta>
      </head>
      <body className={styles.bodystyle}>{children}</body>
    </html>
  );
}
