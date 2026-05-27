// ============================================================
//  E-Portfolio – Jezreel David  |  main.js
// ============================================================

// background part
/* ─── Particle System ─────────────────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById("particle-canvas");
  if (!canvas) return;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const coarsePointer = window.matchMedia("(hover: none), (pointer: coarse)");
  if (reducedMotion.matches) return;
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
    const densityDivisor = coarsePointer.matches ? 18000 : 12000;
    const maxCount = coarsePointer.matches ? 70 : 120;
    const count = Math.min(Math.floor((W * H) / densityDivisor), maxCount);
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
    if (!coarsePointer.matches) drawConnections();
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
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const coarsePointer = window.matchMedia("(hover: none), (pointer: coarse)");
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
    const dynamicCount = coarsePointer.matches ? 200 : pixelConfig.count;
    const total = Math.min(
      dynamicCount,
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

  if (pixelCanvas && pixelCtx && !reducedMotion.matches) {
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
  }, reducedMotion.matches ? 1200 : coarsePointer.matches ? 2400 : 3200);
})();

/* ─── Navbar ─────────────────────────────────────────────── */
(function initNavbar() {
  const navbar = document.getElementById("navbar");
  const toggle = document.getElementById("nav-toggle");
  const links = document.getElementById("nav-links");
  if (!navbar || !links || !toggle) return;
  let lastFocusedElement = null;

  function isMobileMenuMode() {
    return window.innerWidth <= 768;
  }

  function getMenuFocusableItems() {
    return Array.from(
      links.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])'),
    ).filter((el) => !el.hasAttribute("disabled"));
  }

  window.addEventListener("scroll", () => {
    if (window.scrollY > 60) navbar.classList.add("scrolled");
    else navbar.classList.remove("scrolled");
  }, { passive: true });

  function setNavOpen(isOpen) {
    if (!links || !toggle) return;
    const wasOpen = links.classList.contains("open");
    links.classList.toggle("open", isOpen);
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    document.body.classList.toggle("nav-open", isOpen);
    navbar.classList.toggle("menu-active", isOpen);

    if (isOpen && !wasOpen) {
      lastFocusedElement =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      const firstMenuItem = getMenuFocusableItems()[0];
      window.requestAnimationFrame(() => firstMenuItem?.focus());
    }

    if (!isOpen && wasOpen && lastFocusedElement) {
      window.requestAnimationFrame(() => lastFocusedElement?.focus());
    }
  }

  toggle.addEventListener("click", () => {
    setNavOpen(!links.classList.contains("open"));
  });

  // Close mobile nav on link click
  links.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => setNavOpen(false));
  });

  // Close menu when resizing to desktop
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) setNavOpen(false);
  });

  // Close on outside click when mobile menu is open
  document.addEventListener("click", (e) => {
    if (
      links.classList.contains("open") &&
      !links.contains(e.target) &&
      !toggle.contains(e.target)
    ) {
      setNavOpen(false);
    }
  });

  // Close menu with Escape for accessibility
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && links.classList.contains("open")) {
      setNavOpen(false);
      toggle.focus();
    }

    // Trap keyboard focus inside the mobile menu while it is open.
    if (e.key === "Tab" && links.classList.contains("open") && isMobileMenuMode()) {
      const focusables = getMenuFocusableItems();
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // Active section highlighting
  const sections = document.querySelectorAll("section[id]");

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
  window.addEventListener("scroll", updateActive, { passive: true });
  updateActive();
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
  const wrapper = track && track.closest(".skills-carousel-wrapper");
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
  let isFirstRender = true;
  let sectionVisible = false;

  /* Slide width ratio matches CSS breakpoints */
  function getSlideWidthRatio() {
    if (window.innerWidth <= 360) return 0.96;
    if (window.innerWidth <= 480) return 0.94;
    if (window.innerWidth <= 768) return 0.86;
    if (window.innerWidth <= 1024) return 0.55;
    return 0.42;
  }

  /* ── Pixel offset so the active slide sits centred in the viewport ── */
  function calcOffset(index) {
    if (!trackOuter || !slides.length) return 0;
    const outerW = trackOuter.clientWidth;
    const firstSlide = slides[0];
    // Use layout width (offsetWidth) instead of getBoundingClientRect()
    // so transform/scale doesn't make the centering math drift on mobile.
    const measuredSlideW = firstSlide?.offsetWidth || 0;
    const ratio = getSlideWidthRatio();
    const fallbackSlideW = Math.min(outerW * ratio, ratio >= 0.88 ? outerW : 420);
    const slideW = measuredSlideW || fallbackSlideW;
    const sideGap = (outerW - slideW) / 2;
    return -(index * slideW) + sideGap;
  }

  /* Animate the skill bars of a given slide */
  function animateBars(index) {
    if (animatedSlides.has(index)) return;
    animatedSlides.add(index);

    const slide = slides[index];
    if (!slide) return;

    /* Reset all bars to 0% and force a reflow so the browser
       registers the starting width before we animate to the target. */
    const bars = slide.querySelectorAll(".skill-fill");
    bars.forEach((bar) => {
      bar.style.transition = "none";
      bar.style.width = "0%";
    });
    void slide.offsetWidth;               // force reflow

    /* Re-enable the CSS transition and animate to target width */
    setTimeout(() => {
      bars.forEach((bar) => {
        bar.style.transition = "width 1.5s cubic-bezier(0.4, 0, 0.2, 1)";
        bar.style.width = bar.getAttribute("data-pct") + "%";
      });
    }, 80); // tiny delay so the reflow above is painted
  }

  /* The smooth transition applied when navigating between slides */
  const TRACK_TRANSITION = "transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)";

  function goTo(index) {
    index = Math.max(0, Math.min(total - 1, index));
    current = index;

    /*
     * On the very first render, suppress the transition so the track
     * snaps into its starting position instantly (no animation flash).
     */
    if (isFirstRender) {
      track.style.transition = "none";
      track.style.transform = `translateX(${calcOffset(index)}px)`;
      // Force reflow so the browser paints the "none" state
      void track.offsetWidth;
      // Restore transition for all future navigations
      track.style.transition = TRACK_TRANSITION;
      isFirstRender = false;
    } else {
      // Explicitly set the smooth transition before updating the transform
      track.style.transition = TRACK_TRANSITION;
      track.style.transform = `translateX(${calcOffset(index)}px)`;
    }

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

    /* Update navigation button visibility */
    if (prevBtn) prevBtn.classList.toggle("is-disabled", index === 0);
    if (nextBtn) nextBtn.classList.toggle("is-disabled", index === total - 1);

    /*
     * Only animate skill bars once the section has scrolled into view.
     * This ensures the user actually sees the fill animation.
     */
    if (sectionVisible) {
      animateBars(index);
    }
  }

  /* ── Intersection Observer: animate bars when the section scrolls in ── */
  if (wrapper) {
    const sectionIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !sectionVisible) {
            sectionVisible = true;
            animateBars(current); // animate whichever slide is active
            sectionIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 },
    );
    sectionIO.observe(wrapper);
  }

  /* Recalculate position on resize (no transition flash) */
  window.addEventListener("resize", () => {
    track.style.transition = "none";
    track.style.transform = `translateX(${calcOffset(current)}px)`;
    void track.offsetWidth;
    track.style.transition = TRACK_TRANSITION;
  }, { passive: true });

  /* Bootstrap – snap to slide 0 without animation */
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

  /* Touch / swipe – drag-follow-finger interaction
     The card tracks the user's finger in real time while dragging,
     then snaps to the nearest slide on release.
     Also supports pointer events (mouse drag) for touchscreen laptops. */
  let touchStartX = null;
  let touchStartY = null;
  let isDragging = false;
  let dragOffset = 0;        // live pixel offset while dragging
  let baseOffset = 0;        // the translateX value when the drag started
  let touchStartTime = 0;    // timestamp for velocity calculation
  const SWIPE_THRESHOLD = 25; // min px to count as intentional swipe

  function onTouchStart(e) {
    if (!e.touches || e.touches.length === 0) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchStartTime = Date.now();
    isDragging = false;
    dragOffset = 0;
    baseOffset = calcOffset(current);
    // Kill the CSS transition so the track follows the finger instantly
    track.style.transition = "none";
  }

  function onTouchMove(e) {
    if (touchStartX === null || !e.touches || e.touches.length === 0) return;
    const dx = e.touches[0].clientX - touchStartX;
    const dy = e.touches[0].clientY - touchStartY;

    // Decide on first significant movement whether this is a horizontal drag
    if (!isDragging && Math.abs(dx) > 6) {
      // Only hijack if mostly horizontal
      if (Math.abs(dx) > Math.abs(dy) * 1.2) {
        isDragging = true;
        track.classList.add("is-dragging");
      } else {
        // Vertical scroll – bail out entirely
        touchStartX = null;
        touchStartY = null;
        return;
      }
    }

    if (!isDragging) return;

    // Prevent vertical page scroll while dragging carousel
    e.preventDefault();

    // Apply rubber-band resistance at the edges
    let rawOffset = dx;
    if ((current === 0 && dx > 0) || (current === total - 1 && dx < 0)) {
      rawOffset = dx * 0.3; // rubber-band feel
    }

    dragOffset = rawOffset;
    track.style.transform = `translateX(${baseOffset + dragOffset}px)`;
  }

  function onTouchEnd(e) {
    if (touchStartX === null) return;

    track.classList.remove("is-dragging");

    // Calculate velocity for momentum-based swiping
    const elapsed = Date.now() - touchStartTime;
    const velocity = Math.abs(dragOffset) / Math.max(elapsed, 1);
    const isQuickFlick = velocity > 0.3 && Math.abs(dragOffset) > 12;

    if (isDragging && (Math.abs(dragOffset) > SWIPE_THRESHOLD || isQuickFlick)) {
      // Determine direction – negative dragOffset = swiped left = next
      if (dragOffset < 0) {
        goTo(current + 1);
      } else {
        goTo(current - 1);
      }
    } else {
      // Snap back – restore transition and go to current slide
      track.style.transition = TRACK_TRANSITION;
      track.style.transform = `translateX(${calcOffset(current)}px)`;
    }

    touchStartX = null;
    touchStartY = null;
    isDragging = false;
    dragOffset = 0;
  }

  function attachSwipeListeners(el) {
    if (!el) return;
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchEnd, { passive: true });
  }

  attachSwipeListeners(track);
  attachSwipeListeners(trackOuter);

  /* ── Pointer events (mouse drag) for desktop touchscreens ── */
  let pointerDown = false;
  let pointerStartX = 0;

  function onPointerDown(e) {
    if (e.pointerType === "touch") return; // already handled by touch events
    pointerDown = true;
    pointerStartX = e.clientX;
    touchStartTime = Date.now();
    isDragging = false;
    dragOffset = 0;
    baseOffset = calcOffset(current);
    track.style.transition = "none";
    track.classList.add("is-dragging");
    track.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    if (!pointerDown || e.pointerType === "touch") return;
    const dx = e.clientX - pointerStartX;

    if (!isDragging && Math.abs(dx) > 6) {
      isDragging = true;
    }
    if (!isDragging) return;

    let rawOffset = dx;
    if ((current === 0 && dx > 0) || (current === total - 1 && dx < 0)) {
      rawOffset = dx * 0.3;
    }

    dragOffset = rawOffset;
    track.style.transform = `translateX(${baseOffset + dragOffset}px)`;
    e.preventDefault();
  }

  function onPointerUp(e) {
    if (!pointerDown || e.pointerType === "touch") return;
    pointerDown = false;
    track.classList.remove("is-dragging");

    const elapsed = Date.now() - touchStartTime;
    const velocity = Math.abs(dragOffset) / Math.max(elapsed, 1);
    const isQuickFlick = velocity > 0.3 && Math.abs(dragOffset) > 12;

    if (isDragging && (Math.abs(dragOffset) > SWIPE_THRESHOLD || isQuickFlick)) {
      if (dragOffset < 0) goTo(current + 1);
      else goTo(current - 1);
    } else {
      track.style.transition = TRACK_TRANSITION;
      track.style.transform = `translateX(${calcOffset(current)}px)`;
    }

    isDragging = false;
    dragOffset = 0;
  }

  if (track) {
    track.addEventListener("pointerdown", onPointerDown);
    track.addEventListener("pointermove", onPointerMove);
    track.addEventListener("pointerup", onPointerUp);
    track.addEventListener("pointercancel", onPointerUp);
    // Prevent default drag behavior on images/links inside the carousel
    track.addEventListener("dragstart", (e) => e.preventDefault());
  }
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

  const horizontalMq = window.matchMedia("(max-width: 1024px)");

  function isHorizontalStrip() {
    return horizontalMq.matches;
  }

  let currentIndex = 0;
  const totalCards = thumbs.length;
  if (totalSpan) totalSpan.textContent = totalCards;

  // Swap chevron icons based on horizontal/vertical mode
  function updateNavIcons() {
    const upIcon = upBtn?.querySelector("i");
    const downIcon = downBtn?.querySelector("i");
    if (isHorizontalStrip()) {
      if (upIcon) { upIcon.className = "fa-solid fa-chevron-left"; }
      if (downIcon) { downIcon.className = "fa-solid fa-chevron-right"; }
      if (upBtn) upBtn.setAttribute("aria-label", "Previous project");
      if (downBtn) downBtn.setAttribute("aria-label", "Next project");
    } else {
      if (upIcon) { upIcon.className = "fa-solid fa-chevron-up"; }
      if (downIcon) { downIcon.className = "fa-solid fa-chevron-down"; }
      if (upBtn) upBtn.setAttribute("aria-label", "Previous project");
      if (downBtn) downBtn.setAttribute("aria-label", "Next project");
    }
  }

  function updateDisplay() {
    // Update nav icons for horizontal/vertical mode
    updateNavIcons();

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

    // Update navigation button visibility
    if (upBtn) upBtn.hidden = currentIndex === 0;
    if (downBtn) downBtn.hidden = currentIndex === totalCards - 1;

    // Scroll track to center the active thumb
    const trackStyles = window.getComputedStyle(track);
    const gap = parseFloat(trackStyles.gap) || 0;
    if (isHorizontalStrip()) {
      const thumbWidth = thumbs[0].offsetWidth + gap;
      const viewportWidth = viewport.offsetWidth;
      const targetScrollRaw =
        currentIndex * thumbWidth - (viewportWidth / 2 - thumbWidth / 2);
      const maxScroll = Math.max(0, track.scrollWidth - viewportWidth);
      const targetScroll = Math.max(0, Math.min(targetScrollRaw, maxScroll));
      track.style.transform = `translateX(${-targetScroll}px)`;
    } else {
      const thumbHeight = thumbs[0].offsetHeight + gap;
      const viewportHeight = viewport.offsetHeight;
      const targetScrollRaw =
        currentIndex * thumbHeight - (viewportHeight / 2 - thumbHeight / 2);
      const maxScroll = Math.max(0, track.scrollHeight - viewportHeight);
      const targetScroll = Math.max(0, Math.min(targetScrollRaw, maxScroll));
      track.style.transform = `translateY(${-targetScroll}px)`;
    }

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
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
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

  // Wheel scroll on the carousel strip
  viewport?.addEventListener(
    "wheel",
    (e) => {
      const atStart = currentIndex === 0;
      const atEnd = currentIndex === totalCards - 1;
      const delta = isHorizontalStrip() ? e.deltaX || e.deltaY : e.deltaY;

      if ((delta > 0 && !atEnd) || (delta < 0 && !atStart)) {
        e.preventDefault();
        delta > 0 ? next() : prev();
      }
    },
    { passive: false },
  );

  // Touch support for mobile
  let touchStart = null;
  viewport?.addEventListener(
    "touchstart",
    (e) => {
      touchStart = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    },
    { passive: true },
  );

  viewport?.addEventListener(
    "touchend",
    (e) => {
      if (!touchStart) return;
      const dx = touchStart.x - e.changedTouches[0].clientX;
      const dy = touchStart.y - e.changedTouches[0].clientY;

      if (isHorizontalStrip()) {
        if (Math.abs(dx) > 40) dx > 0 ? next() : prev();
      } else if (Math.abs(dy) > 40) {
        dy > 0 ? next() : prev();
      }
      touchStart = null;
    },
    { passive: true },
  );

  horizontalMq.addEventListener("change", updateDisplay);
  window.addEventListener("resize", updateDisplay, { passive: true });

  // Initialize display
  updateDisplay();
})();

/* ─── Skill Bars ──────────────────────────────────────────── */
/* NOTE: Legacy initSkillBars() removed – the skills-carousel
   animateBars() handler now exclusively drives the fill animation.
   Keeping both caused all bars to jump to 100% instantly on scroll,
   preventing the visible fill transition. */

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
    if (!btn) return;
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

/* ─── Footer Year ─────────────────────────────────────────── */
(function initFooterYear() {
  const yearEl = document.getElementById("footer-year");
  if (!yearEl) return;
  yearEl.textContent = String(new Date().getFullYear());
})();

/* ─── Cursor Glow ─────────────────────────────────────────── */
(function initCursorGlow() {
  const glow = document.getElementById("cursor-glow");
  if (!glow) return;

  const prefersNoHover = window.matchMedia("(hover: none), (pointer: coarse)");
  if (prefersNoHover.matches) {
    glow.style.display = "none";
    return;
  }

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
    document.body.classList.add("modal-open");
    closeBtn.focus();
  }

  function closeModal() {
    container.classList.add("is-closing");
    setTimeout(() => {
      modal.setAttribute("hidden", "");
      container.classList.remove("is-closing");
      document.body.classList.remove("modal-open");
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
    document.body.classList.add("modal-open");

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
      document.body.classList.remove("modal-open");
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
