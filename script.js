// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all elements with fade-in class
document.addEventListener('DOMContentLoaded', () => {
    const elementsToAnimate = document.querySelectorAll('.service-card, .service-item, .brand-item, .about-text p, .contact-person');
    elementsToAnimate.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
});

// Parallax effect for hero section
let lastScroll = 0;
const hero = document.querySelector('.hero');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (hero && currentScroll < window.innerHeight) {
        const parallaxValue = currentScroll * 0.5;
        hero.style.transform = `translateY(${parallaxValue}px)`;
    }
    
    lastScroll = currentScroll;
});

// Header scroll effect
const header = document.querySelector('.header');
let lastScrollTop = 0;

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 100) {
        header.style.backgroundColor = 'rgba(217, 229, 214, 0.98)';
        header.style.boxShadow = '0 2px 10px rgba(34, 34, 59, 0.1)';
    } else {
        header.style.backgroundColor = 'rgba(217, 229, 214, 0.95)';
        header.style.boxShadow = 'none';
    }
    
    lastScrollTop = scrollTop;
});

// Text reveal animation on scroll
const textRevealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const text = entry.target;
            const words = text.textContent.split(' ');
            text.innerHTML = words.map((word, i) => 
                `<span style="animation-delay: ${i * 0.1}s">${word}</span>`
            ).join(' ');
            textRevealObserver.unobserve(text);
        }
    });
}, { threshold: 0.5 });

// Apply to hero main text
document.addEventListener('DOMContentLoaded', () => {
    const heroTexts = document.querySelectorAll('.hero-main-text p');
    heroTexts.forEach(text => {
        textRevealObserver.observe(text);
    });
});

// Mobile menu toggle (if needed in future)
const navLinks = document.querySelector('.nav-links');
if (window.innerWidth <= 768) {
    // Add mobile menu functionality if needed
}

// Hover effects are handled by CSS

// WhatsApp button pulse animation
const whatsappBtn = document.querySelector('.whatsapp-float');
if (whatsappBtn) {
    setInterval(() => {
        whatsappBtn.style.animation = 'pulse 2s ease-in-out';
    }, 3000);
}

// Add pulse keyframe animation via style tag
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
    }
`;
document.head.appendChild(style);

