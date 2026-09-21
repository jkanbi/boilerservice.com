# boilerservice.com

A simple static microsite for boiler servicing information and links to the MyBoiler.com resource network.

## Pages

- **Home** (`index.html`) — overview, resource links, topics, and popular brands
- **Book a visit** (`book/index.html`) — customer intake for an annual service or repair in the NW London–M25 launch area (`/book/`)
- **Terms & Conditions** (`terms/index.html`) — marketplace / introducer terms (`/terms/`)
- **Boiler Service Checklist** (`boiler-service.html`) — professional servicing checklist (from [Hub.MyBoiler.com](https://hub.myboiler.com/boiler-service/?referrer=boilerservice.com))
- **About** (`about.html`) — site purpose and related properties

## Booking form (native → Supabase)

The `/book/` page is a **native HTML form** (no HubSpot embed). GitHub Pages cannot write to a database, so the form `fetch`es JSON to a **Supabase Edge Function**, which creates the customer / boiler / job records.

- Endpoint: `https://yipcailckjlvkkzcexgk.supabase.co/functions/v1/submit-booking`
- Client: [`js/book.js`](js/book.js)
- Auth: the project **anon** (publishable) key is sent as `Authorization: Bearer …` and `apikey` so the function’s `verify_jwt` check succeeds. It is not a secret.

The browser posts `Content-Type: application/json`. Success is `{ "ok": true, "job_code": "JOB-…" }`; failure is `{ "ok": false, "error": "…" }`.

Payload keys (mapped from the live form fields in `book/index.html`):

`customer_name`, `mobile`, `email`, `postcode`, `address` (street + town), `job_type`, `boiler_brand`, `boiler_model`, `boiler_age`, `repair_issue`, `fault_code`, `preferred_window` (date + morning/afternoon/evening + notes), `access_notes`, `notes` (includes the consent line), `consent`, `_honey`

A filled honeypot (`_honey`) shows the success state in the browser without requiring a real write. The Edge Function also no-ops if that field is sent populated.

CORS on the function allows `https://boilerservice.com`, `https://www.boilerservice.com`, and local preview on port **5500**. To submit from a local copy, serve on that port (`python -m http.server 5500`) and open http://127.0.0.1:5500/book/.

The previous Google Apps Script / Sheets webhook (`scripts/jobs-form-apps-script.gs`) is no longer used for live `/book/` submissions.

## Related sites

- [MyBoiler.com](https://myboiler.com) — main heating & hot water resource hub
- [BoilerManuals.com](https://boilermanuals.com) — free boiler and controls manuals

## Local preview

Open `index.html` in a browser, or serve locally with Python:

```bash
python -m http.server 3456
```

Then visit http://localhost:3456/

## GitHub Pages

This repo deploys automatically via GitHub Actions on every push to `main`.

### One-time setup in GitHub

1. Push these changes to `main`
2. Open **Settings → Pages** in the GitHub repo
3. Under **Build and deployment**, set **Source** to **GitHub Actions**
4. After the first workflow run, the site will be live at https://boilerservice.com (once DNS is configured)

### Custom domain DNS

Point `boilerservice.com` at GitHub Pages:

| Type | Name | Value |
|------|------|-------|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `jkanbi.github.io` |

Enable **Enforce HTTPS** in the Pages settings once DNS has propagated.
