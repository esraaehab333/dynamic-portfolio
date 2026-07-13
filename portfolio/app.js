const API_URL = 'https://portfolio-api.esraaehabb333.workers.dev';

const DEFAULT_DATA = {
    site: { logo: "ESRAA EHAB", accent: "#0055FF", theme: "light" },
    hero: {
        name: "HELLO, I'M ESRAA EHAB LOTFY",
        title: "Junior <span>Android Developer</span>",
        description: "Mobile Application Developer specializing in high-performance, user-centric apps. Currently pursuing a 9-month Professional Diploma in Native Android Development at ITI.",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
        cv_url: "#"
    },
    about: { bio: "I am a dedicated Mobile App Developer with a passion for creating clean, efficient, and user-friendly applications." },
    contact: { title: "Let's Create Something Amazing Together", subtitle: "Currently open for new projects and opportunities." },
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
        this.setupContactForm();
    }

    async loadData() {
        try {
            const res = await fetch(API_URL + '?t=' + Date.now());
            const data = await res.json();
            const merged = { ...DEFAULT_DATA, ...data };
            // Migration logic
            if (data.project && !data.projects) merged.projects = data.project;
            if (data.skill && !data.skills) merged.skills = data.skill;
            if (data.service && !data.services) merged.services = data.service;
            if (data.partner && !data.partners) merged.partners = data.partner;
            return merged;
        } catch (e) { return DEFAULT_DATA; }
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
        const logoText = document.getElementById('logo-text');
        if (logoText) logoText.textContent = this.data.site?.logo || DEFAULT_DATA.site.logo;

        const heroTitle = document.getElementById('hero-title-main');
        if (heroTitle) heroTitle.innerHTML = this.data.hero.title || DEFAULT_DATA.hero.title;

        this.renderText();
        const heroImg = document.getElementById('hero-image');
        if (heroImg && this.data.hero.image) heroImg.src = this.data.hero.image;

        const cvBtn = document.getElementById('download-cv-btn');
        if (cvBtn && this.data.hero.cv_url) cvBtn.href = this.data.hero.cv_url;

        // Collections
        this.renderCollection('partners', 'partners-container', p => `<img src="${p.logo}">`);
        this.renderCollection('projects', 'projects-container', p => `
            <div class="project-card reveal">
                <img src="${p.image}" class="project-img">
                <div class="project-meta">
                    <div class="project-header">
                        <div><div class="project-tag">${p.tag}</div><div class="project-name">${p.title}</div></div>
                        <a href="${p.demo || '#'}" class="arrow-btn" target="_blank"><i class="ph ph-arrow-up-right"></i></a>
                    </div>
                    ${p.subtitle ? `<div class="project-subtitle">${p.subtitle}</div>` : ''}
                    <div class="project-links">
                        ${p.github ? `<a href="${p.github}" class="project-link-icon" target="_blank"><i class="ph ph-github-logo"></i></a>` : ''}
                        ${p.linkedin ? `<a href="${p.linkedin}" class="project-link-icon" target="_blank"><i class="ph ph-linkedin-logo"></i></a>` : ''}
                        ${p.video ? `<a href="${p.video}" class="project-link-icon" target="_blank"><i class="ph ph-play-circle"></i></a>` : ''}
                    </div>
                </div>
            </div>
        `);
        this.renderCollection('services', 'services-container', s => `
            <div class="service-card reveal">
                <div class="service-icon"><i class="ph ${s.icon}"></i></div>
                <h3>${s.title}</h3><p>${s.desc}</p>
            </div>
        `);
        this.renderCollection('skills', 'skills-container', s => `<div class="tool-item"><i class="ph ${s.icon}"></i> ${s.name}</div>`);
        this.renderCollection('process', 'process-container', p => `
            <div class="process-item reveal">
                <div class="process-num">${p.number}</div>
                <h4>${p.title}</h4><p>${p.desc}</p>
            </div>
        `);
        this.renderCollection('testimonials', 'testimonials-container', t => `
            <div class="testi-card reveal">
                <i class="ph ph-quotes-fill quote-icon"></i>
                <p class="testi-text">${t.text}</p>
                <div class="testi-author">
                    <img src="${t.image}" class="author-img">
                    <div><div class="author-name">${t.author}</div><div class="author-role">${t.title}</div></div>
                </div>
            </div>
        `);
        this.renderCollection('contacts', 'contact-methods-container', c => {
            const isEmail = c.label?.toLowerCase().includes('email');
            let url = c.url || '#';
            if (isEmail && url !== '#' && !url.startsWith('mailto:')) url = `mailto:${url}`;
            return `
            <div class="contact-method">
                <div class="method-icon"><i class="ph ${c.icon}"></i></div>
                <div><div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">${c.label}</div><a href="${url}" style="font-weight: 700;">${c.value}</a></div>
            </div>
            `;
        });
        this.renderCollection('socials', 'social-links-container', s => `<a href="${s.url || '#'}" class="social-item" target="_blank"><i class="ph ${s.icon}"></i></a>`);
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

        let sectionToHide = null;
        if (key === 'partners') sectionToHide = container.closest('.trusted-by');
        else if (key === 'skills') sectionToHide = container.closest('.tools-bar');
        else if (['projects', 'services', 'process', 'testimonials'].includes(key)) {
            sectionToHide = container.closest('section');
        }

        if (items.length > 0) {
            container.innerHTML = items.map(template).join('');
            if (sectionToHide) sectionToHide.style.display = 'block';
            container.style.display = '';
        } else {
            if (sectionToHide) sectionToHide.style.display = 'none';
            else container.style.display = 'none';
        }
    }

    setupScrollEffect() {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('active'); });
        }, { threshold: 0.1 });
        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }

    setupContactForm() {
        const form = document.getElementById('main-contact-form');
        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                const btn = form.querySelector('button');
                const originalText = btn.innerHTML;

                btn.disabled = true;
                btn.innerHTML = 'Sending...';

                const formData = new FormData(form);

                try {
                    // ملاحظة: استبدلي الرابط برابط Formspree الخاص بكِ لاحقاً
                    const response = await fetch('https://formspree.io/f/xvgzpyzo', { // وضعت لكِ معرف مؤقت للتجربة
                        method: 'POST',
                        body: formData,
                        headers: { 'Accept': 'application/json' }
                    });

                    if (response.ok) {
                        alert('Thank you! Your message has been sent successfully.');
                        form.reset();
                    } else {
                        alert('Oops! There was a problem sending your message.');
                    }
                } catch (error) {
                    alert('Error connecting to the server. Please try again.');
                } finally {
                    btn.disabled = false;
                    btn.innerHTML = originalText;
                }
            };
        }
    }
}
new PortfolioApp();
