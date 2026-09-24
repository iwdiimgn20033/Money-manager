import React, { useState } from 'react';
import { IncomeItem } from '../types';
import { formatCurrency } from '../utils/calculations';
import { translateItemName } from '../utils/localization';
import { handleGridKeyDown } from '../utils/keyboardGridNav';
import { LanguageCode, TRANSLATIONS } from '../i18n/translations';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Wallet,
  TrendingUp,
  ArrowUpRight,
  Lock
} from 'lucide-react';

interface EditableIncomeTableProps {
  incomeItems: IncomeItem[];
  currentLanguage: LanguageCode;
  onUpdateIncomeItem: (item: IncomeItem) => void;
  onDeleteIncomeItem: (id: string) => void;
  onAddIncomeItem: (item: Omit<IncomeItem, 'id'>) => void;
  onToggleReceived: (id: string) => void;
}

export const EditableIncomeTable: React.FC<EditableIncomeTableProps> = ({
  incomeItems,
  currentLanguage,
  onUpdateIncomeItem,
  onDeleteIncomeItem,
  onAddIncomeItem,
  onToggleReceived,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editExpected, setEditExpected] = useState('');
  const [editReceived, setEditReceived] = useState('');
  const [editSource, setEditSource] = useState<IncomeItem['sourceType']>('salary');

  // New Inflow Inline Form
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newExpected, setNewExpected] = useState('');
  const [newSource, setNewSource] = useState<IncomeItem['sourceType']>('salary');

  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
  const isAr = currentLanguage === 'ar';

  const totalExpected = incomeItems.reduce((acc, it) => acc + it.expectedAmount, 0);
  const totalReceived = incomeItems.reduce((acc, it) => acc + it.receivedAmount, 0);
  const pendingVariance = totalExpected - totalReceived;

  const startEdit = (item: IncomeItem) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditExpected(item.expectedAmount.toString());
    setEditReceived(item.receivedAmount.toString());
    setEditSource(item.sourceType);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = (id: string) => {
    const exp = Math.round(parseFloat(editExpected) || 0);
    const rec = Math.round(parseFloat(editReceived) || 0);
    onUpdateIncomeItem({
      id,
      name: editName.trim() || 'Untitled Income',
      expectedAmount: exp,
      receivedAmount: rec,
      sourceType: editSource,
      isReceived: rec >= exp && exp > 0,
    });
    setEditingId(null);
  };

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const exp = Math.round(parseFloat(newExpected) || 0);
    onAddIncomeItem({
      name: newName.trim(),
      expectedAmount: exp,
      receivedAmount: 0,
      sourceType: newSource,
      isReceived: false,
    });
    setNewName('');
    setNewExpected('');
    setIsAddingNew(false);
  };

  return (
    <div className="bg-white/85 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg shadow-emerald-950/5 overflow-hidden">
      {/* Header Bar - Compact & Sleek */}
      <div className="bg-gradient-to-r from-slate-900/90 via-emerald-950/85 to-slate-900/90 backdrop-blur-xl border-b border-emerald-500/20 text-white px-3.5 py-2.5 sm:px-4 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 font-arabic">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <TrendingUp className="w-3.5 h-3.5" strokeWidth={2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                {isAr ? 'جدول الإيرادات ومصادر الدخل الشهرية (تحرير فوري)' : 'Monthly Revenue & Cash Inflows (Live Grid)'}
              </h2>
              <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                {incomeItems.length} {isAr ? 'مصادر' : 'Streams'}
              </span>
            </div>
            <p className="text-[11px] text-slate-300/80 mt-0.2">
              {isAr ? 'تعديل وحفظ تلقائي عند مغادرة الخلية، مع إضافة مصادر الدخل بسهولة' : 'Auto-saves on blur with easy inflow creation'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddingNew(!isAddingNew)}
            className="px-3 py-1 bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-xs hover:shadow-sm active:scale-95 border border-emerald-400/30 backdrop-blur-md"
          >
            <Plus className="w-3 h-3" strokeWidth={2} />
            <span>{isAr ? 'إضافة مصدر دخل جديد' : 'Add New Inflow'}</span>
          </button>
        </div>
      </div>

      {/* Add New Inflow Inline Form */}
      {isAddingNew && (
        <form onSubmit={handleAddNew} className="mx-3 my-2 bg-emerald-50/80 border border-emerald-200/90 rounded-xl p-2.5 sm:p-3 grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-end font-arabic shadow-xs">
          <div>
            <label className="block text-[10px] font-bold text-slate-700 mb-1">
              {isAr ? 'اسم مصدر الإيراد' : 'Income Name'}
            </label>
            <input
              type="text"
              required
              placeholder={isAr ? 'مثال: الراتب الشهري / استشارات' : 'e.g. Primary Salary'}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-bold focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-700 mb-1">
              {isAr ? 'المبلغ المتوقع' : 'Expected Amount'}
            </label>
            <input
              type="number"
              step="1"
              required
              placeholder="0"
              value={newExpected}
              onChange={(e) => setNewExpected(e.target.value)}
              className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-500 text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-700 mb-1">
              {isAr ? 'نوع التدفق' : 'Source Type'}
            </label>
            <select
              value={newSource}
              onChange={(e) => setNewSource(e.target.value as any)}
              className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-bold focus:outline-none focus:border-emerald-500"
            >
              <option value="salary">{isAr ? 'راتب أساسي (Salary)' : 'Primary Salary'}</option>
              <option value="freelance">{isAr ? 'عمل حر واستشارات (Freelance)' : 'Freelance / Consulting'}</option>
              <option value="investments">{isAr ? 'عوائد استثمارية (Investments)' : 'Investments / Dividends'}</option>
              <option value="bonus">{isAr ? 'مكافآت وحوافز (Bonus)' : 'Bonus / Commission'}</option>
              <option value="other">{isAr ? 'إيرادات أخرى (Other)' : 'Other Revenue'}</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="submit"
              className="flex-1 py-1 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all shadow-xs"
            >
              {isAr ? 'حفظ الدخل' : 'Save Inflow'}
            </button>
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="py-1 px-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition-all"
            >
              ✕
            </button>
          </div>
        </form>
      )}

      {/* Table of Incomes - Compact Spacing */}
      <div className="overflow-x-auto">
        <table className="w-full text-start border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-slate-900/95 via-emerald-950/90 to-slate-900/95 backdrop-blur-md text-white border-b border-emerald-500/20 text-[9.5px] font-bold uppercase tracking-wider font-arabic">
              <th className="py-2 px-3 text-start">{isAr ? 'مصدر الدخل' : 'Income Source'}</th>
              <th className="py-2 px-2.5 text-start">{isAr ? 'النوع والتصنيف' : 'Category'}</th>
              <th className="py-2 px-2.5 text-end">{isAr ? 'المتوقع' : 'Expected'}</th>
              <th className="py-2 px-2.5 text-end">{isAr ? 'المحصل الفعلي' : 'Received'}</th>
              <th className="py-2 px-2.5 text-end">{isAr ? 'المتبقي للتحصيل' : 'Pending'}</th>
              <th className="py-2 px-2.5 text-center">{isAr ? 'الحالة' : 'Status'}</th>
              <th className="py-2 px-2 text-center">{isAr ? 'إجراءات' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-arabic">
            {incomeItems.map((item, rowIndex) => {
              const isEditing = editingId === item.id;
              const isReceived = item.isReceived || (item.receivedAmount >= item.expectedAmount && item.expectedAmount > 0);
              const remaining = item.expectedAmount - item.receivedAmount;

              if (isEditing) {
                return (
                  <tr key={item.id} className="bg-blue-50/60">
                    <td className="py-1.5 px-3">
                      <input
                        type="text"
                        value={editName}
                        data-grid="income-grid"
                        data-row={rowIndex}
                        data-col="name"
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit(item.id);
                          handleGridKeyDown(e, 'income-grid', rowIndex, 'name', {
                            enableHorizontal: true,
                            colOrder: ['name', 'expected', 'received'],
                          });
                        }}
                        className="w-full px-2 py-0.5 bg-white border border-blue-400 rounded-lg text-xs font-bold text-slate-900 focus:outline-none"
                      />
                    </td>
                    <td className="py-1.5 px-2.5">
                      <select
                        value={editSource}
                        onChange={(e) => setEditSource(e.target.value as any)}
                        className="w-full px-2 py-0.5 bg-white border border-blue-400 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none"
                      >
                        <option value="salary">{isAr ? 'راتب أساسي' : 'Salary'}</option>
                        <option value="freelance">{isAr ? 'عمل حر' : 'Freelance'}</option>
                        <option value="investments">{isAr ? 'استثمارات' : 'Investments'}</option>
                        <option value="bonus">{isAr ? 'مكافأة' : 'Bonus'}</option>
                        <option value="other">{isAr ? 'أخرى' : 'Other'}</option>
                      </select>
                    </td>
                    <td className="py-1.5 px-2.5 text-end">
                      <div className="flex items-center justify-end">
                        <input
                          type="number"
                          step="1"
                          value={editExpected}
                          data-grid="income-grid"
                          data-row={rowIndex}
                          data-col="expected"
                          onChange={(e) => setEditExpected(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit(item.id);
                            handleGridKeyDown(e, 'income-grid', rowIndex, 'expected', {
                              enableHorizontal: true,
                              colOrder: ['name', 'expected', 'received'],
                            });
                          }}
                          className="w-24 max-w-[95px] text-end px-2 py-0.5 bg-white border border-blue-400 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none shadow-2xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </td>
                    <td className="py-1.5 px-2.5 text-end">
                      <div className="flex items-center justify-end">
                        <input
                          type="number"
                          step="1"
                          value={editReceived}
                          data-grid="income-grid"
                          data-row={rowIndex}
                          data-col="received"
                          onChange={(e) => setEditReceived(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit(item.id);
                            handleGridKeyDown(e, 'income-grid', rowIndex, 'received', {
                              enableHorizontal: true,
                              colOrder: ['name', 'expected', 'received'],
                            });
                          }}
                          className="w-24 max-w-[95px] text-end px-2 py-0.5 bg-white border border-blue-400 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none shadow-2xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </td>
                    <td className="py-1.5 px-2.5 text-end font-mono font-bold text-slate-500">
                      {formatCurrency(parseFloat(editExpected || '0') - parseFloat(editReceived || '0'))}
                    </td>
                    <td className="py-1.5 px-2.5 text-center">
                      <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {isAr ? 'قيد التعديل' : 'Editing'}
                      </span>
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => saveEdit(item.id)}
                          className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all shadow-xs"
                          title="Save"
                        >
                          <Check className="w-3 h-3" strokeWidth={2} />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-1 bg-slate-300 hover:bg-slate-400 text-slate-800 rounded-lg transition-all"
                          title="Cancel"
                        >
                          <X className="w-3 h-3" strokeWidth={2} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="py-1 px-3">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${isReceived ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                      <input
                        type="text"
                        defaultValue={translateItemName(item.name, currentLanguage)}
                        data-grid="income-grid"
                        data-row={rowIndex}
                        data-col="name"
                        onBlur={(e) => {
                          if (e.target.value !== item.name) {
                            onUpdateIncomeItem({
                              ...item,
                              name: e.target.value.trim() || item.name,
                            });
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Enter') {
                            if ((e.target as HTMLInputElement).value !== item.name) {
                              onUpdateIncomeItem({
                                ...item,
                                name: (e.target as HTMLInputElement).value.trim() || item.name,
                              });
                            }
                          }
                          handleGridKeyDown(e, 'income-grid', rowIndex, 'name', {
                            enableHorizontal: true,
                            colOrder: ['name', 'expected'],
                          });
                        }}
                        className="w-full bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-500 rounded-md px-1.5 py-0.5 text-xs font-bold text-slate-800 focus:outline-none transition-all"
                        title={isAr ? 'انقر لتعديل الاسم (التنقل بالأسهم ↑ ↓ للأسفل وللأعلى)' : 'Click to edit name (navigate with ↑ ↓ arrows)'}
                      />
                    </div>
                  </td>
                  <td className="py-1 px-2.5">
                    <span className="text-[9.5px] font-bold text-slate-600 bg-slate-100/90 border border-slate-200/70 px-2 py-0.5 rounded-md inline-block">
                      {item.sourceType === 'salary' && (isAr ? 'راتب أساسي' : 'Salary')}
                      {item.sourceType === 'freelance' && (isAr ? 'عمل حر واستشارات' : 'Freelance')}
                      {item.sourceType === 'investments' && (isAr ? 'عوائد استثمار' : 'Investments')}
                      {item.sourceType === 'bonus' && (isAr ? 'مكافأة وحوافز' : 'Bonus')}
                      {item.sourceType === 'other' && (isAr ? 'إيرادات متنوعة' : 'Other')}
                    </span>
                  </td>
                  <td className="py-1 px-2.5 text-end">
                    <div className="flex items-center justify-end">
                      <input
                        type="number"
                        step="1"
                        defaultValue={Math.round(item.expectedAmount)}
                        data-grid="income-grid"
                        data-row={rowIndex}
                        data-col="expected"
                        onBlur={(e) => {
                          const val = Math.round(parseFloat(e.target.value) || 0);
                          if (val !== item.expectedAmount) {
                            onUpdateIncomeItem({
                              ...item,
                              expectedAmount: val,
                              isReceived: item.receivedAmount >= val && val > 0,
                            });
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Enter') {
                            const val = Math.round(parseFloat((e.target as HTMLInputElement).value) || 0);
                            if (val !== item.expectedAmount) {
                              onUpdateIncomeItem({
                                ...item,
                                expectedAmount: val,
                                isReceived: item.receivedAmount >= val && val > 0,
                              });
                            }
                          }
                          handleGridKeyDown(e, 'income-grid', rowIndex, 'expected', {
                            enableHorizontal: true,
                            colOrder: ['name', 'expected'],
                          });
                        }}
                        className="w-24 max-w-[90px] text-end bg-white/70 hover:bg-white focus:bg-white border border-slate-200/80 focus:border-blue-500 rounded-md px-1.5 py-0.5 text-xs font-mono font-bold text-slate-900 focus:outline-none transition-all shadow-2xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        title={isAr ? 'انقر لتعديل المتوقع' : 'Click to edit expected amount'}
                      />
                    </div>
                  </td>
                  <td className="py-1 px-2.5 text-end font-mono font-bold text-emerald-600 text-xs">
                    {formatCurrency(item.receivedAmount)}
                  </td>
                  <td className="py-1 px-2.5 text-end font-mono font-bold text-xs">
                    <span className={remaining <= 0 ? 'text-slate-400' : 'text-amber-600'}>
                      {formatCurrency(remaining > 0 ? remaining : 0)}
                    </span>
                  </td>
                  <td className="py-1 px-2.5 text-center">
                    <button
                      onClick={() => onToggleReceived(item.id)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold transition-all ${
                        isReceived
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-700 border border-amber-200/80 hover:bg-amber-100'
                      }`}
                    >
                      {isReceived ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" strokeWidth={2} />
                          <span>{isAr ? 'مُحصل' : 'Received'}</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-amber-500" strokeWidth={2} />
                          <span>{isAr ? 'قيد التحصيل' : 'Pending'}</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-1 px-2 text-center">
                    <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100">
                      <button
                        onClick={() => startEdit(item)}
                        className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="w-3 h-3" strokeWidth={2} />
                      </button>
                      <button
                        onClick={() => onDeleteIncomeItem(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" strokeWidth={2} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          {/* Summary Row */}
          <tfoot>
            <tr className="bg-gradient-to-r from-slate-900/95 via-emerald-950/90 to-slate-900/95 backdrop-blur-md border-t border-emerald-500/20 font-bold text-xs text-white font-arabic">
              <td colSpan={2} className="py-2 px-3 uppercase text-[11px]">
                {isAr ? 'إجمالي الإيرادات المتوقعة' : 'Total Revenue Forecast'}
              </td>
              <td className="py-2 px-2.5 text-end font-mono font-bold text-white text-xs">
                {formatCurrency(totalExpected)}
              </td>
              <td className="py-2 px-2.5 text-end font-mono font-bold text-emerald-400 text-xs">
                {formatCurrency(totalReceived)}
              </td>
              <td className="py-2 px-2.5 text-end font-mono font-bold text-amber-300 text-xs">
                {formatCurrency(pendingVariance > 0 ? pendingVariance : 0)}
              </td>
              <td colSpan={2} className="py-2 px-2.5 text-center text-[10px] text-slate-300 font-normal">
                {formatCurrency(totalReceived)} {isAr ? 'محصل فعلياً' : 'realized'}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
