const API_URL = 'https://portfolio-api.esraaehabb333.workers.dev';
const ADMIN_EMAIL = 'admin@esraa.dev';
const ADMIN_PASSWORD = 'admin123';

const DEFAULT_DATA = {
    site: { logo: "ESRAA EHAB", accent: "#0055FF", theme: "light" },
    hero: {
        name: "HELLO, I'M ESRAA EHAB LOTFY",
        title: "Junior <span>Android Developer</span>",
        description: "Mobile Application Developer specializing in high-performance, user-centric apps.",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
        cv_url: "#"
    },
    about: { bio: "" },
    contact: { title: "", subtitle: "" },
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
            const data = await res.json();
            const cleaned = { ...DEFAULT_DATA, ...data };
            if (data.project && !data.projects) cleaned.projects = data.project;
            if (data.skill && !data.skills) cleaned.skills = data.skill;
            if (data.service && !data.services) cleaned.services = data.service;
            if (data.partner && !data.partners) cleaned.partners = data.partner;
            return cleaned;
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
        document.getElementById('site-secondary').value = this.data.site?.secondary || '';
        document.getElementById('site-theme').value = this.data.site?.theme || DEFAULT_DATA.site.theme;
        document.getElementById('site-form-id').value = this.data.site?.form_id || '';
        document.getElementById('hero-name').value = this.data.hero?.name || '';
        document.getElementById('hero-title').value = this.data.hero?.title || '';
        document.getElementById('hero-description').value = this.data.hero?.description || '';
        document.getElementById('hero-image').value = this.data.hero?.image || '';
        document.getElementById('hero-cv').value = this.data.hero?.cv_url || '';
        document.getElementById('contact-title').value = this.data.contact?.title || '';
        document.getElementById('contact-subtitle').value = this.data.contact?.subtitle || '';
        if (document.getElementById('about-bio')) {
            document.getElementById('about-bio').value = this.data.about?.bio || '';
        }
    }

    saveSite() {
        if (!this.data.site) this.data.site = {};
        this.data.site.logo = document.getElementById('site-logo').value;
        this.data.site.accent = document.getElementById('site-accent').value;
        this.data.site.secondary = document.getElementById('site-secondary').value;
        this.data.site.theme = document.getElementById('site-theme').value;
        this.data.site.form_id = document.getElementById('site-form-id').value;
        this.saveData();
    }

    saveHero() {
        this.data.hero.name = document.getElementById('hero-name').value;
        this.data.hero.title = document.getElementById('hero-title').value;
        this.data.hero.description = document.getElementById('hero-description').value;
        this.data.hero.image = document.getElementById('hero-image').value;
        this.data.hero.cv_url = document.getElementById('hero-cv').value;
        this.saveData();
    }

    saveAbout() {
        if (!this.data.about) this.data.about = {};
        this.data.about.bio = document.getElementById('about-bio').value;
        this.saveData();
    }

    renderLists() {
        const collections = ['projects', 'experience', 'process', 'skills', 'education', 'certifications', 'contacts', 'socials'];
        collections.forEach(col => {
            const container = document.getElementById(col + '-list');
            if (!container) return;
            container.innerHTML = (this.data[col] || []).map((item, idx) => `
                <div class="list-item">
                    <span style="font-weight: 700;">${item.title || item.name || item.author || item.label || 'Item ' + (idx+1)} ${item.category ? `<small style="color:var(--admin-text-muted); font-weight:400; margin-left:8px;">(${item.category})</small>` : ''}</span>
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
        if (mode === 'projects') {
            html = `
                <div class="form-group"><label>Title</label><input id="m-title" class="form-control" value="${item.title||''}"></div>
                <div class="form-group"><label>Subtitle / Description</label><input id="m-subtitle" class="form-control" value="${item.subtitle||''}"></div>
                <div class="form-group"><label>Tag (e.g. Kotlin | Compose)</label><input id="m-tag" class="form-control" value="${item.tag||''}"></div>
                <div class="form-group"><label>Image URL</label><input id="m-image" class="form-control" value="${item.image||''}"></div>
                <div class="form-group"><label>Live Demo URL</label><input id="m-demo" class="form-control" value="${item.demo||''}"></div>
                <div class="form-group"><label>GitHub URL</label><input id="m-github" class="form-control" value="${item.github||''}"></div>
                <div class="form-group"><label>LinkedIn URL</label><input id="m-linkedin" class="form-control" value="${item.linkedin||''}"></div>
                <div class="form-group"><label>Video URL</label><input id="m-video" class="form-control" value="${item.video||''}"></div>
            `;
        } else if (mode === 'experience') {
            html = `
                <div class="form-group"><label>Date Range (e.g. 2022 - Present)</label><input id="m-date" class="form-control" value="${item.date||''}"></div>
                <div class="form-group"><label>Job Title</label><input id="m-title" class="form-control" value="${item.title||''}"></div>
                <div class="form-group"><label>Company Name</label><input id="m-subtitle" class="form-control" value="${item.subtitle||''}"></div>
                <div class="form-group"><label>Description</label><textarea id="m-desc" class="form-control">${item.desc||''}</textarea></div>
            `;
        } else if (mode === 'process') {
            html = `<div class="form-group"><label>Number</label><input id="m-number" class="form-control" value="${item.number||''}"></div><div class="form-group"><label>Icon (ph-*)</label><input id="m-icon" class="form-control" value="${item.icon||''}"></div><div class="form-group"><label>Title</label><input id="m-title" class="form-control" value="${item.title||''}"></div><div class="form-group"><label>Description</label><textarea id="m-desc" class="form-control">${item.desc||''}</textarea></div>`;
        } else if (mode === 'skills') {
            html = `<div class="form-group"><label>Category (e.g. Android, Architecture, Tools)</label><input id="m-category" class="form-control" value="${item.category||''}"></div><div class="form-group"><label>Icon (ph-*)</label><input id="m-icon" class="form-control" value="${item.icon||''}"></div><div class="form-group"><label>Name</label><input id="m-name" class="form-control" value="${item.name||''}"></div>`;
        } else if (mode === 'education') {
            html = `
                <div class="form-group"><label>Date Range</label><input id="m-date" class="form-control" value="${item.date||''}"></div>
                <div class="form-group"><label>Degree/Major</label><input id="m-title" class="form-control" value="${item.title||''}"></div>
                <div class="form-group"><label>School/University</label><input id="m-subtitle" class="form-control" value="${item.subtitle||''}"></div>
                <div class="form-group"><label>Description</label><textarea id="m-desc" class="form-control">${item.desc||''}</textarea></div>
            `;
        } else if (mode === 'certifications') {
            html = `
                <div class="form-group"><label>Certification Name</label><input id="m-title" class="form-control" value="${item.title||''}"></div>
                <div class="form-group"><label>Issuer</label><input id="m-subtitle" class="form-control" value="${item.subtitle||''}"></div>
                <div class="form-group"><label>Date</label><input id="m-date" class="form-control" value="${item.date||''}"></div>
                <div class="form-group"><label>Link</label><input id="m-url" class="form-control" value="${item.url||''}"></div>
            `;
        } else if (mode === 'contacts') {
            html = `<div class="form-group"><label>Icon</label><input id="m-icon" class="form-control" value="${item.icon||''}"></div><div class="form-group"><label>Label</label><input id="m-label" class="form-control" value="${item.label||''}"></div><div class="form-group"><label>Value</label><input id="m-value" class="form-control" value="${item.value||''}"></div><div class="form-group"><label>Link</label><input id="m-url" class="form-control" value="${item.url||''}"></div>`;
        } else if (mode === 'socials') {
            html = `<div class="form-group"><label>Name (e.g. GitHub)</label><input id="m-name" class="form-control" value="${item.name||''}"></div><div class="form-group"><label>Icon (ph-*)</label><input id="m-icon" class="form-control" value="${item.icon||''}"></div><div class="form-group"><label>Link</label><input id="m-url" class="form-control" value="${item.url||''}"></div>`;
        } else if (mode === 'partners') {
            html = `<div class="form-group"><label>Logo URL</label><input id="m-logo" class="form-control" value="${item.logo||''}"></div>`;
        }
        document.getElementById('modal-body').innerHTML = html;
        document.getElementById('generic-modal').classList.add('active');
    }

    closeModal() { document.getElementById('generic-modal').classList.remove('active'); }

    saveModal() {
        const mode = this.currentMode;
        let newItem = { id: Date.now() };
        if (mode === 'projects') {
            newItem = { ...newItem,
                title: document.getElementById('m-title').value,
                subtitle: document.getElementById('m-subtitle').value,
                tag: document.getElementById('m-tag').value,
                image: document.getElementById('m-image').value,
                demo: document.getElementById('m-demo').value,
                github: document.getElementById('m-github').value,
                linkedin: document.getElementById('m-linkedin').value,
                video: document.getElementById('m-video').value
            };
        } else if (mode === 'experience' || mode === 'education') {
            newItem = { ...newItem,
                date: document.getElementById('m-date').value,
                title: document.getElementById('m-title').value,
                subtitle: document.getElementById('m-subtitle').value,
                desc: document.getElementById('m-desc').value
            };
        } else if (mode === 'process') {
            newItem = { ...newItem, number: document.getElementById('m-number').value, icon: document.getElementById('m-icon').value, title: document.getElementById('m-title').value, desc: document.getElementById('m-desc').value };
        } else if (mode === 'skills') {
            newItem = { ...newItem, category: document.getElementById('m-category').value, icon: document.getElementById('m-icon').value, name: document.getElementById('m-name').value };
        } else if (mode === 'certifications') {
            newItem = { ...newItem,
                title: document.getElementById('m-title').value,
                subtitle: document.getElementById('m-subtitle').value,
                date: document.getElementById('m-date').value,
                url: document.getElementById('m-url').value
            };
        } else if (mode === 'contacts') {
            newItem = { ...newItem, icon: document.getElementById('m-icon').value, label: document.getElementById('m-label').value, value: document.getElementById('m-value').value, url: document.getElementById('m-url').value };
        } else if (mode === 'socials') {
            newItem = { ...newItem, name: document.getElementById('m-name').value, icon: document.getElementById('m-icon').value, url: document.getElementById('m-url').value };
        } else if (mode === 'partners') {
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
