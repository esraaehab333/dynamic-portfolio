import { loadData } from './core/api.js';
import { applyTheme, updateFavicon, initThemeToggle } from './core/theme.js';
import { sections } from './sections/index.js';
import { runPremiumLoader } from './effects/loader.js';
import { initVisualEffects } from './effects/cursor.js';
import { setupNavbarScroll, setupNavbarActiveState, setupScrollEffect } from './effects/reveal.js';
import { initProjectPage } from './project-page.js';
import { renderHeroSocials } from './sections/hero.js';
import { renderContacts } from './sections/contact.js';
import { renderFooter } from './sections/footer.js';

async function bootstrap() {
    const failsafeTimer = setTimeout(() => {
        document.body.classList.remove('is-loading');
        const overlay = document.getElementById('app-loading-overlay');
        if (overlay) overlay.style.display = 'none';
    }, 8000);

    try {
        // 1. Data load
        const data = await loadData();

        // 2. Theme setup
        applyTheme(data);
        updateFavicon(data);

        // 3. Render section modules
        sections.forEach(section => {
            if (section.render) section.render(data);
            if (section.init) section.init({ data });
        });
        applySectionOrder(data);
        renderContacts(data);
        renderHeroSocials(data);
        renderFooter(data);
        initProjectPage(data);

        // Initial setup for reveal
        document.body.classList.add('is-loading');

        // 4. Loader sequence
        if (/^#\/project\//.test(window.location.hash)) {
            document.body.classList.remove('is-loading');
        } else {
            await runPremiumLoader();
        }

        // 5. Interactions & effects
        initThemeToggle();
        setupNavbarScroll();
        setupNavbarActiveState();
        setupScrollEffect();
        initVisualEffects();
    } catch (err) {
        console.error('Portfolio bootstrap error:', err);
        showFriendlyError();
    } finally {
        clearTimeout(failsafeTimer);
        document.body.classList.remove('is-loading');
        const overlay = document.getElementById('app-loading-overlay');
        if (overlay) overlay.style.display = 'none';
    }
}

function showFriendlyError() {
    const mainContainer = document.querySelector('main') || document.body;
    let errBanner = document.getElementById('site-error-banner');
    if (!errBanner) {
        errBanner = document.createElement('div');
        errBanner.id = 'site-error-banner';
        errBanner.style.cssText = 'text-align: center; padding: 4rem 2rem; max-width: 500px; margin: 4rem auto; font-family: inherit;';
        errBanner.innerHTML = `
            <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem; color: var(--text-main, #fff);">Unable to load portfolio content</h3>
            <p style="color: var(--text-muted, #888); margin-bottom: 1.5rem;">Please check your connection and try again.</p>
            <button type="button" class="btn btn-primary" onclick="window.location.reload()" style="padding: 0.75rem 1.5rem; border-radius: 12px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; margin: 0 auto;">Retry</button>
        `;
        mainContainer.appendChild(errBanner);
    }
}

function applySectionOrder(data) {
    const defaultOrder = ['hero', 'about', 'projects', 'experience', 'skills', 'services', 'education', 'certifications', 'contact'];
    const order = (data.sectionsOrder && data.sectionsOrder.length) ? data.sectionsOrder : defaultOrder;
    const mainContainer = document.querySelector('main');
    if (!mainContainer) return;
    order.forEach(id => {
        const mount = document.getElementById(`${id}-mount`);
        if (mount) {
            mainContainer.appendChild(mount);
        }
    });
}

bootstrap();
