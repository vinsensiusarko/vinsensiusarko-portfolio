import { useState, useEffect } from 'react';
import { useSeason } from '../../context/SeasonContext';

export function HeroSection({ siteSettings, contactSettings }) {
  const { seasonMeta } = useSeason();
  const roles =
    Array.isArray(siteSettings.typewriterRoles) &&
    siteSettings.typewriterRoles.length > 0
      ? siteSettings.typewriterRoles
      : ['Web Developer', 'Mobile Developer'];

  const [roleIndex, setRoleIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentRole = roles[roleIndex % roles.length];
    const isPauseAtEnd = !isDeleting && displayText === currentRole;
    const delay = isPauseAtEnd ? 1600 : isDeleting ? 45 : 95;

    const timer = setTimeout(() => {
      if (isPauseAtEnd) {
        setIsDeleting(true);
      } else if (isDeleting && displayText === '') {
        setIsDeleting(false);
        setRoleIndex((prev) => (prev + 1) % roles.length);
      } else {
        setDisplayText(
          currentRole.substring(0, displayText.length + (isDeleting ? -1 : 1))
        );
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, roleIndex, roles]);

  const cvHref = siteSettings.cvBase64 || siteSettings.cvUrl || '/assets/docs/cv-vinsensiusarka.pdf';
  const isBase64Cv = Boolean(siteSettings.cvBase64);

  return (
    <section id="profile">
      <div className="section__pic-container">
        <img
          id="hero-img"
          src={siteSettings.heroImage || '/assets/images/arko-pic.png'}
          alt={`Portrait of ${siteSettings.name || 'Vinsensius Arka'}`}
          width="380"
          height="380"
        />
      </div>
      <div className="section__text">
        <div className="hero-season-badge" aria-label={`Active season: ${seasonMeta.labelEn}`}>
          <span>{seasonMeta.badgeText}</span>
        </div>
        <p className="section__text__p1">{siteSettings.heroGreeting || "Hello, I'm"}</p>
        <h1 className="title">{siteSettings.name || 'Vinsensius Arka'}</h1>
        <p className="section__text__p2">
          <span className="typeWriter">{displayText || roles[0]}</span>
        </p>
        <div className="btn-container">
          <a
            href={cvHref}
            download={
              isBase64Cv || cvHref.endsWith('.pdf')
                ? siteSettings.cvFileName || 'CV-VinsensiusArka.pdf'
                : undefined
            }
            target={!isBase64Cv && cvHref.startsWith('http') ? '_blank' : undefined}
            rel={!isBase64Cv && cvHref.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="btn btn-color-2"
          >
            <i className="fa-solid fa-file-arrow-down"></i> Download CV
          </a>
          <a href="#contact" className="btn btn-color-1">
            <i className="fa-solid fa-paper-plane"></i> Contact Info
          </a>
        </div>
        <div id="socials-container">
          <a
            href={contactSettings.linkedin || 'https://www.linkedin.com/in/vinsensiusarka/'}
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
            aria-label="LinkedIn Profile"
          >
            <i className="fa-brands fa-linkedin"></i>
          </a>
          <a
            href={contactSettings.github || 'https://github.com/vinsensiusarko'}
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
            aria-label="GitHub Profile"
          >
            <i className="fa-brands fa-github"></i>
          </a>
        </div>
      </div>
    </section>
  );
}
