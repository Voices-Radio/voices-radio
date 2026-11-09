import { PodcastNav } from "./podcast-nav";
import { AboutSection } from "./sections/about";
import { BlogSection } from "./sections/blog";
import { ContactSection } from "./sections/contact";
import { Footer } from "./sections/footer";
import { HeroSection } from "./sections/hero";
import { ServicesSection } from "./sections/services";
import { StudioSection } from "./sections/studio";
import { TechnologySection } from "./sections/technology";

/**
 * /podcast — Voices Studio. A server component: the page is static marketing
 * content, and only the nav (scroll state) and in-page links need the browser.
 */
export default function PodcastPage() {
  return (
    <div className="min-h-screen">
      <PodcastNav />
      <HeroSection />
      <AboutSection />
      <StudioSection />
      <ServicesSection />
      <BlogSection />
      <TechnologySection />
      <ContactSection />
      <Footer />
    </div>
  );
}
