// ==========================================
// PHÒNG TẬP — BỘ CÔNG CỤ THỬ NGHIỆM (LAB)
// Bảng nhanh đổi Body/Evo/G.E.A.R, tốc độ game, dừng & bước từng khung,
// đồng hồ DPS + nhật ký sát thương, khung va chạm (hitbox), FPS, phím tắt.
// Mọi thứ chỉ chạy khi đang ở Phòng Tập offline (không ảnh hưởng trận thường / online / PVE).
// ==========================================
const SandboxLab = {
    SPEEDS: [0.25, 0.5, 1, 2],
    speed: 1, acc: 0, paused: false, stepReq: 0,
    hitbox: false, showDps: true, noCd: false, botFreezeMove: false, botNoFire: false,
    panelOpen: false, target: 'p1', tab: 'body', search: '', gearSearch: '',
    secCollapsed: {}, // trạng thái thu gọn từng nhóm nút cũ
    tickNo: 0, samples: [], log: [], totals: { dealt: 0, taken: 0 }, godBucket: { p1: 0, p2: 0 },
    fps: 0, _frames: 0, _fpsT: 0, _uiT: 0,

    active() {
        return typeof botAI !== 'undefined' && botAI.enabled && botAI.mode !== 'pve' &&
            !(typeof PVE !== 'undefined' && PVE.active) &&
            !(typeof onlineManager !== 'undefined' && onlineManager.isOnline);
    },
    P(id) { return id === 'p2' ? p2 : p1; },
    norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd'); },
    bodyName(id) { const m = MODULES.BODY.find(b => b.id === id); return m ? m.name : (id || '?'); },
    toast(p, txt, color) { if (p && typeof addFloatingText === 'function') addFloatingText(p.x + p.w / 2, p.id === 1 ? p.y - 16 : p.y + p.h + 14, txt, color || '#00f0ff', 13); },
    click() { if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted) soundSystem.playClick(); },

    // ---------- Lưu trạng thái giao diện (localStorage, có try/catch) ----------
    load() {
        try {
            const s = JSON.parse(localStorage.getItem('tankSandboxLab.v1') || '{}');
            if (typeof s.hitbox === 'boolean') this.hitbox = s.hitbox;
            if (typeof s.showDps === 'boolean') this.showDps = s.showDps;
            if (s.secCollapsed) this.secCollapsed = s.secCollapsed;
            this.tbCollapsed = !!s.tbCollapsed;
        } catch (e) { }
    },
    save() {
        try {
            const tb = document.getElementById('trainingToolbar');
            localStorage.setItem('tankSandboxLab.v1', JSON.stringify({
                hitbox: this.hitbox, showDps: this.showDps, secCollapsed: this.secCollapsed,
                tbCollapsed: !!(tb && tb.classList.contains('collapsed'))
            }));
        } catch (e) { }
    },

    // ---------- Tiến hóa: cơ bản / evo1 / evo2 / evo1+2 (chưa thẻ) / full (gồm thẻ ★ FULL EVO) ----------
    evoList(p) { return (p && EVOLUTIONS[p.weapon]) || []; },
    gate(p) { return this.evoList(p).find(e => e.fullEvoGate) || null; },
    getTier(p) {
        const ev = this.evoList(p).filter(e => !e.fullEvoGate);
        const h1 = ev[0] && p.hasUpgrade(ev[0].id), h2 = ev[1] && p.hasUpgrade(ev[1].id);
        if (h1 && h2) return hasFullEvo(p) ? 'full' : '12';
        return h2 ? '2' : h1 ? '1' : '0';
    },
    applyTier(p, tier) {
        if (!p) return;
        const all = this.evoList(p), ev = all.filter(e => !e.fullEvoGate), g = this.gate(p);
        const ids = all.map(e => e.id);
        p.upgrades = (p.upgrades || []).filter(u => !ids.includes(u));
        const add = tier === '1' ? [ev[0]] : tier === '2' ? [ev[1]] : tier === '12' ? [ev[0], ev[1]] : tier === 'full' ? all : [];
        add.forEach(e => { if (e) p.upgrades.push(e.id); });
        // Thẻ FULL EVO chỉ hợp lệ khi đã đủ 2 Evo (evoShopAvailable)
        if (g && p.upgrades.includes(g.id) && !evoShopAvailable(p, g)) p.upgrades = p.upgrades.filter(u => u !== g.id);
        if (p.weapon === 'inventor') p.isFullEvoInventor = (tier === 'full');
        if (p.weapon === 'money_tank' && tier === 'full') p.upgradeLevel = Math.max(p.upgradeLevel || 0, 5);
        this.reinit(p);
        const lb = { '0': 'CƠ BẢN', '1': 'EVO 1', '2': 'EVO 2', '12': 'EVO 1+2 (chưa thẻ)', 'full': '★ FULL EVO' };
        this.toast(p, 'TIẾN HÓA: ' + lb[this.getTier(p)], '#e879f9');
    },
    reinit(p) {
        const cx = p.x + p.w / 2;
        if (typeof clearOwnedSummons === 'function') clearOwnedSummons(p);
        if (typeof PracticeGearModal !== 'undefined' && PracticeGearModal.clearOwnerGearEntities) PracticeGearModal.clearOwnerGearEntities(p);
        p.setupForNewRound();
        p.x = Math.max(0, Math.min(canvas.width - p.w, cx - p.w / 2));
        p.hp = p.maxHp;
        botAI.updateToolbarUI();
    },
    setBody(pid, id) {
        const p = this.P(pid);
        const cur = this.getTier(p);
        const preset = cur === '12' ? '0' : cur; // giữ nguyên mức tiến hóa khi đổi body
        if (pid === 'p1') botAI.changePlayerWeapon(id, preset); else botAI.changeBotWeapon(id, preset);
        if (cur === '12') this.applyTier(p, this.gate(p) ? '12' : 'full');
    },
    toggleGear(pid, gid) {
        const p = this.P(pid);
        if (p.equippedGears.includes(gid)) p.equippedGears = p.equippedGears.filter(x => x !== gid);
        else p.addGear(gid);
        this.reinit(p);
    },
    clearGears(pid) { const p = this.P(pid); p.equippedGears = []; this.reinit(p); },

    // ---------- Điều khiển chung ----------
    togglePause() { this.paused = !this.paused; this.click(); this.refresh(); },
    step() { this.paused = true; this.stepReq++; this.refresh(); },
    setSpeed(v) { this.speed = v; this.acc = 0; this.click(); this.refresh(); },
    cycleSpeed(dir) {
        const i = this.SPEEDS.indexOf(this.speed);
        this.setSpeed(this.SPEEDS[Math.max(0, Math.min(this.SPEEDS.length - 1, i + dir))]);
    },
    resetRound() {
        botAI.clearArena();
        [p1, p2].forEach(p => {
            if (!p) return;
            p.bullets = [];
            this.reinit(p);
            p.x = canvas.width / 2 - p.w / 2;
        });
        gameState.roundStartTime = Date.now();
        this.resetStats();
        this.toast(p1, '⟲ RESET HIỆP', '#38bdf8');
    },
    setHp(pid, v) {
        const p = this.P(pid);
        if (!p || !isFinite(v)) return;
        p.hp = Math.max(0.05, Math.min(p.maxHp, v));
        this.toast(p, `HP = ${+p.hp.toFixed(2)}`, '#4ade80');
        this.refresh();
    },
    setBotLevel(n) { botAI.level = n; botAI.smart = new SmartBot(n); botAI.updateToolbarUI(); this.click(); this.refresh(); },
    toggle(key) {
        if (key === 'godP1') botAI.togglePlayerGodMode();
        else if (key === 'godP2') botAI.toggleGodMode();
        else if (key === 'ammo') botAI.toggleInfiniteAmmo();
        else { this[key] = !this[key]; this.click(); }
        if (key === 'hitbox' || key === 'showDps') this.save();
        this.refresh();
    },
    resetStats() { this.samples = []; this.log = []; this.totals = { dealt: 0, taken: 0 }; },

    // ---------- Vòng vật lý: tốc độ, dừng, bước khung ----------
    shiftClocks(ms) {
        gameState.roundStartTime += ms;
        if (gameState.lastObstacleSpawn) gameState.lastObstacleSpawn += ms;
        if (lastCrateSpawn) lastCrateSpawn += ms;
    },
    runTicks(orig) {
        let n;
        if (this.paused) { n = this.stepReq > 0 ? 1 : 0; if (n) this.stepReq--; }
        else { this.acc += this.speed; n = Math.floor(this.acc); this.acc -= n; }
        // Giữ đồng hồ theo Date.now (thời gian hiệp, thùng rơi) khớp với số tick thực chạy
        if (n !== 1) this.shiftClocks((1 - n) * TICK_TIME);
        for (let i = 0; i < n; i++) {
            const hp1 = p1.hp, hp2 = p2.hp;
            this.godBucket.p1 = this.godBucket.p2 = 0;
            orig();
            this.afterTick(hp1, hp2);
            if (gameState.phase !== 'playing') break;
        }
    },
    afterTick(hp1, hp2) {
        this.tickNo++;
        const dealt = Math.max(0, hp2 - p2.hp) + this.godBucket.p2;
        const taken = Math.max(0, hp1 - p1.hp) + this.godBucket.p1;
        this.samples.push({ t: this.tickNo, dealt, taken });
        while (this.samples.length && this.samples[0].t <= this.tickNo - 60) this.samples.shift();
        this.totals.dealt += dealt; this.totals.taken += taken;
        if (this.noCd && p1) this.clearCooldowns(p1);
    },
    clearCooldowns(p) {
        for (const k in p) {
            if (typeof p[k] === 'number' && p[k] > 0 && /(Cd|CD|Cooldown|cooldown)$/.test(k) && !/Max|Bank|Base|Total/.test(k)) p[k] = 0;
        }
        p.reloadTimer = 0;
    },
    onDamage(victim, amount, attacker, hpBefore, ret) {
        const god = (victim.id === 1 && botAI.isPlayerGodMode) || (victim.id === 2 && botAI.isGodMode);
        let amt = god ? amount : Math.max(0, hpBefore - victim.hp);
        if (god) this.godBucket[victim.id === 1 ? 'p1' : 'p2'] += amount;
        // Không có attacker: thường là đòn gián tiếp (vùng, nổ, hiệu ứng) -> ghi tên body đối thủ kèm "?"
        const opp = victim.id === 1 ? p2 : p1;
        const src = attacker && attacker.weapon ? this.bodyName(attacker.weapon) : (opp ? this.bodyName(opp.weapon) + ' ?' : 'Môi trường');
        this.log.unshift({ v: victim.id, src, amt, tag: god ? 'bất tử' : (amt === 0 ? 'chặn' : '') });
        if (this.log.length > 10) this.log.length = 10;
    },

    // ---------- Vẽ hitbox + FPS ----------
    afterRender() {
        const now = performance.now();
        this._frames++;
        if (now - this._fpsT >= 500) { this.fps = Math.round(this._frames * 1000 / (now - this._fpsT)); this._frames = 0; this._fpsT = now; }
        if (this.hitbox) this.drawHitboxes();
        if (this.paused) {
            ctx.save(); ctx.font = 'bold 13px Orbitron, monospace'; ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(250,204,21,0.95)'; ctx.fillText('⏸ TẠM DỪNG — N: bước 1 khung', canvas.width / 2, canvas.height / 2 - 40);
            ctx.restore();
        }
        if (now - this._uiT > 200) { this._uiT = now; this.updateDps(); }
    },
    drawHitboxes() {
        const box = (o, col) => { if (o && o.w > 0 && o.h > 0) ctx.strokeRect(o.x, o.y, o.w, o.h); };
        ctx.save(); ctx.shadowBlur = 0; ctx.lineWidth = 1;
        [[p1, '#4ade80'], [p2, '#f87171']].forEach(([p, col]) => {
            if (!p) return;
            ctx.strokeStyle = col; ctx.setLineDash([]); box(p);
            ctx.strokeStyle = col + 'cc'; ctx.setLineDash([2, 2]);
            (p.bullets || []).forEach(b => { if (b && b.active !== false) box(b); });
        });
        ctx.setLineDash([3, 3]); ctx.strokeStyle = '#facc15';
        if (typeof crates !== 'undefined') crates.forEach(c => c && c.active !== false && box(c));
        if (typeof moneyTrucks !== 'undefined') moneyTrucks.forEach(c => c && box(c));
        ctx.restore();
    },

    // ---------- Giao diện ----------
    LAB_BTNS: [
        ['pause', '⏸', 'Dừng', 'P'], ['step', '⏭', 'Bước', 'N'], ['speed', '1x', 'Tốc', ']'], ['reset', '⟲', 'Reset', 'R'],
        ['panel', '⚡', 'Bảng', 'B'], ['hitbox', '🧱', 'Hitbox', 'H'], ['showDps', '📊', 'DPS', 'L'], ['noCd', '⏱', '0 CD', 'C'],
        ['godP1', '🛡️', 'Bạn BT', 'K'], ['godP2', '🛡️', 'Bot BT', 'J'], ['ammo', '♾️', 'Đạn', 'I'], ['botFreezeMove', '🚷', 'Bot đứng', 'M'],
        ['botNoFire', '🔇', 'Bot ngưng', 'F'], ['heal', '💚', 'Hồi máu', 'U'], ['crate', '📦', 'Thùng', 'X'], ['map', '🗺️', 'Map', 'V'],
    ],
    act(a) {
        const f = {
            pause: () => this.togglePause(), step: () => this.step(), speed: () => this.setSpeed(this.SPEEDS[(this.SPEEDS.indexOf(this.speed) + 1) % this.SPEEDS.length]),
            reset: () => this.resetRound(), panel: () => this.togglePanel(), heal: () => botAI.healAll(),
            crate: () => botAI.openTestBoxModal(), map: () => botAI.cycleSandboxMap(),
        }[a];
        if (f) { f(); this.refresh(); } else this.toggle(a);
    },
    buildUI() {
        const content = document.getElementById('trainingToolbarContent');
        if (!content || document.getElementById('labSection')) return;
        const sec = document.createElement('div');
        sec.className = 'tb-section'; sec.id = 'labSection';
        sec.innerHTML = '<span class="tb-sec-label">⚗️ LAB TEST</span><div class="lab-grid">' +
            this.LAB_BTNS.map(([a, ic, lb, k]) => `<button type="button" class="lab-btn" data-lab="${a}" title="${lb} (phím ${k})"><b>${ic}</b><span>${lb}</span><i>${k}</i></button>`).join('') + '</div>';
        content.insertBefore(sec, content.firstChild);
        sec.addEventListener('click', e => { const b = e.target.closest('[data-lab]'); if (b) this.act(b.dataset.lab); });
        // Các nhóm nút cũ: bấm tiêu đề để thu gọn (mặc định thu gọn cho gọn màn hình)
        content.querySelectorAll('.tb-section').forEach((s, i) => {
            if (s === sec) return;
            const lab = s.querySelector('.tb-sec-label'); if (!lab) return;
            const key = 's' + i;
            lab.classList.add('lab-fold'); s.dataset.labKey = key;
            if (this.secCollapsed[key] === undefined) this.secCollapsed[key] = true;
            s.classList.toggle('lab-folded', this.secCollapsed[key]);
            lab.addEventListener('click', () => { this.secCollapsed[key] = !this.secCollapsed[key]; s.classList.toggle('lab-folded', this.secCollapsed[key]); this.save(); });
        });
        const host = document.getElementById('trainingToolbar').parentElement;
        const panel = document.createElement('div');
        panel.id = 'labPanel'; panel.style.display = 'none';
        host.appendChild(panel);
        panel.addEventListener('click', e => this.onPanelClick(e));
        panel.addEventListener('input', e => {
            if (e.target.id === 'labSearch') { this.search = e.target.value; this.renderList(); }
            if (e.target.id === 'labGearSearch') { this.gearSearch = e.target.value; this.renderList(); }
        });
        panel.addEventListener('keydown', e => { if (e.target.tagName === 'INPUT' && e.key === 'Enter' && e.target.dataset.hp) this.setHp(e.target.dataset.hp, parseFloat(e.target.value)); e.stopPropagation(); });
        panel.addEventListener('keyup', e => e.stopPropagation());
        const dps = document.createElement('div');
        dps.id = 'labDps'; dps.style.display = 'none';
        host.appendChild(dps);
    },
    togglePanel(force) {
        this.panelOpen = force !== undefined ? force : !this.panelOpen;
        const el = document.getElementById('labPanel');
        if (el) { el.style.display = this.panelOpen ? 'flex' : 'none'; if (this.panelOpen) this.renderPanel(); }
        this.refresh();
    },
    renderPanel() {
        const el = document.getElementById('labPanel');
        if (!el || !this.panelOpen) return;
        const p = this.P(this.target);
        const tabs = [['body', '🚗 BODY'], ['gear', '⚙️ GEAR'], ['test', '🎛️ TEST']];
        let h = `<div class="lab-ph"><div class="lab-seg">
            <button data-tgt="p1" class="${this.target === 'p1' ? 'on' : ''}">👤 BẠN</button>
            <button data-tgt="p2" class="${this.target === 'p2' ? 'on p2' : ''}">🤖 BOT</button></div>
            <button class="lab-x" data-close="1" title="Đóng (B)">✕</button></div>
            <div class="lab-tabs">${tabs.map(([k, l]) => `<button data-tab="${k}" class="${this.tab === k ? 'on' : ''}">${l}</button>`).join('')}</div>`;
        if (this.tab === 'body') {
            const tier = this.getTier(p), g = this.gate(p);
            const tiers = [['0', 'CB'], ['1', 'E1'], ['2', 'E2']].concat(g ? [['12', 'E1+2']] : []).concat([['full', g ? '★FULL' : 'FULL']]);
            h += `<div class="lab-cur">${this.target === 'p1' ? '👤' : '🤖'} <b>${this.bodyName(p.weapon)}</b></div>
                <div class="lab-seg lab-evo">${tiers.map(([k, l]) => `<button data-tier="${k}" class="${tier === k ? 'on' : ''}" title="${k === 'full' && g ? 'Evo 1 + Evo 2 + thẻ ★ FULL EVO ★' : ''}">${l}</button>`).join('')}</div>
                <input id="labSearch" class="lab-in" placeholder="🔍 Tìm body..." value="${this.search.replace(/"/g, '')}">`;
        } else if (this.tab === 'gear') {
            h += `<div class="lab-cur">${this.target === 'p1' ? '👤' : '🤖'} ${p.equippedGears.length} lõi <button class="lab-mini" data-cleargear="1">Gỡ hết</button></div>
                <input id="labGearSearch" class="lab-in" placeholder="🔍 Tìm G.E.A.R..." value="${this.gearSearch.replace(/"/g, '')}">`;
        } else {
            const m = botAI.mode;
            h += `<div class="lab-test">
                <span class="lab-lbl">BOT</span><div class="lab-seg">${[['dummy', '🧍 Dummy'], ['shooter', '🎯 Bắn'], ['combat', '⚔️ AI']].map(([k, l]) => `<button data-mode="${k}" class="${m === k ? 'on' : ''}">${l}</button>`).join('')}</div>
                <span class="lab-lbl">CẤP AI</span><div class="lab-seg">${[1, 2, 3, 4, 5].map(n => `<button data-lv="${n}" class="${botAI.level === n ? 'on' : ''}">${n}</button>`).join('')}</div>
                <span class="lab-lbl">TỐC ĐỘ GAME</span><div class="lab-seg">${this.SPEEDS.map(s => `<button data-spd="${s}" class="${this.speed === s ? 'on' : ''}">${s}x</button>`).join('')}</div>
                ${['p1', 'p2'].map(pid => { const q = this.P(pid); return `<span class="lab-lbl">HP ${pid === 'p1' ? 'BẠN' : 'BOT'} (${+q.hp.toFixed(2)}/${+q.maxHp.toFixed(2)})</span>
                    <div class="lab-hp"><input type="number" step="0.5" min="0.05" class="lab-in" data-hp="${pid}" value="${+q.hp.toFixed(2)}">
                    <button data-sethp="${pid}">Đặt</button><button data-hpv="${pid}:0.05">0.05</button><button data-hpv="${pid}:1">1</button><button data-hpv="${pid}:max">MAX</button></div>`; }).join('')}
                <div class="lab-seg lab-wrap">
                    <button data-lab="botFreezeMove" class="${this.botFreezeMove ? 'on' : ''}">🚷 Bot đứng</button>
                    <button data-lab="botNoFire" class="${this.botNoFire ? 'on' : ''}">🔇 Bot ngưng bắn</button>
                    <button data-lab="crate">📦 Thùng</button><button data-lab="map">🗺️ Map</button>
                    <button data-fin="1">💀 Kết liễu</button><button data-lab="reset">⟲ Reset</button></div></div>`;
        }
        h += '<div id="labList" class="lab-list"></div>';
        el.innerHTML = h;
        this.renderList();
    },
    renderList() {
        const box = document.getElementById('labList');
        if (!box) return;
        const p = this.P(this.target);
        if (this.tab === 'body') {
            const q = this.norm(this.search);
            box.innerHTML = MODULES.BODY.filter(b => !q || this.norm(b.name + ' ' + b.id).includes(q))
                .map(b => `<button data-body="${b.id}" class="${p.weapon === b.id ? 'on' : ''}">${b.name}${EVOLUTIONS[b.id] && FULL_EVO_GATE[b.id] ? ' <i>🔒</i>' : ''}</button>`).join('');
        } else if (this.tab === 'gear') {
            const q = this.norm(this.gearSearch);
            const col = { SILVER: '#cbd5e1', GOLD: '#fbbf24', PRISMATIC: '#e879f9' };
            box.innerHTML = GEARS.filter(g => !q || this.norm(g.name + ' ' + g.desc + ' ' + g.num).includes(q))
                .map(g => `<button data-gear="${g.id}" class="${p.equippedGears.includes(g.id) ? 'on' : ''}" style="color:${col[g.tier] || '#e2e8f0'}" title="${String(g.desc).replace(/"/g, '')}">#${g.num} ${g.name}</button>`).join('');
        } else box.innerHTML = '';
    },
    onPanelClick(e) {
        const b = e.target.closest('button'); if (!b) return;
        const d = b.dataset;
        if (d.close) return this.togglePanel(false);
        if (d.tgt) this.target = d.tgt;
        else if (d.tab) this.tab = d.tab;
        else if (d.tier) this.applyTier(this.P(this.target), d.tier);
        else if (d.body) this.setBody(this.target, d.body);
        else if (d.gear) { this.toggleGear(this.target, d.gear); }
        else if (d.cleargear) this.clearGears(this.target);
        else if (d.mode) botAI.setMode(d.mode);
        else if (d.lv) this.setBotLevel(+d.lv);
        else if (d.spd) this.setSpeed(+d.spd);
        else if (d.sethp) { const inp = b.parentElement.querySelector('input'); this.setHp(d.sethp, parseFloat(inp.value)); }
        else if (d.hpv) { const [pid, v] = d.hpv.split(':'); this.setHp(pid, v === 'max' ? this.P(pid).maxHp : +v); }
        else if (d.fin) botAI.testFinisher();
        else if (d.lab) return this.act(d.lab);
        if (d.gear) { this.renderList(); this.refreshGearHead(); return; }
        if (d.body) { this.renderPanel(); return; }
        this.renderPanel();
        this.refresh();
    },
    refreshGearHead() {
        const c = document.querySelector('#labPanel .lab-cur');
        if (c) c.firstChild.textContent = `${this.target === 'p1' ? '👤' : '🤖'} ${this.P(this.target).equippedGears.length} lõi `;
    },
    refresh() {
        const on = {
            pause: this.paused, panel: this.panelOpen, hitbox: this.hitbox, showDps: this.showDps, noCd: this.noCd,
            godP1: botAI.isPlayerGodMode, godP2: botAI.isGodMode, ammo: botAI.infiniteAmmo,
            botFreezeMove: this.botFreezeMove, botNoFire: this.botNoFire, speed: this.speed !== 1,
        };
        document.querySelectorAll('#labSection [data-lab]').forEach(b => {
            b.classList.toggle('on', !!on[b.dataset.lab]);
            if (b.dataset.lab === 'speed') b.querySelector('b').textContent = this.speed + 'x';
            if (b.dataset.lab === 'pause') b.querySelector('b').textContent = this.paused ? '▶' : '⏸';
        });
        const dps = document.getElementById('labDps');
        if (dps) dps.style.display = this.showDps && this.active() ? 'block' : 'none';
    },
    updateDps() {
        const el = document.getElementById('labDps');
        if (!el || !this.showDps || !this.active()) return;
        let d = 0, t = 0; this.samples.forEach(s => { d += s.dealt; t += s.taken; });
        const f = v => (+v.toFixed(2)).toString();
        el.innerHTML = `<div class="lab-dh"><span>FPS <b>${this.fps}</b></span><span>${this.speed}x${this.paused ? ' ⏸' : ''}</span></div>
            <div class="lab-dr"><span class="g">GÂY ${f(d)}/s</span><span class="r">NHẬN ${f(t)}/s</span></div>
            <div class="lab-dr sm"><span>Σ ${f(this.totals.dealt)}</span><span>Σ ${f(this.totals.taken)}</span></div>
            <div class="lab-log">${this.log.map(l => `<div class="${l.v === 2 ? 'g' : 'r'}">${l.v === 2 ? '→Bot' : '→Bạn'} <b>${f(l.amt)}</b> ${l.src}${l.tag ? ' <i>(' + l.tag + ')</i>' : ''}</div>`).join('')}</div>`;
    },
    onKey(e) {
        if (!this.active() || gameState.phase !== 'playing' || e.ctrlKey || e.metaKey || e.altKey) return;
        const t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
        const map = { KeyP: 'pause', KeyN: 'step', KeyR: 'reset', KeyB: 'panel', KeyH: 'hitbox', KeyL: 'showDps', KeyC: 'noCd',
            KeyK: 'godP1', KeyJ: 'godP2', KeyI: 'ammo', KeyM: 'botFreezeMove', KeyF: 'botNoFire', KeyU: 'heal', KeyX: 'crate', KeyV: 'map' };
        if (e.code === 'BracketRight' || e.code === 'Equal') { this.cycleSpeed(1); e.preventDefault(); return; }
        if (e.code === 'BracketLeft' || e.code === 'Minus') { this.cycleSpeed(-1); e.preventDefault(); return; }
        if (e.code === 'KeyT') { botAI.toggleToolbar(); return; }
        const a = map[e.code];
        if (a) { e.preventDefault(); this.act(a); }
    },
    resetRuntime() {
        this.speed = 1; this.acc = 0; this.paused = false; this.stepReq = 0;
        this.noCd = false; this.botFreezeMove = false; this.botNoFire = false;
        this.resetStats();
    },

    install() {
        this.load();
        const lab = this;
        const origTick = window.tickPhysics;
        window.tickPhysics = function () { if (!lab.active()) return origTick(); lab.runTicks(origTick); };
        const origRender = window.renderFrame;
        window.renderFrame = function () { origRender(); if (lab.active() && gameState.phase === 'playing') lab.afterRender(); };
        const origTD = Player.prototype.takeDamage;
        Player.prototype.takeDamage = function (amount, attacker, options) {
            if (!lab.active()) return origTD.apply(this, arguments);
            const hp = this.hp, alive = hp > 0 && gameState.phase === 'playing';
            const r = origTD.apply(this, arguments);
            if (alive && amount > 0) lab.onDamage(this, amount, attacker, hp, r);
            return r;
        };
        const origUpd = botAI.update.bind(botAI);
        botAI.update = function (bot, player) {
            origUpd(bot, player);
            if (!lab.active()) return;
            if (lab.botFreezeMove) inputs.p2.l = inputs.p2.r = false;
            if (lab.botNoFire) inputs.p2.s = false;
        };
        const origUI = botAI.updateToolbarUI.bind(botAI);
        botAI.updateToolbarUI = function () { origUI(); lab.refresh(); };
        const origToggle = botAI.toggleToolbar.bind(botAI);
        botAI.toggleToolbar = function () { origToggle(); const tb = document.getElementById('trainingToolbar'); lab.tbCollapsed = !!(tb && tb.classList.contains('collapsed')); lab.save(); };
        const origStart = botAI.startPractice.bind(botAI);
        botAI.startPractice = function () {
            lab.resetRuntime();
            origStart();
            const tb = document.getElementById('trainingToolbar'), btn = document.getElementById('btnToggleTrainingToolbar');
            if (tb) tb.classList.toggle('collapsed', !!lab.tbCollapsed);
            if (btn && tb) btn.innerText = tb.classList.contains('collapsed') ? '▸' : '▾';
            lab.refresh();
        };
        const origExit = botAI.exitPractice.bind(botAI);
        botAI.exitPractice = function () {
            lab.togglePanel(false); lab.resetRuntime();
            origExit();
            lab.refresh();
        };
        window.addEventListener('keydown', e => lab.onKey(e));
        this.buildUI();
        this.refresh();
    },
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => SandboxLab.install());
else SandboxLab.install();
