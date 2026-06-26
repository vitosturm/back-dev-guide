export const code = `// Posts Router — from WBS SE-6 live session
import { Router } from 'express'
import {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} from '../controllers/postsController'

export const postsRouter = Router()

postsRouter.get('/', getAllPosts)
postsRouter.get('/:id', getPostById)
postsRouter.post('/', createPost)
postsRouter.put('/:id', updatePost)
postsRouter.delete('/:id', deletePost)
`
