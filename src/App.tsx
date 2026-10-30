import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { LoginView } from './components/auth/LoginView';
import { GlobalSearchModal } from './components/search/GlobalSearchModal';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { ClientsView } from './components/crm/ClientsView';
import { LeadsPipelineView } from './components/crm/LeadsPipelineView';
import { ServicesView } from './components/services/ServicesView';
import { QuotationsView } from './components/quotes/QuotationsView';
import { ProjectsView } from './components/projects/ProjectsView';
import { InvoicingView } from './components/invoicing/InvoicingView';
import { PaymentsView } from './components/payments/PaymentsView';
import { InstantCashView } from './components/finance/InstantCashView';
import { AccountingView } from './components/accounting/AccountingView';
import { ExpensesView } from './components/expenses/ExpensesView';
import { IntegrationsView } from './components/integrations/IntegrationsView';
import { AuditLogsView } from './components/audit/AuditLogsView';
import { SettingsView } from './components/settings/SettingsView';

import type { NavItemKey } from './components/layout/Sidebar';

const AppContent: React.FC = () => {
  const { isLoggedIn } = useApp();
  const [currentTab, setCurrentTab] = useState<NavItemKey>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Global Ctrl+K / Cmd+K search shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isLoggedIn) {
    return <LoginView />;
  }

  const renderActiveView = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardView onNavigate={setCurrentTab} />;
      case 'crm':
        return <ClientsView />;
      case 'leads':
        return <LeadsPipelineView />;
      case 'services':
        return <ServicesView />;
      case 'quotes':
        return <QuotationsView />;
      case 'projects':
        return <ProjectsView />;
      case 'invoicing':
        return <InvoicingView />;
      case 'payments':
        return <PaymentsView />;
      case 'instantCash':
        return <InstantCashView />;
      case 'accounting':
        return <AccountingView />;
      case 'expenses':
        return <ExpensesView />;
      case 'integrations':
        return <IntegrationsView />;
      case 'auditLogs':
        return <AuditLogsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onNavigate={setCurrentTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-neutral-900 font-sans flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={tab => {
          setCurrentTab(tab);
          setSidebarOpen(false);
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Sticky Global Header */}
        <Header
          onToggleSidebar={() => setSidebarOpen(prev => !prev)}
          onOpenSearch={() => setSearchOpen(true)}
        />

        {/* View Content Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Command Center Search Modal */}
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={tab => {
          setCurrentTab(tab);
          setSearchOpen(false);
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </LanguageProvider>
  );
}
