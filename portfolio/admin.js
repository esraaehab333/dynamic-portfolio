// ─── API Config ─────────────────────────────────────────────────────────────
const API_URL = 'https://portfolio-api.esraaehabb333.workers.dev';

// ─── Default Data (used only when the API returns an empty object) ───────────
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

// ─── Admin Credentials (client-side gate only) ───────────────────────────────
const ADMIN_EMAIL    = 'admin@esraa.dev';
const ADMIN_PASSWORD = 'admin123';

// ─── Admin App ────────────────────────────────────────────────────────────────
class AdminApp {
    constructor() {
        this.data = null;
        this.currentModalMode = null;
        this.editIndex = null;

        this._initAuth();
    }

    // ── Auth Gate ─────────────────────────────────────────────────────────────
    _initAuth() {
        const loginScreen = document.getElementById('login-screen');
        const dashboard   = document.getElementById('dashboard');
        const loginForm   = document.getElementById('login-form');
        const loginError  = document.getElementById('login-error');

        // Check session
        if (sessionStorage.getItem('admin_authed') === '1') {
            loginScreen.hidden = true;
            dashboard.hidden   = false;
            this.init();
            return;
        }

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim();
            const pass  = document.getElementById('login-password').value;

            if (email === ADMIN_EMAIL && pass === ADMIN_PASSWORD) {
                sessionStorage.setItem('admin_authed', '1');
                loginScreen.hidden = true;
                dashboard.hidden   = false;
                loginError.textContent = '';
                this.init();
            } else {
                loginError.textContent = 'Invalid email or password.';
            }
        });
    }

    logout() {
        sessionStorage.removeItem('admin_authed');
        location.reload();
    }

    // ── Data Layer ─────────────────────────────────────────────────────────────
    async loadData() {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`GET ${API_URL} failed: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        // Fall back to DEFAULT_DATA only when the KV store is empty
        return Object.keys(data).length
            ? data
            : JSON.parse(JSON.stringify(DEFAULT_DATA));
    }

    async saveData() {
        const response = await fetch(API_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(this.data)
        });
        if (!response.ok) {
            throw new Error(`PUT ${API_URL} failed: ${response.status} ${response.statusText}`);
        }
        const result = await response.json();
        if (!result.success) {
            throw new Error('Worker responded with success: false');
        }
    }

    // ── Initialisation ─────────────────────────────────────────────────────────
    async init() {
        this.setLoading(true, 'Loading your portfolio data…');
        try {
            this.data = await this.loadData();
            this.setupNavigation();
            this.populateForms();
            this.renderLists();
        } catch (err) {
            console.error('Failed to load data:', err);
            this.showToast('⚠️ Could not load data from the server. Please refresh and try again.', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    // ── UI Helpers ─────────────────────────────────────────────────────────────
    setLoading(visible, message = '') {
        const overlay = document.getElementById('loading-overlay');
        const msgEl   = document.getElementById('loading-message');
        if (!overlay) return;
        if (visible) {
            if (msgEl) msgEl.textContent = message;
            overlay.removeAttribute('hidden');
        } else {
            overlay.setAttribute('hidden', '');
        }
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = message;
        toast.className = `toast toast--${type} toast--visible`;
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => {
            toast.classList.remove('toast--visible');
        }, 3500);
    }

    // ── Save with feedback ─────────────────────────────────────────────────────
    async _save(label) {
        this.setLoading(true, `Saving ${label}…`);
        try {
            await this.saveData();
            this.showToast(`✅ ${label} saved successfully!`, 'success');
        } catch (err) {
            console.error('Save failed:', err);
            this.showToast(`❌ Failed to save ${label}. Please try again.`, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    // ── Navigation ─────────────────────────────────────────────────────────────
    setupNavigation() {
        const navItems = document.querySelectorAll('.admin-nav-item');
        const sections = document.querySelectorAll('.admin-section');

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');

                const targetId = item.getAttribute('data-target') + '-section';
                sections.forEach(sec => {
                    sec.classList.remove('active');
                    if (sec.id === targetId) sec.classList.add('active');
                });
            });
        });
    }

    // ── Populate Forms ─────────────────────────────────────────────────────────
    populateForms() {
        // Theme
        document.getElementById('theme-accent').value  = this.data.theme.accent;
        document.getElementById('theme-surface').value = this.data.theme.surface;

        // Hero
        document.getElementById('hero-eyebrow').value      = this.data.hero.eyebrow;
        document.getElementById('hero-title').value         = this.data.hero.title;
        document.getElementById('hero-description').value   = this.data.hero.description;
        document.getElementById('hero-image').value         = this.data.hero.image;

        // About
        document.getElementById('about-subtitle').value = this.data.about.subtitle;
        document.getElementById('about-bio').value      = this.data.about.bio;

        // Contact
        document.getElementById('contact-title').value    = this.data.contact.title;
        document.getElementById('contact-subtitle').value = this.data.contact.subtitle;
    }

    // ── Render Lists ───────────────────────────────────────────────────────────
    renderLists() {
        // Socials
        const socialsList = document.getElementById('socials-list');
        socialsList.innerHTML = this.data.socials.map((item, index) => `
            <div class="list-item">
                <div class="list-item-content">
                    <strong><i class="ph ${item.icon}"></i> ${item.icon}</strong>
                    <div style="font-size: 0.8rem; color: #888;">${item.url}</div>
                </div>
                <div class="list-item-actions">
                    <button class="btn-icon" onclick="adminApp.openModal('social', ${index})"><i class="ph ph-pencil"></i></button>
                    <button class="btn-icon delete" onclick="adminApp.deleteItem('socials', ${index})"><i class="ph ph-trash"></i></button>
                </div>
            </div>
        `).join('');

        // Stats
        const statsList = document.getElementById('stats-list');
        statsList.innerHTML = this.data.stats.map((item, index) => `
            <div class="list-item">
                <div class="list-item-content">
                    <strong>${item.number}</strong>
                    <div style="font-size: 0.8rem; color: #888;">${item.label}</div>
                </div>
                <div class="list-item-actions">
                    <button class="btn-icon" onclick="adminApp.openModal('stat', ${index})"><i class="ph ph-pencil"></i></button>
                    <button class="btn-icon delete" onclick="adminApp.deleteItem('stats', ${index})"><i class="ph ph-trash"></i></button>
                </div>
            </div>
        `).join('');

        // Skills
        const skillsList = document.getElementById('skills-list');
        skillsList.innerHTML = this.data.skills.map((item, index) => `
            <div class="list-item">
                <div class="list-item-content">
                    <strong><i class="ph ${item.icon}"></i> ${item.title}</strong>
                    <div style="font-size: 0.8rem; color: #888;">${item.items.join(', ')}</div>
                </div>
                <div class="list-item-actions">
                    <button class="btn-icon" onclick="adminApp.openModal('skill', ${index})"><i class="ph ph-pencil"></i></button>
                    <button class="btn-icon delete" onclick="adminApp.deleteItem('skills', ${index})"><i class="ph ph-trash"></i></button>
                </div>
            </div>
        `).join('');

        // Projects
        const projectsList = document.getElementById('projects-list');
        projectsList.innerHTML = this.data.projects.map((item, index) => `
            <div class="list-item">
                <div class="list-item-content">
                    <strong>${item.title}</strong>
                    <div style="font-size: 0.8rem; color: #888;">${item.desc.substring(0, 50)}...</div>
                </div>
                <div class="list-item-actions">
                    <button class="btn-icon" onclick="adminApp.openModal('project', ${index})"><i class="ph ph-pencil"></i></button>
                    <button class="btn-icon delete" onclick="adminApp.deleteItem('projects', ${index})"><i class="ph ph-trash"></i></button>
                </div>
            </div>
        `).join('');

        // Contacts
        const contactsList = document.getElementById('contacts-list');
        contactsList.innerHTML = this.data.contacts.map((item, index) => `
            <div class="list-item">
                <div class="list-item-content">
                    <strong><i class="ph ${item.icon}"></i> ${item.label}</strong>
                    <div style="font-size: 0.8rem; color: #888;">${item.value}</div>
                </div>
                <div class="list-item-actions">
                    <button class="btn-icon" onclick="adminApp.openModal('contact', ${index})"><i class="ph ph-pencil"></i></button>
                    <button class="btn-icon delete" onclick="adminApp.deleteItem('contacts', ${index})"><i class="ph ph-trash"></i></button>
                </div>
            </div>
        `).join('');
    }

    // ── Section Saves ──────────────────────────────────────────────────────────
    saveTheme() {
        this.data.theme.accent  = document.getElementById('theme-accent').value;
        this.data.theme.surface = document.getElementById('theme-surface').value;
        this._save('Theme');
    }

    saveHero() {
        this.data.hero.eyebrow     = document.getElementById('hero-eyebrow').value;
        this.data.hero.title       = document.getElementById('hero-title').value;
        this.data.hero.description = document.getElementById('hero-description').value;
        this.data.hero.image       = document.getElementById('hero-image').value;
        this._save('Hero');
    }

    saveAbout() {
        this.data.about.subtitle = document.getElementById('about-subtitle').value;
        this.data.about.bio      = document.getElementById('about-bio').value;
        this._save('About');
    }

    saveContactText() {
        this.data.contact.title    = document.getElementById('contact-title').value;
        this.data.contact.subtitle = document.getElementById('contact-subtitle').value;
        this._save('Contact Info');
    }

    // ── List Management ────────────────────────────────────────────────────────
    async deleteItem(collection, index) {
        if (!confirm('Are you sure you want to delete this item?')) return;
        this.data[collection].splice(index, 1);
        this.renderLists();
        await this._save('Changes');
    }

    // ── Modal ──────────────────────────────────────────────────────────────────
    openModal(mode, index = null) {
        this.currentModalMode = mode;
        this.editIndex = index;

        const modal      = document.getElementById('generic-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody  = document.getElementById('modal-body');

        modalTitle.textContent = index !== null ? `Edit ${mode}` : `Add ${mode}`;

        let html = '';
        let item = null;

        if (mode === 'social') {
            item = index !== null ? this.data.socials[index] : { icon: 'ph-link', url: '' };
            html = `
                <div class="form-group"><label>Icon Class (e.g. ph-github-logo)</label><input type="text" id="m-icon" class="form-control" value="${item.icon}"></div>
                <div class="form-group"><label>URL</label><input type="text" id="m-url" class="form-control" value="${item.url}"></div>
            `;
        } else if (mode === 'stat') {
            item = index !== null ? this.data.stats[index] : { number: '', label: '' };
            html = `
                <div class="form-group"><label>Number (e.g. 5+)</label><input type="text" id="m-number" class="form-control" value="${item.number}"></div>
                <div class="form-group"><label>Label</label><input type="text" id="m-label" class="form-control" value="${item.label}"></div>
            `;
        } else if (mode === 'skill') {
            item = index !== null ? this.data.skills[index] : { title: '', icon: 'ph-code', items: [] };
            html = `
                <div class="form-group"><label>Category Title</label><input type="text" id="m-title" class="form-control" value="${item.title}"></div>
                <div class="form-group"><label>Icon Class</label><input type="text" id="m-icon" class="form-control" value="${item.icon}"></div>
                <div class="form-group"><label>Skills (comma separated)</label><input type="text" id="m-items" class="form-control" value="${item.items.join(', ')}"></div>
            `;
        } else if (mode === 'project') {
            item = index !== null ? this.data.projects[index] : { title: '', desc: '', tags: [], demo: '', github: '', image: '' };
            html = `
                <div class="form-group"><label>Title</label><input type="text" id="m-title" class="form-control" value="${item.title}"></div>
                <div class="form-group"><label>Description</label><textarea id="m-desc" class="form-control">${item.desc}</textarea></div>
                <div class="form-group"><label>Tags (comma separated)</label><input type="text" id="m-tags" class="form-control" value="${item.tags.join(', ')}"></div>
                <div class="form-group"><label>Image URL</label><input type="text" id="m-image" class="form-control" value="${item.image || ''}"></div>
                <div class="form-group"><label>Demo URL</label><input type="text" id="m-demo" class="form-control" value="${item.demo}"></div>
                <div class="form-group"><label>GitHub URL</label><input type="text" id="m-github" class="form-control" value="${item.github}"></div>
            `;
        } else if (mode === 'contact') {
            item = index !== null ? this.data.contacts[index] : { label: '', value: '', icon: 'ph-link', url: '' };
            html = `
                <div class="form-group"><label>Label (e.g. Email)</label><input type="text" id="m-label" class="form-control" value="${item.label}"></div>
                <div class="form-group"><label>Value</label><input type="text" id="m-value" class="form-control" value="${item.value}"></div>
                <div class="form-group"><label>Icon Class</label><input type="text" id="m-icon" class="form-control" value="${item.icon}"></div>
                <div class="form-group"><label>URL (e.g. mailto:...)</label><input type="text" id="m-url" class="form-control" value="${item.url}"></div>
            `;
        }

        modalBody.innerHTML = html;
        modal.classList.add('active');
    }

    closeModal() {
        document.getElementById('generic-modal').classList.remove('active');
        this.currentModalMode = null;
        this.editIndex = null;
    }

    async saveModal() {
        const mode  = this.currentModalMode;
        const index = this.editIndex;
        let newItem = { id: Date.now() };

        if (mode === 'social') {
            newItem.icon = document.getElementById('m-icon').value;
            newItem.url  = document.getElementById('m-url').value;
            if (index !== null) this.data.socials[index] = { ...this.data.socials[index], ...newItem };
            else this.data.socials.push(newItem);
        } else if (mode === 'stat') {
            newItem.number = document.getElementById('m-number').value;
            newItem.label  = document.getElementById('m-label').value;
            if (index !== null) this.data.stats[index] = { ...this.data.stats[index], ...newItem };
            else this.data.stats.push(newItem);
        } else if (mode === 'skill') {
            newItem.title = document.getElementById('m-title').value;
            newItem.icon  = document.getElementById('m-icon').value;
            newItem.items = document.getElementById('m-items').value.split(',').map(s => s.trim()).filter(s => s);
            if (index !== null) this.data.skills[index] = { ...this.data.skills[index], ...newItem };
            else this.data.skills.push(newItem);
        } else if (mode === 'project') {
            newItem.title  = document.getElementById('m-title').value;
            newItem.desc   = document.getElementById('m-desc').value;
            newItem.tags   = document.getElementById('m-tags').value.split(',').map(s => s.trim()).filter(s => s);
            newItem.image  = document.getElementById('m-image').value;
            newItem.demo   = document.getElementById('m-demo').value;
            newItem.github = document.getElementById('m-github').value;
            if (index !== null) this.data.projects[index] = { ...this.data.projects[index], ...newItem };
            else this.data.projects.push(newItem);
        } else if (mode === 'contact') {
            newItem.label = document.getElementById('m-label').value;
            newItem.value = document.getElementById('m-value').value;
            newItem.icon  = document.getElementById('m-icon').value;
            newItem.url   = document.getElementById('m-url').value;
            if (index !== null) this.data.contacts[index] = { ...this.data.contacts[index], ...newItem };
            else this.data.contacts.push(newItem);
        }

        this.closeModal();
        this.renderLists();
        await this._save('Changes');
    }
}

// ─── Initialize ───────────────────────────────────────────────────────────────
const adminApp = new AdminApp();
