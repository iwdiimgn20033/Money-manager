import React, { useState } from 'react';
import { AssetItem, AssetCategory, BalanceSheetData, CurrencyInfo, LiabilityCategory, LiabilityItem } from '../types';
import { formatCurrency } from '../utils/calculations';
import { handleGridKeyDown } from '../utils/keyboardGridNav';
import { LanguageCode } from '../i18n/translations';
import {
  Building2,
  Wallet,
  Landmark,
  Plus,
  Trash2,
  TrendingUp,
  ShieldCheck,
  CreditCard,
  Scale,
  DollarSign,
  PieChart as PieIcon,
  Download,
  Printer,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface BalanceSheetViewProps {
  currentLanguage?: LanguageCode;
  currentCurrency?: CurrencyInfo;
  balanceSheet: BalanceSheetData;
  onUpdateBalanceSheet: (newData: BalanceSheetData) => void;
}

export const BalanceSheetView: React.FC<BalanceSheetViewProps> = ({
  currentLanguage = 'ar',
  currentCurrency,
  balanceSheet,
  onUpdateBalanceSheet,
}) => {
  const isAr = currentLanguage === 'ar';

  // Modal / Form state for adding new asset or liability
  const [isAddingAsset, setIsAddingAsset] = useState(false);
  const [isAddingLiability, setIsAddingLiability] = useState(false);

  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetCategory, setNewAssetCategory] = useState<AssetCategory>('current');
  const [newAssetValue, setNewAssetValue] = useState('');
  const [newAssetNotes, setNewAssetNotes] = useState('');

  const [newLiabName, setNewLiabName] = useState('');
  const [newLiabCategory, setNewLiabCategory] = useState<LiabilityCategory>('current');
  const [newLiabValue, setNewLiabValue] = useState('');
  const [newLiabInterest, setNewLiabInterest] = useState('');
  const [newLiabNotes, setNewLiabNotes] = useState('');

  // Calculations
  const currentAssets = balanceSheet.assets.filter((a) => a.category === 'current');
  const liquidInvestments = balanceSheet.assets.filter((a) => a.category === 'liquid_investments');
  const nonCurrentAssets = balanceSheet.assets.filter((a) => a.category === 'non_current');

  const totalCurrentAssets = currentAssets.reduce((sum, a) => sum + a.value, 0);
  const totalLiquidInvestments = liquidInvestments.reduce((sum, a) => sum + a.value, 0);
  const totalNonCurrentAssets = nonCurrentAssets.reduce((sum, a) => sum + a.value, 0);
  const totalAssets = totalCurrentAssets + totalLiquidInvestments + totalNonCurrentAssets;

  const currentLiabilities = balanceSheet.liabilities.filter((l) => l.category === 'current');
  const longTermLiabilities = balanceSheet.liabilities.filter((l) => l.category === 'long_term');

  const totalCurrentLiabilities = currentLiabilities.reduce((sum, l) => sum + l.value, 0);
  const totalLongTermLiabilities = longTermLiabilities.reduce((sum, l) => sum + l.value, 0);
  const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;

  // Net Worth / Equity / Net Capital (صافي رأس المال وحقوق الملكية)
  const netCapital = totalAssets - totalLiabilities;

  // Financial Health Ratios
  const debtToAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;
  const currentRatio = totalCurrentLiabilities > 0 ? totalCurrentAssets / totalCurrentLiabilities : totalCurrentAssets > 0 ? 99 : 1;
  const netWorthRatio = totalAssets > 0 ? (netCapital / totalAssets) * 100 : 0;

  // Handlers for Asset Editing
  const handleUpdateAsset = (id: string, updatedFields: Partial<AssetItem>) => {
    const sanitizedFields = { ...updatedFields };
    if (sanitizedFields.value !== undefined) {
      sanitizedFields.value = Math.round(sanitizedFields.value);
    }
    const updated = balanceSheet.assets.map((a) =>
      a.id === id ? { ...a, ...sanitizedFields } : a
    );
    onUpdateBalanceSheet({ ...balanceSheet, assets: updated });
  };

  const handleDeleteAsset = (id: string) => {
    const updated = balanceSheet.assets.filter((a) => a.id !== id);
    onUpdateBalanceSheet({ ...balanceSheet, assets: updated });
  };

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetName.trim()) return;

    const newItem: AssetItem = {
      id: `asset-${Date.now()}`,
      name: newAssetName.trim(),
      category: newAssetCategory,
      value: Math.round(parseFloat(newAssetValue) || 0),
      notes: newAssetNotes.trim() || undefined,
    };

    onUpdateBalanceSheet({
      ...balanceSheet,
      assets: [...balanceSheet.assets, newItem],
    });

    setNewAssetName('');
    setNewAssetValue('');
    setNewAssetNotes('');
    setIsAddingAsset(false);
  };

  // Handlers for Liability Editing
  const handleUpdateLiability = (id: string, updatedFields: Partial<LiabilityItem>) => {
    const sanitizedFields = { ...updatedFields };
    if (sanitizedFields.value !== undefined) {
      sanitizedFields.value = Math.round(sanitizedFields.value);
    }
    const updated = balanceSheet.liabilities.map((l) =>
      l.id === id ? { ...l, ...sanitizedFields } : l
    );
    onUpdateBalanceSheet({ ...balanceSheet, liabilities: updated });
  };

  const handleDeleteLiability = (id: string) => {
    const updated = balanceSheet.liabilities.filter((l) => l.id !== id);
    onUpdateBalanceSheet({ ...balanceSheet, liabilities: updated });
  };

  const handleCreateLiability = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLiabName.trim()) return;

    const newItem: LiabilityItem = {
      id: `liab-${Date.now()}`,
      name: newLiabName.trim(),
      category: newLiabCategory,
      value: Math.round(parseFloat(newLiabValue) || 0),
      interestRate: newLiabInterest ? parseFloat(newLiabInterest) : undefined,
      notes: newLiabNotes.trim() || undefined,
    };

    onUpdateBalanceSheet({
      ...balanceSheet,
      liabilities: [...balanceSheet.liabilities, newItem],
    });

    setNewLiabName('');
    setNewLiabValue('');
    setNewLiabInterest('');
    setNewLiabNotes('');
    setIsAddingLiability(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 font-arabic">
      {/* Top Banner & Summary Cards */}
      <div className="bg-white text-slate-800 rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {isAr ? 'الميزانية العمومية' : 'BALANCE SHEET'}
              </span>
              <span className="text-xs text-slate-500">
                {isAr ? 'قائمة المركز المالي' : 'Statement of Financial Position'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
              {isAr ? 'الأصول، المطلوبات، وصافي رأس المال' : 'Assets, Liabilities & Net Capital'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-slate-200 transition-all shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>{isAr ? 'طباعة المركز المالي' : 'Print Statement'}</span>
            </button>
          </div>
        </div>

        {/* 3 Core Financial Pillars (Equation: Assets = Liabilities + Net Capital) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          {/* 1. Total Assets (الأصول) */}
          <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4.5 space-y-2 relative overflow-hidden shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-emerald-600" />
                {isAr ? 'إجمالي الأصول (Assets)' : 'Total Assets'}
              </span>
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                100%
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
              {formatCurrency(totalAssets)}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
              <span>{isAr ? 'أصول متداولة وسيولة:' : 'Current & Liquid:'}</span>
              <span className="text-slate-800 font-mono font-bold">
                {formatCurrency(totalCurrentAssets + totalLiquidInvestments)}
              </span>
            </div>
          </div>

          {/* 2. Total Liabilities (المطلوبات والخصوم) */}
          <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4.5 space-y-2 relative overflow-hidden shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-rose-600" />
                {isAr ? 'إجمالي المطلوبات (Liabilities)' : 'Total Liabilities'}
              </span>
              <span className="text-[10px] font-bold bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full border border-rose-200">
                {debtToAssetRatio.toFixed(1)}% {isAr ? 'من الأصول' : 'of Assets'}
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 font-mono">
              {formatCurrency(totalLiabilities)}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
              <span>{isAr ? 'ديون قصيرة الأجل:' : 'Current Debt:'}</span>
              <span className="text-rose-700 font-mono font-bold">
                {formatCurrency(totalCurrentLiabilities)}
              </span>
            </div>
          </div>

          {/* 3. Net Capital / Net Worth (صافي رأس المال وحقوق الملكية) */}
          <div className="bg-slate-50/80 rounded-2xl border border-blue-200 p-4.5 space-y-2 relative overflow-hidden shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-700 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-blue-600" />
                {isAr ? 'صافي رأس المال (Net Worth / Equity)' : 'Net Capital / Equity'}
              </span>
              <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200">
                {netWorthRatio.toFixed(1)}%
              </span>
            </div>
            <div
              className={`text-2xl sm:text-3xl font-extrabold font-mono ${
                netCapital >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {formatCurrency(netCapital)}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
              <span>{isAr ? 'المعادلة: الأصول - المطلوبات' : 'Assets minus Liabilities'}</span>
              <span className="text-emerald-600 font-mono font-bold">
                {netCapital >= 0 ? (isAr ? 'فائض رأسمالي' : 'Solvent') : (isAr ? 'عجز رأسمالي' : 'Deficit')}
              </span>
            </div>
          </div>
        </div>

        {/* Financial Health Indicators Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs">
          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">
              {isAr ? 'نسبة التداول والسيولة (Current Ratio)' : 'Current Ratio'}
            </span>
            <span className="text-sm font-bold font-mono text-emerald-400">
              {currentRatio >= 99 ? '∞ (ممتازة)' : `${currentRatio.toFixed(2)}x`}
            </span>
          </div>

          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">
              {isAr ? 'نسبة المديونية (Debt-to-Assets)' : 'Debt to Assets'}
            </span>
            <span className={`text-sm font-bold font-mono ${debtToAssetRatio > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {debtToAssetRatio.toFixed(1)}%
            </span>
          </div>

          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">
              {isAr ? 'السيولة النقدية الحرة' : 'Liquid Free Reserves'}
            </span>
            <span className="text-sm font-bold font-mono text-white">
              {formatCurrency(totalCurrentAssets)}
            </span>
          </div>

          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">
              {isAr ? 'حالة التوازن المحاسبي' : 'Accounting Balance'}
            </span>
            <span className="text-sm font-bold text-blue-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              {isAr ? 'متطابقة ومتوازنة' : 'Fully Balanced'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Balance Sheet (Assets on Left/Right, Liabilities on Other) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ======================================================== */}
        {/* 1. ASSETS COLUMN (الأصول) */}
        {/* ======================================================== */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-emerald-950 text-white px-4 py-3.5 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Landmark className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold">
                {isAr ? 'الأصول والموجودات (Assets)' : 'Assets & Resources'}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-emerald-400">
                {formatCurrency(totalAssets)}
              </span>
              <button
                onClick={() => setIsAddingAsset(true)}
                className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs flex items-center gap-1 px-2.5 font-bold transition-all shadow-xs"
                title="Add Asset"
              >
                <Plus className="w-3 h-3" />
                <span>{isAr ? 'إضافة أصل' : 'Add'}</span>
              </button>
            </div>
          </div>

          {/* Quick Add Asset Form */}
          {isAddingAsset && (
            <form
              onSubmit={handleCreateAsset}
              className="p-4 bg-emerald-50/50 border-b border-emerald-200 space-y-3"
            >
              <div className="text-xs font-black uppercase text-emerald-900 flex items-center justify-between">
                <span>{isAr ? 'إضافة بند أصل جديد' : 'Add New Asset Item'}</span>
                <button
                  type="button"
                  onClick={() => setIsAddingAsset(false)}
                  className="text-slate-500 hover:text-slate-800 text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder={isAr ? 'اسم الأصل (مثال: حساب جاري، عقار)' : 'Asset Name'}
                  value={newAssetName}
                  onChange={(e) => setNewAssetName(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-white border border-slate-300 font-medium"
                  required
                />

                <select
                  value={newAssetCategory}
                  onChange={(e) => setNewAssetCategory(e.target.value as AssetCategory)}
                  className="px-2 py-1.5 text-xs bg-white border border-slate-300"
                >
                  <option value="current">{isAr ? 'أصول متداولة / سيولة نقدية' : 'Current Asset (Cash)'}</option>
                  <option value="liquid_investments">{isAr ? 'استثمارات وأسهم وصناديق' : 'Liquid Investments'}</option>
                  <option value="non_current">{isAr ? 'أصول غير متداولة وثابتة' : 'Fixed / Non-Current Asset'}</option>
                </select>

                <input
                  type="number"
                  step="1"
                  placeholder={isAr ? 'القيمة التقديرية' : 'Current Value'}
                  value={newAssetValue}
                  onChange={(e) => setNewAssetValue(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-white border border-slate-300 font-mono"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingAsset(false)}
                  className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold uppercase"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-black uppercase"
                >
                  {isAr ? 'حفظ الأصل' : 'Save Asset'}
                </button>
              </div>
            </form>
          )}

          {/* Asset Categories Tables */}
          <div className="divide-y divide-slate-200">
            {/* 1. Current Assets */}
            <div className="p-3">
              <div className="flex items-center justify-between pb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1">
                  <Wallet className="w-3 h-3 text-blue-600" />
                  {isAr ? '1. الأصول المتداولة والسيولة النقدية' : '1. Current Assets & Liquid Cash'}
                </span>
                <span className="text-xs font-mono font-bold text-slate-900">
                  {formatCurrency(totalCurrentAssets)}
                </span>
              </div>
              <table className="w-full text-xs font-sans">
                <tbody className="divide-y divide-slate-100">
                  {currentAssets.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-2 text-center text-slate-400 italic">
                        {isAr ? 'لا توجد أصول متداولة مسجلة' : 'No current assets recorded'}
                      </td>
                    </tr>
                  ) : (
                    currentAssets.map((asset, idx) => (
                      <tr key={asset.id} className="hover:bg-slate-50">
                        <td className="py-1.5 pr-2 font-medium text-slate-800">
                          <input
                            type="text"
                            defaultValue={asset.name}
                            data-grid="bs-current-assets"
                            data-row={idx}
                            data-col="name"
                            onBlur={(e) => handleUpdateAsset(asset.id, { name: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Enter') {
                                handleUpdateAsset(asset.id, { name: (e.target as HTMLInputElement).value });
                              }
                              handleGridKeyDown(e, 'bs-current-assets', idx, 'name', {
                                enableHorizontal: true,
                                colOrder: ['name', 'value'],
                              });
                            }}
                            className="w-full bg-transparent hover:bg-white focus:bg-white border-transparent hover:border-slate-300 focus:border-blue-500 border px-1 py-0.5 text-xs font-medium"
                          />
                        </td>
                        <td className="py-1.5 px-2 text-right font-mono font-bold text-emerald-800">
                          <input
                            type="number"
                            step="1"
                            defaultValue={Math.round(asset.value)}
                            data-grid="bs-current-assets"
                            data-row={idx}
                            data-col="value"
                            onBlur={(e) =>
                              handleUpdateAsset(asset.id, {
                                value: Math.round(parseFloat(e.target.value) || 0),
                              })
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Enter') {
                                handleUpdateAsset(asset.id, {
                                  value: Math.round(parseFloat((e.target as HTMLInputElement).value) || 0),
                                });
                              }
                              handleGridKeyDown(e, 'bs-current-assets', idx, 'value', {
                                enableHorizontal: true,
                                colOrder: ['name', 'value'],
                              });
                            }}
                            className="w-28 text-right bg-transparent hover:bg-white focus:bg-white border-transparent hover:border-slate-300 focus:border-blue-500 border px-1 py-0.5 text-xs font-mono font-bold"
                          />
                        </td>
                        <td className="py-1.5 pl-2 text-left w-6">
                          <button
                            onClick={() => handleDeleteAsset(asset.id)}
                            className="text-slate-400 hover:text-red-600 p-0.5"
                            title="Delete Asset"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 2. Liquid Investments & Securities */}
            <div className="p-3">
              <div className="flex items-center justify-between pb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-indigo-600" />
                  {isAr ? '2. الاستثمارات والأوراق المالية' : '2. Liquid Investments & Securities'}
                </span>
                <span className="text-xs font-mono font-bold text-slate-900">
                  {formatCurrency(totalLiquidInvestments)}
                </span>
              </div>
              <table className="w-full text-xs font-sans">
                <tbody className="divide-y divide-slate-100">
                  {liquidInvestments.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-2 text-center text-slate-400 italic">
                        {isAr ? 'لا توجد استثمارات مسجلة' : 'No liquid investments recorded'}
                      </td>
                    </tr>
                  ) : (
                    liquidInvestments.map((asset, idx) => (
                      <tr key={asset.id} className="hover:bg-slate-50">
                        <td className="py-1.5 pr-2 font-medium text-slate-800">
                          <input
                            type="text"
                            defaultValue={asset.name}
                            data-grid="bs-liquid-investments"
                            data-row={idx}
                            data-col="name"
                            onBlur={(e) => handleUpdateAsset(asset.id, { name: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Enter') {
                                handleUpdateAsset(asset.id, { name: (e.target as HTMLInputElement).value });
                              }
                              handleGridKeyDown(e, 'bs-liquid-investments', idx, 'name', {
                                enableHorizontal: true,
                                colOrder: ['name', 'value'],
                              });
                            }}
                            className="w-full bg-transparent hover:bg-white focus:bg-white border-transparent hover:border-slate-300 focus:border-blue-500 border px-1 py-0.5 text-xs font-medium"
                          />
                        </td>
                        <td className="py-1.5 px-2 text-right font-mono font-bold text-emerald-800">
                          <input
                            type="number"
                            step="1"
                            defaultValue={Math.round(asset.value)}
                            data-grid="bs-liquid-investments"
                            data-row={idx}
                            data-col="value"
                            onBlur={(e) =>
                              handleUpdateAsset(asset.id, {
                                value: Math.round(parseFloat(e.target.value) || 0),
                              })
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Enter') {
                                handleUpdateAsset(asset.id, {
                                  value: Math.round(parseFloat((e.target as HTMLInputElement).value) || 0),
                                });
                              }
                              handleGridKeyDown(e, 'bs-liquid-investments', idx, 'value', {
                                enableHorizontal: true,
                                colOrder: ['name', 'value'],
                              });
                            }}
                            className="w-28 text-right bg-transparent hover:bg-white focus:bg-white border-transparent hover:border-slate-300 focus:border-blue-500 border px-1 py-0.5 text-xs font-mono font-bold"
                          />
                        </td>
                        <td className="py-1.5 pl-2 text-left w-6">
                          <button
                            onClick={() => handleDeleteAsset(asset.id)}
                            className="text-slate-400 hover:text-red-600 p-0.5"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 3. Non-Current & Fixed Assets */}
            <div className="p-3">
              <div className="flex items-center justify-between pb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-amber-600" />
                  {isAr ? '3. الأصول الثابتة وغير المتداولة (العقارات، المركبات)' : '3. Non-Current & Fixed Assets'}
                </span>
                <span className="text-xs font-mono font-bold text-slate-900">
                  {formatCurrency(totalNonCurrentAssets)}
                </span>
              </div>
              <table className="w-full text-xs font-sans">
                <tbody className="divide-y divide-slate-100">
                  {nonCurrentAssets.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-2 text-center text-slate-400 italic">
                        {isAr ? 'لا توجد أصول ثابتة مسجلة' : 'No fixed assets recorded'}
                      </td>
                    </tr>
                  ) : (
                    nonCurrentAssets.map((asset, idx) => (
                      <tr key={asset.id} className="hover:bg-slate-50">
                        <td className="py-1.5 pr-2 font-medium text-slate-800">
                          <input
                            type="text"
                            defaultValue={asset.name}
                            data-grid="bs-fixed-assets"
                            data-row={idx}
                            data-col="name"
                            onBlur={(e) => handleUpdateAsset(asset.id, { name: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Enter') {
                                handleUpdateAsset(asset.id, { name: (e.target as HTMLInputElement).value });
                              }
                              handleGridKeyDown(e, 'bs-fixed-assets', idx, 'name', {
                                enableHorizontal: true,
                                colOrder: ['name', 'value'],
                              });
                            }}
                            className="w-full bg-transparent hover:bg-white focus:bg-white border-transparent hover:border-slate-300 focus:border-blue-500 border px-1 py-0.5 text-xs font-medium"
                          />
                        </td>
                        <td className="py-1.5 px-2 text-right font-mono font-bold text-emerald-800">
                          <input
                            type="number"
                            step="1"
                            defaultValue={Math.round(asset.value)}
                            data-grid="bs-fixed-assets"
                            data-row={idx}
                            data-col="value"
                            onBlur={(e) =>
                              handleUpdateAsset(asset.id, {
                                value: Math.round(parseFloat(e.target.value) || 0),
                              })
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Enter') {
                                handleUpdateAsset(asset.id, {
                                  value: Math.round(parseFloat((e.target as HTMLInputElement).value) || 0),
                                });
                              }
                              handleGridKeyDown(e, 'bs-fixed-assets', idx, 'value', {
                                enableHorizontal: true,
                                colOrder: ['name', 'value'],
                              });
                            }}
                            className="w-28 text-right bg-transparent hover:bg-white focus:bg-white border-transparent hover:border-slate-300 focus:border-blue-500 border px-1 py-0.5 text-xs font-mono font-bold"
                          />
                        </td>
                        <td className="py-1.5 pl-2 text-left w-6">
                          <button
                            onClick={() => handleDeleteAsset(asset.id)}
                            className="text-slate-400 hover:text-red-600 p-0.5"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Assets Footer Total */}
          <div className="bg-slate-100 px-4 py-3 border-t border-slate-300 flex items-center justify-between font-black text-sm">
            <span className="uppercase text-slate-800">{isAr ? 'مجموع الأصول الكامل:' : 'Total Assets:'}</span>
            <span className="font-mono text-emerald-700 text-base">{formatCurrency(totalAssets)}</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. LIABILITIES & EQUITY COLUMN (المطلوبات وصافي رأس المال) */}
        {/* ======================================================== */}
        <div className="space-y-6">
          {/* LIABILITIES BOX */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-rose-950 text-white px-4 py-3.5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold">
                  {isAr ? 'المطلوبات والالتزامات (Liabilities)' : 'Liabilities & Obligations'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-rose-400">
                  {formatCurrency(totalLiabilities)}
                </span>
                <button
                  onClick={() => setIsAddingLiability(true)}
                  className="p-1 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs flex items-center gap-1 px-2.5 font-bold transition-all shadow-xs"
                  title="Add Liability"
                >
                  <Plus className="w-3 h-3" />
                  <span>{isAr ? 'إضافة التزام' : 'Add'}</span>
                </button>
              </div>
            </div>

            {/* Quick Add Liability Form */}
            {isAddingLiability && (
              <form
                onSubmit={handleCreateLiability}
                className="p-4 bg-rose-50/60 border-b border-rose-200/80 space-y-3"
              >
                <div className="text-xs font-bold text-rose-900 flex items-center justify-between">
                  <span>{isAr ? 'إضافة التزام أو دين جديد' : 'Add New Liability'}</span>
                  <button
                    type="button"
                    onClick={() => setIsAddingLiability(false)}
                    className="w-6 h-6 rounded-full bg-rose-200/60 text-slate-700 hover:bg-rose-300 flex items-center justify-center text-xs"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder={isAr ? 'اسم الالتزام (مثال: بطاقة ائتمان، قرض)' : 'Liability Name'}
                    value={newLiabName}
                    onChange={(e) => setNewLiabName(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-rose-400"
                    required
                  />

                  <select
                    value={newLiabCategory}
                    onChange={(e) => setNewLiabCategory(e.target.value as LiabilityCategory)}
                    className="px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400"
                  >
                    <option value="current">{isAr ? 'مطلوبات قصيرة الأجل (أقل من سنة)' : 'Current (Short-Term)'}</option>
                    <option value="long_term">{isAr ? 'مطلوبات طويلة الأجل (تمويل عقاري)' : 'Long-Term Debt'}</option>
                  </select>

                  <input
                    type="number"
                    step="1"
                    placeholder={isAr ? 'الرصيد المستحق' : 'Outstanding Balance'}
                    value={newLiabValue}
                    onChange={(e) => setNewLiabValue(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-rose-400"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingLiability(false)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    {isAr ? 'حفظ الالتزام' : 'Save Liability'}
                  </button>
                </div>
              </form>
            )}

            {/* Liabilities Table */}
            <div className="divide-y divide-slate-100">
              {/* Current Liabilities */}
              <div className="p-3.5">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-[11px] font-bold text-slate-600">
                    {isAr ? '1. مطلوبات متداولة (بطاقات، مستحقات قصيرة الأجل)' : '1. Current Liabilities'}
                  </span>
                  <span className="text-xs font-mono font-bold text-rose-600">
                    {formatCurrency(totalCurrentLiabilities)}
                  </span>
                </div>
                <table className="w-full text-xs font-sans">
                  <tbody className="divide-y divide-slate-100">
                    {currentLiabilities.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-2 text-center text-slate-400 italic">
                          {isAr ? 'لا توجد ديون قصيرة الأجل' : 'No current debt recorded'}
                        </td>
                      </tr>
                    ) : (
                      currentLiabilities.map((liab, idx) => (
                        <tr key={liab.id} className="hover:bg-slate-50/80 rounded-xl transition-colors">
                          <td className="py-1.5 pr-2 font-medium text-slate-800">
                            <input
                              type="text"
                              defaultValue={liab.name}
                              data-grid="bs-current-liab"
                              data-row={idx}
                              data-col="name"
                              onBlur={(e) => handleUpdateLiability(liab.id, { name: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Enter') {
                                  handleUpdateLiability(liab.id, { name: (e.target as HTMLInputElement).value });
                                }
                                handleGridKeyDown(e, 'bs-current-liab', idx, 'name', {
                                  enableHorizontal: true,
                                  colOrder: ['name', 'value'],
                                });
                              }}
                              className="w-full bg-transparent hover:bg-slate-100/70 focus:bg-white border-transparent hover:border-slate-200 focus:border-rose-400 rounded-lg border px-2 py-1 text-xs font-medium transition-all"
                            />
                          </td>
                          <td className="py-1.5 px-2 text-right font-mono font-bold text-rose-600">
                            <input
                              type="number"
                              step="1"
                              defaultValue={Math.round(liab.value)}
                              data-grid="bs-current-liab"
                              data-row={idx}
                              data-col="value"
                              onBlur={(e) =>
                                handleUpdateLiability(liab.id, {
                                  value: Math.round(parseFloat(e.target.value) || 0),
                                })
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Enter') {
                                  handleUpdateLiability(liab.id, {
                                    value: Math.round(parseFloat((e.target as HTMLInputElement).value) || 0),
                                  });
                                }
                                handleGridKeyDown(e, 'bs-current-liab', idx, 'value', {
                                  enableHorizontal: true,
                                  colOrder: ['name', 'value'],
                                });
                              }}
                              className="w-28 text-right bg-transparent hover:bg-slate-100/70 focus:bg-white border-transparent hover:border-slate-200 focus:border-rose-400 rounded-lg border px-2 py-1 text-xs font-mono font-bold transition-all"
                            />
                          </td>
                          <td className="py-1.5 pl-2 text-left w-6">
                            <button
                              onClick={() => handleDeleteLiability(liab.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Long Term Debt */}
              <div className="p-3.5">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-[11px] font-bold text-slate-600">
                    {isAr ? '2. مطلوبات طويلة الأجل (تمويلات عقارية وقروض)' : '2. Long-Term Liabilities'}
                  </span>
                  <span className="text-xs font-mono font-bold text-rose-600">
                    {formatCurrency(totalLongTermLiabilities)}
                  </span>
                </div>
                <table className="w-full text-xs font-sans">
                  <tbody className="divide-y divide-slate-100">
                    {longTermLiabilities.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-2 text-center text-slate-400 italic">
                          {isAr ? 'لا توجد مطلوبات طويلة الأجل' : 'No long-term debt recorded'}
                        </td>
                      </tr>
                    ) : (
                      longTermLiabilities.map((liab, idx) => (
                        <tr key={liab.id} className="hover:bg-slate-50/80 rounded-xl transition-colors">
                          <td className="py-1.5 pr-2 font-medium text-slate-800">
                            <input
                              type="text"
                              defaultValue={liab.name}
                              data-grid="bs-long-liab"
                              data-row={idx}
                              data-col="name"
                              onBlur={(e) => handleUpdateLiability(liab.id, { name: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Enter') {
                                  handleUpdateLiability(liab.id, { name: (e.target as HTMLInputElement).value });
                                }
                                handleGridKeyDown(e, 'bs-long-liab', idx, 'name', {
                                  enableHorizontal: true,
                                  colOrder: ['name', 'value'],
                                });
                              }}
                              className="w-full bg-transparent hover:bg-slate-100/70 focus:bg-white border-transparent hover:border-slate-200 focus:border-rose-400 rounded-lg border px-2 py-1 text-xs font-medium transition-all"
                            />
                          </td>
                          <td className="py-1.5 px-2 text-right font-mono font-bold text-rose-600">
                            <input
                              type="number"
                              step="1"
                              defaultValue={Math.round(liab.value)}
                              data-grid="bs-long-liab"
                              data-row={idx}
                              data-col="value"
                              onBlur={(e) =>
                                handleUpdateLiability(liab.id, {
                                  value: Math.round(parseFloat(e.target.value) || 0),
                                })
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Enter') {
                                  handleUpdateLiability(liab.id, {
                                    value: Math.round(parseFloat((e.target as HTMLInputElement).value) || 0),
                                  });
                                }
                                handleGridKeyDown(e, 'bs-long-liab', idx, 'value', {
                                  enableHorizontal: true,
                                  colOrder: ['name', 'value'],
                                });
                              }}
                              className="w-28 text-right bg-transparent hover:bg-slate-100/70 focus:bg-white border-transparent hover:border-slate-200 focus:border-rose-400 rounded-lg border px-2 py-1 text-xs font-mono font-bold transition-all"
                            />
                          </td>
                          <td className="py-1.5 pl-2 text-left w-6">
                            <button
                              onClick={() => handleDeleteLiability(liab.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Liabilities Footer Total */}
            <div className="bg-slate-50/80 px-4 py-3 border-t border-slate-200/80 flex items-center justify-between font-bold text-sm">
              <span className="text-slate-700">{isAr ? 'مجموع المطلوبات:' : 'Total Liabilities:'}</span>
              <span className="font-mono text-rose-600 text-base">{formatCurrency(totalLiabilities)}</span>
            </div>
          </div>

          {/* NET CAPITAL / EQUITY HIGHLIGHT CARD */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 text-white rounded-2xl border border-blue-500/40 p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-blue-400" />
                <h4 className="text-sm font-bold text-white">
                  {isAr ? 'صافي رأس المال وحقوق الملكية (Equity)' : 'Net Capital & Equity Statement'}
                </h4>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                {isAr ? 'المعادلة الأساسية للمحاسبة' : 'Fundamental Accounting Eq'}
              </span>
            </div>

            <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 text-xs space-y-2 font-mono">
              <div className="flex justify-between text-slate-300">
                <span>{isAr ? '(+) إجمالي الأصول المملوكة' : '(+) Total Assets'}</span>
                <span className="text-emerald-400 font-bold">+{formatCurrency(totalAssets)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>{isAr ? '(-) إجمالي الالتزامات والمطلوبات' : '(-) Total Liabilities'}</span>
                <span className="text-rose-400 font-bold">-{formatCurrency(totalLiabilities)}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold pt-2 border-t border-slate-700/80 text-white">
                <span className="text-blue-300">{isAr ? '(=) صافي رأس المال الحر (Net Worth):' : '(=) Net Equity:'}</span>
                <span className={netCapital >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {formatCurrency(netCapital)}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 font-arabic leading-relaxed">
              {isAr
                ? 'يمثل صافي رأس المال القيمة الحقيقية الصافية لثروتك بعد سداد كافة الديون والمطلوبات الحالية وطويلة الأجل.'
                : 'Net capital represents your true unencumbered financial net worth after deducting all current and long-term liabilities.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
