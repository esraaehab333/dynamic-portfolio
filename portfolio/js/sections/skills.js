export const id = 'skills';

export function render(data) {
    const mount = document.getElementById('skills-mount');
    if (!mount) return;

    const skills = data.skills || [];
    const isVisible = (data.sectionsVisibility?.skills !== false) && skills.length > 0;

    const cardsHtml = skills.map(s => {
        const visualHtml = s.image
            ? `<img src="${s.image}" alt="${s.name || 'Skill'}" class="skill-card-img" loading="lazy">`
            : `<i class="ph ${s.icon || 'ph-code'} skill-card-icon"></i>`;

        return `
        <div class="skill-card reveal">
            ${visualHtml}
            <span class="skill-card-title">${s.name || ''}</span>
        </div>
        `;
    }).join('');

    mount.innerHTML = `
    <section id="skills" class="section-padding" style="${isVisible ? '' : 'display: none;'}">
        <div class="container">
            <div class="section-label" style="margin-bottom: 30px;">Technical Expertise</div>

            <div class="skills-grid" id="dynamic-skills-container">
                ${cardsHtml}
            </div>
        </div>
    </section>
    `;
}
