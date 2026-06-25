import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/mantine'
import type { Block } from '@blocknote/core'
import { useNotes } from '@/hooks/useNotes'

const STATUS_LABELS = {
  idle: '',
  saving: 'Saving…',
  saved: 'Saved',
  error: 'Failed to save — retrying',
} as const

interface NotesPanelProps {
  userId: string
  topicId: string
}

export default function NotesPanel({ userId, topicId }: NotesPanelProps) {
  const { initialContent, saveStatus, save } = useNotes(userId, topicId)

  const editor = useCreateBlockNote(
    // BlockNote rejects an empty array — undefined gets its own default empty document instead
    { initialContent: initialContent && initialContent.length > 0 ? initialContent : undefined },
    // Recreate the editor exactly once — when initialContent transitions from null to loaded data.
    // BlockNote's hook accepts a deps array as its second argument (same pattern as useMemo).
    [initialContent !== null],
  )

  if (initialContent === null) {
    return <div className="h-32 animate-pulse rounded-xl bg-neutral-100" />
  }

  function handleChange() {
    save(editor.document as Block[])
  }

  return (
    <div className="mt-10 rounded-xl border border-neutral-200 bg-white">
      <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">My Notes</span>
        {saveStatus !== 'idle' && (
          <span
            className={`text-xs ${saveStatus === 'error' ? 'text-red-500' : 'text-neutral-400'}`}
          >
            {STATUS_LABELS[saveStatus]}
          </span>
        )}
      </div>
      <div className="p-2">
        <BlockNoteView editor={editor} onChange={handleChange} theme="light" />
      </div>
    </div>
  )
}
