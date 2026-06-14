export interface Metadata {
  title?: string;
  description?: string;
  openGraph?: Record<string, unknown>;
  twitter?: Record<string, unknown>;
}

export interface MetadataRouteTypes {
  Robots: {
    rules: {
      userAgent: string;
      allow?: string;
      disallow?: string;
    };
    sitemap?: string;
  };

  Sitemap: Array<{
    url: string;
    lastModified?: Date;
    changeFrequency?: string;
    priority?: number;
  }>;
}

export type MetadataRoute = MetadataRouteTypes;
