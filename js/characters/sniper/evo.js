EvoBodyKit.register('sniper', {
    balance: {
        '1+2': { damage: 0.95 },
        '2+3': { damage: 0.3, taken: 2 },
        '2+4': { damage: 0.7, taken: 1.25 },
    },
    setup(p) {
        p.evoPilot.hits = 0;
    },
    update(p) {
        if (!EvoBodyKit.has(p, 3)) return;
        for (const b of p.bullets) {
            const old = b.evoPrevY === undefined ? b.y : b.evoPrevY;
            if (
                !b.evoEmbrasure &&
                sniperWalls.some(
                    (w) =>
                        w.active &&
                        w.owner === p &&
                        b.x + b.w >= w.x &&
                        b.x <= w.x + w.w &&
                        Math.max(old, b.y) + b.h >= w.y &&
                        Math.min(old, b.y) <= w.y + w.h,
                )
            ) {
                b.evoEmbrasure = true;
                b.dmg *= EvoBodyKit.combo(p, '1+3') ? 1.6 : 1.4;
                b.vx *= 1.3;
                b.vy *= 1.3;
                if (EvoBodyKit.combo(p, '2+3')) {
                    b.evoConverted = true;
                    EvoBodyKit.ray(
                        p,
                        18,
                        b.dmg,
                        10,
                        '#fda4af',
                        0,
                        false,
                        b.x + b.w / 2,
                    );
                }
            }
            b.evoPrevY = b.y;
        }
        p.bullets = p.bullets.filter((b) => !b.evoConverted);
    },
    skill(p) {
        const wall = sniperWalls
            .filter((w) => w.active && w.owner === p && !w.isImmortal)
            .sort((a, b) => Math.abs(a.x - p.x) - Math.abs(b.x - p.x))[0];
        if (!wall) return false;
        const fromX = wall.x + wall.w / 2;
        wall.x = Math.max(
            0,
            Math.min(canvas.width - wall.w, p.x + p.w / 2 - wall.w / 2),
        );
        wall.hitFlash = 12;
        EvoBodyKit.fx(p, 'sniperSlide', 24, { x0: fromX, x1: wall.x + wall.w / 2, y: wall.y + wall.h / 2, ww: wall.w, wh: wall.h });
    },
    ultimateReady(p) {
        return p.evoPilot.hits >= 2;
    },
    ultimate(p) {
        p.evoPilot.aimX = EvoBodyKit.enemy(p).x + EvoBodyKit.enemy(p).w / 2;
        const x = p.evoPilot.aimX,
            n = EvoBodyKit.combo(p, '1+2+3+4') ? 2 : 1;
        for (let i = 0; i < n; i++)
            EvoBodyKit.ray(
                p,
                150 + i * 18,
                (p.damage * 3) / n,
                24,
                '#fb7185',
                0.4,
                true,
                x,
            );
        EvoBodyKit.fx(p, 'sniperScope', 150, { x, y: EvoBodyKit.enemy(p).y });
    },
    dealt(p) {
        p.evoPilot.hits++;
        EvoSystem.gain(p, 'hit', 12);
    },
    bot(p, e, aligned, inp, t) {
        if (EvoBodyKit.has(p, 3))
            inp.s = sniperWalls.some(
                (w) => w.active && w.owner === p && !w.isImmortal,
            )
                ? aligned && t % 35 < 3
                : t % 180 < 65;
    },
    botSkill(p) {
        return sniperWalls.some(
            (w) =>
                w.active &&
                w.owner === p &&
                !w.isImmortal &&
                Math.abs(w.x - p.x) > 35,
        );
    },
});
EvoBodyKit.effects.sniperScope = {
    update(f, p) {
        const e = EvoBodyKit.enemy(p);
        f.sx = p.x + p.w / 2; f.sy = p.id === 1 ? p.y : p.y + p.h;
        f.ey = e.y + e.h / 2;
    },
    draw(f) {
        const W = canvas.width, H = canvas.height, e = f.maxLife - f.life, t = Date.now() / 1000;
        const cx = f.x, cy = f.ey === undefined ? f.y + 15 : f.ey, close = EvoFx.ease(Math.min(1, e / 20));
        const a = Math.min(1, f.life / 6), hot = f.life < 24;
        ctx.save();
        ctx.globalAlpha = a; ctx.globalCompositeOperation = 'source-over';
        // 1) khung ống ngắm: hai mép đen khép lại thành lỗ tròn quanh mục tiêu
        const hole = Math.max(W, H) * (1 - close) + 120 * close;
        ctx.fillStyle = 'rgba(0,0,0,.55)';
        ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.arc(cx, cy, hole, 0, Math.PI * 2, true); ctx.fill();
        const vg = ctx.createRadialGradient(cx, cy, hole * 0.7, cx, cy, hole);
        vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.45)');
        ctx.fillStyle = vg; ctx.beginPath(); ctx.arc(cx, cy, hole, 0, Math.PI * 2); ctx.fill();
        // 2) tia laser đỏ từ nòng tới tâm
        if (f.sx !== undefined) {
            ctx.strokeStyle = hot ? 'rgba(255,60,90,.9)' : 'rgba(251,113,133,.55)'; ctx.lineWidth = hot ? 2 : 1.2;
            ctx.setLineDash([8, 6]); ctx.lineDashOffset = -t * 80;
            ctx.beginPath(); ctx.moveTo(f.sx, f.sy); ctx.lineTo(cx, cy); ctx.stroke(); ctx.setLineDash([]);
        }
        // 3) tâm ngắm
        ctx.translate(cx, cy);
        const col = hot ? '#ff1744' : '#fb7185', R = 36 + (1 - close) * 30;
        ctx.strokeStyle = col; ctx.shadowColor = col; ctx.shadowBlur = hot ? 16 : 8; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.stroke();
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-R - 14, 0); ctx.lineTo(-8, 0); ctx.moveTo(8, 0); ctx.lineTo(R + 14, 0);
        ctx.moveTo(0, -R - 14); ctx.lineTo(0, -8); ctx.moveTo(0, 8); ctx.lineTo(0, R + 14);
        ctx.stroke();
        ctx.fillStyle = col;
        for (let i = -3; i <= 3; i++) if (i) { ctx.fillRect(i * 9 - 1, -1, 2, 2); ctx.fillRect(-1, i * 9 - 1, 2, 2); }
        // vạch ngoài xoay + vòng đếm ngược khoá
        ctx.save(); ctx.rotate(t * 0.8);
        for (let i = 0; i < 24; i++) { const ang = i * Math.PI / 12, l = i % 6 ? 4 : 9; ctx.beginPath(); ctx.moveTo(Math.cos(ang) * (R + 6), Math.sin(ang) * (R + 6)); ctx.lineTo(Math.cos(ang) * (R + 6 + l), Math.sin(ang) * (R + 6 + l)); ctx.stroke(); }
        ctx.restore();
        ctx.lineWidth = 3.5; ctx.strokeStyle = hot ? '#ffffff' : col;
        ctx.beginPath(); ctx.arc(0, 0, R - 6, -Math.PI / 2, -Math.PI / 2 + (e / f.maxLife) * Math.PI * 2); ctx.stroke();
        if (hot) { ctx.globalAlpha = a * (0.4 + 0.4 * Math.sin(t * 40)); ctx.fillStyle = 'rgba(255,23,68,.25)'; ctx.beginPath(); ctx.arc(0, 0, R - 8, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
    },
};
// ===== Hình ảnh Evo 3/4 (chỉ vẽ) =====
EvoFx.theme('sniper', {
    c1: '#fb7185', c2: '#fecdd3', dark: '#26070f', slogan: 'Một phát · một mạng',
    sfx: [[0, 2400, 'square', 0.03, 0.06], [120, 2400, 'square', 0.03, 0.06], [200, 140, 'sine', 0.9, 0.12]],
    need(p) { return `Trúng địch ${Math.min(2, p.evoPilot ? p.evoPilot.hits : 0)}/2`; },
    icon(g, mode) {
        if (mode === 'ult') { // tâm ngắm
            g.lineWidth = 2; g.beginPath(); g.arc(0, 0, 9, 0, Math.PI * 2); g.stroke();
            g.beginPath(); g.moveTo(-13, 0); g.lineTo(-4, 0); g.moveTo(4, 0); g.lineTo(13, 0); g.moveTo(0, -13); g.lineTo(0, -4); g.moveTo(0, 4); g.lineTo(0, 13); g.stroke();
            g.beginPath(); g.arc(0, 0, 1.8, 0, Math.PI * 2); g.fill();
        } else { // tường trượt
            g.fillRect(-9, -2, 18, 9);
            g.save(); g.fillStyle = '#26070f'; g.fillRect(-1, -2, 1.5, 4); g.fillRect(-9, 2, 18, 1.2); g.fillRect(-5, 3, 1.5, 4); g.fillRect(4, 3, 1.5, 4); g.restore();
            g.lineWidth = 2;
            g.beginPath(); g.moveTo(-12, -7); g.lineTo(12, -7); g.moveTo(-12, -7); g.lineTo(-8, -10); g.moveTo(-12, -7); g.lineTo(-8, -4); g.moveTo(12, -7); g.lineTo(8, -10); g.moveTo(12, -7); g.lineTo(8, -4); g.stroke();
        }
    },
});
EvoFx.body('sniper', {
    over(p) {
        if (!EvoBodyKit.has(p, 3)) return;
        // đạn đã qua Lỗ Châu Mai: vệt đạn đỏ tăng tốc
        for (const b of p.bullets) {
            if (!b.evoEmbrasure) continue;
            const cx = b.x + b.w / 2, cy = b.y + b.h / 2, sp = Math.hypot(b.vx, b.vy) || 1, ux = b.vx / sp, uy = b.vy / sp;
            const g = ctx.createLinearGradient(cx, cy, cx - ux * 34, cy - uy * 34);
            g.addColorStop(0, 'rgba(255,241,242,.95)'); g.addColorStop(0.3, 'rgba(251,113,133,.7)'); g.addColorStop(1, 'rgba(251,113,133,0)');
            ctx.strokeStyle = g; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.shadowColor = '#fb7185'; ctx.shadowBlur = 10;
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx - ux * 34, cy - uy * 34); ctx.stroke();
        }
    },
});
EvoBodyKit.effects.sniperSlide = {
    draw(f) {
        const k = 1 - f.life / f.maxLife, a = 1 - k;
        ctx.save();
        ctx.globalAlpha = a;
        // vệt trượt + bóng tường cũ mờ dần
        const g = ctx.createLinearGradient(f.x0, 0, f.x1, 0);
        g.addColorStop(0, 'rgba(251,113,133,0)'); g.addColorStop(1, 'rgba(251,113,133,.55)');
        ctx.fillStyle = g; ctx.fillRect(Math.min(f.x0, f.x1), f.y - f.wh / 2, Math.abs(f.x1 - f.x0), f.wh);
        ctx.strokeStyle = 'rgba(254,205,211,.5)'; ctx.setLineDash([4, 4]);
        ctx.strokeRect(f.x0 - f.ww / 2, f.y - f.wh / 2, f.ww, f.wh); ctx.setLineDash([]);
        ctx.strokeStyle = '#fb7185'; ctx.lineWidth = 2; ctx.shadowColor = '#fb7185'; ctx.shadowBlur = 14;
        ctx.strokeRect(f.x1 - f.ww / 2 - 3 - k * 6, f.y - f.wh / 2 - 3 - k * 6, f.ww + 6 + k * 12, f.wh + 6 + k * 12);
        ctx.restore();
    },
};
(function () {
    const take = SniperWall.prototype.takeHit;
    SniperWall.prototype.takeHit = function (damage, attacker) {
        if (this.owner && attacker !== this.owner)
            EvoSystem.gain(this.owner, 'wall', 6);
        return take.apply(this, arguments);
    };
})();
