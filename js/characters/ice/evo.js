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
        EvoBodyKit.fx(e, 'iceShatter', 40, { freeze: true });
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
        // mũi giáo băng pha lê + vệt sương
        const cx = b.x + b.w / 2, cy = b.y + b.h / 2, dir = b.vy < 0 ? -1 : 1, L = b.h * 0.9, W = b.w * 0.75;
        ctx.save();
        ctx.translate(cx, cy);
        if (dir > 0) ctx.rotate(Math.PI);
        const tg = ctx.createLinearGradient(0, 0, 0, 46);
        tg.addColorStop(0, 'rgba(165,243,252,.55)'); tg.addColorStop(1, 'rgba(165,243,252,0)');
        ctx.fillStyle = tg;
        ctx.beginPath(); ctx.moveTo(-W, 2); ctx.lineTo(W, 2); ctx.lineTo(0, 46); ctx.closePath(); ctx.fill();
        ctx.shadowColor = '#38bdf8'; ctx.shadowBlur = 14;
        const g = ctx.createLinearGradient(-W, 0, W, 0);
        g.addColorStop(0, '#0ea5e9'); g.addColorStop(0.5, '#f0fdff'); g.addColorStop(1, '#67e8f9');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.moveTo(0, -L); ctx.lineTo(W, -L * 0.15); ctx.lineTo(W * 0.55, L * 0.6); ctx.lineTo(-W * 0.55, L * 0.6); ctx.lineTo(-W, -L * 0.15); ctx.closePath(); ctx.fill();
        ctx.shadowBlur = 0; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, -L); ctx.lineTo(0, L * 0.6); ctx.stroke();
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
        // làn băng trơn: mặt kính lạnh, viền tinh thể, vệt bóng loáng chạy dọc
        const H = canvas.height, w = f.width, x0 = f.x - w / 2, t = Date.now() / 1000;
        const a = Math.min(1, f.life / 30) * Math.min(1, (f.maxLife - f.life) / 8);
        ctx.save();
        ctx.globalAlpha = a;
        const g = ctx.createLinearGradient(x0, 0, x0 + w, 0);
        g.addColorStop(0, 'rgba(56,189,248,0)'); g.addColorStop(0.18, 'rgba(125,211,252,.28)');
        g.addColorStop(0.5, 'rgba(224,242,254,.20)'); g.addColorStop(0.82, 'rgba(125,211,252,.28)'); g.addColorStop(1, 'rgba(56,189,248,0)');
        ctx.fillStyle = g; ctx.fillRect(x0, 0, w, H);
        ctx.strokeStyle = 'rgba(165,243,252,.7)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(x0 + 3, 0); ctx.lineTo(x0 + 3, H); ctx.moveTo(x0 + w - 3, 0); ctx.lineTo(x0 + w - 3, H); ctx.stroke();
        // gai tinh thể hai mép
        ctx.fillStyle = 'rgba(224,242,254,.75)';
        for (let y = 10, i = 0; y < H; y += 26, i++) {
            const s = 5 + (i * 7) % 6;
            for (const [ex, sx] of [[x0 + 3, 1], [x0 + w - 3, -1]]) {
                ctx.beginPath(); ctx.moveTo(ex, y - 4); ctx.lineTo(ex + sx * s, y + (i % 2 ? 2 : -2)); ctx.lineTo(ex, y + 4); ctx.closePath(); ctx.fill();
            }
        }
        // vệt sáng loáng chéo trôi dọc
        ctx.save(); ctx.beginPath(); ctx.rect(x0, 0, w, H); ctx.clip();
        ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 3;
        for (let k = 0; k < 4; k++) {
            const y = ((t * 120 + k * H / 4) % (H + 60)) - 30;
            ctx.beginPath(); ctx.moveTo(x0, y + 18); ctx.lineTo(x0 + w, y - 18); ctx.stroke();
        }
        ctx.restore();
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
            EvoBodyKit.fx(e, 'iceShatter', 44, { freeze: false });
            triggerScreenShake(7, 14);
        }
    },
    draw(f) {
        const W = canvas.width, H = canvas.height, k = 1 - f.life / f.maxLife, t = Date.now() / 1000;
        const grow = EvoFx.ease(Math.min(1, k * 3)), a = Math.min(1, f.life / 10);
        ctx.save();
        ctx.globalAlpha = a;
        // 1) sương lạnh + tinh thể bò từ hai mép màn vào
        const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.25, W / 2, H / 2, Math.max(W, H) * 0.75);
        vg.addColorStop(0, 'rgba(224,242,254,0)'); vg.addColorStop(1, `rgba(186,230,253,${0.38 * grow})`);
        ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(224,242,254,.8)'; ctx.strokeStyle = 'rgba(56,189,248,.9)'; ctx.lineWidth = 1;
        for (let i = 0; i < 18; i++) {
            const y = (i + 0.5) * H / 18, len = grow * (20 + ((i * 37) % 45)), side = i % 2 ? 0 : W, sx = side ? -1 : 1;
            ctx.beginPath(); ctx.moveTo(side, y - 7); ctx.lineTo(side + sx * len, y + ((i * 13) % 9) - 4); ctx.lineTo(side, y + 7); ctx.closePath(); ctx.fill(); ctx.stroke();
            const side2 = W - side;
            ctx.beginPath(); ctx.moveTo(side2, y + 3); ctx.lineTo(side2 - sx * len * 0.6, y + 10); ctx.lineTo(side2, y + 14); ctx.closePath(); ctx.fill(); ctx.stroke();
        }
        // 2) trận đồ bông tuyết dưới địch
        ctx.translate(f.x, f.y);
        ctx.save(); ctx.rotate(t * 0.8);
        ctx.strokeStyle = 'rgba(165,243,252,.75)'; ctx.lineWidth = 2; ctx.shadowColor = '#38bdf8'; ctx.shadowBlur = 12;
        const R = 34 + grow * 14;
        ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.stroke();
        for (let i = 0; i < 6; i++) {
            const ang = i * Math.PI / 3;
            ctx.save(); ctx.rotate(ang);
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(R, 0); ctx.moveTo(R * 0.6, 0); ctx.lineTo(R * 0.75, -7); ctx.moveTo(R * 0.6, 0); ctx.lineTo(R * 0.75, 7); ctx.stroke();
            ctx.restore();
        }
        ctx.restore();
        // 3) khối băng bọc địch, vết nứt lan dần
        const s = 24 + grow * 4;
        ctx.shadowColor = '#bae6fd'; ctx.shadowBlur = 16;
        const ig = ctx.createLinearGradient(-s, -s, s, s);
        ig.addColorStop(0, 'rgba(240,253,255,.55)'); ig.addColorStop(0.5, 'rgba(125,211,252,.30)'); ig.addColorStop(1, 'rgba(14,165,233,.45)');
        ctx.fillStyle = ig;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) { const ang = i * Math.PI / 3 + Math.PI / 6; ctx[i ? 'lineTo' : 'moveTo'](Math.cos(ang) * s, Math.sin(ang) * s * 1.05); }
        ctx.closePath(); ctx.fill();
        ctx.shadowBlur = 0; ctx.strokeStyle = '#f0f9ff'; ctx.lineWidth = 2; ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(-s * 0.5, -s * 0.6); ctx.lineTo(-s * 0.1, -s * 0.75); ctx.stroke();
        const cracks = Math.floor(k * 7);
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.2;
        for (let i = 0; i < cracks; i++) {
            const ang = i * 2.1 + 0.4;
            ctx.beginPath(); ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(ang) * s * 0.45, Math.sin(ang) * s * 0.45 + 3);
            ctx.lineTo(Math.cos(ang + 0.3) * s * 0.95, Math.sin(ang + 0.3) * s * 0.95);
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

// ===== Hình ảnh Evo 3/4 (chỉ vẽ) =====
function iceEvoFlake(g, r, arms) {
    for (let i = 0; i < arms; i++) {
        g.save(); g.rotate(i * Math.PI * 2 / arms);
        g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -r);
        g.moveTo(0, -r * 0.55); g.lineTo(-r * 0.28, -r * 0.8); g.moveTo(0, -r * 0.55); g.lineTo(r * 0.28, -r * 0.8);
        g.stroke(); g.restore();
    }
}
EvoFx.theme('ice', {
    c1: '#67e8f9', c2: '#e0f2fe', dark: '#06222e', slogan: 'Độ không tuyệt đối · −273°C',
    sfx: [[0, 2093, 'triangle', 0.08, 0.1], [60, 1568, 'triangle', 0.1, 0.09], [130, 3136, 'sine', 0.12, 0.06], [260, 2637, 'triangle', 0.25, 0.06]],
    icon(g, mode) {
        if (mode === 'ult') { // cụm tinh thể
            g.beginPath(); g.moveTo(0, -13); g.lineTo(5, -3); g.lineTo(3, 11); g.lineTo(-3, 11); g.lineTo(-5, -3); g.closePath(); g.fill();
            g.save(); g.globalAlpha *= 0.75;
            g.beginPath(); g.moveTo(-10, -5); g.lineTo(-5, 2); g.lineTo(-6, 11); g.lineTo(-11, 9); g.closePath(); g.fill();
            g.beginPath(); g.moveTo(10, -6); g.lineTo(11, 9); g.lineTo(6, 11); g.lineTo(5, 1); g.closePath(); g.fill();
            g.restore();
        } else { g.lineWidth = 2.2; iceEvoFlake(g, 11, 6); }
    },
});
EvoFx.body('ice', {
    over(p) {
        const d = p.evoPilot;
        // Evo 3: tụ hơi thở băng khi giữ Bắn (đầy sau 1s)
        if (!d || !EvoBodyKit.has(p, 3) || !(d.hold > 0)) return;
        const k = Math.min(1, d.hold / 60), cx = p.x + p.w / 2, cy = p.id === 1 ? p.y - 8 : p.y + p.h + 8, t = Date.now() / 1000;
        ctx.translate(cx, cy);
        ctx.shadowColor = '#67e8f9'; ctx.shadowBlur = 12;
        ctx.strokeStyle = k >= 1 ? '#f0f9ff' : '#67e8f9'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(0, 0, 13, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2); ctx.stroke();
        ctx.rotate(t * (k >= 1 ? 4 : 1.5)); ctx.lineWidth = 1.6; ctx.strokeStyle = '#e0f2fe';
        ctx.globalAlpha = 0.5 + 0.5 * k;
        iceEvoFlake(ctx, 4 + 5 * k, 6);
        ctx.fillStyle = '#e0f2fe';
        for (let i = 0; i < 6; i++) { const ph = (t * 1.6 + i / 6) % 1, ang = i * 1.05; ctx.globalAlpha = ph; ctx.fillRect(Math.cos(ang) * (26 - ph * 18) - 1, Math.sin(ang) * (26 - ph * 18) - 1, 2.2, 2.2); }
    },
});
EvoBodyKit.effects.iceShatter = {
    draw(f) {
        const k = 1 - f.life / f.maxLife;
        ctx.save(); ctx.translate(f.x, f.y);
        ctx.globalAlpha = Math.min(1, f.life / 12);
        ctx.shadowColor = '#67e8f9'; ctx.shadowBlur = 14;
        if (f.freeze) { // khoá băng: vòng co lại + khối băng
            const r = 60 - EvoFx.ease(Math.min(1, k * 2.5)) * 36;
            ctx.strokeStyle = '#a5f3fc'; ctx.lineWidth = 3;
            ctx.beginPath(); for (let i = 0; i <= 6; i++) { const a = i * Math.PI / 3 + Math.PI / 6; ctx[i ? 'lineTo' : 'moveTo'](Math.cos(a) * r, Math.sin(a) * r); } ctx.stroke();
            ctx.fillStyle = 'rgba(186,230,253,.25)'; ctx.fill();
        }
        // mảnh băng văng
        for (let i = 0; i < 12; i++) {
            const a = i * 0.5236 + 0.2, d = (f.freeze ? 20 : 12) + EvoFx.ease(k) * (f.freeze ? 26 : 64);
            ctx.save(); ctx.translate(Math.cos(a) * d, Math.sin(a) * d); ctx.rotate(a + k * 4);
            ctx.fillStyle = i % 3 ? '#e0f2fe' : '#67e8f9';
            ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(3, 0); ctx.lineTo(0, 6); ctx.lineTo(-3, 0); ctx.closePath(); ctx.fill();
            ctx.restore();
        }
        if (!f.freeze && k < 0.35) { // chớp vỡ
            ctx.globalAlpha = 1 - k / 0.35; ctx.fillStyle = '#f0f9ff';
            ctx.beginPath(); ctx.arc(0, 0, 30 + k * 60, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    },
};
