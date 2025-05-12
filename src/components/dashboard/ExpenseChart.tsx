
"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { useAppData } from "@/contexts/AppDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { EXPENSE_CATEGORIES } from "@/lib/constants";

const initialChartData = EXPENSE_CATEGORIES.map(category => ({ category, total: 0 }));

const chartConfig = EXPENSE_CATEGORIES.reduce((acc, category, index) => {
  acc[category] = {
    label: category,
    color: `hsl(var(--chart-${(index % 5) + 1}))`,
  };
  return acc;
}, {} as ChartConfig);


export function ExpenseChart() {
  const { data } = useAppData();
  const { user } = useAuth();

  const aggregatedExpenses = React.useMemo(() => {
    const expenseMap = new Map<string, number>();
    EXPENSE_CATEGORIES.forEach(cat => expenseMap.set(cat, 0));

    data.expenses.forEach(expense => {
      expenseMap.set(expense.category, (expenseMap.get(expense.category) || 0) + expense.amount);
    });
    
    return Array.from(expenseMap.entries()).map(([category, total]) => ({ category, total }));
  }, [data.expenses]);
  
  const chartData = aggregatedExpenses.length > 0 ? aggregatedExpenses : initialChartData;


  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: user?.currencyPreference || 'USD' 
    }).format(value);
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Expense Breakdown</CardTitle>
        <CardDescription>Your spending by category for the current period.</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.every(d => d.total === 0) ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No expense data to display.
          </div>
        ) : (
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} layout="vertical" margin={{ right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickFormatter={formatCurrency} />
              <YAxis dataKey="category" type="category" width={120} tick={{ fontSize: 12 }} />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                content={<ChartTooltipContent formatter={formatCurrency} />}
              />
              <Legend />
              <Bar dataKey="total" name="Total Spent" fill="var(--color-primary)" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

