import React, { useState, useRef } from 'react';
import { 
  BudgetPeriod, 
  ExpenseCategory, 
  IncomeItem, 
  Transaction, 
  BalanceSheetData, 
  CurrencyInfo, 
  UserProfile, 
  SUPPORTED_CURRENCIES 
} from '../types';
import { LanguageCode } from '../i18n/translations';
import { 
  Settings, 
  Trash2, 
  RotateCcw, 
  Download, 
  Upload, 
  Sparkles, 
  Check, 
  AlertTriangle, 
  ShieldCheck, 
  Coins, 
  Layers, 
  Briefcase, 
  Home, 
  User, 
  FileText, 
  ArrowRight,
  Database,
  RefreshCw,
  LogOut,
  LogIn,
  UserPlus,
  GitBranch,
  ExternalLink
} from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

interface SettingsViewProps {
  period: BudgetPeriod;
  categories: ExpenseCategory[];
  incomeItems: IncomeItem[];
  transactions: Transaction[];
  balanceSheet: BalanceSheetData;
  currentCurrency: CurrencyInfo;
  currentUser: UserProfile | null;
  currentLanguage: LanguageCode;
  onUpdatePeriod: (p: BudgetPeriod) => void;
  onUpdateCategories: (cats: ExpenseCategory[]) => void;
  onUpdateIncomeItems: (items: IncomeItem[]) => void;
  onUpdateTransactions: (txs: Transaction[]) => void;
  onUpdateBalanceSheet: (bs: BalanceSheetData) => void;
  onSelectCurrency: (c: CurrencyInfo) => void;
  onOpenAuthModal: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
  onOpenSupabaseConfig?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  period,
  categories,
  incomeItems,
  transactions,
  balanceSheet,
  currentCurrency,
  currentUser,
  currentLanguage,
  onUpdatePeriod,
  onUpdateCategories,
  onUpdateIncomeItems,
  onUpdateTransactions,
  onUpdateBalanceSheet,
  onSelectCurrency,
  onOpenAuthModal,
  onLogout,
  onOpenSupabaseConfig = () => {},
}) => {
  const isAr = currentLanguage === 'ar';
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState<string | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // 1. Clear All Transactions & Journal Entries
  const handleClearTransactionsOnly = () => {
    onUpdateTransactions([]);
    
    // Clear actual spend on categories
    const resetCategories = categories.map((cat) => ({
      ...cat,
      items: cat.items.map((item) => ({ ...item, actual: 0 })),
    }));
    onUpdateCategories(resetCategories);

    // Clear received amount on income items
    const resetIncome = incomeItems.map((inc) => ({
      ...inc,
      receivedAmount: 0,
      isReceived: false,
    }));
    onUpdateIncomeItems(resetIncome);

    // Clear manual journal entries from local storage
    localStorage.removeItem('budget_manual_journal_entries_v1');

    setShowConfirmReset(null);
    showToast(
      isAr 
        ? 'تم تصفير جميع القيود والمعاملات السابقة بنجاح، أصبحت السجلات نقية تماماً.' 
        : 'All transactions and journal entries cleared successfully.'
    );
  };

  // 2. Full Zero-Based Reset (Blank Budget)
  const handleApplyCleanSlate = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const lastDay = new Date(currentYear, currentMonth, 0).getDate();

    const cleanPeriod: BudgetPeriod = {
      id: `period-${Date.now()}`,
      month: currentMonth,
      year: currentYear,
      label: `${today.toLocaleString(isAr ? 'ar' : 'en', { month: 'long' })} ${currentYear}`,
      startDate: `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`,
      endDate: `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`,
      startingBankBalance: 0,
      currentDay: today.getDate(),
      totalDays: lastDay,
    };

    const cleanCategories: ExpenseCategory[] = [
      {
        id: 'cat-housing',
        name: isAr ? 'السكن والمرافق' : 'Housing & Utilities',
        color: '#0f172a',
        iconName: 'Home',
        items: [
          { id: 'exp-1', categoryId: 'cat-housing', name: isAr ? 'إيجار / تمويل السكن' : 'Rent / Mortgage', budgeted: 0, actual: 0, isFixed: true },
          { id: 'exp-2', categoryId: 'cat-housing', name: isAr ? 'الكهرباء والمياه والغاز' : 'Utilities (Power/Water)', budgeted: 0, actual: 0, isFixed: false },
          { id: 'exp-3', categoryId: 'cat-housing', name: isAr ? 'الإنترنت والاتصالات' : 'Internet & Telecom', budgeted: 0, actual: 0, isFixed: true },
        ],
      },
      {
        id: 'cat-living',
        name: isAr ? 'المعيشة والتموين' : 'Living & Groceries',
        color: '#2563eb',
        iconName: 'ShoppingBag',
        items: [
          { id: 'exp-4', categoryId: 'cat-living', name: isAr ? 'المشتريات والسوبرماركت' : 'Supermarket & Groceries', budgeted: 0, actual: 0, isFixed: false },
          { id: 'exp-5', categoryId: 'cat-living', name: isAr ? 'المطاعم والوجبات' : 'Dining & Restaurants', budgeted: 0, actual: 0, isFixed: false },
        ],
      },
      {
        id: 'cat-transport',
        name: isAr ? 'المواصلات والنقل' : 'Transportation',
        color: '#0284c7',
        iconName: 'Car',
        items: [
          { id: 'exp-6', categoryId: 'cat-transport', name: isAr ? 'وقود وصيانة السيارة' : 'Fuel & Maintenance', budgeted: 0, actual: 0, isFixed: false },
          { id: 'exp-7', categoryId: 'cat-transport', name: isAr ? 'التأمين والمواقف' : 'Insurance & Parking', budgeted: 0, actual: 0, isFixed: true },
        ],
      },
      {
        id: 'cat-savings',
        name: isAr ? 'الادخار والاستثمار' : 'Savings & Investment',
        color: '#059669',
        iconName: 'PiggyBank',
        items: [
          { id: 'exp-8', categoryId: 'cat-savings', name: isAr ? 'صندوق الطوارئ والسيولة' : 'Emergency Fund', budgeted: 0, actual: 0, isFixed: true },
          { id: 'exp-9', categoryId: 'cat-savings', name: isAr ? 'الاستثمار والأسهم' : 'Investment & Stocks', budgeted: 0, actual: 0, isFixed: true },
        ],
      },
    ];

    const cleanIncome: IncomeItem[] = [
      {
        id: 'inc-1',
        name: isAr ? 'الراتب والدخل الرئيسي' : 'Primary Salary / Income',
        expectedAmount: 0,
        receivedAmount: 0,
        sourceType: 'salary',
        isReceived: false,
      },
      {
        id: 'inc-2',
        name: isAr ? 'دخل إضافي / أعمال حرة' : 'Side Business / Freelance',
        expectedAmount: 0,
        receivedAmount: 0,
        sourceType: 'freelance',
        isReceived: false,
      },
    ];

    const cleanBalanceSheet: BalanceSheetData = {
      asOfDate: today.toISOString().split('T')[0],
      assets: [
        { id: 'ast-1', name: isAr ? 'الحسابات البنكية والسيولة' : 'Bank Accounts & Cash', category: 'current', value: 0 },
        { id: 'ast-2', name: isAr ? 'المحافظ والمدخرات الاستثمارية' : 'Investments & Savings', category: 'liquid_investments', value: 0 },
      ],
      liabilities: [
        { id: 'liab-1', name: isAr ? 'مستحقات وبطاقات ائتمان' : 'Credit Cards & Short Debt', category: 'current', value: 0 },
      ],
    };

    onUpdatePeriod(cleanPeriod);
    onUpdateCategories(cleanCategories);
    onUpdateIncomeItems(cleanIncome);
    onUpdateTransactions([]);
    onUpdateBalanceSheet(cleanBalanceSheet);
    localStorage.removeItem('budget_manual_journal_entries_v1');

    setShowConfirmReset(null);
    showToast(isAr ? 'تم تطبيق الميزانية الصفرية النظيفة بنجاح!' : 'Clean slate budget applied successfully!');
  };

  // 3. Apply Template: Personal Finance Starter
  const handleApplyPersonalTemplate = () => {
    const today = new Date();
    const cleanIncome: IncomeItem[] = [
      { id: 'inc-1', name: isAr ? 'الراتب الشهري الأساسي' : 'Primary Monthly Salary', expectedAmount: 18000, receivedAmount: 18000, sourceType: 'salary', isReceived: true },
      { id: 'inc-2', name: isAr ? 'عوائد استثمارية وتوزيعات' : 'Investment Dividends', expectedAmount: 1500, receivedAmount: 0, sourceType: 'investments', isReceived: false },
    ];

    const cleanCategories: ExpenseCategory[] = [
      {
        id: 'cat-housing',
        name: isAr ? 'السكن والفواتير' : 'Housing & Utilities',
        color: '#0f172a',
        iconName: 'Home',
        items: [
          { id: 'exp-1', categoryId: 'cat-housing', name: isAr ? 'إيجار السكن' : 'Apartment Rent', budgeted: 5000, actual: 5000, isFixed: true },
          { id: 'exp-2', categoryId: 'cat-housing', name: isAr ? 'كهرباء وإنترنت ومياه' : 'Utilities & Internet', budgeted: 600, actual: 580, isFixed: false },
        ],
      },
      {
        id: 'cat-living',
        name: isAr ? 'المعيشة والطعام' : 'Food & Living',
        color: '#2563eb',
        iconName: 'ShoppingBag',
        items: [
          { id: 'exp-3', categoryId: 'cat-living', name: isAr ? 'تموين وسوبرماركت' : 'Groceries', budgeted: 2500, actual: 2100, isFixed: false },
          { id: 'exp-4', categoryId: 'cat-living', name: isAr ? 'مطاعم ومقاهي' : 'Restaurants & Cafes', budgeted: 1200, actual: 950, isFixed: false },
        ],
      },
      {
        id: 'cat-transport',
        name: isAr ? 'السيارة والمواصلات' : 'Transportation',
        color: '#0284c7',
        iconName: 'Car',
        items: [
          { id: 'exp-5', categoryId: 'cat-transport', name: isAr ? 'وقود ومواقف' : 'Fuel & Parking', budgeted: 800, actual: 720, isFixed: false },
        ],
      },
      {
        id: 'cat-savings',
        name: isAr ? 'الادخار والاستثمار' : 'Savings & Wealth',
        color: '#059669',
        iconName: 'PiggyBank',
        items: [
          { id: 'exp-6', categoryId: 'cat-savings', name: isAr ? 'ادخار شهري واستثمار أسهم' : 'Monthly Savings / Stocks', budgeted: 4000, actual: 4000, isFixed: true },
        ],
      },
    ];

    const cleanBS: BalanceSheetData = {
      asOfDate: today.toISOString().split('T')[0],
      assets: [
        { id: 'ast-1', name: isAr ? 'حساب جاري (راتب)' : 'Current Checking Account', category: 'current', value: 25000 },
        { id: 'ast-2', name: isAr ? 'محفظة الأسهم والصناديق' : 'Stock Portfolio', category: 'liquid_investments', value: 45000 },
      ],
      liabilities: [
        { id: 'liab-1', name: isAr ? 'مستحقات بطاقة الائتمان' : 'Credit Card Balance', category: 'current', value: 1200 },
      ],
    };

    onUpdateIncomeItems(cleanIncome);
    onUpdateCategories(cleanCategories);
    onUpdateBalanceSheet(cleanBS);
    onUpdatePeriod({ ...period, startingBankBalance: 25000 });
    onUpdateTransactions([]);
    setShowConfirmReset(null);
    showToast(isAr ? 'تم تطبيق نموذج الميزانية الشخصية بنجاح!' : 'Personal budget template loaded!');
  };

  // 4. Export JSON Backup
  const handleExportBackup = () => {
    const backupData = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      user: currentUser,
      currency: currentCurrency,
      language: currentLanguage,
      period,
      incomeItems,
      categories,
      transactions,
      balanceSheet,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `imoney_backup_${currentUser?.name?.replace(/\s+/g, '_') || 'account'}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(isAr ? 'تم تنزيل النسخة الاحتياطية بنجاح!' : 'Backup JSON downloaded successfully!');
  };

  // 5. Import JSON Backup
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        if (parsed.categories && parsed.incomeItems) {
          if (parsed.period) onUpdatePeriod(parsed.period);
          if (parsed.categories) onUpdateCategories(parsed.categories);
          if (parsed.incomeItems) onUpdateIncomeItems(parsed.incomeItems);
          if (parsed.transactions) onUpdateTransactions(parsed.transactions);
          if (parsed.balanceSheet) onUpdateBalanceSheet(parsed.balanceSheet);
          if (parsed.currency) onSelectCurrency(parsed.currency);

          showToast(isAr ? 'تم استيراد واسترجاع بيانات النسخة الاحتياطية بنجاح!' : 'Backup data restored successfully!');
        } else {
          showToast(isAr ? 'الملف غير صالح أو لا يحتوي على بنود الميزانية' : 'Invalid backup file format', 'error');
        }
      } catch (err) {
        showToast(isAr ? 'حدث خطأ أثناء قراءة ملف النسخة الاحتياطية' : 'Error reading JSON backup', 'error');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-sans" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Toast Notification */}
      {notification && (
        <div 
          className={`p-3 rounded-xl border flex items-center justify-between shadow-lg text-xs font-bold transition-all ${
            notification.type === 'success' 
              ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-200' 
              : 'bg-red-950/90 border-red-500/60 text-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
            <span>{notification.message}</span>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-white text-xs px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm text-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 border border-blue-200 rounded-xl text-blue-600">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900">
                {isAr ? 'مركز الإعدادات والتحكم بالبيانات' : 'System Settings & Data Control'}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {isAr 
                  ? 'إدارة الحساب، تصفير القيود، اختيار النماذج الجاهزة، والنسخ الاحتياطي' 
                  : 'Manage accounts, reset journal records, apply templates, and backup'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick User Status */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
          <div className="w-7 h-7 rounded-lg bg-blue-100 border border-blue-200 text-blue-700 font-bold flex items-center justify-center text-xs">
            {currentUser?.avatarInitials || 'G'}
          </div>
          <div>
            <span className="font-bold text-slate-900 block text-xs truncate max-w-[140px]">
              {currentUser ? currentUser.name : (isAr ? 'زائر (بدون تسجيل)' : 'Guest Session')}
            </span>
            <span className="text-[10px] text-slate-500 block font-mono truncate max-w-[140px]">
              {currentUser?.email || (isAr ? 'وضع عدم الاتصال' : 'Local Offline')}
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Card 1: Data Initialization & Reset */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm">
                  {isAr ? 'تصفير القيود والبدء من الصفر' : 'Clear Entries & Clean Slate'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {isAr ? 'إلغاء قيود المستخدم القديم ومسح جميع المعاملات' : 'Wipe previous transactions and journal entries'}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              {isAr 
                ? 'إذا كنت تريد تنقية سجلاتك وتصفير كل المصروفات الفعلية والمعاملات السابقة للبدء بصفحة بيضاء، يمكنك ذلك بضغطة زر دون فقدان هيكل الفئات.'
                : 'Clear all past realized transactions and journal entries to start fresh with pristine zero balances.'}
            </p>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100">
            {showConfirmReset === 'clear_tx' ? (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl space-y-2">
                <p className="text-xs font-bold text-rose-900">
                  {isAr ? 'هل أنت متأكد من تصفير جميع المعاملات والقيود؟' : 'Are you sure you want to clear all transactions?'}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClearTransactionsOnly}
                    className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold"
                  >
                    {isAr ? 'نعم، قم بالتصفير الآن' : 'Yes, Clear All'}
                  </button>
                  <button
                    onClick={() => setShowConfirmReset(null)}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold"
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmReset('clear_tx')}
                className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isAr ? 'تصفير جميع القيود والمعاملات السابقة (صفر)' : 'Clear All Journal Entries & Transactions'}</span>
              </button>
            )}

            {showConfirmReset === 'clean_slate' ? (
              <div className="p-3 bg-slate-900 text-white rounded-xl space-y-2">
                <p className="text-xs font-bold text-amber-300">
                  {isAr ? 'إعادة ضبط الميزانية كاملة إلى ميزانية صفرية نقية؟' : 'Reset full budget to 100% blank zero slate?'}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleApplyCleanSlate}
                    className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold"
                  >
                    {isAr ? 'تأكيد الميزانية الصفرية' : 'Confirm Blank Slate'}
                  </button>
                  <button
                    onClick={() => setShowConfirmReset(null)}
                    className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold"
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmReset('clean_slate')}
                className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                <span>{isAr ? 'بدء ميزانية صفرية بيضاء بالكامل (Blank Slate)' : 'Start 100% Zero-Based Blank Budget'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Card 2: One-Click Starter Templates */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-blue-50 border border-blue-200 text-blue-600 rounded-lg">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm">
                  {isAr ? 'نماذج ميزانية جاهزة للتشغيل' : 'One-Click Budget Templates'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {isAr ? 'اختر النموذج المناسب لطبيعة استخدامك المالي' : 'Load pre-structured budget frameworks'}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              {isAr 
                ? 'نماذج مصممة وفق أفضل الممارسات المحاسبية لبدء التخطيط المالي المنظم فوراً.'
                : 'Pre-configured accounting models tailored for individuals, households, or freelancers.'}
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <button
              onClick={handleApplyPersonalTemplate}
              className="w-full p-2.5 bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 rounded-xl text-left flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-blue-600/10 text-blue-600 rounded-lg">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-xs block group-hover:text-blue-700">
                    {isAr ? 'نموذج الميزانية الشخصية للأفراد' : 'Personal Budget Model'}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {isAr ? 'راتب، سكن، سوبرماركت، سيارة، وادخار شهري' : 'Salary, Rent, Groceries, Auto, Investments'}
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-blue-600 flex items-center gap-1">
                {isAr ? 'تطبيق' : 'Apply'}
                <ArrowRight className={`w-3 h-3 ${isAr ? 'rotate-180' : ''}`} />
              </span>
            </button>

            <button
              onClick={handleApplyCleanSlate}
              className="w-full p-2.5 bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 rounded-xl text-left flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-emerald-600/10 text-emerald-600 rounded-lg">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-xs block group-hover:text-emerald-700">
                    {isAr ? 'نموذج الميزانية الصفرية الحرة' : 'Zero-Based Clean Template'}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {isAr ? 'فئات مهيأة بأرصدة 0 لإدخال أرقامك الحقيقية' : 'Zero balances ready for your custom entries'}
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                {isAr ? 'تطبيق' : 'Apply'}
                <ArrowRight className={`w-3 h-3 ${isAr ? 'rotate-180' : ''}`} />
              </span>
            </button>
          </div>
        </div>

        {/* Card 3: Currency & Number Formatting */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-amber-50 border border-amber-200 text-amber-600 rounded-lg">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm">
                {isAr ? 'العملة وتنسيق الأرقام' : 'Currency & Precision'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {isAr ? 'تحديد العملة الأساسية وإلغاء الكسور العشرية' : 'Base currency & integer rounding configuration'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isAr ? 'العملة المعتمدة للنظام' : 'Active Base Currency'}
              </label>
              <select
                value={currentCurrency.code}
                onChange={(e) => {
                  const matched = SUPPORTED_CURRENCIES.find((c) => c.code === e.target.value);
                  if (matched) onSelectCurrency(matched);
                }}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} — {c.name} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {isAr 
                  ? 'تم تفعيل التقريب التلقائي للأرقام الصحيحة وإلغاء الكسور العشرية عبر كافة الشاشات.' 
                  : 'Zero-decimal rounding is permanently active across all financial modules.'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Backup & Restore */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-lg">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm">
                {isAr ? 'النسخ الاحتياطي والاستعادة' : 'Data Backup & Restore'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {isAr ? 'حفظ نسخة أمان لبياناتك ونقلها بين الأجهزة' : 'Export or import your full financial database'}
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={handleExportBackup}
              className="w-full py-2.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isAr ? 'تصدير نسخة احتياطية كاملة (JSON)' : 'Export Backup (JSON File)'}</span>
            </button>

            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
                id="settings-import-backup"
              />
              <label
                htmlFor="settings-import-backup"
                className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>{isAr ? 'استيراد واسترجاع نسخة سابقة' : 'Import & Restore Backup'}</span>
              </label>
            </div>
          </div>
        </div>

        {/* Card 5: Supabase & GitHub Cloud Integration (Admin Only) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-lg">
                <Database className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-slate-900 text-sm">
                    {isAr ? 'ضبط إعدادات Supabase السحابية' : 'Supabase Cloud Settings'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    {isAr ? 'خاص بالمدير 🛡️' : 'Admin Only 🛡️'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono">
                  {isAr ? 'مشروع: yvybginudnkrgeqixixs' : 'Project: yvybginudnkrgeqixixs'}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              {isAr 
                ? 'إعدادات خاصة بمدير الموقع فقط: ضبط وتحديث المفتاح العام (Anon Key) وتأكيد الاتصال مع مشروع Supabase السحابي وتوثيق GitHub.'
                : 'Exclusive for site admin: configure Anon Key and verify Supabase & GitHub connection without exposing settings to regular users.'}
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <button
              onClick={onOpenSupabaseConfig}
              className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>{isAr ? '🛡️ فتح ضبط إعدادات Supabase (خاص بالمدير)' : '🛡️ Open Supabase Settings (Admin)'}</span>
            </button>

            <a
              href="https://supabase.com/dashboard/project/yvybginudnkrgeqixixs/settings/api"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
            >
              <span>{isAr ? 'لوحة تحكم مشروعك في Supabase' : 'Open Supabase Project Dashboard'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

      </div>

      {/* Card 5: Interactive Custom Category & Line Item Studio */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-50 border border-blue-200 text-blue-600 rounded-lg">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm">
                {isAr ? 'استوديو تخصيص فئات وبنود الميزانية' : 'Custom Categories & Budget Line Items Studio'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {isAr 
                  ? 'بنود وفئات الميزانية ديناميكية بالكامل — يمكنك إضافة فئات، تعديل مسمياتها، وحذفها بكل حرية' 
                  : 'Budget categories and items are 100% dynamic, editable, and user-customizable'}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold self-start sm:self-auto">
            {categories.length} {isAr ? 'فئات مفعّلة' : 'Active Categories'}
          </span>
        </div>

        {/* Categories List with Item Counts & Color Badges */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="p-3.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl flex items-center justify-between gap-2 transition-all"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: cat.color }}
                />
                <div className="min-w-0">
                  <span className="font-bold text-slate-900 text-xs block truncate">
                    {cat.name}
                  </span>
                  <span className="text-[10px] text-slate-500 block font-mono">
                    {cat.items.length} {isAr ? 'بنود مصروف' : 'items'} •{' '}
                    {cat.items.reduce((s, i) => s + i.budgeted, 0).toLocaleString()}{' '}
                    {currentCurrency.symbol}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    const newName = prompt(
                      isAr ? 'أدخل الاسم الجديد للفئة:' : 'Enter new category name:',
                      cat.name
                    );
                    if (newName && newName.trim()) {
                      onUpdateCategories(
                        categories.map((c) =>
                          c.id === cat.id ? { ...c, name: newName.trim() } : c
                        )
                      );
                      showToast(isAr ? 'تم تحديث اسم الفئة بنجاح' : 'Category renamed successfully');
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title={isAr ? 'تعديل اسم الفئة' : 'Rename category'}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                {categories.length > 1 && (
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          isAr
                            ? `هل أنت متأكد من حذف فئة "${cat.name}" وجميع بنودها؟`
                            : `Delete category "${cat.name}" and all its items?`
                        )
                      ) {
                        onUpdateCategories(categories.filter((c) => c.id !== cat.id));
                        showToast(isAr ? 'تم حذف الفئة بنجاح' : 'Category deleted');
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title={isAr ? 'حذف الفئة' : 'Delete category'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Add Category Button inside Settings */}
        <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
          <p className="text-[11px] text-slate-500">
            {isAr
              ? '💡 يمكنك أيضاً تعديل البنود والمبالغ المقدّرة مباشرة من جدول "تفصيل المصروفات" بالنقر المباشر على الخلايا.'
              : '💡 You can also edit line items and amounts directly from the Expense Breakdown grid.'}
          </p>
          <button
            onClick={() => {
              const name = prompt(
                isAr
                  ? 'أدخل اسم فئة الميزانية الجديدة (مثال: مصاريف الأبناء، التزامات وتمويل، سياحة):'
                  : 'Enter new category name:'
              );
              if (name && name.trim()) {
                const newCat: ExpenseCategory = {
                  id: `cat-${Date.now()}`,
                  name: name.trim(),
                  color: '#2563eb',
                  iconName: 'Tag',
                  items: [],
                };
                onUpdateCategories([...categories, newCat]);
                showToast(isAr ? 'تمت إضافة الفئة الجديدة بنجاح' : 'Category added successfully');
              }
            }}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? 'إضافة فئة جديدة الآن' : 'Add New Category'}</span>
          </button>
        </div>
      </div>

      {/* Account & Profile Control Bar */}
      <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 text-blue-300 font-mono font-black flex items-center justify-center text-sm">
            {currentUser?.avatarInitials || 'VIP'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-white">
                {currentUser ? currentUser.name : (isAr ? 'مستخدم زائر' : 'Guest Account')}
              </span>
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-md text-[10px] font-bold">
                {currentUser?.role === 'admin' ? 'Admin' : 'VIP Executive'}
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono block mt-0.5">
              {currentUser?.email || (isAr ? 'غير مسجل' : 'Not signed in')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => onOpenAuthModal(currentUser ? 'register' : 'login')}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{currentUser ? (isAr ? 'تبديل الحساب (Supabase)' : 'Switch Account') : (isAr ? 'تسجيل الدخول (Supabase)' : 'Sign In with Supabase')}</span>
          </button>

          {currentUser && (
            <button
              onClick={onLogout}
              className="px-3.5 py-2 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isAr ? 'تسجيل الخروج' : 'Sign Out'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
