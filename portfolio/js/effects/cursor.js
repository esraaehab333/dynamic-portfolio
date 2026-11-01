import { setupMagnetic } from './magnetic.js';
import { setupScrollEffect, addStagger } from './reveal.js';

export function initVisualEffects() {
    const mouseGlow = document.getElementById('mouse-glow');
    const cursorFollower = document.createElement('div');
    cursorFollower.className = 'cursor-follower';
    const cursorGlow = document.createElement('div');
    cursorGlow.className = 'cursor-glow';
    document.body.appendChild(cursorFollower);
    document.body.appendChild(cursorGlow);

    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;
    let glowX = 0, glowY = 0;
    let isMoving = false;
    let moveTimeout;

    // Background Particles
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'bg-particles';
    document.body.appendChild(particlesContainer);
    for (let i = 0; i < 20; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.top = Math.random() * 100 + '%';
        const size = Math.random() * 4 + 2 + 'px';
        p.style.width = size;
        p.style.height = size;
        p.style.setProperty('--duration', Math.random() * 10 + 20 + 's');
        p.style.setProperty('--move-x', (Math.random() - 0.5) * 300 + 'px');
        particlesContainer.appendChild(p);
    }

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        isMoving = true;
        clearTimeout(moveTimeout);
        moveTimeout = setTimeout(() => isMoving = false, 100);

        if (mouseGlow) {
            mouseGlow.style.opacity = '1';
            mouseGlow.style.left = e.clientX + 'px';
            mouseGlow.style.top = e.clientY + 'px';
        }

        document.querySelectorAll('.project-card, .skill-category, .glass-card, .btn, .social-item, .method-icon, .nav-links a, .cert-card').forEach(el => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            el.style.setProperty('--mouse-x', `${x}px`);
            el.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    const tick = () => {
        followerX += (mouseX - followerX) * 0.15;
        followerY += (mouseY - followerY) * 0.15;
        glowX += (mouseX - glowX) * 0.08;
        glowY += (mouseY - glowY) * 0.08;

        cursorFollower.style.left = followerX + 'px';
        cursorFollower.style.top = followerY + 'px';
        cursorGlow.style.left = glowX + 'px';
        cursorGlow.style.top = glowY + 'px';

        if (!isMoving && mouseGlow) {
            mouseGlow.style.opacity = '0.4';
        }

        requestAnimationFrame(tick);
    };
    tick();

    setupMagnetic();

    const observer = new MutationObserver(() => setupMagnetic());
    observer.observe(document.body, { childList: true, subtree: true });

    document.addEventListener('click', (e) => {
        const ripple = document.createElement('div');
        ripple.className = 'ripple-effect';
        ripple.style.left = e.clientX + 'px';
        ripple.style.top = e.clientY + 'px';
        document.body.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    });

    addStagger();
    const staggerObserver = new MutationObserver(addStagger);
    staggerObserver.observe(document.body, { childList: true, subtree: true });
}
