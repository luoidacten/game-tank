// Body mẫu từ #1: thêm tổ hợp 3+4 và hành vi giữ/nhả có chủ đích cho bot thí điểm.
if (FEATURE_EVO34) {
    EvoBodyKit.bodies.big_bullet = {
        balance: {
            '1+2': { damage: 0.55, taken: 1.2 },
            '2+3': { damage: 0.95 },
            '2+4': { damage: 0.4, taken: 1.5 },
        },
        bot(p, enemy, aligned, inp, t) {
            if (EvoBodyKit.has(p, 3)) inp.s = t % 100 < 65;
        },
    };
    const bigPilotShoot = bigHoldShoot;
    bigHoldShoot = function (p, inp, now) {
        const held = p.bigHeld;
        const result = bigPilotShoot(p, inp, now);
        if (
            held &&
            !inp.s &&
            !p.bigHeld &&
            !(p.silenceTimer > 0) &&
            EvoBodyKit.combo(p, '3+4') &&
            held.eaten > 0
        ) {
            p.skillCd = Math.max(
                0,
                (p.skillCd || 0) - Math.min(90, held.eaten * 30),
            );
            EvoBodyKit.flash(p, '#fbbf24');
        }
        return result;
    };
}
