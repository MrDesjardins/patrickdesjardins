import { FIRST_YEAR, LAST_YEAR } from "../constants/constants";
import { ROOT_PHILOSOPHY_PATH, ROOT_POSTS_PATH } from "../lib/api";
import fs from "fs";

function countMdxArticles(collectionRoot: string): number {
  let counter: number = 0;
  for (let y = FIRST_YEAR; y <= LAST_YEAR; y++) {
    const filePath = `${collectionRoot}/${y}`;
    if (!fs.existsSync(filePath)) {
      continue;
    }
    const fules = fs
      .readdirSync(filePath)
      .filter((path) => /\.mdx?$/.test(path));
    counter += fules.length;
  }
  return counter;
}

export function countArticles(): number {
  return (
    countMdxArticles(ROOT_POSTS_PATH) + countMdxArticles(ROOT_PHILOSOPHY_PATH)
  );
}
