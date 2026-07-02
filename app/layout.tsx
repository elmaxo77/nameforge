import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NameForge — Find the names you can actually own.",
  description: "Generate, score, and shortlist brandable startup names.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
