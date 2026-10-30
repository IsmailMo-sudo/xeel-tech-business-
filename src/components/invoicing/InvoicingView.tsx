import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Eye,
  Printer,
  DollarSign,
  Share2,
  Trash2,
  X,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import type { Invoice, InvoiceItem, InvoiceStatus } from '../../types';
import { BrandLogo } from '../brand/BrandLogo';

export const InvoicingView: React.FC = () => {
  const { t, language } = useLanguage();
  const {
    invoices,
    clients,
    services,
    createInvoice,
    updateInvoiceStatus,
    recordPayment,
    companySettings,
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);

  // Form State for New Invoice
  const [selectedClientId, setSelectedClientId] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
  );
  const [items, setItems] = useState<Omit<InvoiceItem, 'id' | 'total'>[]>([
    { serviceId: '', description: '', quantity: 1, unitPrice: 0, discount: 0 },
  ]);
  const [taxRate, setTaxRate] = useState(0);
  const [paymentTerms, setPaymentTerms] = useState(
    'Payment due within 15 calendar days from issuance. Direct payments via Dahabshiil or ZAAD.'
  );

  // Payment Quick Modal State
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<'cash' | 'bank_transfer' | 'mobile_money' | 'other'>(
    'mobile_money'
  );
  const [payRef, setPayRef] = useState('');

  // Filtering
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate totals for new invoice form
  const computedItems = items.map((it, idx) => {
    const qty = Number(it.quantity) || 1;
    const price = Number(it.unitPrice) || 0;
    const disc = Number(it.discount) || 0;
    const total = Math.max(0, qty * price - disc);
    return { ...it, id: `new-item-${idx}`, total };
  });

  const subtotal = computedItems.reduce((sum, it) => sum + it.total, 0);
  const taxAmount = (subtotal * (Number(taxRate) || 0)) / 100;
  const grandTotal = subtotal + taxAmount;

  const handleAddItem = () => {
    setItems([
      ...items,
      { serviceId: '', description: '', quantity: 1, unitPrice: 0, discount: 0 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, idx) => idx !== index));
    }
  };

  const handleServiceSelect = (index: number, serviceId: string) => {
    const srv = services.find(s => s.id === serviceId);
    if (!srv) return;
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      serviceId,
      description: language === 'so' ? srv.nameSo : srv.nameEn,
      unitPrice: srv.defaultPrice,
    };
    setItems(updated);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(c => c.id === selectedClientId);
    if (!client || computedItems.length === 0) return;

    createInvoice({
      clientId: client.id,
      clientName: client.companyName || client.name,
      clientPhone: client.phone,
      clientEmail: client.email,
      clientAddress: client.address,
      issueDate,
      dueDate,
      items: computedItems,
      subtotal,
      discount: 0,
      taxRate: Number(taxRate) || 0,
      taxAmount,
      totalAmount: grandTotal,
      paymentInstructions: companySettings.paymentInstructions,
      terms: paymentTerms,
    });

    setIsCreateModalOpen(false);
    // Reset form
    setSelectedClientId('');
    setItems([{ serviceId: '', description: '', quantity: 1, unitPrice: 0, discount: 0 }]);
  };

  const handleOpenPayment = (inv: Invoice) => {
    setPaymentInvoice(inv);
    setPayAmount(inv.balanceDue);
    setPayRef(`TXN-${Date.now().toString().slice(-6)}`);
    setIsPaymentModalOpen(true);
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentInvoice || payAmount <= 0) return;

    recordPayment({
      invoiceId: paymentInvoice.id,
      invoiceNumber: paymentInvoice.invoiceNumber,
      clientId: paymentInvoice.clientId,
      clientName: paymentInvoice.clientName,
      amount: Number(payAmount),
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: payMethod,
      transactionRef: payRef,
      recordedBy: 'Accounting Specialist',
      notes: `Settlement for invoice ${paymentInvoice.invoiceNumber}`,
    });

    setIsPaymentModalOpen(false);
    setPaymentInvoice(null);
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'partially_paid':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'issued':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'overdue':
        return 'bg-rose-100 text-rose-800 border-rose-200 animate-pulse';
      case 'void':
        return 'bg-neutral-100 text-neutral-500 border-neutral-200';
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
            {t.invoicing.title}
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">{t.invoicing.subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-[#FF5407] hover:bg-[#E04703] text-white shadow-xs flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t.invoicing.createInvoice}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search invoice number, client..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-neutral-200 rounded-lg focus:ring-2 focus:ring-[#FF5407]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-neutral-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs border border-neutral-200 rounded-lg px-2.5 py-1.5 bg-white font-medium text-neutral-700 focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="issued">Issued</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="void">Void</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Issue / Due Date</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-400 text-xs">
                    No invoices found. Click "Create Invoice" to issue a new bill.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-neutral-900">
                      <div className="flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-[#FF5407]" />
                        <span>{inv.invoiceNumber}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-neutral-800">{inv.clientName}</div>
                      <div className="text-[10px] text-neutral-400">{inv.clientPhone}</div>
                    </td>
                    <td className="py-3 px-4 text-neutral-600">
                      <div>Issued: {inv.issueDate}</div>
                      <div className="text-[10px] text-neutral-400">Due: {inv.dueDate}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-neutral-900">
                      ${inv.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-[#FF5407]">
                      ${inv.balanceDue.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize ${getStatusBadge(
                          inv.status
                        )}`}
                      >
                        {inv.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewInvoice(inv)}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                          title="View / Print Invoice"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {inv.balanceDue > 0 && inv.status !== 'void' && (
                          <button
                            onClick={() => handleOpenPayment(inv)}
                            className="px-2 py-1 text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg flex items-center gap-1 transition-colors"
                            title="Record Customer Payment"
                          >
                            <DollarSign className="w-3 h-3" />
                            <span>Pay</span>
                          </button>
                        )}
                        {inv.status === 'issued' && (
                          <button
                            onClick={() => updateInvoiceStatus(inv.id, 'void')}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                            title="Void Invoice"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Details / Print Preview Modal */}
      {viewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-8">
            {/* Modal Controls */}
            <div className="bg-neutral-900 px-6 py-3 flex items-center justify-between text-white no-print">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Invoice Preview • {viewInvoice.invoiceNumber}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <a
                  href={`https://wa.me/${viewInvoice.clientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Assalaamu Calaykum, here is your invoice ${viewInvoice.invoiceNumber} for $${viewInvoice.totalAmount.toFixed(
                      2
                    )} from XEEL TECH. Outstanding balance: $${viewInvoice.balanceDue.toFixed(2)}.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
                <button
                  onClick={() => setViewInvoice(null)}
                  className="p-1 text-neutral-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="p-8 space-y-6 text-neutral-900 bg-white">
              <div className="flex items-start justify-between border-b border-neutral-200 pb-6">
                <div>
                  <BrandLogo size="lg" showWordmark={true} showTagline={true} />
                  <p className="text-xs text-neutral-500 mt-2">
                    {companySettings.location}
                    <br />
                    Phone: {companySettings.phone} • Email: {companySettings.email}
                  </p>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-black text-neutral-900 tracking-tight">TAX INVOICE</h2>
                  <p className="text-sm font-bold text-[#FF5407]">{viewInvoice.invoiceNumber}</p>
                  <div className="text-xs text-neutral-500 mt-1 space-y-0.5">
                    <div>Issue Date: {viewInvoice.issueDate}</div>
                    <div>Payment Due: {viewInvoice.dueDate}</div>
                  </div>
                </div>
              </div>

              {/* Bill To */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80">
                  <p className="font-bold text-neutral-400 uppercase text-[10px] tracking-wider mb-1">
                    Billed To:
                  </p>
                  <p className="font-extrabold text-sm text-neutral-900">{viewInvoice.clientName}</p>
                  <p className="text-neutral-600">{viewInvoice.clientAddress || 'Laascaanood, Somalia'}</p>
                  <p className="text-neutral-600">Phone: {viewInvoice.clientPhone}</p>
                  <p className="text-neutral-600">Email: {viewInvoice.clientEmail}</p>
                </div>

                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 flex flex-col justify-between">
                  <div>
                    <p className="font-bold text-neutral-400 uppercase text-[10px] tracking-wider mb-1">
                      Status & Terms:
                    </p>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize ${getStatusBadge(
                        viewInvoice.status
                      )}`}
                    >
                      {viewInvoice.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-2">{viewInvoice.terms}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-neutral-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-100 text-neutral-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {viewInvoice.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-3 font-semibold text-neutral-900">
                          {item.description}
                        </td>
                        <td className="py-2.5 px-3 text-center">{item.quantity}</td>
                        <td className="py-2.5 px-3 text-right">${item.unitPrice.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-neutral-900">
                          ${item.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Calculation Summary */}
              <div className="flex justify-end text-xs">
                <div className="w-64 space-y-1.5 border-t border-neutral-200 pt-3">
                  <div className="flex justify-between text-neutral-600">
                    <span>Subtotal:</span>
                    <span>${viewInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  {viewInvoice.taxAmount > 0 && (
                    <div className="flex justify-between text-neutral-600">
                      <span>Tax ({viewInvoice.taxRate}%):</span>
                      <span>${viewInvoice.taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-extrabold text-sm text-neutral-900 pt-1 border-t border-neutral-200">
                    <span>Total Amount:</span>
                    <span>${viewInvoice.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Amount Paid:</span>
                    <span>-${viewInvoice.amountPaid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-[#FF5407] pt-1 border-t border-neutral-300">
                    <span>Balance Due:</span>
                    <span>${viewInvoice.balanceDue.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment instructions */}
              <div className="p-4 bg-orange-50/60 rounded-xl border border-orange-200/80 text-xs text-neutral-700 space-y-1">
                <p className="font-bold text-[#FF5407] uppercase text-[10px] tracking-wider">
                  Official Remittance Channels:
                </p>
                <p>{viewInvoice.paymentInstructions}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Invoice Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <h3 className="text-base font-bold text-neutral-900">Issue New Invoice</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Select Client *
                  </label>
                  <select
                    required
                    value={selectedClientId}
                    onChange={e => setSelectedClientId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[#FF5407]"
                  >
                    <option value="">Choose Client...</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.companyName ? `${c.companyName} (${c.name})` : c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Issue Date</label>
                    <input
                      type="date"
                      value={issueDate}
                      onChange={e => setIssueDate(e.target.value)}
                      className="w-full px-2 py-2 text-xs border border-neutral-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={e => setDueDate(e.target.value)}
                      className="w-full px-2 py-2 text-xs border border-neutral-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Line items section */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                    Service Line Items
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs text-[#FF5407] font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Line</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 grid grid-cols-12 gap-2 items-center"
                    >
                      <div className="col-span-5">
                        <select
                          value={item.serviceId}
                          onChange={e => handleServiceSelect(idx, e.target.value)}
                          className="w-full mb-1 text-xs border border-neutral-200 rounded px-2 py-1 bg-white font-medium"
                        >
                          <option value="">Preset Service...</option>
                          {services.map(s => (
                            <option key={s.id} value={s.id}>
                              {s.nameEn} (${s.defaultPrice})
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          required
                          placeholder="Description..."
                          value={item.description}
                          onChange={e => {
                            const updated = [...items];
                            updated[idx].description = e.target.value;
                            setItems(updated);
                          }}
                          className="w-full text-xs px-2 py-1 border border-neutral-200 rounded bg-white"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] text-neutral-500">Qty</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => {
                            const updated = [...items];
                            updated[idx].quantity = Number(e.target.value) || 1;
                            setItems(updated);
                          }}
                          className="w-full text-xs px-2 py-1 border border-neutral-200 rounded bg-white"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] text-neutral-500">Price ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={e => {
                            const updated = [...items];
                            updated[idx].unitPrice = Number(e.target.value) || 0;
                            setItems(updated);
                          }}
                          className="w-full text-xs px-2 py-1 border border-neutral-200 rounded bg-white font-bold"
                        />
                      </div>
                      <div className="col-span-2 text-right">
                        <span className="block text-[10px] text-neutral-500">Total</span>
                        <span className="text-xs font-black text-neutral-900">
                          ${(
                            (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0)
                          ).toFixed(2)}
                        </span>
                      </div>
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-neutral-400 hover:text-rose-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculation */}
              <div className="bg-neutral-100 p-3 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-neutral-600 font-semibold">Tax Rate (%):</span>
                  <input
                    type="number"
                    value={taxRate}
                    onChange={e => setTaxRate(Number(e.target.value) || 0)}
                    className="w-16 px-2 py-1 text-xs border border-neutral-300 rounded bg-white"
                  />
                </div>
                <div className="text-right">
                  <span className="text-neutral-500 text-xs">Grand Total: </span>
                  <span className="text-base font-black text-[#FF5407]">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Payment Terms
                </label>
                <input
                  type="text"
                  value={paymentTerms}
                  onChange={e => setPaymentTerms(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-[#FF5407] hover:bg-[#E04703] text-white rounded-lg shadow-xs"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {isPaymentModalOpen && paymentInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6">
            <h3 className="text-base font-bold text-neutral-900 mb-1">Record Customer Payment</h3>
            <p className="text-xs text-neutral-500 mb-4">
              Invoice #{paymentInvoice.invoiceNumber} • {paymentInvoice.clientName}
            </p>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Payment Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  max={paymentInvoice.balanceDue}
                  value={payAmount}
                  onChange={e => setPayAmount(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-bold border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-neutral-400">
                  Remaining balance: ${paymentInvoice.balanceDue.toFixed(2)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={payMethod}
                  onChange={e =>
                    setPayMethod(
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
                  Transaction / Voucher Ref
                </label>
                <input
                  type="text"
                  required
                  value={payRef}
                  onChange={e => setPayRef(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs"
                >
                  Confirm & Post Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
