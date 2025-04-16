import { HeroSection } from "@/components/HeroSection";
import { AboutSection } from "@/components/AboutSection";
import { ProjectsSection } from "@/components/ProjectsSection";
import { Footer } from "@/components/Footer";
import { Particles } from "@/components/ui/particles";

export default function Home() {
  return (
    <div className="min-h-screen relative">
      {/* Particle background effect */}
      <div className="fixed inset-0 -z-10">
        <Particles 
          quantity={75}
          staticity={30}
          speed={0.5}
          particleColor="#8A2BE2"
        />
      </div>
      
      <HeroSection />
      <AboutSection />
      <ProjectsSection />
      <Footer />
    </div>
  );
}
