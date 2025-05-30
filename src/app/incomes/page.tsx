
"use client";

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { IncomeForm } from '@/components/forms/IncomeForm';
import { useAppData } from '@/contexts/AppDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function IncomesPage() {
  const { data, loading: appDataLoading } = useAppData();
  const { user, loading: authLoading } = useAuth();
  const [isFormOpen, setIsFormOpen] = React.useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: user?.currencyPreference || 'USD' 
    }).format(amount);
  };

  const sortedIncomes = React.useMemo(() => 
    [...data.incomes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [data.incomes]
  );
  
  const loading = appDataLoading || authLoading;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Incomes</h1>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Income
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                <DialogTitle>Add New Income</DialogTitle>
                <DialogDescription>
                  Record your new income source and amount.
                </DialogDescription>
              </DialogHeader>
              <IncomeForm onFormSubmit={() => setIsFormOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Income List</CardTitle>
            <CardDescription>All your recorded incomes.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
               <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                Loading incomes...
              </div>
            ) : sortedIncomes.length === 0 ? (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                No incomes recorded yet.
              </div>
            ) : (
              <ScrollArea className="h-[400px] md:h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedIncomes.map((income) => (
                      <TableRow key={income.id}>
                        <TableCell className="font-medium">
                          <Badge variant="secondary">{income.source}</Badge>
                        </TableCell>
                        <TableCell>{format(new Date(income.date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell className="text-right text-accent font-semibold">
                          +{formatCurrency(income.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

