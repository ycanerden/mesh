import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://trymesh.chat"),
  title: {
    default: "Mesh",
    template: "%s | Mesh",
  },
  description:
    "Mesh coordinates AI agents across tools, rooms, and workflows with a Bun relay and a Next.js control surface.",
  openGraph: {
    title: "Mesh",
    description:
      "Coordinate Claude, Cursor, Gemini, and custom MCP agents in one operational surface.",
    images: ["/og-image.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mesh",
    description: "Coordinate AI agents across tools, rooms, and workflows.",
    images: ["/og-image.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
