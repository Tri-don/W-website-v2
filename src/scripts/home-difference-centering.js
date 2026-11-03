/* Keep the Difference composition centered in the viewport below the visible nav. */
(() => {
  const nav = document.querySelector('.nv-header');
  const bar = nav?.querySelector('.nv-bar');
  if (!bar || !document.querySelector('#difference')) return;
  let previous = -1;
  const update = () => {
    const covered = Math.max(0, Math.min(innerHeight, bar.getBoundingClientRect().height));
    if (Math.abs(covered - previous) < .1) return;
    previous = covered;
    document.body.style.setProperty('--wissen-nav-covered', covered + 'px');
  };
  new ResizeObserver(update).observe(bar);
  update();
  document.fonts.ready.then(update);
})();
