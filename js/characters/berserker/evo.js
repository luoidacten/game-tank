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
                EvoBodyKit.fx(p, 'bersCut', 30, {});
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
        EvoBodyKit.fx(p, 'bersRoar', 240, { color: '#f43f5e' });
        triggerScreenShake(5, 14);
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
        triggerScreenShake(7, 18);
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
// nhịp tim "thình-thịch": 2 nhịp mỗi 0.8s
function bersEvoBeat(t) {
    const ph = (t % 0.8) / 0.8;
    return Math.max(Math.exp(-ph * 22), 0.7 * Math.exp(-Math.abs(ph - 0.22) * 22));
}
EvoBodyKit.effects.bersHeartbeat = {
    update(f, p) {
        f.x = p.x + p.w / 2;
        f.y = p.y + p.h / 2;
    },
    draw(f) {
        // màn đỏ đập theo nhịp tim + gân máu bò từ mép + hào quang lửa máu quanh xe
        const W = canvas.width, H = canvas.height, t = Date.now() / 1000, b = bersEvoBeat(t);
        const a = Math.min(1, f.life / 20) * Math.min(1, (f.maxLife - f.life) / 6);
        ctx.save();
        ctx.globalAlpha = a; ctx.globalCompositeOperation = 'source-over';
        const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.72);
        vg.addColorStop(0, 'rgba(127,29,29,0)'); vg.addColorStop(1, `rgba(190,18,60,${0.22 + 0.3 * b})`);
        ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = `rgba(225,29,72,${0.35 + 0.4 * b})`; ctx.lineCap = 'round';
        for (let i = 0; i < 10; i++) {
            const y = (i + 0.5) * H / 10, sx = i % 2 ? 0 : W, d = i % 2 ? 1 : -1, L = 26 + (i * 17) % 30 + b * 8;
            ctx.lineWidth = 2.5;
            ctx.beginPath(); ctx.moveTo(sx, y); ctx.quadraticCurveTo(sx + d * L * 0.5, y + 10, sx + d * L, y + ((i * 7) % 15) - 7); ctx.stroke();
            ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.moveTo(sx + d * L * 0.5, y + 6); ctx.lineTo(sx + d * L * 0.8, y + 18); ctx.stroke();
        }
        ctx.translate(f.x, f.y);
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 9; i++) {
            const ph = (t * 1.3 + i / 9) % 1, ang = i * 0.698 + Math.sin(t + i) * 0.2, r = 18 + ph * 26;
            ctx.globalAlpha = a * (1 - ph) * 0.8;
            ctx.fillStyle = i % 3 ? '#f43f5e' : '#fb923c';
            ctx.beginPath(); ctx.ellipse(Math.cos(ang) * r, Math.sin(ang) * r - ph * 10, 4 * (1 - ph) + 2, 7 * (1 - ph) + 2, ang, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = a; ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = f.color; ctx.shadowColor = '#e11d48'; ctx.shadowBlur = 10 + 16 * b; ctx.lineWidth = 2 + 3 * b;
        ctx.beginPath(); ctx.arc(0, 0, 28 + b * 10, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
    },
};
EvoBodyKit.effects.bersRoar = {
    update(f, p) {
        f.x = p.x + p.w / 2;
        f.y = p.y + p.h / 2;
        f.dir = EvoBodyKit.dir(p);
    },
    draw(f) {
        // Gào Thét: sóng âm dạng cung toả về phía địch + vòng đỏ mốc ≤25%
        const e = f.maxLife - f.life, t = Date.now() / 1000, a = Math.min(1, f.life / 20);
        ctx.save(); ctx.translate(f.x, f.y);
        ctx.globalAlpha = a;
        const base = (f.dir || -1) < 0 ? -Math.PI / 2 : Math.PI / 2;
        ctx.strokeStyle = '#fb7185'; ctx.shadowColor = '#f43f5e'; ctx.shadowBlur = 12; ctx.lineCap = 'round';
        for (let i = 0; i < 4; i++) {
            const ph = ((e / 24) + i / 4) % 1, r = 22 + ph * 90;
            ctx.globalAlpha = a * (1 - ph) * (e < 20 ? 1 : 0.6);
            ctx.lineWidth = 4 * (1 - ph) + 1;
            ctx.beginPath(); ctx.arc(0, 0, r, base - 0.7, base + 0.7); ctx.stroke();
        }
        ctx.globalAlpha = a;
        ctx.setLineDash([4, 5]); ctx.lineDashOffset = -t * 30; ctx.lineWidth = 2; ctx.strokeStyle = '#f43f5e';
        ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
        ctx.restore();
    },
};
EvoBodyKit.effects.bersCut = {
    update(f, p) { f.x = p.x + p.w / 2; f.y = p.y + p.h / 2; },
    draw(f) {
        // Tự Rạch: vết chém chéo đỏ + giọt máu bắn
        const k = 1 - f.life / f.maxLife, sl = EvoFx.ease(Math.min(1, k * 4));
        ctx.save(); ctx.translate(f.x, f.y);
        ctx.globalAlpha = 1 - k * 0.8;
        ctx.strokeStyle = '#fff1f2'; ctx.shadowColor = '#e11d48'; ctx.shadowBlur = 14; ctx.lineCap = 'round';
        ctx.lineWidth = 4 * (1 - k) + 1;
        ctx.beginPath(); ctx.moveTo(-20, -20); ctx.lineTo(-20 + 40 * sl, -20 + 40 * sl); ctx.stroke();
        ctx.strokeStyle = '#e11d48'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-17, -22); ctx.lineTo(-17 + 40 * sl, -22 + 40 * sl); ctx.stroke();
        ctx.fillStyle = '#be123c'; ctx.shadowBlur = 0;
        for (let i = 0; i < 8; i++) {
            const ang = i * 0.78 + 0.4, d = 10 + k * (24 + (i * 7) % 14);
            ctx.beginPath(); ctx.arc(Math.cos(ang) * d, Math.sin(ang) * d + k * k * 16, 2.6 * (1 - k) + 0.8, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    },
};
// ===== Hình ảnh Evo 3/4 (chỉ vẽ) =====
EvoFx.theme('berserker', {
    c1: '#f43f5e', c2: '#fb923c', dark: '#2a050b', slogan: 'Máu đổi máu · không đường lui',
    sfx: [[0, 82, 'sawtooth', 0.7, 0.2], [0, 123, 'sawtooth', 0.6, 0.12], [140, 61, 'square', 0.6, 0.12]],
    need() { return 'Cần HP ≤ 50%'; },
    icon(g, mode) {
        if (mode === 'ult') { // giọt máu có nanh
            g.beginPath(); g.moveTo(0, -13); g.bezierCurveTo(7, -4, 10, 2, 10, 5); g.arc(0, 5, 10, 0, Math.PI); g.bezierCurveTo(-10, 2, -7, -4, 0, -13); g.fill();
            g.save(); g.fillStyle = '#2a050b';
            g.beginPath(); g.moveTo(-5, 3); g.lineTo(-3, 9); g.lineTo(-1, 3); g.fill();
            g.beginPath(); g.moveTo(1, 3); g.lineTo(3, 9); g.lineTo(5, 3); g.fill();
            g.restore();
        } else { // miệng gào + sóng âm
            g.beginPath(); g.ellipse(-3, 0, 5, 7, 0, 0, Math.PI * 2); g.fill();
            g.lineWidth = 2;
            for (const r of [7, 11, 15]) { g.beginPath(); g.arc(-3, 0, r, -0.7, 0.7); g.stroke(); }
        }
    },
});
EvoFx.body('berserker', {
    over(p) {
        const d = p.evoPilot;
        if (!d || !EvoBodyKit.has(p, 3) || !(d.cutBuff > 0)) return;
        // máu nhỏ giọt khi đang hưởng Tự Rạch
        const t = Date.now() / 1000, a = Math.min(1, d.cutBuff / 30);
        ctx.fillStyle = '#e11d48'; ctx.globalAlpha = a;
        for (let i = 0; i < 4; i++) {
            const ph = (t * 1.5 + i / 4) % 1, x = p.x + p.w * (0.2 + 0.2 * i);
            ctx.beginPath(); ctx.ellipse(x, p.y + p.h * 0.6 + ph * 16, 1.6, 2.6, 0, 0, Math.PI * 2); ctx.fill();
        }
        ctx.strokeStyle = '#fb7185'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(p.x + 3, p.y + 3); ctx.lineTo(p.x + p.w - 3, p.y + p.h - 3); ctx.stroke();
    },
});
