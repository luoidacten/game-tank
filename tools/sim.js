// Mô phỏng đấu vòng tròn bot-vs-bot để đo tỉ lệ thắng từng body
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const DIR = process.argv[2] || '/home/user/game-tank';
const TIER = process.argv[3] || 'base';     // base | evo
const WORKERS = +(process.argv[4] || 4);
const REPEAT = +(process.argv[5] || 1);
const OUT = process.argv[6] || __dirname + `/result_${TIER}.json`;
const ONLY = process.argv[7] ? process.argv[7].split(',') : null;

const INIT = `
(() => {
  let seed = 1;
  Math.random = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  window.__reseed = (s) => { seed = s; };
  let now = 1700000000000;
  let timers = []; let tid = 1;
  Date.now = () => now;
  performance.now = () => now - 1700000000000;
  window.setTimeout = (fn, ms) => { timers.push({ t: now + (ms || 0), fn, id: tid }); return tid++; };
  window.clearTimeout = (id) => { timers = timers.filter(x => x.id !== id); };
  window.setInterval = () => 0;
  window.requestAnimationFrame = () => 0;
  window.__clearTimers = () => { timers = []; };
  window.__advance = (ms) => {
    now += ms;
    const due = timers.filter(x => x.t <= now);
    if (due.length) { timers = timers.filter(x => x.t > now); for (const x of due) { try { x.fn(); } catch (e) {} } }
  };
})();`;

// Chạy 1 hiệp trong trang: trả về winnerId (0 = hoà)
const RUN = (cfg) => {
  const ai = (me, enemy, st, t) => {
    const inp = inputs[me === p1 ? 'p1' : 'p2'];
    // Né đạn: viên đạn địch gần nhất đang lao tới
    let danger = null, dd = 1e9;
    for (const b of enemy.bullets) {
      const towards = (me.id === 1) ? b.vy > 0 : b.vy < 0;
      if (!towards) continue;
      const dy = Math.abs((b.y) - (me.y + me.h / 2));
      if (dy < 140 && dy < dd && Math.abs(b.x - (me.x + me.w / 2)) < me.w * 1.3) { dd = dy; danger = b; }
    }
    let target = enemy.x + st.offset;
    if (danger) target = me.x + (danger.x < me.x + me.w / 2 ? 60 : -60);
    if (t % 90 === 0) st.offset = (Math.random() - 0.5) * 60;
    const dx = target - me.x;
    inp.l = dx < -6; inp.r = dx > 6;
    // Bắn: chu kỳ nhấp / giữ ngẫu nhiên
    if (st.phaseLeft <= 0) {
      if (st.holding) { st.holding = false; st.phaseLeft = 6 + Math.floor(Math.random() * 18); }
      else { st.holding = true; const r = Math.random(); st.phaseLeft = r < 0.55 ? 5 : (r < 0.85 ? 35 : 95); }
    }
    st.phaseLeft--;
    inp.s = st.holding;
  };

  window.__reseed(cfg.seed);
  window.__clearTimers();
  document.querySelectorAll('.menu-overlay,.modal-overlay').forEach(e => e.style.display = 'none');
  startBattle();
  window.__clearTimers();
  const results = [];
  for (let r = 0; r < cfg.rounds; r++) {
    const ev1 = cfg.tier === 'evo' ? (EVOLUTIONS[cfg.a] || []).map(e => e.id) : [];
    const ev2 = cfg.tier === 'evo' ? (EVOLUTIONS[cfg.b] || []).map(e => e.id) : [];
    const extra = cfg.tier === 'evo' ? ['armor', 'damage'] : [];
    p1.upgrades = [cfg.a, ...ev1, ...extra];
    p2.upgrades = [cfg.b, ...ev2, ...extra];
    gameState.selectedMapMode = 'classic';
    window.__winner = undefined;
    window.__clearTimers();
    startRound();
    const s1 = { offset: 0, phaseLeft: 0, holding: false }, s2 = { offset: 0, phaseLeft: 0, holding: false };
    let t = 0;
    while (t < cfg.maxTicks) {
      ai(p1, p2, s1, t); ai(p2, p1, s2, t);
      window.__advance(1000 / 60);
      if (gameState.phase === 'playing' || fatalCinematic.active) tickPhysics();
      if (window.__winner !== undefined) break;
      t++;
    }
    results.push(window.__winner === undefined ? 0 : window.__winner);
    window.__clearTimers();
    gameState.phase = 'upgrade';
  }
  return results;
};

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const pages = [];
  for (let w = 0; w < WORKERS; w++) {
    const pg = await browser.newPage({ viewport: { width: 420, height: 860 } });
    await pg.addInitScript(INIT);
    await pg.goto('file://' + DIR + '/index.html');
    await pg.evaluate(() => { const orig = endRound; endRound = function (w) { window.__winner = w; return orig.apply(this, arguments); }; });
    pages.push(pg);
  }
  const ids = await pages[0].evaluate(() => MODULES.BODY.map(m => m.id));
  const jobs = [];
  for (const a of ids) for (const b of ids) {
    if (a === b) continue;
    if (ONLY && !ONLY.includes(a) && !ONLY.includes(b)) continue;
    for (let k = 0; k < REPEAT; k++) jobs.push({ a, b, seed: (ids.indexOf(a) * 131 + ids.indexOf(b) * 17 + k * 7919) | 0 });
  }
  const stats = {}; ids.forEach(i => stats[i] = { w: 0, l: 0, d: 0 });
  const vs = {};
  let done = 0; const t0 = Date.now();
  let next = 0;
  await Promise.all(pages.map(async pg => {
    while (next < jobs.length) {
      const j = jobs[next++]; if (process.env.TRACE) console.log('START', next, j.a, j.b);
      let res;
      try { res = await pg.evaluate(RUN, { ...j, tier: TIER, rounds: 2, maxTicks: 5400 }); }
      catch (e) { console.error('ERR', j.a, j.b, e.message.slice(0, 200)); continue; }
      for (const r of res) {
        if (r === 1) { stats[j.a].w++; stats[j.b].l++; } else if (r === 2) { stats[j.b].w++; stats[j.a].l++; } else { stats[j.a].d++; stats[j.b].d++; }
        const k = j.a + '>' + j.b; vs[k] = vs[k] || [0, 0, 0]; vs[k][r === 1 ? 0 : (r === 2 ? 1 : 2)]++;
      }
      if (++done % 100 === 0) console.log(`${done}/${jobs.length} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
  }));
  const rows = ids.map(id => { const s = stats[id]; const n = s.w + s.l + s.d; return { id, ...s, wr: n ? (s.w + s.d * 0.5) / n : 0 }; }).sort((x, y) => y.wr - x.wr);
  fs.writeFileSync(OUT, JSON.stringify({ rows, vs }, null, 1));
  rows.forEach(r => console.log(r.id.padEnd(15), (r.wr * 100).toFixed(1).padStart(5) + '%', `W${r.w} L${r.l} D${r.d}`));
  await browser.close();
})();
