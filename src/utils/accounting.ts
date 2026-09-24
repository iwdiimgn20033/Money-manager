import { 
  Account, 
  AccountCategory, 
  JournalEntry, 
  JournalEntryLine, 
  Transaction, 
  ExpenseCategory, 
  IncomeItem, 
  ConsultationBooking,
  TrialBalanceRow
} from '../types';

/**
 * Standard Chart of Accounts (شجرة الحسابات الموحدة والمعتمدة)
 * 1: Assets (الأصول)
 * 2: Liabilities (الخصوم / الالتزامات)
 * 3: Equity (رأس المال وحقوق الملكية)
 * 4: Revenues (الإيرادات)
 * 5: Expenses (المصروفات)
 */
export const DEFAULT_CHART_OF_ACCOUNTS: Account[] = [
  // 1: ASSETS (الأصول)
  {
    code: '101',
    name: 'الصندوق والنقدية وما في حكمها',
    nameEn: 'Cash on Hand & Petty Cash',
    category: 'assets',
    rootCode: 1,
    normalBalance: 'debit',
    debitTotal: 0,
    creditTotal: 0,
    balance: 0,
    description: 'النقدية السائلة المتوفرة والسيولة الحاضرة',
    isSystem: true,
  },
  {
    code: '102',
    name: 'الحسابات الجارية البنكية',
    nameEn: 'Bank Accounts',
    category: 'assets',
    rootCode: 1,
    normalBalance: 'debit',
    debitTotal: 0,
    creditTotal: 0,
    balance: 0,
    description: 'الأرصدة المودعة في الحسابات البنكية',
    isSystem: true,
  },
  {
    code: '103',
    name: 'الذمم المدينة ومستحقات العملاء',
    nameEn: 'Accounts Receivable',
    category: 'assets',
    rootCode: 1,
    normalBalance: 'debit',
    debitTotal: 0,
    creditTotal: 0,
    balance: 0,
    description: 'مستحقات على عملاء وخدمات لم يتم تحصيلها',
    isSystem: true,
  },
  {
    code: '104',
    name: 'الاستثمارات والودائع السائلة',
    nameEn: 'Liquid Investments & Short-term Deposits',
    category: 'assets',
    rootCode: 1,
    normalBalance: 'debit',
    debitTotal: 0,
    creditTotal: 0,
    balance: 0,
    description: 'الأسهم، الصناديق الاستثمارية، والودائع',
    isSystem: true,
  },
  {
    code: '105',
    name: 'الأصول الثابتة والممتلكات',
    nameEn: 'Fixed Assets & Property',
    category: 'assets',
    rootCode: 1,
    normalBalance: 'debit',
    debitTotal: 0,
    creditTotal: 0,
    balance: 0,
    description: 'المعدات، العقارات، والأجهزة الإنتاجية',
    isSystem: true,
  },

  // 2: LIABILITIES (الخصوم والالتزامات)
  {
    code: '201',
    name: 'الذمم الدائنة والموردين',
    nameEn: 'Accounts Payable & Suppliers',
    category: 'liabilities',
    rootCode: 2,
    normalBalance: 'credit',
    debitTotal: 0,
    creditTotal: 0,
    balance: 0,
    description: 'مستحقات الموردين والالتزامات المستحقة للدفع',
    isSystem: true,
  },
  {
    code: '202',
    name: 'بطاقات الائتمان والالتزامات القصيرة',
    nameEn: 'Credit Cards & Short-term Credit',
    category: 'liabilities',
    rootCode: 2,
    normalBalance: 'credit',
    debitTotal: 0,
    creditTotal: 0,
    balance: 0,
    description: 'أرصدة بطاقات الائتمان والسحبيات القصيرة',
    isSystem: true,
  },
  {
    code: '203',
    name: 'القروض والتمويلات طويلة الأجل',
    nameEn: 'Long-term Loans & Mortgages',
    category: 'liabilities',
    rootCode: 2,
    normalBalance: 'credit',
    debitTotal: 0,
    creditTotal: 0,
    balance: 0,
    description: 'القروض البنكية والتسهيلات طويلة الأجل',
    isSystem: true,
  },

  // 3: EQUITY (حقوق الملكية ورأس المال)
  {
    code: '301',
    name: 'رأس المال المبدئي / المدفوع',
    nameEn: "Owner's Equity & Initial Capital",
    category: 'equity',
    rootCode: 3,
    normalBalance: 'credit',
    debitTotal: 0,
    creditTotal: 0,
    balance: 0,
    description: 'رأس المال الأساسي المودع في بداية النشاط/الفترة',
    isSystem: true,
  },
  {
    code: '302',
    name: 'الأرباح المبقاة والمحتجزة',
    nameEn: 'Retained Earnings',
    category: 'equity',
    rootCode: 3,
    normalBalance: 'credit',
    debitTotal: 0,
    creditTotal: 0,
    balance: 0,
    description: 'الأرباح المتراكمة من الفترات المالية السابقة',
    isSystem: true,
  },
  {
    code: '303',
    name: 'صافي نتيجة الفترة الحالية (أرباح/خسائر)',
    nameEn: 'Current Period Net Income (P&L)',
    category: 'equity',
    rootCode: 3,
    normalBalance: 'credit',
    debitTotal: 0,
    creditTotal: 0,
    balance: 0,
    description: 'الفائض أو العجز المالي المتحقق من العمليات التشغيلية الحالية',
    isSystem: true,
  },

  // 4: REVENUES (الإيرادات)
  {
    code: '401',
    name: 'إيرادات الرواتب والأجور الشهرية',
    nameEn: 'Salaries & Wages Revenue',
    category: 'revenues',
    rootCode: 4,
    normalBalance: 'credit',
    debitTotal: 0,
    creditTotal: 0,
    balance: 0,
    description: 'الدخل المستلم من الوظيفة والرواتب',
    isSystem: true,
  },
  {
    code: '402',
    name: 'إيرادات الاستشارات والخدمات المهنية',
    nameEn: 'Consulting & Professional Services',
    category: 'revenues',
    rootCode: 4,
    normalBalance: 'credit',
    debitTotal: 0,
    creditTotal: 0,
    balance: 0,
    description: 'عوائد تقديم الاستشارات والخدمات الاستشارية وجلسات الخبراء',
    isSystem: true,
  },
  {
    code: '403',
    name: 'إيرادات العمل الحر والمشاريع المستقلة',
    nameEn: 'Freelancing & Independent Contracts',
    category: 'revenues',
    rootCode: 4,
    normalBalance: 'credit',
    debitTotal: 0,
    creditTotal: 0,
    balance: 0,
    description: 'إيرادات العقود الحرة والخدمات المستقلة',
    isSystem: true,
  },
  {
    code: '404',
    name: 'أرباح وعوائد الاستثمارات وتوزيعات الأسهم',
    nameEn: 'Investment Dividends & Yields',
    category: 'revenues',
    rootCode: 4,
    normalBalance: 'credit',
    debitTotal: 0,
    creditTotal: 0,
    balance: 0,
    description: 'عوائد محافظ الاستثمار والتوزيعات النقدية',
    isSystem: true,
  },
  {
    code: '405',
    name: 'مكافآت، عمولات وحوافز تشجيعية',
    nameEn: 'Bonuses, Commissions & Incentives',
    category: 'revenues',
    rootCode: 4,
    normalBalance: 'credit',
    debitTotal: 0,
    creditTotal: 0,
    balance: 0,
    description: 'المكافآت والعمولات المستلمة',
    isSystem: true,
  },
  {
    code: '406',
    name: 'إيرادات أخرى وتدفقات متنوعة',
    nameEn: 'Other Operating & Incidental Revenues',
    category: 'revenues',
    rootCode: 4,
    normalBalance: 'credit',
    debitTotal: 0,
    creditTotal: 0,
    balance: 0,
    description: 'أي تدفقات مالية داخلة أخرى',
    isSystem: true,
  },

  // 5: EXPENSES (المصروفات)
  {
    code: '501',
    name: 'مصروفات السكن، الإيجار والتمويل العقاري',
    nameEn: 'Housing, Rent & Mortgage Expenses',
    category: 'expenses',
    rootCode: 5,
    normalBalance: 'debit',
    debitTotal: 0,
    creditTotal: 0,
    balance: 0,
    description: 'تكاليف الإيجار والسكن الدوري',
    isSystem: true,
  },
  {
    code: '502',
    name: 'مصروفات المرافق، الكهرباء، المياه والاتصالات',
    nameEn: 'Utilities, Electricity, Water & Internet',
    category: 'expenses',
    rootCode: 5,
    normalBalance: 'debit',
    debitTotal: 0,
    creditTotal: 0,
    balance: 0,
    description: 'فواتير الخدمات والمرافق الأساسية',
    isSystem: true,
  },
  {
    code: '503',
    name: 'مصروفات التموين، الغذاء والمشتريات الاستهلاكية',
    nameEn: 'Food, Groceries & Dining',
    category: 'expenses',
    rootCode: 5,
    normalBalance: 'debit',
    debitTotal: 0,
    creditTotal: 0,
    balance: 0,
    description: 'المواد التموينية، المطاعم والمشتريات المنزلية',
    isSystem: true,
  },
  {
    code: '504',
    name: 'مصروفات النقل، الوقود، وصيانة المركبات',
    nameEn: 'Transportation, Fuel & Auto Maintenance',
    category: 'expenses',
    rootCode: 5,
    normalBalance: 'debit',
    debitTotal: 0,
    creditTotal: 0,
    balance: 0,
    description: 'مصاريف المواصلات وصيانة السيارات',
    isSystem: true,
  },
  {
    code: '505',
    name: 'مصروفات الرعاية الصحية، الأدوية والتأمين',
    nameEn: 'Healthcare, Medical & Insurance',
    category: 'expenses',
    rootCode: 5,
    normalBalance: 'debit',
    debitTotal: 0,
    creditTotal: 0,
    balance: 0,
    description: 'الفحوصات الطبية، العلاجات وبوالص التأمين',
    isSystem: true,
  },
  {
    code: '506',
    name: 'مصروفات الترفيه، الاشتراكات ونمط الحياة',
    nameEn: 'Lifestyle, Subscriptions & Entertainment',
    category: 'expenses',
    rootCode: 5,
    normalBalance: 'debit',
    debitTotal: 0,
    creditTotal: 0,
    balance: 0,
    description: 'الأنشطة الترفيهية، السفر والاشتراكات الرقمية',
    isSystem: true,
  },
  {
    code: '507',
    name: 'مصروفات التعليم، التطوير والتدريب',
    nameEn: 'Education, Training & Professional Growth',
    category: 'expenses',
    rootCode: 5,
    normalBalance: 'debit',
    debitTotal: 0,
    creditTotal: 0,
    balance: 0,
    description: 'الرسوم الدراسية، الكتب والدورات التدريبية',
    isSystem: true,
  },
  {
    code: '508',
    name: 'مصروفات استشارية وتشغيلية متنوعة',
    nameEn: 'Consultation & Miscellaneous Operating',
    category: 'expenses',
    rootCode: 5,
    normalBalance: 'debit',
    debitTotal: 0,
    creditTotal: 0,
    balance: 0,
    description: 'أتعاب الاستشارات والخدمات المهنية والمصروفات الأخرى',
    isSystem: true,
  },
];

/**
 * Match a revenue transaction or income item to appropriate 4xx Account
 */
export function resolveRevenueAccount(incomeItem?: IncomeItem, description?: string): { code: string; name: string; nameEn: string } {
  const desc = (description || '').toLowerCase();
  const source = incomeItem?.sourceType;
  const name = (incomeItem?.name || '').toLowerCase();

  if (source === 'salary' || name.includes('راتب') || name.includes('salary') || desc.includes('راتب') || desc.includes('salary')) {
    return { code: '401', name: 'إيرادات الرواتب والأجور الشهرية', nameEn: 'Salaries & Wages Revenue' };
  }
  if (source === 'freelance' || name.includes('استشار') || name.includes('consult') || desc.includes('استشار') || desc.includes('consult')) {
    return { code: '402', name: 'إيرادات الاستشارات والخدمات المهنية', nameEn: 'Consulting & Professional Services' };
  }
  if (source === 'investments' || name.includes('استثمار') || name.includes('invest') || name.includes('dividend') || desc.includes('استثمار')) {
    return { code: '404', name: 'أرباح وعوائد الاستثمارات وتوزيعات الأسهم', nameEn: 'Investment Dividends & Yields' };
  }
  if (source === 'bonus' || name.includes('مكافأ') || name.includes('bonus') || name.includes('عمول') || desc.includes('مكافأ')) {
    return { code: '405', name: 'مكافآت، عمولات وحوافز تشجيعية', nameEn: 'Bonuses, Commissions & Incentives' };
  }
  if (name.includes('حر') || name.includes('freelance') || desc.includes('freelance') || desc.includes('مشروع')) {
    return { code: '403', name: 'إيرادات العمل الحر والمشاريع المستقلة', nameEn: 'Freelancing & Independent Contracts' };
  }
  return { code: '406', name: 'إيرادات أخرى وتدفقات متنوعة', nameEn: 'Other Operating & Incidental Revenues' };
}

/**
 * Match an expense transaction or category/item to appropriate 5xx Account
 */
export function resolveExpenseAccount(category?: ExpenseCategory, itemDescription?: string): { code: string; name: string; nameEn: string } {
  const catName = (category?.name || '').toLowerCase();
  const desc = (itemDescription || '').toLowerCase();

  if (catName.includes('سكن') || catName.includes('housing') || catName.includes('إيجار') || desc.includes('rent') || desc.includes('سكن')) {
    return { code: '501', name: 'مصروفات السكن، الإيجار والتمويل العقاري', nameEn: 'Housing, Rent & Mortgage Expenses' };
  }
  if (catName.includes('مرافق') || catName.includes('utilities') || desc.includes('كهرباء') || desc.includes('إنترنت') || desc.includes('فاتورة')) {
    return { code: '502', name: 'مصروفات المرافق، الكهرباء، المياه والاتصالات', nameEn: 'Utilities, Electricity, Water & Internet' };
  }
  if (catName.includes('طعام') || catName.includes('غذاء') || catName.includes('food') || catName.includes('تموين') || desc.includes('بقالة') || desc.includes('مطعم')) {
    return { code: '503', name: 'مصروفات التموين، الغذاء والمشتريات الاستهلاكية', nameEn: 'Food, Groceries & Dining' };
  }
  if (catName.includes('نقل') || catName.includes('مواصلات') || catName.includes('transport') || desc.includes('بنزين') || desc.includes('وقود') || desc.includes('سيارة')) {
    return { code: '504', name: 'مصروفات النقل، الوقود، وصيانة المركبات', nameEn: 'Transportation, Fuel & Auto Maintenance' };
  }
  if (catName.includes('صح') || catName.includes('health') || catName.includes('تأمين') || desc.includes('طبيب') || desc.includes('علاج') || desc.includes('دواء')) {
    return { code: '505', name: 'مصروفات الرعاية الصحية، الأدوية والتأمين', nameEn: 'Healthcare, Medical & Insurance' };
  }
  if (catName.includes('ترفيه') || catName.includes('lifestyle') || catName.includes('اشتراك') || desc.includes('تسوق') || desc.includes('رحلة')) {
    return { code: '506', name: 'مصروفات الترفيه، الاشتراكات ونمط الحياة', nameEn: 'Lifestyle, Subscriptions & Entertainment' };
  }
  if (catName.includes('تعليم') || catName.includes('education') || desc.includes('دورة') || desc.includes('كتاب') || desc.includes('دراسة')) {
    return { code: '507', name: 'مصروفات التعليم، التطوير والتدريب', nameEn: 'Education, Training & Professional Growth' };
  }
  return { code: '508', name: 'مصروفات استشارية وتشغيلية متنوعة', nameEn: 'Consultation & Miscellaneous Operating' };
}

/**
 * Automatically generate Double-Entry Journal Entries for all recorded transactions and completed bookings
 * Full integrity: Sum(Debits) === Sum(Credits) guaranteed
 */
export function generateAutomatedJournalEntries(
  transactions: Transaction[],
  categories: ExpenseCategory[],
  incomeItems: IncomeItem[],
  bookings: ConsultationBooking[] = [],
  startingCapital: number = 0,
  asOfDate: string = new Date().toISOString().split('T')[0]
): JournalEntry[] {
  const entries: JournalEntry[] = [];
  let counter = 1;

  // 1. Initial Starting Capital / Opening Entry if specified
  if (startingCapital > 0) {
    entries.push({
      id: `je-opening-${counter}`,
      entryNumber: `JE-${String(counter).padStart(4, '0')}`,
      date: asOfDate,
      description: 'قيد الافتتاح: إيداع رأس المال المبدئي / الرصيد الافتتاحي في الحساب البنكي',
      referenceType: 'manual',
      isPosted: true,
      createdAt: new Date().toISOString(),
      lines: [
        {
          id: `line-open-dr`,
          accountCode: '102',
          accountName: 'الحسابات الجارية البنكية',
          accountNameEn: 'Bank Accounts',
          debit: startingCapital,
          credit: 0,
          memo: 'إثبات الرصيد البنكي الافتتاحي',
        },
        {
          id: `line-open-cr`,
          accountCode: '301',
          accountName: 'رأس المال المبدئي / المدفوع',
          accountNameEn: "Owner's Equity & Initial Capital",
          debit: 0,
          credit: startingCapital,
          memo: 'إثبات رأس المال الافتتاحي',
        },
      ],
      totalDebit: startingCapital,
      totalCredit: startingCapital,
    });
    counter++;
  }

  // 2. Automated Entries from Actual Recorded Transactions
  transactions.forEach((tx) => {
    if (!tx.amount || tx.amount <= 0) return;

    if (tx.type === 'income') {
      const incItem = incomeItems.find((i) => i.id === tx.incomeItemId);
      const revAcct = resolveRevenueAccount(incItem, tx.description);

      // Debit Bank/Cash (101 or 102), Credit Revenue (4xx)
      const cashAcctCode = '102'; // default bank/cash asset
      const cashAcctName = 'الحسابات الجارية البنكية';

      entries.push({
        id: `je-tx-${tx.id}`,
        entryNumber: `JE-${String(counter).padStart(4, '0')}`,
        date: tx.date || asOfDate,
        description: `إثبات إيراد: ${tx.description || revAcct.name}`,
        referenceType: 'transaction',
        referenceId: tx.id,
        isPosted: true,
        createdAt: new Date().toISOString(),
        lines: [
          {
            id: `line-${tx.id}-dr`,
            accountCode: cashAcctCode,
            accountName: cashAcctName,
            accountNameEn: 'Bank Accounts',
            debit: tx.amount,
            credit: 0,
            memo: `تحصيل نقدي/بنكي - ${tx.description || ''}`,
          },
          {
            id: `line-${tx.id}-cr`,
            accountCode: revAcct.code,
            accountName: revAcct.name,
            accountNameEn: revAcct.nameEn,
            debit: 0,
            credit: tx.amount,
            memo: `إيراد محقق - ${tx.description || ''}`,
          },
        ],
        totalDebit: tx.amount,
        totalCredit: tx.amount,
      });
      counter++;
    } else if (tx.type === 'expense') {
      const cat = categories.find((c) => c.id === tx.categoryId);
      const expAcct = resolveExpenseAccount(cat, tx.description);

      // Debit Expense (5xx), Credit Bank/Cash (101 or 102)
      const cashAcctCode = '102';
      const cashAcctName = 'الحسابات الجارية البنكية';

      entries.push({
        id: `je-tx-${tx.id}`,
        entryNumber: `JE-${String(counter).padStart(4, '0')}`,
        date: tx.date || asOfDate,
        description: `إثبات مصروف: ${tx.description || expAcct.name}`,
        referenceType: 'transaction',
        referenceId: tx.id,
        isPosted: true,
        createdAt: new Date().toISOString(),
        lines: [
          {
            id: `line-${tx.id}-dr`,
            accountCode: expAcct.code,
            accountName: expAcct.name,
            accountNameEn: expAcct.nameEn,
            debit: tx.amount,
            credit: 0,
            memo: `مصروف مسجل - ${tx.description || ''}`,
          },
          {
            id: `line-${tx.id}-cr`,
            accountCode: cashAcctCode,
            accountName: cashAcctName,
            accountNameEn: 'Bank Accounts',
            debit: 0,
            credit: tx.amount,
            memo: `صرف نقدي/بنكي - ${tx.description || ''}`,
          },
        ],
        totalDebit: tx.amount,
        totalCredit: tx.amount,
      });
      counter++;
    }
  });

  return entries;
}

/**
 * Compute Posted Balances for Chart of Accounts from Journal Entries
 */
export function computeAccountBalances(
  accounts: Account[] = DEFAULT_CHART_OF_ACCOUNTS,
  entries: JournalEntry[]
): Account[] {
  // Deep clone accounts
  const updatedAccounts: Account[] = accounts.map((acct) => ({
    ...acct,
    debitTotal: 0,
    creditTotal: 0,
    balance: 0,
  }));

  const accountMap = new Map<string, Account>();
  updatedAccounts.forEach((acct) => accountMap.set(acct.code, acct));

  // Process all posted entries
  entries.forEach((entry) => {
    if (!entry.isPosted) return;
    entry.lines.forEach((line) => {
      let acct = accountMap.get(line.accountCode);
      if (!acct) {
        // Fallback create account if missing
        const root = Number(line.accountCode[0]) as 1 | 2 | 3 | 4 | 5;
        const catMap: Record<number, AccountCategory> = {
          1: 'assets',
          2: 'liabilities',
          3: 'equity',
          4: 'revenues',
          5: 'expenses',
        };
        acct = {
          code: line.accountCode,
          name: line.accountName,
          nameEn: line.accountNameEn || line.accountName,
          category: catMap[root] || 'assets',
          rootCode: root || 1,
          normalBalance: root === 1 || root === 5 ? 'debit' : 'credit',
          debitTotal: 0,
          creditTotal: 0,
          balance: 0,
        };
        updatedAccounts.push(acct);
        accountMap.set(line.accountCode, acct);
      }

      acct.debitTotal += line.debit;
      acct.creditTotal += line.credit;
    });
  });

  // Calculate final net balances according to normal balance rules
  updatedAccounts.forEach((acct) => {
    if (acct.normalBalance === 'debit') {
      acct.balance = acct.debitTotal - acct.creditTotal;
    } else {
      acct.balance = acct.creditTotal - acct.debitTotal;
    }
  });

  return updatedAccounts;
}

/**
 * Generate Trial Balance (ميزان المراجعة بالمجاميع والأرصدة)
 */
export function generateTrialBalance(accounts: Account[]): {
  rows: TrialBalanceRow[];
  totalDebitMovements: number;
  totalCreditMovements: number;
  totalDebitClosing: number;
  totalCreditClosing: number;
  isBalanced: boolean;
} {
  const rows: TrialBalanceRow[] = [];
  let totalDebitMovements = 0;
  let totalCreditMovements = 0;
  let totalDebitClosing = 0;
  let totalCreditClosing = 0;

  accounts.forEach((acct) => {
    // Only include accounts with activity or system roots
    if (acct.debitTotal === 0 && acct.creditTotal === 0 && acct.balance === 0) {
      return;
    }

    const netBal = acct.debitTotal - acct.creditTotal;
    const debitClosing = netBal > 0 ? netBal : 0;
    const creditClosing = netBal < 0 ? Math.abs(netBal) : 0;

    totalDebitMovements += acct.debitTotal;
    totalCreditMovements += acct.creditTotal;
    totalDebitClosing += debitClosing;
    totalCreditClosing += creditClosing;

    rows.push({
      accountCode: acct.code,
      accountName: acct.name,
      category: acct.category,
      debitOpening: 0,
      creditOpening: 0,
      debitMovement: acct.debitTotal,
      creditMovement: acct.creditTotal,
      debitClosing,
      creditClosing,
    });
  });

  // Sort by Account Code ascending
  rows.sort((a, b) => a.accountCode.localeCompare(b.accountCode));

  const isBalanced = Math.abs(totalDebitClosing - totalCreditClosing) < 0.01;

  return {
    rows,
    totalDebitMovements,
    totalCreditMovements,
    totalDebitClosing,
    totalCreditClosing,
    isBalanced,
  };
}

/**
 * Calculate Realized Income Statement from Posted Accounts
 */
export function calculateIncomeStatementFromAccounts(accounts: Account[]) {
  const revenueAccounts = accounts.filter((a) => a.category === 'revenues' && (a.creditTotal > 0 || a.balance > 0));
  const expenseAccounts = accounts.filter((a) => a.category === 'expenses' && (a.debitTotal > 0 || a.balance > 0));

  const totalRevenues = revenueAccounts.reduce((sum, a) => sum + (a.balance > 0 ? a.balance : a.creditTotal), 0);
  const totalExpenses = expenseAccounts.reduce((sum, a) => sum + (a.balance > 0 ? a.balance : a.debitTotal), 0);
  const netIncome = totalRevenues - totalExpenses;

  return {
    revenueAccounts,
    expenseAccounts,
    totalRevenues,
    totalExpenses,
    netIncome,
    profitMarginPercent: totalRevenues > 0 ? (netIncome / totalRevenues) * 100 : 0,
  };
}
