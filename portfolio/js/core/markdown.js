import { esc, safeUrl } from './utils.js';

function unescapeHtml(str) {
    return String(str || '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'");
}

export function inlineMd(text) {
    if (text == null) return '';
    let s = esc(String(text));

    const codeBlocks = [];
    s = s.replace(/`([^`\n]+)`/g, (_, code) => {
        const idx = codeBlocks.length;
        codeBlocks.push(`<code class="pp-ic">${code}</code>`);
        return `\x1aCODE_${idx}\x1a`;
    });

    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => {
        const safe = safeUrl(unescapeHtml(url));
        if (safe) {
            return `<a href="${safe}" target="_blank" rel="noopener noreferrer">${label}</a>`;
        }
        return label;
    });

    s = s.replace(/\x1aCODE_(\d+)\x1a/g, (_, idx) => codeBlocks[Number(idx)]);

    return s;
}

export function blocksMd(text) {
    if (text == null) return [];
    const raw = String(text);
    if (!raw.trim()) return [];

    const lines = raw.split(/\r?\n/);
    const parts = [];

    let inCode = false;
    let codeLang = '';
    let codeLines = [];

    let currentHtmlElements = [];

    const flushHtmlParts = () => {
        if (currentHtmlElements.length > 0) {
            parts.push({ type: 'html', html: currentHtmlElements.join('') });
            currentHtmlElements = [];
        }
    };

    let blockType = null;
    let blockLines = [];

    const flushBlock = () => {
        if (blockType === 'paragraph') {
            if (blockLines.length > 0) {
                currentHtmlElements.push('<p>' + inlineMd(blockLines.join('\n')) + '</p>');
            }
        } else if (blockType === 'list') {
            if (blockLines.length > 0) {
                const itemsHtml = blockLines.map(item => '<li>' + inlineMd(item) + '</li>').join('');
                currentHtmlElements.push('<ul>' + itemsHtml + '</ul>');
            }
        }
        blockType = null;
        blockLines = [];
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (inCode) {
            if (/^\s*```/.test(line)) {
                parts.push({
                    type: 'code',
                    lang: codeLang,
                    code: codeLines.join('\n')
                });
                inCode = false;
                codeLang = '';
                codeLines = [];
            } else {
                codeLines.push(line);
            }
        } else {
            const fenceMatch = /^\s*```(.*)$/.exec(line);
            if (fenceMatch) {
                flushBlock();
                flushHtmlParts();
                inCode = true;
                codeLang = fenceMatch[1].trim();
                codeLines = [];
            } else {
                const trimmed = line.trim();
                if (!trimmed) {
                    flushBlock();
                } else {
                    const headingMatch = /^(?:#|##|###)\s+(.*)$/.exec(trimmed);
                    const listMatch = /^(?:-|\*)\s+(.*)$/.exec(trimmed);

                    if (headingMatch) {
                        flushBlock();
                        currentHtmlElements.push('<h4 class="pp-md-h">' + inlineMd(headingMatch[1]) + '</h4>');
                    } else if (listMatch) {
                        if (blockType !== 'list') {
                            flushBlock();
                            blockType = 'list';
                        }
                        blockLines.push(listMatch[1]);
                    } else {
                        if (blockType !== 'paragraph') {
                            flushBlock();
                            blockType = 'paragraph';
                        }
                        blockLines.push(trimmed);
                    }
                }
            }
        }
    }

    if (inCode) {
        parts.push({
            type: 'code',
            lang: codeLang,
            code: codeLines.join('\n')
        });
    } else {
        flushBlock();
        flushHtmlParts();
    }

    return parts;
}
