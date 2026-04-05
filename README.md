# Zorvyn Finance Dashboard

A clean, interactive, and fully responsive personal finance dashboard built with **React 18** and **Vite**. Zorvyn allows users to track income and expenses, explore transactions, and understand their spending patterns through rich data visualizations — all with role-based access control, dark/light mode, and persistent data storage.


## Overview

Zorvyn is built as a frontend engineering assignment with the objective of creating a simple, intuitive finance dashboard. The application covers three core areas:

- **Dashboard** — A high-level summary of financial health with charts and KPI cards
- **Transactions** — A fully filterable and sortable ledger of all financial activity
- **Insights** — Auto-generated observations and visual comparisons derived from live transaction data

The project is entirely client-side — no backend, no authentication server, no external API calls. All data is mocked locally and persisted to the browser's `localStorage`.

---

## Features

### Dashboard Overview

- Three animated summary cards — **Net Balance**, **Total Income**, and **Total Expenses** — each with an animated number count-up on load and a hover lift effect
- **Income vs Expenses area chart** — 12-month monthly trend with gradient fills for Income, Expenses, and Net lines. Built with Recharts AreaChart and a custom tooltip
- **Spending Breakdown panel** — A donut chart paired with a category list showing the icon, name, percentage bar, and share for every expense category including Entertainment
- **Monthly Net Savings bar chart** — Per-month surplus/deficit bars that turn green for positive months and red for negative months, with an average savings label

### Transactions

- **Real-time search** across description and category name
- **Category filter** — All 8 categories available (Food, Transport, Entertainment, Shopping, Utilities, Health, Salary, Freelance)
- **Type filter** — Income, Expense, or All
- **Date range filter** — From date and To date pickers for precise period isolation
- **Sort** — By date (newest/oldest) or amount (highest/lowest)
- **Group by Month toggle** — Groups rows under collapsible month headers with per-month income, expense, and net totals displayed inline
- **Clear Filters button** — Appears contextually only when at least one filter is active, resetting all filters in a single click
- **Empty state** — Friendly message with a CTA to clear filters when no transactions match
- **Admin CRUD** — Add, Edit, and Delete transactions via an animated modal (Admin role only)
- **Export CSV** — Downloads the currently filtered transaction list as a `.csv` file
- **Export JSON** — Downloads the currently filtered transaction list as a `.json` file

### Insights

- **Savings Rate** — Percentage of income retained with a progress bar and health assessment (below/above 20% target)
- **Top Expense Category** — Highest-spending category with its total amount
- **Average Monthly Spend** — Mean expense per month across the full dataset
- **Month-on-Month Change** — Absolute delta between the last two months with a directional arrow
- **Category Spend Comparison** — Horizontal ranked bar chart across all expense categories
- **Key Observations** — Five plain-language insights that auto-update as transaction data changes

### UX Enhancements

- **Dark / Light mode toggle** — Solid opaque color system for full readability in both modes. Preference saved to `localStorage`
- **Skeleton loading screen** — Shimmer placeholder rendered during simulated API fetch to prevent layout shift
- **API status indicator** — Header badge transitions from a spinning "CONNECTING…" state to a glowing green "API LIVE" dot after the mock fetch resolves
- **Toast notifications** — Slide-in banners confirm every action: add, edit, delete, CSV export, JSON export
- **Staggered entry animations** — Cards animate in with sequential delays using CSS `animation-delay`
- **Hover lift effect** — Summary and insight cards rise 3px with a deeper shadow on hover
- **Focus styles** — Modal inputs highlight with an indigo border on focus
- **Role badge** — Always visible in the header, showing the current access level

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI component framework with hooks-based state |
| Vite | 5.1.0 | Build tool — fast HMR in development, optimised production bundle |
| Recharts | 2.10.3 | Declarative, React-native charting (AreaChart, BarChart, PieChart) |
| localStorage | Browser API | Client-side transaction and preference persistence |
| CSS-in-JS (inline styles) | — | Zero external CSS dependency — full design control, full portability |

**Why no Redux or Zustand?**
The application's state is shallow and co-located in a single root component. `useState` + `useMemo` is the correct and sufficient tool at this scale. Adding an external state library would introduce unnecessary boilerplate without any architectural benefit.

**Why no Tailwind or MUI?**
Inline styles give complete control over the design system with zero build-time plugins, zero class-name conflicts, and full portability. The theme is managed through a centralized token object that updates every component simultaneously.

**Why Recharts over Chart.js?**
Recharts is React-native with a fully declarative JSX API. Chart.js requires imperative canvas manipulation that does not compose well with React's rendering model.

---

## Project Structure

```
zorvyn/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── AnimatedCard.jsx       # Gradient summary card with count-up animation
│   │   ├── CustomTooltip.jsx      # Theme-aware chart tooltip component
│   │   ├── LoadingScreen.jsx      # Full-page shimmer skeleton during API simulation
│   │   ├── Modal.jsx              # Add and edit transaction modal form
│   │   ├── Skeleton.jsx           # Reusable shimmer block primitive
│   │   ├── Toast.jsx              # Timed slide-in action notification
│   │   └── TxTable.jsx            # Transaction table — reused in flat and grouped views
│   ├── constants/
│   │   └── categories.js          # CAT_META (color + icon per category), category name arrays
│   ├── data/
│   │   └── transactions.js        # 89 mock INR transactions spanning Apr 2025 – Mar 2026
│   ├── hooks/
│   │   └── useCountUp.js          # Custom hook encapsulating requestAnimationFrame count-up logic
│   ├── theme/
│   │   └── colors.js              # getDarkTheme() and getLightTheme() — full token sets
│   ├── utils/
│   │   └── helpers.js             # fmt(), fmtDate(), monthLabel() formatting utilities
│   ├── App.jsx                    # Root component — all state, tab routing, chart data, layout
│   ├── main.jsx                   # React DOM entry point
│   └── index.css                  # Global resets, keyframe animation definitions, utility classes
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

Each file has a single, clearly defined responsibility. `App.jsx` owns state and layout orchestration. All child components are pure and receive only what they need via props. Constants, helpers, and theme tokens are extracted into their own modules so they can be changed or extended independently without touching component logic.

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start local development server with hot module replacement |
| `npm run build` | Build an optimised production bundle into `/dist` |
| `npm run preview` | Serve the production build locally for verification |

---

## Role-Based Access

Roles are simulated on the frontend using a `role` state variable. The dropdown in the header switches between Viewer and Admin for demonstration purposes.

| Permission | Viewer | Admin |
|-----------|:------:|:-----:|
| View Dashboard | ✅ | ✅ |
| View Transactions | ✅ | ✅ |
| View Insights | ✅ | ✅ |
| Export CSV / JSON | ✅ | ✅ |
| Add Transaction | ❌ | ✅ |
| Edit Transaction | ❌ | ✅ |
| Delete Transaction | ❌ | ✅ |

All mutation UI — the Add button, Edit and Delete controls in the table, and the Modal component — are **conditionally rendered** (removed from the DOM entirely) when the role is Viewer. This is not CSS visibility hiding; the elements do not exist in the rendered tree for Viewer sessions.

The role badge in the header always reflects the current access level. Role resets to Viewer on every page refresh by design as a safe default for demonstration.

---

## Data Persistence

Transaction data and the dark mode preference are saved to the browser's `localStorage` on every change and reloaded automatically on the next visit.

```
Key                  Value
zorvyn_txs     →     JSON array of all transaction objects
```

**Safe load guard:** The `localStorage` read only occurs after the simulated API fetch completes. The write is skipped during the initial loading phase to prevent overwriting persisted data with default values.

**Fallback:** If `localStorage` is unavailable or the stored value is malformed, the application silently falls back to the built-in default dataset of 89 transactions.

---

## Mock API Integration

On mount, the application simulates a real API call with a 1.6-second delay before resolving. During this period:

1. A full-page **skeleton loading screen** is displayed with shimmer animations matching the layout of the real content
2. The **API status indicator** in the header shows a spinning loader and "CONNECTING…" label
3. After resolution, the skeleton is replaced with the actual dashboard and the badge transitions to a glowing green "API LIVE" state

This demonstrates how the application would behave with a real backend while keeping the implementation self-contained.

---

## State Management

All application state is managed with React's built-in `useState` and `useMemo` hooks in `App.jsx`.

### State Atoms

| State | Type | Purpose |
|-------|------|---------|
| `txs` | Array | All transaction records — source of truth |
| `role` | String | Current access level — `viewer` or `admin` |
| `tab` | String | Active tab — `dashboard`, `transactions`, or `insights` |
| `dark` | Boolean | Theme mode |
| `search` | String | Search query string |
| `filterCat` | String | Active category filter |
| `filterType` | String | Active type filter (`income` / `expense` / `All`) |
| `sortBy` | String | Active sort key and direction |
| `fromDate` | String | Date range start |
| `toDate` | String | Date range end |
| `groupByMonth` | Boolean | Whether to group transactions by month |
| `modal` | Mixed | `null`, `'add'`, or a transaction object for edit |
| `loading` | Boolean | Controls skeleton vs content rendering |
| `apiStatus` | String | `connecting`, `live`, or `error` |
| `toast` | Object | Current notification `{ msg, type }` or `null` |

### Derived State via useMemo

| Derived Value | Depends On | Description |
|---------------|-----------|-------------|
| `income` | `txs` | Sum of all income transactions |
| `expense` | `txs` | Sum of all expense transactions |
| `balance` | `income`, `expense` | Net financial position |
| `monthlyData` | `txs` | Per-month aggregated chart data |
| `catData` | `txs`, `expense` | Category totals with percentage share |
| `filtered` | `txs`, all filter states | Filtered and sorted transaction array |
| `groupedTxs` | `filtered`, `groupByMonth` | Month-keyed groups of filtered transactions |

Derived values are never stored in state. `useMemo` ensures they only recompute when their specific dependencies change — unrelated state updates (such as opening a modal) do not trigger re-aggregation of chart data.

---

## Security

Zorvyn is a purely client-side application with zero backend communication after page load.

### Data Storage
- All transaction data is stored in the user's own browser via `localStorage` — it never leaves the device
- No data is sent to any server, analytics service, or third party
- No API keys, tokens, secrets, or credentials exist anywhere in the codebase

### Input Safety
- All user input is rendered through React's virtual DOM — no `innerHTML`, no `eval`, no `dangerouslySetInnerHTML`
- User-entered text is stored and displayed as plain text nodes, preventing XSS injection
- The modal form validates that description, date, and amount are all present before saving
- The amount field is typed as `number` and the date field uses the browser's native date picker

### Dependency Surface
- Two runtime dependencies only: `react` and `recharts`
- No authentication SDKs, analytics trackers, form libraries, or UI frameworks
- No CDN-loaded scripts — everything is bundled locally by Vite
- The production build in `/dist` is fully self-contained

### RBAC Safety
- Admin-only UI is conditionally rendered — elements are absent from the DOM entirely, not merely hidden
- The `role` value cannot be set via URL parameters, query strings, or `localStorage` injection
- Role resets to Viewer on every page refresh

> **Production Note:** This implementation is appropriate for a client-side demo. In a production environment, data should be stored in a secured backend with server-side authorization, session-based or token-based authentication, encrypted storage, and input sanitization at the API layer. `localStorage` should not be used for sensitive financial data in a real product.

---

## Design System

All visual tokens are defined in `src/theme/colors.js` as two functions — `getDarkTheme()` and `getLightTheme()` — each returning a flat object of named color values.

```js
// Example tokens
C.root          // Page background
C.card          // Card background
C.border        // Card and input border
C.text          // Primary text
C.muted         // Secondary / label text
C.inpBg         // Input field background
C.shadow        // Card box shadow
C.progressBg    // Progress bar track
C.pillActiveBg  // Active nav pill gradient
```

Every component receives the active theme as a `C` prop and reads from it. Updating a single token value in the theme file propagates the change to the entire interface without touching any component. The system supports both opaque solid backgrounds (default) and can be extended to support glassmorphism or other effects by changing only the token values.

---

## Responsive Design

The layout adapts to mobile, tablet, and desktop screen sizes.

| Element | Responsive Behaviour |
|---------|---------------------|
| Summary card grid | `repeat(3, 1fr)` collapses to single column on narrow screens |
| Chart + breakdown grid | Two-column layout stacks vertically on tablet and below |
| Insight KPI grid | `repeat(4, 1fr)` wraps to 2×2 on smaller viewports |
| Filter bar | Uses `flexWrap: wrap` — filter controls reflow to new rows |
| Transaction table | Wrapped in `overflowX: auto` container — scrolls horizontally on small screens |
| Header | `flexWrap` on the nav and controls group prevents overflow |
| Modal | Constrained to `maxWidth: 420px` with full-width padding on small screens |

---

## Export Functionality

Both export options respect the currently active filters — only the transactions visible in the current filtered view are included in the download.

**CSV Export**
- Column headers: Date, Description, Category, Type, Amount (₹)
- One row per transaction
- Downloaded as `zorvyn.csv`

**JSON Export**
- Full transaction objects in a structured array
- Downloaded as `zorvyn.json`
- Suitable for import into other tools or databases

Both exports trigger a toast notification confirming the number of records exported.

## Assumptions

1. No backend is required — all data is mocked and persisted client-side via `localStorage`
2. RBAC is a frontend-only simulation; in production it would be enforced server-side with authenticated API routes
3. The 1.6-second loading delay simulates a real API fetch; in production this would be replaced with a `fetch()` call to a real endpoint
4. Role resets to Viewer on every page refresh — intentional for demo safety
5. All amounts are in Indian Rupees (₹); multi-currency support is out of scope
6. The April–March date range follows the Indian fiscal year convention

This project is released under the [MIT License](LICENSE).