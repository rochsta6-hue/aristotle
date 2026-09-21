document.addEventListener("DOMContentLoaded", () => {

  // 1. TOOLBAR & SIDE PANEL INTERACTION
  const toolBtns = document.querySelectorAll(".tool-btn");
  const sidePanel = document.getElementById("sidePanel");
  const closeBtn = document.getElementById("closeBtn");
  const panelContents = document.querySelectorAll(".panel-content");
  let activePanelId = "panel-fire";

  toolBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetPanelId = btn.getAttribute("data-panel");

      // Toggle drawer if clicking already active tab
      if (activePanelId === targetPanelId && sidePanel.classList.contains("open")) {
        closeDrawer();
        return;
      }

      openDrawer(targetPanelId);

      // Update toolbar buttons
      toolBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
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
    toolBtns.forEach((b) => b.classList.remove("active"));
  }

  closeBtn.addEventListener("click", closeDrawer);


  // 2. SVG REGION HOVER, SELECTION & TOOLTIP LOGIC
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
      regions.forEach((r) => r.classList.remove("selected"));
      region.classList.add("selected");
    });
  });


  // 3. SVG MAP ZOOM AND PAN LOGIC
  const svg = document.getElementById("svgMap");
  let scale = 1;
  let pointX = 0;
  let pointY = 0;
  let startX = 0;
  let startY = 0;
  let isPanning = false;

  svg.addEventListener("wheel", (e) => {
    e.preventDefault();
    const zoomFactor = 0.15;

    if (e.deltaY < 0) {
      scale = Math.min(scale + zoomFactor, 4); // Max 4x zoom in
    } else {
      scale = Math.max(scale - zoomFactor, 0.8); // Min 0.8x zoom out
    }

    svg.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
  });

  svg.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;
    isPanning = true;
    startX = e.clientX - pointX;
    startY = e.clientY - pointY;
  });

  window.addEventListener("mousemove", (e) => {
    if (!isPanning) return;
    pointX = e.clientX - startX;
    pointY = e.clientY - startY;
    svg.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
  });

  window.addEventListener("mouseup", () => {
    isPanning = false;
  });


  // 4. FIRE CURSOR PARTICLE CANVAS EFFECT
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
      colorHue: Math.random() * 30 + 10, // Fire hues
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

  animateParticles();
});
