# E-Portfolio — Jezreel David
## BSIT Graduate · Jose Rizal University

---

### 📁 Project Structure
```
E-Portfolio_JezreelDavid/
├── index.html                  ← Main portfolio page
├── README.md                   ← This file
└── assets/
    ├── css/
    │   └── style.css           ← All styles (high-tech dark theme)
    ├── js/
    │   └── main.js             ← Animations, particles, interactions
    └── images/
        ├── profile-placeholder.png   ← REPLACE with your photo
        ├── hero-bg.png               ← Hero section background
        ├── project-1.png             ← REPLACE with project screenshot
        ├── project-2.png             ← REPLACE with project screenshot
        └── project-3.png             ← REPLACE with project screenshot
```

---

### 🚀 How to View
1. Double-click `index.html` to open in your browser, **or**
2. Right-click `index.html` → Open with → Your preferred browser

No build tools or server required — pure HTML, CSS, and JavaScript.

---

### ✏️ How to Customize

#### Replace Placeholder Photos
| Image | Where in HTML | What to replace |
|-------|---------------|-----------------|
| `assets/images/profile-placeholder.png` | `#hero-profile-img` | Your actual headshot |
| `assets/images/profile-placeholder.png` | `#about-profile-img` | About section headshot |
| `assets/images/project-1.png` | `#project1-img` | Capstone project screenshot |
| `assets/images/project-2.png` | `#project2-img` | Web project screenshot |
| `assets/images/project-3.png` | `#project3-img` | Network project screenshot |

#### Update Personal Info
Open `index.html` and search for these placeholders to update:
- `jezreel.david@email.com` → your real email
- `+63 9XX XXX XXXX` → your phone number
- `linkedin.com/in/jezreeldavid` → your LinkedIn URL
- Social link `href="#"` values → your actual profile URLs
- Project GitHub & Live Demo `href="#"` → your real links
- Skill percentages (the `data-pct="XX"` values) → adjust to your actual levels
- Graduation year `2020 – 2024` → your actual year range

#### Add/Edit Projects
Copy one `<article class="project-card …">` block inside the `.projects-grid` div.

#### Download CV Button
Set the `href` of `#about-cv-btn` to your CV PDF file path, e.g.:
```html
<a href="assets/Jezreel_David_CV.pdf" class="btn btn-outline" id="about-cv-btn" download>
```

---

### 🎨 Color Palette (CSS Variables in `style.css`)
| Variable | Value | Usage |
|----------|-------|-------|
| `--primary` | `#00d4ff` | Cyan – primary accent |
| `--accent` | `#7b2fff` | Purple – secondary accent |
| `--accent2` | `#00ff88` | Green – highlights |
| `--bg-base` | `#050a14` | Dark navy background |

---

### 📚 Tech Stack Used
- **HTML5** — Semantic structure
- **Vanilla CSS3** — Animations, glassmorphism, responsive grid
- **Vanilla JavaScript** — Particle system, typewriter, scroll-reveal
- **Font Awesome 6** — Icons (CDN)
- **Google Fonts** — Orbitron, Rajdhani, Share Tech Mono

---

*Built with ❤️ — Jose Rizal University BSIT*
