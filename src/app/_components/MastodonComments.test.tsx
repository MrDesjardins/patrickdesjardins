import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";
import { MastodonComments } from "./MastodonComments";

describe("MastodonComments", () => {
  it("renders nothing when no discussion is configured", () => {
    const { container } = render(
      <MastodonComments kind="blog" slug="missing-post" />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the mounted client placeholder when a discussion is configured", () => {
    render(
      <MastodonComments
        kind="blog"
        slug="post"
        discussion={{
          instanceUrl: "https://mastodon.social",
          statusId: "123",
          statusUrl: "https://mastodon.social/@mrdesjardins/123",
          postedAt: "2026-06-19T00:00:00Z",
        }}
      />,
    );
    const replyLinks = screen.getAllByRole("link", { name: "Reply on Mastodon" });
    expect(replyLinks).toHaveLength(1);
    expect(replyLinks[0]).toHaveAttribute(
      "href",
      "https://mastodon.social/@mrdesjardins/123",
    );
    expect(
      document.querySelector('[data-mastodon-comments-root][data-status-id="123"]'),
    ).not.toBeNull();
  });
});
