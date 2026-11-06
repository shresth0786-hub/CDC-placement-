# Placement Compass

**A personal campus-placement application tracker** — a small, responsive web app for organizing your own graduate-role search. It turns a placement project into a focused individual product: one candidate, one private workspace, and clear next steps.

> The dashboard opens with fictional sample applications so the interface is easy to explore. Replace them with your own data. Do not enter sensitive personal information.

## Features

- Add and remove applications with company, role, stage, location, date, and next step.
- Search across companies, roles, and locations; filter by application stage.
- See a live summary, stage pipeline, and a short prioritized list of next steps.
- Export tracked applications to CSV.
- Persist data in browser `localStorage`; no account, server, or external API is required.
- Responsive layout, keyboard-friendly dialog, accessible labels, and reduced-motion support.

## Run locally

No build tools or dependencies are needed. Clone the repository and open `index.html`, or serve the project from its root:

```bash
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

## Project structure

```text
.
├── index.html   # Semantic dashboard and application form
├── styles.css   # Responsive visual system and components
└── app.js       # Local data, filtering, metrics, and CSV export
```

## Design and engineering decisions

- **Individual-first scope:** this is a personal tracker, not an institution-wide placement-management system. It deliberately avoids team accounts and student records.
- **Privacy by default:** application data remains in the current browser profile. Clearing browser storage removes it; CSV export is the user's portable backup.
- **Dependency-free:** plain HTML, CSS, and JavaScript keep the project easy to run and inspect.
- **Safe rendering:** user-entered values are inserted as text nodes rather than interpolated into HTML.
- **Progressive scope:** the interface is useful without a backend, while leaving room for a future database or authentication layer if the project needs one.

## Portfolio ownership

This repository presents Placement Compass as a standalone individual portfolio project. If you are adapting work originally created with classmates, retain appropriate credit for their contributions and describe your own work accurately. Only claim features and decisions you personally implemented or can explain.

## Ideas for a next iteration

- Edit an existing application and record a timeline of stage changes.
- Add due dates and reminders for assessments or interviews.
- Add automated tests for filters, persistence, CSV escaping, and metrics.
- Add import from CSV and a confirmation flow before clearing sample data.
- If a hosted multi-device version is needed, design authentication, authorization, and data retention before adding a backend.

## License

No license has been selected yet. Add one before accepting outside contributions or reusing this project beyond GitHub's default terms.
