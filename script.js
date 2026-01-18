const navbar = document.getElementById('navbar');
let lastScroll = 0;

// Force scroll to top on refresh
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll <= 0) {
        navbar.classList.remove('scroll-up');
        return;
    }

    if (currentScroll > lastScroll && !navbar.classList.contains('scroll-down') && currentScroll > 80) {
        navbar.classList.remove('scroll-up');
        navbar.classList.add('scroll-down');
    } else if (currentScroll < lastScroll && navbar.classList.contains('scroll-down')) {
        navbar.classList.remove('scroll-down');
        navbar.classList.add('scroll-up');
    }
    lastScroll = currentScroll;
});

// ScrollSpy Logic
const sections = document.querySelectorAll('section[id]');
const observerOptions = {
    root: null,
    rootMargin: '-50% 0px -50% 0px',
    threshold: 0
};

const observerCallback = (entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${id}`) {
                    link.classList.add('active');
                }
            });
        }
    });
};

const observer = new IntersectionObserver(observerCallback, observerOptions);
sections.forEach(section => observer.observe(section));

// --- ANIMATIONS FOR STATS & TRUST ---

const animateValue = (element, start, end, duration) => {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.innerHTML = end > 10 ? `${value}+` : `${value}+`;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
};

const trustObserverOptions = {
    threshold: 0.3
};

const trustObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Animate Numbers
            const stats = entry.target.querySelectorAll('.stat-number');
            stats.forEach(stat => {
                const target = parseInt(stat.getAttribute('data-target'));
                animateValue(stat, 0, target, 2000);
            });

            // Animate Icons
            const lockIcon = entry.target.querySelector('.stat-lock');
            const tickIcon = entry.target.querySelector('.animated-tick');

            if (lockIcon) {
                // RESET to Red/Open state first
                lockIcon.classList.remove('fa-lock', 'locked');
                lockIcon.classList.add('fa-lock-open');

                // Sequence the lock animation: Red-Open to Green-Closed
                setTimeout(() => {
                    lockIcon.classList.remove('fa-lock-open');
                    lockIcon.classList.add('fa-lock', 'locked');
                }, 800);
            }

            if (tickIcon) {
                // Reset tick first
                tickIcon.style.opacity = '0';
                tickIcon.style.transform = 'translateY(-10px) scale(0.8)';
                tickIcon.style.color = 'var(--text-muted)';

                // Tick Animation (Drop in/Bolt and change color)
                setTimeout(() => {
                    tickIcon.style.opacity = '1';
                    tickIcon.style.transform = 'translateY(0) scale(1.1)';
                    tickIcon.style.color = 'var(--success-green)';
                }, 600);
            }

            // REMOVED: trustObserver.unobserve(entry.target);
            // This allows animation to repeat every time section enters viewport
        }
    });
}, trustObserverOptions);

const trustSection = document.querySelector('.trust-counters');
const bookingSection = document.querySelector('.booking-section');
if (trustSection) trustObserver.observe(trustSection);

// Area Cards Animation Observer
const areaCardsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const areaCards = entry.target.querySelectorAll('.area-card');
            areaCards.forEach(card => {
                card.classList.add('animate-in');
            });
        } else {
            // Remove animation class when section leaves viewport
            const areaCards = entry.target.querySelectorAll('.area-card');
            areaCards.forEach(card => {
                card.classList.remove('animate-in');
            });
        }
    });
}, { threshold: 0.2 });

const areasSection = document.querySelector('.service-areas');
if (areasSection) areaCardsObserver.observe(areasSection);
if (bookingSection) trustObserver.observe(bookingSection);

// Mobile Menu Toggle
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
});

// Close mobile menu when clicking on a link
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// Smooth Scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80; // Account for navbar height
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Form Validation and Submission
const consultationForm = document.getElementById('consultationForm');
const formSuccess = document.getElementById('formSuccess');

// TODO: Replace with your actual Formspree ID from https://formspree.io
const FORMSPREE_ID = 'https://formspree.io/f/mdaaapny';

consultationForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get form data
    const formData = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        legalIssue: document.getElementById('legalIssue').value,
        timestamp: new Date().toISOString()
    };

    // Validate phone number (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
        alert('Please enter a valid 10-digit phone number');
        return;
    }

    // Change button state
    const submitBtn = consultationForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    // Send to Formspree
    const endpoint = FORMSPREE_ID.startsWith('http') ? FORMSPREE_ID : `https://formspree.io/f/${FORMSPREE_ID}`;

    fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (response.ok) {
                // Show success message
                consultationForm.style.display = 'none';
                formSuccess.style.display = 'block';
                consultationForm.reset();
            } else {
                response.json().then(data => {
                    if (Object.hasOwn(data, 'errors')) {
                        alert(data["errors"].map(error => error["message"]).join(", "));
                    } else {
                        alert("Oops! There was a problem submitting your form");
                    }
                });
            }
        })
        .catch(error => {
            alert("Oops! There was a problem submitting your form");
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        });
});

// FAQ Accordion
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    question.addEventListener('click', () => {
        // Close other open items
        faqItems.forEach(otherItem => {
            if (otherItem !== item && otherItem.classList.contains('active')) {
                otherItem.classList.remove('active');
                otherItem.querySelector('.faq-answer').style.maxHeight = null;
            }
        });

        // Toggle current item
        item.classList.toggle('active');

        if (item.classList.contains('active')) {
            answer.style.maxHeight = answer.scrollHeight + 'px';
        } else {
            answer.style.maxHeight = null;
        }
    });
});

// Lazy Loading for Images (if you add images later)
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    const lazyImages = document.querySelectorAll('img.lazy');
    lazyImages.forEach(img => imageObserver.observe(img));
}

// Animate elements on scroll (optional enhancement)
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.service-card, .why-card, .testimonial-card, .counter-card');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '0';
                entry.target.style.transform = 'translateY(20px)';

                setTimeout(() => {
                    entry.target.style.transition = 'all 0.6s ease';
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, 100);

                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    elements.forEach(el => observer.observe(el));
};

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Site Protection: Disable Right-click and selection
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('selectstart', (e) => e.preventDefault());
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && (e.key === 'c' || e.key === 'u' || e.key === 's' || e.key === 'p' || e.key === 'a')) {
            e.preventDefault();
        }
        if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') || (e.ctrlKey && e.shiftKey && e.key === 'J')) {
            e.preventDefault();
        }
    });
    animateOnScroll();
});

// Track CTA clicks (for analytics)
const trackCTAClick = (ctaType) => {
    console.log(`CTA Clicked: ${ctaType}`);
    // In production, send to analytics service
    // Example: gtag('event', 'cta_click', { cta_type: ctaType });
};

// Add click tracking to WhatsApp buttons
document.querySelectorAll('a[href*="wa.me"]').forEach(btn => {
    btn.addEventListener('click', () => trackCTAClick('WhatsApp'));
});

// Add click tracking to Call buttons
document.querySelectorAll('a[href^="tel:"]').forEach(btn => {
    btn.addEventListener('click', () => trackCTAClick('Phone Call'));
});

// Service card click tracking
document.querySelectorAll('.service-link').forEach(link => {
    link.addEventListener('click', function (e) {
        const serviceValue = this.getAttribute('data-service');
        const legalIssueSelect = document.getElementById('legalIssue');

        if (legalIssueSelect && serviceValue) {
            legalIssueSelect.value = serviceValue;
        }

        const serviceName = this.closest('.service-card').querySelector('h3').textContent;
        console.log(`Service Interest: ${serviceName}`);
        trackCTAClick(`Service: ${serviceName}`);
    });
});

// Console welcome message
console.log('%c🏛️ Advocate Krishna Moorthy - Legal Consultation', 'font-size: 16px; font-weight: bold; color: #062A44;');
console.log('%cWebsite built with care for optimal conversion and user experience', 'font-size: 12px; color: #6C757D;');
