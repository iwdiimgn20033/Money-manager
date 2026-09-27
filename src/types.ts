export type TransactionType = 'expense' | 'income';

export interface IncomeItem {
  id: string;
  name: string;
  expectedAmount: number;
  receivedAmount: number;
  sourceType: 'salary' | 'freelance' | 'investments' | 'bonus' | 'other';
  dateExpected?: string;
  isReceived: boolean;
}

export interface ExpenseItem {
  id: string;
  categoryId: string;
  name: string;
  budgeted: number;
  actual: number;
  isFixed?: boolean;
  notes?: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  color: string;
  iconName: string;
  items: ExpenseItem[];
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  expenseItemId?: string;
  incomeItemId?: string;
  tags?: string[];
}

export interface BudgetPeriod {
  id: string;
  month: number; // 1-12
  year: number;
  label: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  startingBankBalance: number;
  currentDay: number;
  totalDays: number;
}

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  flag: string;
  rateAgainstUSD: number; // 1 USD = X in this currency
  decimals?: number;
}

export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦', rateAgainstUSD: 3.75, decimals: 0 },
  { code: 'QAR', symbol: 'QAR', name: 'Qatari Riyal', flag: '🇶🇦', rateAgainstUSD: 3.64, decimals: 0 },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham', flag: '🇦🇪', rateAgainstUSD: 3.67, decimals: 0 },
  { code: 'KWD', symbol: 'KWD', name: 'Kuwaiti Dinar', flag: '🇰🇼', rateAgainstUSD: 0.31, decimals: 0 },
  { code: 'BHD', symbol: 'BHD', name: 'Bahraini Dinar', flag: '🇧🇭', rateAgainstUSD: 0.376, decimals: 0 },
  { code: 'OMR', symbol: 'OMR', name: 'Omani Rial', flag: '🇴🇲', rateAgainstUSD: 0.385, decimals: 0 },
  { code: 'JOD', symbol: 'JOD', name: 'Jordanian Dinar', flag: '🇯🇴', rateAgainstUSD: 0.71, decimals: 0 },
  { code: 'EGP', symbol: 'EGP', name: 'Egyptian Pound', flag: '🇪🇬', rateAgainstUSD: 48.5, decimals: 0 },
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸', rateAgainstUSD: 1.0, decimals: 0 },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺', rateAgainstUSD: 0.92, decimals: 0 },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧', rateAgainstUSD: 0.79, decimals: 0 },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', flag: '🇨🇦', rateAgainstUSD: 1.37, decimals: 0 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺', rateAgainstUSD: 1.53, decimals: 0 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵', rateAgainstUSD: 155.0, decimals: 0 },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', flag: '🇨🇭', rateAgainstUSD: 0.91, decimals: 0 },
  { code: 'CNY', symbol: 'CN¥', name: 'Chinese Yuan', flag: '🇨🇳', rateAgainstUSD: 7.25, decimals: 0 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳', rateAgainstUSD: 83.5, decimals: 0 },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬', rateAgainstUSD: 1.35, decimals: 0 },
];

export interface FinancialMetrics {
  totalExpectedIncome: number;
  totalReceivedIncome: number;
  totalBudgetedExpense: number;
  totalActualExpense: number;
  netExpenseVariance: number; // Budgeted - Actual
  expenseVariancePercentage: number;
  currentNetCashFlow: number;
  projectedMonthEndExpense: number;
  estimatedEndOfPeriodNetCashFlow: number;
  estimatedEndOfPeriodBankBalance: number;
  savingsRate: number;
  burnRatePerDay: number;
  daysRemaining: number;
  budgetAdherenceScore: number;
}

// APPLICATION INTERFACE MODE: INDIVIDUALS (PERSONAL) VS COMPANIES (BUSINESS)
export type AppMode = 'personal' | 'business';

export type ActiveTab = 
  | 'overview' 
  | 'wallets'
  | 'transactions' 
  | 'calendar'
  | 'breakdown' 
  | 'goals'
  | 'debts'
  | 'accounting' 
  | 'balancesheet' 
  | 'reports' 
  | 'cashflow' 
  | 'consultations' 
  | 'simulator' 
  | 'admin' 
  | 'settings';

// WALLET & ACCOUNT TYPES (Money Manager Multi-Account Hub)
export type WalletType = 'cash' | 'bank' | 'card' | 'savings' | 'ewallet' | 'investment';

export interface WalletAccount {
  id: string;
  name: string;
  nameEn?: string;
  type: WalletType;
  balance: number;
  currency: string;
  color: string;
  iconName: string;
  accountNumber?: string;
  institution?: string;
  isExcludedFromTotal?: boolean;
  creditLimit?: number;
}

// SAVINGS GOALS (أهداف الادخار والتوفير الذكي)
export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: string;
  color: string;
  iconName: string;
  notes?: string;
  isCompleted?: boolean;
}

// DEBTS & LOANS TRACKER (إدارة الديون والمستحقات)
export type DebtType = 'i_owe' | 'owe_me'; // دين عليّ (التزام) أو مستحق لي (أصل)

export interface DebtItem {
  id: string;
  type: DebtType;
  personOrEntity: string;
  phone?: string;
  totalAmount: number;
  paidAmount: number;
  dueDate: string;
  creationDate: string;
  notes?: string;
  status: 'active' | 'partially_paid' | 'settled';
}

// CHART OF ACCOUNTS & DOUBLE-ENTRY ACCOUNTING (شجرة الحسابات والدورة المحاسبية الكاملة)
export type AccountCategory = 'assets' | 'liabilities' | 'equity' | 'revenues' | 'expenses';

export interface Account {
  code: string;          // e.g. "101", "102", "201", "301", "401", "501"
  name: string;          // Arabic Name e.g. "الصندوق والنقدية"
  nameEn: string;        // English Name e.g. "Cash on Hand"
  category: AccountCategory;
  rootCode: 1 | 2 | 3 | 4 | 5; // 1: Assets, 2: Liabilities, 3: Equity, 4: Revenues, 5: Expenses
  normalBalance: 'debit' | 'credit';
  debitTotal: number;
  creditTotal: number;
  balance: number;
  description?: string;
  isSystem?: boolean;
}

export interface JournalEntryLine {
  id: string;
  accountCode: string;
  accountName: string;
  accountNameEn?: string;
  debit: number;
  credit: number;
  memo?: string;
}

export interface JournalEntry {
  id: string;
  entryNumber: string; // e.g. "JE-0001"
  date: string;
  description: string;
  referenceType?: 'transaction' | 'consultation' | 'manual' | 'closing';
  referenceId?: string;
  lines: JournalEntryLine[];
  totalDebit: number;
  totalCredit: number;
  isPosted: boolean;
  createdAt: string;
}

export interface TrialBalanceRow {
  accountCode: string;
  accountName: string;
  category: AccountCategory;
  debitOpening: number;
  creditOpening: number;
  debitMovement: number;
  creditMovement: number;
  debitClosing: number;
  creditClosing: number;
}

// BALANCE SHEET TYPES (الميزانية العمومية: الأصول، المطلوبات، وصافي رأس المال)
export type AssetCategory = 'current' | 'non_current' | 'liquid_investments';
export type LiabilityCategory = 'current' | 'long_term';

export interface AssetItem {
  id: string;
  name: string;
  category: AssetCategory;
  value: number;
  notes?: string;
}

export interface LiabilityItem {
  id: string;
  name: string;
  category: LiabilityCategory;
  value: number;
  interestRate?: number;
  notes?: string;
}

export interface BalanceSheetData {
  asOfDate: string;
  assets: AssetItem[];
  liabilities: LiabilityItem[];
}

// USER AUTHENTICATION & PROFILES
export type AccountTier = 'demo' | 'pro' | 'enterprise';

export interface PaymentDetails {
  plan: 'monthly' | 'annual';
  paymentMethod: 'card' | 'mada' | 'apple_pay';
  cardHolder: string;
  cardNumberMasked: string; // e.g. "•••• 4242"
  expiryDate: string;
  amountPaid: number;
  currency: string;
  billingDate?: string;
  transactionId?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'member' | 'premium' | 'advisor' | 'admin';
  tier?: AccountTier; // 'demo' | 'pro'
  paymentDetails?: PaymentDetails;
  avatarInitials: string;
  joinedDate: string;
  preferredCurrency: string;
  isFreeTrialActive?: boolean;
  trialStartDate?: string;
  trialEndDate?: string;
  trialDaysRemaining?: number;
  complimentaryConsultations?: number;
}

// FINANCIAL CONSULTATION & EXPERTS
export interface FinancialExpert {
  id: string;
  name: string;
  title: string;
  credentials: string; // CFP®, CFA®, CPA
  specialty: string;
  rating: number;
  reviewsCount: number;
  experienceYears: number;
  hourlyRate: number; // in USD
  languages: string[];
  avatarBg: string;
  avatarInitials: string;
  bio: string;
  isOnline: boolean;
}

export interface ConsultationMessage {
  id: string;
  sender: 'user' | 'expert' | 'system';
  text: string;
  timestamp: string;
  isFinancialInsight?: boolean;
}

export interface ConsultationBooking {
  id: string;
  expertId: string;
  expertName: string;
  expertCredentials?: string;
  userId: string;
  userName: string;
  userEmail: string;
  date: string;
  timeSlot: string;
  topic: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  fee: number;
  currencyCode: string;
  createdAt: string;
  clientNotes?: string;
}
