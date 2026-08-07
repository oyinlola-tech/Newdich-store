export function isValidEmail(value) {
    const trimmed = value.trim();
    if (!trimmed || trimmed.length > 254) return false;
    if (/\s/.test(trimmed)) return false;
    const atIndex = trimmed.indexOf('@');
    if (atIndex <= 0 || atIndex !== trimmed.lastIndexOf('@')) return false;
    const localPart = trimmed.slice(0, atIndex);
    const domainPart = trimmed.slice(atIndex + 1);
    if (!localPart || !domainPart) return false;
    if (domainPart.startsWith('.') || domainPart.endsWith('.')) return false;
    if (!domainPart.includes('.')) return false;
    return true;
}
