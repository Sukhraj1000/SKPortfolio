import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sukhraj Kalon | Software Engineer & Product Builder",
  description: "Sukhraj Kalon builds secure software, AI-assisted products, cloud systems, and full-stack experiences.",
  keywords: ["Sukhraj Kalon", "software engineer", "full-stack", "React", "TypeScript", "Python", "AWS", "AI automation", "portfolio"],
  icons: [
    {
      rel: 'icon',
      url: '/pixelprofile.png',
    },
    {
      rel: 'apple-touch-icon',
      url: '/pixelprofile.png',
    },
    {
      rel: 'shortcut icon',
      url: '/pixelprofile.png',
    }
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" data-theme="iron-signal">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          <Navbar />
          <main>{children}</main>
        </ThemeProvider>
        <script src="/js/csp-report.js" async defer></script>
      </body>
    </html>
  );
}
