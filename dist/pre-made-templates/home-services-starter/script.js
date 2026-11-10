"use strict";

// Demo-only palette controls. Theme values all live in styles.css.
const themeNames = {
  forest: "Forest",
  coast: "Coastal blue",
  clay: "Warm clay",
  slate: "Modern slate"
};
const themeButtons = document.querySelectorAll("[data-set-theme]");
const themeName = document.getElementById("theme-name");
const validThemes = Object.keys(themeNames);

function applyTheme(theme) {
  if (!validThemes.includes(theme)) return;
  document.documentElement.dataset.theme = theme;
  themeButtons.forEach(button => {
    button.setAttribute("aria-pressed", String(button.dataset.setTheme === theme));
  });
  if (themeName) themeName.textContent = themeNames[theme];
  try { window.localStorage.setItem("home-services-demo-theme", theme); } catch (_) { /* Storage optional */ }
}
let savedTheme = "forest";
try { savedTheme = window.localStorage.getItem("home-services-demo-theme") || "forest"; } catch (_) { /* Local file previews may block storage */ }
applyTheme(validThemes.includes(savedTheme) ? savedTheme : "forest");
themeButtons.forEach(button => {
  button.addEventListener("click", () => applyTheme(button.dataset.setTheme));
});

// Small-screen menu. Navigation remains visible on desktop even without JS.
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.getElementById("main-nav");
if (menuToggle && nav) {
  const closeMenu = () => { nav.classList.remove("is-open"); menuToggle.setAttribute("aria-expanded", "false"); };
  menuToggle.addEventListener("click", () => {
    const nextOpen = menuToggle.getAttribute("aria-expanded") !== "true";
    nav.classList.toggle("is-open", nextOpen);
    menuToggle.setAttribute("aria-expanded", String(nextOpen));
  });
  nav.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeMenu(); });
}

const yearElement = document.getElementById("year");
if (yearElement) yearElement.textContent = new Date().getFullYear();
