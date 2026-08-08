import { fetchLoginLogs } from '../../api/main/admin-audit.js';
import { checkAdminAuth } from './admin.js';
import { escapeHtml } from './sanitize.js';

if (!checkAdminAuth()) {
  throw new Error('Admin auth check failed');
}

const auditContainer = document.getElementById('audit-container');
const searchInput = document.getElementById('audit-search');
const statusSelect = document.getElementById('audit-status');
const applyBtn = document.getElementById('apply-audit-search');
const resetBtn = document.getElementById('reset-audit-search');

let currentPage = 1;

async function loadAuditLogs(filters = {}) {
  try {
    auditContainer.innerHTML = '<div class="loading">Loading audit logs...</div>';
    const logs = await fetchLoginLogs({
      page: currentPage,
      limit: 20,
      search: filters.search,
      success: filters.success
    });
    renderAuditLogs(logs);
  } catch (error) {
    auditContainer.innerHTML = `<div class="error">${escapeHtml(error.message)}</div>`;
  }
}

function renderAuditLogs(logs) {
  if (!logs.length) {
    auditContainer.innerHTML = '<div class="empty-state">No audit logs found.</div>';
    return;
  }

  auditContainer.innerHTML = `
    <table class="data-table premium-table">
      <thead>
        <tr>
          <th>Email</th>
          <th>IP</th>
          <th>User Agent</th>
          <th>Success</th>
          <th>Message</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        ${logs.map((log) => `
          <tr>
            <td>${escapeHtml(log.email || 'N/A')}</td>
            <td>${escapeHtml(log.ip || 'N/A')}</td>
            <td>${escapeHtml((log.userAgent || 'N/A').slice(0, 50))}</td>
            <td><span class="status-badge ${log.success ? 'active' : 'inactive'}">${log.success ? 'Success' : 'Failed'}</span></td>
            <td>${escapeHtml(log.message || '')}</td>
            <td>${escapeHtml(new Date(log.createdAt).toLocaleString())}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

applyBtn.addEventListener('click', () => {
  currentPage = 1;
  loadAuditLogs({
    search: searchInput.value.trim(),
    success: statusSelect.value || undefined
  });
});

resetBtn.addEventListener('click', () => {
  searchInput.value = '';
  statusSelect.value = '';
  currentPage = 1;
  loadAuditLogs();
});

searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') applyBtn.click();
});

document.addEventListener('DOMContentLoaded', () => {
  loadAuditLogs();
});
