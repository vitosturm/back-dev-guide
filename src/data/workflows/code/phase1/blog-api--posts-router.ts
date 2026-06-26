export const code = `// Posts router — from WBS SE-6 live session
import { Router } from 'express'
import { Post } from '../models/Post'

export const postsRouter = Router()

postsRouter.post('/', async (req, res) => {
  const post = await Post.create(req.body)
  res.status(201).json(post)
})

postsRouter.get('/', async (req, res) => {
  const posts = await Post.find().populate('author', 'name email')
  res.json(posts)
})

postsRouter.get('/:id', async (req, res) => {
  const post = await Post.findById(req.params.id).populate('author', 'name email')
  if (!post) return res.status(404).json({ message: 'Post not found' })
  res.json(post)
})

postsRouter.delete('/:id', async (req, res) => {
  await Post.findByIdAndDelete(req.params.id)
  res.status(204).send()
})
`
