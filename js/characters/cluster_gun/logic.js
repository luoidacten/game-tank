// ==========================================
// Pháo Phân Mảnh (cluster_gun) — Logic: "Đạn tách ra: 1 thành nhiều!"
// ------------------------------------------
// Giữ Bắn 0.4s: đổi chế độ đạn MODE_SPLIT (Phân Mảnh) <-> MODE_FRAGILE (Dễ Vỡ).
// MODE_SPLIT: đạn gốc tự tách ở giữa sân thành 3 mảnh tỏa hình nón (Evo 2: 5 | Full: 8), chia sát
//   thương gốc. Đạn đã bay >= 0.25s mà chưa tách -> nhấp Bắn lần nữa để TÁCH SỚM ngay tại chỗ.
// MODE_FRAGILE: đạn trừng phạt — bay như đạn thường (chạm tường/vật cản/xe địch: st đơn, không nổ).
//   Chỉ khi bị ĐẠN ĐỊCH bắn trúng -> nổ, phóng 8 mảnh về phía địch (Evo 2: 12 | Full: 36 tỏa 360°).
// Evo 1: mảnh con +50% tốc. Evo 2: mảnh con nảy tường 2 lần (Full Evo: 4 lần).
// Toàn bộ trạng thái là trường thuần trên player / đạn / entity trong bodyEffects -> đồng bộ online.
// ==========================================

const CG_SPLIT_C = '#ff9f1c', CG_FRAG_C = '#e879f9', CG_GOLD = '#fde047';
const CG_HOLD = 24;          // 0.4s giữ để đổi chế độ
const CG_ARM = 15;           // 0.25s sau khi rời nòng mới được tách sớm
const CG_GCD = 12;
const CG_SHELL_V = 6.2, CG_FRAG_V = 6.5;

function cgE1(p) { return p.hasUpgrade('evo_frag_1'); }
function cgE2(p) { return p.hasUpgrade('evo_frag_2'); }
function cgFull(p) { return cgE1(p) && cgE2(p); }
function cgEnemy(p) { return p === p1 ? p2 : p1; }
function cgDir(p) { return p.id === 1 ? -1 : 1; }
function cgIs(p) { return p && p.weapon === 'cluster_gun'; }
function cgSfx(n) { if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem[n]) soundSystem[n](); }
function cgTxt(p, s, c, sz) { addFloatingText(p.x + p.w / 2, p.y + (p.id === 1 ? -20 : p.h + 24), s, c, sz || 12); }
function cgModeColor(m) { return m === 1 ? CG_FRAG_C : CG_SPLIT_C; }
function cgSplitN(p) { return cgFull(p) ? 8 : (cgE2(p) ? 5 : 3); }
function cgFragileN(p) { return cgFull(p) ? 36 : (cgE2(p) ? 12 : 8); }
function cgBounces(p) { return cgFull(p) ? 4 : (cgE2(p) ? 2 : 0); }
function cgFragSpeed(p) { return CG_FRAG_V * (cgE1(p) ? 1.5 : 1); }

// ---------- Entity: kết liễu PHÂN MẢNH (pháo hoa chùm) ----------
class CgFinisher {
    constructor(owner, victim) {
        this.team = owner.id;
        this.x = victim.x + victim.w / 2; this.y = victim.y + victim.h / 2;
        this.seed = Math.round(Math.random() * 1000) / 100;
        this.t = 0; this.dur = 120; this.active = true;
    }
    update() { if (++this.t >= this.dur) this.active = false; }
    draw() { if (typeof cgDrawFinisher === 'function') cgDrawFinisher(this); }
    drawOver() { if (typeof cgDrawFinisherOver === 'function') cgDrawFinisherOver(this); }
}

// ---------- Mảnh đạn con ----------
// baseAng: góc (rad) tâm chùm; half: nửa góc nón (Math.PI = 360°)
function cgSpawnFrags(p, x, y, n, baseAng, half, dmg, mode) {
    const spd = cgFragSpeed(p), bn = cgBounces(p), full = half >= Math.PI - 0.01;
    for (let i = 0; i < n; i++) {
        const a = full ? baseAng + i * Math.PI * 2 / n : baseAng + (n > 1 ? (i / (n - 1) - 0.5) * 2 * half : 0);
        spawnBullet(p, {
            x: x - 3, y: y - 3, w: 6, h: 6,
            vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, dmg,
            hook: 'cluster_gun', cgK: 'frag', cgM: mode, cgB: bn, cgT: 0,
        });
    }
}

// Tách đạn Phân Mảnh (tự động giữa sân hoặc chủ động)
function cgSplit(p, b, early) {
    const n = cgSplitN(p);
    const x = b.x + b.w / 2, y = b.y + b.h / 2;
    const half = cgFull(p) ? 0.46 : (cgE2(p) ? 0.36 : 0.25);   // nửa góc nón ~14° / 20° / 26°
    const fwd = cgDir(p) < 0 ? -Math.PI / 2 : Math.PI / 2;
    const dmg = b.dmg * 1.5 / n;                                 // chia sát thương gốc (+50% bù tỏa)
    cgSpawnFrags(p, x, y, n, fwd, half, dmg, 0);
    explosions.push(new Explosion(x, y, early ? 26 : 20, 'rgba(255, 159, 28,', 0, p));
    spawnSparkParticles(x, y, CG_SPLIT_C, 8);
    if (early) addFloatingText(x, y + (p.id === 1 ? -10 : 14), 'TÁCH!', CG_SPLIT_C, 11);
    p.cgPopFx = 10;
}

// Đạn Dễ Vỡ bị đạn địch phá -> nổ trừng phạt
function cgShatter(p, b) {
    const n = cgFragileN(p), full = cgFull(p);
    const x = b.x + b.w / 2, y = b.y + b.h / 2;
    const e = cgEnemy(p);
    const ex = e ? e.x + e.w / 2 : x, ey = e ? e.y + e.h / 2 : y + cgDir(p) * 200;
    const toE = Math.atan2(ey - y, ex - x);
    const dmg = p.damage * (full ? 0.16 : (cgE2(p) ? 0.3 : 0.4));
    cgSpawnFrags(p, x, y, n, toE, full ? Math.PI : (cgE2(p) ? 0.9 : 0.7), dmg, 1);
    explosions.push(new Explosion(x, y, full ? 56 : 40, 'rgba(232, 121, 249,', 0, p));
    spawnSparkParticles(x, y, CG_FRAG_C, 16);
    addFloatingText(x, y + (p.id === 1 ? -12 : 16), full ? 'BÃO MẢNH!' : 'TRỪNG PHẠT!', CG_FRAG_C, 13);
    triggerScreenShake(full ? 5 : 3, 8);
    cgSfx('playExplosion');
}

// ---------- Bắn ----------
function cgFire(p, now) {
    if (!(p.ammo > 0)) { cgTxt(p, 'HẾT ĐẠN', '#94a3b8', 10); return; }
    p.ammo--; p.lastShot = now; p.cgGCD = CG_GCD; p.cgRecoil = 10;
    const dir = cgDir(p), cx = p.x + p.w / 2, m = p.cgMode || 0;
    spawnBullet(p, {
        x: cx - 5, y: dir < 0 ? p.y - 16 : p.y + p.h + 2, w: 10, h: 14,
        vx: 0, vy: dir * CG_SHELL_V, dmg: p.damage,
        hook: 'cluster_gun', cgK: m === 1 ? 'fragile' : 'split', cgM: m, cgT: 0,
    });
    cgSfx('playShoot');
}

function cgToggle(p) {
    p.cgMode = p.cgMode === 1 ? 0 : 1;
    p.cgSwapFx = 18;
    cgTxt(p, p.cgMode === 1 ? '◆ DỄ VỠ' : '✸ PHÂN MẢNH', cgModeColor(p.cgMode), 13);
    spawnSparkParticles(p.x + p.w / 2, p.y + p.h / 2, cgModeColor(p.cgMode), 8);
    cgSfx('playPowerup');
}

// Có đạn Phân Mảnh nào sẵn sàng tách sớm?
function cgArmed(p) {
    return (p.bullets || []).some(b => b.hook === 'cluster_gun' && b.cgK === 'split' && b.cgT >= CG_ARM);
}
function cgEarlySplit(p) {
    let any = false;
    for (let i = p.bullets.length - 1; i >= 0; i--) {
        const b = p.bullets[i];
        if (b.hook !== 'cluster_gun' || b.cgK !== 'split' || b.cgT < CG_ARM) continue;
        p.bullets.splice(i, 1);
        cgSplit(p, b, true);
        any = true;
    }
    if (any) cgSfx('playExplosion');
    return any;
}

// ---------- Cập nhật đạn: tự tách giữa sân + Dễ Vỡ chạm đạn địch ----------
function cgUpdateBullets(p) {
    const mid = canvas.height / 2, e = cgEnemy(p);
    const eb = e && e.bullets ? e.bullets : [];
    for (let i = p.bullets.length - 1; i >= 0; i--) {
        const b = p.bullets[i];
        if (b.hook !== 'cluster_gun') continue;
        b.cgT = (b.cgT || 0) + 1;
        if (b.cgK === 'split') {
            const cy = b.y + b.h / 2;
            if (p.id === 1 ? cy <= mid : cy >= mid) { p.bullets.splice(i, 1); cgSplit(p, b, false); }
        } else if (b.cgK === 'fragile') {
            const bx = b.x + b.w / 2, by = b.y + b.h / 2;
            for (let j = eb.length - 1; j >= 0; j--) {
                const o = eb[j];
                if (!o || typeof o.x !== 'number' || typeof o.y !== 'number') continue;
                const ow = o.w || 6, oh = o.h || 6;
                const dx = Math.abs(o.x + ow / 2 - bx), dy = Math.abs(o.y + oh / 2 - by);
                // quét dọc theo tốc độ tương đối để đạn nhanh không "xuyên" qua nhau
                const tol = Math.abs(b.vy || 0) + Math.abs(o.vy || 0);
                if (dx < (b.w + ow) / 2 + 2 && dy < (b.h + oh) / 2 + tol) {
                    if (!o.isPiercing) eb.splice(j, 1);   // phá luôn đạn địch (đạn xuyên vẫn bay tiếp)
                    p.bullets.splice(i, 1);
                    cgShatter(p, b);
                    break;
                }
            }
        }
    }
}

BulletHooks.register('cluster_gun', {
    hit(b, o, v) {
        if (!o || !v) return;
        spawnSparkParticles(b.x + b.w / 2, b.y + b.h / 2, cgModeColor(b.cgM), b.cgK === 'frag' ? 3 : 6);
    },
    // Mảnh con nảy tường (Evo 2: 2 lần | Full: 4 lần)
    edge(b) {
        if (b.cgK !== 'frag' || !(b.cgB > 0)) return;
        b.cgB--;
        if (b.x <= 0 || b.x >= canvas.width) { b.vx = -b.vx; b.x = Math.max(1, Math.min(canvas.width - b.w - 1, b.x)); }
        if (b.y <= 0 || b.y >= canvas.height) { b.vy = -b.vy; b.y = Math.max(1, Math.min(canvas.height - b.h - 1, b.y)); }
        return 'keep';
    },
    draw(b) { if (typeof cgDrawBullet === 'function') cgDrawBullet(b); },
});

CharHooks.register('cluster_gun', {
    setup() {
        this.cgMode = 0; this.cgHold = 0; this.cgPrevS = false; this.cgHoldUsed = false;
        this.cgGCD = 0; this.cgRecoil = 0; this.cgSwapFx = 0; this.cgPopFx = 0;
    },
    update() {
        if (this.cgGCD > 0) this.cgGCD--;
        if (this.cgRecoil > 0) this.cgRecoil--;
        if (this.cgSwapFx > 0) this.cgSwapFx--;
        if (this.cgPopFx > 0) this.cgPopFx--;
        cgUpdateBullets(this);
    },
    shoot(inp, now) {
        const s = !!inp.s;
        const pressed = s && !this.cgPrevS, released = !s && this.cgPrevS;
        this.cgPrevS = s;
        if (pressed) {
            // Nhấp lần 2: tách sớm đạn Phân Mảnh đang bay (chỉ MODE_SPLIT)
            this.cgSplitTap = cgEarlySplit(this);
        }
        if (s) {
            this.cgHold++;
            if (this.cgHold === CG_HOLD && !this.cgHoldUsed) { this.cgHoldUsed = true; cgToggle(this); }
        } else if (released) {
            if (!this.cgHoldUsed && !this.cgSplitTap && this.cgHold < CG_HOLD && this.cgGCD <= 0) cgFire(this, now);
            this.cgHold = 0; this.cgHoldUsed = false; this.cgSplitTap = false;
        } else { this.cgHold = 0; this.cgHoldUsed = false; this.cgSplitTap = false; }
        return true;
    },
});

// takeDamage: kết liễu PHÂN MẢNH (nối tiếp wrapper sẵn có)
(function () {
    const orig = Player.prototype.takeDamage;
    Player.prototype.takeDamage = function (amount, attacker) {
        const before = this.hp;
        const r = orig.apply(this, arguments);
        if (before > 0 && this.hp <= 0 && attacker && attacker !== this && cgIs(attacker)
            && typeof bodyEffects !== 'undefined' && !bodyEffects.some(e => e instanceof CgFinisher)) {
            bodyEffects.push(new CgFinisher(attacker, this));
            triggerScreenShake(10, 18);
            spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, CG_SPLIT_C, 24);
            cgSfx('playExplosion');
        }
        return r;
    };
})();
