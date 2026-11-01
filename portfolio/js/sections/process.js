export const id = 'process';

export function render(data) {
    const mount = document.getElementById('process-mount');
    if (!mount) return;

    const items = data.process || [];
    const isVisible = items.length > 0;

    const itemsHtml = items.map(p => `
        <div class="process-item reveal">
            <div class="process-header">
                <div class="process-num">${p.number}</div>
                <div class="process-icon"><i class="ph ${p.icon || 'ph-lightning'}"></i></div>
            </div>
            <h4>${p.title}</h4>
            <p>${p.desc}</p>
        </div>
    `).join('');

    mount.innerHTML = `
    <section id="process" class="section-padding bg-alt" style="${isVisible ? '' : 'display: none;'}">
        <div class="container">
            <div class="section-label" style="margin-bottom: 20px;">My Process</div>

            <div class="process-grid" id="process-container">
                ${itemsHtml}
            </div>
        </div>
    </section>
    `;
}
