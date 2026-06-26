export const code = `// Post model — from WBS SE-6 live session
import { Schema, model, Types } from 'mongoose'

const postSchema = new Schema(
  {
    title:   { type: String, required: true },
    content: { type: String, required: true },
    author:  { type: Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
)

export const Post = model('Post', postSchema)
`
