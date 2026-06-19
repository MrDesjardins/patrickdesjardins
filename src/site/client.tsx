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
import { staticStyleModules } from "./style-entry";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { OutboundLinkTelemetry } from "../app/OutboundLinkTelemetry";
import { WebVitals } from "../app/WebVitals";
import { MastodonCommentsClient } from "../app/_components/MastodonCommentsClient";
import BlogSearchClient from "../app/blog/search/SearchClient";
import { SearchErrorBoundary } from "../app/blog/search/SearchErrorBoundary";
import PhilosophySearchClient from "../app/philosophy/search/PhilosophySearchClient";

void staticStyleModules;

function mount(
  rootId: string,
  element: React.ReactElement,
): void {
  const root = document.getElementById(rootId);
  if (root === null) {
    return;
  }

  createRoot(root).render(<StrictMode>{element}</StrictMode>);
}

mount(
  "blog-search-root",
  <SearchErrorBoundary>
    <BlogSearchClient />
  </SearchErrorBoundary>,
);
mount(
  "philosophy-search-root",
  <SearchErrorBoundary>
    <PhilosophySearchClient />
  </SearchErrorBoundary>,
);

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

  createRoot(root).render(
    <StrictMode>
      <MastodonCommentsClient
        instanceUrl={instanceUrl}
        statusId={statusId}
        statusUrl={statusUrl}
      />
    </StrictMode>,
  );
}

const telemetryRoot = document.createElement("div");
telemetryRoot.hidden = true;
document.body.appendChild(telemetryRoot);
createRoot(telemetryRoot).render(
  <StrictMode>
    <OutboundLinkTelemetry />
    <WebVitals />
  </StrictMode>,
);
