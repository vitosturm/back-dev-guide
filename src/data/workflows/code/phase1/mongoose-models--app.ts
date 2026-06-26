export const code = `// Mongoose CRUD + populate demo — from WBS SE-6 live session
import { connectDB } from './db/connect'
import { User } from './models/User'
import { Post } from './models/Post'

async function main() {
  await connectDB()

  // Create a user
  const alice = await User.create({ name: 'Alice', email: 'alice@example.com' })
  console.log('Created user:', alice.name)

  // Create posts referencing that user
  await Post.create({ title: 'Hello Mongoose', content: 'Models are great', author: alice._id })
  await Post.create({ title: 'Second Post',   content: 'populate() rocks',  author: alice._id })

  // Query posts and populate the author field
  const posts = await Post.find().populate('author').select('-__v')
  for (const post of posts) {
    const author = post.author as { name: string }
    console.log(\`"\${post.title}" by \${author.name}\`)
  }
}

main().catch(console.error)
`
