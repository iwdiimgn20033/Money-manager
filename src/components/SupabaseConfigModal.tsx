import React, { useState, useEffect } from 'react';
import { 
  X, 
  Database, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Save, 
  Key, 
  Globe, 
  GitBranch, 
  Copy, 
  Check, 
  ShieldCheck, 
  HelpCircle 
} from 'lucide-react';
import { 
  getSupabaseCredentials, 
  saveSupabaseCredentials, 
  isSupabaseConfigured,
  getSupabaseClient 
} from '../lib/supabase';
import { LanguageCode } from '../i18n/translations';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage?: LanguageCode;
  onConfigSaved?: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  currentLanguage = 'ar',
  onConfigSaved,
}) => {
  const isAr = currentLanguage === 'ar';
  
  const [projectUrl, setProjectUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [copiedCallback, setCopiedCallback] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'guide'>('config');

  useEffect(() => {
    if (isOpen) {
      const creds = getSupabaseCredentials();
      setProjectUrl(creds.url);
      setAnonKey(creds.anonKey);
      setTestStatus('idle');
      setStatusMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Extract project ref for callback url preview
  let projectRef = '<project-ref>';
  try {
    if (projectUrl && projectUrl.includes('.supabase.co')) {
      const match = projectUrl.match(/https?:\/\/([^.]+)\.supabase\.co/);
      if (match && match[1]) {
        projectRef = match[1];
      }
    }
  } catch {
    // fallback
  }

  const callbackUrl = `https://${projectRef}.supabase.co/auth/v1/callback`;

  const handleCopyCallback = () => {
    navigator.clipboard.writeText(callbackUrl);
    setCopiedCallback(true);
    setTimeout(() => setCopiedCallback(false), 2000);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanUrl = projectUrl.trim();
    const cleanKey = anonKey.trim();

    if (!cleanUrl || !cleanKey) {
      setTestStatus('error');
      setStatusMessage(isAr ? 'يرجى إدخال كل من Project URL و Anon Public Key' : 'Please provide both Project URL and Anon Public Key');
      return;
    }

    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      setTestStatus('error');
      setStatusMessage(isAr ? 'يجب أن يبدأ عنوان المشروع بـ https://' : 'Project URL must start with https://');
      return;
    }

    setIsTesting(true);
    setTestStatus('idle');
    setStatusMessage('');

    try {
      saveSupabaseCredentials(cleanUrl, cleanKey);
      const client = getSupabaseClient();
      if (!client) {
        throw new Error(isAr ? 'تعذر إنشاء عميل Supabase' : 'Failed to instantiate Supabase client');
      }

      // Quick ping test to Supabase Auth
      const { error } = await client.auth.getSession();
      if (error && !error.message.includes('Auth session missing')) {
        throw error;
      }

      setTestStatus('success');
      setStatusMessage(
        isAr 
          ? 'تم التحقق من بيانات الاتصال بمشروع Supabase بنجاح وحفظها!' 
          : 'Successfully connected and saved Supabase project credentials!'
      );

      if (onConfigSaved) onConfigSaved();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('Supabase test connection failed:', err);
      setTestStatus('error');
      setStatusMessage(
        isAr 
          ? `فشل الاتصال: ${err.message || 'تأكد من صحة الرابط ومفتاح Anon Public Key'}` 
          : `Connection failed: ${err.message || 'Check your Project URL and Anon Public Key'}`
      );
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto font-arabic">
      <div 
        className="bg-slate-900 border border-slate-700/90 text-white w-full max-w-xl shadow-2xl rounded-2xl p-5 sm:p-7 relative my-auto max-h-[92vh] overflow-y-auto"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute ${isAr ? 'left-4' : 'right-4'} top-4 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors`}
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center pb-3 border-b border-slate-800">
          <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-2xl flex items-center justify-center mx-auto mb-2 text-base shadow-xs">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white flex items-center justify-center gap-2">
            <span>{isAr ? 'ضبط إعدادات Supabase (خاص بمدير الموقع)' : 'Supabase Admin Settings (Admin Only)'}</span>
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {isAr ? 'خاص بالمدير 🛡️' : 'Admin Only 🛡️'}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            {isAr 
              ? 'لوحة ضبط وتوصيل مشروع Supabase الخاص بك ومفاتيح الربط وتوثيق GitHub لمشروعك السحابي.'
              : 'Configure and connect your Supabase project credentials and GitHub OAuth integration.'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-800 mt-4">
          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={`flex-1 py-2.5 text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'config'
                ? 'text-emerald-400 border-b-2 border-emerald-500 bg-emerald-500/5'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>{isAr ? 'إدخال مفاتيح الربط (Keys)' : 'API Credentials'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`flex-1 py-2.5 text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'guide'
                ? 'text-blue-400 border-b-2 border-blue-500 bg-blue-500/5'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>{isAr ? 'دليل ربط GitHub خطوة بخطوة' : 'GitHub Setup Guide'}</span>
          </button>
        </div>

        {/* Feedback message */}
        {statusMessage && (
          <div className={`mt-3 p-3 rounded-xl text-xs flex items-center gap-2 ${
            testStatus === 'success' 
              ? 'bg-emerald-950/80 border border-emerald-500/60 text-emerald-200' 
              : 'bg-red-950/80 border border-red-500/60 text-red-200'
          }`}>
            {testStatus === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{statusMessage}</span>
          </div>
        )}

        {/* TAB 1: CONFIGURATION */}
        {activeTab === 'config' && (
          <form onSubmit={handleSave} className="mt-4 space-y-3.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-300">
                  {isAr ? 'رابط مشروع Supabase (Project URL)' : 'Supabase Project URL'} <span className="text-red-400">*</span>
                </label>
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>{isAr ? 'فتح لوحة Supabase' : 'Open Supabase'}</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <div className="relative">
                <Globe className={`w-4 h-4 text-slate-400 absolute ${isAr ? 'right-3' : 'left-3'} top-2.5`} />
                <input
                  type="text"
                  required
                  value={projectUrl}
                  onChange={(e) => setProjectUrl(e.target.value)}
                  placeholder="https://xyzabcdefg.supabase.co"
                  className={`w-full ${isAr ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono`}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {isAr ? 'تجد هذا الرابط في: Project Settings ⚙️ ⬅️ API ⬅️ Project URL' : 'Find this in Project Settings ⚙️ ➡️ API ➡️ Project URL'}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-300">
                  {isAr ? 'مفتاح المشروع العام (Anon Public Key)' : 'Anon Public API Key'} <span className="text-red-400">*</span>
                </label>
              </div>
              <div className="relative">
                <Key className={`w-4 h-4 text-slate-400 absolute ${isAr ? 'right-3' : 'left-3'} top-2.5`} />
                <input
                  type="password"
                  required
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className={`w-full ${isAr ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono`}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {isAr ? 'تجد هذا المفتاح في: Project Settings ⚙️ ⬅️ API ⬅️ Project API Keys (anon public)' : 'Find this in Project Settings ⚙️ ➡️ API ➡️ anon public'}
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="submit"
                disabled={isTesting}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {isTesting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{isAr ? 'حفظ واختبار الاتصال فوراً' : 'Save & Test Connection'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: GITHUB OAUTH SETUP GUIDE */}
        {activeTab === 'guide' && (
          <div className="mt-4 space-y-3.5 text-xs text-slate-300">
            <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-white font-bold">
                <GitBranch className="w-4 h-4 text-emerald-400" />
                <span>{isAr ? 'خطوات تفعيل GitHub في Supabase' : 'GitHub OAuth in Supabase'}</span>
              </div>
              
              <ol className={`space-y-2 text-[11px] list-decimal ${isAr ? 'pr-4' : 'pl-4'} text-slate-300`}>
                <li>
                  {isAr ? 'ادخل إلى GitHub وافتح: ' : 'Go to GitHub and open: '}
                  <a 
                    href="https://github.com/settings/developers" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-emerald-400 underline font-bold"
                  >
                    GitHub Developer Settings ⬅️ OAuth Apps
                  </a>
                </li>
                <li>
                  {isAr ? 'اضغط "New OAuth App" واملأ البيانات.' : 'Click "New OAuth App" and enter your app name.'}
                </li>
                <li>
                  <div className="flex items-center justify-between font-bold text-slate-200 mt-1 mb-0.5">
                    <span>{isAr ? 'رابط Callback URL المطلوب لـ GitHub:' : 'Authorization Callback URL:'}</span>
                    <button
                      type="button"
                      onClick={handleCopyCallback}
                      className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 rounded text-[10px] text-emerald-400 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedCallback ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCallback ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ' : 'Copy')}</span>
                    </button>
                  </div>
                  <div className="p-2 bg-slate-950 font-mono text-[10px] text-emerald-300 rounded border border-slate-800 break-all select-all">
                    {callbackUrl}
                  </div>
                </li>
                <li>
                  {isAr 
                    ? 'بعد حفظ التطبيق في GitHub، انسخ الـ Client ID واضغط "Generate a new client secret" لنسخ السر.'
                    : 'After creating the app in GitHub, copy the Client ID and create a Client Secret.'}
                </li>
                <li>
                  {isAr 
                    ? 'اذهب إلى لوحة تحكم Supabase ⬅️ Authentication ⬅️ Providers ⬅️ فعّل GitHub وألصق Client ID و Client Secret ثم اضغط Save.'
                    : 'Go to Supabase ➡️ Authentication ➡️ Providers ➡️ Enable GitHub, paste credentials and click Save.'}
                </li>
              </ol>
            </div>

            <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-200 text-[11px] flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                {isAr
                  ? 'بمجرد حفظ الخطوات، سيتمكن أي مستخدم من تسجيل الدخول بضغطة زر واحدة عبر حسابه في GitHub وتخزين بياناته المالية تلقائياً!'
                  : 'Once configured, users can log in with 1-click using their GitHub account and have their finance data persisted!'}
              </span>
            </div>

            <div className="pt-1 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveTab('config')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                {isAr ? 'العودة لإدخال مفاتيح الربط' : 'Back to Keys Configuration'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
