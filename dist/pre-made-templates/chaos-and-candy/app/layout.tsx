import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chaos & Candy | The Social Club",
  description: "Find a room, create an avatar, and hang out in a neon browser-based social club.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
