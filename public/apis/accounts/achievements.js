import { API_BASE_URL, getHeaders } from '../main/config.js';

export async function fetchAchievements() {
  const response = await fetch(`${API_BASE_URL}/achievements`, {
    headers: getHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch achievements');
  const data = await response.json();
  return data.achievements || [];
}

export async function fetchUserAchievements() {
  const response = await fetch(`${API_BASE_URL}/users/achievements`, {
    headers: getHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch user achievements');
  const data = await response.json();
  return data.achievements || [];
}
