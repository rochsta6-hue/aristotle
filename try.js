document.addEventListener("DOMContentLoaded", () => {
    // --- SIDEBAR UI LOGIC ---
    const toolBtns = document.querySelectorAll('.tool-btn');
    const sidePanel = document.getElementById('sidePanel');
    const closeBtn = document.getElementById('closeBtn');
    const panelContents = document.querySelectorAll('.panel-content');
    const svgMap = document.getElementById('mapSvg');

    toolBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const targetPanelId = btn.getAttribute('data-panel');

            // Close side panel when clicking an active button
            if (btn.classList.contains('active')) {
                closeSidePanel();
                return;
            }

            // Remove active status from all toolbar buttons
            toolBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Toggle Fire Risk Profile active state on SVG map
            if (targetPanelId === 'panel-fire') {
                svgMap.classList.add('fire-risk-active');
            } else {
                svgMap.classList.remove('fire-risk-active');
            }

            // Switch side drawer content
            panelContents.forEach(content => content.classList.remove('active'));
            const targetContent = document.getElementById(targetPanelId);
            if (targetContent) {
                targetContent.classList.add('active');
            }

            sidePanel.classList.add('open');
        });
    });

    function closeSidePanel() {
        sidePanel.classList.remove('open');
        toolBtns.forEach(b => b.classList.remove('active'));
        svgMap.classList.remove('fire-risk-active');
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeSidePanel);
    }

    // --- PHOTOREALISTIC FIRE & EMBERS CURSOR LOGIC ---
    const canvas = document.getElementById('fireCanvas');
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    let mouseX = width / 2;
    let mouseY = height / 2;
    let isMoving = false;
    let mouseTimer;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = [];

    class FireParticle {
        constructor(x, y, isEmber = false) {
            this.x = x + (Math.random() * 12 - 6);
            this.y = y + (Math.random() * 8 - 4);
            this.isEmber = isEmber;

            if (this.isEmber) {
                // Flying ember spark dynamics
                this.size = Math.random() * 2 + 1;
                this.vx = (Math.random() - 0.5) * 3.5;
                this.vy = -(Math.random() * 5 + 2);
                this.life = 1.0;
                this.decay = Math.random() * 0.02 + 0.015;
                this.color = '#ffaa33';
            } else {
                // Soft gradient flame core dynamics
                this.size = Math.random() * 20 + 15;
                this.vx = (Math.random() - 0.5) * 1.2;
                this.vy = -(Math.random() * 3 + 1.5);
                this.life = 1.0;
                this.decay = Math.random() * 0.035 + 0.025;
            }
        }

        update() {
            this.x += this.vx + Math.sin(this.life * 10) * 0.8;
            this.y += this.vy;

            if (!this.isEmber) {
                this.size *= 0.94;
            }

            this.life -= this.decay;
        }

        draw() {
            if (this.life <= 0 || this.size <= 0.1) return;

            ctx.save();
            ctx.globalCompositeOperation = 'screen';

            if (this.isEmber) {
                ctx.fillStyle = this.color;
                ctx.globalAlpha = this.life;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            } else {
                const grad = ctx.createRadialGradient(
                    this.x, this.y, 0,
                    this.x, this.y, this.size
                );

                grad.addColorStop(0.0, `rgba(255, 255, 230, ${this.life})`);
                grad.addColorStop(0.2, `rgba(255, 140, 0, ${this.life * 0.8})`);
                grad.addColorStop(0.6, `rgba(180, 20, 0, ${this.life * 0.4})`);
                grad.addColorStop(1.0, 'rgba(40, 0, 0, 0)');

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        }
    }

    // Capture cursor coordinates
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        isMoving = true;

        clearTimeout(mouseTimer);

        for (let i = 0; i < 3; i++) {
            particles.push(new FireParticle(mouseX, mouseY, false));
        }
        if (Math.random() < 0.6) {
            particles.push(new FireParticle(mouseX, mouseY, true));
        }

        mouseTimer = setTimeout(() => {
            isMoving = false;
        }, 100);
    });

    // Main Rendering Loop
    function animate() {
        ctx.clearRect(0, 0, width, height);

        if (!isMoving && Math.random() < 0.3) {
            particles.push(new FireParticle(mouseX, mouseY, false));
        }

        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw();

            if (particles[i].life <= 0 || particles[i].size <= 0.1) {
                particles.splice(i, 1);
            }
        }

        requestAnimationFrame(animate);
    }

    animate();
});
