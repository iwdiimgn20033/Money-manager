import React, { useState, useRef, useEffect } from 'react';
import { ConsultationBooking, CurrencyInfo, FinancialExpert, FinancialMetrics, UserProfile } from '../types';
import { FINANCIAL_EXPERTS } from '../data/expertsData';
import { formatCurrency } from '../utils/calculations';
import { 
  X, 
  MessageSquare, 
  Calendar, 
  Star, 
  CheckCircle2, 
  Send, 
  Sparkles, 
  PhoneCall, 
  ShieldCheck, 
  Clock, 
  User, 
  ArrowRight, 
  HelpCircle, 
  TrendingUp, 
  AlertCircle,
  ExternalLink,
  MessageCircle
} from 'lucide-react';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: FinancialMetrics;
  currentCurrency: CurrencyInfo;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onBookConsultation: (booking: ConsultationBooking) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'expert' | 'system';
  text: string;
  time: string;
  actionButtons?: Array<{
    label: string;
    action: 'book' | 'whatsapp' | 'experts';
    variant?: 'primary' | 'success' | 'secondary';
  }>;
}

export const ConsultationModal: React.FC<ConsultationModalProps> = ({
  isOpen,
  onClose,
  metrics,
  currentCurrency,
  currentUser,
  onOpenAuth,
  onBookConsultation,
}) => {
  const [selectedExpert, setSelectedExpert] = useState<FinancialExpert>(FINANCIAL_EXPERTS[0]);
  const [activeView, setActiveView] = useState<'experts' | 'chat' | 'book'>('experts');
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [selectedDate, setSelectedDate] = useState('2026-08-25');
  const [selectedTime, setSelectedTime] = useState('14:00 (GST / UTC+4)');
  const [consultationTopic, setConsultationTopic] = useState('Cash Flow Optimization & Burn Rate Reduction');
  
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const initialWelcomeText = `Hello ${currentUser ? currentUser.name : 'there'}! I am ${FINANCIAL_EXPERTS[0].name}, ${FINANCIAL_EXPERTS[0].title}. I have reviewed your live financial metrics: Your target savings rate is ${metrics.savingsRate.toFixed(1)}% and net cash flow variance is ${formatCurrency(metrics.netExpenseVariance)}. How can I assist you with your budget strategy today?`;

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init-1',
      sender: 'expert',
      text: initialWelcomeText,
      time: 'Just now',
      actionButtons: [
        { label: '📊 Analyze My Savings', action: 'book', variant: 'secondary' },
        { label: '📅 Book 1-on-1 Consultation', action: 'book', variant: 'primary' },
        { label: '💬 Chat on WhatsApp', action: 'whatsapp', variant: 'success' },
      ]
    },
  ]);

  useEffect(() => {
    if (activeView === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeView, isTyping]);

  if (!isOpen) return null;

  // Open WhatsApp with pre-filled advisor text
  const handleOpenWhatsApp = () => {
    const text = encodeURIComponent(
      `Hello ${selectedExpert.name},\n` +
      `I am using iMoney-manager. Here is my current financial status:\n` +
      `• Currency: ${currentCurrency.code}\n` +
      `• Expected Inflow: ${formatCurrency(metrics.totalExpectedIncome)}\n` +
      `• Budgeted Outflow: ${formatCurrency(metrics.totalBudgetedExpense)}\n` +
      `• Adherence Score: ${metrics.budgetAdherenceScore}%\n` +
      `• Savings Rate: ${metrics.savingsRate.toFixed(1)}%\n\n` +
      `I would like to arrange an advisory session with you.`
    );
    window.open(`https://wa.me/971501234567?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  // Smart Context-Aware Financial Assistant Reply Generator
  const generateExpertResponse = (userText: string): { reply: string; buttons?: ChatMessage['actionButtons'] } => {
    const clean = userText.trim().toLowerCase();

    // 1. Agreement / Acceptance (User says "ok", "yes", "sure", "تمام", "موافق", "حسنا", "sounds good", etc.)
    const agreementPatterns = [
      'ok', 'okay', 'yes', 'sure', 'fine', 'yeah', 'yep', 'sounds good', 'let\'s do it', 'lets do it',
      'i agree', 'deal', 'great', 'awesome', 'good', 'تمام', 'موافق', 'حسنا', 'نعم', 'يلا', 'اوكي', 'اوك', 'أكيد', 'بالتأكيد'
    ];
    const isAgreement = agreementPatterns.some(pat => clean === pat || clean.startsWith(pat + ' ') || clean.endsWith(' ' + pat));

    if (isAgreement) {
      return {
        reply: `Excellent! I am looking forward to our deep-dive session. You can choose a convenient slot directly via our in-app booking system, or connect with me immediately on WhatsApp. How would you like to proceed?`,
        buttons: [
          { label: '📅 Choose Date & Time Slot', action: 'book', variant: 'primary' },
          { label: '💬 Connect on WhatsApp Now', action: 'whatsapp', variant: 'success' },
        ]
      };
    }

    // 2. Rejection / Hesitation (User says "no", "not now", "later", "لا", "ليس الان")
    const rejectionPatterns = ['no', 'nope', 'not now', 'later', 'maybe later', 'not yet', 'لا', 'ليس الان', 'بعدين', 'لا شكرا'];
    const isRejection = rejectionPatterns.some(pat => clean === pat || clean.startsWith(pat + ' '));
    if (isRejection) {
      return {
        reply: `No problem at all! You can continue utilizing iMoney-manager's automated charts, Double-Entry Ledger, and Balance Sheet. Whenever you're ready for custom guidance, feel free to reach out anytime.`,
        buttons: [
          { label: '📊 View Other Financial Experts', action: 'experts', variant: 'secondary' },
        ]
      };
    }

    // 3. WhatsApp or Contact Direct inquiry
    if (clean.includes('whatsapp') || clean.includes('واتساب') || clean.includes('phone') || clean.includes('رقم') || clean.includes('اتصال')) {
      return {
        reply: `You can reach me directly on WhatsApp at +971 50 123 4567 for instant financial advisory or document review. Click below to launch WhatsApp with your pre-formatted financial summary:`,
        buttons: [
          { label: '💬 Launch WhatsApp Chat', action: 'whatsapp', variant: 'success' },
        ]
      };
    }

    // 4. Booking / Scheduling inquiry
    if (clean.includes('book') || clean.includes('schedule') || clean.includes('appointment') || clean.includes('حجز') || clean.includes('موعد') || clean.includes('جلسة')) {
      return {
        reply: `I have several available 60-minute slots this week. ${currentUser?.isFreeTrialActive ? 'Since you are on an active VIP Free Trial, your consultation fee is 100% complimentary!' : `Standard session fee is ${formatCurrency(selectedExpert.hourlyRate * (currentCurrency.rateAgainstUSD || 1))}.`} Let's set up your slot:`,
        buttons: [
          { label: '📅 Go to Appointment Calendar', action: 'book', variant: 'primary' },
        ]
      };
    }

    // 5. Savings / Emergency Fund
    if (clean.includes('saving') || clean.includes('save') || clean.includes('توفير') || clean.includes('ادخار') || clean.includes('طوارئ') || clean.includes('احتياطي')) {
      return {
        reply: `Looking at your numbers: Target savings rate is ${metrics.savingsRate.toFixed(1)}%. To build a bulletproof emergency cushion, I recommend holding 3 to 6 months of essential expenses in liquid, risk-free instruments before investing. With your current burn rate, setting up an automatic Day-1 transfer into liquid reserves will guarantee steady growth.`,
        buttons: [
          { label: '📅 Schedule Savings Strategy Call', action: 'book', variant: 'primary' },
          { label: '💬 Ask Advisor on WhatsApp', action: 'whatsapp', variant: 'success' },
        ]
      };
    }

    // 6. Investments / Portfolio / Stocks
    if (clean.includes('invest') || clean.includes('portfolio') || clean.includes('stock') || clean.includes('استثمار') || clean.includes('أسهم') || clean.includes('محفظة')) {
      return {
        reply: `With your projected month-end balance of ${formatCurrency(metrics.estimatedEndOfPeriodBankBalance)}, you have potential surplus liquidity. Once your emergency fund covers at least 3 months of fixed outflows (${formatCurrency(metrics.totalBudgetedExpense * 3)}), we can structure a diversified index fund / Sukuk portfolio tailored to your risk tolerance.`,
        buttons: [
          { label: '📅 Book Portfolio Review', action: 'book', variant: 'primary' },
        ]
      };
    }

    // 7. Debt / Loans / Credit Cards
    if (clean.includes('debt') || clean.includes('loan') || clean.includes('credit') || clean.includes('دين') || clean.includes('ديون') || clean.includes('قرض') || clean.includes('قروض') || clean.includes('سداد')) {
      return {
        reply: `For optimal debt payoff, I recommend the Debt Avalanche method (targeting highest interest rate first while paying minimums on others). Would you like to review your liability schedule on the Balance Sheet together?`,
        buttons: [
          { label: '📅 Schedule Debt Elimination Call', action: 'book', variant: 'primary' },
          { label: '💬 WhatsApp Consultation', action: 'whatsapp', variant: 'success' },
        ]
      };
    }

    // 8. Greetings
    if (clean.includes('hi') || clean.includes('hello') || clean.includes('hey') || clean.includes('مرحبا') || clean.includes('سلام') || clean.includes('أهلا') || clean.includes('صباح') || clean.includes('مساء')) {
      return {
        reply: `Greetings! It is a pleasure to meet you. I am actively monitoring your budget parameters: Total revenue is ${formatCurrency(metrics.totalExpectedIncome)} against ${formatCurrency(metrics.totalBudgetedExpense)} budgeted expenses. What aspect of your financial plan would you like to optimize today?`,
        buttons: [
          { label: '📊 How to Reduce Burn Rate', action: 'book', variant: 'secondary' },
          { label: '📅 Schedule 1-on-1 Consultation', action: 'book', variant: 'primary' },
        ]
      };
    }

    // 9. Default Intelligent Financial Synthesis
    return {
      reply: `Thank you for sharing. Analyzing your current ${currentCurrency.code} architecture: Expected Revenue is ${formatCurrency(metrics.totalExpectedIncome)} and Net Budgeted Variance is ${formatCurrency(metrics.netExpenseVariance)} with an Adherence Score of ${metrics.budgetAdherenceScore}%. I can help you restructure specific expense categories or formulate a customized 12-month wealth strategy. Would you like to book a 1-on-1 session or discuss over WhatsApp?`,
      buttons: [
        { label: '📅 Schedule Video Session', action: 'book', variant: 'primary' },
        { label: '💬 Chat on WhatsApp', action: 'whatsapp', variant: 'success' },
      ]
    };
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isTyping) return;

    const userMsg = inputMessage;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setChatMessages((prev) => [
      ...prev,
      { id: `msg-u-${Date.now()}`, sender: 'user', text: userMsg, time: now },
    ]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateExpertResponse(userMsg);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-e-${Date.now()}`,
          sender: 'expert',
          text: response.reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionButtons: response.buttons,
        },
      ]);
      setIsTyping(false);
    }, 700);
  };

  const handleActionButtonClick = (action: 'book' | 'whatsapp' | 'experts') => {
    if (action === 'book') {
      setActiveView('book');
    } else if (action === 'whatsapp') {
      handleOpenWhatsApp();
    } else if (action === 'experts') {
      setActiveView('experts');
    }
  };

  const handleBookSession = (e: React.FormEvent) => {
    e.preventDefault();
    const newBooking: ConsultationBooking = {
      id: `book-${Date.now()}`,
      expertId: selectedExpert.id,
      expertName: selectedExpert.name,
      expertCredentials: selectedExpert.credentials,
      userId: currentUser ? currentUser.id : `guest-${Date.now()}`,
      userName: currentUser ? currentUser.name : 'Guest User',
      userEmail: currentUser ? currentUser.email : '',
      date: selectedDate,
      timeSlot: selectedTime,
      topic: consultationTopic,
      status: 'pending',
      fee: currentUser?.isFreeTrialActive ? 0 : selectedExpert.hourlyRate * (currentCurrency.rateAgainstUSD || 1),
      currencyCode: currentCurrency.code,
      createdAt: new Date().toISOString().split('T')[0],
      clientNotes: `Booked for ${selectedDate} at ${selectedTime}. Free Trial: ${currentUser?.isFreeTrialActive ? 'Yes' : 'No'}`,
    };

    onBookConsultation(newBooking);
    setBookingConfirmed(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 text-white w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600/30 text-emerald-400 border border-emerald-500/40">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-wider text-white flex items-center gap-1.5">
                  <span className="text-emerald-400">i</span>Money-manager Financial Advisory
                </h2>
                <span className="px-2 py-0.5 text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  CFP® & CFA® Certified
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                1-on-1 Professional Budget Auditing, Cash Flow Structuring & WhatsApp Advisory
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Direct WhatsApp Quick Launch */}
            <button
              onClick={handleOpenWhatsApp}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs"
              title="Open WhatsApp Chat with Advisor"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Direct</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center border-b border-slate-800 bg-slate-900/90 px-6 shrink-0">
          <button
            onClick={() => setActiveView('experts')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeView === 'experts'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Select Financial Advisor</span>
          </button>
          <button
            onClick={() => setActiveView('chat')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeView === 'chat'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Instant Smart Advisory Chat</span>
          </button>
          <button
            onClick={() => setActiveView('book')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeView === 'book'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Book 1-on-1 Video Session</span>
          </button>
        </div>

        {/* Modal Main Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-900/50">
          {/* VIEW 1: EXPERTS LIST */}
          {activeView === 'experts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-300 font-mono">
                  Select a certified financial advisor to audit your monthly budget or start a direct consultation:
                </p>
                {currentUser?.isFreeTrialActive && (
                  <span className="px-2 py-1 text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    ✨ 2-Month VIP Free Trial (100% Free Consultations)
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {FINANCIAL_EXPERTS.map((expert) => {
                  const isSelected = selectedExpert.id === expert.id;
                  const convertedRate = expert.hourlyRate * (currentCurrency.rateAgainstUSD || 1);
                  return (
                    <div
                      key={expert.id}
                      onClick={() => setSelectedExpert(expert)}
                      className={`p-4 border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-emerald-950/30 border-emerald-500 shadow-md ring-1 ring-emerald-500'
                          : 'bg-slate-800/60 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 ${expert.avatarBg} text-white font-mono font-black flex items-center justify-center text-sm shadow-md`}>
                              {expert.avatarInitials}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-white text-sm">{expert.name}</h3>
                                {expert.isOnline && (
                                  <span className="w-2 h-2 bg-emerald-400 rounded-full inline-block animate-pulse" title="Online Now" />
                                )}
                              </div>
                              <span className="text-xs text-emerald-400 font-mono block">
                                {expert.credentials} • {expert.title}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 border border-slate-700 text-amber-400 text-xs font-mono font-bold">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{expert.rating}</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed font-sans">
                          {expert.bio}
                        </p>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-700">
                            {expert.experienceYears}+ Yrs Exp
                          </span>
                          {expert.languages.map((lang) => (
                            <span key={lang} className="px-2 py-0.5 text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-700">
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          {formatCurrency(convertedRate)} / hour
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedExpert(expert);
                              setActiveView('chat');
                            }}
                            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold uppercase transition-colors"
                          >
                            Chat
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedExpert(expert);
                              setActiveView('book');
                            }}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider transition-colors"
                          >
                            Book Session
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 2: INSTANT ADVISORY CHAT */}
          {activeView === 'chat' && (
            <div className="h-[480px] flex flex-col bg-slate-950 border border-slate-800">
              {/* Chat Advisor Subheader */}
              <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 ${selectedExpert.avatarBg} text-white font-mono font-black flex items-center justify-center text-xs`}>
                    {selectedExpert.avatarInitials}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{selectedExpert.name}</span>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">({selectedExpert.credentials})</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">{selectedExpert.specialty}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenWhatsApp}
                    className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 px-2.5 py-1 border border-emerald-500/40 transition-colors"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </button>
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-950/40 px-2 py-1 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span>Active Advisor</span>
                  </div>
                </div>
              </div>

              {/* Chat Stream */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-lg p-3 text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-800 text-slate-200 border border-slate-700 shadow-xs'
                      }`}
                    >
                      <p>{msg.text}</p>

                      {/* Interactive Action Buttons attached to Expert's message */}
                      {msg.actionButtons && msg.actionButtons.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-slate-700 flex flex-wrap gap-2">
                          {msg.actionButtons.map((btn, btnIdx) => (
                            <button
                              key={btnIdx}
                              onClick={() => handleActionButtonClick(btn.action)}
                              className={`px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase transition-all flex items-center gap-1 ${
                                btn.variant === 'primary'
                                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                                  : btn.variant === 'success'
                                  ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white'
                                  : 'bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600'
                              }`}
                            >
                              <span>{btn.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 mt-1 px-1">{msg.time}</span>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-2 p-2 bg-slate-800/60 border border-slate-700 text-slate-400 text-xs font-mono w-44">
                    <span className="animate-spin w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full" />
                    <span>Advisor typing...</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`Reply or ask ${selectedExpert.name} (e.g., "ok let's schedule", "how to save", "whatsapp")...`}
                  className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isTyping}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          )}

          {/* VIEW 3: BOOK 1-ON-1 SESSION */}
          {activeView === 'book' && (
            <div className="max-w-xl mx-auto space-y-6">
              {bookingConfirmed ? (
                <div className="p-6 bg-emerald-950/40 border border-emerald-500/50 text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-black uppercase text-white">
                    Consultation Confirmed with {selectedExpert.name}!
                  </h3>
                  <p className="text-xs text-slate-300">
                    A calendar invitation and video link have been prepared for <strong>{selectedDate}</strong> at <strong>{selectedTime}</strong>.
                  </p>
                  <div className="pt-3 flex items-center justify-center gap-3">
                    <button
                      onClick={handleOpenWhatsApp}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Confirm on WhatsApp</span>
                    </button>
                    <button
                      onClick={() => setBookingConfirmed(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider border border-slate-700"
                    >
                      Book Another Session
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleBookSession} className="bg-slate-800/60 border border-slate-700 p-6 space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-700">
                    <div className={`w-10 h-10 ${selectedExpert.avatarBg} text-white font-mono font-black flex items-center justify-center text-xs`}>
                      {selectedExpert.avatarInitials}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">Book Session with {selectedExpert.name}</h3>
                      <span className="text-xs text-emerald-400 font-mono">{selectedExpert.title}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                      Primary Consultation Focus
                    </label>
                    <select
                      value={consultationTopic}
                      onChange={(e) => setConsultationTopic(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option>Cash Flow Optimization & Burn Rate Reduction</option>
                      <option>Debt Elimination & Loan Restructuring</option>
                      <option>Gulf Region & International Wealth Architecture</option>
                      <option>Emergency Reserve & High-Yield Asset Allocation</option>
                      <option>Custom Monthly Budget Categorization Review</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                        Select Date
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                        Time Slot
                      </label>
                      <select
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      >
                        <option>10:00 (GST / UTC+4)</option>
                        <option>14:00 (GST / UTC+4)</option>
                        <option>16:30 (GST / UTC+4)</option>
                        <option>19:00 (GST / UTC+4)</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-700 text-xs text-slate-300 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400">Total Consultation Fee:</span>
                    <div className="text-right">
                      {currentUser?.isFreeTrialActive ? (
                        <div className="flex items-center gap-2">
                          <span className="line-through text-slate-500 text-xs font-mono">
                            {formatCurrency(selectedExpert.hourlyRate * (currentCurrency.rateAgainstUSD || 1))}
                          </span>
                          <span className="font-mono font-black text-emerald-400 text-sm">
                            FREE (Trial Credit)
                          </span>
                        </div>
                      ) : (
                        <span className="font-mono font-black text-emerald-400 text-sm">
                          {formatCurrency(selectedExpert.hourlyRate * (currentCurrency.rateAgainstUSD || 1))} / 60-min
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors shadow-xs"
                  >
                    <span>Confirm & Schedule Consultation</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
