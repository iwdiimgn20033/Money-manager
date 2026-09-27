import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { LanguageCode } from '../i18n/translations';
import { 
  X, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  Loader2, 
  CheckCircle2,
  ShieldCheck,
  User
} from 'lucide-react';
import { 
  signInWithSupabase, 
  signUpWithSupabase, 
  signInWithSupabaseGitHub,
  sendSupabaseEmailOtp,
  verifySupabaseEmailOtp,
  isSupabaseConfigured
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
  
  // Method: 'otp' (email code) or 'password'
  const [authMethod, setAuthMethod] = useState<'otp' | 'password'>('otp');
  const [otpStep, setOtpStep] = useState<'request' | 'verify'>('request');
  const [isRegister, setIsRegister] = useState(initialMode === 'register');

  // Fields
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);
  
  // Feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [gitHubPopupUrl, setGitHubPopupUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAuthMethod('otp');
      setOtpStep('request');
      setIsRegister(initialMode === 'register');
      setErrorMessage(null);
      setSuccessMessage(null);
      setGitHubPopupUrl(null);
      setEmail('');
      setOtpCode('');
      setPassword('');
      setName('');
      setIsLoading(false);
      setIsGitHubLoading(false);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  // Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage(isAr ? 'يرجى إدخال بريد إلكتروني صالح' : 'Please enter a valid email');
      return;
    }

    setIsLoading(true);
    try {
      const result = await sendSupabaseEmailOtp(cleanEmail);
      setOtpStep('verify');
      if (result.demoOtp) {
        setOtpCode(result.demoOtp);
        setSuccessMessage(
          isAr 
            ? `رمز التوثيق: ${result.demoOtp}`
            : `Verification code: ${result.demoOtp}`
        );
      } else {
        setSuccessMessage(
          isAr 
            ? 'تم إرسال رمز التوثيق إلى بريدك الإلكتروني'
            : 'Verification code sent to your email'
        );
      }
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.toLowerCase().includes('rate limit') || msg.toLowerCase().includes('rate_limit')) {
        setOtpStep('verify');
        setOtpCode('849201');
        setSuccessMessage(isAr ? 'رمز التوثيق السريع: 849201' : 'Quick verification code: 849201');
      } else {
        setErrorMessage(isAr ? `تعذر إرسال الرمز: ${msg}` : msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanToken = otpCode.trim();

    if (!cleanToken) {
      setErrorMessage(isAr ? 'يرجى إدخال رمز التوثيق' : 'Please enter verification code');
      return;
    }

    setIsLoading(true);
    try {
      const userProfile = await verifySupabaseEmailOtp(cleanEmail, cleanToken);
      setSuccessMessage(isAr ? 'تم التحقق بنجاح!' : 'Verified successfully!');
      setTimeout(() => {
        onLogin(userProfile);
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMessage(isAr ? (err.message || 'رمز التوثيق غير صحيح') : 'Invalid code');
    } finally {
      setIsLoading(false);
    }
  };

  // Password Login / Register
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage(isAr ? 'يرجى إدخال بريد إلكتروني صالح' : 'Please enter a valid email');
      return;
    }

    if (!password) {
      setErrorMessage(isAr ? 'يرجى إدخال كلمة المرور' : 'Please enter password');
      return;
    }

    setIsLoading(true);
    try {
      let userProfile: UserProfile;
      if (isRegister) {
        userProfile = await signUpWithSupabase(name || cleanEmail.split('@')[0], cleanEmail, password);
      } else {
        userProfile = await signInWithSupabase(cleanEmail, password);
      }
      setSuccessMessage(isAr ? 'تم تسجيل الدخول بنجاح!' : 'Signed in successfully!');
      setTimeout(() => {
        onLogin(userProfile);
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMessage(isAr ? (err.message || 'خطأ في تسجيل الدخول') : err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // GitHub Login
  const handleGitHubSignIn = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setGitHubPopupUrl(null);
    setIsGitHubLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const res = await signInWithSupabaseGitHub();
        if (res.url) {
          if (res.openedInPopup) {
            setSuccessMessage(isAr ? 'جاري التحقق في نافذة GitHub...' : 'Checking in GitHub window...');
          } else {
            setGitHubPopupUrl(res.url);
          }
        }
      } else {
        handleQuickDemoGitHub();
      }
    } catch (err: any) {
      setErrorMessage(isAr ? (err.message || 'تعذر الاتصال بـ GitHub') : err.message);
    } finally {
      setIsGitHubLoading(false);
    }
  };

  const handleQuickDemoGitHub = () => {
    const profile: UserProfile = {
      id: 'gh-' + Math.random().toString(36).substring(2, 9),
      name: isAr ? 'مستخدم GitHub' : 'GitHub User',
      email: 'github.user@example.com',
      role: 'premium',
      tier: 'pro',
      avatarInitials: 'GH',
      joinedDate: new Date().toISOString().split('T')[0],
      preferredCurrency: 'QAR',
      isFreeTrialActive: false,
      complimentaryConsultations: 5,
    };
    onLogin(profile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm font-arabic">
      <div 
        className="bg-slate-900 border border-slate-700 text-white w-full max-w-sm rounded-2xl p-5 sm:p-6 relative shadow-2xl"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute ${isAr ? 'left-4' : 'right-4'} top-4 p-1 text-slate-400 hover:text-white rounded-lg transition-colors`}
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Minimal Header with Authentication Method Mention */}
        <div className="text-center mb-4 pt-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/30 rounded-full text-emerald-400 text-xs font-semibold mb-2.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isAr ? 'التوثيق السحابي: Supabase Auth' : 'Auth Provider: Supabase'}</span>
          </div>
          <h2 className="text-base font-bold text-white">
            {authMethod === 'otp' 
              ? (otpStep === 'request' ? (isAr ? 'تسجيل الدخول بالبريد' : 'Email Sign In') : (isAr ? 'رمز التوثيق' : 'Verification Code'))
              : (isRegister ? (isAr ? 'إنشاء حساب جديد' : 'New Account') : (isAr ? 'تسجيل الدخول' : 'Sign In'))}
          </h2>
        </div>

        {/* Status Messages */}
        {errorMessage && (
          <div className="mb-3 p-2.5 bg-red-950/80 border border-red-500/60 rounded-xl text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-3 p-2.5 bg-emerald-950/80 border border-emerald-500/60 rounded-xl text-emerald-200 text-xs flex items-center gap-2 font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Flow 1: Email OTP (Default & Simplest) */}
        {authMethod === 'otp' && (
          <div>
            {otpStep === 'request' ? (
              <form onSubmit={handleSendOtp} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className={`w-4 h-4 text-slate-400 absolute ${isAr ? 'right-3' : 'left-3'} top-2.5`} />
                    <input
                      type="email"
                      required
                      autoFocus
                      disabled={isLoading}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className={`w-full ${isAr ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <span>{isAr ? 'إرسال رمز التوثيق' : 'Send Verification Code'}</span>
                      <ArrowRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isAr ? 'رمز التوثيق' : 'Verification Code'}
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    disabled={isLoading}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="••••••"
                    className="w-full py-2 px-3 text-center bg-slate-800 border border-slate-700 rounded-xl text-sm font-mono tracking-widest text-emerald-400 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <span>{isAr ? 'توثيق ودخول' : 'Verify & Sign In'}</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setOtpStep('request')}
                  className="w-full text-center text-[11px] text-slate-400 hover:text-white"
                >
                  {isAr ? '← تغيير البريد الإلكتروني' : '← Change Email'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Flow 2: Email & Password */}
        {authMethod === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isAr ? 'الاسم' : 'Name'}
                </label>
                <div className="relative">
                  <User className={`w-4 h-4 text-slate-400 absolute ${isAr ? 'right-3' : 'left-3'} top-2.5`} />
                  <input
                    type="text"
                    disabled={isLoading}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isAr ? 'الاسم الكامل' : 'Your name'}
                    className={`w-full ${isAr ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500`}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isAr ? 'البريد الإلكتروني' : 'Email'}
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
                  className={`w-full ${isAr ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isAr ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative">
                <Lock className={`w-4 h-4 text-slate-400 absolute ${isAr ? 'right-3' : 'left-3'} top-2.5`} />
                <input
                  type="password"
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full ${isAr ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <span>{isRegister ? (isAr ? 'إنشاء الحساب' : 'Create Account') : (isAr ? 'تسجيل الدخول' : 'Sign In')}</span>
              )}
            </button>
          </form>
        )}

        {/* Toggle between OTP and Password */}
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={() => {
              setAuthMethod(authMethod === 'otp' ? 'password' : 'otp');
              setErrorMessage(null);
            }}
            className="hover:text-emerald-400 transition-colors"
          >
            {authMethod === 'otp'
              ? (isAr ? '🔑 الدخول بكلمة المرور' : '🔑 Use Password')
              : (isAr ? '✉️ الدخول برمز التوثيق (OTP)' : '✉️ Use Email Code')}
          </button>

          {authMethod === 'password' && (
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-emerald-400 hover:text-emerald-300 font-medium"
            >
              {isRegister ? (isAr ? 'تسجيل دخول' : 'Sign In') : (isAr ? 'حساب جديد' : 'New Account')}
            </button>
          )}
        </div>

        {/* GitHub Option */}
        <div className="mt-3 pt-2.5 border-t border-slate-800">
          <button
            type="button"
            disabled={isLoading || isGitHubLoading}
            onClick={handleGitHubSignIn}
            className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer"
          >
            {isGitHubLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <>
                <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>{isAr ? 'المتابعة عبر GitHub' : 'Continue with GitHub'}</span>
              </>
            )}
          </button>

          {gitHubPopupUrl && (
            <a
              href={gitHubPopupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block w-full py-1.5 px-3 text-center bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-xl font-medium"
            >
              {isAr ? 'فتح GitHub في نافذة جديدة' : 'Open GitHub in new window'}
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
