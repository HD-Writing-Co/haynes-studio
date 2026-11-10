# Ironwood Construction | Pro — Back2Life Designs

## Deliverables

1. `ironwood-construction-pro-theme.zip`: INSTALLABLE WordPress theme. Keep PRIVATE until a customer buys it. DO NOT commit this ZIP into a public Vercel `dist/` folder.
2. `ironwood-construction-pro-theme-storefront-preview.zip`: only the PUBLIC product preview folder (`dist/pre-made-templates/ironwood-construction-pro-theme/`) containing `index.html`, `details.html`, `template.json`, `preview.webp`, static CSS and original demo images. No installable ZIP inside.
3. `ironwood-construction-pro-theme-preview.png`: screenshot of the static demo, not evidence of WordPress compatibility.

## Test the real theme before publishing for sale
In an isolated WordPress 6.6+ staging site: Appearance → Themes → Add New → Upload Theme → `ironwood-construction-pro-theme.zip` → Install → Activate. Test the Front Page, Site Editor, template parts, navigation, style variations, blog, mobile layouts, block editing, and separately configured form plugin before accepting orders.

## Plugins and licensing
Core layout requires no plugin. A form plugin is needed only for a working quote/contact form and is **not** bundled or installed. Read `PLUGINS.md` in the theme ZIP for options and setup. There are no real testimonials, results, addresses, or functioning form submissions in the demo. Original image is an AI-generated concept (not a real client's completed project). WordPress core theme files use GPL-2.0-or-later.

## Add storefront listing locally and publish
Copy the `dist/` subtree from `ironwood-construction-pro-theme-storefront-preview.zip` to the root of your VS Code repository, keeping all other existing folders. Run `node scripts/build-template-catalog.mjs`, then check `http://localhost:8000/pre-made-templates/index.html`. Commit/push when satisfied, and Vercel regenerates the catalog during deployment.
