// ==========================================
// XEM TRẬN (khán giả chỉ đọc) — dùng cho giải đấu online (js/online/tourney-net.js)
// - Máy CHỦ TRẬN (onlineManager.role === 'host', máy mô phỏng chuẩn) mở thêm 1 peer "CYW-<mã trận>":
//   khán giả nối vào đó, nhận ĐÚNG các gói host gửi cho guest (SYNC delta/keyframe, START_ROUND, ROUND_END,
//   LOADOUT, CHAT, EMOTE, PAUSE_STATE). Mỗi gói chỉ JSON.stringify 1 lần rồi gửi cùng chuỗi cho mọi khán giả (tối đa SPEC_MAX).
// - Máy KHÁN GIẢ: onlineManager ở chế độ guest + spectator=true -> không mô phỏng, không gửi phím / chat / tạm dừng
//   (sendNetworkMessage bị chặn), chỉ xin keyframe (SYNC_KEY) qua kênh khán giả; vẽ bằng NetSmooth (nội suy cả 2 xe).
// Gói kênh khán giả: SPEC_HELLO (khán giả -> chủ trận) · SPEC_WELCOME / SPEC_FULL (chủ trận -> khán giả) · SYNC_KEY.
// ==========================================
const SPEC_MAX = 10;
const SPEC_FWD = new Set(['SYNC', 'START_ROUND', 'ROUND_END', 'LOADOUT', 'CHAT', 'EMOTE', 'PAUSE_STATE']);

const NetSpec = {
    // ---- phía chủ trận ----
    srv: null,          // { peer, id, conns: Set, info: {n1, n2, key} }
    n: 0,               // số khán giả đang mở (đọc nhanh trong sendNetworkMessage)
    // ---- phía khán giả ----
    watching: null,     // { key, peerId, peer, conn, n1, n2, phase, final, at, onEnd }
    _iv: null,

    om() { return typeof onlineManager !== 'undefined' ? onlineManager : null; },
    esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); },

    // ================= CHỦ TRẬN =================
    serve(code, info) {
        const id = 'CYW-' + code;
        if (this.srv && this.srv.id === id) { this.srv.info = info; return id; }
        this.stopServe();
        let p;
        try { p = makeNetPeer(id); } catch (e) { return null; }
        const s = { peer: p, id, conns: new Set(), info, keyAt: 0 };
        this.srv = s;
        p.on('connection', (c) => {
            c.on('data', (raw) => { try { this.srvData(s, c, raw); } catch (e) { console.warn('NetSpec srv', e); } });
            c.on('close', () => { s.conns.delete(c); this.n = this.srv === s ? s.conns.size : this.n; });
        });
        p.on('error', () => {});
        p.on('disconnected', () => { try { p.reconnect(); } catch (e) {} });
        return id;
    },
    srvData(s, c, raw) {
        const m = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (!m || this.srv !== s) return;
        if (m.type === 'SPEC_HELLO') {
            if (!s.conns.has(c) && s.conns.size >= SPEC_MAX) {
                try { c.send(JSON.stringify({ type: 'SPEC_FULL' })); } catch (e) {}
                setTimeout(() => { try { c.close(); } catch (e) {} }, 300);
                return;
            }
            s.conns.add(c); this.n = s.conns.size;
            try { c.send(JSON.stringify(this.welcome(s.info))); } catch (e) {}
            this.wantKey(s);
        } else if (m.type === 'SYNC_KEY' && s.conns.has(c)) this.wantKey(s);
    },
    // Ép keyframe ở lần chụp tới (giới hạn 4 lần/giây để khán giả không làm nặng máy chủ trận)
    wantKey(s) {
        const now = Date.now();
        if (now - s.keyAt < 250) return;
        s.keyAt = now;
        if (typeof NetState !== 'undefined') NetState._forceKey = true;
    },
    welcome(info) {
        const ld = (p, c) => (p && typeof NetState !== 'undefined') ? NetState.captureLoadout(p, c) : null;
        return {
            type: 'SPEC_WELCOME', n1: info.n1, n2: info.n2, key: info.key,
            phase: gameState.phase === 'playing' || (typeof fatalCinematic !== 'undefined' && fatalCinematic.active) ? 'playing' : gameState.phase,
            winScore: gameState.winScore, classic: !!gameState.classicMode, round: gameState.round, map: gameState.currentMap,
            s1: gameState.p1Score, s2: gameState.p2Score, gearTiers: gameState.matchGearTiers,
            p1Loadout: ld(typeof p1 !== 'undefined' ? p1 : null, gameState.p1Coins), p2Loadout: ld(typeof p2 !== 'undefined' ? p2 : null, gameState.p2Coins),
        };
    },
    // Gọi trong onlineManager.sendNetworkMessage (host) / receive (CHAT, EMOTE của guest)
    fwd(payload) {
        const s = this.srv;
        if (!s || !s.conns.size || !payload || !SPEC_FWD.has(payload.type)) return;
        let str;
        try { str = JSON.stringify(payload); } catch (e) { return; } // tuần tự hoá 1 lần cho mọi khán giả
        s.conns.forEach(c => { try { if (c.open) c.send(str); } catch (e) {} });
    },
    stopServe() {
        const s = this.srv;
        if (!s) return;
        this.srv = null; this.n = 0;
        const conns = [...s.conns];
        setTimeout(() => { conns.forEach(c => { try { c.close(); } catch (e) {} }); try { s.peer.destroy(); } catch (e) {} }, 200);
    },

    // ================= KHÁN GIẢ =================
    // opts: { key, peerId, n1, n2, onEnd(note) }
    watch(opts) {
        const om = this.om();
        if (!om || !opts || !opts.peerId) return false;
        this.stop(true);
        try { om.leaveRoom(); } catch (e) {}
        const w = { key: opts.key, peerId: opts.peerId, n1: opts.n1 || 'P1', n2: opts.n2 || 'P2', phase: 'connecting', final: false, at: Date.now(), heard: Date.now(), onEnd: opts.onEnd };
        this.watching = w;
        this.showUi();
        let p;
        try { p = makeNetPeer(); } catch (e) { this.end('❌ Lỗi mạng khi vào xem.'); return false; }
        w.peer = p;
        p.on('open', () => {
            if (this.watching !== w) return;
            const c = p.connect(w.peerId, { reliable: true });
            w.conn = c;
            const hello = () => { if (this.watching !== w || w.phase !== 'connecting') return; try { c.send(JSON.stringify({ type: 'SPEC_HELLO', nick: om.nick })); } catch (e) {} setTimeout(hello, 1500); };
            c.on('open', hello);
            c.on('data', (raw) => { if (this.watching !== w) return; let m; try { m = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch (e) { return; } w.heard = Date.now(); try { this.onData(w, m); } catch (e) { console.warn('NetSpec', e); } });
            c.on('close', () => { if (this.watching === w) this.end(w.final ? '' : '🔌 Trận đã kết thúc hoặc mất kết nối với máy chủ trận.'); });
        });
        p.on('error', (e) => { if (this.watching === w && w.phase === 'connecting') this.end('❌ Không vào xem được trận này' + (e && e.type ? ' (' + e.type + ')' : '') + '.'); });
        clearInterval(this._iv);
        this._iv = setInterval(() => this.tick(), 500);
        return true;
    },
    onData(w, m) {
        const om = this.om();
        if (m.type === 'SPEC_FULL') return this.end('👁 Trận đã đủ ' + SPEC_MAX + ' người xem.');
        if (m.type === 'SPEC_WELCOME') { if (w.phase === 'connecting') this.begin(w, m); return; }
        if (w.phase === 'connecting') return;
        if (typeof OnlineSocial !== 'undefined' && OnlineSocial.onMessage(m)) return;
        if (m.type === 'START_ROUND') w.phase = 'playing';
        if (m.type === 'SYNC' && gameState.phase !== 'playing' && !fatalCinematic.active) return;
        om.handleClientReceivedData(m);
    },
    begin(w, d) {
        const om = this.om();
        om.isOnline = true; om.role = 'guest'; om.spectator = true; om.matchActive = true; om.isJoinedSuccess = true;
        om.resetNetPrediction();
        document.body.classList.add('online-active', 'role-guest', 'spectating');
        document.body.classList.remove('role-host');
        ['onlineModal', 'mainMenu', 'endScreen', 'upgradeScreen', 'pauseMenuModal'].forEach(id => { const e = document.getElementById(id); if (e) { e.style.display = 'none'; e.classList.remove('active'); } });
        const tov = document.getElementById('tourneyOverlay'); if (tov) tov.style.display = 'none';
        if (typeof TOURNEY !== 'undefined') { TOURNEY.stopFx(); TOURNEY.applyNames({ name: d.n1 || w.n1 }, { name: d.n2 || w.n2 }); }
        w.n1 = d.n1 || w.n1; w.n2 = d.n2 || w.n2;
        updateCanvasDimensions();
        NetState.installHooks();
        gameState.winScore = d.winScore || 3; gameState.classicMode = !!d.classic;
        gameState.round = d.round || 1; gameState.p1Score = d.s1 | 0; gameState.p2Score = d.s2 | 0;
        gameState.p1Coins = 0; gameState.p2Coins = 0; gameState.isPaused = false;
        if (d.map) gameState.currentMap = d.map;
        if (Array.isArray(d.gearTiers)) gameState.matchGearTiers = [...d.gearTiers];
        p1 = new Player(1, '#3498db');
        p2 = new Player(2, '#e74c3c');
        if (Array.isArray(d.gearTiers)) { p1.gearTiers = [...d.gearTiers]; p2.gearTiers = [...d.gearTiers]; }
        if (d.p1Loadout) NetState.applyLoadout(p1, 'p1', d.p1Loadout);
        if (d.p2Loadout) NetState.applyLoadout(p2, 'p2', d.p2Loadout);
        updateScoreBoard();
        if (d.phase === 'playing') {
            w.phase = 'playing';
            startRound();
            if (d.map) { gameState.currentMap = d.map; if (typeof updateMapHUD === 'function') updateMapHUD(); }
        } else {
            w.phase = 'wait';
            gameState.phase = 'end_round';
        }
        this.showUi();
    },
    // Gọi từ guestEndRound khi máy này là khán giả
    onRoundEnd() {
        const w = this.watching; if (!w) return;
        const t = gameState.winScore || 3;
        if (gameState.p1Score >= t || gameState.p2Score >= t) { w.final = true; w.phase = 'final'; w.finalAt = Date.now(); }
        else { w.phase = 'wait'; gameState.round++; }
        this.showUi();
    },
    tick() {
        const w = this.watching;
        if (!w) { clearInterval(this._iv); this._iv = null; return; }
        const now = Date.now();
        if (w.phase === 'connecting' && now - w.at > 12000) return this.end('❌ Không vào xem được trận (máy chủ trận không trả lời).');
        if (w.phase === 'final' && now - w.finalAt > 5000) return this.end('');
        if (w.phase !== 'connecting' && !w.final && now - w.heard > 15000) return this.end('🔌 Mất tín hiệu trận đang xem.');
        this.showUi();
    },
    // Rời chế độ xem (quiet: không gọi onEnd, vd. đổi trận / được gọi vào trận)
    stop(quiet) {
        const w = this.watching;
        if (!w) return;
        this.watching = null;
        clearInterval(this._iv); this._iv = null;
        try { w.conn && w.conn.close(); } catch (e) {}
        setTimeout(() => { try { w.peer && w.peer.destroy(); } catch (e) {} }, 150);
        const om = this.om();
        if (om && om.spectator) {
            om.spectator = false;
            try { om.leaveRoom(); } catch (e) {}
        }
        document.body.classList.remove('spectating');
        if (typeof cancelAnimationFrame === 'function' && typeof animationId !== 'undefined') cancelAnimationFrame(animationId);
        if (typeof fatalCinematic !== 'undefined') fatalCinematic.active = false;
        gameState.phase = 'menu'; gameState.isPaused = false;
        ['endScreen', 'upgradeScreen', 'pauseMenuModal'].forEach(id => { const e = document.getElementById(id); if (e) e.style.display = 'none'; });
        if (typeof TOURNEY !== 'undefined') TOURNEY.restoreHud();
        this.hideUi();
        if (!quiet && w.onEnd) w.onEnd(w.lastNote || '');
    },
    end(note) { const w = this.watching; if (!w) return; w.lastNote = note || ''; this.stop(false); },

    // ---- giao diện khán giả: băng tên/tỉ số + nút đổi trận / rời ----
    showUi() {
        const w = this.watching; if (!w) return;
        let bar = document.getElementById('specBar');
        if (!bar) {
            bar = document.createElement('div');
            bar.id = 'specBar'; bar.className = 'spec-bar';
            (document.getElementById('gameContainer') || document.body).appendChild(bar);
            bar.addEventListener('click', (e) => {
                const b = e.target.closest && e.target.closest('[data-sp]');
                if (!b) return;
                if (b.dataset.sp === 'leave') this.end('');
                else if (b.dataset.sp === 'next' && typeof TourneyNet !== 'undefined') TourneyNet.switchWatch();
            });
        }
        bar.style.display = '';
        const other = typeof TourneyNet !== 'undefined' ? TourneyNet.watchable().filter(x => x.key !== w.key).length : 0;
        const msg = w.phase === 'connecting' ? '⏳ Đang vào xem...' : w.phase === 'wait' ? '🛒 Hai bên đang chọn nâng cấp — chờ hiệp sau...'
            : w.phase === 'final' ? `🏁 KẾT THÚC: ${this.esc(gameState.p1Score > gameState.p2Score ? w.n1 : gameState.p2Score > gameState.p1Score ? w.n2 : 'HOÀ')}${gameState.p1Score === gameState.p2Score ? '' : ' THẮNG'}` : '';
        const html = `<div class="spec-top"><span class="spec-eye">👁 ĐANG XEM:</span> <b class="spec-n1">${this.esc(w.n1)}</b> <span class="spec-sc">${gameState.p1Score | 0} - ${gameState.p2Score | 0}</span> <b class="spec-n2">${this.esc(w.n2)}</b></div>
            ${msg ? `<div class="spec-msg">${msg}</div>` : ''}
            <div class="spec-btns">${other ? '<button class="glow-btn btn-secondary spec-btn" data-sp="next">⇄ ĐỔI TRẬN</button>' : ''}<button class="glow-btn btn-dark spec-btn" data-sp="leave">✖ RỜI XEM</button></div>`;
        if (bar._h !== html) { bar.innerHTML = html; bar._h = html; }
    },
    hideUi() { const bar = document.getElementById('specBar'); if (bar) { bar.style.display = 'none'; bar._h = ''; } },
};
window.addEventListener('pagehide', () => { try { NetSpec.stop(true); NetSpec.stopServe(); } catch (e) {} });
