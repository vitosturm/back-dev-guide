export const code = `import { z } from 'zod/v4';

export const userInputSchema = z
  .object({
    firstName: z
      .string({ error: 'firstName must be a string' }) // per-type error (Zod v4)
      .min(2, { message: 'firstName must be at least 2 characters' }),

    lastName: z
      .string({ error: 'lastName must be a string' })
      .min(2, { message: 'lastName must be at least 2 characters' }),

    email: z.email({ message: 'email must be a valid email address' }),
    //        ↑ Zod v4 shorthand — same as z.string().email()
  })
  .strict();

export type UserInputDTO = z.infer<typeof userInputSchema>;
`
