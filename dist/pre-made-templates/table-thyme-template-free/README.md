# Restaurant & Food Starter — free template (Back2Life Designs)

A modern, static, one-page website for a dine-in restaurant, bistro, café, or neighborhood dining business. Uses HTML, CSS, JavaScript, and four original, AI-generated illustrative restaurant photos included with the download. No frameworks, external fonts, online image hosts, or build process.

## Files
- `index.html` — the single-page restaurant site (sample brand **Table & Thyme**)
- `styles.css` — responsive layout and all four color palettes
- `script.js` — palette switching, mobile navigation, current year
- `assets/restaurant-interior.webp` — sample dining-room photograph
- `assets/signature-dish.webp` — sample plated dish
- `assets/chef-at-work.webp` — sample chef photograph
- `assets/table-setting.webp` — sample dining table photograph

## Preview locally
Simply open `index.html` in a modern browser. Everything works offline.

To add to the existing Back2Life Designs repository, copy the entire `restaurant-food-starter` folder to:
`C:\dev\back2life\haynes-studio\dist\pre-made-templates\restaurant-food-starter\`

With your existing terminal running `python -m http.server 8000 --directory dist` from the project root, open:
`http://localhost:8000/pre-made-templates/restaurant-food-starter/index.html`

## The four colorways
- **Terracotta & cream** (default): warm rustic, inviting
- **Olive & linen**: botanical, earthy
- **Coastal blue**: bright, seaside dining
- **Midnight bistro**: refined slate/navy

The swatches change `data-theme` on `<html>` and remember the choice in local browser storage when allowed. No data is transmitted. To change the default, edit `data-theme="terracotta"` in `index.html`. For a final client version, remove `<aside class="theme-switcher" ...>` and optionally the swatch-specific JavaScript if color switching isn't wanted.

## IMPORTANT: Demo content, not a real restaurant
**Table & Thyme is a sample brand.** Menu dishes, ingredients, prices, and photography are illustrative. There is no verified restaurant address, real phone number, working reservation system, ordering integration, or contact form. Bracketed hours and location details are intentionally unfinished; do not publish the site as a real restaurant without replacing them. Do not present AI-generated dish and dining-room pictures as authentic customer photos.

### Before publishing for a customer
1. Replace the brand, title, meta description, and all sample restaurant messaging.
2. Replace all sample menu items, prices, ingredients, and captions with the customer's verified information.
3. Swap illustrative photos for genuine restaurant-provided images when appropriate, or keep generic illustrations clearly labelled; verify that any assets you add are licensed for customer distribution.
4. Supply actual hours, address, email and phone from the customer. For real contact actions, insert verified `mailto:`, `tel:`, booking, map, or ordering URLs. **This free starter does not deliver reservations, inquiries, or orders.**
5. Verify mobile navigation, accessibility, color contrast after customizing, image descriptions, and current menu information.
6. Define final terms of distribution, attribution (if any), support, and product licensing before offering a free public download.

## Free template scope
Single-page layout, mobile navigation, sample menu, story, photos, hours/location, theme swatches. No CMS, payment processing, working booking, ordering, customer reviews, contact form service, hosting, or domain.
