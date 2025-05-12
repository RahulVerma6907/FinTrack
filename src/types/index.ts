import type { ExpenseCategory, IncomeCategory } from '@/lib/constants';

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  // Add other profile fields as needed
  currencyPreference?: string;
  notificationSettings?: {
    email?: boolean;
    sms?: boolean;
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
  id: string;
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
}
