// ==========================================
// Đạn Lớn (big_bullet) — Logic Full Evo (Xuyên Thấu sau khi nảy + Phân Mảnh 360°)
// ------------------------------------------
// Mọi viên đạn của Đạn Lớn mang b.hook = 'big_bullet' (vẽ quả cầu tròn phát sáng, không đuôi).
// Full Evo (evo_big_1 + evo_big_2):
//  1. Evo Bóng Cao Su: nảy tối đa 7 lần (Full Evo 9), càng nảy càng to; nảy đủ -> tự nổ khi tới giữa sân.
//     Full Evo: từ lần nảy thứ 2 đạn hóa Xuyên Thấu (xuyên mọi vật cản, vẫn trúng địch).
//  2. Khi đạn kết thúc (trúng, bị phá, chạm mép, tới giữa sân) -> nổ thành vòng đạn nhỏ 360° (chỉ hại địch).
// ==========================================

const BIG_FRAG_COUNT = 20;
const BIG_FRAG_SPEED = 4.4;
const BIG_FRAG_MAX_HITS = 2;

// Vòng mảnh đạn 360° (giống Thùng Đạn ✸ nhưng chỉ trúng đối thủ của người bắn)
class BigBulletBurst extends CrateBurst {
    constructor(x, y, owner, dmg) {
        super(x, y, owner, true);
        this.dmg = dmg;
        this.life = 150;
        this.ownerSide = owner ? owner.id : 1;
        this.ring = 0; // vòng sóng nổ (hình ảnh)
        this.pellets = [];
        const off = Math.random() * Math.PI * 2 / BIG_FRAG_COUNT;
        for (let i = 0; i < BIG_FRAG_COUNT; i++) {
            const a = off + i * Math.PI * 2 / BIG_FRAG_COUNT;
            this.pellets.push({ x, y, vx: Math.cos(a) * BIG_FRAG_SPEED, vy: Math.sin(a) * BIG_FRAG_SPEED, on: true });
        }
        this.cx = x; this.cy = y;
        this.hits = 0;       // mỗi vòng mảnh trúng địch tối đa BIG_FRAG_MAX_HITS lần
        // Nổ ngay trên người địch (đạn lớn vừa trúng) -> mảnh không trúng lại mục tiêu đó
        const en = owner === p1 ? p2 : p1;
        this.skipEnemy = !!(en && x > en.x - 6 && x < en.x + en.w + 6 && y > en.y - 6 && y < en.y + en.h + 6);
    }
    update() {
        if (!this.active) return;
        this.ring++;
        if (--this.life <= 0) { this.active = false; return; }
        const owner = this.breakerId === 1 ? p1 : (this.breakerId === 2 ? p2 : null);
        const enemy = owner === p1 ? p2 : p1;
        let alive = 0;
        for (const b of this.pellets) {
            if (!b.on) continue;
            b.x += b.vx; b.y += b.vy;
            if (b.x < -10 || b.x > canvas.width + 10 || b.y < -10 || b.y > canvas.height + 10) { b.on = false; continue; }
            // Tường Sniper của đối thủ chặn mảnh đạn
            for (const w of (typeof sniperWalls !== 'undefined' ? sniperWalls : [])) {
                if (w.active && w.owner !== owner && rectIntersect(b.x - 3, b.y - 3, 6, 6, w.x, w.y, w.w, w.h)) {
                    if (typeof w.takeHit === 'function') w.takeHit(this.dmg, owner);
                    b.on = false; break;
                }
            }
            if (!b.on) continue;
            if (!this.skipEnemy && this.hits < BIG_FRAG_MAX_HITS && typeof gmTwinAlso === 'function' && gmTwinAlso(enemy, t => rectIntersect(b.x - 3, b.y - 3, 6, 6, t.x, t.y, t.w, t.h), this.dmg, owner)) { this.hits++; b.on = false; continue; } // Gemini: Bản Sao AI
            if (enemy && enemy.hp > 0 && !this.skipEnemy && this.hits < BIG_FRAG_MAX_HITS && rectIntersect(b.x - 3, b.y - 3, 6, 6, enemy.x, enemy.y, enemy.w, enemy.h)) {
                enemy.takeDamage(this.dmg, owner);
                this.hits++;
                spawnSparkParticles(b.x, b.y, '#ffd166', 6);
                b.on = false;
            }
            if (b.on) alive++;
        }
        if (!alive) this.active = false;
    }
    draw() {
        if (!this.active) return;
        const col = this.ownerSide === 1 ? '#5ad1ff' : '#ff6b6b';
        ctx.save();
        // Vòng sóng nổ ban đầu
        if (this.ring < 16) {
            const k = this.ring / 16;
            ctx.globalAlpha = 1 - k;
            ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.shadowBlur = 14; ctx.shadowColor = col;
            ctx.beginPath(); ctx.arc(this.cx, this.cy, 8 + k * 46, 0, Math.PI * 2); ctx.stroke();
            ctx.globalAlpha = 1;
        }
        // Mảnh đạn: viên tròn nhỏ phát sáng
        ctx.shadowBlur = 10; ctx.shadowColor = col;
        for (const b of this.pellets) {
            if (!b.on) continue;
            ctx.fillStyle = col;
            ctx.beginPath(); ctx.arc(b.x, b.y, 3.6, 0, Math.PI * 2); ctx.fill();
        }
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        for (const b of this.pellets) {
            if (!b.on) continue;
            ctx.beginPath(); ctx.arc(b.x, b.y, 1.5, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    }
}

function bigIsFullEvo(p) { return !!p && p.weapon === 'big_bullet' && hasFullEvo(p, 'big_bullet') && ['1+2', '1+2+3+4'].includes(fullEvoCombo(p, 'big_bullet')); }

// Nổ phân mảnh tại tâm viên đạn
function bigFragment(owner, x, y, bulletDmg) {
    const dmg = Math.max(0.5, (bulletDmg || owner.damage || 2) * 0.35);
    bodyEffects.push(new BigBulletBurst(x, y, owner, dmg));
    explosions.push(new Explosion(x, y, 34, owner.id === 1 ? 'rgba(90, 209, 255,' : 'rgba(255, 107, 107,', 0, owner));
    if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem.playExplosion) soundSystem.playExplosion();
}

// Số lần nảy tối đa (Evo Bóng Cao Su: 7, Full Evo: 9) trước khi đạn tự nổ ở giữa sân
function bigMaxBounce(p, b = {}) { return (p.hasUpgrade('evo_big_2') ? (bigIsFullEvo(p) ? 9 : 7) : 0) + (b.bigExtraBounce || 0); }
// Gọi trong bullets.js mỗi lần đạn nảy tường
function bigOnBounce(b, owner) {
    if (typeof EvoSystem !== 'undefined') EvoSystem.gain(owner, 'bounce', 8);
    // Càng nảy bóng càng to (đã có sẵn tăng to/dame riêng cho Full Evo trong bullets.js)
    if (!b.isFullEvoBig) { b.w = Math.min(56, (b.w || 10) + 3); b.h = Math.min(56, (b.h || 10) + 3); }
    // Full Evo: từ lần nảy thứ 2 đạn hóa Xuyên Thấu (xuyên mọi vật cản), vẫn tiếp tục nảy
    if (b.isFullEvoBig && b.bounceCount >= 2 && !b.bigPierce) { b.bigPierce = true; b.isPiercing = true; }
    // Nảy đủ số lần -> lần chạy tới giữa sân kế tiếp sẽ tự nổ
    if (owner && b.bounceCount >= bigMaxBounce(owner, b)) {
        b.bigFinal = true;
        b.bigMidSide = Math.sign((b.y + b.h / 2) - canvas.height / 2) || 1;
    }
}

// Theo dõi đạn Full Evo (chỉ chạy nơi mô phỏng, không nằm trong state đồng bộ)
const _bigTrack = { 1: [], 2: [] };

CharHooks.register('big_bullet', {
    shoot(inp, now) { return bigHoldShoot(this, inp, now); },
    skill(p) {
        const enemy = p.id === 1 ? p2 : p1;
        let count = 0;
        for (const b of p.bullets) {
            if (b.hook !== 'big_bullet') continue;
            const v = aimVelocity(b.x + b.w / 2, b.y + b.h / 2, enemy, Math.max(3, Math.hypot(b.vx, b.vy)), false);
            b.vx = v.vx; b.vy = v.vy; b.bigExtraBounce = (b.bigExtraBounce || 0) + 1;
            b.bigFinal = false; count++;
        }
        if (!count) return false;
        spawnSparkParticles(p.x + p.w / 2, p.y + p.h / 2, '#facc15', 16);
    },
    ultimate(p) { bodyEffects.push(new BigPlanet(p)); triggerScreenShake(10, 30); },
    draw() { if (this.bigHeld) bigDrawHeld(this); },
    setup() { _bigTrack[this.id] = []; this.bigHeld = null; this.bigHoldWasDown = false; },
    update() {
        if (typeof gameState !== 'undefined' && gameState.phase !== 'playing') return;
        const mid = canvas.height / 2, full = bigIsFullEvo(this);
        bigHoldUpdate(this);
        if (bodyEffects.some(e => e instanceof BigPlanet && e.active && e.side === this.id)) this.ultActiveTicks = 2;
        // 1. Đạn đã nảy đủ số lần chạy tới giữa sân -> tự nổ (Full Evo: nổ phân mảnh ở bước 2)
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            if (b.owner !== this || b.hook !== 'big_bullet') continue;
            const side = Math.sign((b.y + b.h / 2) - mid);
            const reachedMid = b.bigFinal && (side === 0 || side !== b.bigMidSide);
            if (reachedMid || (full && b.bigPierce && b.bigDone)) {
                this.bullets.splice(i, 1);
                if (!full) explosions.push(new Explosion(b.x + b.w / 2, b.y + b.h / 2, Math.max(30, b.w * 1.2), this.id === 1 ? 'rgba(90, 209, 255,' : 'rgba(255, 107, 107,', (b.dmg || 2) * 0.5, this));
            }
        }
        if (!full) { _bigTrack[this.id] = []; return; }
        // 2. Đạn đã theo dõi nhưng không còn -> nổ phân mảnh tại vị trí cuối
        const live = new Set(this.bullets);
        for (const t of _bigTrack[this.id]) {
            if (!live.has(t.b) && t.b.owner === this) bigFragment(this, t.x, t.y, t.b.dmg);
        }
        // 3. Cập nhật danh sách theo dõi
        _bigTrack[this.id] = this.bullets.filter(b => b.isFullEvoBig && b.owner === this).map(b => ({ b, x: Math.max(0, Math.min(canvas.width, b.x + b.w / 2)), y: Math.max(0, Math.min(canvas.height, b.y + b.h / 2)) }));
    },
});

BulletHooks.register('big_bullet', {
    // Xuyên Thấu: trúng địch thì kết thúc (nổ phân mảnh)
    hit(b) { if (b.bigPierce) b.bigDone = true; },
    // Xuyên Thấu: đi xuyên vật cản (tường Sniper địch vẫn chặn — xử lý trước hook này)
    obstacle(b) { if (b.bigPierce) return 'pass'; return undefined; },
    // Quả cầu tròn phát sáng, không đuôi
    draw(b) {
        const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
        const r = Math.max(3, Math.min(b.w, b.h) / 2);
        const col = (b.owner && b.owner.id === 1) ? '#3498db' : '#e74c3c';
        ctx.save();
        ctx.shadowBlur = b.bigPierce ? 22 : 14; ctx.shadowColor = b.bigPierce ? '#e9d5ff' : col;
        const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.15, cx, cy, r);
        g.addColorStop(0, '#ffffff');
        g.addColorStop(0.45, col);
        g.addColorStop(1, b.bigPierce ? '#a855f7' : col);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
        if (b.bigPierce) { // vành sáng nhấp nháy khi đang Xuyên Thấu
            ctx.shadowBlur = 0;
            ctx.strokeStyle = `rgba(233, 213, 255, ${0.55 + 0.35 * Math.sin(Date.now() / 60)})`;
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(cx, cy, r + 3, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.restore();
    },
});

// Evo 3: giữ cầu như một khiên hình học, chỉ lưu số trên Player để host đồng bộ được.
function bigHoldShoot(p, inp, now) {
    if (!FEATURE_EVO34 || !p.hasUpgrade('evo_big_3')) return false;
    if (p.silenceTimer > 0) { p.bigHeld = null; p.bigHoldWasDown = !!inp.s; return true; }
    const down = !!inp.s;
    if (down && !p.bigHoldWasDown && !p.bigHeld && p.ammo > 0 && now - p.lastShot > 500) {
        const large = hasFullEvo(p) && fullEvoCombo(p) === '1+3';
        p.bigHeld = { r: (p.hasUpgrade('evo_big_1') ? 23 : 16) * (large ? 1.5 : 1), eaten: 0 };
        p.ammo--; p.lastShot = now;
    }
    if (!down && p.bigHeld) {
        const held = p.bigHeld;
        const start = p.bullets.length;
        p.fireBullet(1 + Math.min(0.5, held.eaten * 0.05));
        const b = p.bullets[start];
        if (b) {
            b.w = b.h = held.r * 2; b.x = p.x + p.w / 2 - held.r;
            b.y = p.id === 1 ? p.y - b.h : p.y + p.h;
            if (hasFullEvo(p) && fullEvoCombo(p) === '2+3') b.bigExtraBounce = held.eaten;
        }
        p.bigHeld = null; p.lastShot = now;
    }
    p.bigHoldWasDown = down;
    return true;
}
function bigHeldCenter(p) { return { x: p.x + p.w / 2, y: p.id === 1 ? p.y - p.bigHeld.r : p.y + p.h + p.bigHeld.r }; }
function bigHoldUpdate(p) {
    if (!p.bigHeld) return;
    const en = p.id === 1 ? p2 : p1, c = bigHeldCenter(p);
    for (let i = en.bullets.length - 1; i >= 0; i--) {
        const b = en.bullets[i];
        if (Math.hypot(b.x + b.w / 2 - c.x, b.y + b.h / 2 - c.y) <= p.bigHeld.r + Math.max(b.w, b.h) / 2) {
            en.bullets.splice(i, 1); p.bigHeld.eaten++; p.bigHeld.r = Math.min(canvas.width / 5, p.bigHeld.r + 2);
            EvoSystem.gain(p, 'absorb', 15); spawnSparkParticles(c.x, c.y, '#38bdf8', 5);
        }
    }
}
function bigDrawHeld(p) {
    const c = bigHeldCenter(p), r = p.bigHeld.r;
    ctx.save(); ctx.shadowColor = p.color; ctx.shadowBlur = 18; ctx.fillStyle = p.color;
    ctx.globalAlpha = 0.7; ctx.beginPath(); ctx.arc(c.x, c.y, r, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1; ctx.strokeStyle = '#e0f2fe'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
}

// Tuyệt Kỹ: đi ngang làn địch, hút nhẹ, ăn đạn; tổng sát thương trực tiếp/mảnh có ngân sách.
class BigPlanet {
    constructor(owner) {
        this.side = owner.id; this.r = canvas.width / 6; this.x = -this.r;
        const enemy = owner.id === 1 ? p2 : p1;
        this.y = enemy.y + enemy.h / 2; this.vx = (canvas.width + this.r * 2) / 180;
        this.active = true; this.life = 900; this.hit = false; this.bounces = 0;
        this.maxBounces = hasFullEvo(owner) && fullEvoCombo(owner) === '1+2+3+4' ? 3 : 0;
        this.damageBudget = Math.min(owner.damage * 3, enemy.maxHp * 0.55);
    }
    update() {
        if (!this.active) return;
        const owner = this.side === 1 ? p1 : p2, enemy = this.side === 1 ? p2 : p1;
        this.x += this.vx;
        enemy.x = Math.max(0, Math.min(canvas.width - enemy.w, enemy.x + Math.max(-0.35, Math.min(0.35, (this.x - enemy.x - enemy.w / 2) * 0.003))));
        for (let i = enemy.bullets.length - 1; i >= 0; i--) {
            const b = enemy.bullets[i];
            if (Math.hypot(b.x - this.x, b.y - this.y) < this.r) { enemy.bullets.splice(i, 1); this.r = Math.min(canvas.width / 4, this.r + 1.5); }
        }
        if (!this.hit && Math.hypot(enemy.x + enemy.w / 2 - this.x, enemy.y + enemy.h / 2 - this.y) < this.r + enemy.w / 2) {
            this.hit = true; enemy.takeDamage(this.damageBudget * 0.65, owner); triggerScreenShake(12, 20);
        }
        const edge = this.vx > 0 ? this.x >= canvas.width - this.r : this.x <= this.r;
        if (edge && (this.vx < 0 || this.x > canvas.width / 2)) {
            if (this.bounces < this.maxBounces) { this.vx *= -1; this.bounces++; }
            else this.finish(owner);
        }
        if (--this.life <= 0) this.finish(owner);
    }
    finish(owner) {
        if (!this.active) return;
        this.active = false;
        bodyEffects.push(new BigBulletBurst(this.x, this.y, owner, this.damageBudget * 0.15));
        explosions.push(new Explosion(this.x, this.y, this.r, 'rgba(251,146,60,', 0, owner));
    }
    draw() {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(this.x, this.y + 20, this.r * 1.2, this.r * 0.5, 0, 0, Math.PI * 2); ctx.fill();
        const g = ctx.createRadialGradient(this.x - this.r / 3, this.y - this.r / 3, 2, this.x, this.y, this.r);
        g.addColorStop(0, '#fff7d6'); g.addColorStop(.5, this.side === 1 ? '#38bdf8' : '#fb7185'); g.addColorStop(1, '#312e81');
        ctx.shadowBlur = 25; ctx.shadowColor = '#fb923c'; ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#facc15'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
    }
}
