export const id = 'navbar';

export function render(data) {
    const mount = document.getElementById('navbar-mount');
    if (!mount) return;

    const logoText = data.site?.logo || "ESRAA EHAB";
    const logoChar = logoText.charAt(0);
    const vis = data.sectionsVisibility || {};

    const defaultOrder = ['hero', 'about', 'projects', 'experience', 'skills', 'services', 'education', 'certifications', 'contact'];
    const sectionOrder = (data.sectionsOrder && data.sectionsOrder.length) ? data.sectionsOrder : defaultOrder;

    const sectionMeta = {
        hero: { id: 'home', label: 'Home', show: vis.hero !== false },
        about: { id: 'about', label: 'About', show: vis.about !== false },
        projects: { id: 'projects', label: 'Projects', show: vis.projects !== false && (data.projects || []).length > 0 },
        experience: { id: 'experience', label: 'Experience', show: vis.experience !== false && (data.experience || []).length > 0 },
        skills: { id: 'skills', label: 'Skills', show: vis.skills !== false && (data.skills || []).length > 0 },
        services: { id: 'services', label: 'Services', show: vis.services !== false && (data.services || []).length > 0 },
        education: { id: 'education', label: 'Education', show: vis.education !== false && (data.education || []).length > 0 },
        certifications: { id: 'certifications', label: 'Certifications', show: vis.certifications !== false && (data.certifications || []).length > 0 },
        contact: { id: 'contact', label: 'Contact', show: vis.contact !== false }
    };

    const navItems = sectionOrder
        .map(key => sectionMeta[key])
        .filter(item => item && item.show);

    const linksHtml = navItems
        .filter(item => item.show)
        .map((item, idx) => `<a href="#${item.id}"${idx === 0 ? ' class="active"' : ''}>${item.label}</a>`)
        .join('');

    const showContactCta = vis.contact !== false;

    mount.innerHTML = `
    <nav id="navbar">
        <div class="container nav-content">
            <a href="#home" class="logo">
                <div class="logo-icon" id="logo-icon-char">${logoChar}</div>
                <div id="logo-text">${logoText}</div>
            </a>

            <div class="nav-links" id="nav-menu">
                ${linksHtml}
            </div>

            <div style="display: flex; gap: 12px; align-items: center;">
                <button id="theme-toggle" class="theme-btn" aria-label="Toggle Theme">
                    <i class="ph ph-moon"></i>
                </button>
                ${showContactCta ? `<a href="#contact" class="btn btn-primary nav-cta">Let's Talk <i class="ph ph-arrow-up-right"></i></a>` : ''}
                <button class="menu-toggle" id="menu-toggle" aria-label="Toggle Menu">
                    <i class="ph ph-list"></i>
                </button>
            </div>
        </div>
    </nav>
    `;
}

export function init() {
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    if (menuToggle && navMenu) {
        menuToggle.onclick = () => {
            navMenu.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('ph-list');
                icon.classList.toggle('ph-x');
            }
        };

        navMenu.querySelectorAll('a').forEach(link => {
            link.onclick = () => navMenu.classList.remove('active');
        });
    }
}
