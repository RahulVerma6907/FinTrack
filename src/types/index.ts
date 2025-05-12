import type { ExpenseCategory, IncomeCategory } from '@/lib/constants';

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  profilePictureUrl?: string | null; // Added for profile picture
  // Add other profile fields as needed
  currencyPreference?: string;
  notificationSettings?: {
    email?: boolean;
    sms?: boolean; // Retain for potential future use, though not implemented
  };
}

export interface Expense {
  id: string;
  userId: string;
  description: string;
  amount: number;
  date: Date;
  category: ExpenseCategory;
}

export interface Income {
  id:string;
  userId: string;
  source: IncomeCategory;
  amount: number;
  date: Date;
}

export interface Budget {
  id: string;
  userId: string;
  category: ExpenseCategory;
  amount: number;
  monthYear: string; // Format: YYYY-MM
}

export interface AppData {
  expenses: Expense[];
  incomes: Income[];
  budgets: Budget[];
  notificationsSent?: Record<string, boolean>; // e.g., { "budget_1_2024-08_approaching": true }
}

