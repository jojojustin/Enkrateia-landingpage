# Enkrateia — GitHub Pages Website

Phase A landing site for Apple Family Controls entitlement request and public presence.

## Files

```
index.html    — Main landing page (waitlist, phases, privacy)
privacy.html  — Full Privacy Policy (matches in-app policy)
terms.html    — Terms of Service
README.md     — This file
```

## Deploy to GitHub Pages (5 minutes)

### Step 1 — Create the repository

1. Go to github.com → New repository
2. Name it **`enkrateia`**
3. Set to **Public**
4. Do NOT initialize with README (you have one)

### Step 2 — Push this folder

```bash
cd /Users/joeljustin/Downloads/enkrateia-site
git init
git add .
git commit -m "Initial site — Phase A"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/enkrateia.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

### Step 3 — Enable GitHub Pages

1. Repository → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: `main` / `/ (root)`
4. Click **Save**

Your site will be live at:
```
https://YOUR_USERNAME.github.io/enkrateia/
```

GitHub Pages typically activates within 1–3 minutes.

### Step 4 — Use this URL in the Apple entitlement form

When filling out the Family Controls distribution entitlement request at  
`developer.apple.com/contact/request/family-controls-distribution`:

- **Website URL field:** `https://YOUR_USERNAME.github.io/enkrateia/`
- **Privacy Policy URL:** `https://YOUR_USERNAME.github.io/enkrateia/privacy.html`

This URL is explicitly confirmed to work for the entitlement form. GitHub Pages is
a trusted domain and does not require a custom domain.

---

## Connect the waitlist form (Supabase-first)

This repo now supports a secure Supabase Edge Function endpoint.

1. In app repo (`/Users/joeljustin/Downloads/enkrateia`) run migrations and deploy:
```bash
supabase db push
supabase functions deploy waitlist-signup
```

2. Copy your function URL:
```txt
https://<project-ref>.functions.supabase.co/waitlist-signup
```

3. In `index.html`, set:
```js
const WAITLIST_ENDPOINT = 'https://<project-ref>.functions.supabase.co/waitlist-signup';
```

4. Submit test emails from both waitlist forms and verify rows in `waitlist_subscribers`.

You can still use Formspree/Mailchimp instead, but Supabase keeps your data in one stack.

## Analytics setup (privacy-gated)

`index.html` has consent-gated analytics placeholders:

```js
const ANALYTICS = {
  posthogKey: '',
  posthogHost: 'https://app.posthog.com',
  gaMeasurementId: '',
};
```

Set keys to enable tracking after user consent:
- `posthogKey`: from PostHog project settings
- `gaMeasurementId`: GA4 Measurement ID (`G-XXXXXXX`)

---

## Phase B — Custom domain

When ready to add `enkrateia.app` or similar:

1. Buy domain (Namecheap, Cloudflare, etc.)
2. In GitHub Pages Settings → Custom domain → enter your domain
3. Add DNS records as GitHub instructs (CNAME or A records)
4. Enable "Enforce HTTPS" once DNS propagates

Update the Apple entitlement form and App Store Connect with the custom domain URL.

---

## Phase C — Upgrade the site

Next additions before launch:
- App Store badge (once the app is approved)
- Real screenshots in a carousel
- "How it works" animated walkthrough
- Analytics (Plausible or Fathom — privacy-respecting)
- SEO: sitemap.xml, structured data (SoftwareApplication schema)
- Waitlist confirmation email

---

## Legal notes

- `terms.html` contains placeholder text for governing state/jurisdiction — update with your actual state before launch.
- The privacy policy email addresses (`privacy@enkrateia.app`, `support@enkrateia.app`) need working inboxes before the app goes live.
- The privacy policy effective date is April 26, 2026 — update if you materially revise it before launch.
