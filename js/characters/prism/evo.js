EvoBodyKit.register('prism', {
    balance: { '2+3': { hp: 0.8 } },
    setup(p) {
        Object.assign(p.evoPilot, { instant: 0, ult: 0, reflected: 0 });
    },
    update(p) {
        const d = p.evoPilot;
        if (d.instant > 0 && --d.instant === 0) p.prCd = d.savedCd;
        if (d.ult > 0) {
            p.prOn = Math.max(p.prOn || 0, 2);
            p.prAge = 0;
            if (--d.ult === 0) {
                const e = EvoBodyKit.enemy(p);
                EvoBodyKit.fx(p, 'prismConverge', 26, {});
                EvoBodyKit.ray(
                    p,
                    24,
                    Math.min(2.5, e.maxHp * 0.45),
                    24,
                    '#e879f9',
                    0.25,
                );
                if (EvoBodyKit.combo(p, '2+4'))
                    for (let i = -2; i <= 2; i++)
                        EvoBodyKit.bullet(p, {
                            vx: i * 1.5,
                            dmg: e.maxHp * 0.03,
                            hook: 'prism',
                            prKind: 'shard',
                        });
            }
        }
    },
    skill(p) {
        const d = p.evoPilot,
            t = EvoBodyKit.combo(p, '1+2+3+4') ? 30 : 21;
        d.savedCd = p.prCd || 0;
        d.instant = t + 1;
        p.prOn = Math.max(p.prOn || 0, t);
        p.prAge = 0;
        EvoBodyKit.fx(p, 'prismGold', 30, {});
    },
    ultimate(p) {
        p.evoPilot.ult = 240;
        p.evoPilot.reflected = 0;
        EvoBodyKit.fx(p, 'prismCourt', 240, { color: '#e879f9' });
    },
    bot(p, e, aligned, inp, t) {
        if (EvoBodyKit.has(p, 3)) inp.s = t % 18 < 2;
    },
    botSkill(p, e) {
        return e.bullets.some((b) => Math.hypot(b.x - p.x, b.y - p.y) < 180);
    },
});
(function () {
    const golden = prGolden;
    prGolden = function (p) {
        return (
            (p.evoPilot && (p.evoPilot.instant > 1 || p.evoPilot.ult > 0)) ||
            golden(p)
        );
    };
    const ratio = prGoldRatio;
    prGoldRatio = function (p) {
        return p.evoPilot && p.evoPilot.ult > 0 ? 1.5 : ratio(p);
    };
    const absorb = prAbsorb;
    prAbsorb = function (p, amount, ...args) {
        const r = absorb(p, amount, ...args);
        if (r && p.evoPilot) {
            p.evoPilot.reflected += amount;
            EvoSystem.gain(p, 'reflect', r.fast ? 20 : 10);
        }
        return r;
    };
    const hooks = BulletHooks.registry.prism,
        edge = hooks.edge;
    hooks.edge = function (b, p) {
        if (!EvoBodyKit.has(p, 3) || b.prKind !== 'shot') return edge(b, p);
        const count = b.prBounce || 0,
            result = edge(b, p),
            side = b.x <= 0 || b.x + b.w >= canvas.width;
        if (result === 'keep' && count === 0 && !b.evoSplit) {
            b.evoSplit = true;
            EvoBodyKit.fx(p, 'prismSplit', 18, { x: b.x + b.w / 2, y: b.y + b.h / 2 });
            const ratio = EvoBodyKit.combo(p, '1+3') ? 0.7 : 0.5;
            b.dmg *= ratio;
            const vx = b.vx,
                vy = b.vy,
                a = 0.16;
            b.vx = vx * Math.cos(a) - vy * Math.sin(a);
            b.vy = vx * Math.sin(a) + vy * Math.cos(a);
            EvoBodyKit.bullet(p, {
                ...b,
                vx: vx * Math.cos(-a) - vy * Math.sin(-a),
                vy: vx * Math.sin(-a) + vy * Math.cos(-a),
                evoSplit: true,
                hitIds: [],
            });
        }
        if (result) return result;
        if (side && count < 2 && b.y > 0 && b.y < canvas.height) {
            b.prBounce = count + 1;
            b.vx = -b.vx;
            b.x = Math.max(1, Math.min(canvas.width - 1 - b.w, b.x));
            return 'keep';
        }
    };
})();
EvoBodyKit.effects.prismCourt = {
    update(f, p) {
        f.x = p.x + p.w / 2;
        f.y = p.y + p.h / 2;
    },
    draw(f) {
        const k = 1 - f.life / f.maxLife, t = Date.now() / 1000, open = EvoFx.ease(Math.min(1, k * 8));
        const a = Math.min(1, f.life / 14), R = 30 + open * 18;
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.globalAlpha = a;
        // sàn khúc xạ cầu vồng dưới xe
        ctx.save(); ctx.rotate(t * 0.4);
        for (let i = 0; i < 7; i++) {
            ctx.fillStyle = EvoFx.rgba(PR_RAINBOW[i], 0.10);
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, R + 34, i * 0.898, (i + 1) * 0.898); ctx.closePath(); ctx.fill();
        }
        ctx.restore();
        // lưới tia nối các tấm kính
        const pts = [];
        for (let i = 0; i < 8; i++) { const ang = (i * Math.PI) / 4 + (f.maxLife - f.life) * 0.025; pts.push([Math.cos(ang) * R, Math.sin(ang) * R, ang]); }
        ctx.lineWidth = 1.2;
        for (let i = 0; i < 8; i++) {
            const [x1, y1] = pts[i], [x2, y2] = pts[(i + 3) % 8];
            ctx.strokeStyle = EvoFx.rgba(PR_RAINBOW[i % 7], 0.45);
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        }
        // 8 tấm kính pha lê
        for (let i = 0; i < 8; i++) {
            const [x, y, ang] = pts[i], col = PR_RAINBOW[i % 7];
            ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
            ctx.shadowColor = col; ctx.shadowBlur = 14;
            const g = ctx.createLinearGradient(-7, -13, 7, 13);
            g.addColorStop(0, 'rgba(255,255,255,.85)'); g.addColorStop(0.4, EvoFx.rgba(col, 0.55)); g.addColorStop(1, 'rgba(129,140,248,.35)');
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(6, -6); ctx.lineTo(6, 12); ctx.lineTo(-6, 14); ctx.lineTo(-6, -6); ctx.closePath(); ctx.fill();
            ctx.shadowBlur = 0; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.2; ctx.stroke();
            ctx.globalAlpha = a * (0.5 + 0.5 * Math.sin(t * 6 + i));
            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(-3, -6); ctx.lineTo(2, -10); ctx.stroke();
            ctx.restore();
        }
        ctx.restore();
    },
};
// ===== Hình ảnh Evo 3/4 (chỉ vẽ) =====
function prismEvoTri(g, s) { g.beginPath(); g.moveTo(0, -11 * s); g.lineTo(10 * s, 7 * s); g.lineTo(-10 * s, 7 * s); g.closePath(); }
EvoFx.theme('prism', {
    c1: '#e879f9', c2: '#fde047', dark: '#1b0b26', slogan: 'Vạn kính phản quang · cầu vồng hội tụ',
    sfx: [[0, 1568, 'sine', 0.25, 0.08], [80, 2093, 'sine', 0.25, 0.07], [160, 2637, 'sine', 0.3, 0.06], [240, 3136, 'sine', 0.4, 0.05]],
    icon(g, mode, k) {
        if (mode === 'ult') { // 8 tấm kính quanh lõi
            for (let i = 0; i < 8; i++) {
                g.save(); g.rotate(i * Math.PI / 4); g.globalAlpha *= 0.85;
                g.fillStyle = PR_RAINBOW[i % 7]; g.fillRect(-2, -13, 4, 6); g.restore();
            }
            prismEvoTri(g, 0.62); g.fill();
        } else { // lăng kính tách tia
            g.lineWidth = 2.2; prismEvoTri(g, 0.85); g.stroke();
            g.beginPath(); g.moveTo(-13, 0); g.lineTo(-3, -1); g.stroke();
            const cols = ['#f87171', '#facc15', '#4ade80', '#22d3ee'];
            for (let i = 0; i < 4; i++) { g.strokeStyle = cols[i]; g.lineWidth = 1.8; g.beginPath(); g.moveTo(3, 0); g.lineTo(13, -4 + i * 3); g.stroke(); }
        }
    },
});
EvoBodyKit.effects.prismGold = {
    update(f, p) { f.x = p.x + p.w / 2; f.y = p.y + p.h / 2; },
    draw(f) {
        const k = 1 - f.life / f.maxLife;
        ctx.save(); ctx.translate(f.x, f.y);
        ctx.globalAlpha = Math.min(1, f.life / 10);
        ctx.shadowColor = '#fde047'; ctx.shadowBlur = 18;
        // tia vàng toả 12 hướng
        ctx.strokeStyle = '#fef08a'; ctx.lineCap = 'round';
        for (let i = 0; i < 12; i++) {
            const a = i * Math.PI / 6 + k, r0 = 20 + k * 18, r1 = r0 + 16 * (1 - k) + 6;
            ctx.lineWidth = i % 2 ? 1.5 : 3;
            ctx.beginPath(); ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1); ctx.stroke();
        }
        ctx.strokeStyle = '#facc15'; ctx.lineWidth = 3;
        prismEvoTri(ctx, 2.2 + k * 1.5); ctx.stroke();
        ctx.restore();
    },
};
EvoBodyKit.effects.prismSplit = {
    draw(f) {
        const k = 1 - f.life / f.maxLife;
        ctx.save(); ctx.translate(f.x, f.y); ctx.globalAlpha = 1 - k;
        for (let i = 0; i < 7; i++) {
            ctx.strokeStyle = PR_RAINBOW[i]; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(0, 0, 6 + k * 18 + i * 1.5, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.restore();
    },
};
EvoBodyKit.effects.prismConverge = {
    update(f, p) { f.x = p.x + p.w / 2; f.y = p.id === 1 ? p.y - 4 : p.y + p.h + 4; },
    draw(f) {
        // 8 tia cầu vồng hội tụ về mũi xe (đúng 0.4s cảnh báo của tia lớn)
        const k = EvoFx.ease(1 - f.life / f.maxLife), R = 90 * (1 - k) + 6;
        ctx.save(); ctx.translate(f.x, f.y);
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 8; i++) {
            const a = i * Math.PI / 4 + k * 2, x = Math.cos(a) * R, y = Math.sin(a) * R;
            ctx.strokeStyle = PR_RAINBOW[i % 7]; ctx.lineWidth = 3; ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 12;
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(0, 0); ctx.stroke();
        }
        ctx.fillStyle = '#ffffff'; ctx.shadowColor = '#e879f9'; ctx.shadowBlur = 24;
        ctx.beginPath(); ctx.arc(0, 0, 4 + k * 10, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    },
};
