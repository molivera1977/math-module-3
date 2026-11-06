/* ═══════════════════════════════════════════════════════
   MATH MODULE 2 REVIEW AND TEST · script.js
   One site for the review AND the test (Marcos 10/9: "combine the
   Reviews and Tests on the same site … separate them just like the
   practice and quiz sites"). Engine = copy of the Rounding Review and
   Quiz - Numberline Edition (math-rounding-quiz-2): steps on one start
   screen, a part banner on every question, one open/closed flag per part.
   THE PARTS — same names on every math site (Marcos 10/10: "keep the same
   terminology across all our math tests and quizzes. Practice A, Practice B,
   Review, and Test"), plus a Warm-Up in front (Marcos 10/15, after the first day of Practice A:
   "can we create an easier version than Practice A to help teach and prepare students for
   Practice A?" — "a mandatory read aloud listen with a worked example then step by step and an
   easier Practice A", 70% to move on):
     PRE-WARM-UP         form Z  (Marcos 11/6) for a student whose Warm-Up came out below 9 of 12: four short lessons the
                                 Warm-Up's way (equal groups, the times number, share, two steps), dots in groups for pictures,
                                 8 scored; shows after a finished Warm-Up; required once before the next Warm-Up; locked once passed
     Step 1  WARM-UP     form W  per skill: a worked example the student must hear to the end, a problem worked one place at a time
                                 (steps, NOT scored), then easier questions (12, scored); in order; unlimited; 70% opens Practice A
     Step 2  PRACTICE A  form P  smaller numbers, in order, problem in columns, hints read aloud by themselves, word help; unlimited; 70% opens Practice B
     Step 3  PRACTICE B  form A  test-level questions with hints and word help; unlimited; 70% opens the Review
     Step 4  REVIEW      form B  test-level, no hints, no word help; two times (a third needs the Teacher PIN); 70% opens the Test
     Step 5  TEST        form T  one attempt, right/wrong only, then locked · form U = the retake (new numbers, Teacher PIN)
   The form letters, ids (P01… A01… B01… T01… U01…) and game keys did not change when the
   parts were renamed on 10/10 (Practice → Practice A, Review A → Practice B, Review B → Review,
   Test A → Test), so saved sessions and sheet rows from before still fit.
   - Practice B, Review and Test ask the same 17 kinds of question in the same slots, so the
     dashboard compares them skill by skill. (The "is the estimate reasonable?" kind was
     removed 10/10; Practice A has its own 18.)
   Help for students who are stuck (Marcos 10/10), none of it on the tests:
   - PRACTICE A (form P) — an easy Step 1: in order, the problem already in
     columns, a hint on every question, as many tries as they like
   - a wrong answer in Practice A, Practice B and the Review NAMES THE MISTAKE (each wrong choice carries the slip it
     stands for: data `slips`)
   - TRY ONE LIKE IT — after a miss in Practice B / the Review the student gets one more
     question of the same kind (twin_x.js / twin_y.js); it never changes the score
   - WORD HELP — a button under the question for each math word in it (data/words.js);
     Practice A and Practice B only
   Game keys mod3z-prewarmup (Pre-Warm-Up) / mod3w-warmup (Warm-Up) / mod3-practice (Practice A) / mod3a-review (Practice B) / mod3b-review (Review) /
   mod3t-test (Test) / mod3u-test (retake), storage prefix mm3_. Pictures live in visuals.js.
   PIN: 9377 (Teacher override)
═══════════════════════════════════════════════════════ */

/* ── CONFIG ─────────────────────────────────────────── */
// Each part opens on its own. false = students locked out of that part;
// Teacher Access still works. Set true to open.
const SHARE_MODE    = !!window.SHARE_MODE;   // set by share.js — a visitor's link, never a student's
const WARM_UP_OPEN    = true;    // Step 1 · Warm-Up — watch, step by step, then easier questions
const PRACTICE_A_OPEN = true;    // Step 2 · Practice A — the hints read themselves aloud
const PRACTICE_B_OPEN = true;    // Step 3 · Practice B — hints and word help (Module 3: Warm-Up + Practice A open first, Marcos 11/3; Practice B opened 11/5)
const REVIEW_OPEN     = true;    // Step 4 · Review — no hints, no word help (the last stop before the test; opened 11/5)
const TEST_OPEN       = true;    // Step 5 · Test — official (its retake needs the Teacher PIN; opened 11/5)
// THE GATES — Marcos 10/10: "Let's make Practice A and B unlimited, Review requires completing
// Practice A and Practice B and a 70% on Practice B, Test requires 70 % on Review."
//   Warm-Up, Practice A, Practice B  as many times as they like
//   Practice A opens after a Warm-Up with 70% or better (Marcos 10/15: "they too should need a 70 %") —
//     9 of its 12 scored questions; a student who already passed Practice A keeps it open
//   Practice B opens after a Practice A with 70% or better (Marcos 10/11: "yes, add it") — 12 of 17 in Module 3
//   Review   opens after a finished Practice A + a finished Practice B with 70% or better (best try counts)
//   Test     opens after a Review with 70% or better (best try counts)
// The Teacher PIN lets one student past a gate (his rule from earlier the same day: skipping a step
// "should need a teacher pin entry"). Scores are remembered on the device, like everything else here.
// ANY_ORDER true = no gates at all (every open part can be started).
const ANY_ORDER     = false;
const PASS_PCT      = 70;
const INSTRUCT_SECS = 15;
const READ_SECS     = 12;
const NEXT_SECS     = 8;
// Warm-Up steps are short (one small step of a problem), so their locks are short too
const STEP_READ_SECS = 3;
const STEP_NEXT_SECS = 3;
const STORAGE_KEY   = 'mm3_session_v1';
const SCORES_KEY    = 'mm3_scores_v1';
const RNDQ_SESSION_ID_KEY = 'mm3_session_id_v1';
const SESSION_ID = (() => {
  let id = localStorage.getItem(RNDQ_SESSION_ID_KEY);
  if (!id) { id = 'M3-' + Math.random().toString(36).slice(2, 9).toUpperCase(); localStorage.setItem(RNDQ_SESSION_ID_KEY, id); }
  return id;
})();

const FORMS = ['Z', 'W', 'P', 'A', 'B', 'T', 'U'];
// The Pre-Warm-Up (form Z, Marcos 11/6) is built and taught the way the Warm-Up is: worked examples, steps, then questions
const isWarmUp = form => form === 'W' || form === 'Z';
const isPractice = form => form === 'P';
const isReview = form => form === 'A' || form === 'B';
const isTest   = form => form === 'T' || form === 'U';
// Practice A, Practice B and the Review teach (answer + why + the worked picture + the mistake named); the Test does not.
// In the code: isPractice = Practice A (form P) · isReview = Practice B and the Review (forms A, B) · isTest = T, U
const teaches = form => isReview(form) || isPractice(form) || isWarmUp(form);
// The Warm-Up and Practice A stay in their order (easiest first); the others are shuffled
const keepsOrder = form => isPractice(form) || isWarmUp(form);
// Marcos 10/15: "make the hints in Practice A automatic read alouds, not an option. Keep it an option
// in Practice B." In Practice A (and the Warm-Up before it) the hint is open and reads itself aloud
// when the question appears; in Practice B it stays behind 💡 Need a hint?
const autoHint = form => isPractice(form) || isWarmUp(form);
/* Only questions count toward the score. A Warm-Up 'watch' (worked example) and 'step' (one step of a
   problem) are teaching, not scored. */
const isScored = q => !!q && !q.kind;
const scoredCount = bank => (bank || []).filter(isScored).length;
// Word help (a button per math word) is a support, so it comes off one step before the test:
// Practice A and Practice B have it; the Review and the Test do not (Marcos 10/10).
const wordHelp = form => form === 'Z' || form === 'W' || form === 'P' || form === 'A';
// "Try one like it": after a miss in a review, one more question of the same kind from this bank
const TWINS = { A: 'X', B: 'Y' };
const FORM_NAMES = { Z: 'Pre-Warm-Up', W: 'Warm-Up', P: 'Practice A', A: 'Practice B', B: 'Review', T: 'Test', U: 'Test (Retake)' };
function formOpen(form) {
  return SHARE_MODE || (isWarmUp(form) ? WARM_UP_OPEN : isPractice(form) ? PRACTICE_A_OPEN : form === 'A' ? PRACTICE_B_OPEN : form === 'B' ? REVIEW_OPEN : TEST_OPEN);
}
const ANY_OPEN = WARM_UP_OPEN || PRACTICE_A_OPEN || PRACTICE_B_OPEN || REVIEW_OPEN || TEST_OPEN;
/* Sheet / dashboard game key — one per form */
function gameKey(form) {
  return { Z: 'mod3z-prewarmup', W: 'mod3w-warmup', P: 'mod3-practice', A: 'mod3a-review', B: 'mod3b-review', T: 'mod3t-test', U: 'mod3u-test' }[form];
}

/* ── SHEET SUBMISSION ───────────────────────────────── */
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbzv8CWv1yyi8NeH04now9UxVL4IZm5yMqqsEGMcgGdrcAOWVB-aSp5siTvSSJXIUpzFMA/exec';

let tabSwitchCount = 0;

/* One saved miss: "[ID] (Skill) question (picked: answer)" — the standard every
   review uses. Skill comes from data/skills.js by question id, so misses restored
   from an older saved attempt still get tagged. " | " separates entries, so it is
   swapped out of the pick just in case. */
function missEntry(m) {
  const skill  = m.skill || (window.SKILLS || {})[m.id] || 'Unsorted';
  const picked = m.yourAnswer == null || m.yourAnswer === '' ? '' :
    ` (picked: ${String(m.yourAnswer).replace(/\s*\|\s*/g, ' / ').replace(/\s+/g, ' ').trim()})`;
  return `[${m.id}] (${skill}) ${m.q}${picked}`;
}

/* What the sheet's "form" column says: Practice A · Practice B · Review · Test · Test — Retake */
function formLabel(attempt) {
  return { Z: 'Pre-Warm-Up', W: 'Warm-Up', P: 'Practice A', A: 'Practice B', B: 'Review', T: 'Test', U: 'Test — Retake' }[app.currentForm];
}
/* The attempt this session will be once it finishes (finished ones on this device + 1). */
function upcomingAttempt() {
  return (getFormAttempts(app.studentName)[app.currentForm] || 0) + 1;
}

function submitScorePartial() {
  const total = scoredCount(app.currentBank);
  const pct = total ? Math.round((app.score / total) * 100) : 0;
  fetch(SHEET_URL, {
    method: 'POST', mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action:    'submit',
      game:      gameKey(app.currentForm),
      sessionId: SESSION_ID + '-' + (app.currentForm || 'x'),
      name:      app.studentName || 'Unknown',
      form:      formLabel(upcomingAttempt()),
      score:     app.score,
      total:     total,
      percent:   pct,
      status:    `In Progress (Q${app.currentIndex + 1}/${app.currentBank.length})`,
      done:           false,
      elapsed:        app.timerSeconds,
      tabSwitches:    tabSwitchCount,
      wrongQuestions: (app.missedQuestions||[]).map(missEntry).join(' | '),
      startedAt:      app.startedAt || '',
      finishedAt:     app.finishedAt || '',
      // where the student is now, for the dashboard (Marcos 11/5: "i should know what question they are on"). The sheet
      // keeps no status text, only the events, so the item rides at the end of this row's copy of the log (never in app.events).
      events:         JSON.stringify([...(app.events || []), { e: 'on', q: app.currentIndex + 1, of: app.currentBank.length }]),
      timestamp:      new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })
    })
  }).catch(() => {});
}

function submitScoreFinal() {
  const total = scoredCount(app.currentBank);
  const pct = total ? Math.round((app.score / total) * 100) : 0;
  fetch(SHEET_URL, {
    method: 'POST', mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action:    'submit',
      game:      gameKey(app.currentForm),
      sessionId: SESSION_ID + '-' + (app.currentForm || 'x') + '-A' + (app.currentAttemptNum || 1),
      name:      app.studentName || 'Unknown',
      form:      formLabel(app.currentAttemptNum),
      attempt:   app.currentAttemptNum || 1,
      score:     app.score,
      total:     total,
      percent:   pct,
      status:    'Complete',
      done:           true,
      elapsed:        app.timerSeconds,
      tabSwitches:    tabSwitchCount,
      wrongQuestions: (app.missedQuestions||[]).map(missEntry).join(' | '),
      startedAt:      app.startedAt || '',
      finishedAt:     app.finishedAt || '',
      events:         JSON.stringify(app.events || []),
      timestamp:      new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })
    })
  }).catch(() => {});
}

/* ── ROSTER ─────────────────────────────────────────── */
const ROSTER = [
  { name: "Mr. O (Teacher)",           id: "9377" },
  { name: "Avery, Jo'Von",             id: "10053632" },
  { name: "Belasquez Bonilla, Eduin",  id: "10058674" },
  { name: "Castaneda, Kelvin",         id: "10053248" },
  { name: "Chicas-Santos, Allison",    id: "10066737" },
  { name: "Collado, Roniel",           id: "10060249" },
  { name: "Dejesus, Michael",          id: "10049434" },
  { name: "Dock, Fakeem",              id: "10059720" },
  { name: "Douglas, Iyana",            id: "10070980" },
  { name: "Dumphrey, Christopher",     id: "10060696" },
  { name: "Flores, Kiara",             id: "10052834" },
  { name: "Johnson, Destiny",          id: "10052926" },
  { name: "Jones, Tahji",              id: "10060315" },
  { name: "Lawrence, Eric",            id: "10057451" },
  { name: "Madero, Jovany",            id: "10076374" },
  { name: "Pettway, Lanaura",          id: "10060616" },
  { name: "Polanco Soriano, Thiara",   id: "10060503" },
  { name: "Roberts, Robyn",            id: "10060925" },
  { name: "Rodriguez-Jimenez, Marcos", id: "10048936" },
  { name: "Rojas, Alanie",             id: "10076388" },
  { name: "Sanchez Rodriguez, Johanelyz", id: "10076767" },
  { name: "Vega, Taishmara",           id: "10054043" },
  { name: "Watts, Autumn",             id: "10039032" },
  { name: "Zelaya-Osorto, Nazareth",   id: "10053626" }
];

const GUEST_SLOTS = {
  '937701': 'Guest 1', '937702': 'Guest 2', '937703': 'Guest 3',
  '937704': 'Guest 4', '937705': 'Guest 5', '937706': 'Guest 6',
  '937707': 'Guest 7', '937708': 'Guest 8', '937709': 'Guest 9',
  '937710': 'Guest 10'
};

/* ── BUILD DROPDOWN ─────────────────────────────────── */
(function buildRoster() {
  const sel = document.getElementById('name-select');
  ROSTER.forEach(s => {
    const o = document.createElement('option');
    o.value = s.name; o.textContent = s.name;
    sel.appendChild(o);
  });
  const div = document.createElement('option');
  div.disabled = true; div.textContent = '── Guest Slots ──';
  sel.appendChild(div);
  Object.entries(GUEST_SLOTS).forEach(([code, label]) => {
    const o = document.createElement('option');
    o.value = `GUEST:${code}`; o.textContent = `🙋 ${label}`;
    sel.appendChild(o);
  });
})();

/* ── STATE ──────────────────────────────────────────── */
let loggedInName    = '';
let unlockedForms   = new Set();
let retakeUnlocked  = false;   // set by the Teacher PIN; cleared on Home
let pinModalCallback = null;
let activeSpeakBtn  = null;
let reviewMode      = false;   // only the tests set these now: the Teacher screen replaced the Manual / Auto-run
let reviewAutoRun   = false;   // pop-ups (the Lab's screen, 10/30) — the site no longer answers for the teacher

/* 🧑‍🏫 THE TEACHER SCREEN (the Lab's screen, Marcos 10/30; Parts of Speech HQ's, 10/28): Teacher Access asks the PIN in
   the page, then ONE screen: a part, a version — any part, nothing passed first. The PIN lasts for this tab
   (sessionStorage) until ✕ Exit teacher. 👀 Try it as a student opens the guest view (share.js: nothing reaches the
   sheet) on ?teach=<PART>.<version>, started the way a first try starts. */
const TEACHER_KEY      = 'mm3_teacher';        // sessionStorage: '1' = the Teacher PIN was given in this tab
const TEACHER_PICK_KEY = 'mm3_teacher_pick';   // sessionStorage: the last part and version picked
const TEACH_PARTS      = ['Z', 'W', 'P', 'A', 'B', 'T', 'U'];
const versionCount = id => { const v = window['FORM_' + id + '_V']; return Array.isArray(v) && v.length ? v.length : 1; };
const TEACH = (() => {
  const m = /^([ZWPABTU])\.(\d+)$/.exec(new URLSearchParams(location.search).get('teach') || '');
  return SHARE_MODE && m ? { form: m[1], version: Number(m[2]) } : null;
})();
function teacherUnlocked() { try { return sessionStorage.getItem(TEACHER_KEY) === '1'; } catch (e) { return false; } }

/* ── MATH HELPERS ───────────────────────────────────── */
function frac(n, d) {
  return `<span class="fraction"><span class="frac-top">${n}</span><span class="frac-bottom">${d}</span></span>`;
}
function mixed(w, n, d) {
  return `<span class="mixed-num">${w}<span class="fraction"><span class="frac-top">${n}</span><span class="frac-bottom">${d}</span></span></span>`;
}
function formatMathText(raw) {
  if (!raw) return '';
  let s = raw;
  s = s.replace(/(\d+)\s+(\d+)\/(\d+)/g, (_, w, n, d) => mixed(w, n, d));
  s = s.replace(/(\d+)\/(\d+)/g, (_, n, d) => frac(n, d));
  s = s.replace(/\bx\b/g, '×');
  return s;
}

const ORDINALS = {
  '2':'halves','3':'thirds','4':'fourths','5':'fifths','6':'sixths',
  '7':'sevenths','8':'eighths','9':'ninths','10':'tenths',
  '12':'twelfths','16':'sixteenths','100':'hundredths'
};
const SINGULAR_DENOM = {
  'halves':'half','thirds':'third','fourths':'fourth','fifths':'fifth',
  'sixths':'sixth','sevenths':'seventh','eighths':'eighth','ninths':'ninth',
  'tenths':'tenth','twelfths':'twelfth','sixteenths':'sixteenth','hundredths':'hundredth'
};
function denomToWord(d) { return ORDINALS[d] || `over ${d}`; }
function numToWord(n) {
  const w = ['zero','one','two','three','four','five','six','seven','eight','nine',
             'ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen',
             'seventeen','eighteen','nineteen','twenty'];
  return w[parseInt(n)] !== undefined ? w[parseInt(n)] : n;
}
function convertToSpokenText(raw) {
  return raw
    .replace(/\u00a0{2,}/g, ', ')
    .replace(/(\d+)\s+(\d+)\/(\d+)/g, (_, w, n, d) => {
      const dWord = denomToWord(d), nNum = parseInt(n);
      const dFinal = nNum === 1 ? (SINGULAR_DENOM[dWord] || dWord) : dWord;
      return `${w} and ${numToWord(n)} ${dFinal}`;
    })
    .replace(/(\d+)\/(\d+)/g, (_, n, d) => {
      const dWord = denomToWord(d), nNum = parseInt(n);
      const dFinal = nNum === 1 ? (SINGULAR_DENOM[dWord] || dWord) : dWord;
      return `${numToWord(n)} ${dFinal}`;
    })
    .replace(/×/g, ' times ')
    .replace(/÷/g, ' divided by ')
    .replace(/(^|\s)\+(?=\s|$)/g, '$1plus')
    .replace(/(^|\s)=(?=\s|$)/g, '$1equals')
    .replace(/\bx\b/g, ' times ')
    .replace(/\s\+\s/g, ' plus ')
    .replace(/\s−\s/g, ' minus ')
    .replace(/(^|\s)\?(?=\s|$)/g, '$1what?');   // a step's "3 × 5 = ?" is asked ("equals what?"), and the "?" lights with "what"
}

/* ── LETTER GRADE ───────────────────────────────────── */
function letterGrade(pct) {
  if (pct >= 97) return 'A+';
  if (pct >= 93) return 'A';
  if (pct >= 90) return 'A-';
  if (pct >= 87) return 'B+';
  if (pct >= 83) return 'B';
  if (pct >= 80) return 'B-';
  if (pct >= 77) return 'C+';
  if (pct >= 73) return 'C';
  if (pct >= 70) return 'C-';
  if (pct >= 67) return 'D+';
  if (pct >= 63) return 'D';
  if (pct >= 60) return 'D-';
  return 'F';
}

/* ── HELPERS ────────────────────────────────────────── */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function getFirstName(name) {
  if (!name) return 'Student';
  if (name.includes(' - ')) return name.split(' - ').pop().trim();
  const parts = name.split(',');
  return parts.length > 1 ? parts[1].trim().split(' ')[0] : name.split(' ')[0];
}

let hlTimer = null;
const liveUtterances = new Set();   // speech in progress, held so its events still arrive
/* ── LISTEN, THEN NEXT (Marcos 10/11: "these should be forced for them to hear like in Science… the kids
   have to hear something before they can move on to the next item") ──
   After a MISS in Practice A, Practice B or the Review, the Next button stays hidden until the mistake and
   the right answer have been heard to the end. One big Listen button; stopping early does not count; a
   second tap while it is speaking does nothing. A device that will not speak (no sound started within 4 s,
   or the voice reports an error) gets a wait long enough to read it, then an "I read it" button.
   Same rules and numbers as guide.js in science-starting-and-stopping. Not in the Test (it shows no
   answer), not after a right answer, not in the teacher's look.
   What it proves: the audio played to the end. Not that the child listened. */
const LISTEN_START_WAIT = 4000;
const listenDwellMs = words => Math.min(15000, Math.max(3000, words * 450));
let listenJob = null;   // the forced listen now speaking, if any

function stopActiveSpeech() {
  clearTimeout(hlTimer);
  if (listenJob && !listenJob.settled) listenJob.abort();   // cut off before the end → it does not count
  window.speechSynthesis.cancel();
  document.querySelectorAll('.wrd.hl').forEach(e => e.classList.remove('hl'));
  if (activeSpeakBtn) { activeSpeakBtn.textContent = '🔊'; activeSpeakBtn = null; }
}

/* ── HINT BOX (Marcos 10/7) ──
   "The hints should not play automatically. They should be there if
   needed." — still the rule in Practice B. In Practice A and the Warm-Up the hint is open
   and reads itself aloud (Marcos 10/15, see autoHint). Until the student taps 💡 Need a hint?, only that button shows
   and nothing is read. Once opened, the hint has its own 🔊 on the LEFT,
   same toggle as every other speaker (tap to play, tap to stop, tap again
   to restart); every word (including "Hint:") is a span for the highlight.
   The question's 🔊 reads the question only. */
function hintBoxHTML(hint, shown) {
  if (!shown) {
    return `<div class="hint-wrap"><button type="button" class="hint-reveal-btn" ` +
      `aria-label="Show a hint" onclick="event.stopPropagation(); app.showHint()">` +
      `💡 Need a hint?</button></div>`;
  }
  const words = ('Hint: ' + hint).split(/\s+/)
    .map(w => `<span class="wrd">${formatMathText(w)}</span>`).join(' ');
  return `<div class="hint-box"><button type="button" class="speak-btn hint-speak-btn" ` +
    `title="Read the hint aloud" aria-label="Read the hint aloud" ` +
    `onclick="event.stopPropagation(); speakHint(this)">🔊</button>` +
    `<span class="hint-text"><span aria-hidden="true">💡</span> ${words}</span></div>`;
}

function speakHint(btn) {
  if (activeSpeakBtn === btn) { stopActiveSpeech(); return; }
  stopActiveSpeech();
  const q = app.currentQ();
  if (!q || !q.hint) return;
  const spans = Array.from(btn.parentElement.querySelectorAll('.wrd'));
  activeSpeakBtn = btn;
  btn.textContent = '⏹';
  const u = new SpeechSynthesisUtterance(sayWords(spans, 'Hint: ' + q.hint, ('Hint: ' + q.hint).split(/\s+/)));
  english(u); u.rate = READ_RATE;
  u.onboundary = e => {
    if (e.name !== 'word') return;
    spans.forEach(el => el.classList.remove('hl'));
    lightAt(spans, u.text, e.charIndex);
  };
  u.onend = () => {
    spans.forEach(el => el.classList.remove('hl'));
    if (activeSpeakBtn === btn) { btn.textContent = '🔊'; activeSpeakBtn = null; }
  };
  addHighlightFallback(u, spans);
  window.speechSynthesis.speak(u);
}

/* ── WORD HELP (Marcos 10/10) ──
   Each math word in the question gets a button under it. Tapping one opens a
   card: what the word means, an example, sometimes a picture, and its own 🔊.
   Nothing opens or speaks on its own. Practice A and Practice B only (see wordHelp) —
   the Review and the Test check whether the student knows these words. Every open is logged
   (event "word") so the dashboard can show who needed which word. */
const WORD_MAX = 4;
function wordsIn(q) {
  const text = ' ' + String(q.q).toLowerCase() + ' ';
  const found = [];
  (window.WORDS || []).forEach(w => {
    let at = -1;
    w.find.forEach(ph => {
      const m = new RegExp('[^a-z]' + ph.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[^a-z]').exec(text);
      if (m && (at < 0 || m.index < at)) at = m.index;
    });
    if (at >= 0) found.push({ w, at });
  });
  return found.sort((a, b) => a.at - b.at).slice(0, WORD_MAX).map(x => x.w);
}
function wordChipsHTML(q, openKey) {
  const list = wordsIn(q);
  if (!list.length) return '';
  const chips = list.map(w =>
    `<button type="button" class="word-chip${w.key === openKey ? ' open' : ''}" aria-expanded="${w.key === openKey}" ` +
    `onclick="app.showWord('${w.key}')">${w.word}</button>`).join('');
  const w = list.find(x => x.key === openKey);
  const card = !w ? '' :
    `<div class="word-card" role="note"><button type="button" class="speak-btn word-speak-btn" title="Read this aloud" ` +
    `aria-label="Read the meaning of ${w.word} aloud" onclick="speakWordCard(this)">🔊</button>` +
    `<div class="word-card-text"><div class="word-card-means">${wrapWords('<strong>' + w.word + '</strong> — ' + formatMathText(w.means))}</div>` +
    `<div class="word-card-ex">${wrapWords('<em>Example:</em> ' + formatMathText(w.ex))}</div>` +
    `${w.pic ? M2V.picHTML(w.pic) : ''}</div>` +
    `<button type="button" class="word-close" aria-label="Close" onclick="app.showWord('${w.key}')">✕</button></div>`;
  return `<div class="word-row"><span class="word-label" aria-hidden="true">📖 Word help:</span>${chips}</div>${card}`;
}
function speakWordCard(btn) {
  if (activeSpeakBtn === btn) { stopActiveSpeech(); return; }
  stopActiveSpeech();
  const spans = Array.from(btn.parentElement.querySelectorAll('.word-card-text .wrd')).filter(s => /[A-Za-z0-9+=×÷−]/.test(s.textContent));
  if (!spans.length) return;
  activeSpeakBtn = btn;
  btn.textContent = '⏹';
  // the card's word, then a stop: "times as many. Times as many means …" (the dash on screen is not read)
  const word = Array.from(btn.parentElement.querySelectorAll('.word-card-means strong .wrd')).pop();
  const u = new SpeechSynthesisUtterance(sayWords(spans, spans.map(sp => sp.textContent + (sp === word && !/[.!?:]$/.test(sp.textContent) ? '.' : '')).join(' ')));
  english(u); u.rate = READ_RATE;
  u.onboundary = e => {
    if (e.name !== 'word') return;
    spans.forEach(el => el.classList.remove('hl'));
    lightAt(spans, u.text, e.charIndex);
  };
  u.onend = () => {
    spans.forEach(el => el.classList.remove('hl'));
    if (activeSpeakBtn === btn) { btn.textContent = '🔊'; activeSpeakBtn = null; }
  };
  addHighlightFallback(u, spans);
  window.speechSynthesis.speak(u);
}

/* ── PART BANNER (Marcos 10/8: "I want to be able to know which part the
   students are on") — a big colored label on top of every question:
   the step number and the part's name, one color per part. ── */
const PART_BANNER = { Z: ['🧱', 'Pre-Warm-Up', 'pb-pre-warm-up'], W: ['🔥', 'Step 1 · Warm-Up', 'pb-warm-up'], P: ['🌱', 'Step 2 · Practice A', 'pb-practice-a'], A: ['🧭', 'Step 3 · Practice B', 'pb-practice-b'], B: ['📘', 'Step 4 · Review', 'pb-review'], T: ['📝', 'Step 5 · Test', 'pb-quiz'], U: ['📝', 'Step 5 · Test', 'pb-quiz'] };
function setPartBanner(form) {
  const el = document.getElementById('part-banner');
  const p = PART_BANNER[form];
  if (!el || !p) return;
  const retake = form === 'U';
  el.className = 'part-banner ' + p[2];
  el.innerHTML = `<span aria-hidden="true">${p[0]}</span> ${p[1]}${retake ? ' — Retake' : ''}` +
    (reviewMode ? ' <span class="pb-teacher">(teacher view)</span>' : '');
}

/* ── HIGHLIGHT FALLBACK ─────────────────────────────
   Some voices (and some browsers) never fire word-boundary
   events, so the highlight would never move. If no boundary
   arrives shortly after speaking starts, step through the
   words on a timer paced by word length and speech rate. */
function addHighlightFallback(u, spans) {
  let fired = false, i = 0, ended = false;
  const prevB = u.onboundary, prevE = u.onend;
  u.onboundary = e => { if (e.name === 'word' && !fired) { fired = true; clearTimeout(hlTimer); } if (prevB) prevB(e); };
  // The end of the speech always stops the highlight, however the voice reports it:
  // a normal end, an error or cancel, or (some Chromebook voices) no event at all,
  // which the watch below catches by seeing the voice go quiet AFTER it started.
  // A voice that never starts is left alone: the page's own no-sound wait handles that.
  const finish = e => {
    if (ended) return;
    ended = true;
    clearInterval(watch);
    clearTimeout(hlTimer);
    spans.forEach(s => s.classList.remove('hl'));
    liveUtterances.delete(u);
    if (prevE) prevE(e || {});
  };
  u.onend = finish;
  u.onerror = finish;
  // Chrome can drop an utterance's events if nothing else holds on to it.
  liveUtterances.add(u);
  let started = false, quietTicks = 0;
  const prevS = u.onstart;
  u.onstart = e => { started = true; if (prevS) prevS(e); };
  const watch = setInterval(() => {
    const voice = window.speechSynthesis;
    if (voice.speaking) { started = true; quietTicks = 0; return; }
    quietTicks = started && !voice.pending ? quietTicks + 1 : 0;
    if (quietTicks >= 2) finish();
  }, 400);
  const step = () => {
    if (fired || ended) return;
    spans.forEach(s => s.classList.remove('hl'));
    if (i >= spans.length) return;
    const w = spans[i++];
    w.classList.add('hl');
    const len = (w.textContent || '').replace(/[^A-Za-z0-9]/g, '').length;
    hlTimer = setTimeout(step, Math.max(280, len * 70 + 120) / (u.rate || 1));
  };
  clearTimeout(hlTimer);
  hlTimer = setTimeout(step, 500);
}

/* ── ATTEMPT TRACKING ───────────────────────────────── */
function getFormAttempts(name) {
  const scores = JSON.parse(localStorage.getItem(SCORES_KEY) || '[]');
  const counts = { Z: 0, W: 0, P: 0, A: 0, B: 0, T: 0, U: 0 };
  scores.filter(s => s.name === name && s.done).forEach(s => {
    if (counts[s.form] !== undefined) counts[s.form]++;
  });
  return counts;
}

/* The Test is one attempt. Once it is finished on this device the student sees
   "Test Already Completed"; a retake (form U) needs the Teacher PIN every
   time. The Review can be taken two times; after that only a Teacher PIN
   unlocks another try. Practice A and Practice B have no limit. */
function testCompleted(name) {
  const a = getFormAttempts(name);
  return a.T > 0 || a.U > 0;
}

/* ── THE GATES (see PASS_PCT) ── */
/* This student's best finished attempt at a part on this device, or null */
function bestScore(name, form) {
  const scores = JSON.parse(localStorage.getItem(SCORES_KEY) || '[]');
  return scores.filter(s => s.name === name && s.form === form && s.done && s.total > 0)
    .reduce((best, s) => (!best || s.score / s.total > best.score / best.total ? s : best), null);
}
function passed(name, form) {
  const best = bestScore(name, form);
  return !!best && best.score / best.total * 100 >= PASS_PCT;
}
/* How many right it takes: 70% of 17 questions = 12 */
function needFor(form) {
  return Math.ceil(PASS_PCT / 100 * scoredCount(window['FORM_' + form]));
}
/* THE PRE-WARM-UP (Marcos 11/6: "how about a pre-warmup for just those students"): it appears once a student has
   finished a Warm-Up. A student whose Warm-Ups are all below the mark must finish the Pre-Warm-Up once before the
   next Warm-Up ("Required first"). "anyone who has already passed the warm up should have this locked". The Teacher
   PIN lets one student past either lock. */
function preWarmUpShown(name) {
  return ANY_ORDER || SHARE_MODE || getFormAttempts(name).W > 0;
}
function preWarmUpWait(name) {
  if (ANY_ORDER || SHARE_MODE) return '';
  if (passed(name, 'W')) return 'You passed the Warm-Up';
  return '';
}
function warmUpWait(name) {
  if (ANY_ORDER || SHARE_MODE) return '';
  const a = getFormAttempts(name);
  if (a.W > 0 && !passed(name, 'W') && a.Z === 0) return 'Finish the Pre-Warm-Up first';
  return '';
}
/* Why Practice A is not open for this student yet ('' = it is open). A student who already
   passed Practice A keeps it (the Warm-Up came after them). */
function practiceAWait(name) {
  if (ANY_ORDER || SHARE_MODE || passed(name, 'P')) return '';
  const a = getFormAttempts(name);
  if (!a.W) return 'Finish the Warm-Up first';
  if (!passed(name, 'W')) return `Get ${needFor('W')} of ${scoredCount(window.FORM_W)} on the Warm-Up first`;
  return '';
}
/* Why Practice B is not open for this student yet ('' = it is open).
   A Practice B that was already started before this gate existed can still be resumed and finished. */
function practiceBWait(name) {
  if (ANY_ORDER || SHARE_MODE) return '';
  const a = getFormAttempts(name);
  if (!a.P) return 'Finish Practice A first';
  if (!passed(name, 'P')) return `Get ${needFor('P')} of ${window.FORM_P.length} on Practice A first`;
  return '';
}
/* Why the Review is not open for this student yet ('' = it is open) */
function reviewWait(name) {
  if (ANY_ORDER || SHARE_MODE) return '';
  const a = getFormAttempts(name);
  if (a.P === 0) return 'Finish Practice A first';
  if (a.A === 0) return 'Finish Practice B first';
  if (!passed(name, 'A')) return `Get ${needFor('A')} of ${window.FORM_A.length} on Practice B first`;
  return '';
}
/* Why the Test is not open for this student yet ('' = it is open) */
function testWait(name) {
  if (ANY_ORDER || SHARE_MODE) return '';
  const a = getFormAttempts(name);
  if (a.B === 0) return 'Finish the Review first';
  if (!passed(name, 'B')) return `Get ${needFor('B')} of ${window.FORM_B.length} on the Review first`;
  return '';
}

/* A form that is not open yet shows a gray "Not open yet" button. */
function setFormButton(form, label, sub, waiting) {
  const btn = document.getElementById('btn-form-' + form);
  if (!btn) return;
  const open = formOpen(form);
  btn.disabled = !open;
  // "waiting" = open but not yet earned: looks locked, still tappable so it can explain why
  btn.classList.toggle('locked', !open || !!waiting);
  btn.innerHTML = !open
    ? `🔒 ${label.replace(/^\S+\s/, '')}<span class="form-btn-sub">Not open yet</span>`
    : waiting
      ? `🔒 ${label.replace(/^\S+\s/, '')}<span class="form-btn-sub">${waiting}</span>`
      : `${label}<span class="form-btn-sub">${sub}</span>`;
}

function applyFormLocks(name) {
  const a         = getFormAttempts(name);
  const done      = testCompleted(name);
  const startCard = document.getElementById('quiz-start-card');
  const doneCard  = document.getElementById('completed-container');
  const retake    = document.getElementById('retake-card');
  // Pre-Warm-Up: shows after a finished Warm-Up; open until the Warm-Up is passed, then locked (see preWarmUpShown)
  const preCard = document.getElementById('pre-warm-up-card');
  if (preCard) preCard.classList.toggle('hidden', !preWarmUpShown(name));
  const bestZ = bestScore(name, 'Z'), nZ = scoredCount(window.FORM_Z);
  setFormButton('Z', '🧱 Pre-Warm-Up',
    !bestZ ? `smaller steps · ${nZ} questions · 💡 hints`
    : `✅ Done: ${bestZ.score} of ${bestZ.total} · do it again any time`,
    preWarmUpWait(name));
  // Warm-Up: no limit. After a try the button shows the best score and what opens Practice A.
  const bestW = bestScore(name, 'W'), nW = scoredCount(window.FORM_W);
  setFormButton('W', '🔥 Warm-Up',
    !bestW ? `watch, then try · ${nW} questions · 💡 hints`
    : passed(name, 'W') ? `✅ Best: ${bestW.score} of ${bestW.total} · do it again any time`
    : `🔁 Best: ${bestW.score} of ${bestW.total} · get ${needFor('W')} to open Practice A`,
    warmUpWait(name));
  // Practice A: waits for 70% on the Warm-Up; no limit. After a try the button shows the best score and what opens Practice B.
  const bestA = bestScore(name, 'P');
  setFormButton('P', '🌱 Practice A',
    !bestA ? '17 questions · 💡 hints read to you'
    : passed(name, 'P') ? `✅ Best: ${bestA.score} of ${bestA.total} · practice again any time`
    : `🔁 Best: ${bestA.score} of ${bestA.total} · get ${needFor('P')} to open Practice B`,
    practiceAWait(name));
  // Practice B: waits for 70% on Practice A; no limit. After a try the button shows the best score and what opens the Review.
  const bestB = bestScore(name, 'A');
  setFormButton('A', '🧭 Practice B',
    !bestB ? '17 questions · 💡 hints'
    : passed(name, 'A') ? `✅ Best: ${bestB.score} of ${bestB.total} · practice again any time`
    : `🔁 Best: ${bestB.score} of ${bestB.total} · get ${needFor('A')} to open the Review`,
    practiceBWait(name));
  // Review: waits for Practice A + 70% on Practice B; two tries, then the Teacher PIN
  const bestR = bestScore(name, 'B');
  const reviewWhy = reviewWait(name);
  setFormButton('B', '📘 Review',
    a.B === 0 ? '17 questions · no hints · 2 tries'
    : a.B >= 2 ? `🔒 2 of 2 tries used · best: ${bestR.score} of ${bestR.total}`
    : passed(name, 'B') ? `✅ Best: ${bestR.score} of ${bestR.total} · 1 try left`
    : `🔁 Try 2 of 2 · best: ${bestR.score} of ${bestR.total} · get ${needFor('B')} to open the Test`,
    reviewWhy);
  const reviewBtn = document.getElementById('btn-form-B');
  if (reviewBtn && formOpen('B') && a.B >= 2) reviewBtn.classList.add('locked');
  // Test: waits for 70% on the Review
  setFormButton('T', '📝 Take the Test', '17 questions · one try', testWait(name));
  if (startCard) startCard.classList.toggle('hidden', done);
  if (doneCard)  doneCard.classList.toggle('hidden', !done || retakeUnlocked);
  if (retake)    retake.classList.toggle('hidden', !retakeUnlocked);
  if (done) {
    const taken = a.T + a.U;
    const detail = document.getElementById('completed-detail');
    if (detail) detail.textContent = taken === 1
      ? 'You have already taken the test.'
      : 'You have already taken the test and a retake.';
  }
}

/* ── SPEAK DIRECTIONS ───────────────────────────────── */
function speakDir(btn) {
  if (activeSpeakBtn === btn) { stopActiveSpeech(); return; }
  stopActiveSpeech();

  const p = btn.closest('.dir-section').querySelector('.dir-text');
  if (!p) return;
  if (!p.querySelector('.wrd')) p.innerHTML = wrapWords(p.innerHTML);

  const spans = Array.from(p.querySelectorAll('.wrd'));
  if (!spans.length) return;

  activeSpeakBtn = btn;
  btn.textContent = '⏹';

  const speechText = spans.map(s => s.textContent).join(' ');
  const u = new SpeechSynthesisUtterance(speechText);
  english(u); u.rate = READ_RATE;

  u.onboundary = e => {
    if (e.name !== 'word') return;
    document.querySelectorAll('.dir-text .wrd.hl').forEach(el => el.classList.remove('hl'));
    lightAt(spans, u.text, e.charIndex);
  };
  u.onend = () => {
    document.querySelectorAll('.dir-text .wrd.hl').forEach(el => el.classList.remove('hl'));
    if (activeSpeakBtn === btn) { btn.textContent = '🔊'; activeSpeakBtn = null; }
  };
  addHighlightFallback(u, spans);
  window.speechSynthesis.speak(u);
}

/* ── READ-ALOUD INTRO SPEAKS ITSELF ─────────────────
   Marcos 10/6: the "Read Aloud is Available!" screen announces itself
   the moment it opens — no reading, no button. The click on "Let's Get
   Started!" is the user gesture the browser needs. The icons are said
   as words, and each word lights up as it is read. Leaving the screen
   (app.show) cancels the speech. */
const INTRO_SAY = { '🔊': 'the speaker button', '⏹': 'the stop button', '—': ',' };
const READ_RATE = 0.82;    // every read-aloud a student taps (Marcos 10/26: "I like the 0.82. It's clear and easy to listen to.")
/* THE SAME VOICE AS QPS (Marcos 10/28, on Parts of Speech HQ: "why can't this site talk like QPS" · "the reading
   speed also sounds different on QPS"; after the fix: "i like the sound and pacing of the read aloud"): every reading
   asks for English and uses the device's own default English voice, picked the way the QPS Literacy Hub picks it
   (qps-literacy-hub/readaloud.js). Asking only for "en-US" let the browser choose a different voice, which sounds
   different at the same 0.82. A device that lists no voices yet still gets English. */
let _enVoice = null;
function englishVoice() {
  if (_enVoice) return _enVoice;
  const all = (window.speechSynthesis && speechSynthesis.getVoices && speechSynthesis.getVoices()) || [];
  const isEn = v => /^en([-_]|$)/i.test((v && v.lang) || ''), us = v => /^en[-_]US$/i.test(v.lang || '');
  _enVoice = all.find(v => v.default && isEn(v)) || all.find(v => us(v) && v.localService) || all.find(us) || all.find(isEn) || null;
  return _enVoice;                         // null until the device lists its voices (Chrome lists them late): asked again next time
}
function english(u) {
  u.lang = 'en-US';
  const v = englishVoice();
  if (v) { try { u.voice = v; } catch (e) { /* a voice the browser won't take: en-US still asks for English */ } }
  return u;
}
const INTRO_RATE = 0.82;   // Marcos 10/6: 0.92 ran ahead of the highlight
let introToken = 0, introTimer = null;
let introMsPerChar = null, introMsPerWord = null;   // learned from this device's voice
function speakReadAloudIntro() {
  stopActiveSpeech();
  clearTimeout(introTimer);
  const screen = document.getElementById('readaloud-screen');
  const els = Array.from(screen.querySelectorAll('.ra-read'));
  els.forEach(el => { if (!el.querySelector('.wrd')) el.innerHTML = wrapWords(el.innerHTML); });
  // One piece per SENTENCE (Marcos 10/6: the end of a long sentence lost its
  // highlight). Each piece = the words to say + the on-screen word each one lights.
  const pieces = [];
  els.forEach(el => {
    let words = [], wordSpan = [];
    const flush = () => { if (words.length) pieces.push({ words, wordSpan }); words = []; wordSpan = []; };
    el.querySelectorAll('.wrd').forEach(sp => {
      const t = sp.textContent.replace(/\uFE0F/g, '').trim();
      const key = t.replace(/[.!?,]+$/, ''), punct = t.slice(key.length);   // "🔊." → icon + "."
      let say = INTRO_SAY[key] != null ? INTRO_SAY[key] + punct : (/[A-Za-z0-9]/.test(t) ? t : '');
      if (!say) return;
      if (say === ',') { if (words.length) words[words.length - 1] += ','; return; }
      if (/^the /.test(say) && /^(every|each)$/i.test(words[words.length - 1] || '')) say = say.slice(4);
      // past-tense "read" ("is read aloud") must sound like "red", not "reed" (Marcos 10/6)
      if (/^read[.!?,]?$/i.test(say) && /^(is|was|are|were|be|been|being)$/i.test(words[words.length - 1] || '')) say = say.replace(/^read/i, 'red');
      say.split(' ').forEach(w => { words.push(w); wordSpan.push(sp); });
      if (/[.!?]$/.test(say)) flush();
    });
    if (words.length && !/[.!?,]$/.test(words[words.length - 1])) words[words.length - 1] += '.';
    flush();
  });
  const factor = (typeof READ_SPEEDS !== 'undefined' && typeof readSpeed !== 'undefined' && READ_SPEEDS[readSpeed]) ? READ_SPEEDS[readSpeed].factor : 1;
  const rate = INTRO_RATE * factor;
  const token = ++introToken;
  const live = () => token === introToken && !screen.classList.contains('hidden');
  const sayPiece = k => {
    if (!live() || k >= pieces.length) return;
    const p = pieces[k];
    const text = p.words.join(' ');
    const starts = []; let pos = 0;
    p.words.forEach(w => { starts.push(pos); pos += w.length + 1; });
    const lit = new Set(p.wordSpan);
    let idx = -1, lastHeard = 0, startedAt = 0, viaVoice = false;
    const mark = j => {
      j = Math.max(0, Math.min(j, p.words.length - 1));
      if (j === idx) return;
      idx = j;
      lit.forEach(sp => sp.classList.remove('hl'));
      p.wordSpan[j].classList.add('hl');
    };
    // Watchdog: when the voice goes quiet about word positions (some voices
    // never report them, Chrome sometimes stops partway), step on at a
    // speaking pace — never past the last word, which stays lit until the end.
    // Pace comes from how long this voice really took on the sentences before
    // (first sentence: a guess), so the highlight keeps up on any voice.
    // (a hair quick on purpose: the last word stays lit until the voice ends, so early is safe, late is not)
    const wordMs = w => introMsPerChar ? 0.92 * (w.length + 1) * introMsPerChar : (120 + w.replace(/[^A-Za-z0-9]/g, '').length * 55) / rate;
    const tick = () => {
      if (!live()) return;
      // while the voice is reporting words it leads; step in only once it has gone quiet
      const base = wordMs(p.words[idx] || ''), quiet = Date.now() - lastHeard;
      const avg = Math.max(base, introMsPerWord || 0);   // a normal pause between reported words is never "quiet"
      if (idx >= 0 && viaVoice && quiet > avg * 1.8) {
        const n = Math.max(1, Math.floor(quiet / avg));   // catch up the words said while it was quiet
        viaVoice = false; mark(idx + n); lastHeard += n * avg;
      } else if (idx >= 0 && !viaVoice && quiet > base) {
        mark(idx + 1); lastHeard = Math.min(Date.now(), lastHeard + base);   // keep exact time between steps
      }
      introTimer = setTimeout(tick, 60);
    };
    const u = new SpeechSynthesisUtterance(text);
    english(u); u.rate = rate;
    u.onstart = () => { startedAt = lastHeard = Date.now(); mark(0); clearTimeout(introTimer); tick(); };
    u.onboundary = e => {
      if (e.name !== 'word') return;
      let j = 0;
      while (j + 1 < starts.length && starts[j + 1] <= e.charIndex) j++;
      mark(j); lastHeard = Date.now(); viaVoice = true;
    };
    u.onend = () => {
      clearTimeout(introTimer);
      const took = Date.now() - startedAt;
      if (startedAt && live() && took > 300) {   // learn the voice's real speed (skip cancelled/odd pieces)
        const perChar = took / (text.length + 1);
        introMsPerChar = introMsPerChar ? (introMsPerChar + perChar) / 2 : perChar;
        const perWord = took / p.words.length;
        introMsPerWord = introMsPerWord ? (introMsPerWord + perWord) / 2 : perWord;
      }
      lit.forEach(sp => sp.classList.remove('hl'));
      if (live()) introTimer = setTimeout(() => sayPiece(k + 1), 250);
    };
    window.speechSynthesis.speak(u);
  };
  sayPiece(0);
}

/* Light the word the voice is on. The voice says where it is in the text (charIndex); it does NOT signal every
   word — Samantha in Chrome gave no signal for "example:" after "For" (measured in Marcos's Chrome 10/28) — so
   moving one word per signal fell further behind with each skipped word ("the highlighting can't keep up").
   A text made by sayWords has its own list of where each word starts; any other spoken text has one token per
   span, joined by single spaces. Gives back the lit span. */
function lightAt(spans, text, charIndex) {
  const said = SAID_AT.get(spans);
  let j = 0, start = 0;
  if (said && said.text === text) said.starts.forEach((st, k) => { if (st <= charIndex) j = k; });
  else String(text).split(' ').forEach((tok, k) => { if (start <= charIndex) j = k; start += tok.length + 1; });
  spans.forEach(sp => sp && sp.classList.remove('hl'));
  if (spans[j]) spans[j].classList.add('hl');
  return spans[j];
}
/* What the voice is told for these spans. The words change on the way to the voice ("3/4" is said "three
   fourths", "?" is said "question mark", "<" before "less than" is not said), so lightAt cannot count tokens in
   it: each word starts where the rest of the text, said from that word on, starts. That list is kept for
   lightAt. raw = the text as written; words = each span's word, as raw has it. */
const SAID_AT = new WeakMap();
function sayWords(spans, raw = spans.map(sp => sp.textContent).join(' '), words = spans.map(sp => sp.textContent)) {
  const text = convertToSpokenText(raw);
  let from = 0;
  const starts = words.map(w => {
    const at = raw.indexOf(w, from);
    if (at < 0) return NaN;   // not in raw as written: never lit, the rest still line up
    from = at + w.length;
    return text.length - convertToSpokenText(' ' + raw.slice(at)).length;
  });
  SAID_AT.set(spans, { text, starts });
  return text;
}
function wrapWords(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  let idx = 0;
  function walk(node) {
    if (node.nodeType === 3) {
      const text = node.textContent.replace(/—/g, ' — ').replace(/  +/g, ' ');
      const words = text.split(/(\s+)/);
      const frag = document.createDocumentFragment();
      words.forEach(part => {
        if (/\S/.test(part)) {
          const sp = document.createElement('span');
          sp.className = 'wrd'; sp.dataset.wi = idx++; sp.textContent = part;
          frag.appendChild(sp);
        } else if (part) {
          frag.appendChild(document.createTextNode(part));
        }
      });
      node.parentNode.replaceChild(frag, node);
    } else {
      [...node.childNodes].forEach(walk);
    }
  }
  walk(tmp);
  return tmp.innerHTML;
}

/* ══════════════════════════════════════════════════════
   APP OBJECT
══════════════════════════════════════════════════════ */
/* ── SESSION EVENT LOG ───────────────────────────────
   start · leave · return · resume · close · finish, each with the
   on-task clock. elapsed is time ON TASK: the timer pauses while the
   page is hidden and counts ticks, so a slept device cannot inflate it. */
function logEvent(kind, extra) {
  if (!app.events) app.events = [];
  app.events.push(Object.assign({
    at: new Date().toISOString(),
    e:  kind,
    q:  (app.currentIndex || 0) + 1,
    on: app.timerSeconds || 0
  }, extra || {}));
  if (app.events.length > 200) app.events.splice(0, app.events.length - 200);
}

/* ── PINNED FORM LABEL (form-label.js) ──────────────────
   A big colored label pinned to the top of the test screens naming
   the form or part this student is on, so Mr. O can read it from
   across the room (Marcos 10/20). show() calls syncFormLabel(). */
const PART_LABEL_COLORS = { 'pb-pre-warm-up': '#9c640c', 'pb-warm-up': '#d35400', 'pb-practice-a': '#1e8449', 'pb-practice-b': '#117a65', 'pb-review': '#2471a3', 'pb-quiz': '#3b2491' };
let formLabelShown = null;   // [form, text, color] — the results screen keeps the label the questions had
function syncFormLabel(screenId) {
  if (!window.FormLabel) return;
  const f = app.currentForm, p = PART_BANNER[f];
  if (!p || !['quiz-screen', 'end-screen'].includes(screenId)) return FormLabel.hide();
  if (screenId === 'end-screen' && formLabelShown && formLabelShown[0] === f) return FormLabel.show(formLabelShown[1], formLabelShown[2]);
  const text = `${p[0]} ${p[1]}${f === 'U' ? ' — Retake' : ''}`;
  formLabelShown = [f, text, PART_LABEL_COLORS[p[2]] || 'slate'];
  FormLabel.show(text, formLabelShown[2]);
}

const app = {

  /* ── state ── */
  studentName:       '',
  currentForm:       '',
  currentBank:       [],
  currentIndex:      0,
  score:             0,
  streak:            0,
  missedQuestions:   [],
  currentAttemptNum: 1,
  selectedAnswer:    null,
  questionLocked:    false,
  timerSeconds:      0,
  timerInterval:     null,
  timerOn:           false,
  instructInterval:  null,
  readInterval:      null,
  nextInterval:      null,

  /* ── screens ── */
  show(id) {
    ['start-screen','readaloud-screen','directions-screen','quiz-screen','end-screen','scoreboard-screen','teacher-screen','key-screen','slide-screen']
      .forEach(s => document.getElementById(s).classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    syncFormLabel(id);
    window.scrollTo(0, 0);   // every new screen starts at the top
    window.speechSynthesis.cancel();
  },

  /* ── INIT ── */
  init() {
    this.show('start-screen');
    document.getElementById('welcome-panel').classList.remove('hidden');
    document.getElementById('student-login-panel').classList.add('hidden');
  },

  /* ── READ ALOUD INTRO ── */
  showReadAloudIntro() {
    if (!SHARE_MODE && (!ANY_OPEN)) return;
    document.getElementById('welcome-panel').classList.add('hidden');
    this.show('readaloud-screen');
    introTimer = setTimeout(speakReadAloudIntro, 150);   // announces itself (show() just cancelled any speech; leaving first cancels this)
    const btn   = document.getElementById('readaloud-btn');
    const fill  = document.getElementById('readaloud-fill');
    const count = document.getElementById('readaloud-count');
    btn.disabled = true; btn.style.opacity = '0.45'; btn.style.cursor = 'not-allowed';
    count.textContent = 6;
    fill.style.transition = 'none';
    fill.style.width = '100%';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      fill.style.transition = 'width 6s linear';
      fill.style.width = '0%';
    }));
    let remaining = 6;
    const iv = setInterval(() => {
      remaining--;
      count.textContent = remaining;
      if (remaining <= 0) {
        clearInterval(iv);
        btn.disabled = false; btn.style.opacity = '1';
        btn.style.cursor = 'pointer'; btn.textContent = "✅ Got It — Show Me the Directions!";
      }
    }, 1000);
  },

  /* ── DIRECTIONS ── */
  showDirections() {
    this.show('directions-screen');
    this.startInstructionsTimer();
  },

  showLogin() {
    if (this.instructInterval) { clearInterval(this.instructInterval); this.instructInterval = null; }
    window.speechSynthesis.cancel();
    document.querySelectorAll('.dir-text .wrd.hl').forEach(e => e.classList.remove('hl'));
    this.studentName = '';
    loggedInName = '';
    document.getElementById('resume-container').classList.add('hidden');
    document.getElementById('form-select-section').classList.add('hidden');
    const loginCard = document.getElementById('login-step-card');
    if (loginCard) loginCard.classList.remove('hidden');
    this.show('start-screen');
    document.getElementById('welcome-panel').classList.add('hidden');
    document.getElementById('student-login-panel').classList.remove('hidden');
    if (SHARE_MODE) this._shareSignIn();
  },

  /* Shared preview: no roster, no student number — straight to the parts. */
  _shareSignIn() {
    loggedInName     = 'Guest';
    this.studentName = 'Guest';
    const loginCard = document.getElementById('login-step-card');
    if (loginCard) loginCard.classList.add('hidden');
    document.getElementById('form-select-section').classList.remove('hidden');
    applyFormLocks(this.studentName);
    this.checkResume();
  },

  /* ── NAME SELECT ── */
  onNameSelect() {
    const val = document.getElementById('name-select').value;
    const pinSec   = document.getElementById('pin-section');
    const guestSec = document.getElementById('guest-name-section');
    document.getElementById('login-error').textContent = '';
    if (!val) { pinSec.classList.add('hidden'); return; }
    pinSec.classList.remove('hidden');
    if (val.startsWith('GUEST:')) {
      guestSec.classList.remove('hidden');
      document.getElementById('pin-label').textContent = '🔒 Enter guest code:';
    } else {
      guestSec.classList.add('hidden');
      document.getElementById('pin-label').textContent = '🔒 Enter your student number:';
    }
    setTimeout(() => document.getElementById('student-pin').focus(), 80);
  },

  /* ── LOGIN ── */
  attemptLogin() {
    const selVal = document.getElementById('name-select').value;
    const pin    = document.getElementById('student-pin').value.trim();
    const errEl  = document.getElementById('login-error');
    errEl.textContent = ''; errEl.style.color = '#c0392b';

    if (!selVal) { errEl.textContent = '⚠️ Please select your name.'; return; }
    if (!pin)    { errEl.textContent = '⚠️ Please enter your student number.'; return; }

    let matched = false, displayName = '';

    if (selVal.startsWith('GUEST:')) {
      const code = selVal.replace('GUEST:', '');
      if (pin === code) {
        const firstName = (document.getElementById('guest-display-name').value || '').trim();
        if (!firstName) { errEl.textContent = '⚠️ Please enter your first name.'; return; }
        matched = true;
        displayName = firstName + ' (Guest)';
      } else {
        errEl.textContent = '❌ Incorrect guest code. Try again.'; return;
      }
    } else {
      const student = ROSTER.find(s => s.name === selVal);
      if (student && student.id === pin) {
        matched = true; displayName = selVal;
      } else {
        errEl.textContent = '❌ Incorrect student number. Try again.'; return;
      }
    }

    if (matched) {
      loggedInName     = displayName;
      this.studentName = displayName;
      document.getElementById('student-pin').value = '';
      document.getElementById('login-error').textContent = '';
      const loginCard = document.getElementById('login-step-card');
      if (loginCard) loginCard.classList.add('hidden');
      document.getElementById('form-select-section').classList.remove('hidden');
      retakeUnlocked = false;   // a PIN unlock never carries over to the next student
      applyFormLocks(displayName);
      this.checkResume();
    }
  },

  /* ── ATTEMPT START ── */
  attemptStart(form) {
    if (!this.studentName || !['Z', 'W', 'P', 'A', 'B', 'T'].includes(form) || !formOpen(form)) return;
    if (form === 'Z' && !preWarmUpShown(this.studentName)) return;
    // The test is one try — a finished one needs a Teacher-PIN retake
    if (form === 'T' && testCompleted(this.studentName)) { applyFormLocks(this.studentName); return; }
    // The gates: Practice A waits for 70% on the Warm-Up; Practice B waits for 70% on Practice A; the Review
    // waits for Practice A + 70% on Practice B; the Test waits for 70% on the Review. The Teacher PIN lets this one student past.
    // The Warm-Up waits for the Pre-Warm-Up after a Warm-Up below the mark; the Pre-Warm-Up locks once the Warm-Up is passed.
    const why = form === 'T' ? testWait(this.studentName) : form === 'B' ? reviewWait(this.studentName)
      : form === 'A' ? practiceBWait(this.studentName) : form === 'P' ? practiceAWait(this.studentName)
      : form === 'W' ? warmUpWait(this.studentName) : form === 'Z' ? preWarmUpWait(this.studentName) : '';
    if (why) {
      this.showPinModal(
        '📘 Not Yet',
        `${getFirstName(this.studentName)}: ${why.charAt(0).toLowerCase() + why.slice(1)}. ` +
        `Teachers: enter your PIN to let this student ${form === 'T' ? 'take the test' : form === 'B' ? 'start the Review' : form === 'A' ? 'start Practice B' : form === 'P' ? 'start Practice A' : form === 'W' ? 'start the Warm-Up' : 'start the Pre-Warm-Up'} now.`,
        () => this.startSession(form)
      );
      return;
    }
    // The Review is two tries; each extra try needs the Teacher PIN. (Practice A and B have no limit.)
    if (form === 'B' && getFormAttempts(this.studentName).B >= 2) {
      this.showPinModal(
        '🔓 Unlock the Review',
        `${getFirstName(this.studentName)} has already taken the Review two times. Enter Teacher PIN to allow an extra try.`,
        () => this.startSession(form)
      );
      return;
    }
    this.startSession(form);
  },

  /* ── RETAKE (Teacher PIN) ── */
  requestRetake() {
    if (!this.studentName) return;
    this.showPinModal(
      '🔑 Allow a Retake',
      `Enter Teacher PIN to let ${getFirstName(this.studentName)} take a retake. The retake has new numbers.`,
      () => { retakeUnlocked = true; applyFormLocks(this.studentName); }
    );
  },

  startRetake() {
    if (!this.studentName || !retakeUnlocked) return;
    retakeUnlocked = false;            // one PIN = one retake
    this.startSession('U');            // the retake: same skills, new numbers
  },

  /* ── 🧑‍🏫 THE TEACHER SCREEN (see TEACHER_KEY) ── */
  promptTeacherReview() {
    if (teacherUnlocked()) { this.openTeacher(); return; }
    this.showPinModal('🧑‍🏫 Teacher', 'Enter the Teacher PIN.', () => {
      try { sessionStorage.setItem(TEACHER_KEY, '1'); } catch (e) {}
      this.openTeacher();
    });
  },

  _teacherPick() {
    let p = null;
    try { p = JSON.parse(sessionStorage.getItem(TEACHER_PICK_KEY) || 'null'); } catch (e) {}
    const form = p && TEACH_PARTS.includes(p.form) ? p.form : 'W';   // the Warm-Up first (the Pre-Warm-Up is for a few students)
    const version = p && p.version >= 1 && p.version <= versionCount(form) ? p.version : 1;
    return { form, version };
  },

  openTeacher() {
    stopActiveSpeech();
    this._renderTeacher(this._teacherPick());
    this.show('teacher-screen');
  },

  /* A part, a version: one row of buttons each; the picked one is filled in. A new part keeps the version when it has
     one that high (the Test and the Retake have one). */
  teacherPick(change) {
    const t = Object.assign(this._teacherPick(), change);
    if (!(t.version >= 1 && t.version <= versionCount(t.form))) t.version = 1;
    this._renderTeacher(t);
  },

  _renderTeacher(t) {
    try { sessionStorage.setItem(TEACHER_PICK_KEY, JSON.stringify(t)); } catch (e) {}
    const btn = (on, label, change, id) =>
      `<button type="button" class="t-pick${on ? ' on' : ''}" data-id="${id}" aria-pressed="${on}" onclick='app.teacherPick(${JSON.stringify(change)})'>${label}</button>`;
    document.getElementById('t-parts').innerHTML = TEACH_PARTS
      .map(f => btn(f === t.form, `${formOpen(f) ? '' : '🔒 '}${FORM_NAMES[f]}`, { form: f }, f)).join('');
    const count = versionCount(t.form);
    document.getElementById('t-version-row').classList.toggle('hidden', count < 2);
    document.getElementById('t-versions').innerHTML = Array.from({ length: count }, (_, i) => i + 1)
      .map(v => btn(v === t.version, `Version ${v}`, { version: v }, v)).join('');
    document.getElementById('t-picked').textContent =
      `${this._teachLabel(t.form, t.version)} · ${formOpen(t.form) ? 'open to students' : '🔒 closed to students'}`;
  },

  _teachLabel(form, version) {
    return `${FORM_NAMES[form]}${versionCount(form) > 1 ? ' · Version ' + version : ''}`;
  },

  _teachBank(t) {
    const V = window['FORM_' + t.form + '_V'];
    return t.version > 1 && Array.isArray(V) && V[t.version - 1] ? V[t.version - 1] : window['FORM_' + t.form];
  },

  /* 👀 Try it as a student: the guest view, started on this part and version */
  teacherTry() {
    const t = this._teacherPick();
    location.href = `${location.pathname}${window.SHARE_LINK}&teach=${t.form}.${t.version}`;
  },

  /* 🖥️ SLIDE MODE (Marcos 10/30: "This would be good if a kid has a question and i can call them up to my desk or the
     board to answer a question and have the actual lesson to refer to"): the TEACHING only — data/slides.js, worked
     examples whose numbers are on no question (tools/difficulty.js checks). The set-up picture first, one step per
     tap, the worked picture with the last step. Never a scored question. Nothing is saved or sent. */
  teacherSlides() {
    const list = window.SLIDES || [];
    if (!list.length) return;
    this._slides = { list, at: 0, step: 0 };
    this.show('slide-screen');
    document.body.classList.add('slides-active');
    const jump = document.getElementById('sl-jump');
    jump.innerHTML = '';
    list.forEach((sl, i) => { const o = document.createElement('option'); o.value = String(i); o.textContent = `${i + 1}. ${sl.title}`; jump.appendChild(o); });
    this._renderSlide();
  },

  _renderSlide() {
    const S = this._slides, sl = S.list[S.at];
    stopActiveSpeech();
    const done = S.step >= sl.steps.length;
    const pic = done ? sl.pic : sl.setup;
    document.getElementById('sl-count').textContent = `Slide ${S.at + 1} of ${S.list.length}`;
    document.getElementById('sl-jump').value = String(S.at);
    document.getElementById('sl-body').innerHTML =
      `<p class="sl-where">👀 Worked example ${S.at + 1} of ${S.list.length}</p><h2 class="sl-h">${formatMathText(sl.title)}</h2>` +
      (pic ? `<div class="sl-pic">${M2V.explainHTML(pic)}</div>` : '') +
      `<ol class="sl-steps">${sl.steps.slice(0, S.step).map((l, i) =>
        `<li class="sl-line${i === S.step - 1 ? ' sl-new' : ''}${done && i === sl.steps.length - 1 ? ' sl-ans' : ''}">${formatMathText(l)}</li>`).join('')}</ol>`;
    const last = S.at + 1 >= S.list.length;
    const next = document.getElementById('sl-next');
    next.disabled = done && last;
    next.textContent = !done ? (S.step === 0 ? '🪜 First step' : S.step === sl.steps.length - 1 ? '✅ Last step' : '🪜 Next step') : last ? '🏁 Last slide' : 'Next slide ▶';
    document.getElementById('sl-back').disabled = S.at === 0 && S.step === 0;
    document.getElementById('sl-prev').disabled = S.at === 0;
    document.getElementById('sl-fwd').disabled = last;
    const newest = document.querySelector('#sl-body .sl-new');
    if (newest) newest.scrollIntoView({ block: 'nearest' }); else window.scrollTo(0, 0);
  },

  slideNext() {
    const S = this._slides;
    if (!S) return;
    if (S.step < S.list[S.at].steps.length) { S.step += 1; this._renderSlide(); return; }
    if (S.at + 1 >= S.list.length) return;
    S.at += 1; S.step = 0;
    this._renderSlide();
  },

  /* Back takes away the last step; at a slide's start it goes to the slide before, all its steps shown */
  slideBack() {
    const S = this._slides;
    if (!S) return;
    if (S.step > 0) { S.step -= 1; this._renderSlide(); return; }
    if (S.at === 0) return;
    S.at -= 1; S.step = S.list[S.at].steps.length;
    this._renderSlide();
  },

  slideGo(i) {
    const S = this._slides;
    if (!S || !(i >= 0 && i < S.list.length)) return;
    S.at = i; S.step = 0;
    this._renderSlide();
  },

  exitSlides() {
    stopActiveSpeech();
    this._slides = null;
    document.getElementById('sl-body').innerHTML = '';
    document.body.classList.remove('slides-active');
    this.openTeacher();
  },

  /* ✅ Answer key: every scored question of the picked part and version, in the data's order, the picture, the right
     choice ✅, and why with the worked picture. A child sees the choices shuffled (shuffleQ), so the key has no letters. */
  teacherKey() {
    const t = this._teacherPick();
    const qs = this._teachBank(t).filter(isScored);
    const why = q => q.explanation || q.explain
      ? `<div class="key-why">${q.explanation ? `<b>Why:</b> ${formatMathText(q.explanation)}` : ''}${q.explain ? M2V.explainHTML(q.explain) : ''}</div>` : '';
    // the paper's own title (Marcos 11/4: "every print version should have a title"): Print hides the bar above,
    // so the printout says which part and version it is
    const html = [`<div class="key-print-head"><h1>Math Module 3 Answer Key — ${this._teachLabel(t.form, t.version)}</h1>` +
      `<p>Times as Many · Mr. O's 4th Grade · ${qs.length} questions, all multiple choice</p></div>`,
      `<p class="key-note">Each child sees the choices in a shuffled order, so there are no letters here. The right answer has a ✅.</p>`];
    qs.forEach((q, i) => {
      const pic = q.pic && !q.explain ? `<div class="key-pic">${M2V.picHTML(q.pic)}</div>` : '';   // the worked picture under Why shows the same model
      const choices = `<ul class="key-choices">${q.choices.map(c =>
        `<li class="${c === q.answer ? 'key-right' : ''}">${formatMathText(c)}${c === q.answer ? ' ✅' : ''}</li>`).join('')}</ul>`;
      const skill = (window.SKILLS || {})[q.id] ? ` · ${window.SKILLS[q.id]}` : '';
      html.push(`<div class="key-q"><p class="key-where">Question ${i + 1}${skill}</p><p class="key-ask">${formatMathText(q.q)}</p>${pic}${choices}${why(q)}</div>`);
    });
    document.getElementById('key-title').textContent = `✅ Answer key · ${this._teachLabel(t.form, t.version)}`;
    document.getElementById('key-body').innerHTML = html.join('');
    this.show('key-screen');
    window.scrollTo(0, 0);
  },

  backToTeacher() {
    stopActiveSpeech();
    if (TEACH) { location.href = `${location.pathname}#teacher`; return; }
    this.openTeacher();
  },

  exitTeacher() {
    try { sessionStorage.removeItem(TEACHER_KEY); } catch (e) {}
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    this.exitReviewMode();
  },

  /* A Try-it link: signed in as the guest, one tap to start (the tap also lets the device speak) */
  _teachReady() {
    const t = TEACH;
    if (!(t.version >= 1 && t.version <= versionCount(t.form))) return;
    this._shareSignIn();
    document.getElementById('student-login-panel').classList.add('hidden');
    document.getElementById('welcome-panel').classList.add('hidden');
    document.getElementById('teach-bar').classList.remove('hidden');
    document.body.classList.add('teach-on');
    document.getElementById('teach-what').textContent = this._teachLabel(t.form, t.version);
    document.getElementById('teach-ready').classList.remove('hidden');
  },

  teachStart() {
    document.getElementById('teach-ready').classList.add('hidden');
    this._teachVersion = TEACH.version;
    this.startSession(TEACH.form);
  },

  /* ⏩ Skip the wait: opens what a student is waiting on right now — the read time before the choices, the Listen on a
     worked example or after a miss, the pause before Next, the score screen's lock. Each opens the way waiting it out or
     hearing it to the end does. */
  teacherSkipWait() {
    stopActiveSpeech();
    if (typeof this._readOpen === 'function') this._readOpen();
    if (typeof this._gateOpen === 'function') this._gateOpen();
    if (this.nextInterval) {
      clearInterval(this.nextInterval);
      this.nextInterval = null;
      document.getElementById('next-timer-bar').classList.add('hidden');
      this.soakDone = true;
    }
    if (this.questionLocked && !document.getElementById('quiz-screen').classList.contains('hidden')) this._maybeShowNext();
    if (typeof this._scoreUnlock === 'function') this._scoreUnlock();
  },

  /* Go anywhere in the run (◀ menu ▶). A question skipped is not scored. */
  _teachList() {
    const tag = q => q.kind === 'watch' ? '👀 Watch' : q.kind === 'step' ? '🪜 Step' : '✏️ Question';
    return (this.currentBank || []).map((q, i) => ({ i, label: `${i + 1}. ${tag(q)}${q.title ? ': ' + q.title : ''}` }));
  },

  _teachSync() {
    const list = this._teachList();
    const jump = document.getElementById('teach-jump');
    document.getElementById('teach-bar').classList.add('started');
    if (jump.options.length !== list.length) {
      jump.innerHTML = '';
      list.forEach((it, k) => { const o = document.createElement('option'); o.value = String(k); o.textContent = it.label; jump.appendChild(o); });
    }
    jump.value = String(this.currentIndex);
    document.getElementById('teach-prev').disabled = this.currentIndex <= 0;
    document.getElementById('teach-next').disabled = this.currentIndex >= list.length - 1;
  },

  teachGo(k) {
    if (!(k >= 0 && k < (this.currentBank || []).length)) return;
    stopActiveSpeech();
    if (this.nextInterval) { clearInterval(this.nextInterval); this.nextInterval = null; }
    if (this.readInterval) { clearInterval(this.readInterval); this.readInterval = null; }
    if (document.getElementById('quiz-screen').classList.contains('hidden')) this.show('quiz-screen');
    this.twin = null;
    this.currentIndex = k;
    this.renderQuestion();
  },

  teachStep(d) { this.teachGo(this.currentIndex + d); },

  exitReviewMode() {
    reviewMode    = false;
    reviewAutoRun = false;
    this.stopTimerEngine();
    const banner = document.getElementById('review-mode-banner');
    if (banner) banner.classList.add('hidden');
    this.show('start-screen');
    document.getElementById('welcome-panel').classList.remove('hidden');
    document.getElementById('student-login-panel').classList.add('hidden');
  },

  /* The question on screen: the "try one like it" twin while one is up, else the form's own question */
  currentQ() {
    return this.twin || (this.currentBank && this.currentBank[this.currentIndex]) || null;
  },

  /* TRY ONE LIKE IT — after a miss in Practice B / the Review, line up the same kind of
     question with new numbers. Not in the teacher's auto-run. */
  _offerTwin() {
    const bank = window['FORM_' + TWINS[this.currentForm]];
    const orig = this.currentBank[this.currentIndex];
    if (!this.lastMissed || !bank || !orig || reviewAutoRun) return false;
    const t = bank.find(x => x.id.slice(1) === orig.id.slice(1));
    if (!t) return false;
    this.twin = { ...t, choices: [...t.choices].sort(() => Math.random() - 0.5), twinOf: orig.id };
    this.lastMissed = false;
    return true;
  },

  _autoAnswer() {
    const q = this.currentQ();
    document.querySelectorAll('.answer-btn').forEach(btn => {
      if (btn.dataset.answer === q.answer) {
        this._selectChoice(q.answer, btn);
      }
    });
    setTimeout(() => this.confirmAnswer(), 600);
  },

  /* ── START SESSION ── */
  startSession(form) {
    this.events = []; this.startedAt = new Date().toISOString();
    this.finishedAt = '';
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(RNDQ_SESSION_ID_KEY);
    tabSwitchCount     = 0;
    const warnBanner = document.getElementById('tab-warning-banner');
    if (warnBanner) warnBanner.classList.add('hidden');
    this.currentForm   = form;
    this.score         = 0;
    this.streak        = 0;
    this.missedQuestions = [];
    this.currentIndex  = 0;
    this.questionLocked = false;   // a finished form leaves it set
    this.twin          = null;
    this.lastMissed    = false;
    this.timerSeconds  = 0;

    // NEW NUMBERS ON A RETRY (Marcos 10/16: "If a student needs to redo the Warmup, Practice A, Practice B, or Review
    // can we have different numbers in the questions? I don't want kids passing just because they remember the answers").
    // FORM_X_V holds the versions (data/form_*.js): try 1 → version 1, try 2 → version 2 … then round again.
    // "Try" = finished tries on this device. Same ids and kinds of question in every version, so the dashboard still
    // compares them question by question; the version rides in the start event.
    const versions = window['FORM_' + form + '_V'];
    const triesDone = (reviewMode || SHARE_MODE) ? 0 : (getFormAttempts(this.studentName)[form] || 0);
    this.version = Array.isArray(versions) && versions.length ? triesDone % versions.length : 0;
    if (this._teachVersion) { this.version = Math.min(this._teachVersion, versionCount(form)) - 1; this._teachVersion = null; }   // 👀 Try it
    const rawBank = [...(this.version ? versions[this.version] : window['FORM_' + form])];

    const shuffleQ = q => {
      if (!q.choices) return { ...q };           // a Warm-Up worked example has no choices
      const shuffled = [...q.choices].sort(() => Math.random() - 0.5);
      return { ...q, choices: shuffled };
    };
    this.currentBank = rawBank.map(shuffleQ);
    // The Warm-Up and Practice A keep their order: easiest first (the Warm-Up's steps belong in order)
    if (!keepsOrder(form)) shuffle(this.currentBank);

    const banner = document.getElementById('review-mode-banner');
    if (banner) {
      banner.classList.toggle('hidden', !reviewMode);
      const label = banner.querySelector('span');
      if (label) label.textContent = reviewAutoRun
        ? '🔍 Teacher Review Mode — auto-run'
        : '🔍 Teacher Review Mode — tap Next to advance';
    }

    this.show('quiz-screen');
    logEvent('start', { v: this.version + 1 });
    this.startTimer();
    this.renderQuestion();
    submitScorePartial();   // on the dashboard as In Progress the moment a student starts (Marcos 11/5)
  },

  /* ── RESUME ── */
  checkResume() {
    const saved = localStorage.getItem(STORAGE_KEY);
    const rc = document.getElementById('resume-container');
    const formSelect = document.getElementById('form-select-section');
    if (saved && rc) {
      const data = JSON.parse(saved);
      if (this.studentName && data.studentName === this.studentName) {
        rc.classList.remove('hidden');
        document.getElementById('resume-detail').textContent =
          `${FORM_NAMES[data.currentForm] || 'Test'} — Q${data.currentIndex + 1} of ${data.currentBank.length}`;
        if (formSelect) formSelect.classList.add('hidden');
      } else {
        rc.classList.add('hidden');
        if (formSelect && this.studentName) formSelect.classList.remove('hidden');
      }
    } else if (rc) {
      rc.classList.add('hidden');
      if (formSelect && this.studentName) formSelect.classList.remove('hidden');
    }
  },

  resumeSession() {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return;
    this.studentName    = saved.studentName;
    this.currentForm    = saved.currentForm;
    this.currentBank    = saved.currentBank;
    this.currentIndex   = saved.currentIndex;
    this.score          = saved.score;
    this.streak         = saved.streak || 0;
    this.missedQuestions = saved.missedQuestions || [];
    this.timerSeconds   = saved.timerSeconds || 0;
    this.events = saved.events || [];
    this.startedAt = saved.startedAt || new Date().toISOString();
    this.version = saved.version || 0;           // the saved questions are already that version's
    this.twin = null; this.lastMissed = false;   // a twin is a bonus question — it is not carried across a restart
    logEvent('resume');
    this.show('quiz-screen');
    this.startTimer();
    // Saved right after answering the last question → nothing left to ask
    if (this.currentIndex >= this.currentBank.length) { this._finishSession(); return; }
    this.renderQuestion();
    if (!this.currentIndex) submitScorePartial();   // a student who comes back shows up again right away (later items send their own)
  },

  saveProgress() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      studentName:     this.studentName,
      currentForm:     this.currentForm,
      currentBank:     this.currentBank,
      currentIndex:    (this.questionLocked || this.twin) ? this.currentIndex + 1 : this.currentIndex, // answered (or on its twin) → resume at the next one
      score:           this.score,
      streak:          this.streak,
      missedQuestions: this.missedQuestions,
      timerSeconds:    this.timerSeconds,
      events: this.events,
      startedAt: this.startedAt,
      version:   this.version || 0
    }));
  },

  discardProgress() {
    this.showPinModal(
      '🗑️ Discard Progress',
      'Enter Teacher PIN to clear the current in-progress session. The student will start fresh.',
      () => {
        localStorage.removeItem(STORAGE_KEY);
        document.getElementById('resume-container').classList.add('hidden');
        applyFormLocks(this.studentName);
        this.checkResume();
      }
    );
  },

  /* ── OVERALL TIMER ── */
  startTimer() {
    this.stopTimerEngine();
    this.timerOn = true;
    this.timerInterval = setInterval(() => {
      this.timerSeconds++;
      this._tickTimer();
      if (this.timerSeconds % 30 === 0) this.saveProgress();
    }, 1000);
  },

  stopTimerEngine() {
    if (this.timerInterval) { clearInterval(this.timerInterval); this.timerInterval = null; }
    this.timerOn = false;
  },

  _tickTimer() {
    const m = String(Math.floor(this.timerSeconds / 60)).padStart(2, '0');
    const s = String(this.timerSeconds % 60).padStart(2, '0');
    const el = document.getElementById('timer-display');
    if (el) el.textContent = `${m}:${s}`;
  },

  /* ── INSTRUCTIONS LOCK (15s) ── */
  startInstructionsTimer() {
    if (this.instructInterval) { clearInterval(this.instructInterval); this.instructInterval = null; }
    const btn   = document.getElementById('ready-btn');
    const fill  = document.getElementById('instruct-fill');
    const count = document.getElementById('instruct-count');
    if (!btn) return;
    if (reviewMode) {
      btn.disabled = false; btn.style.opacity = '1'; btn.style.cursor = 'pointer';
      btn.textContent = "✅ Got It — Let's Begin!";
      return;
    }
    btn.disabled = true;
    btn.style.opacity = '0.45';
    btn.style.cursor  = 'not-allowed';
    if (count) count.textContent = INSTRUCT_SECS;
    if (fill) {
      fill.style.transition = 'none';
      fill.style.width = '100%';
      requestAnimationFrame(() => requestAnimationFrame(() => {
        fill.style.transition = `width ${INSTRUCT_SECS}s linear`;
        fill.style.width = '0%';
      }));
    }
    let remaining = INSTRUCT_SECS;
    this.instructInterval = setInterval(() => {
      remaining--;
      if (count) count.textContent = remaining;
      if (remaining <= 0) {
        clearInterval(this.instructInterval);
        this.instructInterval = null;
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.cursor  = 'pointer';
        btn.textContent   = "✅ Got It — Let's Begin!";
      }
    }, 1000);
  },

  /* ── READING LOCK TIMER (12s) ── */
  startReadTimer() {
    if (this.readInterval) { clearInterval(this.readInterval); this.readInterval = null; }
    const bar   = document.getElementById('reading-timer-bar');
    const fill  = document.getElementById('reading-fill');
    const count = document.getElementById('reading-count');

    if (reviewMode) {
      bar.classList.add('hidden');
      document.querySelectorAll('.answer-btn').forEach(b => {
        b.classList.remove('locked-choice'); b.disabled = false;
      });
      setTimeout(() => this._autoAnswer(), 300);
      return;
    }

    const secs = this.readSecs || READ_SECS;
    bar.classList.remove('hidden');
    count.textContent = secs;

    // Single CSS transition — truly smooth over full duration
    fill.style.transition = 'none';
    fill.style.width = '100%';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      fill.style.transition = `width ${secs}s linear`;
      fill.style.width = '0%';
    }));

    document.querySelectorAll('.answer-btn').forEach(b => {
      b.classList.add('locked-choice');
      b.disabled = true;
    });

    let remaining = secs;
    const open = () => {
      clearInterval(this.readInterval);
      this.readInterval = null;
      this._readOpen = null;
      bar.classList.add('hidden');
      document.querySelectorAll('.answer-btn').forEach(b => {
        b.classList.remove('locked-choice');
        b.disabled = false;
      });
      document.getElementById('confirm-btn').classList.remove('hidden');
    };
    this.readInterval = setInterval(() => {
      remaining--;
      count.textContent = remaining;
      if (remaining <= 0) open();
    }, 1000);
    this._readOpen = open;   // 🧑‍🏫 ⏩ Skip the wait
  },

  /* ── NEXT SOAK TIMER (8s) ── */
  startNextTimer() {
    if (this.nextInterval) { clearInterval(this.nextInterval); this.nextInterval = null; }
    const bar   = document.getElementById('next-timer-bar');
    const fill  = document.getElementById('next-fill');
    const count = document.getElementById('next-count');

    if (reviewMode) {
      bar.classList.add('hidden');
      if (reviewAutoRun) {
        setTimeout(() => this.nextQuestion(), 800);
      } else {
        document.getElementById('next-btn').classList.remove('hidden');
      }
      return;
    }

    const secs = this.nextSecs || NEXT_SECS;
    bar.classList.remove('hidden');
    count.textContent = secs;

    // Single CSS transition — truly smooth over full duration
    fill.style.transition = 'none';
    fill.style.width = '100%';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      fill.style.transition = `width ${secs}s linear`;
      fill.style.width = '0%';
    }));

    let remaining = secs;
    this.nextInterval = setInterval(() => {
      remaining--;
      count.textContent = remaining;
      if (remaining <= 0) {
        clearInterval(this.nextInterval);
        this.nextInterval = null;
        bar.classList.add('hidden');
        this.soakDone = true;
        this._maybeShowNext();
      }
    }, 1000);
  },

  /* ── RENDER QUESTION ── */
  renderQuestion() {
    if (TEACH) this._teachSync();   // 👀 Try it as a student: the bar's menu follows the run
    this._readOpen = null; this._gateOpen = null;
    setPartBanner(this.currentForm);
    const q     = this.currentQ();
    const total = this.currentBank.length;

    document.getElementById('progress-text').textContent = isWarmUp(this.currentForm)
      ? `${q.kind === 'watch' ? '👀 Watch' : q.kind === 'step' ? '🪜 Step by step' : '✏️ Your turn'} · ${this.currentIndex + 1} of ${total}`
      : `Question ${this.currentIndex + 1} of ${total}`;
    this.readSecs = q.kind === 'step' ? STEP_READ_SECS : READ_SECS;
    this.nextSecs = q.kind === 'step' ? STEP_NEXT_SECS : NEXT_SECS;
    // The dashboard hears from a student at every item, the Warm-Up's worked examples included (Marcos 11/5: "people that
    // have started arent showing" — a Warm-Up kid sent nothing until item 6, ~10 minutes in; then "i should know what
    // question they are on"). Item 1 is sent by startSession / resume.
    if (!this.twin && this.currentIndex > 0) submitScorePartial();
    if (q.kind === 'watch') { this._renderWatch(q, total); return; }
    document.getElementById('speak-q-btn').classList.remove('hidden');
    // "Try one like it" strip: shown only while a twin question is up
    const twinNote = document.getElementById('twin-note');
    if (twinNote) twinNote.classList.toggle('hidden', !this.twin);
    document.getElementById('score-text').textContent    = `${getFirstName(this.studentName)} · ${this.score}`;
    document.getElementById('progress-fill').style.width = `${(this.currentIndex / total) * 100}%`;

    this._renderStreak();

    // Question text
    const qtEl = document.getElementById('question-text');
    let qHTML = formatMathText(q.q);
    // Practice B: every question starts with the hint closed. Practice A / Warm-Up: open, and it reads itself (below).
    const sayHint = !!q.hint && autoHint(this.currentForm) && !reviewMode;
    this.hintShown = sayHint;
    if (q.hint) qHTML += hintBoxHTML(q.hint, sayHint);
    qtEl.innerHTML = qHTML;
    // The picture lives outside #question-text, so speakQuestion's
    // word-wrapping never touches it
    document.getElementById('q-visual').innerHTML = M2V.picHTML(q.pic);
    // Word help buttons (not on the tests; the teacher's look at a test shows none either)
    this.mustHear = false;   // set after a miss on a part that teaches (see _armListen)
    this.soakDone = false;
    this.wordOpen = null;
    this._renderWords();

    // Reset feedback / buttons
    const fb = document.getElementById('feedback');
    fb.className = 'feedback-box';
    fb.style.display = 'none';
    fb.textContent = '';

    document.getElementById('confirm-btn').classList.add('hidden');
    document.getElementById('next-btn').classList.add('hidden');
    document.getElementById('next-timer-bar').classList.add('hidden');

    // Build choices
    this.selectedAnswer  = null;
    this.questionLocked  = false;
    const wrap = document.getElementById('answers');
    wrap.innerHTML = '';

    q.choices.forEach((text, i) => {
      const row = document.createElement('div');
      row.className = 'answer-row';

      const speakBtn = document.createElement('button');
      speakBtn.className = 'choice-speak-btn';
      speakBtn.textContent = '🔊';
      speakBtn.title = 'Read this choice aloud';
      speakBtn.onclick = e => {
        e.stopPropagation();
        if (activeSpeakBtn === speakBtn) { stopActiveSpeech(); return; }
        stopActiveSpeech();

        // Wrap choice words in spans on first speak for word-by-word highlighting
        if (!btn.querySelector('.wrd')) {
          const parts = text.split(/(\s+)/);
          let choiceHTML = `<strong>${['A','B','C','D'][i]}.</strong>&nbsp;`;
          parts.forEach(w => { choiceHTML += /^\s+$/.test(w) ? w : (w ? `<span class="wrd">${formatMathText(w)}</span>` : ''); });
          btn.innerHTML = choiceHTML.trim();
        }
        const hlSpans = Array.from(btn.querySelectorAll('.wrd'));

        activeSpeakBtn = speakBtn;
        speakBtn.textContent = '⏹';

        const u = new SpeechSynthesisUtterance(sayWords(hlSpans, text, text.split(/\s+/).filter(Boolean)));
        english(u); u.rate = READ_RATE;
        u.onboundary = e => {
          if (e.name !== 'word') return;
          btn.querySelectorAll('.wrd.hl').forEach(el => el.classList.remove('hl'));
          lightAt(hlSpans, u.text, e.charIndex);
        };
        u.onend = () => {
          btn.querySelectorAll('.wrd.hl').forEach(el => el.classList.remove('hl'));
          if (activeSpeakBtn === speakBtn) { speakBtn.textContent = '🔊'; activeSpeakBtn = null; }
        };
        addHighlightFallback(u, hlSpans);
        window.speechSynthesis.speak(u);
      };

      const btn = document.createElement('button');
      btn.className = 'answer-btn';
      btn.dataset.answer = text;
      btn.innerHTML = `<strong>${['A','B','C','D'][i]}.</strong>&nbsp;${formatMathText(text)}`;
      btn.onclick = () => this._selectChoice(text, btn);

      row.appendChild(speakBtn);
      row.appendChild(btn);
      wrap.appendChild(row);
    });

    this.saveProgress();
    this.startReadTimer();
    if (sayHint) {
      const shownQ = q;
      setTimeout(() => {
        const hb = document.querySelector('#question-text .hint-speak-btn');
        if (hb && this.currentQ() === shownQ && !this.questionLocked && !activeSpeakBtn) speakHint(hb);
      }, 400);
    }
  },

  /* 👀 WATCH (Warm-Up): a worked example. No choices. The student must hear it to the end
     (the same Listen as after a miss), then Next shows. Not scored. */
  _renderWatch(q, total) {
    document.getElementById('twin-note').classList.add('hidden');
    document.getElementById('score-text').textContent = `${getFirstName(this.studentName)} · ${this.score}`;
    document.getElementById('progress-fill').style.width = `${(this.currentIndex / total) * 100}%`;
    this._renderStreak();
    document.getElementById('question-text').innerHTML = `<span class="watch-tag">👀 Watch and listen</span> ${formatMathText(q.title)}`;
    document.getElementById('speak-q-btn').classList.add('hidden');   // the Listen button below reads this screen
    document.getElementById('q-visual').innerHTML = '';
    document.getElementById('q-words').innerHTML = '';
    document.getElementById('answers').innerHTML = '';
    ['confirm-btn', 'next-btn', 'next-timer-bar', 'reading-timer-bar'].forEach(id => document.getElementById(id).classList.add('hidden'));
    this.selectedAnswer = null; this.questionLocked = false; this.hintShown = false; this.wordOpen = null;
    const fb = document.getElementById('feedback');
    fb.className = 'feedback-box teach-box';
    fb.style.display = 'block';
    // one line per place / idea ("\n" in the data); the voice reads it all in one go
    fb.innerHTML = q.text.split('\n').map((line, i, all) => `<div class="watch-line${i === all.length - 1 ? ' watch-sum' : ''}">${wrapWords(formatMathText(line))}</div>`).join('');
    const spans = Array.from(fb.querySelectorAll('.wrd')).filter(el => /[A-Za-z0-9+=×÷−]/.test(el.textContent));
    const spoken = sayWords(spans);
    const small = document.createElement('button');
    small.className = 'speak-btn';
    fb.prepend(small);
    this.soakDone = true;                       // no pause here: hearing it to the end is the wait
    this.mustHear = !reviewMode;
    if (this.mustHear) this._armListen(fb, small, spans, spoken, q.id, () => { this.questionLocked = true; });
    else { small.remove(); this.questionLocked = true; }
    fb.insertAdjacentHTML('beforeend', M2V.explainHTML(q.pic));   // the worked picture, under the Listen button
    this.saveProgress();
    if (reviewMode) {
      document.getElementById('next-btn').classList.remove('hidden');
      if (reviewAutoRun) setTimeout(() => this.nextQuestion(), 1200);
    }
  },

  _selectChoice(text, btn) {
    if (this.questionLocked) return;
    document.querySelectorAll('.answer-btn').forEach(b => b.classList.remove('selected'));
    this.selectedAnswer = text;
    btn.classList.add('selected');
  },

  _renderStreak() {
    const el = document.getElementById('streak-bar');
    if (this.streak >= 3) {
      el.textContent = '🔥'.repeat(Math.min(this.streak, 8)) + ` ${this.streak} in a row!`;
    } else {
      el.textContent = '';
    }
  },

  /* Next appears when the 8 second pause is over and — after a miss — the feedback has been heard */
  _maybeShowNext() {
    if (!this.soakDone || this.mustHear) return;
    const next = document.getElementById('next-btn');
    next.classList.remove('hidden');
    next.scrollIntoView({ block: 'nearest' });
  },

  /* LISTEN, THEN NEXT — the big Listen button under the feedback after a miss (see LISTEN_START_WAIT) */
  _armListen(fb, smallBtn, spans, text, qid, onHeard) {
    smallBtn.style.display = 'none';              // one thing to press
    const row = document.createElement('div');
    row.className = 'listen-row';
    row.innerHTML = `<button type="button" class="listen-btn" id="listen-btn">🔊 Listen</button>` +
      `<span class="listen-note" id="listen-note" aria-live="polite">Listen to the end. Then you can go on.</span>`;
    fb.appendChild(row);
    const btn = row.querySelector('#listen-btn'), note = row.querySelector('#listen-note');
    const words = text.split(/\s+/).filter(Boolean).length;
    const clearHl = () => spans.forEach(el => el.classList.remove('hl'));
    const idle = () => { btn.classList.remove('playing'); btn.textContent = this.mustHear ? '🔊 Listen' : '🔊 Listen again'; };

    const heard = how => {
      if (!this.mustHear || !btn.isConnected) return;
      this._gateOpen = null;
      this.mustHear = false;
      logEvent('heard', { id: qid, how });      // how: 'voice' or 'read' (no sound on the device)
      if (onHeard) onHeard();
      btn.disabled = false; btn.classList.add('heard'); btn.onclick = play; idle();
      note.textContent = '✅ Done. You can go on.';
      this.saveProgress();
      this._maybeShowNext();
    };

    // This device will not speak: wait long enough to read it, then an "I read it" button
    const noVoice = () => {
      clearHl();
      if (!this.mustHear) { idle(); return; }
      btn.classList.remove('playing'); btn.disabled = true; btn.textContent = '⏳ Read it first…';
      note.textContent = 'No sound here. Read it. Then tap the button.';
      setTimeout(() => {
        if (!this.mustHear || !btn.isConnected) return;
        btn.disabled = false; btn.textContent = '✅ I read it';
        btn.onclick = () => heard('read');
      }, listenDwellMs(words));
    };

    const play = () => {
      if (listenJob && !listenJob.settled && listenJob.btn === btn) return;   // a second tap must not cut the voice off
      stopActiveSpeech();
      if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') { noVoice(); return; }
      const job = listenJob = { btn, settled: false, started: false, startTimer: null, watchdog: null };
      const settle = () => { job.settled = true; clearTimeout(job.startTimer); clearTimeout(job.watchdog); clearHl(); };
      const finish = ok => {
        if (job.settled) return;
        settle();
        if (!btn.isConnected) return;
        if (ok && this.mustHear) { heard('voice'); return; }
        idle();
        if (!ok && this.mustHear) note.textContent = 'It stopped early. Tap Listen. Hear it to the end.';
      };
      job.abort = () => finish(false);
      btn.classList.add('playing'); btn.textContent = '🔊 Listening…';
      const u = new SpeechSynthesisUtterance(text);
      english(u); u.rate = READ_RATE;
      u.onstart = () => {
        job.started = true;
        // Some voices never report that they finished. Generous on purpose (about 80 words a minute),
        // so it can only fire after a real voice would be done.
        job.watchdog = setTimeout(() => finish(true), words * 750 + 6000);
      };
      u.onboundary = e => {
        if (e.name !== 'word') return;
        clearHl();
        lightAt(spans, u.text, e.charIndex);
      };
      u.onend = () => finish(true);
      u.onerror = () => { if (job.settled) return; settle(); noVoice(); };
      addHighlightFallback(u, spans);
      job.startTimer = setTimeout(() => {
        if (job.started || job.settled) return;      // no sound started: this device cannot speak
        settle(); window.speechSynthesis.cancel(); noVoice();
      }, LISTEN_START_WAIT);
      window.speechSynthesis.speak(u);
    };
    btn.onclick = play;
    this._gateOpen = () => { if (this.mustHear && btn.isConnected) heard('skip'); };   // 🧑‍🏫 ⏩ Skip the wait
  },

  /* ── CONFIRM ANSWER ── */
  confirmAnswer() {
    if (this.questionLocked) return;   // answered already: a second tap or key must not count it again (10/27)
    if (!this.selectedAnswer) return;
    this.questionLocked = true;

    const q = this.currentQ();
    const correct = this.selectedAnswer === q.answer;
    const isTwin = !!this.twin;
    const isStep = q.kind === 'step';

    if (isStep) {
      // A Warm-Up step is teaching, not a question: it never changes the score and is not a "missed
      // question". It rides in the event log so the dashboard can show which step tripped whom.
      logEvent('step', Object.assign({ id: q.id, ok: correct }, correct ? {} : { pick: this.selectedAnswer }));
    } else if (isTwin) {
      // "Try one like it" never changes the score. The result rides in the event
      // log (the dashboard reads it) and on the miss it follows (the end screen shows it).
      logEvent('twin', Object.assign({ id: q.id, of: q.twinOf, ok: correct }, correct ? {} : { pick: this.selectedAnswer }));
      const m = this.missedQuestions[this.missedQuestions.length - 1];
      if (m && m.id === q.twinOf) m.twin = correct ? 'right' : 'wrong';
    } else if (correct) {
      this.score++;
      this.streak++;
      this.lastMissed = false;
    } else {
      this.streak = 0;
      this.lastMissed = true;
      this.missedQuestions.push({ id: q.id, q: q.q, skill: (window.SKILLS || {})[q.id], yourAnswer: this.selectedAnswer, correct: q.answer, explanation: q.explanation || '' });
    }

    // Practice A, Practice B and the Review teach: the right answer + why, every time.
    // The Test and its retake: mark only the student's own pick — the right
    // answer is never shown (the teacher's review mode still sees it).
    const teach = teaches(this.currentForm) || reviewMode;
    document.querySelectorAll('.answer-btn').forEach(btn => {
      btn.disabled = true;
      if (btn.dataset.answer === this.selectedAnswer) btn.classList.add(correct ? 'correct' : 'incorrect');
      else if (teach && btn.dataset.answer === q.answer) btn.classList.add('correct');
    });

    const fb = document.getElementById('feedback');
    fb.className = 'feedback-box ' + (correct ? 'correct' : 'incorrect');
    fb.style.display = 'block';
    // A wrong answer names the mistake (Marcos 10/10): each wrong choice stands for one slip
    const slip = !correct && teach && q.slips ? q.slips[this.selectedAnswer] : null;
    fb.innerHTML = !teach
      ? (correct ? `✅ <strong>Correct!</strong>` : `❌ <strong>Not quite.</strong>`)
      : correct
        ? `✅ <strong>Correct!</strong>${isTwin ? ' You fixed it!' : ''}<br>${formatMathText(q.explanation)}`
        // After a miss the screen stays short (Marcos 10/10 — too much on a page gets lost): the mistake,
        // the right answer, then the worked picture. The general explanation is only the fallback for a
        // wrong choice with no mistake note; a right answer still gets it.
        : `❌ <strong>Not quite.</strong>${slip ? ` <span class="slip-note">${formatMathText(slip.say)}</span>` : ''} The correct answer is: <strong>${formatMathText(q.answer)}</strong>${slip ? '' : `<br>${formatMathText(q.explanation)}`}`;

    // Feedback read-aloud button
    const fbSpeakBtn = document.createElement('button');
    fbSpeakBtn.className = 'speak-btn';
    fbSpeakBtn.style.cssText = 'float:left;margin:0 10px 4px 0;';
    fbSpeakBtn.textContent = '🔊';
    // Wrap feedback words in spans for word-by-word highlighting (skip emoji-only tokens)
    fb.innerHTML = wrapWords(fb.innerHTML);
    const fbSpans = Array.from(fb.querySelectorAll('.wrd')).filter(s => /[A-Za-z0-9+=×÷−]/.test(s.textContent))   /* keep + − = × ÷ so they are read aloud */;
    const spokenFb = sayWords(fbSpans, fbSpans.map(s => {
      const gap = s.nextSibling && s.nextSibling.nodeType === 3 && /\u00a0{2,}/.test(s.nextSibling.textContent);
      return s.textContent + (gap ? ',' : '');
    }).join(' '));
    fbSpeakBtn.onclick = () => {
      if (activeSpeakBtn === fbSpeakBtn) { stopActiveSpeech(); return; }
      stopActiveSpeech();
      activeSpeakBtn = fbSpeakBtn; fbSpeakBtn.textContent = '⏹';
      const u = new SpeechSynthesisUtterance(spokenFb);
      english(u); u.rate = READ_RATE;
      u.onboundary = e => {
        if (e.name !== 'word') return;
        fbSpans.forEach(el => el.classList.remove('hl'));
        lightAt(fbSpans, u.text, e.charIndex);
      };
      u.onend = () => {
        fbSpans.forEach(el => el.classList.remove('hl'));
        fbSpeakBtn.textContent = '🔊'; if (activeSpeakBtn === fbSpeakBtn) activeSpeakBtn = null;
      };
      addHighlightFallback(u, fbSpans);
      window.speechSynthesis.speak(u);
    };
    fb.prepend(fbSpeakBtn);

    // After a miss the student must HEAR the mistake and the right answer before Next shows
    this.mustHear = teach && !correct && !reviewMode;
    if (this.mustHear) this._armListen(fb, fbSpeakBtn, fbSpans, spokenFb, q.id);

    // Review: show the worked pictures (bar model · rectangle · columns)
    if (teach) fb.insertAdjacentHTML('beforeend', M2V.explainHTML(q.explain));

    document.getElementById('confirm-btn').classList.add('hidden');
    document.getElementById('score-text').textContent = `${getFirstName(this.studentName)} · ${this.score}`;
    this._renderStreak();
    this.saveProgress();
    this.startNextTimer();
  },

  /* ── NEXT QUESTION ── */
  nextQuestion() {
    stopActiveSpeech();
    if (this.twin) {
      this.twin = null;                       // the twin is done → on to the next question of the form
    } else if (TWINS[this.currentForm] && this._offerTwin()) {
      this.renderQuestion();                  // a miss in a review → try one like it
      return;
    }
    this.currentIndex++;
    if (this.currentIndex >= this.currentBank.length) {
      this._finishSession();
    } else {
      this.renderQuestion();
    }
  },

  /* ── FINISH SESSION ── */
  _finishSession() {
    this.twin = null;
    this.finishedAt = new Date().toISOString(); logEvent('finish');
    this.stopTimerEngine();
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(RNDQ_SESSION_ID_KEY);

    const total = scoredCount(this.currentBank);   // the Warm-Up's watch and step items are not scored
    const pct   = Math.round((this.score / total) * 100);
    const date  = new Date();

    const scores   = JSON.parse(localStorage.getItem(SCORES_KEY) || '[]');
    const prevDone = (reviewMode || SHARE_MODE) ? 0 : scores.filter(s => s.name === this.studentName && s.form === this.currentForm && s.done).length;
    const attemptNum = prevDone + 1;
    this.currentAttemptNum = attemptNum;

    if (!reviewMode && !SHARE_MODE) {
      scores.push({
        name:    this.studentName,
        form:    this.currentForm,
        attempt: attemptNum,
        score:   this.score,
        total,
        pct,
        elapsed: this.timerSeconds,
        date:    date.toLocaleDateString(),
        time:    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        done:    true
      });
      localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
    }

    submitScoreFinal();

    let letter = 'F', msg = "Let's practice more! 📚";
    if (pct === 100) { letter = 'A+'; msg = "⭐ PERFECT SCORE! ⭐"; }
    else if (pct >= 90) { letter = 'A'; msg = "Outstanding Work! 🌟"; }
    else if (pct >= 80) { letter = 'B'; msg = "Great Job! 👏"; }
    else if (pct >= 70) { letter = 'C'; msg = "Good Effort! 💪"; }
    else if (pct >= 60) { letter = 'D'; msg = "Keep Practicing! 🔄"; }

    this.show('end-screen');

    const againBtn = document.getElementById('end-again-btn');
    if (againBtn) againBtn.classList.toggle('hidden', reviewMode);
    document.getElementById('end-title').textContent =
      `🎉 ${isTest(this.currentForm) ? 'Test' : FORM_NAMES[this.currentForm]} Complete!`;

    document.getElementById('final-score-sub').textContent = SHARE_MODE
      ? `${FORM_NAMES[this.currentForm]} · Guest view — this score was not saved`
      : `${formLabel(attemptNum)}${attemptNum > 1 ? ' · Attempt ' + attemptNum : ''} · ${this.studentName}`;
    document.getElementById('final-msg').textContent = msg;

    const pctEl = document.getElementById('final-percent');
    pctEl.innerHTML = `${this.score}/${total}<br><small style="font-size:0.5em;color:${pct>=70?'var(--correct)':'var(--danger)'};">${pct}% · ${letter}</small>`;
    setTimeout(() => pctEl.classList.add('revealed'), 50);

    const missedSec = document.getElementById('missed-section');
    // The review shows the fix for every miss; the test shows the pick only.
    const showFix = teaches(this.currentForm) || reviewMode || SHARE_MODE;   // a visitor sees every fix, the test included
    if (this.missedQuestions.length) {
      missedSec.classList.remove('hidden');
      document.getElementById('missed-items').innerHTML =
        this.missedQuestions.map(m =>
          `<div class="missed-item">
            <div class="mi-label">${m.id}</div>
            <div style="margin:3px 0;">${formatMathText(m.q)}</div>
            <div>Your answer: <span style="color:var(--danger);">${formatMathText(m.yourAnswer)}</span>${showFix ? ` &nbsp; ✅ Correct: <strong style="color:var(--correct);">${formatMathText(m.correct)}</strong>` : ''}</div>
            ${showFix && m.explanation ? `<div style="margin-top:5px;font-size:0.85rem;color:#555;font-style:italic;">💡 ${formatMathText(m.explanation)}</div>` : ''}
            ${m.twin ? `<div class="mi-twin ${m.twin}">🔁 Try one like it: ${m.twin === 'right' ? '✅ you got the next one right' : '❌ missed again — ask for help with this one'}</div>` : ''}
          </div>`
        ).join('');
    } else {
      missedSec.classList.add('hidden');
    }

    if (pct >= 70) startConfetti(pct);
  },

  /* 📖 Word help: draw the buttons (and the open card) under the question */
  _renderWords() {
    const box = document.getElementById('q-words');
    if (!box) return;
    const q = this.currentQ();
    // Warm-Up steps get no word help: a card could hand over the step's answer ("how many more" → subtract)
    box.innerHTML = q && wordHelp(this.currentForm) && !q.kind ? wordChipsHTML(q, this.wordOpen) : '';
  },

  /* Tap a word button → its card opens (tap again → closes). Nothing is read until its 🔊 is tapped. */
  showWord(key) {
    const q = this.currentQ();
    if (!q) return;
    stopActiveSpeech();
    const opening = this.wordOpen !== key;
    this.wordOpen = opening ? key : null;
    if (opening) { logEvent('word', { id: q.id, w: key }); this.saveProgress(); }
    this._renderWords();
    const focus = document.querySelector(opening ? '#q-words .word-speak-btn' : `#q-words .word-chip`);
    if (focus) focus.focus();
  },

  /* ── SPEAK QUESTION ── */
  /* 💡 Need a hint? → open the hint box (not read aloud until its own 🔊 is tapped) */
  showHint() {
    const q = this.currentQ();
    const wrap = document.querySelector('#question-text .hint-wrap');
    if (!q || !q.hint || !wrap) return;
    this.hintShown = true;
    // Hint use is saved in the attempt's event log → the dashboard shows who
    // opened which hint (Marcos 10/8: "add hint tracking to dashboard")
    logEvent('hint', { id: q.id });
    this.saveProgress();
    wrap.outerHTML = hintBoxHTML(q.hint, true);
    const btn = document.querySelector('#question-text .hint-speak-btn');
    if (btn) btn.focus();
  },

  speakQuestion() {
    const qBtn = document.getElementById('speak-q-btn');
    if (activeSpeakBtn === qBtn) { stopActiveSpeech(); return; }
    stopActiveSpeech();
    activeSpeakBtn = qBtn;
    qBtn.textContent = '⏹';

    const q = this.currentQ();
    if (!q) return;

    // the hint box is read aloud after the question (class reads mostly at Level 1)
    // the question only — a hint is read by its own 🔊, and only after the student opens it
    const qtEl = document.getElementById('question-text');
    const originalWords = q.q.split(/\s+/);

    let qHTML = '';
    originalWords.forEach((w, i) => {
      qHTML += `<span class="wrd" id="wrd${i}">${formatMathText(w)}</span> `;
    });
    if (q.hint) qHTML += hintBoxHTML(q.hint, this.hintShown);
    qtEl.innerHTML = qHTML;

    const hlSpans = originalWords.map((_, i) => document.getElementById('wrd' + i));
    const spokenText = sayWords(hlSpans, q.q, originalWords);

    const u = new SpeechSynthesisUtterance(spokenText);
    english(u); u.rate = READ_RATE;

    u.onboundary = e => {
      if (e.name !== 'word') return;
      document.querySelectorAll('#question-text .wrd.hl').forEach(el => el.classList.remove('hl'));
      lightAt(hlSpans, u.text, e.charIndex);
    };
    u.onend = () => {
      document.querySelectorAll('#question-text .wrd.hl').forEach(el => el.classList.remove('hl'));
      if (activeSpeakBtn === qBtn) { qBtn.textContent = '🔊'; activeSpeakBtn = null; }
    };
    addHighlightFallback(u, hlSpans.filter(Boolean));
    window.speechSynthesis.speak(u);
  },

  /* ── SCORES ── */
  showScores(autoShow = false) {
    this.show('scoreboard-screen');
    const teacherBtns = document.getElementById('teacher-score-btns');
    if (teacherBtns) teacherBtns.style.display = this.studentName === 'Mr. O (Teacher)' ? 'flex' : 'none';
    if (!reviewMode) this._startScoreLock(autoShow ? 60 : 0);

    const all    = JSON.parse(localStorage.getItem(SCORES_KEY) || '[]');
    const listEl = document.getElementById('score-list');
    const noEl   = document.getElementById('no-scores-msg');

    if (!all.length) {
      listEl.innerHTML = '';
      noEl.style.display = 'block';
      return;
    }
    noEl.style.display = 'none';

    const forms = FORMS;

    const summaryCards = forms.map(form => {
      const best = all.filter(s => s.form === form && s.done)
        .reduce((b, r) => (!b || r.pct > b.pct) ? r : b, null);
      if (!best) {
        return `<div class="sb-summary-card">
          <div class="sb-summary-label">${FORM_NAMES[form]}</div>
          <div class="sb-summary-grade" style="color:#ccc;">—</div>
          <div class="sb-summary-score" style="color:#aaa;">Not yet completed</div>
        </div>`;
      }
      const grade = letterGrade(best.pct);
      const gc = best.pct>=90?'#27ae60':best.pct>=80?'#2980b9':best.pct>=70?'#f39c12':best.pct>=60?'#e67e22':'#e74c3c';
      return `<div class="sb-summary-card">
        <div class="sb-summary-label">${FORM_NAMES[form]}</div>
        <div class="sb-summary-grade" style="color:${gc};">${grade}</div>
        <div class="sb-summary-score">${best.score}/${best.total} · ${best.pct}%</div>
        <div class="sb-summary-attempt">Best of ${all.filter(s=>s.form===form&&s.done).length} attempt(s)</div>
      </div>`;
    }).join('');

    const details = forms.map(form => {
      const rows = all.filter(s => s.form === form && s.done);
      if (!rows.length) return '';
      const att1 = rows.filter(r => (r.attempt||1) === 1);
      const att2 = rows.filter(r => (r.attempt||1) >= 2);

      const buildTable = (attempts, label, headerColor) => {
        if (!attempts.length) return '';
        return `<div style="margin-bottom:14px;">
          <div style="display:inline-block;background:${headerColor};color:white;
                      font-size:0.72rem;font-weight:bold;letter-spacing:1px;
                      text-transform:uppercase;border-radius:6px;padding:3px 10px;
                      margin-bottom:6px;">${label}</div>
          <table class="scoreboard-table">
            <thead><tr><th>Score</th><th>%</th><th>Grade</th><th>Time</th><th>Date</th></tr></thead>
            <tbody>${attempts.map(r => {
              const grade = letterGrade(r.pct);
              const cls   = r.pct>=90?'score-good':r.pct>=70?'score-ok':'score-bad';
              return `<tr>
                <td>${r.score}/${r.total}</td>
                <td class="${cls}">${r.pct}%</td>
                <td class="${cls}" style="font-weight:800;">${grade}</td>
                <td>${r.time||'—'}</td>
                <td>${r.date}</td>
              </tr>`;
            }).join('')}</tbody>
          </table>
        </div>`;
      };

      return `<h3 style="color:var(--primary);margin:22px 0 8px;border-bottom:2px solid #e0e0e0;padding-bottom:6px;">${FORM_NAMES[form]}</h3>
        ${buildTable(att1,'Attempt 1','#5b3cc4')}
        ${buildTable(att2,'Attempt 2','#f39c12')}`;
    }).join('');

    listEl.innerHTML = `
      <div style="margin-bottom:6px;font-size:0.8rem;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:1px;">Your Best Scores</div>
      <div class="sb-summary-row">${summaryCards}</div>
      <div style="margin-top:24px;">${details}</div>`;
  },

  _startScoreLock(secs) {
    const bar     = document.getElementById('sb-lock-bar');
    const fill    = document.getElementById('sb-lock-fill');
    const count   = document.getElementById('sb-lock-count');
    const buttons = document.querySelectorAll('#scoreboard-screen button:not(#sb-lock-bar button)');
    if (!secs || secs <= 0) { if (bar) bar.classList.add('hidden'); return; }
    bar.classList.remove('hidden');
    fill.style.width = '100%';
    count.textContent = secs;
    buttons.forEach(b => { b.disabled = true; b.style.opacity = '0.4'; });
    let remaining = secs;
    const open = () => { clearInterval(iv); bar.classList.add('hidden'); buttons.forEach(b => { b.disabled = false; b.style.opacity = '1'; }); this._scoreUnlock = null; };
    const iv = setInterval(() => {
      remaining--;
      count.textContent = remaining;
      fill.style.width = (remaining / secs * 100) + '%';
      if (remaining <= 0) open();
    }, 1000);
    this._scoreUnlock = open;   // 🧑‍🏫 ⏩ Skip the wait
  },

  clearScores() {
    const panel = document.getElementById('clear-confirm-panel');
    panel.classList.remove('hidden');
    document.getElementById('clear-pin-input').value = '';
    document.getElementById('clear-pin-error').textContent = '';
    setTimeout(() => document.getElementById('clear-pin-input').focus(), 80);
  },

  confirmClearScores() {
    const pin = document.getElementById('clear-pin-input').value.trim();
    if (pin === '9377') {
      localStorage.removeItem(SCORES_KEY);
      document.getElementById('clear-confirm-panel').classList.add('hidden');
      this.showScores();
    } else {
      document.getElementById('clear-pin-error').textContent = '❌ Incorrect PIN. Try again.';
      document.getElementById('clear-pin-input').value = '';
      document.getElementById('clear-pin-input').focus();
    }
  },

  cancelClearScores() {
    document.getElementById('clear-confirm-panel').classList.add('hidden');
  },

  printResults() {
    const all = JSON.parse(localStorage.getItem(SCORES_KEY) || '[]');
    if (!all.length) { alert('No scores to print yet!'); return; }
    const rows = FORMS.flatMap(form =>
      all.filter(s => s.form === form).map(r => {
        const cc  = r.pct >= 80 ? 'good' : r.pct >= 60 ? 'ok' : 'bad';
        const att = r.attempt || 1;
        const attStyle = att === 1
          ? 'background:#d35400;color:white;padding:2px 7px;border-radius:4px;font-size:0.8em;'
          : 'background:#f39c12;color:#5a3000;padding:2px 7px;border-radius:4px;font-size:0.8em;';
        return `<tr>
          <td>${r.name||'—'}</td>
          <td>${FORM_NAMES[r.form] || 'Form ' + r.form}</td>
          <td><span style="${attStyle}">Attempt ${att}</span></td>
          <td>${r.score}/${r.total}</td>
          <td class="${cc}">${r.pct}%</td>
          <td>${r.time||'—'}</td>
          <td>${r.date}</td>
        </tr>`;
      })
    ).join('');
    const html = `<html><head><title>Math Module 3 Review and Test Scores</title>
      <style>body{font-family:Arial;padding:20px;}h2{color:#5b3cc4;}
      table{width:100%;border-collapse:collapse;margin-top:12px;}
      th,td{border:1px solid #ccc;padding:8px 12px;text-align:center;}
      th{background:#5b3cc4;color:white;}
      .good{color:green;font-weight:bold;}.ok{color:orange;font-weight:bold;}.bad{color:red;font-weight:bold;}</style>
      </head><body>
      <h2>🧮 Math Module 3 Review and Test — Score Report</h2>
      <p>Printed: ${new Date().toLocaleString()}</p>
      <table><tr><th>Name</th><th>Form</th><th>Attempt</th><th>Score</th><th>%</th><th>Time</th><th>Date</th></tr>${rows}</table>
      </body></html>`;
    const w = window.open('', '_blank');
    w.document.write(html); w.document.close(); w.print();
  },

  /* ── END SCREEN ACTIONS ── */
  tryAgain() {
    stopConfetti();
    this.timerSeconds = 0;
    this.show('start-screen');
    document.getElementById('welcome-panel').classList.add('hidden');
    document.getElementById('student-login-panel').classList.remove('hidden');
    applyFormLocks(this.studentName);
    this.checkResume();
  },

  /* Marcos 10/14: "Back to …" keeps a signed-in student signed in; only Sign Out starts over. */
  backToMenu() {
    if (!this.studentName) { this.restart(); return; }
    this.tryAgain();
  },

  restart() {
    stopConfetti();
    this.stopTimerEngine();
    this.timerSeconds   = 0;
    this.studentName    = '';
    loggedInName        = '';
    unlockedForms       = new Set();
    retakeUnlocked      = false;
    document.getElementById('name-select').value = '';
    document.getElementById('student-pin').value = '';
    document.getElementById('pin-section').classList.add('hidden');
    document.getElementById('form-select-section').classList.add('hidden');
    document.getElementById('resume-container').classList.add('hidden');
    document.getElementById('login-error').textContent = '';
    const loginCard = document.getElementById('login-step-card');
    if (loginCard) loginCard.classList.remove('hidden');
    this.show('start-screen');
    document.getElementById('welcome-panel').classList.remove('hidden');
    document.getElementById('student-login-panel').classList.add('hidden');
  },

  /* ── GLOBAL PIN MODAL ── */
  showPinModal(title, msg, onSuccess) {
    pinModalCallback = onSuccess;
    document.getElementById('pin-modal-title').textContent = title;
    document.getElementById('pin-modal-msg').textContent   = msg;
    document.getElementById('pin-modal-input').value       = '';
    document.getElementById('pin-modal-error').textContent = '';
    document.getElementById('pin-modal').classList.remove('hidden');
    setTimeout(() => document.getElementById('pin-modal-input').focus(), 80);
  },

  confirmPinModal() {
    const pin = document.getElementById('pin-modal-input').value.trim();
    if (pin === '9377') {
      document.getElementById('pin-modal').classList.add('hidden');
      const cb = pinModalCallback;
      pinModalCallback = null;
      if (cb) cb();
    } else {
      document.getElementById('pin-modal-error').textContent = '❌ Incorrect PIN. Try again.';
      document.getElementById('pin-modal-input').value = '';
      document.getElementById('pin-modal-input').focus();
    }
  },

  cancelPinModal() {
    document.getElementById('pin-modal').classList.add('hidden');
    pinModalCallback = null;
  }
};

/* ── LEAVING ENDS THE READ-ALOUD ──────────────────────
   Marcos 10/23 (the QPS hub): "if I leave I still hear the read aloud". Another tab or leaving the
   site ends everything being read — the Read Aloud screen, a question, a Listen — for good, not
   just the sentence being said (the Read Aloud screen used to go on to its next sentence). */
function hushReadAloud() {
  introToken++; clearTimeout(introTimer);
  stopActiveSpeech();
}
window.addEventListener('pagehide', hushReadAloud);
document.addEventListener('visibilitychange', () => { if (document.hidden) hushReadAloud(); });

/* ── VISIBILITY / UNLOAD ─────────────────────────────── */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (!app.timerOn) return;
    tabSwitchCount++;
    logEvent('leave');
    app.stopTimerEngine();
    app.saveProgress();
    if (app.instructInterval) { clearInterval(app.instructInterval); }
    if (app.readInterval)     { clearInterval(app.readInterval); app.readInterval = null; app._readLockPaused = true; }
    app._wasTimerRunning = true;
  } else {
    if (!app._wasTimerRunning) return;
    app._wasTimerRunning = false;
    logEvent('return');
    const warnBanner = document.getElementById('tab-warning-banner');
    if (warnBanner) warnBanner.classList.remove('hidden');
    app.stopTimerEngine();
    app.timerInterval = setInterval(() => {
      app.timerSeconds++;
      app._tickTimer();
      if (app.timerSeconds % 30 === 0) app.saveProgress();
    }, 1000);
    app.timerOn = true;
    // The read lock stopped while the page was hidden; start it over so the
    // answers unlock again (left alone they stayed locked until a refresh).
    if (app._readLockPaused) { app._readLockPaused = false; app.startReadTimer(); }
  }
});

window.addEventListener('beforeunload', () => {
  if (app.timerOn) logEvent('close');
  if (app.timerOn) app.saveProgress();
});

/* ── CONFETTI ────────────────────────────────────────── */
const canvas = document.getElementById('confetti-canvas');
const ctx    = canvas.getContext('2d');
let particles = [], animId = null;

function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', resize); resize();

function startConfetti(pct) {
  particles = [];
  let count, cols;
  if (pct === 100) {
    count = 300;
    cols = ['#FFD700','#FFA500','#FFFACD','#f39c12','#ffffff','#FFD700'];
  } else if (pct >= 90) {
    count = 220;
    cols = ['#d35400','#f39c12','#2ecc71','#3498db','#9b59b6','#e74c3c','#FFD700'];
  } else if (pct >= 80) {
    count = 160;
    cols = ['#d35400','#f39c12','#2ecc71','#3498db','#e74c3c','#9b59b6'];
  } else {
    count = 80;
    cols = ['#d35400','#f39c12','#7f8c8d','#95a5a6','#bdc3c7'];
  }
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      c: cols[~~(Math.random() * cols.length)],
      s: Math.random() * 5 + 3,
      d: Math.random() * 5 + 2,
      r: Math.random() * Math.PI * 2
    });
  }
  animateConfetti();
}

function animateConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r += 0.05);
    ctx.fillStyle = p.c; ctx.fillRect(-p.s/2, -p.s/2, p.s, p.s);
    ctx.restore();
    p.y += p.d; p.x += Math.sin(p.r) * 1.5;
    if (p.y > canvas.height) { p.y = -10; p.x = Math.random() * canvas.width; }
  });
  animId = requestAnimationFrame(animateConfetti);
}

function stopConfetti() {
  if (animId) cancelAnimationFrame(animId);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  animId = null;
}

/* 🖥️ Slide Mode: the arrow keys and a clicker's Page Down / Page Up (Space too, unless a button has the keyboard) */
document.addEventListener('keydown', e => {
  if (!app._slides || document.getElementById('slide-screen').classList.contains('hidden')) return;
  const tag = (e.target && e.target.tagName) || '';
  if (tag === 'SELECT' || tag === 'INPUT' || tag === 'TEXTAREA') return;
  const k = e.key;
  if (k === 'ArrowRight' || k === 'PageDown' || (k === ' ' && tag !== 'BUTTON')) { e.preventDefault(); app.slideNext(); }
  else if (k === 'ArrowLeft' || k === 'PageUp') { e.preventDefault(); app.slideBack(); }
});

/* ── BOOT ────────────────────────────────────────────── */
app.init();
if (TEACH) app._teachReady();
else if (location.hash === '#teacher' && teacherUnlocked()) app.openTeacher();

/* ── CLOSED-TO-STUDENTS LOCK ────────────────────────── */
(function applyReviewLock() {
  if (SHARE_MODE || ANY_OPEN) return;   // any part open → students can get in
  const btn = document.querySelector('.lgs-btn');
  if (!btn) return;
  btn.disabled = true;
  btn.classList.add('locked');
  btn.textContent = '🔒 Not Open Yet';
  const note = document.createElement('p');
  note.className = 'locked-note';
  note.textContent = "Mr. O will let you know when this is ready!";
  btn.insertAdjacentElement('afterend', note);
})();

/* ── A KEY ON A HIDDEN BUTTON DOES NOTHING (10/27/2026) ──
   After a tap the keyboard stays on that button, even once it is hidden, so Enter or Space pressed it
   again: a right answer counted twice (13 of 12 on Vocab Practice) and Next skipped a question.
   Enter and Space on a button that is hidden or turned off are now ignored. */
['keydown', 'keyup'].forEach(type => document.addEventListener(type, e => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const el = document.activeElement;
  if (el && el.tagName === 'BUTTON' && (el.disabled || !el.getClientRects().length)) {
    e.preventDefault();
    e.stopPropagation();
  }
}, true));
