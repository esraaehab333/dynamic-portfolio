export function setupMagnetic() {
    let currentState = '';
    document.addEventListener('mouseover', event => {
        const target = event.target;
        const state = target.closest('.project-card, .cert-card, .hero-image-box img')
            ? 'cursor-view'
            : target.closest('.btn, .social-item, .nav-links a, .logo, .tech-icon-float, .method-icon')
                ? 'cursor-active'
                : target.closest('p, h1, h2, h3, .section-label')
                    ? 'cursor-text'
                    : '';
        if (state === currentState) return;
        if (currentState) document.body.classList.remove(currentState);
        if (state) document.body.classList.add(state);
        currentState = state;
    }, { passive: true });
}
