import { fetchMyReviews } from '../../apis/products/reviews.js';
import { escapeHtml } from '../security/sanitize.js';
import { requireAuth } from '../security/security.js';

requireAuth('/account', 'account');

const container = document.getElementById('reviews-container');

async function loadReviews() {
  try {
    container.innerHTML = '<div class="loading">Loading your reviews...</div>';
    const reviews = await fetchMyReviews();
    renderReviews(reviews);
  } catch (error) {
    container.innerHTML = `<div class="error">${escapeHtml(error.message)}</div>`;
  }
}

function renderReviews(reviews) {
  if (!reviews.length) {
    container.innerHTML = '<div class="empty-state">You haven\'t reviewed any products yet.</div>';
    return;
  }

  container.innerHTML = `
    <div class="reviews-list">
      ${reviews.map((review) => `
        <div class="review-card">
          <div class="review-header">
            <strong>${escapeHtml(review.product?.name || 'Unknown Product')}</strong>
            <span class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span>
          </div>
          <p>${escapeHtml(review.comment || '')}</p>
          <span class="review-date">${review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}</span>
        </div>
      `).join('')}
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', loadReviews);
