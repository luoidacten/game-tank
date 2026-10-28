function engPilotTurrets(p) {
    return turrets.filter((t) => t.active && t.owner === p);
}
EvoBodyKit.register('engineer', {
    balance: {
        '1+2': { damage: 0.55, taken: 1.5 },
        '1+4': { damage: 0.5, taken: 1.4 },
        '2+4': { damage: 0.85 },
    },
    setup(p) {
        Object.assign(p.evoPilot, {
            lastTap: -100,
            parts: p.engParts || 0,
            rageAcc: 0,
        });
        if (EvoBodyKit.has(p, 3)) p.maxHp = Math.max(1.5, p.maxHp - 1.5);
    },
    update(p) {
        const d = p.evoPilot,
            mine = engPilotTurrets(p);
        for (const smart of [false, true]) {
            const group = mine.filter((t) => !!t.isSmart === smart);
            while (group.length > 3) group.shift().active = false;
        }
        if (EvoBodyKit.has(p, 3) && d.press) {
            if (d.t - d.lastTap <= 18) {
                const mounted = mine.find((t) => t.evoMounted),
                    candidate =
                        mounted ||
                        mine
                            .filter((t) => t.isSmart)
                            .sort(
                                (a, b) =>
                                    Math.hypot(a.x - p.x, a.y - p.y) -
                                    Math.hypot(b.x - p.x, b.y - p.y),
                            )[0];
                if (candidate) {
                    candidate.evoMounted = !mounted;
                    candidate.x = p.x;
                    candidate.y = p.y + EvoBodyKit.dir(p) * 35;
                    d.suppress = 2;
                    EvoBodyKit.flash(p, '#22d3ee');
                }
                d.lastTap = -100;
            } else d.lastTap = d.t;
        }
        for (const t of mine)
            if (t.evoMounted) {
                t.x = p.x + (p.w - t.w) / 2;
                t.y = p.y + (p.h - t.h) / 2;
            }
        const parts = p.engParts || 0;
        if (parts > d.parts) EvoSystem.gain(p, 'parts', (parts - d.parts) * 6);
        d.parts = parts;
        d.rageAcc += mine.length;
        if (d.rageAcc >= 60) {
            const gain = Math.floor(d.rageAcc / 60);
            d.rageAcc %= 60;
            EvoSystem.gain(p, 'turrets', gain);
        }
    },
    shoot(p) {
        if (p.evoPilot.suppress > 0) {
            p.evoPilot.suppress--;
            return true;
        }
        return false;
    },
    skill(p) {
        const mine = engPilotTurrets(p);
        if (!mine.length) return false;
        for (const t of mine) {
            const before = p.bullets.length;
            t.shoot();
            for (const b of p.bullets.slice(before)) b.dmg *= 2;
            t.hp = Math.min(t.maxHp, t.hp + t.maxHp * 0.3);
        }
        EvoBodyKit.flash(p, '#22d3ee');
    },
    ultimateReady(p) {
        return engPilotTurrets(p).length >= 3;
    },
    ultimate(p) {
        const parts = engPilotTurrets(p).slice(0, 3);
        if (parts.length < 3) return false;
        const x = parts.reduce((s, t) => s + t.x, 0) / 3,
            y = parts.reduce((s, t) => s + t.y, 0) / 3;
        for (const t of parts) t.active = false;
        EvoBodyKit.fx(p, 'engFortress', 360, {
            x,
            y,
            w: 36,
            h: 36,
            parts: parts.map((t) => ({ smart: t.isSmart, x: t.x, y: t.y })),
            color: '#22d3ee',
        });
    },
    bot(p, e, aligned, inp, t) {
        if (EvoBodyKit.has(p, 3)) {
            const m = t % 180;
            inp.s = m < 2 || (m >= 8 && m < 10) || (m >= 30 && m < 100);
        }
    },
    botSkill(p) {
        return engPilotTurrets(p).length > 0;
    },
});
EvoBodyKit.effects.engFortress = {
    update(f, p) {
        if (f.life % 36 === 0) {
            const e = EvoBodyKit.enemy(p);
            EvoBodyKit.ray(
                p,
                12,
                Math.min(p.damage * 0.5, e.maxHp * 0.05),
                18,
                '#22d3ee',
                0,
                EvoBodyKit.combo(p, '1+2+3+4'),
                f.x + 18,
                f,
            );
        }
        if (EvoBodyKit.combo(p, '2+4')) p.hp = Math.min(p.maxHp, p.hp + 0.004);
        if (f.life === 1)
            for (const c of f.parts)
                turrets.push(
                    new Turret(
                        p,
                        c.smart,
                        Math.max(10, Math.min(canvas.width - 30, c.x)),
                        c.y,
                    ),
                );
    },
    draw(f) {
        ctx.save();
        ctx.translate(f.x + 18, f.y + 18);
        ctx.strokeStyle = '#67e8f9';
        ctx.fillStyle = '#083344';
        ctx.shadowColor = '#22d3ee';
        ctx.shadowBlur = 14;
        ctx.lineWidth = 3;
        ctx.fillRect(-20, -18, 40, 36);
        ctx.strokeRect(-20, -18, 40, 36);
        for (const x of [-12, 0, 12]) {
            ctx.fillStyle = '#cbd5e1';
            ctx.fillRect(x - 3, -32, 6, 27);
        }
        ctx.strokeStyle = 'rgba(34,211,238,.4)';
        ctx.beginPath();
        ctx.arc(0, 0, 65, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    },
};
(function () {
    const update = Turret.prototype.update;
    Turret.prototype.update = function () {
        const base = this.baseReload;
        if (this.evoMounted && !EvoBodyKit.combo(this.owner, '1+3'))
            this.baseReload = base / 0.6;
        try {
            return update.apply(this, arguments);
        } finally {
            this.baseReload = base;
        }
    };
})();
