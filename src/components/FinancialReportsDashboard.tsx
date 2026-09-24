import React, { useState, useMemo } from 'react';
import {
  BudgetPeriod,
  CurrencyInfo,
  ExpenseCategory,
  FinancialMetrics,
  IncomeItem,
  Transaction,
} from '../types';
import { formatCurrency, formatPercent } from '../utils/calculations';
import { translateItemName } from '../utils/localization';
import { LanguageCode } from '../i18n/translations';
import { CashFlowPeriodComparison } from './CashFlowPeriodComparison';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  FileText,
  Calendar,
  Filter,
  Download,
  Printer,
  TrendingUp,
  TrendingDown,
  PieChart as PieIcon,
  BarChart3,
  Scale,
  Wallet,
  CreditCard,
  Layers,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRightLeft,
  Search,
  Eye,
} from 'lucide-react';

interface FinancialReportsDashboardProps {
  period: BudgetPeriod;
  incomeItems: IncomeItem[];
  categories: ExpenseCategory[];
  transactions: Transaction[];
  metrics: FinancialMetrics;
  currentLanguage?: LanguageCode;
  currentCurrency?: CurrencyInfo;
  onOpenStatementsModal?: () => void;
}

export type ReportViewMode = 'dashboard' | 'statements' | 'comparison' | 'ledger';

const DEFAULT_CATEGORY_COLORS = [
  '#2563eb', // Blue
  '#0d9488', // Teal
  '#f59e0b', // Amber
  '#e11d48', // Rose
  '#7c3aed', // Purple
  '#059669', // Emerald
  '#ea580c', // Orange
  '#0284c7', // Sky
  '#4f46e5', // Indigo
  '#64748b', // Slate
];

export const FinancialReportsDashboard: React.FC<FinancialReportsDashboardProps> = ({
  period,
  incomeItems,
  categories,
  transactions,
  metrics,
  currentLanguage = 'ar',
  currentCurrency,
  onOpenStatementsModal,
}) => {
  const isAr = currentLanguage === 'ar';

  // Active View Mode inside Reports: 'dashboard' (Charts & Circle) | 'statements' (P&L & Cash Flow) | 'comparison' | 'ledger'
  const [activeViewMode, setActiveViewMode] = useState<ReportViewMode>('dashboard');

  // Active hover category in Pie Chart
  const [hoveredCategoryIndex, setHoveredCategoryIndex] = useState<number | null>(null);
  const [selectedCategoryDrilldown, setSelectedCategoryDrilldown] = useState<string | null>(null);

  // Filter Date State
  const defaultStart = period.startDate || `${period.year}-${String(period.month).padStart(2, '0')}-01`;
  const defaultEnd =
    period.endDate ||
    `${period.year}-${String(period.month).padStart(2, '0')}-${String(period.totalDays || 30).padStart(2, '0')}`;

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);

  // Selected Category filter
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    categories.map((c) => c.id)
  );

  // Toggle Category selection
  const handleToggleCategory = (catId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const handleSelectAllCategories = () => {
    if (selectedCategoryIds.length === categories.length) {
      setSelectedCategoryIds([]);
    } else {
      setSelectedCategoryIds(categories.map((c) => c.id));
    }
  };

  // Filtered categories and calculations
  const filteredCategories = useMemo(() => {
    return categories.filter((c) => selectedCategoryIds.includes(c.id));
  }, [categories, selectedCategoryIds]);

  // Aggregate Data for Circle of Expenses (Donut Chart)
  const expensePieData = useMemo(() => {
    return filteredCategories.map((cat, idx) => {
      const totalBudgeted = cat.items.reduce((s, it) => s + (it.budgeted || 0), 0);
      const totalActual = cat.items.reduce((s, it) => s + (it.actual || 0), 0);
      return {
        id: cat.id,
        name: translateItemName(cat.name, currentLanguage),
        rawName: cat.name,
        value: totalActual > 0 ? totalActual : totalBudgeted, // prioritize actual spend, fallback to budgeted
        actual: totalActual,
        budgeted: totalBudgeted,
        variance: totalBudgeted - totalActual,
        color: cat.color || DEFAULT_CATEGORY_COLORS[idx % DEFAULT_CATEGORY_COLORS.length],
        itemsCount: cat.items.length,
        items: cat.items,
      };
    }).filter((d) => d.value > 0);
  }, [filteredCategories, currentLanguage]);

  const totalPieExpense = useMemo(() => {
    return expensePieData.reduce((sum, d) => sum + d.actual, 0) ||
      expensePieData.reduce((sum, d) => sum + d.budgeted, 0);
  }, [expensePieData]);

  // Budget vs Actual Comparison Data for Bar Chart
  const budgetVsActualData = useMemo(() => {
    return filteredCategories.map((cat, idx) => {
      const budgeted = cat.items.reduce((s, it) => s + (it.budgeted || 0), 0);
      const actual = cat.items.reduce((s, it) => s + (it.actual || 0), 0);
      const variance = budgeted - actual;
      return {
        name: translateItemName(cat.name, currentLanguage),
        budgeted,
        actual,
        variance,
        isOverBudget: actual > budgeted,
        color: cat.color || DEFAULT_CATEGORY_COLORS[idx % DEFAULT_CATEGORY_COLORS.length],
      };
    });
  }, [filteredCategories, currentLanguage]);

  // Fixed vs Variable Expense Breakdown
  const fixedVsVariableData = useMemo(() => {
    let fixedTotal = 0;
    let variableTotal = 0;

    filteredCategories.forEach((cat) => {
      cat.items.forEach((it) => {
        if (it.isFixed) {
          fixedTotal += it.actual || it.budgeted;
        } else {
          variableTotal += it.actual || it.budgeted;
        }
      });
    });

    const total = fixedTotal + variableTotal;
    return {
      fixedTotal,
      variableTotal,
      fixedPercent: total > 0 ? (fixedTotal / total) * 100 : 0,
      variablePercent: total > 0 ? (variableTotal / total) * 100 : 0,
    };
  }, [filteredCategories]);

  // Macro Totals
  const totalReceivedIncome = incomeItems.reduce((s, i) => s + (i.isReceived ? i.receivedAmount : 0), 0);
  const totalExpectedIncome = incomeItems.reduce((s, i) => s + i.expectedAmount, 0);
  const totalBudgetedExpense = filteredCategories.reduce(
    (sum, c) => sum + c.items.reduce((s, it) => s + it.budgeted, 0),
    0
  );
  const totalActualExpense = filteredCategories.reduce(
    (sum, c) => sum + c.items.reduce((s, it) => s + it.actual, 0),
    0
  );

  const netRealizedProfit = totalReceivedIncome - totalActualExpense;
  const netExpectedSurplus = totalExpectedIncome - totalBudgetedExpense;
  const realizationRate = totalExpectedIncome > 0 ? (totalReceivedIncome / totalExpectedIncome) * 100 : 0;
  const budgetUtilization = totalBudgetedExpense > 0 ? (totalActualExpense / totalBudgetedExpense) * 100 : 0;

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Export CSV function
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += `Executive Financial Report - ${period.label}\n`;
    csvContent += `Date Range: ${startDate} to ${endDate}\n\n`;

    csvContent += '--- EXPENSE CATEGORY ALLOCATION ---\n';
    csvContent += 'Category,Budgeted,Actual,Variance,Utilization %\n';
    filteredCategories.forEach((cat) => {
      const b = cat.items.reduce((s, it) => s + it.budgeted, 0);
      const a = cat.items.reduce((s, it) => s + it.actual, 0);
      const util = b > 0 ? ((a / b) * 100).toFixed(1) : '0.0';
      csvContent += `"${cat.name}",${b},${a},${b - a},${util}%\n`;
    });

    csvContent += '\n--- INCOME REALIZATION ---\n';
    csvContent += 'Source,Expected,Received,Status\n';
    incomeItems.forEach((i) => {
      csvContent += `"${i.name}",${i.expectedAmount},${i.receivedAmount},${i.isReceived ? 'Received' : 'Pending'}\n`;
    });

    csvContent += `\nTotal Expected Income,${totalExpectedIncome}\n`;
    csvContent += `Total Received Income,${totalReceivedIncome}\n`;
    csvContent += `Total Budgeted Expense,${totalBudgetedExpense}\n`;
    csvContent += `Total Actual Expense,${totalActualExpense}\n`;
    csvContent += `Net Realized Profit,${netRealizedProfit}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `financial-report-dashboard-${period.label.replace(/\s+/g, '-').toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Selected drill-down category details
  const activeDrilldownCategory = useMemo(() => {
    if (!selectedCategoryDrilldown) return null;
    return categories.find((c) => c.id === selectedCategoryDrilldown) || null;
  }, [categories, selectedCategoryDrilldown]);

  return (
    <div id="financial-reports-dashboard" className="space-y-6 font-arabic" dir={isAr ? 'rtl' : 'ltr'}>
      {/* 1. TOP HEADER & VIEW MODE SELECTOR */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
              <PieIcon className="w-6 h-6" strokeWidth={1.75} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900">
                  {isAr ? 'لوحة التقارير والمخططات المالية الشاملة' : 'Executive Financial Reports & Analytics'}
                </h1>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {period.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                {isAr
                  ? 'دائرة المصروفات التفاعلية، تحليل مقارنة الميزانية بالفعلي، وقوائم الأرباح والتدفق النقدي'
                  : 'Interactive Expense Circle, Budget vs Actual variance charts, and official statements'}
              </p>
            </div>
          </div>

          {/* Action Tools: Print & CSV Export */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>{isAr ? 'طباعة التقرير' : 'Print Report'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>{isAr ? 'تصدير CSV / Excel' : 'Export Data'}</span>
            </button>

            {onOpenStatementsModal && (
              <button
                onClick={onOpenStatementsModal}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{isAr ? 'القوائم المالية والتدقيق' : 'Financial Statements'}</span>
              </button>
            )}
          </div>
        </div>

        {/* View Mode Navigation Pills */}
        <div className="flex items-center gap-2 border-t border-slate-100 pt-3 overflow-x-auto">
          <button
            onClick={() => setActiveViewMode('dashboard')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeViewMode === 'dashboard'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>{isAr ? 'لوحة المخططات ودائرة المصروفات' : 'Analytics & Expense Circle'}</span>
          </button>

          <button
            onClick={() => setActiveViewMode('comparison')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeViewMode === 'comparison'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>{isAr ? 'مقارنة الفترات والتدفق النقدي' : 'Period Cash Flow Comparison'}</span>
          </button>

          <button
            onClick={() => setActiveViewMode('statements')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeViewMode === 'statements'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isAr ? 'القوائم المالية المعتمدة (P&L)' : 'Financial Statements (P&L)'}</span>
          </button>
        </div>
      </div>

      {/* 2. TAB CONTENT 1: DASHBOARD (CHARTS & CIRCLE OF EXPENSES) */}
      {activeViewMode === 'dashboard' && (
        <div className="space-y-6">
          {/* Executive KPI Metric Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Realized Inflows */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">{isAr ? 'الدخل المحصل الفعلي' : 'Realized Inflows'}</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="my-3">
                <span className="text-2xl font-extrabold text-slate-900 font-mono">
                  {formatCurrency(totalReceivedIncome)}
                </span>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                  <span>{isAr ? 'من أصل متوقع:' : 'Of expected:'}</span>
                  <span className="font-bold text-slate-700 font-mono">{formatCurrency(totalExpectedIncome)}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">{isAr ? 'نسبة التحصيل:' : 'Realization:'}</span>
                <span className="font-bold text-emerald-700 font-mono">{realizationRate.toFixed(1)}%</span>
              </div>
            </div>

            {/* Card 2: Actual Outflows */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">{isAr ? 'المنصرف الفعلي' : 'Actual Outflows'}</span>
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4" />
                </div>
              </div>
              <div className="my-3">
                <span className="text-2xl font-extrabold text-slate-900 font-mono">
                  {formatCurrency(totalActualExpense)}
                </span>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                  <span>{isAr ? 'الميزانية المعتمدة:' : 'Budgeted:'}</span>
                  <span className="font-bold text-slate-700 font-mono">{formatCurrency(totalBudgetedExpense)}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">{isAr ? 'استهلاك الميزانية:' : 'Budget burn:'}</span>
                <span className={`font-bold font-mono ${totalActualExpense > totalBudgetedExpense ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {budgetUtilization.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Card 3: Net Realized Profit */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">{isAr ? 'صافي الفائض المحقق' : 'Net Realized Surplus'}</span>
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${
                  netRealizedProfit >= 0
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    : 'bg-rose-50 text-rose-600 border-rose-200'
                }`}>
                  <Scale className="w-4 h-4" />
                </div>
              </div>
              <div className="my-3">
                <span className={`text-2xl font-extrabold font-mono ${
                  netRealizedProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {formatCurrency(netRealizedProfit, { showSign: true })}
                </span>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                  <span>{isAr ? 'الفائض التخطيطي:' : 'Budgeted surplus:'}</span>
                  <span className="font-bold text-slate-700 font-mono">{formatCurrency(netExpectedSurplus, { showSign: true })}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">{isAr ? 'نسبة الوفر من الدخل:' : 'Surplus margin:'}</span>
                <span className="font-bold text-slate-800 font-mono">
                  {totalReceivedIncome > 0 ? `${((netRealizedProfit / totalReceivedIncome) * 100).toFixed(1)}%` : '0.0%'}
                </span>
              </div>
            </div>

            {/* Card 4: Fixed vs Variable Outflow */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">{isAr ? 'هيكل المصروفات' : 'Expense Structure'}</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="my-3">
                <div className="flex items-center justify-between text-xs font-mono font-bold">
                  <span className="text-blue-700">{isAr ? 'ثابتة:' : 'Fixed:'} {fixedVsVariableData.fixedPercent.toFixed(0)}%</span>
                  <span className="text-amber-700">{isAr ? 'متغيرة:' : 'Variable:'} {fixedVsVariableData.variablePercent.toFixed(0)}%</span>
                </div>
                {/* Visual mini-bar */}
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex mt-2">
                  <div
                    className="h-full bg-blue-600 transition-all"
                    style={{ width: `${fixedVsVariableData.fixedPercent}%` }}
                    title={`Fixed: ${formatCurrency(fixedVsVariableData.fixedTotal)}`}
                  />
                  <div
                    className="h-full bg-amber-500 transition-all"
                    style={{ width: `${fixedVsVariableData.variablePercent}%` }}
                    title={`Variable: ${formatCurrency(fixedVsVariableData.variableTotal)}`}
                  />
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-600">
                <span>{formatCurrency(fixedVsVariableData.fixedTotal)}</span>
                <span>{formatCurrency(fixedVsVariableData.variableTotal)}</span>
              </div>
            </div>
          </div>

          {/* MAIN VISUAL SECTION: 1. CIRCLE OF EXPENSES (DONUT) + DRILLDOWN */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Box: The Circle of Expenses Donut Chart */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
                    <PieIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {isAr ? 'دائرة المصروفات والنسب المئوية (Circle of Expenses)' : 'Circle of Expenses & Category Distribution'}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-sans">
                      {isAr ? 'توزيع الإنفاق الفعلي عبر الفئات مع إمكانية المعاينة' : 'Category allocation breakdown with interactive slices'}
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-bold font-mono text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                  {expensePieData.length} {isAr ? 'فئات' : 'Categories'}
                </span>
              </div>

              {/* Responsive Donut Chart with Center Text */}
              <div className="relative h-72 sm:h-80 w-full flex items-center justify-center my-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const percent = totalPieExpense > 0 ? (data.actual / totalPieExpense) * 100 : 0;
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1 font-arabic z-50">
                              <div className="font-bold flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
                                <span>{data.name}</span>
                              </div>
                              <div className="text-slate-300 font-mono">
                                {isAr ? 'المنصرف الفعلي:' : 'Actual Spent:'}{' '}
                                <strong className="text-emerald-400 font-bold">{formatCurrency(data.actual)}</strong>
                              </div>
                              <div className="text-slate-300 font-mono">
                                {isAr ? 'الميزانية المعتمدة:' : 'Budgeted:'}{' '}
                                <span className="text-slate-200">{formatCurrency(data.budgeted)}</span>
                              </div>
                              <div className="text-[11px] text-blue-300 pt-1 border-t border-slate-800 font-mono">
                                {isAr ? 'النسبة من الإجمالي:' : 'Share of Total:'} {percent.toFixed(1)}%
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Pie
                      data={expensePieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={105}
                      paddingAngle={3}
                      onMouseEnter={(_, index) => setHoveredCategoryIndex(index)}
                      onMouseLeave={() => setHoveredCategoryIndex(null)}
                      onClick={(data: any) => {
                        const targetId = data?.id || data?.payload?.id;
                        if (targetId) setSelectedCategoryDrilldown(targetId);
                      }}
                      cursor="pointer"
                    >
                      {expensePieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke="#ffffff"
                          strokeWidth={hoveredCategoryIndex === index ? 3 : 1.5}
                          className="transition-all duration-200 hover:opacity-90"
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Center Badge with Total Expense */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    {isAr ? 'إجمالي المنصرف' : 'Total Expense'}
                  </span>
                  <span className="text-base sm:text-lg font-black font-mono text-slate-900">
                    {formatCurrency(totalPieExpense)}
                  </span>
                  <span className="text-[9px] text-slate-500 font-sans mt-0.5">
                    {isAr ? 'اضغط للمعاينة' : 'Click to filter'}
                  </span>
                </div>
              </div>

              {/* Color Legend Chips Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                {expensePieData.map((item, idx) => {
                  const pct = totalPieExpense > 0 ? (item.actual / totalPieExpense) * 100 : 0;
                  const isSelected = selectedCategoryDrilldown === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedCategoryDrilldown(isSelected ? null : item.id)}
                      className={`flex items-center gap-1.5 p-2 rounded-xl border text-xs text-left transition-all ${
                        isSelected
                          ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20'
                          : 'bg-slate-50/80 border-slate-200/80 hover:bg-slate-100'
                      }`}
                    >
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <div className="truncate flex-1">
                        <span className="font-bold text-slate-800 truncate block text-[11px]">{item.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{pct.toFixed(0)}%</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Box: Category Breakdown Matrix / Selected Category Drilldown */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    {activeDrilldownCategory
                      ? isAr
                        ? `تفاصيل بنود: ${translateItemName(activeDrilldownCategory.name, currentLanguage)}`
                        : `Items inside: ${activeDrilldownCategory.name}`
                      : isAr
                      ? 'قائمة الفئات والمقارنة السريعة'
                      : 'Category Breakdown & Quick Analysis'}
                  </h3>
                </div>

                {activeDrilldownCategory && (
                  <button
                    onClick={() => setSelectedCategoryDrilldown(null)}
                    className="text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    {isAr ? 'عرض كافة الفئات ✕' : 'Show all ✕'}
                  </button>
                )}
              </div>

              {/* If a category is clicked for drilldown */}
              {activeDrilldownCategory ? (
                <div className="space-y-3 flex-1 overflow-y-auto max-h-80 pr-1">
                  <div className="bg-blue-50/80 p-3 rounded-xl border border-blue-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-blue-900 block">{translateItemName(activeDrilldownCategory.name, currentLanguage)}</span>
                      <span className="text-[10px] text-blue-700">{activeDrilldownCategory.items.length} {isAr ? 'بنود فرعية' : 'items'}</span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-[10px] text-slate-500 block">{isAr ? 'إجمالي المنصرف:' : 'Total Spent:'}</span>
                      <span className="font-bold text-slate-900">
                        {formatCurrency(activeDrilldownCategory.items.reduce((s, it) => s + it.actual, 0))}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {activeDrilldownCategory.items.map((item) => {
                      const variance = item.budgeted - item.actual;
                      const pct = item.budgeted > 0 ? (item.actual / item.budgeted) * 100 : 0;
                      return (
                        <div key={item.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-800">{translateItemName(item.name, currentLanguage)}</span>
                            <div className="flex items-center gap-2 font-mono">
                              <span className="text-slate-500 text-[11px]">{formatCurrency(item.budgeted)}</span>
                              <span>➔</span>
                              <strong className={item.actual > item.budgeted ? 'text-rose-600' : 'text-slate-900'}>
                                {formatCurrency(item.actual)}
                              </strong>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="space-y-1">
                            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  item.actual > item.budgeted ? 'bg-rose-500' : 'bg-blue-600'
                                }`}
                                style={{ width: `${Math.min(100, pct)}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                              <span>{pct.toFixed(0)}% {isAr ? 'مستهلك' : 'used'}</span>
                              <span className={variance >= 0 ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                                {isAr ? 'الفارق:' : 'Var:'} {formatCurrency(variance, { showSign: true })}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Default List: Top 6 Categories with comparative bars */
                <div className="space-y-3 flex-1 overflow-y-auto max-h-80 pr-1">
                  {expensePieData.map((cat) => {
                    const pctOfBudget = cat.budgeted > 0 ? (cat.actual / cat.budgeted) * 100 : 0;
                    const pctOfTotal = totalPieExpense > 0 ? (cat.actual / totalPieExpense) * 100 : 0;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => setSelectedCategoryDrilldown(cat.id)}
                        className="bg-slate-50/80 hover:bg-blue-50/50 p-3 rounded-xl border border-slate-200/80 cursor-pointer transition-all space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                            <span className="font-bold text-slate-800">{cat.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">({cat.itemsCount})</span>
                          </div>

                          <div className="flex items-center gap-2.5 font-mono text-[11px]">
                            <span className="text-slate-500">
                              {isAr ? 'المعتمد:' : 'Budget:'} <strong>{formatCurrency(cat.budgeted)}</strong>
                            </span>
                            <span className={cat.actual > cat.budgeted ? 'text-rose-600 font-bold' : 'text-slate-900 font-bold'}>
                              {isAr ? 'الفعلي:' : 'Actual:'} {formatCurrency(cat.actual)}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                cat.actual > cat.budgeted ? 'bg-rose-500' : 'bg-blue-600'
                              }`}
                              style={{ width: `${Math.min(100, pctOfBudget)}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                            <span>{pctOfTotal.toFixed(1)}% {isAr ? 'من إجمالي المصروفات' : 'of total expense'}</span>
                            <span className={cat.actual > cat.budgeted ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                              {pctOfBudget.toFixed(1)}% {isAr ? 'مستهلك من الميزانية' : 'used'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                <span>{isAr ? 'انقر على أي فئة للتعمق في بنودها الفرعية' : 'Click any category to drill into items'}</span>
                <span className="font-bold text-blue-600 font-mono">{filteredCategories.length} {isAr ? 'فئات مفلترة' : 'Active'}</span>
              </div>
            </div>
          </div>

          {/* MAIN VISUAL SECTION: 2. BUDGET VS ACTUAL BAR COMPARISON CHART */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {isAr ? 'مخطط مقارنة الميزانية المعتمدة بالمنصرف الفعلي (Budget vs Actual Variance)' : 'Budget vs Actual Performance by Category'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-sans">
                    {isAr ? 'مقارنة مباشرة بين المخصصات التقديرية والصرف الحقيقي لتحديد بنود التجاوز والوفر' : 'Direct variance comparison to identify overspending & savings'}
                  </p>
                </div>
              </div>

              {/* Legend Indicator */}
              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-blue-600" />
                  <span className="text-slate-600">{isAr ? 'الميزانية المعتمدة' : 'Budgeted'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-emerald-600" />
                  <span className="text-slate-600">{isAr ? 'المنصرف الفعلي' : 'Actual Spent'}</span>
                </div>
              </div>
            </div>

            {/* Responsive Bar Chart */}
            <div className="h-72 sm:h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetVsActualData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#475569' }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    height={45}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#475569' }}
                    tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const bVal = Number(payload[0]?.value || 0);
                        const aVal = Number(payload[1]?.value || 0);
                        const varVal = bVal - aVal;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1 font-arabic">
                            <div className="font-bold text-slate-100">{label}</div>
                            <div className="text-blue-300 font-mono">
                              {isAr ? 'الميزانية المعتمدة:' : 'Budgeted:'} {formatCurrency(bVal)}
                            </div>
                            <div className="text-emerald-400 font-mono">
                              {isAr ? 'المنصرف الفعلي:' : 'Actual:'} {formatCurrency(aVal)}
                            </div>
                            <div className={`text-[11px] pt-1 border-t border-slate-800 font-mono font-bold ${
                              varVal >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}>
                              {isAr ? 'الفارق (وفر/عجز):' : 'Variance:'} {formatCurrency(varVal, { showSign: true })}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="budgeted" name={isAr ? 'الميزانية' : 'Budget'} fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="actual" name={isAr ? 'الفعلي' : 'Actual'} fill="#059669" radius={[6, 6, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB CONTENT 2: CASH FLOW PERIOD COMPARISON */}
      {activeViewMode === 'comparison' && (
        <CashFlowPeriodComparison
          period={period}
          transactions={transactions}
          incomeItems={incomeItems}
          categories={categories}
          metrics={metrics}
          currentLanguage={currentLanguage}
          currentCurrency={currentCurrency}
        />
      )}

      {/* 4. TAB CONTENT 3: OFFICIAL FINANCIAL STATEMENTS (P&L & CASH FLOW) */}
      {activeViewMode === 'statements' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
                {isAr ? 'قائمة الدخل والأرباح والخسائر المعتمدة' : 'Official Statement of Profit & Loss'}
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                {isAr ? 'قائمة الأداء المالي والنتيجة التشغيلية (P&L)' : 'Statement of Financial Performance (P&L)'}
              </h3>
            </div>
            <div className="text-right font-mono text-xs text-slate-500">
              <div>{isAr ? 'الفترة:' : 'Period:'} <span className="font-bold text-slate-800">{period.label}</span></div>
            </div>
          </div>

          {/* Statement KPI Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900 text-white p-4 rounded-xl">
            <div>
              <span className="text-[10px] font-medium text-slate-400 block">{isAr ? 'إجمالي الإيراد' : 'Total Revenue'}</span>
              <span className="text-lg font-bold font-mono text-emerald-400">+{formatCurrency(totalReceivedIncome)}</span>
            </div>
            <div>
              <span className="text-[10px] font-medium text-slate-400 block">{isAr ? 'إجمالي المصروف' : 'Total Expense'}</span>
              <span className="text-lg font-bold font-mono text-rose-400">-{formatCurrency(totalActualExpense)}</span>
            </div>
            <div>
              <span className="text-[10px] font-medium text-slate-400 block">{isAr ? 'صافي النتيجة' : 'Net Surplus'}</span>
              <span className={`text-lg font-bold font-mono ${netRealizedProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatCurrency(netRealizedProfit, { showSign: true })}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-medium text-slate-400 block">{isAr ? 'وفر الميزانية' : 'Budget Variance'}</span>
              <span className="text-lg font-bold font-mono text-blue-300">
                {formatCurrency(totalBudgetedExpense - totalActualExpense, { showSign: true })}
              </span>
            </div>
          </div>

          {/* Incomes Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 bg-slate-50 p-2.5 rounded-lg border-r-4 rtl:border-r-4 rtl:border-l-0 ltr:border-l-4 ltr:border-r-0 border-emerald-600">
              {isAr ? '1. الإيرادات والتدفقات الداخلة (Revenues)' : '1. Revenues & Inflows'}
            </h4>
            <table className="w-full text-xs font-sans">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="py-2 text-left">{isAr ? 'مصدر الإيراد' : 'Source'}</th>
                  <th className="py-2 text-right">{isAr ? 'المتوقع' : 'Expected'}</th>
                  <th className="py-2 text-right">{isAr ? 'المستلم الفعلي' : 'Realized'}</th>
                  <th className="py-2 text-right">{isAr ? 'نسبة التحصيل' : 'Realization %'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {incomeItems.map((item) => {
                  const percent = item.expectedAmount > 0 ? (item.receivedAmount / item.expectedAmount) * 100 : 0;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 font-sans font-medium text-slate-900">{item.name}</td>
                      <td className="py-2 text-right text-slate-600">{formatCurrency(item.expectedAmount)}</td>
                      <td className="py-2 text-right font-bold text-emerald-700">{formatCurrency(item.receivedAmount)}</td>
                      <td className="py-2 text-right">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          percent >= 100 ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                        }`}>
                          {percent.toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Expenses Table */}
          <div className="space-y-3 pt-4">
            <h4 className="text-xs font-bold text-slate-800 bg-slate-50 p-2.5 rounded-lg border-r-4 rtl:border-r-4 rtl:border-l-0 ltr:border-l-4 ltr:border-r-0 border-rose-600">
              {isAr ? '2. المصروفات التشغيلية والبنود (Expenses)' : '2. Operating Expenses & Line Items'}
            </h4>
            <table className="w-full text-xs font-sans">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="py-2 text-left">{isAr ? 'الفئة / البند' : 'Category / Item'}</th>
                  <th className="py-2 text-right">{isAr ? 'الميزانية المعتمدة' : 'Budgeted'}</th>
                  <th className="py-2 text-right">{isAr ? 'المنصرف الفعلي' : 'Actual Spent'}</th>
                  <th className="py-2 text-right">{isAr ? 'فارق الانحراف' : 'Variance'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredCategories.map((cat) => (
                  <React.Fragment key={cat.id}>
                    <tr className="bg-slate-50/90 font-bold text-slate-800">
                      <td colSpan={4} className="py-2 font-sans">{translateItemName(cat.name, currentLanguage)}</td>
                    </tr>
                    {cat.items.map((it) => {
                      const variance = it.budgeted - it.actual;
                      return (
                        <tr key={it.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-1.5 pr-4 pl-4 font-sans text-slate-700 text-[11px]">• {translateItemName(it.name, currentLanguage)}</td>
                          <td className="py-1.5 text-right text-slate-600">{formatCurrency(it.budgeted)}</td>
                          <td className="py-1.5 text-right font-bold text-rose-700">{formatCurrency(it.actual)}</td>
                          <td className={`py-1.5 text-right font-bold ${variance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {formatCurrency(variance, { showSign: true })}
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
