/* ============================================================
   COUNTUP.JS — Number countup animations triggered on scroll
   You Can't Tell · Campaign Site · 2026

   Uses IntersectionObserver to watch for .stat-number elements
   entering the viewport, then animates the number from 0 to its
   data-target value over a configurable duration.
   ============================================================ */

/** Ease-out cubic function — decelerates toward the end */
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Animate a single number element from 0 to its target.
 *
 * @param {HTMLElement} el      - The element containing the number text
 * @param {number}      target  - Final numeric value
 * @param {number}      duration - Animation duration in ms (default 1600)
 * @param {number}      decimals - Decimal places to display (default 0)
 */
function animateCountUp(el, target, duration, decimals) {
  duration = duration || 1600;
  decimals = decimals || 0;

  var startTime = null;
  var startValue = 0;

  function step(timestamp) {
    if (!startTime) startTime = timestamp;

    var elapsed  = timestamp - startTime;
    var progress = Math.min(elapsed / duration, 1);
    var eased    = easeOutCubic(progress);
    var current  = startValue + (target - startValue) * eased;

    // Format and display
    el.textContent = decimals > 0
      ? current.toFixed(decimals)
      : Math.floor(current).toString();

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      // Ensure exact final value
      el.textContent = decimals > 0
        ? target.toFixed(decimals)
        : Math.round(target).toString();
    }
  }

  requestAnimationFrame(step);
}

/**
 * Set up IntersectionObserver for all .stat-number elements.
 * Each element must have:
 *   data-target   — numeric target value (e.g. "76" or "5.8")
 *   data-decimals — optional decimal places (e.g. "1")
 *
 * Once triggered the element gets the class .has-counted so it
 * won't re-animate on repeated scroll.
 */
function initCountUp() {
  var elements = document.querySelectorAll('.stat-number');

  if (!elements.length) return;

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        var el       = entry.target;
        var target   = parseFloat(el.getAttribute('data-target') || '0');
        var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);

        // Guard: only count up once
        if (el.classList.contains('has-counted')) return;
        el.classList.add('has-counted');

        animateCountUp(el, target, 1600, decimals);
        observer.unobserve(el);
      });
    },
    {
      root: null,
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.2,
    }
  );

  elements.forEach(function (el) {
    observer.observe(el);
  });
}

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCountUp);
} else {
  initCountUp();
}
