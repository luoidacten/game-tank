// ==========================================
// Hiệu ứng chém & sét dùng chung (chỉ hình ảnh, không gây sát thương)
// ------------------------------------------
// SwordSweep  : vệt quét kiếm hình lưỡi liềm, lướt từ góc a0 -> a1 rồi mờ dần (có lõi trắng + viền màu + tia lửa)
// LightningBolt: tia sét răng cưa nối 2 điểm, chớp nháy rồi tắt (điểm gấp khúc tính sẵn -> đồng bộ online)
// Đều nằm trong `bodyEffects` (đã có trong NET_CLASSES) nên guest vẽ giống host.
// ==========================================

class SwordSweep {
    constructor(x, y, r, a0, a1, color = '#7dd3fc', life = 16, width = 10) {
        this.x = x; this.y = y; this.r = r;
        this.a0 = a0; this.a1 = a1;
        this.color = color;
        this.life = life; this.maxLife = life;
        this.width = width;
        this.active = true;
    }
    update() { if (--this.life <= 0) this.active = false; }
    draw() {
        if (!this.active) return;
        const t = 1 - this.life / this.maxLife;               // 0 -> 1
        const sweep = Math.min(1, t / 0.45);                  // lưỡi kiếm lướt trong 45% đầu
        const fade = t < 0.45 ? 1 : 1 - (t - 0.45) / 0.55;   // sau đó mờ dần
        const head = this.a0 + (this.a1 - this.a0) * sweep;
        // Đuôi vệt bám theo sau mũi kiếm (dài tối đa 75% cung chém)
        const tail = this.a0 + (this.a1 - this.a0) * Math.max(0, sweep - 0.75);
        const dir = this.a1 >= this.a0 ? 1 : -1;
        ctx.save();
        ctx.lineCap = 'round';
        // Vệt mờ phía sau (nhiều lớp mảnh dần -> cảm giác chuyển động mượt)
        const steps = 7;
        for (let i = 0; i < steps; i++) {
            const k = i / steps;
            const from = tail + (head - tail) * k;
            const to = tail + (head - tail) * Math.min(1, k + 1 / steps + 0.02);
            ctx.globalAlpha = fade * (0.15 + 0.85 * k);
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.width * (0.35 + 0.65 * k);
            ctx.shadowBlur = 14; ctx.shadowColor = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, Math.min(from, to), Math.max(from, to), false);
            ctx.stroke();
        }
        // Lõi trắng sáng ở mũi kiếm
        ctx.globalAlpha = fade;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(1.5, this.width * 0.35);
        ctx.shadowBlur = 8; ctx.shadowColor = '#ffffff';
        const coreFrom = head - dir * Math.abs(this.a1 - this.a0) * 0.35;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, Math.min(coreFrom, head), Math.max(coreFrom, head), false);
        ctx.stroke();
        // Tia lửa tại mũi
        ctx.fillStyle = '#ffffff';
        const hx = this.x + Math.cos(head) * this.r, hy = this.y + Math.sin(head) * this.r;
        for (let i = 0; i < 3; i++) {
            const a = head + dir * (Math.PI / 2) + (i - 1) * 0.5;
            const d = 4 + i * 3 + t * 10;
            ctx.globalAlpha = fade * 0.8;
            ctx.beginPath(); ctx.arc(hx + Math.cos(a) * d, hy + Math.sin(a) * d, 1.4, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    }
}

class LightningBolt {
    constructor(x0, y0, x1, y1, color = '#fff59d', life = 14, width = 3, jag = 14) {
        this.color = color;
        this.life = life; this.maxLife = life;
        this.width = width;
        this.active = true;
        // Điểm gấp khúc tính sẵn (lưu dạng mảng số để đồng bộ online)
        const len = Math.hypot(x1 - x0, y1 - y0) || 1;
        const n = Math.max(3, Math.min(22, Math.round(len / 26)));
        const nx = -(y1 - y0) / len, ny = (x1 - x0) / len;
        this.pts = [x0, y0];
        for (let i = 1; i < n; i++) {
            const k = i / n, off = (Math.random() * 2 - 1) * jag * Math.sin(Math.PI * k);
            this.pts.push(x0 + (x1 - x0) * k + nx * off, y0 + (y1 - y0) * k + ny * off);
        }
        this.pts.push(x1, y1);
        // Nhánh phụ
        this.branches = [];
        for (let i = 2; i < this.pts.length - 2; i += 2) {
            if (Math.random() < 0.35) {
                const bx = this.pts[i], by = this.pts[i + 1];
                this.branches.push([bx, by, bx + (Math.random() * 2 - 1) * jag * 1.6, by + (Math.random() * 2 - 1) * jag * 1.6]);
            }
        }
    }
    update() { if (--this.life <= 0) this.active = false; }
    path() {
        ctx.beginPath();
        ctx.moveTo(this.pts[0], this.pts[1]);
        for (let i = 2; i < this.pts.length; i += 2) ctx.lineTo(this.pts[i], this.pts[i + 1]);
    }
    draw() {
        if (!this.active) return;
        const k = this.life / this.maxLife;
        const flicker = (this.life % 3 === 0) ? 0.55 : 1;
        ctx.save();
        ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        ctx.globalAlpha = k * flicker;
        ctx.strokeStyle = this.color; ctx.lineWidth = this.width * 2.6;
        ctx.shadowBlur = 18; ctx.shadowColor = this.color;
        this.path(); ctx.stroke();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = this.width;
        this.path(); ctx.stroke();
        ctx.lineWidth = Math.max(1, this.width * 0.6); ctx.strokeStyle = this.color;
        this.branches.forEach(b => { ctx.beginPath(); ctx.moveTo(b[0], b[1]); ctx.lineTo(b[2], b[3]); ctx.stroke(); });
        ctx.restore();
    }
}

// Tiện ích tạo hiệu ứng
function fxSweep(x, y, r, a0, a1, color, life, width) {
    if (typeof bodyEffects !== 'undefined') bodyEffects.push(new SwordSweep(x, y, r, a0, a1, color, life, width));
}
// Cặp nhát chém chéo hình chữ X tại 1 điểm (dùng khi đòn chém trúng mục tiêu)
function fxSlashHit(x, y, color = '#ffffff', size = 22) {
    const a = Math.random() * Math.PI;
    fxSweep(x, y, size, a - 1.1, a + 1.1, color, 14, 7);
    fxSweep(x, y, size * 0.8, a + Math.PI / 2 + 1.0, a + Math.PI / 2 - 1.0, color, 16, 5);
}
function fxBolt(x0, y0, x1, y1, color, life, width, jag) {
    if (typeof bodyEffects !== 'undefined') bodyEffects.push(new LightningBolt(x0, y0, x1, y1, color, life, width, jag));
}

// ==========================================
// Cảnh báo trước đòn hitscan (đánh tức thời theo cột dọc)
// ------------------------------------------
// Mọi đòn hitscan (trừ Lazer Xuyên Phá) phải hiện cột cảnh báo khoá tại chỗ trước khi bắn để đối thủ kịp né.
// scheduleHitscan(owner, delay, color, width, fire): sau `delay` tick gọi fire() với owner.x tạm đặt về vị trí đã khoá.
// (fire là hàm -> chỉ chạy trên máy host; guest nhận bản sao không có hàm và chỉ vẽ cảnh báo.)
// ==========================================
class HitscanWarning {
    constructor(owner, x, delay, color, width, fire, fromY, dirY) {
        this.owner = owner;
        this.x = x;
        this.delay = delay; this.maxDelay = delay;
        this.color = color || '#ff3355';
        this.width = width || 16;
        this.fire = fire;
        this.fromY = fromY; this.dirY = dirY;
        this.flash = 0;
        this.active = true;
    }
    update() {
        if (!this.active) return;
        if (this.delay > 0) {
            if (--this.delay === 0) {
                const o = this.owner;
                if (typeof this.fire === 'function' && gameState.phase === 'playing' && (!o || o.hp === undefined || o.hp > 0)) {
                    const ox = o ? o.x : 0;
                    if (o && typeof o.x === 'number' && o.w) o.x = this.x - o.w / 2; // bắn đúng cột đã khoá
                    try { this.fire(); } finally { if (o && typeof o.x === 'number' && o.w) o.x = ox; }
                }
                this.fire = null;
                this.flash = 10;
            }
            return;
        }
        if (--this.flash <= 0) this.active = false;
    }
    draw() {
        if (!this.active) return;
        const y0 = this.fromY, y1 = this.dirY < 0 ? 0 : canvas.height;
        const top = Math.min(y0, y1), h = Math.abs(y1 - y0);
        ctx.save();
        if (this.delay > 0) {
            const k = 1 - this.delay / this.maxDelay;                 // 0 -> 1 khi sắp bắn
            const blink = (Math.floor(this.delay / 4) % 2) ? 0.55 : 1;
            ctx.globalAlpha = 0.12 + 0.18 * k;
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x - this.width / 2, top, this.width, h);
            ctx.globalAlpha = blink;
            ctx.strokeStyle = this.color; ctx.lineWidth = 1.5; ctx.setLineDash([7, 5]);
            ctx.lineDashOffset = -this.delay * 1.5;
            ctx.strokeRect(this.x - this.width / 2, top, this.width, h);
            // Vạch nạp: thu hẹp dần về tâm cột
            ctx.setLineDash([]);
            ctx.globalAlpha = 0.9;
            ctx.lineWidth = 2;
            const w = this.width * (1 - k);
            ctx.beginPath(); ctx.moveTo(this.x - w / 2, y0); ctx.lineTo(this.x - w / 2, y1); ctx.moveTo(this.x + w / 2, y0); ctx.lineTo(this.x + w / 2, y1); ctx.stroke();
            ctx.font = "bold 10px 'Orbitron', Arial"; ctx.textAlign = 'center'; ctx.fillStyle = this.color;
            if (typeof drawWorldText === 'function') drawWorldText(ctx, `⚠ ${(this.delay / 60).toFixed(1)}s`, this.x, y0 + this.dirY * 14);
        } else {
            ctx.globalAlpha = this.flash / 10;
            ctx.fillStyle = '#ffffff'; ctx.shadowBlur = 20; ctx.shadowColor = this.color;
            ctx.fillRect(this.x - this.width * 0.3, top, this.width * 0.6, h);
        }
        ctx.restore();
    }
}

function scheduleHitscan(owner, delay, color, width, fire, lockX) {
    const x = typeof lockX === 'number' ? lockX : owner.x + owner.w / 2;
    const ownerId = owner.id || (owner.owner && owner.owner.id) || 1;
    const dirY = ownerId === 1 ? -1 : 1;
    const fromY = ownerId === 1 ? owner.y : owner.y + owner.h;
    const w = new HitscanWarning(owner, x, Math.max(1, delay | 0), color, width, fire, fromY, dirY);
    if (typeof bodyEffects !== 'undefined') bodyEffects.push(w);
    if (soundSystem && !soundSystem.muted && soundSystem.playClick) soundSystem.playClick();
    return w;
}
