import React, { useState, useEffect } from 'react';
import { CurrencyInfo, ExpenseCategory, ExpenseItem, IncomeItem, Transaction } from '../types';
import { translateItemName } from '../utils/localization';
import { LanguageCode, TRANSLATIONS } from '../i18n/translations';
import { formatCurrency } from '../utils/calculations';
import { 
  X, 
  Plus, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Receipt, 
  Wallet, 
  Calendar, 
  Tag, 
  Sparkles,
  CheckCircle2,
  DollarSign,
  Layers,
  TrendingUp,
  RefreshCw,
  Clock,
  ChevronDown
} from 'lucide-react';

interface TransactionSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ExpenseCategory[];
  incomeItems?: IncomeItem[];
  recentTransactions?: Transaction[];
  currentLanguage?: LanguageCode;
  currentCurrency?: CurrencyInfo;
  onAddExpenseItem: (categoryId: string, item: Omit<ExpenseItem, 'id'>) => void;
  onAddIncomeItem: (item: Omit<IncomeItem, 'id'>) => void;
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
}

export const TransactionSidePanel: React.FC<TransactionSidePanelProps> = ({
  isOpen,
  onClose,
  categories,
  incomeItems = [],
  recentTransactions = [],
  currentLanguage = 'ar',
  currentCurrency,
  onAddExpenseItem,
  onAddIncomeItem,
  onAddTransaction,
}) => {
  const isAr = currentLanguage === 'ar';
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const [entryMode, setEntryMode] = useState<'transaction' | 'expense' | 'income'>('transaction');
  
  // Transaction fields
  const [txDesc, setTxDesc] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().slice(0, 10));
  const [txType, setTxType] = useState<'expense' | 'income'>('expense');
  const [txCategory, setTxCategory] = useState(categories[0]?.id || 'cat-housing');
  const [txExpenseItemId, setTxExpenseItemId] = useState<string>('');
  const [txIncomeItemId, setTxIncomeItemId] = useState<string>(incomeItems[0]?.id || '');
  const [lastAddedAlert, setLastAddedAlert] = useState<string | null>(null);

  // Expense Line Item fields
  const [expName, setExpName] = useState('');
  const [expCategory, setExpCategory] = useState(categories[0]?.id || 'cat-housing');
  const [expBudgeted, setExpBudgeted] = useState('');
  const [expIsFixed, setExpIsFixed] = useState(false);
  const [expNotes, setExpNotes] = useState('');

  // Income Line Item fields
  const [incName, setIncName] = useState('');
  const [incExpected, setIncExpected] = useState('');
  const [incSource, setIncSource] = useState<'salary' | 'freelance' | 'investments' | 'bonus' | 'other'>('salary');

  // Keep category in sync
  useEffect(() => {
    if (categories.length > 0 && !categories.some(c => c.id === txCategory)) {
      setTxCategory(categories[0].id);
    }
  }, [categories, txCategory]);

  const selectedCatObj = categories.find((c) => c.id === txCategory);
  const currentExpenseItems = selectedCatObj ? selectedCatObj.items : [];

  // Update default selected expense item when category changes
  useEffect(() => {
    if (currentExpenseItems.length > 0) {
      if (!currentExpenseItems.some(i => i.id === txExpenseItemId)) {
        setTxExpenseItemId(currentExpenseItems[0].id);
      }
    } else {
      setTxExpenseItemId('');
    }
  }, [txCategory, currentExpenseItems, txExpenseItemId]);

  // Quick preset amount additions
  const handleAddPreset = (val: number) => {
    const current = Math.round(parseFloat(txAmount) || 0);
    setTxAmount((current + val).toString());
  };

  // Preset quick tags for description
  const quickExpenseDescriptions = isAr 
    ? ['سوبرماركت وتموين', 'وقود ومواصلات', 'مطعم وكافيه', 'فواتير واشتراكات', 'صيانة منزلية', 'مستلزمات صيدلية']
    : ['Groceries & Supermarket', 'Gas & Fuel', 'Restaurant & Cafe', 'Utility Bills', 'Home Repairs', 'Pharmacy & Health'];

  const quickIncomeDescriptions = isAr
    ? ['تحويل راتب شهري', 'أتعاب استشارات', 'أرباح وتوزيعات', 'دفعة عمل حر', 'مكافأة إنجاز']
    : ['Monthly Salary Wire', 'Consulting Fee', 'Investment Dividends', 'Freelance Milestone', 'Performance Bonus'];

  const executeAddTransaction = (keepOpen: boolean) => {
    if (entryMode === 'transaction') {
      if (!txDesc.trim() || !txAmount) return;
      const parsedAmount = Math.round(parseFloat(txAmount) || 0);
      if (parsedAmount <= 0) return;

      const finalExpItemId = txType === 'expense' 
        ? (txExpenseItemId || (currentExpenseItems.length > 0 ? currentExpenseItems[0].id : undefined))
        : undefined;

      const finalIncItemId = txType === 'income'
        ? (txIncomeItemId || (incomeItems.length > 0 ? incomeItems[0].id : undefined))
        : undefined;

      onAddTransaction({
        date: txDate,
        description: txDesc.trim(),
        amount: parsedAmount,
        type: txType,
        categoryId: txType === 'income' ? 'income' : txCategory,
        expenseItemId: finalExpItemId,
        incomeItemId: finalIncItemId,
      });

      setLastAddedAlert(
        isAr 
          ? `تم تسجيل ${txType === 'expense' ? 'مصروف' : 'إيراد'} بقيمة ${formatCurrency(parsedAmount)} بنجاح!` 
          : `Logged ${txType === 'expense' ? 'Expense' : 'Income'} of ${formatCurrency(parsedAmount)} successfully!`
      );
      setTimeout(() => setLastAddedAlert(null), 3000);

      setTxDesc('');
      setTxAmount('');

      if (!keepOpen) {
        onClose();
      }
    } else if (entryMode === 'expense') {
      if (!expName.trim() || !expBudgeted) return;
      const parsed = Math.round(parseFloat(expBudgeted) || 0);
      onAddExpenseItem(expCategory, {
        categoryId: expCategory,
        name: expName.trim(),
        budgeted: parsed,
        actual: 0,
        isFixed: expIsFixed,
        notes: expNotes.trim(),
      });

      setLastAddedAlert(isAr ? `تمت إضافة بند المصروف "${expName}" بميزانية ${formatCurrency(parsed)}` : `Added budget line item "${expName}"`);
      setTimeout(() => setLastAddedAlert(null), 3000);
      setExpName('');
      setExpBudgeted('');
      setExpNotes('');

      if (!keepOpen) {
        onClose();
      }
    } else if (entryMode === 'income') {
      if (!incName.trim() || !incExpected) return;
      const parsed = Math.round(parseFloat(incExpected) || 0);
      onAddIncomeItem({
        name: incName.trim(),
        expectedAmount: parsed,
        receivedAmount: 0,
        sourceType: incSource,
        isReceived: false,
      });

      setLastAddedAlert(isAr ? `تمت إضافة مصدر الدخل "${incName}" بإيراد متوقع ${formatCurrency(parsed)}` : `Added income stream "${incName}"`);
      setTimeout(() => setLastAddedAlert(null), 3000);
      setIncName('');
      setIncExpected('');

      if (!keepOpen) {
        onClose();
      }
    }
  };

  const selectedExpenseItemObj = currentExpenseItems.find(i => i.id === txExpenseItemId);
  const remainingInItem = selectedExpenseItemObj 
    ? (selectedExpenseItemObj.budgeted - (selectedExpenseItemObj.actual + (parseFloat(txAmount) || 0)))
    : null;

  return (
    <div 
      className={`fixed inset-0 z-50 transition-all duration-300 pointer-events-none ${
        isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Soft translucent, non-blocking click-away background (Main screen remains visible!) */}
      <div 
        onClick={onClose}
        className={`fixed inset-0 bg-slate-950/30 backdrop-blur-[1px] transition-opacity duration-300 pointer-events-auto ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Slide-over Side Panel */}
      <aside 
        className={`fixed inset-y-0 ${
          isAr ? 'left-0' : 'right-0'
        } w-full sm:w-[450px] lg:w-[480px] bg-white shadow-2xl border-s border-slate-200 flex flex-col z-50 transform transition-transform duration-300 ease-out pointer-events-auto ${
          isOpen ? 'translate-x-0' : (isAr ? '-translate-x-full' : 'translate-x-full')
        }`}
      >
        {/* Panel Header */}
        <div className="bg-slate-50 text-slate-900 p-4 flex items-center justify-between border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0">
              <Receipt className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 font-arabic">
                  {isAr ? 'لوحة تسجيل وإدخال العمليات المالية' : 'Financial Entry & Transaction Panel'}
                </h2>
                <span className="text-[9px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-md">
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-arabic mt-0.5">
                {isAr ? 'إدخال فوري للعمليات مع بقاء الشاشة الرئيسية ظاهرة ومحدثة' : 'Instant transaction logging with live background updates'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title={isAr ? 'إغلاق اللوحة الجانبية' : 'Close Panel'}
          >
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>

        {/* Success / Feedback Toast Alert */}
        {lastAddedAlert && (
          <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-800 px-4 py-2.5 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={2} />
            <span className="font-arabic flex-1">{lastAddedAlert}</span>
          </div>
        )}

        {/* Mode Selector Tabs (معاملة / بند مصروف / مصدر دخل) */}
        <div className="bg-slate-100/90 p-2 border-b border-slate-200 shrink-0">
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-200/80 rounded-xl font-arabic">
            <button
              type="button"
              onClick={() => setEntryMode('transaction')}
              className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                entryMode === 'transaction'
                  ? 'bg-white text-slate-900 shadow-sm font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Receipt className="w-3.5 h-3.5 text-blue-600 shrink-0" strokeWidth={1.75} />
              <span className="truncate">{isAr ? 'معاملة مالية' : 'Transaction'}</span>
            </button>

            <button
              type="button"
              onClick={() => setEntryMode('expense')}
              className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                entryMode === 'expense'
                  ? 'bg-white text-slate-900 shadow-sm font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-amber-600 shrink-0" strokeWidth={1.75} />
              <span className="truncate">{isAr ? 'بند ميزانية' : 'Budget Item'}</span>
            </button>

            <button
              type="button"
              onClick={() => setEntryMode('income')}
              className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                entryMode === 'income'
                  ? 'bg-white text-slate-900 shadow-sm font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" strokeWidth={1.75} />
              <span className="truncate">{isAr ? 'مصدر إيراد' : 'Inflow Stream'}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-arabic scrollbar-thin scrollbar-thumb-slate-200">
          {/* TAB 1: TRANSACTION ENTRY (معاملة فعلية) */}
          {entryMode === 'transaction' && (
            <div className="space-y-4">
              {/* Type Switcher: Expense Outflow vs Income Inflow */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  {isAr ? 'نوع العملية المالية' : 'Transaction Type'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTxType('expense')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      txType === 'expense'
                        ? 'bg-rose-50 border-rose-400 text-rose-800 shadow-xs ring-1 ring-rose-400 font-extrabold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <ArrowDownLeft className={`w-4 h-4 ${txType === 'expense' ? 'text-rose-600' : 'text-slate-400'}`} strokeWidth={2} />
                    <span>{isAr ? 'مصروف صادر (Outflow)' : 'Expense Outflow'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTxType('income')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      txType === 'income'
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-xs ring-1 ring-emerald-400 font-extrabold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <ArrowUpRight className={`w-4 h-4 ${txType === 'income' ? 'text-emerald-600' : 'text-slate-400'}`} strokeWidth={2} />
                    <span>{isAr ? 'إيراد وارد (Inflow)' : 'Income Inflow'}</span>
                  </button>
                </div>
              </div>

              {/* Amount Field with Quick Presets */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    {isAr ? `مبلغ المعاملة (${currentCurrency?.code || 'USD'})` : `Amount (${currentCurrency?.code || 'USD'})`}
                  </label>
                  <span className="text-[10px] font-bold text-blue-600 font-mono">
                    {currentCurrency?.symbol || '$'} {currentCurrency?.code || 'USD'}
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    required
                    placeholder="0"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    className="w-full text-end px-3 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-lg font-mono font-black text-slate-900 focus:border-blue-600 focus:outline-none shadow-xs"
                    autoFocus
                  />
                </div>

                {/* Quick Add Presets (+50, +100, +250, +500, +1000) */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-slate-500 font-semibold">{isAr ? 'إضافة سريعة:' : 'Quick Add:'}</span>
                  {[50, 100, 250, 500, 1000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleAddPreset(val)}
                      className="px-2 py-1 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 rounded-lg text-[11px] font-mono font-bold transition-all shadow-2xs"
                    >
                      +{val}
                    </button>
                  ))}
                  {txAmount && (
                    <button
                      type="button"
                      onClick={() => setTxAmount('')}
                      className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[10px] font-bold transition-all ms-auto"
                    >
                      {isAr ? 'تفريغ' : 'Clear'}
                    </button>
                  )}
                </div>
              </div>

              {/* Description / Vendor Field */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  {isAr ? 'البيان / الوصف أو الجهة' : 'Description / Merchant'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    txType === 'expense'
                      ? (isAr ? 'مثال: سوبرماركت، وقود سيارة، فاتورة كهرباء...' : 'e.g. Walmart Groceries, Gas Station')
                      : (isAr ? 'مثال: راتب شهري، دفعة استشارات، مكافأة...' : 'e.g. Monthly Salary, Freelance Invoice')
                  }
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-blue-600 focus:outline-none shadow-2xs"
                />

                {/* Suggested Description Chips */}
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    {isAr ? 'مقترحات شائعة:' : 'Suggestions:'}
                  </span>
                  {(txType === 'expense' ? quickExpenseDescriptions : quickIncomeDescriptions).slice(0, 3).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setTxDesc(item)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] font-medium transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Field */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  {isAr ? 'تاريخ المعاملة' : 'Transaction Date'}
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-blue-600 focus:outline-none shadow-2xs"
                  />
                </div>
              </div>

              {/* Expense Category & Line Item Linkage */}
              {txType === 'expense' && (
                <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                      {isAr ? 'الفئة الرئيسية للمصروف' : 'Expense Category'}
                    </label>
                    <select
                      value={txCategory}
                      onChange={(e) => setTxCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-blue-600 focus:outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {translateItemName(c.name, currentLanguage)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-blue-700">
                        {isAr ? 'بند المصروف المرتبط (يحدث الفعلي مباشرة في الميزانية)' : 'Linked Budget Line Item'}
                      </label>
                      <span className="text-[10px] font-semibold text-slate-500 font-mono">
                        {currentExpenseItems.length} {isAr ? 'بنود' : 'Items'}
                      </span>
                    </div>

                    <select
                      value={txExpenseItemId}
                      onChange={(e) => setTxExpenseItemId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border-2 border-blue-400 rounded-xl text-xs font-bold text-slate-900 focus:border-blue-600 focus:outline-none"
                    >
                      {currentExpenseItems.length === 0 ? (
                        <option value="">{isAr ? 'إجمالي الفئة العام' : 'General Category Total'}</option>
                      ) : (
                        currentExpenseItems.map((item) => (
                          <option key={item.id} value={item.id}>
                            {translateItemName(item.name, currentLanguage)} ({isAr ? 'المخطط:' : 'Target:'} {formatCurrency(item.budgeted)} | {isAr ? 'الفعلي:' : 'Actual:'} {formatCurrency(item.actual)})
                          </option>
                        ))
                      )}
                    </select>

                    {/* Live Budget Impact Indicator */}
                    {selectedExpenseItemObj && (
                      <div className="mt-2 p-2 rounded-xl bg-white border border-slate-200 text-[11px] flex items-center justify-between">
                        <span className="text-slate-500 font-medium">{isAr ? 'المتبقي في هذا البند بعد الإدخال:' : 'Remaining in this item:'}</span>
                        <span className={`font-mono font-bold ${(remainingInItem || 0) < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {formatCurrency(remainingInItem || 0, { showSign: true })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Income Stream Linkage */}
              {txType === 'income' && incomeItems.length > 0 && (
                <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200 space-y-2">
                  <label className="block text-[11px] font-bold text-emerald-800 mb-1">
                    {isAr ? 'مصدر الدخل المرتبط (لتحديث المحصل الفعلي)' : 'Linked Revenue Stream'}
                  </label>
                  <select
                    value={txIncomeItemId}
                    onChange={(e) => setTxIncomeItemId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border-2 border-emerald-400 rounded-xl text-xs font-bold text-slate-900 focus:border-emerald-600 focus:outline-none"
                  >
                    {incomeItems.map((inc) => (
                      <option key={inc.id} value={inc.id}>
                        {translateItemName(inc.name, currentLanguage)} ({isAr ? 'المتوقع:' : 'Expected:'} {formatCurrency(inc.expectedAmount)} | {isAr ? 'المحصل:' : 'Received:'} {formatCurrency(inc.receivedAmount)})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: NEW EXPENSE BUDGET ITEM (إضافة بند ميزانية) */}
          {entryMode === 'expense' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  {isAr ? 'الفئة الرئيسية' : 'Parent Category'}
                </label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-blue-600 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {translateItemName(c.name, currentLanguage)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  {isAr ? 'اسم بند المصروف' : 'Expense Item Name'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isAr ? 'مثال: اشتراكات رقمية، كهرباء، وقود، صيانة...' : 'e.g. Cloud Hosting, Gym Membership'}
                  value={expName}
                  onChange={(e) => setExpName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  {isAr ? `الميزانية التقديرية المخططة (${currentCurrency?.code || 'USD'})` : `Monthly Budget Target (${currentCurrency?.code || 'USD'})`}
                </label>
                <input
                  type="number"
                  step="1"
                  required
                  placeholder="0"
                  value={expBudgeted}
                  onChange={(e) => setExpBudgeted(e.target.value)}
                  className="w-full text-end px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="panel-fixed-check"
                  checked={expIsFixed}
                  onChange={(e) => setExpIsFixed(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
                <label htmlFor="panel-fixed-check" className="text-xs font-bold text-slate-700 cursor-pointer">
                  {isAr ? 'مصروف ثابت دوري (مثل الإيجار، التأمين، القسط)' : 'Fixed Recurring Commitment'}
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  {isAr ? 'ملاحظات إضافية' : 'Notes & Details'}
                </label>
                <input
                  type="text"
                  placeholder={isAr ? 'أي ملاحظات أو شروط...' : 'Optional notes...'}
                  value={expNotes}
                  onChange={(e) => setExpNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 3: NEW INCOME STREAM (إضافة مصدر إيراد) */}
          {entryMode === 'income' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  {isAr ? 'اسم مصدر الإيراد والدخل' : 'Income Stream Title'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isAr ? 'مثال: أتعاب استشارات، راتب وظيفي، توزيعات أرباح...' : 'e.g. Primary Salary, Consulting'}
                  value={incName}
                  onChange={(e) => setIncName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  {isAr ? `المبلغ المتوقع تحصيله (${currentCurrency?.code || 'USD'})` : `Expected Inflow Target (${currentCurrency?.code || 'USD'})`}
                </label>
                <input
                  type="number"
                  step="1"
                  required
                  placeholder="0"
                  value={incExpected}
                  onChange={(e) => setIncExpected(e.target.value)}
                  className="w-full text-end px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  {isAr ? 'تصنيف مصدر الدخل' : 'Stream Classification'}
                </label>
                <select
                  value={incSource}
                  onChange={(e) => setIncSource(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-emerald-600 focus:outline-none"
                >
                  <option value="salary">{isAr ? 'راتب أساسي (Salary)' : 'Primary Salary'}</option>
                  <option value="freelance">{isAr ? 'عمل حر واستشارات (Freelance)' : 'Freelance / Consulting'}</option>
                  <option value="investments">{isAr ? 'عوائد استثمارية (Investments)' : 'Investments / Yield'}</option>
                  <option value="bonus">{isAr ? 'مكافأة وحوافز (Bonus)' : 'Bonus / Incentive'}</option>
                  <option value="other">{isAr ? 'إيرادات أخرى (Other)' : 'Other Revenue'}</option>
                </select>
              </div>
            </div>
          )}

          {/* Recent 3 Transactions Mini-Audit Trail (Confidence check) */}
          {recentTransactions.length > 0 && entryMode === 'transaction' && (
            <div className="pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {isAr ? 'آخر المعاملات المسجلة حديثاً:' : 'Recently Logged Transactions:'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{recentTransactions.length}</span>
              </div>
              <div className="space-y-1.5">
                {recentTransactions.slice(0, 3).map((tx) => (
                  <div key={tx.id} className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div className="min-w-0 pr-2">
                      <div className="font-bold text-slate-800 truncate">{tx.description}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{tx.date}</div>
                    </div>
                    <div className={`font-mono font-bold shrink-0 ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Panel Footer Action Buttons */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0 font-arabic">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-all"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => executeAddTransaction(true)}
              className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
              title={isAr ? 'حفظ العملية وترك اللوحة مفتوحة لتسجيل عملية أخرى' : 'Save & Keep open for next entry'}
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-600" strokeWidth={1.75} />
              <span>{isAr ? 'حفظ وإضافة أخرى' : 'Save & Add More'}</span>
            </button>

            <button
              type="button"
              onClick={() => executeAddTransaction(false)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-blue-600/30"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              <span>{isAr ? 'حفظ وإغلاق' : 'Save & Close'}</span>
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};
