export type UserRole = 'admin' | 'accountant' | 'user';
export type PaymentStatus = 'pending' | 'paid' | 'overdue';
export type PaymentMethod = 'cash' | 'credit_card' | 'bank_transfer';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  tax_number: string | null;
  tax_office: string | null;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  tax_number: string | null;
  tax_office: string | null;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  unit: string;
  price: number;
  vat_rate: number;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  description?: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category_id: string;
  amount: number;
  payment_method: PaymentMethod;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  date: string;
  due_date: string;
  customer_id: string | null;
  supplier_id: string | null;
  total_amount: number;
  vat_amount: number;
  status: PaymentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  vat_rate: number;
  vat_amount: number;
  total_amount: number;
  created_at: string;
}

export interface BankAccount {
  id: string;
  bank_name: string;
  account_number: string;
  iban: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
} 