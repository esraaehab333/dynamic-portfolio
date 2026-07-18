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
        this.updateFavicon();
        this.renderAll();

        document.getElementById('year').textContent = new Date().getFullYear();

        // Initial setup for reveal
        document.body.classList.add('is-loading');

        // Premium Loader Sequence with Cinematic Reveal
        await this.runPremiumLoader();

        this.setupScrollEffect();
        this.setupContactForm();
        this.setupNavbarScroll();
        this.setupInteractions();
    }

    async runPremiumLoader() {
        const overlay = document.getElementById('app-loading-overlay');
        const progressFill = document.getElementById('loader-progress-fill');
        const percentageText = document.getElementById('loader-percentage');
        const techText = document.getElementById('loader-tech-text');
        const particlesContainer = document.getElementById('loader-particles');

        if (!overlay) return;

        // Initialize Loader Particles
        for (let i = 0; i < 8; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.left = Math.random() * 100 + '%';
            p.style.top = '-5%';
            p.style.opacity = '0.15';
            p.style.background = 'var(--primary)';
            const size = Math.random() * 2 + 1 + 'px';
            p.style.width = size;
            p.style.height = size;
            p.style.setProperty('--duration', Math.random() * 10 + 15 + 's');
            p.style.setProperty('--move-x', (Math.random() - 0.5) * 100 + 'px');
            particlesContainer.appendChild(p);
        }

        const techStack = [
            "Android",
            "Kotlin",
            "Jetpack Compose",
            "Kotlin Multiplatform",
            "Clean Architecture",
            "CI/CD",
            "Open Source"
        ];

        let progress = 0;
        let techIndex = 0;

        const updateTech = () => {
            if (techText) {
                techText.style.animation = 'techSlideOut 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards';
                setTimeout(() => {
                    techIndex = (techIndex + 1) % techStack.length;
                    techText.textContent = techStack[techIndex];
                    techText.style.animation = 'techSlideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards';
                }, 500);
            }
        };

        const techInterval = setInterval(updateTech, 1500);

        return new Promise(resolve => {
            const interval = setInterval(() => {
                progress += Math.random() * 12;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    clearInterval(techInterval);

                    // Final delay to admire the 100% state
                    setTimeout(() => {
                        this.startCinematicReveal(overlay, resolve);
                    }, 500);
                }

                if (progressFill) progressFill.style.width = progress + '%';
                if (percentageText) percentageText.textContent = Math.floor(progress) + '%';
            }, 200);
        });
    }

    startCinematicReveal(overlay, callback) {
        // Phase 1: Expansion of spotlight
        overlay.classList.add('reveal-active');
        document.body.classList.remove('is-loading');
        document.body.classList.add('reveal-init');

        setTimeout(() => {
            // Phase 2: Fade out overlay and start staggering in content
            overlay.classList.add('fade-out');
            document.body.classList.add('reveal-complete');

            setTimeout(() => {
                overlay.style.display = 'none';
                callback();
            }, 1500);
        }, 800);
    }

    setupInteractions() {
        // Theme Toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            // The initial state is handled by the script in <head> for zero-flash
            // but we ensure synchronization here.
            const savedTheme = localStorage.getItem('theme_preference');

            themeToggle.onclick = () => {
                const isDark = document.documentElement.classList.toggle('dark-mode');
                // Also toggle on body for legacy CSS support
                document.body.classList.toggle('dark-mode', isDark);

                localStorage.setItem('theme_preference', isDark ? 'dark' : 'light');
                this.updateThemeIcon();
                this.updateFavicon();
            };

            this.updateThemeIcon();
        }

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

        this.initVisualEffects();
    }

    updateThemeIcon() {
        const themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) return;
        const icon = themeToggle.querySelector('i');
        if (icon) {
            const isDark = document.documentElement.classList.contains('dark-mode');
            icon.className = isDark ? 'ph ph-moon' : 'ph ph-sun';
        }
    }

    updateFavicon() {
        const root = document.documentElement;
        // Get primary and secondary colors from computed styles to ensure we get the actual values
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

        // Update standard favicon
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            link.type = 'image/svg+xml';
            document.head.appendChild(link);
        }
        link.href = dataUrl;

        // Update Apple Touch Icon
        let appleLink = document.querySelector("link[rel='apple-touch-icon']");
        if (!appleLink) {
            appleLink = document.createElement('link');
            appleLink.rel = 'apple-touch-icon';
            document.head.appendChild(appleLink);
        }
        appleLink.href = dataUrl;
    }

    initVisualEffects() {
        const mouseGlow = document.getElementById('mouse-glow');
        const cursorFollower = document.createElement('div');
        cursorFollower.className = 'cursor-follower';
        const cursorGlow = document.createElement('div');
        cursorGlow.className = 'cursor-glow';
        document.body.appendChild(cursorFollower);
        document.body.appendChild(cursorGlow);

        let mouseX = 0, mouseY = 0;
        let followerX = 0, followerY = 0;
        let glowX = 0, glowY = 0;
        let isMoving = false;
        let moveTimeout;

        // Background Particles
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'bg-particles';
        document.body.appendChild(particlesContainer);
        for (let i = 0; i < 20; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.left = Math.random() * 100 + '%';
            p.style.top = Math.random() * 100 + '%';
            const size = Math.random() * 4 + 2 + 'px';
            p.style.width = size;
            p.style.height = size;
            p.style.setProperty('--duration', Math.random() * 10 + 20 + 's');
            p.style.setProperty('--move-x', (Math.random() - 0.5) * 300 + 'px');
            particlesContainer.appendChild(p);
        }

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            isMoving = true;
            clearTimeout(moveTimeout);
            moveTimeout = setTimeout(() => isMoving = false, 100);

            if (mouseGlow) {
                mouseGlow.style.opacity = '1';
                mouseGlow.style.left = e.clientX + 'px';
                mouseGlow.style.top = e.clientY + 'px';
            }

            // Interaction for cards and buttons
            document.querySelectorAll('.project-card, .skill-category, .glass-card, .btn, .social-item, .method-icon, .nav-links a, .cert-card').forEach(el => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                el.style.setProperty('--mouse-x', `${x}px`);
                el.style.setProperty('--mouse-y', `${y}px`);
            });
        });

        // Smooth cursor interpolation
        const tick = () => {
            followerX += (mouseX - followerX) * 0.15;
            followerY += (mouseY - followerY) * 0.15;
            glowX += (mouseX - glowX) * 0.08;
            glowY += (mouseY - glowY) * 0.08;

            cursorFollower.style.left = followerX + 'px';
            cursorFollower.style.top = followerY + 'px';
            cursorGlow.style.left = glowX + 'px';
            cursorGlow.style.top = glowY + 'px';

            if (!isMoving && mouseGlow) {
                mouseGlow.style.opacity = '0.4';
            }

            requestAnimationFrame(tick);
        };
        tick();

        // Magnetic Effect & Advanced Hover states
        const setupAdvancedInteractions = () => {
            // Interactive elements (Buttons, Links)
            document.querySelectorAll('.btn, .social-item, .nav-links a, .logo, .tech-icon-float, .method-icon').forEach(el => {
                if (el.dataset.interactInit) return;
                el.dataset.interactInit = 'true';

                el.addEventListener('mousemove', (e) => {
                    const rect = el.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    const moveX = (e.clientX - centerX) * 0.35;
                    const moveY = (e.clientY - centerY) * 0.35;
                    el.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
                    document.body.classList.add('cursor-active');
                });

                el.addEventListener('mouseleave', () => {
                    el.style.transform = '';
                    document.body.classList.remove('cursor-active');
                });
            });

            // Text elements (for text cursor)
            document.querySelectorAll('p, h1, h2, h3, .section-label, span').forEach(el => {
                el.addEventListener('mouseenter', () => document.body.classList.add('cursor-text'));
                el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-text'));
            });

            // View elements (Images, Cards)
            document.querySelectorAll('.project-card, .cert-card, .hero-image-box img').forEach(el => {
                el.addEventListener('mouseenter', () => document.body.classList.add('cursor-view'));
                el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-view'));
            });
        };
        setupAdvancedInteractions();

        // Re-run magnetic setup when new elements are rendered
        const observer = new MutationObserver(setupMagnetic);
        observer.observe(document.body, { childList: true, subtree: true });

        // Click Ripple Effect
        document.addEventListener('click', (e) => {
            const ripple = document.createElement('div');
            ripple.className = 'ripple-effect';
            ripple.style.left = e.clientX + 'px';
            ripple.style.top = e.clientY + 'px';
            document.body.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });

        // Add stagger order to reveal elements
        const addStagger = () => {
            document.querySelectorAll('.projects-grid, .skills-grid, .process-grid, .certs-grid, .nav-links').forEach(container => {
                container.querySelectorAll('.reveal').forEach((el, index) => {
                    el.style.setProperty('--order', index);
                });
            });
        };
        addStagger();
        const staggerObserver = new MutationObserver(addStagger);
        staggerObserver.observe(document.body, { childList: true, subtree: true });
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

            if (this.data.site.secondary && this.data.site.secondary !== '#000000' && this.data.site.secondary !== '') {
                const sHex = this.data.site.secondary;
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

        // Only apply API theme if user hasn't set a preference yet
        if (!localStorage.getItem('theme_preference')) {
            if (this.data.site?.theme === 'dark') {
                document.documentElement.classList.add('dark-mode');
                document.body.classList.add('dark-mode');
            } else {
                document.documentElement.classList.remove('dark-mode');
                document.body.classList.remove('dark-mode');
            }
        }
        this.updateThemeIcon();
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
            <a href="${url}" class="contact-method reveal" target="_blank">
                <div class="method-icon"><i class="ph ${c.icon}"></i></div>
                <div class="method-label">${c.label}</div>
            </a>
            `;
        });

        this.renderCollection('socials', 'social-links-container', s => `
            <a href="${s.url}" class="contact-method reveal" target="_blank">
                <div class="method-icon"><i class="ph ${s.icon}"></i></div>
                <div class="method-label">${s.name || ''}</div>
            </a>
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
        let scrollTimeout;

        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) nav.classList.add('scrolled');
            else nav.classList.remove('scrolled');

            // Depth Illusion Logic
            document.body.classList.add('is-scrolling');
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                document.body.classList.remove('is-scrolling');
            }, 150);

            // Simple Parallax
            const scrolled = window.scrollY;
            if (blob1) blob1.style.transform = `translate(${scrolled * 0.1}px, ${scrolled * 0.05}px)`;
            if (blob2) blob2.style.transform = `translate(-${scrolled * 0.1}px, -${scrolled * 0.05}px)`;

            // Parallax for sections
            document.querySelectorAll('[data-parallax]').forEach(el => {
                const speed = el.dataset.parallax || 0.1;
                el.style.transform = `translateY(${scrolled * speed}px)`;
            });
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
