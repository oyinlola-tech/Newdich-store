export function initPasswordToggles(root = document) {
    const inputs = Array.from(root.querySelectorAll('input[type="password"]'));
    inputs.forEach((input) => {
        if (input.dataset.toggleReady === '1') return;
        input.dataset.toggleReady = '1';

        const wrapper = input.closest('.form-group') || input.parentElement;
        if (wrapper) {
            wrapper.classList.add('password-field');
        }

        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'password-toggle';
        toggle.textContent = 'Show';
        toggle.setAttribute('aria-label', 'Show password');
        toggle.addEventListener('click', () => {
            const isHidden = input.type === 'password';
            input.type = isHidden ? 'text' : 'password';
            toggle.textContent = isHidden ? 'Hide' : 'Show';
            toggle.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
        });

        if (wrapper) {
            wrapper.appendChild(toggle);
        } else {
            input.insertAdjacentElement('afterend', toggle);
        }
    });
}
