// ==========================================
// The Admin (the_admin) — Hình ảnh: xe trạm máy chủ có màn hình terminal ">_", Drone Admin, tường bóp làn,
// trường /godmode, HUD danh sách Luật (chớp sáng khi Luật chạy) và kết liễu SYSTEM SHUTDOWN.
// ==========================================

function tadWText(s, x, y) { if (typeof drawWorldText === 'function') drawWorldText(ctx, s, x, y); else ctx.fillText(s, x, y); }

registerTankArt('the_admin', (p, k) => {
    const t = k.t, fl = (p.tadExecFx || 0) > 0;
    TA.treads(-14, 5, -12, 14, t, '#0b1220', '#0f766e');
    ctx.fillStyle = TA.vgrad(-10, 12, '#0f2a24', '#050b10');
    TA.rr(-10, -8, 20, 20, 3); ctx.fill();
    ctx.strokeStyle = k.team; ctx.lineWidth = 1; TA.rr(-10, -8, 20, 20, 3); ctx.stroke();
    // màn hình terminal
    TA.glow(TAD_GREEN, fl ? 14 : 6);
    ctx.fillStyle = fl ? '#0b3b30' : '#02140f'; TA.rr(-7.5, -3, 15, 11, 1.5); ctx.fill();
    ctx.strokeStyle = TAD_GREEN; ctx.lineWidth = 0.9; TA.rr(-7.5, -3, 15, 11, 1.5); ctx.stroke();
    TA.noGlow();
    ctx.fillStyle = TAD_GREEN;
    ctx.fillRect(-6, -1, 2, 1); ctx.fillRect(-5, 0, 1, 1); ctx.fillRect(-6, 1, 2, 1);           // ">"
    if (Math.floor(t * 3) % 2 === 0) ctx.fillRect(-3, 1, 3, 1);                                  // "_"
    for (let i = 0; i < 3; i++) { ctx.globalAlpha = 0.55; ctx.fillRect(-6, 3 + i * 1.6, 3 + ((i * 5 + Math.floor(t * 4)) % 9), 0.8); }
    ctx.globalAlpha = 1;
    TA.barrel(0, -6, 9, 3.4, '#cbd5e1', TAD_GREEN);
    // khe tản nhiệt máy chủ
    ctx.fillStyle = (p.tadCd || 0) <= 0 ? TAD_GREEN : '#334155';
    for (let i = 0; i < 3; i++) { ctx.fillRect(-9, -6 + i * 2.2, 1.4, 1.2); ctx.fillRect(7.6, -6 + i * 2.2, 1.4, 1.2); }
    if (k.evo1) { ctx.strokeStyle = TAD_CYAN; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(0, 2, 13, t * 2, t * 2 + Math.PI * 0.9); ctx.stroke(); }
    if (k.evo2) { ctx.strokeStyle = TAD_GOLD; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(0, 2, 13, -t * 2, -t * 2 + Math.PI * 0.9); ctx.stroke(); }
    if (k.full) { ctx.fillStyle = TAD_GOLD; ctx.beginPath(); ctx.moveTo(-3, -9); ctx.lineTo(-1.5, -11); ctx.lineTo(0, -9.5); ctx.lineTo(1.5, -11); ctx.lineTo(3, -9); ctx.fill(); }
});

function tadDrawDrone(x, y, t, team) {
    ctx.save(); ctx.translate(x, y + Math.sin(t * 5) * 2);
    ctx.shadowColor = TAD_CYAN; ctx.shadowBlur = 8;
    ctx.fillStyle = '#0b2530'; TA.rr(-5, -3.5, 10, 7, 2); ctx.fill();
    ctx.strokeStyle = TAD_CYAN; ctx.lineWidth = 1; TA.rr(-5, -3.5, 10, 7, 2); ctx.stroke();
    ctx.fillStyle = TAD_CYAN; ctx.beginPath(); ctx.arc(0, 0, 1.6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(34,211,238,0.6)'; ctx.lineWidth = 0.8;
    const a = t * 30; ctx.beginPath(); ctx.moveTo(-8 + Math.cos(a) * 2, -4); ctx.lineTo(-8 - Math.cos(a) * 2, -4); ctx.moveTo(8 + Math.cos(a) * 2, -4); ctx.lineTo(8 - Math.cos(a) * 2, -4); ctx.stroke();
    ctx.restore();
}

Object.assign(CharHooks.registry.the_admin, {
    draw() {
        const p = this, cx = p.x + p.w / 2, cy = p.y + p.h / 2, t = (p.tadT || 0) / 60, e = tadEnemy(p), W = canvas.width;
        if (p.tadHold > 2 && p.tadHold < TAD_HOLD && !p.tadUsed && p.tadCd <= 0 && typeof drawReloadRing === 'function') drawReloadRing(p, p.tadHold / TAD_HOLD, TAD_GREEN);
        ctx.save();
        // /execute: vòng mã quét
        if (p.tadExecFx > 0) {
            const a = p.tadExecFx / 30;
            ctx.globalAlpha = a; ctx.strokeStyle = TAD_GREEN; ctx.lineWidth = 2; ctx.shadowColor = TAD_GREEN; ctx.shadowBlur = 12;
            ctx.beginPath(); ctx.arc(cx, cy, 18 + (1 - a) * 40, 0, Math.PI * 2); ctx.stroke();
            ctx.shadowBlur = 0;
        }
        // /godmode
        if (p.tadGodT > 0) {
            ctx.globalAlpha = 0.35 + 0.25 * Math.sin(t * 20); ctx.fillStyle = 'rgba(252, 211, 77, 0.25)'; ctx.strokeStyle = TAD_GOLD; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(cx, cy, 26, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        }
        // Khiên Tường Lửa (giảm sát thương)
        if (p.tadDrT > 0) {
            ctx.globalAlpha = 0.5; ctx.strokeStyle = TAD_CYAN; ctx.lineWidth = 1.2; ctx.setLineDash([3, 3]); ctx.lineDashOffset = -t * 30;
            ctx.strokeRect(p.x - 6, p.y - 6, p.w + 12, p.h + 12); ctx.setLineDash([]);
        }
        ctx.globalAlpha = 1;
        // Tường bóp hẹp làn địch
        if (p.tadLaneT > 0 && e) {
            const a = Math.min(1, p.tadLaneT / 20), y0 = e.y - 10, h = e.h + 20, ww = W * 0.175;
            ctx.globalAlpha = 0.55 * a; ctx.fillStyle = 'rgba(255, 59, 92, 0.35)';
            ctx.fillRect(0, y0, ww, h); ctx.fillRect(W - ww, y0, ww, h);
            ctx.globalAlpha = a; ctx.strokeStyle = TAD_RED; ctx.lineWidth = 2; ctx.shadowColor = TAD_RED; ctx.shadowBlur = 10;
            ctx.beginPath(); ctx.moveTo(ww, y0); ctx.lineTo(ww, y0 + h); ctx.moveTo(W - ww, y0); ctx.lineTo(W - ww, y0 + h); ctx.stroke();
            ctx.shadowBlur = 0;
        }
        ctx.restore();
        // Drone Admin
        if (p.tadDrones) for (const d of p.tadDrones) tadDrawDrone(cx + d.s * 24, cy + (p.id === 1 ? -4 : 4), t + d.s, p.id);
    },
    drawUI() {
        const p = this;
        if (p.hp <= 0 || !p.adminData) return;
        const rules = p.adminData.rules, cx = p.x + p.w / 2, y = p.id === 1 ? p.y - 24 : p.y + p.h + 6;
        ctx.save();
        // thanh hồi /execute
        const max = tadE1(p) ? TAD_CD_E1 : TAD_CD, frac = p.tadCd > 0 ? 1 - p.tadCd / max : 1;
        ctx.fillStyle = 'rgba(15,23,42,0.7)'; ctx.fillRect(cx - 14, y, 28, 3);
        ctx.fillStyle = frac >= 1 ? TAD_GREEN : '#0f766e'; ctx.fillRect(cx - 14, y, 28 * frac, 3);
        // danh sách Luật: mỗi Luật 1 ô (icon KQ đầu tiên), chớp sáng khi Luật chạy
        const n = Math.min(rules.length, 8), cw = 13, x0 = cx - (n * cw) / 2;
        ctx.font = "8px Arial"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        for (let i = 0; i < n; i++) {
            const r = rules[i], f = (p.tadFl && p.tadFl[i]) || 0, x = x0 + i * cw;
            ctx.globalAlpha = 1;
            ctx.fillStyle = f > 0 ? `rgba(52,245,197,${0.35 + f / 30})` : 'rgba(2,20,16,0.8)';
            ctx.strokeStyle = f > 0 ? '#ffffff' : (r.results.length && r.conds.length ? TAD_GREEN : '#475569');
            ctx.lineWidth = f > 0 ? 1.4 : 0.8;
            if (f > 0) { ctx.shadowColor = TAD_GREEN; ctx.shadowBlur = 8; }
            TA.rr(x + 0.5, y + 5, cw - 1, 11, 2); ctx.fill(); ctx.stroke();
            ctx.shadowBlur = 0;
            const ic = r.results.length ? tadRes(r.results[0]).ic : '∅';
            tadWText(ic, x + cw / 2, y + 10.8);
        }
        if (rules.length > n) { ctx.fillStyle = TAD_GREEN; tadWText('+' + (rules.length - n), x0 + n * cw + 6, y + 10.8); }
        ctx.restore();
    },
});

// Đạn Mã Nguồn / Tên Lửa / laser Drone
BulletHooks.registry.tad.draw = function (b) {
    const c = b.tadC || TAD_GREEN, x = b.x + b.w / 2, y = b.y + b.h / 2;
    ctx.save();
    ctx.shadowColor = c; ctx.shadowBlur = 8; ctx.fillStyle = c;
    if (b.tadK === 'msl') {
        const a = Math.atan2(b.vy, b.vx);
        ctx.translate(x, y); ctx.rotate(a);
        ctx.fillRect(-5, -2, 9, 4); ctx.fillStyle = '#ffffff'; ctx.fillRect(3, -1, 2, 2);
        ctx.fillStyle = 'rgba(52,245,197,0.5)'; ctx.fillRect(-10, -1, 5, 2);
    } else if (b.tadK === 'drone') {
        ctx.fillRect(b.x + 1, b.y, Math.max(2, b.w - 2), b.h);
    } else {
        // khối mã nhị phân
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.shadowBlur = 0; ctx.fillStyle = '#022c22';
        if (b.w >= 5) { ctx.fillRect(b.x + b.w * 0.3, b.y + b.h * 0.2, Math.max(1, b.w * 0.15), b.h * 0.6); ctx.fillRect(b.x + b.w * 0.6, b.y + b.h * 0.2, Math.max(1, b.w * 0.15), b.h * 0.6); }
        if (b.tadJack) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.strokeRect(b.x - 2, b.y - 2, b.w + 4, b.h + 4); }
    }
    ctx.restore();
};

// ---------- Kết liễu: SYSTEM SHUTDOWN: /delete_enemy (ROOT ACCESS) ----------
function tadDrawFinisher(f) {
    const t = f.t, W = canvas.width, H = canvas.height;
    const outA = t > f.dur - 25 ? Math.max(0, (f.dur - t) / 25) : 1;
    ctx.save();
    ctx.globalAlpha = outA;
    ctx.fillStyle = `rgba(0, 8, 6, ${0.6 * Math.min(1, t / 12)})`; ctx.fillRect(-W, -H, W * 3, H * 3);
    // mưa ma trận: các dòng code Luật chạy dọc màn hình
    const lines = f.lines && f.lines.length ? f.lines : ['RULE_1: IF(c2) => r5'];
    ctx.font = "9px 'Courier New', monospace"; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    const cols = Math.ceil(W / 26);
    for (let c = 0; c < cols; c++) {
        const s = lines[c % lines.length], sp = 2.2 + (c * 37 % 7) * 0.35, off = (c * 113) % H;
        const y = ((t * sp * 2 + off) % (H + 160)) - 80;
        for (let j = 0; j < 7; j++) {
            ctx.globalAlpha = outA * (0.15 + 0.12 * j);
            ctx.fillStyle = j === 6 ? '#d1fae5' : TAD_GREEN;
            ctx.fillText(s.charAt((j + Math.floor(t / 4) + c) % s.length) || '0', c * 26 + 4, y + j * 11);
        }
    }
    ctx.globalAlpha = outA;
    // dòng code đầy đủ ở góc
    ctx.fillStyle = TAD_GREEN;
    lines.slice(0, 6).forEach((s, i) => { if (t > 8 + i * 6) tadWText('> ' + s.slice(0, Math.min(s.length, Math.floor((t - 8 - i * 6) * 1.5))), 10, H - 190 + i * 12); });
    // cửa sổ cảnh báo hệ thống trên đầu địch
    const wy = Math.max(70, Math.min(H - 70, f.y + (f.team === 1 ? 70 : -70)));
    const ww = 176, wh = 74, wx = Math.max(6, Math.min(W - ww - 6, f.x - ww / 2));
    const k = Math.min(1, Math.max(0, (t - 20) / 14));
    if (t >= 20 && t < TADF_CLICK + 14) {
        ctx.save();
        ctx.translate(wx + ww / 2, wy); ctx.scale(k, k); ctx.translate(-ww / 2, -wh / 2);
        ctx.fillStyle = '#0b1220'; ctx.strokeStyle = TAD_RED; ctx.lineWidth = 2; ctx.shadowColor = TAD_RED; ctx.shadowBlur = 14;
        TA.rr(0, 0, ww, wh, 6); ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0;
        ctx.fillStyle = TAD_RED; TA.rr(0, 0, ww, 16, 6); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = "800 9px 'Orbitron', Arial"; ctx.textAlign = 'center';
        tadWText('⚠ SYSTEM WARNING', ww / 2, 9);
        ctx.fillStyle = '#e2e8f0'; ctx.font = "9px 'Courier New', monospace";
        tadWText('/delete_enemy (ROOT ACCESS)', ww / 2, 30);
        const pressed = t >= TADF_CLICK && t < TADF_CLICK + 8;
        ctx.fillStyle = pressed ? '#fff' : TAD_RED; TA.rr(ww / 2 - 52, 42, 104, 20, 4); ctx.fill();
        ctx.fillStyle = pressed ? TAD_RED : '#fff'; ctx.font = "900 10px 'Orbitron', Arial";
        tadWText('[CONFIRM DELETE]', ww / 2, 52.5);
        ctx.restore();
    }
    // con trỏ chuột Admin bay tới nút
    const bx = wx + ww / 2, by = wy + 15;
    if (t >= 34 && t < TADF_CLICK + 16) {
        const q = Math.min(1, (t - 34) / (TADF_CLICK - 40)), e2 = q * q * (3 - 2 * q);
        const mx = f.ax + (bx - f.ax) * e2, my = f.ay + (by - f.ay) * e2 + Math.sin(q * Math.PI) * (f.team === 1 ? -40 : 40);
        const press = t >= TADF_CLICK && t < TADF_CLICK + 6 ? 0.8 : 1;
        ctx.save(); ctx.translate(mx, my); ctx.scale(press * 1.4, press * 1.4);
        ctx.fillStyle = '#fff'; ctx.strokeStyle = '#000'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 14); ctx.lineTo(3.5, 10.5); ctx.lineTo(6.5, 16); ctx.lineTo(8.5, 15); ctx.lineTo(5.5, 9.5); ctx.lineTo(10, 9.5); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.restore();
    }
    // xe địch vỡ thành khối dữ liệu -> tiền bay vào túi Admin
    if (t >= TADF_CLICK + 4) {
        const q = (t - TADF_CLICK - 4) / 60;
        for (let i = 0; i < 46; i++) {
            const ang = i * 2.399, sp = 0.6 + (i % 7) * 0.22, sz = 2 + (i % 4);
            let x = f.x + Math.cos(ang) * sp * Math.min(q, 1) * 70, y = f.y + Math.sin(ang) * sp * Math.min(q, 1) * 70;
            if (q > 1) { const r = Math.min(1, (q - 1) * 1.4); const ee = r * r; x += (f.ax - x) * ee; y += (f.ay - y) * ee; }
            ctx.globalAlpha = outA * (q > 1.7 ? Math.max(0, 1 - (q - 1.7) * 3) : 1);
            ctx.fillStyle = q > 1 ? TAD_GOLD : (i % 3 ? TAD_GREEN : TAD_CYAN);
            if (q > 1) { ctx.beginPath(); ctx.arc(x, y, 2.6, 0, Math.PI * 2); ctx.fill(); } else ctx.fillRect(x - sz / 2, y - sz / 2, sz, sz);
        }
    }
    ctx.globalAlpha = outA;
    if (t >= TADF_CLICK + 10) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, (t - TADF_CLICK - 10) / 8) * outA;
        ctx.font = "900 20px 'Orbitron', Arial"; ctx.textAlign = 'center';
        ctx.shadowBlur = 16; ctx.shadowColor = TAD_GREEN; ctx.fillStyle = '#ecfdf5';
        const ty = Math.max(60, Math.min(H - 60, f.y + (f.team === 1 ? 125 : -125)));
        tadWText('SYSTEM SHUTDOWN', W / 2, ty);
        ctx.font = "700 11px 'Courier New', monospace"; ctx.fillStyle = TAD_GREEN;
        tadWText('enemy.exe deleted — 0 bytes remaining', W / 2, ty + 18);
        ctx.restore();
    }
    ctx.restore();
}
