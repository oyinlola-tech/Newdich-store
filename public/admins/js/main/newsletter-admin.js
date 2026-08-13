import { fetchNewsletterSubscribers, fetchNewsletterCounts } from '../../api/main/admin-newsletter.js';
import { checkAdminAuth } from './admin.js';
import { escapeHtml } from './sanitize.js';

if (!checkAdminAuth()) { throw new Error("Admin auth check failed"); }

const container = document.getElementById('newsletter-container');
const countsContainer = document.getElementById('newsletter-counts');
const statusFilter = document.getElementById('status-filter');
const searchInput = document.getElementById('newsletter-search');
const applyFiltersBtn = document.getElementById('apply-filters');
const resetFiltersBtn = document.getElementById('reset-filters');

let currentFilters = { status: 'all', search: '' };

async function loadCounts() {
    try {
        const data = await fetchNewsletterCounts();
        countsContainer.innerHTML = `
            <div class="stat-card"><strong>${data.counts.subscribed ?? 0}</strong><span>Subscribed</span></div>
            <div class="stat-card"><strong>${data.counts.unsubscribed ?? 0}</strong><span>Unsubscribed</span></div>
        `;
    } catch (error) {
        countsContainer.innerHTML = `<div class="error">${escapeHtml(error.message)}</div>`;
    }
}

async function loadSubscribers() {
    try {
        container.innerHTML = '<div class="loading">Loading subscribers...</div>';
        const data = await fetchNewsletterSubscribers(currentFilters);
        const subscribers = data.subscribers || [];
        if (!subscribers.length) {
            container.innerHTML = '<div class="empty-state">No subscribers found.</div>';
            return;
        }
        container.innerHTML = `
            <table class="data-table premium-table">
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Source</th>
                        <th>Subscribed</th>
                    </tr>
                </thead>
                <tbody>
                    ${subscribers.map((s) => `
                        <tr>
                            <td>${escapeHtml(s.email)}</td>
                            <td>${escapeHtml(s.name || '—')}</td>
                            <td><span class="status-badge ${s.status === 'SUBSCRIBED' ? 'status-active' : 'status-inactive'}">${escapeHtml(s.status)}</span></td>
                            <td>${escapeHtml(s.source || 'FOOTER')}</td>
                            <td>${escapeHtml(new Date(s.subscribedAt).toLocaleDateString())}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <p class="table-meta">Showing ${subscribers.length} of ${data.total} subscribers.</p>
        `;
    } catch (error) {
        container.innerHTML = `<div class="error">${escapeHtml(error.message)}</div>`;
    }
}

applyFiltersBtn.addEventListener('click', () => {
    currentFilters = {
        status: statusFilter.value,
        search: searchInput.value.trim()
    };
    loadSubscribers();
});

resetFiltersBtn.addEventListener('click', () => {
    statusFilter.value = 'all';
    searchInput.value = '';
    currentFilters = { status: 'all', search: '' };
    loadSubscribers();
});

searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        currentFilters.search = searchInput.value.trim();
        loadSubscribers();
    }
});

loadCounts();
loadSubscribers();
