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

  it("does not duplicate deeply nested replies when visual nesting is capped", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(
      vi.fn(async (url: string | URL | Request) => {
        const value = String(url);
        if (value.endsWith("/context")) {
          return new Response(
            JSON.stringify({
              descendants: [
                {
                  id: "reply-1",
                  in_reply_to_id: "123",
                  url: "https://mastodon.social/@person/1",
                  created_at: "2026-06-19T12:00:00Z",
                  content: "<p>Level 1</p>",
                  spoiler_text: "",
                  account: { display_name: "One", acct: "one@example.com" },
                },
                {
                  id: "reply-2",
                  in_reply_to_id: "reply-1",
                  url: "https://mastodon.social/@person/2",
                  created_at: "2026-06-19T12:01:00Z",
                  content: "<p>Level 2</p>",
                  spoiler_text: "",
                  account: { display_name: "Two", acct: "two@example.com" },
                },
                {
                  id: "reply-3",
                  in_reply_to_id: "reply-2",
                  url: "https://mastodon.social/@person/3",
                  created_at: "2026-06-19T12:02:00Z",
                  content: "<p>Level 3</p>",
                  spoiler_text: "",
                  account: { display_name: "Three", acct: "three@example.com" },
                },
                {
                  id: "reply-4",
                  in_reply_to_id: "reply-3",
                  url: "https://mastodon.social/@person/4",
                  created_at: "2026-06-19T12:03:00Z",
                  content: "<p>Level 4</p>",
                  spoiler_text: "",
                  account: { display_name: "Four", acct: "four@example.com" },
                },
                {
                  id: "reply-5",
                  in_reply_to_id: "reply-4",
                  url: "https://mastodon.social/@person/5",
                  created_at: "2026-06-19T12:04:00Z",
                  content: "<p>Level 5</p>",
                  spoiler_text: "",
                  account: { display_name: "Five", acct: "five@example.com" },
                },
              ],
            }),
            { status: 200 },
          );
        }
        return new Response(JSON.stringify({ replies_count: 5 }), { status: 200 });
      }) as typeof fetch,
    );

    render(
      <MastodonCommentsClient
        instanceUrl="https://mastodon.social"
        statusId="123"
        statusUrl="https://mastodon.social/@mrdesjardins/123"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("5 public replies")).toBeTruthy();
    });

    expect(screen.getAllByRole("article")).toHaveLength(5);
    expect(screen.getAllByText("Level 5")).toHaveLength(1);
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
