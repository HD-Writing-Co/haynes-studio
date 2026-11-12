# Veloura Beauty Pro — public storefront preview

Copy this entire folder into:
`dist/pre-made-templates/veloura-beauty-pro-theme/`

This public package is **not** the installable WordPress theme. It contains a static HTML/CSS/JS visual demo and product information only. It is safe to publish on the public website.

## Files
- `index.html`: standalone theme-style design demo
- `details.html`: honest product description and plugin requirements
- `styles.css`, `script.js`: styles and mobile navigation for the demo
- `preview.webp`: storefront thumbnail (do not rename or omit)
- `assets/`: all three original demo images used by the pages
- `template.json`: metadata for the auto-catalog generator

## Publishing
From repository root, run:

```
node scripts/build-template-catalog.mjs
git add -A
git commit -m "Add Veloura Beauty Pro preview"
git push origin main
```

Vercel should regenerate the catalog automatically using the configured build command. Do not upload the separately provided installable `veloura-beauty-pro-theme.zip` into a public `dist/` directory.

## Requirements for the WordPress theme
The PHP-based theme uses native WordPress features for layout, menus, and pages. To activate inquiry forms, install and configure a compatible form plugin. To enable online appointment scheduling, install and configure a compatible booking plugin. These features are not active in this demo.
