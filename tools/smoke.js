const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await b.newPage({ viewport: { width: 420, height: 860 } });
  const errs=[]; page.on('pageerror', e => errs.push(e.message));
  await page.goto('file:///home/user/game-tank/index.html');
  await page.waitForTimeout(400);
  const bodies = await page.evaluate(() => MODULES.BODY.map(m => m.id));
  for (const id of bodies) {
    const evos = await page.evaluate((id) => {
      let all = Object.values(EVOLUTIONS).flat ? Object.values(EVOLUTIONS).flat() : [];
      return [];
    }, id);
    await page.evaluate((id) => {
      startBattle(); 
      let ev = (EVOLUTIONS[id] || []).map(e => e.id);
      p1.upgrades=[id, ...ev]; p2.upgrades=[id]; gameState.selectedMapMode='classic'; startRound();
      window.__g && clearInterval(window.__g);
      window.__g = setInterval(()=>{ if(p1&&p2){p1.hp=Math.max(p1.hp,0.5);p2.hp=Math.max(p2.hp,0.5);} },10);
    }, id);
    for (let k = 0; k < 3; k++) {
      await page.evaluate(() => { inputs.p1.s = true; inputs.p2.s = true; inputs.p1.l = true; });
      await page.waitForTimeout(700 + k * 300);
      await page.evaluate(() => { inputs.p1.s = false; inputs.p2.s = false; inputs.p1.l = false; inputs.p1.r = true; });
      await page.waitForTimeout(300);
      await page.evaluate(() => { inputs.p1.r = false; });
    }
    await page.evaluate(() => startRound());
    await page.waitForTimeout(200);
    if (errs.length) { console.log(id, [...new Set(errs)].slice(0,3)); errs.length = 0; }
  }
  console.log('done', bodies.length);
  await b.close();
})();
