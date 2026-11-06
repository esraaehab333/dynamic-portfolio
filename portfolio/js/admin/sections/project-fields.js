import { imageField, compressImageFile } from '../shared/image-field.js';

const escapeValue = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const input = (id, label, value, type = 'text', placeholder = '', hint = '') => `<div class="form-group"><label for="${id}">${label}</label><input id="${id}" class="form-control" type="${type}" value="${escapeValue(value)}" placeholder="${escapeValue(placeholder)}">${hint ? `<small class="form-hint">${hint}</small>` : ''}</div>`;
const area = (id, label, value, placeholder = '', rows = 4) => `<div class="form-group"><label for="${id}">${label}</label><textarea id="${id}" class="form-control" rows="${rows}" placeholder="${escapeValue(placeholder)}">${escapeValue(value)}</textarea></div>`;
const listValues = value => Array.isArray(value) ? value.map(String) : String(value ?? '').split(/\s*[|,·]\s*/).map(item => item.trim()).filter(Boolean);
const lineValues = value => Array.isArray(value) ? value.map(String) : String(value ?? '').split(/\r?\n/).map(item => item.trim()).filter(Boolean);
const sameList = (a, b) => a.length === b.length && a.every((value, index) => value === b[index]);
const serializeList = (values, original) => {
    const originalValues = listValues(original);
    if (sameList(values, originalValues)) return original ?? '';
    return Array.isArray(original) ? values : values.join(' | ');
};
const serializeLines = (values, original) => {
    const originalValues = lineValues(original);
    if (sameList(values, originalValues)) return original ?? '';
    return Array.isArray(original) ? values : values.join('\n');
};

let lastOpenTab = 'basics';
const suggestions = ['Kotlin', 'Java', 'Dart', 'Swift', 'MVVM', 'MVI', 'MVP', 'Clean Architecture', 'Hilt', 'Koin', 'Room', 'Retrofit', 'Coroutines', 'Flow', 'Compose', 'Ktor', 'Firebase', 'Coil'];

export function chipsField(id, label, value) {
    const values = listValues(value);
    return `<div class="form-group"><label>${label}</label><div class="project-chip-field" data-chip-field="${id}" data-original="${escapeValue(JSON.stringify(value ?? null))}"><div class="project-chip-list">${values.map(chip => chipMarkup(chip)).join('')}<input class="project-chip-input" list="${id}-suggestions" placeholder="Type and press Enter"></div><datalist id="${id}-suggestions">${suggestions.map(item => `<option value="${escapeValue(item)}"></option>`).join('')}</datalist><small class="project-field-hint">Press Enter or comma to add; Backspace removes the last chip.</small></div></div>`;
}

function chipMarkup(value) {
    return `<span class="project-chip" data-value="${escapeValue(value)}">${escapeValue(value)}<button type="button" aria-label="Remove ${escapeValue(value)}" onclick="ProjectFields.removeChip(this)">×</button></span>`;
}

function tabButton(id, label, hasContent) {
    return `<button type="button" role="tab" aria-controls="project-tab-${id}" aria-selected="${lastOpenTab === id}" class="project-tab-button${lastOpenTab === id ? ' active' : ''}${hasContent ? ' has-content' : ''}" data-tab="${id}" onclick="ProjectFields.switchTab(this)">${label}</button>`;
}

function updateTabDots() {
    const editor = document.querySelector('[data-project-editor]');
    if (!editor) return;
    editor.querySelectorAll('.project-tab-button').forEach(button => {
        const panel = editor.querySelector(`[data-panel="${button.dataset.tab}"]`);
        const hasText = [...panel.querySelectorAll('input:not([type="file"]), textarea, select')].some(field => field.value.trim());
        const hasImages = panel.querySelector('.mp-image-list')?.children.length > 0;
        button.classList.toggle('has-content', Boolean(hasText || hasImages));
    });
}

export function projectEditorTabs(item = {}, basicsMarkup = '') {
    const gallery = Array.isArray(item.showcase) ? item.showcase : [];
    const hasBasics = [item.title, item.subtitle, item.image, item.tag, item.video, item.github, item.playstore, item.appstore, item.apk, item.demo].some(Boolean);
    const hasStory = [item.features, item.challenges, item.learned].some(value => Array.isArray(value) ? value.length : Boolean(value));
    const hasTech = [item.languages, item.architecture, item.libraries].some(value => Array.isArray(value) ? value.length : Boolean(value));
    const moreKeys = ['platform', 'role', 'status', 'startDate', 'endDate', 'videoRatio', 'logo', 'slogan', 'color', 'archIntro', 'archLayers', 'archImage', 'structure', 'setup', 'team', 'stackGroups'];
    const hasMore = moreKeys.some(key => Array.isArray(item[key]) ? item[key].length : Boolean(item[key]));
    const fields = getProjectFields(item);
    return `<div class="project-editor" data-project-editor>
        <div class="project-tab-strip" role="tablist" aria-label="Project editor tabs">
            ${tabButton('basics', 'Basics', hasBasics)}${tabButton('gallery', 'Gallery', gallery.some(group => group?.images?.length))}${tabButton('story', 'Story', hasStory)}${tabButton('tech', 'Tech', hasTech)}${tabButton('more', 'More', hasMore)}
        </div>
        <section class="project-tab-panel${lastOpenTab === 'basics' ? ' active' : ''}" id="project-tab-basics" role="tabpanel" data-panel="basics" ${lastOpenTab === 'basics' ? '' : 'hidden'}>${basicsMarkup}</section>
        ${fields}
    </div>`;
}

export function currentChipValue(field, original) { return serializeList(getChips(field), original); }

export function getProjectFields(item = {}) {
    const storedGroups = Array.isArray(item.showcase) ? item.showcase : [];
    const groups = storedGroups.length ? storedGroups : [{ title: 'Screens', images: [], tech: [], points: [] }];
    return `<section class="project-tab-panel${lastOpenTab === 'gallery' ? ' active' : ''}" id="project-tab-gallery" role="tabpanel" data-panel="gallery" ${lastOpenTab === 'gallery' ? '' : 'hidden'}>
        <div class="mp-screens" id="mp-screens">${groups.map((group, index) => screenCard(group, index)).join('')}</div>
        <button type="button" class="project-add-group" onclick="ProjectFields.addScreen()">+ Add another group (e.g. Login, Home, Checkout)</button>
    </section>
    <section class="project-tab-panel${lastOpenTab === 'story' ? ' active' : ''}" id="project-tab-story" role="tabpanel" data-panel="story" ${lastOpenTab === 'story' ? '' : 'hidden'}>
        <div class="project-story-field"><label>Key features</label><div id="mp-feature-rows">${lineValues(item.features).map((value, index) => lineRow('feature', value, index)).join('')}</div><button type="button" class="project-subtle-button" onclick="ProjectFields.addLine('feature')">+ Add feature</button></div>
        <div class="project-story-field"><label>Challenges &amp; solutions</label><div id="mp-challenge-rows">${challengeValues(item.challenges).map((row, index) => challengeRow(row, index)).join('')}</div><button type="button" class="project-subtle-button" onclick="ProjectFields.addChallenge()">+ Add challenge</button></div>
        ${area('m-learned', 'What I learned', lineValues(item.learned).join('\n'), 'e.g. How to structure offline-first data flows.')}
    </section>
    <section class="project-tab-panel${lastOpenTab === 'tech' ? ' active' : ''}" id="project-tab-tech" role="tabpanel" data-panel="tech" ${lastOpenTab === 'tech' ? '' : 'hidden'}>
        ${chipsField('languages', 'Languages', item.languages)}${chipsField('architecture', 'Architecture', item.architecture)}${chipsField('libraries', 'Libraries & tools', item.libraries)}
        <details class="project-collapsible"><summary>More stack groups</summary>${area('m-stackGroups', 'Additional stack groups', item.stackGroups, 'Backend & AI: Shopify | Gemini | Supabase')}</details>
    </section>
    <section class="project-tab-panel${lastOpenTab === 'more' ? ' active' : ''}" id="project-tab-more" role="tabpanel" data-panel="more" ${lastOpenTab === 'more' ? '' : 'hidden'}>
        <details class="project-collapsible"><summary>Details</summary>
            ${selectField('m-platform', 'Platform', item.platform, ['Android', 'iOS', 'Android & iOS (KMP)', 'Web', 'Desktop'])}
            ${input('m-role', 'Role', item.role, 'text', 'e.g. Android developer')}
            ${selectField('m-status', 'Status', item.status, ['completed', 'in-progress', 'published'], { completed: 'Completed', 'in-progress': 'In progress', published: 'Published' })}
            ${input('m-startDate', 'Start month', item.startDate, 'month')}${input('m-endDate', 'End month', item.endDate, 'month')}
            ${selectField('m-videoRatio', 'Video frame', item.videoRatio, ['', 'landscape'], { '': 'Portrait', landscape: 'Landscape' })}
        </details>
        <details class="project-collapsible"><summary>Brand</summary>
            ${imageField('m-logo', 'Logo', item.logo, 'https://... ', { warnLargePng: true })}
            ${input('m-slogan', 'Slogan', item.slogan, 'text', 'e.g. Plan better, every day')}
            ${colorField(item.color)}
        </details>
        <details class="project-collapsible"><summary>Architecture</summary>
            ${area('m-archIntro', 'Introduction', item.archIntro, 'e.g. Clean Architecture separates UI, domain and data layers.')}
            <div class="project-story-field"><label>Layers</label><div id="mp-layer-rows">${layerValues(item.archLayers).map((row, index) => layerRow(row, index)).join('')}</div><button type="button" class="project-subtle-button" onclick="ProjectFields.addLayer()">+ Add layer</button></div>
            ${imageField('m-archImage', 'Diagram', item.archImage, 'https://... ', { warnLargePng: true })}
            ${area('m-structure', 'Project structure', item.structure, 'e.g. app/src/main/java/...', 8)}
        </details>
        <details class="project-collapsible"><summary>Developers</summary>
            ${area('m-setup', 'Run locally', item.setup, 'e.g. ./gradlew installDebug', 5)}
            <div class="project-story-field"><label>Collaborators</label><div id="mp-team-rows">${teamValues(item.team).map((row, index) => teamRow(row, index)).join('')}</div><button type="button" class="project-subtle-button" onclick="ProjectFields.addTeam()">+ Add collaborator</button></div>
        </details>
    </section>`;
}

function selectField(id, label, value, options, labels = {}) {
    const current = String(value ?? '');
    const opts = options.map(option => `<option value="${escapeValue(option)}" ${current === option ? 'selected' : ''}>${escapeValue(labels[option] ?? (option || 'Not set'))}</option>`);
    if (current && !options.includes(current)) opts.unshift(`<option value="${escapeValue(current)}" selected>${escapeValue(current)}</option>`);
    return `<div class="form-group"><label for="${id}">${label}</label><select id="${id}" class="form-control">${opts.join('')}</select></div>`;
}

function colorField(value) {
    const hex = /^#[0-9a-f]{6}$/i.test(String(value || '')) ? value : '#0055ff';
    return `<div class="form-group"><label for="m-color">Accent color</label><div class="project-color-field"><input id="m-color-picker" type="color" value="${hex}" aria-label="Choose accent color" oninput="ProjectFields.syncColor(this)"><input id="m-color" class="form-control" type="text" value="${escapeValue(value)}" placeholder="Leave empty to use site accent" oninput="ProjectFields.syncColor(this)"></div></div>`;
}

function screenCard(screen = {}, index = 0) {
    const images = Array.isArray(screen.images) ? screen.images : String(screen.images || '').split(/\r?\n/).filter(Boolean);
    const uploadId = `mp-image-upload-${index}-${Math.random().toString(36).slice(2)}`;
    const title = screen.title || (index === 0 ? 'Screens' : `Group ${index + 1}`);
    return `<article class="mp-sec" data-group-index="${index}">
        <div class="mp-group-heading">${input(`mp-s-title-${index}`, 'Group title', title, 'text', 'e.g. Home screens')}<span class="mp-image-count">${images.length} / 8</span><button type="button" class="mp-remove-group" aria-label="Remove group" onclick="ProjectFields.removeScreen(this)">×</button></div>
        <div class="mp-screenshots" data-image-group>
            <label class="mp-drop-zone" for="${uploadId}" ondragover="ProjectFields.allowDrop(event)" ondrop="ProjectFields.dropImages(event,this)"><i class="ph ph-upload-simple"></i><span>Drop images here or click to choose</span><small>Up to 8 images; compressed to WebP</small></label>
            <input id="${uploadId}" class="mp-image-file" type="file" accept="image/*" multiple hidden onchange="ProjectFields.addImages(this)">
            <div class="mp-image-list">${images.map((src, imageIndex) => imageCard(src, null, (screen.captions || [])[imageIndex])).join('')}</div>
            <div class="mp-gallery-link-row"><input class="form-control mp-image-link" type="url" placeholder="https://example.com/screen.webp"><button type="button" class="project-subtle-button" onclick="ProjectFields.addLink(this)">Add image link</button></div>
            <div class="mp-image-status" aria-live="polite"></div>
        </div>
        <details class="project-collapsible project-group-details"><summary>Group details</summary>
            ${input(`mp-s-sub-${index}`, 'Subtitle', screen.subtitle, 'text', 'e.g. Track your weekly plan')}
            ${chipsField(`mp-s-tech-${index}`, 'Technologies', screen.tech)}
            <div class="project-story-field"><label>Points</label><div class="mp-point-rows" data-group="${index}">${lineValues(screen.points).map((value, pointIndex) => lineRow('point', value, pointIndex, index)).join('')}</div><button type="button" class="project-subtle-button" onclick="ProjectFields.addLine('point',${index})">+ Add point</button></div>
        </details>
    </article>`;
}

function imageCard(src, size = null, caption = '') {
    const bytes = size ?? embeddedImageSize(src);
    const sizeText = bytes == null ? 'Link' : `${Math.max(1, Math.round(bytes / 1024))} KB`;
    const isLargePng = /^data:image\/png[;,]/i.test(String(src)) && bytes > 150 * 1024;
    return `<div class="mp-image-item" data-src="${escapeValue(src)}" data-bytes="${bytes ?? ''}"><img src="${escapeValue(src)}" alt="Screenshot thumbnail" loading="lazy"><div class="mp-image-card-info"><span class="mp-image-size">${sizeText}</span><input type="text" class="mp-image-caption" value="${escapeValue(caption)}" placeholder="Caption (optional)" aria-label="Image caption">${isLargePng ? '<small class="mp-image-warning">This image is large. Choose it again to compress it.</small>' : ''}<div class="mp-image-item-actions"><button type="button" aria-label="Move image left" onclick="ProjectFields.moveImage(this,-1)">←</button><button type="button" aria-label="Move image right" onclick="ProjectFields.moveImage(this,1)">→</button><button type="button" aria-label="Remove image" onclick="ProjectFields.removeImage(this)">✕</button></div></div></div>`;
}

function embeddedImageSize(src) {
    const match = String(src || '').match(/^data:[^,]*;base64,(.*)$/);
    if (!match) return null;
    const base64 = match[1];
    const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
    return Math.max(0, Math.floor(base64.length * 3 / 4) - padding);
}

function challengeValues(value) {
    return lineValues(value).map(line => {
        const split = line.indexOf('|');
        return split < 0 ? [line, ''] : [line.slice(0, split).trim(), line.slice(split + 1).trim()];
    });
}
function layerValues(value) { return challengeValues(value); }
function teamValues(value) {
    return lineValues(value).map(line => {
        const [name = '', role = '', ...rest] = line.split('|').map(part => part.trim());
        return [name, role, rest.join(' | ')];
    });
}
function lineRow(type, value = '', index = 0, group = '') {
    return `<div class="project-repeat-row" data-row-type="${type}" data-group="${group}"><input class="form-control" data-row-value value="${escapeValue(value)}" placeholder="${type === 'feature' ? 'e.g. Offline sync' : type === 'point' ? 'e.g. Search and filter items' : 'Describe the result'}"><button type="button" aria-label="Remove row" onclick="ProjectFields.removeRow(this)">✕</button></div>`;
}
function challengeRow(row = [], index = 0) {
    return `<div class="project-repeat-row project-pair-row" data-row-type="challenge"><input class="form-control" data-row-left value="${escapeValue(row[0])}" placeholder="e.g. Slow startup"><input class="form-control" data-row-right value="${escapeValue(row[1])}" placeholder="e.g. Deferred noncritical work"><button type="button" aria-label="Remove challenge" onclick="ProjectFields.removeRow(this)">✕</button></div>`;
}
function layerRow(row = [], index = 0) {
    return `<div class="project-repeat-row project-pair-row" data-row-type="layer"><input class="form-control" data-row-left value="${escapeValue(row[0])}" placeholder="e.g. Data layer"><input class="form-control" data-row-right value="${escapeValue(row[1])}" placeholder="e.g. Repositories and API"><button type="button" aria-label="Remove layer" onclick="ProjectFields.removeRow(this)">✕</button></div>`;
}
function teamRow(row = [], index = 0) {
    return `<div class="project-repeat-row project-team-row" data-row-type="team"><input class="form-control" data-row-name value="${escapeValue(row[0])}" placeholder="Name"><input class="form-control" data-row-role value="${escapeValue(row[1])}" placeholder="Role"><input class="form-control" data-row-link value="${escapeValue(row[2])}" placeholder="Profile link"><button type="button" aria-label="Remove collaborator" onclick="ProjectFields.removeRow(this)">✕</button></div>`;
}

function getChips(field) { return [...field.querySelectorAll('.project-chip')].map(chip => chip.dataset.value); }
function commitChipText(input) {
    const parts = String(input.value || '').split(/[,|\n]+/).map(item => item.trim()).filter(Boolean);
    if (!parts.length) { input.value = ''; return false; }
    const list = input.closest('.project-chip-field').querySelector('.project-chip-list');
    const existing = new Set([...list.querySelectorAll('.project-chip')].map(chip => chip.dataset.value));
    parts.forEach(part => { if (!existing.has(part)) { existing.add(part); input.insertAdjacentHTML('beforebegin', chipMarkup(part)); } });
    input.value = '';
    updateTabDots();
    return true;
}
function chipEvent(event) {
    const input = event.target;
    const value = input.value.trim().replace(/,$/, '');
    if ((event.key === 'Enter' || event.key === ',') && value) {
        event.preventDefault();
        commitChipText(input);
    } else if (event.key === 'Backspace' && !input.value) {
        input.closest('.project-chip-list').querySelector('.project-chip:last-of-type')?.remove();
    }
}

function syncDataSize() {
    const app = window.adminApp;
    if (!app?.data || typeof app.updateDataSize !== 'function' || app.currentMode !== 'projects') return;
    try {
        const draft = JSON.parse(JSON.stringify(app.data));
        draft.projects ||= [];
        const item = { ...(app.editIndex == null ? {} : draft.projects[app.editIndex]), ...buildProjectFields() };
        if (app.editIndex == null) draft.projects.push(item);
        else draft.projects[app.editIndex] = item;
        item.image = document.getElementById('m-image')?.value ?? item.image;
        item.title = document.getElementById('m-title')?.value ?? item.title;
        item.subtitle = document.getElementById('m-subtitle')?.value ?? item.subtitle;
        item.video = document.getElementById('m-video')?.value ?? item.video;
        item.github = document.getElementById('m-github')?.value ?? item.github;
        item.playstore = document.getElementById('m-playstore')?.value ?? item.playstore;
        item.appstore = document.getElementById('m-appstore')?.value ?? item.appstore;
        item.apk = document.getElementById('m-apk')?.value ?? item.apk;
        item.demo = document.getElementById('m-demo')?.value ?? item.demo;
        const tags = document.querySelector('[data-chip-field="tags"]');
        if (tags) item.tag = currentChipValue(tags, item.tag);
        app.updateDataSize(draft);
    } catch { /* The size meter updates again after saving if an optional field is temporarily incomplete. */ }
}

function readRows(selector, mapper) {
    return [...document.querySelectorAll(selector)].map(mapper).filter(row => row.some(value => String(value || '').trim()));
}
function saveRows(rows, original) {
    const formatted = rows.map(row => row.map(value => String(value || '').trim()).join(' | ').trim());
    return serializeLines(formatted.filter(Boolean), original);
}

export function buildProjectFields() {
    const app = window.adminApp;
    const original = app?.editIndex == null ? {} : app?.data?.projects?.[app.editIndex] || {};
    const result = {};
    const fields = ['platform', 'role', 'status', 'startDate', 'endDate', 'videoRatio', 'logo', 'slogan', 'color', 'archIntro', 'structure', 'setup', 'stackGroups', 'archImage'];
    fields.forEach(key => {
        const field = document.getElementById(`m-${key}`);
        const value = field?.value ?? original[key];
        if (Object.hasOwn(original, key) || String(value ?? '').trim()) result[key] = value ?? '';
    });
    const groups = [...document.querySelectorAll('#mp-screens .mp-sec')].map((card, index) => {
        const prior = (original.showcase || [])[index] || {};
        const images = [...card.querySelectorAll('.mp-image-item')].map(image => image.dataset.src || '');
        const captions = [...card.querySelectorAll('.mp-image-item')].map(image => image.querySelector('.mp-image-caption')?.value.trim() || '');
        const formTitle = card.querySelector('[id^="mp-s-title-"]')?.value.trim() || '';
        const title = index < (original.showcase || []).length && !prior.title && formTitle === 'Screens' ? prior.title : formTitle;
        const subtitle = card.querySelector('[id^="mp-s-sub-"]')?.value.trim() || '';
        const techField = card.querySelector('[data-chip-field^="mp-s-tech-"]');
        const tech = techField ? (prior.tech == null ? getChips(techField) : serializeList(getChips(techField), prior.tech)) : (prior.tech ?? []);
        const points = readRows(`.mp-point-rows [data-group="${index}"]`, row => [row.querySelector('[data-row-value]')?.value || '']).map(row => row[0]);
        const group = { ...prior };
        if (Object.hasOwn(prior, 'title') || title) group.title = title;
        if (Object.hasOwn(prior, 'subtitle') || subtitle) group.subtitle = subtitle;
        if (Object.hasOwn(prior, 'images') || images.length) group.images = images;
        if (Object.hasOwn(prior, 'tech') || getChips(techField).length) group.tech = prior.tech == null ? getChips(techField) : serializeList(getChips(techField), prior.tech);
        if (Object.hasOwn(prior, 'points') || points.length) group.points = prior.points == null ? points : serializeLines(points, prior.points);
        // Captions are editable when a project already stores them; do not add a new data key.
        if (Array.isArray(prior.captions)) group.captions = sameList(captions, prior.captions) ? prior.captions : captions;
        return group;
    });
    const hasNewGroupContent = groups.some((group, index) => group.title !== (index === 0 ? 'Screens' : `Group ${index + 1}`) || group.images?.length || group.subtitle || listValues(group.tech).length || lineValues(group.points).length);
    if (Array.isArray(original.showcase) || hasNewGroupContent) result.showcase = groups.filter((group, index) => {
        const isEmptyDefault = index === 0 && group.title === 'Screens' && !group.images?.length && !group.subtitle && !listValues(group.tech).length && !lineValues(group.points).length;
        if (index < (original.showcase || []).length) return true;
        return !isEmptyDefault && (group.title || group.images?.length || group.subtitle || listValues(group.tech).length || lineValues(group.points).length || Object.keys(group).some(key => !['title', 'images', 'subtitle', 'tech', 'points'].includes(key)));
    });

    const tagField = document.querySelector('[data-chip-field="tags"]');
    if (tagField && (Object.hasOwn(original, 'tag') || getChips(tagField).length)) result.tag = serializeList(getChips(tagField), original.tag);
    const languages = document.querySelector('[data-chip-field="languages"]');
    const architecture = document.querySelector('[data-chip-field="architecture"]');
    const libraries = document.querySelector('[data-chip-field="libraries"]');
    if (languages && (Object.hasOwn(original, 'languages') || getChips(languages).length)) result.languages = serializeList(getChips(languages), original.languages);
    if (architecture && (Object.hasOwn(original, 'architecture') || getChips(architecture).length)) result.architecture = serializeList(getChips(architecture), original.architecture);
    if (libraries && (Object.hasOwn(original, 'libraries') || getChips(libraries).length)) result.libraries = serializeList(getChips(libraries), original.libraries);
    const features = readRows('#mp-feature-rows .project-repeat-row', row => [row.querySelector('[data-row-value]')?.value || '']).map(row => row[0]);
    if (Object.hasOwn(original, 'features') || features.length) result.features = serializeLines(features, original.features);
    const challenges = saveRows(readRows('#mp-challenge-rows .project-repeat-row', row => [row.querySelector('[data-row-left]')?.value || '', row.querySelector('[data-row-right]')?.value || '']), original.challenges);
    if (Object.hasOwn(original, 'challenges') || lineValues(challenges).length) result.challenges = challenges;
    const learned = lineValues(document.getElementById('m-learned')?.value || '');
    if (Object.hasOwn(original, 'learned') || learned.length) result.learned = serializeLines(learned, original.learned);
    const archLayers = saveRows(readRows('#mp-layer-rows .project-repeat-row', row => [row.querySelector('[data-row-left]')?.value || '', row.querySelector('[data-row-right]')?.value || '']), original.archLayers);
    if (Object.hasOwn(original, 'archLayers') || lineValues(archLayers).length) result.archLayers = archLayers;
    const team = saveRows(readRows('#mp-team-rows .project-repeat-row', row => [row.querySelector('[data-row-name]')?.value || '', row.querySelector('[data-row-role]')?.value || '', row.querySelector('[data-row-link]')?.value || '']), original.team);
    if (Object.hasOwn(original, 'team') || lineValues(team).length) result.team = team;
    const stackGroups = document.getElementById('m-stackGroups');
    if (stackGroups && (Object.hasOwn(original, 'stackGroups') || stackGroups.value.trim())) result.stackGroups = stackGroups.value;
    const archImage = document.getElementById('m-archImage');
    if (archImage && (Object.hasOwn(original, 'archImage') || archImage.value.trim())) result.archImage = archImage.value;
    return result;
}

function dataSizeSync() { syncDataSize(); updateTabDots(); }

window.ProjectFields = {
    startEditor() { lastOpenTab = 'basics'; },
    imageChanged() { dataSizeSync(); },
    getActiveTab: () => lastOpenTab,
    commitPending() { document.querySelectorAll('.project-chip-input').forEach(input => { if (input.value.trim()) commitChipText(input); }); },
    switchTab(button) {
        const editor = button.closest('[data-project-editor]');
        lastOpenTab = button.dataset.tab;
        editor.querySelectorAll('.project-tab-button').forEach(tab => {
            const active = tab === button;
            tab.classList.toggle('active', active);
            tab.setAttribute('aria-selected', String(active));
        });
        editor.querySelectorAll('.project-tab-panel').forEach(panel => {
            const active = panel.dataset.panel === lastOpenTab;
            panel.hidden = !active;
            panel.classList.toggle('active', active);
        });
        updateTabDots();
    },
    addChip(input) { commitChipText(input); },
    removeChip(button) { button.closest('.project-chip')?.remove(); updateTabDots(); },
    handleChipKey(event) { chipEvent(event); },
    syncColor(input) {
        const picker = document.getElementById('m-color-picker');
        const hex = document.getElementById('m-color');
        if (input === picker) hex.value = picker.value;
        else if (/^#[0-9a-f]{6}$/i.test(hex.value)) picker.value = hex.value;
        dataSizeSync();
    },
    addScreen() {
        const container = document.getElementById('mp-screens');
        container.insertAdjacentHTML('beforeend', screenCard({ title: `Group ${container.children.length + 1}`, images: [], tech: [], points: [] }, container.children.length));
    },
    removeScreen(button) { button.closest('.mp-sec')?.remove(); dataSizeSync(); },
    allowDrop(event) { event.preventDefault(); event.currentTarget.classList.add('is-dragging'); },
    async dropImages(event, zone) {
        event.preventDefault();
        zone.classList.remove('is-dragging');
        await this.addFiles(zone.nextElementSibling, [...event.dataTransfer.files]);
    },
    async addImages(input) { await this.addFiles(input, [...input.files]); input.value = ''; },
    async addFiles(input, files) {
        const group = input.closest('.mp-screenshots');
        const list = group.querySelector('.mp-image-list');
        const status = group.querySelector('.mp-image-status');
        let error = '';
        let added = 0;
        for (let index = 0; index < files.length; index++) {
            if (list.children.length >= 8) { error = 'Maximum 8 images per group.'; break; }
            status.textContent = `Adding ${index + 1} of ${files.length}…`;
            await new Promise(resolve => requestAnimationFrame(resolve));
            try {
                const { dataUrl, size } = await compressImageFile(files[index], { maxSide: 1400, preserveGif: true });
                list.insertAdjacentHTML('beforeend', imageCard(dataUrl, size));
                added++;
                group.closest('.mp-sec').querySelector('.mp-image-count').textContent = `${list.children.length} / 8`;
                dataSizeSync();
            } catch (failure) { error = failure.message || 'Could not add this image.'; }
        }
        status.textContent = error || `Added ${added} image${added === 1 ? '' : 's'}.`;
    },
    addLink(button) {
        const group = button.closest('.mp-screenshots');
        const list = group.querySelector('.mp-image-list');
        const input = group.querySelector('.mp-image-link');
        const status = group.querySelector('.mp-image-status');
        if (list.children.length >= 8) { status.textContent = 'Maximum 8 images per group.'; return; }
        const url = input.value.trim();
        try { if (!['http:', 'https:'].includes(new URL(url).protocol)) throw new Error(); }
        catch { status.textContent = 'Enter a valid image link.'; return; }
        list.insertAdjacentHTML('beforeend', imageCard(url));
        input.value = '';
        group.closest('.mp-sec').querySelector('.mp-image-count').textContent = `${list.children.length} / 8`;
        status.textContent = '';
        dataSizeSync();
    },
    moveImage(button, direction) {
        const item = button.closest('.mp-image-item');
        const target = direction < 0 ? item.previousElementSibling : item.nextElementSibling;
        if (target) direction < 0 ? target.before(item) : target.after(item);
        dataSizeSync();
    },
    removeImage(button) {
        const group = button.closest('.mp-screenshots');
        button.closest('.mp-image-item')?.remove();
        group.closest('.mp-sec').querySelector('.mp-image-count').textContent = `${group.querySelectorAll('.mp-image-item').length} / 8`;
        dataSizeSync();
    },
    addLine(type, group = '') {
        const container = type === 'feature' ? document.getElementById('mp-feature-rows') : document.querySelector(`.mp-point-rows[data-group="${group}"]`) || document.querySelector(`#mp-screens .mp-sec:nth-child(${Number(group) + 1}) .mp-point-rows`);
        container?.insertAdjacentHTML('beforeend', lineRow(type, '', container.children.length, group));
    },
    addChallenge() { document.getElementById('mp-challenge-rows')?.insertAdjacentHTML('beforeend', challengeRow()); },
    addLayer() { document.getElementById('mp-layer-rows')?.insertAdjacentHTML('beforeend', layerRow()); },
    addTeam() { document.getElementById('mp-team-rows')?.insertAdjacentHTML('beforeend', teamRow()); },
    removeRow(button) { button.closest('.project-repeat-row')?.remove(); }
};

document.addEventListener('keydown', event => {
    if (event.target.matches('.project-chip-input')) chipEvent(event);
});
document.addEventListener('paste', event => {
    if (event.target.matches('.project-chip-input')) setTimeout(() => { if (/[,|\n]/.test(event.target.value)) commitChipText(event.target); }, 0);
});
document.addEventListener('focusout', event => {
    if (event.target.matches?.('.project-chip-input') && event.target.value.trim()) commitChipText(event.target);
});
document.addEventListener('input', event => {
    if (event.target.closest('[data-project-editor]')) dataSizeSync();
});
