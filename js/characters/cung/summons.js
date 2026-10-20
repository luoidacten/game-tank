// ==========================================
// Cung (cung) — Thực thể riêng: Mưa Tên, mũi tên rơi, Thiên Tiễn
// Mọi bộ đếm tính theo tick (đồng bộ online). Thêm class mới vào NET_CLASSES (js/online/netstate.js).
// ==========================================

// Mưa Tên.
//  isGlobal (Full Evo): phủ KHẮP sân — rải đều theo cột (không bỏ sót góc nào), điểm rơi khắp bề dọc sân (3/5 trên làn địch),
//    số mũi tăng theo sát thương (không giới hạn), mỗi mũi sát thương nhỏ + có vòng cảnh báo để né.
//  cục bộ (Evo 2): trút xuống vùng hồng tâm Thiên Tiễn.
class ArrowRain {
    constructor(owner, targetX, targetY, radius, isGlobal = false) {
        this.owner = owner;
        this.x = targetX; this.y = targetY; this.radius = radius;
        this.isGlobal = isGlobal;
        this.active = true;
        this.age = 0;
        this.fired = 0;
        const d = owner.damage;
        if (isGlobal) { this.duration = 240; this.totalArrows = Math.round(60 + d * 45); this.dropDmg = d * 0.25; }
        else { this.duration = 90; this.totalArrows = Math.round(14 + d * 8); this.dropDmg = d * 0.4; }
        this.interval = this.duration / this.totalArrows;
        this.acc = 0;
        this.seed = Math.floor(Math.random() * 1000);
    }

    update() {
        if (!this.active) return;
        this.age++;
        this.acc++;
        while (this.acc >= this.interval && this.fired < this.totalArrows) {
            this.acc -= this.interval;
            this.spawnDrop();
        }
        if (this.age > this.duration + 50) this.active = false;
    }

    spawnDrop() {
        const i = this.fired++;
        let x, y;
        if (this.isGlobal) {
            const enemy = this.owner === p1 ? p2 : p1;
            const cols = 9; // 9 cột, hoán vị (i*4 mod 9) -> mỗi đợt quét đủ cả bề ngang
            const col = (i * 4 + Math.floor(i / cols)) % cols;
            x = (col + 0.5 + (Math.random() - 0.5) * 0.9) / cols * canvas.width;
            // Điểm cảnh báo rải KHẮP sân (cả bề ngang lẫn bề dọc); 3/5 số mũi vẫn rơi trên làn địch
            if (enemy && i % 5 < 3) y = enemy.y + enemy.h / 2 + (Math.random() - 0.5) * 14;
            else y = 12 + Math.random() * (canvas.height - 24);
        } else {
            const a = Math.random() * Math.PI * 2, rr = Math.sqrt(Math.random()) * this.radius;
            x = this.x + Math.cos(a) * rr * 1.2;
            y = this.y + Math.sin(a) * rr * 0.45;
        }
        x = Math.max(12, Math.min(canvas.width - 12, x));
        y = Math.max(12, Math.min(canvas.height - 12, y));
        arrowDrops.push(new ArrowDropMarker(x, y, this.owner, this.dropDmg, this.isGlobal ? 40 : 30));
    }

    draw() {
        if (!this.active) return;
        const fade = Math.min(1, this.age / 20, Math.max(0, (this.duration + 50 - this.age) / 40));
        ctx.save();
        if (this.isGlobal) {
            // Màn mưa vàng phủ cả sân (chỉ hình ảnh)
            ctx.globalAlpha = fade;
            ctx.fillStyle = 'rgba(255,190,60,0.035)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.globalAlpha = 0.45 * fade;
            ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 1.2; ctx.shadowColor = '#ffb020'; ctx.shadowBlur = 4;
            ctx.beginPath();
            for (let i = 0; i < 46; i++) {
                const sx = ((i * 97 + this.seed) % 1000) / 1000 * (canvas.width + 80) - 40;
                const sp = 9 + (i % 5) * 2;
                const sy = ((this.age * sp + i * 131) % (canvas.height + 120)) - 60;
                ctx.moveTo(sx, sy); ctx.lineTo(sx - 5, sy - 26);
            }
            ctx.stroke();
        } else {
            const r = this.radius;
            ctx.globalAlpha = fade;
            const g = ctx.createRadialGradient(this.x, this.y, 2, this.x, this.y, r * 1.25);
            g.addColorStop(0, 'rgba(255,90,60,0.22)'); g.addColorStop(1, 'rgba(255,60,40,0)');
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.ellipse(this.x, this.y, r * 1.25, r * 0.55, 0, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = 'rgba(255,120,80,0.7)'; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5;
            ctx.lineDashOffset = -this.age * 0.6;
            ctx.beginPath(); ctx.ellipse(this.x, this.y, r * 1.2, r * 0.5, 0, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.restore();
    }
}

// Mũi tên rơi: vòng cảnh báo co lại + mũi tên lao từ trời xuống, cắm đất -> sát thương nhỏ
class ArrowDropMarker {
    constructor(x, y, owner, dmg, delayTicks = 36) {
        this.x = x; this.y = y;
        this.owner = owner;
        this.dmg = dmg;
        this.age = 0;
        this.delayT = delayTicks;
        this.delay = delayTicks * 16.7;  // ms (smart-bot ước lượng thời điểm rơi)
        this.spawnTime = Date.now();
        this.r = 15;
        this.active = true;
        this.tilt = (Math.random() - 0.5) * 0.5;
    }

    update() {
        if (!this.active) return;
        if (++this.age < this.delayT) return;
        this.active = false;
        const e = this.owner === p1 ? p2 : p1;
        if (e && Math.abs(e.x + e.w / 2 - this.x) < this.r + e.w / 2 && Math.abs(e.y + e.h / 2 - this.y) < this.r + e.h / 2) {
            e.takeDamage(this.dmg, this.owner);
        }
        explosions.push(new Explosion(this.x, this.y, 16, 'rgba(255, 190, 70,', 0, this.owner));
    }

    draw() {
        if (!this.active) return;
        const k = Math.min(1, this.age / this.delayT);
        ctx.save();
        // vòng mục tiêu
        ctx.strokeStyle = `rgba(255, ${Math.round(210 - 170 * k)}, 70, ${0.55 + 0.45 * k})`;
        ctx.lineWidth = 1.6; ctx.shadowColor = '#ff7a2f'; ctx.shadowBlur = 6;
        ctx.beginPath(); ctx.ellipse(this.x, this.y, this.r, this.r * 0.5, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = `rgba(255, 80, 50, ${0.15 + 0.35 * k})`;
        ctx.beginPath(); ctx.ellipse(this.x, this.y, this.r * (1 - 0.6 * k), this.r * 0.5 * (1 - 0.6 * k), 0, 0, Math.PI * 2); ctx.fill();
        // mũi tên lao tới từ phía người bắn (hơi nghiêng) -> làn trên/dưới đều thấy rõ
        const dir = this.owner && this.owner.y > this.y ? 1 : -1;
        const fall = (1 - k) * 150;
        ctx.translate(this.x + Math.sin(this.tilt) * fall, this.y + dir * fall);
        ctx.rotate(-dir * Math.PI / 2 - this.tilt);
        ctx.globalAlpha = Math.min(1, k * 3);
        bowDrawArrowShape(16, '#ffd98a', '#ff7a2f', 0.9);
        ctx.restore();
    }
}

// Thiên Tiễn: hồng tâm KHÓA (đỏ đặc + vòng co) 0.5s rồi mũi tên khổng lồ cắm xuống
class BowSkyShot {
    constructor(owner, x, y, r, dmg, rain) {
        this.owner = owner; this.x = x; this.y = y; this.r = r; this.dmg = dmg; this.rain = !!rain;
        this.lock = 30; this.maxLock = 30; this.after = 0; this.active = true;
    }
    update() {
        if (!this.active) return;
        if (this.lock > 0) { if (--this.lock === 0) this.strike(); return; }
        if (++this.after > 22) this.active = false;
    }
    strike() {
        const e = this.owner === p1 ? p2 : p1;
        if (e && Math.abs(e.x + e.w / 2 - this.x) < this.r + e.w * 0.35 && Math.abs(e.y + e.h / 2 - this.y) < this.r * 0.6 + e.h / 2) {
            e.takeDamage(this.dmg, this.owner);
            addFloatingText(this.x, this.y - 20, 'THIÊN TIỄN!', '#ff3355', 15);
        }
        if (typeof gmZoneHitTwin === 'function') gmZoneHitTwin(this.owner, this.x, this.y, this.r, this.dmg);
        explosions.push(new Explosion(this.x, this.y, this.r + 14, 'rgba(255, 60, 70,', 0, this.owner));
        spawnSparkParticles(this.x, this.y, '#ffd23f', 14);
        triggerScreenShake(5, 8);
        if (soundSystem && !soundSystem.muted) soundSystem.playExplosion();
        if (this.rain) arrowRains.push(new ArrowRain(this.owner, this.x, this.y, Math.max(40, this.r), false));
    }
    draw() {
        if (!this.active) return;
        const r = this.r;
        ctx.save();
        if (this.lock > 0) {
            const k = 1 - this.lock / this.maxLock;
            ctx.fillStyle = `rgba(255, 30, 50, ${0.22 + 0.2 * k})`;
            ctx.strokeStyle = '#ff2244'; ctx.lineWidth = 2.5;
            ctx.shadowColor = '#ff2244'; ctx.shadowBlur = 12;
            ctx.beginPath(); ctx.ellipse(this.x, this.y, r, r * 0.6, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.ellipse(this.x, this.y, r * (1 - k), r * 0.6 * (1 - k), 0, 0, Math.PI * 2); ctx.stroke();
            ctx.shadowBlur = 0;
            // mũi tên khổng lồ lao tới từ phía người bắn
            const dir = this.owner && this.owner.y > this.y ? 1 : -1;
            ctx.translate(this.x, this.y + dir * (28 + 190 * (1 - k * k)));
            ctx.rotate(-dir * Math.PI / 2);
            bowDrawArrowShape(56, '#fff3c4', '#ff3355', 2.2);
        } else {
            const k = this.after / 22;
            ctx.globalAlpha = 1 - k;
            ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 3 * (1 - k) + 1;
            ctx.beginPath(); ctx.ellipse(this.x, this.y, r * (1 + k * 0.6), r * 0.6 * (1 + k * 0.6), 0, 0, Math.PI * 2); ctx.stroke();
            // mũi tên cắm đất
            const dir = this.owner && this.owner.y > this.y ? 1 : -1;
            ctx.translate(this.x, this.y + dir * 22);
            ctx.rotate(-dir * Math.PI / 2);
            bowDrawArrowShape(40, '#fff3c4', '#ff3355', 1.8);
        }
        ctx.restore();
    }
}

// Vẽ 1 mũi tên dọc trục +x (mũi ở x=+len/2): thân, đầu nhọn, lông đuôi
function bowDrawArrowShape(len, shaftCol, headCol, sc = 1) {
    const h = len / 2;
    ctx.strokeStyle = shaftCol; ctx.lineWidth = 1.4 * sc;
    ctx.beginPath(); ctx.moveTo(-h, 0); ctx.lineTo(h - 4 * sc, 0); ctx.stroke();
    ctx.fillStyle = headCol;
    ctx.shadowColor = headCol; ctx.shadowBlur = 6 * sc;
    ctx.beginPath(); ctx.moveTo(h + 2 * sc, 0); ctx.lineTo(h - 5 * sc, -3 * sc); ctx.lineTo(h - 3.5 * sc, 0); ctx.lineTo(h - 5 * sc, 3 * sc); ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = shaftCol;
    for (const s of [-1, 1]) {
        ctx.beginPath(); ctx.moveTo(-h + 5 * sc, 0); ctx.lineTo(-h - 1 * sc, s * 3.2 * sc); ctx.lineTo(-h + 1 * sc, 0); ctx.closePath(); ctx.fill();
    }
}
