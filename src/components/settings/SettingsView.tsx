import React, { useState } from 'react';
import {
  Building,
  CheckCircle2,
  Shield,
  CreditCard,
  Users,
  Save,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import { BrandLogo } from '../brand/BrandLogo';
import type { UserRole } from '../../types';

export const SettingsView: React.FC = () => {
  const { t } = useLanguage();
  const { companySettings, updateCompanySettings, currentUser, switchUserRole } = useApp();

  const [form, setForm] = useState({
    companyName: companySettings.companyName,
    location: companySettings.location,
    phone: companySettings.phone,
    email: companySettings.email,
    website: companySettings.website,
    invoicePrefix: companySettings.invoicePrefix,
    receiptPrefix: companySettings.receiptPrefix,
    taxDefaultRate: companySettings.taxDefaultRate,
    paymentInstructions: companySettings.paymentInstructions,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanySettings({
      ...form,
      taxDefaultRate: Number(form.taxDefaultRate) || 0,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const roleList: { role: UserRole; title: string; desc: string }[] = [
    { role: 'owner', title: 'Business Owner', desc: 'Complete executive & financial governance' },
    { role: 'admin', title: 'Administrator', desc: 'System configuration & client operations' },
    { role: 'accountant', title: 'Chief Accountant', desc: 'General ledger, payments, and invoices' },
    { role: 'manager', title: 'Project Lead', desc: 'Deliverables, milestones, and task allocations' },
    { role: 'staff', title: 'Creative Specialist', desc: 'Assigned design deliverables and tasks' },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
            {t.settings.title}
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">{t.settings.subtitle}</p>
        </div>

        {savedSuccess && (
          <div className="px-3 py-1.5 bg-emerald-50 rounded-xl text-xs font-bold text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings Updated</span>
          </div>
        )}
      </div>

      {/* Brand Identity Preservation Card */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
          <Shield className="w-5 h-5 text-[#FF5407]" />
          <h3 className="text-sm font-bold text-neutral-900">Authoritative Brand Identity</h3>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-neutral-50 rounded-xl border border-neutral-200/80">
          <div className="p-4 bg-white rounded-xl shadow-xs border border-neutral-200">
            <BrandLogo size="lg" showWordmark={true} showTagline={true} />
          </div>
          <div className="text-xs space-y-1.5 text-neutral-600">
            <p className="font-bold text-neutral-900">{t.settings.logoNotice}</p>
            <p>
              Brand Colors: <strong>Primary Orange (#FF5407)</strong>, <strong>Dark Surface (#111111)</strong>, Light Canvas (#F7F7F7).
            </p>
            <p>Font Family: <strong>Outfit</strong> (Google Fonts)</p>
          </div>
        </div>
      </div>

      {/* Business Details Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
            <Building className="w-5 h-5 text-[#FF5407]" />
            <h3 className="text-sm font-bold text-neutral-900">Agency & Company Profile</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Company Name</label>
              <input
                type="text"
                disabled
                value={form.companyName}
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg bg-neutral-100 font-bold text-neutral-600 cursor-not-allowed"
              />
              <span className="text-[10px] text-neutral-400">Strictly locked to official identity.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Official Location / Headquarters
              </label>
              <input
                type="text"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Telephone</label>
              <input
                type="text"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Official Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Financial & Invoicing Defaults */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
            <CreditCard className="w-5 h-5 text-[#FF5407]" />
            <h3 className="text-sm font-bold text-neutral-900">Billing & Payment Presets</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Invoice Prefix</label>
              <input
                type="text"
                value={form.invoicePrefix}
                onChange={e => setForm({ ...form, invoicePrefix: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Receipt Prefix</label>
              <input
                type="text"
                value={form.receiptPrefix}
                onChange={e => setForm({ ...form, receiptPrefix: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Default Tax (%)</label>
              <input
                type="number"
                value={form.taxDefaultRate}
                onChange={e => setForm({ ...form, taxDefaultRate: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Payment Remittance Instructions (Appears on Invoices)
            </label>
            <textarea
              rows={2}
              value={form.paymentInstructions}
              onChange={e => setForm({ ...form, paymentInstructions: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[#FF5407] hover:bg-[#E04703] text-white shadow-xs flex items-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </div>
      </form>

      {/* Role Testing & Simulation */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
          <Users className="w-5 h-5 text-[#FF5407]" />
          <div>
            <h3 className="text-sm font-bold text-neutral-900">User Role Preview Switcher</h3>
            <p className="text-[11px] text-neutral-500">
              Active role: <strong className="text-[#FF5407] capitalize">{currentUser.role}</strong> ({currentUser.fullName})
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {roleList.map(r => (
            <div
              key={r.role}
              onClick={() => switchUserRole(r.role)}
              className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                currentUser.role === r.role
                  ? 'bg-orange-50/50 border-[#FF5407] ring-1 ring-[#FF5407]'
                  : 'bg-white border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-neutral-900">{r.title}</span>
                {currentUser.role === r.role && (
                  <span className="w-2 h-2 rounded-full bg-[#FF5407]"></span>
                )}
              </div>
              <p className="text-[10px] text-neutral-500">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
