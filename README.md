# RisenRunTT Website MVP

Static website for RisenRunTT built for GitHub Pages.

## Implemented

- Public pages:
  - `index.html` (browse events)
  - `event.html` (event details)
  - `results.html` (results table)
  - `contact.html` (contact channels)
- Future admin route scaffold:
  - `admin/index.html`
- Live data adapter for Google Sheets in `assets/js/sheets.js`
- Filters: search, year, category
- Sorting: upcoming first
- Event status: sold out by manual flag and deadline expiration

## Setup

1. Create one Google Sheet with tabs named exactly:
   - `Events`
   - `Results`
2. Follow the schema in `docs/google-sheet-setup.md`.
3. Publish the sheet to web:
   - File -> Share -> Publish to web
4. Copy sheet ID from URL.
5. Open `assets/js/config.js` and set `sheetId`.
6. Set contact channels in `assets/js/config.js`.

## Local Run

Use any static server. Example with VS Code Live Server or:

```powershell
cd "c:\Users\Mayr\Desktop\RisenRunTT website"
python -m http.server 5500
```

Then open `http://localhost:5500`.

## Deploy to GitHub Pages

1. Push all files to a GitHub repository.
2. In repository settings, enable GitHub Pages from `main` branch root.
3. Open the provided GitHub Pages URL.
4. Verify data loads after `sheetId` is configured.

## Phase 2 (next)

- Build admin dashboard with multi-admin auth
- Add image upload workflow in admin event form
- Write events to Google Sheets via Apps Script endpoint
