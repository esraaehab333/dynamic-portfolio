export const id = 'services';

export function render(data) {
    const mount = document.getElementById('services-mount');
    if (!mount) return;

    const items = data.services || [];
    const isVisible = items.length > 0;

    const itemsHtml = items.map(s => {
        const sideVisualHtml = s.image
            ? `<div class="service-media"><img src="${s.image}" alt="${s.title}" loading="lazy"></div>`
            : `<div class="service-icon"><i class="ph ${s.icon || 'ph-sparkle'}"></i></div>`;

        return `
        <div class="service-card reveal">
            ${sideVisualHtml}
            <div class="service-body">
                <h3 class="service-title">${s.title}</h3>
                <p class="service-subtitle">${s.subtitle || s.desc || ''}</p>
            </div>
        </div>
        `;
    }).join('');

    mount.innerHTML = `
    <section id="services" class="section-padding bg-alt" style="${isVisible ? '' : 'display: none;'}">
        <div class="container">
            <div class="section-label" style="margin-bottom: 20px;">My Services</div>

            <div class="services-grid" id="services-container">
                ${itemsHtml}
            </div>
        </div>
    </section>
    `;
}
