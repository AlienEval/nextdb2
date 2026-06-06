import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Premium Login App",
  description: "A beautiful Next.js login integrated with Cloudflare D1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        {children}
      </body>
    </html>
  );
}
