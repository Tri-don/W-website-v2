(() => {
  const section = document.querySelector('.ws-services');
  if (!section) return;
  const elements = [...section.querySelectorAll('.ws-reveal')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('ws-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  elements.forEach((element, index) => {
    element.style.setProperty('--ws-delay', `${Math.min(index * 45, 180)}ms`);
    observer.observe(element);
  });
  section.classList.add('ws-ready');
  reduced.addEventListener('change', event => {
    if (event.matches) {
      observer.disconnect();
      elements.forEach(element => element.classList.add('ws-visible'));
    }
  });
})();
