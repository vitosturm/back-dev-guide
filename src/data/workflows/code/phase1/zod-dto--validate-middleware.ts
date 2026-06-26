export const code = `// validateBodyZod middleware — from WBS SE-6 live session
import type { RequestHandler } from 'express'
import type { ZodTypeAny } from 'zod/v4'
import { z } from 'zod/v4'

export function validateBodyZod(schema: ZodTypeAny): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      res.status(400).json({ errors: z.prettifyError(result.error) })
      return
    }
    req.body = result.data
    next()
  }
}
`
