// Cần Lái Thủy Lực: dùng cùng trạng thái húc/hồi vị cũ, tránh hai vòng mô phỏng song song.
EvoBodyKit.register('tank', {
    balance: {
        '1+2': { hp: 0.4, damage: 0.4, taken: 3 },
        '1+3': { damage: 0.5, taken: 3 },
        '1+4': { hp: 0.6, damage: 0.3, taken: 3 },
        '2+3': { damage: 0.8, taken: 1.3 },
        '2+4': { damage: 0.65, taken: 1.4 },
    },
    setup(p) {
        p.evoPilot.hold = 0;
        p.evoPilot.ult = 0;
        if (EvoBodyKit.has(p, 3)) p.maxHp = Math.max(2, p.maxHp - 3.5);
    },
    update(p, inp) {
        const d = p.evoPilot;
        if (EvoBodyKit.has(p, 3) && p.dashState === 1 && !d.ult) {
            d.hold++;
            const turning = (inp.r ? 1 : 0) - (inp.l ? 1 : 0);
            p.x = Math.max(
                0,
                Math.min(
                    canvas.width - p.w,
                    p.x +
                        turning *
                            p.speed *
                            (EvoBodyKit.combo(p, '1+3') ? 1 : 0.7),
                ),
            );
            if (!inp.s || d.hold >= 90) p.dashState = 2;
        }
        if (d.ult > 0) {
            if (--d.ult === 0) {
                p.dashState = 2;
                return;
            }
            const e = EvoBodyKit.enemy(p);
            if (
                !d.hit &&
                rectIntersect(
                    p.x - 8,
                    p.y - 8,
                    p.w + 16,
                    p.h + 16,
                    e.x,
                    e.y,
                    e.w,
                    e.h,
                )
            ) {
                d.hit = true;
                EvoBodyKit.hit(p, e, 2.5, 0.2);
                e.freezeTimer = e.weapon === 'juggernaut' ? 0 : 60;
                e.x = p.x < canvas.width / 2 ? 0 : canvas.width - e.w;
            }
            e.bullets = e.bullets.filter(
                (b) =>
                    !rectIntersect(
                        p.x - 12,
                        p.y - 12,
                        p.w + 24,
                        p.h + 24,
                        b.x,
                        b.y,
                        b.w,
                        b.h,
                    ),
            );
            if (d.ult % 8 === 0) EvoBodyKit.flash(p, '#fbbf24');
            if (EvoBodyKit.combo(p, '1+2+3+4') && d.ult % 30 === 0)
                for (const offset of [-28, 28])
                    iceZones.push(
                        new IceZone(p.x + p.w / 2 + offset, p.y, 35, 120, p),
                    );
        }
    },
    shoot(p, inp) {
        if (!EvoBodyKit.has(p, 3)) return false;
        if (
            inp.s &&
            p.dashState === 0 &&
            !(p.tankDashCooldown > 0) &&
            !groundedBlock(p)
        ) {
            p.dashState = 1;
            p.dashStartY = p.y;
            p.tankDashHitEnemy = false;
            p.evoPilot.hold = 0;
        }
        return true;
    },
    skill(p) {
        p.shield++;
        p.passiveShieldTimer = 0;
        const e = EvoBodyKit.enemy(p),
            x = p.x + p.w / 2,
            y = p.y + p.h / 2;
        for (const b of e.bullets)
            if (Math.hypot(b.x - x, b.y - y) < 100) {
                b.vx += Math.sign(b.x - x || 1) * 5;
                b.vy *= -0.5;
            }
        if (EvoBodyKit.combo(p, '2+4'))
            iceZones.push(new IceZone(x, y, 70, 120, p));
        EvoBodyKit.flash(p, '#fbbf24');
    },
    ultimate(p) {
        if (groundedBlock(p)) return false;
        const d = p.evoPilot;
        d.ult = 180;
        d.hit = false;
        p.dashState = 1;
        p.dashStartY = p.y;
        p.tankDashHitEnemy = true;
        EvoBodyKit.flash(p, '#f97316');
    },
    dealt(p) {
        if (p.dashState === 1) EvoSystem.gain(p, 'ram', 12);
    },
    damaged(p, amount) {
        if (p.dashState === 1)
            EvoSystem.gain(p, 'ramDamage', Math.min(18, amount * 16));
    },
    bot(p, e, aligned, inp, t) {
        if (EvoBodyKit.has(p, 3)) inp.s = aligned && t % 110 < 90;
    },
});
// Xe Ủi cần vượt giữa sân: không bật lùi sớm khi chạm địch/công trình trong thời gian Ultimate.
(function () {
    const update = Player.prototype.updateTank;
    Player.prototype.updateTank = function () {
        if (this.weapon === 'tank' && this.evoPilot && this.evoPilot.ult > 0) {
            this.y += EvoBodyKit.dir(this) * Math.max(3, canvas.height / 120);
            this.y = Math.max(0, Math.min(canvas.height - this.h, this.y));
            for (const a of [
                turrets,
                creatorTurrets,
                creatorDrones,
                creatorRobots,
                necroMinions,
                sniperWalls,
                bastions,
            ])
                for (const o of a)
                    if (
                        o.active &&
                        o.owner !== this &&
                        rectIntersect(
                            this.x,
                            this.y,
                            this.w,
                            this.h,
                            o.x,
                            o.y,
                            o.w,
                            o.h,
                        )
                    ) {
                        if (o.takeHit) o.takeHit(1, this);
                        else if (typeof o.hp === 'number') o.hp -= 1;
                    }
            return true;
        }
        return update.apply(this, arguments);
    };
})();
