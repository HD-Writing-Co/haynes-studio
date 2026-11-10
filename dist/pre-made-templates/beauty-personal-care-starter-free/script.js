'use strict';
/* Demo palette controls, small-screen navigation, and footer year. No tracking, network calls or data collection. */
(() => {
  const themeNames = {
    rose: 'Rose Atelier',
    sage: 'Sage Studio',
    lavender: 'Lavender Dusk',
    cocoa: 'Cocoa Cream'
  };
  const root = document.documentElement;
  const themeLabel = document.querySelector('#palette-name');
  const themeButtons = document.querySelectorAll('[data-set-theme]');
  const storageKey = 'back2life-beauty-starter-theme';

  function applyTheme(theme) {
    if (!Object.prototype.hasOwnProperty.call(themeNames, theme)) return;
    root.dataset.theme = theme;
    themeButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.setTheme === theme));
    });
    if (themeLabel) themeLabel.textContent = themeNames[theme];
    const meta = document.querySelector('meta[name="theme-color"]');
    const colors = {rose:'#794959',sage:'#35644e',lavender:'#66507d',cocoa:'#76503d'};
    if (meta) meta.setAttribute('content', colors[theme]);
  }

  let savedTheme = null;
  try { savedTheme = localStorage.getItem(storageKey); } catch (_) { /* file:// or private mode may block storage */ }
  if (savedTheme && Object.prototype.hasOwnProperty.call(themeNames, savedTheme)) applyTheme(savedTheme);
  themeButtons.forEach((button) => button.addEventListener('click', () => {
    const choice = button.dataset.setTheme;
    applyTheme(choice);
    try { localStorage.setItem(storageKey, choice); } catch (_) { /* palette still switches */ }
  }));

  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#primary-nav');
  if (toggle && nav) {
    const closeMenu = () => { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); };
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
    document.addEventListener('click', event => {
      if (!nav.contains(event.target) && !toggle.contains(event.target)) closeMenu();
    });
  }
  const year = document.querySelector('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
