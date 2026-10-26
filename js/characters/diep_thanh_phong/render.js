// ==========================================
// Diệp Thanh Phong (diep_thanh_phong) — Hình ảnh: xe quạt ngọc, viền xe đổi màu theo vùng Khí Áp
// (xanh lá nhạt = Thuận Phong, xanh ngọc = Bão Hòa, tím bão = Nghịch Phong), biểu tượng Thế Quạt
// Thuận/Nghịch + 3 chấm Nhịp trước mũi xe, thanh Gió 100/130 & thanh Khí Áp 3 vùng; lốc, cầu gió,
// vòng cảnh báo, ảo ảnh gió; kết liễu PHONG THẦN TUYỆT TỨC. Chỉ đọc state.
// ==========================================

function dtpNow() { return (Date.now() % 1e6) / 1000; }
function dtpRgba(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
// Xoáy gió nhìn từ trên xuống: các cung xoắn quay quanh tâm
function dtpVortex(x, y, r, t, c, alpha, arms, spin) {
    if (r <= 0.5) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate(t * (spin || 5));
    ctx.globalAlpha *= alpha === undefined ? 1 : alpha;
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
    g.addColorStop(0, dtpRgba(c, 0.32)); g.addColorStop(0.7, dtpRgba(c, 0.1)); g.addColorStop(1, dtpRgba(c, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = c; ctx.shadowBlur = 8; ctx.shadowColor = c; ctx.lineCap = 'round';
    const n = arms || 3;
    for (let ring = 0; ring < 3; ring++) {
        const rr = r * (0.38 + ring * 0.25);
        ctx.lineWidth = Math.max(0.8, r * 0.06 * (1.2 - ring * 0.25));
        for (let i = 0; i < n; i++) {
            const a = i * Math.PI * 2 / n + ring * 0.7;
            ctx.beginPath(); ctx.arc(0, 0, rr, a, a + Math.PI * 2 / n * 0.6); ctx.stroke();
        }
    }
    ctx.fillStyle = '#f0fdf4'; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.arc(0, 0, Math.max(1, r * 0.12), 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}
// Quạt xếp: tâm (x,y), bán kính R, hướng ang, độ mở open (rad)
function dtpFan(x, y, R, ang, open, c, alpha) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    ctx.globalAlpha *= alpha === undefined ? 1 : alpha;
    const a0 = -Math.PI / 2 - open / 2, a1 = -Math.PI / 2 + open / 2;
    const g = ctx.createRadialGradient(0, 0, R * 0.2, 0, 0, R);
    g.addColorStop(0, dtpRgba(c, 0.15)); g.addColorStop(1, dtpRgba(c, 0.7));
    ctx.fillStyle = g; ctx.shadowBlur = 10; ctx.shadowColor = c;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, R, a0, a1); ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(236,253,245,0.85)'; ctx.lineWidth = Math.max(0.5, R * 0.05);
    const ribs = 7;
    for (let i = 0; i <= ribs; i++) {
        const a = a0 + (a1 - a0) * i / ribs;
        ctx.beginPath(); ctx.moveTo(Math.cos(a) * R * 0.18, Math.sin(a) * R * 0.18); ctx.lineTo(Math.cos(a) * R, Math.sin(a) * R); ctx.stroke();
    }
    ctx.strokeStyle = c; ctx.lineWidth = Math.max(0.7, R * 0.08);
    ctx.beginPath(); ctx.arc(0, 0, R, a0, a1); ctx.stroke();
    ctx.restore();
}
function dtpZoneColor(p) { return DTP_ZONE_C[dtpZone(p)]; }

// ---------- Xe Diệp Thanh Phong ----------
registerTankArt('diep_thanh_phong', (p, k) => {
    const t = k.t, zc = dtpZoneColor(p), cast = (p.dtpCastFx || 0) / 12, sw = (p.dtpSwFx || 0) / 22;
    TA.treads(-15, 4.2, -11, 12, t, '#0b1f1a', '#115e59');
    // vệt gió quanh thân
    ctx.save(); ctx.strokeStyle = dtpRgba(zc, 0.5); ctx.lineWidth = 0.9;
    for (let i = 0; i < 3; i++) {
        const a = t * 4 + i * 2.1;
        ctx.beginPath(); ctx.arc(0, 0, 15.5, a, a + 0.9); ctx.stroke();
    }
    ctx.restore();
    // thân lục giác dẹt, viền màu vùng Khí Áp
    TA.glow(zc, 9 + 5 * Math.sin(t * 4));
    ctx.fillStyle = TA.metal(-11, 11, '#052e2b', '#0f766e');
    ctx.beginPath();
    ctx.moveTo(0, -12); ctx.lineTo(10, -6); ctx.lineTo(11, 6); ctx.lineTo(4, 11); ctx.lineTo(-4, 11); ctx.lineTo(-11, 6); ctx.lineTo(-10, -6); ctx.closePath();
    ctx.fill(); TA.noGlow();
    ctx.strokeStyle = zc; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.strokeStyle = k.team; ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(-7, 8); ctx.lineTo(7, 8); ctx.stroke();
    // hoa văn lá ngọc
    ctx.strokeStyle = 'rgba(167,243,208,0.7)'; ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(0, 9); ctx.quadraticCurveTo(-6, 3, 0, -4); ctx.quadraticCurveTo(6, 3, 0, 9); ctx.stroke();
    // quạt trên nóc: Thuận = quạt mở hướng địch (xanh), Nghịch = quạt lật ngược (tím)
    const nghich = p.dtpStance === 1;
    const open = (nghich ? 1.7 : 2.2) - sw * 1.5 + cast * 0.4;
    dtpFan(0, nghich ? -1 : 2, 12 + cast * 2, nghich ? Math.PI : 0, Math.max(0.3, open), nghich ? '#a78bfa' : DTP_LEAF, 0.95);
    // lõi ngọc
    const g = ctx.createRadialGradient(0, 1, 0.5, 0, 1, 4.5);
    g.addColorStop(0, '#f0fdf4'); g.addColorStop(1, zc);
    TA.glow(zc, 10); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 1, 3.6, 0, Math.PI * 2); ctx.fill(); TA.noGlow();
    if (k.evo1) { ctx.fillStyle = DTP_LEAF; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(sx * 8.5, 7, 1.3, 0, Math.PI * 2); ctx.fill(); } }
    if (k.evo2) { ctx.strokeStyle = 'rgba(167,139,250,0.9)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(0, 1, 6.5, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke(); }
});

// ---------- Đạn ----------
function dtpDrawBullet(b) {
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2, t = dtpNow(), k = b.dtpK;
    ctx.save();
    if (k === 'tor' || k === 'mini') {
        dtpVortex(cx, cy, k === 'mini' ? 7 : 9, t, k === 'mini' ? DTP_JADE : DTP_LEAF, 1, 3, 9);
    } else if (k === 'debris') {
        ctx.translate(cx, cy); ctx.rotate(t * 12);
        ctx.shadowBlur = 12; ctx.shadowColor = '#a78bfa'; ctx.fillStyle = '#4c1d95';
        ctx.beginPath(); ctx.moveTo(-6, -3); ctx.lineTo(-1, -7); ctx.lineTo(6, -4); ctx.lineTo(5, 4); ctx.lineTo(-2, 7); ctx.lineTo(-7, 3); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#c4b5fd'; ctx.lineWidth = 1; ctx.stroke();
        ctx.rotate(-t * 12); ctx.strokeStyle = 'rgba(196,181,253,0.5)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-(b.vx || 0) * 1.5, -(b.vy || 0) * 1.5); ctx.lineTo(-(b.vx || 0) * 3.5, -(b.vy || 0) * 3.5); ctx.stroke();
    } else {
        // lưỡi gió hình trăng khuyết bay theo hướng vận tốc
        const ang = Math.atan2(b.vy || -1, b.vx || 0) + Math.PI / 2;
        const s = b.dtpBig ? 1.35 : (k === 'refl' ? 0.9 : 1);
        const c = k === 'refl' ? DTP_JADE : (b.dtpBounce !== undefined ? DTP_TEAL : '#a7f3d0');
        ctx.translate(cx, cy); ctx.rotate(ang);
        ctx.strokeStyle = dtpRgba(c, 0.35); ctx.lineWidth = 2.5 * s;
        ctx.beginPath(); ctx.moveTo(0, 5 * s); ctx.lineTo(0, 18 * s); ctx.stroke();
        ctx.shadowBlur = 12; ctx.shadowColor = c; ctx.fillStyle = '#ecfdf5';
        ctx.beginPath(); ctx.moveTo(-8 * s, 3 * s); ctx.quadraticCurveTo(0, -12 * s, 8 * s, 3 * s); ctx.quadraticCurveTo(0, -5 * s, -8 * s, 3 * s); ctx.fill();
        ctx.strokeStyle = c; ctx.lineWidth = 1; ctx.stroke();
    }
    ctx.restore();
}

// ---------- Vật triệu hồi ----------
function dtpDrawOrb(o) {
    const t = dtpNow(), r = o.r * (o.reso ? 1.15 : 1);
    ctx.save();
    if (o.st === 'charge') {
        ctx.strokeStyle = dtpRgba(DTP_LEAF, 0.6); ctx.lineWidth = 1.2; ctx.setLineDash([3, 4]);
        ctx.beginPath(); ctx.arc(o.x, o.y, r + 5 + Math.sin(t * 8) * 1.5, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    } else {
        ctx.strokeStyle = dtpRgba(DTP_LEAF, 0.3); ctx.lineWidth = r * 0.9;
        ctx.beginPath(); ctx.moveTo(o.x, o.y); ctx.lineTo(o.x, o.y - o.vy * 5); ctx.stroke();
    }
    const g = ctx.createRadialGradient(o.x - r * 0.3, o.y - r * 0.3, r * 0.1, o.x, o.y, r);
    g.addColorStop(0, '#f0fdf4'); g.addColorStop(0.45, dtpRgba(DTP_LEAF, 0.75)); g.addColorStop(1, dtpRgba(DTP_JADE, 0.15));
    ctx.fillStyle = g; ctx.shadowBlur = 16; ctx.shadowColor = DTP_LEAF;
    ctx.beginPath(); ctx.arc(o.x, o.y, r, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    dtpVortex(o.x, o.y, r * 0.9, t, '#ecfdf5', 0.7, 3, 7);
    if (o.reso) dtpVortex(o.x, o.y, r * 1.5, t, DTP_JADE, 0.5, 4, -4);
}
function dtpDrawGrowTornado(o) {
    const t = dtpNow(), r = o.r;
    if (o.st === 'grow') {
        ctx.save(); ctx.strokeStyle = dtpRgba(DTP_TEAL, 0.55); ctx.lineWidth = 1; ctx.setLineDash([2, 4]);
        ctx.beginPath(); ctx.arc(o.x, o.y, 34 * (o.reso ? 1.5 : 1) + 4, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = DTP_TEAL; ctx.font = "700 8px 'Orbitron', Arial"; ctx.textAlign = 'center';
        ctx.fillText(Math.round(o.k * 100) + '%', o.x, o.y + r + 10);
        ctx.restore();
    }
    dtpVortex(o.x, o.y, r, t, DTP_TEAL, 0.95, 4, 6);
    dtpVortex(o.x, o.y, r * 0.6, t, '#ccfbf1', 0.8, 3, -9);
}
function dtpDrawBigTornado(o) {
    const t = dtpNow();
    ctx.save(); ctx.strokeStyle = dtpRgba(DTP_LEAF, 0.25); ctx.lineWidth = o.r * 1.2;
    ctx.beginPath(); ctx.moveTo(o.x, o.y); ctx.lineTo(o.x, o.y - o.vy * 6); ctx.stroke(); ctx.restore();
    dtpVortex(o.x, o.y, o.r * 1.25, t, DTP_LEAF, 0.95, 4, 8);
    dtpVortex(o.x, o.y, o.r * 0.7, t, '#f0fdf4', 0.85, 3, -11);
    if (o.n > 0) { ctx.save(); ctx.fillStyle = '#f0fdf4'; ctx.font = "800 8px 'Orbitron', Arial"; ctx.textAlign = 'center'; ctx.fillText('+' + o.n, o.x, o.y - o.r - 6); ctx.restore(); }
}
// Ảo ảnh / bản thể múa quạt ở tâm bão
function dtpDrawDancer(x, y, t, s, alpha, c) {
    ctx.save(); ctx.globalAlpha *= alpha;
    for (let i = 0; i < 2; i++) dtpFan(x, y, 18 * s, t * 9 + i * Math.PI, 1.9, c, 0.9);
    ctx.shadowBlur = 14; ctx.shadowColor = c; ctx.fillStyle = dtpRgba('#ecfdf5', 0.85);
    ctx.beginPath(); ctx.arc(x, y, 6 * s, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}
function dtpDrawStorm(o) {
    const t = dtpNow(), s = o.eff(), R = o.r * s;
    const life = o.t / o.dur, fade = Math.min(1, (o.dur - o.t) / 15) * Math.min(1, o.t / 6);
    ctx.save(); ctx.globalAlpha = fade;
    if (o.kind === 'gale') {
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, R);
        g.addColorStop(0, 'rgba(134,239,172,0.28)'); g.addColorStop(1, 'rgba(134,239,172,0.04)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(o.x, o.y, R, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(134,239,172,0.7)'; ctx.lineWidth = 1.2; ctx.setLineDash([6, 5]); ctx.lineDashOffset = -t * 30;
        ctx.beginPath(); ctx.arc(o.x, o.y, R, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
        // dải gió ngang
        ctx.strokeStyle = 'rgba(236,253,245,0.45)'; ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            const yy = o.y - R * 0.6 + i * R * 0.3, ph = ((t * 90 + i * 37) % (R * 2)) - R;
            ctx.beginPath(); ctx.moveTo(o.x + ph - 14, yy); ctx.lineTo(o.x + ph + 14, yy); ctx.stroke();
        }
        ctx.restore(); return;
    }
    const col = o.kind === 'bigstorm' ? DTP_LEAF : (o.kind === 'tempest' ? DTP_JADE : DTP_TEAL);
    // vòng ngoài + gió hút
    ctx.strokeStyle = dtpRgba(col, 0.75); ctx.lineWidth = 1.6; ctx.shadowBlur = 10; ctx.shadowColor = col;
    ctx.beginPath(); ctx.arc(o.x, o.y, R, 0, Math.PI * 2); ctx.stroke(); ctx.shadowBlur = 0;
    if (o.pull > 0) {
        ctx.strokeStyle = dtpRgba('#ecfdf5', 0.4); ctx.lineWidth = 1;
        for (let i = 0; i < 8; i++) {
            const a = i * Math.PI / 4 + t * 2, f = 1 - ((t * 1.6 + i * 0.13) % 1);
            const r1 = R * (0.3 + 0.7 * f);
            ctx.beginPath(); ctx.arc(o.x, o.y, r1, a, a + 0.35); ctx.stroke();
        }
    }
    ctx.restore();
    ctx.save(); ctx.globalAlpha = fade;
    dtpVortex(o.x, o.y, R * 0.92, t, col, 0.8, 4, o.kind === 'tempest' ? 7 : 5);
    // múa quạt ở tâm (ảo ảnh khi bản thể đã về nhà)
    if (o.kind !== 'bigstorm') {
        if (o.phantom) dtpDrawDancer(o.x, o.y, t, Math.max(0.7, s), 0.55 + 0.2 * Math.sin(t * 10), '#a7f3d0');
        else dtpDrawDancer(o.x, o.y, t, 1, 0.5, DTP_LEAF);
    }
    // cú quét quạt lớn
    const since = o.t - o.swT;
    if (since >= 0 && since < 14) {
        const k = since / 14;
        ctx.globalAlpha = fade * (1 - k);
        dtpFan(o.x, o.y, R * (1.0 + 0.2 * k), k * Math.PI * 2, 2.6, '#ecfdf5', 0.8);
    }
    ctx.restore();
    void life;
}
function dtpDrawSkyRing(x, y, R, T, ownerC, ghost) {
    const t = dtpNow();
    ctx.save();
    const g = ctx.createRadialGradient(x, y, 0, x, y, R);
    g.addColorStop(0, dtpRgba(ownerC, 0.05)); g.addColorStop(1, dtpRgba(ownerC, 0.22));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = ownerC; ctx.lineWidth = 2; ctx.shadowBlur = 12; ctx.shadowColor = ownerC;
    ctx.setLineDash(ghost ? [4, 6] : [10, 5]); ctx.lineDashOffset = t * 40;
    ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    ctx.lineWidth = 1; ctx.globalAlpha = 0.7;
    ctx.beginPath(); ctx.moveTo(x - 8, y); ctx.lineTo(x + 8, y); ctx.moveTo(x, y - 8); ctx.lineTo(x, y + 8); ctx.stroke();
    if (T >= 120) { // hút nhẹ
        ctx.globalAlpha = 0.5; ctx.lineWidth = 1;
        for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 - t * 2.5, f = 1 - ((t * 1.3 + i * 0.17) % 1); ctx.beginPath(); ctx.arc(x, y, R * (0.25 + 0.75 * f), a, a + 0.4); ctx.stroke(); }
    }
    // mốc thời gian (2s / 4s)
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    ctx.fillStyle = '#ecfdf5'; ctx.font = "800 9px 'Orbitron', Arial"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText((T / 60).toFixed(1) + 's', x, y + R + 9);
    ctx.restore();
}
// Luật 11: vòng KHÓA — đỏ đặc + vòng co dần về tâm (k: 0 -> 1)
function dtpDrawLockRing(x, y, R, k) {
    const t = dtpNow();
    ctx.save();
    ctx.fillStyle = 'rgba(239, 68, 68, ' + (0.18 + 0.2 * k + 0.08 * Math.sin(t * 30)) + ')';
    ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 3; ctx.shadowBlur = 16; ctx.shadowColor = '#ef4444';
    ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#fecaca'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, Math.max(2, R * (1 - Math.min(1, k))), 0, Math.PI * 2); ctx.stroke();
    ctx.shadowBlur = 0; ctx.fillStyle = '#fee2e2'; ctx.font = "800 10px 'Orbitron', Arial"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('KHÓA', x, y + R + 10);
    ctx.restore();
}
function dtpDrawSkyZone(o) {
    const T = o.air + o.g, left = o.grow - o.g;
    if (left <= 40) dtpDrawLockRing(o.x, o.y, o.r, 1 - left / 40); else dtpDrawSkyRing(o.x, o.y, o.r, T, '#a7f3d0', true);
    // Ảo Ảnh Gió đang giáng xuống
    if (left < 30) {
        const k = 1 - left / 30;
        ctx.save(); ctx.globalAlpha = k;
        dtpDrawDancer(o.x, o.y - (1 - k) * 80, dtpNow(), 0.6 + 0.4 * k, 0.8, '#a7f3d0');
        ctx.restore();
    }
}

// ---------- Hiệu ứng quanh xe ----------
CharHooks.register('diep_thanh_phong', Object.assign(CharHooks.registry.diep_thanh_phong || {}, {
    draw() {
        const p = this;
        if (p.hp <= 0) return;
        const t = dtpNow(), cx = dtpCx(p), cy = dtpCy(p), m = p.dtpMode;
        // Vòng cảnh báo khi đang bay
        if (m === 'skylock') { dtpDrawLockRing(p.dtpSkyX, p.dtpSkyY, dtpSkyR(p.dtpSkyT), p.dtpModeT / DTP_SKY_LOCK); return; }
        if (m === 'sky') { dtpDrawSkyRing(p.dtpSkyX, p.dtpSkyY, dtpSkyR(p.dtpSkyT), p.dtpSkyT, p.dtpSkyT >= 240 ? '#f0abfc' : DTP_JADE, false); return; }
        ctx.save();
        // Khiên Gió
        if (p.shield > 0) {
            ctx.strokeStyle = dtpRgba(DTP_JADE, 0.8); ctx.lineWidth = 1.3; ctx.shadowBlur = 8; ctx.shadowColor = DTP_JADE;
            for (let i = 0; i < 3; i++) { const a = t * 3 + i * 2.09; ctx.beginPath(); ctx.arc(cx, cy, p.w * 0.85, a, a + 1.1); ctx.stroke(); }
            ctx.shadowBlur = 0;
        }
        // Giáp Gió (Nuôi Lốc)
        if (p.dtpCh === 'tor') dtpVortex(cx, cy, p.w * 0.95, t, DTP_TEAL, 0.5, 3, 4);
        // Đổi Khí Áp / Loạn Phong / Khiên Gió vỡ
        if (p.dtpZoneFx > 0) { const k = 1 - p.dtpZoneFx / 30; ctx.globalAlpha = 1 - k; ctx.strokeStyle = dtpZoneColor(p); ctx.lineWidth = 3; ctx.shadowBlur = 12; ctx.shadowColor = ctx.strokeStyle; ctx.beginPath(); ctx.arc(cx, cy, p.w * (0.7 + k * 1.6), 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; ctx.shadowBlur = 0; }
        if (p.dtpLpFx > 0) dtpVortex(cx, cy, 80 * (1 - p.dtpLpFx / 30) + 10, t, DTP_TEAL, p.dtpLpFx / 30, 4, 8);
        if (p.dtpBurstFx > 0) dtpVortex(cx, cy, (p.dtpBurstR || 110) * (1 - p.dtpBurstFx / 26 * 0.6), t, DTP_JADE, p.dtpBurstFx / 26, 5, 10);
        // Phong Vũ: vệt lướt + Vòng Cảnh Báo
        if (m === 'lunge') { for (let i = 1; i <= 3; i++) dtpVortex(cx, cy - dtpDir(p) * i * 14, p.w * (0.7 - i * 0.12), t, '#a78bfa', 0.6 - i * 0.15, 3, 8); }
        if (m === 'warn') {
            const k = Math.min(1, p.dtpModeT / (p.dtpWarnN || 72));
            ctx.strokeStyle = '#c4b5fd'; ctx.lineWidth = 1.5; ctx.shadowBlur = 10; ctx.shadowColor = '#8b5cf6'; ctx.setLineDash([6, 4]);
            const WR = 60 * (p.dtpHpPow > 1 ? 1.25 : 1);
            if (p.dtpHpPow > 1) { ctx.strokeStyle = '#fde047'; ctx.shadowColor = '#fde047'; }
            ctx.beginPath(); ctx.arc(cx, cy, WR, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
            ctx.fillStyle = 'rgba(139,92,246,0.18)'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, WR, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2); ctx.closePath(); ctx.fill();
            ctx.shadowBlur = 0;
            dtpFan(cx, cy, 16, t * 2, 1.8, '#c4b5fd', 0.7);
        }
        // Hợp Phong: vòng xoáy vàng-ngọc khi lên tầng / bộc phát
        if (p.dtpHpFx > 0) { const k = 1 - p.dtpHpFx / 30; ctx.globalAlpha = 1 - k; dtpVortex(cx, cy, p.w * (0.6 + k * 1.2), t, p.dtpHpEmp || p.dtpHpPow > 1 ? '#fde047' : DTP_JADE, 0.9, 3, 6); ctx.globalAlpha = 1; }
        if (p.dtpHpEmp) { ctx.globalAlpha = 0.45 + 0.25 * Math.sin(t * 6); dtpFan(cx, cy, p.w * 0.85, t * 1.5, 2.6, '#fde047', 0.55); ctx.globalAlpha = 1; }
        if (p.dtpSpinFx > 0) { const k = 1 - p.dtpSpinFx / 20; ctx.globalAlpha = 1 - k; dtpFan(cx, cy, 60, k * Math.PI * 2.5, 3.0, '#c4b5fd', 0.85); ctx.globalAlpha = 1; }
        // Bão Quạt: hóa lốc
        if (m === 'cyc_go' || m === 'cyc_dance' || m === 'cyc_back') {
            const R = m === 'cyc_dance' ? 50 : 26;
            dtpVortex(cx, cy, R, t, m === 'cyc_dance' ? DTP_STORM : '#c4b5fd', 0.85, 4, 9);
            if (m === 'cyc_dance') { dtpDrawDancer(cx, cy, t, 1.2, 0.8, '#ddd6fe'); ctx.strokeStyle = 'rgba(196,181,253,0.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, 110, 0, Math.PI * 2); ctx.stroke(); }
        }
        if (p.dtpSlashFx > 0) {
            const k = 1 - p.dtpSlashFx / 26;
            ctx.globalAlpha = 1 - k; ctx.strokeStyle = '#ecfdf5'; ctx.lineWidth = 6 * (1 - k) + 1; ctx.shadowBlur = 18; ctx.shadowColor = DTP_JADE;
            ctx.beginPath(); ctx.arc(p.dtpSlashX, p.dtpSlashY, 70 + 40 * k, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
            ctx.beginPath(); ctx.arc(p.dtpSlashX, p.dtpSlashY, 70 + 40 * k, Math.PI * 0.05, Math.PI * 0.95); ctx.stroke();
            ctx.globalAlpha = 1; ctx.shadowBlur = 0;
        }
        if (p.dtpArriveFx > 0) dtpVortex(cx, cy, p.w * (1.4 - p.dtpArriveFx / 22 * 0.6), t, '#a7f3d0', p.dtpArriveFx / 22, 3, 10);
        // Vòng giữ nút: xanh ngọc = nhả để Đổi Thế Quạt; vàng = sắp Đổi Khí Áp (1.0s)
        const h = p.dtpHold || 0;
        if (p.dtpValid && !p.dtpUsed && h > 6 && m === 'idle') {
            const sN = dtpSwitchN(p), ok = h >= sN;
            const teal = h >= Math.min(24, sN) && h < 51;
            ctx.lineWidth = 2.2 + h * 2.2; ctx.shadowBlur = 10;
            ctx.strokeStyle = teal || ok && h < 51 ? DTP_TEAL : (h >= 51 ? (p.dtpZoneCd > 0 ? '#64748b' : '#fde047') : 'rgba(45,212,191,0.4)');
            ctx.shadowColor = ctx.strokeStyle;
            ctx.beginPath(); ctx.arc(cx, cy, p.w * 0.95, -Math.PI / 2, -Math.PI / 2 + Math.min(1, h / DTP_ZONE_HOLD) * Math.PI * 2); ctx.stroke();
            if (ok && h < 51) { ctx.globalAlpha = 0.5 + 0.3 * Math.sin(t * 20); ctx.beginPath(); ctx.arc(cx, cy, p.w * 1.15, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; }
            ctx.shadowBlur = 0;
        }
        ctx.restore();
    },
    drawUI() {
        const p = this;
        if (p.hp <= 0 || typeof hudExtraBar !== 'function') return;
        const e = dtpEnemy(p), t = dtpNow();
        // Địch: Gió Cắt / Hất Tung / Toàn Phong
        if (e && e.hp > 0) {
            const ex = dtpCx(e), ey = dtpCy(e);
            ctx.save();
            if (dtpTP(p)) { ctx.strokeStyle = 'rgba(139,92,246,0.55)'; ctx.lineWidth = 1; for (let i = 0; i < 4; i++) { const a = t * 3 + i * Math.PI / 2; ctx.beginPath(); ctx.arc(ex, ey, e.w * 0.95, a, a + 0.8); ctx.stroke(); } }
            if (e.dtpCutT > 0) {
                ctx.strokeStyle = '#a7f3d0'; ctx.lineWidth = 1.2; ctx.shadowBlur = 6; ctx.shadowColor = DTP_JADE;
                for (let i = 0; i < (e.dtpCutS || 1); i++) { const o = ((t * 60 + i * 9) % 26) - 13; ctx.beginPath(); ctx.moveTo(ex - 10 + o * 0.3, ey - 10 + o); ctx.lineTo(ex + 10 + o * 0.3, ey - 2 + o); ctx.stroke(); }
            }
            if (e.dtpLiftT > 0) dtpVortex(ex, ey, e.w * 0.9, t, DTP_TEAL, 0.7, 3, 12);
            ctx.restore();
        }
        // Thanh Gió (100 / 130)
        const maxA = p.maxAmmo || 100;
        hudExtraBar(p, 0, p.ammo / maxA, p.ammo < 12 ? '#64748b' : DTP_JADE, { h: 2.5, marks: maxA > 100 ? [100 / maxA] : undefined });
        // Thanh Khí Áp 3 vùng + kim chỉ
        const F = hudFrame(p), BW = hudBarWidth(p), bx = -BW / 2, d = hudExtraD(0.75), hh = 2.5;
        ctx.save();
        ctx.fillStyle = 'rgba(4,8,18,0.85)'; hudRRect(F, bx - 1, d - 1, BW + 2, hh + 2, 1.5); ctx.fill();
        const zz = dtpZone(p), segs = [[0, 0.335], [0.335, 0.665], [0.665, 1]];
        segs.forEach((s, i) => { ctx.globalAlpha = i === zz ? 1 : 0.35; ctx.fillStyle = DTP_ZONE_C[i]; hudFill(F, bx + BW * s[0] + (i ? 0.5 : 0), d, BW * (s[1] - s[0]) - 0.5, hh); });
        ctx.globalAlpha = 1; ctx.fillStyle = '#ffffff'; ctx.shadowBlur = 6; ctx.shadowColor = '#ffffff';
        hudFill(F, bx + BW * (p.dtpP || 0) / 100 - 1, d - 1.5, 2, hh + 3);
        ctx.restore();
        // Biểu tượng Thế Quạt + 3 chấm Nhịp (trước mũi xe)
        if (p.dtpMode === 'sky' || p.dtpMode === 'skylock') return;
        const Fn = hudFrame(p), dIcon = hudNearD(p, 3, 9);
        ctx.save();
        const nghich = p.dtpStance === 1, c = nghich ? '#c4b5fd' : DTP_LEAF;
        const ix = Fn.X(-14), iy = Fn.Y(dIcon + 4.5);
        ctx.fillStyle = 'rgba(6,10,20,0.85)'; ctx.strokeStyle = c; ctx.lineWidth = 1;
        hudRRect(Fn, -22, dIcon, 44, 9, 4.5); ctx.fill(); ctx.stroke();
        dtpFan(ix, iy + 3.5, 6, nghich ? Math.PI : 0, 2.0, c, 1);
        ctx.fillStyle = c; ctx.font = "800 7px 'Orbitron', Arial";
        hudText(Fn, nghich ? 'NGHỊCH' : 'THUẬN', 4, dIcon + 4.8, 'center');
        // Hợp Phong: 3 quạt nhỏ (tầng) + cảnh báo LẶP THẾ
        const hs = p.dtpHpS || 0;
        for (let i = 0; i < 3; i++) {
            const on = i < hs;
            dtpFan(Fn.X(28 + i * 8), iy + 3.5, 4, Math.PI / 2 * (i - 1) * 0.3, 1.9, on ? (p.dtpHpEmp ? '#fde047' : DTP_JADE) : '#475569', on ? 1 : 0.5);
        }
        if (p.dtpRepFx > 0) { ctx.globalAlpha = Math.min(1, p.dtpRepFx / 15); ctx.fillStyle = '#f87171'; ctx.font = "800 7px 'Orbitron', Arial"; hudText(Fn, 'LẶP THẾ', -38, dIcon + 4.8, 'center'); ctx.globalAlpha = 1; }
        ctx.restore();
        const n = dtpBeatN(p), lit = Math.min(n, p.dtpBeats || 0), ready = lit >= n - 1;
        hudExtraPips(p, 0, 3, n === 2 ? lit + 1 : lit, ready ? '#fde047' : DTP_LEAF, { d: dIcon - 5, pw: 4, gap: 2, h: 3 });
        if (p.dtpCh) {
            const max = p.dtpCh === 'orb' ? 240 : 300;
            hudExtraBar(p, 0, (p.dtpChT || 0) / max, p.dtpCh === 'orb' ? DTP_LEAF : DTP_TEAL, { d: dIcon - 9, h: 2, w: 30 });
        }
    },
}));

// ---------- Kết liễu PHONG THẦN TUYỆT TỨC (điện ảnh, 180 tick; nổ tại t=132) ----------
// 1) quạt khép, trời ngả ngọc bích  2) cửu trùng vân (9 tầng mây) kết vòng  3) mục tiêu bị cuốn xoáy bay lên qua các tầng mây
// 4) vạn đạo phong nhận cắt chéo theo từng đợt  5) quạt bung mở: sóng xung kích ngọc bích, mục tiêu tan thành bụi + lá  6) tiêu đề
function dtpFE(t, a, b) { return Math.max(0, Math.min(1, (t - a) / (b - a))); }
function dtpFHash(s, i) { const x = Math.sin(s * 12.9898 + i * 78.233) * 43758.5453; return x - Math.floor(x); }
function dtpLeaf(x, y, s, rot, col, a) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha *= a; ctx.fillStyle = col;
    ctx.beginPath(); ctx.moveTo(-s, 0); ctx.quadraticCurveTo(0, -s * 0.55, s, 0); ctx.quadraticCurveTo(0, s * 0.55, -s, 0); ctx.fill();
    ctx.strokeStyle = 'rgba(2,44,34,0.6)'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(-s * 0.8, 0); ctx.lineTo(s * 0.8, 0); ctx.stroke();
    ctx.restore();
}
function dtpDrawFinisherUnder(f) {
    const W = canvas.width, H = canvas.height, t = f.t;
    const fade = t > 160 ? Math.max(0, 1 - (t - 160) / 20) : 1, fin = Math.min(1, t / 20);
    ctx.save();
    ctx.globalAlpha = 0.7 * fade * fin;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#022c22'); g.addColorStop(0.5, '#04261f'); g.addColorStop(1, '#020617');
    ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3);
    ctx.restore();
}
function dtpDrawFinisherOver(f) {
    const t = f.t, E = (a, b) => dtpFE(t, a, b);
    const fade = t > 162 ? Math.max(0, 1 - (t - 162) / 18) : 1;
    const toK = f.oy > f.y ? 1 : -1;                         // phía Diệp Thanh Phong
    const cx = f.x, top = f.y - 110;                         // tâm cửu trùng vân (phía "trời" của mục tiêu, khớp vụ nổ ở logic)
    const lift = E(30, 104), le = lift * lift * (3 - 2 * lift);
    const vy = f.y + (top - f.y) * le, vx = f.x + Math.sin(t * 0.22) * 26 * Math.sin(Math.PI * Math.min(1, lift * 1.1));
    const boom = E(132, 170), gone = t >= 132;
    ctx.save(); ctx.globalAlpha = fade;
    // tia sáng toả từ đỉnh mây
    if (typeof fcRays === 'function') fcRays(cx, top, 12, 260 * E(20, 60), DTP_LEAF, 0.22 * E(20, 60) * (1 - boom), t * 0.006, 0.06);
    // 2) cửu trùng vân: 9 tầng vòng mây xếp chồng từ mục tiêu lên đỉnh
    for (let i = 0; i < 9; i++) {
        const k = E(14 + i * 4, 30 + i * 4) * (1 - E(132, 160));
        if (k <= 0) continue;
        const yy = f.y + 10 - i * 15, rx = (52 + i * 13) * (0.6 + 0.4 * k) * (1 + boom * 0.8), ry = rx * 0.26, rot = t * 0.05 * (i % 2 ? 1 : -1);
        ctx.save(); ctx.translate(cx, yy - boom * 30 * i / 8);
        ctx.strokeStyle = dtpRgba(i % 3 === 2 ? DTP_TEAL : '#d1fae5', 0.13 * k); ctx.lineWidth = 11;
        ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = dtpRgba(i % 2 ? DTP_JADE : DTP_LEAF, 0.75 * k); ctx.lineWidth = 1.6; ctx.shadowBlur = 8; ctx.shadowColor = DTP_JADE;
        ctx.setLineDash([16, 9]); ctx.lineDashOffset = rot * 40;
        ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
        ctx.restore();
    }
    // lá ngọc xoáy quanh cột lốc
    if (t >= 18 && t < 140) {
        const a = E(18, 34) * (1 - E(128, 140));
        for (let i = 0; i < 16; i++) {
            const h = dtpFHash(f.seed, i), ph = (t * 0.012 + h) % 1, an = t * 0.12 + i * 2.4;
            const r = 30 + ph * 70, y = f.y + 20 - ph * 150;
            dtpLeaf(cx + Math.cos(an) * r, y + Math.sin(an) * r * 0.25, 6 + h * 4, an + Math.PI / 2, i % 3 ? DTP_LEAF : DTP_JADE, a * (1 - ph * 0.6));
        }
    }
    // 3) mục tiêu xoay tít bay lên
    if (!gone && t >= 0) {
        const s = 1 - 0.35 * le;
        ctx.save(); ctx.translate(vx, vy); ctx.rotate(t * 0.18 * le);
        ctx.fillStyle = '#334155'; ctx.strokeStyle = '#a7f3d0'; ctx.lineWidth = 1.5; ctx.shadowBlur = 12; ctx.shadowColor = DTP_JADE; ctx.globalAlpha *= 0.95 * E(26, 34);
        ctx.fillRect(-f.vw / 2 * s, -f.vh / 2 * s, f.vw * s, f.vh * s); ctx.strokeRect(-f.vw / 2 * s, -f.vh / 2 * s, f.vw * s, f.vh * s);
        ctx.restore();
    }
    // 4) vạn đạo phong nhận: 3 đợt cắt chéo
    if (t >= 58 && t < 132) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
        for (let w = 0; w < 3; w++) {
            const w0 = 58 + w * 22;
            for (let i = 0; i < 20; i++) {
                const t0 = w0 + i * 0.7, k = (t - t0) / 14;
                if (k <= 0 || k >= 1) continue;
                const h = dtpFHash(f.seed + w, i), an = (w % 2 ? 0.5 : -0.5) + (h - 0.5) * 1.2 + (i % 2 ? Math.PI : 0);
                const L = 150, ox = Math.cos(an), oy = Math.sin(an), off = (h - 0.5) * 50;
                const px = vx - ox * L + ox * 2 * L * k - oy * off, py = vy - oy * L + oy * 2 * L * k + ox * off;
                const len = 44 + h * 40, a = Math.sin(Math.PI * k);
                ctx.strokeStyle = dtpRgba(i % 3 ? '#ecfdf5' : DTP_LEAF, 0.9 * a); ctx.lineWidth = 2.2 + h * 2.2; ctx.shadowBlur = 10; ctx.shadowColor = DTP_JADE;
                ctx.beginPath(); ctx.moveTo(px - ox * len, py - oy * len); ctx.quadraticCurveTo(px - oy * 6, py + ox * 6, px, py); ctx.stroke();
            }
            // chớp sáng mỗi đợt chém
            const fk = E(w0 + 10, w0 + 18);
            if (fk > 0 && fk < 1) { ctx.strokeStyle = dtpRgba('#d1fae5', 1 - fk); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(vx, vy, 18 + fk * 50, 0, Math.PI * 2); ctx.stroke(); }
        }
        ctx.restore();
    }
    // 1) & 5) Quạt: khép lại lúc mở màn, bung mở hết cỡ lúc kết
    const fx = f.x - 46, fy = f.y + toK * 64;
    const ang = Math.atan2((gone ? top : vy) - fy, cx - fx) + Math.PI / 2;
    let open, R = 40, fa = 1;
    if (t < 26) { open = 2.6 - 2.35 * dtpFE(t, 2, 22); fa = E(0, 6); }
    else if (t < 112) open = 0.25;
    else { const k = E(112, 132); open = 0.25 + 2.85 * k * k; R = 40 + 34 * k; }
    if (t > 150) fa = 1 - E(150, 170);
    if (t >= 112 && t < 132) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const k = E(112, 132), gg = ctx.createRadialGradient(fx, fy, 0, fx, fy, 30 + 40 * k); gg.addColorStop(0, dtpRgba('#ecfdf5', 0.7 * k)); gg.addColorStop(1, dtpRgba(DTP_JADE, 0)); ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(fx, fy, 30 + 40 * k, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
    dtpFan(fx, fy, R, ang, open, DTP_JADE, 0.95 * fa);
    // vệt gió từ quạt bắn lên mục tiêu
    if (t >= 128 && t < 140) {
        const k = E(128, 140);
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = dtpRgba('#ecfdf5', 1 - k); ctx.lineWidth = 10 * (1 - k) + 1; ctx.shadowBlur = 16; ctx.shadowColor = DTP_JADE;
        ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(cx, top); ctx.stroke(); ctx.restore();
    }
    // 5) sóng xung kích ngọc bích + bụi tan
    if (gone) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        if (typeof fcRays === 'function') fcRays(cx, top, 16, 320 * Math.min(1, boom * 4), DTP_JADE, 0.75 * (1 - boom), f.seed, 0.06);
        for (let j = 0; j < 3; j++) {
            const k = E(132 + j * 5, 166 + j * 5); if (k <= 0 || k >= 1) continue;
            ctx.strokeStyle = dtpRgba(j === 1 ? '#ecfdf5' : DTP_JADE, 1 - k); ctx.lineWidth = 7 * (1 - k) + 1; ctx.shadowBlur = 18; ctx.shadowColor = DTP_JADE;
            ctx.beginPath(); ctx.ellipse(cx, top, 20 + k * 230, (20 + k * 230) * 0.55, 0, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.restore();
        for (let i = 0; i < 44; i++) {
            const h = dtpFHash(f.seed, i + 50), h2 = dtpFHash(f.seed, i + 99), an = h * Math.PI * 2;
            const d = (20 + h2 * 150) * (1 - Math.pow(1 - boom, 3)), x = cx + Math.cos(an) * d, y = top + Math.sin(an) * d * 0.7 - boom * 40;
            const a = 1 - boom;
            if (i % 3 === 0) dtpLeaf(x, y, 3 + h2 * 3, an + boom * 6, i % 2 ? DTP_LEAF : DTP_JADE, a);
            else { ctx.globalAlpha = fade * a; ctx.fillStyle = i % 2 ? '#d6d3d1' : '#a7f3d0'; ctx.fillRect(x, y, 2, 2); ctx.globalAlpha = fade; }
        }
    }
    if (t >= 132 && t < 142) {
        ctx.save(); if (typeof fcScreen === 'function') fcScreen(); ctx.globalAlpha = (142 - t) / 10 * 0.55; ctx.fillStyle = '#d1fae5'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.restore();
    }
    ctx.restore();
    // 6) khung điện ảnh + COLLAB + tiêu đề
    if (typeof fcLetterbox === 'function') {
        fcVignette(0.5 * fcBarK(t, 16, 160, 180), '#011a14');
        const bh = fcLetterbox(fcBarK(t, 12, 164, 180), DTP_JADE);
        fcBadge(E(6, 22) * (1 - E(162, 176)), 'DIỆP THANH PHONG', DTP_JADE, bh);
        fcTitle('PHONG THẦN TUYỆT TỨC', 'CỬU TRÙNG VÂN · PHONG NHẬN', E(136, 148), { c: DTP_JADE, c2: '#d1fae5', alpha: 1 - E(164, 178), sw: E(140, 168) * 1.2 - 0.1, size: 26 });
    }
}
function dtpFxOver() {
    if (typeof bodyEffects === 'undefined') return;
    for (const e of bodyEffects) if (e instanceof DtpFinisher && e.active) e.drawOver();
}
