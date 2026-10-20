// ==========================================
// Gemini (gemini) — Song Sinh AI
// ------------------------------------------
// - 2 xe trên làn của bạn: xe bạn điều khiển (chính là object Player) + Bản Sao AI (GeminiTwin trong bodyEffects).
//   Bản Sao có chỉ số = 100% bản thể (HP/dame/đạn/tốc, kể cả module chân), tự né đạn, phá thùng / xe tiền, bắn địch
//   (dùng lại bộ não SmartBot: collectThreats / chooseGoal / planMove).
// - Gục: về 0 HP -> đứng im, vòng cứu trợ + thanh tiến độ. Đồng đội đứng trong vòng 2s -> dậy 50% MaxHP.
//   Rời vòng > 1s -> thanh tụt dần. Mỗi lần được cứu trong hiệp: thời gian cứu x2 (2s -> 4s -> 8s...).
//   Hiệp chỉ thua khi CẢ HAI cùng gục (bọc triggerFatalCinematic).
// - Giữ Bắn 0.4s: Chuyển Giao Ý Thức (hoán đổi trạng thái 2 xe: vị trí, máu, đạn, trạng thái gục), hồi 3s.
//   Nhấp (nhả trước 0.4s) = bắn thường.
// - Evo1 Liên Kết Thần Kinh: AI giỏi hơn (giữ giãn cách, ép góc, ưu tiên cứu), hồi chuyển giao 1.2s, thanh cứu
//   không tụt, vòng cứu rộng +50%, lần cứu đầu 1s và không tính nhân đôi.
// - Evo2 Đệ Quy Vô Tận: tốc chạy / tốc bắn tăng dần theo thời gian giao tranh; mỗi hiệp đã qua cộng dồn
//   +0.25 MaxHP, +6% dame, đạn to hơn (tối đa 8 tầng). Sau chuyển giao: 1s cả 2 xe +50% tốc, x1.8 tốc bắn, x1.3 dame.
// - Full Evo: AI tối thượng (cân đối cứu / kết liễu), lần gục đầu tiên của mỗi xe tự tái khởi động (1.5s),
//   các lần sau thanh cứu tự tăng tới 99% (chạm là dậy); 0.5s sau chuyển giao đạn của xe đang điều khiển tự khoá mục tiêu.
// - Bản Sao né như người: thanh MỆT tăng khi né liên tục (chạy chậm, phản xạ chậm, hay bỏ sót), hồi dần khi nghỉ;
//   với đòn tia / hitscan (cột cảnh báo, Lôi Độn) phản xạ chậm hơn hẳn và đôi khi không né.
// - Đòn riêng của body khác trúng được Bản Sao: gmTwinAlso (gọi tại chỗ xét trúng), gmHitscanFire (scheduleHitscan).
// Mọi state là dữ liệu thuần trên player / GeminiTwin (đồng bộ online); bộ não AI chỉ chạy trên host.
// ==========================================

const GM_A = '#22d3ee', GM_B = '#e879f9', GM_GOLD = '#fde68a';
const GM_HOLD = 24;              // 0.4s
const GM_SW_CD = 180, GM_SW_CD_E1 = 72;
const GM_RES_BASE = 120;         // 2s
const GM_RES_R = 34;             // nửa bề rộng vòng cứu (px)
const GM_REBOOT = 90;            // Full Evo: tự khởi động lại 1.5s
const GM_FIRE_CD = 30;           // 0.5s giữa 2 phát (như đạn thường)

function gmE1(p) { return !!(p && p.hasUpgrade && p.hasUpgrade('evo_gem_1')); }
function gmE2(p) { return !!(p && p.hasUpgrade && p.hasUpgrade('evo_gem_2')); }
function gmFull(p) { return gmE1(p) && gmE2(p); }
function gmEnemy(p) { return p === p1 ? p2 : p1; }
function gmOwnerOf(t) { return t.ownerId === 1 ? p1 : p2; }
function gmTwinOf(p) {
    if (!p || p.weapon !== 'gemini' || typeof bodyEffects === 'undefined') return null;
    for (const e of bodyEffects) if (e instanceof GeminiTwin && e.active && e.ownerId === p.id) return e;
    return null;
}
function gmStanding(b) { return !!b && !b.gmDown && b.hp > 0; }
function gmRebooting(b) { return !!b && b.gmDown && b.gmReboot > 0; }
// Phe Gemini còn "sống" (ít nhất 1 xe đứng / đang tự khởi động)
function gmSideAlive(p) {
    const t = gmTwinOf(p);
    return gmStanding(p) || gmRebooting(p) || (!!t && (gmStanding(t) || gmRebooting(t)));
}
function gmDir(p) { return p.id === 1 ? -1 : 1; }
function gmResR(p) { return GM_RES_R * (gmE1(p) ? 1.5 : 1); }
function gmResNeed(p) {
    const n = p.gmRescues || 0;
    if (gmE1(p)) return n === 0 ? 60 : GM_RES_BASE * Math.pow(2, n - 1);
    return GM_RES_BASE * Math.pow(2, n);
}
function gmSwCdMax(p) { return gmE1(p) ? GM_SW_CD_E1 : GM_SW_CD; }

// ---- Đệ Quy (Evo 2) ----
function gmRamp(p) {
    if (!gmE2(p)) return 0;
    return Math.min(0.4, (p.gmRamp || 0) / 60 * 0.012) + (p.gmStack || 0) * 0.02;
}
function gmSpeedMult(p) { return (1 + gmRamp(p)) * (p.gmBurst > 0 ? 1.5 : 1); }
function gmRateMult(p) { return (1 + gmRamp(p)) * (p.gmBurst > 0 ? 1.8 : 1); }
function gmDmgMult(p) { return p.gmBurst > 0 ? 1.3 : 1; }

// ---- Bắn (dùng chung cho bản thể & Bản Sao) ----
function gmFire(p, cx, tag) {
    const st = Math.min(8, gmE2(p) ? (p.gmStack || 0) : 0);
    const sz = 5 + st * 0.5;
    let spd = C.bulletSpeed * 1.1;
    if (typeof gameState !== 'undefined' && gameState.currentMap === 'overdrive') spd *= 1.5;
    const y = p.id === 1 ? p.y - 8 : p.y + p.h + 2;
    const b = spawnBullet(p, {
        x: cx - sz / 2, y, w: sz, h: sz, vx: 0, vy: gmDir(p) * spd,
        dmg: (p.damage + (p.dmgBuff || 0)) * gmDmgMult(p), hook: 'gemini', gmSrc: tag, gmHome: p.gmAim > 0 && tag === p.gmTag,
    });
    if (p.gmAim > 0 && tag === p.gmTag) { const e = gmEnemy(p); if (e && e.hp > 0) { const v = aimVelocity(cx, y, e, spd, true); b.vx = v.vx; b.vy = v.vy; } }
    if (soundSystem && !soundSystem.muted && soundSystem.playShoot) soundSystem.playShoot();
    return b;
}
// Full Evo: đạn của xe đang điều khiển bắn trong cửa sổ khoá mục tiêu tự lượn theo địch
function gmSteer(p) {
    const e = gmEnemy(p);
    if (!e || e.hp <= 0) return;
    const tx = e.x + e.w / 2, ty = e.y + e.h / 2;
    for (const b of p.bullets) {
        if (!b.gmHome) continue;
        const bx = b.x + b.w / 2, by = b.y + b.h / 2;
        if ((ty - by) * gmDir(p) < 0) { b.gmHome = false; continue; } // đã vượt qua làn địch
        const want = Math.atan2(ty - by, tx - bx);
        let cur = Math.atan2(b.vy, b.vx), d = want - cur;
        while (d <= -Math.PI) d += Math.PI * 2;
        while (d > Math.PI) d -= Math.PI * 2;
        cur += Math.sign(d) * Math.min(Math.abs(d), 0.25);
        const sp = Math.hypot(b.vx, b.vy);
        b.vx = Math.cos(cur) * sp; b.vy = Math.sin(cur) * sp;
    }
}

// ---- Gục / cứu ----
function gmDownBody(body, p) {
    body.gmDown = true;
    body.hp = 0;
    body.gmRes = 0; body.gmResOut = 0;
    body.gmReboot = 0;
    if (gmFull(p) && !body.gmRebootUsed) { body.gmReboot = GM_REBOOT; body.gmRebootUsed = true; }
    body.freezeTimer = 0; body.slowTimer = 0;
    if (body === p) { p.bleedTimer = 0; p.burnTimer = 0; p.burnStacks = 0; p.acidBurnTimer = 0; p.kbX = 0; }
    const cx = body.x + body.w / 2, cy = body.y + body.h / 2;
    addFloatingText(cx, cy + gmDir(p) * 22, body.gmReboot > 0 ? '⟳ TÁI KHỞI ĐỘNG' : '✖ GỤC!', body.gmReboot > 0 ? GM_GOLD : '#ff5577', 14);
    explosions.push(new Explosion(cx, cy, 44, body.gmTag === 'B' ? 'rgba(232,121,249,' : 'rgba(34,211,238,', 0, p));
    spawnSparkParticles(cx, cy, '#ff5577', 12);
    triggerScreenShake(6, 10);
}
function gmReviveBody(body, p, viaReboot) {
    body.gmDown = false;
    body.hp = Math.max(0.5, p.maxHp * 0.5);
    body.gmRes = 0; body.gmResOut = 0; body.gmReboot = 0;
    if (body === p) p.invincibleTimer = Math.max(p.invincibleTimer || 0, 60); else body.inv = 60;
    if (!viaReboot) p.gmRescues = (p.gmRescues || 0) + 1;
    const cx = body.x + body.w / 2, cy = body.y + body.h / 2;
    addFloatingText(cx, cy + gmDir(p) * 24, viaReboot ? '⟳ KHỞI ĐỘNG LẠI!' : '✚ ĐÃ CỨU!', GM_GOLD, 15);
    explosions.push(new Explosion(cx, cy, 55, 'rgba(253,230,138,', 0, p));
    spawnSparkParticles(cx, cy, GM_GOLD, 14);
    if (soundSystem && !soundSystem.muted && soundSystem.playRevive) soundSystem.playRevive();
}
// Tiến độ cứu của 1 xe đang gục (body) với người cứu (rescuer)
function gmRescueTick(body, rescuer, p) {
    if (!body.gmDown) return;
    if (body.gmReboot > 0) {
        if (--body.gmReboot <= 0) gmReviveBody(body, p, true);
        else body.gmRes = 1 - body.gmReboot / GM_REBOOT;
        return;
    }
    const need = gmResNeed(p);
    const inside = gmStanding(rescuer) && Math.abs((rescuer.x + rescuer.w / 2) - (body.x + body.w / 2)) < gmResR(p);
    if (gmFull(p)) {
        body.gmRes = Math.min(0.99, (body.gmRes || 0) + 1 / need);
        if (inside) gmReviveBody(body, p, false);
        return;
    }
    if (inside) {
        body.gmResOut = 0;
        body.gmRes = (body.gmRes || 0) + 1 / need;
        if (body.gmRes >= 1) gmReviveBody(body, p, false);
    } else {
        body.gmResOut = (body.gmResOut || 0) + 1;
        if (body.gmResOut > 60 && !gmE1(p)) body.gmRes = Math.max(0, (body.gmRes || 0) - 1 / need);
    }
}

// ---- Chuyển Giao Ý Thức ----
const GM_SWAP_KEYS = ['x', 'hp', 'ammo', 'gmDown', 'gmRes', 'gmResOut', 'gmReboot', 'gmRebootUsed', 'gmTag', 'freezeTimer', 'slowTimer'];
function gmSwap(p) {
    const t = gmTwinOf(p);
    if (!t) return false;
    for (const k of GM_SWAP_KEYS) { const v = p[k]; p[k] = t[k]; t[k] = v; }
    const inv = p.invincibleTimer || 0; p.invincibleTimer = t.inv || 0; t.inv = inv;
    p._lastX = p.x; t._lastX = t.x;
    p.gmSwCd = gmSwCdMax(p);
    p.gmSwapFx = 30;
    if (gmE2(p)) p.gmBurst = 60;
    if (gmFull(p)) p.gmAim = 30;
    const y = p.y + p.h / 2;
    addFloatingText(p.x + p.w / 2, y + gmDir(p) * 26, '⇄ ' + (p.gmTag === 'B' ? 'BETA' : 'ALPHA'), p.gmTag === 'B' ? GM_B : GM_A, 13);
    spawnSparkParticles(p.x + p.w / 2, y, p.gmTag === 'B' ? GM_B : GM_A, 10);
    spawnSparkParticles(t.x + t.w / 2, y, t.gmTag === 'B' ? GM_B : GM_A, 10);
    if (soundSystem && !soundSystem.muted && soundSystem.playPowerup) soundSystem.playPowerup();
    return true;
}

// ---- Va chạm đòn của địch lên Bản Sao (gọi từ lõi) ----
// Đạn (js/game/combat.js checkHits): trả về true nếu đạn trúng Bản Sao
function gmBulletHitTwin(attacker, victim, b, dmg) {
    const t = gmTwinOf(victim);
    if (!gmStanding(t)) return false;
    if (b.hitIds && b.hitIds.includes(t)) return false;
    if (!rectIntersect(b.x, b.y, b.w, b.h, t.x, t.y, t.w, t.h)) return false;
    if (!b.hitIds) b.hitIds = [];
    b.hitIds.push(t);
    t.takeDamage(dmg, attacker, { isPiercing: b.isPiercing });
    explosions.push(new Explosion(b.x + b.w / 2, b.y + b.h / 2, 22, 'rgba(255,0,85,', 0, attacker));
    return true;
}
// Vụ nổ (Explosion.checkCollision): danh sách Bản Sao không thuộc phe chủ vụ nổ
function gmExtraTargets(owner) {
    const out = [];
    [p1, p2].forEach(p => {
        if (!p || p.weapon !== 'gemini' || (owner && (owner === p || owner.owner === p))) return;
        const t = gmTwinOf(p);
        if (gmStanding(t)) out.push(t);
    });
    return out;
}
// Đòn vùng tròn (SkyStrike...)
function gmZoneHitTwin(owner, x, y, r, dmg) {
    const victim = owner === p1 ? p2 : p1;
    if (!victim || victim.weapon !== 'gemini') return;
    const t = gmTwinOf(victim);
    if (gmStanding(t) && Math.hypot(t.x + t.w / 2 - x, t.y + t.h / 2 - y) < r + t.w / 2) t.takeDamage(dmg, owner);
}
// Đòn chữ nhật (tia Beam)
function gmRectHitTwin(victim, x, y, w, h, dmg, attacker) {
    const t = gmTwinOf(victim);
    if (gmStanding(t) && rectIntersect(x, y, w, h, t.x, t.y, t.w, t.h)) t.takeDamage(dmg, attacker);
}

// Đòn riêng của body khác (tia, vùng nổ, triệu hồi, lưỡi kiếm...): sau khi xét trúng bản thể, gọi hàm này để
// xét trúng & gây dame lên Bản Sao của victim. hit(t) dùng lại đúng hình học của đòn với t thay cho enemy.
function gmTwinAlso(victim, hit, dmg, attacker, opts) {
    if (!victim || victim.weapon !== 'gemini') return 0;
    const t = gmTwinOf(victim);
    if (!gmStanding(t) || !hit(t)) return 0;
    return t.takeDamage(dmg, attacker, opts || {}) || 0;
}
// Đòn hitscan có cột cảnh báo (scheduleHitscan): hàm fire() của từng body chỉ nhắm p1/p2.
// Chạy fire() đúng 1 lần: Bản Sao trong cột mà bản thể không -> tạm đặt bản thể vào chỗ Bản Sao và chuyển mọi dame
// (kèm choáng / chậm) sang Bản Sao; cả 2 trong cột -> Bản Sao nhận lại đúng lượng dame bản thể vừa nhận.
function gmHitscanFire(w, fire) {
    const o = w.owner;
    const oid = o ? (o.id || (o.owner && o.owner.id)) : 0;
    const v = oid === 1 ? p2 : (oid === 2 ? p1 : null);
    const t = v && v.weapon === 'gemini' ? gmTwinOf(v) : null;
    const inCol = (b) => Math.abs(b.x + b.w / 2 - w.x) < (w.width || 16) / 2 + b.w / 2;
    if (!gmStanding(t) || !inCol(t)) return fire();
    const nb = typeof beams !== 'undefined' ? beams.length : 0;
    const ownTD = Object.prototype.hasOwnProperty.call(v, 'takeDamage') ? v.takeDamage : null;
    const restoreTD = () => { if (ownTD) v.takeDamage = ownTD; else delete v.takeDamage; };
    const markBeams = () => { if (typeof beams !== 'undefined') for (let i = nb; i < beams.length; i++) beams[i].gmHit = true; };
    if (v.hp > 0 && inCol(v)) {
        let got = 0;
        const orig = v.takeDamage;
        v.takeDamage = function (a, at, op) { const d = orig.call(this, a, at, op); got += d || 0; return d; };
        try { fire(); } finally { restoreTD(); markBeams(); }
        if (got > 0) t.takeDamage(got, o && o.owner ? o.owner : o);
        return;
    }
    const keep = {};
    ['x', 'hp', 'freezeTimer', 'slowTimer', 'kbX', 'bleedTimer', 'burnTimer', 'silenceTimer'].forEach(k => keep[k] = v[k]);
    v.x = t.x;
    if (!(v.hp > 0)) v.hp = 0.01; // bản thể đang gục: vẫn để fire() xét va chạm
    v.takeDamage = (a, at, op) => t.takeDamage(a, at, op);
    try { fire(); } finally {
        restoreTD(); markBeams();
        if ((v.freezeTimer || 0) > (keep.freezeTimer || 0)) t.freezeTimer = Math.max(t.freezeTimer || 0, v.freezeTimer);
        if ((v.slowTimer || 0) > (keep.slowTimer || 0)) t.slowTimer = Math.max(t.slowTimer || 0, v.slowTimer);
        for (const k in keep) v[k] = keep[k];
    }
}

// ---- Thua hiệp chỉ khi cả 2 cùng gục ----
const gmBaseFatal = triggerFatalCinematic;
// eslint-disable-next-line no-global-assign
triggerFatalCinematic = function (winnerId, victim) {
    if (fatalCinematic.active || gameState.phase !== 'playing') return gmBaseFatal(winnerId, victim);
    const holds = (p) => {
        if (!p || p.weapon !== 'gemini' || !gmTwinOf(p)) return false;
        if (!p.gmDown) gmDownBody(p, p);
        return gmSideAlive(p);
    };
    if (victim && victim.weapon === 'gemini' && holds(victim)) {
        const other = gmEnemy(victim);
        if (other && other.hp <= 0 && !(other.weapon === 'gemini' && holds(other))) return gmBaseFatal(victim.id, other);
        return;
    }
    if (winnerId === 0 && victim) {
        const other = gmEnemy(victim);
        if (other && other.weapon === 'gemini' && other.hp <= 0 && holds(other)) return gmBaseFatal(other.id, victim);
    }
    return gmBaseFatal(winnerId, victim);
};

// ==========================================
// Bộ não AI (chỉ host): SmartBot dùng lại cho Bản Sao
// ==========================================
const GM_BRAIN = {};
function gmBrain(p) {
    const lvl = gmFull(p) ? 4 : (gmE1(p) ? 3 : 1);
    let b = GM_BRAIN[p.id];
    if (!b) { b = GM_BRAIN[p.id] = new SmartBot(lvl); }
    if (b.levelIdx !== lvl) b.setLevel(lvl);
    return b;
}

// Bản Sao "giống người": Mệt (t.gmFat 0..100) tăng khi né liên tục, hồi dần khi được nghỉ.
// Mệt -> chạy chậm hơn, phản xạ chậm hơn, hay bỏ sót đạn. Đòn tia / hitscan: phản xạ chậm hơn hẳn và đôi khi không né.
const GM_FAT_GAIN = 1.1, GM_FAT_REC = 0.35, GM_FAT_GRACE = 30;
function gmFatK(t) { return Math.max(0, Math.min(1, (t.gmFat || 0) / 100)); }
function gmTwinTune(brain, t, p) {
    const f = gmFatK(t), B = BOT_LEVELS[brain.levelIdx];
    brain.L = Object.assign({}, B, {
        react: B.react + Math.round(16 * f),
        dodge: B.dodge * (1 - 0.45 * f),
        think: B.think + Math.round(4 * f),
        aimErr: B.aimErr + 10 * f,
    });
    // Tia / hitscan (cột cảnh báo): thấy muộn hơn + tỉ lệ bỏ sót
    const hsDelay = (gmFull(p) ? 13 : gmE1(p) ? 15 : 18) + Math.round(16 * f);
    const hsMiss = (gmFull(p) ? 0.28 : 0.35) + 0.35 * f;
    for (const ef of bodyEffects) {
        if (!ef.active || brain.seen.has(ef)) continue;
        if ((typeof HitscanWarning !== 'undefined' && ef instanceof HitscanWarning) || (typeof HitscanTelegraph !== 'undefined' && ef instanceof HitscanTelegraph)) {
            brain.seen.set(ef, brain.t + hsDelay);
            brain.noticed.set(ef, Math.random() > hsMiss);
        }
    }
}

function gmTwinAI(t, p) {
    const e = gmEnemy(p);
    const brain = gmBrain(p);
    brain.t++;
    gmTwinTune(brain, t, p);
    const cx = t.x + t.w / 2;
    const threats = (e ? brain.collectThreats(t, e) : []);
    // Lôi Độn (cột cảnh báo lao của Sấm Chớp) cũng là đòn dạng tia: phản xạ chậm
    if (e && e.thunderRaycastWarningTimer > 0 && !t.gmRayMiss) {
        if (t.gmRaySeen === undefined || t.gmRaySeen < 0) { t.gmRaySeen = 0; t.gmRayMiss = Math.random() < 0.35 + 0.35 * gmFatK(t); }
        t.gmRaySeen++;
    } else if (!(e && e.thunderRaycastWarningTimer > 0)) { t.gmRaySeen = -1; t.gmRayMiss = false; }
    if (e && e.thunderRaycastWarningTimer > 0 && (t.gmRayMiss || t.gmRaySeen < 16 + 16 * gmFatK(t))) {
        for (let i = threats.length - 1; i >= 0; i--) if (threats[i].x === e.thunderRaycastX && threats[i].w === 3) threats.splice(i, 1);
    }
    let goal = e ? brain.chooseGoal(t, e) : { x: canvas.width / 2, kind: 'idle', tol: 4 };
    // Giữ giãn cách với bản thể (tránh dính chung 1 vụ nổ lan) — Evo 1+
    if (gmE1(p) && gmStanding(p)) threats.push({ t: 25, x: p.x + p.w / 2, half: 44, w: 0.5 });
    // Cứu bản thể đang gục
    let rescuing = false;
    if (p.gmDown && !(p.gmReboot > 0)) {
        let want = true;
        if (gmFull(p) && e && e.hp > 0 && e.hp <= (p.damage + (p.dmgBuff || 0)) * 2.2 && t.ammo > 0) want = false; // kết liễu trước
        else if (!gmE1(p) && t.ammo > 0 && brain.t % 240 < 70) want = false;          // AI cơ bản: còn mải bắn
        if (want) { goal = { x: p.x + p.w / 2, kind: 'rescue', tol: gmResR(p) * 0.5 }; rescuing = true; }
    }
    const urgent = threats.some(th => th.t < 25);
    if (brain.moveX === null || brain.t % brain.L.think === 0 || urgent) brain.moveX = brain.planMove(t, threats, goal.x);
    let mx = brain.moveX;
    // Evo 1: đã vào vòng cứu thì bám vòng, chỉ rời khi đạn sắp trúng
    if (rescuing && gmE1(p)) {
        const pcx = p.x + p.w / 2, R = gmResR(p) - 6;
        const hot = threats.some(th => th.t < 12 && Math.abs(th.x - cx) < th.half);
        if (!hot) mx = Math.max(pcx - R, Math.min(pcx + R, mx));
    }
    const dx = mx - cx;
    let spd = p.speed * gmSpeedMult(p) * (t.slowTimer > 0 ? 0.5 : 1) * (p.statusSpeedMult === undefined ? 1 : p.statusSpeedMult);
    spd *= 1 - 0.4 * gmFatK(t); // mệt -> chạy chậm
    // Đang né: có mối nguy gần & đi lệch khỏi mục tiêu -> tích Mệt; được nghỉ -> hồi dần
    const dodging = Math.abs(dx) > 2.5 && Math.abs(mx - goal.x) > 10 && threats.some(th => th.t < 40 && Math.abs(th.x - cx) < th.half + 10);
    if (dodging) { t.gmFat = Math.min(100, (t.gmFat || 0) + GM_FAT_GAIN); t.gmFatRest = 0; }
    else if (++t.gmFatRest > GM_FAT_GRACE) t.gmFat = Math.max(0, (t.gmFat || 0) - GM_FAT_REC);
    const prevX = t.x;
    if (Math.abs(dx) > 2.5) t.x += Math.max(-spd, Math.min(spd, dx));
    t.x = Math.max(0, Math.min(canvas.width - t.w, t.x));
    if (bodyEffects.length && typeof resolveStoneBlocking === 'function') { try { resolveStoneBlocking(t, prevX); } catch (er) { /* bỏ qua */ } }
    // Bắn
    if (!e || e.hp <= 0) return;
    const onGoal = Math.abs(goal.x - cx) <= Math.max(4, goal.tol) && goal.kind !== 'rescue';
    const onEnemy = brain.attack && Math.abs(brain.attack.x - cx) <= brain.attack.tol;
    if ((onGoal || onEnemy) && t.ammo > 0 && t.gmCd <= 0 && !brain.lineBlockedByBoom(t, e)) {
        gmFire(p, cx, t.gmTag);
        t.ammo--; t.gmCd = GM_FIRE_CD / gmRateMult(p); t.gmSince = 0; t.gmKick = 6;
        brain.nextShot(e);
    }
}

// ==========================================
// Entity: Bản Sao AI
// ==========================================
class GeminiTwin {
    constructor(p) {
        this.ownerId = p.id; this.id = p.id; this.weapon = 'gemini';
        this.w = p.w; this.h = p.h; this.y = p.y;
        this.x = Math.max(0, Math.min(canvas.width - p.w, p.x + 72));
        this.maxHp = p.maxHp; this.hp = p.maxHp;
        this.maxAmmo = p.maxAmmo; this.ammo = p.maxAmmo;
        this.shield = 0;
        this.gmTag = p.gmTag === 'B' ? 'A' : 'B';
        this.gmDown = false; this.gmRes = 0; this.gmResOut = 0; this.gmReboot = 0; this.gmRebootUsed = false;
        this.inv = 0; this.freezeTimer = 0; this.slowTimer = 0;
        this.gmCd = 20; this.gmSince = 999; this.gmRel = 0; this.gmKick = 0; this.gmHitFx = 0;
        this.gmFat = 0; this.gmFatRest = 0; this.gmRaySeen = -1; this.gmRayMiss = false;
        this.active = true;
    }
    hasUpgrade(u) { const o = gmOwnerOf(this); return !!(o && o.hasUpgrade(u)); }
    takeDamage(amount, attacker = null, options = {}) {
        const p = gmOwnerOf(this);
        if (gameState.phase !== 'playing' || !gmStanding(this) || !p) return 0;
        if (attacker && (attacker === p || attacker.owner === p)) return 0;
        if (this.inv > 0 && !options.unavoidable) { addFloatingText(this.x + this.w / 2, this.y - 10, 'IMMUNE', '#3498db', 12); return 0; }
        const d = Math.max(0.05, amount * (1 + (p.statusVuln || 0)));
        this.hp -= d;
        this.gmHitFx = 8;
        const shown = d >= 1 ? (Math.round(d * 10) / 10).toString() : d.toFixed(1);
        addFloatingText(this.x + this.w / 2, this.y - 10, '-' + shown, '#ff0055', 14);
        spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, '#ff0055', 6);
        if (soundSystem && !soundSystem.muted) soundSystem.playHit();
        if (this.hp <= 0) {
            gmDownBody(this, p);
            if (!gmSideAlive(p)) gmBaseFatal(p.id === 1 ? 2 : 1, p);
        }
        return d;
    }
    update() {
        const p = gmOwnerOf(this);
        if (!p || p.weapon !== 'gemini') { this.active = false; return; }
        if (gameState.phase !== 'playing' || (typeof fatalCinematic !== 'undefined' && fatalCinematic.active)) return;
        // đồng bộ chỉ số với bản thể (module chân, Đệ Quy...)
        this.maxHp = p.maxHp; this.maxAmmo = p.maxAmmo; this.w = p.w; this.h = p.h; this.y = p.y;
        if (this.hp > this.maxHp) this.hp = this.maxHp;
        if (this.inv > 0) this.inv--;
        if (this.slowTimer > 0) this.slowTimer--;
        if (this.gmCd > 0) this.gmCd--;
        if (this.gmKick > 0) this.gmKick--;
        if (this.gmHitFx > 0) this.gmHitFx--;
        this.gmSince++;
        // nạp đạn như xe thường: nghỉ 1.5s -> +1 viên mỗi 0.5s
        if (this.ammo < this.maxAmmo && this.gmSince > (p.reloadTime || 1500) / 16.67 / gmRateMult(p)) {
            if (++this.gmRel >= 30) { this.ammo++; this.gmRel = 0; }
        } else this.gmRel = 0;
        // cứu nhau
        gmRescueTick(this, p, p);
        gmRescueTick(p, this, p);
        // Tia (Beam: Lazer Xuyên Phá, Gojo Đỏ, Thợ Săn Bóng Đêm...) quét qua Bản Sao: trúng 1 lần mỗi tia
        if (gmStanding(this) && typeof beams !== 'undefined') {
            const e = gmEnemy(p);
            for (const bm of beams) {
                if (!bm.active || bm.ownerId === p.id || bm.gmHit) continue;
                if (rectIntersect(bm.x, bm.y, bm.w, bm.h, this.x, this.y, this.w, this.h)) { bm.gmHit = true; this.takeDamage(Math.min(3, Math.max(1, (e ? e.damage : 1) * 2)), e); }
            }
        }
        this._vx = (typeof this._lastX === 'number') ? Math.max(-12, Math.min(12, this.x - this._lastX)) : 0;
        this._lastX = this.x;
        if (!gmStanding(this)) return;
        if (this.freezeTimer > 0) { this.freezeTimer--; return; }
        gmTwinAI(this, p);
    }
    draw() { if (typeof gmDrawTwin === 'function') gmDrawTwin(this); }
}

// ==========================================
// Hook
// ==========================================
CharHooks.register('gemini', {
    setup() {
        if (gmE2(this)) {
            const s = Math.min(8, this.gmStack || 0);
            this.maxHp += 0.25 * s;
            this.damage *= 1 + 0.06 * s;
        }
        this.gmTag = 'A';
        this.gmDown = false; this.gmRes = 0; this.gmResOut = 0; this.gmReboot = 0; this.gmRebootUsed = false;
        this.gmHold = 0; this.gmPrevS = false; this.gmSwCd = 0; this.gmCd = 0;
        this.gmBurst = 0; this.gmAim = 0; this.gmRamp = 0; this.gmRescues = 0; this.gmSwapFx = 0;
        this.gmNeedTwin = true;
        delete GM_BRAIN[this.id];
    },
    update() {
        if (this.gmNeedTwin && gameState.phase === 'playing') {
            this.gmNeedTwin = false;
            if (!gmTwinOf(this)) {
                this.x = Math.max(0, canvas.width / 2 - this.w / 2 - 36);
                bodyEffects.push(new GeminiTwin(this));
            }
        }
        if (this.gmSwCd > 0) this.gmSwCd--;
        if (this.gmCd > 0) this.gmCd--;
        if (this.gmBurst > 0) this.gmBurst--;
        if (this.gmAim > 0) this.gmAim--;
        if (this.gmSwapFx > 0) this.gmSwapFx--;
        if (gmE2(this)) this.gmRamp = (this.gmRamp || 0) + 1;
        if (this.gmDown) { this.hp = 0; this.kbX = 0; this.freezeTimer = 0; }
        if (gmFull(this)) gmSteer(this);
    },
    speed(cur) {
        if (this.gmDown) return 0;
        return cur * gmSpeedMult(this);
    },
    shoot(inp, now) {
        const s = !!inp.s;
        // Bot luyện tập điều khiển P2: gục mà Bản Sao còn đứng -> tự chuyển giao
        const botCtl = this.id === 2 && typeof botAI !== 'undefined' && botAI.enabled;
        if (botCtl && this.gmDown && this.gmSwCd <= 0 && gmStanding(gmTwinOf(this))) { gmSwap(this); this.gmPrevS = s; this.gmHold = 0; return true; }
        if (s) {
            this.gmHold = (this.gmHold || 0) + 1;
            if (this.gmHold === GM_HOLD) {
                if (this.gmSwCd <= 0 && gmTwinOf(this)) gmSwap(this);
                else addFloatingText(this.x + this.w / 2, this.y + this.h / 2 + gmDir(this) * 24, '⇄ ' + (this.gmSwCd / 60).toFixed(1) + 's', '#94a3b8', 11);
            }
        } else {
            if (this.gmPrevS && this.gmHold < GM_HOLD && !this.gmDown && this.ammo > 0 && this.gmCd <= 0) {
                gmFire(this, this.x + this.w / 2, this.gmTag);
                this.ammo--; this.lastShot = now; this.gmCd = GM_FIRE_CD / gmRateMult(this);
            }
            this.gmHold = 0;
        }
        this.gmPrevS = s;
        return true;
    },
    roundEnd() {
        if (gmE2(this)) this.gmStack = Math.min(8, (this.gmStack || 0) + 1);
    },
});
