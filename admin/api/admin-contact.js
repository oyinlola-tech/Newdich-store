import { API_BASE_URL, getHeaders } from './config.js';

// Fetch contact messages (admin view) with optional filters
export async function fetchContactMessages(filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.status && filters.status !== 'all') queryParams.append('status', filters.status);
    if (filters.search) queryParams.append('search', filters.search);
    const url = `${API_BASE_URL}/admin/contact${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    try {
        const response = await fetch(url, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch contact messages');
        const data = await response.json();
        return data.messages || [];
    } catch (error) {
        console.error('Error fetching contact messages:', error);
        throw error;
    }
}

// Fetch a single contact message by ID
export async function fetchContactMessageById(messageId) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/contact/${messageId}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch contact message');
        const data = await response.json();
        return data.message;
    } catch (error) {
        console.error('Error fetching contact message:', error);
        throw error;
    }
}

// Update contact message status (e.g. open, resolved)
export async function updateContactStatus(messageId, status) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/contact/${messageId}/status`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ status })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update contact status');
        }
        const data = await response.json();
        return data.message;
    } catch (error) {
        console.error('Error updating contact status:', error);
        throw error;
    }
}

// Reply to a contact message (optional if backend supports replies)
export async function replyToContactMessage(messageId, reply) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/contact/${messageId}/reply`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ reply })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to send reply');
        }
        return await response.json();
    } catch (error) {
        console.error('Error replying to contact message:', error);
        throw error;
    }
}
