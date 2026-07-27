import "../app/layout.module.css";
import "@fontsource/open-sans";
import "@fontsource/oswald";
import "@fontsource/ubuntu-mono";
import "@fontsource/eb-garamond/400.css";
import "@fontsource/eb-garamond/400-italic.css";
import "@fontsource/eb-garamond/500.css";
import "@fontsource/eb-garamond/500-italic.css";
import "@fontsource/eb-garamond/600.css";
import "@fontsource/eb-garamond/600-italic.css";
import "@fontsource/eb-garamond/700.css";
import "@fontsource/eb-garamond/700-italic.css";
import "../app/blog/[slug]/linenumber.css";
import "../app/blog/[slug]/theme.css";
import "../app/philosophy/[slug]/paper-prism.css";
import "./consent.css";
import { staticStyleModules } from "./style-entry";
import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from "web-vitals";
import { sendTelemetryEvent } from "../lib/telemetry";

// The HTML is produced by a separate server renderer, so the client never
// reads these CSS-module locals. Reference them through an observable side
// effect the bundler cannot elide; a bare `void` lets Rollup tree-shake the
// imports so their stylesheets (site layout, homepage sections) never ship.
(
  window as typeof window & { __staticStyleModules?: unknown }
).__staticStyleModules = staticStyleModules;

const trackedMetrics = new Set(["CLS", "LCP", "INP", "FCP", "TTFB"]);
function reportMetric(metric: Metric): void {
  if (trackedMetrics.has(String(metric.name))) {
    sendTelemetryEvent("web_vital", {
      metric_name: String(metric.name),
      metric_value: Math.round(metric.value),
      metric_rating: String(metric.rating),
    });
  }
}
onCLS(reportMetric);
onFCP(reportMetric);
onINP(reportMetric);
onLCP(reportMetric);
onTTFB(reportMetric);

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const link = target.closest("a");
  const href = link?.getAttribute("href");
  if (
    href === undefined ||
    href === null ||
    href.startsWith("/") ||
    href.startsWith("#")
  ) {
    return;
  }
  try {
    const url = new URL(href, window.location.href);
    if (url.hostname !== window.location.hostname) {
      sendTelemetryEvent("outbound_link_click", { link_host: url.hostname });
    }
  } catch {
    // Ignore malformed third-party links.
  }
});

function setAnalyticsConsent(value: "granted" | "denied"): void {
  try {
    localStorage.setItem("analytics-consent", value);
  } catch {
    // Consent still applies to the current page when storage is unavailable.
  }
  window.gtag?.("consent", "update", { analytics_storage: value });
}

try {
  if (localStorage.getItem("analytics-consent") === null) {
    const notice = document.createElement("aside");
    notice.className = "analytics-consent";
    notice.setAttribute("aria-label", "Analytics preferences");
    notice.innerHTML =
      '<div>This site uses optional analytics to understand performance and improve articles. No advertising storage is used.</div><div class="analytics-consent__actions"><button type="button" data-consent="granted">Allow analytics</button><button type="button" data-consent="denied">Decline</button></div>';
    notice.addEventListener("click", (event) => {
      const button =
        event.target instanceof Element
          ? event.target.closest<HTMLButtonElement>("button[data-consent]")
          : null;
      const consent = button?.dataset.consent;
      if (consent === "granted" || consent === "denied") {
        setAnalyticsConsent(consent);
        notice.remove();
      }
    });
    document.body.appendChild(notice);
  }
} catch {
  // Do not block the static page when browser storage is unavailable.
}

if (document.getElementById("blog-search-root") !== null) {
  void Promise.all([
    import("react"),
    import("react-dom/client"),
    import("../app/blog/search/SearchClient"),
    import("../app/blog/search/SearchErrorBoundary"),
  ]).then(([reactModule, reactDomModule, searchModule, boundaryModule]) => {
    const root = document.getElementById("blog-search-root");
    if (root === null) return;
    const BlogSearchClient = searchModule.default;
    const SearchErrorBoundary = boundaryModule.SearchErrorBoundary;
    reactDomModule
      .createRoot(root)
      .render(
        reactModule.createElement(
          reactModule.StrictMode,
          null,
          reactModule.createElement(
            SearchErrorBoundary,
            null,
            reactModule.createElement(BlogSearchClient),
          ),
        ),
      );
  });
}

if (document.getElementById("philosophy-search-root") !== null) {
  void Promise.all([
    import("react"),
    import("react-dom/client"),
    import("../app/philosophy/search/PhilosophySearchClient"),
    import("../app/blog/search/SearchErrorBoundary"),
  ]).then(([reactModule, reactDomModule, searchModule, boundaryModule]) => {
    const root = document.getElementById("philosophy-search-root");
    if (root === null) return;
    const PhilosophySearchClient = searchModule.default;
    const SearchErrorBoundary = boundaryModule.SearchErrorBoundary;
    reactDomModule
      .createRoot(root)
      .render(
        reactModule.createElement(
          reactModule.StrictMode,
          null,
          reactModule.createElement(
            SearchErrorBoundary,
            null,
            reactModule.createElement(PhilosophySearchClient),
          ),
        ),
      );
  });
}

for (const root of document.querySelectorAll<HTMLElement>(
  "[data-mastodon-comments-root]",
)) {
  const { instanceUrl, statusId, statusUrl } = root.dataset;
  if (
    instanceUrl === undefined ||
    statusId === undefined ||
    statusUrl === undefined
  ) {
    continue;
  }

  void Promise.all([
    import("react"),
    import("react-dom/client"),
    import("../app/_components/MastodonCommentsClient"),
  ]).then(([reactModule, reactDomModule, module]) => {
    reactDomModule.createRoot(root).render(
      reactModule.createElement(
        reactModule.StrictMode,
        null,
        reactModule.createElement(module.MastodonCommentsClient, {
          instanceUrl: instanceUrl,
          statusId: statusId,
          statusUrl: statusUrl,
        }),
      ),
    );
  });
}

if (document.querySelector('pre code[class*="language-"]') !== null) {
  void import("./highlight").then((module) => {
    module.highlightAll();
  });
}
