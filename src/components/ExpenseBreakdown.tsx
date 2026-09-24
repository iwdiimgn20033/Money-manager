import React, { useState } from 'react';
import { BudgetPeriod, ExpenseCategory, ExpenseItem } from '../types';
import { formatCurrency } from '../utils/calculations';
import { translateItemName } from '../utils/localization';
import { handleGridKeyDown } from '../utils/keyboardGridNav';
import { LanguageCode, TRANSLATIONS } from '../i18n/translations';
import {
  Calendar,
  ChevronDown,
  Filter,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Search,
  CalendarRange,
  ArrowUpDown,
  Layers,
  Sparkles,
  RotateCcw,
  Clock,
  Lock,
  FolderPlus,
  Edit3,
  Check,
  X,
  Tag,
  Home,
  ShoppingBag,
  Car,
  Tv,
  HeartPulse,
  PiggyBank,
  GraduationCap,
  Briefcase,
  Utensils,
  Plane,
  Shield,
  Zap
} from 'lucide-react';

interface ExpenseBreakdownProps {
  categories: ExpenseCategory[];
  period: BudgetPeriod;
  currentLanguage?: LanguageCode;
  onUpdateCategoryItem: (categoryId: string, item: ExpenseItem) => void;
  onDeleteItem: (categoryId: string, itemId: string) => void;
  onAddItem: (categoryId: string) => void;
  onAddExpenseItemWithDetails?: (categoryId: string, item: Omit<ExpenseItem, 'id'>) => void;
  onAddCategory?: (category: {
    name: string;
    color?: string;
    iconName?: string;
    initialItemName?: string;
    initialBudget?: number;
  }) => void;
  onUpdateCategory?: (categoryId: string, updates: Partial<ExpenseCategory>) => void;
  onDeleteCategory?: (categoryId: string) => void;
  onUpdatePeriodDateRange?: (startDate: string, endDate: string, label?: string) => void;
  onOpenPeriodModal?: () => void;
}

const CATEGORY_ICONS_LIST = [
  { name: 'ShoppingBag', label: 'تسوق وبقالة', icon: ShoppingBag },
  { name: 'Home', label: 'سكن ومرافق', icon: Home },
  { name: 'Car', label: 'سيارات ونقل', icon: Car },
  { name: 'HeartPulse', label: 'صحة وعلاج', icon: HeartPulse },
  { name: 'GraduationCap', label: 'تعليم وأبناء', icon: GraduationCap },
  { name: 'PiggyBank', label: 'ادخار واستثمار', icon: PiggyBank },
  { name: 'Briefcase', label: 'أعمال ومشاريع', icon: Briefcase },
  { name: 'Utensils', label: 'مطاعم ومأكولات', icon: Utensils },
  { name: 'Plane', label: 'سياحة وسفر', icon: Plane },
  { name: 'Tv', label: 'ترفيه واشتراكات', icon: Tv },
  { name: 'Shield', label: 'تأمين والتزامات', icon: Shield },
  { name: 'Zap', label: 'فواتير وخدمات', icon: Zap },
  { name: 'Tag', label: 'أخرى عامة', icon: Tag },
];

const CATEGORY_COLORS_LIST = [
  { hex: '#0f172a', label: 'كحلي داكن' },
  { hex: '#2563eb', label: 'أزرق ملكي' },
  { hex: '#0284c7', label: 'أزرق سماوي' },
  { hex: '#059669', label: 'أخضر زمردي' },
  { hex: '#7c3aed', label: 'بنفسجي' },
  { hex: '#db2777', label: 'وردي' },
  { hex: '#d97706', label: 'برتقالي كهرماني' },
  { hex: '#475569', label: 'رمادي حجري' },
];

export const ExpenseBreakdown: React.FC<ExpenseBreakdownProps> = ({
  categories,
  period,
  currentLanguage = 'en',
  onUpdateCategoryItem,
  onDeleteItem,
  onAddItem,
  onAddExpenseItemWithDetails,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onUpdatePeriodDateRange,
  onOpenPeriodModal,
}) => {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [filterType, setFilterType] = useState<'all' | 'fixed' | 'variable' | 'overbudget'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'name' | 'budgeted' | 'actual' | 'variance'>('variance');
  const [sortAsc, setSortAsc] = useState(false);

  // New Expense Item Inline Form State
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [newCatId, setNewCatId] = useState(categories[0]?.id || 'cat-housing');
  const [newItemName, setNewItemName] = useState('');
  const [newBudgeted, setNewBudgeted] = useState('');
  const [newIsFixed, setNewIsFixed] = useState(false);

  // New Category Modal / Inline State
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#2563eb');
  const [newCategoryIcon, setNewCategoryIcon] = useState('ShoppingBag');
  const [newCategoryItemName, setNewCategoryItemName] = useState('');
  const [newCategoryBudget, setNewCategoryBudget] = useState('');

  // Edit Category Name state
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [confirmDeleteCatId, setConfirmDeleteCatId] = useState<string | null>(null);

  // Calendar popover state
  const [showCalendarPopover, setShowCalendarPopover] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(
    period.startDate || `${period.year}-${String(period.month).padStart(2, '0')}-01`
  );
  const [tempEndDate, setTempEndDate] = useState(
    period.endDate || `${period.year}-${String(period.month).padStart(2, '0')}-${String(period.totalDays).padStart(2, '0')}`
  );

  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
  const isAr = currentLanguage === 'ar';

  const handleSaveNewCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    if (onAddCategory) {
      onAddCategory({
        name: newCategoryName.trim(),
        color: newCategoryColor,
        iconName: newCategoryIcon,
        initialItemName: newCategoryItemName.trim() || undefined,
        initialBudget: parseFloat(newCategoryBudget) || 0,
      });
    }

    setNewCategoryName('');
    setNewCategoryItemName('');
    setNewCategoryBudget('');
    setIsAddingCategory(false);
  };

  const handleSaveEditCategory = (catId: string) => {
    if (!editingCategoryName.trim()) {
      setEditingCategoryId(null);
      return;
    }
    if (onUpdateCategory) {
      onUpdateCategory(catId, { name: editingCategoryName.trim() });
    }
    setEditingCategoryId(null);
  };

  const handleDeleteSelectedCategory = (catId: string) => {
    if (onDeleteCategory) {
      onDeleteCategory(catId);
      if (selectedCategoryFilter === catId) {
        setSelectedCategoryFilter('all');
      }
    }
    setConfirmDeleteCatId(null);
  };

  // Quick Set to Today Function
  const handleSetDateToToday = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const lastDay = new Date(year, month, 0).getDate();
    const startStr = `${year}-${String(month).padStart(2, '0')}-01`;
    const endStr = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    const monthName = now.toLocaleString(isAr ? 'ar-SA' : 'en-US', { month: 'long' });
    const label = `${monthName} ${year}`;

    setTempStartDate(startStr);
    setTempEndDate(endStr);
    if (onUpdatePeriodDateRange) {
      onUpdatePeriodDateRange(startStr, endStr, label);
    }
    setShowCalendarPopover(false);
  };

  const handleApplyCalendarDates = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdatePeriodDateRange) {
      const start = new Date(tempStartDate);
      const end = new Date(tempEndDate);
      const monthName = start.toLocaleString(isAr ? 'ar-SA' : 'en-US', { month: 'short' });
      const customLabel = `${monthName} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
      onUpdatePeriodDateRange(tempStartDate, tempEndDate, customLabel);
    }
    setShowCalendarPopover(false);
  };

  const handleSaveNewExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const bVal = Math.round(parseFloat(newBudgeted) || 0);
    const aVal = 0; // Actual spent starts at 0 and is managed exclusively via the Transaction Ledger
    const targetCat = newCatId || categories[0]?.id || 'cat-housing';

    if (onAddExpenseItemWithDetails) {
      onAddExpenseItemWithDetails(targetCat, {
        name: newItemName.trim(),
        budgeted: bVal,
        actual: aVal,
        isFixed: newIsFixed,
        categoryId: targetCat,
      });
    } else {
      // Fallback: create item directly via onUpdateCategoryItem
      const dummyItem: ExpenseItem = {
        id: `exp-${Date.now()}`,
        categoryId: targetCat,
        name: newItemName.trim(),
        budgeted: bVal,
        actual: aVal,
        isFixed: newIsFixed,
      };
      onUpdateCategoryItem(targetCat, dummyItem);
    }

    setNewItemName('');
    setNewBudgeted('');
    setIsAddingExpense(false);
  };

  // Flatten items for Excel table with category info
  const allItems = categories.flatMap((cat) =>
    cat.items.map((item) => ({
      ...item,
      categoryId: cat.id,
      categoryName: cat.name,
      categoryColor: cat.color,
    }))
  );

  // Filter items
  const filteredItems = allItems.filter((item) => {
    // 1. Category Filter Dropdown
    if (selectedCategoryFilter !== 'all' && item.categoryId !== selectedCategoryFilter) {
      return false;
    }

    // 2. Type Filter
    if (filterType === 'fixed' && !item.isFixed) return false;
    if (filterType === 'variable' && item.isFixed) return false;
    if (filterType === 'overbudget' && item.actual <= item.budgeted) return false;

    // 3. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const localizedName = translateItemName(item.name, currentLanguage).toLowerCase();
      const localizedCat = translateItemName(item.categoryName, currentLanguage).toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        localizedName.includes(q) ||
        item.categoryName.toLowerCase().includes(q) ||
        localizedCat.includes(q)
      );
    }

    return true;
  });

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    let valA: any = a[sortField];
    let valB: any = b[sortField];

    if (sortField === 'variance') {
      valA = a.budgeted - a.actual;
      valB = b.budgeted - b.actual;
    }

    if (typeof valA === 'string') {
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortAsc ? valA - valB : valB - valA;
  });

  const totalBudgeted = filteredItems.reduce((acc, it) => acc + it.budgeted, 0);
  const totalActual = filteredItems.reduce((acc, it) => acc + it.actual, 0);
  const netVariance = totalBudgeted - totalActual;
  const overallUtilization = totalBudgeted > 0 ? (totalActual / totalBudgeted) * 100 : 0;

  // Over-budget detection and metrics
  const allOverBudgetItems = allItems.filter((item) => item.actual > item.budgeted);
  const totalOverBudgetExcess = allOverBudgetItems.reduce(
    (sum, item) => sum + (item.actual - item.budgeted),
    0
  );

  // Handler for Excel-style instant cell update onBlur
  const handleCellBlur = (
    categoryId: string,
    item: ExpenseItem,
    field: 'name' | 'budgeted' | 'actual' | 'isFixed',
    value: any
  ) => {
    const updatedItem = { ...item };
    if (field === 'budgeted' || field === 'actual') {
      const num = Math.round(parseFloat(value));
      updatedItem[field] = isNaN(num) ? 0 : num;
    } else if (field === 'name') {
      updatedItem.name = value || item.name;
    } else if (field === 'isFixed') {
      updatedItem.isFixed = value;
    }

    onUpdateCategoryItem(categoryId, updatedItem);
  };

  return (
    <div className="bg-white/85 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg shadow-indigo-950/5 space-y-3 overflow-hidden">
      {/* 1. Header Toolbar with Add Button, Period & Today Trigger - Compact & Sleek */}
      <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 bg-slate-50/90 border-b border-slate-200/80 text-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
              <Layers className="w-3.5 h-3.5" strokeWidth={2} />
            </div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 font-arabic tracking-tight">
              {isAr ? 'جدول الموازنة والمصروفات الفعلية (تحرير فوري وتخزين دائم)' : 'Expense Budget vs Actual (Live Grid)'}
            </h2>
            <span className="px-2 py-0.5 text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-arabic">
              {filteredItems.length} {isAr ? 'بنود' : 'Items'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-arabic mt-0.5">
            {isAr
              ? 'القيم تُحفظ تلقائياً عند مغادرة الخلية، مع فلاتر كاملة وزر إضافة مباشر'
              : 'All cells save automatically on blur with filters and direct expense insertion'}
          </p>
        </div>

        {/* Action Controls: Add Category, Add Expense Button + Date / Today Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Add Category Button */}
          <button
            onClick={() => {
              setIsAddingCategory(!isAddingCategory);
              setIsAddingExpense(false);
            }}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-xs hover:shadow-sm font-arabic active:scale-95 border border-emerald-500/40"
          >
            <FolderPlus className="w-3 h-3" />
            <span>{isAr ? 'إضافة فئة جديدة' : 'Add Category'}</span>
          </button>

          {/* Quick Add Expense Item Button */}
          <button
            onClick={() => {
              if (selectedCategoryFilter !== 'all') {
                setNewCatId(selectedCategoryFilter);
              }
              setIsAddingExpense(!isAddingExpense);
              setIsAddingCategory(false);
            }}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-xs hover:shadow-sm font-arabic active:scale-95 border border-blue-500/40"
          >
            <Plus className="w-3 h-3" strokeWidth={2} />
            <span>{isAr ? 'إضافة بند مصروف' : 'Add Expense'}</span>
          </button>

          {/* Quick Set to Today Button */}
          <button
            onClick={handleSetDateToToday}
            className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-emerald-700 rounded-lg flex items-center gap-1 transition-all shadow-2xs font-arabic"
            title={isAr ? 'تعديل وتثبيت التاريخ إلى اليوم' : 'Set date to today'}
          >
            <Clock className="w-3 h-3 text-emerald-600" />
            <span>{isAr ? 'اليوم' : 'Today'}</span>
          </button>

          {/* Date Filter & Preset Popover */}
          <div className="relative">
            <button
              onClick={() => setShowCalendarPopover(!showCalendarPopover)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-700 rounded-lg transition-all shadow-2xs"
            >
              <CalendarRange className="w-3 h-3 text-blue-600" />
              <span>{period.label}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showCalendarPopover && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50 text-slate-800">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-arabic">
                    {isAr ? 'تحديد فترة الميزانية' : 'Custom Period Dates'}
                  </span>
                  <button
                    onClick={() => setShowCalendarPopover(false)}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleApplyCalendarDates} className="mt-3 space-y-3 font-arabic">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">
                      {isAr ? 'تاريخ البدء' : 'Start Date'}
                    </label>
                    <input
                      type="date"
                      value={tempStartDate}
                      onChange={(e) => setTempStartDate(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">
                      {isAr ? 'تاريخ الانتهاء' : 'End Date'}
                    </label>
                    <input
                      type="date"
                      value={tempEndDate}
                      onChange={(e) => setTempEndDate(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={handleSetDateToToday}
                      className="text-[11px] text-emerald-600 hover:underline font-bold"
                    >
                      {isAr ? 'تثبيت إلى اليوم' : 'Set to Today'}
                    </button>

                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-xs font-bold rounded-xl text-white transition-all shadow-xs"
                    >
                      {isAr ? 'تطبيق' : 'Apply'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2A. INLINE FORM: ADD NEW BUDGET CATEGORY */}
      {isAddingCategory && (
        <form
          onSubmit={handleSaveNewCategory}
          className="mx-4 my-2 bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-4 space-y-3 font-arabic shadow-xs"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs font-bold text-emerald-900">
                {isAr ? 'إنشاء فئة ميزانية جديدة مخصصة' : 'Create New Custom Expense Category'}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setIsAddingCategory(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1 rounded-lg"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* Category Name */}
            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-1">
                {isAr ? 'اسم الفئة' : 'Category Name'}
              </label>
              <input
                type="text"
                required
                placeholder={isAr ? 'مثال: مصاريف الأولاد / أقساط وتمويل' : 'e.g. Kids & Education'}
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Initial Item Name (Optional) */}
            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-1">
                {isAr ? 'بند المصروف الأولي (اختياري)' : 'Initial Item Name'}
              </label>
              <input
                type="text"
                placeholder={isAr ? 'مثال: رسوم مدرسية' : 'e.g. Tuition Fees'}
                value={newCategoryItemName}
                onChange={(e) => setNewCategoryItemName(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Initial Budget Amount */}
            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-1">
                {isAr ? 'الميزانية المقدّرة' : 'Budget Target'}
              </label>
              <input
                type="number"
                step="1"
                placeholder="0"
                value={newCategoryBudget}
                onChange={(e) => setNewCategoryBudget(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-500 text-right"
              />
            </div>

            {/* Color & Icon Picker */}
            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-1">
                {isAr ? 'اللون والرمز' : 'Color & Icon'}
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={newCategoryIcon}
                  onChange={(e) => setNewCategoryIcon(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold focus:outline-none"
                >
                  {CATEGORY_ICONS_LIST.map((ic) => (
                    <option key={ic.name} value={ic.name}>
                      {isAr ? ic.label : ic.name}
                    </option>
                  ))}
                </select>
                <input
                  type="color"
                  value={newCategoryColor}
                  onChange={(e) => setNewCategoryColor(e.target.value)}
                  className="w-9 h-9 p-0.5 border border-slate-300 cursor-pointer rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddingCategory(false)}
              className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isAr ? 'إنشاء وحفظ الفئة' : 'Save Category'}</span>
            </button>
          </div>
        </form>
      )}

      {/* 2B. INLINE FORM: ADD NEW EXPENSE ITEM */}
      {isAddingExpense && (
        <form
          onSubmit={handleSaveNewExpense}
          className="mx-4 my-2 bg-blue-50/80 border border-blue-200/90 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-5 gap-3 items-end font-arabic shadow-xs"
        >
          <div>
            <label className="block text-[10px] font-bold text-slate-700 mb-1">
              {isAr ? 'الفئة التابع لها' : 'Target Category'}
            </label>
            <select
              value={newCatId}
              onChange={(e) => setNewCatId(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {translateItemName(cat.name, currentLanguage)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-700 mb-1">
              {isAr ? 'اسم بند المصروف' : 'Expense Item Name'}
            </label>
            <input
              type="text"
              required
              placeholder={isAr ? 'مثال: صيانة سيارة / فاتورة مياه' : 'e.g. Car Maintenance'}
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-700 mb-1">
              {isAr ? 'المبلغ المقدّر (الميزانية)' : 'Budgeted Amount'}
            </label>
            <input
              type="number"
              step="1"
              required
              placeholder="0"
              value={newBudgeted}
              onChange={(e) => setNewBudgeted(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-blue-500 text-right"
            />
          </div>

          <div className="flex items-center gap-2 sm:col-span-2">
            <button
              type="submit"
              className="flex-1 py-1.5 px-3.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              {isAr ? 'حفظ المصروف' : 'Save Expense'}
            </button>
            <button
              type="button"
              onClick={() => setIsAddingExpense(false)}
              className="py-1.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl"
            >
              ✕
            </button>
          </div>
        </form>
      )}

      {/* 3. FILTERS TOOLBAR FOR EXPENSES (Category Dropdown, Search, Type Chips, Sort) - Compact */}
      <div className="px-3.5 py-2 bg-slate-50/70 border-y border-slate-200/70 flex flex-col md:flex-row md:items-center justify-between gap-2.5 font-arabic">
        <div className="flex items-center gap-2.5 flex-wrap flex-1">
          {/* CATEGORY SELECTOR DROPDOWN */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
              <Layers className="w-3 h-3 text-blue-600" />
              <span>{isAr ? 'الفئة:' : 'Category:'}</span>
            </span>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 shadow-xs cursor-pointer"
            >
              <option value="all">{isAr ? 'جميع الفئات (All Categories)' : 'All Categories'}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {translateItemName(cat.name, currentLanguage)} ({cat.items.length})
                </option>
              ))}
            </select>
          </div>

          {/* SEARCH INPUT */}
          <div className="relative flex-1 min-w-[170px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder={isAr ? 'بحث في المصروفات...' : 'Search expenses...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500 shadow-xs"
            />
          </div>
        </div>

        {/* STATUS / TYPE CHIP FILTERS */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[10px] font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-400" />
            <span>{isAr ? 'التصفية:' : 'Filter:'}</span>
          </span>
          {[
            { id: 'all', label: isAr ? 'الكل' : 'All' },
            { id: 'fixed', label: isAr ? 'ثابت' : 'Fixed' },
            { id: 'variable', label: isAr ? 'متغير' : 'Variable' },
            { id: 'overbudget', label: isAr ? 'تجاوز الميزانية' : 'Over Budget' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id as any)}
              className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full transition-all cursor-pointer ${
                filterType === f.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200/90 text-slate-600 hover:bg-slate-100/80'
              }`}
            >
              {f.label}
              {f.id === 'overbudget' && allOverBudgetItems.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-red-600 text-white text-[8.5px] font-bold rounded-full">
                  {allOverBudgetItems.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* SELECTED CATEGORY MANAGEMENT BAR (Allows renaming or deleting the selected category) */}
      {selectedCategoryFilter !== 'all' && (() => {
        const activeCategory = categories.find((c) => c.id === selectedCategoryFilter);
        if (!activeCategory) return null;

        return (
          <div className="mx-3.5 my-1 px-3 py-1.5 bg-blue-50/80 border border-blue-200/80 rounded-xl flex items-center justify-between gap-2.5 text-xs flex-wrap font-arabic shadow-xs">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                style={{ backgroundColor: activeCategory.color }}
              />
              {editingCategoryId === activeCategory.id ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={editingCategoryName}
                    onChange={(e) => setEditingCategoryName(e.target.value)}
                    className="px-2.5 py-0.5 bg-white border border-blue-500 rounded-lg text-xs font-bold text-slate-900 focus:outline-none"
                    autoFocus
                    placeholder={activeCategory.name}
                  />
                  <button
                    onClick={() => handleSaveEditCategory(activeCategory.id)}
                    className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg"
                    title={isAr ? 'حفظ التعديل' : 'Save'}
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setEditingCategoryId(null)}
                    className="p-1 bg-slate-300 hover:bg-slate-400 text-slate-700 rounded-lg"
                    title={isAr ? 'إلغاء' : 'Cancel'}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 text-xs">
                    {translateItemName(activeCategory.name, currentLanguage)}
                  </span>
                  <button
                    onClick={() => {
                      setEditingCategoryId(activeCategory.id);
                      setEditingCategoryName(activeCategory.name);
                    }}
                    className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-100/70 rounded-md transition-colors"
                    title={isAr ? 'تعديل اسم الفئة' : 'Rename Category'}
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </div>
              )}
              <span className="text-[10px] text-slate-500">
                ({activeCategory.items.length} {isAr ? 'بنود' : 'items'})
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setNewCatId(activeCategory.id);
                  setIsAddingExpense(true);
                }}
                className="px-2.5 py-0.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3 h-3" />
                <span>{isAr ? 'إضافة بند لهذه الفئة' : 'Add Item'}</span>
              </button>

              {confirmDeleteCatId === activeCategory.id ? (
                <div className="flex items-center gap-1 bg-red-100 border border-red-300 px-2 py-0.5 rounded-lg">
                  <span className="text-[9.5px] font-bold text-red-900">
                    {isAr ? 'تأكيد الحذف؟' : 'Confirm?'}
                  </span>
                  <button
                    onClick={() => handleDeleteSelectedCategory(activeCategory.id)}
                    className="px-2 py-0.2 bg-red-600 hover:bg-red-500 text-white text-[9.5px] font-bold rounded-md"
                  >
                    {isAr ? 'نعم' : 'Yes'}
                  </button>
                  <button
                    onClick={() => setConfirmDeleteCatId(null)}
                    className="px-1.5 py-0.2 bg-slate-200 text-slate-700 text-[9.5px] font-bold rounded-md"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDeleteCatId(activeCategory.id)}
                  className="px-2.5 py-0.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors"
                  title={isAr ? 'حذف هذه الفئة مع جميع بنودها' : 'Delete category and items'}
                >
                  <Trash2 className="w-3 h-3" />
                  <span>{isAr ? 'حذف الفئة' : 'Delete'}</span>
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {/* OVER-BUDGET ALERT BANNER - Compact */}
      {allOverBudgetItems.length > 0 && (
        <div className="mx-3.5 p-2.5 bg-rose-50 border border-rose-200/90 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs shadow-xs font-arabic">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-bold text-rose-950 text-xs">
                {isAr
                  ? `⚠️ تنبيه تجاوز الميزانية: يوجد ${allOverBudgetItems.length} بنود تجاوزت السقف المالي المحدد!`
                  : `⚠️ Over-Budget Alert: ${allOverBudgetItems.length} line items have exceeded their budgeted limits!`}
              </p>
              <p className="text-rose-700 text-[10.5px] font-medium mt-0.2">
                {isAr
                  ? `إجمالي مبلغ التجاوز الزائد: ${formatCurrency(totalOverBudgetExcess)} عن الخطة المعتمدة.`
                  : `Total excess outflow: ${formatCurrency(totalOverBudgetExcess)} over planned budget.`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setFilterType('overbudget')}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg transition-all shadow-xs whitespace-nowrap self-start sm:self-auto"
          >
            {isAr ? 'عرض البنود المتجاوزة فقط' : 'View Over-Budget Items'}
          </button>
        </div>
      )}

      {/* 4. EXCEL-STYLE SPREADSHEET TABLE WITH INSTANT AUTO-SAVE ON BLUR - Compact */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse font-sans">
          <thead>
            <tr className="bg-slate-100/90 text-slate-700 text-[9.5px] font-bold uppercase tracking-wider border-b border-slate-200 font-arabic">
              <th className="py-2.5 px-3 w-40">{isAr ? 'الفئة' : 'Category'}</th>
              <th className="py-2.5 px-3">{isAr ? 'بند المصروف' : 'Expense Item'}</th>
              <th className="py-2.5 px-2.5 text-center w-20">{isAr ? 'النوع' : 'Type'}</th>
              <th className="py-2.5 px-2.5 text-right w-24">{isAr ? 'المقدّر' : 'Budgeted'}</th>
              <th className="py-2.5 px-2.5 text-right w-32">
                <div className="flex items-center justify-end gap-1 text-amber-700">
                  <Lock className="w-2.5 h-2.5 text-amber-600" />
                  <span>{isAr ? 'المنفق فعلي (السجل)' : 'Actual Spent'}</span>
                </div>
              </th>
              <th className="py-2.5 px-2.5 text-right w-24">{isAr ? 'الفارق' : 'Variance'}</th>
              <th className="py-2.5 px-3 w-32">{isAr ? 'نسبة الاستخدام' : 'Utilization'}</th>
              <th className="py-2.5 px-2 text-center w-20">{isAr ? 'الحالة' : 'Status'}</th>
              <th className="py-2.5 px-2 text-center w-12">{isAr ? 'حذف' : 'Action'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedItems.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400 font-bold text-xs font-arabic">
                  {isAr ? 'لا توجد بنود مصروفات تطابق معايير البحث.' : 'No expense items found matching criteria.'}
                </td>
              </tr>
            ) : (
              sortedItems.map((item, rowIndex) => {
                const variance = item.budgeted - item.actual;
                const percent = item.budgeted > 0 ? (item.actual / item.budgeted) * 100 : 0;
                const isOver = item.actual > item.budgeted;

                return (
                  <tr
                    key={item.id}
                    className={`transition-colors group ${
                      isOver
                        ? 'bg-rose-50/40 hover:bg-rose-50/80'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* 1. Category Column */}
                    <td className="py-1 px-3 font-bold text-slate-700">
                      <span className="inline-block px-2 py-0.5 text-[9.5px] font-bold rounded-md bg-slate-100/90 text-slate-700 border border-slate-200/70 font-arabic backdrop-blur-xs">
                        {translateItemName(item.categoryName, currentLanguage)}
                      </span>
                    </td>

                    {/* 2. Expense Item Name (Live Excel Editable Input) */}
                    <td className="py-1 px-3">
                      <input
                        key={`${item.id}-name-${item.name}`}
                        type="text"
                        defaultValue={translateItemName(item.name, currentLanguage)}
                        data-grid="expense-grid"
                        data-row={rowIndex}
                        data-col="name"
                        onBlur={(e) =>
                          handleCellBlur(item.categoryId, item, 'name', e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Enter') {
                            handleCellBlur(item.categoryId, item, 'name', (e.target as HTMLInputElement).value);
                          }
                          handleGridKeyDown(e, 'expense-grid', rowIndex, 'name', {
                            enableHorizontal: true,
                            colOrder: ['name', 'budgeted'],
                          });
                        }}
                        className="w-full px-2 py-0.5 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-500 rounded-md text-xs font-bold text-slate-800 focus:outline-none transition-all"
                        title={isAr ? 'انقر لتعديل الاسم (التنقل بالأسهم ↑ ↓ للأسفل وللأعلى، و Enter)' : 'Click to edit item name (navigate with ↑ ↓ arrows & Enter)'}
                      />
                    </td>

                    {/* 3. Type Switcher (Fixed / Variable) */}
                    <td className="py-1 px-2.5 text-center">
                      <button
                        onClick={() =>
                          handleCellBlur(item.categoryId, item, 'isFixed', !item.isFixed)
                        }
                        className={`px-2 py-0.2 text-[9.5px] font-bold rounded-full transition-all ${
                          item.isFixed
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        }`}
                        title={isAr ? 'انقر للتبديل بين ثابت / متغير' : 'Click to toggle Fixed/Variable'}
                      >
                        {item.isFixed ? (isAr ? 'ثابت' : 'FIXED') : (isAr ? 'متغير' : 'VARIABLE')}
                      </button>
                    </td>

                    {/* 4. Budgeted Amount (Compact input without spinner arrows) */}
                    <td className="py-1 px-2.5 text-right">
                      <div className="flex items-center justify-end">
                        <input
                          key={`${item.id}-budgeted-${item.budgeted}`}
                          type="number"
                          step="1"
                          defaultValue={Math.round(item.budgeted)}
                          data-grid="expense-grid"
                          data-row={rowIndex}
                          data-col="budgeted"
                          onBlur={(e) =>
                            handleCellBlur(item.categoryId, item, 'budgeted', e.target.value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Enter') {
                              handleCellBlur(item.categoryId, item, 'budgeted', (e.target as HTMLInputElement).value);
                            }
                            handleGridKeyDown(e, 'expense-grid', rowIndex, 'budgeted', {
                              enableHorizontal: true,
                              colOrder: ['name', 'budgeted'],
                            });
                          }}
                          className="w-24 max-w-[90px] text-right px-1.5 py-0.5 bg-white/70 hover:bg-white focus:bg-white border border-slate-200/80 focus:border-blue-500 rounded-md text-xs font-mono font-bold text-slate-900 focus:outline-none transition-all shadow-2xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          title={isAr ? 'انقر لتعديل المبلغ المقدّر' : 'Click to edit budgeted amount'}
                        />
                      </div>
                    </td>

                    {/* 5. Actual Spent Amount (Locked: Calculated strictly from Transaction Ledger) */}
                    <td className="py-1 px-2.5 text-right font-mono">
                      <div
                        className="inline-flex items-center justify-end gap-1 px-2 py-0.5 bg-slate-100/80 border border-slate-200/60 text-xs font-bold text-slate-800 rounded-md select-none"
                        title={isAr ? 'حقل مقفل: يتم احتساب المنفق الفعلي تلقائياً من سجل المعاملات' : 'Locked: Calculated automatically from transaction ledger'}
                      >
                        <Lock className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                        <span>{formatCurrency(item.actual)}</span>
                      </div>
                    </td>

                    {/* 6. Variance */}
                    <td
                      className={`py-1 px-2.5 text-right font-mono text-xs font-bold ${
                        variance >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {formatCurrency(variance, { showSign: true })}
                    </td>

                    {/* 7. Utilization Bar */}
                    <td className="py-1 px-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between text-[9.5px] font-mono">
                          <span className="font-bold text-slate-700">{percent.toFixed(0)}%</span>
                          <span className="text-slate-400 font-arabic">
                            {isOver ? (isAr ? 'تجاوز' : 'Excess') : (isAr ? 'متبقي' : 'Left')}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              percent > 100
                                ? 'bg-rose-500'
                                : percent > 85
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(percent, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* 8. Status Badge */}
                    <td className="py-1 px-2 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.2 text-[9.5px] font-bold rounded-full ${
                          isOver
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {isOver ? (
                          <>
                            <AlertCircle className="w-2.5 h-2.5 text-rose-600" />
                            <span className="font-arabic">{isAr ? 'تجاوز' : 'OVER'}</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                            <span className="font-arabic">{isAr ? 'ضمن الخطة' : 'ON TRACK'}</span>
                          </>
                        )}
                      </span>
                    </td>

                    {/* 9. Delete Action */}
                    <td className="py-1 px-2 text-center">
                      <button
                        onClick={() => onDeleteItem(item.categoryId, item.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title={isAr ? 'حذف البند' : 'Delete item'}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {/* Summary Row */}
          <tfoot>
            <tr className="bg-slate-100/90 text-slate-800 font-mono font-bold text-xs border-t border-slate-200 font-arabic">
              <td className="py-2.5 px-3 text-[11px] text-slate-900" colSpan={2}>
                {isAr ? 'إجمالي ملخص المصروفات' : 'TOTAL EXPENSE OUTFLOW SUMMARY'}
              </td>
              <td className="py-2.5 px-2.5 text-center text-[10px] text-slate-500">
                {filteredItems.length} {isAr ? 'بنود' : 'Items'}
              </td>
              <td className="py-2.5 px-2.5 text-right text-slate-900 text-xs font-bold">
                {formatCurrency(totalBudgeted)}
              </td>
              <td className="py-2.5 px-2.5 text-right text-rose-600 text-xs font-bold">
                {formatCurrency(totalActual)}
              </td>
              <td
                className={`py-2.5 px-2.5 text-right text-xs font-bold ${
                  netVariance >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {formatCurrency(netVariance, { showSign: true })}
              </td>
              <td colSpan={3} className="py-2.5 px-3 text-center text-[10px] text-slate-600">
                {isAr ? 'إجمالي الاستخدام:' : 'Overall Utilization:'} <span className="font-bold text-slate-900">{overallUtilization.toFixed(1)}%</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
