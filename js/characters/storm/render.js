// ==========================================
// Cuồng Phong (storm) — Hình ảnh (vẽ xe & UI riêng)
// ==========================================

// Hướng "lên trên" trên màn hình (khách online xem thế giới xoay 180°)
function stUp() { return (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest') ? 1 : -1; }

// Phễu lốc xoáy nhiều lớp + mảnh vụn bay xoắn (cx,cy = chân phễu)
function stDrawTornado(cx, cy, r0, r1, hh, t, alpha, team) {
    const up = stUp(), N = 14;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    // Quầng chân lốc
    const rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r1 * 0.9);
    rg.addColorStop(0, `rgba(204, 251, 241, ${0.45 * alpha})`); rg.addColorStop(1, 'rgba(13, 148, 136, 0)');
    ctx.fillStyle = rg; ctx.beginPath(); ctx.ellipse(cx, cy, r1 * 0.9, r1 * 0.35, 0, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i <= N; i++) {
        const f = i / N, r = r0 + (r1 - r0) * Math.pow(f, 1.3);
        const yy = cy + up * f * hh, sway = Math.sin(t * 3 + f * 4) * r * 0.22;
        const a0 = t * 9 + f * 5;
        for (let j = 0; j < 2; j++) {
            ctx.globalAlpha = alpha * (0.35 + 0.45 * (1 - f)) * (j ? 0.6 : 1);
            ctx.strokeStyle = j ? team : (i % 3 === 0 ? '#ffffff' : '#5eead4');
            ctx.lineWidth = (j ? 1.2 : 2.4) * Math.max(0.7, r1 / 40);
            ctx.beginPath(); ctx.ellipse(cx + sway, yy, r, r * 0.3, 0, a0 + j * Math.PI, a0 + j * Math.PI + Math.PI * 1.25); ctx.stroke();
        }
    }
    // Mảnh vụn xoáy lên
    for (let j = 0; j < 12; j++) {
        const f = ((j * 0.137 + t * 0.45) % 1), r = (r0 + (r1 - r0) * Math.pow(f, 1.3)) * 1.1;
        const ang = t * 7 + j * 2.4, x = cx + Math.cos(ang) * r, y = cy + up * f * hh + Math.sin(ang) * r * 0.3;
        ctx.globalAlpha = alpha * (1 - f) * 0.9;
        ctx.fillStyle = j % 3 ? '#99f6e4' : '#e2e8f0';
        const s = 1.5 + (j % 3);
        ctx.save(); ctx.translate(x, y); ctx.rotate(ang * 2); ctx.fillRect(-s / 2, -s / 2, s, s); ctx.restore();
    }
    ctx.restore();
}

Object.assign(Player.prototype, {
    // [draw] Cuồng Phong (chỉ hình ảnh)
    drawStorm() {
        if (this.weapon !== 'storm') return;
        const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
        const t = Date.now() / 1000;
        const team = this.id === 2 ? '#e74c3c' : '#3498db';
        // Lao thân: xe hóa thành lốc xoáy, vệt gió phía sau
        if (this.stormDashState === 1) {
            const back = this.id === 1 ? 1 : -1;
            ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
            for (let i = 0; i < 7; i++) {
                const ox = (i - 3) * 6 + Math.sin(t * 20 + i) * 2;
                ctx.globalAlpha = 0.5 - Math.abs(i - 3) * 0.1;
                ctx.strokeStyle = i % 2 ? '#5eead4' : '#ffffff'; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(cx + ox, cy + back * 12); ctx.lineTo(cx + ox * 1.4, cy + back * (50 + (i % 3) * 18)); ctx.stroke();
            }
            ctx.restore();
            if (typeof swDrawVortex === 'function') swDrawVortex(cx, cy, this.w * 0.75, team, 0.9, t * 1.6, 1);
            stDrawTornado(cx, cy + this.h * 0.3 * -stUp(), 5, 26, 46, t * 1.5, 1, team);
            return;
        }
        // Chờ chém: gió cuộn vào tâm
        if (this.stormSlashDelay > 0) {
            const k = 1 - this.stormSlashDelay / 30;
            ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
            for (let a = 0; a < 6; a++) {
                const base = a * Math.PI / 3 - t * 9, R = 70 * (1 - k) + 18;
                ctx.globalAlpha = 0.3 + 0.6 * k;
                ctx.strokeStyle = a % 2 ? '#5eead4' : '#ffffff'; ctx.lineWidth = 1.5 + 2 * k;
                ctx.beginPath(); ctx.arc(cx, cy, R, base, base + 1.1); ctx.stroke();
            }
            ctx.restore();
        }
        const ch = Math.min(1, this.stormChargeRatio || 0);
        if (ch <= 0) return;
        const col = ch >= 0.95 ? '#ff2d75' : (ch >= 0.5 ? '#00ffcc' : '#2ecc71');
        const R = Math.max(this.w / 2 + 8, 20 + ch * 16);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
        // Quầng
        const g = ctx.createRadialGradient(cx, cy, R * 0.4, cx, cy, R * 1.25);
        g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.7, col + '33'); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 1.25, 0, Math.PI * 2); ctx.fill();
        // 3 lớp vòng gió xoáy, quay nhanh dần theo lực
        const sp = 3 + ch * 12;
        for (let l = 0; l < 3; l++) {
            const rr = R * (0.85 + l * 0.16), dir = l % 2 ? -1 : 1;
            for (let a = 0; a < 3; a++) {
                const base = a * Math.PI * 2 / 3 + t * sp * dir * (1 - l * 0.2);
                ctx.globalAlpha = (0.85 - l * 0.22) * (0.5 + ch * 0.5);
                ctx.strokeStyle = l === 0 ? '#ffffff' : col;
                ctx.lineWidth = (ch >= 0.95 ? 3 : 2) - l * 0.5;
                ctx.shadowBlur = 10; ctx.shadowColor = col;
                ctx.beginPath(); ctx.arc(cx, cy, rr, base, base + 0.7 + ch * 0.9); ctx.stroke();
            }
        }
        ctx.shadowBlur = 0;
        // Mảnh vụn bay quanh
        for (let j = 0; j < 4 + Math.floor(ch * 8); j++) {
            const ang = t * (4 + ch * 8) + j * 1.7, rr = R * (0.9 + (j % 3) * 0.18);
            ctx.globalAlpha = 0.75; ctx.fillStyle = j % 2 ? col : '#e2e8f0';
            ctx.fillRect(cx + Math.cos(ang) * rr - 1, cy + Math.sin(ang) * rr - 1, 2, 2);
        }
        // Mắt Bão (Evo 1): vùng xóa đạn r=80
        if (this.hasUpgrade('evo_storm_1') && ch > 0.5 && this.shield > 0) {
            ctx.globalAlpha = 0.35 + 0.15 * Math.sin(t * 8);
            ctx.strokeStyle = '#99f6e4'; ctx.lineWidth = 1.5; ctx.setLineDash([10, 8]); ctx.lineDashOffset = -t * 60;
            ctx.beginPath(); ctx.arc(cx, cy, 80, 0, Math.PI * 2); ctx.stroke();
            ctx.setLineDash([]);
            for (let a = 0; a < 4; a++) {
                const base = a * Math.PI / 2 - t * 5;
                ctx.globalAlpha = 0.4; ctx.lineWidth = 3; ctx.strokeStyle = '#5eead4';
                ctx.beginPath(); ctx.arc(cx, cy, 72, base, base + 0.6); ctx.stroke();
            }
        }
        ctx.restore();
    }
});

// ---------- Kết liễu: CUỒNG PHONG (lốc nuốt) / THIÊN PHONG (Full Evo: mắt bão + sét) ----------
function stDrawFinisherOver(f) {
    const t = f.t, W = canvas.width, H = canvas.height, ts = t / 60;
    const team = f.team === 2 ? '#e74c3c' : '#3498db';
    const endT = f.dur - 30;
    const dark = t < 10 ? t / 10 : (t < endT ? 1 : Math.max(0, 1 - (t - endT) / 30));
    ctx.save();
    if (dark > 0) { ctx.fillStyle = f.full ? `rgba(8, 4, 24, ${0.62 * dark})` : `rgba(2, 20, 22, ${0.5 * dark})`; ctx.fillRect(-W, -H, W * 3, H * 3); }
    ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    if (!f.full) {
        // Lốc xoáy khổng lồ nuốt nạn nhân
        const grow = Math.min(1, t / 30);
        stDrawTornado(f.x, f.y + 20 * -stUp(), 10 + 20 * grow, 30 + 80 * grow, H * 0.5 * grow, ts * 1.6, dark, team);
        // Vòng gió quét mặt đất
        for (let i = 0; i < 3; i++) {
            const k = ((t + i * 14) % 42) / 42;
            ctx.globalAlpha = dark * (1 - k) * 0.7; ctx.strokeStyle = i ? '#5eead4' : '#ffffff'; ctx.lineWidth = 3 * (1 - k) + 1;
            ctx.beginPath(); ctx.ellipse(f.x, f.y, 30 + k * W * 0.6, (30 + k * W * 0.6) * 0.3, 0, 0, Math.PI * 2); ctx.stroke();
        }
    } else {
        // Mắt bão khổng lồ: các cánh xoắn ốc phủ màn hình
        const grow = Math.min(1, t / 40), Rmax = Math.max(W, H) * 1.1 * grow;
        for (let a = 0; a < 7; a++) {
            const base = a * Math.PI * 2 / 7 + ts * 2.2;
            for (let j = 0; j < 3; j++) {
                ctx.globalAlpha = dark * (0.3 - j * 0.08);
                ctx.strokeStyle = j === 0 ? '#e0e7ff' : (j === 1 ? '#a78bfa' : '#5eead4');
                ctx.lineWidth = 5 - j * 1.5;
                ctx.beginPath();
                for (let i = 0; i <= 24; i++) {
                    const q = i / 24, r = 34 + q * Rmax, th = base + q * 3.4 - j * 0.1;
                    const x = f.x + Math.cos(th) * r, y = f.y + Math.sin(th) * r;
                    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                }
                ctx.stroke();
            }
        }
        // Vành mắt bão
        const eg = ctx.createRadialGradient(f.x, f.y, 10, f.x, f.y, 60);
        eg.addColorStop(0, 'rgba(255,255,255,0)'); eg.addColorStop(0.6, `rgba(196, 181, 253, ${0.7 * dark})`); eg.addColorStop(1, 'rgba(124, 58, 237, 0)');
        ctx.globalAlpha = 1; ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(f.x, f.y, 60, 0, Math.PI * 2); ctx.fill();
        // Mưa xiên
        ctx.strokeStyle = '#c7d2fe'; ctx.lineWidth = 1;
        for (let i = 0; i < 40; i++) {
            const x = (i * 71 + t * 4) % (W + 60) - 30, y = (i * 113 + t * 18) % (H + 60) - 30;
            ctx.globalAlpha = dark * 0.35;
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 6, y + 16); ctx.stroke();
        }
        // Sét giáng xuống mắt bão (mỗi 12 tick)
        if (t >= 20 && t < 120) {
            const n = Math.floor((t - 20) / 12), age = (t - 20) % 12;
            if (age < 7) {
                let seed = n * 9301 + 49297;
                const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
                const ang = rnd() * Math.PI * 2, sx = f.x + Math.cos(ang) * H, sy = f.y + Math.sin(ang) * H;
                ctx.globalAlpha = 1 - age / 7;
                for (let pass = 0; pass < 2; pass++) {
                    ctx.strokeStyle = pass ? '#ffffff' : '#a78bfa'; ctx.lineWidth = pass ? 2 : 7;
                    ctx.shadowBlur = pass ? 0 : 20; ctx.shadowColor = '#8b5cf6';
                    let s2 = seed; const r2 = () => { s2 = (s2 * 9301 + 49297) % 233280; return s2 / 233280; };
                    ctx.beginPath(); ctx.moveTo(sx, sy);
                    for (let i = 1; i <= 10; i++) {
                        const q = i / 10, jit = i < 10 ? (r2() - 0.5) * 44 : 0;
                        ctx.lineTo(sx + (f.x - sx) * q + jit, sy + (f.y - sy) * q + jit * 0.6);
                    }
                    ctx.stroke();
                }
                ctx.shadowBlur = 0;
                if (age < 2) { ctx.globalAlpha = 0.28; ctx.fillStyle = '#ede9fe'; ctx.fillRect(-W, -H, W * 3, H * 3); }
            }
        }
    }
    // Chớp mở màn
    if (t < 8) { ctx.globalAlpha = 0.5 * (1 - t / 8); ctx.fillStyle = f.full ? '#ede9fe' : '#ccfbf1'; ctx.fillRect(-W, -H, W * 3, H * 3); }
    ctx.restore();
    // Chữ
    const t0 = f.full ? 30 : 22;
    if (t >= t0 && t < f.dur - 5) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, (t - t0) / 8) * (t > f.dur - 25 ? (f.dur - 5 - t) / 20 : 1);
        ctx.font = f.full ? "900 26px 'Orbitron', Arial" : "900 22px 'Orbitron', Arial";
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.shadowBlur = 20; ctx.shadowColor = f.full ? '#8b5cf6' : '#14b8a6'; ctx.fillStyle = f.full ? '#f5f3ff' : '#f0fdfa';
        const ty = Math.max(60, Math.min(H - 60, f.y + (f.team === 1 ? 96 : -92)));
        const sc = 1 + Math.max(0, 1 - (t - t0) / 8) * 0.6;
        ctx.translate(Math.max(130, Math.min(W - 130, f.x)), ty); ctx.scale(sc, sc);
        const s = f.full ? '天 THIÊN PHONG 天' : '嵐 CUỒNG PHONG 嵐';
        if (typeof drawWorldText === 'function') drawWorldText(ctx, s, 0, 0); else ctx.fillText(s, 0, 0);
        ctx.restore();
    }
}
function stFxOver() {
    if (typeof bodyEffects === 'undefined') return;
    for (const e of bodyEffects) if (e instanceof StFinisher && e.active) e.drawOver();
}
