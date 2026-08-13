import { saveCookiePreferences } from '../main/cookie-consent.js';

const saveBtn = document.getElementById('cookie-save');
const acceptAllBtn = document.getElementById('cookie-accept-all');
const rejectAllBtn = document.getElementById('cookie-reject-all');

if (saveBtn) {
    saveBtn.addEventListener('click', () => {
        const functional = document.getElementById('cookie-functional')?.checked ?? true;
        const analytics = document.getElementById('cookie-analytics')?.checked ?? false;
        const marketing = document.getElementById('cookie-marketing')?.checked ?? false;
        saveCookiePreferences({ functional, analytics, marketing });
    });
}

if (acceptAllBtn) {
    acceptAllBtn.addEventListener('click', () => {
        saveCookiePreferences({ functional: true, analytics: true, marketing: true });
    });
}

if (rejectAllBtn) {
    rejectAllBtn.addEventListener('click', () => {
        saveCookiePreferences({ functional: false, analytics: false, marketing: false });
    });
}
