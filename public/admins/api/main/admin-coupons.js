import { API_BASE_URL, getHeaders } from './config.js';

export async function fetchCoupons(search = '') {
  const url = `${API_BASE_URL}/admin/coupons${search ? `?search=${encodeURIComponent(search)}` : ''}`;
  const response = await fetch(url, {
    headers: getHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch coupons');
  const data = await response.json();
  return data.coupons || [];
}

export async function createCoupon(couponData) {
  const response = await fetch(`${API_BASE_URL}/admin/coupons`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(couponData)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create coupon');
  }
  return response.json();
}

export async function updateCoupon(id, couponData) {
  const response = await fetch(`${API_BASE_URL}/admin/coupons/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(couponData)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update coupon');
  }
  return response.json();
}

export async function deleteCoupon(id) {
  const response = await fetch(`${API_BASE_URL}/admin/coupons/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete coupon');
  }
}
