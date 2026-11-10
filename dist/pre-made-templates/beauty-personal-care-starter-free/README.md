# Beauty & Personal Care Starter — Free Template

A free, single-page website template by Back2Life Designs. The sample content is meant for a salon, nail studio, spa, or independent beauty professional, but can be edited to suit other personal-care businesses.

## Included files
- `index.html` — all page content and an original, self-contained SVG hero illustration
- `styles.css` — responsive design, four color themes, and reduced-motion styles
- `script.js` — demo-only color picker, accessible mobile menu, and copyright year

No CMS, third-party fonts, libraries, stock photos, accounts, or build tools are required. Every visual element is local to the template. The artwork is original to this starter and contains no customer likeness.

## Preview locally
In the Back2Life Designs VS Code project, copy the entire `beauty-personal-care-starter` folder to:

`C:\dev\back2life\haynes-studio\dist\pre-made-templates\beauty-personal-care-starter\`

From the repo root, run the existing development server:

`python -m http.server 8000 --directory dist`

Preview this template at:

`http://localhost:8000/pre-made-templates/beauty-personal-care-starter/index.html`

The HTML file can also open directly in a browser because the CSS/JS links are relative.

## Demo color swatches
- **Rose Atelier** — muted rose, blush, and cream (default)
- **Sage Studio** — deep sage, soft green, and ivory
- **Lavender Dusk** — dusty violet, lilac, and white
- **Cocoa Cream** — warm brown, beige, and cream

Click the colored circles in the top demo bar. The selected option is saved to local browser storage when available. To choose a permanent palette, set `data-theme="rose"` (or `sage`, `lavender`, `cocoa`) on `<html>`. The top `<aside class="demo-bar"...>` is for demonstration only and may be removed. The theme switching code may then also be removed from `script.js`, leaving the mobile navigation behavior in place.

## Before publishing for an actual business
1. Replace **Your Studio Name**, all bracketed text, example services, About wording, and demo copyright notice with verified business information. Do not leave made-up business claims or placeholder descriptions live.
2. Update `<title>`, meta description, business hours, address or service area, and actual business offerings.
3. Add genuine `tel:`, `mailto:`, or booking-provider links using real details supplied by the customer. **There is deliberately no connected contact form or functional booking system in the free template.**
4. Decide whether the hero illustration fits the customer's brand; replace it with appropriately licensed images if desired.
5. Remove the demo toolbar and any demo-only notices when the finished site is ready.
6. Test all links, keyboard navigation, mobile layouts, colors, and reduced-motion behavior after customizing.
7. Decide on and include the final free-template license, permitted usage, redistribution restrictions, and support terms before distributing publicly.

## Free-tier scope
Includes a responsive single page, the example Services, About, Visit, and Contact sections, plus working anchor navigation and palette preview. Does **not** include ecommerce, customer reviews, galleries, booking/appointment integration, contact form delivery, WordPress/Webflow integration, web hosting, a domain name, or ongoing maintenance.

## Accessibility notes
Semantic landmarks, skip link, visible keyboard focus, toggle buttons with accessible names and pressed state, keyboard-operable mobile menu, responsive layouts, and `prefers-reduced-motion` are included. Test with real business content after editing. Palette contrast and functionality can change if colors or copy are modified.
