const escapeValue = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const input = (id, label, value, type = 'text', hint = '') => `<div class="form-group"><label for="${id}">${label}</label><input id="${id}" class="form-control" type="${type}" value="${escapeValue(value)}">${hint ? `<small class="form-hint">${hint}</small>` : ''}</div>`;
const area = (id, label, value, hint = '', extra = '') => `<div class="form-group"><label for="${id}">${label}</label><textarea id="${id}" class="form-control" rows="${id === 'm-structure' ? 8 : 4}" ${extra}>${escapeValue(value)}</textarea>${hint ? `<small class="form-hint">${hint}</small>` : ''}</div>`;

export function getProjectFields(item = {}) {
    const screenCards = (item.showcase || []).map(screen => screenCard(screen)).join('');
    return `<fieldset><legend>Project page details</legend>
      ${input('m-logo', 'Logo image URL', item.logo)}
      ${input('m-slogan', 'Slogan', item.slogan)}
      ${input('m-color', 'Accent color (hex)', item.color, 'text', 'Optional #RRGGBB value; leave blank to use the site accent')}
      ${input('m-platform', 'Platform', item.platform)}
      ${input('m-role', 'Role', item.role)}
      <div class="form-group"><label for="m-status">Status</label><select id="m-status" class="form-control"><option value="">Not set</option><option value="completed" ${item.status === 'completed' ? 'selected' : ''}>Completed</option><option value="in-progress" ${item.status === 'in-progress' ? 'selected' : ''}>In progress</option><option value="published" ${item.status === 'published' ? 'selected' : ''}>Published</option></select></div>
      ${input('m-startDate', 'Start date', item.startDate, 'month')}
      ${input('m-endDate', 'End date', item.endDate, 'month')}
      ${input('m-languages', 'Languages', item.languages, 'text', 'Separate values with |')}
      ${input('m-architecture', 'Architecture', item.architecture, 'text', 'Separate values with |')}
      ${input('m-libraries', 'Libraries & tools', item.libraries, 'text', 'Separate values with |')}
      ${input('m-playstore', 'Google Play URL', item.playstore)}
      ${input('m-appstore', 'App Store URL', item.appstore)}
      ${input('m-apk', 'APK URL', item.apk)}
      ${input('m-stackGroups', 'Additional stack groups', item.stackGroups, 'text', 'One per line: Group name: Item | Item')}
      ${area('m-features', 'Key features', item.features, 'One feature per line')}
      ${area('m-archIntro', 'Architecture introduction', item.archIntro)}
      ${area('m-archLayers', 'Architecture layers', item.archLayers, 'One per line: layer | Description')}
      ${input('m-archImage', 'Architecture diagram URL', item.archImage)}
      ${area('m-structure', 'Project structure', item.structure, 'Keep spaces to preserve the folder tree', 'spellcheck="false" style="font-family: monospace;"')}
      ${area('m-challenges', 'Challenges & solutions', item.challenges, 'One per line: Challenge | How I solved it')}
      ${area('m-learned', 'What I learned', item.learned, 'One lesson per line')}
      ${area('m-setup', 'Run it locally', item.setup, 'Public code only; do not include API keys', 'spellcheck="false" style="font-family: monospace;"')}
      ${area('m-team', 'Collaborators', item.team, 'One per line: Name | Role | Profile link')}
      <div class="form-group"><label for="m-videoRatio">Video frame</label><select id="m-videoRatio" class="form-control"><option value="">Portrait</option><option value="landscape" ${item.videoRatio === 'landscape' ? 'selected' : ''}>Landscape</option></select></div>
      <div class="form-group"><label>Screens</label><div id="mp-screens">${screenCards}</div><button type="button" class="add-new-btn" onclick="ProjectFields.addScreen()">+ Add a screen block</button></div>
    </fieldset>`;
}

function screenCard(screen = {}) {
    return `<div class="mp-sec"><button type="button" class="add-new-btn" onclick="ProjectFields.moveScreen(this,-1)">↑ Up</button> <button type="button" class="add-new-btn" onclick="ProjectFields.moveScreen(this,1)">↓ Down</button> <button type="button" class="add-new-btn" onclick="ProjectFields.removeScreen(this)">Remove</button>
      ${input('mp-s-title', 'Name', screen.title)}${input('mp-s-sub', 'Subtitle', screen.subtitle)}${area('mp-s-images', 'Screenshots (one URL per line)', (screen.images || []).join('\n'))}${input('mp-s-tech', 'Technologies', (screen.tech || []).join(' | '))}${area('mp-s-points', 'Points (one per line)', (screen.points || []).join('\n'))}</div>`;
}
window.ProjectFields = {
    addScreen() { document.getElementById('mp-screens')?.insertAdjacentHTML('beforeend', screenCard()); },
    removeScreen(button) { button.closest('.mp-sec')?.remove(); },
    moveScreen(button, direction) { const card = button.closest('.mp-sec'), target = direction < 0 ? card?.previousElementSibling : card?.nextElementSibling; if (!card || !target) return; direction < 0 ? target.before(card) : target.after(card); }
};
export function buildProjectFields() {
    const fields = ['logo', 'slogan', 'color', 'platform', 'role', 'status', 'startDate', 'endDate', 'languages', 'architecture', 'libraries', 'features', 'structure', 'team', 'videoRatio', 'playstore', 'appstore', 'apk', 'stackGroups', 'archIntro', 'archLayers', 'archImage', 'challenges', 'learned', 'setup'];
    const result = Object.fromEntries(fields.map(key => [key, document.getElementById(`m-${key}`).value]));
    const split = value => value.split(/\r?\n/).map(part => part.trim()).filter(Boolean);
    result.showcase = [...document.querySelectorAll('#mp-screens .mp-sec')].map(card => ({
        title: card.querySelector('#mp-s-title, [id="mp-s-title"]')?.value.trim() || '',
        subtitle: card.querySelector('[id="mp-s-sub"]')?.value.trim() || '',
        images: split(card.querySelector('[id="mp-s-images"]')?.value || ''),
        tech: (card.querySelector('[id="mp-s-tech"]')?.value || '').split('|').map(x => x.trim()).filter(Boolean),
        points: split(card.querySelector('[id="mp-s-points"]')?.value || '')
    })).filter(screen => screen.title || screen.subtitle || screen.images.length || screen.tech.length || screen.points.length);
    return result;
}
