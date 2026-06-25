import { useParams } from 'react-router-dom'
import type { FileSystemTree } from '@webcontainer/api'
import { topics } from '@/data/topics'
import LabRunner from '@/lab/LabRunner'

// Minimal Node.js starter files for Phase 0 labs.
// Each lab topic will override this with topic-specific starter files
// once Phase 0+1 content is designed and built.
const defaultStarterFiles: FileSystemTree = {
  'package.json': {
    file: {
      contents: JSON.stringify(
        { name: 'lab', type: 'module', dependencies: { typescript: '^5.8.0' } },
        null,
        2,
      ),
    },
  },
  'src': {
    directory: {
      'index.ts': {
        file: {
          contents: `// Write your TypeScript here\nconst greeting: string = 'Hello, back-dev-guide!';\nconsole.log(greeting);\n`,
        },
      },
    },
  },
}

export default function LabPage() {
  const { topicId } = useParams<{ topicId: string }>()
  const topic = topics.find((t) => t.id === topicId)

  if (!topic || !topic.hasLab) {
    return <div className="p-8 text-neutral-500">No lab for this topic.</div>
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center gap-4 border-b border-neutral-200 px-6 py-3">
        <span className="text-sm font-medium text-neutral-900">{topic.title} — Lab</span>
      </div>
      <div className="flex-1 overflow-hidden">
        <LabRunner starterFiles={defaultStarterFiles} entryFile="src/index.ts" />
      </div>
    </div>
  )
}
