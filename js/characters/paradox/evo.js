EvoBodyKit.register('paradox', {
    balance: {
        '1+2': { damage: 0.75, taken: 1.25 },
        '1+4': { damage: 0.55, taken: 1.5 },
    },
    setup(p) {
        Object.assign(p.evoPilot, { marks: 0, shots: [], enemyHistory: [] });
    },
    update(p) {
        const d = p.evoPilot,
            e = EvoBodyKit.enemy(p);
        d.enemyHistory.push({ x: e.x, y: e.y });
        if (d.enemyHistory.length > 300) d.enemyHistory.shift();
        d.shots = d.shots.filter((s) => ++s.age <= 300);
        for (const b of p.bullets)
            if (b.pdxEcho && !b.hook) b.hook = 'evo_pdx_echo';
    },
    skill(p) {
        if (groundedBlock(p)) return false;
        if (p.paradoxAnchor) p.paradoxRewind(false);
        else {
            p.paradoxAnchor = {
                x: p.x,
                y: p.y,
                hp: p.hp,
                ammo: p.ammo,
                timer: 600,
            };
            EvoBodyKit.flash(p, '#c4b5fd');
        }
    },
    ultimate(p) {
        const d = p.evoPilot,
            e = EvoBodyKit.enemy(p),
            past = d.enemyHistory[0];
        if (past) {
            e.x = Math.max(0, Math.min(canvas.width - e.w, past.x));
            e.y = past.y;
        }
        const shots = d.shots.map((s) => ({ ...s }));
        if (EvoBodyKit.combo(p, '2+4'))
            for (const h of (p.paradoxHistory || [])
                .filter((h) => h.shot)
                .slice(-6))
                shots.push({
                    x: h.x + p.w / 2,
                    y: p.id === 1 ? h.y : h.y + p.h,
                    w: 5,
                    h: 5,
                    vx: 0,
                    vy: EvoBodyKit.dir(p) * C.bulletSpeed,
                    dmg: p.damage * 0.6,
                    age: 0,
                });
        const total = shots.reduce((a, s) => a + s.dmg, 0),
            scale = Math.min(1, (e.maxHp * 0.55) / Math.max(0.01, total));
        EvoBodyKit.fx(p, 'pdxLoop', 24, {
            shots: shots.map((s) => ({ ...s, dmg: s.dmg * scale })),
        });
        if (EvoBodyKit.combo(p, '1+2+3+4')) p.paradoxFireRifts();
    },
    bot(p, e, aligned, inp, t) {
        if (EvoBodyKit.has(p, 3))
            inp.s =
                p.evoPilot.marks >= 2 && p.paradoxCooldown <= 0
                    ? p.paradoxCharge < 14
                    : aligned && t % 20 < 3;
    },
    botSkill(p) {
        return p.hp < p.maxHp * 0.8 || !p.paradoxAnchor;
    },
});
BulletHooks.register('evo_pdx_echo', {
    hit(b, p, e) {
        if (!e || e === p) return;
        EvoSystem.gain(p, 'echo', 4);
        if (EvoBodyKit.has(p, 3)) {
            p.evoPilot.marks = Math.min(4, p.evoPilot.marks + 1);
            if (EvoBodyKit.combo(p, '1+3'))
                p.enemyTimeMarks = Math.min(4, (p.enemyTimeMarks || 0) + 1);
            EvoBodyKit.flash(e, '#c4b5fd');
        }
    },
});
EvoBodyKit.effects.pdxLoop = {
    update(f, p) {
        if (f.life === 1)
            for (const s of f.shots)
                EvoBodyKit.bullet(p, { ...s, evoReplay: true, hitIds: [] });
    },
    draw(f) {
        ctx.save();
        ctx.strokeStyle = '#a78bfa';
        ctx.globalAlpha = 0.5;
        for (let y = 0; y < canvas.height; y += 36) {
            ctx.beginPath();
            ctx.moveTo((f.life % 4) * 8, y);
            ctx.lineTo(canvas.width, y + 3);
            ctx.stroke();
        }
        for (const s of f.shots) {
            ctx.strokeRect(s.x - 6, s.y - 6, 12, 12);
        }
        ctx.restore();
    },
};
(function () {
    const rewind = Player.prototype.paradoxRewind;
    Player.prototype.paradoxRewind = function () {
        const result = rewind.apply(this, arguments);
        if (this.weapon === 'paradox' && this.evoPilot) {
            EvoSystem.gain(this, 'rewind', 10);
            if (EvoBodyKit.has(this, 3) && this.evoPilot.marks > 0) {
                EvoBodyKit.hit(
                    this,
                    EvoBodyKit.enemy(this),
                    this.evoPilot.marks * 0.3,
                );
                this.evoPilot.marks = 0;
            }
        }
        return result;
    };
    const fire = Player.prototype.fireBullet;
    Player.prototype.fireBullet = function () {
        const n = this.bullets.length,
            result = fire.apply(this, arguments);
        if (this.weapon === 'paradox' && this.evoPilot)
            for (const b of this.bullets.slice(n))
                if (!b.evoReplay) {
                    this.evoPilot.shots.push({
                        x: b.x,
                        y: b.y,
                        w: b.w,
                        h: b.h,
                        vx: b.vx,
                        vy: b.vy,
                        dmg: b.dmg,
                        age: 0,
                    });
                    if (this.evoPilot.shots.length > 48)
                        this.evoPilot.shots.shift();
                }
        return result;
    };
})();
