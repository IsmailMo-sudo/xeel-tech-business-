import React from 'react';
import {
  LayoutDashboard,
  Users,
  Target,
  Layers,
  FileSpreadsheet,
  FolderKanban,
  Receipt,
  CreditCard,
  Zap,
  Scale,
  ShoppingBag,
  Network,
  History,
  Settings,
  X,
} from 'lucide-react';
import { BrandLogo } from '../brand/BrandLogo';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';

export type NavItemKey =
  | 'dashboard'
  | 'crm'
  | 'leads'
  | 'services'
  | 'quotes'
  | 'projects'
  | 'invoicing'
  | 'payments'
  | 'instantCash'
  | 'accounting'
  | 'expenses'
  | 'integrations'
  | 'auditLogs'
  | 'settings';

interface SidebarProps {
  currentTab: NavItemKey;
  onSelectTab: (tab: NavItemKey) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
}) => {
  const { t, language } = useLanguage();
  const { currentUser } = useApp();

  // Navigation structure organized by domain
  const navSections = [
    {
      title: language === 'so' ? 'DULMARKA & CRM' : 'OVERVIEW & CRM',
      items: [
        {
          key: 'dashboard' as NavItemKey,
          label: t.nav.dashboard,
          icon: LayoutDashboard,
          allowedRoles: ['owner', 'admin', 'accountant', 'manager', 'staff'],
        },
        {
          key: 'crm' as NavItemKey,
          label: t.nav.crm,
          icon: Users,
          allowedRoles: ['owner', 'admin', 'manager', 'accountant'],
        },
        {
          key: 'leads' as NavItemKey,
          label: t.nav.leads,
          icon: Target,
          allowedRoles: ['owner', 'admin', 'manager'],
        },
      ],
    },
    {
      title: language === 'so' ? 'HAL-ABUURKA & SOOSAARKA' : 'PRODUCTION & SERVICES',
      items: [
        {
          key: 'services' as NavItemKey,
          label: t.nav.services,
          icon: Layers,
          allowedRoles: ['owner', 'admin', 'manager', 'accountant', 'staff'],
        },
        {
          key: 'quotes' as NavItemKey,
          label: t.nav.quotes,
          icon: FileSpreadsheet,
          allowedRoles: ['owner', 'admin', 'manager', 'accountant'],
        },
        {
          key: 'projects' as NavItemKey,
          label: t.nav.projects,
          icon: FolderKanban,
          allowedRoles: ['owner', 'admin', 'manager', 'staff'],
        },
      ],
    },
    {
      title: language === 'so' ? 'MAALIYADDA & BIILASHA' : 'FINANCE & BILLING',
      items: [
        {
          key: 'invoicing' as NavItemKey,
          label: t.nav.invoicing,
          icon: Receipt,
          allowedRoles: ['owner', 'admin', 'accountant', 'manager'],
        },
        {
          key: 'payments' as NavItemKey,
          label: t.nav.payments,
          icon: CreditCard,
          allowedRoles: ['owner', 'admin', 'accountant'],
        },
        {
          key: 'instantCash' as NavItemKey,
          label: language === 'so' ? 'Lacag Degdeg Ah' : 'Instant Cash',
          icon: Zap,
          badge: 'Fast',
          allowedRoles: ['owner', 'admin', 'accountant'],
        },
        {
          key: 'accounting' as NavItemKey,
          label: t.nav.accounting,
          icon: Scale,
          allowedRoles: ['owner', 'admin', 'accountant'],
        },
        {
          key: 'expenses' as NavItemKey,
          label: t.nav.expenses,
          icon: ShoppingBag,
          allowedRoles: ['owner', 'admin', 'accountant', 'manager'],
        },
      ],
    },
    {
      title: language === 'so' ? 'NIDAAMKA & DEJANTA' : 'SYSTEM & INTEGRATIONS',
      items: [
        {
          key: 'integrations' as NavItemKey,
          label: language === 'so' ? 'Ku Xidh Nidaamka' : 'Connect Systems',
          icon: Network,
          allowedRoles: ['owner', 'admin'],
        },
        {
          key: 'auditLogs' as NavItemKey,
          label: t.nav.auditLogs,
          icon: History,
          allowedRoles: ['owner', 'admin'],
        },
        {
          key: 'settings' as NavItemKey,
          label: t.nav.settings,
          icon: Settings,
          allowedRoles: ['owner', 'admin'],
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#111111] text-neutral-300 border-r border-neutral-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Brand Lockup */}
        <div className="h-18 px-5 border-b border-neutral-800 flex items-center justify-between">
          <BrandLogo size="md" showWordmark={true} showTagline={true} inverted={true} />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          {navSections.map((section, idx) => {
            const visibleItems = section.items.filter(item =>
              item.allowedRoles.includes(currentUser.role)
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={idx} className="space-y-1">
                <h3 className="px-3 text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
                  {section.title}
                </h3>
                {visibleItems.map(item => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.key;

                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        onSelectTab(item.key);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                        isActive
                          ? 'bg-[#FF5407] text-white shadow-md font-semibold'
                          : 'text-neutral-400 hover:text-white hover:bg-neutral-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <Icon
                          className={`w-4 h-4 flex-shrink-0 transition-colors ${
                            isActive ? 'text-white' : 'text-neutral-400 group-hover:text-[#FF5407]'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider ${
                            isActive
                              ? 'bg-black/30 text-white'
                              : 'bg-[#FF5407]/20 text-[#FF5407]'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Footer Business Badge */}
        <div className="p-3.5 border-t border-neutral-800 bg-neutral-900/60">
          <div className="flex items-center justify-between text-[11px] text-neutral-400">
            <div>
              <p className="font-semibold text-neutral-200">XEEL TECH</p>
              <p className="text-[10px] text-neutral-500">Laascaanood, Somalia</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" title="System Operational"></div>
          </div>
        </div>
      </aside>
    </>
  );
};
