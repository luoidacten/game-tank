// ==========================================
// Tsukiyo (tsukiyo) — Hình ảnh: xe nhẫn giả neon (khăn choàng, trăng khuyết, phi tiêu),
// Phi Tiêu / Hỏa Cầu / Hư Ảnh / Phân Thân / Loạn Trảm / Hắc Nguyệt / kết liễu NGUYỆT TRẢM, HUD Nội Năng.
// Chỉ đọc state (không tạo state mới) -> an toàn online.
// ==========================================

function tsNow() { return Date.now() / 1000; }

// Phi tiêu 4 cánh
function tsStar(x, y, r, rot, color, alpha = 1, glow = 10) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(rot);
    ctx.globalAlpha *= alpha;
    ctx.shadowBlur = glow; ctx.shadowColor = color;
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
        const a = i * Math.PI / 2;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        ctx.lineTo(Math.cos(a + Math.PI / 4) * r * 0.32, Math.sin(a + Math.PI / 4) * r * 0.32);
    }
    ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(0, 0, r * 0.22, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0b0a1a';
    ctx.beginPath(); ctx.arc(0, 0, r * 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}

// Trăng khuyết
function tsCrescent(x, y, r, rot, color, alpha = 1) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(rot);
    ctx.globalAlpha *= alpha;
    ctx.fillStyle = color; ctx.shadowBlur = r * 0.8; ctx.shadowColor = color;
    ctx.beginPath();
    const d = r * 0.28, R = Math.hypot(r, d);
    ctx.arc(0, 0, r, -Math.PI * 0.5, Math.PI * 0.5, false);
    ctx.arc(-d, 0, R, Math.atan2(r, d), Math.atan2(-r, d), true);
    ctx.closePath(); ctx.fill();
    ctx.restore();
}

// Vẽ xe Tsukiyo ở vị trí bất kỳ (Phân Thân / Hư Ảnh / tàn ảnh)
function tsArtAt(owner, x, y, size, alpha, style) {
    const fn = TANK_ART.tsukiyo;
    if (!fn) return;
    const tc = TEAM_COLORS[owner.id] || TEAM_COLORS[1];
    const evo = tankArtEvoState(owner);
    const s = size / 32;
    const k = Object.assign({ t: tsNow(), s }, tc, evo);
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(x, y);
    ctx.scale(s, owner.id === 1 ? s : -s);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    try { fn({ tsStyle: style === undefined ? owner.tsStyle : style, tsMode: 'idle', id: owner.id, ghost: true }, k); } catch (e) { /* bỏ qua */ }
    ctx.restore();
}

// ---------- Xe ----------
registerTankArt('tsukiyo', (p, k) => {
    const t = k.t, st = p.tsStyle || 0, sc = TS_STYLE_C[st];
    const scarf = k.full ? '#fde047' : (k.evo2 ? '#c084fc' : TS_RED);
    // Khăn choàng bay phía sau (2 dải)
    for (const sx of [-1, 1]) {
        ctx.strokeStyle = scarf; ctx.lineWidth = 2.6; TA.glow(scarf, 7);
        ctx.beginPath(); ctx.moveTo(sx * 3, 6);
        for (let i = 1; i <= 5; i++) {
            const yy = 6 + i * 3.2, xx = sx * (3 + i * 1.6) + Math.sin(t * 7 + i * 0.9 + sx) * (0.6 + i * 0.5);
            ctx.lineTo(xx, yy);
        }
        ctx.stroke();
    }
    TA.noGlow();
    // Bánh xích mảnh
    TA.treads(-14, 4, -11, 11, t, '#0b0a1a', '#3b2f5c');
    // Thân giáp lục giác tối
    ctx.fillStyle = TA.vgrad(-12, 12, '#241c3d', '#07060f');
    ctx.beginPath();
    ctx.moveTo(0, -13); ctx.lineTo(9.5, -7); ctx.lineTo(10, 7); ctx.lineTo(4, 12); ctx.lineTo(-4, 12); ctx.lineTo(-10, 7); ctx.lineTo(-9.5, -7); ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = k.team; ctx.lineWidth = 0.9; TA.glow(k.teamGlow, 6); ctx.stroke(); TA.noGlow();
    // Đường vân neon theo phong cách
    ctx.strokeStyle = sc; ctx.lineWidth = 0.7; TA.glow(sc, 6);
    ctx.beginPath(); ctx.moveTo(-8.5, -5); ctx.lineTo(-4, -9); ctx.moveTo(8.5, -5); ctx.lineTo(4, -9);
    ctx.moveTo(-8.5, 5); ctx.lineTo(-5, 9); ctx.moveTo(8.5, 5); ctx.lineTo(5, 9); ctx.stroke();
    TA.noGlow();
    // Katana sau lưng (chéo)
    ctx.save(); ctx.rotate(-0.75);
    ctx.fillStyle = '#0f172a'; ctx.fillRect(-1.1, -16, 2.2, 9);
    ctx.fillStyle = '#94a3b8'; ctx.fillRect(-2.4, -7.5, 4.8, 1.2);
    ctx.fillStyle = scarf; ctx.fillRect(-0.6, -15, 1.2, 6);
    ctx.restore();
    // Đầu: mũ trùm + mặt nạ
    ctx.fillStyle = TA.vgrad(-6, 6, '#1e1b4b', '#0b0a1a');
    ctx.beginPath(); ctx.arc(0, 0, 6.4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#4c1d95'; ctx.lineWidth = 0.6; ctx.stroke();
    // Khe mắt phát sáng
    ctx.fillStyle = sc; TA.glow(sc, 8);
    ctx.beginPath(); ctx.moveTo(-4.6, -1.2); ctx.lineTo(-0.8, -0.2); ctx.lineTo(-4.4, 0.6); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(4.6, -1.2); ctx.lineTo(0.8, -0.2); ctx.lineTo(4.4, 0.6); ctx.closePath(); ctx.fill();
    TA.noGlow();
    // Trăng khuyết trên trán
    tsCrescent(0, -3.8, 2.6, -Math.PI / 2, TS_MOON, 1);
    // Vũ khí phía trước theo phong cách
    if (st === 0) tsStar(0, -13.5, 4.2, t * 9, TS_CYAN, 1, 8);
    else if (st === 1) {
        const r = 3 + Math.sin(t * 12) * 0.5;
        const g = ctx.createRadialGradient(0, -13, 0, 0, -13, r * 1.8);
        g.addColorStop(0, '#fff7ed'); g.addColorStop(0.45, TS_FIRE); g.addColorStop(1, 'rgba(234,88,12,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -13, r * 1.8, 0, Math.PI * 2); ctx.fill();
    } else {
        ctx.fillStyle = '#e9d5ff'; TA.glow(TS_VIO, 8);
        ctx.beginPath(); ctx.moveTo(-1.3, -8); ctx.lineTo(1.3, -8); ctx.lineTo(0.6, -17); ctx.lineTo(0, -18.5); ctx.closePath(); ctx.fill();
        TA.noGlow();
        ctx.fillStyle = '#334155'; ctx.fillRect(-3, -8.4, 6, 1.2);
    }
    // Evo 1: vòng ấn nhỏ quanh đầu
    if (k.evo1 && !p.ghost) {
        ctx.strokeStyle = 'rgba(224, 231, 255, 0.5)'; ctx.lineWidth = 0.5;
        ctx.setLineDash([1.5, 2]); ctx.beginPath(); ctx.arc(0, 0, 8.5, t * 2, t * 2 + Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    }
});

// ---------- Hiệu ứng quanh xe ----------
Object.assign(CharHooks.registry.tsukiyo, {
    draw() {
        if (this.y < -100 || this.y > canvas.height + 100) return; // đang ẩn thân
        const cx = this.x + this.w / 2, cy = this.y + this.h / 2, t = tsNow();
        const dir = tsDir(this);
        ctx.save();
        // Tàn ảnh khi lướt / Hắc Nguyệt
        if ((this.tsMode === 'dash' || this.tsMode === 'moon') && this.tsTrail) {
            this.tsTrail.forEach((yy, i) => {
                if (i === 0) return;
                tsArtAt(this, cx, yy + this.h / 2, this.w, 0.4 * (1 - i / 7), 2);
            });
            if (this.tsMode === 'moon') {
                ctx.globalCompositeOperation = 'lighter';
                tsCrescent(cx, cy + dir * 6, this.w * 0.95, dir < 0 ? -Math.PI / 2 : Math.PI / 2, '#8b5cf6', 0.85);
                ctx.globalCompositeOperation = 'source-over';
            }
        }
        // Lướt ngang (Ảo Ảnh Phi Tiêu): vệt mờ
        if (this.tsSideFx > 0) {
            const a = this.tsSideFx / 10;
            ctx.strokeStyle = `rgba(103, 232, 249, ${0.6 * a})`; ctx.lineWidth = this.h * 0.5;
            ctx.beginPath(); ctx.moveTo(this.tsSideFrom, cy); ctx.lineTo(cx, cy); ctx.stroke();
        }
        // Kết Ấn / giữ ấn: vòng ấn chú cam + bậc
        if (this.tsMode === 'seal' || this.tsMode === 'charge') {
            const k = this.tsMode === 'seal' ? 1 - this.tsT / (this.tsSealMax || 30) : 1;
            const tier = this.tsMode === 'charge' ? (this.tsTier || 0) : 0;
            const R = this.w * (0.9 + tier * 0.18);
            ctx.strokeStyle = tier >= 3 ? TS_VIO : TS_FIRE; ctx.shadowBlur = 12; ctx.shadowColor = ctx.strokeStyle;
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); ctx.stroke();
            ctx.lineWidth = 1; ctx.setLineDash([2, 4]); ctx.lineDashOffset = -t * 40;
            ctx.beginPath(); ctx.arc(cx, cy, R + 5, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
            for (let i = 0; i < 6; i++) { // ký tự ấn xoay quanh
                const a = t * 2 + i * Math.PI / 3;
                ctx.fillStyle = ctx.strokeStyle;
                ctx.fillRect(cx + Math.cos(a) * (R + 5) - 1.5, cy + Math.sin(a) * (R + 5) - 1.5, 3, 3);
            }
            if (tier >= 2) for (const off of [-42, 42]) tsArtAt(this, cx + off, cy, this.w * 0.85, 0.55 + Math.sin(t * 10) * 0.1, 1);
            if (this.tsMode === 'charge') {
                const g = ctx.createRadialGradient(cx, cy + dir * 18, 0, cx, cy + dir * 18, 8 + tier * 5);
                g.addColorStop(0, '#fff7ed'); g.addColorStop(0.5, tier >= 3 ? '#8b5cf6' : TS_FIRE); g.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = g; ctx.shadowBlur = 0;
                ctx.beginPath(); ctx.arc(cx, cy + dir * 18, 8 + tier * 5, 0, Math.PI * 2); ctx.fill();
            }
        }
        // Thu Kiếm / Ẩn trong Loạn Trảm
        if (this.tsMode === 'sheathe') {
            ctx.strokeStyle = '#e9d5ff'; ctx.lineWidth = 1.5; ctx.shadowBlur = 10; ctx.shadowColor = TS_VIO;
            const k = this.tsT / 60;
            ctx.beginPath(); ctx.arc(cx, cy, this.w * 0.85, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - k)); ctx.stroke();
        }
        // Cảnh Giác / Tập Trung (Tâm Nhãn)
        if (this.tsAlert || this.tsFocus > 0) {
            const f = this.tsFocus > 0;
            ctx.strokeStyle = f ? '#ffffff' : 'rgba(245, 243, 255, 0.75)'; ctx.lineWidth = f ? 2.4 : 1.4;
            ctx.shadowBlur = f ? 16 : 8; ctx.shadowColor = '#e9d5ff';
            ctx.beginPath(); ctx.ellipse(cx, cy, this.w * 0.95, this.w * 0.55, 0, 0, Math.PI * 2); ctx.stroke();
            ctx.fillStyle = f ? '#ffffff' : '#e9d5ff';
            ctx.beginPath(); ctx.arc(cx, cy, 2.2, 0, Math.PI * 2); ctx.fill();
        }
        // Đại Phi Tiêu sẵn sàng
        if (this.tsBigNext) tsStar(cx + this.w * 0.75, cy - dir * this.h * 0.4, 4, t * 6, TS_CYAN, 0.9, 10);
        // Vòng giữ nút đổi phong cách
        const h = this.tsHold || 0;
        if (h > 6 && !this.tsHoldUsed && this.tsMode === 'idle') {
            const nx = ((this.tsStyle || 0) + 1) % 3;
            ctx.strokeStyle = TS_STYLE_C[nx]; ctx.shadowColor = TS_STYLE_C[nx]; ctx.shadowBlur = 8; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(cx, cy, this.w * 0.8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, h / tsSwitchT(this))); ctx.stroke();
        }
        if (this.tsSwitchFx > 0) {
            const a = this.tsSwitchFx / 20;
            ctx.strokeStyle = TS_STYLE_C[this.tsStyle || 0]; ctx.globalAlpha = a; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(cx, cy, this.w * (1.4 - a * 0.6), 0, Math.PI * 2); ctx.stroke();
        }
        ctx.restore();
    },

    drawUI() {
        if (typeof hudFrame !== 'function') return;
        if (this.y < -100 || this.y > canvas.height + 100) return;
        const F = hudFrame(this);
        const BW = Math.max(40, Math.min(52, this.w + 14)), bx = -BW / 2;
        const d0 = 12; // = hudRowY(p, 'extra')
        ctx.save();
        const max = tsMaxNN(this), nn = Math.max(0, Math.min(1, (this.tsNN || 0) / max));
        const st = this.tsStyle || 0, sc = TS_STYLE_C[st];
        const cost = tsCost(this, [3, 25, 30][st]);
        ctx.fillStyle = 'rgba(4, 8, 18, 0.88)'; hudFill(F, bx - 1, d0 - 1, BW + 2, 5);
        ctx.fillStyle = (this.tsNN || 0) < cost ? '#64748b' : '#818cf8'; ctx.shadowBlur = 6; ctx.shadowColor = '#818cf8';
        hudFill(F, bx, d0, BW * nn, 3);
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        hudFill(F, bx + BW * Math.min(1, cost / max) - 0.5, d0, 1, 3);
        // 3 ô phong cách bên trái
        for (let i = 0; i < 3; i++) {
            const lx = bx - 17 + i * 5.5, on = i === st;
            ctx.fillStyle = on ? TS_STYLE_C[i] : 'rgba(255,255,255,0.18)';
            if (on) { ctx.shadowBlur = 6; ctx.shadowColor = TS_STYLE_C[i]; } else ctx.shadowBlur = 0;
            hudFill(F, lx, d0 - 0.5, 4.5, 4);
        }
        ctx.shadowBlur = 0;
        // 3 chấm Nhẫn Đạo bên phải (màu nhánh đã chọn)
        ['s', 'd', 'h'].forEach((k, i) => {
            const b = tsBr(this, k);
            const r = hudRect(F, BW / 2 + 4 + i * 5, d0 + 1.5, 0, 0);
            ctx.fillStyle = b ? TS_STYLE_C[b - 1] : 'rgba(255,255,255,0.15)';
            ctx.beginPath(); ctx.arc(r[0], r[1], 1.8, 0, Math.PI * 2); ctx.fill();
        });
        ctx.restore();
    },
});

// ---------- Đạn ----------
function tsDrawBullet(b) {
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2, t = tsNow();
    ctx.save();
    if (b.ts === 'shu' || b.ts === 'shw' || b.ts === 'cln') {
        const c = b.ts === 'cln' ? TS_MOON : TS_CYAN;
        // vệt
        const L = Math.hypot(b.vx || 0, b.vy || 0) || 1;
        ctx.strokeStyle = b.ts === 'shu' ? 'rgba(34, 211, 238, 0.35)' : 'rgba(224, 231, 255, 0.25)';
        ctx.lineWidth = b.w * 0.5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx - b.vx / L * 14, cy - b.vy / L * 14); ctx.stroke();
        tsStar(cx, cy, b.w * 0.75, t * 22 + cx * 0.1, b.isPiercing ? '#fde047' : c, b.ts === 'shw' ? 0.8 : 1, 10);
    } else if (b.ts === 'fire' || b.ts === 'ember') {
        const r = b.w / 2, up = b.vy < 0 ? 1 : -1;
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 4; i >= 1; i--) {
            ctx.fillStyle = `rgba(234, 88, 12, ${0.18 * (5 - i) / 4})`;
            ctx.beginPath(); ctx.arc(cx + Math.sin(t * 20 + i) * 1.5, cy + up * i * r * 0.55, r * (1 - i * 0.12), 0, Math.PI * 2); ctx.fill();
        }
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.5);
        g.addColorStop(0, '#fffbeb'); g.addColorStop(0.35, '#fdba74'); g.addColorStop(0.7, b.tier >= 1 ? '#ea580c' : TS_FIRE); g.addColorStop(1, 'rgba(234,88,12,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r * 1.5, 0, Math.PI * 2); ctx.fill();
    } else if (b.ts === 'cres') {
        tsCrescent(cx, cy, b.w * 0.55, b.vy < 0 ? -Math.PI / 2 : Math.PI / 2, TS_VIO, 0.95);
    } else if (b.ts === 'refl') {
        ctx.translate(cx, cy); ctx.rotate(Math.atan2(b.vy, b.vx) + Math.PI / 2);
        ctx.fillStyle = '#ffffff'; ctx.shadowBlur = 12; ctx.shadowColor = '#e9d5ff';
        ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(3, 2); ctx.lineTo(0, 5); ctx.lineTo(-3, 2); ctx.closePath(); ctx.fill();
        ctx.fillStyle = TS_VIO; ctx.fillRect(-1, 5, 2, 4);
    }
    ctx.restore();
}

// ---------- Entity ----------
function tsDrawShade(o) {
    const a = o.fired ? Math.max(0, 1 - (o.t - o.delay) / 18) : 0.5 + 0.15 * Math.sin(o.t * 0.4);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    tsArtAt(o.owner, o.x, o.y, 26, a * 0.7, 0);
    ctx.globalCompositeOperation = 'source-over';
    if (!o.fired) {
        ctx.strokeStyle = `rgba(103, 232, 249, ${0.7 * a})`; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(o.x, o.y, 16, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (o.t / o.delay)); ctx.stroke();
    }
    ctx.restore();
}
function tsDrawClone(o) {
    if (!o.active || o.away > 0) return;
    const cx = o.x + o.w / 2, cy = o.y + o.h / 2, t = tsNow();
    ctx.save();
    ctx.fillStyle = 'rgba(167, 139, 250, 0.18)';
    ctx.beginPath(); ctx.ellipse(cx, cy, o.w * 0.75, o.h * 0.6, 0, 0, Math.PI * 2); ctx.fill();
    tsArtAt(o.owner, cx, cy, o.w, 0.62 + Math.sin(t * 6) * 0.08);
    // khói chân
    for (let i = 0; i < 3; i++) {
        ctx.fillStyle = `rgba(148, 163, 184, ${0.18 + 0.08 * Math.sin(t * 5 + i)})`;
        ctx.beginPath(); ctx.arc(cx + (i - 1) * 7, cy + o.h * 0.45, 4 + Math.sin(t * 4 + i) * 1.2, 0, Math.PI * 2); ctx.fill();
    }
    // thanh máu
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(o.x, o.y - 5, o.w, 2.5);
    ctx.fillStyle = TS_MOON; ctx.fillRect(o.x, o.y - 5, o.w * Math.max(0, o.hp / o.maxHp), 2.5);
    ctx.restore();
}
function tsDrawWall(o) {
    if (!o.active) return;
    const t = tsNow(), full = tsFull(o.owner);
    ctx.save();
    const g = ctx.createLinearGradient(o.x, o.y, o.x, o.y + o.h);
    g.addColorStop(0, full ? '#7c2d12' : '#57534e'); g.addColorStop(1, full ? '#431407' : '#292524');
    ctx.fillStyle = g;
    ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(o.x, o.y, o.w, o.h, 3); else ctx.rect(o.x, o.y, o.w, o.h); ctx.fill();
    ctx.strokeStyle = full ? TS_FIRE : '#d6d3d1'; ctx.lineWidth = 1.2; ctx.shadowBlur = 8; ctx.shadowColor = full ? TS_FIRE : '#a8a29e';
    ctx.stroke(); ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(o.x + o.w * 0.33, o.y); ctx.lineTo(o.x + o.w * 0.3, o.y + o.h); ctx.moveTo(o.x + o.w * 0.68, o.y); ctx.lineTo(o.x + o.w * 0.7, o.y + o.h); ctx.stroke();
    if (full) {
        ctx.fillStyle = `rgba(251, 146, 60, ${0.5 + 0.3 * Math.sin(t * 8)})`;
        for (let i = 0; i < 3; i++) ctx.fillRect(o.x + 6 + i * 15, o.y + 3, 4, 3);
    }
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(o.x, o.y - 4, o.w, 2);
    ctx.fillStyle = '#fde68a'; ctx.fillRect(o.x, o.y - 4, o.w * Math.max(0, o.hp / o.maxHp), 2);
    ctx.restore();
}
function tsDrawFirePool(o) {
    const a = Math.min(1, o.life / 30), t = tsNow();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const rx = o.r * ZONE_AX, ry = o.r * ZONE_AY;
    const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, rx);
    g.addColorStop(0, `rgba(251, 146, 60, ${0.35 * a})`); g.addColorStop(1, 'rgba(234, 88, 12, 0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(o.x, o.y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 7; i++) {
        const px = o.x + Math.sin(i * 2.3) * rx * 0.7, ph = (t * 1.6 + i * 0.37) % 1;
        ctx.fillStyle = `rgba(253, 186, 116, ${0.6 * a * (1 - ph)})`;
        ctx.beginPath(); ctx.arc(px, o.y + Math.cos(i * 1.7) * ry * 0.5 - ph * 14, 2.5 * (1 - ph) + 1, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
}
function tsDrawRush(o) {
    if (!o.active) return;
    const cx = o.x + o.w / 2, cy = o.y + o.h / 2, dir = o.vy < 0 ? -1 : 1, t = tsNow();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 1; i <= 4; i++) {
        ctx.fillStyle = `rgba(251, 146, 60, ${0.22 * (1 - i / 5)})`;
        ctx.beginPath(); ctx.arc(cx, cy - dir * i * 9, o.w * 0.55, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    tsArtAt(o.owner, cx, cy, o.w, o.inv ? 0.85 : 0.7, 1);
    const g = ctx.createRadialGradient(cx, cy + dir * 12, 0, cx, cy + dir * 12, 10);
    g.addColorStop(0, '#fffbeb'); g.addColorStop(0.5, TS_FIRE); g.addColorStop(1, 'rgba(234,88,12,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy + dir * 12, 10 + Math.sin(t * 20), 0, Math.PI * 2); ctx.fill();
    if (o.maxHp > 1 && o.hp > 1) {
        ctx.strokeStyle = 'rgba(147, 197, 253, 0.8)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(cx, cy, o.w * 0.75, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
}
function tsDrawVoid(o) {
    const a = Math.min(1, o.life / 30, o.t / 10), t = tsNow();
    ctx.save();
    const rx = o.r * 1.2, ry = o.r * 0.7;
    const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, rx);
    g.addColorStop(0, `rgba(5, 2, 15, ${0.85 * a})`); g.addColorStop(0.6, `rgba(76, 29, 149, ${0.45 * a})`); g.addColorStop(1, 'rgba(139, 92, 246, 0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(o.x, o.y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = `rgba(196, 181, 253, ${0.7 * a})`; ctx.lineWidth = 1.2;
    for (let i = 0; i < 3; i++) {
        const k = ((t * 0.8 + i / 3) % 1);
        ctx.globalAlpha = a * (1 - k);
        ctx.beginPath(); ctx.ellipse(o.x, o.y, rx * (1 - k * 0.8), ry * (1 - k * 0.8), 0, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.globalAlpha = a;
    tsCrescent(o.x, o.y, ry * 0.55, t * 0.6, '#c4b5fd', 0.9);
    ctx.restore();
}
// Hash tất định (đồng bộ host/guest theo t + seed)
function tsHash(a, b) {
    const v = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
    return v - Math.floor(v);
}
// Một nhát chém sắc: lõi trắng mảnh + quầng tím, vạch vào nhanh rồi tắt dần
function tsCutLine(x0, y0, x1, y1, w, a, cross) {
    ctx.strokeStyle = `rgba(168, 85, 247, ${0.28 * a})`; ctx.lineWidth = w * 4.2;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    ctx.strokeStyle = `rgba(216, 180, 254, ${0.55 * a})`; ctx.lineWidth = w * 2;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    // lõi: thon hai đầu (đa giác hình thoi dẹt)
    const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1;
    const nx = -dy / L * w * 0.6, ny = dx / L * w * 0.6;
    const mx = x0 + dx * 0.55, my = y0 + dy * 0.55;
    ctx.fillStyle = cross ? `rgba(255, 255, 255, ${a})` : `rgba(250, 245, 255, ${a})`;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(mx + nx, my + ny); ctx.lineTo(x1, y1); ctx.lineTo(mx - nx, my - ny); ctx.closePath(); ctx.fill();
}
function tsDrawLoan(o) {
    const t = o.t, now = tsNow();
    ctx.save();
    const a = o.final > 0 ? Math.max(0, 1 - o.final / 24) : Math.min(1, t / 8);
    const R = o.r;
    // Nền vùng: tím sẫm, đậm dần ra mép + viền mảnh
    const g = ctx.createRadialGradient(o.x, o.y, R * 0.15, o.x, o.y, R);
    g.addColorStop(0, `rgba(20, 6, 48, ${0.42 * a})`);
    g.addColorStop(0.75, `rgba(46, 16, 101, ${0.45 * a})`);
    g.addColorStop(1, `rgba(88, 28, 135, ${0.6 * a})`);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(o.x, o.y, R, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = `rgba(192, 132, 252, ${0.55 * a})`; ctx.lineWidth = o.big ? 1.6 : 1.1;
    ctx.beginPath(); ctx.arc(o.x, o.y, R, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = `rgba(233, 213, 255, ${0.22 * a})`; ctx.lineWidth = 0.8;
    ctx.setLineDash([2, 7]); ctx.lineDashOffset = -now * 20;
    ctx.beginPath(); ctx.arc(o.x, o.y, R - 3, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    if (o.final <= 0) { // loạn trảm: vô số nhát chém ngẫu nhiên trong vùng
        ctx.save();
        ctx.beginPath(); ctx.arc(o.x, o.y, R - 1, 0, Math.PI * 2); ctx.clip();
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round';
        const step = o.big ? 1 : 2, LIFE = 14, DRAW = 3;
        const sd = o.seed * 100;
        const cut = (i) => { // thông số nhát chém thứ i
            const pr = Math.sqrt(tsHash(sd, i)) * R * 0.78, pa = tsHash(sd + 1, i) * Math.PI * 2;
            const cross = tsHash(sd + 2, i) < 0.18;
            return {
                cx: o.x + Math.cos(pa) * pr, cy: o.y + Math.sin(pa) * pr,
                ang: tsHash(sd + 3, i) * Math.PI,
                L: R * (cross ? 1.1 + tsHash(sd + 4, i) * 0.5 : 0.35 + tsHash(sd + 4, i) * 0.45),
                cross, dir: tsHash(sd + 5, i) < 0.5 ? 1 : -1,
            };
        };
        const last = Math.floor(t / step);
        // Bóng ninja lướt giữa các nhát chém (tàn ảnh)
        ctx.globalCompositeOperation = 'source-over';
        for (let j = 0; j < 3; j++) {
            const i = Math.floor(last / 3) * 3 - j * 3; if (i < 0) break;
            const c0 = cut(i), c1 = cut(i + 3);
            const age = t - (i + 3) * step;
            const al = Math.max(0, 1 - age / (LIFE * 2.2)) * a;
            if (al <= 0) continue;
            ctx.strokeStyle = `rgba(167, 139, 250, ${0.25 * al})`; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(c0.cx, c0.cy); ctx.lineTo(c1.cx, c1.cy); ctx.stroke();
            if (j < 2) tsArtAt(o.owner, c1.cx, c1.cy, 20, 0.22 * al * (j ? 0.5 : 1), 2);
        }
        ctx.globalCompositeOperation = 'lighter';
        for (let i = Math.max(0, last - Math.ceil(LIFE / step)); i <= last; i++) {
            const age = t - i * step;
            if (age < 0 || age >= LIFE) continue;
            const c = cut(i);
            const drawK = Math.min(1, (age + 1) / DRAW); // vạch vào nhanh
            const fade = age < DRAW ? 1 : 1 - (age - DRAW) / (LIFE - DRAW);
            const al = fade * fade * a;
            const ca = Math.cos(c.ang) * c.dir, sa = Math.sin(c.ang) * c.dir;
            const x0 = c.cx - ca * c.L / 2, y0 = c.cy - sa * c.L / 2;
            const x1 = x0 + ca * c.L * drawK, y1 = y0 + sa * c.L * drawK;
            const w = (c.cross ? 2.4 : 1.5) * (o.big ? 1.2 : 1) * (0.6 + 0.4 * fade);
            tsCutLine(x0, y0, x1, y1, w, al, c.cross);
            if (c.cross) { // chém chéo chữ X
                const k2 = Math.max(0, Math.min(1, (age - 1) / DRAW));
                if (k2 > 0) {
                    const cb = Math.cos(c.ang + 1.35), sb = Math.sin(c.ang + 1.35);
                    const u0 = c.cx - cb * c.L * 0.4, v0 = c.cy - sb * c.L * 0.4;
                    tsCutLine(u0, v0, u0 + cb * c.L * 0.8 * k2, v0 + sb * c.L * 0.8 * k2, w * 0.85, al, true);
                }
            }
            // Tia lửa tại điểm cắt
            if (age < 7) {
                const sk = age / 7, sx = x0 + ca * c.L * 0.5, sy = y0 + sa * c.L * 0.5;
                const n = c.cross ? 7 : 4;
                ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * (1 - sk) * a})`;
                ctx.beginPath(); ctx.arc(sx, sy, (c.cross ? 3.2 : 2) * (1 - sk) + 0.5, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = `rgba(233, 213, 255, ${0.85 * (1 - sk) * a})`; ctx.lineWidth = 1;
                ctx.beginPath();
                for (let q = 0; q < n; q++) {
                    const qa = tsHash(sd + 7 + q, i) * Math.PI * 2, d0 = 2 + sk * 10, d1 = d0 + 3 + (1 - sk) * 4;
                    ctx.moveTo(sx + Math.cos(qa) * d0, sy + Math.sin(qa) * d0);
                    ctx.lineTo(sx + Math.cos(qa) * d1, sy + Math.sin(qa) * d1);
                }
                ctx.stroke();
            }
        }
        ctx.restore();
    } else { // nhát chém chẻ đôi
        const rx = R, ry = R, k = o.final / 24;
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = `rgba(255,255,255,${1 - k})`; ctx.lineWidth = 5 * (1 - k) + 1;
        ctx.beginPath(); ctx.moveTo(o.x - rx * 1.6, o.y + ry * 1.1); ctx.lineTo(o.x + rx * 1.6, o.y - ry * 1.1); ctx.stroke();
        if (tsFull(o.owner)) { ctx.beginPath(); ctx.moveTo(o.x - rx * 1.6, o.y - ry * 1.1); ctx.lineTo(o.x + rx * 1.6, o.y + ry * 1.1); ctx.stroke(); }
    }
    ctx.restore();
}
function tsDrawStreak(o) {
    const k = o.t / o.dur;
    ctx.save();
    if (o.kind === 0) { // đường kiếm đen viền tím
        ctx.lineCap = 'round';
        ctx.strokeStyle = `rgba(192, 132, 252, ${0.7 * (1 - k)})`; ctx.lineWidth = 6 * (1 - k) + 1;
        ctx.shadowBlur = 10; ctx.shadowColor = TS_VIO;
        ctx.beginPath(); ctx.moveTo(o.x0, o.y0); ctx.lineTo(o.x1, o.y1); ctx.stroke();
        ctx.strokeStyle = `rgba(5, 2, 15, ${0.9 * (1 - k)})`; ctx.lineWidth = 3 * (1 - k) + 0.5; ctx.shadowBlur = 0;
        ctx.beginPath(); ctx.moveTo(o.x0, o.y0); ctx.lineTo(o.x1, o.y1); ctx.stroke();
    } else { // Hắc Ảnh lao về
        const e = Math.min(1, k * 1.4);
        const x = o.x0 + (o.x1 - o.x0) * e, y = o.y0 + (o.y1 - o.y0) * e;
        ctx.fillStyle = `rgba(15, 5, 40, ${0.85 * (1 - k)})`; ctx.shadowBlur = 16; ctx.shadowColor = TS_VIO;
        ctx.beginPath(); ctx.ellipse(x, y, 9, 14, Math.atan2(o.y1 - o.y0, o.x1 - o.x0) + Math.PI / 2, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = `rgba(192, 132, 252, ${0.6 * (1 - k)})`; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(o.x0, o.y0); ctx.lineTo(x, y); ctx.stroke();
    }
    ctx.restore();
}
function tsDrawBigStar(o) {
    const t = tsNow();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r * 2);
    g.addColorStop(0, 'rgba(103, 232, 249, 0.4)'); g.addColorStop(1, 'rgba(34, 211, 238, 0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(o.x, o.y, o.r * 2, 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    tsStar(o.x, o.y, o.r, t * 16, o.mark ? '#fda4af' : '#67e8f9', 1, 18);
    if (o.absorb) {
        ctx.strokeStyle = 'rgba(224, 231, 255, 0.6)'; ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]); ctx.lineDashOffset = t * 30;
        ctx.beginPath(); ctx.arc(o.x, o.y, o.r + 6, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.restore();
}

// ---------- Kết liễu NGUYỆT TRẢM ----------
function tsEase(k) { return 1 - Math.pow(1 - k, 3); }
// Khói tím quanh nạn nhân (vẽ dưới xe)
function tsDrawFinisher(f) {
    const t = f.t;
    if (t < 8 || t > 100) return;
    ctx.save();
    const k = (t - 8) / 92;
    for (let i = 0; i < 12; i++) {
        const a = f.seed + i * 0.52, d = 18 + 70 * tsEase(Math.min(1, k * 1.6)) * (0.6 + (i % 3) * 0.2);
        ctx.fillStyle = `rgba(76, 29, 149, ${0.35 * (1 - k)})`;
        ctx.beginPath(); ctx.arc(f.x + Math.cos(a) * d, f.y + Math.sin(a) * d * 0.7, 10 + 14 * k, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
}
// Ký tự dạng chữ Hán "月" vẽ bằng nét
function tsGlyph(x, y, s, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha *= alpha;
    ctx.strokeStyle = '#f5f3ff'; ctx.lineWidth = s * 0.12; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.shadowBlur = 18; ctx.shadowColor = TS_VIO;
    ctx.beginPath();
    ctx.moveTo(-s * 0.35, -s * 0.5); ctx.lineTo(-s * 0.35, s * 0.2); ctx.quadraticCurveTo(-s * 0.4, s * 0.45, -s * 0.6, s * 0.55);
    ctx.moveTo(-s * 0.35, -s * 0.5); ctx.lineTo(s * 0.38, -s * 0.5); ctx.lineTo(s * 0.38, s * 0.45); ctx.lineTo(s * 0.2, s * 0.55);
    ctx.moveTo(-s * 0.3, -s * 0.15); ctx.lineTo(s * 0.33, -s * 0.15);
    ctx.moveTo(-s * 0.3, s * 0.15); ctx.lineTo(s * 0.33, s * 0.15);
    ctx.stroke();
    ctx.restore();
}
function tsDrawFinisherOver(f) {
    const t = f.t, W = canvas.width, H = canvas.height;
    ctx.save();
    // Màn hình tối sầm
    const dark = t < 6 ? t / 6 : (t < 40 ? 1 : Math.max(0, 1 - (t - 40) / 30));
    if (dark > 0) { ctx.fillStyle = `rgba(4, 2, 14, ${0.55 * dark})`; ctx.fillRect(-W, -H, W * 3, H * 3); }
    // Trăng khuyết lớn chớp sáng sau nạn nhân
    if (t < 70) {
        const k = Math.min(1, t / 10), fade = t > 50 ? 1 - (t - 50) / 20 : 1;
        ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 120 * k);
        g.addColorStop(0, `rgba(224, 231, 255, ${0.45 * fade})`); g.addColorStop(1, 'rgba(139, 92, 246, 0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x, f.y, 120 * k, 0, Math.PI * 2); ctx.fill();
        tsCrescent(f.x, f.y, 62 * tsEase(k), f.ang - 0.9, '#e0e7ff', 0.75 * fade);
        ctx.globalCompositeOperation = 'source-over';
    }
    // Ảnh Bộ: 5 tàn ảnh lướt xuyên qua nạn nhân theo đường chéo
    if (t >= 6 && t < 46) {
        const L = 150, ca = Math.cos(f.ang), sa = Math.sin(f.ang);
        const k = tsEase(Math.min(1, (t - 6) / 14));
        for (let i = 0; i < 5; i++) {
            const pos = -L + 2 * L * Math.max(0, k - i * 0.08);
            const a = Math.max(0, 0.75 - i * 0.13) * (t > 30 ? 1 - (t - 30) / 16 : 1);
            if (a <= 0) continue;
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = `rgba(192, 132, 252, ${a})`;
            ctx.translate(f.x + ca * pos, f.y + sa * pos); ctx.rotate(f.ang);
            ctx.beginPath(); ctx.ellipse(0, 0, 14, 6, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = `rgba(255, 255, 255, ${a})`;
            ctx.beginPath(); ctx.arc(4, 0, 3, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        }
    }
    // Nhát chém trắng ngang màn hình
    if (t >= 14 && t < 60) {
        const L = Math.hypot(W, H);
        const grow = tsEase(Math.min(1, (t - 14) / 5));
        const thin = t < 22 ? 1 : Math.max(0, 1 - (t - 22) / 38);
        ctx.save();
        ctx.translate(f.x, f.y); ctx.rotate(f.ang);
        ctx.globalCompositeOperation = 'lighter';
        const x0 = -L, x1 = -L + 2 * L * grow;
        const g = ctx.createLinearGradient(x0, 0, x1, 0);
        g.addColorStop(0, 'rgba(139,92,246,0)'); g.addColorStop(0.8, 'rgba(167,139,250,0.8)'); g.addColorStop(1, 'rgba(255,255,255,1)');
        ctx.fillStyle = g;
        const hw = 8 * thin + 0.5;
        ctx.beginPath(); ctx.moveTo(x0, 0); ctx.quadraticCurveTo(0, -hw * 1.5, x1, 0); ctx.quadraticCurveTo(0, hw * 1.5, x0, 0); ctx.fill();
        ctx.fillStyle = `rgba(255,255,255,${thin})`;
        ctx.beginPath(); ctx.moveTo(x0 * 0.85, 0); ctx.quadraticCurveTo(0, -hw * 0.4, x1, 0); ctx.quadraticCurveTo(0, hw * 0.4, x0 * 0.85, 0); ctx.fill();
        ctx.restore();
        if (t < 18) { ctx.fillStyle = `rgba(255,255,255,${0.5 * (1 - (t - 14) / 4)})`; ctx.fillRect(-W, -H, W * 3, H * 3); }
    }
    // Bùng nổ ký tự + phi tiêu văng
    if (t >= 18 && t < 80) {
        const k = (t - 18) / 62;
        tsGlyph(f.x, f.y, 34 + 18 * tsEase(Math.min(1, k * 3)), (t < 22 ? (t - 18) / 4 : 1) * (1 - k));
        for (let i = 0; i < 8; i++) {
            const a = f.seed + i * Math.PI / 4, d = 20 + 90 * tsEase(Math.min(1, k * 2));
            tsStar(f.x + Math.cos(a) * d, f.y + Math.sin(a) * d * 0.75, 5, t * 0.5 + i, i % 2 ? TS_CYAN : TS_VIO, 1 - k, 10);
        }
    }
    ctx.restore();
    // Chữ NGUYỆT TRẢM
    if (t >= 20 && t < 100) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, (t - 20) / 8) * (t > 82 ? 1 - (t - 82) / 18 : 1);
        ctx.font = 'bold 22px "Orbitron", Arial';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 16; ctx.shadowColor = '#8b5cf6';
        ctx.fillStyle = '#f5f3ff';
        const ty = Math.max(60, Math.min(canvas.height - 60, f.y + (f.team === 1 ? 70 : -60)));
        const sc = 1 + Math.max(0, 1 - (t - 20) / 8) * 0.4;
        ctx.translate(canvas.width / 2, ty); ctx.scale(sc, sc);
        if (typeof drawWorldText === 'function') drawWorldText(ctx, '✦ NGUYỆT TRẢM ✦', 0, 0); else ctx.fillText('✦ NGUYỆT TRẢM ✦', 0, 0);
        ctx.restore();
    }
}
function tsFxOver() {
    if (typeof bodyEffects === 'undefined') return;
    for (const e of bodyEffects) if (e instanceof TsFinisher && e.active) e.drawOver();
}

// Nút Bắn: tiến độ giữ để đổi phong cách / bậc kết ấn / phong cách hiện tại
function tsRegisterHUD() {
    if (typeof registerEmpowerHUD !== 'function') return;
    registerEmpowerHUD('tsukiyo', p => {
        const st = p.tsStyle || 0;
        if (p.tsMode === 'charge') {
            const tier = p.tsTier || 0;
            return { pct: tier / 3, ready: tier > 0, color: tier >= 3 ? TS_VIO : TS_FIRE, label: ['KẾT ẤN', 'ĐẠI HỎA CẦU', 'PHÂN THÂN', 'HẮC NGUYỆT'][tier], btnIcon: '🔥', segments: 3, lit: tier };
        }
        const h = p.tsHold || 0;
        if (h > 6 && !p.tsHoldUsed && p.tsMode === 'idle') {
            const nx = (st + 1) % 3;
            return { pct: Math.min(1, h / tsSwitchT(p)), ready: false, color: TS_STYLE_C[nx], label: '→ ' + TS_STYLE_N[nx], btnIcon: TS_STYLE_I[nx] };
        }
        if (p.tsBigNext && st === 0) return { pct: 1, ready: true, color: TS_CYAN, label: 'ĐẠI PHI TIÊU', btnIcon: '✦', idle: true };
        const cost = tsCost(p, [3, 25, 30][st]);
        return { idle: true, pct: Math.min(1, (p.tsNN || 0) / tsMaxNN(p)), ready: false, color: TS_STYLE_C[st], label: TS_STYLE_N[st], btnIcon: TS_STYLE_I[st], dim: (p.tsNN || 0) < cost };
    });
}
if (typeof window !== 'undefined') window.addEventListener('load', tsRegisterHUD);
