# Pennywise: Everyday Expense Tracker

## Application Name

**Pennywise**

A calm, fast, privacy-conscious application for recording everyday spending and understanding where money goes.

## Confirmed UI Direction

- **Visual style**: minimal, spacious, and light-theme only, with restrained color used for categories and budget status.
- **Primary workflow**: quick expense entry is the first action and the most prominent control on mobile and desktop.
- **Audience**: individual users only for the MVP; no household sharing or collaboration controls.
- **Currency**: INR (Indian rupee) is the default and only supported currency for the MVP.

## Problem Statement

People often lose visibility into small, frequent purchases because recording them is tedious and reviewing them is fragmented across notes, banking apps, and spreadsheets. Pennywise should make expense capture take a few seconds, then turn the collected data into useful, understandable spending patterns without overwhelming the user.

## Target Users

- Individuals who want a simple daily spending habit.
- Students and early-career professionals managing a limited monthly budget.
- Users who prefer manual, privacy-first tracking over bank-account connections.

## Main Features

### MVP

- Add, edit, delete, and duplicate an expense.
- Required amount, date, category, and payment method fields.
- Optional merchant, note, and receipt image attachment.
- Customizable expense categories with icons and colors.
- Dashboard with today, this week, and this month totals.
- Transaction list with search, date range, category, and payment-method filters.
- Monthly budgets by category with progress and overspending states.
- Spending breakdown by category and trend over time.
- Responsive mobile-first interface with accessible keyboard and screen-reader support.
- Local account authentication and encrypted server-side data storage.
- CSV export and JSON backup/restore.

### Later Releases

- Recurring expenses and reminders.
- Shared household workspaces and permissions.
- Bank or card import through a carefully scoped provider integration.
- Multiple currencies and exchange-rate handling.
- Savings goals and budget recommendations.
- Offline-first capture with synchronization.

## Pages/Screens Required

1. **Welcome and sign-in**: create an account, sign in, and recover access.
2. **Quick add expense**: the primary screen/action, optimized for one-handed mobile use and INR amount entry.
3. **Dashboard**: current-period total, budget health, recent transactions, category breakdown, and spending trend.
4. **Edit expense**: reuse the add form with deletion and receipt management.
5. **Transactions**: searchable, filterable, sortable history with pagination or incremental loading.
6. **Budgets**: create and adjust monthly category budgets, with progress and alerts.
7. **Reports**: date-range comparison, category trends, and export actions.
8. **Categories and payment methods**: manage personal classification options.
9. **Settings**: profile, INR formatting, month start day, notifications, data export, restore, and account deletion.
10. **Empty, loading, error, and confirmation states**: designed for every data-dependent screen.

## Technology Stack

- **Frontend**: React, TypeScript, Vite, React Router, and TanStack Query.
- **Styling**: Tailwind CSS with a small component layer and accessible Headless UI primitives; light theme only with a minimal visual system.
- **Charts**: Recharts, with equivalent text summaries for accessibility.
- **Forms and validation**: React Hook Form and Zod.
- **Backend**: Node.js, TypeScript, and Fastify.
- **API contract**: REST with OpenAPI documentation and generated frontend types where practical.
- **Database**: PostgreSQL with Prisma ORM.
- **Authentication**: Secure cookie-based sessions, Argon2 password hashing, CSRF protection, and rate limiting.
- **File storage**: S3-compatible private object storage for receipt images, using signed URLs.
- **Testing**: Vitest and Testing Library for units/components, Playwright for critical end-to-end flows.
- **Quality**: ESLint, Prettier, strict TypeScript, and CI checks on every pull request.
- **Observability**: Structured server logs, health checks, and privacy-preserving error monitoring.

## Project Folder Structure

```text
pennywise/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── app/            # routing, providers, global styles
│   │   │   ├── components/     # shared UI components
│   │   │   ├── features/       # dashboard, expenses, budgets, reports
│   │   │   ├── lib/            # API client, formatters, utilities
│   │   │   └── tests/
│   │   └── public/
│   └── api/
│       └── src/
│           ├── modules/        # auth, expenses, budgets, reports
│           ├── plugins/         # database, auth, validation
│           ├── shared/          # errors, config, types
│           └── tests/
├── packages/
│   ├── config/                 # shared TypeScript, ESLint, and formatting config
│   ├── contracts/              # OpenAPI-derived request/response schemas
│   └── ui/                     # reusable design-system components
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── e2e/
├── docs/
├── .github/workflows/
├── package.json
├── pnpm-workspace.yaml
└── PLAN.md
```

## Data That Needs to Be Stored

### User and preferences

- User ID, email, password hash, display name, locale, timezone, INR currency preference, month start day, and notification preferences.
- Session ID, hashed session token, expiration, and revocation metadata.

### Expenses

- Expense ID, user ID, amount in minor currency units (paise for INR), currency, transaction date, category ID, payment method ID, merchant, note, receipt object key, and created/updated timestamps.
- Store money as integers in the smallest currency unit to avoid floating-point errors.

### Budgeting and classification

- Category ID, user ID or system ownership, name, icon, color, archived state, and sort order.
- Payment method ID, user ID, name, type, and archived state.
- Budget ID, user ID, category ID, period start/end, limit in minor currency units, and alert threshold.

### Operational and privacy data

- Audit events for security-sensitive actions, with minimal payload and retention limits.
- Export jobs, backup metadata, and receipt file metadata.
- Never store raw bank credentials or unnecessary sensitive financial data in the MVP.

## Development Steps

1. Confirm UI direction, currency assumptions, single-user versus shared use, and MVP boundaries.
2. Create the monorepo, strict TypeScript configuration, linting, formatting, CI, and environment-variable validation.
3. Define the data model and API contracts for users, expenses, categories, payment methods, and budgets.
4. Implement authentication, session security, database migrations, and authorization tests.
5. Build the design system: typography, color tokens, spacing, responsive shell, forms, tables, dialogs, toasts, and accessible chart wrappers.
6. Implement expense capture and transaction management end to end.
7. Add dashboard calculations, budget progress, reports, and export functionality.
8. Add receipt upload with file-type/size validation, private storage, signed access, and cleanup handling.
9. Add loading, empty, error, optimistic-update, and mobile states across the application.
10. Test critical workflows: sign-in, add/edit/delete expense, filtering, budget alerts, export, restore, and account deletion.
11. Run accessibility review, security review, database backup/restore drill, performance checks, and cross-browser testing.
12. Deploy a staging environment, validate migrations and observability, then promote to production with rollback instructions.

## Deployment Approach

- Use a GitHub repository with pull-request CI for type checking, linting, unit tests, and production builds.
- Deploy the web app to Vercel or Cloudflare Pages and the Fastify API to a managed container platform such as Render, Fly.io, or Railway.
- Use managed PostgreSQL with automated backups, point-in-time recovery where available, and separate staging/production databases.
- Store receipts in a private S3-compatible bucket with server-side encryption, lifecycle policies, and signed URLs.
- Keep secrets in the hosting provider's secret manager; commit only a documented `.env.example`.
- Run database migrations as an explicit release step, monitor health checks and error rates, and document rollback procedures.
- Start with a single region and scale the API horizontally only after measuring actual usage.

## Initial Success Criteria

- A new user can record an expense in under 15 seconds on a phone.
- A user can answer "How much have I spent this month and on what?" from the dashboard.
- Core expense and budget workflows work with keyboard navigation and screen readers.
- Money calculations are deterministic, currency-aware, and covered by tests.
- A user can export or delete their data without support intervention.
