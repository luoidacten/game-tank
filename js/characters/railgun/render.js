// ==========================================
// Railgun (railgun) — Hình ảnh: xe pháo ray đôi (2 thanh ray dẫn điện + cuộn cảm), cầu năng lượng đổi màu theo mốc
// (trắng -> xanh lam -> tím hồ quang -> lõi lazer vàng -> quá tải trắng vàng), Vùng Điện Tích (lưới từ trường + đường sức),
// tia lazer điện từ vàng quấn vòng xoắn xanh, hồng tâm khoá mục tiêu, HUD, kết liễu "LEVEL 5: RAILGUN". Chỉ đọc state.
// ==========================================

function rgNow() { return (Date.now() % 1e6) / 1000; }
function rgRand(s) { const v = Math.sin(s * 12.9898) * 43758.5453; return v - Math.floor(v); }
// tia hồ quang răng cưa
function rgArc(x0, y0, x1, y1, seed, jag, seg) {
    seg = seg || 6;
    ctx.beginPath(); ctx.moveTo(x0, y0);
    const dx = x1 - x0, dy = y1 - y0, L = Math.max(1, Math.hypot(dx, dy)), nx = -dy / L, ny = dx / L;
    for (let i = 1; i < seg; i++) {
        const k = i / seg, o = (rgRand(seed + i * 7.31) - 0.5) * 2 * jag;
        ctx.lineTo(x0 + dx * k + nx * o, y0 + dy * k + ny * o);
    }
    ctx.lineTo(x1, y1); ctx.stroke();
}

// ---------- Xe ----------
registerTankArt('railgun', (p, k) => {
    const t = k.t, f = (p.rgOrbs || []).find(o => !o.z), lv = f ? rgLv(p, f.c) : -1, col = lv >= 0 ? RG_LV_COL[lv] : RG_CYAN;
    TA.treads(-13, 4, -11, 12, t, '#0b1220', '#334155');
    // thân
    ctx.fillStyle = TA.vgrad(-9, 11, '#1e293b', '#0f172a');
    TA.rr(-9, -7, 18, 18, 4); ctx.fill();
    ctx.strokeStyle = k.team; ctx.lineWidth = 1; TA.rr(-9, -7, 18, 18, 4); ctx.stroke();
    // 2 thanh ray dẫn điện
    TA.glow(col, lv >= 0 ? 10 : 5);
    ctx.fillStyle = TA.metal(-6, -3, '#475569', '#e2e8f0'); ctx.fillRect(-6, -19, 3, 16);
    ctx.fillStyle = TA.metal(3, 6, '#475569', '#e2e8f0'); ctx.fillRect(3, -19, 3, 16);
    // cuộn cảm giữa 2 ray
    ctx.strokeStyle = col; ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) { const y = -17 + i * 3.5 + ((t * 8) % 3.5); ctx.globalAlpha = 0.5 + 0.5 * (lv >= 0 ? 1 : 0.4); ctx.beginPath(); ctx.moveTo(-3, y); ctx.lineTo(3, y); ctx.stroke(); }
    ctx.globalAlpha = 1;
    // hồ quang nhảy giữa 2 ray khi đang giữ cầu
    if (lv >= 0) { ctx.lineWidth = 0.8; ctx.strokeStyle = RG_WHITE; rgArc(-3, -16, 3, -10, Math.floor(t * 20), 2, 4); }
    TA.noGlow();
    // lõi
    ctx.fillStyle = '#020617'; ctx.beginPath(); ctx.arc(0, 4, 4.5, 0, Math.PI * 2); ctx.fill();
    TA.glow(col, 8); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 4, 2.2 + Math.sin(t * 6) * 0.4, 0, Math.PI * 2); ctx.fill(); TA.noGlow();
    if (k.evo1) { ctx.strokeStyle = RG_BLUE; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(0, 4, 7, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke(); }
    if (k.evo2) { ctx.strokeStyle = RG_VIO; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(0, 4, 7, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); }
    if (k.full) { TA.glow(RG_GOLD, 8); ctx.fillStyle = RG_GOLD; [-1, 1].forEach(s => { ctx.beginPath(); ctx.arc(s * 9, 9, 1.3, 0, Math.PI * 2); ctx.fill(); }); TA.noGlow(); }
});

// ---------- Cầu năng lượng ----------
function rgDrawOrb(x, y, c, p, t, seed) {
    const lv = rgLv(p, c), col = RG_LV_COL[lv], r = 4.5 + lv * 1.1;
    ctx.save();
    ctx.shadowBlur = 10 + lv * 4; ctx.shadowColor = col;
    if (lv >= 3) {
        // Lõi Lazer: thoi kim cương vàng + vòng từ xoay
        ctx.fillStyle = lv >= 4 ? '#fffbe6' : RG_GOLD;
        ctx.beginPath(); ctx.moveTo(x, y - r - 3); ctx.lineTo(x + r * 0.7, y); ctx.lineTo(x, y + r + 3); ctx.lineTo(x - r * 0.7, y); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = RG_BLUE; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.ellipse(x, y, r + 4, (r + 4) * 0.35, t * 3 + seed, 0, Math.PI * 2); ctx.stroke();
        if (lv >= 4) { ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.ellipse(x, y, r + 6, (r + 6) * 0.3, -t * 4 + seed, 0, Math.PI * 2); ctx.stroke(); }
    } else {
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, '#ffffff'); g.addColorStop(0.45, col); g.addColorStop(1, 'rgba(15,23,42,0.2)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = col; ctx.lineWidth = 0.9; ctx.globalAlpha = 0.8;
        ctx.beginPath(); ctx.arc(x, y, r + 2.5, t * 4 + seed, t * 4 + seed + 1.6); ctx.stroke();
        if (lv >= 2) { ctx.strokeStyle = '#f5d0fe'; rgArc(x - r - 3, y, x + r + 3, y, Math.floor(t * 15) + seed, 3, 4); }
    }
    // vòng tiến độ tới mốc kế
    const nx = [60, 120, 180, rgFull(p) ? 240 : 1e9][Math.min(3, lv)];
    if (nx < 1e9 && lv < 4 && !(lv === 3 && !rgFull(p))) {
        const pv = [0, 60, 120, 180][lv], k = Math.max(0, Math.min(1, (c - pv) / (nx - pv)));
        ctx.globalAlpha = 0.9; ctx.shadowBlur = 0; ctx.strokeStyle = RG_LV_COL[Math.min(4, lv + 1)]; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.arc(x, y, r + 5, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
}
function rgDrawShot(b) {
    const x = b.x + b.w / 2, y = b.y + b.h / 2, lv = b.rgLv || 0, col = RG_LV_COL[lv], sp = Math.hypot(b.vx, b.vy) || 1;
    const ux = b.vx / sp, uy = b.vy / sp, L = 10 + lv * 6;
    ctx.save(); ctx.lineCap = 'round';
    ctx.shadowBlur = 12 + lv * 3; ctx.shadowColor = col;
    ctx.strokeStyle = col; ctx.globalAlpha = 0.55; ctx.lineWidth = b.w * 0.9;
    ctx.beginPath(); ctx.moveTo(x - ux * L, y - uy * L); ctx.lineTo(x, y); ctx.stroke();
    ctx.globalAlpha = 1; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(2, b.w * 0.35);
    ctx.beginPath(); ctx.moveTo(x - ux * L * 0.6, y - uy * L * 0.6); ctx.lineTo(x + ux * 2, y + uy * 2); ctx.stroke();
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, b.w / 2, 0, Math.PI * 2); ctx.fill();
    if (lv >= 1) { ctx.strokeStyle = col; ctx.lineWidth = 0.8; rgArc(x - ux * L, y - uy * L, x, y, Math.floor(rgNow() * 30) + (b.x | 0), 3, 4); }
    ctx.restore();
}
function rgDrawBeam(e) {
    const k = e.t / e.dur, a = 1 - k, top = Math.min(e.y0, e.y1), h = Math.abs(e.y1 - e.y0), t = rgNow();
    ctx.save();
    const w = 16 * (1 - k * 0.6);
    ctx.globalAlpha = a * 0.5; ctx.fillStyle = e.over ? '#fff7c2' : RG_ORANGE; ctx.shadowBlur = 24; ctx.shadowColor = RG_GOLD;
    ctx.fillRect(e.x - w, top, w * 2, h);
    ctx.globalAlpha = a; ctx.fillStyle = RG_GOLD; ctx.fillRect(e.x - w * 0.5, top, w, h);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(e.x - w * 0.2, top, w * 0.4, h);
    // vòng xoắn điện từ xanh lam
    ctx.shadowColor = RG_BLUE; ctx.strokeStyle = RG_BLUE; ctx.lineWidth = 1.6;
    const sgn = e.y1 > e.y0 ? 1 : -1;
    for (let y = 0; y < h; y += 26) {
        const yy = e.y0 + sgn * ((y + e.t * 9) % h);
        ctx.globalAlpha = a * 0.9;
        ctx.beginPath(); ctx.ellipse(e.x, yy, w + 6, 4, 0, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.strokeStyle = RG_WHITE; ctx.lineWidth = 1; ctx.globalAlpha = a * 0.8;
    for (let i = 0; i < 3; i++) rgArc(e.x + (i - 1) * w, e.y0, e.x - (i - 1) * w, e.y1, Math.floor(t * 20) + i * 13, 7, 14);
    ctx.restore();
}

CharHooks.register('railgun', Object.assign(CharHooks.registry.railgun || {}, {
    draw() {
        const p = this;
        if (p.hp <= 0) return;
        const t = rgNow(), d = rgDir(p), cx = rgCx(p), cy = p.y + p.h / 2;
        ctx.save(); ctx.lineCap = 'round';
        // Vùng Điện Tích
        if (p.rgZone > 0 || p.rgZoneFx < 0) {
            const R = rgZoneRect(p), open = p.rgZone > 0;
            const k = open ? Math.min(1, (20 - (p.rgZoneFx || 0)) / 20) : (-(p.rgZoneFx || 0)) / 16;
            const left = open ? p.rgZone / Math.max(1, p.rgZoneMax) : 0;
            const g = ctx.createLinearGradient(0, rgFront(p), 0, rgFront(p) + d * RG_ZD);
            g.addColorStop(0, 'rgba(56, 189, 248, 0.20)'); g.addColorStop(1, 'rgba(56, 189, 248, 0.03)');
            ctx.globalAlpha = k; ctx.fillStyle = g; ctx.fillRect(R.x0, R.y0, R.x1 - R.x0, R.y1 - R.y0);
            // lưới từ trường
            ctx.strokeStyle = 'rgba(125, 211, 252, 0.18)'; ctx.lineWidth = 1;
            for (let x = R.x0 + 23; x < R.x1; x += 23) { ctx.beginPath(); ctx.moveTo(x, R.y0); ctx.lineTo(x, R.y1); ctx.stroke(); }
            // đường sức chạy về phía xe
            ctx.strokeStyle = 'rgba(125, 211, 252, 0.45)'; ctx.setLineDash([4, 10]); ctx.lineDashOffset = -t * 40 * d;
            for (let i = 0; i < 5; i++) { const x = R.x0 + (i + 0.5) * (R.x1 - R.x0) / 5; ctx.beginPath(); ctx.moveTo(x, rgFront(p) + d * RG_ZD); ctx.quadraticCurveTo(x, rgFront(p) + d * 40, cx, rgFront(p)); ctx.stroke(); }
            ctx.setLineDash([]);
            // viền + rìa ngoài phát sáng (thời gian còn lại)
            ctx.strokeStyle = RG_CYAN; ctx.lineWidth = 1.5; ctx.shadowBlur = 10; ctx.shadowColor = RG_BLUE;
            ctx.strokeRect(R.x0, R.y0, R.x1 - R.x0, R.y1 - R.y0);
            const ey = rgFront(p) + d * RG_ZD;
            ctx.strokeStyle = RG_WHITE; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(R.zx - (R.x1 - R.x0) / 2 * left, ey); ctx.lineTo(R.zx + (R.x1 - R.x0) / 2 * left, ey); ctx.stroke();
            ctx.lineWidth = 0.9; ctx.strokeStyle = RG_CYAN;
            for (let i = 0; i < 2; i++) rgArc(R.x0, ey, R.x1, ey, Math.floor(t * 12) + i * 31, 4, 12);
            if (p.rgHsFx > 0) { ctx.globalAlpha = p.rgHsFx / 14; ctx.fillStyle = RG_GOLD; ctx.beginPath(); ctx.arc(p.rgHsX, ey, 8 + (14 - p.rgHsFx) * 1.5, 0, Math.PI * 2); ctx.fill(); }
            ctx.shadowBlur = 0; ctx.globalAlpha = 1;
            if (open) { ctx.font = "bold 9px 'Orbitron', Arial"; ctx.textAlign = 'center'; ctx.fillStyle = RG_CYAN; if (typeof drawWorldText === 'function') drawWorldText(ctx, (p.rgZone / 60).toFixed(1) + 's', R.x1 - 18, ey - d * 9); }
        }
        // Cầu năng lượng + hồng tâm khoá mục tiêu
        for (const o of p.rgOrbs || []) {
            const q = rgOrbPos(p, o);
            if (o.aim > 0 && o.aim <= 15 && (o.ax || o.ay)) {
                const L = 900, k = 1 - o.aim / 15;
                ctx.save(); ctx.globalAlpha = 0.5 + 0.5 * k; ctx.strokeStyle = '#f472b6'; ctx.lineWidth = 1; ctx.setLineDash([5, 4]);
                ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(q.x + o.ax * L, q.y + o.ay * L); ctx.stroke(); ctx.setLineDash([]);
                const e = rgEnemy(p);
                if (e) { const ex = e.x + e.w / 2, ey = e.y + e.h / 2, r = 16 - k * 8; ctx.beginPath(); ctx.arc(ex, ey, r, 0, Math.PI * 2); ctx.moveTo(ex - r - 4, ey); ctx.lineTo(ex - r + 3, ey); ctx.moveTo(ex + r - 3, ey); ctx.lineTo(ex + r + 4, ey); ctx.stroke(); }
                ctx.restore();
            }
            rgDrawOrb(q.x, q.y, o.c, p, t, o.sp || 0);
            if (o.bd && typeof rfDrawAs === 'function') { // FULL: đạn gốc bị bắt nằm trong cầu (giữ nguyên hình)
                const b = o.bd, sx = b.x, sy = b.y, so = b.owner;
                b.x = q.x - (b.w || 6) / 2; b.y = q.y - (b.h || 6) / 2; b.owner = p;
                ctx.save(); ctx.globalAlpha = 0.85; rfDrawAs(b, b.rfOH, b.rfW, b.rfId); ctx.restore();
                b.x = sx; b.y = sy; b.owner = so;
            }
            if (!o.z) { ctx.strokeStyle = RG_LV_COL[rgLv(p, o.c)]; ctx.globalAlpha = 0.6; ctx.lineWidth = 0.8; rgArc(cx - 4, rgFront(p), q.x, q.y, Math.floor(t * 18), 2, 3); rgArc(cx + 4, rgFront(p), q.x, q.y, Math.floor(t * 18) + 5, 2, 3); ctx.globalAlpha = 1; }
        }
        // giữ nút: vòng nạp (0.5s mở / đóng vùng, 1.0s khoá mục tiêu)
        const hold = p.rgHold || 0;
        if (p.rgPrevS && hold > 5 && !p.rgUsed) {
            const zone = p.rgZone > 0, f = Math.min(1, hold / (zone ? RG_HOLD_AIM : RG_HOLD_ZONE));
            ctx.strokeStyle = (!zone && p.rgCd > 0) ? '#64748b' : (zone && hold >= RG_HOLD_ZONE ? RG_VIO : RG_CYAN);
            ctx.lineWidth = 2; ctx.shadowBlur = 8; ctx.shadowColor = ctx.strokeStyle;
            ctx.beginPath(); ctx.arc(cx, cy, p.w * 0.9, -Math.PI / 2, -Math.PI / 2 + f * Math.PI * 2); ctx.stroke();
            if (zone) { ctx.globalAlpha = 0.7; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx + p.w * 0.9, cy - 3); ctx.lineTo(cx + p.w * 0.9, cy + 3); ctx.stroke(); }
        }
        ctx.restore();
    },
    drawUI() {
        if (this.hp <= 0 || typeof hudExtraBar !== 'function') return;
        const p = this;
        if (p.rgZone > 0) hudExtraBar(p, 0, p.rgZone / Math.max(1, p.rgZoneMax), RG_CYAN, { h: 2.5 });
        else hudExtraBar(p, 0, 1 - (p.rgCd || 0) / rgCdMax(p), (p.rgCd || 0) <= 0 ? RG_CYAN : 'rgba(125,211,252,0.35)', { h: 2.5 });
        const f = rgFrontOrb(p);
        if (f) { const top = rgFull(p) ? 240 : 180; hudExtraBar(p, 1, Math.min(1, f.c / top), RG_LV_COL[rgLv(p, f.c)], { h: 2, marks: rgFull(p) ? [0.25, 0.5, 0.75] : [1 / 3, 2 / 3] }); }
    },
}));

// ---------- Kết liễu: SIÊU PHÁO ĐIỆN TỪ (LEVEL 5: RAILGUN) ----------
function rgFinBeamEnd(f) {
    const W = canvas.width, H = canvas.height;
    let s = 1e9;
    if (f.dx > 0.001) s = Math.min(s, (W - f.ox) / f.dx); else if (f.dx < -0.001) s = Math.min(s, -f.ox / f.dx);
    if (f.dy > 0.001) s = Math.min(s, (H - f.oy) / f.dy); else if (f.dy < -0.001) s = Math.min(s, -f.oy / f.dy);
    return { x: f.ox + f.dx * s, y: f.oy + f.dy * s, L: s };
}
function rgDrawFinisherUnder(f) {
    const t = f.t;
    if (t < 60) return;
    // rãnh cháy đen cày dọc đường bắn
    const E = rgFinBeamEnd(f), a = Math.min(1, (t - 60) / 10) * (t > 160 ? (f.dur - t) / 25 : 1);
    ctx.save(); ctx.lineCap = 'round';
    ctx.globalAlpha = a * 0.85; ctx.strokeStyle = '#0a0a0a'; ctx.lineWidth = 16;
    ctx.beginPath(); ctx.moveTo(f.ox, f.oy); ctx.lineTo(E.x, E.y); ctx.stroke();
    ctx.globalAlpha = a * (0.5 + 0.3 * Math.sin(t * 0.4)); ctx.strokeStyle = RG_ORANGE; ctx.lineWidth = 3; ctx.shadowBlur = 12; ctx.shadowColor = RG_ORANGE;
    ctx.setLineDash([3, 9]); ctx.beginPath(); ctx.moveTo(f.ox, f.oy); ctx.lineTo(E.x, E.y); ctx.stroke();
    ctx.restore();
}
function rgDrawFinisherOver(f) {
    const t = f.t, W = canvas.width, H = canvas.height;
    const fade = t > 160 ? Math.max(0, (f.dur - t) / 25) : 1;
    ctx.save(); ctx.lineCap = 'round';
    // nền tối dần
    ctx.fillStyle = `rgba(2, 6, 23, ${Math.min(0.55, t / 20 * 0.55) * fade})`; ctx.fillRect(-W, -H, W * 3, H * 3);
    // 0-56: hồ quang xanh trắng bùng quanh xe + đồng xu tung lên
    if (t < 70) {
        const k = Math.min(1, t / 14);
        ctx.strokeStyle = RG_WHITE; ctx.shadowBlur = 14; ctx.shadowColor = RG_BLUE; ctx.lineWidth = 1.4; ctx.globalAlpha = k;
        for (let i = 0; i < 7; i++) {
            const a = rgRand(f.seed + i + Math.floor(t / 3) * 11) * Math.PI * 2, r = 20 + rgRand(f.seed + i * 3 + Math.floor(t / 3)) * 26;
            rgArc(f.ox, f.oy, f.ox + Math.cos(a) * r, f.oy + Math.sin(a) * r, f.seed + i * 17 + Math.floor(t / 2), 5, 5);
        }
    }
    if (t < 60) {
        // Khung cận cảnh (cut-in) giữa xe và mục tiêu: 2 thanh ray + đồng xu bạc xoay tít tung lên rồi rơi về ngang nòng
        // khung đặt ngay trước nòng xe Railgun (camera đang cận cảnh xe 1.6x)
        const s = f.fd;                                   // hướng từ khung tới mục tiêu
        const px = Math.max(110, Math.min(W - 110, f.ox)), py = f.oy + s * 88;
        const inK = Math.min(1, t / 8), outK = t > 52 ? (60 - t) / 8 : 1, A = inK * outK;
        const PW = 200 * inK, PH = 118;
        ctx.save(); ctx.translate(px, py); ctx.transform(1, 0, -0.18, 1, 0, 0);
        ctx.globalAlpha = A * 0.92; ctx.fillStyle = '#020617'; ctx.fillRect(-PW / 2, -PH / 2, PW, PH);
        ctx.globalAlpha = A; ctx.strokeStyle = RG_BLUE; ctx.lineWidth = 2; ctx.shadowBlur = 12; ctx.shadowColor = RG_BLUE; ctx.strokeRect(-PW / 2, -PH / 2, PW, PH);
        // vạch tốc độ nền
        ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(125, 211, 252, 0.18)'; ctx.lineWidth = 1;
        for (let i = 0; i < 9; i++) { const xx = -PW / 2 + rgRand(f.seed + i) * PW; ctx.beginPath(); ctx.moveTo(xx, -PH / 2 + 4); ctx.lineTo(xx, PH / 2 - 4); ctx.stroke(); }
        ctx.restore();
        ctx.save(); ctx.globalAlpha = A;
        const by = py - s * 46;                           // nòng (đáy khung, phía xe)
        ctx.fillStyle = TA.metal(px - 12, px - 6, '#475569', '#e2e8f0'); ctx.fillRect(px - 12, Math.min(by, by + s * 26), 5, 26);
        ctx.fillStyle = TA.metal(px + 7, px + 12, '#475569', '#e2e8f0'); ctx.fillRect(px + 7, Math.min(by, by + s * 26), 5, 26);
        ctx.strokeStyle = RG_WHITE; ctx.shadowBlur = 12; ctx.shadowColor = RG_BLUE; ctx.lineWidth = 1.3;
        for (let i = 0; i < 3; i++) rgArc(px - 7, by + s * (4 + i * 8), px + 7, by + s * (6 + i * 8), f.seed + i * 5 + Math.floor(t / 2), 3, 4);
        // đồng xu: đỉnh ở t=28, rơi về ngang nòng ở t=56
        const u = Math.min(1, t / 56), hgt = 4 * u * (1 - u) * 78;
        const cx = px, cy = by + s * (30 + hgt), spin = Math.abs(Math.cos(t * 0.8));
        ctx.shadowBlur = 14; ctx.shadowColor = '#e2e8f0';
        const g = ctx.createLinearGradient(cx - 13, cy, cx + 13, cy); g.addColorStop(0, '#94a3b8'); g.addColorStop(0.5, '#ffffff'); g.addColorStop(1, '#64748b');
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx, cy, 13 * Math.max(0.12, spin), 13, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#475569'; ctx.lineWidth = 0.8; ctx.stroke();
        ctx.font = "bold 13px 'Orbitron', Arial"; ctx.textAlign = 'center';
        if (t < 30) { ctx.globalAlpha = A * (1 - t / 30); ctx.fillStyle = '#ffffff'; ctx.shadowColor = RG_CYAN; if (typeof drawWorldText === 'function') drawWorldText(ctx, 'Ting!', cx + 44, cy); }
        if (t > 44) { ctx.globalAlpha = A; ctx.fillStyle = RG_GOLD; ctx.shadowColor = RG_ORANGE; if (typeof drawWorldText === 'function') drawWorldText(ctx, '⚡ CHÍNH XÁC TUYỆT ĐỐI', px, py + s * 52); }
        ctx.restore();
    }
    // 56-110: búng từ trường — luồng lazer cam vàng quấn vòng xoắn xanh xuyên bản đồ
    if (t >= 56 && t < 125) {
        // đầu tia chạy cùng nhịp camera: tới mục tiêu đúng RG_FIN_HIT rồi xuyên tới mép sân
        const E = rgFinBeamEnd(f), k = (t - 56) / 69, a = t > 105 ? (125 - t) / 20 : 1;
        const Lv = Math.hypot(f.vx - f.ox, f.vy - f.oy), u = (t - 56) / (RG_FIN_HIT - 56);
        const reach = u <= 1 ? Lv * (typeof fcamEase === 'function' ? fcamEase(u) : u) : Lv + (E.L - Lv) * Math.min(1, (u - 1) * 2);
        const grow = Math.min(1, reach / Math.max(1, E.L));
        const ex = f.ox + (E.x - f.ox) * grow, ey = f.oy + (E.y - f.oy) * grow, w = 22 * (1 - k * 0.5);
        if (t < 64) { ctx.globalAlpha = (64 - t) / 8; ctx.fillStyle = '#fffbe6'; ctx.fillRect(-W, -H, W * 3, H * 3); }
        ctx.globalAlpha = a * 0.55; ctx.strokeStyle = RG_ORANGE; ctx.shadowBlur = 30; ctx.shadowColor = RG_ORANGE; ctx.lineWidth = w * 2;
        ctx.beginPath(); ctx.moveTo(f.ox, f.oy); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.globalAlpha = a; ctx.strokeStyle = RG_GOLD; ctx.lineWidth = w;
        ctx.beginPath(); ctx.moveTo(f.ox, f.oy); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = w * 0.35; ctx.beginPath(); ctx.moveTo(f.ox, f.oy); ctx.lineTo(ex, ey); ctx.stroke();
        // vòng xoắn điện từ
        const ang = Math.atan2(f.dy, f.dx), L = E.L * grow;
        ctx.strokeStyle = RG_BLUE; ctx.shadowColor = RG_BLUE; ctx.shadowBlur = 12; ctx.lineWidth = 2;
        for (let s = 0; s < L; s += 34) {
            const ss = (s + (t - 56) * 14) % Math.max(1, L);
            const x = f.ox + f.dx * ss, y = f.oy + f.dy * ss;
            ctx.globalAlpha = a * 0.9;
            ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
            ctx.beginPath(); ctx.ellipse(0, 0, 5, w + 8, 0, 0, Math.PI * 2); ctx.stroke();
            ctx.restore();
        }
        // đồng xu siêu thanh ở đầu tia
        ctx.globalAlpha = a; ctx.fillStyle = '#ffffff'; ctx.shadowColor = '#ffffff'; ctx.shadowBlur = 20;
        ctx.beginPath(); ctx.arc(ex, ey, 6, 0, Math.PI * 2); ctx.fill();
        // sóng xung kích quanh nòng
        ctx.globalAlpha = a * (1 - k); ctx.strokeStyle = RG_WHITE; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(f.ox, f.oy, 10 + k * 70, 0, Math.PI * 2); ctx.stroke();
    }
    // mục tiêu bốc hơi
    if (t >= RG_FIN_HIT && t < 125) {
        const k = (t - RG_FIN_HIT) / (125 - RG_FIN_HIT);
        ctx.globalAlpha = 1 - k; ctx.fillStyle = RG_GOLD; ctx.shadowColor = RG_ORANGE; ctx.shadowBlur = 20;
        for (let i = 0; i < 14; i++) {
            const a = rgRand(f.seed + i) * Math.PI * 2, r = k * (30 + rgRand(f.seed + i * 5) * 50);
            ctx.fillRect(f.vx + Math.cos(a) * r - 1.5, f.vy + Math.sin(a) * r - 1.5 - k * 20, 3, 3);
        }
    }
    // chữ LEVEL 5 — RAILGUN
    if (t > 70) {
        const a = Math.min(1, (t - 70) / 10) * fade, sc = 1 + Math.max(0, 1 - (t - 70) / 8) * 0.6;
        const ty = f.vy < H / 2 ? f.vy + 105 : f.vy - 95, tx = Math.max(130, Math.min(W - 130, f.vx)), BW = 250;
        ctx.globalAlpha = a; ctx.textAlign = 'center';
        ctx.save(); ctx.translate(tx, ty); ctx.scale(sc, sc);
        ctx.fillStyle = 'rgba(2, 6, 23, 0.7)'; ctx.fillRect(-BW / 2, -34, BW, 58);
        ctx.strokeStyle = RG_BLUE; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-BW / 2, -34); ctx.lineTo(BW / 2, -34); ctx.moveTo(-BW / 2, 24); ctx.lineTo(BW / 2, 24); ctx.stroke();
        ctx.font = "bold 11px 'Orbitron', Arial"; ctx.fillStyle = RG_CYAN; ctx.shadowBlur = 8; ctx.shadowColor = RG_BLUE;
        if (typeof drawWorldText === 'function') drawWorldText(ctx, 'LEVEL 5', 0, -16); else ctx.fillText('LEVEL 5', 0, -16);
        ctx.font = "900 26px 'Orbitron', Arial"; ctx.fillStyle = RG_GOLD; ctx.shadowBlur = 18; ctx.shadowColor = RG_ORANGE;
        const jit = t < 90 ? (rgRand(t) - 0.5) * 3 : 0;
        if (typeof drawWorldText === 'function') drawWorldText(ctx, 'RAILGUN', jit, 12); else ctx.fillText('RAILGUN', jit, 12);
        ctx.restore();
    }
    ctx.restore();
}
function rgFxOver() {
    if (typeof bodyEffects === 'undefined') return;
    for (const e of bodyEffects) if (e instanceof RgFinisher && e.active) e.drawOver();
}

function rgRegisterHUD() {
    if (typeof registerEmpowerHUD !== 'function') return;
    registerEmpowerHUD('railgun', p => {
        const seg = { segments: p.maxAmmo || 4, lit: p.ammo || 0 };
        if (p.rgZone > 0) {
            const n = (p.rgOrbs || []).filter(o => o.z).length;
            if (p.rgPrevS && !p.rgUsed && p.rgHold > 6) {
                const aim = p.rgHold >= RG_HOLD_ZONE;
                return Object.assign({ pct: Math.min(1, p.rgHold / RG_HOLD_AIM), ready: aim, color: aim ? RG_VIO : RG_CYAN, label: aim ? 'NHẢ: PHÓNG / GIỮ: KHOÁ' : 'GIỮ...', btnIcon: '🎯' }, seg);
            }
            return Object.assign({ pct: p.rgZone / Math.max(1, p.rgZoneMax), ready: true, color: RG_CYAN, label: 'VÙNG x' + n, btnIcon: '⚡' }, seg);
        }
        const f = (p.rgOrbs || []).find(o => !o.z);
        if (f) { const lv = rgLv(p, f.c); return Object.assign({ pct: Math.min(1, f.c / 180), ready: lv >= 3, color: RG_LV_COL[lv], label: ['CẦU', 'SƠ CẤP', 'TRUNG CẤP', 'LAZER', 'QUÁ TẢI'][lv], btnIcon: '🪙' }, seg); }
        if (p.rgPrevS && !p.rgUsed && p.rgHold > 8 && !(p.rgCd > 0)) return Object.assign({ pct: Math.min(1, p.rgHold / RG_HOLD_ZONE), ready: false, color: RG_CYAN, label: 'VÙNG ĐIỆN TÍCH...', btnIcon: '⚡' }, seg);
        if (p.rgCd > 0) return Object.assign({ pct: 1 - p.rgCd / rgCdMax(p), ready: false, color: '#64748b', label: 'VÙNG ' + Math.ceil(p.rgCd / 60) + 's', btnIcon: '🪙', idle: true }, seg);
        return Object.assign({ pct: 1, ready: false, color: RG_CYAN, label: 'GIỮ: VÙNG', btnIcon: '🪙', idle: true }, seg);
    });
}
if (typeof window !== 'undefined') window.addEventListener('load', rgRegisterHUD);
