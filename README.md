# Epic Weekend Planner

A map of every Epic Pass resort, colored by how much it's snowed (or will), with one-click links to plan a weekend from NYC: Google Flights, Google Hotels, driving directions, and rental cars, all with the weekend's dates filled in.

Built for [shampoe.com/epicPlanning](https://shampoe.com/epicPlanning/).

## How it works

- **Snow:** the browser asks [Open-Meteo](https://open-meteo.com/) (free, no key) for every resort in one request: 7 days back, 16 days ahead. These are model numbers at each resort's coordinates and elevation, not the resort's measured snow report.
- **Prices:** none stored. Each link opens the live price on Google or Kayak for the chosen trip.
- **Trips:** this weekend or next (both inside the forecast), on Sat–Sun, Fri–Sun, Thu–Sun, or Fri–Mon. The trip days set the link dates, and a weekend's snow total runs from the day before you arrive to the day you leave.
- **Resorts:** hand-curated in `app/resorts.js` (coordinates, elevation, nearest airport, drive time, Epic access). Partner lists change each season; check [epicpass.com](https://www.epicpass.com/) when updating.

`?resort=vail&weekend=2026-12-11&days=fri-mon` opens straight to a resort and trip (`weekend` is that weekend's Friday).

| Path | What |
| --- | --- |
| `app/` | The whole site: `index.html`, `app.js`, `resorts.js`, `style.css`. No build step. |
| `infra/` | CDK stack: private S3 bucket + CloudFront |

## Run locally

```
cd app
python3 -m http.server 8791
```

Then open http://127.0.0.1:8791/.

## Deploy

```
cd infra
npm install
AWS_PROFILE=personal npx cdk deploy
```

shampoe.com serves this stack's CloudFront at `/epicPlanning/app/` (listed under `apps` in the personal-website repo's `infra/bin/infra.ts`), and `/epicPlanning/` frames it under the site header. [docs/website-integration.md](docs/website-integration.md) has the changes that repo needs.
