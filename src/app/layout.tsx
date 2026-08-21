import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { PortfolioProgressProvider } from "@/components/pixel-quest/PortfolioProgress";

const geistSans = localFont({
  src: "./fonts/geist-latin.woff2",
  variable: "--font-geist-sans",
  display: "swap",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/geist-mono-latin.woff2",
  variable: "--font-geist-mono",
  display: "swap",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Sukhraj Kalon | Software Engineer & Product Builder",
  description: "Sukhraj Kalon builds secure software, AI-assisted products, cloud systems, and full-stack experiences.",
  keywords: ["Sukhraj Kalon", "software engineer", "full-stack", "React", "TypeScript", "Python", "AWS", "AI automation", "portfolio"],
  icons: [
    {
      rel: 'icon',
      url: '/sk-icon.png',
    },
    {
      rel: 'apple-touch-icon',
      url: '/sk-icon.png',
    },
    {
      rel: 'shortcut icon',
      url: '/sk-icon.png',
    }
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" data-scroll-behavior="smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        <PortfolioProgressProvider>
          <Navbar />
          <main>{children}</main>
        </PortfolioProgressProvider>
      </body>
    </html>
  );
}
