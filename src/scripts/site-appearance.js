/* Match the shared canvas to each page's actual hero, including responsive resizing. */
(() => {
  const hero = document.querySelector('main > [data-wissen-hero]');
  const update = () => {
    const edge = hero ? hero.getBoundingClientRect().bottom - document.body.getBoundingClientRect().top : 0;
    document.body.style.setProperty('--wissen-hero-height', Math.max(0, edge) + 'px');
  };
  update();
  if (hero) new ResizeObserver(update).observe(hero);
  document.fonts.ready.then(update);
})();
