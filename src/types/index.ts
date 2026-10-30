export type UserRole = 'owner' | 'admin' | 'accountant' | 'manager' | 'staff';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  permissions: string[];
  avatarUrl?: string;
  active: boolean;
  createdAt: string;
}

export interface Client {
  id: string;
  clientType: 'individual' | 'company';
  name: string;
  companyName?: string;
  category: string;
  phone: string;
  email: string;
  address: string;
  source: string;
  status: 'active' | 'inactive';
  accountManager: string;
  notes?: string;
  tags: string[];
  outstandingBalance: number;
  createdAt: string;
  updatedAt: string;
}

export type LeadStage = 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'negotiation' | 'won' | 'lost';

export interface Lead {
  id: string;
  name: string;
  companyName?: string;
  category: string;
  phone: string;
  email: string;
  source: string;
  estimatedValue: number;
  stage: LeadStage;
  nextAction: string;
  followUpDate: string;
  notes?: string;
  createdAt: string;
}

export interface ServiceItem {
  id: string;
  code: string;
  nameEn: string;
  nameSo: string;
  category: string;
  descriptionEn: string;
  descriptionSo: string;
  defaultPrice: number;
  pricingType: 'fixed' | 'quote';
  deliveryDays: number;
  active: boolean;
}

export interface QuotationItem {
  id: string;
  serviceId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  issueDate: string;
  expiryDate: string;
  items: QuotationItem[];
  subtotal: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  scopeOfWork: string;
  terms: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';
  convertedProjectId?: string;
  convertedInvoiceId?: string;
  createdAt: string;
}

export type ProjectStage = 
  | 'not_started' 
  | 'planning' 
  | 'in_progress' 
  | 'review' 
  | 'client_feedback' 
  | 'revision' 
  | 'completed' 
  | 'on_hold' 
  | 'cancelled';

export interface Project {
  id: string;
  projectRef: string;
  name: string;
  clientId: string;
  clientName: string;
  budget: number;
  startDate: string;
  deadline: string;
  manager: string;
  assignedStaff: string[];
  stage: ProjectStage;
  deliverables: string;
  actualCost: number;
  notes?: string;
  createdAt: string;
}

export interface TaskChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  description: string;
  assignedTo: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deadline: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  checklist: TaskChecklistItem[];
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  serviceId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export type InvoiceStatus = 'draft' | 'issued' | 'partially_paid' | 'paid' | 'overdue' | 'void';

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. XT-INV-2026-0001
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  clientAddress?: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  paymentInstructions: string;
  terms: string;
  status: InvoiceStatus;
  createdAt: string;
}

export interface Payment {
  id: string;
  receiptNumber: string; // e.g. XT-RCP-2026-0001
  invoiceId: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'mobile_money' | 'other';
  transactionRef: string;
  recordedBy: string;
  notes?: string;
  createdAt: string;
}

export type FinancingStatus = 
  | 'not_requested'
  | 'under_review'
  | 'offer_available'
  | 'accepted'
  | 'rejected'
  | 'awaiting_funding'
  | 'funded'
  | 'settled'
  | 'cancelled';

export interface InstantCashOffer {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  invoiceAmount: number;
  outstandingBalance: number;
  daysOutstanding: number;
  serviceFeePercent: number; // e.g. 3.5%
  serviceFeeAmount: number;
  netProceeds: number;
  status: FinancingStatus;
  termsAgreed: boolean;
  requestDate: string;
  decisionDate?: string;
  fundedDate?: string;
  notes?: string;
}

export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';

export interface Account {
  id: string;
  code: string; // e.g. 1010, 1200, 2000, 3000, 4000, 5010
  name: string;
  type: AccountType;
  balance: number;
  description: string;
}

export interface JournalLine {
  id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  memo?: string;
}

export interface JournalEntry {
  id: string;
  entryNumber: string; // e.g. XT-JE-2026-0001
  date: string;
  referenceType: 'invoice' | 'payment' | 'expense' | 'manual' | 'financing';
  referenceId?: string;
  description: string;
  lines: JournalLine[];
  isBalanced: boolean;
  postedBy: string;
  createdAt: string;
}

export type ExpenseCategory = 
  | 'software_subscriptions'
  | 'hardware_equipment'
  | 'office_rent_utilities'
  | 'marketing_advertising'
  | 'contractor_freelance'
  | 'travel_transport'
  | 'other_operating';

export type ExpenseApproval = 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';

export interface Expense {
  id: string;
  expenseRef: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  currency: string;
  date: string;
  paymentMethod: string;
  paidWithAccountId: string;
  supplierId?: string;
  supplierName?: string;
  recordedBy: string;
  approvalStatus: ExpenseApproval;
  receiptUrl?: string;
  projectId?: string;
  notes?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  companyName: string;
  phone: string;
  email: string;
  balanceDue: number;
  notes?: string;
  createdAt: string;
}

export type IntegrationStatus = 
  | 'not_configured'
  | 'connecting'
  | 'connected'
  | 'error'
  | 'disabled'
  | 'requires_attention';

export interface IntegrationConnection {
  id: string;
  type: 'email' | 'whatsapp' | 'mobile_money' | 'accounting' | 'webhook' | 'rest_api';
  name: string;
  description: string;
  status: IntegrationStatus;
  config: Record<string, string>;
  lastSync?: string;
  lastError?: string;
}

export interface IntegrationLog {
  id: string;
  connectionId: string;
  connectionName: string;
  type: string;
  status: 'success' | 'failed' | 'pending';
  message: string;
  payloadSummary: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  read: boolean;
  timestamp: string;
  linkUrl?: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export interface CompanySettings {
  companyName: string; // strictly "XEEL TECH"
  location: string;    // "Laascaanood, Somalia"
  phone: string;
  email: string;
  website: string;
  baseCurrency: string;
  invoicePrefix: string;
  receiptPrefix: string;
  taxDefaultRate: number;
  paymentInstructions: string;
  supabaseConnected: boolean;
}
