// ==========================================
// BOT TRONG GIẢI ĐẤU — người chơi ảo có cấp AI (1-5), tên, body cố định hoặc ngẫu nhiên.
// Dữ liệu bot nằm trong st.players[i].bot = { lv, body } ('random' | id body).
// - Điều khiển trận: begin({p1, p2}) — p2 bot dùng botAI (chế độ 'pve' như Giải PVE), p1 bot dùng SmartBot riêng
//   (online: bot luôn là xe phía máy chủ trận = p1, KHÔNG bật botAI vì p2 là người thật ở máy khách).
// - Tự chọn body + G.E.A.R ở hiệp 1, tự mua đồ các hiệp sau (botShopBuy) rồi sẵn sàng (gửi loadout khi online).
// - quickSim(): mô phỏng nhanh bot vs bot không vẽ, bằng đồng hồ giả (giống tools/sim.js), chạy từng lát
//   để không treo trang; xong khôi phục lại setTimeout / Date.now thật.
// ==========================================

const TourneyBot = {
    on: false,
    cfg: { p1: null, p2: null },   // {name, lv, body} đã chốt body
    speed: 1,                      // tốc độ xem trận bot (1 | 2)
    smart1: null,
    usedBotAI: false,
    simBusy: false,

    bodyIds() { return (typeof MODULES !== 'undefined' && MODULES.BODY) ? MODULES.BODY.map(m => m.id) : ['basic']; },
    bodyName(id) { const m = (typeof MODULES !== 'undefined' && MODULES.BODY || []).find(x => x.id === id); return m ? m.name : id; },
    // Chốt cấu hình bot cho 1 trận: body 'random' -> bốc ngẫu nhiên
    resolve(p) {
        if (!p || !p.bot) return null;
        const ids = this.bodyIds();
        const body = p.bot.body && p.bot.body !== 'random' && ids.includes(p.bot.body) ? p.bot.body : ids[Math.floor(Math.random() * ids.length)];
        return { name: p.name, lv: Math.max(1, Math.min(5, p.bot.lv | 0 || 3)), body };
    },
    lvName(lv) { return (typeof BOT_LEVELS !== 'undefined' && BOT_LEVELS[lv]) ? BOT_LEVELS[lv].name : 'Cấp ' + lv; },
    isBot(pid) { return this.on && !!this.cfg[pid]; },

    begin(c1, c2, speed) {
        this.end();
        this.on = !!(c1 || c2);
        this.cfg = { p1: c1 || null, p2: c2 || null };
        this.speed = speed === 2 ? 2 : 1;
        this.smart1 = c1 ? new SmartBot(c1.lv) : null;
        if (c2 && typeof botAI !== 'undefined') {
            botAI.enabled = true; botAI.mode = 'pve'; botAI.smart = new SmartBot(c2.lv);
            this.usedBotAI = true;
        }
    },
    end() {
        if (this.usedBotAI && typeof botAI !== 'undefined') { botAI.enabled = false; botAI.mode = 'dummy'; }
        this.usedBotAI = false;
        this.on = false; this.cfg = { p1: null, p2: null }; this.speed = 1; this.smart1 = null;
    },
    // Gọi mỗi tick vật lý (js/game/physics.js) — p2 do botAI.update lo
    update() {
        if (!this.on || !this.smart1 || gameState.phase !== 'playing') return;
        try { this.smart1.update(p1, p2, inputs.p1); } catch (e) { }
    },

    // Hiệp 1: chọn body của bot + G.E.A.R mốc 1 rồi sẵn sàng
    onPick(pid) {
        if (!this.isBot(pid)) return false;
        setTimeout(() => {
            const ready = pid === 'p1' ? gameState.p1Ready : gameState.p2Ready;
            if (!this.isBot(pid) || gameState.phase !== 'upgrade' || ready) return;
            const pl = pid === 'p1' ? p1 : p2, c = this.cfg[pid];
            if (!pl.upgrades.includes(c.body)) pl.addUpgrade(c.body);
            const fin = () => {
                const box = document.getElementById(pid + '-upgrades');
                if (box) {
                    box.innerHTML = `<div class="card" style="background:#7f1d1d"><h4>🤖 ${TOURNEY.esc(c.name)}: ${TOURNEY.esc(this.bodyName(c.body))}</h4><p>Bot ${this.lvName(c.lv)}</p></div>`;
                    if (typeof renderEquippedGearStrip === 'function') renderEquippedGearStrip(pid, box);
                }
                this.ready(pid);
            };
            if (typeof showGearSelectionIfNeeded === 'function') showGearSelectionIfNeeded(pid, fin); else fin();
        }, 300);
        return true;
    },
    // Các hiệp sau: tự mua đồ rồi sẵn sàng
    onShop(pid) {
        if (!this.isBot(pid)) return false;
        setTimeout(() => {
            const ready = pid === 'p1' ? gameState.p1Ready : gameState.p2Ready;
            if (!this.isBot(pid) || gameState.phase !== 'upgrade' || ready) return;
            try { if (typeof botShopBuy === 'function') botShopBuy(pid); } catch (e) { }
            this.ready(pid);
        }, 400);
        return true;
    },
    ready(pid) {
        handlePlayerReady(pid);
        if (typeof onlineManager !== 'undefined' && onlineManager.isOnline) { onlineManager.sendLoadout(pid); onlineManager.sendReady(pid); }
    },

    // ---------- MÔ PHỎNG NHANH (không vẽ, đồng hồ giả) ----------
    // cA = bot dưới (p1), cB = bot trên (p2). onStep(text) báo tiến độ; onDone(sa, sb).
    quickSim(cA, cB, opt, onStep, onDone) {
        if (this.simBusy) return false;
        this.simBusy = true;
        const W = Math.max(1, opt.winScore | 0 || 2), MAXR = W * 2 + 3, MAXT = 60 * 100, SLICE = 900;
        const real = { st: window.setTimeout, ct: window.clearTimeout, si: window.setInterval, raf: window.requestAnimationFrame, now: Date.now, pnow: performance.now.bind(performance) };
        const saved = { winScore: gameState.winScore, classic: gameState.classicMode, map: gameState.selectedMapMode, muted: soundSystem ? soundSystem.muted : true, endRound };
        const disp = ['mainMenu', 'tourneyOverlay', 'pauseMenuModal'].map(id => { const e = document.getElementById(id); return [e, e ? e.style.display : '']; });
        let now = real.now(), timers = [], tid = 1;
        const fake = {
            st: (fn, ms) => { timers.push({ t: now + (ms || 0), fn, id: tid }); return tid++; },
            ct: (id) => { timers = timers.filter(x => x.id !== id); },
        };
        const install = () => {
            window.setTimeout = fake.st; window.clearTimeout = fake.ct; window.setInterval = () => 0; window.requestAnimationFrame = () => 0;
            Date.now = () => now; performance.now = () => now - 1700000000000;
            if (soundSystem) soundSystem.muted = true;
        };
        const uninstall = () => {
            window.setTimeout = real.st; window.clearTimeout = real.ct; window.setInterval = real.si; window.requestAnimationFrame = real.raf;
            Date.now = real.now; performance.now = real.pnow;
            if (soundSystem) soundSystem.muted = saved.muted;
        };
        const advance = (ms) => {
            now += ms;
            const due = timers.filter(x => x.t <= now);
            if (due.length) { timers = timers.filter(x => x.t > now); for (const x of due) { try { x.fn(); } catch (e) { } } }
        };
        let sa = 0, sb = 0, round = 0, t = 0, winner, s1 = null, s2 = null, done = false;
        const startR = () => {
            round++; t = 0; winner = undefined;
            p1.upgrades = [cA.body]; p2.upgrades = [cB.body];
            gameState.selectedMapMode = 'classic';
            timers = [];
            startRound();
            s1 = new SmartBot(cA.lv); s2 = new SmartBot(cB.lv);
        };
        const finish = (err) => {
            if (done) return; done = true;
            try { endRound = saved.endRound; } catch (e) { }
            timers = [];
            uninstall();
            gameState.winScore = saved.winScore; gameState.classicMode = saved.classic; gameState.selectedMapMode = saved.map;
            gameState.phase = 'menu'; gameState.isPaused = false;
            ['upgradeScreen', 'endScreen'].forEach(id => { const e = document.getElementById(id); if (e) e.style.display = 'none'; });
            disp.forEach(([e, v]) => { if (e) e.style.display = v; }); // trả lại màn đang mở (startBattle ẩn menu chính)
            if (typeof animationId !== 'undefined') cancelAnimationFrame(animationId);
            this.simBusy = false;
            if (err) console.warn('TourneyBot.quickSim', err);
            onDone(sa, sb);
        };
        const slice = () => {
            if (done) return;
            install();
            try {
                if (!s1) {
                    gameState.winScore = 99; gameState.classicMode = !!opt.classic;
                    startBattle();
                    endRound = function (w) { winner = w; return saved.endRound.apply(this, arguments); };
                    startR();
                }
                for (let k = 0; k < SLICE; k++) {
                    try { s1.update(p1, p2, inputs.p1); } catch (e) { }
                    try { s2.update(p2, p1, inputs.p2); } catch (e) { }
                    advance(1000 / 60);
                    if (cinematicMode) { cinematicTimer--; if (cinematicTimer <= 0) { cinematicMode = false; endRound(cinematicWinnerId); } }
                    else if (gameState.phase === 'playing' || fatalCinematic.active) tickPhysics();
                    t++;
                    if (winner !== undefined || t >= MAXT) {
                        if (winner === 1) sa++; else if (winner === 2) sb++;
                        if (sa >= W || sb >= W || round >= MAXR) { uninstall(); return finish(); }
                        gameState.phase = 'upgrade';
                        startR();
                        break;
                    }
                }
            } catch (e) { uninstall(); return finish(e); }
            uninstall();
            if (onStep) { try { onStep(`Hiệp ${round} · ${sa} - ${sb}`); } catch (e) { } }
            real.st.call(window, slice, 0);
        };
        real.st.call(window, slice, 30);
        return true;
    },
};
