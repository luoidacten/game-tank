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
                EvoBodyKit.flash(p, '#facc15');
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
            dir = p.x + p.w / 2 >= e.x + e.w / 2 ? 1 : -1;
        p.x = Math.max(0, Math.min(canvas.width - p.w, p.x + dir * 48));
        p.invincibleTimer = Math.max(p.invincibleTimer || 0, 15);
        p.opExc = Math.min(100, (p.opExc || 0) + 10);
        EvoBodyKit.flash(p, '#fef08a');
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
        });
    },
    bot(p, e, aligned, inp, t) {
        if (EvoBodyKit.has(p, 3)) inp.s = aligned && t % 40 < 2;
    },
});
EvoBodyKit.effects.punchSky = {
    draw(f) {
        ctx.save();
        const k = (f.maxLife - f.life) / f.maxLife;
        ctx.strokeStyle = '#fff7d6';
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 12;
        ctx.lineWidth = 2;
        for (let i = 0; i < 7; i++) {
            const y = (canvas.height * (i + 1)) / 8;
            ctx.beginPath();
            ctx.moveTo(0, y - 15 * k);
            ctx.lineTo(f.x - 20, y);
            ctx.moveTo(f.x + 20, y);
            ctx.lineTo(canvas.width, y + 15 * k);
            ctx.stroke();
        }
        ctx.restore();
    },
};
