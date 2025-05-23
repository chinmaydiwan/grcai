'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Notification } from '@/types/notification'

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    fetchNotifications()
    // Subscribe to new notifications
    const channel = supabase
      .channel('notifications') // No change here
      // Explicitly type the event for the .on() method
      channel.on(
        'system' as const, // Changed from 'postgres_changes' to 'system'
        {
          event: 'INSERT' as const, // Add 'as const' here
          schema: 'public',
          table: 'notifications',
        },
        handleNewNotification
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchNotifications() {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('status', 'unread')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching notifications:', error)
      return
    }

    setNotifications(data || [])
    setUnreadCount(data?.length || 0)
  }

  // Replace the explicit 'any' type in handleNewNotification
  const handleNewNotification = (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
  };

  async function markAsRead(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ status: 'read' })
      .eq('id', notificationId)

    if (error) {
      console.error('Error marking notification as read:', error)
      return
    }

    setNotifications(prev => prev.filter(n => n.id !== notificationId))
    setUnreadCount(prev => prev - 1)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-1 text-gray-400 hover:text-white focus:outline-none"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No new notifications
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className="flex items-start p-4 hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {notification.message}
                    </p>
                  </div>
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="ml-4 text-sm text-blue-500 hover:text-blue-600"
                  >
                    Mark as read
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}