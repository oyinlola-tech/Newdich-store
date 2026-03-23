import { fetchDashboardStats, fetchRecentOrders } from '../api/admin-stats.js';
import { fetchAdminProfile } from '../api/admin-auth.js';
import { checkAdminAuth } from './admin.js';
import { formatCurrency } from './format.js';
import { escapeHtml } from './sanitize.js';
import { changeAdminPassword } from '../api/admin-password-change.js';
import { initPasswordToggles } from './password-toggle.js';

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
const salesChartEl = document.getElementById('sales-chart');
const topCategoriesEl = document.getElementById('top-categories');
const salesCardEl = document.getElementById('sales-card');
const categoriesCardEl = document.getElementById('categories-card');
const salesLegendEl = document.getElementById('sales-legend');

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

function resolveSalesSeries(stats) {
    return normalizeSeries(
        stats.salesTrend ||
        stats.revenueTrend ||
        stats.dailyRevenue ||
        stats.dailySales ||
        []
    );
}

function resolveSalesLabel(stats) {
    return stats.salesLabel || stats.revenueLabel || stats.trendLabel || 'Sales';
}

function resolveSalesLabels(stats, count) {
    const labels = stats.salesLabels || stats.revenueLabels || stats.dailyLabels;
    if (Array.isArray(labels) && labels.length) return labels;
    return Array.from({ length: count }, (_, i) => `Day ${i + 1}`);
}

function renderSalesChart(stats) {
    if (!salesChartEl) return;
    const series = resolveSalesSeries(stats);
    if (!series.length) {
        if (salesCardEl) salesCardEl.style.display = 'none';
        return;
    }
    if (salesCardEl) salesCardEl.style.display = '';

    const max = Math.max(...series, 1);
    const labels = resolveSalesLabels(stats, series.length);
    const barsHtml = series
        .map((value) => {
            const height = Math.max(5, Math.round((value / max) * 100));
            return `<span style="height: ${height}%"></span>`;
        })
        .join('');
    const labelsHtml = labels
        .slice(0, series.length)
        .map((label) => `<span>${escapeHtml(label)}</span>`)
        .join('');

    salesChartEl.innerHTML = `
        <div class="chart-bars">${barsHtml}</div>
        <div class="chart-labels">${labelsHtml}</div>
    `;

    if (salesLegendEl) {
        const label = resolveSalesLabel(stats);
        salesLegendEl.innerHTML = `<span><i class="legend-dot legend-primary"></i> ${escapeHtml(label)}</span>`;
    }
}

function resolveTopCategories(stats) {
    if (Array.isArray(stats.topCategories)) return stats.topCategories;
    if (Array.isArray(stats.categories)) return stats.categories;
    if (Array.isArray(stats.categoryBreakdown)) return stats.categoryBreakdown;
    return [];
}

function renderTopCategories(stats) {
    if (!topCategoriesEl) return;
    const categories = resolveTopCategories(stats);
    if (!categories.length) {
        if (categoriesCardEl) categoriesCardEl.style.display = 'none';
        return;
    }
    if (categoriesCardEl) categoriesCardEl.style.display = '';

    topCategoriesEl.innerHTML = categories
        .slice(0, 6)
        .map((item) => {
            const name = typeof item === 'string' ? item : item?.name || item?.category || 'Category';
            const value = typeof item === 'object' ? item?.share || item?.percent || item?.revenue : null;
            return `<span>${escapeHtml(value ? `${name} • ${value}` : name)}</span>`;
        })
        .join('');
}

async function loadStats() {
    try {
        const stats = await fetchDashboardStats();
        statsContainer.innerHTML = `
            <div class="stat-card">
                <i class="fas fa-shopping-cart"></i>
                <h3>Total Orders</h3>
                <div class="stat-value">${escapeHtml(stats.totalOrders || 0)}</div>
            </div>
            <div class="stat-card">
                <i class="fas fa-box"></i>
                <h3>Total Products</h3>
                <div class="stat-value">${escapeHtml(stats.totalProducts || 0)}</div>
            </div>
            <div class="stat-card">
                <i class="fas fa-users"></i>
                <h3>Total Users</h3>
                <div class="stat-value">${escapeHtml(stats.totalUsers || 0)}</div>
            </div>
            <div class="stat-card">
                <i class="fas fa-naira-sign"></i>
                <h3>Revenue</h3>
                <div class="stat-value">${escapeHtml(formatCurrency(stats.revenue || 0))}</div>
            </div>
        `;
        updateKpiVisuals(stats || {});
        renderSalesChart(stats || {});
        renderTopCategories(stats || {});
    } catch (error) {
        statsContainer.innerHTML = '<div class="error">Failed to load stats</div>';
        if (salesCardEl) salesCardEl.style.display = 'none';
        if (categoriesCardEl) categoriesCardEl.style.display = 'none';
    }
}

async function loadAdminName() {
    const nameEl = document.getElementById('admin-name');
    if (!nameEl) return;
    try {
        const admin = await fetchAdminProfile();
        nameEl.textContent = admin?.name || admin?.fullName || admin?.email || 'Admin';
    } catch (error) {
        nameEl.textContent = 'Admin';
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
                            <td>#${escapeHtml(order.id)}</td>
                            <td>${escapeHtml(order.customerName)}</td>
                            <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                            <td>${formatCurrency(order.total)}</td>
                            <td><span class="status-badge status-${safeStatusClass(order.status)}">${escapeHtml(order.status)}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div style="margin-top: 1rem; text-align: right;">
                <a href="/admin/orders" class="view-all">View All Orders â†’</a>
            </div>
        `;
        recentOrdersContainer.innerHTML = `<h3>Recent Orders</h3>${tableHtml}`;
    } catch (error) {
        recentOrdersContainer.innerHTML = '<h3>Recent Orders</h3><div class="error">Failed to load recent orders</div>';
    }
}

function safeStatusClass(status) {
    const normalized = String(status || '').toLowerCase();
    const allowed = ['pending', 'processing', 'completed', 'cancelled'];
    return allowed.includes(normalized) ? normalized : 'pending';
}

document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    loadRecentOrders();
    loadAdminName();
    initPasswordToggles();

    const passwordForm = document.getElementById('admin-password-form');
    const passwordMessage = document.getElementById('admin-password-message');
    if (passwordForm) {
        passwordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const currentPassword = document.getElementById('admin-current-password').value;
            const newPassword = document.getElementById('admin-new-password').value;
            const confirmPassword = document.getElementById('admin-confirm-password').value;

            passwordMessage.style.display = 'none';
            passwordMessage.className = 'success-message';

            if (!currentPassword || !newPassword || !confirmPassword) {
                passwordMessage.textContent = 'Please fill in all fields.';
                passwordMessage.className = 'error-message';
                passwordMessage.style.display = 'block';
                return;
            }
            if (newPassword.length < 6) {
                passwordMessage.textContent = 'New password must be at least 6 characters.';
                passwordMessage.className = 'error-message';
                passwordMessage.style.display = 'block';
                return;
            }
            if (newPassword !== confirmPassword) {
                passwordMessage.textContent = 'New passwords do not match.';
                passwordMessage.className = 'error-message';
                passwordMessage.style.display = 'block';
                return;
            }

            const submitBtn = passwordForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Updating...';
            submitBtn.disabled = true;

            try {
                await changeAdminPassword(currentPassword, newPassword);
                passwordMessage.textContent = 'Password updated successfully.';
                passwordMessage.className = 'success-message';
                passwordMessage.style.display = 'block';
                passwordForm.reset();
            } catch (error) {
                passwordMessage.textContent = error.message || 'Failed to update password.';
                passwordMessage.className = 'error-message';
                passwordMessage.style.display = 'block';
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});


