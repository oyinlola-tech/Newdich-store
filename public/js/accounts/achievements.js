import { fetchUserAchievements } from '../../apis/accounts/achievements.js';
import { escapeHtml } from '../security/sanitize.js';
import { requireAuth } from '../security/security.js';

requireAuth('/account', 'account');

const container = document.getElementById('achievements-container');

async function loadAchievements() {
  try {
    container.innerHTML = '<div class="loading">Loading achievements...</div>';
    const achievements = await fetchUserAchievements();
    renderAchievements(achievements);
  } catch (error) {
    container.innerHTML = `<div class="error">${escapeHtml(error.message)}</div>`;
  }
}

function renderAchievements(achievements) {
  if (!achievements.length) {
    container.innerHTML = '<div class="empty-state">No achievements unlocked yet. Keep shopping to earn badges!</div>';
    return;
  }

  container.innerHTML = `
    <div class="achievements-grid">
      ${achievements.map((ach) => `
        <div class="achievement-card">
          <div class="achievement-icon">
            <i class="fas fa-trophy"></i>
          </div>
          <h3>${escapeHtml(ach.name)}</h3>
          <p>${escapeHtml(ach.description || '')}</p>
          <span class="achievement-date">${ach.unlockedAt ? new Date(ach.unlockedAt).toLocaleDateString() : ''}</span>
        </div>
      `).join('')}
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', loadAchievements);
