'use server';
/**
 * @fileOverview Simulates sending a notification email.
 *
 * - sendNotificationEmail - A function that logs email details to the console.
 * - SendNotificationEmailInput - The input type for the sendNotificationEmail function.
 * - SendNotificationEmailOutput - The return type for the sendNotificationEmail function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SendNotificationEmailInputSchema = z.object({
  recipientEmail: z.string().email().describe('The email address of the recipient.'),
  recipientName: z.string().describe('The name of the recipient.'),
  subject: z.string().describe('The subject of the email.'),
  body: z.string().describe('The body content of the email.'),
});
export type SendNotificationEmailInput = z.infer<typeof SendNotificationEmailInputSchema>;

const SendNotificationEmailOutputSchema = z.object({
  success: z.boolean().describe('Whether the email was "sent" successfully.'),
  message: z.string().describe('A message indicating the result.'),
});
export type SendNotificationEmailOutput = z.infer<typeof SendNotificationEmailOutputSchema>;

export async function sendNotificationEmail(input: SendNotificationEmailInput): Promise<SendNotificationEmailOutput> {
  return sendNotificationEmailFlow(input);
}

const sendNotificationEmailFlow = ai.defineFlow(
  {
    name: 'sendNotificationEmailFlow',
    inputSchema: SendNotificationEmailInputSchema,
    outputSchema: SendNotificationEmailOutputSchema,
  },
  async (input) => {
    console.log('--- SIMULATING EMAIL SEND ---');
    console.log(`To: ${input.recipientName} <${input.recipientEmail}>`);
    console.log(`Subject: ${input.subject}`);
    console.log('Body:');
    console.log(input.body);
    console.log('-----------------------------');

    // In a real application, you would integrate with an email service here.
    // For example, using Nodemailer or an Email API (SendGrid, Mailgun, etc.)

    return {
      success: true,
      message: 'Email simulated successfully and logged to console.',
    };
  }
);
