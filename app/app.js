// Epic Weekend Planner: a map of every Epic Pass resort colored by snowfall, with one-click
// links (dates filled in) to flights, hotels, driving directions, and rental cars from NYC.
//
// Snow comes from Open-Meteo (free, no key): one request for every resort, 7 days back and
// 16 days ahead. Those are model numbers for the resort's coordinates and elevation, not the
// resort's own snow report, so they won't match it exactly.
import { RESORTS, REGIONS } from "./resorts.js";

const L = window.L;
const NORTH_AMERICA = ["northeast", "midatlantic", "midwest", "rockies", "west", "canada"];
const PAST_DAYS = 7;
const FORECAST_DAYS = 16;
const PIN_SIZES = [12, 18, 24, 30, 36]; // by bin
const METRIC_LABELS = { next: "next 7 days", wk0: "this weekend", wk1: "next weekend", past: "last 7 days" };

// The days you can pick for a trip, as offsets from Friday (Thu = -1 .. Mon = 3). A trip is
// { from, to } within these, at least one night. The links use them as travel dates; the
// weekend snow window runs from the day before you arrive to the day you leave.
const DAYS = ["thu", "fri", "sat", "sun", "mon"];
const FIRST_DAY = -1;
const DEFAULT_TRIP = { from: 0, to: 2 }; // Fri–Sun
const TRIP_KEY = "epic-trip-days";

const tripKey = (t) => `${DAYS[t.from - FIRST_DAY]}-${DAYS[t.to - FIRST_DAY]}`; // "fri-sun"
function parseTrip(key) {
  const [a, b] = String(key).split("-").map((d) => DAYS.indexOf(d) + FIRST_DAY);
  return a >= FIRST_DAY && b > a ? { from: a, to: b } : null;
}

const state = {
  weekends: upcomingFridays(2), // this weekend and next: both always inside the 16-day forecast
  friday: null, // the trip weekend the links are for
  trip: DEFAULT_TRIP, // which days of it: { from, to }
  metric: "next", // what the map colors by: next | wk0 | wk1 (this/next weekend's snow window) | past
  region: "na",
  selected: null,
  snow: null, // Map: resort id -> { time: [...], snow: [...], hi: [...], lo: [...] }
  error: null,
};
state.friday = state.weekends[0];
try { state.trip = parseTrip(localStorage.getItem(TRIP_KEY)) ?? state.trip; } catch (e) { /* no storage: default */ }

// ?resort=vail&weekend=2026-12-11&days=fri-mon opens straight to that resort and trip, so a view can be shared.
const query = new URLSearchParams(location.search);
if (RESORTS.some((r) => r.id === query.get("resort"))) state.selected = query.get("resort");
if (state.weekends.includes(query.get("weekend"))) {
  state.friday = query.get("weekend");
  state.metric = weekendMetric(state.friday); // a shared link to a weekend opens on that weekend's snow
}
state.trip = parseTrip(query.get("days")) ?? state.trip;

function saveQuery() {
  const q = new URLSearchParams();
  if (state.selected) q.set("resort", state.selected);
  if (state.friday !== state.weekends[0]) q.set("weekend", state.friday);
  if (tripKey(state.trip) !== tripKey(DEFAULT_TRIP)) q.set("days", tripKey(state.trip));
  history.replaceState(null, "", q.size ? `?${q}` : location.pathname);
}

// ---- Dates (all as YYYY-MM-DD strings; arithmetic in UTC so time zones can't shift a day) ----

function iso(d) { return d.toISOString().slice(0, 10); }
function parse(s) { return new Date(s + "T00:00:00Z"); }
function addDays(s, n) { const d = parse(s); d.setUTCDate(d.getUTCDate() + n); return iso(d); }
function fmt(s, opts) { return parse(s).toLocaleDateString("en-US", { timeZone: "UTC", ...opts }); }
const short = (s) => fmt(s, { month: "short", day: "numeric" });

function localToday() {
  const now = new Date();
  return iso(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())));
}

// The Friday of this weekend if it's Fri-Sun, else the coming Friday, then the ones after.
function upcomingFridays(count) {
  const today = localToday();
  const dow = parse(today).getUTCDay(); // 0 Sun .. 6 Sat
  const back = { 5: 0, 6: 1, 0: 2 }[dow];
  const first = back !== undefined ? addDays(today, -back) : addDays(today, (5 - dow + 7) % 7);
  return Array.from({ length: count }, (_, i) => addDays(first, i * 7));
}

// Travel days and snow window for the weekend starting Friday `fri`, given the trip setting.
function tripDates(fri) {
  const t = state.trip;
  const depart = addDays(fri, t.from);
  const ret = addDays(fri, t.to);
  return { depart, ret, snowFrom: addDays(depart, -1), snowTo: ret };
}
const dayName = (s) => fmt(s, { weekday: "short" });

function weekendRange(fri) {
  const { depart, ret } = tripDates(fri);
  return parse(depart).getUTCMonth() === parse(ret).getUTCMonth()
    ? `${short(depart)}–${fmt(ret, { day: "numeric" })}`
    : `${short(depart)} – ${short(ret)}`;
}

// ---- Snow data ----

async function loadSnow() {
  const params = new URLSearchParams({
    latitude: RESORTS.map((r) => r.lat).join(","),
    longitude: RESORTS.map((r) => r.lon).join(","),
    elevation: RESORTS.map((r) => r.elev).join(","),
    daily: "snowfall_sum,temperature_2m_max,temperature_2m_min",
    past_days: PAST_DAYS,
    forecast_days: FORECAST_DAYS,
    timezone: "auto",
    precipitation_unit: "inch",
    temperature_unit: "fahrenheit",
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error(`Open-Meteo returned ${res.status}`);
  const body = await res.json();
  const list = Array.isArray(body) ? body : [body];
  return new Map(RESORTS.map((r, i) => {
    const d = list[i].daily;
    return [r.id, { time: d.time, snow: d.snowfall_sum.map((v) => v ?? 0), hi: d.temperature_2m_max, lo: d.temperature_2m_min }];
  }));
}

// Inches over the chosen window, or null when the window isn't covered by the data.
// Each resort's days are in its own time zone; index PAST_DAYS is its "today".
function weekendMetric(fri) { return `wk${state.weekends.indexOf(fri)}`; }

function windowFor(metric) {
  if (metric === "past") return { from: 0, to: PAST_DAYS };
  if (metric === "next") return { from: PAST_DAYS, to: PAST_DAYS + 7 };
  const { snowFrom, snowTo } = tripDates(state.weekends[Number(metric.slice(2))]);
  const dates = [];
  for (let s = snowFrom; s <= snowTo; s = addDays(s, 1)) dates.push(s);
  return { dates };
}

function total(id, metric = state.metric) {
  const d = state.snow?.get(id);
  if (!d) return null;
  const w = windowFor(metric);
  let idx;
  if (w.dates) {
    idx = w.dates.map((s) => d.time.indexOf(s));
    if (idx.includes(-1)) return null;
  } else {
    idx = Array.from({ length: w.to - w.from }, (_, i) => w.from + i);
  }
  return idx.reduce((sum, i) => sum + d.snow[i], 0);
}

function bin(inches) {
  if (inches == null || inches < 0.5) return 0;
  if (inches < 3) return 1;
  if (inches < 6) return 2;
  if (inches < 12) return 3;
  return 4;
}
function inches(v) {
  if (v == null) return "–";
  if (v > 0 && v < 0.5) return "<½ in";
  return `${v < 10 ? v.toFixed(1).replace(/\.0$/, "") : Math.round(v)} in`;
}

// ---- Links (dates filled in; each opens the live price on Google, Kayak, or the resort) ----

function links(r, fri) {
  const { depart, ret } = tripDates(fri);
  const q = encodeURIComponent;
  const longDate = (s) => fmt(s, { month: "long", day: "numeric", year: "numeric" });
  const where = r.place.startsWith(r.name) ? r.place : `${r.name}, ${r.place}`; // not "Vail Vail, CO"
  const out = [];
  if (r.airport) {
    out.push({ label: `Flights NYC → ${r.airport}`, note: "Google Flights", href: `https://www.google.com/travel/flights?q=${q(`Flights to ${r.airport} from NYC on ${depart} through ${ret}`)}` });
  }
  if (r.drive) {
    out.push({ label: `Drive from NYC (~${r.drive} hr)`, note: "Google Maps", href: `https://www.google.com/maps/dir/?api=1&origin=${q("New York, NY")}&destination=${q(where)}&travelmode=driving` });
  }
  out.push({ label: `Hotels near ${r.name}`, note: "Google Hotels", href: `https://www.google.com/travel/search?q=${q(`hotels near ${where} ${longDate(depart)} to ${longDate(ret)}`)}` });
  const carAt = r.drive ? "NYC" : r.airport;
  out.push({ label: `Rental car at ${carAt}`, note: "Kayak", href: `https://www.kayak.com/cars/${carAt}/${depart}/${ret}` });
  out.push({
    label: r.vail ? "Official snow report" : "Resort website",
    note: r.site,
    href: r.vail ? `https://www.${r.site}/the-mountain/mountain-conditions/snow-and-weather-report.aspx` : `https://${r.site}`,
  });
  return out;
}

// ---- Map ----

const map = L.map("map", { zoomControl: true, worldCopyJump: true, minZoom: 2 });
// Esri's gray canvas basemaps: keyless, quiet enough for the pins to carry the color,
// and they come in light and dark. Each is a base layer plus a labels layer on top.
const esri = (name) => `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/${name}/MapServer/tile/{z}/{y}/{x}`;
const attribution = 'Tiles &copy; Esri · Snow: <a href="https://open-meteo.com/">Open-Meteo</a>';
const basemap = (base, labels) => L.layerGroup([
  L.tileLayer(esri(base), { attribution, maxZoom: 16 }),
  L.tileLayer(esri(labels), { maxZoom: 16 }),
]);
const tiles = {
  light: basemap("World_Light_Gray_Base", "World_Light_Gray_Reference"),
  dark: basemap("World_Dark_Gray_Base", "World_Dark_Gray_Reference"),
};
let currentTiles = null;

function isDark() {
  const t = document.documentElement.getAttribute("data-theme");
  return t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
}
function applyTheme() {
  const next = isDark() ? tiles.dark : tiles.light;
  if (next === currentTiles) return;
  if (currentTiles) map.removeLayer(currentTiles);
  next.addTo(map);
  currentTiles = next;
}
// The site's toggle writes localStorage in the parent page; the storage event reaches this frame.
addEventListener("storage", (e) => {
  if (e.key !== "theme") return;
  if (e.newValue === "light" || e.newValue === "dark") document.documentElement.setAttribute("data-theme", e.newValue);
  else document.documentElement.removeAttribute("data-theme");
  applyTheme();
});
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyTheme);

const markers = new Map();
for (const r of RESORTS) {
  const m = L.marker([r.lat, r.lon], { keyboard: true, title: r.name, riseOnHover: true });
  m.bindTooltip("", { direction: "top" });
  m.on("click", () => select(r.id));
  m.addTo(map);
  markers.set(r.id, m);
}

function regionIds(region) {
  if (region === "all") return null;
  if (region === "na") return NORTH_AMERICA;
  return [region];
}
function inRegion(r) {
  const ids = regionIds(state.region);
  return !ids || ids.includes(r.region);
}
function fitRegion() {
  const pts = RESORTS.filter(inRegion).map((r) => [r.lat, r.lon]);
  if (state.region === "all") map.setView([30, -20], 2);
  else map.fitBounds(pts, { padding: [40, 40], maxZoom: 9 });
}

function drawPins() {
  for (const r of RESORTS) {
    const v = state.snow ? total(r.id) : null;
    const b = bin(v);
    const size = PIN_SIZES[b];
    const label = b >= 2 ? Math.round(v) : "";
    const m = markers.get(r.id);
    m.setIcon(L.divIcon({
      className: "",
      iconSize: [size, size],
      html: `<span class="pin b${b}${state.selected === r.id ? " selected" : ""}">${label}</span>`,
    }));
    m.setZIndexOffset(b * 100 + (state.selected === r.id ? 1000 : 0));
    m.setTooltipContent(`<b>${r.name}</b><br>${state.snow ? `${inches(v)} · ${METRIC_LABELS[state.metric]}` : "Loading snow…"}`);
    m.getTooltip().options.offset = [0, -size / 2];
  }
}

// ---- Panel ----

const panel = document.getElementById("panel");
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function regionName(id) {
  return REGIONS.find((g) => g.id === id)?.name ?? "";
}

function renderList() {
  const error = state.error
    ? `<p class="status">Couldn't load snow data (${esc(state.error)}). The links still work: pick a resort.</p>`
    : "";
  const rows = RESORTS.filter(inRegion)
    .map((r) => ({ r, v: total(r.id) }))
    .sort((a, b) => (b.v ?? -1) - (a.v ?? -1) || a.r.name.localeCompare(b.r.name));
  const head = `<div class="panel-head"><h2>Snowiest, ${METRIC_LABELS[state.metric]}</h2><p>${state.snow ? "Pick a resort for flights, hotels, and driving links." : "Loading snow…"}</p></div>`;
  const items = rows.map(({ r, v }) => `
    <li><button type="button" data-id="${r.id}">
      <i class="sw b${bin(v)}"></i>
      <span><span class="name">${esc(r.name)}</span><span class="place">${esc(r.place)}</span></span>
      <span class="val">${state.snow ? inches(v) : ""}</span>
    </button></li>`).join("");
  panel.innerHTML = error + head + `<ul class="list">${items}</ul>`;
}

function renderDetail(r) {
  const d = state.snow?.get(r.id);
  const fri = state.friday;
  const { depart, ret, snowFrom, snowTo } = tripDates(fri);
  const getThere = [r.drive ? `${r.drive} hr drive` : null, r.airport ? `Fly into ${r.airport}` : null].filter(Boolean);
  const stat = (metric, label) => `<div class="stat"><b>${d ? inches(total(r.id, metric)) : "–"}</b><span>${label}</span></div>`;
  panel.innerHTML = `
    <div class="detail">
      <button type="button" class="back">← All resorts</button>
      <h2>${esc(r.name)}</h2>
      <p class="sub">${esc(r.place)} · ${regionName(r.region)}</p>
      <div class="tags">
        <span class="tag">Epic: ${esc(r.access)}</span>
        ${getThere.map((t) => `<span class="tag">${t}</span>`).join("")}
      </div>
      <div class="stats">
        ${stat("past", "last 7 days")}
        ${stat("next", "next 7 days")}
        ${stat(weekendMetric(fri), `${dayName(snowFrom)}–${dayName(snowTo)}, trip`)}
      </div>
      ${d ? chart(d, fri) : ""}
      <h3>Plan a trip</h3>
      <div class="seg trip" role="radiogroup" aria-label="Trip weekend">
        ${state.weekends.map((f, i) => `<button type="button" role="radio" data-friday="${f}" aria-checked="${f === fri}">${i === 0 ? "This" : "Next"} weekend <small>${weekendRange(f)}</small></button>`).join("")}
      </div>
      ${daySlider()}
      <p class="dates">${dayName(depart)} ${short(depart)} to ${dayName(ret)} ${short(ret)}, from NYC</p>
      <div class="links">
        ${links(r, fri).map((l) => `<a href="${l.href}" target="_blank" rel="noopener">${esc(l.label)}<small>${esc(l.note)} ↗</small></a>`).join("")}
      </div>
      <p class="fine">Snow is Open-Meteo's model estimate at ${r.elev.toLocaleString()} m, not the resort's measured report. Prices open live on each site.</p>
    </div>`;
  panel.querySelector(".back").addEventListener("click", () => select(null));
  // Changes only the trip dates (links, chart shading), not what the map shows.
  panel.querySelector(".trip:not(.days)").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    state.friday = b.dataset.friday;
    saveQuery();
    renderPanel();
  });
  wireSlider();
  wireChart();
}

// Two range inputs stacked on one track: the left handle is the day you arrive, the right the
// day you leave. Only the handles take pointer events, so either can be dragged.
function daySlider() {
  const max = DAYS.length - 1;
  const v = (offset) => offset - FIRST_DAY;
  return `
    <div class="days" style="--n: ${max}">
      <div class="days-track"><div class="days-fill"></div></div>
      <input type="range" class="arrive" min="0" max="${max}" step="1" value="${v(state.trip.from)}" aria-label="Arrive">
      <input type="range" class="leave" min="0" max="${max}" step="1" value="${v(state.trip.to)}" aria-label="Leave">
      <div class="days-ticks">${DAYS.map((d, i) => `<span style="--i: ${i}">${d[0].toUpperCase() + d.slice(1)}</span>`).join("")}</div>
    </div>`;
}

function wireSlider() {
  const box = panel.querySelector(".days");
  const arrive = box.querySelector(".arrive");
  const leave = box.querySelector(".leave");
  const dates = panel.querySelector(".dates");
  const paint = () => {
    box.style.setProperty("--from", arrive.value);
    box.style.setProperty("--to", leave.value);
    box.querySelectorAll(".days-ticks span").forEach((t, i) => t.classList.toggle("on", i >= arrive.value && i <= leave.value));
  };
  // While dragging, just move the handles and the dates line; redraw everything on release.
  const onInput = (e) => {
    // Keep at least one night: the handle being dragged stops one day short of the other.
    if (Number(arrive.value) >= Number(leave.value)) {
      if (e.target === arrive) arrive.value = Number(leave.value) - 1;
      else leave.value = Number(arrive.value) + 1;
    }
    state.trip = { from: Number(arrive.value) + FIRST_DAY, to: Number(leave.value) + FIRST_DAY };
    const { depart, ret } = tripDates(state.friday);
    dates.textContent = `${dayName(depart)} ${short(depart)} to ${dayName(ret)} ${short(ret)}, from NYC`;
    paint();
  };
  // The days also set the map's weekend snow windows, so release redraws everything.
  const onChange = (e) => {
    try { localStorage.setItem(TRIP_KEY, tripKey(state.trip)); } catch (err) { /* still works for this visit */ }
    const which = e.target.className;
    update();
    panel.querySelector(`.days .${which}`)?.focus({ preventScroll: true }); // keep keyboard focus
  };
  for (const input of [arrive, leave]) {
    input.addEventListener("input", onInput);
    input.addEventListener("change", onChange);
  }
  paint();
}

// Daily snowfall, 7 days back through 16 ahead. Forecast bars are lighter; the trip's snow
// window is shaded. Hovering a day shows its total and temperatures in the caption.
function chart(d, fri) {
  const W = 340, H = 120, top = 14, bottom = 18;
  const n = d.time.length;
  const slot = W / n;
  const bw = Math.max(2, slot - 2);
  const max = Math.max(2, ...d.snow);
  const y = (v) => top + (H - top - bottom) * (1 - v / max);
  const base = H - bottom;
  const { snowFrom, snowTo } = tripDates(fri);
  const wk = [snowFrom, snowTo].map((s) => d.time.indexOf(s));
  const bars = d.snow.map((v, i) => {
    const x = i * slot + 1;
    const h = base - y(v);
    const rr = Math.min(2, bw / 2, h);
    const path = h <= 0 ? "" : `<path class="bar${i >= PAST_DAYS ? " fc" : ""}" data-i="${i}" d="M${x},${base}V${base - h + rr}q0,-${rr} ${rr},-${rr}h${bw - 2 * rr}q${rr},0 ${rr},${rr}V${base}Z"/>`;
    return `${path}<rect class="hit" data-i="${i}" x="${i * slot}" y="${top}" width="${slot}" height="${base - top}"/>`;
  }).join("");
  const band = wk[0] >= 0 || wk[1] >= 0
    ? `<rect class="band" x="${(wk[0] >= 0 ? wk[0] : 0) * slot}" y="0" width="${((wk[1] >= 0 ? wk[1] : n - 1) - (wk[0] >= 0 ? wk[0] : 0) + 1) * slot}" height="${base}"/>`
    : "";
  const tx = PAST_DAYS * slot;
  return `
    <figure class="chart">
      <figcaption data-default="Daily snowfall · shaded: your trip and the day before">Daily snowfall · shaded: your trip and the day before</figcaption>
      <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Daily snowfall, past 7 days and 16-day forecast">
        ${band}
        <line class="base" x1="0" x2="${W}" y1="${base}" y2="${base}"/>
        <line class="today" x1="${tx}" x2="${tx}" y1="${top - 4}" y2="${base}"/>
        <text class="axis" x="0" y="10">${inches(max)}</text>
        ${bars}
        <text class="axis" x="0" y="${H - 4}">${short(d.time[0])}</text>
        <text class="axis" x="${tx + 3}" y="${H - 4}">Today → forecast</text>
        <text class="axis" x="${W}" y="${H - 4}" text-anchor="end">${short(d.time[n - 1])}</text>
      </svg>
    </figure>`;
}

function wireChart() {
  const svg = panel.querySelector(".chart svg");
  if (!svg) return;
  const cap = panel.querySelector(".chart figcaption");
  const d = state.snow.get(state.selected);
  svg.addEventListener("mouseover", (e) => {
    const i = e.target.dataset?.i;
    if (i === undefined) return;
    svg.querySelectorAll(".bar.hot").forEach((b) => b.classList.remove("hot"));
    svg.querySelector(`.bar[data-i="${i}"]`)?.classList.add("hot");
    const day = d.time[i];
    const hi = d.hi[i], lo = d.lo[i];
    cap.textContent = `${fmt(day, { weekday: "short", month: "short", day: "numeric" })}${i >= PAST_DAYS ? " (forecast)" : ""}: ${inches(d.snow[i])}` +
      (hi != null ? ` · ${Math.round(hi)}° / ${Math.round(lo)}°F` : "");
  });
  svg.addEventListener("mouseleave", () => {
    svg.querySelectorAll(".bar.hot").forEach((b) => b.classList.remove("hot"));
    cap.textContent = cap.dataset.default;
  });
}

function renderPanel() {
  const r = RESORTS.find((x) => x.id === state.selected);
  if (r) renderDetail(r);
  else renderList();
}

panel.addEventListener("click", (e) => {
  const b = e.target.closest(".list button");
  if (b) select(b.dataset.id, true);
});

function select(id, pan = false) {
  state.selected = id;
  saveQuery();
  drawPins();
  renderPanel();
  panel.scrollTop = 0;
  // On phones the panel sits under the map; bring the resort's details into view.
  if (id && matchMedia("(max-width: 760px)").matches) panel.scrollIntoView({ behavior: "smooth" });
  if (id && pan) {
    const r = RESORTS.find((x) => x.id === id);
    map.panTo([r.lat, r.lon]);
  }
}

// ---- Controls ----

const regionSel = document.getElementById("region");
const metricSeg = document.getElementById("metric");

regionSel.innerHTML = [
  `<option value="na">North America</option>`,
  ...REGIONS.map((g) => `<option value="${g.id}">${g.name}</option>`),
  `<option value="all">Everywhere</option>`,
].join("");

// Rebuilt on every update: the weekend buttons' dates follow the trip days.
function syncControls() {
  metricSeg.innerHTML = ["next", "wk0", "wk1", "past"].map((m) => {
    const i = m.startsWith("wk") ? Number(m[2]) : -1;
    if (i < 0) return `<button type="button" role="radio" data-metric="${m}">${METRIC_LABELS[m].replace(/^./, (c) => c.toUpperCase())}</button>`;
    const { snowFrom, snowTo } = tripDates(state.weekends[i]);
    return `<button type="button" role="radio" data-metric="${m}" title="Snow ${dayName(snowFrom)} through ${dayName(snowTo)}: your trip days and the day before">${i === 0 ? "This" : "Next"} weekend <small>${weekendRange(state.weekends[i])}</small></button>`;
  }).join("");
  for (const b of metricSeg.querySelectorAll("button")) b.setAttribute("aria-checked", String(b.dataset.metric === state.metric));
}

function update() {
  saveQuery();
  syncControls();
  drawPins();
  renderPanel();
}

regionSel.addEventListener("change", () => {
  state.region = regionSel.value;
  fitRegion();
  update();
});
metricSeg.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  state.metric = b.dataset.metric;
  // Looking at a weekend's snow on the map also makes it the trip weekend.
  if (state.metric.startsWith("wk")) state.friday = state.weekends[Number(state.metric[2])];
  update();
});

// ---- Start ----

applyTheme();
fitRegion();
update();
loadSnow()
  .then((snow) => {
    state.snow = snow;
  })
  .catch((err) => { state.error = err.message; console.error(err); })
  .finally(update);
