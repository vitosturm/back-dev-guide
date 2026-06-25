import { useParams } from 'react-router-dom'
import { topics } from '@/data/topics'

export default function LabPage() {
  const { topicId } = useParams<{ topicId: string }>()
  const topic = topics.find((t) => t.id === topicId)

  if (!topic || !topic.hasLab) {
    return <div className="p-8 text-neutral-500">No lab for this topic.</div>
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-4 border-b border-neutral-200 px-6 py-3">
        <span className="text-sm font-medium text-neutral-900">{topic.title} — Lab</span>
      </div>
      <div className="flex-1 p-8 text-neutral-400">Lab runner wired in Task 8.</div>
    </div>
  )
}
