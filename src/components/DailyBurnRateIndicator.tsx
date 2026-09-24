import React from 'react';
import { BudgetPeriod, FinancialMetrics } from '../types';
import { formatCurrency } from '../utils/calculations';
import { LanguageCode } from '../i18n/translations';
import { Flame, Clock, TrendingUp, AlertTriangle, CheckCircle2, Calendar, Target, ShieldAlert, Sparkles } from 'lucide-react';

interface DailyBurnRateIndicatorProps {
  metrics: FinancialMetrics;
  period: BudgetPeriod;
  currentLanguage?: LanguageCode;
}

export const DailyBurnRateIndicator: React.FC<DailyBurnRateIndicatorProps> = ({
  metrics,
  period,
  currentLanguage = 'ar',
}) => {
  const isAr = currentLanguage === 'ar';

  const daysElapsed = Math.max(1, period.currentDay);
  const daysTotal = Math.max(1, period.totalDays);
  const daysRemaining = Math.max(0, daysTotal - daysElapsed);

  // Time progress percentage
  const timeProgressPercent = Math.min(100, Math.round((daysElapsed / daysTotal) * 100));

  // Budget consumption percentage
  const budgetConsumedPercent =
    metrics.totalBudgetedExpense > 0
      ? (metrics.totalActualExpense / metrics.totalBudgetedExpense) * 100
      : 0;

  // Actual daily spending rate so far
  const actualDailyBurn = metrics.totalActualExpense / daysElapsed;

  // Planned target daily rate across the entire month
  const plannedDailyTarget = metrics.totalBudgetedExpense / daysTotal;

  // Remaining daily budget allowed for remaining days
  const remainingBudgetTotal = metrics.totalBudgetedExpense - metrics.totalActualExpense;
  const remainingDailyAllowance =
    daysRemaining > 0 ? Math.max(0, remainingBudgetTotal / daysRemaining) : 0;

  // Prorated month-end projected outflow based on current daily pace
  const projectedMonthlyOutflowAtCurrentPace = actualDailyBurn * daysTotal;
  const projectedVarianceVsBudget = metrics.totalBudgetedExpense - projectedMonthlyOutflowAtCurrentPace;

  // Daily Pace Status
  const isPaceAccelerated = actualDailyBurn > plannedDailyTarget * 1.15;
  const isOverBudget = metrics.totalActualExpense > metrics.totalBudgetedExpense;
  const isOptimalPace = actualDailyBurn <= plannedDailyTarget;

  return (
    <div className="bg-white text-slate-800 rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm font-arabic">
      {/* Header with Title & Day Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-600">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 flex-wrap">
              <span>{isAr ? 'مؤشر معدل المصروفات وسرعة الإنفاق اليومي' : 'Daily Expense Rate & Burn Pace Indicator'}</span>
              <span
                className={`text-[10px] px-2.5 py-0.5 rounded-full uppercase font-bold border ${
                  isOverBudget
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : isPaceAccelerated
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {isOverBudget
                  ? (isAr ? 'تجاوز الميزانية' : 'OVER BUDGET')
                  : isPaceAccelerated
                  ? (isAr ? 'وتيرة صرف متسارعة' : 'ACCELERATED PACE')
                  : (isAr ? 'وتيرة منضبطة' : 'ON TARGET')}
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              {isAr
                ? `اليوم ${daysElapsed} من أصل ${daysTotal} يوماً (${daysRemaining} يوم متبقي في الشهر)`
                : `Day ${daysElapsed} of ${daysTotal} (${daysRemaining} days remaining in month)`}
            </p>
          </div>
        </div>

        {/* Quick Summary Pill */}
        <div className="flex items-center gap-2 text-xs font-mono bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-slate-500">{isAr ? 'انقضى من الشهر:' : 'Month Elapsed:'}</span>
          <span className="font-bold text-slate-900">{timeProgressPercent}%</span>
        </div>
      </div>

      {/* Grid of Key Daily Burn Rate Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {/* 1. Actual Daily Burn Rate */}
        <div className="bg-slate-50/80 rounded-xl border border-slate-200/80 p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            {isAr ? 'متوسط الصرف اليومي الفعلي' : 'Actual Daily Burn Rate'}
          </span>
          <div className="text-xl font-bold font-mono text-rose-600">
            {formatCurrency(actualDailyBurn)}
            <span className="text-[10px] font-normal text-slate-500 font-sans"> {isAr ? '/ يوم' : '/ day'}</span>
          </div>
          <span className="text-[10px] text-slate-500 block">
            {isAr
              ? `إجمالي المنفق: ${formatCurrency(metrics.totalActualExpense)}`
              : `Total spent: ${formatCurrency(metrics.totalActualExpense)}`}
          </span>
        </div>

        {/* 2. Planned Target Daily Allowance */}
        <div className="bg-slate-50/80 rounded-xl border border-slate-200/80 p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            {isAr ? 'المعدل اليومي المخطط له' : 'Target Daily Allowance'}
          </span>
          <div className="text-xl font-bold font-mono text-blue-600">
            {formatCurrency(plannedDailyTarget)}
            <span className="text-[10px] font-normal text-slate-500 font-sans"> {isAr ? '/ يوم' : '/ day'}</span>
          </div>
          <span className="text-[10px] text-slate-500 block">
            {isAr
              ? `الميزانية الشهرية: ${formatCurrency(metrics.totalBudgetedExpense)}`
              : `Budget total: ${formatCurrency(metrics.totalBudgetedExpense)}`}
          </span>
        </div>

        {/* 3. Remaining Daily Safe Spending Limit */}
        <div className="bg-slate-50/80 rounded-xl border border-slate-200/80 p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            {isAr ? 'المسموح يومياً للأيام المتبقية' : 'Remaining Daily Safe Limit'}
          </span>
          <div
            className={`text-xl font-bold font-mono ${
              remainingDailyAllowance > 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {formatCurrency(remainingDailyAllowance)}
            <span className="text-[10px] font-normal text-slate-500 font-sans"> {isAr ? '/ يوم' : '/ day'}</span>
          </div>
          <span className="text-[10px] text-slate-500 block">
            {isAr
              ? `المتبقي في الميزانية: ${formatCurrency(Math.max(0, remainingBudgetTotal))}`
              : `Budget balance: ${formatCurrency(Math.max(0, remainingBudgetTotal))}`}
          </span>
        </div>

        {/* 4. Projected End-of-Month Forecast at current rate */}
        <div className="bg-slate-50/80 rounded-xl border border-slate-200/80 p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            {isAr ? 'التوقع لنهاية الشهر بالوتيرة الحالية' : 'Projected Month Outflow'}
          </span>
          <div
            className={`text-xl font-bold font-mono ${
              projectedVarianceVsBudget >= 0 ? 'text-emerald-600' : 'text-amber-600'
            }`}
          >
            {formatCurrency(projectedMonthlyOutflowAtCurrentPace)}
          </div>
          <span
            className={`text-[10px] font-bold block ${
              projectedVarianceVsBudget >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {isAr ? 'الفارق المتوقع:' : 'Expected Variance:'}{' '}
            {formatCurrency(projectedVarianceVsBudget, { showSign: true })}
          </span>
        </div>
      </div>

      {/* Dual Comparative Progress Bar: Time Elapsed vs Budget Consumed */}
      <div className="mt-4 pt-4 border-t border-slate-100 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-700 flex items-center gap-1.5 font-sans font-medium">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>
              {isAr ? 'مقارنة استهلاك الميزانية مع انقضاء أيام الشهر' : 'Budget Consumed vs Days Elapsed'}
            </span>
          </span>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-blue-600 font-bold">
              {isAr ? 'انقضى من الأيام:' : 'Days:'} {timeProgressPercent}%
            </span>
            <span className={budgetConsumedPercent > 100 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
              {isAr ? 'استهلاك الميزانية:' : 'Budget:'} {budgetConsumedPercent.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Dual Stacked / Comparative Bar */}
        <div className="space-y-2">
          {/* Days Progress Bar */}
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden relative border border-slate-200/60" title="Days Elapsed">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${timeProgressPercent}%` }}
            />
          </div>

          {/* Budget Consumption Bar */}
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden relative border border-slate-200/60" title="Budget Consumed">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                budgetConsumedPercent > 100
                  ? 'bg-rose-500'
                  : budgetConsumedPercent > timeProgressPercent + 10
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, budgetConsumedPercent)}%` }}
            />
          </div>
        </div>

        {/* Smart Advice Line */}
        <div className="flex items-center gap-2 text-[11px] text-slate-600 pt-1 font-sans">
          {isOverBudget ? (
            <>
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="text-rose-700 font-bold">
                {isAr
                  ? 'تحذير: تم استنفاد كامل ميزانية الشهر قبل نهاية الفترة. يُوصى بوقف الصرف المتغير فوراً.'
                  : 'Alert: Monthly budget exhausted before month end. Halting variable outflows recommended.'}
              </span>
            </>
          ) : isPaceAccelerated ? (
            <>
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-amber-700 font-medium">
                {isAr
                  ? `معدل الصرف اليومي أعلى من المخطط. لضبط الميزانية، حافظ على حد أقصى قدره ${formatCurrency(remainingDailyAllowance)} يومياً.`
                  : `Spending pace is faster than elapsed days. Cap daily spend at ${formatCurrency(remainingDailyAllowance)} to stay on budget.`}
              </span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-emerald-700 font-medium">
                {isAr
                  ? 'ممتاز! وتيرة الصرف اليومية منضبطة وضمن النطاق الآمن المخطط له.'
                  : 'Great! Daily spend rate is within the safe target envelope.'}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
