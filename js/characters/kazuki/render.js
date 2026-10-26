// ==========================================
// Kazuki (kazuki) — Hình ảnh: xe samurai song kiếm neon, sóng kiếm khí, Hư Ảnh, Trảm Vực, HUD nhịp A/B
// Chỉ đọc state (không tạo state mới) -> an toàn online.
// ==========================================

const KZ_ST_A = { light: '#ecfeff', mid: '#67e8f9', dark: '#0e7490', edge: '#ffffff', glow: '#22d3ee', fuller: '#cffafe', guard: 'bar', guardC: '#334155', hilt: '#0f172a', pommel: '#22d3ee', tip: 2.6 };
const KZ_ST_B = { light: '#fdf2f8', mid: '#f9a8d4', dark: '#9d174d', edge: '#ffffff', glow: '#f472b6', fuller: '#fce7f3', guard: 'bar', guardC: '#334155', hilt: '#0f172a', pommel: '#f472b6', tip: 2.6 };
const KZ_ST_GOLD = { light: '#fffbeb', mid: '#fde68a', dark: '#b45309', edge: '#ffffff', glow: '#fde047', fuller: '#fef3c7', guard: 'bar', guardC: '#78350f', hilt: '#1c1917', pommel: '#fde047', tip: 2.6 };

function kzBlade(hx, hy, ang, len, wid, st, alpha, glow) {
    if (typeof swBlade !== 'function') return;
    swBlade(hx + Math.cos(ang) * len / 2, hy + Math.sin(ang) * len / 2, ang, len, wid, st, alpha, glow);
}

// ---------- Xe ----------
registerTankArt('kazuki', (p, k) => {
    const t = k.t;
    // Bánh xích
    TA.treads(-15, 5, -11, 13, t, '#0b1020', '#334155');
    // Thân giáp bát giác tối màu
    ctx.fillStyle = TA.vgrad(-12, 14, '#1e1b4b', '#0b1020');
    ctx.beginPath();
    ctx.moveTo(-9, -12); ctx.lineTo(9, -12); ctx.lineTo(11, -6); ctx.lineTo(11, 9); ctx.lineTo(7, 14); ctx.lineTo(-7, 14); ctx.lineTo(-11, 9); ctx.lineTo(-11, -6); ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = k.team; ctx.lineWidth = 0.9; TA.glow(k.teamGlow, 6); ctx.stroke(); TA.noGlow();
    // Giáp vai (sode) hai bên: cyan trái, hồng phải
    [[-1, '#22d3ee'], [1, '#f472b6']].forEach(([sx, c]) => {
        ctx.fillStyle = '#111827';
        ctx.beginPath(); ctx.moveTo(sx * 6, -4); ctx.lineTo(sx * 11.5, -2); ctx.lineTo(sx * 11.5, 8); ctx.lineTo(sx * 6, 6); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = c; ctx.lineWidth = 0.7; TA.glow(c, 5);
        for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(sx * 6.5, -1.5 + i * 3); ctx.lineTo(sx * 11, 0.5 + i * 3); ctx.stroke(); }
        TA.noGlow();
    });
    // Mũ kabuto + mảnh trăng (maedate)
    ctx.fillStyle = TA.vgrad(-6, 8, '#312e81', '#0f172a');
    ctx.beginPath(); ctx.arc(0, 2, 6.2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#475569'; ctx.lineWidth = 0.6; ctx.stroke();
    const crest = k.full ? '#fde047' : (k.evo2 ? '#c4b5fd' : '#e2e8f0');
    ctx.fillStyle = crest; TA.glow(crest, 6);
    ctx.beginPath(); ctx.moveTo(-6, -3); ctx.quadraticCurveTo(0, -1, 6, -3); ctx.quadraticCurveTo(0, -7.5, -6, -3); ctx.fill();
    TA.noGlow();
    // Mắt / lõi (sáng theo Kiếm Ý)
    const ky = Math.min(1, (p.kazKY || 0) / 5);
    ctx.fillStyle = (p.kazKY || 0) >= 5 ? '#a78bfa' : k.team;
    TA.glow(ctx.fillStyle, 4 + 8 * ky);
    ctx.fillRect(-3.5, 1.2, 7, 1.6);
    TA.noGlow();
    // Evo 1: vòng "lưu thủy" quanh lõi
    if (k.evo1) {
        ctx.strokeStyle = 'rgba(103, 232, 249, 0.6)'; ctx.lineWidth = 0.6;
        ctx.beginPath(); ctx.arc(0, 2, 8 + Math.sin(t * 3) * 0.6, 0, Math.PI * 2); ctx.stroke();
    }
    // Song kiếm: tư thế theo trạng thái
    const parry = (p.kazParryT || 0) > 0;
    const sw = (p.kazSwing || 0) / 15, side = p.kazSwingSide;
    const hold = (p.kazHold || 0);
    let aL = -Math.PI / 2 - 0.42, aR = -Math.PI / 2 + 0.42; // chéo về trước
    let hxL = -8, hxR = 8, hy = 7;
    if (parry) { aL = -Math.PI / 2 + 0.62; aR = -Math.PI / 2 - 0.62; hxL = -7; hxR = 7; hy = 4; }
    else {
        if (side === 'A' || side === 'X') aL += -0.9 * sw;
        if (side === 'B' || side === 'X') aR += 0.9 * sw;
        if (hold > 4) aR += Math.min(1, hold / 15) * 0.5;  // tụ lực Hữu Trảm
    }
    const gl = parry ? 1.6 : 1;
    if (k.evo2) { // bóng kiếm Hư Ảnh phía sau
        kzBlade(hxL - 2, hy + 2, aL - 0.25, 20, 2.4, KZ_ST_A, 0.25, 0.5);
        kzBlade(hxR + 2, hy + 2, aR + 0.25, 20, 2.4, KZ_ST_B, 0.25, 0.5);
    }
    kzBlade(hxL, hy, aL, 22, 3, parry ? KZ_ST_GOLD : KZ_ST_A, 1, gl);
    kzBlade(hxR, hy, aR, 22, 3, parry ? KZ_ST_GOLD : (hold >= 15 && hold < 36 ? KZ_ST_GOLD : KZ_ST_B), 1, gl);
});

// ---------- Hiệu ứng trên xe ----------
Object.assign(CharHooks.registry.kazuki, {
    draw() {
        const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
        const t = Date.now() / 1000;
        ctx.save();
        // Vệt bóng khi lướt
        if (this.kazMode === 'dash' && this.kazTrail) {
            this.kazTrail.forEach((yy, i) => {
                ctx.globalAlpha = 0.35 * (1 - i / 7);
                ctx.fillStyle = this.kazDashKind === 'bb' ? '#f472b6' : '#a78bfa';
                ctx.fillRect(this.x + 3, yy + 3, this.w - 6, this.h - 6);
            });
            ctx.globalAlpha = 1;
        }
        // Thủ thế: vòng vàng thu hẹp theo thời gian còn lại
        if (this.kazParryT > 0) {
            const k = this.kazParryT / (kzE1(this) ? 48 : 36);
            ctx.strokeStyle = '#fde047'; ctx.lineWidth = 2.5; ctx.shadowBlur = 14; ctx.shadowColor = '#fde047';
            ctx.beginPath(); ctx.arc(cx, cy, this.w * (0.7 + 0.35 * k), 0, Math.PI * 2); ctx.stroke();
            ctx.lineWidth = 1; ctx.setLineDash([3, 4]); ctx.lineDashOffset = -t * 30;
            ctx.beginPath(); ctx.arc(cx, cy, this.w * 1.15, 0, Math.PI * 2); ctx.stroke();
            ctx.setLineDash([]);
        }
        // Hào quang bất tử (Loạn Vũ / lướt)
        if (this.kazAura > 0 || this.kazMode === 'dash') {
            const g = ctx.createRadialGradient(cx, cy, this.w * 0.3, cx, cy, this.w * 1.1);
            g.addColorStop(0, 'rgba(167, 139, 250, 0)'); g.addColorStop(1, 'rgba(167, 139, 250, 0.45)');
            ctx.fillStyle = g; ctx.shadowBlur = 0;
            ctx.beginPath(); ctx.arc(cx, cy, this.w * 1.1, 0, Math.PI * 2); ctx.fill();
        }
        // Khựng (đỡ hụt)
        if (this.kazStagger > 0) {
            ctx.fillStyle = '#94a3b8'; ctx.font = "bold 10px 'Orbitron', Arial"; ctx.textAlign = 'center';
            drawWorldText(ctx, '✕', cx, this.id === 1 ? this.y - 6 : this.y + this.h + 12);
        }
        // Vòng giữ nút: 0 -> B (0.25s) -> Nghịch Trảm (0.6s)
        const h = this.kazHold || 0;
        if (h > 3 && !this.kazHoldUsed && this.kazMode === 'idle') {
            const toB = Math.min(1, h / KZ_HOLD_B);
            ctx.lineWidth = 2; ctx.shadowBlur = 8;
            ctx.strokeStyle = '#f472b6'; ctx.shadowColor = '#f472b6';
            ctx.beginPath(); ctx.arc(cx, cy, this.w * 0.8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * toB); ctx.stroke();
            if (h > KZ_HOLD_B && this.kazParryCD <= 0) {
                const toP = Math.min(1, (h - KZ_HOLD_B) / (KZ_HOLD_PARRY - KZ_HOLD_B));
                ctx.strokeStyle = '#fde047'; ctx.shadowColor = '#fde047';
                ctx.beginPath(); ctx.arc(cx, cy, this.w * 0.95, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * toP); ctx.stroke();
            }
        }
        ctx.restore();
    },

    drawUI() {
        if (typeof hudFrame !== 'function') return;
        const F = hudFrame(this);
        const BW = Math.max(40, Math.min(54, this.w + 14)), bx = -BW / 2;
        const d0 = 12; // = hudRowY(p, 'extra')
        ctx.save();
        // Thanh Ý Niệm
        const yn = Math.max(0, Math.min(1, (this.kazYN || 0) / 100));
        ctx.fillStyle = 'rgba(4, 8, 18, 0.88)'; hudFill(F, bx - 1, d0 - 1, BW + 2, 5);
        const low = (this.kazYN || 0) < kzCost(this, 10);
        ctx.fillStyle = low ? '#64748b' : '#38bdf8'; ctx.shadowBlur = 6; ctx.shadowColor = '#38bdf8';
        hudFill(F, bx, d0, BW * yn, 3);
        ctx.shadowBlur = 0;
        // vạch giá Kiếm Thế Quyết (25)
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        hudFill(F, bx + BW * kzCost(this, 25) / 100 - 0.5, d0, 1, 3);
        // Thanh Kiếm Ý: 10 ô (>=5 -> tím sáng)
        const ky = this.kazKY || 0, n = 10, gap = 0.8, pw = (BW - gap * (n - 1)) / n;
        for (let i = 0; i < n; i++) {
            const on = i < ky;
            ctx.fillStyle = on ? (ky >= 5 ? '#c4b5fd' : '#a78bfa') : 'rgba(255,255,255,0.13)';
            if (on && ky >= 5) { ctx.shadowBlur = 5; ctx.shadowColor = '#a78bfa'; } else ctx.shadowBlur = 0;
            hudFill(F, bx + i * (pw + gap), d0 + 5, pw, 2.5);
        }
        ctx.shadowBlur = 0;
        // Ô nhịp [A|B] bên trái 2 thanh
        const m = this.kazMarks || '';
        const ready = m.length >= 2 || this.kazFree;
        for (let i = 0; i < 2; i++) {
            const lx = bx - 19 + i * 9, c = m[i];
            ctx.fillStyle = 'rgba(4, 8, 18, 0.9)'; hudRRect(F, lx, d0 - 1, 8, 9, 1.5); ctx.fill();
            ctx.strokeStyle = ready ? '#fde047' : 'rgba(255,255,255,0.3)'; ctx.lineWidth = ready ? 1.2 : 0.7; ctx.stroke();
            if (c) {
                ctx.fillStyle = c === 'A' ? '#22d3ee' : '#f472b6';
                ctx.shadowBlur = 6; ctx.shadowColor = ctx.fillStyle;
                ctx.font = "800 7px 'Orbitron', Arial";
                hudText(F, c, lx + 4, d0 + 3.6, 'center');
                ctx.shadowBlur = 0;
            } else if (this.kazFree) {
                ctx.fillStyle = '#fde047'; ctx.font = "800 7px 'Orbitron', Arial";
                hudText(F, '★', lx + 4, d0 + 3.6, 'center');
            }
        }
        // Hồi chiêu Nghịch Trảm: chấm nhỏ bên phải
        const cdMax = kzE1(this) ? 600 : 840;
        const cdK = 1 - Math.max(0, this.kazParryCD || 0) / cdMax;
        const lx = BW / 2 + 6, dm = d0 + 3.5;
        const r = hudRect(F, lx, dm, 0, 0);
        ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.arc(r[0], r[1], 3.6, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = cdK >= 1 ? '#fde047' : '#94a3b8';
        if (cdK >= 1) { ctx.shadowBlur = 6; ctx.shadowColor = '#fde047'; }
        ctx.beginPath(); ctx.arc(r[0], r[1], 3.6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * cdK); ctx.stroke();
        ctx.restore();
    },
});

// ---------- Đạn kiếm khí ----------
function kzDrawBullet(b) {
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    const up = b.vy < 0 ? -1 : 1;
    ctx.save();
    ctx.lineCap = 'round';
    if (b.kz === 'X') {
        const s = b.w / 2;
        const t = Date.now() / 90;
        ctx.translate(cx, cy); ctx.rotate(Math.sin(t) * 0.08);
        ctx.shadowBlur = 16; ctx.shadowColor = '#f472b6';
        [[1, '#f472b6'], [-1, '#f472b6']].forEach(([sx]) => {
            ctx.strokeStyle = '#f472b6'; ctx.lineWidth = 6;
            ctx.beginPath(); ctx.moveTo(-s * sx, -s * 0.9); ctx.quadraticCurveTo(0, up * 4, s * sx, s * 0.9); ctx.stroke();
            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(-s * sx, -s * 0.9); ctx.quadraticCurveTo(0, up * 4, s * sx, s * 0.9); ctx.stroke();
        });
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill();
    } else if (b.kz === 'R') {
        ctx.fillStyle = '#22d3ee'; ctx.shadowBlur = 8; ctx.shadowColor = '#22d3ee';
        ctx.beginPath(); ctx.arc(cx, cy, Math.max(3, b.w / 2), 0, Math.PI * 2); ctx.fill();
    } else {
        const c = b.kz === 'B' ? '#f472b6' : '#22d3ee';
        const hw = b.w / 2, hh = b.h;
        // Lưỡi liềm kiếm khí: lồi về phía trước
        ctx.shadowBlur = 14; ctx.shadowColor = c;
        const grd = ctx.createLinearGradient(cx - hw, 0, cx + hw, 0);
        grd.addColorStop(0, 'rgba(255,255,255,0)'); grd.addColorStop(0.5, c); grd.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grd;
        const yf = up < 0 ? b.y : b.y + b.h, yb = up < 0 ? b.y + b.h : b.y;
        ctx.beginPath();
        ctx.moveTo(cx - hw, yb);
        ctx.quadraticCurveTo(cx, yf + up * hh * 0.9, cx + hw, yb);
        ctx.quadraticCurveTo(cx, yf + up * hh * 0.1, cx - hw, yb);
        ctx.fill();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = b.kz === 'B' ? 2 : 1.4; ctx.shadowBlur = 6; ctx.shadowColor = '#fff';
        ctx.beginPath(); ctx.moveTo(cx - hw * 0.7, yb + up * hh * 0.1); ctx.quadraticCurveTo(cx, yf + up * hh * 0.75, cx + hw * 0.7, yb + up * hh * 0.1); ctx.stroke();
    }
    ctx.restore();
}

// ---------- Entity vẽ ----------
function kzDrawTornado(o) {
    const t = o.t;
    ctx.save();
    ctx.translate(o.x, o.y);
    const fade = o.phase === 1 ? Math.min(1, o.spinT / 15) : 1;
    ctx.globalAlpha = fade;
    const g = ctx.createRadialGradient(0, 0, 2, 0, 0, o.r);
    g.addColorStop(0, 'rgba(255,255,255,0.5)'); g.addColorStop(0.5, 'rgba(34,211,238,0.22)'); g.addColorStop(1, 'rgba(34,211,238,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, o.r, 0, Math.PI * 2); ctx.fill();
    ctx.lineCap = 'round'; ctx.shadowBlur = 12; ctx.shadowColor = '#22d3ee';
    for (let i = 0; i < 4; i++) {
        const a = t * 0.45 + i * Math.PI / 2;
        const rr = o.r * (0.55 + 0.12 * i);
        ctx.strokeStyle = i % 2 ? '#ffffff' : '#22d3ee'; ctx.lineWidth = i % 2 ? 1.5 : 3;
        ctx.beginPath(); ctx.arc(0, 0, rr, a, a + 1.6); ctx.stroke();
    }
    if (o.reflect) {
        ctx.strokeStyle = 'rgba(244,114,182,0.7)'; ctx.lineWidth = 1.2; ctx.setLineDash([3, 4]);
        ctx.beginPath(); ctx.arc(0, 0, o.r, -t * 0.2, -t * 0.2 + Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
}

// Vòng tròn neon: nền gradient tỏa tâm + viền phát sáng + vạch chia xoay
function kzRing(x, y, r, col, rgb, rot, ticks, fillA) {
    const g = ctx.createRadialGradient(x, y, r * 0.1, x, y, r);
    g.addColorStop(0, `rgba(${rgb}, ${fillA * 0.25})`); g.addColorStop(0.7, `rgba(${rgb}, ${fillA * 0.6})`); g.addColorStop(1, `rgba(${rgb}, ${fillA})`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = col; ctx.lineWidth = 1.8; ctx.shadowBlur = 12; ctx.shadowColor = col;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 1.4;
    for (let i = 0; i < ticks; i++) {
        const a = rot + i * Math.PI * 2 / ticks, l = i % 3 === 0 ? 7 : 4;
        ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * (r - l), y + Math.sin(a) * (r - l)); ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); ctx.stroke();
    }
    ctx.shadowBlur = 0;
}

function kzDrawScar(o) {
    const k = o.life / o.maxLife, t = o.maxLife - o.life, r = o.r;
    ctx.save();
    ctx.globalAlpha = Math.min(1, k * 3) * 0.9;
    kzRing(o.x, o.y, r, '#f472b6', '244, 114, 182', t * 0.03, 12, 0.22);
    // vòng nét đứt xoay ngược
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)'; ctx.lineWidth = 1; ctx.setLineDash([5, 6]); ctx.lineDashOffset = t * 0.6;
    ctx.beginPath(); ctx.arc(o.x, o.y, r * 0.68, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    // vết chém chéo trong vòng
    ctx.strokeStyle = '#f472b6'; ctx.lineWidth = 3; ctx.shadowBlur = 12; ctx.shadowColor = '#f472b6'; ctx.lineCap = 'round';
    const d = r * 0.62;
    ctx.beginPath();
    ctx.moveTo(o.x - d, o.y - d * 0.55); ctx.lineTo(o.x + d, o.y + d * 0.55);
    ctx.moveTo(o.x - d, o.y + d * 0.55); ctx.lineTo(o.x + d, o.y - d * 0.55);
    ctx.stroke();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke();
    ctx.restore();
}

// Hư Ảnh samurai nhỏ: thân mờ + kiếm sáng
function kzGhost(x, y, ang, color, alpha) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(ang);
    ctx.globalAlpha *= alpha;
    ctx.fillStyle = 'rgba(30, 27, 75, 0.75)'; ctx.strokeStyle = color; ctx.lineWidth = 1;
    ctx.shadowBlur = 10; ctx.shadowColor = color;
    ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(2, -2); ctx.lineTo(13, -6); ctx.stroke();
    ctx.strokeStyle = color; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(2, 2); ctx.lineTo(12, 6); ctx.stroke();
    ctx.restore();
}

function kzDrawEcho(o) {
    const k = Math.min(1, o.t / o.delay);
    ctx.save();
    if (!o.done) {
        // các Hư Ảnh xoay quanh mục tiêu + vòng đếm ngược
        for (let i = 0; i < 3; i++) {
            const a = o.t * 0.15 + i * 2.094;
            kzGhost(o.x + Math.cos(a) * 22, o.y + Math.sin(a) * 14, a + Math.PI, o.color, 0.8);
        }
        ctx.strokeStyle = o.color; ctx.lineWidth = 2; ctx.shadowBlur = 10; ctx.shadowColor = o.color;
        ctx.beginPath(); ctx.arc(o.x, o.y, 20, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); ctx.stroke();
        // vết chém tích tụ
        ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1;
        const n = Math.floor(k * 5);
        for (let i = 0; i < n; i++) {
            const a = i * 1.3;
            ctx.beginPath(); ctx.moveTo(o.x - Math.cos(a) * 12, o.y - Math.sin(a) * 12); ctx.lineTo(o.x + Math.cos(a) * 12, o.y + Math.sin(a) * 12); ctx.stroke();
        }
    }
    ctx.restore();
}

function kzDrawLoanVu(o) {
    ctx.save();
    if (o.phase === 0) {
        const k = o.t / o.warn;
        ctx.strokeStyle = '#a78bfa'; ctx.lineWidth = 1.6; ctx.shadowBlur = 10; ctx.shadowColor = '#a78bfa';
        ctx.setLineDash([5, 4]); ctx.lineDashOffset = -o.t;
        ctx.beginPath(); ctx.arc(o.x, o.y, 48 - 18 * k, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
        for (let i = 0; i < 5; i++) {
            const a = o.seed + i * 1.2566;
            const R = 70 - 30 * k;
            kzGhost(o.x + Math.cos(a) * R, o.y + Math.sin(a) * R * 0.6, a + Math.PI, '#a78bfa', 0.4 + 0.5 * k);
        }
    } else if (o.phase === 1) {
        // 5 Hư Ảnh lao vào từ 5 hướng theo nhịp
        for (let i = 0; i < 5; i++) {
            const a = o.seed + (i + 1) * 1.2566;
            const ph = ((o.t - (i + 1) * 18) % 90 + 90) % 90;
            const inDash = i < o.hit + 1;
            const R = inDash ? Math.max(8, 46 - ph * 3) : 46;
            const c = i === 4 ? '#fde047' : '#a78bfa';
            kzGhost(o.x + Math.cos(a) * R, o.y + Math.sin(a) * R * 0.65, a + Math.PI, c, i < o.hit ? 0.35 : 0.9);
        }
        ctx.strokeStyle = 'rgba(167, 139, 250, 0.6)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(o.x, o.y, 30, 16, 0, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
}

function kzDrawDomain(o) {
    const k = o.life / o.maxLife, t = o.tick, r = o.r;
    ctx.save();
    const a = Math.min(1, (o.maxLife - o.life) / 12) * Math.min(1, o.life / 20);
    ctx.globalAlpha = a;
    const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, r);
    g.addColorStop(0, 'rgba(167, 139, 250, 0.28)'); g.addColorStop(0.65, 'rgba(34, 211, 238, 0.08)'); g.addColorStop(1, 'rgba(34, 211, 238, 0.26)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(o.x, o.y, r, 0, Math.PI * 2); ctx.fill();
    // viền đôi + vạch chia xoay
    ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 2; ctx.shadowBlur = 14; ctx.shadowColor = '#22d3ee';
    ctx.beginPath(); ctx.arc(o.x, o.y, r, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 24; i++) {
        const an = t * 0.025 + i * Math.PI / 12, l = i % 3 === 0 ? 9 : 4;
        ctx.beginPath(); ctx.moveTo(o.x + Math.cos(an) * (r - l), o.y + Math.sin(an) * (r - l)); ctx.lineTo(o.x + Math.cos(an) * r, o.y + Math.sin(an) * r); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(167, 139, 250, 0.8)'; ctx.lineWidth = 1; ctx.shadowColor = '#a78bfa'; ctx.setLineDash([10, 7]); ctx.lineDashOffset = t * 0.8;
    ctx.beginPath(); ctx.arc(o.x, o.y, r * 0.78, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    // lưỡi kiếm chém liên tục (vệt chéo lóe) bên trong vòng
    ctx.save(); ctx.beginPath(); ctx.arc(o.x, o.y, r - 2, 0, Math.PI * 2); ctx.clip();
    ctx.lineCap = 'round'; ctx.shadowBlur = 8;
    for (let i = 0; i < 7; i++) {
        const an0 = i * 2.4 + t * 0.05, rr = r * (0.2 + ((i * 37 + t * 2) % 70) / 100);
        const x = o.x + Math.cos(an0) * rr, y = o.y + Math.sin(an0) * rr * 0.9;
        const ang = (i % 2 ? 0.7 : -0.7);
        ctx.strokeStyle = i % 3 ? 'rgba(255,255,255,0.85)' : '#f472b6';
        ctx.lineWidth = 1.3;
        ctx.beginPath(); ctx.moveTo(x - Math.cos(ang) * 10, y - Math.sin(ang) * 10); ctx.lineTo(x + Math.cos(ang) * 10, y + Math.sin(ang) * 10); ctx.stroke();
    }
    ctx.restore();
    // vạch thời gian: cung tròn bên ngoài
    ctx.strokeStyle = '#22d3ee'; ctx.shadowBlur = 6; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(o.x, o.y, r + 4, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); ctx.stroke();
    ctx.restore();
}

// Nút Bắn: tiến độ giữ nút (B -> Nghịch Trảm), sẵn sàng Kiếm Thế Quyết / Loạn Vũ
function kzRegisterHUD() {
    if (typeof registerEmpowerHUD !== 'function') return;
    registerEmpowerHUD('kazuki', p => {
        const h = p.kazHold || 0;
        if (h > 3 && !p.kazHoldUsed && p.kazMode === 'idle') {
            if (h < KZ_HOLD_B) return { pct: h / KZ_HOLD_B * 0.5, ready: false, color: '#f472b6', label: 'HỮU TRẢM', btnIcon: 'B' };
            if (p.kazParryCD <= 0) return { pct: 0.5 + 0.5 * Math.min(1, (h - KZ_HOLD_B) / (KZ_HOLD_PARRY - KZ_HOLD_B)), ready: false, color: '#fde047', label: 'NGHỊCH TRẢM', btnIcon: '⚔' };
            return { pct: 1, ready: true, color: '#f472b6', label: 'HỮU TRẢM', btnIcon: 'B' };
        }
        const m = p.kazMarks || '';
        if (m.length >= 2 || p.kazFree) {
            const lv = (p.kazKY || 0) >= 5;
            return { pct: 1, ready: true, color: lv ? '#a78bfa' : '#fde047', label: lv ? 'LOẠN VŨ' : 'KIẾM THẾ', btnIcon: '✦', idle: true };
        }
        return { idle: true, pct: m.length / 2, ready: false, color: m === 'B' ? '#f472b6' : '#22d3ee', label: '', btnIcon: m ? m : 'A', segments: 2, lit: m.length };
    });
}
if (typeof window !== 'undefined') window.addEventListener('load', kzRegisterHUD);
