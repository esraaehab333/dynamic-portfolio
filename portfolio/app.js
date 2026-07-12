// Initial Default Data
const DEFAULT_DATA = {
    theme: {
        accent: '#3EB489',
        surface: '#162420'
    },
    hero: {
        eyebrow: 'HELLO, I\'M ESRAA',
        title: 'Mobile App Developer',
        description: 'Crafting elegant, high-performance mobile experiences with Kotlin Multiplatform and Compose.',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    },
    about: {
        subtitle: 'Esraa — Kotlin Enthusiast',
        bio: 'I am a passionate mobile app developer specializing in Android and Kotlin Multiplatform. I love building seamless cross-platform experiences that feel truly native, focusing on robust architectures and beautiful UIs.',
    },
    contact: {
        title: 'Get In Touch',
        subtitle: 'Currently open for new opportunities. Let\'s build something amazing together.'
    },
    socials: [
        { id: 1, icon: 'ph-github-logo', url: 'https://github.com' },
        { id: 2, icon: 'ph-linkedin-logo', url: 'https://linkedin.com' },
        { id: 3, icon: 'ph-envelope-simple', url: 'mailto:hello@example.com' }
    ],
    stats: [
        { id: 1, number: '5+', label: 'Years Experience' },
        { id: 2, number: '20+', label: 'Apps Published' },
        { id: 3, number: '100%', label: 'Kotlin Love' }
    ],
    skills: [
        {
            id: 1,
            title: 'Native Android',
            icon: 'ph-android-logo',
            items: ['Kotlin', 'Jetpack Compose', 'Coroutines', 'Flow', 'Dagger/Hilt', 'Room']
        },
        {
            id: 2,
            title: 'Multiplatform',
            icon: 'ph-devices',
            items: ['Kotlin Multiplatform (KMP)', 'Compose Multiplatform (CMP)', 'Ktor', 'SQLDelight']
        },
        {
            id: 3,
            title: 'Architecture',
            icon: 'ph-buildings',
            items: ['MVVM', 'MVI', 'Clean Architecture', 'Modularization', 'TDD']
        }
    ],
    projects: [
        {
            id: 1,
            title: 'Troves KMP App',
            desc: 'A cross-platform e-commerce application built entirely with Compose Multiplatform, sharing UI and logic across iOS and Android.',
            tags: ['KMP', 'Compose', 'Ktor'],
            demo: '#',
            github: 'https://github.com'
        },
        {
            id: 2,
            title: 'Fitness Tracker',
            desc: 'Native Android app tracking daily workouts with beautiful charts and local first architecture.',
            tags: ['Android', 'Room', 'Coroutines'],
            demo: '#',
            github: 'https://github.com'
        }
    ],
    contacts: [
        { id: 1, icon: 'ph-envelope-simple', label: 'Email', value: 'hello@esraa.dev', url: 'mailto:hello@esraa.dev' },
        { id: 2, icon: 'ph-phone', label: 'Phone', value: '+1 234 567 8900', url: 'tel:+12345678900' }
    ]
};

class PortfolioApp {
    constructor() {
        this.data = this.loadData();
        this.init();
    }

    loadData() {
        const stored = localStorage.getItem('portfolio_data');
        return stored ? JSON.parse(stored) : DEFAULT_DATA;
    }

    init() {
        this.applyTheme();
        this.renderAll();
        this.setupEventListeners();
        this.setupAnimations();
        
        // Set current year
        document.getElementById('year').textContent = new Date().getFullYear();
    }

    applyTheme() {
        document.documentElement.style.setProperty('--accent-color', this.data.theme.accent);
        document.documentElement.style.setProperty('--surface-color', this.data.theme.surface);
    }

    renderAll() {
        this.renderTextContent();
        this.renderImage('hero.image', 'hero-image');
        this.renderSocials();
        this.renderStats();
        this.renderSkills();
        this.renderProjects();
        this.renderContacts();
    }

    renderTextContent() {
        document.querySelectorAll('[data-key]').forEach(el => {
            const keyPath = el.getAttribute('data-key').split('.');
            let value = this.data;
            for (let k of keyPath) {
                if (value) value = value[k];
            }
            if (value !== undefined) {
                el.textContent = value;
            }
        });
    }

    renderImage(key, elId) {
        const keyPath = key.split('.');
        let value = this.data;
        for (let k of keyPath) {
            if (value) value = value[k];
        }
        if (value) {
            const imgEl = document.getElementById(elId);
            if(imgEl) imgEl.src = value;
        }
    }

    renderSocials() {
        const container = document.getElementById('social-links-container');
        if(!container) return;
        container.innerHTML = this.data.socials.map((social) => `
            <a href="${social.url}" target="_blank" class="social-link" title="${social.url}">
                <i class="ph ${social.icon}"></i>
            </a>
        `).join('');
    }

    renderStats() {
        const container = document.getElementById('stats-container');
        if(!container) return;
        container.innerHTML = this.data.stats.map((stat) => `
            <div class="stat-card">
                <div class="stat-number font-mono">${stat.number}</div>
                <div class="stat-label">${stat.label}</div>
            </div>
        `).join('');
    }

    renderSkills() {
        const container = document.getElementById('skills-container');
        if(!container) return;
        container.innerHTML = this.data.skills.map((cat) => `
            <div class="skill-category">
                <h3 class="font-poiret"><i class="ph ${cat.icon}"></i> ${cat.title}</h3>
                <ul class="skill-list">
                    ${cat.items.map((item) => `
                        <li class="skill-item">${item}</li>
                    `).join('')}
                </ul>
            </div>
        `).join('');
    }

    renderProjects() {
        const container = document.getElementById('projects-container');
        if(!container) return;
        container.innerHTML = this.data.projects.map((proj) => `
            <div class="project-card">
                <div class="project-image">
                    ${proj.image ? `<img src="${proj.image}" alt="${proj.title}">` : ''}
                </div>
                <div class="project-content">
                    <h3 class="project-title font-poiret">${proj.title}</h3>
                    <p class="project-desc">${proj.desc}</p>
                    <div class="tech-tags font-mono">
                        ${proj.tags.map(tag => `<span class="tech-tag">${tag}</span>`).join('')}
                    </div>
                    <div class="project-links">
                        <a href="${proj.demo}" class="btn btn-primary" target="_blank">Demo</a>
                        <a href="${proj.github}" class="btn btn-outline" target="_blank">
                            <i class="ph ph-github-logo"></i> Repo
                        </a>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderContacts() {
        const container = document.getElementById('contact-container');
        if(!container) return;
        container.innerHTML = this.data.contacts.map((contact) => `
            <a href="${contact.url}" target="_blank" class="contact-card">
                <i class="ph ${contact.icon} contact-icon"></i>
                <div>
                    <div class="contact-label font-mono">${contact.label}</div>
                    <div class="contact-value">${contact.value}</div>
                </div>
            </a>
        `).join('');
    }

    setupEventListeners() {
        // Mobile Menu Toggle
        const menuBtn = document.querySelector('.mobile-menu-btn');
        const mobileMenu = document.querySelector('.mobile-menu');
        
        if(menuBtn && mobileMenu) {
            menuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('open');
                const icon = mobileMenu.classList.contains('open') ? 'ph-x' : 'ph-list';
                menuBtn.innerHTML = `<i class="ph ${icon}"></i>`;
            });

            document.querySelectorAll('.mobile-menu a').forEach(a => {
                a.addEventListener('click', () => {
                    mobileMenu.classList.remove('open');
                    menuBtn.innerHTML = `<i class="ph ph-list"></i>`;
                });
            });
        }

        // Active Nav State
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-links a');

        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (window.scrollY >= sectionTop - 150) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(a => {
                a.classList.remove('active');
                if (a.getAttribute('href').includes(current)) {
                    a.classList.add('active');
                }
            });
        });
    }

    setupAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }
}

// Initialize App
const app = new PortfolioApp();
