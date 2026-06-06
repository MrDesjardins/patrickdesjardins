export function slugFromMdxFilename(filename: string): string {
  return filename.replace(/\.mdx?$/, "");
}
