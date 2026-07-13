const API_URL = 'https://portfolio-api.esraaehabb333.workers.dev';
const ADMIN_EMAIL = 'admin@esraa.dev';
const ADMIN_PASSWORD = 'admin123';

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

class AdminApp {
    constructor() {
        this.data = null;
        this.editIndex = null;
        this.currentMode = null;
        this._initAuth();
    }

    _initAuth() {
        if (sessionStorage.getItem('admin_authed') === '1') {
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('dashboard').style.display = 'flex';
            this.init();
        }
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            if (document.getElementById('login-email').value === ADMIN_EMAIL &&
                document.getElementById('login-password').value === ADMIN_PASSWORD) {
                sessionStorage.setItem('admin_authed', '1');
                location.reload();
            }
        });
    }

    logout() { sessionStorage.removeItem('admin_authed'); location.reload(); }

    async init() {
        this.data = await this.loadData();
        this.setupNav();
        this.populateForms();
        this.renderLists();
    }

    async loadData() {
        try {
            const res = await fetch(API_URL + '?t=' + Date.now());
            if (!res.ok) throw new Error("Fetch failed");
            const data = await res.json();
            return { ...DEFAULT_DATA, ...data };
        } catch (e) { return DEFAULT_DATA; }
    }

    async saveData() {
        await fetch(API_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(this.data)
        });
        this.showToast();
    }

    setupNav() {
        document.querySelectorAll('.admin-nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const target = item.dataset.target;
                if (!target) return;
                document.querySelectorAll('.admin-nav-item').forEach(i => i.classList.remove('active'));
                document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
                item.classList.add('active');
                document.getElementById(target + '-section').classList.add('active');
                document.getElementById('section-title-display').textContent = item.textContent.trim();
            });
        });
    }

    populateForms() {
        document.getElementById('site-logo').value = this.data.site?.logo || DEFAULT_DATA.site.logo;
        document.getElementById('site-accent').value = this.data.site?.accent || DEFAULT_DATA.site.accent;
        document.getElementById('site-theme').value = this.data.site?.theme || DEFAULT_DATA.site.theme;
        document.getElementById('hero-name').value = this.data.hero.name || '';
        document.getElementById('hero-title').value = this.data.hero.title || '';
        document.getElementById('hero-description').value = this.data.hero.description || '';
        document.getElementById('hero-image').value = this.data.hero.image || '';
        document.getElementById('contact-title').value = this.data.contact.title || '';
        document.getElementById('contact-subtitle').value = this.data.contact.subtitle || '';
        if (document.getElementById('about-bio')) {
            document.getElementById('about-bio').value = this.data.about?.bio || '';
        }
    }

    saveSite() {
        if (!this.data.site) this.data.site = {};
        this.data.site.logo = document.getElementById('site-logo').value;
        this.data.site.accent = document.getElementById('site-accent').value;
        this.data.site.theme = document.getElementById('site-theme').value;
        this.saveData();
    }

    saveHero() {
        this.data.hero.name = document.getElementById('hero-name').value;
        this.data.hero.title = document.getElementById('hero-title').value;
        this.data.hero.description = document.getElementById('hero-description').value;
        this.data.hero.image = document.getElementById('hero-image').value;
        this.saveData();
    }

    saveAbout() {
        if (!this.data.about) this.data.about = {};
        this.data.about.bio = document.getElementById('about-bio').value;
        this.saveData();
    }

    renderLists() {
        const collections = ['projects', 'services', 'process', 'skills', 'testimonials', 'contacts', 'socials', 'partners'];
        collections.forEach(col => {
            const container = document.getElementById(col + '-list');
            if (!container) return;
            container.innerHTML = (this.data[col] || []).map((item, idx) => `
                <div class="list-item">
                    <span style="font-weight: 700;">${item.title || item.name || item.author || item.label || 'Item ' + (idx+1)}</span>
                    <div>
                        <button class="btn-icon" onclick="adminApp.openModal('${col}', ${idx})" style="background:none; border:none; cursor:pointer; color:#0055FF; margin-right:1rem;"><i class="ph ph-pencil-simple" style="font-size:1.5rem;"></i></button>
                        <button class="btn-icon" onclick="adminApp.deleteItem('${col}', ${idx})" style="background:none; border:none; cursor:pointer; color:#ef4444;"><i class="ph ph-trash" style="font-size:1.5rem;"></i></button>
                    </div>
                </div>
            `).join('');
        });
    }

    deleteItem(col, idx) {
        if (confirm('Delete?')) {
            this.data[col].splice(idx, 1);
            this.renderLists();
            this.saveData();
        }
    }

    openModal(mode, idx = null) {
        this.currentMode = mode;
        this.editIndex = idx;
        const item = idx !== null ? this.data[mode][idx] : {};
        let html = '';
        if (mode === 'project') {
            html = `<div class="form-group"><label>Title</label><input id="m-title" class="form-control" value="${item.title||''}"></div><div class="form-group"><label>Tag</label><input id="m-tag" class="form-control" value="${item.tag||''}"></div><div class="form-group"><label>Image URL</label><input id="m-image" class="form-control" value="${item.image||''}"></div><div class="form-group"><label>Link</label><input id="m-demo" class="form-control" value="${item.demo||''}"></div>`;
        } else if (mode === 'service') {
            html = `<div class="form-group"><label>Icon (ph-*)</label><input id="m-icon" class="form-control" value="${item.icon||''}"></div><div class="form-group"><label>Title</label><input id="m-title" class="form-control" value="${item.title||''}"></div><div class="form-group"><label>Description</label><textarea id="m-desc" class="form-control">${item.desc||''}</textarea></div>`;
        } else if (mode === 'process') {
            html = `<div class="form-group"><label>Number</label><input id="m-number" class="form-control" value="${item.number||''}"></div><div class="form-group"><label>Title</label><input id="m-title" class="form-control" value="${item.title||''}"></div><div class="form-group"><label>Description</label><textarea id="m-desc" class="form-control">${item.desc||''}</textarea></div>`;
        } else if (mode === 'skill') {
            html = `<div class="form-group"><label>Icon (ph-*)</label><input id="m-icon" class="form-control" value="${item.icon||''}"></div><div class="form-group"><label>Name</label><input id="m-name" class="form-control" value="${item.name||''}"></div>`;
        } else if (mode === 'testimonial') {
            html = `<div class="form-group"><label>Text</label><textarea id="m-text" class="form-control">${item.text||''}</textarea></div><div class="form-group"><label>Author</label><input id="m-author" class="form-control" value="${item.author||''}"></div><div class="form-group"><label>Role</label><input id="m-title" class="form-control" value="${item.title||''}"></div><div class="form-group"><label>Image URL</label><input id="m-image" class="form-control" value="${item.image||''}"></div>`;
        } else if (mode === 'contact') {
            html = `<div class="form-group"><label>Icon</label><input id="m-icon" class="form-control" value="${item.icon||''}"></div><div class="form-group"><label>Label</label><input id="m-label" class="form-control" value="${item.label||''}"></div><div class="form-group"><label>Value</label><input id="m-value" class="form-control" value="${item.value||''}"></div><div class="form-group"><label>Link</label><input id="m-url" class="form-control" value="${item.url||''}"></div>`;
        } else if (mode === 'social') {
            html = `<div class="form-group"><label>Icon</label><input id="m-icon" class="form-control" value="${item.icon||''}"></div><div class="form-group"><label>Link</label><input id="m-url" class="form-control" value="${item.url||''}"></div>`;
        } else if (mode === 'partner') {
            html = `<div class="form-group"><label>Logo URL</label><input id="m-logo" class="form-control" value="${item.logo||''}"></div>`;
        }
        document.getElementById('modal-body').innerHTML = html;
        document.getElementById('generic-modal').classList.add('active');
    }

    closeModal() { document.getElementById('generic-modal').classList.remove('active'); }

    saveModal() {
        const mode = this.currentMode;
        let newItem = { id: Date.now() };
        if (mode === 'project') {
            newItem = { ...newItem, title: document.getElementById('m-title').value, tag: document.getElementById('m-tag').value, image: document.getElementById('m-image').value, demo: document.getElementById('m-demo').value };
        } else if (mode === 'service') {
            newItem = { ...newItem, icon: document.getElementById('m-icon').value, title: document.getElementById('m-title').value, desc: document.getElementById('m-desc').value };
        } else if (mode === 'process') {
            newItem = { ...newItem, number: document.getElementById('m-number').value, title: document.getElementById('m-title').value, desc: document.getElementById('m-desc').value };
        } else if (mode === 'skill') {
            newItem = { ...newItem, icon: document.getElementById('m-icon').value, name: document.getElementById('m-name').value };
        } else if (mode === 'testimonial') {
            newItem = { ...newItem, text: document.getElementById('m-text').value, author: document.getElementById('m-author').value, title: document.getElementById('m-title').value, image: document.getElementById('m-image').value };
        } else if (mode === 'contact') {
            newItem = { ...newItem, icon: document.getElementById('m-icon').value, label: document.getElementById('m-label').value, value: document.getElementById('m-value').value, url: document.getElementById('m-url').value };
        } else if (mode === 'social') {
            newItem = { ...newItem, icon: document.getElementById('m-icon').value, url: document.getElementById('m-url').value };
        } else if (mode === 'partner') {
            newItem = { ...newItem, logo: document.getElementById('m-logo').value };
        }
        if (this.editIndex !== null) this.data[mode][this.editIndex] = newItem;
        else { if (!this.data[mode]) this.data[mode] = []; this.data[mode].push(newItem); }
        this.closeModal();
        this.renderLists();
        this.saveData();
    }

    showToast() {
        const t = document.getElementById('toast');
        t.style.display = 'block';
        setTimeout(() => t.style.display = 'none', 3000);
    }
}
const adminApp = new AdminApp();
