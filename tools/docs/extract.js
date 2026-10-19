// Trích dữ liệu body + chỉ số thực đầu hiệp từ game
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage();
  await p.goto('file:///home/user/game-tank/index.html');
  const d = await p.evaluate(() => {
    gameState.currentMap = 'classic';
    const real = {};
    for (const m of MODULES.BODY) {
      p1 = new Player(1, '#fff'); p1.upgrades = [m.id];
      p2 = new Player(2, '#f00'); p2.upgrades = ['basic']; p2.setupForNewRound();
      p1.setupForNewRound();
      real[m.id] = { hp: p1.maxHp, dmg: p1.damage, ammo: p1.maxAmmo, speed: p1.speed, w: p1.w, h: p1.h, souls: p1.maxSouls };
    }
    return { MODULES, EVOLUTIONS, INVENTOR_SHOP, GENIUS_BLACK_MARKET, C, real };
  });
  require('fs').writeFileSync(__dirname + '/data.json', JSON.stringify(d));
  await b.close();
})();
