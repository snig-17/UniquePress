/* ==================================================================
   Unique Press — inventory (machine cards from a Google Sheet)

   HOW IT WORKS
   The "Machines available now" cards and the category filter chips are
   built from a Google Sheet the client maintains. On every page load the
   site fetches the latest sheet, so updating stock = editing the sheet
   (no code, no redeploy). If the sheet is ever unreachable, the section
   simply shows a short "tell us what you need" message rather than any
   placeholder stock.

   >>> TO CONNECT THE SHEET (one-time):
   In Google Sheets: File → Share → Publish to web → choose the sheet tab
   → "Comma-separated values (.csv)" → Publish. Copy that link and paste
   it between the quotes below.
   ================================================================== */

var SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT1IwtUcges20SBQOIWfnxqUbNEKrw8OhTuqmgYEByKpqAmdYDmOzpilFsaPvSpnEMiduUbenH5bO9w/pub?output=csv";

/* Column headers the sheet may use (case-insensitive, exact match). Order
   in the sheet doesn't matter; these names do. The client's live sheet uses
   "Machine Type / Machine / Count / Colours", all covered below. */
var COLUMNS = {
  name:     ["name", "machine", "model"],
  details:  ["details", "spec", "description", "specification", "colours", "colors"],
  clamp:    ["clamp", "clamps"],
  image:    ["image link", "image", "image url", "photo", "picture", "img"],
  category: ["category", "categories", "type", "machine type"],
  status:   ["status", "tag", "availability", "count"]
};

/* ---------------- helpers ---------------- */

function escapeHtml(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/* Turn a raw Status/Count cell into a badge label.
   "SOLD OUT" (or 0) -> "Sold out"; a positive number -> "In stock";
   a word like "Serviced" is kept as-is; blank -> "In stock". */
function normalizeStatus(raw) {
  var s = String(raw == null ? "" : raw).trim();
  if (/sold\s*out|out of stock|^out$/i.test(s)) return "Sold out";
  if (/^\d+(\.\d+)?$/.test(s)) return Number(s) > 0 ? "In stock" : "Sold out";
  return s || "In stock";
}

/* Turn whatever image link the client pastes into something an <img> can
   actually load. Google Drive "share" links don't embed directly, so we
   rewrite them to Drive's thumbnail endpoint; Dropbox share links become
   raw; everything else (a direct image URL) passes through unchanged. */
function normalizeImageUrl(url) {
  var u = String(url == null ? "" : url).trim();
  if (!u) return "";
  // Google Photos share links point to a viewer PAGE, not an image file, so
  // they can never render. Ignore them outright -> card keeps the grey pattern.
  if (/photos\.app\.goo\.gl|photos\.google\.com/.test(u)) return "";
  if (/drive\.google\.com/.test(u)) {
    var m = u.match(/\/file\/d\/([-\w]{20,})/) || u.match(/[?&]id=([-\w]{20,})/);
    if (m) return "https://drive.google.com/thumbnail?id=" + m[1] + "&sz=w1000";
  }
  if (/dropbox\.com/.test(u)) return u.replace(/([?&])dl=0/, "$1raw=1");
  return u;
}

function splitCategories(value) {
  return String(value || "")
    .split(/[,;/|]+/)
    .map(function (s) { return s.trim(); })
    .filter(Boolean);
}

/* Minimal CSV parser: handles quoted fields, commas and newlines inside
   quotes, and escaped "" quotes. Returns array of arrays. */
function parseCSV(text) {
  var rows = [], row = [], field = "", inQuotes = false, i = 0, c;
  text = String(text).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  for (; i < text.length; i++) {
    c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else { inQuotes = false; }
      } else { field += c; }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field); field = "";
    } else if (c === "\n") {
      row.push(field); rows.push(row); row = []; field = "";
    } else {
      field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

/* Map parsed CSV rows to machine objects using the COLUMNS aliases. */
function rowsToMachines(rows) {
  if (!rows || !rows.length) return [];
  var header = rows[0].map(function (h) { return String(h).trim().toLowerCase(); });
  function idxFor(aliases) {
    for (var a = 0; a < aliases.length; a++) {
      var j = header.indexOf(aliases[a]);
      if (j !== -1) return j;
    }
    return -1;
  }
  var idx = {
    name: idxFor(COLUMNS.name),
    details: idxFor(COLUMNS.details),
    clamp: idxFor(COLUMNS.clamp),
    image: idxFor(COLUMNS.image),
    category: idxFor(COLUMNS.category),
    status: idxFor(COLUMNS.status)
  };
  var out = [];
  for (var r = 1; r < rows.length; r++) {
    var cells = rows[r];
    var name = idx.name !== -1 ? (cells[idx.name] || "").trim() : "";
    if (!name) continue; // skip blank rows
    var category = idx.category !== -1 ? (cells[idx.category] || "").trim() : "";
    var colours = idx.details !== -1 ? (cells[idx.details] || "").trim() : "";
    var clamp = idx.clamp !== -1 ? (cells[idx.clamp] || "").trim() : "";
    // Build the grey detail line from whatever spec columns are filled.
    var details = [colours, clamp].filter(Boolean).join(" · ");
    if (!details) details = category; // fall back so the card isn't sparse
    out.push({
      name: name,
      details: details,
      category: category,
      image: normalizeImageUrl(idx.image !== -1 ? cells[idx.image] : ""),
      status: normalizeStatus(idx.status !== -1 ? cells[idx.status] : "")
    });
  }
  return out;
}

/* ---------------- rendering ---------------- */

var state = { cat: "All", machines: [] };

function categoriesFrom(machines) {
  var seen = {}, list = ["All"];
  machines.forEach(function (m) {
    splitCategories(m.category).forEach(function (cat) {
      var key = cat.toLowerCase();
      if (!seen[key]) { seen[key] = true; list.push(cat); }
    });
  });
  return list;
}

function machineMatches(m, cat) {
  if (cat === "All") return true;
  return splitCategories(m.category).some(function (c) {
    return c.toLowerCase() === cat.toLowerCase();
  });
}

function badgeStyle(status) {
  var out = /out|sold/i.test(status);
  return "font-size:11px; font-weight:600; padding:3px 9px; border-radius:4px; color:#fff; background:" +
    (out ? "#9a9a92" : "var(--accent,#1f3a5f)") + ";";
}

function chipStyle(active) {
  var base = "padding:9px 18px; border-radius:100px; font-size:13.5px; cursor:pointer; transition:all .15s ease; white-space:nowrap;";
  return active
    ? "background:var(--accent,#1f3a5f); color:#fff; border:1px solid var(--accent,#1f3a5f); font-weight:600; " + base
    : "background:#fff; border:1px solid #e4e4e0; color:#55554f; font-weight:500; " + base;
}

function renderChips() {
  var host = document.getElementById("up-chips");
  if (!host) return;
  var cats = categoriesFrom(state.machines);
  host.innerHTML = cats.map(function (cat) {
    return '<span class="up-chip" data-cat="' + escapeHtml(cat) + '" style="' +
      chipStyle(cat === state.cat) + '">' + escapeHtml(cat) + "</span>";
  }).join("");
  host.querySelectorAll(".up-chip").forEach(function (el) {
    el.addEventListener("click", function () {
      state.cat = el.getAttribute("data-cat");
      renderChips();
      renderCards();
    });
  });
}

function renderCards() {
  var host = document.getElementById("up-machines");
  var empty = document.getElementById("up-empty");
  if (!host) return;
  var list = state.machines.filter(function (m) { return machineMatches(m, state.cat); });

  host.innerHTML = list.map(function (m) {
    var img = m.image
      ? '<img src="' + escapeHtml(m.image) + '" alt="' + escapeHtml(m.name) +
        '" loading="lazy" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover;" ' +
        'onerror="this.style.display=\'none\'">'
      : "";
    return '' +
      '<div style="border:1px solid #e8e8e4; border-radius:12px; overflow:hidden; background:#fff;" style-hover="box-shadow:0 20px 44px -28px rgba(20,20,15,.4);">' +
        '<div style="position:relative; aspect-ratio:16/10; overflow:hidden; background:repeating-linear-gradient(135deg,#ededea,#ededea 9px,#f6f6f3 9px,#f6f6f3 18px);">' +
          img +
          '<span style="position:absolute; top:12px; left:12px; ' + badgeStyle(m.status) + '">' + escapeHtml(m.status || "In stock") + "</span>" +
        "</div>" +
        '<div style="padding:18px 20px;">' +
          '<div style="font-family:\'Space Grotesk\',sans-serif; font-weight:600; font-size:17px; color:#1a1a18; margin-bottom:3px;">' + escapeHtml(m.name) + "</div>" +
          '<div style="font-size:13px; color:#7a7a74; margin-bottom:14px;">' + escapeHtml(m.details) + "</div>" +
          '<div style="display:flex; align-items:center; justify-content:space-between; border-top:1px solid #f0f0ec; padding-top:12px;">' +
            '<span style="font-size:13px; color:#6a6a64;">Price on request</span>' +
            '<a href="#contact" style="font-size:13px; color:var(--accent,#1f3a5f); font-weight:600;">Enquire →</a>' +
          "</div>" +
        "</div>" +
      "</div>";
  }).join("");

  if (empty) empty.style.display = list.length ? "none" : "block";

  // Re-apply hover states to the freshly rendered cards.
  if (window.UP && window.UP.wireStates) window.UP.wireStates(host);
}

function render() {
  renderChips();
  renderCards();
}

function loadInventory() {
  if (!SHEET_CSV_URL) {
    state.machines = [];
    render();
    return;
  }
  // Cache-bust so refreshes pick up recent edits promptly.
  var url = SHEET_CSV_URL + (SHEET_CSV_URL.indexOf("?") === -1 ? "?" : "&") + "_cb=" + Date.now();
  fetch(url, { cache: "no-store" })
    .then(function (res) { if (!res.ok) throw new Error("HTTP " + res.status); return res.text(); })
    .then(function (text) {
      state.machines = rowsToMachines(parseCSV(text));
      render();
    })
    .catch(function () {
      // Network/permission problem — show the empty-state message, not stale stock.
      state.machines = [];
      render();
    });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadInventory);
} else {
  loadInventory();
}
