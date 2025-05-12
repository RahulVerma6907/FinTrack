
"use client";

import React from 'react';
import { useAppData } from '@/contexts/AppDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import type { Expense, Income } from '@/types';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

export const RecentTransactions = () => {
  const { data } = useAppData();
  const { user } = useAuth();

  const combinedTransactions = [
    ...data.expenses.map(e => ({ ...e, type: 'expense' as const })),
    ...data.incomes.map(i => ({ ...i, type: 'income' as const })),
  ];

  const sortedTransactions = combinedTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: user?.currencyPreference || 'USD' 
    }).format(amount);
  };

  return (
    <Card className="shadow-lg col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Your latest 10 expenses and incomes.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Type</TableHead>
                <TableHead>Description/Source</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTransactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No transactions yet.
                  </TableCell>
                </TableRow>
              )}
              {sortedTransactions.map((transaction) => (
                <TableRow key={`${transaction.type}-${transaction.id}`}>
                  <TableCell>
                    {transaction.type === 'expense' ? (
                      <ArrowDownCircle className="h-5 w-5 text-destructive" />
                    ) : (
                      <ArrowUpCircle className="h-5 w-5 text-accent" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {transaction.type === 'expense' ? (transaction as Expense).description : (transaction as Income).source}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {transaction.type === 'expense' ? (transaction as Expense).category : (transaction as Income).source}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(transaction.date), 'MMM dd, yyyy')}</TableCell>
                  <TableCell className={`text-right font-semibold ${transaction.type === 'expense' ? 'text-destructive' : 'text-accent'}`}>
                    {transaction.type === 'expense' ? '-' : '+'}
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

