export const id = 'skills';

export function render(data) {
    const mount = document.getElementById('skills-mount');
    if (!mount) return;

    const skills = data.skills || [];
    const isVisible = skills.length > 0;

    let groupsHtml = '';
    if (isVisible) {
        const groups = {};
        skills.forEach(s => {
            const cat = s.category || 'Other';
            if (!groups[cat]) groups[cat] = { name: cat, icon: s.icon || 'ph-code', items: [] };
            groups[cat].items.push(s.name);
        });

        groupsHtml = Object.values(groups).map(g => `
            <div class="skill-category reveal">
                <div class="category-header">
                    <i class="ph ${g.icon}"></i>
                    <h3>${g.name}</h3>
                </div>
                <div class="skill-tags">
                    ${g.items.map(name => `<span>${name}</span>`).join('')}
                </div>
            </div>
        `).join('');
    }

    mount.innerHTML = `
    <section id="skills" class="section-padding" style="${isVisible ? '' : 'display: none;'}">
        <div class="container">
            <div class="section-label" style="margin-bottom: 40px;">Technical Expertise</div>

            <div class="skills-grid" id="dynamic-skills-container">
                ${groupsHtml}
            </div>
        </div>
    </section>
    `;
}
