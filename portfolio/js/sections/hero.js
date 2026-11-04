import { contactHref, contactKind, escapeHtml } from '../core/contact-links.js';

export const id = 'hero';

const DEFAULT_GRADIENT_TEXT = 'Android & Kotlin Multiplatform';
const DEFAULT_TITLE_SUFFIX = 'apps';

function titleParts(value) {
    const raw = String(value || '').trim();
    const spanMatch = /<span\b[^>]*>([\s\S]*?)<\/span>/i.exec(raw);
    const textOnly = value => new DOMParser().parseFromString(value, 'text/html').body.textContent.trim();

    if (!raw) return { leading: 'I build fast, clean', highlighted: DEFAULT_GRADIENT_TEXT, trailing: DEFAULT_TITLE_SUFFIX };
    if (!spanMatch) return { leading: textOnly(raw), highlighted: DEFAULT_GRADIENT_TEXT, trailing: DEFAULT_TITLE_SUFFIX };

    const spanEnd = spanMatch.index + spanMatch[0].length;
    return {
        leading: textOnly(raw.slice(0, spanMatch.index)),
        highlighted: textOnly(spanMatch[1]) || DEFAULT_GRADIENT_TEXT,
        trailing: textOnly(raw.slice(spanEnd))
    };
}

export function render(data) {
    const mount = document.getElementById('hero-mount');
    if (!mount) return;

    const hero = data.hero || {};
    const isVisible = data.sectionsVisibility?.hero !== false;
    const eyebrow = hero.name ?? "Hi, I'm Esraa";
    const textPresets = {
        compact: {
            eyebrow: '0.65rem',
            title: 'clamp(1.7rem, 3.4vw, 2.8rem)',
            description: 'clamp(.9rem, 1.3vw, 1rem)'
        },
        balanced: {
            eyebrow: '0.7rem',
            title: 'clamp(1.9rem, 3.8vw, 3rem)',
            description: 'clamp(.95rem, 1.5vw, 1.05rem)'
        },
        large: {
            eyebrow: '0.75rem',
            title: 'clamp(2.2rem, 4.6vw, 3.6rem)',
            description: 'clamp(1rem, 1.8vw, 1.15rem)'
        }
    };
    const sharedPreset = textPresets[hero.textSize] || textPresets.compact;
    const eyebrowSizes = { '0.55': '0.55rem', '0.6': '0.6rem', '0.65': '0.65rem', '0.7': '0.7rem' };
    const eyebrowSize = eyebrowSizes[String(hero.eyebrowSize)] || sharedPreset.eyebrow;
    const titleSize = textPresets[hero.titleSize]?.title || sharedPreset.title;
    const descriptionSize = textPresets[hero.descriptionSize]?.description || sharedPreset.description;
    const defaultDescription = 'Native Android, Kotlin Multiplatform and Clean Architecture, building scalable apps that feel fast.';
    const description = hero.description ?? defaultDescription;
    const headline = titleParts(hero.title);

    mount.innerHTML = `
    <section id="home" class="hero" style="${isVisible ? '' : 'display: none;'}">
        <div class="container hero-grid">
            <div class="hero-text">
                <div class="eyebrow" data-key="hero.name">${escapeHtml(eyebrow)}</div>
                <h1 class="hero-title" id="hero-title-main" data-key="hero.title"><span class="hero-title-leading"></span> <span class="grad"></span> <span class="hero-title-trailing"></span></h1>
                <p class="hero-desc" data-key="hero.description">${escapeHtml(description)}</p>

                <div class="hero-btns">
                    <a href="#" class="btn btn-primary" id="download-cv-btn">Download CV <i class="ph ph-download-simple"></i></a>
                    <a href="#projects" class="btn btn-outline">View Projects <i class="ph ph-arrow-down"></i></a>
                </div>

                <p class="hero-proof" data-key="hero.proof"></p>
                <div class="hero-socials" id="hero-socials"></div>
            </div>

            <div class="hero-image-box">
                <div class="mobile-tech-bg"></div>
                <div class="tech-icon-float" style="top: 10%; left: 0;"><i class="ph ph-android-logo"></i></div>
                <div class="tech-icon-float" style="top: 20%; right: -10px;"><i class="ph ph-apple-logo"></i></div>
                <div class="tech-icon-float" style="bottom: 15%; left: -20px;"><i class="ph ph-code"></i></div>
                <div class="tech-icon-float" style="bottom: 5%; right: 20%;"><i class="ph ph-device-mobile"></i></div>

                <img src="${hero.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80'}" alt="Profile" id="hero-image">

                <div class="availability-badge">
                    <div class="dot"></div>
                    Available for new projects
                </div>
            </div>
        </div>
    </section>
    `;
    mount.querySelector('.eyebrow').style.fontSize = eyebrowSize;
    mount.querySelector('.hero-title').style.fontSize = titleSize;
    mount.querySelector('.hero-desc').style.fontSize = descriptionSize;
    mount.querySelector('.hero-title-leading').textContent = headline.leading;
    mount.querySelector('.hero-title .grad').textContent = headline.highlighted;
    mount.querySelector('.hero-title-trailing').textContent = headline.trailing;

    const proofEl = mount.querySelector('.hero-proof');
    const proofText = String(hero.proof ?? '').trim();
    if (proofEl) {
        proofEl.textContent = proofText;
        proofEl.hidden = !proofText;
        proofEl.style.display = proofText ? '' : 'none';
    }

    const cvBtn = mount.querySelector('#download-cv-btn');
    if (cvBtn) {
        const cvUrl = String(hero.cv_url || '').trim();
        if (!cvUrl || cvUrl === '#') {
            cvBtn.style.display = 'none';
        } else {
            cvBtn.style.display = '';
            cvBtn.setAttribute('href', cvUrl);
            if (/^https?:\/\//i.test(cvUrl)) {
                cvBtn.setAttribute('target', '_blank');
                cvBtn.setAttribute('rel', 'noopener noreferrer');
                cvBtn.removeAttribute('download');
            } else {
                cvBtn.removeAttribute('target');
                cvBtn.removeAttribute('rel');
                const fileName = cvUrl.split('/').pop() || 'CV.pdf';
                cvBtn.setAttribute('download', fileName);
            }
        }
    }
}

export function renderHeroSocials(data) {
    const mount = document.getElementById('hero-socials');
    if (!mount) return;
    const icons = { github: 'ph-github-logo', linkedin: 'ph-linkedin-logo', email: 'ph-envelope-simple' };
    const selected = (data.contacts || []).filter(contact => ['github', 'linkedin', 'email'].includes(contactKind(contact)));
    mount.innerHTML = selected.map(contact => {
        const href = contactHref(contact, data);
        if (!href) return '';
        const label = escapeHtml(contact.label || contactKind(contact));
        const external = /^https?:/i.test(href);
        return `<a href="${escapeHtml(href)}" aria-label="${label}" title="${label}" ${external ? 'target="_blank" rel="noopener noreferrer"' : ''}><i class="ph ${icons[contactKind(contact)]}" aria-hidden="true"></i></a>`;
    }).join('');
    mount.hidden = !mount.children.length;
}
