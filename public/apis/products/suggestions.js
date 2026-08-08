import { API_BASE_URL, getHeaders } from '../main/config.js';

export async function fetchProductSuggestions(query, limit = 5) {
  if (!query?.trim()) return [];
  const url = `${API_BASE_URL}/products/suggestions?q=${encodeURIComponent(query.trim())}&limit=${limit}`;
  const response = await fetch(url);
  if (!response.ok) return [];
  const data = await response.json();
  return data.suggestions || [];
}
