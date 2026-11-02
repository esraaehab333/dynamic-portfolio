import { setupMagnetic } from './magnetic.js';
import { addStagger } from './reveal.js';

export function initVisualEffects() {
    const motionDisabled = window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
        window.matchMedia('(hover: none)').matches;
    const mouseGlow = document.getElementById('mouse-glow');
    let cursorFollower;
    let cursorGlow;

    if (!motionDisabled) {
        cursorFollower = document.createElement('div');
        cursorFollower.className = 'cursor-follower';
        cursorGlow = document.createElement('div');
        cursorGlow.className = 'cursor-glow';
        document.body.append(cursorFollower, cursorGlow);

        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'bg-particles';
        document.body.appendChild(particlesContainer);
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            const size = `${Math.random() * 4 + 2}px`;
            particle.style.width = size;
            particle.style.height = size;
            particle.style.setProperty('--duration', `${Math.random() * 10 + 20}s`);
            particle.style.setProperty('--move-x', `${(Math.random() - 0.5) * 300}px`);
            particlesContainer.appendChild(particle);
        }
    }

    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;
    let glowX = 0, glowY = 0;
    let raf = 0, lastEvt = null, tickRaf = 0;

    document.documentElement.classList.toggle('paused', document.hidden);

    const startTick = () => {
        if (!tickRaf && !document.hidden) tickRaf = requestAnimationFrame(tick);
    };

    const tick = () => {
        tickRaf = 0;
        followerX += (mouseX - followerX) * 0.15;
        followerY += (mouseY - followerY) * 0.15;
        glowX += (mouseX - glowX) * 0.08;
        glowY += (mouseY - glowY) * 0.08;

        if (Math.abs(mouseX - followerX) < 0.1 && Math.abs(mouseY - followerY) < 0.1) {
            followerX = mouseX;
            followerY = mouseY;
        }
        if (Math.abs(mouseX - glowX) < 0.1 && Math.abs(mouseY - glowY) < 0.1) {
            glowX = mouseX;
            glowY = mouseY;
        }

        cursorFollower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate(-50%, -50%)`;
        cursorGlow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0) translate(-50%, -50%)`;
        if (mouseGlow) mouseGlow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0) translate(-50%, -50%)`;

        const followerSettled = followerX === mouseX && followerY === mouseY;
        const glowSettled = glowX === mouseX && glowY === mouseY;
        if (!followerSettled || !glowSettled) startTick();
        else if (mouseGlow) mouseGlow.style.opacity = '0.4';
    };

    if (!motionDisabled) {
        document.addEventListener('mousemove', event => {
            lastEvt = event;
            if (raf) return;
            raf = requestAnimationFrame(() => {
                raf = 0;
                mouseX = lastEvt.clientX;
                mouseY = lastEvt.clientY;
                const el = lastEvt.target.closest('.project-card, .skill-category, .glass-card, .btn, .social-item, .method-icon, .nav-links a, .cert-card');
                if (el) {
                    const rect = el.getBoundingClientRect();
                    el.style.setProperty('--mouse-x', `${lastEvt.clientX - rect.left}px`);
                    el.style.setProperty('--mouse-y', `${lastEvt.clientY - rect.top}px`);
                }
                if (mouseGlow) mouseGlow.style.opacity = '1';
                startTick();
            });
        }, { passive: true });
    }

    document.addEventListener('visibilitychange', () => {
        document.documentElement.classList.toggle('paused', document.hidden);
        if (document.hidden) {
            if (raf) cancelAnimationFrame(raf);
            if (tickRaf) cancelAnimationFrame(tickRaf);
            raf = 0;
            tickRaf = 0;
        }
    });

    setupMagnetic();

    document.addEventListener('click', event => {
        const ripple = document.createElement('div');
        ripple.className = 'ripple-effect';
        ripple.style.left = `${event.clientX}px`;
        ripple.style.top = `${event.clientY}px`;
        document.body.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    });

    addStagger();
}
