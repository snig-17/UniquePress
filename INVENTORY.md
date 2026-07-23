# Updating the machine stock (for the Unique Press team)

The **"Machines available now"** section of the website is filled from a
Google Sheet. Edit the sheet, and the website shows the change on its own —
no developer, no website upload. Changes appear within about **5 minutes**.

---

## The sheet columns

The live sheet uses these column headings in **row 1** (any order):

| Machine Type | Machine | Count | Colours | Clamp | Image Link | Specs |
|--------------|---------|-------|---------|-------|------------|-------|
| Binding | HORIZON BQ 440 | 3 | | 4 clamp | | Year: 2015⏎Max speed: 1,350 books/hr |
| Offset | FUJI 58 | 3 | 1 colour | | https://…/fuji58.jpg | Sheet size: 58 cm⏎Condition: excellent |
| Cutting | NAGAI 72 Program Cutting | SOLD OUT | | | | |
| Label | SHIKI SL-220 | 1 | 4 colour | | | |

- **Machine** — the machine name (required). A row with no Machine is ignored.
- **Machine Type** — used by the filter buttons (Binding, Offset, Cutting,
  Folding, Label, Counting Machine…). The filter buttons on the site are
  **built automatically** from whatever types you use here — type a new one
  and a new filter button appears.
- **Count** — how many you have. A number (`1`, `3`) shows an **"In stock"**
  badge; typing **`SOLD OUT`** (or `0`) shows a grey **"Sold out"** badge.
- **Colours** and **Clamp** — optional specs; both show on the small grey
  line of the card (e.g. `4 colour`, `4 clamp`). If both are blank, the card
  shows the machine type instead.
- **Image Link** — optional photo of the machine. Paste a link to an image
  and it fills the top of the card. **If blank, the card keeps the default
  grey pattern** — so you can add photos gradually. See below for links that
  work.
- **Specs** — optional full specifications/details. Write whatever you like,
  one detail per line (press **Alt+Enter** inside a cell for a new line),
  e.g. `Year: 2015`, `Sheet size: 58 cm`, `Condition: excellent`. When a
  machine has Specs, its card shows a **"View specs ▾"** link and the visitor
  can **click the card to expand** and read them. **If blank, the card has no
  expand link** — so, like photos, you can fill specs in gradually. The
  column can also be named `Specifications`, `Full specs`, `Spec sheet`, or
  `More info` — all work.

### Getting an Image Link that works

**Recommended — Google Drive:** upload the photo to Drive → right-click →
**Share** → set **"Anyone with the link"** → **Copy link** → paste it. The
site converts Drive share links automatically. *(The "Anyone with the link"
step is essential, or the photo won't show.)*

Also fine:
- **A direct image address** ending in `.jpg`/`.png` (e.g. from your website
  or any image host) — paste it as-is.
- **Dropbox** share links.

> ⚠️ **Google Photos links do NOT work.** A link that looks like
> `https://photos.app.goo.gl/…` or `photos.google.com/share/…` points to a
> photo *viewer page*, not an image file, so it can't be shown on the site.
> Put the photo in **Google Drive** instead (steps above). Cards with an
> unusable link just fall back to the plain grey pattern — nothing breaks.

Landscape photos look best (they're shown in a wide 16:10 frame, cropped to
fit).

## Common tasks

- **Add a machine** → add a new row (Machine + Machine Type at minimum).
- **Remove a machine** → delete its row (or leave the Machine cell blank).
- **Mark as sold** → set Count to `SOLD OUT` (grey badge). Delete the row if
  you'd rather it disappear from the site entirely.
- **New category** → just type it in the Machine Type column; a filter button
  appears automatically.

> Sold-out machines stay visible with a grey badge so buyers can see your full
> range. Delete the row if you want them gone.

---

## Setup status

✅ **Already connected.** The site is wired to the published sheet, so the
team only ever touches the Google Sheet — no code, no website upload.

If the sheet link ever needs to change, it lives on one line near the top of
`public/assets/js/inventory.js`:

```js
var SHEET_CSV_URL = "https://docs.google.com/.../pub?output=csv";
```

To re-publish from scratch: **File → Share → Publish to web** → pick the
sheet tab → **Comma-separated values (.csv)** → **Publish**, then paste the
new link there and push.

> If the sheet is ever unreachable, the site falls back to a built-in list
> (`STARTER_MACHINES` in `inventory.js`) so it's never empty.
