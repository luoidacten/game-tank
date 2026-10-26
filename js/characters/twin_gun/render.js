// ==========================================
// Hai Nòng (twin_gun) — Hình ảnh: xe 2 nòng song song (giật luân phiên), đạn vạch neon xanh/hồng,
// vạch ngắm 2 làn đạn, HUD chế độ nòng, kết liễu "SONG XẠ GIAO THOA". Chỉ đọc state.
// ==========================================

registerTankArt('twin_gun', (p, k) => {
    const t = k.t, mode = p.tgMode || 'std';
    const bx = mode === 'wide' ? 9.5 : (mode === 'narrow' ? 4 : 6);
    TA.treads(-14, 4, -11, 13, t, '#0b1220', '#334155');
    ctx.fillStyle = TA.vgrad(-8, 12, '#1f2a44', '#0b1020');
    TA.rr(-10, -6, 20, 18, 4); ctx.fill();
    ctx.strokeStyle = k.team; ctx.lineWidth = 1; TA.rr(-10, -6, 20, 18, 4); ctx.stroke();
    // 2 nòng: giật luân phiên
    [-1, 1].forEach(s => {
        const rec = (p.tgRecoil > 0 && p.tgFlash === s) ? p.tgRecoil * 0.5 : 0;
        const col = s < 0 ? TG_C1 : TG_C2;
        TA.barrel(s * bx, -2 + rec, 15, 3.4, '#e2e8f0', col);
        if (rec > 1.5) { TA.glow(col, 10); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(s * bx, -18 + rec, 2.4, 0, Math.PI * 2); ctx.fill(); TA.noGlow(); }
    });
    // khớp nối 2 nòng (thanh ngang co giãn theo chế độ)
    ctx.fillStyle = '#475569'; ctx.fillRect(-bx - 1, -6, bx * 2 + 2, 2.5);
    // lõi tháp pháo
    ctx.fillStyle = '#020617'; ctx.beginPath(); ctx.arc(0, 4, 5, 0, Math.PI * 2); ctx.fill();
    const lc = p.tgBonus ? TG_GOLD : k.team;
    TA.glow(lc, p.tgBonus ? 12 : 6); ctx.fillStyle = lc; ctx.beginPath(); ctx.arc(0, 4, 2.4 + Math.sin(t * 6) * 0.3, 0, Math.PI * 2); ctx.fill(); TA.noGlow();
    if (k.evo1) { ctx.strokeStyle = TG_C1; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(0, 4, 7.5, t * 3, t * 3 + Math.PI * 1.2); ctx.stroke(); }
    if (k.evo2) { ctx.strokeStyle = TG_C2; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(0, 4, 7.5, -t * 3, -t * 3 + Math.PI * 1.2); ctx.stroke(); }
    if (k.full) { TA.barrel(0, -1, 11, 2.2, '#fef9c3', TG_GOLD); }
});

Object.assign(BulletHooks.registry.twin_gun, {
    draw(b) {
        const col = b.tgMid ? TG_GOLD : (b.tgSide < 0 ? TG_C1 : TG_C2);
        const dir = b.vy < 0 ? -1 : 1, cx = b.x + b.w / 2, cy = b.y + b.h / 2;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createLinearGradient(cx, cy - dir * 18, cx, cy);
        g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, col);
        ctx.strokeStyle = g; ctx.lineWidth = b.tgMid ? 4 : 3; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(cx, cy - dir * (b.boost ? 26 : 18)); ctx.lineTo(cx, cy); ctx.stroke();
        ctx.shadowBlur = 10; ctx.shadowColor = col; ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.ellipse(cx, cy, b.w / 2 - 0.5, b.h / 2, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = col; ctx.globalAlpha = 0.6;
        ctx.beginPath(); ctx.ellipse(cx, cy, b.w / 2 + 1.5, b.h / 2 + 1.5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    },
});

Object.assign(CharHooks.registry.twin_gun, {
    draw() {
        if (gameState.phase !== 'playing' || this.hp <= 0) return;
        // vạch ngắm 2 làn đạn (mờ)
        const cx = this.x + this.w / 2, half = tgSpacing(this) / 2, dir = this.id === 1 ? -1 : 1;
        const y0 = this.id === 1 ? this.y - 6 : this.y + this.h + 6;
        ctx.save();
        ctx.setLineDash([3, 7]); ctx.lineWidth = 1;
        [-1, 1].forEach(s => {
            ctx.strokeStyle = s < 0 ? TG_C1 : TG_C2; ctx.globalAlpha = 0.22 + (this.tgSwapFx > 0 ? 0.4 : 0);
            ctx.beginPath(); ctx.moveTo(cx + s * half, y0); ctx.lineTo(cx + s * half, y0 + dir * 120); ctx.stroke();
        });
        ctx.restore();
    },
    drawUI() {
        if (this.hp <= 0) return;
        const up = 1, y = this.id === 1 ? this.y + this.h + 19 : this.y + this.h + 8, cx = this.x + this.w / 2;
        ctx.save();
        ctx.font = "700 8px 'Orbitron', Arial"; ctx.textAlign = 'center';
        const m = this.tgMode || 'std', col = m === 'wide' ? TG_C2 : (m === 'narrow' ? TG_C1 : '#cbd5e1');
        ctx.fillStyle = col; ctx.shadowBlur = 6; ctx.shadowColor = col;
        const lbl = m === 'wide' ? '◀ RỘNG ▶' : (m === 'narrow' ? '▶ HẸP ◀' : '| CHUẨN |');
        if (typeof drawWorldText === 'function') drawWorldText(ctx, lbl, cx, y + 3); else ctx.fillText(lbl, cx, y + 3);
        if (this.tgHold > 4 && this.tgHold < TG_HOLD && !this.tgHoldUsed) {
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.shadowBlur = 0;
            ctx.beginPath(); ctx.arc(cx, this.y + this.h / 2, this.w * 0.75, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * this.tgHold / TG_HOLD); ctx.stroke();
        }
        if (tgFull(this)) {
            for (let i = 0; i < 3; i++) {
                ctx.fillStyle = i < (this.tgShots || 0) % 3 ? TG_GOLD : 'rgba(148,163,184,0.35)';
                ctx.beginPath(); ctx.arc(cx - 6 + i * 6, y + up * 7, 1.8, 0, Math.PI * 2); ctx.fill();
            }
        }
        ctx.restore();
    },
});

// ---------- Kết liễu: SONG XẠ GIAO THOA ----------
function tgDrawFinisher(f) {
    const t = f.t, W = canvas.width, H = canvas.height;
    ctx.save();
    const dark = t < 10 ? t / 10 : (t < 110 ? 1 : Math.max(0, 1 - (t - 110) / 30));
    ctx.fillStyle = `rgba(2, 6, 23, ${0.55 * dark})`; ctx.fillRect(-W, -H, W * 3, H * 3);
    ctx.globalCompositeOperation = 'lighter';
    // 2 luồng đạn vạch từ 2 nòng xoắn vào nhau, giao thoa tại mục tiêu
    if (t < TGF_HIT + 6) {
        for (let s = -1; s <= 1; s += 2) {
            const col = s < 0 ? TG_C1 : TG_C2;
            for (let i = 0; i < 9; i++) {
                const k = ((t * 0.06 + i / 9) % 1);
                const sx = f.ox + s * 14, sy = f.oy;
                const wob = Math.sin(k * Math.PI) * 46 * s;
                const x = sx + (f.x - sx) * k + wob, y = sy + (f.y - sy) * k;
                ctx.fillStyle = col; ctx.shadowBlur = 12; ctx.shadowColor = col; ctx.globalAlpha = 0.9;
                ctx.beginPath(); ctx.arc(x, y, 2.6, 0, Math.PI * 2); ctx.fill();
            }
            ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.globalAlpha = 0.35; ctx.shadowBlur = 0;
            ctx.beginPath();
            for (let k = 0; k <= 1.001; k += 0.05) {
                const sx = f.ox + s * 14, x = sx + (f.x - sx) * k + Math.sin(k * Math.PI) * 46 * s, y = f.oy + (f.y - f.oy) * k;
                if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
    }
    // giao thoa: chữ X neon + vòng sóng
    if (t >= TGF_HIT) {
        const k = Math.min(1, (t - TGF_HIT) / 20), fade = t > 120 ? Math.max(0, 1 - (t - 120) / 30) : 1;
        ctx.globalAlpha = fade; ctx.lineWidth = 4 * (1 - k * 0.5); ctx.shadowBlur = 18;
        const L = 30 + 60 * k;
        [[TG_C1, 1], [TG_C2, -1]].forEach(([c, s]) => {
            ctx.strokeStyle = c; ctx.shadowColor = c;
            ctx.beginPath(); ctx.moveTo(f.x - L, f.y - L * s); ctx.lineTo(f.x + L, f.y + L * s); ctx.stroke();
        });
        ctx.strokeStyle = TG_GOLD; ctx.shadowColor = TG_GOLD; ctx.lineWidth = 2; ctx.globalAlpha = fade * (1 - k);
        ctx.beginPath(); ctx.arc(f.x, f.y, 20 + 90 * k, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
    if (t >= TGF_HIT + 4 && t < TGF_DUR) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, (t - TGF_HIT - 4) / 8) * (t > 125 ? Math.max(0, 1 - (t - 125) / 25) : 1);
        ctx.font = "900 24px 'Orbitron', Arial"; ctx.textAlign = 'center';
        ctx.shadowBlur = 18; ctx.shadowColor = TG_C2; ctx.fillStyle = '#e0f2fe';
        const ty = Math.max(60, Math.min(H - 60, f.y + (f.team === 1 ? 92 : -84)));
        const sc = 1 + Math.max(0, 1 - (t - TGF_HIT - 4) / 8) * 0.5;
        ctx.translate(W / 2, ty); ctx.scale(sc, sc);
        if (typeof drawWorldText === 'function') drawWorldText(ctx, '⫽ SONG XẠ ⫽', 0, 0); else ctx.fillText('⫽ SONG XẠ ⫽', 0, 0);
        ctx.restore();
    }
}
