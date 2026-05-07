import { EB_Garamond } from "next/font/google";
import styles from "./layout.module.css";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export default function PhilosophyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <div className={`${styles.philosophyRoot} ${ebGaramond.className}`}>
      {children}
    </div>
  );
}
