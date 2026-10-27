// ==========================================
// Hellrider — Hình ảnh: xe độ bánh lớn, ống xả, lửa bốc khi chạy nhanh, Đạn Xích Lửa, kết liễu HIGHWAY TO HELL.
// ==========================================

registerTankArt('hellrider', (p, k) => {
    const t = k.t, fire = hlOnFire(p), nitro = p.hlNitroT > 0;
    if (fire) {   // lửa phía sau
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 3; i++) {
            const fl = 7 + Math.sin(t * 25 + i * 2) * 3 + (nitro ? 6 : 0);
            ctx.fillStyle = i === 1 ? HL_YEL : (i ? HL_ORG : HL_RED);
            ctx.globalAlpha = 0.55;
            ctx.beginPath(); ctx.moveTo(-8 + i * 8, 12); ctx.lineTo(-5 + i * 8, 12 + fl); ctx.lineTo(-2 + i * 8, 12); ctx.fill();
        }
        ctx.restore();
    }
    TA.treads(-14, 5, -12, 14, t, '#1c0b0b', '#7f1d1d');
    ctx.fillStyle = TA.vgrad(-8, 12, '#3b1111', '#12060a');
    TA.rr(-10, -6, 20, 18, 4); ctx.fill();
    ctx.strokeStyle = fire ? HL_ORG : k.team; ctx.lineWidth = 1; TA.rr(-10, -6, 20, 18, 4); ctx.stroke();
    TA.barrel(0, -3 + (p.hlRecoil > 0 ? p.hlRecoil * 0.4 : 0), 11, 3.8, '#e2e8f0', HL_RED);
    // 2 ống xả bên hông
    ctx.fillStyle = '#94a3b8'; ctx.fillRect(-12, 7, 3, 7); ctx.fillRect(9, 7, 3, 7);
    // công-tơ-mét
    const frac = Math.max(0, Math.min(1, (hlSpeedNow(p) - HL_BASE) / 3.5));
    ctx.fillStyle = '#020617'; ctx.beginPath(); ctx.arc(0, 5, 5.4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = fire ? HL_RED : '#64748b'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(0, 5, 5, Math.PI * 0.8, Math.PI * 2.2); ctx.stroke();
    const a = Math.PI * 0.8 + frac * Math.PI * 1.4;
    TA.glow(fire ? HL_ORG : k.team, 5); ctx.strokeStyle = fire ? HL_YEL : k.team; ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.moveTo(0, 5); ctx.lineTo(Math.cos(a) * 4.4, 5 + Math.sin(a) * 4.4); ctx.stroke(); TA.noGlow();
    if (p.hlCd <= 0) { ctx.fillStyle = HL_RED; ctx.beginPath(); ctx.arc(0, -1, 1.2, 0, Math.PI * 2); ctx.fill(); }
    if (k.evo1) { ctx.strokeStyle = HL_RED; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(0, 5, 7.5, t * 3, t * 3 + Math.PI * 1.2); ctx.stroke(); }
    if (k.evo2) { ctx.strokeStyle = HL_YEL; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(0, 5, 7.5, -t * 3, -t * 3 + Math.PI * 1.2); ctx.stroke(); }
});

Object.assign(BulletHooks.registry.hellrider, {
    draw(b) {
        const cx = b.x + b.w / 2, cy = b.y + b.h / 2, r = Math.max(3, b.w / 2), dir = b.vy < 0 ? -1 : 1;
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const len = 14 + r * 3;
        const g = ctx.createLinearGradient(cx, cy - dir * len, cx, cy);
        g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, b.hlChain || b.hlBall ? HL_RED : HL_ORG);
        ctx.strokeStyle = g; ctx.lineWidth = r * 1.5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(cx, cy - dir * len); ctx.lineTo(cx, cy); ctx.stroke();
        ctx.shadowBlur = 14; ctx.shadowColor = HL_ORG;
        ctx.fillStyle = HL_YEL; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx, cy, r * 0.45, 0, Math.PI * 2); ctx.fill();
        if (b.hlChain) {   // mắt xích
            ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1.2;
            for (let i = 1; i <= 3; i++) { ctx.beginPath(); ctx.ellipse(cx, cy - dir * (r + i * 6), 2.2, 3.2, 0, 0, Math.PI * 2); ctx.stroke(); }
        }
        ctx.restore();
    },
});

// ---------- Kết liễu: HIGHWAY TO HELL ----------
function hlDrawFinisher(f) {
    const t = f.t, W = canvas.width, H = canvas.height;
    ctx.save();
    const dark = t < 10 ? t / 10 : (t < 135 ? 1 : Math.max(0, 1 - (t - 135) / 30));
    ctx.fillStyle = `rgba(20, 4, 4, ${0.6 * dark})`; ctx.fillRect(-W, -H, W * 3, H * 3);
    ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    // công-tơ-mét góc dưới: kim quay kịch, vỡ kính
    const dx = 52, dy = H - 52, dial = Math.min(1, t / 40);
    ctx.globalAlpha = Math.min(1, t / 8) * (t > HLF_HIT + 40 ? Math.max(0, 1 - (t - HLF_HIT - 40) / 25) : 1);
    ctx.strokeStyle = HL_ORG; ctx.shadowBlur = 14; ctx.shadowColor = HL_ORG; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(dx, dy, 34, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 1.5; ctx.strokeStyle = HL_YEL;
    for (let i = 0; i <= 10; i++) { const a = Math.PI * 0.8 + i / 10 * Math.PI * 1.4; ctx.beginPath(); ctx.moveTo(dx + Math.cos(a) * 27, dy + Math.sin(a) * 27); ctx.lineTo(dx + Math.cos(a) * 32, dy + Math.sin(a) * 32); ctx.stroke(); }
    const na = Math.PI * 0.8 + (dial + (t >= HLF_HIT ? 0 : Math.sin(t * 2) * 0.03)) * Math.PI * 1.4;
    ctx.strokeStyle = HL_RED; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(dx, dy); ctx.lineTo(dx + Math.cos(na) * 28, dy + Math.sin(na) * 28); ctx.stroke();
    if (t >= HLF_HIT) {
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.2;
        for (let i = 0; i < 7; i++) { const a = i * 0.9 + 0.3, r = 36 * Math.min(1, (t - HLF_HIT) / 6); ctx.beginPath(); ctx.moveTo(dx, dy); ctx.lineTo(dx + Math.cos(a) * r, dy + Math.sin(a) * r * 0.95); ctx.stroke(); }
    }
    ctx.globalAlpha = 1;
    // xe bốc đầu lao qua lại ở hàng địch + vệt bánh cháy
    const lane = f.y, passes = [[0, 44, 1], [34, 78, -1], [62, 110, 1]];
    for (const [s, e, d] of passes) {
        if (t < s || t > e + 20) continue;
        const k = Math.min(1, (t - s) / (e - s)), x = d > 0 ? -30 + (W + 60) * k : W + 30 - (W + 60) * k;
        const fade = t > e ? Math.max(0, 1 - (t - e) / 20) : 1;
        ctx.globalAlpha = 0.8 * fade; ctx.shadowBlur = 12; ctx.shadowColor = HL_ORG; ctx.strokeStyle = HL_ORG; ctx.lineWidth = 4;
        for (const oy of [-8, 8]) { ctx.beginPath(); ctx.moveTo(d > 0 ? -30 : W + 30, lane + oy); ctx.lineTo(x, lane + oy); ctx.stroke(); }
        ctx.globalAlpha = fade; ctx.save(); ctx.translate(x, lane); ctx.rotate(-d * 0.45);
        ctx.fillStyle = '#7f1d1d'; ctx.fillRect(-16, -8, 32, 16); ctx.fillStyle = HL_YEL; ctx.fillRect(d > 0 ? 8 : -14, -5, 6, 10);
        ctx.fillStyle = '#020617'; ctx.beginPath(); ctx.arc(-9, 9, 6, 0, 7); ctx.arc(9, 9, 6, 0, 7); ctx.fill();
        ctx.strokeStyle = HL_ORG; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(-9, 9, 6, 0, 7); ctx.arc(9, 9, 6, 0, 7); ctx.stroke();
        ctx.restore();
    }
    // bão vòng lửa quanh mục tiêu
    if (t >= 20) {
        const k = Math.min(1, (t - 20) / 90), fade = t > 135 ? Math.max(0, 1 - (t - 135) / 30) : 1;
        ctx.globalAlpha = fade; ctx.shadowBlur = 16; ctx.shadowColor = HL_RED;
        for (let i = 0; i < 4; i++) {
            const r = (18 + i * 22) * (0.5 + k), ph = t * (0.18 + i * 0.05);
            ctx.strokeStyle = i % 2 ? HL_ORG : HL_RED; ctx.lineWidth = 5 - i;
            ctx.beginPath(); ctx.ellipse(f.x, f.y, r, r * 0.6, ph, 0, Math.PI * 2); ctx.stroke();
        }
        if (t >= HLF_HIT) for (let i = 0; i < 16; i++) {
            const a = i / 16 * Math.PI * 2 + t * 0.05, r = 20 + 150 * Math.min(1, (t - HLF_HIT) / 28);
            ctx.fillStyle = i % 2 ? HL_YEL : '#fff'; ctx.beginPath(); ctx.arc(f.x + Math.cos(a) * r, f.y + Math.sin(a) * r, 2.5, 0, Math.PI * 2); ctx.fill();
        }
    }
    ctx.restore();
    if (t >= HLF_HIT + 4 && t < HLF_DUR) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, (t - HLF_HIT - 4) / 8) * (t > 145 ? Math.max(0, 1 - (t - 145) / 25) : 1);
        ctx.font = "900 22px 'Orbitron', Arial"; ctx.textAlign = 'center';
        ctx.shadowBlur = 18; ctx.shadowColor = HL_RED; ctx.fillStyle = '#fff7ed';
        const ty = Math.max(60, Math.min(H - 60, f.y + (f.team === 1 ? 92 : -84)));
        const sc = 1 + Math.max(0, 1 - (t - HLF_HIT - 4) / 8) * 0.5;
        ctx.translate(W / 2, ty); ctx.scale(sc, sc);
        if (typeof drawWorldText === 'function') drawWorldText(ctx, 'HIGHWAY TO HELL!', 0, 0); else ctx.fillText('HIGHWAY TO HELL!', 0, 0);
        ctx.restore();
    }
}
