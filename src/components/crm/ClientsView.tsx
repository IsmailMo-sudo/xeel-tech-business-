import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  Building,
  User,
  AlertTriangle,
  Download,
  Eye,
  Edit2,
  Trash2,
  X,
  Receipt,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import type { Client } from '../../types';

export const ClientsView: React.FC = () => {
  const { t } = useLanguage();
  const { clients, addClient, updateClient, deleteClient, invoices, currentUser } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    clientType: 'company' as 'individual' | 'company',
    name: '',
    companyName: '',
    category: 'Corporate',
    phone: '',
    email: '',
    address: 'Laascaanood, Somalia',
    source: 'Referral',
    status: 'active' as 'active' | 'inactive',
    accountManager: currentUser.fullName,
    notes: '',
    tags: '',
  });

  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Check for duplicate phone or email on change
  const handlePhoneOrEmailChange = (field: 'phone' | 'email', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    const cleanVal = value.trim().toLowerCase();
    if (!cleanVal) {
      setDuplicateWarning(null);
      return;
    }

    const dup = clients.find(c => {
      if (editingClient && c.id === editingClient.id) return false;
      if (field === 'phone' && c.phone.replace(/[\s-]/g, '') === cleanVal.replace(/[\s-]/g, '')) return true;
      if (field === 'email' && c.email.toLowerCase() === cleanVal) return true;
      return false;
    });

    if (dup) {
      setDuplicateWarning(
        `Potential duplicate detected! Client "${dup.name}" (${dup.companyName || 'Individual'}) already uses this ${field}.`
      );
    } else {
      setDuplicateWarning(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    const tagsArray = formData.tags
      ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      : [];

    if (editingClient) {
      updateClient(editingClient.id, {
        ...formData,
        tags: tagsArray,
      });
      setEditingClient(null);
    } else {
      addClient({
        ...formData,
        tags: tagsArray,
      });
    }

    setIsAddModalOpen(false);
    setDuplicateWarning(null);
    setFormData({
      clientType: 'company',
      name: '',
      companyName: '',
      category: 'Corporate',
      phone: '',
      email: '',
      address: 'Laascaanood, Somalia',
      source: 'Referral',
      status: 'active',
      accountManager: currentUser.fullName,
      notes: '',
      tags: '',
    });
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      clientType: client.clientType,
      name: client.name,
      companyName: client.companyName || '',
      category: client.category || 'Corporate',
      phone: client.phone,
      email: client.email || '',
      address: client.address || 'Laascaanood, Somalia',
      source: client.source || 'Referral',
      status: client.status,
      accountManager: client.accountManager || currentUser.fullName,
      notes: client.notes || '',
      tags: client.tags ? client.tags.join(', ') : '',
    });
    setDuplicateWarning(null);
    setIsAddModalOpen(true);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Type', 'Name', 'Company', 'Phone', 'Email', 'Address', 'Status', 'OutstandingBalance'];
    const rows = clients.map(c => [
      c.id,
      c.clientType,
      `"${c.name}"`,
      `"${c.companyName || ''}"`,
      c.phone,
      c.email,
      `"${c.address || ''}"`,
      c.status,
      c.outstandingBalance || 0,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `xeel_tech_clients_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredClients = clients.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.companyName && c.companyName.toLowerCase().includes(search.toLowerCase())) ||
      c.phone.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
            {t.crm.title}
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            {t.crm.subtitle} • {clients.length} Total Client Accounts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-neutral-200 hover:bg-neutral-100 text-neutral-700 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-neutral-500" />
            <span className="hidden sm:inline">{t.common.export}</span>
          </button>
          <button
            onClick={() => {
              setEditingClient(null);
              setFormData({
                clientType: 'company',
                name: '',
                companyName: '',
                category: 'Corporate',
                phone: '',
                email: '',
                address: 'Laascaanood, Somalia',
                source: 'Referral',
                status: 'active',
                accountManager: currentUser.fullName,
                notes: '',
                tags: '',
              });
              setDuplicateWarning(null);
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-[#FF5407] hover:bg-[#E04703] text-white shadow-xs flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t.crm.addClient}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, company, phone, email..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#FF5407]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-neutral-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="text-xs border border-neutral-200 rounded-lg px-2.5 py-1.5 font-medium text-neutral-700 focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Clients</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Clients Data Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Client / Company</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-neutral-400">
                    {t.common.noData}
                  </td>
                </tr>
              ) : (
                filteredClients.map(client => (
                  <tr key={client.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF5407] font-bold flex items-center justify-center flex-shrink-0 text-xs">
                          {client.clientType === 'company' ? <Building className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900">{client.name}</p>
                          {client.companyName && (
                            <p className="text-[11px] text-neutral-500 font-medium">{client.companyName}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-neutral-700">
                        <Phone className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                        <span>{client.phone}</span>
                      </div>
                      {client.email && (
                        <div className="flex items-center gap-1.5 text-neutral-500 text-[11px]">
                          <Mail className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                          <span className="truncate max-w-[150px]">{client.email}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-neutral-100 text-neutral-700">
                        {client.category || 'General'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          client.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-neutral-200 text-neutral-700'
                        }`}
                      >
                        {client.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`font-bold ${client.outstandingBalance > 0 ? 'text-rose-600' : 'text-neutral-500'}`}>
                        ${(client.outstandingBalance || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setSelectedClient(client)}
                          title="View Profile"
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(client)}
                          title="Edit"
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(t.common.confirmDelete)) {
                              deleteClient(client.id);
                            }
                          }}
                          title="Delete"
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Client Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <h3 className="text-base font-extrabold text-neutral-900">
                {editingClient ? t.common.edit : t.crm.addClient}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Duplicate warning notification */}
            {duplicateWarning && (
              <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>{duplicateWarning}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    {t.crm.clientType}
                  </label>
                  <select
                    value={formData.clientType}
                    onChange={e => setFormData({ ...formData, clientType: e.target.value as any })}
                    className="w-full text-xs border border-neutral-300 rounded-lg p-2"
                  >
                    <option value="company">{t.crm.company}</option>
                    <option value="individual">{t.crm.individual}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    {t.crm.category}
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full text-xs border border-neutral-300 rounded-lg p-2"
                    placeholder="Healthcare, Logistics, Retail"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  {t.crm.clientName} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs border border-neutral-300 rounded-lg p-2"
                  placeholder="e.g. Mustafe Cabdi Jaamac"
                />
              </div>

              {formData.clientType === 'company' && (
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    {t.crm.companyName}
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full text-xs border border-neutral-300 rounded-lg p-2"
                    placeholder="e.g. Al-Nuur Healthcare Group"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    {t.crm.phone} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => handlePhoneOrEmailChange('phone', e.target.value)}
                    className="w-full text-xs border border-neutral-300 rounded-lg p-2"
                    placeholder="+252 63 4441122"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    {t.crm.email}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => handlePhoneOrEmailChange('email', e.target.value)}
                    className="w-full text-xs border border-neutral-300 rounded-lg p-2"
                    placeholder="contact@company.so"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  {t.crm.address}
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full text-xs border border-neutral-300 rounded-lg p-2"
                  placeholder="Main Street, Laascaanood, Somalia"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={e => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full text-xs border border-neutral-300 rounded-lg p-2"
                  placeholder="Corporate, VIP, Retainer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  {t.common.notes}
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full text-xs border border-neutral-300 rounded-lg p-2"
                  placeholder="Internal account manager notes..."
                />
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#FF5407] hover:bg-[#E04703] text-white rounded-xl shadow-xs"
                >
                  {t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client Detail Full Profile Drawer / Modal */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-start justify-between pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#FF5407]/10 text-[#FF5407] flex items-center justify-center font-bold text-lg">
                  {selectedClient.clientType === 'company' ? <Building className="w-6 h-6" /> : <User className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-neutral-900">{selectedClient.name}</h3>
                  <p className="text-xs text-neutral-500 font-medium">
                    {selectedClient.companyName ? `${selectedClient.companyName} • ` : ''}
                    {selectedClient.category}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedClient(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-neutral-50 rounded-xl">
                <span className="text-[10px] font-bold text-neutral-500 uppercase">Outstanding Balance</span>
                <p className={`text-base font-extrabold ${selectedClient.outstandingBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  ${(selectedClient.outstandingBalance || 0).toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl">
                <span className="text-[10px] font-bold text-neutral-500 uppercase">Account Manager</span>
                <p className="text-xs font-bold text-neutral-900 truncate">{selectedClient.accountManager}</p>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl">
                <span className="text-[10px] font-bold text-neutral-500 uppercase">Client Since</span>
                <p className="text-xs font-bold text-neutral-900">{selectedClient.createdAt.split('T')[0]}</p>
              </div>
            </div>

            {/* Contact details */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-neutral-700">
                <Phone className="w-4 h-4 text-[#FF5407]" />
                <span className="font-semibold">{selectedClient.phone}</span>
              </div>
              {selectedClient.email && (
                <div className="flex items-center gap-2 text-neutral-700">
                  <Mail className="w-4 h-4 text-[#FF5407]" />
                  <span>{selectedClient.email}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-neutral-700">
                <MapPin className="w-4 h-4 text-[#FF5407]" />
                <span>{selectedClient.address}</span>
              </div>
            </div>

            {/* Related Invoices */}
            <div>
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-[#FF5407]" />
                <span>Client Invoices</span>
              </h4>
              <div className="divide-y divide-neutral-100 border border-neutral-100 rounded-xl overflow-hidden text-xs">
                {invoices.filter(i => i.clientId === selectedClient.id).length === 0 ? (
                  <p className="p-3 text-neutral-400">No invoices issued for this client yet.</p>
                ) : (
                  invoices
                    .filter(i => i.clientId === selectedClient.id)
                    .map(inv => (
                      <div key={inv.id} className="p-2.5 flex items-center justify-between hover:bg-neutral-50">
                        <div>
                          <span className="font-bold text-neutral-900">{inv.invoiceNumber}</span>
                          <span className="text-neutral-400 ml-2">Due: {inv.dueDate}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-neutral-900 mr-2">${inv.totalAmount.toFixed(2)}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold capitalize bg-neutral-100">
                            {inv.status}
                          </span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            {selectedClient.notes && (
              <div className="p-3 bg-orange-50/50 rounded-xl text-xs text-neutral-700">
                <span className="font-bold block text-neutral-900 mb-1">Internal Agency Notes:</span>
                <p>{selectedClient.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
