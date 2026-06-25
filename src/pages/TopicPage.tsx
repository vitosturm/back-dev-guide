import { Suspense, useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { ComponentType } from 'react'
import { topics } from '@/data/topics'
import registry from '@/topics/registry'
import NotesPanel from '@/components/notes/NotesPanel'
import { useAuthContext } from '@/contexts/AuthContext'

export default function TopicPage() {
  const { topicId } = useParams<{ topicId: string }>()
  const topic = topics.find((t) => t.id === topicId)
  const [VizComponent, setVizComponent] = useState<ComponentType | null>(null)
  const { user } = useAuthContext()

  const vizKey = topic?.viz
  // Render-phase reset: clear cached Viz when the topic (and thus vizKey) changes.
  const [prevVizKey, setPrevVizKey] = useState(vizKey)
  if (prevVizKey !== vizKey) {
    setPrevVizKey(vizKey)
    setVizComponent(null)
  }

  useEffect(() => {
    if (!vizKey || !(vizKey in registry)) return
    registry[vizKey]().then((mod) => setVizComponent(() => mod.default))
  }, [vizKey])

  if (!topic) {
    return (
      <div className="p-8 text-neutral-500">Topic not found.</div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <h1 className="mb-2 text-2xl font-bold text-neutral-900">{topic.title}</h1>
      <p className="mb-6 text-neutral-600">{topic.description}</p>

      {VizComponent && (
        <Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-neutral-100" />}>
          <VizComponent />
        </Suspense>
      )}

      {topic.hasLab && (
        <Link
          to={`/lab/${topic.id}`}
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Open Lab →
        </Link>
      )}

      {user && (
        <div className="mt-10">
          {/* key=topic.id forces NotesPanel to remount on topic change,
              reinitialising the BlockNote editor with fresh content */}
          <NotesPanel key={topic.id} userId={user.id} topicId={topic.id} />
        </div>
      )}
    </div>
  )
}
