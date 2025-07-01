document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section');
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    const clickSound = document.getElementById('click-sound');
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const navUl = document.querySelector('nav ul');
    const themeSwitch = document.getElementById('theme-switch');
    const body = document.body;

    let particles = [];
    const mouse = {
        x: null,
        y: null,
        radius: 150
    };

    // Intersection Observer for fade-in animations
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = `fadeIn 1s ease-in-out forwards`;
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => {
        observer.observe(section);
    });

    // Particle animation functions
    class Particle {
        constructor(x, y, directionX, directionY, size, color) {
            this.x = x;
            this.y = y;
            this.directionX = directionX;
            this.directionY = directionY;
            this.size = size;
            this.color = color;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        update() {
            if (this.x > canvas.width || this.x < 0) {
                this.directionX = -this.directionX;
            }
            if (this.y > canvas.height || this.y < 0) {
                this.directionY = -this.directionY;
            }

            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < mouse.radius + this.size) {
                if (mouse.x < this.x && this.x < canvas.width - this.size * 10) {
                    this.x += 10;
                }
                if (mouse.x > this.x && this.x > this.size * 10) {
                    this.x -= 10;
                }
                if (mouse.y < this.y && this.y < canvas.height - this.size * 10) {
                    this.y += 10;
                }
                if (mouse.y > this.y && this.y > this.size * 10) {
                    this.y -= 10;
                }
            }

            this.x += this.directionX;
            this.y += this.directionY;
            this.draw();
        }
    }

    function initParticles() {
        particles = [];
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Set mouse position to center if not already set (e.g., on initial load)
        if (mouse.x === null || mouse.y === null) {
            mouse.x = canvas.width / 2;
            mouse.y = canvas.height / 2;
        }

        let numberOfParticles = (canvas.height * canvas.width) / 9000;
        for (let i = 0; i < numberOfParticles; i++) {
            let size = (Math.random() * 5) + 1;
            let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
            let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
            let directionX = (Math.random() * 5) - 2.5;
            let directionY = (Math.random() * 5) - 2.5;
            let color = body.classList.contains('light-mode') ? '#333' : '#fff';

            particles.push(new Particle(x, y, directionX, directionY, size, color));
        }
    }

    function animateParticles() {
        requestAnimationFrame(animateParticles);
        ctx.clearRect(0, 0, innerWidth, innerHeight);

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
        }
        connectParticles();
    }

    function connectParticles() {
        let opacityValue = 1;
        for (let a = 0; a < particles.length; a++) {
            for (let b = a; b < particles.length; b++) {
                let distance = ((particles[a].x - particles[b].x) * (particles[a].x - particles[b].x)) +
                    ((particles[a].y - particles[b].y) * (particles[a].y - particles[b].y));
                if (distance < (canvas.width / 7) * (canvas.height / 7)) {
                    opacityValue = 1 - (distance / 20000);
                    ctx.strokeStyle = body.classList.contains('light-mode') ? 'rgba(51,51,51,' + opacityValue + ')' : 'rgba(255,255,255,' + opacityValue + ')';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    // Event Listeners
    window.addEventListener('mousemove', event => {
        mouse.x = event.x;
        mouse.y = event.y;
    });

    // Event Listeners
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        mouse.radius = (canvas.width / 8) * (canvas.height / 8); // Adjusted radius calculation
        initParticles();
    });

    window.addEventListener('mouseout', () => {
        mouse.x = undefined;
        mouse.y = undefined;
    });

    themeSwitch.addEventListener('change', () => {
        if (themeSwitch.checked) {
            body.classList.add('light-mode');
            localStorage.setItem('theme', 'light-mode');
        } else {
            body.classList.remove('light-mode');
            localStorage.setItem('theme', 'dark-mode');
        }
        initParticles(); // Re-initialize particles with new colors
    });

    const clickableElements = document.querySelectorAll('.cta-button, .download-btn, nav a');
    clickableElements.forEach(element => {
        element.addEventListener('click', () => {
            clickSound.currentTime = 0;
            clickSound.play();
        });
    });

    hamburgerMenu.addEventListener('click', () => {
        navUl.classList.toggle('show');
    });

    // Initial setup
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.classList.add(savedTheme);
        if (savedTheme === 'light-mode') {
            themeSwitch.checked = true;
        }
    } else {
        // Default to dark mode if no theme is saved
        body.classList.remove('light-mode');
        localStorage.setItem('theme', 'dark-mode');
    }

    initParticles();
    animateParticles();
});
