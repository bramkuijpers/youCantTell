/* ============================================================
   CHARTS.JS — Chart.js initialisations for all data visualisations
   You Can't Tell · Campaign Site · 2026

   Four charts total:
     1. platformTrustChart  — horizontal bar (platform distrust %)
     2. scoreDistChart      — vertical bar (quiz score distribution)
     3. aiLimitChart        — donut (AI content attitude)
     4. platformAIChart     — vertical bar (platform AI perception)
   ============================================================ */

/* ------------------------------------------------------------------
   GLOBAL CHART.JS DEFAULTS
   Dark theme: no borders, cold accent colors, muted gridlines.
   ------------------------------------------------------------------ */
function applyChartDefaults() {
  if (typeof Chart === 'undefined') return;

  Chart.defaults.color            = '#888580';
  Chart.defaults.borderColor      = 'rgba(255,255,255,0.06)';
  Chart.defaults.font.family      = "'Inter', system-ui, sans-serif";
  Chart.defaults.font.size        = 12;
  Chart.defaults.plugins.legend.display = false;
  Chart.defaults.plugins.tooltip.backgroundColor = '#1a1a1a';
  Chart.defaults.plugins.tooltip.titleColor       = '#F0EDE8';
  Chart.defaults.plugins.tooltip.bodyColor        = '#888580';
  Chart.defaults.plugins.tooltip.borderColor      = 'rgba(255,255,255,0.1)';
  Chart.defaults.plugins.tooltip.borderWidth      = 1;
  Chart.defaults.plugins.tooltip.padding          = 12;
  Chart.defaults.plugins.tooltip.cornerRadius     = 2;
  Chart.defaults.animation.duration               = 1200;
  Chart.defaults.animation.easing                 = 'easeOutCubic';
}

/* ------------------------------------------------------------------
   COLOUR PALETTE
   ------------------------------------------------------------------ */
var COLORS = {
  purple:     '#7B6FE8',
  blue:       '#4A9EF5',
  purpleDim:  'rgba(123, 111, 232, 0.4)',
  blueDim:    'rgba(74, 158, 245, 0.4)',
  muted:      'rgba(255,255,255,0.12)',
  mutedLight: 'rgba(255,255,255,0.18)',
  grid:       'rgba(255,255,255,0.05)',
};

/* ------------------------------------------------------------------
   1. PLATFORM TRUST CHART
   Horizontal bar — which platform do people trust LEAST?
   Data: TikTok 61%, X 24%, Instagram 5%, WhatsApp 5%, YouTube 5%
   ------------------------------------------------------------------ */
function initPlatformTrustChart() {
  var canvas = document.getElementById('platformTrustChart');
  if (!canvas) return;

  var labels = ['TikTok', 'X (Twitter)', 'Instagram', 'WhatsApp', 'YouTube'];
  var data   = [61, 24, 5, 5, 5];

  // Gradient bar colours — dominant bar is accent purple, rest are dim
  var barColors = data.map(function (v) {
    return v === Math.max.apply(null, data) ? COLORS.purple : COLORS.purpleDim;
  });

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: barColors,
        borderWidth: 0,
        borderRadius: 2,
        borderSkipped: false,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { right: 20 } },
      scales: {
        x: {
          grid:  { color: COLORS.grid, drawTicks: false },
          ticks: { callback: function (v) { return v + '%'; }, maxTicksLimit: 6 },
          border: { display: false },
          max: 75,
        },
        y: {
          grid:  { display: false },
          ticks: { font: { size: 13 }, color: '#888580' },
          border: { display: false },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function (ctx) {
              return ' ' + ctx.parsed.x + '% named this platform';
            },
          },
        },
      },
    },
  });
}

/* ------------------------------------------------------------------
   2. SCORE DISTRIBUTION CHART
   Vertical bar — how many respondents scored each value?
   Data: 2→16%, 3→26%, 4→13%, 5→32%, 6→11%, 7→3%
   ------------------------------------------------------------------ */
function initScoreDistChart() {
  var canvas = document.getElementById('scoreDistChart');
  if (!canvas) return;

  var labels = ['2', '3', '4', '5', '6', '7'];
  var data   = [16, 26, 13, 32, 11, 3];

  // Highlight the average-adjacent bars (5 is the peak)
  var barColors = data.map(function (v) {
    return v === Math.max.apply(null, data) ? COLORS.blue : COLORS.blueDim;
  });

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: barColors,
        borderWidth: 0,
        borderRadius: 2,
        borderSkipped: false,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid:  { display: false },
          ticks: { color: '#888580', font: { size: 12 } },
          border: { display: false },
          title: {
            display: true,
            text: 'Score out of 7',
            color: '#444240',
            font: { size: 11 },
          },
        },
        y: {
          grid:  { color: COLORS.grid, drawTicks: false },
          ticks: { callback: function (v) { return v + '%'; }, maxTicksLimit: 5 },
          border: { display: false },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function (ctx) {
              return ' ' + ctx.parsed.y + '% of respondents';
            },
          },
        },
      },
    },
  });
}

/* ------------------------------------------------------------------
   3. AI CONTENT LIMIT DONUT CHART
   Attitude toward AI content — what limits do people want?
   Data:
     "As long as it is labeled, everything is fine" → 47%
     "Entertainment is allowed, news never"         → 26%
     "I just don't want to see it at all"           → 13%
     "I haven't set a limit yet"                    → 13%
   ------------------------------------------------------------------ */
function initAiLimitChart() {
  var canvas = document.getElementById('aiLimitChart');
  if (!canvas) return;

  var labels = [
    'Labeled is fine',
    'Entertainment only',
    "Don't want it",
    'No limit set',
  ];

  var data       = [47, 26, 13, 13];
  var bgColors   = [COLORS.purple, COLORS.blue, 'rgba(123,111,232,0.45)', 'rgba(74,158,245,0.35)'];

  new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: bgColors,
        borderWidth: 0,
        hoverOffset: 8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (ctx) {
              return ' ' + ctx.parsed + '% — ' + ctx.label;
            },
          },
        },
      },
    },
  });

  // Render custom legend
  buildChartLegend('aiLimitLegend', labels, data, bgColors);
}

/* ------------------------------------------------------------------
   4. PLATFORM AI CONTENT CHART
   Vertical bar — which platform has the most AI content?
   Data: TikTok 61%, X 16%, Instagram 13%, Facebook 5%
   ------------------------------------------------------------------ */
function initPlatformAIChart() {
  var canvas = document.getElementById('platformAIChart');
  if (!canvas) return;

  var labels = ['TikTok', 'X', 'Instagram', 'Facebook'];
  var data   = [61, 16, 13, 5];

  var barColors = data.map(function (v) {
    return v === Math.max.apply(null, data) ? COLORS.purple : COLORS.purpleDim;
  });

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: barColors,
        borderWidth: 0,
        borderRadius: 2,
        borderSkipped: false,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid:  { display: false },
          ticks: { color: '#888580', font: { size: 12 } },
          border: { display: false },
        },
        y: {
          grid:  { color: COLORS.grid, drawTicks: false },
          ticks: { callback: function (v) { return v + '%'; }, maxTicksLimit: 5 },
          border: { display: false },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function (ctx) {
              return ' ' + ctx.parsed.y + '% associate this platform with AI content';
            },
          },
        },
      },
    },
  });
}

/* ------------------------------------------------------------------
   BUILD CHART LEGEND
   Creates accessible custom legend items for donut charts.
   ------------------------------------------------------------------ */
function buildChartLegend(containerId, labels, data, colors) {
  var container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';

  labels.forEach(function (label, i) {
    var item = document.createElement('div');
    item.className = 'chart-legend__item';
    item.setAttribute('role', 'listitem');

    var swatch = document.createElement('span');
    swatch.className = 'chart-legend__swatch';
    swatch.style.background = colors[i];
    swatch.setAttribute('aria-hidden', 'true');

    var text = document.createElement('span');
    text.textContent = label + ' — ' + data[i] + '%';

    item.appendChild(swatch);
    item.appendChild(text);
    container.appendChild(item);
  });
}

/* ------------------------------------------------------------------
   INIT ALL CHARTS
   Called once from main.js after DOM is ready.
   Charts are only initialised when their canvas elements exist.
   ------------------------------------------------------------------ */
function initCharts() {
  if (typeof Chart === 'undefined') {
    console.warn('[charts.js] Chart.js not loaded — skipping chart init.');
    return;
  }

  applyChartDefaults();
  initPlatformTrustChart();
  initScoreDistChart();
  initAiLimitChart();
  initPlatformAIChart();
}

// Expose for main.js
window.initCharts = initCharts;
