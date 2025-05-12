// src/ai/flows/suggest-expense-category.ts
'use server';

/**
 * @fileOverview AI flow to suggest an expense category based on a description.
 *
 * - suggestExpenseCategory - A function that suggests the most likely expense category.
 * - SuggestExpenseCategoryInput - The input type for the suggestExpenseCategory function.
 * - SuggestExpenseCategoryOutput - The return type for the suggestExpenseCategory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestExpenseCategoryInputSchema = z.object({
  description: z.string().describe('The description of the expense.'),
});
export type SuggestExpenseCategoryInput = z.infer<
  typeof SuggestExpenseCategoryInputSchema
>;

const SuggestExpenseCategoryOutputSchema = z.object({
  category: z
    .string()
    .describe('The suggested expense category for the description.'),
  confidence: z
    .number()
    .describe(
      'A number between 0 and 1 indicating the confidence level of the category suggestion.'
    ),
});
export type SuggestExpenseCategoryOutput = z.infer<
  typeof SuggestExpenseCategoryOutputSchema
>;

export async function suggestExpenseCategory(
  input: SuggestExpenseCategoryInput
): Promise<SuggestExpenseCategoryOutput> {
  return suggestExpenseCategoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestExpenseCategoryPrompt',
  input: {schema: SuggestExpenseCategoryInputSchema},
  output: {schema: SuggestExpenseCategoryOutputSchema},
  prompt: `You are an AI assistant helping users categorize their expenses.

  Given the following expense description, suggest the most appropriate expense category.
  Also, provide a confidence level (0 to 1) for your suggestion.

  Description: {{{description}}}
  `,
});

const suggestExpenseCategoryFlow = ai.defineFlow(
  {
    name: 'suggestExpenseCategoryFlow',
    inputSchema: SuggestExpenseCategoryInputSchema,
    outputSchema: SuggestExpenseCategoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
