import { loadData } from './core/api.js';
import { applyTheme, updateFavicon, initThemeToggle } from './core/theme.js';
import { sections } from './sections/index.js';
import { runPremiumLoader } from './effects/loader.js';
import { initVisualEffects } from './effects/cursor.js';
import { setupNavbarScroll, setupNavbarActiveState, setupScrollEffect } from './effects/reveal.js';
import { initProjectPage } from './project-page.js';

async function bootstrap() {
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
}

bootstrap();
