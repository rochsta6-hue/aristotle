document.addEventListener("DOMContentLoaded", () => {
  // 1. TOOLBAR & SIDE PANEL INTERACTION
  const toolBtns = document.querySelectorAll(".tool-btn");
  const sidePanel = document.getElementById("sidePanel");
  const closeBtn = document.getElementById("closeBtn");
  const panelContents = document.querySelectorAll(".panel-content");
  const svgMap = document.getElementById("svgMap");
  let activePanelId = null;

  toolBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetPanelId = btn.getAttribute("data-panel");

      // Toggle fire risk map base colors when Fire Risk Profile button is clicked
      if (targetPanelId === "panel-fire") {
        const isRiskActive = svgMap.classList.toggle("fire-risk-active");
        if (isRiskActive) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      }

      // If clicking the currently active panel, close the drawer
      if (activePanelId === targetPanelId && sidePanel.classList.contains("open")) {
        closeDrawer();
        return;
      }

      // Open drawer and switch content
      openDrawer(targetPanelId);

      // Update active button state
      toolBtns.forEach(b => {
        if (b.getAttribute("data-panel") !== "panel-fire") {
          b.classList.remove("active");
        }
      });
      if (targetPanelId !== "panel-fire") {
        btn.classList.add("active");
      }
    });
  });

  function openDrawer(panelId) {
    activePanelId = panelId;
    panelContents.forEach((content) => {
      content.classList.remove("active");
      if (content.id === panelId) {
        content.classList.add("active");
      }
    });
    sidePanel.classList.add("open");
  }

  function closeDrawer() {
    sidePanel.classList.remove("open");
    activePanelId = null;
    toolBtns.forEach((b) => {
      if (b.getAttribute("data-panel") !== "panel-fire" || !svgMap.classList.contains("fire-risk-active")) {
        b.classList.remove("active");
      }
    });
  }

  closeBtn.addEventListener("click", closeDrawer);

  // 2. SVG REGION HOVER & TOOLTIP LOGIC
  const mapTooltip = document.getElementById("mapTooltip");
  const regions = document.querySelectorAll(".region");

  regions.forEach((region) => {
    region.addEventListener("mousemove", (e) => {
      const regionName = region.getAttribute("data-name") || "Monitored Region";
      mapTooltip.textContent = regionName;
      mapTooltip.style.opacity = "1";
      mapTooltip.style.left = e.clientX + 15 + "px";
      mapTooltip.style.top = e.clientY + 15 + "px";
    });

    region.addEventListener("mouseleave", () => {
      mapTooltip.style.opacity = "0";
    });

    region.addEventListener("click", () => {
      regions.forEach(r => r.classList.remove("selected"));
      region.classList.add("selected");
    });
  });

  // 3. FIRE CURSOR PARTICLE CANVAS EFFECT
  const canvas = document.getElementById("fireCanvas");
  const ctx = canvas.getContext("2d");
  let particles = [];
  let mouse = { x: -100, y: -100, active: false };

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;

    // Emit particles on move
    for (let i = 0; i < 3; i++) {
      particles.push(createParticle(mouse.x, mouse.y));
    }
  });

  function createParticle(x, y) {
    return {
      x: x + (Math.random() - 0.5) * 10,
      y: y + (Math.random() - 0.5) * 10,
      size: Math.random() * 6 + 2,
      speedX: (Math.random() - 0.5) * 1.5,
      speedY: -Math.random() * 2.5 - 0.5,
      colorHue: Math.random() * 30 + 10, // Orange-red hues (10 - 40)
      opacity: 1,
      life: Math.random() * 0.03 + 0.015
    };
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      let p = particles[i];
      p.x += p.speedX;
      p.y += p.speedY;
      p.opacity -= p.life;
      p.size *= 0.96;

      if (p.opacity <= 0 || p.size <= 0.5) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.colorHue}, 100%, 55%, ${p.opacity})`;
      ctx.fill();
      ctx.restore();
    }

    requestAnimationFrame(animateParticles);
  }

  // Start particle animation loop
  animateParticles();
});
