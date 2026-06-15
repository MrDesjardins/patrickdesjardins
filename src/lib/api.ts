import fs from "fs";
import path from "path";
import { evaluate } from "@mdx-js/mdx";
import {
  FIRST_YEAR,
  LAST_YEAR,
  MAX_POSTS_PER_PAGE,
} from "../constants/constants";
import rehypePrism from "rehype-prism-plus";
import remarkGfm from "remark-gfm";
import * as runtime from "react/jsx-runtime";
import { CodeSandbox } from "../app/blog/_mdxComponents/CodeSandbox";
import { SoundCloud } from "../app/blog/_mdxComponents/SoundCloud";
import { TocAzureContainerSeries } from "../app/blog/_mdxComponents/TocAzureContainerSeries";
import { YouTube } from "../app/blog/_mdxComponents/YouTube";
import {
  createElement,
  type JSXElementConstructor,
  type ReactElement,
} from "react";
import { isDevelopment } from "../_utils/env";

export const ROOT_POSTS_PATH = path.join(process.cwd(), "/src/_posts");
export const ROOT_PHILOSOPHY_PATH = path.join(
  process.cwd(),
  "/src/_philosophy",
);

export interface Frontmatter {
  title: string;
  date: string;
  categories: string[];
}

export interface FileMetadata {
  year: number;
  date: string;
  fullPathWithFileName: string;
  fileName: string;
  slug: string;
}
export interface MdxData {
  metadata: FileMetadata;
  contentReact?: ReactElement<unknown, string | JSXElementConstructor<unknown>>;
  rawFileContent: string;
  frontmatter: Frontmatter;
}

function parseFrontmatter(content: string): {
  frontmatter: Frontmatter;
  body: string;
} {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(content);
  const rawFrontmatter = match?.[1] ?? "";
  const body = match === null ? content : content.slice(match[0].length);
  const parsed: Record<string, string | string[]> = {};
  const lines = rawFrontmatter.split(/\r?\n/);

  for (let i = 0; i < lines.length; i += 1) {
    const scalar = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(lines[i]);
    if (scalar === null) {
      continue;
    }

    const [, key, rawValue] = scalar;
    if (rawValue === "") {
      const values: string[] = [];
      while (i + 1 < lines.length && /^\s*-\s+/.test(lines[i + 1])) {
        i += 1;
        values.push(
          lines[i].replace(/^\s*-\s+/, "").trim().replace(/^["']|["']$/g, ""),
        );
      }
      parsed[key] = values;
    } else {
      parsed[key] = rawValue.trim().replace(/^["']|["']$/g, "");
    }
  }

  return {
    frontmatter: {
      title: typeof parsed.title === "string" ? parsed.title : "",
      date: typeof parsed.date === "string" ? parsed.date : "",
      categories: Array.isArray(parsed.categories) ? parsed.categories : [],
    },
    body: body,
  };
}

/**
 * Lists MDX/MD filenames under YEAR subfolders within a collection root.
 */
export function getAllMdxFilesWithoutContent(
  collectionRoot: string = ROOT_POSTS_PATH,
): FileMetadata[] {
  const files: FileMetadata[] = [];
  for (let y = FIRST_YEAR; y <= LAST_YEAR; y++) {
    const filePath = path.join(collectionRoot, String(y));
    if (!fs.existsSync(filePath)) {
      continue;
    }
    const fules = fs
      .readdirSync(filePath)
      .filter((p) => /\.mdx?$/.test(p));
    for (const f of fules) {
      files.push({
        year: y,
        date: y.toString(),
        fileName: f,
        fullPathWithFileName: path.join(filePath, f),
        slug: f.slice(0, f.lastIndexOf(".")),
      });
    }
  }
  return files;
}

export async function getMdxFileContent(
  fullPathWithFileName: string,
): Promise<MdxData> {
  const fileContent = await fs.promises.readFile(fullPathWithFileName, "utf8");
  const { frontmatter, body } = parseFrontmatter(fileContent);
  const evaluated = await evaluate(body, {
    ...runtime,
    baseUrl: import.meta.url,
    remarkPlugins: [remarkGfm as never],
    rehypePlugins: [
      [rehypePrism, { ignoreMissing: true, defaultLanguage: "plaintext" }],
    ],
  });
  const Content = evaluated.default;
  const content = createElement(Content, {
    components: {
      TocAzureContainerSeries: TocAzureContainerSeries,
      CodeSandbox: CodeSandbox,
      YouTube: YouTube,
      SoundCloud: SoundCloud,
    },
  });
  const fileName = extractFileFromFullFilePath(fullPathWithFileName);
  const slug = extractSlugFromFileName(fileName);
  const year = extractYearFromStringDate(frontmatter.date);
  return {
    metadata: {
      fullPathWithFileName: fullPathWithFileName,
      fileName: fileName,
      slug: slug,
      year: year,
      date: frontmatter.date,
    },
    contentReact: content as ReactElement<
      unknown,
      string | JSXElementConstructor<unknown>
    >,
    rawFileContent: fileContent,
    frontmatter: frontmatter,
  };
}

export async function getMdxFileMetadata(
  fullPathWithFileName: string,
): Promise<MdxData> {
  const fileContent = await fs.promises.readFile(fullPathWithFileName, "utf8");
  const { frontmatter } = parseFrontmatter(fileContent);
  const fileName = extractFileFromFullFilePath(fullPathWithFileName);
  const slug = extractSlugFromFileName(fileName);
  const year = extractYearFromStringDate(frontmatter.date);
  return {
    metadata: {
      fullPathWithFileName: fullPathWithFileName,
      fileName: fileName,
      slug: slug,
      year: year,
      date: frontmatter.date,
    },
    rawFileContent: fileContent,
    frontmatter: frontmatter,
  };
}

export function extractFileFromFullFilePath(
  fullPathWithFileName: string,
): string {
  return fullPathWithFileName.slice(fullPathWithFileName.lastIndexOf("/") + 1);
}
export function extractSlugFromFileName(fileName: string): string {
  return fileName.slice(0, fileName.lastIndexOf("."));
}
export function extractYearFromStringDate(date: string): number {
  return Number(date.slice(0, 4));
}
export function getTotalPages(posts: MdxData[]): number {
  const allPostCount = posts.length;
  const totalPages = Math.ceil(allPostCount / MAX_POSTS_PER_PAGE);
  return totalPages;
}

async function fetchAllPostsFiltered(
  collectionRoot: string,
): Promise<MdxData[]> {
  const post: Array<Promise<MdxData>> = [];
  const postFilePaths = getAllMdxFilesWithoutContent(collectionRoot);
  for (const p of postFilePaths) {
    post.push(getMdxFileMetadata(p.fullPathWithFileName));
  }
  const posts = await Promise.all(post);
  const today = new Date();
  const blogUntil = isDevelopment()
    ? new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())
    : today;
  blogUntil.setUTCHours(23, 59, 59, 999);
  return posts.filter((p) => new Date(p.metadata.date) <= blogUntil);
}

export async function getPostBySlug(slug: string): Promise<MdxData | undefined> {
  for (let y = LAST_YEAR; y >= FIRST_YEAR; y--) {
    for (const ext of [".mdx", ".md"]) {
      const filePath = path.join(ROOT_POSTS_PATH, String(y), `${slug}${ext}`);
      if (fs.existsSync(filePath)) {
        return await getMdxFileContent(filePath);
      }
    }
  }
  return undefined;
}

export async function getPhilosophyPostBySlug(
  slug: string,
): Promise<MdxData | undefined> {
  for (let y = LAST_YEAR; y >= FIRST_YEAR; y--) {
    for (const ext of [".mdx", ".md"]) {
      const filePath = path.join(
        ROOT_PHILOSOPHY_PATH,
        String(y),
        `${slug}${ext}`,
      );
      if (fs.existsSync(filePath)) {
        return await getMdxFileContent(filePath);
      }
    }
  }
  return undefined;
}

let getAllPostsResult: MdxData[] | undefined;
let getAllPhilosophyPostsResult: MdxData[] | undefined;

/**
 * Get all MDX files content and metadata for the technical blog (`src/_posts`).
 * Optimized to do the I/O only once.
 * Only return the posts that are not in the future.
 * Returns a copy of the cached array so callers cannot mutate the cache.
 */
export async function getAllPosts(): Promise<MdxData[]> {
  if (getAllPostsResult === undefined) {
    getAllPostsResult = await fetchAllPostsFiltered(ROOT_POSTS_PATH);
  }
  return [...getAllPostsResult];
}

/**
 * Get all philosophy MDX posts from `src/_philosophy`, with the same rules as {@link getAllPosts}.
 */
export async function getAllPhilosophyPosts(): Promise<MdxData[]> {
  if (getAllPhilosophyPostsResult === undefined) {
    getAllPhilosophyPostsResult =
      await fetchAllPostsFiltered(ROOT_PHILOSOPHY_PATH);
  }
  return [...getAllPhilosophyPostsResult];
}
