export const code = `import z from 'zod';

export const blogPostInputSchema = z
  .object({
    title:   z.string().min(3, { message: 'title must be at least 3 characters' }),
    content: z.string().min(5, { message: 'content must be at least 5 characters' }),
    author:  z.string().min(2, { message: 'author is required' }),

    // image fields are optional — client may or may not upload a file
    image_url:        z.url().optional(),
    image_public_id:  z.string().optional(),
  })
  .strict(); // reject any extra fields not listed above

// z.url() is a Zod v4 shorthand — equivalent to z.string().url()
// .strict() prevents accidental extra fields from reaching the controller
`
