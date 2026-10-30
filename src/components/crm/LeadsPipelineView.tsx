import React, { useState } from 'react';
import {
  Plus,
  Phone,
  Sparkles,
  X,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import type { LeadStage } from '../../types';

export const LeadsPipelineView: React.FC = () => {
  const { t } = useLanguage();
  const { leads, addLead, updateLeadStage, convertLeadToClient } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    category: 'Corporate',
    phone: '',
    email: '',
    source: 'Referral',
    estimatedValue: 0,
    stage: 'new' as LeadStage,
    nextAction: '',
    followUpDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    notes: '',
  });

  const stages: { stage: LeadStage; label: string; color: string }[] = [
    { stage: 'new', label: t.crm.stages.new, color: 'bg-blue-500' },
    { stage: 'contacted', label: t.crm.stages.contacted, color: 'bg-indigo-500' },
    { stage: 'qualified', label: t.crm.stages.qualified, color: 'bg-purple-500' },
    { stage: 'proposal_sent', label: t.crm.stages.proposal_sent, color: 'bg-amber-500' },
    { stage: 'negotiation', label: t.crm.stages.negotiation, color: 'bg-[#FF5407]' },
    { stage: 'won', label: t.crm.stages.won, color: 'bg-emerald-500' },
    { stage: 'lost', label: t.crm.stages.lost, color: 'bg-neutral-400' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    addLead({
      ...formData,
      estimatedValue: Number(formData.estimatedValue) || 0,
    });

    setIsModalOpen(false);
    setFormData({
      name: '',
      companyName: '',
      category: 'Corporate',
      phone: '',
      email: '',
      source: 'Referral',
      estimatedValue: 0,
      stage: 'new',
      nextAction: '',
      followUpDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      notes: '',
    });
  };

  const totalPipelineValue = leads
    .filter(l => l.stage !== 'lost')
    .reduce((sum, l) => sum + (Number(l.estimatedValue) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header and Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
            {t.crm.pipeline}
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Track business opportunities, quote negotiations, and client conversions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 bg-neutral-100 rounded-xl text-xs font-bold text-neutral-700">
            Pipeline Value: <span className="text-[#FF5407]">${totalPipelineValue.toLocaleString()}</span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-[#FF5407] hover:bg-[#E04703] text-white shadow-xs flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Opportunity</span>
          </button>
        </div>
      </div>

      {/* Kanban Stages Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 overflow-x-auto pb-4">
        {stages.map(st => {
          const stageLeads = leads.filter(l => l.stage === st.stage);
          const stageTotal = stageLeads.reduce((sum, l) => sum + (Number(l.estimatedValue) || 0), 0);

          return (
            <div key={st.stage} className="bg-neutral-100/70 rounded-2xl p-3 flex flex-col min-w-[220px]">
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-neutral-200">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${st.color}`}></span>
                  <h3 className="text-xs font-bold text-neutral-900">{st.label}</h3>
                </div>
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-white text-neutral-600 rounded-full shadow-2xs">
                  {stageLeads.length}
                </span>
              </div>

              {stageTotal > 0 && (
                <div className="text-[10px] font-semibold text-neutral-500 mb-2">
                  ${stageTotal.toLocaleString()}
                </div>
              )}

              {/* Cards Container */}
              <div className="space-y-2 flex-1">
                {stageLeads.length === 0 ? (
                  <div className="h-24 rounded-xl border border-dashed border-neutral-300 flex items-center justify-center text-[10px] text-neutral-400">
                    Empty Stage
                  </div>
                ) : (
                  stageLeads.map(lead => (
                    <div
                      key={lead.id}
                      className="bg-white p-3 rounded-xl border border-neutral-200 shadow-2xs hover:shadow-xs transition-shadow space-y-2"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <p className="text-xs font-bold text-neutral-900">{lead.name}</p>
                          {lead.companyName && (
                            <p className="text-[10px] text-neutral-500 font-medium">{lead.companyName}</p>
                          )}
                        </div>
                        <span className="text-xs font-extrabold text-[#FF5407]">
                          ${lead.estimatedValue}
                        </span>
                      </div>

                      <div className="text-[10px] text-neutral-600 space-y-0.5">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-neutral-400" />
                          <span>{lead.phone}</span>
                        </div>
                        {lead.nextAction && (
                          <div className="p-1.5 bg-neutral-50 rounded text-neutral-700 italic">
                            Next: {lead.nextAction}
                          </div>
                        )}
                      </div>

                      {/* Stage Progression Actions */}
                      <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-1 text-[10px]">
                        {lead.stage !== 'won' && lead.stage !== 'lost' && (
                          <select
                            value={lead.stage}
                            onChange={e => updateLeadStage(lead.id, e.target.value as LeadStage)}
                            className="bg-neutral-100 border-none rounded px-1.5 py-0.5 font-semibold text-neutral-700 text-[10px] focus:outline-hidden"
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="qualified">Qualified</option>
                            <option value="proposal_sent">Proposal</option>
                            <option value="negotiation">Negotiation</option>
                            <option value="won">Won</option>
                            <option value="lost">Lost</option>
                          </select>
                        )}

                        {/* Convert Won Lead button */}
                        {lead.stage === 'won' ? (
                          <button
                            onClick={() => convertLeadToClient(lead.id)}
                            className="w-full py-1 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-1 shadow-2xs transition-colors"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Convert to Client</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => updateLeadStage(lead.id, 'won')}
                            className="text-emerald-600 font-bold hover:underline"
                          >
                            Mark Won
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Lead Opportunity Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <h3 className="text-base font-extrabold text-neutral-900">
                New Sales Opportunity
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Contact Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                  placeholder="e.g. Axmed Warsame"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Company / Organization</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                  placeholder="e.g. Golis Solar Energy"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2 border border-neutral-300 rounded-lg"
                    placeholder="+252 63 4119933"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Estimated Value ($)</label>
                  <input
                    type="number"
                    value={formData.estimatedValue}
                    onChange={e => setFormData({ ...formData, estimatedValue: Number(e.target.value) })}
                    className="w-full p-2 border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Next Follow-up Action</label>
                <input
                  type="text"
                  value={formData.nextAction}
                  onChange={e => setFormData({ ...formData, nextAction: e.target.value })}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                  placeholder="e.g. Send revised proposal on WhatsApp"
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
                  Create Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
