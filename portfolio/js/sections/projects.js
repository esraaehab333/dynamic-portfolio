import { esc } from '../core/utils.js';

export const id = 'projects';

export function render(data) {
    const mount = document.getElementById('projects-mount');
    if (!mount) return;

    const items = data.projects || [];
    const isVisible = items.length > 0;
    const itemsHtml = items.map((project, index) => `
        <article class="project-card reveal" data-project-id="${esc(project.id ?? index)}" role="link" tabindex="0" aria-label="View details for ${project.title || 'project'}">
            <div class="project-thumb">
                <img src="${project.image || 'https://via.placeholder.com/800x600'}" class="project-img" alt="${project.title || 'Project'} preview" loading="lazy">
                <span class="project-tag">${project.tag || 'Project'}</span>
            </div>
            <div class="project-meta">
                <div class="project-header">
                    <div class="project-heading">
                        <h3 class="project-name">${project.title || 'Untitled Project'}</h3>
                        ${project.subtitle ? `<p class="project-subtitle">${project.subtitle}</p>` : ''}
                    </div>
                    <span class="arrow-btn" aria-hidden="true"><i class="ph ph-arrow-up-right"></i></span>
                </div>
                <div class="project-card-footer">
                    <span class="project-details-link">View project details <i class="ph ph-arrow-right"></i></span>
                    <div class="project-links">
                        ${project.github ? `<a href="${project.github}" class="project-link-icon" target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub"><i class="ph ph-github-logo"></i></a>` : ''}
                        ${project.linkedin ? `<a href="${project.linkedin}" class="project-link-icon" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn"><i class="ph ph-linkedin-logo"></i></a>` : ''}
                        ${project.video ? `<a href="${project.video}" class="project-link-icon" target="_blank" rel="noopener noreferrer" aria-label="Video" title="Video"><i class="ph ph-play-circle"></i></a>` : ''}
                    </div>
                </div>
            </div>
        </article>
    `).join('');

    mount.innerHTML = `
    <section id="projects" class="section-padding" style="${isVisible ? '' : 'display: none;'}">
        <div class="container">
            <div class="section-header">
                <div class="section-label">Featured Projects</div>
                <a href="#projects" class="view-all">Explore Projects <i class="ph ph-arrow-right"></i></a>
            </div>
            <div class="projects-grid" id="projects-container">${itemsHtml}</div>
        </div>
    </section>
    `;

    mount.querySelectorAll('.project-card').forEach(card => {
        const openDetails = () => {
            window.location.hash = `/project/${encodeURIComponent(card.dataset.projectId)}`;
        };
        card.addEventListener('click', event => {
            if (event.target.closest('a')) return;
            openDetails();
        });
        card.addEventListener('keydown', event => {
            if ((event.key === 'Enter' || event.key === ' ') && !event.target.closest('a')) {
                event.preventDefault();
                openDetails();
            }
        });
    });
}
