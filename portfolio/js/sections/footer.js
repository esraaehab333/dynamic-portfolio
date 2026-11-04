import { contactHref, contactKind, escapeHtml } from '../core/contact-links.js';
import { safeUrl, esc } from '../core/utils.js';
import { getNavItems } from './navbar.js';

export const id = 'footer';

export function render(data) { renderFooter(data); }

export function renderFooter(data) {
    const mount = document.getElementById('footer-mount');
    if (!mount) return;
    const logo = escapeHtml(data.site?.logo || 'ESRAA EHAB');
    const tagline = escapeHtml(data.site?.tagline || '');
    const links = getNavItems(data)
        .map(({ label, id }) => `<li><a href="#${esc(id)}">${escapeHtml(label)}</a></li>`)
        .join('');
    const icon = { github: 'ph-github-logo', linkedin: 'ph-linkedin-logo', email: 'ph-envelope-simple', phone: 'ph-phone' };
    const contacts = (data.contacts || []).map(contact => {
        const href = contactHref(contact, data);
        if (!href) return '';
        const kind = contactKind(contact);
        const external = /^https?:/i.test(href);
        const safeH = external ? (safeUrl(href) || '#') : escapeHtml(href);
        return `<li><a href="${safeH}" ${external ? 'target="_blank" rel="noopener noreferrer"' : ''}><i class="ph ${icon[kind] || 'ph-link'}" aria-hidden="true"></i>${escapeHtml(contact.label || kind)}</a></li>`;
    }).join('');
    mount.innerHTML = `<footer class="site-footer"><div class="container"><div class="footer-top"><div class="footer-brand"><a href="#home" class="logo">${logo}</a>${tagline ? `<p data-key="site.tagline">${tagline}</p>` : ''}</div><div class="footer-col" role="navigation" aria-label="Footer"><h4>Explore</h4><ul id="footer-links">${links}</ul></div><div class="footer-col footer-connect" ${contacts ? '' : 'hidden'}><h4>Connect</h4><ul id="footer-contacts">${contacts}</ul></div></div><div class="footer-bottom"><span>© <span id="year">${new Date().getFullYear()}</span> <span id="footer-name">${logo}</span>. All rights reserved.</span><a class="back-top" href="#home" aria-label="Back to top"><i class="ph ph-arrow-up" aria-hidden="true"></i></a></div></div></footer>`;
}
