import { API_BASE_URL, getHeaders } from '../main/config.js';

export async function fetchNotifications() {
  const response = await fetch(`${API_BASE_URL}/notifications`, {
    headers: getHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch notifications');
  const data = await response.json();
  return data.notifications || [];
}

export async function getUnreadCount() {
  const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
    headers: getHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch unread count');
  const data = await response.json();
  return data.count || 0;
}

export async function markNotificationRead(notificationId) {
  const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
    method: 'PUT',
    headers: getHeaders()
  });
  if (!response.ok) throw new Error('Failed to mark notification as read');
  return response.json();
}

export async function markAllNotificationsRead() {
  const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
    method: 'PUT',
    headers: getHeaders()
  });
  if (!response.ok) throw new Error('Failed to mark all notifications as read');
  return response.json();
}
