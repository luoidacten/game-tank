EvoBodyKit.register('ice', {
    balance: {
        '1+2': { damage: 0.7, taken: 1.6 },
        '1+3': { damage: 0.9 },
        '2+3': { damage: 0.55, taken: 1.8 },
    },
    setup(p) {
        Object.assign(p.evoPilot, {
            hold: 0,
            slowTicks: 0,
            wasSlow: false,
            blizzard: 0,
        });
    },
    update(p, inp) {
        const d = p.evoPilot,
            e = EvoBodyKit.enemy(p);
        if (e.slowTimer > 0 || e.acidZoneSlow > 0) {
            d.slowTicks++;
            if (!d.wasSlow) EvoSystem.gain(p, 'slow', 10);
            d.wasSlow = true;
        } else d.wasSlow = false;
        if ((p.iceAutoFreezeTimer || 0) < d.blizzard)
            EvoSystem.gain(p, 'blizzard', 20);
        d.blizzard = p.iceAutoFreezeTimer || 0;
        if (EvoBodyKit.has(p, 3) && inp.s) d.hold++;
    },
    shoot(p, inp, now) {
        if (!EvoBodyKit.has(p, 3)) return false;
        const d = p.evoPilot;
        if (!inp.s && d.hold > 0) {
            if (p.ammo > 0 && now - p.lastShot > 350) {
                if (d.hold >= 60) {
                    EvoBodyKit.bullet(p, {
                        w: 10,
                        h: 22,
                        vy: EvoBodyKit.dir(p) * C.bulletSpeed * 1.3,
                        dmg: p.damage * 1.35,
                        isPiercing: true,
                        isIce: true,
                        createIceZone: true,
                        hook: 'evo_ice',
                    });
                    EvoBodyKit.fx(p, 'iceLane', 240, {
                        x: p.x + p.w / 2,
                        width: EvoBodyKit.combo(p, '1+3') ? 90 : 50,
                        lastEnemyX: EvoBodyKit.enemy(p).x,
                    });
                } else p.fireBullet(1);
                p.ammo--;
                p.lastShot = now;
            }
            d.hold = 0;
        }
        return true;
    },
    skill(p) {
        const e = EvoBodyKit.enemy(p);
        if (!(e.slowTimer > 0 || e.acidZoneSlow > 0)) return false;
        if (e.weapon !== 'juggernaut')
            e.freezeTimer = Math.max(e.freezeTimer || 0, 48);
        else e.slowTimer = Math.max(e.slowTimer || 0, 90);
        EvoBodyKit.flash(e, '#a5f3fc');
    },
    ultimate(p) {
        const e = EvoBodyKit.enemy(p);
        if (e.weapon !== 'juggernaut')
            e.freezeTimer = Math.max(e.freezeTimer || 0, 120);
        EvoBodyKit.fx(p, 'iceZero', 120, {
            x: e.x + e.w / 2,
            y: e.y + e.h / 2,
            damage: Math.min(3, 0.75 + p.evoPilot.slowTicks / 120),
        });
        if (EvoBodyKit.combo(p, '1+2+3+4')) e.evoFrozenBullets = 120;
    },
    bot(p, e, aligned, inp, t) {
        if (EvoBodyKit.has(p, 3)) {
            const h = p.evoPilot.hold;
            inp.s =
                h > 0
                    ? h < 60 || (!aligned && h < 120)
                    : aligned && t % 20 === 0;
        }
    },
    botSkill(p, e) {
        return e.slowTimer > 0;
    },
});
BulletHooks.register('evo_ice', {
    hit(b, p, e) {
        if (e) {
            e.slowTimer = Math.max(e.slowTimer || 0, 120);
            if (EvoBodyKit.combo(p, '1+3'))
                iceZones.push(new IceZone(b.x, b.y, 60, 180, p));
        }
    },
    draw(b) {
        ctx.save();
        ctx.fillStyle = '#a5f3fc';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(b.x + b.w / 2, b.y);
        ctx.lineTo(b.x + b.w, b.y + b.h / 2);
        ctx.lineTo(b.x + b.w / 2, b.y + b.h);
        ctx.lineTo(b.x, b.y + b.h / 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    },
});
EvoBodyKit.effects.iceLane = {
    update(f, p) {
        const e = EvoBodyKit.enemy(p);
        if (Math.abs(e.x + e.w / 2 - f.x) < f.width / 2 + e.w / 2) {
            e.slowTimer = Math.max(e.slowTimer || 0, 30);
            const dx = e.x - f.lastEnemyX;
            e.x = Math.max(
                0,
                Math.min(
                    canvas.width - e.w,
                    e.x + Math.max(-2, Math.min(2, dx * 0.25)),
                ),
            );
            if (EvoBodyKit.combo(p, '1+3') && f.life % 60 === 0)
                iceZones.push(new IceZone(f.x, e.y, 35, 45, p));
        }
        f.lastEnemyX = e.x;
    },
    draw(f) {
        ctx.save();
        ctx.fillStyle = 'rgba(125,211,252,.18)';
        ctx.fillRect(f.x - f.width / 2, 0, f.width, canvas.height);
        ctx.strokeStyle = '#a5f3fc';
        ctx.lineWidth = 2;
        for (let y = 15; y < canvas.height; y += 35) {
            ctx.beginPath();
            ctx.moveTo(f.x - 10, y);
            ctx.lineTo(f.x + 10, y + 15);
            ctx.lineTo(f.x - 4, y + 25);
            ctx.stroke();
        }
        ctx.restore();
    },
};
EvoBodyKit.effects.iceZero = {
    update(f, p) {
        const e = EvoBodyKit.enemy(p);
        f.x = e.x + e.w / 2;
        f.y = e.y + e.h / 2;
        if (e.weapon !== 'juggernaut' && f.life > 1)
            e.freezeTimer = Math.max(e.freezeTimer || 0, 2);
        if (f.life === 1) {
            EvoBodyKit.hit(p, e, f.damage, e.freezeTimer > 0 ? 0.2 : 0);
            EvoBodyKit.flash(e, '#f0f9ff');
        }
    },
    draw(f) {
        ctx.save();
        ctx.strokeStyle = '#a5f3fc';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 16;
        ctx.lineWidth = 3;
        const r = 25 + (120 - f.life) * 0.15;
        for (let i = 0; i < 6; i++) {
            const a = (i * Math.PI) / 3;
            ctx.beginPath();
            ctx.moveTo(f.x, f.y);
            ctx.lineTo(f.x + Math.cos(a) * r, f.y + Math.sin(a) * r);
            ctx.stroke();
        }
        ctx.restore();
    },
};
(function () {
    const old = Player.prototype.updateBullets;
    Player.prototype.updateBullets = function () {
        if (!(this.evoFrozenBullets > 0)) return old.apply(this, arguments);
        this.evoFrozenBullets--;
        const saved = this.bullets.map((b) => [b, b.vx, b.vy]);
        for (const [b] of saved) {
            b.vx = 0;
            b.vy = 0;
        }
        try {
            return old.apply(this, arguments);
        } finally {
            for (const [b, vx, vy] of saved) {
                b.vx = vx;
                b.vy = vy;
            }
        }
    };
    const damage = Player.prototype.takeDamage;
    Player.prototype.takeDamage = function (amount, attacker, opts) {
        if (
            attacker &&
            attacker.weapon === 'ice' &&
            EvoBodyKit.combo(attacker, '2+4') &&
            this.freezeTimer > 0
        )
            amount *= 1.5;
        return damage.call(this, amount, attacker, opts);
    };
})();
