// Every resort on the 2026/27 Epic Pass, plus how to get there from NYC.
//
//   lat, lon  roughly mid-mountain; Open-Meteo picks the weather grid cell from these
//   elev      meters, upper-mid mountain, so the forecast is downscaled to where the snow falls
//   airport   nearest practical airport for a weekend trip (null: just drive)
//   drive     hours from Manhattan by car, only where driving is a sensible weekend option
//   access    what the Epic Pass gets you there
//   site      the resort's website; `vail: true` means a Vail Resorts site, which all share the
//             same snow report path
//
// Partner lists change every season; check epicpass.com before trusting `access`.

export const REGIONS = [
  { id: "northeast", name: "Northeast" },
  { id: "midatlantic", name: "Pennsylvania" },
  { id: "midwest", name: "Midwest" },
  { id: "rockies", name: "Rockies" },
  { id: "west", name: "West Coast" },
  { id: "canada", name: "Canada" },
  { id: "europe", name: "Europe" },
  { id: "japan", name: "Japan" },
  { id: "australia", name: "Australia" },
];

const UNLIMITED = "Unlimited";

export const RESORTS = [
  // Northeast
  { id: "hunter", name: "Hunter Mountain", place: "Hunter, NY", region: "northeast", lat: 42.2034, lon: -74.2253, elev: 900, airport: "ALB", drive: 2.5, access: UNLIMITED, site: "huntermtn.com", vail: true },
  { id: "mount-snow", name: "Mount Snow", place: "West Dover, VT", region: "northeast", lat: 42.9603, lon: -72.9204, elev: 900, airport: "ALB", drive: 4, access: UNLIMITED, site: "mountsnow.com", vail: true },
  { id: "okemo", name: "Okemo", place: "Ludlow, VT", region: "northeast", lat: 43.4017, lon: -72.717, elev: 900, airport: "ALB", drive: 4.5, access: UNLIMITED, site: "okemo.com", vail: true },
  { id: "stowe", name: "Stowe", place: "Stowe, VT", region: "northeast", lat: 44.5303, lon: -72.7814, elev: 1000, airport: "BTV", drive: 6, access: UNLIMITED, site: "stowe.com", vail: true },
  { id: "sunapee", name: "Mount Sunapee", place: "Newbury, NH", region: "northeast", lat: 43.3313, lon: -72.08, elev: 650, airport: "MHT", drive: 4.5, access: UNLIMITED, site: "mountsunapee.com", vail: true },
  { id: "crotched", name: "Crotched Mountain", place: "Bennington, NH", region: "northeast", lat: 42.998, lon: -71.874, elev: 550, airport: "MHT", drive: 4, access: UNLIMITED, site: "crotchedmtn.com", vail: true },
  { id: "attitash", name: "Attitash", place: "Bartlett, NH", region: "northeast", lat: 44.083, lon: -71.229, elev: 700, airport: "PWM", drive: 6, access: UNLIMITED, site: "attitash.com", vail: true },
  { id: "wildcat", name: "Wildcat", place: "Pinkham Notch, NH", region: "northeast", lat: 44.264, lon: -71.239, elev: 1000, airport: "PWM", drive: 6.5, access: UNLIMITED, site: "skiwildcat.com", vail: true },

  // Pennsylvania (and Whitetail/Liberty just over the Maryland line)
  { id: "jack-frost", name: "Jack Frost", place: "White Haven, PA", region: "midatlantic", lat: 41.108, lon: -75.655, elev: 600, airport: null, drive: 2, access: UNLIMITED, site: "jfbb.com", vail: true },
  { id: "big-boulder", name: "Big Boulder", place: "Lake Harmony, PA", region: "midatlantic", lat: 41.048, lon: -75.6, elev: 650, airport: null, drive: 2, access: UNLIMITED, site: "jfbb.com", vail: true },
  { id: "roundtop", name: "Roundtop", place: "Lewisberry, PA", region: "midatlantic", lat: 40.113, lon: -76.93, elev: 350, airport: null, drive: 3.5, access: UNLIMITED, site: "skiroundtop.com", vail: true },
  { id: "liberty", name: "Liberty Mountain", place: "Carroll Valley, PA", region: "midatlantic", lat: 39.763, lon: -77.376, elev: 350, airport: null, drive: 3.5, access: UNLIMITED, site: "libertymountainresort.com", vail: true },
  { id: "whitetail", name: "Whitetail", place: "Mercersburg, PA", region: "midatlantic", lat: 39.742, lon: -77.933, elev: 450, airport: null, drive: 4, access: UNLIMITED, site: "skiwhitetail.com", vail: true },
  { id: "seven-springs", name: "Seven Springs", place: "Seven Springs, PA", region: "midatlantic", lat: 40.023, lon: -79.297, elev: 880, airport: "PIT", drive: 6, access: UNLIMITED, site: "7springs.com", vail: true },
  { id: "hidden-valley-pa", name: "Hidden Valley", place: "Hidden Valley, PA", region: "midatlantic", lat: 40.05, lon: -79.25, elev: 850, airport: "PIT", drive: 6, access: UNLIMITED, site: "hiddenvalleyresort.com", vail: true },
  { id: "laurel", name: "Laurel Mountain", place: "Ligonier, PA", region: "midatlantic", lat: 40.161, lon: -79.163, elev: 850, airport: "PIT", drive: 6, access: UNLIMITED, site: "laurelmountainski.com", vail: true },

  // Midwest
  { id: "afton", name: "Afton Alps", place: "Hastings, MN", region: "midwest", lat: 44.858, lon: -92.787, elev: 300, airport: "MSP", drive: null, access: UNLIMITED, site: "aftonalps.com", vail: true },
  { id: "wilmot", name: "Wilmot", place: "Wilmot, WI", region: "midwest", lat: 42.507, lon: -88.183, elev: 290, airport: "ORD", drive: null, access: UNLIMITED, site: "wilmotmountain.com", vail: true },
  { id: "mt-brighton", name: "Mt. Brighton", place: "Brighton, MI", region: "midwest", lat: 42.543, lon: -83.809, elev: 300, airport: "DTW", drive: null, access: UNLIMITED, site: "mtbrighton.com", vail: true },
  { id: "alpine-valley", name: "Alpine Valley", place: "Chesterland, OH", region: "midwest", lat: 41.523, lon: -81.263, elev: 380, airport: "CLE", drive: null, access: UNLIMITED, site: "alpinevalleyohio.com", vail: true },
  { id: "boston-mills", name: "Boston Mills", place: "Peninsula, OH", region: "midwest", lat: 41.264, lon: -81.56, elev: 300, airport: "CLE", drive: null, access: UNLIMITED, site: "bmbw.com", vail: true },
  { id: "brandywine", name: "Brandywine", place: "Sagamore Hills, OH", region: "midwest", lat: 41.26, lon: -81.545, elev: 300, airport: "CLE", drive: null, access: UNLIMITED, site: "bmbw.com", vail: true },
  { id: "mad-river", name: "Mad River Mountain", place: "Zanesfield, OH", region: "midwest", lat: 40.323, lon: -83.682, elev: 440, airport: "CMH", drive: null, access: UNLIMITED, site: "skimadriver.com", vail: true },
  { id: "paoli", name: "Paoli Peaks", place: "Paoli, IN", region: "midwest", lat: 38.557, lon: -86.51, elev: 270, airport: "SDF", drive: null, access: UNLIMITED, site: "paolipeaks.com", vail: true },
  { id: "hidden-valley-mo", name: "Hidden Valley", place: "Wildwood, MO", region: "midwest", lat: 38.549, lon: -90.672, elev: 220, airport: "STL", drive: null, access: UNLIMITED, site: "hiddenvalleyski.com", vail: true },
  { id: "snow-creek", name: "Snow Creek", place: "Weston, MO", region: "midwest", lat: 39.434, lon: -94.89, elev: 280, airport: "MCI", drive: null, access: UNLIMITED, site: "skisnowcreek.com", vail: true },

  // Rockies
  { id: "vail", name: "Vail", place: "Vail, CO", region: "rockies", lat: 39.6061, lon: -106.355, elev: 3100, airport: "EGE", drive: null, access: UNLIMITED, site: "vail.com", vail: true },
  { id: "beaver-creek", name: "Beaver Creek", place: "Avon, CO", region: "rockies", lat: 39.6042, lon: -106.5165, elev: 3100, airport: "EGE", drive: null, access: UNLIMITED, site: "beavercreek.com", vail: true },
  { id: "breckenridge", name: "Breckenridge", place: "Breckenridge, CO", region: "rockies", lat: 39.4817, lon: -106.0684, elev: 3400, airport: "DEN", drive: null, access: UNLIMITED, site: "breckenridge.com", vail: true },
  { id: "keystone", name: "Keystone", place: "Keystone, CO", region: "rockies", lat: 39.6045, lon: -105.944, elev: 3300, airport: "DEN", drive: null, access: UNLIMITED, site: "keystoneresort.com", vail: true },
  { id: "crested-butte", name: "Crested Butte", place: "Crested Butte, CO", region: "rockies", lat: 38.8986, lon: -106.965, elev: 3200, airport: "GUC", drive: null, access: UNLIMITED, site: "skicb.com", vail: true },
  { id: "telluride", name: "Telluride", place: "Telluride, CO", region: "rockies", lat: 37.9375, lon: -107.8123, elev: 3300, airport: "MTJ", drive: null, access: "7 days", site: "tellurideskiresort.com" },
  { id: "park-city", name: "Park City", place: "Park City, UT", region: "rockies", lat: 40.6514, lon: -111.508, elev: 2700, airport: "SLC", drive: null, access: UNLIMITED, site: "parkcitymountain.com", vail: true },

  // West Coast
  { id: "heavenly", name: "Heavenly", place: "South Lake Tahoe, CA", region: "west", lat: 38.9353, lon: -119.94, elev: 2800, airport: "RNO", drive: null, access: UNLIMITED, site: "skiheavenly.com", vail: true },
  { id: "northstar", name: "Northstar", place: "Truckee, CA", region: "west", lat: 39.2746, lon: -120.121, elev: 2400, airport: "RNO", drive: null, access: UNLIMITED, site: "northstarcalifornia.com", vail: true },
  { id: "kirkwood", name: "Kirkwood", place: "Kirkwood, CA", region: "west", lat: 38.685, lon: -120.065, elev: 2600, airport: "RNO", drive: null, access: UNLIMITED, site: "kirkwood.com", vail: true },
  { id: "stevens-pass", name: "Stevens Pass", place: "Skykomish, WA", region: "west", lat: 47.7448, lon: -121.089, elev: 1500, airport: "SEA", drive: null, access: UNLIMITED, site: "stevenspass.com", vail: true },

  // Canada
  { id: "whistler", name: "Whistler Blackcomb", place: "Whistler, BC", region: "canada", lat: 50.115, lon: -122.9486, elev: 1800, airport: "YVR", drive: null, access: UNLIMITED, site: "whistlerblackcomb.com", vail: true },
  { id: "fernie", name: "Fernie", place: "Fernie, BC", region: "canada", lat: 49.463, lon: -115.087, elev: 1600, airport: "YXC", drive: null, access: "7 days, shared across Canadian Rockies", site: "skifernie.com" },
  { id: "kicking-horse", name: "Kicking Horse", place: "Golden, BC", region: "canada", lat: 51.297, lon: -117.047, elev: 1900, airport: "YYC", drive: null, access: "7 days, shared across Canadian Rockies", site: "kickinghorseresort.com" },
  { id: "kimberley", name: "Kimberley", place: "Kimberley, BC", region: "canada", lat: 49.689, lon: -116.005, elev: 1600, airport: "YXC", drive: null, access: "7 days, shared across Canadian Rockies", site: "skikimberley.com" },
  { id: "nakiska", name: "Nakiska", place: "Kananaskis, AB", region: "canada", lat: 50.942, lon: -115.151, elev: 1900, airport: "YYC", drive: null, access: "7 days, shared across Canadian Rockies", site: "skinakiska.com" },
  { id: "mont-sainte-anne", name: "Mont-Sainte-Anne", place: "Beaupré, QC", region: "canada", lat: 47.075, lon: -70.907, elev: 550, airport: "YQB", drive: 9.5, access: "7 days, shared across Canadian Rockies", site: "mont-sainte-anne.com" },
  { id: "stoneham", name: "Stoneham", place: "Stoneham, QC", region: "canada", lat: 47.028, lon: -71.37, elev: 450, airport: "YQB", drive: null, access: "7 days, shared across Canadian Rockies", site: "ski-stoneham.com" },

  // Europe
  { id: "andermatt", name: "Andermatt-Sedrun", place: "Andermatt, Switzerland", region: "europe", lat: 46.636, lon: 8.594, elev: 2200, airport: "ZRH", drive: null, access: UNLIMITED, site: "andermatt-sedrun-disentis.ch" },
  { id: "crans-montana", name: "Crans-Montana", place: "Crans-Montana, Switzerland", region: "europe", lat: 46.311, lon: 7.481, elev: 2100, airport: "GVA", drive: null, access: UNLIMITED, site: "mycransmontana.ch" },
  { id: "verbier", name: "Verbier 4 Vallées", place: "Verbier, Switzerland", region: "europe", lat: 46.096, lon: 7.228, elev: 2300, airport: "GVA", drive: null, access: "5 days", site: "verbier4vallees.ch" },
  { id: "3-vallees", name: "Les 3 Vallées", place: "Méribel, France", region: "europe", lat: 45.397, lon: 6.566, elev: 2100, airport: "GVA", drive: null, access: "5 consecutive days", site: "les3vallees.com" },
  { id: "arlberg", name: "Ski Arlberg", place: "St. Anton, Austria", region: "europe", lat: 47.129, lon: 10.268, elev: 2100, airport: "INN", drive: null, access: "5 days", site: "skiarlberg.at" },
  { id: "silvretta-montafon", name: "Silvretta Montafon", place: "Schruns, Austria", region: "europe", lat: 47.01, lon: 9.95, elev: 1900, airport: "ZRH", drive: null, access: "5 consecutive days", site: "silvretta-montafon.at" },
  { id: "solden", name: "Sölden", place: "Sölden, Austria", region: "europe", lat: 46.969, lon: 11.007, elev: 2400, airport: "INN", drive: null, access: "5 days", site: "soelden.com" },
  { id: "mayrhofen", name: "Mayrhofen", place: "Mayrhofen, Austria", region: "europe", lat: 47.165, lon: 11.865, elev: 1700, airport: "INN", drive: null, access: "5 consecutive days, with Hintertux", site: "mayrhofen.at" },
  { id: "hintertux", name: "Hintertux Glacier", place: "Tux, Austria", region: "europe", lat: 47.07, lon: 11.67, elev: 2700, airport: "INN", drive: null, access: "5 consecutive days, with Mayrhofen", site: "hintertuxergletscher.at" },
  { id: "saalbach", name: "Saalbach Hinterglemm", place: "Saalbach, Austria", region: "europe", lat: 47.391, lon: 12.637, elev: 1600, airport: "SZG", drive: null, access: "5 days, with Zell am See-Kaprun", site: "saalbach.com" },
  { id: "zell-kaprun", name: "Zell am See-Kaprun", place: "Zell am See, Austria", region: "europe", lat: 47.27, lon: 12.73, elev: 2000, airport: "SZG", drive: null, access: "5 days, with Saalbach", site: "zellamsee-kaprun.com" },
  { id: "dolomiti", name: "Skirama Dolomiti", place: "Madonna di Campiglio, Italy", region: "europe", lat: 46.23, lon: 10.826, elev: 2000, airport: "VRN", drive: null, access: "5 days", site: "skirama.it" },

  // Japan
  { id: "hakuba", name: "Hakuba Valley", place: "Hakuba, Nagano", region: "japan", lat: 36.699, lon: 137.832, elev: 1400, airport: "HND", drive: null, access: "5 consecutive days", site: "hakubavalley.com" },
  { id: "rusutsu", name: "Rusutsu", place: "Rusutsu, Hokkaido", region: "japan", lat: 42.74, lon: 140.55, elev: 700, airport: "CTS", drive: null, access: "5 consecutive days", site: "rusutsu.com" },

  // Australia (their season is June to September)
  { id: "perisher", name: "Perisher", place: "Perisher Valley, NSW", region: "australia", lat: -36.406, lon: 148.411, elev: 1900, airport: "SYD", drive: null, access: UNLIMITED, site: "perisher.com.au" },
  { id: "falls-creek", name: "Falls Creek", place: "Falls Creek, VIC", region: "australia", lat: -36.865, lon: 147.281, elev: 1700, airport: "MEL", drive: null, access: UNLIMITED, site: "skifallscreek.com.au" },
  { id: "hotham", name: "Hotham", place: "Mount Hotham, VIC", region: "australia", lat: -36.977, lon: 147.134, elev: 1800, airport: "MEL", drive: null, access: UNLIMITED, site: "mthotham.com.au" },
];
