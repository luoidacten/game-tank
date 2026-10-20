// ==========================================
// Nhện Độc (arachnid) — Hình ảnh: xe nhện (bụng đen tím, đồng hồ cát đỏ, 8 chân, nanh xanh độc),
// đạn tơ, Vùng Tơ Nhện, vòng Tơ Quấn quanh địch, Kén trắng + "KÉN!" đỏ, dây tơ khi vồ, Nhện Con,
// HUD Cú Vồ, kết liễu "HÓA KÉN KẾT LIỄU". Chỉ đọc state -> an toàn online.
// ==========================================

function arNow() { return Date.now() / 1000; }

// ---------- Xe nhện ----------
registerTankArt('arachnid', (p, k) => {
    const t = k.t, rec = (p.arRecoil || 0) / 8, act = p.arMode && p.arMode !== 'idle';
    // 8 chân (4 mỗi bên) đung đưa
    ctx.lineCap = 'round';
    for (let s = -1; s <= 1; s += 2) for (let i = 0; i < 4; i++) {
        const ph = Math.sin(t * (act ? 22 : 9) + i * 1.7 + (s > 0 ? 1 : 0)) * 1.6;
        const by = -6 + i * 4.2, kx = s * (11 + (i === 1 || i === 2 ? 2 : 0)), ky = by - 3 + ph, fx = s * (15.5 - (i === 0 || i === 3 ? 1 : 0)), fy = by + (i < 2 ? -4 : 4) + ph;
        ctx.strokeStyle = '#1e1b2e'; ctx.lineWidth = 2.6;
        ctx.beginPath(); ctx.moveTo(s * 5, by); ctx.lineTo(kx, ky); ctx.lineTo(fx, fy); ctx.stroke();
        ctx.strokeStyle = 'rgba(163, 230, 53, 0.75)'; ctx.lineWidth = 0.7;
        ctx.beginPath(); ctx.moveTo(kx, ky); ctx.lineTo(fx, fy); ctx.stroke();
    }
    // bụng (phía sau)
    const ab = ctx.createRadialGradient(-2, 5, 1, 0, 6, 10);
    ab.addColorStop(0, '#4c1d95'); ab.addColorStop(0.6, '#1e1033'); ab.addColorStop(1, '#0b0614');
    ctx.fillStyle = ab; ctx.beginPath(); ctx.ellipse(0, 6, 8.6, 8.4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = k.team; ctx.lineWidth = 1; TA.glow(k.teamGlow, 6); ctx.stroke(); TA.noGlow();
    // đồng hồ cát đỏ phát sáng
    TA.glow(AR_RED, 8); ctx.fillStyle = AR_RED;
    ctx.beginPath(); ctx.moveTo(-3, 2.5); ctx.lineTo(3, 2.5); ctx.lineTo(0.6, 6); ctx.lineTo(3, 9.5); ctx.lineTo(-3, 9.5); ctx.lineTo(-0.6, 6); ctx.closePath(); ctx.fill();
    TA.noGlow();
    // vân xanh độc
    ctx.strokeStyle = 'rgba(163, 230, 53, 0.55)'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.arc(0, 6, 6.6, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke();
    // đầu ngực (cephalothorax)
    ctx.fillStyle = TA.metal(-6, 6, '#1e1b2e', '#3b2a5c');
    ctx.beginPath(); ctx.ellipse(0, -5, 6, 5.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.7)'; ctx.lineWidth = 0.7; ctx.stroke();
    // mắt đỏ (8 mắt)
    TA.glow(AR_RED, 5); ctx.fillStyle = '#ff4d6d';
    [[-2.2, -7.4, 1.1], [2.2, -7.4, 1.1], [-0.8, -8.4, 0.8], [0.8, -8.4, 0.8], [-3.6, -6.2, 0.6], [3.6, -6.2, 0.6], [-1.5, -5.9, 0.5], [1.5, -5.9, 0.5]]
        .forEach(([x, y, r]) => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); });
    TA.noGlow();
    // nanh độc (nòng)
    const fo = act ? 1.8 : rec * 1.5;
    TA.glow(AR_LIME, 6 + (p.arHold > 0 ? Math.min(10, p.arHold / 3) : 0)); ctx.fillStyle = AR_LIME;
    for (let s = -1; s <= 1; s += 2) {
        ctx.beginPath(); ctx.moveTo(s * 1.4, -10); ctx.quadraticCurveTo(s * (3.8 + fo), -13.5, s * (1.2 + fo * 0.4), -16.5 - rec * 2); ctx.lineTo(s * 0.6, -11); ctx.closePath(); ctx.fill();
    }
    TA.noGlow();
    // tuyến tơ (spinneret) đuôi
    ctx.fillStyle = AR_SILK; ctx.beginPath(); ctx.arc(0, 14.2, 1.4, 0, Math.PI * 2); ctx.fill();
    if (k.evo1) { ctx.strokeStyle = 'rgba(241,245,249,0.6)'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(-8, 2); ctx.lineTo(8, 10); ctx.moveTo(8, 2); ctx.lineTo(-8, 10); ctx.stroke(); }
    if (k.evo2) { ctx.fillStyle = AR_LIME; [[-5, 11], [5, 11], [0, 12.5]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill(); }); }
    if (k.full) { // vương miện Nữ Hoàng
        TA.glow(AR_VIOLET, 8); ctx.fillStyle = '#e9d5ff';
        ctx.beginPath(); ctx.moveTo(-4, -9.6); ctx.lineTo(-3, -12); ctx.lineTo(-1.4, -10.4); ctx.lineTo(0, -12.8); ctx.lineTo(1.4, -10.4); ctx.lineTo(3, -12); ctx.lineTo(4, -9.6); ctx.closePath(); ctx.fill();
        TA.noGlow();
    }
});

// ---------- Đạn tơ ----------
function arDrawShot(b) {
    const x = b.x + b.w / 2, y = b.y + b.h / 2, up = b.vy < 0 ? 1 : -1, t = arNow();
    ctx.save();
    ctx.strokeStyle = 'rgba(241,245,249,0.45)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, y + up * 4); ctx.lineTo(x + Math.sin(t * 20) * 2, y + up * 18); ctx.stroke();
    ctx.shadowBlur = 10; ctx.shadowColor = AR_LIME;
    ctx.fillStyle = AR_SILK; ctx.beginPath(); ctx.arc(x, y, 4.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = AR_LIME;
    for (let i = 0; i < 3; i++) { const an = t * 9 + i * 2.1; ctx.beginPath(); ctx.arc(x + Math.cos(an) * 4.5, y + Math.sin(an) * 4.5, 1.4, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
}

// ---------- Vùng Tơ Nhện ----------
function arDrawWeb(z) {
    const hw = z.r * ZONE_AX, hh = z.r * ZONE_AY;
    const a = z.big ? 0.9 : Math.min(1, z.life / 30) * Math.min(1, z.t / 6);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = z.big ? 'rgba(168, 85, 247, 0.12)' : 'rgba(163, 230, 53, 0.08)';
    zoneRectPath(z.x, z.y, z.r); ctx.fill();
    ctx.strokeStyle = 'rgba(241,245,249,0.75)'; ctx.lineWidth = 0.9; ctx.shadowBlur = 6; ctx.shadowColor = '#ffffff';
    const N = 8;
    ctx.beginPath();
    for (let i = 0; i < N; i++) { const an = z.seed + i * Math.PI * 2 / N; ctx.moveTo(z.x, z.y); ctx.lineTo(z.x + Math.cos(an) * hw, z.y + Math.sin(an) * hh); }
    ctx.stroke();
    for (let ring = 1; ring <= 3; ring++) {
        const f = ring / 3.3;
        ctx.beginPath();
        for (let i = 0; i <= N; i++) { const an = z.seed + i * Math.PI * 2 / N; ctx.lineTo(z.x + Math.cos(an) * hw * f, z.y + Math.sin(an) * hh * f); }
        ctx.stroke();
    }
    ctx.shadowBlur = 0;
    ctx.strokeStyle = z.big ? 'rgba(168, 85, 247, 0.6)' : 'rgba(163, 230, 53, 0.45)'; ctx.setLineDash([4, 4]);
    zoneRectPath(z.x, z.y, z.r); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
}

// ---------- Nhện Con ----------
function arDrawSpiderling(s) {
    const x = s.x + s.w / 2, y = s.y + s.h / 2, t = arNow() * 18 + s.seed;
    ctx.save();
    ctx.strokeStyle = '#d9f99d'; ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) for (let k = -1; k <= 1; k += 2) {
        const an = (i - 1.5) * 0.5 + Math.sin(t + i) * 0.2;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + k * Math.cos(an) * 7, y + Math.sin(an) * 7); ctx.stroke();
    }
    ctx.shadowBlur = 8; ctx.shadowColor = AR_LIME;
    ctx.fillStyle = '#1e1033'; ctx.beginPath(); ctx.arc(x, y, 3.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = AR_LIME; ctx.beginPath(); ctx.arc(x, y, 1.4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}

// ---------- Vòng Tơ Quấn + Kén trên địch ----------
function arDrawVictim(owner, e) {
    if (!e || e.hp <= 0) return;
    const cx = e.x + e.w / 2, cy = e.y + e.h / 2, t = arNow();
    ctx.save();
    const stk = e.arVStk || 0;
    if (stk > 0 && !(e.arVCoc > 0)) {
        const need = arNeed(owner);
        ctx.strokeStyle = 'rgba(241,245,249,0.85)'; ctx.lineWidth = 1.4; ctx.shadowBlur = 6; ctx.shadowColor = '#ffffff';
        for (let i = 0; i < stk; i++) {
            const rot = t * (1.2 + i * 0.4) * (i % 2 ? -1 : 1) + i * 0.8;
            ctx.beginPath(); ctx.ellipse(cx, cy, e.w * 0.62 + i * 2, e.h * 0.28 + i * 1.5, rot, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.shadowBlur = 0;
        // chấm đếm tầng
        const y = e.id === 1 ? e.y + e.h + 22 : e.y - 22;
        for (let i = 0; i < need; i++) {
            ctx.fillStyle = i < stk ? AR_SILK : 'rgba(241,245,249,0.2)';
            ctx.beginPath(); ctx.arc(cx + (i - (need - 1) / 2) * 7, y, 2.3, 0, Math.PI * 2); ctx.fill();
        }
    }
    if (e.arVCoc > 0) {
        const k = e.arVCoc / Math.max(1, e.arVCocMax || 1);
        const rx = e.w * 0.7, ry = e.h * 0.95;
        const g = ctx.createRadialGradient(cx - rx * 0.3, cy - ry * 0.3, 2, cx, cy, ry);
        g.addColorStop(0, 'rgba(255,255,255,0.97)'); g.addColorStop(0.7, 'rgba(226,232,240,0.92)'); g.addColorStop(1, 'rgba(203,213,225,0.85)');
        ctx.shadowBlur = 14; ctx.shadowColor = '#ffffff';
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.save(); ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.clip();
        ctx.strokeStyle = 'rgba(148,163,184,0.75)'; ctx.lineWidth = 1;
        for (let i = -6; i <= 6; i++) { ctx.beginPath(); ctx.moveTo(cx - rx, cy + i * 5 - 6); ctx.lineTo(cx + rx, cy + i * 5 + 6); ctx.stroke(); }
        ctx.strokeStyle = 'rgba(168,85,247,0.35)';
        for (let i = -6; i <= 6; i++) { ctx.beginPath(); ctx.moveTo(cx - rx, cy + i * 6 + 5); ctx.lineTo(cx + rx, cy + i * 6 - 5); ctx.stroke(); }
        ctx.restore();
        // vòng thời gian
        ctx.strokeStyle = AR_RED; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(cx, cy, rx + 4, ry + 4, 0, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); ctx.stroke();
        // "KÉN!" nhấp nháy đỏ
        if (Math.floor(t * 8) % 2 === 0) {
            ctx.font = "900 14px 'Orbitron', Arial"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillStyle = AR_RED; ctx.strokeStyle = '#000'; ctx.lineWidth = 3; ctx.shadowBlur = 10; ctx.shadowColor = AR_RED;
            const ty = e.id === 1 ? e.y + e.h + 26 : e.y - 26;
            ctx.lineWidth = 0;
            drawWorldText(ctx, 'KÉN!', cx, ty);
        }
    }
    if (e.arVPois > 0) {
        ctx.fillStyle = 'rgba(163,230,53,0.8)';
        for (let i = 0; i < 3; i++) { const ph = (t * 1.5 + i / 3) % 1; ctx.beginPath(); ctx.arc(cx - 8 + i * 8, cy - ph * 16, 2 * (1 - ph) + 0.5, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.restore();
}

CharHooks.register('arachnid', Object.assign(CharHooks.registry.arachnid || {}, {
    draw() {
        const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
        ctx.save();
        // dây tơ khi vồ
        if (this.arMode && this.arMode !== 'idle' && this.arOrigin) {
            const ox = this.arOrigin.x + this.w / 2, oy = this.arOrigin.y + this.h / 2, lunge = this.arMode === 'lunge';
            ctx.strokeStyle = lunge ? 'rgba(254, 202, 202, 0.9)' : 'rgba(241,245,249,0.85)'; ctx.lineWidth = lunge ? 2 : 1.3;
            ctx.shadowBlur = 8; ctx.shadowColor = lunge ? AR_RED : '#ffffff';
            ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(cx, cy); ctx.stroke();
            ctx.shadowBlur = 0;
            if (lunge) { // bóng mờ bất tử
                ctx.strokeStyle = 'rgba(239,68,68,0.6)'; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.arc(cx, cy, this.w * 0.8, 0, Math.PI * 2); ctx.stroke();
            }
        }
        // giữ nút: vòng tụ Cú Vồ
        if (this.arHold > 3 && this.arMode === 'idle' && !(this.arCd > 0)) {
            const k = Math.min(1, this.arHold / AR_HOLD);
            ctx.strokeStyle = AR_LIME; ctx.lineWidth = 2; ctx.shadowBlur = 8; ctx.shadowColor = AR_LIME;
            ctx.beginPath(); ctx.arc(cx, cy, this.w * 0.85, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); ctx.stroke();
        }
        if (this.arOnWeb) { ctx.fillStyle = 'rgba(163,230,53,0.5)'; ctx.fillRect(this.x + 2, this.y + this.h / 2 - 1, 3, 2); ctx.fillRect(this.x + this.w - 5, this.y + this.h / 2 - 1, 3, 2); }
        ctx.restore();
    },
    drawUI() { arDrawVictim(this, arEnemy(this)); },
}));

// ---------- Kết liễu "HÓA KÉN KẾT LIỄU" ----------
function arDrawFinisherOver(f) {
    const t = f.t, W = canvas.width, H = canvas.height;
    const fade = t > 115 ? Math.max(0, 1 - (t - 115) / 25) : 1;
    ctx.save();
    // 1) màn hình tối sầm
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = `rgba(5, 2, 12, ${0.72 * Math.min(1, t / 10) * fade})`; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
    // 2) tơ trắng giăng đầy (tâm = nạn nhân)
    const wk = Math.min(1, t / 26);
    ctx.globalAlpha = fade;
    ctx.strokeStyle = 'rgba(241,245,249,0.55)'; ctx.lineWidth = 1; ctx.shadowBlur = 6; ctx.shadowColor = '#fff';
    const N = 14, R = Math.max(W, H) * 1.1 * wk;
    ctx.beginPath();
    for (let i = 0; i < N; i++) { const an = f.seed + i * Math.PI * 2 / N; ctx.moveTo(f.x, f.y); ctx.lineTo(f.x + Math.cos(an) * R, f.y + Math.sin(an) * R); }
    ctx.stroke();
    for (let r = 40; r < R; r += 38) {
        ctx.beginPath();
        for (let i = 0; i <= N; i++) { const an = f.seed + i * Math.PI * 2 / N, rr = r * (1 + 0.06 * Math.sin(i * 3.1)); ctx.lineTo(f.x + Math.cos(an) * rr, f.y + Math.sin(an) * rr); }
        ctx.stroke();
    }
    ctx.shadowBlur = 0;
    // 3) kén khổng lồ treo ngược (rơi xuống từ sợi tơ rồi đung đưa)
    const drop = Math.min(1, Math.max(0, (t - 8) / 22)), sway = Math.sin(t * 0.12) * 0.12 * (1 - Math.min(1, Math.max(0, t - 70) / 20));
    const crush = t >= 78 ? Math.min(1, (t - 78) / 8) : 0;
    const cyy = f.y - 80 + 80 * (1 - Math.pow(1 - drop, 3));
    ctx.save();
    ctx.translate(f.x, f.y - 220); ctx.rotate(sway);
    ctx.strokeStyle = 'rgba(241,245,249,0.9)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, -400); ctx.lineTo(0, cyy - (f.y - 220) - 46); ctx.stroke();
    ctx.translate(0, cyy - (f.y - 220));
    if (crush < 1) {
        const sq = 1 - crush * 0.7;
        ctx.scale(1 + crush * 0.5, sq);
        const g = ctx.createRadialGradient(-10, -14, 3, 0, 0, 52);
        g.addColorStop(0, '#ffffff'); g.addColorStop(0.7, '#e2e8f0'); g.addColorStop(1, '#94a3b8');
        ctx.shadowBlur = 20; ctx.shadowColor = '#fff';
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, 30, 48, 0, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.save(); ctx.clip();
        ctx.strokeStyle = 'rgba(100,116,139,0.6)'; ctx.lineWidth = 1.2;
        for (let i = -10; i <= 10; i++) { ctx.beginPath(); ctx.moveTo(-32, i * 6 - 8); ctx.lineTo(32, i * 6 + 8); ctx.stroke(); }
        ctx.restore();
        // xe địch lờ mờ bên trong (lộn ngược)
        ctx.globalAlpha = 0.35 * fade; ctx.fillStyle = '#111'; ctx.fillRect(-f.vw / 3, -f.vh / 3, f.vw / 1.5, f.vh / 1.5); ctx.globalAlpha = fade;
    }
    ctx.restore();
    // 4) cặp nanh độc khổng lồ lao xuống nghiền nát
    if (t >= 52 && t < 112) {
        const k = Math.min(1, (t - 52) / 26), e3 = k * k * (3 - 2 * k);
        const close = t >= 78 ? Math.min(1, (t - 78) / 6) : 0;
        const fy = f.y - 340 + 290 * e3;
        for (let s = -1; s <= 1; s += 2) {
            ctx.save();
            ctx.translate(f.x + s * (60 - 44 * close), fy);
            ctx.rotate(s * (0.25 - 0.45 * close));
            const g = ctx.createLinearGradient(0, -160, 0, 40);
            g.addColorStop(0, '#1e1033'); g.addColorStop(0.7, '#4c1d95'); g.addColorStop(1, AR_LIME);
            ctx.shadowBlur = 22; ctx.shadowColor = AR_LIME;
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.moveTo(-18, -160); ctx.quadraticCurveTo(s * 30, -40, -s * 4, 46); ctx.quadraticCurveTo(s * 2, -40, 18, -160); ctx.closePath(); ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = 'rgba(163,230,53,0.9)';
            for (let i = 0; i < 3; i++) { const ph = ((t * 0.05) + i / 3) % 1; ctx.beginPath(); ctx.arc(-s * 4, 50 + ph * 40, 3 * (1 - ph) + 1, 0, Math.PI * 2); ctx.fill(); }
            ctx.restore();
        }
    }
    // nổ độc khi nghiền
    if (t >= 80 && t < 120) {
        const k = (t - 80) / 40;
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = `rgba(163, 230, 53, ${0.5 * (1 - k)})`; ctx.beginPath(); ctx.arc(f.x, f.y, 30 + k * 120, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgba(241, 245, 249, ${0.6 * (1 - k)})`;
        for (let i = 0; i < 16; i++) { const an = f.seed + i * 0.39, d = 20 + k * 150; ctx.beginPath(); ctx.arc(f.x + Math.cos(an) * d, f.y + Math.sin(an) * d * 0.8, 3 * (1 - k) + 1, 0, Math.PI * 2); ctx.fill(); }
        ctx.globalCompositeOperation = 'source-over';
    }
    ctx.restore();
    // chữ
    if (t >= 14) {
        const a = Math.min(1, (t - 14) / 8) * fade;
        const cxv = fatalCinematic && fatalCinematic.active ? fatalCinematic.victimX : W / 2;
        const cyv = fatalCinematic && fatalCinematic.active ? fatalCinematic.victimY : H / 2;
        ctx.save();
        ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.translate(cxv, cyv + (f.team === 1 ? 130 : -130));
        if (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest') ctx.rotate(Math.PI);
        const sc = t < 22 ? 1.4 - (t - 14) / 8 * 0.4 : 1; ctx.scale(sc, sc);
        ctx.font = "900 26px 'Orbitron', Arial"; ctx.lineWidth = 5; ctx.strokeStyle = '#000';
        ctx.shadowBlur = 18; ctx.shadowColor = AR_LIME; ctx.fillStyle = AR_SILK;
        ctx.strokeText('HÓA KÉN', 0, -16); ctx.fillText('HÓA KÉN', 0, -16);
        ctx.fillStyle = AR_RED; ctx.shadowColor = AR_RED;
        ctx.strokeText('KẾT LIỄU', 0, 16); ctx.fillText('KẾT LIỄU', 0, 16);
        ctx.restore();
    }
}
function arFxOver() {
    if (typeof bodyEffects === 'undefined') return;
    for (const e of bodyEffects) if (e instanceof ArFinisher && e.active) e.drawOver();
}

function arRegisterHUD() {
    if (typeof registerEmpowerHUD !== 'function') return;
    registerEmpowerHUD('arachnid', p => {
        const e = arEnemy(p), coc = e && e.arVCoc > 0;
        if (p.arMode && p.arMode !== 'idle') return { pct: 1, ready: true, color: AR_RED, label: p.arMode === 'lunge' ? 'XÉ KÉN!' : 'CÚ VỒ!', btnIcon: '🕷' };
        if (p.arCd > 0) return { pct: 1 - p.arCd / AR_CD, ready: false, color: '#64748b', label: 'CÚ VỒ ' + Math.ceil(p.arCd / 60) + 's', btnIcon: '🕸', dim: true };
        if (p.arHold > 0) return { pct: Math.min(1, p.arHold / AR_HOLD), ready: p.arHold >= AR_HOLD, color: AR_LIME, label: 'CÚ VỒ...', btnIcon: '🕷' };
        if (coc) return { pct: 1, ready: true, color: AR_RED, label: 'GIỮ: KẾT LIỄU KÉN!', btnIcon: '🕷' };
        return { pct: 1, ready: true, color: AR_LIME, label: 'GIỮ: CÚ VỒ', btnIcon: '🕷' };
    });
}
if (typeof window !== 'undefined') window.addEventListener('load', arRegisterHUD);
