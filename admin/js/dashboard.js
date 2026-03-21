import { fetchDashboardStats, fetchRecentOrders } from '../api/admin-stats.js';
import { checkAdminAuth } from './admin.js';
import { formatCurrency } from './format.js';

// Ensure admin is logged in
if (!checkAdminAuth()) {
    // Redirect already handled in checkAdminAuth
}

const statsContainer = document.getElementById('stats-container');
const recentOrdersContainer = document.getElementById('recent-orders-container');
const kpiAmountEl = document.getElementById('kpi-amount');
const kpiChangeEl = document.getElementById('kpi-change');
const kpiChangeValueEl = document.getElementById('kpi-change-value');
const kpiChangeIconEl = document.getElementById('kpi-change-icon');
const kpiLineEl = document.getElementById('kpi-line');
const kpiLineSecondaryEl = document.getElementById('kpi-line-secondary');
const kpiGlowEl = document.getElementById('kpi-glow');

function normalizeSeries(series) {
    if (!Array.isArray(series)) return [];
    return series.map(Number).filter((value) => Number.isFinite(value));
}

function resolveKpiSeries(stats) {
    const primary = normalizeSeries(
        stats.revenueTrend ||
        stats.kpiTrend ||
        stats.dailyRevenue ||
        stats.salesTrend ||
        []
    );
    const secondary = normalizeSeries(
        stats.revenueForecast ||
        stats.kpiForecast ||
        stats.salesForecast ||
        []
    );
    return { primary, secondary };
}

function resolveKpiAmount(stats, primarySeries) {
    if (Number.isFinite(stats.revenue)) return stats.revenue;
    if (Number.isFinite(stats.kpiValue)) return stats.kpiValue;
    if (primarySeries.length) return primarySeries[primarySeries.length - 1];
    return 0;
}

function resolveKpiChange(stats, primarySeries) {
    const direct =
        stats.revenueChangePct ??
        stats.revenueChangePercent ??
        stats.kpiChangePct ??
        stats.kpiChangePercent;

    if (Number.isFinite(direct)) return direct;
    if (Number.isFinite(stats.revenue) && Number.isFinite(stats.revenuePrevious) && stats.revenuePrevious !== 0) {
        return ((stats.revenue - stats.revenuePrevious) / stats.revenuePrevious) * 100;
    }
    if (primarySeries.length >= 2 && primarySeries[primarySeries.length - 2] !== 0) {
        const latest = primarySeries[primarySeries.length - 1];
        const previous = primarySeries[primarySeries.length - 2];
        return ((latest - previous) / previous) * 100;
    }
    return 0;
}

function buildLinePath(series, width = 240, height = 80, padding = 10) {
    if (series.length < 2) return '';
    const min = Math.min(...series);
    const max = Math.max(...series);
    const range = max - min || 1;
    const step = (width - padding * 2) / (series.length - 1);

    return series
        .map((value, index) => {
            const x = padding + index * step;
            const y = height - padding - ((value - min) / range) * (height - padding * 2);
            return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
        })
        .join(' ');
}

function updateKpiVisuals(stats) {
    if (!kpiAmountEl || !kpiLineEl || !kpiGlowEl) return;

    const { primary, secondary } = resolveKpiSeries(stats);
    const primarySeries = primary.length >= 2 ? primary : primary.length === 1 ? [primary[0], primary[0]] : [0, 0];
    const secondarySeries = secondary.length >= 2 ? secondary : [];

    const amount = resolveKpiAmount(stats, primarySeries);
    const change = resolveKpiChange(stats, primarySeries);

    kpiAmountEl.textContent = formatCurrency(amount);

    if (kpiChangeEl && kpiChangeValueEl && kpiChangeIconEl) {
        const isPositive = change >= 0;
        kpiChangeEl.classList.toggle('positive', isPositive);
        kpiChangeEl.classList.toggle('negative', !isPositive);
        kpiChangeIconEl.className = isPositive ? 'fas fa-arrow-up' : 'fas fa-arrow-down';
        kpiChangeValueEl.textContent = `${Math.abs(change).toFixed(1)}%`;
    }

    const primaryPath = buildLinePath(primarySeries);
    kpiLineEl.setAttribute('d', primaryPath);
    kpiGlowEl.setAttribute('d', primaryPath);

    if (kpiLineSecondaryEl) {
        if (secondarySeries.length >= 2) {
            kpiLineSecondaryEl.style.display = 'block';
            kpiLineSecondaryEl.setAttribute('d', buildLinePath(secondarySeries));
        } else {
            kpiLineSecondaryEl.style.display = 'none';
            kpiLineSecondaryEl.setAttribute('d', '');
        }
    }
}

async function loadStats() {
    try {
        const stats = await fetchDashboardStats();
        statsContainer.innerHTML = `
            <div class="stat-card">
                <i class="fas fa-shopping-cart"></i>
                <h3>Total Orders</h3>
                <div class="stat-value">${stats.totalOrders || 0}</div>
            </div>
            <div class="stat-card">
                <i class="fas fa-box"></i>
                <h3>Total Products</h3>
                <div class="stat-value">${stats.totalProducts || 0}</div>
            </div>
            <div class="stat-card">
                <i class="fas fa-users"></i>
                <h3>Total Users</h3>
                <div class="stat-value">${stats.totalUsers || 0}</div>
            </div>
            <div class="stat-card">
                <i class="fas fa-naira-sign"></i>
                <h3>Revenue</h3>
                <div class="stat-value">${formatCurrency(stats.revenue || 0)}</div>
            </div>
        `;
        updateKpiVisuals(stats || {});
    } catch (error) {
        statsContainer.innerHTML = '<div class="error">Failed to load stats</div>';
    }
}

async function loadRecentOrders() {
    try {
        const orders = await fetchRecentOrders(5);
        if (!orders.length) {
            recentOrdersContainer.innerHTML = '<h3>Recent Orders</h3><div class="empty-state">Orders will appear here once customers start checking out.</div>';
            return;
        }

        const tableHtml = `
            <table class="orders-table premium-table">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${orders.map(order => `
                        <tr>
                            <td>#${order.id}</td>
                            <td>${escapeHtml(order.customerName)}</td>
                            <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                            <td>${formatCurrency(order.total)}</td>
                            <td><span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div style="margin-top: 1rem; text-align: right;">
                <a href="orders.html" class="view-all">View All Orders →</a>
            </div>
        `;
        recentOrdersContainer.innerHTML = `<h3>Recent Orders</h3>${tableHtml}`;
    } catch (error) {
        recentOrdersContainer.innerHTML = '<h3>Recent Orders</h3><div class="error">Failed to load recent orders</div>';
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    loadRecentOrders();
});
