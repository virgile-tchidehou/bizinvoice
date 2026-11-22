// Types principaux de l'application BizInvoice

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid';
export type UserPlan = 'free' | 'trial' | 'premium';

export interface CompanyProfile {
  id: string;
  name: string;
  address: string;
  logoUrl?: string;
  currency: string;
}

export interface Invoice {
  id: string;
  userId: string;
  companyId?: string; // New field for multi-company support
  invoiceNumber: string;
  companyName: string;
  companyAddress: string;
  companyLogoUrl?: string; // Add logo to invoice
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  status: InvoiceStatus;
  notes: string;
  createdAt: Date;
  dueDate: Date;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  // Legacy fields (optional)
  companyName?: string;
  companyAddress?: string;
  currency?: string;
  logoUrl?: string;
  
  // New multi-company support
  companies?: CompanyProfile[];
  
  plan: UserPlan;
  trialEndsAt?: Date;
  invoiceCount: number;
  createdAt: Date;
}

// Limites du plan gratuit
export const FREE_PLAN_LIMIT = 2;
export const PREMIUM_PRICE = 4.99;
