import { API_BASE_URL, getHeaders } from './config.js';

export async function fetchFeaturedProducts(limit = 4) {
    try {
        const response = await fetch(`${API_BASE_URL}/products?featured=true&limit=${limit}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch featured products');
        const data = await response.json();
        return data.products || data;
    } catch (error) {
        console.error('Error fetching featured products:', error);
        return [];
    }
}

export async function fetchAllProducts(filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.category && filters.category !== 'all') queryParams.append('category', filters.category);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
    if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
    const url = `${API_BASE_URL}/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    try {
        const response = await fetch(url, { headers: getHeaders() });
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        return data.products || data;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

export async function fetchProductById(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${id}`, { headers: getHeaders() });
        if (!response.ok) throw new Error('Failed to fetch product');
        const data = await response.json();
        return data.product || data;
    } catch (error) {
        console.error('Error fetching product:', error);
        throw error;
    }
}