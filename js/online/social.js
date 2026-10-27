// ==========================================
// ONLINE XÃ HỘI: Chat, Biểu cảm (vẽ canvas neon), Cài đặt trận của chủ phòng, Tạm dừng online
// Gói tin thuần dữ liệu qua kênh có sẵn (onlineManager.sendNetworkMessage):
//   CHAT {pid,nick,text} · EMOTE {pid,id} · LOBBY_SET {map,win} · LOBBY_SET_REQ
//   PAUSE_REQ / RESUME_REQ (guest -> host) · PAUSE_STATE {active,by,remain,used,auto} (host -> guest)
// ==========================================
const NS_TAU = Math.PI * 2;

// ---------- Vẽ biểu cảm (hệ toạ độ -20..20, tâm 0,0) ----------
const NSArt = {
    glow(c, col, b) { c.shadowColor = col; c.shadowBlur = (typeof Quality !== 'undefined' && Quality.level === 'low') ? 0 : b; },
    rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); },
    // Nền huy hiệu: đĩa tối + viền neon
    badge(c, col) {
        const g = c.createRadialGradient(-6, -7, 2, 0, 0, 19);
        g.addColorStop(0, 'rgba(40,55,90,0.95)'); g.addColorStop(1, 'rgba(6,10,22,0.95)');
        c.beginPath(); c.arc(0, 0, 18, 0, NS_TAU); c.fillStyle = g; c.fill();
        this.glow(c, col, 8); c.strokeStyle = col; c.lineWidth = 2; c.stroke(); c.shadowBlur = 0;
    },
    // Mặt neon: lòng tối ánh màu, viền phát sáng
    face(c, col) {
        const g = c.createRadialGradient(-5, -6, 1, 0, 0, 17);
        g.addColorStop(0, col); g.addColorStop(0.18, 'rgba(30,38,60,0.95)'); g.addColorStop(1, 'rgba(8,12,24,0.97)');
        c.beginPath(); c.arc(0, 0, 16, 0, NS_TAU); c.fillStyle = g; c.fill();
        this.glow(c, col, 10); c.strokeStyle = col; c.lineWidth = 2.4; c.stroke();
        c.globalAlpha = 0.35; c.beginPath(); c.arc(0, 0, 12.5, Math.PI * 1.1, Math.PI * 1.45); c.strokeStyle = '#fff'; c.lineWidth = 1.5; c.stroke(); c.globalAlpha = 1;
    },
    line(c, col, w, pts) { c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke(); },
    text(c, s, size, col, y) {
        c.font = `900 ${size}px system-ui, "Segoe UI", sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
        this.glow(c, col, 10); c.lineWidth = 3; c.strokeStyle = 'rgba(0,0,0,0.75)'; c.strokeText(s, 0, y || 0);
        c.fillStyle = col; c.fillText(s, 0, y || 0); c.shadowBlur = 0;
    },
    eyes(c, col, y, r) { c.fillStyle = col; this.glow(c, col, 6); for (const x of [-5.5, 5.5]) { c.beginPath(); c.arc(x, y, r, 0, NS_TAU); c.fill(); } c.shadowBlur = 0; },
};

const NS_EMOTES = [
    { id: 'gg', name: 'GG', col: '#00f0ff', draw(c, t) {
        NSArt.badge(c, this.col);
        const g = c.createLinearGradient(0, -10, 0, 10); g.addColorStop(0, '#fff'); g.addColorStop(1, this.col);
        c.save(); c.scale(1 + 0.05 * Math.sin(t * 6), 1 + 0.05 * Math.sin(t * 6));
        NSArt.text(c, 'GG', 18, g, 1); c.restore();
        c.globalAlpha = 0.6 + 0.4 * Math.sin(t * 5); NSArt.line(c, '#fff', 1.4, [-12, 11, 12, 11]); c.globalAlpha = 1;
    } },
    { id: 'laugh', name: 'Cười', col: '#ffd23f', draw(c, t) {
        c.translate(0, Math.abs(Math.sin(t * 9)) * -1.5);
        NSArt.face(c, this.col);
        NSArt.line(c, this.col, 2.2, [-9, -3, -5.5, -7, -2, -3]); NSArt.line(c, this.col, 2.2, [2, -3, 5.5, -7, 9, -3]);
        c.beginPath(); c.moveTo(-9, 2); c.quadraticCurveTo(0, 2.5, 9, 2); c.quadraticCurveTo(8, 12, 0, 12); c.quadraticCurveTo(-8, 12, -9, 2); c.closePath();
        c.fillStyle = '#1a0610'; c.fill(); NSArt.glow(c, this.col, 6); c.strokeStyle = this.col; c.lineWidth = 2; c.stroke(); c.shadowBlur = 0;
        c.beginPath(); c.ellipse(0, 9.5, 4, 2.2, 0, 0, NS_TAU); c.fillStyle = '#ff5c8a'; c.fill();
        const d = (t * 14) % 6;
        c.fillStyle = '#7fe3ff'; for (const s of [-1, 1]) { c.beginPath(); c.ellipse(s * (15 + d * 0.4), -4 + d, 1.8, 2.6, 0, 0, NS_TAU); c.fill(); }
    } },
    { id: 'angry', name: 'Tức', col: '#ff3b5c', draw(c, t) {
        c.translate(Math.sin(t * 40) * 0.8, 0);
        NSArt.face(c, this.col);
        NSArt.line(c, this.col, 2.6, [-10, -8, -3, -4]); NSArt.line(c, this.col, 2.6, [10, -8, 3, -4]);
        NSArt.eyes(c, '#fff', -1, 1.8);
        NSArt.line(c, this.col, 2.4, [-6, 9, -2, 6.5, 2, 6.5, 6, 9]);
        c.save(); c.translate(11, -12); c.scale(1 + 0.15 * Math.sin(t * 10), 1 + 0.15 * Math.sin(t * 10));
        NSArt.glow(c, '#ff1744', 6);
        for (let i = 0; i < 4; i++) { c.rotate(Math.PI / 2); NSArt.line(c, '#ff1744', 1.8, [1.5, -1.5, 4, -1.5, 4, -4]); }
        c.restore(); c.shadowBlur = 0;
    } },
    { id: 'cry', name: 'Khóc', col: '#4cc9ff', draw(c, t) {
        NSArt.face(c, this.col);
        NSArt.line(c, this.col, 2, [-9, -6, -3, -4]); NSArt.line(c, this.col, 2, [9, -6, 3, -4]);
        NSArt.line(c, '#fff', 2, [-8, -1, -5.5, 0.5, -3, -1]); NSArt.line(c, '#fff', 2, [3, -1, 5.5, 0.5, 8, -1]);
        c.beginPath(); c.arc(0, 11, 4.5, Math.PI * 1.15, Math.PI * 1.85); c.strokeStyle = this.col; c.lineWidth = 2.2; c.stroke();
        c.fillStyle = 'rgba(120,220,255,0.9)'; NSArt.glow(c, '#7fe3ff', 6);
        for (const x of [-5.5, 5.5]) for (let k = 0; k < 2; k++) {
            const y = 2 + ((t * 22 + k * 8) % 16);
            c.beginPath(); c.ellipse(x, y, 1.6, 2.4, 0, 0, NS_TAU); c.fill();
        }
        c.shadowBlur = 0;
    } },
    { id: 'thumbs', name: 'Like', col: '#39ff9f', draw(c, t) {
        NSArt.badge(c, this.col);
        c.save(); c.translate(1, 1); c.rotate(-0.08 + 0.1 * Math.sin(t * 6));
        const g = c.createLinearGradient(-10, -14, 10, 14); g.addColorStop(0, '#d9ffe9'); g.addColorStop(1, this.col);
        NSArt.glow(c, this.col, 8); c.fillStyle = g;
        NSArt.rr(c, -5, -15, 7, 15, 3.5); c.fill();
        NSArt.rr(c, -7, -3, 16, 14, 4); c.fill();
        c.fillStyle = '#0d3b2a'; NSArt.rr(c, -13, -2, 5, 13, 1.5); c.fill(); c.strokeStyle = this.col; c.lineWidth = 1.4; c.stroke();
        c.shadowBlur = 0;
        for (const y of [1.5, 5, 8.5]) NSArt.line(c, 'rgba(0,60,40,0.7)', 1.2, [1, y, 8, y]);
        c.restore();
    } },
    { id: 'heart', name: 'Tim', col: '#ff4fa3', draw(c, t) {
        const p = 1 + 0.12 * Math.max(0, Math.sin(t * 8));
        c.save(); c.scale(p, p);
        const g = c.createRadialGradient(-5, -6, 1, 0, 0, 18); g.addColorStop(0, '#ffd1e8'); g.addColorStop(0.45, this.col); g.addColorStop(1, '#a3005a');
        c.beginPath(); c.moveTo(0, 14); c.bezierCurveTo(-22, 0, -13, -19, 0, -7); c.bezierCurveTo(13, -19, 22, 0, 0, 14); c.closePath();
        NSArt.glow(c, this.col, 14); c.fillStyle = g; c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 1.2; c.globalAlpha = 0.7; c.stroke(); c.globalAlpha = 1;
        c.shadowBlur = 0; c.beginPath(); c.ellipse(-7, -6, 3, 1.8, -0.6, 0, NS_TAU); c.fillStyle = 'rgba(255,255,255,0.75)'; c.fill();
        c.restore();
    } },
    { id: 'fire', name: 'Cháy', col: '#ff8a1f', draw(c, t) {
        const f = Math.sin(t * 13) * 1.5, f2 = Math.cos(t * 17) * 1.2;
        const g = c.createLinearGradient(0, 16, 0, -18); g.addColorStop(0, '#ff2e00'); g.addColorStop(0.6, this.col); g.addColorStop(1, '#ffe14d');
        c.beginPath(); c.moveTo(0 + f, -18); c.bezierCurveTo(10, -6, 15, 2, 11, 10); c.quadraticCurveTo(6, 17, 0, 17); c.quadraticCurveTo(-6, 17, -11, 10);
        c.bezierCurveTo(-15, 2, -9, -4, -6 + f2, -10); c.quadraticCurveTo(-4, -3, -2, -2); c.quadraticCurveTo(-2, -10, 0 + f, -18); c.closePath();
        NSArt.glow(c, this.col, 16); c.fillStyle = g; c.fill(); c.shadowBlur = 0;
        c.beginPath(); c.moveTo(0 - f2, -4); c.bezierCurveTo(6, 2, 7, 8, 4, 12); c.quadraticCurveTo(0, 15, -4, 12); c.bezierCurveTo(-7, 8, -4, 2, 0 - f2, -4); c.closePath();
        c.fillStyle = '#fff3b0'; c.fill();
    } },
    { id: 'skull', name: 'Đầu lâu', col: '#c77dff', draw(c, t) {
        c.translate(0, Math.sin(t * 5) * 1);
        const g = c.createLinearGradient(0, -16, 0, 16); g.addColorStop(0, '#f3e8ff'); g.addColorStop(1, '#9d6bd6');
        c.beginPath(); c.arc(0, -3, 14, Math.PI * 0.82, Math.PI * 2.18); c.lineTo(7, 9); c.lineTo(7, 15); c.lineTo(-7, 15); c.lineTo(-7, 9); c.closePath();
        NSArt.glow(c, this.col, 12); c.fillStyle = g; c.fill(); c.strokeStyle = this.col; c.lineWidth = 1.6; c.stroke(); c.shadowBlur = 0;
        const blink = (Math.sin(t * 7) > 0.6) ? '#ff4df0' : this.col;
        c.fillStyle = '#1a0b2e';
        for (const s of [-1, 1]) { c.beginPath(); c.ellipse(s * 5.5, -2, 4, 4.6, 0, 0, NS_TAU); c.fill(); }
        NSArt.glow(c, blink, 8); c.fillStyle = blink; for (const s of [-1, 1]) { c.beginPath(); c.arc(s * 5.5, -1.5, 1.5, 0, NS_TAU); c.fill(); } c.shadowBlur = 0;
        c.fillStyle = '#1a0b2e'; c.beginPath(); c.moveTo(0, 3); c.lineTo(-2, 7); c.lineTo(2, 7); c.closePath(); c.fill();
        for (const x of [-3.5, 0, 3.5]) NSArt.line(c, '#1a0b2e', 1.3, [x, 10, x, 14.5]);
    } },
    { id: 'what', name: '?!', col: '#ffe14d', draw(c, t) {
        NSArt.badge(c, this.col);
        c.save(); c.rotate(0.15 * Math.sin(t * 7)); c.scale(1 + 0.06 * Math.sin(t * 11), 1 + 0.06 * Math.sin(t * 11));
        const g = c.createLinearGradient(0, -12, 0, 12); g.addColorStop(0, '#fff8c4'); g.addColorStop(1, '#ff9f1c');
        NSArt.text(c, '?!', 22, g, 1); c.restore();
    } },
    { id: 'taunt', name: 'Lêu lêu', col: '#00f0ff', draw(c, t) {
        NSArt.badge(c, '#ff4fd8');
        c.save(); c.translate(0, 3); c.rotate(0.12 * Math.sin(t * 9));
        const ang = -Math.PI / 2 + 0.6 * Math.sin(t * 10);
        NSArt.glow(c, this.col, 8);
        NSArt.line(c, '#cfefff', 3.4, [0, -5, Math.cos(ang) * 13, -5 + Math.sin(ang) * 13]);
        const g = c.createLinearGradient(0, -10, 0, 8); g.addColorStop(0, '#5ff4ff'); g.addColorStop(1, '#0a6f8a');
        c.fillStyle = '#0b1830'; NSArt.rr(c, -14, 2, 28, 8, 4); c.fill(); c.strokeStyle = this.col; c.lineWidth = 1.5; c.stroke();
        c.fillStyle = g; NSArt.rr(c, -10, -6, 20, 10, 4); c.fill();
        c.beginPath(); c.arc(0, -5, 5, 0, NS_TAU); c.fill(); c.shadowBlur = 0;
        for (const x of [-9, -3, 3, 9]) { c.beginPath(); c.arc(x + ((t * 20) % 2), 6, 1.4, 0, NS_TAU); c.fillStyle = this.col; c.fill(); }
        c.restore();
        c.save(); c.translate(9, -12); c.rotate(0.3); NSArt.text(c, 'HA', 8, '#ff4fd8', 0); c.restore();
    } },
    { id: 'sweat', name: 'Toát mồ hôi', col: '#7ee8ff', draw(c, t) {
        NSArt.face(c, this.col);
        NSArt.eyes(c, '#fff', -2, 1.9);
        NSArt.line(c, this.col, 2, [-10, -8, -4, -7]); NSArt.line(c, this.col, 2, [4, -7, 10, -8]);
        NSArt.line(c, this.col, 2, [-6, 8, -3, 6, 0, 8, 3, 6, 6, 8]);
        const y = -12 + (t * 10) % 8;
        c.save(); c.translate(12, y);
        c.beginPath(); c.moveTo(0, -5); c.quadraticCurveTo(4, 1, 0, 3.5); c.quadraticCurveTo(-4, 1, 0, -5); c.closePath();
        NSArt.glow(c, '#7fe3ff', 8); c.fillStyle = '#9ff0ff'; c.fill(); c.restore(); c.shadowBlur = 0;
    } },
    { id: 'cool', name: 'Ngầu', col: '#b4ff39', draw(c, t) {
        NSArt.face(c, this.col);
        c.fillStyle = '#05070d'; NSArt.glow(c, this.col, 6);
        NSArt.rr(c, -12.5, -6.5, 10.5, 7, 3); c.fill(); c.strokeStyle = this.col; c.lineWidth = 1.4; c.stroke();
        NSArt.rr(c, 2, -6.5, 10.5, 7, 3); c.fill(); c.stroke(); c.shadowBlur = 0;
        NSArt.line(c, this.col, 1.6, [-2, -4.5, 2, -4.5]);
        const sh = ((t * 0.9) % 1.6) * 30 - 14;
        c.save(); NSArt.rr(c, -12.5, -6.5, 25, 7, 3); c.clip();
        NSArt.line(c, 'rgba(255,255,255,0.8)', 2, [sh, -7, sh - 4, 1]); c.restore();
        c.beginPath(); c.moveTo(-5, 8); c.quadraticCurveTo(2, 11, 7, 6); c.strokeStyle = this.col; c.lineWidth = 2.2; c.lineCap = 'round'; c.stroke();
    } },
    { id: 'clap', name: 'Vỗ tay', col: '#ffb347', draw(c, t) {
        NSArt.badge(c, this.col);
        const o = 1 + 2.5 * Math.abs(Math.sin(t * 9));
        const g = c.createLinearGradient(0, -12, 0, 12); g.addColorStop(0, '#ffe3b8'); g.addColorStop(1, this.col);
        NSArt.glow(c, this.col, 6); c.fillStyle = g;
        for (const s of [-1, 1]) { c.save(); c.translate(s * (o + 4), 3); c.rotate(s * 0.35); NSArt.rr(c, -4.5, -10, 9, 19, 4.5); c.fill(); c.restore(); }
        c.shadowBlur = 0;
        if (o < 2) { for (const a of [-2.3, -1.57, -0.8]) NSArt.line(c, '#fff', 1.6, [Math.cos(a) * 11, -6 + Math.sin(a) * 11, Math.cos(a) * 15, -6 + Math.sin(a) * 15]); }
    } },
    { id: 'sleep', name: 'Ngủ', col: '#8f9bff', draw(c, t) {
        NSArt.face(c, this.col);
        NSArt.line(c, this.col, 2, [-9, -2, -5.5, 0, -2, -2]); NSArt.line(c, this.col, 2, [2, -2, 5.5, 0, 9, -2]);
        c.beginPath(); c.ellipse(0, 8, 2.4, 2.8 + Math.sin(t * 3) * 0.8, 0, 0, NS_TAU); c.strokeStyle = this.col; c.lineWidth = 1.8; c.stroke();
        for (let i = 0; i < 2; i++) {
            const k = ((t * 0.7 + i * 0.5) % 1);
            c.globalAlpha = 1 - k; c.save(); c.translate(10 + k * 6, -10 - k * 10); NSArt.text(c, 'Z', 7 + k * 5, '#c9d0ff', 0); c.restore();
        }
        c.globalAlpha = 1;
    } },
    { id: 'crown', name: 'Vương miện', col: '#ffd700', draw(c, t) {
        c.translate(0, Math.sin(t * 4) * 1.2);
        const g = c.createLinearGradient(0, -14, 0, 12); g.addColorStop(0, '#fff6b3'); g.addColorStop(0.5, this.col); g.addColorStop(1, '#b8860b');
        c.beginPath(); c.moveTo(-15, 11); c.lineTo(-16, -8); c.lineTo(-7.5, 0); c.lineTo(0, -14); c.lineTo(7.5, 0); c.lineTo(16, -8); c.lineTo(15, 11); c.closePath();
        NSArt.glow(c, this.col, 14); c.fillStyle = g; c.fill(); c.strokeStyle = '#fff2a8'; c.lineWidth = 1.2; c.stroke(); c.shadowBlur = 0;
        c.fillStyle = '#7a5600'; c.fillRect(-15, 6, 30, 2);
        const gems = [[-16, -8, '#ff3b5c'], [0, -14, '#00f0ff'], [16, -8, '#39ff9f']];
        for (const [x, y, col] of gems) { NSArt.glow(c, col, 8); c.fillStyle = col; c.beginPath(); c.arc(x, y, 2.4, 0, NS_TAU); c.fill(); }
        c.shadowBlur = 0; c.fillStyle = '#ff4fa3'; c.beginPath(); c.moveTo(0, -1); c.lineTo(3, 2.5); c.lineTo(0, 6); c.lineTo(-3, 2.5); c.closePath(); c.fill();
        const sp = (t * 1.3) % 1; c.globalAlpha = 1 - sp; NSArt.line(c, '#fff', 1.2, [10, -13 - sp * 3, 10, -7 - sp * 3]); NSArt.line(c, '#fff', 1.2, [7, -10 - sp * 3, 13, -10 - sp * 3]); c.globalAlpha = 1;
    } },
    { id: 'boom', name: 'Bùm', col: '#ff5e3a', draw(c, t) {
        const s = 1 + 0.08 * Math.sin(t * 12);
        c.save(); c.rotate(t * 0.8); c.scale(s, s);
        const g = c.createRadialGradient(0, 0, 2, 0, 0, 19); g.addColorStop(0, '#fff7c2'); g.addColorStop(0.45, '#ffd23f'); g.addColorStop(1, this.col);
        c.beginPath(); for (let i = 0; i < 24; i++) { const r = i % 2 ? 11 : 19, a = i / 24 * NS_TAU; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath();
        NSArt.glow(c, this.col, 14); c.fillStyle = g; c.fill(); c.shadowBlur = 0; c.restore();
        NSArt.text(c, 'BÙM', 9, '#ff2e63', 0.5);
    } },
];
const NS_EMOTE_MAP = Object.fromEntries(NS_EMOTES.map(e => [e.id, e]));
const NS_MAPS = [
    ['random', '🎲 Ngẫu nhiên'], ['classic', '🏛️ Cổ Điển'], ['bastion', '🛡️ Pháo Đài'], ['artillery', '💣 Pháo Kích'],
    ['overdrive', '⚡ Siêu Tốc'], ['fast_shrink', '💀 Bo Thần Tốc'], ['rush_hour', '🚛 Cao Điểm'], ['supply_drop', '📦 Tiếp Tế'],
    ['ice_rink', '🧊 Sân Băng'], ['laser_field', '🔆 Trường Lazer'], ['wind_hill', '🌬️ Đồi Gió'],
];
const NS_WINS = [2, 3, 5, 7];

function nsDrawEmote(c, id, x, y, size, t) {
    const e = NS_EMOTE_MAP[id]; if (!e) return;
    c.save(); c.translate(x, y); c.scale(size / 40, size / 40);
    try { e.draw(c, t); } catch (err) {}
    c.restore();
}

// ---------- Module chính ----------
const OnlineSocial = {
    CHAT_GAP: 1500, EMOTE_CD: 3000, PAUSE_MAX: 2, PAUSE_MS: 30000, EMOTE_MS: 2400,
    loadout: ['gg', 'laugh', 'thumbs', 'angry'],
    chatLog: [], lastChatAt: 0, lastEmoteAt: 0, lastRecv: {},
    settings: { map: 'random', win: 3, classic: false },
    pause: { active: false, by: null, endsAt: 0, used: { p1: 0, p2: 0 } },
    live: [], // biểu cảm đang hiện: {pid,id,t0}
    els: {},

    om() { return (typeof onlineManager !== 'undefined') ? onlineManager : null; },
    isHost() { const m = this.om(); return !!(m && m.role === 'host'); },
    myPid() { const m = this.om(); return m ? m.myPid() : 'p1'; },
    send(msg) { const m = this.om(); if (m && m.isOnline) m.sendNetworkMessage(msg); },
    inMatch() { const m = this.om(); return !!(m && m.isOnline && m.matchActive); },
    isPaused() { return this.inMatch() && this.pause.active; },

    init() {
        try { const s = JSON.parse(localStorage.getItem('cytank_emote_wheel') || 'null'); if (Array.isArray(s) && s.length === 4 && s.every(id => NS_EMOTE_MAP[id])) this.loadout = s; } catch (e) {}
        const w0 = (typeof gameState !== 'undefined' && gameState.winScore) || 3;
        this.settings.win = NS_WINS.includes(w0) ? w0 : 3;
        this.buildLobby();
        this.buildHud();
        this.buildPrep(); this.buildWheel();
        this.wrap();
        document.addEventListener('pointerdown', (e) => {
            const t = e.target;
            if (!t.closest || t.closest('.ns-pop, .ns-hud-btn, .ns-prep-btn')) return;
            this.closePops();
        }, true);
        setInterval(() => this.pauseTick(), 200);
    },

    // ---- móc vào onlineManager / vòng vẽ ----
    wrap() {
        const m = this.om(); if (!m) return;
        const self = this;
        const sm = m.startMatchActual.bind(m);
        m.startMatchActual = function (w) { self.resetMatch(); const r = sm(w); self.refreshHud(); return r; };
        const ul = m.updateLobbyDisplay.bind(m);
        m.updateLobbyDisplay = function (st) { const r = ul(st); self.renderSettings(); return r; };
        const cl = m.cleanup.bind(m);
        m.cleanup = function (a) { self.resetAll(); return cl(a); };
        if (typeof renderFrame === 'function') {
            const rf = renderFrame;
            window.renderFrame = renderFrame = function () { const r = rf.apply(this, arguments); self.drawCanvas(); return r; };
        }
    },
    resetMatch() {
        this.pause = { active: false, by: null, endsAt: 0, used: { p1: 0, p2: 0 } };
        this.live = []; this.showPause();
    },
    resetAll() {
        this.resetMatch(); this.chatLog = []; this._adopted = false; this.renderChat(); this.closePops();
        const f = document.getElementById('nsFloat'); if (f) f.innerHTML = '';
    },

    // Trả về true nếu gói thuộc module này (đã xử lý)
    onMessage(d) {
        const m = this.om(); if (!m || !d) return false;
        switch (d.type) {
            case 'CHAT': {
                const now = Date.now(); if (now - (this.lastRecv.chat || 0) < 1000) return true;
                this.lastRecv.chat = now;
                this.addChat(d.pid === 'p2' ? 'p2' : 'p1', String(d.nick || '').slice(0, 16), String(d.text || '').slice(0, 80), false);
                return true;
            }
            case 'EMOTE': {
                const now = Date.now(); if (now - (this.lastRecv.emote || 0) < 2000) return true;
                if (!NS_EMOTE_MAP[d.id]) return true;
                this.lastRecv.emote = now;
                this.spawnEmote(d.pid === 'p2' ? 'p2' : 'p1', d.id);
                return true;
            }
            case 'LOBBY_SET':
                if (m.role !== 'host') this.applySettings(d.map, d.win, d.classic);
                return true;
            case 'LOBBY_SET_REQ':
                if (m.role === 'host') this.pushSettings();
                return true;
            case 'PAUSE_REQ':
                if (m.role === 'host') this.hostPause('p2');
                return true;
            case 'RESUME_REQ':
                if (m.role === 'host') this.hostResume('p2', false);
                return true;
            case 'PAUSE_STATE':
                if (m.role !== 'host') this.applyPauseState(d);
                return true;
            case 'JOIN_ACCEPT':
            case 'ELECT':
                setTimeout(() => { if (this.om().role !== 'host') this.send({ type: 'LOBBY_SET_REQ' }); else this.pushSettings(); }, 400);
                return false;
        }
        return false;
    },

    // ---------- CHAT ----------
    sendChat(text) {
        text = String(text || '').replace(/\s+/g, ' ').trim().slice(0, 80);
        if (!text) return false;
        const now = Date.now();
        if (now - this.lastChatAt < this.CHAT_GAP) { this.flashHint('⏳ Chậm lại chút (1.5s/tin)'); return false; }
        this.lastChatAt = now;
        const m = this.om(); const nick = (m && m.nick) || 'Bạn';
        this.send({ type: 'CHAT', pid: this.myPid(), nick, text });
        this.addChat(this.myPid(), nick, text, true);
        return true;
    },
    addChat(pid, nick, text, mine) {
        this.chatLog.push({ pid, nick, text, mine });
        if (this.chatLog.length > 6) this.chatLog.shift();
        this.renderChat();
        if (this.inMatch()) this.floatMsg(pid, nick, text);
        if (!mine && this.prepOn() && !document.getElementById('nsPrepChat').classList.contains('open')) { const b = document.getElementById('nsPrepBtnChat'); if (b) b.classList.add('ns-unread'); }
        if (!mine && typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem.playClick) { try { soundSystem.playClick(); } catch (e) {} }
    },
    renderChat() {
        for (const id of ['nsLobbyChatLog', 'nsHudChatLog', 'nsPrepChatLog']) {
            const box = document.getElementById(id); if (!box) continue;
            box.innerHTML = '';
            if (!this.chatLog.length) { const e = document.createElement('div'); e.className = 'ns-chat-empty'; e.textContent = 'Chưa có tin nhắn. Chào đối thủ đi!'; box.appendChild(e); }
            for (const c of this.chatLog) {
                const row = document.createElement('div'); row.className = 'ns-chat-row ' + c.pid;
                const n = document.createElement('b'); n.textContent = (c.mine ? 'Bạn' : c.nick) + ': ';
                const t = document.createElement('span'); t.textContent = c.text;
                row.append(n, t); box.appendChild(row);
            }
            box.scrollTop = box.scrollHeight;
        }
    },
    floatMsg(pid, nick, text) {
        const f = document.getElementById('nsFloat'); if (!f) return;
        const el = document.createElement('div'); el.className = 'ns-float-msg ' + pid;
        const n = document.createElement('b'); n.textContent = (pid === this.myPid() ? 'Bạn' : nick) + ': ';
        const t = document.createElement('span'); t.textContent = text;
        el.append(n, t); f.appendChild(el);
        while (f.children.length > 3) f.removeChild(f.firstChild);
        setTimeout(() => el.classList.add('out'), 3600);
        setTimeout(() => el.remove(), 4200);
    },
    flashHint(msg) {
        for (const id of ['nsLobbyChatInput', 'nsHudChatInput', 'nsPrepChatInput']) {
            const i = document.getElementById(id); if (!i) continue;
            const ph = i.dataset.ph || i.placeholder; i.dataset.ph = ph; i.placeholder = msg; i.classList.add('ns-warn');
            setTimeout(() => { i.placeholder = ph; i.classList.remove('ns-warn'); }, 1200);
        }
    },

    // ---------- BIỂU CẢM ----------
    sendEmote(id) {
        if (!NS_EMOTE_MAP[id] || !this.inMatch()) return false;
        const now = Date.now(); if (now - this.lastEmoteAt < this.EMOTE_CD) return false;
        this.lastEmoteAt = now;
        this.send({ type: 'EMOTE', pid: this.myPid(), id });
        this.spawnEmote(this.myPid(), id);
        this.closePops(); this.refreshHud();
        return true;
    },
    spawnEmote(pid, id) {
        this.live = this.live.filter(e => e.pid !== pid);
        this.live.push({ pid, id, t0: performance.now() });
        if (this.prepOn()) this.prepEmote(pid, id);
        if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem.playCoin) { try { soundSystem.playCoin(); } catch (e) {} }
    },
    drawCanvas() {
        if (!this.live.length || typeof ctx === 'undefined' || !this.inMatch()) return;
        const now = performance.now();
        this.live = this.live.filter(e => now - e.t0 < this.EMOTE_MS);
        const guest = this.om().role === 'guest';
        for (const e of this.live) {
            const p = e.pid === 'p1' ? (typeof p1 !== 'undefined' && p1) : (typeof p2 !== 'undefined' && p2);
            if (!p) continue;
            const age = (now - e.t0) / 1000, dur = this.EMOTE_MS / 1000;
            const cx = p.x + p.w / 2, cy = e.pid === 'p1' ? p.y - 46 : p.y + p.h + 46;
            // Nảy lên (easeOutBack) rồi mờ dần
            const k = Math.min(1, age / 0.22), back = 1 + 2.2 * Math.pow(k - 1, 3) + 1.2 * Math.pow(k - 1, 2);
            const fade = Math.min(1, (dur - age) / 0.4);
            ctx.save();
            if (typeof worldViewTransform !== 'undefined' && worldViewTransform) ctx.setTransform(worldViewTransform);
            ctx.translate(cx, cy);
            if (guest) ctx.rotate(Math.PI);
            ctx.translate(0, -Math.sin(age * 4) * 2.5 - age * 3);
            ctx.globalAlpha = Math.max(0, fade);
            if (age < 0.5) { // vòng sóng khi bật ra
                ctx.beginPath(); ctx.arc(0, 0, 14 + age * 70, 0, NS_TAU);
                ctx.strokeStyle = NS_EMOTE_MAP[e.id].col; ctx.globalAlpha = Math.max(0, fade * (1 - age / 0.5)); ctx.lineWidth = 3; ctx.stroke();
                ctx.globalAlpha = Math.max(0, fade);
            }
            nsDrawEmote(ctx, e.id, 0, 0, 48 * Math.max(0.05, back), age);
            ctx.restore();
        }
    },
    // ---------- PHA CHUẨN BỊ (chọn body / shop / G.E.A.R): không có sân -> nút nổi + popup biểu cảm DOM ----------
    prepOn() {
        const u = document.getElementById('upgradeScreen');
        return !!(u && u.style.display !== 'none' && getComputedStyle(u).display !== 'none' && this.inMatch());
    },
    buildPrep() {
        const gc = document.getElementById('gameContainer'); if (!gc) return;
        const bar = this.mk('div', 'ns-prep'); bar.id = 'nsPrep';
        const mkBtn = (id, icon, title, fn) => { const b = this.mk('button', 'ns-prep-btn', icon); b.id = id; b.type = 'button'; b.title = title; b.addEventListener('click', fn); return b; };
        bar.append(mkBtn('nsPrepBtnChat', '💬', 'Chat', () => { this.togglePop('nsPrepChat'); document.getElementById('nsPrepBtnChat').classList.remove('ns-unread'); }),
                   mkBtn('nsPrepBtnEmote', '😀', 'Biểu cảm', () => this.togglePop('nsPrepWheel')));
        const chat = this.mk('div', 'ns-pop ns-chat-pop ns-prep-pop'); chat.id = 'nsPrepChat'; chat.appendChild(this.chatForm('nsPrep'));
        const wheel = this.mk('div', 'ns-pop ns-wheel ns-prep-pop'); wheel.id = 'nsPrepWheel';
        const pop = this.mk('div', 'ns-prep-emote'); pop.id = 'nsPrepEmote';
        gc.append(bar, chat, wheel, pop);
        setInterval(() => {
            const on = this.prepOn(); bar.classList.toggle('on', on);
            if (!on) { chat.classList.remove('open'); wheel.classList.remove('open'); }
            const eb = document.getElementById('nsPrepBtnEmote'); if (eb) eb.classList.toggle('ns-cd', Date.now() - this.lastEmoteAt < this.EMOTE_CD);
        }, 250);
    },
    prepEmote(pid, id) {
        const box = document.getElementById('nsPrepEmote'); if (!box) return;
        box.innerHTML = '';
        const cv = this.iconCanvas(id, 88); cv.className = 'ns-ico ns-prep-ico';
        const lab = this.mk('div', 'ns-prep-name ' + pid); lab.textContent = this.who(pid);
        box.append(cv, lab); box.classList.remove('show'); void box.offsetWidth; box.classList.add('show');
        clearTimeout(this._pe); this._pe = setTimeout(() => box.classList.remove('show'), this.EMOTE_MS);
        this.animateIcons();
    },
    // Ô canvas nhỏ (DOM) vẽ 1 biểu cảm, có hoạt ảnh nhẹ
    iconCanvas(id, px) {
        const cv = document.createElement('canvas');
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        cv.width = cv.height = Math.round(px * dpr); cv.style.width = cv.style.height = px + 'px';
        cv.dataset.emote = id; cv.className = 'ns-ico';
        this.paintIcon(cv, 0);
        return cv;
    },
    paintIcon(cv, t) {
        const c = cv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height);
        nsDrawEmote(c, cv.dataset.emote, cv.width / 2, cv.height / 2, cv.width * 0.92, t);
    },
    animateIcons() {
        if (this._anim) return;
        const loop = (ts) => {
            const vis = [...document.querySelectorAll('.ns-ico')].filter(cv => cv.offsetParent !== null);
            if (!vis.length) { this._anim = null; return; }
            for (const cv of vis) this.paintIcon(cv, ts / 1000);
            this._anim = requestAnimationFrame(loop);
        };
        this._anim = requestAnimationFrame(loop);
    },
    toggleLoadout(id) {
        const i = this.loadout.indexOf(id);
        if (i >= 0) { if (this.loadout.filter(Boolean).length <= 1) return; this.loadout[i] = null; }
        else { const free = this.loadout.indexOf(null); this.loadout[free >= 0 ? free : 3] = id; }
        if (this.loadout.every(Boolean)) { try { localStorage.setItem('cytank_emote_wheel', JSON.stringify(this.loadout)); } catch (e) {} }
        this.renderPicker(); this.buildWheel();
    },
    wheelIds() { // ô trống -> lấp bằng biểu cảm chưa dùng
        const ids = this.loadout.slice();
        for (let i = 0; i < 4; i++) if (!ids[i]) ids[i] = NS_EMOTES.find(e => !ids.includes(e.id)).id;
        return ids;
    },

    // ---------- CÀI ĐẶT CHỦ PHÒNG ----------
    setSetting(key, val) {
        if (!this.isHost()) return;
        if (key === 'map') this.applySettings(val, this.settings.win);
        else if (key === 'classic') this.applySettings(this.settings.map, this.settings.win, !!val);
        else this.applySettings(this.settings.map, val);
        this.pushSettings();
    },
    pushSettings() { this.send({ type: 'LOBBY_SET', map: this.settings.map, win: this.settings.win, classic: !!this.settings.classic }); },
    applySettings(map, win, classic) {
        if (classic !== undefined) this.settings.classic = !!classic;
        if (NS_MAPS.some(m => m[0] === map)) this.settings.map = map;
        win = parseInt(win); if (NS_WINS.includes(win)) this.settings.win = win;
        if (typeof gameState !== 'undefined') gameState.winScore = this.settings.win;
        if (typeof gameState !== 'undefined') gameState.classicMode = !!this.settings.classic;
        this.renderSettings();
    },
    // Dùng bởi shop-ui (host chọn map trước mỗi hiệp)
    pickMap(list) {
        const m = this.settings.map;
        return (!m || m === 'random') ? list[Math.floor(Math.random() * list.length)] : m;
    },

    // ---------- TẠM DỪNG ----------
    requestPause() {
        const pid = this.myPid();
        if (!this.inMatch() || this.pause.active || this.pause.used[pid] >= this.PAUSE_MAX) return;
        if (typeof gameState === 'undefined' || gameState.phase !== 'playing') return;
        if (this.isHost()) this.hostPause(pid); else this.send({ type: 'PAUSE_REQ' });
    },
    requestResume() {
        if (!this.pause.active) return;
        if (this.isHost()) this.hostResume(this.myPid(), false); else this.send({ type: 'RESUME_REQ' });
    },
    hostPause(pid) {
        if (this.pause.active || this.pause.used[pid] >= this.PAUSE_MAX) return;
        if (gameState.phase !== 'playing' || (typeof fatalCinematic !== 'undefined' && fatalCinematic.active)) return;
        this.pause.used[pid]++;
        this.pause.active = true; this.pause.by = pid; this.pause.endsAt = Date.now() + this.PAUSE_MS;
        this.broadcastPause();
        this.showPause();
    },
    hostResume(pid, auto) {
        if (!this.pause.active) return;
        this.pause.active = false; this.pause.resumedBy = auto ? null : pid;
        if (typeof NetState !== 'undefined' && NetState.resetDelta) NetState.resetDelta();
        this.broadcastPause(auto);
        this.showPause();
        this.toast(auto ? '⏱ Hết giờ tạm dừng — tiếp tục!' : `▶ ${this.who(pid)} tiếp tục trận đấu`);
    },
    broadcastPause(auto) {
        const p = this.pause;
        this.send({ type: 'PAUSE_STATE', active: p.active, by: p.by, remain: Math.max(0, p.endsAt - Date.now()), used: p.used, auto: !!auto, rby: p.resumedBy || null });
    },
    applyPauseState(d) {
        const was = this.pause.active;
        this.pause.active = !!d.active; this.pause.by = d.by;
        this.pause.endsAt = Date.now() + (+d.remain || 0);
        if (d.used) this.pause.used = { p1: +d.used.p1 || 0, p2: +d.used.p2 || 0 };
        if (was && !d.active) {
            if (typeof NetSmooth !== 'undefined' && NetSmooth.reset) NetSmooth.reset();
            this.toast(d.auto ? '⏱ Hết giờ tạm dừng — tiếp tục!' : `▶ ${this.who(d.rby)} tiếp tục trận đấu`);
        }
        this.showPause();
    },
    pauseTick() {
        if (!this.pause.active) return;
        if (!this.inMatch()) { this.pause.active = false; this.showPause(); return; }
        const left = this.pause.endsAt - Date.now();
        if (this.isHost()) {
            if (left <= 0) { this.hostResume(null, true); return; }
            if (!this._lastPb || Date.now() - this._lastPb > 1000) { this._lastPb = Date.now(); this.broadcastPause(); }
        } else if (left < -3000) { this.pause.active = false; this.showPause(); } // dự phòng mất gói
        const n = document.getElementById('nsPauseNum'); if (n) n.textContent = Math.max(0, Math.ceil(left / 1000));
    },
    who(pid) {
        if (!pid) return '';
        if (pid === this.myPid()) return 'Bạn';
        const m = this.om(); const lp = (m && m.playersLobbyData) || [];
        const pl = lp.find(p => (pid === 'p1') === !!p.isHost);
        return (pid === 'p1' ? 'P1' : 'P2') + (pl && pl.nickname ? ' · ' + pl.nickname : '');
    },
    toast(msg) {
        const f = document.getElementById('nsFloat'); if (!f) return;
        const el = document.createElement('div'); el.className = 'ns-float-msg sys'; el.textContent = msg; f.appendChild(el);
        setTimeout(() => el.classList.add('out'), 2400); setTimeout(() => el.remove(), 3000);
    },

    // ---------- DOM ----------
    mk(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; },
    chatForm(prefix) {
        const wrap = this.mk('div', 'ns-chat');
        const log = this.mk('div', 'ns-chat-log'); log.id = prefix + 'ChatLog';
        const form = this.mk('form', 'ns-chat-form');
        const inp = this.mk('input', 'ns-chat-input'); inp.id = prefix + 'ChatInput';
        inp.maxLength = 80; inp.placeholder = 'Nhắn tin (tối đa 80 ký tự)…'; inp.autocomplete = 'off'; inp.enterKeyHint = 'send';
        const btn = this.mk('button', 'ns-chat-send', '➤'); btn.type = 'submit'; btn.title = 'Gửi';
        // Không để phím gõ chữ lọt xuống điều khiển xe (A/D/Space...)
        for (const ev of ['keydown', 'keyup', 'keypress']) inp.addEventListener(ev, e => e.stopPropagation());
        form.addEventListener('submit', (e) => { e.preventDefault(); if (this.sendChat(inp.value)) inp.value = ''; });
        form.append(inp, btn); wrap.append(log, form);
        return wrap;
    },
    buildLobby() {
        const view = document.getElementById('activeLobbyView'); if (!view) return;
        const box = this.mk('div', 'ns-lobby'); box.id = 'nsLobby';
        // Cài đặt trận
        const set = this.mk('div', 'ns-sec');
        set.appendChild(this.mk('div', 'ns-sec-title', '⚙️ CÀI ĐẶT TRẬN <small id="nsSetNote"></small>'));
        const row1 = this.mk('div', 'ns-row'); row1.appendChild(this.mk('span', 'ns-lbl', 'Map'));
        const sel = this.mk('select', 'ns-select'); sel.id = 'nsMapSel';
        for (const [id, name] of NS_MAPS) { const o = document.createElement('option'); o.value = id; o.textContent = name; sel.appendChild(o); }
        sel.addEventListener('change', () => this.setSetting('map', sel.value));
        row1.appendChild(sel);
        const row2 = this.mk('div', 'ns-row'); row2.appendChild(this.mk('span', 'ns-lbl', 'Thắng'));
        const chips = this.mk('div', 'ns-chips'); chips.id = 'nsWinChips';
        for (const w of NS_WINS) { const b = this.mk('button', 'ns-chip', 'Chạm ' + w); b.type = 'button'; b.dataset.win = w; b.addEventListener('click', () => this.setSetting('win', w)); chips.appendChild(b); }
        row2.appendChild(chips);
        const row3 = this.mk('div', 'ns-row'); row3.appendChild(this.mk('span', 'ns-lbl', 'Luật'));
        const chips3 = this.mk('div', 'ns-chips'); chips3.id = 'nsRuleChips';
        for (const [v, t] of [[0, 'G.E.A.R'], [1, 'Cổ Điển']]) { const b = this.mk('button', 'ns-chip', t); b.type = 'button'; b.dataset.classic = v; b.addEventListener('click', () => this.setSetting('classic', !!v)); chips3.appendChild(b); }
        row3.appendChild(chips3);
        set.append(row1, row2, row3);
        // Chọn biểu cảm
        const emo = this.mk('div', 'ns-sec');
        emo.appendChild(this.mk('div', 'ns-sec-title', '😀 VÒNG BIỂU CẢM <small id="nsEmoNote"></small>'));
        const slots = this.mk('div', 'ns-emo-slots'); slots.id = 'nsEmoSlots';
        const grid = this.mk('div', 'ns-emo-grid'); grid.id = 'nsEmoGrid';
        for (const e of NS_EMOTES) {
            const b = this.mk('button', 'ns-emo-cell'); b.type = 'button'; b.dataset.emote = e.id; b.title = e.name;
            b.appendChild(this.iconCanvas(e.id, 34));
            b.addEventListener('click', () => this.toggleLoadout(e.id));
            grid.appendChild(b);
        }
        emo.append(slots, grid);
        // Chat
        const chat = this.mk('div', 'ns-sec');
        chat.appendChild(this.mk('div', 'ns-sec-title', '💬 TRÒ CHUYỆN'));
        chat.appendChild(this.chatForm('nsLobby'));
        box.append(set, emo, chat);
        const actions = view.querySelector('.lobby-actions');
        view.insertBefore(box, actions || null);
        this.renderSettings(); this.renderPicker(); this.renderChat();
        // Hoạt ảnh icon khi sảnh hiện
        new MutationObserver(() => { if (view.style.display !== 'none') { if (this.isHost()) { if (!this._adopted && NS_WINS.includes(gameState.winScore)) this.settings.win = gameState.winScore; if (!this._adopted) this.settings.classic = !!gameState.classicMode; this._adopted = true; this.applySettings(this.settings.map, this.settings.win); } else this.renderSettings(); this.animateIcons(); } }).observe(view, { attributes: true, attributeFilter: ['style'] });
    },
    renderSettings() {
        const host = this.isHost();
        const sel = document.getElementById('nsMapSel');
        if (sel) { sel.value = this.settings.map; sel.disabled = !host; }
        document.querySelectorAll('#nsWinChips .ns-chip').forEach(b => {
            b.classList.toggle('on', +b.dataset.win === this.settings.win); b.disabled = !host;
        });
        document.querySelectorAll('#nsRuleChips .ns-chip').forEach(b => {
            b.classList.toggle('on', (b.dataset.classic === '1') === !!this.settings.classic); b.disabled = !host;
        });
        const note = document.getElementById('nsSetNote');
        if (note) note.textContent = host ? '(bạn là chủ phòng)' : '(chủ phòng chỉnh)';
    },
    renderPicker() {
        const slots = document.getElementById('nsEmoSlots'); if (!slots) return;
        slots.innerHTML = '';
        this.loadout.forEach((id, i) => {
            const s = this.mk('div', 'ns-emo-slot' + (id ? '' : ' empty'));
            s.appendChild(this.mk('span', 'ns-slot-n', String(i + 1)));
            if (id) s.appendChild(this.iconCanvas(id, 30));
            slots.appendChild(s);
        });
        document.querySelectorAll('#nsEmoGrid .ns-emo-cell').forEach(b => b.classList.toggle('on', this.loadout.includes(b.dataset.emote)));
        const n = document.getElementById('nsEmoNote'); if (n) n.textContent = `(chọn 4 · ${this.loadout.filter(Boolean).length}/4)`;
        this.animateIcons();
    },
    buildHud() {
        const gc = document.getElementById('gameContainer'); if (!gc) return;
        const group = this.mk('div', 'ns-hud'); group.id = 'nsHud';
        const mkBtn = (id, icon, text, fn) => {
            const b = this.mk('button', 'hud-btn ns-hud-btn', `<span class="hud-icon">${icon}</span><span class="hud-text">${text}</span>`);
            b.id = id; b.type = 'button'; b.addEventListener('click', fn); return b;
        };
        group.append(
            mkBtn('nsBtnChat', '💬', 'CHAT', () => this.togglePop('nsChatPop')),
            mkBtn('nsBtnEmote', '😀', 'EMOTE', () => this.togglePop('nsWheel')),
            mkBtn('nsBtnPause', '⏸', 'DỪNG 2', () => this.requestPause()),
        );
        const chatPop = this.mk('div', 'ns-pop ns-chat-pop'); chatPop.id = 'nsChatPop';
        chatPop.appendChild(this.chatForm('nsHud'));
        const wheel = this.mk('div', 'ns-pop ns-wheel'); wheel.id = 'nsWheel';
        const float = this.mk('div', 'ns-float'); float.id = 'nsFloat';
        const ov = this.mk('div', 'ns-pause'); ov.id = 'nsPause';
        ov.innerHTML = '<div class="ns-pause-card"><div class="ns-pause-t">⏸ TẠM DỪNG</div><div id="nsPauseNum" class="ns-pause-num">30</div>' +
            '<div id="nsPauseBy" class="ns-pause-by"></div><div class="ns-pause-hint">Tự tiếp tục khi hết giờ (chống câu giờ)</div>' +
            '<button id="nsResumeBtn" type="button" class="ns-resume">▶ TIẾP TỤC</button><div id="nsPauseLeft" class="ns-pause-left"></div></div>';
        const left = document.getElementById('hud-left-group');
        if (left) { while (group.firstChild) left.appendChild(group.firstChild); gc.append(chatPop, wheel, float, ov); }
        else gc.append(group, chatPop, wheel, float, ov);
        document.getElementById('nsResumeBtn').addEventListener('click', () => this.requestResume());
        this.buildWheel();
        setInterval(() => this.refreshHud(), 500);
    },
    buildWheel() {
        for (const wid of ['nsWheel', 'nsPrepWheel']) {
            const w = document.getElementById(wid); if (!w) continue;
            w.innerHTML = '';
            this.wheelIds().forEach((id, i) => {
                const b = this.mk('button', 'ns-wheel-slot s' + i); b.type = 'button'; b.title = NS_EMOTE_MAP[id].name;
                b.appendChild(this.iconCanvas(id, 46));
                b.addEventListener('click', () => this.sendEmote(id));
                w.appendChild(b);
            });
            w.appendChild(this.mk('div', 'ns-wheel-hub', '😀'));
        }
    },
    togglePop(id) {
        const el = document.getElementById(id); if (!el) return;
        const open = !el.classList.contains('open');
        this.closePops();
        if (id === 'nsWheel' && Date.now() - this.lastEmoteAt < this.EMOTE_CD) return;
        if (open) { el.classList.add('open'); this.animateIcons(); if (id === 'nsChatPop') this.renderChat(); }
    },
    closePops() { document.querySelectorAll('.ns-pop.open').forEach(e => e.classList.remove('open')); },
    refreshHud() {
        const pb = document.getElementById('nsBtnPause');
        if (pb) {
            const left = this.PAUSE_MAX - (this.pause.used[this.myPid()] || 0);
            pb.querySelector('.hud-text').textContent = 'DỪNG ' + Math.max(0, left);
            pb.disabled = left <= 0 || this.pause.active;
        }
        const eb = document.getElementById('nsBtnEmote');
        if (eb) {
            const cd = this.EMOTE_CD - (Date.now() - this.lastEmoteAt);
            eb.classList.toggle('ns-cd', cd > 0);
            eb.querySelector('.hud-text').textContent = cd > 0 ? Math.ceil(cd / 1000) + 's' : 'EMOTE';
        }
    },
    showPause() {
        const ov = document.getElementById('nsPause'); if (!ov) return;
        const on = this.isPaused();
        ov.classList.toggle('open', on);
        if (on) {
            this.closePops();
            const by = document.getElementById('nsPauseBy'); if (by) by.textContent = 'Tạm dừng bởi: ' + this.who(this.pause.by);
            const n = document.getElementById('nsPauseNum'); if (n) n.textContent = Math.max(0, Math.ceil((this.pause.endsAt - Date.now()) / 1000));
            const l = document.getElementById('nsPauseLeft');
            if (l) l.textContent = `Lượt dừng còn lại — P1: ${this.PAUSE_MAX - this.pause.used.p1} · P2: ${this.PAUSE_MAX - this.pause.used.p2}`;
        }
        this.refreshHud();
    },
};

OnlineSocial.init();
