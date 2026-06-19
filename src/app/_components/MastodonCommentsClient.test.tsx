import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MastodonCommentsClient } from "./MastodonCommentsClient";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("MastodonCommentsClient", () => {
  it("renders public replies as text from Mastodon responses", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(
      vi.fn(async (url: string | URL | Request) => {
        const value = String(url);
        if (value.endsWith("/context")) {
          return new Response(
            JSON.stringify({
              descendants: [
                {
                  id: "reply-1",
                  url: "https://mastodon.social/@person/456",
                  created_at: "2026-06-19T12:00:00Z",
                  content: "<p>Hello <strong>there</strong></p>",
                  spoiler_text: "",
                  account: {
                    display_name: "A Person",
                    acct: "person@example.com",
                    avatar: "https://mastodon.social/avatar.png",
                  },
                },
              ],
            }),
            { status: 200 },
          );
        }
        return new Response(JSON.stringify({ replies_count: 1 }), { status: 200 });
      }) as typeof fetch,
    );

    const { container } = render(
      <MastodonCommentsClient
        instanceUrl="https://mastodon.social"
        statusId="123"
        statusUrl="https://mastodon.social/@mrdesjardins/123"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("1 public reply")).toBeTruthy();
    });
    expect(screen.getByText("Hello there")).toBeTruthy();
    expect(
      container.querySelector('img[src="https://mastodon.social/avatar.png"]'),
    ).toHaveAttribute(
      "src",
      "https://mastodon.social/avatar.png",
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("renders a fallback when the Mastodon API fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("", { status: 500 }));

    render(
      <MastodonCommentsClient
        instanceUrl="https://mastodon.social"
        statusId="123"
        statusUrl="https://mastodon.social/@mrdesjardins/123"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText(/Replies could not be loaded here/u)).toBeTruthy();
    });
    expect(screen.getByRole("link", { name: "Open the Mastodon thread" })).toHaveAttribute(
      "href",
      "https://mastodon.social/@mrdesjardins/123",
    );
  });
});
