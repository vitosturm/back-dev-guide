export const code = `// MongoDB connection — from WBS SE-6 live session
import mongoose from 'mongoose'

const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://localhost:27017/blog'

export async function connectDB(): Promise<void> {
  await mongoose.connect(MONGO_URI)
  console.log('Connected to MongoDB')
}
`
