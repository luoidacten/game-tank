// ==========================================
// Tỉnh (tinh) — Hình ảnh: khối đá trấn áp tím chàm với "Con Mắt Khép Hờ" (mở dần theo Khó Chịu),
// vành Ấn Ngưng trên địch (3 vạch đồng hồ cát), xiềng choáng; Vùng Cấm Chế với rào trọng lực;
// Đạn Cấm Chế; HUD; kết liễu "NGƯNG ĐỌNG VĨNH HẰNG". Chỉ đọc state.
// ==========================================

function tnNow() { return (Date.now() % 1e6) / 1000; }

// ---------- Xe Tỉnh ----------
registerTankArt('tinh', (p, k) => {
    const t = k.t, ann = (p.tnAnn || 0) / tnMax(p), rc = (p.tnRecoil || 0) / 8, ready = (p.tnAnn || 0) >= tnCost(p) || p.tnLoaded;
    TA.treads(-15, 4.4, -11, 13, t, '#0b1020', '#3730a3');
    // nòng dày phẳng
    ctx.fillStyle = TA.metal(-3, 3, '#312e81', '#a5b4fc');
    TA.rr(-3, -16 + rc * 3, 6, 9, 1); ctx.fill();
    ctx.fillStyle = ready ? TN_VIO : '#6366f1'; ctx.fillRect(-3.5, -16.6 + rc * 3, 7, 1.6);
    // thân: khối đá vuông vát góc
    TA.glow(k.teamGlow, 7);
    ctx.fillStyle = TA.metal(-11, 11, '#0f0f23', '#312e81');
    ctx.beginPath(); ctx.moveTo(-8, -9); ctx.lineTo(8, -9); ctx.lineTo(11, -6); ctx.lineTo(11, 9); ctx.lineTo(-11, 9); ctx.lineTo(-11, -6); ctx.closePath(); ctx.fill();
    TA.noGlow();
    ctx.strokeStyle = k.team; ctx.lineWidth = 0.9; ctx.stroke();
    // vạch ấn
    ctx.strokeStyle = 'rgba(167,139,250,0.75)'; ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(-8, 6); ctx.lineTo(8, 6); ctx.moveTo(-8, 3.6); ctx.lineTo(-4, 3.6); ctx.moveTo(4, 3.6); ctx.lineTo(8, 3.6); ctx.stroke();
    // Con Mắt Khép Hờ: mi mở theo Khó Chịu
    const open = 0.18 + 0.82 * Math.min(1, ann * 1.6), ey = -2.5;
    ctx.fillStyle = '#05050f'; ctx.beginPath(); ctx.ellipse(0, ey, 7.5, 3.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.ellipse(0, ey, 7, 3.3 * open, 0, 0, Math.PI * 2); ctx.clip();
    const g = ctx.createRadialGradient(0, ey, 0.3, 0, ey, 4);
    g.addColorStop(0, '#fff'); g.addColorStop(0.4, ready ? '#f0abfc' : '#c4b5fd'); g.addColorStop(1, '#4c1d95');
    TA.glow(ready ? TN_PINK : TN_VIO, 8); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, ey, 3.2, 0, Math.PI * 2); ctx.fill(); TA.noGlow();
    ctx.fillStyle = '#05050f'; ctx.fillRect(-0.5, ey - 2.4, 1, 4.8);
    ctx.restore();
    ctx.strokeStyle = '#a5b4fc'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.ellipse(0, ey, 7.5, 3.6 * open + 0.2, 0, Math.PI, 0); ctx.stroke();
    if (k.evo1) { ctx.fillStyle = TN_VIO; ctx.fillRect(-10, -4, 1.6, 6); ctx.fillRect(8.4, -4, 1.6, 6); }
    if (k.evo2) { ctx.strokeStyle = 'rgba(240,171,252,0.8)'; ctx.lineWidth = 0.7; ctx.strokeRect(-6, 7, 12, 1.6); }
    if (p.tnLoaded) { ctx.save(); ctx.globalAlpha = 0.5 + 0.4 * Math.sin(t * 10); ctx.strokeStyle = TN_PINK; ctx.lineWidth = 1.4; TA.glow(TN_PINK, 12); ctx.strokeRect(-12.5, -10.5, 25, 21); TA.noGlow(); ctx.restore(); }
});

// ---------- Đạn ----------
function tnDrawBullet(b) {
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2, up = (b.vy || 0) < 0;
    ctx.save(); ctx.translate(cx, cy); if (!up) ctx.rotate(Math.PI);
    if (b.tnSup) {
        ctx.strokeStyle = 'rgba(167,139,250,0.45)'; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(0, 8); ctx.lineTo(0, 40); ctx.stroke();
        ctx.shadowBlur = 18; ctx.shadowColor = TN_VIO;
        const g = ctx.createRadialGradient(0, 0, 1, 0, 0, 9);
        g.addColorStop(0, '#ffffff'); g.addColorStop(0.5, '#c4b5fd'); g.addColorStop(1, 'rgba(76,29,149,0.2)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.fill();
        const a = tnNow() * 6;
        ctx.strokeStyle = TN_PINK; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.ellipse(0, 0, 12, 4, a, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(0, 0, 12, 4, -a, 0, Math.PI * 2); ctx.stroke();
    } else {
        ctx.strokeStyle = 'rgba(129,140,248,0.4)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, 4); ctx.lineTo(0, 16); ctx.stroke();
        ctx.shadowBlur = 10; ctx.shadowColor = b.tnCritB ? '#fde047' : TN_IND; ctx.fillStyle = b.tnCritB ? '#fef08a' : '#e0e7ff';
        ctx.fillRect(-3, -6, 6, 12);
        ctx.fillStyle = TN_VIO; ctx.fillRect(-3, -1, 6, 2);
    }
    ctx.restore();
}

// ---------- Vùng Cấm Chế ----------
function tnDrawZone(z) {
    const t = z.t, k = Math.min(1, t / 12), fade = Math.min(1, (z.dur - t) / 20), R = z.r * (0.6 + 0.4 * k);
    const h = 34, x0 = z.x - R, x1 = z.x + R, y = z.y;
    ctx.save(); ctx.globalAlpha = fade;
    // nền lún
    const g = ctx.createLinearGradient(x0, 0, x1, 0);
    g.addColorStop(0, 'rgba(76,29,149,0.38)'); g.addColorStop(0.5, 'rgba(49,46,129,0.16)'); g.addColorStop(1, 'rgba(76,29,149,0.38)');
    ctx.fillStyle = g; ctx.fillRect(x0, y - h, R * 2, h * 2);
    // gợn trọng lực đồng tâm co vào
    ctx.strokeStyle = 'rgba(167,139,250,0.55)'; ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
        const q = 1 - ((t / 50 + i / 3) % 1);
        ctx.globalAlpha = fade * q * 0.8;
        ctx.beginPath(); ctx.ellipse(z.x, y, R * q, h * q, 0, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.globalAlpha = fade;
    // rào trọng lực 2 mép
    ctx.shadowBlur = 14; ctx.shadowColor = z.caging ? TN_PINK : TN_VIO;
    ctx.strokeStyle = z.caging ? TN_PINK : TN_VIO; ctx.lineWidth = 2.4;
    for (const xx of [x0, x1]) {
        ctx.beginPath(); ctx.moveTo(xx, y - h); ctx.lineTo(xx, y + h); ctx.stroke();
        for (let j = -2; j <= 2; j++) {
            const yy = y + j * 13 + Math.sin(t * 0.2 + j) * 1.5, s = xx === x0 ? 1 : -1;
            ctx.beginPath(); ctx.moveTo(xx, yy); ctx.lineTo(xx + s * 6, yy - 4); ctx.moveTo(xx, yy); ctx.lineTo(xx + s * 6, yy + 4); ctx.stroke();
        }
    }
    // khung đồng hồ (thời gian còn lại)
    ctx.shadowBlur = 0; ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(224,231,255,0.7)';
    const left = 1 - t / z.dur;
    ctx.beginPath(); ctx.moveTo(x0, y - h); ctx.lineTo(x0 + R * 2 * left, y - h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x1, y + h); ctx.lineTo(x1 - R * 2 * left, y + h); ctx.stroke();
    if (z.drain) {
        ctx.fillStyle = 'rgba(240,171,252,0.6)';
        for (let i = 0; i < 6; i++) { const px = x0 + ((i * 47 + t * 1.3) % (R * 2)), py = y - h + ((i * 23 + t * 0.6) % (h * 2)); ctx.fillRect(px, py, 1.6, 1.6); }
    }
    ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(224,231,255,0.75)';
    ctx.fillText('CẤM CHẾ', z.x, y + (z.team === 1 ? h + 10 : -h - 4));
    ctx.restore();
}

// ---------- Ấn Ngưng & xiềng choáng trên địch ----------
function tnDrawMarks(owner, e) {
    if (!e || e.hp <= 0) return;
    const cx = e.x + e.w / 2, cy = e.y + e.h / 2, n = e.tnStasis || 0, pop = (e.tnPop || 0) / 18;
    ctx.save();
    if (n > 0) {
        const R = Math.max(e.w, e.h) * 0.75 + pop * 4;
        ctx.strokeStyle = TN_VIO; ctx.lineWidth = 1.4; ctx.shadowBlur = 8 + pop * 8; ctx.shadowColor = TN_VIO;
        for (let i = 0; i < 3; i++) {
            const a0 = -Math.PI / 2 + i * Math.PI * 2 / 3 + 0.18, a1 = a0 + Math.PI * 2 / 3 - 0.36;
            ctx.globalAlpha = i < n ? 1 : 0.22;
            ctx.beginPath(); ctx.arc(cx, cy, R, a0, a1); ctx.stroke();
            if (i < n) {
                const am = (a0 + a1) / 2, px = cx + Math.cos(am) * R, py = cy + Math.sin(am) * R;
                ctx.fillStyle = TN_ICE; ctx.beginPath(); ctx.moveTo(px - 3, py - 3.5); ctx.lineTo(px + 3, py - 3.5); ctx.lineTo(px - 3, py + 3.5); ctx.lineTo(px + 3, py + 3.5); ctx.closePath(); ctx.fill();
            }
        }
    }
    if (e.tnStunT > 0) {
        const a = Math.min(1, e.tnStunT / 20);
        ctx.globalAlpha = 0.85 * a; ctx.strokeStyle = TN_ICE; ctx.lineWidth = 1.6; ctx.shadowBlur = 10; ctx.shadowColor = TN_VIO;
        for (const s of [-1, 1]) {
            ctx.beginPath(); ctx.moveTo(cx + s * (e.w / 2 + 14), cy - 18);
            for (let i = 1; i <= 6; i++) { const yy = cy - 18 + i * 6; ctx.lineTo(cx + s * (e.w / 2 + 14 - i * 2.2), yy + (i % 2 ? -2 : 2)); }
            ctx.stroke();
            ctx.beginPath(); ctx.ellipse(cx + s * (e.w / 2 + 1), cy, 2.5, 4, 0, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.globalAlpha = 0.18 * a; ctx.fillStyle = TN_IND; ctx.fillRect(e.x - 4, e.y - 4, e.w + 8, e.h + 8);
    }
    ctx.restore();
}

CharHooks.register('tinh', Object.assign(CharHooks.registry.tinh || {}, {
    draw() {
        const p = this;
        if (p.hp <= 0) return;
        const hold = p.tnHold || 0, cx = p.x + p.w / 2, cy = p.y + p.h / 2;
        if (hold > 4 && !p.tnLoaded && hold <= TN_HOLD) {
            const f = Math.min(1, hold / TN_HOLD), ok = (p.tnAnn || 0) >= tnCost(p);
            ctx.save(); ctx.strokeStyle = ok ? TN_PINK : '#64748b'; ctx.lineWidth = 2; ctx.shadowBlur = 8; ctx.shadowColor = ctx.strokeStyle;
            ctx.beginPath(); ctx.arc(cx, cy, p.w * 0.8, -Math.PI / 2, -Math.PI / 2 + f * Math.PI * 2); ctx.stroke(); ctx.restore();
        }
    },
    drawUI() {
        if (this.hp <= 0) return;
        const e = tnEnemy(this);
        if (e) tnDrawMarks(this, e);
        if (typeof hudExtraBar === 'function') {
            const m = tnMax(this), c = tnCost(this), marks = [];
            for (let v = c; v < m; v += c) marks.push(v / m);
            const ready = (this.tnAnn || 0) >= c;
            hudExtraBar(this, 0, (this.tnAnn || 0) / m, this.tnLoaded ? '#fdf4ff' : ready ? TN_PINK : TN_VIO, { h: 3, marks });
        }
    },
}));

// ---------- Kết liễu "NGƯNG ĐỌNG VĨNH HẰNG" ----------
function tnDrawFinisherUnder(f) {
    const W = canvas.width, H = canvas.height, t = f.t;
    const fade = t > 148 ? Math.max(0, 1 - (t - 148) / 22) : 1, k = Math.min(1, t / 20);
    ctx.save();
    // Không gian hoá trắng đen: khử bão hoà toàn sân
    ctx.globalAlpha = fade * k; ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.35 * fade * k; ctx.fillStyle = '#0a0a12'; ctx.fillRect(0, 0, W, H);
    // vòng sóng thời gian đứng im (các vòng tròn tĩnh)
    ctx.globalAlpha = 0.35 * fade; ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 0.8; ctx.setLineDash([2, 6]);
    for (let i = 1; i <= 4; i++) { ctx.beginPath(); ctx.arc(f.x, f.y, 30 * i * k, 0, Math.PI * 2); ctx.stroke(); }
    ctx.setLineDash([]);
    ctx.restore();
}
function tnDrawFinisherOver(f) {
    const W = canvas.width, H = canvas.height, t = f.t;
    const fade = t > 148 ? Math.max(0, 1 - (t - 148) / 22) : 1;
    const toC = f.y < H / 2 ? 1 : -1;
    ctx.save(); ctx.globalAlpha = fade;
    // 1) Hạt bụi lơ lửng bị đóng băng giữa không trung
    ctx.fillStyle = '#e5e7eb';
    for (let i = 0; i < 26; i++) {
        const a = (f.seed + i * 137) % 360 * Math.PI / 180, d = 40 + ((f.seed * 7 + i * 53) % 120);
        ctx.globalAlpha = fade * 0.5; ctx.fillRect(f.x + Math.cos(a) * d, f.y + Math.sin(a) * d * 0.8, 1.6, 1.6);
    }
    ctx.globalAlpha = fade;
    // 2) Xiềng xích trọng lực bắn từ mép màn hình khoá bánh xe (8 sợi, lần lượt)
    const anchors = [[0, f.y - 70], [W, f.y - 70], [0, f.y + 70], [W, f.y + 70], [0, f.y], [W, f.y], [f.x - 90, f.y - 160 * toC], [f.x + 90, f.y - 160 * toC]];
    const wheels = [[-1, -1], [1, -1], [-1, 1], [1, 1], [-1, 0], [1, 0], [-0.5, -1], [0.5, -1]];
    const hw = f.vw / 2 + 2;
    anchors.forEach((A, i) => {
        const kk = Math.min(1, (t - 10 - i * 5) / 12);
        if (kk <= 0) return;
        const tx = f.x + wheels[i][0] * hw, ty = f.y + wheels[i][1] * hw;
        const ex = A[0] + (tx - A[0]) * kk, ey = A[1] + (ty - A[1]) * kk;
        const dx = ex - A[0], dy = ey - A[1], L = Math.hypot(dx, dy) || 1, n = Math.floor(L / 9);
        const taut = t > 10 + i * 5 + 12 ? Math.sin((t + i) * 0.9) * 0.4 : 0;
        ctx.strokeStyle = '#d1d5db'; ctx.lineWidth = 1.5; ctx.shadowBlur = 6; ctx.shadowColor = TN_VIO;
        for (let j = 0; j < n; j++) {
            const q = (j + 0.5) / n, px = A[0] + dx * q - dy / L * taut, py = A[1] + dy * q + dx / L * taut;
            ctx.save(); ctx.translate(px, py); ctx.rotate(Math.atan2(dy, dx) + (j % 2 ? Math.PI / 2 : 0) * 0);
            ctx.beginPath(); ctx.ellipse(0, 0, 4.5, j % 2 ? 1.2 : 2.6, 0, 0, Math.PI * 2); ctx.stroke();
            ctx.restore();
        }
        if (kk >= 1) { ctx.fillStyle = TN_VIO; ctx.beginPath(); ctx.arc(tx, ty, 3, 0, Math.PI * 2); ctx.fill(); }
    });
    ctx.shadowBlur = 0;
    // 3) Quả cầu trọng lực khổng lồ hạ xuống từ phía Tỉnh rồi nghiền
    if (t >= 60 && t < 128) {
        const kk = Math.min(1, (t - 60) / 60), ease = kk * kk;
        const R = 18 + 26 * Math.min(1, (t - 60) / 30);
        const oy = f.y - toC * 220, cy = oy + (f.y - oy) * ease;
        const g = ctx.createRadialGradient(f.x, cy, 2, f.x, cy, R);
        g.addColorStop(0, '#000000'); g.addColorStop(0.7, '#1e1b4b'); g.addColorStop(0.92, '#a78bfa'); g.addColorStop(1, 'rgba(167,139,250,0)');
        ctx.fillStyle = g; ctx.shadowBlur = 26; ctx.shadowColor = TN_VIO;
        ctx.beginPath(); ctx.arc(f.x, cy, R, 0, Math.PI * 2); ctx.fill();
        // vành bẻ cong không gian
        ctx.strokeStyle = 'rgba(224,231,255,0.7)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(f.x, cy, R * 1.5, R * 0.45, t * 0.05, 0, Math.PI * 2); ctx.stroke();
        ctx.shadowBlur = 0;
    }
    // 4) Nghiền: chớp trắng + tro bụi xám bay lên
    if (t >= 120 && t < 128) { ctx.globalAlpha = (128 - t) / 8 * 0.8; ctx.fillStyle = '#f8fafc'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = fade; }
    if (t >= 120) {
        const q = (t - 120) / 50;
        for (let i = 0; i < 30; i++) {
            const a = (f.seed * 3 + i * 97) % 360 * Math.PI / 180, sp = 0.6 + ((i * 31) % 10) / 10;
            ctx.globalAlpha = fade * Math.max(0, 1 - q) * 0.8; ctx.fillStyle = i % 3 ? '#6b7280' : '#d1d5db';
            ctx.fillRect(f.x + Math.cos(a) * 60 * q * sp, f.y + Math.sin(a) * 30 * q * sp - 50 * q * toC, 2.2, 2.2);
        }
        ctx.globalAlpha = fade;
    }
    // 5) Chữ
    if (t >= 18) {
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        const ty = f.y + toC * 120;
        if (t < 120) {
            const s = '"ĐỨNG YÊN CHO TA."', n = Math.min(s.length, Math.floor((t - 18) / 2));
            ctx.font = 'italic bold 13px monospace'; ctx.fillStyle = '#e5e7eb'; ctx.shadowBlur = 8; ctx.shadowColor = TN_VIO;
            ctx.fillText(s.slice(0, n), W / 2, ty);
        } else {
            const k = Math.min(1, (t - 120) / 10), sc = 1.5 - 0.5 * k;
            ctx.save(); ctx.translate(W / 2, ty); ctx.scale(sc, sc);
            ctx.shadowBlur = 18; ctx.shadowColor = TN_VIO; ctx.fillStyle = '#f5f3ff'; ctx.font = 'bold 26px monospace';
            ctx.fillText('NGƯNG ĐỌNG', 0, -12);
            ctx.fillStyle = '#c4b5fd'; ctx.font = 'bold 16px monospace'; ctx.fillText('VĨNH HẰNG', 0, 14);
            ctx.restore();
        }
    }
    ctx.restore();
}

function tnFxOver() {
    if (typeof bodyEffects === 'undefined') return;
    for (const e of bodyEffects) if (e instanceof TnFinisher && e.active) e.drawOver();
}
