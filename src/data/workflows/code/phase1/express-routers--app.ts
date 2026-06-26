export const code = `// Express Routers & Controllers — from WBS SE-6 live session
import express from 'express'
import { postsRouter } from './routers/postsRouter'

const app = express()
const port = 3000

app.use(express.json())
app.use('/posts', postsRouter)

app.listen(port, () => console.log(\`Server running at http://localhost:\${port}\`))
`
