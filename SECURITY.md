# Security & DDoS Protection

This document explains how this portfolio is secured and how to protect it from DDoS and other attacks so **no one can take it down**.

---

## Do you need a backend or database?

**No.** For this portfolio you do **not** need a backend or database.

| | Static (what you have) | Adding backend + database |
|--|------------------------|----------------------------|
| **Attack surface** | Only static files; nothing to hack or overload. | API, auth, database to exploit and DDoS. |
| **DDoS** | Hard to “down” — files are cached at the edge (CDN). | Your server and DB can be overloaded; you must scale and protect them. |
| **Uptime** | CDN serves from many locations; one failure doesn’t take the whole site. | Single server or DB failure can take the site down. |
| **Maintenance** | No servers, no DB, no patches. | You maintain servers, backups, and security. |

**Conclusion:** Keeping the portfolio **static (no backend, no database)** is the best way to make it **hard to take down**. Adding a backend would create more things that can fail or be attacked, not fewer.

Use a backend/database only if you add features that need it (e.g. contact form that saves to DB, login, blog CMS). For a resume-style portfolio, static + CDN + security headers is enough.

---

## Protection from every angle (summary)

| Layer | What’s in place |
|-------|------------------|
| **1. Host & CDN** | Deploy on Vercel or Netlify — DDoS mitigation, global CDN, HTTPS. |
| **2. Optional: Cloudflare** | Put domain behind Cloudflare for extra DDoS/rate limiting. |
| **3. Security headers** | CSP, HSTS, X-Frame-Options, etc. (see below). |
| **4. No server/API** | Nothing to overload or exploit; static files only. |
| **5. Cache / offline** | Service worker caches the site so returning visitors can load it from cache if the origin is slow or down. |

---

## 1. DDoS & Traffic Protection (Where It Actually Happens)

**DDoS (Distributed Denial of Service)** is handled **at the hosting / CDN layer**, not in your front-end code. The site is static (HTML/CSS/JS), so “protecting the app” means:

- **Use a host that provides DDoS protection**
- **Put the site behind a CDN** so traffic is absorbed and filtered at the edge

### Recommended setup

| Approach | What to do |
|----------|------------|
| **Vercel** | Deploy here. Vercel includes DDoS mitigation and global CDN. No extra config needed. |
| **Netlify** | Same idea: deploy here for built-in DDoS protection and CDN. |
| **Cloudflare in front** | Point your domain to Cloudflare, then to Vercel/Netlify (or any host). Use Cloudflare’s “Under Attack” mode or rate limiting for extra protection. |
| **Avoid** | Running the static site on a single VPS or bare server without a CDN/WAF in front. |

### Quick wins

1. **Deploy on Vercel or Netlify** – Both apply security headers from this repo and give you DDoS/CDN protection.
2. **Use Cloudflare** – Add your domain to Cloudflare and set DNS to your host. Enable:
   - **Always Use HTTPS**
   - **Under Attack Mode** (if you see abuse) or **Rate limiting** (e.g. limit requests per IP).

---

## 2. Security Headers (Already Configured)

This repo configures standard security headers so your host sends them on every response.

### Headers applied (via `vercel.json` / `netlify.toml` / `public/_headers`)

| Header | Purpose |
|--------|--------|
| **X-Content-Type-Options: nosniff** | Stops browsers from guessing MIME types (reduces XSS/clickjacking risk). |
| **X-Frame-Options: DENY** | Stops the site from being embedded in iframes (clickjacking). |
| **X-XSS-Protection: 1; mode=block** | Legacy XSS filter in older browsers. |
| **Referrer-Policy: strict-origin-when-cross-origin** | Limits what referrer info is sent to other sites. |
| **Permissions-Policy** | Disables camera, microphone, geolocation for this origin. |
| **Strict-Transport-Security (HSTS)** | Forces HTTPS and preload (after first HTTPS load). |
| **Content-Security-Policy (CSP)** | Restricts where scripts, styles, fonts, and images load from (reduces XSS and injection). |

CSP is tuned for this project: same-origin scripts, Google Fonts, and `https:` images (e.g. Unsplash) are allowed.

---

## 3. Cache & offline resilience (service worker)

The repo includes a **service worker** (`public/sw.js`) that:

- Caches the portfolio (HTML, JS, CSS, assets) when users visit.
- On later visits, if the network fails or the origin is slow/down, the browser can **serve the site from cache** so the portfolio still loads.

So even when the host is under attack or briefly unavailable, **returning visitors** may still see the site from their local cache. The SW only runs over **HTTPS** (and localhost).

---

## 4. What this site does not expose

- No backend or database (static only).
- No secrets in the front-end (no API keys in client code).
- No forms that submit to your own server (only mailto/LinkedIn links).

So there is no server or API in this project to “DDoS” directly; protection is about the **host**, **CDN**, and **optional Cloudflare**.

---

## 5. Checklist before going live

- [ ] Deploy to **Vercel** or **Netlify** (or similar) so DDoS/CDN is in place.
- [ ] Use **HTTPS only** (enforced by host + HSTS from this repo).
- [ ] (Optional) Put the site behind **Cloudflare** and enable rate limiting or Under Attack Mode if needed.
- [ ] Do not put API keys or secrets in `index.html` or any client-side code.
- [ ] Keep dependencies up to date: `npm audit` and update packages when needed.

---

## 6. If you use your own server

If you later serve the built files (e.g. from `dist/`) on your own server:

- Put a **reverse proxy** (e.g. Nginx) or **WAF** in front with rate limiting and DDoS mitigation.
- Send the same security headers (you can copy them from `vercel.json` or `netlify.toml`).
- Use **HTTPS** (e.g. Let’s Encrypt) and enable HSTS.

For a static portfolio, using **Vercel or Netlify + optional Cloudflare** is the simplest and most secure approach.
