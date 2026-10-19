// ==========================================
// Kiếm Tôn (blade_god) — Thực thể riêng: Quang Kiếm / Ám Kiếm
// ------------------------------------------
// BgLightSword  : Quang Kiếm lơ lửng tại chỗ, cột ngắm 2s rồi tự phóng tia hitscan
// BgDarkHover   : Ám Kiếm lơ lửng 2s (Full Evo) rồi tự phóng về phía địch
// BgBlackHole   : Hố đen của Ám Kiếm (Evo 2): hút mạnh rồi hút yếu về tâm
// BgGuardian    : Quang Kiếm Loạn Ảnh (Evo 1): bay quanh chủ, lao tới chém mọi đạn địch
// BgSkySword    : Ám Kiếm Tuyệt Diệt (Evo 2): kiếm cảnh báo rồi giáng xuống (kiếm khổng lồ cắm 2s, hút + gây dame)
// Tất cả nằm trong bodyEffects (đã thêm vào NET_CLASSES), trạng thái chỉ là số/chuỗi.
// ==========================================

function bgFull(p) { return p.hasUpgrade('evo_blade_1') && p.hasUpgrade('evo_blade_2'); }
function bgEnemy(p) { return p === p1 ? p2 : p1; }

// Vẽ 1 thanh kiếm vector, mũi hướng theo góc `ang`, tâm (x,y), dài L, bản rộng W
// style: 'light' (Quang Kiếm vàng/trắng) | 'dark' (Ám Kiếm đen/tím)
function bgDrawSword(x, y, ang, L, W, style, alpha = 1) {
    const light = style === 'light';
    const glow = light ? '#ffd84d' : '#b026ff';
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    ctx.globalAlpha *= alpha;
    const h = L / 2;
    const guardX = -h + L * 0.24;
    // Lưỡi kiếm
    ctx.shadowBlur = light ? 18 : 16; ctx.shadowColor = glow;
    const g = ctx.createLinearGradient(guardX, 0, h, 0);
    if (light) { g.addColorStop(0, '#fff3b0'); g.addColorStop(0.6, '#ffffff'); g.addColorStop(1, '#fffbe6'); }
    else { g.addColorStop(0, '#2a0838'); g.addColorStop(0.6, '#0b0410'); g.addColorStop(1, '#1a0526'); }
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(guardX, -W / 2);
    ctx.lineTo(h - L * 0.16, -W / 2);
    ctx.lineTo(h, 0);
    ctx.lineTo(h - L * 0.16, W / 2);
    ctx.lineTo(guardX, W / 2);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = light ? 1.2 : 1.6;
    ctx.strokeStyle = light ? '#ffcc33' : '#c86bff';
    ctx.stroke();
    // Rãnh máu giữa lưỡi
    ctx.shadowBlur = 8;
    ctx.strokeStyle = light ? 'rgba(255, 190, 40, 0.9)' : '#e879f9';
    ctx.lineWidth = Math.max(1, W * 0.18);
    ctx.beginPath(); ctx.moveTo(guardX + 2, 0); ctx.lineTo(h - L * 0.2, 0); ctx.stroke();
    // Chắn kiếm
    ctx.shadowBlur = 10;
    ctx.fillStyle = light ? '#ffb000' : '#4c1d95';
    ctx.strokeStyle = light ? '#fff1a8' : '#a855f7';
    ctx.lineWidth = 1;
    const gw = Math.max(3, L * 0.07), gh = W * 2.3;
    ctx.beginPath();
    ctx.moveTo(guardX - gw / 2, -gh / 2); ctx.lineTo(guardX + gw / 2, -gh / 2 + 2);
    ctx.lineTo(guardX + gw / 2, gh / 2 - 2); ctx.lineTo(guardX - gw / 2, gh / 2);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    // Ngọc giữa chắn
    ctx.fillStyle = light ? '#ffffff' : '#f0abfc';
    ctx.beginPath(); ctx.arc(guardX, 0, Math.max(1.5, W * 0.22), 0, Math.PI * 2); ctx.fill();
    // Chuôi + quả chuôi
    ctx.shadowBlur = 4;
    ctx.fillStyle = light ? '#b7791f' : '#1e1b2e';
    ctx.fillRect(-h + L * 0.06, -W * 0.22, guardX - gw / 2 - (-h + L * 0.06), W * 0.44);
    ctx.fillStyle = light ? '#ffd84d' : '#9333ea';
    ctx.beginPath(); ctx.arc(-h + L * 0.05, 0, Math.max(2, W * 0.3), 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}

// Vòng nạp quanh kiếm (0 -> 1)
function bgChargeRing(x, y, r, k, color) {
    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.shadowBlur = 10; ctx.shadowColor = color;
    ctx.globalAlpha = 0.85;
    ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); ctx.stroke();
    ctx.globalAlpha = 0.25;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
}

// Ám Kiếm bay (đạn) — hook 'bg_dark'
function bgSpawnDark(owner, x, y, vx, vy, dmg) {
    return spawnBullet(owner, { x: x - 6, y: y - 17, w: 12, h: 34, vx, vy, dmg, hook: 'bg_dark' });
}
function bgDarkImpact(b, owner, x, y) {
    if (!owner || owner.weapon !== 'blade_god') return;
    explosions.push(new Explosion(x, y, 50, 'purple', 0.5, owner));
    voidZones.push(new VoidZone(x, y, 50, 100, owner)); // Câm lặng như Hư Vô cũ
    if (owner.hasUpgrade('evo_blade_2')) bodyEffects.push(new BgBlackHole(x, y, owner, bgFull(owner)));
}
BulletHooks.register('bg_dark', {
    hit(b, owner, victim) { bgDarkImpact(b, owner, victim.x + victim.w / 2, victim.y + victim.h / 2); },
    edge(b, owner) {
        const e = bgEnemy(owner);
        const x = Math.max(10, Math.min(canvas.width - 10, b.x + b.w / 2));
        bgDarkImpact(b, owner, x, e ? e.y + e.h / 2 : b.y); // chạm mép sau lưng địch -> nổ trên làn địch
    },
    obstacle(b, owner) { bgDarkImpact(b, owner, b.x + b.w / 2, b.y + b.h / 2); },
    draw(b) {
        const ang = Math.atan2(b.vy, b.vx);
        const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
        ctx.save();
        // Vệt khói tím phía sau
        const sp = Math.hypot(b.vx, b.vy) || 1;
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.35)'; ctx.lineWidth = 8; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(cx - b.vx / sp * 14, cy - b.vy / sp * 14); ctx.lineTo(cx - b.vx / sp * 34, cy - b.vy / sp * 34); ctx.stroke();
        ctx.restore();
        bgDrawSword(cx, cy, ang, 38, 9, 'dark');
    },
});

// --- Quang Kiếm lơ lửng: ngắm 2s rồi phóng tia ---
class BgLightSword {
    constructor(owner, x, y, dmg, delay = 120, scale = 1) {
        this.owner = owner; this.x = x; this.y = y; this.dmg = dmg;
        this.delay = delay; this.maxDelay = delay; this.scale = scale;
        this.t = 0; this.fired = 0; this.active = true;
    }
    dirY() { return this.owner.id === 1 ? -1 : 1; }
    tipY() { return this.y + this.dirY() * 22 * this.scale; }
    update() {
        if (!this.active) return;
        this.t++;
        if (this.fired) { if (--this.fired <= 0) this.active = false; return; }
        if (--this.delay <= 0) {
            const o = this.owner;
            if (gameState.phase === 'playing' && o.hp > 0) {
                o.fireAnhMinhHitscan(this.dmg, false, '#ffd84d', this.x, this.tipY());
                spawnSparkParticles(this.x, this.tipY(), '#ffe680', 6);
            }
            this.fired = 10;
        }
    }
    // Bot: cột nguy hiểm theo trục X
    botThreat(bot) { return this.fired ? null : { t: Math.max(1, this.delay), x: this.x, half: 15 + bot.w / 2 + 4, w: 3 }; }
    draw() {
        if (!this.active) return;
        const d = this.dirY(), k = 1 - this.delay / this.maxDelay;
        const end = d < 0 ? 0 : canvas.height;
        const tip = this.tipY();
        ctx.save();
        if (!this.fired) {
            // Cột ngắm: mờ vàng, nửa giây cuối chuyển đỏ & nhấp nháy
            const late = this.delay <= 30;
            const col = late ? '255, 70, 70' : '255, 216, 77';
            ctx.globalAlpha = (late ? ((this.delay >> 2) % 2 ? 0.5 : 1) : 0.6) * (0.4 + 0.6 * k);
            ctx.fillStyle = `rgba(${col}, 0.12)`;
            ctx.fillRect(this.x - 15, Math.min(tip, end), 30, Math.abs(end - tip));
            ctx.strokeStyle = `rgba(${col}, 0.8)`; ctx.lineWidth = 1.2; ctx.setLineDash([6, 5]);
            ctx.lineDashOffset = this.t * (d < 0 ? 1 : -1);
            ctx.beginPath(); ctx.moveTo(this.x - 15, tip); ctx.lineTo(this.x - 15, end); ctx.moveTo(this.x + 15, tip); ctx.lineTo(this.x + 15, end); ctx.stroke();
            ctx.setLineDash([]);
            ctx.globalAlpha = 1;
            const bob = Math.sin(this.t * 0.15) * 2;
            bgChargeRing(this.x, this.y + bob, 17 * this.scale, k, late ? '#ff5252' : '#ffd84d');
            bgDrawSword(this.x, this.y + bob, d < 0 ? -Math.PI / 2 : Math.PI / 2, 40 * this.scale, 8 * this.scale, 'light');
        } else {
            ctx.globalAlpha = this.fired / 10;
            bgDrawSword(this.x, this.y + d * (10 - this.fired) * 3, d < 0 ? -Math.PI / 2 : Math.PI / 2, 40 * this.scale, 8 * this.scale, 'light');
        }
        ctx.restore();
    }
}

// --- Ám Kiếm lơ lửng (Full Evo): xoay theo địch 2s rồi phóng ---
class BgDarkHover {
    constructor(owner, x, y, dmg, delay = 120) {
        this.owner = owner; this.x = x; this.y = y; this.dmg = dmg;
        this.delay = delay; this.maxDelay = delay; this.ang = owner.id === 1 ? -Math.PI / 2 : Math.PI / 2;
        this.t = 0; this.active = true; this.ax = x; this.ay = y;
    }
    update() {
        if (!this.active) return;
        this.t++;
        const e = bgEnemy(this.owner);
        if (e) {
            const v = aimVelocity(this.x, this.y, e, 7, this.delay < 40);
            this.ang = v.angle;
            if (this.delay > 30) { this.ax = e.x + e.w / 2; this.ay = e.y + e.h / 2; } // khoá hướng nửa giây cuối
            if (--this.delay <= 0) {
                if (gameState.phase === 'playing' && this.owner.hp > 0) {
                    const L = Math.hypot(this.ax - this.x, this.ay - this.y) || 1, sp = 7;
                    bgSpawnDark(this.owner, this.x, this.y, (this.ax - this.x) / L * sp, (this.ay - this.y) / L * sp, this.dmg);
                }
                this.active = false;
            }
        } else this.active = false;
    }
    draw() {
        if (!this.active) return;
        const k = 1 - this.delay / this.maxDelay;
        ctx.save();
        if (this.delay <= 30) {
            ctx.strokeStyle = 'rgba(217, 70, 239, 0.7)'; ctx.lineWidth = 1.5; ctx.setLineDash([5, 5]);
            ctx.beginPath(); ctx.moveTo(this.x, this.y); ctx.lineTo(this.ax, this.ay); ctx.stroke();
            ctx.setLineDash([]);
        }
        const bob = Math.sin(this.t * 0.17) * 2;
        bgChargeRing(this.x, this.y + bob, 17, k, '#c026d3');
        bgDrawSword(this.x, this.y + bob, this.ang, 38, 9, 'dark');
        ctx.restore();
    }
}

// --- Hố đen Ám Kiếm (Evo 2) ---
class BgBlackHole {
    constructor(x, y, owner, big = false) {
        this.x = x; this.y = y; this.owner = owner;
        this.r = big ? 135 : 110;
        this.life = big ? 170 : 150; this.maxLife = this.life;
        this.strong = 50; // tick hút mạnh đầu tiên
        this.pullS = big ? 3.0 : 2.4; this.pullW = big ? 1.0 : 0.75;
        this.t = 0; this.active = true;
    }
    update() {
        if (!this.active) return;
        this.t++;
        if (--this.life <= 0) { this.active = false; return; }
        const e = bgEnemy(this.owner);
        if (!e || e.hp <= 0) return;
        const ex = e.x + e.w / 2, dx = this.x - ex;
        if (Math.abs(e.y + e.h / 2 - this.y) > 70 || Math.abs(dx) > this.r) return;
        const pull = this.t <= this.strong ? this.pullS : this.pullW;
        e.x += Math.sign(dx) * Math.min(Math.abs(dx), pull);
        e.x = Math.max(0, Math.min(canvas.width - e.w, e.x));
        if (Math.abs(dx) < 24 && this.t % 30 === 0) e.takeDamage(0.15, this.owner, { isEnvironmental: true });
    }
    botThreat(bot) {
        if (Math.abs(bot.y + bot.h / 2 - this.y) > 70) return null;
        return { t: 1, x: this.x, half: 30 + bot.w / 2, w: 1.5 };
    }
    draw() {
        if (!this.active) return;
        const strong = this.t <= this.strong;
        const fade = Math.min(1, this.life / 20, this.t / 8);
        const core = (strong ? 20 : 15);
        ctx.save();
        ctx.globalAlpha = fade;
        // Quầng hút trên làn
        const g = ctx.createRadialGradient(this.x, this.y, core, this.x, this.y, this.r);
        g.addColorStop(0, 'rgba(147, 51, 234, 0.35)'); g.addColorStop(1, 'rgba(147, 51, 234, 0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.ellipse(this.x, this.y, this.r, 60, 0, 0, Math.PI * 2); ctx.fill();
        // Đường xoáy hút vào
        ctx.strokeStyle = strong ? 'rgba(232, 121, 249, 0.75)' : 'rgba(192, 132, 252, 0.45)';
        ctx.lineWidth = 1.5; ctx.shadowBlur = 8; ctx.shadowColor = '#d946ef';
        for (let i = 0; i < 6; i++) {
            const a = i * Math.PI / 3 + this.t * (strong ? 0.12 : 0.05);
            const rr = core + ((this.t * (strong ? 3 : 1.2) + i * 17) % (this.r * 0.8));
            const rOuter = this.r * 0.8 - (rr - core);
            ctx.beginPath();
            ctx.ellipse(this.x, this.y, Math.max(2, rOuter), Math.max(2, rOuter * 0.5), 0, a, a + 0.9);
            ctx.stroke();
        }
        // Vành bồi tụ + lõi đen
        ctx.shadowBlur = 18;
        ctx.strokeStyle = '#e879f9'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse(this.x, this.y, core * 1.45, core * 0.75, Math.sin(this.t * 0.05) * 0.2, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#000000'; ctx.shadowColor = '#7e22ce';
        ctx.beginPath(); ctx.arc(this.x, this.y, core, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(this.x, this.y, core + 1, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
    }
}

// --- Quang Kiếm Loạn Ảnh (Evo 1): kiếm VIP bay quanh chủ, lao tới chém đạn địch ---
class BgGuardian {
    constructor(owner, life = 180, phase = 0) {
        this.owner = owner; this.life = life; this.maxLife = life;
        this.orbit = phase; this.t = 0;
        this.x = owner.x + owner.w / 2; this.y = owner.y + owner.h / 2;
        this.ang = 0; this.trail = []; this.cuts = 0; this.active = true;
    }
    update() {
        if (!this.active) return;
        this.t++;
        const o = this.owner;
        if (--this.life <= 0 || o.hp <= 0) { this.active = false; spawnSparkParticles(this.x, this.y, '#ffd84d', 6); return; }
        const ocx = o.x + o.w / 2, ocy = o.y + o.h / 2;
        const e = bgEnemy(o);
        // Tìm viên đạn địch gần nhất trong tầm canh giữ
        let best = -1, bd = 1e9;
        if (e && e.bullets) {
            for (let j = 0; j < e.bullets.length; j++) {
                const b = e.bullets[j];
                if (!b) continue;
                const bx = b.x + (b.w || 6) / 2, by = b.y + (b.h || 6) / 2;
                if (Math.hypot(bx - ocx, by - ocy) > 190) continue;
                const d = Math.hypot(bx - this.x, by - this.y);
                if (d < bd) { bd = d; best = j; }
            }
        }
        let tx, ty, sp;
        if (best >= 0) {
            const b = e.bullets[best];
            tx = b.x + (b.w || 6) / 2; ty = b.y + (b.h || 6) / 2; sp = 22;
        } else {
            this.orbit += 0.11;
            tx = ocx + Math.cos(this.orbit) * 44; ty = ocy + Math.sin(this.orbit) * 30; sp = 12;
        }
        const dx = tx - this.x, dy = ty - this.y, d = Math.hypot(dx, dy) || 1;
        const step = Math.min(d, sp);
        this.x += dx / d * step; this.y += dy / d * step;
        if (d > 1) this.ang = Math.atan2(dy, dx);
        if (best >= 0 && d <= sp + 14) {
            e.bullets.splice(best, 1); // Chém tan đạn
            this.cuts++;
            fxSlashHit(tx, ty, '#ffd84d', 16);
            spawnSparkParticles(tx, ty, '#fff3b0', 5);
        }
        this.trail.push(Math.round(this.x), Math.round(this.y));
        if (this.trail.length > 20) this.trail.splice(0, 2);
    }
    draw() {
        if (!this.active) return;
        const o = this.owner;
        const fade = Math.min(1, this.life / 20);
        ctx.save();
        ctx.globalAlpha = fade;
        // Vòng canh giữ quanh chủ
        ctx.strokeStyle = 'rgba(255, 216, 77, 0.25)'; ctx.lineWidth = 1; ctx.setLineDash([4, 6]);
        ctx.lineDashOffset = -this.t;
        ctx.beginPath(); ctx.ellipse(o.x + o.w / 2, o.y + o.h / 2, 44, 30, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
        // Vệt sáng
        const t = this.trail;
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        for (let i = 2; i < t.length; i += 2) {
            ctx.globalAlpha = fade * (i / t.length) * 0.7;
            ctx.strokeStyle = '#ffd84d'; ctx.lineWidth = 2 + 6 * (i / t.length);
            ctx.beginPath(); ctx.moveTo(t[i - 2], t[i - 1]); ctx.lineTo(t[i], t[i + 1]); ctx.stroke();
        }
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = fade;
        bgDrawSword(this.x, this.y, this.ang, 46, 10, 'light');
        ctx.restore();
    }
}

// --- Ám Kiếm Tuyệt Diệt (Evo 2): kiếm rơi có cảnh báo; kiếm khổng lồ cắm lại hút + gây dame ---
class BgSkySword {
    constructor(owner, pre, warn, giant, big = false) {
        this.owner = owner; this.pre = pre; this.warn = warn; this.maxWarn = warn;
        this.giant = giant; this.big = big;
        this.r = giant ? (big ? 70 : 54) : 24;
        this.dmg = giant ? (big ? 1.8 : 1.5) : 0.4;
        this.plant = giant ? 120 : 0; this.maxPlant = this.plant;
        this.pull = big ? 2.0 : 1.5;
        this.x = 0; this.y = 0; this.fall = 0; this.fade = 0; this.t = 0;
        this.state = 'pre'; this.active = true;
    }
    update() {
        if (!this.active) return;
        this.t++;
        const e = bgEnemy(this.owner);
        if (this.state === 'pre') {
            if (--this.pre > 0) return;
            if (!e) { this.active = false; return; }
            const pt = laneTargetPoint(e, this.giant ? 30 : 85);
            this.x = pt.x; this.y = pt.y; this.state = 'warn';
            return;
        }
        if (this.state === 'warn') {
            if (--this.warn <= 0) { this.state = 'fall'; this.fall = 6; }
            return;
        }
        if (this.state === 'fall') {
            if (--this.fall <= 0) this.strike(e);
            return;
        }
        if (this.state === 'plant') {
            if (--this.plant <= 0) { this.state = 'fade'; this.fade = 15; return; }
            if (e && e.hp > 0 && Math.abs(e.y + e.h / 2 - this.y) < 70) {
                const dx = this.x - (e.x + e.w / 2);
                if (Math.abs(dx) < this.r * 2.4) {
                    e.x += Math.sign(dx) * Math.min(Math.abs(dx), this.pull);
                    e.x = Math.max(0, Math.min(canvas.width - e.w, e.x));
                }
                if (Math.abs(dx) < this.r + e.w / 2 && this.plant % 30 === 0) e.takeDamage(0.3, this.owner);
            }
            return;
        }
        if (--this.fade <= 0) this.active = false;
    }
    strike(e) {
        if (e && e.hp > 0 && Math.hypot(e.x + e.w / 2 - this.x, e.y + e.h / 2 - this.y) < this.r + e.w / 2) {
            e.takeDamage(this.dmg, this.owner);
            fxSlashHit(e.x + e.w / 2, e.y + e.h / 2, '#d946ef', this.giant ? 30 : 18);
        }
        explosions.push(new Explosion(this.x, this.y, this.r + 8, 'rgba(147, 51, 234,', 0, this.owner));
        if (this.giant) { triggerScreenShake(7, 12); this.state = 'plant'; }
        else { triggerScreenShake(2, 4); this.state = 'fade'; this.fade = 12; }
    }
    botThreat(bot) {
        if (this.state === 'pre' || this.state === 'fade' || Math.abs(bot.y + bot.h / 2 - this.y) > this.r + bot.h) return null;
        const t = this.state === 'warn' ? this.warn + 6 : 1;
        return { t, x: this.x, half: (this.state === 'plant' ? this.r * 1.2 : this.r) + bot.w / 2 + 4, w: this.giant ? 3 : 1.5 };
    }
    swordLen() { return this.giant ? (this.big ? 150 : 125) : 42; }
    draw() {
        if (this.state === 'pre' || !this.active) return;
        const L = this.swordLen(), W = this.giant ? (this.big ? 30 : 25) : 9;
        // Kiếm lao từ phía chủ (giữa sân) về làn địch -> luôn nằm trong sân với cả P1 lẫn P2
        const sd = this.owner.id === 1 ? -1 : 1, ang = sd < 0 ? -Math.PI / 2 : Math.PI / 2;
        ctx.save();
        if (this.state === 'warn') {
            const k = 1 - this.warn / this.maxWarn;
            const blink = (this.warn >> 2) % 2 ? 0.6 : 1;
            ctx.globalAlpha = blink;
            ctx.fillStyle = `rgba(255, 40, 90, ${0.1 + 0.2 * k})`;
            ctx.strokeStyle = 'rgba(255, 60, 110, 0.9)'; ctx.lineWidth = this.giant ? 3 : 1.5;
            ctx.beginPath(); ctx.ellipse(this.x, this.y, this.r, this.r * 0.6, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.ellipse(this.x, this.y, this.r * (1 - k), this.r * 0.6 * (1 - k), 0, 0, Math.PI * 2); ctx.stroke();
            if (this.giant) {
                // Dấu thập cảnh báo lớn
                ctx.lineWidth = 2; ctx.strokeStyle = '#ff3366';
                ctx.beginPath();
                ctx.moveTo(this.x - this.r * 1.2, this.y); ctx.lineTo(this.x + this.r * 1.2, this.y);
                ctx.moveTo(this.x, this.y - this.r * 0.8); ctx.lineTo(this.x, this.y + this.r * 0.8);
                ctx.stroke();
            }
            ctx.globalAlpha = 0.35 + 0.65 * k;
            // Kiếm treo trên trời, hạ dần xuống
            const hang = (this.giant ? 190 : 110) * (1 - k * 0.45);
            bgDrawSword(this.x, this.y - sd * (hang + L / 2 - 20), ang, L, W, 'dark');
        } else if (this.state === 'fall') {
            const k = this.fall / 6;
            bgDrawSword(this.x, this.y - sd * (L / 2 - 6 + k * 60), ang, L, W, 'dark');
        } else {
            const a = this.state === 'fade' ? this.fade / 15 : 1;
            ctx.globalAlpha = a;
            if (this.giant) {
                // Vùng hút quanh kiếm cắm
                const pulse = 0.5 + 0.5 * Math.sin(this.t * 0.3);
                ctx.strokeStyle = `rgba(217, 70, 239, ${0.35 + 0.3 * pulse})`; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.ellipse(this.x, this.y, this.r, this.r * 0.6, 0, 0, Math.PI * 2); ctx.stroke();
                ctx.strokeStyle = 'rgba(192, 132, 252, 0.3)'; ctx.setLineDash([4, 6]); ctx.lineDashOffset = this.t;
                ctx.beginPath(); ctx.ellipse(this.x, this.y, this.r * 2.4, this.r * 0.9, 0, 0, Math.PI * 2); ctx.stroke();
                ctx.setLineDash([]);
            }
            // Cắm xuống đất: mũi ngập vào làn
            bgDrawSword(this.x, this.y - sd * (L / 2 - (this.giant ? 14 : 6)), ang, L, W, 'dark');
        }
        ctx.restore();
    }
}
