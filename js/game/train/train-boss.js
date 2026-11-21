// ==========================================
// MẢNH KÝ ỨC 1 — THE TRAIN: thực thể boss (logic)
// ------------------------------------------
// TrainBoss  : đoàn tàu (nằm trong bodyEffects). Vòng ray = các toa + 1 khoảng trống, chạy sang trái.
//              Dừng lộ đúng 3 toa (mỗi toa rộng 1/3 sân). Chỉ toa trong màn hình bắn / bị bắn.
// TrainShell : quả cối Pháo Kích (vòng cảnh báo trên làn người chơi)
// TrainMinion: lính (Lính Ray chạy tới nổ / Lính Súng đứng bắn)
// TrainDash  : Xông Ga của Đầu Tàu (vệt cảnh báo vàng có khe an toàn)
// Mọi trạng thái là dữ liệu thuần (online host-authoritative) — tham chiếu người chơi bằng id.
// Hình vẽ ở js/render/train-art.js; luồng chế độ ở js/game/train/train-mode.js.
// ==========================================

function trainGeom() {
    const W = canvas.width, H = canvas.height;
    const carW = W / 3;
    const carH = Math.round(Math.max(46, Math.min(64, W * 0.145)));
    const cy = Math.round(H / 2);
    return { W, H, carW, carH, cy, y0: cy - carH / 2, y1: cy + carH / 2, bandY0: cy - carH / 2 - 9, bandY1: cy + carH / 2 + 9 };
}

function trainEase(k) { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); }

class TrainBoss {
    constructor(opts) {
        const v = TRAIN_VARIANTS[opts.variant] || TRAIN_VARIANTS.p1;
        this.isTrainBoss = true;
        this.active = true;
        this.variant = v.id;
        this.phase = opts.phase || v.phase || 1;
        this.coop = !!opts.coop;
        this.bossBuffs = (opts.bossBuffs || []).slice();
        const nb = (id) => this.bossBuffs.filter(b => b === id).length;
        // Hệ số
        const phaseScale = opts.phaseScale || 1;
        this.hpMult = v.hpMult * phaseScale * TRAIN_HP_SCALE * (this.coop ? TRAIN_COOP_HP_MULT : 1) * Math.pow(1.2, nb('hp20'));
        this.dmgMult = v.dmgMult;
        this.rateMult = v.rateMult * Math.pow(1.15, nb('rate15'));
        this.warnCut = 6 * nb('warn01');
        this.minionPlus = nb('minion1');
        this.armor = Math.pow(0.8, nb('armor20'));
        this.stopTicks = v.stopTicks; this.moveTicks = v.moveTicks;
        // Đội hình toa
        const list = v.cars.slice();
        for (let i = 0; i < nb('extra_car'); i++) {
            const types = ['smg', 'mortar', 'laser', 'summon'];
            list.splice(1 + Math.floor(Math.random() * (list.length - 1)), 0, types[Math.floor(Math.random() * types.length)]);
        }
        this.cars = list.map((type, i) => {
            const mhp = Math.round((v.hp[type] || 5) * this.hpMult * 10) / 10;
            return {
                i, type, hp: mhp, maxHp: mhp, dead: false, cd: 60 + i * 25, act: null, actT: 0, flash: 0, stun: 0,
                door: 0, aimD: 0, aimU: 0, gapD: 0, gapU: 0, drift: 0, deathT: 0, sx: 0, vis: false, flip: 0, shieldHitT: 0,
            };
        });
        this.slots = this.cars.length + 1; // +1 khoảng trống sau toa cuối
        this.t = 0;
        this.state = 'intro'; this.stateT = 0;
        this.from = -3.2; this.to = 0; this.posU = -3.2; this.moveDur = 170;
        this.vel = 0;                 // slot / tick (để quay bánh xe, khói)
        this.wheel = 0;               // góc quay bánh xe
        this.lost = 0;
        this.bullets = []; this.debris = []; this.sparks = []; this.puffs = []; this.rings = [];
        this.dying = 0;
        this.dashCd = 240;
        this.stopNo = 0; this.signalUsed = false;
        this.shake = 0;
    }

    get cfg() { return TRAIN_VARIANTS[this.variant] || TRAIN_VARIANTS.p1; }
    loco() { return this.cars.find(c => c.type === 'loco'); }
    moving() { return this.state !== 'stop'; }
    power() { return 1 + 0.15 * this.lost; } // mỗi toa mất: +15% dame & tốc bắn
    totalHp() { return this.cars.reduce((s, c) => s + Math.max(0, c.hp), 0); }
    totalMax() { return this.cars.reduce((s, c) => s + c.maxHp, 0); }
    locoShielded() { return this.lost < 3; }

    slotX(k, G) {
        G = G || trainGeom();
        const S = this.slots;
        const d = (((k - this.posU) % S) + S) % S;
        let x = d * G.carW;
        if (x > G.W - 0.5) x -= S * G.carW;
        return x;
    }
    // Toa còn sống đang nằm trọn trong màn hình (chỉ khi tàu dừng)
    visibleAlive() {
        if (this.moving() || this.dying) return [];
        return this.cars.filter(c => !c.dead && c.vis);
    }
    // Toa (sống hoặc xác) ở toạ độ x trên màn hình; null = khoảng trống
    carAtX(x, G) {
        G = G || trainGeom();
        for (const c of this.cars) if (x >= c.sx && x < c.sx + G.carW) return c;
        return null;
    }

    // ---------------- Vòng cập nhật ----------------
    update() {
        if (!this.active) return;
        const G = trainGeom();
        this.t++;
        this.stateT++;
        const prevPos = this.posU;
        if (this.state === 'intro' || this.state === 'run') {
            const k = this.stateT / this.moveDur;
            this.posU = this.from + (this.to - this.from) * trainEase(k);
            if (k >= 1) {
                this.posU = this.to;
                this.setState('stop');
            }
        } else if (this.state === 'stop' && !this.dying) {
            if (this.stateT >= this.stopTicks + (this.extraStop || 0)) this.departNext();
        }
        this.vel = this.posU - prevPos;
        this.wheel += this.vel * 9;
        for (const c of this.cars) {
            c.sx = this.slotX(c.i, G);
            c.vis = c.sx > -1 && c.sx + G.carW < G.W + 1;
            if (c.flash > 0) c.flash--;
            if (c.stun > 0) c.stun--;
            if (c.shieldHitT > 0) c.shieldHitT--;
            if (c.dead) c.deathT++;
            if (c.act) c.actT++;
        }
        // Tóe lửa phanh / khởi hành (báo trước 1s)
        const warnStop = (this.state === 'run' || this.state === 'intro') && this.moveDur - this.stateT <= 60;
        const warnGo = this.state === 'stop' && !this.dying && (this.stopTicks + (this.extraStop || 0)) - this.stateT <= 60;
        if ((warnStop || warnGo) && this.t % 2 === 0) this.emitWheelSparks(G, warnStop ? 2 : 1);
        if (this.dying) this.updateDying(G);
        else if (this.state === 'stop' && TrainMode.state === 'fight') this.updateAttacks(G);
        this.updateLocoDash(G);
        this.updateBullets(G);
        this.updateFx(G);
        const hook = this.cfg.hooks && this.cfg.hooks.update;
        if (hook) hook(this);
    }

    setState(s) {
        const prev = this.state;
        this.state = s; this.stateT = 0;
        if (s === 'stop') {
            this.stopNo++; this.signalUsed = false; this.extraStop = 0;
            this.cars.forEach((c, j) => { if (!c.dead) { c.cd = Math.round(40 + 22 * ((c.i - Math.round(this.posU) + this.slots) % this.slots)); c.act = null; } });
            this.shake = 8;
            if (typeof triggerScreenShake === 'function') triggerScreenShake(3, 8);
        }
        if (prev !== s && typeof TrainMode !== 'undefined') TrainMode.onTrainStateChange(s);
    }

    departNext() {
        const S = this.slots;
        let w = Math.round(this.to) + 3;
        for (let n = 0; n < S; n++) {
            const ok = [0, 1, 2].some(j => { const c = this.cars[(((w + j) % S) + S) % S]; return c && !c.dead; });
            if (ok) break;
            w += 3;
        }
        this.from = this.posU; this.to = w;
        const dist = Math.max(1, w - this.from);
        this.moveDur = Math.round(this.moveTicks * Math.pow(dist / 3, 0.6));
        this.cars.forEach(c => { c.act = null; c.door = 0; });
        this.setState('run');
    }

    // Tín Hiệu Đỏ: dừng thêm (1 lần / lượt dừng)
    extendStop(ticks) {
        if (this.state !== 'stop' || this.signalUsed) return false;
        this.signalUsed = true; this.extraStop = (this.extraStop || 0) + ticks;
        return true;
    }

    // ---------------- Tấn công ----------------
    targets() { return TrainMode.livePlayers(); }
    pickTarget(car, side) {
        let list = this.targets();
        if (side) list = list.filter(p => (p.id === 1) === (side > 0));
        if (!list.length) return null;
        if (list.length === 1) return list[0];
        car.flip = (car.flip || 0) + 1;
        return list[car.flip % list.length];
    }

    updateAttacks(G) {
        const rate = this.rateMult * this.power();
        for (const c of this.cars) {
            if (c.dead || !c.vis) continue;
            if (c.act) { this.stepAct(c, G); continue; }
            if (c.stun > 0) continue;
            c.cd -= rate;
            if (c.cd <= 0) {
                const base = (TRAIN_CAR_TYPES[c.type] || {}).cd || 240;
                c.cd = base * (0.85 + Math.random() * 0.3);
                this.startAct(c, G);
            }
        }
    }

    startAct(c, G) {
        const custom = this.cfg.skills && this.cfg.skills[c.type];
        if (custom) { custom(this, c, G); return; }
        c.act = c.type; c.actT = 0;
        const cx = c.sx + G.carW / 2;
        if (c.type === 'smg') {
            // Khe hở ban đầu lệch quanh hướng người chơi, trôi dần theo nòng
            const aimAt = (p, dir) => {
                if (!p) return (Math.random() - 0.5) * 0.6;
                const dy = Math.abs((p.y + p.h / 2) - G.cy) || 200;
                return Math.atan2((p.x + p.w / 2) - cx, dy) + (Math.random() - 0.5) * 0.25;
            };
            const pd = this.targets().find(p => p.id === 1), pu = this.targets().find(p => p.id === 2);
            c.gapD = Math.max(-0.7, Math.min(0.7, aimAt(pd)));
            c.gapU = Math.max(-0.7, Math.min(0.7, aimAt(pu)));
            c.drift = (Math.random() < 0.5 ? -1 : 1) * 0.0042;
        } else if (c.type === 'summon') {
            c.door = 0;
        } else if (c.type === 'laser') {
            const p = this.pickTarget(c);
            if (!p) { c.act = null; return; }
            c.tgt = p.id;
            const delay = Math.max(18, 36 - this.warnCut);
            c.lockX = p.x + p.w / 2;
            const shim = { id: p.id === 1 ? 2 : 1, x: c.sx + 6, y: G.y0, w: G.carW - 12, h: G.carH, hp: 1 };
            const dmg = TRAIN_DMG.laser * this.dmgMult * this.power();
            const lockX = c.lockX, side = p.id;
            const fire = () => {
                const tw = 11;
                TrainMode.livePlayers().forEach(t => {
                    if (t.id !== side) return;
                    if (lockX < t.x - tw || lockX > t.x + t.w + tw) return;
                    if (trainWallBlocks(lockX, G.cy, t.y + t.h / 2)) return;
                    t.takeDamage(dmg, TrainMode.proxyFor(t));
                    if (typeof spawnSparkParticles === 'function') spawnSparkParticles(t.x + t.w / 2, t.y + t.h / 2, '#7df9ff', 10);
                });
                if (typeof triggerScreenShake === 'function') triggerScreenShake(4, 8);
            };
            if (typeof scheduleHitscan === 'function') scheduleHitscan(shim, delay, '#28e0ff', 22, fire, lockX);
            c.actDur = delay + 14;
        } else if (c.type === 'mortar') {
            const p = this.pickTarget(c);
            if (!p) { c.act = null; return; }
            const vx = p._vx || 0;
            const dir = Math.abs(vx) > 0.4 ? Math.sign(vx) : (Math.random() < 0.5 ? -1 : 1);
            const k = Math.abs(vx) > 0.4 ? 1 : 0.55;
            const px = p.x + p.w / 2;
            const ly = p.y + p.h / 2;
            const dmg = TRAIN_DMG.shell * this.dmgMult * this.power();
            const warn = Math.max(26, 48 - this.warnCut);
            [0, 70 * k, 140 * k].forEach((lead, j) => {
                const tx = Math.max(24, Math.min(G.W - 24, px + dir * lead));
                bodyEffects.push(new TrainShell(cx + (j - 1) * 14, p.id === 1 ? G.y1 : G.y0, tx, ly, warn + j * 15, dmg, p.id));
            });
        } else if (c.type === 'loco') {
            // Còi Tàu: khói trắng 0.5s rồi sóng âm
        }
    }

    stepAct(c, G) {
        const cx = c.sx + G.carW / 2;
        if (c.act === 'smg') {
            const dur = 90;
            c.gapD += c.drift; c.gapU -= c.drift;
            c.aimD = Math.sin(c.actT * 0.32) * 0.85; c.aimU = -c.aimD;
            if (c.actT % 9 === 1) {
                const sp = 3.3, n = 7, half = 0.86, gapHalf = 0.23;
                const dmg = TRAIN_DMG.smg * this.dmgMult * this.power();
                for (const side of [1, -1]) {
                    const gap = side > 0 ? c.gapD : c.gapU;
                    for (let j = 0; j < n; j++) {
                        const a = -half + (2 * half) * j / (n - 1) + (Math.random() - 0.5) * 0.05;
                        if (Math.abs(a - gap) < gapHalf) continue;
                        const ox = cx + (side > 0 ? -16 : 16);
                        this.bullets.push({ x: ox, y: side > 0 ? G.y1 + 2 : G.y0 - 2, vx: Math.sin(a) * sp, vy: Math.cos(a) * sp * side, r: 3.2, dmg, side, kind: 'smg', t: 0 });
                    }
                }
                if (soundSystem && !soundSystem.muted && c.actT % 14 === 1 && soundSystem.playHit) soundSystem.playHit();
            }
            if (c.actT >= dur) c.act = null;
        } else if (c.act === 'summon') {
            c.door = Math.min(1, c.actT / 22);
            if (c.actT === 24) {
                const alive = bodyEffects.filter(e => e instanceof TrainMinion && e.active).length;
                const players = this.targets();
                let n = (this.coop ? 3 : 2) + this.minionPlus;
                n = Math.min(n, Math.max(0, 7 - alive));
                for (let j = 0; j < n; j++) {
                    let side = 1;
                    if (players.length > 1) side = (j % 2 === 0) ? 1 : -1;
                    else if (players.length === 1) side = players[0].id === 1 ? 1 : -1;
                    const kind = (j % 2 === 0) ? 'runner' : 'gunner';
                    const mx = c.sx + G.carW * (0.25 + 0.5 * ((j + 0.5) / Math.max(1, n)));
                    bodyEffects.push(new TrainMinion(kind, mx, side > 0 ? G.y1 + 4 : G.y0 - 22, side, this.dmgMult * this.power(), this.hpMult));
                }
            }
            if (c.actT > 70) c.door = Math.max(0, 1 - (c.actT - 70) / 20);
            if (c.actT >= 90) { c.act = null; c.door = 0; }
        } else if (c.act === 'laser') {
            if (c.actT >= (c.actDur || 50)) c.act = null;
        } else if (c.act === 'mortar') {
            if (c.actT >= 46) c.act = null;
        } else if (c.act === 'loco') {
            if (c.actT % 3 === 0 && this.puffs.length < 60) {
                this.puffs.push({ x: cx + (Math.random() - 0.5) * G.carW * 0.6, y: G.cy + (Math.random() - 0.5) * G.carH, r: 6 + Math.random() * 6, vx: (Math.random() - 0.5) * 1.6, vy: (Math.random() - 0.5) * 1.6, life: 40, max: 40, white: 1 });
            }
            if (c.actT === Math.max(16, 30 - this.warnCut)) {
                // Sóng âm: đẩy lùi + làm chậm 1s hai làn
                this.rings.push({ x: cx, y: G.cy, r: 10, life: 36, max: 36 });
                const dmg = TRAIN_DMG.horn * this.dmgMult * this.power();
                TrainMode.livePlayers().forEach(p => {
                    const dx = (p.x + p.w / 2) - cx;
                    p.kbX = (dx >= 0 ? 1 : -1) * 9;
                    p.slowTimer = Math.max(p.slowTimer || 0, 60);
                    p._trainCCok = true;
                    p.takeDamage(dmg, TrainMode.proxyFor(p));
                    if (typeof addFloatingText === 'function') addFloatingText(p.x + p.w / 2, p.y - 18, 'CÒI TÀU! 📢', '#e2e8f0', 13);
                });
                if (typeof triggerScreenShake === 'function') triggerScreenShake(6, 12);
                if (soundSystem && !soundSystem.muted && soundSystem.playShieldBreak) soundSystem.playShieldBreak();
            }
            if (c.actT >= 52) c.act = null;
        } else if (c.actT > 120) c.act = null;
    }

    // Xông Ga: Đầu Tàu ≤50% máu, hết khiên -> lao vụt qua làn (vệt vàng có khe an toàn)
    updateLocoDash(G) {
        const L = this.loco();
        if (!L || L.dead || this.dying || TrainMode.state !== 'fight') return;
        if (this.locoShielded() || L.hp > L.maxHp * 0.5) return;
        if (bodyEffects.some(e => e instanceof TrainDash && e.active)) return;
        this.dashCd -= this.rateMult * this.power();
        if (this.dashCd > 0) return;
        this.dashCd = 460;
        const p = this.pickTarget(L);
        if (!p) return;
        const warn = Math.max(50, 78 - this.warnCut);
        bodyEffects.push(new TrainDash(p.id, p.y + p.h / 2, warn, TRAIN_DMG.dash * this.dmgMult * this.power(), p.x + p.w / 2));
    }

    // Đạn boss (SMG, Lính Súng)
    updateBullets(G) {
        const players = TrainMode.livePlayers();
        const walls = (typeof sniperWalls !== 'undefined') ? sniperWalls : [];
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.x += b.vx; b.y += b.vy; b.t++;
            let dead = b.x < -20 || b.x > G.W + 20 || b.y < -20 || b.y > G.H + 20;
            if (!dead) for (const w of walls) {
                if (w && w.active && b.x > w.x && b.x < w.x + w.w && b.y > w.y && b.y < w.y + w.h) { dead = true; break; }
            }
            if (!dead) for (const p of players) {
                if (b.x + b.r > p.x && b.x - b.r < p.x + p.w && b.y + b.r > p.y && b.y - b.r < p.y + p.h) {
                    p.takeDamage(b.dmg, TrainMode.proxyFor(p));
                    if (typeof spawnSparkParticles === 'function') spawnSparkParticles(b.x, b.y, '#ffd166', 3);
                    dead = true; break;
                }
            }
            if (dead) this.bullets.splice(i, 1);
        }
    }

    emitWheelSparks(G, strength) {
        const qm = (typeof Quality !== 'undefined') ? Quality.particleMult : 1;
        if (this.sparks.length > 160 * qm) return;
        for (const c of this.cars) {
            if (!(c.sx > -G.carW && c.sx < G.W)) continue;
            for (const wx of [0.2, 0.8]) {
                if (Math.random() > 0.55 * qm * strength) continue;
                for (const side of [-1, 1]) {
                    const x = c.sx + G.carW * wx + (Math.random() - 0.5) * 10;
                    const y = side < 0 ? G.y0 - 3 : G.y1 + 3;
                    this.sparks.push({ x, y, vx: 1 + Math.random() * 3.5, vy: side * (0.6 + Math.random() * 2.2), life: 14 + Math.random() * 10, max: 24 });
                }
            }
        }
    }

    updateFx(G) {
        const qm = (typeof Quality !== 'undefined') ? Quality.particleMult : 1;
        // Khói ống khói Đầu Tàu / xác toa cháy
        const L = this.loco();
        if (L && !L.dead && L.sx > -G.carW && L.sx < G.W && this.t % (this.moving() ? 3 : 6) === 0 && this.puffs.length < 70 * qm + 6) {
            this.puffs.push({ x: L.sx + G.carW * 0.3, y: G.cy - G.carH * 0.12, r: 4 + Math.random() * 3, vx: 0.7 + Math.random() * 0.6 + Math.max(0, this.vel) * G.carW * 0.6, vy: -0.35 - Math.random() * 0.4, life: 70, max: 70 });
        }
        for (const c of this.cars) {
            if (!c.dead || !(c.sx > -G.carW && c.sx < G.W)) continue;
            if (Math.random() < 0.22 * qm && this.puffs.length < 90) {
                this.puffs.push({ x: c.sx + G.carW * (0.25 + Math.random() * 0.5), y: G.cy + (Math.random() - 0.5) * G.carH * 0.5, r: 5 + Math.random() * 5, vx: 0.4 + Math.max(0, this.vel) * G.carW * 0.6, vy: -0.5 - Math.random() * 0.5, life: 60, max: 60, dark: 1 });
            }
        }
        for (let i = this.puffs.length - 1; i >= 0; i--) {
            const f = this.puffs[i];
            f.x += f.vx; f.y += f.vy; f.r += 0.22; f.life--;
            if (f.life <= 0) this.puffs.splice(i, 1);
        }
        for (let i = this.sparks.length - 1; i >= 0; i--) {
            const s = this.sparks[i];
            s.x += s.vx; s.y += s.vy; s.vy *= 0.94; s.vx *= 0.96; s.life--;
            if (s.life <= 0) this.sparks.splice(i, 1);
        }
        for (let i = this.debris.length - 1; i >= 0; i--) {
            const d = this.debris[i];
            d.x += d.vx; d.y += d.vy; d.vx *= 0.96; d.vy *= 0.96; d.rot += d.vr; d.life--;
            if (d.life <= 0) this.debris.splice(i, 1);
        }
        for (let i = this.rings.length - 1; i >= 0; i--) {
            const r = this.rings[i];
            r.r += 9; r.life--;
            if (r.life <= 0) this.rings.splice(i, 1);
        }
        if (this.shake > 0) this.shake--;
    }

    // ---------------- Nhận sát thương ----------------
    // dmg đã qua hệ số người chơi; who = Player thật gây dame (có thể null)
    damageCar(c, dmg, who) {
        if (!c || c.dead || this.dying || !(dmg > 0)) return 0;
        const G = trainGeom();
        if (c.type === 'loco' && this.locoShielded()) {
            if (c.shieldHitT <= 0) {
                c.shieldHitT = 24;
                if (typeof addFloatingText === 'function') addFloatingText(c.sx + G.carW / 2, G.y0 - 6, `🛡 KHIÊN HƠI NƯỚC (phá ${3 - this.lost} toa nữa)`, '#bae6fd', 12);
            }
            return 0;
        }
        const hook = this.cfg.hooks && this.cfg.hooks.carHit;
        if (hook) dmg = hook(this, c, dmg);
        dmg *= this.armor;
        dmg = Math.min(dmg, TRAIN_HIT_CAP);
        c.hp -= dmg;
        c.flash = 6;
        if (c.hp <= 0.001) this.destroyCar(c, who);
        return dmg;
    }

    destroyCar(c, who) {
        if (c.dead) return;
        const G = trainGeom();
        c.dead = true; c.hp = 0; c.act = null; c.deathT = 0;
        this.lost++;
        const cx = c.sx + G.carW / 2;
        this.blast(cx, G.cy, 1);
        if (typeof addFloatingText === 'function') addFloatingText(cx, G.y0 - 14, `💥 PHÁ ${TRAIN_CAR_TYPES[c.type].name}!`, '#ffb703', 16);
        if (typeof TrainMode !== 'undefined') TrainMode.onCarDestroyed(this, c, who);
        const L = this.loco();
        if (c.type === 'loco' || this.cars.every(x => x.dead)) this.startDying();
        else if (L && !L.dead && this.lost === 3 && typeof addFloatingText === 'function') {
            addFloatingText(G.W / 2, G.y0 - 30, '⚠ KHIÊN ĐẦU TÀU ĐÃ VỠ!', '#ff5d5d', 16);
        }
    }

    blast(x, y, big) {
        const G = trainGeom();
        const qm = (typeof Quality !== 'undefined') ? Quality.particleMult : 1;
        explosions.push(new Explosion(x, y, 70 * big + 30, 'rgba(255,140,0,', 0, null));
        explosions.push(new Explosion(x + (Math.random() - 0.5) * 50, y + (Math.random() - 0.5) * 20, 50 * big + 20, 'rgba(255,60,20,', 0, null));
        const cols = ['#3b4252', '#6b7280', '#1f2937', '#ff8c1a', '#9ca3af'];
        const n = Math.round(22 * qm * big) + 4;
        for (let i = 0; i < n; i++) {
            const a = Math.random() * Math.PI * 2, sp = 2 + Math.random() * 6;
            this.debris.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.8, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.5, life: 40 + Math.random() * 30, max: 70, size: 3 + Math.random() * 7, color: cols[i % cols.length] });
        }
        this.rings.push({ x, y, r: 12, life: 22, max: 22, fire: 1 });
        if (typeof triggerScreenShake === 'function') triggerScreenShake(11 * big, 22);
        if (soundSystem && !soundSystem.muted && soundSystem.playExplosion) soundSystem.playExplosion();
        if (typeof spawnSparkParticles === 'function') spawnSparkParticles(x, y, '#ffcf5a', Math.round(16 * qm));
    }

    startDying() {
        if (this.dying) return;
        this.dying = 1;
        this.bullets = [];
        bodyEffects.forEach(e => { if (e instanceof TrainShell || e instanceof TrainDash) e.active = false; });
        if (typeof TrainMode !== 'undefined') TrainMode.onBossDying(this);
    }

    updateDying(G) {
        this.dying++;
        if (this.dying % 14 === 0 && this.dying < 120) {
            const vis = this.cars.filter(c => c.vis || (c.sx > -G.carW && c.sx < G.W));
            const c = vis[Math.floor(Math.random() * vis.length)];
            if (c) this.blast(c.sx + G.carW * (0.2 + Math.random() * 0.6), G.cy + (Math.random() - 0.5) * G.carH * 0.6, 0.7);
        }
        if (this.dying === 150 && typeof TrainMode !== 'undefined') TrainMode.onBossDefeated(this);
    }

    draw() { if (typeof trainArtOver === 'function') trainArtOver(this); }
}

const TRAIN_HIT_CAP = 4; // trần dame 1 lần chạm (chiêu kết liễu 999 -> 4)

// Tường Sniper chặn tia / đạn boss giữa tàu và người chơi
function trainWallBlocks(x, yFrom, yTo) {
    if (typeof sniperWalls === 'undefined') return false;
    const lo = Math.min(yFrom, yTo), hi = Math.max(yFrom, yTo);
    return sniperWalls.some(w => w && w.active && x >= w.x && x <= w.x + w.w && w.y + w.h > lo && w.y < hi);
}

// ---------------- Quả cối Pháo Kích ----------------
class TrainShell {
    constructor(fx, fy, x, y, delay, dmg, targetId) {
        this.fx = fx; this.fy = fy; this.x = x; this.y = y;
        this.delay = delay; this.maxDelay = delay; this.dmg = dmg; this.targetId = targetId;
        this.r = 34; this.boom = 0; this.active = true;
    }
    update() {
        if (!this.active) return;
        if (this.delay > 0) {
            if (--this.delay === 0) {
                TrainMode.livePlayers().forEach(p => {
                    const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
                    if (Math.abs(cx - this.x) < this.r + p.w / 2 - 4 && Math.abs(cy - this.y) < 40) p.takeDamage(this.dmg, TrainMode.proxyFor(p));
                });
                explosions.push(new Explosion(this.x, this.y, 46, 'rgba(255,120,30,', 0, null));
                if (typeof triggerScreenShake === 'function') triggerScreenShake(4, 8);
                if (soundSystem && !soundSystem.muted && soundSystem.playExplosion) soundSystem.playExplosion();
                this.boom = 1;
            }
            return;
        }
        if (++this.boom > 14) this.active = false;
    }
    draw() { if (typeof trainArtShell === 'function') trainArtShell(this); }
}

// ---------------- Lính ----------------
class TrainMinion {
    constructor(kind, x, y, side, dmgMult, hpMult) {
        this.kind = kind; this.x = x - 9; this.y = y; this.w = 18; this.h = 18;
        this.side = side; // 1 = xuống làn P1, -1 = lên làn P2
        this.dmgMult = dmgMult || 1;
        this.maxHp = Math.round((kind === 'runner' ? 1 : 1.6) * Math.max(1, Math.sqrt(hpMult || 1)) * 10) / 10;
        this.hp = this.maxHp; this.t = 0; this.cd = 70 + Math.random() * 40; this.flash = 0;
        this.face = 0; this.active = true; this.isTrainMinion = true;
        this.holdY = null;
    }
    target() {
        const list = TrainMode.livePlayers();
        const mine = list.filter(p => (p.id === 1) === (this.side > 0));
        return mine[0] || null;
    }
    update() {
        if (!this.active) return;
        this.t++;
        if (this.flash > 0) this.flash--;
        const G = trainGeom();
        const p = this.target();
        const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
        if (TrainMode.state !== 'fight') { this.y += this.side * 0.3; }
        else if (this.kind === 'runner') {
            if (p) {
                const tx = p.x + p.w / 2, ty = p.y + p.h / 2;
                const dx = tx - cx, dy = ty - cy, L = Math.hypot(dx, dy) || 1;
                const sp = 1.45;
                this.x += dx / L * sp; this.y += dy / L * sp; this.face = Math.atan2(dy, dx);
                if (L < 22) {
                    p.takeDamage(TRAIN_DMG.runner * this.dmgMult, TrainMode.proxyFor(p));
                    explosions.push(new Explosion(cx, cy, 40, 'rgba(255,80,40,', 0, null));
                    this.active = false;
                }
            } else this.y += this.side * 1.2;
        } else {
            // Lính Súng: tiến tới 40% quãng đường rồi đứng bắn, lách ngang theo mục tiêu
            if (this.holdY === null) this.holdY = this.side > 0 ? G.y1 + (G.H - G.y1) * 0.36 : G.y0 - G.y0 * 0.36;
            if ((this.holdY - this.y) * this.side > 1) this.y += this.side * 1.1;
            if (p) {
                const tx = p.x + p.w / 2;
                if (Math.abs(tx - cx) > 30) this.x += Math.sign(tx - cx) * 0.5;
                this.face = Math.atan2((p.y + p.h / 2) - cy, tx - cx);
                if (--this.cd <= 0 && TrainMode.boss) {
                    this.cd = 95;
                    const sp = 3, a = this.face;
                    TrainMode.boss.bullets.push({ x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: 3.6, dmg: TRAIN_DMG.gunner * this.dmgMult, side: this.side, kind: 'gun', t: 0 });
                }
            }
        }
        this.x = Math.max(0, Math.min(G.W - this.w, this.x));
        if (this.y < -30 || this.y > G.H + 30) this.active = false;
    }
    hit(dmg, who) {
        if (!this.active) return;
        this.hp -= dmg; this.flash = 5;
        if (this.hp <= 0) {
            this.active = false;
            explosions.push(new Explosion(this.x + this.w / 2, this.y + this.h / 2, 30, 'rgba(120,255,120,', 0, null));
            if (typeof TrainMode !== 'undefined') TrainMode.onMinionKilled(this, who);
        }
    }
    draw() { if (typeof trainArtMinion === 'function') trainArtMinion(this); }
}

// ---------------- Xông Ga ----------------
class TrainDash {
    constructor(targetId, laneY, warn, dmg, px) {
        this.targetId = targetId; this.laneY = laneY; this.warn = warn; this.maxWarn = warn; this.dmg = dmg;
        this.t = 0; this.run = 0; this.active = true; this.hitIds = [];
        const W = canvas.width, gw = 58;
        // 2 khe an toàn: 1 khe cách người chơi vừa phải, 1 khe ngẫu nhiên
        const a = Math.max(gw / 2 + 6, Math.min(W - gw / 2 - 6, px + (Math.random() < 0.5 ? -1 : 1) * (70 + Math.random() * 60)));
        let b = 20 + gw / 2 + Math.random() * (W - gw - 40);
        if (Math.abs(b - a) < gw * 1.4) b = a > W / 2 ? a - gw * 2.2 : a + gw * 2.2;
        b = Math.max(gw / 2 + 6, Math.min(W - gw / 2 - 6, b));
        this.gaps = [{ x: a, w: gw }, { x: b, w: gw }];
        this.dir = Math.random() < 0.5 ? 1 : -1;
    }
    inGap(x) { return this.gaps.some(g => Math.abs(x - g.x) < g.w / 2 - 6); }
    update() {
        if (!this.active) return;
        this.t++;
        if (this.warn > 0) { this.warn--; return; }
        this.run++;
        const W = canvas.width, dur = 26;
        const headX = this.dir > 0 ? -80 + (W + 160) * (this.run / dur) : W + 80 - (W + 160) * (this.run / dur);
        this.headX = headX;
        TrainMode.livePlayers().forEach(p => {
            if (p.id !== this.targetId || this.hitIds.includes(p.id)) return;
            const cx = p.x + p.w / 2;
            const passed = this.dir > 0 ? headX >= cx : headX <= cx;
            if (!passed) return;
            this.hitIds.push(p.id);
            if (this.inGap(cx)) { if (typeof addFloatingText === 'function') addFloatingText(cx, p.y - 16, 'NÉ ĐƯỢC! ✨', '#86efac', 12); return; }
            p.takeDamage(this.dmg, TrainMode.proxyFor(p));
            if (typeof triggerScreenShake === 'function') triggerScreenShake(8, 14);
        });
        if (this.run === 1 && soundSystem && !soundSystem.muted && soundSystem.playDash) soundSystem.playDash();
        if (this.run > dur + 12) this.active = false;
    }
    draw() { if (typeof trainArtDash === 'function') trainArtDash(this); }
}
