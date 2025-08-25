import fs from "fs";
import path from "path";
import { compileMDX } from "next-mdx-remote/rsc";
import {
  FIRST_YEAR,
  LAST_YEAR,
  MAX_POSTS_PER_PAGE,
} from "../constants/constants";
import rehypePrism from "rehype-prism-plus";
import remarkGfm from "remark-gfm";
import { CodeSandbox } from "../app/blog/_mdxComponents/CodeSandbox";
import { SoundCloud } from "../app/blog/_mdxComponents/SoundCloud";
import { TocAzureContainerSeries } from "../app/blog/_mdxComponents/TocAzureContainerSeries";
import { YouTube } from "../app/blog/_mdxComponents/YouTube";
import { type ReactElement, type JSXElementConstructor } from "react";
import { isDevelopment } from "../_utils/env";

export const ROOT_POSTS_PATH = path.join(process.cwd(), "/src/_posts");

export interface FileMetadata {
  year: number;
  date: string;
  fullPathWithFileName: string;
  fileName: string;
  slug: string;
}
export interface MdxData {
  metadata: FileMetadata;
  contentReact: ReactElement<unknown, string | JSXElementConstructor<unknown>>;
  rawFileContent: string;
  frontmatter: Record<string, unknown>;
}

export function getAllMdxFilesWithoutContent(): FileMetadata[] {
  const files: FileMetadata[] = [];
  for (let y = FIRST_YEAR; y <= LAST_YEAR; y++) {
    const filePath = `${ROOT_POSTS_PATH}/${y}`;
    // Ensure that the directory exists (might not have any article for the year yet, especially on the change of year)
    if (!fs.existsSync(filePath)) {
      continue;
    }
    const fules = fs
      .readdirSync(filePath)
      .filter((path) => /\.mdx?$/.test(path));
    for (const f of fules) {
      files.push({
        year: y,
        date: y.toString(),
        fileName: f,
        fullPathWithFileName: `${filePath}/${f}`,
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
  const { content, frontmatter } = await compileMDX({
    source: fileContent,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          [rehypePrism, { ignoreMissing: true, defaultLanguage: "plaintext" }],
        ],
      },
    },
    components: {
      TocAzureContainerSeries: TocAzureContainerSeries,
      CodeSandbox: CodeSandbox,
      YouTube: YouTube,
      SoundCloud: SoundCloud,
    },
  });
  const fileName = extractFileFromFullFilePath(fullPathWithFileName);
  const slug = extractSlugFromFileName(fileName);
  const year = extractYearFromStringDate(frontmatter.date as string);
  return {
    metadata: {
      fullPathWithFileName: fullPathWithFileName,
      fileName: fileName,
      slug: slug,
      year: year,
      date: frontmatter.date as string,
    },
    contentReact: content,
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

let getAllPostsResult: MdxData[] | undefined;
/**
 * Get all MDX files content and metadata.
 * Optimized to do the I/O only once.
 * Only return the posts that are not in the future.
 * @returns
 */
export async function getAllPosts(): Promise<MdxData[]> {
  if (getAllPostsResult === undefined) {
    const post: Array<Promise<MdxData>> = [];
    const postFilePaths = getAllMdxFilesWithoutContent();
    for (const p of postFilePaths) {
      post.push(getMdxFileContent(p.fullPathWithFileName));
    }
    const posts = await Promise.all(post);
    const today = new Date();
    const blogUntil = isDevelopment()? new Date(today.getFullYear()+1, today.getMonth(), today.getDate()):today;
    blogUntil.setUTCHours(23, 59, 59, 999);
    getAllPostsResult = posts.filter((p) => new Date(p.metadata.date) <= blogUntil);
  }
  return getAllPostsResult;
}
