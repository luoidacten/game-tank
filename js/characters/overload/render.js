// ==========================================
// Cuộn Quá Tải (overload) — Hình ảnh: thanh năng lượng neon, đạn plasma, vòng EMP, dấu vô hiệu
// ==========================================

// Vòng EMP lan ra (chỉ hình ảnh, hiệu ứng đã áp dụng lúc nổ)
class OvEmpRing {
    constructor(x, y, R) {
        this.x = x; this.y = y; this.R = R;
        this.t = 0; this.life = 34;
        this.seed = Math.floor(Math.random() * 1000);
        this.active = true;
    }
    update() { if (++this.t >= this.life) this.active = false; }
    draw() {
        const k = this.t / this.life;
        const ease = 1 - Math.pow(1 - Math.min(1, k * 1.6), 3);
        const r = Math.max(2, this.R * ease);
        const a = Math.max(0, 1 - k);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        // Vùng mờ
        const g = ctx.createRadialGradient(this.x, this.y, r * 0.55, this.x, this.y, r);
        g.addColorStop(0, 'rgba(120, 80, 255, 0)');
        g.addColorStop(1, `rgba(150, 110, 255, ${0.28 * a})`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(this.x, this.y, r, 0, Math.PI * 2); ctx.fill();
        // Vòng chính
        ctx.shadowBlur = 18; ctx.shadowColor = '#a78bfa';
        ctx.strokeStyle = `rgba(196, 181, 253, ${a})`;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(this.x, this.y, r, 0, Math.PI * 2); ctx.stroke();
        // Vòng răng cưa điện
        ctx.strokeStyle = `rgba(165, 243, 252, ${0.9 * a})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const N = 48;
        for (let i = 0; i <= N; i++) {
            const ang = i / N * Math.PI * 2;
            const j = (Math.sin((i + this.seed) * 12.9898 + this.t * 1.7) * 43758.5453) % 1;
            const rr = r * 0.9 + j * 7;
            const px = this.x + Math.cos(ang) * rr, py = this.y + Math.sin(ang) * rr;
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
        // Chữ EMP
        if (k < 0.6) {
            ctx.shadowBlur = 10;
            ctx.fillStyle = `rgba(237, 233, 254, ${1 - k / 0.6})`;
            ctx.font = "bold 13px 'Orbitron', Arial";
            ctx.textAlign = 'center';
            drawWorldText(ctx, 'EMP', this.x, this.y + 4);
        }
        ctx.restore();
    }
}

// Dấu Câm Lặng / Vô hiệu bám theo mục tiêu
class OvEmpMark {
    constructor(target, kind, life) {
        this.target = target; this.kind = kind;
        this.t = 0; this.life = life;
        this.active = true;
    }
    update() {
        this.t++;
        const o = this.target;
        if (!o || o.active === false || this.t >= this.life) { this.active = false; return; }
        if (this.kind === 'player' && !(o.silenceTimer > 0)) this.active = false;
        if (this.kind === 'obj' && !(o.empDisabled > 0)) this.active = false;
    }
    draw() {
        const o = this.target;
        if (!o || typeof o.x !== 'number') return;
        const w = o.w || 20, h = o.h || 20;
        const cx = o.x + w / 2;
        const left = Math.max(0, 1 - this.t / this.life);
        const blink = 0.75 + 0.25 * Math.sin(this.t * 0.4);
        ctx.save();
        if (this.kind === 'player') {
            // Icon câm lặng: đặt phía TRƯỚC xe (về phía sân giữa), không đè thanh máu
            const cy = o.id === 1 ? o.y - 30 : o.y + h + 30;
            ovDrawSilenceIcon(cx, cy, 11, left, blink);
        } else {
            // Vật triệu hồi: khung nhiễu tím + tia điện + icon nhỏ
            ctx.globalCompositeOperation = 'lighter';
            ctx.shadowBlur = 10; ctx.shadowColor = '#a78bfa';
            ctx.strokeStyle = `rgba(167, 139, 250, ${0.8 * blink})`;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(o.x - 3, o.y - 3, w + 6, h + 6);
            ctx.strokeStyle = 'rgba(165, 243, 252, 0.9)';
            ctx.beginPath();
            for (let i = 0; i < 2; i++) {
                const s = Math.sin(this.t * 0.9 + i * 3.1);
                let x0 = o.x + (0.2 + 0.6 * ((s + 1) / 2)) * w, y0 = o.y - 2;
                ctx.moveTo(x0, y0);
                for (let k = 1; k <= 4; k++) ctx.lineTo(x0 + Math.sin(this.t * 1.3 + k * 2 + i) * 5, o.y + (h + 4) * k / 4 - 2);
            }
            ctx.stroke();
            ctx.globalCompositeOperation = 'source-over';
            ovDrawSilenceIcon(cx, o.y - 9 < 6 ? o.y + h + 9 : o.y - 9, 6.5, left, 1);
        }
        ctx.restore();
    }
}

function ovDrawSilenceIcon(x, y, r, left, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = 'rgba(20, 8, 48, 0.85)';
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 10; ctx.shadowColor = '#a78bfa';
    // Vòng thời gian còn lại
    ctx.strokeStyle = 'rgba(80, 60, 140, 0.9)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#c4b5fd';
    ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * left); ctx.stroke();
    // Tia sét
    const s = r / 11;
    ctx.fillStyle = '#facc15'; ctx.shadowColor = '#facc15';
    ctx.beginPath();
    ctx.moveTo(x + 1.5 * s, y - 7 * s); ctx.lineTo(x - 4 * s, y + 1 * s); ctx.lineTo(x - 0.5 * s, y + 1 * s);
    ctx.lineTo(x - 1.5 * s, y + 7 * s); ctx.lineTo(x + 4 * s, y - 1 * s); ctx.lineTo(x + 0.5 * s, y - 1 * s);
    ctx.closePath(); ctx.fill();
    // Gạch chéo
    ctx.strokeStyle = '#f43f5e'; ctx.shadowColor = '#f43f5e'; ctx.lineWidth = Math.max(1.5, 2 * s);
    ctx.beginPath(); ctx.moveTo(x - r * 0.62, y - r * 0.62); ctx.lineTo(x + r * 0.62, y + r * 0.62); ctx.stroke();
    ctx.restore();
}

// Vẽ 1 thanh neon
function ovBar(x, y, w, h, v, col, glow) {
    ctx.fillStyle = 'rgba(4, 10, 24, 0.85)';
    ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
    if (v > 0) {
        ctx.save();
        ctx.shadowBlur = glow; ctx.shadowColor = col;
        ctx.fillStyle = col;
        ctx.fillRect(x, y, w * Math.min(1, v), h);
        ctx.restore();
    }
    ctx.strokeStyle = 'rgba(103, 232, 249, 0.35)'; ctx.lineWidth = 0.75;
    ctx.strokeRect(x - 1, y - 1, w + 2, h + 2);
}

Object.assign(CharHooks.registry.overload, {
    draw() {
        if (this.hp <= 0) return;
        const t = (typeof gameState !== 'undefined' && gameState.frame) ? gameState.frame : Date.now() / 16.7;
        const main = this.ovMain || 0;
        const aux = Array.isArray(this.ovAux) ? this.ovAux : [];
        const stored = ovStored(this);
        const fwd = this.id === 1 ? -1 : 1;
        const W = this.w + 12, x0 = this.x - 6;
        // Thanh chính: ngay phía trước xe
        const yMain = this.id === 1 ? this.y - 8 : this.y + this.h + 4;
        const pulse = 0.5 + 0.5 * Math.sin(t * 0.25);
        const mainCol = main >= 1 ? `rgb(${Math.round(150 + 105 * pulse)}, 255, 255)` : `rgb(255, ${Math.round(140 + main * 115)}, ${Math.round(main * 120)})`;
        ovBar(x0, yMain, W, 4, main, mainCol, main >= 1 ? 14 : 6);
        // Thanh phụ: hàng kế tiếp (phía trước thanh chính)
        if (aux.length) {
            const yAux = yMain + fwd * 6;
            const gap = 2, n = aux.length;
            const sw = (W - gap * (n - 1)) / n;
            for (let i = 0; i < n; i++) {
                const v = aux[i];
                const col = v >= 1 ? '#a78bfa' : (main >= 1 ? '#22d3ee' : 'rgba(34, 211, 238, 0.45)');
                ovBar(x0 + i * (sw + gap), yAux, sw, 3, v, col, v >= 1 ? 12 : 5);
            }
        }
        // Lõi tụ điện trên xe khi có đạn sạc
        if (stored > 0) {
            const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            const rr = 6 + stored * 1.5 + pulse * 2;
            const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rr * 2);
            g.addColorStop(0, 'rgba(220, 255, 255, 0.9)');
            g.addColorStop(0.35, 'rgba(0, 240, 255, 0.45)');
            g.addColorStop(1, 'rgba(120, 80, 255, 0)');
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(cx, cy, rr * 2, 0, Math.PI * 2); ctx.fill();
            // Tia điện quanh xe
            ctx.strokeStyle = 'rgba(165, 243, 252, 0.85)'; ctx.lineWidth = 1.2;
            ctx.shadowBlur = 8; ctx.shadowColor = '#22d3ee';
            ctx.beginPath();
            const arcs = Math.min(4, stored + 1);
            for (let i = 0; i < arcs; i++) {
                const a0 = t * 0.13 + i * (Math.PI * 2 / arcs);
                ctx.moveTo(cx + Math.cos(a0) * 5, cy + Math.sin(a0) * 5);
                for (let k = 1; k <= 3; k++) {
                    const rk = 5 + k * 5, ak = a0 + Math.sin(t * 0.7 + i * 5 + k) * 0.5;
                    ctx.lineTo(cx + Math.cos(ak) * rk, cy + Math.sin(ak) * rk);
                }
            }
            ctx.stroke();
            ctx.restore();
            // Số đạn sạc
            if (stored >= 2) {
                ctx.save();
                ctx.font = "bold 10px 'Orbitron', Arial";
                ctx.textAlign = 'center';
                ctx.fillStyle = '#e0f2fe'; ctx.shadowBlur = 8; ctx.shadowColor = '#a78bfa';
                const tx = this.x + this.w + 11, ty = yMain + (aux.length ? fwd * 3 : 0) + 4;
                drawWorldText(ctx, 'x' + stored, Math.min(canvas.width - 9, tx), ty);
                ctx.restore();
            }
        }
        // Chớp sáng khi một thanh vừa đầy
        if (this.ovFlash > 0) {
            ctx.save();
            ctx.globalAlpha = this.ovFlash / 20;
            ctx.strokeStyle = '#e0f2fe'; ctx.lineWidth = 2; ctx.shadowBlur = 16; ctx.shadowColor = '#22d3ee';
            ctx.strokeRect(this.x - 3, this.y - 3, this.w + 6, this.h + 6);
            ctx.restore();
        }
    },
});

// Đạn sạc: quả cầu plasma neon có tia điện
Object.assign(BulletHooks.registry.overload, {
    draw(b) {
        const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
        const r = Math.max(5, b.w / 2);
        const t = Date.now() / 16.7;
        const ang = Math.atan2(b.vy || 0, b.vx || 0);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        // Đuôi
        ctx.translate(cx, cy); ctx.rotate(ang);
        const L = r * 4.5;
        const tg = ctx.createLinearGradient(-L, 0, 0, 0);
        tg.addColorStop(0, 'rgba(120, 80, 255, 0)');
        tg.addColorStop(1, 'rgba(0, 240, 255, 0.7)');
        ctx.fillStyle = tg;
        ctx.beginPath(); ctx.moveTo(-L, 0); ctx.lineTo(0, -r * 0.9); ctx.lineTo(0, r * 0.9); ctx.closePath(); ctx.fill();
        ctx.rotate(-ang); ctx.translate(-cx, -cy);
        // Quầng
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 2.2);
        g.addColorStop(0, 'rgba(255, 255, 255, 1)');
        g.addColorStop(0.3, 'rgba(120, 250, 255, 0.9)');
        g.addColorStop(0.65, b.ovFull ? 'rgba(150, 100, 255, 0.45)' : 'rgba(0, 200, 255, 0.4)');
        g.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(cx, cy, r * 2.2, 0, Math.PI * 2); ctx.fill();
        // Tia điện quanh cầu
        ctx.strokeStyle = 'rgba(200, 250, 255, 0.95)'; ctx.lineWidth = 1.2;
        ctx.shadowBlur = 10; ctx.shadowColor = '#22d3ee';
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
            const a0 = t * 0.3 + i * 2.09;
            ctx.moveTo(cx + Math.cos(a0) * r * 0.6, cy + Math.sin(a0) * r * 0.6);
            const a1 = a0 + 0.5 + Math.sin(t + i) * 0.3;
            ctx.lineTo(cx + Math.cos(a1) * r * 1.4, cy + Math.sin(a1) * r * 1.4);
            ctx.lineTo(cx + Math.cos(a0 + 0.9) * r * 2.0, cy + Math.sin(a0 + 0.9) * r * 2.0);
        }
        ctx.stroke();
        ctx.restore();
    },
});

// HUD năng lượng dùng chung (nếu có): số Đạn Sạc đang trữ
if (typeof registerEmpowerHUD === 'function') {
    registerEmpowerHUD('overload', p => {
        const stored = ovStored(p);
        return { pct: Math.min(1, p.ovMain || 0), ready: stored > 0, label: 'SẠC', color: stored > 1 ? '#a78bfa' : '#22d3ee', count: stored };
    });
}
