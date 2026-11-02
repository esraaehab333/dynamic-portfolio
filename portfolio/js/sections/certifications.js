export const id = 'certifications';

export function render(data) {
    const mount = document.getElementById('certifications-mount');
    if (!mount) return;

    const items = data.certifications || [];
    const isVisible = (data.sectionsVisibility?.certifications !== false) && items.length > 0;

    const itemsHtml = items.map(c => `
        <a href="${c.url || '#'}" class="cert-card reveal" target="_blank">
            <div class="cert-icon"><i class="ph ph-certificate"></i></div>
            <div class="cert-info">
                <h4>${c.title}</h4>
                <p>${c.subtitle} • ${c.date}</p>
            </div>
        </a>
    `).join('');

    mount.innerHTML = `
    <section id="certifications" class="section-padding bg-alt" style="${isVisible ? '' : 'display: none;'}">
        <div class="container">
            <div class="section-label" style="margin-bottom: 40px;">Certifications</div>
            <div class="certs-grid" id="certifications-container">
                ${itemsHtml}
            </div>
        </div>
    </section>
    `;
}
