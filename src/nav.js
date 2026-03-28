/**
 * Navigation — sticky header, mobile toggle, smooth scroll
 */

export function initNav() {
  const nav = document.getElementById('main-nav');
  const toggle = document.getElementById('nav-toggle');
  const links = document.querySelector('.nav-links');
  const navLinks = document.querySelectorAll('.nav-link');

  // Scroll → add background to nav
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });

  // Mobile toggle
  if (toggle) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      links.classList.toggle('open');
    });
  }

  // Smooth scroll on click
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
      // Close mobile menu
      toggle?.classList.remove('active');
      links?.classList.remove('open');
    });
  });

  // Also handle CTA buttons
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    if (!a.classList.contains('nav-link')) {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const targetEl = document.querySelector(a.getAttribute('href'));
        if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
      });
    }
  });
}
