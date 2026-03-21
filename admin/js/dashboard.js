import { fetchDashboardStats, fetchRecentOrders } from '../api/admin-stats.js';
import { checkAdminAuth } from './admin.js';
import { formatCurrency } from './format.js';

// Ensure admin is logged in
if (!checkAdminAuth()) {
    // Redirect already handled in checkAdminAuth
}

const statsContainer = document.getElementById('stats-container');
const recentOrdersContainer = document.getElementById('recent-orders-container');

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
    } catch (error) {
        statsContainer.innerHTML = '<div class="error">Failed to load stats</div>';
    }
}

async function loadRecentOrders() {
    try {
        const orders = await fetchRecentOrders(5);
        if (!orders.length) {
            recentOrdersContainer.innerHTML = '<h3>Recent Orders</h3><div class="empty-state">No recent orders yet.</div>';
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
