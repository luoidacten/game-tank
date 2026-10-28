EvoBodyKit.register('berserker', {
    setup(p) {
        Object.assign(p.evoPilot, {
            lastTap: -100,
            cutCd: 0,
            cutBuff: 0,
            roar: 0,
            ult: 0,
        });
    },
    update(p) {
        const d = p.evoPilot;
        for (const k of ['cutCd', 'cutBuff', 'roar']) if (d[k] > 0) d[k]--;
        if (EvoBodyKit.has(p, 3) && d.press) {
            if (d.t - d.lastTap <= 18 && !d.cutCd && p.hp > 1.01) {
                const cost = Math.min(0.5, p.hp - 1);
                p.hp -= cost;
                bersGain(p, 12);
                p.bersBloodReady = true;
                d.cutCd = 60;
                d.cutBuff = 180;
                d.lastTap = -100;
                EvoBodyKit.flash(p, '#f43f5e');
            } else d.lastTap = d.t;
        }
        if (d.ult > 0) {
            d.ult--;
            p.bersBar = 100;
            if (EvoBodyKit.combo(p, '1+2+3+4')) p.skillCd = 0;
        }
    },
    skill(p) {
        p.evoPilot.roar = 240;
        bersSyncPv(p);
        EvoBodyKit.fx(p, 'bersHeartbeat', 240, { color: '#f43f5e' });
    },
    ultimateReady(p) {
        return p.hp <= p.maxHp * 0.5;
    },
    ultimate(p) {
        if (!p.bersHC) bersEnterHC(p);
        p.evoPilot.ult = 240;
        p.bersBar = 100;
        p.bersGrace = Math.max(p.bersGrace || 0, 240);
        if (EvoBodyKit.combo(p, '2+4')) {
            for (const f of bodyEffects)
                if (f instanceof BersArena && f.owner === p) f.active = false;
            bodyEffects.push(new BersArena(p, p.x + p.w / 2, 110, true));
        }
        EvoBodyKit.fx(p, 'bersHeartbeat', 240, { color: '#fb7185' });
    },
    dealt(p, e, amount) {
        EvoSystem.gain(p, 'damageDealt', Math.min(6, amount * 1.5));
        if (p.evoPilot.ult > 0 && amount > 0) {
            p.bersLockHp = Math.min(p.maxHp, (p.bersLockHp || p.hp) + 0.1);
            p.hp = Math.max(p.hp, p.bersLockHp);
        }
    },
    bot(p, e, aligned, inp, t) {
        if (EvoBodyKit.has(p, 3)) {
            const m = t % 180;
            if (p.bersHC || p.evoPilot.roar > 0 || p.hp <= p.maxHp * 0.5)
                inp.s = t % 100 < 65;
            else if (p.hp > p.maxHp * 0.65 && (p.bersBar || 0) < 90 && m < 12)
                inp.s = m < 2 || (m >= 8 && m < 10);
            else inp.s = aligned && t % 35 < 3;
        }
    },
});
(function () {
    const spray = bersSpray;
    bersSpray = function (p) {
        return (p.evoPilot && p.evoPilot.roar > 0) || spray(p);
    };
    const tier = bersTier;
    bersTier = function (p) {
        return p.evoPilot && p.evoPilot.roar > 0 ? 3 : tier(p);
    };
    const stats = bersStats;
    bersStats = function (p) {
        const s = stats(p);
        if (p.evoPilot && p.evoPilot.cutBuff > 0 && EvoBodyKit.combo(p, '1+3'))
            s.fr += 0.1;
        return s;
    };
    const hit = BulletHooks.registry.bers.hit;
    BulletHooks.registry.bers.hit = function (b, p, e) {
        const r = hit.apply(this, arguments);
        if (
            p.evoPilot &&
            p.evoPilot.ult > 0 &&
            b.isBersBlood &&
            e &&
            e.hp > 0 &&
            e.hp <= e.maxHp * 0.2
        )
            EvoBodyKit.hit(p, e, 0, 0.2);
        return r;
    };
})();
EvoBodyKit.effects.bersHeartbeat = {
    update(f, p) {
        f.x = p.x + p.w / 2;
        f.y = p.y + p.h / 2;
    },
    draw(f) {
        ctx.save();
        const k = 0.5 + 0.5 * Math.sin((f.maxLife - f.life) * 0.23);
        ctx.strokeStyle = f.color;
        ctx.lineWidth = 2 + k * 3;
        ctx.shadowBlur = 10 + k * 15;
        ctx.shadowColor = f.color;
        ctx.beginPath();
        ctx.arc(f.x, f.y, 25 + k * 12, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(244,63,94,.35)';
        ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
        ctx.restore();
    },
};
