import { API_BASE_URL, getHeaders } from './config.js';

export async function submitReturnRequest(returnData) {
    try {
        const response = await fetch(`${API_BASE_URL}/returns`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(returnData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to submit return');
        }
        return await response.json();
    } catch (error) {
        console.error('Return request error:', error);
        throw error;
    }
}
