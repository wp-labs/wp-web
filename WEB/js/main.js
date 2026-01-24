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

    // Dropdown Menu Toggle
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.stopPropagation();
            const dropdown = this.closest('.dropdown');
            const menu = dropdown.querySelector('.dropdown-menu');

            // Close other dropdowns
            document.querySelectorAll('.dropdown-menu.active').forEach(m => {
                if (m !== menu) {
                    m.classList.remove('active');
                    m.previousElementSibling.classList.remove('active');
                }
            });

            // Toggle current dropdown
            menu.classList.toggle('active');
            this.classList.toggle('active');
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown-menu.active').forEach(menu => {
                menu.classList.remove('active');
                menu.closest('.dropdown').querySelector('.dropdown-toggle').classList.remove('active');
            });
        }
    });


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
    const navLinksForScroll = document.querySelectorAll('.nav-link');

    function updateActiveNav() {
        const scrollPos = window.scrollY + 100;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos < top + height) {
                navLinksForScroll.forEach(link => {
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

    console.log('Found perf mode buttons:', perfModeBtns.length);
    console.log('Found perf mode contents:', perfModeContents.length);

    perfModeBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

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

            console.log('Switched to mode:', modeId);
        });
    });

    // Performance Log Type Tabs Switching (within each mode)
    const perfLogBtns = document.querySelectorAll('.perf-log-btn');

    console.log('Found perf log buttons:', perfLogBtns.length);

    perfLogBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

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

            console.log('Switched to log type:', logId);
        });
    });

    // Console branding
    console.log(
        '%c WarpParse ',
        'background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 5px 10px; border-radius: 5px; font-weight: bold;'
    );
    console.log('%c High-Performance ETL Engine ', 'color: #5794f2; font-size: 12px;');
    console.log('%c https://github.com/wp-labs ', 'color: #8b949e; font-size: 10px;');

    // Initialize Resource Usage Charts
    initResourceCharts();
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

// Copy install code functionality
function copyInstallCode() {
    const code = 'curl -sSf https://get.warpparse.ai/setup.sh | bash';
    const btn = document.querySelector('.install-code .copy-btn');

    navigator.clipboard.writeText(code).then(() => {
        btn.classList.add('copied');
        setTimeout(() => {
            btn.classList.remove('copied');
        }, 2000);
    });
}

// Initialize Resource Usage Charts
function initResourceCharts() {
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js not loaded, skipping chart initialization');
        return;
    }

    // Common chart options
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(13, 17, 23, 0.95)',
                titleColor: '#c9d1d9',
                bodyColor: '#c9d1d9',
                borderColor: '#30363d',
                borderWidth: 1,
                padding: 12,
                displayColors: false,
                callbacks: {
                    label: function(context) {
                        return context.parsed.y + (context.dataset.label.includes('CPU') ? '%' : ' MB');
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(48, 54, 61, 0.5)',
                    drawBorder: false
                },
                ticks: {
                    color: '#8b949e'
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: '#8b949e'
                }
            }
        }
    };

    // CPU Usage Chart
    const cpuCtx = document.getElementById('cpuUsageChart');
    if (cpuCtx) {
        new Chart(cpuCtx, {
            type: 'bar',
            data: {
                labels: ['WarpParse', 'Vector-VRL', 'Vector-Fixed', 'Logstash'],
                datasets: [
                    {
                        label: 'CPU Avg (%)',
                        data: [54, 173, 171, 276],
                        backgroundColor: [
                            'rgba(87, 148, 242, 0.8)',
                            'rgba(255, 122, 69, 0.7)',
                            'rgba(255, 152, 0, 0.7)',
                            'rgba(147, 51, 234, 0.7)'
                        ],
                        borderColor: [
                            '#5794f2',
                            '#ff7a45',
                            '#ff9800',
                            '#9333ea'
                        ],
                        borderWidth: 2,
                        borderRadius: 6,
                        barPercentage: 0.7
                    },
                    {
                        label: 'CPU Peak (%)',
                        data: [56, 180, 177, 396],
                        backgroundColor: [
                            'rgba(59, 130, 246, 0.5)',
                            'rgba(255, 87, 34, 0.5)',
                            'rgba(255, 112, 67, 0.5)',
                            'rgba(139, 92, 246, 0.5)'
                        ],
                        borderColor: [
                            '#3b82f6',
                            '#ff5722',
                            '#ff7043',
                            '#8b5cf6'
                        ],
                        borderWidth: 2,
                        borderRadius: 6,
                        barPercentage: 0.7
                    }
                ]
            },
            options: {
                ...commonOptions,
                plugins: {
                    ...commonOptions.plugins,
                    title: {
                        display: false
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#c9d1d9',
                            padding: 15,
                            font: {
                                size: 12
                            }
                        }
                    }
                },
                scales: {
                    ...commonOptions.scales,
                    y: {
                        ...commonOptions.scales.y,
                        max: 450,
                        ticks: {
                            ...commonOptions.scales.y.ticks,
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    // Memory Usage Chart
    const memCtx = document.getElementById('memUsageChart');
    if (memCtx) {
        new Chart(memCtx, {
            type: 'bar',
            data: {
                labels: ['WarpParse', 'Vector-VRL', 'Vector-Fixed', 'Logstash'],
                datasets: [
                    {
                        label: 'MEM Avg (MB)',
                        data: [60, 162, 128, 1190],
                        backgroundColor: [
                            'rgba(87, 148, 242, 0.8)',
                            'rgba(255, 122, 69, 0.7)',
                            'rgba(255, 152, 0, 0.7)',
                            'rgba(147, 51, 234, 0.7)'
                        ],
                        borderColor: [
                            '#5794f2',
                            '#ff7a45',
                            '#ff9800',
                            '#9333ea'
                        ],
                        borderWidth: 2,
                        borderRadius: 6,
                        barPercentage: 0.7
                    },
                    {
                        label: 'MEM Peak (MB)',
                        data: [66, 166, 134, 1223],
                        backgroundColor: [
                            'rgba(59, 130, 246, 0.5)',
                            'rgba(255, 87, 34, 0.5)',
                            'rgba(255, 112, 67, 0.5)',
                            'rgba(139, 92, 246, 0.5)'
                        ],
                        borderColor: [
                            '#3b82f6',
                            '#ff5722',
                            '#ff7043',
                            '#8b5cf6'
                        ],
                        borderWidth: 2,
                        borderRadius: 6,
                        barPercentage: 0.7
                    }
                ]
            },
            options: {
                ...commonOptions,
                plugins: {
                    ...commonOptions.plugins,
                    title: {
                        display: false
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#c9d1d9',
                            padding: 15,
                            font: {
                                size: 12
                            }
                        }
                    }
                },
                scales: {
                    ...commonOptions.scales,
                    y: {
                        ...commonOptions.scales.y,
                        max: 1400,
                        ticks: {
                            ...commonOptions.scales.y.ticks,
                            callback: function(value) {
                                return value + ' MB';
                            }
                        }
                    }
                }
            }
        });
    }
}
