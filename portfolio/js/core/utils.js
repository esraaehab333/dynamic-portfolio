export function esc(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export function trapFocus(modal) {
    const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];

    modal.onkeydown = (e) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
            if (document.activeElement === firstFocusableElement) {
                lastFocusableElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastFocusableElement) {
                firstFocusableElement.focus();
                e.preventDefault();
            }
        }
    };

    if (firstFocusableElement) firstFocusableElement.focus();
}

export function initModalParticles() {
    const container = document.querySelector('.modal-particles');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < 15; i++) {
        const p = document.createElement('div');
        p.className = 'modal-particle';
        const size = Math.random() * 4 + 2 + 'px';
        p.style.width = size;
        p.style.height = size;
        p.style.left = Math.random() * 100 + '%';
        p.style.setProperty('--duration', Math.random() * 2 + 2 + 's');
        p.style.setProperty('--move-x', (Math.random() - 0.5) * 50 + 'px');
        p.style.animationDelay = Math.random() * 2 + 's';
        container.appendChild(p);
    }
}

export function initConfetti() {
    const container = document.querySelector('.confetti-container');
    if (!container) return;
    container.innerHTML = '';

    const ripple = document.createElement('div');
    ripple.className = 'success-ripple';
    container.appendChild(ripple);

    const colors = ['#10b981', '#3D5AFE', '#B125EA', '#FFD700'];
    for (let i = 0; i < 40; i++) {
        const p = document.createElement('div');
        p.className = 'confetti-piece';
        p.style.background = colors[Math.floor(Math.random() * colors.length)];
        p.style.left = '50%';
        p.style.top = '50%';

        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 150 + 50;
        const x = Math.cos(angle) * velocity;
        const y = Math.sin(angle) * velocity;

        p.animate([
            { transform: 'translate(-50%, -50%) scale(0)', opacity: 1 },
            { transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1)`, opacity: 1, offset: 0.4 },
            { transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y + 100}px)) scale(0.5) rotate(${Math.random() * 360}deg)`, opacity: 0 }
        ], {
            duration: Math.random() * 1000 + 1000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            fill: 'forwards'
        });

        container.appendChild(p);
    }
}
