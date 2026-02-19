import { describe, it, expect } from "vitest";
import { sortByMetadataDateDesc, sortByMetadataDateAsc } from "./list";
import { type MdxData } from "../lib/api";

function makePost(date: string): MdxData {
  return {
    metadata: { year: Number(date.slice(0, 4)), date, fullPathWithFileName: "", fileName: "", slug: "" },
    contentReact: null as never,
    rawFileContent: "",
    frontmatter: { date },
  };
}

const older = makePost("2020-01-01");
const newer = makePost("2024-06-15");
const middle = makePost("2022-03-10");

describe("sortByMetadataDateDesc", () => {
  it("puts newer posts before older posts", () => {
    const sorted = [older, newer, middle].sort(sortByMetadataDateDesc);
    expect(sorted[0].metadata.date).toBe("2024-06-15");
    expect(sorted[1].metadata.date).toBe("2022-03-10");
    expect(sorted[2].metadata.date).toBe("2020-01-01");
  });

  it("is stable when dates are equal", () => {
    const a = makePost("2023-05-01");
    const b = makePost("2023-05-01");
    const result = sortByMetadataDateDesc(a, b);
    expect(result).toBe(1);
  });
});

describe("sortByMetadataDateAsc", () => {
  it("puts older posts before newer posts", () => {
    const sorted = [newer, older, middle].sort(sortByMetadataDateAsc);
    expect(sorted[0].metadata.date).toBe("2020-01-01");
    expect(sorted[1].metadata.date).toBe("2022-03-10");
    expect(sorted[2].metadata.date).toBe("2024-06-15");
  });

  it("is stable when dates are equal", () => {
    const a = makePost("2023-05-01");
    const b = makePost("2023-05-01");
    const result = sortByMetadataDateAsc(a, b);
    expect(result).toBe(1);
  });
});
