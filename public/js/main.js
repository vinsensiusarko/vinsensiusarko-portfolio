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
  initProjectFilterAndSearch();
  initProjectDetailModal();
  initBackToTop();
  initContactCopy();
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

    // Hero Photo (Avatar)
    const heroImg = document.getElementById('hero-img') || document.querySelector('#profile .section__pic-container img');
    if (heroImg) {
      if (data.heroImage) {
        heroImg.src = data.heroImage;
      } else {
        heroImg.src = 'assets/images/arko-pic.png';
      }
    }

    // About Photo
    const aboutImg = document.getElementById('about-img') || document.querySelector('#about .section__pic-container img');
    if (aboutImg) {
      if (data.aboutImage) {
        aboutImg.src = data.aboutImage;
      } else {
        aboutImg.src = 'assets/images/arko-about.jpg';
      }
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

/* ==========================================================================
   7. Interactive Project Category Filter & Live Search
   ========================================================================== */
let currentCategoryFilter = 'all';
let currentSearchQuery = '';

function initProjectFilterAndSearch() {
  const filterChips = document.querySelectorAll('.filter-chip');
  const searchInput = document.getElementById('project-search-input');
  const searchClearBtn = document.getElementById('project-search-clear');
  const resetBtn = document.getElementById('reset-filter-btn');

  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => {
        c.classList.remove('active');
        c.setAttribute('aria-selected', 'false');
      });
      chip.classList.add('active');
      chip.setAttribute('aria-selected', 'true');
      currentCategoryFilter = chip.getAttribute('data-filter') || 'all';
      applyProjectFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchQuery = (e.target.value || '').trim().toLowerCase();
      if (searchClearBtn) {
        searchClearBtn.style.display = currentSearchQuery.length ? 'block' : 'none';
      }
      applyProjectFilters();
    });
  }

  if (searchClearBtn && searchInput) {
    searchClearBtn.addEventListener('click', () => {
      searchInput.value = '';
      currentSearchQuery = '';
      searchClearBtn.style.display = 'none';
      applyProjectFilters();
      searchInput.focus();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        currentSearchQuery = '';
      }
      if (searchClearBtn) searchClearBtn.style.display = 'none';
      filterChips.forEach(c => {
        const isAll = c.getAttribute('data-filter') === 'all';
        c.classList.toggle('active', isAll);
        c.setAttribute('aria-selected', isAll ? 'true' : 'false');
      });
      currentCategoryFilter = 'all';
      applyProjectFilters();
    });
  }
}

function applyProjectFilters() {
  const cards = document.querySelectorAll('.projects-grid .project-card');
  const emptyState = document.getElementById('projects-empty-state');
  let visibleCount = 0;

  cards.forEach(card => {
    const category = (card.getAttribute('data-category') || '').toLowerCase();
    const tech = (card.getAttribute('data-tech') || '').toLowerCase();
    const title = (card.querySelector('.project-title')?.textContent || '').toLowerCase();
    const desc = (card.querySelector('.project-desc')?.textContent || '').toLowerCase();

    // 1. Category check
    let matchesCategory = false;
    if (currentCategoryFilter === 'all') {
      matchesCategory = true;
    } else {
      const targetFilter = currentCategoryFilter.toLowerCase();
      matchesCategory = category.includes(targetFilter);
      if (!matchesCategory) {
        if (targetFilter.includes('mobile') && (category.includes('mobile') || tech.includes('flutter'))) {
          matchesCategory = true;
        } else if (targetFilter.includes('web application') && (category.includes('web application') || category.includes('enterprise'))) {
          matchesCategory = true;
        } else if (targetFilter.includes('web portal') && (category.includes('portal') || tech.includes('wordpress') || tech.includes('laravel'))) {
          matchesCategory = true;
        } else if (targetFilter.includes('backend') && (category.includes('backend') || tech.includes('node') || tech.includes('express'))) {
          matchesCategory = true;
        }
      }
    }

    // 2. Search query check
    let matchesSearch = true;
    if (currentSearchQuery) {
      matchesSearch = title.includes(currentSearchQuery) ||
                      tech.includes(currentSearchQuery) ||
                      desc.includes(currentSearchQuery) ||
                      category.includes(currentSearchQuery);
    }

    if (matchesCategory && matchesSearch) {
      card.style.display = '';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });

  if (emptyState) {
    emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
  }
}

/* ==========================================================================
   8. Rich Description Formatter & Project Quick View Modal
   ========================================================================== */
function formatRichDescription(text) {
  if (!text) return '';
  const escapeHtml = (str) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  const lines = text.split(/\r?\n/);
  let html = '';
  let inListGroup = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      if (inListGroup) { html += '</div>'; inListGroup = false; }
      continue;
    }

    const olMatch = line.match(/^(\d+)[\.\)]\s+(.*)/);
    const ulMatch = line.match(/^[-*•]\s+(.*)/);

    if (olMatch) {
      if (!inListGroup) { html += '<div class="rich-list-group">'; inListGroup = true; }
      html += `
        <div class="rich-list-item rich-numbered-item">
          <span class="rich-number-badge">${olMatch[1]}</span>
          <span class="rich-item-text">${escapeHtml(olMatch[2])}</span>
        </div>
      `;
    } else if (ulMatch) {
      if (!inListGroup) { html += '<div class="rich-list-group">'; inListGroup = true; }
      html += `
        <div class="rich-list-item rich-bullet-item">
          <span class="rich-check-badge"><i class="fa-solid fa-circle-check"></i></span>
          <span class="rich-item-text">${escapeHtml(ulMatch[1])}</span>
        </div>
      `;
    } else {
      if (inListGroup) { html += '</div>'; inListGroup = false; }
      html += `<p class="rich-desc-p">${escapeHtml(line)}</p>`;
    }
  }

  if (inListGroup) html += '</div>';
  return html;
}

function initProjectDetailModal() {
  const modal = document.getElementById('project-detail-modal');
  if (!modal) return;

  const closeBtn = document.getElementById('modal-close-btn');
  const imgEl = document.getElementById('modal-project-img');
  const backdropBg = document.getElementById('modal-project-backdrop');
  const categoryEl = document.getElementById('modal-project-category');
  const titleEl = document.getElementById('modal-project-title');
  const statusEl = document.getElementById('modal-project-status');
  const descEl = document.getElementById('modal-project-desc');
  const techListEl = document.getElementById('modal-project-tech-list');
  const actionsEl = document.getElementById('modal-project-actions');

  const closeModal = () => {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  const openModalForCard = (card) => {
    const imgSrc = card.querySelector('.project-img-wrapper img')?.getAttribute('src') || '';
    const title = card.querySelector('.project-title')?.textContent || 'Project';
    const rawDesc = card.getAttribute('data-raw-desc') || card.querySelector('.project-desc')?.textContent || '';
    const category = card.getAttribute('data-category') || 'Project';
    const techRaw = card.getAttribute('data-tech') || '';
    const techArray = techRaw ? techRaw.split(',').map(t => t.trim()).filter(Boolean) : [];

    const isComingSoon = card.querySelector('.badge-coming-soon') !== null;
    const liveDemoBtn = card.querySelector('.btn-color-1');
    const githubBtn = card.querySelector('.btn-color-2');

    if (imgEl) {
      imgEl.src = imgSrc;
      imgEl.alt = title + ' preview';
    }
    if (backdropBg) {
      backdropBg.style.backgroundImage = imgSrc ? `url('${imgSrc}')` : 'none';
    }
    if (categoryEl) categoryEl.textContent = category;
    if (titleEl) titleEl.textContent = title;
    if (descEl) descEl.innerHTML = formatRichDescription(rawDesc);

    if (statusEl) {
      if (isComingSoon) {
        statusEl.innerHTML = '<span class="badge-coming-soon"><i class="fa-solid fa-clock"></i> Coming Soon</span>';
      } else {
        statusEl.innerHTML = '<span class="badge-coming-soon" style="color:#10b981; border-color:#10b981;"><i class="fa-solid fa-check"></i> Live Project</span>';
      }
    }

    if (techListEl) {
      techListEl.innerHTML = techArray.map(t => `<span class="tech-pill">${t}</span>`).join('');
    }

    if (actionsEl) {
      let buttonsHtml = '';
      if (githubBtn) {
        buttonsHtml += `
          <a href="${githubBtn.href}" target="_blank" rel="noopener noreferrer" class="btn btn-color-2 btn-sm">
            <i class="fa-brands fa-github"></i> GitHub Repository
          </a>
        `;
      }
      if (liveDemoBtn) {
        buttonsHtml += `
          <a href="${liveDemoBtn.href}" target="_blank" rel="noopener noreferrer" class="btn btn-color-1 btn-sm">
            ${liveDemoBtn.innerHTML}
          </a>
        `;
      }
      actionsEl.innerHTML = buttonsHtml;
    }

    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const grid = document.querySelector('#projects .projects-grid');
  if (grid) {
    grid.addEventListener('click', (e) => {
      // If clicking button/link directly, follow link
      if (e.target.closest('.project-btn-container a')) {
        return;
      }
      const card = e.target.closest('.project-card');
      if (card) {
        openModalForCard(card);
      }
    });
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      closeModal();
    }
  });
}

/* ==========================================================================
   9. Back to Top Button
   ========================================================================== */
function initBackToTop() {
  const btn = document.getElementById('back-to-top-btn');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('show');
    } else {
      btn.classList.remove('show');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ==========================================================================
   10. Quick Copy Contact with Toast Notification
   ========================================================================== */
function showPublicToast(message) {
  const toast = document.getElementById('public-toast');
  if (!toast) return;

  toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #10b981;"></i> ${message}`;
  toast.classList.add('show');

  if (window._toastTimer) clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

function initContactCopy() {
  document.querySelectorAll('.contact-copy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const textToCopy = btn.getAttribute('data-copy');
      if (!textToCopy) return;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showPublicToast(`Copied ${textToCopy} to clipboard!`);
        }).catch(() => {
          fallbackCopy(textToCopy);
        });
      } else {
        fallbackCopy(textToCopy);
      }
    });
  });

  function fallbackCopy(text) {
    const tempInput = document.createElement('input');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
      document.execCommand('copy');
      showPublicToast(`Copied to clipboard!`);
    } catch (err) {}
    document.body.removeChild(tempInput);
  }
}

/* ==========================================================================
   11. Dynamic Firestore Rendering
   ========================================================================== */
function renderDynamicProjects(projects) {
  const grid = document.querySelector('#projects .projects-grid');
  if (!grid || !projects || !projects.length) return;

  grid.innerHTML = '';
  projects.forEach((proj) => {
    const card = document.createElement('article');
    card.className = 'project-card';
    card.setAttribute('data-category', proj.category || 'Web Application');
    card.setAttribute('data-tech', (proj.techStack || []).join(', '));
    card.setAttribute('data-raw-desc', proj.description || '');

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

    const formattedDesc = formatRichDescription(proj.description || '');

    card.innerHTML = `
      <div class="project-img-wrapper" title="Click to view details">
        <div class="project-img-backdrop" style="background-image: url('${imgSrc}');"></div>
        <img src="${imgSrc}" alt="${proj.title} preview" loading="lazy" decoding="async" class="project-img-main" />
        <span class="project-quick-view-badge"><i class="fa-solid fa-expand"></i> Quick View</span>
      </div>
      <div class="project-content">
        <h3 class="project-title">${proj.title}</h3>
        <div class="project-desc">${formattedDesc}</div>
        <div class="project-btn-container">
          ${actionButtons}
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  // Re-apply active filters and search
  if (typeof applyProjectFilters === 'function') {
    applyProjectFilters();
  }
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
