"use client";

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CalendarIcon, Lightbulb, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAppData } from '@/contexts/AppDataContext';
import { EXPENSE_CATEGORIES, ExpenseCategory } from '@/lib/constants';
import { suggestExpenseCategory } from '@/ai/flows/suggest-expense-category';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const expenseFormSchema = z.object({
  description: z.string().min(1, { message: 'Description is required' }).max(100, { message: 'Description must be 100 characters or less' }),
  amount: z.coerce.number().positive({ message: 'Amount must be positive' }),
  date: z.date({ required_error: 'Date is required' }),
  category: z.enum(EXPENSE_CATEGORIES, { required_error: 'Category is required' }),
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

interface ExpenseFormProps {
  onFormSubmit?: () => void; // Optional: callback after successful submission
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ onFormSubmit }) => {
  const { addExpense } = useAppData();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestedCategory, setSuggestedCategory] = useState<ExpenseCategory | null>(null);

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      description: '',
      amount: 0,
      date: new Date(),
      category: undefined,
    },
  });

  const handleDescriptionChange = async (description: string) => {
    if (description.length > 3) { // Only suggest if description is reasonably long
      setIsSuggesting(true);
      setSuggestedCategory(null);
      try {
        const suggestion = await suggestExpenseCategory({ description });
        if (EXPENSE_CATEGORIES.includes(suggestion.category as ExpenseCategory)) {
          setSuggestedCategory(suggestion.category as ExpenseCategory);
        }
      } catch (error) {
        console.error("Error suggesting category:", error);
        // Optionally show a toast error
      } finally {
        setIsSuggesting(false);
      }
    } else {
      setSuggestedCategory(null);
    }
  };

  const applySuggestion = () => {
    if (suggestedCategory) {
      form.setValue('category', suggestedCategory);
      setSuggestedCategory(null); // Clear suggestion after applying
    }
  };

  const onSubmit: SubmitHandler<ExpenseFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      addExpense(data);
      toast({
        title: "Expense Added",
        description: `${data.description} for $${data.amount} has been successfully recorded.`,
      });
      form.reset();
      setSuggestedCategory(null);
      if (onFormSubmit) {
        onFormSubmit();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle>Add New Expense</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Coffee with client, Groceries for the week"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleDescriptionChange(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isSuggesting && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Getting AI category suggestion...
              </div>
            )}

            {suggestedCategory && !isSuggesting && (
              <div className="flex items-center justify-between p-2 bg-accent/20 rounded-md">
                <div className="text-sm flex items-center">
                  <Lightbulb className="mr-2 h-4 w-4 text-yellow-500" />
                  AI Suggests: <span className="font-semibold ml-1">{suggestedCategory}</span>
                </div>
                <Button type="button" size="sm" variant="outline" onClick={applySuggestion}>
                  Use Suggestion
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" {...field} step="0.01" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col pt-2">
                    <FormLabel className="mb-[0.6rem]">Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="pt-2">
                    <FormLabel className="mb-1">Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EXPENSE_CATEGORIES.map((category) => (
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
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Expense...
                </>
              ) : (
                'Add Expense'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
