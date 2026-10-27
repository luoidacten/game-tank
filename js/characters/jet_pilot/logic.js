// ==========================================
// Phi Công (jet_pilot) — Logic: "Chuẩn bị cất cánh!"
// ------------------------------------------
// HỢP NHẤT (34×34, băng 3): nhấp -> 1 Tên Lửa chủ lực + 2 đạn phụ kẹp hai bên.
// Giữ 0.5s -> CẤT CÁNH (CD 20s): sóng năng lượng phá đạn địch xung quanh, tách thành
//   CHÂN (xe chính, 28×28, băng 1, ăn đạn bình thường) + PHI ẢNH (26×26, băng 6, miễn nhiễm, bay lơ lửng).
// Khi tách: nhả nút ở 0.5s..1s -> ĐỔI ĐIỀU KHIỂN; giữ đủ 1s -> HỢP NHẤT KHẨN CẤP (CD 40s):
//   Phi Ảnh oanh tạc thảm bom xuống làn địch rồi ghép lại, +1 Khiên.
// Chân: tự điều khiển = Đạn Nổ diện rộng (nạp nhanh hơn); AI = pháo cối đánh dấu kiểu Pháo Cao Xạ.
// Phi Ảnh: tự điều khiển = 3 đợt × 2 viên song song (nạp rất nhanh); AI = tự nhắm 3 viên/đợt +
//   mỗi 5–8s bay oanh tạc rải bom dọc làn địch rồi quay về.
// Evo 1: mạnh hơn (+25% st, AI dày hơn) + bom để lại Vệt Lửa. Evo 2: AI của cả hai luôn bật +
//   Chân tự né đạn khi bạn lái Phi Ảnh, Phi Ảnh tự ép góc khi bạn lái Chân. Full: +2 Max HP, CD ngắn,
//   oanh tạc dày hơn.
// Toàn bộ trạng thái là trường thuần trên player / đạn / entity trong bodyEffects -> đồng bộ online.
// ==========================================

const JP_CYAN = '#22d3ee', JP_FIRE = '#fb923c', JP_GOLD = '#fde047', JP_RED = '#f43f5e';
const JP_HOLD_SPLIT = 30;   // 0.5s
const JP_HOLD_MERGE = 60;   // 1.0s
const JP_HOVER = 120;       // Phi Ảnh bay trước làn mình 120px
const JP_GCD = 10;
const JP_BOMB_WARN = 60;    // bom oanh tạc: cảnh báo 1s trước khi nổ

function jpE1(p) { return !!(p && p.hasUpgrade && p.hasUpgrade('evo_pilot_1')); }
function jpE2(p) { return !!(p && p.hasUpgrade && p.hasUpgrade('evo_pilot_2')); }
function jpFull(p) { return jpE1(p) && jpE2(p) && hasFullEvo(p, 'jet_pilot'); }
function jpIs(p) { return p && p.weapon === 'jet_pilot'; }
function jpEnemy(p) { return p === p1 ? p2 : p1; }
function jpDir(p) { return p.id === 1 ? -1 : 1; }
function jpPow(p) { return jpFull(p) ? 1.25 : (jpE1(p) ? 1.15 : 1); }
function jpSplitCdMax(p) { return jpFull(p) ? 900 : 1200; }
function jpMergeCdMax(p) { return jpFull(p) ? 1800 : 2400; }
function jpSfx(n) { if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem[n]) soundSystem[n](); }
function jpTxt(x, y, s, c, sz) { addFloatingText(x, y, s, c, sz || 12); }
// Chân / Phi Ảnh "đang được AI vận hành"? (Evo 2: AI luôn bật cho cả hai)
function jpLegsAI(p) { return p.jpSplit && (p.jpCtrl === 1 || jpE2(p)); }
function jpJetAI(p) { return p.jpSplit && (p.jpCtrl === 0 || jpE2(p)); }
function jpHoverY(p) { return p.y + p.h / 2 + jpDir(p) * JP_HOVER; }
function jpLaneY(p) { const e = jpEnemy(p); return e ? e.y + e.h / 2 : (p.id === 1 ? 40 : canvas.height - 40); }

// ---------- Entity: bom / pháo cối (rơi có cảnh báo) ----------
class JpBomb {
    constructor(owner, x, y, kind, dmg, r, delay, fire) {
        this.team = owner.id; this.x = x; this.y = y; this.kind = kind;
        this.dmg = dmg; this.r = r; this.delay = delay; this.maxDelay = delay;
        this.fire = !!fire; this.boom = 0; this.active = true;
    }
    update() {
        if (!this.active) return;
        if (this.delay > 0) { if (--this.delay === 0) this.detonate(); return; }
        if (++this.boom > 18) this.active = false;
    }
    detonate() {
        const owner = this.team === 1 ? p1 : p2, e = jpEnemy(owner);
        if (typeof gmTwinAlso === 'function') gmTwinAlso(e, t => Math.abs(t.x + t.w / 2 - this.x) < this.r + t.w / 2 && Math.abs(t.y + t.h / 2 - this.y) < this.r + t.h / 2, this.dmg, owner); // Gemini: Bản Sao AI
        if (e && e.hp > 0 && Math.abs(e.x + e.w / 2 - this.x) < this.r + e.w / 2 && Math.abs(e.y + e.h / 2 - this.y) < this.r + e.h / 2) {
            e.takeDamage(this.dmg, owner);
        }
        explosions.push(new Explosion(this.x, this.y, this.r + 8, this.kind === 'mortar' ? 'rgba(34, 211, 238,' : 'rgba(251, 146, 60,', 0, owner));
        if (this.fire && typeof BodyZone === 'function') bodyEffects.push(new BodyZone(this.x, this.y, 22, 'fire', owner, 150, 0.8));
        triggerScreenShake(this.kind === 'mortar' ? 2 : 3, 6);
    }
    draw() { if (typeof jpDrawBomb === 'function') jpDrawBomb(this); }
}

// ---------- Entity: vệt Phi Ảnh lao oanh tạc (chỉ hình ảnh) ----------
class JpFlyby {
    constructor(team, x0, y0, x1, y1, dur) {
        this.team = team; this.x0 = x0; this.y0 = y0; this.x1 = x1; this.y1 = y1;
        this.t = 0; this.dur = dur; this.active = true;
    }
    update() { if (++this.t >= this.dur) this.active = false; }
    draw() { if (typeof jpDrawFlyby === 'function') jpDrawFlyby(this); }
}

// ---------- Entity: kết liễu BÁ CHỦ BẦU TRỜI ----------
class JpFinisher {
    constructor(owner, victim) {
        this.team = owner.id;
        this.x = victim.x + victim.w / 2; this.y = victim.y + victim.h / 2;
        this.t = 0; this.dur = 150; this.active = true;
    }
    update() {
        this.t++;
        // thảm bom nổ dọc làn nạn nhân theo đường bay
        if (this.t >= 22 && this.t <= 62 && (this.t - 22) % 5 === 0) {
            const i = (this.t - 22) / 5, x = (i + 0.5) * canvas.width / 9;
            explosions.push(new Explosion(x, this.y + (i % 2 ? 6 : -6), 30, i % 2 ? 'rgba(251, 146, 60,' : 'rgba(253, 224, 71,', 0, this.team === 1 ? p1 : p2));
            if (i % 3 === 0) triggerScreenShake(6, 6);
        }
        if (this.t >= this.dur) this.active = false;
    }
    draw() { if (typeof jpDrawFinisher === 'function') jpDrawFinisher(this); }
    drawOver() { if (typeof jpDrawFinisherOver === 'function') jpDrawFinisherOver(this); }
}

// ---------- Kích thước / băng đạn theo dạng ----------
function jpResize(p, n) {
    p.x += (p.w - n) / 2; p.y += (p.h - n) / 2; p.w = n; p.h = n;
    p.x = Math.max(0, Math.min(canvas.width - n, p.x));
}
function jpApplyForm(p) {
    const r = p.jpBaseReload || p.reloadTime;
    if (!p.jpSplit) { p.maxAmmo = 3; p.reloadTime = r; }
    else if (p.jpCtrl === 0) { p.maxAmmo = 1; p.reloadTime = r * (jpE2(p) ? 0.6 : 0.8); }   // Chân: nạp nhanh nhẹ
    else { p.maxAmmo = 6; p.reloadTime = r * 0.45; }                                         // Phi Ảnh: nạp rất nhanh
    p.ammo = Math.min(p.ammo, p.maxAmmo);
}

// ---------- Bắn ----------
function jpFireMerged(p, now) {
    if (!(p.ammo > 0)) { jpTxt(p.x + p.w / 2, p.y + (p.id === 1 ? -14 : p.h + 18), 'HẾT ĐẠN', '#94a3b8', 10); return; }
    p.ammo--; p.lastShot = now; p.jpGCD = JP_GCD; p.jpRecoil = 10;
    const d = jpDir(p), cx = p.x + p.w / 2, y = d < 0 ? p.y - 14 : p.y + p.h + 2, pw = jpPow(p);
    spawnBullet(p, { x: cx - 4, y, w: 8, h: 14, vx: 0, vy: d * 7.2, dmg: p.damage * 1.2 * pw, hook: 'jet_pilot', jpK: 'missile' });
    for (const s of [-1, 1]) spawnBullet(p, { x: cx + s * 10 - 2.5, y: y + 4, w: 5, h: 8, vx: 0, vy: d * 8.5, dmg: p.damage * 0.5 * pw, hook: 'jet_pilot', jpK: 'side' });
    jpSfx('playShoot');
}
function jpFireLegs(p, now) {
    if (!(p.ammo > 0)) return;
    p.ammo--; p.lastShot = now; p.jpGCD = JP_GCD; p.jpRecoil = 10;
    const d = jpDir(p), cx = p.x + p.w / 2;
    spawnBullet(p, { x: cx - 5, y: d < 0 ? p.y - 12 : p.y + p.h + 2, w: 10, h: 10, vx: 0, vy: d * 6.4, dmg: p.damage * 1.6 * jpPow(p), hook: 'jet_pilot', jpK: 'shell' });
    jpSfx('playShoot');
}
function jpJetVolley(p, aimed) {
    const d = jpDir(p), e = jpEnemy(p), pw = jpPow(p);
    const jx = p.jpJx, jy = p.jpJy + d * 12;
    if (aimed && e) {
        const v = aimVelocity(jx, jy, e, 7.5, true);
        spawnBullet(p, { x: jx - 3, y: jy - 3, w: 6, h: 6, vx: v.vx, vy: v.vy, dmg: p.damage * 0.3 * pw, hook: 'jet_pilot', jpK: 'aim' });
    } else {
        for (const s of [-1, 1]) spawnBullet(p, { x: jx + s * 6 - 2.5, y: jy - 3, w: 5, h: 9, vx: 0, vy: d * 9, dmg: p.damage * 0.7 * pw, hook: 'jet_pilot', jpK: 'jet' });
    }
    p.jpJetFlash = 5;
}

// ---------- Cất Cánh / Đổi / Hợp Nhất ----------
function jpSplitUp(p) {
    p.jpSplit = true; p.jpCtrl = 1; p.jpSplitCd = jpSplitCdMax(p);
    const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
    jpResize(p, 28);
    p.jpJx = cx; p.jpJy = cy; p.jpJvx = 0;               // Phi Ảnh cất cánh từ lưng xe
    p.jpRunT = 0; p.jpRunCd = 200 + Math.floor(Math.random() * 120);
    p.jpAimCd = 40; p.jpMortarCd = 60; p.jpBurst = 0;
    jpApplyForm(p); p.ammo = p.maxAmmo;
    // Sóng năng lượng: phá mọi đạn địch xung quanh
    const R = jpFull(p) ? 180 : (jpE1(p) ? 150 : 130), e = jpEnemy(p);
    let n = 0;
    if (e && e.bullets) for (let i = e.bullets.length - 1; i >= 0; i--) {
        const b = e.bullets[i];
        if (!b || typeof b.x !== 'number') continue;
        if (Math.hypot(b.x + (b.w || 6) / 2 - cx, b.y + (b.h || 6) / 2 - cy) < R) { e.bullets.splice(i, 1); n++; }
    }
    p.jpWaveFx = 24; p.jpWaveR = R;
    explosions.push(new Explosion(cx, cy, 40, 'rgba(34, 211, 238,', 0, p));
    jpTxt(cx, p.y + (p.id === 1 ? -20 : p.h + 24), n > 0 ? '🛫 CẤT CÁNH! (-' + n + ' đạn)' : '🛫 CẤT CÁNH!', JP_CYAN, 13);
    triggerScreenShake(3, 8);
    jpSfx('playPowerup');
}
function jpSwitch(p) {
    p.jpCtrl = p.jpCtrl === 1 ? 0 : 1;
    jpApplyForm(p); p.ammo = p.maxAmmo; p.jpBurst = 0; p.jpSwapFx = 18;
    const x = p.jpCtrl === 1 ? p.jpJx : p.x + p.w / 2, y = p.jpCtrl === 1 ? p.jpJy : p.y + p.h / 2;
    jpTxt(x, y + (p.id === 1 ? -22 : 26), p.jpCtrl === 1 ? '✈ LÁI PHI ẢNH' : '⚙ LÁI CHÂN', JP_CYAN, 12);
    spawnSparkParticles(x, y, JP_CYAN, 8);
    jpSfx('playPowerup');
}
function jpCarpet(p, n, dmg, spacing, baseDelay) {
    const e = jpEnemy(p), ly = jpLaneY(p);
    const ex = e ? e.x + e.w / 2 : canvas.width / 2;
    const x0 = Math.max(20, Math.min(canvas.width - 20 - spacing * (n - 1), ex - spacing * (n - 1) / 2));
    for (let i = 0; i < n; i++) {
        bodyEffects.push(new JpBomb(p, x0 + i * spacing, ly, 'bomb', dmg, 24, Math.max(JP_BOMB_WARN, baseDelay) + i * 5, jpE1(p) && i % 2 === 0));
    }
    return { x0, x1: x0 + spacing * (n - 1), y: ly };
}
function jpMerge(p) {
    const n = jpFull(p) ? 7 : 5;
    const c = jpCarpet(p, n, 0.5 * jpPow(p) * (p.damage / 0.5), 34, 18);
    bodyEffects.push(new JpFlyby(p.id, c.x0 - 60, c.y - jpDir(p) * 10, c.x1 + 60, c.y - jpDir(p) * 10, 40));
    p.jpSplit = false; p.jpCtrl = 0; p.jpBurst = 0; p.jpRunT = 0;
    jpResize(p, 34);
    jpApplyForm(p); p.ammo = p.maxAmmo;
    p.shield = (p.shield || 0) + 1;
    p.jpMergeCd = jpMergeCdMax(p); p.jpMergeFx = 24;
    jpTxt(p.x + p.w / 2, p.y + (p.id === 1 ? -20 : p.h + 24), '✈ OANH TẠC! HỢP NHẤT +🛡', JP_GOLD, 13);
    triggerScreenShake(4, 10);
    jpSfx('playExplosion');
}

// ---------- AI Chân: pháo cối đánh dấu + (Evo 2) tự né đạn ----------
function jpLegsUpdate(p) {
    const e = jpEnemy(p);
    if (jpLegsAI(p) && e && e.hp > 0) {
        if (--p.jpMortarCd <= 0) {
            p.jpMortarCd = jpFull(p) ? 110 : (jpE1(p) ? 150 : 180);
            const t = laneTargetPoint(e, 30);
            bodyEffects.push(new JpBomb(p, t.x, t.y, 'mortar', 0.45 * jpPow(p) * (p.damage / 0.5), 30, 50, false));
            p.jpRecoil = 8;
            spawnSparkParticles(p.x + p.w / 2, p.y + (p.id === 1 ? 0 : p.h), JP_CYAN, 4);
        }
    }
    // Evo 2: lái Phi Ảnh -> Chân tự lách né đạn
    if (p.jpSplit && p.jpCtrl === 1 && jpE2(p) && e && e.bullets) {
        const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
        let push = 0;
        for (const b of e.bullets) {
            if (!b || typeof b.x !== 'number') continue;
            const bx = b.x + (b.w || 6) / 2, by = b.y + (b.h || 6) / 2;
            const toward = (by - cy) * (b.vy || 0) < 0, dy = Math.abs(by - cy), dx = bx - cx;
            if (toward && dy < 190 && Math.abs(dx) < p.w / 2 + 12) push += dx > 0 ? -1 : 1;
        }
        if (push !== 0) {
            const sp = p.speed * 0.9 * (p.statusSpeedMult || 1);
            p.x = Math.max(0, Math.min(canvas.width - p.w, p.x + Math.sign(push) * sp));
        }
    }
}

// ---------- Phi Ảnh: di chuyển, bắn, oanh tạc ----------
function jpJetUpdate(p, inp, now) {
    const e = jpEnemy(p), d = jpDir(p), W = canvas.width;
    const ex = e ? e.x + e.w / 2 : W / 2;
    let tx = p.jpJx, ty = jpHoverY(p);
    if (p.jpRunT > 0) {
        // Oanh tạc: lao tới làn địch -> quét ngang rải bom -> vòng về
        const T = 100 - p.jpRunT; p.jpRunT--;
        const ly = jpLaneY(p) - d * 26;
        if (T < 30) { const k = T / 30; ty = jpHoverY(p) + (ly - jpHoverY(p)) * k; tx = p.jpRunX0 + (p.jpRunSx - p.jpRunX0) * k; }
        else if (T < 70) {
            const k = (T - 30) / 40; ty = ly; tx = p.jpRunSx + p.jpRunDir * 150 * k;
            const every = jpFull(p) ? 6 : 9;
            if ((T - 30) % every === 0) bodyEffects.push(new JpBomb(p, Math.max(14, Math.min(W - 14, tx)), jpLaneY(p), 'bomb', 0.35 * jpPow(p) * (p.damage / 0.5), 24, JP_BOMB_WARN, jpE1(p) && ((T - 30) / every) % 2 === 0));
        } else { const k = (T - 70) / 30; ty = ly + (jpHoverY(p) - ly) * k; tx = p.jpJx + (p.jpRunX0 - p.jpJx) * Math.min(1, k * 0.5); }
        p.jpJx += (tx - p.jpJx) * 0.35; p.jpJy += (ty - p.jpJy) * 0.35; p.jpJvx = 0;
        p.jpJx = Math.max(13, Math.min(W - 13, p.jpJx));
        return;
    }
    if (p.jpCtrl === 1) {
        // Người chơi lái: trái/phải nhanh
        const sp = p.speed * 1.35;
        const v = (inp && inp.l ? -1 : 0) + (inp && inp.r ? 1 : 0);
        p.jpJvx = v * sp;
        p.jpJx += p.jpJvx;
        p.jpJy += (ty - p.jpJy) * 0.12;
    } else {
        // AI: bám theo địch (Evo 2: bay ép góc sát sườn & sâu hơn)
        const flank = jpE2(p);
        if (flank) {
            if (!p.jpSide || Math.random() < 0.004) p.jpSide = Math.random() < 0.5 ? -1 : 1;
            tx = ex + p.jpSide * 58; ty = jpHoverY(p) + d * 70;
        } else tx = ex + Math.sin(now / 700) * 40;
        const ox = p.jpJx;
        p.jpJx += Math.max(-3.2, Math.min(3.2, (tx - p.jpJx) * 0.06));
        p.jpJy += (ty - p.jpJy) * 0.06;
        p.jpJvx = p.jpJx - ox;
    }
    p.jpJx = Math.max(13, Math.min(W - 13, p.jpJx));
    if (jpJetAI(p) && e && e.hp > 0) {
        // tự nhắm: luồng 3 viên
        if (--p.jpAimCd <= 0) { p.jpAimCd = jpFull(p) ? 75 : (jpE1(p) ? 85 : 100); p.jpAimLeft = 3; p.jpAimT = 0; }
        if (p.jpAimLeft > 0 && --p.jpAimT <= 0) { p.jpAimT = 6; p.jpAimLeft--; jpJetVolley(p, true); }
        // định kỳ 5–8s (Full: 3.5–5.5s) oanh tạc
        if (--p.jpRunCd <= 0) {
            p.jpRunCd = jpFull(p) ? 210 + Math.floor(Math.random() * 120) : 300 + Math.floor(Math.random() * 180);
            p.jpRunT = 100; p.jpRunX0 = p.jpJx;
            p.jpRunDir = ex < W / 2 ? 1 : -1;
            p.jpRunSx = Math.max(20, Math.min(W - 20, ex - p.jpRunDir * 75));
            jpTxt(p.jpJx, p.jpJy + d * 20, '✈ OANH TẠC!', JP_FIRE, 11);
        }
    }
}

// ---------- Đạn ----------
function jpUpdateBullets(p) {
    const e = jpEnemy(p);
    if (!e) return;
    const ly = e.y + e.h / 2;
    for (let i = p.bullets.length - 1; i >= 0; i--) {
        const b = p.bullets[i];
        if (b.hook !== 'jet_pilot' || b.jpK !== 'shell') continue;
        const by = b.y + b.h / 2;
        if (p.id === 1 ? by <= ly : by >= ly) {
            // Đạn Nổ: nổ diện rộng khi tới làn địch (trượt vẫn ăn 60% st lan)
            p.bullets.splice(i, 1);
            const bx = b.x + b.w / 2, R = 40;
            if (e.hp > 0 && Math.abs(e.x + e.w / 2 - bx) < R + e.w / 2 && Math.abs(ly - by) < R) e.takeDamage(b.dmg * 0.6, p);
            explosions.push(new Explosion(bx, by, R, 'rgba(34, 211, 238,', 0, p));
        }
    }
}

BulletHooks.register('jet_pilot', {
    hit(b, o, v) {
        if (!o || !v) return;
        const x = b.x + b.w / 2, y = b.y + b.h / 2;
        if (b.jpK === 'missile' || b.jpK === 'shell') explosions.push(new Explosion(x, y, b.jpK === 'shell' ? 40 : 22, b.jpK === 'shell' ? 'rgba(34, 211, 238,' : 'rgba(251, 146, 60,', 0, o));
        else spawnSparkParticles(x, y, JP_CYAN, 3);
    },
    draw(b) { if (typeof jpDrawBullet === 'function') jpDrawBullet(b); },
});

CharHooks.register('jet_pilot', {
    setup() {
        if (jpFull(this)) this.maxHp += 2;
        this.jpBaseReload = this.reloadTime;
        this.jpSplit = false; this.jpCtrl = 0; this.jpHold = 0; this.jpPrevS = false; this.jpHoldUsed = false;
        this.jpSplitCd = 0; this.jpMergeCd = 0; this.jpGCD = 0; this.jpRecoil = 0;
        this.jpJx = this.x + this.w / 2; this.jpJy = this.y + this.h / 2; this.jpJvx = 0;
        this.jpRunT = 0; this.jpRunCd = 300; this.jpAimCd = 0; this.jpAimLeft = 0; this.jpAimT = 0;
        this.jpMortarCd = 0; this.jpBurst = 0; this.jpBurstT = 0; this.jpSide = 1;
        this.jpWaveFx = 0; this.jpWaveR = 130; this.jpSwapFx = 0; this.jpMergeFx = 0; this.jpJetFlash = 0;
        jpApplyForm(this);
    },
    update(inp, eff, now) {
        if (this.jpGCD > 0) this.jpGCD--;
        if (this.jpRecoil > 0) this.jpRecoil--;
        if (this.jpSplitCd > 0) this.jpSplitCd--;
        if (this.jpMergeCd > 0) this.jpMergeCd--;
        if (this.jpWaveFx > 0) this.jpWaveFx--;
        if (this.jpSwapFx > 0) this.jpSwapFx--;
        if (this.jpMergeFx > 0) this.jpMergeFx--;
        if (this.jpJetFlash > 0) this.jpJetFlash--;
        if (this.jpSplit) {
            jpLegsUpdate(this);
            jpJetUpdate(this, eff || inp, now);
            // loạt 3 đợt × 2 viên của Phi Ảnh khi tự lái
            if (this.jpBurst > 0 && --this.jpBurstT <= 0) {
                this.jpBurstT = 5; this.jpBurst--;
                if (this.ammo > 0) { this.ammo = Math.max(0, this.ammo - 2); jpJetVolley(this, false); }
            }
        } else { this.jpJx = this.x + this.w / 2; this.jpJy = this.y + this.h / 2; }
        jpUpdateBullets(this);
    },
    speed(v) { return this.jpSplit && this.jpCtrl === 1 ? 0 : v; },
    shoot(inp, now) {
        const s = !!inp.s;
        const released = !s && this.jpPrevS;
        this.jpPrevS = s;
        if (s) {
            this.jpHold++;
            if (!this.jpHoldUsed) {
                if (!this.jpSplit && this.jpHold >= JP_HOLD_SPLIT && this.jpSplitCd <= 0) { this.jpHoldUsed = true; jpSplitUp(this); }
                else if (this.jpSplit && this.jpHold >= JP_HOLD_MERGE && this.jpMergeCd <= 0) { this.jpHoldUsed = true; jpMerge(this); }
            }
        } else if (released) {
            const h = this.jpHold;
            if (!this.jpHoldUsed) {
                if (this.jpSplit && h >= JP_HOLD_SPLIT) jpSwitch(this);
                else if (h < JP_HOLD_SPLIT && this.jpGCD <= 0) {
                    if (!this.jpSplit) jpFireMerged(this, now);
                    else if (this.jpCtrl === 0) jpFireLegs(this, now);
                    else if (this.jpRunT <= 0 && this.ammo > 0 && this.jpBurst <= 0) {
                        this.jpBurst = Math.min(3, Math.ceil(this.ammo / 2)); this.jpBurstT = 0;
                        this.lastShot = now; this.jpGCD = JP_GCD;
                        jpSfx('playShoot');
                    }
                }
            }
            this.jpHold = 0; this.jpHoldUsed = false;
        } else { this.jpHold = 0; this.jpHoldUsed = false; }
        return true;
    },
});

// Smart bot: số tick cần giữ nút (0 = không giữ)
function jpBotHold(bot) {
    if (!bot.jpSplit) return bot.jpSplitCd <= 0 && Math.random() < 0.02 ? 34 : 0;
    if (bot.jpMergeCd <= 0 && (bot.hp < bot.maxHp * 0.45 || Math.random() < 0.002)) return 64;
    return Math.random() < 0.006 ? 34 : 0;
}

// takeDamage: kết liễu BÁ CHỦ BẦU TRỜI (nối tiếp wrapper sẵn có)
(function () {
    const orig = Player.prototype.takeDamage;
    Player.prototype.takeDamage = function (amount, attacker) {
        const before = this.hp;
        const r = orig.apply(this, arguments);
        if (before > 0 && this.hp <= 0 && attacker && attacker !== this && jpIs(attacker)
            && typeof bodyEffects !== 'undefined' && !bodyEffects.some(e => e instanceof JpFinisher)) {
            bodyEffects.push(new JpFinisher(attacker, this));
            triggerScreenShake(10, 20);
            spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, JP_FIRE, 24);
            jpSfx('playExplosion');
        }
        return r;
    };
})();
