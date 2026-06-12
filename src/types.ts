export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  avatarUrl?: string;
  initials: string;
  currentDue: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  type: 'milk' | 'egg' | 'feed' | 'other';
}

export interface Transaction {
  id: string;
  customerId: string;
  customerName: string;
  type: 'purchase' | 'payment_received' | 'feed_purchase';
  description: string;
  amount: number;
  time: string;
  date: string;
  isDelivered?: boolean;
}

export type ViewMode = 'dashboard' | 'customers' | 'new_entry' | 'products' | 'billing';
export type UserRole = 'admin' | 'customer';
