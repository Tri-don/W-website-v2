/* Reserve the scale row's actual height at the bottom of the viewport-sized hero. */
(() => {
  if (document.documentElement.dataset.wissenScalePreview !== 'raised') return;
  const scale = document.getElementById('scale');
  if (!scale) return;
  let previousHeight = -1;
  const update = () => {
    const height = scale.getBoundingClientRect().height;
    if (Math.abs(height - previousHeight) < .1) return;
    previousHeight = height;
    document.body.style.setProperty('--wissen-scale-height', height + 'px');
  };
  new ResizeObserver(update).observe(scale);
  update();
  document.fonts.ready.then(update);
})();
