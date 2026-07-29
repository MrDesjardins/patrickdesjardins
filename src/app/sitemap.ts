import { type MetadataRoute } from "next";
import { getAllPhilosophyPosts, getAllPosts } from "../lib/api";
import {
  FIRST_YEAR,
  LAST_YEAR,
  MAX_POSTS_PER_PAGE,
  PHILOSOPHY_FIRST_YEAR,
} from "../constants/constants";
import { categorySlug } from "./blog/_components/BlogCategories";

const BASE_URL = "https://patrickdesjardins.com";

export default async function sitemap(): Promise<MetadataRoute["Sitemap"]> {
  const [posts, philosophyPosts] = await Promise.all([
    getAllPosts(),
    getAllPhilosophyPosts(),
  ]);

  const postEntries: MetadataRoute["Sitemap"] = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.metadata.slug}`,
    lastModified: new Date(post.metadata.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const philosophyEntries: MetadataRoute["Sitemap"] = philosophyPosts.map(
    (post) => ({
      url: `${BASE_URL}/philosophy/${post.metadata.slug}`,
      lastModified: new Date(post.metadata.date),
      changeFrequency: "monthly",
      priority: 0.65,
    }),
  );
  const archiveEntries: MetadataRoute["Sitemap"] = [
    ...Array.from(
      { length: Math.ceil(posts.length / MAX_POSTS_PER_PAGE) },
      (_, index) => `${BASE_URL}/blog/page/${index + 1}`,
    ),
    ...Array.from(
      { length: Math.max(1, Math.ceil(philosophyPosts.length / MAX_POSTS_PER_PAGE)) },
      (_, index) => `${BASE_URL}/philosophy/page/${index + 1}`,
    ),
    ...Array.from(
      { length: LAST_YEAR - FIRST_YEAR + 1 },
      (_, index) => `${BASE_URL}/blog/for/${LAST_YEAR - index}`,
    ),
    ...Array.from(
      { length: LAST_YEAR - PHILOSOPHY_FIRST_YEAR + 1 },
      (_, index) => `${BASE_URL}/philosophy/for/${LAST_YEAR - index}`,
    ),
    ...[
      ...new Set(
        posts.flatMap((post) => post.frontmatter.categories.map(categorySlug)),
      ),
    ].map((category) => `${BASE_URL}/blog/category/${category}`),
    ...[
      ...new Set(
        philosophyPosts.flatMap((post) =>
          post.frontmatter.categories.map(categorySlug),
        ),
      ),
    ].map((category) => `${BASE_URL}/philosophy/category/${category}`),
  ].map((url) => ({
    url: url,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/philosophy`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/blog/search`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/philosophy/search`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...postEntries,
    ...philosophyEntries,
    ...archiveEntries,
  ];
}
