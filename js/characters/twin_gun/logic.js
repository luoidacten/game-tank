// ==========================================
// Hai Nòng (twin_gun) — Logic: "Hai viên song song, lách đi đâu?"
// ------------------------------------------
// Nhấp: 2 viên bay dọc, 1 viên bên trái trước rồi viên bên phải (phát sau đảo thứ tự).
//   Khoảng cách 2 nòng: Chuẩn 24px (đầu hiệp). Cả 2 viên của cùng 1 phát trúng xe địch ->
//   phát kế +25% tốc đạn & +0.3 Dame (chia đều 2 viên).
// (Đã bỏ đổi Nòng Rộng/Hẹp — khoảng cách nòng cố định 24px.)
// Evo 1: +2 đạn, nạp nhanh 30%. Evo 2: chỉ trúng 1 viên -> đẩy địch lệch ngang về đường bay viên kia.
// FULL EVO: mỗi phát thứ 3 kèm viên thứ 3 ở giữa (xuyên vật cản).
// Trạng thái: trường thuần trên player / đạn -> đồng bộ online.
// ==========================================

const TG_HOLD = 24, TG_GCD = 18, TG_GAP2 = 4, TG_V = 6;
const TG_SPACING = { std: 24, wide: 75, narrow: 20 };
const TG_NAME = { std: 'NÒNG CHUẨN', wide: 'NÒNG RỘNG', narrow: 'NÒNG HẸP' };
const TG_C1 = '#22d3ee', TG_C2 = '#f472b6', TG_GOLD = '#fde047';

function tgE1(p) { return p.hasUpgrade('evo_twin_1'); }
function tgE2(p) { return p.hasUpgrade('evo_twin_2'); }
function tgFull(p) { return tgE1(p) && tgE2(p); }
function tgIs(p) { return p && p.weapon === 'twin_gun'; }
function tgEnemy(p) { return p === p1 ? p2 : p1; }
function tgSfx(n) { if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem[n]) soundSystem[n](); }
function tgTxt(p, s, c, sz) { addFloatingText(p.x + p.w / 2, p.y + (p.id === 1 ? -20 : p.h + 24), s, c, sz || 12); }
function tgSpacing(p) { return TG_SPACING[p.tgMode] || 24; }

function tgSpawn(p, x, o) {
    const dir = p.id === 1 ? -1 : 1;
    return spawnBullet(p, Object.assign({
        x: x - 3, y: p.id === 1 ? p.y - 8 : p.y + p.h + 2, w: 6, h: 10,
        vx: 0, vy: dir * TG_V * (o.boost ? 1.25 : 1), hook: 'twin_gun',
    }, o));
}

function tgFire(p) {
    const cx = p.x + p.w / 2, half = tgSpacing(p) / 2;
    const first = p.tgSide || -1; p.tgSide = -first;          // đảo thứ tự trái/phải mỗi phát
    const boost = !!p.tgBonus; p.tgBonus = false;
    const dmg = p.damage + (boost ? 0.15 : 0);
    const sid = (p.tgSid = (p.tgSid || 0) + 1);
    p.tgShots = (p.tgShots || 0) + 1;
    const x1 = cx + first * half, x2 = cx - first * half;
    tgSpawn(p, x1, { dmg, boost, tgS: sid, tgSib: x2, tgSide: first });
    p.tgQ = { t: TG_GAP2, x: x2, sib: x1, dmg, boost, sid, side: -first };
    if (tgFull(p) && p.tgShots % 3 === 0) {
        tgSpawn(p, cx, { dmg: p.damage, boost, tgS: -1, tgMid: true, isPiercing: true, w: 7, h: 14 });
        tgTxt(p, 'TAM XẠ!', TG_GOLD, 11);
    }
    p.tgRecoil = 6; p.tgFlash = first;
    p.ammo--; p.lastShot = Date.now(); p.tgGcd = TG_GCD;
    p.tgHits = p.tgHits || {}; p.tgHits[sid] = 0;
    for (const k in p.tgHits) if (+k < sid - 6) delete p.tgHits[k];
    if (boost) tgTxt(p, 'SONG KÍCH +', TG_GOLD, 11);
    tgSfx('playShoot');
}

function tgToggle(p) {
    p.tgMode = p.tgMode === 'wide' ? 'narrow' : 'wide';
    tgTxt(p, TG_NAME[p.tgMode], p.tgMode === 'wide' ? TG_C2 : TG_C1, 13);
    p.tgSwapFx = 16;
    tgSfx('playClick');
}

BulletHooks.register('twin_gun', {
    hit(b, attacker, victim) {
        if (!tgIs(attacker) || !victim || victim === attacker || !(b.tgS > 0) || b.tgMid) return;
        const h = attacker.tgHits || (attacker.tgHits = {});
        h[b.tgS] = (h[b.tgS] || 0) + 1;
        if (h[b.tgS] === 2) {
            attacker.tgBonus = true;
            addFloatingText(victim.x + victim.w / 2, victim.y + (victim.id === 1 ? -14 : victim.h + 18), 'SONG TRÚNG!', TG_GOLD, 12);
        } else if (h[b.tgS] === 1 && tgE2(attacker)) {
            // Đạn Từ Tính: đẩy lệch địch về phía đường bay của viên còn lại
            const vx = victim.x + victim.w / 2, s = Math.sign(b.tgSib - vx) || 1;
            victim.tgPushT = 8; victim.tgPushV = s * 2;
        }
    },
});

CharHooks.register('twin_gun', {
    setup() {
        if (tgE1(this)) { this.maxAmmo += 2; this.reloadTime *= 0.7; }
        this.ammo = this.maxAmmo;
        this.tgMode = 'std'; this.tgSide = -1; this.tgBonus = false; this.tgShots = 0; this.tgSid = 0;
        this.tgHits = {}; this.tgQ = null; this.tgHold = 0; this.tgPrevS = false; this.tgHoldUsed = false;
        this.tgGcd = 0; this.tgRecoil = 0; this.tgSwapFx = 0;
    },
    update(inp, eff, now) {
        if (this.tgGcd > 0) this.tgGcd--;
        if (this.tgRecoil > 0) this.tgRecoil--;
        if (this.tgSwapFx > 0) this.tgSwapFx--;
        const q = this.tgQ;
        if (q && --q.t <= 0) {
            this.tgQ = null;
            // viên thứ 2 bám theo vị trí xe hiện tại
            const shift = this.x + this.w / 2 - (q.x + q.sib) / 2;
            tgSpawn(this, q.x + shift, { dmg: q.dmg, boost: q.boost, tgS: q.sid, tgSib: q.sib + shift, tgSide: q.side });
            this.tgRecoil = 6; this.tgFlash = q.side;
        }
        // Evo 1: nạp nhanh hơn 30% (nhịp hồi 1 viên 500ms -> 350ms)
        if (tgE1(this) && this.ammo < this.maxAmmo && now - this.lastShot > this.reloadTime && now - this.lastReload > 350) { this.ammo++; this.lastReload = now; }
        // Đẩy lệch do Đạn Từ Tính (áp lên địch)
        const e = tgEnemy(this);
        if (e && e.tgPushT > 0) { e.tgPushT--; e.x = Math.max(0, Math.min(canvas.width - e.w, e.x + (e.tgPushV || 0))); }
    },
    shoot(inp) {
        const s = !!inp.s;
        if (this.silenceTimer > 0 || this.freezeTimer > 0) { this.tgHold = 0; this.tgPrevS = s; return true; }
        // Bỏ đổi nòng: nhấp là bắn, giữ nút thì bắn liên tục theo nhịp (khoảng cách nòng luôn 24px)
        if (s && this.tgGcd <= 0 && this.ammo > 0 && !this.tgQ) tgFire(this);
        this.tgPrevS = s;
        return true;
    },
});

// ---------- Kết liễu: SONG XẠ GIAO THOA ----------
const TGF_DUR = 150, TGF_HIT = 46;
class TgFinisher {
    constructor(owner, victim) {
        this.team = owner.id;
        this.x = victim.x + victim.w / 2; this.y = victim.y + victim.h / 2;
        this.ox = owner.x + owner.w / 2; this.oy = owner.y + owner.h / 2;
        this.t = 0; this.dur = TGF_DUR; this.active = true;
    }
    update() {
        this.t++;
        if (this.t % 6 === 0 && this.t < TGF_HIT) tgSfx('playShoot');
        if (this.t === TGF_HIT) {
            explosions.push(new Explosion(this.x, this.y, 80, 'rgba(34, 211, 238,', 0, null));
            explosions.push(new Explosion(this.x, this.y, 50, 'rgba(244, 114, 182,', 0, null));
            spawnSparkParticles(this.x, this.y, TG_C1, 20); spawnSparkParticles(this.x, this.y, TG_C2, 20);
            triggerScreenShake(12, 20); tgSfx('playExplosion');
        }
        if (this.t === 90) tgSfx('playWin');
        if (this.t >= this.dur) this.active = false;
    }
    draw() { }
    drawOver() { if (typeof tgDrawFinisher === 'function') tgDrawFinisher(this); }
}
function tgFxOver() {
    if (typeof bodyEffects === 'undefined') return;
    for (const e of bodyEffects) if (e instanceof TgFinisher && e.active) e.drawOver();
}
(function () {
    if (typeof Player === 'undefined') return;
    const orig = Player.prototype.takeDamage;
    Player.prototype.takeDamage = function (amount, attacker) {
        const before = this.hp;
        const r = orig.apply(this, arguments);
        if (before > 0 && this.hp <= 0 && typeof bodyEffects !== 'undefined') {
            const a = typeof bfAttacker === 'function' ? bfAttacker(attacker) : (attacker instanceof Player ? attacker : null);
            if (a && a !== this && tgIs(a) && !(typeof finisherFxActive === 'function' && finisherFxActive())) {
                const fc = typeof fatalCinematic !== 'undefined' ? fatalCinematic : null;
                if (!(fc && fc.active && (a.id !== fc.winnerId || fc.fxSeen))) bodyEffects.push(new TgFinisher(a, this));
            }
        }
        return r;
    };
})();

// ---------- Bot: trả 'tap' | 'toggle' | null ----------
function tgBotAction(bot, enemy) {
    if (!enemy || !(enemy.hp > 0)) return null;
    const dx = Math.abs(enemy.x + enemy.w / 2 - (bot.x + bot.w / 2)), ev = Math.abs(enemy._vx || 0);
    // địch chạy nhiều -> Nòng Rộng khoá 2 bên; địch đứng yên -> Nòng Hẹp dồn sát thương
    if (bot.tgMode !== 'wide' && ev > 2.2 && Math.random() < 0.03) return 'toggle';
    if (bot.tgGcd > 0 || bot.ammo <= 0 || bot.tgQ) return null;
    const half = tgSpacing(bot) / 2, reach = enemy.w / 2 + 3;
    const ok = bot.tgMode === 'wide' ? Math.abs(dx - half) < reach + 6 : dx < half + reach;
    return ok ? 'tap' : null;
}
