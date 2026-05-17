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
  title: "Sukhraj Kalon | Software Engineer",
  description: "Software Engineer portfolio for Sukhraj Kalon, covering full-stack development, AI automation, cloud services, secure engineering, and product builds.",
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
    <html lang="en" className="scroll-smooth dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen relative`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
        >
          {/* Dynamic background gradient that follows cursor */}
          <div className="pointer-events-none fixed inset-0 z-[-1] bg-gradient-to-tr from-background to-background via-purple-500/5 opacity-50 blur-[100px] transition-opacity duration-1000" id="gradient-bg"></div>
          
          <Navbar />
          <main className="mx-auto max-w-7xl">
            {children}
          </main>
        </ThemeProvider>
        
        {/* Use a safe script import instead of dangerouslySetInnerHTML */}
        <script src="/js/cursor-effect.js" async defer></script>
        
        {/* CSP reporting script */}
        <script src="/js/csp-report.js" async defer></script>
      </body>
    </html>
  );
}
