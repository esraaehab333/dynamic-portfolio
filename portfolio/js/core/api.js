import { API_URL } from '../config.js';
import { DEFAULT_DATA } from './defaults.js';

async function loadSnapshot() {
    try {
        const res = await fetch(new URL('../../data/portfolio-data.json', import.meta.url));
        if (!res.ok) throw new Error(`Snapshot request failed: ${res.status}`);
        return await res.json();
    } catch (e) {
        console.warn('Using built-in defaults because the saved data snapshot could not be loaded:', e);
        return DEFAULT_DATA;
    }
}

function mergePortfolioData(snapshot, data = {}) {
    const merged = {
        ...DEFAULT_DATA,
        ...snapshot,
        ...data,
        site: { ...DEFAULT_DATA.site, ...(snapshot.site || {}), ...(data.site || {}) },
        hero: { ...DEFAULT_DATA.hero, ...(snapshot.hero || {}), ...(data.hero || {}) },
        about: { ...DEFAULT_DATA.about, ...(snapshot.about || {}), ...(data.about || {}) },
        contact: { ...DEFAULT_DATA.contact, ...(snapshot.contact || {}), ...(data.contact || {}) }
    };

    // Preserve compatibility with older API records that used singular keys.
    if (data.project && !data.projects) merged.projects = data.project;
    if (data.skill && !data.skills) merged.skills = data.skill;
    if (data.service && !data.services) merged.services = data.service;
    if (data.partner && !data.partners) merged.partners = data.partner;

    return merged;
}

export async function loadData() {
    const snapshot = await loadSnapshot();
    try {
        const res = await fetch(API_URL + '?t=' + Date.now());
        if (!res.ok) throw new Error(`Portfolio API request failed: ${res.status}`);
        const data = await res.json();
        return mergePortfolioData(snapshot, data);
    } catch (e) {
        console.warn('Using the saved portfolio data snapshot because the API could not be loaded:', e);
        return mergePortfolioData(snapshot);
    }
}

export async function saveData(data) {
    await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
}
