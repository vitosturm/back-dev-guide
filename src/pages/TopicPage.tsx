import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { topics } from '@/data/topics'
import { workflowRegistry } from '@/data/workflows/index'
import FileSidebar from '@/components/workflow/FileSidebar'
import CodePanel from '@/components/workflow/CodePanel'
import ExplanationPanel from '@/components/workflow/ExplanationPanel'
import VideoPlayer from '@/components/video/VideoPlayer'
import NotesPanel from '@/components/notes/NotesPanel'
import { useAuthContext } from '@/contexts/AuthContext'
import { findFirstFileNode, findNodeById, isMultiNode } from '@/components/workflow/treeUtils'

export default function TopicPage() {
  const { topicId } = useParams<{ topicId: string }>()
  const { user } = useAuthContext()

  const topic = topics.find((t) => t.id === topicId)
  const workflow = topic ? workflowRegistry[topic.id] : undefined
  const defaultSelectedId = workflow ? (findFirstFileNode(workflow)?.id ?? null) : null

  const [prevTopicId, setPrevTopicId] = useState(topicId)
  const [selectedId, setSelectedId] = useState(defaultSelectedId)
  const [activeLineNum, setActiveLineNum] = useState<number | null>(null)

  if (prevTopicId !== topicId) {
    setPrevTopicId(topicId)
    setSelectedId(defaultSelectedId)
    setActiveLineNum(null)
  }

  if (!topic) {
    return <div className="p-8 text-neutral-500">Topic not found.</div>
  }

  const selectedNode = workflow ? findNodeById(workflow, selectedId) : null
  const showSidebar = workflow ? isMultiNode(workflow) : false

  function handleLineClick(lineNum: number) {
    setActiveLineNum((prev) => (prev === lineNum ? null : lineNum))
  }

  function handleFileSelect(id: string) {
    setSelectedId(id)
    setActiveLineNum(null)
  }

  return (
    <div className="flex flex-col">
      <div className="border-b border-neutral-200 px-8 py-5">
        <h1 className="mb-1 text-xl font-bold text-neutral-900">{topic.title}</h1>
        <p className="text-sm text-neutral-500">{topic.description}</p>
      </div>

      {workflow && (
        <div
          className={`flex min-h-[580px] ${
            showSidebar ? '' : 'mx-auto w-full max-w-5xl'
          }`}
        >
          {showSidebar && (
            <div className="w-60 shrink-0 border-r border-neutral-800">
              <FileSidebar
                nodes={workflow}
                selectedId={selectedId}
                onSelect={handleFileSelect}
              />
            </div>
          )}
          <div className="flex-1 overflow-hidden border-r border-neutral-200">
            <CodePanel
              node={selectedNode}
              activeLineNum={activeLineNum}
              onLineClick={handleLineClick}
            />
          </div>
          <div className="w-80 shrink-0 overflow-y-auto bg-neutral-950">
            <ExplanationPanel
              node={selectedNode}
              activeLineNum={activeLineNum}
              onLineClick={handleLineClick}
            />
          </div>
        </div>
      )}

      <div className="mx-auto w-full max-w-3xl px-8 py-6 flex flex-col gap-6">
        {(topic.videoClip || topic.youtubeClip) && (
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              Session recording
            </p>
            <VideoPlayer clip={topic.videoClip} ytClip={topic.youtubeClip} />
          </div>
        )}
        {topic.sourceUrl && (
          <a
            href={topic.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            View source code on GitHub →
          </a>
        )}
        {user && <NotesPanel key={topic.id} userId={user.id} topicId={topic.id} />}
      </div>
    </div>
  )
}
