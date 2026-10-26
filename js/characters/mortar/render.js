// ==========================================
// Mortar (mortar) — Hình ảnh: xe pháo cối nòng ngắn chĩa trời, Vòng Cảnh Báo đỏ trên làn địch
// (vạch Hồng Tâm), đạn cối vọt lên rồi rơi xuống (phóng to + bóng đổ co lại), Hố Đạn Nóng Đỏ,
// HUD hồi chiêu Rải Thảm, kết liễu "TỌA ĐỘ HỦY DIỆT". Chỉ đọc state.
// ==========================================

registerTankArt('mortar', (p, k) => {
    const t = k.t, rec = (p.mrRecoil || 0) * 0.35;
    TA.treads(-15, 5, -10, 13, t, '#111827', '#3f3f46');
    // thân bọc thép thấp
    ctx.fillStyle = TA.vgrad(-8, 12, '#3b3428', '#16130e');
    TA.rr(-10, -7, 20, 19, 4); ctx.fill();
    ctx.strokeStyle = k.team; ctx.lineWidth = 1; TA.rr(-10, -7, 20, 19, 4); ctx.stroke();
    // đế xoay
    ctx.fillStyle = '#1c1917'; ctx.beginPath(); ctx.arc(0, 2, 8, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#78716c'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(0, 2, 8, 0, Math.PI * 2); ctx.stroke();
    // nòng cối ngắn, to (nhìn từ trên: miệng nòng tròn)
    ctx.fillStyle = TA.metal(-5, 5, '#44403c', '#d6d3d1');
    TA.rr(-4.5, -13 + rec, 9, 14, 2.5); ctx.fill();
    ctx.fillStyle = '#0c0a09'; ctx.beginPath(); ctx.ellipse(0, -12 + rec, 3.6, 2.4, 0, 0, Math.PI * 2); ctx.fill();
    const hot = p.mrRecoil > 0 ? MR_ORANGE : (p.mrCd > 0 ? '#57534e' : MR_RED);
    TA.glow(hot, p.mrRecoil > 0 ? 12 : 6); ctx.strokeStyle = hot; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.ellipse(0, -12 + rec, 4.2, 2.9, 0, 0, Math.PI * 2); ctx.stroke(); TA.noGlow();
    // ống phóng phụ 2 bên (Rải Thảm)
    [-1, 1].forEach(s => { ctx.fillStyle = '#292524'; TA.rr(s * 7.5 - 2, -4, 4, 9, 1); ctx.fill(); ctx.fillStyle = p.mrCd > 0 ? '#44403c' : MR_ORANGE; ctx.fillRect(s * 7.5 - 1, -4, 2, 1.5); });
    // đèn đội
    ctx.fillStyle = k.team; ctx.beginPath(); ctx.arc(0, 8, 1.6, 0, Math.PI * 2); ctx.fill();
    if (k.evo1) { ctx.strokeStyle = MR_CYAN; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(-8, 10); ctx.lineTo(-3, 10); ctx.stroke(); }
    if (k.evo2) { ctx.strokeStyle = MR_ORANGE; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(3, 10); ctx.lineTo(8, 10); ctx.stroke(); }
    if (k.full) { TA.glow(MR_GOLD, 8); ctx.fillStyle = MR_GOLD; [-1, 1].forEach(s => { ctx.beginPath(); ctx.arc(s * 8, -6, 1.2, 0, Math.PI * 2); ctx.fill(); }); TA.noGlow(); }
});

// Vòng cảnh báo nằm ngang trên làn (bán trục dọc ~ 0.42 bán trục ngang)
function mrRing(x, y, r, k, col, fill) {
    ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.42, 0, 0, Math.PI * 2);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    ctx.strokeStyle = col; ctx.stroke();
}

function mrDrawShell(s) {
    const big = s.kind === 'big', small = s.kind === 'small' || s.kind === 'frag';
    const col = big ? MR_GOLD : (small ? MR_ORANGE : MR_RED);
    ctx.save();
    if (s.boom > 0) {
        // vệt cháy xém
        const a = 1 - s.boom / 18;
        ctx.globalAlpha = a * 0.7; ctx.fillStyle = '#1c0a05';
        ctx.beginPath(); ctx.ellipse(s.x, s.y, s.r * 0.7, s.r * 0.3, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore(); return;
    }
    const k = Math.min(1, s.t / s.dur), T = Date.now() / 1000;
    // pha 1: đạn vọt lên khỏi nòng Mortar (thu nhỏ dần = bay lên cao)
    if (s.t < 14 && s.kind !== 'frag') {
        const q = s.t / 14, dir = s.owner.id === 1 ? -1 : 1;
        const bx = s.ox, by = s.oy + dir * (10 + q * 70);
        ctx.globalAlpha = 1 - q; ctx.fillStyle = col; ctx.shadowBlur = 10; ctx.shadowColor = col;
        ctx.beginPath(); ctx.arc(bx, by, (big ? 5 : 4) * (1 - q * 0.7), 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = col; ctx.lineWidth = 2 * (1 - q);
        ctx.beginPath(); ctx.moveTo(s.ox, s.oy + dir * 8); ctx.lineTo(bx, by); ctx.stroke();
        ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    }
    // vòng cảnh báo
    const pulse = 0.5 + 0.5 * Math.sin(T * 18 + s.x);
    ctx.lineWidth = big ? 2.4 : 1.8; ctx.setLineDash(small ? [4, 4] : [7, 5]); ctx.lineDashOffset = -T * 30;
    mrRing(s.x, s.y, s.r, k, `rgba(255, 59, 59, ${0.55 + 0.4 * pulse})`, `rgba(255, 40, 40, ${0.07 + 0.12 * k})`);
    ctx.setLineDash([]);
    // vòng đếm ngược co về tâm
    ctx.lineWidth = 1.4; ctx.strokeStyle = big ? MR_GOLD : '#ffb4a8';
    ctx.beginPath(); ctx.ellipse(s.x, s.y, s.r * (1 - k) + 2, (s.r * (1 - k) + 2) * 0.42, 0, 0, Math.PI * 2); ctx.stroke();
    // vạch Hồng Tâm (±18px)
    if (!small) {
        ctx.strokeStyle = MR_GOLD; ctx.globalAlpha = 0.85; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(s.x - MR_BULL, s.y - 6); ctx.lineTo(s.x - MR_BULL, s.y + 6); ctx.moveTo(s.x + MR_BULL, s.y - 6); ctx.lineTo(s.x + MR_BULL, s.y + 6);
        ctx.moveTo(s.x - 5, s.y); ctx.lineTo(s.x + 5, s.y); ctx.moveTo(s.x, s.y - 4); ctx.lineTo(s.x, s.y + 4); ctx.stroke();
        ctx.globalAlpha = 1;
    }
    // pha cuối: đạn rơi xuống (phóng to dần + vệt rơi), bóng đổ đậm dần
    const fall = Math.max(0, (s.t - (s.dur - 16)) / 16);
    ctx.fillStyle = `rgba(0,0,0,${0.15 + 0.35 * k})`;
    ctx.beginPath(); ctx.ellipse(s.x, s.y, 3 + 6 * k, (3 + 6 * k) * 0.45, 0, 0, Math.PI * 2); ctx.fill();
    if (fall > 0) {
        const sz = (big ? 8 : (small ? 4.5 : 6)) * (0.35 + 0.65 * fall), lift = (1 - fall) * 26;
        ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createLinearGradient(s.x, s.y - lift - 30, s.x, s.y - lift);
        g.addColorStop(0, 'rgba(255,120,40,0)'); g.addColorStop(1, col);
        ctx.strokeStyle = g; ctx.lineWidth = sz * 0.8; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(s.x, s.y - lift - 30); ctx.lineTo(s.x, s.y - lift); ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
        ctx.shadowBlur = 12; ctx.shadowColor = col;
        ctx.fillStyle = '#292524'; ctx.beginPath(); ctx.ellipse(s.x, s.y - lift, sz * 0.7, sz, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(s.x, s.y - lift + sz * 0.5, sz * 0.5, sz * 0.35, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
}

function mrDrawCrater(c) {
    const a = c.t < 10 ? c.t / 10 : (c.dur - c.t < 30 ? (c.dur - c.t) / 30 : 1), T = Date.now() / 1000;
    ctx.save();
    ctx.globalAlpha = a;
    const g = ctx.createRadialGradient(c.x, c.y, 2, c.x, c.y, c.r);
    g.addColorStop(0, 'rgba(255, 220, 120, 0.85)'); g.addColorStop(0.35, 'rgba(255, 90, 20, 0.55)'); g.addColorStop(1, 'rgba(120, 20, 0, 0.05)');
    ctx.fillStyle = g; ctx.save(); ctx.translate(c.x, c.y); ctx.scale(1, 0.42); ctx.beginPath(); ctx.arc(0, 0, c.r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    ctx.strokeStyle = MR_ORANGE; ctx.lineWidth = 1.2; ctx.shadowBlur = 10; ctx.shadowColor = MR_ORANGE;
    mrRing(c.x, c.y, c.r, 0, MR_ORANGE);
    // tia lửa bốc lên
    ctx.fillStyle = MR_GOLD;
    for (let i = 0; i < 6; i++) {
        const f = (T * 1.4 + i / 6) % 1, px = c.x + Math.sin(i * 7.3) * c.r * 0.7;
        ctx.globalAlpha = a * (1 - f); ctx.beginPath(); ctx.arc(px, c.y - f * 14, 1.3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
}

Object.assign(CharHooks.registry.mortar, {
    drawUI() {
        if (this.hp <= 0) return;
        const cx = this.x + this.w / 2, y = this.id === 1 ? this.y + this.h + 15 : this.y + this.h + 6;
        ctx.save();
        // hồi chiêu Mưa Pháo Rải Thảm
        const cd = mrBarrageCD(this), k = this.mrCd > 0 ? 1 - this.mrCd / cd : 1;
        ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(cx - 14, y, 28, 3);
        ctx.fillStyle = k >= 1 ? MR_ORANGE : '#78716c'; ctx.fillRect(cx - 14, y, 28 * k, 3);
        if (k >= 1) { ctx.shadowBlur = 6; ctx.shadowColor = MR_ORANGE; ctx.fillRect(cx - 14, y, 28, 3); ctx.shadowBlur = 0; }
        if (mrFull(this)) {
            for (let i = 0; i < 3; i++) { ctx.fillStyle = i < (this.mrShots || 0) % 3 ? MR_GOLD : 'rgba(148,163,184,0.35)'; ctx.beginPath(); ctx.arc(cx - 6 + i * 6, y + 7, 1.8, 0, Math.PI * 2); ctx.fill(); }
        }
        if (this.mrHold > 4 && this.mrHold < MR_HOLD && !this.mrHoldUsed) {
            ctx.strokeStyle = this.mrCd > 0 ? '#94a3b8' : MR_ORANGE; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(cx, this.y + this.h / 2, this.w * 0.75, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * this.mrHold / MR_HOLD); ctx.stroke();
        }
        ctx.restore();
    },
});

// ---------- Kết liễu: TỌA ĐỘ HỦY DIỆT ----------
function mrDrawFinisher(f) {
    const t = f.t, W = canvas.width, H = canvas.height;
    ctx.save();
    const dark = t < 12 ? t / 12 : (t < 190 ? 1 : Math.max(0, 1 - (t - 190) / 30));
    ctx.fillStyle = `rgba(20, 4, 2, ${0.55 * dark})`; ctx.fillRect(-W, -H, W * 3, H * 3);
    // tia laser chỉ thị từ trời khóa mục tiêu
    if (t > 6 && t < 200) {
        const a = Math.min(1, (t - 6) / 14) * (t > 170 ? Math.max(0, 1 - (t - 170) / 30) : 1);
        const sweep = t < MRF_LOCK ? (1 - (t - 6) / (MRF_LOCK - 6)) * 90 * Math.sin(t * 0.3) : 0;
        const lx = f.x + sweep;
        ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createLinearGradient(lx - 10, 0, lx + 10, 0);
        g.addColorStop(0, 'rgba(255,0,0,0)'); g.addColorStop(0.5, `rgba(255,40,40,${0.7 * a})`); g.addColorStop(1, 'rgba(255,0,0,0)');
        ctx.fillStyle = g; ctx.fillRect(lx - 10, -H, 20, H * 3);
        ctx.fillStyle = `rgba(255,220,220,${0.9 * a})`; ctx.fillRect(lx - 0.8, -H, 1.6, H * 3);
        // khung khóa mục tiêu
        if (t >= MRF_LOCK - 6) {
            const q = Math.min(1, (t - MRF_LOCK + 6) / 10), R = 46 - 18 * q;
            ctx.strokeStyle = `rgba(255,59,59,${a})`; ctx.lineWidth = 2; ctx.shadowBlur = 12; ctx.shadowColor = MR_RED;
            for (let i = 0; i < 4; i++) {
                const ang = i * Math.PI / 2 + t * 0.04;
                ctx.beginPath(); ctx.arc(f.x, f.y, R, ang, ang + 0.9); ctx.stroke();
            }
            ctx.beginPath(); ctx.moveTo(f.x - R - 10, f.y); ctx.lineTo(f.x - R + 6, f.y); ctx.moveTo(f.x + R - 6, f.y); ctx.lineTo(f.x + R + 10, f.y); ctx.stroke();
            if (t < MRF_RAIN) {
                ctx.font = "700 9px 'Orbitron', Arial"; ctx.textAlign = 'center'; ctx.fillStyle = MR_RED; ctx.shadowBlur = 0;
                const txt = 'TARGET LOCKED', ty = f.y + (f.team === 1 ? -R - 14 : R + 20);
                if (typeof drawWorldText === 'function') drawWorldText(ctx, txt, f.x, ty); else ctx.fillText(txt, f.x, ty);
            }
        }
        ctx.globalCompositeOperation = 'source-over'; ctx.shadowBlur = 0;
    }
    // mưa đạn cối: mỗi quả có vòng cảnh báo nhỏ rồi rơi xuống
    for (let i = 0; i < MRF_N; i++) {
        const s = f.shell(i), d = t - (s.at - 18);
        if (d < 0 || t > s.at + 2) continue;
        const k = d / 18;
        ctx.strokeStyle = `rgba(255,59,59,${0.4 + 0.5 * k})`; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.ellipse(s.x, s.y, 16, 7, 0, 0, Math.PI * 2); ctx.stroke();
        const lift = (1 - k) * 120, sz = 3 + 4 * k;
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = MR_ORANGE; ctx.lineWidth = sz * 0.7; ctx.globalAlpha = 0.6;
        ctx.beginPath(); ctx.moveTo(s.x, s.y - lift - 34); ctx.lineTo(s.x, s.y - lift); ctx.stroke();
        ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#292524'; ctx.shadowBlur = 10; ctx.shadowColor = MR_ORANGE;
        ctx.beginPath(); ctx.ellipse(s.x, s.y - lift, sz * 0.7, sz, 0, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    }
    // hố sâu bốc khói
    const last = MRF_RAIN + (MRF_N - 1) * 4 + 6;
    if (t > MRF_RAIN) {
        const q = Math.min(1, (t - MRF_RAIN) / 60), a = t > 200 ? Math.max(0, 1 - (t - 200) / 30) : 1;
        ctx.globalAlpha = a;
        const g = ctx.createRadialGradient(f.x, f.y, 4, f.x, f.y, 90 * q);
        g.addColorStop(0, 'rgba(10,4,2,0.95)'); g.addColorStop(0.5, 'rgba(60,20,8,0.7)'); g.addColorStop(0.8, 'rgba(255,90,20,0.35)'); g.addColorStop(1, 'rgba(255,90,20,0)');
        ctx.fillStyle = g; ctx.save(); ctx.translate(f.x, f.y); ctx.scale(1, 0.5); ctx.beginPath(); ctx.arc(0, 0, 90 * q, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        if (t > last) {
            for (let i = 0; i < 10; i++) {
                const fz = ((t - last) / 70 + i / 10) % 1, px = f.x + (mrfR(f.seed, i + 90) - 0.5) * 110;
                ctx.globalAlpha = a * 0.45 * (1 - fz); ctx.fillStyle = '#57534e';
                ctx.beginPath(); ctx.arc(px + Math.sin(fz * 6 + i) * 6, f.y - fz * 60, 8 + fz * 16, 0, Math.PI * 2); ctx.fill();
            }
        }
        ctx.globalAlpha = 1;
    }
    ctx.restore();
    if (t >= last - 4 && t < MRF_DUR) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, (t - last + 4) / 8) * (t > 205 ? Math.max(0, 1 - (t - 205) / 25) : 1);
        ctx.font = "900 22px 'Orbitron', Arial"; ctx.textAlign = 'center';
        ctx.shadowBlur = 18; ctx.shadowColor = MR_RED; ctx.fillStyle = '#ffedd5';
        const ty = Math.max(60, Math.min(H - 60, f.y + (f.team === 1 ? 96 : -88)));
        const sc = 1 + Math.max(0, 1 - (t - last + 4) / 8) * 0.5;
        ctx.translate(W / 2, ty); ctx.scale(sc, sc);
        const txt = '☄ TỌA ĐỘ HỦY DIỆT ☄';
        if (typeof drawWorldText === 'function') drawWorldText(ctx, txt, 0, 0); else ctx.fillText(txt, 0, 0);
        ctx.restore();
    }
}
