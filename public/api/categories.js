import { API_BASE_URL, getHeaders } from './config.js';

// Fetch all categories (public)
export async function fetchCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        return data.categories || data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

// Fetch a single category by ID or slug
export async function fetchCategoryById(categoryId) {
    try {
        const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch category');
        const data = await response.json();
        return data.category || data;
    } catch (error) {
        console.error('Error fetching category:', error);
        throw error;
    }
}


