import React from 'react';
import { 
  FinancialMetrics, 
  BudgetPeriod, 
  IncomeItem, 
  ExpenseCategory, 
  Transaction,
  ActiveTab 
} from '../types';
import { formatCurrency, formatPercent } from '../utils/calculations';
import { translateItemName } from '../utils/localization';
import { LanguageCode, TRANSLATIONS } from '../i18n/translations';
import { DailyBurnRateIndicator } from './DailyBurnRateIndicator';
import { 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  ArrowLeft, 
  Wallet, 
  CreditCard, 
  Activity, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  ArrowRightLeft,
  Calendar,
  Layers,
  Sparkles,
  BarChart3,
  Scale,
  Clock
} from 'lucide-react';

interface ExecutiveOverviewProps {
  metrics: FinancialMetrics;
  period: BudgetPeriod;
  incomeItems: IncomeItem[];
  categories: ExpenseCategory[];
  transactions: Transaction[];
  currentLanguage: LanguageCode;
  onNavigateTab: (tab: ActiveTab) => void;
  isEditingBeginningCash: boolean;
  setIsEditingBeginningCash: (val: boolean) => void;
  beginningCashInput: string;
  setBeginningCashInput: (val: string) => void;
  handleSaveBeginningCash: () => void;
}

export const ExecutiveOverview: React.FC<ExecutiveOverviewProps> = ({
  metrics,
  period,
  incomeItems,
  categories,
  transactions,
  currentLanguage = 'ar',
  onNavigateTab,
  isEditingBeginningCash,
  setIsEditingBeginningCash,
  beginningCashInput,
  setBeginningCashInput,
  handleSaveBeginningCash,
}) => {
  const isAr = currentLanguage === 'ar';
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  // Key Surplus Calculations
  // 1. Expected Surplus = Total Expected Income - Total Budgeted Expense
  const expectedSurplus = metrics.totalExpectedIncome - metrics.totalBudgetedExpense;
  const isExpectedSurplusPositive = expectedSurplus >= 0;
  const expectedSurplusRate = metrics.totalExpectedIncome > 0 
    ? (expectedSurplus / metrics.totalExpectedIncome) * 100 
    : 0;

  // 2. Actual Realized Surplus = Total Received Income - Total Actual Expense
  const actualSurplus = metrics.totalReceivedIncome - metrics.totalActualExpense;
  const isActualSurplusPositive = actualSurplus >= 0;
  const actualSurplusRate = metrics.totalReceivedIncome > 0 
    ? (actualSurplus / metrics.totalReceivedIncome) * 100 
    : 0;

  // Inflows Metrics
  const pendingIncome = Math.max(0, metrics.totalExpectedIncome - metrics.totalReceivedIncome);
  const collectionRate = metrics.totalExpectedIncome > 0 
    ? (metrics.totalReceivedIncome / metrics.totalExpectedIncome) * 100 
    : 0;
  const receivedItemsCount = incomeItems.filter((i) => i.isReceived).length;

  // Outflows Metrics
  const remainingBudget = Math.max(0, metrics.totalBudgetedExpense - metrics.totalActualExpense);
  const budgetUtilizationRate = metrics.totalBudgetedExpense > 0 
    ? (metrics.totalActualExpense / metrics.totalBudgetedExpense) * 100 
    : 0;
  const isUnderBudget = metrics.netExpenseVariance >= 0;

  // Cash Position
  const currentActualCash = period.startingBankBalance + actualSurplus;
  const projectedEndCash = period.startingBankBalance + expectedSurplus;

  // Sorted categories by budgeted amount for top visual breakdown
  const sortedCategories = [...categories].sort((a, b) => {
    const totalA = a.items.reduce((sum, item) => sum + item.budgeted, 0);
    const totalB = b.items.reduce((sum, item) => sum + item.budgeted, 0);
    return totalB - totalA;
  });

  return (
    <div id="executive-overview-container" className="space-y-5 font-arabic" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* 1. TOP SURPLUS & LIQUIDITY HERO SECTION (الفائض المتوقع والفائض الفعلي والرصيد) */}
      <section 
        id="surplus-hero-grid" 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        aria-label="Surplus and Cash Metrics"
      >
        {/* Card 1: الفائض المتوقع (Expected Surplus) */}
        <div 
          id="card-expected-surplus"
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                isExpectedSurplusPositive 
                  ? 'bg-blue-50 text-blue-600 border-blue-200' 
                  : 'bg-rose-50 text-rose-600 border-rose-200'
              }`}>
                <Scale className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-700 block">
                  {isAr ? 'الفائض المتوقع' : 'Expected Surplus'}
                </span>
                <span className="text-[10px] text-slate-500 font-sans">
                  {isAr ? 'الدخل المتوقع - الميزانية' : 'Income minus Budget'}
                </span>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
              isExpectedSurplusPositive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              {isExpectedSurplusPositive 
                ? (isAr ? 'فائض تخطيطي' : 'Surplus') 
                : (isAr ? 'عجز تخطيطي' : 'Deficit')}
            </span>
          </div>

          <div className="my-3.5">
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${
                isExpectedSurplusPositive ? 'text-blue-600' : 'text-rose-600'
              }`}>
                {formatCurrency(expectedSurplus, { showSign: true })}
              </span>
              {isExpectedSurplusPositive ? (
                <ArrowUpRight className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-rose-600 shrink-0" />
              )}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {isAr ? 'نسبة الفائض من الإيراد المتوقع:' : 'Surplus rate of income:'}{' '}
              <span className="font-bold text-slate-800 font-mono">{expectedSurplusRate.toFixed(1)}%</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-medium text-slate-600 border-t border-slate-100 pt-2.5">
            <span>{isAr ? 'الرصيد التقديري بنهاية الفترة:' : 'Proj. End Balance:'}</span>
            <span className="font-bold text-slate-900 font-mono">{formatCurrency(projectedEndCash)}</span>
          </div>
        </div>

        {/* Card 2: الفائض الفعلي المحقق (Actual Realized Surplus) */}
        <div 
          id="card-actual-surplus"
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                isActualSurplusPositive 
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                  : 'bg-rose-50 text-rose-600 border-rose-200'
              }`}>
                <Activity className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-700 block">
                  {isAr ? 'الفائض الفعلي (الصافي المحقق)' : 'Actual Realized Surplus'}
                </span>
                <span className="text-[10px] text-slate-500 font-sans">
                  {isAr ? 'المحصل فعلياً - المنفق فعلياً' : 'Received minus Spent'}
                </span>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
              isActualSurplusPositive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              {isActualSurplusPositive 
                ? (isAr ? 'وفر نقدي محقق' : 'Net Positive') 
                : (isAr ? 'سحب من الاحتياطي' : 'Net Outflow')}
            </span>
          </div>

          <div className="my-3.5">
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${
                isActualSurplusPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {formatCurrency(actualSurplus, { showSign: true })}
              </span>
              {isActualSurplusPositive ? (
                <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <TrendingDown className="w-4 h-4 text-rose-600 shrink-0" />
              )}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {isAr ? 'نسبة الوفر من المحصل الفعلي:' : 'Net rate of collected:'}{' '}
              <span className="font-bold text-slate-800 font-mono">{actualSurplusRate.toFixed(1)}%</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-medium text-slate-600 border-t border-slate-100 pt-2.5">
            <span>{isAr ? 'الرصيد الفعلي الحالي في البنك:' : 'Current Live Bank Cash:'}</span>
            <span className="font-bold text-emerald-700 font-mono">{formatCurrency(currentActualCash)}</span>
          </div>
        </div>

        {/* Card 3: ملخص الإيرادات الشامل (Total Inflow Summary) */}
        <div 
          id="card-inflows-overview"
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                <Wallet className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-700 block">
                  {isAr ? 'ملخص الإيرادات' : 'Inflows Overview'}
                </span>
                <span className="text-[10px] text-slate-500 font-sans">
                  {incomeItems.length} {isAr ? 'مصادر دخل' : 'Streams'}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {collectionRate.toFixed(0)}% {isAr ? 'محصل' : 'Collected'}
            </span>
          </div>

          <div className="my-3.5">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 tracking-tight">
              {formatCurrency(metrics.totalExpectedIncome)}
            </span>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
              <span>{isAr ? 'المحصل الفعلي:' : 'Received:'}</span>
              <span className="font-bold text-emerald-600 font-mono">{formatCurrency(metrics.totalReceivedIncome)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-medium text-slate-600 border-t border-slate-100 pt-2.5">
            <span>{isAr ? 'المعلق قيد التحصيل:' : 'Pending Inflow:'}</span>
            <span className="font-bold text-amber-600 font-mono">{formatCurrency(pendingIncome)}</span>
          </div>
        </div>

        {/* Card 4: ملخص المصروفات الشامل (Total Outflow Summary) */}
        <div 
          id="card-outflows-overview"
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
                <CreditCard className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-700 block">
                  {isAr ? 'ملخص المصروفات' : 'Outflows Overview'}
                </span>
                <span className="text-[10px] text-slate-500 font-sans">
                  {categories.reduce((acc, cat) => acc + cat.items.length, 0)} {isAr ? 'بنود إنفاق' : 'Expense items'}
                </span>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
              isUnderBudget
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              {budgetUtilizationRate.toFixed(0)}% {isAr ? 'مستهلك' : 'Used'}
            </span>
          </div>

          <div className="my-3.5">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 tracking-tight">
              {formatCurrency(metrics.totalBudgetedExpense)}
            </span>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
              <span>{isAr ? 'المنفق الفعلي:' : 'Actual spent:'}</span>
              <span className="font-bold text-amber-600 font-mono">{formatCurrency(metrics.totalActualExpense)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-medium text-slate-600 border-t border-slate-100 pt-2.5">
            <span>{isAr ? 'المتبقي في الميزانية:' : 'Remaining Budget:'}</span>
            <span className={`font-bold font-mono ${isUnderBudget ? 'text-emerald-600' : 'text-rose-600'}`}>
              {formatCurrency(remainingBudget)}
            </span>
          </div>
        </div>
      </section>

      {/* 2. DAILY BURN RATE & SPENDING PACE INDICATOR (تحت نظرة عامة كما هو مطلوب بدقة) */}
      <section id="overview-daily-burn-indicator" aria-label="Daily Expense Velocity">
        <DailyBurnRateIndicator
          metrics={metrics}
          period={period}
          currentLanguage={currentLanguage}
        />
      </section>

      {/* 3. PROMINENT CASH FLOW & BEGINNING CASH BAR (شريط رصيد البداية والسيولة النقدية) */}
      <section 
        id="cash-liquidity-bar"
        className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm"
        aria-label="Beginning Cash and Cash Flow Projection"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {isAr ? 'موقف السيولة ورصيد الخزينة والحساب البنكي' : 'Cash Flow & Liquid Reserves Position'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isAr 
                  ? 'رصيد بداية الشهر، التدفقات المتوقعة، وصافي السيولة المتبقية' 
                  : 'Starting cash, forecasted inflows & outflows, and net period cash flow'}
              </p>
            </div>
          </div>

          {/* Direct action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onNavigateTab('breakdown')}
              className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <PieChart className="w-3.5 h-3.5" />
              <span>{isAr ? 'عرض جدول الموازنة مقابل الفعلي' : 'View Budget vs Actual'}</span>
            </button>
            <button
              onClick={() => onNavigateTab('cashflow')}
              className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              <span>{isAr ? 'توقعات التدفق النقدي' : 'Cash Projections'}</span>
            </button>
          </div>
        </div>

        {/* 4-Step Cash Flow Equation Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-1">
          {/* Step 1: Beginning Available Cash */}
          <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                {isAr ? '1. رصيد بداية الشهر' : '1. Starting Cash'}
              </span>
              {!isEditingBeginningCash && (
                <button
                  onClick={() => {
                    setBeginningCashInput(period.startingBankBalance.toString());
                    setIsEditingBeginningCash(true);
                  }}
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-700 underline cursor-pointer"
                >
                  {isAr ? 'تعديل' : 'Edit'}
                </button>
              )}
            </div>

            {isEditingBeginningCash ? (
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="number"
                  step="any"
                  value={beginningCashInput}
                  onChange={(e) => setBeginningCashInput(e.target.value)}
                  className="w-28 px-2.5 py-1 bg-white border border-blue-500 rounded-xl text-slate-900 font-mono text-sm font-bold focus:outline-none shadow-2xs"
                  autoFocus
                />
                <button
                  onClick={handleSaveBeginningCash}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-xl uppercase transition-all shadow-xs"
                >
                  {isAr ? 'حفظ' : 'Save'}
                </button>
                <button
                  onClick={() => setIsEditingBeginningCash(false)}
                  className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-[10px] font-bold text-slate-700 rounded-xl transition-all"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                {formatCurrency(period.startingBankBalance)}
              </div>
            )}
            <span className="text-[10px] text-slate-500 block">{isAr ? 'الاحتياطي النقدي الافتتاحي' : 'Initial liquid reserves'}</span>
          </div>

          {/* Step 2: Total Revenue Inflow */}
          <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
              {isAr ? '2. (+) الإيرادات المتوقعة' : '2. (+) Expected Inflows'}
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">
              +{formatCurrency(metrics.totalExpectedIncome)}
            </div>
            <span className="text-[10px] text-slate-500 block">
              {isAr ? `محصل فعلياً: ${formatCurrency(metrics.totalReceivedIncome)}` : `Actual received: ${formatCurrency(metrics.totalReceivedIncome)}`}
            </span>
          </div>

          {/* Step 3: Total Budgeted Outflow */}
          <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">
              {isAr ? '3. (-) المصروفات المعتمدة' : '3. (-) Budgeted Outflows'}
            </span>
            <div className="text-xl sm:text-2xl font-black text-rose-600 font-mono">
              -{formatCurrency(metrics.totalBudgetedExpense)}
            </div>
            <span className="text-[10px] text-slate-500 block">
              {isAr ? `منفق فعلياً: ${formatCurrency(metrics.totalActualExpense)}` : `Actual spent: ${formatCurrency(metrics.totalActualExpense)}`}
            </span>
          </div>

          {/* Step 4: Projected Month-End Cash Balance */}
          <div className="bg-slate-50/80 rounded-xl p-4 border border-blue-200 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
              {isAr ? '4. (=) الرصيد المقدر بنهاية الشهر' : '4. (=) Projected Ending Cash'}
            </span>
            <div className="text-xl sm:text-2xl font-black text-blue-600 font-mono">
              {formatCurrency(projectedEndCash)}
            </div>
            <span className={`text-[10px] font-bold block ${expectedSurplus >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {isAr ? 'صافي تدفق الفترة:' : 'Net Period Flow:'} {formatCurrency(expectedSurplus, { showSign: true })}
            </span>
          </div>
        </div>
      </section>

      {/* 4. DUAL ALLOCATION & INFLOW/OUTFLOW VISUAL SUMMARY */}
      <section 
        id="overview-breakdown-panels" 
        className="grid grid-cols-1 lg:grid-cols-12 gap-5"
        aria-label="Distribution and Quick Details"
      >
        {/* Left Column: Top Expense Categories Allocation */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                {isAr ? 'توزيع الميزانية والإنفاق حسب فئات المصروفات' : 'Expense Category Allocation & Spending'}
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('breakdown')}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              {isAr ? 'التفاصيل كاملة ←' : 'View Full Breakdown →'}
            </button>
          </div>

          <div className="space-y-3">
            {sortedCategories.slice(0, 5).map((cat) => {
              const catBudgeted = cat.items.reduce((sum, it) => sum + it.budgeted, 0);
              const catActual = cat.items.reduce((sum, it) => sum + it.actual, 0);
              const catPercent = metrics.totalBudgetedExpense > 0 
                ? (catBudgeted / metrics.totalBudgetedExpense) * 100 
                : 0;
              const catSpentPercent = catBudgeted > 0 ? (catActual / catBudgeted) * 100 : 0;

              return (
                <div key={cat.id} className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full shrink-0" 
                        style={{ backgroundColor: cat.color || '#2563eb' }}
                      />
                      <span className="font-bold text-slate-800">
                        {translateItemName(cat.name, currentLanguage)}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        ({cat.items.length} {isAr ? 'بنود' : 'items'})
                      </span>
                    </div>

                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-slate-500 text-[11px]">
                        {isAr ? 'الميزانية:' : 'Budget:'}{' '}
                        <strong className="text-slate-900">{formatCurrency(catBudgeted)}</strong>
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        {isAr ? 'المنفق:' : 'Spent:'}{' '}
                        <strong className={catActual > catBudgeted ? 'text-rose-600' : 'text-emerald-600'}>
                          {formatCurrency(catActual)}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          catActual > catBudgeted ? 'bg-rose-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${Math.min(100, catSpentPercent)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>{catPercent.toFixed(1)}% {isAr ? 'من إجمالي الميزانية' : 'of Total Budget'}</span>
                      <span className={catActual > catBudgeted ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                        {catSpentPercent.toFixed(1)}% {isAr ? 'مستهلك من الفئة' : 'used'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Inflows Quick Summary & Status */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  {isAr ? 'حالة مصادر الإيرادات الشهرية' : 'Income Streams & Collection Status'}
                </h3>
              </div>
              <span className="text-[10px] font-bold text-slate-500 font-mono">
                {receivedItemsCount}/{incomeItems.length} {isAr ? 'محصل' : 'Collected'}
              </span>
            </div>

            <div className="space-y-2.5 mt-3">
              {incomeItems.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span>{item.name}</span>
                      {item.isReceived ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {isAr ? 'المتوقع:' : 'Expected:'}{' '}
                      <span className="font-mono font-bold text-slate-700">{formatCurrency(item.expectedAmount)}</span>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      item.isReceived 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {item.isReceived ? (isAr ? 'تم التحصيل' : 'Received') : (isAr ? 'معلق' : 'Pending')}
                    </span>
                    <div className="text-xs font-bold text-slate-900 mt-1">
                      {formatCurrency(item.receivedAmount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Action to Budget vs Actual Table */}
          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={() => onNavigateTab('breakdown')}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <span>{isAr ? 'الانتقال إلى جدول الإيرادات والمصروفات التفصيلي' : 'Open Full Budget vs Actual Tables'}</span>
              {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
