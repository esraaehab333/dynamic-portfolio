export const id = 'about';

export function render(data) {
    const mount = document.getElementById('about-mount');
    if (!mount) return;

    const about = data.about || {};

    mount.innerHTML = `
    <section id="about" class="section-padding about-section">
        <div class="container about-container">
            <div class="section-label">About Me</div>
            <h2 data-key="about.title">${about.title || 'Transforming Ideas Into Seamless Apps'}</h2>
            <p data-key="about.bio">
                ${about.bio || 'I am a dedicated Mobile App Developer specializing in high-performance Android and iOS applications.'}
            </p>
        </div>
    </section>
    `;
}
