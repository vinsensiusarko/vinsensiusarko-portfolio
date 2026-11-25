import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { usePortfolioData } from '../hooks/usePortfolioData';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { recordPageView } from '../services/visitorTracker';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { FloatingActions } from '../components/layout/FloatingActions';
import { HeroSection } from '../components/sections/HeroSection';
import { AboutSection } from '../components/sections/AboutSection';
import { JourneySection } from '../components/sections/JourneySection';
import { ExperienceSection } from '../components/sections/ExperienceSection';
import { ProjectsSection } from '../components/sections/ProjectsSection';
import { ContactSection } from '../components/sections/ContactSection';

export function HomePage() {
  const { projects, skills, siteSettings, contactSettings } = usePortfolioData();
  const { hash } = useLocation();
  useScrollReveal('.reveal-on-scroll', [
    projects.length,
    skills.length,
    siteSettings.timeline?.length || 0
  ]);

  useEffect(() => {
    recordPageView();
  }, []);

  useEffect(() => {
    const pageTitle =
      siteSettings.ogTitle || `${siteSettings.name || 'Vinsensius Arka'} | Web & Mobile Developer`;
    document.title = pageTitle;

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', pageTitle);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc && siteSettings.ogDescription) {
      ogDesc.setAttribute('content', siteSettings.ogDescription);
    }

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage && siteSettings.ogImage) {
      ogImage.setAttribute('content', siteSettings.ogImage);
    }
  }, [siteSettings]);

  useEffect(() => {
    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth' });
        }, 50);
      }
    }
  }, [hash]);

  return (
    <>
      <a
        href="#profile"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2.5 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-lg"
      >
        Skip to main content
      </a>
      <Navbar variant="home" siteName={siteSettings.name} />
      <main id="main-content">
        <HeroSection siteSettings={siteSettings} contactSettings={contactSettings} />
        <AboutSection siteSettings={siteSettings} />
        <JourneySection timeline={siteSettings.timeline} />
        <ExperienceSection skills={skills} />
        <ProjectsSection projects={projects} />
        <ContactSection contactSettings={contactSettings} siteSettings={siteSettings} />
      </main>
      <Footer variant="home" siteName={siteSettings.name} />
      <FloatingActions whatsapp={contactSettings.whatsapp} />
    </>
  );
}
