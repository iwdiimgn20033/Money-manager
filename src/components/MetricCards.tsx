import React from 'react';
import { FinancialMetrics } from '../types';
import { formatCurrency, formatPercent } from '../utils/calculations';
import { TrendingUp, TrendingDown, CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft, Wallet, CreditCard, Activity, DollarSign } from 'lucide-react';
import { LanguageCode, TRANSLATIONS } from '../i18n/translations';

interface MetricCardsProps {
  metrics: FinancialMetrics;
  onViewCashFlowDetails?: () => void;
  currentLanguage?: LanguageCode;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ 
  metrics, 
  onViewCashFlowDetails,
  currentLanguage = 'ar' 
}) => {
  const isUnderBudget = metrics.netExpenseVariance >= 0;
  const isAr = currentLanguage === 'ar';
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  return (
    <section id="metric-cards-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {/* 1. Total Budgeted */}
      <div 
        id="card-total-budgeted"
        className="bg-white/80 backdrop-blur-xl p-4.5 rounded-2xl border border-white/60 hover:border-blue-300/80 hover:shadow-xl hover:shadow-blue-500/10 transition-all flex flex-col justify-between group shadow-md shadow-slate-200/50"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-500/15 text-blue-600 flex items-center justify-center transition-transform group-hover:scale-105 border border-blue-400/20">
              <CreditCard className="w-4.5 h-4.5" strokeWidth={1.75} />
            </div>
            <span className="text-xs font-bold text-slate-600 font-arabic">
              {isAr ? 'إجمالي الميزانية' : 'Total Budgeted'}
            </span>
          </div>
          <span className="text-[10px] font-bold text-slate-600 bg-slate-200/60 border border-slate-300/60 px-2.5 py-0.5 rounded-full font-arabic backdrop-blur-xs">
            {isAr ? 'المخطط' : 'Planned'}
          </span>
        </div>
        
        <div className="my-3">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-latin">
            {formatCurrency(metrics.totalBudgetedExpense)}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 border-t border-slate-200/60 pt-2.5 font-arabic">
          <span>{isAr ? 'الدخل المتوقع' : 'Expected Income'}</span>
          <span className="text-slate-900 font-bold font-latin">{formatCurrency(metrics.totalExpectedIncome)}</span>
        </div>
      </div>

      {/* 2. Actual Spent */}
      <div 
        id="card-actual-spent"
        className="bg-white/80 backdrop-blur-xl p-4.5 rounded-2xl border border-white/60 hover:border-amber-300/80 hover:shadow-xl hover:shadow-amber-500/10 transition-all flex flex-col justify-between group shadow-md shadow-slate-200/50"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center transition-transform group-hover:scale-105 border border-amber-400/20">
              <DollarSign className="w-4.5 h-4.5" strokeWidth={1.75} />
            </div>
            <span className="text-xs font-bold text-slate-600 font-arabic">
              {isAr ? 'الإنفاق الفعلي' : 'Actual Spent'}
            </span>
          </div>
          <span className="text-[10px] font-bold text-slate-600 bg-slate-200/60 border border-slate-300/60 px-2.5 py-0.5 rounded-full font-arabic backdrop-blur-xs">
            {isAr ? 'المنفذ' : 'MTD Spent'}
          </span>
        </div>

        <div className="my-3">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-latin">
            {formatCurrency(metrics.totalActualExpense)}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 border-t border-slate-200/60 pt-2.5 font-arabic">
          <span>{isAr ? 'معدل الحرق اليومي' : 'Burn Velocity'}</span>
          <span className="text-slate-900 font-bold font-latin">{formatCurrency(metrics.burnRatePerDay)}/{isAr ? 'يوم' : 'day'}</span>
        </div>
      </div>

      {/* 3. Net Variance */}
      <div 
        id="card-net-variance"
        className="bg-white/80 backdrop-blur-xl p-4.5 rounded-2xl border border-white/60 hover:shadow-xl hover:shadow-emerald-500/10 transition-all flex flex-col justify-between group shadow-md shadow-slate-200/50"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 border ${
              isUnderBudget ? 'bg-emerald-500/15 text-emerald-600 border-emerald-400/20' : 'bg-rose-500/15 text-rose-600 border-rose-400/20'
            }`}>
              <Activity className="w-4.5 h-4.5" strokeWidth={1.75} />
            </div>
            <span className="text-xs font-bold text-slate-600 font-arabic">
              {isAr ? 'الفائض / العجز' : 'Net Variance'}
            </span>
          </div>

          <span
            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 font-arabic backdrop-blur-xs ${
              isUnderBudget 
                ? 'bg-emerald-500/15 text-emerald-700 border border-emerald-300/70' 
                : 'bg-rose-500/15 text-rose-700 border border-rose-300/70'
            }`}
          >
            {isUnderBudget ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-600" strokeWidth={2} />
                <span>{isAr ? 'ضمن الميزانية' : 'Under Budget'}</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3 h-3 text-rose-600" strokeWidth={2} />
                <span>{isAr ? 'تجاوز للميزانية' : 'Over Budget'}</span>
              </>
            )}
          </span>
        </div>

        <div className="my-3">
          <span
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-latin ${
              isUnderBudget ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {formatCurrency(metrics.netExpenseVariance, { showSign: true })}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 border-t border-slate-200/60 pt-2.5 font-arabic">
          <span>{isAr ? 'نسبة الانحراف' : 'Variance %'}</span>
          <span className={`font-bold font-latin ${isUnderBudget ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatPercent(metrics.expenseVariancePercentage)}
          </span>
        </div>
      </div>

      {/* 4. Estimated Net Cash Flow (Gradient Translucent Luxury Card) */}
      <div 
        id="card-estimated-cash-flow"
        onClick={onViewCashFlowDetails}
        className="bg-gradient-to-br from-blue-600/90 via-indigo-600/90 to-indigo-800/90 backdrop-blur-xl p-4.5 rounded-2xl shadow-lg shadow-indigo-500/25 border border-white/20 text-white cursor-pointer hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/20 text-white flex items-center justify-center backdrop-blur-md border border-white/20">
              <Wallet className="w-4.5 h-4.5" strokeWidth={1.75} />
            </div>
            <span className="text-xs font-bold text-blue-100 font-arabic">
              {isAr ? 'صافي التدفق النقدي' : 'Est. Net Cash Flow'}
            </span>
          </div>

          <span className="text-[10px] font-bold bg-white/20 text-white px-2.5 py-0.5 rounded-full font-arabic backdrop-blur-md border border-white/20">
            {isAr ? 'نهاية الفترة' : 'End Period'}
          </span>
        </div>

        <div className="my-3 flex items-center justify-between">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-latin">
            {formatCurrency(metrics.estimatedEndOfPeriodNetCashFlow, { showSign: true })}
          </span>
          {isAr ? (
            <ArrowLeft className="w-5 h-5 text-blue-200 group-hover:-translate-x-1.5 transition-transform" strokeWidth={2} />
          ) : (
            <ArrowRight className="w-5 h-5 text-blue-200 group-hover:translate-x-1.5 transition-transform" strokeWidth={2} />
          )}
        </div>

        <div className="flex items-center justify-between text-xs font-medium text-blue-100 border-t border-white/20 pt-2.5 font-arabic">
          <span>{isAr ? 'الرصيد الختامي المتوقع' : 'Proj. Ending Balance'}</span>
          <span className="text-white font-black font-latin">
            {formatCurrency(metrics.estimatedEndOfPeriodBankBalance)}
          </span>
        </div>
      </div>
    </section>
  );
};
