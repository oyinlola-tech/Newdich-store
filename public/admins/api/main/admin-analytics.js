import { API_BASE_URL, getHeaders } from './config.js';

export async function fetchAnalyticsStats(days = 30) {
  const response = await fetch(`${API_BASE_URL}/admin/stats?days=${days}`, {
    headers: getHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch analytics stats');
  return response.json();
}

export async function fetchTopProducts() {
  const response = await fetch(`${API_BASE_URL}/admin/products/top`, {
    headers: getHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch top products');
  return response.json();
}

export async function fetchTopCustomers() {
  const response = await fetch(`${API_BASE_URL}/admin/analytics/top-customers`, {
    headers: getHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch top customers');
  return response.json();
}

export async function fetchTopSearches(days = 30) {
  const response = await fetch(`${API_BASE_URL}/admin/analytics/top-searches?days=${days}`, {
    headers: getHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch top searches');
  return response.json();
}

export async function fetchSalesSeries(days = 30) {
  const response = await fetch(`${API_BASE_URL}/admin/analytics/sales?days=${days}`, {
    headers: getHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch sales series');
  return response.json();
}
