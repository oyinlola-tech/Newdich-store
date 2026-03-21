import { fetchContactMessages, fetchContactMessageById, updateContactStatus, replyToContactMessage } from '../api/admin-contact.js';
import { checkAdminAuth } from './admin.js';

if (!checkAdminAuth()) return;

const contactContainer = document.getElementById('contact-container');
const statusFilter = document.getElementById('status-filter');
const searchFilter = document.getElementById('search-filter');
const applyFiltersBtn = document.getElementById('apply-filters');
const resetFiltersBtn = document.getElementById('reset-filters');
const modal = document.getElementById('contact-modal');
const closeModal = modal.querySelector('.close');
const contactDetailsContent = document.getElementById('contact-details-content');
const replyForm = document.getElementById('contact-reply-form');
const replyInput = document.getElementById('contact-reply');
const replyMessage = document.getElementById('contact-reply-message');

const statusModal = document.getElementById('contact-status-modal');
const statusClose = document.getElementById('contact-status-close');
const statusYes = document.getElementById('contact-status-yes');
const statusNo = document.getElementById('contact-status-no');
const statusText = document.getElementById('contact-status-text');

let currentFilters = { status: 'all', search: '' };
let pendingStatusChange = null;
let activeMessageId = null;

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
}

function getMessageId(message) {
    return message?.id || message?.messageId || message?._id || 'N/A';
}

function getMessageStatus(message) {
    return message?.status || 'open';
}

async function renderMessages(messages) {
    if (!messages || messages.length === 0) {
        contactContainer.innerHTML = '<div class="empty-state">No contact messages yet.</div>';
        return;
    }

    const tableHtml = `
        <table class="data-table premium-table">
            <thead>
                <tr>
                    <th>Message ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Subject</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${messages.map(message => {
                    const messageId = getMessageId(message);
                    const status = getMessageStatus(message);
                    return `
                        <tr>
                            <td>#${escapeHtml(messageId)}</td>
                            <td>${escapeHtml(message.name || message.fullName || 'Unknown')}</td>
                            <td>${escapeHtml(message.email || 'N/A')}</td>
                            <td>${escapeHtml(message.subject || 'General')}</td>
                            <td>${formatDate(message.createdAt || message.sentAt)}</td>
                            <td>
                                <select class="status-select" data-message-id="${escapeHtml(messageId)}" data-current-status="${escapeHtml(status)}">
                                    <option value="open" ${status === 'open' ? 'selected' : ''}>Open</option>
                                    <option value="pending" ${status === 'pending' ? 'selected' : ''}>Pending</option>
                                    <option value="resolved" ${status === 'resolved' ? 'selected' : ''}>Resolved</option>
                                </select>
                            </td>
                            <td class="actions">
                                <button class="btn-view" data-message-id="${escapeHtml(messageId)}"><i class="fas fa-eye"></i> View</button>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
    contactContainer.innerHTML = tableHtml;

    document.querySelectorAll('.status-select').forEach(select => {
        select.addEventListener('change', () => {
            const messageId = select.getAttribute('data-message-id');
            const newStatus = select.value;
            pendingStatusChange = { messageId, newStatus, select };
            statusText.textContent = `Update message #${messageId} to "${newStatus}"?`;
            statusModal.style.display = 'flex';
        });
    });

    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', async () => {
            const messageId = btn.getAttribute('data-message-id');
            await openContactModal(messageId);
        });
    });
}

async function openContactModal(messageId) {
    activeMessageId = messageId;
    replyForm.reset();
    replyMessage.style.display = 'none';
    modal.style.display = 'flex';
    contactDetailsContent.innerHTML = '<div class="loading">Loading message details...</div>';
    try {
        const message = await fetchContactMessageById(messageId);
        renderMessageDetails(message);
    } catch (error) {
        contactDetailsContent.innerHTML = '<div class="error">Failed to load message details.</div>';
    }
}

function renderMessageDetails(message) {
    contactDetailsContent.innerHTML = `
        <div class="order-info">
            <p><strong>Message ID:</strong> #${escapeHtml(getMessageId(message))}</p>
            <p><strong>Status:</strong> ${escapeHtml(getMessageStatus(message))}</p>
            <p><strong>Received:</strong> ${formatDate(message.createdAt || message.sentAt)}</p>
            <h4>Customer Information</h4>
            <p><strong>Name:</strong> ${escapeHtml(message.name || message.fullName || 'Unknown')}</p>
            <p><strong>Email:</strong> ${escapeHtml(message.email || 'N/A')}</p>
            <p><strong>Phone:</strong> ${escapeHtml(message.phone || message.mobile || 'N/A')}</p>
            <h4>Subject</h4>
            <p>${escapeHtml(message.subject || 'General')}</p>
            <h4>Message</h4>
            <p>${escapeHtml(message.message || message.body || message.content || '')}</p>
        </div>
    `;
}

async function loadMessages() {
    try {
        contactContainer.innerHTML = '<div class="loading">Loading messages...</div>';
        const messages = await fetchContactMessages(currentFilters);
        await renderMessages(messages);
    } catch (error) {
        contactContainer.innerHTML = '<div class="error">Failed to load messages. Please try again.</div>';
    }
}

function applyFilters() {
    currentFilters = {
        status: statusFilter.value,
        search: searchFilter.value.trim()
    };
    loadMessages();
}

function resetFilters() {
    statusFilter.value = 'all';
    searchFilter.value = '';
    currentFilters = { status: 'all', search: '' };
    loadMessages();
}

function closeStatusModal() {
    if (pendingStatusChange?.select) {
        pendingStatusChange.select.value = pendingStatusChange.select.getAttribute('data-current-status');
    }
    pendingStatusChange = null;
    statusModal.style.display = 'none';
}

applyFiltersBtn.addEventListener('click', applyFilters);
resetFiltersBtn.addEventListener('click', resetFilters);

closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
    if (e.target === statusModal) closeStatusModal();
});

statusYes.addEventListener('click', async () => {
    if (!pendingStatusChange) return;
    const { messageId, newStatus } = pendingStatusChange;
    statusModal.style.display = 'none';
    try {
        await updateContactStatus(messageId, newStatus);
        await loadMessages();
    } catch (error) {
        alert(error.message || 'Failed to update status');
    } finally {
        pendingStatusChange = null;
    }
});

statusNo.addEventListener('click', closeStatusModal);
statusClose.addEventListener('click', closeStatusModal);

replyForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!activeMessageId) return;
    const reply = replyInput.value.trim();
    if (!reply) return;
    try {
        await replyToContactMessage(activeMessageId, reply);
        replyMessage.textContent = 'Reply sent.';
        replyMessage.style.display = 'block';
        replyInput.value = '';
    } catch (error) {
        replyMessage.textContent = error.message || 'Failed to send reply.';
        replyMessage.style.display = 'block';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    loadMessages();
});


