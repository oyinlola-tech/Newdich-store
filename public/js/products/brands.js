import { API_BASE_URL, getHeaders } from '../apis/main/config.js';
import { escapeHtml } from '../js/security/sanitize.js';

const container = document.getElementById('brands-container');

async function loadBrands() {
  try {
    container.innerHTML = '<div class="loading">Loading brands...</div>';
    const response = await fetch(`${API_BASE_URL}/brands`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch brands');
    const data = await response.json();
    renderBrands(data.brands || []);
  } catch (error) {
    container.innerHTML = `<div class="error">${escapeHtml(error.message)}</div>`;
  }
}

function renderBrands(brands) {
  if (!brands.length) {
    container.innerHTML = '<div class="empty-state">No brands found.</div>';
    return;
  }

  container.innerHTML = `
    <div class="brands-grid">
      ${brands.map((brand) => `
        <a href="/products?brand=${encodeURIComponent(brand.slug || brand.id)}" class="brand-card">
          <h3>${escapeHtml(brand.name)}</h3>
          <p>${escapeHtml(brand.description || '')}</p>
        </a>
      `).join('')}
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', loadBrands);
