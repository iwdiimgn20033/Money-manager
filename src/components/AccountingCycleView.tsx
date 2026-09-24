import React, { useState, useMemo } from 'react';
import { 
  Account, 
  AccountCategory, 
  BudgetPeriod, 
  CurrencyInfo, 
  ExpenseCategory, 
  FinancialMetrics, 
  IncomeItem, 
  JournalEntry, 
  JournalEntryLine, 
  Transaction 
} from '../types';
import { formatCurrency, formatPercent } from '../utils/calculations';
import { LanguageCode } from '../i18n/translations';
import { 
  DEFAULT_CHART_OF_ACCOUNTS, 
  computeAccountBalances, 
  generateAutomatedJournalEntries, 
  generateTrialBalance,
  calculateIncomeStatementFromAccounts
} from '../utils/accounting';
import {
  BookOpen,
  FileText,
  Scale,
  Plus,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  Download,
  Printer,
  Search,
  Filter,
  Layers,
  TrendingUp,
  TrendingDown,
  Building2,
  Wallet,
  ShieldCheck,
  Calendar,
  Lock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface AccountingCycleViewProps {
  period: BudgetPeriod;
  transactions: Transaction[];
  categories: ExpenseCategory[];
  incomeItems: IncomeItem[];
  metrics: FinancialMetrics;
  currentLanguage?: LanguageCode;
  currentCurrency?: CurrencyInfo;
}

export const AccountingCycleView: React.FC<AccountingCycleViewProps> = ({
  period,
  transactions,
  categories,
  incomeItems,
  metrics,
  currentLanguage = 'ar',
  currentCurrency,
}) => {
  const isAr = currentLanguage === 'ar';

  // Sub-tabs: 'coa' | 'journal' | 'trial_balance' | 'income_statement' | 'balance_sheet'
  const [activeSubTab, setActiveSubTab] = useState<'coa' | 'journal' | 'trial_balance' | 'income_statement' | 'balance_sheet'>('coa');

  // Chart of accounts state
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('budget_chart_of_accounts_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_CHART_OF_ACCOUNTS;
      }
    }
    return DEFAULT_CHART_OF_ACCOUNTS;
  });

  // Manual Journal Entries state
  const [manualEntries, setManualEntries] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem('budget_manual_journal_entries_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Search & Filter state in COA
  const [coaSearch, setCoaSearch] = useState('');
  const [coaCategoryFilter, setCoaCategoryFilter] = useState<'all' | AccountCategory>('all');

  // Auto-generate entries from current transactions + opening balance
  const automatedEntries = useMemo(() => {
    return generateAutomatedJournalEntries(
      transactions,
      categories,
      incomeItems,
      [],
      period.startingBankBalance || 0,
      period.startDate || new Date().toISOString().split('T')[0]
    );
  }, [transactions, categories, incomeItems, period]);

  // Combined all Journal Entries (Automated + Manual)
  const allJournalEntries = useMemo(() => {
    return [...automatedEntries, ...manualEntries].sort((a, b) => b.date.localeCompare(a.date));
  }, [automatedEntries, manualEntries]);

  // Compute live updated account balances from all journal entries
  const liveAccounts = useMemo(() => {
    return computeAccountBalances(accounts, allJournalEntries);
  }, [accounts, allJournalEntries]);

  // Compute Trial Balance
  const trialBalance = useMemo(() => {
    return generateTrialBalance(liveAccounts);
  }, [liveAccounts]);

  // Compute Income Statement from Live Accounts
  const incomeStatement = useMemo(() => {
    return calculateIncomeStatementFromAccounts(liveAccounts);
  }, [liveAccounts]);

  // Compute Accounting Balance Sheet from Live Accounts
  const accountingBalanceSheet = useMemo(() => {
    const assetAccounts = liveAccounts.filter((a) => a.category === 'assets');
    const liabilityAccounts = liveAccounts.filter((a) => a.category === 'liabilities');
    const equityAccounts = liveAccounts.filter((a) => a.category === 'equity');

    const totalAssets = assetAccounts.reduce((sum, a) => sum + a.balance, 0);
    const totalLiabilities = liabilityAccounts.reduce((sum, a) => sum + a.balance, 0);
    const totalEquity = equityAccounts.reduce((sum, a) => sum + a.balance, 0);

    // Current period net income transferred to equity
    const totalEquityWithRetained = totalEquity + incomeStatement.netIncome;

    return {
      assetAccounts,
      liabilityAccounts,
      equityAccounts,
      totalAssets,
      totalLiabilities,
      totalEquity,
      totalEquityWithRetained,
      netWorthDifference: totalAssets - (totalLiabilities + totalEquityWithRetained),
      isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquityWithRetained)) < 0.05,
    };
  }, [liveAccounts, incomeStatement]);

  // New Account Modal State
  const [isNewAccountModalOpen, setIsNewAccountModalOpen] = useState(false);
  const [newAccountCode, setNewAccountCode] = useState('');
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountNameEn, setNewAccountNameEn] = useState('');
  const [newAccountRoot, setNewAccountRoot] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [newAccountDesc, setNewAccountDesc] = useState('');

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountCode || !newAccountName) return;

    const catMap: Record<number, AccountCategory> = {
      1: 'assets',
      2: 'liabilities',
      3: 'equity',
      4: 'revenues',
      5: 'expenses',
    };

    const newAcc: Account = {
      code: newAccountCode,
      name: newAccountName,
      nameEn: newAccountNameEn || newAccountName,
      category: catMap[newAccountRoot],
      rootCode: newAccountRoot,
      normalBalance: newAccountRoot === 1 || newAccountRoot === 5 ? 'debit' : 'credit',
      debitTotal: 0,
      creditTotal: 0,
      balance: 0,
      description: newAccountDesc,
      isSystem: false,
    };

    const updated = [...accounts, newAcc].sort((a, b) => a.code.localeCompare(b.code));
    setAccounts(updated);
    localStorage.setItem('budget_chart_of_accounts_v1', JSON.stringify(updated));

    // Reset form
    setNewAccountCode('');
    setNewAccountName('');
    setNewAccountNameEn('');
    setNewAccountDesc('');
    setIsNewAccountModalOpen(false);
  };

  // Export COA to CSV
  const handleExportCOA = () => {
    let csv = 'data:text/csv;charset=utf-8,';
    csv += 'Code,Arabic Name,English Name,Category,Root,Debit Movements,Credit Movements,Current Balance\n';
    liveAccounts.forEach((a) => {
      csv += `"${a.code}","${a.name}","${a.nameEn}","${a.category}",${a.rootCode},${a.debitTotal},${a.creditTotal},${a.balance}\n`;
    });
    const encoded = encodeURI(csv);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `chart-of-accounts-${period.label || 'current'}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export General Journal to CSV
  const handleExportJournal = () => {
    let csv = 'data:text/csv;charset=utf-8,';
    csv += 'Entry No,Date,Description,Account Code,Account Name,Debit,Credit,Status\n';
    allJournalEntries.forEach((je) => {
      je.lines.forEach((line) => {
        csv += `"${je.entryNumber}","${je.date}","${je.description}","${line.accountCode}","${line.accountName}",${line.debit},${line.credit},${je.isPosted ? 'Posted' : 'Draft'}\n`;
      });
    });
    const encoded = encodeURI(csv);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `general-journal-ledger-${period.label || 'current'}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered COA
  const filteredAccounts = useMemo(() => {
    return liveAccounts.filter((a) => {
      const matchSearch =
        coaSearch === '' ||
        a.code.includes(coaSearch) ||
        a.name.toLowerCase().includes(coaSearch.toLowerCase()) ||
        a.nameEn.toLowerCase().includes(coaSearch.toLowerCase());
      const matchCat = coaCategoryFilter === 'all' || a.category === coaCategoryFilter;
      return matchSearch && matchCat;
    });
  }, [liveAccounts, coaSearch, coaCategoryFilter]);

  return (
    <div id="accounting-cycle-container" className="space-y-6 font-arabic" dir={isAr ? 'rtl' : 'ltr'}>
      {/* 1. Header Banner */}
      <div className="bg-white text-slate-800 p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
              {isAr ? 'شجرة الحسابات والدورة المحاسبية المزدوجة' : 'Enterprise Chart of Accounts & General Ledger'}
            </h2>
          </div>
          <p className="text-base sm:text-lg font-bold text-slate-900 mt-1">
            {isAr
              ? 'نظام محاسبي متكامل: شجرة حسابات قياسية (1-5)، قيود آلية مرحلة، ميزان مراجعة وقوائم مالية فورية'
              : 'Complete Double-Entry Accounting: Numbered COA (1-5), Automated Journal Entries, Trial Balance & Statements'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 hover:text-slate-900 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>{isAr ? 'طباعة' : 'Print'}</span>
          </button>
          <button
            onClick={activeSubTab === 'journal' ? handleExportJournal : handleExportCOA}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isAr ? 'تصدير CSV' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* 2. Sub-Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-sm flex flex-wrap items-center gap-2">
        {[
          { id: 'coa', label: isAr ? '🌳 شجرة الحسابات (COA)' : '🌳 Chart of Accounts', icon: Layers },
          { id: 'journal', label: isAr ? '📖 دفتر القيود اليومية (Journal)' : '📖 General Journal', icon: BookOpen, count: allJournalEntries.length },
          { id: 'trial_balance', label: isAr ? '⚖️ ميزان المراجعة (Trial Balance)' : '⚖️ Trial Balance', icon: Scale },
          { id: 'income_statement', label: isAr ? '📈 قائمة الدخل الفعلية (P&L)' : '📈 Realized Income Statement', icon: TrendingUp },
          { id: 'balance_sheet', label: isAr ? '🏛️ الميزانية العمومية (Balance Sheet)' : '🏛️ Balance Sheet', icon: Building2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${isActive ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. TAB 1: CHART OF ACCOUNTS (شجرة الحسابات الموحدة) */}
      {activeSubTab === 'coa' && (
        <div className="space-y-4">
          {/* Top Controls & Category Filter */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 rtl:right-3 ltr:left-3" />
              <input
                type="text"
                placeholder={isAr ? 'بحث برقم الحساب أو الاسم (مثلاً: 101 أو الصندوق)...' : 'Search by account code or name...'}
                value={coaSearch}
                onChange={(e) => setCoaSearch(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-blue-600 focus:outline-none pr-9 rtl:pr-9 ltr:pl-9"
              />
            </div>

            {/* Category Root Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'all', label: isAr ? 'الكل' : 'All' },
                { id: 'assets', label: isAr ? '1. الأصول' : '1. Assets' },
                { id: 'liabilities', label: isAr ? '2. الخصوم' : '2. Liabilities' },
                { id: 'equity', label: isAr ? '3. رأس المال' : '3. Equity' },
                { id: 'revenues', label: isAr ? '4. الإيرادات' : '4. Revenues' },
                { id: 'expenses', label: isAr ? '5. المصروفات' : '5. Expenses' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setCoaCategoryFilter(f.id as any)}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-xl transition-all ${
                    coaCategoryFilter === f.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  {f.label}
                </button>
              ))}

              <button
                onClick={() => setIsNewAccountModalOpen(true)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs ml-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAr ? 'إضافة حساب جديد' : 'New Account'}</span>
              </button>
            </div>
          </div>

          {/* Accounts Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-xs font-sans text-left">
              <thead>
                <tr className="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 text-center">{isAr ? 'رمز الحساب' : 'Code'}</th>
                  <th className="py-3 px-4">{isAr ? 'اسم الحساب في الدليل' : 'Account Title'}</th>
                  <th className="py-3 px-3">{isAr ? 'التصنيف الرئيسي' : 'Root Class'}</th>
                  <th className="py-3 px-3 text-center">{isAr ? 'طبيعة الحساب' : 'Normal Bal.'}</th>
                  <th className="py-3 px-4 text-right">{isAr ? 'إجمالي المدين' : 'Total Debit'}</th>
                  <th className="py-3 px-4 text-right">{isAr ? 'إجمالي الدائن' : 'Total Credit'}</th>
                  <th className="py-3 px-4 text-right">{isAr ? 'الرصيد الفعلي الحالي' : 'Net Balance'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredAccounts.map((acct) => {
                  const rootColor =
                    acct.rootCode === 1 ? 'bg-blue-50 text-blue-800 border-blue-200' :
                    acct.rootCode === 2 ? 'bg-amber-50 text-amber-800 border-amber-200' :
                    acct.rootCode === 3 ? 'bg-purple-50 text-purple-800 border-purple-200' :
                    acct.rootCode === 4 ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                    'bg-rose-50 text-rose-800 border-rose-200';

                  const rootLabel =
                    acct.rootCode === 1 ? (isAr ? '1. الأصول' : '1. Assets') :
                    acct.rootCode === 2 ? (isAr ? '2. الخصوم' : '2. Liabilities') :
                    acct.rootCode === 3 ? (isAr ? '3. رأس المال' : '3. Equity') :
                    acct.rootCode === 4 ? (isAr ? '4. الإيرادات' : '4. Revenues') :
                    (isAr ? '5. المصروفات' : '5. Expenses');

                  return (
                    <tr key={acct.code} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-4 text-center font-bold text-slate-900 bg-slate-50/50">
                        {acct.code}
                      </td>
                      <td className="py-2.5 px-4 font-sans">
                        <div className="font-bold text-slate-900">{isAr ? acct.name : acct.nameEn}</div>
                        <div className="text-[10px] text-slate-500">{isAr ? acct.nameEn : acct.name}</div>
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${rootColor}`}>
                          {rootLabel}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-sans">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase ${
                          acct.normalBalance === 'debit' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {acct.normalBalance === 'debit' ? (isAr ? 'مدين' : 'Debit') : (isAr ? 'دائن' : 'Credit')}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right text-slate-700">
                        {formatCurrency(acct.debitTotal)}
                      </td>
                      <td className="py-2.5 px-4 text-right text-slate-700">
                        {formatCurrency(acct.creditTotal)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-slate-900 text-sm">
                        <span className={acct.balance > 0 ? (acct.rootCode === 4 || acct.rootCode === 1 ? 'text-emerald-600' : 'text-slate-900') : 'text-slate-500'}>
                          {formatCurrency(acct.balance)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. TAB 2: GENERAL JOURNAL LEDGER (دفتر قيود اليومية الآلية والمرحلة) */}
      {activeSubTab === 'journal' && (
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-4 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{isAr ? 'سجل القيود اليومية المحاسبية المزدوجة' : 'Double-Entry General Journal'}</span>
              </h3>
              <span className="text-[11px] text-slate-500">
                {isAr
                  ? 'يتم إنشاء القيود تلقائياً من كل عملية إيراد أو مصروف وترحيلها لحظياً دون تدخل يدوي'
                  : 'Entries auto-generated from ledger transactions with full audit trail and zero balance delta'}
              </span>
            </div>
            <div className="text-xs font-mono font-bold bg-slate-900 text-white px-3.5 py-1.5 rounded-xl">
              {allJournalEntries.length} {isAr ? 'قيد مرحل' : 'Posted Entries'}
            </div>
          </div>

          {/* Journal Entries List */}
          <div className="space-y-4">
            {allJournalEntries.length === 0 ? (
              <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center text-slate-500">
                <p className="text-sm font-bold">{isAr ? 'لا توجد قيود مسجلة بعد' : 'No journal entries recorded yet'}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {isAr ? 'عند إضافة أي عملية في سجل المعاملات ستظهر قيودها المحاسبية هنا مباشرة' : 'Add transactions in the ledger to auto-generate double entries'}
                </p>
              </div>
            ) : (
              allJournalEntries.map((entry) => (
                <div key={entry.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                  {/* Entry Header */}
                  <div className="bg-slate-900 text-white px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-0.5 bg-blue-600 text-white font-mono font-bold text-xs rounded-lg">
                        {entry.entryNumber}
                      </span>
                      <span className="font-bold text-xs text-slate-200">
                        {entry.description}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-blue-400" />
                        {entry.date}
                      </span>
                      <span className="px-2.5 py-0.5 bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold rounded-full uppercase">
                        {isAr ? 'مرحل ومطابق' : 'Posted & Balanced'}
                      </span>
                    </div>
                  </div>

                  {/* Entry Lines Table */}
                  <table className="w-full text-xs font-sans">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-bold uppercase text-slate-600 border-b border-slate-200">
                        <th className="py-2 px-4 text-center w-24">{isAr ? 'رقم الحساب' : 'Acct Code'}</th>
                        <th className="py-2 px-4">{isAr ? 'اسم الحساب / البيان' : 'Account Title / Memo'}</th>
                        <th className="py-2 px-4 text-right w-36">{isAr ? 'مدين (Debit)' : 'Debit ($)'}</th>
                        <th className="py-2 px-4 text-right w-36">{isAr ? 'دائن (Credit)' : 'Credit ($)'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {entry.lines.map((line) => (
                        <tr key={line.id} className="hover:bg-slate-50/60">
                          <td className="py-2 px-4 text-center font-bold text-slate-800 bg-slate-50/50">
                            {line.accountCode}
                          </td>
                          <td className="py-2 px-4 font-sans">
                            <span className="font-bold text-slate-900">{line.accountName}</span>
                            {line.memo && <span className="text-[10px] text-slate-500 mr-2 ml-2">({line.memo})</span>}
                          </td>
                          <td className="py-2 px-4 text-right font-bold text-slate-900">
                            {line.debit > 0 ? formatCurrency(line.debit) : '-'}
                          </td>
                          <td className="py-2 px-4 text-right font-bold text-slate-900">
                            {line.credit > 0 ? formatCurrency(line.credit) : '-'}
                          </td>
                        </tr>
                      ))}
                      {/* Subtotal Balance Row */}
                      <tr className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
                        <td colSpan={2} className="py-2 px-4 font-sans text-left text-slate-600">
                          {isAr ? 'المجموع والتحقق من التوازن:' : 'Entry Balance Verification:'}
                        </td>
                        <td className="py-2 px-4 text-right text-blue-700 font-bold">
                          {formatCurrency(entry.totalDebit)}
                        </td>
                        <td className="py-2 px-4 text-right text-blue-700 font-bold">
                          {formatCurrency(entry.totalCredit)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 5. TAB 3: TRIAL BALANCE (ميزان المراجعة بالمجاميع والأرصدة) */}
      {activeSubTab === 'trial_balance' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white p-5 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  {isAr ? 'ميزان المراجعة الختامي' : 'General Trial Balance'}
                </h3>
              </div>
              <p className="text-sm font-bold text-slate-200 mt-1">
                {isAr
                  ? 'مطابقة تامة بين إجمالي الحركات المدينة والدائنة والأرصدة الختامية'
                  : 'Total Debits strictly equal Total Credits across all account ledgers'}
              </p>
            </div>

            <div className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold uppercase flex items-center gap-2 ${
              trialBalance.isBalanced ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300' : 'bg-rose-950/80 border-rose-500 text-rose-300'
            }`}>
              {trialBalance.isBalanced ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              <span>{trialBalance.isBalanced ? (isAr ? 'الميزان متزن 100%' : 'Balanced 100%') : (isAr ? 'فارق غير متزن' : 'Unbalanced')}</span>
            </div>
          </div>

          {/* Trial Balance Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-xs font-sans text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-800 text-[10px] font-bold uppercase border-b border-slate-200">
                  <th className="py-3 px-4 text-center">{isAr ? 'رقم الحساب' : 'Code'}</th>
                  <th className="py-3 px-4">{isAr ? 'اسم الحساب' : 'Account Name'}</th>
                  <th className="py-3 px-4 text-right">{isAr ? 'حركة مدين' : 'Debit Movement'}</th>
                  <th className="py-3 px-4 text-right">{isAr ? 'حركة دائن' : 'Credit Movement'}</th>
                  <th className="py-3 px-4 text-right bg-blue-50/40">{isAr ? 'رصيد ختامي مدين' : 'Closing Debit'}</th>
                  <th className="py-3 px-4 text-right bg-blue-50/40">{isAr ? 'رصيد ختامي دائن' : 'Closing Credit'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {trialBalance.rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                      {isAr ? 'لا توجد حركات محاسبية بعد لإظهارها في ميزان المراجعة' : 'No account movements recorded yet'}
                    </td>
                  </tr>
                ) : (
                  trialBalance.rows.map((row) => (
                    <tr key={row.accountCode} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 text-center font-bold text-slate-900 bg-slate-50/50">
                        {row.accountCode}
                      </td>
                      <td className="py-2.5 px-4 font-sans font-bold text-slate-900">
                        {row.accountName}
                      </td>
                      <td className="py-2.5 px-4 text-right text-slate-700">
                        {formatCurrency(row.debitMovement)}
                      </td>
                      <td className="py-2.5 px-4 text-right text-slate-700">
                        {formatCurrency(row.creditMovement)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-blue-900 bg-blue-50/20">
                        {row.debitClosing > 0 ? formatCurrency(row.debitClosing) : '-'}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-blue-900 bg-blue-50/20">
                        {row.creditClosing > 0 ? formatCurrency(row.creditClosing) : '-'}
                      </td>
                    </tr>
                  ))
                )}
                {/* Total Summary Row */}
                <tr className="bg-slate-900 text-white font-bold text-xs border-t-2 border-slate-900">
                  <td colSpan={2} className="py-3 px-4 font-sans uppercase">
                    {isAr ? 'إجمالي ميزان المراجعة:' : 'Total Trial Balance:'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    {formatCurrency(trialBalance.totalDebitMovements)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    {formatCurrency(trialBalance.totalCreditMovements)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-400 bg-slate-800">
                    {formatCurrency(trialBalance.totalDebitClosing)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-400 bg-slate-800">
                    {formatCurrency(trialBalance.totalCreditClosing)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. TAB 4: REALIZED INCOME STATEMENT (قائمة الدخل والأرباح والخسائر الفعلية) */}
      {activeSubTab === 'income_statement' && (
        <div className="space-y-6">
          {/* Income Statement Document */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
                  {isAr ? 'القوائم المالية الختامية المعتمدة' : 'Official Financial Statements'}
                </span>
                <h3 className="text-xl font-bold uppercase text-slate-900 mt-0.5">
                  {isAr ? 'قائمة الدخل والأرباح والخسائر الفعلية (Statement of Profit & Loss)' : 'Statement of Realized Profit and Loss'}
                </h3>
              </div>
              <div className="text-right font-mono text-xs text-slate-500">
                <div>{isAr ? 'الفترة:' : 'Period:'} <span className="font-bold text-slate-900">{period.startDate} ➔ {period.endDate}</span></div>
                <div>{isAr ? 'المعايير:' : 'Standard:'} <span className="font-bold text-slate-900">IFRS / GAAP Realized Actuals</span></div>
              </div>
            </div>

            {/* Income Statement Summary Ribbon */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white p-5 rounded-2xl">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">{isAr ? 'إجمالي الإيرادات الفعلية' : 'Gross Realized Revenues'}</span>
                <span className="text-xl font-bold font-mono text-emerald-400">+{formatCurrency(incomeStatement.totalRevenues)}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">{isAr ? 'إجمالي المصروفات الفعلية' : 'Total Operating Expenses'}</span>
                <span className="text-xl font-bold font-mono text-rose-400">-{formatCurrency(incomeStatement.totalExpenses)}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">{isAr ? 'صافي الربح / الفائض المالي' : 'Net Realized Profit / Margin'}</span>
                <span className={`text-xl font-bold font-mono ${incomeStatement.netIncome >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatCurrency(incomeStatement.netIncome, { showSign: true })}
                </span>
              </div>
            </div>

            {/* Revenues Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 flex items-center gap-2">
                <span>{isAr ? '1. الإيرادات والتدفقات التشغيلية المحققة (Revenues - Class 4)' : '1. Realized Revenues (Class 4)'}</span>
              </h4>
              <table className="w-full text-xs font-sans">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-2 px-3 text-center w-20">{isAr ? 'الرمز' : 'Code'}</th>
                    <th className="py-2 px-3 text-left">{isAr ? 'بند الإيراد' : 'Revenue Line Item'}</th>
                    <th className="py-2 px-3 text-right w-40">{isAr ? 'المبلغ الفعلي المستلم' : 'Realized Amount'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {incomeStatement.revenueAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-slate-500 font-sans">
                        {isAr ? 'لا توجد إيرادات مسجلة في هذه الفترة' : 'No revenues recorded in this period'}
                      </td>
                    </tr>
                  ) : (
                    incomeStatement.revenueAccounts.map((acct) => (
                      <tr key={acct.code} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-center font-bold text-slate-800 bg-slate-50/50">{acct.code}</td>
                        <td className="py-2 px-3 font-sans font-bold text-slate-900">{isAr ? acct.name : acct.nameEn}</td>
                        <td className="py-2 px-3 text-right font-bold text-emerald-700">{formatCurrency(acct.balance || acct.creditTotal)}</td>
                      </tr>
                    ))
                  )}
                  <tr className="bg-emerald-50/60 font-bold text-slate-900 border-t border-emerald-200">
                    <td colSpan={2} className="py-2.5 px-3 font-sans uppercase">{isAr ? 'مجموع الإيرادات المحققة:' : 'Total Gross Revenues:'}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-800 text-sm font-mono font-bold">
                      {formatCurrency(incomeStatement.totalRevenues)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Operating Expenses Section */}
            <div className="space-y-3 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 bg-rose-50 p-2.5 rounded-xl border border-rose-100 flex items-center gap-2">
                <span>{isAr ? '2. المصروفات التشغيلية والبنود الفعلية (Operating Expenses - Class 5)' : '2. Operating Expenses (Class 5)'}</span>
              </h4>
              <table className="w-full text-xs font-sans">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-2 px-3 text-center w-20">{isAr ? 'الرمز' : 'Code'}</th>
                    <th className="py-2 px-3 text-left">{isAr ? 'بند المصروف' : 'Expense Category'}</th>
                    <th className="py-2 px-3 text-right w-40">{isAr ? 'المبلغ الفعلي المنصرف' : 'Actual Spent'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {incomeStatement.expenseAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-slate-500 font-sans">
                        {isAr ? 'لا توجد مصروفات مسجلة في هذه الفترة' : 'No expenses recorded in this period'}
                      </td>
                    </tr>
                  ) : (
                    incomeStatement.expenseAccounts.map((acct) => (
                      <tr key={acct.code} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-center font-bold text-slate-800 bg-slate-50/50">{acct.code}</td>
                        <td className="py-2 px-3 font-sans font-bold text-slate-900">{isAr ? acct.name : acct.nameEn}</td>
                        <td className="py-2 px-3 text-right font-bold text-rose-700">{formatCurrency(acct.balance || acct.debitTotal)}</td>
                      </tr>
                    ))
                  )}
                  <tr className="bg-rose-50/60 font-bold text-slate-900 border-t border-rose-200">
                    <td colSpan={2} className="py-2.5 px-3 font-sans uppercase">{isAr ? 'مجموع المصروفات الفعلية:' : 'Total Operating Expenses:'}</td>
                    <td className="py-2.5 px-3 text-right text-rose-800 text-sm font-mono font-bold">
                      {formatCurrency(incomeStatement.totalExpenses)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bottom Line Net Income */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white p-5 rounded-2xl flex items-center justify-between font-bold text-base shadow-sm">
              <span className="uppercase">{isAr ? 'صافي الربح / الفائض المالي للفترة:' : 'Net Realized Period Income / Surplus:'}</span>
              <span className={`font-mono text-lg font-bold ${incomeStatement.netIncome >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatCurrency(incomeStatement.netIncome, { showSign: true })}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 7. TAB 5: ACCOUNTING BALANCE SHEET (الميزانية العمومية المحاسبية) */}
      {activeSubTab === 'balance_sheet' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
                  {isAr ? 'الميزانية العمومية والموقف المالي' : 'Statement of Financial Position'}
                </span>
                <h3 className="text-xl font-bold uppercase text-slate-900 mt-0.5">
                  {isAr ? 'الميزانية العمومية المعتمدة (Balance Sheet)' : 'Official Accounting Balance Sheet'}
                </h3>
              </div>
              <div className="text-right font-mono text-xs text-slate-500">
                <div>{isAr ? 'بتاريخ:' : 'As of:'} <span className="font-bold text-slate-900">{period.endDate || new Date().toISOString().split('T')[0]}</span></div>
                <div>{isAr ? 'المعادلة:' : 'Equation:'} <span className="font-bold text-slate-900">Assets = Liabilities + Equity</span></div>
              </div>
            </div>

            {/* Balance Sheet Dual Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Assets Column */}
              <div className="space-y-4 bg-slate-50/60 p-5 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-2 border-b-2 border-blue-600 flex items-center justify-between">
                  <span>{isAr ? '1. الأصول والموجودات (Assets)' : '1. Assets (Class 1)'}</span>
                  <span className="font-mono font-bold text-blue-700">{formatCurrency(accountingBalanceSheet.totalAssets)}</span>
                </h4>
                <div className="space-y-2 font-mono text-xs">
                  {accountingBalanceSheet.assetAccounts.map((a) => (
                    <div key={a.code} className="flex justify-between items-center py-1.5 border-b border-slate-200/80">
                      <span className="font-sans font-bold text-slate-800">{a.code} - {isAr ? a.name : a.nameEn}</span>
                      <span className="font-bold text-slate-900">{formatCurrency(a.balance)}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-blue-50 text-blue-950 p-3.5 rounded-xl font-bold text-xs flex justify-between border border-blue-200/80">
                  <span>{isAr ? 'إجمالي الأصول:' : 'Total Assets:'}</span>
                  <span className="font-mono font-bold text-sm text-blue-900">{formatCurrency(accountingBalanceSheet.totalAssets)}</span>
                </div>
              </div>

              {/* Liabilities & Equity Column */}
              <div className="space-y-4 bg-slate-50/60 p-5 rounded-2xl border border-slate-200">
                {/* Liabilities */}
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-2 border-b-2 border-amber-600 flex items-center justify-between">
                  <span>{isAr ? '2. الخصوم والالتزامات (Liabilities)' : '2. Liabilities (Class 2)'}</span>
                  <span className="font-mono font-bold text-amber-700">{formatCurrency(accountingBalanceSheet.totalLiabilities)}</span>
                </h4>
                <div className="space-y-2 font-mono text-xs">
                  {accountingBalanceSheet.liabilityAccounts.map((l) => (
                    <div key={l.code} className="flex justify-between items-center py-1.5 border-b border-slate-200/80">
                      <span className="font-sans font-bold text-slate-800">{l.code} - {isAr ? l.name : l.nameEn}</span>
                      <span className="font-bold text-slate-900">{formatCurrency(l.balance)}</span>
                    </div>
                  ))}
                </div>

                {/* Equity */}
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-2 border-b-2 border-purple-600 flex items-center justify-between pt-4">
                  <span>{isAr ? '3. حقوق الملكية ورأس المال (Equity)' : '3. Equity & Capital (Class 3)'}</span>
                  <span className="font-mono font-bold text-purple-700">{formatCurrency(accountingBalanceSheet.totalEquityWithRetained)}</span>
                </h4>
                <div className="space-y-2 font-mono text-xs">
                  {accountingBalanceSheet.equityAccounts.map((e) => (
                    <div key={e.code} className="flex justify-between items-center py-1.5 border-b border-slate-200/80">
                      <span className="font-sans font-bold text-slate-800">{e.code} - {isAr ? e.name : e.nameEn}</span>
                      <span className="font-bold text-slate-900">{formatCurrency(e.balance)}</span>
                    </div>
                  ))}
                  {/* Current period profit line */}
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-200/80 text-emerald-700">
                    <span className="font-sans font-bold">{isAr ? 'صافي نتيجة الفترة الحالية (أرباح/خسائر)' : 'Current Period Net Income'}</span>
                    <span className="font-bold">{formatCurrency(incomeStatement.netIncome, { showSign: true })}</span>
                  </div>
                </div>

                <div className="bg-slate-900 text-white p-3.5 rounded-xl font-bold text-xs flex justify-between">
                  <span>{isAr ? 'مجموع الخصوم وحقوق الملكية:' : 'Total Liabilities & Equity:'}</span>
                  <span className="font-mono font-bold text-sm text-emerald-400">{formatCurrency(accountingBalanceSheet.totalLiabilities + accountingBalanceSheet.totalEquityWithRetained)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW ACCOUNT MODAL */}
      {isNewAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-lg shadow-2xl p-6 space-y-4 font-arabic">
            <h3 className="text-base font-bold uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-200">
              {isAr ? 'إضافة حساب جديد إلى شجرة الحسابات' : 'Add New Account to Chart'}
            </h3>

            <form onSubmit={handleAddAccount} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                    {isAr ? 'التصنيف الرئيسي:' : 'Root Category:'}
                  </label>
                  <select
                    value={newAccountRoot}
                    onChange={(e) => setNewAccountRoot(Number(e.target.value) as any)}
                    className="w-full text-xs font-bold border border-slate-300 rounded-xl p-2.5 bg-white focus:outline-none focus:border-blue-600"
                  >
                    <option value={1}>{isAr ? '1. الأصول (Assets)' : '1. Assets'}</option>
                    <option value={2}>{isAr ? '2. الخصوم (Liabilities)' : '2. Liabilities'}</option>
                    <option value={3}>{isAr ? '3. حقوق الملكية (Equity)' : '3. Equity'}</option>
                    <option value={4}>{isAr ? '4. الإيرادات (Revenues)' : '4. Revenues'}</option>
                    <option value={5}>{isAr ? '5. المصروفات (Expenses)' : '5. Expenses'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                    {isAr ? 'رقم الحساب (مثلاً: 106):' : 'Account Code (e.g. 106):'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="106"
                    value={newAccountCode}
                    onChange={(e) => setNewAccountCode(e.target.value)}
                    className="w-full text-xs font-mono font-bold border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  {isAr ? 'اسم الحساب بالعربية:' : 'Account Name (Arabic):'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isAr ? 'حساب بنك الراجحي' : 'Account Name'}
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  className="w-full text-xs font-bold border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  {isAr ? 'اسم الحساب بالإنجليزية (اختياري):' : 'Account Name (English):'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Corporate Bank Account"
                  value={newAccountNameEn}
                  onChange={(e) => setNewAccountNameEn(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  {isAr ? 'الوصف والتفاصيل:' : 'Description:'}
                </label>
                <input
                  type="text"
                  placeholder={isAr ? 'وصف طبيعة استخدام هذا الحساب...' : 'Description...'}
                  value={newAccountDesc}
                  onChange={(e) => setNewAccountDesc(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewAccountModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-xs"
                >
                  {isAr ? 'حفظ الحساب' : 'Save Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
