# Money Ledger

**Live demo:** [Money Ledger](https://money-ledger-v1.netlify.app/)

A frontend-only app to track member-wise money transactions. Each row applies its own operation (`+`, `−`, `×`, `÷`) to the running balance from the row above. Everything runs in the browser and is saved in `localStorage`. There is no backend, login, or database.

## Features

- **Per-row operation:** The operation dropdown sits inside the Amount field. New rows default to `+`.
- **Running balance:** Shown under every row. The first row starts from 0, and empty amounts count as 0.
- **Safe division:** Dividing by zero never crashes the app. The row is skipped and a warning is shown.
- **Summary:** Total members, total added, total deducted, and a large Current Balance card.
- **Total row:** Pinned to the bottom of the table and always calculated from the current rows.
- **Search:** Filter by member name. Totals still include every row.
- **Add Member:** Available in the header and at the bottom of the last row.
- **Title and description:** Optional, saved locally, and printed in the PDF and Excel file only when filled in.
- **Export PDF:** Displays the operation symbol before each amount (for example, `+ ₹23,750.00`), with a TOTAL row. Uses A4 pages without splitting rows across pages.
- **Export Excel:** Includes S.No, Member, Operation, Amount, and Running Balance columns, plus a TOTAL row.
- **Import:** Load a PDF exported from this app or its Excel file to continue where you stopped. Importing replaces current entries after confirmation.
- **Clear All:** Includes a confirmation dialog.
- **Indian rupee formatting:** For example, `₹2,06,375.00`.
- **Responsive and accessible:** Mobile card layout, labels, keyboard support, and dark mode that follows your system.

## Tech Stack

| Library | Purpose |
|---|---|
| `react`, `react-dom` | UI |
| `vite`, `@vitejs/plugin-react` | Development server and build |
| `tailwindcss` (v3), `postcss`, `autoprefixer` | Styling |
| `lucide-react` | Icons |
| `xlsx` | Excel export and import |
| `jspdf`, `html2canvas` | PDF export |

## Getting Started

Requires Node.js 18 or newer.

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the address shown in the terminal, usually [http://localhost:5173](http://localhost:5173).

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

The production build is generated in the `dist/` directory.

## Project Structure

```text
money-ledger/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx     # Entry point
    ├── App.jsx      # UI: header, summary, rows, search, import/export
    ├── utils.js     # Calculations, currency, storage, Excel/PDF export and import
    └── index.css    # Tailwind setup, colours, animations
```

## How It Works

### Calculation

Rows are processed from top to bottom, starting from 0:

```text
Rahul   + 5000   →  5000
Arun    × 2      → 10000
Vijay   − 1000   →  9000
Kumar   ÷ 2      →  4500 (final balance)
```

### Saved Data

Two `localStorage` keys are used:

- `money-ledger:rows:v1`: Stores the rows, each as `{ id, member, operation, amount }`.
- `money-ledger:meta:v1`: Stores the title and description.

Running balances are never stored. They are calculated from the rows each time.

### Import

- **PDF:** Each exported PDF carries a hidden copy of the ledger in its document properties, and Import reads that copy. PDFs exported before the Import feature was added do not contain this copy, so import the Excel file for those instead.
- **Excel:** The export layout is read back. Optional title and description rows above the table are restored too.

## Keyboard Shortcuts

- **Enter** in the Member field moves to the Amount field.
- **Enter** in the Amount field moves to the next row's Member field, or adds a new row on the last row.
- **Esc** closes dialogs.

## Developer

**Pokesh Kumar V** — Full Stack Developer

- **Email:** [pokesh65@gmail.com](mailto:pokesh65@gmail.com)
- **GitHub:** [Pokesh65](https://github.com/Pokesh65)
- **LinkedIn:** [Pokesh Kumar V](https://www.linkedin.com/in/pokesh-kumar-v)
- **Portfolio:** [Full Stack Developer Portfolio](https://pokesh-kumar-full-stack-developer.netlify.app/)

## Notes

- The PDF is rendered as an image so the ₹ symbol displays correctly. As a result, text in the PDF cannot be selected or copied.
- Data is stored in the browser where it was entered. Clearing site data removes it, so export a PDF or Excel file as a backup.
- This is a frontend-only application with no backend, login, or remote database.
