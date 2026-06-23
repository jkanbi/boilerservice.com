# boilerservice.com

A simple static microsite for boiler servicing information and links to the MyBoiler.com resource network.

## Pages

- **Home** (`index.html`) — overview, resource links, topics, and popular brands
- **Boiler Service Checklist** (`boiler-service.html`) — professional servicing checklist (from [Hub.MyBoiler.com](https://hub.myboiler.com/boiler-service/?referrer=boilerservice.com))
- **About** (`about.html`) — site purpose and related properties

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
