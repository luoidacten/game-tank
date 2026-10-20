// ==========================================
// Pháo Phân Mảnh (cluster_gun) — Hình ảnh: pháo tự hành hạng nặng (cối nòng chùm xoay, giá đạn
// hai bên đổi màu theo chế độ), đạn Phân Mảnh (cam) / Dễ Vỡ (pha lê tím hồng), mảnh con, HUD nút
// Bắn (chế độ hiện tại / nhấp TÁCH), kết liễu "✸ PHÂN MẢNH ✸" pháo hoa chùm.
// Chỉ đọc state -> an toàn online.
// ==========================================

function cgNow() { return Date.now() / 1000; }
function cgEase(k) { return 1 - Math.pow(1 - k, 3); }

// ---------- Xe ----------
registerTankArt('cluster_gun', (p, k) => {
    const t = k.t, m = p.cgMode || 0, mc = cgModeColor(m);
    const accent = k.full ? CG_GOLD : mc;
    // bánh xích rộng
    TA.treads(-15.5, 5.5, -12, 13, t, '#11151d', '#454e5c');
    // thân pháo: lục giác dẹt
    ctx.fillStyle = TA.metal(-11, 11, '#1b2230', '#4b5565');
    ctx.beginPath(); ctx.moveTo(-10, -9); ctx.lineTo(10, -9); ctx.lineTo(11, 7); ctx.lineTo(7, 12); ctx.lineTo(-7, 12); ctx.lineTo(-11, 7); ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = k.team; ctx.lineWidth = 1; TA.glow(k.teamGlow, 6); ctx.stroke(); TA.noGlow();
    // giá đạn 2 bên (3 quả mỗi bên, sáng theo chế độ)
    const am = p.ammo || 0, mx = p.maxAmmo || 2;
    for (let s = -1; s <= 1; s += 2) {
        for (let i = 0; i < 3; i++) {
            const lit = i < Math.ceil(am * 3 / Math.max(1, mx));
            ctx.fillStyle = lit ? mc : '#2a3240';
            if (lit) TA.glow(mc, 5);
            TA.rr(s * 7.2 - 1.3, -4 + i * 4.2, 2.6, 3.2, 1.2); ctx.fill(); TA.noGlow();
        }
    }
    // đế xoay
    ctx.fillStyle = TA.metal(-6.5, 6.5, '#263042', '#6b7890');
    ctx.beginPath(); ctx.arc(0, 1.5, 6.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 0.6; ctx.stroke();
    // nòng cối chùm (giật lùi khi bắn)
    const rc = (p.cgRecoil || 0) / 10;
    const by = -2 + rc * 3;
    ctx.fillStyle = TA.metal(-4.6, 4.6, '#3b4658', '#a3b1c2');
    TA.rr(-4.6, by - 13, 9.2, 13, 2); ctx.fill();
    // miệng nòng: 3 ống xoay (Full: 4)
    const n = k.full ? 4 : 3, rot = t * (k.evo1 ? 4 : 2);
    ctx.fillStyle = '#0b0f17'; ctx.beginPath(); ctx.arc(0, by - 13, 4.8, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < n; i++) {
        const a = rot + i * Math.PI * 2 / n;
        ctx.fillStyle = mc; TA.glow(mc, 6);
        ctx.beginPath(); ctx.arc(Math.cos(a) * 2.4, by - 13 + Math.sin(a) * 1.4, 1.15, 0, Math.PI * 2); ctx.fill();
    }
    TA.noGlow();
    // vòng tản nhiệt trên nòng
    ctx.fillStyle = 'rgba(11, 15, 23, 0.7)';
    ctx.fillRect(-4.6, by - 9, 9.2, 1); ctx.fillRect(-4.6, by - 6, 9.2, 1);
    // lõi chế độ ở tháp pháo
    const pulse = 0.65 + 0.35 * Math.sin(t * 6);
    ctx.globalAlpha *= pulse;
    ctx.fillStyle = accent; TA.glow(accent, 10);
    if (m === 1) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(2.4, 2.6); ctx.lineTo(0, 5.2); ctx.lineTo(-2.4, 2.6); ctx.closePath(); ctx.fill(); }
    else { ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r = i % 2 ? 1.2 : 2.8; ctx.lineTo(Math.cos(a) * r, 2.6 + Math.sin(a) * r); } ctx.closePath(); ctx.fill(); }
    TA.noGlow();
    ctx.globalAlpha /= pulse;
    // sau xe: ống xả
    ctx.fillStyle = '#1b2230'; TA.rr(-7, 10.5, 14, 3, 1); ctx.fill();
    if (k.evo2 || k.evo1) {
        ctx.fillStyle = accent; ctx.globalAlpha *= 0.8;
        ctx.fillRect(-5, 11.5, 2, 1); ctx.fillRect(3, 11.5, 2, 1);
        if (k.evo2) ctx.fillRect(-1, 11.5, 2, 1);
        ctx.globalAlpha /= 0.8;
    }
    // Full Evo: vòng mảnh xoay quanh tháp pháo
    if (k.full) {
        ctx.fillStyle = CG_GOLD;
        for (let i = 0; i < 6; i++) { const a = -t * 3 + i * Math.PI / 3; ctx.fillRect(Math.cos(a) * 9 - 0.6, 1.5 + Math.sin(a) * 9 - 0.6, 1.2, 1.2); }
    }
});

// ---------- Đạn ----------
function cgDrawBullet(b) {
    const x = b.x + b.w / 2, y = b.y + b.h / 2, t = cgNow();
    const col = cgModeColor(b.cgM);
    const ang = Math.atan2(b.vy || 0, b.vx || 0);
    ctx.save();
    // vệt sáng
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = col; ctx.globalAlpha = b.cgK === 'frag' ? 0.55 : 0.4; ctx.lineWidth = b.cgK === 'frag' ? 2.5 : 4;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - (b.vx || 0) * 2.6, y - (b.vy || 0) * 2.6); ctx.stroke();
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    ctx.translate(x, y); ctx.rotate(ang + Math.PI / 2);
    ctx.shadowColor = col;
    if (b.cgK === 'split') {
        // đạn chùm: vỏ cam, 3 khoang mảnh, đuôi cánh
        ctx.scale(1.35, 1.35);
        ctx.shadowBlur = 14;
        ctx.fillStyle = '#4a2408';
        ctx.beginPath(); ctx.moveTo(0, -8); ctx.quadraticCurveTo(5, -4, 4.5, 4); ctx.lineTo(-4.5, 4); ctx.quadraticCurveTo(-5, -4, 0, -8); ctx.fill();
        ctx.strokeStyle = col; ctx.lineWidth = 1.2; ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.moveTo(-4.5, 4); ctx.lineTo(-6, 8); ctx.lineTo(-2, 5); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(4.5, 4); ctx.lineTo(6, 8); ctx.lineTo(2, 5); ctx.closePath(); ctx.fill();
        const armed = (b.cgT || 0) >= CG_ARM;
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = armed ? (Math.sin(t * 20 + i) > 0 ? '#fff7d6' : col) : '#7c4a12';
            ctx.beginPath(); ctx.arc(0, -3.5 + i * 3, 1.3, 0, Math.PI * 2); ctx.fill();
        }
        if (armed) {
            ctx.strokeStyle = 'rgba(255, 220, 150, 0.6)'; ctx.lineWidth = 0.8;
            ctx.beginPath(); ctx.arc(0, 0, 9 + Math.sin(t * 18) * 1.2, 0, Math.PI * 2); ctx.stroke();
        }
    } else if (b.cgK === 'fragile') {
        // đạn pha lê dễ vỡ: kim cương tím hồng có vết nứt
        const pul = 1.25 + Math.sin(t * 10) * 0.1;
        ctx.scale(pul, pul);
        ctx.shadowBlur = 14;
        const g = ctx.createLinearGradient(-5, -8, 5, 8);
        g.addColorStop(0, '#fdf4ff'); g.addColorStop(0.45, col); g.addColorStop(1, '#581c87');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.moveTo(0, -8.5); ctx.lineTo(5.5, -1); ctx.lineTo(0, 8); ctx.lineTo(-5.5, -1); ctx.closePath(); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#fdf4ff'; ctx.lineWidth = 0.7; ctx.stroke();
        ctx.strokeStyle = 'rgba(59, 7, 100, 0.85)'; ctx.lineWidth = 0.6;
        ctx.beginPath(); ctx.moveTo(-1, -6); ctx.lineTo(1.2, -2); ctx.lineTo(-1.5, 1); ctx.lineTo(1, 5);
        ctx.moveTo(1.2, -2); ctx.lineTo(3.6, -0.6); ctx.stroke();
        ctx.strokeStyle = 'rgba(232, 121, 249, 0.45)'; ctx.lineWidth = 1;
        ctx.setLineDash([2, 2.5]); ctx.lineDashOffset = -t * 20;
        ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    } else {
        // mảnh con: mảnh sắc nhọn phát sáng xoay
        ctx.rotate((b.cgT || 0) * 0.35);
        ctx.shadowBlur = 8;
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.moveTo(0, -4.2); ctx.lineTo(2.6, 1.2); ctx.lineTo(0.4, 3.2); ctx.lineTo(-2.8, 0.6); ctx.closePath(); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff'; ctx.globalAlpha = 0.85;
        ctx.beginPath(); ctx.arc(0, 0, 1, 0, Math.PI * 2); ctx.fill();
        if (b.cgB > 0) {
            ctx.globalAlpha = 0.6; ctx.strokeStyle = CG_GOLD; ctx.lineWidth = 0.6;
            ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.stroke();
        }
    }
    ctx.restore();
}

// ---------- Kết liễu PHÂN MẢNH ----------
function cgDrawFinisher(f) {
    if (f.t > 100) return;
    const k = f.t / 100;
    ctx.save();
    ctx.strokeStyle = `rgba(255, 159, 28, ${0.6 * (1 - k)})`; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(f.x, f.y, 18 + 110 * cgEase(k), 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
}
function cgDrawFinisherOver(f) {
    const t = f.t, W = canvas.width, H = canvas.height;
    ctx.save();
    const dark = t < 8 ? t / 8 : (t < 70 ? 1 : Math.max(0, 1 - (t - 70) / 30));
    if (dark > 0) { ctx.fillStyle = `rgba(14, 6, 2, ${0.5 * dark})`; ctx.fillRect(-W, -H, W * 3, H * 3); }
    ctx.globalCompositeOperation = 'lighter';
    // chớp nổ trung tâm
    if (t < 30) {
        const k = t / 30;
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 90);
        g.addColorStop(0, `rgba(255, 247, 214, ${0.9 * (1 - k)})`); g.addColorStop(0.4, `rgba(255, 159, 28, ${0.5 * (1 - k)})`); g.addColorStop(1, 'rgba(255, 159, 28, 0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x, f.y, 90, 0, Math.PI * 2); ctx.fill();
    }
    // tầng 1: 12 tia mảnh lớn; mỗi tia lại nổ thành chùm nhỏ (pháo hoa chùm)
    const cols = [CG_SPLIT_C, CG_FRAG_C, CG_GOLD];
    for (let i = 0; i < 12; i++) {
        const a = f.seed + i * Math.PI / 6;
        const k1 = cgEase(Math.min(1, t / 36));
        const R = 70 + (i % 3) * 16;
        const px = f.x + Math.cos(a) * R * k1, py = f.y + Math.sin(a) * R * k1;
        const c = cols[i % 3];
        if (t < 40) {
            ctx.strokeStyle = c; ctx.globalAlpha = 0.9; ctx.lineWidth = 2.2;
            ctx.beginPath(); ctx.moveTo(f.x + Math.cos(a) * R * k1 * 0.55, f.y + Math.sin(a) * R * k1 * 0.55); ctx.lineTo(px, py); ctx.stroke();
        }
        if (t >= 34 && t < 100) {
            const k2 = cgEase(Math.min(1, (t - 34) / 40)), fade = 1 - (t - 34) / 66;
            ctx.globalAlpha = Math.max(0, fade);
            ctx.fillStyle = c;
            for (let j = 0; j < 7; j++) {
                const b2 = a + j * Math.PI * 2 / 7, r2 = 24 * k2;
                const qx = px + Math.cos(b2) * r2, qy = py + Math.sin(b2) * r2 + k2 * 6;
                ctx.beginPath(); ctx.arc(qx, qy, 1.8, 0, Math.PI * 2); ctx.fill();
            }
        }
    }
    ctx.restore();
    if (t >= 24 && t < 115) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, (t - 24) / 8) * (t > 95 ? 1 - (t - 95) / 20 : 1);
        ctx.font = "900 24px 'Orbitron', Arial"; ctx.textAlign = 'center';
        ctx.shadowBlur = 18; ctx.shadowColor = CG_SPLIT_C; ctx.fillStyle = CG_GOLD;
        const ty = Math.max(60, Math.min(H - 60, f.y + (f.team === 1 ? 92 : -84)));
        const sc = 1 + Math.max(0, 1 - (t - 24) / 8) * 0.5;
        ctx.translate(W / 2, ty); ctx.scale(sc, sc);
        if (typeof drawWorldText === 'function') drawWorldText(ctx, '✸ PHÂN MẢNH ✸', 0, 0); else ctx.fillText('✸ PHÂN MẢNH ✸', 0, 0);
        ctx.restore();
    }
}
function cgFxOver() {
    if (typeof bodyEffects === 'undefined') return;
    for (const e of bodyEffects) if (e instanceof CgFinisher && e.active) e.drawOver();
}

// ---------- Quanh xe ----------
Object.assign(CharHooks.registry.cluster_gun, {
    draw() {
        const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
        ctx.save();
        const h = this.cgHold || 0, nm = this.cgMode === 1 ? 0 : 1;
        if (h > 5 && !this.cgHoldUsed) {
            const c = cgModeColor(nm);
            ctx.strokeStyle = c; ctx.shadowColor = c; ctx.shadowBlur = 8; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(cx, cy, this.w * 0.8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, h / CG_HOLD)); ctx.stroke();
        }
        if (this.cgSwapFx > 0) {
            const a = this.cgSwapFx / 18, c = cgModeColor(this.cgMode);
            ctx.strokeStyle = c; ctx.globalAlpha = a; ctx.lineWidth = 2.5 * a + 0.5;
            ctx.beginPath(); ctx.arc(cx, cy, this.w * (0.6 + (1 - a) * 0.7), 0, Math.PI * 2); ctx.stroke();
        }
        ctx.restore();
    },
});

// Nút Bắn: chế độ hiện tại / nhấp TÁCH / giữ đổi chế độ
function cgRegisterHUD() {
    if (typeof registerEmpowerHUD !== 'function') return;
    registerEmpowerHUD('cluster_gun', p => {
        const m = p.cgMode || 0, mx = p.maxAmmo || 2, am = p.ammo || 0;
        const h = p.cgHold || 0;
        if (h > 5 && !p.cgHoldUsed) {
            const nm = m === 1 ? 0 : 1;
            return { pct: Math.min(1, h / CG_HOLD), ready: false, color: cgModeColor(nm), label: 'ĐỔI → ' + (nm === 1 ? 'DỄ VỠ' : 'PHÂN MẢNH'), btnIcon: '⇄' };
        }
        if (cgArmed(p)) return { pct: 1, ready: true, color: CG_SPLIT_C, label: 'NHẤP: TÁCH!', btnIcon: '✸' };
        return { idle: true, pct: am / mx, ready: false, color: cgModeColor(m), label: m === 1 ? 'DỄ VỠ' : 'PHÂN MẢNH', btnIcon: m === 1 ? '◆' : '✸', segments: mx, lit: am };
    });
}
if (typeof window !== 'undefined') window.addEventListener('load', cgRegisterHUD);
