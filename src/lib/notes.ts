import type { Block } from '@blocknote/core'
import { ClientResponseError } from 'pocketbase'
import { pb } from './pocketbase'

interface NoteRecord {
  id: string
  content_json: Block[]
}

export async function getNote(
  userId: string,
  topicId: string,
): Promise<Block[] | null> {
  try {
    const record = await pb
      .collection('notes')
      .getFirstListItem<NoteRecord>(
        pb.filter('user = {:userId} && topic_id = {:topicId}', { userId, topicId }),
      )
    return record.content_json
  } catch (error) {
    if (error instanceof ClientResponseError && error.status === 404) return null
    throw error
  }
}

export async function upsertNote(
  userId: string,
  topicId: string,
  content: Block[],
): Promise<void> {
  try {
    const existing = await pb
      .collection('notes')
      .getFirstListItem<NoteRecord>(
        pb.filter('user = {:userId} && topic_id = {:topicId}', { userId, topicId }),
      )
    await pb.collection('notes').update(existing.id, { content_json: content })
  } catch (error) {
    if (!(error instanceof ClientResponseError) || error.status !== 404) throw error
    await pb.collection('notes').create({
      user: userId,
      topic_id: topicId,
      content_json: content,
    })
  }
}
