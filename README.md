# Pennywise Expense Tracker

## Project Name

Pennywise

## Project Description

Pennywise is a simple, privacy-conscious everyday expense tracker for recording and reviewing personal spending in Indian rupees (INR). It provides quick expense entry, spending summaries, transaction search, and monthly budget tracking through a responsive light-theme interface.

Expense data is stored locally in the browser using `localStorage`.

## Features

- Quick expense entry with amount, category, date, payment method, merchant, and notes.
- INR currency formatting.
- Form validation with success and error messages.
- Dashboard with monthly total, today's spend, daily average, and remaining budget.
- Spending activity chart and category breakdown.
- Transaction history with search and category/payment-method filters.
- Delete transactions with confirmation.
- Monthly budget tracking and progress indicators.
- Responsive layout for desktop and mobile screens.
- Local browser persistence using `localStorage`.
- No backend or database setup required.

## Technology Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Browser `localStorage`
- Google Fonts: DM Sans and Space Grotesk

## How to Install

### Prerequisites

- A modern web browser such as Chrome, Edge, Firefox, or Safari.
- Optional: Node.js if you want to use a local development server.

### Installation Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/ashwinisumeru/pennywise-expense-tracker.git
   ```

2. Open the project folder:

   ```bash
   cd pennywise-expense-tracker
   ```

No packages or dependency installation are required.

## How to Run Locally

### Option 1: Open the HTML file directly

From the project folder, open `index.html` in your browser.

On Windows PowerShell:

```powershell
Start-Process .\index.html
```

### Option 2: Use a local web server

If Node.js is installed, run:

```powershell
npx serve .
```

Then open the local URL shown in the terminal, usually:

```text
http://localhost:3000
```

## GitHub Repository

[https://github.com/ashwinisumeru/pennywise-expense-tracker](https://github.com/ashwinisumeru/pennywise-expense-tracker)

## Live Application URL

https://ghdemo-chi.vercel.app

The application is deployed on Vercel and connected to the GitHub repository for future deployments.

## Project Files

- `index.html` - application structure and screens.
- `styles.css` - responsive visual styling.
- `app.js` - expense logic, navigation, validation, filtering, budgets, and local persistence.
- `PLAN.md` - product and development plan.
