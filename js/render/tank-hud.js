// ==========================================
// HUD trên sân cho từng xe (thanh máu, khiên, đạn, hiệu ứng)
// ------------------------------------------
// Bố cục cố định ở phía XA địch (P1 dưới gầm xe, P2 trên nóc xe). Khoảng cách d tính từ mép xe ra ngoài:
//   d 2..8    : thanh HP (vạch chia mỗi 1 HP) + số HP bên trái + chấm khiên bên phải
//   d 9.5..12 : dải đạn (mỗi viên 1 vạch, viên đang nạp sáng dần) / Sniper nạp băng
//   d 12..16  : hàng tài nguyên (Súng Nước, Lò Nung...) hoặc thanh riêng của body (Sukuna, Sprayer, Kiếm Khách...)
//   Hai bên hàng HP: chip hiệu ứng (biểu tượng + nhãn + thời gian còn lại)
// Chữ luôn đứng chiều với người xem: guest online (sân xoay 180°) và P2 ở chế độ 2 người cùng máy
// (P2 cầm máy ngược) thì chữ của xe đó được xoay 180°.
// Chỉ đọc state -> an toàn online.
// ==========================================

// Body tự vẽ thanh riêng ở hàng sát xe phía P2 (dùng subUiY cũ = y-8) -> P2 dời HP ra hàng ngoài
const HUD_P2_NEAR_ROW = { t_zero: 1, kiem_vu: 1, thunder: 1 };
// Body có thanh tài nguyên chung (vẽ ở hàng ngoài)
const HUD_RESOURCE = {
    water_gun: p => ({ c: '#00bfff', k: p.energy / p.maxEnergy }),
    furnace: p => ({ c: '#ff6600', k: p.energy / p.maxEnergy }),
    six_barrel: p => {
        if (!p.isOverheated && (p.sbSpin || 0) < 30 && p.heat < 1) return { c: '#ffffff', k: (p.sbSpin || 0) / 30 };
        return { c: p.isOverheated ? '#ff0000' : (p.heat >= 75 ? '#ff3300' : (p.heat >= 50 ? '#ff9900' : '#ffd700')), k: p.heat / 100 };
    },
    the_strongest: p => ({ c: '#00ffff', k: p.chuLuc / p.maxChuLuc }),
    van_kiem: p => ({ c: '#9b59b6', k: Math.min(1, (p.stanceSwordsAccumulated || 0) / 8) }),
};

function hudTeam(p) {
    return p.id === 1
        ? { hi: '#7ff6ff', main: '#00e5ff', lo: '#3498db', glow: 'rgba(0,229,255,0.8)' }
        : { hi: '#ff8fa8', main: '#ff2d6b', lo: '#e74c3c', glow: 'rgba(255,45,107,0.8)' };
}

// Xe này có cần lật chữ 180° không (để người điều khiển/đang xem đọc xuôi)
function hudTextFlip(p) {
    const online = typeof onlineManager !== 'undefined' && onlineManager && onlineManager.isOnline;
    if (online) return onlineManager.role === 'guest';
    const bot = typeof botAI !== 'undefined' && botAI.enabled;
    return !bot && p.id === 2;
}

// Khung toạ độ: lx = ngang (dương = bên phải người xem), d = khoảng cách ra xa xe
function hudFrame(p, cxAt) {
    const flip = hudTextFlip(p);
    const dir = p.id === 1 ? 1 : -1;
    const edge = p.id === 1 ? p.y + p.h : p.y;
    const cx = cxAt !== undefined ? cxAt : p.x + p.w / 2;
    const hx = flip ? -1 : 1;
    return {
        flip, dir, edge, cx, hx,
        X: lx => cx + hx * lx,
        Y: d => edge + dir * d,
        // còn bao nhiêu chỗ bên phải / trái người xem (theo lx)
        roomR: flip ? cx : canvas.width - cx,
        roomL: flip ? canvas.width - cx : cx,
    };
}
function hudRect(F, lx, d, w, h) {
    const x1 = F.X(lx), x2 = F.X(lx + w), y1 = F.Y(d), y2 = F.Y(d + h);
    return [Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1), Math.abs(y2 - y1)];
}
function hudFill(F, lx, d, w, h) { const r = hudRect(F, lx, d, w, h); ctx.fillRect(r[0], r[1], r[2], r[3]); }
function hudRRect(F, lx, d, w, h, rad) {
    const r = hudRect(F, lx, d, w, h);
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(r[0], r[1], r[2], r[3], rad); else ctx.rect(r[0], r[1], r[2], r[3]);
}
// Chữ căn giữa theo chiều dọc tại (lx, d); align theo góc nhìn người xem
function hudText(F, s, lx, d, align) {
    ctx.textAlign = align || 'center';
    ctx.textBaseline = 'middle';
    const x = F.X(lx), y = F.Y(d);
    if (F.flip) { ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI); ctx.fillText(s, 0, 0); ctx.restore(); }
    else ctx.fillText(s, x, y);
}
function hudFmtHp(v) {
    if (v <= 0) return '0';
    if (Math.abs(v - Math.round(v)) < 0.05) return String(Math.round(v));
    return v < 10 ? v.toFixed(1) : String(Math.round(v));
}

// ---------- Biểu tượng hiệu ứng (vector, bán kính ~3.6) ----------
const HUD_GLYPH = {
    freeze(x, y) { // bông tuyết
        ctx.beginPath();
        for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3; ctx.moveTo(x + Math.cos(a) * 3.4, y + Math.sin(a) * 3.4); ctx.lineTo(x - Math.cos(a) * 3.4, y - Math.sin(a) * 3.4); }
        ctx.stroke();
    },
    stun(x, y) { // ngôi sao choáng
        ctx.beginPath();
        for (let i = 0; i < 10; i++) { const r = i % 2 ? 1.5 : 3.6, a = -Math.PI / 2 + i * Math.PI / 5; ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); }
        ctx.closePath(); ctx.fill();
    },
    burn(x, y) { // ngọn lửa
        ctx.beginPath(); ctx.moveTo(x, y - 3.8);
        ctx.quadraticCurveTo(x + 3.4, y - 0.2, x + 2.4, y + 2); ctx.quadraticCurveTo(x, y + 4.4, x - 2.4, y + 2);
        ctx.quadraticCurveTo(x - 3.4, y - 0.2, x, y - 3.8); ctx.fill();
    },
    drop(x, y) { // giọt (chảy máu / axit)
        ctx.beginPath(); ctx.moveTo(x, y - 3.8);
        ctx.quadraticCurveTo(x + 3.2, y + 0.2, x + 2.3, y + 1.9); ctx.arc(x, y + 1.4, 2.4, 0.2, Math.PI - 0.2);
        ctx.quadraticCurveTo(x - 3.2, y + 0.2, x, y - 3.8); ctx.fill();
    },
    slow(x, y, F) { // 2 mũi tên lùi
        const s = F.hx;
        ctx.beginPath();
        for (const o of [-1.6, 1.6]) { ctx.moveTo(x + s * (o + 1.4), y - 2.8); ctx.lineTo(x + s * (o - 1.2), y); ctx.lineTo(x + s * (o + 1.4), y + 2.8); }
        ctx.stroke();
    },
    silence(x, y) { // vòng cấm
        ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.moveTo(x - 2.1, y - 2.1); ctx.lineTo(x + 2.1, y + 2.1); ctx.stroke();
    },
    blind(x, y) { // con mắt
        ctx.beginPath(); ctx.ellipse(x, y, 3.6, 2.1, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill();
    },
    confuse(x, y) { // xoắn ốc
        ctx.beginPath();
        for (let i = 0; i <= 18; i++) { const a = i * 0.62, r = 0.4 + i * 0.18; ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); }
        ctx.stroke();
    },
    up(x, y, F) { // mũi tên lên (buff)
        const s = -F.dir * (F.flip ? -1 : 1) || -1; // luôn chỉ lên theo góc nhìn
        ctx.beginPath(); ctx.moveTo(x, y + s * 3.6); ctx.lineTo(x + 3.2, y + s * 0.2); ctx.lineTo(x + 1.2, y + s * 0.2); ctx.lineTo(x + 1.2, y - s * 3.4);
        ctx.lineTo(x - 1.2, y - s * 3.4); ctx.lineTo(x - 1.2, y + s * 0.2); ctx.lineTo(x - 3.2, y + s * 0.2); ctx.closePath(); ctx.fill();
    },
    down(x, y, F) { HUD_GLYPH.up(x, y, { dir: -F.dir, flip: F.flip }); },
    chain(x, y) { // xích (trói buộc)
        ctx.beginPath(); ctx.ellipse(x - 1.5, y - 1.2, 1.9, 1.3, -0.7, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(x + 1.5, y + 1.2, 1.9, 1.3, -0.7, 0, Math.PI * 2); ctx.stroke();
    },
    guard(x, y) { // khiên (bất tử)
        ctx.beginPath(); ctx.moveTo(x, y - 3.8); ctx.lineTo(x + 3.2, y - 2.4); ctx.lineTo(x + 2.6, y + 1.2); ctx.lineTo(x, y + 3.8);
        ctx.lineTo(x - 2.6, y + 1.2); ctx.lineTo(x - 3.2, y - 2.4); ctx.closePath(); ctx.fill();
    },
    gear(x, y) { // bánh răng (Thiên Tài: Bánh Răng)
        ctx.beginPath();
        for (let i = 0; i < 16; i++) { const r = i % 4 < 2 ? 3.9 : 2.7, a = (i - 0.5) * Math.PI / 8; ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); }
        ctx.closePath(); ctx.fill();
        ctx.save(); ctx.fillStyle = 'rgba(6,10,20,0.95)'; ctx.beginPath(); ctx.arc(x, y, 1.2, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    },
    nut(x, y) { // đai ốc lục giác (Linh Kiện)
        ctx.beginPath();
        for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; ctx.lineTo(x + Math.cos(a) * 3.6, y + Math.sin(a) * 3.6); }
        ctx.closePath(); ctx.fill();
        ctx.save(); ctx.fillStyle = 'rgba(6,10,20,0.95)'; ctx.beginPath(); ctx.arc(x, y, 1.4, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    },
    heart(x, y) { // máu tối đa
        ctx.beginPath(); ctx.moveTo(x, y + 3.4);
        ctx.bezierCurveTo(x - 4.6, y + 0.2, x - 2.6, y - 3.8, x, y - 1.4);
        ctx.bezierCurveTo(x + 2.6, y - 3.8, x + 4.6, y + 0.2, x, y + 3.4); ctx.fill();
    },
    sword(x, y) { // sát thương
        ctx.beginPath(); ctx.moveTo(x + 3.2, y - 3.2); ctx.lineTo(x - 1.6, y + 1.6); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x - 3, y - 0.2); ctx.lineTo(x + 0.2, y + 3); ctx.moveTo(x - 1.8, y + 1.8); ctx.lineTo(x - 3.4, y + 3.4); ctx.stroke();
    },
    check(x, y) { // trúng nhịp
        ctx.beginPath(); ctx.moveTo(x - 3.2, y); ctx.lineTo(x - 0.8, y + 2.6); ctx.lineTo(x + 3.4, y - 2.8); ctx.stroke();
    },
    cross(x, y) { // hụt
        ctx.beginPath(); ctx.moveTo(x - 2.8, y - 2.8); ctx.lineTo(x + 2.8, y + 2.8); ctx.moveTo(x + 2.8, y - 2.8); ctx.lineTo(x - 2.8, y + 2.8); ctx.stroke();
    },
    hook(x, y) { // móc câu (Móc Thép)
        ctx.beginPath(); ctx.moveTo(x + 1.6, y - 3.8); ctx.lineTo(x + 1.6, y + 0.6); ctx.arc(x - 0.4, y + 0.6, 2, 0, Math.PI); ctx.lineTo(x - 2.4, y - 0.6); ctx.stroke();
    },
    scissors(x, y) { // cắt xích
        ctx.beginPath(); ctx.arc(x - 2.2, y + 2.2, 1.4, 0, Math.PI * 2); ctx.arc(x + 2.2, y + 2.2, 1.4, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x - 1.4, y + 1.2); ctx.lineTo(x + 2.4, y - 3.6); ctx.moveTo(x + 1.4, y + 1.2); ctx.lineTo(x - 2.4, y - 3.6); ctx.stroke();
    },
    robot(x, y) { // Mecha
        ctx.fillRect(x - 3, y - 2.2, 6, 4.8);
        ctx.fillRect(x - 0.4, y - 4, 0.8, 1.8);
        ctx.save(); ctx.fillStyle = 'rgba(6,10,20,0.95)'; ctx.fillRect(x - 2, y - 1, 1.3, 1.3); ctx.fillRect(x + 0.7, y - 1, 1.3, 1.3); ctx.restore();
    },
    wall(x, y) { // gạch tường (Sniper)
        ctx.fillRect(x - 3.4, y - 3, 3, 2.4); ctx.fillRect(x + 0.4, y - 3, 3, 2.4);
        ctx.fillRect(x - 1.5, y - 0.2, 3, 2.4); ctx.fillRect(x - 3.4, y + 0.4, 1.4, 2.4); ctx.fillRect(x + 2, y + 0.4, 1.4, 2.4);
    },
};

// Vẽ biểu tượng luôn đứng chiều với người xem (xe có chữ lật 180° -> xoay biểu tượng theo)
function hudGlyphAt(g, x, y, F) {
    const fn = HUD_GLYPH[g];
    if (!fn) return;
    if (!F || !F.flip) { fn(x, y, F || { hx: 1, dir: 1, flip: false }); return; }
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI);
    fn(0, 0, { hx: 1, dir: 1, flip: false });
    ctx.restore();
}

const sec = f => (f / 60).toFixed(1);
// Danh sách hiệu ứng (ưu tiên từ trên xuống: khống chế -> sát thương theo thời gian -> buff)
const HUD_STATUS = [
    p => {
        if (!(p.freezeTimer > 0)) return null;
        const en = p === p1 ? p2 : p1;
        const ice = (en && en.weapon === 'ice') || p.freezeTimer > 100;
        return { g: ice ? 'freeze' : 'stun', c: ice ? '#7dd3fc' : '#fde047', l: ice ? 'BĂNG' : 'CHOÁNG', t: sec(p.freezeTimer) };
    },
    p => p.silenceTimer > 0 ? { g: 'silence', c: '#c084fc', l: 'CÂM', t: sec(p.silenceTimer) } : null,
    p => (p.burnStacks > 0 && p.burnTimer > 0) ? { g: 'burn', c: '#fb923c', l: 'CHÁY' + (p.burnStacks > 1 ? '×' + p.burnStacks : ''), t: sec(p.burnTimer + (p.burnStacks - 1) * 60) } : null,
    p => p.bleedTimer > 0 ? { g: 'drop', c: '#ff3366', l: 'MÁU', t: sec(p.bleedTimer) } : null,
    p => p.acidBurnTimer > 0 ? { g: 'drop', c: '#84cc16', l: 'AXIT', t: sec(p.acidBurnTimer) } : null,
    p => {
        if (p.slowTimer > 0) return { g: 'slow', c: '#60a5fa', l: 'CHẬM', t: sec(p.slowTimer) };
        if (p.speedDebuffTimer > 0) return { g: 'slow', c: '#60a5fa', l: 'CHẬM', t: sec(p.speedDebuffTimer) };
        if (p.statusSpeedMult !== undefined && p.statusSpeedMult < 0.99) return { g: 'slow', c: '#60a5fa', l: 'CHẬM', t: '' };
        return null;
    },
    p => p.blindTimer > 0 ? { g: 'blind', c: '#94a3b8', l: 'MÙ', t: sec(p.blindTimer) } : null,
    p => p.confusionStacks > 0 ? { g: 'confuse', c: '#e879f9', l: 'LOẠN×' + p.confusionStacks, t: '' } : null,
    p => p.bindingCurseStacks > 0 ? { g: 'chain', c: '#a78bfa', l: 'TRÓI×' + p.bindingCurseStacks, t: p.bindingCurseTimer > 0 ? sec(p.bindingCurseTimer) : '' } : null,
    p => {
        const v = (p.statusVuln || 0) + (p.permanentVulnerability || 0) + (p.vulnerableStacks || 0) * 0.1;
        return v > 0.001 ? { g: 'down', c: '#f87171', l: 'YẾU', t: '+' + Math.round(v * 100) + '%' } : null;
    },
    p => p.invincibleTimer > 0 ? { g: 'guard', c: '#fde68a', l: 'BẤT TỬ', t: sec(p.invincibleTimer) } : null,
    p => p.dmgBuff > 0 ? { g: 'up', c: '#facc15', l: 'ST', t: '+' + (Math.round(p.dmgBuff * 10) / 10) } : null,
    p => (p.weapon === 'cung' && (p.bowDodgeReady || p.bowDodgeCooldown > 0)) ? { g: 'slow', c: p.bowDodgeReady ? '#00ffcc' : '#64748b', l: 'NÉ', t: p.bowDodgeReady ? '' : sec(p.bowDodgeCooldown) } : null,
    p => (p.weapon === 'sniper' && p.sniperWallCooldown > 0) ? { g: 'wall', c: '#22d3ee', l: 'TƯỜNG', t: sec(p.sniperWallCooldown) } : null,
];

function hudCollectStatus(p) {
    const out = [];
    for (const f of HUD_STATUS) { let s = null; try { s = f(p); } catch (e) { } if (s) out.push(s); }
    return out;
}

// Một chip: [vòng màu + biểu tượng][NHÃN thời gian]
function hudChipWidth(s) {
    ctx.font = "700 9px 'Rajdhani', Arial";
    let w = 12 + ctx.measureText(s.l).width + 3;
    if (s.t) { ctx.font = "700 8px 'Orbitron', Arial"; w += ctx.measureText(s.t).width + 3; }
    return Math.ceil(w + 2);
}
function hudDrawChip(F, s, lx, dMid, w) {
    const h = 11;
    ctx.fillStyle = 'rgba(6, 10, 20, 0.86)';
    ctx.strokeStyle = s.c; ctx.lineWidth = 1;
    hudRRect(F, lx, dMid - h / 2, w, h, 5.5); ctx.fill();
    ctx.globalAlpha = 0.85; ctx.stroke(); ctx.globalAlpha = 1;
    // biểu tượng
    const gx = F.X(lx + 6), gy = F.Y(dMid);
    ctx.fillStyle = s.c; ctx.strokeStyle = s.c; ctx.lineWidth = 1.2; ctx.lineCap = 'round';
    ctx.shadowBlur = 4; ctx.shadowColor = s.c;
    hudGlyphAt(s.g, gx, gy, F);
    ctx.shadowBlur = 0;
    // nhãn + thời gian
    ctx.fillStyle = '#f1f5f9';
    ctx.font = "700 9px 'Rajdhani', Arial";
    const lw = ctx.measureText(s.l).width;
    hudText(F, s.l, lx + 12, dMid + 0.5, 'left');
    if (s.t) {
        ctx.fillStyle = s.c;
        ctx.font = "700 8px 'Orbitron', Arial";
        hudText(F, s.t, lx + 12 + lw + 3, dMid + 0.5, 'left');
    }
}

// Tiến độ nạp viên đạn kế tiếp (0..1) theo luật hồi đạn chung (update.js)
function hudReloadPct(p) {
    if (p.ammo >= p.maxAmmo) return 1;
    const now = Date.now();
    const start = Math.max(p.lastShot || 0, p.lastReload || 0);
    const due = Math.max((p.lastShot || 0) + (p.reloadTime || 0), (p.lastReload || 0) + 500);
    if (due <= start) return 1;
    return Math.max(0, Math.min(1, (now - start) / (due - start)));
}

function drawTankHUD(p) {
    const F = hudFrame(p);
    const T = hudTeam(p);
    const nearBody = p.id === 2 && HUD_P2_NEAR_ROW[p.weapon];
    const dHp = nearBody ? 11 : 2;     // hàng HP
    const hpH = 6;
    const BW = Math.max(40, Math.min(54, p.w + 14));
    const bx = -BW / 2;
    const t = Date.now();

    ctx.save();
    // ---- Thanh HP ----
    if (p.ghostHp === undefined) p.ghostHp = p.hp;
    if (p.ghostHp > p.hp) { p.ghostHp = Math.max(p.hp, p.ghostHp - 0.05); } else p.ghostHp = p.hp;
    const maxHp = Math.max(0.01, p.maxHp);
    const k = Math.max(0, Math.min(1, p.hp / maxHp));
    const kg = Math.max(0, Math.min(1, p.ghostHp / maxHp));

    ctx.fillStyle = 'rgba(4, 8, 18, 0.9)';
    hudRRect(F, bx - 1.5, dHp - 1.5, BW + 3, hpH + 3, 2.5); ctx.fill();
    // máu vừa mất (vệt trắng-vàng tụt dần)
    ctx.fillStyle = 'rgba(255, 236, 160, 0.75)';
    hudFill(F, bx, dHp, BW * kg, hpH);
    // máu hiện tại (gradient theo team, đỏ cam khi thấp)
    const low = k <= 0.3;
    const r = hudRect(F, bx, dHp, BW * k, hpH);
    const g = ctx.createLinearGradient(0, r[1], 0, r[1] + r[3]);
    if (low) { g.addColorStop(0, '#ffd27a'); g.addColorStop(1, '#ff6a00'); }
    else { g.addColorStop(0, T.hi); g.addColorStop(0.55, T.main); g.addColorStop(1, T.lo); }
    ctx.fillStyle = g;
    ctx.shadowBlur = low ? 6 + 4 * Math.sin(t / 120) : 5; ctx.shadowColor = low ? '#ff6a00' : T.glow;
    ctx.fillRect(r[0], r[1], r[2], r[3]);
    ctx.shadowBlur = 0;
    // vạch chia mỗi 1 HP (máu lớn -> mỗi 5 HP)
    const step = (BW / maxHp >= 3) ? 1 : 5;
    ctx.fillStyle = 'rgba(4, 8, 18, 0.85)';
    for (let v = step; v < maxHp - 0.01; v += step) hudFill(F, bx + BW * v / maxHp - 0.5, dHp, 1, hpH);
    // viền mảnh
    ctx.strokeStyle = 'rgba(255,255,255,0.28)'; ctx.lineWidth = 0.8;
    hudRRect(F, bx - 1.5, dHp - 1.5, BW + 3, hpH + 3, 2.5); ctx.stroke();

    // Số HP (bên trái thanh, theo góc nhìn)
    ctx.font = "800 9px 'Orbitron', Arial";
    ctx.fillStyle = low ? '#ffb347' : '#ffffff';
    ctx.shadowBlur = 4; ctx.shadowColor = low ? '#ff6a00' : T.glow;
    const hpStr = hudFmtHp(p.hp);
    hudText(F, hpStr, bx - 4, dHp + hpH / 2 + 0.5, 'right');
    ctx.shadowBlur = 0;
    const leftUsed = BW / 2 + 4 + ctx.measureText(hpStr).width + 3;

    // ---- Khiên: hình thoi xanh bên phải thanh ----
    let rightUsed = BW / 2 + 2;
    if (p.shield > 0) {
        const n = Math.ceil(p.shield);
        const show = n > 4 ? 1 : n;
        ctx.fillStyle = '#67e8f9'; ctx.shadowBlur = 6; ctx.shadowColor = '#00ffff';
        for (let s = 0; s < show; s++) {
            const cx = F.X(BW / 2 + 6 + s * 7), cy = F.Y(dHp + hpH / 2);
            ctx.beginPath(); ctx.moveTo(cx, cy - 4); ctx.lineTo(cx + 3, cy); ctx.lineTo(cx, cy + 4); ctx.lineTo(cx - 3, cy); ctx.closePath(); ctx.fill();
        }
        ctx.shadowBlur = 0;
        rightUsed = BW / 2 + 6 + (show - 1) * 7 + 4;
        if (n > 4) {
            ctx.font = "800 8px 'Orbitron', Arial"; ctx.fillStyle = '#a5f3fc';
            hudText(F, '×' + n, rightUsed + 1, dHp + hpH / 2 + 0.5, 'left');
            rightUsed += 2 + ctx.measureText('×' + n).width;
        }
        rightUsed += 2;
    }

    // ---- Dải đạn ----
    const dAm = dHp + hpH + 1.5, amH = 2.5;
    if (!nearBody && p.maxAmmo > 0 && p.maxAmmo < 100) {
        const reloading = (p.weapon === 'sniper' && p.sniperReloading) || p.smgReloading;
        if (reloading) {
            const reloadMax = p.sniperReloadMax || ((p.hasUpgrade('evo_sniper_1') && p.hasUpgrade('evo_sniper_2')) ? 150 : 180);
            const rk = Math.max(0, Math.min(1, p.smgReloading ? 1 - (p.smgReloadT || 0) / Math.max(1, p.smgReloadMax || 1) : 1 - p.sniperReloadTimer / reloadMax));
            ctx.fillStyle = 'rgba(255,255,255,0.12)'; hudFill(F, bx, dAm, BW, amH);
            ctx.fillStyle = '#ff9f1a'; ctx.shadowBlur = 5; ctx.shadowColor = '#ff9f1a';
            hudFill(F, bx, dAm, BW * rk, amH); ctx.shadowBlur = 0;
        } else if (p.maxAmmo > 16) {
            // nhiều đạn -> 1 thanh liền có vạch mỗi 5 viên
            ctx.fillStyle = 'rgba(255,255,255,0.12)'; hudFill(F, bx, dAm, BW, amH);
            ctx.fillStyle = '#ffd700'; hudFill(F, bx, dAm, BW * p.ammo / p.maxAmmo, amH);
            ctx.fillStyle = 'rgba(4,8,18,0.9)';
            for (let i = 5; i < p.maxAmmo; i += 5) hudFill(F, bx + BW * i / p.maxAmmo - 0.5, dAm, 1, amH);
        } else {
            const gap = p.maxAmmo > 8 ? 1 : 1.5;
            const pw = (BW - gap * (p.maxAmmo - 1)) / p.maxAmmo;
            const rp = hudReloadPct(p);
            for (let i = 0; i < p.maxAmmo; i++) {
                const x = bx + i * (pw + gap);
                if (i < p.ammo) { ctx.fillStyle = '#ffd700'; hudFill(F, x, dAm, pw, amH); }
                else {
                    ctx.fillStyle = 'rgba(255,255,255,0.14)'; hudFill(F, x, dAm, pw, amH);
                    if (i === Math.floor(p.ammo) && p.weapon !== 'sniper' && p.weapon !== 'tank') {
                        ctx.fillStyle = 'rgba(255, 215, 0, 0.55)'; hudFill(F, x, dAm, pw * rp, amH);
                    }
                }
            }
        }
    }

    // ---- Hàng tài nguyên (body dùng thanh chung) ----
    const res = HUD_RESOURCE[p.weapon];
    if (res) {
        let s = null; try { s = res(p); } catch (e) { }
        if (s) {
            const dR = dAm + 0.5;
            ctx.fillStyle = 'rgba(4, 8, 18, 0.85)'; hudFill(F, bx, dR, BW, 3.5);
            ctx.fillStyle = s.c; ctx.shadowBlur = 6; ctx.shadowColor = s.c;
            hudFill(F, bx, dR, BW * Math.max(0, Math.min(1, s.k || 0)), 3.5);
            ctx.shadowBlur = 0;
        }
    }

    // ---- Chip hiệu ứng: bên phải trước, hết chỗ thì sang trái ----
    const list = hudCollectStatus(p);
    if (list.length) {
        const dMid = dHp + hpH / 2 + 0.5;
        let rx = rightUsed + 2, lxEdge = -leftUsed - 1;
        for (const s of list) {
            const w = hudChipWidth(s);
            if (rx + w <= F.roomR - 2) { hudDrawChip(F, s, rx, dMid, w); rx += w + 2; }
            else if (-lxEdge + w <= F.roomL - 2) { hudDrawChip(F, s, lxEdge - w, dMid, w); lxEdge -= w + 2; }
            else if (rx < F.roomR - 16) { // gần tường: chỉ còn chỗ cho biểu tượng
                const mini = { ...s, l: '', t: '' };
                hudDrawChip(F, mini, rx, dMid, 13); rx += 15;
            }
        }
    }
    ctx.restore();
}

// Toạ độ hàng HUD cho code body muốn xếp thanh riêng không đè HUD chung:
// row 'hp' | 'ammo' | 'extra' -> y (mép gần xe) theo phía của người chơi
function hudRowY(p, row) {
    const d = row === 'hp' ? 2 : (row === 'ammo' ? 9.5 : 12);
    return p.id === 1 ? p.y + p.h + d : p.y - d;
}


// ---------- Hàng phụ (thanh / chip riêng của body), xếp ngoài HUD chung, không đè HP/đạn ----------
// Hàng i cách mép xe d = 13.5 + 5i (P1 dưới gầm, P2 trên nóc). Sát mép màn hình chỉ còn ~8px -> tối đa
// 1-2 thanh mảnh (i = 0 / 0.7). Chip (cao 11) & chấm đặt ở PHÍA TRƯỚC xe (hướng địch): o.d = hudNearD(p, off, h).
function hudExtraD(i) { return 13.5 + (i || 0) * 5; }
// d của 1 phần tử cao h đặt trước mũi xe, cách xe off px (d âm = phía địch)
function hudNearD(p, off, h) { return -(p.h + (off || 0) + (h || 0)); }
function hudBarWidth(p) { return Math.max(40, Math.min(54, p.w + 14)); }
// Thanh tiến độ ở hàng phụ i: k 0..1; o.cx (vẽ tại toạ độ x khác, vd. bản sao), o.h, o.marks [0..1], o.bg
function hudExtraBar(p, i, k, color, o) {
    o = o || {};
    const F = hudFrame(p, o.cx);
    const BW = o.w || hudBarWidth(p), bx = -BW / 2, d = o.d !== undefined ? o.d : hudExtraD(i), h = o.h || 3;
    ctx.save();
    ctx.fillStyle = o.bg || 'rgba(4, 8, 18, 0.85)';
    hudRRect(F, bx - 1, d - 1, BW + 2, h + 2, 1.5); ctx.fill();
    ctx.fillStyle = color; ctx.shadowBlur = o.glow === 0 ? 0 : 5; ctx.shadowColor = color;
    hudFill(F, bx, d, BW * Math.max(0, Math.min(1, k || 0)), h);
    ctx.shadowBlur = 0;
    if (o.marks) {
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        for (const m of o.marks) hudFill(F, bx + BW * m - 0.5, d - 1.5, 1, h + 3);
    }
    ctx.restore();
    return { F, d, BW };
}
// Dãy chip nhỏ [biểu tượng + số] căn giữa ở hàng phụ i (o.d: đặt chỗ khác, vd. trước mũi xe). chips: [{ g, c, l }]
function hudExtraChips(p, i, chips, o) {
    o = o || {};
    if (!chips || !chips.length) return;
    const F = hudFrame(p);
    ctx.save();
    const ws = chips.map(s => hudChipWidth(s));
    const total = ws.reduce((a, b) => a + b, 0) + 3 * (chips.length - 1);
    let lx = -total / 2;
    const dMid = (o.d !== undefined ? o.d : hudExtraD(i)) + 5.5;
    chips.forEach((s, j) => { hudDrawChip(F, s, lx, dMid, ws[j]); lx += ws[j] + 3; });
    ctx.restore();
}
// Dãy chấm (pip) ở hàng phụ i: n ô, lit sáng; o.active = chỉ số ô đang chọn (sáng mạnh)
function hudExtraPips(p, i, n, lit, color, o) {
    o = o || {};
    const F = hudFrame(p, o.cx);
    const pw = o.pw || 6, gap = o.gap || 2, h = o.h || 3;
    const total = n * pw + (n - 1) * gap;
    const d = o.d !== undefined ? o.d : hudExtraD(i);
    ctx.save();
    for (let j = 0; j < n; j++) {
        const on = o.active !== undefined ? j === o.active : j < lit;
        ctx.fillStyle = on ? color : 'rgba(255,255,255,0.16)';
        ctx.shadowBlur = on ? 5 : 0; ctx.shadowColor = color;
        hudRRect(F, -total / 2 + j * (pw + gap), d, pw, h, 1); ctx.fill();
    }
    ctx.restore();
}
