const COOKIE_CONSENT_KEY = 'telente_cookie_consent';

function getCookieConsent() {
    try {
        const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
}

function setCookieConsent(preferences) {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
        ...preferences,
        timestamp: Date.now()
    }));
}

export function saveCookiePreferences(preferences) {
    setCookieConsent({
        essential: true,
        functional: preferences.functional ?? true,
        analytics: preferences.analytics ?? false,
        marketing: preferences.marketing ?? false
    });
    hideBanner();
}

function hideBanner() {
    const banner = document.getElementById('cookie-consent-banner');
    if (banner) {
        banner.remove();
    }
}

function createBanner() {
    if (getCookieConsent()) return;

    const banner = document.createElement('div');
    banner.id = 'cookie-consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: #0b1220;
        color: #e2e8f0;
        padding: 20px 0;
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.25);
        z-index: 9999;
        font-family: 'Manrope', sans-serif;
        border-top: 3px solid #1f4b99;
        animation: slideUp 0.4s ease-out;
    `;

    banner.innerHTML = `
        <div style="max-width: 1200px; margin: 0 auto; padding: 0 20px; display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap;">
            <div style="flex: 1 1 300px; min-width: 0;">
                <p style="margin: 0; font-size: 0.95rem; line-height: 1.5; font-weight: 500;">
                    We use cookies to improve your experience, analyze site traffic, and personalize content.
                    By clicking "Accept All", you consent to our use of cookies.
                </p>
            </div>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <button id="cookie-btn-settings" style="
                    background: transparent;
                    color: #e2e8f0;
                    border: 1px solid rgba(226, 232, 240, 0.3);
                    padding: 10px 20px;
                    border-radius: 9999px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    font-family: 'Manrope', sans-serif;
                    transition: background 0.2s, border-color 0.2s;
                " onmouseover="this.style.background='rgba(255,255,255,0.1)'; this.style.borderColor='rgba(226, 232, 240, 0.6)'" onmouseout="this.style.background='transparent'; this.style.borderColor='rgba(226, 232, 240, 0.3)'">Settings</button>
                <button id="cookie-btn-reject" style="
                    background: transparent;
                    color: #e2e8f0;
                    border: 1px solid rgba(226, 232, 240, 0.3);
                    padding: 10px 20px;
                    border-radius: 9999px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    font-family: 'Manrope', sans-serif;
                    transition: background 0.2s, border-color 0.2s;
                " onmouseover="this.style.background='rgba(255,255,255,0.1)'; this.style.borderColor='rgba(226, 232, 240, 0.6)'" onmouseout="this.style.background='transparent'; this.style.borderColor='rgba(226, 232, 240, 0.3)'">Reject All</button>
                <button id="cookie-btn-accept" style="
                    background: #1f4b99;
                    color: #fff;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 9999px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    font-family: 'Manrope', sans-serif;
                    transition: background 0.2s, transform 0.2s;
                " onmouseover="this.style.background='#163a77'; this.style.transform='translateY(-1px)'" onmouseout="this.style.background='#1f4b99'; this.style.transform='none'">Accept All</button>
            </div>
        </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        #cookie-consent-banner {
            font-family: 'Manrope', sans-serif;
        }
        #cookie-consent-banner button {
            white-space: nowrap;
        }
        @media (max-width: 640px) {
            #cookie-consent-banner > div {
                flex-direction: column;
                align-items: stretch;
                text-align: center;
            }
            #cookie-consent-banner > div > div:last-child {
                justify-content: center;
            }
        }
    `;

    document.head.appendChild(style);
    document.body.appendChild(banner);

    document.getElementById('cookie-btn-accept').addEventListener('click', () => {
        saveCookiePreferences({ functional: true, analytics: true, marketing: true });
    });

    document.getElementById('cookie-btn-reject').addEventListener('click', () => {
        saveCookiePreferences({ functional: false, analytics: false, marketing: false });
    });

    document.getElementById('cookie-btn-settings').addEventListener('click', () => {
        window.location.href = '/cookies';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    if (!getCookieConsent()) {
        createBanner();
    }
});
