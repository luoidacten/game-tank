// ==========================================
// MẢNH KÝ ỨC 1 — THE TRAIN: luồng chế độ + MỤC TIÊU THAY THẾ (proxy) cho chiêu body
// ------------------------------------------
// Ý tưởng proxy: rất nhiều chiêu body nhắm "xe địch" qua biến toàn cục p2 / p1 (hoặc owner.id===1?p2:p1).
// Khi đánh boss, kẻ địch của người chơi là 1 Player "giả" (isTrainProxy, weapon basic, không vẽ, không điều khiển):
//   - mỗi tick đặt x/y/w/h/hp/maxHp của proxy = toa gần nhất đang lộ trong màn hình (toa đang bị bắn trúng);
//   - mọi máu proxy bị trừ (takeDamage, chảy máu, nổ, hp -= ...) được đo bằng chênh lệch rồi chuyển sang toa;
//   - đạn của người chơi được kiểm tra va chạm lần lượt với TỪNG toa lộ diện (gọi checkHits gốc với proxy đặt ở toa đó)
//     nên hiệu ứng trúng đạn của body (choáng, đốt, nổ...) vẫn chạy y nguyên;
//   - choáng/đóng băng proxy -> toa tương ứng bị khựng (không bắn).
// Chơi 1 mình: p2 (toàn cục) = proxyA trong lúc đánh. Co-op: p2 = proxyA trong tick chung (P1 nhìn thấy proxy),
// xe P2 thật được chạy riêng với p1 = proxyB (kẻ địch của P2). Đòn/CC đồng đội gây cho nhau được chuyển sang toa / huỷ.
// ==========================================

const TrainMode = {
    active: false, coop: false,
    state: 'idle',            // idle | fight | won | lost
    phase: 1, variantId: 'p1',
    run: null,                // dữ liệu cả lượt chơi (buff, thống kê)
    realP1: null, realP2: null, dummyP2: null, proxyA: null, proxyB: null, boss: null,
    pendingMemory: false, memoryCards: null,
    bannerT: 0, endT: 0, phaseTicks: 0,
    saved: null,

    // ---------- tiện ích ----------
    fighting() { return this.active && !!this.boss && gameState.phase === 'playing' && (this.state === 'fight' || this.state === 'won' || this.state === 'lost'); },
    isReal(p) { return !!p && (p === this.realP1 || (this.coop && p === this.realP2)); },
    realPlayers() { return [this.realP1, this.coop ? this.realP2 : null].filter(Boolean); },
    livePlayers() { return this.realPlayers().filter(p => p.hp > 0 && !p.trainDowned); },
    proxyFor(p) {
        if (!p) return this.proxyA;
        if (p === this.realP2 || p === this.proxyA) return this.proxyB || this.proxyA;
        return this.proxyA;
    },
    partnerOf(p) { return p === this.realP1 ? (this.coop ? this.realP2 : null) : this.realP1; },
    buffCount(id) { return this.run ? this.run.buffs.filter(b => b === id).length : 0; },
    withP2(fn) {
        const s1 = p1, s2 = p2;
        p1 = this.proxyB || s1; p2 = this.realP2;
        try { return fn(); } finally { p1 = s1; p2 = s2; }
    },

    // ---------- bắt đầu / thoát ----------
    start(coop) {
        if (typeof onlineManager !== 'undefined' && onlineManager.isOnline) return;
        this.active = true; this.coop = !!coop;
        this.phase = 1; this.variantId = 'p1'; this.state = 'idle';
        this.pendingMemory = false; this.memoryCards = null;
        this.run = { buffs: [], bossBuffs: [], revives: 0, mechAmmo: 0, cars: 0, minions: 0, deaths: 0, history: [{ phase: 1, variant: 'p1' }], startedAt: Date.now() };
        if (!this.saved) this.saved = { winScore: gameState.winScore, map: gameState.selectedMapMode };
        gameState.winScore = 3; gameState.selectedMapMode = 'classic';
        if (typeof botAI !== 'undefined') { botAI.enabled = false; }
        if (typeof PVE !== 'undefined' && PVE.active) PVE.exit();
        const p2c = document.getElementById('p2-controls');
        if (p2c) p2c.style.display = this.coop ? 'flex' : 'none';
        const p1Label = document.querySelector('.p1-tag');
        if (p1Label) p1Label.innerHTML = this.coop ? '🔵 P1 · MẢNH KÝ ỨC (CO-OP)' : '🔵 BẠN · 🚂 MẢNH KÝ ỨC 1';
        document.body.classList.add('train-mode');
        document.body.classList.toggle('train-solo', !this.coop);
        if (typeof TrainUI !== 'undefined') TrainUI.closeAll();
        startBattle();
        if (typeof updateCanvasDimensions === 'function') updateCanvasDimensions();
    },

    exit() {
        if (!this.active) return;
        this.restoreGlobals();
        this.active = false; this.state = 'idle'; this.boss = null;
        this.proxyA = this.proxyB = null;
        if (this.saved) { gameState.winScore = this.saved.winScore; gameState.selectedMapMode = this.saved.map; this.saved = null; }
        document.body.classList.remove('train-mode', 'train-solo');
        const p2c = document.getElementById('p2-controls');
        if (p2c) p2c.style.display = 'flex';
        if (typeof TrainUI !== 'undefined') TrainUI.closeAll();
    },

    backToMenu() {
        this.exit();
        const back = document.getElementById('backToMainMenuBtn');
        if (back) back.click();
    },

    restoreGlobals() {
        if (this.realP1) p1 = this.realP1;
        if (this.coop && this.realP2) p2 = this.realP2;
        else if (this.dummyP2) p2 = this.dummyP2;
    },

    // ---------- proxy ----------
    makeProxy(id) {
        const pr = new Player(id, id === 1 ? '#3498db' : '#e74c3c');
        pr.mainEgg = false;
        pr.addUpgrade('basic');
        pr.isTrainProxy = true;
        pr._car = null; pr._hpRef = 10;
        return pr;
    },
    primaryCarFor(p) {
        const B = this.boss;
        if (!B || !p) return null;
        const vis = B.visibleAlive();
        if (!vis.length) return null;
        const G = trainGeom(), px = p.x + p.w / 2;
        let best = null, bd = 1e9;
        for (const c of vis) {
            const d = Math.abs(c.sx + G.carW / 2 - px) - (px >= c.sx && px < c.sx + G.carW ? 1e5 : 0);
            if (d < bd) { bd = d; best = c; }
        }
        return best;
    },
    syncProxy(pr, car, owner) {
        if (!pr) return;
        const G = trainGeom();
        if (car && !car.dead) {
            pr.x = car.sx + 5; pr.w = G.carW - 10;
            pr.y = G.y0 + 3; pr.h = G.carH - 6;
            pr.maxHp = Math.max(0.1, car.maxHp);
            pr.hp = Math.max(0.01, car.hp);
            pr._car = car;
        } else {
            const ox = owner ? owner.x + owner.w / 2 : G.W / 2;
            pr.w = 70; pr.x = Math.max(0, Math.min(G.W - pr.w, ox - 35));
            pr.y = G.y0 + 3; pr.h = G.carH - 6;
            pr.maxHp = 10; pr.hp = 10;
            pr._car = null;
        }
        pr.invincibleTimer = 0; pr.shield = 0;
        pr._hpRef = pr.hp;
    },
    // Chuyển phần máu proxy đã mất sang toa
    collect(pr, who) {
        if (!pr) return;
        const d = pr._hpRef - pr.hp;
        const car = pr._car;
        if (d > 0.0005 && car && this.boss && this.state === 'fight') {
            let dmg = d * Math.pow(1.35, this.buffCount('pha_ray'));
            this.boss.damageCar(car, dmg, who);
            if (car.type === 'loco' && this.buffCount('tin_hieu_do') && !this.boss.locoShielded()) {
                if (this.boss.extendStop(90) && typeof addFloatingText === 'function') addFloatingText(car.sx + trainGeom().carW / 2, trainGeom().y1 + 16, '🚦 TÍN HIỆU ĐỎ: +1.5s', '#ff6b6b', 12);
            }
        }
        // choáng / đóng băng proxy -> toa khựng lại
        if (car && !car.dead) {
            const cc = Math.max(pr.freezeTimer || 0, pr.stunTimer || 0);
            if (cc > 0) car.stun = Math.max(car.stun, Math.min(90, cc));
        }
        this.syncProxy(pr, car && !car.dead ? car : null, who);
    },

    // Đạn người chơi: chặn bởi tàu đang chạy / xác toa, trúng lính, rồi kiểm tra từng toa lộ diện
    playerHits(att, orig) {
        const B = this.boss, pr = this.proxyFor(att);
        if (!B || !pr) return orig(att, pr || p2);
        this.collect(pr, att); // dame từ chiêu trong lúc update xe (trước khi proxy bị dời sang toa khác)
        const G = trainGeom();
        const bl = att.bullets || [];
        const minions = bodyEffects.filter(e => e instanceof TrainMinion && e.active);
        const mult = Math.pow(1.35, this.buffCount('pha_ray'));
        for (let i = bl.length - 1; i >= 0; i--) {
            const b = bl[i];
            if (!b || typeof b.x !== 'number') continue;
            const bw = b.w || 4, bh = b.h || 4;
            // lính
            let used = false;
            for (const m of minions) {
                if (!m.active) continue;
                if (b.x < m.x + m.w && b.x + bw > m.x && b.y < m.y + m.h && b.y + bh > m.y) {
                    if (!b._trainHit) b._trainHit = [];
                    if (b._trainHit.includes(m)) continue;
                    b._trainHit.push(m);
                    m.hit((b.dmg || 1) * mult, att);
                    if (!b.isPiercing) { bl.splice(i, 1); used = true; break; }
                }
            }
            if (used) continue;
            // dải đường ray
            const cy = b.y + bh / 2;
            if (cy < G.y0 + 2 || cy > G.y1 - 2) continue;
            const bx = b.x + bw / 2;
            if (B.moving() || B.dying) {
                bl.splice(i, 1);
                if (Math.random() < 0.5 && typeof spawnSparkParticles === 'function') spawnSparkParticles(bx, cy, '#cbd5e1', 2);
                continue;
            }
            const c = B.carAtX(bx, G);
            if (c && c.dead) { bl.splice(i, 1); if (typeof spawnSparkParticles === 'function') spawnSparkParticles(bx, cy, '#ff8c42', 2); }
        }
        // từng toa lộ diện
        const primary = pr._car;
        const vis = B.visibleAlive();
        for (const c of vis) {
            if (c === primary) continue;
            this.syncProxy(pr, c, att);
            orig(att, pr);
            this.collect(pr, att);
        }
        this.syncProxy(pr, primary && !primary.dead ? primary : this.primaryCarFor(att), att);
        orig(att, pr);
        this.collect(pr, att);
        this.syncProxy(pr, this.primaryCarFor(att), att);
    },

    // ---------- tick ----------
    preTick() {
        crates = []; moneyTrucks = []; movingObstacle = null;
        lastCrateSpawn = Date.now(); gameState.lastObstacleSpawn = Date.now();
        if (!this.coop && inputs.p2) { inputs.p2.l = inputs.p2.r = inputs.p2.s = false; inputs.p2.k = false; }
        p1 = this.realP1; p2 = this.proxyA;
        this.syncProxy(this.proxyA, this.primaryCarFor(this.realP1), this.realP1);
        if (this.proxyB) this.syncProxy(this.proxyB, this.primaryCarFor(this.realP2), this.realP2);
        if (this.coop) this.snapCC();
        this.phaseTicks++;
        if (this.bannerT > 0) this.bannerT--;
    },
    postTick() {
        if (this.coop && this.realP2 && gameState.phase === 'playing') {
            const P2 = this.realP2;
            this.withP2(() => {
                if (typeof EvoSystem !== 'undefined') EvoSystem.tick(P2);
                P2.update();
                checkHits(P2, this.proxyB);
                commitStatuses(P2);
                if (this.proxyB) { this.proxyB.update(); commitStatuses(this.proxyB); }
            });
        }
        this.collect(this.proxyA, this.realP1);
        if (this.proxyB) this.collect(this.proxyB, this.realP2);
        if (this.coop) this.guardCC();
        this.realPlayers().forEach(p => { if (p.hp <= 0 && !p.trainDowned) this.handleLethal(p); });
        // hồi sinh đồng đội không được quá 1 lúc, kéo P2 về làn
        if (this.state === 'lost' || this.state === 'won') {
            this.endT++;
            if (this.state === 'lost' && this.endT === 110) this.finishLost();
        }
    },

    // CC do đồng đội gây ra (chiêu nhắm "xe địch" trúng nhầm đồng đội) -> huỷ
    CC_KEYS: ['freezeTimer', 'stunTimer', 'silenceTimer', 'blindTimer', 'rootTimer', 'confusionStacks', 'groundedTimer'],
    snapCC() {
        this.realPlayers().forEach(p => { p._trainCCsnap = this.CC_KEYS.map(k => p[k] || 0); p._trainCCok = false; });
    },
    guardCC() {
        this.realPlayers().forEach(p => {
            if (!p._trainCCsnap || p._trainCCok) return;
            this.CC_KEYS.forEach((k, i) => {
                const was = p._trainCCsnap[i];
                if ((p[k] || 0) > was + 1) p[k] = Math.max(0, was - 1);
            });
        });
    },

    // ---------- chết / Hồn Ký Ức ----------
    handleLethal(p) {
        if (!this.isReal(p) || p.trainDowned || this.state !== 'fight') return;
        if (this.run.revives > 0) {
            this.run.revives--;
            p.hp = Math.max(1, p.maxHp * 0.5); p.invincibleTimer = 120;
            if (typeof addFloatingText === 'function') addFloatingText(p.x + p.w / 2, p.y - 20, '🎟️ VÉ KHỨ HỒI! HỒI SINH', '#fde047', 15);
            if (typeof spawnSparkParticles === 'function') spawnSparkParticles(p.x + p.w / 2, p.y + p.h / 2, '#fde047', 20);
            if (soundSystem && !soundSystem.muted && soundSystem.playRevive) soundSystem.playRevive();
            return;
        }
        const mate = this.partnerOf(p);
        if (this.coop && mate && mate.hp > 0 && !mate.trainDowned) {
            p.trainDowned = true; p.hp = 0.01; p.invincibleTimer = 99999; p.bullets = [];
            this.run.deaths++;
            explosions.push(new Explosion(p.x + p.w / 2, p.y + p.h / 2, 60, 'rgba(160,200,255,', 0, null));
            if (typeof addFloatingText === 'function') addFloatingText(p.x + p.w / 2, p.y - 20, '👻 HỒN KÝ ỨC — đồng đội phá 1 toa để cứu!', '#a5b4fc', 13);
            return;
        }
        this.run.deaths++;
        this.state = 'lost'; this.endT = 0;
        p.hp = 0;
        explosions.push(new Explosion(p.x + p.w / 2, p.y + p.h / 2, 90, 'rgba(255,80,40,', 0, null));
        if (typeof triggerScreenShake === 'function') triggerScreenShake(10, 20);
        this.bannerT = 0;
    },
    revive(p) {
        if (!p || !p.trainDowned) return;
        p.trainDowned = false; p.hp = Math.max(1, p.maxHp * 0.5); p.invincibleTimer = 90;
        if (typeof addFloatingText === 'function') addFloatingText(p.x + p.w / 2, p.y - 20, '💖 ĐỒNG ĐỘI HỒI SINH!', '#f9a8d4', 15);
        if (typeof spawnSparkParticles === 'function') spawnSparkParticles(p.x + p.w / 2, p.y + p.h / 2, '#f9a8d4', 18);
        if (soundSystem && !soundSystem.muted && soundSystem.playRevive) soundSystem.playRevive();
    },

    // ---------- sự kiện boss ----------
    onTrainStateChange(s) {
        if (this.state !== 'fight') return;
        const n = this.buffCount('khoi_san_ga');
        if (n) this.livePlayers().forEach(p => { p.invincibleTimer = Math.max(p.invincibleTimer || 0, 30 * n); });
    },
    coinsTo(who, amount) {
        const ids = who ? [who.id] : this.realPlayers().map(p => p.id);
        ids.forEach(id => { if (id === 1) gameState.p1Coins += amount; else gameState.p2Coins += amount; });
    },
    onCarDestroyed(B, car, who) {
        this.run.cars++;
        const G = trainGeom();
        const coins = car.type === 'loco' ? 60 : 30;
        if (this.coop) { gameState.p1Coins += coins; gameState.p2Coins += coins; } else gameState.p1Coins += coins;
        if (typeof addFloatingText === 'function') addFloatingText(car.sx + G.carW / 2, G.y1 + 18, `+${coins}$`, '#ffd700', 15);
        const mech = this.buffCount('tho_may');
        if (mech) {
            this.run.mechAmmo += mech;
            this.realPlayers().forEach(p => { p.maxAmmo += mech; p.ammo = Math.min(p.maxAmmo, (p.ammo || 0) + mech); });
        }
        this.realPlayers().forEach(p => this.revive(p));
    },
    onMinionKilled(m, who) {
        this.run.minions++;
        this.coinsTo(who, 6);
        if (typeof addFloatingText === 'function') addFloatingText(m.x + m.w / 2, m.y - 8, '+6$', '#ffd700', 11);
    },
    onBossDying() {
        if (this.state !== 'fight') return;
        this.state = 'won'; this.endT = 0;
        this.realPlayers().forEach(p => { if (p.trainDowned) this.revive(p); p.invincibleTimer = 9999; });
        bodyEffects.forEach(e => { if (e instanceof TrainMinion) e.hit(99, null); });
    },
    onBossDefeated() {
        if (!this.active) return;
        const bonus = 100 + 20 * this.phase;
        if (this.coop) { gameState.p1Coins += bonus; gameState.p2Coins += bonus; } else gameState.p1Coins += bonus;
        this.endPhaseCommon('win');
        if (this.phase >= 3) {
            setTimeout(() => { if (typeof TrainUI !== 'undefined') TrainUI.showVictory(); }, 300);
            return;
        }
        this.phase++;
        this.pendingMemory = true;
        this.memoryCards = trainBuildMemoryCards(this.phase);
        gameState.round++;
        setTimeout(() => { if (this.active) { showUpgradeScreen(); } }, 900);
        if (typeof TrainUI !== 'undefined') TrainUI.flash(`PHASE ${this.phase - 1} HOÀN THÀNH  +${bonus}$`);
    },
    finishLost() {
        this.endPhaseCommon('lose');
        if (typeof TrainUI !== 'undefined') TrainUI.showLost();
    },
    endPhaseCommon(result) {
        gameState.phase = 'end_round';
        cancelAnimationFrame(animationId);
        this.realPlayers().forEach(p => { p.trainDowned = false; try { CharHooks.call(p, 'roundEnd', result); } catch (e) {} });
        this.restoreGlobals();
        this.boss = null;
        this.state = 'idle';
        if (typeof updateScoreBoard === 'function') updateScoreBoard();
    },
    retryPhase() {
        if (typeof TrainUI !== 'undefined') TrainUI.closeAll();
        this.restoreGlobals();
        startRound();
    },

    // ---------- dựng Phase (gọi trong startRound) ----------
    beginPhase(origStartRound) {
        this.realP1 = p1;
        if (this.coop) { this.realP2 = p2; this.dummyP2 = null; }
        else { this.dummyP2 = p2; this.realP2 = null; }
        this.proxyA = this.makeProxy(2);
        this.proxyB = this.coop ? this.makeProxy(1) : null;
        p2 = this.proxyA;
        origStartRound();
        if (this.coop) this.withP2(() => this.realP2.setupForNewRound());
        if (this.proxyB) this.proxyB.setupForNewRound();
        gameState.currentMap = 'classic'; bastions = []; artilleryHazards = [];
        const badge = document.getElementById('hudMapBadge');
        if (badge) badge.innerText = '🚂 THE TRAIN';
        const rb = document.getElementById('hudRoundBadge');
        if (rb) rb.innerText = `MẢNH KÝ ỨC 1 • PHASE ${this.phase}/3`;
        const banner = document.getElementById('roundIntroBanner');
        if (banner) banner.classList.remove('show');
        // Phase 2/3: biến thể theo thẻ đã chọn (chưa làm -> dự phòng = Phase 1 tăng chỉ số)
        const v = TRAIN_VARIANTS[this.variantId] || TRAIN_VARIANTS.p1;
        this.boss = new TrainBoss({ variant: v.id, phase: this.phase, coop: this.coop, bossBuffs: this.run.bossBuffs });
        bodyEffects.push(this.boss);
        const hook = v.hooks && v.hooks.setup;
        if (hook) hook(this.boss);
        // Buff người chơi
        this.realPlayers().forEach(p => {
            p.trainDowned = false;
            const hpN = this.buffCount('ve_hang_nhat');
            if (hpN) { p.maxHp += 2 * hpN; p.hp = p.maxHp; }
            if (this.run.mechAmmo) { p.maxAmmo += this.run.mechAmmo; p.ammo = p.maxAmmo; }
            p.invincibleTimer = Math.max(p.invincibleTimer || 0, 60);
        });
        this.syncProxy(this.proxyA, null, this.realP1);
        if (this.proxyB) this.syncProxy(this.proxyB, null, this.realP2);
        this.state = 'fight'; this.endT = 0; this.phaseTicks = 0;
        this.bannerT = 170;
        gameState.roundStartTime = Date.now();
    },

    applyMemoryCard(card) {
        if (!card) return;
        this.run.buffs.push(card.playerBuff);
        if (card.playerBuff === 've_khu_hoi') this.run.revives++;
        card.bossBuffs.forEach(b => this.run.bossBuffs.push(b));
        this.variantId = card.variant;
        this.run.history.push({ phase: this.phase, variant: card.variant, buff: card.playerBuff, boss: card.bossBuffs.slice(), star: card.star });
        this.pendingMemory = false;
        this.memoryCards = null;
    },
};

// ==========================================
// Bọc các hàm gốc (chỉ có tác dụng khi TrainMode.active)
// ==========================================
(function installTrainWrappers() {
    const _tick = tickPhysics;
    tickPhysics = function () {
        const TM = TrainMode;
        const guest = typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest';
        if (!TM.active || !TM.boss || guest || gameState.phase !== 'playing') return _tick.apply(this, arguments);
        TM.preTick();
        _tick.apply(this, arguments);
        if (TM.active && TM.boss && gameState.phase === 'playing') TM.postTick();
    };

    const _ch = checkHits;
    checkHits = function (att, vic) {
        const TM = TrainMode;
        if (!TM.fighting() || !att) return _ch(att, vic);
        if (att.isTrainProxy) return;                    // proxy không có đạn
        if (TM.isReal(att)) return TM.playerHits(att, _ch);
        // vật khác (vd bản sao) bắn vào đồng đội -> chuyển sang proxy
        if (TM.isReal(vic)) return _ch(att, TM.proxyFor(att.owner || att));
        return _ch(att, vic);
    };

    const _tf = triggerFatalCinematic;
    triggerFatalCinematic = function (winnerId, victim) {
        const TM = TrainMode;
        if (!TM.active || !TM.boss || gameState.phase !== 'playing') return _tf.apply(this, arguments);
        if (victim && victim.isTrainProxy) return;       // toa bị phá: TrainBoss tự xử lý
        if (victim && TM.isReal(victim)) TM.handleLethal(victim);
    };

    const _sr = startRound;
    startRound = function () {
        const TM = TrainMode;
        if (!TM.active) return _sr.apply(this, arguments);
        if (TM.pendingMemory) {
            document.getElementById('upgradeScreen').style.display = 'none';
            if (typeof TrainUI !== 'undefined') TrainUI.showMemoryPick(TM.memoryCards, (card) => { TM.applyMemoryCard(card); startRound(); });
            return;
        }
        if (typeof TrainUI !== 'undefined') TrainUI.closeAll();
        TM.beginPhase(() => _sr.apply(this, arguments));
    };

    const _er = endRound;
    endRound = function (winnerId) {
        if (TrainMode.active) return; // chế độ boss tự kết Phase
        return _er.apply(this, arguments);
    };

    const _zone = getZoneState;
    getZoneState = function (tp) {
        if (TrainMode.active) return null; // không có bo khi đánh boss
        return _zone.apply(this, arguments);
    };

    const _sus = showUpgradeScreen;
    showUpgradeScreen = function () {
        const TM = TrainMode;
        if (TM.active) TM.restoreGlobals();
        const r = _sus.apply(this, arguments);
        if (TM.active) {
            const title = document.getElementById('roundTitleText');
            if (title) {
                if (gameState.round === 1) title.innerText = '🚂 MẢNH KÝ ỨC 1 — CHỌN BODY';
                else title.innerText = `🛒 CỬA HÀNG TRƯỚC PHASE ${TM.phase} (P1: $${gameState.p1Coins}${TM.coop ? ` · P2: $${gameState.p2Coins}` : ''})`;
            }
            if (!TM.coop) {
                // chơi 1 mình: P2 là xe giả, tự sẵn sàng
                const bodyIds = MODULES.BODY.map(m => m.id);
                if (p2 && !(p2.upgrades || []).some(u => bodyIds.includes(u))) p2.addUpgrade('basic');
                gameState.p2Ready = true;
            }
            if (typeof TrainUI !== 'undefined') TrainUI.decorateShop();
        }
        return r;
    };

    // Player: proxy không điều khiển, không vẽ; Hồn Ký Ức đứng yên
    const P = Player.prototype;
    const _upd = P.update;
    P.update = function () {
        if (this.isTrainProxy) {
            const k = this.id === 1 ? 'p1' : 'p2';
            const saved = inputs[k];
            inputs[k] = { l: false, r: false, s: false, k: false };
            try { return _upd.apply(this, arguments); } finally { inputs[k] = saved; }
        }
        if (this.trainDowned) { this.bullets = []; return; }
        if (TrainMode.active && TrainMode.state === 'lost' && this.hp <= 0) return;
        return _upd.apply(this, arguments);
    };
    const _draw = P.draw;
    P.draw = function () {
        if (this.isTrainProxy) return;
        if (this.trainDowned) {
            ctx.save(); ctx.globalAlpha = 0.35;
            try { _draw.apply(this, arguments); } finally { ctx.restore(); }
            if (typeof trainArtGhost === 'function') trainArtGhost(this);
            return;
        }
        return _draw.apply(this, arguments);
    };
    const _td = P.takeDamage;
    P.takeDamage = function (amount, attacker, options) {
        const TM = TrainMode;
        if (TM.active && TM.boss && TM.coop && TM.isReal(this)) {
            const src = attacker && (TM.isReal(attacker) ? attacker : (attacker.owner && TM.isReal(attacker.owner) ? attacker.owner : null));
            if (src && src !== this) {
                // đòn đồng đội -> chuyển sang toa (proxy của người gây đòn)
                return TM.proxyFor(src).takeDamage(amount, src, options);
            }
        }
        if (this.trainDowned) return 0;
        return _td.apply(this, arguments);
    };

    if (typeof drawSoftShadow === 'function') {
        const _ss = drawSoftShadow;
        drawSoftShadow = function (o) { if (o && o.isTrainProxy) return; return _ss.apply(this, arguments); };
    }

    const _rf = renderFrame;
    renderFrame = function () {
        const TM = TrainMode;
        if (!TM.active || !TM.boss) return _rf.apply(this, arguments);
        const s2 = p2;
        if (TM.coop && TM.realP2) p2 = TM.realP2; // vẽ xe P2 thật (và các hiệu ứng theo p2)
        else if (typeof floatingTexts !== 'undefined') floatingTexts.forEach(f => { f.side = 1; }); // 1 người: chữ không lật ngược
        try { _rf.apply(this, arguments); } finally { p2 = s2; }
        if ((gameState.phase === 'playing') && typeof trainDrawHUD === 'function') trainDrawHUD(TM.boss);
    };

    const _ucd = updateCanvasDimensions;
    updateCanvasDimensions = function () {
        const r = _ucd.apply(this, arguments);
        const TM = TrainMode;
        if (TM.active && TM.coop && TM.realP2 && gameState.phase === 'playing') TM.realP2.y = 20;
        return r;
    };

    window.addEventListener('load', () => {
        // Nút Skill Evo (EvoSystem.ui) & vòng tụ lực trên nút bắn: dùng xe P2 thật khi co-op
        if (typeof EvoSystem !== 'undefined' && EvoSystem.ui) {
            const _ui = EvoSystem.ui;
            EvoSystem.ui = function () {
                const TM = TrainMode;
                if (!TM.active || !TM.coop || !TM.realP2) return _ui.apply(this, arguments);
                const s2 = p2; p2 = TM.realP2;
                try { return _ui.apply(this, arguments); } finally { p2 = s2; }
            };
        }
        if (typeof empLocalButtons === 'function') {
            const _elb = empLocalButtons;
            empLocalButtons = function () {
                const out = _elb.apply(this, arguments);
                const TM = TrainMode;
                if (!TM.active) return out;
                if (!TM.coop) return out.filter(e => e[0].indexOf('#p2') !== 0);
                return out.map(e => e[0].indexOf('#p2') === 0 ? [e[0], TM.realP2 || e[1]] : e);
            };
        }
        // Về menu chính từ menu tạm dừng -> thoát chế độ
        const back = document.getElementById('backToMainMenuBtn');
        if (back) back.addEventListener('click', () => { if (TrainMode.active) TrainMode.exit(); }, true);
        const restart = document.getElementById('restartCurrentMatchBtn');
        if (restart) restart.addEventListener('click', (ev) => {
            if (!TrainMode.active) return;
            ev.stopImmediatePropagation();
            const pm = document.getElementById('pauseMenuModal'); if (pm) pm.style.display = 'none';
            gameState.isPaused = false;
            TrainMode.retryPhase();
        }, true);
    });
})();
