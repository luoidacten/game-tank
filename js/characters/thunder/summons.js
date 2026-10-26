// ==========================================
// thunder (thunder) — Vật triệu hồi / thực thể riêng
// ==========================================



// Vẽ 1 cây Lôi Phong Thương nằm dọc trục X (mũi về +X), dài L
function drawThunderSpearShape(L = 30, alpha = 1, crackle = true) {
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.shadowColor = '#ffeb3b'; ctx.shadowBlur = 12;
    // Cán
    const g = ctx.createLinearGradient(-L / 2, 0, L / 2, 0);
    g.addColorStop(0, '#5d4037'); g.addColorStop(0.5, '#fbc02d'); g.addColorStop(1, '#fff59d');
    ctx.fillStyle = g;
    ctx.fillRect(-L / 2, -1.6, L * 0.78, 3.2);
    // Mũi giáo
    ctx.beginPath();
    ctx.moveTo(L * 0.28, -5); ctx.lineTo(L / 2 + 6, 0); ctx.lineTo(L * 0.28, 5); ctx.lineTo(L * 0.34, 0); ctx.closePath();
    ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.strokeStyle = '#ffeb3b'; ctx.lineWidth = 1.2; ctx.stroke();
    // Tua đuôi
    ctx.fillStyle = '#80deea';
    ctx.beginPath(); ctx.moveTo(-L / 2, 0); ctx.lineTo(-L / 2 - 6, -3); ctx.lineTo(-L / 2 - 4, 0); ctx.lineTo(-L / 2 - 6, 3); ctx.closePath(); ctx.fill();
    // Điện chạy dọc thân
    if (crackle) {
        ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 1; ctx.shadowBlur = 6;
        ctx.beginPath();
        const ph = Math.floor(Date.now() / 60);
        for (let i = 0; i <= 6; i++) {
            const x = -L / 2 + (L * 0.8) * i / 6, y = ((i + ph) % 2 ? -3 : 3) * (i % 3 === 0 ? 0.4 : 1);
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
    ctx.restore();
}

function drawThunderPlantedSpear(s) {
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.angle);
    drawThunderSpearShape(30, 1, true);
    // Vòng điện quanh chỗ cắm
    ctx.strokeStyle = 'rgba(255, 235, 59, 0.45)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(-14, 0, 6 + Math.sin(Date.now() / 120) * 2, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
}

// Làn đứng (y góc trên) của 1 người chơi — dùng khi xe đang ẩn / bay khỏi sân
function thunderLaneY(p) { return p.id === 1 ? canvas.height - p.h - 22 : 20; }

// ==========================================
// Thương Thu Hồi: cây thương hóa tia sét lao vút về chủ (trúng địch trên đường bay 1 lần)
// ==========================================
class ThunderReturnBolt {
    constructor(x, y, owner, speed = 24, dmg = 1.0) {
        this.x = x; this.y = y; this.owner = owner;
        this.speed = speed; this.dmg = dmg;
        this.hit = false; this.life = 90; this.active = true;
        this.trail = [x, y]; // mảng số phẳng (đồng bộ online)
        this.ang = 0;
    }
    update() {
        if (!this.active) return;
        const o = this.owner;
        if (!o || --this.life <= 0) { this.active = false; return; }
        const tx = o.x + o.w / 2, ty = o.y + o.h / 2;
        const dx = tx - this.x, dy = ty - this.y, d = Math.hypot(dx, dy) || 1;
        this.ang = Math.atan2(dy, dx);
        const step = Math.min(d, this.speed);
        const n = Math.max(1, Math.ceil(step / 10));
        const enemy = o === p1 ? p2 : p1;
        for (let i = 0; i < n; i++) {
            this.x += dx / d * step / n;
            this.y += dy / d * step / n;
            if (!this.hit && enemy && enemy.hp > 0 && Math.hypot(enemy.x + enemy.w / 2 - this.x, enemy.y + enemy.h / 2 - this.y) < enemy.w / 2 + 14) {
                this.hit = true;
                // Nhiều tia trúng cùng lúc -> sát thương giảm dần
                const k = Math.max(0.35, 1 - 0.25 * (o.thunderRecallHits || 0));
                if (enemy.takeDamage(this.dmg * k, o) > 0) o.thunderRecallHits = (o.thunderRecallHits || 0) + 1;
                fxSlashHit(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, '#fff176', 20);
                addFloatingText(enemy.x + enemy.w / 2, enemy.y - 12, 'THU THƯƠNG ⚡', '#ffff00', 13);
            }
        }
        this.trail.push(this.x, this.y);
        if (this.trail.length > 14) this.trail.splice(0, 2);
        if (d <= this.speed + 2) {
            this.active = false;
            spawnSparkParticles(tx, ty, '#80deea', 6);
        }
    }
    draw() {
        if (!this.active) return;
        const t = this.trail;
        const nx = Math.cos(this.ang + Math.PI / 2), ny = Math.sin(this.ang + Math.PI / 2);
        ctx.save();
        ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        ctx.globalCompositeOperation = 'lighter';
        // Vệt sét gấp khúc phía sau
        for (let pass = 0; pass < 2; pass++) {
            ctx.strokeStyle = pass === 0 ? 'rgba(255, 235, 59, 0.6)' : '#ffffff';
            ctx.lineWidth = pass === 0 ? 7 : 2;
            ctx.shadowBlur = 16; ctx.shadowColor = '#fff176';
            ctx.beginPath();
            for (let i = 0; i < t.length; i += 2) {
                const mid = i > 0 && i < t.length - 2;
                const j = mid ? ((i / 2) % 2 ? 5 : -5) : 0;
                const px = t[i] + nx * j, py = t[i + 1] + ny * j;
                if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
            ctx.stroke();
        }
        ctx.globalCompositeOperation = 'source-over';
        ctx.translate(this.x, this.y);
        ctx.rotate(this.ang);
        drawThunderSpearShape(24, 1, true);
        ctx.restore();
    }
}

// ==========================================
// Đòn có cảnh báo của Sấm Chớp (vòng cảnh báo rồi giáng, chỉ trúng đối thủ):
//   kind 'storm' — Sét Trời (Full Evo), 'sub' — Nhát chém phụ Lôi Trảm (Evo 2),
//   'sky' — Thương rơi từ trời sau Lôi Trảm (báo trước 3s, cắm lại thành thương trên sân)
// ==========================================
class ThunderStrike {
    constructor(x, y, owner, dmg = 1.0, r = 40, delay = 60, kind = 'storm', wave = 0) {
        this.x = x; this.y = y; this.owner = owner; this.dmg = dmg; this.r = r;
        this.delay = delay; this.maxDelay = delay; this.fall = 0; this.active = true;
        this.kind = kind; this.wave = wave;
    }
    update() {
        if (!this.active) return;
        if (this.delay > 0) { if (--this.delay === 0) this.strike(); return; }
        if (++this.fall > 16) this.active = false;
    }
    strike() {
        const o = this.owner;
        const enemy = o === p1 ? p2 : p1;
        const top = o.id === 1 ? -20 : canvas.height + 20; // "trời" phía sau lưng đối thủ
        const inR = enemy && enemy.hp > 0 && Math.hypot(enemy.x + enemy.w / 2 - this.x, enemy.y + enemy.h / 2 - this.y) < this.r + enemy.w / 2;
        if (typeof gmTwinAlso === 'function') gmTwinAlso(enemy, t => Math.hypot(t.x + t.w / 2 - this.x, t.y + t.h / 2 - this.y) < this.r + t.w / 2, this.dmg * (this.kind === 'sub' && o.thunderSlashFalloff ? o.thunderSlashFalloff() : 1), o); // Gemini: Bản Sao AI
        if (this.kind === 'sub') {
            const a = Math.random() * Math.PI;
            fxSweep(this.x, this.y, this.r * 0.9, a, a + Math.PI * 1.3, '#ffcc80', 12, 9);
            fxBolt(this.x - this.r, this.y, this.x + this.r, this.y, '#fff176', 8, 2, 10);
            explosions.push(new Explosion(this.x, this.y, this.r, 'rgba(255, 200, 80,', 0, o));
            // Mỗi đợt chém phụ chỉ trúng 1 lần
            if (inR && o.thunderSubHitWave !== this.wave) {
                const f = o.thunderSlashFalloff ? o.thunderSlashFalloff() : 1;
                if (enemy.takeDamage(this.dmg * f, o) > 0) {
                    o.thunderSubHitWave = this.wave;
                    o.thunderSlashHits = (o.thunderSlashHits || 0) + 1;
                    fxSlashHit(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, '#ffcc80', 18);
                }
            }
            if (soundSystem && !soundSystem.muted) soundSystem.playHit();
            return;
        }
        if (this.kind === 'sky') {
            fxBolt(this.x, top, this.x, this.y, '#80deea', 14, 3, 18);
            explosions.push(new Explosion(this.x, this.y, this.r + 10, 'rgba(128, 222, 234,', 0, o));
            spawnSparkParticles(this.x, this.y, '#80deea', 10);
            if (inR && enemy.takeDamage(this.dmg, o) > 0) addFloatingText(enemy.x + enemy.w / 2, enemy.y - 12, 'THƯƠNG TRỜI! ⚡', '#80deea', 13);
            // Cắm lại thành thương trên sân (không cộng vào số thương trong tay)
            if (typeof thunderPlantedSpears !== 'undefined') {
                thunderPlantedSpears.push({ id: Math.random(), owner: o, x: this.x, y: this.y, angle: o.id === 1 ? -Math.PI / 2 : Math.PI / 2, sky: true });
            }
            triggerScreenShake(3, 5);
            if (soundSystem && !soundSystem.muted) soundSystem.playHit();
            return;
        }
        fxBolt(this.x + (Math.random() * 2 - 1) * 30, top, this.x, this.y, '#fff176', 16, 4, 22);
        fxBolt(this.x, top, this.x, this.y, '#80deea', 12, 2, 30);
        explosions.push(new Explosion(this.x, this.y, this.r + 8, 'rgba(255, 255, 120,', 0, o));
        spawnSparkParticles(this.x, this.y, '#fff176', 10);
        if (inR) {
            enemy.takeDamage(this.dmg, o);
            addFloatingText(enemy.x + enemy.w / 2, enemy.y - 12, 'SÉT TRỜI! ⚡', '#ffff00', 13);
        }
        triggerScreenShake(3, 6);
        if (soundSystem && !soundSystem.muted) soundSystem.playHit();
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        const sub = this.kind === 'sub', sky = this.kind === 'sky';
        const main = sub ? '255, 170, 60' : (sky ? '128, 222, 234' : '255, 235, 59');
        if (this.delay > 0) {
            const k = 1 - this.delay / this.maxDelay;
            const pulse = 0.5 + 0.5 * Math.sin(k * (sky ? 40 : 28));
            ctx.fillStyle = `rgba(${main}, ${0.06 + 0.18 * k})`;
            ctx.strokeStyle = `rgba(255, 80, 60, ${0.45 + 0.45 * k})`;
            ctx.lineWidth = 2;
            ctx.setLineDash([7, 5]); ctx.lineDashOffset = -k * 40;
            ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.setLineDash([]);
            // Vòng co lại = thời gian còn lại
            ctx.strokeStyle = `rgba(255, 255, 200, ${0.5 + 0.4 * pulse})`;
            ctx.beginPath(); ctx.arc(this.x, this.y, Math.max(2, this.r * (1 - k)), 0, Math.PI * 2); ctx.stroke();
            ctx.shadowBlur = 10; ctx.shadowColor = `rgb(${main})`;
            if (sky) {
                // Cung tiến độ + đếm ngược + cây thương rơi dần từ trời
                ctx.strokeStyle = `rgba(${main}, 0.95)`; ctx.lineWidth = 3;
                ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); ctx.stroke();
                ctx.fillStyle = '#e0f7fa'; ctx.font = "bold 11px 'Orbitron', Arial"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                drawWorldText(ctx, String(Math.ceil(this.delay / 60)), this.x, this.y);
                const dir = this.owner.id === 1 ? 1 : -1;       // lao xuống từ phía giữa sân (luôn thấy được)
                const hgt = this.r + 8 + 110 * (1 - k) * (1 - k);
                ctx.save();
                ctx.translate(this.x, this.y + dir * hgt);
                ctx.rotate(dir < 0 ? Math.PI / 2 : -Math.PI / 2); // mũi thương hướng xuống vòng
                drawThunderSpearShape(26, 0.35 + 0.65 * k, true);
                ctx.restore();
            } else {
                // Ký hiệu tia sét ở tâm
                ctx.fillStyle = `rgba(${sub ? '255, 204, 128' : '255, 241, 118'}, ${0.5 + 0.5 * k})`;
                const s = sub ? 0.8 : 1;
                ctx.beginPath();
                ctx.moveTo(this.x + 2 * s, this.y - 10 * s); ctx.lineTo(this.x - 5 * s, this.y + 1 * s); ctx.lineTo(this.x, this.y + 1 * s);
                ctx.lineTo(this.x - 2 * s, this.y + 10 * s); ctx.lineTo(this.x + 5 * s, this.y - 1 * s); ctx.lineTo(this.x, this.y - 1 * s);
                ctx.closePath(); ctx.fill();
            }
        } else {
            ctx.globalAlpha = 1 - this.fall / 16;
            ctx.strokeStyle = sky ? '#e0f7fa' : '#ffffff'; ctx.lineWidth = 3;
            ctx.shadowBlur = 20; ctx.shadowColor = `rgb(${main})`;
            ctx.beginPath(); ctx.arc(this.x, this.y, this.r * (0.6 + this.fall / 30), 0, Math.PI * 2); ctx.stroke();
        }
        ctx.restore();
    }
}

// ==========================================
// Lôi Vực (Full Evo): vùng điện sau cú giáng Thiên Lôi — gây sát thương theo thời gian
// ==========================================
class ThunderZone {
    constructor(x, y, r, owner, lifeTicks = 240, dmgPerHit = 0.2) {
        this.x = x; this.y = y; this.r = r; this.owner = owner;
        this.life = lifeTicks; this.maxLife = lifeTicks; this.dmg = dmgPerHit;
        this.active = true;
        zoneFit(this);
    }
    update() {
        if (!this.active) return;
        if (--this.life <= 0) { this.active = false; return; }
        const enemy = this.owner === p1 ? p2 : p1;
        if (!enemy || enemy.hp <= 0) return;
        const inside = Math.abs(enemy.x + enemy.w / 2 - this.x) < this.r * ZONE_AX + enemy.w / 2 && Math.abs(enemy.y + enemy.h / 2 - this.y) < this.r * ZONE_AY + enemy.h / 2;
        if (!inside) return;
        addStatusSlow(enemy, 0.88);
        if (this.life % 30 === 0) {
            enemy.takeDamage(this.dmg, this.owner, { isEnvironmental: true });
            spawnSparkParticles(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, '#80deea', 4);
        }
    }
    draw() {
        if (!this.active) return;
        const k = Math.min(1, this.life / 30), t = this.maxLife - this.life;
        ctx.save();
        ctx.globalAlpha = k;
        ctx.fillStyle = 'rgba(40, 120, 255, 0.18)';
        zoneRectPath(this.x, this.y, this.r); ctx.fill();
        ctx.strokeStyle = '#80deea'; ctx.lineWidth = 1.6; ctx.setLineDash([6, 4]);
        ctx.lineDashOffset = -t * 0.8; ctx.shadowBlur = 10; ctx.shadowColor = '#80deea';
        ctx.stroke(); ctx.setLineDash([]);
        // Tia điện nhảy múa trong vùng
        const hw = this.r * ZONE_AX, hh = this.r * ZONE_AY;
        ctx.strokeStyle = (t % 6 < 3) ? '#fff176' : '#e0f7fa'; ctx.lineWidth = 1.4;
        ctx.globalCompositeOperation = 'lighter';
        for (let a = 0; a < 3; a++) {
            const seed = Math.floor(t / 4) * 7 + a * 13;
            ctx.beginPath();
            for (let i = 0; i <= 6; i++) {
                const px = this.x - hw * 0.85 + (hw * 1.7) * i / 6;
                const py = this.y + Math.sin(seed + i * 2.3) * hh * 0.7;
                if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
            ctx.stroke();
        }
        ctx.restore();
    }
}
