import React, { useState } from 'react';
import { ExpenseCategory, IncomeItem, Transaction } from '../types';
import { formatCurrency } from '../utils/calculations';
import { translateItemName } from '../utils/localization';
import { LanguageCode } from '../i18n/translations';
import { Plus, Search, Filter, Trash2, ArrowDownLeft, ArrowUpRight, Tag, Layers, CheckCircle2 } from 'lucide-react';

interface TransactionLedgerProps {
  transactions: Transaction[];
  categories: ExpenseCategory[];
  incomeItems?: IncomeItem[];
  currentLanguage?: LanguageCode;
  onAddTransaction: () => void;
  onDeleteTransaction: (id: string) => void;
}

export const TransactionLedger: React.FC<TransactionLedgerProps> = ({
  transactions,
  categories,
  incomeItems = [],
  currentLanguage = 'ar',
  onAddTransaction,
  onDeleteTransaction,
}) => {
  const isAr = currentLanguage === 'ar';
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || tx.type === filterType;
    const matchesCategory = filterCategory === 'all' || tx.categoryId === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const getCategoryName = (categoryId: string) => {
    if (categoryId === 'income') return isAr ? 'مصادر الدخل والإيراد' : 'Inflow / Income';
    const found = categories.find((c) => c.id === categoryId);
    return found ? translateItemName(found.name, currentLanguage) : isAr ? 'غير مصنف' : 'Unassigned';
  };

  const getLinkedItemName = (tx: Transaction) => {
    if (tx.type === 'expense' && tx.expenseItemId) {
      const cat = categories.find((c) => c.id === tx.categoryId);
      if (cat) {
        const item = cat.items.find((i) => i.id === tx.expenseItemId);
        if (item) return translateItemName(item.name, currentLanguage);
      }
    } else if (tx.type === 'income' && tx.incomeItemId) {
      const inc = incomeItems.find((i) => i.id === tx.incomeItemId);
      if (inc) return translateItemName(inc.name, currentLanguage);
    }
    return null;
  };

  return (
    <div id="transaction-ledger-container" className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-5 font-arabic">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            {isAr ? 'سجل العمليات والتدقيق المالي' : 'Audit Ledger'}
          </h2>
          <p className="text-base font-bold text-slate-900 mt-0.5">
            {isAr ? 'العمليات المالية المسجلة والمرتبطة بالميزانية' : 'Realized Financial Transactions'} <span className="text-xs font-normal text-slate-500">({filteredTransactions.length} {isAr ? 'من' : 'of'} {transactions.length})</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={isAr ? 'بحث في البيان...' : 'Search memo...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ps-8 pe-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:border-blue-500 w-36 sm:w-48 transition-all"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="py-1.5 px-3 text-xs border border-slate-200 rounded-xl font-bold bg-slate-50 hover:bg-white focus:outline-none focus:border-blue-500 text-slate-700 transition-all cursor-pointer"
          >
            <option value="all">{isAr ? 'جميع العمليات' : 'All Types'}</option>
            <option value="expense">{isAr ? 'المصروفات فقط' : 'Outflow Only'}</option>
            <option value="income">{isAr ? 'الإيرادات فقط' : 'Inflow Only'}</option>
          </select>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="py-1.5 px-3 text-xs border border-slate-200 rounded-xl font-bold bg-slate-50 hover:bg-white focus:outline-none focus:border-blue-500 text-slate-700 max-w-36 truncate transition-all cursor-pointer"
          >
            <option value="all">{isAr ? 'جميع الفئات' : 'All Categories'}</option>
            <option value="income">{isAr ? 'مصادر الدخل' : 'Income Streams'}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {translateItemName(cat.name, currentLanguage)}
              </option>
            ))}
          </select>

          <button
            onClick={onAddTransaction}
            className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white px-3.5 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs hover:shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2} /> {isAr ? 'تسجيل معاملة' : 'Log Entry'}
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-start border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50/70">
              <th className="py-3 px-3 text-start">{isAr ? 'التاريخ' : 'Date'}</th>
              <th className="py-3 px-3 text-start">{isAr ? 'البيان / الوصف' : 'Description / Memo'}</th>
              <th className="py-3 px-3 text-start">{isAr ? 'الفئة والبند المرتبط' : 'Category & Line Item'}</th>
              <th className="py-3 px-3 text-start">{isAr ? 'النوع' : 'Type'}</th>
              <th className="py-3 px-3 text-end">{isAr ? 'المبلغ' : 'Amount'}</th>
              <th className="py-3 px-3 text-center w-12">{isAr ? 'إجراء' : 'Action'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 font-bold">
                  {isAr ? 'لا توجد معاملات مسجلة مطابقة' : 'No matching transactions logged'}
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => {
                const isIncome = tx.type === 'income';
                const linkedItem = getLinkedItemName(tx);
                return (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-3 px-3 font-mono text-slate-600 font-bold whitespace-nowrap">
                      {tx.date}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {tx.description}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-100/80 border border-slate-200/60 text-slate-700 font-bold text-[10px] rounded-full">
                          <Tag className="w-2.5 h-2.5 text-slate-400" />
                          {getCategoryName(tx.categoryId)}
                        </span>
                        {linkedItem && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 text-blue-800 border border-blue-200/60 font-bold text-[10px] rounded-full">
                            <Layers className="w-2.5 h-2.5 text-blue-600" />
                            {linkedItem}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 font-bold text-[10px] px-2.5 py-0.5 rounded-full ${
                          isIncome 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70' 
                            : 'bg-slate-100 text-slate-700 border border-slate-200/70'
                        }`}
                      >
                        {isIncome ? (
                          <>
                            <ArrowUpRight className="w-3 h-3 text-emerald-600" strokeWidth={2} /> {isAr ? 'وارد / إيراد' : 'Inflow'}
                          </>
                        ) : (
                          <>
                            <ArrowDownLeft className="w-3 h-3 text-slate-600" strokeWidth={2} /> {isAr ? 'صادر / مصروف' : 'Outflow'}
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-end whitespace-nowrap">
                      <span
                        className={`font-bold text-sm font-mono ${
                          isIncome ? 'text-emerald-600' : 'text-slate-900'
                        }`}
                      >
                        {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onDeleteTransaction(tx.id)}
                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg opacity-80 group-hover:opacity-100 transition-all"
                        title={isAr ? 'حذف المعاملة' : 'Delete Record'}
                      >
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
