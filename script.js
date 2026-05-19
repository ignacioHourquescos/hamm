// Mobile Navigation Toggle
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
});

// Close mobile menu when clicking on a link
const navLinks = document.querySelectorAll('.nav-menu a');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = '#ffffff';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = '#ffffff';
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
    }
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe service cards and other elements
document.querySelectorAll('.service-card, .servicio-item, .marca-card, .contact-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Active navigation link highlighting
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-menu a[href="#${sectionId}"]`);

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => link.classList.remove('active'));
            if (navLink) {
                navLink.classList.add('active');
            }
        }
    });
});

// Add active class styles via JavaScript (or add to CSS)
const style = document.createElement('style');
style.textContent = `
    .nav-menu a.active {
        color: var(--accent-color);
    }
    .nav-menu a.active::after {
        width: 100%;
    }
`;
document.head.appendChild(style);

// Service card "+ MÁS" toggle
document.querySelectorAll('.service-more-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const details = btn.previousElementSibling; // .service-card-details
        const isOpen = details.classList.contains('open');

        details.classList.toggle('open');
        btn.classList.toggle('active');
        btn.textContent = isOpen ? '+ MÁS' : '− MENOS';
        btn.setAttribute('aria-expanded', !isOpen);
    });
});

// Collage: dynamic grid spans from image aspect ratio + random highlight
(function() {
    const grid = document.querySelector('.collage-grid');
    if (!grid) return;

    const items = [...grid.querySelectorAll('.collage-item')];
    const images = items.map(item => item.querySelector('img'));

    function bestSpans(aspectRatio, mobile) {
        const colMin = 2;
        const colMax = mobile ? 3 : 5;
        const rowMin = 2;
        const rowMax = mobile ? 3 : 4;
        let best = { col: 3, row: 3, diff: Infinity };

        for (let col = colMin; col <= colMax; col++) {
            for (let row = rowMin; row <= rowMax; row++) {
                const cellRatio = col / row;
                const diff = Math.abs(Math.log(cellRatio) - Math.log(aspectRatio));
                if (diff < best.diff) {
                    best = { col, row, diff };
                }
            }
        }
        return best;
    }

    function layoutCollage() {
        const mobile = window.innerWidth <= 768;
        const cols = mobile ? 6 : 12;
        grid.style.setProperty('--collage-cols', cols);
        grid.style.setProperty('--collage-row-unit', `calc(100% / ${mobile ? 8 : 6})`);

        items.forEach((item, i) => {
            const img = images[i];
            if (!img?.naturalWidth) return;

            const { col, row } = bestSpans(img.naturalWidth / img.naturalHeight, mobile);
            item.style.gridColumn = `span ${col}`;
            item.style.gridRow = `span ${row}`;
        });
    }

    function whenImagesReady() {
        return Promise.all(
            images.map(img => {
                if (!img) return Promise.resolve();
                if (img.complete && img.naturalWidth) return Promise.resolve();
                return new Promise(resolve => {
                    img.addEventListener('load', resolve, { once: true });
                    img.addEventListener('error', resolve, { once: true });
                });
            })
        );
    }

    function activateRandom(item) {
        const delay = Math.random() * 2000 + 1000;
        const duration = Math.random() * 2000 + 2000;

        setTimeout(() => {
            item.classList.add('active');
            setTimeout(() => {
                item.classList.remove('active');
                activateRandom(item);
            }, duration);
        }, delay);
    }

    let resizeTimer;
    whenImagesReady().then(() => {
        layoutCollage();
        items.forEach(activateRandom);
    });

    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(layoutCollage, 150);
    });
})();


