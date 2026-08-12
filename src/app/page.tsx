import { HeroSection } from "@/components/HeroSection";
import { AboutSection } from "@/components/AboutSection";
import { ProjectsSection } from "@/components/ProjectsSection";
import { Footer } from "@/components/Footer";
import { StoryRail } from "@/components/StoryRail";

export default function Home() {
  return (
    <div className="min-h-screen overflow-clip bg-background">
      <HeroSection />
      <StoryRail />
      <ProjectsSection />
      <AboutSection />
      <Footer />
    </div>
  );
}
