import { API_BASE_URL, getHeaders } from './config.js';

// Fetch all products (admin view)
export async function fetchAdminProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/products`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        return data.products || [];
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
}

// Fetch single product by ID (for editing)
export async function fetchProductById(productId) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/products/${productId}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch product');
        const data = await response.json();
        return data.product;
    } catch (error) {
        console.error('Error fetching product:', error);
        throw error;
    }
}

// Create a new product
export async function createProduct(productData) {
    try {
        const headers = getHeaders();
        if (productData instanceof FormData) {
            delete headers['Content-Type'];
        }
        const response = await fetch(`${API_BASE_URL}/admin/products`, {
            method: 'POST',
            headers,
            body: productData instanceof FormData ? productData : JSON.stringify(productData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create product');
        }
        const data = await response.json();
        return data.product;
    } catch (error) {
        console.error('Error creating product:', error);
        throw error;
    }
}

// Update existing product
export async function updateProduct(productId, productData) {
    try {
        const headers = getHeaders();
        if (productData instanceof FormData) {
            delete headers['Content-Type'];
        }
        const response = await fetch(`${API_BASE_URL}/admin/products/${productId}`, {
            method: 'PUT',
            headers,
            body: productData instanceof FormData ? productData : JSON.stringify(productData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update product');
        }
        const data = await response.json();
        return data.product;
    } catch (error) {
        console.error('Error updating product:', error);
        throw error;
    }
}

// Delete product
export async function deleteProduct(productId) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/products/${productId}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete product');
        }
        return true;
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
}
