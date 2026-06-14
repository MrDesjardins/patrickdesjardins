"use client";

import { useEffect } from "react";
import { sendTelemetryEvent } from "../lib/telemetry";

export function OutboundLinkTelemetry(): null {
  useEffect(() => {
    const handleClick = (event: MouseEvent): void => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const link = target.closest("a");
      if (link === null) {
        return;
      }

      const href = link.getAttribute("href");
      if (href === null || href.startsWith("/") || href.startsWith("#")) {
        return;
      }

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }

      if (url.hostname === window.location.hostname) {
        return;
      }

      sendTelemetryEvent("outbound_link_click", {
        link_host: url.hostname,
      });
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return null;
}
