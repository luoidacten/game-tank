// ==========================================
// Jack - 6 Lỗ (jack_6_lo) — "MỘT VÁN NỮA, CƯỢC ĐI CƯỢC ĐI NÀO HAAHAHA!" (docs/BODY_MOI_4.md #68)
// ------------------------------------------
// Chỉ Số Bất Định: đầu hiệp HP / Dame / Tốc random ±30% (tổng hệ số = 0 -> cân bằng).
// Tung Xu mỗi 3s (Full 2s): NGỬA -> LUCK 12s (xóa Nợ, +tốc, giảm st, né, crit 50%; ngưng tung) | ÚP -> +1 NỢ (-tốc, +st nhận).
// The Hand (nhấp): ổ 6 viên, mỗi nhấp xả loạt 1–4 viên bay THẲNG (lệch rất nhỏ), 25% chí mạng x2. Mỗi lần nạp (1.4s)
//   random 6 viên từ 12 loại đạn đặc biệt (JL_AMMO, docs/BODY_MOI_7.md mục A) — ổ đạn hiện 6 icon cạnh xe.
// THE BOY (giữ 1s): Cò Quay Nga — không cất súng, mỗi nhấp bóp 1 lỗ (1s/lần), viên thật ở 1..6 (Luck/Nợ lệch tỉ lệ).
//   Phát 1: x8.5 đại đạn nổ, phá 1 Khiên | 2–3: x2.8 nổ + chậm | 4–5: x2.1 "Nah, chán!" | trống: "CẠCH!" |
//   6: nổ ngược (choáng 1.6s + tự nhận 2.8 st bỏ qua khiên, +1 Nợ, hồi 8s). Đạn The BOY cũng bay thẳng.
// Evo 1 / Evo 2 / Full theo bảng spec. Kết liễu bằng The BOY -> JACKPOT 777!
// Trạng thái: trường thuần trên player + JlFinisher trong bodyEffects (đồng bộ online).
// ==========================================

const JL_GOLD = '#fcd34d', JL_RED = '#ef4444', JL_GREEN = '#34d399', JL_PURP = '#a855f7';
const JL_HOLD = 60;

function jlE1(p) { return p.hasUpgrade('evo_jack_1'); }
function jlE2(p) { return p.hasUpgrade('evo_jack_2'); }
function jlFull(p) { return jlE1(p) && jlE2(p) && hasFullEvo(p, 'jack_6_lo'); }
function jlIs(p) { return !!p && p.weapon === 'jack_6_lo'; }
function jlEnemy(p) { return p === p1 ? p2 : p1; }
function jlDir(p) { return p.id === 1 ? -1 : 1; }
function jlAlive(t) { return t && t.hp > 0; }
function jlSfx(n) { if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem[n]) soundSystem[n](); }
function jlTxt(o, s, c, sz, dy) { addFloatingText(o.x + o.w / 2, o.y + (o.id === 1 ? -18 - (dy || 0) : o.h + 22 + (dy || 0)), s, c, sz || 12); }
function jlLuckDur(p) { return jlE1(p) ? 960 : 720; }
function jlFlipEvery(p) { return jlFull(p) ? 120 : 180; }
function jlPullGap(p) { return jlFull(p) ? 26 : 45; }
function jlCrit(p) { return p.jlLuck > 0 ? 0.5 : 0.25; }
function jlSpeedMult(p) {
    if (p.jlLuck > 0) return jlE1(p) ? 1.3 : 1.2;
    return 1 - Math.min(0.4, (p.jlDebt || 0) * (jlE1(p) ? 0.05 : 0.04));
}
function jlTakenMult(p) {
    if (p.jlLuck > 0) return jlE1(p) ? 0.75 : 0.85;
    return 1 + (p.jlDebt || 0) * (jlE1(p) ? 0.08 : 0.05);
}
function jlDodge(p) { return p.jlLuck > 0 ? (jlE1(p) ? 0.3 : 0.2) : 0; }
function jlJackpotNeed(p) { return jlFull(p) ? 7 : 10; }

// ---------- Tung Xu ----------
function jlStartLuck(p, ticks, why) {
    p.jlLuck = Math.max(p.jlLuck || 0, ticks); p.jlLuckMax = Math.max(p.jlLuck, 1);
    if (p.jlDebt > 0) jlTxt(p, 'XÓA ' + p.jlDebt + ' NỢ!', JL_GREEN, 11, 14);
    p.jlDebt = 0;
    if (jlE2(p)) { p.shield = (p.shield || 0) + 1; }
    jlTxt(p, why || 'LUCK!', JL_GOLD, 15);
    spawnSparkParticles(p.x + p.w / 2, p.y + p.h / 2, JL_GOLD, 14);
    jlSfx('playCoin');
}
function jlFlip(p) {
    p.jlFlipFx = 42;
    if (Math.random() < 0.5) { p.jlFlipRes = 1; jlStartLuck(p, jlLuckDur(p), 'NGỬA — LUCK!'); }
    else {
        p.jlFlipRes = 2; p.jlDebt = (p.jlDebt || 0) + 1;
        jlTxt(p, 'ÚP — NỢ x' + p.jlDebt, JL_RED, 12);
        jlSfx('playHit');
    }
}

// ---------- The Hand (Hander) — ổ 6 viên đạn đặc biệt ----------
// Mỗi lần nạp: random 6 viên từ bảng 12 loại (Luck nghiêng về đạn tốt, Nợ nghiêng về đạn xịt / phản chủ).
// Mọi phát bay THẲNG, chỉ lệch rất nhỏ. Dame bảng nhân theo hệ số Dame của Jack (p.damage / 1.0).
// sp = hệ số tốc đạn, w = trọng số gốc, bad = nhóm phản chủ / xịt (Luck giảm, Nợ tăng tỉ lệ), crit = được tính Chí Mạng
const JL_AMMO = [null,
    { k: 'gold', n: 'Hoàng Kim', ic: '🌟', c: '#fcd34d', dmg: 1.35, sp: 2.0, w: 0.6, crit: 1 },
    { k: 'blast', n: 'Bộc Phá', ic: '🔥', c: '#fb923c', dmg: 1.05, sp: 1.25, w: 0.8, crit: 1 },
    { k: 'pierce', n: 'Xuyên Phá', ic: '⚡', c: '#22d3ee', dmg: 0.95, sp: 2.0, w: 0.8, crit: 1 },
    { k: 'ice', n: 'Băng Hàn', ic: '❄️', c: '#93c5fd', dmg: 0.7, sp: 1.25, w: 1, crit: 1 },
    { k: 'poison', n: 'Độc Rỉa', ic: '🧪', c: '#84cc16', dmg: 0.6, sp: 1.25, w: 1, crit: 1 },
    { k: 'shock', n: 'Điện Giật', ic: '💫', c: '#facc15', dmg: 0.6, sp: 1.3, w: 0.8, crit: 1 },
    { k: 'blood', n: 'Huyết Tệ', ic: '💚', c: '#34d399', dmg: 0.7, sp: 1.25, w: 1, crit: 1 },
    { k: 'hype', n: 'Hưng Phấn', ic: '🛡️', c: '#f8fafc', dmg: 0.6, sp: 1.25, w: 1, crit: 1 },
    { k: 'smoke', n: 'Khói Mù', ic: '💨', c: '#94a3b8', dmg: 0.3, sp: 1.1, w: 1, crit: 1 },
    { k: 'toy', n: 'Nhựa Đồ Chơi', ic: '🤡', c: '#f472b6', dmg: 0.2, sp: 0.5, w: 1.25, bad: 1 },
    { k: 'back', n: 'Nổ Ngược Nòng', ic: '💥', c: '#ef4444', dmg: 0, sp: 0, w: 1.05, bad: 1 },
    { k: 'curse', n: 'Nguyền Phản Phệ', ic: '💀', c: '#6b7280', dmg: 0.3, sp: 0.9, w: 1.05, bad: 1 },
];
// Đạn Điện Giật ngắt mọi kỹ năng đang tụ lực của địch
const JL_CHARGE_FIELDS = ['sukunaChargeTimer', 'gojoChargeTimer', 'bowChargeTimer', 'lazerCharge', 'overloadCharge', 'mirrorCharge',
    'energyChargeTimer', 'sniperChargeTimer', 'stormChargeTimer', 'swordChargeTimer', 'sniperCharge', 'magicianCharge', 'cuCharge', 'wdCharge'];
function jlReloadTicks(p) { return jlFull(p) ? 90 : 132; }
function jlRollAmmo(p) {
    const luck = p.jlLuck > 0, debt = p.jlDebt || 0;
    const w = JL_AMMO.map((a, i) => !a ? 0 : a.w * (a.bad ? (luck ? 0.35 : 1 + 0.15 * Math.min(6, debt)) : (luck && i <= 3 ? 1.5 : 1)));
    const tot = w.reduce((s, x) => s + x, 0);
    let r = Math.random() * tot;
    for (let i = 1; i <= 12; i++) { r -= w[i]; if (r <= 0) return i; }
    return 12;
}
function jlReloadDone(p) {
    p.jlCyl = []; for (let i = 0; i < 6; i++) p.jlCyl.push(p.jlForceAmmo || jlRollAmmo(p));
    p.jlCylIdx = 0; p.maxAmmo = 6; p.ammo = 6; p.jlReload = 0; p.jlLoadFx = 30;
    const good = p.jlCyl.filter(t => t <= 3).length, bad = p.jlCyl.filter(t => JL_AMMO[t].bad).length;
    jlTxt(p, 'NẠP: ' + p.jlCyl.map(t => JL_AMMO[t].ic).join(''), good >= 3 ? JL_GOLD : (bad >= 3 ? JL_RED : '#e2e8f0'), 10);
}
function jlHander(p, now) {
    if (p.jlReload > 0 || p.jlBurst > 0 || !(p.ammo > 0)) return;
    p.jlBurst = Math.min(p.ammo, 1 + Math.floor(Math.random() * 2)); p.jlBurstT = 0;
    p.lastShot = now; p.jlIdle = 0;
}
// Bắn viên kế tiếp trong ổ (gọi từ jlTick theo nhịp loạt)
function jlFireNext(p) {
    const t = (p.jlCyl && p.jlCyl[p.jlCylIdx]) || 10, A = JL_AMMO[t];
    p.jlCylIdx++; p.ammo = Math.max(0, 6 - p.jlCylIdx); p.jlRecoil = 8; p.jlCylRot = (p.jlCylRot || 0) + 1; p.jlLastAmmo = t; p.jlAmmoFx = 26;
    const dir = jlDir(p), cx = p.x + p.w / 2, sy = dir < 0 ? p.y - 8 : p.y + p.h + 2;
    if (p.ammo <= 0) p.jlReload = jlReloadTicks(p);
    if (A.k === 'back') { // nổ ngay tại nòng, không bay đi
        explosions.push(new Explosion(cx, sy, 30, 'rgba(239, 68, 68,', 0, p));
        spawnSparkParticles(cx, sy, JL_RED, 12); triggerScreenShake(4, 8);
        jlTxt(p, '💥 NỔ NGƯỢC NÒNG! -0.6', JL_RED, 12);
        p.takeDamage(0.6, p, { bypassShield: true, unavoidable: true, ignoreInvincible: true, jlSelf: true });
        p.freezeTimer = Math.max(p.freezeTimer || 0, 15);
        p.jlBurst = 0; jlSfx('playExplosion');
        return;
    }
    const crit = !!A.crit && Math.random() < jlCrit(p);
    let dmg = A.dmg * Math.max(0.1, p.damage || 1);
    if (A.crit) { if (jlE2(p)) dmg *= crit ? 3 : 0.5; else if (crit) dmg *= 2; }
    const a = (Math.random() - 0.5) * 0.05, sp = C.bulletSpeed * 1.25 * A.sp;
    const big = A.k === 'gold' || A.k === 'blast' ? 8 : (A.k === 'smoke' || A.k === 'curse' ? 9 : 6);
    spawnBullet(p, {
        x: cx - big / 2, y: sy - (dir < 0 ? big : 0), w: big, h: big,
        vx: Math.sin(a) * sp, vy: Math.cos(a) * sp * dir, dmg, hook: 'jl_hander', jlCrit: crit, jlBounce: 0, jlT: t,
        isPiercing: A.k === 'pierce', jlBreak: A.k === 'gold' ? 1 : 0,
    });
    if (crit) jlTxt(p, 'CRIT!', JL_GOLD, 10, 10);
    if (A.k === 'hype') {
        p.gearWhiteShield = (p.gearWhiteShield || 0) + 0.4; p.jlHypeT = 120;
        jlTxt(p, '🛡️ +0.4 GIÁP TRẮNG · +35% TỐC', '#f8fafc', 11);
    } else if (A.k === 'curse') {
        p.jlCurseT = 120;
        jlTxt(p, '💀 PHẢN PHỆ! CHẬM & LỘ ĐIỂM YẾU', '#9ca3af', 11);
    } else if (A.k === 'toy') jlTxt(p, '🎺 PÍP PÍP~ (xịt)', '#f472b6', 11);
    jlSfx('playShoot');
}
function jlCCImmune(v) { return !!v && v.weapon === 'juggernaut'; }
function jlVTxt(v, s, c, sz) { addFloatingText(v.x + v.w / 2, v.y + (v.id === 1 ? -14 : v.h + 18), s, c, sz || 11); }
function jlApplyAmmo(o, v, t) {
    const A = JL_AMMO[t], cx = v.x + v.w / 2, cy = v.y + v.h / 2, imm = jlCCImmune(v);
    if (!A) return;
    if (A.k === 'gold') spawnSparkParticles(cx, cy, JL_GOLD, 10);
    else if (A.k === 'blast') {
        explosions.push(new Explosion(cx, cy, 60, 'rgba(251, 146, 60,', 0, o)); triggerScreenShake(4, 8);
        if (!imm) { // hất trượt ngang ~60px (kbX 9 x hệ số tắt dần 0.85)
            const dx = cx - (o.x + o.w / 2), s = Math.abs(dx) < 4 ? (Math.random() < 0.5 ? -1 : 1) : Math.sign(dx);
            v.kbX = s * 9;
        }
    } else if (A.k === 'ice') {
        if (!imm) { v.jlSlowT = Math.max(v.jlSlowT || 0, 120); jlVTxt(v, '❄️ CHẬM 45%', '#93c5fd'); }
        spawnSparkParticles(cx, cy, '#bfdbfe', 8);
    } else if (A.k === 'poison') {
        v.jlPoisT = 180; v.jlHealCutT = 180;
        jlVTxt(v, '🧪 TRÚNG ĐỘC · -40% HỒI MÁU', '#84cc16');
    } else if (A.k === 'shock') {
        if (!imm) {
            v.freezeTimer = Math.max(v.freezeTimer || 0, 36);
            JL_CHARGE_FIELDS.forEach(f => { if (typeof v[f] === 'number' && v[f] > 0) v[f] = 0; });
            if (v.jlHold) v.jlHold = 0;
            jlVTxt(v, '💫 CHOÁNG! NGẮT TỤ LỰC', '#facc15');
        }
        spawnSparkParticles(cx, cy, '#fde047', 10);
    } else if (A.k === 'blood') {
        if (jlAlive(o)) { const h = Math.min(0.3, Math.max(0, o.maxHp - o.hp)); o.hp += h; jlTxt(o, '💚 +' + h.toFixed(2) + ' HP', JL_GREEN, 11, 12); }
    } else if (A.k === 'smoke') {
        if (!imm) { v.blindTimer = Math.max(v.blindTimer || 0, 72); v.jlBlindT = 72; jlVTxt(v, '💨 MÙ HUD!', '#cbd5e1'); }
    } else if (A.k === 'toy') jlVTxt(v, 'BỤP! 🎈', '#f472b6', 12);
    if (imm && (A.k === 'blast' || A.k === 'ice' || A.k === 'shock' || A.k === 'smoke')) jlVTxt(v, 'MIỄN NHIỄM', '#cbd5e1', 10);
}
// Trạng thái Jack đặt lên địch (trường thuần, Jack cập nhật mỗi tick)
function jlTickEnemy(p) {
    const e = jlEnemy(p); if (!e) return;
    if (e.jlSlowT > 0) { e.jlSlowT--; addStatusSlow(e, 0.55); }
    if (e.jlBoySlowT > 0) { e.jlBoySlowT--; addStatusSlow(e, 0.7); }
    if (e.jlBlindT > 0) e.jlBlindT--;
    if (e.jlPoisT > 0 && e.hp > 0) {
        e.jlPoisT--;
        if (e.jlPoisT % 30 === 0) { // 0.3 HP/s
            e.takeDamage(0.15, p, { unavoidable: true, bypassShield: true, isPoison: true });
            spawnSparkParticles(e.x + e.w / 2, e.y + e.h / 2, '#84cc16', 4);
        }
    }
    // -40% hồi máu: so với ảnh chụp máu tick trước
    const cut = e.jlHealCutT > 0;
    if (cut) e.jlHealCutT--;
    if (cut && typeof e.jlHpSnap === 'number' && e.jlHpSnap > 0 && e.hp > e.jlHpSnap) e.hp = e.jlHpSnap + (e.hp - e.jlHpSnap) * 0.6;
    e.jlHpSnap = e.hp;
}
BulletHooks.register('jl_hander', {
    hit(b, o, v) {
        if (!v) return;
        if (b.jlCrit) spawnSparkParticles(v.x + v.w / 2, v.y + v.h / 2, JL_GOLD, 6);
        if (b.jlT) jlApplyAmmo(o, v, b.jlT);
    },
    edge(b, o) {
        // Full Evo: đạn chí mạng nảy tường bên 1 lần
        if (b.jlCrit && jlFull(o) && !b.jlBounce && (b.x <= 0 || b.x >= canvas.width) && b.y > 0 && b.y < canvas.height) {
            b.jlBounce = 1; b.vx = -b.vx; b.x = Math.max(1, Math.min(canvas.width - b.w - 1, b.x));
            spawnSparkParticles(b.x, b.y, JL_GOLD, 4);
            return 'keep';
        }
        if (b.jlT === 2) explosions.push(new Explosion(b.x + b.w / 2, b.y + b.h / 2, 40, 'rgba(251, 146, 60,', 0, o));
    },
    obstacle(b, o) { if (b.jlT === 2) explosions.push(new Explosion(b.x + b.w / 2, b.y + b.h / 2, 40, 'rgba(251, 146, 60,', 0, o)); },
    draw(b) { if (typeof jlDrawHanderBullet === 'function') jlDrawHanderBullet(b); },
});

// ---------- THE BOY ----------
function jlRollLive(p) {
    let w = [1, 1, 1, 1, 1, 1];
    if (p.jlLuck > 0) w = [3, 2.4, 1.9, 1.3, 0.9, 0.5];
    else if (!jlE2(p) && p.jlDebt > 0) w[5] += 0.35 * p.jlDebt;
    const tot = w.reduce((a, x) => a + x, 0);
    let r = Math.random() * tot;
    for (let i = 0; i < 6; i++) { r -= w[i]; if (r <= 0) return i + 1; }
    return 6;
}
function jlDraw(p) {
    p.jlMode = 'boy'; p.jlPulled = 0; p.jlLive = jlRollLive(p); p.jlPullCd = 20; p.jlBorrowT = 0; p.jlDrawFx = 30;
    p.jlCylRot = (p.jlCylRot || 0) + 13;
    jlTxt(p, 'GAME ON!', JL_PURP, 15);
    triggerScreenShake(2, 6); jlSfx('playDash');
}
function jlMults(p, ch) {
    const e1 = jlE1(p), e2 = jlE2(p), d = p.jlDebt || 0;
    // Hệ số MỖI VIÊN trong loạt 6 viên tự ngắm (tổng loạt = x6)
    if (ch === 1) return (e1 ? 0.6 : 0.5) + (e2 ? (1 + d) / 6 : 0);
    if (ch <= 3) return (e1 ? 0.42 : 0.34) + (e2 ? d / 12 : 0);
    return e1 ? 0.3 : 0.24;
}
function jlBoyFire(p, ch) {
    const e = jlEnemy(p), dir = jlDir(p), cx = p.x + p.w / 2, sy = dir < 0 ? p.y - 14 : p.y + p.h + 4;
    const debt = p.jlDebt || 0;
    const jackpot = ch === 1 && jlE2(p) && debt >= jlJackpotNeed(p);
    const mult = jackpot ? 100 : jlMults(p, ch);
    if (jackpot) {
        // Độc Đắc: 1 siêu đạn khóa chết mục tiêu
        const sz = 18, sp = C.bulletSpeed * 2.2;
        const b = spawnBullet(p, { x: cx - sz / 2, y: sy - (dir < 0 ? sz : 0), w: sz, h: sz, vx: 0, vy: dir * sp, dmg: p.damage * mult, hook: 'jl_boy', jlCh: 1, jlMult: mult, jlBig: jlE1(p), jlBreak: 1 });
        b.unstoppable = true; b.isPiercing = true; b.jlJackpot = true; b.isHoming = false;
        jlTxt(p, 'ĐỘC ĐẮC x100!!!', JL_GOLD, 18);
        triggerScreenShake(10, 20);
    } else {
        // LỤC LIÊN PHÁT: loạt 6 viên xòe quạt, MỌI viên tự ngắm bám theo mục tiêu; Phát 1: viên đầu phá 1 Khiên
        const sz = ch === 1 ? 10 : (ch <= 3 ? 8 : 7), sp = C.bulletSpeed * (ch === 1 ? 1.7 : 1.5);
        for (let i = 0; i < 6; i++) {
            const a = (i - 2.5) * 0.19;
            spawnBullet(p, {
                x: cx - sz / 2 + (i - 2.5) * 3, y: sy - (dir < 0 ? sz : 0), w: sz, h: sz, vx: Math.sin(a) * sp, vy: dir * sp * Math.cos(a),
                dmg: p.damage * mult, hook: 'jl_boy', jlCh: ch, jlMult: mult, jlBig: jlE1(p), jlBreak: ch === 1 && i === 0 ? 1 : 0, jlHome: 1, jlHomeT: 0,
            });
        }
        const tot = Math.round(mult * 60) / 10;
        if (ch === 1) { jlTxt(p, 'BANG! 6 x' + (Math.round(mult * 100) / 100) + ' (x' + tot + ')', JL_GOLD, 15); triggerScreenShake(5, 10); }
        else if (ch <= 3) jlTxt(p, 'BANG! 6 x' + (Math.round(mult * 100) / 100), '#fb923c', 13);
        else jlTxt(p, 'Nah, chán! 6 x' + (Math.round(mult * 100) / 100), '#94a3b8', 12);
    }
    p.jlRecoil = 14; p.jlShotFx = 24;
    // Evo 2: ra đạn khi đang Nợ -> xóa Nợ; nổ Phát 1 -> Luck 12s x Nợ
    if (jlE2(p) && debt > 0) {
        if (ch === 1) jlStartLuck(p, Math.min(5400, 720 * debt), 'ĐỔI ĐỜI! LUCK ' + (12 * debt) + 's');
        else { p.jlDebt = 0; jlTxt(p, 'XÓA SẠCH NỢ!', JL_GREEN, 11, 14); }
    }
    jlSfx('playExplosion');
    jlEndBoy(p, 120);
}
function jlBackfire(p) {
    const e1 = jlE1(p), debt = p.jlDebt || 0;
    // Bản làm lại: phạt nặng hơn (st, choáng, hồi chiêu, +1 Nợ)
    let dmg = e1 ? 4.5 : 2.8;
    if (jlE2(p)) dmg = Math.max(dmg, 2.6 * debt);
    const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
    p.freezeTimer = Math.max(p.freezeTimer || 0, e1 ? 132 : 96);
    p.jlBackFx = 40;
    jlTxt(p, 'BÙM! NỔ NGƯỢC!', JL_RED, 15);
    explosions.push(new Explosion(cx, cy, jlFull(p) ? 110 : 40, 'rgba(239, 68, 68,', 0, p));
    triggerScreenShake(8, 14); jlSfx('playExplosion');
    // Full: địch đứng gần chịu chung 100% st nổ súng
    const e = jlEnemy(p);
    if (jlFull(p) && jlAlive(e) && Math.hypot(e.x + e.w / 2 - cx, e.y + e.h / 2 - cy) < 110 + e.w / 2) {
        const before = e.hp;
        e.takeDamage(dmg, p, { unavoidable: true });
        if (before > 0 && e.hp <= 0) jlSpawnFinisher(p, e);
    }
    p.takeDamage(dmg, p, { bypassShield: true, unavoidable: true, ignoreInvincible: true, jlSelf: true });
    p.jlDebt = (p.jlDebt || 0) + 1; p.jlLuck = 0;
    jlTxt(p, '+1 NỢ (' + p.jlDebt + ')', JL_RED, 11, 14);
    jlEndBoy(p, 480);
}
function jlEndBoy(p, cd) {
    p.jlMode = 'hander'; p.jlBoyCd = cd; p.jlBoyCdMax = cd; p.jlPulled = 0; p.jlLive = 0;
}
function jlPull(p) {
    p.jlPulled++; p.jlPullCd = jlPullGap(p); p.jlCylRot = (p.jlCylRot || 0) + 1; p.jlPullFx = 12;
    if (p.jlPulled >= p.jlLive) {
        if (p.jlPulled >= 6) jlBackfire(p); else jlBoyFire(p, p.jlPulled);
    } else {
        jlTxt(p, 'CẠCH! (' + p.jlPulled + '/6)', '#cbd5e1', 12);
        jlSfx('playHit');
    }
}
BulletHooks.register('jl_boy', {
    hit(b, o, v) {
        if (!v) return;
        const cx = v.x + v.w / 2, cy = v.y + v.h / 2;
        if (b.jlCh === 1) { explosions.push(new Explosion(cx, cy, b.jlJackpot ? 100 : (b.jlBig ? 40 : 32), 'rgba(252, 211, 77,', 0, o)); triggerScreenShake(b.jlJackpot ? 7 : 3, 8); }
        else if (b.jlCh <= 3) {
            explosions.push(new Explosion(cx, cy, 26, 'rgba(251, 146, 60,', 0, o));
            if (!jlCCImmune(v)) v.jlBoySlowT = Math.max(v.jlBoySlowT || 0, 90); // chậm 30% 1.5s
        } else spawnSparkParticles(cx, cy, '#cbd5e1', 6);
        if (v.hp <= 0) jlSpawnFinisher(o, v);
    },
    edge(b, o) { if (b.jlCh <= 3) explosions.push(new Explosion(b.x + b.w / 2, b.y + b.h / 2, b.jlCh === 1 ? 24 : 16, 'rgba(252, 211, 77,', 0, o)); },
    draw(b) { if (typeof jlDrawBoyBullet === 'function') jlDrawBoyBullet(b); },
});

// ---------- Tick chính (chạy cả khi bị choáng) ----------
function jlTick(p) {
    p.jlT = (p.jlT || 0) + 1;
    ['jlRecoil', 'jlFlipFx', 'jlPullFx', 'jlShotFx', 'jlBackFx', 'jlDrawFx', 'jlBoyCd', 'jlLoadFx', 'jlAmmoFx'].forEach(k => { if (p[k] > 0) p[k]--; });
    if (p.jlPullCd > 0) p.jlPullCd--;
    if (p.jlT === 20 && p.jlRoll) {
        const r = p.jlRoll, f = v => (v >= 0 ? '+' : '') + Math.round(v * 100) + '%';
        jlTxt(p, '🎲 HP' + f(r.h) + ' DMG' + f(r.d) + ' TỐC' + f(r.s), JL_GOLD, 10);
    }
    if (gameState.phase !== 'playing' || p.hp <= 0) return;
    jlTickEnemy(p);
    // Đạn Hưng Phấn / Nguyền Phản Phệ (tự thân)
    if (p.jlHypeT > 0) p.jlHypeT--;
    if (p.jlCurseT > 0) { p.jlCurseT--; addStatusVuln(p, 0.2); }
    // Loạt The Hand: mỗi 5 tick 1 viên (khựng / choáng thì dừng nhịp)
    if (p.jlBurst > 0 && !(p.freezeTimer > 0)) {
        if (--p.jlBurstT <= 0) { p.jlBurst--; p.jlBurstT = 5; if (p.ammo > 0) jlFireNext(p); else p.jlBurst = 0; }
    }
    // Luck / Tung Xu
    if (p.jlLuck > 0) { p.jlLuck--; if (p.jlLuck === 0) { jlTxt(p, 'HẾT LUCK', '#94a3b8', 10); p.jlFlipT = jlFlipEvery(p); } }
    else if (--p.jlFlipT <= 0) { p.jlFlipT = jlFlipEvery(p); jlFlip(p); }
    // Evo 2: Nợ đốt máu 0.01 x Nợ HP/s (không dưới 0.25 HP)
    if (jlE2(p) && p.jlDebt > 0 && p.hp > 0.25) p.hp = Math.max(0.25, p.hp - 0.01 * p.jlDebt / 60);
    // Hander nạp đạn
    if (p.jlMode !== 'boy') {
        if (p.jlReload > 0) { if (--p.jlReload <= 0) jlReloadDone(p); }
        else if (!(p.jlBurst > 0) && p.ammo < 6 && ++p.jlIdle > 90) { p.jlReload = jlReloadTicks(p); jlTxt(p, 'NẠP ĐẠN...', '#cbd5e1', 9); }
    }
}

function jlSpawnFinisher(p, v) {
    if (typeof bodyEffects === 'undefined' || bodyEffects.some(e => e instanceof JlFinisher)) return;
    bodyEffects.push(new JlFinisher(p, v));
    triggerScreenShake(12, 24);
    spawnSparkParticles(v.x + v.w / 2, v.y + v.h / 2, JL_GOLD, 30);
    jlSfx('playCoin');
}

// ---------- Entity: Kết liễu "JACKPOT 777!" ----------
class JlFinisher {
    constructor(owner, victim) {
        this.team = owner.id; this.x = victim.x + victim.w / 2; this.y = victim.y + victim.h / 2;
        this.t = 0; this.dur = 140; this.active = true; this.seed = Math.round(Math.random() * 1000) / 100;
    }
    update() { if (++this.t >= this.dur) this.active = false; }
    draw() { }
    drawOver() { if (typeof jlDrawFinisherOver === 'function') jlDrawFinisherOver(this); }
}

CharHooks.register('jack_6_lo', {
    setup() {
        // Chỉ Số Bất Định: 3 hệ số ±30%, tổng = 0
        let r1 = 0, r2 = 0, r3 = 0;
        for (let i = 0; i < 20; i++) { r1 = (Math.random() - 0.5) * 0.6; r2 = (Math.random() - 0.5) * 0.6; r3 = -(r1 + r2); if (Math.abs(r3) <= 0.3) break; }
        if (Math.abs(r3) > 0.3) { r1 = r2 = r3 = 0; }
        this.jlRoll = { h: Math.round(r1 * 100) / 100, d: Math.round(r2 * 100) / 100, s: Math.round(r3 * 100) / 100 };
        this.maxHp = Math.max(1, Math.round((this.maxHp + 4.5 * this.jlRoll.h) * 10) / 10);
        this.damage = Math.max(0.1, this.damage * (1 + this.jlRoll.d));
        this.jlSpdRoll = 1 + this.jlRoll.s;
        this.jlLuck = 0; this.jlLuckMax = 1; this.jlDebt = 0; this.jlFlipT = jlFlipEvery(this); this.jlFlipFx = 0; this.jlFlipRes = 0;
        this.jlMode = 'hander'; this.jlHold = 0; this.jlPrevS = false; this.jlUsed = false; this.jlReload = 0; this.jlIdle = 0;
        this.jlBoyCd = 0; this.jlBoyCdMax = 1; this.jlPulled = 0; this.jlLive = 0; this.jlPullCd = 0; this.jlBorrowT = 0;
        this.jlRecoil = 0; this.jlCylRot = 0; this.jlT = 0; this.jlPullFx = 0; this.jlShotFx = 0; this.jlBackFx = 0; this.jlDrawFx = 0;
        this.jlBurst = 0; this.jlBurstT = 0; this.jlHypeT = 0; this.jlCurseT = 0; this.jlLastAmmo = 0; this.jlAmmoFx = 0;
        jlReloadDone(this); this.jlLoadFx = 0;
    },
    speed(v) { return v * (this.jlSpdRoll || 1) * jlSpeedMult(this) * (this.jlHypeT > 0 ? 1.35 : 1) * (this.jlCurseT > 0 ? 0.65 : 1); },
    update(inp, eff, now) { this.lastShot = now; }, // tự quản nạp đạn (chặn hồi đạn lẻ mặc định)
    beforeDamage(amount, attacker, options) {
        if (attacker === this || (options && options.isEnvironmental)) return false;
        if (this.jlLuck > 0 && Math.random() < jlDodge(this)) {
            jlTxt(this, 'NÉ! 🍀', JL_GREEN, 12);
            return true;
        }
        return false;
    },
    shoot(inp, now) {
        const s = !!inp.s, pressed = s && !this.jlPrevS, released = !s && this.jlPrevS;
        this.jlPrevS = s;
        if (this.jlMode === 'boy') {
            // Full: vay nóng khi giữ lố sau lúc rút súng
            if (this.jlUsed) {
                if (s) {
                    if (jlFull(this) && ++this.jlBorrowT >= 18) {
                        this.jlBorrowT = 0; this.jlDebt = (this.jlDebt || 0) + 1;
                        jlTxt(this, 'VAY NÓNG +1 NỢ (' + this.jlDebt + ')', JL_RED, 11);
                    }
                } else { this.jlUsed = false; this.jlHold = 0; }
                return true;
            }
            if (pressed && this.jlPullCd <= 0) jlPull(this);
            return true;
        }
        if (s) {
            if (this.jlUsed) return true;
            this.jlHold++;
            if (this.jlHold >= JL_HOLD && this.jlBoyCd <= 0) { this.jlUsed = true; this.jlHold = 0; jlDraw(this); }
        } else {
            if (released && !this.jlUsed && this.jlHold < JL_HOLD) jlHander(this, now);
            this.jlHold = 0; this.jlUsed = false;
        }
        return true;
    },
    roundEnd() {
        this.jlMode = 'hander'; this.jlLuck = 0; this.jlDebt = 0; this.jlBurst = 0; this.jlHypeT = 0; this.jlCurseT = 0;
        const e = jlEnemy(this); if (e) { e.jlSlowT = 0; e.jlBoySlowT = 0; e.jlPoisT = 0; e.jlHealCutT = 0; e.jlBlindT = 0; }
    },
});

// ---------- Bọc update: tick luôn chạy ----------
(function () {
    const origU = Player.prototype.update;
    Player.prototype.update = function () {
        if (jlIs(this)) { try { jlTick(this); } catch (err) { console.error(err); } }
        return origU.apply(this, arguments);
    };
})();

// ---------- Bọc updateBullets: siêu đạn Độc Đắc khóa chết mục tiêu, xuyên mọi tường & khiên ----------
(function () {
    const origUB = Player.prototype.updateBullets;
    Player.prototype.updateBullets = function () {
        if (jlIs(this) && this.bullets && this.bullets.length) {
            const e = jlEnemy(this);
            for (let i = this.bullets.length - 1; i >= 0; i--) {
                const b = this.bullets[i];
                // Đạn Hoàng Kim / Phát 1 The BOY: sắp chạm xe địch -> phá 1 lớp Khiên trước khi trúng
                if (b && b.jlBreak && jlAlive(e)) {
                    const nx = b.x + (b.vx || 0), ny = b.y + (b.vy || 0), pad = 2;
                    const touch = (bx, by) => bx < e.x + e.w + pad && bx + b.w > e.x - pad && by < e.y + e.h + pad && by + b.h > e.y - pad;
                    if (touch(b.x, b.y) || touch(nx, ny) || touch((b.x + nx) / 2, (b.y + ny) / 2)) {
                        b.jlBreak = 0;
                        if ((e.shield || 0) > 0) {
                            e.shield--; jlVTxt(e, 'VỠ KHIÊN!', JL_GOLD, 12);
                            spawnSparkParticles(e.x + e.w / 2, e.y + e.h / 2, '#e0f2fe', 12);
                        }
                    }
                }
                // Lục Liên Phát (The BOY): mỗi viên tự ngắm, bẻ lái tới khi còn ~50px (né sát nút được)
                if (b && b.jlHome && jlAlive(e)) {
                    b.jlHomeT = (b.jlHomeT || 0) + 1;
                    const tx = e.x + e.w / 2, ty = e.y + e.h / 2, bx = b.x + b.w / 2, by = b.y + b.h / 2;
                    if (Math.hypot(tx - bx, ty - by) > 50 && b.jlHomeT > 4) {
                        const sp = Math.hypot(b.vx, b.vy), cur = Math.atan2(b.vy, b.vx);
                        let d = Math.atan2(ty - by, tx - bx) - cur;
                        while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2;
                        const na = cur + Math.sign(d) * Math.min(Math.abs(d), 0.06);
                        b.vx = Math.cos(na) * sp; b.vy = Math.sin(na) * sp;
                    }
                }
                if (!b || !b.jlJackpot) continue;
                if (!jlAlive(e) || gameState.phase !== 'playing') { this.bullets.splice(i, 1); continue; }
                const tx = e.x + e.w / 2, ty = e.y + e.h / 2, bx = b.x + b.w / 2, by = b.y + b.h / 2;
                const L = Math.hypot(tx - bx, ty - by), sp = Math.max(8, Math.hypot(b.vx, b.vy));
                b.vx = (tx - bx) / Math.max(1, L) * sp; b.vy = (ty - by) / Math.max(1, L) * sp;
                if (L <= sp + e.w / 2 + b.w / 2) {
                    this.bullets.splice(i, 1);
                    const before = e.hp;
                    e.takeDamage(b.dmg, this, { unavoidable: true, bypassShield: true, ignoreInvincible: true, isPiercing: true });
                    explosions.push(new Explosion(tx, ty, 110, 'rgba(252, 211, 77,', 0, this));
                    triggerScreenShake(14, 24);
                    if (before > 0 && e.hp <= 0) jlSpawnFinisher(this, e);
                }
            }
        }
        return origUB.apply(this, arguments);
    };
})();

// ---------- Bọc takeDamage: Luck giảm st / Nợ tăng st nhận ----------
(function () {
    const origTD = Player.prototype.takeDamage;
    Player.prototype.takeDamage = function (amount, attacker, options) {
        if (jlIs(this) && typeof amount === 'number' && amount > 0 && attacker !== this && !(options && options.jlSelf)) amount *= jlTakenMult(this);
        return origTD.call(this, amount, attacker, options, ...Array.prototype.slice.call(arguments, 3));
    };
})();

// Bot: rút The BOY khi Luck hoặc (Evo 2 & nhiều Nợ), rồi bóp cò liên tục
function jlBotWantBoy(p, e) {
    if (!jlIs(p) || p.jlMode === 'boy' || p.jlBoyCd > 0 || !jlAlive(e)) return false;
    if (p.jlLuck > 0) return Math.random() < 0.03;
    if (jlE2(p) && p.jlDebt >= 3) return Math.random() < 0.04;
    return Math.random() < 0.006;
}
