/* ============================================================
   LENIS.JS — Smooth scroll setup using Lenis
   You Can't Tell · Campaign Site · 2026

   Initialises Lenis for buttery smooth scrolling and
   integrates with GSAP's ScrollTrigger via the shared ticker.
   ============================================================ */

/**
 * Initialise Lenis smooth scroll.
 * Exposes the instance on window.lenisInstance for other modules.
 */
function initLenis() {
  // Lenis constructor — @studio-freight/lenis@1.0.42
  const lenis = new Lenis({
    duration: 1.15,
    easing: function (t) {
      // Expo ease out — snappy start, smooth finish
      return Math.min(1, 1.001 - Math.pow(2, -10 * t));
    },
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1.0,
    smoothTouch: false,
    touchMultiplier: 2.0,
    infinite: false,
  });

  // Keep GSAP ScrollTrigger positions in sync with Lenis scroll pos
  lenis.on('scroll', function () {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.update();
    }
  });

  // Hook Lenis RAF into GSAP's ticker so they share one rAF loop.
  // This prevents jitter between Lenis and GSAP animations.
  if (typeof gsap !== 'undefined') {
    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });
    // Disable lag smoothing so GSAP doesn't compensate for Lenis delays
    gsap.ticker.lagSmoothing(0);
  } else {
    // Fallback RAF loop when GSAP isn't available
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  return lenis;
}

// Initialise and expose globally so other modules can call
// lenis.scrollTo(), lenis.stop(), lenis.start() etc.
window.lenisInstance = initLenis();
