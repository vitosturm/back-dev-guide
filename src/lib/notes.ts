import type { Block } from '@blocknote/core'
import { supabase } from './supabase'

export async function getNote(
  userId: string,
  topicId: string,
): Promise<Block[] | null> {
  const { data, error } = await supabase
    .from('notes')
    .select('content_json')
    .eq('user_id', userId)
    .eq('topic_id', topicId)
    .maybeSingle()

  if (error || !data) return null
  return data.content_json as Block[]
}

export async function upsertNote(
  userId: string,
  topicId: string,
  content: Block[],
): Promise<void> {
  const { error } = await supabase.from('notes').upsert(
    {
      user_id: userId,
      topic_id: topicId,
      content_json: content,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,topic_id' },
  )
  if (error) throw error
}
