export const code = `// Express Middlewares — from WBS SE-6 live session
import express from 'express'
import { timeLogger } from './middlewares/timeLogger'
import { errorHandler } from './middlewares/errorHandler'

const app = express()
const port = 3000

app.use(express.json())
app.use(timeLogger)

app.get('/posts', (req, res) => {
  res.json([{ id: 1, title: 'First Post' }])
})

app.get('/error', (req, res, next) => {
  next(new Error('Something went wrong!'))
})

// Error handler must be registered last
app.use(errorHandler)

app.listen(port, () => console.log(\`Server running at http://localhost:\${port}\`))
`
