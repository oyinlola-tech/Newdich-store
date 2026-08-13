import { fetchReturnRequests, fetchReturnById, updateReturnStatus, addReturnNote, approveRefund, fetchRefunds } from '../../api/main/admin-returns.js';
import { checkAdminAuth } from '../main/admin.js';
import { escapeHtml, escapeAttr } from '../main/sanitize.js';

if (!checkAdminAuth()) { throw new Error("Admin auth check failed"); }

const returnsContainer = document.getElementById('returns-container');
const statusFilter = document.getElementById('status-filter');
const searchFilter = document.getElementById('search-filter');
const applyFiltersBtn = document.getElementById('apply-filters');
const resetFiltersBtn = document.getElementById('reset-filters');
const modal = document.getElementById('returns-modal');
const closeModal = modal.querySelector('.close');
const returnDetailsContent = document.getElementById('return-details-content');
const returnNoteForm = document.getElementById('return-note-form');
const returnNoteInput = document.getElementById('return-note');
const returnNoteMessage = document.getElementById('return-note-message');

const statusModal = document.getElementById('returns-status-modal');
const statusClose = document.getElementById('returns-status-close');
const statusYes = document.getElementById('returns-status-yes');
const statusNo = document.getElementById('returns-status-no');
const statusText = document.getElementById('returns-status-text');

let currentFilters = { status: 'all', search: '' };
let pendingStatusChange = null;
let activeReturnId = null;

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
}

function getReturnId(returnItem) {
    return returnItem?.id || returnItem?.returnId || returnItem?._id || 'N/A';
}

function getOrderId(returnItem) {
    return returnItem?.orderId || returnItem?.order?.id || returnItem?.order?._id || 'N/A';
}

function getCustomerName(returnItem) {
    return (
        returnItem?.customerName ||
        returnItem?.customer?.name ||
        returnItem?.user?.name ||
        returnItem?.user?.fullName ||
        returnItem?.customer?.fullName ||
        'Unknown'
    );
}

function getReturnStatus(returnItem) {
    return returnItem?.status || 'pending';
}

function renderItemsList(items = []) {
    if (!items.length) {
        return '<div class="muted-text">No items listed for this return.</div>';
    }
    return `
        <div class="order-items-list">
            ${items.map(item => `
                <div class="order-detail-item">
                    <span class="item-name">${escapeHtml(item.product?.name || item.name || 'Item')}</span>
                    <span class="item-quantity">x${escapeHtml(item.quantity || 1)}</span>
                    <span class="item-price">${escapeHtml(item.price ?? 'N/A')}</span>
                    <span class="item-total">${escapeHtml(item.total ?? '')}</span>
                </div>
            `).join('')}
        </div>
    `;
}

async function renderReturns(returnsList) {
    if (!returnsList || returnsList.length === 0) {
        returnsContainer.innerHTML = '<div class="empty-state">No return requests yet.</div>';
        return;
    }

    const tableHtml = `
        <table class="data-table premium-table">
            <thead>
                <tr>
                    <th>Return ID</th>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${returnsList.map(returnItem => {
                    const returnId = getReturnId(returnItem);
                    const status = getReturnStatus(returnItem);
                    return `
                        <tr>
                            <td>#${escapeHtml(returnId)}</td>
                            <td>#${escapeHtml(getOrderId(returnItem))}</td>
                            <td>${escapeHtml(getCustomerName(returnItem))}</td>
                            <td>${formatDate(returnItem?.createdAt || returnItem?.requestedAt)}</td>
                            <td>
                                <select class="status-select" data-return-id="${escapeAttr(returnId)}" data-current-status="${escapeAttr(status)}">
                                    <option value="pending" ${status === 'pending' ? 'selected' : ''}>Pending</option>
                                    <option value="approved" ${status === 'approved' ? 'selected' : ''}>Approved</option>
                                    <option value="rejected" ${status === 'rejected' ? 'selected' : ''}>Rejected</option>
                                    <option value="received" ${status === 'received' ? 'selected' : ''}>Received</option>
                                    <option value="refunded" ${status === 'refunded' ? 'selected' : ''}>Refunded</option>
                                </select>
                            </td>
                            <td class="actions">
                                <button class="btn-view" data-return-id="${escapeAttr(returnId)}"><i class="fas fa-eye"></i> View</button>
                                ${['APPROVED', 'PICKED_UP', 'REQUESTED'].includes(status.toUpperCase()) ? `
                                    <button class="btn-refund" data-return-id="${escapeAttr(returnId)}"><i class="fas fa-undo"></i> Refund</button>
                                ` : ''}
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
    returnsContainer.innerHTML = tableHtml;

    document.querySelectorAll('.status-select').forEach(select => {
        select.addEventListener('change', () => {
            const returnId = select.getAttribute('data-return-id');
            const newStatus = select.value;
            pendingStatusChange = { returnId, newStatus, select };
            statusText.textContent = `Update return #${returnId} to "${newStatus}"?`;
            statusModal.style.display = 'flex';
        });
    });

    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', async () => {
            const returnId = btn.getAttribute('data-return-id');
            await openReturnModal(returnId);
        });
    });

    document.querySelectorAll('.btn-refund').forEach(btn => {
        btn.addEventListener('click', () => {
            activeReturnId = btn.getAttribute('data-return-id');
            refundModal.style.display = 'flex';
        });
    });
}

const refundsContainer = document.getElementById('refunds-container');

function renderRefunds(refundsList) {
    if (!refundsList || refundsList.length === 0) {
        refundsContainer.innerHTML = '<div class="empty-state">No refunds issued yet.</div>';
        return;
    }

    refundsContainer.innerHTML = `
        <table class="data-table premium-table">
            <thead>
                <tr>
                    <th>Refund ID</th>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Method</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody>
                ${refundsList.map(refund => `
                    <tr>
                        <td>#${escapeHtml(refund.id || refund.refundId || 'N/A')}</td>
                        <td>#${escapeHtml(refund.return?.order?.orderNumber || refund.orderNumber || 'N/A')}</td>
                        <td>${escapeHtml(refund.user?.name || refund.customerName || 'N/A')}</td>
                        <td>${escapeHtml(formatMoney(refund.amount))}</td>
                        <td><span class="status-badge ${refund.status === 'COMPLETED' ? 'active' : ''}">${escapeHtml(refund.status || 'PENDING')}</span></td>
                        <td>${escapeHtml(refund.provider || 'Original payment method')}</td>
                        <td>${formatDate(refund.createdAt || refund.refundedAt)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function formatMoney(amount) {
    const value = Number(amount ?? 0);
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

async function openReturnModal(returnId) {
    activeReturnId = returnId;
    returnNoteForm.reset();
    returnNoteMessage.style.display = 'none';
    modal.style.display = 'flex';
    returnDetailsContent.innerHTML = '<div class="loading">Loading return details...</div>';
    try {
        const returnData = await fetchReturnById(returnId);
        renderReturnDetails(returnData);
    } catch (error) {
        returnDetailsContent.innerHTML = '<div class="error">Failed to load return details.</div>';
    }
}

function renderReturnDetails(returnData) {
    const returnId = getReturnId(returnData);
    const orderId = getOrderId(returnData);
    const reason = returnData?.reason || returnData?.returnReason || 'Not provided';
    const items = returnData?.items || returnData?.returnItems || [];
    const customerName = getCustomerName(returnData);
    const customerEmail = returnData?.customerEmail || returnData?.customer?.email || returnData?.user?.email || 'N/A';
    const customerPhone = returnData?.customerPhone || returnData?.customer?.phone || returnData?.user?.phone || 'N/A';

    returnDetailsContent.innerHTML = `
        <div class="order-info">
            <p><strong>Return ID:</strong> #${escapeHtml(returnId)}</p>
            <p><strong>Order ID:</strong> #${escapeHtml(orderId)}</p>
            <p><strong>Status:</strong> ${escapeHtml(getReturnStatus(returnData))}</p>
            <p><strong>Requested:</strong> ${formatDate(returnData?.createdAt || returnData?.requestedAt)}</p>
            <h4>Customer Information</h4>
            <p><strong>Name:</strong> ${escapeHtml(customerName)}</p>
            <p><strong>Email:</strong> ${escapeHtml(customerEmail)}</p>
            <p><strong>Phone:</strong> ${escapeHtml(customerPhone)}</p>
            <h4>Reason</h4>
            <p>${escapeHtml(reason)}</p>
            <h4>Items</h4>
            ${renderItemsList(items)}
        </div>
    `;
}

async function loadReturns() {
    try {
        returnsContainer.innerHTML = '<div class="loading">Loading returns...</div>';
        const returnsList = await fetchReturnRequests(currentFilters);
        await renderReturns(returnsList);
    } catch (error) {
        returnsContainer.innerHTML = '<div class="error">Failed to load returns. Please try again.</div>';
    }
}

function applyFilters() {
    currentFilters = {
        status: statusFilter.value,
        search: searchFilter.value.trim()
    };
    loadReturns();
}

function resetFilters() {
    statusFilter.value = 'all';
    searchFilter.value = '';
    currentFilters = { status: 'all', search: '' };
    loadReturns();
}

function closeStatusModal() {
    if (pendingStatusChange?.select) {
        pendingStatusChange.select.value = pendingStatusChange.select.getAttribute('data-current-status');
    }
    pendingStatusChange = null;
    statusModal.style.display = 'none';
}

const refundModal = document.getElementById('returns-refund-modal');
const refundForm = document.getElementById('returns-refund-form');
const refundAmount = document.getElementById('refund-amount');
const refundProvider = document.getElementById('refund-provider');
const refundMessage = document.getElementById('returns-refund-message');
const refundClose = document.getElementById('returns-refund-close');
const refundCancel = document.getElementById('returns-refund-cancel');

async function loadRefunds() {
    try {
        refundsContainer.innerHTML = '<div class="loading">Loading refunds...</div>';
        const refundsList = await fetchRefunds();
        renderRefunds(refundsList);
    } catch (error) {
        refundsContainer.innerHTML = '<div class="error">Failed to load refunds.</div>';
    }
}

refundForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!activeReturnId) return;
    const amount = Number(refundAmount.value);
    const provider = refundProvider.value.trim() || undefined;

    if (!amount || amount <= 0) {
        refundMessage.textContent = 'Enter a valid refund amount.';
        refundMessage.style.display = 'block';
        return;
    }

    const submitBtn = refundForm.querySelector('button[type="submit"]');
    refundMessage.style.display = 'none';
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Issuing refund...';

    try {
        await approveRefund(activeReturnId, amount, provider);
        refundModal.style.display = 'none';
        refundForm.reset();
        await loadReturns();
        await loadRefunds();
    } catch (error) {
        refundMessage.textContent = error.message || 'Failed to issue refund.';
        refundMessage.style.display = 'block';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

refundClose.addEventListener('click', () => {
    refundModal.style.display = 'none';
    refundMessage.style.display = 'none';
});

refundCancel.addEventListener('click', () => {
    refundModal.style.display = 'none';
    refundMessage.style.display = 'none';
});

applyFiltersBtn.addEventListener('click', applyFilters);
resetFiltersBtn.addEventListener('click', resetFilters);

closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
    if (e.target === statusModal) closeStatusModal();
    if (e.target === refundModal) refundModal.style.display = 'none';
});

statusYes.addEventListener('click', async () => {
    if (!pendingStatusChange) return;
    const { returnId, newStatus } = pendingStatusChange;
    statusModal.style.display = 'none';
    try {
        await updateReturnStatus(returnId, newStatus);
        await loadReturns();
    } catch (error) {
        alert(error.message || 'Failed to update status');
    } finally {
        pendingStatusChange = null;
    }
});

statusNo.addEventListener('click', closeStatusModal);
statusClose.addEventListener('click', closeStatusModal);

returnNoteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!activeReturnId) return;
    const note = returnNoteInput.value.trim();
    if (!note) return;
    try {
        await addReturnNote(activeReturnId, note);
        returnNoteMessage.textContent = 'Note added.';
        returnNoteMessage.style.display = 'block';
        returnNoteInput.value = '';
    } catch (error) {
        returnNoteMessage.textContent = error.message || 'Failed to add note.';
        returnNoteMessage.style.display = 'block';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    loadReturns();
    loadRefunds();
});


