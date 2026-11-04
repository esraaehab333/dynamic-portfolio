import { esc, safeImgUrl, safeIcon } from '../core/utils.js';

export const id = 'skills';

const DEFAULT_TITLE = 'The tools I build with';
const CATEGORY_ORDER = ['Languages', 'Architecture', 'UI', 'Data & Network', 'Testing & Tools', 'Other'];
const CATEGORY_ICONS = {
    Languages: 'ph-code',
    Architecture: 'ph-stack',
    UI: 'ph-paint-brush',
    'Data & Network': 'ph-database',
    'Testing & Tools': 'ph-wrench',
    Other: 'ph-sparkle'
};

function categoryFor(skill) {
    return CATEGORY_ORDER.includes(skill.category) ? skill.category : 'Other';
}

function logoMarkup(skill, category) {
    const image = safeImgUrl(skill.image);
    const customIcon = safeIcon(skill.icon);
    const icon = customIcon || CATEGORY_ICONS[category] || CATEGORY_ICONS.Other;
    if (image) {
        return `<span class="skill-logo"><img src="${image}" alt="" loading="lazy"><i class="ph ${icon} skill-icon-fallback" aria-hidden="true" hidden></i></span>`;
    }
    return `<span class="skill-logo"><i class="ph ${icon} skill-icon" aria-hidden="true"></i></span>`;
}

export function render(data) {
    const mount = document.getElementById('skills-mount');
    if (!mount) return;

    const skills = Array.isArray(data.skills) ? data.skills : [];
    const isVisible = (data.sectionsVisibility?.skills !== false) && skills.length > 0;
    const groups = CATEGORY_ORDER.map(category => ({
        category,
        skills: skills.filter(skill => categoryFor(skill || {}) === category)
    })).filter(group => group.skills.length > 0);
    const title = data.sectionTitles?.skills || DEFAULT_TITLE;
    const groupsHtml = groups.map(group => `
        <div class="skill-group">
            <h3 class="skill-group-title">${esc(group.category)}</h3>
            <div class="skill-list">
                ${group.skills.map(skill => `
                    <div class="skill-chip reveal">
                        ${logoMarkup(skill || {}, group.category)}
                        <span class="skill-chip-title">${esc(skill?.name || '')}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');

    mount.innerHTML = `
    <section id="skills" class="section-padding skills-section" style="${isVisible ? '' : 'display: none;'}">
        <div class="container">
            <div class="section-label">Technical Expertise</div>
            <h2 class="skills-title" data-key="skills.title">${esc(title)}</h2>
            <div class="skills-grid" id="dynamic-skills-container">${groupsHtml}</div>
        </div>
    </section>
    `;

    mount.querySelectorAll('.skill-logo img').forEach(image => image.addEventListener('error', () => {
        image.hidden = true;
        const fallback = image.nextElementSibling;
        if (fallback) fallback.hidden = false;
    }, { once: true }));
}

export function populateForm(data) {
    const titleInput = document.getElementById('skills-title');
    if (titleInput) titleInput.value = data.sectionTitles?.skills || DEFAULT_TITLE;
}

export function saveSectionSettings(data) {
    if (!data.sectionTitles) data.sectionTitles = {};
    data.sectionTitles.skills = document.getElementById('skills-title').value.trim() || DEFAULT_TITLE;
}
