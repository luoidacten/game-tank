// ==========================================
// Juggernaut (juggernaut) — Logic: "Đơn giản là miễn nhiễm — ngươi không thể khống chế ta được đâu!"
// ------------------------------------------
// BÁ THỂ TUYỆT ĐỐI (nội tại): miễn nhiễm 100% khống chế (choáng/đóng băng/chậm/trói/câm/mù/loạn phím/
//   hút-đẩy-kéo/hất văng) và đi xuyên lồng giam / tường giới hạn. Miễn nhiễm được xử lý TẬP TRUNG:
//   - bọc Player.prototype.update: xoá trường khống chế TRƯỚC khi update chung chạy (nên freeze/magnet/
//     câm lặng/loạn phím/mù HUD không bao giờ có tác dụng), chốt vị trí làn (chống kéo/hút/đẩy).
//   - bọc commitStatuses (cuối tick): bỏ làm chậm vùng (_nextSpeedMult), trả xe về vị trí hợp lệ
//     (xuyên tường Huyết Địa / Lồng Cấm Chế...).
//   - hook speed: luôn dùng tốc độ gốc (bỏ qua mọi hiệu ứng giảm tốc, kể cả giảm tốc vĩnh viễn).
//   Hấp thụ khống chế -> "MIỄN NHIỄM!" (hồi 2s): +0.25 HP, +20% tốc 1.5s, +1 Bá Khí (tối đa 3).
// Nhấp: ĐẠN PHÁ XIỀNG (1.2). Có Bá Khí -> ĐẠN BÁ KHÍ (to x1.5, rất nhanh, +0.8 sát thương chuẩn).
// Giữ 0.5s: GIÁP PHẢN CHẤN 1.5s (hồi 6s): -40% st nhận (Evo 2: -60%); hiệu ứng xấu/DoT trong lúc bật
//   -> gạt phăng + phóng SÓNG PHẢN CHẤN về phía địch (hồi 2s).
// Evo 1: DoT -25% (Full -50%), chống ăn mòn Max HP (Axit) & Trọng Thương; MIỄN NHIỄM nạp 1 viên đạn.
// Evo 2: Đạn Bá Khí lưu khống chế đã hấp thụ và trả ngược lên địch; giáp -60%.
// Full Evo: +3 Max HP, tự tích 1 Bá Khí mỗi 3s, Đạn Bá Khí "Không Thể Cản Phá" (entity riêng trong
//   bodyEffects: không thể bị xoá/phản, xuyên mọi tường/khiên).
// Toàn bộ trạng thái là trường thuần trên player / entity trong bodyEffects -> đồng bộ online.
// ==========================================

const JG_ORANGE = '#fb923c', JG_AMBER = '#f59e0b', JG_GOLD = '#fde047', JG_STEEL = '#94a3b8', JG_RED = '#ef4444';
const JG_HOLD = 30;          // 0.5s
const JG_SHIELD_T = 90;      // 1.5s
const JG_SHIELD_CD = 360;    // 6s
const JG_ICD = 120;          // 2s hồi nội tại
const JG_WAVE_CD = 120;      // 2s hồi sóng phản chấn
const JG_GCD = 16;
// Khống chế -> loại (dùng để phản ngược ở Evo 2)
const JG_CC_FIELDS = [
    ['freezeTimer', 'stun'], ['stunTimer', 'stun'], ['rootTimer', 'stun'],
    ['slowTimer', 'slow'], ['acidZoneSlow', 'slow'], ['djSlowT', 'slow'], ['cnSlowT', 'slow'],
    ['silenceTimer', 'silence'], ['blindTimer', 'blind'],
    ['confusionStacks', 'confuse'], ['confusionTimer', 'confuse'],
    ['bindingCurseTimer', 'slow'], ['magSealTimer', 'pull'],
];
const JG_DOT_FIELDS = ['burnTimer', 'bleedTimer', 'acidBurnTimer'];
const JG_KIND = {
    stun: { n: 'CHOÁNG', c: '#67e8f9' }, slow: { n: 'CHẬM', c: '#60a5fa' }, silence: { n: 'CÂM LẶNG', c: '#c4b5fd' },
    blind: { n: 'MÙ', c: '#a855f7' }, confuse: { n: 'LOẠN', c: '#f472b6' }, pull: { n: 'KÉO', c: '#facc15' },
};

function jgE1(p) { return p.hasUpgrade('evo_jug_1'); }
function jgE2(p) { return p.hasUpgrade('evo_jug_2'); }
function jgFull(p) { return jgE1(p) && jgE2(p) && hasFullEvo(p, 'juggernaut'); }
function jgEnemy(p) { return p === p1 ? p2 : p1; }
function jgDir(p) { return p.id === 1 ? -1 : 1; }
function jgAlive(t) { return t && t.hp > 0; }
function jgSfx(n) { if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem[n]) soundSystem[n](); }
function jgIs(p) { return p && p.weapon === 'juggernaut'; }
function jgTxt(p, s, c, sz) { addFloatingText(p.x + p.w / 2, p.y + (p.id === 1 ? -20 : p.h + 24), s, c, sz || 12); }
function jgDmgScale(p) { return (p.damage || 1.2) / 1.2; }

// ---------- Hấp thụ khống chế ----------
function jgAbsorb(p, kind) {
    p.jgImmFx = 24;
    if (p.jgIcd > 0) {
        if (!(p.jgTxtCd > 0)) { p.jgTxtCd = 50; jgTxt(p, 'MIỄN NHIỄM', '#cbd5e1', 10); }
        return;
    }
    p.jgIcd = JG_ICD; p.jgTxtCd = 50;
    p.hp = Math.min(p.maxHp, p.hp + 0.25);
    p.jgSpdT = 90;
    if (!p.jgStore) p.jgStore = [];
    if ((p.jgStacks || 0) < 3) { p.jgStacks = (p.jgStacks || 0) + 1; p.jgStore.push(jgE2(p) ? kind : ''); }
    else if (jgE2(p)) p.jgStore[p.jgStore.length - 1] = kind;
    if (jgE1(p) && p.ammo < p.maxAmmo) p.ammo++;
    p.jgAbsFx = 30;
    jgTxt(p, 'MIỄN NHIỄM!', JG_GOLD, 14);
    spawnSparkParticles(p.x + p.w / 2, p.y + p.h / 2, JG_ORANGE, 12);
    jgSfx('playShieldBreak');
}

// Xoá mọi khống chế / trả về vị trí làn. Trả về loại khống chế vừa gặp (hoặc '').
function jgCleanse(p, final) {
    let kind = '';
    for (const [f, k] of JG_CC_FIELDS) {
        if (p[f] > 0) { if (!kind) kind = k; p[f] = 0; }
    }
    if (p.isFrozen) { p.isFrozen = false; kind = kind || 'stun'; }
    if (p.coldStack > 0) p.coldStack = 0;
    if (p.bindingCurseStacks > 0) p.bindingCurseStacks = 0;
    if (p.inputDelayQueue && p.inputDelayQueue.length) p.inputDelayQueue = [];
    if (p._nextSpeedMult !== undefined && p._nextSpeedMult < 0.999) { kind = kind || 'slow'; p._nextSpeedMult = 1; }
    if (p.statusSpeedMult !== undefined && p.statusSpeedMult < 1) p.statusSpeedMult = 1;
    if (Math.abs(p.kbX || 0) > 0.5) kind = kind || 'pull';
    p.kbX = 0; p.kbY = 0; p.kbFromRed = false;
    if (p.magPullPhase) { p.magPullPhase = 0; p.magPullT = 0; kind = kind || 'pull'; }
    // Chốt vị trí (chống hút/kéo/đẩy, xuyên tường giới hạn)
    if (p.jgValid && gameState.phase === 'playing') {
        if (typeof p.jgY === 'number' && Math.abs(p.y - p.jgY) > 0.5) { p.y = p.jgY; kind = kind || 'pull'; }
        if (typeof p.jgX === 'number' && Math.abs(p.x - p.jgX) > 0.5) { p.x = p.jgX; kind = kind || 'pull'; }
    }
    // Giáp Phản Chấn: gạt phăng cả DoT
    let dot = false;
    if (p.jgShieldT > 0) {
        for (const f of JG_DOT_FIELDS) if (p[f] > 0) { p[f] = 0; dot = true; }
        if (dot) p.burnStacks = 0;
    }
    // Evo 1: chống ăn mòn Max HP & Trọng Thương
    if (jgE1(p)) {
        if (typeof p.jgMaxHp === 'number' && p.maxHp < p.jgMaxHp) p.maxHp = p.jgMaxHp;
        p.jgMaxHp = Math.max(p.jgMaxHp || 0, p.maxHp);
        const e = jgEnemy(p);
        if (e && e.rvGwLock > 0) e.rvGwLock = 0;
    }
    if (kind) jgAbsorb(p, kind);
    if ((kind || dot) && p.jgShieldT > 0) jgReflectWave(p);
    return kind;
}

// ---------- Entity: Đạn Bá Khí "Không Thể Cản Phá" (Full Evo) ----------
class JgSlug {
    constructor(owner, x, y, vy, dmg, tdmg, kind) {
        this.owner = owner; this.x = x; this.y = y; this.w = 13; this.h = 20;
        this.vy = vy; this.dmg = dmg; this.tdmg = tdmg; this.kind = kind || '';
        this.t = 0; this.active = true;
    }
    update() {
        if (!this.active) return;
        this.t++;
        this.y += this.vy;
        const o = this.owner, e = jgEnemy(o);
        if (this.y < -40 || this.y > canvas.height + 40 || this.t > 200) { this.active = false; return; }
        if (typeof crates !== 'undefined') for (const c of crates) {
            if (c.active && rectIntersect(this.x, this.y, this.w, this.h, c.x, c.y, c.w, c.h)) { c.active = false; crateOnBreak(c, o); grantCrateLoot(c, o); }
        }
        if (jgAlive(e) && rectIntersect(this.x, this.y, this.w, this.h, e.x, e.y, e.w, e.h)) {
            const cx = this.x + this.w / 2, cy = e.y + e.h / 2;
            e.takeDamage(this.dmg, o, { isPiercing: true, bypassShield: true });
            if (jgAlive(e)) e.takeDamage(this.tdmg, o, { isPiercing: true, bypassShield: true, unavoidable: true });
            jgReflectCC(o, e, this.kind);
            jgImpactFx(o, cx, cy, true);
            this.active = false;
        }
    }
    draw() { if (typeof jgDrawSlug === 'function') jgDrawSlug(this); }
}

// ---------- Entity: Sóng Phản Chấn ----------
class JgWave {
    constructor(owner) {
        this.owner = owner; this.team = owner.id;
        this.x = owner.x + owner.w / 2; this.y = owner.id === 1 ? owner.y - 6 : owner.y + owner.h + 6;
        this.vy = jgDir(owner) * 8.5; this.hw = 34; this.t = 0; this.hit = false; this.active = true;
        this.dmg = 0.6 * jgDmgScale(owner);
    }
    update() {
        if (!this.active) return;
        this.t++; this.y += this.vy;
        if (this.y < -30 || this.y > canvas.height + 30 || this.t > 160) { this.active = false; return; }
        const o = this.owner, e = jgEnemy(o);
        if (!this.hit && jgAlive(e) && Math.abs(e.x + e.w / 2 - this.x) < this.hw + e.w / 2 && Math.abs(e.y + e.h / 2 - this.y) < e.h / 2 + 8) {
            this.hit = true;
            e.takeDamage(this.dmg, o, { isPiercing: true });
            if (jgAlive(e) && !jgIs(e)) e.kbX = (e.x + e.w / 2 < this.x ? -1 : 1) * 7;
            explosions.push(new Explosion(e.x + e.w / 2, e.y + e.h / 2, 46, 'rgba(251, 146, 60,', 0, o));
            addFloatingText(e.x + e.w / 2, e.y + (e.id === 1 ? -18 : e.h + 22), 'PHẢN CHẤN!', JG_ORANGE, 13);
            triggerScreenShake(4, 8);
        }
    }
    draw() { if (typeof jgDrawWave === 'function') jgDrawWave(this); }
}

// ---------- Entity: VFX va chạm (vòng nứt) ----------
class JgImpact {
    constructor(owner, x, y, big) { this.team = owner.id; this.x = x; this.y = y; this.big = !!big; this.t = 0; this.dur = big ? 30 : 18; this.seed = Math.round(Math.random() * 600) / 100; this.active = true; }
    update() { if (++this.t >= this.dur) this.active = false; }
    draw() { if (typeof jgDrawImpact === 'function') jgDrawImpact(this); }
}

// ---------- Entity: Kết liễu PHÁ XIỀNG ----------
class JgFinisher {
    constructor(owner, victim) {
        this.team = owner.id;
        this.x = victim.x + victim.w / 2; this.y = victim.y + victim.h / 2;
        this.seed = Math.round(Math.random() * 1000) / 100;
        this.t = 0; this.dur = 120; this.active = true;
    }
    update() { if (++this.t >= this.dur) this.active = false; }
    draw() { if (typeof jgDrawFinisher === 'function') jgDrawFinisher(this); }
    drawOver() { if (typeof jgDrawFinisherOver === 'function') jgDrawFinisherOver(this); }
}

function jgImpactFx(o, x, y, big) {
    if (typeof bodyEffects !== 'undefined') bodyEffects.push(new JgImpact(o, x, y, big));
    spawnSparkParticles(x, y, big ? JG_GOLD : JG_ORANGE, big ? 16 : 7);
    if (big) { triggerScreenShake(5, 9); jgSfx('playExplosion'); }
}

// Evo 2: trả ngược khống chế đã hấp thụ
function jgReflectCC(o, v, kind) {
    if (!kind || !jgAlive(v) || jgIs(v)) return;
    if (kind === 'stun') v.freezeTimer = Math.max(v.freezeTimer || 0, 45);
    else if (kind === 'slow') v.slowTimer = Math.max(v.slowTimer || 0, 120);
    else if (kind === 'silence' || kind === 'confuse') v.silenceTimer = Math.max(v.silenceTimer || 0, 75);
    else if (kind === 'blind') v.blindTimer = Math.max(v.blindTimer || 0, 120);
    else if (kind === 'pull') { v.kbX = (v.x + v.w / 2 < o.x + o.w / 2 ? 1 : -1) * 9; v.freezeTimer = Math.max(v.freezeTimer || 0, 15); }
    const K = JG_KIND[kind];
    addFloatingText(v.x + v.w / 2, v.y + (v.id === 1 ? -30 : v.h + 34), 'TRẢ ĐÒN: ' + K.n + '!', K.c, 13);
}

function jgReflectWave(p) {
    if (p.jgWaveCd > 0) return;
    p.jgWaveCd = JG_WAVE_CD;
    bodyEffects.push(new JgWave(p));
    jgTxt(p, 'GẠT PHĂNG!', JG_ORANGE, 13);
    jgSfx('playExplosion');
}

// ---------- Bắn ----------
function jgFire(p, now) {
    if (!(p.ammo > 0)) { jgTxt(p, 'HẾT ĐẠN', '#94a3b8', 10); return; }
    p.ammo--; p.lastShot = now; p.jgGCD = JG_GCD; p.jgRecoil = 10;
    const dir = jgDir(p), cx = p.x + p.w / 2, sc = jgDmgScale(p);
    const emp = (p.jgStacks || 0) > 0;
    if (!emp) {
        spawnBullet(p, { x: cx - 4, y: dir < 0 ? p.y - 14 : p.y + p.h, w: 8, h: 12, vx: 0, vy: dir * 6.5, dmg: p.damage, hook: 'juggernaut', jgEmp: false, jgKind: '' });
        jgSfx('playShoot');
        return;
    }
    p.jgStacks--;
    const kind = (p.jgStore && p.jgStore.length) ? (p.jgStore.shift() || '') : '';
    if (jgFull(p)) {
        bodyEffects.push(new JgSlug(p, cx - 6.5, dir < 0 ? p.y - 20 : p.y + p.h, dir * 11, p.damage, 0.8 * sc, kind));
    } else {
        spawnBullet(p, { x: cx - 6, y: dir < 0 ? p.y - 18 : p.y + p.h, w: 12, h: 18, vx: 0, vy: dir * 11, dmg: p.damage, hook: 'juggernaut', jgEmp: true, jgKind: kind, jgTd: 0.8 * sc });
    }
    jgTxt(p, kind ? 'BÁ KHÍ · ' + JG_KIND[kind].n : 'ĐẠN BÁ KHÍ!', JG_GOLD, 12);
    triggerScreenShake(2.5, 5);
    jgSfx('playLaser');
}

function jgShield(p) {
    p.jgShieldT = JG_SHIELD_T; p.jgShieldCd = JG_SHIELD_CD;
    jgTxt(p, 'GIÁP PHẢN CHẤN!', JG_ORANGE, 13);
    explosions.push(new Explosion(p.x + p.w / 2, p.y + p.h / 2, 40, 'rgba(251, 146, 60,', 0, p));
    jgSfx('playPowerup');
}

BulletHooks.register('juggernaut', {
    hit(b, o, v, dealt) {
        if (!o || !v) return;
        const x = b.x + b.w / 2, y = v.y + v.h / 2;
        if (b.jgEmp) {
            if (jgAlive(v) && b.jgTd > 0) v.takeDamage(b.jgTd, o, { isPiercing: true, bypassShield: true });
            jgReflectCC(o, v, b.jgKind);
            jgImpactFx(o, x, y, true);
        } else jgImpactFx(o, x, y, false);
    },
    draw(b) { if (typeof jgDrawBullet === 'function') jgDrawBullet(b); },
});

CharHooks.register('juggernaut', {
    setup() {
        if (jgFull(this)) { this.maxHp += 3; this.hp = Math.min(this.maxHp, this.hp + 3); }
        this.jgBase = this.speed;
        this.jgStacks = 0; this.jgStore = [];
        this.jgIcd = 0; this.jgTxtCd = 0; this.jgSpdT = 0; this.jgImmFx = 0; this.jgAbsFx = 0;
        this.jgHold = 0; this.jgPrevS = false; this.jgHoldUsed = false; this.jgGCD = 0; this.jgRecoil = 0;
        this.jgShieldT = 0; this.jgShieldCd = 0; this.jgWaveCd = 0; this.jgAuto = 0;
        this.jgValid = false; this.jgX = this.x; this.jgY = this.y; this.jgMaxHp = this.maxHp;
        this.jgTdLoss = 0; this.jgInUpd = false;
    },
    update() {
        if (this.jgIcd > 0) this.jgIcd--;
        if (this.jgTxtCd > 0) this.jgTxtCd--;
        if (this.jgSpdT > 0) this.jgSpdT--;
        if (this.jgImmFx > 0) this.jgImmFx--;
        if (this.jgAbsFx > 0) this.jgAbsFx--;
        if (this.jgGCD > 0) this.jgGCD--;
        if (this.jgRecoil > 0) this.jgRecoil--;
        if (this.jgShieldT > 0) this.jgShieldT--;
        if (this.jgShieldCd > 0) this.jgShieldCd--;
        if (this.jgWaveCd > 0) this.jgWaveCd--;
        // Full Evo: tự sinh Bá Khí mỗi 3s
        if (jgFull(this) && (this.jgStacks || 0) < 3) {
            if (++this.jgAuto >= 180) {
                this.jgAuto = 0; this.jgStacks++; this.jgStore.push('');
                jgTxt(this, '+1 BÁ KHÍ', JG_AMBER, 10);
            }
        } else this.jgAuto = 0;
    },
    // Bỏ qua mọi hiệu ứng giảm tốc (kể cả giảm tốc vĩnh viễn): luôn dùng tốc độ gốc
    speed() { return (this.jgBase || this.speed) * (this.jgSpdT > 0 ? 1.2 : 1); },
    shoot(inp, now) {
        const s = !!inp.s;
        const released = !s && this.jgPrevS;
        this.jgPrevS = s;
        if (s) {
            this.jgHold++;
            if (this.jgHold === JG_HOLD && !this.jgHoldUsed) {
                this.jgHoldUsed = true;
                if (this.jgShieldCd <= 0) jgShield(this);
                else jgTxt(this, 'GIÁP ' + Math.ceil(this.jgShieldCd / 60) + 's', '#94a3b8', 10);
            }
        } else if (released) {
            if (!this.jgHoldUsed && this.jgHold < JG_HOLD && this.jgGCD <= 0) jgFire(this, now);
            this.jgHold = 0; this.jgHoldUsed = false;
        } else { this.jgHold = 0; this.jgHoldUsed = false; }
        return true;
    },
});

// ---------- Bọc chung: miễn nhiễm khống chế + DoT ----------
(function () {
    const origUpd = Player.prototype.update;
    Player.prototype.update = function () {
        if (!jgIs(this)) return origUpd.apply(this, arguments);
        jgCleanse(this, false);
        const hp0 = this.hp;
        this.jgTdLoss = 0; this.jgInUpd = true;
        let r;
        try { r = origUpd.apply(this, arguments); } finally { this.jgInUpd = false; }
        // Evo 1: giảm sát thương DoT (Chảy máu / Đốt / Axit trừ máu trực tiếp trong update)
        if (jgE1(this) && this.hp > 0) {
            const loss = hp0 - this.hp - (this.jgTdLoss || 0);
            if (loss > 0.0005) this.hp = Math.min(this.maxHp, this.hp + loss * (jgFull(this) ? 0.5 : 0.25));
        }
        this.jgX = this.x; this.jgY = this.y;
        this.jgValid = gameState.phase === 'playing';
        return r;
    };
    if (typeof commitStatuses === 'function') {
        const origCommit = commitStatuses;
        commitStatuses = function (p) {
            if (jgIs(p)) jgCleanse(p, true);
            const r = origCommit(p);
            if (jgIs(p)) {
                if (p.statusSpeedMult < 1) p.statusSpeedMult = 1;
                if (p.jgValid && gameState.phase === 'playing') { p.x = p.jgX; p.y = p.jgY; p._lastX = p.x; }
            }
            return r;
        };
    }
    // takeDamage: Giáp Phản Chấn + kết liễu PHÁ XIỀNG (nối tiếp wrapper sẵn có)
    const origTD = Player.prototype.takeDamage;
    Player.prototype.takeDamage = function (amount, attacker) {
        if (jgIs(this) && this.jgShieldT > 0 && typeof amount === 'number') arguments[0] = amount * (jgE2(this) ? 0.4 : 0.6);
        const before = this.hp;
        const r = origTD.apply(this, arguments);
        if (jgIs(this) && this.jgInUpd && before > this.hp) this.jgTdLoss = (this.jgTdLoss || 0) + (before - this.hp);
        if (before > 0 && this.hp <= 0 && attacker && attacker !== this && jgIs(attacker)
            && typeof bodyEffects !== 'undefined' && !bodyEffects.some(e => e instanceof JgFinisher)) {
            bodyEffects.push(new JgFinisher(attacker, this));
            triggerScreenShake(12, 20);
            spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, JG_GOLD, 26);
            jgSfx('playExplosion');
        }
        return r;
    };
})();
