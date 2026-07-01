/* ==================================================================
   Unique Press — inventory (machine cards from a Google Sheet)

   HOW IT WORKS
   The "Machines available now" cards and the category filter chips are
   built from a Google Sheet the client maintains. On every page load the
   site fetches the latest sheet, so updating stock = editing the sheet
   (no code, no redeploy). If the sheet URL is blank or unreachable, the
   built-in STARTER_MACHINES below are shown instead, so the site is never
   empty.

   >>> TO CONNECT THE SHEET (one-time):
   In Google Sheets: File → Share → Publish to web → choose the sheet tab
   → "Comma-separated values (.csv)" → Publish. Copy that link and paste
   it between the quotes below.
   ================================================================== */

var SHEET_CSV_URL = ""; // <-- paste the published CSV link here

/* Column headers the sheet should use (case-insensitive). Order in the
   sheet doesn't matter; these names do. See INVENTORY.md for the guide. */
var COLUMNS = {
  name:     ["name", "machine", "model"],
  details:  ["details", "spec", "description", "specification"],
  category: ["category", "categories", "type"],
  status:   ["status", "tag", "availability"]
};

/* Shown when the sheet is blank/unreachable — also the starter rows the
   client can copy into their sheet to begin. */
var STARTER_MACHINES = [
  { name: "Komori Lithrone L432",    details: "4-colour offset · 2006",       category: "Offset printing", status: "In stock" },
  { name: "Ryobi 755",               details: "5-colour offset · 2008",       category: "Offset printing", status: "In stock" },
  { name: "Mitsubishi Diamond 3000", details: "4-colour offset · 2005",       category: "Offset printing", status: "In stock" },
  { name: "Shinohara 66-IV",         details: "4-colour offset · 2003",       category: "Offset printing", status: "In stock" },
  { name: "Sakurai Oliver 466SD",    details: "4-colour offset · 2004",       category: "Offset printing", status: "In stock" },
  { name: "Heidelberg SM 74-4",      details: "4-colour offset · 2003",       category: "Offset printing", status: "In stock" },
  { name: "Fuji 52-E",               details: "2-colour offset",              category: "Offset printing", status: "In stock" },
  { name: "Hamada RS 34",            details: "Baby offset · 2-colour · 2001", category: "Baby offset",     status: "In stock" },
  { name: "Ryobi 3302",              details: "Baby offset · 2-colour",       category: "Baby offset",     status: "In stock" },
  { name: "Itotec SA-72",            details: "Programmable cutter · 72cm",    category: "Cutting, Post-press", status: "In stock" },
  { name: "Horizon BQ-470",          details: "Perfect binder · 4-clamp",     category: "Binding, Post-press", status: "In stock" },
  { name: "Shoei SB-8",              details: "Saddle stitcher · wire",       category: "Binding, Post-press", status: "In stock" },
  { name: "PBM 3000",                details: "Perfect binder",               category: "Binding, Post-press", status: "In stock" },
  { name: "Horizon AFC-544",         details: "Buckle folder · automatic",    category: "Folding, Post-press", status: "In stock" },
  { name: "Iwasaki TR-100",          details: "Rotary label press",           category: "Label",           status: "In stock" },
  { name: "Shiki LT-250",            details: "Label printing press",         category: "Label",           status: "In stock" },
  { name: "PBM Paper Counter",       details: "Sheet counting & tabbing",     category: "Counting machine, Post-press", status: "In stock" }
];

/* ---------------- helpers ---------------- */

function escapeHtml(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
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
    category: idxFor(COLUMNS.category),
    status: idxFor(COLUMNS.status)
  };
  var out = [];
  for (var r = 1; r < rows.length; r++) {
    var cells = rows[r];
    var name = idx.name !== -1 ? (cells[idx.name] || "").trim() : "";
    if (!name) continue; // skip blank rows
    out.push({
      name: name,
      details: idx.details !== -1 ? (cells[idx.details] || "").trim() : "",
      category: idx.category !== -1 ? (cells[idx.category] || "").trim() : "",
      status: idx.status !== -1 ? (cells[idx.status] || "").trim() : "In stock"
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
    return '' +
      '<div style="border:1px solid #e8e8e4; border-radius:12px; overflow:hidden; background:#fff;" style-hover="box-shadow:0 20px 44px -28px rgba(20,20,15,.4);">' +
        '<div style="aspect-ratio:16/10; background:repeating-linear-gradient(135deg,#ededea,#ededea 9px,#f6f6f3 9px,#f6f6f3 18px); display:flex; align-items:flex-start; padding:12px;">' +
          '<span style="' + badgeStyle(m.status) + '">' + escapeHtml(m.status || "In stock") + "</span>" +
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
    state.machines = STARTER_MACHINES.slice();
    render();
    return;
  }
  // Cache-bust so refreshes pick up recent edits promptly.
  var url = SHEET_CSV_URL + (SHEET_CSV_URL.indexOf("?") === -1 ? "?" : "&") + "_cb=" + Date.now();
  fetch(url, { cache: "no-store" })
    .then(function (res) { if (!res.ok) throw new Error("HTTP " + res.status); return res.text(); })
    .then(function (text) {
      var machines = rowsToMachines(parseCSV(text));
      state.machines = machines.length ? machines : STARTER_MACHINES.slice();
      render();
    })
    .catch(function () {
      // Network/permission problem — fall back so the section still shows.
      state.machines = STARTER_MACHINES.slice();
      render();
    });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadInventory);
} else {
  loadInventory();
}
