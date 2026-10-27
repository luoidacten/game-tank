// ==========================================
// Tìm phòng công khai KHÔNG cần máy chủ riêng (serverless discovery qua PeerJS)
// ==========================================
// - Có LOBBY.slots ID cố định ("<prefix>0..4"). Máy đầu tiên giành được 1 ID làm SỔ PHÒNG (registry):
//   giữ quảng cáo phòng công khai (hết hạn sau LOBBY.ttl), trả lời yêu cầu liệt kê.
// - Chủ phòng công khai gửi quảng cáo + nhịp tim mỗi LOBBY.beat. Sổ phòng biến mất -> máy khác giành lại ID
//   (thử lần lượt 0..4). Mọi bước đều có timeout; hỏng hẳn -> trả về null để UI quay về vào phòng bằng mã.
// - LocalPeer: giả lập API PeerJS bằng BroadcastChannel (chơi/thử nghiệm nhiều tab cùng máy, hoặc khi
//   không có thư viện PeerJS). Bật bắt buộc bằng window.CY_NET = 'local' hoặc ?net=local.

const LOBBY = { prefix: 'cytank-v1-lobby-', slots: 5, ttl: 20000, beat: 5000, connectMs: 4000, reqMs: 3000 };

// ---------- Sổ phòng thuần (không I/O) -> kiểm thử được độc lập ----------
class RoomRegistry {
    constructor(ttl = LOBBY.ttl) { this.ttl = ttl; this.ads = {}; }
    put(ad, now) {
        if (!ad || typeof ad.code !== 'string' || !ad.code) return false;
        const clean = {
            code: ad.code.slice(0, 24),
            name: String(ad.name || ad.code).slice(0, 28),
            host: String(ad.host || '?').slice(0, 20),
            mode: String(ad.mode || '').slice(0, 20),
            players: Math.max(0, Math.min(2, ad.players | 0)),
            max: 2,
            hostPing: typeof ad.hostPing === 'number' ? ad.hostPing : null,
            at: now,
        };
        this.ads[clean.code] = clean;
        return true;
    }
    del(code) { delete this.ads[code]; }
    prune(now) { for (const k in this.ads) if (now - this.ads[k].at > this.ttl) delete this.ads[k]; }
    list(now) {
        this.prune(now);
        return Object.values(this.ads).sort((a, b) => (a.players - b.players) || (b.at - a.at)).map(a => Object.assign({}, a, { age: now - a.at }));
    }
}

// ---------- LocalPeer: API giống PeerJS (on/connect/destroy, DataConnection on/send/close) qua BroadcastChannel ----------
const LP_CHANNEL = 'cy-localpeer-v1';
const LocalPeerAll = new Set();
class LocalConn {
    constructor(owner, remote, cid) { this.owner = owner; this.peer = remote; this.cid = cid; this.open = false; this.closed = false; this.h = {}; }
    on(ev, fn) { (this.h[ev] = this.h[ev] || []).push(fn); return this; }
    _emit(ev, ...a) { (this.h[ev] || []).forEach(f => { try { f(...a); } catch (e) { console.warn('LocalConn', ev, e); } }); }
    send(d) { if (this.open) this.owner._post({ t: 'data', cid: this.cid, to: this.peer, d }); }
    close() { if (this.closed) return; this.owner._post({ t: 'close', cid: this.cid, to: this.peer }); this._closed(); }
    _open() { if (this.open || this.closed) return; this.open = true; this._emit('open'); }
    _closed() { if (this.closed) return; this.closed = true; this.open = false; delete this.owner.conns[this.cid]; this._emit('close'); }
}
class LocalPeer {
    constructor(id) {
        this.id = id || ('lp-' + Math.random().toString(36).slice(2, 10));
        this.h = {}; this.conns = {}; this.open = false; this.destroyed = false; this._lost = false;
        this.nonce = Math.random();
        LocalPeerAll.add(this);
        try {
            this.bc = new BroadcastChannel(LP_CHANNEL);
            this.bc.onmessage = (e) => this._on(e.data);
        } catch (e) { this.bc = null; }
        setTimeout(() => {
            if (!this.bc) { this._fail('network', 'BroadcastChannel unavailable'); return; }
            this._post({ t: 'claim', id: this.id, n: this.nonce });
            this._claimT = setTimeout(() => {
                if (this.destroyed || this._lost) return;
                this.open = true; this._emit('open', this.id);
            }, 160);
        }, 0);
    }
    on(ev, fn) { (this.h[ev] = this.h[ev] || []).push(fn); return this; }
    _emit(ev, ...a) { (this.h[ev] || []).forEach(f => { try { f(...a); } catch (e) { console.warn('LocalPeer', ev, e); } }); }
    _post(m) { if (this.bc && !this.destroyed) { try { this.bc.postMessage(m); } catch (e) {} } }
    _fail(type, message) { this._lost = true; clearTimeout(this._claimT); this._emit('error', { type, message }); }
    _on(m) {
        if (!m || this.destroyed) return;
        switch (m.t) {
            case 'claim':
                if (m.id !== this.id) return;
                if (this.open) this._post({ t: 'taken', id: m.id, n: m.n });
                else if (!this._lost && m.n < this.nonce) this._fail('unavailable-id', 'ID "' + this.id + '" is taken');
                return;
            case 'taken':
                if (m.id === this.id && m.n === this.nonce && !this.open && !this._lost) this._fail('unavailable-id', 'ID "' + this.id + '" is taken');
                return;
            case 'conn': {
                if (m.to !== this.id || !this.open) return;
                const c = new LocalConn(this, m.from, m.cid);
                this.conns[m.cid] = c;
                this._post({ t: 'ack', cid: m.cid, to: m.from });
                this._emit('connection', c);
                setTimeout(() => c._open(), 0);
                return;
            }
            case 'ack': {
                const c = m.to === this.id && this.conns[m.cid];
                if (c) { clearTimeout(c._t); c._open(); }
                return;
            }
            case 'data': {
                const c = m.to === this.id && this.conns[m.cid];
                if (c && c.open) c._emit('data', m.d);
                return;
            }
            case 'close': {
                const c = m.to === this.id && this.conns[m.cid];
                if (c) c._closed();
                return;
            }
        }
    }
    connect(id) {
        const cid = Math.random().toString(36).slice(2, 12);
        const c = new LocalConn(this, id, cid);
        this.conns[cid] = c;
        this._post({ t: 'conn', from: this.id, to: id, cid });
        c._t = setTimeout(() => {
            if (c.open || c.closed || this.destroyed) return;
            delete this.conns[cid]; c.closed = true;
            this._emit('error', { type: 'peer-unavailable', message: 'Could not connect to peer ' + id });
        }, 900);
        return c;
    }
    destroy() {
        if (this.destroyed) return;
        Object.values(this.conns).forEach(c => { try { c.close(); } catch (e) {} });
        this.destroyed = true; this.open = false;
        clearTimeout(this._claimT);
        LocalPeerAll.delete(this);
        try { this.bc && this.bc.close(); } catch (e) {}
        this._emit('close');
    }
}
window.addEventListener('pagehide', () => { window.__cyUnloading = true; [...LocalPeerAll].forEach(p => p.destroy()); });

// Mạng thật (PeerJS) hay giả lập cùng máy (LocalPeer)
function netUsesLocalPeer() {
    if (typeof window !== 'undefined' && window.CY_NET === 'local') return true;
    try { if (/[?&]net=local\b/.test(location.search)) return true; } catch (e) {}
    return typeof Peer === 'undefined';
}
// Tạo peer theo kiểu mạng hiện tại. id = undefined -> ID ngẫu nhiên
function makeNetPeer(id) {
    if (netUsesLocalPeer()) return new LocalPeer(id);
    const cfg = Object.assign({}, typeof PEER_CONFIG !== 'undefined' ? PEER_CONFIG : {}, window.CY_PEER_SERVER || {});
    return id ? new Peer(id, cfg) : new Peer(cfg);
}

// ---------- Kết nối tới / làm sổ phòng ----------
class LobbyDirectory {
    constructor() {
        this.mode = 'idle';       // idle | connecting | client | registry | failed
        this.slot = -1;
        this.peer = null;         // peer ID ngẫu nhiên: nói chuyện với sổ phòng + thăm dò phòng
        this.regPeer = null;      // peer giữ ID sổ phòng (khi máy này là sổ phòng)
        this.conn = null;         // kết nối tới sổ phòng (khi là client)
        this.reg = new RoomRegistry();
        this.pending = {};        // rid -> resolve
        this.myAd = null;
        this.beatTimer = null;
        this._starting = null;
        this._waits = {};         // peerId đích -> hàm kết thúc khi PeerJS báo peer-unavailable
        this.rid = 0;
    }

    status() { return this.mode; }

    // Đảm bảo có peer ID ngẫu nhiên (đã 'open')
    _ensurePeer() {
        if (this.peer && this.peer.open && !this.peer.destroyed) return Promise.resolve(this.peer);
        if (this._peerP) return this._peerP;
        this._peerP = new Promise((res) => {
            let p;
            try { p = makeNetPeer(); } catch (e) { this._peerP = null; res(null); return; }
            const t = setTimeout(() => { this._peerP = null; try { p.destroy(); } catch (e) {} res(null); }, 6000);
            p.on('open', () => { clearTimeout(t); this.peer = p; this._peerP = null; res(p); });
            p.on('error', (err) => {
                if (err && err.type === 'peer-unavailable') { // lỗi của peer, không phải của kết nối -> khớp theo ID trong thông báo
                    const msg = String(err.message || '');
                    for (const id in this._waits) if (msg.indexOf(id) >= 0 || !msg) this._waits[id]('unavailable');
                    return;
                }
                if (!p.open) { clearTimeout(t); this._peerP = null; try { p.destroy(); } catch (e) {} res(null); }
            });
            p.on('disconnected', () => { try { p.reconnect(); } catch (e) {} });
        });
        return this._peerP;
    }

    // Kết nối tới sổ phòng ở slot i: 'ok' | 'unavailable' (ID trống) | 'timeout'
    _tryConnect(i) {
        return new Promise((res) => {
            const p = this.peer;
            if (!p) { res('timeout'); return; }
            let done = false, c;
            const fin = (r) => {
                if (done) return; done = true; clearTimeout(t); delete this._waits[LOBBY.prefix + i];
                if (r !== 'ok') { try { c && c.close(); } catch (e) {} } else this._bindConn(c, i);
                res(r);
            };
            const t = setTimeout(() => fin('timeout'), LOBBY.connectMs);
            this._waits[LOBBY.prefix + i] = fin;
            try { c = p.connect(LOBBY.prefix + i, { reliable: true }); } catch (e) { fin('timeout'); return; }
            c.on('open', () => { try { c.send({ t: 'HELLO' }); } catch (e) {} });
            c.on('data', (d) => { if (d && d.t === 'WELCOME') fin('ok'); });
            c.on('error', (e) => fin(e && e.type === 'peer-unavailable' ? 'unavailable' : 'timeout'));
        });
    }

    _bindConn(c, i) {
        this.conn = c; this.slot = i; this.mode = 'client';
        c.on('data', (d) => {
            if (!d) return;
            if (d.t === 'ROOMS' && this.pending[d.rid]) { this.pending[d.rid](d.rooms || []); delete this.pending[d.rid]; }
            if (d.t === 'ACK' && this.pending[d.rid]) { this.pending[d.rid](true); delete this.pending[d.rid]; }
        });
        c.on('close', () => {
            if (this.conn !== c) return;
            this.conn = null; this.mode = 'idle';
            // sổ phòng mất -> chủ phòng quảng cáo lại ngay (tự tìm / giành sổ phòng mới)
            if (this.myAd) setTimeout(() => this._announce(), 300 + Math.random() * 700);
        });
    }

    // Giành ID sổ phòng ở slot i: 'ok' | 'taken' | 'fail'
    _tryClaim(i) {
        return new Promise((res) => {
            let p, done = false;
            const fin = (r) => { if (done) return; done = true; clearTimeout(t); if (r !== 'ok') { try { p && p.destroy(); } catch (e) {} } res(r); };
            const t = setTimeout(() => fin('fail'), 6000);
            try { p = makeNetPeer(LOBBY.prefix + i); } catch (e) { fin('fail'); return; }
            p.on('open', () => { if (done) return; this._becomeRegistry(p, i); fin('ok'); });
            p.on('error', (err) => { if (!p.open) fin(err && err.type === 'unavailable-id' ? 'taken' : 'fail'); });
        });
    }

    _becomeRegistry(p, i) {
        this.regPeer = p; this.slot = i; this.mode = 'registry'; this.regSince = Date.now();
        p.on('connection', (c) => {
            c.on('data', (d) => {
                if (!d || !d.t) return;
                const now = Date.now();
                try {
                    if (d.t === 'HELLO') c.send({ t: 'WELCOME', slot: i });
                    else if (d.t === 'ANN') { this.reg.put(d.ad, now); c.send({ t: 'ACK', rid: d.rid }); }
                    else if (d.t === 'DEL') { if (d.code) this.reg.del(d.code); c.send({ t: 'ACK', rid: d.rid }); }
                    else if (d.t === 'LIST') c.send({ t: 'ROOMS', rid: d.rid, rooms: this.reg.list(now) });
                } catch (e) {}
            });
        });
        p.on('disconnected', () => { try { p.reconnect(); } catch (e) {} });
        p.on('close', () => { if (this.regPeer === p) { this.regPeer = null; this.mode = 'idle'; } });
    }

    // Sổ phòng ở slot > 0: thử nhường cho slot thấp hơn nếu nó đã sống lại (gom về 1 sổ)
    async _maybeResign() {
        if (this.mode !== 'registry' || this.slot <= 0 || this._resigning) return;
        this._resigning = true;
        try {
            if (!(await this._ensurePeer())) return;
            for (let i = 0; i < this.slot; i++) {
                if ((await this._tryConnect(i)) === 'ok') {
                    const old = this.regPeer; this.regPeer = null;
                    try { old.destroy(); } catch (e) {}
                    this.reg = new RoomRegistry();
                    if (this.myAd) this._announce();
                    return;
                }
            }
        } finally { this._resigning = false; }
    }

    // Kết nối hoặc làm sổ phòng. Trả về true nếu sẵn sàng
    start() {
        if (this.mode === 'client' && this.conn && this.conn.open) return Promise.resolve(true);
        if (this.mode === 'registry' && this.regPeer && !this.regPeer.destroyed) return Promise.resolve(true);
        if (this._starting) return this._starting;
        this.mode = 'connecting';
        this._starting = (async () => {
            if (!(await this._ensurePeer())) { this.mode = 'failed'; return false; }
            // Giành ID trước (máy chủ PeerJS trả lời ngay: mở được / đã có người giữ); có người giữ -> kết nối tới họ.
            // (Kết nối thẳng tới ID trống phải chờ máy chủ PeerJS báo hết hạn ~5s nên chậm hơn.)
            for (let i = 0; i < LOBBY.slots; i++) {
                const c = await this._tryClaim(i);
                if (c === 'ok') return true;
                if (c === 'fail') break; // mất mạng / máy chủ PeerJS không trả lời
                let r = await this._tryConnect(i);
                if (r === 'ok') return true;
                if (r === 'unavailable' && (await this._tryClaim(i)) === 'ok') return true; // người giữ vừa rời
                // 'timeout': ID bị giữ nhưng không trả lời (máy treo / NAT chặn) -> thử slot sau
            }
            this.mode = 'failed';
            return false;
        })().finally(() => { this._starting = null; this._startBeat(); });
        return this._starting;
    }

    _req(msg) {
        return new Promise((res) => {
            if (!this.conn || !this.conn.open) { res(null); return; }
            const rid = ++this.rid;
            const t = setTimeout(() => { delete this.pending[rid]; res(null); }, LOBBY.reqMs);
            this.pending[rid] = (v) => { clearTimeout(t); res(v); };
            try { this.conn.send(Object.assign({ rid }, msg)); } catch (e) { clearTimeout(t); delete this.pending[rid]; res(null); }
        });
    }

    // Danh sách phòng công khai; null = không tìm được sổ phòng
    async list() {
        for (let attempt = 0; attempt < 2; attempt++) {
            if (!(await this.start())) return null;
            if (this.mode === 'registry') return this.reg.list(Date.now());
            const r = await this._req({ t: 'LIST' });
            if (r) return r;
            // sổ phòng không trả lời -> bỏ kết nối, thử lại từ đầu (máy khác / máy này giành ID)
            try { this.conn && this.conn.close(); } catch (e) {}
            this.conn = null; this.mode = 'idle';
        }
        return null;
    }

    // Đặt / xoá quảng cáo phòng của máy này (null = xoá)
    setAd(ad) {
        const old = this.myAd;
        this.myAd = ad ? Object.assign({}, ad) : null;
        if (!ad && old) {
            if (this.mode === 'registry') this.reg.del(old.code);
            else this._req({ t: 'DEL', code: old.code });
        }
        if (ad) this._announce();
        this._startBeat();
    }

    async _announce() {
        if (!this.myAd) return false;
        if (!(await this.start())) return false;
        if (!this.myAd) return false;
        if (this.mode === 'registry') { this.reg.put(this.myAd, Date.now()); return true; }
        const ok = await this._req({ t: 'ANN', ad: this.myAd });
        if (!ok) { try { this.conn && this.conn.close(); } catch (e) {} this.conn = null; this.mode = 'idle'; }
        return !!ok;
    }

    _startBeat() {
        if (this.beatTimer) return;
        this.beatTimer = setInterval(() => {
            if (this.myAd) this._announce();
            if (this.mode === 'registry') { this.reg.prune(Date.now()); this._maybeResign(); }
        }, LOBBY.beat);
    }

    // Đo ping tới 1 phòng (kết nối thẳng tới peer mã phòng). null = không trả lời
    async probe(code, ms = 4000) {
        const p = await this._ensurePeer();
        if (!p) return null;
        return new Promise((res) => {
            let c, done = false;
            const fin = (v) => { if (done) return; done = true; clearTimeout(t); delete this._waits[code]; try { c && c.close(); } catch (e) {} res(v); };
            const t = setTimeout(() => fin(null), ms);
            this._waits[code] = () => fin(null);
            try { c = p.connect(code, { reliable: true }); } catch (e) { fin(null); return; }
            let t0 = 0;
            c.on('open', () => { t0 = performance.now(); try { c.send({ type: 'ROOM_PROBE', t: t0 }); } catch (e) { fin(null); } });
            c.on('data', (d) => { if (d && d.type === 'ROOM_PONG') fin({ rtt: Math.max(1, Math.round(performance.now() - t0)), players: d.players, open: d.open }); });
            c.on('error', () => fin(null));
        });
    }

    destroy() {
        clearInterval(this.beatTimer); this.beatTimer = null;
        for (const p of [this.peer, this.regPeer]) { try { p && p.destroy(); } catch (e) {} }
        this.peer = this.regPeer = this.conn = null; this.mode = 'idle';
    }
}

const lobbyDir = new LobbyDirectory();
window.addEventListener('pagehide', () => { try { lobbyDir.destroy(); } catch (e) {} });
