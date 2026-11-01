export const id = 'footer';

export function render(data) {
    const mount = document.getElementById('footer-mount');
    if (!mount) return;

    const logoText = data.site?.logo || "ESRAA EHAB";
    const year = new Date().getFullYear();

    mount.innerHTML = `
    <footer style="padding: 60px 0; border-top: 1px solid var(--border); background: var(--bg-main);">
        <div class="container footer-content">
            <a href="#home" class="logo">${logoText}</a>
            <p style="color: var(--text-muted); font-size: 0.9rem;">© <span id="year">${year}</span> ${logoText}. All rights reserved.</p>
        </div>
    </footer>
    `;
}
