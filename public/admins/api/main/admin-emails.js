import { API_BASE_URL, getHeaders } from './config.js';

export async function fetchTemplates(search = '') {
  const url = `${API_BASE_URL}/admin/email-templates${search ? `?search=${encodeURIComponent(search)}` : ''}`;
  const response = await fetch(url, { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch templates');
  return response.json();
}

export async function createTemplate(data) {
  const response = await fetch(`${API_BASE_URL}/admin/email-templates`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create template');
  }
  return response.json();
}

export async function sendEmail(data) {
  const response = await fetch(`${API_BASE_URL}/emails/send`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to send email');
  }
  return response.json();
}
