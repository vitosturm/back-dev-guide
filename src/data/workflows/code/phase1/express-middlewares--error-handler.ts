export const code = `// errorHandler middleware — from WBS SE-6 live session
import type { ErrorRequestHandler } from 'express'

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const status = (err as { status?: number }).status ?? 500
  const message = err instanceof Error ? err.message : 'Internal Server Error'
  console.error(\`[ERROR] \${req.method} \${req.url} → \${message}\`)
  res.status(status).json({ error: message })
}
`
