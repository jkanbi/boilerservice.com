# boilerservice.com

A simple static microsite for boiler servicing information and links to the MyBoiler.com resource network.

## Pages

- **Home** (`index.html`) — overview, resource links, topics, and popular brands
- **Book a visit** (`book/index.html`) — customer intake for an annual service or repair in the NW London–M25 launch area (`/book/`)
- **Boiler Service Checklist** (`boiler-service.html`) — professional servicing checklist (from [Hub.MyBoiler.com](https://hub.myboiler.com/boiler-service/?referrer=boilerservice.com))
- **About** (`about.html`) — site purpose and related properties

## Booking form (HubSpot)

The `/book/` page embeds a HubSpot form (EU1) rather than posting from this site:

- Portal ID: `148934146`
- Form GUID: `82340d84-dc01-4593-98ce-cd512841149f`
- Embed script: `https://js-eu1.hsforms.net/forms/embed/148934146.js`

Edit the form in HubSpot; this repo only hosts the embed. To preview locally, serve the site (`python -m http.server 3456`) and open http://localhost:3456/book/.

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
