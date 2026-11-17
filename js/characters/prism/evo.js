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
        EvoBodyKit.flash(p, '#fde047');
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
        ctx.save();
        for (let i = 0; i < 8; i++) {
            const a = (i * Math.PI) / 4 + (f.maxLife - f.life) * 0.025;
            ctx.save();
            ctx.translate(f.x + Math.cos(a) * 42, f.y + Math.sin(a) * 42);
            ctx.rotate(a);
            ctx.strokeStyle = PR_RAINBOW[i % 7];
            ctx.fillStyle = 'rgba(196,181,253,.18)';
            ctx.shadowBlur = 10;
            ctx.shadowColor = ctx.strokeStyle;
            ctx.fillRect(-7, -12, 14, 24);
            ctx.strokeRect(-7, -12, 14, 24);
            ctx.restore();
        }
        ctx.restore();
    },
};
