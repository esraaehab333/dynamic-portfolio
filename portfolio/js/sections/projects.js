import { esc, safeImgUrl } from '../core/utils.js';

const INITIAL_PROJECTS = 6;
const PROJECTS_PER_BATCH = 3;

export const id = 'projects';

export function render(data) {
    const mount = document.getElementById('projects-mount');
    if (!mount) return;

    const items = data.projects || [];
    const isVisible = (data.sectionsVisibility?.projects !== false) && items.length > 0;
    const itemsHtml = items.map((project, index) => {
        const title = esc(project.title || 'Untitled Project');
        const imgUrl = safeImgUrl(project.image);
        const sub = project.subtitle ? esc(project.subtitle) : '';
        const tag = project.tag ? esc(project.tag) : '';
        const thumbHtml = imgUrl
            ? `<div class="project-thumb"><img src="${imgUrl}" class="project-img" alt="${title} preview" loading="lazy"></div>`
            : `<div class="project-thumb project-thumb--empty" aria-hidden="true"></div>`;
        return `
        <article class="project-card reveal" data-project-id="${esc(project.id ?? index)}" role="link" tabindex="0" aria-label="View details for ${title}" ${index >= INITIAL_PROJECTS ? 'hidden' : ''}>
            ${thumbHtml}
            <div class="project-meta">
                <div class="project-header">
                    <div class="project-heading">
                        <h3 class="project-name">${title}</h3>
                        ${sub ? `<p class="project-subtitle">${sub}</p>` : ''}
                        ${tag ? `<p class="project-tech">${tag}</p>` : ''}
                    </div>
                </div>
                <div class="project-card-footer">
                    <span class="project-details-link">View more details <i class="ph ph-arrow-right"></i></span>
                </div>
            </div>
        </article>
    `;
    }).join('');

    mount.innerHTML = `
    <section id="projects" class="section-padding" style="${isVisible ? '' : 'display: none;'}">
        <div class="container">
            <div class="projects-section-header">
                <div>
                    <div class="section-label">Featured Projects</div>
                    <p class="projects-section-subtitle">A few highlights from my work. Open any project to explore the details.</p>
                </div>
                <span class="view-all"><strong>${items.length}</strong><span>${items.length === 1 ? 'project' : 'projects'}</span></span>
            </div>
            <div class="projects-grid" id="projects-container">${itemsHtml}</div>
            ${items.length > INITIAL_PROJECTS ? `<div class="projects-more-wrap"><button class="projects-more" type="button" aria-controls="projects-container">Show more projects <span>(${items.length - INITIAL_PROJECTS} remaining)</span> <i class="ph ph-caret-down" aria-hidden="true"></i></button></div>` : ''}
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

    const moreButton = mount.querySelector('.projects-more');
    if (moreButton) {
        moreButton.addEventListener('click', () => {
            const hiddenCards = [...mount.querySelectorAll('.project-card[hidden]')];
            hiddenCards.slice(0, PROJECTS_PER_BATCH).forEach(card => card.hidden = false);
            const remaining = hiddenCards.length - Math.min(hiddenCards.length, PROJECTS_PER_BATCH);
            if (remaining <= 0) {
                moreButton.remove();
            } else {
                moreButton.querySelector('span').textContent = `(${remaining} remaining)`;
            }
        });
    }
}
