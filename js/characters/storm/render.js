// ==========================================
// Cuồng Phong (storm) — Hình ảnh (vẽ xe & UI riêng)
// ==========================================

// Hướng "lên trên" trên màn hình (khách online xem thế giới xoay 180°)
function stUp() { return (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest') ? 1 : -1; }

// Phễu lốc xoáy nhiều lớp + mảnh vụn bay xoắn (cx,cy = chân phễu)
function stDrawTornado(cx, cy, r0, r1, hh, t, alpha, team, upDir) {
    const up = upDir || stUp(), N = 14;
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
        if (this.weapon !== 'storm' || this.stHidden) return;
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
            // Vòng lưỡi gió xoay tròn phản đạn
            ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
            for (let a = 0; a < 3; a++) {
                const base = t * 26 + a * Math.PI * 2 / 3;
                ctx.globalAlpha = 0.9; ctx.strokeStyle = a ? '#5eead4' : '#ffffff'; ctx.lineWidth = 3;
                ctx.shadowBlur = 10; ctx.shadowColor = '#5eead4';
                ctx.beginPath(); ctx.arc(cx, cy, this.w * 0.85, base, base + 1.3); ctx.stroke();
            }
            ctx.restore();
            return;
        }
        // Rung lắc = đang chém: radar quét kiếm theo chiều kim đồng hồ + vùng cảnh báo
        if (this.stormSlashDelay > 0) {
            stDrawRadar(cx, cy, this.stSlashR || 70, 1 - this.stormSlashDelay / 30, '#5eead4');
            return;
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

// ---------- Radar quét kiếm (chiều kim đồng hồ) + vùng cảnh báo — lúc xe rung lắc = đang chém ----------
function stDrawRadar(cx, cy, R, k, col) {
    k = Math.max(0, Math.min(1, k));
    const a = -Math.PI / 2 + k * Math.PI * 2;
    ctx.save();
    // Vùng cảnh báo
    ctx.globalAlpha = 0.14 + 0.12 * k; ctx.fillStyle = '#ff2d55';
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.9; ctx.strokeStyle = '#ff4d6d'; ctx.lineWidth = 2;
    ctx.setLineDash([9, 6]); ctx.lineDashOffset = -k * 80;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    ctx.globalAlpha = 0.55; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, Math.max(4, R * (1 - k)), 0, Math.PI * 2); ctx.stroke();
    // Lưới radar
    ctx.globalAlpha = 0.3; ctx.strokeStyle = col; ctx.lineWidth = 1;
    for (const f of [0.33, 0.66]) { ctx.beginPath(); ctx.arc(cx, cy, R * f, 0, Math.PI * 2); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy); ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R); ctx.stroke();
    // Vệt quét mờ phía sau lưỡi kiếm
    ctx.globalCompositeOperation = 'lighter';
    const tail = Math.min(k * Math.PI * 2, 1.5);
    for (let i = 0; i < 12; i++) {
        const f0 = i / 12, f1 = (i + 1) / 12;
        ctx.globalAlpha = 0.32 * (1 - f0); ctx.fillStyle = col;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, a - tail * f1, a - tail * f0); ctx.closePath(); ctx.fill();
    }
    // Lưỡi kiếm quét
    const ex = cx + Math.cos(a) * R, ey = cy + Math.sin(a) * R;
    ctx.lineCap = 'round'; ctx.shadowBlur = 16; ctx.shadowColor = col;
    ctx.globalAlpha = 0.9; ctx.strokeStyle = col; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * 8, cy + Math.sin(a) * 8); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.globalAlpha = 1; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * 8, cy + Math.sin(a) * 8); ctx.lineTo(ex, ey); ctx.stroke();
    // Mũi kiếm
    ctx.save(); ctx.translate(ex, ey); ctx.rotate(a);
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(6, 0); ctx.lineTo(-4, -4); ctx.lineTo(-2, 0); ctx.lineTo(-4, 4); ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.restore();
}

// Xoắn ốc gió nhìn từ trên xuống
function stDrawSpiral(x, y, R, ph, col, alpha, arms = 5, lw = 2.4) {
    ctx.lineCap = 'round';
    for (let a = 0; a < arms; a++) {
        const base = a * Math.PI * 2 / arms + ph;
        ctx.globalAlpha = alpha * (a % 2 ? 0.6 : 1);
        ctx.strokeStyle = a % 2 ? '#ffffff' : col; ctx.lineWidth = lw;
        ctx.beginPath();
        for (let i = 0; i <= 14; i++) {
            const q = i / 14, rr = R * (0.12 + q * 0.88), th = base + q * 2.6;
            const px = x + Math.cos(th) * rr, py = y + Math.sin(th) * rr;
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
    }
}

// ---------- GIÓ LỐC / LÔI BÃO / Cơn Lốc Nhỏ ----------
function stDrawTornadoFx(z) {
    const mini = z.kind === 'mini', thunder = z.kind === 'thunder';
    if (mini && z.t > z.dur) return;
    const t = z.t / 60;
    const life = mini ? Math.max(0, Math.min(1, (z.dur - z.t) / 15, z.t / 6)) : Math.min(1, z.t / 12);
    const R = z.r * (0.8 + 0.2 * Math.min(1, z.t / 12));
    const c1 = thunder ? '#a78bfa' : '#5eead4', team = z.team === 2 ? '#e74c3c' : '#3498db';
    ctx.save();
    // 1. Vùng ảnh hưởng
    const g = ctx.createRadialGradient(z.x, z.y, R * 0.1, z.x, z.y, R);
    if (thunder) { g.addColorStop(0, 'rgba(46, 16, 101, 0.55)'); g.addColorStop(0.7, 'rgba(76, 29, 149, 0.35)'); g.addColorStop(1, 'rgba(76, 29, 149, 0)'); }
    else { g.addColorStop(0, 'rgba(15, 118, 110, 0.4)'); g.addColorStop(0.7, 'rgba(20, 184, 166, 0.22)'); g.addColorStop(1, 'rgba(20, 184, 166, 0)'); }
    ctx.globalAlpha = life; ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(z.x, z.y, R, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = life * 0.75; ctx.strokeStyle = c1; ctx.lineWidth = 1.6;
    ctx.setLineDash([12, 8]); ctx.lineDashOffset = -z.t * 3;
    ctx.beginPath(); ctx.arc(z.x, z.y, R, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    // 2. Các lớp xoắn ốc
    ctx.globalCompositeOperation = 'lighter';
    ctx.shadowBlur = 10; ctx.shadowColor = c1;
    stDrawSpiral(z.x, z.y, R, t * 7, c1, life * 0.75, mini ? 4 : 6, mini ? 2 : 3);
    stDrawSpiral(z.x, z.y, R * 0.72, t * 11 + 1, thunder ? '#e0e7ff' : '#ccfbf1', life * 0.55, 4, 2);
    stDrawSpiral(z.x, z.y, R * 0.45, t * 16 + 2, team, life * 0.5, 3, 1.6);
    ctx.shadowBlur = 0;
    // 3. Phễu lốc 3D vươn về phía sân
    const up = z.y < canvas.height / 2 ? 1 : -1;
    stDrawTornado(z.x, z.y, R * 0.1, R * 0.5, R * (mini ? 0.7 : 1.0), t * 1.6, life * 0.8, team, up);
    // 4. Mắt bão
    const eg = ctx.createRadialGradient(z.x, z.y, 0, z.x, z.y, R * 0.28);
    eg.addColorStop(0, `rgba(255,255,255,${0.75 * life})`); eg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.globalAlpha = 1; ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(z.x, z.y, R * 0.28, 0, Math.PI * 2); ctx.fill();
    // 5. Mảnh vụn xoay quanh
    const n = mini ? 8 : 16;
    for (let j = 0; j < n; j++) {
        const ang = t * (5 + (j % 3)) + j * 2.4, rr = R * (0.35 + ((j * 0.37) % 0.6));
        ctx.globalAlpha = life * 0.85; ctx.fillStyle = j % 3 ? c1 : '#e2e8f0';
        const s = 2 + (j % 3);
        ctx.fillRect(z.x + Math.cos(ang) * rr - s / 2, z.y + Math.sin(ang) * rr - s / 2, s, s);
    }
    // 6. Lôi Bão: tia điện chạy trong lốc + chớp báo trước điểm sét
    if (thunder) {
        ctx.strokeStyle = '#e0e7ff'; ctx.lineWidth = 1.4;
        for (let j = 0; j < 3; j++) {
            if ((z.t + j * 7) % 20 > 6) continue;
            const a0 = (z.t * 0.37 + j * 2.1) % (Math.PI * 2);
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            for (let i = 0; i <= 6; i++) {
                const rr = R * (0.2 + i * 0.12), th = a0 + i * 0.25 + ((i * 7 + z.t) % 5 - 2) * 0.08;
                const px = z.x + Math.cos(th) * rr, py = z.y + Math.sin(th) * rr;
                if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
            ctx.stroke();
        }
        for (const b of z.bolts || []) {
            const on = (b.t % 6) < 3;
            ctx.globalAlpha = on ? 0.95 : 0.4;
            ctx.fillStyle = 'rgba(237, 233, 254, 0.35)';
            ctx.beginPath(); ctx.arc(b.x, b.y, 24, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = on ? '#ffffff' : '#a78bfa'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(b.x, b.y, 10 + b.t, 0, Math.PI * 2); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(b.x - 8, b.y); ctx.lineTo(b.x + 8, b.y); ctx.moveTo(b.x, b.y - 8); ctx.lineTo(b.x, b.y + 8); ctx.stroke();
        }
        if (z.flash > 0) {
            ctx.globalAlpha = z.flash / 6 * 0.35; ctx.fillStyle = '#ede9fe';
            ctx.beginPath(); ctx.arc(z.x, z.y, R * 1.2, 0, Math.PI * 2); ctx.fill();
        }
    }
    // 7. Vòng thời gian còn lại
    if (!mini) {
        const rem = Math.max(0, 1 - z.t / z.dur);
        ctx.globalAlpha = 0.8; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(z.x, z.y, R + 6, -Math.PI / 2, -Math.PI / 2 + rem * Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
    // 8. 0.5s cuối: đang chém -> radar quét kiếm + cảnh báo
    if (!mini && z.dur - z.t <= 30) stDrawRadar(z.x, z.y, R * 1.05, 1 - (z.dur - z.t) / 30, c1);
}

// ---------- Nhát chém chẻ đôi cơn lốc ----------
function stDrawSplitFx(f) {
    const k = f.t / f.dur, a = f.ang, dx = Math.cos(a), dy = Math.sin(a), nx = -dy, ny = dx;
    const col = f.kind === 'thunder' ? '#a78bfa' : '#5eead4', B = 2000;
    ctx.save();
    // Hai nửa cơn lốc trượt tách ra rồi tan
    if (!f.second) {
        for (const s of [-1, 1]) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(f.x - dx * B, f.y - dy * B); ctx.lineTo(f.x + dx * B, f.y + dy * B);
            ctx.lineTo(f.x + dx * B + nx * s * B, f.y + dy * B + ny * s * B); ctx.lineTo(f.x - dx * B + nx * s * B, f.y - dy * B + ny * s * B);
            ctx.closePath(); ctx.clip();
            const off = s * (6 + k * 34);
            ctx.translate(nx * off, ny * off);
            ctx.globalCompositeOperation = 'lighter';
            stDrawSpiral(f.x, f.y, f.r * (1 - k * 0.3), f.t * 0.2, col, (1 - k) * 0.8, 6, 3);
            ctx.globalAlpha = (1 - k) * 0.25; ctx.fillStyle = col;
            ctx.beginPath(); ctx.arc(f.x, f.y, f.r * (1 - k * 0.3), 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        }
    }
    // Đường chém
    ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    const L = f.r * 1.6 * Math.min(1, k * 5), fade = 1 - k;
    ctx.shadowBlur = 24; ctx.shadowColor = col;
    ctx.globalAlpha = fade; ctx.strokeStyle = col; ctx.lineWidth = 16 * fade + 2;
    ctx.beginPath(); ctx.moveTo(f.x - dx * L, f.y - dy * L); ctx.lineTo(f.x + dx * L, f.y + dy * L); ctx.stroke();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 5 * fade + 1;
    ctx.beginPath(); ctx.moveTo(f.x - dx * L, f.y - dy * L); ctx.lineTo(f.x + dx * L, f.y + dy * L); ctx.stroke();
    ctx.shadowBlur = 0;
    for (let i = 0; i < 14; i++) {
        const q = (i / 13) * 2 - 1, sp = (i % 2 ? 1 : -1) * k * (10 + (i % 4) * 8);
        ctx.globalAlpha = fade; ctx.fillStyle = i % 3 ? '#ffffff' : col;
        ctx.fillRect(f.x + dx * L * q + nx * sp - 1.5, f.y + dy * L * q + ny * sp - 1.5, 3, 3);
    }
    if (f.t < 5) { ctx.globalAlpha = 0.3 * (1 - f.t / 5); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(f.x, f.y, f.r * 1.5, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
}

// ---------- Vệt lướt giật về vị trí cũ ----------
function stDrawDashTrail(d) {
    const k = d.t / d.dur, fade = 1 - k;
    const team = d.team === 2 ? '#e74c3c' : '#3498db';
    ctx.save();
    ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    const g = ctx.createLinearGradient(d.x0, d.y0, d.x1, d.y1);
    g.addColorStop(0, 'rgba(94, 234, 212, 0)'); g.addColorStop(1, 'rgba(204, 251, 241, 0.9)');
    ctx.globalAlpha = fade; ctx.strokeStyle = g; ctx.lineWidth = 14 * fade + 2;
    ctx.beginPath(); ctx.moveTo(d.x0, d.y0); ctx.lineTo(d.x1, d.y1); ctx.stroke();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(d.x0 + (d.x1 - d.x0) * k, d.y0 + (d.y1 - d.y0) * k); ctx.lineTo(d.x1, d.y1); ctx.stroke();
    for (let i = 1; i <= 5; i++) {
        const q = i / 6, x = d.x0 + (d.x1 - d.x0) * q, y = d.y0 + (d.y1 - d.y0) * q;
        ctx.globalAlpha = fade * q * 0.6; ctx.strokeStyle = i % 2 ? team : '#5eead4'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
}
