export const code = `// Post DTO schema — from WBS SE-6 live session
import { z } from 'zod/v4'

export const postSchema = z.object({
  title:   z.string().min(3, 'Title must be at least 3 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  author:  z.string().length(24, 'author must be a valid MongoDB ObjectId'),
})

export type PostDTO = z.infer<typeof postSchema>
`
