# EnkrateiaOnline Header Hardening (Cloudflare)

Use this when your static origin is GitHub Pages/Fastly and does not emit custom security headers.

## Why this is needed

GitHub Pages does not support Netlify-style `_headers` processing.  
For `enkrateiaonline.com`, Cloudflare must set response headers at the edge.

## 1) Add Response Header Transform Rule

Cloudflare Dashboard -> `enkrateiaonline.com` -> **Rules** -> **Transform Rules** -> **Modify Response Header** -> Create rule.

Expression:

```
(http.host eq "enkrateiaonline.com")
```

Set these headers (operation: **Set**):

- `Strict-Transport-Security` = `max-age=31536000; includeSubDomains; preload`
- `X-Content-Type-Options` = `nosniff`
- `X-Frame-Options` = `DENY`
- `Referrer-Policy` = `strict-origin-when-cross-origin`
- `Permissions-Policy` = `accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()`
- `Cross-Origin-Opener-Policy` = `same-origin`
- `Cross-Origin-Resource-Policy` = `same-origin`
- `Content-Security-Policy` = `default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; manifest-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com data:; connect-src 'self' https://*.supabase.co https://app.posthog.com https://www.google-analytics.com https://region1.google-analytics.com; frame-src 'none'; upgrade-insecure-requests`

Optional cleanup:

- Remove `access-control-allow-origin` if it is globally set to `*` and not needed for this site.

## 2) Confirm security.txt route

After deploy, verify:

```
https://enkrateiaonline.com/.well-known/security.txt
```

Expected: `200 OK` and plain text body.

## 3) Verify with curl

Run:

```bash
curl -sSI https://enkrateiaonline.com/ | egrep -i "strict-transport|content-security-policy|x-content-type-options|referrer-policy|permissions-policy|x-frame-options"
curl -sSI https://enkrateiaonline.com/.well-known/security.txt
```

## 4) Re-run scanner

Re-run the Pentest-Tools light scan after Cloudflare rule publish and cache propagation.

