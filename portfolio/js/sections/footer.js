export const id = 'footer';

export function render(data) {
    const mount = document.getElementById('footer-mount');
    if (!mount) return;

    const logoText = data.site?.logo || "ESRAA EHAB";
    const year = new Date().getFullYear();
    const socials = (data.socials && data.socials.length > 0) ? data.socials : [
        { name: "GitHub", icon: "ph-github-logo", url: "https://github.com" },
        { name: "LinkedIn", icon: "ph-linkedin-logo", url: "https://linkedin.com" },
        { name: "Email", icon: "ph-envelope-simple", url: "#contact" }
    ];

    const socialsHtml = socials.map(s => `
        <a href="${s.url}" target="_blank" rel="noopener noreferrer" class="footer-social-link">
            <i class="ph ${s.icon || 'ph-link'}"></i>
            <span>${s.name || ''}</span>
        </a>
    `).join('');

    mount.innerHTML = `
    <footer class="site-footer">
        <div class="container footer-content">
            <div class="footer-left">
                <a href="#home" class="logo">${logoText}</a>
                <p class="footer-copy">© <span id="year">${year}</span> ${logoText}. All rights reserved.</p>
            </div>
            <div class="footer-socials">
                ${socialsHtml}
            </div>
        </div>
    </footer>
    `;
}
