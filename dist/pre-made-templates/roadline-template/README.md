# Roadline Auto Parts Template

A premium responsive automotive ecommerce storefront built with plain HTML, CSS, and JavaScript. The package includes the editable source files, original generated automotive imagery, a ready-to-view preview, and a catalog listing record.

**Suggested listing price: $49**

## Preview locally

Open `index.html` in a browser, or run a simple local server from this folder:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy to Vercel

1. Upload the folder to a Git repository or run `vercel` from this directory with the Vercel CLI installed.
2. Choose **Other** as the framework preset.
3. Leave the build command blank and set the output directory to `.`.
4. Deploy.

This is a static front-end template. It has no framework, build step, plugins, or server requirements.

## Included

- `index.html` — storefront structure, sample catalog, fitment selector, newsletter form, and cart drawer
- `styles.css` — responsive layout, product cards, category art, colors, and reduced-motion support
- `script.js` — product filtering/search/sort, vehicle selector interaction, cart quantities, and front-end form feedback
- `assets/` — generated showroom hero and eight individual product images
- `preview.png` — storefront preview image for the product listing
- `template.json` — metadata for a template catalog
- `store-listing.md` — suggested $49 product listing copy

## Customize before launch

- Change the brand, offer bar, navigation, store details, policies, and contact links in `index.html`.
- Update CSS variables at the top of `styles.css` to change the brand colors.
- Replace sample products, prices, categories, and search keywords in both `index.html` and `script.js`.
- Replace product images in `assets/` and update their CSS filenames if needed.
- Edit the year/make/model options in `script.js` and connect them to a verified fitment catalog before claiming compatibility.
- Connect the cart and checkout button to an ecommerce backend or payment provider. The included cart is a browser-only demonstration and does not submit orders or take payments.
- Connect the newsletter form to your email platform. The demo form does not store addresses.
- Replace sample inventory, availability, shipping, returns, and contact details with your business's verified information.

## Data note

Product names, sample prices, availability labels, and fitment options demonstrate the layout only. Confirm specifications, vehicle compatibility, inventory, and pricing with your supplier before publishing a live store.
