import { API_BASE_URL, getHeaders } from '../../api/main/config.js';

const PROVIDER_LABELS = {
    paystack: 'Paystack',
    flutterwave: 'Flutterwave',
    nomba: 'Nomba',
    stripe: 'Stripe'
};

let currentProvider = null;
let statusData = { pinSet: false, unlocked: false };

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = String(text ?? '');
    return div.innerHTML;
}

async function api(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        headers: getHeaders(),
        ...options
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.message || `Request failed (${response.status})`);
    }
    return data;
}

function showMessage(elementId, text, ok = true) {
    const el = document.getElementById(elementId);
    el.textContent = text;
    el.style.display = 'block';
    el.style.color = ok ? '#166534' : '#b91c1c';
}

function hideMessage(elementId) {
    const el = document.getElementById(elementId);
    el.style.display = 'none';
}

function openModal(id) {
    document.getElementById(id).style.display = 'block';
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
    hideMessage(`${id.replace('-modal', '')}-message`);
}

function renderBanners() {
    document.getElementById('lock-banner').style.display = statusData.unlocked ? 'none' : 'block';
    document.getElementById('unlocked-banner').style.display = statusData.unlocked ? 'block' : 'none';
    document.getElementById('pin-banner').style.display = !statusData.pinSet ? 'block' : 'none';
}

async function loadStatus() {
    statusData = await api('/admin/payments/settings');
    renderBanners();
}

async function loadProviders() {
    const container = document.getElementById('providers-container');
    container.innerHTML = '<div class="loading">Loading payment providers...</div>';
    const { providers } = await api('/admin/payments/settings/providers');
    renderProviders(container, providers);
}

function renderProviders(container, providers) {
    if (!providers) {
        container.innerHTML = '<p class="muted-text">No provider data.</p>';
        return;
    }
    container.innerHTML = Object.entries(providers).map(([name, config]) => {
        const fields = config.configured || {};
        const chip = (label, ok) =>
            `<span class="chip ${ok ? 'chip-on' : 'chip-off'}">${label} ${ok ? '✓' : '—'}</span>`;
        return `
            <div class="dashboard-card provider-card" data-provider="${name}">
                <div class="card-head">
                    <div>
                        <h3>${PROVIDER_LABELS[name] || name}</h3>
                        <span class="muted-text">${config.enabled ? 'Accepting payments' : 'Disabled'}</span>
                    </div>
                    <div class="provider-status ${config.enabled ? 'status-on' : 'status-off'}">
                        ${config.enabled ? 'ACTIVE' : 'INACTIVE'}
                    </div>
                </div>
                <div class="provider-fields">
                    ${chip('Public key', !!fields.publicKey)}
                    ${chip('Secret key', !!fields.secretKey)}
                    ${chip('Webhook secret', !!fields.webhookSecret)}
                    ${chip('Account ID', !!fields.accountId)}
                </div>
                <p class="muted-text" id="preview-${name}">${config.publicKeyPreview ? `Key preview: ${config.publicKeyPreview}` : ''}</p>
                <div class="provider-actions">
                    <button class="btn-primary" data-action="edit" data-provider="${name}">Configure</button>
                    <button class="btn-secondary" data-action="toggle" data-provider="${name}">
                        ${config.enabled ? 'Disable' : 'Enable'}
                    </button>
                </div>
            </div>
        `;
    }).join('');

    container.querySelectorAll('[data-action="edit"]').forEach((btn) => {
        btn.addEventListener('click', () => openProviderModal(providers[btn.dataset.provider], btn.dataset.provider));
    });
    container.querySelectorAll('[data-action="toggle"]').forEach((btn) => {
        btn.addEventListener('click', async () => {
            const provider = btn.dataset.provider;
            const enabled = !providers[provider].enabled;
            try {
                const pin = window.prompt('Enter your pin to toggle this provider:');
                if (!pin) return;
                await api(`/admin/payments/settings/providers/${provider}/toggle`, {
                    method: 'PATCH',
                    body: JSON.stringify({ enabled, pin })
                });
                await loadStatus();
                await loadProviders();
            } catch (error) {
                alert(error.message);
            }
        });
    });
}

function openProviderModal(config, name) {
    currentProvider = name;
    document.getElementById('provider-modal-title').textContent = `Configure ${PROVIDER_LABELS[name] || name}`;
    document.getElementById('provider-enabled').value = config?.enabled ? 'true' : 'false';
    document.getElementById('provider-public-key').value = '';
    document.getElementById('provider-secret-key').value = '';
    document.getElementById('provider-webhook-secret').value = '';
    document.getElementById('provider-account-id').value = '';
    document.getElementById('provider-account-group').style.display = name === 'nomba' ? 'block' : 'none';

    const hint = (id, set) => {
        document.getElementById(id).textContent = set ? 'Stored (leave blank to keep)' : 'Not set yet';
    };
    hint('provider-public-key-hint', !!(config?.configured?.publicKey));
    hint('provider-secret-key-hint', !!(config?.configured?.secretKey));
    document.getElementById('provider-remove-btn').style.display = config ? 'block' : 'none';
    openModal('provider-modal');
}

async function saveProvider(e) {
    e.preventDefault();
    hideMessage('provider-message');
    const body = {
        enabled: document.getElementById('provider-enabled').value === 'true',
        publicKey: document.getElementById('provider-public-key').value.trim() || undefined,
        secretKey: document.getElementById('provider-secret-key').value.trim() || undefined,
        webhookSecret: document.getElementById('provider-webhook-secret').value.trim() || undefined,
        accountId: document.getElementById('provider-account-id').value.trim() || undefined,
        pin: document.getElementById('provider-pin').value.trim()
    };
    if (!body.pin) {
        showMessage('provider-message', 'Pin is required.', false);
        return;
    }
    try {
        await api(`/admin/payments/settings/providers/${currentProvider}`, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
        closeModal('provider-modal');
        await loadStatus();
        await loadProviders();
    } catch (error) {
        showMessage('provider-message', error.message, false);
    }
}

async function removeProvider() {
    if (!currentProvider) return;
    if (!window.confirm(`Remove ${PROVIDER_LABELS[currentProvider]} configuration?`)) return;
    const pin = window.prompt('Enter your pin to confirm removal:');
    if (!pin) return;
    try {
        await api(`/admin/payments/settings/providers/${currentProvider}`, {
            method: 'DELETE',
            body: JSON.stringify({ pin })
        });
        closeModal('provider-modal');
        await loadStatus();
        await loadProviders();
    } catch (error) {
        showMessage('provider-message', error.message, false);
    }
}

async function handlePinForm(e) {
    e.preventDefault();
    hideMessage('pin-message');
    const mode = document.getElementById('pin-modal-title').textContent.includes('Create') ? 'create' : 'change';
    const newPin = document.getElementById('new-pin').value.trim();
    const confirmPin = document.getElementById('confirm-pin').value.trim();
    if (newPin !== confirmPin) {
        showMessage('pin-message', 'Pins do not match.', false);
        return;
    }
    if (!/^\d{4}$|^\d{6}$/.test(newPin)) {
        showMessage('pin-message', 'Pin must be exactly 4 or 6 digits.', false);
        return;
    }
    try {
        if (mode === 'create') {
            await api('/admin/payments/settings/pin', {
                method: 'POST',
                body: JSON.stringify({ pin: newPin, confirmPin })
            });
        } else {
            const currentPin = document.getElementById('current-pin').value.trim();
            await api('/admin/payments/settings/pin', {
                method: 'PUT',
                body: JSON.stringify({ currentPin, newPin, confirmPin })
            });
        }
        closeModal('pin-modal');
        await loadStatus();
    } catch (error) {
        showMessage('pin-message', error.message, false);
    }
}

async function handleUnlockForm(e) {
    e.preventDefault();
    hideMessage('unlock-message');
    const pin = document.getElementById('unlock-pin').value.trim();
    if (!pin) {
        showMessage('unlock-message', 'Enter your pin.', false);
        return;
    }
    try {
        const result = await api('/admin/payments/settings/unlock', {
            method: 'POST',
            body: JSON.stringify({ pin })
        });
        document.getElementById('unlock-expiry').textContent = new Date(result.expiresAt).toLocaleString();
        closeModal('unlock-modal');
        await loadStatus();
        await loadProviders();
    } catch (error) {
        showMessage('unlock-message', error.message, false);
    }
}

async function init() {
    try {
        await loadStatus();
        await loadProviders();
    } catch (error) {
        const container = document.getElementById('providers-container');
        container.innerHTML = `<p class="error">${escapeHtml(error.message)}</p>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    init();

    document.getElementById('create-pin-btn').addEventListener('click', () => {
        document.getElementById('pin-modal-title').textContent = 'Create pin';
        document.getElementById('current-pin-group').style.display = 'none';
        document.getElementById('new-pin').value = '';
        document.getElementById('confirm-pin').value = '';
        openModal('pin-modal');
    });

    document.getElementById('change-pin-btn').addEventListener('click', () => {
        document.getElementById('pin-modal-title').textContent = 'Change pin';
        document.getElementById('current-pin-group').style.display = 'block';
        document.getElementById('current-pin').value = '';
        document.getElementById('new-pin').value = '';
        document.getElementById('confirm-pin').value = '';
        openModal('pin-modal');
    });

    document.getElementById('unlock-btn').addEventListener('click', () => {
        document.getElementById('unlock-pin').value = '';
        openModal('unlock-modal');
    });

    document.getElementById('lock-btn').addEventListener('click', async () => {
        try {
            await api('/admin/payments/settings/lock', { method: 'POST' });
            await loadStatus();
        } catch (error) {
            alert(error.message);
        }
    });

    document.getElementById('reload-btn').addEventListener('click', async () => {
        await loadStatus();
        await loadProviders();
    });

    document.getElementById('pin-form').addEventListener('submit', handlePinForm);
    document.getElementById('unlock-form').addEventListener('submit', handleUnlockForm);
    document.getElementById('provider-form').addEventListener('submit', saveProvider);
    document.getElementById('provider-remove-btn').addEventListener('click', removeProvider);

    document.querySelectorAll('[data-close]').forEach((btn) => {
        btn.addEventListener('click', () => closeModal(btn.dataset.close));
    });
});
