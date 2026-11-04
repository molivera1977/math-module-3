/* ═══════════════════════════════════════════════════════
   MATH MODULE 2 REVIEW AND TEST · visuals.js
   The pictures that go with a question or its explanation.
   Each one is built from numbers in the data file, so the
   picture can never disagree with the answer:
   - stack : the problem worked in columns, with the regrouping
             marks a student would write (carried 1s when adding,
             crossed-out digits when subtracting)
   - rect  : a rectangle or square with its sides labeled
   - bar   : the parts / total bar model for comparison problems
             (same model as the M1–M2 review homework)
   - work  : short lines of work, used for the rounding estimates
   A question can carry `pic` (shown under the question) and
   `explain` (shown in the feedback when the form teaches).
   Under a question nothing gives the answer away: the columns end
   in "?", the bar model's missing part is "?", no regroup marks.
═══════════════════════════════════════════════════════ */
(function (root) {
  const fmt = n => Number(n).toLocaleString('en-US');
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  /* ── COLUMN WORK ─────────────────────────────────────
     Works a + b or a − b the way the standard algorithm does, right to
     left, and keeps what a student writes above the top number:
     adding      → a small 1 over the next place each time a place makes 10+
     subtracting → the new value over every top digit that changed
                   (5,032 − 3,981: the 5 becomes 4, the 0 becomes 9, the 3 becomes 13) */
  function stackModel(a, b, op) {
    const res = op === '+' ? a + b : a - b;
    const n = Math.max(String(a).length, String(b).length, String(res).length);
    const pad = v => String(v).padStart(n, ' ').split('');
    const A = pad(a), B = pad(b), R = pad(res);
    const digit = (arr, i) => (arr[i] === ' ' ? 0 : Number(arr[i]));
    const marks = new Array(n).fill('');
    const struck = new Array(n).fill(false);
    if (op === '+') {
      let carry = 0;
      for (let i = n - 1; i >= 0; i--) {
        if (carry) marks[i] = '1';
        carry = digit(A, i) + digit(B, i) + carry >= 10 ? 1 : 0;
      }
    } else {
      let borrow = 0;
      for (let i = n - 1; i >= 0; i--) {
        let cur = digit(A, i) - borrow;
        if (cur < digit(B, i)) { cur += 10; borrow = 1; } else { borrow = 0; }
        if (A[i] !== ' ' && cur !== digit(A, i)) { marks[i] = String(cur); struck[i] = true; }
      }
    }
    return { n, A, B, R, marks, struck, res };
  }

  /* WARM-UP STEPS (Marcos 10/15): the problem part-way worked, one place at a time.
     cfg.step = { upto, now, regrouped }
       upto      = how many places are already done, counting from the ones (their answer digits show)
       now       = the next place is the one being worked: it is highlighted and its answer is "?"
       regrouped = that place has already regrouped (subtracting): its new value and the place it took 1 from show
     Worked the same way stackModel works it, place by place, so a step picture can never disagree
     with the finished columns. (No regrouping across a 0 here — the Warm-Up does not use one.) */
  function stepState(cfg) {
    const m = stackModel(cfg.a, cfg.b, cfg.op);
    const n = m.n, st = cfg.step || {}, upto = st.upto || 0;
    const digit = (arr, i) => (arr[i] === ' ' ? 0 : Number(arr[i]));
    const R = new Array(n).fill(' '), marks = new Array(n).fill(''), struck = new Array(n).fill(false);
    if (cfg.op === '+') {
      let carry = 0;
      for (let r = 0; r < upto && r < n; r++) {
        const i = n - 1 - r, sum = digit(m.A, i) + digit(m.B, i) + carry;
        R[i] = String(sum % 10);
        carry = sum >= 10 ? 1 : 0;
        if (carry && i > 0) marks[i - 1] = '1';
      }
    } else {
      const cur = m.A.map(ch => (ch === ' ' ? null : Number(ch)));
      const borrow = i => { cur[i] += 10; cur[i - 1] -= 1; };
      for (let r = 0; r < upto && r < n; r++) {
        const i = n - 1 - r;
        if (cur[i] < digit(m.B, i)) borrow(i);
        R[i] = cur[i] - digit(m.B, i) === 0 && i === 0 ? ' ' : String(cur[i] - digit(m.B, i));
      }
      if (st.regrouped && upto < n) borrow(n - 1 - upto);
      cur.forEach((v, i) => { if (v !== null && v !== digit(m.A, i)) { marks[i] = String(v); struck[i] = true; } });
    }
    const nowAt = st.now && upto < n ? n - 1 - upto : -1;
    if (nowAt >= 0) R[nowAt] = '?';
    return { m, R, marks, struck, nowAt };
  }

  /* mode 'worked' (default) = the answer and the regrouping marks ·
     'ask' = the problem set up in columns, "?" for the answer, no marks ·
     'done' = the answer shown, no marks (a finished problem to look at) */
  function stackHTML(cfg, mode) {
    mode = cfg.step ? 'step' : (mode || 'worked');
    const m = stackModel(cfg.a, cfg.b, cfg.op);
    let nowAt = -1;
    if (mode === 'step') {
      const s = stepState(cfg);
      m.R = s.R; m.marks = s.marks; m.struck = s.struck; nowAt = s.nowAt;
    }
    if (mode !== 'worked' && mode !== 'step') { m.marks.fill(''); m.struck.fill(false); }
    if (mode === 'ask') m.R = m.R.map((ch, i) => (i === m.n - 1 ? '?' : ' '));
    const sign = cfg.op === '+' ? '+' : '−';
    // the thousands digit (and the millions digit) carries the comma
    const cell = (ch, i, cls) => {
      const fromRight = m.n - 1 - i;
      const comma = ch !== ' ' && fromRight > 0 && fromRight % 3 === 0;
      const klass = [cls, comma ? 'm2-comma' : '', i === nowAt ? 'm2-now' : ''].filter(Boolean).join(' ');
      return `<td${klass ? ` class="${klass}"` : ''}>${ch === ' ' ? '' : ch}</td>`;
    };
    const row = (arr, cls, lead, each) =>
      `<tr${cls ? ` class="${cls}"` : ''}><td class="m2-op">${lead}</td>${arr.map((ch, i) => cell(ch, i, each ? each(i) : '')).join('')}</tr>`;
    const hasMarks = m.marks.some(Boolean);
    const marksRow = hasMarks
      ? `<tr class="m2-marks"><td class="m2-op"></td>${m.marks.map((v, i) => `<td${i === nowAt ? ' class="m2-now"' : ''}>${v}</td>`).join('')}</tr>` : '';
    const said = `${fmt(cfg.a)} ${cfg.op === '+' ? 'plus' : 'minus'} ${fmt(cfg.b)}` +
      (mode === 'ask' || mode === 'step' ? ', written in columns' : ` equals ${fmt(m.res)}, ${mode === 'done' ? 'written' : 'worked'} in columns`);
    return `<div class="m2-vis m2-stack-wrap"><table class="m2-stack" role="img" aria-label="${said}">` +
      marksRow +
      row(m.A, '', '', i => (m.struck[i] ? 'm2-struck' : '')) +
      row(m.B, 'm2-bot', sign) +
      row(m.R, mode === 'ask' ? 'm2-ans m2-ask' : mode === 'step' ? 'm2-ans m2-step' : 'm2-ans', '') +
      `</table></div>`;
  }

  /* ── RECTANGLE / SQUARE ──────────────────────────────
     cfg = { l, w, unit, sides: 'all' | 'one', name }
     sides 'all' labels all four sides (the worked picture);
     sides 'one' labels a single side (a square in a question). */
  function rectSVG(cfg) {
    const W = 640, H = 210, RH = 112;
    const ratio = Math.max(1, Math.min(2.4, cfg.l / cfg.w));
    const RW = Math.round(RH * ratio);
    const x0 = (W - RW) / 2, y0 = 48;
    // lenLabel / widLabel let a word card label the sides with words ("length", "width")
    const lenLabel = cfg.lenLabel || `${cfg.l} ${cfg.unit}`, widLabel = cfg.widLabel || `${cfg.w} ${cfg.unit}`;
    const square = cfg.l === cfg.w;
    let s = `<rect x="${x0}" y="${y0}" width="${RW}" height="${RH}" rx="3" class="m2-rect-shape"/>`;
    if (cfg.name) {
      const lines = String(cfg.name).split('\n');
      const top = y0 + RH / 2 - (lines.length - 1) * 11 + 6;
      lines.forEach((ln, i) => { s += `<text x="${W / 2}" y="${top + i * 22}" class="m2-rect-name">${esc(ln)}</text>`; });
    }
    s += `<text x="${x0 + RW + 14}" y="${y0 + RH / 2 + 7}" class="m2-rect-label m2-rect-side">${esc(widLabel)}</text>`;
    if (cfg.sides === 'all' || !square) {
      s += `<text x="${W / 2}" y="${y0 - 12}" class="m2-rect-label">${esc(lenLabel)}</text>`;
    }
    if (cfg.sides === 'all') {
      s += `<text x="${W / 2}" y="${y0 + RH + 28}" class="m2-rect-label">${esc(lenLabel)}</text>`;
      s += `<text x="${x0 - 14}" y="${y0 + RH / 2 + 7}" class="m2-rect-label m2-rect-side-left">${esc(widLabel)}</text>`;
    }
    const said = square
      ? `A square. Each side is ${lenLabel}.`
      : `A rectangle. It is ${lenLabel} long and ${widLabel} wide.`;
    return `<div class="m2-vis m2-rect-wrap"><svg viewBox="0 0 ${W} ${H}" class="m2-rect" role="img" aria-label="${esc(said)}">${s}</svg></div>`;
  }

  /* ── BAR MODEL (parts on top, total on the bottom) ───
     cfg = { total, part, answer } — the answer is the other part, shown in
     green in the explanation. With no answer (under a question) it is "?". */
  function barHTML(cfg) {
    const share = Math.max(28, Math.min(72, Math.round(cfg.part / cfg.total * 100)));
    const ask = cfg.answer == null;
    const said = `Bar model. The total is ${fmt(cfg.total)}. One part is ${fmt(cfg.part)}. The other part is ${ask ? 'missing' : fmt(cfg.answer)}.`;
    return `<div class="m2-vis m2-bar" role="img" aria-label="${said}">` +
      `<div class="m2-bar-labs" aria-hidden="true"><span>Parts</span><span>Total</span></div>` +
      `<div class="m2-bar-box" aria-hidden="true">` +
        `<div class="m2-bar-top" style="grid-template-columns:${share}fr ${100 - share}fr">` +
          `<div>${fmt(cfg.part)}</div><div class="${ask ? 'm2-bar-ask' : 'm2-bar-ans'}">${ask ? '?' : fmt(cfg.answer)}</div></div>` +
        `<div class="m2-bar-bot">${fmt(cfg.total)}</div>` +
      `</div></div>`;
  }

  /* ── LINES OF WORK (rounding, then adding or subtracting) ── */
  function workHTML(lines, plain) {     // plain = under a question: no "answer" line at the bottom
    const said = lines.map(l => l.replace(/←/g, 'is below').replace(/→ \?/g, 'rounds to what').replace(/→/g, 'rounds to').replace(/−/g, 'minus').replace(/\+/g, 'plus').replace(/=/g, 'equals')).join('. ');
    return `<div class="m2-vis m2-work" role="img" aria-label="${esc(said)}">` +
      lines.map((l, i) => `<div${!plain && lines.length > 1 && i === lines.length - 1 ? ' class="m2-work-last"' : ''} aria-hidden="true">${esc(l)}</div>`).join('') +
      `</div>`;
  }

  /* ── TIMES AS MANY BAR MODEL (Module 3 — Marcos's frame, 10/22) ──
     Names at the side, 1 box on top, t equal boxes below, a bracket with the total.
     cfg = { top, bottom, n, t, ask, total?, letter?, more? }
       n      = what each box holds: a number, '?' or a letter
       ask    = 'total'  → bracket shows "?"            (find the bigger amount)
                'small'  → boxes hold n ('?' or a letter), bracket shows the total
                'letter' → bracket shows the letter      (pick the equation)
                'times'  → the bottom is ONE long bar with the total: drawing
                           t boxes would give the answer away
                null     → worked: the bracket shows t × n in green
       more   = shade boxes 2…t (the "how many more" part of a two-step problem) */
  function multHTML(cfg) {
    const t = cfg.t, num = typeof cfg.n === 'number';
    const cell = v => (typeof v === 'number' ? fmt(v) : esc(String(v)));
    const total = num ? t * cfg.n : cfg.total;
    const who = name => `<div class="m3-who${name ? '' : ' m3-who-empty'}" aria-hidden="true">${esc(name || '')}</div>`;   // no names: a plain number question
    const askCls = num ? '' : ' m3-ask';
    let bottom, brk, said;
    if (cfg.ask === 'times') {
      bottom = `<div class="m3-row"><div class="m3-cell m3-long">${cell(cfg.total)}</div></div>`;
      brk = `<div class="m3-brk-lab">? times as many</div>`;
      said = `Bar model. ${cfg.top ? `The top bar is ${cfg.top}: ` : 'The top bar is '}one group of ${cell(cfg.n)}. ${cfg.bottom ? `The bottom bar is ${cfg.bottom}. The total for ${cfg.bottom} is` : 'The bottom bar holds'} ${cell(cfg.total)}. How many times as many is missing.`;
    } else {
      const cells = Array.from({ length: t }, (_, i) =>
        `<div class="m3-cell${askCls}${cfg.more && cfg.ask == null && i > 0 ? ' m3-more' : ''}">${cell(cfg.n)}</div>`).join('');
      bottom = `<div class="m3-row">${cells}</div>`;
      const lab = cfg.ask === 'total' ? '?' : cfg.ask === 'letter' ? esc(cfg.letter) : cfg.ask === 'small' ? cell(cfg.total) : cell(total);
      brk = `<div class="m3-brk" aria-hidden="true"></div><div class="m3-brk-lab${cfg.ask == null ? ' m3-ans' : ''}">${lab}</div>`;
      said = `Bar model. ${cfg.top ? `The top bar is ${cfg.top}: ` : 'The top bar is '}one group of ${cell(cfg.n)}. ${cfg.bottom ? `The bottom bar is ${cfg.bottom}: ` : 'The bottom bar is '}${t} groups of ${cell(cfg.n)}. ${cfg.bottom ? `The total for ${cfg.bottom}` : 'The total'} is ${cfg.ask === 'total' ? 'missing' : lab}.`;
    }
    const legend = cfg.more && cfg.ask == null ? `<div class="m3-legend" aria-hidden="true">The shaded groups are how many more.</div>` : '';
    return `<div class="m2-vis m3-mult" role="img" aria-label="${esc(said)}">` +
      who(cfg.top) + `<div class="m3-row" aria-hidden="true"><div class="m3-cell${askCls}">${cell(cfg.n)}</div></div>` +
      who(cfg.bottom) + `<div class="m3-botwrap" aria-hidden="true">${bottom}${brk}</div>` +
      legend + `</div>`;
  }

  /* Picture under the question — set up, never solved */
  function picHTML(pic) {
    if (!pic) return '';
    if (pic.mult)  return multHTML(pic.mult);
    if (pic.rect)  return rectSVG(pic.rect);
    if (pic.stack) return stackHTML(pic.stack, pic.stack.done ? 'done' : 'ask');
    if (pic.bar)   return barHTML({ total: pic.bar.total, part: pic.bar.part });
    if (pic.work)  return workHTML(pic.work, true);
    return '';
  }

  /* Pictures in the feedback: model first, then the worked columns */
  function explainHTML(ex) {
    if (!ex) return '';
    let out = '';
    if (ex.mult)  out += multHTML(ex.mult);
    if (ex.bar)   out += barHTML(ex.bar);
    if (ex.rect)  out += rectSVG(ex.rect);
    if (ex.work)  out += workHTML(ex.work);
    if (ex.stack) out += stackHTML(ex.stack);
    return out ? `<div class="m2-explain">${out}</div>` : '';
  }

  const api = { stackModel, stepState, stackHTML, rectSVG, barHTML, multHTML, workHTML, picHTML, explainHTML };
  root.M2V = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
