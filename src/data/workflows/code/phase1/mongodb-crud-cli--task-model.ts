export const code = `// Task model — from WBS SE-6 live session
import { Schema, model } from 'mongoose'

const taskSchema = new Schema(
  {
    title: { type: String, required: true },
    done:  { type: Boolean, default: false },
  },
  { timestamps: true },
)

export const Task = model('Task', taskSchema)
`
