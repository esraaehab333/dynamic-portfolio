export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

const kindOf = contact => {
    const label = String(contact?.label || '').toLowerCase();
    if (label.includes('email') || label.includes('mail')) return 'email';
    if (label.includes('phone') || label.includes('mobile') || label.includes('tel')) return 'phone';
    if (label.includes('github')) return 'github';
    if (label.includes('linkedin')) return 'linkedin';
    return 'link';
};

export function contactValue(contact = {}) {
    return String(contact.value || contact.url || '').trim().replace(/^(mailto:|tel:)/i, '');
}

export function contactHref(contact = {}) {
    const value = contactValue(contact);
    if (!value) return '';
    const kind = kindOf(contact);
    if (kind === 'email') return `mailto:${value.replace(/^mailto:/i, '')}`;
    if (kind === 'phone') return `tel:${value.replace(/^tel:/i, '')}`;
    const raw = String(contact.url || value).trim();
    if (/^https?:\/\//i.test(raw)) return raw;
    if (/^(?:github\.com|www\.github\.com|linkedin\.com|www\.linkedin\.com)\//i.test(raw)) return `https://${raw}`;
    return '';
}

export function contactKind(contact = {}) { return kindOf(contact); }
