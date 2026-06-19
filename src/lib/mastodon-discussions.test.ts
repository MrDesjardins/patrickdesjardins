import { describe, expect, it } from "vitest";
import { getMastodonDiscussion } from "./mastodon-discussions";

describe("getMastodonDiscussion", () => {
  it("returns undefined when a slug is not configured", () => {
    expect(getMastodonDiscussion("blog", "missing-post")).toBeUndefined();
  });
});

