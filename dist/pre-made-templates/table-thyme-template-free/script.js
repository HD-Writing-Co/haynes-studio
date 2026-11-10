(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const themes = ['terracotta', 'olive', 'coastal', 'midnight'];
  const storageKey = 'table-and-thyme-theme';
  const themeButtons = [...document.querySelectorAll('[data-select-theme]')];

  function setTheme(theme, save = false) {
    if (!themes.includes(theme)) return;
    document.documentElement.dataset.theme = theme;
    themeButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.selectTheme === theme));
    });
    if (save) {
      try { localStorage.setItem(storageKey, theme); } catch (_) { /* storage optional */ }
    }
  }

  try {
    const savedTheme = localStorage.getItem(storageKey);
    if (themes.includes(savedTheme)) setTheme(savedTheme);
  } catch (_) { /* file previews and private windows still work */ }

  themeButtons.forEach((button) => button.addEventListener('click', () => {
    setTheme(button.dataset.selectTheme, true);
  }));

  const menuToggle = document.querySelector('.menu-toggle');
  const siteNav = document.querySelector('#site-nav');
  if (menuToggle && siteNav) {
    const closeMenu = () => {
      menuToggle.setAttribute('aria-expanded', 'false');
      siteNav.classList.remove('is-open');
    };
    menuToggle.addEventListener('click', () => {
      const shouldOpen = menuToggle.getAttribute('aria-expanded') !== 'true';
      menuToggle.setAttribute('aria-expanded', String(shouldOpen));
      siteNav.classList.toggle('is-open', shouldOpen);
    });
    siteNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });
    document.addEventListener('click', (event) => {
      if (!menuToggle.contains(event.target) && !siteNav.contains(event.target)) closeMenu();
    });
  }
  const year = document.querySelector('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
