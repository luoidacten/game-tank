// ==========================================
// Giải Đấu PVE: 5 vòng đấu với bot thông minh mạnh dần
// ------------------------------------------
// - Mỗi lượt giải bốc ngẫu nhiên 5 body khác nhau cho bot.
// - Bot tự chọn body ở hiệp 1, tự mua đồ trong shop (vòng sau được thưởng thêm tiền).
// - Thắng trận -> mở khoá vòng kế tiếp (lưu trên máy). Thua -> thử lại vòng đó.
// ==========================================

const PVE_STAGES = [
    { name: 'Vòng Loại', level: 1, wins: 2, map: 'classic', bonus: 0 },
    { name: 'Vòng Bảng', level: 2, wins: 2, map: 'bastion', bonus: 10 },
    { name: 'Tứ Kết', level: 3, wins: 2, map: 'rush_hour', bonus: 20 },
    { name: 'Bán Kết', level: 4, wins: 3, map: 'artillery', bonus: 35 },
    { name: 'Chung Kết', level: 5, wins: 3, map: 'random', bonus: 50 },
];

const PVE = {
    active: false,
    stage: 0,
    bodies: [],
    saved: null,

    load() {
        let d = null;
        try { d = JSON.parse(localStorage.getItem('pveProgress') || 'null'); } catch (e) { d = null; }
        return Object.assign({ unlocked: 0, titles: 0 }, d || {});
    },
    save(d) { try { localStorage.setItem('pveProgress', JSON.stringify(d)); } catch (e) { /* bỏ qua */ } },

    newRun() {
        const pool = MODULES.BODY.map(m => m.id).sort(() => Math.random() - 0.5);
        this.bodies = pool.slice(0, PVE_STAGES.length);
    },

    bodyName(id) { const m = MODULES.BODY.find(b => b.id === id); return m ? m.name : id; },

    renderLadder(el, current, results = {}) {
        if (!el) return;
        const prog = this.load();
        el.innerHTML = '';
        PVE_STAGES.forEach((st, i) => {
            const row = document.createElement('div');
            const locked = i > prog.unlocked;
            const lv = BOT_LEVELS[st.level];
            row.className = 'pve-stage' + (i === current ? ' current' : '') + (locked ? ' locked' : '') + (results[i] ? ' ' + results[i] : '');
            const body = this.bodies[i] ? this.bodyName(this.bodies[i]) : '???';
            const status = results[i] === 'won' ? '✅' : (results[i] === 'lost' ? '❌' : (locked ? '🔒' : (i < prog.unlocked ? '⭐' : '⚔️')));
            row.innerHTML = `<span class="pve-num">${i + 1}</span>` +
                `<span class="pve-info"><b>${st.name}</b><small>Bot ${lv.name} · ${body} · BO${st.wins * 2 - 1}</small></span>` +
                `<span class="pve-status">${status}</span>`;
            if (!locked && el.id === 'pveStageList') row.onclick = () => { this.stage = i; this.renderLadder(el, i); this.updateStartBtn(); };
            el.appendChild(row);
        });
    },

    updateStartBtn() {
        const btn = document.getElementById('pveStartBtn');
        if (btn) btn.innerHTML = `&#9654; BẮT ĐẦU: ${PVE_STAGES[this.stage].name.toUpperCase()}`;
    },

    updateMenuProgress() {
        const el = document.getElementById('pveMenuProgress');
        if (!el) return;
        const p = this.load();
        el.innerText = p.titles > 0 ? `🏆 Vô địch ${p.titles} lần · đã mở ${Math.min(5, p.unlocked + 1)}/5 vòng` : `Đã mở ${Math.min(5, p.unlocked + 1)}/5 vòng · bot né đạn, ăn thùng, ép góc`;
    },

    openLobby() {
        this.newRun();
        const prog = this.load();
        this.stage = Math.min(prog.unlocked, PVE_STAGES.length - 1);
        this.renderLadder(document.getElementById('pveStageList'), this.stage);
        this.updateStartBtn();
        const m = document.getElementById('pveModal');
        if (m) m.style.display = 'flex';
        if (soundSystem && !soundSystem.muted) soundSystem.playClick();
    },

    closeModals() {
        ['pveModal', 'pveResultModal'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display = 'none'; });
    },

    startStage(i) {
        const st = PVE_STAGES[i];
        this.stage = i;
        if (!this.saved) this.saved = { winScore: gameState.winScore, map: gameState.selectedMapMode };
        this.active = true;
        this.closeModals();
        gameState.winScore = st.wins;
        gameState.selectedMapMode = st.map;
        botAI.enabled = true;
        botAI.mode = 'pve';
        botAI.smart = new SmartBot(st.level);
        const mainMenu = document.getElementById('mainMenu');
        if (mainMenu) mainMenu.style.display = 'none';
        const tb = document.getElementById('trainingToolbar');
        if (tb) tb.style.display = 'none';
        const p2c = document.getElementById('p2-controls');
        if (p2c) p2c.style.display = 'none';
        const p1Label = document.querySelector('.p1-tag');
        if (p1Label) p1Label.innerHTML = `🔵 BẠN · 🏆 ${st.name.toUpperCase()} (Bot ${BOT_LEVELS[st.level].name})`;
        startBattle();
        if (typeof updateCanvasDimensions === 'function') updateCanvasDimensions();
    },

    // Hiệp 1: bot chọn body của vòng + chọn G.E.A.R mốc 1
    botPickBody() {
        const id = this.bodies[this.stage] || 'basic';
        p2.addUpgrade(id);
        const finishBotPick = () => {
            const c = document.getElementById('p2-upgrades');
            if (c) {
                c.innerHTML = `<div class="card" style="background:#7f1d1d"><h4>🤖 BOT: ${this.bodyName(id)}</h4><p>${BOT_LEVELS[PVE_STAGES[this.stage].level].name}</p></div>`;
                if (typeof renderEquippedGearStrip === 'function') renderEquippedGearStrip('p2', c);
            }
            handlePlayerReady('p2');
        };
        if (typeof showGearSelectionIfNeeded === 'function') {
            showGearSelectionIfNeeded('p2', finishBotPick);
        } else {
            finishBotPick();
        }
    },

    // Các hiệp sau: thưởng thêm tiền theo vòng rồi tự mua đồ
    botShop() {
        gameState.p2Coins += PVE_STAGES[this.stage].bonus;
        botShopBuy('p2');
        handlePlayerReady('p2');
    },

    onMatchEnd(playerWon) {
        const prog = this.load();
        const results = {};
        for (let i = 0; i < this.stage; i++) results[i] = 'won';
        results[this.stage] = playerWon ? 'won' : 'lost';
        const last = this.stage === PVE_STAGES.length - 1;
        if (playerWon) {
            prog.unlocked = Math.max(prog.unlocked, Math.min(PVE_STAGES.length - 1, this.stage + 1));
            if (last) prog.titles = (prog.titles || 0) + 1;
            this.save(prog);
        }
        const st = PVE_STAGES[this.stage];
        const title = document.getElementById('pveResultTitle');
        const text = document.getElementById('pveResultText');
        if (title) title.innerText = playerWon ? (last ? '🏆 VÔ ĐỊCH GIẢI ĐẤU!' : `✅ THẮNG ${st.name.toUpperCase()}!`) : `❌ THUA ${st.name.toUpperCase()}`;
        if (text) text.innerText = `Tỉ số ${gameState.p1Score} - ${gameState.p2Score} trước ${this.bodyName(this.bodies[this.stage])} (Bot ${BOT_LEVELS[st.level].name}).` +
            (playerWon ? (last ? ' Bạn đã vượt qua toàn bộ 5 vòng!' : ' Vòng tiếp theo đã mở.') : ' Thử lại để đi tiếp.');
        this.renderLadder(document.getElementById('pveResultLadder'), this.stage, results);
        const next = document.getElementById('pveNextBtn');
        if (next) next.style.display = (playerWon && !last) ? '' : 'none';
        const retry = document.getElementById('pveRetryBtn');
        if (retry) retry.innerHTML = playerWon ? (last ? '&#128260; ĐÁNH GIẢI MỚI' : '&#128260; ĐÁNH LẠI VÒNG NÀY') : '&#128260; THỬ LẠI VÒNG NÀY';
        const m = document.getElementById('pveResultModal');
        if (m) m.style.display = 'flex';
        if (soundSystem && !soundSystem.muted) { if (playerWon) soundSystem.playPowerup(); else soundSystem.playClick(); }
    },

    exit() {
        this.active = false;
        this.closeModals();
        if (this.saved) { gameState.winScore = this.saved.winScore; gameState.selectedMapMode = this.saved.map; this.saved = null; }
        botAI.enabled = false;
        botAI.mode = 'dummy';
        this.updateMenuProgress();
    },

    initEvents() {
        const on = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener('click', fn); };
        on('openPveBtn', () => this.openLobby());
        on('closePveBtn', () => this.closeModals());
        on('pveStartBtn', () => this.startStage(this.stage));
        on('pveNextBtn', () => this.startStage(this.stage + 1));
        on('pveRetryBtn', () => {
            if (this.stage === PVE_STAGES.length - 1 && gameState.p1Score > gameState.p2Score) { this.newRun(); this.startStage(0); }
            else this.startStage(this.stage);
        });
        on('pveMenuBtn', () => {
            this.exit();
            const back = document.getElementById('backToMainMenuBtn');
            if (back) back.click();
        });
        this.updateMenuProgress();
    },
};
