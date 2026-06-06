import { describe, expect, it } from "vitest";
import { slugFromMdxFilename } from "./slug";

describe("slugFromMdxFilename", () => {
  it("preserves filename casing for routed blog slugs", () => {
    expect(
      slugFromMdxFilename(
        "how-to-transfer-files-between-computers-using-HDMI-Part-1-Plan.mdx",
      ),
    ).toBe("how-to-transfer-files-between-computers-using-HDMI-Part-1-Plan");
  });

  it("preserves non-extension characters exactly", () => {
    expect(slugFromMdxFilename("post_with_UPPERCASE.md")).toBe(
      "post_with_UPPERCASE",
    );
  });
});
