import { fetchNotifications, markAllNotificationsRead } from '../../apis/accounts/notifications.js';
import { escapeHtml } from '../security/sanitize.js';
import { requireAuth } from '../security/security.js';

requireAuth('/account', 'account');

const container = document.getElementById('notifications-container');

async function loadNotifications() {
  try {
    container.innerHTML = '<div class="loading">Loading notifications...</div>';
    const notifications = await fetchNotifications();
    renderNotifications(notifications);
  } catch (error) {
    container.innerHTML = `<div class="error">${escapeHtml(error.message)}</div>`;
  }
}

function renderNotifications(notifications) {
  if (!notifications.length) {
    container.innerHTML = '<div class="empty-state">No notifications yet.</div>';
    return;
  }

  container.innerHTML = `
    <div class="notifications-list">
      ${notifications.map((n) => `
        <div class="notification-card ${n.readAt ? 'read' : 'unread'}">
          <div class="notification-icon">
            <i class="fas ${n.type === 'PROMOTION' ? 'fa-tag' : n.type === 'ALERT' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
          </div>
          <div class="notification-body">
            <h4>${escapeHtml(n.title)}</h4>
            <p>${escapeHtml(n.body)}</p>
            <span class="notification-date">${n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', loadNotifications);
