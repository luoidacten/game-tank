// ==========================================
// Skinwalker (skinwalker) — Hình ảnh: khối thịt dị thể (đen tím) đổi dáng theo Hình Thái:
//   🩸 gai xương đỏ | 👁 con mắt hư không tím | 🕸 nanh móc cyan | ☣ bọc mủ độc xanh. Da phụ: vân màu phụ.
// Đạn riêng, ấn Tê Liệt / Hoại Tử / Khóa Chân trên địch, kết liễu "THÔN PHỆ ĐỒNG HÓA". Chỉ đọc state.
// ==========================================

function swNow() { return (Date.now() % 1e6) / 1000; }

// Khối thịt lượn sóng (toạ độ lưới)
function swBlobPath(R, t, wob, n) {
    ctx.beginPath();
    const N = n || 18;
    for (let i = 0; i <= N; i++) {
        const a = i / N * Math.PI * 2;
        const r = R * (1 + wob * Math.sin(a * 5 + t * 3.2) + wob * 0.6 * Math.sin(a * 3 - t * 2.1));
        const x = Math.cos(a) * r, y = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
}
function swEye(x, y, r, iris, t, slit) {
    ctx.fillStyle = '#fef2f2'; ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.75, 0, 0, Math.PI * 2); ctx.fill();
    TA.glow(iris, 6); ctx.fillStyle = iris; ctx.beginPath(); ctx.arc(x + Math.sin(t * 1.7) * r * 0.25, y, r * 0.55, 0, Math.PI * 2); ctx.fill(); TA.noGlow();
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(x + Math.sin(t * 1.7) * r * 0.25, y, slit ? r * 0.14 : r * 0.25, r * 0.5, 0, 0, Math.PI * 2); ctx.fill();
}
// Vân máu / gân trên khối thịt
function swVeins(R, col, t, n) {
    ctx.strokeStyle = col; ctx.lineWidth = 0.7; ctx.globalAlpha *= 0.85;
    for (let i = 0; i < (n || 5); i++) {
        const a = i * 2.39 + 0.4;
        ctx.beginPath(); ctx.moveTo(Math.cos(a) * R * 0.25, Math.sin(a) * R * 0.25);
        ctx.quadraticCurveTo(Math.cos(a + 0.5) * R * 0.6, Math.sin(a + 0.5) * R * 0.6 + Math.sin(t * 2 + i) * 0.8, Math.cos(a + 0.2) * R * 0.92, Math.sin(a + 0.2) * R * 0.92);
        ctx.stroke();
    }
}

registerTankArt('skinwalker', (p, k) => {
    const t = k.t, f = p.swForm || '', F = SW_FORMS[f], col = F ? F.c : '#a855f7', rc = (p.swRecoil || 0) / 8;
    if (p.swShedT > 0) ctx.globalAlpha *= 0.35 + 0.15 * Math.sin(t * 30);
    // Sau khi THÔN PHỆ: khoác lên hình dáng quái dị của nạn nhân
    if (p.swMorph && p.swMorph !== 'skinwalker' && typeof TANK_ART !== 'undefined' && TANK_ART[p.swMorph]) {
        ctx.save(); ctx.scale(1 + 0.08 * Math.sin(t * 7), 1 + 0.08 * Math.cos(t * 5.5));
        try { TANK_ART[p.swMorph](p, k); } catch (e) { /* bỏ qua */ }
        ctx.restore();
        ctx.save(); ctx.globalAlpha *= 0.55; ctx.fillStyle = SW_DARK; swBlobPath(14, t, 0.08); ctx.fill(); ctx.restore();
        swVeins(15, '#e11d48', t, 7);
        ctx.globalAlpha = 1;
        swEye(-5, -2, 2.6, '#ef4444', t, true); swEye(5, 1, 2.1, '#ef4444', t + 1, true); swEye(0, 7, 1.6, '#ef4444', t + 2, true);
        return;
    }
    const morph = (p.swMorphFx || 0) / 50;
    const R = 12.5 * (1 + morph * 0.25 * Math.sin(t * 25));
    // Xúc tu dưới thân (thay bánh xích)
    ctx.strokeStyle = '#3b0764'; ctx.lineWidth = 2.6;
    for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) {
        const y0 = -6 + i * 7, w = Math.sin(t * 6 + i * 1.7 + sx) * 2;
        ctx.beginPath(); ctx.moveTo(sx * 9, y0); ctx.quadraticCurveTo(sx * 14, y0 + 2 + w, sx * 15.2, y0 + 5 + w); ctx.stroke();
    }
    // Hình thái: chi tiết sau lưng / quanh thân
    if (f === 'pha') {
        ctx.fillStyle = '#fecdd3'; TA.glow('#f43f5e', 6);
        for (let i = 0; i < 9; i++) {
            const a = Math.PI * 0.15 + i / 8 * Math.PI * 1.7 + Math.PI / 2, L = 15.5 + (i % 2) * 1.2;
            ctx.beginPath(); ctx.moveTo(Math.cos(a - 0.16) * 10, Math.sin(a - 0.16) * 10); ctx.lineTo(Math.cos(a) * L, Math.sin(a) * L); ctx.lineTo(Math.cos(a + 0.16) * 10, Math.sin(a + 0.16) * 10); ctx.fill();
        }
        TA.noGlow();
    } else if (f === 'hu') {
        ctx.save(); ctx.rotate(t * 1.2); ctx.strokeStyle = 'rgba(192,132,252,0.85)'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); TA.glow('#a855f7', 8);
        ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    } else if (f === 'troc') {
        ctx.strokeStyle = 'rgba(34,211,238,0.5)'; ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) { const yy = 4 + i * 3.5; ctx.beginPath(); ctx.moveTo(-14 + i, yy); ctx.lineTo(-8, yy - 1); ctx.moveTo(14 - i, yy); ctx.lineTo(8, yy - 1); ctx.stroke(); }
    }
    // Thân thịt
    TA.glow(k.teamGlow, 7);
    const g = ctx.createRadialGradient(0, -2, 1, 0, 0, R + 2);
    g.addColorStop(0, F ? col : '#7e22ce'); g.addColorStop(0.35, '#3b0a3f'); g.addColorStop(1, SW_DARK);
    ctx.fillStyle = g; swBlobPath(f === 'troc' ? R * 0.92 : R, t, f === 'doc' ? 0.07 : 0.045); ctx.fill(); TA.noGlow();
    ctx.strokeStyle = k.team; ctx.lineWidth = 0.9; ctx.stroke();
    swVeins(R, F ? col : '#c084fc', t, 6);
    ctx.globalAlpha = p.swShedT > 0 ? 0.5 : 1;
    // Da phụ: vân màu phụ quấn quanh
    if (p.swSub && SW_FORMS[p.swSub]) {
        ctx.save(); ctx.strokeStyle = SW_FORMS[p.swSub].c; ctx.lineWidth = 1.3; TA.glow(SW_FORMS[p.swSub].c, 6);
        ctx.beginPath(); ctx.arc(0, 0, R - 1.5, t * 2, t * 2 + 1.4); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, R - 1.5, t * 2 + Math.PI, t * 2 + Math.PI + 1.4); ctx.stroke(); ctx.restore();
    }
    if (p.swDup) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 0.8; TA.glow(col, 10); swBlobPath(R + 2.2, -t, 0.05); ctx.stroke(); ctx.restore(); }
    // Mũi bắn / mặt
    if (f === 'pha') {
        ctx.fillStyle = TA.metal(-2.5, 2.5, '#9f1239', '#fff1f2');
        ctx.beginPath(); ctx.moveTo(-3, -8); ctx.lineTo(0, -17 + rc * 3); ctx.lineTo(3, -8); ctx.closePath(); ctx.fill();
        swEye(-4, -1, 2.1, '#f43f5e', t, true); swEye(4, -1, 2.1, '#f43f5e', t, true);
    } else if (f === 'hu') {
        swEye(0, -1, 6.2, '#a855f7', t, true);
        ctx.fillStyle = '#e9d5ff'; TA.glow('#a855f7', 8); ctx.fillRect(-1, -15 + rc * 3, 2, 5); TA.noGlow();
    } else if (f === 'troc') {
        ctx.strokeStyle = '#a5f3fc'; ctx.lineWidth = 1.8; TA.glow('#22d3ee', 8);
        for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * 5, -6); ctx.quadraticCurveTo(sx * 7, -14 + rc * 2, sx * 2, -16 + rc * 3); ctx.stroke(); }
        TA.noGlow();
        swEye(-3, 0, 1.8, '#22d3ee', t, true); swEye(3, 0, 1.8, '#22d3ee', t, true); swEye(0, 4, 1.3, '#22d3ee', t, true);
    } else if (f === 'doc') {
        ctx.fillStyle = 'rgba(190,242,100,0.9)'; TA.glow('#84cc16', 8);
        for (let i = 0; i < 5; i++) { const a = i * 1.3 + 0.5, rr = 1.4 + 0.6 * Math.sin(t * 4 + i); ctx.beginPath(); ctx.arc(Math.cos(a) * 8, Math.sin(a) * 7 + 1, rr, 0, Math.PI * 2); ctx.fill(); }
        ctx.fillStyle = '#365314'; TA.rr(-2.5, -15 + rc * 3, 5, 8, 2); ctx.fill();
        ctx.fillStyle = '#bef264'; ctx.beginPath(); ctx.arc(0, -15 + rc * 3, 2.3, 0, Math.PI * 2); ctx.fill(); TA.noGlow();
        swEye(0, 0, 2.6, '#84cc16', t, false);
    } else {
        swEye(0, 0, 3.4, '#c084fc', t, true);
    }
    if (morph > 0) { ctx.globalAlpha = morph; ctx.strokeStyle = col; ctx.lineWidth = 1.5; TA.glow(col, 14); swBlobPath(R + 4 * (1 - morph), t, 0.12); ctx.stroke(); TA.noGlow(); ctx.globalAlpha = 1; }
});

// ---------- Đạn ----------
function swDrawBullet(b) {
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2, ang = Math.atan2(b.vy || 0, b.vx || 0) + Math.PI / 2, t = swNow();
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang);
    if (b.swT === 'pha') {
        TA.glow('#f43f5e', 10); ctx.fillStyle = '#fff1f2';
        ctx.beginPath(); ctx.moveTo(0, -b.h / 2 - 2); ctx.lineTo(b.w / 2, b.h / 2); ctx.lineTo(0, b.h / 2 - 3); ctx.lineTo(-b.w / 2, b.h / 2); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#e11d48'; ctx.fillRect(-1, -1, 2, b.h / 2);
    } else if (b.swT === 'hu') {
        TA.glow('#a855f7', 14);
        const g = ctx.createLinearGradient(0, -b.h / 2, 0, b.h / 2 + 18); g.addColorStop(0, '#f5f3ff'); g.addColorStop(0.3, '#a855f7'); g.addColorStop(1, 'rgba(88,28,135,0)');
        ctx.fillStyle = g; ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h + 18);
        if (b.swVoid > 0) { ctx.strokeStyle = 'rgba(192,132,252,0.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 0, 8 + Math.sin(t * 20) * 2, 0, Math.PI * 2); ctx.stroke(); }
    } else if (b.swT === 'troc') {
        const lock = !!b.swLock;
        TA.glow('#22d3ee', lock ? 14 : 5); ctx.strokeStyle = lock ? '#ecfeff' : '#67e8f9'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, b.h / 2); ctx.lineTo(0, -b.h / 2); ctx.quadraticCurveTo((b.swSide || 1) * 5, -b.h / 2 - 1, (b.swSide || 1) * 4, -b.h / 2 + 4); ctx.stroke();
        if (!lock) { ctx.globalAlpha = 0.4 + 0.3 * Math.sin(t * 12); ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.stroke(); }
        else { ctx.globalAlpha = 0.5; ctx.fillStyle = '#22d3ee'; ctx.fillRect(-1, b.h / 2, 2, 12); }
    } else {
        TA.glow('#84cc16', 12); ctx.fillStyle = '#a3e635';
        ctx.beginPath(); ctx.ellipse(0, 0, b.w / 2 + Math.sin(t * 15) * 0.6, b.h / 2 + 1.5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ecfccb'; ctx.beginPath(); ctx.arc(-1.2, -1.5, 1.4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(132,204,22,0.6)'; ctx.beginPath(); ctx.arc(0, b.h / 2 + 4, 1.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
}

// ---------- Ấn trên địch & áp lực đối diện ----------
CharHooks.register('skinwalker', Object.assign(CharHooks.registry.skinwalker || {}, {
    drawUI() {
        const p = this;
        if (p.hp <= 0) return;
        const e = swEnemy(p), t = swNow();
        if (!e || e.hp <= 0) return;
        const ex = e.x + e.w / 2, ey = e.y + e.h / 2;
        ctx.save();
        if (p.swFacing) {
            ctx.strokeStyle = 'rgba(244,63,94,0.35)'; ctx.lineWidth = 2; ctx.setLineDash([6, 8]); ctx.lineDashOffset = -t * 40;
            ctx.beginPath(); ctx.moveTo(p.x + p.w / 2, p.y + p.h / 2); ctx.lineTo(ex, ey); ctx.stroke(); ctx.setLineDash([]);
            ctx.strokeStyle = 'rgba(244,63,94,0.8)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(ex, ey, e.w * 0.8, 0, Math.PI * 2); ctx.stroke();
        }
        if (e.swMarkT > 0) { // Tê Liệt: mạng nhện cyan
            ctx.strokeStyle = 'rgba(34,211,238,' + (0.4 + 0.4 * Math.min(1, e.swMarkT / 40)) + ')'; ctx.lineWidth = 1; ctx.shadowBlur = 8; ctx.shadowColor = '#22d3ee';
            const R = e.w * 0.85;
            for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + t * 0.5; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex + Math.cos(a) * R, ey + Math.sin(a) * R); ctx.stroke(); }
            for (const rr of [0.45, 0.85]) { ctx.beginPath(); for (let i = 0; i <= 6; i++) { const a = i * Math.PI / 3 + t * 0.5; ctx.lineTo(ex + Math.cos(a) * R * rr, ey + Math.sin(a) * R * rr); } ctx.stroke(); }
        }
        if (e.swRootT > 0) { // Khóa Chân: xúc tu quấn
            ctx.strokeStyle = '#7e22ce'; ctx.lineWidth = 3; ctx.shadowBlur = 10; ctx.shadowColor = '#a855f7';
            for (let i = 0; i < 4; i++) { const sx = e.x + e.w * (i + 0.5) / 4; ctx.beginPath(); ctx.moveTo(sx, e.y + e.h + 6); ctx.quadraticCurveTo(sx + Math.sin(t * 9 + i) * 6, ey, sx, e.y - 2); ctx.stroke(); }
        }
        if (e.swRotT > 0) { // Hoại Tử: bọt độc
            ctx.fillStyle = 'rgba(163,230,53,0.75)'; ctx.shadowBlur = 8; ctx.shadowColor = '#84cc16';
            for (let i = 0; i < 5; i++) { const ph = (t * 1.3 + i * 0.2) % 1; ctx.globalAlpha = 1 - ph; ctx.beginPath(); ctx.arc(e.x + e.w * ((i * 0.37) % 1), ey - ph * 22, 1.5 + ph * 2, 0, Math.PI * 2); ctx.fill(); }
            ctx.globalAlpha = 1;
        }
        if (e.swWoundT > 0) { ctx.shadowBlur = 0; ctx.fillStyle = '#84cc16'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('✚̸', ex + e.w * 0.7, e.y - 2); }
        ctx.restore();
    },
}));

// ---------- Kết liễu "THÔN PHỆ ĐỒNG HÓA" ----------
function swTentacle(x0, y0, x1, y1, prog, t, i, w) {
    const mx = (x0 + x1) / 2 + Math.sin(t * 4 + i * 1.9) * 30, my = (y0 + y1) / 2 + Math.cos(t * 3 + i) * 20;
    const ex = x0 + (x1 - x0) * prog, ey = y0 + (y1 - y0) * prog;
    const cx = x0 + (mx - x0) * prog * 1.2, cy = y0 + (my - y0) * prog * 1.2;
    ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(cx, cy, ex, ey); ctx.stroke();
}
function swDrawFinisherUnder(f) {
    const a = Math.min(1, f.t / 30) * (f.t > f.dur - 25 ? (f.dur - f.t) / 25 : 1);
    ctx.save(); ctx.globalAlpha = 0.7 * a;
    const g = ctx.createRadialGradient(f.x, f.y, 4, f.x, f.y, 70);
    g.addColorStop(0, 'rgba(26,11,31,0.95)'); g.addColorStop(0.6, 'rgba(59,7,100,0.5)'); g.addColorStop(1, 'rgba(59,7,100,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(f.x, f.y, 75, 40, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}
function swDrawFinisherOver(f) {
    const t = f.t, T = swNow(), v = f.team === 1 ? p2 : p1;
    const fade = t > f.dur - 25 ? Math.max(0, (f.dur - t) / 25) : 1;
    ctx.save();
    // 1) Xúc tu vươn từ Skinwalker
    if (t < 125) {
        const prog = Math.min(1, t / 40), back = t > 100 ? 1 - (t - 100) / 25 : 1;
        ctx.strokeStyle = '#2e1065'; ctx.shadowBlur = 12; ctx.shadowColor = '#7e22ce'; ctx.lineCap = 'round';
        for (let i = 0; i < 6; i++) swTentacle(f.ox + (i - 2.5) * 4, f.oy, f.x + (i - 2.5) * 7, f.y, prog * back, T, i, 5 - i * 0.4);
        ctx.strokeStyle = 'rgba(192,132,252,0.7)';
        for (let i = 0; i < 6; i++) swTentacle(f.ox + (i - 2.5) * 4, f.oy, f.x + (i - 2.5) * 7, f.y, prog * back, T, i, 1);
    }
    // 2) Xe địch bị nuốt: co lại, rung, bị khối bóng tối bọc
    const vs = t < 40 ? 1 : Math.max(0, 1 - (t - 40) / 56);
    if (v && vs > 0 && typeof drawTankArt === 'function') {
        ctx.save(); ctx.translate(f.x + (Math.random() - 0.5) * 3 * (1 - vs), f.y); ctx.scale(vs, vs * (0.85 + 0.15 * Math.sin(t))); ctx.translate(-(v.x + v.w / 2), -(v.y + v.h / 2));
        drawTankArt(v, v.color); ctx.restore();
    }
    const massR = t < 30 ? 0 : t < 96 ? Math.min(1, (t - 30) / 40) * f.vw * 1.25 : f.vw * (1.25 - Math.min(0.55, (t - 96) / 40));
    if (massR > 0 && t < 135) {
        ctx.save(); ctx.translate(f.x, f.y); ctx.globalAlpha = fade * (t > 110 ? Math.max(0, 1 - (t - 110) / 25) : 1);
        const g = ctx.createRadialGradient(0, 0, 2, 0, 0, massR * 1.3);
        g.addColorStop(0, '#000'); g.addColorStop(0.7, '#1a0b1f'); g.addColorStop(1, 'rgba(76,29,149,0.4)');
        ctx.fillStyle = g; ctx.shadowBlur = 20; ctx.shadowColor = '#7e22ce';
        ctx.beginPath();
        for (let i = 0; i <= 24; i++) { const a = i / 24 * Math.PI * 2, r = massR * (1 + 0.18 * Math.sin(a * 6 + T * 8) + (t > 90 && t < 100 ? 0.25 : 0)); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
        ctx.closePath(); ctx.fill();
        // răng nghiền
        if (t > 70 && t < 105) {
            const bite = Math.abs(Math.sin((t - 70) * 0.35));
            ctx.fillStyle = '#fecdd3'; ctx.shadowColor = '#f43f5e';
            for (let i = 0; i < 8; i++) { const x = -massR * 0.8 + i * massR * 0.23; ctx.beginPath(); ctx.moveTo(x, -massR * 0.5 * bite - 2); ctx.lineTo(x + 3, -2); ctx.lineTo(x - 3, -2); ctx.fill(); ctx.beginPath(); ctx.moveTo(x, massR * 0.5 * bite + 2); ctx.lineTo(x + 3, 2); ctx.lineTo(x - 3, 2); ctx.fill(); }
        }
        ctx.restore();
    }
    // 3) Lột xác: bản sao quái dị của nạn nhân trồi lên từ khối thịt
    if (t >= 105 && v && typeof drawTankArt === 'function') {
        const k = Math.min(1, (t - 105) / 25), S = 1.75 * k, R = f.vw * 0.5 * S;
        ctx.save(); ctx.globalAlpha = fade;
        ctx.translate(f.x, f.y);
        ctx.scale(S * (1 + 0.1 * Math.sin(T * 9)), S * (1 + 0.1 * Math.cos(T * 7)));
        ctx.rotate(Math.sin(T * 5) * 0.08);
        ctx.translate(-(v.x + v.w / 2), -(v.y + v.h / 2));
        drawTankArt(v, v.color);
        ctx.restore();
        ctx.save(); ctx.translate(f.x, f.y);
        // xúc tu mọc ra từ bản sao
        ctx.strokeStyle = '#2e1065'; ctx.lineWidth = 3.5; ctx.shadowBlur = 12; ctx.shadowColor = '#7e22ce'; ctx.globalAlpha = fade * k; ctx.lineCap = 'round';
        for (let i = 0; i < 7; i++) { const a = i * 0.9 + T * 0.8; ctx.beginPath(); ctx.moveTo(Math.cos(a) * R * 0.7, Math.sin(a) * R * 0.7); ctx.quadraticCurveTo(Math.cos(a + 0.5) * R * 1.5, Math.sin(a + 0.5) * R * 1.5, Math.cos(a + 0.9) * R * (1.7 + 0.25 * Math.sin(T * 6 + i)), Math.sin(a + 0.9) * R * 1.7); ctx.stroke(); }
        // da thịt đen phủ lên + gân máu
        ctx.globalAlpha = fade * 0.55 * k; ctx.fillStyle = '#1a0b1f'; ctx.shadowBlur = 0;
        ctx.beginPath(); for (let i = 0; i <= 20; i++) { const a = i / 20 * Math.PI * 2, r = R * (1 + 0.12 * Math.sin(a * 5 + T * 6)); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill();
        ctx.globalAlpha = fade * k; ctx.strokeStyle = '#e11d48'; ctx.lineWidth = 1.2; ctx.shadowBlur = 8; ctx.shadowColor = '#e11d48';
        for (let i = 0; i < 8; i++) { const a = i * 2.39; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(Math.cos(a + 0.5) * R * 0.55, Math.sin(a + 0.5) * R * 0.55, Math.cos(a) * R, Math.sin(a) * R); ctx.stroke(); }
        // nhiều mắt đỏ
        for (const [ex, ey, r] of [[-0.42, -0.25, 0.2], [0.4, -0.12, 0.17], [0.02, 0.38, 0.14], [-0.25, 0.55, 0.09], [0.5, 0.45, 0.08]]) {
            ctx.fillStyle = '#fee2e2'; ctx.beginPath(); ctx.arc(ex * R, ey * R, r * R, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.arc(ex * R + Math.sin(T * 3) * r * R * 0.3, ey * R, r * R * 0.6, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(ex * R + Math.sin(T * 3) * r * R * 0.3, ey * R, r * R * 0.14, r * R * 0.5, 0, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    }
    // Chữ
    if (t > 60) {
        const a = Math.min(1, (t - 60) / 20) * fade;
        ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.font = 'bold 20px sans-serif';
        ctx.shadowBlur = 14; ctx.shadowColor = '#a855f7'; ctx.fillStyle = '#f5d0fe';
        const ty = f.y + (f.team === 1 ? 56 : -46);
        ctx.fillText('THÔN PHỆ ĐỒNG HÓA', f.x < 110 ? 110 : f.x > canvas.width - 110 ? canvas.width - 110 : f.x, ty);
        ctx.font = 'bold 10px sans-serif'; ctx.fillStyle = '#f43f5e'; ctx.shadowColor = '#f43f5e';
        ctx.fillText('"Lớp da này... vừa vặn đấy!"', f.x < 110 ? 110 : f.x > canvas.width - 110 ? canvas.width - 110 : f.x, ty + 16);
    }
    ctx.restore();
}
function swFxOver() {
    if (typeof bodyEffects === 'undefined') return;
    for (const e of bodyEffects) if (e instanceof SwFinisher && e.active) e.drawOver();
}
