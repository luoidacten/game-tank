// ==========================================
// Tia Lazer (lazer_beam) — Hình ảnh: xe phát tia, tụ năng lượng, đường cảnh báo, tia chính, chớp tắt
// HUD: thanh Năng Lượng (hàng tài nguyên) + vòng nạp/biểu tượng trên nút Bắn. Chỉ đọc state.
// ==========================================

registerTankArt('lazer_beam', (p, k) => {
    const t = k.t;
    const firing = p.lbPhase === 3;
    const en = Math.max(0, Math.min(1, (p.lbEnergy || 0) / 100));
    const cell = k.evo1 ? '#39ffb0' : LB_COLOR;
    const recoil = firing ? Math.sin(t * 60) * 0.4 : 0;
    TA.treads(-15, 4, -12, 13, t, '#111827', '#3f3f5a');
    // Nòng phát tia: ống dài + vòng thấu kính
    TA.barrel(0, -5 + recoil, 11, 4.4, '#d4d4e8', null);
    ctx.fillStyle = '#1e1b2e';
    for (let i = 0; i < 3; i++) { TA.rr(-3, -8.5 - i * 2.8 + recoil, 6, 1.4, 0.6); ctx.fill(); }
    // Evo2: cánh tản nhiệt hai bên nòng (đỏ dần khi tăng nhiệt)
    if (k.evo2) {
        const heat = Math.min(1, (p.lbRamp || 0) / 180);
        ctx.fillStyle = `rgb(${120 + 135 * heat},${60 + 40 * heat},${90 - 60 * heat})`;
        [-1, 1].forEach(sd => { ctx.beginPath(); ctx.moveTo(sd * 2.4, -8); ctx.lineTo(sd * 5.4, -11); ctx.lineTo(sd * 5.4, -6); ctx.lineTo(sd * 2.4, -5); ctx.closePath(); ctx.fill(); });
    }
    // Đầu phát: thấu kính sáng (Full Evo: tinh thể lăng kính)
    const lensA = firing ? 1 : (p.lbPhase === 1 || p.lbPhase === 2 ? 0.6 + 0.4 * Math.sin(t * 30) : 0.45);
    ctx.save();
    TA.glow(LB_COLOR, firing ? 12 : 5);
    ctx.globalAlpha = lensA;
    ctx.fillStyle = k.full ? '#ffffff' : LB_CORE;
    if (k.full) { ctx.beginPath(); ctx.moveTo(0, -18.5 + recoil); ctx.lineTo(2.6, -15.5 + recoil); ctx.lineTo(0, -13.5 + recoil); ctx.lineTo(-2.6, -15.5 + recoil); ctx.closePath(); ctx.fill(); }
    else { ctx.beginPath(); ctx.arc(0, -16 + recoil, 2, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
    // Thân lục giác góc cạnh
    ctx.save();
    TA.glow(k.teamGlow, 6);
    ctx.fillStyle = TA.metal(-12, 12, '#1a1630', '#4a4470');
    ctx.beginPath();
    ctx.moveTo(-6, -7); ctx.lineTo(6, -7); ctx.lineTo(12, -1); ctx.lineTo(12, 8); ctx.lineTo(7, 12.5); ctx.lineTo(-7, 12.5); ctx.lineTo(-12, 8); ctx.lineTo(-12, -1); ctx.closePath();
    ctx.fill(); TA.noGlow();
    ctx.strokeStyle = k.team; ctx.lineWidth = 1.3; ctx.stroke();
    ctx.restore();
    // Tụ điện hai bên: 4 ô mỗi bên sáng theo Năng Lượng
    const lit = Math.round(en * 8);
    for (let i = 0; i < 4; i++) {
        [-1, 1].forEach((sd, j) => {
            const idx = i * 2 + j;
            const on = idx < lit;
            ctx.fillStyle = on ? cell : 'rgba(255,255,255,0.12)';
            if (on) TA.glow(cell, 4);
            TA.rr(sd * 9.2 - 1.4, 9 - i * 3.6, 2.8, 2.4, 0.8); ctx.fill();
            TA.noGlow();
        });
    }
    // Lõi trung tâm: vòng hội tụ xoay
    const cg = ctx.createRadialGradient(0, 2, 0.5, 0, 2, 6);
    cg.addColorStop(0, '#ffffff'); cg.addColorStop(0.35, firing ? LB_COLOR : '#a855f7'); cg.addColorStop(1, '#1a1630');
    ctx.fillStyle = cg;
    ctx.beginPath(); ctx.arc(0, 2, 5.4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = k.team; ctx.lineWidth = 1;
    ctx.save(); ctx.translate(0, 2); ctx.rotate(t * (firing ? 9 : 2));
    ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 1.2); ctx.stroke();
    ctx.restore();
});

Object.assign(CharHooks.registry.lazer_beam, {
    draw() {
        const p = this;
        const n = lbNozzle(p);
        const end = p.lbEndY != null ? p.lbEndY : (n.dirY < 0 ? 0 : canvas.height);
        const t = Date.now();
        const hw = lbHalfW(p);
        ctx.save();
        if (p.lbPhase === 1) {
            // Tích tụ: hạt năng lượng hút về đầu nòng
            const max = lbE1(p) ? LB_CHARGE_E1 : LB_CHARGE;
            const k = Math.min(1, p.lbT / max);
            ctx.globalCompositeOperation = 'lighter';
            for (let i = 0; i < 8; i++) {
                const a = i / 8 * Math.PI * 2 + t / 120;
                const r = 16 * (1 - k) + 3;
                ctx.fillStyle = i % 2 ? LB_COLOR : LB_CORE;
                ctx.beginPath(); ctx.arc(n.x + Math.cos(a) * r, n.y + Math.sin(a) * r * 0.7, 1.4, 0, Math.PI * 2); ctx.fill();
            }
            ctx.strokeStyle = LB_COLOR; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.4 + 0.6 * k;
            ctx.beginPath(); ctx.arc(n.x, n.y, 3 + 10 * (1 - k), 0, Math.PI * 2); ctx.stroke();
        } else if (p.lbPhase === 2) {
            // Cảnh báo: dải mờ đúng bề ngang tia + vạch đứt nhấp nháy
            const k = p.lbT / LB_WARN;
            const blink = Math.floor(t / 70) % 2 === 0;
            ctx.fillStyle = `rgba(255, 43, 214, ${0.06 + 0.1 * k})`;
            ctx.fillRect(n.x - hw, Math.min(n.y, end), hw * 2, Math.abs(end - n.y));
            ctx.strokeStyle = blink ? '#ff5ce0' : 'rgba(255,92,224,0.45)';
            ctx.lineWidth = 1.2; ctx.setLineDash([7, 5]); ctx.lineDashOffset = -t / 25 * n.dirY;
            ctx.beginPath(); ctx.moveTo(n.x - hw, n.y); ctx.lineTo(n.x - hw, end); ctx.moveTo(n.x + hw, n.y); ctx.lineTo(n.x + hw, end); ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = '#ff5ce0'; ctx.globalAlpha = blink ? 1 : 0.5;
            ctx.beginPath(); ctx.arc(n.x, end, 3 + 3 * k, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = 1;
            ctx.strokeStyle = LB_CORE; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(n.x, n.y, 6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); ctx.stroke();
        } else if (p.lbPhase === 3 || p.lbPhase === 4) {
            let alpha = 1;
            if (p.lbPhase === 4) {
                // Chớp tắt: bật/tắt liên hồi, nhịp nhanh dần, mờ dần
                const on = [1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0][Math.min(13, p.lbT)] === 1;
                alpha = on ? 0.9 - p.lbT / LB_FLICKER * 0.6 : 0.08;
            }
            const heat = lbE2(p) ? Math.min(1, (p.lbRamp || 0) / 180) : 0;
            const col = heat > 0.05 ? `rgb(255,${43 + 120 * heat},${214 - 170 * heat})` : LB_COLOR;
            const y0 = n.y, y1 = end, top = Math.min(y0, y1), len = Math.abs(y1 - y0);
            const wob = 1 + Math.sin(t / 30) * 0.12;
            ctx.globalAlpha = alpha;
            ctx.globalCompositeOperation = 'lighter';
            // quầng ngoài
            const g = ctx.createLinearGradient(n.x - hw * 2.4, 0, n.x + hw * 2.4, 0);
            g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, col); g.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = g; ctx.globalAlpha = alpha * 0.55;
            ctx.fillRect(n.x - hw * 2.4 * wob, top, hw * 4.8 * wob, len);
            // thân tia
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = alpha;
            ctx.shadowBlur = 16; ctx.shadowColor = col;
            ctx.fillStyle = col; ctx.fillRect(n.x - hw, top, hw * 2, len);
            ctx.shadowBlur = 0;
            // lõi trắng
            ctx.fillStyle = LB_CORE; ctx.fillRect(n.x - Math.max(1, hw * 0.35), top, Math.max(2, hw * 0.7), len);
            // xung chạy dọc tia
            ctx.fillStyle = LB_CORE;
            for (let i = 0; i < 6; i++) {
                const f = ((t / 6 + i * 60) % 360) / 360;
                const yy = y0 + (y1 - y0) * f;
                ctx.globalAlpha = alpha * 0.45;
                ctx.fillRect(n.x - hw * 1.3, yy - 1.5, hw * 2.6, 3);
            }
            ctx.globalAlpha = alpha;
            // điểm chạm: bùng sáng
            const fr = hw * 2 + 4 + Math.random() * 4;
            const rg = ctx.createRadialGradient(n.x, y1, 0, n.x, y1, fr * 1.6);
            rg.addColorStop(0, '#ffffff'); rg.addColorStop(0.4, col); rg.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(n.x, y1, fr * 1.6, 0, Math.PI * 2); ctx.fill();
            // miệng nòng
            ctx.fillStyle = LB_CORE; ctx.beginPath(); ctx.arc(n.x, y0, hw + 1, 0, Math.PI * 2); ctx.fill();
            // Full Evo: vạch nạp Tia Bùng Nổ quanh miệng nòng
            if (lbFull(p) && p.lbPhase === 3) {
                ctx.globalCompositeOperation = 'source-over';
                ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.arc(n.x, y0, hw + 6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (p.lbBurstT || 0) / LB_BURST_EVERY); ctx.stroke();
            }
        }
        // Full Evo: Tia Bùng Nổ
        if (p.lbBurstFx > 0) {
            const k = p.lbBurstFx / 16;
            const stop = p.lbBurstStop != null ? p.lbBurstStop : (n.dirY < 0 ? 0 : canvas.height);
            const bw = (lbHalfW(p) + 8) * (0.6 + 0.6 * k);
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = k;
            ctx.shadowBlur = 24; ctx.shadowColor = '#ffffff';
            ctx.fillStyle = 'rgba(255, 120, 235, 0.8)';
            ctx.fillRect(n.x - bw, Math.min(n.y, stop), bw * 2, Math.abs(stop - n.y));
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(n.x - bw * 0.35, Math.min(n.y, stop), bw * 0.7, Math.abs(stop - n.y));
        }
        ctx.restore();
    },
});

// HUD chung (tank-hud.js / empower-hud.js) nạp sau file body -> đăng ký khi trang tải xong
function lbRegisterHUD() {
// Thanh Năng Lượng ở hàng tài nguyên của HUD chung
if (typeof HUD_RESOURCE !== 'undefined') {
    HUD_RESOURCE.lazer_beam = p => ({
        c: p.lbLock ? '#64748b' : (p.lbRegenDelay > 0 && p.lbPhase !== 3 ? '#a78bfa' : (lbE1(p) ? '#39ffb0' : LB_COLOR)),
        k: (p.lbEnergy || 0) / 100,
    });
}

// Nút Bắn: vòng = tiến độ tích tụ/cảnh báo, khi chiếu = năng lượng còn lại; Full Evo đếm Tia Bùng Nổ
registerEmpowerHUD('lazer_beam', p => {
    const en = (p.lbEnergy || 0) / 100;
    if (p.lbPhase === 1) return { pct: Math.min(1, p.lbT / (lbE1(p) ? LB_CHARGE_E1 : LB_CHARGE)) * 0.5, ready: false, color: '#c084fc', label: 'TÍCH TỤ', btnIcon: '◎' };
    if (p.lbPhase === 2) return { pct: 0.5 + 0.5 * p.lbT / LB_WARN, ready: false, color: '#ff5ce0', label: 'CẢNH BÁO', btnIcon: '⚠' };
    if (p.lbPhase === 3) {
        const s = { pct: en, ready: true, color: LB_COLOR, label: 'TIA ' + Math.round(en * 100) + '%', btnIcon: '⚡' };
        if (lbFull(p)) { s.pips = Math.floor((p.lbBurstT || 0) / 30); s.pipMax = 4; s.pipColor = '#ffffff'; }
        return s;
    }
    return { idle: true, pct: en, ready: false, color: p.lbLock ? '#64748b' : LB_COLOR, label: '', btnIcon: p.lbLock ? '⌛' : '⚡' };
});
// Chip Thiêu Đốt (Evo2) trên xe địch
if (typeof HUD_STATUS !== 'undefined') {
    HUD_STATUS.push(p => {
        const r = p === p1 ? p2 : p1;
        if (!r || r.weapon !== 'lazer_beam' || !(r.lbBurnT > 0)) return null;
        return { g: 'burn', c: '#ff7a1a', l: 'THIÊU', t: (r.lbBurnT / 60).toFixed(1) };
    });
}
}
if (typeof window !== 'undefined') window.addEventListener('load', lbRegisterHUD);
