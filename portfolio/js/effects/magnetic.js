export function setupMagnetic() {
    // Interactive elements (Buttons, Links)
    document.querySelectorAll('.btn, .social-item, .nav-links a, .logo, .tech-icon-float, .method-icon').forEach(el => {
        if (el.dataset.interactInit) return;
        el.dataset.interactInit = 'true';

        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const isButton = el.matches('.btn');
            const strength = isButton ? 0.06 : 0.35;
            const moveX = (e.clientX - centerX) * strength;
            const moveY = (e.clientY - centerY) * strength;
            el.style.transform = isButton
                ? `translate(${moveX}px, ${moveY}px)`
                : `translate(${moveX}px, ${moveY}px) scale(1.05)`;
            document.body.classList.add('cursor-active');
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = '';
            document.body.classList.remove('cursor-active');
        });
    });

    // Text elements (for text cursor)
    document.querySelectorAll('p, h1, h2, h3, .section-label, span').forEach(el => {
        if (el.dataset.cursorInit) return;
        el.dataset.cursorInit = 'true';
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-text'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-text'));
    });

    // View elements (Images, Cards)
    document.querySelectorAll('.project-card, .cert-card, .hero-image-box img').forEach(el => {
        if (el.dataset.viewInit) return;
        el.dataset.viewInit = 'true';
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-view'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-view'));
    });
}
