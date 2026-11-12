/* ═══════════════════════════════════════════════════════
   school-clock.js — THE SAME FILE on every test site (md5 must match; master: math-module-1-test).
   Tests are taken at school (Marcos 11/12/2026: "allow the kids to do the reviews only and make all of those
   [tests] off limits" at home → "I like your time idea"). A test opens only during his school day:
   8:40 AM–3:10 PM, Monday–Friday, on a day with school (12:50 PM on early-dismissal days), Bridgeport time.
   Reviews and practice stay open at home.

   The time comes from the site's own web address (its answer carries the real time), not from the computer,
   so a computer set to the wrong time does not open a test. Until that answer is in, the test is treated as
   open (each site checks again at sign-in and at the start); if the address cannot be reached, the computer's
   own clock decides. The guest view (?share=) and the Teacher PIN screens are not touched by this file.

   The school calendar is the dashboard's (🏡 Home Practice, 11/11) — change both together.
═══════════════════════════════════════════════════════ */
(function () {
  const TZ = 'America/New_York';
  const DAY_START = 8 * 60 + 40;    // 8:40 AM, in minutes after midnight
  const DAY_END   = 15 * 60 + 10;   // 3:10 PM
  const EARLY_END = 12 * 60 + 50;   // 12:50 PM on early-dismissal days
  // Bridgeport Public Schools 2026–2027 calendar (BOE approved 3/9/2026; Marcos sent it 11/11): days with no
  // school for students. A closing (snow day) is not on it, so it counts as school.
  const FIRST_DAY = '2026-08-27', LAST_DAY = '2027-06-11';
  const DAYS_OFF = new Set([
    '2026-09-07', '2026-09-21', '2026-10-12', '2026-11-03',
    '2026-11-25', '2026-11-26', '2026-11-27',
    '2026-12-24', '2026-12-25', '2026-12-28', '2026-12-29', '2026-12-30', '2026-12-31', '2027-01-01',
    '2027-01-06', '2027-01-18',
    '2027-02-11', '2027-02-12', '2027-02-15',
    '2027-03-09', '2027-03-26',
    '2027-04-12', '2027-04-13', '2027-04-14', '2027-04-15', '2027-04-16',
    '2027-05-31',
  ]);
  const EARLY_DAYS = new Set([
    '2026-08-27', '2026-08-28', '2026-09-16', '2026-10-14', '2026-11-04', '2026-12-09', '2026-12-23',
    '2027-01-13', '2027-02-10', '2027-03-10', '2027-04-07', '2027-05-12', '2027-06-02', '2027-06-10', '2027-06-11',
  ]);

  let offset = 0;            // the address's time minus this computer's time
  let source = 'waiting';    // 'waiting' → 'address' | 'computer'
  const watchers = [];

  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23', weekday: 'short',
  });

  // School time at the moment `ms` (milliseconds since 1970): { date: 'YYYY-MM-DD', min, day: 'Mon'… }
  function local(ms) {
    const p = {};
    fmt.formatToParts(new Date(ms)).forEach(x => { p[x.type] = x.value; });
    return { date: `${p.year}-${p.month}-${p.day}`, min: (Number(p.hour) % 24) * 60 + Number(p.minute), day: p.weekday };
  }

  function atSchoolAt(ms) {
    const t = local(ms);
    if (t.day === 'Sat' || t.day === 'Sun') return false;
    if (t.date < FIRST_DAY || t.date > LAST_DAY || DAYS_OFF.has(t.date)) return false;
    return t.min >= DAY_START && t.min < (EARLY_DAYS.has(t.date) ? EARLY_END : DAY_END);
  }

  function now() { return Date.now() + offset; }

  // Open for a test right now? While the address has not answered yet: yes (checked again later).
  function atSchool() { return source === 'waiting' ? true : atSchoolAt(now()); }

  function settle(src) {
    source = src;
    watchers.forEach(f => { try { f(); } catch (e) { /* one site hook failing never stops the others */ } });
  }

  function ask() {
    let done = false;
    const give = src => { if (!done) { done = true; settle(src); } };
    try {
      const url = location.pathname + '?clock=' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const timer = setTimeout(() => give('computer'), 8000);
      fetch(url, { method: 'HEAD', cache: 'no-store' }).then(r => {
        clearTimeout(timer);
        const t = Date.parse(r.headers.get('Date') || '');
        if (isNaN(t)) return give('computer');
        offset = t - Date.now();
        give('address');
      }).catch(() => { clearTimeout(timer); give('computer'); });
    } catch (e) { give('computer'); }
  }

  window.SchoolClock = {
    atSchool, atSchoolAt, local,
    // run `f` once the time is known (and right away if it already is)
    whenKnown(f) { watchers.push(f); if (source !== 'waiting') { try { f(); } catch (e) {} } },
    source: () => source,
    HOURS_TEXT: 'Monday–Friday, 8:40 AM–3:10 PM',
  };
  ask();
})();
