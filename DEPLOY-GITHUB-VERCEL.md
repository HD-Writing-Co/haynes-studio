# Launch Haynes Studio with GitHub and Vercel

This package contains the current website with Billy’s personalized billboard. The website is static HTML/CSS/JavaScript. GitHub stores the source; Vercel hosts the website; Supabase is optional backend storage, authentication and functions. No Supabase connection is currently implemented.

## 1. Put the files on GitHub
1. Extract Haynes_Studio_Launch.zip on your computer.
2. Create a GitHub repository named haynes-studio. A private repository is fine. Initialize it with a README if using the browser upload flow.
3. Open the repository and choose Add file > Upload files.
4. Upload the CONTENTS of the extracted folder: dist/, package.json, vercel.json and the guide. Do not upload the ZIP itself or wrap the files in another parent folder.
5. Commit to main. Confirm dist/index.html and vercel.json are visible at the expected paths.

## 2. Import into Vercel
Vercel’s Hobby plan is restricted to personal, noncommercial projects. A business website advertising paid templates/services needs Pro or another commercial-capable host.
1. Sign in to Vercel with GitHub.
2. Add New > Project, import haynes-studio, and grant access to that repository.
3. Use these settings:
   - Framework preset: Other
   - Root directory: repository root (leave default; do not choose dist)
   - Build command: empty (Override enabled)
   - Output directory: dist
   - Install command: empty (Override enabled)
   - Environment variables: none needed for the current static website
4. Deploy. The included vercel.json already sets no build/install step, dist output, and basic response headers.
5. Open the generated vercel.app URL and check the homepage, template catalog, Ridgeline product page/demo, and privacy/terms pages.
6. In Project Settings > Domains add your own domain. At your domain provider, enter the exact DNS records Vercel displays. Keep existing email/MX records intact. Wait for domain verification and HTTPS.
7. Future commits to your connected production branch trigger deployments.

## 3. Make contact usable before promoting the site
Edit dist/site-config.js. For the simplest launch, set email to your business inbox and leave formEndpoint empty. This prepares an email draft for the visitor to review and send in their mail app; it does not send automatically.

For automatic submission, connect a real form service or implement a backend. formEndpoint must be an HTTPS URL accepting multipart form data and returning a successful response only after delivery/storage succeeds. Configure CORS if using a different origin. The existing JavaScript handles validation and success/failure messages.

The site is currently in preview inquiry mode because email and formEndpoint are empty. Template pricing and checkout also remain unconfigured. Set the final priceLabel and hosted checkoutUrl in site-config.js only once checkout and file delivery are ready. Review policy placeholders and final license terms before accepting sales. Keep template sale ZIPs outside dist/.

## 4. Where Supabase fits (optional next phase)
You do not need Supabase to publish this website. If you want inquiries stored in a database:
1. Create a Supabase project.
2. Create an inquiries table for name, email, interest, business, order reference, message, consent and creation date. Enable Row Level Security and keep anonymous reads/updates/deletes blocked.
3. Implement a Supabase Edge Function or Vercel API endpoint to accept the existing form’s multipart payload. Validate fields and consent on the server, add rate limiting and bot verification, and insert accepted inquiries. An optional email provider can send notifications.
4. Keep Supabase secret/service-role credentials only in the backend’s environment variables or function secrets. Never place them in dist/, site-config.js, the GitHub repository, or browser code. A browser publishable key is only appropriate with intentional RLS policies.
5. If using a Vercel function, place it in api/ at the repository root. Configure its Supabase URL and secret key under Vercel Project Settings > Environment Variables, then redeploy. These variables are available to server functions; they do not automatically appear in this build-free static JavaScript.
6. Set formEndpoint to the public HTTPS function endpoint. Test a real submission and confirm a database row, optional email notification, and honest error handling before launch.

Creating a Supabase project or adding keys alone will not connect the form; the endpoint code still has to be implemented. Supabase is not a payment processor. Use a hosted checkout/delivery service for template sales, or implement verified payment webhooks before granting private download access.

## Adding more templates
Create a new directory under dist/pre-made-templates/, add its product page and public demo assets, and add a card to the catalog plus an optional featured section on the homepage. Update products in dist/site-config.js and any supporting JavaScript if introducing configurable pricing/checkout for a new template. Keep the Ridgeline folder as a structural reference. Do not publish the paid source download in the public demo directory.

## Official references
- https://vercel.com/docs/builds/configure-a-build
- https://vercel.com/docs/project-configuration/vercel-json
- https://vercel.com/docs/plans/hobby
- https://vercel.com/docs/limits/fair-use-guidelines
- https://supabase.com/docs/guides/getting-started/api-keys
- https://supabase.com/docs/guides/database/postgres/row-level-security
