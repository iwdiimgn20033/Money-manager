import React, { useState } from 'react';
import { BudgetPeriod, CurrencyInfo, ExpenseCategory, ExpenseItem, IncomeItem, Transaction } from '../types';
import { translateItemName } from '../utils/localization';
import { LanguageCode } from '../i18n/translations';
import { formatCurrency } from '../utils/calculations';
import { X, Plus, Calendar, DollarSign, Layers } from 'lucide-react';

interface EntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ExpenseCategory[];
  incomeItems?: IncomeItem[];
  currentLanguage?: LanguageCode;
  currentCurrency?: CurrencyInfo;
  onAddExpenseItem: (categoryId: string, item: Omit<ExpenseItem, 'id'>) => void;
  onAddIncomeItem: (item: Omit<IncomeItem, 'id'>) => void;
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
}

export const EntryModal: React.FC<EntryModalProps> = ({
  isOpen,
  onClose,
  categories,
  incomeItems = [],
  currentLanguage = 'ar',
  currentCurrency,
  onAddExpenseItem,
  onAddIncomeItem,
  onAddTransaction,
}) => {
  const isAr = currentLanguage === 'ar';
  const [entryMode, setEntryMode] = useState<'expense' | 'income' | 'transaction'>('transaction');
  
  // Transaction fields
  const [txDesc, setTxDesc] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().slice(0, 10));
  const [txType, setTxType] = useState<'expense' | 'income'>('expense');
  const [txCategory, setTxCategory] = useState(categories[0]?.id || 'cat-housing');
  const [txExpenseItemId, setTxExpenseItemId] = useState<string>('');
  const [txIncomeItemId, setTxIncomeItemId] = useState<string>(incomeItems[0]?.id || '');

  // Expense Line Item fields
  const [expName, setExpName] = useState('');
  const [expCategory, setExpCategory] = useState(categories[0]?.id || 'cat-housing');
  const [expBudgeted, setExpBudgeted] = useState('');
  const [expActual, setExpActual] = useState('');
  const [expIsFixed, setExpIsFixed] = useState(false);
  const [expNotes, setExpNotes] = useState('');

  // Income Line Item fields
  const [incName, setIncName] = useState('');
  const [incExpected, setIncExpected] = useState('');
  const [incReceived, setIncReceived] = useState('');
  const [incSource, setIncSource] = useState<'salary' | 'freelance' | 'investments' | 'bonus' | 'other'>('salary');
  const [incSettled, setIncSettled] = useState(false);

  if (!isOpen) return null;

  const selectedCatObj = categories.find((c) => c.id === txCategory);
  const currentExpenseItems = selectedCatObj ? selectedCatObj.items : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (entryMode === 'transaction') {
      if (!txDesc || !txAmount) return;
      const parsedAmount = Math.round(parseFloat(txAmount) || 0);
      
      // Determine final expense item id if expense
      const finalExpItemId = txType === 'expense' 
        ? (txExpenseItemId || (currentExpenseItems.length > 0 ? currentExpenseItems[0].id : undefined))
        : undefined;

      // Determine final income item id if income
      const finalIncItemId = txType === 'income'
        ? (txIncomeItemId || (incomeItems.length > 0 ? incomeItems[0].id : undefined))
        : undefined;

      onAddTransaction({
        date: txDate,
        description: txDesc,
        amount: parsedAmount,
        type: txType,
        categoryId: txType === 'income' ? 'income' : txCategory,
        expenseItemId: finalExpItemId,
        incomeItemId: finalIncItemId,
      });
    } else if (entryMode === 'expense') {
      if (!expName || !expBudgeted) return;
      onAddExpenseItem(expCategory, {
        categoryId: expCategory,
        name: expName,
        budgeted: Math.round(parseFloat(expBudgeted) || 0),
        actual: 0,
        isFixed: expIsFixed,
        notes: expNotes,
      });
    } else if (entryMode === 'income') {
      if (!incName || !incExpected) return;
      const expected = Math.round(parseFloat(incExpected) || 0);
      onAddIncomeItem({
        name: incName,
        expectedAmount: expected,
        receivedAmount: 0,
        sourceType: incSource,
        isReceived: false,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="bg-white border-2 border-slate-900 w-full max-w-lg shadow-2xl p-6 relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">
              {isAr ? 'سجل مالي جديد' : 'New Financial Record'}
            </h2>
            <p className="text-lg font-black text-slate-900">
              {entryMode === 'transaction' && (isAr ? 'تسجيل معاملة مالية فعلية' : 'Log Realized Transaction')}
              {entryMode === 'expense' && (isAr ? 'إنشاء بند مصروف في الموازنة' : 'Create Budgeted Expense Item')}
              {entryMode === 'income' && (isAr ? 'إضافة مصدر دخل وإيراد' : 'Add Income Stream Projection')}
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 my-4 bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setEntryMode('transaction')}
            className={`py-1.5 text-xs font-black uppercase tracking-wider transition-colors ${
              entryMode === 'transaction' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isAr ? 'معاملة مالية' : 'Transaction'}
          </button>
          <button
            type="button"
            onClick={() => setEntryMode('expense')}
            className={`py-1.5 text-xs font-black uppercase tracking-wider transition-colors ${
              entryMode === 'expense' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isAr ? 'بند ميزانية' : 'Budget Line'}
          </button>
          <button
            type="button"
            onClick={() => setEntryMode('income')}
            className={`py-1.5 text-xs font-black uppercase tracking-wider transition-colors ${
              entryMode === 'income' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isAr ? 'مصدر إيراد' : 'Inflow Source'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {entryMode === 'transaction' && (
            <>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                  {isAr ? 'نوع المعاملة' : 'Type of Transaction'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTxType('expense')}
                    className={`py-2 text-xs font-black uppercase ${
                      txType === 'expense' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {isAr ? 'مصروف صادر' : 'Expense Outflow'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxType('income')}
                    className={`py-2 text-xs font-black uppercase ${
                      txType === 'income' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {isAr ? 'إيراد وارد' : 'Income Inflow'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                  {isAr ? 'البيان / الوصف أو الجهة' : 'Description / Vendor'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isAr ? 'مثال: مشتريات تموينية، دفعة أتعاب، صيانة...' : 'e.g. Target Grocery Run, Freelance Wire'}
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 font-bold focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                    {isAr ? `المبلغ (${currentCurrency?.code || 'USD'})` : `Amount (${currentCurrency?.code || 'USD'})`}
                  </label>
                  <input
                    type="number"
                    step="1"
                    required
                    placeholder="0"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 font-bold focus:border-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                    {isAr ? 'التاريخ' : 'Date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 font-bold focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              {txType === 'expense' && (
                <div className="space-y-3 p-3 bg-slate-50 border border-slate-200">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                      {isAr ? 'الفئة المالية' : 'Category Allocation'}
                    </label>
                    <select
                      value={txCategory}
                      onChange={(e) => {
                        const newCat = e.target.value;
                        setTxCategory(newCat);
                        const cObj = categories.find(c => c.id === newCat);
                        if (cObj && cObj.items.length > 0) {
                          setTxExpenseItemId(cObj.items[0].id);
                        } else {
                          setTxExpenseItemId('');
                        }
                      }}
                      className="w-full px-3 py-2 text-xs border border-slate-300 font-bold focus:border-slate-900 focus:outline-none bg-white"
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
                      <label className="block text-[10px] font-black uppercase text-blue-700">
                        {isAr ? 'بند المصروف (ينزل المبلغ في الفعلي مباشرة)' : 'Expense Line Item (Updates Actual in Budget)'}
                      </label>
                      <span className="text-[9px] font-bold text-slate-400">
                        {isAr ? 'الميزانية مقابل الفعلي' : 'Budget vs Actual'}
                      </span>
                    </div>
                    <select
                      value={txExpenseItemId}
                      onChange={(e) => setTxExpenseItemId(e.target.value)}
                      className="w-full px-3 py-2 text-xs border-2 border-blue-500 font-bold focus:border-blue-700 focus:outline-none bg-white text-slate-900"
                    >
                      {currentExpenseItems.length === 0 ? (
                        <option value="">{isAr ? 'إجمالي الفئة العام' : 'General / Category Total'}</option>
                      ) : (
                        currentExpenseItems.map((item) => (
                          <option key={item.id} value={item.id}>
                            {translateItemName(item.name, currentLanguage)} ({isAr ? 'المخطط:' : 'Budgeted:'} {item.budgeted} • {isAr ? 'الفعلي الحالي:' : 'Current Actual:'} {item.actual})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>
              )}

              {txType === 'income' && incomeItems.length > 0 && (
                <div className="p-3 bg-emerald-50/50 border border-emerald-200">
                  <label className="block text-[10px] font-black uppercase text-emerald-800 mb-1">
                    {isAr ? 'بند الإيراد / مصدر الدخل المرتبط' : 'Linked Revenue Stream / Source'}
                  </label>
                  <select
                    value={txIncomeItemId}
                    onChange={(e) => setTxIncomeItemId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border-2 border-emerald-500 font-bold focus:border-emerald-700 focus:outline-none bg-white uppercase"
                  >
                    {incomeItems.map((inc) => (
                      <option key={inc.id} value={inc.id}>
                        {translateItemName(inc.name, currentLanguage)} ({isAr ? 'المتوقع:' : 'Expected:'} {inc.expectedAmount})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          {entryMode === 'expense' && (
            <>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                  {isAr ? 'الفئة الرئيسية' : 'Category'}
                </label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 font-bold focus:border-slate-900 focus:outline-none bg-white uppercase"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {translateItemName(c.name, currentLanguage)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                  {isAr ? 'اسم بند المصروف الجديد' : 'Item Name'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isAr ? 'مثال: اشتراكات سحابية، كهرباء، صيانة مركبات...' : 'e.g. Electricity, Cloud Subscriptions'}
                  value={expName}
                  onChange={(e) => setExpName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 font-bold focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                    {isAr ? 'المبلغ المخطط / الميزانية التقديرية ($)' : 'Monthly Budget Target ($)'}
                  </label>
                  <input
                    type="number"
                    step="1"
                    required
                    placeholder="0"
                    value={expBudgeted}
                    onChange={(e) => setExpBudgeted(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 font-bold focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="fixed-check"
                  checked={expIsFixed}
                  onChange={(e) => setExpIsFixed(e.target.checked)}
                  className="w-4 h-4 accent-slate-900"
                />
                <label htmlFor="fixed-check" className="text-xs font-bold text-slate-700">
                  {isAr ? 'مصروف ثابت دوري (مثل الإيجار، التأمين)' : 'Fixed Recurring Expense (e.g. Rent, Insurance)'}
                </label>
              </div>
            </>
          )}

          {entryMode === 'income' && (
            <>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                  {isAr ? 'اسم مصدر الإيراد' : 'Income Stream Name'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isAr ? 'مثال: أتعاب استشارات، مبيعات منتجات، أرباح...' : 'e.g. Consulting Retainer, Dividends'}
                  value={incName}
                  onChange={(e) => setIncName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 font-bold focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                    {isAr ? 'المبلغ المتوقع ($)' : 'Expected Inflow ($)'}
                  </label>
                  <input
                    type="number"
                    step="1"
                    required
                    placeholder="0"
                    value={incExpected}
                    onChange={(e) => setIncExpected(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 font-bold focus:border-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                    {isAr ? 'تصنيف المصدر' : 'Source Classification'}
                  </label>
                  <select
                    value={incSource}
                    onChange={(e) => setIncSource(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 font-bold focus:border-slate-900 focus:outline-none uppercase bg-white"
                  >
                    <option value="salary">{isAr ? 'راتب أساسي' : 'Primary Salary'}</option>
                    <option value="freelance">{isAr ? 'عمل حر / مستقل' : 'Freelance / Side Gig'}</option>
                    <option value="investments">{isAr ? 'أرباح استثمارية' : 'Dividends / Yield'}</option>
                    <option value="bonus">{isAr ? 'مكافآت وعمولات' : 'Bonus / Commission'}</option>
                    <option value="other">{isAr ? 'إيرادات أخرى' : 'Other Inflow'}</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-100"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-xs font-black uppercase tracking-widest"
            >
              {isAr ? 'تأكيد وحفظ' : 'Confirm & Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface PeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  period: BudgetPeriod;
  onUpdatePeriod: (updated: BudgetPeriod) => void;
  currentLanguage?: LanguageCode;
}

export const PeriodModal: React.FC<PeriodModalProps> = ({
  isOpen,
  onClose,
  period,
  onUpdatePeriod,
  currentLanguage = 'ar',
}) => {
  const isAr = currentLanguage === 'ar';
  const [label, setLabel] = useState(period.label);
  const [startingBalance, setStartingBalance] = useState(period.startingBankBalance.toString());
  const [currentDay, setCurrentDay] = useState(period.currentDay.toString());
  const [totalDays, setTotalDays] = useState(period.totalDays.toString());
  const [startDate, setStartDate] = useState(period.startDate || '');
  const [endDate, setEndDate] = useState(period.endDate || '');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePeriod({
      ...period,
      label,
      startingBankBalance: parseFloat(startingBalance) || 0,
      currentDay: parseInt(currentDay, 10) || 1,
      totalDays: parseInt(totalDays, 10) || 30,
      startDate: startDate || period.startDate,
      endDate: endDate || period.endDate,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="bg-white border-2 border-slate-900 w-full max-w-md shadow-2xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">
              {isAr ? 'إعدادات الفترة المالية' : 'Period Configuration'}
            </h2>
            <p className="text-base font-black text-slate-900">
              {isAr ? 'تحديد أيام الشهر ورصيد البداية والتواريخ' : 'Set Period Dates & Starting Reserves'}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 my-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
              {isAr ? 'مسمى الفترة' : 'Period Label'}
            </label>
            <input
              type="text"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 font-bold focus:border-slate-900 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                {isAr ? 'تاريخ البداية' : 'Start Date'}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 font-bold focus:border-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                {isAr ? 'تاريخ النهاية' : 'End Date'}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 font-bold focus:border-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
              {isAr ? 'رصيد البداية والسيولة النقدية ($)' : 'Starting Cash / Bank Balance ($)'}
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={startingBalance}
              onChange={(e) => setStartingBalance(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 font-bold focus:border-slate-900 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                {isAr ? 'اليوم الحالي من الفترة' : 'Current Day of Period'}
              </label>
              <input
                type="number"
                min="1"
                max="365"
                required
                value={currentDay}
                onChange={(e) => setCurrentDay(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 font-bold focus:border-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                {isAr ? 'إجمالي أيام الفترة' : 'Total Days in Period'}
              </label>
              <input
                type="number"
                min="1"
                max="365"
                required
                value={totalDays}
                onChange={(e) => setTotalDays(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 font-bold focus:border-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-100"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-xs font-black uppercase tracking-widest"
            >
              {isAr ? 'حفظ وتطبيق' : 'Apply Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
