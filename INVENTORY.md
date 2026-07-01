# Updating the machine stock (for the Unique Press team)

The **"Machines available now"** section of the website is filled from a
Google Sheet. Edit the sheet, and the website shows the change on its own —
no developer, no website upload. Changes appear within about **5 minutes**.

---

## The sheet columns

Use a sheet with these column headings in **row 1** (exact spelling, any order):

| Name | Details | Category | Status |
|------|---------|----------|--------|
| Komori Lithrone L432 | 4-colour offset · 2006 | Offset printing | In stock |
| Hamada RS 34 | Baby offset · 2-colour · 2001 | Baby offset | In stock |
| Itotec SA-72 | Programmable cutter · 72cm | Cutting, Post-press | In stock |
| Horizon BQ-470 | Perfect binder · 4-clamp | Binding, Post-press | In stock |

- **Name** — the machine name (required). A row with no name is ignored.
- **Details** — the small grey line under the name (colours, year, size…).
- **Category** — used by the filter buttons. Put **one or more**, separated
  by commas, e.g. `Binding, Post-press`. The filter buttons on the site are
  built automatically from whatever categories you use here.
- **Status** — the little badge on the card, e.g. `In stock`, `Serviced`,
  `Tested`. If you write `Sold` or `Out of stock`, the badge turns grey.

## Common tasks

- **Add a machine** → add a new row.
- **Remove a machine** → delete its row (or leave the Name blank).
- **Mark as sold** → set Status to `Sold` (grey badge), or delete the row.
- **Add a new category** → just type it in the Category column; a new filter
  button appears on the site automatically.

---

## One-time setup (done once by whoever sets up the site)

1. Create the Google Sheet with the columns above and fill in the machines.
2. In Google Sheets: **File → Share → Publish to web**.
3. Choose the **specific sheet tab** (not "Entire document") and the
   **Comma-separated values (.csv)** format, then click **Publish**.
4. Copy the link it gives you.
5. Open `public/assets/js/inventory.js` and paste that link between the
   quotes on this line near the top:

   ```js
   var SHEET_CSV_URL = "";   // <-- paste the published CSV link here
   ```

6. Save, commit, and push. From then on the team only touches the sheet.

> Until a link is added, the site shows a built-in starter list of machines
> (the same ones in `STARTER_MACHINES` inside `inventory.js`), so it's never
> empty. If the sheet is ever unreachable, it falls back to that list too.
