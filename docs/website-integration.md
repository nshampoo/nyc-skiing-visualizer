# Adding the Epic Weekend Planner to shampoe.com

Changes for the [shampoe-website](https://github.com/nshampoo/shampoe-website) repo to serve this app at **shampoe.com/epicPlanning/**, the same way Citi Bike Tides and Volo are served.

## How it fits

This repo deploys its own CloudFront distribution (stack `EpicPlanningSite`). shampoe.com proxies to it at `/epicPlanning/app/*`, and a page at `/epicPlanning/` shows the site header over an iframe of the app. Deploys of this repo then show up on shampoe.com without redeploying the site.

```
shampoe.com/epicPlanning/       site/epicPlanning/index.html (header + iframe)
shampoe.com/epicPlanning/app/*  ──> EpicPlanningSite CloudFront (prefix stripped)
```

The app is static: four files, no backend. Visitors' browsers fetch snow from Open-Meteo and map tiles from Esri directly.

## Changes

### 1. Register the app: `infra/bin/infra.ts`

Add it to `apps`. The domain is the `SiteUrl` output of this repo's `EpicPlanningSite` stack, already deployed:

```ts
  apps: {
    citibike: 'd2g10dtmnepqv0.cloudfront.net', // Citi Bike Tides (~/Code/citibike-migration)
    volo: 'd1wfj80t6mlo6z.cloudfront.net', // Volo Drop-in Alerts (~/Code/volo-notification-service)
    epicPlanning: 'doccazxgqqfry.cloudfront.net', // Epic Weekend Planner (~/Code/nyc-skiing-calculator)
  },
```

### 2. Allow capital letters in app names: `infra/lib/site-stack.ts`

The router function only matches lowercase app names, so `/epicPlanning/app/...` would fall through to the site bucket and 404. In the `Router` function's inline code:

```diff
-  var m = req.uri.match(/^\\/([a-z0-9-]+)(\\/app)?(\\/.*)?$/);
+  var m = req.uri.match(/^\\/([A-Za-z0-9-]+)(\\/app)?(\\/.*)?$/);
```

(The doubled backslashes are because this is inside a template literal; keep them.)

URLs are case-sensitive, so `/epicplanning` won't match. If you'd rather avoid that, rename the app to `epic-planning` everywhere instead and skip this change.

### 3. Add the page: `site/epicPlanning/index.html`

Modeled on `site/citibike/open/index.html`. The header markers are left empty; step 4 fills them in.

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Epic Weekend Planner · Nick Shampoe</title>
<meta name="description" content="Where it's snowing on the Epic Pass, with flight, hotel, and driving links from NYC for this weekend or next.">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="/site.css">
<style>
body { height: 100vh; height: 100dvh; overflow: hidden; }
.toolbar { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 8px var(--gutter); background: var(--surface-2); border-bottom: 1px solid var(--rule); font-size: 13.5px; color: var(--muted); }
iframe { flex: 1; width: 100%; border: 0; display: block; }
</style>
<script src="/site.js"></script>
</head>
<body>
<!-- header page="workshop" -->
<!-- /header -->
<div class="toolbar"><a href="/">← Back to the workshop</a><span>Snow from Open-Meteo · prices open live</span></div>
<iframe id="app" title="Epic Weekend Planner" allow="fullscreen"></iframe>
<script>document.getElementById("app").src = "/epicPlanning/app/" + location.search;</script>
</body>
</html>
```

Passing `location.search` through means shareable links work from the site, e.g. `shampoe.com/epicPlanning/?resort=vail&days=fri-mon`.

### 4. Fill in the header

```
node scripts/sync-chrome.mjs
```

### 5. README: add a row to the Layout table

```
| `site/epicPlanning/` | Epic Weekend Planner under the site header (iframe of `/epicPlanning/app/`) |
```

### Optional, later

- A Workshop card on `site/index.html` and a "how and why" story page at `site/epicPlanning/` (the tool would then move to `site/epicPlanning/open/`, matching Citi Bike and Volo).

## Deploy and check

This repo's stack is already live at https://doccazxgqqfry.cloudfront.net, so only the site needs deploying:

```
node scripts/sync-chrome.mjs
cd infra
AWS_PROFILE=personal npx cdk deploy
```

Then check:

```
curl -sI https://shampoe.com/epicPlanning | grep -i location        # 301 to /epicPlanning/
curl -s  https://shampoe.com/epicPlanning/ | grep '<title>'         # Epic Weekend Planner · Nick Shampoe
curl -s  https://shampoe.com/epicPlanning/app/ | grep '<title>'     # Epic Weekend Planner
curl -sI https://shampoe.com/epicPlanning/app/app.js | head -1      # HTTP/2 200
```

In a browser: the map loads with pins, clicking a resort opens its panel, and the site header's theme toggle switches the map between light and dark. That works because the iframe is same-origin with the page and picks up the `theme` storage change.
