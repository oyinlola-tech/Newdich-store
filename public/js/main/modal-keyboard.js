function initModalKeyboardNavigation() {
    document.querySelectorAll('.modal').forEach(modal => {
        if (modal.dataset.keyboardInitialized) return;
        modal.dataset.keyboardInitialized = 'true';

        const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                modal.style.display = 'none';
                return;
            }
            if (e.key !== 'Tab') return;

            const focusableElements = Array.from(modal.querySelectorAll(focusableSelector));
            if (focusableElements.length === 0) return;

            const firstFocusable = focusableElements[0];
            const lastFocusable = focusableElements[focusableElements.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    lastFocusable.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    firstFocusable.focus();
                    e.preventDefault();
                }
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', initModalKeyboardNavigation);
document.addEventListener('click', () => {
    setTimeout(initModalKeyboardNavigation, 0);
});
