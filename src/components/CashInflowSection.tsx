import React from 'react';
import { FinancialMetrics, IncomeItem } from '../types';
import { formatCurrency, formatPercent } from '../utils/calculations';
import { Plus, CheckCircle2, Clock, ArrowUpRight, DollarSign, Wallet } from 'lucide-react';

interface CashInflowSectionProps {
  incomeItems: IncomeItem[];
  metrics: FinancialMetrics;
  onToggleReceived: (id: string) => void;
  onAddIncome: () => void;
}

export const CashInflowSection: React.FC<CashInflowSectionProps> = ({
  incomeItems,
  metrics,
  onToggleReceived,
  onAddIncome,
}) => {
  return (
    <div className="flex flex-col gap-6 font-arabic">
      {/* 1. Cash Inflow Projection Card */}
      <div 
        id="cash-inflow-projection-card"
        className="bg-white rounded-2xl p-6 flex flex-col text-slate-800 shadow-sm border border-slate-200/80"
      >
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
          <h2 className="font-bold uppercase text-[11px] tracking-widest text-slate-500">
            توقعات التدفقات النقدية الداخلة (Inflows)
          </h2>
          <button
            onClick={onAddIncome}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 px-3 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> إضافة إيراد
          </button>
        </div>

        {/* Inflow Streams List */}
        <div className="flex-1 flex flex-col justify-center gap-4">
          {incomeItems.map((inc) => (
            <div 
              key={inc.id} 
              id={`income-${inc.id}`}
              className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 transition-all hover:border-blue-300"
            >
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-700 font-bold">
                  {inc.name}
                </div>
                <button
                  onClick={() => onToggleReceived(inc.id)}
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1.5 transition-all ${
                    inc.isReceived 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-slate-200/70 text-slate-700 border border-slate-300 hover:bg-slate-300'
                  }`}
                  title="Click to toggle received status"
                >
                  {inc.isReceived ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> تم التحصيل
                    </>
                  ) : (
                    <>
                      <Clock className="w-3 h-3 text-amber-600" /> معلق
                    </>
                  )}
                </button>
              </div>

              <div className="text-xl font-bold font-mono mt-2 text-slate-900 tracking-tight flex items-baseline justify-between">
                <span>{formatCurrency(inc.expectedAmount)}</span>
                {inc.receivedAmount !== inc.expectedAmount && (
                  <span className="text-[11px] font-normal text-slate-500">
                    تم تحصيل: {formatCurrency(inc.receivedAmount)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Total Income Footer */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex justify-between items-end">
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              إجمالي التدفق المتوقع
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tracking-tight mt-0.5">
              {formatCurrency(metrics.totalExpectedIncome)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              المحصل فعلياً: <span className="text-emerald-600 font-bold font-mono">{formatCurrency(metrics.totalReceivedIncome)}</span>
            </div>
          </div>
          <div className="w-11 h-11 bg-blue-50 border border-blue-200 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs">
            <Wallet className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </div>

      {/* 2. Savings Rate & Cash Flow Efficiency Banner */}
      <div 
        id="savings-rate-banner"
        className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center justify-between gap-4 shadow-sm"
      >
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0">
            %
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              معدل الادخار المقدر (Savings Rate)
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-slate-800 flex items-center gap-2 mt-0.5">
              {metrics.savingsRate.toFixed(1)}%
              <span className="text-[11px] text-emerald-700 font-bold font-sans bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {metrics.savingsRate > 20 ? 'محقق للهدف' : 'قيد التقدم'}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <div className="text-[10px] font-bold text-slate-400 uppercase">
            صافي رأس المال المتبقي
          </div>
          <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
            {formatCurrency(metrics.estimatedEndOfPeriodNetCashFlow)}
          </div>
        </div>
      </div>
    </div>
  );
};
