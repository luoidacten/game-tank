// ==========================================
// GIẢI ĐẤU ONLINE — 1 máy làm CHỦ GIẢI (giữ trạng thái chuẩn), người khác vào qua kênh "sảnh giải" nhẹ.
// - Chủ giải mở peer ID "CYT-xxxxx", quảng cáo lên sổ phòng (lobbyDir, key 'tour', huy hiệu 🏆).
// - Thành viên kết nối tới chủ giải: nhận bảng xếp hạng / lịch / trận đang đấu (chỉ xem) + chat.
// - Mỗi trận: chủ giải gửi TCALL cho 2 người (mã phòng riêng tư + mật khẩu tự sinh); 2 máy dùng luồng
//   online 2 người sẵn có (onlineManager.createRoom / joinRoom, bầu máy chủ), đấu xong CẢ HAI báo kết quả.
//   Khớp nhau -> ghi kết quả; lệch / rớt mạng -> chủ giải xử tay. Nhiều trận cùng vòng chạy song song.
// - Rớt kết nối: chủ giải có thể xử thua các trận chờ; vào lại đúng tên -> lấy lại slot.
// - Lịch đấu (st.sched): 'seq' Từng trận — mỗi lần chỉ gọi 1 trận, mọi máy rảnh (kể cả chủ giải) tự vào XEM trận đó;
//   'par' Song song — gọi mọi trận của vòng cùng lúc. Chủ giải đổi được bất cứ lúc nào (áp dụng cho lần gọi tới).
//   Chủ giải cũng là 1 người chơi (slot 0): trận của chủ giải đi qua cùng luồng TCALL (gửi cho chính mình).
// - Xem trận (js/online/spectate.js): máy chủ trận mở peer "CYW-<mã trận>", báo cho chủ giải qua TREPORT {spec};
//   chủ giải ghi vào st.live[key].w để máy rảnh nối vào xem (chỉ đọc, tối đa 10 người xem / trận).
// Giao thức kênh giải (trường t): TJOIN/TWELCOME/TDENY/TSTATE/TCALL/TREPORT/TCHAT/TCLOSE.
// ==========================================

const TourneyNet = {
    role: null,          // null | 'host' | 'member'
    code: null, pw: '',
    peer: null,          // host: peer "CYT-..."; member: peer ngẫu nhiên
    conns: {},           // host: tên -> DataConnection
    hostConn: null,      // member: kết nối tới chủ giải
    mem: [],             // member: cờ online theo slot (từ TSTATE)
    me: null,            // tên của máy này trong giải
    chat: [],
    sec: {},             // host: key trận -> {code,pw} (không gửi công khai)
    cur: null,           // trận máy này đang đấu {key,gen,code,pw,create,opp,winScore,classic,phase,tries,at}
    _left: false, _tries: 0, _timer: null,

    nick() { return (typeof onlineManager !== 'undefined' && onlineManager.nick) || 'Người chơi'; },
    st() { return TOURNEY.state; },
    esc(s) { return TOURNEY.esc(s); },
    rnd(n) { let s = ''; while (s.length < n) s += Math.random().toString(36).slice(2).toUpperCase(); return s.slice(0, n); },
    sfx(k) { try { if (soundSystem && !soundSystem.muted && soundSystem[k]) soundSystem[k](); } catch (e) {} },
    ensureTick() { if (!this._timer) this._timer = setInterval(() => this.tick(), 400); },

    // ================= CHỦ GIẢI =================
    host(d) {
        this.leave(true);
        const code = 'CYT-' + this.rnd(5);
        const nick = this.nick();
        const err = (m) => TOURNEY.err(m);
        err('⏳ Đang mở giải online...');
        let p;
        try { p = makeNetPeer(code); } catch (e) { return err('❌ Không mở được kết nối mạng.'); }
        const t = setTimeout(() => { try { p.destroy(); } catch (e) {} err('❌ Máy chủ PeerJS không trả lời, thử lại.'); }, 8000);
        p.on('open', () => {
            clearTimeout(t);
            this.role = 'host'; this.code = code; this.pw = String(d.pw || '').trim(); this.peer = p; this.me = nick;
            this._left = false; this.conns = {}; this.sec = {}; this.chat = [];
            TOURNEY.online = 'host';
            TOURNEY.state = {
                v: 1, online: true, code, locked: !!this.pw, host: nick, max: Math.max(3, Math.min(12, d.maxP | 0 || 8)),
                title: (d.title || '').trim() || '🏆 GIẢI ĐẤU ONLINE', theme: !!d.theme, winScore: d.winScore, classic: !!d.classic,
                pts: { win: d.pts.win, draw: d.pts.draw, loss: d.pts.loss }, players: [{ name: nick, color: TOURNEY_COLORS[0] }],
                rounds: [], status: 'lobby', lastRanks: null, lastMatch: null, live: {}, sched: d.sched === 'par' ? 'par' : 'seq',
            };
            TOURNEY.draft = null;
            TOURNEY.view = 'lobby';
            this.ensureTick();
            this.sysChat('Giải đã mở. Mã: ' + code);
            this.push();
            this.sfx('playPowerup');
        });
        p.on('connection', (c) => {
            c.on('data', (m) => { try { this.hostData(c, m); } catch (e) { console.warn('TourneyNet host', e); } });
            c.on('close', () => this.hostClose(c));
        });
        p.on('error', (e) => {
            if (p.open) return;
            clearTimeout(t); try { p.destroy(); } catch (x) {}
            err('❌ Lỗi mạng khi mở giải: ' + (e && e.type || '?'));
        });
        p.on('disconnected', () => { try { p.reconnect(); } catch (e) {} });
    },
    online(name) {
        if (!name) return false;
        if (name === this.me && this.role === 'host') return true;
        const c = this.conns[name];
        return !!(c && c.open);
    },
    idxOf(name) { const st = this.st(); return st ? st.players.findIndex(p => p.name.toLowerCase() === String(name).toLowerCase()) : -1; },
    hostData(c, m) {
        if (!m) return;
        const st = this.st();
        if (!st || this.role !== 'host') return;
        if (m.type === 'ROOM_PROBE') { // đo ping từ danh sách phòng
            const n = st.players.filter(p => this.online(p.name)).length;
            const open = st.status === 'lobby' ? st.players.length < st.max : st.status === 'running';
            try { c.send({ type: 'ROOM_PONG', t: m.t, players: n, open }); } catch (e) {}
            return;
        }
        const deny = (reason) => { try { c.send({ t: 'TDENY', reason }); } catch (e) {} setTimeout(() => { try { c.close(); } catch (e) {} }, 300); };
        switch (m.t) {
            case 'TJOIN': {
                if (c._nick && this.conns[c._nick] === c) { try { c.send({ t: 'TWELCOME', you: c._nick, chat: this.chat.slice(-30) }); c.send({ t: 'TSTATE', st, mem: this.mem }); } catch (e) {} return; } // gửi lại
                const name = String(m.nick || '').trim().slice(0, 16) || 'Khách';
                if (this.pw && String(m.pw || '').trim() !== this.pw) return deny(m.pw ? '❌ Sai mật khẩu giải!' : '🔒 Giải có mật khẩu — hãy nhập mật khẩu!');
                const i = this.idxOf(name);
                if (i >= 0) {
                    const old = this.conns[st.players[i].name];
                    if (st.players[i].name === this.me || (old && old.open && old !== c)) return deny('⚠️ Tên "' + name + '" đang được dùng trong giải. Đổi tên khác!');
                } else if (st.status !== 'lobby') return deny('⛔ Giải đã bắt đầu — chỉ người đã đăng ký (đúng tên) mới vào lại được.');
                else if (st.players.length >= st.max) return deny('⚠️ Giải đã đủ ' + st.max + ' người!');
                else st.players.push({ name, color: TOURNEY_COLORS[st.players.length % TOURNEY_COLORS.length] });
                const nm = st.players[this.idxOf(name)].name;
                c._nick = nm; this.conns[nm] = c;
                try { c.send({ t: 'TWELCOME', you: nm, chat: this.chat.slice(-30) }); } catch (e) {}
                this.sysChat(nm + (i >= 0 ? ' đã vào lại giải' : ' đã tham gia'));
                this.push();
                return;
            }
            case 'TREPORT': if (c._nick) this.onReport(c._nick, m); return;
            case 'TCHAT': if (c._nick) this.addChat(c._nick, m.text, true); return;
        }
    },
    hostClose(c) {
        if (!c._nick || this.conns[c._nick] !== c) return;
        delete this.conns[c._nick];
        if (this.role !== 'host') return;
        this.sysChat(c._nick + ' mất kết nối');
        this.push();
    },
    sendTo(name, msg) {
        if (this.role === 'host' && name === this.me) { setTimeout(() => this.onMsg(msg), 0); return; }
        const c = this.conns[name];
        try { if (c && c.open) c.send(msg); } catch (e) {}
    },
    bcast(msg) { Object.values(this.conns).forEach(c => { try { if (c && c.open) c.send(msg); } catch (e) {} }); },

    // Gửi trạng thái giải cho mọi thành viên + cập nhật quảng cáo + vẽ lại màn của chủ giải
    push() {
        const st = this.st();
        if (this.role !== 'host' || !st) return;
        st.live = st.live || {};
        for (const k in st.live) { const [r, m] = k.split('-').map(Number); if (!st.rounds[r] || st.rounds[r][m].res) { delete st.live[k]; delete this.sec[k]; } }
        const mem = st.players.map(p => this.online(p.name));
        this.mem = mem;
        this.bcast({ t: 'TSTATE', st, mem });
        if (typeof lobbyDir !== 'undefined') {
            if (st.status === 'done') lobbyDir.setAd(null, 'tour');
            else lobbyDir.setAd({
                code: this.code, name: st.title.slice(0, 28), host: this.me, kind: 'tour', locked: !!this.pw, max: st.max,
                players: st.status === 'lobby' ? st.players.length : mem.filter(Boolean).length,
                mode: (st.status === 'lobby' ? 'Chờ người · ' : 'Đang đấu · ') + 'Chạm ' + st.winScore,
            }, 'tour');
        }
        this.refresh();
    },
    startTourney() {
        const st = this.st();
        if (this.role !== 'host' || !st || st.status !== 'lobby') return;
        if (st.players.length < 3) return;
        st.rounds = tourneySchedule(st.players.length);
        st.status = 'running';
        this.sysChat('Giải bắt đầu! ' + TOURNEY.totalMatches(st) + ' trận');
        this.sfx('playPowerup');
        this.push();
    },
    curRound() {
        const st = this.st();
        for (let r = 0; r < st.rounds.length; r++) if (st.rounds[r].some(x => x.b !== null && !x.res)) return r;
        return -1;
    },
    // Gọi mọi trận chưa đấu của vòng hiện tại có đủ 2 người online (các cặp trong 1 vòng rời nhau -> song song)
    // Từng trận: chỉ gọi 1 trận khi không còn trận nào đang đấu
    busy() { const st = this.st(); return Object.values(st.live || {}).some(L => L.st === 'live'); },
    callRound() {
        const st = this.st(), r = this.curRound();
        if (r < 0) return;
        const seq = st.sched === 'seq';
        if (seq) st.autoSeq = true;
        st.rounds[r].forEach((x, m) => {
            const L = st.live[r + '-' + m];
            if (x.b === null || x.res || (L && L.st !== 'issue')) return;
            if (seq && this.busy()) return;
            if (this.online(st.players[x.a].name) && this.online(st.players[x.b].name)) this.call(r, m, true);
        });
        this.push();
    },
    setSched(v) {
        const st = this.st();
        if (this.role !== 'host' || !st || !['seq', 'par'].includes(v) || st.sched === v) return;
        st.sched = v; if (v !== 'seq') st.autoSeq = false;
        this.sysChat('🗓️ Lịch đấu: ' + (v === 'seq' ? 'Từng trận (mọi người cùng xem)' : 'Song song'));
        this.push();
    },
    schedHtml() {
        const st = this.st(), seq = st.sched === 'seq';
        if (this.role !== 'host') return `<p class="tf-note">🗓️ Lịch đấu: <b>${seq ? 'Từng trận (mọi người cùng xem)' : 'Song song'}</b></p>`;
        const b = (v, t) => `<button class="mode-btn ${st.sched === v ? 'active' : ''}" data-act="tn-sched" data-v="${v}">${t}</button>`;
        return `<label class="tf-lbl">LỊCH ĐẤU</label><div class="mode-options tn-sched">${b('seq', '👁 Từng trận (mọi người cùng xem)')}${b('par', '⚡ Song song')}</div>`;
    },
    call(r, m, quiet) {
        const st = this.st(), x = st.rounds[r] && st.rounds[r][m];
        if (!x || x.b === null || x.res) return;
        const key = r + '-' + m, A = st.players[x.a].name, B = st.players[x.b].name;
        const gen = ((st.live[key] && st.live[key].gen) || 0) + 1;
        const code = 'T' + this.rnd(6), pw = this.rnd(6);
        st.live[key] = { st: 'live', gen, rep: {}, note: '' };
        this.sec[key] = { code, pw };
        const base = { t: 'TCALL', key, gen, code, pw, winScore: st.winScore, classic: !!st.classic, title: st.title };
        this.sendTo(A, Object.assign({ create: true, opp: B }, base));
        this.sendTo(B, Object.assign({ create: false, opp: A }, base));
        this.sysChat(`📣 Gọi trận: ${A} vs ${B}`);
        if (!quiet) this.push();
    },
    onReport(nick, d) {
        const st = this.st(), L = st && st.live && st.live[d.key];
        if (!L || d.gen !== L.gen) return;
        const [r, m] = d.key.split('-').map(Number), x = st.rounds[r] && st.rounds[r][m];
        if (!x || x.res) return;
        const A = st.players[x.a].name, B = st.players[x.b].name;
        if (nick !== A && nick !== B) return;
        if (d.spec) { // máy chủ trận mở kênh xem
            L.w = String(d.spec).slice(0, 40); L.n1 = nick; L.n2 = nick === A ? B : A;
            this.push(); return;
        }
        if (d.drop) { L.st = 'issue'; L.note = nick + ': trận bị ngắt / rời trận'; this.push(); return; }
        const cl = (v) => Math.max(0, Math.min(9, v | 0));
        L.rep[nick] = { my: cl(d.my), opp: cl(d.opp) };
        const ra = L.rep[A], rb = L.rep[B];
        if (ra && rb) {
            if (ra.my === rb.opp && ra.opp === rb.my) { this.resolve(r, m, ra.my, ra.opp, false); return; }
            L.st = 'dispute'; L.note = 'Hai bên báo kết quả KHÁC nhau';
            this.sysChat(`⚠️ ${A} vs ${B}: báo cáo lệch nhau — chờ chủ giải xử`);
        } else L.st = 'wait';
        this.push();
    },
    resolve(r, m, sa, sb, ff) {
        const st = this.st(), x = st.rounds[r][m];
        delete st.live[r + '-' + m];
        this.sysChat(`✅ ${st.players[x.a].name} ${sa} - ${sb} ${st.players[x.b].name}${ff ? ' (xử)' : ''}`);
        TOURNEY.record(r, m, sa, sb, ff); // -> save() -> push()
        this.refresh(true);
        // Từng trận: tự gọi trận tiếp theo sau khi có kết quả
        if (st.sched === 'seq' && st.autoSeq) setTimeout(() => { const s2 = this.st(); if (this.role === 'host' && s2 && s2.status === 'running' && s2.sched === 'seq' && !this.busy()) this.callRound(); }, 2500);
    },

    // ================= THÀNH VIÊN =================
    join(code, pw, silent) {
        code = String(code || '').trim().toUpperCase();
        if (!silent) { this.leave(true); this._tries = 0; }
        const om = typeof onlineManager !== 'undefined' ? onlineManager : null;
        const loadJoin = document.getElementById('joinRoomLoading'), loadText = document.getElementById('joinRoomLoadingText');
        if (!silent && om) { om.hideErrorsAndLoading(); if (loadJoin) loadJoin.style.display = 'flex'; if (loadText) loadText.innerText = '🏆 Đang vào giải ' + code + '...'; }
        const fail = (msg) => {
            if (done) return; done = true; clearTimeout(t);
            try { p && p.destroy(); } catch (e) {}
            if (this.peer === p) this.peer = null;
            if (silent) { this.retryLater(); return; }
            if (om) om.showJoinError(msg); else alert(msg);
        };
        let done = false, p;
        const t = setTimeout(() => fail('❌ Không kết nối được tới giải "' + code + '".'), 10000);
        try { p = makeNetPeer(); } catch (e) { return fail('❌ Lỗi mạng.'); }
        this.peer = p; this.code = code; this.pw = String(pw || '').trim(); this._left = false;
        p.on('open', () => {
            const c = p.connect(code, { reliable: true });
            const hello = () => { if (done || p.destroyed) return; try { c.send({ t: 'TJOIN', nick: this.nick(), pw: this.pw }); } catch (e) {} setTimeout(hello, 2000); };
            c.on('open', hello); // gửi lại tới khi được trả lời (gói đầu có thể bị mất)
            c.on('data', (m) => {
                if (!m) return;
                if (m.t === 'TDENY') { this._left = true; return fail(m.reason || 'Bị từ chối'); }
                if (m.t === 'TWELCOME' && !done) {
                    done = true; clearTimeout(t);
                    this.role = 'member'; this.hostConn = c; this.me = m.you; this._tries = 0;
                    if (Array.isArray(m.chat)) { this.chat = m.chat; this.renderChat(); }
                    if (!silent) TOURNEY.state = null; // chờ TSTATE đầu tiên (không lẫn giải offline của máy này)
                    TOURNEY.online = 'member';
                    this.ensureTick();
                    if (!silent) this.enterUI();
                    return;
                }
                if (this.hostConn === c) this.onMsg(m);
            });
            c.on('close', () => { if (this.hostConn === c) this.memClose(); });
            c.on('error', () => fail('❌ Không kết nối được tới giải "' + code + '".'));
        });
        p.on('error', (e) => { if (!done) fail(e && e.type === 'peer-unavailable' ? '❌ Không tìm thấy giải "' + code + '" (đã đóng?).' : '❌ Lỗi mạng: ' + (e && e.type || '?')); });
    },
    enterUI() {
        const om = typeof onlineManager !== 'undefined' ? onlineManager : null;
        if (om) om.hideErrorsAndLoading();
        const md = document.getElementById('onlineModal');
        if (md) { md.style.display = 'none'; md.classList.remove('active'); }
        const mm = document.getElementById('mainMenu'); if (mm) mm.style.display = 'none';
        TOURNEY.el('tourneyOverlay').style.display = 'flex';
        this.sfx('playPowerup');
        if (TOURNEY.state) this.showMain();
        else { TOURNEY.view = 'lobby'; TOURNEY.render('<div class="tf-card"><p class="tf-note">⏳ Đang tải giải đấu...</p></div>'); this.renderChat(); }
    },
    memClose() {
        this.hostConn = null;
        if (this._left || this.role !== 'member') return;
        this.note = '🔌 Mất kết nối chủ giải — đang thử vào lại...';
        this.refresh();
        this.retryLater();
    },
    retryLater() {
        if (this._left || this.role !== 'member') return;
        if (++this._tries > 20) { this.note = '❌ Không vào lại được giải. Chủ giải đã đóng?'; this.refresh(); return; }
        clearTimeout(this._rt);
        this._rt = setTimeout(() => { if (!this._left && !this.hostConn) this.join(this.code, this.pw, true); }, 2500);
    },
    // Tin từ chủ giải (member) hoặc tin chủ giải gửi cho chính mình
    onMsg(m) {
        switch (m.t) {
            case 'TSTATE':
                if (this.role !== 'member') return;
                this.note = '';
                { const old = TOURNEY.state, anim = !old || JSON.stringify(old.lastMatch) !== JSON.stringify(m.st.lastMatch);
                  TOURNEY.state = m.st; this.mem = m.mem || []; this.refresh(anim && !!m.st.lastMatch); }
                return;
            case 'TCHAT': this.addChat(m.nick, m.text, false); return;
            case 'TCALL': this.onCall(m); return;
            case 'TCLOSE':
                this._left = true;
                this.note = '🏁 Chủ giải đã đóng giải.';
                this.refresh();
                return;
        }
    },
    report(extra) {
        const c = this.cur; if (!c) return;
        const msg = Object.assign({ t: 'TREPORT', key: c.key, gen: c.gen }, extra);
        if (this.role === 'host') this.onReport(this.me, msg);
        else if (this.hostConn && this.hostConn.open) { try { this.hostConn.send(msg); } catch (e) {} }
    },

    // ================= TRẬN ĐẤU (cả chủ giải lẫn thành viên) =================
    onCall(m) {
        const om = typeof onlineManager !== 'undefined' ? onlineManager : null;
        if (!om) return;
        if (typeof NetSpec !== 'undefined' && NetSpec.watching) NetSpec.stop(true); // đang xem trận khác -> vào trận của mình
        if (this.cur && this.cur.phase === 'playing' && om.matchActive) return; // đang đấu trận khác
        if (this.cur) this.dropRoom();
        this.cur = { key: m.key, gen: m.gen, code: m.code, pw: m.pw, create: !!m.create, opp: m.opp, winScore: m.winScore, classic: !!m.classic, title: m.title || '', phase: 'connecting', tries: 0, at: Date.now(), next: 0 };
        this.savedWin = this.savedWin || { winScore: gameState.winScore, classic: gameState.classicMode };
        const md = document.getElementById('onlineModal'); if (md) { md.style.display = 'none'; md.classList.remove('active'); }
        const mm = document.getElementById('mainMenu'); if (mm) mm.style.display = 'none';
        TOURNEY.el('tourneyOverlay').style.display = 'flex';
        this.showMatchWait();
        this.connectMatch();
        this.sfx('playPowerup');
    },
    connectMatch() {
        const c = this.cur, om = onlineManager;
        if (!c) return;
        c.tries++;
        if (c.create) om.createRoom({ code: c.code, pw: c.pw, name: '🏆 ' + (c.title || 'Giải đấu').slice(0, 20), winScore: c.winScore });
        else { c.next = Date.now() + 9000; setTimeout(() => { if (this.cur === c && c.phase === 'connecting') om.joinRoom(c.code, c.pw); }, c.tries === 1 ? 1200 : 0); }
    },
    tick() {
        const c = this.cur, om = typeof onlineManager !== 'undefined' ? onlineManager : null;
        if (!c && om) this.autoWatch();
        if (!c || !om) return;
        if (c.phase === 'playing' && om.role === 'host' && om.matchActive && !c.spec && typeof NetSpec !== 'undefined') {
            c.spec = NetSpec.serve(c.code, { n1: this.me, n2: c.opp, key: c.key }); // máy chủ trận: mở kênh xem
            if (c.spec) this.report({ spec: c.spec });
        }
        if (c.phase === 'connecting') {
            if (om.matchActive) { c.phase = 'playing'; TOURNEY.el('tourneyOverlay').style.display = 'none'; TOURNEY.stopFx(); return; }
            const ready = om.isOnline && om.playersLobbyData.length >= 2 && (!om.elect || om.elect.done);
            if (ready) {
                if (typeof OnlineSocial !== 'undefined') OnlineSocial.applySettings(OnlineSocial.settings.map, c.winScore, c.classic);
                gameState.winScore = c.winScore; gameState.classicMode = c.classic;
                if (om.role === 'host' && !c.startAt) c.startAt = Date.now() + 600; // chờ bầu máy chủ / cài đặt sảnh lắng xuống
                if (om.role === 'host' && c.startAt && Date.now() >= c.startAt) { c.startAt = 0; om.hostStartMatch(); }
            } else c.startAt = 0;
            // Người vào phòng: chưa vào được (phòng chưa mở / lỗi) -> thử lại
            if (!c.create && !om.isOnline && Date.now() > c.next && c.tries < 8) this.connectMatch();
            if (c.create && !om.isOnline && c.tries < 4 && Date.now() - c.at > 3000 * c.tries) this.connectMatch();
        }
    },
    // Gọi từ round.js (máy chủ trận) / guestEndRound (máy khách trận) khi 1 bên đủ số hiệp thắng
    onMatchEnd(s1, s2) {
        const c = this.cur, om = typeof onlineManager !== 'undefined' ? onlineManager : null;
        if (!c || !om || !om.isOnline || c.phase === 'done') return false;
        const guest = om.myPid() === 'p2';
        const my = guest ? s2 : s1, opp = guest ? s1 : s2;
        c.phase = 'done'; c.my = my; c.opp = opp;
        this.report({ my, opp });
        setTimeout(() => {
            if (this.cur !== c) return;
            const fw = TOURNEY.el('finalWinner'), fs = TOURNEY.el('finalScoreSummary');
            if (fw) fw.innerText = my > opp ? 'BẠN THẮNG!' : my < opp ? 'BẠN THUA!' : 'HOÀ!';
            if (fs) fs.innerText = `${this.me} ${my} - ${opp} ${c.opp} · đã gửi kết quả cho chủ giải`;
            ['restartBtn', 'backToMenuFromEndBtn'].forEach(id => { const e = TOURNEY.el(id); if (e) e.style.display = 'none'; });
            const tb = TOURNEY.el('tourneyBackBtn'); if (tb) tb.style.display = '';
            const es = TOURNEY.el('endScreen'); if (es) es.style.display = 'block';
            this.sfx('playPowerup');
        }, 1200);
        return true;
    },
    // Phòng 2 người báo mất đối thủ: trả về true nếu giải tự xử lý (không hiện cảnh báo mặc định)
    onRoomDrop() {
        const c = this.cur;
        if (!c) return false;
        if (c.phase === 'done') { this.dropRoom(); return true; }
        if (c.phase === 'playing') {
            this.report({ drop: true });
            this.backToHub('⚠️ Trận bị ngắt (đối thủ rời / mất mạng). Đã báo chủ giải.');
            return true;
        }
        // còn ở sảnh trận: dựng lại phòng / thử vào lại
        this.dropRoom();
        c.at = Date.now(); c.tries = 0; c.next = Date.now() + 1500;
        if (c.create) setTimeout(() => { if (this.cur === c) this.connectMatch(); }, 500);
        return true;
    },
    dropRoom() {
        const om = typeof onlineManager !== 'undefined' ? onlineManager : null;
        if (!om) return;
        const c = this.cur; if (c) c.phase = c.phase === 'playing' ? 'done' : c.phase;
        const keep = this.cur; this.cur = null; // tránh vòng lặp onRoomDrop khi rời phòng
        try { om.leaveRoom(); } catch (e) {}
        this.cur = keep;
    },
    // Về bảng giải sau trận / khi huỷ / bỏ trận
    backToHub(note) {
        this.dropRoom();
        this.cur = null;
        if (this.savedWin) { gameState.winScore = this.savedWin.winScore; gameState.classicMode = this.savedWin.classic; this.savedWin = null; }
        TOURNEY.restoreHud();
        ['endScreen', 'upgradeScreen', 'pauseMenuModal', 'mainMenu', 'onlineModal'].forEach(id => { const e = TOURNEY.el(id); if (e) e.style.display = 'none'; });
        gameState.phase = 'menu'; gameState.isPaused = false;
        if (typeof animationId !== 'undefined') cancelAnimationFrame(animationId);
        if (note) this.note = note;
        TOURNEY.el('tourneyOverlay').style.display = 'flex';
        this.showMain(true);
    },
    // ================= XEM TRẬN =================
    watchable() {
        const st = this.st();
        if (!st || !st.live || st.status !== 'running') return [];
        return Object.keys(st.live).filter(k => { const L = st.live[k]; return L.st === 'live' && L.w && L.n1 !== this.me && L.n2 !== this.me; })
            .sort().map(k => ({ key: k, w: st.live[k].w, n1: st.live[k].n1, n2: st.live[k].n2 }));
    },
    watchKey(key) {
        const x = this.watchable().find(q => q.key === key);
        if (!x || this.cur || typeof NetSpec === 'undefined') return false;
        this.note = '';
        return NetSpec.watch({ key, peerId: x.w, n1: x.n1, n2: x.n2, onEnd: (note) => this.afterWatch(key, note) });
    },
    switchWatch() {
        const list = this.watchable(), cur = NetSpec.watching && NetSpec.watching.key;
        if (!list.length) return;
        const i = list.findIndex(q => q.key === cur);
        const nx = list[(i + 1) % list.length];
        if (nx && nx.key !== cur) this.watchKey(nx.key);
    },
    afterWatch(key, note) {
        this.noAuto = key; // đã rời / xem xong trận này: không tự vào lại
        if (note) this.note = note;
        if (!this.role) return;
        TOURNEY.el('tourneyOverlay').style.display = 'flex';
        this.showMain(true);
    },
    // Từng trận: máy rảnh đang ở bảng giải tự vào xem trận đang đấu
    autoWatch() {
        const st = this.st();
        if (!st || st.sched !== 'seq' || st.status !== 'running' || this.cur || typeof NetSpec === 'undefined' || NetSpec.watching) return;
        const ov = TOURNEY.el('tourneyOverlay');
        if (!ov || ov.style.display === 'none' || TOURNEY.view !== 'hub') return;
        const x = this.watchable().find(q => q.key !== this.noAuto);
        if (x) this.watchKey(x.key);
    },
    showMatchWait() {
        const c = this.cur;
        TOURNEY.view = 'match';
        TOURNEY.render(`<div class="tf-card">
            <div class="tf-head"><span class="tf-cake">⚔️</span><h2>TRẬN GIẢI ĐẤU</h2></div>
            <div class="tf-vsline"><b class="tf-name big">${this.esc(this.me)}</b><span class="tf-vsbig">VS</span><b class="tf-name big">${this.esc(c.opp)}</b></div>
            <p class="tf-note">⏳ Đang kết nối trực tiếp với đối thủ (phòng riêng ${this.esc(c.code)})… Trận tự bắt đầu khi 2 bên vào phòng.</p>
            <p class="tf-note">Chạm ${c.winScore} · ${c.classic ? 'CỔ ĐIỂN' : 'G.E.A.R'}</p>
            <button class="glow-btn btn-dark tf-btn" data-act="tn-cancel">✖ HUỶ, VỀ BẢNG GIẢI</button></div>`);
    },

    // ================= GIAO DIỆN =================
    showMain(anim) {
        const st = this.st();
        if (!st) return;
        if (this.cur && this.cur.phase === 'connecting') return this.showMatchWait();
        if (st.status === 'done') TOURNEY.showPodium(anim);
        else if (st.status === 'lobby') this.showLobby();
        else TOURNEY.showHub(anim);
        this.renderChat();
    },
    // Vẽ lại khi trạng thái đổi (giữ vị trí cuộn, không phá hộp thoại đang mở)
    refresh(anim) {
        TOURNEY.updateMenuCard();
        const ov = TOURNEY.el('tourneyOverlay');
        if (!ov || ov.style.display === 'none' || !['hub', 'lobby', 'podium'].includes(TOURNEY.view)) return;
        if (TOURNEY.view === 'podium' && this.st().status === 'done') return;
        const y = ov.scrollTop;
        this.showMain(anim);
        ov.scrollTop = y;
    },
    noteHtml() { return this.note ? `<div class="tf-err tn-note">${this.esc(this.note)}</div>` : ''; },
    codeHtml() {
        const st = this.st();
        return `<div class="tn-code">🌐 GIẢI ONLINE · Mã <b>${this.esc(st.code)}</b>${st.locked ? ' · 🔒 có mật khẩu' : ''} · 👑 ${this.esc(st.host)}</div>`;
    },
    dot(i) {
        const on = this.role === 'host' ? this.online(this.st().players[i].name) : !!this.mem[i];
        return `<span class="tn-on ${on ? 'on' : ''}" title="${on ? 'Đang kết nối' : 'Mất kết nối'}"></span>`;
    },
    showLobby() {
        const st = this.st(), host = this.role === 'host';
        TOURNEY.view = 'lobby';
        TOURNEY.setTheme(st.theme);
        const rows = st.players.map((p, i) => `<div class="tf-prow tn-prow">
            <span class="tf-pnum">${i + 1}</span>${this.dot(i)}
            <b class="tf-name" style="--pc:${p.color}">${this.esc(p.name)}</b>${p.name === st.host ? ' 👑' : ''}${p.name === this.me ? ' <small>(bạn)</small>' : ''}
            ${host && i > 0 ? `<button class="tf-x" data-act="tn-kick" data-i="${i}" title="Loại">✕</button>` : ''}</div>`).join('');
        TOURNEY.render(`<div class="tf-card">
            ${TOURNEY.headHtml()}${this.codeHtml()}${this.noteHtml()}
            <p class="tf-note">Chạm ${st.winScore} · ${st.classic ? 'CỔ ĐIỂN' : 'G.E.A.R'} · Thắng ${st.pts.win} / Hoà ${st.pts.draw} / Thua ${st.pts.loss}</p>
            <label class="tf-lbl">NGƯỜI CHƠI (${st.players.length}/${st.max})</label>
            <div class="tf-plist">${rows}</div>
            ${this.schedHtml()}
            ${host ? `<button class="glow-btn btn-primary tf-btn" data-act="tn-start" ${st.players.length < 3 ? 'disabled' : ''}>🏁 BẮT ĐẦU GIẢI (${st.players.length} người)</button>
                <p class="tf-note">Giải hiện trong danh sách phòng online (🏆). Cần ít nhất 3 người.</p>`
                : '<p class="tf-note">⏳ Chờ chủ giải bắt đầu...</p>'}
            <div class="tf-actions">${this.actsHtml(true)}</div></div>`);
    },
    liveLabel(L) {
        if (!L) return '';
        return L.st === 'live' ? '⚔️ ĐANG ĐẤU' : L.st === 'wait' ? '⏳ CHỜ XÁC NHẬN' : L.st === 'dispute' ? '⚠️ LỆCH KẾT QUẢ' : '🔌 SỰ CỐ';
    },
    // Thẻ "vòng hiện tại" thay cho thẻ trận tiếp theo của bản offline
    liveHtml() {
        const st = this.st(), r = this.curRound(), host = this.role === 'host';
        if (r < 0) return '';
        const rows = st.rounds[r].map((x, m) => {
            if (x.b === null) return `<div class="tf-match bye">${TOURNEY.pname(x.a)} <span class="tf-vs">nghỉ</span></div>`;
            const key = r + '-' + m, L = st.live && st.live[key];
            const res = x.res ? `<span class="tf-score">${x.res.sa} - ${x.res.sb}</span>` : `<span class="tf-vs">${L ? this.liveLabel(L) : 'chờ gọi'}</span>`;
            const btns = host && !x.res ? `<div class="tn-mbtns">
                ${(!L || L.st === 'issue') && !(st.sched === 'seq' && this.busy()) ? `<button class="glow-btn btn-primary tn-sbtn" data-act="tn-call" data-k="${key}">📣 GỌI</button>` : ''}
                <button class="glow-btn btn-dark tn-sbtn" data-act="tn-res" data-k="${key}">⚖️ XỬ</button></div>` : '';
            const mine = !x.res && (st.players[x.a].name === this.me || st.players[x.b].name === this.me) ? ' tn-mine' : '';
            const canW = !x.res && !mine && L && L.st === 'live' && L.w;
            const wbtn = canW ? `<div class="tn-mbtns"><button class="glow-btn btn-secondary tn-sbtn" data-act="tn-watch" data-k="${key}">👁 XEM</button></div>` : '';
            return `<div class="tn-mrow${mine}" data-k="${key}" data-st="${x.res ? 'done' : L ? L.st : 'idle'}"><div class="tf-match ${x.res ? 'done' : 'cur'}"><span>${this.dot(x.a)}${TOURNEY.pname(x.a)}</span> ${res} <span>${TOURNEY.pname(x.b)}${this.dot(x.b)}</span></div>
                ${L && L.note ? `<div class="tn-mnote">${this.esc(L.note)}</div>` : ''}${wbtn}${btns}</div>`;
        }).join('');
        return `<div class="tf-next">${this.codeHtml()}${this.noteHtml()}
            <div class="tf-ntitle">VÒNG ${r + 1} · ĐÃ ĐẤU ${TOURNEY.playedMatches(st)}/${TOURNEY.totalMatches(st)} · CHẠM ${st.winScore} · ${st.classic ? 'CỔ ĐIỂN' : 'G.E.A.R'}</div>
            ${rows}
            ${this.schedHtml()}
            ${host ? `<button class="glow-btn btn-primary tf-btn tf-start" data-act="tn-callall" ${st.sched === 'seq' && this.busy() ? 'disabled' : ''}>${st.sched === 'seq' ? '📣 GỌI TRẬN TIẾP THEO' : '📣 GỌI CÁC TRẬN CỦA VÒNG'}</button>` : '<p class="tf-note">Chủ giải sẽ gọi trận — máy bạn tự vào trận khi tới lượt.</p>'}
            ${st.sched === 'seq' ? '<p class="tf-note">👁 Từng trận: máy không đấu tự vào xem trận đang diễn ra.</p>' : ''}</div>`;
    },
    actsHtml(final) {
        if (this.role === 'host') return `${final ? '' : '<button class="glow-btn btn-secondary tf-btn" data-act="endearly">🏁 KẾT THÚC SỚM</button>'}
            <button class="glow-btn btn-secondary tf-btn" data-act="tn-close">✖ ĐÓNG GIẢI</button>
            <button class="glow-btn btn-dark tf-btn" data-act="menu">← MENU CHÍNH</button>`;
        return `<button class="glow-btn btn-secondary tf-btn" data-act="tn-leave">🚪 RỜI GIẢI</button>
            <button class="glow-btn btn-dark tf-btn" data-act="menu">← MENU CHÍNH</button>`;
    },
    showResolve(key) {
        const st = this.st(), [r, m] = key.split('-').map(Number), x = st.rounds[r][m], L = st.live[key];
        const A = st.players[x.a].name, B = st.players[x.b].name;
        TOURNEY.view = 'forfeit';
        TOURNEY.ffTarget = { r, m };
        const rep = L && L.rep ? [A, B].filter(n => L.rep[n]).map(n => {
            const q = L.rep[n], sa = n === A ? q.my : q.opp, sb = n === A ? q.opp : q.my;
            return `<button class="glow-btn btn-primary tf-btn" data-act="tn-acc" data-k="${key}" data-v="${this.esc(n)}">✔ Theo báo cáo của ${this.esc(n)}: ${this.esc(A)} ${sa} - ${sb} ${this.esc(B)}</button>`;
        }).join('') : '';
        TOURNEY.render(`<div class="tf-card">
            <div class="tf-head"><h2>⚖️ XỬ TRẬN</h2></div>
            <div class="tf-vsline">${TOURNEY.pname(x.a, 'big')}<span class="tf-vsbig">VS</span>${TOURNEY.pname(x.b, 'big')}</div>
            <p class="tf-note">${L ? this.liveLabel(L) + (L.note ? ' — ' + this.esc(L.note) : '') : 'Trận chưa gọi.'}</p>
            ${rep}
            <button class="glow-btn btn-secondary tf-btn" data-act="ff" data-v="a">${this.esc(A)} bỏ cuộc → ${this.esc(B)} thắng</button>
            <button class="glow-btn btn-secondary tf-btn" data-act="ff" data-v="b">${this.esc(B)} bỏ cuộc → ${this.esc(A)} thắng</button>
            <button class="glow-btn btn-secondary tf-btn" data-act="ff" data-v="d">🤝 Xử HOÀ</button>
            <button class="glow-btn btn-secondary tf-btn" data-act="tn-call" data-k="${key}">📣 ĐẤU LẠI (gọi lại trận)</button>
            <button class="glow-btn btn-dark tf-btn" data-act="hub">← HUỶ</button></div>`);
    },
    // Nút data-act="tn-*" (TOURNEY.onClick chuyển sang)
    onAct(act, b) {
        const st = this.st(), host = this.role === 'host';
        switch (act) {
            case 'tn-start': if (host) this.startTourney(); break;
            case 'tn-callall': if (host) this.callRound(); break;
            case 'tn-call': if (host) { this.call(...b.dataset.k.split('-').map(Number)); this.showMain(); } break;
            case 'tn-res': if (host) this.showResolve(b.dataset.k); break;
            case 'tn-acc': {
                if (!host) break;
                const [r, m] = b.dataset.k.split('-').map(Number), L = st.live[b.dataset.k], x = st.rounds[r][m];
                const q = L && L.rep[b.dataset.v]; if (!q) break;
                const isA = st.players[x.a].name === b.dataset.v;
                TOURNEY.ffTarget = null;
                this.resolve(r, m, isA ? q.my : q.opp, isA ? q.opp : q.my, false);
                this.showMain(true);
                break;
            }
            case 'tn-kick': {
                if (!host || st.status !== 'lobby') break;
                const p = st.players[+b.dataset.i]; if (!p || p.name === this.me) break;
                const c = this.conns[p.name];
                if (c) { try { c.send({ t: 'TDENY', reason: '⛔ Bạn đã bị chủ giải loại khỏi danh sách.' }); } catch (e) {} delete this.conns[p.name]; setTimeout(() => { try { c.close(); } catch (e) {} }, 300); }
                st.players.splice(+b.dataset.i, 1);
                st.players.forEach((q, i) => { q.color = TOURNEY_COLORS[i % TOURNEY_COLORS.length]; });
                this.push();
                break;
            }
            case 'tn-close': TOURNEY.confirmBox('Đóng giải online? Mọi thành viên sẽ bị ngắt kết nối và kết quả bị xoá.', 'tn-doclose'); break;
            case 'tn-doclose': this.leave(); TOURNEY.showSetup(); break;
            case 'tn-leave': this.leave(); TOURNEY.closeToMenu(); break;
            case 'tn-cancel': this.backToHub(); break;
            case 'tn-chat': this.sendChatFromInput(); break;
            case 'tn-sched': this.setSched(b.dataset.v); break;
            case 'tn-watch': if (!this.watchKey(b.dataset.k)) { this.note = '❌ Trận này chưa xem được.'; this.showMain(); } break;
        }
    },
    // Huỷ / rời giải (host: đóng giải). quiet: không đổi UI
    leave(quiet) {
        this._left = true;
        clearTimeout(this._rt);
        if (this.cur) { this.dropRoom(); this.cur = null; }
        if (typeof NetSpec !== 'undefined' && NetSpec.watching) NetSpec.stop(true);
        this.noAuto = null;
        if (this.role === 'host') { this.bcast({ t: 'TCLOSE' }); if (typeof lobbyDir !== 'undefined') lobbyDir.setAd(null, 'tour'); }
        const p = this.peer, conns = Object.values(this.conns), hc = this.hostConn;
        setTimeout(() => { conns.forEach(c => { try { c.close(); } catch (e) {} }); try { hc && hc.close(); } catch (e) {} try { p && p.destroy(); } catch (e) {} }, 150);
        this.peer = null; this.conns = {}; this.hostConn = null; this.role = null; this.me = null; this.note = ''; this.chat = []; this.mem = [];
        if (TOURNEY.online) { TOURNEY.online = null; TOURNEY.state = TOURNEY.load(); }
        this.renderChat();
        if (!quiet) TOURNEY.updateMenuCard();
    },

    // ================= CHAT =================
    addChat(nick, text, relay) {
        text = String(text || '').trim().slice(0, 120);
        if (!text) return;
        const line = { n: String(nick || '').slice(0, 16), x: text };
        this.chat.push(line); if (this.chat.length > 60) this.chat.shift();
        if (relay && this.role === 'host') this.bcast({ t: 'TCHAT', nick: line.n, text });
        this.renderChat();
    },
    sysChat(text) { this.addChat('', text, true); },
    sendChatFromInput() {
        const inp = document.getElementById('tnChatIn');
        if (!inp || !inp.value.trim()) return;
        const now = Date.now(); if (now - (this._chatAt || 0) < 800) return; this._chatAt = now;
        const text = inp.value.trim().slice(0, 120); inp.value = '';
        if (this.role === 'host') this.addChat(this.me, text, true);
        else if (this.hostConn && this.hostConn.open) { try { this.hostConn.send({ t: 'TCHAT', text }); } catch (e) {} }
    },
    renderChat() {
        const ov = TOURNEY.el('tourneyOverlay');
        if (!ov) return;
        let box = document.getElementById('tnChat');
        ov.classList.toggle('tn-online', !!this.role);
        if (!this.role) { if (box) box.style.display = 'none'; return; }
        if (!box) {
            box = document.createElement('div');
            box.id = 'tnChat'; box.className = 'tn-chat';
            box.innerHTML = '<div class="tn-chat-log" id="tnChatLog"></div><div class="tn-chat-row"><input id="tnChatIn" class="tf-in" maxlength="120" placeholder="Chat với cả giải..."><button class="glow-btn btn-primary tn-sbtn" data-act="tn-chat">GỬI</button></div>';
            ov.appendChild(box);
            box.querySelector('#tnChatIn').addEventListener('keydown', (e) => { if (e.key === 'Enter') this.sendChatFromInput(); });
        }
        box.style.display = '';
        const log = document.getElementById('tnChatLog');
        log.innerHTML = this.chat.slice(-30).map(l => l.n ? `<div><b>${this.esc(l.n)}:</b> ${this.esc(l.x)}</div>` : `<div class="tn-sys">${this.esc(l.x)}</div>`).join('');
        log.scrollTop = log.scrollHeight;
    },
};
window.addEventListener('pagehide', () => { try { if (TourneyNet.role) TourneyNet.leave(true); } catch (e) {} });
