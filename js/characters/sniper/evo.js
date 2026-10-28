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
        wall.x = Math.max(
            0,
            Math.min(canvas.width - wall.w, p.x + p.w / 2 - wall.w / 2),
        );
        wall.hitFlash = 12;
        EvoBodyKit.flash(p, '#fb7185');
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
    draw(f) {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,.25)';
        ctx.fillRect(0, 0, 18, canvas.height);
        ctx.fillRect(canvas.width - 18, 0, 18, canvas.height);
        ctx.strokeStyle = '#fb7185';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(f.x, f.y + 15, 24 + (f.life / 150) * 14, 0, Math.PI * 2);
        ctx.moveTo(f.x - 42, f.y + 15);
        ctx.lineTo(f.x + 42, f.y + 15);
        ctx.stroke();
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
