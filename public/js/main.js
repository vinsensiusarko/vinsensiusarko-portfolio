/**
 * Vinsensius Arka Portfolio - Main JavaScript
 * Handles Theme Toggle, Navigation, Scroll Animations, and Interactions
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initScrollEffects();
  initIntersectionObserver();
  initYear();
});

/* ==========================================================================
   1. Theme Toggle (Light / Dark Mode)
   ========================================================================== */
function initTheme() {
  const root = document.documentElement;
  const themeToggles = document.querySelectorAll('.theme-toggle');

  // Detect saved preference or system preference
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

  // Listen to system changes if user hasn't explicitly set a preference
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
        if (isDark) {
          icon.className = 'fa-solid fa-sun';
        } else {
          icon.className = 'fa-solid fa-moon';
        }
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

  // Toggle button click
  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // Close when clicking any menu link
  menuLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggleMenu(true);
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (menuLinks.classList.contains('open') && !menuLinks.contains(e.target) && !hamburger.contains(e.target)) {
      toggleMenu(true);
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuLinks.classList.contains('open')) {
      toggleMenu(true);
      hamburger.focus();
    }
  });

  // Expose toggleMenu globally for backward compatibility if any inline handler exists
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

  // Smooth scroll for anchor links with offset
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
  // Check if reduced motion is preferred
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
