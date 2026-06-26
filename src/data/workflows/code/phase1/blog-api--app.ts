export const code = `// Blog REST API — from WBS SE-6 live session
import express from 'express'
import mongoose from 'mongoose'
import { usersRouter } from './routers/usersRouter'
import { postsRouter } from './routers/postsRouter'

const app = express()
const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://localhost:27017/blog'

app.use(express.json())
app.use('/users', usersRouter)
app.use('/posts', postsRouter)

async function main() {
  await mongoose.connect(MONGO_URI)
  console.log('Connected to MongoDB')
  app.listen(3000, () => console.log('Blog API running at http://localhost:3000'))
}

main().catch(console.error)
`
