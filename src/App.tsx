import React, { useState, useEffect, useRef } from 'react';
import { 
  ActiveTab, 
  BudgetPeriod, 
  ConsultationBooking, 
  CurrencyInfo, 
  ExpenseCategory, 
  ExpenseItem, 
  IncomeItem, 
  SUPPORTED_CURRENCIES, 
  Transaction, 
  UserProfile,
  BalanceSheetData 
} from './types';
import { INITIAL_EXPENSE_CATEGORIES, INITIAL_INCOME_ITEMS, INITIAL_PERIOD, INITIAL_TRANSACTIONS } from './data/initialData';
import { calculateFinancialMetrics, exportBudgetToCSV, formatCurrency, setAppCurrency } from './utils/calculations';
import { LanguageCode, TRANSLATIONS } from './i18n/translations';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MetricCards } from './components/MetricCards';
import { ExecutiveOverview } from './components/ExecutiveOverview';
import { ExpenseBreakdown } from './components/ExpenseBreakdown';
import { EditableIncomeTable } from './components/EditableIncomeTable';
import { CashInflowSection } from './components/CashInflowSection';
import { CashFlowProjections } from './components/CashFlowProjections';
import { CashFlowPeriodComparison } from './components/CashFlowPeriodComparison';
import { TransactionLedger } from './components/TransactionLedger';
import { BudgetSimulator } from './components/BudgetSimulator';
import { AdminDashboard } from './components/AdminDashboard';
import { BalanceSheetView } from './components/BalanceSheetView';
import { DailyBurnRateIndicator } from './components/DailyBurnRateIndicator';
import { DynamicFinancialBackground } from './components/DynamicFinancialBackground';
import { AccountingCycleView } from './components/AccountingCycleView';
import { ConsultationsScheduleView } from './components/ConsultationsScheduleView';
import { FinancialReportsModal } from './components/FinancialReportsModal';
import { FinancialReportsDashboard } from './components/FinancialReportsDashboard';
import { PeriodModal } from './components/Modals';
import { TransactionSidePanel } from './components/TransactionSidePanel';
import { AuthModal } from './components/AuthModal';
import { ConsultationModal } from './components/ConsultationModal';
import { SettingsView } from './components/SettingsView';
import { SyncState } from './components/SyncStatusIndicator';
import { Download, Plus, Wallet, Sparkles, Headphones, ShieldCheck, Scale, FileText, ArrowUp, MessageCircle, Cloud } from 'lucide-react';
import { auth, saveCloudFinanceData, subscribeToCloudFinanceData, logoutFirebase, getIsQuotaExceeded } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { savePostgresFinanceData, syncUserToPostgres, getPostgresFinanceData } from './lib/api';
import { onSupabaseAuthStateChange, signOutFromSupabase } from './lib/supabase';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';

const INITIAL_BOOKINGS: ConsultationBooking[] = [];

const DEFAULT_BALANCE_SHEET: BalanceSheetData = {
  asOfDate: new Date().toISOString().split('T')[0],
  assets: [
    { id: 'ast-1', name: 'السيولة النقدية والحسابات البنكية', category: 'current', value: 0 },
    { id: 'ast-2', name: 'الودائع الاستثمارية قصيرة الأجل', category: 'current', value: 0 },
    { id: 'ast-3', name: 'محفظة الأسهم والصناديق الاستثمارية', category: 'liquid_investments', value: 0 },
    { id: 'ast-4', name: 'العقارات والأصول الثابتة', category: 'non_current', value: 0 },
  ],
  liabilities: [
    { id: 'liab-1', name: 'بطاقات الائتمان ومستحقات قصيرة', category: 'current', value: 0 },
    { id: 'liab-2', name: 'التمويلات والالتزامات طويلة الأجل', category: 'long_term', value: 0 },
  ],
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Persistent States from LocalStorage (with migration for today's real date)
  const [period, setPeriod] = useState<BudgetPeriod>(() => {
    try {
      const saved = localStorage.getItem('fg_period');
      if (saved) {
        const parsed = JSON.parse(saved);
        // If stale 2023 data exists, upgrade to today's real current date
        if (!parsed.year || parsed.year <= 2023 || (parsed.label && parsed.label.includes('2023'))) {
          return INITIAL_PERIOD;
        }
        return parsed;
      }
      return INITIAL_PERIOD;
    } catch {
      return INITIAL_PERIOD;
    }
  });

  const [incomeItems, setIncomeItems] = useState<IncomeItem[]>(() => {
    try {
      const saved = localStorage.getItem('fg_income_items');
      return saved ? JSON.parse(saved) : INITIAL_INCOME_ITEMS;
    } catch {
      return INITIAL_INCOME_ITEMS;
    }
  });

  const [categories, setCategories] = useState<ExpenseCategory[]>(() => {
    try {
      const saved = localStorage.getItem('fg_categories');
      return saved ? JSON.parse(saved) : INITIAL_EXPENSE_CATEGORIES;
    } catch {
      return INITIAL_EXPENSE_CATEGORIES;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('fg_transactions');
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [consultationBookings, setConsultationBookings] = useState<ConsultationBooking[]>(() => {
    try {
      const saved = localStorage.getItem('fg_bookings');
      return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
    } catch {
      return INITIAL_BOOKINGS;
    }
  });

  const [balanceSheet, setBalanceSheet] = useState<BalanceSheetData>(() => {
    try {
      const saved = localStorage.getItem('fg_balance_sheet');
      return saved ? JSON.parse(saved) : DEFAULT_BALANCE_SHEET;
    } catch {
      return DEFAULT_BALANCE_SHEET;
    }
  });

  // Country Currency Configuration (Default: QAR)
  const [currentCurrency, setCurrentCurrency] = useState<CurrencyInfo>(() => {
    try {
      const saved = localStorage.getItem('fg_currency');
      if (saved) return JSON.parse(saved);
      return (
        SUPPORTED_CURRENCIES.find((c) => c.code === 'QAR') ||
        SUPPORTED_CURRENCIES[0]
      );
    } catch {
      return SUPPORTED_CURRENCIES[1]; // QAR
    }
  });

  // Language & Localization Configuration (Default: Arabic)
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem('fg_language');
      return (saved as LanguageCode) || 'ar';
    } catch {
      return 'ar';
    }
  });

  // User Auth State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('fg_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) {
          return parsed;
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  // State saving feedback & Server Sync indicator
  const [isSaved, setIsSaved] = useState(false);
  const [syncState, setSyncState] = useState<SyncState>('synced');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(() => {
    try {
      const saved = localStorage.getItem('fg_last_synced_at');
      return saved ? new Date(saved) : new Date();
    } catch {
      return new Date();
    }
  });

  const isInitialMount = useRef(true);
  const saveTimerRef = useRef<any>(null);
  const isRemoteSyncRef = useRef(false);
  const lastSavedDataHashRef = useRef<string>('');

  const recordSyncSuccess = () => {
    const now = new Date();
    setLastSyncedAt(now);
    localStorage.setItem('fg_last_synced_at', now.toISOString());
    setSyncState('synced');
  };

  const triggerSavedIndicator = () => {
    if (isInitialMount.current) return;
    setIsSaved(true);
    recordSyncSuccess();
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  // Manual Trigger to force immediate local and cloud Firebase synchronization
  const handleManualSync = async () => {
    setSyncState('syncing');
    try {
      // Save all current states to LocalStorage immediately
      localStorage.setItem('fg_period', JSON.stringify(period));
      localStorage.setItem('fg_income_items', JSON.stringify(incomeItems));
      localStorage.setItem('fg_categories', JSON.stringify(categories));
      localStorage.setItem('fg_transactions', JSON.stringify(transactions));
      localStorage.setItem('fg_bookings', JSON.stringify(consultationBookings));
      localStorage.setItem('fg_balance_sheet', JSON.stringify(balanceSheet));
      localStorage.setItem('fg_currency', JSON.stringify(currentCurrency));
      localStorage.setItem('fg_language', currentLanguage);
      if (currentUser) {
        localStorage.setItem('fg_user', JSON.stringify(currentUser));
        // Save to Firebase Firestore Cloud if quota permits
        await saveCloudFinanceData(currentUser.id, {
          period,
          income: incomeItems,
          categories,
          transactions,
          balanceSheet,
          consultations: consultationBookings,
          activeCurrencyCode: currentCurrency.code,
        });
        // Save to Cloud SQL PostgreSQL
        await savePostgresFinanceData({
          period,
          income: incomeItems,
          categories,
          transactions,
          balanceSheet,
          consultations: consultationBookings,
          activeCurrencyCode: currentCurrency.code,
        });
      }

      // Small delay for smooth visual feedback
      await new Promise((resolve) => setTimeout(resolve, 400));
      recordSyncSuccess();
      setIsSaved(true);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        setIsSaved(false);
      }, 2500);
    } catch (err) {
      console.warn('Manual sync warning:', err);
      recordSyncSuccess();
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      isInitialMount.current = false;
      recordSyncSuccess();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Listen to Firebase Auth state on mount
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser && !currentUser) {
        const initials = (fbUser.displayName || fbUser.email || 'US')
          .substring(0, 2)
          .toUpperCase();
        const profile: UserProfile = {
          id: fbUser.uid,
          name: fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'User'),
          email: fbUser.email || '',
          role: 'premium',
          tier: 'pro',
          avatarInitials: initials,
          joinedDate: new Date().toISOString().split('T')[0],
          preferredCurrency: currentCurrency.code,
          isFreeTrialActive: false,
          complimentaryConsultations: 5,
        };
        setCurrentUser(profile);
        syncUserToPostgres({
          name: profile.name,
          avatarInitials: profile.avatarInitials,
          preferredCurrency: profile.preferredCurrency,
        });
      }
    });

    // Listen to Supabase Auth state (including GitHub OAuth redirect callback)
    const unsubscribeSupabase = onSupabaseAuthStateChange((sbProfile) => {
      if (sbProfile && !currentUser) {
        setCurrentUser(sbProfile);
        localStorage.setItem('fg_user', JSON.stringify(sbProfile));
        syncUserToPostgres({
          name: sbProfile.name,
          avatarInitials: sbProfile.avatarInitials,
          preferredCurrency: sbProfile.preferredCurrency,
        });
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeSupabase();
    };
  }, []);

  // Subscribe to Cloud Firestore changes in real-time when user is logged in
  useEffect(() => {
    if (!currentUser?.id) return;

    setSyncState('syncing');
    const unsubscribeSnapshot = subscribeToCloudFinanceData(
      currentUser.id,
      (cloudData) => {
        if (cloudData) {
          isRemoteSyncRef.current = true;
          if (cloudData.period) setPeriod(cloudData.period);
          if (cloudData.income) setIncomeItems(cloudData.income);
          if (cloudData.categories) setCategories(cloudData.categories);
          if (cloudData.transactions) setTransactions(cloudData.transactions);
          if (cloudData.balanceSheet) setBalanceSheet(cloudData.balanceSheet);
          if (cloudData.consultations) setConsultationBookings(cloudData.consultations);
          if (cloudData.activeCurrencyCode) {
            const cur = SUPPORTED_CURRENCIES.find((c) => c.code === cloudData.activeCurrencyCode);
            if (cur && cur.code !== currentCurrency.code) {
              setCurrentCurrency(cur);
            }
          }
          // Hash the incoming remote data to avoid sending it back
          lastSavedDataHashRef.current = JSON.stringify({
            period: cloudData.period,
            income: cloudData.income,
            categories: cloudData.categories,
            transactions: cloudData.transactions,
            balanceSheet: cloudData.balanceSheet,
            consultations: cloudData.consultations,
            activeCurrencyCode: cloudData.activeCurrencyCode || currentCurrency.code,
          });

          setTimeout(() => {
            isRemoteSyncRef.current = false;
          }, 1000);
        } else {
          // If Firestore is empty, check PostgreSQL
          getPostgresFinanceData().then((pgData) => {
            if (pgData) {
              isRemoteSyncRef.current = true;
              if (pgData.period) setPeriod(pgData.period);
              if (pgData.income) setIncomeItems(pgData.income);
              if (pgData.categories) setCategories(pgData.categories);
              if (pgData.transactions) setTransactions(pgData.transactions);
              if (pgData.balanceSheet) setBalanceSheet(pgData.balanceSheet);
              if (pgData.consultations) setConsultationBookings(pgData.consultations);
              if (pgData.activeCurrencyCode) {
                const cur = SUPPORTED_CURRENCIES.find((c) => c.code === pgData.activeCurrencyCode);
                if (cur && cur.code !== currentCurrency.code) {
                  setCurrentCurrency(cur);
                }
              }
              setTimeout(() => {
                isRemoteSyncRef.current = false;
              }, 1000);
            }
          }).catch(console.warn);
        }
        recordSyncSuccess();
      },
      (err) => {
        console.warn('Firestore subscription fallback:', err);
        getPostgresFinanceData().then((pgData) => {
          if (pgData) {
            isRemoteSyncRef.current = true;
            if (pgData.period) setPeriod(pgData.period);
            if (pgData.income) setIncomeItems(pgData.income);
            if (pgData.categories) setCategories(pgData.categories);
            if (pgData.transactions) setTransactions(pgData.transactions);
            if (pgData.balanceSheet) setBalanceSheet(pgData.balanceSheet);
            if (pgData.consultations) setConsultationBookings(pgData.consultations);
            setTimeout(() => {
              isRemoteSyncRef.current = false;
            }, 1000);
          }
        }).catch(console.warn);
        recordSyncSuccess();
      }
    );

    return () => unsubscribeSnapshot();
  }, [currentUser?.id]);

  // Automatically Save to LocalStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('fg_period', JSON.stringify(period));
    triggerSavedIndicator();
  }, [period]);

  useEffect(() => {
    localStorage.setItem('fg_income_items', JSON.stringify(incomeItems));
    triggerSavedIndicator();
  }, [incomeItems]);

  useEffect(() => {
    localStorage.setItem('fg_categories', JSON.stringify(categories));
    triggerSavedIndicator();
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('fg_transactions', JSON.stringify(transactions));
    triggerSavedIndicator();
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('fg_bookings', JSON.stringify(consultationBookings));
    triggerSavedIndicator();
  }, [consultationBookings]);

  // Sync to Cloud Firestore on change (debounced and guarded against remote ping-pong)
  useEffect(() => {
    if (isInitialMount.current || !currentUser?.id || isRemoteSyncRef.current) return;

    const currentPayload = {
      period,
      income: incomeItems,
      categories,
      transactions,
      balanceSheet,
      consultations: consultationBookings,
      activeCurrencyCode: currentCurrency.code,
    };
    const currentHash = JSON.stringify(currentPayload);

    // Skip cloud write if data is identical to what was already saved/loaded
    if (currentHash === lastSavedDataHashRef.current) {
      return;
    }

    setSyncState('syncing');
    const timeout = setTimeout(() => {
      lastSavedDataHashRef.current = currentHash;
      saveCloudFinanceData(currentUser.id, currentPayload)
        .then(() => {
          recordSyncSuccess();
        })
        .catch((err) => {
          console.warn('Cloud sync background warning:', err);
          recordSyncSuccess();
        });
      savePostgresFinanceData(currentPayload).catch((err) => {
        console.warn('PostgreSQL sync background warning:', err);
      });
    }, 2000);
    return () => clearTimeout(timeout);
  }, [period, incomeItems, categories, transactions, balanceSheet, consultationBookings, currentCurrency, currentUser?.id]);

  useEffect(() => {
    localStorage.setItem('fg_balance_sheet', JSON.stringify(balanceSheet));
    triggerSavedIndicator();
  }, [balanceSheet]);

  useEffect(() => {
    localStorage.setItem('fg_currency', JSON.stringify(currentCurrency));
  }, [currentCurrency]);

  useEffect(() => {
    localStorage.setItem('fg_language', currentLanguage);
  }, [currentLanguage]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('fg_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('fg_user');
    }
  }, [currentUser]);

  // Modals state
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  const [isSupabaseConfigOpen, setIsSupabaseConfigOpen] = useState(false);

  const handleOpenAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  // User-scoped login handler to prevent cross-account record leakage
  const handleUserLogin = (user: UserProfile) => {
    const currentKey = currentUser ? `fg_data_${currentUser.id}` : 'fg_data_guest';
    localStorage.setItem(
      currentKey,
      JSON.stringify({
        period,
        incomeItems,
        categories,
        transactions,
        balanceSheet,
        consultationBookings,
      })
    );

    setCurrentUser(user);
    syncUserToPostgres({
      name: user.name,
      avatarInitials: user.avatarInitials,
      preferredCurrency: user.preferredCurrency,
    });

    const userKey = `fg_data_${user.id}`;
    const savedData = localStorage.getItem(userKey);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.period) setPeriod(parsed.period);
        if (parsed.incomeItems) setIncomeItems(parsed.incomeItems);
        if (parsed.categories) setCategories(parsed.categories);
        if (parsed.transactions) setTransactions(parsed.transactions);
        if (parsed.balanceSheet) setBalanceSheet(parsed.balanceSheet);
        if (parsed.consultationBookings) setConsultationBookings(parsed.consultationBookings);
      } catch (e) {
        console.error(e);
      }
    } else {
      // If user had data in current session/local storage before logging in, preserve and bind to their new account!
      const fallbackLocalTransactions = localStorage.getItem('fg_transactions');
      const hasExistingSessionData = fallbackLocalTransactions && fallbackLocalTransactions !== '[]';

      if (!hasExistingSessionData && transactions.length === 0) {
        // Only initialize clean template if no session data exists
        setTransactions([]);
        setConsultationBookings([]);
        setBalanceSheet(DEFAULT_BALANCE_SHEET);
        setIncomeItems(
          INITIAL_INCOME_ITEMS.map((item) => ({ ...item, receivedAmount: 0, isReceived: false }))
        );
        setCategories(
          INITIAL_EXPENSE_CATEGORIES.map((cat) => ({
            ...cat,
            items: cat.items.map((item) => ({ ...item, actual: 0 })),
          }))
        );
      }
    }

    if (user.preferredCurrency) {
      const matched = SUPPORTED_CURRENCIES.find((c) => c.code === user.preferredCurrency);
      if (matched && matched.code !== currentCurrency.code) {
        setCurrentCurrency(matched);
      }
    }
  };

  const handleUserLogout = async () => {
    if (currentUser) {
      const currentKey = `fg_data_${currentUser.id}`;
      localStorage.setItem(
        currentKey,
        JSON.stringify({
          period,
          incomeItems,
          categories,
          transactions,
          balanceSheet,
          consultationBookings,
        })
      );
    }
    try {
      await logoutFirebase();
    } catch (e) {
      console.warn('Firebase logout warning:', e);
    }
    try {
      await signOutFromSupabase();
    } catch (e) {
      console.warn('Supabase logout warning:', e);
    }
    setCurrentUser(null);
    setTransactions([]);
    setIncomeItems(
      INITIAL_INCOME_ITEMS.map((item) => ({ ...item, receivedAmount: 0, isReceived: false }))
    );
    setCategories(
      INITIAL_EXPENSE_CATEGORIES.map((cat) => ({
        ...cat,
        items: cat.items.map((item) => ({ ...item, actual: 0 })),
      }))
    );
    setBalanceSheet(DEFAULT_BALANCE_SHEET);
  };

  // Quick inline edit state for Beginning Available Cash
  const [isEditingBeginningCash, setIsEditingBeginningCash] = useState(false);
  const [beginningCashInput, setBeginningCashInput] = useState(period.startingBankBalance.toString());

  // Update calculations module whenever currency changes
  useEffect(() => {
    setAppCurrency(currentCurrency);
  }, [currentCurrency]);

  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
  const isRtl = currentLanguage === 'ar';

  // Currency Converter: Proportional mathematical conversion across all ledger balances, income, expenses & balance sheet
  const handleCurrencyChange = (newCurrency: CurrencyInfo) => {
    if (newCurrency.code === currentCurrency.code) return;

    const oldRate = currentCurrency.rateAgainstUSD || 1.0;
    const newRate = newCurrency.rateAgainstUSD || 1.0;
    const ratio = newRate / oldRate;

    // Convert starting bank balance
    setPeriod((prev) => ({
      ...prev,
      startingBankBalance: Math.round(prev.startingBankBalance * ratio),
    }));

    // Convert income items
    setIncomeItems((prev) =>
      prev.map((item) => ({
        ...item,
        expectedAmount: Math.round(item.expectedAmount * ratio),
        receivedAmount: Math.round(item.receivedAmount * ratio),
      }))
    );

    // Convert expense categories & items
    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        items: cat.items.map((it) => ({
          ...it,
          budgeted: Math.round(it.budgeted * ratio),
          actual: Math.round(it.actual * ratio),
        })),
      }))
    );

    // Convert transactions
    setTransactions((prev) =>
      prev.map((tx) => ({
        ...tx,
        amount: Math.round(tx.amount * ratio),
      }))
    );

    // Convert balance sheet items
    setBalanceSheet((prev) => ({
      ...prev,
      assets: prev.assets.map((a) => ({
        ...a,
        value: Math.round(a.value * ratio),
      })),
      liabilities: prev.liabilities.map((l) => ({
        ...l,
        value: Math.round(l.value * ratio),
      })),
    }));

    setCurrentCurrency({
      ...newCurrency,
      decimals: 0,
    });
  };

  // Calculate live financial metrics
  const metrics = calculateFinancialMetrics(incomeItems, categories, period);

  // Handlers for expense categories & items
  const handleAddCategory = (newCat: {
    name: string;
    color?: string;
    iconName?: string;
    initialItemName?: string;
    initialBudget?: number;
  }) => {
    const catId = `cat-${Date.now()}`;
    const newCategory: ExpenseCategory = {
      id: catId,
      name: newCat.name.trim(),
      color: newCat.color || '#2563eb',
      iconName: newCat.iconName || 'ShoppingBag',
      items: newCat.initialItemName
        ? [
            {
              id: `exp-${Date.now()}`,
              categoryId: catId,
              name: newCat.initialItemName.trim(),
              budgeted: Math.round(newCat.initialBudget || 0),
              actual: 0,
              isFixed: false,
            },
          ]
        : [],
    };
    setCategories((prev) => [...prev, newCategory]);
  };

  const handleUpdateCategory = (categoryId: string, updates: Partial<ExpenseCategory>) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === categoryId ? { ...cat, ...updates } : cat))
    );
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
  };

  const handleUpdateCategoryItem = (categoryId: string, updatedItem: ExpenseItem) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          items: cat.items.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
        };
      })
    );
  };

  const handleDeleteExpenseItem = (categoryId: string, itemId: string) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          items: cat.items.filter((item) => item.id !== itemId),
        };
      })
    );
  };

  const handleAddExpenseItem = (categoryId: string, newItem: Omit<ExpenseItem, 'id'>) => {
    const id = `exp-${Date.now()}`;
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          items: [...cat.items, { ...newItem, id, categoryId }],
        };
      })
    );
  };

  // Handlers for income streams
  const handleUpdateIncomeItem = (updatedItem: IncomeItem) => {
    setIncomeItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
  };

  const handleDeleteIncomeItem = (itemId: string) => {
    setIncomeItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleAddIncomeItem = (newItem: Omit<IncomeItem, 'id'>) => {
    const id = `inc-${Date.now()}`;
    setIncomeItems((prev) => [...prev, { ...newItem, id }]);
  };

  const handleToggleIncomeReceived = (itemId: string) => {
    setIncomeItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const newReceived = !item.isReceived;
        return {
          ...item,
          isReceived: newReceived,
          receivedAmount: newReceived ? item.expectedAmount : 0,
        };
      })
    );
  };

  // Handlers for transactions
  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const id = `tx-${Date.now()}`;
    const tx = { ...newTx, id };
    setTransactions((prev) => [tx, ...prev]);

    // Update actual amounts in categories/incomes
    if (tx.type === 'expense' && tx.expenseItemId) {
      setCategories((prev) =>
        prev.map((cat) => {
          if (cat.id !== tx.categoryId) return cat;
          return {
            ...cat,
            items: cat.items.map((it) => {
              if (it.id !== tx.expenseItemId) return it;
              return { ...it, actual: it.actual + tx.amount };
            }),
          };
        })
      );
    } else if (tx.type === 'income' && tx.incomeItemId) {
      setIncomeItems((prev) =>
        prev.map((it) => {
          if (it.id !== tx.incomeItemId) return it;
          return { ...it, receivedAmount: it.receivedAmount + tx.amount, isReceived: true };
        })
      );
    }
  };

  const handleDeleteTransaction = (id: string) => {
    const txToDelete = transactions.find((t) => t.id === id);
    if (txToDelete) {
      if (txToDelete.type === 'expense' && txToDelete.expenseItemId) {
        setCategories((prev) =>
          prev.map((cat) => {
            if (cat.id !== txToDelete.categoryId) return cat;
            return {
              ...cat,
              items: cat.items.map((it) => {
                if (it.id !== txToDelete.expenseItemId) return it;
                return { ...it, actual: Math.max(0, it.actual - txToDelete.amount) };
              }),
            };
          })
        );
      } else if (txToDelete.type === 'income' && txToDelete.incomeItemId) {
        setIncomeItems((prev) =>
          prev.map((it) => {
            if (it.id !== txToDelete.incomeItemId) return it;
            const newReceived = Math.max(0, it.receivedAmount - txToDelete.amount);
            return { ...it, receivedAmount: newReceived, isReceived: newReceived > 0 };
          })
        );
      }
    }
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Date range updater
  const handleUpdatePeriodDates = (startDate: string, endDate: string, label?: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Today's day within the period
    const today = new Date();
    let currentDay = 1;
    if (today >= start && today <= end) {
      const elapsed = Math.ceil(Math.abs(today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      currentDay = Math.min(elapsed, totalDays);
    } else if (today > end) {
      currentDay = totalDays;
    }

    setPeriod((prev) => ({
      ...prev,
      startDate,
      endDate,
      totalDays: totalDays > 0 ? totalDays : 30,
      currentDay: currentDay > 0 ? currentDay : 1,
      label: label || prev.label,
      month: start.getMonth() + 1,
      year: start.getFullYear(),
    }));
  };

  // Beginning cash save handler
  const handleSaveBeginningCash = () => {
    const val = Math.round(parseFloat(beginningCashInput) || 0);
    setPeriod((prev) => ({ ...prev, startingBankBalance: val }));
    setIsEditingBeginningCash(false);
  };

  // Export report
  const handleExportCSV = () => {
    exportBudgetToCSV(period, metrics, incomeItems, categories, transactions, currentCurrency);
  };

  // Reset demo data to zero template
  const handleResetData = () => {
    if (window.confirm(isRtl ? 'هل ترغب في إعادة ضبط البيانات إلى القيم الأولية؟' : 'Reset all data to clean initial state?')) {
      setPeriod(INITIAL_PERIOD);
      setIncomeItems(INITIAL_INCOME_ITEMS);
      setCategories(INITIAL_EXPENSE_CATEGORIES);
      setTransactions(INITIAL_TRANSACTIONS);
      setBalanceSheet(DEFAULT_BALANCE_SHEET);
      localStorage.clear();
    }
  };

  // Book consultation handler
  const handleBookConsultation = (booking: Omit<ConsultationBooking, 'id' | 'createdAt'>) => {
    const newBooking: ConsultationBooking = {
      ...booking,
      id: `booking-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setConsultationBookings((prev) => [newBooking, ...prev]);
  };

  // Admin Dashboard booking status update
  const handleUpdateBookingStatus = (id: string, status: 'confirmed' | 'pending' | 'completed' | 'cancelled') => {
    setConsultationBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    );
  };

  const handleDeleteBooking = (id: string) => {
    setConsultationBookings((prev) => prev.filter((b) => b.id !== id));
  };

  // Beginning cash + Revenue - Expenses calculation
  const totalInflow = metrics.totalExpectedIncome;
  const totalOutflow = metrics.totalBudgetedExpense;
  const netVarianceForecast = totalInflow - totalOutflow;
  const endingProjectedCash = period.startingBankBalance + netVarianceForecast;

  // Scroll to Top state & smooth behavior
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // WhatsApp Support URL (enhance Technology)
  const whatsappNumber = '97450445575';
  const whatsappMessage = encodeURIComponent(
    isRtl
      ? 'مرحباً enhance Technology، أحتاج مساعدة أو استفسار بخصوص تطبيق إدارة الميزانية والمالية.'
      : 'Hello enhance Technology, I would like assistance regarding the Financial Management App.'
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'} 
      className={`relative min-h-screen bg-slate-950/5 flex font-sans text-slate-800 selection:bg-blue-600 selection:text-white ${isRtl ? 'font-arabic' : ''}`}
    >
      {/* Dynamic Glassmorphic Financial Illustration Background (Light Tech Mesh & Flow Orbs) */}
      <DynamicFinancialBackground />

      {/* Modern High-Tech Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentLanguage={currentLanguage}
        currentUser={currentUser}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        onOpenConsultationModal={() => setIsConsultationModalOpen(true)}
        onOpenReportsModal={() => setIsReportsModalOpen(true)}
        onOpenAddTransaction={() => setIsEntryModalOpen(true)}
      />

      {/* Main App Canvas */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Header Controls */}
        <Navbar
          period={period}
          currentCurrency={currentCurrency}
          onSelectCurrency={handleCurrencyChange}
          currentLanguage={currentLanguage}
          onSelectLanguage={setCurrentLanguage}
          currentUser={currentUser}
          onOpenAuthModal={handleOpenAuthModal}
          onLogout={handleUserLogout}
          onOpenConsultationModal={() => setIsConsultationModalOpen(true)}
          onOpenAddModal={() => setIsEntryModalOpen(true)}
          onExportReport={handleExportCSV}
          onOpenReportsModal={() => setIsReportsModalOpen(true)}
          onResetData={handleResetData}
          onOpenPeriodModal={() => setIsPeriodModalOpen(true)}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onToggleDesktopSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
          isSidebarCollapsed={isSidebarCollapsed}
          isSaved={isSaved}
          lastSyncedAt={lastSyncedAt}
          syncState={syncState}
          onManualSync={handleManualSync}
          recordStats={{
            incomeCount: incomeItems.length,
            expensesCount: categories.reduce((acc, cat) => acc + cat.items.length, 0),
            transactionsCount: transactions.length,
            bookingsCount: consultationBookings.length,
          }}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4.5 lg:p-6 space-y-4 sm:space-y-5">
        {/* Header Ribbon & View Title */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 font-arabic">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/80 shadow-2xs">
                {t.appSubtitle}
              </span>
              <span className="text-[10px] font-bold text-slate-500 font-mono">
                {period.label} • {period.totalDays - period.currentDay} {t.daysLeft}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-arabic drop-shadow-xs">
              {activeTab === 'overview' && t.overview}
              {activeTab === 'breakdown' && t.breakdown}
              {activeTab === 'accounting' && (isRtl ? 'شجرة الحسابات والدورة المحاسبية المزدوجة' : 'Chart of Accounts & Double-Entry Ledger')}
              {activeTab === 'balancesheet' && (isRtl ? 'الميزانية العمومية والمركز المالي' : 'Balance Sheet & Financial Position')}
              {activeTab === 'reports' && (isRtl ? 'مركز التقارير المالية ومقارنة الفترات' : 'Financial Reports & Period Analysis')}
              {activeTab === 'cashflow' && t.cashflow}
              {activeTab === 'transactions' && t.transactions}
              {activeTab === 'consultations' && (isRtl ? 'جدول الاستشارات والمواعيد المالية' : 'Consultations Schedule & Client Bookings')}
              {activeTab === 'simulator' && t.simulator}
              {activeTab === 'admin' && (isRtl ? 'لوحة تحكم المدير - المواعيد والاستشارات' : 'Admin Control Panel')}
            </h1>
          </div>

          {/* Clean Quick Export & Period Actions (No redundant duplicates) */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              title={t.exportReport}
            >
              <Download className="w-3.5 h-3.5 text-blue-600" strokeWidth={1.75} />
              <span>{t.exportReport}</span>
            </button>
          </div>
        </header>

        {/* 1. OVERVIEW VIEW (شامل لكافة الملخصات، الفائض المتوقع والفعلي، معدل الإنفاق، وتوقعات السيولة) */}
        {activeTab === 'overview' && (
          <ExecutiveOverview
            metrics={metrics}
            period={period}
            incomeItems={incomeItems}
            categories={categories}
            transactions={transactions}
            currentLanguage={currentLanguage}
            onNavigateTab={setActiveTab}
            isEditingBeginningCash={isEditingBeginningCash}
            setIsEditingBeginningCash={setIsEditingBeginningCash}
            beginningCashInput={beginningCashInput}
            setBeginningCashInput={setBeginningCashInput}
            handleSaveBeginningCash={handleSaveBeginningCash}
          />
        )}

        {/* 2. BREAKDOWN TAB (الموازنة مقابل الفعلي: فقط جدول الإيرادات وجدول المصروفات كما طُلب) */}
        {activeTab === 'breakdown' && (
          <div className="space-y-6 font-arabic" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* 1. Editable Monthly Revenue & Cash Inflow Table */}
            <section aria-labelledby="breakdown-revenue-heading">
              <EditableIncomeTable
                incomeItems={incomeItems}
                currentLanguage={currentLanguage}
                onUpdateIncomeItem={handleUpdateIncomeItem}
                onDeleteIncomeItem={handleDeleteIncomeItem}
                onAddIncomeItem={handleAddIncomeItem}
                onToggleReceived={handleToggleIncomeReceived}
              />
            </section>

            {/* 2. Expense Budget vs Actual Breakdown Table */}
            <section aria-labelledby="breakdown-expenses-heading">
              <ExpenseBreakdown
                categories={categories}
                period={period}
                currentLanguage={currentLanguage}
                onUpdateCategoryItem={handleUpdateCategoryItem}
                onDeleteItem={handleDeleteExpenseItem}
                onAddItem={(catId) => setIsEntryModalOpen(true)}
                onAddExpenseItemWithDetails={handleAddExpenseItem}
                onAddCategory={handleAddCategory}
                onUpdateCategory={handleUpdateCategory}
                onDeleteCategory={handleDeleteCategory}
                onUpdatePeriodDateRange={handleUpdatePeriodDates}
                onOpenPeriodModal={() => setIsPeriodModalOpen(true)}
              />
            </section>
          </div>
        )}

        {/* 3. BALANCE SHEET VIEW (الميزانية العمومية: الأصول، المطلوبات، وصافي رأس المال) */}
        {activeTab === 'balancesheet' && (
          <BalanceSheetView
            currentLanguage={currentLanguage}
            currentCurrency={currentCurrency}
            balanceSheet={balanceSheet}
            onUpdateBalanceSheet={setBalanceSheet}
          />
        )}

        {/* 4. ADMIN DASHBOARD: APPOINTMENTS & CONSULTATION CONTROL */}
        {activeTab === 'admin' && (
          <AdminDashboard
            bookings={consultationBookings}
            currentLanguage={currentLanguage}
            currentCurrency={currentCurrency}
            onUpdateBookingStatus={handleUpdateBookingStatus}
            onDeleteBooking={handleDeleteBooking}
          />
        )}

        {/* 5. REPORTS & FINANCIAL DASHBOARD WITH CIRCLE OF EXPENSES */}
        {activeTab === 'reports' && (
          <FinancialReportsDashboard
            period={period}
            incomeItems={incomeItems}
            categories={categories}
            transactions={transactions}
            metrics={metrics}
            currentLanguage={currentLanguage}
            currentCurrency={currentCurrency}
            onOpenStatementsModal={() => setIsReportsModalOpen(true)}
          />
        )}

        {/* 6. CASH FLOW PROJECTIONS */}
        {activeTab === 'cashflow' && (
          <CashFlowProjections
            metrics={metrics}
            period={period}
            incomeItems={incomeItems}
            categories={categories}
            transactions={transactions}
            currentLanguage={currentLanguage}
            currentCurrency={currentCurrency}
          />
        )}

        {/* 7. TRANSACTIONS LEDGER */}
        {activeTab === 'transactions' && (
          <TransactionLedger
            transactions={transactions}
            categories={categories}
            incomeItems={incomeItems}
            currentLanguage={currentLanguage}
            onAddTransaction={() => setIsEntryModalOpen(true)}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {/* 8. ACCOUNTING CYCLE & CHART OF ACCOUNTS VIEW */}
        {activeTab === 'accounting' && (
          <AccountingCycleView
            period={period}
            transactions={transactions}
            categories={categories}
            incomeItems={incomeItems}
            metrics={metrics}
            currentLanguage={currentLanguage}
            currentCurrency={currentCurrency}
          />
        )}

        {/* 9. CONSULTATIONS SCHEDULE & APPOINTMENTS VIEW */}
        {activeTab === 'consultations' && (
          <ConsultationsScheduleView
            bookings={consultationBookings}
            onAddBooking={(b) => setConsultationBookings((prev) => [b, ...prev])}
            onUpdateBookingStatus={handleUpdateBookingStatus}
            onAddTransaction={handleAddTransaction}
            currentLanguage={currentLanguage}
            currentCurrency={currentCurrency}
          />
        )}

        {/* 10. BUDGET SIMULATOR */}
        {activeTab === 'simulator' && (
          <BudgetSimulator
            metrics={metrics}
            period={period}
            incomeItems={incomeItems}
            categories={categories}
            currentLanguage={currentLanguage}
            currentCurrency={currentCurrency}
          />
        )}

        {/* 11. SYSTEM SETTINGS & DATA CONTROL */}
        {activeTab === 'settings' && (
          <SettingsView
            period={period}
            categories={categories}
            incomeItems={incomeItems}
            transactions={transactions}
            balanceSheet={balanceSheet}
            currentCurrency={currentCurrency}
            currentUser={currentUser}
            currentLanguage={currentLanguage}
            onUpdatePeriod={setPeriod}
            onUpdateCategories={setCategories}
            onUpdateIncomeItems={setIncomeItems}
            onUpdateTransactions={setTransactions}
            onUpdateBalanceSheet={setBalanceSheet}
            onSelectCurrency={handleCurrencyChange}
            onOpenAuthModal={handleOpenAuthModal}
            onLogout={handleUserLogout}
            onOpenSupabaseConfig={() => setIsSupabaseConfigOpen(true)}
          />
        )}
      </main>

      {/* Geometric Footer */}
      <footer className="h-10 bg-white border-t border-slate-200 flex items-center justify-between px-4 sm:px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0 mt-auto">
        <span>© {period.year} {t.appTitle} SYSTEMS</span>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline">Active: {currentCurrency.code} ({currentCurrency.symbol})</span>
          <span className="flex items-center gap-1 text-emerald-600">
            <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block animate-pulse" />
            System Operational
          </span>
        </div>
      </footer>

      {/* Transaction Slide-Over Side Panel (Non-blocking so main screen stays visible) */}
      <TransactionSidePanel
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        categories={categories}
        incomeItems={incomeItems}
        recentTransactions={transactions}
        currentLanguage={currentLanguage}
        currentCurrency={currentCurrency}
        onAddExpenseItem={handleAddExpenseItem}
        onAddIncomeItem={handleAddIncomeItem}
        onAddTransaction={handleAddTransaction}
      />

      {/* Period Configuration Modal */}
      <PeriodModal
        isOpen={isPeriodModalOpen}
        onClose={() => setIsPeriodModalOpen(false)}
        period={period}
        onUpdatePeriod={setPeriod}
      />

      {/* User Auth Modal (Register & Login) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        initialMode={authModalMode}
        currentLanguage={currentLanguage}
        onLogin={handleUserLogin}
      />

      {/* Financial Consultation / Talk to Expert Modal */}
      <ConsultationModal
        isOpen={isConsultationModalOpen}
        onClose={() => setIsConsultationModalOpen(false)}
        metrics={metrics}
        currentCurrency={currentCurrency}
        currentUser={currentUser}
        onOpenAuth={() => {
          setIsConsultationModalOpen(false);
          handleOpenAuthModal('register');
        }}
        onBookConsultation={handleBookConsultation}
      />

      {/* Standard Financial Reports & Statements Modal */}
      <FinancialReportsModal
        isOpen={isReportsModalOpen}
        onClose={() => setIsReportsModalOpen(false)}
        period={period}
        incomeItems={incomeItems}
        categories={categories}
        transactions={transactions}
        metrics={metrics}
        currentLanguage={currentLanguage}
      />

      {/* Supabase Connection & GitHub Setup Modal */}
      <SupabaseConfigModal
        isOpen={isSupabaseConfigOpen}
        onClose={() => setIsSupabaseConfigOpen(false)}
        currentLanguage={currentLanguage}
      />
      </div>
    </div>
  );
}
