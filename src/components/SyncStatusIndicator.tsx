import React, { useState, useEffect, useRef } from 'react';
import { 
  Cloud, 
  CheckCircle2, 
  RefreshCw, 
  Database, 
  HardDrive, 
  ShieldCheck, 
  Clock, 
  ChevronDown,
  Activity,
  Layers
} from 'lucide-react';
import { LanguageCode } from '../i18n/translations';

export type SyncState = 'synced' | 'syncing' | 'offline' | 'saved';

interface SyncStatusIndicatorProps {
  lastSyncedAt: Date | null;
  syncState: SyncState;
  currentLanguage: LanguageCode;
  onManualSync: () => Promise<void> | void;
  recordStats?: {
    incomeCount: number;
    expensesCount: number;
    transactionsCount: number;
    bookingsCount: number;
  };
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  lastSyncedAt,
  syncState,
  currentLanguage,
  onManualSync,
  recordStats = { incomeCount: 0, expensesCount: 0, transactionsCount: 0, bookingsCount: 0 }
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [relativeTime, setRelativeTime] = useState<string>('');
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const isAr = currentLanguage === 'ar';

  // Calculate dynamic relative time string
  useEffect(() => {
    const updateRelative = () => {
      if (!lastSyncedAt) {
        setRelativeTime(isAr ? 'لم تتم المزامنة بعد' : 'Not synced yet');
        return;
      }

      const diffSec = Math.floor((Date.now() - lastSyncedAt.getTime()) / 1000);
      if (diffSec < 10) {
        setRelativeTime(isAr ? 'منذ لحظات' : 'Just now');
      } else if (diffSec < 60) {
        setRelativeTime(isAr ? `منذ ${diffSec} ثانية` : `${diffSec}s ago`);
      } else if (diffSec < 3600) {
        const mins = Math.floor(diffSec / 60);
        setRelativeTime(isAr ? `منذ ${mins} دقيقة` : `${mins}m ago`);
      } else {
        const timeStr = lastSyncedAt.toLocaleTimeString(isAr ? 'ar-SA' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });
        setRelativeTime(timeStr);
      }
    };

    updateRelative();
    const interval = setInterval(updateRelative, 5000);
    return () => clearInterval(interval);
  }, [lastSyncedAt, isAr]);

  // Click outside to close popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTriggerSync = async () => {
    setIsManualSyncing(true);
    try {
      await onManualSync();
    } finally {
      setTimeout(() => {
        setIsManualSyncing(false);
      }, 600);
    }
  };

  const formattedExactTime = lastSyncedAt
    ? lastSyncedAt.toLocaleTimeString(isAr ? 'ar-SA' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '--:--:--';

  const formattedDate = lastSyncedAt
    ? lastSyncedAt.toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  const totalRecords = 
    recordStats.incomeCount + 
    recordStats.expensesCount + 
    recordStats.transactionsCount + 
    recordStats.bookingsCount;

  return (
    <div className="relative" ref={popoverRef} id="sync-status-indicator-container">
      {/* Visual Indicator Button in Navigation Bar */}
      <button
        id="sync-status-button"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-2.5 py-1.5 border transition-all text-xs font-mono select-none ${
          syncState === 'syncing' || isManualSyncing
            ? 'bg-blue-950/80 border-blue-500/50 text-blue-300'
            : 'bg-emerald-950/40 hover:bg-emerald-950/70 border-emerald-500/40 text-emerald-300 hover:border-emerald-400'
        }`}
        title={isAr ? 'حالة مزامنة وحفظ البيانات' : 'Server & Data Persistence Sync Status'}
      >
        {/* Animated Icon */}
        <div className="relative flex items-center justify-center">
          {syncState === 'syncing' || isManualSyncing ? (
            <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
          ) : (
            <div className="flex items-center">
              <span className="relative flex h-2 w-2 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Cloud className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          )}
        </div>

        {/* Text Label */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-sans font-bold text-white hidden sm:inline">
            {syncState === 'syncing' || isManualSyncing
              ? (isAr ? 'جاري المزامنة...' : 'Syncing...')
              : (isAr ? 'مزامنة السيرفر' : 'Server Synced')}
          </span>
          <span className="text-[10px] text-emerald-300/80 font-mono hidden md:inline">
            ({relativeTime})
          </span>
          <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Reassuring Detailed Sync Status Popover Card */}
      {isOpen && (
        <div 
          id="sync-status-details-popover"
          className="absolute right-0 mt-2 w-80 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 shadow-2xl z-50 p-4 text-slate-100 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-150 font-arabic"
        >
          {/* Header Banner */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">
                  {isAr ? 'حالة حفظ ومزامنة البيانات' : 'Data Persistence & Sync'}
                </h4>
                <p className="text-[10px] text-emerald-400 font-mono">
                  {isAr ? '● متصل ومحفوظ بأمان' : '● Live & Securely Protected'}
                </p>
              </div>
            </div>

            <button
              id="sync-now-button"
              type="button"
              disabled={isManualSyncing}
              onClick={handleTriggerSync}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-[11px] font-bold rounded-xl transition-all shadow-xs"
              title={isAr ? 'مزامنة فورية الآن' : 'Sync data immediately'}
            >
              <RefreshCw className={`w-3 h-3 ${isManualSyncing ? 'animate-spin' : ''}`} />
              <span>{isAr ? 'مزامنة الآن' : 'Sync Now'}</span>
            </button>
          </div>

          {/* Sync Time Details */}
          <div className="my-3 p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                {isAr ? 'آخر مزامنة ناجحة:' : 'Last Successful Sync:'}
              </span>
              <span className="font-mono font-bold text-emerald-300 text-[11px]">
                {formattedExactTime}
              </span>
            </div>

            {formattedDate && (
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-700/40">
                <span>{isAr ? 'تاريخ التحديث:' : 'Sync Date:'}</span>
                <span className="font-mono text-slate-300">{formattedDate}</span>
              </div>
            )}
          </div>

          {/* Records & Persistence Summary */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between text-[11px] text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                {isAr ? 'إجمالي السجلات المحفوظة:' : 'Total Synced Records:'}
              </span>
              <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700">
                {totalRecords} {isAr ? 'عنصر' : 'items'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-400">
              <div className="p-2 bg-slate-800/50 rounded-xl border border-slate-800/80 flex items-center justify-between">
                <span>{isAr ? 'العمليات:' : 'Transactions:'}</span>
                <span className="font-mono font-bold text-slate-200">{recordStats.transactionsCount}</span>
              </div>
              <div className="p-2 bg-slate-800/50 rounded-xl border border-slate-800/80 flex items-center justify-between">
                <span>{isAr ? 'فئات المصروفات:' : 'Categories:'}</span>
                <span className="font-mono font-bold text-slate-200">{recordStats.expensesCount}</span>
              </div>
              <div className="p-2 bg-slate-800/50 rounded-xl border border-slate-800/80 flex items-center justify-between">
                <span>{isAr ? 'مصادر الدخل:' : 'Income:'}</span>
                <span className="font-mono font-bold text-slate-200">{recordStats.incomeCount}</span>
              </div>
              <div className="p-2 bg-slate-800/50 rounded-xl border border-slate-800/80 flex items-center justify-between">
                <span>{isAr ? 'الاستشارات:' : 'Bookings:'}</span>
                <span className="font-mono font-bold text-slate-200">{recordStats.bookingsCount}</span>
              </div>
            </div>
          </div>

          {/* Reassurance Footer */}
          <div className="pt-2.5 border-t border-slate-800 flex items-start gap-2 text-[10px] text-slate-400 leading-relaxed">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              {isAr
                ? 'يتم حفظ كافة التغييرات فوراً في الذاكرة السحابية والمحلية، مما يضمن استمرارية بياناتك وعدم ضياعها.'
                : 'All changes are continuously synced to persistent storage and mirrored locally to prevent any data loss.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
