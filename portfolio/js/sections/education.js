import { esc } from '../core/utils.js';

export const id = 'education';

export function render(data) {
    const mount = document.getElementById('education-mount');
    if (!mount) return;

    const items = data.education || [];
    const isVisible = (data.sectionsVisibility?.education !== false) && items.length > 0;

    const itemsHtml = items.map(e => `
        <div class="timeline-item reveal">
            <div class="timeline-dot"></div>
            <span class="timeline-date">${esc(e.date)}</span>
            <div class="timeline-content">
                <h3>${esc(e.title)}</h3>
                <h4>${esc(e.subtitle)}</h4>
                <p>${esc(e.desc)}</p>
            </div>
        </div>
    `).join('');

    mount.innerHTML = `
    <section id="education" class="section-padding" style="${isVisible ? '' : 'display: none;'}">
        <div class="container">
            <div class="section-label" style="margin-bottom: 40px;">Education</div>
            <div class="timeline" id="education-container">
                ${itemsHtml}
            </div>
        </div>
    </section>
    `;
}
