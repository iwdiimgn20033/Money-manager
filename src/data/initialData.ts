import { ExpenseCategory, IncomeItem, Transaction, BudgetPeriod, WalletAccount, SavingsGoal, DebtItem } from '../types';

// Dynamically compute today's real current date and period
const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1; // 1-indexed (1..12)
const currentDay = now.getDate();

// Calculate total days in current month
const lastDayOfMonth = new Date(currentYear, currentMonth, 0).getDate();
const monthName = now.toLocaleString('en-US', { month: 'long' });
const monthShort = now.toLocaleString('en-US', { month: 'short' });

const startDateFormatted = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
const endDateFormatted = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(lastDayOfMonth).padStart(2, '0')}`;
const todayFormatted = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;

export const INITIAL_PERIOD: BudgetPeriod = {
  id: 'current-period',
  month: currentMonth,
  year: currentYear,
  label: `${monthName} ${currentYear}`,
  startDate: startDateFormatted,
  endDate: endDateFormatted,
  startingBankBalance: 0.00,
  currentDay: currentDay,
  totalDays: lastDayOfMonth,
};

// Clean, user-ready Income Streams starting at 0 so user values are exact
export const INITIAL_INCOME_ITEMS: IncomeItem[] = [
  {
    id: 'inc-1',
    name: 'الراتب الأساسي / Main Salary',
    expectedAmount: 0.00,
    receivedAmount: 0.00,
    sourceType: 'salary',
    dateExpected: todayFormatted,
    isReceived: false,
  },
  {
    id: 'inc-2',
    name: 'أعمال حرة واستشارات / Freelance & Bonus',
    expectedAmount: 0.00,
    receivedAmount: 0.00,
    sourceType: 'freelance',
    dateExpected: todayFormatted,
    isReceived: false,
  },
  {
    id: 'inc-3',
    name: 'عوائد استثمارية وتوزيعات / Dividends',
    expectedAmount: 0.00,
    receivedAmount: 0.00,
    sourceType: 'investments',
    dateExpected: todayFormatted,
    isReceived: false,
  },
];

// Clean, user-ready Expense Categories starting at 0.00 so user enters exact numbers
export const INITIAL_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  {
    id: 'cat-housing',
    name: 'السكن والفواتير / Housing & Utilities',
    color: '#1e293b',
    iconName: 'Home',
    items: [
      { id: 'exp-1', categoryId: 'cat-housing', name: 'الإيجار / أقساط المسكن', budgeted: 0.00, actual: 0.00, isFixed: true },
      { id: 'exp-2', categoryId: 'cat-housing', name: 'الكهرباء والمياه والغاز', budgeted: 0.00, actual: 0.00, isFixed: false },
      { id: 'exp-3', categoryId: 'cat-housing', name: 'الإنترنت والاتصالات', budgeted: 0.00, actual: 0.00, isFixed: true },
    ],
  },
  {
    id: 'cat-food',
    name: 'الطعام والمشتريات / Food & Groceries',
    color: '#2563eb',
    iconName: 'ShoppingBag',
    items: [
      { id: 'exp-4', categoryId: 'cat-food', name: 'مشتريات السوبرماركت والمنزل', budgeted: 0.00, actual: 0.00, isFixed: false },
      { id: 'exp-5', categoryId: 'cat-food', name: 'المطاعم والكافيهات', budgeted: 0.00, actual: 0.00, isFixed: false },
    ],
  },
  {
    id: 'cat-transport',
    name: 'المواصلات والسيارة / Transportation',
    color: '#0284c7',
    iconName: 'Car',
    items: [
      { id: 'exp-6', categoryId: 'cat-transport', name: 'الوقود ومحطات الشحن', budgeted: 0.00, actual: 0.00, isFixed: false },
      { id: 'exp-7', categoryId: 'cat-transport', name: 'صيانة وتأمين المركبة', budgeted: 0.00, actual: 0.00, isFixed: true },
      { id: 'exp-8', categoryId: 'cat-transport', name: 'المواصلات العامة وأوبر', budgeted: 0.00, actual: 0.00, isFixed: false },
    ],
  },
  {
    id: 'cat-entertainment',
    name: 'الترفيه والتسوق / Shopping & Leisure',
    color: '#7c3aed',
    iconName: 'Tv',
    items: [
      { id: 'exp-9', categoryId: 'cat-entertainment', name: 'الاشتراكات الرقمية والبرامج', budgeted: 0.00, actual: 0.00, isFixed: true },
      { id: 'exp-10', categoryId: 'cat-entertainment', name: 'الملابس والمشتريات الشخصية', budgeted: 0.00, actual: 0.00, isFixed: false },
      { id: 'exp-11', categoryId: 'cat-entertainment', name: 'النادي الرياضي والأنشطة', budgeted: 0.00, actual: 0.00, isFixed: true },
    ],
  },
  {
    id: 'cat-healthcare',
    name: 'الصحة والعناية / Healthcare & Care',
    color: '#059669',
    iconName: 'HeartPulse',
    items: [
      { id: 'exp-12', categoryId: 'cat-healthcare', name: 'الأدوية والمستلزمات الطبية', budgeted: 0.00, actual: 0.00, isFixed: false },
      { id: 'exp-13', categoryId: 'cat-healthcare', name: 'التأمين الطبي والعيادات', budgeted: 0.00, actual: 0.00, isFixed: true },
    ],
  },
  {
    id: 'cat-savings',
    name: 'الادخار والاستثمار / Savings & Buffer',
    color: '#0f766e',
    iconName: 'PiggyBank',
    items: [
      { id: 'exp-14', categoryId: 'cat-savings', name: 'صندوق الطوارئ والاحتياط', budgeted: 0.00, actual: 0.00, isFixed: true },
      { id: 'exp-15', categoryId: 'cat-savings', name: 'الاستثمار في الأسهم والصناديق', budgeted: 0.00, actual: 0.00, isFixed: true },
    ],
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

// DEFAULT MULTI-WALLET ACCOUNTS (المحافظ والحسابات)
export const INITIAL_WALLETS: WalletAccount[] = [
  {
    id: 'wallet-cash',
    name: 'المحفظة النقدية (كاش)',
    nameEn: 'Cash on Hand',
    type: 'cash',
    balance: 0.00,
    currency: 'QAR',
    color: '#10b981',
    iconName: 'Banknote',
  },
  {
    id: 'wallet-bank-main',
    name: 'الحساب البنكي الجاري',
    nameEn: 'Main Checking Account',
    type: 'bank',
    balance: 0.00,
    currency: 'QAR',
    color: '#2563eb',
    iconName: 'Building2',
    institution: 'National Bank',
    accountNumber: '•••• 8821',
  },
  {
    id: 'wallet-savings',
    name: 'خزنة الادخار والطوارئ',
    nameEn: 'Emergency Savings Vault',
    type: 'savings',
    balance: 0.00,
    currency: 'QAR',
    color: '#059669',
    iconName: 'PiggyBank',
  },
  {
    id: 'wallet-card',
    name: 'بطاقة الائتمان (Visa / MC)',
    nameEn: 'Rewards Credit Card',
    type: 'card',
    balance: 0.00,
    currency: 'QAR',
    color: '#f59e0b',
    iconName: 'CreditCard',
    creditLimit: 15000,
  },
  {
    id: 'wallet-ewallet',
    name: 'المحفظة الرقمية (Apple / STC Pay)',
    nameEn: 'Digital E-Wallet',
    type: 'ewallet',
    balance: 0.00,
    currency: 'QAR',
    color: '#8b5cf6',
    iconName: 'Smartphone',
  },
];

// DEFAULT SAVINGS GOALS
export const INITIAL_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: 'goal-emergency',
    title: 'صندوق الطوارئ لـ 6 أشهر',
    targetAmount: 30000,
    currentAmount: 0,
    targetDate: `${currentYear}-12-31`,
    category: 'طوارئ',
    color: '#10b981',
    iconName: 'ShieldCheck',
  },
  {
    id: 'goal-vacation',
    title: 'رحلة الإجازة السنوية',
    targetAmount: 12000,
    currentAmount: 0,
    targetDate: `${currentYear}-08-15`,
    category: 'سياحة',
    color: '#3b82f6',
    iconName: 'Plane',
  },
];

// DEFAULT DEBTS
export const INITIAL_DEBTS: DebtItem[] = [];
