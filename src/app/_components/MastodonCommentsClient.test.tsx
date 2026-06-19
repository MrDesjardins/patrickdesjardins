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
                  in_reply_to_id: "123",
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
                {
                  id: "reply-2",
                  in_reply_to_id: "reply-1",
                  url: "https://mastodon.social/@other/789",
                  created_at: "2026-06-19T12:10:00Z",
                  content: "<p>Nested answer</p>",
                  spoiler_text: "",
                  account: {
                    display_name: "Other Person",
                    acct: "other@example.com",
                    avatar: "https://mastodon.social/avatar-other.png",
                  },
                },
              ],
            }),
            { status: 200 },
          );
        }
        return new Response(JSON.stringify({ replies_count: 2 }), { status: 200 });
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
      expect(screen.getByText("2 public replies")).toBeTruthy();
    });
    expect(screen.getByText("Hello there")).toBeTruthy();
    expect(screen.getByText("Nested answer")).toBeTruthy();
    expect(screen.getAllByRole("link", { name: "Reply" })).toHaveLength(2);
    expect(screen.getAllByRole("article")).toHaveLength(2);
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
