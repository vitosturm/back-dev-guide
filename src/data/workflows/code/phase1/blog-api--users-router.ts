export const code = `// Users router — from WBS SE-6 live session
import { Router } from 'express'
import { User } from '../models/User'

export const usersRouter = Router()

usersRouter.post('/', async (req, res) => {
  const user = await User.create(req.body)
  res.status(201).json(user)
})

usersRouter.get('/', async (req, res) => {
  const users = await User.find()
  res.json(users)
})

usersRouter.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) return res.status(404).json({ message: 'User not found' })
  res.json(user)
})

usersRouter.put('/:id', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true })
  if (!user) return res.status(404).json({ message: 'User not found' })
  res.json(user)
})

usersRouter.delete('/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id)
  res.status(204).send()
})
`
