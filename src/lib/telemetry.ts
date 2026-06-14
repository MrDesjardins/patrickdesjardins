export type TelemetryParams = Record<string, string | number | boolean>;

declare global {
  interface Window {
    gtag?: (
      command: "event",
      eventName: string,
      params?: TelemetryParams,
    ) => void;
  }
}

const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const buildCommit = process.env.NEXT_PUBLIC_BUILD_COMMIT ?? "unknown";
const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME ?? "unknown";

export function isTelemetryEnabled(): boolean {
  return (
    process.env.NODE_ENV === "production" &&
    typeof window !== "undefined" &&
    typeof window.gtag === "function" &&
    gaMeasurementId !== undefined &&
    gaMeasurementId.length > 0
  );
}

export function sendTelemetryEvent(
  eventName: string,
  params: TelemetryParams = {},
): void {
  if (!isTelemetryEnabled()) {
    return;
  }

  window.gtag?.("event", eventName, {
    ...params,
    build_commit: buildCommit,
    build_time: buildTime,
  });
}
