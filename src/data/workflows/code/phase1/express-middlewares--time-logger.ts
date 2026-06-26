export const code = `// timeLogger middleware — from WBS SE-6 live session
import type { RequestHandler } from 'express'

export const timeLogger: RequestHandler = (req, res, next) => {
  const start = Date.now()
  console.log(\`[\${new Date().toISOString()}] \${req.method} \${req.url}\`)
  next()
  console.log(\`→ completed in \${Date.now() - start}ms\`)
}
`
