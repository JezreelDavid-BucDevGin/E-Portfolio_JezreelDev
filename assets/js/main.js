// ============================================================
//  E-Portfolio – Jezreel David  |  main.js
// ============================================================

// background part
/* ─── Particle System ─────────────────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById("particle-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let W,
    H,
    particles = [],
    animId;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() {
      this.reset(true);
    }
    reset(init = false) {
      this.x = Math.random() * W;
      this.y = init ? Math.random() * H : H + 10;
      this.r = Math.random() * 1.5 + 0.4;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = -(Math.random() * 0.5 + 0.2);
      this.a = Math.random() * 0.6 + 0.1;
      this.col =
        Math.random() > 0.5
          ? `rgba(0,212,255,${this.a})`
          : `rgba(123,47,255,${this.a * 0.7})`;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.a -= 0.0005;
      if (this.y < -10 || this.a <= 0) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.col;
      ctx.fill();
    }
  }

  function initParticlePool() {
    particles = [];
    const count = Math.min(Math.floor((W * H) / 12000), 120);
    for (let i = 0; i < count; i++) particles.push(new Particle());
  }

  function drawConnections() {
    const maxDist = 120;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d = Math.hypot(dx, dy);
        if (d < maxDist) {
          const a = (1 - d / maxDist) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,212,255,${a})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawConnections();
    particles.forEach((p) => {
      p.update();
      p.draw();
    });
    animId = requestAnimationFrame(loop);
  }

  window.addEventListener("resize", () => {
    resize();
    initParticlePool();
  });
  resize();
  initParticlePool();
  loop();
})();

/* ─── Page Loader ─────────────────────────────────────────── */
(function initPageLoader() {
  const loader = document.getElementById("page-loader");
  const binaryLayer = loader?.querySelector(".page-loader-binary");
  const pixelCanvas = document.getElementById("page-loader-pixels");
  const body = document.body;
  if (!loader || !body) return;

  const binaryChars = ["0", "1"];
  const rowCount = 22;
  const colCount = 74;
  let binaryIntervalId = null;
  let pixelAnimId = null;
  let pixelResizeObserver = null;

  const pixelCtx = pixelCanvas ? pixelCanvas.getContext("2d") : null;
  const pixelParticles = [];
  const pixelPalette = [
    [0, 212, 255],
    [123, 47, 255],
    [0, 255, 136],
  ];
  const pixelConfig = {
    count: 320,
    cell: 5,
    amplitude: 34,
    waveCount: 1.45,
    speed: 0.0024,
  };

  function randomBit() {
    return binaryChars[Math.floor(Math.random() * binaryChars.length)];
  }

  function createBinaryRow(index) {
    const row = document.createElement("div");
    row.className = "page-loader-binary-row";
    const widthModifier = 100 - Math.min(index * 1.6, 24);
    row.style.width = `${widthModifier}%`;
    row.style.opacity = String(0.62 + Math.random() * 0.32);
    row.style.transform = `translateX(${Math.floor(Math.random() * 18)}px)`;

    const fragment = document.createDocumentFragment();
    const bitCount = Math.max(
      44,
      colCount - Math.floor((index % 5) * 5) - Math.floor(Math.random() * 6),
    );
    for (let bitIndex = 0; bitIndex < bitCount; bitIndex++) {
      const bit = document.createElement("span");
      bit.className = "page-loader-bit";
      bit.textContent = randomBit();
      fragment.appendChild(bit);
    }
    row.appendChild(fragment);
    return row;
  }

  function renderBinaryMatrix() {
    if (!binaryLayer) return;
    binaryLayer.innerHTML = "";

    const grid = document.createElement("div");
    grid.className = "page-loader-binary-grid";

    for (let index = 0; index < rowCount; index++) {
      grid.appendChild(createBinaryRow(index));
    }

    binaryLayer.appendChild(grid);
  }

  function refreshBinaryMatrix() {
    if (!binaryLayer) return;
    binaryLayer.querySelectorAll(".page-loader-bit").forEach((bit) => {
      if (Math.random() > 0.12) {
        bit.textContent = randomBit();
      }
    });
  }

  function resizePixelCanvas() {
    if (!pixelCanvas || !pixelCtx) return;

    const rect = loader.getBoundingClientRect();
    const devicePixelRatio = window.devicePixelRatio || 1;
    const halfHeight = rect.height * 0.5;

    pixelCanvas.width = Math.max(1, Math.floor(rect.width * devicePixelRatio));
    pixelCanvas.height = Math.max(1, Math.floor(halfHeight * devicePixelRatio));
    pixelCanvas.style.width = `${rect.width}px`;
    pixelCanvas.style.height = `${halfHeight}px`;
    pixelCtx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }

  function seedPixelParticles() {
    if (!pixelCanvas || !pixelCtx) return;

    pixelParticles.length = 0;
    const rect = loader.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height * 0.5;
    const total = Math.min(
      pixelConfig.count,
      Math.max(180, Math.floor((width * height) / 1200)),
    );

    for (let index = 0; index < total; index++) {
      const band = Math.random() > 0.52 ? 0.2 : 0.48;
      pixelParticles.push({
        x: Math.random() * width,
        baseY: height * band + Math.random() * height * 0.18,
        phase: Math.random() * Math.PI * 2,
        density: 0.25 + Math.random() * 0.75,
        scale: 0.45 + Math.random() * 1.3,
        color: pixelPalette[Math.floor(Math.random() * pixelPalette.length)],
      });
    }
  }

  function drawPixelWave(time) {
    if (!pixelCanvas || !pixelCtx) return;

    const rect = loader.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height * 0.5;
    const waveBase = height * 0.57;

    pixelCtx.clearRect(0, 0, width, height);

    const wash = pixelCtx.createLinearGradient(0, 0, 0, height);
    wash.addColorStop(0, "rgba(2, 8, 18, 0.02)");
    wash.addColorStop(0.56, "rgba(2, 8, 18, 0.06)");
    wash.addColorStop(1, "rgba(2, 8, 18, 0.28)");
    pixelCtx.fillStyle = wash;
    pixelCtx.fillRect(0, 0, width, height);

    const ribbonGlow = pixelCtx.createLinearGradient(
      0,
      height * 0.18,
      0,
      height,
    );
    ribbonGlow.addColorStop(0, "rgba(0, 212, 255, 0.03)");
    ribbonGlow.addColorStop(0.5, "rgba(0, 212, 255, 0.1)");
    ribbonGlow.addColorStop(1, "rgba(123, 47, 255, 0.04)");
    pixelCtx.fillStyle = ribbonGlow;
    pixelCtx.fillRect(0, height * 0.12, width, height * 0.82);

    const crestStep = 8;
    for (let x = 0; x <= width; x += crestStep) {
      const normalizedX = x / width;
      const primaryWave = Math.sin(
        normalizedX * Math.PI * 2 * pixelConfig.waveCount +
          time * pixelConfig.speed,
      );
      const secondaryWave = Math.sin(
        normalizedX * Math.PI * 6.2 + time * pixelConfig.speed * 1.7,
      );
      const ridge =
        waveBase + primaryWave * pixelConfig.amplitude + secondaryWave * 11;
      const crestHeight = 12 + Math.max(0, primaryWave) * 12;

      for (let row = -2; row <= 7; row++) {
        const y =
          ridge + row * 6 + Math.sin(time * 0.0016 + x * 0.04 + row) * 1.6;
        if (y < -10 || y > height + 10) continue;

        const alpha = row < 1 ? 0.9 - Math.abs(row) * 0.08 : 0.4 - row * 0.035;
        const [r, g, b] =
          row < 2 ? [0, 212, 255] : row < 5 ? [123, 47, 255] : [0, 255, 136];
        pixelCtx.fillStyle = `rgba(${r}, ${g}, ${b}, ${Math.max(0.06, alpha)})`;
        pixelCtx.shadowColor = `rgba(${r}, ${g}, ${b}, ${Math.max(0.12, alpha)})`;
        pixelCtx.shadowBlur = 8;
        pixelCtx.fillRect(x, y, crestStep - 1, 4);
      }

      for (let foam = 0; foam < 3; foam++) {
        const foamX = x + foam * 2 - 2;
        const foamY = ridge - crestHeight - foam * 3;
        pixelCtx.fillStyle = `rgba(255, 255, 255, ${0.12 - foam * 0.03})`;
        pixelCtx.shadowColor = "rgba(255, 255, 255, 0.25)";
        pixelCtx.shadowBlur = 6;
        pixelCtx.fillRect(foamX, foamY, 2, 2);
      }
    }

    for (const particle of pixelParticles) {
      const normalizedX = particle.x / width;
      const primaryWave = Math.sin(
        normalizedX * Math.PI * 2 * pixelConfig.waveCount +
          time * pixelConfig.speed +
          particle.phase,
      );
      const secondaryWave = Math.sin(
        normalizedX * Math.PI * 6.2 +
          time * pixelConfig.speed * 1.9 +
          particle.phase * 1.4,
      );
      const crestLift = Math.max(0, primaryWave) * 18;
      const y =
        waveBase +
        primaryWave * pixelConfig.amplitude +
        secondaryWave * 10 +
        crestLift +
        (particle.baseY - height * 0.5) * 0.08;

      if (y < -16 || y > height + 16) continue;

      const intensity =
        0.18 + particle.density * 0.72 + Math.max(primaryWave, 0) * 0.1;
      const size =
        pixelConfig.cell *
        particle.scale *
        (0.8 + Math.max(primaryWave, 0) * 0.58);
      const [r, g, b] = particle.color;

      pixelCtx.save();
      pixelCtx.translate(particle.x, y);
      pixelCtx.rotate(primaryWave * 0.2);

      pixelCtx.shadowColor = `rgba(${r}, ${g}, ${b}, ${Math.min(1, intensity + 0.24)})`;
      pixelCtx.shadowBlur = 8 + particle.scale * 6;
      pixelCtx.fillStyle = `rgba(${r}, ${g}, ${b}, ${intensity})`;

      const halfSize = size / 2;
      pixelCtx.fillRect(-halfSize, -halfSize, size, size);

      if (particle.density > 0.5) {
        pixelCtx.fillStyle = `rgba(255, 255, 255, ${intensity * 0.55})`;
        pixelCtx.fillRect(
          -halfSize * 0.36,
          -halfSize * 0.36,
          size * 0.36,
          size * 0.36,
        );
      }

      if (particle.density > 0.8) {
        pixelCtx.fillStyle = `rgba(0, 212, 255, ${intensity * 0.35})`;
        pixelCtx.fillRect(
          halfSize * 0.08,
          -halfSize * 0.1,
          size * 0.18,
          size * 0.18,
        );
      }

      pixelCtx.restore();
    }
  }

  function animatePixelWave(time) {
    drawPixelWave(time);
    pixelAnimId = window.requestAnimationFrame(animatePixelWave);
  }

  renderBinaryMatrix();
  binaryIntervalId = window.setInterval(refreshBinaryMatrix, 450);

  if (pixelCanvas && pixelCtx) {
    resizePixelCanvas();
    seedPixelParticles();
    animatePixelWave(0);

    if (typeof ResizeObserver !== "undefined") {
      pixelResizeObserver = new ResizeObserver(() => {
        resizePixelCanvas();
        seedPixelParticles();
      });
      pixelResizeObserver.observe(loader);
    } else {
      window.addEventListener("resize", () => {
        resizePixelCanvas();
        seedPixelParticles();
      });
    }
  }

  window.setTimeout(() => {
    if (binaryIntervalId) {
      window.clearInterval(binaryIntervalId);
      binaryIntervalId = null;
    }
    if (pixelAnimId) {
      window.cancelAnimationFrame(pixelAnimId);
      pixelAnimId = null;
    }
    if (pixelResizeObserver) {
      pixelResizeObserver.disconnect();
      pixelResizeObserver = null;
    }
    loader.classList.add("is-hidden");
    body.classList.remove("is-loading");
    window.setTimeout(() => {
      loader.remove();
    }, 750);
  }, 5000);
})();

/* ─── Navbar ─────────────────────────────────────────────── */
(function initNavbar() {
  const navbar = document.getElementById("navbar");
  const toggle = document.getElementById("nav-toggle");
  const links = document.getElementById("nav-links");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 60) navbar.classList.add("scrolled");
    else navbar.classList.remove("scrolled");
  });

  toggle &&
    toggle.addEventListener("click", () => {
      links.classList.toggle("open");
    });

  // Close mobile nav on link click
  links &&
    links.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => links.classList.remove("open"));
    });

  // Active section highlighting
  const sections = document.querySelectorAll("section[id]");
  const navAnchors = document.querySelectorAll(".nav-links a");

  function updateActive() {
    const scrollY = window.scrollY + 100;
    sections.forEach((sec) => {
      const top = sec.offsetTop;
      const h = sec.offsetHeight;
      const id = sec.getAttribute("id");
      const link = document.querySelector(`.nav-links a[href="#${id}"]`);
      if (link) {
        if (scrollY >= top && scrollY < top + h) link.classList.add("active");
        else link.classList.remove("active");
      }
    });
  }
  window.addEventListener("scroll", updateActive);
})();

/* ─── Typewriter Effect ───────────────────────────────────── */
(function initTypewriter() {
  const el = document.getElementById("typewriter");
  if (!el) return;
  const roles = [
    "IT Graduate",
    "Web Developer",
    "Problem Solver",
    "Tech Enthusiast",
    "BSIT Graduate",
  ];
  let roleIdx = 0,
    charIdx = 0,
    deleting = false;
  const speed = { type: 80, delete: 45, pause: 1800 };
  let paused = false;

  function type() {
    const current = roles[roleIdx];
    if (!deleting && charIdx <= current.length) {
      el.textContent = current.slice(0, charIdx++);
      setTimeout(type, speed.type);
    } else if (!deleting && charIdx > current.length) {
      paused = true;
      setTimeout(() => {
        deleting = true;
        paused = false;
        type();
      }, speed.pause);
    } else if (deleting && charIdx >= 0) {
      el.textContent = current.slice(0, charIdx--);
      setTimeout(type, speed.delete);
    } else {
      deleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
      setTimeout(type, 300);
    }
  }
  type();
})();

/* ─── Scroll Reveal ───────────────────────────────────────── */
(function initReveal() {
  const options = { threshold: 0.12, rootMargin: "0px 0px -60px 0px" };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        io.unobserve(e.target);
      }
    });
  }, options);
  document
    .querySelectorAll(".reveal, .reveal-left")
    .forEach((el) => io.observe(el));
})();

/* ─── Skills Carousel – Coverflow ────────────────────────── */
(function initSkillsCarousel() {
  const track = document.getElementById("skills-carousel-track");
  const trackOuter = track && track.closest(".skills-carousel-track-outer");
  const prevBtn = document.getElementById("skills-prev");
  const nextBtn = document.getElementById("skills-next");
  const dots = document.querySelectorAll(".skills-dot");
  const counterEl = document.getElementById("skills-current");
  const slides = track
    ? Array.from(track.querySelectorAll(".skills-carousel-slide"))
    : [];
  const total = slides.length;
  let current = 0;
  let animatedSlides = new Set();

  /* ── Pixel offset so the active slide sits centred in the viewport ── */
  function calcOffset(index) {
    if (!trackOuter) return 0;
    const outerW = trackOuter.clientWidth;
    const slideW = Math.min(outerW * 0.42, 420); // matches flex: 0 0 42% / max-width: 420px
    const sideGap = (outerW - slideW) / 2;
    return -(index * slideW) + sideGap;
  }

  function goTo(index) {
    index = Math.max(0, Math.min(total - 1, index));
    current = index;

    /* Translate the track */
    track.style.transform = `translateX(${calcOffset(index)}px)`;

    /* Apply visual states to every slide */
    slides.forEach((slide, i) => {
      slide.classList.remove("is-active", "is-adjacent");
      if (i === index) slide.classList.add("is-active");
      else if (Math.abs(i - index) === 1) slide.classList.add("is-adjacent");
    });

    /* Update dots */
    dots.forEach((d, i) => {
      d.classList.toggle("active", i === index);
      d.setAttribute("aria-selected", i === index);
    });

    /* Update counter */
    if (counterEl) counterEl.textContent = index + 1;

    /* Animate skill bars in this slide once it becomes active */
    if (!animatedSlides.has(index)) {
      animatedSlides.add(index);
      setTimeout(() => {
        slides[index] &&
          slides[index].querySelectorAll(".skill-fill").forEach((bar) => {
            bar.style.width = bar.getAttribute("data-pct") + "%";
          });
      }, 200); // wait for transition to begin
    }
  }

  /* Recalculate position on resize */
  window.addEventListener("resize", () => goTo(current));

  /* Bootstrap */
  goTo(0);

  prevBtn && prevBtn.addEventListener("click", () => goTo(current - 1));
  nextBtn && nextBtn.addEventListener("click", () => goTo(current + 1));
  dots.forEach((d) =>
    d.addEventListener("click", () => goTo(+d.dataset.index)),
  );

  /* Keyboard navigation */
  document.addEventListener("keydown", (e) => {
    const focused = document.activeElement;
    if (focused && focused.closest(".skills-carousel-wrapper")) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(current - 1);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(current + 1);
      }
    }
  });

  /* Touch / swipe */
  let touchStartX = null;
  track &&
    track.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.touches[0].clientX;
      },
      { passive: true },
    );
  track &&
    track.addEventListener("touchend", (e) => {
      if (touchStartX === null) return;
      const delta = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(delta) > 40) goTo(delta > 0 ? current + 1 : current - 1);
      touchStartX = null;
    });
})();

/* ─── Projects Vertical Carousel ──────────────────────────── */
(function initProjectsCarousel() {
  const layout = document.getElementById("proj-carousel-layout");
  if (!layout) return;

  const track = document.getElementById("proj-strip-track");
  const viewport = track?.closest(".proj-strip-viewport");
  const thumbs = Array.from(document.querySelectorAll(".proj-thumb"));
  const displayCards = Array.from(
    document.querySelectorAll(".proj-display-card"),
  );
  const upBtn = document.getElementById("proj-nav-up");
  const downBtn = document.getElementById("proj-nav-down");
  const currentSpan = document.getElementById("proj-current");
  const totalSpan = document.getElementById("proj-total");

  if (!track || !viewport || thumbs.length === 0) return;

  let currentIndex = 0;
  const totalCards = thumbs.length;
  if (totalSpan) totalSpan.textContent = totalCards;

  function updateDisplay() {
    // Update display cards
    displayCards.forEach((card, idx) => {
      card.classList.remove("is-active", "is-prev", "is-next");
      if (idx === currentIndex) {
        card.classList.add("is-active");
      } else if (idx < currentIndex) {
        card.classList.add("is-prev");
      } else {
        card.classList.add("is-next");
      }
    });

    // Update thumbnails
    thumbs.forEach((thumb, idx) => {
      thumb.classList.toggle("is-active", idx === currentIndex);
      thumb.setAttribute(
        "aria-selected",
        idx === currentIndex ? "true" : "false",
      );
      thumb.setAttribute("tabindex", idx === currentIndex ? "0" : "-1");
    });

    // Update counter
    if (currentSpan) currentSpan.textContent = currentIndex + 1;

    // Scroll track to center the active thumb
    const thumbHeight = thumbs[0].offsetHeight + 20; // height + gap
    const viewportHeight = viewport.offsetHeight;
    const targetScroll =
      currentIndex * thumbHeight - (viewportHeight / 2 - thumbHeight / 2);

    track.style.transform = `translateY(${-targetScroll}px)`;

    // Emit custom event for accessibility
    layout.dispatchEvent(
      new CustomEvent("projectChanged", {
        detail: { index: currentIndex, total: totalCards },
      }),
    );
  }

  function goTo(index) {
    currentIndex = Math.max(0, Math.min(index, totalCards - 1));
    updateDisplay();
  }

  function next() {
    goTo(currentIndex + 1);
  }

  function prev() {
    goTo(currentIndex - 1);
  }

  // Event listeners
  upBtn?.addEventListener("click", prev);
  downBtn?.addEventListener("click", next);

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    const focused = document.activeElement;
    if (focused?.closest(".proj-carousel-layout")) {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        prev();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        next();
      }
    }
  });

  // Thumbnail click
  thumbs.forEach((thumb, idx) => {
    thumb.addEventListener("click", () => goTo(idx));
    thumb.addEventListener("keypress", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        goTo(idx);
      }
    });
  });

  // Wheel scroll (vertical scroll on the carousel)
  viewport?.addEventListener(
    "wheel",
    (e) => {
      const atStart = currentIndex === 0;
      const atEnd = currentIndex === totalCards - 1;

      if ((e.deltaY > 0 && !atEnd) || (e.deltaY < 0 && !atStart)) {
        e.preventDefault();
        e.deltaY > 0 ? next() : prev();
      }
    },
    { passive: false },
  );

  // Touch support for mobile
  let touchStartY = null;
  viewport?.addEventListener(
    "touchstart",
    (e) => {
      touchStartY = e.touches[0].clientY;
    },
    { passive: true },
  );

  viewport?.addEventListener(
    "touchend",
    (e) => {
      if (!touchStartY) return;
      const delta = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(delta) > 40) delta > 0 ? next() : prev();
      touchStartY = null;
    },
    { passive: true },
  );

  // Initialize display
  updateDisplay();
})();

/* ─── Skill Bars (legacy – kept for non-carousel fallback) ─── */
(function initSkillBars() {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.querySelectorAll(".skill-fill").forEach((bar) => {
            const pct = bar.getAttribute("data-pct");
            bar.style.width = pct + "%";
          });
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.3 },
  );
  document.querySelectorAll(".skill-category").forEach((el) => io.observe(el));
})();

/* ─── Animated Counters ───────────────────────────────────── */
(function initCounters() {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.querySelectorAll("[data-count]").forEach((el) => {
            const target = +el.getAttribute("data-count");
            let n = 0;
            const step = target / 60;
            const interval = setInterval(() => {
              n = Math.min(n + step, target);
              el.textContent =
                Math.floor(n) + (el.getAttribute("data-suffix") || "");
              if (n >= target) clearInterval(interval);
            }, 16);
          });
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.5 },
  );
  document.querySelectorAll(".hero-stats").forEach((el) => io.observe(el));
})();

/* ─── Contact Form ────────────────────────────────────────── */
(function initForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    btn.textContent = "SENDING…";
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = "✓ MESSAGE SENT!";
      btn.style.background = "linear-gradient(135deg, #00cc6a, #00ff88)";
      form.reset();
      setTimeout(() => {
        btn.textContent = "SEND MESSAGE";
        btn.style.background = "";
        btn.disabled = false;
      }, 3500);
    }, 1500);
  });
})();

/* ─── Cursor Glow ─────────────────────────────────────────── */
(function initCursorGlow() {
  const glow = document.getElementById("cursor-glow");
  if (!glow) return;
  window.addEventListener("mousemove", (e) => {
    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
  });
})();

/* ─── CV / Resume Holographic Modal ──────────────────────── */
(function initCVModal() {
  const openBtn = document.getElementById("about-cv-btn");
  const modal = document.getElementById("cv-modal");
  const closeBtn = document.getElementById("cv-modal-close");
  const container = modal && modal.querySelector(".cv-modal-container");
  if (!openBtn || !modal || !container) return;

  const CLOSE_DURATION = 420; // matches CSS out-animation duration (ms)

  function openModal() {
    modal.removeAttribute("hidden");
    // Re-trigger entry animation by resetting the class
    container.classList.remove("is-closing");
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }

  function closeModal() {
    container.classList.add("is-closing");
    setTimeout(() => {
      modal.setAttribute("hidden", "");
      container.classList.remove("is-closing");
      document.body.style.overflow = "";
      openBtn.focus();
    }, CLOSE_DURATION);
  }

  openBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);

  // Close on backdrop click (outside the container)
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hasAttribute("hidden")) {
      closeModal();
    }
  });
})();

/* ─── Certificate Particle Modal ──────────────────────────── */
(function initCertModal() {
  const modal = document.getElementById("cert-modal");
  const container = modal && modal.querySelector(".cert-modal-container");
  const closeBtn = document.getElementById("cert-modal-close");
  const titleEl = document.getElementById("cert-modal-title");
  const issuerEl = document.getElementById("cert-modal-issuer");
  const yearEl = document.getElementById("cert-modal-year");
  const img = document.getElementById("cert-modal-img");
  const dlBtn = document.getElementById("cert-download-btn");
  const frame = document.getElementById("cert-modal-frame");
  const canvas = document.getElementById("cert-particle-canvas");

  if (!modal || !container || !canvas) return;

  const ctx = canvas.getContext("2d");
  const CLOSE_DUR = 380;

  let animId = null;
  let sourcePixels = null;
  let iw = 0,
    ih = 0;

  function clamp01(v) {
    return Math.max(0, Math.min(1, v));
  }

  function getPixelColor(x, y) {
    if (!sourcePixels) return "rgba(0,212,255,";
    const ix = Math.floor(clamp01(x / canvas.width) * (iw - 1));
    const iy = Math.floor(clamp01(y / canvas.height) * (ih - 1));
    const off = (iy * iw + ix) * 4;
    return (
      "rgba(" +
      sourcePixels[off] +
      "," +
      sourcePixels[off + 1] +
      "," +
      sourcePixels[off + 2] +
      ","
    );
  }

  class AssembleParticle {
    constructor(tx, ty, delay) {
      this.tx = tx;
      this.ty = ty;
      this.delay = delay;
      this._init();
    }
    _init() {
      this.x = Math.random() * canvas.width;
      this.y = canvas.height + Math.random() * 100 + 30;
      this.r = Math.random() * 2.0 + 0.7;
      this.vx = (Math.random() - 0.5) * 1.5;
      this.vy = -(Math.random() * 4.5 + 2.5);
      this.life = 0;
      this.done = false;
    }
    update(f) {
      if (f < this.delay) return;
      this.life++;
      const dx = this.tx - this.x;
      const dy = this.ty - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 6) {
        this.x = this.tx;
        this.y = this.ty;
        this.done = true;
        return;
      }
      const pull = Math.min(0.18, 0.015 + (1 - dist / canvas.height) * 0.14);
      this.vx += dx * pull;
      this.vy += dy * pull;
      this.vx *= 0.87;
      this.vy *= 0.87;
      this.x += this.vx;
      this.y += this.vy;
    }
    draw(f) {
      if (f < this.delay) return;
      const col = getPixelColor(this.tx, this.ty);
      const alpha = this.done ? 0.92 : Math.min(1, this.life / 18);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = col + alpha + ")";
      ctx.fill();
    }
  }

  function buildParticles() {
    const cw = canvas.width;
    const ch = canvas.height;
    const step = Math.max(5, Math.floor(Math.min(cw, ch) / 55));
    const particles = [];
    for (let y = ch - 1; y >= 0; y -= step) {
      const rowDelay = Math.floor((y / ch) * 70);
      for (let x = 0; x < cw; x += step) {
        particles.push(
          new AssembleParticle(x + step / 2, y + step / 2, rowDelay),
        );
      }
    }
    return particles;
  }

  function rasterise(imgEl) {
    const off = document.createElement("canvas");
    iw = off.width = imgEl.naturalWidth || 800;
    ih = off.height = imgEl.naturalHeight || 600;
    const oc = off.getContext("2d");
    oc.drawImage(imgEl, 0, 0, iw, ih);
    try {
      sourcePixels = oc.getImageData(0, 0, iw, ih).data;
    } catch (e) {
      sourcePixels = null;
    }
  }

  function runAnim(particles) {
    let f = 0;
    const MAX = 220;
    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let y = 0; y < canvas.height; y += 4) {
        ctx.fillStyle = "rgba(0,212,255,0.008)";
        ctx.fillRect(0, y, canvas.width, 1);
      }
      let allDone = true;
      particles.forEach(function (p) {
        p.update(f);
        p.draw(f);
        if (!p.done) allDone = false;
      });
      f++;
      if (f < MAX && !allDone) {
        animId = requestAnimationFrame(tick);
      } else {
        img.classList.add("visible");
        canvas.style.transition = "opacity 0.65s ease";
        canvas.style.opacity = "0";
        setTimeout(function () {
          canvas.style.display = "none";
        }, 700);
      }
    }
    animId = requestAnimationFrame(tick);
  }

  function sizeCanvas() {
    const rect = frame.getBoundingClientRect();
    canvas.width = rect.width || 700;
    canvas.height = rect.height || 460;
  }

  let lastOpener = null;

  function openModal(tile) {
    lastOpener = tile;
    const title = tile.dataset.certTitle || "CERTIFICATE";
    const issuer = tile.dataset.certIssuer || "";
    const year = tile.dataset.certYear || "";
    const src = tile.dataset.certImg || "";

    titleEl.textContent = title.toUpperCase();
    issuerEl.textContent = issuer ? "// " + issuer.toUpperCase() : "";
    yearEl.textContent = year ? "VERIFIED · " + year : "VERIFIED";
    dlBtn.href = src;
    dlBtn.setAttribute("download", title.replace(/\s+/g, "_") + ".png");

    img.classList.remove("visible");
    img.src = "";
    canvas.style.display = "block";
    canvas.style.opacity = "1";
    canvas.style.transition = "";
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }

    modal.removeAttribute("hidden");
    container.classList.remove("is-closing");
    document.body.style.overflow = "hidden";

    requestAnimationFrame(function () {
      sizeCanvas();
      frame.classList.remove("no-image");

      if (!src) {
        frame.classList.add("no-image");
        closeBtn.focus();
        return;
      }

      const loader = new Image();
      loader.crossOrigin = "anonymous";
      loader.onload = function () {
        img.src = loader.src;
        rasterise(loader);
        runAnim(buildParticles());
      };
      loader.onerror = function () {
        sourcePixels = null;
        frame.classList.add("no-image");
        runAnim(buildParticles());
      };
      loader.src = src;
      closeBtn.focus();
    });
  }

  function closeModal() {
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
    container.classList.add("is-closing");
    setTimeout(function () {
      modal.setAttribute("hidden", "");
      container.classList.remove("is-closing");
      document.body.style.overflow = "";
      if (lastOpener) lastOpener.focus();
    }, CLOSE_DUR);
  }

  document.querySelectorAll(".cert-tile").forEach(function (tile) {
    tile.addEventListener("click", function () {
      openModal(tile);
    });
    tile.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openModal(tile);
      }
    });
  });

  closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", function (e) {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.hasAttribute("hidden")) closeModal();
  });
})();
