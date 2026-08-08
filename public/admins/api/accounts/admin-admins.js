import { API_BASE_URL, getHeaders } from '../main/config.js';

export async function fetchStaff(search = '') {
  const url = `${API_BASE_URL}/admin/staff${search ? `?search=${encodeURIComponent(search)}` : ''}`;
  const response = await fetch(url, {
    headers: getHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch staff');
  const data = await response.json();
  return data.staff || [];
}

export async function fetchStaffRoles() {
  const response = await fetch(`${API_BASE_URL}/admin/staff/roles`, {
    headers: getHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch staff roles');
  return response.json();
}

export async function createStaff(staffData) {
  const response = await fetch(`${API_BASE_URL}/admin/staff`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(staffData)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create staff');
  }
  return response.json();
}

export async function updateStaff(id, staffData) {
  const response = await fetch(`${API_BASE_URL}/admin/staff/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(staffData)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update staff');
  }
  return response.json();
}

export async function deleteStaff(id) {
  const response = await fetch(`${API_BASE_URL}/admin/staff/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete staff');
  }
}
