export const code = `// Posts Controller — from WBS SE-6 live session
import type { RequestHandler } from 'express'

interface Post {
  id: number
  title: string
  content: string
}

let posts: Post[] = [
  { id: 1, title: 'First Post', content: 'Hello World' },
  { id: 2, title: 'Second Post', content: 'Express is great' },
]
let nextId = 3

export const getAllPosts: RequestHandler = (req, res) => {
  res.json(posts)
}

export const getPostById: RequestHandler = (req, res) => {
  const post = posts.find((p) => p.id === Number(req.params.id))
  if (!post) return res.status(404).json({ message: 'Post not found' })
  res.json(post)
}

export const createPost: RequestHandler = (req, res) => {
  const { title, content } = req.body as Pick<Post, 'title' | 'content'>
  const newPost = { id: nextId++, title, content }
  posts.push(newPost)
  res.status(201).json(newPost)
}

export const updatePost: RequestHandler = (req, res) => {
  const index = posts.findIndex((p) => p.id === Number(req.params.id))
  if (index === -1) return res.status(404).json({ message: 'Post not found' })
  posts[index] = { ...posts[index], ...req.body }
  res.json(posts[index])
}

export const deletePost: RequestHandler = (req, res) => {
  const index = posts.findIndex((p) => p.id === Number(req.params.id))
  if (index === -1) return res.status(404).json({ message: 'Post not found' })
  posts.splice(index, 1)
  res.status(204).send()
}
`
