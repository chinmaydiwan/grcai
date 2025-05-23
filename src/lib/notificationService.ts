import { supabase } from './supabase'
import type { NotificationType } from '@/types/notification'

export async function createNotification({
  title,
  message,
  type,
  relatedEntityType,
  relatedEntityId,
}: {
  title: string
  message: string
  type: NotificationType
  relatedEntityType?: string
  relatedEntityId?: string
}) {
  const user = await supabase.auth.getUser()
  if (!user.data?.user) return

  const { error } = await supabase.from('notifications').insert([
    {
      user_id: user.data.user.id,
      title,
      message,
      type,
      status: 'unread',
      related_entity_type: relatedEntityType,
      related_entity_id: relatedEntityId,
    },
  ])

  if (error) {
    console.error('Error creating notification:', error)
  }
}