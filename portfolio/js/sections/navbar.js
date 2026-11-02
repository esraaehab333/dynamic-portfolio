export const id = 'navbar';

export function render(data) {
    const mount = document.getElementById('navbar-mount');
    if (!mount) return;

    const logoText = data.site?.logo || "ESRAA EHAB";
    const logoChar = logoText.charAt(0);
    const vis = data.sectionsVisibility || {};

    const navItems = [
        { id: 'home', label: 'Home', show: vis.hero !== false },
        { id: 'about', label: 'About', show: vis.about !== false },
        { id: 'projects', label: 'Projects', show: vis.projects !== false && (data.projects || []).length > 0 },
        { id: 'experience', label: 'Experience', show: vis.experience !== false && (data.experience || []).length > 0 },
        { id: 'skills', label: 'Skills', show: vis.skills !== false && (data.skills || []).length > 0 },
        { id: 'services', label: 'Services', show: vis.services !== false && (data.services || []).length > 0 },
        { id: 'education', label: 'Education', show: vis.education !== false && (data.education || []).length > 0 },
        { id: 'contact', label: 'Contact', show: vis.contact !== false }
    ];

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
