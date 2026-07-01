# Updating the machine stock (for the Unique Press team)

The **"Machines available now"** section of the website is filled from a
Google Sheet. Edit the sheet, and the website shows the change on its own —
no developer, no website upload. Changes appear within about **5 minutes**.

---

## The sheet columns

The live sheet uses these column headings in **row 1** (any order):

| Machine Type | Machine | Count | Colours | Clamp | Image Link |
|--------------|---------|-------|---------|-------|------------|
| Binding | HORIZON BQ 440 | 3 | | 4 clamp | |
| Offset | FUJI 58 | 3 | 1 colour | | https://…/fuji58.jpg |
| Cutting | NAGAI 72 Program Cutting | SOLD OUT | | | |
| Label | SHIKI SL-220 | 1 | 4 colour | | |

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

### Getting an Image Link that works

Easiest options:
- **A direct image address** ending in `.jpg`/`.png` (e.g. from your website
  or any image host) — paste it as-is.
- **Google Drive**: upload the photo to Drive → right-click → **Share** →
  set **"Anyone with the link"** → **Copy link** → paste it. The site
  converts Drive share links automatically. *(The "Anyone with the link"
  step is essential, or the photo won't show.)*
- **Dropbox** share links also work.

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
