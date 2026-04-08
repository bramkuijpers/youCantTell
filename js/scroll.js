/* ============================================================
   SCROLL.JS — GSAP ScrollTrigger animations
   You Can't Tell · Campaign Site · 2026

   All scroll-driven animations live here.
   Requires GSAP and ScrollTrigger to be loaded first.
   Lenis integration is handled in lenis.js via gsap.ticker.
   ============================================================ */

/* ------------------------------------------------------------------
   INIT SCROLL TRIGGERS
   Called from main.js after DOM + libraries are ready.
   ------------------------------------------------------------------ */
function initScrollAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('[scroll.js] GSAP or ScrollTrigger not loaded.');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Stagger the hero title lines on page load (no scroll needed)
  animateHeroTitle();

  // Reveal animations for all .reveal / .reveal-left / .reveal-right
  initRevealObserver();

  // Parallax on hero background text
  animateHeroBgText();

  // Draw SVG lines when they enter view
  initLineDraw();

  // Nav scroll state
  initNavScrollState();

  // Scroll progress bar (updated via Lenis or scroll event)
  initScrollProgress();
}

/* ------------------------------------------------------------------
   HERO TITLE ENTRANCE
   Staggered drop-in for each title line on initial page load.
   ------------------------------------------------------------------ */
function animateHeroTitle() {
  var lines = document.querySelectorAll('.hero__title-line');
  if (!lines.length) return;

  gsap.fromTo(
    lines,
    { opacity: 0, y: 60, skewY: 2 },
    {
      opacity: 1,
      y: 0,
      skewY: 0,
      duration: 1.1,
      ease: 'power4.out',
      stagger: 0.12,
      delay: 0.2,
    }
  );

  // Hero eyebrow and subtitle fade in after lines
  var heroExtras = document.querySelectorAll('.hero__eyebrow, .hero__subtitle, .hero__scroll-indicator');
  gsap.fromTo(
    heroExtras,
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.1,
      delay: 0.65,
    }
  );
}

/* ------------------------------------------------------------------
   REVEAL OBSERVER
   Uses IntersectionObserver (not ScrollTrigger) for .reveal elements
   so it works cleanly with Lenis and respects CSS transition delays.
   Exposed as window.initRevealObserver so quiz.js can call it after
   re-rendering cards.
   ------------------------------------------------------------------ */
function initRevealObserver() {
  var elements = document.querySelectorAll(
    '.reveal:not(.is-visible), .reveal-left:not(.is-visible), .reveal-right:not(.is-visible)'
  );

  if (!elements.length) return;

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    {
      root: null,
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.12,
    }
  );

  elements.forEach(function (el) {
    observer.observe(el);
  });
}

// Expose globally for quiz.js reset
window.initRevealObserver = initRevealObserver;

/* ------------------------------------------------------------------
   HERO PARALLAX
   The large "AI" background text moves at half scroll speed.
   ------------------------------------------------------------------ */
function animateHeroBgText() {
  var bgText = document.querySelector('.hero__bg-text');
  if (!bgText) return;

  gsap.to(bgText, {
    y: '-30%',
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1.5,
    },
  });
}

/* ------------------------------------------------------------------
   SVG LINE DRAW
   Animates .line-draw paths when they scroll into view.
   JS sets the dasharray dynamically from the path's total length.
   ------------------------------------------------------------------ */
function initLineDraw() {
  var paths = document.querySelectorAll('.line-draw');

  paths.forEach(function (path) {
    var length = 200; // safe fallback for simple lines/arrows

    // Try to get the real path length (SVGGeometryElement API)
    try {
      if (path.getTotalLength) {
        length = path.getTotalLength();
      }
    } catch (e) { /* no-op */ }

    // Set initial draw state via GSAP
    gsap.set(path, {
      strokeDasharray: length,
      strokeDashoffset: length,
    });

    // Animate on scroll
    gsap.to(path, {
      strokeDashoffset: 0,
      duration: 1.2,
      ease: 'power3.inOut',
      scrollTrigger: {
        trigger: path,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });
  });
}

/* ------------------------------------------------------------------
   NAV SCROLL STATE
   Adds .is-scrolled class to nav once user scrolls past hero.
   ------------------------------------------------------------------ */
function initNavScrollState() {
  var nav = document.getElementById('mainNav');
  if (!nav) return;

  ScrollTrigger.create({
    trigger: '#hero',
    start: 'bottom top+=60',
    onEnter:      function () { nav.classList.add('is-scrolled'); },
    onLeaveBack:  function () { nav.classList.remove('is-scrolled'); },
  });
}

/* ------------------------------------------------------------------
   SCROLL PROGRESS BAR
   Updates the fixed top bar width as user scrolls.
   Uses Lenis scroll event if available, falls back to window scroll.
   ------------------------------------------------------------------ */
function initScrollProgress() {
  var bar = document.getElementById('scrollProgress');
  if (!bar) return;

  function updateProgress(scrollY) {
    var docH    = document.documentElement.scrollHeight - window.innerHeight;
    var pct     = docH > 0 ? (scrollY / docH) * 100 : 0;
    bar.style.width = Math.min(pct, 100) + '%';
  }

  // Prefer Lenis scroll event for frame-perfect sync
  if (window.lenisInstance) {
    window.lenisInstance.on('scroll', function (e) {
      updateProgress(e.scroll);
    });
  } else {
    window.addEventListener('scroll', function () {
      updateProgress(window.scrollY);
    }, { passive: true });
  }
}

/* ------------------------------------------------------------------
   STAT BLOCK DOT MATRIX ANIMATION
   Fades dots in sequentially for the 76% visualisation.
   ------------------------------------------------------------------ */
function animateDotMatrix() {
  var dots = document.querySelectorAll('.stat-block__dot');
  if (!dots.length) return;

  ScrollTrigger.create({
    trigger: '.stat-block',
    start: 'top 70%',
    once: true,
    onEnter: function () {
      dots.forEach(function (dot, i) {
        setTimeout(function () {
          dot.style.opacity = '1';
          dot.style.transform = 'scale(1)';
        }, i * 8);
      });
    },
  });
}

/* ------------------------------------------------------------------
   TIMELINE LINE DRAW
   The horizontal timeline line draws in from left to right.
   ------------------------------------------------------------------ */
function animateTimelineLine() {
  var line = document.querySelector('.timeline__line');
  if (!line) return;

  gsap.fromTo(
    line,
    { scaleX: 0, transformOrigin: 'left center' },
    {
      scaleX: 1,
      duration: 1.4,
      ease: 'power3.inOut',
      scrollTrigger: {
        trigger: '.timeline',
        start: 'top 70%',
        toggleActions: 'play none none none',
      },
    }
  );
}

/* ------------------------------------------------------------------
   GAP SECTION — number scale-in
   The two large numbers scale in from slightly smaller on scroll.
   ------------------------------------------------------------------ */
function animateGapNumbers() {
  var numbers = document.querySelectorAll('.gap-number');
  if (!numbers.length) return;

  gsap.fromTo(
    numbers,
    { scale: 0.85, opacity: 0 },
    {
      scale: 1,
      opacity: 1,
      duration: 1.0,
      ease: 'power4.out',
      stagger: 0.15,
      scrollTrigger: {
        trigger: '.gap-comparison',
        start: 'top 65%',
        toggleActions: 'play none none none',
      },
    }
  );
}

/* ------------------------------------------------------------------
   SECTION ENTRANCE MARKERS
   Subtle horizontal line that sweeps across section headers.
   ------------------------------------------------------------------ */
function animateSectionMarkers() {
  var markers = document.querySelectorAll('.section__eyebrow::before');
  // CSS pseudo-elements can't be targeted by JS directly —
  // the CSS animation handles the ::before width via transition.
  // This function is a placeholder if custom targets are added.
}

/* ------------------------------------------------------------------
   AUTO INIT
   ------------------------------------------------------------------ */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function () {
    // Short delay to let Lenis and other modules initialise first
    setTimeout(function () {
      initScrollAnimations();
      animateDotMatrix();
      animateTimelineLine();
      animateGapNumbers();
    }, 100);
  });
} else {
  setTimeout(function () {
    initScrollAnimations();
    animateDotMatrix();
    animateTimelineLine();
    animateGapNumbers();
  }, 100);
}
