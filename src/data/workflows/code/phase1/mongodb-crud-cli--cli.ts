export const code = `// MongoDB CRUD CLI — from WBS SE-6 live session
import { program } from 'commander'
import mongoose from 'mongoose'
import { Task } from './models/Task'

const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://localhost:27017/tasksdb'

async function connect() {
  await mongoose.connect(MONGO_URI)
}

program
  .name('tasks-cli')
  .description('Manage tasks in MongoDB from the command line')

program
  .command('add')
  .description('Add a new task')
  .argument('<title>', 'Task title')
  .option('-d, --done', 'Mark task as done immediately', false)
  .action(async (title: string, opts: { done: boolean }) => {
    await connect()
    const task = await Task.create({ title, done: opts.done })
    console.log(\`✓ Created: [\${task._id}] \${task.title}\`)
    await mongoose.disconnect()
  })

program
  .command('list')
  .description('List all tasks')
  .action(async () => {
    await connect()
    const tasks = await Task.find().sort({ createdAt: -1 })
    if (tasks.length === 0) { console.log('No tasks yet.'); return }
    for (const t of tasks) {
      console.log(\`[\${t.done ? '✓' : ' '}] \${t._id} — \${t.title}\`)
    }
    await mongoose.disconnect()
  })

program
  .command('done')
  .description('Mark a task as done')
  .argument('<id>', 'Task ObjectId')
  .action(async (id: string) => {
    await connect()
    const task = await Task.findByIdAndUpdate(id, { done: true }, { new: true })
    if (!task) { console.log('Task not found'); return }
    console.log(\`✓ Marked done: \${task.title}\`)
    await mongoose.disconnect()
  })

program
  .command('delete')
  .description('Delete a task')
  .argument('<id>', 'Task ObjectId')
  .action(async (id: string) => {
    await connect()
    await Task.findByIdAndDelete(id)
    console.log(\`Deleted task \${id}\`)
    await mongoose.disconnect()
  })

program
  .command('clearDB')
  .description('Delete all tasks')
  .action(async () => {
    await connect()
    const { deletedCount } = await Task.deleteMany({})
    console.log(\`Deleted \${deletedCount} task(s)\`)
    await mongoose.disconnect()
  })

program.parse()
`
