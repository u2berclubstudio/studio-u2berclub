/* =====================================================================
   U2ber Club Studio — secure server
   - Serves the single-page site with server-side content + Pixel/GTM
   - Password-protected admin API (content editing + analytics)
   - First-party, cookie-free traffic + click analytics
   Config via environment variables (see DEPLOY.md):
     ADMIN_PASSWORD   (required in production)
     SESSION_SECRET   (recommended; random per boot if unset)
     PORT             (default 3000)
   ===================================================================== */

const express = require("express");
const session = require("express-session");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const cfg = require("./public/site-config.js"); // { SITE_DEFAULTS, SITE_FIELDS, ... }

const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "changeme-now";
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(24).toString("hex");
const IS_PROD = process.env.NODE_ENV === "production";

const DATA_DIR = path.join(__dirname, "data");
const CONTENT_FILE = path.join(DATA_DIR, "content.json");
const EVENTS_FILE = path.join(DATA_DIR, "events.jsonl");
const TEMPLATE = path.join(__dirname, "templates", "index.html");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (ADMIN_PASSWORD === "changeme-now") {
  console.warn("\n⚠️  ADMIN_PASSWORD is not set — using an insecure default. Set it before going live!\n");
}

/* ---------- content store ---------- */
function readContent() {
  try { return JSON.parse(fs.readFileSync(CONTENT_FILE, "utf8")); }
  catch (e) { return {}; }
}
function writeContent(obj) {
  const tmp = CONTENT_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(obj, null, 2));
  fs.renameSync(tmp, CONTENT_FILE);
}
function mergedContent() { return Object.assign({}, cfg.SITE_DEFAULTS, readContent()); }

/* Only keys we know about are accepted from the admin (prevents junk). */
const ALLOWED_KEYS = new Set(Object.keys(cfg.SITE_DEFAULTS));

/* ---------- analytics store ---------- */
const ALLOWED_EVENTS = new Set(["pageview", "ping", "click"]);
function logEvent(ev) {
  const line = JSON.stringify(ev) + "\n";
  fs.appendFile(EVENTS_FILE, line, () => {});
}
function readEvents() {
  let raw;
  try { raw = fs.readFileSync(EVENTS_FILE, "utf8"); } catch (e) { return []; }
  const out = [];
  raw.split("\n").forEach(function (l) {
    if (!l) return;
    try { out.push(JSON.parse(l)); } catch (e) {}
  });
  return out;
}

/* ---------- html escaping for safe injection ---------- */
function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/* ---------- tracking snippets ---------- */
function gtmHead(id) {
  if (!/^GTM-[A-Z0-9]+$/i.test(id)) return "";
  return "<!-- Google Tag Manager --><script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','" + id + "');</script><!-- End Google Tag Manager -->";
}
function gtmBody(id) {
  if (!/^GTM-[A-Z0-9]+$/i.test(id)) return "";
  return '<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=' + id + '" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>';
}
function pixelSnippet(id) {
  if (!/^[0-9]{6,20}$/.test(id)) return "";
  return "<!-- Meta Pixel --><script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','" + id + "');fbq('track','PageView');</script><noscript><img height=\"1\" width=\"1\" style=\"display:none\" src=\"https://www.facebook.com/tr?id=" + id + "&ev=PageView&noscript=1\"/></noscript><!-- End Meta Pixel -->";
}
function ga4Snippet(id) {
  if (!/^G-[A-Z0-9]+$/i.test(id)) return "";
  return "<!-- GA4 --><script async src=\"https://www.googletagmanager.com/gtag/js?id=" + id + "\"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','" + id + "');</script>";
}

/* ---------- app ---------- */
const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1); // behind nginx

app.use(function (req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

app.use(express.json({ limit: "256kb" }));
app.use(session({
  name: "u2sid",
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: "lax", secure: IS_PROD, maxAge: 1000 * 60 * 60 * 12 }
}));

/* ---- simple brute-force guard on login ---- */
const attempts = new Map();
function tooMany(ip) {
  const a = attempts.get(ip);
  if (!a) return false;
  if (Date.now() - a.first > 15 * 60 * 1000) { attempts.delete(ip); return false; }
  return a.count >= 8;
}
function noteFail(ip) {
  const a = attempts.get(ip) || { count: 0, first: Date.now() };
  a.count++; attempts.set(ip, a);
}

function safeEqual(a, b) {
  const ab = Buffer.from(String(a)); const bb = Buffer.from(String(b));
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}
function requireAuth(req, res, next) {
  if (req.session && req.session.admin) return next();
  return res.status(401).json({ error: "unauthorized" });
}

/* ---------- auth API ---------- */
app.post("/api/login", function (req, res) {
  const ip = req.ip || "?";
  if (tooMany(ip)) return res.status(429).json({ error: "Too many attempts. Try again in 15 minutes." });
  const pw = (req.body && req.body.password) || "";
  if (safeEqual(pw, ADMIN_PASSWORD)) {
    req.session.admin = true;
    attempts.delete(ip);
    return res.json({ ok: true });
  }
  noteFail(ip);
  return res.status(401).json({ error: "Wrong password" });
});
app.post("/api/logout", function (req, res) { req.session.destroy(() => res.json({ ok: true })); });
app.get("/api/me", function (req, res) { res.json({ authed: !!(req.session && req.session.admin) }); });

/* ---------- content API ---------- */
app.get("/api/content", function (req, res) { res.json(mergedContent()); });
app.put("/api/content", requireAuth, function (req, res) {
  const incoming = req.body || {};
  const clean = {};
  Object.keys(incoming).forEach(function (k) {
    if (ALLOWED_KEYS.has(k)) clean[k] = String(incoming[k] == null ? "" : incoming[k]).slice(0, 5000);
  });
  writeContent(clean);
  res.json({ ok: true });
});
app.post("/api/content/reset", requireAuth, function (req, res) {
  try { fs.unlinkSync(CONTENT_FILE); } catch (e) {}
  res.json({ ok: true });
});

/* ---------- analytics API ---------- */
app.post("/api/track", function (req, res) {
  let body = req.body;
  // sendBeacon may deliver as text; express.json handles application/json Blobs too
  const type = body && body.type;
  if (!ALLOWED_EVENTS.has(type)) return res.status(204).end();
  logEvent({
    t: Date.now(),
    type: type,
    label: String((body.label || "")).slice(0, 80),
    path: String((body.path || "/")).slice(0, 120),
    cid: String((body.cid || "")).slice(0, 40),
    ref: String((body.ref || "")).slice(0, 200)
  });
  res.status(204).end();
});

app.get("/api/stats", requireAuth, function (req, res) {
  const ev = readEvents();
  const now = Date.now();
  const H = 3600e3, D = 24 * H;
  const liveCids = new Set(), day = {}, clicks = {}, refs = {};
  let views = 0, views24 = 0, views7 = 0;

  // last 7 day buckets
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now - i * D);
    const key = d.toISOString().slice(0, 10);
    days.push(key); day[key] = 0;
  }
  ev.forEach(function (e) {
    if ((e.type === "ping" || e.type === "pageview") && now - e.t < 60e3 && e.cid) liveCids.add(e.cid);
    if (e.type === "pageview") {
      views++;
      if (now - e.t < D) views24++;
      if (now - e.t < 7 * D) views7++;
      const k = new Date(e.t).toISOString().slice(0, 10);
      if (k in day) day[k]++;
      if (e.ref) { try { const h = new URL(e.ref).hostname; if (h) refs[h] = (refs[h] || 0) + 1; } catch (x) {} }
    }
    if (e.type === "click" && e.label) clicks[e.label] = (clicks[e.label] || 0) + 1;
  });

  const topClicks = Object.keys(clicks).map(k => [k, clicks[k]]).sort((a, b) => b[1] - a[1]).slice(0, 20);
  const topRefs = Object.keys(refs).map(k => [k, refs[k]]).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const recent = ev.slice(-25).reverse().map(e => ({ t: e.t, type: e.type, label: e.label, path: e.path }));

  res.json({
    live: liveCids.size,
    totalViews: views,
    views24h: views24,
    views7d: views7,
    byDay: days.map(k => ({ day: k, views: day[k] })),
    topClicks: topClicks,
    topRefs: topRefs,
    recent: recent
  });
});

/* ---------- static assets ---------- */
app.use(express.static(path.join(__dirname, "public"), { index: false, maxAge: "1h" }));

/* ---------- render site with injected content + tracking ---------- */
function renderIndex(res) {
  let html;
  try { html = fs.readFileSync(TEMPLATE, "utf8"); }
  catch (e) { return res.status(500).send("Template missing"); }
  const c = mergedContent();
  const headInject = [gtmHead(c.gtmId), ga4Snippet(c.gaId), pixelSnippet(c.pixelId)].filter(Boolean).join("\n");
  const bodyInject = gtmBody(c.gtmId);
  const contentScript = '<script>window.__SERVER_CONTENT=' +
    JSON.stringify(c).replace(/</g, "\\u003c") + ';</script>';
  html = html
    .replace("<!--HEAD_INJECT-->", headInject)
    .replace("<!--BODY_INJECT-->", bodyInject)
    .replace("<!--SERVER_CONTENT-->", contentScript);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
}
app.get("/", (req, res) => renderIndex(res));
app.get("/index.html", (req, res) => renderIndex(res));

/* dashboard (admin) page — served at /dashboard */
app.get("/dashboard", (req, res) => res.sendFile(path.join(__dirname, "public", "dashboard.html")));

app.listen(PORT, () => console.log("U2ber Club Studio running on http://localhost:" + PORT));
