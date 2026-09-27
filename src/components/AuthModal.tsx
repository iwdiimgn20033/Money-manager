import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { LanguageCode } from '../i18n/translations';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  Check, 
  AlertCircle, 
  LogIn, 
  UserPlus,
  Loader2, 
  CheckCircle2, 
  Key,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Settings
} from 'lucide-react';
import { 
  signInWithSupabase, 
  signUpWithSupabase, 
  signInWithSupabaseGitHub, 
  isSupabaseConfigured,
  getSupabaseCredentials,
  saveSupabaseCredentials
} from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  currentLanguage?: LanguageCode;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser: _currentUser,
  onLogin,
  currentLanguage = 'ar',
  initialMode = 'login',
}) => {
  const isAr = currentLanguage === 'ar';
  
  // Navigation: 'login' (Sign in) or 'register' (Account creation)
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);
  
  // Feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Supabase Configuration State
  const [configured, setConfigured] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [projectUrl, setProjectUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [configSavedNotice, setConfigSavedNotice] = useState(false);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode || 'login');
      setErrorMessage(null);
      setSuccessMessage(null);
      setEmail('');
      setPassword('');
      setName('');
      setIsLoading(false);
      setIsGitHubLoading(false);
      
      const creds = getSupabaseCredentials();
      setProjectUrl(creds.url || 'https://yvybginudnkrgeqixixs.supabase.co');
      setAnonKey(creds.anonKey || '');
      const isConf = isSupabaseConfigured();
      setConfigured(isConf);
      // Automatically expand config if anonKey is missing
      setShowConfig(!isConf);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  // Save Supabase credentials inline
  const handleSaveConfig = () => {
    const cleanUrl = (projectUrl.trim() || 'https://yvybginudnkrgeqixixs.supabase.co').replace(/\/+$/, '');
    const cleanKey = anonKey.trim();

    if (!cleanKey) {
      setErrorMessage(isAr ? 'يرجى إدخال المفتاح العام (Anon Key) لمشروع Supabase' : 'Please enter your Supabase Anon Key');
      return;
    }

    saveSupabaseCredentials(cleanUrl, cleanKey);
    setConfigured(true);
    setShowConfig(false);
    setConfigSavedNotice(true);
    setErrorMessage(null);
    setTimeout(() => setConfigSavedNotice(false), 3000);
  };

  // Sign in with Supabase
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!isSupabaseConfigured() && !anonKey.trim()) {
      setShowConfig(true);
      setErrorMessage(isAr ? 'يرجى حفظ المفتاح العام (Anon Key) أولاً لإتمام الاتصال مع Supabase' : 'Please provide and save your Supabase Anon Key first');
      return;
    }

    // Auto-save if typed into the box
    if (anonKey.trim() && (!configured || getSupabaseCredentials().anonKey !== anonKey.trim())) {
      saveSupabaseCredentials(projectUrl.trim() || 'https://yvybginudnkrgeqixixs.supabase.co', anonKey.trim());
      setConfigured(true);
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage(isAr ? 'يرجى إدخال بريد إلكتروني صالح' : 'Please enter a valid email address');
      return;
    }

    if (!password) {
      setErrorMessage(isAr ? 'يرجى إدخال كلمة المرور' : 'Please enter your password');
      return;
    }

    setIsLoading(true);
    try {
      const userProfile = await signInWithSupabase(cleanEmail, password);
      setSuccessMessage(isAr ? `تم تسجيل الدخول بنجاح! مرحباً ${userProfile.name}` : `Signed in successfully! Welcome ${userProfile.name}`);
      setTimeout(() => {
        onLogin(userProfile);
        onClose();
      }, 500);
    } catch (err: any) {
      console.error('Supabase login error:', err);
      const msg = err?.message || '';
      if (msg === 'SUPABASE_NOT_CONFIGURED') {
        setShowConfig(true);
        setErrorMessage(isAr ? 'يرجى إدخال المفتاح العام (Anon Key) لمشروع Supabase' : 'Please configure your Supabase Anon Key');
      } else if (msg.includes('Invalid login credentials')) {
        setErrorMessage(isAr ? 'بيانات الدخول غير صحيحة (تأكد من البريد وكلمة المرور)' : 'Invalid login credentials. Please check your email and password.');
      } else if (msg.includes('Email not confirmed')) {
        setErrorMessage(isAr ? 'يرجى تأكيد بريدك الإلكتروني عبر الرابط المرسل من Supabase' : 'Please confirm your email address via the link sent by Supabase.');
      } else {
        setErrorMessage(isAr ? `خطأ في تسجيل الدخول: ${msg}` : `Login failed: ${msg}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up with Supabase
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!isSupabaseConfigured() && !anonKey.trim()) {
      setShowConfig(true);
      setErrorMessage(isAr ? 'يرجى حفظ المفتاح العام (Anon Key) أولاً لإتمام الاتصال مع Supabase' : 'Please provide and save your Supabase Anon Key first');
      return;
    }

    if (anonKey.trim() && (!configured || getSupabaseCredentials().anonKey !== anonKey.trim())) {
      saveSupabaseCredentials(projectUrl.trim() || 'https://yvybginudnkrgeqixixs.supabase.co', anonKey.trim());
      setConfigured(true);
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim() || cleanEmail.split('@')[0];

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage(isAr ? 'يرجى إدخال بريد إلكتروني صالح' : 'Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setErrorMessage(isAr ? 'كلمة المرور يجب أن لا تقل عن 6 أحرف' : 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const userProfile = await signUpWithSupabase(cleanName, cleanEmail, password);
      setSuccessMessage(isAr ? `تم إنشاء الحساب بنجاح في Supabase! مرحباً بك يا ${cleanName}` : `Account created in Supabase! Welcome ${cleanName}`);
      setTimeout(() => {
        onLogin(userProfile);
        onClose();
      }, 700);
    } catch (err: any) {
      console.error('Supabase signup error:', err);
      const msg = err?.message || '';
      if (msg === 'SUPABASE_NOT_CONFIGURED') {
        setShowConfig(true);
        setErrorMessage(isAr ? 'يرجى إدخال المفتاح العام (Anon Key) أولاً' : 'Please configure your Supabase Anon Key first');
      } else if (msg.includes('already registered')) {
        setErrorMessage(isAr ? 'هذا البريد مسجل مسبقاً، يمكنك التبديل إلى "تسجيل الدخول"' : 'User already registered. Please switch to Sign In.');
      } else {
        setErrorMessage(isAr ? `تعذر إنشاء الحساب: ${msg}` : `Sign up failed: ${msg}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in via GitHub on Supabase
  const handleGitHubSignIn = async () => {
    setErrorMessage(null);
    if (!isSupabaseConfigured() && !anonKey.trim()) {
      setShowConfig(true);
      setErrorMessage(isAr ? 'يرجى إدخال المفتاح العام (Anon Key) أولاً لتفعيل الدخول عبر GitHub' : 'Please configure your Supabase Anon Key first');
      return;
    }

    if (anonKey.trim() && (!configured || getSupabaseCredentials().anonKey !== anonKey.trim())) {
      saveSupabaseCredentials(projectUrl.trim() || 'https://yvybginudnkrgeqixixs.supabase.co', anonKey.trim());
      setConfigured(true);
    }

    setIsGitHubLoading(true);
    try {
      await signInWithSupabaseGitHub();
    } catch (err: any) {
      console.error('Supabase GitHub error:', err);
      setErrorMessage(
        isAr 
          ? `تعذر تسجيل الدخول عبر GitHub: ${err.message || 'تأكد من تفعيل موفر GitHub في مشروعك على Supabase'}`
          : `GitHub sign-in failed: ${err.message || 'Ensure GitHub OAuth provider is enabled in Supabase'}`
      );
    } finally {
      setIsGitHubLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto font-arabic">
      <div 
        className="bg-slate-900 border border-slate-700/80 text-white w-full max-w-md shadow-2xl rounded-2xl p-5 sm:p-6 relative my-auto max-h-[92vh] overflow-y-auto"
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

        {/* Supabase Branded Header */}
        <div className="text-center pb-3 border-b border-slate-800">
          <div className="w-12 h-12 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl flex items-center justify-center mx-auto mb-2 text-emerald-400 shadow-xs">
            {/* Supabase Icon */}
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
              <path 
                d="M13.35 2.15a1 1 0 0 0-1.7 0L2.3 16.55a1 1 0 0 0 .85 1.55h8.85l-.5 4.5a1 1 0 0 0 1.7 0l9.35-14.4a1 1 0 0 0-.85-1.55h-8.85l.45-4.5z" 
                fill="url(#supabase-grad)"
              />
              <defs>
                <linearGradient id="supabase-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#3ECF8E" />
                  <stop offset="1" stopColor="#1E8E5A" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <h2 className="text-lg font-bold text-white flex items-center justify-center gap-1.5">
            <span>{mode === 'login' ? (isAr ? 'تسجيل الدخول مع Supabase' : 'Sign In with Supabase') : (isAr ? 'حساب جديد على Supabase' : 'Create Supabase Account')}</span>
          </h2>

          {/* Project indicator badge */}
          <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-slate-800/80 border border-slate-700 text-slate-300">
            <span className={`w-2 h-2 rounded-full ${configured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            <span className="truncate max-w-[210px]">yvybginudnkrgeqixixs.supabase.co</span>
            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className="text-slate-400 hover:text-emerald-400 transition-colors ml-1"
              title={isAr ? 'إعدادات المفتاح' : 'Key Settings'}
            >
              <Settings className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Inline Config Box (shown if anonKey not yet provided or user clicks settings) */}
        {showConfig && (
          <div className="mt-3 p-3 bg-slate-800/80 border border-emerald-500/40 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between text-emerald-400 font-bold">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" />
                {isAr ? 'مفتاح الربط مع Supabase (Anon Key)' : 'Supabase Anon Key'}
              </span>
              <a
                href="https://supabase.com/dashboard/project/yvybginudnkrgeqixixs/settings/api"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 underline"
              >
                <span>{isAr ? 'جلب المفتاح' : 'Get Key'}</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <p className="text-[11px] text-slate-300 leading-tight">
              {isAr 
                ? 'انسخ المفتاح العام (anon public) من إعدادات مشروعك في Supabase والصقه هنا لمرة واحدة فقط:' 
                : 'Paste the anon public key from your Supabase project API settings:'}
            </p>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleSaveConfig}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors shrink-0"
              >
                {isAr ? 'حفظ' : 'Save'}
              </button>
            </div>
          </div>
        )}

        {configSavedNotice && (
          <div className="mt-2.5 p-2 bg-emerald-950/60 border border-emerald-500/40 rounded-lg text-emerald-300 text-xs flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 shrink-0" />
            <span>{isAr ? 'تم حفظ المفتاح وربط Supabase بنجاح!' : 'Supabase credentials saved successfully!'}</span>
          </div>
        )}

        {/* Tab Switch: Login vs Register */}
        <div className="flex border-b border-slate-800 mt-3.5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'text-emerald-400 border-b-2 border-emerald-500 bg-emerald-500/5'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{isAr ? 'تسجيل الدخول' : 'Sign In'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'text-emerald-400 border-b-2 border-emerald-500 bg-emerald-500/5'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{isAr ? 'إنشاء حساب جديد' : 'New Account'}</span>
          </button>
        </div>

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="mt-3 p-2.5 bg-red-950/80 border border-red-500/60 rounded-xl text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mt-3 p-2.5 bg-emerald-950/80 border border-emerald-500/60 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="mt-4 space-y-3">
          {mode === 'register' && (
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                {isAr ? 'الاسم' : 'Name'}
              </label>
              <div className="relative">
                <User className={`w-4 h-4 text-slate-400 absolute ${isAr ? 'right-3' : 'left-3'} top-2.5`} />
                <input
                  type="text"
                  disabled={isLoading || isGitHubLoading}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isAr ? 'اسم المستخدم' : 'Your name'}
                  className={`w-full ${isAr ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500`}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              {isAr ? 'البريد الإلكتروني' : 'Email Address'} <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Mail className={`w-4 h-4 text-slate-400 absolute ${isAr ? 'right-3' : 'left-3'} top-2.5`} />
              <input
                type="email"
                required
                disabled={isLoading || isGitHubLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className={`w-full ${isAr ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono`}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              {isAr ? 'كلمة المرور' : 'Password'} <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Lock className={`w-4 h-4 text-slate-400 absolute ${isAr ? 'right-3' : 'left-3'} top-2.5`} />
              <input
                type="password"
                required
                disabled={isLoading || isGitHubLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full ${isAr ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono`}
              />
            </div>
          </div>

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={isLoading || isGitHubLoading}
            className="w-full py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md mt-2 bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <>
                <span>
                  {mode === 'login'
                    ? (isAr ? 'تسجيل الدخول مع Supabase' : 'Sign In with Supabase')
                    : (isAr ? 'إنشاء حساب جديد مع Supabase' : 'Create Supabase Account')}
                </span>
                <ArrowRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>
        </form>

        {/* GitHub Direct OAuth via Supabase */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <div className="relative flex py-1 items-center mb-2">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-2 text-[10px] text-slate-500 font-bold">
              {isAr ? 'أو الدخول السريع' : 'Or quick sign in'}
            </span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          <button
            type="button"
            disabled={isLoading || isGitHubLoading}
            onClick={handleGitHubSignIn}
            className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-700 hover:border-slate-600 transition-all shadow-xs cursor-pointer"
          >
            {isGitHubLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <>
                <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>{isAr ? 'المتابعة بحساب GitHub (عبر Supabase)' : 'Continue with GitHub (via Supabase)'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
