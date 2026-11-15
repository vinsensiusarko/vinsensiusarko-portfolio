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
import { ExperienceSection } from '../components/sections/ExperienceSection';
import { ProjectsSection } from '../components/sections/ProjectsSection';
import { ContactSection } from '../components/sections/ContactSection';

export function HomePage() {
  const { projects, skills, siteSettings, contactSettings } = usePortfolioData();
  const { hash } = useLocation();
  useScrollReveal('.reveal-on-scroll', [projects.length, skills.length]);

  useEffect(() => {
    recordPageView();
  }, []);

  useEffect(() => {
    document.title = `${siteSettings.name || 'Vinsensius Arka'} — Web & Mobile Developer`;
  }, [siteSettings.name]);

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
      <a href="#profile" className="skip-link">
        Skip to main content
      </a>
      <Navbar variant="home" siteName={siteSettings.name} />
      <main id="main-content">
        <HeroSection siteSettings={siteSettings} contactSettings={contactSettings} />
        <AboutSection siteSettings={siteSettings} />
        <ExperienceSection skills={skills} />
        <ProjectsSection projects={projects} />
        <ContactSection contactSettings={contactSettings} />
      </main>
      <Footer variant="home" siteName={siteSettings.name} />
      <FloatingActions whatsapp={contactSettings.whatsapp} />
    </>
  );
}
