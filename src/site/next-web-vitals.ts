import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from "web-vitals";

export function useReportWebVitals(
  callback: (metric: Metric) => void,
): void {
  if (typeof window === "undefined") {
    return;
  }

  onCLS(callback);
  onFCP(callback);
  onINP(callback);
  onLCP(callback);
  onTTFB(callback);
}
