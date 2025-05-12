export const EXPENSE_CATEGORIES = [
  "Food & Drinks",
  "Shopping",
  "Housing",
  "Transportation",
  "Vehicle",
  "Life & Entertainment",
  "Communication, PC",
  "Financial Expenses",
  "Investments",
  "Other",
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

export const INCOME_CATEGORIES = [
  "Salary",
  "Business",
  "Gifts",
  "Savings",
  "Rental Income",
  "Other",
] as const;

export type IncomeCategory = typeof INCOME_CATEGORIES[number];
