import { describe, it, expect } from "vitest";
import {
  extractSlugFromFileName,
  extractYearFromStringDate,
  getTotalPages,
  getAllMdxFilesWithoutContent,
  type MdxData,
} from "./api";

describe("extractSlugFromFileName", () => {
  it("strips the .mdx extension", () => {
    expect(extractSlugFromFileName("my-post.mdx")).toBe("my-post");
  });

  it("strips the .md extension", () => {
    expect(extractSlugFromFileName("hello-world.md")).toBe("hello-world");
  });

  it("handles filenames with multiple dots", () => {
    expect(extractSlugFromFileName("post.about.things.mdx")).toBe(
      "post.about.things",
    );
  });
});

describe("extractYearFromStringDate", () => {
  it("extracts the year from a full ISO date", () => {
    expect(extractYearFromStringDate("2024-03-15")).toBe(2024);
  });

  it("extracts the year from a date with time", () => {
    expect(extractYearFromStringDate("2011-01-01T00:00:00Z")).toBe(2011);
  });

  it("returns a number, not a string", () => {
    const result = extractYearFromStringDate("2020-06-30");
    expect(typeof result).toBe("number");
  });
});

describe("getTotalPages", () => {
  it("returns 1 when there are fewer posts than the page size", () => {
    const posts = Array.from<MdxData>({ length: 5 });
    expect(getTotalPages(posts)).toBe(1);
  });

  it("returns 1 when posts exactly fill one page", () => {
    const posts = Array.from<MdxData>({ length: 10 });
    expect(getTotalPages(posts)).toBe(1);
  });

  it("returns 2 when posts exceed one page by one", () => {
    const posts = Array.from<MdxData>({ length: 11 });
    expect(getTotalPages(posts)).toBe(2);
  });

  it("returns correct pages for a large number of posts", () => {
    const posts = Array.from<MdxData>({ length: 800 });
    expect(getTotalPages(posts)).toBe(80);
  });

  it("returns 0 for an empty list", () => {
    expect(getTotalPages([])).toBe(0);
  });
});

describe("getAllMdxFilesWithoutContent", () => {
  it("returns an array", () => {
    const result = getAllMdxFilesWithoutContent();
    expect(Array.isArray(result)).toBe(true);
  });

  it("each entry has the expected shape", () => {
    const result = getAllMdxFilesWithoutContent();
    if (result.length > 0) {
      const first = result[0];
      expect(first).toHaveProperty("year");
      expect(first).toHaveProperty("fileName");
      expect(first).toHaveProperty("slug");
      expect(first).toHaveProperty("fullPathWithFileName");
      expect(first.fileName.endsWith(".mdx") || first.fileName.endsWith(".md")).toBe(true);
      expect(first.slug).not.toContain(".");
    }
  });
});
