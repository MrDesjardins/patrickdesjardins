import { FIRST_YEAR, LAST_YEAR } from "../constants/constants";
import { ROOT_POSTS_PATH } from "../lib/api";
import fs from "fs";
export function countBlogArticles(): number {
  let counter: number = 0;
  for (let y = FIRST_YEAR; y <= LAST_YEAR; y++) {
    const filePath = `${ROOT_POSTS_PATH}/${y}`;

    const fules = fs
      .readdirSync(filePath)
      .filter((path) => /\.mdx?$/.test(path));
    counter += fules.length;
  }
  return counter;
}
