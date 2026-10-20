// ==========================================
// Nhân Bản (clone) — Hình ảnh: xe lượng tử lục giác (lõi ◈, 2 bóng ảnh lệch pha hai bên thân),
// clone hologram bán trong suốt (quét dòng, nhiễu) nối với bản thể bằng dây thần kinh nét đứt,
// Clone Hoàn Hảo viền vàng, HUD số clone + miễn phản phệ, nút Bắn hiện tiến độ giữ 1s,
// kết liễu "◈ VÔ HẠN ◈": mọi bóng hội tụ về mục tiêu rồi gương vỡ tung.
// Chỉ đọc state -> an toàn online.
// ==========================================

function clNow() { return Date.now() / 1000; }
function clEase(k) { return 1 - Math.pow(1 - k, 3); }

// Thân xe trong lưới 32×32 (dùng chung cho bản thể & clone). v: 0 bản thể, 1 clone thường, 2 hoàn hảo
function clHull(k, v, recoil) {
    const t = k.t, acc = v === 2 ? CL_GOLD : CL_CYAN;
    // bóng ảnh lệch pha (motif nhân bản) — chỉ bản thể
    if (v === 0) {
        const n = k.full ? 2 : (k.evo2 ? 2 : 1);
        for (let i = 1; i <= n; i++) {
            const ph = Math.sin(t * 3 + i) * 1.2;
            ctx.save();
            ctx.globalAlpha *= 0.28 / i;
            ctx.strokeStyle = i === 1 ? CL_CYAN : CL_VIO; ctx.lineWidth = 1;
            for (const s of [-1, 1]) {
                ctx.beginPath();
                const ox = s * (2.2 * i + ph);
                ctx.moveTo(ox - 9, -9); ctx.lineTo(ox + 9, -9); ctx.lineTo(ox + 12, 1); ctx.lineTo(ox + 8, 11); ctx.lineTo(ox - 8, 11); ctx.lineTo(ox - 12, 1); ctx.closePath();
                ctx.stroke();
            }
            ctx.restore();
        }
    }
    TA.treads(-15, 5, -11, 12, t, '#0d1220', v ? '#3b4a6b' : '#3f4a63');
    // thân lục giác
    ctx.fillStyle = TA.metal(-12, 12, '#141a2e', v === 2 ? '#4a4030' : '#2c3557');
    ctx.beginPath(); ctx.moveTo(-9, -10); ctx.lineTo(9, -10); ctx.lineTo(12, 1); ctx.lineTo(8, 12); ctx.lineTo(-8, 12); ctx.lineTo(-12, 1); ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = v ? acc : k.team; ctx.lineWidth = 1; TA.glow(v ? acc : k.teamGlow, 6); ctx.stroke(); TA.noGlow();
    // tấm gương hai bên (phản chiếu)
    for (const s of [-1, 1]) {
        const g = ctx.createLinearGradient(s * 6, -6, s * 10, 6);
        g.addColorStop(0, 'rgba(165, 243, 252, 0.75)'); g.addColorStop(0.5, 'rgba(167, 139, 250, 0.35)'); g.addColorStop(1, 'rgba(34, 211, 238, 0.7)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.moveTo(s * 6.5, -6); ctx.lineTo(s * 9.5, 0); ctx.lineTo(s * 6.5, 7); ctx.closePath(); ctx.fill();
    }
    // nòng lăng kính
    const by = -3 + (recoil || 0) / 8 * 2.5;
    ctx.fillStyle = TA.metal(-2.6, 2.6, '#334155', '#cbd5e1');
    TA.rr(-2.6, by - 12, 5.2, 12, 1.4); ctx.fill();
    ctx.fillStyle = acc; TA.glow(acc, 8);
    ctx.beginPath(); ctx.moveTo(0, by - 16); ctx.lineTo(3, by - 12); ctx.lineTo(-3, by - 12); ctx.closePath(); ctx.fill();
    TA.noGlow();
    // tháp: vòng tròn + lõi ◈
    ctx.fillStyle = '#0b1020';
    ctx.beginPath(); ctx.arc(0, 2, 6.2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = k.evo1 && v === 0 ? CL_GOLD : 'rgba(165, 243, 252, 0.6)'; ctx.lineWidth = 0.9; ctx.stroke();
    const pul = 0.7 + 0.3 * Math.sin(t * 5);
    ctx.save();
    ctx.translate(0, 2); ctx.rotate(t * (v ? -1.5 : 1.2));
    ctx.globalAlpha *= pul;
    ctx.fillStyle = v === 2 ? CL_GOLD : (v ? CL_CYAN : CL_VIO); TA.glow(ctx.fillStyle, 10);
    ctx.beginPath(); ctx.moveTo(0, -4.2); ctx.lineTo(4.2, 0); ctx.lineTo(0, 4.2); ctx.lineTo(-4.2, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ecfeff';
    ctx.beginPath(); ctx.moveTo(0, -1.8); ctx.lineTo(1.8, 0); ctx.lineTo(0, 1.8); ctx.lineTo(-1.8, 0); ctx.closePath(); ctx.fill();
    TA.noGlow();
    ctx.restore();
    // Full Evo: mảnh gương xoay quanh tháp
    if (v === 0 && k.full) {
        ctx.fillStyle = CL_GOLD; ctx.globalAlpha *= 0.85;
        for (let i = 0; i < 4; i++) {
            const a = t * 2 + i * Math.PI / 2;
            ctx.save(); ctx.translate(Math.cos(a) * 9.5, 2 + Math.sin(a) * 9.5); ctx.rotate(a);
            ctx.fillRect(-0.6, -1.6, 1.2, 3.2); ctx.restore();
        }
        ctx.globalAlpha /= 0.85;
    }
}

registerTankArt('clone', (p, k) => {
    clHull(k, 0, p.clRecoil || 0);
    // vạch số clone ở đuôi xe
    const n = Math.min(CL_CAP, (typeof clCount === 'function' && typeof bodyEffects !== 'undefined') ? clCount(p) : 0);
    for (let i = 0; i < CL_CAP; i++) {
        ctx.fillStyle = i < n ? CL_CYAN : 'rgba(255,255,255,0.1)';
        ctx.fillRect(-7.5 + i * 1.95, 9.2, 1.3, 1.6);
    }
});

// ---------- Clone ----------
function clDrawClone(c) {
    if (!c.active) return;
    const o = c.owner, t = clNow();
    const cx = c.x + c.w / 2, cy = c.y + c.h / 2;
    ctx.save();
    // dây thần kinh liên kết với bản thể
    if (o && o.hp > 0) {
        const ox = o.x + o.w / 2, oy = o.y + o.h / 2;
        const hot = (o.clLinkFx || 0) > 0;
        ctx.strokeStyle = c.kind ? 'rgba(253, 230, 138, 0.45)' : (hot ? 'rgba(244, 114, 182, 0.8)' : 'rgba(34, 211, 238, 0.5)');
        ctx.lineWidth = hot ? 1.8 : 1.2; ctx.setLineDash([3, 4]); ctx.lineDashOffset = -t * 30;
        const mid = (ox + cx) / 2, lift = (o.id === 1 ? -1 : 1) * Math.min(18, Math.abs(cx - ox) * 0.15);
        ctx.beginPath(); ctx.moveTo(ox, oy); ctx.quadraticCurveTo(mid, (oy + cy) / 2 + lift, cx, cy); ctx.stroke();
        ctx.setLineDash([]);
        // xung truyền dọc dây
        const q = (t * 1.3 + c.seed) % 1;
        const qx = (1 - q) * (1 - q) * ox + 2 * (1 - q) * q * mid + q * q * cx;
        const qy = (1 - q) * (1 - q) * oy + 2 * (1 - q) * q * ((oy + cy) / 2 + lift) + q * q * cy;
        ctx.fillStyle = c.kind ? CL_GOLD : CL_CYAN; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 6;
        ctx.beginPath(); ctx.arc(qx, qy, 1.4, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    }
    // vòng xuất hiện
    if (c.spawnFx > 0) {
        const a = c.spawnFx / 24;
        ctx.strokeStyle = c.kind ? CL_GOLD : CL_CYAN; ctx.globalAlpha = a; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx, cy, c.w * (0.5 + (1 - a) * 0.9), 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1;
    }
    // thân hologram
    const flick = (Math.sin(t * 37 + c.seed * 7) > 0.93) ? 0.35 : 1;
    ctx.globalAlpha = (c.kind ? 0.82 : 0.58) * flick * (c.spawnFx > 0 ? 1 - c.spawnFx / 30 : 1);
    const s = c.w / 32;
    ctx.translate(cx + (flick < 1 ? 1.5 : 0), cy);
    ctx.scale(s, o && o.id === 2 ? -s : s);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    const tc = TEAM_COLORS[(o && o.id) || 1] || TEAM_COLORS[1];
    const evo = o ? tankArtEvoState(o) : { evo1: false, evo2: false, full: false };
    try { clHull(Object.assign({ t, s }, tc, evo), c.kind ? 2 : 1, c.recoil); } catch (e) { /* không làm sập game */ }
    // quét dòng hologram
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = c.kind ? 'rgba(253, 230, 138, 0.14)' : 'rgba(34, 211, 238, 0.26)';
    ctx.beginPath(); ctx.moveTo(-9, -10); ctx.lineTo(9, -10); ctx.lineTo(12, 1); ctx.lineTo(8, 12); ctx.lineTo(-8, 12); ctx.lineTo(-12, 1); ctx.closePath(); ctx.fill();
    ctx.fillStyle = c.kind ? 'rgba(253, 230, 138, 0.16)' : 'rgba(34, 211, 238, 0.22)';
    const sh = ((t * 24) % 6);
    for (let yy = -14 + sh; yy < 14; yy += 6) ctx.fillRect(-13, yy, 26, 1.2);
    if (c.hitFx > 0) { ctx.fillStyle = `rgba(244, 114, 182, ${c.hitFx / 14})`; TA.rr(-13, -12, 26, 25, 4); ctx.fill(); }
    ctx.restore();
    // máu clone
    ctx.save();
    const bw = c.w * 0.9, bx = cx - bw / 2, byy = o && o.id === 2 ? c.y - 5 : c.y + c.h + 3;
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(bx, byy, bw, 2.5);
    ctx.fillStyle = c.kind ? CL_GOLD : CL_CYAN;
    ctx.fillRect(bx, byy, bw * Math.max(0, Math.min(1, c.hp / c.maxHp)), 2.5);
    ctx.restore();
}

// ---------- Đạn ----------
function clDrawBullet(b) {
    const x = b.x + b.w / 2, y = b.y + b.h / 2, t = clNow();
    const col = b.clK === 2 ? CL_GOLD : (b.clK === 1 ? CL_CYAN : CL_VIO);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = col; ctx.globalAlpha = b.clK === 1 ? 0.35 : 0.5; ctx.lineWidth = b.w * 0.6;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - (b.vy || 0) * 2.4); ctx.stroke();
    ctx.globalAlpha = b.clK === 1 ? 0.75 : 1; ctx.globalCompositeOperation = 'source-over';
    ctx.translate(x, y); ctx.rotate(t * 6);
    ctx.shadowColor = col; ctx.shadowBlur = 10;
    const r = b.w * 0.62;
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(r, 0); ctx.lineTo(0, r); ctx.lineTo(-r, 0); ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0; ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}

// ---------- Kết liễu VÔ HẠN ----------
function clDrawFinisher(f) {
    if (f.t > 110) return;
    const k = f.t / 110;
    ctx.save();
    ctx.strokeStyle = `rgba(34, 211, 238, ${0.55 * (1 - k)})`; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(f.x, f.y, 16 + 100 * clEase(k), 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
}
function clDrawFinisherOver(f) {
    const t = f.t, W = canvas.width, H = canvas.height;
    ctx.save();
    const dark = t < 8 ? t / 8 : (t < 80 ? 1 : Math.max(0, 1 - (t - 80) / 30));
    if (dark > 0) { ctx.fillStyle = `rgba(3, 6, 20, ${0.55 * dark})`; ctx.fillRect(-W, -H, W * 3, H * 3); }
    ctx.globalCompositeOperation = 'lighter';
    // pha 1 (0-40): các bóng hội tụ về mục tiêu, để lại vệt
    const n = f.pts.length / 2;
    if (t < 46) {
        const k = clEase(Math.min(1, t / 40));
        for (let i = 0; i < n; i++) {
            const sx = f.pts[i * 2], sy = f.pts[i * 2 + 1];
            const px = sx + (f.x - sx) * k, py = sy + (f.y - sy) * k;
            const c = i === 0 ? CL_VIO : (i % 3 === 0 ? CL_GOLD : CL_CYAN);
            ctx.strokeStyle = c; ctx.globalAlpha = 0.55; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(sx + (f.x - sx) * k * 0.6, sy + (f.y - sy) * k * 0.6); ctx.lineTo(px, py); ctx.stroke();
            ctx.globalAlpha = 0.8; ctx.fillStyle = c;
            ctx.save(); ctx.translate(px, py); ctx.rotate(t * 0.2 + i);
            ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(6, 0); ctx.lineTo(0, 6); ctx.lineTo(-6, 0); ctx.closePath(); ctx.fill();
            ctx.restore();
        }
    }
    // pha 2 (40-): gương vỡ — chớp sáng + mảnh kính tam giác văng ra
    if (t >= 38) {
        const k = (t - 38) / 80;
        if (t < 60) {
            const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 100);
            const a = 1 - (t - 38) / 22;
            g.addColorStop(0, `rgba(236, 254, 255, ${0.95 * a})`); g.addColorStop(0.4, `rgba(34, 211, 238, ${0.5 * a})`); g.addColorStop(1, 'rgba(34, 211, 238, 0)');
            ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x, f.y, 100, 0, Math.PI * 2); ctx.fill();
            // vết nứt gương
            ctx.strokeStyle = `rgba(236, 254, 255, ${a})`; ctx.lineWidth = 1.2;
            for (let i = 0; i < 9; i++) {
                const ang = f.seed + i * Math.PI * 2 / 9;
                ctx.beginPath(); ctx.moveTo(f.x, f.y);
                ctx.lineTo(f.x + Math.cos(ang) * 40, f.y + Math.sin(ang) * 40);
                ctx.lineTo(f.x + Math.cos(ang + 0.15) * 80, f.y + Math.sin(ang + 0.15) * 80);
                ctx.stroke();
            }
        }
        const kk = clEase(Math.min(1, k));
        ctx.globalAlpha = Math.max(0, 1 - k);
        for (let i = 0; i < 18; i++) {
            const ang = f.seed * 1.7 + i * Math.PI * 2 / 18, R = (60 + (i % 4) * 22) * kk;
            const px = f.x + Math.cos(ang) * R, py = f.y + Math.sin(ang) * R + kk * kk * 20;
            const sz = 5 + (i % 3) * 2;
            ctx.save(); ctx.translate(px, py); ctx.rotate(ang + t * 0.15 * (i % 2 ? 1 : -1));
            const g = ctx.createLinearGradient(-sz, -sz, sz, sz);
            g.addColorStop(0, 'rgba(236, 254, 255, 0.9)'); g.addColorStop(1, i % 2 ? 'rgba(167, 139, 250, 0.5)' : 'rgba(34, 211, 238, 0.5)');
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.moveTo(0, -sz); ctx.lineTo(sz * 0.8, sz * 0.6); ctx.lineTo(-sz * 0.6, sz * 0.4); ctx.closePath(); ctx.fill();
            ctx.restore();
        }
    }
    ctx.restore();
    if (t >= 40 && t < 128) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, (t - 40) / 8) * (t > 108 ? 1 - (t - 108) / 20 : 1);
        ctx.font = "900 24px 'Orbitron', Arial"; ctx.textAlign = 'center';
        ctx.shadowBlur = 18; ctx.shadowColor = CL_CYAN; ctx.fillStyle = '#ecfeff';
        const ty = Math.max(60, Math.min(H - 60, f.y + (f.team === 1 ? 92 : -84)));
        const sc = 1 + Math.max(0, 1 - (t - 40) / 8) * 0.5;
        ctx.translate(W / 2, ty); ctx.scale(sc, sc);
        if (typeof drawWorldText === 'function') drawWorldText(ctx, '◈ VÔ HẠN ◈', 0, 0); else ctx.fillText('◈ VÔ HẠN ◈', 0, 0);
        ctx.restore();
    }
}
function clFxOver() {
    if (typeof bodyEffects === 'undefined') return;
    for (const e of bodyEffects) if (e instanceof ClFinisher && e.active) e.drawOver();
}

// ---------- Quanh xe ----------
Object.assign(CharHooks.registry.clone, {
    draw() {
        const cx = this.x + this.w / 2, cy = this.y + this.h / 2, t = clNow();
        ctx.save();
        const h = this.clHold || 0;
        if (h > 8) { // vòng giữ 1s + bóng clone đang thành hình
            const k = Math.min(1, h / CL_HOLD);
            ctx.strokeStyle = CL_CYAN; ctx.shadowColor = CL_CYAN; ctx.shadowBlur = 8; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(cx, cy, this.w * 0.8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); ctx.stroke();
            ctx.shadowBlur = 0;
            const side = -(this.clSide || 1);
            const gx = cx + side * (this.w / 2 + 16) * k;
            ctx.globalAlpha = 0.25 + 0.35 * k; ctx.strokeStyle = CL_CYAN; ctx.lineWidth = 1; ctx.setLineDash([2, 2]);
            TA.rr(gx - 12 * k, cy - 12 * k, 24 * k, 24 * k, 4); ctx.stroke(); ctx.setLineDash([]);
            ctx.globalAlpha = 1;
        }
        // tia phản phệ / hồi sinh
        if ((this.clLinkFx || 0) > 0 && this.clLashFrom) {
            const a = this.clLinkFx / 18, L = this.clLashFrom;
            ctx.strokeStyle = this.clReviveFx > 0 ? CL_GOLD : CL_PINK; ctx.globalAlpha = a; ctx.lineWidth = 3 * a + 0.5;
            ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 10;
            ctx.beginPath(); ctx.moveTo(L[0], L[1]);
            for (let i = 1; i <= 6; i++) { const q = i / 6; ctx.lineTo(L[0] + (L[2] - L[0]) * q + (i < 6 ? Math.sin(t * 50 + i) * 5 : 0), L[1] + (L[3] - L[1]) * q + (i < 6 ? Math.cos(t * 43 + i) * 4 : 0)); }
            ctx.stroke(); ctx.shadowBlur = 0; ctx.globalAlpha = 1;
        }
        if ((this.clReviveFx || 0) > 0) {
            const a = this.clReviveFx / 40;
            ctx.strokeStyle = CL_GOLD; ctx.globalAlpha = a; ctx.lineWidth = 2.5;
            ctx.beginPath(); ctx.arc(cx, cy, this.w * (0.6 + (1 - a) * 1.2), 0, Math.PI * 2); ctx.stroke();
        }
        ctx.restore();
    },
    drawUI() {
        if (typeof hudFrame !== 'function') return;
        const F = hudFrame(this), d0 = 12;
        ctx.save();
        // ô miễn phản phệ (Evo 2 / Full)
        const fm = clFreeMax(this);
        for (let i = 0; i < fm; i++) {
            const r = hudRect(F, -16 + i * 6, d0, 4, 4);
            ctx.fillStyle = i < (this.clFree || 0) ? CL_VIO : 'rgba(255,255,255,0.12)';
            ctx.beginPath(); ctx.moveTo(r[0] + r[2] / 2, r[1]); ctx.lineTo(r[0] + r[2], r[1] + r[3] / 2); ctx.lineTo(r[0] + r[2] / 2, r[1] + r[3]); ctx.lineTo(r[0], r[1] + r[3] / 2); ctx.closePath(); ctx.fill();
        }
        // số clone
        const n = clCount(this), pf = clClones(this, 1).length;
        const tp = hudRect(F, fm ? 10 : 0, d0 + 2, 0, 0);
        ctx.font = "700 8px 'Orbitron', Arial"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = n ? CL_CYAN : 'rgba(255,255,255,0.4)'; ctx.shadowColor = CL_CYAN; ctx.shadowBlur = n ? 6 : 0;
        const txt = '◈' + n + (pf ? ' ★' + pf : '');
        ctx.translate(tp[0], tp[1]);
        if (typeof drawWorldText === 'function') drawWorldText(ctx, txt, 0, 0); else ctx.fillText(txt, 0, 0);
        ctx.restore();
    },
});

// Nút Bắn: giữ 1s nhân bản
function clRegisterHUD() {
    if (typeof registerEmpowerHUD !== 'function') return;
    registerEmpowerHUD('clone', p => {
        const h = p.clHold || 0, n = (typeof bodyEffects !== 'undefined') ? clCount(p) : 0;
        if (h > 8) return { pct: Math.min(1, h / CL_HOLD), ready: false, color: CL_CYAN, label: n >= CL_CAP ? 'TỐI ĐA' : 'NHÂN BẢN…', btnIcon: '◈', dim: n >= CL_CAP };
        return { idle: true, pct: n / CL_CAP, ready: false, color: CL_CYAN, label: 'CLONE ' + n + '/' + CL_CAP, btnIcon: '◈', segments: CL_CAP, lit: n };
    });
}
if (typeof window !== 'undefined') window.addEventListener('load', clRegisterHUD);
