import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import NavBar from "@/components/NavBar";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Gym Buddy Gemini",
  description: "Your intelligent, personalized workout tracker.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${jetbrainsMono.variable} font-mono antialiased bg-[#0a0a0f] text-slate-200 min-h-screen flex flex-col`}>
        <NavBar />
        <div className="flex-1">
          {children}
        </div>
      </body>
    </html>
  );
}
