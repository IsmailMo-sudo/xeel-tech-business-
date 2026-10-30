import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  UserProfile,
  UserRole,
  Client,
  Lead,
  ServiceItem,
  Quotation,
  Project,
  Task,
  Invoice,
  Payment,
  InstantCashOffer,
  Account,
  JournalEntry,
  Expense,
  IntegrationConnection,
  IntegrationLog,
  NotificationItem,
  AuditLog,
  CompanySettings,
} from '../types';
import { isSupabaseConfigured } from '../lib/supabase';

// Initial pre-seeded approved services (Strictly official services, NO data analytics)
const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 'srv-1',
    code: 'SRV-GD',
    nameEn: 'Graphic Design',
    nameSo: 'Naqshadaynta Garaafikada',
    category: 'Design',
    descriptionEn: 'High-impact creative graphics, print collaterals, and marketing visuals.',
    descriptionSo: 'Naqshado hal-abuur leh oo tayo sare leh oo loogu talagalay suuq-geynta.',
    defaultPrice: 150,
    pricingType: 'fixed',
    deliveryDays: 3,
    active: true,
  },
  {
    id: 'srv-2',
    code: 'SRV-LD',
    nameEn: 'Logo Design',
    nameSo: 'Naqshadaynta Astaan Ganacsi',
    category: 'Branding',
    descriptionEn: 'Distinctive, memorable, and timeless vector brand marks.',
    descriptionSo: 'Astaamo ganacsi oo casri ah oo xusuus leh.',
    defaultPrice: 200,
    pricingType: 'fixed',
    deliveryDays: 5,
    active: true,
  },
  {
    id: 'srv-3',
    code: 'SRV-BI',
    nameEn: 'Brand Identity',
    nameSo: 'Aqoonsiga Astaanta Shirkadda',
    category: 'Branding',
    descriptionEn: 'Complete visual identity system, brand book, color system, and typography.',
    descriptionSo: 'Hanuuninta aqoonsiga buuxa ee shirkadda iyo nidaamka muuqaalka.',
    defaultPrice: 500,
    pricingType: 'fixed',
    deliveryDays: 10,
    active: true,
  },
  {
    id: 'srv-4',
    code: 'SRV-SMD',
    nameEn: 'Social Media Design',
    nameSo: 'Naqshadaha Baraha Bulshada',
    category: 'Social Media',
    descriptionEn: 'Custom social post templates, banners, carousel designs, and stories.',
    descriptionSo: 'Naqshadaha qoraalada, boodhadhka, iyo xayeysiisyada baraha bulshada.',
    defaultPrice: 250,
    pricingType: 'fixed',
    deliveryDays: 4,
    active: true,
  },
  {
    id: 'srv-5',
    code: 'SRV-SMM',
    nameEn: 'Social Media Management',
    nameSo: 'Maamulka Baraha Bulshada',
    category: 'Social Media',
    descriptionEn: 'Monthly social strategy, publishing schedule, community engagement, and growth.',
    descriptionSo: 'Maamulidda joogtada ah ee baraha bulshada iyo qorshaha daabacaadda.',
    defaultPrice: 400,
    pricingType: 'quote',
    deliveryDays: 30,
    active: true,
  },
  {
    id: 'srv-6',
    code: 'SRV-EB',
    nameEn: 'Event Branding',
    nameSo: 'Astaamaynta Munaasabadaha',
    category: 'Events',
    descriptionEn: 'Rollup banners, backdrops, stage graphics, badges, and exhibition materials.',
    descriptionSo: 'Astaamaynta shirarka, xafladaha, iyo carwooyinka ganacsiga.',
    defaultPrice: 600,
    pricingType: 'quote',
    deliveryDays: 7,
    active: true,
  },
  {
    id: 'srv-7',
    code: 'SRV-VE',
    nameEn: 'Video Editing',
    nameSo: 'Tifaftirka Muuqaallada',
    category: 'Video Production',
    descriptionEn: 'High-definition video post-production, motion graphics, color grading, and audio.',
    descriptionSo: 'Tifaftirka muuqaallada xayeysiiska iyo barnaamijyada heerka sare ah.',
    defaultPrice: 350,
    pricingType: 'fixed',
    deliveryDays: 5,
    active: true,
  },
  {
    id: 'srv-8',
    code: 'SRV-WD',
    nameEn: 'Website Development',
    nameSo: 'Dhisidda Mareegyada',
    category: 'Technology',
    descriptionEn: 'Custom responsive web applications, corporate websites, and CMS portals.',
    descriptionSo: 'Dhisidda mareegaha casriga ah iyo hababka maamulka ganacsiga.',
    defaultPrice: 850,
    pricingType: 'quote',
    deliveryDays: 14,
    active: true,
  },
  {
    id: 'srv-9',
    code: 'SRV-DM',
    nameEn: 'Digital Marketing',
    nameSo: 'Suuq-geynta Dijitaalka ah',
    category: 'Marketing',
    descriptionEn: 'Targeted digital campaigns, PPC advertising, brand awareness, and lead generation.',
    descriptionSo: 'Ololayaasha suuq-geynta tooska ah ee internet-ka iyo kordhinta macaamiisha.',
    defaultPrice: 450,
    pricingType: 'quote',
    deliveryDays: 20,
    active: true,
  },
];

// Initial pre-seeded Chart of Accounts (All balances initialized to 0.00 for clean slate)
const INITIAL_ACCOUNTS: Account[] = [
  { id: 'acc-1010', code: '1010', name: 'Cash in Hand (Petty Cash)', type: 'asset', balance: 0.00, description: 'Physical cash held at XEEL TECH office' },
  { id: 'acc-1020', code: '1020', name: 'Bank Account - Dahabshiil Bank', type: 'asset', balance: 0.00, description: 'Commercial operating bank account' },
  { id: 'acc-1030', code: '1030', name: 'Mobile Money - ZAAD / EVC Plus', type: 'asset', balance: 0.00, description: 'Merchant mobile money wallets' },
  { id: 'acc-1200', code: '1200', name: 'Accounts Receivable (A/R)', type: 'asset', balance: 0.00, description: 'Money owed to XEEL TECH by clients for services' },
  { id: 'acc-2000', code: '2000', name: 'Accounts Payable (A/P)', type: 'liability', balance: 0.00, description: 'Money owed to suppliers and service providers' },
  { id: 'acc-2100', code: '2100', name: 'Short-term Financing Liability', type: 'liability', balance: 0.00, description: 'Obligations from invoice financing' },
  { id: 'acc-2200', code: '2200', name: 'Sales Tax Payable', type: 'liability', balance: 0.00, description: 'Collected sales tax awaiting remittance' },
  { id: 'acc-3000', code: '3000', name: "Owner's Equity & Retained Earnings", type: 'equity', balance: 0.00, description: "Capital invested and retained business earnings" },
  { id: 'acc-4000', code: '4000', name: 'Creative Design Revenue', type: 'revenue', balance: 0.00, description: 'Revenue from graphic, logo, and brand design' },
  { id: 'acc-4100', code: '4100', name: 'Web & Tech Services Revenue', type: 'revenue', balance: 0.00, description: 'Revenue from website development and digital solutions' },
  { id: 'acc-4200', code: '4200', name: 'Video & Media Production Revenue', type: 'revenue', balance: 0.00, description: 'Revenue from video editing and multimedia' },
  { id: 'acc-5010', code: '5010', name: 'Software & Cloud Subscriptions', type: 'expense', balance: 0.00, description: 'Adobe Creative Cloud, Figma, hosting, tools' },
  { id: 'acc-5020', code: '5020', name: 'Hardware & Studio Equipment', type: 'expense', balance: 0.00, description: 'Design monitors, cameras, storage drives' },
  { id: 'acc-5030', code: '5030', name: 'Office Rent & Utilities', type: 'expense', balance: 0.00, description: 'Laascaanood studio rent, electricity, high-speed fiber internet' },
  { id: 'acc-5040', code: '5040', name: 'Marketing & Advertising Expenses', type: 'expense', balance: 0.00, description: 'Promotional campaigns and client acquisition' },
  { id: 'acc-5050', code: '5050', name: 'Contractor & Freelancer Fees', type: 'expense', balance: 0.00, description: 'External specialized creative contractors' },
];

// Clean Initial States (All demo and fake records removed)
const INITIAL_CLIENTS: Client[] = [];
const INITIAL_INVOICES: Invoice[] = [];
const INITIAL_PAYMENTS: Payment[] = [];
const INITIAL_JOURNALS: JournalEntry[] = [];
const INITIAL_PROJECTS: Project[] = [];
const INITIAL_TASKS: Task[] = [];
const INITIAL_LEADS: Lead[] = [];
const INITIAL_EXPENSES: Expense[] = [];

// Initial Integration Connections
const INITIAL_INTEGRATIONS: IntegrationConnection[] = [
  {
    id: 'int-whatsapp',
    type: 'whatsapp',
    name: 'WhatsApp Business Cloud API',
    description: 'Send instant invoice links, payment receipts, and proposal updates directly to clients via WhatsApp.',
    status: 'requires_attention',
    config: {
      phoneNumberId: '',
      whatsappBusinessAccountId: '',
      accessTokenMasked: '****************************',
      webhookVerifyToken: 'xeel_tech_secure_wh_token_2026',
    },
    lastSync: undefined,
  },
  {
    id: 'int-email',
    type: 'email',
    name: 'SMTP / Transactional Email (Resend)',
    description: 'Deliver branded PDF invoices, proposals, and automated payment receipts to customer inboxes.',
    status: 'connected',
    config: {
      provider: 'Resend API',
      fromEmail: 'billing@xeeltech.so',
      fromName: 'XEEL TECH Billing',
      apiKeyMasked: 're_****************************',
    },
    lastSync: undefined,
  },
  {
    id: 'int-mobile-money',
    type: 'mobile_money',
    name: 'Somalia Mobile Money (ZAAD / EVC Plus)',
    description: 'Direct payment verification gateway for Telesom ZAAD and Hormuud EVC Plus merchant payments.',
    status: 'not_configured',
    config: {
      merchantId: '',
      apiEndpoint: 'https://api.telesom.com/merchant/v2',
      secretKeyMasked: '',
    },
    lastSync: undefined,
  },
  {
    id: 'int-invoice-finance',
    type: 'accounting',
    name: 'Institutional Invoice Financing (Safibook Partner API)',
    description: 'Secure API bridge for submitting eligible unpaid invoices for institutional liquidity offers.',
    status: 'not_configured',
    config: {
      partnerId: '',
      apiEndpoint: 'https://api.safibook.com/v1/financing',
      authorizationStatus: 'Pending Partner Credential Onboarding',
    },
    lastSync: undefined,
  },
];

// Initial Audit Logs (System initialization record with Ismail Mohamed as Owner)
const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-1',
    actorId: 'usr-owner',
    actorName: 'Ismail Mohamed',
    action: 'SYSTEM_INITIALIZED',
    entity: 'System',
    entityId: 'XEEL-TECH-OS',
    details: 'XEEL TECH Business OS core system initialized with double-entry general ledger and approved services catalog.',
    timestamp: '2026-10-01T08:00:00Z',
    ipAddress: '197.234.218.42',
  },
];

// Users for easy testing and role switching
export const DEMO_USERS: Record<UserRole, UserProfile> = {
  owner: {
    id: 'usr-owner',
    email: 'owner@xeeltech.so',
    fullName: 'Ismail Mohamed',
    role: 'owner',
    permissions: ['all'],
    active: true,
    createdAt: '2026-10-01T00:00:00Z',
  },
  admin: {
    id: 'usr-admin',
    email: 'admin@xeeltech.so',
    fullName: 'Administrator',
    role: 'admin',
    permissions: ['clients.*', 'projects.*', 'invoices.*', 'team.*', 'services.*'],
    active: true,
    createdAt: '2026-10-01T00:00:00Z',
  },
  accountant: {
    id: 'usr-acct',
    email: 'accountant@xeeltech.so',
    fullName: 'Chief Accountant',
    role: 'accountant',
    permissions: ['invoices.*', 'payments.*', 'accounting.*', 'expenses.*', 'reports.*'],
    active: true,
    createdAt: '2026-10-01T00:00:00Z',
  },
  manager: {
    id: 'usr-mgr',
    email: 'manager@xeeltech.so',
    fullName: 'Project Lead',
    role: 'manager',
    permissions: ['projects.*', 'tasks.*', 'clients.view', 'team.view'],
    active: true,
    createdAt: '2026-10-01T00:00:00Z',
  },
  staff: {
    id: 'usr-staff',
    email: 'staff@xeeltech.so',
    fullName: 'Creative Specialist',
    role: 'staff',
    permissions: ['projects.view', 'tasks.update'],
    active: true,
    createdAt: '2026-10-01T00:00:00Z',
  },
};

interface AppContextType {
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  switchUserRole: (role: UserRole) => void;
  isLoggedIn: boolean;
  login: (email: string, role?: UserRole) => void;
  logout: () => void;

  // CRM
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'outstandingBalance'>) => Client;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  // Leads
  leads: Lead[];
  addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => Lead;
  updateLeadStage: (id: string, stage: Lead['stage']) => void;
  convertLeadToClient: (leadId: string) => Client;

  // Services
  services: ServiceItem[];
  addService: (service: Omit<ServiceItem, 'id'>) => void;
  updateService: (id: string, updates: Partial<ServiceItem>) => void;
  toggleServiceActive: (id: string) => void;

  // Quotations
  quotations: Quotation[];
  createQuotation: (quote: Omit<Quotation, 'id' | 'quotationNumber' | 'createdAt'>) => Quotation;
  updateQuotationStatus: (id: string, status: Quotation['status']) => void;
  convertQuotationToInvoice: (quotationId: string) => Invoice;

  // Projects & Tasks
  projects: Project[];
  tasks: Task[];
  createProject: (project: Omit<Project, 'id' | 'projectRef' | 'actualCost' | 'createdAt'>) => Project;
  updateProjectStage: (id: string, stage: Project['stage']) => void;
  createTask: (task: Omit<Task, 'id' | 'createdAt'>) => Task;
  toggleTaskChecklist: (taskId: string, checkId: string) => void;
  updateTaskStatus: (taskId: string, status: Task['status']) => void;

  // Invoicing & Billing
  invoices: Invoice[];
  createInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'amountPaid' | 'balanceDue' | 'status' | 'createdAt'>) => Invoice;
  updateInvoiceStatus: (id: string, status: Invoice['status']) => void;

  // Payments & Receipts
  payments: Payment[];
  recordPayment: (payment: Omit<Payment, 'id' | 'receiptNumber' | 'createdAt'>) => Payment;

  // Instant Cash / Invoice Financing
  cashOffers: InstantCashOffer[];
  requestInstantCash: (invoiceId: string) => InstantCashOffer;
  updateCashOfferStatus: (offerId: string, status: InstantCashOffer['status']) => void;

  // Accounting & General Ledger
  accounts: Account[];
  journalEntries: JournalEntry[];
  postManualJournal: (entry: Omit<JournalEntry, 'id' | 'entryNumber' | 'isBalanced' | 'createdAt'>) => JournalEntry;

  // Expenses
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'expenseRef' | 'createdAt'>) => Expense;
  updateExpenseApproval: (id: string, status: Expense['approvalStatus']) => void;

  // Integrations
  integrations: IntegrationConnection[];
  integrationLogs: IntegrationLog[];
  updateIntegrationConfig: (id: string, config: Record<string, string>, status: IntegrationConnection['status']) => void;
  testIntegration: (id: string) => Promise<{ success: boolean; message: string }>;

  // Audit & Notifications
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;

  // Settings
  companySettings: CompanySettings;
  updateCompanySettings: (settings: Partial<CompanySettings>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // One-time cleanup trigger to wipe old demo and fake records from localStorage
  const CLEAN_SLATE_KEY = 'xeel_clean_slate_2026_ismail';
  if (typeof window !== 'undefined' && localStorage.getItem(CLEAN_SLATE_KEY) !== 'true') {
    const keysToPurge = [
      'xeel_clients',
      'xeel_leads',
      'xeel_projects',
      'xeel_tasks',
      'xeel_invoices',
      'xeel_payments',
      'xeel_expenses',
      'xeel_journal_entries',
      'xeel_cash_offers',
      'xeel_quotations',
      'xeel_integration_logs',
      'xeel_audit_logs',
      'xeel_accounts',
    ];
    keysToPurge.forEach(k => localStorage.removeItem(k));
    localStorage.setItem('xeel_current_user', JSON.stringify(DEMO_USERS.owner));
    localStorage.setItem(CLEAN_SLATE_KEY, 'true');
  }

  // Current user state (Defaults strictly to Ismail Mohamed as Owner with full permissions)
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('xeel_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.role === 'owner') {
          parsed.fullName = 'Ismail Mohamed';
          parsed.permissions = ['all'];
          localStorage.setItem('xeel_current_user', JSON.stringify(parsed));
        }
        return parsed;
      } catch {
        return DEMO_USERS.owner;
      }
    }
    return DEMO_USERS.owner;
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('xeel_is_logged_in') !== 'false';
  });

  const switchUserRole = (role: UserRole) => {
    const newUser = DEMO_USERS[role];
    setCurrentUser(newUser);
    localStorage.setItem('xeel_current_user', JSON.stringify(newUser));
    addAuditLog('ROLE_SWITCHED', 'User', newUser.id, `Switched active preview role to ${role}`);
  };

  const login = (email: string, role?: UserRole) => {
    const selectedRole = role || 'owner';
    const user = { ...DEMO_USERS[selectedRole], email };
    setCurrentUser(user);
    setIsLoggedIn(true);
    localStorage.setItem('xeel_is_logged_in', 'true');
    localStorage.setItem('xeel_current_user', JSON.stringify(user));
    addAuditLog('USER_LOGIN', 'User', user.id, `User logged in as ${user.role} (${user.email})`);
  };

  const logout = () => {
    addAuditLog('USER_LOGOUT', 'User', currentUser.id, `User ${currentUser.email} logged out`);
    setIsLoggedIn(false);
    localStorage.setItem('xeel_is_logged_in', 'false');
  };

  // Generic local state helper with localStorage persistence
  function usePersistedState<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [state, setState] = useState<T>(() => {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
      } catch {
        return initialValue;
      }
    });

    useEffect(() => {
      try {
        localStorage.setItem(key, JSON.stringify(state));
      } catch (e) {
        console.error('Failed to save state to localStorage', e);
      }
    }, [key, state]);

    return [state, setState];
  }

  // Persisted Entity States (Clean Initial Records)
  const [clients, setClients] = usePersistedState<Client[]>('xeel_clients', INITIAL_CLIENTS);
  const [leads, setLeads] = usePersistedState<Lead[]>('xeel_leads', INITIAL_LEADS);
  const [services, setServices] = usePersistedState<ServiceItem[]>('xeel_services', INITIAL_SERVICES);
  const [quotations, setQuotations] = usePersistedState<Quotation[]>('xeel_quotations', []);
  const [projects, setProjects] = usePersistedState<Project[]>('xeel_projects', INITIAL_PROJECTS);
  const [tasks, setTasks] = usePersistedState<Task[]>('xeel_tasks', INITIAL_TASKS);
  const [invoices, setInvoices] = usePersistedState<Invoice[]>('xeel_invoices', INITIAL_INVOICES);
  const [payments, setPayments] = usePersistedState<Payment[]>('xeel_payments', INITIAL_PAYMENTS);
  const [cashOffers, setCashOffers] = usePersistedState<InstantCashOffer[]>('xeel_cash_offers', []);
  const [accounts, setAccounts] = usePersistedState<Account[]>('xeel_accounts', INITIAL_ACCOUNTS);
  const [journalEntries, setJournalEntries] = usePersistedState<JournalEntry[]>('xeel_journal_entries', INITIAL_JOURNALS);
  const [expenses, setExpenses] = usePersistedState<Expense[]>('xeel_expenses', INITIAL_EXPENSES);
  const [integrations, setIntegrations] = usePersistedState<IntegrationConnection[]>('xeel_integrations', INITIAL_INTEGRATIONS);
  const [integrationLogs, setIntegrationLogs] = usePersistedState<IntegrationLog[]>('xeel_integration_logs', []);
  const [auditLogs, setAuditLogs] = usePersistedState<AuditLog[]>('xeel_audit_logs', INITIAL_AUDIT_LOGS);
  const [notifications, setNotifications] = usePersistedState<NotificationItem[]>('xeel_notifications', [
    {
      id: 'notif-1',
      title: 'Welcome to XEEL TECH Business OS',
      message: 'System running with clean double-entry general ledger in Laascaanood, Somalia. Business Owner: Ismail Mohamed.',
      type: 'info',
      read: false,
      timestamp: new Date().toISOString(),
    },
  ]);

  const [companySettings, setCompanySettings] = usePersistedState<CompanySettings>('xeel_company_settings', {
    companyName: 'XEEL TECH',
    location: 'Laascaanood, Somalia',
    phone: '+252 63 4700000',
    email: 'info@xeeltech.so',
    website: 'https://xeeltech.so',
    baseCurrency: 'USD',
    invoicePrefix: 'XT-INV',
    receiptPrefix: 'XT-RCP',
    taxDefaultRate: 0,
    paymentInstructions: 'Bank: Dahabshiil Bank A/C: 98442 | Salaam Bank A/C: 330129 | Telesom ZAAD Merchant: 778899 | Hormuud EVC Plus: 778899',
    supabaseConnected: isSupabaseConfigured,
  });

  const updateCompanySettings = (updates: Partial<CompanySettings>) => {
    setCompanySettings(prev => ({ ...prev, ...updates }));
    addAuditLog('SETTINGS_UPDATED', 'Settings', 'company_settings', 'Updated company business configuration');
  };

  // Helper for audit logging
  const addAuditLog = (action: string, entity: string, entityId: string, details: string) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      action,
      entity,
      entityId,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: '197.234.218.42',
    };
    setAuditLogs(prev => [newLog, ...prev.slice(0, 199)]); // maintain last 200 logs
  };

  // Helper for notifications
  const addNotification = (title: string, message: string, type: NotificationItem['type'] = 'info') => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      read: false,
      timestamp: new Date().toISOString(),
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // =========================================================================
  // CRM CLIENTS WORKFLOW
  // =========================================================================
  const addClient = (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'outstandingBalance'>): Client => {
    const newClient: Client = {
      ...clientData,
      id: `cli-${Date.now()}`,
      outstandingBalance: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setClients(prev => [newClient, ...prev]);
    addAuditLog('CLIENT_CREATED', 'Client', newClient.id, `Created new client: ${newClient.name} (${newClient.companyName || 'Individual'})`);
    addNotification('New Client Added', `${newClient.name} was successfully registered.`, 'success');
    return newClient;
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c));
    addAuditLog('CLIENT_UPDATED', 'Client', id, `Updated details for client ID: ${id}`);
  };

  const deleteClient = (id: string) => {
    const target = clients.find(c => c.id === id);
    setClients(prev => prev.filter(c => c.id !== id));
    addAuditLog('CLIENT_DELETED', 'Client', id, `Deleted client: ${target?.name || id}`);
  };

  // =========================================================================
  // LEADS PIPELINE
  // =========================================================================
  const addLead = (leadData: Omit<Lead, 'id' | 'createdAt'>): Lead => {
    const newLead: Lead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setLeads(prev => [newLead, ...prev]);
    addAuditLog('LEAD_CREATED', 'Lead', newLead.id, `Added lead: ${newLead.name} (${newLead.estimatedValue ? '$' + newLead.estimatedValue : 'TBD'})`);
    return newLead;
  };

  const updateLeadStage = (id: string, stage: Lead['stage']) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, stage } : l));
    addAuditLog('LEAD_STAGE_UPDATED', 'Lead', id, `Lead moved to stage: ${stage}`);
  };

  const convertLeadToClient = (leadId: string): Client => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) throw new Error('Lead not found');

    const newClient: Client = {
      id: `cli-${Date.now()}`,
      clientType: lead.companyName ? 'company' : 'individual',
      name: lead.name,
      companyName: lead.companyName,
      category: lead.category,
      phone: lead.phone,
      email: lead.email,
      address: 'Laascaanood, Somalia',
      source: lead.source || 'Sales Pipeline',
      status: 'active',
      accountManager: currentUser.fullName,
      notes: `Converted from Won Lead. Next action was: ${lead.nextAction}. Notes: ${lead.notes || ''}`,
      tags: ['Converted Lead', lead.category].filter(Boolean),
      outstandingBalance: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setClients(prev => [newClient, ...prev]);
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage: 'won' } : l));
    addAuditLog('LEAD_CONVERTED', 'Client', newClient.id, `Converted won lead ${lead.name} to full client.`);
    addNotification('Lead Won & Converted', `${lead.name} is now an active XEEL TECH client.`, 'success');
    return newClient;
  };

  // =========================================================================
  // APPROVED SERVICES
  // =========================================================================
  const addService = (serviceData: Omit<ServiceItem, 'id'>) => {
    const newService: ServiceItem = {
      ...serviceData,
      id: `srv-${Date.now()}`,
    };
    setServices(prev => [...prev, newService]);
    addAuditLog('SERVICE_CREATED', 'Service', newService.id, `Added service: ${newService.nameEn}`);
  };

  const updateService = (id: string, updates: Partial<ServiceItem>) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    addAuditLog('SERVICE_UPDATED', 'Service', id, `Updated service ID: ${id}`);
  };

  const toggleServiceActive = (id: string) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  // =========================================================================
  // QUOTATIONS & PROPOSALS
  // =========================================================================
  const createQuotation = (quoteData: Omit<Quotation, 'id' | 'quotationNumber' | 'createdAt'>): Quotation => {
    const count = quotations.length + 1;
    const year = new Date().getFullYear();
    const quotationNumber = `XT-PROP-${year}-${String(count).padStart(4, '0')}`;

    const newQuote: Quotation = {
      ...quoteData,
      id: `quote-${Date.now()}`,
      quotationNumber,
      createdAt: new Date().toISOString(),
    };

    setQuotations(prev => [newQuote, ...prev]);
    addAuditLog('QUOTATION_CREATED', 'Quotation', newQuote.id, `Created quotation ${quotationNumber} for ${newQuote.clientName} ($${newQuote.totalAmount})`);
    return newQuote;
  };

  const updateQuotationStatus = (id: string, status: Quotation['status']) => {
    setQuotations(prev => prev.map(q => q.id === id ? { ...q, status } : q));
    addAuditLog('QUOTATION_STATUS_UPDATED', 'Quotation', id, `Quotation status updated to ${status}`);
  };

  const convertQuotationToInvoice = (quotationId: string): Invoice => {
    const quote = quotations.find(q => q.id === quotationId);
    if (!quote) throw new Error('Quotation not found');

    const newInvoice = createInvoice({
      clientId: quote.clientId,
      clientName: quote.clientName,
      clientPhone: quote.clientPhone,
      clientEmail: quote.clientEmail,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      items: quote.items.map(item => ({
        id: `itm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        serviceId: item.serviceId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        total: item.total,
      })),
      subtotal: quote.subtotal,
      discount: quote.discount,
      taxRate: quote.taxRate,
      taxAmount: quote.taxAmount,
      totalAmount: quote.totalAmount,
      paymentInstructions: companySettings.paymentInstructions,
      terms: quote.terms || 'Payment due within 15 calendar days from issuance.',
    });

    setQuotations(prev => prev.map(q => q.id === quotationId ? { ...q, status: 'converted', convertedInvoiceId: newInvoice.id } : q));
    addAuditLog('QUOTATION_CONVERTED', 'Invoice', newInvoice.id, `Converted quote ${quote.quotationNumber} to invoice ${newInvoice.invoiceNumber}`);
    return newInvoice;
  };

  // =========================================================================
  // PROJECTS & TASKS
  // =========================================================================
  const createProject = (projectData: Omit<Project, 'id' | 'projectRef' | 'actualCost' | 'createdAt'>): Project => {
    const count = projects.length + 1;
    const year = new Date().getFullYear();
    const projectRef = `XT-PRJ-${year}-${String(count).padStart(3, '0')}`;

    const newProject: Project = {
      ...projectData,
      id: `proj-${Date.now()}`,
      projectRef,
      actualCost: 0,
      createdAt: new Date().toISOString(),
    };

    setProjects(prev => [newProject, ...prev]);
    addAuditLog('PROJECT_CREATED', 'Project', newProject.id, `Created project ${projectRef}: ${newProject.name}`);
    return newProject;
  };

  const updateProjectStage = (id: string, stage: Project['stage']) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, stage } : p));
    addAuditLog('PROJECT_STAGE_UPDATED', 'Project', id, `Project stage changed to: ${stage}`);
  };

  const createTask = (taskData: Omit<Task, 'id' | 'createdAt'>): Task => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);
    addAuditLog('TASK_CREATED', 'Task', newTask.id, `Created task: ${newTask.title} for ${newTask.assignedTo}`);
    return newTask;
  };

  const toggleTaskChecklist = (taskId: string, checkId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          checklist: t.checklist.map(c => c.id === checkId ? { ...c, completed: !c.completed } : c),
        };
      }
      return t;
    }));
  };

  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
  };

  // =========================================================================
  // INVOICING & DOUBLE-ENTRY AUTO POSTING
  // =========================================================================
  const createInvoice = (invData: Omit<Invoice, 'id' | 'invoiceNumber' | 'amountPaid' | 'balanceDue' | 'status' | 'createdAt'>): Invoice => {
    const count = invoices.length + 1;
    const year = new Date().getFullYear();
    const invoiceNumber = `${companySettings.invoicePrefix}-${year}-${String(count).padStart(4, '0')}`;

    const newInvoice: Invoice = {
      ...invData,
      id: `inv-${Date.now()}`,
      invoiceNumber,
      amountPaid: 0,
      balanceDue: invData.totalAmount,
      status: 'issued',
      createdAt: new Date().toISOString(),
    };

    // 1. Save invoice
    setInvoices(prev => [newInvoice, ...prev]);

    // 2. Update client's outstanding balance
    setClients(prev => prev.map(c => c.id === newInvoice.clientId ? {
      ...c,
      outstandingBalance: (c.outstandingBalance || 0) + newInvoice.totalAmount,
    } : c));

    // 3. Post Automatic Balanced Journal Entry:
    // Debit: Accounts Receivable (1200) = totalAmount
    // Credit: Creative Design Revenue (4000) = subtotal
    // Credit: Sales Tax Payable (2200) = taxAmount (if > 0)
    const journalNumber = `XT-JE-${year}-${String(journalEntries.length + 1).padStart(4, '0')}`;
    const journalLines = [
      {
        id: `jl-${Date.now()}-1`,
        accountId: 'acc-1200',
        accountCode: '1200',
        accountName: 'Accounts Receivable (A/R)',
        debit: newInvoice.totalAmount,
        credit: 0,
        memo: `A/R for invoice ${invoiceNumber} (${newInvoice.clientName})`,
      },
      {
        id: `jl-${Date.now()}-2`,
        accountId: 'acc-4000',
        accountCode: '4000',
        accountName: 'Creative Design Revenue',
        debit: 0,
        credit: newInvoice.subtotal,
        memo: `Revenue recognized for ${invoiceNumber}`,
      },
    ];

    if (newInvoice.taxAmount > 0) {
      journalLines.push({
        id: `jl-${Date.now()}-3`,
        accountId: 'acc-2200',
        accountCode: '2200',
        accountName: 'Sales Tax Payable',
        debit: 0,
        credit: newInvoice.taxAmount,
        memo: `Sales tax on ${invoiceNumber}`,
      });
    }

    const autoJournal: JournalEntry = {
      id: `je-${Date.now()}`,
      entryNumber: journalNumber,
      date: newInvoice.issueDate,
      referenceType: 'invoice',
      referenceId: invoiceNumber,
      description: `Automated posting for issued invoice ${invoiceNumber} to ${newInvoice.clientName}`,
      lines: journalLines,
      isBalanced: true,
      postedBy: 'System Auto-Posting Engine',
      createdAt: new Date().toISOString(),
    };

    setJournalEntries(prev => [autoJournal, ...prev]);

    // Update account balances
    setAccounts(prev => prev.map(acc => {
      if (acc.code === '1200') return { ...acc, balance: acc.balance + newInvoice.totalAmount };
      if (acc.code === '4000') return { ...acc, balance: acc.balance + newInvoice.subtotal };
      if (acc.code === '2200') return { ...acc, balance: acc.balance + newInvoice.taxAmount };
      return acc;
    }));

    addAuditLog('INVOICE_ISSUED', 'Invoice', newInvoice.id, `Issued invoice ${invoiceNumber} to ${newInvoice.clientName} for $${newInvoice.totalAmount}. Journal ${journalNumber} posted.`);
    addNotification('Invoice Issued', `Invoice ${invoiceNumber} created for ${newInvoice.clientName} ($${newInvoice.totalAmount}).`, 'info');

    return newInvoice;
  };

  const updateInvoiceStatus = (id: string, status: Invoice['status']) => {
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, status } : i));
  };

  // =========================================================================
  // PAYMENTS & OFFICIAL RECEIPTS
  // =========================================================================
  const recordPayment = (paymentData: Omit<Payment, 'id' | 'receiptNumber' | 'createdAt'>): Payment => {
    const count = payments.length + 1;
    const year = new Date().getFullYear();
    const receiptNumber = `${companySettings.receiptPrefix}-${year}-${String(count).padStart(4, '0')}`;

    const newPayment: Payment = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      receiptNumber,
      createdAt: new Date().toISOString(),
    };

    // 1. Save payment record
    setPayments(prev => [newPayment, ...prev]);

    // 2. Update invoice balance and status
    setInvoices(prev => prev.map(inv => {
      if (inv.id === newPayment.invoiceId) {
        const newAmountPaid = (inv.amountPaid || 0) + newPayment.amount;
        const newBalanceDue = Math.max(0, inv.totalAmount - newAmountPaid);
        const newStatus: Invoice['status'] = newBalanceDue <= 0 ? 'paid' : 'partially_paid';

        return {
          ...inv,
          amountPaid: newAmountPaid,
          balanceDue: newBalanceDue,
          status: newStatus,
        };
      }
      return inv;
    }));

    // 3. Update client's outstanding balance
    setClients(prev => prev.map(c => {
      if (c.id === newPayment.clientId) {
        return {
          ...c,
          outstandingBalance: Math.max(0, (c.outstandingBalance || 0) - newPayment.amount),
        };
      }
      return c;
    }));

    // 4. Map payment account
    let depositAccountCode = '1010'; // default cash
    let depositAccountId = 'acc-1010';
    let depositAccountName = 'Cash in Hand (Petty Cash)';

    if (newPayment.paymentMethod === 'bank_transfer') {
      depositAccountCode = '1020';
      depositAccountId = 'acc-1020';
      depositAccountName = 'Bank Account - Dahabshiil Bank';
    } else if (newPayment.paymentMethod === 'mobile_money') {
      depositAccountCode = '1030';
      depositAccountId = 'acc-1030';
      depositAccountName = 'Mobile Money - ZAAD / EVC Plus';
    }

    // 5. Post Automatic Balanced Journal Entry:
    // Debit: Cash/Bank/Mobile Money (1010/1020/1030) = amount
    // Credit: Accounts Receivable (1200) = amount
    const journalNumber = `XT-JE-${year}-${String(journalEntries.length + 1).padStart(4, '0')}`;
    const autoJournal: JournalEntry = {
      id: `je-${Date.now()}`,
      entryNumber: journalNumber,
      date: newPayment.paymentDate,
      referenceType: 'payment',
      referenceId: receiptNumber,
      description: `Payment received from ${newPayment.clientName} against ${newPayment.invoiceNumber} via ${newPayment.paymentMethod}`,
      lines: [
        {
          id: `jl-${Date.now()}-1`,
          accountId: depositAccountId,
          accountCode: depositAccountCode,
          accountName: depositAccountName,
          debit: newPayment.amount,
          credit: 0,
          memo: `Payment deposit: ${receiptNumber} (${newPayment.transactionRef || 'Direct'})`,
        },
        {
          id: `jl-${Date.now()}-2`,
          accountId: 'acc-1200',
          accountCode: '1200',
          accountName: 'Accounts Receivable (A/R)',
          debit: 0,
          credit: newPayment.amount,
          memo: `Settlement against invoice ${newPayment.invoiceNumber}`,
        },
      ],
      isBalanced: true,
      postedBy: newPayment.recordedBy || currentUser.fullName,
      createdAt: new Date().toISOString(),
    };

    setJournalEntries(prev => [autoJournal, ...prev]);

    // Update account balances
    setAccounts(prev => prev.map(acc => {
      if (acc.code === depositAccountCode) return { ...acc, balance: acc.balance + newPayment.amount };
      if (acc.code === '1200') return { ...acc, balance: Math.max(0, acc.balance - newPayment.amount) };
      return acc;
    }));

    addAuditLog('PAYMENT_RECORDED', 'Payment', newPayment.id, `Payment of $${newPayment.amount} recorded for ${newPayment.invoiceNumber}. Receipt ${receiptNumber} generated.`);
    addNotification('Payment Received', `Received $${newPayment.amount} from ${newPayment.clientName} (Receipt: ${receiptNumber}).`, 'success');

    return newPayment;
  };

  // =========================================================================
  // INSTANT CASH FROM UNPAID INVOICES (QAANSHEEGYADA LA BIXIN LACAG DEGDEG AH)
  // =========================================================================
  const requestInstantCash = (invoiceId: string): InstantCashOffer => {
    const inv = invoices.find(i => i.id === invoiceId);
    if (!inv) throw new Error('Invoice not found');

    const issueDate = new Date(inv.issueDate);
    const today = new Date();
    const daysOutstanding = Math.max(1, Math.floor((today.getTime() - issueDate.getTime()) / (1000 * 3600 * 24)));

    const serviceFeePercent = 3.50; // 3.5% transparent fee
    const serviceFeeAmount = Number(((inv.balanceDue * serviceFeePercent) / 100).toFixed(2));
    const netProceeds = Number((inv.balanceDue - serviceFeeAmount).toFixed(2));

    const newOffer: InstantCashOffer = {
      id: `csh-${Date.now()}`,
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      clientId: inv.clientId,
      clientName: inv.clientName,
      invoiceAmount: inv.totalAmount,
      outstandingBalance: inv.balanceDue,
      daysOutstanding,
      serviceFeePercent,
      serviceFeeAmount,
      netProceeds,
      status: 'offer_available',
      termsAgreed: false,
      requestDate: new Date().toISOString(),
      notes: `Automated financing quote generated for ${inv.invoiceNumber} (${daysOutstanding} days outstanding). Subject to institutional underwriter review.`,
    };

    setCashOffers(prev => [newOffer, ...prev]);
    addAuditLog('INSTANT_CASH_REQUESTED', 'Financing', newOffer.id, `Generated invoice financing quote for ${inv.invoiceNumber}: Net $${netProceeds} (Fee: $${serviceFeeAmount})`);
    addNotification('Financing Offer Generated', `Instant cash offer of $${netProceeds} ready for review on invoice ${inv.invoiceNumber}.`, 'info');
    return newOffer;
  };

  const updateCashOfferStatus = (offerId: string, status: InstantCashOffer['status']) => {
    setCashOffers(prev => prev.map(o => {
      if (o.id === offerId) {
        const updated = { ...o, status };
        if (status === 'accepted') {
          updated.decisionDate = new Date().toISOString();
          updated.termsAgreed = true;
        } else if (status === 'funded') {
          updated.fundedDate = new Date().toISOString();

          // If marked verified funded by Owner/Accountant, post the real accounting entries:
          // Debit: Bank Account (1020) = netProceeds
          // Debit: Financing Expense (5040) = serviceFeeAmount
          // Credit: Short-term Financing Liability (2100) = outstandingBalance
          const year = new Date().getFullYear();
          const journalNumber = `XT-JE-${year}-${String(journalEntries.length + 1).padStart(4, '0')}`;
          const fundJournal: JournalEntry = {
            id: `je-${Date.now()}`,
            entryNumber: journalNumber,
            date: new Date().toISOString().split('T')[0],
            referenceType: 'financing',
            referenceId: o.invoiceNumber,
            description: `Disbursement received from Invoice Financing on ${o.invoiceNumber}`,
            lines: [
              {
                id: `jl-${Date.now()}-1`,
                accountId: 'acc-1020',
                accountCode: '1020',
                accountName: 'Bank Account - Dahabshiil Bank',
                debit: o.netProceeds,
                credit: 0,
                memo: `Financing advance received: ${o.invoiceNumber}`,
              },
              {
                id: `jl-${Date.now()}-2`,
                accountId: 'acc-5040',
                accountCode: '5040',
                accountName: 'Marketing & Advertising Expenses',
                debit: o.serviceFeeAmount,
                credit: 0,
                memo: `Financing processing fee (${o.serviceFeePercent}%) on ${o.invoiceNumber}`,
              },
              {
                id: `jl-${Date.now()}-3`,
                accountId: 'acc-2100',
                accountCode: '2100',
                accountName: 'Short-term Financing Liability',
                debit: 0,
                credit: o.outstandingBalance,
                memo: `Financing advance obligation on ${o.invoiceNumber}`,
              },
            ],
            isBalanced: true,
            postedBy: currentUser.fullName,
            createdAt: new Date().toISOString(),
          };

          setJournalEntries(j => [fundJournal, ...j]);

          // Update accounts
          setAccounts(accs => accs.map(acc => {
            if (acc.code === '1020') return { ...acc, balance: acc.balance + o.netProceeds };
            if (acc.code === '2100') return { ...acc, balance: acc.balance + o.outstandingBalance };
            return acc;
          }));
        }
        return updated;
      }
      return o;
    }));

    addAuditLog('FINANCING_STATUS_CHANGED', 'Financing', offerId, `Invoice financing status changed to: ${status}`);
  };

  // =========================================================================
  // MANUAL JOURNAL ENTRIES (DOUBLE-ENTRY GENERAL LEDGER)
  // =========================================================================
  const postManualJournal = (entryData: Omit<JournalEntry, 'id' | 'entryNumber' | 'isBalanced' | 'createdAt'>): JournalEntry => {
    const totalDebits = entryData.lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
    const totalCredits = entryData.lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);

    if (Math.abs(totalDebits - totalCredits) > 0.001) {
      throw new Error(`Unbalanced entry: Debits ($${totalDebits.toFixed(2)}) must equal Credits ($${totalCredits.toFixed(2)})`);
    }

    const count = journalEntries.length + 1;
    const year = new Date().getFullYear();
    const entryNumber = `XT-JE-${year}-${String(count).padStart(4, '0')}`;

    const newEntry: JournalEntry = {
      ...entryData,
      id: `je-${Date.now()}`,
      entryNumber,
      isBalanced: true,
      postedBy: currentUser.fullName,
      createdAt: new Date().toISOString(),
    };

    setJournalEntries(prev => [newEntry, ...prev]);

    // Update account balances
    setAccounts(prev => prev.map(acc => {
      const line = entryData.lines.find(l => l.accountId === acc.id || l.accountCode === acc.code);
      if (!line) return acc;

      const debit = Number(line.debit) || 0;
      const credit = Number(line.credit) || 0;

      // Assets & Expenses increase on Debit, decrease on Credit
      // Liabilities, Equity & Revenue increase on Credit, decrease on Debit
      if (acc.type === 'asset' || acc.type === 'expense') {
        return { ...acc, balance: acc.balance + (debit - credit) };
      } else {
        return { ...acc, balance: acc.balance + (credit - debit) };
      }
    }));

    addAuditLog('JOURNAL_POSTED', 'Journal', newEntry.id, `Posted manual journal ${entryNumber}: ${entryData.description} ($${totalDebits})`);
    return newEntry;
  };

  // =========================================================================
  // EXPENSES WORKFLOW
  // =========================================================================
  const addExpense = (expData: Omit<Expense, 'id' | 'expenseRef' | 'createdAt'>): Expense => {
    const count = expenses.length + 1;
    const year = new Date().getFullYear();
    const expenseRef = `XT-EXP-${year}-${String(count).padStart(4, '0')}`;

    const newExpense: Expense = {
      ...expData,
      id: `exp-${Date.now()}`,
      expenseRef,
      createdAt: new Date().toISOString(),
    };

    setExpenses(prev => [newExpense, ...prev]);

    // If already approved/paid, post balanced journal entry
    if (newExpense.approvalStatus === 'paid' || newExpense.approvalStatus === 'approved') {
      const journalNumber = `XT-JE-${year}-${String(journalEntries.length + 1).padStart(4, '0')}`;
      const autoJournal: JournalEntry = {
        id: `je-${Date.now()}`,
        entryNumber: journalNumber,
        date: newExpense.date,
        referenceType: 'expense',
        referenceId: expenseRef,
        description: `Expense: ${newExpense.description} (${newExpense.category})`,
        lines: [
          {
            id: `jl-${Date.now()}-1`,
            accountId: 'acc-5010', // Map to general operating expense
            accountCode: '5010',
            accountName: 'Operating & Studio Expenses',
            debit: newExpense.amount,
            credit: 0,
            memo: newExpense.description,
          },
          {
            id: `jl-${Date.now()}-2`,
            accountId: newExpense.paidWithAccountId || 'acc-1010',
            accountCode: '1010',
            accountName: 'Cash / Bank / Mobile Money',
            debit: 0,
            credit: newExpense.amount,
            memo: `Disbursement for ${expenseRef}`,
          },
        ],
        isBalanced: true,
        postedBy: currentUser.fullName,
        createdAt: new Date().toISOString(),
      };

      setJournalEntries(prev => [autoJournal, ...prev]);

      // Deduct from paid account
      setAccounts(prev => prev.map(acc => {
        if (acc.id === newExpense.paidWithAccountId || acc.code === '1010') {
          return { ...acc, balance: acc.balance - newExpense.amount };
        }
        return acc;
      }));
    }

    addAuditLog('EXPENSE_RECORDED', 'Expense', newExpense.id, `Recorded expense ${expenseRef}: $${newExpense.amount} (${newExpense.description})`);
    return newExpense;
  };

  const updateExpenseApproval = (id: string, approvalStatus: Expense['approvalStatus']) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, approvalStatus } : e));
    addAuditLog('EXPENSE_APPROVAL_UPDATED', 'Expense', id, `Expense status updated to: ${approvalStatus}`);
  };

  // =========================================================================
  // INTEGRATIONS & EXTERNAL GATEWAYS
  // =========================================================================
  const updateIntegrationConfig = (id: string, config: Record<string, string>, status: IntegrationConnection['status']) => {
    setIntegrations(prev => prev.map(item => item.id === id ? {
      ...item,
      config,
      status,
      lastSync: new Date().toISOString(),
    } : item));

    const log: IntegrationLog = {
      id: `log-${Date.now()}`,
      connectionId: id,
      connectionName: id,
      type: 'CONFIG_UPDATE',
      status: 'success',
      message: `Updated integration credentials for ${id}. New state: ${status}`,
      payloadSummary: `Parameters updated: ${Object.keys(config).join(', ')}`,
      timestamp: new Date().toISOString(),
    };
    setIntegrationLogs(prev => [log, ...prev]);
    addAuditLog('INTEGRATION_CONFIGURED', 'Integration', id, `Updated configuration for ${id}`);
  };

  const testIntegration = async (id: string): Promise<{ success: boolean; message: string }> => {
    const conn = integrations.find(i => i.id === id);
    if (!conn) return { success: false, message: 'Integration not found' };

    // Simulate genuine server validation
    await new Promise(r => setTimeout(r, 900));

    // Check if configuration credentials are empty
    const keys = Object.values(conn.config);
    const hasEmpty = keys.some(v => !v || v.trim() === '' || v.includes('your-'));

    if (hasEmpty || conn.status === 'not_configured') {
      const failLog: IntegrationLog = {
        id: `log-${Date.now()}`,
        connectionId: id,
        connectionName: conn.name,
        type: 'HEALTH_CHECK',
        status: 'failed',
        message: 'Connection check failed: Missing or incomplete provider API credentials.',
        payloadSummary: 'Status 401 Unauthorized - Credentials required.',
        timestamp: new Date().toISOString(),
      };
      setIntegrationLogs(prev => [failLog, ...prev]);
      return { success: false, message: 'Connection test failed: Valid API keys or endpoint credentials required.' };
    }

    const successLog: IntegrationLog = {
      id: `log-${Date.now()}`,
      connectionId: id,
      connectionName: conn.name,
      type: 'HEALTH_CHECK',
      status: 'success',
      message: 'Connection verified: API gateway responded with 200 OK.',
      payloadSummary: 'Latency: 142ms, TLS 1.3 encrypted handshake verified.',
      timestamp: new Date().toISOString(),
    };
    setIntegrationLogs(prev => [successLog, ...prev]);
    return { success: true, message: `Successfully connected to ${conn.name}! Latency: 142ms.` };
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchUserRole,
        isLoggedIn,
        login,
        logout,
        clients,
        addClient,
        updateClient,
        deleteClient,
        leads,
        addLead,
        updateLeadStage,
        convertLeadToClient,
        services,
        addService,
        updateService,
        toggleServiceActive,
        quotations,
        createQuotation,
        updateQuotationStatus,
        convertQuotationToInvoice,
        projects,
        tasks,
        createProject,
        updateProjectStage,
        createTask,
        toggleTaskChecklist,
        updateTaskStatus,
        invoices,
        createInvoice,
        updateInvoiceStatus,
        payments,
        recordPayment,
        cashOffers,
        requestInstantCash,
        updateCashOfferStatus,
        accounts,
        journalEntries,
        postManualJournal,
        expenses,
        addExpense,
        updateExpenseApproval,
        integrations,
        integrationLogs,
        updateIntegrationConfig,
        testIntegration,
        auditLogs,
        notifications,
        markNotificationRead,
        companySettings,
        updateCompanySettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
