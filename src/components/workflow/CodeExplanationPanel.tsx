import type { WorkflowNode } from '@/data/workflows/types'
import CodeBlock from './CodeBlock'

interface CodeExplanationPanelProps {
  node: WorkflowNode | null
}

export default function CodeExplanationPanel({ node }: CodeExplanationPanelProps) {
  if (!node || node.kind !== 'file' || !node.code) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-sm text-neutral-400">
        Select a file in the tree to see its code and explanation.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <CodeBlock code={node.code} language={node.language ?? 'text'} label={node.filePath} />
      {node.explanation && (
        <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
          {node.explanation}
        </div>
      )}
    </div>
  )
}
