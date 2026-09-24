import React, { useState } from 'react';
import { BudgetPeriod, CurrencyInfo, ExpenseCategory, FinancialMetrics, IncomeItem, Transaction } from '../types';
import { formatCurrency, formatPercent } from '../utils/calculations';
import { translateItemName } from '../utils/localization';
import { LanguageCode } from '../i18n/translations';
import { CashFlowPeriodComparison } from './CashFlowPeriodComparison';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, ReferenceLine, Cell, PieChart, Pie
} from 'recharts';
import { 
  TrendingUp, ArrowDownRight, ArrowUpRight, Shield, Activity, 
  DollarSign, Filter, Layers, CheckCircle2, AlertCircle, Sparkles, PieChart as PieIcon,
  ArrowRightLeft, BarChart3
} from 'lucide-react';

interface CashFlowProjectionsProps {
  metrics: FinancialMetrics;
  period: BudgetPeriod;
  incomeItems: IncomeItem[];
  categories: ExpenseCategory[];
  transactions?: Transaction[];
  currentLanguage?: LanguageCode;
  currentCurrency?: CurrencyInfo;
}

export const CashFlowProjections: React.FC<CashFlowProjectionsProps> = ({
  metrics,
  period,
  incomeItems,
  categories,
  transactions = [],
  currentLanguage = 'ar',
  currentCurrency,
}) => {
  const isAr = currentLanguage === 'ar';
  
  // View sub-tab: 'projections' | 'comparison'
  const [activeSubView, setActiveSubView] = useState<'projections' | 'comparison'>('projections');

  // Interactive chart selection state: 'all' or categoryId or itemId
  const [selectedFocusId, setSelectedFocusId] = useState<string>('all');
  const [chartViewMode, setChartViewMode] = useState<'liquidity' | 'itemBreakdown' | 'categoryCompare'>('liquidity');

  // Collect all individual expense items for interactive selection
  const allExpenseItems = categories.flatMap((cat) => 
    cat.items.map((item) => ({ ...item, categoryId: cat.id, categoryName: cat.name }))
  );

  // Find active focused item if any
  const focusedItem = allExpenseItems.find((i) => i.id === selectedFocusId);
  const focusedCategory = categories.find((c) => c.id === selectedFocusId);

  // Dynamic Chart Title & Subtitle based on selection
  let focusTitle = isAr ? 'مسار السيولة والتدفقات النقدية الشاملة' : 'Overall Liquidity & Cash Flow Trajectory';
  let focusSubtitle = isAr 
    ? `من اليوم 1 حتى ${period.totalDays} (الرصيد المتاح + الإيرادات - المصروفات)`
    : `Day 1 — ${period.totalDays} (Available Reserves + Inflows - Outflows)`;

  if (focusedItem) {
    focusTitle = `${isAr ? 'التحليل البياني لبند:' : 'Analysis for Line Item:'} ${translateItemName(focusedItem.name, currentLanguage)}`;
    focusSubtitle = `${isAr ? 'الميزانية المخططة:' : 'Budgeted:'} ${formatCurrency(focusedItem.budgeted)} | ${isAr ? 'المنفق الفعلي:' : 'Actual Spent:'} ${formatCurrency(focusedItem.actual)}`;
  } else if (focusedCategory) {
    const catBudget = focusedCategory.items.reduce((s, i) => s + i.budgeted, 0);
    const catActual = focusedCategory.items.reduce((s, i) => s + i.actual, 0);
    focusTitle = `${isAr ? 'التحليل البياني لفئة:' : 'Analysis for Category:'} ${translateItemName(focusedCategory.name, currentLanguage)}`;
    focusSubtitle = `${isAr ? 'إجمالي الميزانية:' : 'Total Budget:'} ${formatCurrency(catBudget)} | ${isAr ? 'إجمالي الفعلي:' : 'Total Actual:'} ${formatCurrency(catActual)}`;
  }

  // 1. Waterfall Data for End of Period Balance
  const fixedExpenses = categories.reduce((sum, cat) => 
    sum + cat.items.filter(i => i.isFixed).reduce((s, i) => s + (i.actual > 0 ? i.actual : i.budgeted), 0), 0);
  
  const variableExpenses = metrics.totalActualExpense - categories.reduce((sum, cat) => 
    sum + cat.items.filter(i => i.isFixed).reduce((s, i) => s + i.actual, 0), 0);

  const projectedRemainingVariable = Math.max(0, metrics.projectedMonthEndExpense - metrics.totalActualExpense);

  const waterfallData = [
    { stage: isAr ? 'رصيد البداية' : 'Start Balance', amount: period.startingBankBalance, fill: '#0f172a' },
    { stage: isAr ? '+ إجمالي الإيرادات' : '+ Inflow (Total)', amount: metrics.totalExpectedIncome, fill: '#2563eb' },
    { stage: isAr ? '- مصروفات ثابتة' : '- Fixed Outflow', amount: -fixedExpenses, fill: '#475569' },
    { stage: isAr ? '- مصروفات متغيرة فعلية' : '- MTD Variable', amount: -variableExpenses, fill: '#64748b' },
    { stage: isAr ? '- المتوقع لنهاية الشهر' : '- Proj. Remaining', amount: -projectedRemainingVariable, fill: '#94a3b8' },
    { stage: isAr ? '= الرصيد المقدر' : '= End Balance', amount: metrics.estimatedEndOfPeriodBankBalance, fill: '#059669' },
  ];

  // 2. Trajectory Projection based on active focus
  const daysInMonth = period.totalDays;
  const trajectoryData = [];

  for (let d = 1; d <= daysInMonth; d += (daysInMonth > 40 ? 4 : 2)) {
    const dayLabel = isAr ? `يوم ${d}` : `Day ${d}`;

    if (focusedItem) {
      // Burn chart specifically for this item
      const itemDailyBudget = focusedItem.budgeted / daysInMonth;
      const plannedBurnToDate = itemDailyBudget * d;
      let actualOrProjected = 0;
      if (d <= period.currentDay) {
        actualOrProjected = (d / Math.max(1, period.currentDay)) * focusedItem.actual;
      } else {
        const remainingDays = daysInMonth - period.currentDay;
        const daysBeyond = d - period.currentDay;
        const remainingEstimated = Math.max(0, focusedItem.budgeted - focusedItem.actual);
        actualOrProjected = focusedItem.actual + (remainingEstimated * (daysBeyond / Math.max(1, remainingDays)));
      }

      trajectoryData.push({
        day: dayLabel,
        projectedBalance: Math.round(actualOrProjected),
        plannedBaseline: Math.round(plannedBurnToDate),
        isActual: d <= period.currentDay,
      });
    } else if (focusedCategory) {
      // Pacing for this category
      const catBudget = focusedCategory.items.reduce((s, i) => s + i.budgeted, 0);
      const catActual = focusedCategory.items.reduce((s, i) => s + i.actual, 0);
      const catDailyBudget = catBudget / daysInMonth;
      const plannedBurnToDate = catDailyBudget * d;
      let actualOrProjected = 0;
      if (d <= period.currentDay) {
        actualOrProjected = (d / Math.max(1, period.currentDay)) * catActual;
      } else {
        const remainingDays = daysInMonth - period.currentDay;
        const daysBeyond = d - period.currentDay;
        const remainingEstimated = Math.max(0, catBudget - catActual);
        actualOrProjected = catActual + (remainingEstimated * (daysBeyond / Math.max(1, remainingDays)));
      }

      trajectoryData.push({
        day: dayLabel,
        projectedBalance: Math.round(actualOrProjected),
        plannedBaseline: Math.round(plannedBurnToDate),
        isActual: d <= period.currentDay,
      });
    } else {
      // General full liquidity curve
      if (d <= period.currentDay) {
        const mtdInflowFraction = (d / Math.max(1, period.currentDay)) * metrics.totalReceivedIncome;
        const mtdExpenseFraction = (d / Math.max(1, period.currentDay)) * metrics.totalActualExpense;
        trajectoryData.push({
          day: dayLabel,
          projectedBalance: Math.round(period.startingBankBalance + mtdInflowFraction - mtdExpenseFraction),
          plannedBaseline: Math.round(period.startingBankBalance),
          isActual: true,
        });
      } else {
        const futureDaysFromCurrent = d - period.currentDay;
        const remainingInflow = Math.max(0, metrics.totalExpectedIncome - metrics.totalReceivedIncome);
        const remainingExpense = Math.max(0, metrics.projectedMonthEndExpense - metrics.totalActualExpense);
        const daysLeft = Math.max(1, period.totalDays - period.currentDay);
        
        const futureInflow = metrics.totalReceivedIncome + (remainingInflow * (futureDaysFromCurrent / daysLeft));
        const futureExpense = metrics.totalActualExpense + (remainingExpense * (futureDaysFromCurrent / daysLeft));
        
        trajectoryData.push({
          day: dayLabel,
          projectedBalance: Math.round(period.startingBankBalance + futureInflow - futureExpense),
          plannedBaseline: Math.round(period.startingBankBalance),
          isActual: false,
        });
      }
    }
  }

  // 3. Category Comparison Chart Data
  const categoryComparisonData = categories.map((cat) => {
    const budgeted = cat.items.reduce((sum, i) => sum + i.budgeted, 0);
    const actual = cat.items.reduce((sum, i) => sum + i.actual, 0);
    return {
      id: cat.id,
      category: translateItemName(cat.name, currentLanguage).slice(0, 14),
      fullName: translateItemName(cat.name, currentLanguage),
      Budget: budgeted,
      Actual: actual,
      isSelected: selectedFocusId === cat.id,
    };
  });

  return (
    <div id="cash-flow-projections-container" className="space-y-6 font-arabic" dir={isAr ? 'rtl' : 'ltr'}>
      {/* 0. SUB-VIEW SWITCHER (مسار السيولة والشلال VS تقرير مقارنة الفترات) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-2.5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubView('projections')}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${
              activeSubView === 'projections'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <span>{isAr ? 'مسار السيولة وشلال التدفق النقدي' : 'Liquidity Trajectory & Waterfall'}</span>
          </button>

          <button
            onClick={() => setActiveSubView('comparison')}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${
              activeSubView === 'comparison'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>{isAr ? '📊 تقرير مقارنة التدفق بين فترتين' : '📊 Period Cash Flow Comparison'}</span>
          </button>
        </div>

        <div className="text-[11px] font-medium text-slate-500 hidden md:block px-2">
          {activeSubView === 'projections'
            ? (isAr ? 'تتبع مسار الأرصدة التقديرية يومياً' : 'Tracking daily estimated liquidity burn')
            : (isAr ? 'مقارنة دقيقة للمقبوضات والمدفوعات بين تاريخين' : 'Comparing inflows & outflows across 2 date ranges')}
        </div>
      </div>

      {activeSubView === 'comparison' ? (
        <CashFlowPeriodComparison
          period={period}
          transactions={transactions}
          incomeItems={incomeItems}
          categories={categories}
          metrics={metrics}
          currentLanguage={currentLanguage}
          currentCurrency={currentCurrency}
        />
      ) : (
        <>
          {/* 1. INTERACTIVE ITEM CLICK SELECTOR BAR */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm text-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              {isAr ? 'تخصيص الرسم البياني بحسب البند أو الفئة:' : 'Filter Chart by Item or Category:'}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedFocusId('all')}
              className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
                selectedFocusId === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {isAr ? '🌐 كامل السيولة والميزانية' : '🌐 All Liquidity'}
            </button>
          </div>
        </div>

        {/* Scrollable Interactive Item Badges */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[10px] font-medium text-slate-500 whitespace-nowrap pl-1">
            {isAr ? 'انقر على أي بند للتفصيل:' : 'Click to inspect:'}
          </span>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedFocusId(cat.id)}
              className={`px-3 py-1 text-[11px] font-bold rounded-lg whitespace-nowrap border transition-all ${
                selectedFocusId === cat.id
                  ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              📁 {translateItemName(cat.name, currentLanguage)}
            </button>
          ))}

          {allExpenseItems.slice(0, 12).map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedFocusId(item.id)}
              className={`px-3 py-1 text-[11px] font-medium rounded-lg whitespace-nowrap border transition-all ${
                selectedFocusId === item.id
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              📌 {translateItemName(item.name, currentLanguage)} ({item.actual}/{item.budgeted})
            </button>
          ))}
        </div>
      </div>

      {/* 2. OVERVIEW CARDS (CLICKABLE FOR QUICK FILTER) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div 
          onClick={() => setSelectedFocusId('all')}
          className={`bg-white rounded-2xl border p-5 shadow-sm flex flex-col justify-between cursor-pointer transition-all hover:border-blue-400 ${
            selectedFocusId === 'all' ? 'border-2 border-blue-600 bg-blue-50/20' : 'border-slate-200/80'
          }`}
        >
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {isAr ? 'رصيد بداية الفترة' : 'Period Starting Balance'}
          </span>
          <span className="text-2xl font-bold font-mono text-slate-900 my-2">
            {formatCurrency(period.startingBankBalance)}
          </span>
          <div className="text-[11px] font-medium text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2.5">
            <span>{isAr ? 'السيولة المتاحة' : 'Liquid Reserves'}</span>
            <span className="text-slate-700 font-bold">{isAr ? 'حسابات بنكية' : 'Bank Liquidity'}</span>
          </div>
        </div>

        <div 
          onClick={() => setSelectedFocusId('all')}
          className="bg-white rounded-2xl border border-slate-200/80 p-5 text-slate-800 shadow-sm flex flex-col justify-between cursor-pointer hover:border-blue-400 transition-colors"
        >
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {isAr ? 'صافي التدفق النقدي المقدر' : 'Estimated Period Net Cash Flow'}
          </span>
          <span className="text-2xl font-bold font-mono text-slate-900 my-2 flex items-center gap-2">
            {formatCurrency(metrics.estimatedEndOfPeriodNetCashFlow, { showSign: true })}
            {metrics.estimatedEndOfPeriodNetCashFlow >= 0 ? (
              <ArrowUpRight className="w-5 h-5 text-emerald-600" />
            ) : (
              <ArrowDownRight className="w-5 h-5 text-rose-600" />
            )}
          </span>
          <div className="text-[11px] font-medium text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2.5">
            <span>{isAr ? 'إجمالي الدخل المتوقع' : 'Total Expected Inflow'}</span>
            <span className="text-blue-600 font-mono font-bold">{formatCurrency(metrics.totalExpectedIncome)}</span>
          </div>
        </div>

        <div 
          onClick={() => setSelectedFocusId('all')}
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between cursor-pointer hover:border-blue-400 transition-colors"
        >
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {isAr ? 'الرصيد المقدر بنهاية الشهر' : 'Estimated Month-End Balance'}
          </span>
          <span className="text-2xl font-bold font-mono text-blue-600 my-2">
            {formatCurrency(metrics.estimatedEndOfPeriodBankBalance)}
          </span>
          <div className="text-[11px] font-medium text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2.5">
            <span>{isAr ? 'النمو / التغير المتوقع' : 'Projected Delta'}</span>
            <span className={metrics.estimatedEndOfPeriodBankBalance >= period.startingBankBalance ? 'text-emerald-600 font-mono font-bold' : 'text-rose-600 font-mono font-bold'}>
              {formatPercent(((metrics.estimatedEndOfPeriodBankBalance - (period.startingBankBalance || 1)) / (period.startingBankBalance || 1)) * 100)}
            </span>
          </div>
        </div>
      </div>

      {/* 3. MAIN DYNAMIC CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Dynamic Trajectory / Item Burn Curve */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  {focusedItem ? (isAr ? 'تحليل تفصيلي للبند' : 'Line Item Detail') : (isAr ? 'ديناميكية التدفقات النقدية' : 'Cash Flow Dynamics')}
                </span>
                {selectedFocusId !== 'all' && (
                  <button
                    onClick={() => setSelectedFocusId('all')}
                    className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-lg hover:bg-slate-200 uppercase"
                  >
                    {isAr ? 'إعادة ضبط' : 'Reset'}
                  </button>
                )}
              </div>
              <p className="text-base font-bold text-slate-900 mt-0.5">
                {focusTitle}
              </p>
              <p className="text-xs text-slate-500 font-medium">
                {focusSubtitle}
              </p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase">
              <span className="flex items-center gap-1.5 text-blue-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" /> {focusedItem || focusedCategory ? (isAr ? 'المنفق الفعلي/المتوقع' : 'Actual/Projected') : (isAr ? 'الرصيد المتاح' : 'Projected Balance')}
              </span>
              <span className="text-slate-400 font-mono">{isAr ? `اليوم الحالي: ${period.currentDay}` : `Current: Day ${period.currentDay}`}</span>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trajectoryData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={focusedItem ? '#10b981' : '#2563eb'} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={focusedItem ? '#10b981' : '#2563eb'} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }}
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <Tooltip 
                  formatter={(value: any) => [formatCurrency(Number(value)), focusedItem || focusedCategory ? (isAr ? 'المبلغ' : 'Amount') : (isAr ? 'الرصيد' : 'Balance')]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', fontSize: '12px', fontWeight: 'bold', borderRadius: '12px' }}
                  itemStyle={{ color: '#60a5fa' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="projectedBalance" 
                  stroke={focusedItem ? '#10b981' : '#2563eb'} 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#balanceGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Budget vs Actual Side Bar Chart (CLICKABLE BARS) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm flex flex-col">
          <div className="mb-4 pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {isAr ? 'مقارنة الفئات' : 'Category Allocation'}
            </h3>
            <p className="text-base font-bold text-slate-900">
              {isAr ? 'الميزانية مقابل المنفق الفعلي' : 'Budget vs Actual Outflows'}
            </p>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {isAr ? 'انقر على أي شريط للتركيز عليه في الرسم' : 'Click on any bar to focus on it'}
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full cursor-pointer">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={categoryComparisonData} 
                layout="vertical" 
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload[0]) {
                    const id = e.activePayload[0].payload.id;
                    setSelectedFocusId(id);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `$${v}`} />
                <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fontWeight: 600, fill: '#334155' }} />
                <Tooltip 
                  formatter={(val: any, name: any) => [formatCurrency(Number(val)), name === 'Budget' ? (isAr ? 'الميزانية' : 'Budget') : (isAr ? 'الفعلي' : 'Actual')]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', fontSize: '11px', fontWeight: 'bold', borderRadius: '12px' }}
                />
                <Bar dataKey="Budget" fill="#cbd5e1" radius={[0, 4, 4, 0]} />
                <Bar dataKey="Actual" fill="#0f172a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-6 mt-2 pt-2.5 border-t border-slate-100 text-[10px] font-bold uppercase">
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" /> {isAr ? 'الميزانية' : 'Budget'}
            </span>
            <span className="flex items-center gap-1.5 text-slate-900">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900 inline-block" /> {isAr ? 'المنفق الفعلي' : 'Actual Outflow'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. CASH FLOW STEP-DOWN ANALYSIS / WATERFALL CARDS */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 p-6 rounded-2xl border border-slate-800/80 text-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {isAr ? 'معادلة تسوية نهاية الفترة' : 'End of Period Reconciliation'}
            </h3>
            <p className="text-sm font-bold text-white mt-0.5">
              {isAr ? 'معادلة التدفق النقدي: الرصيد الافتتاحي + الإيرادات الفعلية - المصروفات المتوقعة' : 'Net Cash Flow Equation: Starting Reserves + Total Inflow - Projected Outflows'}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-medium text-slate-400">{isAr ? 'صافي الفارق: ' : 'Net Delta: '}</span>
            <span className="text-base font-bold font-mono text-blue-400">
              {formatCurrency(metrics.estimatedEndOfPeriodNetCashFlow, { showSign: true })}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {waterfallData.map((item, idx) => (
            <div key={idx} className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60 flex flex-col justify-between">
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                {item.stage}
              </span>
              <span 
                className={`text-base font-bold font-mono mt-2 tracking-tight ${
                  item.amount < 0 ? 'text-rose-400' : idx === waterfallData.length - 1 ? 'text-emerald-400' : 'text-white'
                }`}
              >
                {formatCurrency(item.amount, { showSign: item.amount < 0 || idx === 1 })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
    )}
  </div>
  );
};
