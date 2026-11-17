// ==========================================
// Kết nối ONLINE (WebSocket): chuyển tiếp qua máy chủ MQTT công cộng miễn phí.
// Chơi khác mạng (4G, wifi khác nhau) không cần P2P / TURN. Kiểu LAN (P2P) vẫn dùng PeerJS.
// RelayPeer có API giống PeerJS (giống LocalPeer, chỉ thay kênh truyền) -> 1v1, sổ phòng, giải đấu, xem trận dùng chung.
// ==========================================

// Kiểu mạng: 'online' (WebSocket chuyển tiếp, mặc định) | 'lan' (P2P PeerJS)
function netMode() {
    try { const m = localStorage.getItem('cy_netmode'); if (m === 'lan' || m === 'online') return m; } catch (e) {}
    return 'online';
}
function setNetMode(m) {
    try { localStorage.setItem('cy_netmode', m === 'lan' ? 'lan' : 'online'); } catch (e) {}
    document.querySelectorAll('.netmode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === netMode()));
    document.querySelectorAll('.netmode-hint').forEach(el => { el.textContent = NETMODE_HINT[netMode()]; });
}
const NETMODE_HINT = {
    online: '🌍 Khác mạng vẫn chơi được (qua máy chủ trung gian). Cả 2 người phải cùng chọn ONLINE.',
    lan: '📡 Nối thẳng 2 máy — nhanh nhất khi cùng wifi. Cả 2 người phải cùng chọn LAN.'
};
// Gắn nút chọn vào mọi khung .netmode-row (bảng Online + Giải Đấu)
function initNetModeUI() {
    document.querySelectorAll('.netmode-row').forEach(row => {
        if (row.dataset.ready) return; row.dataset.ready = '1';
        row.innerHTML = `<div class="netmode-btns">
            <button type="button" class="netmode-btn" data-mode="online">🌍 ONLINE (WebSocket)</button>
            <button type="button" class="netmode-btn" data-mode="lan">📡 LAN (P2P)</button></div>
            <div class="netmode-hint"></div>`;
        row.querySelectorAll('.netmode-btn').forEach(b => b.addEventListener('click', () => {
            setNetMode(b.dataset.mode);
            if (typeof lobbyDir !== 'undefined' && lobbyDir) try { lobbyDir.destroy(); } catch (e) {} // đổi kiểu mạng -> nối lại sổ phòng
        }));
    });
    setNetMode(netMode());
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initNetModeUI); else initNetModeUI();

// Máy chủ MQTT qua WebSocket (thử lần lượt; mọi máy cùng thứ tự nên thường gặp nhau ở máy chủ đầu)
const RELAY_BROKERS = [
    'wss://broker.emqx.io:8084/mqtt',
    'wss://broker.hivemq.com:8884/mqtt',
    'wss://test.mosquitto.org:8081/mqtt'
];
const RELAY_PREFIX = 'cytank/v1/';
function relayBrokers() {
    try { const b = localStorage.getItem('cy_broker'); if (b) return [b]; } catch (e) {}
    return (typeof window !== 'undefined' && window.CY_RELAY_BROKERS) || RELAY_BROKERS;
}

// ---------- MQTT 3.1.1 tối giản qua WebSocket (QoS 0) ----------
class MiniMqtt {
    constructor(url) { this.url = url; this.subs = {}; this.pid = 1; this.buf = new Uint8Array(0); this.onMessage = null; this.onClose = null; this.closed = false; }
    static str(s) { const b = new TextEncoder().encode(s); return [b.length >> 8, b.length & 255, ...b]; }
    static pkt(head, body) {
        const len = []; let n = body.length;
        do { let d = n % 128; n = Math.floor(n / 128); if (n > 0) d |= 128; len.push(d); } while (n > 0);
        const out = new Uint8Array(1 + len.length + body.length);
        out[0] = head; out.set(len, 1); out.set(body, 1 + len.length);
        return out;
    }
    connect(clientId, ms = 5000) {
        return new Promise((res, rej) => {
            let done = false;
            const fin = (ok, e) => { if (done) return; done = true; clearTimeout(t); ok ? res(this) : (this.close(), rej(e)); };
            const t = setTimeout(() => fin(false, new Error('timeout')), ms);
            try { this.ws = new WebSocket(this.url, ['mqtt']); } catch (e) { fin(false, e); return; }
            this.ws.binaryType = 'arraybuffer';
            this.ws.onopen = () => {
                const body = [...MiniMqtt.str('MQTT'), 4, 0x02, 0, 60, ...MiniMqtt.str(clientId)];
                this._send(MiniMqtt.pkt(0x10, body));
            };
            this._onConnack = (rc) => fin(rc === 0, new Error('connack ' + rc));
            this.ws.onmessage = (e) => this._data(new Uint8Array(e.data));
            this.ws.onerror = () => fin(false, new Error('ws error'));
            this.ws.onclose = () => { fin(false, new Error('closed')); if (!this.closed) { this.closed = true; clearInterval(this._ping); this.onClose && this.onClose(); } };
            this._ping = setInterval(() => this._send(new Uint8Array([0xC0, 0])), 25000);
        });
    }
    _send(u8) { try { if (this.ws && this.ws.readyState === 1) this.ws.send(u8); } catch (e) {} }
    subscribe(topic) {
        return new Promise((res) => {
            const id = this.pid++ & 0xffff || 1;
            this.subs[id] = res;
            this._send(MiniMqtt.pkt(0x82, [id >> 8, id & 255, ...MiniMqtt.str(topic), 0]));
            setTimeout(() => { if (this.subs[id]) { delete this.subs[id]; res(); } }, 3000);
        });
    }
    publish(topic, text) {
        const t = MiniMqtt.str(topic), p = new TextEncoder().encode(text);
        const body = new Uint8Array(t.length + p.length); body.set(t, 0); body.set(p, t.length);
        this._send(MiniMqtt.pkt(0x30, body));
    }
    _data(chunk) {
        const b = new Uint8Array(this.buf.length + chunk.length); b.set(this.buf, 0); b.set(chunk, this.buf.length);
        let i = 0;
        while (i + 2 <= b.length) {
            let len = 0, mul = 1, j = i + 1, d;
            do { if (j >= b.length) { this.buf = b.slice(i); return; } d = b[j++]; len += (d & 127) * mul; mul *= 128; } while (d & 128);
            if (j + len > b.length) break;
            this._packet(b[i], b.subarray(j, j + len));
            i = j + len;
        }
        this.buf = b.slice(i);
    }
    _packet(head, p) {
        const type = head >> 4;
        if (type === 2) this._onConnack && this._onConnack(p[1]);
        else if (type === 9) { const id = (p[0] << 8) | p[1]; const r = this.subs[id]; if (r) { delete this.subs[id]; r(); } }
        else if (type === 3) {
            const tl = (p[0] << 8) | p[1];
            const topic = new TextDecoder().decode(p.subarray(2, 2 + tl));
            let k = 2 + tl; if ((head >> 1) & 3) k += 2; // QoS>0: bỏ packet id
            if (this.onMessage) this.onMessage(topic, new TextDecoder().decode(p.subarray(k)));
        }
    }
    close() {
        if (this.closed) return; this.closed = true; clearInterval(this._ping);
        try { this._send(new Uint8Array([0xE0, 0])); this.ws && this.ws.close(); } catch (e) {}
    }
}
async function relayConnect(clientId) {
    let last;
    for (const url of relayBrokers()) {
        try { return await new MiniMqtt(url).connect(clientId); } catch (e) { last = e; }
    }
    throw last || new Error('no broker');
}

// ---------- RelayPeer: như LocalPeer nhưng gói tin đi qua máy chủ MQTT ----------
class RelayPeer extends LocalPeer {
    _initTransport() {
        this._claimMs = 1000; this._connMs = 3500; // máy đích đang mở sẽ trả lời trong ~1s
        if (this.id.startsWith('lp-')) this.id = 'cy' + Math.random().toString(36).slice(2, 12); // id ngẫu nhiên; id do game đặt (mã phòng) giữ nguyên
        relayConnect(this.id + '-' + Math.random().toString(36).slice(2, 8)).then(async (mq) => {
            if (this.destroyed) { mq.close(); return; }
            this.mq = mq;
            mq.onMessage = (topic, text) => { let m; try { m = JSON.parse(text); } catch (e) { return; } this._on(m); };
            mq.onClose = () => { if (!this.destroyed) { this.open = false; this._emit('disconnected'); } };
            await mq.subscribe(RELAY_PREFIX + 'p/' + this.id);
            await mq.subscribe(RELAY_PREFIX + 'c/' + this.id);
            if (!this.destroyed) this._claim();
        }).catch(() => { if (!this.destroyed) this._fail('network', 'Không nối được máy chủ chuyển tiếp'); });
    }
    _post(m) {
        if (!this.mq || this.destroyed) return;
        const topic = RELAY_PREFIX + ((m.t === 'claim' || m.t === 'taken') ? 'c/' + m.id : 'p/' + m.to);
        try { this.mq.publish(topic, JSON.stringify(m)); } catch (e) {}
    }
    _closeTransport() { try { this.mq && this.mq.close(); } catch (e) {} }
    reconnect() {
        if (this.destroyed || this.mq && !this.mq.closed) return;
        this._initTransport();
    }
}
