# Home Services Starter — free template (Back2Life Designs)

A lightweight, single-page HTML/CSS/JavaScript website for a general home-service business. All code and artwork in this starter were created for this template. No third-party libraries, remote fonts, stock photography, CMS, or build process are needed.

## Files
- `index.html` — page content, internal links, and simple original SVG illustration
- `styles.css` — layout, responsive rules, and the four built-in color palettes
- `script.js` — demo-only theme swatches, small-screen menu, current year

## Try locally
From the folder containing `index.html`, double-click `index.html` to open it; or run `python -m http.server 8000` in this folder and visit http://localhost:8000/.

For the existing Back2Life Designs project, copy the entire `home-services-starter` folder into:
`C:\dev\back2life\haynes-studio\dist\pre-made-templates\home-services-starter\`

With the Back2Life local preview server running from the repository root:
`python -m http.server 8000 --directory dist`

Open:
`http://localhost:8000/pre-made-templates/home-services-starter/index.html`

## Four palettes
The demo bar shows four styles: **Forest**, **Coastal blue**, **Warm clay**, and **Modern slate**. The selected palette is stored in the browser when storage is available; it does not send data to a server.

Each option works by changing the `data-theme` value on `<html>` and applying corresponding CSS custom properties. To set a fixed theme, change `data-theme="forest"` in `index.html` and remove the demo toolbar markup (the `<aside class="theme-toolbar" ...>` block) if desired. Optionally remove the theme switching code from `script.js`.

## Required edits before publication
1. Replace `Your Business Name`, `[your service area]`, and bracketed contact placeholders with verified customer-provided details.
2. Replace the three illustrative service categories and About/Process wording with the actual services and process.
3. Add actual contact links (e.g. `tel:` and `mailto:`) *only after* the customer supplies correct phone/email. **No working contact form is included** in this free version.
4. Update `<title>`, SEO description, brand/heading text, and any site-specific policies as appropriate.
5. Remove the demo-only palette bar and placeholder messages if delivering a finalized customer website.
6. Test on mobile, keyboard, and assistive technology; check actual copy and contrast if you change colors.
7. Decide and attach the final distribution license and support terms before offering the ZIP publicly.

## Design notes
The hero house is original inline SVG; it uses the active palette's CSS custom properties. All icons are inline SVG. The page has a skip link, labeled navigation, semantic headings, focus-visible states, and prefers-reduced-motion support. No fabricated reviews, testimonials, contact data, ratings, licenses, or results are present.

## Not included (free tier)
E-commerce/checkout, real contact-form delivery, booking integration, hosting, domain, CMS integration, testimonials, customer media, and maintenance. These can be covered by paid templates or customization services.
