/* Page-scoped motion preparation and responsive phone-screen placement. */
(() => {
 'use strict';
 if (!document.body?.classList.contains('ad-page')) return;
 const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
 const selector = [
  '.ad-ref-hero-copy', '.ad-ref-devices', '.ad-ref-centered', '.ad-heading',
  '.ad-ref-proposition', '.ad-ref-challenge', '.ad-ref-impact-media',
  '.ad-ref-impact-copy', '.ad-service', '.ad-detail-image', '.ad-detail-copy',
  '.ad-details-hero h1', '.ad-detail-nav', '.ad-final h2',
  '.ad-final .m6-cta-description', '.ad-final .m6-cta-actions',
  'footer .wf-info', 'footer .wf-column', 'footer .wf-middle', 'footer .wf-bottom'
 ].join(',');
 const targets = [...document.querySelectorAll(selector)];
 targets.forEach(element => {
  element.classList.add('reveal');
  const siblings = [...element.parentElement.children].filter(node => node.matches(selector));
  element.style.setProperty('--ad-enter-delay', Math.min(Math.max(0, siblings.indexOf(element)) * 75, 225) + 'ms');
  if (reduced.matches) element.classList.add('visible');
 });
 /* master.js initializes after parsing and owns the shared reveal observer.
    A focus target is revealed immediately for keyboard navigation. */
 document.addEventListener('focusin', event => {
  const target = event.target.closest('.reveal');
  if (target) target.classList.add('visible');
 });
 reduced.addEventListener('change', event => {
  if (event.matches) targets.forEach(element => element.classList.add('visible'));
 });
 const screens = [...document.querySelectorAll('.ad-ref-screen-ui, .ad-ref-device-left .ad-ref-device-screen, .ad-ref-device-right .ad-ref-device-screen')];
 const fit = screen => {
  const plane = screen.querySelector('.ad-ref-ui-plane, .ad-phone-ui');
  if (plane) plane.style.setProperty('--ad-ui-scale', String(screen.clientWidth / 240));
 };
 screens.forEach(fit);
 if ('ResizeObserver' in window) {
  const resize = new ResizeObserver(entries => entries.forEach(entry => fit(entry.target)));
  screens.forEach(screen => resize.observe(screen));
 } else {
  window.addEventListener('resize', () => screens.forEach(fit), { passive: true });
 }
})();
