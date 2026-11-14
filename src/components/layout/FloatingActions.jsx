import { useState, useEffect } from 'react';

export function FloatingActions({ whatsapp = '6285179793167' }) {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cleanWa = String(whatsapp || '6285179793167').replace(/\D/g, '');

  return (
    <div className="floating-actions" aria-label="Quick action buttons">
      <button
        type="button"
        id="back-to-top-btn"
        className={`back-to-top-btn ${showBackToTop ? 'show' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
        title="Back to top"
      >
        <i className="fa-solid fa-arrow-up"></i>
      </button>
      <a
        href={`https://api.whatsapp.com/send?phone=${cleanWa}`}
        className="float whatsapp-float-btn"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp"
      >
        <i className="fa-brands fa-whatsapp my-float"></i>
      </a>
    </div>
  );
}
