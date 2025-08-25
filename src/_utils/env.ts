
export function isDevelopment(): boolean {
  return process.env.BLOG_ENV === "development";
}