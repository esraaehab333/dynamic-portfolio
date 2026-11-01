const DEFAULT_STATS = [
    { title: '0', subtitle: 'Projects', icon: 'ph-briefcase' },
    { title: '0', subtitle: 'Years of Experience', icon: 'ph-calendar-check' },
    { title: '0', subtitle: 'Core Skills', icon: 'ph-code' }
];

function escapeHtml(value = '') {
    return String(value).replace(/[&<>"']/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
}

function getStats(data = {}) {
    const about = data.about || {};
    const currentYear = new Date().getFullYear();
    const experienceYears = Math.floor((data.experience || []).reduce((total, item) => {
        const years = String(item.date || '').match(/\b(?:19|20)\d{2}\b/g)?.map(Number) || [];
        if (!years.length) return total;
        const end = /present|current/i.test(item.date) ? currentYear : (years[1] || currentYear);
        return total + Math.max(0, end - years[0]);
    }, 0));
    const sourceValue = source => source === 'projects' ? String((data.projects || []).length)
        : source === 'experience' ? String(experienceYears)
        : source === 'skills' ? String((data.skills || []).length) : undefined;
    if (Array.isArray(about.stats)) return about.stats.map(stat => ({
        title: stat.title ?? sourceValue(stat.source) ?? stat.value ?? '',
        subtitle: stat.subtitle ?? stat.label ?? '',
        icon: stat.icon || ''
    }));
    return DEFAULT_STATS.map((stat, index) => ({
        ...stat,
        title: String(index === 0 ? (data.projects || []).length : index === 1 ? experienceYears : (data.skills || []).length),
        subtitle: about.statLabels?.[['projects', 'experience', 'skills'][index]] || stat.subtitle,
        icon: about.statCards?.[['projects', 'experience', 'skills'][index]]?.icon || stat.icon
    }));
}

function renderStatsEditor(stats) {
    const host = document.getElementById('about-stats-editor');
    host.innerHTML = stats.map((stat, index) => `
        <div class="about-stat-editor-card" data-stat-index="${index}">
            <strong>Card ${index + 1}</strong>
            <button type="button" class="about-stat-remove" aria-label="Remove card ${index + 1}" onclick="adminApp.removeAboutStat(${index})">×</button>
            <div class="about-stat-editor-grid">
                <div class="form-group"><label>Title</label><input class="form-control stat-title" value="${escapeHtml(stat.title || '')}" placeholder="e.g. 7"></div>
                <div class="form-group"><label>Subtitle</label><input class="form-control stat-subtitle" value="${escapeHtml(stat.subtitle || '')}" placeholder="e.g. Projects"></div>
                <div class="form-group"><label>Icon</label><input class="form-control stat-icon" value="${escapeHtml(stat.icon || '')}" placeholder="e.g. ph-briefcase"></div>
            </div>
        </div>
    `).join('');
}

export function populateForm(data) {
    const about = data.about || {};
    document.getElementById('about-label').value = about.label || '';
    document.getElementById('about-title').value = about.title || '';
    document.getElementById('about-bio').value = about.bio || '';
    document.getElementById('about-stats-visible').checked = about.showStats !== false;
    renderStatsEditor(getStats(data));
}

export function addStat() {
    const stats = [...document.querySelectorAll('.about-stat-editor-card')].map(readStatCard);
    stats.push({ title: '', subtitle: '', icon: '' });
    renderStatsEditor(stats);
}

export function removeStat(index) {
    const stats = [...document.querySelectorAll('.about-stat-editor-card')].map(readStatCard);
    stats.splice(index, 1);
    renderStatsEditor(stats);
}

function readStatCard(card) {
    return {
        title: card.querySelector('.stat-title').value,
        subtitle: card.querySelector('.stat-subtitle').value,
        icon: card.querySelector('.stat-icon').value.trim()
    };
}

export function save(data) {
    if (!data.about) data.about = {};
    data.about.label = document.getElementById('about-label').value;
    data.about.title = document.getElementById('about-title').value;
    data.about.bio = document.getElementById('about-bio').value;
    data.about.showStats = document.getElementById('about-stats-visible').checked;
    data.about.stats = [...document.querySelectorAll('.about-stat-editor-card')].map(readStatCard);
}
