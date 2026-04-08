/* ============================================================
   MAIN.JS — Entry point, initialises all modules
   You Can't Tell · Campaign Site · 2026

   Load order in index.html:
     lenis.js → countup.js → quiz.js → charts.js → scroll.js → main.js

   This file handles:
     - DOM-ready orchestration
     - Timeline section rendering
     - Dot matrix rendering (stat section)
     - Share button
     - Anchor link smooth scroll
     - Any cross-module setup that doesn't belong elsewhere
   ============================================================ */

/* ------------------------------------------------------------------
   TIMELINE DATA
   Peak AI prediction — rendered as a horizontal timeline in Section 7.
   ------------------------------------------------------------------ */
var TIMELINE_DATA = [
  { label: 'Now',         pct: 5,  dominant: false },
  { label: '1–2 Years',   pct: 47, dominant: true  },
  { label: '3–5 Years',   pct: 29, dominant: false },
  { label: 'Never',       pct: 18, dominant: false },
];

/* ------------------------------------------------------------------
   RENDER TIMELINE
   Builds the horizontal peak-prediction timeline in Section 7.
   ------------------------------------------------------------------ */
function renderTimeline() {
  var nodesContainer  = document.getElementById('timelineNodes');
  if (!nodesContainer) return;

  TIMELINE_DATA.forEach(function (item) {
    var node = document.createElement('div');
    node.className = 'timeline__node' + (item.dominant ? ' timeline__node--dominant' : '');

    node.innerHTML =
      '<div class="timeline__node-pct">' + item.pct + '%</div>' +
      '<div class="timeline__node-dot" aria-hidden="true"></div>' +
      '<div class="timeline__node-label">' + item.label + '</div>';

    nodesContainer.appendChild(node);
  });
}

/* ------------------------------------------------------------------
   RENDER DOT MATRIX
   100 dots — 76 highlighted (purple) and 24 dim — for the key stat.
   ------------------------------------------------------------------ */
function renderDotMatrix() {
  var container = document.querySelector('.stat-block__dots');
  if (!container) return;

  var total     = 100;
  var filled    = 76;

  for (var i = 0; i < total; i++) {
    var dot = document.createElement('div');
    dot.className = 'stat-block__dot' + (i >= filled ? ' stat-block__dot--empty' : '');
    // Stagger opacity reveal via inline delay (driven by animateDotMatrix in scroll.js)
    dot.style.opacity = '0';
    dot.style.transform = 'scale(0.5)';
    dot.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    container.appendChild(dot);
  }
}

/* ------------------------------------------------------------------
   SHARE BUTTON
   Uses Web Share API if available; falls back to clipboard copy.
   ------------------------------------------------------------------ */
function initShareButton() {
  var btn = document.getElementById('shareBtn');
  if (!btn) return;

  btn.addEventListener('click', function () {
    var shareData = {
      title: "You Can't Tell",
      text: '76% of people have had to correct someone sharing fake AI content. Could you tell the difference?',
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData).catch(function () {
        // User cancelled or API failed — silent fail
      });
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href).then(function () {
        var original = btn.querySelector('span') || btn;
        var oldText  = original.textContent;
        original.textContent = 'Link copied!';
        btn.style.opacity = '0.75';
        setTimeout(function () {
          original.textContent = oldText;
          btn.style.opacity = '1';
        }, 2200);
      }).catch(function () {
        // Clipboard API not available
        console.warn('[main.js] Could not copy to clipboard.');
      });
    }
  });
}

/* ------------------------------------------------------------------
   SMOOTH ANCHOR LINKS
   Any <a href="#id"> uses Lenis scrollTo for smooth navigation.
   ------------------------------------------------------------------ */
function initAnchorLinks() {
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var targetId = link.getAttribute('href');
      if (targetId === '#') return;

      var target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      if (window.lenisInstance) {
        window.lenisInstance.scrollTo(target, { offset: -80, duration: 1.2 });
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ------------------------------------------------------------------
   KEYBOARD NAVIGATION — skip to main content
   ------------------------------------------------------------------ */
function initSkipLink() {
  var skip = document.getElementById('skipLink');
  if (!skip) return;

  skip.addEventListener('click', function (e) {
    e.preventDefault();
    var main = document.getElementById('hero');
    if (main) main.focus();
  });
}

/* ------------------------------------------------------------------
   DOM READY — orchestrate all initialisations
   ------------------------------------------------------------------ */
function onDOMReady() {
  // Render dynamic content first (before scroll/countup observers)
  renderTimeline();
  renderDotMatrix();

  // Bind UI interactions
  initShareButton();
  initAnchorLinks();
  initSkipLink();

  // Initialise charts (Chart.js)
  if (typeof window.initCharts === 'function') {
    window.initCharts();
  }

  // Refresh ScrollTrigger after all layout is complete
  setTimeout(function () {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  }, 400);

  // Log readiness
  console.info(
    '%cYou Can\'t Tell%c — Campaign site loaded.',
    'font-family:serif;font-size:18px;font-weight:bold;',
    'font-size:12px;color:#888580;'
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', onDOMReady);
} else {
  onDOMReady();
}
