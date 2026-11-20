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
            EvoBodyKit.fx(p, 'engVolley', 30, { x: t.x + t.w / 2, y: t.y + t.h / 2 });
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
            lan: EvoBodyKit.combo(p, '2+4'),
        });
        triggerScreenShake(6, 16);
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
        const e = f.maxLife - f.life, t = Date.now() / 1000, cx = f.x + 18, cy = f.y + 18, up = f.side === 1 ? -1 : 1;
        const build = EvoFx.clamp01(e / 30), a = Math.min(1, f.life / 12);
        ctx.save();
        ctx.globalAlpha = a;
        // 1) tay máy kéo 3 ụ về giữa + tia hàn
        if (build < 1) {
            for (const c of f.parts) {
                const sx = c.x + 10, sy = c.y + 10, k = EvoFx.ease(build), px = sx + (cx - sx) * k, py = sy + (cy - sy) * k;
                ctx.strokeStyle = 'rgba(103,232,249,.75)'; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.lineDashOffset = -t * 40;
                ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke(); ctx.setLineDash([]);
                ctx.fillStyle = '#0e7490'; ctx.strokeStyle = '#67e8f9';
                ctx.fillRect(px - 8, py - 8, 16, 16); ctx.strokeRect(px - 8, py - 8, 16, 16);
            }
            for (let i = 0; i < 8; i++) { // tia lửa hàn
                const ang = i * 0.785 + t * 9, d = 6 + ((i * 7 + Math.floor(t * 30)) % 14);
                ctx.fillStyle = i % 2 ? '#fde047' : '#e0f2fe';
                ctx.fillRect(cx + Math.cos(ang) * d - 1, cy + Math.sin(ang) * d - 1, 2.5, 2.5);
            }
        }
        // 2) vòng Mạng LAN (tổ hợp 2+4)
        if (f.lan) {
            ctx.strokeStyle = 'rgba(52,211,153,.55)'; ctx.lineWidth = 2; ctx.setLineDash([2, 6]); ctx.lineDashOffset = t * 20;
            ctx.beginPath(); ctx.arc(cx, cy, 70, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
        }
        ctx.translate(cx, cy);
        const sc = 0.4 + 0.6 * EvoFx.ease(build);
        ctx.scale(sc, sc);
        // 3) bệ lục giác + khung thép
        ctx.shadowColor = '#22d3ee'; ctx.shadowBlur = 16;
        const bg = ctx.createLinearGradient(0, -24, 0, 24);
        bg.addColorStop(0, '#155e75'); bg.addColorStop(1, '#082f49');
        ctx.fillStyle = bg; ctx.strokeStyle = '#67e8f9'; ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) { const ang = i * Math.PI / 3; ctx[i ? 'lineTo' : 'moveTo'](Math.cos(ang) * 26, Math.sin(ang) * 22); }
        ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(103,232,249,.5)'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(-26, 0); ctx.lineTo(26, 0); ctx.moveTo(-13, -22); ctx.lineTo(13, 22); ctx.moveTo(13, -22); ctx.lineTo(-13, 22); ctx.stroke();
        // 4) siêu pháo 3 nòng hướng về địch, giật lùi khi bắn
        const ph = (f.life % 36) / 36, recoil = ph > 0.8 ? (ph - 0.8) * 30 : 0;
        ctx.save(); ctx.scale(1, -up);
        for (const bx of [-10, 0, 10]) {
            const L = bx === 0 ? 34 : 28;
            const g = ctx.createLinearGradient(bx - 4, 0, bx + 4, 0);
            g.addColorStop(0, '#64748b'); g.addColorStop(0.5, '#e2e8f0'); g.addColorStop(1, '#475569');
            ctx.fillStyle = g; ctx.fillRect(bx - 3.5, -L + recoil * 0.4, 7, L - 6);
            ctx.fillStyle = '#22d3ee'; ctx.fillRect(bx - 4.5, -L + recoil * 0.4, 9, 3);
        }
        ctx.restore();
        // 5) lõi năng lượng tích dần tới phát kế tiếp
        const charge = 1 - ph;
        ctx.shadowColor = '#22d3ee'; ctx.shadowBlur = 18 * charge + 6;
        const cg = ctx.createRadialGradient(0, 0, 1, 0, 0, 11);
        cg.addColorStop(0, '#ffffff'); cg.addColorStop(0.5, '#67e8f9'); cg.addColorStop(1, 'rgba(14,116,144,0)');
        ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(0, 0, 8 + charge * 4, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        // radar xoay
        ctx.strokeStyle = 'rgba(103,232,249,.8)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(0, 0, 36, t * 3, t * 3 + 0.9); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, 36, t * 3 + Math.PI, t * 3 + Math.PI + 0.9); ctx.stroke();
        // vòng thời gian còn lại
        ctx.strokeStyle = '#facc15'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(0, 0, 42, -Math.PI / 2, -Math.PI / 2 + (f.life / f.maxLife) * Math.PI * 2); ctx.stroke();
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

// ===== Hình ảnh Evo 3/4 (chỉ vẽ) =====
EvoFx.theme('engineer', {
    c1: '#22d3ee', c2: '#facc15', dark: '#062530', slogan: 'Hợp thể siêu pháo · tay máy lắp ráp',
    sfx: [[0, 180, 'square', 0.08, 0.1], [90, 240, 'square', 0.08, 0.1], [180, 320, 'square', 0.08, 0.1], [300, 90, 'sawtooth', 0.5, 0.14]],
    need(p) { const n = engPilotTurrets(p).length; return `Cần 3 ụ · ${n}/3`; },
    icon(g, mode) {
        if (mode === 'ult') { // pháo đài 3 nòng
            g.beginPath(); g.moveTo(-11, 11); g.lineTo(-11, 0); g.lineTo(11, 0); g.lineTo(11, 11); g.closePath(); g.fill();
            for (const x of [-6, 0, 6]) g.fillRect(x - 2, -12, 4, 12);
            g.save(); g.fillStyle = '#062530'; g.beginPath(); g.arc(0, 5, 3, 0, Math.PI * 2); g.fill(); g.restore();
        } else { // 3 ụ khai hoả
            for (const [x, y] of [[-7, 4], [7, 4], [0, -4]]) {
                g.beginPath(); g.arc(x, y + 3, 4.2, 0, Math.PI * 2); g.fill();
                g.fillRect(x - 1.2, y - 6, 2.4, 6);
            }
            g.lineWidth = 1.6;
            for (const [x, y] of [[-7, -5], [7, -5], [0, -13]]) { g.beginPath(); g.moveTo(x - 3, y); g.lineTo(x, y - 3); g.lineTo(x + 3, y); g.stroke(); }
        }
    },
});
EvoFx.body('engineer', {
    over(p) {
        if (!EvoBodyKit.has(p, 3)) return;
        const t = Date.now() / 1000;
        for (const tr of engPilotTurrets(p)) {
            if (!tr.evoMounted) continue;
            // khung kẹp trên nóc + vòng từ trường, vẽ lại ụ lên trên xe
            const cx = tr.x + tr.w / 2, cy = tr.y + tr.h / 2;
            ctx.save();
            ctx.strokeStyle = '#67e8f9'; ctx.lineWidth = 2.5; ctx.shadowColor = '#22d3ee'; ctx.shadowBlur = 10;
            for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(cx + s * (tr.w / 2 + 6), cy - 8); ctx.lineTo(cx + s * (tr.w / 2 + 2), cy); ctx.lineTo(cx + s * (tr.w / 2 + 6), cy + 8); ctx.stroke(); }
            ctx.globalAlpha = 0.5 + 0.3 * Math.sin(t * 6);
            ctx.beginPath(); ctx.ellipse(cx, cy, tr.w / 2 + 9, (tr.h / 2 + 9) * 0.55, 0, 0, Math.PI * 2); ctx.stroke();
            ctx.restore();
            tr.draw();
        }
    },
});
EvoBodyKit.effects.engVolley = {
    draw(f) {
        const k = 1 - f.life / f.maxLife;
        ctx.save(); ctx.translate(f.x, f.y);
        ctx.globalAlpha = 1 - k;
        ctx.shadowColor = '#22d3ee'; ctx.shadowBlur = 14;
        ctx.strokeStyle = '#67e8f9'; ctx.lineWidth = 3 * (1 - k) + 1;
        ctx.beginPath(); ctx.arc(0, 0, 10 + k * 26, 0, Math.PI * 2); ctx.stroke();
        // dấu + hồi máu bay lên
        ctx.fillStyle = '#4ade80'; ctx.shadowColor = '#4ade80';
        const y = -14 - k * 22;
        ctx.fillRect(-2, y - 6, 4, 12); ctx.fillRect(-6, y - 2, 12, 4);
        ctx.restore();
    },
};
