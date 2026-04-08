/* ============================================================
   QUIZ.JS — Quiz state management and reveal logic
   You Can't Tell · Campaign Site · 2026

   Each card shows two buttons: "Real Photo" and "AI Generated".
   The user must guess before the answer is revealed.
   Score only increments on a correct guess.
   ============================================================ */

/* ------------------------------------------------------------------
   QUIZ DATA
   isAI: true  → AI-generated image
   isAI: false → real photograph
   ------------------------------------------------------------------ */
var QUIZ_DATA = [
  {
    id: 1,
    src: 'assets/images/aigif1.gif',
    caption: 'Portrait in low light',
    isAI: true,
    reveal: 'AI Generated',
    note: 'The skin texture is unnaturally smooth and the chiaroscuro lighting is too perfectly dramatic for a candid shot.',
  },
  {
    id: 2,
    src: 'assets/images/aigif2.gif',
    caption: 'Burger close-up',
    isAI: false,
    reveal: 'Real Photo',
    note: 'Natural depth of field, authentic food styling, and organic imperfections in the sesame seeds and lettuce edges.',
  },
  {
    id: 3,
    src: 'assets/images/aigif3.gif',
    caption: 'Subway station',
    isAI: true,
    reveal: 'AI Generated',
    note: 'The motion blur pattern and noise distribution are inconsistent with real long-exposure photography.',
  },
  {
    id: 4,
    src: 'assets/images/aigif4.gif',
    caption: 'Bowl on wooden surface',
    isAI: false,
    reveal: 'Real Photo',
    note: 'The ceramic glaze, natural wood grain variation, and ambient light reflection are all authentically captured.',
  },
  {
    id: 5,
    src: 'assets/images/aigif5.gif',
    caption: 'Chickens in a field',
    isAI: true,
    reveal: 'AI Generated',
    note: 'The feather detail and grass blades show characteristic AI generation artifacts — too sharp, too even.',
  },
  {
    id: 6,
    src: 'assets/images/aigif6.gif',
    caption: 'Dartboard close-up',
    isAI: true,
    reveal: 'AI Generated',
    note: 'The wire dividers are impossibly uniform and the cork texture is too perfect. No real board looks this pristine.',
  },
];

/* ------------------------------------------------------------------
   QUIZ STATE
   ------------------------------------------------------------------ */
var quizState = {
  current:   0,
  score:     0,
  answers:   [],   // { id, guessedAI, isAI, correct }
  total:     QUIZ_DATA.length,
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
   SCORE MESSAGE
   Based on correct guesses out of 6.
   ------------------------------------------------------------------ */
function getScoreMessage(score) {
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
   Cards show the image + two guess buttons. No click-to-reveal —
   the user must pick Real or AI first.
   ------------------------------------------------------------------ */
function renderQuizGrid() {
  if (!quizGrid) return;

  quizGrid.innerHTML = '';

  QUIZ_DATA.forEach(function (item, index) {
    var card = document.createElement('div');
    card.className = 'quiz-card reveal reveal--delay-' + Math.min(index + 1, 4);
    card.setAttribute('role', 'listitem');
    card.setAttribute('data-id', item.id);

    card.innerHTML =
      '<div class="quiz-card__inner">' +

        // FRONT — image + guess buttons
        '<div class="quiz-card__front">' +
          '<img src="' + item.src + '" alt="' + item.caption + '" loading="lazy" />' +
          '<div class="quiz-card__caption">' + item.caption + '</div>' +
          '<div class="quiz-card__buttons">' +
            '<button class="quiz-btn quiz-btn--real" data-guess="real" aria-label="Guess: Real photo">📷 Real</button>' +
            '<button class="quiz-btn quiz-btn--ai"   data-guess="ai"   aria-label="Guess: AI generated">🤖 AI</button>' +
          '</div>' +
        '</div>' +

        // BACK — answer reveal (shown after guess)
        '<div class="quiz-card__back quiz-card__back--' + (item.isAI ? 'ai' : 'real') + '">' +
          '<div class="quiz-card__correctness" id="correctness-' + item.id + '"></div>' +
          '<div class="quiz-card__result-icon" aria-hidden="true">' + (item.isAI ? '🤖' : '📷') + '</div>' +
          '<div class="quiz-card__result-label">' + item.reveal + '</div>' +
          '<div class="quiz-card__result-note">' + item.note + '</div>' +
        '</div>' +

      '</div>';

    // Bind guess buttons
    var buttons = card.querySelectorAll('.quiz-btn');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation(); // prevent card-level listeners
        var guessedAI = btn.getAttribute('data-guess') === 'ai';
        handleGuess(card, item, guessedAI);
      });
    });

    quizGrid.appendChild(card);
  });
}

/* ------------------------------------------------------------------
   HANDLE GUESS
   Called when the user clicks Real or AI on a card.
   Reveals the answer, marks correct/wrong, updates score.
   ------------------------------------------------------------------ */
function handleGuess(card, item, guessedAI) {
  // Guard: already answered
  if (card.classList.contains('is-answered')) return;

  var correct = (guessedAI === item.isAI);

  // Record answer
  quizState.answers.push({
    id:        item.id,
    guessedAI: guessedAI,
    isAI:      item.isAI,
    correct:   correct,
  });

  if (correct) quizState.score++;
  quizState.current++;

  // Show correct/wrong badge on the card back
  var badge = card.querySelector('#correctness-' + item.id);
  if (badge) {
    badge.textContent  = correct ? '✓ Correct' : '✗ Wrong';
    badge.className    = 'quiz-card__correctness quiz-card__correctness--' + (correct ? 'correct' : 'wrong');
  }

  // Flip card to reveal answer
  card.classList.add('is-answered', 'is-revealed');
  card.setAttribute('aria-label', item.caption + ' — ' + item.reveal + '. ' + (correct ? 'You got it right.' : 'You got it wrong.'));

  // Update live score
  updateLiveScore();

  // All cards answered → show result
  if (quizState.answers.length === quizState.total) {
    setTimeout(showResult, 700);
  }
}

/* ------------------------------------------------------------------
   UPDATE LIVE SCORE
   Shows "X correct / Y answered" in the score bar.
   ------------------------------------------------------------------ */
function updateLiveScore() {
  if (quizScoreLive) {
    var answered = quizState.answers.length;
    quizScoreLive.textContent = quizState.score + ' correct — ' + answered + ' / ' + quizState.total + ' revealed';
  }
}

/* ------------------------------------------------------------------
   SHOW RESULT
   Displays final score panel with comparison to survey average.
   ------------------------------------------------------------------ */
function showResult() {
  quizState.completed = true;

  if (!quizResult) return;

  var score    = quizState.score;
  var outOf10  = Math.round((score / 6) * 10 * 10) / 10; // normalised to /10
  var pctWidth = Math.round((score / 6) * 100);

  if (quizScoreValue) quizScoreValue.textContent = score;
  if (quizMessage)    quizMessage.textContent     = getScoreMessage(score);
  if (quizYouValue)   quizYouValue.textContent    = outOf10 + '/10';

  quizResult.style.display = 'block';
  quizResult.classList.add('is-visible');

  // Animate bars after short delay
  setTimeout(function () {
    if (quizYouBar) quizYouBar.style.width = pctWidth + '%';

    var avgBar = document.getElementById('quizAvgBar');
    if (avgBar) avgBar.style.width = '58%';
  }, 400);

  // Scroll to result
  if (window.lenisInstance) {
    window.lenisInstance.scrollTo(quizResult, { offset: -80, duration: 1 });
  } else {
    quizResult.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/* ------------------------------------------------------------------
   RESET QUIZ
   ------------------------------------------------------------------ */
function resetQuiz() {
  quizState.current   = 0;
  quizState.score     = 0;
  quizState.answers   = [];
  quizState.completed = false;

  if (quizResult) {
    quizResult.style.display = 'none';
    quizResult.classList.remove('is-visible');
  }

  if (quizScoreLive) quizScoreLive.textContent = '0 / 6';
  if (quizYouBar)    quizYouBar.style.width     = '0%';

  var avgBar = document.getElementById('quizAvgBar');
  if (avgBar) avgBar.style.width = '0%';

  renderQuizGrid();

  if (typeof initRevealObserver === 'function') {
    initRevealObserver();
  }

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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initQuiz);
} else {
  initQuiz();
}
