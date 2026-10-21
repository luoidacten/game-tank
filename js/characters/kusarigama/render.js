// ==========================================
// Kusarigama (kusarigama) — Hình ảnh: xe xích liêm (lưỡi liềm thép làm nòng, cuộn xích quanh thân, quả tạ phía sau),
// lưỡi liềm bay + xích mắt, Lốc Máu, Vòng Cảnh Báo / vòng xoay Linh, vệt máu, giọt máu trên địch,
// hào quang Cuồng Huyết, HUD (tầng Tích Lũy, Phong Cách, thanh Giáp Trắng), kết liễu "HUYẾT LIÊM ĐOẠT MỆNH".
// Chỉ đọc state -> an toàn online.
// ==========================================

function kgNow() { return (Date.now() % 1e6) / 1000; } // nhỏ để ctx.arc (float32) không mất góc

// ---------- Xe Kusarigama ----------
registerTankArt('kusarigama', (p, k) => {
    const t = k.t, bers = !!p.kgBers, out = kgMine(p, KgSickle).length > 0;
    const hold = Math.min(1, (p.kgHold || 0) / kgHoldN(p)), sw = (p.kgSwing || 0) / 12;
    TA.treads(-14, 4.4, -11, 12, t, '#1c0a0a', '#4b1d1d');
    // thân bát giác đỏ thẫm
    ctx.fillStyle = TA.metal(-10, 10, bers ? '#450a0a' : '#1f1315', bers ? '#b91c1c' : '#57303a');
    ctx.beginPath();
    const V = [[-6, -10], [6, -10], [10, -5], [10, 7], [6, 11], [-6, 11], [-10, 7], [-10, -5]];
    V.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = bers ? KG_RED : k.team; ctx.lineWidth = 1; TA.glow(bers ? KG_RED : k.teamGlow, bers ? 10 : 6); ctx.stroke(); TA.noGlow();
    // quả tạ phía sau
    ctx.fillStyle = TA.metal(-4, 4, '#334155', '#94a3b8'); ctx.beginPath(); ctx.arc(0, 8.5, 3.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = KG_RED; ctx.beginPath(); ctx.arc(0, 8.5, 1.1, 0, Math.PI * 2); ctx.fill();
    // cuộn xích quanh tháp (xoay)
    const spin = t * (2 + hold * 10 + (bers ? 4 : 0));
    ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 0.8;
    for (let i = 0; i < 12; i++) {
        const a = spin + i * Math.PI / 6;
        ctx.save(); ctx.translate(Math.cos(a) * 6.2, Math.sin(a) * 6.2); ctx.rotate(a + (i % 2 ? Math.PI / 2 : 0));
        ctx.beginPath(); ctx.ellipse(0, 0, 1.5, 0.8, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
    // lõi máu (tầng Tích Lũy)
    const sk = Math.min(1, (p.kgStk || 0) / 5);
    TA.glow(KG_RED, 4 + sk * 12);
    ctx.fillStyle = `rgba(${150 + sk * 105}, ${20 + sk * 20}, ${30}, 1)`;
    ctx.beginPath(); ctx.arc(0, 0, 3 + sk * 1.2, 0, Math.PI * 2); ctx.fill(); TA.noGlow();
    // lưỡi liềm (nòng) — ẩn khi đang bay
    if (!out) {
        ctx.save(); ctx.translate(0, -9 - sw * 3); ctx.rotate(Math.sin(t * 3) * 0.08 - sw * 0.6);
        ctx.fillStyle = '#3f2a1d'; ctx.fillRect(-0.9, -6, 1.8, 7);
        TA.glow(bers ? KG_RED : '#fca5a5', 6 + hold * 10);
        const g = ctx.createLinearGradient(-6, -12, 6, -6); g.addColorStop(0, '#f8fafc'); g.addColorStop(1, bers ? '#ef4444' : '#94a3b8');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.moveTo(0.5, -6); ctx.quadraticCurveTo(8, -9, 7, -15); ctx.quadraticCurveTo(5, -10, -0.8, -7.4); ctx.closePath(); ctx.fill();
        TA.noGlow(); ctx.restore();
    }
    if (k.evo1) { ctx.fillStyle = KG_RED; for (let i = -1; i <= 1; i += 2) { ctx.beginPath(); ctx.moveTo(i * 10, -5); ctx.lineTo(i * 12.5, -1); ctx.lineTo(i * 10, 1); ctx.fill(); } }
    if (k.evo2) { ctx.strokeStyle = 'rgba(241,245,249,0.75)'; ctx.lineWidth = 0.8; TA.rr(-7.5, -7.5, 15, 15, 3); ctx.stroke(); }
    if (k.full) {
        TA.glow(KG_RED, 10); ctx.strokeStyle = KG_GOLD; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.arc(0, 0, 13, -Math.PI * 0.85, -Math.PI * 0.15); ctx.stroke(); TA.noGlow();
    }
});

// ---------- Xích ----------
function kgChain(ax, ay, bx, by, hot) {
    const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy);
    if (L < 2) return;
    const a = Math.atan2(dy, dx), n = Math.floor(L / 5);
    ctx.save();
    ctx.strokeStyle = 'rgba(30, 10, 10, 0.8)'; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
    ctx.strokeStyle = hot ? '#fecaca' : '#cbd5e1'; ctx.lineWidth = 1; ctx.shadowBlur = hot ? 8 : 3; ctx.shadowColor = hot ? KG_RED : '#94a3b8';
    for (let i = 0; i <= n; i++) {
        const k = i / Math.max(1, n);
        ctx.save(); ctx.translate(ax + dx * k, ay + dy * k); ctx.rotate(a);
        ctx.beginPath(); ctx.ellipse(0, 0, 2.6, i % 2 ? 1.6 : 0.6, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
    ctx.restore();
}

// ---------- Lưỡi liềm bay ----------
function kgDrawSickle(s) {
    const own = kgTeam(s.team);
    if (own) kgChain(kgCx(own), kgCy(own), s.x, s.y, s.mode === 'back' || s.bers);
    ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.ang); ctx.scale(1.5, 1.5);
    ctx.shadowBlur = s.mode === 'back' ? 16 : 8; ctx.shadowColor = KG_RED;
    const g = ctx.createLinearGradient(-8, -8, 8, 8); g.addColorStop(0, '#ffffff'); g.addColorStop(1, s.bers ? '#ef4444' : '#94a3b8');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(-2, 2); ctx.quadraticCurveTo(10, 4, 11, -9); ctx.quadraticCurveTo(6, -2, -2, -2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#3f2a1d'; ctx.fillRect(-7, -1.2, 6, 2.4);
    if (s.mode === 'back') { ctx.strokeStyle = 'rgba(239,68,68,0.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 1.3); ctx.stroke(); }
    ctx.restore();
}

// ---------- Lốc Máu ----------
function kgDrawVortex(v) {
    const own = kgTeam(v.team), t = kgNow();
    if (own) kgChain(kgCx(own), kgCy(own), v.x, v.y, v.mode === 'spin');
    ctx.save();
    if (v.mode === 'spin') {
        const k = Math.min(1, v.t / 10), fade = Math.max(0.3, 1 - v.t / v.life * 0.5), r = v.r * k;
        const g = ctx.createRadialGradient(v.x, v.y, 0, v.x, v.y, r);
        g.addColorStop(0, `rgba(127, 29, 29, ${0.55 * fade})`); g.addColorStop(0.7, `rgba(220, 38, 38, ${0.22 * fade})`); g.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(v.x, v.y, r, 0, Math.PI * 2); ctx.fill();
        ctx.lineCap = 'round'; ctx.shadowBlur = 10; ctx.shadowColor = KG_RED;
        for (let i = 0; i < 5; i++) {
            const a0 = t * 6 + i * Math.PI * 2 / 5, rr = r * (0.35 + 0.13 * i);
            ctx.strokeStyle = `rgba(${i % 2 ? 254 : 239}, ${i % 2 ? 202 : 68}, ${i % 2 ? 202 : 68}, ${0.9 * fade})`; ctx.lineWidth = 3.4 - i * 0.4;
            ctx.beginPath(); ctx.arc(v.x, v.y, rr, a0, a0 + 1.6); ctx.stroke();
        }
        ctx.strokeStyle = `rgba(239,68,68,${0.6 * fade})`; ctx.lineWidth = 1.2; ctx.setLineDash([4, 5]);
        ctx.beginPath(); ctx.arc(v.x, v.y, r, -t * 2, -t * 2 + Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    }
    // quả tạ
    ctx.shadowBlur = 10; ctx.shadowColor = KG_RED;
    ctx.fillStyle = '#475569'; ctx.beginPath(); ctx.arc(v.x, v.y, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e2e8f0'; ctx.beginPath(); ctx.arc(v.x - 2, v.y - 2, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = KG_RED;
    for (let i = 0; i < 6; i++) { const a = t * 8 + i * Math.PI / 3; ctx.beginPath(); ctx.arc(v.x + Math.cos(a) * 7, v.y + Math.sin(a) * 7, 1.3, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
}

function kgDrawPool(o) {
    const k = o.life / o.maxLife;
    ctx.save(); ctx.globalAlpha = Math.min(1, k * 2) * 0.75;
    ctx.fillStyle = '#7f1d1d'; ctx.beginPath(); ctx.ellipse(o.x, o.y, o.r, o.r * 0.55, o.seed, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(239,68,68,0.6)'; ctx.beginPath(); ctx.ellipse(o.x + 3, o.y - 1, o.r * 0.5, o.r * 0.25, o.seed, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}
function kgDrawBlade(b) {
    const a = Math.atan2(b.vy, b.vx);
    ctx.save(); ctx.translate(b.x + b.w / 2, b.y + b.h / 2); ctx.rotate(a);
    ctx.shadowBlur = 12; ctx.shadowColor = KG_RED; ctx.fillStyle = '#fecaca';
    ctx.beginPath(); ctx.moveTo(9, 0); ctx.lineTo(-6, -3); ctx.lineTo(-3, 0); ctx.lineTo(-6, 3); ctx.closePath(); ctx.fill();
    ctx.restore();
}

// ---------- Linh: cảnh báo & vòng xoay; hào quang; giọt máu ----------
function kgDrawSelf(p) {
    const cx = kgCx(p), cy = kgCy(p), t = kgNow();
    ctx.save();
    if (p.kgBers && p.hp > 0) {
        const pulse = 0.5 + 0.5 * Math.sin(t * 8);
        const g = ctx.createRadialGradient(cx, cy, p.w * 0.3, cx, cy, p.w * 1.2);
        g.addColorStop(0, 'rgba(239,68,68,0)'); g.addColorStop(1, `rgba(220,38,38,${0.25 + pulse * 0.2})`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, p.w * 1.2, 0, Math.PI * 2); ctx.fill();
        if (p.kgInvul > 0) { ctx.strokeStyle = `rgba(254,226,226,${0.5 + pulse * 0.5})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, p.w * 0.85, 0, Math.PI * 2); ctx.stroke(); }
    }
    if (p.kgMode === 'dash' || (p.kgMode === 'back')) {
        ctx.strokeStyle = 'rgba(239,68,68,0.45)'; ctx.lineWidth = p.w * 0.5; ctx.lineCap = 'round';
        const dir = kgDir(p) * (p.kgMode === 'dash' ? -1 : 1);
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy + dir * 26); ctx.stroke();
    }
    if (p.kgMode === 'warn') {
        const k = p.kgModeT / Math.max(1, p.kgWarnN), r = p.kgLinhR, blink = Math.floor(p.kgModeT / 5) % 2;
        ctx.fillStyle = `rgba(220,38,38,${0.08 + k * 0.18})`; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = blink ? '#fecaca' : KG_RED; ctx.lineWidth = 2; ctx.shadowBlur = 12; ctx.shadowColor = KG_RED;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
        ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, r * k, 0, Math.PI * 2); ctx.stroke();
        ctx.font = "900 12px 'Orbitron', Arial"; ctx.textAlign = 'center'; ctx.fillStyle = '#fecaca'; ctx.fillText('!', cx, cy - r * 0.55);
        // liềm quay chậm chờ
        kgChain(cx, cy, cx + Math.cos(t * 6) * r * 0.5, cy + Math.sin(t * 6) * r * 0.5, true);
    }
    if (p.kgMode === 'spin') {
        const k = p.kgModeT / 24, r = p.kgLinhR, a0 = k * Math.PI * 2.2;
        ctx.fillStyle = `rgba(239,68,68,${0.3 * (1 - k)})`; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#fee2e2'; ctx.lineWidth = 5 * (1 - k) + 1; ctx.shadowBlur = 18; ctx.shadowColor = KG_RED; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(cx, cy, r * 0.92, a0 - 2.2, a0); ctx.stroke();
        const sx = cx + Math.cos(a0) * r * 0.92, sy = cy + Math.sin(a0) * r * 0.92;
        ctx.shadowBlur = 0; kgChain(cx, cy, sx, sy, true);
        ctx.save(); ctx.translate(sx, sy); ctx.rotate(a0 + Math.PI / 2); ctx.fillStyle = '#ffffff'; ctx.shadowBlur = 14; ctx.shadowColor = KG_RED;
        ctx.beginPath(); ctx.moveTo(-2, 2); ctx.quadraticCurveTo(12, 4, 13, -11); ctx.quadraticCurveTo(7, -2, -2, -2); ctx.closePath(); ctx.fill(); ctx.restore();
    }
    // vòng giữ đổi phong cách
    if (p.kgHold > 3 && p.kgMode === 'idle') {
        const k = Math.min(1, p.kgHold / kgHoldN(p));
        ctx.strokeStyle = KG_GOLD; ctx.lineWidth = 2; ctx.shadowBlur = 8; ctx.shadowColor = KG_GOLD;
        ctx.beginPath(); ctx.arc(cx, cy, p.w * 0.9, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); ctx.stroke();
    }
    ctx.restore();
    // giọt máu trên địch đang Chảy Máu
    const e = kgEnemy(p);
    if (kgAlive(e) && e.kgBlT > 0 && e.kgBlBy === p.id) {
        ctx.save(); ctx.fillStyle = KG_RED; ctx.shadowBlur = 6; ctx.shadowColor = KG_RED;
        const n = 2 + (e.kgBlS || 1);
        for (let i = 0; i < n; i++) {
            const ph = (t * 1.4 + i / n) % 1, x = e.x + e.w * (0.15 + 0.7 * ((i * 0.37 + 0.2) % 1)), y = e.y + e.h * 0.2 + ph * e.h * 0.9;
            ctx.globalAlpha = 1 - ph; ctx.beginPath(); ctx.arc(x, y, 1.6, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.moveTo(x - 1.6, y); ctx.lineTo(x, y - 3.5); ctx.lineTo(x + 1.6, y); ctx.fill();
        }
        ctx.restore();
    }
}

CharHooks.register('kusarigama', Object.assign(CharHooks.registry.kusarigama || {}, {
    draw() { kgDrawSelf(this); },
    drawUI() {
        if (this.hp <= 0 || typeof hudRowY !== 'function') return;
        const y = hudRowY(this, 'extra') + (this.id === 1 ? 2 : -2), cx = kgCx(this), s = this.kgStk || 0;
        ctx.save();
        for (let i = 0; i < 5; i++) {
            const f = Math.max(0, Math.min(1, s - i));
            ctx.fillStyle = 'rgba(127,29,29,0.35)'; ctx.beginPath(); ctx.arc(cx + (i - 2) * 6, y, 2.1, 0, Math.PI * 2); ctx.fill();
            if (f > 0) { ctx.fillStyle = f >= 1 ? (s >= 5 ? '#fecaca' : KG_RED) : 'rgba(239,68,68,0.6)'; ctx.shadowBlur = s >= 5 ? 8 : 3; ctx.shadowColor = KG_RED; ctx.beginPath(); ctx.arc(cx + (i - 2) * 6, y, 2.1 * Math.max(0.4, f), 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; }
        }
        ctx.restore();
        if (this.kgBers && typeof hudExtraBar === 'function') {
            const ws = this.gearWhiteShield || 0;
            hudExtraBar(this, 0.9, Math.min(1, ws / 4), KG_WS, { h: 2.5, bg: 'rgba(69,10,10,0.9)' });
        }
    },
}));

// ---------- Kết liễu "HUYẾT LIÊM ĐOẠT MỆNH" ----------
function kgDrawFinisherOver(f) {
    const t = f.t, W = canvas.width, H = canvas.height;
    const fade = t > 124 ? Math.max(0, 1 - (t - 124) / 26) : 1;
    ctx.save();
    // màn hình nhuộm đỏ thẫm
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = `rgba(60, 0, 6, ${0.72 * Math.min(1, t / 10) * fade})`; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
    ctx.globalAlpha = fade;
    // 1) xích quấn chặt mục tiêu (xoắn ốc siết vào)
    const wrap = Math.min(1, t / 30), tight = t >= 30 ? Math.min(1, (t - 30) / 20) : 0;
    kgChain(f.ox, f.oy, f.x, f.y, true);
    ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1.6; ctx.shadowBlur = 10; ctx.shadowColor = KG_RED;
    ctx.beginPath();
    for (let a = 0; a < wrap * Math.PI * 8; a += 0.2) {
        const r = (f.vw * 0.9) * (1 - tight * 0.35) + Math.sin(a * 0.5) * 2, yy = f.y - f.vh / 2 + (a / (Math.PI * 8)) * f.vh;
        const x = f.x + Math.cos(a) * r, y = yy + Math.sin(a) * r * 0.3;
        a ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
    // 2) lưỡi liềm khổng lồ bổ ngang
    if (t >= 50 && t < 90) {
        const k = (t - 50) / 40, R = Math.hypot(W, H) * 0.6;
        ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(-0.25);
        const a0 = Math.PI * (1.1 - k * 1.3);
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = `rgba(254,226,226,${1 - k * 0.6})`; ctx.lineWidth = 6 * (1 - k) + 2; ctx.shadowBlur = 24; ctx.shadowColor = KG_RED;
        ctx.beginPath(); ctx.arc(0, -R * 0.15, R * 0.55, a0, a0 + 0.9); ctx.stroke();
        ctx.fillStyle = `rgba(239,68,68,${0.45 * (1 - k)})`; ctx.beginPath(); ctx.ellipse(0, 0, 30 + k * 160, 5 + k * 14, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }
    // 3) mục tiêu bị rút cạn (co lại, xám đi)
    const drain = t >= 60 ? Math.min(1, (t - 60) / 30) : 0;
    ctx.shadowBlur = 0;
    ctx.fillStyle = `rgba(${30 + 60 * (1 - drain)}, 20, 25, ${1 - drain * 0.7})`;
    TA.rr(f.x - f.vw / 2 * (1 - drain * 0.4), f.y - f.vh / 2 * (1 - drain * 0.4), f.vw * (1 - drain * 0.4), f.vh * (1 - drain * 0.4), 4); ctx.fill();
    // 4) mưa máu
    if (t >= 62) {
        ctx.fillStyle = KG_RED; ctx.shadowBlur = 6; ctx.shadowColor = KG_RED;
        for (let i = 0; i < 46; i++) {
            const sx = ((i * 97.3 + f.seed * 40) % W), sp = 5 + (i % 7), y = ((t - 62) * sp + i * 53) % (H + 40) - 20;
            ctx.fillRect(sx, y, 1.6, 6 + (i % 4) * 2);
        }
    }
    ctx.restore();
    // chữ
    if (t >= 20) {
        const a = Math.min(1, (t - 20) / 8) * fade;
        const cxv = (typeof fatalCinematic !== 'undefined' && fatalCinematic && fatalCinematic.active) ? fatalCinematic.victimX : W / 2;
        const cyv = (typeof fatalCinematic !== 'undefined' && fatalCinematic && fatalCinematic.active) ? fatalCinematic.victimY : H / 2;
        ctx.save();
        ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.translate(cxv, cyv + (f.team === 1 ? 130 : -130));
        if (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest') ctx.rotate(Math.PI);
        const sc = t < 28 ? 1.4 - (t - 20) / 8 * 0.4 : 1; ctx.scale(sc, sc);
        ctx.font = "900 24px 'Orbitron', Arial"; ctx.lineWidth = 5; ctx.strokeStyle = '#000';
        ctx.shadowBlur = 18; ctx.shadowColor = KG_RED; ctx.fillStyle = '#fee2e2';
        ctx.strokeText('HUYẾT LIÊM', 0, -15); ctx.fillText('HUYẾT LIÊM', 0, -15);
        ctx.fillStyle = KG_RED;
        ctx.strokeText('ĐOẠT MỆNH', 0, 15); ctx.fillText('ĐOẠT MỆNH', 0, 15);
        ctx.restore();
    }
}
function kgFxOver() {
    if (typeof bodyEffects === 'undefined') return;
    for (const e of bodyEffects) if (e instanceof KgFinisher && e.active) e.drawOver();
}

function kgRegisterHUD() {
    if (typeof registerEmpowerHUD !== 'function') return;
    registerEmpowerHUD('kusarigama', p => {
        const st = p.kgStyle || 0, icon = KG_ICONS[st], name = KG_STYLES[st], cd = (p.kgCds && p.kgCds[st]) || 0;
        const col = p.kgBers ? KG_RED : (st === 0 ? KG_STEEL : (st === 1 ? '#f87171' : KG_GOLD));
        if (p.kgHold > 0) return { pct: Math.min(1, p.kgHold / kgHoldN(p)), ready: false, color: KG_GOLD, label: 'ĐỔI → ' + KG_STYLES[(st + 1) % 3], btnIcon: KG_ICONS[(st + 1) % 3] };
        if (kgMine(p, KgVortex).some(v => v.mode === 'spin')) return { pct: 1, ready: true, color: KG_RED, label: 'NHẤP: THU XÍCH', btnIcon: '⛓' };
        if (cd > 0) return { pct: 1 - cd / KG_CDS[st], ready: false, color: '#64748b', label: name + ' ' + (cd / 60).toFixed(1) + 's', btnIcon: icon, dim: true };
        const s = p.kgStk || 0;
        return { pct: s / 5, ready: !kgBusy(p), color: col, label: (p.kgBers ? '🩸' : '') + name + ' x' + kgMult(p).toFixed(1), btnIcon: icon };
    });
}
if (typeof window !== 'undefined') window.addEventListener('load', kgRegisterHUD);
