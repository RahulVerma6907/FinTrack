"use client";

import React, { useState, useMemo } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { BudgetForm } from '@/components/forms/BudgetForm';
import { useAppData } from '@/contexts/AppDataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { PlusCircle, Calendar as CalendarIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BudgetListItem } from '@/components/budgets/BudgetListItem';
import type { Budget as BudgetType } from '@/types';
import { format, addMonths, subMonths } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function BudgetsPage() {
  const { data, loading } = useAppData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetType | undefined>(undefined);
  
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  const selectedMonthYear = useMemo(() => format(selectedMonth, "yyyy-MM"), [selectedMonth]);

  const budgetsForSelectedMonth = useMemo(() => 
    data.budgets.filter(b => b.monthYear === selectedMonthYear),
    [data.budgets, selectedMonthYear]
  );

  const expensesForSelectedMonth = useMemo(() =>
    data.expenses.filter(e => format(new Date(e.date), "yyyy-MM") === selectedMonthYear),
    [data.expenses, selectedMonthYear]
  );

  const handleEditBudget = (budget: BudgetType) => {
    setEditingBudget(budget);
    setIsFormOpen(true);
  };

  const handleOpenNewBudgetForm = () => {
    setEditingBudget(undefined); // Clear any editing state
    setIsFormOpen(true);
  };
  
  const handleFormSubmit = () => {
    setIsFormOpen(false);
    setEditingBudget(undefined);
  };

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i); // Show past 5 months, current, and next 6 months
    return {
      value: format(date, "yyyy-MM"),
      label: format(date, "MMMM yyyy"),
    };
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
          <div className="flex items-center gap-2">
            <Select
              value={selectedMonthYear}
              onValueChange={(value) => {
                const [year, month] = value.split('-').map(Number);
                setSelectedMonth(new Date(year, month - 1));
              }}
            >
              <SelectTrigger className="w-[180px]">
                <CalendarIcon className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) setEditingBudget(undefined); }}>
              <DialogTrigger asChild>
                <Button onClick={handleOpenNewBudgetForm}>
                  <PlusCircle className="mr-2 h-4 w-4" /> {editingBudget ? 'Edit Budget' : 'Set Budget'}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                  <DialogTitle>{editingBudget ? 'Edit Budget Goal' : 'Set New Budget Goal'}</DialogTitle>
                  <DialogDescription>
                    {editingBudget ? 'Update your budget goal.' : 'Define a new budget goal for an expense category.'}
                  </DialogDescription>
                </DialogHeader>
                <BudgetForm 
                  onFormSubmit={handleFormSubmit} 
                  editingBudget={editingBudget ? { ...editingBudget, amount: Number(editingBudget.amount) } : undefined} 
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Budget Goals for {format(selectedMonth, "MMMM yyyy")}</CardTitle>
            <CardDescription>Track your spending against your set budgets.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">Loading budgets...</div>
            ) : budgetsForSelectedMonth.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                <p>No budgets set for {format(selectedMonth, "MMMM yyyy")}.</p>
                <Button variant="link" onClick={handleOpenNewBudgetForm} className="mt-2">Set a new budget</Button>
              </div>
            ) : (
              <ScrollArea className="h-[400px] md:h-[500px] pr-3">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {budgetsForSelectedMonth.map((budget) => (
                    <BudgetListItem 
                      key={budget.id} 
                      budget={budget} 
                      expensesForMonth={expensesForSelectedMonth}
                      onEdit={handleEditBudget}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
