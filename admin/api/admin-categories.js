import { API_BASE_URL, getHeaders } from './config.js';

export async function fetchAdminCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/categories`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        return data.categories || [];
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
}

export async function createCategory(categoryData) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/categories`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(categoryData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create category');
        }
        const data = await response.json();
        return data.category || data;
    } catch (error) {
        console.error('Error creating category:', error);
        throw error;
    }
}

export async function updateCategory(categoryId, categoryData) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/categories/${categoryId}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(categoryData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update category');
        }
        const data = await response.json();
        return data.category || data;
    } catch (error) {
        console.error('Error updating category:', error);
        throw error;
    }
}

export async function deleteCategory(categoryId) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/categories/${categoryId}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete category');
        }
        return true;
    } catch (error) {
        console.error('Error deleting category:', error);
        throw error;
    }
}
