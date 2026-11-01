export const id = 'experience';

export function render(data) {
    const mount = document.getElementById('experience-mount');
    if (!mount) return;

    const items = data.experience || [];
    const isVisible = items.length > 0;

    const itemsHtml = items.map(e => `
        <div class="timeline-item reveal">
            <div class="timeline-dot"></div>
            <span class="timeline-date">${e.date}</span>
            <div class="timeline-content">
                <h3>${e.title}</h3>
                <h4>${e.subtitle}</h4>
                <p>${e.desc}</p>
            </div>
        </div>
    `).join('');

    mount.innerHTML = `
    <section id="experience" class="section-padding bg-alt" style="${isVisible ? '' : 'display: none;'}">
        <div class="container">
            <div class="section-label" style="margin-bottom: 40px;">Professional Experience</div>
            <div class="timeline" id="experience-container">
                ${itemsHtml}
            </div>
        </div>
    </section>
    `;
}
