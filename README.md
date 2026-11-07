# Placement Compass

**A personal campus-placement application tracker** — a responsive web app for organizing your own graduate-role search. It is designed as an individual product: one candidate, one private workspace, and clear next steps.

> The dashboard starts with fictional sample applications for demonstration. Replace them with your own records. Do not enter sensitive personal information.

## Features

- Add, edit, and remove applications across Saved, Applied, Assessment, Interview, Offer, and Rejected stages.
- Search and filter the application list, with live pipeline metrics and overdue follow-up count.
- Set follow-up dates, track next actions, and keep private preparation notes per application.
- See a follow-up radar and recent stage-change activity.
- Export a spreadsheet-friendly CSV or download/restore a versioned JSON backup.
- Persist data in browser `localStorage`; no account, server, or external API is required.
- Responsive layout, keyboard-friendly dialog, accessible labels, and reduced-motion support.

## Run locally

No build tools or dependencies are needed. Clone the repository and open `index.html`, or serve the project root:

```bash
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

## Project structure

```text
.
├── index.html   # Semantic dashboard, search, and application editor
├── styles.css   # Responsive visual system and components
└── app.js       # Data model, local persistence, analytics, and backups
```

## Engineering notes

- **Individual-first scope:** this is a personal tracker, not an institution-wide placement-management system. It deliberately avoids team accounts and student records.
- **Privacy by default:** application data and notes remain in the current browser profile. Clearing browser storage removes them; use JSON backup for a portable copy.
- **No dependencies:** the app uses browser APIs and plain JavaScript, making it straightforward to inspect and run.
- **Safe DOM rendering:** user-entered values are inserted as text nodes rather than interpolated into HTML.
- **Import validation:** restored JSON is shape-checked before replacing current data, and the replacement requires confirmation.
- **CSV safety:** fields are quoted and escaped; spreadsheet formula prefixes are neutralized on export.

## Portfolio ownership

If you are adapting work originally created with classmates, retain appropriate credit for their contributions and describe your own work accurately. Only claim features and design decisions you personally implemented or can explain.

## Possible next steps

- Add automated tests for filters, persistence, CSV escaping, backup validation, and stage history.
- Add due-time notifications while keeping them opt-in and local.
- Add an optional hosted sync layer only after designing authentication, authorization, and data retention.

## License

No license has been selected yet. Add one before accepting outside contributions or reusing this project beyond GitHub's default terms.
