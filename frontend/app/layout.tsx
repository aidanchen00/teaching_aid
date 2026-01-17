import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Learning App - Interactive AI-Powered Education",
  description: "Experience the future of education with split-screen learning, real-time video collaboration, and AI-powered tutoring. Built with LiveKit for seamless interactive learning.",
  keywords: ["learning", "education", "AI tutor", "video learning", "LiveKit", "interactive learning"],
  authors: [{ name: "Learning App Team" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#6366f1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
