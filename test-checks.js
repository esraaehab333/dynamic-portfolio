import { projectEditorTabs, getProjectFields } from './portfolio/js/admin/sections/project-fields.js';
import { buildItem } from './portfolio/js/admin/sections/projects.js';
import { render as renderProjectsSection } from './portfolio/js/sections/projects.js';
import './portfolio/js/project-page.js'; // attaches window.ProjectPage

function assert(cond, msg) {
    if (cond) console.log('[PASS]', msg);
    else {
        console.error('[FAIL]', msg);
        process.exitCode = 1;
    }
}

// 1. New project: Story tab shows Overview on top. Fill only Overview, Save, reopen: it is still there and the Story dot is on.
const storyMarkup = getProjectFields({ overview: 'My overview story' });
assert(storyMarkup.includes('id="m-overview"'), 'Story tab has Overview field m-overview');
assert(storyMarkup.indexOf('id="m-overview"') < storyMarkup.indexOf('Key features'), 'Overview field is above Key features');

const tabsMarkup = projectEditorTabs({ overview: 'My overview story' });
assert(tabsMarkup.includes('data-tab="story"') && tabsMarkup.includes('has-content'), 'Story tab dot indicator is ON when only overview is filled');

// 2. Save a project with an empty Overview: the data has no `overview` key and no `desc`/`description` copied from subtitle.
// Mock DOM elements for buildItem
global.document = {
    getElementById: (id) => {
        if (id === 'm-title') return { value: 'Test Title' };
        if (id === 'm-subtitle') return { value: 'Test Subtitle' };
        if (id === 'm-overview') return { value: '   ' }; // empty overview
        if (id === 'm-image') return { value: '' };
        if (id === 'm-video') return { value: '' };
        if (id === 'm-github') return { value: '' };
        if (id === 'm-playstore') return { value: '' };
        if (id === 'm-appstore') return { value: '' };
        if (id === 'm-apk') return { value: '' };
        if (id === 'm-demo') return { value: '' };
        if (id === 'm-learned') return { value: '' };
        if (id === 'm-stackGroups') return { value: '' };
        if (id === 'm-archImage') return { value: '' };
        return { value: '' };
    },
    querySelector: () => null,
    querySelectorAll: () => []
};

const savedItem = buildItem();
assert(!Object.hasOwn(savedItem, 'overview'), 'Saved item with empty Overview has no overview key');
assert(!Object.hasOwn(savedItem, 'desc'), 'Saved item has no desc key copied from subtitle');
assert(!Object.hasOwn(savedItem, 'description'), 'Saved item has no description key copied from subtitle');

// 3. Old project with desc === subtitle: the project page has no Overview section and no Overview chip.
const oldProj1 = { id: '1', title: 'Old 1', subtitle: 'Same subtitle', desc: 'Same subtitle' };
const html1 = window.ProjectPage.html(oldProj1);
assert(!html1.includes('id="pp-s-overview"'), 'Old project with desc === subtitle has no Overview section');
assert(!html1.includes('data-jump="pp-s-overview"'), 'Old project with desc === subtitle has no Overview jump chip');

// 4. Old project with a real desc (different from subtitle): Overview still shows it.
const oldProj2 = { id: '2', title: 'Old 2', subtitle: 'Sub', desc: 'Different description text' };
const html2 = window.ProjectPage.html(oldProj2);
assert(html2.includes('id="pp-s-overview"'), 'Old project with real desc shows Overview section');
assert(html2.includes('Different description text'), 'Overview section shows desc content');

// 5. Project with overview: page shows the overview text.
const newProj = { id: '3', title: 'New 3', subtitle: 'Sub', overview: 'This is the new overview.' };
const html3 = window.ProjectPage.html(newProj);
assert(html3.includes('id="pp-s-overview"'), 'Project with overview shows Overview section');
assert(html3.includes('This is the new overview.'), 'Overview section shows overview text');

// 6. Project without an image: home card shows empty block, no request to via.placeholder.com
let renderOutput = '';
const mockMount = {
    set innerHTML(val) { renderOutput = val; },
    get innerHTML() { return renderOutput; },
    querySelectorAll: () => []
};
global.document.getElementById = (id) => (id === 'projects-mount' ? mockMount : null);
renderProjectsSection({ projects: [{ id: '1', title: 'P1' }] });
assert(renderOutput.includes('project-thumb project-thumb--empty'), 'Project card shows empty thumb block');
assert(!renderOutput.includes('via.placeholder.com'), 'Project card has no via.placeholder.com link');

// 7. Overview XSS check
const xssProj = { id: '4', title: 'XSS', overview: '<img src=x onerror=alert(1)>' };
const htmlXSS = window.ProjectPage.html(xssProj);
assert(htmlXSS.includes('&lt;img src=x onerror=alert(1)&gt;'), 'Overview escapes XSS payload');
assert(!htmlXSS.includes('<img src=x'), 'No raw <img> tag in overview HTML');
