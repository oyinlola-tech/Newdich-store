import { fetchPendingReviewPrompts, dismissReviewPrompt } from '../../apis/products/review-prompts.js';

let currentPrompt = null;

async function checkReviewPrompts() {
  const prompts = await fetchPendingReviewPrompts();
  if (!prompts.length) return;

  currentPrompt = prompts[0];
  showReviewPopup(currentPrompt);
}

function showReviewPopup(prompt) {
  const overlay = document.createElement('div');
  overlay.id = 'review-popup-overlay';
  overlay.innerHTML = `
    <div class="review-popup">
      <h3>How is your order?</h3>
      <p>Would you like to review ${escapeHtml(prompt.product?.name || 'your purchase')}?</p>
      <div class="review-popup-actions">
        <button id="review-yes" class="btn-primary">Write a Review</button>
        <button id="review-later" class="btn-secondary">Maybe Later</button>
        <button id="review-dismiss" class="btn-secondary">Dismiss</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById('review-yes').addEventListener('click', () => {
    window.location.href = `/products/${prompt.product?.id}?review=${prompt.id}`;
  });

  document.getElementById('review-later').addEventListener('click', () => {
    overlay.remove();
  });

  document.getElementById('review-dismiss').addEventListener('click', async () => {
    await dismissReviewPrompt(prompt.id);
    overlay.remove();
  });
}

function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#39;';
      default: return ch;
    }
  });
}

document.addEventListener('DOMContentLoaded', checkReviewPrompts);
