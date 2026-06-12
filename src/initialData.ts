import { Customer, Product, Transaction } from './types';

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    name: 'Rahul Sharma',
    phone: '555-0111',
    initials: 'RS',
    currentDue: 450,
  },
  {
    id: 'c2',
    name: 'Priya Patel',
    phone: '555-0891',
    initials: 'PP',
    currentDue: 0,
  },
  {
    id: 'c3',
    name: 'Amit Singh',
    phone: '555-0333',
    initials: 'AS',
    currentDue: 320,
  },
  {
    id: 'c4',
    name: 'Neha Gupta',
    phone: '555-0444',
    initials: 'NG',
    currentDue: 1500,
  },
  {
    id: 'c5',
    name: 'John Miller',
    phone: '555-0123',
    initials: 'JM',
    currentDue: 452.80,
  },
  {
    id: 'c6',
    name: 'Sarah Adams',
    phone: '555-0891',
    initials: 'SA',
    currentDue: 0,
  },
  {
    id: 'c7',
    name: 'Robert Brown',
    phone: '555-0456',
    initials: 'RB',
    currentDue: 125.50,
  },
  {
    id: 'c8',
    name: 'Emily Klein',
    phone: '555-0992',
    initials: 'EK',
    currentDue: 0,
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Amul Gold',
    price: 66,
    unit: 'L',
    type: 'milk',
  },
  {
    id: 'p2',
    name: 'Amul Taaza',
    price: 54,
    unit: 'L',
    type: 'milk',
  },
  {
    id: 'p3',
    name: 'Butter (500g)',
    price: 280,
    unit: 'unit',
    type: 'other',
  },
  {
    id: 'p4',
    name: 'Farm Eggs',
    price: 5.20,
    unit: 'Dozen',
    type: 'egg',
  },
  {
    id: 'p5',
    name: 'Whole Milk',
    price: 8.40,
    unit: 'Gallon',
    type: 'milk',
  },
  {
    id: 'p6',
    name: 'Cattle Feed',
    price: 1500,
    unit: 'Bag',
    type: 'feed',
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    customerId: 'c1',
    customerName: 'Rahul Sharma',
    type: 'purchase',
    description: 'Milk Purchase - Morning',
    amount: 450,
    time: '10:45 AM',
    date: 'Today',
    isDelivered: true,
  },
  {
    id: 't2',
    customerId: 'c2',
    customerName: 'Priya Patel',
    type: 'payment_received',
    description: 'Payment Received',
    amount: -2000,
    time: '09:30 AM',
    date: 'Today',
    isDelivered: false,
  },
  {
    id: 't3',
    customerId: 'c3',
    customerName: 'Amit Singh',
    type: 'purchase',
    description: 'Milk Purchase - Morning',
    amount: 320,
    time: '08:15 AM',
    date: 'Today',
    isDelivered: true,
  },
  {
    id: 't4',
    customerId: 'c4',
    customerName: 'Neha Gupta',
    type: 'feed_purchase',
    description: 'Feed Purchase',
    amount: 1500,
    time: 'Yesterday',
    date: 'Yesterday',
    isDelivered: true,
  },
  {
    id: 't5',
    customerId: 'c5',
    customerName: 'John Miller',
    type: 'purchase',
    description: 'Milk & Eggs Delivery',
    amount: 13.60,
    time: '07:30 AM',
    date: 'Oct 10',
    isDelivered: true,
  },
  {
    id: 't6',
    customerId: 'c5',
    customerName: 'John Miller',
    type: 'purchase',
    description: 'Whole Milk Delivery',
    amount: 8.40,
    time: '07:15 AM',
    date: 'Oct 08',
    isDelivered: true,
  },
  {
    id: 't7',
    customerId: 'c5',
    customerName: 'John Miller',
    type: 'payment_received',
    description: 'Payment Received - Thank you',
    amount: -120.00,
    time: '04:00 PM',
    date: 'Oct 01',
    isDelivered: false,
  },
];

export function getStoredData<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error('Error reading localStorage', e);
    return defaultValue;
  }
}

export function setStoredData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error writing localStorage', e);
  }
}
