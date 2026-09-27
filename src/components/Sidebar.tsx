import React from 'react';
import { ActiveTab, UserProfile, AppMode } from '../types';
import { LanguageCode, TRANSLATIONS } from '../i18n/translations';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Receipt, 
  Sliders, 
  Calendar, 
  ShieldCheck, 
  Scale, 
  FileText, 
  BookOpen,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  Headphones,
  Wallet,
  Plus,
  Settings,
  User,
  Building2
} from 'lucide-react';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentLanguage: LanguageCode;
  currentUser: UserProfile | null;
  appMode: AppMode;
  onSelectAppMode: (mode: AppMode) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenConsultationModal: () => void;
  onOpenReportsModal: () => void;
  onOpenAddTransaction: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentLanguage,
  currentUser,
  appMode,
  onSelectAppMode,
  isOpenMobile,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
  onOpenConsultationModal,
  onOpenReportsModal,
  onOpenAddTransaction,
}) => {
  const isAr = currentLanguage === 'ar';
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  interface NavItem {
    id: ActiveTab;
    label: string;
    description?: string;
    icon: React.ElementType;
    badge?: string;
    adminOnly?: boolean;
  }

  interface NavGroup {
    groupTitle: string;
    items: NavItem[];
  }

  // 1. INDIVIDUALS MODE (أفراد): فقط الإدخال والموازنة والفروقات من دون التعقيدات المحاسبية والقيود
  const personalNavGroups: NavGroup[] = [
    {
      groupTitle: isAr ? 'الرئيسية والفروقات' : 'Overview & Variances',
      items: [
        {
          id: 'overview',
          label: isAr ? 'ملخص الفروقات والسيولة' : 'Variance & Cash Summary',
          description: isAr ? 'مؤشرات الأداء والفروقات' : 'Daily burn, actual vs budget',
          icon: BarChart3,
        },
        {
          id: 'breakdown',
          label: isAr ? 'الموازنة ومقارنة الفروقات' : 'Budget vs Actual Variance',
          description: isAr ? 'مقارنة المخطط بالفعلي' : 'Line-by-line comparison',
          icon: PieChart,
        },
      ],
    },
    {
      groupTitle: isAr ? 'الإدخال المالي المباشر' : 'Financial Entry',
      items: [
        {
          id: 'transactions',
          label: isAr ? 'إدخال وتدوين المعاملات' : 'Log Transactions',
          description: isAr ? 'تسجيل المصاريف والإيرادات السريعة' : 'Quick entry of expenses & income',
          icon: Receipt,
        },
      ],
    },
    {
      groupTitle: isAr ? 'التخطيط والموازنة' : 'Budgeting & Planning',
      items: [
        {
          id: 'simulator',
          label: isAr ? 'محاكي الموازنة والمدخرات' : 'Budget Simulator',
          description: isAr ? 'تجارب سيناريوهات التوفير' : 'Savings & future projections',
          icon: Sliders,
        },
      ],
    },
    {
      groupTitle: isAr ? 'الإعدادات العامة' : 'Settings',
      items: [
        {
          id: 'settings',
          label: isAr ? 'الإعدادات والعملة' : 'Settings & Currency',
          description: isAr ? 'العملة والنسخ الاحتياطي' : 'Currency & local backup',
          icon: Settings,
        },
      ],
    },
  ];

  // 2. COMPANIES MODE (شركات): النظام المحاسبي المتكامل، القيود، شجرة الحسابات، والقوائم المالية
  const businessNavGroups: NavGroup[] = [
    {
      groupTitle: isAr ? 'التحليل واللوحة التنفيذية' : 'Executive Analytics',
      items: [
        {
          id: 'overview',
          label: t.overview,
          description: isAr ? 'ملخص الأداء والمؤشرات' : 'Executive Dashboard',
          icon: BarChart3,
        },
        {
          id: 'cashflow',
          label: t.cashflow,
          description: isAr ? 'توقعات السيولة والتدفقات' : 'Cash Flow Projections',
          icon: TrendingUp,
        },
        {
          id: 'breakdown',
          label: t.breakdown,
          description: isAr ? 'مقارنة الإنفاق وانحرافات الموازنة' : 'Actual vs Budget Variance',
          icon: PieChart,
        },
      ],
    },
    {
      groupTitle: isAr ? 'النظام المحاسبي والقيود' : 'Accounting & Double Entry',
      items: [
        {
          id: 'accounting',
          label: isAr ? 'شجرة الحسابات والقيود' : 'COA & Double Entry',
          description: isAr ? 'دليل الحسابات وقيود اليومية' : 'General Ledger & Chart of Accounts',
          icon: BookOpen,
          badge: isAr ? 'محاسبي' : 'Ledger',
        },
        {
          id: 'balancesheet',
          label: isAr ? 'الميزانية العمومية والمركز المالي' : 'Balance Sheet',
          description: isAr ? 'الأصول والخصوم وحقوق الملكية' : 'Assets, Liabilities & Equity',
          icon: Scale,
          badge: isAr ? 'قوائم' : 'Financials',
        },
        {
          id: 'reports',
          label: isAr ? 'التقارير المالية المعتمدة' : 'Financial Reports',
          description: isAr ? 'قوائم الدخل والتدفقات والتدقيق' : 'Standard Statements & Audit',
          icon: FileText,
          badge: isAr ? 'معتمد' : 'Audit',
        },
        {
          id: 'transactions',
          label: t.transactions,
          description: isAr ? 'دفتر العمليات ومسار التدقيق' : 'Audit Trail & Entries',
          icon: Receipt,
        },
      ],
    },
    {
      groupTitle: isAr ? 'التخطيط المؤسسي والخبراء' : 'Corporate Planning',
      items: [
        {
          id: 'simulator',
          label: t.simulator,
          description: isAr ? 'سيناريوهات النمو ومعدل الحرق' : 'Burn-rate & Forecasting',
          icon: Sliders,
        },
        {
          id: 'consultations',
          label: isAr ? 'جدول الاستشارات المالية' : 'Consultations',
          description: isAr ? 'مواعيد الخبراء الماليين' : 'Client Advisor Schedule',
          icon: Calendar,
        },
      ],
    },
    {
      groupTitle: isAr ? 'الإدارة والتحكم' : 'Administration',
      items: [
        {
          id: 'settings',
          label: isAr ? 'الإعدادات والبيانات' : 'Settings & Data',
          description: isAr ? 'تصفير القيود، النماذج، والنسخ' : 'Clean Slate, Templates & Backup',
          icon: Settings,
        },
        {
          id: 'admin',
          label: isAr ? 'لوحة تحكم المدير' : 'Admin Control Panel',
          description: isAr ? 'إدارة المواعيد والصلاحيات' : 'System Administration',
          icon: ShieldCheck,
          badge: currentUser?.role === 'admin' ? (isAr ? 'مدير' : 'Admin') : undefined,
        },
      ],
    },
  ];

  const navGroups: NavGroup[] = appMode === 'personal' ? personalNavGroups : businessNavGroups;

  const handleSelectTab = (id: ActiveTab) => {
    setActiveTab(id);
    if (isOpenMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white/80 backdrop-blur-2xl text-slate-800 border-e border-slate-200/80 shadow-xl select-none">
      {/* Brand Header & High-End Modern Soft Logo */}
      <div className="p-3.5 border-b border-slate-200/80 flex items-center justify-between gap-2.5 bg-slate-50/80 backdrop-blur-md">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Enhanced Professional Vector Logo with Soft Rounded Glassmorphism */}
          <div className="relative group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 p-0.5 shadow-md shadow-blue-500/20 transition-transform duration-300 group-hover:scale-105">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600 drop-shadow-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" className="text-emerald-600 stroke-emerald-600" />
                </svg>
              </div>
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-white ring-2 ring-emerald-500/30 animate-pulse" />
          </div>

          {/* Brand Title with Refined High-Contrast Typography */}
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-[15px] text-slate-900 tracking-wide font-latin">
                  1MONEY<span className="text-blue-600 font-black">+</span>
                </span>
                <span className="text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-md font-latin shadow-2xs">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium truncate leading-tight font-arabic mt-0.5">
                {isAr ? 'النظام المالي والمحاسبي' : 'Financial Accounting Suite'}
              </p>
            </div>
          )}
        </div>

        {/* Mobile Close Button / Desktop Collapse Toggle */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            title={isAr ? 'إغلاق القائمة' : 'Close Sidebar'}
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>

          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            title={isCollapsed ? (isAr ? 'توسيع القائمة' : 'Expand Sidebar') : (isAr ? 'طي القائمة' : 'Collapse Sidebar')}
          >
            {isCollapsed ? (
              isAr ? <ChevronLeft className="w-4 h-4" strokeWidth={1.75} /> : <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
            ) : (
              isAr ? <ChevronRight className="w-4 h-4" strokeWidth={1.75} /> : <ChevronLeft className="w-4 h-4" strokeWidth={1.75} />
            )}
          </button>
        </div>
      </div>

      {/* Interface Mode Switcher in Sidebar (الأفراد vs الشركات) */}
      {!isCollapsed ? (
        <div className="p-2.5 border-b border-slate-200/80 bg-slate-50/80 font-arabic">
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {isAr ? 'نمط الواجهة المالي' : 'Interface Mode'}
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
              appMode === 'personal'
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
            }`}>
              {appMode === 'personal' ? (isAr ? 'حساب أفراد' : 'Personal') : (isAr ? 'حساب شركات' : 'Business')}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => onSelectAppMode('personal')}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                appMode === 'personal'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{isAr ? 'الأفراد' : 'Personal'}</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectAppMode('business')}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                appMode === 'business'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{isAr ? 'الشركات' : 'Business'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-2 border-b border-slate-200/80 flex justify-center bg-slate-50/80">
          <button
            type="button"
            onClick={() => onSelectAppMode(appMode === 'personal' ? 'business' : 'personal')}
            className={`p-2 rounded-xl transition-all border ${
              appMode === 'personal'
                ? 'bg-blue-50 text-blue-600 border-blue-200'
                : 'bg-indigo-50 text-indigo-600 border-indigo-200'
            }`}
            title={appMode === 'personal' ? (isAr ? 'التبديل إلى الشركات' : 'Switch to Business') : (isAr ? 'التبديل إلى الأفراد' : 'Switch to Personal')}
          >
            {appMode === 'personal' ? <User className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
          </button>
        </div>
      )}

      {/* Primary Log Transaction Action Button (Always Accessible in Sidebar) */}
      <div className="p-2.5 border-b border-slate-200/80 bg-slate-50/50">
        {!isCollapsed ? (
          <button
            type="button"
            onClick={() => {
              onOpenAddTransaction();
              if (isOpenMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-between gap-2 p-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-700 hover:to-indigo-700 text-white font-bold transition-all shadow-md shadow-blue-500/20 group font-arabic active:scale-[0.98] cursor-pointer border border-blue-400/40"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Plus className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <div className="text-start min-w-0">
                <div className="text-xs font-black truncate">{isAr ? 'تسجيل معاملة' : 'Log Transaction'}</div>
                <div className="text-[10px] text-blue-100 font-normal truncate">{isAr ? 'إدخال فوري جانبي' : 'Quick Slide Panel'}</div>
              </div>
            </div>
            <span className="text-[9px] font-mono font-black bg-white/20 px-1.5 py-0.5 rounded-md text-white shadow-2xs">
              +
            </span>
          </button>
        ) : (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={onOpenAddTransaction}
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center justify-center shadow-md shadow-blue-500/25 transition-all active:scale-95 cursor-pointer border border-blue-400/30"
              title={isAr ? 'تسجيل معاملة مالية' : 'Log Transaction'}
            >
              <Plus className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>

      {/* Navigation Links with Refined Soft Icons & High-Contrast Typography */}
      <div className="flex-1 overflow-y-auto py-2.5 px-2 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-200">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            {/* Clean Section Label */}
            {!isCollapsed && (
              <div className="px-2.5 py-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-arabic">
                  {group.groupTitle}
                </span>
              </div>
            )}

            {/* Nav Items */}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    id={`sidebar-nav-${item.id}`}
                    type="button"
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all text-start group relative ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                    title={`${item.label} ${item.description ? `— ${item.description}` : ''}`}
                  >
                    {/* Soft Rounded Icon Container */}
                    <div
                      className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 border border-slate-200/60'
                      }`}
                    >
                      <Icon className="w-4 h-4" strokeWidth={isActive ? 2 : 1.75} />
                    </div>

                    {/* Text Details with High Contrast */}
                    {!isCollapsed && (
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`text-xs truncate font-arabic ${
                              isActive ? 'font-bold text-blue-900' : 'font-medium text-slate-700 group-hover:text-slate-900'
                            }`}
                          >
                            {item.label}
                          </span>
                          {item.badge && (
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono font-bold uppercase shrink-0 ${
                                isActive
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p
                            className={`text-[10px] truncate leading-tight font-arabic mt-0.5 ${
                              isActive ? 'text-blue-600/80 font-normal' : 'text-slate-400 group-hover:text-slate-500'
                            }`}
                          >
                            {item.description}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Active Indicator dot when collapsed */}
                    {isCollapsed && isActive && (
                      <div className="absolute right-1 w-1.5 h-1.5 rounded-full bg-blue-600 ring-2 ring-blue-200" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Compact Quick-Action CTA */}
      {!isCollapsed && (
        <div className="p-2.5 border-t border-slate-200/80 bg-slate-50/80 backdrop-blur-md space-y-1.5">
          <button
            type="button"
            onClick={onOpenConsultationModal}
            className="w-full flex items-center justify-center gap-2 p-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-xs font-arabic border border-blue-400/30"
          >
            <Headphones className="w-3.5 h-3.5 text-blue-100 shrink-0" strokeWidth={1.75} />
            <span className="truncate">{isAr ? 'استشارة خبير مالي' : 'Expert Consultation'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenReportsModal}
            className="w-full flex items-center justify-center gap-2 p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold transition-all font-arabic shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" strokeWidth={1.75} />
            <span className="truncate">{isAr ? 'التقارير المالية المعتمدة' : 'Official Reports'}</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 sticky top-0 h-screen transition-all duration-200 z-30 ${
          isCollapsed ? 'w-16' : 'w-60'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay & Sidebar */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Drawer Panel */}
          <div
            className={`fixed inset-y-0 ${
              isAr ? 'right-0' : 'left-0'
            } w-68 max-w-[85vw] shadow-2xl z-50 transform transition-transform ease-in-out duration-200`}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
