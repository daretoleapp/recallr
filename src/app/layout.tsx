import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Recallr — Long-term memory for AI agents",
  description:
    "Persistent memory layer powered by Xiaomi MiMo. Your AI agents remember everything across sessions — text, images, voice — and reason over it.",
  openGraph: {
    title: "Recallr — Long-term memory for AI agents",
    description: "Persistent memory layer powered by Xiaomi MiMo.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
