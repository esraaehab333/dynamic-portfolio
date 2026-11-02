export const id = 'hero';

export function render(data) {
    const mount = document.getElementById('hero-mount');
    if (!mount) return;

    const hero = data.hero || {};
    const isVisible = data.sectionsVisibility?.hero !== false;
    const socials = (data.socials && data.socials.length > 0) ? data.socials : [
        { name: "GitHub", icon: "ph-github-logo", url: "https://github.com" },
        { name: "LinkedIn", icon: "ph-linkedin-logo", url: "https://linkedin.com" },
        { name: "Email", icon: "ph-envelope-simple", url: "#contact" }
    ];

    const socialsHtml = socials.map(s => `
        <a href="${s.url}" target="_blank" rel="noopener noreferrer" class="hero-social-link">
            <i class="ph ${s.icon || 'ph-link'}"></i>
            <span>${s.name || ''}</span>
        </a>
    `).join('');

    mount.innerHTML = `
    <section id="home" class="hero" style="${isVisible ? '' : 'display: none;'}">
        <div class="container hero-grid">
            <div class="hero-text">
                <div class="eyebrow" data-key="hero.name">${hero.name || "HELLO, I'M ESRAA EHAB LOTFY"}</div>
                <h1 class="hero-title" id="hero-title-main">${hero.title || "Junior <span>Android Developer</span>"}</h1>
                <p class="hero-desc" data-key="hero.description">${hero.description || "Mobile Application Developer specializing in high-performance, user-centric apps."}</p>

                <div class="hero-btns">
                    <a href="${hero.cv_url || '#'}" class="btn btn-primary" id="download-cv-btn" target="_blank">Download CV <i class="ph ph-download-simple"></i></a>
                    <a href="#contact" class="btn btn-outline">Let's Talk <i class="ph ph-chat-circle-text"></i></a>
                </div>

                <div class="hero-socials">
                    ${socialsHtml}
                </div>
            </div>

            <div class="hero-image-box">
                <div class="mobile-tech-bg"></div>
                <div class="tech-icon-float" style="top: 10%; left: 0;"><i class="ph ph-android-logo"></i></div>
                <div class="tech-icon-float" style="top: 20%; right: -10px;"><i class="ph ph-apple-logo"></i></div>
                <div class="tech-icon-float" style="bottom: 15%; left: -20px;"><i class="ph ph-code"></i></div>
                <div class="tech-icon-float" style="bottom: 5%; right: 20%;"><i class="ph ph-device-mobile"></i></div>

                <img src="${hero.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80'}" alt="Profile" id="hero-image">

                <div class="availability-badge">
                    <div class="dot"></div>
                    Available for new projects
                </div>
            </div>
        </div>
    </section>
    `;
}
