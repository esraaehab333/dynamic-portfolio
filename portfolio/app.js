const API_URL = 'https://portfolio-api.esraaehabb333.workers.dev';

const DEFAULT_DATA = {
    site: { logo: "ESRAA EHAB", accent: "#0055FF", theme: "light" },
    hero: {
        name: "HELLO, I'M ESRAA EHAB",
        title: "I Design High-Performance <span>Mobile Apps</span>",
        description: "Specializing in Android and iOS development using Kotlin Multiplatform and Compose to build seamless digital experiences.",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80"
    },
    about: {
        bio: "I am a dedicated Mobile App Developer with a passion for creating clean, efficient, and user-friendly applications. I focus on robust architectures and beautiful UIs."
    },
    contact: {
        title: "Let's Create Something Amazing Together",
        subtitle: "Currently open for new projects and opportunities. Reach out and let's talk about your idea!"
    },
    socials: [], partners: [], projects: [], services: [], skills: [], process: [], testimonials: [], contacts: []
};

class PortfolioApp {
    constructor() {
        this.data = null;
        this.init();
    }

    async init() {
        this.data = await this.loadData();
        this.applyTheme();
        this.renderAll();

        const yearEl = document.getElementById('year');
        if (yearEl) yearEl.textContent = new Date().getFullYear();

        const loading = document.getElementById('app-loading-overlay');
        if (loading) loading.style.display = 'none';

        this.setupScrollEffect();
    }

    async loadData() {
        try {
            const res = await fetch(API_URL + '?t=' + Date.now());
            if (!res.ok) throw new Error("Fetch failed");
            const data = await res.json();
            return { ...DEFAULT_DATA, ...data };
        } catch (e) {
            console.warn("Using default data", e);
            return DEFAULT_DATA;
        }
    }

    applyTheme() {
        const root = document.documentElement;
        if (this.data.site?.accent) {
            root.style.setProperty('--primary', this.data.site.accent);
            root.style.setProperty('--primary-soft', this.data.site.accent + '1a');
        }
        if (this.data.site?.theme === 'dark') document.body.classList.add('dark-mode');
        else document.body.classList.remove('dark-mode');
    }

    renderAll() {
        // Site branding
        const logoText = document.getElementById('logo-text');
        if (logoText) logoText.textContent = this.data.site?.logo || DEFAULT_DATA.site.logo;

        // Dynamic content
        this.renderText();

        const heroTitle = document.getElementById('hero-title-main');
        if (heroTitle) heroTitle.innerHTML = this.data.hero.title || DEFAULT_DATA.hero.title;

        const heroImg = document.getElementById('hero-image');
        if (heroImg && this.data.hero.image) heroImg.src = this.data.hero.image;

        // Collections (Ensure containers are cleared if empty)
        this.renderCollection('partners', 'partners-container', p => `<img src="${p.logo}" alt="Partner">`);

        this.renderCollection('projects', 'projects-container', p => `
            <div class="project-card reveal">
                <img src="${p.image || 'https://via.placeholder.com/600x400'}" class="project-img">
                <div class="project-meta">
                    <div>
                        <div class="project-tag">${p.tag || 'Mobile'}</div>
                        <div class="project-name">${p.title}</div>
                    </div>
                    <a href="${p.demo || '#'}" class="arrow-btn" target="_blank"><i class="ph ph-arrow-up-right"></i></a>
                </div>
            </div>
        `);

        this.renderCollection('services', 'services-container', s => `
            <div class="service-card reveal">
                <div class="service-icon"><i class="ph ${s.icon || 'ph-device-mobile'}"></i></div>
                <h3>${s.title}</h3>
                <p>${s.desc}</p>
            </div>
        `);

        this.renderCollection('skills', 'skills-container', s => `
            <div class="tool-item">
                <i class="ph ${s.icon || 'ph-code'}"></i> ${s.name}
            </div>
        `);

        this.renderCollection('process', 'process-container', p => `
            <div class="process-item reveal">
                <div class="process-num">${p.number}</div>
                <h4>${p.title}</h4>
                <p>${p.desc}</p>
            </div>
        `);

        this.renderCollection('testimonials', 'testimonials-container', t => `
            <div class="testi-card reveal">
                <i class="ph ph-quotes-fill quote-icon"></i>
                <p class="testi-text">${t.text}</p>
                <div class="testi-author">
                    <img src="${t.image || 'https://via.placeholder.com/150'}" class="author-img">
                    <div>
                        <div class="author-name">${t.author}</div>
                        <div class="author-role">${t.title}</div>
                    </div>
                </div>
            </div>
        `);

        this.renderCollection('contacts', 'contact-methods-container', c => `
            <div class="contact-method">
                <div class="method-icon"><i class="ph ${c.icon || 'ph-envelope'}"></i></div>
                <div>
                    <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">${c.label}</div>
                    <a href="${c.url || '#'}" style="font-weight: 700;">${c.value}</a>
                </div>
            </div>
        `);

        this.renderCollection('socials', 'social-links-container', s => `
            <a href="${s.url || '#'}" class="social-item" target="_blank"><i class="ph ${s.icon || 'ph-link'}"></i></a>
        `);
    }

    renderText() {
        document.querySelectorAll('[data-key]').forEach(el => {
            const keys = el.dataset.key.split('.');
            let val = this.data;
            keys.forEach(k => val = val ? val[k] : null);
            if (val !== null && val !== undefined) el.textContent = val;
        });
    }

    renderCollection(key, id, template) {
        const container = document.getElementById(id);
        if (!container) return;
        const items = this.data[key] || [];
        if (items.length > 0) {
            container.innerHTML = items.map(template).join('');
        } else {
            container.innerHTML = `<p style="color: var(--text-muted); font-size: 0.9rem;">No ${key} added yet.</p>`;
        }
    }

    setupScrollEffect() {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('active');
            });
        }, { threshold: 0.1 });
        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }
}

new PortfolioApp();
