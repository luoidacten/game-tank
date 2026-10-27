// ==========================================
// Batter — Hình ảnh: xe có gậy bóng chày, vòng cung vung gậy, bóng chày/bóng lửa, HUD hồi chiêu, kết liễu HOME RUN.
// ==========================================

registerTankArt('batter', (p, k) => {
    const t = k.t;
    TA.treads(-14, 4, -11, 13, t, '#0b1220', '#334155');
    ctx.fillStyle = TA.vgrad(-8, 12, '#1e293b', '#0b1020');
    TA.rr(-10, -6, 20, 18, 4); ctx.fill();
    ctx.strokeStyle = k.team; ctx.lineWidth = 1; TA.rr(-10, -6, 20, 18, 4); ctx.stroke();
    TA.barrel(0, -2 + (p.btRecoil > 0 ? p.btRecoil * 0.4 : 0), 12, 3.6, '#e2e8f0', BT_RED);
    // gậy bên hông (xoay theo tiến trình vung)
    const sw = p.btSwing > 0 ? 1 - p.btSwing / BT_SWING : 0;
    const ang = p.btSwing > 0 ? -1.4 + 2.8 * sw : -0.35;
    ctx.save(); ctx.translate(8, 2); ctx.rotate(ang);
    ctx.fillStyle = '#d6a05a'; ctx.strokeStyle = '#7c4a1e'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(-1, 0); ctx.lineTo(1, 0); ctx.lineTo(2.6, -20); ctx.lineTo(-2.6, -20); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
    ctx.fillStyle = '#020617'; ctx.beginPath(); ctx.arc(0, 4, 5, 0, Math.PI * 2); ctx.fill();
    const ready = p.btCd <= 0;
    TA.glow(ready ? BT_GOLD : k.team, 6); ctx.fillStyle = ready ? BT_GOLD : k.team;
    ctx.beginPath(); ctx.arc(0, 4, 2.3, 0, Math.PI * 2); ctx.fill(); TA.noGlow();
    if (k.evo1) { ctx.strokeStyle = BT_RED; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(0, 4, 7.5, t * 3, t * 3 + Math.PI * 1.2); ctx.stroke(); }
    if (k.evo2) { ctx.strokeStyle = BT_GOLD; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(0, 4, 7.5, -t * 3, -t * 3 + Math.PI * 1.2); ctx.stroke(); }
});

function btDrawBall(cx, cy, r, fire, gold, dir) {
    ctx.save();
    if (fire || gold) {
        ctx.globalCompositeOperation = 'lighter';
        const col = gold ? BT_GOLD : BT_ORG;
        const g = ctx.createLinearGradient(cx, cy - dir * 24, cx, cy);
        g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, col);
        ctx.strokeStyle = g; ctx.lineWidth = r * 1.4; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(cx, cy - dir * 24); ctx.lineTo(cx, cy); ctx.stroke();
        ctx.shadowBlur = 12; ctx.shadowColor = col;
        ctx.globalCompositeOperation = 'source-over';
    }
    ctx.fillStyle = gold ? '#fef08a' : '#f8fafc';
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = fire ? BT_ORG : BT_RED; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx - r * 1.1, cy, r * 0.9, -0.9, 0.9); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx + r * 1.1, cy, r * 0.9, Math.PI - 0.9, Math.PI + 0.9); ctx.stroke();
    ctx.restore();
}

Object.assign(BulletHooks.registry.batter, {
    draw(b) { btDrawBall(b.x + b.w / 2, b.y + b.h / 2, b.w / 2, b.btFire, b.btGold, b.vy < 0 ? -1 : 1); },
});

Object.assign(CharHooks.registry.batter, {
    draw() {
        if (gameState.phase !== 'playing' || this.hp <= 0 || !(this.btSwing > 0)) return;
        const cx = this.x + this.w / 2, cy = this.y + this.h / 2, fw = this.id === 1 ? -1 : 1;
        const R = btReach(this), half = btHalf(this), sw = 1 - this.btSwing / BT_SWING;
        const base = fw < 0 ? -Math.PI / 2 : Math.PI / 2;
        const a0 = base - half, cur = a0 + 2 * half * sw;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round'; ctx.shadowBlur = 14; ctx.shadowColor = BT_GOLD;
        ctx.fillStyle = 'rgba(253, 224, 71, 0.10)';
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, a0, base + half); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = BT_GOLD; ctx.globalAlpha = 0.85; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.arc(cx, cy, R, Math.max(a0, cur - 0.7), cur); ctx.stroke();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.globalAlpha = 1;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(cur) * R, cy + Math.sin(cur) * R); ctx.stroke();
        ctx.restore();
    },
    drawUI() {
        if (this.hp <= 0) return;
        const cx = this.x + this.w / 2, y = this.id === 1 ? this.y + this.h + 19 : this.y + this.h + 8;
        ctx.save();
        const frac = this.btCd > 0 ? 1 - this.btCd / (this.btCdMax || BT_CD) : 1;
        ctx.fillStyle = 'rgba(15,23,42,0.7)'; ctx.fillRect(cx - 14, y, 28, 3);
        ctx.fillStyle = frac >= 1 ? BT_GOLD : BT_RED; ctx.fillRect(cx - 14, y, 28 * frac, 3);
        if (this.btHold > 4 && this.btHold < BT_HOLD && !this.btUsed && this.btCd <= 0) {
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(cx, this.y + this.h / 2, this.w * 0.75, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * this.btHold / BT_HOLD); ctx.stroke();
        }
        for (let i = 0; i < 4; i++) {
            ctx.fillStyle = i < (this.btPitches || 0) % 4 ? BT_ORG : 'rgba(148,163,184,0.35)';
            ctx.beginPath(); ctx.arc(cx - 6 + i * 4, y + 8, 1.5, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    },
});

// ---------- Kết liễu: HOME RUN ----------
function btDrawFinisher(f) {
    const t = f.t, W = canvas.width, H = canvas.height;
    ctx.save();
    const dark = t < 10 ? t / 10 : (t < 110 ? 1 : Math.max(0, 1 - (t - 110) / 30));
    ctx.fillStyle = `rgba(2, 6, 23, ${0.55 * dark})`; ctx.fillRect(-W, -H, W * 3, H * 3);
    ctx.globalCompositeOperation = 'lighter';
    if (t < BTF_HIT) {
        const k = t / BTF_HIT, x = f.ox + (f.x - f.ox) * k, y = f.oy + (f.y - f.oy) * k, k0 = Math.max(0, k - 0.3);
        ctx.strokeStyle = BT_ORG; ctx.shadowBlur = 16; ctx.shadowColor = BT_ORG; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.globalAlpha = 0.8;
        ctx.beginPath(); ctx.moveTo(f.ox + (f.x - f.ox) * k0, f.oy + (f.y - f.oy) * k0); ctx.lineTo(x, y); ctx.stroke();
        ctx.globalAlpha = 1; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill();
    } else {
        const k = Math.min(1, (t - BTF_HIT) / 22), fade = t > 120 ? Math.max(0, 1 - (t - 120) / 30) : 1;
        ctx.globalAlpha = fade; ctx.shadowBlur = 20; ctx.shadowColor = BT_GOLD; ctx.strokeStyle = BT_GOLD; ctx.lineWidth = 8 * (1 - k * 0.6);
        ctx.beginPath(); ctx.arc(f.x, f.y, 24 + 130 * k, -Math.PI * 0.9, -Math.PI * 0.1); ctx.stroke();
        ctx.strokeStyle = BT_RED; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(f.x, f.y, 14 + 90 * k, 0, Math.PI * 2); ctx.stroke();
        for (let i = 0; i < 14; i++) {
            const a = i / 14 * Math.PI * 2 + 0.3, r = 20 + 150 * k;
            ctx.fillStyle = i % 2 ? BT_GOLD : '#fff'; ctx.beginPath(); ctx.arc(f.x + Math.cos(a) * r, f.y + Math.sin(a) * r, 2.5, 0, Math.PI * 2); ctx.fill();
        }
    }
    ctx.restore();
    if (t >= BTF_HIT + 4 && t < BTF_DUR) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, (t - BTF_HIT - 4) / 8) * (t > 125 ? Math.max(0, 1 - (t - 125) / 25) : 1);
        ctx.font = "900 24px 'Orbitron', Arial"; ctx.textAlign = 'center';
        ctx.shadowBlur = 18; ctx.shadowColor = BT_RED; ctx.fillStyle = '#fef9c3';
        const ty = Math.max(60, Math.min(H - 60, f.y + (f.team === 1 ? 92 : -84)));
        const sc = 1 + Math.max(0, 1 - (t - BTF_HIT - 4) / 8) * 0.5;
        ctx.translate(W / 2, ty); ctx.scale(sc, sc);
        if (typeof drawWorldText === 'function') drawWorldText(ctx, 'HOME RUN!', 0, 0); else ctx.fillText('HOME RUN!', 0, 0);
        ctx.restore();
    }
}
