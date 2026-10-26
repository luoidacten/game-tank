// ==========================================
// The Clock (the_clock) — Hình ảnh: xe mặt đồng hồ (vành vàng, kim giờ/phút quay, quả lắc),
// Kim Giây / Kim Giờ Cường Hóa (treo lơ lửng khi ngưng đọng), lớp phủ TIME ZONE (sân ngả xanh lạnh,
// vòng số La Mã, kim giây quét, khung băng thời gian quanh địch), mặt đồng hồ đếm ngược trên đầu địch,
// HUD (hồi chiêu, giữ), kết liễu "ĐỒNG HỒ ĐIỂM 12 GIỜ". Chỉ đọc state -> an toàn online.
// ==========================================

const TC_ROMAN = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
function tcNow() { return (Date.now() % 1e6) / 1000; }

// ---------- Xe The Clock ----------
registerTankArt('the_clock', (p, k) => {
    const t = k.t, tz = p.tcTZ > 0, rc = (p.tcRecoil || 0) / 8;
    TA.treads(-14, 4.2, -11, 12, t, '#0f172a', '#334155');
    // quả lắc phía sau
    const sw = Math.sin(t * (tz ? 0.6 : 4)) * 0.5;
    ctx.save(); ctx.translate(0, 6); ctx.rotate(sw);
    ctx.strokeStyle = '#a16207'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 5); ctx.stroke();
    ctx.fillStyle = TC_GOLD; ctx.beginPath(); ctx.arc(0, 5.6, 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // nòng (kim)
    ctx.fillStyle = TA.metal(-1.6, 1.6, '#78350f', '#fde68a');
    TA.rr(-1.6, -15 + rc * 2.5, 3.2, 8, 1); ctx.fill();
    // mặt đồng hồ
    TA.glow(tz ? TC_CYAN : k.teamGlow, tz ? 14 : 7);
    ctx.fillStyle = TA.metal(-10.5, 10.5, '#78350f', '#facc15');
    ctx.beginPath(); ctx.arc(0, 0, 10.5, 0, Math.PI * 2); ctx.fill(); TA.noGlow();
    const g = ctx.createRadialGradient(0, -2, 1, 0, 0, 9);
    g.addColorStop(0, tz ? '#ecfeff' : '#fefce8'); g.addColorStop(1, tz ? '#164e63' : '#1e293b');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 8.6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = k.team; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.arc(0, 0, 8.6, 0, Math.PI * 2); ctx.stroke();
    // vạch giờ
    ctx.strokeStyle = tz ? TC_CYAN : '#fde68a'; ctx.lineWidth = 0.7;
    for (let i = 0; i < 12; i++) {
        const a = i * Math.PI / 6, r0 = i % 3 === 0 ? 5.6 : 6.6;
        ctx.beginPath(); ctx.moveTo(Math.sin(a) * r0, -Math.cos(a) * r0); ctx.lineTo(Math.sin(a) * 7.8, -Math.cos(a) * 7.8); ctx.stroke();
    }
    // kim (đứng yên trong Time_Zone)
    const tt = tz ? 0 : t;
    const am = tt * 1.5, ah = tt * 0.125;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#f8fafc'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(ah) * 4.2, -Math.cos(ah) * 4.2); ctx.stroke();
    ctx.strokeStyle = TC_GOLD; ctx.lineWidth = 0.9;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(am) * 6.6, -Math.cos(am) * 6.6); ctx.stroke();
    ctx.lineCap = 'butt';
    ctx.fillStyle = k.team; ctx.beginPath(); ctx.arc(0, 0, 1.3, 0, Math.PI * 2); ctx.fill();
    if (k.evo1) { ctx.fillStyle = TC_GOLD; for (let i = -1; i <= 1; i += 2) { ctx.beginPath(); ctx.arc(i * 11.5, -6, 1.5, 0, Math.PI * 2); ctx.fill(); } }
    if (k.evo2) { ctx.strokeStyle = 'rgba(103,232,249,0.8)'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.arc(0, 0, 12.3, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke(); }
    if (k.full) { TA.glow(TC_GOLD, 10); ctx.strokeStyle = TC_GOLD; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(0, 0, 13, -Math.PI * 0.85, -Math.PI * 0.15); ctx.stroke(); TA.noGlow(); }
});

// ---------- Đạn: Kim Giây / Kim Giờ Cường Hóa ----------
function tcDrawNeedle(b) {
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    const vy = b.tcHeld ? b.tcVy : b.vy, vx = b.tcHeld ? b.tcVx : b.vx;
    const a = Math.atan2(vy || (b.owner && b.owner.id === 2 ? 1 : -1), vx || 0);
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(a);
    if (b.tcTZ) {
        const pulse = b.tcHeld ? 0.5 + 0.5 * Math.sin(tcNow() * 10 + b.x) : 1;
        ctx.shadowBlur = 10 + pulse * 8; ctx.shadowColor = b.tcRev ? TC_VIO : TC_GOLD;
        ctx.fillStyle = b.tcRev ? '#ddd6fe' : '#fde68a';
        ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(2, -3.2); ctx.lineTo(-7, -1.2); ctx.lineTo(-9, 0); ctx.lineTo(-7, 1.2); ctx.lineTo(2, 3.2); ctx.closePath(); ctx.fill();
        ctx.fillStyle = TC_WHITE; ctx.beginPath(); ctx.arc(-6, 0, 1.6, 0, Math.PI * 2); ctx.fill();
        if (b.tcHeld) {
            ctx.shadowBlur = 0; ctx.strokeStyle = `rgba(103,232,249,${0.35 + pulse * 0.4})`; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(0, 0, 8 + pulse * 2, 0, Math.PI * 2); ctx.stroke();
        } else {
            ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(251,191,36,0.45)'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(-22, 0); ctx.stroke();
        }
    } else {
        ctx.shadowBlur = 8; ctx.shadowColor = TC_CYAN;
        ctx.fillStyle = TC_WHITE;
        ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(-5, -1.6); ctx.lineTo(-7, 0); ctx.lineTo(-5, 1.6); ctx.closePath(); ctx.fill();
        if (b.tcHeld) { ctx.strokeStyle = 'rgba(103,232,249,0.6)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.stroke(); }
    }
    ctx.restore();
}

// ---------- Mặt đồng hồ đếm ngược trên đầu địch ----------
function tcDrawCountdown(owner, e) {
    const h = e.tcHits || 0;
    if (h <= 0 || e.hp <= 0) return;
    const N = tcExecN(owner), cx = e.x + e.w / 2, cy = e.id === 1 ? e.y - 20 : e.y + e.h + 20;
    const pop = (e.tcPop || 0) / 18, ring = (e.tcRing || 0) / 30, r = 9 + pop * 2;
    const f = Math.min(1, h / N), danger = f >= 0.75;
    ctx.save();
    ctx.shadowBlur = 6 + ring * 14; ctx.shadowColor = danger ? '#f43f5e' : TC_GOLD;
    ctx.fillStyle = 'rgba(15,23,42,0.85)'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(251,191,36,0.25)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = danger ? '#fb7185' : TC_GOLD; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + f * Math.PI * 2); ctx.stroke();
    // kim chỉ tiến độ
    const a = -Math.PI / 2 + f * Math.PI * 2;
    ctx.shadowBlur = 0; ctx.strokeStyle = TC_WHITE; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * (r - 3), cy + Math.sin(a) * (r - 3)); ctx.stroke();
    ctx.fillStyle = danger ? '#fecdd3' : '#fef3c7'; ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(h), cx, cy + 0.5);
    if (ring > 0) { ctx.strokeStyle = `rgba(251,191,36,${ring})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, r + (1 - ring) * 16, 0, Math.PI * 2); ctx.stroke(); }
    ctx.restore();
}

CharHooks.register('the_clock', Object.assign(CharHooks.registry.the_clock || {}, {
    draw() {
        const p = this;
        if (p.hp <= 0) return;
        const hold = p.tcHold || 0;
        if (hold > 4 && !p.tcUsed) {
            const need = p.tcTZ > 0 ? TC_HOLD_END : TC_HOLD_TZ, f = Math.min(1, hold / need), cx = p.x + p.w / 2, cy = p.y + p.h / 2;
            ctx.save(); ctx.strokeStyle = p.tcTZ > 0 ? TC_GOLD : TC_CYAN; ctx.lineWidth = 2; ctx.shadowBlur = 8; ctx.shadowColor = ctx.strokeStyle;
            ctx.beginPath(); ctx.arc(cx, cy, p.w * 0.75, -Math.PI / 2, -Math.PI / 2 + f * Math.PI * 2); ctx.stroke(); ctx.restore();
        }
        // Time Zone: đánh dấu tím các viên đạn địch sẽ bị Kim Nghịch Chuyển đảo chiều
        const e = tcEnemy(p);
        if (p.tcTZ > 0 && e && e.bullets) {
            const cx = p.x + p.w / 2, cy = p.y + p.h / 2, t = tcNow();
            const list = e.bullets.filter(b => b && !b.isLazer && !b.isRaycast && !b.isBeam && (b.w || 0) <= 40 && (b.h || 0) <= 60 && (p.id === 1 ? (b.vy || 0) > 0 : (b.vy || 0) < 0))
                .map(b => [Math.hypot(b.x + (b.w || 0) / 2 - cx, b.y + (b.h || 0) / 2 - cy), b]).sort((a, b) => a[0] - b[0]).slice(0, TC_REV_MAX);
            ctx.save(); ctx.strokeStyle = TC_VIO; ctx.shadowBlur = 8; ctx.shadowColor = TC_VIO; ctx.lineWidth = 1.2;
            for (const [, b] of list) {
                const bx = b.x + (b.w || 0) / 2, by = b.y + (b.h || 0) / 2, r = Math.max(b.w || 0, b.h || 0) * 0.6 + 5;
                ctx.globalAlpha = 0.6 + 0.3 * Math.sin(t * 8 + bx);
                ctx.beginPath(); ctx.arc(bx, by, r, t * 3, t * 3 + Math.PI * 1.5); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(bx - 3, by - p.id * 0 + (p.id === 1 ? 4 : -4)); ctx.lineTo(bx, by + (p.id === 1 ? -2 : 2)); ctx.lineTo(bx + 3, by + (p.id === 1 ? 4 : -4)); ctx.stroke();
            }
            ctx.restore();
        }
    },
    drawUI() {
        if (this.hp <= 0) return;
        const e = tcEnemy(this);
        if (e) tcDrawCountdown(this, e);
        if (typeof hudExtraBar === 'function') {
            if (this.tcTZ > 0) hudExtraBar(this, 0, this.tcTZ / TC_TZ_DUR, TC_CYAN, { h: 2.5 });
            else hudExtraBar(this, 0, 1 - (this.tcCd || 0) / tcCdMax(this), (this.tcCd || 0) <= 0 ? TC_GOLD : 'rgba(251,191,36,0.45)', { h: 2.5 });
        }
    },
}));

// ---------- Lớp phủ TIME ZONE ----------
function tcDrawZone(c) {
    const W = canvas.width, H = canvas.height, t = tcNow();
    const intro = (c.tcTZFx || 0) / 24, f = c.tcTZ / TC_TZ_DUR;
    ctx.save();
    ctx.fillStyle = `rgba(8,47,73,${0.22 + intro * 0.25})`; ctx.fillRect(0, 0, W, H);
    // vòng số La Mã giữa sân
    const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.36;
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = TC_CYAN; ctx.lineWidth = 1.2; ctx.shadowBlur = 10; ctx.shadowColor = TC_CYAN;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.86, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#a5f3fc'; ctx.font = 'bold 13px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6 - Math.PI / 2; ctx.fillText(TC_ROMAN[i], cx + Math.cos(a) * R * 0.93, cy + Math.sin(a) * R * 0.93); }
    // vòng thời gian còn lại + kim giây quét ngược
    ctx.globalAlpha = 0.85; ctx.strokeStyle = TC_GOLD; ctx.shadowColor = TC_GOLD; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(cx, cy, R * 1.04, -Math.PI / 2, -Math.PI / 2 + f * Math.PI * 2); ctx.stroke();
    const a = -Math.PI / 2 + f * Math.PI * 2;
    ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * R * 0.8, cy + Math.sin(a) * R * 0.8); ctx.stroke();
    ctx.fillStyle = TC_GOLD; ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.9; ctx.shadowBlur = 8; ctx.fillStyle = '#ecfeff'; ctx.font = 'bold 15px monospace';
    ctx.fillText('TIME ZONE ' + (c.tcTZ / 60).toFixed(1) + 's', cx, cy + R * 0.42);
    // khung thời gian quanh địch bị ngưng đọng
    const e = tcEnemy(c);
    if (e && e.tcFrozen && e.hp > 0) {
        const ex = e.x + e.w / 2, ey = e.y + e.h / 2, rr = Math.max(e.w, e.h) * 0.9;
        ctx.globalAlpha = 0.9; ctx.strokeStyle = TC_CYAN; ctx.lineWidth = 1.5; ctx.shadowColor = TC_CYAN; ctx.shadowBlur = 12;
        ctx.setLineDash([4, 3]); ctx.lineDashOffset = 0;
        ctx.beginPath(); ctx.arc(ex, ey, rr, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
        for (let i = 0; i < 4; i++) {
            const b = i * Math.PI / 2 + Math.PI / 4;
            ctx.beginPath(); ctx.moveTo(ex + Math.cos(b) * (rr - 4), ey + Math.sin(b) * (rr - 4)); ctx.lineTo(ex + Math.cos(b) * (rr + 4), ey + Math.sin(b) * (rr + 4)); ctx.stroke();
        }
        ctx.fillStyle = 'rgba(165,243,252,0.18)'; ctx.beginPath(); ctx.arc(ex, ey, rr, 0, Math.PI * 2); ctx.fill();
    }
    // hạt bụi thời gian đứng yên
    ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(236,254,255,0.55)';
    for (let i = 0; i < 26; i++) {
        const x = (i * 97.3 + 13) % W, y = (i * 61.7 + 29) % H;
        ctx.fillRect(x, y, 1.5, 1.5);
    }
    if (intro > 0) { ctx.globalAlpha = intro * 0.6; ctx.fillStyle = '#ecfeff'; ctx.fillRect(0, 0, W, H); }
    void t;
    ctx.restore();
}
function tcDrawRelease(c) {
    const k = (c.tcRelFx || 0) / 20;
    if (k <= 0) return;
    const W = canvas.width, H = canvas.height;
    ctx.save(); ctx.globalAlpha = k * 0.35; ctx.fillStyle = TC_GOLD; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = k; ctx.strokeStyle = TC_GOLD; ctx.lineWidth = 3; ctx.shadowBlur = 16; ctx.shadowColor = TC_GOLD;
    ctx.beginPath(); ctx.arc(W / 2, H / 2, Math.min(W, H) * (0.36 + (1 - k) * 0.4), 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
}

// ---------- Kết liễu "ĐỒNG HỒ ĐIỂM 12 GIỜ" ----------
function tcDrawFinisherUnder(f) {
    const W = canvas.width, H = canvas.height, t = f.t;
    const fin = Math.min(1, t / 20), fade = t > 120 ? Math.max(0, 1 - (t - 120) / 30) : 1;
    const cx = f.x, cy = f.y, R = Math.min(W, H) * 0.36 * (0.6 + 0.4 * fin);
    ctx.save(); ctx.globalAlpha = 0.75 * fade;
    const g = ctx.createRadialGradient(cx, cy, 10, cx, cy, R);
    g.addColorStop(0, 'rgba(120,53,15,0.35)'); g.addColorStop(1, 'rgba(15,23,42,0.75)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = TC_GOLD; ctx.lineWidth = 3; ctx.shadowBlur = 16; ctx.shadowColor = TC_GOLD;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, R * 0.82, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#fde68a'; ctx.font = `bold ${Math.round(R * 0.11)}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6 - Math.PI / 2; ctx.fillText(i === 0 ? 'XXIV' : TC_ROMAN[i], cx + Math.cos(a) * R * 0.91, cy + Math.sin(a) * R * 0.91); }
    // kim giờ & kim phút quay về 12 rồi chập làm một
    const k = Math.min(1, t / 30), ease = 1 - Math.pow(1 - k, 3);
    const am = -Math.PI / 2 + (1 - ease) * Math.PI * 3.3, ah = -Math.PI / 2 + (1 - ease) * Math.PI * 1.1;
    ctx.lineCap = 'round';
    ctx.strokeStyle = TC_WHITE; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ah) * R * 0.5, cy + Math.sin(ah) * R * 0.5); ctx.stroke();
    ctx.strokeStyle = TC_GOLD; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(am) * R * 0.75, cy + Math.sin(am) * R * 0.75); ctx.stroke();
    ctx.lineCap = 'butt';
    ctx.fillStyle = TC_GOLD; ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}
function tcDrawFinisherOver(f) {
    const W = canvas.width, H = canvas.height, t = f.t;
    const fade = t > 120 ? Math.max(0, 1 - (t - 120) / 30) : 1;
    ctx.save();
    if (t >= 30) {
        // vết nứt thời không xé qua mục tiêu
        const k = Math.min(1, (t - 30) / 12);
        if (t < 37) { ctx.globalAlpha = (37 - t) / 7 * 0.8; ctx.fillStyle = '#fffbeb'; ctx.fillRect(0, 0, W, H); }
        ctx.globalAlpha = fade; ctx.strokeStyle = '#fef3c7'; ctx.shadowBlur = 20; ctx.shadowColor = TC_GOLD; ctx.lineWidth = 3;
        const pts = [];
        for (let i = 0; i <= 10; i++) { const yy = f.y + (i - 5) * 26 * k; pts.push([f.x + ((i * 37) % 13 - 6) * 1.6 * (i % 2 ? 1 : -1), yy]); }
        ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
        ctx.strokeStyle = 'rgba(167,139,250,0.9)'; ctx.lineWidth = 1.2;
        ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x + 4, y + 2) : ctx.moveTo(x + 4, y + 2)); ctx.stroke();
        ctx.fillStyle = 'rgba(15,23,42,0.9)'; ctx.beginPath(); ctx.ellipse(f.x, f.y, 5 * k, 30 * k, 0, 0, Math.PI * 2); ctx.fill();
        // chữ
        ctx.shadowBlur = 18; ctx.fillStyle = TC_GOLD; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = 'bold 40px serif'; ctx.fillText("XXIV", f.x, f.y + (f.y < H / 2 ? 70 : -70));
        ctx.font = 'bold 15px sans-serif'; ctx.fillStyle = '#fef3c7';
        ctx.fillText("ĐỒNG HỒ ĐIỂM 12 GIỜ", f.x, f.y + (f.y < H / 2 ? 98 : -42));
    }
    ctx.restore();
}

function tcFxOver() {
    if (typeof p1 === 'undefined') return;
    for (const c of [p1, p2]) {
        if (!tcIs(c)) continue;
        if (c.tcTZ > 0) tcDrawZone(c);
        tcDrawRelease(c);
    }
    if (typeof bodyEffects === 'undefined') return;
    for (const e of bodyEffects) if (e instanceof TcFinisher && e.active) e.drawOver();
}
