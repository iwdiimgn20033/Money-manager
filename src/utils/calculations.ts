import { BudgetPeriod, CurrencyInfo, ExpenseCategory, FinancialMetrics, IncomeItem, SUPPORTED_CURRENCIES, Transaction } from '../types';

const ROUND_WHOLE_NUMBERS_KEY = 'fg_round_whole_numbers';

// Global currency state
let currentGlobalCurrency: CurrencyInfo = SUPPORTED_CURRENCIES[0];

// Default is TRUE (cancelled decimals, rounded to nearest whole unit/Riyal forever)
let globalRoundWholeNumbers: boolean = true;

try {
  const saved = localStorage.getItem(ROUND_WHOLE_NUMBERS_KEY);
  if (saved !== null) {
    globalRoundWholeNumbers = JSON.parse(saved);
  } else {
    // Save setting permanently
    localStorage.setItem(ROUND_WHOLE_NUMBERS_KEY, JSON.stringify(true));
  }
} catch {
  globalRoundWholeNumbers = true;
}

export function setRoundWholeNumbers(round: boolean): void {
  globalRoundWholeNumbers = round;
  try {
    localStorage.setItem(ROUND_WHOLE_NUMBERS_KEY, JSON.stringify(round));
  } catch {
    // ignore
  }
}

export function getRoundWholeNumbers(): boolean {
  return globalRoundWholeNumbers;
}

export function setAppCurrency(currency: CurrencyInfo): void {
  currentGlobalCurrency = {
    ...currency,
    decimals: 0, // Enforce zero decimals permanently
  };
}

export function getAppCurrency(): CurrencyInfo {
  return currentGlobalCurrency;
}

export function calculateFinancialMetrics(
  incomeItems: IncomeItem[],
  categories: ExpenseCategory[],
  period: BudgetPeriod
): FinancialMetrics {
  const totalExpectedIncome = incomeItems.reduce((acc, item) => acc + item.expectedAmount, 0);
  const totalReceivedIncome = incomeItems.reduce((acc, item) => acc + (item.isReceived ? item.receivedAmount : 0), 0);

  let totalBudgetedExpense = 0;
  let totalActualExpense = 0;

  categories.forEach((cat) => {
    cat.items.forEach((item) => {
      totalBudgetedExpense += item.budgeted;
      totalActualExpense += item.actual;
    });
  });

  // Net variance: Budgeted - Actual
  const netExpenseVariance = totalBudgetedExpense - totalActualExpense;
  const expenseVariancePercentage = totalBudgetedExpense > 0 
    ? (netExpenseVariance / totalBudgetedExpense) * 100 
    : 0;

  const currentNetCashFlow = totalReceivedIncome - totalActualExpense;

  // Projection logic
  const currentDay = Math.min(Math.max(1, period.currentDay), period.totalDays);
  const daysRemaining = Math.max(0, period.totalDays - currentDay);
  const burnRatePerDay = currentDay > 0 ? totalActualExpense / currentDay : 0;

  let projectedRemainingExpenses = 0;
  categories.forEach((cat) => {
    cat.items.forEach((item) => {
      if (item.isFixed) {
        if (item.actual === 0) {
          projectedRemainingExpenses += item.budgeted;
        }
      } else {
        if (item.actual < item.budgeted) {
          projectedRemainingExpenses += (item.budgeted - item.actual);
        }
      }
    });
  });

  const projectedMonthEndExpense = totalActualExpense + projectedRemainingExpenses;
  const estimatedEndOfPeriodNetCashFlow = totalExpectedIncome - projectedMonthEndExpense;
  const estimatedEndOfPeriodBankBalance = period.startingBankBalance + estimatedEndOfPeriodNetCashFlow;

  const savingsRate = totalExpectedIncome > 0 
    ? Math.max(0, (estimatedEndOfPeriodNetCashFlow / totalExpectedIncome) * 100)
    : 0;

  const budgetAdherenceScore = totalBudgetedExpense > 0
    ? Math.max(0, Math.min(100, Math.round(100 - (Math.max(0, totalActualExpense - totalBudgetedExpense) / totalBudgetedExpense) * 100)))
    : 100;

  return {
    totalExpectedIncome,
    totalReceivedIncome,
    totalBudgetedExpense,
    totalActualExpense,
    netExpenseVariance,
    expenseVariancePercentage,
    currentNetCashFlow,
    projectedMonthEndExpense,
    estimatedEndOfPeriodNetCashFlow,
    estimatedEndOfPeriodBankBalance,
    savingsRate,
    burnRatePerDay,
    daysRemaining,
    budgetAdherenceScore,
  };
}

export function formatCurrency(
  amount: number,
  options: { showSign?: boolean; decimals?: number; currencySymbol?: string; currencyCode?: string } = {}
): string {
  // If whole numbers are enabled or decimals not specified, always round to nearest integer and use 0 decimals!
  const roundWhole = globalRoundWholeNumbers || options.decimals === 0;
  const targetAmount = roundWhole ? Math.round(amount || 0) : (amount || 0);
  const decimals = options.decimals !== undefined ? options.decimals : 0;
  const symbol = options.currencySymbol || currentGlobalCurrency.symbol;
  const isPostfixed = ['CHF', 'AED', 'SAR', 'QAR', 'KWD', 'BHD', 'OMR', 'JOD', 'EGP'].includes(currentGlobalCurrency.code);

  const absFormatted = Math.abs(targetAmount).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  const formatWithSymbol = (numStr: string) => {
    if (isPostfixed) {
      return `${numStr} ${symbol}`;
    }
    return `${symbol}${numStr}`;
  };

  if (options.showSign) {
    if (targetAmount > 0) return `+${formatWithSymbol(absFormatted)}`;
    if (targetAmount < 0) return `-${formatWithSymbol(absFormatted)}`;
    return formatWithSymbol(absFormatted);
  }

  if (targetAmount < 0) return `-${formatWithSymbol(absFormatted)}`;
  return formatWithSymbol(absFormatted);
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${Math.round(value)}%`;
}

export function exportBudgetToCSV(
  period: BudgetPeriod,
  metrics: FinancialMetrics,
  incomeItems: IncomeItem[],
  categories: ExpenseCategory[],
  transactions: Transaction[],
  currency: CurrencyInfo = currentGlobalCurrency
): void {
  const rows: string[] = [];

  rows.push(`FINANCE.GRID — PERSONAL BUDGET & NET CASH FLOW REPORT`);
  rows.push(`Period: ${period.label} (Day ${period.currentDay} of ${period.totalDays})`);
  rows.push(`Base Currency: ${currency.name} (${currency.code} - ${currency.symbol})`);
  rows.push(`Generated: ${new Date().toLocaleString()}`);
  rows.push(``);

  rows.push(`EXECUTIVE SUMMARY`);
  rows.push(`Total Expected Income,${Math.round(metrics.totalExpectedIncome)} ${currency.code}`);
  rows.push(`Total Received Income,${Math.round(metrics.totalReceivedIncome)} ${currency.code}`);
  rows.push(`Total Budgeted Expense,${Math.round(metrics.totalBudgetedExpense)} ${currency.code}`);
  rows.push(`Total Actual Spent,${Math.round(metrics.totalActualExpense)} ${currency.code}`);
  rows.push(`Net Variance,${Math.round(metrics.netExpenseVariance)} ${currency.code}`);
  rows.push(`Projected End-of-Month Expenses,${Math.round(metrics.projectedMonthEndExpense)} ${currency.code}`);
  rows.push(`Estimated End-of-Period Net Cash Flow,${Math.round(metrics.estimatedEndOfPeriodNetCashFlow)} ${currency.code}`);
  rows.push(`Estimated End-of-Period Bank Balance,${Math.round(metrics.estimatedEndOfPeriodBankBalance)} ${currency.code}`);
  rows.push(`Savings Rate %,${Math.round(metrics.savingsRate)}%`);
  rows.push(``);

  rows.push(`INCOME SOURCES`);
  rows.push(`Name,Source Type,Expected (${currency.symbol}),Received (${currency.symbol}),Status`);
  incomeItems.forEach((inc) => {
    rows.push(`"${inc.name}",${inc.sourceType},${Math.round(inc.expectedAmount)},${Math.round(inc.receivedAmount)},${inc.isReceived ? 'Received' : 'Pending'}`);
  });
  rows.push(``);

  rows.push(`EXPENSE BREAKDOWN`);
  rows.push(`Category,Item Name,Budgeted (${currency.symbol}),Actual Spent (${currency.symbol}),Variance (${currency.symbol}),Status`);
  categories.forEach((cat) => {
    cat.items.forEach((item) => {
      const variance = item.budgeted - item.actual;
      const status = variance >= 0 ? 'Under Budget' : 'Over Budget';
      rows.push(`"${cat.name}","${item.name}",${Math.round(item.budgeted)},${Math.round(item.actual)},${Math.round(variance)},${status}`);
    });
  });
  rows.push(``);

  rows.push(`TRANSACTION LEDGER`);
  rows.push(`Date,Description,Type,Amount (${currency.symbol}),Category`);
  transactions.forEach((tx) => {
    rows.push(`${tx.date},"${tx.description}",${tx.type},${Math.round(tx.amount)},${tx.categoryId}`);
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(rows.join('\n'));
  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  link.setAttribute('download', `Budget_Report_${currency.code}_${period.label.replace(/\s+/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
