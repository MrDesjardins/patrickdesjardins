"use client";

import { useEffect } from "react";
import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from "web-vitals";
import { sendTelemetryEvent } from "../lib/telemetry";

const trackedMetrics = new Set(["CLS", "LCP", "INP", "FCP", "TTFB"]);

function reportMetric(metric: Metric): void {
  const metricName = String(metric.name);
  if (!trackedMetrics.has(metricName)) {
    return;
  }

  sendTelemetryEvent("web_vital", {
    metric_name: metricName,
    metric_value: Math.round(metric.value),
    metric_rating: String(metric.rating),
  });
}

export function WebVitals(): null {
  useEffect(() => {
    onCLS(reportMetric);
    onFCP(reportMetric);
    onINP(reportMetric);
    onLCP(reportMetric);
    onTTFB(reportMetric);
  }, []);

  return null;
}
