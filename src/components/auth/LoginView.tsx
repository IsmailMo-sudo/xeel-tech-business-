import React, { useState } from 'react';
import { Shield, Lock, Mail, Globe, ArrowRight, CheckCircle2 } from 'lucide-react';
import { BrandLogo } from '../brand/BrandLogo';
import { useLanguage } from '../../context/LanguageContext';
import { useApp, DEMO_USERS } from '../../context/AppContext';
import type { UserRole } from '../../types';

export const LoginView: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const { login } = useApp();

  const [email, setEmail] = useState('owner@xeeltech.so');
  const [password, setPassword] = useState('••••••••••••');
  const [selectedRole, setSelectedRole] = useState<UserRole>('owner');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      login(email, selectedRole);
      setIsLoading(false);
    }, 400);
  };

  const handleQuickRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setEmail(DEMO_USERS[role].email);
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetSent(true);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-[#FF5407] selection:text-white">
      {/* Top Language & Location Switcher */}
      <div className="absolute top-6 right-6 flex items-center gap-3">
        <button
          onClick={() => setLanguage(language === 'en' ? 'so' : 'en')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-neutral-200 text-neutral-700 shadow-xs hover:bg-neutral-50 transition-colors"
        >
          <Globe className="w-3.5 h-3.5 text-[#FF5407]" />
          <span>{language === 'en' ? 'Af-Soomaali' : 'English'}</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Authoritative Preserved XEEL TECH Logo & Wordmark */}
        <div className="flex justify-center mb-4">
          <BrandLogo size="xl" showWordmark={true} showTagline={true} />
        </div>
        <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
          {t.auth.loginTitle}
        </h2>
        <p className="mt-1 text-xs text-neutral-500">
          {t.auth.loginSubtitle} • Laascaanood, Somalia
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-neutral-200/80 sm:px-10">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                {t.auth.email}
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[#FF5407] focus:border-[#FF5407]"
                  placeholder="name@xeeltech.so"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-neutral-700">
                  {t.auth.password}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(true);
                    setResetSent(false);
                    setResetEmail(email);
                  }}
                  className="text-xs text-[#FF5407] hover:underline font-semibold"
                >
                  {t.auth.forgotPassword}
                </button>
              </div>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[#FF5407] focus:border-[#FF5407]"
                />
              </div>
            </div>

            {/* Quick Role Selector for Reviewers */}
            <div className="pt-2">
              <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2">
                Fast Role Testing Switcher
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                {(['owner', 'admin', 'accountant', 'manager', 'staff'] as UserRole[]).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleQuickRoleSelect(r)}
                    className={`py-1.5 px-2 rounded-lg font-semibold capitalize text-center transition-all ${
                      selectedRole === r
                        ? 'bg-[#FF5407] text-white shadow-xs'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-[#FF5407] hover:bg-[#E04703] focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-[#FF5407] transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <span>{t.auth.signingIn}</span>
                ) : (
                  <>
                    <span>{t.auth.signIn}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Security footnote */}
          <div className="mt-6 pt-4 border-t border-neutral-100 text-center">
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-500">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>Internal Authorized System • TLS 1.3 Encryption</span>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-neutral-200">
            <h3 className="text-base font-bold text-neutral-900 mb-1">
              {t.auth.resetPassword}
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              {t.auth.resetInstructions}
            </p>

            {resetSent ? (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Password Reset Dispatched</span>
                </div>
                <p>
                  A secure password reset link has been dispatched to <strong>{resetEmail}</strong>. Please check your inbox or spam folder.
                </p>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="mt-2 w-full py-2 bg-emerald-600 text-white rounded-lg font-bold"
                >
                  {t.auth.backToLogin}
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    {t.auth.email}
                  </label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[#FF5407]"
                    placeholder="name@xeeltech.so"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg"
                  >
                    {t.common.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold bg-[#FF5407] hover:bg-[#E04703] text-white rounded-lg shadow-xs"
                  >
                    {t.auth.sendResetLink}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
