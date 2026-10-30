import React, { useState } from 'react';
import {
  Network,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sliders,
  X,
  Shield,
  Activity,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import type { IntegrationConnection, IntegrationStatus } from '../../types';

export const IntegrationsView: React.FC = () => {
  const { t, language } = useLanguage();
  const {
    integrations,
    integrationLogs,
    updateIntegrationConfig,
    testIntegration,
  } = useApp();

  const [selectedInt, setSelectedInt] = useState<IntegrationConnection | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; msg: string; ok: boolean } | null>(
    null
  );

  // Modal config edit
  const [configFields, setConfigFields] = useState<Record<string, string>>({});

  const handleOpenConfig = (conn: IntegrationConnection) => {
    setSelectedInt(conn);
    setConfigFields({ ...conn.config });
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInt) return;

    updateIntegrationConfig(selectedInt.id, configFields, 'connected');
    setSelectedInt(null);
  };

  const handleTest = async (id: string) => {
    setTestingId(id);
    setTestResult(null);
    try {
      const res = await testIntegration(id);
      setTestResult({ id, msg: res.message, ok: res.success });
    } finally {
      setTestingId(null);
    }
  };

  const getStatusBadge = (status: IntegrationStatus) => {
    switch (status) {
      case 'connected':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'requires_attention':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'connecting':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'error':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-neutral-100 text-neutral-600 border-neutral-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
            {language === 'so' ? t.integrations.somaliTitle : t.integrations.title}
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">{t.integrations.subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>Encrypted Credentials</span>
          </span>
        </div>
      </div>

      {testResult && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            testResult.ok
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {testResult.ok ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{testResult.msg}</span>
        </div>
      )}

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map(conn => (
          <div
            key={conn.id}
            className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs flex flex-col justify-between space-y-4 hover:border-neutral-300 transition-colors"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-orange-50 text-[#FF5407]">
                    <Network className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">{conn.name}</h3>
                    <p className="text-[10px] text-neutral-400 capitalize">{conn.type.replace('_', ' ')}</p>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize ${getStatusBadge(
                    conn.status
                  )}`}
                >
                  {conn.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">{conn.description}</p>
            </div>

            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
              <span className="text-[10px] text-neutral-400">
                {conn.lastSync ? `Last Sync: ${conn.lastSync.split('T')[0]}` : 'Never synced'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTest(conn.id)}
                  disabled={testingId === conn.id}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingId === conn.id ? 'animate-spin' : ''}`} />
                  <span>{testingId === conn.id ? 'Testing...' : 'Test Connection'}</span>
                </button>
                <button
                  onClick={() => handleOpenConfig(conn)}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Configure</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Integration Event Logs */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-neutral-200 bg-neutral-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#FF5407]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              Recent System Dispatch Events ({integrationLogs.length})
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-4">Gateway</th>
                <th className="py-2.5 px-4">Event Details</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium">
              {integrationLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-neutral-400">
                    No integration logs recorded yet.
                  </td>
                </tr>
              ) : (
                integrationLogs.map(log => (
                  <tr key={log.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-2.5 px-4 font-bold text-neutral-900">{log.connectionName}</td>
                    <td className="py-2.5 px-4 text-neutral-700">{log.message}</td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === 'success'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right text-neutral-400 text-[10px]">
                      {log.timestamp ? log.timestamp.split('T')[0] : 'Just now'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Configuration Modal */}
      {selectedInt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  Configure {selectedInt.name}
                </h3>
                <p className="text-xs text-neutral-500">Provide gateway API keys and webhooks</p>
              </div>
              <button
                onClick={() => setSelectedInt(null)}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-3 pt-3">
              {Object.keys(configFields).map(key => (
                <div key={key}>
                  <label className="block text-xs font-bold text-neutral-700 mb-1 capitalize">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </label>
                  <input
                    type={key.toLowerCase().includes('token') || key.toLowerCase().includes('key') ? 'password' : 'text'}
                    value={configFields[key]}
                    onChange={e =>
                      setConfigFields({ ...configFields, [key]: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[#FF5407]"
                  />
                </div>
              ))}

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setSelectedInt(null)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-[#FF5407] hover:bg-[#E04703] text-white rounded-lg shadow-xs"
                >
                  Save Connection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
