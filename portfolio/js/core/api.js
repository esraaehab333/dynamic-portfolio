import { API_URL } from '../config.js';

const CACHE_KEY = 'portfolio_cache_v1';
const MAX_CACHE_SIZE = 3 * 1024 * 1024; // 3 MB limit

function processLoadedData(data) {
    if (!data || typeof data !== 'object') return null;
    const merged = { ...data };

    merged.site = data.site || {};
    merged.hero = data.hero || {};
    merged.about = data.about || {};
    merged.contact = data.contact || {};

    merged.projects = Array.isArray(data.projects) ? data.projects : (Array.isArray(data.project) ? data.project : []);
    merged.skills = Array.isArray(data.skills) ? data.skills : (Array.isArray(data.skill) ? data.skill : []);
    merged.services = Array.isArray(data.services) ? data.services : (Array.isArray(data.service) ? data.service : []);
    merged.partners = Array.isArray(data.partners) ? data.partners : (Array.isArray(data.partner) ? data.partner : []);
    merged.experience = Array.isArray(data.experience) ? data.experience : [];
    merged.education = Array.isArray(data.education) ? data.education : [];
    merged.certifications = Array.isArray(data.certifications) ? data.certifications : [];
    merged.contacts = Array.isArray(data.contacts) ? data.contacts : [];
    merged.socials = Array.isArray(data.socials) ? data.socials : [];
    merged.testimonials = Array.isArray(data.testimonials) ? data.testimonials : [];

    merged.sectionsVisibility = data.sectionsVisibility || data.site?.sectionVisibility || {};
    merged.sectionsOrder = (Array.isArray(data.sectionsOrder) && data.sectionsOrder.length)
        ? data.sectionsOrder
        : (Array.isArray(data.site?.sectionOrder) && data.site.sectionOrder.length)
            ? data.site.sectionOrder
            : ['hero', 'about', 'projects', 'experience', 'skills', 'services', 'education', 'certifications', 'contacts'];

    return merged;
}

export async function loadData() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
        const res = await fetch(API_URL, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error(`Portfolio API failed: ${res.status}`);
        const data = await res.json();

        const processed = processLoadedData(data);
        if (!processed) throw new Error('Invalid portfolio data structure');

        // Save to cache if stringified size <= 3 MB
        try {
            const str = JSON.stringify(data);
            if (new Blob([str]).size <= MAX_CACHE_SIZE) {
                localStorage.setItem(CACHE_KEY, str);
            }
        } catch (e) {
            console.warn('Could not save portfolio data to localStorage cache:', e);
        }

        return processed;
    } catch (e) {
        clearTimeout(timeoutId);
        console.warn('API request failed or timed out. Checking cache…', e);

        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                const parsed = JSON.parse(cached);
                const processed = processLoadedData(parsed);
                if (processed) return processed;
            }
        } catch (cacheErr) {
            console.warn('Failed to parse cached portfolio data:', cacheErr);
        }

        throw new Error('FAILED_TO_LOAD_PORTFOLIO_DATA');
    }
}

export async function saveData(data) {
    if (data && typeof data === 'object') {
        data.schemaVersion = 2;
    }
    await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
}
