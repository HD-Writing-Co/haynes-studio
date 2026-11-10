# Northline Auto Template

**Free one-page automotive website starter** by Back2Life Designs.

## Contents

- `index.html` — complete editable page
- `styles.css` — responsive styling, four color palettes, reduced motion
- `script.js` — accessible mobile menu and demo color swatches
- `assets/` — locally included automotive imagery made for this demo

No build tools, fonts, libraries, or internet connection are required.

## Preview locally

Open `index.html` in a browser, or from your Back2Life Designs repository root run:

```powershell
python -m http.server 8000 --directory dist
```

Then open `http://localhost:8000/pre-made-templates/northline-auto-template/index.html`.

## First steps before going live

1. Replace **Northline Auto** with the customer's business name and logo.
2. Replace all sample wording, services, images, and the mechanic portrait with that business's authorized content. This is an *illustrative sample business* and not a real client case study.
3. In the contact section, replace every bracketed placeholder with verified phone, street address, and hours. Add functional `tel:`/email links **only when the real details are supplied**.
4. If a customer needs appointments, add an externally hosted booking link or implement and test a real scheduling service. The template does not include one.
5. Update the page `<title>`, description and theme color. Remove `<meta name="robots" content="noindex, nofollow">` when the site is genuinely ready for indexing.
6. Test keyboard navigation, small screens, and all links. Provide legal/privacy information where appropriate.

## Color schemes

The demo offers four buttons that change a `data-theme` attribute on `<html>`:

- Signal Red (default)
- Service Blue
- Garage Green
- Track Orange

The selection is saved in localStorage when available. For a customer deliverable, set their preferred default in `index.html` and optionally remove the theme picker and associated JavaScript.

## Images

Included WebP assets are locally bundled. They were cropped from generated, illustrative automotive concept artwork. They do **not** depict a real customer or real business. The customer is responsible for confirming they may use any replacement images.

## Limitations

The site is plain HTML/CSS/JS, not WordPress. It does not contain a backend, payment system, appointment booking, active contact form, customer reviews, or actual shop credentials. Domain and hosting are separate.

## Licensing

This starter is a project preview. Back2Life Designs should provide its final distribution/license terms before listing it publicly as a downloadable product.
