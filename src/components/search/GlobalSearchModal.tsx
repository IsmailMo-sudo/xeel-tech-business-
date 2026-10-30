import React, { useState, useEffect } from 'react';
import { Search, X, Users, Receipt, FolderKanban, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import type { NavItemKey } from '../layout/Sidebar';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavItemKey) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { clients, invoices, projects, leads } = useApp();
  const { t } = useLanguage();
  const [query, setQuery] = useState('');

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Filter entities
  const matchingClients = q
    ? clients.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.companyName && c.companyName.toLowerCase().includes(q)) ||
        c.phone.includes(q)
      )
    : [];

  const matchingInvoices = q
    ? invoices.filter(i =>
        i.invoiceNumber.toLowerCase().includes(q) ||
        i.clientName.toLowerCase().includes(q)
      )
    : [];

  const matchingProjects = q
    ? projects.filter(p =>
        p.projectRef.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.clientName.toLowerCase().includes(q)
      )
    : [];

  const matchingLeads = q
    ? leads.filter(l =>
        l.name.toLowerCase().includes(q) ||
        (l.companyName && l.companyName.toLowerCase().includes(q))
      )
    : [];

  const totalResults =
    matchingClients.length +
    matchingInvoices.length +
    matchingProjects.length +
    matchingLeads.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-neutral-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#FF5407]" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search clients, invoices, projects, leads, or tasks..."
            autoFocus
            className="flex-1 text-sm font-medium text-neutral-900 placeholder-neutral-400 focus:outline-hidden bg-transparent"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-2 py-0.5 text-[11px] font-semibold text-neutral-500 bg-neutral-100 border border-neutral-200 rounded">
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {!q ? (
            <div className="py-8 text-center space-y-2">
              <p className="text-xs font-medium text-neutral-500">
                Type anything to search across XEEL TECH databases
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => { onNavigate('invoicing'); onClose(); }}
                  className="px-2.5 py-1 text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Receipt className="w-3.5 h-3.5 text-[#FF5407]" /> {t.nav.invoicing}
                </button>
                <button
                  onClick={() => { onNavigate('crm'); onClose(); }}
                  className="px-2.5 py-1 text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Users className="w-3.5 h-3.5 text-[#FF5407]" /> {t.nav.crm}
                </button>
                <button
                  onClick={() => { onNavigate('projects'); onClose(); }}
                  className="px-2.5 py-1 text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <FolderKanban className="w-3.5 h-3.5 text-[#FF5407]" /> {t.nav.projects}
                </button>
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-500">
              No results found for &ldquo;<span className="text-neutral-900 font-semibold">{query}</span>&rdquo;
            </div>
          ) : (
            <>
              {/* Clients Results */}
              {matchingClients.length > 0 && (
                <div>
                  <h4 className="px-2 pb-1 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    Clients ({matchingClients.length})
                  </h4>
                  <div className="space-y-1">
                    {matchingClients.map(c => (
                      <div
                        key={c.id}
                        onClick={() => {
                          onNavigate('crm');
                          onClose();
                        }}
                        className="p-2.5 rounded-xl hover:bg-neutral-100 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Users className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-neutral-900">{c.name}</p>
                            <p className="text-[11px] text-neutral-500">{c.companyName || 'Individual'} • {c.phone}</p>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Invoices Results */}
              {matchingInvoices.length > 0 && (
                <div>
                  <h4 className="px-2 pb-1 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    Invoices ({matchingInvoices.length})
                  </h4>
                  <div className="space-y-1">
                    {matchingInvoices.map(i => (
                      <div
                        key={i.id}
                        onClick={() => {
                          onNavigate('invoicing');
                          onClose();
                        }}
                        className="p-2.5 rounded-xl hover:bg-neutral-100 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Receipt className="w-4 h-4 text-[#FF5407] flex-shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-neutral-900">{i.invoiceNumber} — ${i.totalAmount}</p>
                            <p className="text-[11px] text-neutral-500">{i.clientName} • Status: {i.status}</p>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects Results */}
              {matchingProjects.length > 0 && (
                <div>
                  <h4 className="px-2 pb-1 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    Projects ({matchingProjects.length})
                  </h4>
                  <div className="space-y-1">
                    {matchingProjects.map(p => (
                      <div
                        key={p.id}
                        onClick={() => {
                          onNavigate('projects');
                          onClose();
                        }}
                        className="p-2.5 rounded-xl hover:bg-neutral-100 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <FolderKanban className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-neutral-900">{p.name}</p>
                            <p className="text-[11px] text-neutral-500">{p.projectRef} • {p.clientName}</p>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
