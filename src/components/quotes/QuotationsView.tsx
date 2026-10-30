import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Printer,
  Eye,
  X,
  FileText,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import type { Quotation, QuotationItem } from '../../types';
import { BrandLogo } from '../brand/BrandLogo';

export const QuotationsView: React.FC = () => {
  const { t } = useLanguage();
  const {
    quotations,
    createQuotation,
    updateQuotationStatus,
    convertQuotationToInvoice,
    createProject,
    clients,
    services,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quotation | null>(null);

  // Form State
  const [clientId, setClientId] = useState('');
  const [scopeOfWork, setScopeOfWork] = useState('');
  const [terms, setTerms] = useState('50% advance upon agreement, 50% upon final deliverable handoff.');
  const [expiryDate, setExpiryDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
  const [items, setItems] = useState<Omit<QuotationItem, 'id'>[]>([
    { serviceId: 'srv-1', description: 'Graphic Design & Brand Collaterals', quantity: 1, unitPrice: 250, discount: 0, total: 250 },
  ]);

  const handleAddItem = () => {
    setItems([...items, { serviceId: '', description: '', quantity: 1, unitPrice: 100, discount: 0, total: 100 }]);
  };

  const handleItemChange = (index: number, field: string, val: any) => {
    const updated = [...items];
    const current = { ...updated[index], [field]: val };

    if (field === 'serviceId') {
      const srv = services.find(s => s.id === val);
      if (srv) {
        current.description = srv.nameEn;
        current.unitPrice = srv.defaultPrice;
      }
    }

    const qty = Number(current.quantity) || 0;
    const price = Number(current.unitPrice) || 0;
    const disc = Number(current.discount) || 0;
    current.total = Math.max(0, qty * price - disc);

    updated[index] = current;
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, itm) => sum + itm.total, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(c => c.id === clientId);
    if (!client || items.length === 0) return;

    createQuotation({
      clientId: client.id,
      clientName: client.companyName || client.name,
      clientEmail: client.email || '',
      clientPhone: client.phone,
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate,
      items: items.map(itm => ({
        ...itm,
        id: `qitm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      })),
      subtotal,
      discount: 0,
      taxRate: 0,
      taxAmount: 0,
      totalAmount: subtotal,
      scopeOfWork,
      terms,
      status: 'draft',
    });

    setIsModalOpen(false);
  };

  const handleConvertToProject = (quote: Quotation) => {
    createProject({
      name: `${quote.clientName} Deliverables`,
      clientId: quote.clientId,
      clientName: quote.clientName,
      budget: quote.totalAmount,
      startDate: new Date().toISOString().split('T')[0],
      deadline: quote.expiryDate,
      manager: 'Guuleed Cali',
      assignedStaff: ['Nimco Jaamac'],
      stage: 'planning',
      deliverables: quote.scopeOfWork || 'Creative deliverables outlined in proposal ' + quote.quotationNumber,
      notes: 'Generated from proposal ' + quote.quotationNumber,
    });
    updateQuotationStatus(quote.id, 'accepted');
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Proposal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
            {t.quotes.title}
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            {t.quotes.subtitle} • Professional branded proposals
          </p>
        </div>

        <button
          onClick={() => {
            if (clients.length > 0) setClientId(clients[0].id);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-[#FF5407] hover:bg-[#E04703] text-white shadow-xs flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.quotes.createQuote}</span>
        </button>
      </div>

      {/* Proposals Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Proposal Ref</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Issued / Valid Until</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {quotations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-neutral-400">
                    No proposals created yet. Click &quot;{t.quotes.createQuote}&quot; to issue a proposal.
                  </td>
                </tr>
              ) : (
                quotations.map(q => (
                  <tr key={q.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-neutral-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#FF5407]" />
                      <span>{q.quotationNumber}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-neutral-800">{q.clientName}</td>
                    <td className="py-3 px-4 text-neutral-500 text-[11px]">
                      {q.issueDate} → <strong className="text-neutral-700">{q.expiryDate}</strong>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          q.status === 'accepted' || q.status === 'converted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : q.status === 'sent'
                            ? 'bg-blue-100 text-blue-800'
                            : q.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        {q.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-neutral-900">
                      ${q.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedQuote(q)}
                          title="Preview Document"
                          className="p-1.5 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {q.status !== 'converted' && (
                          <button
                            onClick={() => convertQuotationToInvoice(q.id)}
                            title="Convert to Invoice"
                            className="px-2 py-1 rounded-lg bg-orange-50 text-[#FF5407] hover:bg-orange-100 font-bold text-[10px]"
                          >
                            To Invoice
                          </button>
                        )}
                        {q.status !== 'converted' && q.status !== 'accepted' && (
                          <button
                            onClick={() => handleConvertToProject(q)}
                            title="Convert to Project"
                            className="px-2 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-[10px]"
                          >
                            To Project
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

      {/* Create Proposal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <h3 className="text-base font-extrabold text-neutral-900">{t.quotes.createQuote}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Select Client *</label>
                  <select
                    value={clientId}
                    onChange={e => setClientId(e.target.value)}
                    required
                    className="w-full p-2 border border-neutral-300 rounded-lg"
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.companyName ? `(${c.companyName})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Valid Until (Expiry Date) *</label>
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={e => setExpiryDate(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Line items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-neutral-800">Proposal Line Items</label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-[#FF5407] font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Item
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={idx} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-4">
                        <select
                          value={item.serviceId}
                          onChange={e => handleItemChange(idx, 'serviceId', e.target.value)}
                          className="w-full p-1.5 bg-white border border-neutral-300 rounded text-xs"
                        >
                          <option value="">Select Service...</option>
                          {services.map(s => (
                            <option key={s.id} value={s.id}>{s.nameEn}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-3">
                        <input
                          type="text"
                          value={item.description}
                          onChange={e => handleItemChange(idx, 'description', e.target.value)}
                          placeholder="Scope notes"
                          className="w-full p-1.5 bg-white border border-neutral-300 rounded text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                          className="w-full p-1.5 bg-white border border-neutral-300 rounded text-xs text-center"
                          title="Quantity"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={e => handleItemChange(idx, 'unitPrice', e.target.value)}
                          className="w-full p-1.5 bg-white border border-neutral-300 rounded text-xs text-right"
                          title="Unit Price"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-right pt-2 font-bold text-neutral-900 text-sm">
                  Subtotal: ${subtotal.toFixed(2)}
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Scope of Work & Deliverables</label>
                <textarea
                  rows={2}
                  value={scopeOfWork}
                  onChange={e => setScopeOfWork(e.target.value)}
                  placeholder="Outline key project deliverables and milestones..."
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Terms & Conditions</label>
                <textarea
                  rows={2}
                  value={terms}
                  onChange={e => setTerms(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-[#FF5407] hover:bg-[#E04703] text-white rounded-xl shadow-xs"
                >
                  Issue Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Proposal Document Preview Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-neutral-200 p-8 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 no-print">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                Official Agency Proposal Document
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg border border-neutral-200 hover:bg-neutral-100 flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button onClick={() => setSelectedQuote(null)} className="p-1 text-neutral-400 hover:text-neutral-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Branded Document Header strictly preserving original logo and wordmark */}
            <div className="flex items-start justify-between">
              <div>
                <BrandLogo size="lg" showWordmark={true} showTagline={true} />
                <p className="text-xs text-neutral-500 mt-2">
                  Main Commercial Boulevard, Laascaanood, Somalia<br />
                  Email: info@xeeltech.so • Tel: +252 63 4700000
                </p>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-black text-neutral-900 tracking-tight">PROPOSAL</h2>
                <p className="text-xs font-bold text-[#FF5407] mt-1">{selectedQuote.quotationNumber}</p>
                <p className="text-xs text-neutral-500">Issued: {selectedQuote.issueDate}</p>
                <p className="text-xs text-neutral-500">Valid Until: {selectedQuote.expiryDate}</p>
              </div>
            </div>

            <div className="p-4 bg-neutral-50 rounded-xl text-xs space-y-1">
              <p className="text-[10px] font-bold text-neutral-400 uppercase">Prepared For</p>
              <p className="text-sm font-bold text-neutral-900">{selectedQuote.clientName}</p>
              <p className="text-neutral-600">{selectedQuote.clientPhone} • {selectedQuote.clientEmail}</p>
            </div>

            {/* Line Items Table */}
            <table className="w-full text-xs">
              <thead className="border-b-2 border-neutral-900 text-[10px] font-bold uppercase">
                <tr>
                  <th className="py-2 text-left">Description</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Unit Price</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {selectedQuote.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 font-semibold text-neutral-800">{item.description}</td>
                    <td className="py-2.5 text-center text-neutral-600">{item.quantity}</td>
                    <td className="py-2.5 text-right text-neutral-600">${item.unitPrice.toFixed(2)}</td>
                    <td className="py-2.5 text-right font-bold text-neutral-900">${item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end pt-3 border-t border-neutral-200">
              <div className="w-48 text-right space-y-1 text-xs">
                <div className="flex justify-between font-extrabold text-sm text-neutral-900 pt-1">
                  <span>Agreed Total:</span>
                  <span className="text-[#FF5407]">${selectedQuote.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {selectedQuote.terms && (
              <div className="pt-4 border-t border-neutral-100 text-xs text-neutral-600">
                <p className="font-bold text-neutral-900 mb-1">Terms of Engagement:</p>
                <p>{selectedQuote.terms}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
