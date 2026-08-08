import { fetchTemplates, createTemplate, sendEmail } from '../../api/main/admin-emails.js';
import { checkAdminAuth } from './admin.js';
import { escapeHtml } from './sanitize.js';

if (!checkAdminAuth()) {
  throw new Error('Admin auth check failed');
}

const templatesContainer = document.getElementById('templates-container');
const searchInput = document.getElementById('template-search');
const createBtn = document.getElementById('create-template-btn');
const sendBtn = document.getElementById('send-email-btn');
const templateModal = document.getElementById('template-modal');
const sendModal = document.getElementById('send-email-modal');

async function loadTemplates(search = '') {
  try {
    templatesContainer.innerHTML = '<div class="loading">Loading templates...</div>';
    const data = await fetchTemplates(search);
    renderTemplates(data.templates || []);
  } catch (error) {
    templatesContainer.innerHTML = `<div class="error">${escapeHtml(error.message)}</div>`;
  }
}

function renderTemplates(templates) {
  if (!templates.length) {
    templatesContainer.innerHTML = '<div class="empty-state">No templates found.</div>';
    return;
  }

  templatesContainer.innerHTML = `
    <table class="data-table premium-table">
      <thead>
        <tr><th>Name</th><th>Category</th><th>Subject</th><th>Status</th></tr>
      </thead>
      <tbody>
        ${templates.map((t) => `
          <tr>
            <td>${escapeHtml(t.name)}</td>
            <td>${escapeHtml(t.category)}</td>
            <td>${escapeHtml(t.subject)}</td>
            <td><span class="status-badge ${t.isActive ? 'active' : 'inactive'}">${t.isActive ? 'Active' : 'Inactive'}</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

createBtn.addEventListener('click', () => {
  document.getElementById('template-form').reset();
  document.getElementById('template-message').style.display = 'none';
  templateModal.style.display = 'flex';
});

sendBtn.addEventListener('click', async () => {
  const templates = await fetchTemplates();
  const select = document.getElementById('email-template');
  select.innerHTML = '<option value="">Custom email</option>' +
    (templates.templates || []).map((t) => `<option value="${escapeHtml(t.id)}">${escapeHtml(t.name)}</option>`).join('');
  sendModal.style.display = 'flex';
});

document.querySelectorAll('.close, #cancel-modal, #cancel-send-modal').forEach((el) => {
  el.addEventListener('click', () => {
    templateModal.style.display = 'none';
    sendModal.style.display = 'none';
  });
});

window.addEventListener('click', (e) => {
  if (e.target === templateModal) templateModal.style.display = 'none';
  if (e.target === sendModal) sendModal.style.display = 'none';
});

document.getElementById('template-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    name: document.getElementById('template-name').value.trim(),
    category: document.getElementById('template-category').value,
    subject: document.getElementById('template-subject').value.trim(),
    body: document.getElementById('template-body').value.trim()
  };
  try {
    await createTemplate(data);
    document.getElementById('template-message').textContent = 'Template created!';
    document.getElementById('template-message').className = 'profile-message success';
    document.getElementById('template-message').style.display = 'block';
    setTimeout(() => { templateModal.style.display = 'none'; loadTemplates(); }, 1000);
  } catch (error) {
    document.getElementById('template-message').textContent = error.message;
    document.getElementById('template-message').className = 'profile-message error';
    document.getElementById('template-message').style.display = 'block';
  }
});

document.getElementById('send-email-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const to = document.getElementById('email-to').value.trim();
  const subject = document.getElementById('email-subject').value.trim();
  const body = document.getElementById('email-body').value.trim();
  if (!to) return;
  try {
    await sendEmail({ to, subject, body });
    document.getElementById('send-email-message').textContent = 'Email queued successfully!';
    document.getElementById('send-email-message').className = 'profile-message success';
    document.getElementById('send-email-message').style.display = 'block';
    setTimeout(() => { sendModal.style.display = 'none'; }, 1500);
  } catch (error) {
    document.getElementById('send-email-message').textContent = error.message;
    document.getElementById('send-email-message').className = 'profile-message error';
    document.getElementById('send-email-message').style.display = 'block';
  }
});

searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') loadTemplates(searchInput.value.trim());
});

document.addEventListener('DOMContentLoaded', () => { loadTemplates(); });
