// ==========================================
// Joker (joker) — Hình ảnh: xe hề ảo thuật neon (mũ hề 3 chóp, mặt nạ, lá bài), lá bài xoay,
// HUD tay bài cạnh xe + nút Bắn, hình nhân, Phán Quyết, kết liễu ALL IN.
// Chỉ đọc state (không tạo state mới) -> an toàn online.
// ==========================================

function jkNow() { return Date.now() / 1000; }

// Biểu tượng chất bài vector (tâm x,y, cỡ r)
function jkGlyph(s, x, y, r, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color || JK_SUIT[s].c;
    ctx.beginPath();
    if (s === 'H') {
        ctx.moveTo(0, r * 0.9);
        ctx.bezierCurveTo(-r * 1.3, -r * 0.1, -r * 0.6, -r * 1.1, 0, -r * 0.35);
        ctx.bezierCurveTo(r * 0.6, -r * 1.1, r * 1.3, -r * 0.1, 0, r * 0.9);
    } else if (s === 'D') {
        ctx.moveTo(0, -r); ctx.lineTo(r * 0.72, 0); ctx.lineTo(0, r); ctx.lineTo(-r * 0.72, 0);
    } else if (s === 'C') {
        ctx.arc(0, -r * 0.45, r * 0.42, 0, Math.PI * 2);
        ctx.moveTo(-r * 0.4 + r * 0.42, r * 0.12); ctx.arc(-r * 0.45, r * 0.12, r * 0.42, 0, Math.PI * 2);
        ctx.moveTo(r * 0.45 + r * 0.42, r * 0.12); ctx.arc(r * 0.45, r * 0.12, r * 0.42, 0, Math.PI * 2);
        ctx.moveTo(-r * 0.15, 0); ctx.lineTo(r * 0.15, 0); ctx.lineTo(r * 0.3, r); ctx.lineTo(-r * 0.3, r);
    } else if (s === 'S') {
        ctx.moveTo(0, -r);
        ctx.bezierCurveTo(r * 1.3, -r * 0.1, r * 0.6, r * 0.8, 0, r * 0.3);
        ctx.bezierCurveTo(-r * 0.6, r * 0.8, -r * 1.3, -r * 0.1, 0, -r);
        ctx.moveTo(-r * 0.12, r * 0.2); ctx.lineTo(r * 0.12, r * 0.2); ctx.lineTo(r * 0.32, r); ctx.lineTo(-r * 0.32, r);
    } else if (s === 'J') {
        // mũ hề 3 chóp + chuông
        ctx.moveTo(-r, r * 0.5); ctx.quadraticCurveTo(-r * 0.9, -r * 0.4, -r * 0.95, -r * 0.8);
        ctx.quadraticCurveTo(-r * 0.4, -r * 0.3, 0, -r); ctx.quadraticCurveTo(r * 0.4, -r * 0.3, r * 0.95, -r * 0.8);
        ctx.quadraticCurveTo(r * 0.9, -r * 0.4, r, r * 0.5); ctx.closePath();
        ctx.fill();
        ctx.fillStyle = JK_GOLD; ctx.beginPath();
        for (const [bx, by] of [[-r * 0.95, -r * 0.8], [0, -r], [r * 0.95, -r * 0.8]]) { ctx.moveTo(bx + r * 0.22, by); ctx.arc(bx, by, r * 0.22, 0, Math.PI * 2); }
        ctx.fillRect(-r, r * 0.35, r * 2, r * 0.3);
    } else {
        ctx.arc(0, 0, r * 0.25, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.restore();
}

function jkCardColor(card) {
    const s = jkSuitOf(card);
    if (s !== 'J') return JK_SUIT[s].c;
    return card[1] === 'R' ? '#f43f5e' : (card[1] === 'B' ? '#c4b5fd' : JK_PURPLE);
}

// Lá bài (tâm x,y; w,h; rot; sx = co giãn ngang để xoay lật)
function jkCard(x, y, w, h, rot, sx, card, alpha = 1, glow = 8) {
    const s = jkSuitOf(card), J = s === 'J', col = jkCardColor(card);
    ctx.save();
    ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sx || 1, 1);
    ctx.globalAlpha *= alpha;
    ctx.shadowBlur = glow; ctx.shadowColor = col;
    const back = (sx || 1) < 0;
    let g;
    if (J) { g = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2); g.addColorStop(0, '#1e0b3a'); g.addColorStop(0.5, card[1] === 'R' ? '#4c0519' : '#2e1065'); g.addColorStop(1, '#0b0618'); }
    ctx.fillStyle = back ? '#3b0764' : (J ? g : '#f8fafc');
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(-w / 2, -h / 2, w, h, Math.min(w, h) * 0.18); else ctx.rect(-w / 2, -h / 2, w, h);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = J ? JK_GOLD : col; ctx.lineWidth = Math.max(0.6, w * 0.08); ctx.stroke();
    if (back) {
        ctx.strokeStyle = 'rgba(253, 224, 71, 0.6)'; ctx.lineWidth = Math.max(0.4, w * 0.05);
        ctx.strokeRect(-w * 0.32, -h * 0.34, w * 0.64, h * 0.68);
        jkGlyph('D', 0, 0, Math.min(w, h) * 0.22, JK_GOLD);
    } else {
        jkGlyph(s, 0, 0, Math.min(w * 0.36, h * 0.3), J ? col : undefined);
        if (w >= 14 && !J) { jkGlyph(s, -w * 0.3, -h * 0.34, w * 0.1); jkGlyph(s, w * 0.3, h * 0.34, w * 0.1); }
    }
    ctx.restore();
}

// ---------- Xe ----------
registerTankArt('joker', (p, k) => {
    const t = k.t;
    const inv = (p.jkInvis || 0) > 0;
    if (inv) ctx.globalAlpha *= 0.35;
    const accent = k.full ? JK_GOLD : (k.evo2 ? JK_PINK : JK_PURPLE);
    // bánh xích tím đậm
    TA.treads(-14, 4, -10, 12, t, '#140a24', '#4c1d95');
    // thân: hình thoi lá bài (lớp ngoài) + viền team
    ctx.fillStyle = TA.vgrad(-13, 13, '#2e1065', '#0b0618');
    ctx.beginPath(); ctx.moveTo(0, -13.5); ctx.lineTo(10.5, -2); ctx.lineTo(9, 9); ctx.lineTo(0, 13); ctx.lineTo(-9, 9); ctx.lineTo(-10.5, -2); ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = k.team; ctx.lineWidth = 0.9; TA.glow(k.teamGlow, 6); ctx.stroke(); TA.noGlow();
    // ô quả trám đen/tím kiểu áo hề
    ctx.fillStyle = 'rgba(168, 85, 247, 0.35)';
    for (const [dx, dy] of [[-5.5, 3], [5.5, 3], [0, 8]]) {
        ctx.beginPath(); ctx.moveTo(dx, dy - 3); ctx.lineTo(dx + 2.4, dy); ctx.lineTo(dx, dy + 3); ctx.lineTo(dx - 2.4, dy); ctx.closePath(); ctx.fill();
    }
    // quạt bài phía trước (nòng = 3 lá bài xoè)
    const fan = (p.jkThrowFx || 0) > 0 ? 0.55 : 0.35;
    ['S', 'H', 'J'].forEach((s, i) => {
        const ii = [-1, 1, 0][i];
        ctx.save(); ctx.translate(0, -4); ctx.rotate(ii * fan);
        jkCard(0, -8.5, 7, 10, 0, 1, s, 1, 5);
        ctx.restore();
    });
    // mặt nạ hề
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath(); ctx.arc(0, 1, 5.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0b0618';
    ctx.beginPath(); ctx.moveTo(-4, -0.2); ctx.lineTo(-1.2, 0.6); ctx.lineTo(-3.6, 2); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(4, -0.2); ctx.lineTo(1.2, 0.6); ctx.lineTo(3.6, 2); ctx.closePath(); ctx.fill();
    // nụ cười đỏ
    ctx.strokeStyle = '#f43f5e'; ctx.lineWidth = 0.9; TA.glow('#f43f5e', 4);
    ctx.beginPath(); ctx.arc(0, 2.6, 2.6, 0.25, Math.PI - 0.25); ctx.stroke(); TA.noGlow();
    // ngôi sao má
    ctx.fillStyle = accent; ctx.fillRect(2.9, 3.4, 1, 1);
    // mũ hề 3 chóp phía sau (đong đưa)
    const sw = Math.sin(t * 4) * 0.8;
    const hatC = ['#7c3aed', '#f43f5e', '#7c3aed'];
    [[-1, -9.5], [0, 0], [1, 9.5]].forEach(([i, hx], j) => {
        ctx.fillStyle = hatC[j];
        ctx.beginPath(); ctx.moveTo(hx * 0.35 - 3, 5); ctx.lineTo(hx * 0.35 + 3, 5);
        const tx = hx + sw * (i || 0.5), ty = 13.5 - Math.abs(i) * 2;
        ctx.lineTo(tx, ty); ctx.closePath(); ctx.fill();
        ctx.fillStyle = JK_GOLD; TA.glow(JK_GOLD, 5);
        ctx.beginPath(); ctx.arc(tx, ty, 1.3, 0, Math.PI * 2); ctx.fill(); TA.noGlow();
    });
    // Evo: vòng sao quanh mặt nạ
    if (k.evo1 || k.evo2) {
        ctx.strokeStyle = accent; ctx.lineWidth = 0.5; ctx.globalAlpha *= 0.7;
        ctx.setLineDash([1.2, 2]); ctx.beginPath(); ctx.arc(0, 1, 7.8, t * 2, t * 2 + Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    }
});

// ---------- Đạn lá bài ----------
function jkDrawBullet(b) {
    const x = b.x + b.w / 2, y = b.y + b.h / 2, t = jkNow();
    const card = b.jk + (b.jkV || ''), J = b.jk === 'J';
    ctx.save();
    // vệt sáng
    const col = jkCardColor(card);
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = col; ctx.globalAlpha = 0.45; ctx.lineWidth = J ? 5 : 3;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - (b.vx || 0) * 3, y - (b.vy || 0) * 3); ctx.stroke();
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    const rot = (b.jkT || 0) * (J ? 0.5 : 0.32) * (b.vy < 0 ? 1 : -1);
    const sx = J ? Math.cos(t * 14) : 1;
    jkCard(x, y, J ? 13 : 10, J ? 18 : 14, rot, Math.abs(sx) < 0.15 ? 0.15 * Math.sign(sx || 1) : sx, card, 1, J ? 16 : 8);
    if (b.jkCopy) {
        ctx.strokeStyle = JK_PINK; ctx.lineWidth = 1; ctx.globalAlpha = 0.8;
        ctx.beginPath(); ctx.arc(x, y, 11, 0, Math.PI * 2); ctx.stroke();
    }
    if (b.jkAce && !J) {   // Lá Bài A: viền vàng + chữ A
        ctx.globalAlpha = 1; ctx.strokeStyle = JK_GOLD; ctx.lineWidth = 1; ctx.shadowColor = JK_GOLD; ctx.shadowBlur = 8;
        ctx.strokeRect(x - 7, y - 9, 14, 18);
        ctx.shadowBlur = 0; ctx.font = "800 6px 'Orbitron', Arial"; ctx.fillStyle = JK_GOLD; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('A', x + 9, y - 9);
    }
    ctx.restore();
}

// ---------- Entities ----------
function jkArtAt(owner, x, y, size, alpha) {
    const fn = TANK_ART.joker;
    if (!fn) return;
    const tc = TEAM_COLORS[owner.id] || TEAM_COLORS[1];
    const s = size / 32;
    const k = Object.assign({ t: jkNow(), s }, tc, tankArtEvoState(owner));
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(x, y); ctx.scale(s, owner.id === 1 ? s : -s);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    try { fn({ id: owner.id }, k); } catch (e) { /* bỏ qua */ }
    ctx.restore();
}
function jkDrawDecoy(d) {
    const cx = d.x + d.w / 2, cy = d.y + d.h / 2, t = jkNow();
    ctx.save();
    if (d.pop > 0) {
        const k = 1 - d.pop / 24;
        for (let i = 0; i < 8; i++) {
            const a = i * Math.PI / 4 + k;
            jkCard(cx + Math.cos(a) * 40 * k, cy + Math.sin(a) * 30 * k, 8, 11, a + k * 6, 1, i % 2 ? 'J' : 'S', 1 - k, 6);
        }
        ctx.restore(); return;
    }
    jkArtAt(d.owner, cx, cy, d.w * 1.15, 0.55 + 0.15 * Math.sin(t * 9));
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.7)'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.lineDashOffset = t * 20;
    ctx.beginPath(); ctx.arc(cx, cy, d.w * 0.8, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
}
// Phân Ảnh Bài (copy Cơ Động ♣): bóng hồng nhấp nháy + thanh máu; khi cảm tử -> vệt lao
function jkDrawPhantom(f) {
    const cx = f.x + f.w / 2, cy = f.y + f.h / 2, t = jkNow();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.shadowColor = JK_PINK; ctx.shadowBlur = 12;
    jkArtAt(f.owner, cx, cy, f.w * 1.1, (f.state ? 0.75 : 0.4 + 0.15 * Math.sin(t * 12)));
    ctx.globalCompositeOperation = 'source-over'; ctx.shadowBlur = 0;
    if (f.state) {
        for (let i = 0; i < 3; i++) jkCard(cx + Math.cos(t * 20 + i * 2.1) * 9, cy + Math.sin(t * 20 + i * 2.1) * 9, 6, 8, t * 10 + i, 1, ['C', 'J', 'S'][i], 0.9, 6);
    } else {
        ctx.strokeStyle = 'rgba(244, 114, 182, 0.8)'; ctx.lineWidth = 1; ctx.setLineDash([2, 3]); ctx.lineDashOffset = -t * 25;
        ctx.beginPath(); ctx.arc(cx, cy, f.w * 0.75, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
        const k = Math.max(0, f.hp / (f.maxHp || 1)), bw = f.w;
        ctx.fillStyle = 'rgba(4,8,18,0.8)'; ctx.fillRect(cx - bw / 2, cy + f.h * 0.75, bw, 3);
        ctx.fillStyle = JK_PINK; ctx.fillRect(cx - bw / 2, cy + f.h * 0.75, bw * k, 3);
        ctx.fillStyle = 'rgba(253, 224, 71, 0.8)'; ctx.fillRect(cx - bw / 2, cy + f.h * 0.75 + 3, bw * Math.max(0, f.life / 120), 1);
    }
    ctx.restore();
}
function jkDrawEscapeFx(f) {
    const t = f.t;
    ctx.save();
    if (t < 34) {           // lá Joker xoay đúng 1 vòng
        const k = t / 34, a = k * Math.PI * 2;
        const sc = 1 + Math.sin(k * Math.PI) * 0.4;
        jkCard(f.x, f.y - (f.team === 1 ? 1 : -1) * 8, 22 * sc, 32 * sc, 0, Math.cos(a), 'J', 1, 18);
    } else {                // Joker hiện ra
        const k = (t - 34) / (f.dur - 34);
        ctx.globalAlpha = 1 - k;
        ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 50);
        g.addColorStop(0, 'rgba(253, 224, 71, 0.6)'); g.addColorStop(1, 'rgba(168, 85, 247, 0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x, f.y, 50 * (0.6 + k), 0, Math.PI * 2); ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        jkGlyph('J', f.x, f.y - (f.team === 1 ? 30 : -30), 12 + 6 * k, JK_PURPLE);
        ctx.font = "bold 11px 'Orbitron', Arial"; ctx.textAlign = 'center'; ctx.fillStyle = JK_GOLD;
        ctx.shadowBlur = 8; ctx.shadowColor = JK_PURPLE;
        ctx.fillText('JOKER!', f.x, f.y + (f.team === 1 ? -48 : 56));
    }
    ctx.restore();
}
function jkDrawZone(z) {
    const t = jkNow(), a = Math.min(1, z.life / 20);
    const col = z.kind === 'silence' ? '196, 181, 253' : (z.dot ? '103, 232, 249' : (z.bleed ? '244, 63, 94' : '244, 114, 182'));
    ctx.save();
    ctx.globalAlpha = a;
    zoneRectPath(z.x, z.y, z.r);
    ctx.fillStyle = `rgba(${col}, 0.14)`; ctx.fill();
    ctx.strokeStyle = `rgba(${col}, 0.8)`; ctx.lineWidth = 1.2; ctx.setLineDash([5, 4]); ctx.lineDashOffset = -t * 20; ctx.stroke(); ctx.setLineDash([]);
    for (let i = 0; i < 4; i++) {
        const ax = z.x + Math.cos(t * 1.5 + i * 1.57) * z.r * 0.9, ay = z.y + Math.sin(t * 1.5 + i * 1.57) * z.r * 0.5;
        jkGlyph(z.kind === 'silence' ? 'J' : ['H', 'D', 'C', 'S'][i], ax, ay, 4, `rgba(${col}, 0.9)`);
    }
    ctx.restore();
}
function jkDrawVerdict(v) {
    const t = v.t;
    const above = v.target && v.target.id === 1 ? -1 : 1; // phía "trên đầu" theo làn
    const y = v.y + above * -0 + (v.target && v.target.id === 1 ? -46 : 46);
    ctx.save();
    if (t < v.hitT) {
        const k = t / v.hitT;
        const sx = Math.cos((1 - k) * Math.PI * 3);
        jkCard(v.x, y, 34, 48, 0, sx, 'J', Math.min(1, t / 8), 20);
        ctx.strokeStyle = 'rgba(253, 224, 71, 0.8)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(v.x, v.y, 24, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); ctx.stroke();
    } else {
        const k = (t - v.hitT) / (v.dur - v.hitT);
        ctx.globalAlpha = 1 - k;
        ctx.font = "900 16px 'Orbitron', Arial"; ctx.textAlign = 'center'; ctx.fillStyle = JK_GOLD;
        ctx.shadowBlur = 14; ctx.shadowColor = JK_PURPLE;
        ctx.fillText('SHOWDOWN', v.x, y);
    }
    ctx.restore();
}

// ---------- Kết liễu ALL IN ----------
function jkEase(k) { return 1 - Math.pow(1 - k, 3); }
function jkDrawFinisher(f) {
    if (f.t > 100) return;
    ctx.save();
    const k = f.t / 100;
    ctx.strokeStyle = `rgba(168, 85, 247, ${0.6 * (1 - k)})`; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(f.x, f.y, 20 + 120 * jkEase(k), 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
}
function jkDrawFinisherOver(f) {
    const t = f.t, W = canvas.width, H = canvas.height;
    ctx.save();
    const dark = t < 8 ? t / 8 : (t < 70 ? 1 : Math.max(0, 1 - (t - 70) / 30));
    if (dark > 0) { ctx.fillStyle = `rgba(10, 2, 24, ${0.55 * dark})`; ctx.fillRect(-W, -H, W * 3, H * 3); }
    // bài nổ tung tứ phía
    if (t < 100) {
        const k = jkEase(Math.min(1, t / 50)), fade = t > 70 ? 1 - (t - 70) / 30 : 1;
        const suits = ['H', 'D', 'C', 'S'];
        for (let i = 0; i < 20; i++) {
            const a = f.seed + i * (Math.PI * 2 / 20), d = 14 + (110 + (i % 4) * 22) * k;
            jkCard(f.x + Math.cos(a) * d, f.y + Math.sin(a) * d * 0.8, 11, 15, a + t * 0.2 * (i % 2 ? 1 : -1), Math.cos(t * 0.3 + i), i % 5 === 0 ? 'J' : suits[i % 4], fade, 8);
        }
    }
    // lá Joker khổng lồ lật mặt
    if (t >= 10 && t < 105) {
        const k = Math.min(1, (t - 10) / 26);
        const sx = Math.cos((1 - jkEase(k)) * Math.PI * 2);
        const fade = t > 85 ? 1 - (t - 85) / 20 : 1;
        const sc = 0.6 + 0.4 * jkEase(k);
        ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 110);
        g.addColorStop(0, `rgba(253, 224, 71, ${0.35 * fade})`); g.addColorStop(1, 'rgba(168, 85, 247, 0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x, f.y, 110, 0, Math.PI * 2); ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        jkCard(f.x, f.y, 70 * sc, 100 * sc, f.team === 1 ? 0 : Math.PI, Math.abs(sx) < 0.05 ? 0.05 : sx, 'JR', fade, 26);
    }
    ctx.restore();
    if (t >= 30 && t < 115) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, (t - 30) / 8) * (t > 95 ? 1 - (t - 95) / 20 : 1);
        ctx.font = "900 24px 'Orbitron', Arial"; ctx.textAlign = 'center';
        ctx.shadowBlur = 18; ctx.shadowColor = JK_PURPLE; ctx.fillStyle = JK_GOLD;
        const ty = Math.max(60, Math.min(H - 60, f.y + (f.team === 1 ? 84 : -76)));
        const sc = 1 + Math.max(0, 1 - (t - 30) / 8) * 0.5;
        ctx.translate(W / 2, ty); ctx.scale(sc, sc);
        if (typeof drawWorldText === 'function') drawWorldText(ctx, '♠ ALL IN ♠', 0, 0); else ctx.fillText('♠ ALL IN ♠', 0, 0);
        ctx.restore();
    }
}
function jkFxOver() {
    if (typeof bodyEffects === 'undefined') return;
    for (const e of bodyEffects) if (e instanceof JkFinisher && e.active) e.drawOver();
}

// ---------- Quanh xe + HUD ----------
Object.assign(CharHooks.registry.joker, {
    draw() {
        const cx = this.x + this.w / 2, cy = this.y + this.h / 2, t = jkNow();
        ctx.save();
        // giữ nút: vòng Tráo Bài
        const h = this.jkHold || 0;
        if (h > 5 && !this.jkHoldUsed) {
            ctx.strokeStyle = this.jkSwapCd > 0 ? '#64748b' : JK_GOLD; ctx.shadowColor = JK_GOLD; ctx.shadowBlur = 8; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(cx, cy, this.w * 0.85, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, h / JK_HOLD)); ctx.stroke();
        }
        if (this.jkSwapFx > 0) {
            const a = this.jkSwapFx / 20;
            for (let i = 0; i < 3; i++) jkCard(cx + Math.cos(t * 8 + i * 2.1) * this.w * (1.3 - a * 0.5), cy + Math.sin(t * 8 + i * 2.1) * this.h * 0.8, 7, 10, t * 6 + i, 1, ['H', 'J', 'S'][i], a, 6);
        }
        // bất tử sau Thoát Hiểm: vòng bài xoay
        if ((this.invincibleTimer || 0) > 10 && (this.jkEsc || 0) >= 0 && this.jkInvis <= 0) {
            ctx.strokeStyle = 'rgba(168, 85, 247, 0.55)'; ctx.lineWidth = 1.2; ctx.setLineDash([4, 3]); ctx.lineDashOffset = t * 30;
            ctx.beginPath(); ctx.arc(cx, cy, this.w * 0.95, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
        }
        // Copy đang hoạt động: hào quang hồng
        if (this.jkCopy) {
            ctx.strokeStyle = 'rgba(244, 114, 182, 0.5)'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(cx, cy, this.w * 0.75 + Math.sin(t * 6) * 1.5, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.restore();
    },
    drawUI() {
        if (typeof hudFrame !== 'function') return;
        const F = hudFrame(this);
        const d0 = 12; // = hudRowY(p, 'extra')
        const hand = this.jkHand || [], max = jkHandMax(this);
        const cw = max > 5 ? 5 : 6.5, ch = max > 5 ? 7 : 8.5, gap = 1;
        const total = max * cw + (max - 1) * gap, bx = -total / 2;
        ctx.save();
        if (this.jkReload > 0) {
            const k = 1 - this.jkReload / jkReloadMax(this);
            ctx.fillStyle = 'rgba(4, 8, 18, 0.88)'; hudFill(F, bx - 1, d0 - 1, total + 2, 5);
            ctx.fillStyle = JK_PURPLE; ctx.shadowBlur = 6; ctx.shadowColor = JK_PURPLE;
            hudFill(F, bx, d0, total * k, 3); ctx.shadowBlur = 0;
        } else {
            for (let i = 0; i < max; i++) {
                const r = hudRect(F, bx + i * (cw + gap), d0, cw, ch);
                const c = hand[i];
                if (!c) {
                    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 0.6;
                    ctx.strokeRect(r[0] + 0.3, r[1] + 0.3, r[2] - 0.6, r[3] - 0.6);
                    continue;
                }
                jkCard(r[0] + r[2] / 2, r[1] + r[3] / 2, r[2], r[3], 0, 1, c, i === 0 ? 1 : 0.85, i === 0 ? 6 : 0);
            }
            if (this.jkAllIn) { ctx.font = "800 6px 'Orbitron', Arial"; ctx.fillStyle = JK_GOLD; hudText(F, 'ALL-IN', 0, d0 + ch + 4); }
        }
        // chấm Thoát Hiểm (bên trái) & Tráo Bài (bên phải)
        const escN = Math.max(this.jkEscMax || 1, this.jkEsc || 0);
        // Huy hiệu Lá Bài A (vd. "A♠") + vai trò sao chép tay kế
        if (this.jkAce && JK_SUIT[this.jkAce]) {
            const ax = bx - 6 - escN * 5 - 6;
            ctx.fillStyle = 'rgba(4, 8, 18, 0.85)'; hudRRect(F, ax - 6, d0 - 1, 12, 7, 2); ctx.fill();
            ctx.strokeStyle = JK_SUIT[this.jkAce].c; ctx.lineWidth = 0.7; ctx.stroke();
            ctx.font = "800 5.5px 'Orbitron', Arial"; ctx.fillStyle = JK_SUIT[this.jkAce].c;
            ctx.shadowColor = JK_SUIT[this.jkAce].c; ctx.shadowBlur = 4;
            hudText(F, 'A' + JK_SUIT[this.jkAce].g, ax, d0 + 2.6); ctx.shadowBlur = 0;
        }
        if (this.jkCopyNext) {
            ctx.font = "700 5px 'Orbitron', Arial"; ctx.fillStyle = JK_PINK;
            hudText(F, '⟳ ' + this.jkCopyNext.toUpperCase(), 0, d0 - 4);
        }
        for (let i = 0; i < escN; i++) {
            const r = hudRect(F, bx - 6 - i * 5, d0 + 2, 0, 0);
            ctx.fillStyle = i < (this.jkEsc || 0) ? JK_PURPLE : 'rgba(255,255,255,0.15)';
            ctx.beginPath(); ctx.arc(r[0], r[1], 1.8, 0, Math.PI * 2); ctx.fill();
        }
        const rs = hudRect(F, -bx + 5, d0 + 2, 0, 0);
        ctx.strokeStyle = this.jkSwapCd > 0 ? 'rgba(255,255,255,0.2)' : JK_GOLD; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(rs[0], rs[1], 2.2, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - (this.jkSwapCd || 0) / 240)); ctx.stroke();
        ctx.restore();
    },
});

// Nút Bắn: lá kế tiếp / tiến độ xào bài / giữ Tráo Bài
function jkRegisterHUD() {
    if (typeof registerEmpowerHUD !== 'function') return;
    const ICON = { E: '▫', H: '♥', D: '♦', C: '♣', S: '♠', J: '🃏' };
    registerEmpowerHUD('joker', p => {
        const max = jkHandMax(p), hand = p.jkHand || [];
        if (p.jkReload > 0) return { pct: 1 - p.jkReload / jkReloadMax(p), ready: false, color: JK_PURPLE, label: 'XÀO BÀI', btnIcon: '🂠', dim: true };
        const h = p.jkHold || 0;
        if (h > 5 && !p.jkHoldUsed) return { pct: Math.min(1, h / JK_HOLD), ready: false, color: JK_GOLD, label: p.jkSwapCd > 0 ? 'TRÁO ' + Math.ceil(p.jkSwapCd / 60) + 's' : 'TRÁO BÀI', btnIcon: '⇄', dim: p.jkSwapCd > 0 };
        const c = hand[0] || 'E', s = jkSuitOf(c);
        let label = JK_SUIT[s].n;
        if (s === 'J' && c[1]) label = c[1] === 'R' ? 'JOKER ĐỎ' : 'JOKER ĐEN';
        if (p.jkCopy) label += ' · ' + p.jkCopy.toUpperCase();
        else if (p.jkAce && (s === p.jkAce)) label = 'A' + JK_SUIT[s].g + ' ' + label;
        else if (jkE1(p) && hand[1]) label += ' + ' + JK_SUIT[jkSuitOf(hand[1])].n;
        return { idle: s !== 'J', pct: hand.length / max, ready: s === 'J', color: jkCardColor(c), label, btnIcon: ICON[s], segments: max, lit: hand.length };
    });
}
if (typeof window !== 'undefined') window.addEventListener('load', jkRegisterHUD);
