# Money Ledger

A frontend-only application to track member-wise money transactions. Each row applies its own operation (`+`, `−`, `×`, `÷`) to the running balance from the previous row. All data runs in the browser and is saved in `localStorage`. No backend, login, or database is required.

## Features

- **Per-row operation:** Choose addition, subtraction, multiplication, or division. New rows default to `+`.
- **Running balance:** Displayed below every row. The first row starts at 0, and empty amounts count as 0.
- **Safe division:** Division by zero is handled safely. The affected row is skipped, and a warning is displayed.
- **Summary dashboard:** Shows total members, total added, total deducted, and current balance.
- **Total row:** Always reflects the calculations from the current rows.
- **Search:** Filter entries by member name without changing overall totals.
- **Add Member:** Add members from the header or below the last row.
- **Title and description:** Optional fields saved locally and included in exports when provided.
- **PDF export:** Includes operation symbols, a TOTAL row, and A4 page formatting. Rows are not split across pages.
- **Excel export:** Includes S.No, Member, Operation, Amount, and Running Balance columns, plus a TOTAL row.
- **Import:** Restore previously exported PDF or Excel data. Existing entries are replaced after confirmation.
- **Clear All:** Clear all entries after confirmation.
- **Indian currency formatting:** Displays amounts in Indian rupees, such as `₹2,06,375.00`.
- **Responsive design:** Mobile-friendly layouts, accessible labels, keyboard shortcuts, and system-based dark mode.

## Tech Stack

| Technology | Purpose |
|---|---|
| React | User interface |
| Vite | Development server and build tool |
| JavaScript | Application logic |
| Tailwind CSS v3 | Styling |
| Lucide React | Icons |
| xlsx | Excel import and export |
| jsPDF | PDF generation |
| html2canvas | PDF page rendering |
| localStorage | Browser-based data persistence |

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm

### Installation

Clone the repository and navigate to the project folder:

```bash
git clone YOUR_REPOSITORY_URL
cd money-ledger
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in your terminal, usually http://localhost:5173.

### Production Build

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

The production files are generated in the `dist/` directory.

## Project Structure

```text
money-ledger/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── utils.js
    └── index.css
```

- `main.jsx` — Application entry point.
- `App.jsx` — Main interface, summary, transaction rows, search, and import/export controls.
- `utils.js` — Calculations, currency formatting, storage, import, and export functionality.
- `index.css` — Tailwind CSS setup, colors, and animations.

## How It Works

### Running Balance Calculation

Transactions are processed from top to bottom, starting at zero. Each row applies its operation to the previous running balance.

Example:

```text
Rahul   + 5000  →  5000
Arun    × 2     →  10000
Vijay   − 1000  →  9000
Kumar   ÷ 2     →  4500
```

The final running balance in this example is ₹4,500.00.

### Data Storage

The application uses two `localStorage` keys:

- `money-ledger:rows:v1` — Stores transaction rows as `{ id, member, operation, amount }`.
- `money-ledger:meta:v1` — Stores the optional title and description.

Running balances are calculated dynamically and are not stored.

### Import and Export

- **PDF:** Exported PDFs contain a hidden copy of the ledger in their document properties for restoration during import.
- **Excel:** Exported spreadsheets can be imported to restore the ledger, including optional title and description fields.
- **Backup:** Export your data regularly because browser storage can be lost when site data is cleared.

### Keyboard Shortcuts

- **Enter** in the Member field moves focus to the Amount field.
- **Enter** in the Amount field moves to the next row's Member field or adds a new row when used in the last row.
- **Esc** closes dialogs.

## Developer

**Pokesh Kumar V**

Full Stack Developer passionate about building responsive, user-friendly applications with clean architecture and maintainable code.

- **Email:** [pokesh65@gmail.com](mailto:pokesh65@gmail.com)
- **GitHub:** [Pokesh65](https://github.com/Pokesh65)
- **LinkedIn:** [Pokesh Kumar V](https://www.linkedin.com/in/pokesh-kumar-v)
- **Portfolio:** [Full Stack Developer Portfolio](https://pokesh-kumar-full-stack-developer.netlify.app/)

## Notes

- The PDF is rendered as an image to preserve the Indian rupee symbol, so its text cannot be selected or copied.
- Data is stored locally in the browser. It is not synchronized across browsers or devices.
- Clearing browser site data may permanently remove saved entries.
- This is a frontend-only application without a backend, authentication, or remote database.

## License

No license has been specified. Add a `LICENSE` file if you intend to distribute the project as open source.
