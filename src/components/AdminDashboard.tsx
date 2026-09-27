import React, { useState } from 'react';
import { ConsultationBooking, CurrencyInfo, UserProfile } from '../types';
import { formatCurrency } from '../utils/calculations';
import { LanguageCode, TRANSLATIONS } from '../i18n/translations';
import { 
  ShieldCheck, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Search, 
  Filter, 
  PhoneCall, 
  Mail, 
  DollarSign, 
  Sparkles,
  ArrowRight,
  RefreshCw,
  Sliders,
  Database
} from 'lucide-react';

interface AdminDashboardProps {
  bookings: ConsultationBooking[];
  currentLanguage: LanguageCode;
  currentCurrency: CurrencyInfo;
  onUpdateBookingStatus: (id: string, status: ConsultationBooking['status']) => void;
  onDeleteBooking: (id: string) => void;
  onOpenSupabaseConfig?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  bookings,
  currentLanguage,
  currentCurrency,
  onUpdateBookingStatus,
  onDeleteBooking,
  onOpenSupabaseConfig,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<ConsultationBooking | null>(null);

  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
  const isAr = currentLanguage === 'ar';

  const filteredBookings = bookings.filter((b) => {
    const matchesFilter = filterStatus === 'all' || b.status === filterStatus;
    const matchesSearch =
      b.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.expertName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.userEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b) => b.status === 'pending').length;
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed').length;
  const totalRevenue = bookings
    .filter((b) => b.status === 'confirmed' || b.status === 'completed')
    .reduce((acc, b) => acc + (b.fee || 0), 0);

  return (
    <div className="space-y-6">
      {/* Admin Top Header Banner */}
      <div className="bg-slate-900 border border-slate-800 text-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-blue-600 text-white border border-blue-400/40 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black uppercase tracking-wider text-white">
                  {isAr ? 'لوحة تحكم مدير التطبيق - إدارة المواعيد والاستشارات' : 'Application Admin Control Panel - Appointments & Consultations'}
                </h1>
                <span className="px-2 py-0.5 text-[9px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {isAr ? 'مدير النظام' : 'Super Admin'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                {isAr ? 'استقبال وتأكيد وجدولة مواعيد الاستشارات المالية المحجوزة من العملاء' : 'Manage, review, approve, and schedule client financial consultation bookings in real-time'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenSupabaseConfig && (
              <button
                type="button"
                onClick={onOpenSupabaseConfig}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/40 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Database className="w-3.5 h-3.5" />
                <span>{isAr ? 'ضبط إعدادات Supabase السحابية' : 'Configure Supabase Cloud'}</span>
              </button>
            )}
            <span className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-xs font-mono text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span>{isAr ? 'نظام الحجز مباشر' : 'Live Booking Webhook Active'}</span>
            </span>
          </div>
        </div>

        {/* 4 Stat Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800">
          <div className="p-3 bg-slate-800/60 border border-slate-700">
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-widest">
              {isAr ? 'إجمالي المواعيد' : 'Total Bookings'}
            </span>
            <span className="text-2xl font-black text-white font-mono mt-1 block">
              {totalBookings}
            </span>
          </div>

          <div className="p-3 bg-amber-950/30 border border-amber-500/40">
            <span className="text-[10px] font-black uppercase text-amber-400 block tracking-widest">
              {isAr ? 'قيد الانتظار' : 'Pending Requests'}
            </span>
            <span className="text-2xl font-black text-amber-300 font-mono mt-1 block">
              {pendingBookings}
            </span>
          </div>

          <div className="p-3 bg-emerald-950/30 border border-emerald-500/40">
            <span className="text-[10px] font-black uppercase text-emerald-400 block tracking-widest">
              {isAr ? 'مواعيد مؤكدة' : 'Confirmed Sessions'}
            </span>
            <span className="text-2xl font-black text-emerald-300 font-mono mt-1 block">
              {confirmedBookings}
            </span>
          </div>

          <div className="p-3 bg-blue-950/30 border border-blue-500/40">
            <span className="text-[10px] font-black uppercase text-blue-400 block tracking-widest">
              {isAr ? 'إيرادات الاستشارات' : 'Consultation Inflow'}
            </span>
            <span className="text-2xl font-black text-white font-mono mt-1 block">
              {formatCurrency(totalRevenue)}
            </span>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Status Filters */}
      <div className="bg-white border border-slate-300 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={isAr ? 'بحث بالاسم، الخبير، أو الموضوع...' : 'Search by client, expert, or topic...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>{isAr ? 'تصفية الحالة:' : 'Filter:'}</span>
          </span>
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                filterStatus === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'all' && (isAr ? 'الكل' : 'All')}
              {st === 'pending' && (isAr ? 'قيد الانتظار' : 'Pending')}
              {st === 'confirmed' && (isAr ? 'مؤكد' : 'Confirmed')}
              {st === 'completed' && (isAr ? 'مكتمل' : 'Completed')}
              {st === 'cancelled' && (isAr ? 'ملغي' : 'Cancelled')}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List Table */}
      <div className="bg-white border border-slate-300 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-[10px] font-black text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">{isAr ? 'العميل' : 'Client Profile'}</th>
                <th className="py-3 px-4">{isAr ? 'الخبير المالي' : 'Assigned Expert'}</th>
                <th className="py-3 px-4">{isAr ? 'التاريخ والوقت' : 'Date & Time Slot'}</th>
                <th className="py-3 px-4">{isAr ? 'موضوع الاستشارة' : 'Consultation Topic'}</th>
                <th className="py-3 px-4 text-right">{isAr ? 'الرسوم' : 'Session Fee'}</th>
                <th className="py-3 px-4 text-center">{isAr ? 'الحالة' : 'Status'}</th>
                <th className="py-3 px-4 text-center">{isAr ? 'إجراءات المدير' : 'Admin Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-sans">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-bold text-xs">
                    {isAr ? 'لا توجد مواعيد استشارات مسجلة حالياً.' : 'No consultation appointments recorded yet.'}
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-xs">{b.userName}</div>
                      <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{b.userEmail}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-blue-700">{b.expertName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{b.expertCredentials || 'CFP® / CFA®'}</div>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-slate-900">{b.date}</div>
                      <div className="text-[10px] text-slate-500">{b.timeSlot}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-800 font-medium block max-w-xs truncate" title={b.topic}>
                        {b.topic}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                      {formatCurrency(b.fee)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                          b.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : b.status === 'pending'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : b.status === 'completed'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}
                      >
                        {b.status === 'confirmed' && (isAr ? 'مؤكد' : 'Confirmed')}
                        {b.status === 'pending' && (isAr ? 'قيد الانتظار' : 'Pending')}
                        {b.status === 'completed' && (isAr ? 'مكتمل' : 'Completed')}
                        {b.status === 'cancelled' && (isAr ? 'ملغي' : 'Cancelled')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {b.status !== 'confirmed' && (
                          <button
                            onClick={() => onUpdateBookingStatus(b.id, 'confirmed')}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase transition-colors"
                            title={isAr ? 'تأكيد الموعد' : 'Confirm'}
                          >
                            {isAr ? 'تأكيد' : 'Confirm'}
                          </button>
                        )}
                        {b.status === 'confirmed' && (
                          <button
                            onClick={() => onUpdateBookingStatus(b.id, 'completed')}
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold uppercase transition-colors"
                            title={isAr ? 'إنهاء الجلسة' : 'Complete'}
                          >
                            {isAr ? 'إنهاء' : 'Complete'}
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteBooking(b.id)}
                          className="px-2 py-1 bg-slate-200 hover:bg-red-100 hover:text-red-700 text-slate-700 text-[10px] font-bold uppercase transition-colors"
                          title={isAr ? 'حذف' : 'Delete'}
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
