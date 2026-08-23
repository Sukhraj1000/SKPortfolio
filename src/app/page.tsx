import { HeroSection } from "@/components/HeroSection";
import { AboutSection } from "@/components/AboutSection";
import { ProjectsSection } from "@/components/ProjectsSection";
import { ContactSection, Footer } from "@/components/Footer";
import { PortfolioNavbar } from "@/components/navigation/PortfolioNavbar";
import { PortfolioStructuredData } from "@/components/PortfolioStructuredData";
import { StoryRail } from "@/components/StoryRail";
import { PortfolioMotion } from "@/components/pixel-quest/PortfolioMotion";
import { PortfolioProgressProvider } from "@/components/pixel-quest/PortfolioProgress";

export default function Home() {
  return (
    <PortfolioProgressProvider>
      <PortfolioStructuredData />
      <PortfolioNavbar />
      <main>
        <div
          className="pq-root min-h-screen overflow-clip bg-background"
          data-portfolio-theme="orbital-engineering-journey"
        >
          <PortfolioMotion />
          <HeroSection />
          <div className="pq-journey-layout">
            <StoryRail />
            <div className="pq-journey-content">
              <ProjectsSection />
              <AboutSection />
              <ContactSection />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </PortfolioProgressProvider>
  );
}
