/* ============================================================
   Project Detail Page – Interactivity & Animations
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  initVideoPlayer();
  initScrollReveal();
  initGallery();
  initComparisonSlider();
  updateActiveNavLink();
});

// ─── Video Player ─────────────────────────────────────
function initVideoPlayer() {
  const videos = document.querySelectorAll(".hero-video-wrap video");
  const playButton = document.querySelector(".play-button");

  if (playButton && videos.length > 0) {
    playButton.addEventListener("click", () => {
      const video = videos[0];
      video.play();
      playButton.classList.add("hidden");
    });

    videos.forEach((video) => {
      video.addEventListener("play", () => {
        playButton?.classList.add("hidden");
      });
    });
  }
}

// ─── Scroll Reveal Animation ───────────────────────────
function initScrollReveal() {
  const revealElements = document.querySelectorAll("[data-reveal]");

  if (!("IntersectionObserver" in window)) {
    revealElements.forEach((el) => el.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
  );

  revealElements.forEach((el) => observer.observe(el));
}

// ─── Gallery Lightbox ────────────────────────────────
function initGallery() {
  const galleryItems = document.querySelectorAll(".gallery-item");

  galleryItems.forEach((item) => {
    item.addEventListener("click", () => {
      const img = item.querySelector("img");
      openLightbox(img.src, img.alt);
    });
  });
}

function openLightbox(src, alt) {
  const lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.innerHTML = `
    <span class="lightbox-close">&times;</span>
    <img src="${src}" alt="${alt}" class="lightbox-image" />
  `;

  document.body.appendChild(lightbox);

  const closeBtn = lightbox.querySelector(".lightbox-close");
  closeBtn.addEventListener("click", () => lightbox.remove());
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) lightbox.remove();
  });
}

// ─── Comparison Slider ────────────────────────────────
function initComparisonSlider() {
  const sliders = document.querySelectorAll(".comparison-slider");

  sliders.forEach((slider) => {
    const handle = slider.querySelector(".comparison-handle");
    if (!handle) return;

    let isActive = false;

    handle.addEventListener("mousedown", () => {
      isActive = true;
    });

    document.addEventListener("mouseup", () => {
      isActive = false;
    });

    document.addEventListener("mousemove", (e) => {
      if (!isActive) return;

      const sliderRect = slider.getBoundingClientRect();
      const x = e.clientX - sliderRect.left;

      if (x >= 0 && x <= sliderRect.width) {
        const percentage = (x / sliderRect.width) * 100;
        handle.style.left = percentage + "%";
      }
    });

    // Touch support
    handle.addEventListener("touchstart", () => {
      isActive = true;
    });

    document.addEventListener("touchend", () => {
      isActive = false;
    });

    document.addEventListener("touchmove", (e) => {
      if (!isActive) return;

      const sliderRect = slider.getBoundingClientRect();
      const x = e.touches[0].clientX - sliderRect.left;

      if (x >= 0 && x <= sliderRect.width) {
        const percentage = (x / sliderRect.width) * 100;
        handle.style.left = percentage + "%";
      }
    });
  });
}

// ─── Update Active Navigation Link ────────────────────
function updateActiveNavLink() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll(".header-nav a");

  navLinks.forEach((link) => {
    if (link.getAttribute("href") === currentPath) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

// ─── Smooth scroll to sections ─────────────────────────
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// ─── Back button functionality ───────────────────────
const backBtn = document.querySelector(".back-btn");
if (backBtn) {
  backBtn.addEventListener("click", () => {
    window.history.back();
  });
}
