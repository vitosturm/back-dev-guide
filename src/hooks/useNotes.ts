import { useCallback, useEffect, useRef, useState } from 'react'
import type { Block } from '@blocknote/core'
import { getNote, upsertNote } from '@/lib/notes'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function useNotes(userId: string, topicId: string) {
  const [initialContent, setInitialContent] = useState<Block[] | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    let cancelled = false
    // Reset to null first (as a microtask to satisfy react-hooks/set-state-in-effect),
    // then load the saved note for this userId/topicId.
    Promise.resolve()
      .then(() => { if (!cancelled) setInitialContent(null) })
      .then(() => getNote(userId, topicId))
      .then((content) => { if (!cancelled) setInitialContent(content ?? []) })
    return () => { cancelled = true }
  }, [userId, topicId])

  const save = useCallback(
    (content: Block[]) => {
      clearTimeout(timerRef.current)
      setSaveStatus('saving')
      timerRef.current = setTimeout(async () => {
        try {
          await upsertNote(userId, topicId, content)
          setSaveStatus('saved')
        } catch {
          setSaveStatus('error')
        }
      }, 1000)
    },
    [userId, topicId],
  )

  return { initialContent, saveStatus, save }
}
