"use client";

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { useAppData } from '@/contexts/AppDataContext';
import { EXPENSE_CATEGORIES, ExpenseCategory } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, getYear, getMonth } from 'date-fns';


const budgetFormSchema = z.object({
  category: z.enum(EXPENSE_CATEGORIES, { required_error: 'Category is required' }),
  amount: z.coerce.number().positive({ message: 'Amount must be positive' }),
  monthYear: z.string().regex(/^\d{4}-\d{2}$/, { message: "Month must be in YYYY-MM format" }),
});

type BudgetFormValues = z.infer<typeof budgetFormSchema>;

interface BudgetFormProps {
  onFormSubmit?: () => void;
  editingBudget?: BudgetFormValues & { id?: string }; // For editing existing budgets
}

export const BudgetForm: React.FC<BudgetFormProps> = ({ onFormSubmit, editingBudget }) => {
  const { addBudget, updateBudget: updateAppContextBudget, data } = useAppData();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentMonthYear = format(new Date(), "yyyy-MM");

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: editingBudget || {
      category: undefined,
      amount: 0,
      monthYear: currentMonthYear,
    },
  });
  
  React.useEffect(() => {
    if (editingBudget) {
      form.reset(editingBudget);
    }
  }, [editingBudget, form]);

  const onSubmit: SubmitHandler<BudgetFormValues> = async (formData) => {
    setIsSubmitting(true);
    try {
      const existingBudgetForCategoryAndMonth = data.budgets.find(
        b => b.category === formData.category && b.monthYear === formData.monthYear && b.id !== editingBudget?.id
      );

      if (existingBudgetForCategoryAndMonth && !editingBudget) {
         toast({
          title: "Budget Exists",
          description: `A budget for ${formData.category} in ${formData.monthYear} already exists. Please edit the existing one.`,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      if (editingBudget && editingBudget.id) {
        updateAppContextBudget({ ...formData, id: editingBudget.id, userId: '' }); // userId is managed by context
         toast({
          title: "Budget Updated",
          description: `Budget for ${formData.category} updated successfully.`,
        });
      } else {
        addBudget(formData);
        toast({
          title: "Budget Set",
          description: `Budget for ${formData.category} of $${formData.amount} set for ${formData.monthYear}.`,
        });
      }
      form.reset({ monthYear: currentMonthYear, amount: 0, category: undefined });
      if (onFormSubmit) {
        onFormSubmit();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to set budget. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Generate month options for select, e.g., current month, next 11 months
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(getMonth(new Date()) + i);
    return {
      value: format(date, "yyyy-MM"),
      label: format(date, "MMMM yyyy"),
    };
  });


  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle>{editingBudget ? 'Edit Budget Goal' : 'Set New Budget Goal'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!editingBudget}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an expense category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.filter(cat => cat !== "Income" && cat !== "Investments").map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Amount</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" {...field} step="0.01" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="monthYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Month</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!editingBudget}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {monthOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingBudget ? 'Updating Budget...' : 'Setting Budget...'}
                </>
              ) : (editingBudget ? 'Update Budget' : 'Set Budget')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
