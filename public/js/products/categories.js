import { API_BASE_URL, getHeaders } from '../apis/main/config.js';
import { escapeHtml } from '../js/security/sanitize.js';

const container = document.getElementById('categories-container');

async function loadCategories() {
  try {
    container.innerHTML = '<div class="loading">Loading categories...</div>';
    const response = await fetch(`${API_BASE_URL}/categories/tree`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch categories');
    const data = await response.json();
    renderCategories(data.tree || []);
  } catch (error) {
    container.innerHTML = `<div class="error">${escapeHtml(error.message)}</div>`;
  }
}

function renderCategories(categories) {
  if (!categories.length) {
    container.innerHTML = '<div class="empty-state">No categories found.</div>';
    return;
  }

  container.innerHTML = `
    <div class="categories-grid">
      ${categories.map((cat) => `
        <a href="/products?category=${encodeURIComponent(cat.slug || cat.id)}" class="category-card">
          <h3>${escapeHtml(cat.name)}</h3>
          <p>${escapeHtml(cat.description || '')}</p>
        </a>
      `).join('')}
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', loadCategories);
