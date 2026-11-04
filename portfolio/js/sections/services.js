import { esc, safeImgUrl, safeIcon } from '../core/utils.js';

export const id = 'services';

export function render(data) {
    const mount = document.getElementById('services-mount');
    if (!mount) return;

    const items = data.services || [];
    const isVisible = (data.sectionsVisibility?.services !== false) && items.length > 0;

    const itemsHtml = items.map(s => {
        const img = safeImgUrl(s.image);
        const icon = safeIcon(s.icon || 'ph-sparkle') || 'ph-sparkle';
        const title = esc(s.title);
        const sub = esc(s.subtitle || s.desc || '');

        const sideVisualHtml = img
            ? `<div class="service-media"><img src="${img}" alt="${title}" loading="lazy"></div>`
            : `<div class="service-icon"><i class="ph ${icon}"></i></div>`;

        return `
        <div class="service-card reveal">
            ${sideVisualHtml}
            <div class="service-body">
                <h3 class="service-title">${title}</h3>
                <p class="service-subtitle">${sub}</p>
            </div>
        </div>
        `;
    }).join('');

    mount.innerHTML = `
    <section id="services" class="section-padding bg-alt" style="${isVisible ? '' : 'display: none;'}">
        <div class="container">
            <div class="services-header">
                <div class="section-label">My Services</div>
            </div>

            <div class="services-grid" id="services-container">
                ${itemsHtml}
            </div>
        </div>
    </section>
    `;
}
