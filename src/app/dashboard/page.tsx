
"use client";

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { DollarSign, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { ExpenseChart } from '@/components/dashboard/ExpenseChart';
import { useAppData } from '@/contexts/AppDataContext';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { data, loading: appDataLoading } = useAppData();
  const { user, loading: authLoading } = useAuth();

  const totalIncome = React.useMemo(() => data.incomes.reduce((sum, item) => sum + item.amount, 0), [data.incomes]);
  const totalExpenses = React.useMemo(() => data.expenses.reduce((sum, item) => sum + item.amount, 0), [data.expenses]);
  const netBalance = totalIncome - totalExpenses;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: user?.currencyPreference || 'USD' 
    }).format(amount);
  };

  const loading = appDataLoading || authLoading;

  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            title="Total Income"
            value={formatCurrency(totalIncome)}
            icon={<TrendingUp className="h-5 w-5" />}
            valueClassName="text-accent"
          />
          <SummaryCard
            title="Total Expenses"
            value={formatCurrency(totalExpenses)}
            icon={<TrendingDown className="h-5 w-5" />}
            valueClassName="text-destructive"
          />
          <SummaryCard
            title="Net Balance"
            value={formatCurrency(netBalance)}
            icon={<DollarSign className="h-5 w-5" />}
            valueClassName={netBalance >= 0 ? 'text-accent' : 'text-destructive'}
          />
          <SummaryCard
            title="Active Budgets"
            value={data.budgets.length.toString()} // Example: count active budgets
            icon={<PiggyBank className="h-5 w-5" />}
          />
        </div>

        <Separator />

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          <ExpenseChart />
          <RecentTransactions />
        </div>

        {/* Placeholder for Budget Goals Overview */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Budget Goals</CardTitle>
            <CardDescription>Overview of your current budget progress.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Budget overview coming soon.</p>
          </CardContent>
        </Card> */}

      </div>
    </AppLayout>
  );
}

