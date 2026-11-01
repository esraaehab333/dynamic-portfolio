export const id = 'projects';

export function render(data) {
    const mount = document.getElementById('projects-mount');
    if (!mount) return;

    const items = data.projects || [];
    const isVisible = items.length > 0;

    const itemsHtml = items.map(p => `
        <div class="project-card reveal">
            <img src="${p.image || 'https://via.placeholder.com/600x400'}" class="project-img">
            <div class="project-meta">
                <div class="project-header">
                    <div>
                        <div class="project-tag">${p.tag || 'Project'}</div>
                        <div class="project-name">${p.title}</div>
                    </div>
                    <a href="${p.demo || '#'}" class="arrow-btn" target="_blank"><i class="ph ph-arrow-up-right"></i></a>
                </div>
                ${p.subtitle ? `<div class="project-subtitle">${p.subtitle}</div>` : ''}
                <div class="project-links">
                    ${p.github ? `<a href="${p.github}" class="project-link-icon" target="_blank" title="GitHub"><i class="ph ph-github-logo"></i></a>` : ''}
                    ${p.linkedin ? `<a href="${p.linkedin}" class="project-link-icon" target="_blank" title="LinkedIn"><i class="ph ph-linkedin-logo"></i></a>` : ''}
                    ${p.video ? `<a href="${p.video}" class="project-link-icon" target="_blank" title="Watch Video"><i class="ph ph-play-circle"></i></a>` : ''}
                </div>
            </div>
        </div>
    `).join('');

    mount.innerHTML = `
    <section id="projects" class="section-padding" style="${isVisible ? '' : 'display: none;'}">
        <div class="container">
            <div class="section-header">
                <div class="section-label">Featured Projects</div>
                <a href="#" class="view-all">View All Projects <i class="ph ph-arrow-right"></i></a>
            </div>

            <div class="projects-grid" id="projects-container">
                ${itemsHtml}
            </div>
        </div>
    </section>
    `;
}
