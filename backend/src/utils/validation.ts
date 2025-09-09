import { z } from 'zod';

export const chargeRequestSchema = z.object({
  amount: z.number()
    .min(1, 'Amount must be at least 1 cent')
    .max(10000000, 'Amount cannot exceed $100,000'),
  currency: z.string()
    .length(3, 'Currency must be a 3-letter code')
    .regex(/^[A-Z]{3}$/, 'Currency must be uppercase letters'),
  source: z.string()
    .min(1, 'Source is required')
    .max(100, 'Source cannot exceed 100 characters'),
  email: z.string()
    .email('Invalid email format')
    .max(254, 'Email cannot exceed 254 characters'),
});

export const transactionQuerySchema = z.object({
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 50),
  offset: z.string().optional().transform(val => val ? parseInt(val, 10) : 0),
  status: z.enum(['success', 'failed', 'blocked']).optional(),
  provider: z.enum(['stripe', 'paypal']).optional(),
});

export type ChargeRequestInput = z.infer<typeof chargeRequestSchema>;
export type TransactionQueryInput = z.infer<typeof transactionQuerySchema>;
