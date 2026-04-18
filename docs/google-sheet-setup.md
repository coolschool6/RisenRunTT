# Google Sheet Setup for RisenRunTT

Use one Google Sheet with two tabs:

- `Events`
- `Results`

## Events Tab Schema

Create columns in this exact order:

1. `event_id` (required, unique, text)
2. `title` (required, text)
3. `category` (required, text)
4. `date_iso` (required, `YYYY-MM-DD`)
5. `time_local` (required, `HH:MM` 24-hour)
6. `location` (required, text)
7. `price_ttd` (required, number)
8. `image_url` (required for card image)
9. `short_description` (optional, text)
10. `register_url` (required for active registration link)
11. `is_featured` (required, `TRUE` or `FALSE`)
12. `is_ad` (required, `TRUE` or `FALSE`)
13. `is_sold_out_manual` (required, `TRUE` or `FALSE`)
14. `registration_deadline_iso` (optional, `YYYY-MM-DD`)
15. `status` (required, `published`, `draft`, or `archived`)
16. `results_label` (optional)
17. `results_value` (optional)
18. `display_year` (required, number, example `2026`)
19. `created_at` (phase 2 automation)
20. `updated_at` (phase 2 automation)

## Results Tab Schema

Create columns in this exact order:

1. `result_id`
2. `event_id`
3. `position`
4. `participant_name`
5. `bib_number`
6. `category`
7. `finish_time`
8. `notes`

## Rules Used by Website

- Only rows with `status = published` are shown in event listings.
- An event is sold out when:
  - `is_sold_out_manual = TRUE`, or
  - `registration_deadline_iso` is in the past.
- Price is displayed in TTD.
- Date/time are rendered for Trinidad timezone (`America/Port_of_Spain`).

## Publish Steps

1. Open the sheet.
2. Click `File` -> `Share` -> `Publish to web`.
3. Publish the full spreadsheet.
4. Copy the sheet ID from URL:
   - `https://docs.google.com/spreadsheets/d/SHEET_ID/edit`
5. Paste `SHEET_ID` into `assets/js/config.js`.

## Data Entry Notes

- Keep `event_id` immutable once used.
- Use absolute URLs for `image_url` and `register_url`.
- Keep booleans uppercase (`TRUE`, `FALSE`) for consistency.
- Keep one row per event in the `Events` tab.
