// ==========================================
// Tất Sát (tat_sat) — Hình ảnh: xe sát thủ samurai (nón lá, khăn đỏ, katana rút vỏ theo lực tụ),
// vùng cảnh báo đỏ, Phân Ảnh, Liên Hoàn Trảm & Chém Nát Màn Hình, slow-motion, kết liễu, HUD tụ lực 3 mốc.
// Chỉ đọc state đã đồng bộ -> an toàn online.
// ==========================================

function tatUp() { return (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest') ? 1 : -1; }
function tatRnd(s) { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
function tatTierColor(br) { return br === 3 ? TAT_GOLD : (br === 2 ? TAT_VIOLET : TAT_RED); }
function tatText(s, x, y) { if (typeof drawWorldText === 'function') drawWorldText(ctx, s, x, y); else ctx.fillText(s, x, y); }

// Katana trong hệ lưới: chuôi tại (0,0) hướng theo +x, rút ra `draw` (0..1)
function tatKatana(len, drawK, glow) {
    // vỏ kiếm (saya)
    ctx.fillStyle = '#0b0b10'; TA.rr(2, -1.3, len, 2.6, 1.2); ctx.fill();
    ctx.strokeStyle = '#7f1d1d'; ctx.lineWidth = 0.5; ctx.stroke();
    ctx.fillStyle = '#b45309'; ctx.fillRect(len - 1.5, -1.4, 1.5, 2.8);
    // lưỡi kiếm lộ ra
    if (drawK > 0.02) {
        const L = len * drawK;
        ctx.save();
        ctx.shadowColor = glow; ctx.shadowBlur = 4 + 8 * drawK;
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath(); ctx.moveTo(2, -0.9); ctx.lineTo(2 + L, -0.6); ctx.lineTo(2 + L + 1.6, 0.3); ctx.lineTo(2, 0.9); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = glow; ctx.lineWidth = 0.4; ctx.stroke();
        ctx.restore();
    }
    // tsuba + chuôi quấn
    ctx.fillStyle = '#fbbf24'; ctx.fillRect(1, -2.2, 1.2, 4.4);
    ctx.fillStyle = '#111827'; TA.rr(-6, -1.2, 7, 2.4, 1); ctx.fill();
    ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 0.5;
    for (let i = -5; i < 1; i += 1.6) { ctx.beginPath(); ctx.moveTo(i, -1.2); ctx.lineTo(i + 1, 1.2); ctx.stroke(); }
}

// ---------- Xe ----------
registerTankArt('tat_sat', (p, k) => {
    const t = k.t, ch = tatPct(p);
    const br = tatBranch(p, ch);
    const col = br ? tatTierColor(br) : TAT_RED;
    TA.treads(-15, 4.5, -10, 13, t, '#09090b', '#3f3f46');
    // Khăn đỏ bay phía sau (+y)
    ctx.save();
    for (const sx of [-1, 1]) {
        ctx.fillStyle = sx < 0 ? '#b91c1c' : '#ef4444';
        ctx.beginPath(); ctx.moveTo(sx * 2, 9);
        const w1 = Math.sin(t * 7 + sx) * 2.2, w2 = Math.sin(t * 7 + sx + 1.4) * 2.6;
        ctx.quadraticCurveTo(sx * 4 + w1, 13, sx * 3 + w2, 16);
        ctx.lineTo(sx * 1 + w2 * 0.6, 15.2);
        ctx.quadraticCurveTo(sx * 1.5 + w1 * 0.5, 12, 0, 9.5); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    // Thân giáp hẹp, mũi nhọn như lưỡi dao
    ctx.fillStyle = TA.vgrad(-14, 12, '#27141c', '#07070b');
    ctx.beginPath();
    ctx.moveTo(0, -15); ctx.lineTo(8, -8); ctx.lineTo(10, 4); ctx.lineTo(6, 11); ctx.lineTo(-6, 11); ctx.lineTo(-10, 4); ctx.lineTo(-8, -8); ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = k.team; ctx.lineWidth = 0.9; TA.glow(k.teamGlow, 6); ctx.stroke(); TA.noGlow();
    // Đường viền đỏ khắc trên giáp
    ctx.strokeStyle = 'rgba(255, 45, 85, 0.75)'; ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(0, -13); ctx.lineTo(5.5, -7); ctx.moveTo(0, -13); ctx.lineTo(-5.5, -7); ctx.stroke();
    // Katana đeo chéo thân, rút ra theo lực tụ
    ctx.save();
    ctx.translate(6.5, 8); ctx.rotate(-Math.PI / 2 - 0.42);
    tatKatana(18, Math.min(1, ch * 1.05), col);
    ctx.restore();
    // Nón lá (kasa): nón tròn vành rộng, nan tre tỏa tâm
    ctx.save();
    ctx.translate(0, 0.5);
    const rg = ctx.createRadialGradient(-1.5, -1.5, 0.5, 0, 0, 9.5);
    rg.addColorStop(0, '#a16207'); rg.addColorStop(0.55, '#57381a'); rg.addColorStop(1, '#1c1209');
    ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(0, 0, 9.2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(253, 230, 138, 0.35)'; ctx.lineWidth = 0.4;
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 9, Math.sin(a) * 9); ctx.stroke(); }
    ctx.beginPath(); ctx.arc(0, 0, 5.5, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = col; ctx.lineWidth = 0.9; TA.glow(col, 4 + 10 * ch);
    ctx.beginPath(); ctx.arc(0, 0, 9.2, 0, Math.PI * 2); ctx.stroke(); TA.noGlow();
    ctx.fillStyle = '#fde68a'; ctx.beginPath(); ctx.arc(0, 0, 1.3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // Ánh mắt đỏ dưới vành nón (phía trước)
    ctx.fillStyle = TAT_RED; TA.glow(TAT_RED, 6 + 8 * ch);
    ctx.beginPath(); ctx.moveTo(-4.5, -10.2); ctx.lineTo(-1, -9.4); ctx.lineTo(-1.2, -8.8); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(4.5, -10.2); ctx.lineTo(1, -9.4); ctx.lineTo(1.2, -8.8); ctx.closePath(); ctx.fill();
    TA.noGlow();
    // Evo: Evo 1 dải gió vàng quanh nón | Evo 2 ấn tím trên giáp
    if (k.evo1) {
        ctx.strokeStyle = 'rgba(253, 224, 71, 0.55)'; ctx.lineWidth = 0.6;
        ctx.beginPath(); ctx.arc(0, 0.5, 11, t * 2, t * 2 + 2.2); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0.5, 11, t * 2 + Math.PI, t * 2 + Math.PI + 2.2); ctx.stroke();
    }
    if (k.evo2) {
        ctx.fillStyle = TAT_VIOLET; TA.glow(TAT_VIOLET, 6);
        for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * 9, 2); ctx.lineTo(sx * 7.5, 5); ctx.lineTo(sx * 9, 8); ctx.lineTo(sx * 10, 5); ctx.closePath(); ctx.fill(); }
        TA.noGlow();
    }
});

// Ẩn thân: không vẽ xe / thanh máu (chỉ còn hook draw cho hiệu ứng)
(function () {
    const base = Player.prototype.draw;
    Player.prototype.draw = function () {
        if (this.weapon === 'tat_sat' && this.tatHidden) return;
        return base.apply(this, arguments);
    };
})();

CharHooks.registry.tat_sat.draw = function () {
    const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
    const t = Date.now() / 1000, ch = tatPct(this), br = tatBranch(this, ch);
    ctx.save();
    // Hào quang tụ lực: lưỡi kiếm khí xoay, đổi màu theo mốc
    if (ch > 0.01 && this.tatMode === 'idle') {
        const col = tatTierColor(br);
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 10;
        const R = this.w * (0.75 + 0.15 * Math.sin(t * 8));
        for (let i = 0; i < br; i++) {
            const a = t * (3 + br * 2) + i * Math.PI * 2 / br;
            ctx.globalAlpha = 0.5 + 0.4 * ch; ctx.lineWidth = 1.5 + br * 0.6;
            ctx.beginPath(); ctx.arc(cx, cy, R, a, a + 0.9); ctx.stroke();
        }
        if (br === 3) { // khí sát nhân dâng lên
            for (let j = 0; j < 6; j++) {
                const f = (t * 1.4 + j / 6) % 1, x = cx + Math.sin(j * 2.1 + t * 3) * this.w * 0.45;
                ctx.globalAlpha = (1 - f) * 0.7; ctx.fillStyle = j % 2 ? TAT_GOLD : TAT_RED;
                ctx.fillRect(x - 1, cy + tatUp() * f * 30 - 1, 2, 5);
            }
        }
        ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    }
    // Lướt chém: vệt tốc độ phía sau
    if (this.tatMode === 'dash' || this.tatMode === 'sweep') {
        const back = this.id === 1 ? 1 : -1;
        ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
        for (let i = 0; i < 5; i++) {
            const ox = (i - 2) * 6;
            ctx.globalAlpha = 0.6 - Math.abs(i - 2) * 0.15; ctx.strokeStyle = i % 2 ? TAT_RED : '#ffffff'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(cx + ox, cy + back * 10); ctx.lineTo(cx + ox * 0.6, cy + back * (60 + (i % 3) * 20)); ctx.stroke();
        }
    }
    // Đường kiếm Nhánh 3 vừa chém
    if (this.tatSlashFx > 0) {
        const a = this.tatSlashFx / 14, x = this.tatSlashX, y0 = this.tatSlashY0, y1 = this.tatSlashY1;
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = a; ctx.fillStyle = TAT_GOLD; ctx.shadowColor = TAT_GOLD; ctx.shadowBlur = 24;
        const w = (this.tatSlashW || 36) * (0.25 + 0.75 * a);
        ctx.fillRect(x - w / 2, Math.min(y0, y1), w, Math.abs(y1 - y0));
        ctx.fillStyle = '#ffffff'; ctx.fillRect(x - w * 0.12, Math.min(y0, y1), w * 0.24, Math.abs(y1 - y0));
    }
    ctx.restore();
};

CharHooks.registry.tat_sat.drawUI = function () {
    // Thanh tụ lực dưới xe với 2 vạch mốc
    const ch = tatPct(this);
    if (ch <= 0.005 || this.tatMode !== 'idle') return;
    const w = 44, x = this.x + this.w / 2 - w / 2;
    const y = this.id === 1 ? Math.min(canvas.height - 8, this.y + this.h + 12) : Math.max(4, this.y - 16);
    const br = tatBranch(this, ch);
    ctx.save();
    ctx.fillStyle = 'rgba(6, 8, 16, 0.8)'; ctx.fillRect(x - 1, y - 1, w + 2, 5);
    ctx.fillStyle = tatTierColor(br); ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 6;
    ctx.fillRect(x, y, w * ch, 3);
    ctx.shadowBlur = 0; ctx.fillStyle = '#ffffff';
    for (const m of [0.5, tatT3(this) / 100]) ctx.fillRect(x + w * m - 0.5, y - 2, 1, 7);
    ctx.restore();
};

// ---------- Vùng cảnh báo ----------
function tatDrawZone(z) {
    const t = z.t, stun = z.kind === 'stun', r = z.r, TAU = Math.PI * 2;
    const col = stun ? TAT_VIOLET : TAT_RED, rgb = stun ? '192, 132, 252' : '255, 45, 85';
    const circ = (rr) => { ctx.beginPath(); ctx.arc(z.x, z.y, Math.max(0, rr), 0, TAU); };
    ctx.save();
    if (!z.fired) {
        const k = Math.min(1, t / z.maxDelay), blink = Math.floor(t / 4) % 2 ? 0.6 : 1;
        // nền gradient tỏa tâm (đậm dần ở mép)
        const g = ctx.createRadialGradient(z.x, z.y, r * 0.05, z.x, z.y, r);
        g.addColorStop(0, `rgba(${rgb}, ${0.05 + 0.15 * k})`); g.addColorStop(0.75, `rgba(${rgb}, ${0.1 + 0.15 * k})`); g.addColorStop(1, `rgba(${rgb}, ${0.3 + 0.25 * k})`);
        ctx.fillStyle = g; circ(r); ctx.fill();
        // viền nét đứt xoay
        ctx.globalAlpha = blink; ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.setLineDash([8, 5]); ctx.lineDashOffset = -t;
        circ(r); ctx.stroke(); ctx.setLineDash([]);
        // vạch chia xoay ngược chiều
        ctx.globalAlpha = 0.85; ctx.lineWidth = 1.5; ctx.shadowColor = col; ctx.shadowBlur = 8;
        const rot = -t * 0.06;
        for (let i = 0; i < 16; i++) {
            const a = rot + i * TAU / 16, l = i % 4 === 0 ? 8 : 4, r0 = r - 3;
            ctx.beginPath(); ctx.moveTo(z.x + Math.cos(a) * (r0 - l), z.y + Math.sin(a) * (r0 - l)); ctx.lineTo(z.x + Math.cos(a) * r0, z.y + Math.sin(a) * r0); ctx.stroke();
        }
        // vòng co lại = sắp chém
        ctx.globalAlpha = 0.9; ctx.lineWidth = 2.2; ctx.shadowBlur = 10;
        circ(r * (1 - k * 0.92)); ctx.stroke();
        // ký hiệu kiếm chéo
        ctx.globalAlpha = 0.5 + 0.5 * k; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.4;
        const s = 9;
        ctx.beginPath(); ctx.moveTo(z.x - s, z.y - s); ctx.lineTo(z.x + s, z.y + s); ctx.moveTo(z.x + s, z.y - s); ctx.lineTo(z.x - s, z.y + s); ctx.stroke();
        if (z.pull) {
            ctx.globalAlpha = 0.6; ctx.strokeStyle = col;
            for (const sx of [-1, 1]) { const xx = z.x + sx * r * (0.9 - (t % 20) / 40); ctx.beginPath(); ctx.moveTo(xx, z.y - 6); ctx.lineTo(xx - sx * 6, z.y); ctx.lineTo(xx, z.y + 6); ctx.stroke(); }
        }
    } else {
        const k = Math.min(1, (t - z.delay) / 20);
        ctx.globalCompositeOperation = 'lighter';
        // sóng tròn lan ra
        ctx.globalAlpha = (1 - k) * 0.8; ctx.strokeStyle = col; ctx.lineWidth = 3 * (1 - k) + 0.5; ctx.shadowColor = col; ctx.shadowBlur = 16;
        circ(r * (0.85 + k * 0.2)); ctx.stroke();
        ctx.save(); circ(r); ctx.clip();
        ctx.globalAlpha = 1 - k; ctx.strokeStyle = '#ffffff'; ctx.shadowBlur = 18; ctx.lineCap = 'round';
        for (let i = 0; i < (stun ? 2 : 3); i++) {
            const sgn = i % 2 ? 1 : -1, off = (i - 1) * r * 0.3;
            ctx.lineWidth = (6 - i * 1.5) * (1 - k * 0.6);
            ctx.beginPath(); ctx.moveTo(z.x - r * (0.3 + k * 0.7), z.y + off - sgn * r * 0.35); ctx.lineTo(z.x + r * (0.3 + k * 0.7), z.y + off + sgn * r * 0.35); ctx.stroke();
        }
        ctx.restore();
        ctx.globalAlpha = (1 - k) * 0.25; ctx.fillStyle = `rgba(${rgb}, 1)`; circ(r); ctx.fill();
    }
    ctx.restore();
}

// ---------- Phân Ảnh ----------
function tatDrawPhantom(f) {
    const back = f.team === 1 ? 1 : -1;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 4; i >= 0; i--) {
        const yy = f.y + (f.phase === 0 ? back * i * 14 : 0);
        ctx.globalAlpha = (f.phase === 0 ? 0.55 : 0.4 * (1 - f.t / 12)) * (1 - i * 0.18);
        ctx.fillStyle = i ? TAT_VIOLET : '#f5f3ff'; ctx.shadowColor = TAT_VIOLET; ctx.shadowBlur = 14;
        ctx.beginPath(); ctx.moveTo(f.x, yy - back * 14); ctx.lineTo(f.x + 10, yy); ctx.lineTo(f.x, yy + back * 9); ctx.lineTo(f.x - 10, yy); ctx.closePath(); ctx.fill();
    }
    // nón + kiếm của phân ảnh
    ctx.globalAlpha = f.phase === 0 ? 0.9 : 0.4;
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(f.x, f.y, 8, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(f.x - 12, f.y + back * 6); ctx.lineTo(f.x + 12, f.y - back * 22); ctx.stroke();
    ctx.restore();
}

// ---------- Vệt lướt ----------
function tatDrawTrail(d) {
    const a = 1 - d.t / d.dur;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    ctx.globalAlpha = a; ctx.strokeStyle = TAT_RED; ctx.shadowColor = TAT_RED; ctx.shadowBlur = 14; ctx.lineWidth = 10 * a + 2;
    ctx.beginPath(); ctx.moveTo(d.x0, d.y0); ctx.lineTo(d.x1, d.y1); ctx.stroke();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.5 * a + 0.5;
    ctx.beginPath(); ctx.moveTo(d.x0, d.y0); ctx.lineTo(d.x1, d.y1); ctx.stroke();
    ctx.restore();
}

// ---------- Liên Hoàn Trảm: trên sân ----------
function tatDrawCombo(c) {
    if (c.done) return;
    const t = c.t, col = c.big ? TAT_GOLD : TAT_RED;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    // vòng khóa
    ctx.strokeStyle = col; ctx.globalAlpha = 0.6; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]); ctx.lineDashOffset = t;
    ctx.beginPath(); ctx.arc(c.x, c.y, 30, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    // hư ảnh lướt quanh mục tiêu (mỗi 10 tick 1 nhát)
    const n = Math.floor(t / 10);
    for (let j = Math.max(0, n - 2); j <= n; j++) {
        const a = c.seed + j * 2.39996, age = t - j * 10;
        if (age < 0 || age > 18) continue;
        const k = age / 18, R = 34;
        const x0 = c.x + Math.cos(a) * R, y0 = c.y + Math.sin(a) * R * 0.8;
        const x1 = c.x - Math.cos(a) * R, y1 = c.y - Math.sin(a) * R * 0.8;
        ctx.globalAlpha = 1 - k; ctx.strokeStyle = '#ffffff'; ctx.shadowColor = j % 2 ? TAT_RED : col; ctx.shadowBlur = 16; ctx.lineWidth = 4 * (1 - k) + 1;
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + (x1 - x0) * Math.min(1, k * 3), y0 + (y1 - y0) * Math.min(1, k * 3)); ctx.stroke();
        // dáng sát thủ tại đầu nhát chém
        ctx.globalAlpha = (1 - k) * 0.8; ctx.fillStyle = j % 2 ? TAT_RED : '#fecdd3';
        ctx.beginPath(); ctx.arc(x1, y1, 6, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
}

// Chém Nát Màn Hình: kính nứt + nhát chém xuyên màn hình (lớp phủ)
function tatCrack(c, i, W, H) {
    const pts = [], a = c.seed * 3 + i * 2.39996, L = Math.hypot(W, H) * (0.45 + 0.4 * tatRnd(c.seed + i));
    let x = c.x, y = c.y; pts.push([x, y]);
    for (let s = 1; s <= 7; s++) {
        const aa = a + (tatRnd(c.seed + i * 13 + s) - 0.5) * 0.5;
        x += Math.cos(aa) * L / 7; y += Math.sin(aa) * L / 7; pts.push([x, y]);
    }
    return pts;
}
function tatDrawComboOver(c) {
    const W = canvas.width, H = canvas.height, t = c.t;
    const col = c.big ? TAT_GOLD : TAT_RED;
    const live = !c.done, endK = c.done ? Math.min(1, (t - c.dur) / c.tail) : 0;
    if (c.done && !c.hitOk) return;
    ctx.save();
    // màn tối + viền đỏ
    const dark = live ? Math.min(1, t / 10) : 1 - endK;
    ctx.fillStyle = `rgba(6, 2, 8, ${0.45 * dark})`; ctx.fillRect(-W, -H, W * 3, H * 3);
    // nhát chém xuyên màn hình (mỗi 10 tick)
    const n = live ? Math.floor(t / 10) : 12;
    ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    for (let j = 0; j <= n && live; j++) {
        const age = t - j * 10;
        if (age < 0 || age > 14) continue;
        const a = c.seed + j * 2.39996, k = age / 14, L = Math.hypot(W, H);
        const dx = Math.cos(a) * L, dy = Math.sin(a) * L;
        ctx.globalAlpha = 1 - k; ctx.strokeStyle = '#ffffff'; ctx.shadowColor = j % 2 ? TAT_RED : col; ctx.shadowBlur = 22;
        ctx.lineWidth = 7 * (1 - k) + 1;
        ctx.beginPath(); ctx.moveTo(c.x - dx * Math.min(1, k * 4), c.y - dy * Math.min(1, k * 4)); ctx.lineTo(c.x + dx * Math.min(1, k * 4), c.y + dy * Math.min(1, k * 4)); ctx.stroke();
    }
    // vết nứt kính tích dần theo số nhát
    ctx.globalCompositeOperation = 'source-over'; ctx.shadowBlur = 0;
    const cracks = live ? Math.min(14, 2 + n) : 14;
    const fall = c.done ? endK : 0;
    for (let i = 0; i < cracks; i++) {
        const pts = tatCrack(c, i, W, H);
        ctx.save();
        if (fall > 0) { ctx.translate((tatRnd(i) - 0.5) * 30 * fall, fall * fall * 220 * (0.5 + tatRnd(i + 7))); ctx.globalAlpha = 1 - fall; }
        ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 1.2;
        ctx.beginPath(); pts.forEach((q, s) => s ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.stroke();
        ctx.strokeStyle = c.big ? 'rgba(253, 224, 71, 0.45)' : 'rgba(255, 45, 85, 0.45)'; ctx.lineWidth = 3;
        ctx.stroke();
        // nối ngang giữa 2 tia (mạng nhện kính)
        const nx = tatCrack(c, (i + 1) % 14, W, H);
        for (const s of [2, 4]) {
            if (i + 1 >= cracks && live) break;
            ctx.strokeStyle = 'rgba(226,232,240,0.55)'; ctx.lineWidth = 0.8;
            ctx.beginPath(); ctx.moveTo(pts[s][0], pts[s][1]); ctx.lineTo(nx[s][0], nx[s][1]); ctx.stroke();
        }
        // mảnh kính rơi
        if (fall > 0) {
            ctx.fillStyle = 'rgba(226,232,240,0.35)';
            ctx.beginPath(); ctx.moveTo(pts[2][0], pts[2][1]); ctx.lineTo(pts[3][0], pts[3][1]); ctx.lineTo(nx[3][0], nx[3][1]); ctx.closePath(); ctx.fill();
        }
        ctx.restore();
    }
    // chớp trắng khi chém nát
    if (c.done && endK < 0.35) { ctx.globalAlpha = 0.7 * (1 - endK / 0.35); ctx.fillStyle = '#ffffff'; ctx.fillRect(-W, -H, W * 3, H * 3); }
    // chữ
    ctx.globalAlpha = live ? Math.min(1, t / 12) : 1 - endK;
    ctx.font = `900 ${c.big ? 20 : 17}px 'Orbitron', Arial`; ctx.textAlign = 'center';
    ctx.fillStyle = col; ctx.shadowColor = TAT_RED; ctx.shadowBlur = 16;
    const ty = Math.max(50, Math.min(H - 40, c.y + (c.y < H / 2 ? 80 : -70)));
    tatText(c.done ? 'CHÉM NÁT MÀN HÌNH!' : (c.big ? 'NHẤT KIẾM TẤT SÁT' : 'LIÊN HOÀN TRẢM') + ` ×${Math.min(12, n + 1)}`, W / 2, ty);
    ctx.restore();
}

// ---------- Kết liễu NHẤT KIẾM TẤT SÁT! ----------
function tatDrawFinisherOver(f) {
    const t = f.t, W = canvas.width, H = canvas.height;
    ctx.save();
    const dark = t < 8 ? t / 8 : (t < 110 ? 1 : Math.max(0, 1 - (t - 110) / 30));
    ctx.fillStyle = `rgba(0, 0, 0, ${0.62 * dark})`; ctx.fillRect(-W, -H, W * 3, H * 3);
    // dải đỏ ngang (mặt trời lặn) sau lưng nạn nhân
    if (t < 125) {
        const g = ctx.createLinearGradient(0, f.y - 70, 0, f.y + 70);
        g.addColorStop(0, 'rgba(255,45,85,0)'); g.addColorStop(0.5, `rgba(255,45,85,${0.35 * dark})`); g.addColorStop(1, 'rgba(255,45,85,0)');
        ctx.fillStyle = g; ctx.fillRect(0, f.y - 70, W, 140);
    }
    // 1 nhát kiếm duy nhất chém ngang qua cả màn hình tại t=22..30
    if (t >= 20) {
        const k = Math.min(1, (t - 20) / 8), a = Math.max(0, 1 - (t - 40) / 60);
        ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
        ctx.globalAlpha = a; ctx.strokeStyle = '#ffffff'; ctx.shadowColor = TAT_RED; ctx.shadowBlur = 30;
        ctx.lineWidth = 9 * a + 1;
        ctx.beginPath(); ctx.moveTo(-20, f.y + 26); ctx.lineTo(-20 + (W + 40) * k, f.y + 26 - 52 * k); ctx.stroke();
        ctx.lineWidth = 2; ctx.strokeStyle = TAT_GOLD; ctx.stroke();
        // thế giới bị chẻ đôi: dịch 2 nửa
        if (t >= 30 && t < 100) {
            const s = Math.min(1, (t - 30) / 10) * 5;
            ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 0.85 * a; ctx.shadowBlur = 0;
            ctx.fillStyle = '#000';
            ctx.beginPath(); ctx.moveTo(-20, f.y + 26 - s); ctx.lineTo(W + 20, f.y - 26 - s); ctx.lineTo(W + 20, f.y - 26 + s); ctx.lineTo(-20, f.y + 26 + s); ctx.closePath(); ctx.fill();
        }
    }
    ctx.globalCompositeOperation = 'source-over';
    // bóng sát thủ đứng quay lưng, tra kiếm vào vỏ
    if (t >= 8 && t < 130) {
        const a = Math.min(1, (t - 8) / 10) * (t > 110 ? 1 - (t - 110) / 20 : 1);
        const sx = W / 2 + (t < 20 ? -40 * (1 - (t - 8) / 12) : 0), sy = Math.max(70, Math.min(H - 110, f.y + (f.team === 1 ? 110 : -110)));
        ctx.globalAlpha = a; ctx.fillStyle = '#05050a'; ctx.strokeStyle = TAT_RED; ctx.lineWidth = 1.5; ctx.shadowColor = TAT_RED; ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.ellipse(sx, sy - 18, 22, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();   // nón
        ctx.beginPath(); ctx.moveTo(sx - 9, sy - 14); ctx.lineTo(sx + 9, sy - 14); ctx.lineTo(sx + 13, sy + 18); ctx.lineTo(sx - 13, sy + 18); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 3;                                                  // khăn
        ctx.beginPath(); ctx.moveTo(sx - 6, sy - 10); ctx.quadraticCurveTo(sx - 26, sy - 6 + Math.sin(t / 5) * 4, sx - 38, sy + 2); ctx.stroke();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2;                                                  // kiếm
        ctx.beginPath(); ctx.moveTo(sx + 6, sy + 4); ctx.lineTo(sx + 30, sy + (t < 60 ? -10 : 10)); ctx.stroke();
    }
    // chữ
    if (t >= 28 && t < 138) {
        ctx.globalAlpha = Math.min(1, (t - 28) / 6) * (t > 120 ? 1 - (t - 120) / 18 : 1);
        ctx.font = "900 19px 'Orbitron', Arial"; ctx.textAlign = 'center';
        ctx.shadowBlur = 20; ctx.shadowColor = TAT_RED; ctx.fillStyle = '#ffffff';
        const ty = Math.max(50, Math.min(H - 50, f.y + (f.team === 1 ? -70 : 80)));
        const sc = 1 + Math.max(0, 1 - (t - 28) / 6) * 0.6;
        ctx.save(); ctx.translate(W / 2, ty); ctx.scale(sc, sc);
        tatText('NHẤT KIẾM TẤT SÁT!', 0, 0);
        ctx.font = "700 11px 'Orbitron', Arial"; ctx.fillStyle = TAT_GOLD; ctx.shadowBlur = 8;
        tatText('"Quên ta rồi sao?"', 0, tatUp() * -20);
        ctx.restore();
    }
    ctx.restore();
}

// Slow-motion (hình ảnh): khử màu + vệt tốc độ hội tụ về xe
function tatDrawSlowMo(p) {
    const W = canvas.width, H = canvas.height, k = p.tatSlowFx / 24;
    const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
    ctx.save();
    ctx.globalAlpha = 0.85 * Math.min(1, k * 2);
    ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = '#808080'; ctx.fillRect(-W, -H, W * 3, H * 3);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.25 * k; ctx.fillStyle = '#1e0b2e'; ctx.fillRect(-W, -H, W * 3, H * 3);
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.5 * k; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1;
    for (let i = 0; i < 26; i++) {
        const a = i * 0.2417 * Math.PI * 2 + p.tatSlowFx * 0.01, r0 = 60 + tatRnd(i) * 80, r1 = r0 + 90 + tatRnd(i + 3) * 160;
        ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); ctx.stroke();
    }
    ctx.restore();
}

function tatFxOver() {
    if (typeof bodyEffects === 'undefined' || typeof p1 === 'undefined') return;
    [p1, p2].forEach(p => { if (p && p.weapon === 'tat_sat' && p.tatSlowFx > 0) tatDrawSlowMo(p); });
    for (const e of bodyEffects) if ((e instanceof TatCombo || e instanceof TatFinisher) && e.active) e.drawOver();
}

// ---------- HUD nút Bắn: vòng tụ lực + vạch mốc 49% / 85% (Full Evo 74%) ----------
function tatRegisterHUD() {
    if (typeof registerEmpowerHUD !== 'function') return;
    registerEmpowerHUD('tat_sat', p => {
        const ch = tatPct(p), br = tatBranch(p, ch);
        if (p.tatMode !== 'idle') return { idle: true, pct: 1, ready: true, color: TAT_RED, label: p.tatHidden ? 'TẤT SÁT' : '...', btnIcon: '⚔' };
        if (ch <= 0.005) return { idle: true, pct: 0, ready: false, color: TAT_RED, label: '', btnIcon: '⚔' };
        const names = ['', 'LƯỚT CHÉM', 'PHÂN ẢNH', 'TẤT SÁT'];
        return { idle: true, pct: ch, ready: br === 3, color: tatTierColor(br), label: names[br], btnIcon: String(br) };
    });
}
if (typeof window !== 'undefined') window.addEventListener('load', tatRegisterHUD);

// Vạch mốc trên vòng nút Bắn (span riêng, gỡ khi không phải Tất Sát)
function tatHookButtonMarks() {
    if (typeof renderFrame !== 'function') return;
    const base = renderFrame;
    const cache = {};
    renderFrame = function () {
        base.apply(this, arguments);
        if (typeof document === 'undefined' || typeof empLocalButtons !== 'function') return;
        const want = {};
        if (gameState.phase === 'playing') empLocalButtons().forEach(([sel, p]) => { if (p && p.weapon === 'tat_sat') want[sel] = tatT3(p); });
        ['#p1-controls .btn-shoot', '#p2-controls .btn-shoot'].forEach(sel => {
            const key = want[sel] || 0;
            if (cache[sel] === key) return;
            cache[sel] = key;
            const el = document.querySelector(sel);
            if (!el) return;
            let m = el.querySelector('.tat-marks');
            if (!key) { if (m) m.remove(); return; }
            if (!m) { m = document.createElement('span'); m.className = 'tat-marks'; el.appendChild(m); }
            const tick = (pc) => `transparent ${pc - 1.2}%, #ffffff ${pc - 1.2}%, #ffffff ${pc + 1.2}%, transparent ${pc + 1.2}%`;
            m.style.cssText = 'position:absolute;inset:-9px;border-radius:50%;pointer-events:none;' +
                `background:conic-gradient(${tick(50)}, ${tick(key)}, transparent 100%);` +
                '-webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 7px),#000 calc(100% - 6px));mask:radial-gradient(farthest-side,transparent calc(100% - 7px),#000 calc(100% - 6px));' +
                'filter:drop-shadow(0 0 2px #ff2d55);';
        });
    };
}
if (typeof window !== 'undefined') window.addEventListener('load', tatHookButtonMarks);
