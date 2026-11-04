import { API_URL } from '../config.js';
import { trapFocus, initModalParticles, initConfetti, safeUrl, safeIcon, esc } from '../core/utils.js';
import { contactHref, contactValue, contactKind, escapeHtml } from '../core/contact-links.js';

export const id = 'contact';

export function render(data) {
    const mount = document.getElementById('contact-mount');
    if (!mount) return;

    const contact = data.contact || {};
    const isVisible = data.sectionsVisibility?.contact !== false;

    mount.innerHTML = `
    <section id="contact" class="section-padding" style="${isVisible ? '' : 'display: none;'}">
        <div class="container">
            <div class="contact-grid">
                <div class="contact-left">
                    <div class="contact-availability" data-key="contact.availability"><span class="dot"></span>${escapeHtml(contact.availability || 'Open to new opportunities')}</div>
                    <h2 data-key="contact.title">${escapeHtml(contact.title || "Let's Create Something Amazing Together")}</h2>
                    <p data-key="contact.subtitle">${escapeHtml(contact.subtitle || "Have a project in mind or just want to say hello? I'd love to hear from you.")}</p>
                    <p class="contact-trust" data-key="contact.response"><i class="ph ph-clock" aria-hidden="true"></i><span>${escapeHtml(contact.response || 'I usually reply within 24 hours · Cairo, GMT+2')}</span></p>
                    <div id="contact-methods-container"></div>
                </div>

                <div class="contact-right">
                    <form class="contact-form" id="main-contact-form" action="https://formspree.io/f/YOUR_ID_HERE" method="POST">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Your Name</label>
                                <input type="text" name="name" placeholder="Your Name" class="form-input" required>
                            </div>
                            <div class="form-group">
                                <label>Your Email</label>
                                <input type="email" name="email" placeholder="your@email.com" class="form-input" required>
                            </div>
                        </div>
                        <div style="display:none;">
                            <input type="text" name="honeypot" tabindex="-1" autocomplete="off">
                        </div>
                        <div class="form-group contact-message-group">
                            <label>Your Message</label>
                            <textarea name="message" placeholder="Tell me about your project..." class="form-input" rows="5" required></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center;">Send Message <i class="ph ph-paper-plane-tilt"></i></button>
                        <p class="contact-form-error" role="alert" hidden>Couldn't send. Please try again or email me directly.</p>
                    </form>
                </div>
            </div>
        </div>
    </section>
    `;
    renderContacts(data);
}

export function renderContacts(data) {
    const container = document.getElementById('contact-methods-container');
    if (!container) return;
    container.innerHTML = (data.contacts || []).map(contact => {
        const value = contactValue(contact);
        const href = contactHref(contact, data);
        if (!value || !href) return '';
        const kind = contactKind(contact);
        const isLink = /^https?:\/\//i.test(href);
        const isPhone = /phone/i.test(contact.label || '') || /^\+?[\d\s()-]{7,}$/.test(value.trim());
        const external = isLink && !isPhone;
        const iconRaw = contact.icon || (kind === 'email' ? 'ph-envelope-simple' : kind === 'phone' || isPhone ? 'ph-phone' : 'ph-link');
        const icon = safeIcon(iconRaw) || 'ph-link';
        const label = escapeHtml(contact.label || 'Contact');
        const safeVal = escapeHtml(value);
        const rowHref = isPhone ? '#' : (external ? (safeUrl(href) || '#') : escapeHtml(href));
        const rowValue = isPhone ? 'Show number' : safeVal;
        const action = isPhone
            ? `<button type="button" class="contact-reveal" aria-label="Show ${label}" data-reveal="${safeVal}">Show</button>`
            : isLink
                ? '<span class="contact-go" aria-hidden="true"><i class="ph ph-arrow-up-right"></i></span>'
                : `<button class="contact-copy" type="button" data-copy="${safeVal}" aria-label="Copy ${label}"><i class="ph ph-copy" aria-hidden="true"></i></button>`;
        return `<div class="contact-row reveal"${isPhone ? ' data-phone-row="true"' : ''}><a class="contact-row-link" href="${rowHref}" ${external ? 'target="_blank" rel="noopener noreferrer"' : ''}><span class="contact-row-icon"><i class="ph ${icon}" aria-hidden="true"></i></span><span class="contact-row-copy"><span class="contact-row-label">${label}</span><span class="contact-row-value">${rowValue}</span></span></a>${action}</div>`;
    }).join('');
    container.querySelectorAll('.contact-reveal').forEach(button => button.addEventListener('click', () => revealPhone(button)));
    container.querySelectorAll('.contact-row[data-phone-row="true"] .contact-row-link').forEach(link => link.addEventListener('click', event => {
        if (link.getAttribute('href') === '#') {
            event.preventDefault();
            revealPhone(link.closest('.contact-row').querySelector('.contact-reveal'));
        }
    }));
    container.querySelectorAll('.contact-copy').forEach(attachCopyHandler);
}

function attachCopyHandler(button) {
    button.addEventListener('click', async () => {
        try {
            const value = button.dataset.copy || '';
            if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(value);
            else {
                const field = document.createElement('textarea');
                field.value = value;
                field.style.position = 'fixed';
                field.style.opacity = '0';
                document.body.appendChild(field);
                field.select();
                const copied = document.execCommand('copy');
                field.remove();
                if (!copied) throw new Error('Copy failed');
            }
            button.innerHTML = '<i class="ph ph-check" aria-hidden="true"></i>';
            button.classList.add('is-copied');
            window.setTimeout(() => { button.innerHTML = '<i class="ph ph-copy" aria-hidden="true"></i>'; button.classList.remove('is-copied'); }, 1500);
        } catch { button.setAttribute('aria-label', 'Copy is unavailable'); }
    });
}

function revealPhone(button) {
    if (!button) return;
    const row = button.closest('.contact-row');
    const link = row?.querySelector('.contact-row-link');
    const valueNode = row?.querySelector('.contact-row-value');
    const value = button.dataset.reveal || '';
    if (!row || !link || !valueNode || !value) return;
    valueNode.textContent = value;
    link.href = `tel:${value}`;
    const label = escapeHtml(row.querySelector('.contact-row-label')?.textContent || 'Phone');
    button.outerHTML = `<button class="contact-copy" type="button" data-copy="${escapeHtml(value)}" aria-label="Copy ${label}"><i class="ph ph-copy" aria-hidden="true"></i></button>`;
    attachCopyHandler(row.querySelector('.contact-copy'));
}

export function init() {
    setupContactForm();
}

function setupContactForm() {
    const form = document.getElementById('main-contact-form');
    const modal = document.getElementById('submission-modal');
    if (!form || !modal) return;
    const errorMessage = form.querySelector('.contact-form-error');

    const showState = (state) => {
        modal.querySelectorAll('.modal-state').forEach(s => s.style.display = 'none');
        const target = document.getElementById(`modal-state-${state}`);
        if (target) {
            target.style.display = 'flex';
            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
            trapFocus(modal);

            if (state === 'sending') initModalParticles();
            if (state === 'success') initConfetti();
        }
    };

    const closeModal = () => {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        const containers = modal.querySelectorAll('.modal-particles, .confetti-container');
        containers.forEach(c => c.innerHTML = '');
    };

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });

    modal.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.onclick = closeModal;
    });

    const handleSubmit = async () => {
        const btn = form.querySelector('button[type="submit"]');
        if (!btn) return;
        if (errorMessage) errorMessage.hidden = true;
        btn.disabled = true;
        btn.setAttribute('aria-busy', 'true');
        btn.innerHTML = 'Sending… <i class="ph ph-paper-plane-tilt"></i>';
        showState('sending');

        const formData = new FormData(form);
        const formValues = Object.fromEntries(formData.entries());
        const { name, email, message } = formValues;
        const subject = formValues.subject || 'Portfolio contact';

        try {
            const response = await fetch(`${API_URL}/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    email,
                    subject,
                    message,
                    honeypot: formValues.honeypot || ''
                })
            });

            if (response.ok) {
                showState('success');
                form.reset();
                setTimeout(closeModal, 5000);
            } else {
                closeModal();
                if (errorMessage) errorMessage.hidden = false;
            }
        } catch (error) {
            closeModal();
            if (errorMessage) errorMessage.hidden = false;
        } finally {
            btn.disabled = false;
            btn.removeAttribute('aria-busy');
            btn.innerHTML = 'Send Message <i class="ph ph-paper-plane-tilt"></i>';
        }
    };

    const retryBtn = modal.querySelector('.modal-retry-btn');
    if (retryBtn) retryBtn.onclick = () => {
        closeModal();
        setTimeout(handleSubmit, 300);
    };

    form.onsubmit = (e) => {
        e.preventDefault();
        handleSubmit();
    };
}
