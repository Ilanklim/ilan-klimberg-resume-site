import { z } from 'zod';

// Validation schema for AI query input
export const querySchema = z.object({
  question: z.string()
    .min(1, 'Question cannot be empty')
    .max(500, 'Question too long (max 500 characters)')
    .trim()
    .refine(val => val.length > 0, 'Question cannot be empty after trimming')
});

// Validation schema for setup input
export const setupSchema = z.object({
  content: z.string().min(1, 'Content cannot be empty')
});

// Response types
export type QueryInput = z.infer<typeof querySchema>;
export type SetupInput = z.infer<typeof setupSchema>;