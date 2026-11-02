import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spring Boot + Next.js starter",
  description:
    "A starter template with a Spring Boot backend and a Next.js web app",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
