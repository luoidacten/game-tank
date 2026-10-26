// ==========================================
// Joker (joker) — Logic: "Lá bài của ta là JOKER!" (Collab: Thần Bài Ma Thuật / Quái Đạo)
// ------------------------------------------
// Băng đạn = 1 tay bài (5 lá; Evo 1: 10 lá, mỗi lần ném 2 lá). Hết bài -> xào bài 1.5s (Evo 2: 0.75s).
// Chất: Rỗng / ♥ Cơ / ♦ Rô / ♣ Chuồn / ♠ Bích / 🃏 JOKER (Evo 1: Joker Đỏ / Joker Đen).
// Nhấp = Phi Bài. Giữ 0.35s = TRÁO BÀI (hồi 4s): lướt ngắn + đổi lá kế tiếp.
// THOÁT HIỂM (beforeLethal): dịch chuyển, để lại hình nhân (bắn trúng -> địch choáng), bất tử 2s.
// Lá Bài A: chất ứng với Vai Trò Chính của địch +5% rút & được cường hóa.
// Evo 2: Wildcard Copy (Joker trúng -> tay bài kế chép Vai Trò Chính của địch). Full Evo: All-In & Phán Quyết.
// Toàn bộ trạng thái là trường thuần trên player / entity trong bodyEffects -> đồng bộ online.
// ==========================================

const JK_PURPLE = '#a855f7', JK_GOLD = '#fde047', JK_GREEN = '#4ade80', JK_PINK = '#f472b6', JK_ORANGE = '#fb923c';
const JK_HOLD = 21;                 // 0.35s
const JK_SUIT = {
    E: { g: '·', c: '#94a3b8', n: 'RỖNG' },
    H: { g: '♥', c: '#f43f5e', n: 'CƠ' },
    D: { g: '♦', c: '#fb923c', n: 'RÔ' },
    C: { g: '♣', c: '#4ade80', n: 'CHUỒN' },
    S: { g: '♠', c: '#60a5fa', n: 'BÍCH' },
    J: { g: '🃏', c: JK_PURPLE, n: 'JOKER' },
};
// Tỉ lệ rút: Joker 5% | ♥ 10% | ♦ 25% | ♣ 20% | ♠ 25% | Rỗng 15%
const JK_ODDS = [['J', 0.05], ['H', 0.10], ['D', 0.25], ['C', 0.20], ['S', 0.25], ['E', 0.15]];

function jkE1(p) { return p.hasUpgrade('evo_joker_1'); }
function jkE2(p) { return p.hasUpgrade('evo_joker_2'); }
function jkFull(p) { return jkE1(p) && jkE2(p); }
function jkEnemy(p) { return p === p1 ? p2 : p1; }
function jkDir(p) { return p.id === 1 ? -1 : 1; }
function jkAlive(t) { return t && t.hp > 0; }
function jkSfx(n) { if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem[n]) soundSystem[n](); }
function jkPow(p) { return jkFull(p) ? 1.5 : 1; }           // Full Evo: hiệu ứng lá bài mạnh hơn
function jkHandMax(p) { return jkE1(p) ? 10 : 5; }
function jkReloadMax(p) { return jkE2(p) ? 45 : 90; }
function jkSuitOf(card) { return (card || 'E')[0]; }
function jkCoins(p, v) { if (p.id === 1) gameState.p1Coins += v; else gameState.p2Coins += v; }
function jkAP(p) { return jkFull(p) ? 1.5 : (jkE2(p) ? 1.25 : 1); }   // Lá Bài A: Evo 2 x1.25, Full Evo x1.5
function jkCP(p) { return jkFull(p) ? 1.5 : 1; }                        // Sao Chép: Full Evo x1.5
function jkHeal(p, v) { if (p && p.hp > 0) p.hp = Math.min(p.maxHp, p.hp + v); }
function jkTxt(p, t, c, sz) { addFloatingText(p.x + p.w / 2, p.y + (p.id === 1 ? -20 : p.h + 24), t, c, sz || 11); }
// Vai trò chính của địch -> chất bài A
const JK_ACE_OF = { 'Đối Đầu': 'S', 'Kiểm Soát': 'C', 'Cơ Động': 'D', 'Sinh Tồn': 'H' };
function jkOdds(p) {
    if (!p || !p.jkAce) return JK_ODDS;
    return JK_ODDS.map(([k, w]) => [k, k === p.jkAce ? w + 0.05 : (k === 'E' ? w - 0.05 : w)]);
}
function jkRole(t) {
    const m = (typeof MODULES !== 'undefined' && MODULES.BODY || []).find(b => b.id === (t && t.weapon));
    return m && m.role && m.role[0] || 'Đối Đầu';
}

// Rút 1 lá (jokerP: tỉ lệ Joker ghi đè, vd. khi Tráo Bài ở Full Evo)
function jkDrawCard(p, jokerP) {
    let r = Math.random(), s = 'E';
    if (jokerP !== undefined) {
        if (r < jokerP) s = 'J';
        else { r = Math.random() * 0.95; let acc = 0; for (const [k, w] of jkOdds(p)) { if (k === 'J') continue; acc += w; if (r < acc) { s = k; break; } } }
    } else {
        let acc = 0;
        for (const [k, w] of jkOdds(p)) { acc += w; if (r < acc) { s = k; break; } }
    }
    if (s === 'J' && jkE1(p)) s = Math.random() < 0.5 ? 'JR' : 'JB';
    return s;
}
function jkJoker(p) { return jkE1(p) ? (Math.random() < 0.5 ? 'JR' : 'JB') : 'J'; }

function jkNewHand(p) {
    const n = jkHandMax(p);
    p.jkAllIn = jkFull(p) && Math.random() < 0.10;
    p.jkHand = [];
    for (let i = 0; i < n; i++) p.jkHand.push(p.jkAllIn ? jkJoker(p) : jkDrawCard(p));
    p.jkReload = 0;
    // Sao Chép: vai trò chép được áp cho TOÀN BỘ tay bài vừa nạp
    p.jkCopy = p.jkCopyNext || ''; p.jkCopyNext = '';
    if (p.jkCopy) jkTxt(p, 'TAY BÀI SAO CHÉP: ' + p.jkCopy.toUpperCase(), JK_PINK, 12);
    if (p.jkAllIn) {
        addFloatingText(p.x + p.w / 2, p.y + (p.id === 1 ? -24 : p.h + 28), '♠ ALL-IN JOKER! ♠', JK_GOLD, 15);
        triggerScreenShake(3, 8);
        jkSfx('playPowerup');
    }
}

// ---------- Entity: Hình nhân thế mạng (Thoát Hiểm) ----------
class JkDecoy {
    constructor(owner, x, y) {
        this.owner = owner; this.x = x; this.y = y; this.w = owner.w; this.h = owner.h;
        this.life = 240; this.maxLife = 240; this.pop = 0; this.active = true;
    }
    update() {
        if (!this.active) return;
        if (this.pop > 0) { if (--this.pop <= 0) this.active = false; return; }
        if (--this.life <= 0) { this.active = false; return; }
        const o = this.owner, e = jkEnemy(o);
        if (!e || !e.bullets) return;
        for (let j = e.bullets.length - 1; j >= 0; j--) {
            const b = e.bullets[j];
            if (!rectIntersect(b.x, b.y, b.w || 6, b.h || 6, this.x, this.y, this.w, this.h)) continue;
            e.bullets.splice(j, 1);
            if (jkAlive(e)) e.freezeTimer = Math.max(e.freezeTimer || 0, 75);
            addFloatingText(e.x + e.w / 2, e.y + (e.id === 1 ? -16 : e.h + 20), 'BỊ LỪA! CHOÁNG', JK_PURPLE, 13);
            explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 46, 'rgba(168, 85, 247,', 0, o));
            spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, JK_GOLD, 14);
            jkSfx('playExplosion');
            this.pop = 24;
            return;
        }
    }
    draw() { if (typeof jkDrawDecoy === 'function') jkDrawDecoy(this); }
}

// ---------- Entity: Lá Joker xoay 1 vòng rồi Joker hiện ra (Thoát Hiểm) ----------
class JkEscapeFx {
    constructor(owner, x, y) { this.team = owner.id; this.x = x; this.y = y; this.t = 0; this.dur = 70; this.active = true; }
    update() { if (++this.t >= this.dur) this.active = false; }
    draw() { if (typeof jkDrawEscapeFx === 'function') jkDrawEscapeFx(this); }
}

// ---------- Entity: Vùng bài (Joker Đen: câm lặng | ♣ A / Kiểm Soát copy: làm chậm, chảy máu, sát thương liên tục) ----------
class JkZone {
    constructor(owner, x, y, r, life, kind, bleed, opt) {
        opt = opt || {};
        this.owner = owner; this.x = x; this.y = y; this.r = r;
        this.life = life; this.maxLife = life; this.kind = kind; this.bleed = !!bleed;
        this.slow = opt.slow || 0.6; this.bleedDmg = opt.bleedDmg || 0.04; this.dot = opt.dot || 0;
        this.active = true;
    }
    update() {
        if (!this.active) return;
        if (--this.life <= 0) { this.active = false; return; }
        const e = jkEnemy(this.owner);
        if (!jkAlive(e)) return;
        if (zoneDist(e.x + e.w / 2 - this.x, e.y + e.h / 2 - this.y) >= this.r) return;
        if (this.kind === 'silence') e.silenceTimer = Math.max(e.silenceTimer || 0, 6);
        else addStatusSlow(e, this.slow);
        if (this.bleed) { e.bleedTimer = Math.max(e.bleedTimer || 0, 24); e.bleedDmg = Math.max(e.bleedDmg || 0, this.bleedDmg); }
        if (this.dot && this.life % 15 === 0) e.takeDamage(this.dot, this.owner, { unavoidable: true, isEnvironmental: true });
    }
    draw() { if (typeof jkDrawZone === 'function') jkDrawZone(this); }
}

// ---------- Entity: Phân Ảnh Bài (copy Cơ Động ♣): đứng 2s tự ném bài rồi lao lên cảm tử ----------
class JkPhantom {
    constructor(owner, x) {
        this.owner = owner; this.x = x; this.y = owner.y; this.w = owner.w; this.h = owner.h;
        this.hp = Math.max(0.2, owner.hp * 0.25); this.maxHp = this.hp;
        this.pw = jkCP(owner); this.life = 120; this.t = 0; this.state = 0; this.active = true;
    }
    update() {
        if (!this.active) return;
        const o = this.owner, e = jkEnemy(o), dir = jkDir(o);
        this.t++;
        if (this.state === 0) {
            if (e && e.bullets) for (let j = e.bullets.length - 1; j >= 0; j--) {
                const b = e.bullets[j];
                if (!rectIntersect(b.x, b.y, b.w || 6, b.h || 6, this.x, this.y, this.w, this.h)) continue;
                e.bullets.splice(j, 1);
                this.hp -= Math.max(0.1, b.dmg || 0.5);
                spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, JK_PINK, 5);
            }
            if (this.t % 30 === 12 && jkAlive(e)) {
                spawnBullet(o, {
                    x: this.x + this.w / 2 - 5, y: dir < 0 ? this.y - 14 : this.y + this.h, w: 10, h: 14,
                    vx: 0, vy: dir * 9, dmg: o.damage * 0.4 * this.pw, hook: 'joker', jk: 'C', jkV: '', jkCopy: '',
                    jkT: 0, jkPh: 0, jkAmp: 0, jkBoom: false, jkHit: false, jkAce: '', jkAP: 1, jkCP: 1, jkHome: 0, jkSide: true,
                });
            }
            if (--this.life <= 0 || this.hp <= 0) {
                this.state = 1; this.t = 0;
                addFloatingText(this.x + this.w / 2, this.y + (o.id === 1 ? -14 : this.h + 18), 'CẢM TỬ!', JK_PINK, 12);
            }
        } else {
            const tx = e ? e.x + e.w / 2 : this.x, ty = e ? e.y + e.h / 2 : this.y + dir * 300;
            const dx = tx - (this.x + this.w / 2), dy = ty - (this.y + this.h / 2), L = Math.hypot(dx, dy) || 1;
            const sp = Math.min(L, 12);
            this.x += dx / L * sp; this.y += dy / L * sp;
            if (L < 22 || this.t > 70 || !jkAlive(e)) {
                const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
                explosions.push(new Explosion(cx, cy, 48, 'rgba(244, 114, 182,', 0, o));
                spawnSparkParticles(cx, cy, JK_GOLD, 14);
                if (jkAlive(e) && Math.hypot(e.x + e.w / 2 - cx, e.y + e.h / 2 - cy) < 52) e.takeDamage(0.8 * o.damage * this.pw, o);
                triggerScreenShake(3, 8);
                jkSfx('playExplosion');
                this.active = false;
            }
        }
    }
    draw() { if (typeof jkDrawPhantom === 'function') jkDrawPhantom(this); }
}

// ---------- Trạng thái lên địch (trường thuần, Joker cập nhật mỗi tick) ----------
function jkMax(e, k, t) { e[k] = Math.max(e[k] || 0, Math.round(t)); }
function jkSlow(e, m, t) { if (!jkAlive(e)) return; if (!(e.jkSlowT > 0) || m < e.jkSlowM) e.jkSlowM = m; jkMax(e, 'jkSlowT', t); }
function jkRoot(e, t) { if (jkAlive(e)) { jkMax(e, 'jkRootT', t); addFloatingText(e.x + e.w / 2, e.y + (e.id === 1 ? -14 : e.h + 18), 'KHÓA CHÂN', JK_ORANGE, 11); } }
function jkVuln(e, v, t) { if (!jkAlive(e)) return; e.jkVulnV = Math.max(e.jkVulnT > 0 ? e.jkVulnV || 0 : 0, v); jkMax(e, 'jkVulnT', t); }
function jkHealCut(e, v, t) { if (!jkAlive(e)) return; e.jkHealCut = Math.max(e.jkHealCutT > 0 ? e.jkHealCut || 0 : 0, Math.min(1, v)); jkMax(e, 'jkHealCutT', t); }
function jkFireSlow(e, v, t) { if (!jkAlive(e)) return; e.jkFireSlow = Math.max(e.jkFireSlowT > 0 ? e.jkFireSlow || 0 : 0, Math.min(0.5, v)); jkMax(e, 'jkFireSlowT', t); }
function jkEmp(e, t) {
    if (!jkAlive(e)) return;
    jkMax(e, 'silenceTimer', t); jkMax(e, 'jkEmpT', t); e.shield = 0;
    jkSlow(e, 0.8, t);
    addFloatingText(e.x + e.w / 2, e.y + (e.id === 1 ? -14 : e.h + 18), 'EMP!', '#67e8f9', 12);
}
function jkTickEnemy(p) {
    const e = jkEnemy(p);
    if (!e) return;
    const dec = k => { if (e[k] > 0) e[k]--; return e[k] > 0; };
    if (dec('jkSlowT')) addStatusSlow(e, e.jkSlowM || 0.7);
    if (dec('jkRootT')) addStatusSlow(e, 0);
    if (dec('jkVulnT')) addStatusVuln(e, e.jkVulnV || 0.2);
    dec('jkEmpT');
    // Giảm / chặn hồi máu & khiên: so với ảnh chụp tick trước
    const cut = dec('jkHealCutT') ? (e.jkHealCut || 0) : 0, noSh = dec('jkNoShT');
    if (cut > 0 && typeof e.jkHpSnap === 'number' && e.jkHpSnap > 0 && e.hp > e.jkHpSnap) e.hp = e.jkHpSnap + (e.hp - e.jkHpSnap) * (1 - cut);
    if (noSh && typeof e.jkShSnap === 'number' && (e.shield || 0) > e.jkShSnap) e.shield = e.jkShSnap;
    e.jkHpSnap = e.hp; e.jkShSnap = e.shield || 0;
    // Giảm tốc bắn: một phần đạn mới của địch bị "kẹt" (đạn có hook: giảm sát thương)
    if (dec('jkFireSlowT') && e.bullets) {
        for (let i = e.bullets.length - 1; i >= 0; i--) {
            const b = e.bullets[i];
            if (b.jkFs) continue;
            b.jkFs = 1;
            if (b.hook) { if (typeof b.dmg === 'number') b.dmg *= 1 - e.jkFireSlow; continue; }
            e.jkFsDebt = (e.jkFsDebt || 0) + (e.jkFireSlow || 0);
            if (e.jkFsDebt >= 1) {
                e.jkFsDebt -= 1;
                spawnSparkParticles(b.x, b.y, '#60a5fa', 4);
                e.bullets.splice(i, 1);
            }
        }
    }
}

// ---------- PHÁN QUYẾT JOKER (Full Evo) ----------
// Đủ 5 lá Joker TRÚNG xe địch (jokerHitCount) & hết hồi chiêu -> SHOWDOWN ngay lập tức:
// máu hiện tại x0.5 (đòn tối thượng: bỏ qua bất tử / né / khiên), Khiên = 0, xóa mọi buff, +1 Thoát Hiểm (tối đa 3).
const JK_VERDICT_CD = 1500, JK_VERDICT_HITS = 5;
function jkClearBuffs(v) {
    v.shield = 0;
    v.invincibleTimer = 0; v.invisTimer = 0; v.stealthActive = false;
    v.crateShieldActive = false; v.crateShieldExpireTimer = 0;
    v.swordShieldActive = false; v.swordShieldHits = 0; v.swordShieldTimer = 0;
    v.jkSpdT = 0; v.jkDR = 0; v.jkDR2 = 0; v.jkInvis = 0;
    for (const k of Object.keys(v)) {
        if (typeof v[k] === 'number' && v[k] > 0 && /buff/i.test(k) && /(Timer|T)$/.test(k)) v[k] = 0;
    }
}
function jkShowdown(o, v) {
    if (!jkAlive(v)) return false;
    o.jokerHitCount = 0; o.jkVerdictCd = JK_VERDICT_CD;
    const before = v.hp;
    v.hp = Math.max(0.01, v.hp * 0.5);
    jkClearBuffs(v);
    o.jkEsc = Math.min(3, (o.jkEsc || 0) + 1);   // có thể vượt giới hạn (tối đa 3)
    bodyEffects.push(new JkVerdict(o, v, before - v.hp));
    addFloatingText(o.x + o.w / 2, o.y + (o.id === 1 ? -22 : o.h + 26), '+1 THOÁT HIỂM', JK_PURPLE, 12);
    triggerScreenShake(6, 10);
    jkSfx('playPowerup');
    return true;
}
// Entity thuần hình ảnh (state số + ref owner) -> NET_CLASSES
class JkVerdict {
    constructor(owner, target, lost) {
        this.owner = owner; this.tid = target.id;
        this.x = target.x + target.w / 2; this.y = target.y + target.h / 2;
        this.lost = Math.round((lost || 0) * 100) / 100;
        this.seed = Math.round(Math.random() * 600) / 100;
        this.t = 0; this.hitT = 30; this.dur = 96; this.active = true;
    }
    update() {
        if (!this.active) return;
        const tg = this.tid === 1 ? p1 : p2;
        if (jkAlive(tg)) { this.x = tg.x + tg.w / 2; this.y = tg.y + tg.h / 2; }
        this.t++;
        if (this.t === this.hitT) {
            const cy = this.y + (this.tid === 1 ? -46 : 46);
            explosions.push(new Explosion(this.x, cy, 80, 'rgba(253, 224, 71,', 0, this.owner));
            explosions.push(new Explosion(this.x, this.y, 54, 'rgba(168, 85, 247,', 0, this.owner));
            spawnSparkParticles(this.x, cy, JK_GOLD, 26);
            spawnSparkParticles(this.x, this.y, JK_PURPLE, 18);
            triggerScreenShake(10, 16);
            jkSfx('playExplosion');
        }
        if (this.t >= this.dur) this.active = false;
    }
    draw() { if (typeof jkDrawVerdict === 'function') jkDrawVerdict(this); }
    drawOver() { if (typeof jkDrawVerdictOver === 'function') jkDrawVerdictOver(this); }
}

// ---------- Entity: Kết liễu ALL IN ----------
class JkFinisher {
    constructor(owner, victim) {
        this.team = owner.id;
        this.x = victim.x + victim.w / 2; this.y = victim.y + victim.h / 2;
        this.seed = Math.round(Math.random() * 1000) / 100;
        this.t = 0; this.dur = 120; this.active = true;
    }
    update() { if (++this.t >= this.dur) this.active = false; }
    draw() { if (typeof jkDrawFinisher === 'function') jkDrawFinisher(this); }
    drawOver() { if (typeof jkDrawFinisherOver === 'function') jkDrawFinisherOver(this); }
}

// ==========================================
// Ném bài
// ==========================================
function jkSpawnCard(p, card, off, mult, side) {
    const dir = jkDir(p), s = jkSuitOf(card), joker = s === 'J';
    const cx = p.x + p.w / 2 + off;
    const allIn = joker && p.jkAllIn;
    const dmg = p.damage * mult * (joker ? (allIn ? 1.5 : 2) : 1);
    const ace = (p.jkAce && (s === p.jkAce || joker)) ? p.jkAce : '';
    const copy = side ? '' : (p.jkCopy || '');
    let spd = joker ? 12.5 : 9, home = 0;
    if (ace === 'D') { spd *= 1 + 0.25 * jkAP(p); home = 1; }                  // ♦ A: nhanh + homing nhẹ
    if (copy === 'Cơ Động' && (s === 'D' || joker)) { spd *= 2; home = 2; }     // copy Cơ Động ♦: x2 tốc + khóa mục tiêu
    spawnBullet(p, {
        x: cx - 5, y: dir < 0 ? p.y - 14 : p.y + p.h, w: 10, h: 14,
        vx: 0, vy: dir * Math.min(spd, 22), dmg,
        isPiercing: s === 'S' || joker,
        hook: 'joker', jk: s, jkV: card.length > 1 ? card[1] : '', jkCopy: copy,
        jkT: 0, jkPh: Math.round(Math.random() * 628) / 100, jkAmp: joker && !home ? 2.6 + Math.round(Math.random() * 15) / 10 : 0,
        jkBoom: false, jkHit: false, jkAce: ace, jkAP: jkAP(p), jkCP: jkCP(p), jkHome: home, jkSide: !!side,
    });
    // copy Cơ Động ♠: phóng kèm 1 lá Bích phụ xuyên thấu
    if (!side && copy === 'Cơ Động' && (s === 'S' || joker)) jkSpawnCard(p, 'S', off + (off >= 0 ? 9 : -9), mult * 0.5, true);
}

function jkThrow(p) {
    if (!p.jkHand || !p.jkHand.length || p.jkReload > 0) return;
    const pair = jkE1(p) && p.jkHand.length >= 2;
    const n = pair ? 2 : 1;
    // Evo 1: sau 5 lần ném không ra Joker -> chắc chắn Joker
    if (jkE1(p)) {
        const hasJ = p.jkHand.slice(0, n).some(c => jkSuitOf(c) === 'J');
        if (!hasJ && p.jkPity >= 4) { p.jkHand[0] = jkJoker(p); addFloatingText(p.x + p.w / 2, p.y + (p.id === 1 ? -18 : p.h + 22), 'BÀI TẨY!', JK_PURPLE, 12); }
    }
    const cards = p.jkHand.splice(0, n);
    if (cards.some(c => jkSuitOf(c) === 'J')) p.jkPity = 0; else p.jkPity = (p.jkPity || 0) + 1;
    const mult = pair ? 0.6 : 1;                         // 2 lá/lần: mỗi lá 0.6 dame (cân bằng)
    cards.forEach((c, i) => jkSpawnCard(p, c, pair ? (i ? 5 : -5) : 0, mult));
    p.jkGCD = 15; p.jkThrowFx = 10;
    jkCopyOnThrow(p, cards);
    if (!p.jkHand.length) p.jkReload = jkReloadMax(p);
    jkSfx('playShoot');
}

// Evo 2 — hiệu ứng copy kích hoạt khi ném (Cơ Động / Sinh Tồn). Lá Rỗng vẫn nhận hiệu ứng chung.
function jkCopyOnThrow(p, cards) {
    const role = p.jkCopy;
    if (!role) return;
    const cp = jkCP(p);
    const has = k => cards.some(c => jkSuitOf(c) === k || jkSuitOf(c) === 'J');
    if (role === 'Cơ Động') {
        const ox = p.x;
        p.jkDashT = Math.max(p.jkDashT || 0, 4);
        p.jkDashDir = p.jkMoveDir || (Math.random() < 0.5 ? -1 : 1); p.jkDashV = 6;
        jkSpd(p, 1 + 0.25 * cp, 60);
        if (has('H')) {
            jkHeal(p, 0.25 * cp);
            p.slowTimer = 0; p.jkSlowT = 0; p.jkRootT = 0; p._nextSpeedMult = 1;
        }
        if (has('C') && bodyEffects.filter(e => e instanceof JkPhantom && e.owner === p).length < 2) {
            bodyEffects.push(new JkPhantom(p, ox));
            jkTxt(p, 'PHÂN ẢNH BÀI!', JK_PINK, 11);
        }
    } else if (role === 'Sinh Tồn') {
        p.jkDR = 120;
        if (has('H')) {
            jkHeal(p, cp > 1 ? 1.25 : 1);
            if ((p.shield || 0) < (cp > 1 ? 2 : 1)) p.shield = (p.shield || 0) + 1;
            jkTxt(p, '+HP +1 KHIÊN', '#67e8f9', 11);
        }
    }
}
function jkSpd(p, m, t) { if (!(p.jkSpdT > 0) || m >= (p.jkSpdM || 1)) p.jkSpdM = m; p.jkSpdT = Math.max(p.jkSpdT || 0, Math.round(t)); }

// Tráo Bài (giữ 0.35s)
function jkSwap(p) {
    p.jkSwapCd = 240;
    p.jkDashT = 8; p.jkDashV = 7;
    p.jkDashDir = p.jkMoveDir || (p.x + p.w / 2 < canvas.width / 2 ? 1 : -1);
    if (p.jkHand && p.jkHand.length && p.jkReload <= 0) {
        const cur = jkSuitOf(p.jkHand[0]);
        let nc = cur, guard = 0;
        while (jkSuitOf(nc) === cur && guard++ < 30) nc = jkDrawCard(p, jkFull(p) ? 0.3 : undefined);
        p.jkHand[0] = nc;
    }
    if (jkE1(p)) {
        if (!p.jkHand) p.jkHand = [];
        for (let i = 0; i < 2 && p.jkHand.length < jkHandMax(p); i++) p.jkHand.push(jkDrawCard(p));
        if (p.jkReload > 0) p.jkReload = 0;
        p.jkInvis = 30;
        p.invincibleTimer = Math.max(p.invincibleTimer || 0, 30);
    }
    p.jkSwapFx = 20;
    addFloatingText(p.x + p.w / 2, p.y + (p.id === 1 ? -18 : p.h + 22), 'TRÁO BÀI!', JK_GOLD, 12);
    spawnSparkParticles(p.x + p.w / 2, p.y + p.h / 2, JK_PURPLE, 10);
    jkSfx('playDash');
}

// ==========================================
// Thoát Hiểm
// ==========================================
function jkEscapeX(p) {
    const e = jkEnemy(p), ox = p.x;
    let best = ox, bestS = -1e9;
    for (let x = 6; x <= canvas.width - p.w - 6; x += 8) {
        const far = Math.abs(x - ox);
        let s = Math.min(far, 220) + Math.random() * 40;
        if (far < 100) s -= 400;
        if (e && e.bullets) for (const b of e.bullets) {
            const tw = p.id === 1 ? b.vy > 0 : b.vy < 0;
            if (tw && Math.abs(b.x + (b.w || 0) / 2 - (x + p.w / 2)) < p.w) s -= 60;
        }
        if (e && Math.abs(e.x + e.w / 2 - (x + p.w / 2)) < 30) s -= 50;
        if (s > bestS) { bestS = s; best = x; }
    }
    return Math.max(0, Math.min(canvas.width - p.w, best));
}
function jkTryEscape(p) {
    if (!((p.jkEsc || 0) > 0) || groundedBlock(p)) return false;
    p.jkEsc--;
    if (jkE2(p) && p.jkEsc < p.jkEscMax && !(p.jkEscT > 0)) p.jkEscT = jkFull(p) ? 2700 : 3600;
    const ox = p.x, oy = p.y;
    bodyEffects.push(new JkDecoy(p, ox, oy));
    p.x = jkEscapeX(p);
    p.hp = Math.max(p.hp, 0.05);
    p.invincibleTimer = Math.max(p.invincibleTimer || 0, 120);
    p.bleedTimer = 0; p.burnTimer = 0; p.acidBurnTimer = 0; p.kbX = 0;
    p.jkDashT = 0;
    bodyEffects.push(new JkEscapeFx(p, p.x + p.w / 2, p.y + p.h / 2));
    explosions.push(new Explosion(ox + p.w / 2, oy + p.h / 2, 60, 'rgba(168, 85, 247,', 0, p));
    addFloatingText(ox + p.w / 2, oy + (p.id === 1 ? -26 : p.h + 30), 'THOÁT HIỂM!', JK_PURPLE, 17);
    triggerScreenShake(5, 12);
    jkSfx('playRevive');
    return true;
}

// ==========================================
// Hiệu ứng lá bài khi trúng
// ==========================================
// ♣ A: x3 sát thương lên Vật Triệu Hồi / Tường chắn trong vùng nổ
function jkSummonLists() {
    const L = [];
    if (typeof turrets !== 'undefined') L.push(turrets);
    if (typeof creatorTurrets !== 'undefined') L.push(creatorTurrets);
    if (typeof creatorDrones !== 'undefined') L.push(creatorDrones);
    if (typeof creatorRobots !== 'undefined') L.push(creatorRobots);
    if (typeof necroMinions !== 'undefined') L.push(necroMinions);
    if (typeof sniperWalls !== 'undefined') L.push(sniperWalls);
    if (typeof bastions !== 'undefined') L.push(bastions);
    if (typeof ghostDecoys !== 'undefined') L.push(ghostDecoys);
    if (typeof bodyEffects !== 'undefined') L.push(bodyEffects.filter(o => o && o.isStone));
    return L.filter(a => Array.isArray(a));
}
function jkSmashSummons(owner, x, y, R, d) {
    let n = 0;
    for (const a of jkSummonLists()) for (const o of a) {
        if (!o || o.active === false || typeof o.hp !== 'number' || o.hp <= 0) continue;
        if (o.owner === owner || o.player === owner) continue;
        const ox = o.x + (o.w || 0) / 2, oy = o.y + (o.h || 0) / 2;
        if (Math.abs(ox - x) > R + (o.w || 0) / 2 || Math.abs(oy - y) > R * 0.8 + (o.h || 0) / 2) continue;
        if (typeof o.takeDamage === 'function') o.takeDamage(d, owner);
        else { o.hp -= d; if (o.hp <= 0) o.active = false; }
        spawnSparkParticles(ox, oy, JK_GREEN, 6); n++;
    }
    return n;
}
// ♣ A: xóa Vũng mặt đất của địch tại tâm nổ
function jkClearPools(owner, x, y, R) {
    const kill = z => {
        if (!z || z.active === false || z.owner === owner) return false;
        const zr = z.r || z.radius || z.maxR || 0;
        return Math.hypot((z.x || 0) - x, (z.y || 0) - y) < R * 0.6 + zr * 0.5;
    };
    let n = 0;
    const L = [];
    if (typeof iceZones !== 'undefined') L.push(iceZones);
    if (typeof voidZones !== 'undefined') L.push(voidZones);
    if (typeof radiationZones !== 'undefined') L.push(radiationZones);
    for (const a of L) if (Array.isArray(a)) for (const z of a) if (kill(z)) { z.active = false; z.life = 0; n++; }
    if (typeof bodyEffects !== 'undefined' && typeof BodyZone !== 'undefined') for (const z of bodyEffects) {
        if (z instanceof BodyZone && kill(z)) { z.active = false; n++; }
    }
    if (n) addFloatingText(x, y - 14, 'XÓA VŨNG!', JK_GREEN, 11);
}

function jkClubBoom(b, owner, x, y, victim) {
    if (b.jkBoom) return;
    b.jkBoom = true;
    const e = jkEnemy(owner), pw = jkPow(owner);
    const big = b.jk === 'J' && b.jkV === 'R';
    const ace = b.jkAce === 'C' ? (b.jkAP || 1) : 0;
    let R = big ? 70 : 44;
    if (ace) R = Math.round(R * (1 + 0.35 * ace));
    explosions.push(new Explosion(x, y, R, big ? 'rgba(244, 63, 94,' : 'rgba(74, 222, 128,', 0, owner));
    if (jkAlive(e) && Math.abs(e.x + e.w / 2 - x) < R + e.w / 2 && Math.abs(e.y + e.h / 2 - y) < R * 0.8) {
        if (e !== victim) e.takeDamage(0.4 * owner.damage * pw, owner);
        if (jkAlive(e)) e.kbX = (e.x + e.w / 2 < x ? -1 : 1) * (big ? 9 : 6) * pw;
    }
    if (ace) {
        jkSmashSummons(owner, x, y, R, (b.dmg || owner.damage) * 3 * ace);
        jkClearPools(owner, x, y, R);
        bodyEffects.push(new JkZone(owner, x, y, Math.round(R * 0.7), Math.round(120 * ace), 'slow', false, { slow: 1 - 0.3 * ace }));
    }
}

function jkNoShield(e, t) { if (jkAlive(e)) jkMax(e, 'jkNoShT', t); }
function jkStealBuff(o, v) {
    if ((v.shield || 0) > 0) { v.shield--; o.shield = Math.min(3, (o.shield || 0) + 1); return 'KHIÊN'; }
    if ((v.invincibleTimer || 0) > 0) { const t = Math.min(60, v.invincibleTimer); v.invincibleTimer = 0; o.invincibleTimer = Math.max(o.invincibleTimer || 0, t); return 'BẤT TỬ'; }
    if ((v.jkSpdT || 0) > 0) { o.jkSpdM = v.jkSpdM; o.jkSpdT = v.jkSpdT; v.jkSpdT = 0; return 'TỐC ĐỘ'; }
    return '';
}
const JK_DEBUFFS = ['silenceTimer', 'jkRootT', 'bleedTimer', 'burnTimer', 'acidBurnTimer', 'slowTimer', 'jkSlowT', 'blindTimer', 'confusionTimer', 'jkVulnT', 'jkHealCutT', 'jkNoShT', 'jkFireSlowT'];
function jkCleanse(o) {
    for (const k of JK_DEBUFFS) if ((o[k] || 0) > 0) { o[k] = 0; return true; }
    return false;
}

// Evo 2 — Sao Chép Vai Trò: hiệu ứng khi trúng (áp cho cả tay bài; Lá Rỗng nhận hiệu ứng chung; Joker = cả 4 chất)
function jkCopyHit(b, o, v, x, y, dealt, has) {
    const R = b.jkCopy, cp = b.jkCP || 1, vy = v.y + v.h / 2;
    if (R === 'Đối Đầu') {
        v.takeDamage(v.maxHp * 0.04 * cp, o, { unavoidable: true });
        if (has('H') && jkAlive(v)) { jkHeal(o, 0.5 * cp); v.takeDamage(v.hp * 0.03 * cp, o, { unavoidable: true }); }
        if (has('D') && jkAlive(v)) {
            const c = Math.round(10 * cp); jkCoins(o, c); addFloatingText(x, y - 22, '+$' + c, JK_GOLD, 11);
            v.takeDamage(b.dmg * 0.5 * cp + v.hp * 0.03 * cp, o, { unavoidable: true, bypassShield: true, isPiercing: true });
            addFloatingText(x, y - 32, 'CHÍ MẠNG x1.5!', JK_ORANGE, 12);
        }
        if (has('C') && jkAlive(v)) {
            for (let k = 0; k < 2 && jkAlive(v); k++) {
                explosions.push(new Explosion(v.x + v.w / 2, vy, 40 + k * 16, 'rgba(74, 222, 128,', 0, o));
                v.takeDamage(v.maxHp * 0.03 * cp, o, { unavoidable: true });
            }
            if (jkAlive(v)) { v.kbX = (v.x + v.w / 2 < x ? -1 : 1) * 8; jkMax(v, 'freezeTimer', 24 * cp); }
        }
        if (has('S') && jkAlive(v)) {
            jkMax(v, 'bleedTimer', 180); v.bleedDmg = Math.max(v.bleedDmg || 0, v.maxHp * 0.012 * cp);
            jkVuln(v, 0.2 * cp, 180);
        }
    } else if (R === 'Kiểm Soát') {
        const z = { r: 34, slow: 0.65, bleed: false, bleedDmg: 0.04, dot: 0 };
        if (has('H')) { jkHeal(o, 0.25 * cp); z.r = 44; z.bleed = true; z.bleedDmg = Math.max(0.03, v.maxHp * 0.008 * cp); }
        if (has('D')) { const c = Math.round(5 * cp); jkCoins(o, c); addFloatingText(x, y - 22, '+$' + c, JK_GOLD, 11); jkRoot(v, 45 * cp); }
        if (has('C')) { z.dot = 0.05 * cp; jkEmp(v, 90 * cp); }
        if (has('S')) { z.slow = 0.5; z.bleed = true; jkMax(v, 'silenceTimer', 120 * cp); addFloatingText(x, y - 32, 'CÂM LẶNG!', '#c4b5fd', 11); }
        if (cp > 1) z.slow -= 0.1;
        bodyEffects.push(new JkZone(o, x, vy, Math.round(z.r * (cp > 1 ? 1.2 : 1)), 150, 'slow', z.bleed, z));
    } else if (R === 'Cơ Động') {
        if (has('D')) { const c = Math.round(5 * cp); jkCoins(o, c); addFloatingText(x, y - 22, '+$' + c, JK_GOLD, 11); o.jkSwapCd = Math.max(0, (o.jkSwapCd || 0) - Math.round(60 * cp)); }
        if (has('S')) jkSpd(o, 1.4, 90 * cp);
    } else if (R === 'Sinh Tồn') {
        if (has('D')) { const c = Math.round(5 * cp); jkCoins(o, c); addFloatingText(x, y - 22, '+$' + c, JK_GOLD, 11); jkMax(o, 'jkDR2', 180 * cp); }
        if (has('C')) { jkHealCut(v, 1, 180 * cp); jkNoShield(v, 180 * cp); addFloatingText(x, y - 32, 'CẤM HỒI MÁU & KHIÊN', '#67e8f9', 11); }
        if (has('S')) {
            if (dealt > 0) jkHeal(o, dealt * cp);
            const st = jkStealBuff(o, v), cl = jkCleanse(o);
            if (st || cl) jkTxt(o, (st ? 'CƯỚP ' + st : '') + (st && cl ? ' · ' : '') + (cl ? 'GIẢI HIỆU ỨNG' : ''), '#67e8f9', 11);
        }
    }
}

BulletHooks.register('joker', {
    hit(b, o, v, dealt) {
        if (!o || !v) return;
        const x = b.x + b.w / 2, y = b.y + b.h / 2, s = b.jk, J = s === 'J', pw = jkPow(o);
        const has = k => s === k || J;
        const ap = b.jkAP || 1, A = k => b.jkAce === k && has(k);   // Lá Bài A
        b.jkHit = true;
        spawnSparkParticles(x, y, JK_SUIT[s].c, 6);
        if (has('H')) jkHeal(o, A('H') ? 0.4 * ap : 0.25 * pw);
        if (A('H')) jkHealCut(v, Math.min(0.9, 0.5 * ap), 240);
        if (has('D')) { const c = Math.round(5 * pw); jkCoins(o, c); addFloatingText(x, y - 10, '+$' + c, JK_GOLD, 11); }
        if (A('D')) jkSlow(v, 1 - Math.min(0.6, 0.3 * ap), 90 * ap);
        if (has('C')) jkClubBoom(b, o, x, v.y + v.h / 2, v);
        if (has('S') && jkAlive(v)) { jkMax(v, 'bleedTimer', A('S') ? 180 * ap : 120 * pw); v.bleedDmg = Math.max(v.bleedDmg || 0, 0.05); }
        if (A('S') && jkAlive(v)) {
            v.takeDamage(0.25 * ap, o, { bypassShield: true, isPiercing: true });
            jkFireSlow(v, 0.15 * ap, 180);
        }
        // Joker Đỏ / Đen (Evo 1)
        if (J && b.jkV === 'R') {
            jkHeal(o, 0.5 * pw);
            if (jkAlive(v)) v.freezeTimer = Math.max(v.freezeTimer || 0, 30);
            addFloatingText(x, y - 18, 'JOKER ĐỎ!', '#f43f5e', 13);
        } else if (J && b.jkV === 'B') {
            if (jkAlive(v)) v.silenceTimer = Math.max(v.silenceTimer || 0, 60);
            bodyEffects.push(new JkZone(o, x, v.y + v.h / 2, 40, 120, 'silence', false));
            addFloatingText(x, y - 18, 'JOKER ĐEN - CÂM!', '#c4b5fd', 13);
        }
        if (b.jkCopy && jkAlive(v)) jkCopyHit(b, o, v, x, y, dealt, has);
        if (J && dealt > 0) {
            if (jkE2(o)) {
                o.jkCopyNext = jkRole(v);
                jkTxt(o, 'SAO CHÉP: ' + o.jkCopyNext.toUpperCase() + ' (tay kế)', JK_PINK, 12);
                if (o.jkEscT > 0) o.jkEscT = Math.max(1, o.jkEscT - 120);
            }
        }
        // Phán Quyết: đếm mọi lá Joker TRÚNG xe địch (kể cả bị khiên chặn)
        if (J && jkFull(o)) {
            o.jokerHitCount = Math.min(JK_VERDICT_HITS, (o.jokerHitCount || 0) + 1);
            if (o.jokerHitCount >= JK_VERDICT_HITS && !(o.jkVerdictCd > 0)) jkShowdown(o, v);
            else jkTxt(o, 'PHÁN QUYẾT ' + o.jokerHitCount + '/' + JK_VERDICT_HITS + (o.jkVerdictCd > 0 ? ' (' + Math.ceil(o.jkVerdictCd / 60) + 's)' : ''), JK_GOLD, 10);
        }
    },
    truckDmgMult(b) { return b.jk === 'D' || b.jk === 'J' ? 10 : 1; },
    obstacle(b, o, obj, kind) {
        if (kind === 'crate' && (b.jk === 'D' || b.jk === 'J')) { const c = Math.round(5 * jkPow(o)); jkCoins(o, c); addFloatingText(b.x, b.y - 10, '+$' + c, JK_GOLD, 11); }
        if (b.jk === 'C' && !b.jkBoom) jkClubBoom(b, o, b.x + b.w / 2, b.y + b.h / 2, null);
        if (b.jkCopy === 'Kiểm Soát' && kind !== 'truck') bodyEffects.push(new JkZone(o, b.x + b.w / 2, b.y + b.h / 2, 34, 150, 'slow', false, { slow: 0.65 }));
    },
    draw(b) { if (typeof jkDrawBullet === 'function') jkDrawBullet(b); },
});

// Đạn Joker lượn cong / homing + Chuồn nổ khi bay qua làn địch
function jkUpdateBullets(p) {
    const e = jkEnemy(p);
    const ey = e ? e.y + e.h / 2 : (p.id === 1 ? 40 : canvas.height - 40);
    for (let i = p.bullets.length - 1; i >= 0; i--) {
        const b = p.bullets[i];
        if (!b || b.hook !== 'joker') continue;   // jkClubBoom -> takeDamage có thể làm hook địch xoá/đổi p.bullets giữa vòng lặp
        b.jkT++;
        if (b.jkHome && jkAlive(e)) {
            const dx = e.x + e.w / 2 - (b.x + b.w / 2), acc = b.jkHome > 1 ? 0.6 : 0.14, cap = b.jkHome > 1 ? 7 : 2.4;
            const ahead = p.id === 1 ? b.y > ey : b.y < ey;
            if (ahead) b.vx = Math.max(-cap, Math.min(cap, (b.vx || 0) + Math.sign(dx) * Math.min(acc, Math.abs(dx) * 0.05)));
        } else if (b.jk === 'J' && b.jkAmp) {
            b.vx = Math.sin(b.jkPh + b.jkT * 0.16) * b.jkAmp;
            if (b.x < 6) b.vx = Math.abs(b.vx); else if (b.x + b.w > canvas.width - 6) b.vx = -Math.abs(b.vx);
        }
        if ((b.jk === 'C' || b.jk === 'J') && !b.jkBoom) {
            const cy = b.y + b.h / 2;
            const past = p.id === 1 ? cy <= ey : cy >= ey;
            if (past) {
                jkClubBoom(b, p, b.x + b.w / 2, ey, null);
                if (b.jk === 'C') { const k = p.bullets.indexOf(b); if (k >= 0) p.bullets.splice(k, 1); continue; }
            }
        }
    }
}

// Lá Bài A: đọc Vai Trò Chính của body địch đầu hiệp
const JK_ACE_DEBUFF = ['jkSlowT', 'jkRootT', 'jkVulnT', 'jkHealCutT', 'jkNoShT', 'jkFireSlowT', 'jkEmpT', 'jkFsDebt'];
function jkAceInit(p, announce) {
    const e = jkEnemy(p);
    if (!e || !e.weapon) { p.jkAce = ''; p.jkAceOk = false; return; }
    const prev = p.jkAce;
    p.jkAceRole = jkRole(e); p.jkAce = JK_ACE_OF[p.jkAceRole] || 'S'; p.jkAceOk = true;
    if (!announce) { JK_ACE_DEBUFF.forEach(k => { e[k] = 0; p[k] = 0; }); e.jkHpSnap = undefined; e.jkShSnap = undefined; }
    if (announce) {
        if (prev !== p.jkAce && !(p.jkReload > 0) && p.jkHand && p.jkHand.length === jkHandMax(p)) jkNewHand(p);
        jkTxt(p, 'LÁ BÀI A' + JK_SUIT[p.jkAce].g + ' vs ' + p.jkAceRole.toUpperCase(), JK_SUIT[p.jkAce].c, 12);
    }
}

CharHooks.register('joker', {
    setup() {
        this.jkHand = []; this.jkReload = 0; this.jkPity = 0; this.jkAllIn = false;
        this.jkGCD = 0; this.jkHold = 0; this.jkPrevS = false; this.jkHoldUsed = false;
        this.jkSwapCd = 0; this.jkDashT = 0; this.jkDashDir = 0; this.jkDashV = 0; this.jkMoveDir = 0;
        this.jkInvis = 0; this.jkDR = 0; this.jkThrowFx = 0; this.jkSwapFx = 0;
        this.jkCopy = ''; this.jkCopyNext = ''; this.jkSpdT = 0; this.jkSpdM = 1; this.jkDR2 = 0;
        jkAceInit(this, false); this.jkAceOk = false;   // tick đầu kiểm tra lại (địch có thể chưa setup)
        this.jkEscMax = jkFull(this) ? 2 : 1; this.jkEsc = 1; this.jkEscT = 0;
        this.jokerHitCount = 0; this.jkVerdictCd = 0;
        this.ammo = 0;
        jkNewHand(this);
    },
    update() {
        if (this.jkGCD > 0) this.jkGCD--;
        if (this.jkSwapCd > 0) this.jkSwapCd--;
        if (this.jkInvis > 0) this.jkInvis--;
        if (this.jkDR > 0) this.jkDR--;
        if (this.jkThrowFx > 0) this.jkThrowFx--;
        if (this.jkSwapFx > 0) this.jkSwapFx--;
        if (this.jkVerdictCd > 0) this.jkVerdictCd--;
        // đã tích đủ 5 lá trong lúc hồi chiêu -> hết hồi là Phán Quyết ngay
        if (jkFull(this) && (this.jokerHitCount || 0) >= JK_VERDICT_HITS && !(this.jkVerdictCd > 0)) jkShowdown(this, jkEnemy(this));
        if (this.jkSpdT > 0) this.jkSpdT--;
        if (this.jkDR2 > 0) this.jkDR2--;
        if (!this.jkAceOk) jkAceInit(this, true);
        jkTickEnemy(this);
        // Hòm đạn -> rút ngay tay bài mới
        if (this.ammo > 0) { this.ammo = 0; jkNewHand(this); }
        if (this.jkReload > 0 && --this.jkReload <= 0) jkNewHand(this);
        if ((!this.jkHand || !this.jkHand.length) && !(this.jkReload > 0)) this.jkReload = jkReloadMax(this);
        // Hồi Thoát Hiểm (Evo 2 / Full Evo — chỉ đếm sau khi đã kích hoạt)
        if (this.jkEscT > 0 && --this.jkEscT <= 0) {
            this.jkEsc = Math.min(Math.max(this.jkEscMax, this.jkEsc), this.jkEsc + 1);
            if (this.jkEsc < this.jkEscMax) this.jkEscT = jkFull(this) ? 2700 : 3600;
            addFloatingText(this.x + this.w / 2, this.y + (this.id === 1 ? -20 : this.h + 24), 'THOÁT HIỂM SẴN SÀNG', JK_PURPLE, 11);
        }
        if (this.jkDashT > 0) {
            this.jkDashT--;
            if (!groundedBlock(this)) this.x = Math.max(0, Math.min(canvas.width - this.w, this.x + this.jkDashDir * this.jkDashV));
        }
        jkUpdateBullets(this);
    },
    speed(s) { return s * (this.jkSpdT > 0 ? (this.jkSpdM || 1) : 1); },
    shoot(inp) {
        const s = !!inp.s;
        const released = !s && this.jkPrevS;
        this.jkPrevS = s;
        this.jkMoveDir = inp.l && !inp.r ? -1 : (inp.r && !inp.l ? 1 : 0);
        if (s) {
            this.jkHold++;
            if (this.jkHold === JK_HOLD && !this.jkHoldUsed) {
                this.jkHoldUsed = true;
                if (this.jkSwapCd <= 0) jkSwap(this);
                else addFloatingText(this.x + this.w / 2, this.y + (this.id === 1 ? -16 : this.h + 20), 'TRÁO BÀI ' + Math.ceil(this.jkSwapCd / 60) + 's', '#94a3b8', 10);
            }
        } else if (released) {
            if (!this.jkHoldUsed && this.jkHold < JK_HOLD && this.jkGCD <= 0) jkThrow(this);
            this.jkHold = 0; this.jkHoldUsed = false;
        } else { this.jkHold = 0; this.jkHoldUsed = false; }
        return true;
    },
    beforeLethal() { return jkTryEscape(this); },
});

// Takedamage wrapper: giảm sát thương (copy Sinh Tồn) + kết liễu ALL IN (nối tiếp wrapper sẵn có)
(function () {
    const orig = Player.prototype.takeDamage;
    Player.prototype.takeDamage = function (amount, attacker) {
        if (this.weapon === 'joker' && typeof amount === 'number' && (this.jkDR > 0 || this.jkDR2 > 0)) {
            // copy Sinh Tồn: giảm 25% (Full Evo 35%) + ♦ thêm 15%
            const red = (this.jkDR > 0 ? (jkFull(this) ? 0.35 : 0.25) : 0) + (this.jkDR2 > 0 ? 0.15 : 0);
            arguments[0] = amount * (1 - Math.min(0.6, red));
        }
        const before = this.hp;
        const r = orig.apply(this, arguments);
        if (before > 0 && this.hp <= 0 && attacker && attacker !== this && attacker.weapon === 'joker'
            && typeof bodyEffects !== 'undefined' && !bodyEffects.some(e => e instanceof JkFinisher)) {
            bodyEffects.push(new JkFinisher(attacker, this));
            triggerScreenShake(10, 18);
            spawnSparkParticles(this.x + this.w / 2, this.y + this.h / 2, JK_GOLD, 24);
            jkSfx('playExplosion');
        }
        return r;
    };
})();
