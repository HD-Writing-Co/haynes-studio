/* Simple demo-only theme switching and mobile navigation. */
(() => {
  'use strict';
  const themes = new Set(['signal-red', 'service-blue', 'garage-green', 'track-orange']);
  const buttons = [...document.querySelectorAll('[data-set-theme]')];
  const root = document.documentElement;
  function selectTheme(theme) {
    if (!themes.has(theme)) return;
    root.dataset.theme = theme;
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.setTheme === theme)));
    try { window.localStorage.setItem('northline-auto-demo-theme', theme); } catch (_) { /* Storage might be unavailable in previews. */ }
  }
  buttons.forEach(button => button.addEventListener('click', () => selectTheme(button.dataset.setTheme)));
  try {
    const saved = window.localStorage.getItem('northline-auto-demo-theme');
    if (themes.has(saved)) selectTheme(saved);
  } catch (_) { /* Default palette remains active. */ }

  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('primary-navigation');
  if (toggle && nav) {
    function closeMenu() {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open navigation');
      nav.classList.remove('is-open');
    }
    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
      nav.classList.toggle('is-open', isOpen);
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  }
})();
