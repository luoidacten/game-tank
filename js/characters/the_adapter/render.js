// ==========================================
// The Adapter (the_adapter) — Hình ảnh: xe khung lục giác + Vòng Xoay Thích Ứng 8 chấu sau lưng
// (mỗi nấc quay 45° & sáng 1 mắt đèn vàng), mắt quét cyan; đạn tia lục giác / Đạn Khai Thác đỏ;
// Hồng Tâm Quét Điểm Yếu xN trên địch; HUD; kết liễu "PHÂN TÍCH HOÀN TẤT: 100% LỖI". Chỉ đọc state.
// ==========================================

function adNow() { return (Date.now() % 1e6) / 1000; }

function adWheel(cx, cy, R, ang, lit, cap, glow, lw) {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang);
    ctx.strokeStyle = glow ? AD_GOLD : '#a16207'; ctx.lineWidth = lw || 1.4;
    if (glow) { ctx.shadowBlur = 12; ctx.shadowColor = AD_GOLD; }
    ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = (lw || 1.4) * 0.7;
    for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4;
        ctx.beginPath(); ctx.moveTo(Math.cos(a) * R * 0.3, Math.sin(a) * R * 0.3); ctx.lineTo(Math.cos(a) * R, Math.sin(a) * R); ctx.stroke();
        // răng cưa
        ctx.beginPath(); ctx.moveTo(Math.cos(a + 0.18) * R, Math.sin(a + 0.18) * R); ctx.lineTo(Math.cos(a + 0.2) * R * 1.16, Math.sin(a + 0.2) * R * 1.16);
        ctx.lineTo(Math.cos(a + 0.44) * R * 1.16, Math.sin(a + 0.44) * R * 1.16); ctx.lineTo(Math.cos(a + 0.46) * R, Math.sin(a + 0.46) * R); ctx.stroke();
    }
    for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4, on = i < lit, avail = i < cap;
        ctx.fillStyle = on ? '#fde047' : avail ? 'rgba(113,63,18,0.9)' : 'rgba(30,41,59,0.9)';
        ctx.shadowBlur = on ? 8 : 0; ctx.shadowColor = AD_GOLD;
        ctx.beginPath(); ctx.arc(Math.cos(a) * R * 0.66, Math.sin(a) * R * 0.66, Math.max(1, R * 0.13), 0, Math.PI * 2); ctx.fill();
    }
    ctx.shadowBlur = 0; ctx.fillStyle = glow ? '#fef08a' : '#78350f';
    ctx.beginPath(); ctx.arc(0, 0, R * 0.22, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}

// ---------- Xe The Adapter ----------
registerTankArt('the_adapter', (p, k) => {
    const t = k.t, st = p.adStacks || 0, cap = adCap(p), perf = adPerfect(p), rc = (p.adRecoil || 0) / 8;
    const click = (p.adClick || 0) / 20, ang = (st - click * click) * Math.PI / 4;
    TA.treads(-15, 4.4, -11, 13, t, '#0f172a', '#155e75');
    // Vòng Xoay Thích Ứng sau lưng
    adWheel(0, 6, 9.5, ang, st, cap, perf || click > 0, 1.3);
    if (perf) { ctx.save(); ctx.globalAlpha = 0.35 + 0.25 * Math.sin(t * 6); ctx.strokeStyle = AD_GOLD; ctx.lineWidth = 2; TA.glow(AD_GOLD, 16); ctx.beginPath(); ctx.arc(0, 6, 12.5, 0, Math.PI * 2); ctx.stroke(); TA.noGlow(); ctx.restore(); }
    // nòng
    ctx.fillStyle = TA.metal(-2, 2, '#0e7490', '#a5f3fc');
    TA.rr(-2, -16 + rc * 3, 4, 9, 1); ctx.fill();
    ctx.fillStyle = AD_CYAN; ctx.fillRect(-2.4, -16.5 + rc * 3, 4.8, 1.6);
    // khung lục giác
    TA.glow(k.teamGlow, 7);
    ctx.fillStyle = TA.metal(-10, 10, '#0f172a', '#334155');
    ctx.beginPath();
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + Math.PI / 6; ctx.lineTo(Math.cos(a) * 10, Math.sin(a) * 9 - 2); }
    ctx.closePath(); ctx.fill(); TA.noGlow();
    ctx.strokeStyle = k.team; ctx.lineWidth = 0.9; ctx.stroke();
    // đường mạch vàng
    ctx.strokeStyle = 'rgba(250,204,21,0.8)'; ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(-7, 2); ctx.lineTo(-3, -2); ctx.lineTo(3, -2); ctx.lineTo(7, 2); ctx.stroke();
    // mắt quét
    const sc = Math.sin(t * 3) * 3.2;
    const g = ctx.createRadialGradient(0, -3, 0.5, 0, -3, 4.5);
    g.addColorStop(0, '#ecfeff'); g.addColorStop(1, '#0e7490');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -3, 4.2, 0, Math.PI * 2); ctx.fill();
    TA.glow(AD_CYAN, 8); ctx.fillStyle = (p.adSkillFx || 0) > 0 ? AD_RED : AD_CYAN;
    ctx.fillRect(-3.6, -3.6, 7.2, 1.2); ctx.fillStyle = AD_WHITE; ctx.fillRect(sc - 0.8, -3.9, 1.6, 1.8); TA.noGlow();
    if (k.evo1) { ctx.fillStyle = AD_CYAN; for (let i = -1; i <= 1; i += 2) { ctx.beginPath(); ctx.arc(i * 8.5, -7.5, 1.3, 0, Math.PI * 2); ctx.fill(); } }
    if (k.evo2) { ctx.strokeStyle = 'rgba(244,63,94,0.85)'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.arc(0, -3, 6, Math.PI * 0.1, Math.PI * 0.9); ctx.stroke(); }
});

// ---------- Đạn ----------
function adDrawBullet(b) {
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2, up = (b.vy || 0) < 0;
    ctx.save(); ctx.translate(cx, cy); if (!up) ctx.rotate(Math.PI);
    if (b.adExploit) {
        ctx.strokeStyle = 'rgba(244,63,94,0.5)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(0, 6); ctx.lineTo(0, 26); ctx.stroke();
        ctx.shadowBlur = 14; ctx.shadowColor = AD_RED; ctx.fillStyle = '#fecdd3';
        ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(5, 0); ctx.lineTo(0, 9); ctx.lineTo(-5, 0); ctx.closePath(); ctx.fill();
        ctx.fillStyle = AD_RED; ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI * 2); ctx.fill();
        const a = adNow() * 8;
        ctx.strokeStyle = AD_GOLD; ctx.lineWidth = 1; ctx.shadowColor = AD_GOLD;
        for (let i = 0; i < 4; i++) { const q = a + i * Math.PI / 2; ctx.beginPath(); ctx.arc(0, 0, 8, q, q + 0.8); ctx.stroke(); }
    } else {
        const s = b.adBig ? 1.5 : 1;
        ctx.strokeStyle = b.adBig ? 'rgba(250,204,21,0.45)' : 'rgba(34,211,238,0.4)'; ctx.lineWidth = 2 * s;
        ctx.beginPath(); ctx.moveTo(0, 4 * s); ctx.lineTo(0, 15 * s); ctx.stroke();
        ctx.shadowBlur = 10; ctx.shadowColor = b.adBig ? AD_GOLD : AD_CYAN; ctx.fillStyle = b.adBig ? '#fef08a' : '#cffafe';
        ctx.beginPath();
        for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; ctx.lineTo(Math.cos(a) * 3 * s, Math.sin(a) * 5.2 * s); }
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = AD_GOLD; ctx.beginPath(); ctx.arc(0, 0, 1.3 * s, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
}

// ---------- Hồng Tâm Quét Điểm Yếu trên địch ----------
function adDrawReticle(owner, e) {
    const w = e.adWeak || 0;
    if (w <= 0 || e.hp <= 0) return;
    const cap = adWeakCap(owner), pop = (e.adWeakPop || 0) / 20, full = w >= 5;
    const cx = e.x + e.w / 2, cy = e.y + e.h / 2, R = Math.max(e.w, e.h) * 0.72 + pop * 5, a = adNow() * (full ? 2.4 : 1.2);
    ctx.save();
    ctx.globalAlpha = 0.55 + 0.25 * (w / cap);
    ctx.strokeStyle = full ? AD_GOLD : AD_RED; ctx.lineWidth = 1.2; ctx.shadowBlur = 8 + pop * 10; ctx.shadowColor = ctx.strokeStyle;
    for (let i = 0; i < 4; i++) { const q = a + i * Math.PI / 2; ctx.beginPath(); ctx.arc(cx, cy, R, q + 0.25, q + Math.PI / 2 - 0.25); ctx.stroke(); }
    for (let i = 0; i < 4; i++) {
        const q = i * Math.PI / 2;
        ctx.beginPath(); ctx.moveTo(cx + Math.cos(q) * (R + 4), cy + Math.sin(q) * (R + 4)); ctx.lineTo(cx + Math.cos(q) * (R - 4), cy + Math.sin(q) * (R - 4)); ctx.stroke();
    }
    // nhãn xN
    ctx.globalAlpha = 1;
    const ly = e.id === 1 ? e.y + e.h + 13 : e.y - 13, lx = cx + R + 6;
    ctx.fillStyle = 'rgba(15,23,42,0.85)'; ctx.fillRect(lx - 2, ly - 6, 20, 12);
    ctx.strokeStyle = full ? AD_GOLD : AD_RED; ctx.lineWidth = 0.8; ctx.strokeRect(lx - 2, ly - 6, 20, 12);
    ctx.fillStyle = full ? '#fef08a' : '#fecdd3'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('x' + w, lx + 1, ly + 0.5);
    ctx.restore();
}

CharHooks.register('the_adapter', Object.assign(CharHooks.registry.the_adapter || {}, {
    draw() {
        const p = this;
        if (p.hp <= 0) return;
        const hold = p.adHold || 0, cx = p.x + p.w / 2, cy = p.y + p.h / 2;
        if (hold > 4 && !p.adUsed) {
            const f = Math.min(1, hold / AD_HOLD);
            ctx.save(); ctx.strokeStyle = p.adCd > 0 ? '#64748b' : AD_CYAN; ctx.lineWidth = 2; ctx.shadowBlur = 8; ctx.shadowColor = ctx.strokeStyle;
            ctx.beginPath(); ctx.arc(cx, cy, p.w * 0.78, -Math.PI / 2, -Math.PI / 2 + f * Math.PI * 2); ctx.stroke(); ctx.restore();
        }
        const fx = (p.adSkillFx || 0) / 30;
        if (fx > 0) {
            ctx.save(); ctx.globalAlpha = fx; ctx.strokeStyle = AD_CYAN; ctx.lineWidth = 2; ctx.shadowBlur = 12; ctx.shadowColor = AD_CYAN;
            for (let i = 1; i <= 3; i++) { ctx.globalAlpha = fx * (1 - i * 0.25); ctx.strokeRect(p.x - (p.adDashDir || 1) * i * 7, p.y, p.w, p.h); }
            ctx.restore();
        }
    },
    drawUI() {
        if (this.hp <= 0) return;
        const e = adEnemy(this);
        if (e) adDrawReticle(this, e);
        if (typeof hudExtraBar === 'function') {
            hudExtraBar(this, 0, (this.adStacks || 0) / adCap(this), adPerfect(this) ? '#fef08a' : AD_GOLD, { h: 2.5 });
            hudExtraBar(this, 1, 1 - (this.adCd || 0) / AD_CD, (this.adCd || 0) <= 0 ? AD_CYAN : 'rgba(34,211,238,0.4)', { h: 2.5 });
        }
    },
}));

// ---------- Kết liễu "PHÂN TÍCH HOÀN TẤT: 100% LỖI" ----------
const AD_FIN_LABELS = [['GIÁP', '0%'], ['XÍCH', 'LỖI'], ['NÒNG', 'LỖI'], ['LÕI', '100% LỖI']];
function adDrawFinisherUnder(f) {
    const W = canvas.width, H = canvas.height, t = f.t;
    const fade = t > 140 ? Math.max(0, 1 - (t - 140) / 25) : 1, fin = Math.min(1, t / 18);
    ctx.save();
    ctx.globalAlpha = 0.6 * fade * fin; ctx.fillStyle = '#020617'; ctx.fillRect(0, 0, W, H);
    // lưới quét
    ctx.globalAlpha = 0.18 * fade; ctx.strokeStyle = AD_CYAN; ctx.lineWidth = 0.6;
    for (let x = (f.x % 24); x < W; x += 24) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = (f.y % 24); y < H; y += 24) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    // bánh đà vàng khổng lồ quay tít quanh mục tiêu
    ctx.globalAlpha = fade;
    const spin = t * t * 0.0016 + t * 0.05;
    adWheel(f.x, f.y, 34 + 34 * fin, spin, 8, 8, true, 2.4);
    adWheel(f.x, f.y, 20 + 18 * fin, -spin * 1.6, Math.min(8, Math.floor(t / 8)), 8, true, 1.4);
    ctx.restore();
}
function adDrawFinisherOver(f) {
    const W = canvas.width, H = canvas.height, t = f.t;
    const fade = t > 140 ? Math.max(0, 1 - (t - 140) / 25) : 1;
    const toC = f.y < H / 2 ? 1 : -1;
    ctx.save(); ctx.globalAlpha = fade;
    // 1) khung khoá mục tiêu thu hẹp + tia quét
    const lk = Math.min(1, t / 22), B = 60 - 36 * lk, bl = 9;
    ctx.strokeStyle = lk >= 1 ? AD_RED : AD_CYAN; ctx.lineWidth = 2; ctx.shadowBlur = 10; ctx.shadowColor = ctx.strokeStyle;
    for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        const x = f.x + sx * B, y = f.y + sy * B;
        ctx.beginPath(); ctx.moveTo(x - sx * bl, y); ctx.lineTo(x, y); ctx.lineTo(x, y - sy * bl); ctx.stroke();
    }
    if (t < 40) {
        const sy = f.y - 50 + ((t * 5) % 100);
        ctx.globalAlpha = fade * 0.8; ctx.strokeStyle = AD_CYAN; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(f.x - 55, sy); ctx.lineTo(f.x + 55, sy); ctx.stroke();
        ctx.globalAlpha = fade;
    }
    // 2) bảng giải phẫu điểm yếu
    if (t >= 22 && t < 112) {
        const pts = [[-8, -6], [9, -4], [0, -12], [0, 2]];
        ctx.font = 'bold 10px monospace'; ctx.textBaseline = 'middle';
        AD_FIN_LABELS.forEach((L, i) => {
            const k = Math.min(1, (t - 22 - i * 14) / 10);
            if (k <= 0) return;
            const side = i % 2 ? 1 : -1, ax = f.x + pts[i][0], ay = f.y + pts[i][1];
            const ly = f.y + toC * (44 + i * 24), lx = Math.max(8, Math.min(W - 128, f.x + side * 34 - (side < 0 ? 120 : 0)));
            const ex = side < 0 ? lx + 120 : lx;
            ctx.strokeStyle = i === 3 ? AD_RED : AD_GOLD; ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 6; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax + (ex - ax) * k, ay + (ly - ay) * k); ctx.stroke();
            ctx.fillStyle = ctx.strokeStyle; ctx.beginPath(); ctx.arc(ax, ay, 2, 0, Math.PI * 2); ctx.fill();
            if (k >= 1) {
                ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(2,6,23,0.88)'; ctx.fillRect(lx, ly - 8, 120, 16);
                ctx.strokeRect(lx, ly - 8, 120, 16);
                ctx.textAlign = 'left'; ctx.fillStyle = '#e2e8f0'; ctx.fillText(L[0], lx + 4, ly + 0.5);
                ctx.textAlign = 'right'; ctx.fillStyle = i === 3 ? '#fda4af' : '#fde047'; ctx.fillText(L[1], lx + 116, ly + 0.5);
            }
        });
        const hdr = 'PHÂN TÍCH HOÀN TẤT', n = Math.min(hdr.length, Math.floor((t - 22) / 2));
        ctx.textAlign = 'center'; ctx.font = 'bold 15px monospace'; ctx.fillStyle = AD_CYAN; ctx.shadowColor = AD_CYAN; ctx.shadowBlur = 12;
        ctx.fillText(hdr.slice(0, n) + (n < hdr.length && t % 8 < 4 ? '_' : ''), W / 2, f.y + toC * 150);
    }
    // 3) tia năng lượng chuẩn xác xuyên lõi
    if (t >= 96 && t < 132) {
        const k = Math.min(1, (t - 96) / 16), dx = f.x - f.ox, dy = f.y - f.oy, len = Math.hypot(dx, dy) || 1;
        const ux = dx / len, uy = dy / len, ex = f.ox + ux * (len + 260) * k, ey = f.oy + uy * (len + 260) * k;
        const wdt = t >= 112 ? Math.max(1, 9 * (1 - (t - 112) / 20)) : 1.2;
        ctx.strokeStyle = AD_GOLD; ctx.shadowColor = AD_GOLD; ctx.shadowBlur = 20; ctx.lineWidth = wdt + 4; ctx.globalAlpha = fade * 0.6;
        ctx.beginPath(); ctx.moveTo(f.ox, f.oy); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.strokeStyle = '#fffbeb'; ctx.lineWidth = wdt; ctx.globalAlpha = fade;
        ctx.beginPath(); ctx.moveTo(f.ox, f.oy); ctx.lineTo(ex, ey); ctx.stroke();
    }
    if (t >= 112 && t < 120) { ctx.globalAlpha = (120 - t) / 8 * 0.75; ctx.fillStyle = '#fef9c3'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = fade; }
    // 4) chữ kết
    if (t >= 112) {
        const k = Math.min(1, (t - 112) / 10), sc = 1.6 - 0.6 * k;
        ctx.save(); ctx.translate(W / 2, f.y + toC * 110); ctx.scale(sc, sc);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.shadowBlur = 18;
        ctx.shadowColor = AD_RED; ctx.fillStyle = '#fb7185'; ctx.font = 'bold 34px monospace'; ctx.fillText('100% LỖI', 0, 0);
        ctx.shadowColor = AD_GOLD; ctx.fillStyle = '#fde047'; ctx.font = 'bold 13px monospace'; ctx.fillText('PHÂN TÍCH HOÀN TẤT', 0, -28);
        ctx.restore();
    }
    ctx.restore();
}

function adFxOver() {
    if (typeof bodyEffects === 'undefined') return;
    for (const e of bodyEffects) if (e instanceof AdFinisher && e.active) e.drawOver();
}
