// ── Blockchain Network Canvas Animation (Dark Theme) ──
const canvas = document.getElementById('networkCanvas');
const ctx    = canvas.getContext('2d');

// Dark theme palette
const BG_COLOR    = '#0d1117';
const NODE_COLOR  = 'rgba(79, 156, 249, 0.9)';
const GLOW_COLOR  = 'rgba(79, 156, 249, 0.08)';
const PULSE_COLOR = '#79b8ff';

let W, H, nodes, pulses;
const NODE_COUNT   = 75;
const CONNECT_DIST = 160;

function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    initNodes();
}

// ── Node ──
class Node {
    constructor() {
        this.x  = Math.random() * (typeof W !== 'undefined' ? W : window.innerWidth);
        this.y  = Math.random() * (typeof H !== 'undefined' ? H : window.innerHeight);
        this.r  = Math.random() * 2 + 1.2;
        const speed = 0.12 + Math.random() * 0.22;
        const angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.opacity = 0.5 + Math.random() * 0.5;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < -60) this.x = W + 60;
        if (this.x > W + 60) this.x = -60;
        if (this.y < -60) this.y = H + 60;
        if (this.y > H + 60) this.y = -60;
    }

    draw() {
        // Soft glow halo
        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 6);
        grad.addColorStop(0, `rgba(79, 156, 249, ${this.opacity * 0.18})`);
        grad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r * 6, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(79, 156, 249, ${this.opacity})`;
        ctx.fill();
    }
}

// ── Pulse: dot that travels along an edge ──
class Pulse {
    constructor(a, b) {
        this.a     = a;
        this.b     = b;
        this.t     = 0;
        this.speed = 0.004 + Math.random() * 0.007;
    }

    update() { this.t += this.speed; }

    draw() {
        const x = this.a.x + (this.b.x - this.a.x) * this.t;
        const y = this.a.y + (this.b.y - this.a.y) * this.t;

        // Glow behind pulse
        const g = ctx.createRadialGradient(x, y, 0, x, y, 8);
        g.addColorStop(0, 'rgba(121, 184, 255, 0.5)');
        g.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();

        // Pulse dot
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = PULSE_COLOR;
        ctx.fill();
    }

    isDone() { return this.t >= 1; }
}

function initNodes() {
    nodes  = Array.from({ length: NODE_COUNT }, () => new Node());
    pulses = [];
}

let frameCount = 0;

function animate() {
    requestAnimationFrame(animate);

    // Clear with dark BG
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, W, H);

    frameCount++;

    // Spawn pulses periodically
    if (frameCount % 35 === 0 && nodes.length > 1) {
        const i = Math.floor(Math.random() * nodes.length);
        const j = Math.floor(Math.random() * nodes.length);
        if (i !== j) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            if (Math.sqrt(dx * dx + dy * dy) < CONNECT_DIST) {
                pulses.push(new Pulse(nodes[i], nodes[j]));
            }
        }
    }

    // Draw connecting lines
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const dx   = nodes[i].x - nodes[j].x;
            const dy   = nodes[i].y - nodes[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < CONNECT_DIST) {
                const alpha = (1 - dist / CONNECT_DIST) * 0.22;
                ctx.beginPath();
                ctx.moveTo(nodes[i].x, nodes[i].y);
                ctx.lineTo(nodes[j].x, nodes[j].y);
                ctx.strokeStyle = `rgba(79, 156, 249, ${alpha})`;
                ctx.lineWidth = 0.8;
                ctx.stroke();
            }
        }
    }

    // Update & draw nodes
    nodes.forEach(n => { n.update(); n.draw(); });

    // Update & draw pulses
    pulses = pulses.filter(p => !p.isDone());
    pulses.forEach(p => { p.update(); p.draw(); });
}

// ── Init ──
window.addEventListener('resize', resize);
resize();
animate();


// ── Scroll reveal & navbar effects ──
document.addEventListener('DOMContentLoaded', () => {

    // Intersection observer for section fade-ins
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.12 });

    document.querySelectorAll('.section-fade').forEach(el => observer.observe(el));

    // Navbar style on scroll
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(13, 17, 23, 0.96)';
            navbar.style.boxShadow  = '0 4px 24px rgba(0, 0, 0, 0.5)';
        } else {
            navbar.style.background = 'rgba(13, 17, 23, 0.88)';
            navbar.style.boxShadow  = 'none';
        }
    });

    // ── Hamburger menu ──
    const hamburger = document.getElementById('hamburger');
    const navLinks  = document.getElementById('navLinks');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('open');
        // Prevent body scroll while menu is open
        document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    // Close menu when a nav link is clicked
    document.querySelectorAll('.nav-close').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('open');
            document.body.style.overflow = '';
        });
    });

    // Close menu when clicking outside (overlay)
    document.addEventListener('click', (e) => {
        if (
            navLinks.classList.contains('open') &&
            !navLinks.contains(e.target) &&
            !hamburger.contains(e.target)
        ) {
            hamburger.classList.remove('active');
            navLinks.classList.remove('open');
            document.body.style.overflow = '';
        }
    });
});

