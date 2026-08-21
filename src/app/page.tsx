import { HeroSection } from "@/components/HeroSection";
import { AboutSection } from "@/components/AboutSection";
import { ProjectsSection } from "@/components/ProjectsSection";
import { ContactSection, Footer } from "@/components/Footer";
import { StoryRail } from "@/components/StoryRail";
import { PortfolioMotion } from "@/components/pixel-quest/PortfolioMotion";

export default function Home() {
  return (
    <div className="pq-root min-h-screen overflow-clip bg-background" data-portfolio-theme="orbital-engineering-journey">
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
      <Footer />
    </div>
  );
}
