// ==========================================
// COC — Hình ảnh: xe sòng bạc tím đen viền vàng, xúc xắc vận mệnh lăn trên đầu xe (+ xúc xắc phụ tím/vàng),
// nòng đổi theo vũ khí, Búp Bê L/R, Phân Ảnh, đạn / tia / vùng lửa, HUD và kết liễu ĐỊNH MỆNH AN BÀI.
// Chỉ đọc state -> an toàn online.
// ==========================================

function cocNow() { return Date.now() / 1000; }
const COC_PIPS = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };
function cocGuestFlip() { return typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest'; }

// Xúc xắc (tâm x,y; cạnh s; mặt face; màu thân/chấm/viền)
function cocDie(x, y, s, face, rot, body, pip, glow) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0);
    if (glow) TA.glow(glow, s * 0.7);
    const g = ctx.createLinearGradient(-s / 2, -s / 2, s / 2, s / 2);
    g.addColorStop(0, '#ffffff'); g.addColorStop(1, body);
    ctx.fillStyle = g; TA.rr(-s / 2, -s / 2, s, s, s * 0.22); ctx.fill(); TA.noGlow();
    ctx.strokeStyle = glow || 'rgba(0,0,0,0.4)'; ctx.lineWidth = Math.max(0.8, s * 0.07); ctx.stroke();
    ctx.fillStyle = pip;
    (COC_PIPS[face] || COC_PIPS[1]).forEach(([a, b]) => { ctx.beginPath(); ctx.arc(a * s * 0.26, b * s * 0.26, s * (face === 1 ? 0.14 : 0.09), 0, Math.PI * 2); ctx.fill(); });
    ctx.restore();
}

// ---------- Xe COC ----------
registerTankArt('coc', (p, k) => {
    const t = k.t, w = p.cocW || 6, d = COC_W[w], rec = (p.cocRecoil || 0) / 14;
    TA.treads(-15, 4.4, -11, 13, t, '#1e1b4b', '#6d28d9');
    ctx.fillStyle = TA.metal(-10.5, 10.5, '#2e1065', '#7c3aed');
    TA.rr(-10.5, -9.5, 21, 22, 5); ctx.fill();
    ctx.strokeStyle = COC_GOLD; ctx.lineWidth = 1.2; TA.glow(d.c, 6); ctx.stroke(); TA.noGlow();
    ctx.strokeStyle = k.team; ctx.lineWidth = 0.8; TA.rr(-8.5, -7.5, 17, 18, 4); ctx.stroke();
    // bàn cược: ô xanh + 2 chip
    ctx.fillStyle = '#064e3b'; TA.rr(-6.5, 2, 13, 8, 2); ctx.fill();
    ctx.fillStyle = COC_RED; ctx.beginPath(); ctx.arc(-3.5, 6, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = COC_GOLD; ctx.beginPath(); ctx.arc(3.5, 6, 2, 0, Math.PI * 2); ctx.fill();
    // nòng theo vũ khí
    const ny = -5 + rec * 3;
    TA.glow(d.c, 8);
    if (w === 1) TA.barrel(0, ny, 11, 2.6, '#e0f2fe', d.c);
    else if (w === 2) { TA.barrel(-2, ny, 10, 2, '#ecfccb', d.c); TA.barrel(2, ny, 10, 2, '#ecfccb', d.c); }
    else if (w === 3) TA.barrel(0, ny, 11, 5.5, '#fed7aa', d.c);
    else if (w === 4) { ctx.fillStyle = '#ffe4e6'; ctx.beginPath(); ctx.moveTo(-1.8, ny); ctx.lineTo(0, ny - 13); ctx.lineTo(1.8, ny); ctx.closePath(); ctx.fill(); }
    else if (w === 5) { ctx.fillStyle = d.c; ctx.beginPath(); ctx.arc(0, ny - 4, 3, 0, Math.PI * 2); ctx.fill(); }
    else TA.barrel(0, ny, 13, 3.4, '#fef3c7', d.c);
    TA.noGlow();
    // xúc xắc trên nóc xe
    cocDie(0, -1.5, 8, w, (p.cocDiceFx || 0) * 0.3, '#ddd6fe', '#1e1b4b', k.full ? COC_GOLD : null);
    if (k.evo2) { ctx.fillStyle = COC_PURP; ctx.fillRect(-10, 11, 20, 1.2); }
    if (k.evo1) { ctx.fillStyle = COC_GOLD; ctx.beginPath(); ctx.arc(-8, -7, 1, 0, Math.PI * 2); ctx.arc(8, -7, 1, 0, Math.PI * 2); ctx.fill(); }
});

// ---------- Đạn ----------
function cocDrawBullet(b) {
    const x = b.x + b.w / 2, y = b.y + b.h / 2, an = Math.atan2(b.vy || 0, b.vx || 0);
    const c = b.cocK === 0 ? COC_CYAN : (COC_W[b.cocK] || COC_W[1]).c;
    ctx.save();
    ctx.globalAlpha = b.cocShade ? 0.75 : 1;
    ctx.translate(x, y);
    if (b.cocK === 4) { // kiếm khí lưỡi liềm
        ctx.rotate(an - Math.PI / 2);
        ctx.shadowBlur = 14; ctx.shadowColor = c; ctx.strokeStyle = b.cocCrit ? '#fff1f2' : c; ctx.lineWidth = b.cocCrit ? 3.5 : 2.5;
        ctx.beginPath(); ctx.arc(0, -4, 13, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke();
    } else if (b.cocK === 3) {
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 10);
        g.addColorStop(0, '#fff7ed'); g.addColorStop(0.45, c); g.addColorStop(1, 'rgba(251,146,60,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#431407'; ctx.beginPath(); ctx.arc(0, 0, 3.5, 0, Math.PI * 2); ctx.fill();
    } else if (b.cocK === 6) {
        ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 14);
        g.addColorStop(0, 'rgba(255,255,255,0.95)'); g.addColorStop(0.4, 'rgba(252,211,77,0.7)'); g.addColorStop(1, 'rgba(252,211,77,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        ctx.shadowBlur = 14; ctx.shadowColor = c; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(0, 0, 4.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#78350f'; ctx.font = "900 6px Arial"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('$', 0, 0.5);
    } else {
        ctx.rotate(an);
        const L = b.cocK === 1 ? 6 : 4, W = b.cocK === 1 ? 2.2 : 1.6;
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = c; ctx.globalAlpha *= 0.5; ctx.lineWidth = W * 1.4; ctx.beginPath(); ctx.moveTo(-L * 3, 0); ctx.lineTo(0, 0); ctx.stroke();
        ctx.globalAlpha = b.cocShade ? 0.75 : 1; ctx.globalCompositeOperation = 'source-over';
        ctx.shadowBlur = 10; ctx.shadowColor = c; ctx.fillStyle = b.cocBypass ? '#ffffff' : c;
        ctx.beginPath(); ctx.ellipse(0, 0, L, W, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
}
function cocDrawLaser(l) {
    const o = l.owner, top = o.id === 1 ? 0 : o.y + o.h, bot = o.id === 1 ? o.y : canvas.height;
    ctx.save();
    if (l.delay > 0) {
        const k = 1 - l.delay / 30;
        ctx.strokeStyle = `rgba(232, 121, 249, ${0.4 + 0.5 * k})`; ctx.lineWidth = 1 + k * 1.5; ctx.setLineDash([6, 4]); ctx.lineDashOffset = -cocNow() * 40;
        ctx.beginPath(); ctx.moveTo(l.x, top); ctx.lineTo(l.x, bot); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = `rgba(232,121,249,${0.6 * k})`; ctx.beginPath(); ctx.arc(l.x, o.y + o.h / 2 + 4, 4 + k * 6, 0, Math.PI * 2); ctx.fill();
    } else {
        const a = 1 - l.flash / 12;
        ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a;
        ctx.fillStyle = 'rgba(232,121,249,0.45)'; ctx.fillRect(l.x - l.width, top, l.width * 2, bot - top);
        ctx.shadowBlur = 18; ctx.shadowColor = '#e879f9'; ctx.fillStyle = '#fdf4ff';
        ctx.fillRect(l.x - l.width * 0.3, top, l.width * 0.6, bot - top);
    }
    ctx.restore();
}
function cocDrawFireZone(z) {
    const a = Math.min(1, z.life / 30) * (z.kind === 'trail' ? 0.55 : 0.75), t = cocNow();
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a;
    const g = ctx.createRadialGradient(z.x, z.y, 0, z.x, z.y, z.r);
    g.addColorStop(0, 'rgba(254,240,138,0.9)'); g.addColorStop(0.45, 'rgba(249,115,22,0.6)'); g.addColorStop(1, 'rgba(220,38,38,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(z.x, z.y, z.r * (0.9 + 0.1 * Math.sin(t * 12 + z.x)), 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}
function cocDrawBolt(bo) {
    const a = 1 - bo.t / 16;
    ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = bo.color; ctx.lineWidth = 2.5; ctx.shadowBlur = 14; ctx.shadowColor = bo.color;
    ctx.beginPath(); ctx.moveTo(bo.x1, bo.y1);
    for (let i = 1; i < 8; i++) {
        const k = i / 8, jx = Math.sin(bo.seed + i * 7.3 + bo.t) * 10;
        ctx.lineTo(bo.x1 + (bo.x2 - bo.x1) * k + jx, bo.y1 + (bo.y2 - bo.y1) * k);
    }
    ctx.lineTo(bo.x2, bo.y2); ctx.stroke();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 0.8; ctx.stroke();
    ctx.restore();
}
function cocDrawSlash(s) {
    const k = s.t / 14, c = s.crit ? '#fff1f2' : '#f43f5e';
    ctx.save(); ctx.globalAlpha = 1 - k; ctx.strokeStyle = c; ctx.shadowBlur = 16; ctx.shadowColor = '#f43f5e';
    ctx.lineWidth = s.crit ? 5 : 3.5;
    const a0 = k * Math.PI * 3;
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r * (0.7 + 0.3 * k), a0, a0 + Math.PI * 1.6); ctx.stroke();
    ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(s.x, s.y, s.r * (0.55 + 0.3 * k), a0 + Math.PI, a0 + Math.PI * 2.2); ctx.stroke();
    ctx.restore();
}

// ---------- Búp Bê L/R, Phân Ảnh, xúc xắc phụ ----------
function cocDrawDoll(x, y, side, ready, charging, fx, t) {
    const bob = Math.sin(t * 4 + side) * 1.5;
    ctx.save(); ctx.translate(x, y + bob);
    TA.glow(side < 0 ? '#e879f9' : '#c084fc', ready ? 10 : 3);
    ctx.fillStyle = side < 0 ? '#f5d0fe' : '#e9d5ff';
    ctx.beginPath(); ctx.moveTo(-5, 6); ctx.lineTo(5, 6); ctx.lineTo(3, -1); ctx.lineTo(-3, -1); ctx.closePath(); ctx.fill(); // váy
    ctx.beginPath(); ctx.arc(0, -4, 3.6, 0, Math.PI * 2); ctx.fill(); TA.noGlow(); // đầu
    ctx.fillStyle = '#1e1b4b'; ctx.fillRect(-1.8, -4.6, 1, 1); ctx.fillRect(0.8, -4.6, 1, 1);
    ctx.fillStyle = side < 0 ? '#a21caf' : '#7e22ce'; ctx.fillRect(-3.8, -8, 7.6, 1.6); // nơ
    ctx.font = "bold 5px Arial"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff';
    ctx.fillText(side < 0 ? 'L' : 'R', 0, 3);
    if (charging) { ctx.strokeStyle = '#e879f9'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, 9 + Math.sin(t * 30) * 1.5, 0, Math.PI * 2); ctx.stroke(); }
    if (fx > 0) { ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.arc(0, -2, 3 + fx, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
}
function cocDrawShade(p, t) {
    const sh = p.cocSh; if (!sh || typeof cocShadeX !== 'function') return;
    const x = cocShadeX(p), y = p.y + p.h / 2, d = COC_W[sh.w];
    ctx.save(); ctx.globalAlpha = 0.55 + 0.15 * Math.sin(t * 5);
    TA.glow(d.c, 12);
    ctx.fillStyle = 'rgba(124,58,237,0.6)'; TA.rr(x - 9, y - 9, 18, 18, 4); ctx.fill();
    ctx.strokeStyle = d.c; ctx.lineWidth = 1.2; ctx.stroke(); TA.noGlow();
    cocDie(x, y, 8, sh.w, (sh.fx || 0) * 0.3, '#c4b5fd', '#1e1b4b', null);
    ctx.globalAlpha = 0.9; ctx.font = "bold 6px Arial"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = d.c;
    ctx.save(); ctx.translate(x, y + (p.id === 1 ? 15 : -15)); if (cocGuestFlip()) ctx.rotate(Math.PI);
    ctx.fillText('ẢNH · ' + d.n, 0, 0); ctx.restore();
    ctx.restore();
}
function cocDrawDiceAbove(p, t) {
    const cx = p.x + p.w / 2, up = p.id === 1 ? -1 : 1, base = p.id === 1 ? p.y - 16 : p.y + p.h + 16;
    const f = p.cocDiceFx || 0;
    if (f > 0) { // xúc xắc lăn nảy trên đầu xe
        const k = 1 - f / 46, hgt = Math.abs(Math.sin(k * Math.PI * 2.2)) * 14 * (1 - k);
        const face = k < 0.75 ? 1 + Math.floor(t * 18) % 6 : p.cocW;
        cocDie(cx - (p.cocP && p.cocP.length ? 9 : 0), base + up * hgt, 13, face, (1 - k) * 8, '#ede9fe', '#1e1b4b', COC_W[p.cocW].c);
        if (p.cocP && p.cocP.length) p.cocP.forEach((id, i) => {
            const fc = k < 0.8 ? 1 + Math.floor(t * 15 + i * 3) % 6 : id;
            cocDie(cx + 9 + i * 13, base + up * hgt * 0.8, 10, fc, -(1 - k) * 7, i === 0 ? '#c084fc' : '#fbbf24', '#fff', i === 0 ? COC_PURP : COC_GOLD);
        });
    }
}

CharHooks.register('coc', Object.assign(CharHooks.registry.coc || {}, {
    draw() {
        const t = cocNow(), p = this;
        if (p.hp <= 0) return;
        // Evo 1: vòng giữ ReRoll
        if (cocE1(p) && p.cocHold > 6 && !p.cocHoldUsed && !(p.cocRerollCd > 0)) {
            const k = Math.min(1, p.cocHold / COC_HOLD);
            ctx.save(); ctx.strokeStyle = COC_GOLD; ctx.lineWidth = 2; ctx.shadowBlur = 8; ctx.shadowColor = COC_GOLD;
            ctx.beginPath(); ctx.arc(p.x + p.w / 2, p.y + p.h / 2, p.w * 0.95, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); ctx.stroke(); ctx.restore();
        }
        // hào quang nội tại
        if (p.cocP && p.cocP.length) {
            ctx.save();
            p.cocP.forEach((id, i) => {
                ctx.strokeStyle = COC_P[id].c; ctx.globalAlpha = 0.55; ctx.lineWidth = 1.3; ctx.shadowBlur = 8; ctx.shadowColor = COC_P[id].c;
                ctx.setLineDash([2, 5]); ctx.lineDashOffset = (i ? 1 : -1) * t * 18;
                ctx.beginPath(); ctx.arc(p.x + p.w / 2, p.y + p.h / 2, p.w * (0.82 + i * 0.12), 0, Math.PI * 2); ctx.stroke();
            });
            ctx.restore();
        }
        if (p.cocW === 5) {
            const L = cocDollPos(p, -1), R = cocDollPos(p, 1);
            const charging = bodyEffects.some(e => e instanceof CocLaser && e.owner === p && e.delay > 0);
            cocDrawDoll(L.x, L.y, -1, !(p.cocLcd > 0), charging, 0, t);
            cocDrawDoll(R.x, R.y, 1, !(p.cocRcd > 0), false, p.cocRFx || 0, t);
        }
        if (p.cocSh) cocDrawShade(p, t);
        cocDrawDiceAbove(p, t);
    },
    drawUI() {
        if (this.hp <= 0 || typeof hudRowY !== 'function' || !this.cocW) return;
        const y = hudRowY(this, 'extra') + (this.id === 1 ? 2 : -2), cx = this.x + this.w / 2, w = 26, d = COC_W[this.cocW];
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(cx - w / 2, y - 1.5, w, 3);
        ctx.fillStyle = d.c; ctx.shadowBlur = 6; ctx.shadowColor = d.c;
        ctx.fillRect(cx - w / 2, y - 1.5, w * Math.max(0, Math.min(1, (this.cocWT || 0) / COC_WEAPON_T)), 3);
        ctx.shadowBlur = 0;
        (this.cocP || []).forEach((id, i) => {
            ctx.fillStyle = COC_P[id].c; ctx.beginPath(); ctx.arc(cx + w / 2 + 4 + i * 5, y, 1.8, 0, Math.PI * 2); ctx.fill();
        });
        ctx.restore();
    },
}));

// ---------- Kết liễu "ĐỊNH MỆNH AN BÀI" ----------
function cocDrawFinisherOver(f) {
    const t = f.t, W = canvas.width, H = canvas.height;
    const fade = t > 108 ? Math.max(0, 1 - (t - 108) / 22) : 1;
    ctx.save();
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = `rgba(12, 4, 30, ${0.6 * Math.min(1, t / 10) * fade})`; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
    ctx.globalAlpha = fade;
    const fall = 26;
    if (t < fall) { // xúc xắc khổng lồ rơi từ trời
        const k = t / fall, sy = f.team === 1 ? -80 : H + 80, y = sy + (f.y - sy) * k * k, s = 54 + 30 * (1 - k);
        ctx.save(); ctx.globalAlpha = 0.35 * k; ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.ellipse(f.x, f.y + 8, 40 * k, 12 * k, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        cocDie(f.x, y, s, 1 + Math.floor(t / 3) % 6, k * 6, '#c4b5fd', '#1e1b4b', COC_PURP);
    } else { // đè bẹp: số 6 nổ tung
        const k = Math.min(1, (t - fall) / 30);
        const s = 54 * (1 - k * 0.25);
        if (t < fall + 22) cocDie(f.x, f.y, s, 6, 0, '#fef3c7', COC_RED, COC_GOLD);
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 6; i++) { // 6 chấm văng ra
            const a = i * Math.PI / 3 + 0.4, R = 20 + 160 * k;
            ctx.globalAlpha = fade * (1 - k);
            ctx.fillStyle = i % 2 ? COC_GOLD : COC_PURP; ctx.shadowBlur = 16; ctx.shadowColor = ctx.fillStyle;
            ctx.beginPath(); ctx.arc(f.x + Math.cos(a) * R, f.y + Math.sin(a) * R, 7 * (1 - k * 0.5), 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = fade * (1 - k) * 0.8; ctx.strokeStyle = COC_GOLD; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(f.x, f.y, 30 + 200 * k, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
    }
    // chữ
    if (t >= fall + 4) {
        const a = Math.min(1, (t - fall - 4) / 8) * fade;
        ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.translate(Math.max(120, Math.min(W - 120, f.x)), f.y + (f.team === 1 ? 110 : -110));
        if (cocGuestFlip()) ctx.rotate(Math.PI);
        const sc = t < fall + 14 ? 1.6 - (t - fall - 4) / 10 * 0.6 : 1; ctx.scale(sc, sc);
        ctx.font = "900 24px 'Orbitron', Arial"; ctx.lineWidth = 5; ctx.strokeStyle = '#000';
        ctx.shadowBlur = 22; ctx.shadowColor = COC_PURP; ctx.fillStyle = COC_GOLD;
        ctx.strokeText('ĐỊNH MỆNH AN BÀI', 0, 0); ctx.fillText('ĐỊNH MỆNH AN BÀI', 0, 0);
        ctx.font = "bold 11px 'Orbitron', Arial"; ctx.fillStyle = '#e9d5ff'; ctx.shadowBlur = 8;
        ctx.strokeText('⚅ THE CHANGE OR CHANCE ⚅', 0, 22); ctx.fillText('⚅ THE CHANGE OR CHANCE ⚅', 0, 22);
        ctx.restore();
    }
    ctx.restore();
}
function cocFxOver() {
    if (typeof bodyEffects === 'undefined') return;
    for (const e of bodyEffects) if (e instanceof CocFinisher && e.active) e.drawOver();
}

function cocRegisterHUD() {
    if (typeof registerEmpowerHUD !== 'function') return;
    registerEmpowerHUD('coc', p => {
        const d = COC_W[p.cocW] || COC_W[6], tl = Math.ceil((p.cocWT || 0) / 60) + 's';
        if (cocE1(p) && p.cocHold > 0 && !p.cocHoldUsed && !(p.cocRerollCd > 0)) return { pct: Math.min(1, p.cocHold / COC_HOLD), ready: p.cocHold >= COC_HOLD, color: COC_GOLD, label: 'REROLL...', btnIcon: '🎲' };
        if (p.cocReload > 0) return { pct: 0.3, ready: false, color: '#94a3b8', label: d.n + ' · NẠP', btnIcon: '🎲', dim: true };
        let lab = d.n + ' ' + tl;
        if (p.cocW === 5) lab += (p.cocLcd > 0 ? ' · L ' + Math.ceil(p.cocLcd / 60) + 's' : ' · L SẴN');
        if (cocE1(p)) lab += p.cocRerollCd > 0 ? ' · RR ' + Math.ceil(p.cocRerollCd / 60) + 's' : ' · GIỮ: REROLL';
        return { pct: Math.max(0, Math.min(1, (p.cocWT || 0) / COC_WEAPON_T)), ready: true, color: d.c, label: lab, btnIcon: '🎲' };
    });
}
if (typeof window !== 'undefined') window.addEventListener('load', cocRegisterHUD);

// ---------- Đoản Đao: Ảnh Đao (mờ dần / ẩn + vạch cảnh báo sau lưng địch / vệt lao) ----------
function cocDrawLungeWarn(p) {
    const t = cocNow(), H = canvas.height, cx = (p.cocLX || p.x) + p.w / 2, e = cocEnemy(p);
    const k = Math.min(1, (p.cocLT || 0) / COC_WARN_T), dir = cocDir(p);
    const edge = p.id === 1 ? 0 : H;
    const ey = e ? (e.id === 1 ? H - e.h - 22 : 20) : (p.id === 1 ? 20 : H - 60);
    const far = e ? (p.id === 1 ? ey + e.h + 34 : ey - 34) : H / 2;
    ctx.save();
    // cột cảnh báo xuyên qua làn địch
    ctx.globalAlpha = 0.16 + 0.22 * k;
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(cx - p.w / 2, Math.min(edge, far), p.w, Math.abs(far - edge));
    ctx.globalAlpha = 1;
    // vạch đỏ sau lưng địch (mép sân)
    const by = p.id === 1 ? 4 : H - 4;
    ctx.strokeStyle = '#ff2d55'; ctx.lineWidth = 3; ctx.shadowBlur = 14; ctx.shadowColor = '#ff2d55';
    ctx.beginPath(); ctx.moveTo(cx - p.w * 0.9, by); ctx.lineTo(cx + p.w * 0.9, by); ctx.stroke();
    // mũi tên chỉ hướng lao (về phía làn COC)
    const ay = by - dir * (8 + 4 * Math.sin(t * 20));
    ctx.fillStyle = '#ff2d55';
    ctx.beginPath(); ctx.moveTo(cx - 8, ay); ctx.lineTo(cx + 8, ay); ctx.lineTo(cx, ay - dir * 10); ctx.closePath(); ctx.fill();
    ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]); ctx.lineDashOffset = -t * 40 * dir;
    ctx.beginPath(); ctx.moveTo(cx, by); ctx.lineTo(cx, far); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
}
(function () {
    const origD = Player.prototype.draw;
    Player.prototype.draw = function () {
        if (cocIs(this) && this.cocLunge > 0 && this.hp > 0) {
            const m = this.cocLM;
            if (m === 'warn') { cocDrawLungeWarn(this); return; }
            if (m === 'fade') {
                ctx.save(); ctx.globalAlpha = Math.max(0, 1 - (this.cocLT || 0) / COC_FADE_T);
                const r = origD.apply(this, arguments); ctx.restore(); return r;
            }
            if (m === 'dash' || m === 'go') {
                ctx.save(); const back = m === 'dash' ? cocDir(this) : -cocDir(this);
                for (let i = 1; i <= 4; i++) { ctx.globalAlpha = 0.3 - i * 0.06; ctx.fillStyle = '#f43f5e'; ctx.fillRect(this.x + 4, this.y + back * i * 14, this.w - 8, this.h); }
                ctx.restore();
            }
        }
        return origD.apply(this, arguments);
    };
})();
