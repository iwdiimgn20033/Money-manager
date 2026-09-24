import React, { useState, useMemo } from 'react';
import { 
  ConsultationBooking, 
  CurrencyInfo, 
  FinancialExpert, 
  Transaction 
} from '../types';
import { LanguageCode } from '../i18n/translations';
import { formatCurrency } from '../utils/calculations';
import {
  Calendar,
  Clock,
  User,
  Plus,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Search,
  Filter,
  DollarSign,
  Download,
  Printer,
  Sparkles,
  Phone,
  Mail,
  FileText,
  CreditCard,
  Building,
  UserCheck
} from 'lucide-react';

interface ConsultationsScheduleViewProps {
  bookings: ConsultationBooking[];
  onAddBooking: (booking: ConsultationBooking) => void;
  onUpdateBookingStatus: (bookingId: string, status: ConsultationBooking['status']) => void;
  onAddTransaction?: (transaction: Omit<Transaction, 'id'>) => void;
  currentLanguage?: LanguageCode;
  currentCurrency?: CurrencyInfo;
}

export const DEFAULT_EXPERTS: FinancialExpert[] = [
  {
    id: 'exp-1',
    name: 'د. طارق المنصور',
    title: 'مستشار مالي معتمد وشريك تنفيذي',
    credentials: 'CFA®, CPA',
    specialty: 'إعادة هيكلة السيولة والتخطيط المالي للشركات',
    rating: 4.95,
    reviewsCount: 142,
    experienceYears: 16,
    hourlyRate: 150,
    languages: ['العربية', 'English'],
    avatarBg: 'bg-blue-600',
    avatarInitials: 'ط.م',
    bio: 'خبير في توجيه التدفقات النقدية والميزانيات التقديرية للشركات والأفراد',
    isOnline: true,
  },
  {
    id: 'exp-2',
    name: 'أ. سارة القحطاني',
    title: 'أخصائية التخطيط المالي والموازنات',
    credentials: 'CFP®, MBA',
    specialty: 'إدارة الثروات الشخصية، تقليص النفقات والاستثمار السائل',
    rating: 4.9,
    reviewsCount: 98,
    experienceYears: 11,
    hourlyRate: 120,
    languages: ['العربية', 'English'],
    avatarBg: 'bg-emerald-600',
    avatarInitials: 'س.ق',
    bio: 'مستشارة متخصصة في خطط الإنفاق الاستراتيجي وبناء الفوائض النقدية',
    isOnline: true,
  },
  {
    id: 'exp-3',
    name: 'م. فهد السبيعي',
    title: 'مستشار دراسات الجدوى والنمذجة المالية',
    credentials: 'CMA, FMVA',
    specialty: 'تحليل الانحرافات والمحاكاة المالية للمشاريع',
    rating: 4.88,
    reviewsCount: 76,
    experienceYears: 9,
    hourlyRate: 135,
    languages: ['العربية'],
    avatarBg: 'bg-purple-600',
    avatarInitials: 'ف.س',
    bio: 'متخصص في بناء نماذج التدفقات المستقبلية وتحليل الحساسية المالية',
    isOnline: false,
  },
];

export const ConsultationsScheduleView: React.FC<ConsultationsScheduleViewProps> = ({
  bookings,
  onAddBooking,
  onUpdateBookingStatus,
  onAddTransaction,
  currentLanguage = 'ar',
  currentCurrency,
}) => {
  const isAr = currentLanguage === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ConsultationBooking['status']>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  // New Booking Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [selectedExpertId, setSelectedExpertId] = useState(DEFAULT_EXPERTS[0].id);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState('10:00 AM');
  const [topic, setTopic] = useState('');
  const [fee, setFee] = useState<number>(DEFAULT_EXPERTS[0].hourlyRate);
  const [notes, setNotes] = useState('');

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchSearch =
        searchQuery === '' ||
        b.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.expertName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === 'all' || b.status === statusFilter;
      const matchDate = dateFilter === '' || b.date === dateFilter;

      return matchSearch && matchStatus && matchDate;
    });
  }, [bookings, searchQuery, statusFilter, dateFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = bookings.length;
    const confirmed = bookings.filter((b) => b.status === 'confirmed').length;
    const completed = bookings.filter((b) => b.status === 'completed').length;
    const pending = bookings.filter((b) => b.status === 'pending').length;
    const totalRevenue = bookings
      .filter((b) => b.status === 'completed' || b.status === 'confirmed')
      .reduce((sum, b) => sum + (b.fee || 0), 0);

    return { total, confirmed, completed, pending, totalRevenue };
  }, [bookings]);

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !topic) return;

    const expert = DEFAULT_EXPERTS.find((ex) => ex.id === selectedExpertId) || DEFAULT_EXPERTS[0];

    const newBooking: ConsultationBooking = {
      id: `booking-${Date.now()}`,
      expertId: expert.id,
      expertName: expert.name,
      expertCredentials: expert.credentials,
      userId: `user-${Date.now()}`,
      userName: clientName,
      userEmail: clientEmail,
      date: bookingDate,
      timeSlot: bookingTime,
      topic,
      status: 'confirmed',
      fee: fee,
      currencyCode: currentCurrency?.code || 'USD',
      createdAt: new Date().toISOString(),
      clientNotes: notes,
    };

    onAddBooking(newBooking);

    // Reset Form
    setClientName('');
    setClientEmail('');
    setTopic('');
    setNotes('');
    setIsModalOpen(false);
  };

  const handleCompleteAndRecordRevenue = (booking: ConsultationBooking) => {
    onUpdateBookingStatus(booking.id, 'completed');

    // Automatically record revenue transaction if onAddTransaction is available
    if (onAddTransaction && booking.fee > 0) {
      onAddTransaction({
        date: booking.date || new Date().toISOString().split('T')[0],
        description: `إيراد استشارة: ${booking.topic} (${booking.userName})`,
        amount: booking.fee,
        type: 'income',
        categoryId: 'income-consulting',
      });
    }
  };

  const handleExportCSV = () => {
    let csv = 'data:text/csv;charset=utf-8,';
    csv += 'Booking ID,Client Name,Client Email,Expert,Date,Time Slot,Topic,Status,Fee,Currency\n';
    bookings.forEach((b) => {
      csv += `"${b.id}","${b.userName}","${b.userEmail}","${b.expertName}","${b.date}","${b.timeSlot}","${b.topic}","${b.status}",${b.fee},"${b.currencyCode}"\n`;
    });
    const encoded = encodeURI(csv);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `consultations-schedule-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="consultations-schedule-container" className="space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
      {/* 1. Header Banner */}
      <div className="bg-slate-900 text-white p-6 border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">
              {isAr ? 'نظام إدارة وجدولة الاستشارات والمواعيد' : 'Consultations Schedule & Booking Management'}
            </h2>
          </div>
          <p className="text-lg font-black text-white mt-1">
            {isAr
              ? 'تنظيم المواعيد الاستشارية، تتبع حالة الجلسات، والربط المالي التلقائي مع شجرة الحسابات والإيرادات'
              : 'Organize client appointments, track session milestones, and auto-sync fees with financial ledger'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-300" />
            <span>{isAr ? 'طباعة الجدول' : 'Print'}</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-300" />
            <span>{isAr ? 'تصدير CSV' : 'Export CSV'}</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'حجز موعد استشارة جديد' : 'New Appointment'}</span>
          </button>
        </div>
      </div>

      {/* 2. STATS KPI RIBBON */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-slate-200 p-4 shadow-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
            {isAr ? 'إجمالي المواعيد' : 'Total Bookings'}
          </span>
          <span className="text-2xl font-black font-mono text-slate-900 mt-1 block">
            {stats.total}
          </span>
        </div>

        <div className="bg-white border-2 border-slate-200 p-4 shadow-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
            {isAr ? 'جلسات مؤكدة / قادمة' : 'Confirmed & Upcoming'}
          </span>
          <span className="text-2xl font-black font-mono text-blue-700 mt-1 block">
            {stats.confirmed}
          </span>
        </div>

        <div className="bg-white border-2 border-slate-200 p-4 shadow-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
            {isAr ? 'جلسات مكتملة ومحصلة' : 'Completed & Billed'}
          </span>
          <span className="text-2xl font-black font-mono text-emerald-700 mt-1 block">
            {stats.completed}
          </span>
        </div>

        <div className="bg-slate-900 text-white p-4 shadow-md">
          <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 block">
            {isAr ? 'عوائد الاستشارات المحصلة' : 'Realized Consultation Fees'}
          </span>
          <span className="text-2xl font-black font-mono text-emerald-400 mt-1 block">
            +{formatCurrency(stats.totalRevenue)}
          </span>
        </div>
      </div>

      {/* 3. FILTER CONTROLS */}
      <div className="bg-white border-2 border-slate-300 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 rtl:right-3 ltr:left-3" />
          <input
            type="text"
            placeholder={isAr ? 'بحث باسم العميل، الموضوع، أو المستشار...' : 'Search client, topic, or expert...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:border-blue-600 focus:outline-none pr-9 rtl:pr-9 ltr:pl-9"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter */}
          <div className="flex items-center gap-1">
            {[
              { id: 'all', label: isAr ? 'الكل' : 'All' },
              { id: 'confirmed', label: isAr ? 'مؤكد' : 'Confirmed' },
              { id: 'completed', label: isAr ? 'مكتمل' : 'Completed' },
              { id: 'pending', label: isAr ? 'معلق' : 'Pending' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id as any)}
                className={`px-3 py-1.5 text-[11px] font-black uppercase tracking-wider transition-colors ${
                  statusFilter === st.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Date Filter */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="text-xs border border-slate-300 px-2 py-1.5 bg-white font-mono"
            title="Filter by date"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="text-[10px] font-bold text-red-600 hover:underline"
            >
              {isAr ? 'مسح التاريخ' : 'Clear'}
            </button>
          )}
        </div>
      </div>

      {/* 4. BOOKINGS APPOINTMENT LIST */}
      <div className="bg-white border-2 border-slate-300 shadow-xs overflow-x-auto">
        <table className="w-full text-xs font-sans text-left">
          <thead>
            <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider">
              <th className="py-3 px-4">{isAr ? 'العميل' : 'Client'}</th>
              <th className="py-3 px-4">{isAr ? 'المستشار المالي' : 'Advisor'}</th>
              <th className="py-3 px-4">{isAr ? 'تاريخ ووقت الجلسة' : 'Date & Time'}</th>
              <th className="py-3 px-4">{isAr ? 'موضوع الاستشارة' : 'Consultation Topic'}</th>
              <th className="py-3 px-4 text-right">{isAr ? 'الأتعاب' : 'Fee'}</th>
              <th className="py-3 px-4 text-center">{isAr ? 'الحالة' : 'Status'}</th>
              <th className="py-3 px-4 text-center">{isAr ? 'الإجراء' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-mono">
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500 font-sans">
                  <UserCheck className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="font-bold text-sm">{isAr ? 'لا توجد مواعيد استشارية مسجلة' : 'No consultation appointments found'}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {isAr ? 'اضغط على "حجز موعد استشارة جديد" لإضافة جلسة إلى الجدول' : 'Click "New Appointment" to schedule a session'}
                  </p>
                </td>
              </tr>
            ) : (
              filteredBookings.map((b) => {
                const statusBadge =
                  b.status === 'completed' ? 'bg-emerald-100 text-emerald-900 border-emerald-300' :
                  b.status === 'confirmed' ? 'bg-blue-100 text-blue-900 border-blue-300' :
                  b.status === 'pending' ? 'bg-amber-100 text-amber-900 border-amber-300' :
                  'bg-red-100 text-red-900 border-red-300';

                const statusLabel =
                  b.status === 'completed' ? (isAr ? 'مكتمل ومحصل' : 'Completed') :
                  b.status === 'confirmed' ? (isAr ? 'مؤكد ومجدول' : 'Confirmed') :
                  b.status === 'pending' ? (isAr ? 'قيد المراجعة' : 'Pending') :
                  (isAr ? 'ملغي' : 'Cancelled');

                return (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-sans">
                      <div className="font-black text-slate-900">{b.userName}</div>
                      {b.userEmail && <div className="text-[10px] text-slate-500">{b.userEmail}</div>}
                    </td>

                    <td className="py-3 px-4 font-sans">
                      <div className="font-bold text-slate-900">{b.expertName}</div>
                      {b.expertCredentials && (
                        <div className="text-[10px] font-mono text-blue-600 font-bold">{b.expertCredentials}</div>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-slate-800 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {b.date}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {b.timeSlot}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-sans">
                      <div className="font-bold text-slate-900">{b.topic}</div>
                      {b.clientNotes && (
                        <div className="text-[10px] text-slate-500 truncate max-w-xs">{b.clientNotes}</div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right font-black text-slate-900 font-mono text-sm">
                      {formatCurrency(b.fee)}
                    </td>

                    <td className="py-3 px-4 text-center font-sans">
                      <span className={`px-2 py-0.5 text-[10px] font-black uppercase border ${statusBadge}`}>
                        {statusLabel}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center font-sans">
                      <div className="flex items-center justify-center gap-1">
                        {b.status !== 'completed' && (
                          <button
                            onClick={() => handleCompleteAndRecordRevenue(b)}
                            title={isAr ? 'تأكيد إتمام الجلسة وترحيل الإيراد تلقائياً' : 'Complete and post revenue'}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider transition-colors shadow-2xs"
                          >
                            {isAr ? 'إتمام وتحصيل' : 'Complete'}
                          </button>
                        )}
                        {b.status === 'completed' && (
                          <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {isAr ? 'مرحل مالياً' : 'Posted'}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 5. EXPERTS DIRECTORY BANNER */}
      <div className="bg-slate-50 border-2 border-slate-300 p-5 shadow-xs space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-200">
          {isAr ? 'هيئة المستشارين والخبراء المعتمدين' : 'Certified Advisory Board & Specialists'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DEFAULT_EXPERTS.map((exp) => (
            <div key={exp.id} className="bg-white border border-slate-300 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 ${exp.avatarBg} text-white font-black text-xs flex items-center justify-center shadow-xs`}>
                    {exp.avatarInitials}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{exp.name}</h4>
                    <span className="text-[10px] font-mono font-bold text-blue-600">{exp.credentials}</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-black text-slate-900">
                  {formatCurrency(exp.hourlyRate)}/hr
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium">{exp.specialty}</p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>⭐ {exp.rating} ({exp.reviewsCount} {isAr ? 'تقييم' : 'reviews'})</span>
                <span>{exp.experienceYears} {isAr ? 'سنوات خبرة' : 'yrs exp'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* NEW APPOINTMENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white border-2 border-slate-800 w-full max-w-lg shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-black uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-200 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span>{isAr ? 'حجز موعد استشارة مالية جديد' : 'Schedule New Consultation Appointment'}</span>
            </h3>

            <form onSubmit={handleCreateBooking} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">
                    {isAr ? 'اسم العميل / الشركة:' : 'Client / Company Name:'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isAr ? 'عبدالله القحطاني' : 'Client Name'}
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full text-xs font-bold border border-slate-300 p-2"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">
                    {isAr ? 'البريد الإلكتروني للعميل:' : 'Client Email:'}
                  </label>
                  <input
                    type="email"
                    placeholder="client@example.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full text-xs border border-slate-300 p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">
                  {isAr ? 'اختيار المستشار المالي:' : 'Select Financial Advisor:'}
                </label>
                <select
                  value={selectedExpertId}
                  onChange={(e) => {
                    const exId = e.target.value;
                    setSelectedExpertId(exId);
                    const found = DEFAULT_EXPERTS.find((ex) => ex.id === exId);
                    if (found) setFee(found.hourlyRate);
                  }}
                  className="w-full text-xs font-bold border border-slate-300 p-2 bg-white"
                >
                  {DEFAULT_EXPERTS.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name} - {ex.credentials} ({formatCurrency(ex.hourlyRate)}/hr)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">
                    {isAr ? 'تاريخ الموعد:' : 'Appointment Date:'}
                  </label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full text-xs font-mono font-bold border border-slate-300 p-2"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">
                    {isAr ? 'التوقيت المفضل:' : 'Time Slot:'}
                  </label>
                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full text-xs font-bold border border-slate-300 p-2 bg-white"
                  >
                    <option value="09:00 AM">09:00 AM - 10:00 AM</option>
                    <option value="10:00 AM">10:00 AM - 11:00 AM</option>
                    <option value="11:30 AM">11:30 AM - 12:30 PM</option>
                    <option value="02:00 PM">02:00 PM - 03:00 PM</option>
                    <option value="04:00 PM">04:00 PM - 05:00 PM</option>
                    <option value="06:30 PM">06:30 PM - 07:30 PM</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">
                    {isAr ? 'موضوع ومحور الاستشارة:' : 'Consultation Topic:'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isAr ? 'إعادة هيكلة السيولة وإعداد الموازنة' : 'Liquidity restructuring & budgeting'}
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full text-xs font-bold border border-slate-300 p-2"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">
                    {isAr ? 'الأتعاب المتفق عليها:' : 'Agreed Fee ($):'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={fee}
                    onChange={(e) => setFee(Number(e.target.value))}
                    className="w-full text-xs font-mono font-bold border border-slate-300 p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">
                  {isAr ? 'ملاحظات إضافية / أهداف العميل:' : 'Additional Notes / Objectives:'}
                </label>
                <textarea
                  rows={2}
                  placeholder={isAr ? 'أي متطلبات أو وثائق مطلوب مراجعتها أثناء الجلسة...' : 'Notes...'}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs border border-slate-300 p-2 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-black uppercase bg-blue-600 hover:bg-blue-500 text-white"
                >
                  {isAr ? 'تأكيد الحجز والجدولة' : 'Confirm & Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
