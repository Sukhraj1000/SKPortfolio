import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Portfolio | Sukhraj Kalon",
  description: "A unique and creative portfolio showcasing my work and skills",
  keywords: ["portfolio", "developer", "designer", "creative", "web", "nextjs"],
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
        
        {/* Script for interactive cursor gradient effect */}
        <script dangerouslySetInnerHTML={{ __html: `
          document.addEventListener('mousemove', (e) => {
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            
            const bg = document.getElementById('gradient-bg');
            if (bg) {
              bg.style.background = 'radial-gradient(circle at ' + x*100 + '% ' + y*100 + '%, rgba(125, 39, 255, 0.08), transparent 40%)';
            }
          });
        `}} />
      </body>
    </html>
  );
}
