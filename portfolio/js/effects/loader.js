export function startCinematicReveal(overlay, callback) {
    overlay.classList.add('reveal-active');
    document.body.classList.remove('is-loading');
    document.body.classList.add('reveal-init');

    setTimeout(() => {
        overlay.classList.add('fade-out');
        document.body.classList.add('reveal-complete');

        setTimeout(() => {
            overlay.style.display = 'none';
            callback();
        }, 1500);
    }, 800);
}

export function runPremiumLoader() {
    const overlay = document.getElementById('app-loading-overlay');
    const progressFill = document.getElementById('loader-progress-fill');
    const percentageText = document.getElementById('loader-percentage');
    const techText = document.getElementById('loader-tech-text');
    const particlesContainer = document.getElementById('loader-particles');

    if (!overlay) return Promise.resolve();

    if (particlesContainer) {
        for (let i = 0; i < 8; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.left = Math.random() * 100 + '%';
            p.style.top = '-5%';
            p.style.opacity = '0.15';
            p.style.background = 'var(--primary)';
            const size = Math.random() * 2 + 1 + 'px';
            p.style.width = size;
            p.style.height = size;
            p.style.setProperty('--duration', Math.random() * 10 + 15 + 's');
            p.style.setProperty('--move-x', (Math.random() - 0.5) * 100 + 'px');
            particlesContainer.appendChild(p);
        }
    }

    const techStack = [
        "Android",
        "Kotlin",
        "Jetpack Compose",
        "Kotlin Multiplatform",
        "Clean Architecture",
        "CI/CD",
        "Open Source"
    ];

    let progress = 0;
    let techIndex = 0;

    const updateTech = () => {
        if (techText) {
            techText.style.animation = 'techSlideOut 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards';
            setTimeout(() => {
                techIndex = (techIndex + 1) % techStack.length;
                techText.textContent = techStack[techIndex];
                techText.style.animation = 'techSlideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards';
            }, 500);
        }
    };

    const techInterval = setInterval(updateTech, 1500);

    return new Promise(resolve => {
        const interval = setInterval(() => {
            progress += Math.random() * 12;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                clearInterval(techInterval);

                setTimeout(() => {
                    startCinematicReveal(overlay, resolve);
                }, 500);
            }

            if (progressFill) progressFill.style.width = progress + '%';
            if (percentageText) percentageText.textContent = Math.floor(progress) + '%';
        }, 200);
    });
}
