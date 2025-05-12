"use client";

import React from 'react';
import type { Budget as BudgetType, Expense } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { EXPENSE_CATEGORIES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Edit2 } from 'lucide-react';

interface BudgetListItemProps {
  budget: BudgetType;
  expensesForMonth: Expense[];
  onEdit: (budget: BudgetType) => void;
}

export const BudgetListItem: React.FC<BudgetListItemProps> = ({ budget, expensesForMonth, onEdit }) => {
  const spentAmount = expensesForMonth
    .filter(expense => expense.category === budget.category)
    .reduce((sum, expense) => sum + expense.amount, 0);

  const progress = budget.amount > 0 ? (spentAmount / budget.amount) * 100 : 0;
  const remainingAmount = budget.amount - spentAmount;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  let progressColorClass = 'bg-primary'; // Default teal
  if (progress > 100) progressColorClass = 'bg-destructive'; // Red if over budget
  else if (progress > 75) progressColorClass = 'bg-yellow-500'; // Yellow if approaching limit

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{budget.category}</CardTitle>
            <CardDescription>Budget for {budget.monthYear}</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onEdit(budget)} aria-label={`Edit budget for ${budget.category}`}>
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Spent: {formatCurrency(spentAmount)}</span>
          <span>Target: {formatCurrency(budget.amount)}</span>
        </div>
        <Progress value={Math.min(progress, 100)} aria-label={`${budget.category} budget progress ${progress.toFixed(0)}%`} className="h-3 [&>div]:bg-[--progress-color]" style={{'--progress-color': `var(--${progress > 100 ? 'destructive' : progress > 75 ? 'chart-4' : 'primary'})`} as React.CSSProperties} />

      </CardContent>
      <CardFooter>
        <p className={`text-sm font-medium ${remainingAmount < 0 ? 'text-destructive' : 'text-accent'}`}>
          {remainingAmount >= 0 ? `${formatCurrency(remainingAmount)} remaining` : `${formatCurrency(Math.abs(remainingAmount))} over budget`}
        </p>
      </CardFooter>
    </Card>
  );
};
