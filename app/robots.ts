import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        // Only the public marketing/auth pages should be crawled
        allow: ["/login", "/register"],
        // Block all private/authenticated routes
        disallow: [
          "/",
          "/trash",
          "/starred",
          "/recent",
          "/shared-with-me",
          "/search",
          "/shared-folder/",
          "/overview",
          "/users",
          "/files",
          "/folders",
          "/api/",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
