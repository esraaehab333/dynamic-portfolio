export const DEFAULT_DATA = {
    site: { logo: "ESRAA EHAB", tagline: "", accent: "#0055FF", theme: "light" },
    hero: {
        name: "Hi, I'm Esraa",
        eyebrowSize: "0.65",
        title: "I build fast, clean <span class=\"grad\">Android &amp; Kotlin Multiplatform</span> apps",
        titleSize: "compact",
        description: "Native Android, Kotlin Multiplatform and Clean Architecture, building scalable apps that feel fast.",
        descriptionSize: "compact",
        proof: "2+ yrs · 8 apps · Kotlin · Compose · KMP",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
        cv_url: "#"
    },
    about: { bio: "I am a dedicated Mobile App Developer with a passion for creating clean, efficient, and user-friendly applications." },
    contact: { title: "Let's Create Something Amazing Together", subtitle: "Currently open for new projects and opportunities.", availability: "Open to new opportunities", response: "I usually reply within 24 hours · Cairo, GMT+2" },
    socials: [], partners: [], projects: [],
    services: [
        {
            title: "Native Android Development",
            subtitle: "Building high-performance, native Android apps using Kotlin, Jetpack Compose, and modern architecture.",
            icon: "ph-android-logo",
            image: ""
        },
        {
            title: "Mobile UI/UX Design",
            subtitle: "Crafting intuitive, responsive, and visually appealing mobile interfaces tailored for seamless user experiences.",
            icon: "ph-layout",
            image: ""
        },
        {
            title: "API & Backend Integration",
            subtitle: "Integrating RESTful APIs, Cloudflare Workers, real-time data services, and offline storage efficiently.",
            icon: "ph-lightning",
            image: ""
        }
    ],
    skills: [
        { name: "Kotlin", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg" },
        { name: "Android Studio", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/androidstudio/androidstudio-original.svg" },
        { name: "Jetpack Compose", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jetpackcompose/jetpackcompose-original.svg" },
        { name: "Java", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" },
        { name: "Git", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" },
        { name: "Firebase", image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg" }
    ], testimonials: [], contacts: [],
    sectionsVisibility: {
        hero: true,
        about: true,
        projects: true,
        experience: true,
        skills: true,
        services: true,
        education: true,
        certifications: true,
        contact: true
    },
    sectionsOrder: ['hero', 'about', 'projects', 'experience', 'skills', 'services', 'education', 'certifications', 'contact']
};
