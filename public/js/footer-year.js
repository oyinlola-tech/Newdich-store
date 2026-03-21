document.addEventListener('DOMContentLoaded', () => {
    const year = new Date().getFullYear();
    const targets = document.querySelectorAll('.js-year');
    if (targets.length) {
        targets.forEach((el) => {
            el.textContent = String(year);
        });
        return;
    }

    const footerTextNodes = document.querySelectorAll('footer p');
    footerTextNodes.forEach((el) => {
        el.textContent = el.textContent.replace(/\b20\d{2}\b/, String(year));
    });
});
