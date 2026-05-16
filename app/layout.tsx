import type { Metadata } from "next";
import "./globals.css";
import { LayoutGrid } from "./components/LayoutGrid";
import { SkeletonView } from "./components/SkeletonView";
import { FloatingContact } from "./components/FloatingContact";
import { SequinBackground } from "./components/SequinBackground";

export const metadata: Metadata = {
  title: "Shrikant Nikam · Designer",
  description:
    "Small town kid. Fine arts degree. Product design ambitions. Logo, brand identity, and graphic design. Building toward AI product design.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col text-fg"
        suppressHydrationWarning
      >
        <SequinBackground />
        {children}
        <LayoutGrid />
        <SkeletonView />
        <FloatingContact />
      </body>
    </html>
  );
}
