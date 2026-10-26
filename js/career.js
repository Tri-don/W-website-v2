document.addEventListener('DOMContentLoaded', () => {
  const slides = [...document.querySelectorAll('.career-hero-slide')];
  const dots = [...document.querySelectorAll('.career-dot')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let active = 0;
  let timer;

  const showSlide = (index) => {
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const selected = i === active;
      slide.classList.toggle('is-active', selected);
      slide.setAttribute('aria-hidden', String(!selected));
    });
    dots.forEach((dot, i) => dot.setAttribute('aria-selected', String(i === active)));
  };

  const startSlider = () => {
    window.clearInterval(timer);
    if (!reduceMotion.matches && slides.length > 1) timer = window.setInterval(() => showSlide(active + 1), 5200);
  };

  dots.forEach((dot, index) => dot.addEventListener('click', () => {
    showSlide(index);
    startSlider();
  }));
  reduceMotion.addEventListener('change', startSlider);
  showSlide(0);
  startSlider();

  const anchorLinks = [...document.querySelectorAll('.career-anchor-links a')];
  const sections = anchorLinks.map((link) => document.querySelector(link.hash)).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      anchorLinks.forEach((link) => link.classList.toggle('is-active', link.hash === `#${visible.target.id}`));
    }, { rootMargin: '-22% 0px -58% 0px', threshold: [0, .2, .5] });
    sections.forEach((section) => sectionObserver.observe(section));

    if (!reduceMotion.matches) {
      document.body.classList.add('career-motion-ready');
      document.querySelectorAll('.career-jobs-grid, .career-benefits-grid, .career-values-list, .career-mosaic').forEach((group) => {
        [...group.querySelectorAll(':scope > .reveal')].forEach((element, index) => {
          element.style.setProperty('--career-reveal-delay', `${Math.min(index * 85, 340)}ms`);
        });
      });
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        });
      }, { threshold: .08, rootMargin: '0px 0px -45px 0px' });
      document.querySelectorAll('.career-page .reveal').forEach((element) => revealObserver.observe(element));
    }
  }

  const header = document.querySelector('.nv-header');
  const syncHeader = () => header?.classList.toggle('nv-scrolled', window.scrollY > 80);
  window.addEventListener('scroll', syncHeader, { passive: true });
  syncHeader();
});
