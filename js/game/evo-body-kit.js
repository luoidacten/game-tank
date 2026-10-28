// Tiện ích cho body thí điểm. Registry chứa hàm; trạng thái gửi mạng chỉ có số/chuỗi/mảng thuần.
const EvoBodyKit = {
    bodies: {},
    effects: {},
    enemy(p) {
        return p.id === 1 ? p2 : p1;
    },
    dir(p) {
        return p.id === 1 ? -1 : 1;
    },
    has(p, slot) {
        return FEATURE_EVO34 && ownedEvos(p).some((e) => e.evoSlot === slot);
    },
    combo(p, key) {
        return hasFullEvo(p) && [key, '1+2+3+4'].includes(fullEvoCombo(p));
    },
    register(id, def) {
        if (!FEATURE_EVO34) return;
        this.bodies[id] = def;
        const old = CharHooks.registry[id] || {};
        CharHooks.register(id, {
            ...old,
            setup() {
                if (old.setup) old.setup.call(this);
                this.evoPilot = { t: 0, wasDown: false };
                if (def.setup) def.setup(this);
            },
            shoot(inp, now) {
                if (def.shoot && def.shoot(this, inp, now) === true)
                    return true;
                return old.shoot && old.shoot.call(this, inp, now);
            },
            skill(p) {
                return def.skill(p);
            },
            ultimate(p) {
                return def.ultimate(p);
            },
            ultimateReady(p) {
                return def.ultimateReady ? def.ultimateReady(p) : true;
            },
        });
    },
    tick(p) {
        const def = p && this.bodies[p.weapon];
        if (!def || !p.evoPilot || p.hp <= 0 || gameState.phase !== 'playing')
            return;
        const d = p.evoPilot,
            inp = inputs[p.id === 1 ? 'p1' : 'p2'];
        d.t++;
        d.press = !!inp.s && !d.wasDown;
        d.release = !inp.s && d.wasDown;
        if (!EvoSystem.blocked(p) && def.update) def.update(p, inp);
        d.wasDown = !!inp.s;
    },
    bot(p, e, aligned, inp, t) {
        const def = this.bodies[p.weapon];
        if (!def) return;
        if (this.has(p, 4))
            inp.k =
                t % 30 === 0 &&
                ((p.rage || 0) >= 100
                    ? EvoSystem.ready(p)
                    : !(p.skillCd > 0) &&
                      (def.botSkill ? def.botSkill(p, e) : aligned));
        if (def.bot) def.bot(p, e, aligned, inp, t);
    },
    bullet(p, opts = {}) {
        return spawnBullet(p, {
            x: p.x + p.w / 2 - 4,
            y: p.id === 1 ? p.y - 10 : p.y + p.h,
            w: 8,
            h: 8,
            vx: 0,
            vy: this.dir(p) * C.bulletSpeed,
            dmg: p.damage,
            ...opts,
        });
    },
    hit(p, enemy, amount, execute = 0, options = {}) {
        if (!enemy || enemy.hp <= 0) return;
        const lethal = execute > 0 && enemy.hp / enemy.maxHp <= execute;
        enemy.takeDamage(
            lethal
                ? enemy.hp + (enemy.shield || 0) + 10
                : Math.min(amount, enemy.maxHp * 0.6),
            p,
            lethal
                ? {
                      ...options,
                      unavoidable: true,
                      bypassShield: true,
                      ignoreInvincible: true,
                  }
                : options,
        );
    },
    fx(p, kind, life, data = {}) {
        const fx = new EvoPilotFx(p, kind, life, data);
        bodyEffects.push(fx);
        return fx;
    },
    flash(p, color, kind = 'ring') {
        return this.fx(p, 'flash', 36, { color, shape: kind });
    },
    ray(
        p,
        delay,
        damage,
        width,
        color,
        execute = 0,
        through = false,
        x = p.x + p.w / 2,
        origin = null,
    ) {
        scheduleHitscan(
            origin || p,
            delay,
            color,
            width,
            () => {
                if (p.hp <= 0 || gameState.phase !== 'playing') return;
                const e = this.enemy(p),
                    dir = this.dir(p),
                    from =
                        p.id === 1
                            ? (origin || p).y
                            : (origin || p).y + ((origin || p).h || 0);
                const wall = through
                    ? null
                    : sniperWallBlockY(p, x, from, dir, width / 2, damage);
                const end = wall
                    ? sniperWallStopY(wall, dir)
                    : dir < 0
                      ? 0
                      : canvas.height;
                this.fx(p, 'beam', 18, { x, y: from, end, width, color });
                const ey = e.y + e.h / 2;
                if (
                    Math.abs(e.x + e.w / 2 - x) <= e.w / 2 + width / 2 &&
                    (!wall || (ey - end) * dir <= 0)
                )
                    this.hit(p, e, damage, execute, { isPiercing: true });
            },
            x,
        );
    },
};

class EvoPilotFx {
    constructor(owner, kind, life, data) {
        this.side = owner.id;
        this.kind = kind;
        this.life = life;
        this.maxLife = life;
        this.active = true;
        this.x = owner.x + owner.w / 2;
        this.y = owner.y + owner.h / 2;
        Object.assign(this, data);
    }
    update() {
        if (!this.active) return;
        const def = EvoBodyKit.effects[this.kind];
        if (def && def.update) def.update(this, this.side === 1 ? p1 : p2);
        if (--this.life <= 0) this.active = false;
    }
    draw() {
        if (!this.active) return;
        const def = EvoBodyKit.effects[this.kind];
        if (def && def.draw) {
            def.draw(this);
            return;
        }
        ctx.save();
        ctx.globalAlpha = Math.min(1, this.life / 12);
        ctx.strokeStyle = this.color || '#67e8f9';
        ctx.shadowColor = ctx.strokeStyle;
        ctx.shadowBlur = 12;
        ctx.lineWidth = 3;
        if (this.kind === 'beam') {
            ctx.lineWidth = this.width;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x, this.end);
            ctx.stroke();
        } else {
            const r = 12 + (this.maxLife - this.life) * 2;
            for (let i = 0; i < 8; i++) {
                const a = (i * Math.PI) / 4;
                ctx.beginPath();
                ctx.moveTo(
                    this.x + Math.cos(a) * r * 0.4,
                    this.y + Math.sin(a) * r * 0.4,
                );
                ctx.lineTo(this.x + Math.cos(a) * r, this.y + Math.sin(a) * r);
                ctx.stroke();
            }
        }
        ctx.restore();
    }
}

window.addEventListener('load', () => {
    const setup = Player.prototype.setupForNewRound;
    Player.prototype.setupForNewRound = function () {
        const result = setup.apply(this, arguments),
            def = EvoBodyKit.bodies[this.weapon];
        const combo = fullEvoCombo(this);
        const key = combo;
        const tune =
            def &&
            def.balance &&
            (def.balance[key] ||
                (key === '1+2+3+4' ? def.balance['1+2'] : null));
        if (tune) {
            this.maxHp = Math.max(1, this.maxHp * (tune.hp || 1));
            this.damage *= tune.damage || 1;
            this.hp = this.maxHp;
        }
        return result;
    };
    const update = Player.prototype.update;
    Player.prototype.update = function () {
        EvoBodyKit.tick(this);
        return update.apply(this, arguments);
    };
    const damage = Player.prototype.takeDamage;
    Player.prototype.takeDamage = function (amount, attacker, options) {
        const hp = this.hp,
            shield = this.shield;
        const defSelf = EvoBodyKit.bodies[this.weapon],
            pair = fullEvoCombo(this);
        const tune =
            defSelf &&
            defSelf.balance &&
            (defSelf.balance[pair] ||
                (pair === '1+2+3+4' ? defSelf.balance['1+2'] : null));
        if (tune && tune.taken && !(options && options.isEnvironmental))
            amount *= tune.taken;
        const result = damage.call(this, amount, attacker, options),
            lost = Math.max(0, hp - this.hp);
        const source = attacker && (attacker.owner || attacker);
        const def = source && EvoBodyKit.bodies[source.weapon],
            mine = EvoBodyKit.bodies[this.weapon];
        if (
            (lost > 0 || this.shield < shield) &&
            def &&
            source !== this &&
            def.dealt
        )
            def.dealt(source, this, lost);
        if (lost > 0 && mine && mine.damaged) mine.damaged(this, lost, source);
        return result;
    };
});
