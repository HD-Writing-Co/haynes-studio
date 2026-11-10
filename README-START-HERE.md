# Back2Life Designs — automatic template storefront

This package updates your **existing** static HTML/CSS/JS storefront. It does not contain or overwrite any of your existing website templates, the homepage, or the shared stylesheet.

## What changes

- A redesigned storefront catalog with cards for **Ridgeline**, **Home Services Starter**, **Beauty & Personal Care Starter**, **Table & Thyme**, and **Northline Auto**.
- Search, niche filtering, Free/Premium filtering, and responsive product cards.
- Preview images bundled for the four free templates; Ridgeline keeps its existing `assets/ridgeline-preview.svg`.
- A small Node.js catalog generator that finds **every immediate subfolder** of `dist/pre-made-templates` that contains `index.html`.
- Vercel runs the generator automatically when your connected GitHub repository deploys.
- **No API keys, database, third-party packages, or backend required.**

## Back up first

Your local repository may have additional unpublished edits. Copy these somewhere safe before overwriting:

- `dist/pre-made-templates/index.html`
- `vercel.json`

## Install

1. Unzip this archive somewhere outside your repository.
2. Copy the included `dist` folder into the existing `C:\dev\back2life\haynes-studio\dist` folder, merging files rather than deleting existing folders. Specifically, the five `template.json` files go **inside the existing template folders**. Do **not** delete or replace each template's `index.html`.
3. Copy the included `scripts` folder into `C:\dev\back2life\haynes-studio\scripts` (creating it if necessary).
4. The included `vercel.json` is based on the repository's previously checked version and keeps the same output directory and security headers. **If you have changed your local `vercel.json`, compare first instead of overwriting**. The required additions/values are: `"buildCommand": "node scripts/build-template-catalog.mjs"` and `"outputDirectory": "dist"`.
5. Open a **new** VS Code terminal in `C:\dev\back2life\haynes-studio`. Run:

   ```powershell
   node scripts/build-template-catalog.mjs
   ```

6. Refresh `http://localhost:8000/pre-made-templates/index.html` with Ctrl+F5. Keep your existing Python local server running.
7. Check that each card opens an existing demo. Test the search, niche select, Free and Premium filters.
8. When you're happy, commit and push the changes to GitHub. Vercel will run the same generator during build **if it deploys this repository root with Node available**. The included `vercel.json` sets the build command, and keeps the output directory as `dist`.

## How auto-discovery works

After installation, adding a new folder containing `index.html` inside `dist/pre-made-templates` is enough for it to appear in the catalog **at the next build**. It will use a derived title, generic preview text, a placeholder image, and "Pricing to be announced" unless you provide an optional `template.json` file alongside it.

To give a new product a real image, category and accurate description, add a `template.json` like:

```json
{
  "name": "Sunflower Florist",
  "niche": "Retail & Boutiques",
  "idealFor": "Local florists and flower shops",
  "description": "A responsive one-page florist demo with a gallery and shop information.",
  "platform": "HTML · CSS · JavaScript",
  "tier": "free",
  "priceLabel": "Free starter · Live demo",
  "preview": "../assets/template-previews/sunflower-florist-template.webp",
  "demoPath": "index.html",
  "order": 6
}
```

Add the actual image file to the corresponding path under `dist/assets/template-previews`. If no image is supplied, the card uses a clean text placeholder without breaking the layout. Existing `index.html` files in nested folders (e.g. `ridgeline/demo/`) are **not** independently listed.

## Downloads and pricing safety

- Free starter cards currently offer **live previews only**, not a download link. The earlier template READMEs explicitly say the final free-template distribution license is still to be settled.
- Once licensed, you can place a ZIP under `dist/downloads/` and add `"download": "../downloads/my-template.zip"` to the template's `template.json`. The generator only displays download buttons when the referenced ZIP exists.
- A paid/preview template never gets a download button unless you explicitly configure one. Do not place unreleased paid downloadable packages in the public `dist` directory.
- New unconfigured folders default to "preview" rather than assuming they are free, paid, or available for sale.

## Important notes

- This is **build-time automatic**, not real-time. GitHub needs to receive a commit/push, and Vercel needs to complete a deployment. The browser cannot see folders on your local PC or inside GitHub.
- To see a newly added template **locally**, run `node scripts/build-template-catalog.mjs` again, then refresh the page. A regular `python -m http.server ...` does not watch folders and rebuild the catalog.
- No changes are made to `dist/index.html` (your homepage), existing template code, or the main site's contact form and domain setup.
