import { type Metadata } from "next";
import "@fontsource/open-sans";
import "@fontsource/oswald";
import "@fontsource/ubuntu-mono";
import styles from "./layout.module.css";
import { WebVitals } from "./WebVitals";
import { OutboundLinkTelemetry } from "./OutboundLinkTelemetry";

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
        <WebVitals />
        <OutboundLinkTelemetry />
        {children}
      </body>
    </html>
  );
}
