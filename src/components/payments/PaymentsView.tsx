import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  Eye,
  Printer,
  Plus,
  X,
  CheckCircle2,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import type { Payment } from '../../types';
import { BrandLogo } from '../brand/BrandLogo';

export const PaymentsView: React.FC = () => {
  const { t } = useLanguage();
  const { payments, invoices, recordPayment, companySettings } = useApp();

  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [viewPayment, setViewPayment] = useState<Payment | null>(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  // Form for manual payment
  const [invoiceId, setInvoiceId] = useState('');
  const [amount, setAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<
    'cash' | 'bank_transfer' | 'mobile_money' | 'other'
  >('mobile_money');
  const [transactionRef, setTransactionRef] = useState('');
  const [notes, setNotes] = useState('');

  const unpaidInvoices = invoices.filter(i => i.balanceDue > 0 && i.status !== 'void');

  const filteredPayments = payments.filter(pay => {
    const matchesSearch =
      pay.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
      pay.clientName.toLowerCase().includes(search.toLowerCase()) ||
      pay.invoiceNumber.toLowerCase().includes(search.toLowerCase());
    const matchesMethod = methodFilter === 'all' || pay.paymentMethod === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const totalCollected = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const handleInvoiceSelect = (id: string) => {
    setInvoiceId(id);
    const selected = invoices.find(i => i.id === id);
    if (selected) {
      setAmount(selected.balanceDue);
      setTransactionRef(`TXN-${Date.now().toString().slice(-6)}`);
    }
  };

  const handleRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const inv = invoices.find(i => i.id === invoiceId);
    if (!inv || amount <= 0) return;

    recordPayment({
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      clientId: inv.clientId,
      clientName: inv.clientName,
      amount: Number(amount),
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod,
      transactionRef: transactionRef || `VOUCHER-${Date.now().toString().slice(-5)}`,
      recordedBy: 'Finance Department',
      notes,
    });

    setIsRecordModalOpen(false);
    setInvoiceId('');
    setAmount(0);
    setTransactionRef('');
    setNotes('');
  };

  const formatMethod = (method: string) => {
    switch (method) {
      case 'mobile_money':
        return 'ZAAD / EVC Mobile Money';
      case 'bank_transfer':
        return 'Dahabshiil Bank Wire';
      case 'cash':
        return 'Cash in Hand';
      default:
        return 'Other Settlement';
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
            {t.payments.title}
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">{t.payments.subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 bg-emerald-50 rounded-xl text-xs font-bold text-emerald-800 border border-emerald-200">
            Total Inflow: <span className="font-extrabold">${totalCollected.toLocaleString()}</span>
          </div>
          <button
            onClick={() => setIsRecordModalOpen(true)}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t.payments.recordPayment}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search receipt #, invoice #, client..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-neutral-200 rounded-lg focus:ring-2 focus:ring-[#FF5407]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-neutral-400" />
          <select
            value={methodFilter}
            onChange={e => setMethodFilter(e.target.value)}
            className="text-xs border border-neutral-200 rounded-lg px-2.5 py-1.5 bg-white font-medium text-neutral-700 focus:outline-hidden"
          >
            <option value="all">All Channels</option>
            <option value="mobile_money">Mobile Money (ZAAD / EVC)</option>
            <option value="bank_transfer">Bank Transfer (Dahabshiil)</option>
            <option value="cash">Cash in Hand</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Receipt #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Invoice Ref</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4 text-right">Amount Received</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-400 text-xs">
                    No payment receipts found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map(pay => (
                  <tr key={pay.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-neutral-900">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-emerald-600" />
                        <span>{pay.receiptNumber}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-neutral-800">{pay.clientName}</div>
                      <div className="text-[10px] text-neutral-400">Ref: {pay.transactionRef}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-neutral-700">
                      {pay.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 text-neutral-600">{pay.paymentDate}</td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-700 border border-neutral-200">
                        {formatMethod(pay.paymentMethod)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-black text-emerald-600 text-sm">
                      +${pay.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setViewPayment(pay)}
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                        title="View Official Receipt Voucher"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Payment Receipt Modal */}
      {viewPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-8">
            <div className="bg-neutral-900 px-6 py-3 flex items-center justify-between text-white no-print">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Official Payment Receipt Voucher
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setViewPayment(null)}
                  className="p-1 text-neutral-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6 text-neutral-900 bg-white">
              <div className="flex items-start justify-between border-b border-neutral-200 pb-5">
                <div>
                  <BrandLogo size="md" showWordmark={true} showTagline={true} />
                  <p className="text-[11px] text-neutral-500 mt-2">
                    {companySettings.location}
                    <br />
                    Official Electronic Receipt
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                    Paid & Cleared
                  </span>
                  <p className="text-xs font-bold text-[#FF5407] mt-1">{viewPayment.receiptNumber}</p>
                  <p className="text-[11px] text-neutral-400">Date: {viewPayment.paymentDate}</p>
                </div>
              </div>

              <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200/80 text-center space-y-1">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Amount Received
                </span>
                <h2 className="text-3xl font-black text-emerald-800">${viewPayment.amount.toFixed(2)}</h2>
                <p className="text-xs text-emerald-600 font-semibold">USD Currency Settled</p>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-neutral-100">
                  <span className="text-neutral-500">Customer / Payer:</span>
                  <span className="font-bold text-neutral-900">{viewPayment.clientName}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-neutral-100">
                  <span className="text-neutral-500">Applied to Invoice:</span>
                  <span className="font-bold text-neutral-900">{viewPayment.invoiceNumber}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-neutral-100">
                  <span className="text-neutral-500">Payment Channel:</span>
                  <span className="font-semibold text-neutral-900">
                    {formatMethod(viewPayment.paymentMethod)}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-neutral-100">
                  <span className="text-neutral-500">Transaction Reference:</span>
                  <span className="font-mono text-neutral-800 font-semibold">
                    {viewPayment.transactionRef}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-neutral-100">
                  <span className="text-neutral-500">Processed By:</span>
                  <span className="text-neutral-700 font-medium">{viewPayment.recordedBy}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-dashed border-neutral-200 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-600 font-bold mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verified Double-Entry Ledger Entry</span>
                </div>
                <p className="text-[10px] text-neutral-400">
                  Thank you for doing business with XEEL TECH. Keep this electronic voucher for your records.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <h3 className="text-base font-bold text-neutral-900">Record Incoming Payment</h3>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordSubmit} className="space-y-3 pt-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Select Unpaid Invoice *
                </label>
                <select
                  required
                  value={invoiceId}
                  onChange={e => handleInvoiceSelect(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                >
                  <option value="">Choose Invoice...</option>
                  {unpaidInvoices.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} - {inv.clientName} (Due: ${inv.balanceDue.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Amount Received ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs font-bold border border-neutral-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={e =>
                    setPaymentMethod(
                      e.target.value as 'cash' | 'bank_transfer' | 'mobile_money' | 'other'
                    )
                  }
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                >
                  <option value="mobile_money">Mobile Money (ZAAD / EVC Plus / eDahab)</option>
                  <option value="bank_transfer">Bank Transfer (Dahabshiil Bank / IBS)</option>
                  <option value="cash">Cash in Hand</option>
                  <option value="other">Other Method</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Transaction / Voucher Ref *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ZAAD Ref 8829103"
                  value={transactionRef}
                  onChange={e => setTransactionRef(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Internal Notes</label>
                <input
                  type="text"
                  placeholder="Optional notes..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs"
                >
                  Save & Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
