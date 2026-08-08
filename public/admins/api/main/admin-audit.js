import { API_BASE_URL, getHeaders } from './config.js';

export async function fetchLoginLogs(filters = {}) {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', filters.page);
  if (filters.limit) params.set('limit', filters.limit);
  if (filters.search) params.set('search', filters.search);
  if (filters.success) params.set('success', filters.success);

  const response = await fetch(`${API_BASE_URL}/admin/audit/login-logs?${params.toString()}`, {
    headers: getHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch audit logs');
  const data = await response.json();
  return data.logs || [];
}
