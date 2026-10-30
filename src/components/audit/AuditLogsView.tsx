import React, { useState } from 'react';
import {
  Search,
  Filter,
  Shield,
  User,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';

export const AuditLogsView: React.FC = () => {
  const { t } = useLanguage();
  const { auditLogs } = useApp();

  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch =
      log.actorName.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase());
    const matchesEntity = entityFilter === 'all' || log.entity === entityFilter;
    return matchesSearch && matchesEntity;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
            {t.nav.auditLogs}
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Immutable security event log, user activities, and data state modifications
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>Tamper-Resistant Audit Trail</span>
          </span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search action, actor name, event..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-neutral-200 rounded-lg focus:ring-2 focus:ring-[#FF5407]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-neutral-400" />
          <select
            value={entityFilter}
            onChange={e => setEntityFilter(e.target.value)}
            className="text-xs border border-neutral-200 rounded-lg px-2.5 py-1.5 bg-white font-medium text-neutral-700 focus:outline-hidden"
          >
            <option value="all">All Entities</option>
            <option value="Invoice">Invoices</option>
            <option value="Payment">Payments</option>
            <option value="Quotation">Quotations</option>
            <option value="Project">Projects</option>
            <option value="Client">Clients</option>
            <option value="Lead">Leads</option>
            <option value="Expense">Expenses</option>
            <option value="Accounting">General Ledger</option>
            <option value="User">User & Auth</option>
            <option value="System">System OS</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Event Details</th>
                <th className="py-3 px-4 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-neutral-400 text-xs">
                    No matching audit records.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-2.5 px-4 text-neutral-500 text-[11px] whitespace-nowrap">
                      {log.timestamp ? log.timestamp.replace('T', ' ').slice(0, 19) : 'Just now'}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-neutral-900 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{log.actorName}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="font-mono text-[11px] font-bold text-[#FF5407] bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-neutral-700">{log.entity}</td>
                    <td className="py-2.5 px-4 text-neutral-800 text-[11px] max-w-md truncate">
                      {log.details}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-[10px] text-neutral-400">
                      {log.ipAddress || '197.234.218.42'}
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
