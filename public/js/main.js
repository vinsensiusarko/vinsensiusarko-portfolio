/**
 * Vinsensius Arka Portfolio - Main JavaScript
 * Handles Theme Toggle, Navigation, Scroll Animations, and Firestore Real-time Synchronization
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initScrollEffects();
  initIntersectionObserver();
  initYear();
  initFirestoreSync();
});

/* ==========================================================================
   1. Theme Toggle (Light / Dark Mode)
   ========================================================================== */
function initTheme() {
  const root = document.documentElement;
  const themeToggles = document.querySelectorAll('.theme-toggle');

  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

  applyTheme(initialTheme);

  themeToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const currentTheme = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
      localStorage.setItem('theme', newTheme);
    });
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    const isDark = theme === 'dark';

    themeToggles.forEach(toggle => {
      toggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
      const icon = toggle.querySelector('i');
      if (icon) {
        icon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
      }
    });
  }
}

/* ==========================================================================
   2. Navigation & Mobile Drawer
   ========================================================================== */
function initNavigation() {
  const hamburger = document.querySelector('.hamburger-icon');
  const menuLinks = document.querySelector('.menu-links');

  if (!hamburger || !menuLinks) return;

  function toggleMenu(forceClose = false) {
    const isCurrentlyOpen = hamburger.classList.contains('open');
    const shouldOpen = forceClose ? false : !isCurrentlyOpen;

    hamburger.classList.toggle('open', shouldOpen);
    menuLinks.classList.toggle('open', shouldOpen);
    hamburger.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');

    if (shouldOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  menuLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggleMenu(true);
    });
  });

  document.addEventListener('click', (e) => {
    if (menuLinks.classList.contains('open') && !menuLinks.contains(e.target) && !hamburger.contains(e.target)) {
      toggleMenu(true);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuLinks.classList.contains('open')) {
      toggleMenu(true);
      hamburger.focus();
    }
  });

  window.toggleMenu = toggleMenu;
}

/* ==========================================================================
   3. Sticky Navbar & Smooth Scroll
   ========================================================================== */
function initScrollEffects() {
  const desktopNav = document.getElementById('desktop-nav');
  const mobileNav = document.getElementById('hamburger-nav');

  const handleScroll = () => {
    const isScrolled = window.scrollY > 20;
    if (desktopNav) desktopNav.classList.toggle('scrolled', isScrolled);
    if (mobileNav) mobileNav.classList.toggle('scrolled', isScrolled);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#' || href === '') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const navHeight = (desktopNav && window.innerWidth > 1200) ? desktopNav.offsetHeight : 70;
        const targetPos = target.getBoundingClientRect().top + window.scrollY - navHeight;

        window.scrollTo({
          top: targetPos,
          behavior: 'smooth'
        });
      }
    });
  });
}

/* ==========================================================================
   4. Scroll Reveal Animations (IntersectionObserver)
   ========================================================================== */
function initIntersectionObserver() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    document.querySelectorAll('.reveal-on-scroll').forEach(el => el.classList.add('revealed'));
    return;
  }

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.12
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal-on-scroll').forEach(el => {
    observer.observe(el);
  });
}

/* ==========================================================================
   5. Dynamic Copyright Year
   ========================================================================== */
function initYear() {
  const yearSpan = document.getElementById('current-year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
}

/* ==========================================================================
   6. Firestore Real-time Synchronization (Graceful Dynamic Loading)
   ========================================================================== */
function initFirestoreSync() {
  if (typeof db === 'undefined' || !db) return;

  // 1. Projects Real-Time Listener
  db.collection('projects').orderBy('order', 'asc').onSnapshot((snapshot) => {
    if (snapshot.empty) return;

    const projects = [];
    snapshot.forEach(doc => {
      projects.push({ id: doc.id, ...doc.data() });
    });

    renderDynamicProjects(projects);
  }, (error) => {
    console.warn('Firestore projects listener (using fallback):', error);
  });

  // 2. Skills Real-Time Listener
  db.collection('skills').orderBy('order', 'asc').onSnapshot((snapshot) => {
    if (snapshot.empty) return;

    const skills = [];
    snapshot.forEach(doc => {
      skills.push({ id: doc.id, ...doc.data() });
    });

    renderDynamicSkills(skills);
  }, (error) => {
    console.warn('Firestore skills listener (using fallback):', error);
  });

  // 3. Site Settings (Bio, CV, Stats, Typewriter)
  db.collection('settings').doc('site_settings').onSnapshot((doc) => {
    if (!doc.exists) return;
    const data = doc.data();

    // Name
    if (data.name) {
      document.querySelectorAll('#profile .title').forEach(el => el.textContent = data.name);
    }

    // Hero Greeting
    if (data.heroGreeting) {
      const gEl = document.querySelector('#profile .section__text__p1');
      if (gEl) gEl.textContent = data.heroGreeting;
    }

    // Bio Text
    if (data.bioText) {
      const bioEl = document.querySelector('#about .text-container p');
      if (bioEl) bioEl.textContent = data.bioText;
    }

    // Experience & Education Cards
    if (data.expYears || data.expSub) {
      const expCardP = document.querySelector('#about .about-containers .details-container:nth-child(1) p');
      if (expCardP) {
        expCardP.innerHTML = `${data.expYears || '3+ years'} <br />${data.expSub || 'Web & Mobile Development'}`;
      }
    }
    if (data.eduDegree || data.eduMajor) {
      const eduCardP = document.querySelector('#about .about-containers .details-container:nth-child(2) p');
      if (eduCardP) {
        eduCardP.innerHTML = `${data.eduDegree || 'Bachelors Degree'} <br />${data.eduMajor || 'Computer Science'}`;
      }
    }

    // CV Download Link / Base64 File
    const cvBtn = document.querySelector('#profile a[href*="cv"], #profile a[download]');
    if (cvBtn) {
      if (data.cvBase64) {
        cvBtn.href = data.cvBase64;
        cvBtn.download = data.cvFileName || 'CV-VinsensiusArka.pdf';
        cvBtn.removeAttribute('target');
      } else if (data.cvUrl) {
        cvBtn.href = data.cvUrl;
        cvBtn.target = '_blank';
        cvBtn.rel = 'noopener noreferrer';
        cvBtn.removeAttribute('download');
      }
    }
  }, (error) => {
    console.warn('Firestore settings listener (using fallback):', error);
  });

  // 4. Contact Settings
  db.collection('settings').doc('contact_settings').onSnapshot((doc) => {
    if (!doc.exists) return;
    const data = doc.data();

    if (data.email) {
      const emailLink = document.querySelector('.contact-card[href^="mailto:"]');
      if (emailLink) {
        emailLink.href = `mailto:${data.email}`;
        emailLink.setAttribute('aria-label', `Send email to ${data.email}`);
        const valSpan = emailLink.querySelector('.contact-card-value');
        if (valSpan) valSpan.textContent = data.email;
      }
    }

    if (data.whatsapp) {
      const waFloat = document.querySelector('.float[href*="whatsapp"]');
      if (waFloat) {
        const cleanNumber = data.whatsapp.replace(/\D/g, '');
        waFloat.href = `https://api.whatsapp.com/send?phone=${cleanNumber}`;
      }
    }

    if (data.linkedin) {
      document.querySelectorAll('a[aria-label*="LinkedIn"]').forEach(el => el.href = data.linkedin);
    }
    if (data.github) {
      document.querySelectorAll('a[aria-label*="GitHub"]').forEach(el => el.href = data.github);
    }
    if (data.instagram) {
      document.querySelectorAll('a[aria-label*="Instagram"]').forEach(el => el.href = data.instagram);
    }
    if (data.facebook) {
      document.querySelectorAll('a[aria-label*="Facebook"]').forEach(el => el.href = data.facebook);
    }
    if (data.twitter) {
      document.querySelectorAll('a[aria-label*="Twitter"]').forEach(el => el.href = data.twitter);
    }
  }, (error) => {
    console.warn('Firestore contact listener (using fallback):', error);
  });
}

function renderDynamicProjects(projects) {
  const grid = document.querySelector('#projects .projects-grid');
  if (!grid || !projects || !projects.length) return;

  grid.innerHTML = '';
  projects.forEach((proj) => {
    const card = document.createElement('article');
    card.className = 'project-card';

    const imgSrc = proj.image || 'assets/images/portfolio-1.png';
    const isComingSoon = !!proj.isComingSoon;

    let actionButtons = '';
    if (proj.githubUrl) {
      actionButtons += `
        <a href="${proj.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-color-2 btn-sm">
          <i class="fa-brands fa-github"></i> GitHub
        </a>
      `;
    }

    if (isComingSoon) {
      actionButtons += `
        <span class="badge-coming-soon">
          <i class="fa-solid fa-clock"></i> Coming Soon
        </span>
      `;
    } else if (proj.demoUrl) {
      const isPlayStore = proj.demoLabel === 'Play Store' || proj.demoUrl.includes('play.google.com');
      const iconClass = isPlayStore ? 'fa-brands fa-google-play' : 'fa-solid fa-arrow-up-right-from-square';
      const labelText = proj.demoLabel || 'Live Demo';

      actionButtons += `
        <a href="${proj.demoUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-color-1 btn-sm">
          <i class="${iconClass}"></i> ${labelText}
        </a>
      `;
    } else if (!proj.githubUrl) {
      actionButtons += `
        <span class="badge-coming-soon">
          <i class="fa-solid fa-clock"></i> Coming Soon
        </span>
      `;
    }

    card.innerHTML = `
      <div class="project-img-wrapper">
        <img src="${imgSrc}" alt="${proj.title} preview" loading="lazy" />
      </div>
      <div class="project-content">
        <h3 class="project-title">${proj.title}</h3>
        <p class="project-desc">${proj.description || ''}</p>
        <div class="project-btn-container">
          ${actionButtons}
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

function renderDynamicSkills(skills) {
  if (!skills || !skills.length) return;

  const languages = skills.filter(s => s.category === 'language');
  const tools = skills.filter(s => s.category === 'framework_tool');

  const langContainer = document.querySelector('#experience .experience-box:nth-child(1) .article-container');
  const toolsContainer = document.querySelector('#experience .experience-box:nth-child(2) .article-container');

  if (langContainer && languages.length) {
    langContainer.innerHTML = buildSkillItemsHTML(languages);
  }

  if (toolsContainer && tools.length) {
    toolsContainer.innerHTML = buildSkillItemsHTML(tools);
  }
}

function buildSkillItemsHTML(items) {
  return items.map(skill => {
    let iconHTML = '';
    if (skill.name.toLowerCase() === 'flutter' || skill.iconType === 'svg') {
      iconHTML = `
        <svg class="skill-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.314 0L2.3 12 6 15.7 21.684.013h-7.357zm.014 11.072L7.857 17.53l6.47 6.47H21.7l-6.46-6.468 6.46-6.46h-7.37z" />
        </svg>
      `;
    } else {
      iconHTML = `<i class="${skill.iconClass || 'fa-solid fa-code'} skill-icon"></i>`;
    }

    return `
      <div class="skill-item">
        ${iconHTML}
        <div class="skill-info">
          <h3>${skill.name}</h3>
          <p>${skill.level || 'Experienced'}</p>
        </div>
      </div>
    `;
  }).join('');
}
