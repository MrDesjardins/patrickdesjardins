import { type MetadataRoute } from "next";
import { getAllPhilosophyPosts, getAllPosts } from "../lib/api";

const BASE_URL = "https://patrickdesjardins.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, philosophyPosts] = await Promise.all([
    getAllPosts(),
    getAllPhilosophyPosts(),
  ]);

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.metadata.slug}`,
    lastModified: new Date(post.metadata.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const philosophyEntries: MetadataRoute.Sitemap = philosophyPosts.map(
    (post) => ({
      url: `${BASE_URL}/philosophy/${post.metadata.slug}`,
      lastModified: new Date(post.metadata.date),
      changeFrequency: "monthly",
      priority: 0.65,
    }),
  );

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
      url: `${BASE_URL}/philosophy/search`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...postEntries,
    ...philosophyEntries,
  ];
}
