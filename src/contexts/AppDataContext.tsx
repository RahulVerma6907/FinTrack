// src/contexts/AppDataContext.tsx
"use client";

import type { AppData, Expense, Income, Budget } from "@/types";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth } from "./AuthContext";

interface AppDataContextType {
  data: AppData;
  loading: boolean;
  addExpense: (expense: Omit<Expense, "id" | "userId">) => void;
  deleteExpense: (expenseId: string) => void;
  addIncome: (income: Omit<Income, "id" | "userId">) => void;
  addBudget: (budget: Omit<Budget, "id" | "userId">) => void;
  updateBudget: (budget: Budget) => void;
  getBudgetsByMonth: (monthYear: string) => Budget[];
  importData: (importedData: AppData) => void;
  exportData: () => AppData;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

const initialData: AppData = {
  expenses: [],
  incomes: [],
  budgets: [],
};

export const AppDataProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [data, setData] = useState<AppData>(initialData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const storedData = localStorage.getItem(`finTrackData_${user.id}`);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        // Ensure dates are parsed correctly
        setData({
          ...parsedData,
          expenses: parsedData.expenses.map((e: Expense) => ({...e, date: new Date(e.date)})),
          incomes: parsedData.incomes.map((i: Income) => ({...i, date: new Date(i.date)})),
        });
      } else {
        // Initialize with some mock data for new users for demo purposes
        const mockExpenses: Expense[] = [
          { id: '1', userId: user.id, description: 'Groceries', amount: 75.50, date: new Date(2024, 6, 1), category: 'Food & Drinks' },
          { id: '2', userId: user.id, description: 'Train ticket', amount: 22.00, date: new Date(2024, 6, 3), category: 'Transportation' },
          { id: '3', userId: user.id, description: 'Netflix Subscription', amount: 15.00, date: new Date(2024, 6, 5), category: 'Life & Entertainment' },
        ];
        const mockIncomes: Income[] = [
          { id: '1', userId: user.id, source: 'Salary', amount: 2500, date: new Date(2024, 6, 1) },
        ];
        const mockBudgets: Budget[] = [
          { id: '1', userId: user.id, category: 'Food & Drinks', amount: 300, monthYear: '2024-07' },
          { id: '2', userId: user.id, category: 'Transportation', amount: 100, monthYear: '2024-07' },
        ];
        const initialMockData = { expenses: mockExpenses, incomes: mockIncomes, budgets: mockBudgets };
        setData(initialMockData);
        localStorage.setItem(`finTrackData_${user.id}`, JSON.stringify(initialMockData));
      }
    } else {
      setData(initialData); // Clear data if no user
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user && !loading) { // Save data when it changes, user is logged in, and initial load is complete
      localStorage.setItem(`finTrackData_${user.id}`, JSON.stringify(data));
    }
  }, [data, user, loading]);

  const addExpense = (expense: Omit<Expense, "id" | "userId">) => {
    if (!user) return;
    const newExpense: Expense = { ...expense, id: Date.now().toString(), userId: user.id };
    setData((prevData) => ({
      ...prevData,
      expenses: [...prevData.expenses, newExpense],
    }));
  };

  const deleteExpense = (expenseId: string) => {
    if (!user) return;
    setData((prevData) => ({
      ...prevData,
      expenses: prevData.expenses.filter(expense => expense.id !== expenseId),
    }));
  };

  const addIncome = (income: Omit<Income, "id" | "userId">) => {
    if (!user) return;
    const newIncome: Income = { ...income, id: Date.now().toString(), userId: user.id };
    setData((prevData) => ({
      ...prevData,
      incomes: [...prevData.incomes, newIncome],
    }));
  };

  const addBudget = (budget: Omit<Budget, "id" | "userId">) => {
    if (!user) return;
    const newBudget: Budget = { ...budget, id: Date.now().toString(), userId: user.id };
    setData((prevData) => ({
      ...prevData,
      budgets: [...prevData.budgets, newBudget],
    }));
  };
  
  const updateBudget = (updatedBudget: Budget) => {
    if (!user) return;
    setData((prevData) => ({
      ...prevData,
      budgets: prevData.budgets.map(b => b.id === updatedBudget.id ? updatedBudget : b),
    }));
  };

  const getBudgetsByMonth = (monthYear: string) => {
    return data.budgets.filter(b => b.monthYear === monthYear && b.userId === user?.id);
  };
  
  const importData = (importedData: AppData) => {
    if (!user) return;
    // Basic validation or transformation could happen here
    const validatedData = {
      ...importedData,
      expenses: importedData.expenses.map((e: any) => ({...e, date: new Date(e.date), userId: user.id })),
      incomes: importedData.incomes.map((i: any) => ({...i, date: new Date(i.date), userId: user.id })),
      budgets: importedData.budgets.map((b: any) => ({...b, userId: user.id })),
    };
    setData(validatedData);
  };

  const exportData = (): AppData => {
    return data;
  };


  return (
    <AppDataContext.Provider value={{ data, loading, addExpense, deleteExpense, addIncome, addBudget, updateBudget, getBudgetsByMonth, importData, exportData }}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error("useAppData must be used within an AppDataProvider");
  }
  return context;
};
