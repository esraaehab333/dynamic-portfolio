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

        document.getElementById('year').textContent = new Date().getFullYear();
        document.getElementById('app-loading-overlay').style.display = 'none';

        this.setupScrollEffect();
        this.setupContactForm();
        this.setupNavbarScroll();
        this.setupInteractions();
    }

    setupInteractions() {
        // Mobile Menu
        const menuToggle = document.getElementById('menu-toggle');
        const navMenu = document.getElementById('nav-menu');
        if (menuToggle && navMenu) {
            menuToggle.onclick = () => {
                navMenu.classList.toggle('active');
                const icon = menuToggle.querySelector('i');
                icon.classList.toggle('ph-list');
                icon.classList.toggle('ph-x');
            };

            // Close menu on link click
            navMenu.querySelectorAll('a').forEach(link => {
                link.onclick = () => navMenu.classList.remove('active');
            });
        }

        // Mouse Glow
        const mouseGlow = document.getElementById('mouse-glow');
        window.onmousemove = (e) => {
            if (mouseGlow) {
                mouseGlow.style.left = e.clientX + 'px';
                mouseGlow.style.top = e.clientY + 'px';
            }

            // Interaction for cards
            document.querySelectorAll('.project-card, .skill-category, .glass-card').forEach(card => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            });
        };
    }

    async loadData() {
        try {
            const res = await fetch(API_URL + '?t=' + Date.now());
            const data = await res.json();
            const merged = { ...DEFAULT_DATA, ...data };

            // Migration logic for singular/plural keys
            if (data.project && !data.projects) merged.projects = data.project;
            if (data.skill && !data.skills) merged.skills = data.skill;
            if (data.service && !data.services) merged.services = data.service;
            if (data.partner && !data.partners) merged.partners = data.partner;

            return merged;
        } catch (e) {
            console.warn("Using defaults due to fetch error:", e);
            return DEFAULT_DATA;
        }
    }

    applyTheme() {
        const root = document.documentElement;
        if (this.data.site?.accent) {
            const hex = this.data.site.accent;
            root.style.setProperty('--primary', hex);

            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            root.style.setProperty('--primary-rgb', `${r}, ${g}, ${b}`);

            // 1. Always check for a secondary color from the admin
            // 2. If it's not there, generate one to ensure the gradient stays "alive"
            if (this.data.site.secondary && this.data.site.secondary !== '#000000' && this.data.site.secondary !== '') {
                const sHex = this.data.site.secondary;
                root.style.setProperty('--secondary', sHex);
                const sr = parseInt(sHex.slice(1, 3), 16);
                const sg = parseInt(sHex.slice(3, 5), 16);
                const sb = parseInt(sHex.slice(5, 7), 16);
                root.style.setProperty('--secondary-rgb', `${sr}, ${sg}, ${sb}`);
            } else {
                // Generate a companion color (slightly shifted hue/brightness)
                const sr = Math.min(255, r + 40);
                const sg = Math.max(0, g - 20);
                const sb = Math.min(255, b + 60);
                root.style.setProperty('--secondary', `rgb(${sr}, ${sg}, ${sb})`);
                root.style.setProperty('--secondary-rgb', `${sr}, ${sg}, ${sb}`);
            }
        }

        if (this.data.site?.theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }

    renderAll() {
        // Logo & Branding
        const logoText = document.getElementById('logo-text');
        if (logoText) logoText.textContent = this.data.site?.logo || DEFAULT_DATA.site.logo;
        const logoChar = document.getElementById('logo-icon-char');
        if (logoChar) {
            const text = this.data.site?.logo || DEFAULT_DATA.site.logo;
            logoChar.textContent = text.charAt(0);
        }

        // Dynamic Hero Title
        const heroTitle = document.getElementById('hero-title-main');
        if (heroTitle) heroTitle.innerHTML = this.data.hero.title || DEFAULT_DATA.hero.title;

        this.renderText();

        const heroImg = document.getElementById('hero-image');
        if (heroImg && this.data.hero.image) heroImg.src = this.data.hero.image;

        const cvBtn = document.getElementById('download-cv-btn');
        if (cvBtn && this.data.hero.cv_url) cvBtn.href = this.data.hero.cv_url;

        // Collections
        this.renderCollection('partners', 'partners-container', p => `<img src="${p.logo}" alt="Partner">`);

        this.renderCollection('projects', 'projects-container', p => `
            <div class="project-card reveal">
                <img src="${p.image || 'https://via.placeholder.com/600x400'}" class="project-img">
                <div class="project-meta">
                    <div class="project-header">
                        <div>
                            <div class="project-tag">${p.tag || 'Project'}</div>
                            <div class="project-name">${p.title}</div>
                        </div>
                        <a href="${p.demo || '#'}" class="arrow-btn" target="_blank"><i class="ph ph-arrow-up-right"></i></a>
                    </div>
                    ${p.subtitle ? `<div class="project-subtitle">${p.subtitle}</div>` : ''}
                    <div class="project-links">
                        ${p.github ? `<a href="${p.github}" class="project-link-icon" target="_blank" title="GitHub"><i class="ph ph-github-logo"></i></a>` : ''}
                        ${p.linkedin ? `<a href="${p.linkedin}" class="project-link-icon" target="_blank" title="LinkedIn"><i class="ph ph-linkedin-logo"></i></a>` : ''}
                        ${p.video ? `<a href="${p.video}" class="project-link-icon" target="_blank" title="Watch Video"><i class="ph ph-play-circle"></i></a>` : ''}
                    </div>
                </div>
            </div>
        `);

        this.renderCollection('experience', 'experience-container', e => `
            <div class="timeline-item reveal">
                <div class="timeline-dot"></div>
                <span class="timeline-date">${e.date}</span>
                <div class="timeline-content">
                    <h3>${e.title}</h3>
                    <h4>${e.subtitle}</h4>
                    <p>${e.desc}</p>
                </div>
            </div>
        `);

        this.renderSkillsCategorized();

        this.renderCollection('process', 'process-container', p => `
            <div class="process-item reveal">
                <div class="process-header">
                    <div class="process-num">${p.number}</div>
                    <div class="process-icon"><i class="ph ${p.icon || 'ph-lightning'}"></i></div>
                </div>
                <h4>${p.title}</h4>
                <p>${p.desc}</p>
            </div>
        `);

        this.renderCollection('education', 'education-container', e => `
            <div class="timeline-item reveal">
                <div class="timeline-dot"></div>
                <span class="timeline-date">${e.date}</span>
                <div class="timeline-content">
                    <h3>${e.title}</h3>
                    <h4>${e.subtitle}</h4>
                    <p>${e.desc}</p>
                </div>
            </div>
        `);

        this.renderCollection('certifications', 'certifications-container', c => `
            <a href="${c.url || '#'}" class="cert-card reveal" target="_blank">
                <div class="cert-icon"><i class="ph ph-certificate"></i></div>
                <div class="cert-info">
                    <h4>${c.title}</h4>
                    <p>${c.subtitle} • ${c.date}</p>
                </div>
            </a>
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

        this.renderCollection('socials', 'social-links-container', s => `
            <a href="${s.url}" class="social-item" target="_blank"><i class="ph ${s.icon}"></i></a>
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

    renderSkillsCategorized() {
        const container = document.getElementById('dynamic-skills-container');
        if (!container) return;
        const skills = this.data.skills || [];
        if (skills.length === 0) {
            const section = container.closest('section');
            if (section) section.style.display = 'none';
            return;
        }

        // Group skills by category
        const groups = {};
        skills.forEach(s => {
            const cat = s.category || 'Other';
            if (!groups[cat]) groups[cat] = { name: cat, icon: s.icon || 'ph-code', items: [] };
            groups[cat].items.push(s.name);
        });

        container.innerHTML = Object.values(groups).map(g => `
            <div class="skill-category reveal">
                <div class="category-header">
                    <i class="ph ${g.icon}"></i>
                    <h3>${g.name}</h3>
                </div>
                <div class="skill-tags">
                    ${g.items.map(name => `<span>${name}</span>`).join('')}
                </div>
            </div>
        `).join('');

        this.setupScrollEffect(); // Re-run to observe new elements
    }

    renderCollection(key, id, template) {
        const container = document.getElementById(id);
        if (!container) return;
        const items = this.data[key] || [];

        const sectionToHide = container.closest('section');

        if (items.length > 0) {
            container.innerHTML = items.map(template).join('');
            if (sectionToHide) sectionToHide.style.display = 'block';
            container.style.display = '';
        } else {
            // Never hide the contact section, as the form should always be visible
            if (sectionToHide && sectionToHide.id !== 'contact') {
                sectionToHide.style.display = 'none';
            }
            container.style.display = 'none';
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

    setupNavbarScroll() {
        const nav = document.querySelector('nav');
        const blob1 = document.querySelector('.blob-1');
        const blob2 = document.querySelector('.blob-2');

        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) nav.classList.add('scrolled');
            else nav.classList.remove('scrolled');

            // Simple Parallax
            const scrolled = window.scrollY;
            if (blob1) blob1.style.transform = `translate(${scrolled * 0.1}px, ${scrolled * 0.05}px)`;
            if (blob2) blob2.style.transform = `translate(-${scrolled * 0.1}px, -${scrolled * 0.05}px)`;
        });
    }

    setupContactForm() {
        const form = document.getElementById('main-contact-form');
        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                const btn = form.querySelector('button');
                const originalText = btn.innerHTML;

                // Use Formspree ID from site config or default to the provided one
                const formId = this.data.site?.form_id || 'xvgzpyzo';
                const actionUrl = `https://formspree.io/f/${formId}`;

                btn.disabled = true;
                btn.innerHTML = '<i class="ph ph-spinner-gap"></i> Sending...';

                const formData = new FormData(form);

                try {
                    const response = await fetch(actionUrl, {
                        method: 'POST',
                        body: formData,
                        headers: { 'Accept': 'application/json' }
                    });

                    if (response.ok) {
                        alert('Thank you! Your message has been sent successfully to Gmail.');
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
