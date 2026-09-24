import React, { useState, useMemo } from 'react';
import { ExpenseCategory, IncomeItem, BudgetPeriod, FinancialMetrics, Transaction } from '../types';
import { formatCurrency } from '../utils/calculations';
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
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  FileText,
  Calendar,
  Filter,
  Download,
  Printer,
  X,
  TrendingUp,
  TrendingDown,
  CheckSquare,
  Square,
  CheckCircle2,
  DollarSign,
  PieChart as PieIcon,
  Layers,
  Sparkles,
  ArrowUpDown,
  ArrowRightLeft,
  BarChart3,
} from 'lucide-react';

interface FinancialReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  period: BudgetPeriod;
  incomeItems: IncomeItem[];
  categories: ExpenseCategory[];
  transactions: Transaction[];
  metrics: FinancialMetrics;
  currentLanguage?: LanguageCode;
}

export type ReportType =
  | 'visual_dashboard'
  | 'pl_statement'
  | 'cash_flow'
  | 'variance_analysis'
  | 'itemized_audit';

const PIE_COLORS = [
  '#2563eb',
  '#0d9488',
  '#f59e0b',
  '#e11d48',
  '#7c3aed',
  '#059669',
  '#ea580c',
  '#0284c7',
  '#4f46e5',
  '#64748b',
];

export const FinancialReportsModal: React.FC<FinancialReportsModalProps> = ({
  isOpen,
  onClose,
  period,
  incomeItems,
  categories,
  transactions,
  metrics,
  currentLanguage = 'ar',
}) => {
  if (!isOpen) return null;
  const isAr = currentLanguage === 'ar';

  // Date Range state
  const defaultStart = period.startDate || `${period.year}-${String(period.month).padStart(2, '0')}-01`;
  const defaultEnd =
    period.endDate ||
    `${period.year}-${String(period.month).padStart(2, '0')}-${String(period.totalDays).padStart(2, '0')}`;

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [reportType, setReportType] = useState<ReportType>('visual_dashboard');

  // Filter Selection for Categories/Expenses and Incomes
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    categories.map((c) => c.id)
  );
  const [selectedIncomeIds, setSelectedIncomeIds] = useState<string[]>(
    incomeItems.map((i) => i.id)
  );

  // Hover slice in circle of expenses
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);

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

  // Toggle Income selection
  const handleToggleIncome = (incId: string) => {
    setSelectedIncomeIds((prev) =>
      prev.includes(incId) ? prev.filter((id) => id !== incId) : [...prev, incId]
    );
  };

  const handleSelectAllIncomes = () => {
    if (selectedIncomeIds.length === incomeItems.length) {
      setSelectedIncomeIds([]);
    } else {
      setSelectedIncomeIds(incomeItems.map((i) => i.id));
    }
  };

  // Filtered lists
  const filteredCategories = useMemo(() => {
    return categories.filter((c) => selectedCategoryIds.includes(c.id));
  }, [categories, selectedCategoryIds]);

  const filteredIncomeItems = useMemo(() => {
    return incomeItems.filter((i) => selectedIncomeIds.includes(i.id));
  }, [incomeItems, selectedIncomeIds]);

  // Sums
  const totalFilteredBudgetedExpense = filteredCategories.reduce(
    (sum, c) => sum + c.items.reduce((s, it) => s + it.budgeted, 0),
    0
  );
  const totalFilteredActualExpense = filteredCategories.reduce(
    (sum, c) => sum + c.items.reduce((s, it) => s + it.actual, 0),
    0
  );
  const totalFilteredExpectedIncome = filteredIncomeItems.reduce(
    (sum, i) => sum + i.expectedAmount,
    0
  );
  const totalFilteredReceivedIncome = filteredIncomeItems.reduce(
    (sum, i) => sum + i.receivedAmount,
    0
  );

  const netActualProfit = totalFilteredReceivedIncome - totalFilteredActualExpense;
  const netBudgetedProfit = totalFilteredExpectedIncome - totalFilteredBudgetedExpense;
  const netVariance = totalFilteredBudgetedExpense - totalFilteredActualExpense;

  // Pie chart circle data
  const pieData = useMemo(() => {
    return filteredCategories.map((cat, idx) => {
      const actual = cat.items.reduce((s, it) => s + it.actual, 0);
      const budgeted = cat.items.reduce((s, it) => s + it.budgeted, 0);
      return {
        id: cat.id,
        name: translateItemName(cat.name, currentLanguage),
        value: actual > 0 ? actual : budgeted,
        actual,
        budgeted,
        color: cat.color || PIE_COLORS[idx % PIE_COLORS.length],
      };
    }).filter((d) => d.value > 0);
  }, [filteredCategories, currentLanguage]);

  const totalExpenseVal = useMemo(() => {
    return pieData.reduce((s, d) => s + d.actual, 0) || pieData.reduce((s, d) => s + d.budgeted, 0);
  }, [pieData]);

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Export CSV function
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += `Financial Report - ${period.label}\n`;
    csvContent += `Date Range: ${startDate} to ${endDate}\n\n`;

    csvContent += '--- INCOMES ---\n';
    csvContent += 'Source,Expected Amount,Received Amount,Status\n';
    filteredIncomeItems.forEach((i) => {
      csvContent += `"${i.name}",${i.expectedAmount},${i.receivedAmount},${i.isReceived ? 'Received' : 'Pending'}\n`;
    });

    csvContent += '\n--- EXPENSES BY CATEGORY ---\n';
    csvContent += 'Category,Item,Budgeted,Actual,Variance\n';
    filteredCategories.forEach((cat) => {
      cat.items.forEach((it) => {
        csvContent += `"${cat.name}","${it.name}",${it.budgeted},${it.actual},${it.budgeted - it.actual}\n`;
      });
    });

    csvContent += `\nTotal Expected Income,${totalFilteredExpectedIncome}\n`;
    csvContent += `Total Received Income,${totalFilteredReceivedIncome}\n`;
    csvContent += `Total Budgeted Expense,${totalFilteredBudgetedExpense}\n`;
    csvContent += `Total Actual Expense,${totalFilteredActualExpense}\n`;
    csvContent += `Net Realized Profit,${netActualProfit}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `financial-report-${period.label.replace(/\s+/g, '-').toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto font-arabic" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="bg-white border border-slate-200/80 w-full max-w-5xl my-8 rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/15 border border-blue-400/20 rounded-xl text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isAr ? 'التقارير المالية المخصصة والمعتمدة' : 'Standard Financial Reports & Statement Generator'}
              </h2>
              <span className="text-xs text-slate-400">
                {isAr
                  ? 'لوحة المخططات، دائرة المصروفات، وفلترة بين فترتين واستخراج القوائم'
                  : 'Expense circle, visual charts, date range filters & financial statements'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isAr ? 'طباعة التقرير' : 'Print'}</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isAr ? 'تصدير CSV' : 'Export'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Controls Ribbon */}
        <div className="bg-slate-50/80 p-4 border-b border-slate-200/80 grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
          {/* Date Range Selection */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>{isAr ? 'الفترة الزمنية (بين تاريخين)' : 'Date Range (Between Two Dates)'}</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-500 block mb-0.5">{isAr ? 'من تاريخ:' : 'From:'}</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block mb-0.5">{isAr ? 'إلى تاريخ:' : 'To:'}</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Report Standard Type */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>{isAr ? 'نوع القائمة والتقرير المالي' : 'Financial Statement Standard'}</span>
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 focus:border-blue-500 focus:outline-none mt-1"
            >
              <option value="visual_dashboard">
                {isAr ? '📊 لوحة المخططات ودائرة المصروفات (Charts & Circle)' : '📊 Visual Charts & Expense Circle'}
              </option>
              <option value="pl_statement">
                {isAr ? 'قائمة الدخل والأرباح والخسائر (Income Statement)' : 'Income Statement (P&L)'}
              </option>
              <option value="cash_flow">
                {isAr ? 'قائمة التدفقات النقدية الفعلية (Cash Flow Statement)' : 'Cash Flow Statement'}
              </option>
              <option value="variance_analysis">
                {isAr ? 'تقرير تحليل الانحرافات والميزانية (Variance Analysis)' : 'Budget Variance Analysis'}
              </option>
              <option value="itemized_audit">
                {isAr ? 'كشف الحساب والتدقيق المالي المفصل (Audit Ledger)' : 'Itemized Financial Ledger Audit'}
              </option>
            </select>
          </div>

          {/* Quick Selection Summary */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-3 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">{isAr ? 'الفئات المختارة:' : 'Categories:'}</span>
              <span className="font-mono font-bold text-slate-900">
                {selectedCategoryIds.length} / {categories.length}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">{isAr ? 'مصادر الإيراد المختارة:' : 'Inflows:'}</span>
              <span className="font-mono font-bold text-slate-900">
                {selectedIncomeIds.length} / {incomeItems.length}
              </span>
            </div>
            <div className="text-[11px] font-bold text-blue-600 truncate mt-1 font-mono">
              {startDate} ➔ {endDate}
            </div>
          </div>
        </div>

        {/* Modal Body: Two-Column Filters & Generated Report Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Checkbox Filter Panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Selector */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-blue-600" />
                  {isAr ? 'تحديد فئات المصروفات المشمولة' : 'Filter Expense Categories'}
                </span>
                <button
                  type="button"
                  onClick={handleSelectAllCategories}
                  className="text-[10px] font-bold text-blue-600 hover:underline"
                >
                  {selectedCategoryIds.length === categories.length
                    ? isAr ? 'إلغاء تحديد الكل' : 'Deselect All'
                    : isAr ? 'تحديد الكل' : 'Select All'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1.5 max-h-28 overflow-y-auto">
                {categories.map((cat) => {
                  const isChecked = selectedCategoryIds.includes(cat.id);
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => handleToggleCategory(cat.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-left rounded-lg border transition-colors ${
                        isChecked
                          ? 'bg-blue-50/80 border-blue-300 text-blue-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                      <span className="truncate">{translateItemName(cat.name, currentLanguage)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Income Selector */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  {isAr ? 'تحديد مصادر الإيرادات المشمولة' : 'Filter Revenue Streams'}
                </span>
                <button
                  type="button"
                  onClick={handleSelectAllIncomes}
                  className="text-[10px] font-bold text-emerald-600 hover:underline"
                >
                  {selectedIncomeIds.length === incomeItems.length
                    ? isAr ? 'إلغاء تحديد الكل' : 'Deselect All'
                    : isAr ? 'تحديد الكل' : 'Select All'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1.5 max-h-28 overflow-y-auto">
                {incomeItems.map((inc) => {
                  const isChecked = selectedIncomeIds.includes(inc.id);
                  return (
                    <button
                      type="button"
                      key={inc.id}
                      onClick={() => handleToggleIncome(inc.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-left rounded-lg border transition-colors ${
                        isChecked
                          ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                      <span className="truncate">{inc.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* REPORT DOCUMENT / STATEMENT PREVIEW */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
            {/* Header */}
            <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
                  {isAr ? 'تقرير مالي معتمد' : 'Financial Statement Report'}
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
                  {reportType === 'visual_dashboard' && (isAr ? 'لوحة المخططات ودائرة المصروفات التفاعلية' : 'Visual Charts & Expense Circle Dashboard')}
                  {reportType === 'pl_statement' && (isAr ? 'قائمة الدخل والأرباح والخسائر (P&L)' : 'Statement of Profit and Loss')}
                  {reportType === 'cash_flow' && (isAr ? 'قائمة التدفقات النقدية (Cash Flow)' : 'Statement of Cash Flows')}
                  {reportType === 'variance_analysis' && (isAr ? 'تقرير مقارنة الميزانية والانحراف' : 'Budget Variance Performance')}
                  {reportType === 'itemized_audit' && (isAr ? 'كشف التدقيق المالي المفصل' : 'Itemized Financial Ledger Audit')}
                </h3>
              </div>
              <div className="text-right font-mono text-xs text-slate-500">
                <div>{isAr ? 'الفترة:' : 'Period:'} <span className="font-bold text-slate-800">{startDate} ➔ {endDate}</span></div>
                <div>{isAr ? 'تاريخ الاستخراج:' : 'Generated on:'} <span className="font-bold text-slate-800">{new Date().toISOString().split('T')[0]}</span></div>
              </div>
            </div>

            {/* Statement Summary KPI Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900 text-white p-4 rounded-xl">
              <div>
                <span className="text-[10px] font-medium text-slate-400 block">{isAr ? 'إجمالي الإيراد' : 'Total Revenue'}</span>
                <span className="text-lg font-bold font-mono text-emerald-400">+{formatCurrency(totalFilteredReceivedIncome)}</span>
              </div>
              <div>
                <span className="text-[10px] font-medium text-slate-400 block">{isAr ? 'إجمالي المصروف الفعلي' : 'Actual Outflow'}</span>
                <span className="text-lg font-bold font-mono text-rose-400">-{formatCurrency(totalFilteredActualExpense)}</span>
              </div>
              <div>
                <span className="text-[10px] font-medium text-slate-400 block">{isAr ? 'صافي النتيجة المالية' : 'Net Profit/Loss'}</span>
                <span className={`text-lg font-bold font-mono ${netActualProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatCurrency(netActualProfit, { showSign: true })}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-medium text-slate-400 block">{isAr ? 'وفر الميزانية المتبقي' : 'Budget Variance'}</span>
                <span className={`text-lg font-bold font-mono ${netVariance >= 0 ? 'text-blue-300' : 'text-amber-400'}`}>
                  {formatCurrency(netVariance, { showSign: true })}
                </span>
              </div>
            </div>

            {/* VISUAL DASHBOARD VIEW WITH CIRCLE OF EXPENSES */}
            {reportType === 'visual_dashboard' && (
              <div className="space-y-6 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  {/* Circle of Expenses Donut */}
                  <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <PieIcon className="w-4 h-4 text-blue-600" />
                        {isAr ? 'دائرة المصروفات (Circle of Expenses)' : 'Circle of Expenses'}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 font-bold">
                        {formatCurrency(totalExpenseVal)}
                      </span>
                    </div>

                    <div className="h-64 w-full relative flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                const pct = totalExpenseVal > 0 ? (data.actual / totalExpenseVal) * 100 : 0;
                                return (
                                  <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs space-y-1 shadow-lg font-arabic">
                                    <div className="font-bold flex items-center gap-1.5">
                                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }} />
                                      {data.name}
                                    </div>
                                    <div className="font-mono text-emerald-400">{formatCurrency(data.actual)}</div>
                                    <div className="font-mono text-[10px] text-blue-300">{pct.toFixed(1)}%</div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Pie
                            data={pieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={85}
                            paddingAngle={3}
                            onMouseEnter={(_, index) => setHoveredSlice(index)}
                            onMouseLeave={() => setHoveredSlice(null)}
                          >
                            {pieData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                stroke="#ffffff"
                                strokeWidth={hoveredSlice === index ? 3 : 1.5}
                              />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                        <span className="text-[9px] uppercase font-bold text-slate-400">{isAr ? 'المنصرف' : 'Total'}</span>
                        <span className="text-sm font-extrabold font-mono text-slate-800">{formatCurrency(totalExpenseVal)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Category allocation list */}
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {pieData.map((cat) => {
                      const pct = totalExpenseVal > 0 ? (cat.actual / totalExpenseVal) * 100 : 0;
                      return (
                        <div key={cat.id} className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                            <span className="font-bold text-slate-800">{cat.name}</span>
                          </div>
                          <div className="text-right font-mono">
                            <span className="font-bold text-slate-900">{formatCurrency(cat.actual)}</span>
                            <span className="text-[10px] text-slate-500 mr-2 ml-2">({pct.toFixed(0)}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* DETAIL TABLES FOR P&L, CASH FLOW, AND VARIANCE */}
            {reportType !== 'visual_dashboard' && (
              <div className="space-y-4">
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
                    {filteredIncomeItems.map((item) => {
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

                {/* Expenses Breakdown */}
                <h4 className="text-xs font-bold text-slate-800 bg-slate-50 p-2.5 rounded-lg border-r-4 rtl:border-r-4 rtl:border-l-0 ltr:border-l-4 ltr:border-r-0 border-rose-600 mt-6">
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
                          <td colSpan={4} className="py-2 font-sans">
                            {translateItemName(cat.name, currentLanguage)}
                          </td>
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
            )}

            {/* Final Net Surplus */}
            <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between font-bold text-sm mt-4">
              <span className="uppercase">{isAr ? 'صافي الربح / الفائض المالي المحقق:' : 'Net Realized Financial Surplus:'}</span>
              <span className={`font-mono text-base ${netActualProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatCurrency(netActualProfit, { showSign: true })}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200/80 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 font-medium">
            {isAr ? 'النظام المالي متوافق مع معايير المحاسبة والتقارير' : 'Statement complies with standard reporting formats'}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
