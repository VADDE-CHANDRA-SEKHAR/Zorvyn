# Zorvyn Finance Dashboard

> A clean, interactive personal finance dashboard for tracking income, expenses, and spending patterns — built with React 18 and Vite.

**Live Demo →** [https://zorvyn.vercel.app](https://zorvyn.vercel.app)

---

## Table of Contents

1. Setup Instructions
2. Overview of Approach
3. Feature Explanation
4. Project Structure
5. Role-Based Access
6. Dataset

---

## 1. Setup Instructions

### Prerequisites

This project is built with **JavaScript and React** and runs entirely in the browser — no server-side code is involved.

However, the development toolchain (Vite for the dev server and build, and npm for package management) requires **Node.js** to be installed on your machine. Node.js is only used during development and build time — it is not part of the application itself.

```
Node.js  v18 or higher  →  https://nodejs.org
npm      v9  or higher  →  comes bundled with Node.js
```

Verify your versions:
```bash
node --version
npm --version
```

### Run the Development Server

```bash
npm run dev
```

Open your browser and go to **http://localhost:5173**

The app will load with a simulated 1.6-second API fetch (skeleton loading screen), then display the full dashboard with 89 pre-loaded mock transactions.

### Build for Production

```bash
# Create an optimised production build
npm run build

# Preview the production build locally
npm run preview
```

The production build is output to the `/dist` folder and is fully self-contained — ready to deploy on any static hosting platform.

### Deploy to Vercel (Free)

```bash
# Install Vercel CLI
npm install -g vercel

# Build and deploy
npm run build
vercel --prod
```

Alternatively, connect your GitHub repository at [vercel.com](https://vercel.com) → New Project → Import → Deploy. Framework preset: **Vite**.

### Available Scripts

| Command | What it does |
|---------|-------------|
| `npm run dev` | Starts local dev server with hot module replacement at port 5173 |
| `npm run build` | Builds optimised production bundle to `/dist` |
| `npm run preview` | Serves the production build locally for final verification |

---

## 2. Overview of Approach

### Goal

The goal was to build a finance dashboard that feels like a real product — not just a working prototype. Every decision, from component architecture to animation timing, was made with the end user and the reviewer in mind.

### Approach Philosophy

**Start with data, then design around it.**
Before writing a single component, the full 12-month mock dataset was defined. This grounded every design decision — chart type selection, card values, filter options, and insight copy all emerged from the shape of the data.

**Derive, don't store.**
All chart data, category totals, filtered lists, and financial summaries are computed with `useMemo` from a single `txs` source of truth. Nothing derived is stored in state. This means the entire UI stays in sync automatically — editing one transaction updates every card, chart, and insight without any manual coordination.

**Simulate real-world behaviour.**
The app mimics a real frontend by including a mock API fetch with skeleton loading, a live status indicator, localStorage persistence with safe guards, toast notifications for every user action, and a role system that conditionally renders — not just hides — UI elements.

**Modularity without over-engineering.**
The codebase is split into components, hooks, constants, theme tokens, and utilities. But there is no Redux, no Context, no router, and no component library. Every abstraction exists because it earns its place — not for the sake of architecture.

### Technical Decisions

| Decision | Reasoning |
|----------|-----------|
| **React 18 + Vite** | Vite provides near-instant HMR and fast cold starts. CRA is deprecated. React 18 hooks cover all state needs at this scale |
| **No Redux / Zustand** | State is shallow and co-located. `useState` + `useMemo` is sufficient and far more readable at this project size |
| **No Tailwind or MUI** | Inline styles via a central theme token object give complete design control with zero build plugins and zero class-name conflicts |
| **Recharts over Chart.js** | Recharts is fully declarative and React-native. Chart.js requires imperative canvas manipulation that works against React's rendering model |
| **localStorage for persistence** | Simple, synchronous, and dependency-free. Appropriate for a client-side demo with non-sensitive mock data |
| **Dark mode as default** | Finance dashboards are used across varied environments. Dark-first is the modern standard for data-heavy UIs and is easier on the eyes during extended use |
| **INR with en-IN locale** | The dataset is India-contextual. Indian number formatting (lakh notation — ₹4,20,000) is the correct convention for the audience |

### State Management Architecture

```
Single source of truth: txs (transaction array)
        │
        ├── useMemo → income         (sum of income records)
        ├── useMemo → expense        (sum of expense records)
        ├── useMemo → balance        (income − expense)
        ├── useMemo → monthlyData    (chart aggregation per month)
        ├── useMemo → catData        (category totals + percentages)
        ├── useMemo → filtered       (search + filter + sort applied)
        └── useMemo → groupedTxs     (filtered grouped by month)
```

Every UI element reads from derived state. Updating any transaction — adding, editing, or deleting — propagates through every chart, card, insight, and table automatically.

---

## 3. Feature Explanation

### Dashboard Tab

The dashboard is the first thing a user sees and is designed to answer three questions instantly: *How much do I have? How much have I earned? How much have I spent?*

**Summary Cards**
Three gradient cards display Net Balance, Total Income, and Total Expenses. Numbers animate from zero to their final value using a custom `useCountUp` hook powered by `requestAnimationFrame`. Each card shows a secondary label (transaction count or positive/negative badge) and lifts 3px on hover.

**Income vs Expenses Chart**
A 12-month area chart built with Recharts shows Income (green), Expenses (red), and Net (indigo dashed) as separate series with gradient fills. The chart uses a custom tooltip that matches the active theme and formats values in INR. The y-axis is shortened to `₹450k` format for readability.

**Spending Breakdown**
A donut chart sits above a list of all expense categories. Each category row shows its icon, name, a proportional progress bar, and its percentage share of total spending. All 6 expense categories are shown — including Entertainment — with no truncation.

**Monthly Net Savings**
A bar chart displays per-month net savings (income minus expenses). Bars are automatically coloured green for surplus months and red for deficit months. The average monthly net savings is shown as a label above the chart.

---

### Transactions Tab

The transactions tab is the core data layer of the application. It is built for users who want to investigate specific spending periods or categories in detail.

**Search**
Typing in the search box filters transactions in real time across both the description and category fields. No button press is needed.

**Filters**
Three filters can be combined simultaneously:
- Category — any of the 8 available categories or All
- Type — Income, Expense, or All
- Date range — a From date and a To date picker for isolating a specific period

**Sort**
Transactions can be sorted by date (newest or oldest first) or by amount (highest or lowest first). The sort applies after all filters.

**Group by Month**
Toggling Group by Month reorganises the flat list into sections divided by month. Each section header displays the month name alongside that month's total income, total expenses, and net figure. This makes it easy to compare spending across periods at a glance.

**Clear Filters**
A contextual "Clear Filters" button appears in the toolbar only when at least one filter is active. Clicking it resets all six filter states simultaneously.

**Admin Actions**
When the role is set to Admin, a row of action controls appears. The Add button opens a modal form with fields for description, amount, date, type, and category. Edit and Delete buttons appear on each table row. All changes persist immediately to `localStorage`.

**Export**
The Export CSV and Export JSON buttons download the current filtered view — not the full dataset — so users can export exactly what they are looking at. A toast notification confirms the download with the count of exported records.

**Empty State**
When no transactions match the active filters, a clear empty state is shown with a message and a button to reset all filters, preventing user confusion.

---

### Insights Tab

The insights tab surfaces patterns that would require manual calculation to discover from the raw transaction list.

**Savings Rate**
Calculated as `(balance / income) × 100`. Displayed as a percentage with a progress bar and a plain-language assessment — green if the rate exceeds the recommended 20% savings target, red if it falls below.

**Top Expense Category**
Identifies the single highest-spending category and displays its name and total amount. Updates immediately when transactions are added or removed.

**Average Monthly Spend**
Total expenses divided by the number of months in the dataset. Gives users a baseline for what a typical month costs.

**Month-on-Month Change**
Compares the expense total of the last two months in the dataset. Shows the absolute difference with a directional arrow — green for decreased spending, red for increased.

**Category Spend Comparison**
A horizontal bar chart ranks all expense categories by total spend. Each bar uses the category's assigned colour for instant visual association with the donut chart on the dashboard.

**Key Observations**
Five auto-generated plain-language sentences derived from live data: savings health, top category summary, month-on-month trend, average net savings, and total record count. These update dynamically as transactions change.

---

### UX Features

**Dark / Light Mode**
A toggle in the header switches between dark and light themes. The entire colour system is driven by a central theme token object — switching mode changes every background, border, text, and chart colour simultaneously. The preference is saved to `localStorage` and restored on the next visit.

**Skeleton Loading Screen**
On mount, the application simulates a 1.6-second API fetch. During this time, a shimmer skeleton matching the real layout is shown. This prevents layout shift and communicates that content is loading, mimicking the behaviour of a real API-connected frontend.

**API Status Indicator**
A small badge in the header shows a spinning loader labelled "CONNECTING…" during the fetch, then transitions to a glowing green dot labelled "API LIVE" on completion. This demonstrates awareness of loading state design in real applications.

**Toast Notifications**
Every user action that modifies or exports data produces a slide-in toast notification. Green for success (add, edit, export). Red for destructive actions (delete). The toast auto-dismisses after 3 seconds.

**Animations**
Cards and list items fade upward into position with staggered delays on every tab load. Numbers count up on entry. Cards lift on hover. The modal slides up into position. These transitions make the interface feel alive and responsive without being distracting.

---

## 4. Project Structure

```
zorvyn/
├── public/
├── src/
│   ├── components/
│   │   ├── AnimatedCard.jsx      # Summary card with count-up + hover lift
│   │   ├── CustomTooltip.jsx     # Theme-aware chart tooltip
│   │   ├── LoadingScreen.jsx     # Shimmer skeleton during API simulation
│   │   ├── Modal.jsx             # Add / Edit transaction form
│   │   ├── Skeleton.jsx          # Reusable shimmer block primitive
│   │   ├── Toast.jsx             # Slide-in notification banner
│   │   └── TxTable.jsx           # Transaction table, reused in flat and grouped views
│   ├── constants/
│   │   └── categories.js         # Category names, hex colours, and emoji icons
│   ├── data/
│   │   └── transactions.js       # 89 mock INR transactions, Apr 2025 – Mar 2026
│   ├── hooks/
│   │   └── useCountUp.js         # requestAnimationFrame count-up hook
│   ├── theme/
│   │   └── colors.js             # getDarkTheme() and getLightTheme() token sets
│   ├── utils/
│   │   └── helpers.js            # fmt(), fmtDate(), monthLabel()
│   ├── App.jsx                   # Root — all state, tabs, layout, chart data
│   ├── main.jsx                  # React DOM entry point
│   └── index.css                 # Global resets and keyframe animations
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 5. Role-Based Access

The application simulates two roles switchable via the header dropdown.

| Action | Viewer | Admin |
|--------|:------:|:-----:|
| View all tabs and charts | ✅ | ✅ |
| Search, filter, and sort transactions | ✅ | ✅ |
| Export CSV and JSON | ✅ | ✅ |
| Add new transaction | ❌ | ✅ |
| Edit existing transaction | ❌ | ✅ |
| Delete transaction | ❌ | ✅ |

Admin-only elements are **conditionally rendered** — they are absent from the DOM entirely when the role is Viewer, not merely visually hidden. The role badge in the header always shows the current access level. The role resets to Viewer on every page refresh as a safe default.

---

## 6. Dataset

The application includes **89 mock transactions** spanning the Indian financial year **April 2025 to March 2026**, formatted in Indian Rupees (₹) with `en-IN` locale.

| Category | Type | Amount Range |
|----------|------|-------------|
| Salary | Income | ₹4,20,000 – ₹4,50,000 / month |
| Freelance | Income | ₹33,600 – ₹84,000 / project |
| Shopping | Expense | ₹7,560 – ₹29,400 |
| Food | Expense | ₹1,512 – ₹11,000 |
| Utilities | Expense | ₹3,360 – ₹8,200 |
| Health | Expense | ₹2,940 – ₹6,700 |
| Transport | Expense | ₹2,100 – ₹3,800 |
| Entertainment | Expense | ₹840 – ₹6,720 |

All data is stored in `src/data/transactions.js` and can be replaced with a live API response by swapping the `localStorage` read in the `useEffect` on mount with a `fetch()` call.

---
