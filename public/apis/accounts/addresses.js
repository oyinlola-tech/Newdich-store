import { API_BASE_URL, getHeaders } from '../main/config.js';

export async function fetchAddresses() {
  const response = await fetch(`${API_BASE_URL}/addresses`, {
    headers: getHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch addresses');
  const data = await response.json();
  return data.addresses || [];
}

export async function createAddress(addressData) {
  const response = await fetch(`${API_BASE_URL}/addresses`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(addressData)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to add address');
  }
  return response.json();
}

export async function updateAddress(addressId, addressData) {
  const response = await fetch(`${API_BASE_URL}/addresses/${addressId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(addressData)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update address');
  }
  return response.json();
}

export async function deleteAddress(addressId) {
  const response = await fetch(`${API_BASE_URL}/addresses/${addressId}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete address');
  }
  return response.json();
}
