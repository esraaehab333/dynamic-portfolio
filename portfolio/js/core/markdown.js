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

    s = s.replace(/\[([^\]]+)\]\(((?:[^\s()]+|\([^\s()]*\))*)\)/g, (_, label, url) => {
        const safe = safeUrl(unescapeHtml(url));
        if (safe) {
            return `<a href="${safe}" target="_blank" rel="noopener noreferrer">${label}</a>`;
        }
        return label;
    });

    s = s.replace(/\x1aCODE_(\d+)\x1a/g, (_, idx) => codeBlocks[Number(idx)]);

    return s;
}

export function mdToHtml(text) {
    if (text == null) return '';
    const raw = String(text).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    if (!raw.trim()) return '';

    const lines = raw.split('\n');
    const htmlElements = [];

    let inCode = false;
    let codeLang = '';
    let indentStr = '';
    let codeLines = [];

    let blockType = null;
    let blockLines = [];
    let olStartNum = 1;

    const flushBlock = () => {
        if (!blockType) return;
        if (blockType === 'p') {
            if (blockLines.length > 0) {
                const content = inlineMd(blockLines.join('\n')).replace(/\n/g, '<br>');
                htmlElements.push('<p>' + content + '</p>');
            }
        } else if (blockType === 'ul') {
            if (blockLines.length > 0) {
                const items = blockLines.map(item => '<li>' + inlineMd(item) + '</li>').join('');
                htmlElements.push('<ul>' + items + '</ul>');
            }
        } else if (blockType === 'ol') {
            if (blockLines.length > 0) {
                const items = blockLines.map(item => '<li>' + inlineMd(item) + '</li>').join('');
                const startAttr = ` start="${olStartNum}"`;
                htmlElements.push(`<ol${startAttr}>` + items + '</ol>');
            }
        }
        blockType = null;
        blockLines = [];
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (inCode) {
            if (/^\s*```\s*$/.test(line)) {
                const codeContent = codeLines.map(l => esc(l)).join('\n');
                htmlElements.push(`<pre class="pp-md-pre"><code>${codeContent}</code></pre>`);
                inCode = false;
                codeLang = '';
                indentStr = '';
                codeLines = [];
            } else {
                let processed = line;
                if (indentStr && processed.startsWith(indentStr)) {
                    processed = processed.slice(indentStr.length);
                } else if (indentStr) {
                    const match = processed.match(/^(\s*)/);
                    const leadingSpaces = match ? match[1] : '';
                    if (leadingSpaces.length <= indentStr.length) {
                        processed = processed.slice(leadingSpaces.length);
                    } else {
                        processed = processed.slice(indentStr.length);
                    }
                }
                codeLines.push(processed);
            }
        } else {
            const fenceMatch = /^(\s*)```(\w*)\s*$/.exec(line);
            if (fenceMatch) {
                flushBlock();
                inCode = true;
                indentStr = fenceMatch[1];
                codeLang = fenceMatch[2].trim();
                codeLines = [];
            } else {
                const trimmed = line.trim();
                if (!trimmed) {
                    flushBlock();
                } else {
                    const headingMatch = /^(#{1,4})\s+(.*)$/.exec(trimmed);
                    const bulletMatch = /^(?:-|\*)\s+(.*)$/.exec(trimmed);
                    const numberMatch = /^(\d+)\.\s+(.*)$/.exec(trimmed);

                    if (headingMatch) {
                        flushBlock();
                        const level = headingMatch[1].length;
                        const tag = level <= 2 ? 'h3' : 'h4';
                        const content = inlineMd(headingMatch[2]);
                        htmlElements.push(`<${tag} class="pp-md-h">${content}</${tag}>`);
                    } else if (bulletMatch) {
                        if (blockType !== 'ul') {
                            flushBlock();
                            blockType = 'ul';
                        }
                        blockLines.push(bulletMatch[1]);
                    } else if (numberMatch) {
                        if (blockType !== 'ol') {
                            flushBlock();
                            blockType = 'ol';
                            olStartNum = parseInt(numberMatch[1], 10) || 1;
                        }
                        blockLines.push(numberMatch[2]);
                    } else {
                        if (blockType !== 'p') {
                            flushBlock();
                            blockType = 'p';
                        }
                        blockLines.push(trimmed);
                    }
                }
            }
        }
    }

    if (inCode) {
        const codeContent = codeLines.map(l => esc(l)).join('\n');
        htmlElements.push(`<pre class="pp-md-pre"><code>${codeContent}</code></pre>`);
    } else {
        flushBlock();
    }

    return htmlElements.join('');
}

export function looksLikeMd(text) {
    if (!text) return false;
    const str = String(text);
    if (str.includes('```')) return true;
    const lines = str.split(/\r?\n/);
    return lines.some(line => {
        const trimmed = line.trim();
        return /^#{1,4}\s/.test(trimmed) ||
               /^(?:-|\*)\s/.test(trimmed) ||
               /^\d+\.\s/.test(trimmed);
    });
}

export const parseMd = mdToHtml;
export const blocksMd = mdToHtml;
