import React, { useState, useMemo } from 'react';
import { BudgetPeriod, CurrencyInfo, ExpenseCategory, FinancialMetrics, IncomeItem, Transaction } from '../types';
import { formatCurrency, formatPercent } from '../utils/calculations';
import { translateItemName } from '../utils/localization';
import { LanguageCode } from '../i18n/translations';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  TrendingUp, TrendingDown, Calendar, ArrowRightLeft, Download, Printer,
  Filter, Layers, Scale, DollarSign, CheckCircle2, AlertCircle, ArrowUpRight, ArrowDownRight,
  FileSpreadsheet, Sparkles
} from 'lucide-react';

interface CashFlowPeriodComparisonProps {
  period: BudgetPeriod;
  transactions: Transaction[];
  incomeItems: IncomeItem[];
  categories: ExpenseCategory[];
  metrics: FinancialMetrics;
  currentLanguage?: LanguageCode;
  currentCurrency?: CurrencyInfo;
}

export const CashFlowPeriodComparison: React.FC<CashFlowPeriodComparisonProps> = ({
  period,
  transactions,
  incomeItems,
  categories,
  metrics,
  currentLanguage = 'ar',
  currentCurrency,
}) => {
  const isAr = currentLanguage === 'ar';

  // Helper date generators
  const today = new Date();
  const year = period.year || today.getFullYear();
  const month = period.month || (today.getMonth() + 1);
  const pad = (n: number) => String(n).padStart(2, '0');

  // Default Period 1: Current period (e.g. 2026-08-01 to 2026-08-31)
  const defaultP1Start = period.startDate || `${year}-${pad(month)}-01`;
  const defaultP1End = period.endDate || `${year}-${pad(month)}-${pad(period.totalDays || 30)}`;

  // Default Period 2: Previous month (e.g. 2026-07-01 to 2026-07-31)
  const prevMonthNum = month === 1 ? 12 : month - 1;
  const prevMonthYear = month === 1 ? year - 1 : year;
  const defaultP2Start = `${prevMonthYear}-${pad(prevMonthNum)}-01`;
  const defaultP2End = `${prevMonthYear}-${pad(prevMonthNum)}-${pad(new Date(prevMonthYear, prevMonthNum, 0).getDate())}`;

  // State for Period 1
  const [p1Start, setP1Start] = useState<string>(defaultP1Start);
  const [p1End, setP1End] = useState<string>(defaultP1End);
  const [p1Label, setP1Label] = useState<string>(isAr ? 'الفترة الأساسية (الحالية)' : 'Period 1 (Current)');

  // State for Period 2
  const [p2Start, setP2Start] = useState<string>(defaultP2Start);
  const [p2End, setP2End] = useState<string>(defaultP2End);
  const [p2Label, setP2Label] = useState<string>(isAr ? 'فترة المقارنة (السابقة)' : 'Period 2 (Comparative)');

  // Active filter tab: 'all' | 'incomes' | 'expenses'
  const [breakdownFilter, setBreakdownFilter] = useState<'all' | 'incomes' | 'expenses'>('all');

  // Quick Preset Handlers
  const handleApplyPreset = (preset: 'month_vs_prev' | 'half1_vs_half2' | 'current_vs_target') => {
    if (preset === 'month_vs_prev') {
      setP1Start(`${year}-${pad(month)}-01`);
      setP1End(`${year}-${pad(month)}-${pad(period.totalDays || 30)}`);
      setP1Label(isAr ? `الشهر الحالي (${year}-${pad(month)})` : `Current Month (${year}-${pad(month)})`);

      setP2Start(`${prevMonthYear}-${pad(prevMonthNum)}-01`);
      setP2End(`${prevMonthYear}-${pad(prevMonthNum)}-${pad(new Date(prevMonthYear, prevMonthNum, 0).getDate())}`);
      setP2Label(isAr ? `الشهر السابق (${prevMonthYear}-${pad(prevMonthNum)})` : `Previous Month (${prevMonthYear}-${pad(prevMonthNum)})`);
    } else if (preset === 'half1_vs_half2') {
      const midDay = Math.floor((period.totalDays || 30) / 2);
      setP1Start(`${year}-${pad(month)}-01`);
      setP1End(`${year}-${pad(month)}-${pad(midDay)}`);
      setP1Label(isAr ? 'النصف الأول (أيام 1-15)' : '1st Half (Days 1-15)');

      setP2Start(`${year}-${pad(month)}-${pad(midDay + 1)}`);
      setP2End(`${year}-${pad(month)}-${pad(period.totalDays || 30)}`);
      setP2Label(isAr ? 'النصف الثاني (أيام 16-30)' : '2nd Half (Days 16-30)');
    }
  };

  // Helper to filter transactions in a date range [start, end]
  const getTransactionsInRange = (startStr: string, endStr: string) => {
    return transactions.filter((tx) => {
      if (!tx.date) return false;
      return tx.date >= startStr && tx.date <= endStr;
    });
  };

  // Period 1 and Period 2 Transactions (Strict Ledger Filtering)
  const p1Txs = useMemo(() => getTransactionsInRange(p1Start, p1End), [transactions, p1Start, p1End]);
  const p2Txs = useMemo(() => getTransactionsInRange(p2Start, p2End), [transactions, p2Start, p2End]);

  // Actual Inflows and Outflows computed purely from transactions in each respective range
  const p1Inflow = p1Txs.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const p1Outflow = p1Txs.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const p1NetCashFlow = p1Inflow - p1Outflow;

  const p2Inflow = p2Txs.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const p2Outflow = p2Txs.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const p2NetCashFlow = p2Inflow - p2Outflow;

  // Comparative Variances
  const inflowDelta = p1Inflow - p2Inflow;
  const inflowGrowthPercent = p2Inflow > 0 ? (inflowDelta / p2Inflow) * 100 : (p1Inflow > 0 ? 100 : 0);

  const outflowDelta = p1Outflow - p2Outflow;
  const outflowGrowthPercent = p2Outflow > 0 ? (outflowDelta / p2Outflow) * 100 : (p1Outflow > 0 ? 100 : 0);

  const netCashFlowDelta = p1NetCashFlow - p2NetCashFlow;

  // Comparison Bar Chart Data
  const chartData = [
    {
      metric: isAr ? 'المقبوضات الفعلية' : 'Actual Inflows',
      [p1Label]: Math.round(p1Inflow),
      [p2Label]: Math.round(p2Inflow),
    },
    {
      metric: isAr ? 'المدفوعات الفعلية' : 'Actual Outflows',
      [p1Label]: Math.round(p1Outflow),
      [p2Label]: Math.round(p2Outflow),
    },
    {
      metric: isAr ? 'صافي التدفق الفعلي' : 'Net Actual Cash Flow',
      [p1Label]: Math.round(p1NetCashFlow),
      [p2Label]: Math.round(p2NetCashFlow),
    },
  ];

  // Category-wise Breakdown Comparison (Strict Transaction Sums)
  const categoryComparisonRows = useMemo(() => {
    return categories.map((cat) => {
      // P1 category outflow from transactions
      const catP1Txs = p1Txs.filter((t) => t.type === 'expense' && (t.categoryId === cat.id || cat.items.some(i => i.id === t.expenseItemId)));
      const catP1Val = catP1Txs.reduce((sum, t) => sum + t.amount, 0);

      // P2 category outflow from transactions
      const catP2Txs = p2Txs.filter((t) => t.type === 'expense' && (t.categoryId === cat.id || cat.items.some(i => i.id === t.expenseItemId)));
      const catP2Val = catP2Txs.reduce((sum, t) => sum + t.amount, 0);

      const diff = catP1Val - catP2Val;
      const pct = catP2Val > 0 ? (diff / catP2Val) * 100 : (catP1Val > 0 ? 100 : 0);

      return {
        id: cat.id,
        name: cat.name,
        type: 'expense',
        p1Amount: catP1Val,
        p2Amount: catP2Val,
        p1TxCount: catP1Txs.length,
        p2TxCount: catP2Txs.length,
        delta: diff,
        deltaPercent: pct,
      };
    });
  }, [categories, p1Txs, p2Txs]);

  // Income Streams Breakdown Comparison (Strict Transaction Sums)
  const incomeComparisonRows = useMemo(() => {
    return incomeItems.map((inc) => {
      const incP1Txs = p1Txs.filter((t) => t.type === 'income' && t.incomeItemId === inc.id);
      const p1Val = incP1Txs.reduce((sum, t) => sum + t.amount, 0);

      const incP2Txs = p2Txs.filter((t) => t.type === 'income' && t.incomeItemId === inc.id);
      const p2Val = incP2Txs.reduce((sum, t) => sum + t.amount, 0);

      const diff = p1Val - p2Val;
      const pct = p2Val > 0 ? (diff / p2Val) * 100 : (p1Val > 0 ? 100 : 0);

      return {
        id: inc.id,
        name: inc.name,
        type: 'income',
        p1Amount: p1Val,
        p2Amount: p2Val,
        p1TxCount: incP1Txs.length,
        p2TxCount: incP2Txs.length,
        delta: diff,
        deltaPercent: pct,
      };
    });
  }, [incomeItems, p1Txs, p2Txs]);

  // Print Report Handler
  const handlePrint = () => {
    window.print();
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    let csv = 'data:text/csv;charset=utf-8,';
    csv += `Comparative Cash Flow Report\n`;
    csv += `Period 1 (${p1Label}): ${p1Start} to ${p1End}\n`;
    csv += `Period 2 (${p2Label}): ${p2Start} to ${p2End}\n\n`;

    csv += `Metric,${p1Label},${p2Label},Variance ($),Growth (%)\n`;
    csv += `Total Inflow,${p1Inflow},${p2Inflow},${inflowDelta},${Math.round(inflowGrowthPercent)}%\n`;
    csv += `Total Outflow,${p1Outflow},${p2Outflow},${outflowDelta},${Math.round(outflowGrowthPercent)}%\n`;
    csv += `Net Cash Flow,${p1NetCashFlow},${p2NetCashFlow},${netCashFlowDelta},-\n\n`;

    csv += `--- CATEGORY EXPENSE COMPARISON ---\n`;
    csv += `Category,${p1Label},${p2Label},Delta ($),Delta (%)\n`;
    categoryComparisonRows.forEach((row) => {
      csv += `"${row.name}",${row.p1Amount},${row.p2Amount},${row.delta},${Math.round(row.deltaPercent)}%\n`;
    });

    csv += `\n--- REVENUE STREAM COMPARISON ---\n`;
    csv += `Stream,${p1Label},${p2Label},Delta ($),Delta (%)\n`;
    incomeComparisonRows.forEach((row) => {
      csv += `"${row.name}",${row.p1Amount},${row.p2Amount},${row.delta},${Math.round(row.deltaPercent)}%\n`;
    });

    const encoded = encodeURI(csv);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `comparative-cashflow-${p1Start}-vs-${p2Start}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="cashflow-period-comparison-container" className="space-y-6 font-arabic" dir={isAr ? 'rtl' : 'ltr'}>
      {/* 1. Header Banner */}
      <div className="bg-white text-slate-800 p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-blue-600" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
              {isAr ? 'تقرير مقارنة التدفق النقدي بين فترتين' : 'Period-to-Period Cash Flow Comparison'}
            </h2>
          </div>
          <p className="text-base sm:text-lg font-bold text-slate-900 mt-1">
            {isAr
              ? 'مقارنة شاملة للتدفقات الداخلة والخارجة وصافي السيولة بين أي تاريخين محددين'
              : 'Compare inflows, outflows, and net cash flow delta between two customized date ranges'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>{isAr ? 'طباعة التقرير' : 'Print'}</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isAr ? 'تصدير CSV' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* 2. DUAL DATE RANGE SELECTOR CONTROLS RIBBON */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>{isAr ? 'تحديد نطاق التاريخين للمقارنة:' : 'Select Two Date Ranges for Comparison:'}</span>
          </span>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-slate-400 mr-1">{isAr ? 'نماذج جاهزة:' : 'Presets:'}</span>
            <button
              onClick={() => handleApplyPreset('month_vs_prev')}
              className="px-3 py-1.5 text-[11px] font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition-colors"
            >
              {isAr ? 'الشهر الحالي vs السابق' : 'This Month vs Last'}
            </button>
            <button
              onClick={() => handleApplyPreset('half1_vs_half2')}
              className="px-3 py-1.5 text-[11px] font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition-colors"
            >
              {isAr ? 'النصف الأول vs النصف الثاني' : '1st Half vs 2nd Half'}
            </button>
          </div>
        </div>

        {/* Dual Date Input Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Period 1 (الفترة الأولى / الأساسية) */}
          <div className="p-4 bg-blue-50/40 rounded-xl border border-blue-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                {isAr ? '1. الفترة الأساسية (Period 1)' : '1. Base Period (Period 1)'}
              </span>
              <input
                type="text"
                value={p1Label}
                onChange={(e) => setP1Label(e.target.value)}
                className="text-[11px] font-bold text-blue-800 bg-white border border-blue-200 rounded-lg px-2.5 py-1 max-w-[170px]"
                title="Edit period label"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">
                  {isAr ? 'من تاريخ:' : 'Start Date:'}
                </label>
                <input
                  type="date"
                  value={p1Start}
                  onChange={(e) => setP1Start(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">
                  {isAr ? 'إلى تاريخ:' : 'End Date:'}
                </label>
                <input
                  type="date"
                  value={p1End}
                  onChange={(e) => setP1End(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Period 2 (الفترة الثانية / المقارن بها) */}
          <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-800 inline-block" />
                {isAr ? '2. فترة المقارنة (Period 2)' : '2. Comparative Period (Period 2)'}
              </span>
              <input
                type="text"
                value={p2Label}
                onChange={(e) => setP2Label(e.target.value)}
                className="text-[11px] font-bold text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1 max-w-[170px]"
                title="Edit period label"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">
                  {isAr ? 'من تاريخ:' : 'Start Date:'}
                </label>
                <input
                  type="date"
                  value={p2Start}
                  onChange={(e) => setP2Start(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:border-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">
                  {isAr ? 'إلى تاريخ:' : 'End Date:'}
                </label>
                <input
                  type="date"
                  value={p2End}
                  onChange={(e) => setP2End(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:border-slate-800 focus:outline-none"
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. HIGH-LEVEL KPI COMPARISON CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* KPI 1: Inflows Comparison */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                {isAr ? 'إجمالي المقبوضات (Inflows)' : 'Total Inflows'}
              </span>
              <span className={`px-2.5 py-0.5 text-[10px] font-bold font-mono rounded-full flex items-center gap-0.5 ${
                inflowDelta >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}>
                {inflowDelta >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {inflowGrowthPercent >= 0 ? '+' : ''}{Math.round(inflowGrowthPercent)}%
              </span>
            </div>

            <div className="my-3 space-y-1">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-medium text-slate-600">{p1Label}:</span>
                <span className="text-lg font-bold font-mono text-emerald-700">{formatCurrency(p1Inflow)}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-medium text-slate-400">{p2Label}:</span>
                <span className="text-sm font-medium font-mono text-slate-500">{formatCurrency(p2Inflow)}</span>
              </div>
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-100 flex justify-between text-xs font-mono font-bold">
            <span className="text-slate-500 font-sans">{isAr ? 'الفارق النقدي:' : 'Net Delta:'}</span>
            <span className={inflowDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
              {formatCurrency(inflowDelta, { showSign: true })}
            </span>
          </div>
        </div>

        {/* KPI 2: Outflows Comparison */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                {isAr ? 'إجمالي المدفوعات (Outflows)' : 'Total Outflows'}
              </span>
              <span className={`px-2.5 py-0.5 text-[10px] font-bold font-mono rounded-full flex items-center gap-0.5 ${
                outflowDelta <= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}>
                {outflowDelta <= 0 ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                {outflowGrowthPercent >= 0 ? '+' : ''}{Math.round(outflowGrowthPercent)}%
              </span>
            </div>

            <div className="my-3 space-y-1">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-medium text-slate-600">{p1Label}:</span>
                <span className="text-lg font-bold font-mono text-rose-700">{formatCurrency(p1Outflow)}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-medium text-slate-400">{p2Label}:</span>
                <span className="text-sm font-medium font-mono text-slate-500">{formatCurrency(p2Outflow)}</span>
              </div>
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-100 flex justify-between text-xs font-mono font-bold">
            <span className="text-slate-500 font-sans">{isAr ? 'الفارق النقدي:' : 'Net Delta:'}</span>
            <span className={outflowDelta <= 0 ? 'text-emerald-600' : 'text-rose-600'}>
              {formatCurrency(outflowDelta, { showSign: true })}
            </span>
          </div>
        </div>

        {/* KPI 3: Net Cash Flow Delta */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 text-white p-5 rounded-2xl shadow-sm flex flex-col justify-between border border-slate-800/80">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
                {isAr ? 'صافي التدفق النقدي (Net Flow)' : 'Net Cash Flow'}
              </span>
              <span className="px-2.5 py-0.5 text-[10px] font-bold font-mono bg-blue-600/80 rounded-full text-white">
                {isAr ? 'المحصلة' : 'Result'}
              </span>
            </div>

            <div className="my-3 space-y-1">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-medium text-slate-300">{p1Label}:</span>
                <span className={`text-lg font-bold font-mono ${p1NetCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatCurrency(p1NetCashFlow, { showSign: true })}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-medium text-slate-400">{p2Label}:</span>
                <span className="text-sm font-medium font-mono text-slate-300">
                  {formatCurrency(p2NetCashFlow, { showSign: true })}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-800 flex justify-between text-xs font-mono font-bold">
            <span className="text-slate-400 font-sans">{isAr ? 'فارق تحسن السيولة:' : 'Net Liquidity Shift:'}</span>
            <span className={netCashFlowDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
              {formatCurrency(netCashFlowDelta, { showSign: true })}
            </span>
          </div>
        </div>

      </div>

      {/* 4. SIDE-BY-SIDE VISUAL COMPARISON CHART */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>{isAr ? 'مقارنة بيانية مباشرة للتدفقات النقدية' : 'Visual Comparative Flow Chart'}</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              {p1Label} ({p1Start} ➔ {p1End}) vs {p2Label} ({p2Start} ➔ {p2End})
            </span>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="metric" tick={{ fontSize: 11, fontWeight: 600, fill: '#1e293b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                formatter={(value: any) => [formatCurrency(Number(value)), '']}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', fontSize: '11px', fontWeight: 'bold', borderRadius: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', fontWeight: '600' }} />
              <Bar dataKey={p1Label} fill="#2563eb" radius={[6, 6, 0, 0]} />
              <Bar dataKey={p2Label} fill="#94a3b8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. ITEMIZED BREAKDOWN COMPARISON TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-4 overflow-hidden">
        <div className="px-5 py-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {isAr ? 'جدول مقارنة البنود والفئات التفصيلي' : 'Itemized Category & Stream Variance Table'}
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              {isAr ? 'تحليل الانحراف والنمو لكل بند بين الفترتين' : 'Detailed line-item comparison and shift'}
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5">
            {[
              { id: 'all', label: isAr ? 'الكل' : 'All' },
              { id: 'incomes', label: isAr ? 'الإيرادات' : 'Inflows' },
              { id: 'expenses', label: isAr ? 'المصروفات' : 'Outflows' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setBreakdownFilter(f.id as any)}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-xl transition-all ${
                  breakdownFilter === f.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto p-4">
          <table className="w-full text-xs text-left font-sans">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold uppercase text-slate-700 border-b border-slate-200">
                <th className="py-2.5 px-4 rounded-s-lg">{isAr ? 'البند / الفئة' : 'Category / Line Item'}</th>
                <th className="py-2.5 px-3 text-center">{isAr ? 'النوع' : 'Type'}</th>
                <th className="py-2.5 px-3 text-right">{p1Label}</th>
                <th className="py-2.5 px-3 text-right">{p2Label}</th>
                <th className="py-2.5 px-3 text-right">{isAr ? 'الفارق النقدي' : 'Variance ($)'}</th>
                <th className="py-2.5 px-3 text-right rounded-e-lg">{isAr ? 'نسبة التغير' : 'Shift (%)'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {/* Income Streams */}
              {(breakdownFilter === 'all' || breakdownFilter === 'incomes') &&
                incomeComparisonRows.map((row) => (
                  <tr key={row.id} className="hover:bg-emerald-50/40 transition-colors">
                    <td className="py-2.5 px-4 font-sans font-medium text-slate-900">
                      {translateItemName(row.name, currentLanguage)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-sans">
                      <span className="px-2.5 py-0.5 text-[9px] font-bold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {isAr ? 'إيراد' : 'Inflow'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-700">{formatCurrency(row.p1Amount)}</td>
                    <td className="py-2.5 px-3 text-right text-slate-600">{formatCurrency(row.p2Amount)}</td>
                    <td className={`py-2.5 px-3 text-right font-bold ${row.delta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {formatCurrency(row.delta, { showSign: true })}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${row.delta >= 0 ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
                        {row.deltaPercent >= 0 ? '+' : ''}{Math.round(row.deltaPercent)}%
                      </span>
                    </td>
                  </tr>
                ))}

              {/* Expense Categories */}
              {(breakdownFilter === 'all' || breakdownFilter === 'expenses') &&
                categoryComparisonRows.map((row) => (
                  <tr key={row.id} className="hover:bg-rose-50/40 transition-colors">
                    <td className="py-2.5 px-4 font-sans font-medium text-slate-900">
                      {translateItemName(row.name, currentLanguage)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-sans">
                      <span className="px-2.5 py-0.5 text-[9px] font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {isAr ? 'مصروف' : 'Outflow'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-rose-700">{formatCurrency(row.p1Amount)}</td>
                    <td className="py-2.5 px-3 text-right text-slate-600">{formatCurrency(row.p2Amount)}</td>
                    <td className={`py-2.5 px-3 text-right font-bold ${row.delta <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {formatCurrency(row.delta, { showSign: true })}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${row.delta <= 0 ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
                        {row.deltaPercent >= 0 ? '+' : ''}{Math.round(row.deltaPercent)}%
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
