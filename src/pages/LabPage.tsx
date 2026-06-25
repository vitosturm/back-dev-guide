import { useParams } from 'react-router-dom'
import { topics } from '@/data/topics'
import { labRegistry } from '@/lab/starterFiles/index'
import LabRunner from '@/lab/LabRunner'

export default function LabPage() {
  const { topicId } = useParams<{ topicId: string }>()
  const topic = topics.find((t) => t.id === topicId)

  if (!topic || !topic.hasLab) {
    return <div className="p-8 text-neutral-500">No lab for this topic.</div>
  }

  const labConfig = labRegistry[topic.id]
  if (!labConfig) {
    return <div className="p-8 text-neutral-500">Lab not yet available for this topic.</div>
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center gap-4 border-b border-neutral-200 px-6 py-3">
        <span className="text-sm font-medium text-neutral-900">{topic.title} — Lab</span>
      </div>
      <div className="flex-1 overflow-hidden">
        <LabRunner
          starterFiles={labConfig.files}
          entryFile={labConfig.entryFile}
        />
      </div>
    </div>
  )
}
