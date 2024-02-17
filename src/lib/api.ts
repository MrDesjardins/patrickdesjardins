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
import { ReactElement, JSXElementConstructor } from "react";
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
  contentReact: ReactElement<any, string | JSXElementConstructor<any>>;
  rawFileContent: string;
  frontmatter: Record<string, unknown>;
}

export function getAllMdxFilesWithoutContent(): FileMetadata[] {
  let files: FileMetadata[] = [];
  for (let y = FIRST_YEAR; y <= LAST_YEAR; y++) {
    const filePath = `${ROOT_POSTS_PATH}/${y}`;

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
    files.push();
  }
  return files;
}

export async function getMdxFileContent(
  fullPathWithFileName: string
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
  const fileName = fullPathWithFileName.slice(
    fullPathWithFileName.lastIndexOf("/") + 1
  );
  return {
    metadata: {
      fullPathWithFileName: fullPathWithFileName,
      fileName: fileName,
      slug: fileName.slice(0, fileName.lastIndexOf(".")),
      year: Number((frontmatter.date as string).slice(0, 4)),
      date: frontmatter.date as string,
    },
    contentReact: content,
    rawFileContent: fileContent,
    frontmatter: frontmatter,
  };
}

export async function getTotalPagesCount(): Promise<number> {
  const allPosts = await getAllPosts();
  return getTotalPages(allPosts);
}
export function getTotalPages(posts: MdxData[]): number {
  const allPostCount = posts.length;
  const totalPages = Math.ceil(allPostCount / MAX_POSTS_PER_PAGE);
  return totalPages;
}

let getAllPostsResult: MdxData[] | undefined = undefined;
export async function getAllPosts(): Promise<MdxData[]> {
  if (getAllPostsResult === undefined) {
    let post: Promise<MdxData>[] = [];
    const postFilePaths = getAllMdxFilesWithoutContent();
    for (const p of postFilePaths) {
      post.push(getMdxFileContent(p.fullPathWithFileName));
    }
    const posts = await Promise.all(post);
    const today = new Date();
    today.setHours(23, 59, 59, 0);
    getAllPostsResult = posts.filter((p) => new Date(p.metadata.date) <= today);
  }
  return getAllPostsResult;
}
