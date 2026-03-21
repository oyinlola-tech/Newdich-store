const settingsForm = document.getElementById('settings-form');
const settingsMessage = document.getElementById('settings-message');

function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('userSettings') || '{}');
    if (settings.emailUpdates !== undefined) {
        document.getElementById('email-updates').checked = settings.emailUpdates;
    }
    if (settings.darkMode !== undefined) {
        document.getElementById('dark-mode').checked = settings.darkMode;
    }
}

function showMessage(message, type) {
    settingsMessage.textContent = message;
    settingsMessage.className = `profile-message ${type}`;
    settingsMessage.style.display = 'block';
    setTimeout(() => {
        settingsMessage.style.display = 'none';
    }, 3000);
}

settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const settings = {
        emailUpdates: document.getElementById('email-updates').checked,
        darkMode: document.getElementById('dark-mode').checked
    };
    localStorage.setItem('userSettings', JSON.stringify(settings));
    showMessage('Settings saved successfully.', 'success');
});

document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
});
