// ==========================================
// The Admin (the_admin) — Bảng Lập Trình Luật (Rule Engine)
// Luật = { conds:[id ĐK], results:[id KQ], paid, cp:[giá ĐK], rp:[giá KQ] } lưu trong p.adminData (thuần dữ liệu, đồng bộ loadout).
// MỘT ĐK bất kỳ nổ -> chạy ĐỒNG LOẠT mọi KQ của Luật; từ ĐK thứ 2 mỗi ĐK +15% hiệu lực KQ.
// An toàn đệ quy: tối đa 6 lần chạy Luật / tick (12 khi /execute), mỗi Luật nghỉ 10 tick, độ sâu lồng tối đa 3,
// ĐK 17 chỉ đếm Luật KHÔNG chứa ĐK 17, ĐK 21 tối đa 3 lần nảy / 2s.
// ==========================================

const TAD_GREEN = '#34f5c5', TAD_CYAN = '#22d3ee', TAD_RED = '#ff3b5c', TAD_GOLD = '#fcd34d', TAD_VIO = '#a855f7';
// tier: 0 = cơ bản, 2 = mở ở Evo 2, 3 = mở ở FULL EVO
const TAD_CONDS = [
    { id: 1, ic: '🔫', n: 'Xả Đạn', d: 'Mỗi 4 phát bắn', tier: 0 },
    { id: 2, ic: '⏱️', n: 'Chu Kỳ Thời Gian', d: 'Mỗi 4.5s giao tranh', tier: 0 },
    { id: 3, ic: '💔', n: 'Chịu Sát Thương', d: 'Mất đủ 1.0 Máu hoặc vỡ 1 Khiên', tier: 0 },
    { id: 4, ic: '↔️', n: 'Lách Ngang', d: 'Chạy ngang tích lũy 160px', tier: 0 },
    { id: 5, ic: '🔚', n: 'Viên Đạn Cuối', d: 'Bắn viên cuối băng (hồi 3s)', tier: 0 },
    { id: 6, ic: '🎯', n: 'Thiện Xạ', d: 'Mỗi 3 phát trúng địch', tier: 0 },
    { id: 7, ic: '💨', n: 'Lách Đạn Sát Sạt', d: 'Né đạn sượt qua ≤28px (hồi 2s)', tier: 0 },
    { id: 8, ic: '👁️', n: 'Bắt Bài Kỹ Năng', d: 'Địch Giữ Bắn dùng kỹ năng (hồi 3.5s)', tier: 0 },
    { id: 9, ic: '🧱', n: 'Chạm Tường Biên', d: 'Chạm mép Trái/Phải (hồi 3s)', tier: 0 },
    { id: 10, ic: '🏰', n: 'Pháo Đài Đứng Vững', d: 'Đứng yên 1.2s (hồi 3s)', tier: 0 },
    { id: 11, ic: '🚨', n: 'Báo Động Đỏ', d: 'Máu < 50% (lặp mỗi 5s)', tier: 0 },
    { id: 12, ic: '⚙️', n: 'Khởi Động Hệ Thống', d: 'Giây thứ 1 và giây thứ 10 của hiệp', tier: 0 },
    { id: 13, ic: '🏃', n: 'Địch Chạy Nhanh', d: 'Địch lướt / chạy ngang đủ 140px', tier: 2 },
    { id: 14, ic: '🪫', n: 'Địch Hết Đạn', d: 'Địch bắn cạn băng (hồi 3s)', tier: 2 },
    { id: 15, ic: '📐', n: 'Khóa Thẳng Hàng', d: 'Thẳng hàng địch (±22px) 0.9s', tier: 2 },
    { id: 16, ic: '🧹', n: 'Dọn Dẹp Vật Thể', d: 'Đạn trúng Tường/Ụ súng/Thùng/Vật triệu hồi (hồi 2s)', tier: 2 },
    { id: 17, ic: '🔗', n: 'Liên Kết Luật', d: 'Các Luật khác kích hoạt đủ 3 lần', tier: 2 },
    { id: 18, ic: '💰', n: 'Tư Bản Vận Hành', d: 'Nhặt được Tiền, hoặc mỗi 3.5s khi giữ ≥ $60', tier: 2 },
    { id: 19, ic: '⚡', n: 'Xung Nhịp 1.5s', d: 'Tự kích hoạt mỗi 1.5s', tier: 3 },
    { id: 20, ic: '📡', n: 'Cảm Biến Toàn Trận', d: 'Mỗi 2 phát bắn của bạn HOẶC của địch', tier: 3 },
    { id: 21, ic: '♾️', n: 'Đệ Quy Vô Tận', d: 'KQ gây sát thương/hồi máu: 50% chạy lại Luật (tối đa 3 lần/2s)', tier: 3 },
];
const TAD_RES = [
    { id: 1, ic: '💚', n: 'Hồi Phục Mã Nguồn', d: '+0.45 HP (dư thành Khiên)', tier: 0 },
    { id: 2, ic: '🛡️', n: 'Tường Lửa', d: 'Khiên Xanh 3s (đã có Khiên: -30% sát thương 3s)', tier: 0 },
    { id: 3, ic: '📈', n: 'Tích Lũy Sát Thương', d: '+0.15 Dame & +10% cỡ đạn tới hết hiệp (tối đa 8)', tier: 0 },
    { id: 4, ic: '🔋', n: 'Nạp Đạn & Tăng Tốc', d: '+2 đạn, +35% tốc 2s', tier: 0 },
    { id: 5, ic: '🚀', n: 'Tên Lửa Truy Kích', d: '2 Tên Lửa 0.6 Dame tới vị trí địch', tier: 0 },
    { id: 6, ic: '🌀', n: 'Sóng Xóa Đạn', d: 'Xóa đạn địch trong 110px, đẩy địch sang ngang', tier: 0 },
    { id: 7, ic: '🖨️', n: 'Máy In Tiền', d: '60%: +$8, kèm 1 đạn Vàng 0.6 Dame', tier: 0 },
    { id: 8, ic: '➕', n: 'Tăng Máu Vĩnh Viễn', d: '+0.12 Max HP cả trận (tối đa +3)', tier: 0 },
    { id: 9, ic: '🧲', n: 'Làm Chậm & Tịch Thu', d: 'Địch chậm 35% 1.5s, -1 đạn (hồi 3.5s)', tier: 0 },
    { id: 10, ic: '🔱', n: 'Đạn Ba Chạc', d: 'Phát bắn kế tiếp tách 3 viên xuyên phá', tier: 0 },
    { id: 11, ic: '🌌', n: 'Bước Nhảy', d: 'Lướt 85px + Bất Tử 0.4s', tier: 0 },
    { id: 12, ic: '🛸', n: 'Drone Admin', d: 'Drone hộ vệ 5s (tối đa 2), laser 0.35 Dame', tier: 0 },
    { id: 13, ic: '🔴', n: 'Cột Lazer Phạt', d: 'Cảnh báo 0.45s rồi Cột Lazer 1.6 Dame', tier: 2 },
    { id: 14, ic: '🔇', n: 'Khóa Kỹ Năng', d: 'Câm Lặng 1s; đạn địch trên sân -50% cỡ, -40% dame', tier: 2 },
    { id: 15, ic: '📏', n: 'Bóp Hẹp Màn Hình', d: 'Làn địch hẹp 35% trong 2.5s', tier: 2 },
    { id: 16, ic: '🦠', n: 'Đánh Cắp Thông Số', d: 'Hút 12% tốc & 0.15 Dame của địch 4s (tối đa 3)', tier: 2 },
    { id: 17, ic: '☄️', n: '/ban', d: '3 Cột Dữ Liệu (cảnh báo 0.6s) 2.0 Dame xuyên khiên + choáng 0.75s', tier: 3 },
    { id: 18, ic: '👑', n: '/godmode', d: 'Bất Tử 1.2s, xóa hiệu ứng xấu, phản đạn (hồi 4s)', tier: 3 },
    { id: 19, ic: '🎰', n: '/sudo_jackpot', d: '+$15, +0.8 HP, đầy đạn, phát kế +12% Max HP địch (<15% máu: KẾT LIỄU)', tier: 3 },
];
const TAD_BASIC_COND = 2, TAD_BASIC_RES = 5; // Luật #1 mặc định: Chu Kỳ Thời Gian -> Tên Lửa Truy Kích

function tadCond(id) { return TAD_CONDS[id - 1]; }
function tadRes(id) { return TAD_RES[id - 1]; }
function tadIs(p) { return !!p && p.weapon === 'the_admin'; }
function tadE1(p) { return p.hasUpgrade('evo_admin_1'); }
function tadE2(p) { return p.hasUpgrade('evo_admin_2'); }
function tadFull(p) { return tadE1(p) && tadE2(p) && hasFullEvo(p, 'the_admin'); }
function tadTierOk(p, tier) { return tier === 0 || (tier === 2 && tadE2(p)) || (tier === 3 && tadFull(p)); }
function tadEnemy(p) { return p.id === 1 ? p2 : p1; }
function tadIsGuest() { return typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest'; }
function tadCoins(p) { return p.id === 1 ? gameState.p1Coins : gameState.p2Coins; }
// Tiền do KQ tự in: tối đa $40 / hiệp (chống lạm phát khi ĐK nổ liên tục)
function tadPrintCoins(p, n) {
    n = Math.min(n, 40 - (p.tadMoney || 0));
    if (n <= 0) return 0;
    p.tadMoney = (p.tadMoney || 0) + n;
    tadAddCoins(p, n);
    return n;
}
function tadAddCoins(p, n) {
    if (!tadIsGuest()) { if (p.id === 1) gameState.p1Coins += n; else gameState.p2Coins += n; }
    if (typeof p.tadCoinPrev === 'number') p.tadCoinPrev += n; // tiền tự in không tính ĐK 18
}
function tadTxt(p, s, c, sz) { addFloatingText(p.x + p.w / 2, p.id === 1 ? p.y - 18 : p.y + p.h + 22, s, c, sz || 11); }
function tadSfx(n) { if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem[n]) soundSystem[n](); }

function tadNewRule(conds, results) { return { conds: conds || [], results: results || [], paid: 0, cp: (conds || []).map(() => 0), rp: (results || []).map(() => 0) }; }
function tadData(p) {
    if (!p.adminData) p.adminData = { rules: [tadNewRule([TAD_BASIC_COND], [TAD_BASIC_RES])], freePick: 1, hpBonus: 0, freeBig: 0, fullGift: 0, setups: 0 };
    return p.adminData;
}

// ---------- Giới hạn & giá (giá x2 sau mỗi lần mua; xóa -> lùi bậc tự động vì tính theo số đang có) ----------
function tadMaxRules(p) { return tadFull(p) ? Infinity : (tadE2(p) ? 5 : 3); }
function tadMaxSlots(p) { return tadFull(p) ? Infinity : (tadE2(p) ? 3 : (tadE1(p) ? 2 : 1)); }
function tadRulePrice(p) { const n = tadData(p).rules.length; return n < 1 ? 0 : 25 * Math.pow(2, n - 1); }
function tadCondPrice(r) { return 15 * Math.pow(2, r.conds.length); }
function tadResPrice(r) { return 20 * Math.pow(2, r.results.length); }

// ---------- Chạy Luật ----------
function tadPow(r) { return 1 + 0.15 * Math.max(0, r.conds.length - 1); }

function tadFire(p, condId) {
    const rules = tadData(p).rules;
    for (let i = 0; i < rules.length; i++) if (rules[i].conds.indexOf(condId) >= 0) tadRun(p, i, false);
}

function tadRun(p, i, force) {
    const rules = tadData(p).rules, r = rules[i];
    if (!r || !r.results.length || p.hp <= 0) return false;
    if ((p.tadTickN || 0) >= (p.tadTickCap || 6) || (p.tadDepth || 0) >= 3) return false;
    if (!p.tadGap) p.tadGap = [];
    if (!force && (p.tadGap[i] || 0) > 0) return false;
    p.tadTickN = (p.tadTickN || 0) + 1;
    p.tadGap[i] = 10;
    if (!p.tadFl) p.tadFl = [];
    p.tadFl[i] = 20;
    p.tadFires = (p.tadFires || 0) + 1;
    const m = tadPow(r);
    p.tadDepth = (p.tadDepth || 0) + 1;
    try { for (const id of r.results.slice()) tadApply(p, id, m, i); }
    finally { p.tadDepth--; }
    // ĐK 17: Luật khác nổ đủ 3 lần
    if (r.conds.indexOf(17) < 0) { p.tadChain = (p.tadChain || 0) + 1; if (p.tadChain >= 3) { p.tadChain = 0; tadFire(p, 17); } }
    return true;
}

// KQ của Luật ri vừa gây sát thương / hồi máu -> ĐK 21 (50%, tối đa 3 lần / 2s)
function tadResEffect(p, ri) {
    if (!tadIs(p) || typeof ri !== 'number') return;
    const r = tadData(p).rules[ri];
    if (!r || r.conds.indexOf(21) < 0 || (p.tadRecN || 0) >= 3 || Math.random() >= 0.5) return;
    p.tadRecN = (p.tadRecN || 0) + 1;
    if (!p.tadRecT) p.tadRecT = 120;
    tadTxt(p, '♾️ RECURSION', TAD_VIO, 10);
    tadRun(p, ri, true);
}

function tadHeal(p, amt, ri) {
    const room = Math.max(0, p.maxHp - p.hp), h = Math.min(room, amt);
    p.hp += h;
    p.tadOver = (p.tadOver || 0) + (amt - h);
    while (p.tadOver >= 0.9) { p.tadOver -= 0.9; if ((p.shield || 0) < 3) p.shield = (p.shield || 0) + 1; }
    tadTxt(p, '+' + amt.toFixed(2) + ' HP', '#4ade80', 10);
    tadResEffect(p, ri);
}

function tadColumnHit(p, x, half, dmg, opt, ri, stun) {
    const e = tadEnemy(p);
    if (!e || e.hp <= 0) return;
    explosions.push(new Explosion(x, e.y + e.h / 2, 26, stun ? 'rgba(168, 85, 247,' : 'rgba(255, 59, 92,', 0, null));
    if (Math.abs(e.x + e.w / 2 - x) < e.w / 2 + half) {
        e.takeDamage(dmg, p, opt);
        if (stun) e.freezeTimer = Math.max(e.freezeTimer || 0, stun);
        tadResEffect(p, ri);
    }
}

function tadMissile(p, dx, dmg, ri, kind, col) {
    const e = tadEnemy(p), cx = p.x + p.w / 2 + dx, sy = p.id === 1 ? p.y - 8 : p.y + p.h + 2;
    const v = e ? aimVelocity(cx, sy, e, 5.2, false) : { vx: 0, vy: p.id === 1 ? -5.2 : 5.2 };
    return spawnBullet(p, { x: cx - 4, y: sy, w: 8, h: 8, vx: v.vx, vy: v.vy, dmg, hook: 'tad', tadR: 1, tadRule: ri, tadK: kind, tadC: col || TAD_GREEN });
}

function tadApply(p, id, m, ri) {
    const e = tadEnemy(p), W = canvas.width, cx = p.x + p.w / 2, cy = p.y + p.h / 2, d = tadData(p);
    const ex = e ? e.x + e.w / 2 : W / 2;
    switch (id) {
        case 1: tadHeal(p, 0.45 * m, ri); break;
        case 2:
            if ((p.shield || 0) > 0) { if (!(p.tadDrT > 0)) tadTxt(p, 'FIREWALL -30%', TAD_CYAN, 10); p.tadDrT = 180; }
            else { p.shield = (p.shield || 0) + 1; p.tadTmpSh = (p.tadTmpSh || 0) + 1; p.tadShT = 180; tadTxt(p, 'FIREWALL', TAD_CYAN, 10); }
            break;
        case 3:
            if ((p.tadDmgSt || 0) < 8) { p.tadDmgSt = (p.tadDmgSt || 0) + 1; p.dmgBuff += 0.15 * m; tadTxt(p, '+DMG ×' + p.tadDmgSt, '#f472b6', 10); }
            break;
        case 4: p.ammo = Math.min(p.maxAmmo, p.ammo + 2); p.tadSpdT = 120; p.tadSpdM = 0.35 * m; break;
        case 5: tadMissile(p, -7, 0.6 * m, ri, 'msl'); tadMissile(p, 7, 0.6 * m, ri, 'msl'); tadSfx('playShoot'); break;
        case 6: {
            if (e) {
                const R = 110;
                e.bullets = e.bullets.filter(b => b.isHitscan || Math.hypot(b.x + b.w / 2 - cx, b.y + b.h / 2 - cy) > R);
                const dir = Math.sign(ex - cx) || 1;
                e.x = Math.max(0, Math.min(W - e.w, e.x + dir * 34 * m));
            }
            explosions.push(new Explosion(cx, cy, 110, 'rgba(52, 245, 197,', 0, null));
            break;
        }
        case 7:
            if (Math.random() < 0.6) { const g = tadPrintCoins(p, 8); if (g) tadTxt(p, '+$' + g, TAD_GOLD, 12); }
            tadMissile(p, 0, 0.6 * m, ri, 'gold', TAD_GOLD).vx = 0;
            break;
        case 8: {
            const add = Math.min(0.12 * m, 3 - (d.hpBonus || 0));
            if (add > 0.001) { d.hpBonus = (d.hpBonus || 0) + add; p.maxHp += add; tadHeal(p, add, ri); }
            break;
        }
        case 9:
            if ((p.tadC9 || 0) <= 0 && e) { p.tadC9 = 210; p.tadEnSlow = 90; e.ammo = Math.max(0, e.ammo - 1); addFloatingText(ex, e.y + e.h / 2, 'SLOW -1🔫', TAD_CYAN, 11); }
            break;
        case 10: p.tadTri = 1; break;
        case 11: {
            const dir = p.tadDir || 1;
            p.x = Math.max(0, Math.min(W - p.w, p.x + dir * 85));
            p.invincibleTimer = Math.max(p.invincibleTimer || 0, 24);
            spawnSparkParticles(cx, cy, TAD_CYAN, 10);
            break;
        }
        case 12: {
            if (!p.tadDrones) p.tadDrones = [];
            if (p.tadDrones.length < 2) p.tadDrones.push({ t: 300, cd: 20, m, r: ri, s: p.tadDrones.length ? -1 : 1 });
            else { p.tadDrones[0].t = 300; p.tadDrones[0].m = m; }
            break;
        }
        case 13: if (e && (p.tadC13 || 0) <= 0) p.tadC13 = 60, scheduleHitscan(p, 27, TAD_RED, 20, () => tadColumnHit(p, ex, 10, 1.6 * m, { isPiercing: true }, ri, 0), ex); break;
        case 14:
            if (e) {
                if (!(e.silenceTimer > 0)) addFloatingText(ex, e.y + e.h / 2, 'SILENCED', TAD_VIO, 11);
                e.silenceTimer = Math.max(e.silenceTimer || 0, 60);
                for (const b of e.bullets) if (!b.tadShr && !b.isHitscan) { b.tadShr = 1; b.x += b.w / 4; b.w *= 0.5; b.h *= 0.5; b.dmg *= 0.6; }
            }
            break;
        case 15: p.tadLaneT = 150; break;
        case 16:
            if (e) {
                if (!p.tadSteal) p.tadSteal = [];
                if (p.tadSteal.length < 3) { p.tadSteal.push(240); p.dmgBuff += 0.15; e.dmgBuff -= 0.15; }
                else p.tadSteal[0] = 240;
            }
            break;
        case 17:
            if (e && (p.tadC17 || 0) <= 0) {
                p.tadC17 = 180;
                const xs = [ex, ex - 78, ex + 78].map(x => Math.max(16, Math.min(W - 16, x)));
                for (const x of xs) scheduleHitscan(p, 36, TAD_VIO, 26, () => tadColumnHit(p, x, 13, 2.0 * m, { bypassShield: true, isPiercing: true }, ri, 45), x);
                tadTxt(p, '/ban', TAD_VIO, 13);
            }
            break;
        case 18:
            if ((p.tadGodCd || 0) <= 0) {
                p.tadGodCd = 240; p.tadGodT = 72; p.invincibleTimer = Math.max(p.invincibleTimer || 0, 72);
                p.slowTimer = 0; p.freezeTimer = 0; p.silenceTimer = 0; p.bleedTimer = 0; p.confusionTimer = 0; p.blindTimer = 0;
                tadTxt(p, '/godmode', TAD_GOLD, 13);
            }
            break;
        case 19:
            if ((p.tadC19 || 0) > 0) break;
            p.tadC19 = 240;
            tadPrintCoins(p, 15); tadHeal(p, 0.8 * m, ri); p.ammo = p.maxAmmo; p.tadJack = 1;
            tadTxt(p, '/sudo_jackpot', TAD_GOLD, 12);
            break;
    }
}

// ---------- ĐK theo tick (gọi trong update của host) ----------
function tadTickConds(p) {
    const e = tadEnemy(p), W = canvas.width, s = tadE2(p) ? 0.75 : 1, K = p.tadK;
    const cx = p.x + p.w / 2, cd = (k) => (K['cd' + k] || 0) <= 0, setCd = (k, t) => { K['cd' + k] = Math.round(t * s); };
    for (const k in K) if (k.startsWith('cd') && K[k] > 0) K[k]--;
    p.tadT++;
    // 2 — chu kỳ
    if (++K.t2 >= Math.round(270 * s)) { K.t2 = 0; tadFire(p, 2); }
    // 4 — lách ngang / 10 — đứng yên / 9 — chạm tường
    const dx = Math.abs(p.x - (K.px === undefined ? p.x : K.px));
    K.px = p.x;
    if (dx > 0.01 && dx < 120) { K.mv += dx; K.still = 0; if (K.mv >= 160 * s) { K.mv = 0; tadFire(p, 4); } }
    else if (++K.still >= Math.round(72 * s) && cd(10)) { K.still = 0; setCd(10, 180); tadFire(p, 10); }
    const wall = p.x <= 1 || p.x >= W - p.w - 1;
    if (wall && !K.wall && cd(9)) { setCd(9, 180); tadFire(p, 9); }
    K.wall = wall ? 1 : 0;
    // 11 — máu < 50%
    if (p.hp < p.maxHp * 0.5 && cd(11)) { setCd(11, 300); tadFire(p, 11); }
    // 12 — giây 1 & giây 10
    if (p.tadT === 60 || p.tadT === 600) tadFire(p, 12);
    // 19 — xung nhịp 1.5s
    if (++K.t19 >= 90) { K.t19 = 0; tadFire(p, 19); }
    // 18 — tiền
    const coins = tadCoins(p);
    if (typeof p.tadCoinPrev !== 'number') p.tadCoinPrev = coins;
    if (coins > p.tadCoinPrev + 0.01 && cd(18)) { setCd(18, 30); tadFire(p, 18); }
    p.tadCoinPrev = coins;
    if (coins >= 60) { if (++K.t18 >= 210) { K.t18 = 0; tadFire(p, 18); } } else K.t18 = 0;
    if (!e || e.hp <= 0) return;
    const ecx = e.x + e.w / 2;
    // 7 — đạn sượt qua / 20 — địch bắn
    let newShot = false;
    for (const b of e.bullets) {
        if (!b.tadSeen) { b.tadSeen = 1; newShot = true; }
        if (b.tadNm) continue;
        const by = b.y + b.h / 2;
        if (by >= p.y && by <= p.y + p.h) {
            const gap = Math.max(p.x - (b.x + b.w), b.x - (p.x + p.w));
            if (gap > 0 && gap <= 28) { b.tadNm = 1; if (cd(7)) { setCd(7, 120); tadFire(p, 7); } }
        }
    }
    if (newShot && ++K.es % 2 === 0) tadFire(p, 20);
    // 8 — địch giữ bắn (kỹ năng)
    const ei = typeof inputs !== 'undefined' ? (e.id === 1 ? inputs.p1 : inputs.p2) : null;
    if (ei && ei.s) { if (++K.eh === 24 && cd(8)) { setCd(8, 210); tadFire(p, 8); } } else K.eh = 0;
    // 13 — địch chạy ngang
    const edx = Math.abs(e.x - (K.ex === undefined ? e.x : K.ex));
    K.ex = e.x;
    if (edx > 0.01 && edx < 200) { K.emv += edx; if (K.emv >= 140) { K.emv = 0; tadFire(p, 13); } }
    // 14 — địch hết đạn
    if (K.ea > 0 && e.ammo <= 0 && cd(14)) { K['cd14'] = 180; tadFire(p, 14); }
    K.ea = e.ammo;
    // 15 — thẳng hàng 0.9s
    if (Math.abs(ecx - cx) <= 22) { if (++K.al >= 54) { K.al = 0; tadFire(p, 15); } } else K.al = 0;
}

// ---------- ĐK theo sự kiện ----------
function tadOnShot(p) {
    const K = p.tadK, s = tadE2(p);
    if (++K.sh >= (s ? 3 : 4)) { K.sh = 0; tadFire(p, 1); }
    if (++K.ms % 2 === 0) tadFire(p, 20);
    if (p.ammo <= 0 && (K.cd5 || 0) <= 0) { K.cd5 = s ? 135 : 180; tadFire(p, 5); }
}
function tadOnHurt(p, lost) {
    const K = p.tadK, thr = tadE2(p) ? 0.75 : 1;
    if (!K) return;
    K.dmg = (K.dmg || 0) + lost;
    if (K.dmg >= thr) { K.dmg = Math.min(K.dmg - thr, thr); tadFire(p, 3); }
}
function tadOnHit(p) {
    const K = p.tadK;
    if (!K) return;
    if (++K.hit >= (tadE2(p) ? 2 : 3)) { K.hit = 0; tadFire(p, 6); }
}
function tadOnObstacle(p) {
    const K = p.tadK;
    if (!K || (K.cd16 || 0) > 0) return;
    K.cd16 = 120;
    tadFire(p, 16);
}
// /execute: chạy toàn bộ Luật 1 lần
function tadExecuteAll(p) {
    const rules = tadData(p).rules;
    p.tadTickCap = 12;
    for (let i = 0; i < rules.length; i++) tadRun(p, i, true);
    p.tadTickCap = 6;
}
