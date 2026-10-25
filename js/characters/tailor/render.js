// ==========================================
// Thợ May (tailor) — Hình ảnh: xe máy may (cuộn chỉ bạc xoay, kim khâu làm nòng, thước dây),
// Kim Khâu, Cọc Chỉ, sợi chỉ bạc phát sáng (tia sáng chạy dọc dây, khi giữ nút thì chạy nhanh & sáng hơn),
// dây Mũi Khâu, vòng Trói Chân, Lĩnh Vực Cắt May, Búp Bê Trắng (sứ, vầng hào quang) & Búp Bê Đen (voodoo, ghim), Giáp Ảo, HUD, kết liễu "ĐƯỜNG KIM MŨI CHỈ".
// Chỉ đọc state -> an toàn online.
// ==========================================

function tlNow() { return Date.now() / 1000; }

// ---------- Xe Thợ May ----------
registerTankArt('tailor', (p, k) => {
    const t = k.t, rec = (p.tlRecoil || 0) / 8, hold = Math.min(1, (p.tlHold || 0) / TL_HOLD);
    TA.treads(-15, 4.6, -11, 13, t, '#0f172a', '#334155');
    // thân bo tròn xanh đêm
    ctx.fillStyle = TA.metal(-10.5, 10.5, '#1e1b4b', '#475569');
    TA.rr(-10.5, -9, 21, 21, 5); ctx.fill();
    ctx.strokeStyle = k.team; ctx.lineWidth = 1; TA.glow(k.teamGlow, 6); ctx.stroke(); TA.noGlow();
    // thước dây vàng phía sau
    ctx.fillStyle = TL_GOLD; ctx.fillRect(-9, 8.5, 18, 2.6);
    ctx.fillStyle = '#78350f'; for (let i = -8; i <= 8; i += 2) ctx.fillRect(i, 8.5, 0.5, i % 4 === 0 ? 1.8 : 1.1);
    // đường khâu viền thân
    ctx.strokeStyle = 'rgba(224, 247, 250, 0.7)'; ctx.lineWidth = 0.7; ctx.setLineDash([1.6, 1.4]);
    TA.rr(-8.6, -7.2, 17.2, 14.4, 3.5); ctx.stroke(); ctx.setLineDash([]);
    // kim khâu (nòng)
    const ny = -9 + rec * 2.5;
    TA.glow(TL_CYAN, 6 + hold * 10);
    const ng = ctx.createLinearGradient(-1.2, 0, 1.2, 0); ng.addColorStop(0, '#94a3b8'); ng.addColorStop(0.5, '#ffffff'); ng.addColorStop(1, '#94a3b8');
    ctx.fillStyle = ng;
    ctx.beginPath(); ctx.moveTo(-1.3, ny); ctx.lineTo(1.3, ny); ctx.lineTo(0.5, ny - 9); ctx.lineTo(0, ny - 11); ctx.lineTo(-0.5, ny - 9); ctx.closePath(); ctx.fill();
    TA.noGlow();
    ctx.fillStyle = '#1e1b4b'; ctx.beginPath(); ctx.ellipse(0, ny - 1.6, 0.45, 1.1, 0, 0, Math.PI * 2); ctx.fill(); // lỗ kim
    // chân vịt máy may
    ctx.fillStyle = '#cbd5e1'; ctx.fillRect(-4, -10.5, 8, 2); ctx.fillStyle = TL_CYAN; ctx.fillRect(-4, -10.5, 8, 0.6);
    // cuộn chỉ xoay (giữa)
    ctx.save(); ctx.translate(0, 1);
    ctx.fillStyle = k.evo1 ? '#b45309' : '#64748b'; TA.rr(-6.5, -6.5, 13, 2.2, 1); ctx.fill(); TA.rr(-6.5, 4.3, 13, 2.2, 1); ctx.fill();
    const sg = ctx.createLinearGradient(-5, 0, 5, 0);
    sg.addColorStop(0, '#94a3b8'); sg.addColorStop(0.5, k.evo1 ? '#fef3c7' : '#f8fafc'); sg.addColorStop(1, '#94a3b8');
    ctx.fillStyle = sg; ctx.fillRect(-5, -4.3, 10, 8.6);
    ctx.strokeStyle = k.evo1 ? 'rgba(180, 83, 9, 0.6)' : 'rgba(100, 116, 139, 0.6)'; ctx.lineWidth = 0.5;
    const off = (t * (6 + hold * 20)) % 1.6;
    for (let y = -4.3 + off; y < 4.3; y += 1.6) { ctx.beginPath(); ctx.moveTo(-5, y); ctx.lineTo(5, y + 0.5); ctx.stroke(); }
    ctx.restore();
    // sợi chỉ từ cuộn lên kim
    ctx.strokeStyle = k.evo1 ? TL_GOLD : TL_SILVER; ctx.lineWidth = 0.6; TA.glow(TL_CYAN, 4);
    ctx.beginPath(); ctx.moveTo(4.5, -2); ctx.quadraticCurveTo(7, -8, 0.4, ny - 1.6); ctx.stroke(); TA.noGlow();
    if (k.evo2) { // búp bê nhỏ đeo bên hông
        ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.arc(-8.2, 3, 1.8, 0, Math.PI * 2); ctx.fill();
        ctx.fillRect(-9.2, 4.5, 2, 3);
    }
    if (k.full) { // vương miện ghim
        TA.glow(TL_CYAN, 8);
        for (let i = 0; i < 5; i++) {
            const a = -Math.PI / 2 + (i - 2) * 0.42, r0 = 11, r1 = 15;
            ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 0.8;
            ctx.beginPath(); ctx.moveTo(Math.cos(a) * r0, 2 + Math.sin(a) * r0); ctx.lineTo(Math.cos(a) * r1, 2 + Math.sin(a) * r1); ctx.stroke();
            ctx.fillStyle = i % 2 ? TL_PINK : TL_GOLD; ctx.beginPath(); ctx.arc(Math.cos(a) * r1, 2 + Math.sin(a) * r1, 1.1, 0, Math.PI * 2); ctx.fill();
        }
        TA.noGlow();
    }
});

// ---------- Kim Khâu (đạn) ----------
function tlDrawNeedle(b, doll) {
    const x = b.x + b.w / 2, y = b.y + b.h / 2, an = Math.atan2(b.vy || 0, b.vx || 0);
    ctx.save(); ctx.translate(x, y); ctx.rotate(an);
    // đuôi chỉ
    ctx.strokeStyle = doll ? 'rgba(244,114,182,0.6)' : 'rgba(224,247,250,0.55)'; ctx.lineWidth = 0.9;
    ctx.beginPath(); ctx.moveTo(-6, 0); ctx.quadraticCurveTo(-14, Math.sin(tlNow() * 30) * 3, -22, 0); ctx.stroke();
    ctx.shadowBlur = 10; ctx.shadowColor = doll ? TL_PINK : TL_CYAN;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.moveTo(-7, -1.3); ctx.lineTo(5, -0.6); ctx.lineTo(9, 0); ctx.lineTo(5, 0.6); ctx.lineTo(-7, 1.3); ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0; ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.ellipse(-5, 0, 1.3, 0.45, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}

// ---------- Cọc Chỉ / kim bay về ----------
function tlDrawPin(q) {
    const t = tlNow() + q.seed;
    ctx.save();
    if (q.mode === 'pin') {
        const blink = q.life < 90 && Math.floor(q.life / 6) % 2 === 0 ? 0.35 : 1;
        const pop = Math.min(1, q.t / 8);
        ctx.globalAlpha = blink;
        ctx.strokeStyle = 'rgba(103, 232, 249, 0.5)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(q.x, q.y, 6 + Math.sin(t * 4) * 1.2, 0, Math.PI * 2); ctx.stroke();
        // vòng thời gian
        ctx.strokeStyle = 'rgba(224,247,250,0.85)'; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.arc(q.x, q.y, 8.5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (q.life / q.maxLife)); ctx.stroke();
        // thân ghim
        ctx.shadowBlur = 10; ctx.shadowColor = TL_CYAN;
        ctx.strokeStyle = '#f8fafc'; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(q.x + 3 * pop, q.y - 7 * pop); ctx.lineTo(q.x, q.y + 2); ctx.stroke();
        ctx.fillStyle = q.uid % 2 ? TL_PINK : TL_GOLD;
        ctx.beginPath(); ctx.arc(q.x + 3.2 * pop, q.y - 7.4 * pop, 2.6, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.arc(q.x + 2.5 * pop, q.y - 8 * pop, 0.8, 0, Math.PI * 2); ctx.fill();
    } else {
        const c = q.mode === 'back' ? TL_CYAN : TL_SILVER;
        ctx.translate(q.x, q.y); ctx.rotate(q.ang);
        ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createLinearGradient(-30, 0, 0, 0); g.addColorStop(0, 'rgba(103,232,249,0)'); g.addColorStop(1, 'rgba(224,247,250,0.85)');
        ctx.strokeStyle = g; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-30, 0); ctx.lineTo(0, 0); ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
        ctx.shadowBlur = 12; ctx.shadowColor = c; ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.moveTo(-8, -1.6); ctx.lineTo(6, -0.6); ctx.lineTo(10, 0); ctx.lineTo(6, 0.6); ctx.lineTo(-8, 1.6); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
}

// ---------- Búp Bê Kép ----------
function tlDollBar(d, col) {
    const x = d.x + d.w / 2, w = 22, k = Math.max(0, Math.min(1, d.hp / d.maxHp));
    ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(x - w / 2 - 1, d.y - 11, w + 2, 4);
    ctx.fillStyle = col; ctx.shadowBlur = 6; ctx.shadowColor = col; ctx.fillRect(x - w / 2, d.y - 10, w * k, 2);
    ctx.shadowBlur = 0;
}
// Búp Bê Trắng "Hộ Mệnh": búp bê sứ trắng, vầng hào quang vàng, váy ren
function tlDrawWhite(d) {
    const x = d.x + d.w / 2, y = d.y + d.h / 2, t = tlNow(), bob = Math.sin(t * 2.2) * 1.2;
    ctx.save(); ctx.translate(x, y + bob); ctx.scale(1.3, 1.3);
    if (d.hitFx > 0) ctx.translate((Math.random() - 0.5) * 2.5, 0);
    // quầng sáng nền
    const g = ctx.createRadialGradient(0, 0, 2, 0, 0, 20);
    g.addColorStop(0, d.healFx > 0 ? 'rgba(187,247,208,0.45)' : 'rgba(253,230,138,0.18)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.fill();
    // vầng hào quang
    ctx.strokeStyle = TL_GOLD; ctx.lineWidth = 1.4; ctx.shadowBlur = 10; ctx.shadowColor = TL_GOLD;
    ctx.beginPath(); ctx.ellipse(0, -13.5, 5.5, 1.8, 0, 0, Math.PI * 2); ctx.stroke();
    // váy
    ctx.shadowColor = d.hitFx > 0 ? '#fb7185' : TL_GOLD; ctx.shadowBlur = d.hitFx > 0 ? 12 : 5;
    ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 0.6;
    ctx.fillStyle = d.hitFx > 0 ? '#fecdd3' : '#f8fafc';
    ctx.beginPath(); ctx.moveTo(-3.5, -1); ctx.lineTo(3.5, -1); ctx.lineTo(7, 9); ctx.quadraticCurveTo(0, 11.5, -7, 9); ctx.closePath(); ctx.fill(); ctx.stroke();
    // tay
    ctx.fillRect(-6.5, 0, 2.6, 4.5); ctx.fillRect(3.9, 0, 2.6, 4.5);
    // đầu sứ
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0, -6, 5, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0; ctx.stroke();
    // tóc vàng nhạt
    ctx.fillStyle = '#fde68a'; ctx.beginPath(); ctx.arc(0, -7.2, 5.2, Math.PI * 1.05, Math.PI * 1.95); ctx.fill();
    // mắt & má
    ctx.fillStyle = '#1e293b'; ctx.beginPath(); ctx.arc(-1.8, -5.6, 0.7, 0, Math.PI * 2); ctx.arc(1.8, -5.6, 0.7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(244,114,182,0.6)'; ctx.beginPath(); ctx.arc(-2.9, -4, 0.9, 0, Math.PI * 2); ctx.arc(2.9, -4, 0.9, 0, Math.PI * 2); ctx.fill();
    // ren váy (đường khâu)
    ctx.strokeStyle = 'rgba(103,232,249,0.85)'; ctx.lineWidth = 0.6; ctx.setLineDash([1.2, 1.2]);
    ctx.beginPath(); ctx.moveTo(-6.3, 8); ctx.quadraticCurveTo(0, 10.3, 6.3, 8); ctx.moveTo(0, -0.5); ctx.lineTo(0, 9.5); ctx.stroke(); ctx.setLineDash([]);
    // Trạm Chỉ: cuộn chỉ cắm ngực
    if (d.relay) {
        ctx.fillStyle = TL_CYAN; ctx.shadowBlur = 8; ctx.shadowColor = TL_CYAN;
        ctx.beginPath(); ctx.arc(0, 3, 1.8 + (d.linkFx > 0 ? 0.8 : 0), 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(-4, -1.5); ctx.lineTo(3, 5.5); ctx.stroke();
        ctx.shadowBlur = 0;
    }
    ctx.restore();
    tlDollBar(d, d.healFx > 0 ? '#86efac' : '#ffffff');
}
// Búp Bê Đen "Nguyền Rủa": búp bê voodoo vải đen, mắt cúc đỏ, ghim cắm khắp người
function tlDrawBlack(d) {
    const x = d.x + d.w / 2, y = d.y + d.h / 2, t = tlNow(), sw = Math.sin(t * 3 + d.did) * 0.1;
    ctx.save(); ctx.translate(x, y); ctx.rotate(sw); ctx.scale(1.3, 1.3);
    if (d.hitFx > 0) ctx.translate((Math.random() - 0.5) * 2.5, 0);
    // khói tím
    const g = ctx.createRadialGradient(0, 0, 2, 0, 0, 20 + (d.stunFx > 0 ? 8 : 0));
    g.addColorStop(0, d.stunFx > 0 ? 'rgba(232,121,249,0.55)' : 'rgba(126,34,206,0.38)'); g.addColorStop(1, 'rgba(88,28,135,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 28, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 10; ctx.shadowColor = '#a855f7';
    ctx.fillStyle = d.hitFx > 0 ? '#4c1d95' : '#18181b';
    // thân & tay chân vải
    ctx.beginPath(); ctx.arc(0, -6, 5.5, 0, Math.PI * 2); ctx.fill();
    TA.rr(-4.5, -1, 9, 9, 2.5); ctx.fill();
    ctx.fillRect(-9, 0.5, 4.5, 2.6); ctx.fillRect(4.5, 0.5, 4.5, 2.6); ctx.fillRect(-4, 7.5, 2.8, 4); ctx.fillRect(1.2, 7.5, 2.8, 4);
    ctx.shadowBlur = 0;
    // viền khâu tím
    ctx.strokeStyle = 'rgba(192,132,252,0.9)'; ctx.lineWidth = 0.6; ctx.setLineDash([1.3, 1.1]);
    ctx.beginPath(); ctx.arc(0, -6, 5.5, 0, Math.PI * 2); ctx.stroke();
    TA.rr(-4.5, -1, 9, 9, 2.5); ctx.stroke(); ctx.setLineDash([]);
    // mắt cúc X đỏ + miệng khâu
    ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1; ctx.shadowBlur = 6; ctx.shadowColor = '#ef4444';
    [[-2.2, -6.5], [2.2, -6.5]].forEach(([ex, ey]) => { ctx.beginPath(); ctx.moveTo(ex - 1.2, ey - 1.2); ctx.lineTo(ex + 1.2, ey + 1.2); ctx.moveTo(ex + 1.2, ey - 1.2); ctx.lineTo(ex - 1.2, ey + 1.2); ctx.stroke(); });
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#d4d4d8'; ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(-2.5, -3.2); ctx.lineTo(2.5, -3.2); for (let i = -2; i <= 2; i += 1.25) { ctx.moveTo(i, -4); ctx.lineTo(i, -2.4); } ctx.stroke();
    // ghim cắm (đầu tròn màu)
    const pins = [[-4, -9, -0.6, TL_PINK], [4.5, -8, 0.5, TL_GOLD], [-2, 3, -0.9, TL_CYAN], [3, 5, 0.8, '#ef4444'], [6, 1, 1.3, TL_PINK]];
    for (const [px, py, a, c] of pins) {
        const ex = px + Math.cos(a - Math.PI / 2) * 5, ey = py + Math.sin(a - Math.PI / 2) * 5;
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.fillStyle = c; ctx.shadowBlur = 5; ctx.shadowColor = c; ctx.beginPath(); ctx.arc(ex, ey, 1.2, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    }
    ctx.restore();
    tlDollBar(d, '#c084fc');
}

// ---------- Mạng chỉ, Mũi Khâu, Trói Chân, Lĩnh Vực ----------
function tlDrawThreadLine(ax, ay, bx, by, k, hot, gold) {
    ctx.strokeStyle = hot ? 'rgba(254, 205, 211, 0.95)' : (gold ? 'rgba(253, 230, 138, 0.9)' : 'rgba(224, 247, 250, 0.85)');
    ctx.lineWidth = 1.1 + k * 1.2; ctx.shadowBlur = 8 + k * 8; ctx.shadowColor = hot ? '#fb7185' : TL_CYAN;
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
    ctx.shadowBlur = 0;
    // tia sáng chạy dọc dây (về phía Thợ May khi giữ nút)
    const L = Math.hypot(bx - ax, by - ay); if (L < 8) return;
    const n = Math.max(1, Math.floor(L / 90)), sp = 0.4 + k * 2.6;
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < n; i++) {
        const f = ((tlNow() * sp + i / n) % 1);
        const px = bx + (ax - bx) * f, py = by + (ay - by) * f;
        ctx.globalAlpha = 0.5 + 0.5 * k; ctx.beginPath(); ctx.arc(px, py, 1.4 + k, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
}
function tlDrawNet(p) {
    const k = Math.min(1, (p.tlHold || 0) / TL_HOLD) || ((p.tlYankFx || 0) / 24), e = tlEnemy(p);
    const gold = tlE1(p);
    ctx.save();
    // Lĩnh Vực Cắt May
    if (p.tlDom && p.tlDom.length >= 3) {
        const P = p.tlDom, pulse = 0.5 + 0.5 * Math.sin(tlNow() * 4);
        ctx.beginPath(); P.forEach((q, i) => i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)); ctx.closePath();
        ctx.fillStyle = `rgba(103, 232, 249, ${0.08 + 0.05 * pulse})`; ctx.fill();
        ctx.save(); ctx.clip();
        ctx.strokeStyle = 'rgba(224,247,250,0.18)'; ctx.lineWidth = 1;
        for (let i = -canvas.height; i < canvas.width + canvas.height; i += 12) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i - canvas.height, canvas.height); ctx.moveTo(i - canvas.height, 0); ctx.lineTo(i, canvas.height); ctx.stroke(); }
        ctx.restore();
        ctx.strokeStyle = 'rgba(103,232,249,0.9)'; ctx.lineWidth = 1.5; ctx.setLineDash([5, 3]); ctx.lineDashOffset = -tlNow() * 20;
        ctx.beginPath(); P.forEach((q, i) => i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)); ctx.closePath(); ctx.stroke();
        ctx.setLineDash([]);
    }
    const hot = e && e.tlOnThread;
    for (const s of tlThreads(p)) tlDrawThreadLine(s[0], s[1], s[2], s[3], k, hot && tlSegRect(s[0], s[1], s[2], s[3], e, 1), gold);
    // Mũi Khâu: dây hồng nối địch -> cọc neo
    if (tlAlive(e) && e.tlStitch > 0) {
        const a = tlPins(p).find(q => q.uid === e.tlAnchor), ex = e.x + e.w / 2, ey = e.y + e.h / 2;
        if (a) {
            const far = Math.abs(ex - a.x) / TL_LEASH;
            ctx.strokeStyle = e.tlYankT > 0 ? '#ffffff' : `rgba(244,114,182,${0.6 + 0.4 * Math.min(1, far)})`;
            ctx.lineWidth = 1.4 + (e.tlYankT > 0 ? 1.5 : 0); ctx.shadowBlur = 10; ctx.shadowColor = TL_PINK;
            ctx.setLineDash([4, 3]); ctx.lineDashOffset = tlNow() * 30;
            ctx.beginPath(); ctx.moveTo(ex, ey); ctx.quadraticCurveTo((ex + a.x) / 2, (ey + a.y) / 2 + 16 * (1 - Math.min(1, far)), a.x, a.y); ctx.stroke();
            ctx.setLineDash([]); ctx.shadowBlur = 0;
        }
        // dấu khâu X trên xe địch
        ctx.strokeStyle = TL_PINK; ctx.lineWidth = 1.6;
        for (let i = -1; i <= 1; i++) { const sx = ex + i * 7; ctx.beginPath(); ctx.moveTo(sx - 2.5, ey - 2.5); ctx.lineTo(sx + 2.5, ey + 2.5); ctx.moveTo(sx + 2.5, ey - 2.5); ctx.lineTo(sx - 2.5, ey + 2.5); ctx.stroke(); }
    }
    // Trói Chân / Khâu Chéo
    if (tlAlive(e) && (e.tlRoot > 0 || e.tlCrossFx > 0)) {
        const ex = e.x + e.w / 2, ey = e.y + e.h / 2, r = e.w * 0.75;
        ctx.strokeStyle = TL_SILVER; ctx.lineWidth = 1.3; ctx.shadowBlur = 10; ctx.shadowColor = TL_CYAN;
        const N = 8, rot = tlNow() * 0.8;
        ctx.beginPath();
        for (let i = 0; i < N; i++) { const a = rot + i * Math.PI * 2 / N, b2 = rot + (i + 3) * Math.PI * 2 / N; ctx.moveTo(ex + Math.cos(a) * r, ey + Math.sin(a) * r * 0.7); ctx.lineTo(ex + Math.cos(b2) * r, ey + Math.sin(b2) * r * 0.7); }
        ctx.stroke(); ctx.shadowBlur = 0;
    }
    // Giáp Ảo
    if (p.tlVS > 0) {
        const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
        ctx.strokeStyle = `rgba(255,255,255,${0.45 + (p.tlVSFx > 0 ? 0.4 : 0)})`; ctx.lineWidth = 1 + p.tlVS * 0.6;
        ctx.shadowBlur = 10; ctx.shadowColor = '#ffffff';
        ctx.beginPath(); ctx.ellipse(cx, cy, p.w * 0.78, p.h * 0.72, 0, 0, Math.PI * 2); ctx.stroke(); ctx.shadowBlur = 0;
    }
    // Dây hồn: Thợ May -> Búp Bê Trắng; Búp Bê Đen -> địch khi nguyền rủa
    const w = tlWhite(p), bk = tlBlack(p);
    if (w && p.hp > 0) {
        const wx = w.x + w.w / 2, wy = w.y + w.h / 2, cx = p.x + p.w / 2, cy = p.y + p.h / 2;
        ctx.strokeStyle = `rgba(255,255,255,${w.hitFx > 0 ? 0.85 : 0.28})`; ctx.lineWidth = w.hitFx > 0 ? 1.8 : 0.9;
        ctx.shadowBlur = 6; ctx.shadowColor = '#ffffff'; ctx.setLineDash([2, 5]); ctx.lineDashOffset = -tlNow() * 18;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.quadraticCurveTo((cx + wx) / 2 + 18, (cy + wy) / 2, wx, wy); ctx.stroke();
        ctx.setLineDash([]); ctx.shadowBlur = 0;
    }
    if (bk && tlAlive(e) && (p.tlCurse || e.tlCurseFx > 0)) {
        const bx = bk.x + bk.w / 2, by = bk.y + bk.h / 2, ex = e.x + e.w / 2, ey = e.y + e.h / 2, pl = 0.5 + 0.5 * Math.sin(tlNow() * 8);
        ctx.strokeStyle = `rgba(192,38,211,${0.45 + 0.4 * pl})`; ctx.lineWidth = 1.4; ctx.shadowBlur = 10; ctx.shadowColor = '#a855f7';
        ctx.setLineDash([5, 3]); ctx.lineDashOffset = tlNow() * 25;
        ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(ex, ey); ctx.stroke(); ctx.setLineDash([]);
        ctx.beginPath(); ctx.ellipse(ex, ey, e.w * 0.85, e.h * 0.8, tlNow(), 0, Math.PI * 2); ctx.stroke(); ctx.shadowBlur = 0;
        if (p.tlCurse) {
            ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#e879f9';
            ctx.fillText('+' + Math.round((tlAmp(p) - 1) * 100) + '%', bx, bk.y + bk.h + 10);
        }
    }
    ctx.restore();
}

CharHooks.register('tailor', Object.assign(CharHooks.registry.tailor || {}, {
    draw() {
        tlDrawNet(this);
        if (this.tlHold > 3 && !(this.tlCd > 0)) {
            const cx = this.x + this.w / 2, cy = this.y + this.h / 2, k = Math.min(1, this.tlHold / TL_HOLD);
            ctx.save(); ctx.strokeStyle = TL_CYAN; ctx.lineWidth = 2; ctx.shadowBlur = 8; ctx.shadowColor = TL_CYAN;
            ctx.beginPath(); ctx.arc(cx, cy, this.w * 0.9, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); ctx.stroke(); ctx.restore();
        }
    },
    drawUI() {
        // hàng chấm Cọc Chỉ (đang có / tối đa)
        if (this.hp <= 0 || typeof hudRowY !== 'function') return;
        const n = tlPins(this, true).length, m = tlMaxPins(this), y = hudRowY(this, 'extra') + (this.id === 1 ? 2 : -2), cx = this.x + this.w / 2;
        ctx.save();
        for (let i = 0; i < m; i++) {
            ctx.fillStyle = i < n ? (i % 2 ? TL_PINK : TL_GOLD) : 'rgba(224,247,250,0.2)';
            ctx.beginPath(); ctx.arc(cx + (i - (m - 1) / 2) * 6, y, 1.9, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    },
}));

// ---------- Kết liễu "ĐƯỜNG KIM MŨI CHỈ" ----------
function tlDrawFinisherOver(f) {
    const t = f.t, W = canvas.width, H = canvas.height;
    const fade = t > 108 ? Math.max(0, 1 - (t - 108) / 22) : 1;
    ctx.save();
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = `rgba(2, 6, 23, ${0.7 * Math.min(1, t / 10) * fade})`; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
    ctx.globalAlpha = fade;
    // 1) hàng chục sợi chỉ đan chéo khoá màn hình (bắn vào từ mép), 2) kéo căng dồn về mục tiêu
    const N = 26, R = Math.hypot(W, H);
    const tight = t >= 40 ? Math.min(1, (t - 40) / 22) : 0;
    ctx.lineCap = 'round';
    for (let i = 0; i < N; i++) {
        const delay = i * 1.2, k = Math.min(1, Math.max(0, (t - delay) / 14));
        if (k <= 0) continue;
        const an = f.seed + i * 2.399, off = ((i * 37) % 120 - 60) * (1 - tight * 0.95);
        const nx = -Math.sin(an), ny = Math.cos(an);
        const cx = f.x + nx * off, cy = f.y + ny * off;
        const ax = cx - Math.cos(an) * R, ay = cy - Math.sin(an) * R;
        const bx = ax + Math.cos(an) * R * 2 * k, by = ay + Math.sin(an) * R * 2 * k;
        ctx.strokeStyle = i % 5 === 0 ? 'rgba(244,114,182,0.85)' : 'rgba(224,247,250,0.8)';
        ctx.lineWidth = 0.8 + tight * 1.2; ctx.shadowBlur = 8 + tight * 10; ctx.shadowColor = i % 5 === 0 ? TL_PINK : TL_CYAN;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
    }
    ctx.shadowBlur = 0;
    // 3) cắt đôi mục tiêu
    const cut = t >= 66 ? Math.min(1, (t - 66) / 18) : 0;
    const ca = f.seed * 0.7, cnx = -Math.sin(ca), cny = Math.cos(ca);
    for (let s = -1; s <= 1; s += 2) {
        ctx.save();
        ctx.translate(f.x + cnx * s * cut * 26, f.y + cny * s * cut * 26 + cut * cut * 20);
        ctx.rotate(s * cut * 0.35);
        // nửa xe (hình chữ nhật bị cắt theo đường chéo)
        ctx.rotate(ca);
        ctx.beginPath(); ctx.rect(-f.vw / 2 - 2, s < 0 ? -f.vh / 2 - 2 : 0, f.vw + 4, f.vh / 2 + 2); ctx.clip();
        ctx.rotate(-ca);
        ctx.fillStyle = '#1e293b'; TA.rr(-f.vw / 2, -f.vh / 2, f.vw, f.vh, 4); ctx.fill();
        ctx.strokeStyle = 'rgba(224,247,250,0.6)'; ctx.lineWidth = 1; ctx.stroke();
        ctx.restore();
    }
    if (t >= 64 && t < 100) {
        const k = (t - 64) / 36;
        ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(ca);
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = `rgba(255,255,255,${1 - k})`; ctx.lineWidth = 4 * (1 - k) + 1; ctx.shadowBlur = 20; ctx.shadowColor = TL_CYAN;
        ctx.beginPath(); ctx.moveTo(-R * Math.min(1, k * 4), 0); ctx.lineTo(R * Math.min(1, k * 4), 0); ctx.stroke();
        ctx.fillStyle = `rgba(103,232,249,${0.5 * (1 - k)})`; ctx.beginPath(); ctx.ellipse(0, 0, 30 + k * 110, 6 + k * 18, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }
    ctx.restore();
    // chữ
    if (t >= 18) {
        const a = Math.min(1, (t - 18) / 8) * fade;
        const cxv = fatalCinematic && fatalCinematic.active ? fatalCinematic.victimX : W / 2;
        const cyv = fatalCinematic && fatalCinematic.active ? fatalCinematic.victimY : H / 2;
        ctx.save();
        ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.translate(cxv, cyv + (f.team === 1 ? 130 : -130));
        if (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest') ctx.rotate(Math.PI);
        const sc = t < 26 ? 1.4 - (t - 18) / 8 * 0.4 : 1; ctx.scale(sc, sc);
        ctx.font = "900 24px 'Orbitron', Arial"; ctx.lineWidth = 5; ctx.strokeStyle = '#000';
        ctx.shadowBlur = 18; ctx.shadowColor = TL_CYAN; ctx.fillStyle = TL_SILVER;
        ctx.strokeText('ĐƯỜNG KIM', 0, -15); ctx.fillText('ĐƯỜNG KIM', 0, -15);
        ctx.fillStyle = TL_PINK; ctx.shadowColor = TL_PINK;
        ctx.strokeText('MŨI CHỈ', 0, 15); ctx.fillText('MŨI CHỈ', 0, 15);
        ctx.restore();
    }
}
function tlFxOver() {
    if (typeof bodyEffects === 'undefined') return;
    for (const e of bodyEffects) if (e instanceof TlFinisher && e.active) e.drawOver();
}

function tlRegisterHUD() {
    if (typeof registerEmpowerHUD !== 'function') return;
    registerEmpowerHUD('tailor', p => {
        const n = tlPins(p).length, cd = tlCdMax(p);
        if (p.tlCd > 0) return { pct: 1 - p.tlCd / cd, ready: false, color: '#64748b', label: 'RÚT CHỈ ' + Math.ceil(p.tlCd / 60) + 's', btnIcon: '🧵', dim: true };
        if (p.tlHold > 0) return { pct: Math.min(1, p.tlHold / TL_HOLD), ready: p.tlHold >= TL_HOLD, color: TL_CYAN, label: 'RÚT CHỈ...', btnIcon: '🪡' };
        const e = tlEnemy(p), hot = e && (e.tlStitch > 0 || e.tlOnThread);
        return { pct: 1, ready: n > 0, color: hot ? TL_PINK : TL_SILVER, label: hot ? 'GIỮ: KHÂU CHÉO!' : 'GIỮ: RÚT CHỈ (' + n + ')', btnIcon: '🪡' };
    });
}
if (typeof window !== 'undefined') window.addEventListener('load', tlRegisterHUD);
