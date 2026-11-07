import { API_URL } from '../config.js';
import { getAdminToken, initAuth, logout } from './auth.js';
import { setupNav } from './shared/nav.js';
import { showToast } from './shared/toast.js';
import { renderLists, deleteItem } from './shared/collection.js';
import { openModal, closeModal, saveModal } from './shared/modal.js';
import { uploadImageFile } from './shared/image-field.js';
import { buildMailtoHref, DEFAULT_EMAIL_SUBJECT, DEFAULT_EMAIL_BODY, contactKind, contactValue } from '../core/contact-links.js';

import * as siteSection from './sections/site.js';
import * as heroSection from './sections/hero.js';
import * as aboutSection from './sections/about.js';
import * as contactsSection from './sections/contacts.js';

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

class AdminApp {
    constructor() {
        this.data = null;
        this.editIndex = null;
        this.currentMode = null;
        this.etag = null;
        this.saveQueue = Promise.resolve();
        this._initAuth();
    }

    _initAuth() {
        initAuth(() => this.init());
    }

    logout() {
        logout();
    }

    async init() {
        this.data = await this.loadData();
        if (!this.data) return;
        setupNav();
        this.populateForms();
        renderLists(this.data);
        this.updateDataSize();
        this.updateFavicon();
        this.loadBackups();
    }

    showLoadError() {
        let errPanel = document.getElementById('admin-load-error-panel');
        if (!errPanel) {
            errPanel = document.createElement('div');
            errPanel.id = 'admin-load-error-panel';
            errPanel.style.cssText = 'background: #fef2f2; border: 1px solid #fca5a5; color: #991b1b; padding: 2rem; border-radius: 16px; margin-bottom: 2rem; text-align: center; font-weight: 600;';
            errPanel.innerHTML = `
                <h3 style="margin: 0 0 0.5rem; font-size: 1.25rem;">Couldn't load your data. Saving is disabled.</h3>
                <p style="margin: 0 0 1rem; font-weight: normal; font-size: 0.9rem;">Please check your connection and try again.</p>
                <button type="button" class="btn-save" onclick="adminApp.init()" style="background: #dc2626; padding: 0.5rem 1.5rem;">Retry</button>
            `;
            const main = document.querySelector('.admin-main');
            if (main) main.prepend(errPanel);
        }
        errPanel.hidden = false;
        document.querySelectorAll('.btn-save, button[onclick*="save"]').forEach(btn => {
            btn.disabled = true;
        });
    }

    hideLoadError() {
        const errPanel = document.getElementById('admin-load-error-panel');
        if (errPanel) errPanel.hidden = true;
        document.querySelectorAll('.btn-save, button[onclick*="save"]').forEach(btn => {
            btn.disabled = false;
        });
    }

    async loadData() {
        const token = getAdminToken();
        if (!token) {
            logout('Session expired');
            return null;
        }

        try {
            const res = await fetch(API_URL + '?t=' + Date.now(), {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.status === 401) {
                logout('Session expired');
                return null;
            }

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            this.etag = res.headers.get('ETag') || null;
            const data = await res.json();

            // Preserve compatibility with older API records that used singular keys.
            if (data.project && !data.projects) data.projects = data.project;
            if (data.skill && !data.skills) data.skills = data.skill;
            if (data.service && !data.services) data.services = data.service;
            if (data.partner && !data.partners) data.partners = data.partner;

            this.hideLoadError();
            return data;
        } catch (e) {
            this.showLoadError();
            return null;
        }
    }

    async saveData(triggerBtn = null) {
        this.saveQueue = this.saveQueue.then(() => this._executeSave(triggerBtn)).catch(() => {});
        return this.saveQueue;
    }

    async _executeSave(triggerBtn = null) {
        if (!this.data) {
            showToast('Data not loaded. Cannot save.', true);
            return;
        }

        const token = getAdminToken();
        if (!token) {
            logout('Session expired');
            return;
        }

        let origText = '';
        if (triggerBtn) {
            origText = triggerBtn.textContent;
            triggerBtn.disabled = true;
            triggerBtn.textContent = 'Saving…';
        }

        try {
            this.data.schemaVersion = 2;
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };
            if (this.etag) {
                headers['If-Match'] = this.etag;
            }

            const res = await fetch(API_URL, {
                method: 'PUT',
                headers,
                body: JSON.stringify(this.data)
            });

            if (res.status === 401) {
                logout('Session expired');
                return;
            }

            if (res.status === 412) {
                showToast('Data changed in another tab/device. Reload before saving.', true);
                return;
            }

            if (!res.ok) {
                let reason = `Error ${res.status}`;
                try {
                    const json = await res.json();
                    if (json.error) reason = json.error;
                } catch {}
                showToast(`Save failed: ${reason}`, true);
                return;
            }

            const newEtag = res.headers.get('ETag');
            if (newEtag) this.etag = newEtag;

            try {
                const resJson = await res.json();
                if (resJson.rev) this.etag = `"${resJson.rev}"`;
            } catch {}

            this.updateDataSize();
            showToast('Data Saved!');
        } catch (err) {
            showToast(`Save failed: ${err.message || 'Network error'}`, true);
        } finally {
            if (triggerBtn) {
                triggerBtn.disabled = false;
                triggerBtn.textContent = origText;
            }
        }
    }

    updateDataSize(data = this.data) {
        const indicator = document.getElementById('data-size-indicator');
        if (!indicator || !data) return;
        const size = JSON.stringify(data).length;
        const kilobytes = size / 1024;
        const megabytes = kilobytes / 1024;
        const displaySize = megabytes >= 1 ? `${megabytes.toFixed(2)} MB` : `${kilobytes.toFixed(1)} KB`;
        indicator.replaceChildren(document.createTextNode(`Data size: ${displaySize}`));
    }

    populateForms() {
        siteSection.populateForm(this.data);
        heroSection.populateForm(this.data);
        const heroImageField = document.getElementById('hero-image')?.closest('.form-group');
        if (heroImageField) heroImageField.outerHTML = heroSection.imageFieldMarkup(this.data);
        aboutSection.populateForm(this.data);
        contactsSection.populateForm(this.data);
        this.populateSectionVisibility();
        this.renderSectionsOrder();
        this.setupCounters();
    }

    setupCounters() {
        const proofInput = document.getElementById('hero-proof');
        const proofCounter = document.getElementById('hero-proof-counter');
        if (proofInput && proofCounter) {
            const updateProofCounter = () => {
                const len = proofInput.value.length;
                proofCounter.textContent = `${len} / 70`;
                proofCounter.style.color = len > 70 ? '#d97706' : 'var(--admin-text-muted)';
                proofCounter.style.fontWeight = len > 70 ? '600' : 'normal';
            };
            proofInput.oninput = updateProofCounter;
            updateProofCounter();
        }

        const bodyInput = document.getElementById('contact-email-body');
        const bodyCounter = document.getElementById('contact-email-body-counter');
        if (bodyInput && bodyCounter) {
            const updateBodyCounter = () => {
                const len = bodyInput.value.length;
                bodyCounter.textContent = `${len} / 600`;
            };
            bodyInput.oninput = updateBodyCounter;
            updateBodyCounter();
        }
    }

    populateSectionVisibility() {
        const vis = this.data.sectionsVisibility || {};
        const sections = ['hero', 'about', 'projects', 'experience', 'skills', 'services', 'education', 'certifications', 'contact'];
        sections.forEach(key => {
            const toggle = document.getElementById(`toggle-vis-${key}`);
            const statusEl = document.getElementById(`toggle-status-${key}`);
            const isVis = vis[key] !== false;
            if (toggle) {
                toggle.checked = isVis;
            }
            if (statusEl) {
                statusEl.textContent = isVis
                    ? 'Section is currently visible on your website. (Click toggle to hide)'
                    : 'Section is currently hidden from your website. (Click toggle to show)';
                statusEl.style.color = isVis ? 'var(--admin-primary)' : '#e11d48';
            }
        });
    }

    toggleSectionVisibility(key, isVisible) {
        if (!this.data.sectionsVisibility) {
            this.data.sectionsVisibility = {};
        }
        this.data.sectionsVisibility[key] = isVisible;
        const statusEl = document.getElementById(`toggle-status-${key}`);
        if (statusEl) {
            statusEl.textContent = isVisible
                ? 'Section is currently visible on your website. (Click toggle to hide)'
                : 'Section is currently hidden from your website. (Click toggle to show)';
            statusEl.style.color = isVisible ? 'var(--admin-primary)' : '#e11d48';
        }
        this.renderSectionsOrder();
        this.saveData();
    }

    renderSectionsOrder() {
        const container = document.getElementById('section-reorder-list');
        if (!container) return;

        const defaultOrder = ['hero', 'about', 'projects', 'experience', 'skills', 'services', 'education', 'certifications', 'contact'];
        if (!this.data.sectionsOrder || !this.data.sectionsOrder.length) {
            this.data.sectionsOrder = [...defaultOrder];
        }

        const SECTION_METADATA = {
            hero: { name: 'Hero Section', icon: 'ph-user' },
            about: { name: 'About Me Section', icon: 'ph-info' },
            projects: { name: 'Featured Projects Section', icon: 'ph-folder-simple' },
            experience: { name: 'Experience Section', icon: 'ph-briefcase' },
            skills: { name: 'Tech Stack Section', icon: 'ph-code' },
            services: { name: 'Services Section', icon: 'ph-sparkle' },
            education: { name: 'Education Section', icon: 'ph-graduation-cap' },
            certifications: { name: 'Certifications Section', icon: 'ph-certificate' },
            contact: { name: 'Contact Section', icon: 'ph-envelope' }
        };

        const vis = this.data.sectionsVisibility || {};

        container.innerHTML = this.data.sectionsOrder.map((key, index) => {
            const meta = SECTION_METADATA[key] || { name: key, icon: 'ph-dots-six-vertical' };
            const isVis = vis[key] !== false;
            const isFirst = index === 0;
            const isLast = index === this.data.sectionsOrder.length - 1;

            return `
                <div class="reorder-card" draggable="true" data-key="${escapeHtml(key)}" data-index="${index}">
                    <div class="reorder-left">
                        <span class="reorder-drag-handle" title="Drag to reorder"><i class="ph ph-dots-six-vertical"></i></span>
                        <i class="ph ${escapeHtml(meta.icon)}" style="font-size: 1.25rem; color: var(--admin-primary);"></i>
                        <span class="reorder-title">${escapeHtml(meta.name)}</span>
                        <span class="reorder-badge ${isVis ? 'visible' : 'hidden'}">${isVis ? 'Visible' : 'Hidden'}</span>
                    </div>
                    <div class="reorder-actions">
                        <button type="button" class="btn-move" title="Move Up" ${isFirst ? 'disabled' : ''} onclick="adminApp.moveSection('${escapeHtml(key)}', -1)">
                            <i class="ph ph-arrow-up"></i>
                        </button>
                        <button type="button" class="btn-move" title="Move Down" ${isLast ? 'disabled' : ''} onclick="adminApp.moveSection('${escapeHtml(key)}', 1)">
                            <i class="ph ph-arrow-down"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        this.initReorderDragAndDrop();
    }

    moveSection(key, direction) {
        const defaultOrder = ['hero', 'about', 'projects', 'experience', 'skills', 'services', 'education', 'certifications', 'contact'];
        if (!this.data.sectionsOrder || !this.data.sectionsOrder.length) {
            this.data.sectionsOrder = [...defaultOrder];
        }
        const order = [...this.data.sectionsOrder];
        const idx = order.indexOf(key);
        if (idx === -1) return;
        const targetIdx = idx + direction;
        if (targetIdx < 0 || targetIdx >= order.length) return;

        const temp = order[idx];
        order[idx] = order[targetIdx];
        order[targetIdx] = temp;

        this.data.sectionsOrder = order;
        this.renderSectionsOrder();
        this.saveData();
    }

    initReorderDragAndDrop() {
        const container = document.getElementById('section-reorder-list');
        if (!container) return;

        let draggedCard = null;

        container.querySelectorAll('.reorder-card').forEach(card => {
            card.addEventListener('dragstart', (e) => {
                draggedCard = card;
                card.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });

            card.addEventListener('dragend', () => {
                if (draggedCard) {
                    draggedCard.classList.remove('dragging');
                    draggedCard = null;
                }
                container.querySelectorAll('.reorder-card').forEach(c => c.classList.remove('drag-over'));
            });

            card.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                card.classList.add('drag-over');
            });

            card.addEventListener('dragleave', () => {
                card.classList.remove('drag-over');
            });

            card.addEventListener('drop', (e) => {
                e.preventDefault();
                card.classList.remove('drag-over');

                if (draggedCard && draggedCard !== card) {
                    const fromKey = draggedCard.dataset.key;
                    const toKey = card.dataset.key;
                    const order = [...(this.data.sectionsOrder || [])];
                    const fromIdx = order.indexOf(fromKey);
                    const toIdx = order.indexOf(toKey);

                    if (fromIdx !== -1 && toIdx !== -1) {
                        order.splice(fromIdx, 1);
                        order.splice(toIdx, 0, fromKey);
                        this.data.sectionsOrder = order;
                        this.renderSectionsOrder();
                        this.saveData();
                    }
                }
            });
        });
    }

    saveSite(btn) {
        siteSection.save(this.data);
        this.saveData(btn);
        this.updateFavicon();
    }

    saveHero(btn) {
        heroSection.save(this.data);
        this.saveData(btn);
    }

    saveContacts(btn) {
        contactsSection.save(this.data);
        this.saveData(btn);
    }

    resetEmailTemplate() {
        const subjectInput = document.getElementById('contact-email-subject');
        const bodyInput = document.getElementById('contact-email-body');
        if (subjectInput) subjectInput.value = DEFAULT_EMAIL_SUBJECT;
        if (bodyInput) {
            bodyInput.value = DEFAULT_EMAIL_BODY;
            bodyInput.dispatchEvent(new Event('input'));
        }
    }

    testEmailLink() {
        const emailContact = (this.data?.contacts || []).find(c => contactKind(c) === 'email') || (this.data?.contacts || [])[0];
        const email = emailContact ? contactValue(emailContact) : 'esraaehab.dev@gmail.com';
        const subject = document.getElementById('contact-email-subject')?.value || '';
        const body = document.getElementById('contact-email-body')?.value || '';
        const href = buildMailtoHref(email, subject, body);
        window.location.href = href;
    }

    saveAbout(btn) {
        aboutSection.save(this.data);
        this.saveData(btn);
    }

    addAboutStat() {
        aboutSection.addStat();
    }

    removeAboutStat(index) {
        aboutSection.removeStat(index);
    }

    renderLists() {
        renderLists(this.data);
    }

    deleteItem(col, idx) {
        deleteItem(this, col, idx);
    }

    moveItem(col, fromIdx, toIdx) {
        if (!this.data || !Array.isArray(this.data[col])) return;
        const items = this.data[col];
        if (fromIdx < 0 || fromIdx >= items.length || toIdx < 0 || toIdx >= items.length) return;

        const [moved] = items.splice(fromIdx, 1);
        items.splice(toIdx, 0, moved);

        this.renderLists();
        this.saveData();
    }

    openModal(mode, idx = null) {
        openModal(this, mode, idx);
    }

    closeModal() {
        closeModal();
    }

    saveModal(btn) {
        saveModal(this, (data) => renderLists(data), btn);
    }

    async migrateImages() {
        if (!this.data) return;
        const btn = document.getElementById('btn-migrate-images');
        const reportEl = document.getElementById('migration-report');
        if (btn) btn.disabled = true;

        // (1) Download a backup JSON automatically
        const backupStr = JSON.stringify(this.data, null, 2);
        const blob = new Blob([backupStr], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `backup-portfolio-data-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        a.click();
        URL.revokeObjectURL(a.href);

        if (reportEl) {
            reportEl.hidden = false;
            reportEl.textContent = 'Scanning data for embedded images…';
        }

        // (2) Walk the whole data object, find every string starting with "data:image"
        const base64Items = [];
        function walk(obj) {
            if (!obj || typeof obj !== 'object') return;
            for (const [key, val] of Object.entries(obj)) {
                if (typeof val === 'string' && val.startsWith('data:image')) {
                    base64Items.push({ parent: obj, key, val });
                } else if (typeof val === 'object') {
                    walk(val);
                }
            }
        }
        walk(this.data);

        if (base64Items.length === 0) {
            if (reportEl) reportEl.textContent = 'No embedded images found. Your data is clean!';
            if (btn) btn.disabled = false;
            return;
        }

        let count = 0;
        let totalKBSaved = 0;

        for (let i = 0; i < base64Items.length; i++) {
            const item = base64Items[i];
            if (reportEl) reportEl.textContent = `Uploading image ${i + 1} of ${base64Items.length}…`;

            try {
                const sourceBytes = Math.floor(item.val.length * 3 / 4);
                const res = await fetch(item.val);
                const originalBlob = await res.blob();
                const uploadFile = new File([originalBlob], `migrated-image-${i + 1}.webp`, { type: originalBlob.type });

                // (3) Upload each to /upload
                const uploaded = await uploadImageFile(uploadFile, { maxSide: 1400 });
                // (4) Replace the string with returned URL
                item.parent[item.key] = uploaded.url;
                count++;

                const newBytes = uploaded.size || 0;
                if (sourceBytes > newBytes) {
                    totalKBSaved += Math.round((sourceBytes - newBytes) / 1024);
                }
            } catch (err) {
                console.error('Migration failed for image:', err);
            }
        }

        // (5) Report
        if (reportEl) {
            reportEl.textContent = `Migration complete: ${count} image(s) moved to server. Saved ~${totalKBSaved} KB. Saving portfolio data…`;
        }

        // (6) Save once via normal save pipeline
        await this.saveData(btn);
        if (btn) btn.disabled = false;
    }

    async loadBackups() {
        const listContainer = document.getElementById('backups-list');
        if (!listContainer) return;
        const token = getAdminToken();
        if (!token) return;

        listContainer.innerHTML = '<p style="color: var(--admin-text-muted);">Loading backups…</p>';

        try {
            const res = await fetch(`${API_URL}/backups`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.status === 401) {
                logout('Session expired');
                return;
            }
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const backups = await res.json();

            if (!Array.isArray(backups) || backups.length === 0) {
                listContainer.innerHTML = '<p style="color: var(--admin-text-muted); font-size: 0.85rem;">No backups available yet.</p>';
                return;
            }

            listContainer.innerHTML = backups.map(b => {
                const key = typeof b === 'string' ? b : b.key;
                const dateStr = key.replace(/^backup:/, '');
                return `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; background: #f1f5f9; border-radius: 8px;">
                        <span style="font-size: 0.85rem; font-family: monospace;">${escapeHtml(dateStr)}</span>
                        <button type="button" class="btn-secondary" onclick="adminApp.restoreBackup('${escapeHtml(key)}')" style="padding: 0.35rem 0.75rem; border: 1px solid var(--admin-border); border-radius: 6px; background: white; font-weight: 600; cursor: pointer;">Restore</button>
                    </div>
                `;
            }).join('');
        } catch (e) {
            listContainer.innerHTML = `<p style="color: #ef4444; font-size: 0.85rem;">Could not load backups: ${escapeHtml(e.message)}</p>`;
        }
    }

    async restoreBackup(key) {
        if (!confirm(`Are you sure you want to restore backup "${key}"? Current data will be backed up first.`)) return;
        const token = getAdminToken();
        if (!token) {
            logout('Session expired');
            return;
        }

        try {
            const res = await fetch(`${API_URL}/restore/${encodeURIComponent(key)}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.status === 401) {
                logout('Session expired');
                return;
            }
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            showToast('Backup restored!');
            await this.init();
        } catch (e) {
            showToast(`Restore failed: ${e.message}`, true);
        }
    }

    updateFavicon() {
        if (!this.data?.site) return;
        const primary = this.data.site?.accent || '#0055FF';
        let secondary = this.data.site?.secondary || '';

        if (!secondary || secondary === '#000000') {
            const r = parseInt(primary.slice(1, 3), 16) || 0;
            const g = parseInt(primary.slice(3, 5), 16) || 85;
            const b = parseInt(primary.slice(5, 7), 16) || 255;
            const sr = Math.min(255, r + 40);
            const sg = Math.max(0, g - 20);
            const sb = Math.min(255, b + 60);
            secondary = `rgb(${sr}, ${sg}, ${sb})`;
        }

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
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            link.type = 'image/svg+xml';
            document.head.appendChild(link);
        }
        link.href = dataUrl;
    }
}

const adminApp = new AdminApp();
window.adminApp = adminApp;
