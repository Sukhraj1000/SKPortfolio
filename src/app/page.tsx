import { HeroSection } from "@/components/HeroSection";
import { AboutSection } from "@/components/AboutSection";
import { ProjectsSection } from "@/components/ProjectsSection";
import { Footer } from "@/components/Footer";
import { StoryRail } from "@/components/StoryRail";

export default function Home() {
  return (
    <div className="pq-root min-h-screen overflow-clip bg-background" data-portfolio-theme="pixel-quest">
      <HeroSection />
      <StoryRail />
      <ProjectsSection />
      <AboutSection />
      <Footer />
    </div>
  );
}
