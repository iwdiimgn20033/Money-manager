import React, { useState, useEffect, useMemo } from 'react';
import { BudgetPeriod, CurrencyInfo, ExpenseCategory, ExpenseItem, FinancialMetrics, IncomeItem } from '../types';
import { formatCurrency, formatPercent } from '../utils/calculations';
import { translateItemName } from '../utils/localization';
import { LanguageCode } from '../i18n/translations';
import { 
  Sliders, RotateCcw, ArrowRight, CheckCircle2, AlertTriangle, 
  TrendingUp, TrendingDown, DollarSign, Layers, Sparkles, Scale, Percent
} from 'lucide-react';

interface BudgetSimulatorProps {
  metrics: FinancialMetrics;
  period: BudgetPeriod;
  incomeItems: IncomeItem[];
  categories: ExpenseCategory[];
  currentLanguage?: LanguageCode;
  currentCurrency?: CurrencyInfo;
}

interface TopExpenseSimState {
  id: string;
  categoryId: string;
  name: string;
  categoryName: string;
  baselineBudgeted: number;
  simulatedAmount: number;
}

export const BudgetSimulator: React.FC<BudgetSimulatorProps> = ({
  metrics,
  period,
  incomeItems,
  categories,
  currentLanguage = 'ar',
  currentCurrency,
}) => {
  const isAr = currentLanguage === 'ar';

  // 1. Flatten all expense items to extract the top 3 largest items
  const allItemsWithCat = useMemo(() => {
    return categories.flatMap((cat) =>
      cat.items.map((item) => ({
        ...item,
        categoryId: cat.id,
        categoryName: cat.name,
      }))
    );
  }, [categories]);

  // Find top 3 expenses by baseline amount (budgeted or actual, whichever is greater)
  const defaultTop3 = useMemo(() => {
    const sorted = [...allItemsWithCat].sort((a, b) => {
      const valA = Math.max(a.budgeted, a.actual);
      const valB = Math.max(b.budgeted, b.actual);
      return valB - valA;
    });
    return sorted.slice(0, 3);
  }, [allItemsWithCat]);

  // Baseline values
  const baselineTotalIncome = metrics.totalExpectedIncome;
  const baselineTotalExpense = metrics.projectedMonthEndExpense;
  const baselineNetCashFlow = metrics.estimatedEndOfPeriodNetCashFlow;
  const baselineEndBalance = metrics.estimatedEndOfPeriodBankBalance;

  // 2. Simulator States
  // Box 1: Simulated Total Income
  const [simulatedIncome, setSimulatedIncome] = useState<number>(baselineTotalIncome);

  // Box 2: Baseline Non-Top3 Expense Base
  // When top 3 items change, we adjust the total expense based on the difference in top 3 items
  const [simulatedExpenseDirect, setSimulatedExpenseDirect] = useState<number>(baselineTotalExpense);
  const [useDirectExpenseOverride, setUseDirectExpenseOverride] = useState<boolean>(false);

  // Box 3: Top 3 Expenses in Scenario
  const [topExpenses, setTopExpenses] = useState<TopExpenseSimState[]>(() => {
    return defaultTop3.map((item) => ({
      id: item.id,
      categoryId: item.categoryId,
      name: item.name,
      categoryName: item.categoryName,
      baselineBudgeted: item.budgeted || item.actual || 0,
      simulatedAmount: item.budgeted || item.actual || 0,
    }));
  });

  // Sync state if baseline data changes and user hasn't overridden
  useEffect(() => {
    setSimulatedIncome(metrics.totalExpectedIncome);
    setSimulatedExpenseDirect(metrics.projectedMonthEndExpense);
    setTopExpenses(
      defaultTop3.map((item) => ({
        id: item.id,
        categoryId: item.categoryId,
        name: item.name,
        categoryName: item.categoryName,
        baselineBudgeted: item.budgeted || item.actual || 0,
        simulatedAmount: item.budgeted || item.actual || 0,
      }))
    );
    setUseDirectExpenseOverride(false);
  }, [metrics.totalExpectedIncome, metrics.projectedMonthEndExpense, defaultTop3]);

  // Calculate difference from top 3 adjustments
  const top3BaselineSum = topExpenses.reduce((sum, item) => sum + item.baselineBudgeted, 0);
  const top3SimulatedSum = topExpenses.reduce((sum, item) => sum + item.simulatedAmount, 0);
  const top3Variance = top3SimulatedSum - top3BaselineSum;

  // Final Simulated Total Expense
  const finalSimulatedExpense = useDirectExpenseOverride
    ? simulatedExpenseDirect
    : Math.max(0, baselineTotalExpense + top3Variance);

  // Final Simulated Net Cash Flow & End Balance
  const simulatedNetCashFlow = simulatedIncome - finalSimulatedExpense;
  const simulatedEndBalance = period.startingBankBalance + simulatedNetCashFlow;

  // Deltas (Scenario vs Baseline)
  const incomeDelta = simulatedIncome - baselineTotalIncome;
  const expenseDelta = finalSimulatedExpense - baselineTotalExpense;
  const netCashFlowDelta = simulatedNetCashFlow - baselineNetCashFlow;
  const endBalanceDelta = simulatedEndBalance - baselineEndBalance;

  // Handler for Top 3 Item changes
  const handleTopExpenseAmountChange = (index: number, newAmount: number) => {
    setUseDirectExpenseOverride(false);
    setTopExpenses((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = {
          ...updated[index],
          simulatedAmount: Math.max(0, newAmount),
        };
      }
      return updated;
    });
  };

  // Handler for swapping an item in Top 3
  const handleTopExpenseItemSwap = (index: number, newItemId: string) => {
    const found = allItemsWithCat.find((i) => i.id === newItemId);
    if (!found) return;
    setUseDirectExpenseOverride(false);
    setTopExpenses((prev) => {
      const updated = [...prev];
      updated[index] = {
        id: found.id,
        categoryId: found.categoryId,
        name: found.name,
        categoryName: found.categoryName,
        baselineBudgeted: found.budgeted || found.actual || 0,
        simulatedAmount: found.budgeted || found.actual || 0,
      };
      return updated;
    });
  };

  // Reset Simulator to exact Baseline
  const handleResetSimulator = () => {
    setSimulatedIncome(baselineTotalIncome);
    setSimulatedExpenseDirect(baselineTotalExpense);
    setUseDirectExpenseOverride(false);
    setTopExpenses(
      defaultTop3.map((item) => ({
        id: item.id,
        categoryId: item.categoryId,
        name: item.name,
        categoryName: item.categoryName,
        baselineBudgeted: item.budgeted || item.actual || 0,
        simulatedAmount: item.budgeted || item.actual || 0,
      }))
    );
  };

  return (
    <div id="budget-simulator-container" className="space-y-6 font-arabic" dir={isAr ? 'rtl' : 'ltr'}>
      {/* 1. Header Banner */}
      <div className="bg-white text-slate-800 p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-600" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
              {isAr ? 'محاكي الميزانية والسيناريوهات المالية' : 'Sensitivity & Budget Scenario Simulator'}
            </h2>
          </div>
          <p className="text-base sm:text-lg font-bold text-slate-900 mt-1">
            {isAr
              ? 'تعديل الإيرادات، المصروفات، وأكبر 3 بنود لاحتساب الفارق وصافي التدفق مباشرة'
              : 'Simulate Income, Expenses, & Top 3 Outflows to project net cash flow impact'}
          </p>
        </div>

        <button
          onClick={handleResetSimulator}
          className="self-start md:self-auto bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
          <span>{isAr ? 'إعادة التعيين للأصل' : 'Reset to Baseline'}</span>
        </button>
      </div>

      {/* 2. THE THREE MAIN INPUT COLUMNS / CARDS (الخانات الثلاث الرئيسية) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* KHANA 1: إجمالي الإيراد المتوقع */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-400/80 transition-colors">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <span className="text-[11px] font-bold text-blue-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                {isAr ? 'الخانة 1: إجمالي الإيراد المتوقع' : 'Box 1: Total Expected Income'}
              </span>
              <span className="text-[11px] font-bold text-slate-400 font-mono">
                {isAr ? 'الأساسي:' : 'Base:'} {formatCurrency(baselineTotalIncome)}
              </span>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                {isAr ? 'قيمة الإيراد في السيناريو ($)' : 'Simulated Income Value ($)'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="50"
                  value={simulatedIncome}
                  onChange={(e) => setSimulatedIncome(parseFloat(e.target.value) || 0)}
                  className="w-full text-lg font-mono font-bold px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 text-slate-900 bg-slate-50/60"
                />
              </div>
            </div>

            {/* Quick Adjustment Slider for Income */}
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-[11px] font-bold text-slate-600">
                <span>{isAr ? 'تعديل النسبة مئوية:' : 'Adjust Percentage:'}</span>
                <span className="font-mono text-blue-600 font-bold">
                  {baselineTotalIncome > 0 ? `${((simulatedIncome / baselineTotalIncome) * 100).toFixed(0)}%` : '100%'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={Math.max(20000, baselineTotalIncome * 2 || 20000)}
                step="100"
                value={simulatedIncome}
                onChange={(e) => setSimulatedIncome(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-bold text-slate-400 font-mono">
                <span>$0</span>
                <span>{isAr ? 'الأساس' : 'Base'} ({formatCurrency(baselineTotalIncome)})</span>
                <span>{formatCurrency(Math.max(20000, baselineTotalIncome * 2 || 20000))}</span>
              </div>
            </div>
          </div>

          {/* Delta Pill for Income */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">{isAr ? 'الفارق عن الأساس:' : 'Income Delta:'}</span>
            <span className={`font-mono font-bold px-2 py-0.5 rounded-full text-xs ${incomeDelta >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              {formatCurrency(incomeDelta, { showSign: true })}
            </span>
          </div>
        </div>

        {/* KHANA 2: إجمالي المصروف المتوقع */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-800 transition-colors">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-900 inline-block" />
                {isAr ? 'الخانة 2: إجمالي المصروف المتوقع' : 'Box 2: Total Expected Expense'}
              </span>
              <span className="text-[11px] font-bold text-slate-400 font-mono">
                {isAr ? 'الأساسي:' : 'Base:'} {formatCurrency(baselineTotalExpense)}
              </span>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  {isAr ? 'إجمالي المصروف المحاكى ($)' : 'Simulated Total Expense ($)'}
                </label>
                {useDirectExpenseOverride && (
                  <span className="text-[9px] font-bold px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200/70 rounded-full">
                    {isAr ? 'تعديل مباشر' : 'Direct Edit'}
                  </span>
                )}
              </div>
              <input
                type="number"
                step="50"
                value={Math.round(finalSimulatedExpense)}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setSimulatedExpenseDirect(val);
                  setUseDirectExpenseOverride(true);
                }}
                className="w-full text-lg font-mono font-bold px-3 py-2 border border-slate-200 rounded-xl focus:border-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-100 text-slate-900 bg-slate-50/60"
              />
            </div>

            {/* Quick Adjustment Slider for Expenses */}
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-[11px] font-bold text-slate-600">
                <span>{isAr ? 'تعديل إجمالي المصروفات:' : 'Adjust Outflow Slider:'}</span>
                <span className="font-mono text-slate-900 font-bold">
                  {baselineTotalExpense > 0 ? `${((finalSimulatedExpense / baselineTotalExpense) * 100).toFixed(0)}%` : '100%'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={Math.max(20000, baselineTotalExpense * 2 || 20000)}
                step="100"
                value={finalSimulatedExpense}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSimulatedExpenseDirect(val);
                  setUseDirectExpenseOverride(true);
                }}
                className="w-full h-2 bg-slate-100 rounded-lg accent-slate-900 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-bold text-slate-400 font-mono">
                <span>$0</span>
                <span>{isAr ? 'الأساس' : 'Base'} ({formatCurrency(baselineTotalExpense)})</span>
                <span>{formatCurrency(Math.max(20000, baselineTotalExpense * 2 || 20000))}</span>
              </div>
            </div>
          </div>

          {/* Delta Pill for Expense */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">{isAr ? 'الفارق عن الأساس:' : 'Expense Delta:'}</span>
            <span className={`font-mono font-bold px-2 py-0.5 rounded-full text-xs ${expenseDelta <= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              {formatCurrency(expenseDelta, { showSign: true })}
            </span>
          </div>
        </div>

        {/* KHANA 3: أكبر 3 مصاريف في السيناريو */}
        <div className="bg-white rounded-2xl border border-emerald-200/80 p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                {isAr ? 'الخانة 3: أكبر 3 مصاريف في السيناريو' : 'Box 3: Top 3 Expenses in Scenario'}
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {topExpenses.length} {isAr ? 'بنود رئيسية' : 'Key Items'}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 mt-1 font-medium leading-relaxed">
              {isAr
                ? 'تعديل أي بند من هذه المصاريف الكبرى يعيد احتساب إجمالي المصروف وفارق السيناريو فوراً:'
                : 'Modifying any of these 3 major expense lines automatically recalculates scenario totals:'}
            </p>

            {/* Top 3 List */}
            <div className="space-y-3 mt-3">
              {topExpenses.length === 0 ? (
                <div className="text-xs text-slate-400 italic py-2">
                  {isAr ? 'لم يتم العثور على بنود مصروفات كافية' : 'No expense items available'}
                </div>
              ) : (
                topExpenses.map((topItem, idx) => {
                  const itemDelta = topItem.simulatedAmount - topItem.baselineBudgeted;
                  return (
                    <div key={`${topItem.id}-${idx}`} className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        {/* Dropdown to switch item if user desires */}
                        <select
                          value={topItem.id}
                          onChange={(e) => handleTopExpenseItemSwap(idx, e.target.value)}
                          className="text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-lg px-2 py-1 max-w-[170px] truncate"
                          title="Click to switch this top expense item"
                        >
                          {allItemsWithCat.map((cand) => (
                            <option key={cand.id} value={cand.id}>
                              {translateItemName(cand.name, currentLanguage)} ({formatCurrency(cand.budgeted || cand.actual)})
                            </option>
                          ))}
                        </select>

                        <span className="text-[10px] font-mono text-slate-400">
                          {isAr ? 'الأصل:' : 'Base:'} {formatCurrency(topItem.baselineBudgeted)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            type="number"
                            step="10"
                            value={topItem.simulatedAmount}
                            onChange={(e) => handleTopExpenseAmountChange(idx, parseFloat(e.target.value) || 0)}
                            className="w-full text-xs font-mono font-bold px-2.5 py-1 bg-white border border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                            placeholder="0.00"
                          />
                        </div>

                        {/* Quick +/- 10% buttons */}
                        <button
                          onClick={() => handleTopExpenseAmountChange(idx, Math.round(topItem.simulatedAmount * 0.9))}
                          className="px-2 py-1 text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg transition-colors"
                          title="Reduce by 10%"
                        >
                          -10%
                        </button>
                        <button
                          onClick={() => handleTopExpenseAmountChange(idx, Math.round(topItem.simulatedAmount * 1.1))}
                          className="px-2 py-1 text-[10px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg transition-colors"
                          title="Increase by 10%"
                        >
                          +10%
                        </button>
                      </div>

                      {/* Variance per item */}
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-slate-500">{isAr ? 'فارق هذا البند:' : 'Item delta:'}</span>
                        <span className={itemDelta <= 0 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                          {formatCurrency(itemDelta, { showSign: true })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Top 3 Total Delta */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">{isAr ? 'مجموع فارق أكبر 3 مصاريف:' : 'Top 3 Sum Delta:'}</span>
            <span className={`font-mono font-bold px-2 py-0.5 rounded-full text-xs ${top3Variance <= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              {formatCurrency(top3Variance, { showSign: true })}
            </span>
          </div>
        </div>

      </div>

      {/* 3. DYNAMIC SCENARIO OUTCOME & COMPARISON (احتساب الفارق والنتائج بين الأساسي والمحاكى) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main High-Impact Simulation Card */}
        <div className="lg:col-span-7 bg-white text-slate-800 p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                {isAr ? 'نتيجة السيناريو المحاكى النهائي' : 'Final Simulated Scenario Result'}
              </span>
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                {isAr ? 'تحديث لحظي' : 'Live Recalculated'}
              </span>
            </div>

            <div className="my-5">
              <span className="text-xs font-bold text-slate-500 block tracking-wider">
                {isAr ? 'صافي التدفق النقدي المحاكى (Simulated Net Cash Flow)' : 'Simulated Net Cash Flow'}
              </span>
              <div className="text-3xl sm:text-5xl font-mono font-extrabold text-slate-900 mt-1">
                {formatCurrency(simulatedNetCashFlow, { showSign: true })}
              </div>

              {/* Net Cash Flow Delta from Baseline */}
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-slate-500">
                  {isAr ? 'الفارق عن خط الأساس الفعلي:' : 'Net Delta from Baseline:'}
                </span>
                <span className={`px-2.5 py-1 text-xs font-mono font-bold rounded-full flex items-center gap-1 ${
                  netCashFlowDelta >= 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {netCashFlowDelta >= 0 ? <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> : <TrendingDown className="w-3.5 h-3.5 text-rose-600" />}
                  {formatCurrency(netCashFlowDelta, { showSign: true })}
                </span>
              </div>
            </div>
          </div>

          {/* Grid of Simulated Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-4 text-xs">
            <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">
                {isAr ? 'رصيد نهاية الفترة المقدر' : 'Simulated End Balance'}
              </span>
              <span className="text-base sm:text-lg font-bold font-mono text-slate-900 mt-0.5 block">
                {formatCurrency(simulatedEndBalance)}
              </span>
              <span className={`text-[10px] font-mono font-bold ${endBalanceDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formatCurrency(endBalanceDelta, { showSign: true })}
              </span>
            </div>

            <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">
                {isAr ? 'إجمالي الإيراد المحاكى' : 'Simulated Total Inflow'}
              </span>
              <span className="text-base sm:text-lg font-bold font-mono text-blue-600 mt-0.5 block">
                {formatCurrency(simulatedIncome)}
              </span>
              <span className={`text-[10px] font-mono font-bold ${incomeDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formatCurrency(incomeDelta, { showSign: true })}
              </span>
            </div>

            <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">
                {isAr ? 'إجمالي المصروف المحاكى' : 'Simulated Total Outflow'}
              </span>
              <span className="text-base sm:text-lg font-bold font-mono text-amber-600 mt-0.5 block">
                {formatCurrency(finalSimulatedExpense)}
              </span>
              <span className={`text-[10px] font-mono font-bold ${expenseDelta <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formatCurrency(expenseDelta, { showSign: true })}
              </span>
            </div>
          </div>
        </div>

        {/* Comparison Table: Baseline vs Simulated Matrix */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-slate-700" />
                {isAr ? 'مقارنة السيناريو بالأساس الفعلي' : 'Scenario vs Baseline Matrix'}
              </h3>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold uppercase text-slate-600 border-b border-slate-200">
                    <th className="py-2.5 px-3 rounded-s-lg">{isAr ? 'المؤشر المالي' : 'Metric'}</th>
                    <th className="py-2.5 px-2 text-right">{isAr ? 'الأساسي' : 'Baseline'}</th>
                    <th className="py-2.5 px-2 text-right">{isAr ? 'السيناريو' : 'Scenario'}</th>
                    <th className="py-2.5 px-2 text-right rounded-e-lg">{isAr ? 'الفارق' : 'Delta'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  <tr>
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-800">{isAr ? 'إجمالي الإيرادات' : 'Total Inflow'}</td>
                    <td className="py-2.5 px-2 text-right text-slate-600">{formatCurrency(baselineTotalIncome)}</td>
                    <td className="py-2.5 px-2 text-right font-bold text-slate-900">{formatCurrency(simulatedIncome)}</td>
                    <td className={`py-2.5 px-2 text-right font-bold ${incomeDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {formatCurrency(incomeDelta, { showSign: true })}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-800">{isAr ? 'إجمالي المصروفات' : 'Total Outflow'}</td>
                    <td className="py-2.5 px-2 text-right text-slate-600">{formatCurrency(baselineTotalExpense)}</td>
                    <td className="py-2.5 px-2 text-right font-bold text-slate-900">{formatCurrency(finalSimulatedExpense)}</td>
                    <td className={`py-2.5 px-2 text-right font-bold ${expenseDelta <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {formatCurrency(expenseDelta, { showSign: true })}
                    </td>
                  </tr>

                  <tr className="bg-blue-50/50">
                    <td className="py-2.5 px-3 font-sans font-bold text-blue-900">{isAr ? 'صافي التدفق النقدي' : 'Net Cash Flow'}</td>
                    <td className="py-2.5 px-2 text-right text-slate-600">{formatCurrency(baselineNetCashFlow, { showSign: true })}</td>
                    <td className="py-2.5 px-2 text-right font-bold text-blue-700">{formatCurrency(simulatedNetCashFlow, { showSign: true })}</td>
                    <td className={`py-2.5 px-2 text-right font-bold ${netCashFlowDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {formatCurrency(netCashFlowDelta, { showSign: true })}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-800">{isAr ? 'رصيد نهاية الشهر' : 'Month-End Balance'}</td>
                    <td className="py-2.5 px-2 text-right text-slate-600">{formatCurrency(baselineEndBalance)}</td>
                    <td className="py-2.5 px-2 text-right font-bold text-slate-900">{formatCurrency(simulatedEndBalance)}</td>
                    <td className={`py-2.5 px-2 text-right font-bold ${endBalanceDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {formatCurrency(endBalanceDelta, { showSign: true })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Safety Margin or Deficit Callout */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-3">
            <div className={`p-2.5 rounded-xl font-bold ${simulatedNetCashFlow >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {simulatedNetCashFlow >= 0 ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">
                {simulatedNetCashFlow >= 0 
                  ? (isAr ? 'فائض أمان في السيولة النقدية' : 'Healthy Liquidity Surplus') 
                  : (isAr ? 'تحذير عجز مالي محتمل' : 'Projected Deficit Warning')}
              </div>
              <div className="text-[11px] text-slate-500 font-normal">
                {simulatedNetCashFlow >= 0
                  ? (isAr 
                      ? `يحافظ السيناريو على فائض نقدي قدره ${formatCurrency(simulatedNetCashFlow)} بنهاية الفترة.` 
                      : `The scenario retains ${formatCurrency(simulatedNetCashFlow)} surplus by end of period.`)
                  : (isAr
                      ? `يتطلب السيناريو سحب ${formatCurrency(Math.abs(simulatedNetCashFlow))} من الاحتياطي لتغطية الفارق.`
                      : `Requires ${formatCurrency(Math.abs(simulatedNetCashFlow))} from reserves to cover period gap.`)}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
