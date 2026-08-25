import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { siteOrigin } from "@/lib/site";

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

const siteTitle = "Sukhraj Kalon | Software Engineer & Product Builder";
const siteDescription =
  "Sukhraj Kalon builds secure software, AI-assisted products, cloud systems, and full-stack experiences.";
const socialCard = "/sukhraj-kalon-social-card.png";
const socialCardAlt = "Sukhraj Kalon software engineer and product builder portfolio card";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: siteTitle,
  description: siteDescription,
  alternates: { canonical: "/" },
  keywords: [
    "Sukhraj Kalon",
    "software engineer",
    "full-stack",
    "React",
    "TypeScript",
    "Python",
    "AWS",
    "AI automation",
    "portfolio",
  ],
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Sukhraj Kalon Portfolio",
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: socialCard,
        width: 1200,
        height: 630,
        alt: socialCardAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: { url: socialCard, alt: socialCardAlt },
  },
  robots: { index: true, follow: true },
  icons: [
    {
      rel: "icon",
      url: "/sk-icon.png",
    },
    {
      rel: "apple-touch-icon",
      url: "/sk-icon.png",
    },
    {
      rel: "shortcut icon",
      url: "/sk-icon.png",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" data-scroll-behavior="smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}>
        {children}
      </body>
    </html>
  );
}
