import { Suspense, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { ComponentType } from 'react'
import { topics } from '@/data/topics'
import registry from '@/topics/registry'
import { workflowRegistry } from '@/data/workflows/index'
import WorkflowTree from '@/components/workflow/WorkflowTree'
import CodeExplanationPanel from '@/components/workflow/CodeExplanationPanel'
import { findFirstFileNode, findNodeById, isMultiNode } from '@/components/workflow/treeUtils'
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

  const workflow = topic ? workflowRegistry[topic.id] : undefined
  const defaultSelectedId = workflow ? (findFirstFileNode(workflow)?.id ?? null) : null

  // Render-phase reset: re-select the entry node when the topic changes.
  const [prevTopicId, setPrevTopicId] = useState(topicId)
  const [selectedId, setSelectedId] = useState(defaultSelectedId)
  if (prevTopicId !== topicId) {
    setPrevTopicId(topicId)
    setSelectedId(defaultSelectedId)
  }

  if (!topic) {
    return (
      <div className="p-8 text-neutral-500">Topic not found.</div>
    )
  }

  const selectedNode = workflow ? findNodeById(workflow, selectedId) : null
  const showTree = workflow ? isMultiNode(workflow) : false

  return (
    <div className="py-10">
      <div className="mx-auto max-w-3xl px-8">
        <h1 className="mb-2 text-2xl font-bold text-neutral-900">{topic.title}</h1>
        <p className="mb-6 text-neutral-600">{topic.description}</p>

        {VizComponent && (
          <Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-neutral-100" />}>
            <VizComponent />
          </Suspense>
        )}
      </div>

      {workflow && (
        <div className={showTree ? 'mt-8 flex gap-6 px-8' : 'mx-auto mt-8 max-w-3xl px-8'}>
          {showTree && (
            <div className="w-72 shrink-0 rounded-xl border border-neutral-200 bg-neutral-50">
              <WorkflowTree nodes={workflow} selectedId={selectedId} onSelect={setSelectedId} />
            </div>
          )}
          <div className="flex-1 rounded-xl border border-neutral-200 bg-white">
            <CodeExplanationPanel node={selectedNode} />
          </div>
        </div>
      )}

      <div className="mx-auto max-w-3xl px-8">
        {topic.sourceUrl && (
          <a
            href={topic.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            View source code on GitHub →
          </a>
        )}

        {user && (
          <NotesPanel key={topic.id} userId={user.id} topicId={topic.id} />
        )}
      </div>
    </div>
  )
}
