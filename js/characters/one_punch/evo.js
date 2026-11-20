EvoBodyKit.register('one_punch', {
    balance: {
        '1+2': { hp: 0.75, damage: 0.85 },
        '1+3': { damage: 0.75, hp: 0.9 },
        '1+4': { damage: 0.5, hp: 0.8 },
    },
    setup(p) {
        Object.assign(p.evoPilot, { walk: 0, lastX: p.x, lastExc: 0 });
        if (EvoBodyKit.has(p, 3)) p.maxHp = Math.max(2, p.maxHp - 2);
    },
    update(p, inp) {
        const d = p.evoPilot;
        if (EvoBodyKit.has(p, 3)) {
            if (Math.abs(p.x - d.lastX) > 0.1 && !!inp.l !== !!inp.r) d.walk++;
            else d.walk = 0;
            if (d.walk >= 180) {
                p.opExc = Math.min(
                    100,
                    (p.opExc || 0) + (EvoBodyKit.combo(p, '1+3') ? 8 : 5),
                );
                d.walk = 0;
                EvoBodyKit.fx(p, 'punchJog', 30, {});
            }
        }
        d.lastX = p.x;
        const gained = Math.max(0, (p.opExc || 0) - d.lastExc);
        if (gained > 0) EvoSystem.gain(p, 'excitement', gained);
        d.lastExc = p.opExc || 0;
    },
    skill(p) {
        if (groundedBlock(p)) return false;
        const e = EvoBodyKit.enemy(p),
            dir = p.x + p.w / 2 >= e.x + e.w / 2 ? 1 : -1,
            fromX = p.x;
        p.x = Math.max(0, Math.min(canvas.width - p.w, p.x + dir * 48));
        p.invincibleTimer = Math.max(p.invincibleTimer || 0, 15);
        p.opExc = Math.min(100, (p.opExc || 0) + 10);
        EvoBodyKit.fx(p, 'punchDodge', 24, { x0: fromX, x1: p.x, py: p.y, pw: p.w, ph: p.h });
    },
    ultimateReady(p) {
        return (p.opExc || 0) >= (EvoBodyKit.combo(p, '1+2+3+4') ? 80 : 100);
    },
    ultimate(p) {
        if (EvoBodyKit.combo(p, '2+4') && !isGrounded(p)) {
            p.x = Math.max(
                0,
                Math.min(
                    canvas.width - p.w,
                    p.x + (p.x < canvas.width / 2 ? 30 : -30),
                ),
            );
            p.invincibleTimer = Math.max(p.invincibleTimer || 0, 15);
        }
        p.opExc = Math.max(0, (p.opExc || 0) - 80);
        EvoBodyKit.ray(p, 48, 3, canvas.width / 3, '#fef08a', 0.5, true);
        EvoBodyKit.fx(p, 'punchSky', 66, {
            x: p.x + p.w / 2,
            color: '#fef08a',
            dir: EvoBodyKit.dir(p),
            py: p.id === 1 ? p.y : p.y + p.h,
        });
    },
    bot(p, e, aligned, inp, t) {
        if (EvoBodyKit.has(p, 3)) inp.s = aligned && t % 40 < 2;
    },
});
EvoBodyKit.effects.punchSky = {
    draw(f) {
        // 0.8s tụ lực (gió hút vào, nắm đấm khổng lồ hiện dần) -> cú đấm: mây rẽ đôi, chớp trắng
        const W = canvas.width, H = canvas.height, e = f.maxLife - f.life, t = Date.now() / 1000;
        const dir = f.dir || -1, half = W / 6, cx = f.x;
        const hit = e >= 48, hk = hit ? Math.min(1, (e - 48) / 18) : 0;
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        if (!hit) {
            const k = e / 48;
            // gió hút vào cột
            ctx.strokeStyle = 'rgba(255,247,214,.55)'; ctx.lineWidth = 1.5;
            for (let i = 0; i < 14; i++) {
                const y = (i + 0.5) * H / 14, ph = (t * 2.2 + i * 0.37) % 1, side = i % 2 ? 1 : -1;
                const x0 = cx + side * (half + 20 + (1 - ph) * W * 0.4);
                ctx.globalAlpha = ph * 0.8;
                ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 - side * 30, y); ctx.stroke();
            }
            // nắm đấm khổng lồ mờ trước mũi xe
            ctx.globalAlpha = 0.15 + 0.45 * k;
            ctx.save(); ctx.translate(cx, f.py + dir * (30 + k * 20)); if (dir > 0) ctx.rotate(Math.PI);
            const s = 1.2 + k * 0.9;
            ctx.scale(s, s);
            ctx.fillStyle = 'rgba(254,240,138,.35)'; ctx.strokeStyle = '#fef08a'; ctx.lineWidth = 2 / s; ctx.shadowColor = '#facc15'; ctx.shadowBlur = 16;
            onePunchEvoFist(ctx); ctx.fill(); ctx.stroke();
            ctx.restore();
        } else {
            // chớp trắng ngắn
            if (hk < 0.35) { ctx.globalAlpha = (1 - hk / 0.35) * 0.55; ctx.fillStyle = '#fffbeb'; ctx.fillRect(0, 0, W, H); }
            // mây rẽ đôi ở nửa sân địch
            const cy = dir < 0 ? H * 0.14 : H * 0.86;
            ctx.globalAlpha = 1 - hk * 0.6;
            for (let i = 0; i < 7; i++) {
                const side = i % 2 ? 1 : -1, d = half + 10 + EvoFx.ease(hk) * (40 + i * 12), y = cy + (i - 3) * 18 * (dir < 0 ? 1 : -1);
                ctx.fillStyle = i % 3 ? 'rgba(241,245,249,.85)' : 'rgba(203,213,225,.85)';
                for (let j = 0; j < 3; j++) { ctx.beginPath(); ctx.arc(cx + side * (d + j * 16), y + (j % 2) * 6, 14 + j * 3, 0, Math.PI * 2); ctx.fill(); }
            }
            // vạch tốc độ dọc cột
            ctx.globalAlpha = 1 - hk; ctx.strokeStyle = '#fff7d6'; ctx.lineWidth = 2;
            for (let i = 0; i < 10; i++) {
                const x = cx + (i - 4.5) * half / 4.5, y0 = ((i * 53 + e * 40) % H);
                ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y0 + 60); ctx.stroke();
            }
        }
        ctx.restore();
    },
};
function onePunchEvoFist(g) {
    // nắm đấm nhìn từ trên, mũi đấm hướng −y
    g.beginPath();
    g.moveTo(-14, 14); g.lineTo(-14, -2);
    for (let i = 0; i < 4; i++) { const x = -14 + i * 7; g.arcTo(x, -14, x + 7, -14, 3.5); g.lineTo(x + 7, -6); }
    g.lineTo(14, 14); g.closePath();
}
EvoBodyKit.effects.punchDodge = {
    draw(f) {
        const k = 1 - f.life / f.maxLife;
        ctx.save();
        for (let i = 0; i < 3; i++) {
            const q = i / 3, x = f.x0 + (f.x1 - f.x0) * q;
            ctx.globalAlpha = (1 - k) * (0.2 + 0.25 * q);
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(x, f.py, f.pw, f.ph);
        }
        ctx.globalAlpha = 1 - k; ctx.strokeStyle = '#fff7d6'; ctx.lineWidth = 2;
        const dir = Math.sign(f.x1 - f.x0) || 1;
        for (let i = 0; i < 4; i++) { const y = f.py + 4 + i * (f.ph - 8) / 3, x = (dir > 0 ? f.x0 : f.x0 + f.pw); ctx.beginPath(); ctx.moveTo(x - dir * 6, y); ctx.lineTo(x - dir * (22 + i * 4), y); ctx.stroke(); }
        ctx.restore();
    },
};
EvoBodyKit.effects.punchJog = {
    update(f, p) { f.x = p.x + p.w / 2; f.y = p.y; },
    draw(f) {
        const k = 1 - f.life / f.maxLife;
        ctx.save(); ctx.globalAlpha = 1 - k;
        ctx.fillStyle = '#facc15'; ctx.shadowColor = '#facc15'; ctx.shadowBlur = 8;
        ctx.font = "900 11px Orbitron, Arial"; ctx.textAlign = 'center';
        if (typeof drawWorldText === 'function') drawWorldText(ctx, '+THÚ VỊ', f.x, f.y - 12 - k * 16); else ctx.fillText('+THÚ VỊ', f.x, f.y - 12 - k * 16);
        ctx.restore();
    },
};
// ===== Hình ảnh Evo 3/4 (chỉ vẽ) =====
EvoFx.theme('one_punch', {
    c1: '#facc15', c2: '#ef4444', dark: '#201603', slogan: '...Nghiêm túc đấy.',
    sfx: [[0, 55, 'sawtooth', 0.9, 0.22], [790, 40, 'square', 0.5, 0.2], [800, 1200, 'triangle', 0.12, 0.08]],
    need(p) { const req = EvoBodyKit.combo(p, '1+2+3+4') ? 80 : 100; return `Thú Vị ${Math.floor(p.opExc || 0)}/${req}%`; },
    icon(g, mode) {
        if (mode === 'ult') { // mặt nghiêm túc: đầu tròn, mắt gạch, miệng thẳng
            g.beginPath(); g.arc(0, 0, 12, 0, Math.PI * 2); g.fill();
            g.save(); g.strokeStyle = '#201603'; g.lineWidth = 2.2; g.lineCap = 'round';
            g.beginPath(); g.moveTo(-7, -2); g.lineTo(-2.5, -1); g.moveTo(7, -2); g.lineTo(2.5, -1); g.stroke();
            g.lineWidth = 1.4; g.beginPath(); g.moveTo(-8, -5.5); g.lineTo(-2, -4); g.moveTo(8, -5.5); g.lineTo(2, -4); g.stroke();
            g.lineWidth = 1.8; g.beginPath(); g.moveTo(-3.5, 6); g.lineTo(3.5, 6); g.stroke();
            g.restore();
        } else { // bước né + vạch gió
            g.save(); g.scale(0.62, 0.62); onePunchEvoFist(g); g.fill(); g.restore();
            g.lineWidth = 2; g.beginPath(); g.moveTo(-13, -4); g.lineTo(-9, -4); g.moveTo(-14, 1); g.lineTo(-10, 1); g.moveTo(-13, 6); g.lineTo(-9, 6); g.stroke();
        }
    },
});
EvoFx.body('one_punch', {
    over(p) {
        const d = p.evoPilot;
        if (!d || !EvoBodyKit.has(p, 3) || !(d.walk > 0)) return;
        // chạy bộ: vòng tiến độ 3s sau xe + giọt mồ hôi + bụi chân
        const k = Math.min(1, d.walk / 180), t = Date.now() / 1000, cx = p.x + p.w / 2, cy = p.id === 1 ? p.y + p.h + 9 : p.y - 9;
        ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = '#facc15'; ctx.beginPath(); ctx.arc(cx, cy, 6, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#7dd3fc';
        const ph = (t * 2) % 1;
        ctx.globalAlpha = 1 - ph;
        ctx.beginPath(); ctx.ellipse(p.x + p.w + 3 + ph * 4, p.y + 4 + ph * 6, 1.8, 2.8, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#a8a29e';
        for (let i = 0; i < 3; i++) { const q = (t * 3 + i / 3) % 1; ctx.globalAlpha = (1 - q) * 0.5; ctx.beginPath(); ctx.arc(cx + (i - 1) * 8, cy + (p.id === 1 ? 1 : -1) * q * 8, 2 + q * 4, 0, Math.PI * 2); ctx.fill(); }
    },
});
