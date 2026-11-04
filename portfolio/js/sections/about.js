import { esc, multiline, safeIcon } from '../core/utils.js';

export const id = 'about';

export function render(data) {
    const mount = document.getElementById('about-mount');
    if (!mount) return;

    const about = data.about || {};
    const projectsCount = (data.projects || []).length;
    const skillsCount = (data.skills || []).length;
    const currentYear = new Date().getFullYear();
    const experienceMonths = (data.experience || []).reduce((total, item) => {
        const years = String(item.date || '').match(/\b(?:19|20)\d{2}\b/g)?.map(Number) || [];
        if (!years.length) return total;
        const start = years[0];
        const end = /present|current/i.test(item.date) ? currentYear : (years[1] || currentYear);
        return total + Math.max(0, end - start) * 12;
    }, 0);
    const yearsExperience = Math.floor(experienceMonths / 12);
    const statDefinitions = Array.isArray(about.stats) ? about.stats : [
        { title: `${projectsCount}`, subtitle: about.statLabels?.projects || 'Projects', icon: 'ph-briefcase' },
        { title: `${yearsExperience}`, subtitle: about.statLabels?.experience || 'Years of Experience', icon: 'ph-calendar-check' },
        { title: `${skillsCount}`, subtitle: about.statLabels?.skills || 'Core Skills', icon: 'ph-code' }
    ];
    const stats = statDefinitions.map(stat => {
        const sourceValue = stat.source === 'projects' ? `${projectsCount}`
            : stat.source === 'experience' ? `${yearsExperience}`
            : stat.source === 'skills' ? `${skillsCount}` : undefined;
        return {
            title: stat.title ?? sourceValue ?? stat.value ?? '',
            subtitle: stat.subtitle ?? stat.label ?? '',
            icon: safeIcon(stat.icon || '')
        };
    });

    const isVisible = data.sectionsVisibility?.about !== false;
    const label = esc(about.label || 'About Me');
    const title = esc(about.title || 'I build mobile apps with people and purpose in mind.');
    const bioHtml = multiline(about.bio || 'I am a mobile application developer focused on creating clean, thoughtful Android experiences. Through my professional diploma at ITI, I am growing my skills in native development and turning ideas into useful products.');

    mount.innerHTML = `
    <section id="about" class="section-padding about-section" style="${isVisible ? '' : 'display: none;'}">
        <div class="container about-container">
            <div class="about-copy">
                <div class="section-label">${label}</div>
                <h2 data-key="about.title">${title}</h2>
                <div data-key="about.bio">
                    ${bioHtml}
                </div>
                ${about.showStats === false ? '' : `<div class="about-stats" aria-label="A little about my work">
                    ${stats.map((stat, index) => {
                        return `
                        <div class="about-stat about-stat-${index + 1}">
                            ${stat.icon ? `<span class="about-stat-icon"><i class="ph ${stat.icon}" aria-hidden="true"></i></span>` : ''}
                            <span class="about-stat-copy"><strong>${esc(stat.title)}</strong><span>${esc(stat.subtitle)}</span></span>
                        </div>
                    `;
                    }).join('')}
                </div>`}
            </div>
        </div>
    </section>
    `;
}
