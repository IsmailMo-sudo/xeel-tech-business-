import React, { useState } from 'react';
import {
  Plus,
  Clock,
  ShieldCheck,
  AlertCircle,
  Edit2,
  X,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import type { ServiceItem } from '../../types';

export const ServicesView: React.FC = () => {
  const { t, language } = useLanguage();
  const { services, addService, updateService, toggleServiceActive, currentUser } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    nameEn: '',
    nameSo: '',
    category: 'Design',
    descriptionEn: '',
    descriptionSo: '',
    defaultPrice: 200,
    pricingType: 'fixed' as 'fixed' | 'quote',
    deliveryDays: 5,
    active: true,
  });

  const handleOpenAdd = () => {
    setEditingService(null);
    setFormData({
      code: `SRV-${Date.now().toString().slice(-4)}`,
      nameEn: '',
      nameSo: '',
      category: 'Design',
      descriptionEn: '',
      descriptionSo: '',
      defaultPrice: 200,
      pricingType: 'fixed',
      deliveryDays: 5,
      active: true,
    });
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (srv: ServiceItem) => {
    setEditingService(srv);
    setFormData({
      code: srv.code,
      nameEn: srv.nameEn,
      nameSo: srv.nameSo,
      category: srv.category,
      descriptionEn: srv.descriptionEn,
      descriptionSo: srv.descriptionSo,
      defaultPrice: srv.defaultPrice,
      pricingType: srv.pricingType,
      deliveryDays: srv.deliveryDays,
      active: srv.active,
    });
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // STRICT BUSINESS RULE CHECK: Never allow Data Analytics
    const forbidden = ['data analytics', 'analytics', 'data analysis', 'falanqaynta xogta'];
    const lowerEn = formData.nameEn.toLowerCase();
    const lowerSo = formData.nameSo.toLowerCase();

    if (forbidden.some(f => lowerEn.includes(f) || lowerSo.includes(f))) {
      setErrorMessage(
        'Policy Restriction: "Data Analytics" is strictly excluded from XEEL TECH active commercial service catalog.'
      );
      return;
    }

    if (editingService) {
      updateService(editingService.id, formData);
    } else {
      addService(formData);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
            {t.services.title}
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            {t.services.subtitle} • Laascaanood, Somalia
          </p>
        </div>

        {currentUser.role === 'owner' || currentUser.role === 'admin' ? (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-[#FF5407] hover:bg-[#E04703] text-white shadow-xs flex items-center gap-2 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{t.services.addService}</span>
          </button>
        ) : null}
      </div>

      {/* Official Catalog Compliance Banner */}
      <div className="p-4 bg-orange-50/70 rounded-2xl border border-orange-200/80 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#FF5407] flex-shrink-0 mt-0.5" />
        <div className="text-xs text-neutral-700">
          <p className="font-bold text-neutral-900">Official Brand Catalog Guarantee</p>
          <p className="mt-0.5 text-neutral-600">
            This catalog contains only XEEL TECH&apos;s certified digital creative and technology service offerings:
            Graphic Design, Logo Design, Brand Identity, Social Media Design &amp; Management, Event Branding, Video Editing, Website Development, and Digital Marketing.
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map(srv => {
          const title = language === 'so' ? srv.nameSo : srv.nameEn;
          const desc = language === 'so' ? srv.descriptionSo : srv.descriptionEn;

          return (
            <div
              key={srv.id}
              className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                srv.active ? 'border-neutral-200 shadow-2xs hover:border-[#FF5407]' : 'border-neutral-200/50 opacity-60 bg-neutral-50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider rounded-md bg-neutral-100 text-neutral-600 uppercase">
                    {srv.code} • {srv.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleServiceActive(srv.id)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                        srv.active ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-700'
                      }`}
                    >
                      {srv.active ? 'Active' : 'Inactive'}
                    </button>
                    {(currentUser.role === 'owner' || currentUser.role === 'admin') && (
                      <button
                        onClick={() => handleOpenEdit(srv)}
                        className="p-1 text-neutral-400 hover:text-neutral-700 rounded-md"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-base font-bold text-neutral-900 mb-1">{title}</h3>
                <p className="text-xs text-neutral-500 line-clamp-3 mb-4">{desc}</p>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-neutral-400 font-semibold block uppercase">
                    {srv.pricingType === 'fixed' ? 'Fixed Price' : 'Custom Quote'}
                  </span>
                  <span className="text-base font-extrabold text-[#FF5407]">
                    ${srv.defaultPrice}{srv.pricingType === 'quote' ? '+' : ''}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-medium text-neutral-600 bg-neutral-100 px-2 py-1 rounded-lg">
                  <Clock className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{srv.deliveryDays} Days Est.</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <h3 className="text-base font-extrabold text-neutral-900">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Service Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    className="w-full p-2 border border-neutral-300 rounded-lg"
                    placeholder="SRV-NEW"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2 border border-neutral-300 rounded-lg"
                    placeholder="Design / Tech / Video"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Title in English *</label>
                <input
                  type="text"
                  required
                  value={formData.nameEn}
                  onChange={e => setFormData({ ...formData, nameEn: e.target.value })}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                  placeholder="e.g. Motion Graphics & 3D Animation"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Title in Somali *</label>
                <input
                  type="text"
                  required
                  value={formData.nameSo}
                  onChange={e => setFormData({ ...formData, nameSo: e.target.value })}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                  placeholder="e.g. Naqshadaha Dhaqdhaqaaqa leh"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    value={formData.defaultPrice}
                    onChange={e => setFormData({ ...formData, defaultPrice: Number(e.target.value) })}
                    className="w-full p-2 border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Pricing Model</label>
                  <select
                    value={formData.pricingType}
                    onChange={e => setFormData({ ...formData, pricingType: e.target.value as any })}
                    className="w-full p-2 border border-neutral-300 rounded-lg"
                  >
                    <option value="fixed">Fixed Price</option>
                    <option value="quote">Quote Required</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Est. Delivery (Days)</label>
                  <input
                    type="number"
                    value={formData.deliveryDays}
                    onChange={e => setFormData({ ...formData, deliveryDays: Number(e.target.value) })}
                    className="w-full p-2 border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Description (English)</label>
                <textarea
                  rows={2}
                  value={formData.descriptionEn}
                  onChange={e => setFormData({ ...formData, descriptionEn: e.target.value })}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Description (Somali)</label>
                <textarea
                  rows={2}
                  value={formData.descriptionSo}
                  onChange={e => setFormData({ ...formData, descriptionSo: e.target.value })}
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
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
