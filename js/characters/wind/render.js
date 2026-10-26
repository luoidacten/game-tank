// ==========================================
// Wind (wind) — Hình ảnh: xe lá gió mảnh (cánh quạt cong xanh bạc hà), dòng gió nén quanh xe theo Ngưng Phong,
// chấm Liên Phong, Hóa Gió (xe trong suốt + dải gió cuộn), vòng gió hiện hình, đạn gió hình lưỡi liềm,
// HUD, kết liễu "TAN VÀO HƯ KHÔNG" (lướt Mach xuyên mục tiêu -> tơ gió cắt -> vỡ vụn bị cuốn bay). Chỉ đọc state.
// ==========================================

function wdNow() { return (Date.now() % 1e6) / 1000; }

// ---------- Xe ----------
registerTankArt('wind', (p, k) => {
    const t = k.t, rc = (p.wdRecoil || 0) / 6, ch = Math.min(1, (p.wdCharge || 0) / WD_MAXCH);
    TA.treads(-12, 3.5, -10, 11, t, '#0b1220', '#334155');
    // nòng mảnh
    TA.glow(WD_CYAN, 6);
    ctx.fillStyle = TA.metal(-1.5, 1.5, '#0e7490', '#ecfeff');
    ctx.fillRect(-1.5, -16 + rc * 3, 3, 8);
    // thân: 3 cánh gió cong xoay
    const spin = t * (2 + ch * 6 + (p.wdStacks || 0) * 0.6);
    TA.glow(ch >= 0.999 ? WD_GOLD : k.teamGlow, 8 + ch * 10);
    for (let i = 0; i < 3; i++) {
        const a = spin + i * Math.PI * 2 / 3;
        ctx.save(); ctx.rotate(a);
        const g = ctx.createLinearGradient(0, 0, 10, -6);
        g.addColorStop(0, '#0f766e'); g.addColorStop(1, ch >= 0.999 ? WD_GOLD : WD_MINT);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(7, -9, 11, -2); ctx.quadraticCurveTo(5, -2, 0, 0); ctx.fill();
        ctx.restore();
    }
    TA.noGlow();
    ctx.strokeStyle = k.team; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = WD_WHITE; ctx.beginPath(); ctx.arc(0, 0, 2 + ch * 1.2, 0, Math.PI * 2); ctx.fill();
    if (k.evo1) { ctx.strokeStyle = WD_GOLD; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.arc(0, 0, 12, -Math.PI * 0.8, -Math.PI * 0.2); ctx.stroke(); }
    if (k.evo2) { ctx.strokeStyle = 'rgba(153,246,228,0.85)'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.arc(0, 0, 12, Math.PI * 0.2, Math.PI * 0.8); ctx.stroke(); }
    if (k.full) { TA.glow(WD_WHITE, 8); ctx.fillStyle = WD_WHITE; [-1, 1].forEach(s => { ctx.beginPath(); ctx.arc(s * 12, 0, 1.3, 0, Math.PI * 2); ctx.fill(); }); TA.noGlow(); }
});

// ---------- Đạn gió: lưỡi liềm gió ----------
function wdDrawBullet(b) {
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2, ang = Math.atan2(b.vy, b.vx) + Math.PI / 2;
    const r = Math.max(b.w, b.h) * 0.6, col = b.wdBlade ? WD_WHITE : b.wdFull ? WD_GOLD : (b.wdCh > 0.3 ? WD_MINT : WD_CYAN);
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang);
    // vệt sau
    ctx.globalAlpha = 0.35; ctx.strokeStyle = col; ctx.lineWidth = 1;
    for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(i * r * 0.5, r * 0.4); ctx.lineTo(i * r * 0.7, r * (2.2 + (b.wdFull ? 1.5 : 0))); ctx.stroke(); }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = b.wdFull ? 16 : 8; ctx.shadowColor = col; ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(0, r * 0.3, r, Math.PI * 1.1, Math.PI * 1.9); ctx.arc(0, r * 0.75, r * 0.85, Math.PI * 1.85, Math.PI * 1.15, true); ctx.closePath(); ctx.fill();
    ctx.fillStyle = WD_WHITE; ctx.beginPath(); ctx.arc(0, -r * 0.45, Math.max(1, r * 0.22), 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}

// ---------- Hóa Gió: xe trong suốt ----------
(function () {
    const origD = Player.prototype.draw;
    Player.prototype.draw = function () {
        if (!wdIs(this) || !(this.wdForm > 0) || this.hp <= 0) return origD.apply(this, arguments);
        wdDrawFormUnder(this);
        ctx.save(); ctx.globalAlpha = 0.38;
        try { origD.apply(this, arguments); } finally { ctx.restore(); }
        wdDrawForm(this);
    };
})();
function wdLeaf(x, y, s, a, col) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.fillStyle = col;
    ctx.beginPath(); ctx.moveTo(-s, 0); ctx.quadraticCurveTo(0, -s * 0.7, s, 0); ctx.quadraticCurveTo(0, s * 0.7, -s, 0); ctx.fill();
    ctx.restore();
}
// Hóa Gió (lớp dưới): bóng mờ lưu ảnh phía sau + dải gió dài kéo theo hướng chạy
function wdDrawFormUnder(p) {
    const cx = p.x + p.w / 2, cy = p.y + p.h / 2, t = wdNow();
    const vx = p._vx || 0, mv = Math.min(1, Math.abs(vx) / 3), dir = vx > 0.2 ? -1 : (vx < -0.2 ? 1 : 0);
    ctx.save(); ctx.lineCap = 'round';
    // lưu ảnh (afterimage)
    for (let i = 3; i >= 1; i--) {
        const off = dir * i * (7 + 5 * mv);
        if (!dir) break;
        ctx.globalAlpha = 0.22 * (1 - i / 4) + 0.08;
        const g = ctx.createRadialGradient(cx + off, cy, 2, cx + off, cy, p.w * 0.62);
        g.addColorStop(0, 'rgba(240,249,255,0.9)'); g.addColorStop(0.6, 'rgba(125,211,252,0.5)'); g.addColorStop(1, 'rgba(125,211,252,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx + off, cy, p.w * 0.62, p.h * 0.58, 0, 0, Math.PI * 2); ctx.fill();
    }
    // dải lụa gió (ribbon) kéo dài phía sau
    const d = dir || (Math.sin(t * 2) > 0 ? 1 : -1), len = 30 + 34 * mv;
    for (let i = 0; i < 4; i++) {
        const ph = t * 7 + i * 1.7, oy = (i - 1.5) * 6;
        const x0 = cx - d * p.w * 0.25, x1 = cx + d * len;
        const grd = ctx.createLinearGradient(x0, 0, x1, 0);
        grd.addColorStop(0, i % 2 ? 'rgba(153,246,228,0.85)' : 'rgba(226,232,240,0.85)'); grd.addColorStop(1, 'rgba(125,211,252,0)');
        ctx.strokeStyle = grd; ctx.lineWidth = 3.2 - Math.abs(i - 1.5) * 0.9; ctx.shadowBlur = 10; ctx.shadowColor = WD_CYAN;
        ctx.globalAlpha = 0.55 + 0.35 * mv;
        ctx.beginPath(); ctx.moveTo(x0, cy + oy);
        ctx.bezierCurveTo(cx + d * len * 0.35, cy + oy - 7 * Math.sin(ph), cx + d * len * 0.7, cy + oy + 7 * Math.cos(ph), x1, cy + oy + 4 * Math.sin(ph * 0.8));
        ctx.stroke();
    }
    ctx.restore();
}
// Hóa Gió (lớp trên): thân gió bạc-xanh trong suốt, viền sáng để vẫn thấy vị trí, xoáy + lá bay, vòng thời gian
function wdDrawForm(p) {
    const cx = p.x + p.w / 2, cy = p.y + p.h / 2, t = wdNow(), age = p.wdFormAge || 0;
    const k = p.wdForm / wdFormMax(p), vx = p._vx || 0, dir = vx > 0.2 ? -1 : (vx < -0.2 ? 1 : 0);
    ctx.save(); ctx.lineCap = 'round';
    // thân gió trong suốt
    const bw = p.w * 0.58, bh = p.h * 0.56;
    const g = ctx.createRadialGradient(cx - bw * 0.25, cy - bh * 0.3, 1, cx, cy, bw * 1.1);
    g.addColorStop(0, 'rgba(255,255,255,0.55)'); g.addColorStop(0.5, 'rgba(186,230,253,0.32)'); g.addColorStop(1, 'rgba(125,211,252,0.12)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx, cy, bw, bh, 0, 0, Math.PI * 2); ctx.fill();
    // viền sáng nhấp nháy nhẹ (đánh dấu vị trí) + màu đội
    ctx.shadowBlur = 14; ctx.shadowColor = WD_CYAN;
    ctx.globalAlpha = 0.75 + 0.2 * Math.sin(t * 8); ctx.strokeStyle = WD_SILVER; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.ellipse(cx, cy, bw, bh, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 0.8; ctx.strokeStyle = p.id === 1 ? '#3b82f6' : '#ef4444'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(cx, cy, bw + 3, bh + 3, 0, -Math.PI * 0.35, Math.PI * 0.35); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(cx, cy, bw + 3, bh + 3, 0, Math.PI * 0.65, Math.PI * 1.35); ctx.stroke();
    // đường dòng gió bên trong thân (streamlines)
    ctx.shadowBlur = 6; ctx.strokeStyle = WD_WHITE; ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
        const ph = ((t * 1.6 + i / 3) % 1), y = cy + (i - 1) * bh * 0.5, sd = dir || 1;
        ctx.globalAlpha = 0.7 * Math.sin(ph * Math.PI);
        const xa = cx + sd * bw * (0.8 - ph * 1.6);
        ctx.beginPath(); ctx.moveTo(xa, y); ctx.quadraticCurveTo(xa + sd * 6, y - 3, xa + sd * 12, y); ctx.stroke();
    }
    // xoáy khí quanh xe
    ctx.globalAlpha = 0.8; ctx.strokeStyle = WD_MINT; ctx.lineWidth = 1.4;
    for (let i = 0; i < 2; i++) { const a = t * (7 - i * 3) * (i ? -1 : 1); ctx.beginPath(); ctx.ellipse(cx, cy, p.w * (0.75 + i * 0.18), p.h * (0.5 + i * 0.12), 0, a, a + Math.PI * 0.9); ctx.stroke(); }
    // lá & hạt khí cuốn quanh rồi bay về sau
    ctx.shadowBlur = 4;
    for (let i = 0; i < 7; i++) {
        const ph = ((t * 0.9 + i / 7) % 1), a = i * 2.4 + t * 5;
        const rr = p.w * (0.55 + ph * 0.6), lx = cx + Math.cos(a) * rr + (dir || 0) * ph * 26, ly = cy + Math.sin(a) * rr * 0.55;
        ctx.globalAlpha = Math.sin(ph * Math.PI) * 0.9;
        if (i % 2) wdLeaf(lx, ly, 3.2, a * 1.3, i % 4 === 1 ? '#86efac' : WD_MINT);
        else { ctx.fillStyle = WD_WHITE; ctx.beginPath(); ctx.arc(lx, ly, 1.2, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.shadowBlur = 8; ctx.shadowColor = WD_MINT;
    // vòng thời gian còn lại
    ctx.globalAlpha = 0.9; ctx.strokeStyle = (p.wdStill || 0) > 3 ? '#fca5a5' : WD_MINT; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, p.w * 0.95, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2); ctx.stroke();
    if (p.wdAbsFx > 0) { ctx.globalAlpha = p.wdAbsFx / 10; ctx.fillStyle = WD_MINT; ctx.beginPath(); ctx.arc(cx, cy, 6 + (10 - p.wdAbsFx), 0, Math.PI * 2); ctx.fill(); }
    if (wdFull(p) && age >= 120) { ctx.globalAlpha = 0.5 + 0.3 * Math.sin(t * 10); ctx.strokeStyle = WD_GOLD; ctx.lineWidth = 1; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.arc(cx, cy, p.w * 1.15, 0, Math.PI * 2); ctx.stroke(); }
    ctx.restore();
}
// Vụ bùng gió lúc nhập / thoát Hóa Gió
function wdDrawBurst(p) {
    const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
    ctx.save(); ctx.lineCap = 'round'; ctx.shadowBlur = 12; ctx.shadowColor = WD_MINT;
    if (p.wdFx > 0) { // nhập: gió xoáy hút vào + lá bung
        const q = 1 - p.wdFx / 18, R = p.w * (2.2 - q * 1.5);
        for (let i = 0; i < 6; i++) {
            const a = i * Math.PI / 3 + q * 4;
            ctx.globalAlpha = 0.9 * (1 - q * 0.6); ctx.strokeStyle = i % 2 ? WD_MINT : WD_SILVER; ctx.lineWidth = 2.4 * (1 - q) + 0.8;
            ctx.beginPath(); ctx.arc(cx, cy, R, a, a + 0.8); ctx.stroke();
        }
        for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + q * 2; ctx.globalAlpha = 1 - q; wdLeaf(cx + Math.cos(a) * (8 + q * 40), cy + Math.sin(a) * (8 + q * 40), 3.5, a, WD_MINT); }
        ctx.globalAlpha = 0.5 * (1 - q); ctx.fillStyle = WD_WHITE; ctx.beginPath(); ctx.arc(cx, cy, p.w * 0.6 * (1 - q) + 2, 0, Math.PI * 2); ctx.fill();
    }
    if (p.wdExitFx > 0) { // thoát: luồng gió toả ra + vòng sóng
        const q = 1 - p.wdExitFx / 20;
        ctx.globalAlpha = 1 - q; ctx.strokeStyle = WD_WHITE; ctx.lineWidth = 3 * (1 - q) + 0.6;
        ctx.beginPath(); ctx.arc(cx, cy, 10 + q * 40, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = WD_MINT; ctx.lineWidth = 1.6;
        for (let i = 0; i < 10; i++) {
            const a = i * Math.PI / 5 + 0.3, r0 = 12 + q * 26, r1 = r0 + 10 + q * 10;
            ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
            ctx.quadraticCurveTo(cx + Math.cos(a + 0.25) * (r0 + r1) / 2, cy + Math.sin(a + 0.25) * (r0 + r1) / 2, cx + Math.cos(a + 0.4) * r1, cy + Math.sin(a + 0.4) * r1); ctx.stroke();
        }
        for (let i = 0; i < 6; i++) { const a = i * 1.05 + 0.5; ctx.globalAlpha = 1 - q; wdLeaf(cx + Math.cos(a) * (14 + q * 46), cy + Math.sin(a) * (14 + q * 46), 3, a + q * 6, i % 2 ? WD_MINT : '#86efac'); }
    }
    ctx.restore();
}

CharHooks.register('wind', Object.assign(CharHooks.registry.wind || {}, {
    draw() {
        const p = this;
        if (p.hp <= 0) return;
        const cx = p.x + p.w / 2, cy = p.y + p.h / 2, t = wdNow();
        ctx.save(); ctx.lineCap = 'round';
        // Ngưng Phong: gió nén xoáy vào trong
        const ch = Math.min(1, (p.wdCharge || 0) / WD_MAXCH);
        if (ch > 0.05 && !(p.wdForm > 0)) {
            const R = p.w * (1.25 - ch * 0.35), full = ch >= 0.999;
            ctx.strokeStyle = full ? WD_GOLD : WD_MINT; ctx.shadowBlur = full ? 14 : 6; ctx.shadowColor = ctx.strokeStyle;
            const n = 2 + Math.floor(ch * 4);
            for (let i = 0; i < n; i++) {
                const a = -t * (3 + ch * 5) + i * Math.PI * 2 / n;
                ctx.globalAlpha = 0.35 + ch * 0.55; ctx.lineWidth = 1 + ch;
                ctx.beginPath(); ctx.arc(cx, cy, R, a, a + 0.9); ctx.stroke();
            }
        }
        // Liên Phong: chấm sau xe
        const st = p.wdStacks || 0, mx = wdMaxStacks(p);
        if (st > 0) {
            const by = p.id === 1 ? p.y + p.h + 5 : p.y - 5;
            for (let i = 0; i < mx; i++) {
                ctx.globalAlpha = i < st ? 1 : 0.25; ctx.shadowBlur = i < st ? 5 : 0; ctx.shadowColor = WD_CYAN;
                ctx.fillStyle = p.wdBuff > 0 ? WD_GOLD : WD_CYAN;
                ctx.beginPath(); ctx.arc(cx + (i - (mx - 1) / 2) * 4, by, 1.3, 0, Math.PI * 2); ctx.fill();
            }
        }
        // Cuồng Phong Tốc Xạ: vệt gió hai bên
        if (p.wdBuff > 0) {
            ctx.globalAlpha = 0.6; ctx.strokeStyle = WD_GOLD; ctx.lineWidth = 1; ctx.shadowBlur = 6; ctx.shadowColor = WD_GOLD;
            [-1, 1].forEach(s => { const ph = (t * 4) % 1; ctx.beginPath(); ctx.moveTo(cx + s * (p.w * 0.7), cy - 8 + ph * 16); ctx.lineTo(cx + s * (p.w * 0.85), cy - 2 + ph * 16); ctx.stroke(); });
        }
        // giữ nút: vòng nạp Hóa Gió
        const hold = p.wdHold || 0;
        if (hold > 4 && !p.wdUsed && !(p.wdForm > 0)) {
            const f = Math.min(1, hold / WD_HOLD);
            ctx.globalAlpha = 1; ctx.strokeStyle = (p.wdCd || 0) > 0 ? '#64748b' : WD_MINT; ctx.lineWidth = 2; ctx.shadowBlur = 8; ctx.shadowColor = ctx.strokeStyle;
            ctx.beginPath(); ctx.arc(cx, cy, p.w * 0.85, -Math.PI / 2, -Math.PI / 2 + f * Math.PI * 2); ctx.stroke();
        }
        // vòng gió hiện hình (Evo2) / chớp hiện hình
        if (p.wdRingFx > 0) {
            const k = 1 - p.wdRingFx / 24;
            ctx.globalAlpha = 1 - k; ctx.strokeStyle = WD_MINT; ctx.lineWidth = 3 * (1 - k); ctx.shadowBlur = 12; ctx.shadowColor = WD_MINT;
            ctx.beginPath(); ctx.arc(cx, cy, 14 + k * 76, 0, Math.PI * 2); ctx.stroke();
        }
        // Vệt Gió Cắt: các nút gió lơ lửng trên làn, xoay & nhấp nháy, nối bằng sợi tơ gió
        const tr = p.wdTrail || [];
        if (tr.length) {
            ctx.shadowBlur = 10; ctx.shadowColor = WD_MINT;
            ctx.globalAlpha = 0.35; ctx.strokeStyle = WD_MINT; ctx.lineWidth = 1; ctx.setLineDash([2, 4]);
            ctx.beginPath(); tr.forEach((n, i) => { if (i) ctx.lineTo(n.x, cy); else ctx.moveTo(n.x, cy); }); ctx.stroke(); ctx.setLineDash([]);
            for (const n of tr) {
                const k = Math.min(1, n.t / 20), a0 = t * 7 + n.x * 0.1, r = 6 + (1 - n.t / WD_TRAIL_LIFE) * 3;
                ctx.globalAlpha = 0.85 * k; ctx.strokeStyle = WD_WHITE; ctx.lineWidth = 1.6;
                for (let j = 0; j < 2; j++) { ctx.beginPath(); ctx.arc(n.x, cy, r, a0 + j * Math.PI, a0 + j * Math.PI + 1.6); ctx.stroke(); }
                ctx.fillStyle = WD_MINT; ctx.beginPath(); ctx.arc(n.x, cy, 1.6, 0, Math.PI * 2); ctx.fill();
                // vạch chỉ hướng lưỡi gió sẽ bung
                ctx.globalAlpha = 0.3 * k; ctx.strokeStyle = WD_CYAN; ctx.beginPath();
                ctx.moveTo(n.x, cy + wdDir(p) * 8); ctx.lineTo(n.x, cy + wdDir(p) * 20); ctx.stroke();
            }
        }
        if (p.wdFx > 0 || p.wdExitFx > 0) wdDrawBurst(p);
        if (p.wdShieldT > 0 && p.shield > 0) {
            ctx.globalAlpha = 0.6; ctx.strokeStyle = WD_MINT; ctx.lineWidth = 1.2; ctx.setLineDash([4, 3]);
            ctx.beginPath(); ctx.arc(cx, cy, p.w * 0.9, t * 2, t * 2 + Math.PI * 2); ctx.stroke();
        }
        ctx.restore();
    },
    drawUI() {
        if (this.hp <= 0 || typeof hudExtraBar !== 'function') return;
        const p = this;
        if (p.wdForm > 0) hudExtraBar(p, 0, p.wdForm / wdFormMax(p), WD_MINT, { h: 2.5 });
        else hudExtraBar(p, 0, 1 - (p.wdCd || 0) / wdCdMax(p), (p.wdCd || 0) <= 0 ? WD_MINT : 'rgba(153,246,228,0.35)', { h: 2.5 });
        const ch = (p.wdCharge || 0) / WD_MAXCH;
        if (ch > 0.01) hudExtraBar(p, 1, ch, ch >= 0.999 ? WD_GOLD : WD_CYAN, { h: 2, marks: [0.5] });
    },
}));

// ---------- Kết liễu "TAN VÀO HƯ KHÔNG" ----------
function wdFinRand(f, i) { const s = Math.sin((f.seed + i * 97.13) * 12.9898) * 43758.5453; return s - Math.floor(s); }
function wdDrawFinisherUnder(f) {
    const t = f.t;
    if (t > 24) return;
    // không gian ngưng đọng: hạt bụi khựng lại quanh mục tiêu
    ctx.save();
    ctx.globalAlpha = t / 24 * 0.7; ctx.fillStyle = WD_SILVER;
    for (let i = 0; i < 24; i++) { const a = wdFinRand(f, i) * Math.PI * 2, r = 20 + wdFinRand(f, i + 50) * 60; ctx.fillRect(f.x + Math.cos(a) * r, f.y + Math.sin(a) * r * 0.6, 1.5, 1.5); }
    ctx.restore();
}
function wdDrawFinisherOver(f) {
    const t = f.t, W = canvas.width, d = f.dirX;
    ctx.save(); ctx.lineCap = 'round';
    // 0-24: bóng gió bạc tụ ở mép sân (phía Wind lao tới)
    if (t < 30) {
        const sx = d > 0 ? 18 : W - 18, k = Math.min(1, t / 24);
        ctx.globalAlpha = k; ctx.strokeStyle = WD_SILVER; ctx.shadowBlur = 14; ctx.shadowColor = WD_WHITE; ctx.lineWidth = 1.5;
        for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(sx, f.y, 6 + i * 5, 3 + i * 2, 0, t * 0.4 + i, t * 0.4 + i + Math.PI * 1.4); ctx.stroke(); }
        // vạch dẫn đường mờ
        ctx.globalAlpha = k * 0.25; ctx.setLineDash([6, 8]); ctx.beginPath(); ctx.moveTo(sx, f.y); ctx.lineTo(d > 0 ? W : 0, f.y); ctx.stroke(); ctx.setLineDash([]);
    }
    // 24-44: lướt Mach xuyên mục tiêu — đầu nhọn + nón sóng xung kích + vệt tơ bạc
    if (t >= 24 && t < 60) {
        const k = Math.min(1, (t - 24) / 14), hx = d > 0 ? -30 + k * (W + 60) : W + 30 - k * (W + 60);
        const fade = t < 44 ? 1 : (60 - t) / 16;
        const x0 = d > 0 ? 0 : W;
        // vệt chính
        const g = ctx.createLinearGradient(x0, 0, hx, 0);
        g.addColorStop(0, 'rgba(226,232,240,0)'); g.addColorStop(1, 'rgba(240,249,255,0.95)');
        ctx.globalAlpha = fade; ctx.strokeStyle = g; ctx.lineWidth = 6; ctx.shadowBlur = 20; ctx.shadowColor = WD_WHITE;
        ctx.beginPath(); ctx.moveTo(x0, f.y); ctx.lineTo(hx, f.y); ctx.stroke();
        ctx.lineWidth = 1; ctx.strokeStyle = WD_CYAN;
        for (let i = -2; i <= 2; i++) { if (!i) continue; ctx.beginPath(); ctx.moveTo(x0, f.y + i * 5); ctx.lineTo(hx - d * Math.abs(i) * 14, f.y + i * 2.5); ctx.stroke(); }
        if (t < 44) {
            // nón Mach
            ctx.strokeStyle = WD_WHITE; ctx.lineWidth = 2;
            for (let i = 0; i < 3; i++) {
                const back = 18 + i * 16, sp = 14 + i * 12;
                ctx.globalAlpha = fade * (0.9 - i * 0.25);
                ctx.beginPath(); ctx.moveTo(hx - d * back, f.y - sp); ctx.quadraticCurveTo(hx - d * 4, f.y, hx - d * back, f.y + sp); ctx.stroke();
            }
            ctx.globalAlpha = fade; ctx.fillStyle = WD_WHITE; ctx.beginPath(); ctx.ellipse(hx, f.y, 9, 4, 0, 0, Math.PI * 2); ctx.fill();
        }
        // chớp trắng khi xuyên qua mục tiêu
        if (Math.abs(hx - f.x) < 40) { ctx.globalAlpha = 0.25; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, canvas.height); }
    }
    // xe địch (khối tối) còn nguyên tới khi vỡ
    const cutK = t < 44 ? 0 : Math.min(1, (t - 44) / 50);
    if (t >= 24 && t < 100) {
        ctx.globalAlpha = 1; ctx.shadowBlur = 0;
        ctx.fillStyle = '#1e293b'; ctx.fillRect(f.x - f.w / 2, f.y - f.h / 2, f.w, f.h);
        ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1; ctx.strokeRect(f.x - f.w / 2, f.y - f.h / 2, f.w, f.h);
    }
    // 44-100: hàng chục vết cắt tơ gió
    if (t >= 44 && t < 112) {
        const n = 26, shown = Math.floor(cutK * n);
        ctx.shadowBlur = 8; ctx.shadowColor = WD_CYAN;
        for (let i = 0; i < shown; i++) {
            const a = (wdFinRand(f, i) - 0.5) * 1.2 + (i % 2 ? 0 : Math.PI), L = 26 + wdFinRand(f, i + 9) * 34;
            const ox = (wdFinRand(f, i + 3) - 0.5) * f.w, oy = (wdFinRand(f, i + 5) - 0.5) * f.h;
            const age = Math.min(1, (cutK * n - i) / 4);
            ctx.globalAlpha = (t > 100 ? (112 - t) / 12 : 1) * (0.5 + 0.5 * age);
            ctx.strokeStyle = i % 3 ? WD_SILVER : WD_CYAN; ctx.lineWidth = 0.6 + (1 - age) * 1.2;
            ctx.beginPath(); ctx.moveTo(f.x + ox - Math.cos(a) * L / 2 * age, f.y + oy - Math.sin(a) * L / 2 * age);
            ctx.lineTo(f.x + ox + Math.cos(a) * L / 2 * age, f.y + oy + Math.sin(a) * L / 2 * age); ctx.stroke();
        }
    }
    // 100-170: vỡ vụn, mảnh bị gió cuốn bay ngang + dòng gió quét
    if (t >= 100) {
        const k = (t - 100) / 70;
        ctx.shadowBlur = 0;
        for (let i = 0; i < 18; i++) {
            const r1 = wdFinRand(f, i + 20), r2 = wdFinRand(f, i + 40);
            const px = f.x + (r1 - 0.5) * f.w + d * k * k * (160 + r2 * 220), py = f.y + (r2 - 0.5) * f.h + Math.sin(k * 6 + i) * 10 * k - k * 20 * r1;
            ctx.globalAlpha = Math.max(0, 1 - k * 1.1);
            ctx.save(); ctx.translate(px, py); ctx.rotate(k * (4 + r1 * 8) * (i % 2 ? 1 : -1));
            ctx.fillStyle = i % 4 ? '#334155' : '#94a3b8'; const s = 2 + r2 * 5;
            ctx.beginPath(); ctx.moveTo(-s, -s * 0.6); ctx.lineTo(s, -s * 0.3); ctx.lineTo(s * 0.4, s); ctx.closePath(); ctx.fill();
            ctx.restore();
        }
        ctx.strokeStyle = WD_SILVER; ctx.lineWidth = 1;
        for (let i = 0; i < 7; i++) {
            const yy = f.y + (i - 3) * 9, off = ((k * 1.6 + i * 0.13) % 1) * (W + 120) - 60, x = d > 0 ? off : W - off;
            ctx.globalAlpha = 0.5 * Math.max(0, 1 - k);
            ctx.beginPath(); ctx.moveTo(x - d * 50, yy); ctx.quadraticCurveTo(x - d * 20, yy - 5, x, yy); ctx.stroke();
        }
    }
    // chữ
    if (t > 40 && t < 165) {
        ctx.globalAlpha = Math.min(1, (t - 40) / 15) * (t > 145 ? (165 - t) / 20 : 1);
        ctx.font = "bold 17px 'Orbitron', Arial"; ctx.textAlign = 'center';
        ctx.fillStyle = WD_WHITE; ctx.shadowBlur = 14; ctx.shadowColor = WD_CYAN;
        const ty = f.y < canvas.height / 2 ? f.y + 110 : f.y - 100, tx = Math.max(115, Math.min(W - 115, f.x));
        if (typeof drawWorldText === 'function') drawWorldText(ctx, 'TAN VÀO HƯ KHÔNG', tx, ty);
        else ctx.fillText('TAN VÀO HƯ KHÔNG', tx, ty);
    }
    ctx.restore();
}
function wdFxOver() {
    if (typeof bodyEffects === 'undefined') return;
    for (const e of bodyEffects) if (e instanceof WdFinisher && e.active) e.drawOver();
}
