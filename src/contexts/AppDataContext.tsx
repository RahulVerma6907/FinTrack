// src/contexts/AppDataContext.tsx
"use client";

import type { AppData, Expense, Income, Budget } from "@/types";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { sendNotificationEmail } from "@/ai/flows/send-notification-email-flow";

interface AppDataContextType {
  data: AppData;
  loading: boolean;
  addExpense: (expense: Omit<Expense, "id" | "userId">) => Promise<void>; // Changed to Promise
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
  notificationsSent: {},
};

export const AppDataProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<AppData>(initialData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const storedData = localStorage.getItem(`finTrackData_${user.id}`);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setData({
          ...parsedData,
          expenses: parsedData.expenses.map((e: Expense) => ({...e, date: new Date(e.date)})),
          incomes: parsedData.incomes.map((i: Income) => ({...i, date: new Date(i.date)})),
          notificationsSent: parsedData.notificationsSent || {},
        });
      } else {
        const mockExpenses: Expense[] = [
          { id: '1', userId: user.id, description: 'Groceries', amount: 75.50, date: new Date(2024, new Date().getMonth(), 1), category: 'Food & Drinks' },
          { id: '2', userId: user.id, description: 'Train ticket', amount: 22.00, date: new Date(2024, new Date().getMonth(), 3), category: 'Transportation' },
        ];
        const mockIncomes: Income[] = [
          { id: '1', userId: user.id, source: 'Salary', amount: 2500, date: new Date(2024, new Date().getMonth(), 1) },
        ];
        const mockBudgets: Budget[] = [
          { id: '1', userId: user.id, category: 'Food & Drinks', amount: 300, monthYear: format(new Date(), "yyyy-MM") },
          { id: '2', userId: user.id, category: 'Transportation', amount: 100, monthYear: format(new Date(), "yyyy-MM") },
        ];
        const initialMockData: AppData = { expenses: mockExpenses, incomes: mockIncomes, budgets: mockBudgets, notificationsSent: {} };
        setData(initialMockData);
        localStorage.setItem(`finTrackData_${user.id}`, JSON.stringify(initialMockData));
      }
    } else {
      setData(initialData);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user && !loading) {
      localStorage.setItem(`finTrackData_${user.id}`, JSON.stringify(data));
    }
  }, [data, user, loading]);

  const addExpense = async (expense: Omit<Expense, "id" | "userId">) => {
    if (!user) return;
    const newExpense: Expense = { ...expense, id: Date.now().toString(), userId: user.id, date: new Date(expense.date) };

    let updatedDataSnapshot: AppData | null = null;
    setData((prevData) => {
      const newData = {
        ...prevData,
        expenses: [...prevData.expenses, newExpense],
      };
      updatedDataSnapshot = newData;
      return newData;
    });

    if (user.notificationSettings?.email && updatedDataSnapshot && user.email) {
      const expenseMonthYear = format(newExpense.date, "yyyy-MM");
      
      let notificationsSentUpdates: Record<string, boolean> = {...(updatedDataSnapshot.notificationsSent || {})};
      let emailWasProcessed = false;

      const budgetsForExpenseMonth = updatedDataSnapshot.budgets.filter(
        (b) => b.monthYear === expenseMonthYear && b.userId === user.id
      );

      for (const budget of budgetsForExpenseMonth) {
        const expensesForBudgetCategory = updatedDataSnapshot.expenses.filter(
          (e) =>
            e.category === budget.category &&
            format(new Date(e.date), "yyyy-MM") === expenseMonthYear &&
            e.userId === user.id
        );
        const totalSpent = expensesForBudgetCategory.reduce((sum, e) => sum + e.amount, 0);
        const spendingPercentage = budget.amount > 0 ? (totalSpent / budget.amount) * 100 : 0;

        const approachingKey = `budget_${budget.id}_${expenseMonthYear}_approaching`;
        const exceededKey = `budget_${budget.id}_${expenseMonthYear}_exceeded`;

        let emailInfo: { subject: string; body: string; notificationKey: string } | null = null;

        if (spendingPercentage >= 80 && spendingPercentage <= 100 && !notificationsSentUpdates[approachingKey] && !data.notificationsSent?.[approachingKey]) {
          emailInfo = {
            subject: `Budget Alert: Approaching Limit for ${budget.category}`,
            body: `Hi ${user.name || 'User'},\n\nYou have spent ${totalSpent.toFixed(2)} (${spendingPercentage.toFixed(0)}%) of your ${budget.amount.toFixed(2)} budget for ${budget.category} for ${format(new Date(expenseMonthYear + "-01"), "MMMM yyyy")}.\n\nManage your budgets at FinTrack.`,
            notificationKey: approachingKey,
          };
        } else if (spendingPercentage > 100 && !notificationsSentUpdates[exceededKey] && !data.notificationsSent?.[exceededKey]) {
          emailInfo = {
            subject: `Budget Alert: Exceeded Limit for ${budget.category}`,
            body: `Hi ${user.name || 'User'},\n\nYou have exceeded your budget for ${budget.category} for ${format(new Date(expenseMonthYear + "-01"), "MMMM yyyy")}.\nSpent: ${totalSpent.toFixed(2)}\nBudget: ${budget.amount.toFixed(2)}\n\nManage your budgets at FinTrack.`,
            notificationKey: exceededKey,
          };
        }

        if (emailInfo) {
          emailWasProcessed = true; // Mark that we attempted to process an email
          try {
            const result = await sendNotificationEmail({
              recipientEmail: user.email,
              recipientName: user.name || 'User',
              subject: emailInfo.subject,
              body: emailInfo.body,
            });
            if (result.success) {
              notificationsSentUpdates[emailInfo.notificationKey] = true;
              toast({ title: "Notification Sent (Simulated)", description: `Email alert for ${budget.category} budget.`});
            }
          } catch (error) {
            console.error("Failed to send notification email for budget:", budget.category, error);
            toast({ title: "Notification Error", description: `Could not send alert for ${budget.category}.`, variant: "destructive" });
          }
        }
      }
      
      if (Object.keys(notificationsSentUpdates).length > Object.keys(data.notificationsSent || {}).length) {
         setData(prevData => ({
          ...prevData,
          notificationsSent: { ...prevData.notificationsSent, ...notificationsSentUpdates }
        }));
      }
    }
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
    const newIncome: Income = { ...income, id: Date.now().toString(), userId: user.id, date: new Date(income.date) };
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
    const validatedData = {
      ...importedData,
      expenses: importedData.expenses.map((e: any) => ({...e, date: new Date(e.date), userId: user.id })),
      incomes: importedData.incomes.map((i: any) => ({...i, date: new Date(i.date), userId: user.id })),
      budgets: importedData.budgets.map((b: any) => ({...b, userId: user.id })),
      notificationsSent: importedData.notificationsSent || {},
    };
    setData(validatedData);
  };

  const exportData = (): AppData => {
    return { ...data };
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
