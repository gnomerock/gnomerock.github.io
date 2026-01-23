import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gnomerock Studio",
  description: "Personal portfolio and terminal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
