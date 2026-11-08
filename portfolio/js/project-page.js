import { initThemeToggle } from './core/theme.js';
import { mdToHtml, looksLikeMd, inlineMd } from './core/markdown.js';

/* ==========================================================================
   project-page.js
   Builds the project details page from one project object.

   Usage (see INTEGRATION.md):
     container.innerHTML = ProjectPage.html(project, { prev, next, href, backHref });
     ProjectPage.bind(container);

   Every field except `title` is optional, so projects saved before this file
   existed still render (they show the description, stack tags and links).
   An empty field hides its part of the page.
   ========================================================================== */
(function (global) {
    'use strict';

    /* ---------- icons (Phosphor on the live site, replaceable) ---------- */
    const ICONS = {
        back: 'ph ph-arrow-left',
        forward: 'ph ph-arrow-right',
        github: 'ph ph-github-logo',
        demo: 'ph ph-arrow-square-out',
        linkedin: 'ph ph-linkedin-logo',
        store: 'ph ph-google-play-logo',
        apple: 'ph ph-apple-logo',
        download: 'ph ph-download-simple',
        play: 'ph-fill ph-play',
        calendar: 'ph ph-calendar-blank',
        clock: 'ph ph-clock',
        user: 'ph ph-user',
        phone: 'ph ph-device-mobile',
        flag: 'ph ph-flag-checkered',
        check: 'ph ph-check-circle',
        link: 'ph ph-arrow-up-right',
        folder: 'ph ph-folder-simple',
        copy: 'ph ph-copy',
        close: 'ph ph-x',
        left: 'ph ph-caret-left',
        right: 'ph ph-caret-right',
        bulb: 'ph ph-lightbulb',
        terminal: 'ph ph-terminal-window'
    };

    const api = {
        icon: function (name) {
            return '<i class="' + (ICONS[name] || 'ph ph-circle') + '" aria-hidden="true"></i>';
        }
    };

    /* ---------- helpers ---------- */
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    const safeUrl = u => {
        const s = String(u || '').trim();
        if (!/^https?:\/\//i.test(s)) return '';
        try { return new URL(s).href; } catch (e) { return ''; }
    };

    // a file that ships with the site, for example "assets/demo.mp4"
    const relPath = u => {
        const s = String(u || '').trim();
        return /^(?:\.\/|\/(?!\/)|assets\/)[\w\-./%@+]*$/i.test(s) && s.indexOf('..') === -1 ? s : '';
    };

    // image fields: https link, a file in the site's assets folder, or an inline image
    const safeImg = u => {
        const s = String(u || '').trim();
        if (/^data:image\/(?:png|jpe?g|gif|webp|avif|svg\+xml)[;,]/i.test(s)) return s;
        return safeUrl(s) || relPath(s);
    };

    const toLines = v => (Array.isArray(v) ? v : String(v == null ? '' : v).split(/\r?\n/)).map(s => String(s).trim()).filter(Boolean);
    const toItems = v => (Array.isArray(v) ? v : String(v == null ? '' : v).split(/[|,·]/)).map(s => String(s).trim()).filter(Boolean);

    const hex = c => (/^#[0-9a-f]{6}$/i.test(String(c || '').trim()) ? String(c).trim() : '');
    const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).join(', ');

    const icon = name => api.icon(name);

    /* ---------- dates ---------- */
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    function parseDate(v) {
        const m = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?/.exec(String(v || '').trim());
        if (!m) return null;
        const y = Number(m[1]);
        const mo = m[2] ? Number(m[2]) : null;
        const d = m[3] ? Number(m[3]) : null;
        if (mo !== null && (mo < 1 || mo > 12)) return null;
        if (d !== null && (d < 1 || d > 31)) return null;
        return { y, m: mo, d };
    }

    function fmtDate(d) {
        if (!d) return '';
        if (d.m && d.d) return d.d + ' ' + MONTHS[d.m - 1] + ' ' + d.y;
        if (d.m) return MONTHS[d.m - 1] + ' ' + d.y;
        return String(d.y);
    }

    function duration(a, b) {
        if (!a || !b) return '';
        if (a.m && a.d && b.m && b.d) {
            const dtA = new Date(a.y, a.m - 1, a.d);
            const dtB = new Date(b.y, b.m - 1, b.d + 1);
            if (dtB <= dtA) return '';

            let y = dtB.getFullYear() - dtA.getFullYear();
            let m = dtB.getMonth() - dtA.getMonth();
            let d = dtB.getDate() - dtA.getDate();

            if (d < 0) {
                m--;
                const prevMonthLastDay = new Date(dtB.getFullYear(), dtB.getMonth(), 0).getDate();
                d += prevMonthLastDay;
            }
            if (m < 0) {
                y--;
                m += 12;
            }

            if (y === 0 && m === 0) {
                if (d % 7 === 0 && d > 0) {
                    const w = d / 7;
                    return w === 1 ? '1 week' : w + ' weeks';
                }
                return d === 1 ? '1 day' : d + ' days';
            }

            const parts = [];
            if (y > 0) parts.push(y + (y === 1 ? ' year' : ' years'));
            if (m > 0) parts.push(m + (m === 1 ? ' month' : ' months'));
            if (d > 0) parts.push(d + (d === 1 ? ' day' : ' days'));
            return parts.join(' ');
        }

        if (a.m && b.m) {
            const total = (b.y * 12 + b.m) - (a.y * 12 + a.m) + 1;
            if (total < 1) return '';
            if (total === 1) return '1 month';
            if (total < 12) return total + ' months';
            const y = Math.floor(total / 12);
            const m = total % 12;
            return y + (y === 1 ? ' year' : ' years') + (m ? ' ' + m + (m === 1 ? ' month' : ' months') : '');
        }

        if (a.y && b.y) {
            const total = b.y - a.y + 1;
            if (total < 1) return '';
            return total === 1 ? '1 year' : total + ' years';
        }

        return '';
    }

    function timeline(p) {
        const s = parseDate(p.startDate);
        const e = parseDate(p.endDate);
        if (!s && !e) return null;
        const now = new Date();
        const today = { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() };
        return {
            start: s ? fmtDate(s) : '',
            end: e ? fmtDate(e) : 'Ongoing',
            dur: s ? duration(s, e || today) : ''
        };
    }

    /* ---------- video ---------- */
    const FILE_RE = /\.(mp4|webm|mov|m4v|ogv)$/i;

    function videoInfo(raw) {
        const text = String(raw || '').trim();
        const rel = relPath(text);
        if (rel && FILE_RE.test(rel)) return { kind: 'file', url: rel, file: rel, embed: '', thumb: '', id: '' };

        const url = safeUrl(text);
        if (!url) return null;
        let u;
        try { u = new URL(url); } catch (e) { return null; }
        const host = u.hostname.replace(/^www\./, '').replace(/^m\./, '');

        let id = '';
        if (host === 'youtu.be') id = u.pathname.split('/')[1] || '';
        else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
            if (u.pathname === '/watch') id = u.searchParams.get('v') || '';
            else {
                const m = u.pathname.match(/^\/(?:embed|shorts|live|v)\/([\w-]+)/);
                if (m) id = m[1];
            }
        }
        if (/^[\w-]{6,20}$/.test(id)) {
            return {
                kind: 'youtube', id: id, url: url,
                embed: 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&playsinline=1&modestbranding=1',
                thumb: 'https://i.ytimg.com/vi/' + id + '/maxresdefault.jpg'
            };
        }
        if (host === 'vimeo.com') {
            const m = u.pathname.match(/^\/(\d+)/);
            if (m) return { kind: 'vimeo', id: m[1], url: url, embed: 'https://player.vimeo.com/video/' + m[1] + '?autoplay=1', thumb: '' };
        }
        if (host === 'drive.google.com') {
            const m = u.pathname.match(/^\/file\/d\/([\w-]+)/);
            if (m) return { kind: 'drive', id: m[1], url: url, embed: 'https://drive.google.com/file/d/' + m[1] + '/preview', thumb: '' };
        }
        if (FILE_RE.test(u.pathname)) return { kind: 'file', url: url, file: url, embed: '', thumb: '', id: '' };
        return { kind: 'link', id: '', url: url, embed: '', thumb: '' };
    }

    /* ---------- small pieces ---------- */
    const section = (id, label, inner, cls) =>
        '<section class="pp-sec' + (cls ? ' ' + cls : '') + '" id="pp-s-' + id + '"><div class="pp-label">' + esc(label) + '</div>' + inner + '</section>';

    const chips = (list, accent) => list.map(t => '<span class="pp-chip' + (accent ? ' is-accent' : '') + '">' + esc(t) + '</span>').join('');

    const checkList = (list, cls) =>
        '<ul class="pp-features' + (cls ? ' ' + cls : '') + '">' + list.map(f => '<li>' + icon('check') + '<span>' + esc(f) + '</span></li>').join('') + '</ul>';

    function screenHTML(p, letter) {
        const gen = '<span class="pp-gen" aria-hidden="true"><span>' + letter + '</span></span>';
        const v = videoInfo(p.video);
        if (v) {
            const poster = v.thumb || safeImg(p.image);
            const thumb = poster ? '<img class="pp-thumb" src="' + esc(poster) + '" alt="" loading="lazy" data-id="' + esc(v.kind === 'youtube' ? v.id : '') + '">' : '';
            const inner = gen + thumb + '<span class="pp-scrim"></span><span class="pp-play">' + icon('play') + '</span><span class="pp-play-label">Watch the demo</span>';
            const title = esc((p.title || 'Project') + ' demo');
            if (v.embed) return '<button type="button" class="pp-facade" data-embed="' + esc(v.embed) + '" data-title="' + title + '" aria-label="Play the demo video">' + inner + '</button>';
            if (v.file) return '<button type="button" class="pp-facade" data-file="' + esc(v.file) + '" data-title="' + title + '" aria-label="Play the demo video">' + inner + '</button>';
            return '<a class="pp-facade" href="' + esc(v.url) + '" target="_blank" rel="noopener noreferrer" aria-label="Open the demo video">' + inner + '</a>';
        }
        const shot = safeImg(p.image);
        if (shot) return gen + '<button type="button" class="pp-fig pp-screen-image" data-cap="' + esc(p.title || 'Project screenshot') + '" aria-label="Enlarge project screenshot"><img class="pp-shot" src="' + esc(shot) + '" alt="' + esc(p.title) + ' screenshot" loading="lazy"></button>';
        return gen;
    }

    function stageHTML(p, letter, floats) {
        if (!videoInfo(p.video) && !safeImg(p.image)) return '';
        const land = p.videoRatio === 'landscape';
        return '<div class="pp-stage">' +
            '<span class="pp-ring pp-ring-1"></span><span class="pp-ring pp-ring-2"></span><span class="pp-ring pp-ring-3"></span>' +
            floats.slice(0, 4).map((t, i) => '<span class="pp-float pp-float-' + (i + 1) + '">' + esc(t) + '</span>').join('') +
            '<div class="pp-phone' + (land ? ' is-land' : '') + '"><span class="pp-island"></span><div class="pp-screen">' + screenHTML(p, letter) + '</div></div>' +
            '</div>';
    }

    function teamHTML(p) {
        const people = toLines(p.team).map(l => {
            const parts = l.split('|').map(s => s.trim());
            return { name: parts[0] || '', role: parts[1] || '', url: safeUrl(parts[2]) };
        }).filter(m => m.name);
        if (!people.length) return '';
        const rows = people.map(m => {
            const initials = esc(m.name.split(/\s+/).slice(0, 2).map(w => w.charAt(0)).join('').toUpperCase());
            const body = '<span class="pp-avatar" aria-hidden="true">' + initials + '</span>' +
                '<span class="pp-member-text"><span class="pp-member-name">' + esc(m.name) + '</span>' +
                (m.role ? '<span class="pp-member-role">' + esc(m.role) + '</span>' : '') + '</span>';
            return m.url
                ? '<a class="pp-member" href="' + esc(m.url) + '" target="_blank" rel="noopener noreferrer" aria-label="' + esc(m.name) + ' profile">' + body + icon('link') + '</a>'
                : '<div class="pp-member">' + body + '</div>';
        }).join('');
        return '<div class="pp-card"><div class="pp-label">Collaborators</div><div class="pp-team">' + rows + '</div></div>';
    }

    function stackHTML(p, tags) {
        const groups = [
            ['Languages', toItems(p.languages), false],
            ['Architecture', toItems(p.architecture), true],
            ['Libraries & tools', toItems(p.libraries), false]
        ];
        // extra groups, one per line:  Backend & AI: Shopify | Gemini | Supabase
        toLines(p.stackGroups).forEach(l => {
            const i = l.indexOf(':');
            groups.push([i > 0 ? l.slice(0, i).trim() : 'More', toItems(i > 0 ? l.slice(i + 1) : l), false]);
        });
        const shown = groups.filter(g => g[1].length);
        if (!shown.length && tags.length) shown.push(['Stack', tags, false]);
        if (!shown.length) return '';
        return '<div class="pp-card"><div class="pp-label">Tech stack</div>' +
            shown.map(g => '<div class="pp-group"><div class="pp-group-title">' + esc(g[0]) + '</div><div class="pp-chips">' + chips(g[1], g[2]) + '</div></div>').join('') + '</div>';
    }

    /* ---------- screens gallery ---------- */
    function showcaseHTML(p) {
        const list = Array.isArray(p.showcase) ? p.showcase : [];
        const blocks = list.map(s => {
            if (!s || typeof s !== 'object') return '';
            const title = String(s.title || '').trim();
            const sub = String(s.subtitle || '').trim();
            const tech = toItems(s.tech);
            const points = toLines(s.points);
            const images = toLines(s.images).map(safeImg).filter(Boolean);
            if (!title && !sub && !tech.length && !points.length && !images.length) return '';

            const head = (title || sub || tech.length)
                ? '<header class="pp-show-head' + (tech.length ? '' : ' is-solo') + '"><div>' +
                  (title ? '<h3 class="pp-show-title">' + esc(title) + '</h3>' : '') +
                  (sub ? '<p class="pp-show-sub">' + esc(sub) + '</p>' : '') + '</div>' +
                  (tech.length ? '<div class="pp-built"><div class="pp-group-title">Built with</div><div class="pp-chips">' + chips(tech, false) + '</div></div>' : '') +
                  '</header>'
                : '';

            const media = images.length
                ? '<div class="pp-rail' + (images.length === 1 ? ' is-solo' : '') + '">' +
                  images.map((src, i) =>
                      '<button type="button" class="pp-fig" data-cap="' + esc(title) + '" aria-label="Enlarge ' + esc(title || 'screenshot') + ' (' + (i + 1) + ' of ' + images.length + ')">' +
                      '<img src="' + esc(src) + '" alt="' + esc((title || 'Project') + ' screenshot ' + (i + 1)) + '" loading="' + (images.length === 1 ? 'eager' : 'lazy') + '" decoding="async"></button>'
                  ).join('') + '</div>'
                : '';

            return '<article class="pp-show">' + head + media + (points.length ? checkList(points) : '') + '</article>';
        }).filter(Boolean);
        return blocks.length ? '<div class="pp-showcase">' + blocks.join('') + '</div>' : '';
    }

    /* ---------- architecture ---------- */
    function archHTML(p) {
        const intro = String(p.archIntro || '').trim();
        const layers = toLines(p.archLayers).map(l => {
            const i = l.indexOf('|');
            return i > 0 ? [l.slice(0, i).trim(), l.slice(i + 1).trim()] : [l, ''];
        }).filter(l => l[0]);
        const diagram = safeImg(p.archImage);
        let tree = String(p.structure || '').replace(/\s+$/, '').replace(/^\s*\n/, '');
        if (!intro && !layers.length && !diagram && !tree.trim()) return '';

        let introHTML = '';
        if (intro) {
            const body = looksLikeMd(intro)
                ? '<div class="pp-md">' + mdToHtml(intro) + '</div>'
                : '<div class="pp-md"><p>' + inlineMd(intro) + '</p></div>';
            introHTML = '<div class="pp-code"><div class="pp-code-bar">' + icon('folder') + ' architecture</div>' + body + '</div>';
        }

        let treeHTML = '';
        if (tree.trim()) {
            let treeText = tree.trim();
            if (!looksLikeMd(treeText) && treeText.startsWith('```')) {
                const lines = treeText.split(/\r?\n/);
                lines.shift();
                if (lines.length > 0 && lines[lines.length - 1].trim().startsWith('```')) {
                    lines.pop();
                }
                treeText = lines.join('\n');
            }
            const body = looksLikeMd(treeText)
                ? '<div class="pp-md">' + mdToHtml(treeText) + '</div>'
                : '<pre><code>' + esc(treeText) + '</code></pre>';
            treeHTML = '<div class="pp-code"><div class="pp-code-bar">' + icon('folder') + ' project structure</div>' + body + '</div>';
        }

        return '<div class="pp-arch">' +
            introHTML +
            (layers.length ? '<ul class="pp-layers">' + layers.map(l => '<li class="pp-layer"><h3>' + esc(l[0]) + '</h3>' + (l[1] ? '<p>' + esc(l[1]) + '</p>' : '') + '</li>').join('') + '</ul>' : '') +
            (diagram ? '<figure class="pp-diagram"><button type="button" class="pp-fig pp-diagram-fig" data-cap="Architecture diagram" aria-label="Enlarge architecture diagram"><img src="' + esc(diagram) + '" alt="Architecture diagram"></button></figure>' : '') +
            treeHTML +
            '</div>';
    }

    /* ---------- challenges and learnings ---------- */
    function challengesHTML(p) {
        const rows = toLines(p.challenges).map(l => {
            const i = l.indexOf('|');
            return i > 0 ? [l.slice(0, i).trim(), l.slice(i + 1).trim()] : [l, ''];
        }).filter(r => r[0]);
        const learned = toLines(p.learned);
        if (!rows.length && !learned.length) return '';
        return (rows.length ? '<div class="pp-chs">' + rows.map(r =>
            '<div class="pp-ch"><div><div class="pp-ch-k">Challenge</div><p class="pp-ch-t">' + esc(r[0]) + '</p></div>' +
            (r[1] ? '<div><div class="pp-ch-k">How I solved it</div><p class="pp-ch-s">' + esc(r[1]) + '</p></div>' : '') + '</div>').join('') + '</div>' : '') +
            (learned.length ? '<div class="pp-learned-wrap"><div class="pp-group-title">What I learned</div>' +
                '<ul class="pp-features">' + learned.map(f => '<li>' + icon('bulb') + '<span>' + esc(f) + '</span></li>').join('') + '</ul></div>' : '');
    }

    /* ---------- run locally ---------- */
    function setupHTML(p) {
        const text = String(p.setup || '').replace(/\s+$/, '').replace(/^\s*\n/, '');
        if (!text.trim()) return '';
        const body = looksLikeMd(text)
            ? '<div class="pp-md">' + mdToHtml(text) + '</div>'
            : '<pre><code>' + esc(text) + '</code></pre>';
        return '<div class="pp-code"><div class="pp-code-bar">' + icon('terminal') + ' setup' +
            '<button type="button" class="pp-copybtn" data-copy data-raw="' + esc(text) + '">' + icon('copy') + '<span class="pp-copy-label">Copy</span></button></div>' +
            body + '</div>';
    }

    function pagerHTML(opts) {
        const href = opts.href || (p => '#/project/' + (p.id != null ? p.id : ''));
        const link = (proj, dir) => !proj ? '' :
            '<a class="pp-pager-link is-' + dir + '" href="' + esc(href(proj)) + '">' +
            '<span class="pp-pager-dir">' + (dir === 'prev' ? icon('back') + ' Previous project' : 'Next project ' + icon('forward')) + '</span>' +
            '<span class="pp-pager-title">' + esc(proj.title || 'Untitled project') + '</span></a>';
        const out = link(opts.prev, 'prev') + link(opts.next, 'next');
        return out ? '<nav class="pp-pager" aria-label="More projects">' + out + '</nav>' : '';
    }

    /* ---------- main entry ---------- */
    api.html = function (p, opts) {
        p = p || {};
        opts = opts || {};

        const titleText = String(p.title || '').trim();
        const letter = esc((titleText.charAt(0) || '?').toUpperCase());
        const tags = toItems(p.tag);
        const languages = toItems(p.languages);
        const libs = toItems(p.libraries);
        const accent = hex(p.color);
        const style = accent ? ' style="--pp-accent:' + accent + ';--pp-accent-rgb:' + rgb(accent) + '"' : '';

        /* hero: logo, name, slogan */
        const logoUrl = safeImg(p.logo);
        const logo = logoUrl
            ? '<span class="pp-logo has-img"><button type="button" class="pp-fig pp-logo-fig" data-cap="' + esc(titleText + ' logo') + '" aria-label="Enlarge project logo"><img src="' + esc(logoUrl) + '" alt="' + esc(titleText) + ' logo" data-letter="' + letter + '"></button></span>'
            : '';

        const eyebrow = String(p.platform || tags[0] || '').trim();
        const projectId = logo || eyebrow ? '<div class="pp-id">' + logo + (eyebrow ? '<div class="pp-eyebrow">' + esc(eyebrow) + '</div>' : '') + '</div>' : '';

        const statusMap = { completed: ['Completed', 'is-done'], 'in-progress': ['In progress', 'is-wip'], published: ['Published', 'is-live'] };
        const st = statusMap[p.status];
        const pills = st ? '<div class="pp-pills"><span class="pp-pill ' + st[1] + '">' + st[0] + '</span></div>' : '';

        const linkDefs = [
            ['github', 'GitHub repo', 'github'],
            ['playstore', 'Google Play', 'store'],
            ['appstore', 'App Store', 'apple'],
            ['apk', 'Download APK', 'download'],
            ['demo', 'Live demo', 'demo']
        ];
        const actions = linkDefs.map(d => ({ url: safeUrl(p[d[0]]), label: d[1], icon: d[2] })).filter(a => a.url)
            .map(a => '<a href="' + esc(a.url) + '" class="btn btn-outline" target="_blank" rel="noopener noreferrer">' + icon(a.icon) + ' ' + a.label + '</a>').join('');

        const word = esc(titleText.split(/\s+/)[0].toUpperCase().slice(0, 12));
        const hero =
            '<header class="pp-hero">' +
            '<div class="pp-bg" aria-hidden="true"><span class="pp-orb pp-orb-a"></span><span class="pp-orb pp-orb-b"></span><span class="pp-dots"></span><span class="pp-mark">' + word + '</span></div>' +
            '<div class="container pp-hero-grid' + (videoInfo(p.video) || safeImg(p.image) ? '' : ' is-text-only') + '\">' +
            '<div class="pp-copy">' +
            '<a class="pp-back" href="' + esc(opts.backHref || '#projects') + '">' + icon('back') + ' Back to projects</a>' +
            projectId +
            (titleText ? '<h1 class="pp-title" id="pp-title" tabindex="-1">' + esc(titleText) + '</h1>' : '') +
            (String(p.slogan || '').trim() ? '<p class="pp-slogan">' + esc(String(p.slogan).trim()) + '</p>' : '') +
            (String(p.subtitle || '').trim() ? '<p class="pp-lead">' + esc(String(p.subtitle).trim()) + '</p>' : '') +
            pills +
            (actions ? '<div class="pp-actions">' + actions + '</div>' : '') +
            '</div>' +
            stageHTML(p, letter, languages.concat(libs)) +
            '</div></header>';

        /* facts strip */
        const tl = timeline(p);
        const facts = [
            ['Role', String(p.role || '').trim(), 'user'],
            ['Platform', String(p.platform || '').trim(), 'phone'],
            ['Started', tl && tl.start, 'calendar'],
            ['Finished', tl && tl.end, 'flag'],
            ['Duration', tl && tl.dur, 'clock']
        ].filter(f => String(f[1] || '').trim());
        const factsHTML = facts.length
            ? '<div class="pp-facts">' + facts.map(f => '<div class="pp-fact"><div class="pp-fact-k">' + icon(f[2]) + esc(f[0]) + '</div><div class="pp-fact-v">' + esc(f[1]) + '</div></div>').join('') + '</div>'
            : '';

        /* sections, in reading order (the jump chips follow the same order) */
        const jump = [];
        const add = (id, label, inner, cls) => {
            if (!inner) return '';
            jump.push([id, label]);
            return section(id, label, inner, cls);
        };

        const subtitle = String(p.subtitle || '').trim();
        const desc = String(p.desc || '').trim();
        const overviewText = String(p.overview || '').trim() || (desc && desc !== subtitle ? desc : '');
        const paras = overviewText ? overviewText.split(/\n{2,}/).map(s => s.trim()).filter(Boolean) : [];
        const feats = toLines(p.features);

        const overview = add('overview', 'Overview', paras.length ? '<div class="pp-prose">' + paras.map(t => '<p>' + esc(t).replace(/\n/g, '<br>') + '</p>').join('') + '</div>' : '');
        const features = add('features', 'Key features', feats.length ? checkList(feats) : '');
        const screens = add('screens', 'Screens', showcaseHTML(p));
        const arch = add('architecture', 'Architecture', archHTML(p));
        const chs = add('challenges', 'Challenges & learnings', challengesHTML(p));
        const run = add('setup', 'Run it locally', setupHTML(p));

        const main = overview + features;
        const side = stackHTML(p, tags) + teamHTML(p);
        const body = (main || side)
            ? '<div class="pp-body' + (main && side ? '' : ' is-single') + '">' +
              (main ? '<div class="pp-main">' + main + '</div>' : '') +
              (side ? '<aside class="pp-side">' + side + '</aside>' : '') + '</div>'
            : '';
        const wide = (screens || arch || chs || run) ? '<div class="pp-wide">' + screens + arch + chs + run + '</div>' : '';

        const jumpHTML = jump.length >= 3
            ? '<nav class="pp-jump" aria-label="On this page">' + jump.map(j => '<button type="button" data-jump="pp-s-' + j[0] + '">' + esc(j[1]) + '</button>').join('') + '</nav>'
            : '';
        const pager = pagerHTML(opts);

        return '<article class="pp"' + style + (titleText ? ' aria-labelledby="pp-title"' : ' aria-label="Project details"') + '>' + hero +
            '<div class="container pp-content">' + factsHTML + jumpHTML + body + wide + '</div>' +
            (pager ? '<section class="pp-bottom-projects" aria-label="Previous and next projects"><div class="container">' +
            '<div class="pp-label">More projects</div>' + pager + '</div></section>' : '') + '</article>';
    };

    api.notFound = function (opts) {
        opts = opts || {};
        return '<article class="pp"><div class="container pp-missing">' +
            '<h1 id="pp-title" tabindex="-1">Project not found</h1>' +
            '<p>This link may be old, or the project was removed.</p>' +
            '<a class="btn btn-primary" href="' + esc(opts.backHref || '#projects') + '">' + icon('back') + ' Back to projects</a>' +
            '</div></article>';
    };

    /* ---------- screenshot viewer ---------- */
    function lightbox(root) {
        if (!root.querySelector('.pp-fig')) return;

        const lb = document.createElement('div');
        lb.className = 'pp-lb';
        lb.hidden = true;
        lb.setAttribute('role', 'dialog');
        lb.setAttribute('aria-modal', 'true');
        lb.setAttribute('aria-label', 'Screenshot viewer');
        lb.innerHTML =
            '<button type="button" class="pp-lb-btn pp-lb-close" aria-label="Close viewer">' + icon('close') + '</button>' +
            '<button type="button" class="pp-lb-btn pp-lb-prev" aria-label="Previous screenshot">' + icon('left') + '</button>' +
            '<button type="button" class="pp-lb-btn pp-lb-next" aria-label="Next screenshot">' + icon('right') + '</button>' +
            '<figure class="pp-lb-fig"><img alt=""><figcaption></figcaption></figure>';
        root.appendChild(lb);

        const img = lb.querySelector('img');
        const cap = lb.querySelector('figcaption');
        const prev = lb.querySelector('.pp-lb-prev');
        const next = lb.querySelector('.pp-lb-next');
        const live = () => Array.from(root.querySelectorAll('.pp-fig'));
        let cur = 0;
        let opener = null;
        let isOpen = false;

        function show(i) {
            const all = live();
            if (!all.length) { close(); return; }
            cur = (i + all.length) % all.length;
            const src = all[cur].querySelector('img');
            img.src = src.currentSrc || src.src;
            img.alt = src.alt;
            cap.textContent = all[cur].dataset.cap || '';
            prev.hidden = next.hidden = all.length < 2;
        }

        function open(fig) {
            opener = fig;
            show(live().indexOf(fig));
            lb.hidden = false;
            isOpen = true;
            document.body.style.overflow = 'hidden';
            lb.querySelector('.pp-lb-close').focus();
        }

        function close() {
            if (!isOpen) return;
            isOpen = false;
            lb.hidden = true;
            document.body.style.overflow = '';
            img.removeAttribute('src');
            if (opener && document.contains(opener)) opener.focus();
        }

        root.querySelectorAll('.pp-fig').forEach(f => f.addEventListener('click', () => open(f)));
        lb.querySelector('.pp-lb-close').addEventListener('click', close);
        prev.addEventListener('click', () => show(cur - 1));
        next.addEventListener('click', () => show(cur + 1));
        lb.addEventListener('click', e => { if (e.target === lb) close(); });
        lb.addEventListener('keydown', e => {
            if (e.key === 'Escape') { e.stopPropagation(); close(); }
            else if (e.key === 'ArrowLeft') show(cur - 1);
            else if (e.key === 'ArrowRight') show(cur + 1);
            else if (e.key === 'Tab') {
                const btns = Array.from(lb.querySelectorAll('button')).filter(b => !b.hidden);
                const first = btns[0];
                const last = btns[btns.length - 1];
                if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
                else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
            }
        });

        window.addEventListener('hashchange', close);
        root._ppCleanup = () => { window.removeEventListener('hashchange', close); close(); };
    }

    /* ---------- behaviour: call once after inserting the html ---------- */
    api.bind = function (root, hooks) {
        hooks = hooks || {};
        if (root._ppCleanup) { root._ppCleanup(); root._ppCleanup = null; }
        root.querySelectorAll('.reveal').forEach(el => el.classList.add('active'));

        root.querySelectorAll('.pp-logo img').forEach(img => img.addEventListener('error', () => {
            const box = img.closest('.pp-logo');
            box.classList.remove('has-img');
            box.replaceChildren(document.createTextNode(img.dataset.letter || ''));
        }));

        root.querySelectorAll('img.pp-shot').forEach(img => img.addEventListener('error', () => img.closest('.pp-fig')?.remove()));

        root.querySelectorAll('img.pp-thumb').forEach(img => {
            const fallback = () => {
                const id = img.dataset.id;
                if (id && img.src.indexOf('maxresdefault') > -1) img.src = 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg';
                else img.remove();
            };
            img.addEventListener('error', fallback);
            img.addEventListener('load', () => { if (img.dataset.id && img.naturalWidth && img.naturalWidth < 200) fallback(); });
        });

        // single wide screenshots reserve a 16:9 box until they load, so the page does not jump
        root.querySelectorAll('.pp-fig img').forEach(img => {
            const ready = () => img.closest('.pp-fig').classList.add('is-ready');
            if (img.complete && img.naturalWidth) ready(); else img.addEventListener('load', ready);
        });

        // a broken screenshot disappears instead of leaving an empty frame
        root.querySelectorAll('.pp-fig img').forEach(img => img.addEventListener('error', () => {
            const fig = img.closest('.pp-fig');
            if (!fig) return;
            const rail = fig.parentElement;
            fig.remove();
            if (rail && !rail.querySelector('.pp-fig')) rail.remove();
        }));
        root.querySelectorAll('.pp-diagram img').forEach(img => img.addEventListener('error', () => img.closest('.pp-diagram')?.remove()));

        // the demo plays inside the phone, on this same page
        root.querySelectorAll('button.pp-facade').forEach(btn => btn.addEventListener('click', () => {
            if (hooks.onPlay && hooks.onPlay(btn) === false) return;
            if (btn.dataset.file) {
                const vid = document.createElement('video');
                vid.className = 'pp-embed pp-video';
                vid.src = btn.dataset.file;
                vid.controls = true;
                vid.autoplay = true;
                vid.playsInline = true;
                vid.preload = 'metadata';
                vid.setAttribute('aria-label', btn.dataset.title || 'Project demo');
                btn.replaceWith(vid);
                const pr = vid.play();
                if (pr && pr.catch) pr.catch(() => {});
                return;
            }
            const frame = document.createElement('iframe');
            frame.className = 'pp-embed';
            frame.src = btn.dataset.embed;
            frame.title = btn.dataset.title || 'Project demo';
            frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
            frame.allowFullscreen = true;
            frame.referrerPolicy = 'strict-origin-when-cross-origin';
            btn.replaceWith(frame);
        }));

        // jump chips scroll inside the page (a "#" link would change the route)
        const calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        root.querySelectorAll('[data-jump]').forEach(b => b.addEventListener('click', () => {
            const t = document.getElementById(b.dataset.jump);
            if (t) t.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
        }));

        root.querySelectorAll('[data-copy]').forEach(btn => btn.addEventListener('click', () => {
            const code = btn.closest('.pp-code').querySelector('code');
            const label = btn.querySelector('.pp-copy-label');
            const text = btn.dataset.raw != null ? btn.dataset.raw : (code ? code.textContent : '');
            const flash = ok => {
                label.textContent = ok ? 'Copied' : 'Select and copy';
                setTimeout(() => { label.textContent = 'Copy'; }, 1800);
            };
            const fallback = () => {
                try {
                    const ta = document.createElement('textarea');
                    ta.value = text;
                    ta.style.position = 'fixed';
                    ta.style.opacity = '0';
                    document.body.appendChild(ta);
                    ta.select();
                    const ok = document.execCommand('copy');
                    ta.remove();
                    return ok;
                } catch (e) { return false; }
            };
            if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => flash(true), () => flash(fallback()));
            else flash(fallback());
        }));

        lightbox(root);
    };

    /* move keyboard focus to the page title (call after opening the page) */
    api.focusTitle = function (root) {
        const h = root.querySelector('#pp-title');
        if (h) h.focus({ preventScroll: true });
    };

    global.ProjectPage = api;
})(window);


export function initProjectPage(data) {
    const mount = document.getElementById('project-page-mount');
    if (!mount) return;
    const originalTitle = document.title;
    let previousScroll = 0;
    let lastRoutedUrl = '';
    let pendingNavigation = '';
    window.history.scrollRestoration = 'manual';

    const setActiveNav = id => {
        document.querySelectorAll('#nav-menu a').forEach(link => {
            const active = link.getAttribute('href') === '#' + id;
            link.classList.toggle('active', active);
            if (active) link.setAttribute('aria-current', id === 'projects' && document.body.classList.contains('pp-project-open') ? 'page' : 'location');
            else link.removeAttribute('aria-current');
        });
    };
    const closeMobileMenu = () => {
        const menu = document.getElementById('nav-menu');
        menu?.classList.remove('active');
        const icon = document.querySelector('#menu-toggle i');
        if (icon) {
            icon.classList.add('ph-list');
            icon.classList.remove('ph-x');
        }
    };
    const route = () => {
        if (window.location.href === lastRoutedUrl) return;
        lastRoutedUrl = window.location.href;
        const match = window.location.hash.match(/^#\/project\/(.*)$/);
        if (match) {
            if (!document.body.classList.contains('pp-project-open')) previousScroll = window.scrollY;
            document.body.classList.add('pp-project-open');
            setActiveNav('projects');
            let id = ''; try { id = decodeURIComponent(match[1]); } catch { id = match[1]; }
            const projects = data.projects || [];
            const index = projects.findIndex((project, i) => String(project.id ?? i) === id);
            const project = index >= 0 ? projects[index] : null;
            if (mount._ppCleanup) { mount._ppCleanup(); mount._ppCleanup = null; }
            if (!project) {
                mount.innerHTML = window.ProjectPage.notFound({ backHref: '#projects' });
                document.title = 'Project not found | Esraa Ehab';
                window.scrollTo(0, 0);
                window.ProjectPage.focusTitle(mount);
                mount.querySelector('a[href="#projects"]')?.addEventListener('click', leaveForProjects);
                return;
            }
            const previous = projects.length > 1 ? projects[(index - 1 + projects.length) % projects.length] : null;
            const next = projects.length > 1 ? projects[(index + 1) % projects.length] : null;
            const routeHref = item => '#/project/' + encodeURIComponent(String(item.id ?? projects.indexOf(item)));
            mount.innerHTML = window.ProjectPage.html({ ...project, desc: project.desc || project.description || '' }, { prev: previous, next, href: routeHref, backHref: '#projects' });
            window.ProjectPage.bind(mount);
            document.title = `${project.title || 'Project'} | Esraa Ehab`;
            const root = document.documentElement;
            const oldBehavior = root.style.scrollBehavior;
            root.style.scrollBehavior = 'auto';
            window.scrollTo(0, 0);
            root.style.scrollBehavior = oldBehavior;
            window.ProjectPage.focusTitle(mount);
            mount.querySelector('.pp-back')?.addEventListener('click', leaveForProjects);
            initThemeToggle();
            pendingNavigation = '';
        } else {
            const wasOpen = document.body.classList.contains('pp-project-open');
            if (mount._ppCleanup) { mount._ppCleanup(); mount._ppCleanup = null; }
            document.body.classList.remove('pp-project-open');
            mount.replaceChildren();
            document.title = originalTitle;
            const targetId = window.location.hash.slice(1);
            if (wasOpen) {
                if (pendingNavigation === 'navbar') {
                    setActiveNav(targetId || 'home');
                    requestAnimationFrame(() => requestAnimationFrame(() => {
                        const section = targetId && document.getElementById(targetId);
                        if (section) section.scrollIntoView({ behavior: 'smooth' });
                    }));
                } else if (pendingNavigation === 'history' || pendingNavigation === 'projects') {
                    setActiveNav(targetId || 'home');
                    requestAnimationFrame(() => window.scrollTo(0, previousScroll));
                } else {
                    setActiveNav(targetId || 'home');
                    requestAnimationFrame(() => {
                        const section = targetId && document.getElementById(targetId);
                        if (section && targetId === 'projects' && previousScroll) window.scrollTo(0, previousScroll);
                        else if (section) section.scrollIntoView({ behavior: 'auto', block: 'start' });
                        else window.scrollTo(0, previousScroll);
                    });
                }
            }
            pendingNavigation = '';
        }
    };
    const navigateHash = (hash, source = 'projects') => {
        pendingNavigation = source;
        window.history.pushState(null, '', hash);
        route();
        window.dispatchEvent(new Event('hashchange'));
    };
    function leaveForProjects(event) {
        event.preventDefault();
        navigateHash('#projects', 'projects');
    }
    document.getElementById('navbar-mount')?.addEventListener('click', event => {
        if (!document.body.classList.contains('pp-project-open')) return;
        const link = event.target.closest('a[href^="#"]');
        if (!link) return;
        event.preventDefault();
        closeMobileMenu();
        navigateHash(link.getAttribute('href'), 'navbar');
    });
    window.addEventListener('hashchange', route);
    window.addEventListener('popstate', () => {
        pendingNavigation = 'history';
        route();
    });
    route();
}
