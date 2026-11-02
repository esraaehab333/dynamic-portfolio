import { API_URL } from '../config.js';
import { DEFAULT_DATA } from './defaults.js';
import { initAuth, logout } from './auth.js';
import { setupNav } from './shared/nav.js';
import { showToast } from './shared/toast.js';
import { renderLists, deleteItem } from './shared/collection.js';
import { openModal, closeModal, saveModal } from './shared/modal.js';

import * as siteSection from './sections/site.js';
import * as heroSection from './sections/hero.js';
import * as aboutSection from './sections/about.js';
import * as contactsSection from './sections/contacts.js';

class AdminApp {
    constructor() {
        this.data = null;
        this.editIndex = null;
        this.currentMode = null;
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
        setupNav();
        this.populateForms();
        renderLists(this.data);
        this.updateFavicon();
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
        showToast();
    }

    populateForms() {
        siteSection.populateForm(this.data);
        heroSection.populateForm(this.data);
        aboutSection.populateForm(this.data);
        contactsSection.populateForm(this.data);
        this.populateSectionVisibility();
        this.renderSectionsOrder();
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
                <div class="reorder-card" draggable="true" data-key="${key}" data-index="${index}">
                    <div class="reorder-left">
                        <span class="reorder-drag-handle" title="Drag to reorder"><i class="ph ph-dots-six-vertical"></i></span>
                        <i class="ph ${meta.icon}" style="font-size: 1.25rem; color: var(--admin-primary);"></i>
                        <span class="reorder-title">${meta.name}</span>
                        <span class="reorder-badge ${isVis ? 'visible' : 'hidden'}">${isVis ? 'Visible' : 'Hidden'}</span>
                    </div>
                    <div class="reorder-actions">
                        <button type="button" class="btn-move" title="Move Up" ${isFirst ? 'disabled' : ''} onclick="adminApp.moveSection('${key}', -1)">
                            <i class="ph ph-arrow-up"></i>
                        </button>
                        <button type="button" class="btn-move" title="Move Down" ${isLast ? 'disabled' : ''} onclick="adminApp.moveSection('${key}', 1)">
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

    saveSite() {
        siteSection.save(this.data);
        this.saveData();
        this.updateFavicon();
    }

    saveHero() {
        heroSection.save(this.data);
        this.saveData();
    }

    saveAbout() {
        aboutSection.save(this.data);
        this.saveData();
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

    openModal(mode, idx = null) {
        openModal(this, mode, idx);
    }

    closeModal() {
        closeModal();
    }

    saveModal() {
        saveModal(this, (data) => renderLists(data));
    }

    showToast() {
        showToast();
    }

    updateFavicon() {
        const primary = this.data.site?.accent || '#0055FF';
        let secondary = this.data.site?.secondary || '';

        if (!secondary || secondary === '#000000') {
            const r = parseInt(primary.slice(1, 3), 16);
            const g = parseInt(primary.slice(3, 5), 16);
            const b = parseInt(primary.slice(5, 7), 16);
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
