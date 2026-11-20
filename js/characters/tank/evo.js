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
            if (d.ult % 8 === 0) EvoBodyKit.fx(p, 'tankDust', 30, { side: p.id });
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
        EvoBodyKit.fx(p, 'tankBurst', 34, { ice: EvoBodyKit.combo(p, '2+4') });
        triggerScreenShake(4, 8);
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
        triggerScreenShake(8, 18);
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

// ===== Hình ảnh Evo 3/4 (chỉ vẽ) =====
EvoFx.theme('tank', {
    c1: '#fbbf24', c2: '#f97316', dark: '#1f1405', slogan: 'Ủi sạch mọi chướng ngại',
    sfx: [[0, 110, 'sawtooth', 0.7, 0.14], [0, 139, 'sawtooth', 0.7, 0.12], [0, 165, 'square', 0.6, 0.05]],
    icon(g, mode) {
        if (mode === 'ult') { // lưỡi ủi + bánh xích
            g.beginPath(); g.moveTo(-12, -9); g.lineTo(12, -9); g.lineTo(9, -3); g.lineTo(-9, -3); g.closePath(); g.fill();
            g.save(); g.fillStyle = '#1f1405';
            for (let i = -9; i < 10; i += 6) { g.beginPath(); g.moveTo(i, -9); g.lineTo(i + 3, -9); g.lineTo(i + 1, -3); g.lineTo(i - 2, -3); g.fill(); }
            g.restore();
            EvoFx.roundRect(g, -9, 0, 18, 10, 4); g.lineWidth = 2.2; g.stroke();
            for (const x of [-5, 0, 5]) { g.beginPath(); g.arc(x, 5, 1.6, 0, Math.PI * 2); g.fill(); }
        } else { // khiên + vụ nổ đẩy
            g.beginPath(); g.moveTo(0, -11); g.lineTo(9, -7); g.lineTo(8, 3); g.quadraticCurveTo(5, 9, 0, 12); g.quadraticCurveTo(-5, 9, -8, 3); g.lineTo(-9, -7); g.closePath();
            g.lineWidth = 2.4; g.stroke();
            g.beginPath(); g.moveTo(0, -5); g.lineTo(0, 6); g.moveTo(-5, 0); g.lineTo(5, 0); g.stroke();
            for (const a of [-2.4, -0.7, 0.7, 2.4]) { g.beginPath(); g.moveTo(Math.sin(a) * 13, -Math.cos(a) * 13); g.lineTo(Math.sin(a) * 16, -Math.cos(a) * 16); g.stroke(); }
        }
    },
});
function tankEvoFront(p) { // khung: gốc ở tâm xe, phía trước = −y (P2 tự xoay)
    ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
    if (p.id === 2) ctx.rotate(Math.PI);
}
EvoFx.body('tank', {
    under(p) {
        const d = p.evoPilot;
        if (!d || !(d.ult > 0) || p.dashStartY === undefined) return;
        // vệt xích nứt sàn từ điểm xuất phát tới xe
        const x = p.x + p.w / 2, y0 = p.dashStartY + p.h / 2, y1 = p.y + p.h / 2;
        const dir = Math.sign(y1 - y0) || 1, len = Math.abs(y1 - y0);
        ctx.globalAlpha = 0.85;
        for (const off of [-p.w * 0.36, p.w * 0.36]) {
            ctx.fillStyle = 'rgba(15,10,5,.55)';
            ctx.fillRect(x + off - 4, Math.min(y0, y1), 8, len);
            ctx.strokeStyle = '#fbbf24aa'; ctx.lineWidth = 1;
            for (let s = 0; s < len; s += 7) { const yy = y0 + dir * s; ctx.beginPath(); ctx.moveTo(x + off - 4, yy); ctx.lineTo(x + off + 4, yy); ctx.stroke(); }
        }
        // vết nứt hình tia hai bên
        ctx.strokeStyle = 'rgba(251,191,36,.55)'; ctx.lineWidth = 1.5; ctx.shadowColor = '#f97316'; ctx.shadowBlur = 6;
        for (let s = 18, i = 0; s < len; s += 26, i++) {
            const yy = y0 + dir * s, side = i % 2 ? 1 : -1, bx = x + side * p.w * 0.5;
            ctx.beginPath(); ctx.moveTo(bx, yy); ctx.lineTo(bx + side * (8 + (i * 7) % 9), yy + dir * 5); ctx.lineTo(bx + side * (16 + (i * 5) % 11), yy - dir * 3); ctx.stroke();
        }
    },
    over(p) {
        const d = p.evoPilot;
        if (!d) return;
        const t = Date.now() / 1000;
        // Evo 3 Thủy Lực: đồng hồ áp suất + phụt hơi khi giữ lao
        if (EvoBodyKit.has(p, 3) && p.dashState === 1 && !(d.ult > 0)) {
            const k = Math.min(1, (d.hold || 0) / 90), R = Math.max(p.w, p.h) * 0.5 + 15;
            const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
            ctx.lineWidth = 4; ctx.lineCap = 'round';
            ctx.strokeStyle = 'rgba(0,0,0,.5)'; ctx.beginPath(); ctx.arc(cx, cy, R, Math.PI * 0.75, Math.PI * 2.25); ctx.stroke();
            ctx.strokeStyle = k > 0.75 ? '#ef4444' : '#fbbf24'; ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 10;
            ctx.beginPath(); ctx.arc(cx, cy, R, Math.PI * 0.75, Math.PI * (0.75 + 1.5 * k)); ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.save(); tankEvoFront(p);
            for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) {
                const ph = (t * 3 + i / 3 + (sx > 0 ? 0.5 : 0)) % 1;
                ctx.globalAlpha = (1 - ph) * 0.5; ctx.fillStyle = '#e2e8f0';
                ctx.beginPath(); ctx.arc(sx * (p.w / 2 + 3 + ph * 12), p.h / 2 + ph * 14, 3 + ph * 6, 0, Math.PI * 2); ctx.fill();
            }
            ctx.restore();
        }
        // Tuyệt Kỹ XE ỦI: lưỡi ủi rực lửa + đá văng
        if (d.ult > 0) {
            ctx.save(); tankEvoFront(p);
            const w = p.w + 26, y = -p.h / 2 - 6;
            ctx.shadowColor = '#f97316'; ctx.shadowBlur = 18;
            const g = ctx.createLinearGradient(0, y - 12, 0, y + 4);
            g.addColorStop(0, '#fde68a'); g.addColorStop(0.5, '#f59e0b'); g.addColorStop(1, '#78350f');
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.moveTo(-w / 2, y - 12); ctx.quadraticCurveTo(0, y - 6, w / 2, y - 12); ctx.lineTo(w / 2 - 6, y + 4); ctx.lineTo(-w / 2 + 6, y + 4); ctx.closePath(); ctx.fill();
            ctx.shadowBlur = 0;
            ctx.save(); ctx.clip();
            ctx.fillStyle = '#1f1405';
            for (let i = -w / 2 - 10; i < w / 2; i += 10) { ctx.beginPath(); ctx.moveTo(i, y + 4); ctx.lineTo(i + 5, y + 4); ctx.lineTo(i + 13, y - 14); ctx.lineTo(i + 8, y - 14); ctx.fill(); }
            ctx.restore();
            ctx.strokeStyle = '#fff7d6'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(-w / 2, y - 12); ctx.quadraticCurveTo(0, y - 6, w / 2, y - 12); ctx.stroke();
            // tay đòn nối lưỡi ủi
            ctx.strokeStyle = '#a16207'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(-p.w * 0.3, -p.h * 0.2); ctx.lineTo(-p.w * 0.3, y + 3); ctx.moveTo(p.w * 0.3, -p.h * 0.2); ctx.lineTo(p.w * 0.3, y + 3); ctx.stroke();
            // tia lửa ma sát + đá văng hai bên
            for (let i = 0; i < 10; i++) {
                const ph = (t * 2.4 + i * 0.1) % 1, sx = i % 2 ? 1 : -1;
                ctx.globalAlpha = 1 - ph;
                ctx.fillStyle = i % 3 ? '#fbbf24' : '#78716c';
                const px = sx * (w / 2 - 4 + ph * (20 + (i * 7) % 15)), py = y - 4 + ph * (10 + (i * 5) % 18) - ph * ph * 12;
                ctx.fillRect(px - 1.5, py - 1.5, i % 3 ? 3 : 4.5, i % 3 ? 3 : 4.5);
            }
            ctx.restore();
        }
    },
});
EvoBodyKit.effects.tankBurst = {
    draw(f) {
        const k = 1 - f.life / f.maxLife, a = Math.min(1, f.life / 12), col = f.ice ? '#a5f3fc' : '#fbbf24';
        ctx.save(); ctx.translate(f.x, f.y);
        ctx.globalAlpha = a;
        // khiên lục giác nở ra
        const r = 18 + EvoFx.ease(k) * 70;
        ctx.strokeStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 18; ctx.lineWidth = 5 * (1 - k) + 1.5;
        ctx.beginPath();
        for (let i = 0; i <= 6; i++) { const ang = i * Math.PI / 3 + Math.PI / 6; ctx[i ? 'lineTo' : 'moveTo'](Math.cos(ang) * r, Math.sin(ang) * r); }
        ctx.stroke();
        ctx.fillStyle = EvoFx.rgba(col, 0.18 * (1 - k)); ctx.fill();
        // vòng đẩy lùi bên ngoài
        ctx.shadowBlur = 0; ctx.strokeStyle = '#fff7d6'; ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]); ctx.lineDashOffset = -k * 40;
        ctx.beginPath(); ctx.arc(0, 0, 30 + EvoFx.ease(k) * 70, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
        // mũi tên đẩy ra
        ctx.fillStyle = col;
        for (let i = 0; i < 8; i++) {
            const ang = i * Math.PI / 4, d = 40 + EvoFx.ease(k) * 50;
            ctx.save(); ctx.rotate(ang); ctx.translate(d, 0);
            ctx.beginPath(); ctx.moveTo(6, 0); ctx.lineTo(-3, -5); ctx.lineTo(-3, 5); ctx.closePath(); ctx.fill();
            ctx.restore();
        }
        ctx.restore();
    },
};
EvoBodyKit.effects.tankDust = {
    draw(f) {
        const k = 1 - f.life / f.maxLife;
        ctx.save();
        for (let i = 0; i < 4; i++) {
            const sx = i % 2 ? 1 : -1, d = 18 + k * (28 + i * 6);
            ctx.globalAlpha = (1 - k) * 0.45;
            ctx.fillStyle = i < 2 ? '#a8a29e' : '#78716c';
            ctx.beginPath(); ctx.arc(f.x + sx * d, f.y + (i - 1.5) * 5, 6 + k * 12, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    },
};
