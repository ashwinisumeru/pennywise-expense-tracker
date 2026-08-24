const STORAGE_KEY = 'pennywise-expenses-v1';
const BUDGET_KEY = 'pennywise-budget-v1';
const categories = {
  Food: { color: '#3c9b70', icon: '✦' },
  Transport: { color: '#6086aa', icon: '↗' },
  Shopping: { color: '#d78a54', icon: '◇' },
  Bills: { color: '#e6b75b', icon: '▤' },
  Health: { color: '#ca6f68', icon: '+' },
  Other: { color: '#9a8ab2', icon: '•' }
};
const seedExpenses = [
  { id: '1', amount: 420, category: 'Food', method: 'UPI', date: '2026-08-24', merchant: 'Third Wave Coffee', note: 'Morning coffee and breakfast' },
  { id: '2', amount: 1280, category: 'Shopping', method: 'Card', date: '2026-08-23', merchant: 'Myntra', note: 'Summer essentials' },
  { id: '3', amount: 240, category: 'Transport', method: 'UPI', date: '2026-08-22', merchant: 'Uber', note: 'Office commute' },
  { id: '4', amount: 850, category: 'Bills', method: 'UPI', date: '2026-08-20', merchant: 'Jio', note: 'Mobile recharge' },
  { id: '5', amount: 640, category: 'Food', method: 'Cash', date: '2026-08-19', merchant: 'Fresh Basket', note: 'Weekly groceries' },
  { id: '6', amount: 310, category: 'Health', method: 'Card', date: '2026-08-16', merchant: 'Apollo Pharmacy', note: 'Vitamins' },
  { id: '7', amount: 1100, category: 'Food', method: 'UPI', date: '2026-08-12', merchant: 'Swiggy', note: 'Dinner with friends' },
  { id: '8', amount: 560, category: 'Transport', method: 'Cash', date: '2026-08-08', merchant: 'Metro Card', note: 'Travel top-up' }
];
let expenses = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || seedExpenses;
let monthlyBudget = Number(localStorage.getItem(BUDGET_KEY)) || 12000;
let currentRoute = 'dashboard';

const inr = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
const shortDate = date => new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(new Date(`${date}T00:00:00`));
const initials = name => (name || 'Expense').split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase();
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
const monthExpenses = () => expenses.filter(item => item.date.startsWith('2026-08'));
const monthTotal = () => monthExpenses().reduce((sum, item) => sum + Number(item.amount), 0);

function navigate(route) {
  currentRoute = route;
  document.querySelectorAll('.page').forEach(page => page.classList.toggle('active-page', page.dataset.page === route));
  document.querySelectorAll('[data-route]').forEach(link => link.classList.toggle('active', link.dataset.route === route));
  const titles = { dashboard: 'Overview', transactions: 'Transactions', budgets: 'Budgets' };
  document.getElementById('pageTitle').textContent = titles[route];
  document.querySelector('.sidebar').classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (route === 'transactions') renderTransactions();
  if (route === 'budgets') renderBudgets();
}

function renderStats() {
  const total = monthTotal();
  const today = expenses.filter(item => item.date === '2026-08-24').reduce((sum, item) => sum + Number(item.amount), 0);
  const average = total ? Math.round(total / 24) : 0;
  const remaining = monthlyBudget - total;
  const usedPercent = monthlyBudget ? Math.min(100, Math.round(total / monthlyBudget * 100)) : 0;
  document.getElementById('monthTotal').textContent = inr(total);
  document.getElementById('monthCount').textContent = monthExpenses().length;
  document.getElementById('todayTotal').textContent = inr(today);
  document.getElementById('todayCount').textContent = expenses.filter(item => item.date === '2026-08-24').length;
  document.getElementById('dailyAverage').textContent = inr(average);
  document.getElementById('budgetRemaining').textContent = inr(Math.max(0, remaining));
  document.getElementById('budgetBar').style.width = `${usedPercent}%`;
  document.getElementById('budgetBar').style.background = remaining < 0 ? 'var(--red)' : 'var(--orange)';
  document.getElementById('budgetStatus').textContent = remaining < 0 ? `${inr(Math.abs(remaining))} over budget` : `${inr(total)} of ${inr(monthlyBudget)} used`;
  document.getElementById('budgetPercent').textContent = `${usedPercent}%`;
}

function renderChart() {
  const groups = [
    { label: '01', total: 1600 }, { label: '04', total: 850 }, { label: '07', total: 1100 }, { label: '10', total: 0 },
    { label: '13', total: 310 }, { label: '16', total: 310 }, { label: '19', total: 640 }, { label: '22', total: 1520 }, { label: '24', total: 1700 }
  ];
  const max = 5000;
  document.getElementById('spendingBars').innerHTML = groups.map(group => `<div class="bar-group"><i class="bar" style="height:${Math.max(5, group.total / max * 100)}%"></i><i class="bar highlight" style="height:${Math.max(4, group.total / max * 60)}%"></i></div>`).join('');
  document.getElementById('chartLabels').innerHTML = groups.map(group => `<span>${group.label}</span>`).join('');
}

function renderCategories() {
  const totals = {};
  monthExpenses().forEach(item => { totals[item.category] = (totals[item.category] || 0) + Number(item.amount); });
  const ordered = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  const total = monthTotal();
  let cursor = 0;
  const segments = ordered.map(([category, value]) => { const start = cursor; cursor += value / (total || 1) * 100; return `${categories[category].color} ${start}% ${cursor}%`; });
  document.getElementById('categoryDonut').style.background = total ? `conic-gradient(${segments.join(',')})` : '#e9eeea';
  document.getElementById('donutTotal').textContent = inr(total);
  document.getElementById('categoryLegend').innerHTML = ordered.length ? ordered.slice(0, 4).map(([category, value]) => `<div class="legend-row"><span class="legend-dot" style="background:${categories[category].color}"></span><span>${category}<small>${Math.round(value / total * 100)}%</small></span><strong>${inr(value)}</strong></div>`).join('') : '<span class="muted">No entries yet</span>';
}

function transactionMarkup(item, compact = false) {
  const category = categories[item.category] || categories.Other;
  return `<div class="transaction-row"><span class="transaction-avatar" style="background:${category.color}18;color:${category.color}">${category.icon}</span><div><div class="transaction-name">${escapeHtml(item.merchant || item.category)}</div><div class="transaction-note">${escapeHtml(item.note || 'Everyday expense')}</div></div><div class="category-label">${item.category}</div><div class="transaction-meta">${shortDate(item.date)} · ${item.method}</div><div class="amount">${inr(item.amount)}</div>${compact ? '' : `<button class="table-action" type="button" data-delete="${item.id}" aria-label="Delete ${escapeHtml(item.merchant || 'expense')}">×</button>`}</div>`;
}

function renderRecent() {
  const recent = [...expenses].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  document.getElementById('recentTransactions').innerHTML = recent.length ? recent.map(item => transactionMarkup(item, true)).join('') : '<div class="empty-state">No expenses yet. Add your first one above.</div>';
}

function renderTransactions() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const category = document.getElementById('categoryFilter').value;
  const method = document.getElementById('methodFilter').value;
  const filtered = [...expenses].filter(item => (category === 'all' || item.category === category) && (method === 'all' || item.method === method) && `${item.merchant} ${item.note}`.toLowerCase().includes(search)).sort((a, b) => b.date.localeCompare(a.date));
  document.getElementById('transactionTable').innerHTML = filtered.length ? filtered.map(item => `<tr><td><strong>${escapeHtml(item.merchant || item.category)}</strong><br><small class="muted">${escapeHtml(item.note || 'Everyday expense')}</small></td><td><span class="category-label">${item.category}</span></td><td>${item.method}</td><td>${shortDate(item.date)}</td><td class="amount-cell"><strong>${inr(item.amount)}</strong></td><td><button class="table-action" type="button" data-delete="${item.id}" aria-label="Delete expense">×</button></td></tr>`).join('') : '<tr><td colspan="6" class="empty-state">No transactions match these filters.</td></tr>';
  document.getElementById('resultCount').textContent = `${filtered.length} transaction${filtered.length === 1 ? '' : 's'}`;
}

function renderBudgets() {
  const total = monthTotal();
  const used = monthlyBudget ? Math.min(100, Math.round(total / monthlyBudget * 100)) : 0;
  document.getElementById('budgetOverviewTitle').textContent = `${inr(monthlyBudget)} planned`;
  document.getElementById('budgetOverviewCopy').textContent = `${inr(total)} spent so far this month across ${monthExpenses().length} entries.`;
  document.getElementById('budgetRing').style.background = `conic-gradient(var(--green) 0 ${used}%, #d8e9dc ${used}% 100%)`;
  document.getElementById('budgetRingPercent').textContent = `${used}%`;
  const totals = Object.entries(monthExpenses().reduce((all, item) => { all[item.category] = (all[item.category] || 0) + Number(item.amount); return all; }, {}));
  const cardData = (totals.length ? totals : [['Food', 0], ['Transport', 0], ['Shopping', 0]]).slice(0, 6);
  document.getElementById('budgetCards').innerHTML = cardData.map(([category, spent]) => { const limit = Math.round(monthlyBudget / 3); const percent = Math.min(100, Math.round(spent / limit * 100)); const info = categories[category]; return `<article class="budget-card"><div class="budget-card-head"><span class="budget-card-title">${category}</span><span class="budget-card-icon" style="color:${info.color};background:${info.color}18">${info.icon}</span></div><div class="budget-card-amount">${inr(spent)} <small>of ${inr(limit)}</small></div><div class="mini-progress"><span style="width:${percent}%;background:${percent > 100 ? 'var(--red)' : info.color}"></span></div><div class="budget-card-foot"><span>${percent}% used</span><span>${inr(Math.max(0, limit - spent))} left</span></div></article>`; }).join('');
}

function populateCategories() {
  const options = Object.keys(categories).map(category => `<option value="${category}">${category}</option>`).join('');
  document.getElementById('category').innerHTML = options;
  document.getElementById('categoryFilter').innerHTML += Object.keys(categories).map(category => `<option value="${category}">${category}</option>`).join('');
}

function openExpenseModal() {
  document.getElementById('expenseModal').hidden = false;
  document.getElementById('date').value = '2026-08-24';
  document.getElementById('amount').focus();
}
function closeExpenseModal() { document.getElementById('expenseModal').hidden = true; document.getElementById('expenseForm').reset(); document.getElementById('formError').textContent = ''; document.getElementById('amountError').textContent = ''; }
function showToast(message) { const toast = document.getElementById('toast'); document.getElementById('toastMessage').textContent = message; toast.classList.add('show'); window.clearTimeout(showToast.timeout); showToast.timeout = window.setTimeout(() => toast.classList.remove('show'), 2800); }
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[character])); }

function submitExpense(event) {
  event.preventDefault();
  const form = new FormData(event.target);
  const amount = Number(form.get('amount'));
  const amountError = document.getElementById('amountError');
  const formError = document.getElementById('formError');
  amountError.textContent = '';
  formError.textContent = '';
  if (!Number.isFinite(amount) || amount <= 0) { amountError.textContent = 'Enter an amount greater than ₹0.'; return; }
  if (amount > 10000000) { amountError.textContent = 'Amount must be below ₹1,00,00,000.'; return; }
  if (!form.get('date') || !form.get('category') || !form.get('method')) { formError.textContent = 'Please complete the required fields.'; return; }
  expenses.unshift({ id: crypto.randomUUID(), amount: Math.round(amount * 100) / 100, category: form.get('category'), method: form.get('method'), date: form.get('date'), merchant: form.get('merchant').trim() || form.get('category'), note: form.get('note').trim() });
  save(); closeExpenseModal(); renderAll(); showToast('Expense saved successfully');
}

function deleteExpense(id) { const item = expenses.find(expense => expense.id === id); if (!item || !window.confirm(`Delete ${item.merchant || 'this expense'}?`)) return; expenses = expenses.filter(expense => expense.id !== id); save(); renderAll(); if (currentRoute === 'transactions') renderTransactions(); showToast('Expense deleted'); }
function renderAll() { renderStats(); renderChart(); renderCategories(); renderRecent(); renderTransactions(); renderBudgets(); }

document.addEventListener('click', event => {
  const routeLink = event.target.closest('[data-route]');
  if (routeLink) { event.preventDefault(); navigate(routeLink.dataset.route); }
  if (event.target.closest('[data-open-expense]')) openExpenseModal();
  if (event.target.closest('[data-close-modal]') || event.target.id === 'expenseModal') closeExpenseModal();
  const deleteButton = event.target.closest('[data-delete]');
  if (deleteButton) deleteExpense(deleteButton.dataset.delete);
  if (event.target.closest('#mobileMenu')) document.querySelector('.sidebar').classList.toggle('open');
  if (event.target.closest('#editBudgetButton')) { const next = window.prompt('Set your monthly budget in INR', monthlyBudget); if (next !== null && Number(next) > 0) { monthlyBudget = Math.round(Number(next)); localStorage.setItem(BUDGET_KEY, monthlyBudget); renderAll(); showToast('Monthly budget updated'); } }
});
document.getElementById('expenseForm').addEventListener('submit', submitExpense);
document.getElementById('searchInput').addEventListener('input', renderTransactions);
document.getElementById('categoryFilter').addEventListener('change', renderTransactions);
document.getElementById('methodFilter').addEventListener('change', renderTransactions);
window.addEventListener('hashchange', () => navigate(location.hash.slice(1) || 'dashboard'));
populateCategories();
renderAll();
navigate(location.hash.slice(1) || 'dashboard');
