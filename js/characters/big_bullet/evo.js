// Body mẫu từ #1: thêm tổ hợp 3+4 và hành vi giữ/nhả có chủ đích cho bot thí điểm.
if (FEATURE_EVO34) {
    EvoBodyKit.bodies.big_bullet = {
        balance: {
            '1+2': { damage: 0.55, taken: 1.2 },
            '2+3': { damage: 0.95 },
            '2+4': { damage: 0.4, taken: 1.5 },
        },
        bot(p, enemy, aligned, inp, t) {
            if (EvoBodyKit.has(p, 3)) inp.s = t % 100 < 65;
        },
    };
    const bigPilotShoot = bigHoldShoot;
    bigHoldShoot = function (p, inp, now) {
        const held = p.bigHeld;
        const result = bigPilotShoot(p, inp, now);
        if (
            held &&
            !inp.s &&
            !p.bigHeld &&
            !(p.silenceTimer > 0) &&
            EvoBodyKit.combo(p, '3+4') &&
            held.eaten > 0
        ) {
            p.skillCd = Math.max(
                0,
                (p.skillCd || 0) - Math.min(90, held.eaten * 30),
            );
            EvoBodyKit.flash(p, '#fbbf24');
        }
        return result;
    };
}

// ===== Hình ảnh Evo 3/4 (chỉ vẽ) =====
EvoFx.theme('big_bullet', {
    c1: '#fb923c', c2: '#facc15', dark: '#221004', slogan: 'Hành tinh va chạm · rung chuyển mặt đất',
    sfx: [[0, 45, 'sawtooth', 1.1, 0.22], [200, 60, 'sawtooth', 0.8, 0.14], [0, 330, 'triangle', 0.2, 0.06]],
    icon(g, mode) {
        if (mode === 'ult') { // hành tinh có vành
            g.beginPath(); g.arc(0, 0, 8, 0, Math.PI * 2); g.fill();
            g.lineWidth = 2; g.save(); g.rotate(-0.35); g.beginPath(); g.ellipse(0, 0, 14, 4.5, 0, 0, Math.PI * 2); g.stroke(); g.restore();
        } else { // quả cầu + mũi tên bẻ lái
            g.beginPath(); g.arc(-4, 5, 6, 0, Math.PI * 2); g.fill();
            g.lineWidth = 2.2; g.beginPath(); g.moveTo(-4, -2); g.quadraticCurveTo(-4, -11, 7, -10); g.stroke();
            g.beginPath(); g.moveTo(11, -10); g.lineTo(5, -14); g.lineTo(5, -6); g.closePath(); g.fill();
        }
    },
});
if (FEATURE_EVO34) EvoBodyKit.effects.bbCurve = {
    draw(f) {
        // Cú Sút Bẻ Lái: vệt cong vàng từ mỗi cầu bẻ về phía địch + vòng nảy thêm
        const k = 1 - f.life / f.maxLife, a = Math.min(1, f.life / 10);
        ctx.save();
        ctx.globalAlpha = a; ctx.lineCap = 'round';
        for (const [x, y, r] of f.balls || []) {
            const dx = f.tx - x, dy = f.ty - y, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, len = Math.min(L, 90) * EvoFx.ease(Math.min(1, k * 3));
            ctx.strokeStyle = '#facc15'; ctx.shadowColor = '#facc15'; ctx.shadowBlur = 12; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x - uy * 20 + ux * len * 0.5, y + ux * 20 + uy * len * 0.5, x + ux * len, y + uy * len); ctx.stroke();
            ctx.save(); ctx.translate(x + ux * len, y + uy * len); ctx.rotate(Math.atan2(uy, ux));
            ctx.fillStyle = '#fde047'; ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(-4, -6); ctx.lineTo(-4, 6); ctx.closePath(); ctx.fill(); ctx.restore();
            ctx.strokeStyle = '#fff7d6'; ctx.lineWidth = 2; ctx.shadowBlur = 0;
            ctx.beginPath(); ctx.arc(x, y, (r || 8) + 4 + k * 14, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.restore();
    },
};
