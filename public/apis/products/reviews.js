import { API_BASE_URL, getHeaders } from '../main/config.js';

export async function fetchUserReviews() {
  const response = await fetch(`${API_BASE_URL}/reviews/me`, {
    headers: getHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch reviews');
  const data = await response.json();
  return data.reviews || [];
}
