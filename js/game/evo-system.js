// Evo 3/4: trạng thái mô phỏng chỉ chứa dữ liệu thuần; mọi timer tính bằng tick 60 Hz.
// Hook: skill(p), ultimate(p), ultimateReady(p), rageGain(p, kind, amount).
// Trả false từ skill/ultimate để từ chối mà không tiêu CD/Nộ.
const EVO_SKILL_KEYS = { p1: 'q', p2: '/' };
const EvoSystem = {
    authoritative() { return !onlineManager.isOnline || onlineManager.role !== 'guest'; },
    config(p) { return FEATURE_EVO34 && p && p.weapon !== 'basic' ? (ownedEvos(p).find(e => e.evoSlot === 4) || {}).skill : null; },
    blocked(p) { return p.hp <= 0 || p.freezeTimer > 0 || p.stunTimer > 0 || p.silenceTimer > 0; },
    gain(p, kind, amount) {
        if (!this.config(p) || this.blocked(p) || p.ultActiveTicks > 0 || !this.authoritative() || gameState.phase !== 'playing') return;
        const custom = CharHooks.call(p, 'rageGain', p, kind, amount);
        if (custom !== undefined) amount = custom;
        p.rageUnits = Math.max(0, Math.min(10000, (p.rageUnits || 0) + Math.round((Number(amount) || 0) * 100)));
        p.rage = Math.floor(p.rageUnits / 100);
    },
    ready(p) { return CharHooks.call(p, 'ultimateReady', p) !== false; },
    tick(p) {
        if (!FEATURE_EVO34 || !p) return;
        if (p.ultBannerTicks > 0) p.ultBannerTicks--;
        const cfg = this.config(p);
        if (!cfg) { p.skillWasDown = false; return; }
        if (p.skillCd > 0) p.skillCd--;
        if (p.ultActiveTicks > 0) p.ultActiveTicks--;
        if (!this.blocked(p) && !p.ultActiveTicks) {
            p.rageTimeAcc = (p.rageTimeAcc || 0) + Math.round((cfg.rageTime ?? 4) * 100);
            const units = Math.floor(p.rageTimeAcc / 60);
            p.rageTimeAcc %= 60;
            this.gain(p, 'time', units / 100);
        }
        const down = !!inputs[p.id === 1 ? 'p1' : 'p2'].k;
        if (down && !p.skillWasDown && !this.blocked(p) && !p.ultActiveTicks) {
            if ((p.rageUnits || 0) >= 10000) {
                if (this.ready(p) && CharHooks.has(p, 'ultimate') && CharHooks.call(p, 'ultimate', p) !== false) {
                    p.rageUnits = 0; p.rage = 0;
                    p.ultActiveTicks = cfg.ultimateTicks || 60;
                    p.ultBannerTicks = 84; p.ultBannerName = cfg.ultimateName || 'TUYỆT KỸ';
                }
            } else if (!(p.skillCd > 0) && CharHooks.has(p, 'skill') && CharHooks.call(p, 'skill', p) !== false) {
                p.skillCd = Math.round((cfg.cooldown || 10) * 60);
            }
        }
        p.skillWasDown = down;
    },
    pathCount(p) { return FEATURE_EVO34 && p.hasGear('gear_evo_path_p') ? Math.min(4, ownedEvos(p).length) : 0; },
    reward(p, key, coins = 200) {
        if (p[key]) return;
        p[key] = true;
        const opp = p.id === 1 ? p2 : p1;
        addPlayerCoins(opp, coins);
        opp.evoGoldPending = (opp.evoGoldPending || 0) + 1;
        this.prepareGold(opp);
        const pid = opp.id === 1 ? 'p1' : 'p2', wasReady = gameState[`${pid}Ready`];
        gameState[`${pid}Ready`] = false;
        if (wasReady && gameState.phase === 'upgrade' && (!onlineManager.isOnline || opp.id === 1)) this.renderGold(pid, () => handlePlayerReady(pid));
        if (onlineManager.isOnline && opp.id === 2) this.sendGoldState();
    },
    reconcile() {
        if (!FEATURE_EVO34 || !this.authoritative() || !p1 || !p2) return;
        for (const p of [p1, p2]) {
            if (p.hasGear('gear_evo_path_p')) this.reward(p, 'evoPathRewardPaid');
            if ((p.upgrades.find(id => MODULES.BODY.some(m => m.id === id)) || p.weapon) === 'basic' && (p.mainEgg || p.mainAwakened)) {
                // MAIN hiện tại vẫn do body quản lý. Chỉ chừa API và bồi thường, không thêm Evo 3/4 cho basic.
                this.reward(p, 'evoMainRewardPaid', p.hasGear('gear_protagonist_p') ? 0 : 200);
            }
        }
    },
    prepareGold(p) {
        if (!(p.evoGoldPending > 0) || (p.evoGoldChoices || []).length) return;
        p.evoGoldChoices = GEARS.filter(g => canGearAppearForPlayer(g, p, 1, 'GOLD')).sort(() => Math.random() - 0.5).slice(0, 3).map(g => g.id);
    },
    sendGoldState() {
        onlineManager.sendNetworkMessage({ type: 'EVO_GOLD_STATE', pending: p2.evoGoldPending || 0, choices: p2.evoGoldChoices || [], gears: p2.equippedGears, coins: gameState.p2Coins });
    },
    receive(manager, data) {
        if (data.type === 'EVO_GOLD_PICK') {
            if (manager.role === 'host') { this.pickGold(p2, data.id); this.sendGoldState(); }
            return true;
        }
        if (data.type === 'EVO_GOLD_STATE') {
            if (manager.role === 'guest') {
                p2.evoGoldPending = data.pending; p2.evoGoldChoices = data.choices;
                p2.equippedGears = data.gears; gameState.p2Coins = data.coins;
                if (gameState.phase === 'upgrade' && data.pending > 0) this.renderGold('p2', () => renderShop('p2', true));
                else if (this.goldCallback) { const cb = this.goldCallback; this.goldCallback = null; cb(); }
            }
            return true;
        }
        return false;
    },
    pickGold(p, id) {
        if (!this.authoritative() || !(p.evoGoldPending > 0) || !(p.evoGoldChoices || []).includes(id)) return false;
        if (!p.addGear(id)) return false;
        p.evoGoldPending--; p.evoGoldChoices = [];
        this.prepareGold(p);
        return true;
    },
    renderGold(pid, complete) {
        const p = pid === 'p1' ? p1 : p2;
        if (!(p.evoGoldPending > 0)) { complete(); return; }
        if (this.authoritative()) this.prepareGold(p);
        const box = document.getElementById(`${pid}-upgrades`);
        if (!box) return;
        box.innerHTML = '<div class="evo-gold-title">🥇 BỒI THƯỜNG — CHỌN 1 LÕI VÀNG</div>';
        if (!(p.evoGoldChoices || []).length) {
            // Không còn lõi hợp lệ: trả tiền, tránh kẹt cửa hàng.
            if (this.authoritative()) { addPlayerCoins(p, 100); p.evoGoldPending--; this.renderGold(pid, complete); }
            return;
        }
        p.evoGoldChoices.forEach(id => {
            const g = GEAR_BY_ID[id], card = document.createElement('button');
            card.className = 'card gear-card gear-tier-gold'; card.innerHTML = `<h4>${g.name}</h4><p>${g.desc}</p>`;
            card.onclick = () => {
                if (!this.authoritative()) {
                    this.goldCallback = () => this.renderGold(pid, complete);
                    card.disabled = true;
                    onlineManager.sendNetworkMessage({ type: 'EVO_GOLD_PICK', id });
                } else if (this.pickGold(p, id)) {
                    if (onlineManager.isOnline && p.id === 2) this.sendGoldState();
                    this.renderGold(pid, complete);
                }
            };
            box.appendChild(card);
        });
    },
    ui() {
        for (const side of [1, 2]) {
            const btn = document.getElementById(`evo-skill-${side}`);
            if (!btn) continue;
            const online = onlineManager.isOnline;
            const p = online && onlineManager.role === 'guest' ? (side === 1 ? p2 : p1) : (side === 1 ? p1 : p2);
            const cfg = this.config(p), active = gameState.phase === 'playing';
            btn.hidden = !cfg || !active || (online && side === 2);
            const banner = document.getElementById(`evo-banner-${side}`);
            banner.hidden = !FEATURE_EVO34 || !active || !(p && p.ultBannerTicks > 0);
            banner.textContent = p && p.ultBannerName || '';
            if (btn.hidden) continue;
            const rage = p.rage || 0, full = rage >= 100, ready = !full || this.ready(p);
            btn.classList.toggle('evo-ultimate', full);
            btn.classList.toggle('evo-blocked', !ready);
            btn.style.setProperty('--rage', `${rage * 3.6}deg`);
            btn.style.setProperty('--cooldown', `${Math.min(360, (p.skillCd || 0) / ((cfg.cooldown || 10) * 60) * 360)}deg`);
            btn.querySelector('span').textContent = p.ultActiveTicks > 0 ? Math.ceil(p.ultActiveTicks / 60) : full ? (ready ? 'NỘ' : '🔒') : (p.skillCd > 0 ? (p.skillCd < 180 ? (p.skillCd / 60).toFixed(1) : Math.ceil(p.skillCd / 60)) : 'SKILL');
            btn.title = full ? `${cfg.ultimateName}${ready ? '' : ' — Chưa đủ điều kiện'}` : cfg.name;
            btn.setAttribute('aria-label', btn.title);
            if (full && btn.dataset.full !== 'true' && navigator.vibrate) navigator.vibrate(10);
            btn.dataset.full = String(full);
            banner.textContent = p.ultBannerName || '';
        }
    }
};

(function installEvoFramework() {
    // Thứ tự mua được giữ trong loadout; không ghi các cờ đã bồi thường từ phía guest.
    NET_LOADOUT_KEYS.push('evoOrder');
    const loadout = NetState.applyLoadout;
    NetState.applyLoadout = function (...args) { const result = loadout.apply(this, args); EvoSystem.reconcile(); return result; };
    const add = Player.prototype.addUpgrade;
    Player.prototype.addUpgrade = function (id) {
        const e = bodyEvos(this.weapon).find(x => x.id === id) || (EVOLUTIONS[this.weapon] || []).find(x => x.id === id && x.fullEvoGate);
        if (e && (this.hasUpgrade(id) || evoPurchaseLock(this, e))) return false;
        if (FEATURE_EVO34 && this.hasGear('gear_evo_path_p') && MODULES.FEET.some(x => x.id === id) && id !== 'interest') return false;
        const ok = add.call(this, id);
        if (ok && e && !e.fullEvoGate) this.evoOrder = [...new Set([...(this.evoOrder || []), ...this.upgrades.filter(u => bodyEvos(this.weapon).some(x => x.id === u))])];
        return ok;
    };
    const addGear = Player.prototype.addGear;
    Player.prototype.addGear = function (id) {
        if (FEATURE_EVO34 && id === 'gear_evo_again_p' && this.hasGear('gear_evo_path_p')) return false;
        if (FEATURE_EVO34 && id === 'gear_evo_path_p') this.equippedGears = this.equippedGears.filter(g => g !== 'gear_evo_again_p');
        const result = addGear.call(this, id);
        if (FEATURE_EVO34) EvoSystem.reconcile();
        return result;
    };
    const canAppear = canGearAppearForPlayer;
    canGearAppearForPlayer = function (g, p, milestone, tier, ignoreTier) {
        if (g && g.id === 'gear_evo_path_p' && p.hasGear('gear_evo_again_p')) {
            const old = p.equippedGears;
            try { p.equippedGears = old.filter(id => id !== 'gear_evo_again_p'); return canAppear(g, p, milestone, tier, ignoreTier); }
            finally { p.equippedGears = old; }
        }
        return canAppear(g, p, milestone, tier, ignoreTier);
    };
    const setup = Player.prototype.setupForNewRound;
    Player.prototype.setupForNewRound = function () {
        const carry = this.evoLastRound === gameState.round ? (this.rageUnits || 0) : Math.floor((this.rageUnits || 0) / 200) * 100;
        const result = setup.apply(this, arguments);
        if (!FEATURE_EVO34) return result;
        this.evoLastRound = gameState.round; this.rageUnits = carry; this.rage = Math.floor(carry / 100);
        this.rageTimeAcc = 0; this.skillCd = 0; this.ultActiveTicks = 0; this.skillWasDown = false; this.ultBannerTicks = 0;
        const n = EvoSystem.pathCount(this);
        this.maxHp += EVO_PATH_CONFIG.hpTotals[n]; this.damage *= 1 + EVO_PATH_CONFIG.damagePerEvo * n;
        const key = fullEvoCombo(this), combo = (FULL_EVO_COMBOS[this.weapon] || {})[key];
        if (hasFullEvo(this) && key !== '1+2' && key !== '1+2+3+4' && !combo) { this.maxHp++; this.damage *= 1.1; this.shield++; }
        this.hp = this.maxHp;
        EvoSystem.reconcile();
        return result;
    };
    const damage = Player.prototype.takeDamage;
    Player.prototype.takeDamage = function (amount, ...args) {
        const hp = this.hp, shield = this.shield;
        const result = damage.call(this, amount * (1 - EVO_PATH_CONFIG.reductionPerEvo * EvoSystem.pathCount(this)), ...args);
        const lost = Math.max(0, hp - this.hp) + Math.max(0, shield - this.shield) * 0.5;
        const cfg = EvoSystem.config(this);
        if (lost > 0 && cfg) EvoSystem.gain(this, 'damage', Math.min(18, lost * (cfg.rageDamage ?? 8)));
        return result;
    };
    const update = Player.prototype.update;
    Player.prototype.update = function () {
        const n = EvoSystem.pathCount(this), speed = this.speed;
        if (n) {
            this.evoCcPrev = this.evoCcPrev || {};
            for (const key of ['freezeTimer', 'stunTimer', 'silenceTimer', 'rootTimer', 'groundedTimer']) {
                const prev = this.evoCcPrev[key] || 0;
                if (this[key] > prev) this[key] = prev + Math.round((this[key] - prev) * (1 - n * EVO_PATH_CONFIG.ccPerEvo));
                this.evoCcPrev[key] = Math.max(0, (this[key] || 0) - 1);
            }
            this.speed *= 1 + n * EVO_PATH_CONFIG.speedPerEvo;
        }
        try { return update.apply(this, arguments); } finally { this.speed = speed; }
    };
    const ready = handlePlayerReady;
    handlePlayerReady = function (pid, remote) {
        const p = pid === 'p1' ? p1 : p2;
        EvoSystem.reconcile();
        if (p.evoGoldPending > 0) { EvoSystem.renderGold(pid, () => handlePlayerReady(pid, remote)); return false; }
        return ready(pid, remote);
    };
    const shop = renderShop;
    renderShop = function (pid, ...args) {
        EvoSystem.reconcile();
        const p = pid === 'p1' ? p1 : p2;
        if (p.evoGoldPending > 0) return EvoSystem.renderGold(pid, () => renderShop(pid, ...args));
        return shop(pid, ...args);
    };
    const render = renderFrame;
    renderFrame = function () { const result = render.apply(this, arguments); EvoSystem.ui(); return result; };
    window.addEventListener('load', () => {
        for (const side of [1, 2]) {
            const area = document.getElementById(`p${side}-controls`), button = document.createElement('button');
            button.id = `evo-skill-${side}`; button.className = 'evo-skill'; button.hidden = true; button.innerHTML = '<span>SKILL</span>';
            area.querySelector('.btn-group').insertBefore(button, area.querySelector('.btn-shoot'));
            const banner = document.createElement('div'); banner.id = `evo-banner-${side}`; banner.className = `evo-banner evo-banner-${side}`; banner.hidden = true;
            document.getElementById('gameContainer').appendChild(banner);
            const press = down => {
                const pid = onlineManager.isOnline ? onlineManager.myPid() : `p${side}`;
                inputs[pid].k = down;
                if (onlineManager.isOnline) onlineManager.sendNetworkMessage({ type: onlineManager.role === 'guest' ? 'INPUT' : 'HOST_INPUT', input: { ...inputs[pid] } });
            };
            button.addEventListener('pointerdown', event => { event.preventDefault(); button.setPointerCapture(event.pointerId); press(true); });
            for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) button.addEventListener(ev, () => press(false));
        }
        function key(event, down) {
            if (event.repeat || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName) || gameState.phase !== 'playing') return;
            const local = onlineManager.isOnline ? onlineManager.myPid() : 'p1';
            const pid = event.key.toLowerCase() === EVO_SKILL_KEYS.p1 ? local : (!onlineManager.isOnline && event.key === EVO_SKILL_KEYS.p2 ? 'p2' : null);
            const p = pid === 'p1' ? p1 : p2;
            if (pid && EvoSystem.config(p)) { inputs[pid].k = down; event.preventDefault(); }
        }
        window.addEventListener('keydown', e => key(e, true)); window.addEventListener('keyup', e => key(e, false));
        window.addEventListener('blur', () => { inputs.p1.k = inputs.p2.k = false; });
    });
})();
