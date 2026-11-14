import { useState, useRef, useEffect } from 'react';

export function ContactSection({ contactSettings }) {
  const [toastMessage, setToastMessage] = useState('');
  const toastTimerRef = useRef(null);

  const email = contactSettings.email || 'me@vinsensiusarka.id';

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const showToast = (msg) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => setToastMessage(''), 2500);
  };

  const handleCopyEmail = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(email);
      }
      showToast(`Copied ${email} to clipboard!`);
    } catch {
      showToast('Copied to clipboard!');
    }
  };

  return (
    <>
      <section id="contact" className="reveal-on-scroll">
        <p className="section__text__p1">Get In Touch</p>
        <h2 className="title">Contact Me</h2>
        <div className="contact-grid">
          <a
            href={`mailto:${email}`}
            className="contact-card"
            aria-label={`Send email to ${email}`}
          >
            <div className="contact-card-icon">
              <i className="fa-solid fa-envelope"></i>
            </div>
            <div className="contact-card-info">
              <span className="contact-card-label">Email</span>
              <span className="contact-card-value">{email}</span>
            </div>
            <button
              type="button"
              className="contact-copy-btn"
              onClick={handleCopyEmail}
              aria-label="Copy email address"
              title="Copy email to clipboard"
            >
              <i className="fa-regular fa-copy"></i>
            </button>
          </a>

          <a
            href={contactSettings.linkedin || 'https://www.linkedin.com/in/vinsensiusarka/'}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-card"
            aria-label="LinkedIn profile"
          >
            <div className="contact-card-icon">
              <i className="fa-brands fa-linkedin"></i>
            </div>
            <div className="contact-card-info">
              <span className="contact-card-label">LinkedIn</span>
              <span className="contact-card-value">Vinsensius Arka</span>
            </div>
          </a>

          <a
            href={contactSettings.github || 'https://github.com/vinsensiusarko'}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-card"
            aria-label="GitHub profile"
          >
            <div className="contact-card-icon">
              <i className="fa-brands fa-github"></i>
            </div>
            <div className="contact-card-info">
              <span className="contact-card-label">GitHub</span>
              <span className="contact-card-value">vinsensiusarko</span>
            </div>
          </a>

          <a
            href={contactSettings.instagram || 'https://www.instagram.com/vinsensiusarko/'}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-card"
            aria-label="Instagram profile"
          >
            <div className="contact-card-icon">
              <i className="fa-brands fa-instagram"></i>
            </div>
            <div className="contact-card-info">
              <span className="contact-card-label">Instagram</span>
              <span className="contact-card-value">@vinsensiusarko</span>
            </div>
          </a>

          <a
            href={contactSettings.facebook || 'https://www.facebook.com/vinsensiusarko/'}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-card"
            aria-label="Facebook profile"
          >
            <div className="contact-card-icon">
              <i className="fa-brands fa-facebook"></i>
            </div>
            <div className="contact-card-info">
              <span className="contact-card-label">Facebook</span>
              <span className="contact-card-value">Vinsensius Arka</span>
            </div>
          </a>

          <a
            href={contactSettings.twitter || 'https://x.com/vinsensiusarko'}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-card"
            aria-label="X Twitter profile"
          >
            <div className="contact-card-icon">
              <i className="fa-brands fa-x-twitter"></i>
            </div>
            <div className="contact-card-info">
              <span className="contact-card-label">X / Twitter</span>
              <span className="contact-card-value">@vinsensiusarko</span>
            </div>
          </a>
        </div>
      </section>

      <div
        id="public-toast"
        className={`public-toast ${toastMessage ? 'show' : ''}`}
        role="alert"
        aria-live="polite"
      >
        {toastMessage && (
          <>
            <i className="fa-solid fa-circle-check" style={{ color: '#10b981' }}></i>{' '}
            {toastMessage}
          </>
        )}
      </div>
    </>
  );
}
