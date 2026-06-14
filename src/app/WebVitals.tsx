"use client";

import { useReportWebVitals } from "next/web-vitals";
import { sendTelemetryEvent } from "../lib/telemetry";

const trackedMetrics = new Set(["CLS", "LCP", "INP", "FCP", "TTFB"]);

export function WebVitals(): null {
  useReportWebVitals((metric) => {
    const rawName: unknown = metric.name;
    const rawValue: unknown = metric.value;
    const rawRating: unknown = metric.rating;
    const metricName = String(rawName);
    if (!trackedMetrics.has(metricName)) {
      return;
    }
    const metricValue =
      typeof rawValue === "number" ? Math.round(rawValue) : 0;
    const metricRating = String(rawRating);

    sendTelemetryEvent("web_vital", {
      metric_name: metricName,
      metric_value: metricValue,
      metric_rating: metricRating,
    });
  });

  return null;
}
