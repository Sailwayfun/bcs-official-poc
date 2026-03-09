import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bio Canvas Studio",
  description: "Scroll-driven biotech hero animation built with Next.js and GSAP.",
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
