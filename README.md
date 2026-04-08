# You Can't Tell

A scroll-driven campaign website about AI-generated content on social media.
Built as a student research project at Fontys ICT, March–April 2026.

## Project structure

```
you-cant-tell/
├── index.html              # Main page — all sections scaffolded here
├── css/
│   ├── reset.css           # Modern CSS reset / normalize
│   ├── style.css           # CSS variables, base styles, typography, layout
│   ├── animations.css      # GSAP + CSS animation classes (.reveal, .line-draw, etc.)
│   └── components.css      # Reusable components: quiz, charts, stat cards, timeline
├── js/
│   ├── lenis.js            # Smooth scroll setup (Lenis + GSAP ticker integration)
│   ├── countup.js          # IntersectionObserver-driven number countup animations
│   ├── quiz.js             # Quiz state management and card reveal logic
│   ├── charts.js           # Chart.js initialisations for all 4 data charts
│   ├── scroll.js           # GSAP ScrollTrigger animations
│   └── main.js             # Entry point — orchestrates all modules
├── data/
│   └── results.json        # Survey results (38 respondents)
├── assets/
│   ├── fonts/              # Local font files (optional — Google Fonts CDN used by default)
│   ├── images/             # Quiz images (real vs AI)
│   └── icons/              # SVG icons
└── README.md
```

## Running locally

No build tools required. Open `index.html` directly in a browser, or serve
with any static file server:

```bash
# Python
python -m http.server 8080

# Node (npx)
npx serve .

# VS Code
# Use the Live Server extension
```

## Tech stack

| Library        | Version  | Purpose                        |
|----------------|----------|--------------------------------|
| Lenis          | 1.0.42   | Smooth scroll                  |
| GSAP           | 3.12.5   | Scroll-triggered animations    |
| ScrollTrigger  | 3.12.5   | GSAP scroll plugin             |
| Chart.js       | 4.4.2    | Data visualisations            |

All dependencies loaded via CDN — no install step needed.

## Page sections

1. **Hero** — Full-viewport serif headline with scroll indicator
2. **Key Stat** — Animated 76% countup with dot-matrix visualisation
3. **The Gap** — 4.0 self-assessed vs 5.8 actual quiz score
4. **Platform Trust** — Horizontal bar chart (TikTok 61% distrust)
5. **Real or AI?** — Interactive 6-image quiz with flip reveal
6. **Findings** — Score distribution, AI limit attitudes, platform AI perception
7. **Peak Prediction** — Horizontal timeline of AI trajectory opinions
8. **Call to Action** — Key takeaway + share button

## Survey data

- **38 respondents**, Fontys ICT, March–April 2026
- Average self-assessed score: **4.0/10**
- Average actual quiz score: **5.8/10**
- 76% have had to correct someone sharing fake content
- 61% distrust TikTok most for authentic content
- 47% are fine with AI content as long as it's labeled

Full dataset: `data/results.json`
