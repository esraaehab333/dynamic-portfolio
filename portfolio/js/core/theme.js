export function applyTheme(data) {
    const root = document.documentElement;
    if (data?.site?.accent) {
        const hex = data.site.accent;
        root.style.setProperty('--primary', hex);

        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        root.style.setProperty('--primary-rgb', `${r}, ${g}, ${b}`);

        if (data.site.secondary && data.site.secondary !== '#000000' && data.site.secondary !== '') {
            const sHex = data.site.secondary;
            root.style.setProperty('--secondary', sHex);
            const sr = parseInt(sHex.slice(1, 3), 16);
            const sg = parseInt(sHex.slice(3, 5), 16);
            const sb = parseInt(sHex.slice(5, 7), 16);
            root.style.setProperty('--secondary-rgb', `${sr}, ${sg}, ${sb}`);
        } else {
            const sr = Math.min(255, r + 40);
            const sg = Math.max(0, g - 20);
            const sb = Math.min(255, b + 60);
            root.style.setProperty('--secondary', `rgb(${sr}, ${sg}, ${sb})`);
            root.style.setProperty('--secondary-rgb', `${sr}, ${sg}, ${sb}`);
        }
    }

    if (!localStorage.getItem('theme_preference')) {
        if (data?.site?.theme === 'dark') {
            document.documentElement.classList.add('dark-mode');
            document.body.classList.add('dark-mode');
        } else {
            document.documentElement.classList.remove('dark-mode');
            document.body.classList.remove('dark-mode');
        }
    }
    updateThemeIcon();
}

export function updateThemeIcon() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;
    const icon = themeToggle.querySelector('i');
    if (icon) {
        const isDark = document.documentElement.classList.contains('dark-mode');
        icon.className = isDark ? 'ph ph-moon' : 'ph ph-sun';
    }
}

export function updateFavicon(data) {
    const root = document.documentElement;
    const primary = getComputedStyle(root).getPropertyValue('--primary').trim() || '#3D5AFE';
    const secondary = getComputedStyle(root).getPropertyValue('--secondary').trim() || '#B125EA';

    const svg = `
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#faviconGradient)"/>
            <path d="M42 18H22V46H42V40H28V34H39V30H28V24H42V18Z" fill="white"/>
            <defs>
                <linearGradient id="faviconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="${primary}"/>
                    <stop offset="50%" stop-color="${secondary}"/>
                    <stop offset="100%" stop-color="${primary}"/>
                </linearGradient>
            </defs>
        </svg>
    `.trim();

    const dataUrl = `data:image/svg+xml;base64,${btoa(svg)}`;

    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/svg+xml';
        document.head.appendChild(link);
    }
    link.href = dataUrl;

    let appleLink = document.querySelector("link[rel='apple-touch-icon']");
    if (!appleLink) {
        appleLink = document.createElement('link');
        appleLink.rel = 'apple-touch-icon';
        document.head.appendChild(appleLink);
    }
    appleLink.href = dataUrl;
}

export function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.onclick = () => {
            const isDark = document.documentElement.classList.toggle('dark-mode');
            document.body.classList.toggle('dark-mode', isDark);
            localStorage.setItem('theme_preference', isDark ? 'dark' : 'light');
            updateThemeIcon();
            updateFavicon();
        };
        updateThemeIcon();
    }
}
