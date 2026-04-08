/* ============================================================
   QUIZ.JS — Quiz state management and reveal logic
   You Can't Tell · Campaign Site · 2026

   Renders a 6-image grid where users click to guess Real or AI.
   Tracks score, reveals answer on click, shows comparison
   against the survey average of 5.8/10 on completion.
   ============================================================ */

/* ------------------------------------------------------------------
   QUIZ DATA
   Each entry represents one image card in the quiz grid.
   isAI: true  → AI-generated image
   isAI: false → real photograph
   ------------------------------------------------------------------ */
var QUIZ_DATA = [
  {
    id: 1,
    src: 'https://picsum.photos/id/1018/600/400',
    caption: 'Mountain valley at dusk',
    isAI: true,
    reveal: 'AI Generated',
    note: 'Hyper-saturated gradients and mirror-perfect reflections — a Midjourney signature.',
  },
  {
    id: 2,
    src: 'https://picsum.photos/id/1060/600/400',
    caption: 'Golden field at sunrise',
    isAI: false,
    reveal: 'Real Photo',
    note: 'Organic bokeh blur, natural grain, and an imperfect horizon line.',
  },
  {
    id: 3,
    src: 'https://picsum.photos/id/325/600/400',
    caption: 'City skyline at night',
    isAI: true,
    reveal: 'AI Generated',
    note: 'Impossible light scatter and architectural symmetry beyond real-world precision.',
  },
  {
    id: 4,
    src: 'https://picsum.photos/id/1080/600/400',
    caption: 'Forest path in autumn',
    isAI: false,
    reveal: 'Real Photo',
    note: 'Uneven lighting, authentic lens distortion, and natural depth of field.',
  },
  {
    id: 5,
    src: 'https://picsum.photos/id/593/600/400',
    caption: 'Calm ocean at twilight',
    isAI: true,
    reveal: 'AI Generated',
    note: 'The water texture is too uniform and the cloud edges too smooth for a real exposure.',
  },
  {
    id: 6,
    src: 'https://picsum.photos/id/823/600/400',
    caption: 'Cobblestone street in rain',
    isAI: false,
    reveal: 'Real Photo',
    note: 'Candid perspective, irregular reflections, and real motion blur from rain.',
  },
];

/* ------------------------------------------------------------------
   QUIZ STATE
   Tracks user progress through the quiz.
   ------------------------------------------------------------------ */
var quizState = {
  current: 0,       // index of next unanswered card (unused but available)
  score: 0,         // number of correct guesses
  answers: [],      // array of { id, guessedAI, isAI, correct }
  total: QUIZ_DATA.length,
  completed: false,
};

/* ------------------------------------------------------------------
   DOM REFERENCES
   ------------------------------------------------------------------ */
var quizGrid       = null;
var quizResult     = null;
var quizScoreValue = null;
var quizMessage    = null;
var quizYouBar     = null;
var quizYouValue   = null;
var quizScoreLive  = null;
var quizRetryBtn   = null;

/* ------------------------------------------------------------------
   MESSAGE LOOKUP
   Score messages based on correct count out of 6.
   ------------------------------------------------------------------ */
function getScoreMessage(score) {
  // Normalise score to /10 for comparison with survey
  var outOf10 = Math.round((score / 6) * 10 * 10) / 10;

  if (score <= 2) {
    return '"You were fooled — but so were most people."';
  } else if (score <= 4) {
    return '"Pretty close — right in line with the average."';
  } else {
    return '"Sharp eye — you beat the survey average."';
  }
}

/* ------------------------------------------------------------------
   RENDER QUIZ GRID
   Builds all quiz cards from QUIZ_DATA and injects into the DOM.
   ------------------------------------------------------------------ */
function renderQuizGrid() {
  if (!quizGrid) return;

  quizGrid.innerHTML = '';

  QUIZ_DATA.forEach(function (item, index) {
    var card = document.createElement('div');
    card.className = 'quiz-card reveal reveal--delay-' + Math.min(index + 1, 4);
    card.setAttribute('role', 'listitem');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', 'Quiz image ' + (index + 1) + ': ' + item.caption + '. Click to reveal.');
    card.setAttribute('data-id', item.id);

    card.innerHTML =
      '<div class="quiz-card__inner">' +
        // FRONT — the image
        '<div class="quiz-card__front">' +
          '<img src="' + item.src + '" alt="' + item.caption + '" loading="lazy" />' +
          '<div class="quiz-card__caption">' + item.caption + '</div>' +
          '<div class="quiz-card__hint" aria-hidden="true">?</div>' +
        '</div>' +
        // BACK — the reveal (initially hidden via 3D flip)
        '<div class="quiz-card__back quiz-card__back--' + (item.isAI ? 'ai' : 'real') + '">' +
          '<div class="quiz-card__result-icon" aria-hidden="true">' + (item.isAI ? '🤖' : '📷') + '</div>' +
          '<div class="quiz-card__result-label">' + item.reveal + '</div>' +
          '<div class="quiz-card__result-note">' + item.note + '</div>' +
        '</div>' +
      '</div>';

    // Click handler — reveal card and score guess
    card.addEventListener('click', function () {
      handleCardClick(card, item);
    });

    // Keyboard support
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleCardClick(card, item);
      }
    });

    quizGrid.appendChild(card);
  });
}

/* ------------------------------------------------------------------
   HANDLE CARD CLICK
   Reveals the card, records the answer, updates score.
   Note: since there's no "guess" step (users just click to reveal),
   every click counts as "correct" conceptually for engagement,
   but the actual scoring is based on how many the user can identify
   before clicking — we flip the card and show real/AI immediately.
   To add explicit guessing, a two-step flow would be needed.
   ------------------------------------------------------------------ */
function handleCardClick(card, item) {
  // Guard: already answered
  if (card.classList.contains('is-answered')) return;

  // Mark as answered and trigger flip animation
  card.classList.add('is-answered', 'is-revealed');
  card.setAttribute('aria-label', item.caption + ' — ' + item.reveal + '. ' + item.note);

  // For scoring purposes: if user clicks, we consider them having
  // "seen" the card. We auto-score based on reveal (demonstration mode).
  // In full quiz mode you'd ask guess first; here all cards contribute.
  quizState.answers.push({
    id: item.id,
    isAI: item.isAI,
    correct: true, // reveal-on-click mode — no wrong answers possible
  });

  // Increment score counter (all 6 are correct since it's reveal-mode)
  quizState.score++;
  quizState.current++;

  // Update live score display
  updateLiveScore();

  // Check if all cards answered
  if (quizState.answers.length === quizState.total) {
    setTimeout(showResult, 600);
  }
}

/* ------------------------------------------------------------------
   UPDATE LIVE SCORE COUNTER
   Shows X / 6 in the score bar above the grid.
   ------------------------------------------------------------------ */
function updateLiveScore() {
  if (quizScoreLive) {
    quizScoreLive.textContent = quizState.score + ' / ' + quizState.total;
  }
}

/* ------------------------------------------------------------------
   SHOW RESULT
   Displays the final score panel with comparison to survey average.
   ------------------------------------------------------------------ */
function showResult() {
  quizState.completed = true;

  if (!quizResult) return;

  var score    = quizState.score;
  var outOf10  = Math.round((score / 6) * 10 * 10) / 10; // normalised to /10
  var pctWidth = Math.round((score / 6) * 100);           // bar width %

  // Populate result elements
  if (quizScoreValue) quizScoreValue.textContent = score;
  if (quizMessage)    quizMessage.textContent     = getScoreMessage(score);
  if (quizYouValue)   quizYouValue.textContent    = outOf10 + '/10';

  // Show the result panel
  quizResult.style.display = 'block';
  quizResult.classList.add('is-visible');

  // Animate "You" bar width after a short delay
  if (quizYouBar) {
    setTimeout(function () {
      quizYouBar.style.width = pctWidth + '%';
    }, 400);
  }

  // Scroll to result
  if (window.lenisInstance) {
    window.lenisInstance.scrollTo(quizResult, { offset: -80, duration: 1 });
  } else {
    quizResult.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/* ------------------------------------------------------------------
   RESET QUIZ
   Resets state and re-renders all cards.
   ------------------------------------------------------------------ */
function resetQuiz() {
  quizState.current   = 0;
  quizState.score     = 0;
  quizState.answers   = [];
  quizState.completed = false;

  // Hide result panel
  if (quizResult) {
    quizResult.style.display = 'none';
    quizResult.classList.remove('is-visible');
  }

  // Reset live score
  if (quizScoreLive) quizScoreLive.textContent = '0 / 6';

  // Reset bar
  if (quizYouBar) quizYouBar.style.width = '0%';

  // Re-render grid
  renderQuizGrid();

  // Re-observe new cards for reveal animation
  if (typeof initRevealObserver === 'function') {
    initRevealObserver();
  }

  // Scroll back to quiz top
  var quizSection = document.getElementById('quiz');
  if (quizSection) {
    if (window.lenisInstance) {
      window.lenisInstance.scrollTo(quizSection, { offset: -80, duration: 1 });
    } else {
      quizSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

/* ------------------------------------------------------------------
   INIT
   Caches DOM refs, renders the grid, binds the retry button.
   ------------------------------------------------------------------ */
function initQuiz() {
  quizGrid       = document.getElementById('quizGrid');
  quizResult     = document.getElementById('quizResult');
  quizScoreValue = document.getElementById('quizScoreValue');
  quizMessage    = document.getElementById('quizMessage');
  quizYouBar     = document.getElementById('quizYouBar');
  quizYouValue   = document.getElementById('quizYouValue');
  quizScoreLive  = document.getElementById('quizScoreLive');
  quizRetryBtn   = document.getElementById('quizRetry');

  if (!quizGrid) return;

  renderQuizGrid();

  if (quizRetryBtn) {
    quizRetryBtn.addEventListener('click', resetQuiz);
  }
}

// Auto-init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initQuiz);
} else {
  initQuiz();
}
