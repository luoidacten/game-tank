// ==========================================
// Bot thông minh (Giải Đấu PVE & phòng tập)
// ------------------------------------------
// Mỗi tick:
//  1. Dự đoán MỌI mối nguy sẽ rơi vào làn của bot (đạn địch, pháo kích, mưa tên,
//     kiếm trời, tia hitscan, vùng hiệu ứng) thành các "khoảng nguy hiểm" theo trục X + thời điểm.
//  2. Chọn MỤC TIÊU: bắn địch (có đón đầu, ép góc), bắn thùng có lợi, bắn xe tiền.
//  3. Tìm vị trí X có tổng nguy hiểm thấp nhất trên đường đi (tính cả tốc độ xe) mà vẫn gần mục tiêu.
//  4. Bắn theo kiểu điều khiển của từng body (nhấp / giữ nạp / giữ liên tục...).
// Cấp độ quyết định phản xạ, tỉ lệ né, sai số ngắm, đón đầu, ăn thùng, ép góc.
// ==========================================

const BOT_LEVELS = [
    null,
    { name: 'Tân Binh', react: 30, dodge: 0.3, aimErr: 42, lead: 0.25, crate: 0.35, pressure: 0.0, think: 12, wall: 0.2 },
    { name: 'Chiến Binh', react: 20, dodge: 0.55, aimErr: 26, lead: 0.55, crate: 0.6, pressure: 0.3, think: 8, wall: 0.5 },
    { name: 'Tinh Anh', react: 11, dodge: 0.82, aimErr: 15, lead: 0.8, crate: 0.8, pressure: 0.6, think: 5, wall: 0.8 },
    { name: 'Cao Thủ', react: 7, dodge: 0.93, aimErr: 8, lead: 0.95, crate: 0.92, pressure: 0.85, think: 3, wall: 1.0 },
    { name: 'Huyền Thoại', react: 4, dodge: 0.99, aimErr: 3, lead: 1.0, crate: 1.0, pressure: 1.0, think: 2, wall: 1.2 },
];

// Kiểu bắn theo body (đo bằng mô phỏng: kiểu cho sát thương cao nhất lên bia đứng yên)
//   tap: nhấp liên tục | hold:N: giữ N tick rồi nhả | stream: giữ liên tục khi thẳng hàng
//   toggle: nhấp 1 lần để bật (Bình Phun) | aaa: bắn khi thẳng hàng (tự nhắm)
const BOT_FIRE_STYLE = {
    overload: 'hold:95', lazer_charge: 'hold:95', lazer_auto: 'hold:95', storm: 'hold:40', van_kiem: 'stream',
    six_barrel: 'hold:40', mirror: 'hold:215', shadow_hunter: 'hold:40', shortgunATK: 'hold:40',
    necromancer: 'hold:40', genius: 'hold:40', sprayer: 'toggle',
};

const BOT_CRATE_VALUE = { coin: 0.7, hp: 0.6, ammo: 0.45, shield: 0.85, dmg: 0.75, gear: 0.5, boom: -2, bullets: -0.4 };

class SmartBot {
    constructor(level = 3) {
        this.setLevel(level);
        this.reset();
    }
    setLevel(level) {
        this.levelIdx = Math.max(1, Math.min(5, level | 0));
        this.L = BOT_LEVELS[this.levelIdx];
    }
    reset() {
        this.t = 0;
        this.seen = new WeakMap();      // vật thể -> tick lần đầu nhìn thấy (mô phỏng phản xạ)
        this.noticed = new WeakMap();   // vật thể -> có để ý né hay không (theo tỉ lệ né)
        this.moveX = null;
        this.aimNoise = 0;
        this.hold = 0;
        this.holdGoal = 0;
        this.tapCool = 0;
        this.pressPhase = 0;
        this.lastHp = null;
        this.shotIdx = 0;
        this.shotOffset = 0;
    }

    // ---- Nhìn thấy & quyết định có né vật thể này không ----
    perceive(obj) {
        if (!obj || typeof obj !== 'object') return false;
        let t0 = this.seen.get(obj);
        if (t0 === undefined) { t0 = this.t; this.seen.set(obj, t0); this.noticed.set(obj, Math.random() < this.L.dodge); }
        return this.t - t0 >= this.L.react && this.noticed.get(obj);
    }

    // ---- Danh sách mối nguy trên làn của bot: { t (tick tới khi trúng), x (tâm), half (nửa bề rộng), w (trọng số) } ----
    collectThreats(bot, enemy) {
        const W = canvas.width;
        const cy = bot.y + bot.h / 2;
        const out = [];
        const fold = (x) => { // đạn nảy tường
            const p = 2 * W;
            x = ((x % p) + p) % p;
            return x > W ? p - x : x;
        };
        const lists = [enemy.bullets || []];
        for (const list of lists) {
            for (const b of list) {
                if (!b || b.isDead || b.active === false) continue;
                const vy = b.vy || 0;
                const by = b.y + (b.h || 6) / 2;
                const dy = cy - by;
                if (Math.abs(vy) < 0.2 || dy * vy <= 0) {
                    // đạn đã ở sát làn (bay ngang / chậm)
                    if (Math.abs(dy) < bot.h && this.perceive(b)) out.push({ t: 1, x: b.x + (b.w || 6) / 2, half: (b.w || 6) / 2 + bot.w / 2 + 3, w: 1.2 });
                    continue;
                }
                let t = dy / vy;
                // Tên lửa tăng tốc dần: giải dy = v*t + a*t^2/2
                if (b.isRocket && b.rocketAccel) { const a = b.rocketAccel, v = Math.abs(vy); t = (-v + Math.sqrt(v * v + 2 * a * Math.abs(dy))) / a; }
                if (t > 110) continue;
                if (!this.perceive(b)) continue;
                const ix = fold(b.x + (b.w || 6) / 2 + (b.vx || 0) * t);
                out.push({ t, x: ix, half: (b.w || 6) / 2 + bot.w / 2 + 4, w: 1 + Math.min(2, (b.dmg || 1) * 0.3) });
            }
        }
        // Tia sét Lôi Minh (hitscan có cảnh báo 0.25s)
        if (enemy.thunderRaycastWarningTimer > 0) out.push({ t: enemy.thunderRaycastWarningTimer, x: enemy.thunderRaycastX, half: 24 + bot.w / 2 + 4, w: 3 });
        const now = Date.now();
        const zoneAt = (x, y, r, tLeft, w, obj) => {
            const dy = Math.abs(y - cy);
            if (dy > r + bot.h / 2) return;
            if (obj && !this.perceive(obj)) return;
            const half = Math.sqrt(Math.max(0, r * r - Math.max(0, dy - bot.h / 2) ** 2)) + bot.w / 2;
            out.push({ t: Math.max(1, tLeft), x, half, w });
        };
        mortars.forEach(m => { if (m.active && m.owner !== bot) zoneAt(m.x, m.y, m.maxR || 55, (m.detonateTime - (now - m.spawnTime)) / 16.7, 2, m); });
        artilleryHazards.forEach(h => { if (h.active) zoneAt(h.x, h.y, h.maxR || 60, (h.detonateTime - (now - h.spawnTime)) / 16.7, 2, h); });
        arrowDrops.forEach(a => { if (a.active !== false && a.owner !== bot) zoneAt(a.x, a.y, 30, (a.delay - (now - a.spawnTime)) / 16.7, 1.5, a); });
        bodyEffects.forEach(e => {
            if (!e.active || e.owner === bot) return;
            if (e instanceof SkyStrike) zoneAt(e.x, e.y, e.r || 48, e.delay || 1, 2, e);
            else if (e instanceof HitscanTelegraph) { if (this.perceive(e)) out.push({ t: Math.max(1, e.delay), x: e.x, half: bot.w / 2 + 8, w: 2 }); }
            else if (e instanceof BodyZone) this.zoneRect(out, bot, e.x, e.y, e.r, 0.5);
            else if (e instanceof CrateBurst) {
                for (const p of e.pellets) {
                    if (!p.on) continue;
                    const dy = cy - p.y;
                    if (dy * p.vy <= 0) continue;
                    const t = dy / p.vy;
                    if (t < 90) out.push({ t, x: p.x + p.vx * t, half: bot.w / 2 + 5, w: 1 });
                }
            }
        });
        [iceZones, voidZones, spellZones, radiationZones].forEach(list => list.forEach(z => {
            if (z.active && z.owner !== bot) this.zoneRect(out, bot, z.x, z.y, z.maxR || z.r, 0.6);
        }));
        beams.forEach(bm => {
            if (bm.active && bm.ownerId !== bot.id && cy > bm.y && cy < bm.y + bm.h) out.push({ t: 1, x: bm.x + bm.w / 2, half: bm.w / 2 + bot.w / 2, w: 2 });
        });
        return out;
    }

    // Vùng mặt đất (hình chữ nhật nằm ngang) chạm làn -> nguy hiểm kéo dài (tính ở mọi thời điểm)
    zoneRect(out, bot, x, y, r, w) {
        const cy = bot.y + bot.h / 2;
        if (Math.abs(y - cy) > r * ZONE_AY + bot.h / 2) return;
        for (const t of [1, 20, 45]) out.push({ t, x, half: r * ZONE_AX + bot.w / 2, w: w * 0.5 });
    }

    // ---- Mục tiêu muốn đứng (để bắn) ----
    chooseGoal(bot, enemy) {
        const L = this.L, W = canvas.width;
        const ecx = enemy.x + enemy.w / 2;
        const dy = Math.abs((enemy.y + enemy.h / 2) - (bot.y + bot.h / 2));
        const flight = dy / Math.max(2, this.bulletSpeed || C.bulletSpeed);
        if (this.t % 40 === 0) this.aimNoise = (Math.random() * 2 - 1) * L.aimErr;

        // Đón đầu theo vận tốc hiện tại của đối thủ
        let attackX = ecx + (enemy._vx || 0) * flight * L.lead + this.aimNoise;

        // Ép góc: mỗi phát bắn chọn 1 điểm trong "lưới" [xe, khe né phía giữa sân, khe né phía tường].
        // Đối thủ né phát này thì dính phát sau; khi đã sát tường chỉ còn 1 khe thoát -> bắn chặn khe đó.
        attackX += this.shotOffset * (enemy.w * 1.4 + 6);
        let goal = { x: attackX, kind: 'enemy', tol: enemy.w / 2 + 2 };
        this.attack = goal;

        // Thùng tiếp tế / xe tiền đáng bắn
        // Chỉ đi bắn thùng khi gần, hoặc khi đang hết đạn (không bắn địch được)
        const outOfAmmo = bot.maxAmmo > 0 && bot.maxAmmo < 900 && bot.ammo <= 0;
        const crateMult = outOfAmmo ? 1.2 : 0.6;
        let best = null, bestScore = 0.3;
        const cx = bot.x + bot.w / 2;
        for (const c of crates) {
            if (!c.active) continue;
            let v = BOT_CRATE_VALUE[c.type] || 0.3;
            if (c.type === 'hp') v += (1 - bot.hp / bot.maxHp) * 0.9;
            if (c.type === 'ammo' && bot.maxAmmo > 0 && bot.maxAmmo < 900) v += (1 - bot.ammo / bot.maxAmmo) * 0.6;
            if (c.type === 'gear' && !CRATE_GEAR_BODIES.includes(bot.weapon)) v = 0.2;
            const left = 1 - (Date.now() - c.spawnTime) / c.lifeTime;
            if (left < 0.12) continue;
            const ccx = c.x + c.w / 2;
            const score = v * L.crate * crateMult - Math.abs(ccx - cx) / W * 1.1;
            if (score > bestScore) { bestScore = score; best = { x: ccx, kind: 'crate', tol: c.w / 2 - 2 }; }
        }
        for (const t of moneyTrucks) {
            if (!t.active) continue;
            const tdy = Math.abs((t.y + t.h / 2) - (bot.y + bot.h / 2));
            const tf = tdy / Math.max(2, C.bulletSpeed);
            const px = t.x + t.w / 2 + t.speed * t.dir * tf;
            if (px < 10 || px > W - 10) continue;
            const score = 0.55 * L.crate * crateMult - Math.abs(px - cx) / W * 1.1;
            if (score > bestScore) { bestScore = score; best = { x: px, kind: 'truck', tol: t.w / 2 - 4 }; }
        }
        // Đang đối đầu sát nút (địch máu thấp) thì ưu tiên bắn địch
        if (best && enemy.hp / enemy.maxHp < 0.3 && L.pressure > 0.5) best = null;
        return best || goal;
    }

    // Thùng nổ nằm trên đường đạn -> không bắn (sẽ bị phản sát thương)
    lineBlockedByBoom(bot, enemy) {
        const cx = bot.x + bot.w / 2;
        const y0 = Math.min(bot.y, enemy.y), y1 = Math.max(bot.y + bot.h, enemy.y + enemy.h);
        return crates.some(c => c.active && (c.type === 'boom' || c.type === 'bullets') && c.y + c.h > y0 && c.y < y1 && Math.abs(c.x + c.w / 2 - cx) < c.w / 2 + 4);
    }

    // ---- Chọn vị trí đứng an toàn nhất ----
    planMove(bot, threats, goalX) {
        const W = canvas.width;
        const cx = bot.x + bot.w / 2;
        const speed = Math.max(1.2, (bot.speed || 3) * (bot.statusSpeedMult === undefined ? 1 : bot.statusSpeedMult));
        let minX = bot.w / 2, maxX = W - bot.w / 2;
        // Đột Tử: bo thu hẹp hai bên -> chỉ đứng trong vùng an toàn của ~0.8s tới
        const sd = this.safeZone(0.8);
        if (sd) { minX = Math.max(minX, sd.x0 + bot.w / 2 + 4); maxX = Math.min(maxX, sd.x1 - bot.w / 2 - 4); if (minX > maxX) minX = maxX = (sd.x0 + sd.x1) / 2; }
        let bestX = Math.max(minX, Math.min(maxX, cx)), bestCost = Infinity;
        for (let X = minX; X <= maxX + 0.1; X += 6) {
            let cost = Math.abs(X - goalX) * 0.006;
            // Tránh tự dồn mình vào góc
            const edge = Math.min(X - minX, maxX - X);
            if (edge < 50) cost += (50 - edge) / 50 * 0.35 * this.L.wall;
            const dir = Math.sign(X - cx), dist = Math.abs(X - cx);
            for (const th of threats) {
                const pos = cx + dir * Math.min(dist, speed * th.t);
                const d = Math.abs(pos - th.x);
                if (d < th.half) cost += th.w * (1 + (th.half - d) / th.half) * (th.t < 30 ? 2 : 1);
            }
            if (cost < bestCost) { bestCost = cost; bestX = X; }
        }
        return bestX;
    }

    safeZone(aheadSec) {
        const limit = (gameState.currentMap === 'fast_shrink') ? 20000 : C.suddenDeathTime;
        const rate = (gameState.currentMap === 'fast_shrink') ? 0.15 : 0.05;
        const tp = Date.now() - gameState.roundStartTime + aheadSec * 1000;
        if (tp <= limit - 1500) return null;
        const shrink = Math.max(0, (tp - limit) * rate);
        let x0 = shrink, x1 = canvas.width - shrink;
        if (x1 - x0 < 50) { x0 = canvas.width / 2 - 25; x1 = canvas.width / 2 + 25; }
        return { x0, x1 };
    }

    // Gọi mỗi khi bot vừa bắn 1 phát -> chọn điểm ngắm cho phát kế tiếp
    nextShot(enemy) {
        this.shotIdx++;
        const W = canvas.width, ecx = enemy.x + enemy.w / 2;
        const toCenter = ecx < W / 2 ? 1 : -1;
        const cornered = Math.min(ecx, W - ecx) < 95;
        const pattern = cornered ? [0, toCenter, 0, toCenter * 0.5] : [0, toCenter, -toCenter, 0];
        this.shotOffset = Math.random() < this.L.pressure ? pattern[this.shotIdx % pattern.length] : 0;
    }

    // ---- Bắn theo kiểu của body ----
    fire(bot, enemy, aligned, inp) {
        const style = BOT_FIRE_STYLE[bot.weapon] || 'tap';
        if (style === 'toggle') { // Bình Phun: bật khi thẳng hàng, tắt khi lệch lâu
            if (this.tapCool > 0) { this.tapCool--; inp.s = this.tapCool > 3; return; }
            if ((aligned && !bot.spOn) || (!aligned && bot.spOn && this.t % 60 === 0)) { this.tapCool = 7; inp.s = true; return; }
            inp.s = false; return;
        }
        if (style === 'stream') {
            if (bot.weapon === 'six_barrel' && (bot.heat || 0) > 82) { inp.s = false; return; }
            inp.s = aligned || (bot.weapon === 'six_barrel' && (bot.sbSpin || 0) >= 30 && this.t % 3 !== 0 && Math.random() < 0.3);
            return;
        }
        if (style.startsWith('hold:')) {
            const n = +style.slice(5);
            if (this.hold > 0) { // đang nạp: nhả khi đủ lực VÀ thẳng hàng
                this.hold++;
                if ((this.hold >= n && aligned) || this.hold > n + 120) { this.hold = 0; inp.s = false; this.tapCool = 6; this.nextShot(enemy); return; }
                inp.s = true; return;
            }
            if (this.tapCool > 0) { this.tapCool--; inp.s = false; return; }
            this.hold = 1; inp.s = true; return; // nạp sẵn trong lúc di chuyển
        }
        // tap
        if (this.tapCool > 0) { this.tapCool--; inp.s = this.tapCool > 6; return; }
        if (aligned) { this.tapCool = 9; inp.s = true; this.nextShot(enemy); return; }
        inp.s = false;
    }

    update(bot, enemy, inp) {
        if (!bot || !enemy || bot.hp <= 0) { inp.l = inp.r = inp.s = false; return; }
        this.t++;
        // Tốc đạn thật của body (đạn sniper nhanh, đạn chậm...) để đón đầu đúng
        for (const b of bot.bullets || []) {
            const v = Math.abs(b.vy || 0);
            if (v > 1 && !this.seen.has(b)) { this.seen.set(b, this.t); this.bulletSpeed = this.bulletSpeed ? this.bulletSpeed * 0.8 + v * 0.2 : v; }
        }
        const threats = this.collectThreats(bot, enemy);
        const goal = this.chooseGoal(bot, enemy);
        const urgent = threats.some(th => th.t < 25);
        if (this.moveX === null || this.t % this.L.think === 0 || urgent) this.moveX = this.planMove(bot, threats, goal.x);

        const cx = bot.x + bot.w / 2;
        const dx = this.moveX - cx;
        inp.l = dx < -2.5; inp.r = dx > 2.5;

        // Bắn khi thẳng hàng với mục tiêu, hoặc tiện đường thẳng hàng với điểm đón đầu của địch
        const onGoal = Math.abs(goal.x - cx) <= Math.max(4, goal.tol);
        const onEnemy = this.attack && Math.abs(this.attack.x - cx) <= this.attack.tol;
        const aligned = (onGoal || onEnemy) && !this.lineBlockedByBoom(bot, enemy);
        this.fire(bot, enemy, aligned, inp);
    }
}

// ---- Bot tự mua đồ trong shop (PVE): ưu tiên Tiến Hoá, sau đó module chân ----
function botShopBuy(playerId) {
    const player = playerId === 'p1' ? p1 : p2;
    if (!player) return;
    for (let guard = 0; guard < 8; guard++) {
        const coins = playerId === 'p1' ? gameState.p1Coins : gameState.p2Coins;
        const cards = [...document.querySelectorAll(`#${playerId}-upgrades .card`)].filter(c => !c.classList.contains('sold') && c.onclick);
        const priced = cards.map(c => {
            const m = (c.innerText.match(/\$\s?(\d+)/g) || []).map(s => +s.replace(/\D/g, ''));
            const price = m.length ? m[m.length - 1] : Infinity;
            const txt = c.innerText;
            let pri = c.classList.contains('evo-card') ? 3 : 1;
            if (/Bánh Xích|Giáp Thép/.test(txt)) pri += 0.6;
            if (/Lợi Tức/.test(txt) && gameState.round <= 3) pri += 0.8;
            if (/CẤP ĐỘ/.test(txt)) pri = 0.5;
            if (/SẴN SÀNG|QUAY LẠI|LÀM MỚI|REROLL/i.test(txt)) pri = -1;
            return { c, price, pri };
        }).filter(x => x.pri > 0 && x.price <= coins).sort((a, b) => b.pri - a.pri);
        if (!priced.length) break;
        priced[0].c.click();
    }
}
