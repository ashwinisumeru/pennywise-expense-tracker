const STORAGE_KEY = 'pennywise-expenses-v1';
const BUDGET_KEY = 'pennywise-budget-v1';
const PROFILE_KEY = 'pennywise-profile-name-v1';
const CURRENCY_KEY = 'pennywise-currency-v1';
const palette = ['#3c9b70', '#6086aa', '#d78a54', '#e6b75b', '#ca6f68', '#9a8ab2'];
const storedExpenses = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
const legacyDemoIds = new Set(['1', '2', '3', '4', '5', '6', '7', '8']);
let expenses = Array.isArray(storedExpenses) ? storedExpenses.filter(item => !legacyDemoIds.has(String(item.id))) : [];
let monthlyBudget = Number(localStorage.getItem(BUDGET_KEY)) || 0;
let profileName = localStorage.getItem(PROFILE_KEY) || '';
const localeCurrency = { IN: 'INR', US: 'USD', GB: 'GBP', DE: 'EUR', FR: 'EUR', AE: 'AED', AU: 'AUD', CA: 'CAD', SG: 'SGD' };
const detectedCurrency = localeCurrency[(navigator.language.split('-')[1] || '').toUpperCase()] || 'INR';
let currency = localStorage.getItem(CURRENCY_KEY) || detectedCurrency;
let currentRoute = 'dashboard';

const inr = value => new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 2 }).format(value);
const currencySymbol = () => new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 2 }).formatToParts(0).find(part => part.type === 'currency')?.value || currency;
const shortDate = date => new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(new Date(`${date}T00:00:00`));
const today = new Date();
const todayString = today.toISOString().slice(0, 10);
const monthKey = todayString.slice(0, 7);
const monthName = new Intl.DateTimeFormat('en-IN', { month: 'short', year: 'numeric' }).format(today);
const colorFor = value => palette[[...String(value)].reduce((sum, character) => sum + character.charCodeAt(0), 0) % palette.length];
const categoryInfo = category => ({ color: colorFor(category), icon: String(category || '?').trim().charAt(0).toUpperCase() || '?' });
const greetingForHour = hour => hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
if (expenses.length !== storedExpenses.length) save();
const monthExpenses = () => expenses.filter(item => item.date.startsWith(monthKey));
const monthTotal = () => monthExpenses().reduce((sum, item) => sum + Number(item.amount), 0);

function navigate(route) {
  currentRoute = route;
  document.querySelectorAll('.page').forEach(page => page.classList.toggle('active-page', page.dataset.page === route));
  document.querySelectorAll('[data-route]').forEach(link => link.classList.toggle('active', link.dataset.route === route));
  const titles = { dashboard: 'Overview', transactions: 'Transactions', budgets: 'Budgets', settings: 'Settings' };
  document.getElementById('pageTitle').textContent = titles[route];
  document.querySelector('.sidebar').classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (route === 'transactions') renderTransactions();
  if (route === 'budgets') renderBudgets();
  if (route === 'settings') document.getElementById('profileNameInput').value = profileName;
  if (route === 'settings') document.getElementById('currencyInput').value = currency;
}

function renderProfile() {
  const displayName = profileName || 'there';
  const displayInitials = profileName ? profileName.split(/\s+/).map(word => word[0]).join('').slice(0, 2).toUpperCase() : '?';
  document.getElementById('greetingName').textContent = displayName;
  document.getElementById('greetingTime').textContent = greetingForHour(new Date().getHours());
  document.getElementById('sidebarName').textContent = profileName || 'Add your name';
  document.getElementById('sidebarAvatar').textContent = displayInitials;
  document.getElementById('topProfileButton').textContent = displayInitials;
  document.getElementById('amountCurrencySymbol').textContent = currencySymbol();
}

function renderStats() {
  const total = monthTotal();
  const todayTotal = expenses.filter(item => item.date === todayString).reduce((sum, item) => sum + Number(item.amount), 0);
  const daysElapsed = today.getDate();
  const average = total ? Math.round(total / daysElapsed) : 0;
  const remaining = monthlyBudget - total;
  const usedPercent = monthlyBudget ? Math.min(100, Math.round(total / monthlyBudget * 100)) : 0;
  document.getElementById('currentDateLabel').textContent = new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(today);
  document.getElementById('monthLabel').textContent = monthName;
  document.getElementById('monthTotal').textContent = inr(total);
  document.getElementById('monthCount').textContent = monthExpenses().length;
  document.getElementById('todayTotal').textContent = inr(todayTotal);
  document.getElementById('todayCount').textContent = expenses.filter(item => item.date === todayString).length;
  document.getElementById('dailyAverage').textContent = inr(average);
  document.getElementById('budgetRemaining').textContent = inr(Math.max(0, remaining));
  document.getElementById('budgetBar').style.width = `${usedPercent}%`;
  document.getElementById('budgetBar').style.background = remaining < 0 ? 'var(--red)' : 'var(--orange)';
  document.getElementById('budgetStatus').textContent = !monthlyBudget ? 'Set a monthly budget' : remaining < 0 ? `${inr(Math.abs(remaining))} over budget` : `${inr(total)} of ${inr(monthlyBudget)} used`;
  document.getElementById('budgetPercent').textContent = `${usedPercent}%`;
}

function renderChart() {
  const groups = Array.from({ length: Math.min(today.getDate(), 9) }, (_, index) => {
    const day = Math.max(1, today.getDate() - (8 - index));
    const label = String(day).padStart(2, '0');
    const total = monthExpenses().filter(item => Number(item.date.slice(-2)) === day).reduce((sum, item) => sum + Number(item.amount), 0);
    return { label, total };
  });
  const max = 5000;
  document.getElementById('chartMaxLabel').textContent = inr(max);
  document.getElementById('chartMidLabel').textContent = inr(max * 0.7);
  document.getElementById('chartLowLabel').textContent = inr(max * 0.4);
  document.getElementById('chartZeroLabel').textContent = inr(0);
  document.getElementById('spendingBars').innerHTML = groups.map(group => `<div class="bar-group"><i class="bar" style="height:${Math.max(5, group.total / max * 100)}%"></i><i class="bar highlight" style="height:${Math.max(4, group.total / max * 60)}%"></i></div>`).join('');
  document.getElementById('chartLabels').innerHTML = groups.map(group => `<span>${group.label}</span>`).join('');
}

function renderCategories() {
  const totals = {};
  monthExpenses().forEach(item => { totals[item.category] = (totals[item.category] || 0) + Number(item.amount); });
  const ordered = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  const total = monthTotal();
  let cursor = 0;
  const segments = ordered.map(([category, value]) => { const start = cursor; cursor += value / (total || 1) * 100; return `${categoryInfo(category).color} ${start}% ${cursor}%`; });
  document.getElementById('categoryDonut').style.background = total ? `conic-gradient(${segments.join(',')})` : '#e9eeea';
  document.getElementById('donutTotal').textContent = inr(total);
  document.getElementById('categoryLegend').innerHTML = ordered.length ? ordered.slice(0, 4).map(([category, value]) => `<div class="legend-row"><span class="legend-dot" style="background:${categoryInfo(category).color}"></span><span>${escapeHtml(category)}<small>${Math.round(value / total * 100)}%</small></span><strong>${inr(value)}</strong></div>`).join('') : '<span class="muted">No entries yet</span>';
}

function transactionMarkup(item, compact = false) {
  const category = categoryInfo(item.category);
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
  document.getElementById('currencyFooter').textContent = `All amounts in ${currency}`;
}

function renderBudgets() {
  const total = monthTotal();
  const used = monthlyBudget ? Math.min(100, Math.round(total / monthlyBudget * 100)) : 0;
  document.getElementById('budgetMonthLabel').textContent = `${monthName} budget (${currency})`;
  document.getElementById('budgetOverviewTitle').textContent = monthlyBudget ? `${inr(monthlyBudget)} planned` : 'No budget set';
  document.getElementById('budgetOverviewCopy').textContent = monthlyBudget ? `${inr(total)} spent so far this month across ${monthExpenses().length} entries.` : 'Set a monthly limit to start tracking your pace.';
  document.getElementById('budgetRing').style.background = `conic-gradient(var(--green) 0 ${used}%, #d8e9dc ${used}% 100%)`;
  document.getElementById('budgetRingPercent').textContent = `${used}%`;
  const totals = Object.entries(monthExpenses().reduce((all, item) => { all[item.category] = (all[item.category] || 0) + Number(item.amount); return all; }, {}));
  document.getElementById('budgetCards').innerHTML = totals.length ? totals.slice(0, 6).map(([category, spent]) => { const limit = monthlyBudget ? Math.round(monthlyBudget / totals.length) : 0; const percent = limit ? Math.min(100, Math.round(spent / limit * 100)) : 0; const info = categoryInfo(category); return `<article class="budget-card"><div class="budget-card-head"><span class="budget-card-title">${escapeHtml(category)}</span><span class="budget-card-icon" style="color:${info.color};background:${info.color}18">${info.icon}</span></div><div class="budget-card-amount">${inr(spent)} <small>${limit ? `of ${inr(limit)}` : 'spent'}</small></div><div class="mini-progress"><span style="width:${percent}%;background:${percent > 100 ? 'var(--red)' : info.color}"></span></div><div class="budget-card-foot"><span>${limit ? `${percent}% used` : 'No category limit'}</span><span>${limit ? `${inr(Math.max(0, limit - spent))} left` : ''}</span></div></article>`; }).join('') : '<div class="empty-state">No expenses yet. Add an expense to see category budgets.</div>';
}

function populateCategories() {
  const categoryValues = [...new Set(expenses.map(item => item.category).filter(Boolean))].sort();
  const methodValues = [...new Set(expenses.map(item => item.method).filter(Boolean))].sort();
  document.getElementById('categoryFilter').innerHTML = '<option value="all">All categories</option>' + categoryValues.map(value => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join('');
  document.getElementById('methodFilter').innerHTML = '<option value="all">All methods</option>' + methodValues.map(value => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join('');
}

function openExpenseModal() {
  document.getElementById('expenseModal').hidden = false;
  document.getElementById('date').value = todayString;
  document.getElementById('amount').focus();
}
function openNameSetup() {
  if (!profileName) {
    document.getElementById('nameSetupModal').hidden = false;
    document.getElementById('nameSetupInput').focus();
  }
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
  if (!Number.isFinite(amount) || amount <= 0) { amountError.textContent = 'Enter an amount greater than 0.'; return; }
  if (amount > 10000000) { amountError.textContent = 'Amount must be below 10,000,000.'; return; }
  if (!form.get('date') || !form.get('category') || !form.get('method')) { formError.textContent = 'Please complete the required fields.'; return; }
  expenses.unshift({ id: crypto.randomUUID(), amount: Math.round(amount * 100) / 100, category: form.get('category').trim(), method: form.get('method').trim(), date: form.get('date'), merchant: form.get('merchant').trim() || form.get('category').trim(), note: form.get('note').trim() });
  save(); closeExpenseModal(); renderAll(); showToast('Expense saved successfully');
}

function deleteExpense(id) { const item = expenses.find(expense => expense.id === id); if (!item || !window.confirm(`Delete ${item.merchant || 'this expense'}?`)) return; expenses = expenses.filter(expense => expense.id !== id); save(); renderAll(); if (currentRoute === 'transactions') renderTransactions(); showToast('Expense deleted'); }
function renderAll() { populateCategories(); renderProfile(); renderStats(); renderChart(); renderCategories(); renderRecent(); renderTransactions(); renderBudgets(); }

document.addEventListener('click', event => {
  const routeLink = event.target.closest('[data-route]');
  if (routeLink) { event.preventDefault(); navigate(routeLink.dataset.route); }
  if (event.target.closest('[data-open-expense]')) openExpenseModal();
  if (event.target.closest('[data-close-modal]') || event.target.id === 'expenseModal') closeExpenseModal();
  const deleteButton = event.target.closest('[data-delete]');
  if (deleteButton) deleteExpense(deleteButton.dataset.delete);
  if (event.target.closest('#mobileMenu')) document.querySelector('.sidebar').classList.toggle('open');
  if (event.target.closest('#editBudgetButton')) { const next = window.prompt(`Set your monthly budget in ${currency}`, monthlyBudget); if (next !== null && Number(next) > 0) { monthlyBudget = Math.round(Number(next)); localStorage.setItem(BUDGET_KEY, monthlyBudget); renderAll(); showToast('Monthly budget updated'); } }
});
document.getElementById('expenseForm').addEventListener('submit', submitExpense);
document.getElementById('nameSetupForm').addEventListener('submit', event => {
  event.preventDefault();
  const input = document.getElementById('nameSetupInput');
  const nextName = input.value.trim();
  if (!nextName) { document.getElementById('nameSetupError').textContent = 'Please enter your name to continue.'; input.focus(); return; }
  profileName = nextName;
  localStorage.setItem(PROFILE_KEY, profileName);
  document.getElementById('nameSetupModal').hidden = true;
  renderProfile();
  showToast(`Welcome, ${profileName}`);
});
document.getElementById('profileForm').addEventListener('submit', event => {
  event.preventDefault();
  const nextName = document.getElementById('profileNameInput').value.trim();
  if (!nextName) { showToast('Please enter your name'); return; }
  profileName = nextName;
  localStorage.setItem(PROFILE_KEY, profileName);
  renderProfile();
  showToast('Name updated successfully');
});
document.getElementById('currencyForm').addEventListener('submit', event => {
  event.preventDefault();
  currency = document.getElementById('currencyInput').value;
  localStorage.setItem(CURRENCY_KEY, currency);
  renderAll();
  showToast('Currency updated successfully');
});
document.getElementById('profileButton').addEventListener('click', () => navigate('settings'));
document.getElementById('topProfileButton').addEventListener('click', () => navigate('settings'));
document.getElementById('searchInput').addEventListener('input', renderTransactions);
document.getElementById('categoryFilter').addEventListener('change', renderTransactions);
document.getElementById('methodFilter').addEventListener('change', renderTransactions);
window.addEventListener('hashchange', () => navigate(location.hash.slice(1) || 'dashboard'));
populateCategories();
renderAll();
navigate(location.hash.slice(1) || 'dashboard');
openNameSetup();
