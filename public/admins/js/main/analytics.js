import { fetchAnalyticsStats, fetchTopProducts, fetchTopCustomers, fetchTopSearches, fetchSalesSeries } from '../../api/main/admin-analytics.js';
import { checkAdminAuth } from './admin.js';
import { formatCurrency } from './format.js';
import { escapeHtml } from './sanitize.js';

if (!checkAdminAuth()) {
  throw new Error('Admin auth check failed');
}

const rangeSelect = document.getElementById('analytics-range');
const refreshBtn = document.getElementById('refresh-analytics');
const statsContainer = document.getElementById('analytics-stats');
const revenueCanvas = document.getElementById('revenue-chart');
const topProductsList = document.getElementById('top-products-list');
const topCustomersList = document.getElementById('top-customers-list');
const topSearchesList = document.getElementById('top-searches-list');

async function loadAnalytics() {
  try {
    const days = Number(rangeSelect.value) || 30;
    const [stats, topProducts, topCustomers, topSearches, sales] = await Promise.all([
      fetchAnalyticsStats(days),
      fetchTopProducts(),
      fetchTopCustomers(),
      fetchTopSearches(days),
      fetchSalesSeries(days)
    ]);

    renderStats(stats);
    renderRevenueChart(sales.series || []);
    renderTopProducts(topProducts.products || []);
    renderTopCustomers(topCustomers.customers || []);
    renderTopSearches(topSearches.terms || []);
  } catch (error) {
    statsContainer.innerHTML = `<div class="error">Failed to load analytics: ${escapeHtml(error.message)}</div>`;
  }
}

function renderStats(stats) {
  statsContainer.innerHTML = `
    <div class="stat-card">
      <i class="fas fa-shopping-cart"></i>
      <h3>Total Orders</h3>
      <div class="stat-value">${escapeHtml(String(stats.totalOrders || 0))}</div>
    </div>
    <div class="stat-card">
      <i class="fas fa-box"></i>
      <h3>Total Products</h3>
      <div class="stat-value">${escapeHtml(String(stats.totalProducts || 0))}</div>
    </div>
    <div class="stat-card">
      <i class="fas fa-users"></i>
      <h3>Total Customers</h3>
      <div class="stat-value">${escapeHtml(String(stats.totalCustomers || 0))}</div>
    </div>
    <div class="stat-card">
      <i class="fas fa-naira-sign"></i>
      <h3>Revenue</h3>
      <div class="stat-value">${escapeHtml(formatCurrency(stats.totalRevenue || 0))}</div>
    </div>
  `;
}

function renderRevenueChart(series) {
  if (!revenueCanvas || !series.length) return;
  const ctx = revenueCanvas.getContext('2d');
  const width = revenueCanvas.width;
  const height = revenueCanvas.height;
  const max = Math.max(...series.map((s) => s.revenue), 1);
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const step = chartWidth / (series.length - 1);

  ctx.clearRect(0, 0, width, height);

  ctx.beginPath();
  ctx.strokeStyle = '#4f46e5';
  ctx.lineWidth = 2;
  series.forEach((point, i) => {
    const x = padding + i * step;
    const y = height - padding - (point.revenue / max) * chartHeight;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  ctx.fillStyle = '#4f46e5';
  series.forEach((point, i) => {
    const x = padding + i * step;
    const y = height - padding - (point.revenue / max) * chartHeight;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  });
}

function renderTopProducts(products) {
  if (!topProductsList) return;
  if (!products.length) {
    topProductsList.innerHTML = '<p class="muted-text">No data yet.</p>';
    return;
  }
  topProductsList.innerHTML = `
    <table class="data-table premium-table">
      <thead><tr><th>Product</th><th>Units Sold</th><th>Revenue</th></tr></thead>
      <tbody>
        ${products.map((p) => `
          <tr>
            <td>${escapeHtml(p.name)}</td>
            <td>${escapeHtml(String(p.unitsSold || 0))}</td>
            <td>${escapeHtml(formatCurrency(p.revenue || 0))}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function renderTopCustomers(customers) {
  if (!topCustomersList) return;
  if (!customers.length) {
    topCustomersList.innerHTML = '<p class="muted-text">No data yet.</p>';
    return;
  }
  topCustomersList.innerHTML = `
    <table class="data-table premium-table">
      <thead><tr><th>Customer</th><th>Orders</th><th>Total Spent</th></tr></thead>
      <tbody>
        ${customers.map((c) => `
          <tr>
            <td>${escapeHtml(c.name)}<br><small>${escapeHtml(c.email)}</small></td>
            <td>${escapeHtml(String(c.orders || 0))}</td>
            <td>${escapeHtml(formatCurrency(c.totalSpent || 0))}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function renderTopSearches(terms) {
  if (!topSearchesList) return;
  if (!terms.length) {
    topSearchesList.innerHTML = '<p class="muted-text">No data yet.</p>';
    return;
  }
  topSearchesList.innerHTML = `
    <table class="data-table premium-table">
      <thead><tr><th>Search Term</th><th>Count</th></tr></thead>
      <tbody>
        ${terms.map((t) => `
          <tr>
            <td>${escapeHtml(t.query)}</td>
            <td>${escapeHtml(String(t.count || 0))}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

refreshBtn.addEventListener('click', loadAnalytics);
rangeSelect.addEventListener('change', loadAnalytics);

document.addEventListener('DOMContentLoaded', () => {
  loadAnalytics();
});
