// ==========================================
// Thực thể hiệu ứng dùng chung cho các body mới
// (vùng mặt đất, khối đá chắn, kiếm trời giáng, cảnh báo hitscan)
// Tất cả nằm trong mảng toàn cục `bodyEffects`, cập nhật ở physics, vẽ ở render.
// ==========================================

let bodyEffects = [];

// --- Vùng hiệu ứng mặt đất ---
// kind: fire | acid | ice | silence | root | mud | spikes | drain
const ZONE_STYLE = {
    fire: ['rgba(255, 90, 20, 0.22)', '#ff6a1a'],
    acid: ['rgba(120, 255, 60, 0.20)', '#7bf85c'],
    ice: ['rgba(80, 220, 255, 0.20)', '#5ee7ff'],
    silence: ['rgba(150, 90, 255, 0.20)', '#a78bfa'],
    root: ['rgba(46, 204, 113, 0.20)', '#2ecc71'],
    mud: ['rgba(120, 85, 50, 0.32)', '#a0522d'],
    spikes: ['rgba(200, 200, 210, 0.16)', '#cbd5e1'],
    drain: ['rgba(30, 180, 120, 0.22)', '#10b981'],
};

class BodyZone {
    constructor(x, y, r, kind, owner, lifeTicks = 180, power = 1) {
        this.x = x; this.y = y; this.r = r; this.kind = kind; this.owner = owner;
        this.life = lifeTicks; this.maxLife = lifeTicks; this.power = power;
        this.active = true;
        this.insideTicks = 0; // cho Trói Chân (root)
        zoneFit(this);
    }
    update() {
        if (!this.active) return;
        if (--this.life <= 0) { this.active = false; return; }
        // Vũng Axit: ăn mòn vật thể (x10 sát thương + 50% Max HP mỗi giây); Bình Phun đốt xe nhanh gấp đôi
        if (this.kind === 'acid' && typeof acidZoneTickObjects === 'function') {
            acidZoneTickObjects(this.owner,
                (o) => Math.abs(o.x + o.w / 2 - this.x) < this.r * ZONE_AX + o.w / 2 && Math.abs(o.y + o.h / 2 - this.y) < this.r * ZONE_AY + o.h / 2,
                0.25 * this.power / 30, (this.maxLife - this.life) % 60 === 1, this.owner && this.owner.weapon === 'sprayer' ? 2 : 1);
        }
        const enemy = this.owner === p1 ? p2 : p1;
        if (!enemy || enemy.hp <= 0) return;
        const inside = Math.abs(enemy.x + enemy.w / 2 - this.x) < this.r * ZONE_AX + enemy.w / 2 && Math.abs(enemy.y + enemy.h / 2 - this.y) < this.r * ZONE_AY + enemy.h / 2;
        if (!inside) { this.insideTicks = 0; return; }
        this.insideTicks++;
        const pw = this.power;
        switch (this.kind) {
            case 'fire':
                if (this.life % 30 === 0) enemy.takeDamage(0.25 * pw, this.owner, { isEnvironmental: true });
                break;
            case 'acid':
                addStatusVuln(enemy, 0.25 * pw);
                if (this.life % 30 === 0) enemy.takeDamage(Math.max(0.03, enemy.maxHp * 0.0125 * 0.5 * pw), this.owner, { isEnvironmental: true });
                break;
            case 'ice':
                addStatusSlow(enemy, Math.max(0.25, 1 - 0.5 * pw));
                break;
            case 'silence':
                enemy.silenceTimer = Math.max(enemy.silenceTimer || 0, 10);
                break;
            case 'root':
                addStatusSlow(enemy, 0.55);
                if (this.insideTicks === Math.round(90 / pw)) {
                    enemy.freezeTimer = Math.max(enemy.freezeTimer || 0, 60);
                    addFloatingText(enemy.x + enemy.w / 2, enemy.y - 14, 'TRÓI CHÂN! 🌿', '#2ecc71', 13);
                }
                break;
            case 'mud':
                addStatusSlow(enemy, 0.3);
                break;
            case 'spikes':
                if (this.insideTicks % 40 === 1) {
                    enemy.bleedTimer = Math.max(enemy.bleedTimer || 0, 60);
                    enemy.bleedDmg = Math.max(0.05, enemy.maxHp * 0.02 * pw);
                }
                break;
            case 'drain':
                addStatusSlow(enemy, 0.55);
                if (this.life % 30 === 0) {
                    const d = enemy.takeDamage(0.15 * pw, this.owner, { isEnvironmental: true });
                    if (d > 0) this.owner.hp = Math.min(this.owner.maxHp, this.owner.hp + d);
                }
                break;
        }
    }
    draw() {
        if (!this.active) return;
        const [fill, line] = ZONE_STYLE[this.kind] || ZONE_STYLE.fire;
        const k = Math.min(1, this.life / 30);
        ctx.save();
        ctx.globalAlpha = k;
        ctx.fillStyle = fill;
        zoneRectPath(this.x, this.y, this.r); ctx.fill();
        ctx.strokeStyle = line; ctx.lineWidth = 1.5; ctx.setLineDash([5, 5]);
        ctx.lineDashOffset = -(this.maxLife - this.life) * 0.5;
        ctx.stroke(); ctx.setLineDash([]);
        if (this.kind === 'spikes') {
            ctx.fillStyle = line;
            for (let i = 0; i < 6; i++) {
                const a = i * 1.05 + this.x * 0.01, rr = this.r * 0.6;
                const sx = this.x + Math.cos(a) * rr, sy = this.y + Math.sin(a) * rr * 0.6;
                ctx.beginPath(); ctx.moveTo(sx - 3, sy + 3); ctx.lineTo(sx, sy - 5); ctx.lineTo(sx + 3, sy + 3); ctx.fill();
            }
        }
        ctx.restore();
    }
}

// --- Khối đá chắn (Thổ): chặn đạn đối thủ & chặn đường đi trên làn ---
class StoneBlock {
    constructor(x, y, owner, hp = 3, lifeTicks = 360, isLava = false) {
        this.w = 26; this.h = 18;
        this.x = Math.max(0, Math.min(canvas.width - this.w, x - this.w / 2));
        this.y = Math.max(0, Math.min(canvas.height - this.h, y - this.h / 2));
        this.owner = owner; this.hp = hp; this.maxHp = hp;
        this.life = lifeTicks; this.active = true; this.isStone = true; this.isLava = isLava;
    }
    update() {
        if (!this.active) return;
        if (--this.life <= 0 || this.hp <= 0) { this.active = false; explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 26, '#8d6e63', 0, this.owner)); }
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.fillStyle = this.isLava ? '#7a2a10' : '#6d4c41';
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.strokeStyle = this.isLava ? '#ff7a2a' : '#bcaaa4';
        ctx.lineWidth = 2; ctx.strokeRect(this.x, this.y, this.w, this.h);
        ctx.fillStyle = this.isLava ? '#ffb347' : '#a1887f';
        ctx.fillRect(this.x + 4, this.y + 4, 6, 4); ctx.fillRect(this.x + 15, this.y + 9, 7, 4);
        ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(this.x, this.y - 4, this.w, 2);
        ctx.fillStyle = '#d7ccc8'; ctx.fillRect(this.x, this.y - 4, this.w * Math.max(0, this.hp / this.maxHp), 2);
        ctx.restore();
    }
}

// --- Đại kiếm từ trời (Vân Tinh Vũ): cảnh báo 2s rồi giáng AoE ---
class SkyStrike {
    constructor(x, y, owner, dmg = 2, radius = 48, delayTicks = 120) {
        this.x = x; this.y = y; this.owner = owner; this.dmg = dmg; this.r = radius;
        this.delay = delayTicks; this.maxDelay = delayTicks; this.fall = 0; this.active = true;
    }
    update() {
        if (!this.active) return;
        if (this.delay > 0) { this.delay--; if (this.delay === 0) this.strike(); return; }
        if (++this.fall > 20) this.active = false;
    }
    strike() {
        const enemy = this.owner === p1 ? p2 : p1;
        if (enemy && Math.hypot(enemy.x + enemy.w / 2 - this.x, enemy.y + enemy.h / 2 - this.y) < this.r + enemy.w / 2) {
            enemy.takeDamage(this.dmg, this.owner);
        }
        explosions.push(new Explosion(this.x, this.y, this.r + 10, 'gold', 0, this.owner));
        triggerScreenShake(5, 8);
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        if (this.delay > 0) {
            const k = 1 - this.delay / this.maxDelay;
            ctx.strokeStyle = `rgba(255, 50, 50, ${0.4 + 0.5 * k})`;
            ctx.fillStyle = `rgba(255, 60, 60, ${0.08 + 0.2 * k})`;
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.arc(this.x, this.y, this.r * k, 0, Math.PI * 2); ctx.stroke();
            drawGlowingSword(this.x - 9, this.y - 140 + k * 100, 18, 60, '#ffd700', 1);
        } else {
            ctx.globalAlpha = 1 - this.fall / 20;
            drawGlowingSword(this.x - 10, this.y - 50, 20, 64, '#ffd700', 1);
        }
        ctx.restore();
    }
}

// --- Cảnh báo tia hitscan 0.25s rồi bắn trúng tức thì ---
class HitscanTelegraph {
    constructor(owner, x, dmg, color = '#ff2244', delayTicks = 15, onFire = null) {
        this.owner = owner; this.x = x; this.dmg = dmg; this.color = color;
        this.delay = delayTicks; this.maxDelay = delayTicks; this.flash = 0; this.active = true;
        this.onFire = onFire; // tên hook BulletHooks (chuỗi) để áp hiệu ứng khi trúng
    }
    update() {
        if (!this.active) return;
        if (this.delay > 0) {
            // Cột cảnh báo khoá tại chỗ (không bám theo nòng) -> đối thủ né được
            if (--this.delay === 0) this.fire();
            return;
        }
        if (++this.flash > 8) this.active = false;
    }
    fire() {
        const enemy = this.owner === p1 ? p2 : p1;
        const o = this.owner, swDir = o.id === 1 ? -1 : 1;
        const swW = (typeof sniperWallBlockY === 'function') ? sniperWallBlockY(o, this.x, o.id === 1 ? o.y : o.y + o.h, swDir, 2, this.dmg) : null; // Tường Sniper chặn tia
        if (swW) this.stopY = sniperWallStopY(swW, swDir);
        else if (enemy && enemy.hp > 0 && this.x > enemy.x - 4 && this.x < enemy.x + enemy.w + 4) {
            const d = enemy.takeDamage(this.dmg, this.owner);
            if (this.onFire) BulletHooks.call({ hook: this.onFire, x: this.x, y: enemy.y + enemy.h / 2, owner: this.owner, isHitscan: true }, 'hit', this.owner, enemy, d);
        }
        if (soundSystem && !soundSystem.muted) soundSystem.playLaser();
    }
    draw() {
        if (!this.active) return;
        const top = this.owner.id === 1 ? (this.stopY != null ? this.stopY : 0) : this.owner.y + this.owner.h;
        const bot = this.owner.id === 1 ? this.owner.y : (this.stopY != null ? this.stopY : canvas.height);
        ctx.save();
        if (this.delay > 0) {
            ctx.strokeStyle = 'rgba(255, 40, 60, 0.75)'; ctx.lineWidth = 1.5; ctx.setLineDash([6, 4]);
            ctx.beginPath(); ctx.moveTo(this.x, top); ctx.lineTo(this.x, bot); ctx.stroke();
        } else {
            ctx.globalAlpha = 1 - this.flash / 8;
            ctx.strokeStyle = this.color; ctx.lineWidth = 5; ctx.shadowBlur = 14; ctx.shadowColor = this.color;
            ctx.beginPath(); ctx.moveTo(this.x, top); ctx.lineTo(this.x, bot); ctx.stroke();
        }
        ctx.restore();
    }
}

// Khối đá trên làn chặn đường đi của đối thủ (gọi sau khi người chơi di chuyển)
function resolveStoneBlocking(p, prevX) {
    for (const s of bodyEffects) {
        if (!s.active || !s.isStone || s.owner === p) continue;
        if (rectIntersect(p.x, p.y, p.w, p.h, s.x, s.y, s.w, s.h)) {
            p.x = (prevX + p.w / 2 < s.x + s.w / 2) ? s.x - p.w : s.x + s.w;
            p.x = Math.max(0, Math.min(canvas.width - p.w, p.x));
        }
    }
}
