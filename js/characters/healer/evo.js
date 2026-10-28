EvoBodyKit.register('healer', {
    setup(p) {
        Object.assign(p.evoPilot, {
            hold: 0,
            reverse: 0,
            enemyLast: 0,
            enemyLost: 0,
        });
        if (EvoBodyKit.has(p, 3)) p.maxHp += 2;
        if (EvoBodyKit.combo(p, '3+4')) {
            p.maxHp++;
            p.damage *= 1.1;
            p.shield++;
        }
    },
    update(p, inp) {
        const d = p.evoPilot,
            e = EvoBodyKit.enemy(p);
        const external = p.hp - (p.hlLastHp === undefined ? p.hp : p.hlLastHp);
        if (external > 0) EvoSystem.gain(p, 'heal', external * 20);
        if (EvoBodyKit.has(p, 3) && inp.s) d.hold++;
        if (d.reverse > 0) {
            p.ultActiveTicks = Math.max(p.ultActiveTicks || 0, d.reverse);
            d.reverse--;
            const gained = e.hp - d.enemyLast + d.enemyLost;
            d.enemyLost = 0;
            // Bỏ tăng vọt do reset/hồi sinh; chỉ đảo các lần hồi trong hiệp.
            if (gained > 1e-5 && gained <= e.maxHp * 0.5) {
                e.hp = Math.max(0.01, e.hp - gained);
                e.takeDamage(gained, p, { evoHealReversal: true });
            }
            d.enemyLast = e.hp;
            d.enemyLost = 0;
        }
    },
    shoot(p, inp, now) {
        if (!EvoBodyKit.has(p, 3)) return false;
        const d = p.evoPilot;
        if (!inp.s && d.hold > 0) {
            if (p.ammo > 0 && now - p.lastShot > 350) {
                if (d.hold >= 30) {
                    let cost = 0.5;
                    if (EvoBodyKit.combo(p, '1+3')) {
                        const paid = Math.min(cost, p.hlOver || 0);
                        p.hlOver -= paid;
                        cost -= paid;
                    }
                    if (p.hp - cost >= 1) {
                        p.hp -= cost;
                        p.hlLastHp = p.hp;
                        EvoBodyKit.bullet(p, {
                            w: 4,
                            h: 16,
                            dmg: 1,
                            isPiercing: true,
                            evoTrueNeedle: true,
                            hook: 'evo_heal_needle',
                        });
                        p.ammo--;
                        p.lastShot = now;
                    }
                } else {
                    hlFire(p);
                    p.ammo--;
                    p.lastShot = now;
                }
            }
            d.hold = 0;
        }
        return true;
    },
    skill(p) {
        const req = hlLifeReq(p),
            ready = p.hlReady || p.hlLife >= req * 0.5;
        hlHeal(p, 1, 'skill');
        if (ready) {
            p.hlLife = req;
            p.hlReady = true;
        }
        EvoBodyKit.flash(p, '#4ade80');
    },
    ultimate(p) {
        const time = EvoBodyKit.combo(p, '1+2+3+4') ? 360 : 240;
        Object.assign(p.evoPilot, {
            reverse: time,
            enemyLast: EvoBodyKit.enemy(p).hp,
            enemyLost: 0,
        });
        p.ultActiveTicks = time;
        EvoBodyKit.fx(p, 'healReversal', time, { color: '#f43f5e' });
    },
    bot(p, e, aligned, inp, t) {
        if (EvoBodyKit.has(p, 3)) {
            const h = p.evoPilot.hold,
                needle =
                    !p.hlReady &&
                    (EvoBodyKit.combo(p, '3+4') || e.shield > 0 || e.hp <= 1) &&
                    (p.hp > p.maxHp * 0.7 || (p.hlOver || 0) >= 0.5);
            inp.s = needle
                ? h > 0
                    ? h < 30 || (!aligned && h < 80)
                    : aligned && t % 16 === 0
                : aligned && t % 22 < 3;
        }
    },
    botSkill(p) {
        return p.hp < p.maxHp || p.hlLife >= hlLifeReq(p) * 0.5;
    },
});
BulletHooks.register('evo_heal_needle', {
    hit(b, p, e) {
        if (e) hlOnImpact(b, p, e, b.x, b.y, false);
        if (e && EvoBodyKit.combo(p, '3+4')) hlHeal(p, 0.5, 'needleRebound');
    },
    draw(b) {
        ctx.save();
        ctx.strokeStyle = '#bef264';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(b.x + 2, b.y);
        ctx.lineTo(b.x + 2, b.y + b.h);
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.fillRect(b.x, b.y + b.h / 3, 4, 4);
        ctx.restore();
    },
});
(function () {
    const heal = hlHeal;
    hlHeal = function (p, ...args) {
        const hp = p.hp,
            result = heal(p, ...args);
        if (p.evoPilot) EvoSystem.gain(p, 'heal', Math.max(0, p.hp - hp) * 20);
        return result;
    };
    const take = Player.prototype.takeDamage;
    Player.prototype.takeDamage = function (amount, attacker, options) {
        if (options && options.gearBullet && options.gearBullet.evoTrueNeedle)
            options = { ...options, bypassShield: true, isPiercing: true };
        const before = this.hp,
            result = take.call(this, amount, attacker, options),
            lost = Math.max(0, before - this.hp),
            healer = this.id === 1 ? p2 : p1;
        if (
            healer &&
            healer.weapon === 'healer' &&
            healer.evoPilot &&
            healer.evoPilot.reverse > 0 &&
            lost > 0
        ) {
            healer.evoPilot.enemyLost += lost;
            hlHeal(healer, lost * 0.5, 'reverse');
        }
        return result;
    };
})();
EvoBodyKit.effects.healReversal = {
    update(f, p) {
        f.x = p.x + p.w / 2;
        f.y = p.y + p.h / 2;
    },
    draw(f) {
        ctx.save();
        const enemy = EvoBodyKit.enemy(f.side === 1 ? p1 : p2);
        for (const [x, y, col] of [
            [f.x, f.y, '#4ade80'],
            [enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, '#f43f5e'],
        ]) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate((f.maxLife - f.life) * 0.025);
            ctx.strokeStyle = col;
            ctx.shadowBlur = 12;
            ctx.shadowColor = col;
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(-18, 0);
            ctx.lineTo(18, 0);
            ctx.moveTo(0, -18);
            ctx.lineTo(0, 18);
            ctx.stroke();
            ctx.restore();
        }
        ctx.restore();
    },
};
