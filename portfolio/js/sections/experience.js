import { esc, safeImgUrl } from '../core/utils.js';

export const id = 'experience';

export function render(data) {
    const mount = document.getElementById('experience-mount');
    if (!mount) return;

    const items = data.experience || [];
    const isVisible = (data.sectionsVisibility?.experience !== false) && items.length > 0;

    const itemsHtml = items.map(e => {
        const img = safeImgUrl(e.image);
        return `
        <div class="timeline-item reveal">
            <div class="timeline-dot"></div>
            <span class="timeline-date">${esc(e.date)}</span>
            <div class="timeline-content${img ? ' has-image' : ''}">
                <div class="timeline-copy">
                    <h3>${esc(e.title)}</h3>
                    <h4>${esc(e.subtitle)}</h4>
                    <p>${esc(e.desc)}</p>
                </div>
                ${img ? `<div class="timeline-image"><img src="${img}" alt="${esc(e.title)}" loading="lazy"></div>` : ''}
            </div>
        </div>
    `;
    }).join('');

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
