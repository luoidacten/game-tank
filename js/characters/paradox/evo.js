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
        if (p.paradoxAnchor) {
            p.paradoxRewind(false);
            EvoBodyKit.fx(p, 'pdxClock', 42, { rev: true });
        } else {
            p.paradoxAnchor = {
                x: p.x,
                y: p.y,
                hp: p.hp,
                ammo: p.ammo,
                timer: 600,
            };
            EvoBodyKit.fx(p, 'pdxClock', 42, { rev: false });
        }
    },
    ultimate(p) {
        const d = p.evoPilot,
            e = EvoBodyKit.enemy(p),
            past = d.enemyHistory[0],
            from = { x: e.x + e.w / 2, y: e.y + e.h / 2 };
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
        EvoBodyKit.fx(p, 'pdxRewind', 72, {
            fromX: from.x, fromY: from.y, toX: e.x + e.w / 2, toY: e.y + e.h / 2, ew: e.w, eh: e.h,
            ghosts: shots.slice(-16).map((sh) => [Math.round(sh.x + (sh.w || 5) / 2), Math.round(sh.y + (sh.h || 5) / 2)]),
        });
        triggerScreenShake(5, 12);
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
            EvoBodyKit.fx(e, 'pdxMark', 26, { n: p.evoPilot.marks });
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
        // các phát đạn cũ hiện lại: ấn tím co về điểm bắn rồi bật ra
        const k = 1 - f.life / f.maxLife;
        ctx.save();
        ctx.shadowColor = '#c084fc'; ctx.shadowBlur = 12;
        for (const s of f.shots) {
            const cx = s.x + (s.w || 5) / 2, cy = s.y + (s.h || 5) / 2, r = 16 - k * 10;
            ctx.strokeStyle = '#e9d5ff'; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.4 + 0.6 * k;
            ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
            ctx.fillStyle = '#c084fc';
            ctx.beginPath(); ctx.moveTo(cx, cy - 5); ctx.lineTo(cx + 4, cy); ctx.lineTo(cx, cy + 5); ctx.lineTo(cx - 4, cy); ctx.closePath(); ctx.fill();
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

// ===== Hình ảnh Evo 3/4 (chỉ vẽ) =====
function pdxEvoHourglass(g, s) {
    g.beginPath(); g.moveTo(-7 * s, -11 * s); g.lineTo(7 * s, -11 * s); g.lineTo(1.2 * s, 0); g.lineTo(7 * s, 11 * s); g.lineTo(-7 * s, 11 * s); g.lineTo(-1.2 * s, 0); g.closePath();
}
EvoFx.theme('paradox', {
    c1: '#a78bfa', c2: '#f0abfc', dark: '#170b30', slogan: 'Thời gian quay ngược · ◀◀ REWIND',
    sfx: [[0, 1046, 'sine', 0.12, 0.09], [90, 784, 'sine', 0.12, 0.09], [180, 523, 'sine', 0.12, 0.09], [270, 392, 'triangle', 0.35, 0.1]],
    icon(g, mode) {
        if (mode === 'ult') { // đồng hồ cát + mũi tên vòng ngược
            g.lineWidth = 2; pdxEvoHourglass(g, 0.75); g.stroke();
            g.save(); g.globalAlpha *= 0.8; g.beginPath(); g.moveTo(-3.5, 8); g.lineTo(3.5, 8); g.lineTo(0, 3); g.closePath(); g.fill(); g.restore();
            g.beginPath(); g.arc(0, 0, 12, -2.6, 1.6); g.stroke();
            g.beginPath(); g.moveTo(-10.3, -6.2); g.lineTo(-12.5, -1); g.lineTo(-7, -2.5); g.closePath(); g.fill();
        } else { // mỏ neo thời không
            g.lineWidth = 2.3;
            g.beginPath(); g.arc(0, -9, 2.6, 0, Math.PI * 2); g.stroke();
            g.beginPath(); g.moveTo(0, -6.4); g.lineTo(0, 10); g.moveTo(-5, -3); g.lineTo(5, -3); g.stroke();
            g.beginPath(); g.arc(0, 2, 9, 0.25, Math.PI - 0.25); g.stroke();
            g.beginPath(); g.moveTo(-10, 2); g.lineTo(-8, 6); g.lineTo(-6, 2); g.moveTo(10, 2); g.lineTo(8, 6); g.lineTo(6, 2); g.stroke();
        }
    },
});
EvoFx.body('paradox', {
    over(p) {
        // Dấu Nhân Quả: tối đa 4 ấn kim đồng hồ quay quanh địch
        const d = p.evoPilot;
        if (!d || !EvoBodyKit.has(p, 3) || !(d.marks > 0)) return;
        const e = EvoBodyKit.enemy(p), t = Date.now() / 1000, cx = e.x + e.w / 2, cy = e.y + e.h / 2, R = Math.max(e.w, e.h) * 0.5 + 14;
        ctx.strokeStyle = 'rgba(196,181,253,.35)'; ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
        for (let i = 0; i < d.marks; i++) {
            const a = -t * 1.4 + i * Math.PI / 2, x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
            ctx.save(); ctx.translate(x, y); ctx.rotate(a);
            ctx.shadowColor = '#c084fc'; ctx.shadowBlur = 10;
            ctx.fillStyle = d.marks >= 4 ? '#f0abfc' : '#a78bfa';
            ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(4, 0); ctx.lineTo(0, 6); ctx.lineTo(-4, 0); ctx.closePath(); ctx.fill();
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -3.5); ctx.moveTo(0, 0); ctx.lineTo(2.5, 0); ctx.stroke();
            ctx.restore();
        }
    },
});
EvoBodyKit.effects.pdxClock = {
    update(f, p) { f.x = p.x + p.w / 2; f.y = p.y + p.h / 2; },
    draw(f) {
        const k = 1 - f.life / f.maxLife, r = 26 + EvoFx.ease(k) * 14, dir = f.rev ? -1 : 1;
        ctx.save(); ctx.translate(f.x, f.y);
        ctx.globalAlpha = Math.min(1, f.life / 12);
        ctx.shadowColor = '#a78bfa'; ctx.shadowBlur = 14;
        ctx.strokeStyle = '#c4b5fd'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; ctx.beginPath(); ctx.moveTo(Math.cos(a) * (r - 5), Math.sin(a) * (r - 5)); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); ctx.stroke(); }
        ctx.strokeStyle = '#f0abfc'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
        const h = dir * k * Math.PI * 4 - Math.PI / 2, m = dir * k * Math.PI * 12 - Math.PI / 2;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(h) * r * 0.5, Math.sin(h) * r * 0.5); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(m) * r * 0.8, Math.sin(m) * r * 0.8); ctx.stroke();
        // mũi tên chạy vòng (ngược khi Quy Neo)
        ctx.fillStyle = '#e9d5ff';
        for (let i = 0; i < 3; i++) {
            const a = dir * (k * 5 + i * 2.094);
            ctx.save(); ctx.rotate(a); ctx.translate(r + 7, 0); ctx.rotate(dir * Math.PI / 2);
            ctx.beginPath(); ctx.moveTo(5, 0); ctx.lineTo(-3, -4); ctx.lineTo(-3, 4); ctx.closePath(); ctx.fill();
            ctx.restore();
        }
        ctx.restore();
    },
};
EvoBodyKit.effects.pdxMark = {
    draw(f) {
        const k = 1 - f.life / f.maxLife;
        ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(k * 2);
        ctx.globalAlpha = 1 - k;
        ctx.strokeStyle = '#e9d5ff'; ctx.shadowColor = '#c084fc'; ctx.shadowBlur = 12; ctx.lineWidth = 2;
        const r = 10 + k * 22;
        ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(r, 0); ctx.lineTo(0, r); ctx.lineTo(-r, 0); ctx.closePath(); ctx.stroke();
        ctx.restore();
    },
};
EvoBodyKit.effects.pdxRewind = {
    draw(f) {
        const W = canvas.width, H = canvas.height, k = 1 - f.life / f.maxLife, t = Date.now() / 1000;
        const a = Math.min(1, f.life / 18) * Math.min(1, (f.maxLife - f.life + 2) / 4);
        ctx.save();
        // 1) màn tua ngược kiểu VHS: dải nhiễu tím/xanh lệch màu trôi ngược lên
        ctx.globalAlpha = a * 0.55;
        for (let i = 0; i < 7; i++) {
            const y = ((i * 97 - t * 900) % (H + 40) + H + 40) % (H + 40) - 20, h = 3 + (i * 5) % 9;
            ctx.fillStyle = 'rgba(240,171,252,.45)'; ctx.fillRect(0, y, W, h);
            ctx.fillStyle = 'rgba(103,232,249,.35)'; ctx.fillRect(4, y + h, W, 2);
        }
        ctx.globalAlpha = a * 0.18; ctx.fillStyle = '#a78bfa';
        for (let y = (t * 120) % 4; y < H; y += 4) ctx.fillRect(0, y, W, 1);
        ctx.globalAlpha = a;
        // 2) vệt kéo địch về quá khứ: bóng mờ dọc đường đi
        const dx = f.toX - f.fromX, dy = f.toY - f.fromY;
        if (Math.hypot(dx, dy) > 4) {
            ctx.strokeStyle = '#f0abfc'; ctx.lineWidth = 2; ctx.setLineDash([6, 6]); ctx.lineDashOffset = t * 60;
            ctx.shadowColor = '#c084fc'; ctx.shadowBlur = 10;
            ctx.beginPath(); ctx.moveTo(f.fromX, f.fromY); ctx.lineTo(f.toX, f.toY); ctx.stroke(); ctx.setLineDash([]);
            for (let i = 0; i <= 4; i++) {
                const q = i / 4, gx = f.fromX + dx * q, gy = f.fromY + dy * q;
                ctx.globalAlpha = a * (0.15 + 0.5 * q);
                ctx.strokeStyle = i === 4 ? '#ffffff' : '#c4b5fd'; ctx.lineWidth = 2;
                ctx.strokeRect(gx - f.ew / 2 - 3, gy - f.eh / 2 - 3, f.ew + 6, f.eh + 6);
                ctx.fillStyle = 'rgba(167,139,250,.18)'; ctx.fillRect(gx - f.ew / 2, gy - f.eh / 2, f.ew, f.eh);
            }
            ctx.globalAlpha = a;
        }
        // 3) đồng hồ cát lật ngược ở vị trí địch bị kéo về
        ctx.save(); ctx.translate(f.toX + f.ew + 14, f.toY + (f.toY < H / 2 ? 1 : -1) * (f.eh / 2 + 18));
        ctx.rotate(Math.PI * EvoFx.ease(Math.min(1, k * 3)));
        ctx.strokeStyle = '#f0abfc'; ctx.fillStyle = 'rgba(240,171,252,.35)'; ctx.lineWidth = 2; ctx.shadowColor = '#f0abfc'; ctx.shadowBlur = 12;
        pdxEvoHourglass(ctx, 1); ctx.fill(); ctx.stroke();
        ctx.restore();
        // 4) ấn các phát đạn sẽ tái hiện
        ctx.fillStyle = '#e9d5ff'; ctx.shadowColor = '#c084fc'; ctx.shadowBlur = 8;
        for (const [x, y] of f.ghosts || []) {
            ctx.globalAlpha = a * (0.5 + 0.5 * Math.sin(t * 12 + x));
            ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    },
};
