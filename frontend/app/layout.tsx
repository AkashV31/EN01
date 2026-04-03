import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CanopyROI",
  description:
    "CanopyROI frontend for forestry intelligence, ESG analytics, and rupee-based carbon project ROI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
