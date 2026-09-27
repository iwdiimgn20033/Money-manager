import React, { useState, useRef, useEffect } from 'react';
import { BudgetPeriod, CurrencyInfo, SUPPORTED_CURRENCIES, UserProfile } from '../types';
import { LanguageCode, SUPPORTED_LANGUAGES, TRANSLATIONS } from '../i18n/translations';
import { SyncStatusIndicator, SyncState } from './SyncStatusIndicator';
import { 
  Globe, 
  Coins, 
  ChevronDown, 
  Check, 
  Search,
  Headphones,
  User,
  LogOut,
  Sparkles,
  RotateCcw,
  Menu,
  Calendar,
  CheckCircle2,
  UserPlus,
  LogIn,
  Crown,
  Zap,
  CreditCard,
  ShieldCheck
} from 'lucide-react';

interface NavbarProps {
  period: BudgetPeriod;
  currentCurrency: CurrencyInfo;
  onSelectCurrency: (currency: CurrencyInfo) => void;
  currentLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  currentUser: UserProfile | null;
  onOpenAuthModal: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
  onOpenConsultationModal: () => void;
  onOpenAddModal: () => void;
  onExportReport: () => void;
  onOpenReportsModal?: () => void;
  onResetData: () => void;
  onOpenPeriodModal: () => void;
  onOpenMobileSidebar: () => void;
  onToggleDesktopSidebar?: () => void;
  isSidebarCollapsed?: boolean;
  isSaved?: boolean;
  lastSyncedAt?: Date | null;
  syncState?: SyncState;
  onManualSync?: () => Promise<void> | void;
  recordStats?: {
    incomeCount: number;
    expensesCount: number;
    transactionsCount: number;
    bookingsCount: number;
  };
}

export const Navbar: React.FC<NavbarProps> = ({
  period,
  currentCurrency,
  onSelectCurrency,
  currentLanguage,
  onSelectLanguage,
  currentUser,
  onOpenAuthModal,
  onLogout,
  onOpenConsultationModal,
  onResetData,
  onOpenPeriodModal,
  onOpenMobileSidebar,
  onToggleDesktopSidebar,
  isSidebarCollapsed = false,
  isSaved = false,
  lastSyncedAt = null,
  syncState = 'synced',
  onManualSync = () => {},
  recordStats,
}) => {
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');

  const currencyRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
  const isAr = currentLanguage === 'ar';

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (currencyRef.current && !currencyRef.current.contains(event.target as Node)) {
        setIsCurrencyOpen(false);
      }
      if (languageRef.current && !languageRef.current.contains(event.target as Node)) {
        setIsLanguageOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCurrencies = SUPPORTED_CURRENCIES.filter(
    (c) =>
      c.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
      c.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
      c.symbol.toLowerCase().includes(currencySearch.toLowerCase())
  );

  return (
    <header className="bg-white/80 backdrop-blur-2xl border-b border-slate-200/80 text-slate-800 sticky top-0 z-20 shadow-xs">
      <div className="w-full px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 sm:h-15 gap-1.5 sm:gap-2">
          {/* Left Side: 3-Bars Hamburger Button (3 شحطات) + Financial Period */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0">
            {/* 3-Bars Hamburger Button (3 شحطات لفتح وإغلاق القائمة الجانبية) */}
            <button
              type="button"
              onClick={() => {
                // Mobile trigger
                if (window.innerWidth < 1024) {
                  onOpenMobileSidebar();
                } else if (onToggleDesktopSidebar) {
                  // Desktop collapse/expand trigger
                  onToggleDesktopSidebar();
                }
              }}
              className="p-1.5 sm:p-2 bg-slate-100 hover:bg-blue-50 active:bg-blue-100 border border-slate-200 hover:border-blue-300 rounded-xl text-slate-700 hover:text-blue-600 transition-all shrink-0 backdrop-blur-md flex items-center justify-center group shadow-2xs cursor-pointer"
              title={
                isAr
                  ? (isSidebarCollapsed ? 'فتح القائمة الجانبية (3 شحطات)' : 'طي / فتح القائمة الجانبية (3 شحطات)')
                  : (isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse / Open Sidebar')
              }
              aria-label={isAr ? 'فتح وإغلاق القائمة الجانبية' : 'Toggle Sidebar'}
            >
              {/* Distinctive 3-Bars Icon (3 شحطات أفقية أنيقة وعصرية) */}
              <div className="w-5 h-4.5 flex flex-col justify-between items-center py-0.5">
                <span className="w-4.5 h-0.5 bg-slate-600 group-hover:bg-blue-600 group-hover:w-5 transition-all rounded-full" />
                <span className="w-4.5 h-0.5 bg-slate-500 group-hover:bg-blue-500 group-hover:w-3.5 transition-all rounded-full" />
                <span className="w-4.5 h-0.5 bg-slate-600 group-hover:bg-blue-600 group-hover:w-5 transition-all rounded-full" />
              </div>
            </button>

            {/* Period Status Badge */}
            <button
              onClick={onOpenPeriodModal}
              className="flex items-center gap-1.5 sm:gap-2 px-2 py-1 sm:px-2.5 sm:py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-[11px] sm:text-xs font-mono text-slate-700 transition-all shadow-2xs shrink-0 backdrop-blur-md"
              title={isAr ? 'تعديل الفترة المالية' : 'Change Financial Period'}
            >
              <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" strokeWidth={1.75} />
              <span className="font-bold text-slate-800 hidden md:inline truncate max-w-[120px] font-arabic">{period.label}</span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded-lg border border-emerald-300 whitespace-nowrap font-arabic">
                {period.totalDays - period.currentDay} {t.daysLeft}
              </span>
            </button>

            {/* Currency Chip (Quick view on Large screens) */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-xl text-[11px] font-mono text-slate-600 shrink-0 backdrop-blur-md">
              <span className="text-sm">{currentCurrency.flag}</span>
              <span className="font-bold text-slate-800">{currentCurrency.code}</span>
              <span className="text-slate-500 text-[10px]">({currentCurrency.rateAgainstUSD} / USD)</span>
            </div>
          </div>

          {/* Right Side: Tools & Selectors (Zero horizontal scroll across Mobile, Tablet, Desktop) */}
          <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2 shrink-0">
            {/* Internal Server Sync & Data Persistence (Visible for admin) */}
            {currentUser?.role === 'admin' && (
              <div className="shrink-0">
                <SyncStatusIndicator
                  lastSyncedAt={lastSyncedAt}
                  syncState={syncState}
                  currentLanguage={currentLanguage}
                  onManualSync={onManualSync}
                  recordStats={recordStats}
                />
              </div>
            )}

            {/* Auto-Save indicator */}
            <div
              className={`transition-all duration-300 flex items-center gap-1 px-2 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-[10px] sm:text-[11px] font-bold shadow-2xs shrink-0 backdrop-blur-md ${
                isSaved ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
              }`}
              title="All changes saved"
            >
              <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 shrink-0" strokeWidth={1.75} />
              <span className="hidden lg:inline font-arabic">
                {isAr ? 'محفوظ' : 'Saved'}
              </span>
            </div>

            {/* 1. TALK TO EXPERT CTA BUTTON (Responsive on md+) */}
            <button
              onClick={onOpenConsultationModal}
              className="hidden md:flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-[11px] sm:text-xs font-bold rounded-xl transition-all shadow-xs hover:shadow-md shrink-0 whitespace-nowrap font-arabic border border-blue-400/40 backdrop-blur-md"
              title={isAr ? 'طلب استشارة مالية فورية' : 'Talk to Financial Expert'}
            >
              <Headphones className="w-3.5 h-3.5 text-blue-100 shrink-0" strokeWidth={1.75} />
              <span className="hidden lg:inline">{isAr ? 'استشارة خبير' : 'Talk to Expert'}</span>
              <span className="lg:hidden">{isAr ? 'خبير' : 'Advisor'}</span>
            </button>

            {/* 2. COUNTRY CURRENCY SELECTOR */}
            <div className="relative shrink-0" ref={currencyRef}>
              <button
                onClick={() => {
                  setIsCurrencyOpen(!isCurrencyOpen);
                  setIsLanguageOpen(false);
                  setIsUserMenuOpen(false);
                }}
                className="flex items-center gap-1 px-2 py-1 sm:py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-[11px] sm:text-xs font-mono font-bold text-slate-700 hover:text-slate-900 transition-all shadow-2xs backdrop-blur-md"
                title={t.changeCurrency}
              >
                <span className="text-sm sm:text-base leading-none">{currentCurrency.flag}</span>
                <span className="text-blue-700 font-bold text-[11px] sm:text-xs">{currentCurrency.code}</span>
                <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-500 shrink-0" strokeWidth={1.75} />
              </button>

              {isCurrencyOpen && (
                <div className={`absolute ${isAr ? 'left-0' : 'right-0'} mt-1.5 w-60 sm:w-64 bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-2xl shadow-xl z-50 py-1 max-h-96 flex flex-col overflow-hidden text-slate-800`}>
                  <div className="p-2 border-b border-slate-100 space-y-1.5 bg-slate-50">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-600 font-arabic">
                      <span>{t.changeCurrency}</span>
                      <Coins className="w-3.5 h-3.5 text-blue-600" strokeWidth={1.75} />
                    </div>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" strokeWidth={1.75} />
                      <input
                        type="text"
                        placeholder={isAr ? 'ابحث عن العملة...' : 'Search currency...'}
                        value={currencySearch}
                        onChange={(e) => setCurrencySearch(e.target.value)}
                        className="w-full pl-7 pr-2 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-arabic"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
                    {filteredCurrencies.map((curr) => {
                      const isSelected = curr.code === currentCurrency.code;
                      return (
                        <button
                          key={curr.code}
                          onClick={() => {
                            onSelectCurrency(curr);
                            setIsCurrencyOpen(false);
                            setCurrencySearch('');
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs font-mono transition-colors text-left ${
                            isSelected
                              ? 'bg-blue-50 text-blue-700 font-bold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-base">{curr.flag}</span>
                            <span className="font-bold text-slate-900">{curr.code}</span>
                            <span className="text-slate-600 text-[11px] truncate font-arabic">
                              {curr.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <span className="font-bold text-blue-600">{curr.symbol}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" strokeWidth={1.75} />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 3. MULTI-LANGUAGE SELECTOR */}
            <div className="relative shrink-0" ref={languageRef}>
              <button
                onClick={() => {
                  setIsLanguageOpen(!isLanguageOpen);
                  setIsCurrencyOpen(false);
                  setIsUserMenuOpen(false);
                }}
                className="flex items-center gap-1 px-2 py-1 sm:py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-[11px] sm:text-xs font-bold text-slate-700 transition-all shadow-2xs backdrop-blur-md"
                title={t.changeLanguage}
              >
                <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 shrink-0" strokeWidth={1.75} />
                <span className="uppercase text-[10px] sm:text-xs font-bold text-slate-800 tracking-wider font-latin">
                  {currentLanguage.toUpperCase()}
                </span>
                <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-500 shrink-0" strokeWidth={1.75} />
              </button>

              {isLanguageOpen && (
                <div className={`absolute ${isAr ? 'left-0' : 'right-0'} mt-1.5 w-44 sm:w-48 bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-2xl shadow-xl z-50 py-1 overflow-hidden text-slate-800`}>
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100 font-arabic bg-slate-50">
                    Language / اللغة
                  </div>
                  {SUPPORTED_LANGUAGES.map((lang) => {
                    const isSelected = lang.code === currentLanguage;
                    return (
                      <button
                        key={lang.code}
                        onClick={() => {
                          onSelectLanguage(lang.code);
                          setIsLanguageOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors text-left ${
                          isSelected
                            ? 'bg-blue-50 text-blue-700 font-bold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-arabic">
                          <span className="text-base">{lang.flag}</span>
                          <span className="font-bold text-slate-900">{lang.nativeName}</span>
                          <span className="text-slate-500 text-[10px]">({lang.name})</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" strokeWidth={1.75} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 4. USER AUTH / PROFILE BUTTON */}
            <div className="relative shrink-0" ref={userRef}>
              {currentUser ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(!isUserMenuOpen);
                      setIsCurrencyOpen(false);
                      setIsLanguageOpen(false);
                    }}
                    className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:py-1.5 border rounded-xl text-[11px] sm:text-xs font-bold transition-all shadow-2xs backdrop-blur-md bg-amber-50/80 hover:bg-amber-100/90 border-amber-300 text-amber-950"
                    title={currentUser.name}
                  >
                    <div className="w-4 h-4 sm:w-5 sm:h-5 text-white font-mono text-[9px] sm:text-[10px] font-black rounded-lg flex items-center justify-center shrink-0 shadow-xs bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 font-bold">
                      <Crown className="w-3 h-3 text-slate-950" />
                    </div>
                    <span className="inline text-[11px] sm:text-xs font-bold truncate max-w-[55px] sm:max-w-[85px] md:max-w-[110px] font-arabic">
                      {currentUser.name}
                    </span>
                    <span className="px-1 py-0.2 rounded text-[9px] font-black uppercase bg-amber-500 text-slate-950">
                      PRO
                    </span>
                    <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-500 shrink-0" strokeWidth={1.75} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onOpenAuthModal('login')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/80 rounded-xl text-[11px] sm:text-xs font-bold transition-all shadow-xs whitespace-nowrap font-arabic cursor-pointer"
                    title={isAr ? 'تسجيل الدخول مع Supabase' : 'Sign In with Supabase'}
                  >
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
                      <path 
                        d="M13.35 2.15a1 1 0 0 0-1.7 0L2.3 16.55a1 1 0 0 0 .85 1.55h8.85l-.5 4.5a1 1 0 0 0 1.7 0l9.35-14.4a1 1 0 0 0-.85-1.55h-8.85l.45-4.5z" 
                        fill="currentColor"
                      />
                    </svg>
                    <span>{isAr ? 'تسجيل الدخول' : 'Sign In'}</span>
                    <span className="hidden sm:inline-block text-[10px] bg-emerald-700/60 px-1.5 py-0.2 rounded text-emerald-100 font-mono">
                      Supabase
                    </span>
                  </button>
                </div>
              )}

              {isUserMenuOpen && currentUser && (
                <div className={`absolute ${isAr ? 'left-0' : 'right-0'} mt-1.5 w-64 sm:w-72 bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-2xl shadow-xl z-50 p-3.5 overflow-hidden font-arabic text-slate-800`}>
                  <div className="pb-3 border-b border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900 text-xs block truncate">{currentUser.name}</span>
                      <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded-md shrink-0 flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300">
                        <Crown className="w-2.5 h-2.5 text-amber-600" />
                        <span>{isAr ? 'حساب احترافي (PRO)' : 'Pro Account'}</span>
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono block truncate">{currentUser.email}</span>
                  </div>

                  <div className="my-2 p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-[10px] space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isAr ? 'كافة الميزات الاحترافية مفعلة مجاناً' : 'All Pro Features Active Free'}</span>
                    </div>
                    <p className="text-emerald-700/90 text-[9px] leading-tight">
                      {isAr ? 'المحاسبة المزدوجة، القوائم والتقارير المالية، المزامنة والمحافظ مفتوحة بالكامل.' : 'Double-entry accounting, balance sheet, reports, and sync fully accessible.'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    <button
                      onClick={() => {
                        onOpenAuthModal('register');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-left font-bold"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-slate-500" strokeWidth={1.75} />
                      <span>{isAr ? 'إنشاء حساب جديد' : 'New Account'}</span>
                    </button>
                    <button
                      onClick={() => {
                        onOpenAuthModal('login');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-left"
                    >
                      <LogIn className="w-3.5 h-3.5 text-slate-500" strokeWidth={1.75} />
                      <span>{isAr ? 'تبديل الحساب / تسجيل الدخول' : 'Switch Account / Sign In'}</span>
                    </button>
                    <button
                      onClick={() => {
                        onLogout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left font-bold"
                    >
                      <LogOut className="w-3.5 h-3.5" strokeWidth={1.75} />
                      <span>{isAr ? 'تسجيل الخروج' : 'Sign Out'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Reset Data Button */}
            <button
              onClick={onResetData}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all shrink-0 backdrop-blur-md"
              title={isAr ? 'إعادة ضبط البيانات' : 'Reset Data'}
            >
              <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
