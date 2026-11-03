document.addEventListener('DOMContentLoaded', () => {
  const tabs = [...document.querySelectorAll('.ins-tab')];
  const panels = [...document.querySelectorAll('.ins-panel')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const featuredSlider = document.querySelector('.ins-featured-slider');
  const featuredSlides = [...document.querySelectorAll('[data-featured-slide]')];
  const featuredDots = [...document.querySelectorAll('.ins-featured-dots button')];
  let featuredIndex = 0;
  let touchStartX = 0;
  let featuredTimer;
  const featuredDuration = 7000;

  const scheduleFeatured = () => {
    window.clearTimeout(featuredTimer);
    featuredDots.forEach((dot) => dot.classList.remove('is-progressing'));
    if (document.hidden || reducedMotion.matches || featuredSlides.length < 2) return;
    void featuredDots[featuredIndex].offsetWidth;
    featuredDots[featuredIndex].classList.add('is-progressing');
    featuredTimer = window.setTimeout(() => showFeatured(featuredIndex + 1), featuredDuration);
  };

  const showFeatured = (nextIndex, focusDot = false) => {
    if (!featuredSlides.length) return;
    featuredIndex = (nextIndex + featuredSlides.length) % featuredSlides.length;
    featuredSlides.forEach((slide, index) => {
      const selected = index === featuredIndex;
      slide.classList.toggle('is-active', selected);
      slide.setAttribute('aria-hidden', String(!selected));
      slide.tabIndex = selected ? 0 : -1;
    });
    featuredDots.forEach((dot, index) => {
      const selected = index === featuredIndex;
      dot.classList.toggle('is-active', selected);
      dot.setAttribute('aria-selected', String(selected));
      dot.tabIndex = selected ? 0 : -1;
    });
    if (focusDot) featuredDots[featuredIndex]?.focus();
    scheduleFeatured();
  };

  featuredDots.forEach((dot, index) => dot.addEventListener('click', () => showFeatured(index)));
  featuredSlider?.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    showFeatured(featuredIndex + (event.key === 'ArrowRight' ? 1 : -1));
  });
  featuredSlider?.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0]?.clientX || 0;
  }, { passive: true });
  featuredSlider?.addEventListener('touchend', (event) => {
    const distance = (event.changedTouches[0]?.clientX || 0) - touchStartX;
    if (Math.abs(distance) > 50) showFeatured(featuredIndex + (distance < 0 ? 1 : -1));
  }, { passive: true });
  document.addEventListener('visibilitychange', scheduleFeatured);
  reducedMotion.addEventListener('change', scheduleFeatured);
  showFeatured(0);

  const selectTab = (tab, focus = false) => {
    tabs.forEach((item) => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
    });

    panels.forEach((panel) => {
      panel.hidden = panel.id !== tab.getAttribute('aria-controls');
    });

    if (focus) tab.focus();
    const key = tab.dataset.tab;
    if (key && window.history.replaceState) {
      window.history.replaceState(null, '', `#${key}`);
    }
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', (event) => {
      let next = null;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === null) return;
      event.preventDefault();
      selectTab(tabs[next], true);
    });
  });

  const requested = window.location.hash.slice(1);
  const initial = tabs.find((tab) => tab.dataset.tab === requested) || tabs[0];
  if (initial) selectTab(initial);

  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    document.body.classList.add('ins-motion-ready');
    document.querySelectorAll('.ins-grid').forEach((grid) => {
      [...grid.children].forEach((card, index) => {
        card.style.setProperty('--ins-delay', `${Math.min(index * 90, 270)}ms`);
      });
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -45px 0px' });

    document.querySelectorAll('.ins-reveal').forEach((element) => observer.observe(element));
  }

  const header = document.querySelector('.nv-header');
  const syncHeader = () => header?.classList.toggle('nv-scrolled', window.scrollY > 80);
  window.addEventListener('scroll', syncHeader, { passive: true });
  syncHeader();
});
