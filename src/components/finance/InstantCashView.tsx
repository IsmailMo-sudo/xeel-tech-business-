import React, { useState } from 'react';
import {
  Zap,
  CheckCircle2,
  Building2,
  Info,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import type { FinancingStatus } from '../../types';

export const InstantCashView: React.FC = () => {
  const { t, language } = useLanguage();
  const {
    invoices,
    cashOffers,
    requestInstantCash,
    updateCashOfferStatus,
  } = useApp();

  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Eligible invoices are unpaid and not void
  const eligibleInvoices = invoices.filter(
    i => i.balanceDue > 0 && i.status !== 'void' && i.status !== 'draft'
  );

  const handleRequestOffer = (invoiceId: string) => {
    const offer = requestInstantCash(invoiceId);
    setSuccessMsg(
      `Instant cash financing proposal initiated for ${offer.invoiceNumber}. Advance value: $${offer.netProceeds.toFixed(
        2
      )}.`
    );
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  const getStatusColor = (status: FinancingStatus) => {
    switch (status) {
      case 'funded':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'accepted':
      case 'offer_available':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'under_review':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'settled':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'rejected':
      case 'cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-neutral-100 text-neutral-600 border-neutral-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-orange-100 text-[#FF5407]">
              <Zap className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
              {language === 'so' ? t.instantCash.somaliTitle : t.instantCash.title}
            </h1>
          </div>
          <p className="text-xs text-neutral-500 mt-1">{t.instantCash.subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-600" />
            <span>Simulation & Verification Mode</span>
          </span>
        </div>
      </div>

      {/* Integration Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-neutral-900 text-white flex items-start gap-3 shadow-sm border border-neutral-800">
        <Building2 className="w-5 h-5 text-[#FF5407] shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-white tracking-wide">
            Institutional Financing Notice (Somalia Working Capital Protocol)
          </p>
          <p className="text-neutral-400 leading-relaxed">
            {t.instantCash.connectionNotice} Unpaid invoices can be evaluated for accelerated liquidity at 3.5% standard facilitation fee with 96.5% immediate payout.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Eligible Invoices for Instant Advance */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-neutral-200 bg-neutral-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              {t.instantCash.eligibleInvoices} ({eligibleInvoices.length})
            </h3>
            <p className="text-[11px] text-neutral-500">
              Verified corporate invoices awaiting client payment
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4 text-right">Face Value</th>
                <th className="py-3 px-4 text-right">Fee (3.5%)</th>
                <th className="py-3 px-4 text-right">Net Advance (96.5%)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium">
              {eligibleInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-neutral-400">
                    No eligible unpaid invoices currently found.
                  </td>
                </tr>
              ) : (
                eligibleInvoices.map(inv => {
                  const existingOffer = cashOffers.find(o => o.invoiceId === inv.id);
                  const fee = inv.balanceDue * 0.035;
                  const net = inv.balanceDue - fee;

                  return (
                    <tr key={inv.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-neutral-900">{inv.invoiceNumber}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-neutral-800">{inv.clientName}</div>
                        <div className="text-[10px] text-neutral-400">Due: {inv.dueDate}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-neutral-900">
                        ${inv.balanceDue.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-rose-600 font-medium">
                        -${fee.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-emerald-600">
                        ${net.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {existingOffer ? (
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize ${getStatusColor(
                              existingOffer.status
                            )}`}
                          >
                            {existingOffer.status.replace('_', ' ')}
                          </span>
                        ) : (
                          <span className="text-[10px] text-neutral-400">Ready to Request</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {existingOffer ? (
                          existingOffer.status === 'offer_available' ? (
                            <button
                              onClick={() => updateCashOfferStatus(existingOffer.id, 'accepted')}
                              className="px-2.5 py-1 text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                              Accept Offer
                            </button>
                          ) : existingOffer.status === 'accepted' ? (
                            <button
                              onClick={() => updateCashOfferStatus(existingOffer.id, 'funded')}
                              className="px-2.5 py-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                            >
                              Disburse Funds
                            </button>
                          ) : (
                            <span className="text-[11px] font-semibold text-neutral-500">
                              Active
                            </span>
                          )
                        ) : (
                          <button
                            onClick={() => handleRequestOffer(inv.id)}
                            className="px-3 py-1 text-[11px] font-bold bg-[#FF5407] hover:bg-[#E04703] text-white rounded-lg flex items-center gap-1 ml-auto shadow-2xs transition-colors"
                          >
                            <Zap className="w-3 h-3" />
                            <span>Request Offer</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Existing Financing Records */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-neutral-200 bg-neutral-50/50">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
            Active Financing Portfolio ({cashOffers.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Offer Ref</th>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4 text-right">Face Amount</th>
                <th className="py-3 px-4 text-right">Net Proceeds</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Request Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium">
              {cashOffers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-neutral-400">
                    No active financing advances requested.
                  </td>
                </tr>
              ) : (
                cashOffers.map(offer => (
                  <tr key={offer.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-neutral-800">{offer.id}</td>
                    <td className="py-3 px-4 font-bold text-neutral-900">{offer.invoiceNumber}</td>
                    <td className="py-3 px-4">{offer.clientName}</td>
                    <td className="py-3 px-4 text-right font-semibold text-neutral-700">
                      ${offer.invoiceAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-emerald-600">
                      ${offer.netProceeds.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize ${getStatusColor(
                          offer.status
                        )}`}
                      >
                        {offer.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-neutral-500">
                      {offer.requestDate ? offer.requestDate.split('T')[0] : 'Today'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
