export const id = 'navbar';

export function render(data) {
    const mount = document.getElementById('navbar-mount');
    if (!mount) return;

    const logoText = data.site?.logo || "ESRAA EHAB";
    const logoChar = logoText.charAt(0);

    mount.innerHTML = `
    <nav id="navbar">
        <div class="container nav-content">
            <a href="#home" class="logo">
                <div class="logo-icon" id="logo-icon-char">${logoChar}</div>
                <div id="logo-text">${logoText}</div>
            </a>

            <div class="nav-links" id="nav-menu">
                <a href="#home" class="active">Home</a>
                <a href="#about">About</a>
                <a href="#projects">Projects</a>
                <a href="#experience">Experience</a>
                <a href="#skills">Skills</a>
                <a href="#process">Process</a>
                <a href="#education">Education</a>
                <a href="#contact">Contact</a>
            </div>

            <div style="display: flex; gap: 12px; align-items: center;">
                <button id="theme-toggle" class="theme-btn" aria-label="Toggle Theme">
                    <i class="ph ph-moon"></i>
                </button>
                <a href="#contact" class="btn btn-primary nav-cta">Let's Talk <i class="ph ph-arrow-up-right"></i></a>
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
