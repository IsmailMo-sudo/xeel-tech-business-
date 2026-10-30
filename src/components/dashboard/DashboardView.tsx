import React, { useState } from 'react';
import {
  Users,
  FolderKanban,
  Receipt,
  CreditCard,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  ArrowUpRight,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import type { NavItemKey } from '../layout/Sidebar';

interface DashboardViewProps {
  onNavigate: (tab: NavItemKey) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const {
    clients,
    projects,
    invoices,
    payments,
    accounts,
    currentUser,
  } = useApp();

  const [dateFilter, setDateFilter] = useState<'month' | 'last_month' | 'quarter' | 'year'>('month');

  // Database-backed Metrics Calculations
  const totalClients = clients.length;
  const activeProjects = projects.filter(p => p.stage !== 'completed' && p.stage !== 'cancelled').length;
  const completedProjects = projects.filter(p => p.stage === 'completed').length;

  // Receivables from invoices
  const totalReceivables = invoices
    .filter(i => i.status !== 'void' && i.status !== 'draft')
    .reduce((sum, i) => sum + (i.balanceDue || 0), 0);

  const overdueInvoices = invoices.filter(i => i.status === 'overdue');
  const overdueAmount = overdueInvoices.reduce((sum, i) => sum + (i.balanceDue || 0), 0);

  // Revenue from Revenue Accounts (4000, 4100, 4200)
  const totalRevenue = accounts
    .filter(a => a.type === 'revenue')
    .reduce((sum, a) => sum + a.balance, 0);

  // Expenses from Expense Accounts (5xxx)
  const totalExpenses = accounts
    .filter(a => a.type === 'expense')
    .reduce((sum, a) => sum + a.balance, 0);

  const netProfit = totalRevenue - totalExpenses;

  // Liquid Cash & Bank Balances (1010 Cash, 1020 Bank, 1030 Mobile Money)
  const cashAccounts = accounts.filter(a => a.code === '1010' || a.code === '1020' || a.code === '1030');
  const totalCashBank = cashAccounts.reduce((sum, a) => sum + a.balance, 0);

  // Projects distribution
  const stageCounts: Record<string, number> = {
    planning: projects.filter(p => p.stage === 'planning').length,
    in_progress: projects.filter(p => p.stage === 'in_progress').length,
    review: projects.filter(p => p.stage === 'review' || p.stage === 'client_feedback' || p.stage === 'revision').length,
    completed: completedProjects,
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Date Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
            {t.dashboard.title}
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            {t.dashboard.subtitle} • {currentUser.fullName} ({currentUser.role.toUpperCase()})
          </p>
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-xl border border-neutral-200 text-xs">
          <button
            onClick={() => setDateFilter('month')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              dateFilter === 'month' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            {t.dashboard.thisMonth}
          </button>
          <button
            onClick={() => setDateFilter('last_month')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              dateFilter === 'last_month' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            {t.dashboard.lastMonth}
          </button>
          <button
            onClick={() => setDateFilter('quarter')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              dateFilter === 'quarter' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            {t.dashboard.thisQuarter}
          </button>
          <button
            onClick={() => setDateFilter('year')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              dateFilter === 'year' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            {t.dashboard.thisYear}
          </button>
        </div>
      </div>

      {/* Primary Financial & Operational Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">{t.dashboard.monthlyRevenue}</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-neutral-900">
            ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <span>Posted in General Ledger</span>
          </p>
        </div>

        {/* Total Expenses */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">{t.dashboard.monthlyExpenses}</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-neutral-900">
            ${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-neutral-500 font-medium mt-1">
            Studio rent, software, utilities
          </p>
        </div>

        {/* Net Profit */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">{t.dashboard.netProfit}</span>
            <div className="p-2 rounded-xl bg-[#FF5407]/10 text-[#FF5407]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-extrabold ${netProfit >= 0 ? 'text-neutral-900' : 'text-rose-600'}`}>
            ${netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-[#FF5407] font-semibold mt-1">
            Net Margin: {totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) + '%' : '0.0%'}
          </p>
        </div>

        {/* Cash & Bank Balance */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">{t.dashboard.cashBankBalance}</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-neutral-900">
            ${totalCashBank.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-neutral-500 font-medium mt-1">
            Dahabshiil Bank + ZAAD Wallets
          </p>
        </div>
      </div>

      {/* Operational Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Clients */}
        <div
          onClick={() => onNavigate('crm')}
          className="bg-white p-4 rounded-xl border border-neutral-200 flex items-center justify-between cursor-pointer hover:border-[#FF5407] transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-50 text-[#FF5407] group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-neutral-500 font-medium">{t.dashboard.totalClients}</p>
              <h3 className="text-lg font-bold text-neutral-900">{totalClients}</h3>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-[#FF5407] group-hover:translate-x-1 transition-all" />
        </div>

        {/* Active Projects */}
        <div
          onClick={() => onNavigate('projects')}
          className="bg-white p-4 rounded-xl border border-neutral-200 flex items-center justify-between cursor-pointer hover:border-[#FF5407] transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-neutral-500 font-medium">{t.dashboard.activeProjects}</p>
              <h3 className="text-lg font-bold text-neutral-900">{activeProjects}</h3>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-[#FF5407] group-hover:translate-x-1 transition-all" />
        </div>

        {/* Unpaid Receivables */}
        <div
          onClick={() => onNavigate('invoicing')}
          className="bg-white p-4 rounded-xl border border-neutral-200 flex items-center justify-between cursor-pointer hover:border-[#FF5407] transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-105 transition-transform">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-neutral-500 font-medium">{t.dashboard.outstandingReceivables}</p>
              <h3 className="text-lg font-bold text-neutral-900">${totalReceivables.toFixed(2)}</h3>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-[#FF5407] group-hover:translate-x-1 transition-all" />
        </div>

        {/* Overdue Invoices Alert */}
        <div
          onClick={() => onNavigate('invoicing')}
          className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all group ${
            overdueInvoices.length > 0
              ? 'bg-rose-50/50 border-rose-200 hover:border-rose-400'
              : 'bg-white border-neutral-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-100 text-rose-600 group-hover:scale-105 transition-transform">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-neutral-600 font-medium">{t.dashboard.overdueInvoices}</p>
              <h3 className="text-lg font-bold text-rose-600">
                {overdueInvoices.length} (${overdueAmount.toFixed(0)})
              </h3>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-rose-600 group-hover:translate-x-1 transition-all" />
        </div>
      </div>

      {/* Visual Analytics & Production Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue vs Expenses Chart Card */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">{t.dashboard.revenueVsExpenses}</h3>
              <p className="text-[11px] text-neutral-500">Real Ledger entries reconciliation</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5407]"></span> Revenue
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-300"></span> Expenses
              </span>
            </div>
          </div>

          {/* Clean Visual Bar Ratio */}
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="text-neutral-700">Gross Recognized Revenue</span>
                <span className="text-neutral-900">${totalRevenue.toFixed(2)}</span>
              </div>
              <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FF5407] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, totalRevenue > 0 ? (totalRevenue / (totalRevenue + totalExpenses)) * 100 : 0)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="text-neutral-700">Operating Expenditures</span>
                <span className="text-neutral-900">${totalExpenses.toFixed(2)}</span>
              </div>
              <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-neutral-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, totalExpenses > 0 ? (totalExpenses / (totalRevenue + totalExpenses)) * 100 : 0)}%` }}
                ></div>
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="pt-4 border-t border-neutral-100 flex flex-wrap items-center gap-2">
              <button
                onClick={() => onNavigate('invoicing')}
                className="px-3 py-1.5 text-xs font-bold bg-[#FF5407] text-white hover:bg-[#E04703] rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> {t.dashboard.newInvoice}
              </button>
              <button
                onClick={() => onNavigate('crm')}
                className="px-3 py-1.5 text-xs font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> {t.dashboard.newClient}
              </button>
              <button
                onClick={() => onNavigate('projects')}
                className="px-3 py-1.5 text-xs font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> {t.dashboard.newProject}
              </button>
              <button
                onClick={() => onNavigate('payments')}
                className="px-3 py-1.5 text-xs font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <CreditCard className="w-3.5 h-3.5" /> {t.dashboard.recordPayment}
              </button>
            </div>
          </div>
        </div>

        {/* Project Pipeline Card */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-neutral-900">{t.dashboard.projectDistribution}</h3>
            <span className="text-xs text-neutral-500 font-semibold">{projects.length} Total</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-xl text-xs">
              <span className="font-semibold text-neutral-700">Planning & Prep</span>
              <span className="px-2 py-0.5 font-bold bg-blue-100 text-blue-700 rounded-md">{stageCounts.planning}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-xl text-xs">
              <span className="font-semibold text-neutral-700">In Production</span>
              <span className="px-2 py-0.5 font-bold bg-[#FF5407]/15 text-[#FF5407] rounded-md">{stageCounts.in_progress}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-xl text-xs">
              <span className="font-semibold text-neutral-700">Client Review / Revision</span>
              <span className="px-2 py-0.5 font-bold bg-amber-100 text-amber-700 rounded-md">{stageCounts.review}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-xl text-xs">
              <span className="font-semibold text-neutral-700">Completed & Delivered</span>
              <span className="px-2 py-0.5 font-bold bg-emerald-100 text-emerald-700 rounded-md">{stageCounts.completed}</span>
            </div>
          </div>

          {/* Institutional Financing Notice */}
          <div className="mt-4 p-3 bg-neutral-900 text-neutral-200 rounded-xl text-xs">
            <p className="font-bold text-white flex items-center gap-1.5">
              <span>Instant Cash Unlocking</span>
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">
              Have unpaid client invoices? Request an immediate advance with 3.5% transparent fee.
            </p>
            <button
              onClick={() => onNavigate('instantCash')}
              className="mt-2 text-xs font-bold text-[#FF5407] hover:underline flex items-center gap-1"
            >
              <span>Explore Instant Cash Module</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Operational Activity Stream: Recent Invoices & Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-neutral-900">{t.dashboard.recentInvoices}</h3>
            <button
              onClick={() => onNavigate('invoicing')}
              className="text-xs font-bold text-[#FF5407] hover:underline"
            >
              {t.common.view} {t.common.all}
            </button>
          </div>

          <div className="divide-y divide-neutral-100">
            {invoices.length === 0 ? (
              <p className="text-xs text-neutral-500 py-4">{t.dashboard.emptyState}</p>
            ) : (
              invoices.slice(0, 4).map(inv => (
                <div key={inv.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-neutral-900">{inv.invoiceNumber}</p>
                    <p className="text-neutral-500 text-[11px]">{inv.clientName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-neutral-900">${inv.totalAmount.toFixed(2)}</p>
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-md capitalize ${
                        inv.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : inv.status === 'overdue'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Payments Received */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-neutral-900">{t.dashboard.recentPayments}</h3>
            <button
              onClick={() => onNavigate('payments')}
              className="text-xs font-bold text-[#FF5407] hover:underline"
            >
              {t.common.view} {t.common.all}
            </button>
          </div>

          <div className="divide-y divide-neutral-100">
            {payments.length === 0 ? (
              <p className="text-xs text-neutral-500 py-4">No payments recorded yet.</p>
            ) : (
              payments.slice(0, 4).map(pay => (
                <div key={pay.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-neutral-900">{pay.receiptNumber}</p>
                    <p className="text-neutral-500 text-[11px]">{pay.clientName} • {pay.paymentMethod.replace('_', ' ')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600">+${pay.amount.toFixed(2)}</p>
                    <span className="text-[10px] text-neutral-400">{pay.paymentDate}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
