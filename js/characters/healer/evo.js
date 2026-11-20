EvoBodyKit.register('healer', {
    setup(p) {
        Object.assign(p.evoPilot, {
            hold: 0,
            reverse: 0,
            enemyLast: 0,
            enemyLost: 0,
        });
        if (EvoBodyKit.has(p, 3)) p.maxHp += 2;
        if (EvoBodyKit.combo(p, '3+4')) {
            p.maxHp++;
            p.damage *= 1.1;
            p.shield++;
        }
    },
    update(p, inp) {
        const d = p.evoPilot,
            e = EvoBodyKit.enemy(p);
        const external = p.hp - (p.hlLastHp === undefined ? p.hp : p.hlLastHp);
        if (external > 0) EvoSystem.gain(p, 'heal', external * 20);
        if (EvoBodyKit.has(p, 3) && inp.s) d.hold++;
        if (d.reverse > 0) {
            p.ultActiveTicks = Math.max(p.ultActiveTicks || 0, d.reverse);
            d.reverse--;
            const gained = e.hp - d.enemyLast + d.enemyLost;
            d.enemyLost = 0;
            // Bỏ tăng vọt do reset/hồi sinh; chỉ đảo các lần hồi trong hiệp.
            if (gained > 1e-5 && gained <= e.maxHp * 0.5) {
                e.hp = Math.max(0.01, e.hp - gained);
                e.takeDamage(gained, p, { evoHealReversal: true });
            }
            d.enemyLast = e.hp;
            d.enemyLost = 0;
        }
    },
    shoot(p, inp, now) {
        if (!EvoBodyKit.has(p, 3)) return false;
        const d = p.evoPilot;
        if (!inp.s && d.hold > 0) {
            if (p.ammo > 0 && now - p.lastShot > 350) {
                if (d.hold >= 30) {
                    let cost = 0.5;
                    if (EvoBodyKit.combo(p, '1+3')) {
                        const paid = Math.min(cost, p.hlOver || 0);
                        p.hlOver -= paid;
                        cost -= paid;
                    }
                    if (p.hp - cost >= 1) {
                        p.hp -= cost;
                        p.hlLastHp = p.hp;
                        EvoBodyKit.bullet(p, {
                            w: 4,
                            h: 16,
                            dmg: 1,
                            isPiercing: true,
                            evoTrueNeedle: true,
                            hook: 'evo_heal_needle',
                        });
                        p.ammo--;
                        p.lastShot = now;
                    }
                } else {
                    hlFire(p);
                    p.ammo--;
                    p.lastShot = now;
                }
            }
            d.hold = 0;
        }
        return true;
    },
    skill(p) {
        const req = hlLifeReq(p),
            ready = p.hlReady || p.hlLife >= req * 0.5;
        hlHeal(p, 1, 'skill');
        if (ready) {
            p.hlLife = req;
            p.hlReady = true;
        }
        EvoBodyKit.fx(p, 'healPulse', 40, { full: ready });
    },
    ultimate(p) {
        const time = EvoBodyKit.combo(p, '1+2+3+4') ? 360 : 240;
        Object.assign(p.evoPilot, {
            reverse: time,
            enemyLast: EvoBodyKit.enemy(p).hp,
            enemyLost: 0,
        });
        p.ultActiveTicks = time;
        EvoBodyKit.fx(p, 'healReversal', time, { color: '#f43f5e' });
        triggerScreenShake(5, 12);
    },
    bot(p, e, aligned, inp, t) {
        if (EvoBodyKit.has(p, 3)) {
            const h = p.evoPilot.hold,
                needle =
                    !p.hlReady &&
                    (EvoBodyKit.combo(p, '3+4') || e.shield > 0 || e.hp <= 1) &&
                    (p.hp > p.maxHp * 0.7 || (p.hlOver || 0) >= 0.5);
            inp.s = needle
                ? h > 0
                    ? h < 30 || (!aligned && h < 80)
                    : aligned && t % 16 === 0
                : aligned && t % 22 < 3;
        }
    },
    botSkill(p) {
        return p.hp < p.maxHp || p.hlLife >= hlLifeReq(p) * 0.5;
    },
});
BulletHooks.register('evo_heal_needle', {
    hit(b, p, e) {
        if (e) hlOnImpact(b, p, e, b.x, b.y, false);
        if (e && EvoBodyKit.combo(p, '3+4')) hlHeal(p, 0.5, 'needleRebound');
    },
    draw(b) {
        // kim tiêm Đảo Mệnh: thân thuỷ tinh, mũi kim sáng, vệt máu xanh
        const cx = b.x + b.w / 2, cy = b.y + b.h / 2, dir = b.vy < 0 ? -1 : 1;
        ctx.save();
        ctx.translate(cx, cy);
        if (dir > 0) ctx.rotate(Math.PI);
        const tg = ctx.createLinearGradient(0, 4, 0, 34);
        tg.addColorStop(0, 'rgba(190,242,100,.6)'); tg.addColorStop(1, 'rgba(190,242,100,0)');
        ctx.fillStyle = tg; ctx.fillRect(-2, 4, 4, 30);
        ctx.shadowColor = '#a3e635'; ctx.shadowBlur = 12;
        ctx.fillStyle = 'rgba(236,252,203,.9)'; ctx.fillRect(-3, -4, 6, 12);
        ctx.fillStyle = '#4ade80'; ctx.fillRect(-2, 0, 4, 7);
        ctx.fillStyle = '#e2e8f0'; ctx.fillRect(-4.5, 7, 9, 2);
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(0, -13); ctx.stroke();
        ctx.restore();
    },
});
(function () {
    const heal = hlHeal;
    hlHeal = function (p, ...args) {
        const hp = p.hp,
            result = heal(p, ...args);
        if (p.evoPilot) EvoSystem.gain(p, 'heal', Math.max(0, p.hp - hp) * 20);
        return result;
    };
    const take = Player.prototype.takeDamage;
    Player.prototype.takeDamage = function (amount, attacker, options) {
        if (options && options.gearBullet && options.gearBullet.evoTrueNeedle)
            options = { ...options, bypassShield: true, isPiercing: true };
        const before = this.hp,
            result = take.call(this, amount, attacker, options),
            lost = Math.max(0, before - this.hp),
            healer = this.id === 1 ? p2 : p1;
        if (
            healer &&
            healer.weapon === 'healer' &&
            healer.evoPilot &&
            healer.evoPilot.reverse > 0 &&
            lost > 0
        ) {
            healer.evoPilot.enemyLost += lost;
            hlHeal(healer, lost * 0.5, 'reverse');
        }
        return result;
    };
})();
function healEvoCross(g, s) {
    g.beginPath(); g.rect(-s * 0.32, -s, s * 0.64, s * 2); g.rect(-s, -s * 0.32, s * 2, s * 0.64);
}
// điện tâm đồ: đường ECG ngắn (lật ngược nếu inv)
function healEvoEcg(x, y, w, t, col, inv) {
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.shadowColor = col; ctx.shadowBlur = 8; ctx.lineJoin = 'round';
    ctx.beginPath();
    const s = inv ? -1 : 1, off = (t * 60) % 40;
    for (let i = 0; i <= w; i += 2) {
        const u = (i + off) % 40;
        let v = 0;
        if (u > 14 && u < 17) v = -4; else if (u >= 17 && u < 20) v = 12; else if (u >= 20 && u < 23) v = -14; else if (u >= 23 && u < 26) v = 3;
        ctx[i ? 'lineTo' : 'moveTo'](x - w / 2 + i, y - v * s);
    }
    ctx.stroke(); ctx.restore();
}
EvoBodyKit.effects.healReversal = {
    update(f, p) {
        f.x = p.x + p.w / 2;
        f.y = p.y + p.h / 2;
    },
    draw(f) {
        const enemy = EvoBodyKit.enemy(f.side === 1 ? p1 : p2), e = f.maxLife - f.life, t = Date.now() / 1000;
        const ex = enemy.x + enemy.w / 2, ey = enemy.y + enemy.h / 2, a = Math.min(1, f.life / 16);
        ctx.save();
        ctx.globalAlpha = a; ctx.globalCompositeOperation = 'source-over';
        // dây hút sinh lực: hạt đỏ chạy từ địch về người tung, chuyển xanh khi tới
        const n = 10;
        for (let i = 0; i < n; i++) {
            const q = (t * 0.7 + i / n) % 1, wob = Math.sin(q * Math.PI * 3 + t * 4) * 10;
            const x = ex + (f.x - ex) * q + wob, y = ey + (f.y - ey) * q;
            ctx.fillStyle = q < 0.5 ? '#f43f5e' : '#4ade80';
            ctx.globalAlpha = a * (0.4 + 0.6 * Math.sin(q * Math.PI));
            ctx.beginPath(); ctx.arc(x, y, 3.2, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = a;
        // chữ thập: người tung xanh, địch lật từ xanh thành đỏ
        const flip = Math.min(1, e / 30);
        for (const [x, y, mine] of [[f.x, f.y, true], [ex, ey, false]]) {
            ctx.save(); ctx.translate(x, y);
            const sx = mine ? 1 : Math.cos(flip * Math.PI);
            const col = mine || flip < 0.5 ? '#4ade80' : '#f43f5e';
            ctx.scale(Math.abs(sx) < 0.08 ? 0.08 : Math.abs(sx), 1);
            ctx.globalAlpha = a * 0.85;
            ctx.shadowColor = col; ctx.shadowBlur = 16;
            ctx.fillStyle = EvoFx.rgba(col, 0.28); ctx.strokeStyle = col; ctx.lineWidth = 2.5;
            healEvoCross(ctx, 26 + 3 * Math.sin(t * 6)); ctx.fill(); ctx.stroke();
            ctx.restore();
        }
        // nhịp tim đảo trên đầu mỗi bên
        const up = (yy) => (yy < canvas.height / 2 ? 1 : -1);
        healEvoEcg(f.x, f.y + up(f.y) * 40, 80, t, '#4ade80', false);
        healEvoEcg(ex, ey + up(ey) * 40, 80, t, '#f43f5e', true);
        ctx.restore();
    },
};
EvoBodyKit.effects.healPulse = {
    update(f, p) { f.x = p.x + p.w / 2; f.y = p.y + p.h / 2; },
    draw(f) {
        const k = 1 - f.life / f.maxLife;
        ctx.save(); ctx.translate(f.x, f.y);
        ctx.globalAlpha = 1 - k;
        ctx.strokeStyle = '#4ade80'; ctx.shadowColor = '#4ade80'; ctx.shadowBlur = 14; ctx.lineWidth = 3 * (1 - k) + 1;
        ctx.beginPath(); ctx.arc(0, 0, 18 + EvoFx.ease(k) * 40, 0, Math.PI * 2); ctx.stroke();
        if (f.full) { ctx.strokeStyle = '#bef264'; ctx.beginPath(); ctx.arc(0, 0, 12 + EvoFx.ease(k) * 26, 0, Math.PI * 2); ctx.stroke(); }
        ctx.fillStyle = '#86efac';
        for (let i = 0; i < 6; i++) {
            const x = (i - 2.5) * 10, y = -10 - k * (30 + (i * 13) % 20);
            ctx.save(); ctx.translate(x, y); healEvoCross(ctx, 4); ctx.fill(); ctx.restore();
        }
        ctx.restore();
    },
};
// ===== Hình ảnh Evo 3/4 (chỉ vẽ) =====
EvoFx.theme('healer', {
    c1: '#4ade80', c2: '#f43f5e', dark: '#052214', slogan: 'Hồi sinh hoá huỷ diệt',
    sfx: [[0, 523, 'sine', 0.15, 0.1], [160, 392, 'sine', 0.15, 0.1], [320, 262, 'triangle', 0.4, 0.12]],
    icon(g, mode) {
        if (mode === 'ult') { // chữ thập nửa xanh nửa đỏ + mũi tên đảo
            g.save(); g.beginPath(); g.rect(-13, -13, 13, 26); g.clip(); g.fillStyle = '#4ade80'; healEvoCross(g, 9); g.fill(); g.restore();
            g.save(); g.beginPath(); g.rect(0, -13, 13, 26); g.clip(); g.fillStyle = '#f43f5e'; healEvoCross(g, 9); g.fill(); g.restore();
            g.lineWidth = 1.8; g.beginPath(); g.arc(0, 0, 12.5, -2.8, -0.4); g.stroke(); g.beginPath(); g.arc(0, 0, 12.5, 0.35, 2.75); g.stroke();
        } else { // chữ thập + giọt máu
            healEvoCross(g, 8); g.fill();
            g.save(); g.fillStyle = '#052214'; g.beginPath(); g.moveTo(0, -4); g.quadraticCurveTo(4, 1, 0, 4); g.quadraticCurveTo(-4, 1, 0, -4); g.fill(); g.restore();
        }
    },
});
EvoFx.body('healer', {
    over(p) {
        const d = p.evoPilot;
        if (!d || !EvoBodyKit.has(p, 3) || !(d.hold > 0)) return;
        // tụ kim Đảo Mệnh: vòng 0.5s, đủ thì hiện giá máu −0.5
        const k = Math.min(1, d.hold / 30), cx = p.x + p.w / 2, cy = p.id === 1 ? p.y - 10 : p.y + p.h + 10;
        ctx.translate(cx, cy);
        ctx.strokeStyle = 'rgba(0,0,0,.5)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 11, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = k >= 1 ? '#f43f5e' : '#bef264'; ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(0, 0, 11, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2); ctx.stroke();
        ctx.fillStyle = ctx.strokeStyle; ctx.shadowBlur = 0;
        ctx.save(); ctx.scale(0.5, 0.5); healEvoCross(ctx, 9); ctx.fill(); ctx.restore();
    },
});
