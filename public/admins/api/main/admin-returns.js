import { API_BASE_URL, getHeaders } from './config.js';

// Fetch all return requests (admin view) with optional filters
export async function fetchReturnRequests(filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.status && filters.status !== 'all') queryParams.append('status', filters.status);
    if (filters.search) queryParams.append('search', filters.search);
    const url = `${API_BASE_URL}/admin/returns${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    try {
        const response = await fetch(url, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch return requests');
        const data = await response.json();
        return data.returns || [];
    } catch (error) {
        console.error('Error fetching return requests:', error);
        throw error;
    }
}

// Fetch a single return request by ID
export async function fetchReturnById(returnId) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/returns/${returnId}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch return request');
        const data = await response.json();
        return data.return;
    } catch (error) {
        console.error('Error fetching return request:', error);
        throw error;
    }
}

// Update return request status
export async function updateReturnStatus(returnId, status) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/returns/${returnId}/status`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ status })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update return status');
        }
        const data = await response.json();
        return data.return;
    } catch (error) {
        console.error('Error updating return status:', error);
        throw error;
    }
}

// Add an internal note to a return request
export async function addReturnNote(returnId, note) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/returns/${returnId}/notes`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ note })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to add return note');
        }
        return await response.json();
    } catch (error) {
        console.error('Error adding return note:', error);
        throw error;
    }
}


