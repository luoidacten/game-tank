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
    lazer_auto: 'stream', storm: 'hold:40', van_kiem: 'stream',
    six_barrel: 'hold:40', mirror: 'hold:215', shadow_hunter: 'hold:40', shortgunATK: 'hold:40',
    necromancer: 'hold:40', genius: 'hold:40', sprayer: 'toggle',
    dj: 'beat',
};
BOT_FIRE_STYLE.steel_hook = 'hold:30'; // Móc Thép: tụ 1 mốc rồi nhả; nhấp lại để kích hoạt giai đoạn 2
BOT_FIRE_STYLE.lazer_beam = 'stream'; // Tia Lazer: giữ liên tục khi thẳng hàng
BOT_FIRE_STYLE.tat_sat = 'hold:40'; // Tất Sát: tụ tới 1 trong 3 mốc (tatBotHoldN) rồi nhả

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
        // Lôi Độn (cột cảnh báo đường lao của Sấm Chớp)
        if (enemy.thunderRaycastWarningTimer > 0) out.push({ t: enemy.thunderRaycastWarningTimer, x: enemy.thunderRaycastX, half: 24 + bot.w / 2 + 4, w: 3 });
        const now = Date.now();
        const zoneAt = (x, y, r, tLeft, w, obj) => {
            const dy = Math.abs(y - cy);
            if (dy > r + bot.h / 2) return;
            if (obj && !this.perceive(obj)) return;
            const half = Math.sqrt(Math.max(0, r * r - Math.max(0, dy - bot.h / 2) ** 2)) + bot.w / 2;
            out.push({ t: Math.max(1, tLeft), x, half, w });
        };
        if (enemy.thunderSky) zoneAt(enemy.thunderSky.x, enemy.thunderSky.y, enemy.thunderSky.r, enemy.thunderSky.lock > 0 ? enemy.thunderSky.lock : 60, 3);
        mortars.forEach(m => { if (m.active && m.owner !== bot) zoneAt(m.x, m.y, m.maxR || 55, (m.detonateTime - (now - m.spawnTime)) / 16.7, 2, m); });
        artilleryHazards.forEach(h => { if (h.active) zoneAt(h.x, h.y, h.maxR || 60, (h.detonateTime - (now - h.spawnTime)) / 16.7, 2, h); });
        arrowDrops.forEach(a => { if (a.active !== false && a.owner !== bot) zoneAt(a.x, a.y, 30, (a.delay - (now - a.spawnTime)) / 16.7, 1.5, a); });
        bodyEffects.forEach(e => {
            if (!e.active || e.owner === bot) return;
            if (e instanceof SkyStrike) zoneAt(e.x, e.y, e.r || 48, e.delay || 1, 2, e);
            else if (e instanceof ThunderStrike) zoneAt(e.x, e.y, e.r, e.delay || 1, 1.5, e);
            else if (typeof e.botThreat === 'function') { const th = e.botThreat(bot); if (th && this.perceive(e)) out.push(th); }
            else if (e instanceof HitscanWarning) { if (e.delay > 0 && e.owner !== bot && (!e.owner || e.owner.owner !== bot) && this.perceive(e)) out.push({ t: Math.max(1, e.delay), x: e.x, half: e.width / 2 + bot.w / 2 + 4, w: 3 }); }
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
        // Boomerang: chạy ra đón chiếc Thẳng đang bay về
        if (bot.weapon === 'boomerang' && typeof boomBotCatchX === 'function') { const bx = boomBotCatchX(bot); if (bx !== null) return { x: bx, kind: 'catch', tol: 5 }; }
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
        const tp = Date.now() - gameState.roundStartTime + aheadSec * 1000;
        const z = (typeof getZoneState === 'function') ? getZoneState(tp + 1500) : null;
        if (!z) return null;
        // Vùng an toàn tại thời điểm dự đoán (bo 2 giai đoạn, vùng cuối dời trái/phải)
        const cur = getZoneState(tp) || z;
        let x0 = cur.x0, x1 = cur.x1;
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
        const style = (bot.weapon === 'customize' && typeof cuBotFireStyle === 'function') ? cuBotFireStyle(bot) : (BOT_FIRE_STYLE[bot.weapon] || 'tap');
        if (bot.weapon === 'berserker' && ((bot.bersOH || 0) > 0 || (bot.bersHeat || 0) > 80)) { inp.s = false; this.tapCool = 0; return; } // Cuồng Chiến Binh: nhả cò cho nguội
        if (style === 'toggle') { // Bình Phun: bật khi thẳng hàng, tắt khi lệch lâu
            if (this.tapCool > 0) { this.tapCool--; inp.s = this.tapCool > 3; return; }
            if ((aligned && !bot.spOn) || (!aligned && bot.spOn && this.t % 60 === 0)) { this.tapCool = 7; inp.s = true; return; }
            inp.s = false; return;
        }
        if (style === 'beat') { // DJ: bấm theo nhịp khi nút đỏ
            if (this.tapCool > 0) { this.tapCool--; inp.s = this.tapCool > 3; return; }
            if (typeof djBotWantsTap === 'function' && djBotWantsTap(bot, this.levelIdx)) { this.tapCool = 6; inp.s = true; this.nextShot(enemy); return; }
            inp.s = false; return;
        }
        if (style === 'stream') {
            if (bot.weapon === 'six_barrel' && (bot.heat || 0) > 82) { inp.s = false; return; }
            if (bot.weapon === 'lazer_auto' && ((bot.laOver || 0) > 0 || (bot.laHeat || 0) > 88)) { inp.s = false; return; }
            inp.s = aligned || (bot.weapon === 'six_barrel' && (bot.sbSpin || 0) >= 30 && this.t % 3 !== 0 && Math.random() < 0.3);
            return;
        }
        if (style.startsWith('hold:')) {
            const n = (bot.weapon === 'storm' && typeof stBotHoldN === 'function') ? (this.stHoldN || (this.stHoldN = stBotHoldN(bot)))
                : (bot.weapon === 'tat_sat' && typeof tatBotHoldN === 'function') ? (this.stHoldN || (this.stHoldN = tatBotHoldN(bot))) // Tất Sát: 3 mốc
                : +style.slice(5); // Cuồng Phong: lúc tụ 50% / 100%
            if (this.hold > 0) { // đang nạp: nhả khi đủ lực VÀ thẳng hàng
                this.hold++;
                if ((this.hold >= n && aligned) || this.hold > n + 120) { this.hold = 0; this.stHoldN = 0; inp.s = false; this.tapCool = 6; this.nextShot(enemy); return; }
                inp.s = true; return;
            }
            if (this.tapCool > 0) { this.tapCool--; inp.s = false; return; }
            this.hold = 1; inp.s = true; return; // nạp sẵn trong lúc di chuyển
        }
        // Lazer Xuyên Phá: giữ 0.4s bật Tự Nạp; nạp đầy rồi mới nhấp khi thẳng hàng
        if (bot.weapon === 'lazer_charge') {
            if (this.hold > 0) { this.hold++; inp.s = this.hold <= 28; if (this.hold > 32) this.hold = 0; return; }
            if (!bot.lcAuto) { this.hold = 1; inp.s = true; return; }
            if ((bot.lcEnergy || 0) < 100) { inp.s = false; return; }
        }
        // Nhân Bản: thỉnh thoảng giữ 1s để tạo clone
        if (bot.weapon === 'clone') {
            if (this.hold > 0) { this.hold++; inp.s = this.hold <= 64; if (this.hold > 68) { this.hold = 0; this.tapCool = 6; } return; }
            if (this.tapCool <= 0 && typeof clBotWantsClone === 'function' && clBotWantsClone(bot)) { this.hold = 1; inp.s = true; return; }
        }
        // Phi Công: giữ 0.5s Cất Cánh / đổi điều khiển, giữ 1s Hợp Nhất khẩn cấp
        if (bot.weapon === 'jet_pilot') {
            if (this.hold > 0) { this.hold++; const n = this.jpHoldN || 34; inp.s = this.hold <= n; if (this.hold > n + 4) { this.hold = 0; this.tapCool = 6; } return; }
            const n = this.tapCool <= 0 && typeof jpBotHold === 'function' ? jpBotHold(bot) : 0;
            if (n) { this.jpHoldN = n; this.hold = 1; inp.s = true; return; }
        }
        // Nhất Quyền: nhấp = Đấm Thường; Thú Vị >= 55% & hết hồi -> giữ tụ Đấm Nghiêm Túc rồi nhả khi thẳng hàng
        if (bot.weapon === 'one_punch') {
            if (this.hold > 0) {
                this.hold++;
                const n = (typeof opHoldN === 'function' ? opHoldN(bot) : 60) + 2;
                if ((this.hold >= n && aligned) || this.hold > n + 90) { this.hold = 0; this.tapCool = 8; inp.s = false; this.nextShot(enemy); return; }
                inp.s = true; return;
            }
            if (this.tapCool <= 0 && typeof opBotWantsSerious === 'function' && opBotWantsSerious(bot)) { this.hold = 1; inp.s = true; return; }
        }
        // Boomerang: chiếc đang chọn không trên tay -> giữ để đổi sang chiếc còn lại
        if (bot.weapon === 'boomerang') {
            if (this.hold > 0) { this.hold++; inp.s = this.hold <= 28; if (this.hold > 31) { this.hold = 0; this.tapCool = 4; } return; }
            if (this.tapCool <= 0 && typeof boomBotWantsSwitch === 'function' && boomBotWantsSwitch(bot)) { this.hold = 1; inp.s = true; return; }
        }
        // Sấm Chớp: giữ > 1s rồi nhả = Lôi Trảm (dịch chuyển chém ở từng cây thương đang cắm gần địch)
        if (bot.weapon === 'thunder') {
            if (this.hold > 0) { this.hold++; inp.s = this.hold <= 68; if (this.hold > 72) { this.hold = 0; this.tapCool = 10; } return; }
            if (this.tapCool <= 0 && this.t % 12 === 0 && this.thunderWantsSlash(bot, enemy) && Math.random() < 0.35 + 0.65 * this.L.dodge) { this.hold = 1; inp.s = true; return; }
        }
        // tap
        if (bot.weapon === 'overload' && (bot.ovMain || 0) < 1 && (bot.ammo || 0) > 0) { inp.s = false; return; } // Quá Tải: chờ thanh chính đầy
        if (this.tapCool > 0) { this.tapCool--; inp.s = this.tapCool > 6; return; }
        // Nam Châm: có Cột / kẻ địch mang Ấn Từ KHÁC CỰC phía trước -> nhấp để Lướt Cực Tính
        if (bot.weapon === 'magnet' && !(bot.polarDashCd > 0) && bot.findPolarDashTarget && bot.findPolarDashTarget()) { this.tapCool = 9; inp.s = true; return; }
        if (aligned) { this.tapCool = 9; inp.s = true; this.nextShot(enemy); return; }
        inp.s = false;
    }

    // Sấm Chớp: đáng dùng Lôi Trảm khi có thương cắm trong tầm chém của địch (>= 2 cây, hoặc đã hết thương trong tay)
    thunderWantsSlash(bot, enemy) {
        if (typeof thunderMyPlanted !== 'function' || bot.thunderLoiMinhTimer > 0 || bot.thunderSky || bot.thunderIsSlashing
            || bot.thunderDashState || bot.thunderRaycastWarningTimer > 0 || bot.thunderIsRecallWarning || !(enemy.hp > 0)) return false;
        const planted = thunderMyPlanted(bot);
        if (!planted.length) return false;
        const R = (typeof THUNDER_SLASH_R === 'number' ? THUNDER_SLASH_R : 80) + enemy.w / 2 - 8;
        const ex = enemy.x + enemy.w / 2 + (enemy._vx || 0) * 20, ey = enemy.y + enemy.h / 2;
        const near = planted.filter(s => Math.hypot(s.x - ex, s.y - ey) <= R).length;
        return near >= 1 && (planted.length >= 2 || (bot.thunderSpears || 0) === 0);
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

// ---- Bot tự mua đồ trong shop (PVE) ----
// 1. Mua thẻ đáng giá nhất còn đủ tiền (Tiến Hoá > Cấp Độ Xe Tiền > module chân).
// 2. Vào các chợ đặc biệt của body (Chợ Linh Kiện, Chợ Đen, Luyện Kiếm, Tùy Biến...) và mua hết những gì mua được.
// 3. Còn dư tiền thì đổi hàng (reroll) để tìm thêm món, rồi lặp lại.
function botShopBuy(playerId) {
    const player = playerId === 'p1' ? p1 : p2;
    if (!player) return;
    const box = () => document.getElementById(`${playerId}-upgrades`);
    const coins = () => (playerId === 'p1' ? gameState.p1Coins : gameState.p2Coins);
    const live = () => [...box().querySelectorAll('.card')].filter(c => c.onclick && !c.classList.contains('sold'));
    const txt = (c) => c.innerText || c.textContent || '';
    const isBack = (c) => /QUAY LẠI/.test(txt(c));
    const isReady = (c) => c.id === `ready-btn-${playerId}` || /SẴN SÀNG/.test(txt(c));
    const isReroll = (c) => /REROLL/.test(txt(c));
    const isPayWin = (c) => /PAY TO WIN/.test(txt(c));
    const priceOf = (c) => { const m = (txt(c).match(/\$\s?(\d+)/g) || []).map(x => +x.replace(/\D/g, '')); return m.length ? m[m.length - 1] : null; };
    const sig = () => JSON.stringify([coins(), player.upgrades.length, player.upgradeLevel, player.components, player.gears,
        player.invUpgrades, player.geniusUpgrades, player.geniusPurchaseCount, player.kkData && player.kkData.active.length, player.cuData]);

    const getRemainingEvos = () => {
        const list = (typeof EVOLUTIONS !== 'undefined' && EVOLUTIONS[player.weapon]) ? EVOLUTIONS[player.weapon] : [];
        return list.filter(e => !(player.upgrades || []).includes(e.id));
    };
    const getMinEvoPrice = () => {
        const rem = getRemainingEvos();
        if (!rem.length) return Infinity;
        return Math.min(...rem.map(e => typeof shopItemPrice === 'function' ? shopItemPrice(player, e) : (e.cost || 150)));
    };
    const isDesperate = () => {
        const target = (typeof gameState !== 'undefined' && gameState.winScore) ? gameState.winScore : 3;
        const oppScore = playerId === 'p1' ? gameState.p2Score : gameState.p1Score;
        return oppScore >= target - 1;
    };

    const buyMain = () => {
        for (let guard = 0; guard < 12; guard++) {
            const minEvo = getMinEvoPrice();
            const hasRemainingEvo = isFinite(minEvo);
            const intOwned = typeof feetTotalCount === 'function' ? feetTotalCount(player, 'interest') : 0;
            const curCoins = coins();
            // Chế độ tiết kiệm: Nếu còn Evo chưa mua, chưa bị dồn vào thế chân tường (Match Point),
            // và đã tích được >= 42% giá Evo (hoặc đã có Lợi Tức để hưởng lãi giữ ví) -> ưu tiên gom tiền mua Evo!
            const savingForEvo = hasRemainingEvo && !isDesperate() && (curCoins >= minEvo * 0.42 || intOwned >= 1);

            const cands = live().filter(c => !isBack(c) && !isReady(c) && !isReroll(c) && !isPayWin(c)).map(c => {
                const price = priceOf(c);
                const t = txt(c);
                const isEvo = c.classList.contains('evo-card');
                const isInterest = /Lợi Tức/.test(t);
                const isMtLevel = /CẤP ĐỘ/.test(t);
                let pri = isEvo ? 5.0 : 1.0;
                if (isMtLevel) pri = player.weapon === 'money_tank' ? 3.8 : 0.5;
                if (isInterest) {
                    if (gameState.round <= 3 && intOwned < 2) pri = 3.6;
                    else if (gameState.round <= 5 && intOwned < 3) pri = 2.2;
                    else pri = 0.6;
                }
                if (/Bánh Xích|Giáp Thép/.test(t)) pri += 0.6;

                // Nếu đang tiết kiệm lên Evo: không tiêu tiền lẻ vào Module Chân trừ khi miễn phí (0$),
                // mua Lợi Tức sớm (<= 2 tầng), hoặc mua xong vẫn dư đủ tiền mua Evo
                if (savingForEvo && !isEvo && !isMtLevel && price > 0) {
                    const allowEarlyInterest = isInterest && intOwned < 2 && gameState.round <= 3;
                    const canStillAffordEvo = (curCoins - price) >= minEvo;
                    if (!allowEarlyInterest && !canStillAffordEvo) {
                        return { c, price, pri: -1 };
                    }
                }
                return { c, price, pri };
            }).filter(x => x.pri > 0 && x.price !== null && x.price <= coins()).sort((a, b) => b.pri - a.pri);
            if (!cands.length) return;
            const before = sig();
            cands[0].c.click();
            if (sig() === before) return; // không mua được (giới hạn...) -> dừng
        }
    };

    // Chợ đặc biệt: thẻ không có giá $ mở ra bảng riêng có nút QUAY LẠI
    const visitSpecialShops = () => {
        const specials = live().filter(c => !isBack(c) && !isReady(c) && !isReroll(c) && !isPayWin(c) && priceOf(c) === null).map(c => txt(c).split('\n')[0]);
        for (const title of specials) {
            const card = live().find(c => txt(c).split('\n')[0] === title);
            if (!card) continue;
            card.click();
            if (!live().some(isBack)) continue; // không phải chợ (đã tự xử lý) -> bỏ qua
            const tried = new Set();
            for (let guard = 0; guard < 30; guard++) {
                const items = live().filter(c => !isBack(c) && !isReady(c) && !tried.has(txt(c)));
                if (!items.length) break;
                const c = items[0];
                const before = sig();
                c.click();
                if (sig() === before) tried.add(txt(c)); else tried.clear(); // mua được -> quét lại từ đầu
            }
            const back = live().find(isBack);
            if (back) back.click();
        }
    };

    buyMain();
    visitSpecialShops();
    // Đổi hàng thông minh: chỉ reroll khi miễn phí (0$), hoặc khi đã đủ tiền mua Evo mà chưa thấy Evo trên bàn,
    // hoặc khi đã Full Evo và còn dư nhiều tiền
    for (let r = 0; r < 6; r++) {
        const rr = live().find(isReroll);
        const cost = rr ? priceOf(rr) : null;
        if (!rr || cost === null) break;
        const minEvo = getMinEvoPrice();
        const hasEvoOnBoard = live().some(c => c.classList.contains('evo-card'));
        if (cost > 0) {
            if (hasEvoOnBoard) break; // Đã có Evo trên bàn (nhưng chưa đủ tiền mua) -> giữ tiền, không reroll mất Evo
            if (isFinite(minEvo) && coins() - cost < minEvo) break; // Đang tích tiền mua Evo -> không đốt tiền reroll
            if (coins() < cost + 35) break;
        }
        rr.click();
        buyMain();
    }
    if (typeof updateShopTitle === 'function') updateShopTitle();
}

// Nhện Độc: giữ 0.5s Cú Vồ Đoạt Mệnh khi địch đang Hóa Kén / có tầng Tơ & thẳng hàng (arBotHold)
(function () {
    const f = SmartBot.prototype.fire;
    SmartBot.prototype.fire = function (bot, enemy, aligned, inp) {
        if (bot.weapon === 'arachnid' && typeof arBotHold === 'function') {
            if (this.arHold > 0) { this.arHold++; inp.s = this.arHold <= 34; if (this.arHold > 38) { this.arHold = 0; this.tapCool = 6; } return; }
            if (arBotHold(bot, enemy, aligned)) { this.arHold = 1; inp.s = true; return; }
        }
        return f.call(this, bot, enemy, aligned, inp);
    };
})();

// Siêu Năng: nhiều đạn địch lao tới -> giữ 1s mở Vùng Niệm Lực; đủ đạn / sắp hết giờ -> nhấp phản hồi hoặc giữ Khoá Tâm
(function () {
    const f = SmartBot.prototype.fire;
    SmartBot.prototype.fire = function (bot, enemy, aligned, inp) {
        if (bot.weapon === 'psychokinesis' && typeof psyBotAction === 'function') {
            if (this.psyB > 0) { this.psyB--; inp.s = this.psyB > 2; if (this.psyB === 0) this.tapCool = 6; return; }
            if (bot.psyLockT > 0) { inp.s = false; return; }
            const a = psyBotAction(bot);
            if (a) { this.psyB = a === 'field' ? 66 : (a === 'lock' ? psyLockN(bot) + 6 : 5); inp.s = true; return; }
            if (bot.psyField > 0) { inp.s = false; return; } // đang giữ vùng: đừng nhấp bừa
        }
        return f.call(this, bot, enemy, aligned, inp);
    };
})();

// Thợ May: giữ 0.6s Rút Chỉ Xiết Chặt khi địch đang Mũi Khâu / chạm chỉ (tlBotHold)
(function () {
    const f = SmartBot.prototype.fire;
    SmartBot.prototype.fire = function (bot, enemy, aligned, inp) {
        if (bot.weapon === 'tailor' && typeof tlBotHold === 'function') {
            if (this.tlHold > 0) { this.tlHold++; inp.s = this.tlHold <= 40; if (this.tlHold > 44) { this.tlHold = 0; this.tapCool = 6; } return; }
            if (tlBotHold(bot, enemy)) { this.tlHold = 1; inp.s = true; return; }
        }
        return f.call(this, bot, enemy, aligned, inp);
    };
})();

// Jack - 6 Lỗ: giữ 1s rút The BOY (jlBotWantBoy), rồi nhấp bóp cò mỗi khi hồi xong
(function () {
    const f = SmartBot.prototype.fire;
    SmartBot.prototype.fire = function (bot, enemy, aligned, inp) {
        if (bot.weapon === 'jack_6_lo' && typeof jlBotWantBoy === 'function') {
            if (this.jlB > 0) { this.jlB--; inp.s = this.jlB > 2; return; }
            if (bot.jlMode === 'boy') { if (!(bot.jlPullCd > 0) && !bot.jlUsed) { this.jlB = 4; inp.s = true; } else inp.s = false; return; }
            if (jlBotWantBoy(bot, enemy)) { this.jlB = 66; inp.s = true; return; }
        }
        return f.call(this, bot, enemy, aligned, inp);
    };
})();

// Kusarigama: tích đủ tầng mới ra đòn, giữ 0.5s đổi Phong Cách theo khoảng cách, nhấp thu xích Khóa (kgBotAction)
(function () {
    const f = SmartBot.prototype.fire;
    SmartBot.prototype.fire = function (bot, enemy, aligned, inp) {
        if (bot.weapon === 'kusarigama' && typeof kgBotAction === 'function') {
            if (this.kgB > 0) { this.kgB--; inp.s = this.kgB > 2; return; }
            const a = kgBotAction(bot, enemy);
            if (a === 'hold') { this.kgB = kgHoldN(bot) + 6; inp.s = true; return; }
            if (a === 'tap') { this.kgB = 4; inp.s = true; return; }
        }
        return f.call(this, bot, enemy, aligned, inp);
    };
})();

// The Clock: giữ 0.5s mở Time Zone khi hồi xong; trong Time Zone nhấp gài Kim Giờ quanh địch, hết đạn thì giữ 0.4s tắt sớm (tcBotAction)
(function () {
    const f = SmartBot.prototype.fire;
    SmartBot.prototype.fire = function (bot, enemy, aligned, inp) {
        if (bot.weapon === 'the_clock' && typeof tcBotAction === 'function') {
            if (this.tcB > 0) { this.tcB--; inp.s = this.tcB > 3; return; }
            const a = tcBotAction(bot, enemy);
            if (a === 'tz') { this.tcB = 30 + 6; inp.s = true; return; }
            if (a === 'end') { this.tcB = 24 + 6; inp.s = true; return; }
            if (a === 'tap') { this.tcB = 5; inp.s = true; return; }
            if (bot.tcTZ > 0) { inp.s = false; return; }
        }
        return f.call(this, bot, enemy, aligned, inp);
    };
})();

// The Adapter: nhấp bắn khi thẳng hàng; giữ 0.4s Ép Xung Bắt Bài khi hồi xong và có đạn địch sắp trúng (adBotAction)
(function () {
    const f = SmartBot.prototype.fire;
    SmartBot.prototype.fire = function (bot, enemy, aligned, inp) {
        if (bot.weapon === 'the_adapter' && typeof adBotAction === 'function') {
            if (this.adB > 0) { this.adB--; inp.s = this.adB > 3; return; }
            const a = adBotAction(bot, enemy, aligned);
            if (a === 'skill') { this.adB = 24 + 6; inp.s = true; return; }
            if (a === 'tap') { this.adB = 5; inp.s = true; return; }
            inp.s = false; return;
        }
        return f.call(this, bot, enemy, aligned, inp);
    };
})();

// COC: Tiểu Liên giữ liên thanh khi thẳng hàng; Evo 1 giữ 0.6s ReRoll khi vũ khí bất lợi (cocBotWantReroll)
(function () {
    const f = SmartBot.prototype.fire;
    SmartBot.prototype.fire = function (bot, enemy, aligned, inp) {
        if (bot.weapon === 'coc' && typeof cocBotWantReroll === 'function') {
            if (this.cocB > 0) { this.cocB--; inp.s = this.cocB > 2; return; }
            if (cocBotWantReroll(bot, enemy)) { this.cocB = 44; inp.s = true; return; }
            if (bot.cocW === 2) { inp.s = aligned && !(bot.cocReload > 0); return; }
            if (bot.cocW === 5) { if ((this.t || 0) % 12 === 0) { this.cocB = 4; inp.s = true; } else inp.s = false; return; }
        }
        return f.call(this, bot, enemy, aligned, inp);
    };
})();

// Phản Chiếu: giữ 0.4s Mở Kính đúng nhịp đạn/lazer địch sắp chạm (prBotWantsOpen); còn lại nhấp bắn như 'tap'
(function () {
    const f = SmartBot.prototype.fire;
    SmartBot.prototype.fire = function (bot, enemy, aligned, inp) {
        if (bot.weapon === 'prism' && typeof prBotWantsOpen === 'function') {
            if (this.prB > 0) { this.prB--; inp.s = this.prB > 0; return; }
            const n = prBotWantsOpen(bot, enemy);
            if (n > 0) { this.prB = n; inp.s = true; return; }
        }
        return f.call(this, bot, enemy, aligned, inp);
    };
})();

// Tỉnh: nhấp bắn khi thẳng hàng; khi đủ Khó Chịu đôi khi giữ 0.4s nạp sẵn Đạn Cấm Chế rồi nhả (tnBotAction)
(function () {
    const f = SmartBot.prototype.fire;
    SmartBot.prototype.fire = function (bot, enemy, aligned, inp) {
        if (bot.weapon === 'tinh' && typeof tnBotAction === 'function') {
            if (this.tnB > 0) { this.tnB--; inp.s = this.tnB > 0; return; }
            const a = tnBotAction(bot, enemy, aligned);
            if (a === 'hold') { this.tnB = 24 + 4; inp.s = true; return; }
            if (a === 'tap') { this.tnB = 4; inp.s = true; return; }
            inp.s = false; return;
        }
        return f.call(this, bot, enemy, aligned, inp);
    };
})();

// Wind: giữ 0.4s Hóa Gió khi đạn địch sắp trúng; trong Hóa Gió luôn lướt qua lại (đứng yên là hiện hình), nhấp xuất kích khi Ngưng Phong đầy; ngoài ra nhấp xả Liên Phong hoặc đứng tích Ngưng Phong (wdBotAction)
(function () {
    const f = SmartBot.prototype.fire;
    SmartBot.prototype.fire = function (bot, enemy, aligned, inp) {
        if (bot.weapon === 'wind' && typeof wdBotAction === 'function') {
            if (this.wdB > 0) { this.wdB--; inp.s = this.wdB > 2; return; }
            const a = wdBotAction(bot, enemy, aligned);
            if (a === 'glide' || (bot.wdForm > 0 && a === 'tap')) {
                const cx = bot.x + bot.w / 2;
                if (!this.wdDx || cx < 30) this.wdDx = 1; else if (cx > canvas.width - 30) this.wdDx = -1;
                inp.l = this.wdDx < 0; inp.r = this.wdDx > 0;
                if (a === 'tap') { this.wdB = 4; inp.s = true; return; }
                inp.s = false; return;
            }
            if (a === 'form') { this.wdB = WD_HOLD + 5; inp.s = true; return; }
            if (a === 'tap') { this.wdB = 4; inp.s = true; return; }
            if (a === 'wait') { inp.s = false; return; }
        }
        return f.call(this, bot, enemy, aligned, inp);
    };
})();

// Diệp Thanh Phong: nhấp chiêu theo Thế Quạt, giữ 0.5s đổi Thế, giữ 1s Đổi Khí Áp, trên không giữ 0.5s để lại vòng (dtpBotAction)
(function () {
    const f = SmartBot.prototype.fire;
    SmartBot.prototype.fire = function (bot, enemy, aligned, inp) {
        if (bot.weapon === 'diep_thanh_phong' && typeof dtpBotAction === 'function') {
            // Đang bay: lái Vòng Cảnh Báo về phía địch
            if (bot.dtpMode === 'sky' && enemy) { const dx = enemy.x + enemy.w / 2 - bot.dtpSkyX; inp.l = dx < -3; inp.r = dx > 3; }
            if (this.dtpB > 0) { this.dtpB--; inp.s = this.dtpB > 3; return; }
            const a = dtpBotAction(bot, enemy, aligned);
            const n = a === 'tap' ? 2 : a === 'switch' ? dtpSwitchN(bot) + 4 : a === 'zone' ? DTP_ZONE_HOLD + 2 : a === 'leave' ? DTP_SKY_HOLD + 2 : 0;
            if (n) { this.dtpB = n + 3; inp.s = true; return; }
            inp.s = false; return;
        }
        return f.call(this, bot, enemy, aligned, inp);
    };
})();

// trong vùng nhấp thả cầu, giữ 0.5s phóng đồng loạt hoặc giữ 1.0s khoá mục tiêu (rgBotAction)
(function () {
    const f = SmartBot.prototype.fire;
    SmartBot.prototype.fire = function (bot, enemy, aligned, inp) {
        if (bot.weapon === 'railgun' && typeof rgBotAction === 'function') {
            if (this.rgB > 0) { this.rgB--; inp.s = this.rgB > 2; return; }
            const a = rgBotAction(bot, enemy, aligned);
            if (a === 'open') { this.rgB = RG_HOLD_ZONE + 8; inp.s = true; return; }
            if (a === 'volley') { this.rgB = RG_HOLD_ZONE + 14; inp.s = true; return; }
            if (a === 'aim') { this.rgB = RG_HOLD_AIM + 8; inp.s = true; return; }
            if (a === 'tap') { this.rgB = 5; inp.s = true; return; }
            inp.s = false; return;
        }
        return f.call(this, bot, enemy, aligned, inp);
    };
})();

// Skinwalker: thuần nhấp bắn theo Hình Thái (swBotFire)
(function () {
    const f = SmartBot.prototype.fire;
    SmartBot.prototype.fire = function (bot, enemy, aligned, inp) {
        if (bot.weapon === 'skinwalker' && typeof swBotFire === 'function') {
            if (this.swB > 0) { this.swB--; inp.s = this.swB > 2; return; }
            if (swBotFire(bot, enemy, aligned)) { this.swB = 4; inp.s = true; return; }
            inp.s = false; return;
        }
        return f.call(this, bot, enemy, aligned, inp);
    };
})();
