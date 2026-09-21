# boilerservice.com

A simple static microsite for boiler servicing information and links to the MyBoiler.com resource network.

## Pages

- **Home** (`index.html`) — overview, resource links, topics, and popular brands
- **Book a visit** (`book/index.html`) — customer intake for an annual service or repair in the NW London–M25 launch area (`/book/`)
- **Terms & Conditions** (`terms/index.html`) — marketplace / introducer terms (`/terms/`)
- **Boiler Service Checklist** (`boiler-service.html`) — professional servicing checklist (from [Hub.MyBoiler.com](https://hub.myboiler.com/boiler-service/?referrer=boilerservice.com))
- **About** (`about.html`) — site purpose and related properties

## Booking form (native → Google Sheet)

The `/book/` page is a **native HTML form** (no HubSpot embed). GitHub Pages cannot write to Google Sheets, so the form `fetch`es JSON to a **Google Apps Script Web App**, which appends a row to the Jobs spreadsheet.

- Spreadsheet: [BoilerService — Jobs](https://docs.google.com/spreadsheets/d/1sAOQzDlgAa3DB4vDZ-4Op5h7Arre8xW1q5poMx98_Gc/edit)
- Spreadsheet ID: `1sAOQzDlgAa3DB4vDZ-4Op5h7Arre8xW1q5poMx98_Gc`
- Script source: [`scripts/jobs-form-apps-script.gs`](scripts/jobs-form-apps-script.gs)
- Client: [`js/book.js`](js/book.js) (`SHEET_WEBHOOK_URL`)

Columns written (script creates / extends the header row, including optional `boiler_model` after `boiler_brand`):

`job_id`, `created_at`, `status`, `job_type`, `customer_name`, `mobile`, `email`, `postcode`, `address`, `boiler_brand`, `boiler_model`, `boiler_age`, `repair_issue`, `fault_code`, `preferred_window`, `access_notes`, `matched_engineer`, `engineer_price`, `stripe_link`, `notes`

New rows get `status = new`, an ISO `created_at`, and a unique `job_id`. The script always sets those server-side.

### Deploy the Apps Script web app

1. Open the [Jobs spreadsheet](https://docs.google.com/spreadsheets/d/1sAOQzDlgAa3DB4vDZ-4Op5h7Arre8xW1q5poMx98_Gc/edit).
2. **Extensions → Apps Script**.
3. Replace any stub code with [`scripts/jobs-form-apps-script.gs`](scripts/jobs-form-apps-script.gs). Confirm `SPREADSHEET_ID` matches the sheet.
4. **Deploy → New deployment → Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Authorise Google when prompted, then copy the Web App URL (`…/exec`).
6. Paste that URL into `js/book.js` as `SHEET_WEBHOOK_URL` and commit.

Until `SHEET_WEBHOOK_URL` is set, the form still renders with validation and success/error states, and shows a warning that submissions are not connected.

The browser posts JSON as `text/plain` (Apps Script cannot handle CORS `OPTIONS` preflights). `doPost` parses the JSON body and returns `{ ok: true }`.

To preview locally, serve the site (`python -m http.server 3456`) and open http://localhost:3456/book/.

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
