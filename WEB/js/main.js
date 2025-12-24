/**
 * WarpParse Website - Interactive Scripts
 */

// Smooth scroll for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mainNav = document.getElementById('mainNav');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileMenuBtn && mainNav) {
        mobileMenuBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            mainNav.classList.toggle('active');
            document.body.style.overflow = mainNav.classList.contains('active') ? 'hidden' : '';
        });

        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenuBtn.classList.remove('active');
                mainNav.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        document.addEventListener('click', function(e) {
            if (!e.target.closest('.header') && mainNav.classList.contains('active')) {
                mobileMenuBtn.classList.remove('active');
                mainNav.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // Active nav link on scroll
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function updateActiveNav() {
        const scrollPos = window.scrollY + 100;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActiveNav);
    updateActiveNav();

    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe cards and sections
    document.querySelectorAll('.card, .connector-card, .code-block, .metric-card, .perf-chart-card, .rule-card').forEach(el => {
        observer.observe(el);
    });

    // Animate performance bars on scroll
    const perfSection = document.getElementById('performance');
    let perfAnimated = false;

    const perfObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !perfAnimated) {
                perfAnimated = true;
                animatePerfBars();
            }
        });
    }, { threshold: 0.1 });

    if (perfSection) {
        perfObserver.observe(perfSection);
    }

    function animatePerfBars() {
        // Animate old-style progress bars
        document.querySelectorAll('.progress-fill').forEach(bar => {
            const width = bar.style.width;
            bar.style.width = '0%';
            setTimeout(() => {
                bar.style.width = width;
            }, 100);
        });

        // Animate new comparison bars
        document.querySelectorAll('.comp-bar').forEach(bar => {
            const width = bar.style.width;
            bar.style.width = '0%';
            setTimeout(() => {
                bar.style.width = width;
            }, 100);
        });
    }

    // Header background on scroll
    const header = document.querySelector('.header');
    let lastScroll = 0;

    window.addEventListener('scroll', function() {
        const currentScroll = window.scrollY;

        if (currentScroll > 50) {
            header.style.background = 'rgba(13, 17, 23, 0.98)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
        } else {
            header.style.background = 'rgba(13, 17, 23, 0.95)';
            header.style.boxShadow = 'none';
        }

        lastScroll = currentScroll;
    });

    // Connector card hover effect
    document.querySelectorAll('.connector-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.querySelector('.connector-icon').style.transform = 'scale(1.1)';
        });

        card.addEventListener('mouseleave', function() {
            this.querySelector('.connector-icon').style.transform = 'scale(1)';
        });
    });

    // Add parallax effect to hero background
    const heroBg = document.querySelector('.hero-bg');
    if (heroBg) {
        window.addEventListener('scroll', function() {
            const scrolled = window.scrollY;
            heroBg.style.transform = `translateY(${scrolled * 0.3}px)`;
        });
    }

    // Performance Mode Tabs Switching (Parse Only vs Parse+Transform)
    const perfModeBtns = document.querySelectorAll('.perf-mode-btn');
    const perfModeContents = document.querySelectorAll('.perf-mode-content');

    perfModeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all mode buttons and contents
            perfModeBtns.forEach(b => b.classList.remove('active'));
            perfModeContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked mode button and corresponding content
            this.classList.add('active');
            const modeId = this.getAttribute('data-mode');
            const targetMode = document.getElementById(modeId);
            if (targetMode) {
                targetMode.classList.add('active');
            }

            // Reset log type tabs to first one within the mode
            const targetLogTabs = targetMode?.querySelectorAll('.perf-log-btn');
            const targetLogContents = targetMode?.querySelectorAll('.perf-log-content');
            if (targetLogTabs && targetLogContents) {
                targetLogTabs.forEach(b => b.classList.remove('active'));
                targetLogContents.forEach(c => c.classList.remove('active'));
                targetLogTabs[0]?.classList.add('active');
                targetLogContents[0]?.classList.add('active');
            }

            // Re-animate bars when switching modes
            animatePerfBars();
        });
    });

    // Performance Log Type Tabs Switching (within each mode)
    const perfLogBtns = document.querySelectorAll('.perf-log-btn');

    perfLogBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Find parent mode content
            const parentMode = this.closest('.perf-mode-content');

            // Remove active class from log buttons and contents within this mode only
            const modeLogBtns = parentMode?.querySelectorAll('.perf-log-btn');
            const modeLogContents = parentMode?.querySelectorAll('.perf-log-content');

            modeLogBtns?.forEach(b => b.classList.remove('active'));
            modeLogContents?.forEach(c => c.classList.remove('active'));

            // Add active class to clicked log button and corresponding content
            this.classList.add('active');
            const logId = this.getAttribute('data-log');
            const targetContent = document.getElementById(logId);
            if (targetContent) {
                targetContent.classList.add('active');
                // Re-animate bars when switching log types
                animatePerfBars();
            }
        });
    });

    // Console branding
    console.log(
        '%c WarpParse ',
        'background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 5px 10px; border-radius: 5px; font-weight: bold;'
    );
    console.log('%c High-Performance ETL Engine ', 'color: #5794f2; font-size: 12px;');
    console.log('%c https://github.com/wp-labs ', 'color: #8b949e; font-size: 10px;');
});

// Copy code functionality
function copyCode(button) {
    const codeBlock = button.closest('.code-block');
    const code = codeBlock.querySelector('code').textContent;

    navigator.clipboard.writeText(code).then(() => {
        button.textContent = 'Copied!';
        setTimeout(() => {
            button.textContent = 'Copy';
        }, 2000);
    });
}
