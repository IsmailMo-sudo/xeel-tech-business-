import React, { useState } from 'react';
import {
  Search,
  Bell,
  Globe,
  Database,
  Menu,
  Shield,
  CheckCircle,
  X,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import type { UserRole } from '../../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onOpenSearch }) => {
  const { language, setLanguage, t } = useLanguage();
  const { currentUser, switchUserRole, notifications, markNotificationRead, companySettings, logout } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadNotifications = notifications.filter(n => !n.read);

  const roles: { role: UserRole; label: string; desc: string }[] = [
    { role: 'owner', label: t.auth.ownerRole, desc: 'Full business & financial access' },
    { role: 'admin', label: t.auth.adminRole, desc: 'Operations & client management' },
    { role: 'accountant', label: t.auth.accountantRole, desc: 'General ledger, payments, & invoices' },
    { role: 'manager', label: t.auth.managerRole, desc: 'Projects, tasks, & team oversight' },
    { role: 'staff', label: t.auth.staffRole, desc: 'Assigned tasks & specialist deliverables' },
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-neutral-200 px-4 md:px-6 flex items-center justify-between shadow-xs">
      {/* Left: Mobile hamburger & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 lg:hidden focus:outline-hidden"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search bar */}
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-neutral-500 bg-neutral-100 hover:bg-neutral-200/80 rounded-lg border border-transparent hover:border-neutral-300 transition-colors text-left"
        >
          <Search className="w-4 h-4 text-neutral-400" />
          <span className="flex-1 truncate">{t.common.search} (Ctrl+K)</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-neutral-500 bg-white border border-neutral-200 rounded">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Supabase / Database Status indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 border border-neutral-200 text-neutral-700">
          <Database className={`w-3.5 h-3.5 ${companySettings.supabaseConnected ? 'text-emerald-500' : 'text-amber-500'}`} />
          <span>{companySettings.supabaseConnected ? 'Supabase Live' : 'Local Storage Mode'}</span>
          <span className={`w-2 h-2 rounded-full ${companySettings.supabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></span>
        </div>

        {/* Language Switcher */}
        <div className="relative">
          <button
            onClick={() => setLanguage(language === 'en' ? 'so' : 'en')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-700 transition-colors"
            title="Switch Language (Af-Soomaali / English)"
          >
            <Globe className="w-4 h-4 text-[#FF5407]" />
            <span className="uppercase">{language}</span>
          </button>
        </div>

        {/* Notifications center */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#FF5407] rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="p-3.5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-neutral-900">{t.nav.notifications}</h4>
                  <span className="px-1.5 py-0.5 text-xs font-semibold bg-[#FF5407]/10 text-[#FF5407] rounded-full">
                    {unreadNotifications.length}
                  </span>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1 rounded-md text-neutral-400 hover:text-neutral-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-neutral-500">
                    No new notifications
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-3 text-xs cursor-pointer transition-colors ${
                        n.read ? 'bg-white opacity-70 hover:opacity-100' : 'bg-orange-50/40 hover:bg-orange-50/70'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-neutral-900">{n.title}</p>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-[#FF5407] flex-shrink-0 mt-1"></span>}
                      </div>
                      <p className="text-neutral-600 mt-1 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-neutral-400 mt-1.5">
                        {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Role Switcher Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1.5 pl-2 rounded-lg hover:bg-neutral-100 transition-colors border border-transparent hover:border-neutral-200"
          >
            <div className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-xs">
              {currentUser.fullName.charAt(0)}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-neutral-900 leading-tight">
                {currentUser.fullName.split(' ')[0]}
              </span>
              <span className="text-[10px] font-semibold text-[#FF5407] capitalize">
                {currentUser.role}
              </span>
            </div>
          </button>

          {/* User & Role Modal Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 p-2 overflow-hidden">
              <div className="p-3 border-b border-neutral-100 bg-neutral-50 rounded-lg mb-2">
                <p className="text-xs font-bold text-neutral-900">{currentUser.fullName}</p>
                <p className="text-[11px] text-neutral-500 truncate">{currentUser.email}</p>
                <div className="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-neutral-600">
                  <Shield className="w-3.5 h-3.5 text-[#FF5407]" />
                  <span>Role: <strong className="capitalize text-neutral-900">{currentUser.role}</strong></span>
                </div>
              </div>

              <div className="px-2 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                Switch Role Preview
              </div>

              <div className="space-y-0.5">
                {roles.map(r => (
                  <button
                    key={r.role}
                    onClick={() => {
                      switchUserRole(r.role);
                      setShowUserMenu(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                      currentUser.role === r.role
                        ? 'bg-[#FF5407]/10 text-[#FF5407] font-bold'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{r.label}</div>
                      <div className="text-[10px] text-neutral-400">{r.desc}</div>
                    </div>
                    {currentUser.role === r.role && <CheckCircle className="w-4 h-4 text-[#FF5407]" />}
                  </button>
                ))}
              </div>

              <div className="border-t border-neutral-100 mt-2 pt-2">
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  {t.auth.signOut}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
