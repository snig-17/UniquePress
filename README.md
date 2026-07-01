# UniquePress

A static website, ready to deploy on **Cloudflare Pages** with a custom domain (free hosting).

## Project structure

```
UniquePress/
├── public/                 ← everything here is published as-is
│   ├── index.html          ← the homepage (replace with your design)
│   ├── 404.html            ← not-found page
│   ├── robots.txt
│   ├── _headers            ← Cloudflare security + caching headers
│   └── assets/
│       ├── css/styles.css
│       ├── js/main.js
│       └── img/favicon.svg
├── package.json            ← local preview only (no build step)
└── README.md               ← you are here
```

There is **no build step** — the files in `public/` are exactly what goes live.

## Preview it locally

```bash
npm run dev
```

Opens a local server (uses `npx serve`, no install needed) at http://localhost:3000.
Or just open `public/index.html` directly in a browser.

## Add your design

Replace the contents of `public/index.html` with your design.
- If it's a single HTML file, you can overwrite `index.html` entirely.
- Put images in `public/assets/img/`, styles in `public/assets/css/`, scripts in `public/assets/js/`.
- Any path under `public/` is served from the site root, e.g.
  `public/about.html` → `yoursite.com/about`.

## Deploy to Cloudflare Pages (free)

**Option A — Git (recommended, auto-deploys on every push):**
1. Push this folder to a GitHub/GitLab repo.
2. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Pick the repo. Set:
   - **Build command:** *(leave blank)*
   - **Build output directory:** `public`
4. **Save and Deploy.** You get a `*.pages.dev` URL immediately.

**Option B — Direct upload (no Git, drag-and-drop):**
- Workers & Pages → Create → Pages → **Upload assets** → drag the `public/` folder.

**Option C — Command line:**
```bash
npx wrangler pages deploy public --project-name uniquepress
```

## Connect a custom domain

In the Pages project → **Custom domains** → **Set up a domain** → enter the domain.
If the domain is on Cloudflare, DNS is configured automatically. Otherwise Cloudflare
shows the DNS record to add at your registrar. SSL is provisioned free, automatically.

## Handoff notes

- No accounts or secrets are baked into these files.
- No build tooling or framework to learn — it's plain HTML/CSS/JS.
- Anyone can edit `public/` files and redeploy with the steps above.
