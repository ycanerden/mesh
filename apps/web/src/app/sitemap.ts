import type { MetadataRoute } from "next";

const routes = [
  "",
  "/setup",
  "/install",
  "/pricing",
  "/privacy",
  "/terms",
  "/changelog",
  "/waitlist",
  "/docs",
  "/api-docs",
  "/mesh-manifesto",
  "/dashboard",
  "/office",
  "/activity",
  "/analytics",
  "/leaderboard",
  "/rooms",
  "/settings",
  "/team",
  "/demo",
  "/compact",
  "/master-dashboard",
  "/watch",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `https://trymesh.chat${route}`,
    lastModified: new Date("2026-03-28"),
  }));
}
