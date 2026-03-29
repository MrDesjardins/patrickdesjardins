import { type Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import "@fontsource/open-sans";
import "@fontsource/oswald";
import "@fontsource/ubuntu-mono";
import styles from "./layout.module.css";

const gaMeasurementId =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-6EH8HNYV13";

export const metadata: Metadata = {
  title: "Patrick Desjardins",
  description: "Software engineering blog by Patrick Desjardins — distributed systems, TypeScript, machine learning, and career growth.",
  openGraph: {
    title: "Patrick Desjardins",
    description: "Software engineering blog by Patrick Desjardins — distributed systems, TypeScript, machine learning, and career growth.",
    url: "https://patrickdesjardins.com",
    siteName: "Patrick Desjardins",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Patrick Desjardins",
    description: "Software engineering blog by Patrick Desjardins — distributed systems, TypeScript, machine learning, and career growth.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html lang="en" className={styles.htmlstyle}>
      <body className={styles.bodystyle}>
        {children}
        {process.env.NODE_ENV === "production" ? (
          <GoogleAnalytics gaId={gaMeasurementId} />
        ) : null}
      </body>
    </html>
  );
}
