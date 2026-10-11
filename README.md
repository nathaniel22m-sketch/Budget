# BudgetFlow Pro — Smart Budget Logger & Expense Tracker

A modern, responsive, and privacy-first web-based personal finance and budget tracking application built with **React 19**, **Vite**, and **Tailwind CSS**.

---

## ✨ Features

- 📊 **Visual Financial Analytics**:
  - Income vs. Expense monthly comparison trend charts.
  - Interactive SVG Category Distribution Donut chart with percentages and amounts.
  - Net balance, savings rate indicator, and period summaries.
- 🎯 **Monthly Category Budgeting & Alerts**:
  - Customizable budget limits per expense category.
  - Progress bars showing spending status.
  - Automated **Over-budget alerts** (🔴 Exceeded, 🟡 >80% warning) with actionable recommendations.
  - Ability to create custom categories with custom icons and color schemes.
- 📗 **Microsoft Excel (.xlsx) Multi-Sheet Export**:
  - Directly exports formatted **`.xlsx`** workbooks containing:
    1. **Transactions Sheet** (Date, Type, Category, Description, Amount, Payment Method, Tags, Notes)
    2. **Category Budgets Sheet** (Limit, Actual Spent, Remaining Balance, % Used, Status)
    3. **Monthly Summary Sheet** (Monthly Total Income, Expenses, Net Savings, Savings Rate)
- 📄 **CSV Export & CSV Import**:
  - Excel-compatible CSV exports with UTF-8 BOM encoding.
  - One-click CSV transaction importer.
- 💾 **Full JSON Backup & Restore**:
  - Export all your transactions, categories, budgets, and recurring schedules to a `.json` backup file or restore anytime.
- 🔁 **Recurring Transactions & Bills**:
  - Keep track of recurring subscriptions (Netflix, Spotify, Gym, Rent, Salary).
  - Countdown indicators (Due in X days, Overdue).
  - One-click "Log to Transactions" action that automatically advances the next due date.
- 🔎 **Transaction Logger & Search**:
  - Filter by type (Expense / Income), Category, Timeframe (This Month, Last Month, All, Custom Month).
  - Search by keyword, notes, or tags (`#groceries`, `#dining`, `#bills`).
  - Sort by date, amount, or title.
  - Bulk select & bulk delete.
- 🌍 **Multi-Currency & Themes**:
  - Supports USD ($), EUR (€), GBP (£), JPY (¥), CAD (CA$), AUD (A$), PHP (₱), INR (₹), and more.
  - Full Dark and Light mode toggle.
- 🔒 **100% Private & Client-Side**:
  - Stored locally in your browser (`localStorage`). No external servers required.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)

### Development Server
To launch the app locally:

```bash
npm run dev
```

Open your browser at `http://localhost:5173/`.

### Production Build
To create an optimized production build:

```bash
npm run build
```

---

## 📱 Building the Android APK

The project is configured with **Capacitor Android** in the `android/` directory (`com.budgetflow.pro`).

### Option 1: Automated Cloud Build via GitHub Actions (Zero Local Setup)
A GitHub Actions workflow is included at `.github/workflows/build-apk.yml`:
1. Push this repository to GitHub.
2. Go to the **Actions** tab on your GitHub repository.
3. Select **"Build Android APK"** and run workflow (or push to `main`).
4. Once completed (approx. 2 minutes), download the generated **`BudgetFlow-Pro-Debug-APK`** directly from the run summary artifacts!

### Option 2: Build locally using Android Studio
1. Run `npm run cap:sync`
2. Open the `android/` directory in **Android Studio**:
   ```bash
   npm run cap:open
   ```
3. In Android Studio, click **Build** $\rightarrow$ **Build Bundle(s) / APK(s)** $\rightarrow$ **Build APK(s)**.
4. The output `.apk` will be generated in `android/app/build/outputs/apk/debug/app-debug.apk`.

### Option 3: Instant Mobile Install (PWA)
Open `http://<your-ip>:5173/` on Chrome on your Android device and tap **"Install App"** / **"Add to Home Screen"** to run it fullscreen with app icon without needing to install an APK file!


## 📁 Project Structure

```
Budget/
├── src/
│   ├── components/
│   │   ├── common/             # Modal, ConfirmDialog, CategoryIcon
│   │   ├── Dashboard/          # SummaryCards, BudgetAlertBanner, SpendingCharts
│   │   ├── Transactions/       # TransactionList, TransactionModal
│   │   ├── Budgets/            # BudgetManager
│   │   ├── Recurring/          # RecurringManager
│   │   ├── ExportImport/       # ExportImportModal (.xlsx, .csv, .json)
│   │   └── Navbar.jsx          # Top navigation, currency selector, theme toggle
│   ├── constants/              # Currencies, default categories, sample data
│   ├── utils/                  # Excel exporter, formatters, localStorage helpers
│   ├── App.jsx                 # Core application controller
│   ├── main.jsx                # React root mount
│   └── index.css               # Tailwind CSS imports
├── index.html                  # HTML entry point
├── package.json
└── vite.config.js
```
