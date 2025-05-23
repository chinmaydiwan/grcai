export type NotificationType = 'info' | 'warning' | 'success' | 'error'
export type NotificationStatus = 'unread' | 'read' | 'archived'

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: NotificationType
  status: NotificationStatus
  related_entity_type?: string
  related_entity_id?: string
  created_at: string
  updated_at: string
}