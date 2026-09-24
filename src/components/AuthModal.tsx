import React, { useState, useEffect } from 'react';
import { UserProfile, SUPPORTED_CURRENCIES } from '../types';
import { LanguageCode } from '../i18n/translations';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  Check, 
  Sparkles, 
  Eye, 
  EyeOff, 
  Coins, 
  AlertCircle, 
  UserPlus, 
  LogIn, 
  KeyRound, 
  Loader2, 
  Crown, 
  CheckCircle2, 
  ShieldCheck, 
  Database, 
  Settings 
} from 'lucide-react';
import { 
  registerWithFirebase, 
  loginWithFirebase, 
  loginWithGoogleFirebase 
} from '../lib/firebase';
import { 
  signInWithSupabase, 
  signUpWithSupabase, 
  signInWithSupabaseGitHub, 
  isSupabaseConfigured 
} from '../lib/supabase';
import { SupabaseConfigModal } from './SupabaseConfigModal';

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
  initialMode = 'register',
}) => {
  const isAr = currentLanguage === 'ar';
  
  // Navigation: 'register' (Account creation) or 'login' (Sign in)
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [authEngine, setAuthEngine] = useState<'firebase' | 'supabase'>('firebase');
  const [isSupabaseConfigOpen, setIsSupabaseConfigOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [preferredCurrency, setPreferredCurrency] = useState('QAR');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Feedback & Validation
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync initialMode when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMessage(null);
      setSuccessMessage(null);
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setIsLoading(false);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  // Handle Free Pro Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      setErrorMessage(isAr ? 'يرجى إدخال الاسم الكامل' : 'Please enter your full name');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMessage(isAr ? 'يرجى إدخال بريد إلكتروني صالح' : 'Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setErrorMessage(isAr ? 'كلمة المرور يجب أن لا تقل عن 6 خانات' : 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      let userProfile: UserProfile;

      if (authEngine === 'supabase') {
        if (!isSupabaseConfigured()) {
          setIsSupabaseConfigOpen(true);
          setIsLoading(false);
          return;
        }
        userProfile = await signUpWithSupabase(cleanName, cleanEmail, password, preferredCurrency);
      } else {
        userProfile = await registerWithFirebase(
          cleanName,
          cleanEmail,
          password,
          preferredCurrency,
          'pro'
        );
      }

      setSuccessMessage(
        isAr 
          ? `تم تفعيل حسابك الاحترافي (Pro) مجاناً بنجاح! أهلاً بك يا ${cleanName}`
          : `Free Pro account activated successfully! Welcome ${cleanName}`
      );

      setTimeout(() => {
        onLogin(userProfile);
        onClose();
      }, 700);
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      console.error('Registration error:', err);
      if (error.code === 'auth/email-already-in-use' || error.message?.includes('User already registered')) {
        setErrorMessage(isAr ? 'هذا البريد الإلكتروني مسجل بالفعل، يرجى تسجيل الدخول' : 'Email is already registered. Please log in.');
      } else if (error.code === 'auth/weak-password') {
        setErrorMessage(isAr ? 'كلمة المرور ضعيفة، يرجى اختيار كلمة مرور أقوى' : 'Password is too weak.');
      } else if (error.code === 'auth/invalid-email') {
        setErrorMessage(isAr ? 'صيغة البريد الإلكتروني غير صحيحة' : 'Invalid email format.');
      } else {
        setErrorMessage(isAr ? 'حدث خطأ أثناء إنشاء الحساب: ' + (error.message || 'حاول مجدداً') : (error.message || 'Registration failed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in existing user
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage(isAr ? 'يرجى إدخال البريد الإلكتروني' : 'Please enter your email');
      return;
    }

    if (!password) {
      setErrorMessage(isAr ? 'يرجى إدخال كلمة المرور' : 'Please enter your password');
      return;
    }

    setIsLoading(true);
    try {
      let userProfile: UserProfile;

      if (authEngine === 'supabase') {
        if (!isSupabaseConfigured()) {
          setIsSupabaseConfigOpen(true);
          setIsLoading(false);
          return;
        }
        userProfile = await signInWithSupabase(cleanEmail, password);
      } else {
        userProfile = await loginWithFirebase(cleanEmail, password);
      }

      setSuccessMessage(isAr ? 'تم تسجيل الدخول بنجاح، جاري التحميل...' : 'Signed in successfully...');
      setTimeout(() => {
        onLogin(userProfile);
        onClose();
      }, 500);
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      console.error('Login error:', err);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential' || error.message?.includes('Invalid login credentials')) {
        setErrorMessage(isAr ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Invalid email or password.');
      } else {
        setErrorMessage(isAr ? 'تعذر تسجيل الدخول: ' + (error.message || 'يرجى المحاولة مرة أخرى') : (error.message || 'Login failed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const userProfile = await loginWithGoogleFirebase(preferredCurrency, 'pro');
      setSuccessMessage(isAr ? `مرحباً بك ${userProfile.name}! تم تفعيل حساب Pro المجاني.` : `Welcome ${userProfile.name}! Free Pro active.`);
      setTimeout(() => {
        onLogin(userProfile);
        onClose();
      }, 500);
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code !== 'auth/popup-closed-by-user') {
        setErrorMessage(isAr ? 'تعذر إتمام الدخول بحساب Google' : (error.message || 'Google sign-in failed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    if (!isSupabaseConfigured()) {
      setIsSupabaseConfigOpen(true);
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await signInWithSupabaseGitHub();
    } catch (err: any) {
      console.error('Supabase GitHub error:', err);
      if (err.message === 'SUPABASE_NOT_CONFIGURED') {
        setIsSupabaseConfigOpen(true);
      } else {
        setErrorMessage(
          isAr 
            ? `تعذر تسجيل الدخول عبر GitHub: ${err.message || 'تأكد من تفعيل موفر GitHub في مشروع Supabase'}` 
            : `GitHub sign-in error: ${err.message || 'Make sure GitHub provider is enabled in Supabase'}`
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto font-arabic">
        <div 
          className="bg-slate-900 border border-slate-700/90 text-white w-full max-w-lg shadow-2xl rounded-2xl p-5 sm:p-7 relative my-auto max-h-[92vh] overflow-y-auto"
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
            <div className="w-12 h-12 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-2xl font-mono font-black flex items-center justify-center mx-auto mb-2 text-base shadow-xs">
              <Crown className="w-6 h-6 text-amber-400" />
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-wide text-white flex items-center justify-center gap-2">
              <span>
                {mode === 'register' 
                  ? (isAr ? 'تسجيل حساب احترافي (Pro)' : 'Create Free Pro Account') 
                  : (isAr ? 'تسجيل الدخول إلى حسابك' : 'Sign In to Account')}
              </span>
              {mode === 'register' && (
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {isAr ? 'مجاني 100%' : '100% Free'}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isAr 
                ? 'الوصول الكامل إلى كافة الأدوات المحاسبية والقوائم المالية بدون أي رسوم اشتراك'
                : 'Full access to professional accounting & financial statements with zero subscription fees'}
            </p>
          </div>

          {/* Mode Switch (Register vs Login) */}
          <div className="flex border-b border-slate-800 mt-4">
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2.5 text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                mode === 'register'
                  ? 'text-amber-400 border-b-2 border-amber-500 bg-amber-500/5'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{isAr ? 'تسجيل حساب احترافي مجاني' : 'Register Free Pro'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2.5 text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'text-blue-400 border-b-2 border-blue-500 bg-blue-500/5'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{isAr ? 'تسجيل دخول مشترك' : 'Member Sign In'}</span>
            </button>
          </div>

          {/* Cloud Auth Provider Toggle (Direct Firebase vs Supabase) */}
          <div className="mt-3.5 p-1.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center gap-1">
            <button
              type="button"
              onClick={() => setAuthEngine('firebase')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                authEngine === 'firebase'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isAr ? 'حساب النظام المباشر' : 'Direct Cloud Auth'}</span>
            </button>
            <button
              type="button"
              onClick={() => setAuthEngine('supabase')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                authEngine === 'supabase'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isAr ? 'حساب Supabase السحابي' : 'Supabase Auth'}</span>
            </button>
          </div>

          {/* FEEDBACK ALERTS */}
          {errorMessage && (
            <div className="mt-3 p-3 bg-red-950/80 border border-red-500/60 rounded-xl text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mt-3 p-3 bg-emerald-950/80 border border-emerald-500/60 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* MODE: REGISTER                                                */}
          {/* ------------------------------------------------------------- */}
          {mode === 'register' && (
            <div className="mt-4 space-y-4">
              <form onSubmit={handleRegister} className="space-y-3">
                {/* Full Name */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    {isAr ? 'الاسم الكامل أو اسم المؤسسة' : 'Full Name or Entity'} <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <User className={`w-4 h-4 text-slate-400 absolute ${isAr ? 'right-3' : 'left-3'} top-2.5`} />
                    <input
                      type="text"
                      required
                      disabled={isLoading}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={isAr ? 'مثال: محمد بن راشد' : 'e.g. John Doe'}
                      className={`w-full ${isAr ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500`}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    {isAr ? 'البريد الإلكتروني' : 'Email Address'} <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className={`w-4 h-4 text-slate-400 absolute ${isAr ? 'right-3' : 'left-3'} top-2.5`} />
                    <input
                      type="email"
                      required
                      disabled={isLoading}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className={`w-full ${isAr ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono`}
                    />
                  </div>
                </div>

                {/* Password & Confirm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      {isAr ? 'كلمة المرور' : 'Password'} <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Lock className={`w-4 h-4 text-slate-400 absolute ${isAr ? 'right-3' : 'left-3'} top-2.5`} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        disabled={isLoading}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full ${isAr ? 'pr-9 pl-8' : 'pl-9 pr-8'} py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute ${isAr ? 'left-2.5' : 'right-2.5'} top-2.5 text-slate-400 hover:text-slate-200`}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      {isAr ? 'تأكيد كلمة المرور' : 'Confirm Password'} <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <KeyRound className={`w-4 h-4 text-slate-400 absolute ${isAr ? 'right-3' : 'left-3'} top-2.5`} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        disabled={isLoading}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full ${isAr ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono`}
                      />
                    </div>
                  </div>
                </div>

                {/* Currency Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    {isAr ? 'العملة الأساسية للحساب' : 'Base Currency'}
                  </label>
                  <div className="relative">
                    <Coins className={`w-4 h-4 text-slate-400 absolute ${isAr ? 'right-3' : 'left-3'} top-2.5`} />
                    <select
                      value={preferredCurrency}
                      disabled={isLoading}
                      onChange={(e) => setPreferredCurrency(e.target.value)}
                      className={`w-full ${isAr ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500`}
                    >
                      {SUPPORTED_CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.code} - {c.name} ({c.symbol})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 text-xs font-black rounded-xl flex items-center justify-center gap-2 transition-all shadow-md mt-4 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-600 hover:to-amber-700 text-slate-950 cursor-pointer"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  ) : (
                    <>
                      <Crown className="w-4 h-4 text-slate-950" />
                      <span>
                        {authEngine === 'supabase'
                          ? (isAr ? 'إنشاء الحساب عبر Supabase Auth' : 'Register via Supabase Auth')
                          : (isAr ? 'إنشاء الحساب وتفعيل Pro مجاناً بالكامل' : 'Create Free Pro Account Now')}
                      </span>
                      <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>
              </form>

              {/* Social Logins */}
              <div className="pt-2 space-y-2">
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-800"></div>
                  <span className="flex-shrink mx-3 text-[11px] text-slate-500 font-bold">{isAr ? 'خيارات التسجيل السريع' : 'Quick Social Sign In'}</span>
                  <div className="flex-grow border-t border-slate-800"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Google */}
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={handleGoogleSignIn}
                    className="py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-300 transition-all shadow-xs cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Google</span>
                  </button>

                  {/* GitHub via Supabase */}
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={handleGitHubSignIn}
                    className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-700 hover:border-slate-600 transition-all shadow-xs cursor-pointer"
                  >
                    <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                    <span>GitHub (Supabase)</span>
                  </button>
                </div>

                {/* Configure Supabase button */}
                <div className="pt-1 text-center">
                  <button
                    type="button"
                    onClick={() => setIsSupabaseConfigOpen(true)}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Settings className="w-3 h-3" />
                    <span>{isAr ? '⚙️ ربط وإعداد مشروع Supabase الخاص بك' : '⚙️ Connect & Configure Your Supabase Project'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* MODE: LOGIN                                                   */}
          {/* ------------------------------------------------------------- */}
          {mode === 'login' && (
            <div className="mt-4 space-y-4">
              <form onSubmit={handleLogin} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    {isAr ? 'البريد الإلكتروني' : 'Email Address'} <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className={`w-4 h-4 text-slate-400 absolute ${isAr ? 'right-3' : 'left-3'} top-2.5`} />
                    <input
                      type="email"
                      required
                      disabled={isLoading}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className={`w-full ${isAr ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono`}
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
                      type={showPassword ? 'text' : 'password'}
                      required
                      disabled={isLoading}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full ${isAr ? 'pr-9 pl-8' : 'pl-9 pr-8'} py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute ${isAr ? 'left-2.5' : 'right-2.5'} top-2.5 text-slate-400 hover:text-slate-200`}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md mt-3 cursor-pointer"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <span>
                        {authEngine === 'supabase'
                          ? (isAr ? 'تسجيل الدخول عبر Supabase' : 'Sign In via Supabase')
                          : (isAr ? 'تسجيل الدخول' : 'Sign In')}
                      </span>
                      <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>
              </form>

              {/* Social Logins */}
              <div className="pt-2 space-y-2">
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-800"></div>
                  <span className="flex-shrink mx-3 text-[11px] text-slate-500 font-bold">{isAr ? 'أو عبر الحسابات السحابية' : 'Or with Cloud Accounts'}</span>
                  <div className="flex-grow border-t border-slate-800"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Google */}
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={handleGoogleSignIn}
                    className="py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-300 transition-all shadow-xs cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Google</span>
                  </button>

                  {/* GitHub via Supabase */}
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={handleGitHubSignIn}
                    className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-700 hover:border-slate-600 transition-all shadow-xs cursor-pointer"
                  >
                    <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                    <span>GitHub (Supabase)</span>
                  </button>
                </div>

                {/* Configure Supabase button */}
                <div className="pt-1 text-center">
                  <button
                    type="button"
                    onClick={() => setIsSupabaseConfigOpen(true)}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Settings className="w-3 h-3" />
                    <span>{isAr ? '⚙️ ربط وإعداد مشروع Supabase الخاص بك' : '⚙️ Connect & Configure Your Supabase Project'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Supabase Connection & GitHub Setup Modal */}
      <SupabaseConfigModal
        isOpen={isSupabaseConfigOpen}
        onClose={() => setIsSupabaseConfigOpen(false)}
        currentLanguage={currentLanguage}
      />
    </>
  );
};
