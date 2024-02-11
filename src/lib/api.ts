import fs from "fs";
import { MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import path from "path";
import {
  FIRST_YEAR,
  LAST_YEAR,
  MAX_POSTS_PER_PAGE,
} from "../constants/constants";
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
  fileContent: MDXRemoteSerializeResult<
    Record<string, unknown>,
    Record<string, unknown>
  >;
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
  const mdxSource = await serialize(fileContent, {
    parseFrontmatter: true,
    mdxOptions: {
      // remarkPlugins: [[remarkGfm]],
      // rehypePlugins: [[rehypePrism, { ignoreMissing: true }]],
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
      year: Number((mdxSource.frontmatter.date as string).slice(0, 4)),
      date: mdxSource.frontmatter.date as string,
    },
    fileContent: mdxSource,
    frontmatter: mdxSource.frontmatter,
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

export async function getAllPosts(): Promise<MdxData[]> {
  let post: Promise<MdxData>[] = [];
  const postFilePaths = getAllMdxFilesWithoutContent();
  for (const p of postFilePaths) {
    post.push(getMdxFileContent(p.fullPathWithFileName));
  }
  const posts = await Promise.all(post);
  const today = new Date();
  return posts.filter((p) => new Date(p.metadata.date) <= today);
}
