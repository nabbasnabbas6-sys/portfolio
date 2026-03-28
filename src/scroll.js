/**
 * Scroll-driven reveal animations + skill bar animation + stat counter
 */

export function initScrollAnimations() {
  // Reveal elements on scroll
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');

          // Animate skill bars inside this section
          const skillFills = entry.target.querySelectorAll('.skill-fill');
          skillFills.forEach((fill) => {
            const width = fill.dataset.width;
            fill.style.width = width + '%';
            fill.classList.add('animated');
          });

          // Animate stat counters
          const statNumbers = entry.target.querySelectorAll('.stat-number');
          statNumbers.forEach((el) => {
            animateCounter(el);
          });
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px',
    }
  );

  document.querySelectorAll('.reveal').forEach((el) => {
    revealObserver.observe(el);
  });

  // Section-based active nav link
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          document.querySelectorAll('.nav-link').forEach((link) => {
            link.classList.toggle('active', link.dataset.section === id);
          });
        }
      });
    },
    {
      threshold: 0.3,
    }
  );

  document.querySelectorAll('.section').forEach((section) => {
    sectionObserver.observe(section);
  });
}

function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  if (!target || el.dataset.animated) return;
  el.dataset.animated = 'true';

  let current = 0;
  const duration = 1500;
  const step = target / (duration / 16);

  function tick() {
    current += step;
    if (current >= target) {
      el.textContent = target;
      return;
    }
    el.textContent = Math.floor(current);
    requestAnimationFrame(tick);
  }

  tick();
}

/**
 * Returns current scroll progress 0–1
 */
export function getScrollProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  return docHeight > 0 ? scrollTop / docHeight : 0;
}
