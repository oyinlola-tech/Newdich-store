export function formatCurrency(amount) {
    const value = Number(amount);
    if (Number.isNaN(value)) return 'â‚¦0.00';
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}


