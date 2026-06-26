export const code = `// Zod DTO usage — from WBS SE-6 live session
import express from 'express'
import { validateBodyZod } from './middlewares/validateBodyZod'
import { postSchema, type PostDTO } from './schemas/postSchema'

const app = express()
app.use(express.json())

// POST /posts — body is validated before the handler runs
app.post('/posts', validateBodyZod(postSchema), (req, res) => {
  const body = req.body as PostDTO
  console.log('Valid post:', body.title)
  res.status(201).json({ message: 'Post created', data: body })
})

app.listen(3000, () => console.log('Server running at http://localhost:3000'))
`
