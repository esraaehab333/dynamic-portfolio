import { API_URL } from '../config.js';
import { trapFocus, initModalParticles, initConfetti } from '../core/utils.js';

export const id = 'contact';

export function render(data) {
    const mount = document.getElementById('contact-mount');
    if (!mount) return;

    const contact = data.contact || {};
    const contacts = data.contacts || [];
    const socials = data.socials || [];

    const contactsHtml = contacts.map(c => {
        const isEmail = c.label?.toLowerCase().includes('email');
        let url = c.url || '#';
        if (isEmail && url !== '#' && !url.startsWith('mailto:')) url = `mailto:${url}`;
        return `
        <a href="${url}" class="contact-method reveal" target="_blank">
            <div class="method-icon"><i class="ph ${c.icon}"></i></div>
            <div class="method-label">${c.label}</div>
        </a>
        `;
    }).join('');

    const socialsHtml = socials.map(s => `
        <a href="${s.url}" class="contact-method reveal" target="_blank">
            <div class="method-icon"><i class="ph ${s.icon}"></i></div>
            <div class="method-label">${s.name || ''}</div>
        </a>
    `).join('');

    const isVisible = data.sectionsVisibility?.contact !== false;

    mount.innerHTML = `
    <section id="contact" class="section-padding" style="${isVisible ? '' : 'display: none;'}">
        <div class="container">
            <div class="section-label" style="margin-bottom: 24px;">Get In Touch</div>

            <div class="contact-grid">
                <div class="contact-left">
                    <h2 data-key="contact.title">${contact.title || "Let's Create Something Amazing Together"}</h2>
                    <p data-key="contact.subtitle">${contact.subtitle || "Have a project in mind or just want to say hello? I'd love to hear from you."}</p>

                    <div id="contact-methods-container">
                        ${contactsHtml}
                    </div>

                    <div class="contact-socials" id="social-links-container">
                        ${socialsHtml}
                    </div>
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
                        <div class="form-group">
                            <label>Subject</label>
                            <input type="text" name="subject" placeholder="What is this about?" class="form-input" required>
                        </div>
                        <div style="display:none;">
                            <input type="text" name="honeypot" tabindex="-1" autocomplete="off">
                        </div>
                        <div class="form-group">
                            <label>Your Message</label>
                            <textarea name="message" placeholder="Tell me about your project..." class="form-input" rows="5" required></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center;">Send Message</button>
                    </form>
                </div>
            </div>
        </div>
    </section>
    `;
}

export function init() {
    setupContactForm();
}

function setupContactForm() {
    const form = document.getElementById('main-contact-form');
    const modal = document.getElementById('submission-modal');
    if (!form || !modal) return;

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
        const originalHTML = btn.innerHTML;

        btn.classList.add('btn-loading');
        btn.innerHTML = '<span></span>';
        showState('sending');

        const formData = new FormData(form);
        const formValues = Object.fromEntries(formData.entries());
        const { name, email, subject, message } = formValues;

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
                showState('error');
            }
        } catch (error) {
            showState('error');
        } finally {
            btn.classList.remove('btn-loading');
            btn.innerHTML = originalHTML;
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
