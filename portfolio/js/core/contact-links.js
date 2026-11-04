export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

const kindOf = contact => {
    const label = String(contact?.label || '').toLowerCase();
    if (label.includes('email') || label.includes('mail')) return 'email';
    if (label.includes('phone') || label.includes('mobile') || label.includes('tel')) return 'phone';
    if (label.includes('github')) return 'github';
    if (label.includes('linkedin')) return 'linkedin';
    return 'link';
};

export const DEFAULT_EMAIL_SUBJECT = "Hello Esraa, I'd like to talk about an opportunity";
export const DEFAULT_EMAIL_BODY = `Hi Esraa,

I saw your portfolio and would love to connect regarding:

- Project / Role:
- Timeline:
- Details:

Best regards,`;

export function buildMailtoHref(email, subjectInput, bodyInput) {
    const subject = String(subjectInput ?? '').trim() || DEFAULT_EMAIL_SUBJECT;
    const body = String(bodyInput ?? '').trim() || DEFAULT_EMAIL_BODY;
    const normalizedBody = body.replace(/\r?\n/g, '\r\n');
    const fullUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(normalizedBody)}`;
    if (fullUrl.length > 1800) {
        return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    }
    return fullUrl;
}

export function contactValue(contact = {}) {
    return String(contact.value || contact.url || '').trim().replace(/^(mailto:|tel:)/i, '');
}

export function contactHref(contact = {}, data = null) {
    const value = contactValue(contact);
    if (!value) return '';
    const kind = kindOf(contact);
    if (kind === 'email') {
        const email = value.replace(/^mailto:/i, '');
        const subject = data?.contact?.emailSubject ?? contact?.emailSubject;
        const body = data?.contact?.emailBody ?? contact?.emailBody;
        return buildMailtoHref(email, subject, body);
    }
    if (kind === 'phone') return `tel:${value.replace(/^tel:/i, '')}`;
    const raw = String(contact.url || value).trim();
    if (/^https?:\/\//i.test(raw)) return raw;
    if (/^(?:github\.com|www\.github\.com|linkedin\.com|www\.linkedin\.com)\//i.test(raw)) return `https://${raw}`;
    return '';
}

export function contactKind(contact = {}) { return kindOf(contact); }
