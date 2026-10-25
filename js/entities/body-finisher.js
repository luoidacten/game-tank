// ============================================================
// BodyFinisher – khung KẾT LIỄU dùng chung cho các thân xe chưa có hiệu ứng riêng.
// Mỗi thân chỉ cần 1 dòng cấu hình trong BODY_FINISHERS (màu, ký hiệu, chữ, kiểu hình):
//   slash (nhát chém) · blast (vụ nổ) · beam (tia) · implode (hút sập) · freeze (đóng băng vỡ vụn)
//   bolt (sét) · rain (mưa đạn/kiếm/bài...) · burn (thiêu/ăn mòn) · seal (ấn phong) · glitch (nhiễu thời gian)
//   scope (ống ngắm khóa mục tiêu)
// Mỗi thân có hàm vẽ CHỮ KÝ riêng trong BF_MOTIFS (js/entities/body-finisher-motifs.js); BF_STYLES chỉ là dự phòng.
// Kích hoạt chung: bọc Player.takeDamage (máu > 0 trước, <= 0 sau, người đánh là thân có cấu hình).
// Online: thực thể chỉ chứa dữ liệu thuần (BodyFinisher nằm trong NET_CLASSES), cấu hình tra theo id thân.
// ============================================================
// t1/t2: 2 dòng chữ; c/c2: màu chính/phụ; g: ký hiệu lớn; s: kiểu; n: số nhát/vệt; p: ký hiệu đạn (rain); sky: tia từ trời; pal: dải màu
const BODY_FINISHERS = {
    money_tank:   { t1: 'ĐẾ CHẾ', t2: 'TIỀN TỆ', c: '#facc15', c2: '#fef08a', g: '$', s: 'rain', p: '$', n: 26 },
    tank:         { t1: 'NGHIỀN', t2: 'NÁT THÉP', c: '#f97316', c2: '#fde68a', g: '▣', s: 'blast' },
    ice:          { t1: 'ĐÓNG BĂNG', t2: 'VỠ VỤN', c: '#67e8f9', c2: '#e0f2fe', g: '❄', s: 'freeze' },
    big_bullet:   { t1: 'ĐẠN', t2: 'KHỔNG LỒ', c: '#fb923c', c2: '#fef3c7', g: '●', s: 'blast', n: 3 },
    shotgun:      { t1: 'NỔ TUNG', t2: 'TẦM GẦN', c: '#f59e0b', c2: '#fde68a', g: '⁂', s: 'blast' },
    overload:     { t1: 'QUÁ TẢI', t2: 'ĐIỆN ÁP', c: '#a78bfa', c2: '#38bdf8', g: 'Ω', s: 'bolt' },
    smg:          { t1: 'XẢ SẠCH', t2: 'BĂNG ĐẠN', c: '#fbbf24', c2: '#fff7ed', g: '⁍', s: 'rain', n: 30 },
    lazer_charge: { t1: 'XUYÊN PHÁ', t2: 'TUYỆT ĐỐI', c: '#f43f5e', c2: '#fecdd3', g: '✦', s: 'beam' },
    lazer_auto:   { t1: 'NÓNG', t2: 'CHẢY', c: '#ef4444', c2: '#fb923c', g: '≡', s: 'beam' },
    rocket:       { t1: 'OANH', t2: 'TẠC', c: '#f97316', c2: '#fde047', g: '✹', s: 'blast', n: 3 },
    portal:       { t1: 'HƯ', t2: 'KHÔNG', c: '#a855f7', c2: '#22d3ee', g: '◎', s: 'implode' },
    acid:         { t1: 'ĂN MÒN', t2: 'TAN RÃ', c: '#84cc16', c2: '#a855f7', g: '☣', s: 'burn' },
    engineer:     { t1: 'ĐỒNG LOẠT', t2: 'KHAI HỎA', c: '#f59e0b', c2: '#cbd5e1', g: '⚒', s: 'rain', n: 20 },
    ghost:        { t1: 'VÔ ẢNH', t2: 'ĐOẠT HỒN', c: '#c7d2fe', c2: '#818cf8', g: '☾', s: 'slash', n: 3 },
    aaa:          { t1: 'PHÁO KÍCH', t2: 'TỔNG LỰC', c: '#f97316', c2: '#fde047', g: '❋', s: 'rain', p: '●', n: 14 },
    blade_god:    { t1: 'PHÁ THIÊN', t2: 'KIẾM', c: '#fde68a', c2: '#a78bfa', g: '†', s: 'slash', n: 1 },
    van_kiem:     { t1: 'VẠN KIẾM', t2: 'QUY TÔNG', c: '#38bdf8', c2: '#e0f2fe', g: '萬', s: 'rain', p: '†', n: 24 },
    water_gun:    { t1: 'THỦY LONG', t2: 'TRẢM', c: '#38bdf8', c2: '#e0f2fe', g: '≋', s: 'beam' },
    furnace:      { t1: 'HỎA', t2: 'TÁNG', c: '#f97316', c2: '#ef4444', g: '♨', s: 'burn' },
    am_duong_su:  { t1: 'ÂM DƯƠNG', t2: 'PHONG ẤN', c: '#f8fafc', c2: '#ef4444', g: '☯', s: 'seal' },
    six_barrel:   { t1: 'MƯA', t2: 'THÉP', c: '#fbbf24', c2: '#f97316', g: '⊛', s: 'rain', n: 34 },
    the_strongest:{ t1: 'HƯ THỨC', t2: 'TỬ', c: '#a855f7', c2: '#3b82f6', g: '◉', s: 'implode', pal: ['#ef4444', '#3b82f6', '#a855f7'] },
    sniper:       { t1: 'MỘT PHÁT', t2: 'MỘT MẠNG', c: '#22d3ee', c2: '#f43f5e', g: '⌖', s: 'scope' },
    cung:         { t1: 'TIỄN', t2: 'VŨ', c: '#a3e635', c2: '#fef9c3', g: '➶', s: 'rain', p: '➶', n: 22 },
    mirror:       { t1: 'GƯƠNG', t2: 'VỠ', c: '#e0f2fe', c2: '#a5b4fc', g: '◇', s: 'freeze' },
    sukuna:       { t1: 'PHỤC MA', t2: 'NGỰ TRÙ TỬ', c: '#ef4444', c2: '#fecaca', g: '⛩', s: 'slash', n: 7 },
    paradox:      { t1: 'NGHỊCH LÝ', t2: 'THỜI GIAN', c: '#22d3ee', c2: '#f472b6', g: '∞', s: 'glitch' },
    magician:     { t1: 'MÀN CUỐI', t2: 'ẢO THUẬT', c: '#f472b6', c2: '#facc15', g: '♠', s: 'rain', p: '♠', n: 20, pal: ['#f472b6', '#facc15', '#f8fafc', '#a855f7'] },
    inventor:     { t1: 'KHÔNG KÍCH', t2: 'DRONE', c: '#22d3ee', c2: '#facc15', g: '✈', s: 'rain', p: '▼', n: 14 },
    shadow_hunter:{ t1: 'ÁM SÁT', t2: 'BÓNG ĐÊM', c: '#8b5cf6', c2: '#ef4444', g: '☽', s: 'slash', n: 4 },
    shortgunATK:  { t1: 'BỘC PHÁ', t2: 'ÁP SÁT', c: '#f59e0b', c2: '#ef4444', g: '➤', s: 'blast' },
    thunder:      { t1: 'LÔI THẦN', t2: 'GIÁNG THẾ', c: '#facc15', c2: '#60a5fa', g: 'ϟ', s: 'bolt', n: 5 },
    magnet:       { t1: 'TỪ TRƯỜNG', t2: 'NGHIỀN ÉP', c: '#ef4444', c2: '#3b82f6', g: '⊕', s: 'implode', pal: ['#ef4444', '#3b82f6'] },
    evolution:    { t1: 'ĐỘT BIẾN', t2: 'GEN TRỘI', c: '#4ade80', c2: '#facc15', g: '✧', s: 'blast', n: 2 },
    death_lock:   { t1: 'XIỀNG', t2: 'TỬ THẦN', c: '#a855f7', c2: '#94a3b8', g: '⛓', s: 'seal' },
    creator:      { t1: 'KIẾN TẠO', t2: 'HỦY DIỆT', c: '#22d3ee', c2: '#facc15', g: '⬢', s: 'rain', p: '◆', n: 18 },
    necromancer:  { t1: 'VONG HỒN', t2: 'NUỐT CHỬNG', c: '#4ade80', c2: '#a855f7', g: '☠', s: 'implode' },
    genius:       { t1: 'CỖ MÁY', t2: 'THIÊN TÀI', c: '#22d3ee', c2: '#f97316', g: '⚙', s: 'beam' },
    kiem_khach:   { t1: 'NHẤT KIẾM', t2: 'ĐOẠN HỒN', c: '#e2e8f0', c2: '#38bdf8', g: '劍', s: 'slash', n: 2 },
    sprayer:      { t1: 'PHUN', t2: 'TÀN', c: '#f97316', c2: '#67e8f9', g: '☁', s: 'burn', pal: ['#f97316', '#84cc16', '#67e8f9'] },
    customize:    { t1: 'LẮP GHÉP', t2: 'HOÀN HẢO', c: '#22d3ee', c2: '#f472b6', g: '⊞', s: 'glitch' },
    kiem_su:      { t1: 'NGŨ HÀNH', t2: 'KIẾM TRẬN', c: '#facc15', c2: '#4ade80', g: '五', s: 'rain', p: '†', n: 20, pal: ['#facc15', '#4ade80', '#ef4444', '#b45309', '#38bdf8'] },
    revolver:     { t1: 'TỬ CHIẾN', t2: 'GIỮA TRƯA', c: '#fbbf24', c2: '#ef4444', g: '✪', s: 'scope' },
    dj:           { t1: 'BÙNG NỔ', t2: 'NHỊP ĐIỆU', c: '#f472b6', c2: '#22d3ee', g: '♪', s: 'blast', n: 4, pal: ['#f472b6', '#22d3ee', '#facc15', '#a855f7'] },
    steel_hook:   { t1: 'XÍCH THÉP', t2: 'ĐOẠT MẠNG', c: '#94a3b8', c2: '#f97316', g: '⚓', s: 'beam', chain: true },
    kiem_vu:      { t1: 'BẢN MỆNH', t2: 'KIẾM VŨ', c: '#a78bfa', c2: '#f0abfc', g: '舞', s: 'slash', n: 1 },
    t_zero:       { t1: 'THIÊN', t2: 'LUẬT', c: '#22d3ee', c2: '#f8fafc', g: '⌬', s: 'beam', sky: true },
    raven_oca:    { t1: 'CUỘC SĂN', t2: 'KẾT THÚC', c: '#f43f5e', c2: '#e2e8f0', g: 'Ѵ', s: 'scope' },
    lazer_beam:   { t1: 'TIA', t2: 'THIÊU ĐỐT', c: '#ef4444', c2: '#fde68a', g: '☀', s: 'beam' },
    healer:       { t1: 'NHỊP TIM', t2: 'NGỪNG ĐẬP', c: '#4ade80', c2: '#f0fdf4', g: '✚', s: 'implode' },
    chrononeo:    { t1: 'HAI THỜI ĐẠI', t2: 'MỘT KẾT CỤC', c: '#f59e0b', c2: '#22d3ee', g: '⧗', s: 'glitch' },
    gemini:       { t1: 'SONG TỬ', t2: 'HỢP KÍCH', c: '#60a5fa', c2: '#f472b6', g: '♊', s: 'slash', n: 2 },
    blood_lord:   { t1: 'HUYẾT', t2: 'TẾ', c: '#dc2626', c2: '#fecaca', g: '♦', s: 'implode', pal: ['#dc2626', '#7f1d1d', '#fecaca'] },
    berserker:    { t1: 'CUỒNG', t2: 'NỘ', c: '#ef4444', c2: '#f97316', g: '✖', s: 'slash', n: 4 },
    kazuki:       { t1: 'SONG KIẾM', t2: 'VÔ NIỆM', c: '#e2e8f0', c2: '#60a5fa', g: '⚔', s: 'slash', n: 2 },
};
const BF_DUR = 120; // 2s
const BF_HIT = 60;  // khoảnh khắc ra đòn chính

function bfRgb(hex) {
    const h = (hex || '#ffffff').replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function bfA(hex, a) { const c = bfRgb(hex); return `rgba(${c[0]},${c[1]},${c[2]},${a})`; }
function bfR(seed, i) { const x = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453; return x - Math.floor(x); }
function bfPal(cfg, i) { return cfg.pal ? cfg.pal[i % cfg.pal.length] : (i % 2 ? cfg.c2 : cfg.c); }

class BodyFinisher {
    constructor(owner, victim) {
        this.body = owner.weapon; this.team = owner.id;
        this.x = victim.x + victim.w / 2; this.y = victim.y + victim.h / 2;
        this.ox = owner.x + owner.w / 2; this.oy = owner.y + owner.h / 2;
        this.vw = victim.w; this.vh = victim.h;
        this.t = 0; this.dur = BF_DUR; this.active = true;
        this.seed = Math.round(Math.random() * 1000) / 100;
    }
    update() {
        this.t++;
        const cfg = BODY_FINISHERS[this.body];
        if (cfg && this.t === BF_HIT) {
            const c = bfRgb(cfg.c);
            if (typeof explosions !== 'undefined' && typeof Explosion !== 'undefined')
                explosions.push(new Explosion(this.x, this.y, 70, `rgba(${c[0]}, ${c[1]}, ${c[2]},`, 0, null));
            if (typeof spawnSparkParticles === 'function') { spawnSparkParticles(this.x, this.y, cfg.c, 24); spawnSparkParticles(this.x, this.y, cfg.c2, 14); }
            if (typeof triggerScreenShake === 'function') triggerScreenShake(12, 20);
            if (typeof soundSystem !== 'undefined' && soundSystem && !soundSystem.muted && soundSystem.playExplosion) soundSystem.playExplosion();
        }
        if (this.t >= this.dur) this.active = false;
    }
    draw() { }
    drawOver() { const cfg = BODY_FINISHERS[this.body]; if (cfg) bfDraw(this, cfg); }
}

function bfSpawn(owner, victim) {
    if (typeof bodyEffects === 'undefined' || !owner || !BODY_FINISHERS[owner.weapon]) return;
    if (typeof finisherFxActive === 'function' && finisherFxActive()) return;
    // Đang màn kết hiệp: chỉ người thắng được diễn, và chỉ 1 lần (không kéo dài màn chờ)
    const fc = typeof fatalCinematic !== 'undefined' ? fatalCinematic : null;
    if (fc && fc.active && (owner.id !== fc.winnerId || fc.fxSeen)) return;
    bodyEffects.push(new BodyFinisher(owner, victim));
    const cfg = BODY_FINISHERS[owner.weapon];
    if (typeof spawnSparkParticles === 'function') spawnSparkParticles(victim.x + victim.w / 2, victim.y + victim.h / 2, cfg.c, 18);
    if (typeof triggerScreenShake === 'function') triggerScreenShake(8, 14);
}
// Người ra đòn thật: Player, hoặc chủ của vật triệu hồi/ụ súng
function bfAttacker(a) {
    if (!a || typeof Player === 'undefined') return null;
    if (a instanceof Player) return a;
    const o = a.owner;
    if (o instanceof Player) return o;
    if (o === 1 || o === 2) return o === 1 ? (typeof p1 !== 'undefined' ? p1 : null) : (typeof p2 !== 'undefined' ? p2 : null);
    return null;
}
(function () {
    if (typeof Player === 'undefined') return;
    const orig = Player.prototype.takeDamage;
    Player.prototype.takeDamage = function (amount, attacker, options) {
        const before = this.hp;
        const r = orig.apply(this, arguments);
        if (before > 0 && this.hp <= 0) {
            const a = bfAttacker(attacker);
            if (a && a !== this && BODY_FINISHERS[a.weapon]) bfSpawn(a, this);
        }
        return r;
    };
})();

// ---------- Vẽ ----------
function bfDraw(f, cfg) {
    const t = f.t, W = canvas.width, H = canvas.height;
    const fade = t > f.dur - 22 ? Math.max(0, (f.dur - t) / 22) : 1;
    const dk = bfRgb(cfg.c).map(v => Math.round(v * 0.12));
    ctx.save();
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = `rgba(${dk[0]},${dk[1]},${dk[2]},${0.68 * Math.min(1, t / 10) * fade})`;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
    ctx.globalAlpha = fade;
    ctx.lineCap = 'round';
    const fn = (typeof BF_MOTIFS !== 'undefined' && BF_MOTIFS[f.body]) || BF_STYLES[cfg.s] || BF_STYLES.blast;
    ctx.save(); fn(f, cfg, t, W, H); ctx.restore();
    // chớp sáng lúc ra đòn
    if (t >= BF_HIT && t < BF_HIT + 10) {
        const k = (t - BF_HIT) / 10;
        ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = bfA(cfg.c2, 0.45 * (1 - k)); ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.restore();
    }
    // ký hiệu lớn phía sau mục tiêu
    if (t >= 6) {
        const k = Math.min(1, (t - 6) / 14), pulse = t >= BF_HIT ? 1 + 0.25 * Math.max(0, 1 - (t - BF_HIT) / 12) : 1;
        ctx.save(); ctx.translate(f.x, f.y);
        if (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest') ctx.rotate(Math.PI);
        ctx.globalAlpha = fade * 0.35 * k; ctx.scale(pulse * (0.6 + 0.4 * k), pulse * (0.6 + 0.4 * k));
        ctx.font = "900 92px 'Orbitron', Arial"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.shadowBlur = 30; ctx.shadowColor = cfg.c; ctx.fillStyle = cfg.c;
        ctx.fillText(cfg.g, 0, 0);
        ctx.restore();
    }
    ctx.restore();
    // chữ tiêu đề
    if (t >= 16) {
        const a = Math.min(1, (t - 16) / 8) * fade;
        const fc = typeof fatalCinematic !== 'undefined' && fatalCinematic && fatalCinematic.active;
        const cxv = fc ? fatalCinematic.victimX : f.x, cyv = fc ? fatalCinematic.victimY : f.y;
        ctx.save();
        ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.translate(Math.max(110, Math.min(W - 110, cxv)), cyv + (f.team === 1 ? 125 : -125));
        if (typeof onlineManager !== 'undefined' && onlineManager.isOnline && onlineManager.role === 'guest') ctx.rotate(Math.PI);
        const sc = t < 24 ? 1.4 - (t - 16) / 8 * 0.4 : 1; ctx.scale(sc, sc);
        ctx.font = "900 24px 'Orbitron', Arial"; ctx.lineWidth = 5; ctx.strokeStyle = '#000';
        ctx.shadowBlur = 18; ctx.shadowColor = cfg.c; ctx.fillStyle = cfg.c2;
        ctx.strokeText(cfg.t1, 0, -15); ctx.fillText(cfg.t1, 0, -15);
        ctx.fillStyle = cfg.c;
        ctx.strokeText(cfg.t2, 0, 15); ctx.fillText(cfg.t2, 0, 15);
        ctx.restore();
    }
}

function bfGlow(col, blur) { ctx.shadowColor = col; ctx.shadowBlur = blur; }
function bfRing(x, y, r, col, lw) { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.arc(x, y, Math.max(0.1, r), 0, Math.PI * 2); ctx.stroke(); }
function bfBurst(f, cfg, t, n, maxR) {
    if (t < BF_HIT) return;
    const k = Math.min(1, (t - BF_HIT) / 34);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    bfGlow(cfg.c, 16);
    bfRing(f.x, f.y, 10 + k * maxR, bfA(cfg.c, 1 - k), 5 * (1 - k) + 1);
    bfRing(f.x, f.y, 6 + k * maxR * 0.6, bfA(cfg.c2, (1 - k) * 0.8), 3);
    for (let i = 0; i < n; i++) {
        const a = bfR(f.seed, i) * Math.PI * 2, d = (18 + bfR(f.seed, i + 50) * maxR) * k;
        ctx.fillStyle = bfA(bfPal(cfg, i), 1 - k);
        ctx.beginPath(); ctx.arc(f.x + Math.cos(a) * d, f.y + Math.sin(a) * d, 2.5 * (1 - k) + 0.8, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
}

const BF_STYLES = {
    // Nhát chém: n vệt sáng lần lượt xé qua mục tiêu, cuối cùng nổ tách đôi
    slash(f, cfg, t, W) {
        const n = cfg.n || 3, L = Math.max(W, 420) * 0.75, step = Math.max(6, Math.floor(44 / n));
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < n; i++) {
            const t0 = 14 + i * step, k = (t - t0) / 12;
            if (k < 0) continue;
            const ang = n === 1 ? Math.PI / 2 - 0.12 : (bfR(f.seed, i) - 0.5) * 2.4 + (i % 2 ? 0.6 : -0.6);
            const dx = Math.cos(ang), dy = Math.sin(ang), grow = Math.min(1, k), lin = Math.max(0, 1 - (k - 1) / 3);
            if (lin <= 0) continue;
            const col = bfPal(cfg, i);
            bfGlow(col, 22);
            ctx.strokeStyle = bfA(col, lin); ctx.lineWidth = (n === 1 ? 14 : 7) * lin + 1;
            ctx.beginPath(); ctx.moveTo(f.x - dx * L, f.y - dy * L); ctx.lineTo(f.x - dx * L + dx * 2 * L * grow, f.y - dy * L + dy * 2 * L * grow); ctx.stroke();
            ctx.strokeStyle = bfA('#ffffff', lin); ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(f.x - dx * L, f.y - dy * L); ctx.lineTo(f.x - dx * L + dx * 2 * L * grow, f.y - dy * L + dy * 2 * L * grow); ctx.stroke();
        }
        ctx.restore();
        if (t >= BF_HIT) {
            const k = Math.min(1, (t - BF_HIT) / 30);
            ctx.save(); ctx.translate(f.x, f.y);
            ctx.fillStyle = bfA('#0b0b10', 1 - k);
            ctx.fillRect(-f.vw / 2 - k * 16, -f.vh / 2 - k * 10, f.vw / 2, f.vh);
            ctx.fillRect(k * 16, -f.vh / 2 + k * 10, f.vw / 2, f.vh);
            ctx.restore();
        }
        bfBurst(f, cfg, t, 18, 90);
    },
    // Vụ nổ: lõi tụ sáng rồi n đợt sóng xung kích + mảnh vỡ
    blast(f, cfg, t) {
        const n = cfg.n || 2;
        if (t < BF_HIT) {
            const k = (t - 10) / (BF_HIT - 10);
            if (k > 0) {
                ctx.save(); ctx.globalCompositeOperation = 'lighter'; bfGlow(cfg.c, 24);
                const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 10 + k * 30);
                g.addColorStop(0, bfA('#ffffff', 0.9 * k)); g.addColorStop(0.4, bfA(cfg.c2, 0.7 * k)); g.addColorStop(1, bfA(cfg.c, 0));
                ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x, f.y, 10 + k * 30, 0, Math.PI * 2); ctx.fill();
                for (let i = 0; i < 10; i++) {
                    const a = bfR(f.seed, i) * Math.PI * 2 + t * 0.05, r = 60 * (1 - k) + 12;
                    ctx.strokeStyle = bfA(bfPal(cfg, i), 0.8); ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.moveTo(f.x + Math.cos(a) * r, f.y + Math.sin(a) * r); ctx.lineTo(f.x + Math.cos(a) * (r + 14), f.y + Math.sin(a) * (r + 14)); ctx.stroke();
                }
                ctx.restore();
            }
            return;
        }
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (let w = 0; w < n; w++) {
            const k = (t - BF_HIT - w * 8) / 40;
            if (k < 0 || k > 1) continue;
            bfGlow(bfPal(cfg, w), 20);
            const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 20 + k * 150);
            g.addColorStop(0, bfA('#ffffff', 0.6 * (1 - k))); g.addColorStop(0.5, bfA(bfPal(cfg, w), 0.5 * (1 - k))); g.addColorStop(1, bfA(cfg.c, 0));
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x, f.y, 20 + k * 150, 0, Math.PI * 2); ctx.fill();
            bfRing(f.x, f.y, 20 + k * 170, bfA(bfPal(cfg, w + 1), 1 - k), 6 * (1 - k) + 1);
        }
        const k = Math.min(1, (t - BF_HIT) / 40);
        for (let i = 0; i < 16; i++) {
            const a = bfR(f.seed, i + 9) * Math.PI * 2, d = 10 + k * (60 + bfR(f.seed, i) * 110);
            ctx.strokeStyle = bfA(bfPal(cfg, i), 1 - k); ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(f.x + Math.cos(a) * d * 0.7, f.y + Math.sin(a) * d * 0.7); ctx.lineTo(f.x + Math.cos(a) * d, f.y + Math.sin(a) * d); ctx.stroke();
        }
        ctx.restore();
    },
    // Tia: vạch cảnh báo mảnh rồi tia lớn từ người bắn (hoặc từ trời) xuyên mục tiêu
    beam(f, cfg, t, W, H) {
        const sx = cfg.sky ? f.x : f.ox, sy = cfg.sky ? (f.team === 1 ? -40 : H + 40) : f.oy;
        const ex = f.x, ey = f.y + (f.y - sy) * 0.8;
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        if (t >= 10 && t < BF_HIT) {
            const k = (t - 10) / (BF_HIT - 10);
            bfGlow(cfg.c, 10);
            ctx.strokeStyle = bfA(cfg.c, 0.3 + 0.5 * (Math.floor(t / 4) % 2));
            ctx.lineWidth = 1.5 + k * 2; ctx.setLineDash(cfg.chain ? [8, 5] : [12, 8]);
            ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke(); ctx.setLineDash([]);
            bfRing(f.x, f.y, 40 * (1 - k) + 12, bfA(cfg.c2, 0.8), 2);
        } else if (t >= BF_HIT && t < BF_HIT + 40) {
            const k = (t - BF_HIT) / 40, w = (cfg.chain ? 8 : 26) * Math.sin(Math.min(1, k * 3) * Math.PI / 2) * (1 - k * 0.7);
            bfGlow(cfg.c, 30);
            ctx.strokeStyle = bfA(cfg.c, 0.85); ctx.lineWidth = w + 6;
            ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
            ctx.strokeStyle = bfA(cfg.c2, 0.9); ctx.lineWidth = w * 0.55 + 2;
            ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
            ctx.strokeStyle = bfA('#ffffff', 0.95); ctx.lineWidth = w * 0.2 + 1;
            ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
            if (cfg.chain) {
                const len = Math.hypot(ex - sx, ey - sy), ux = (ex - sx) / len, uy = (ey - sy) / len;
                ctx.strokeStyle = bfA(cfg.c, 1); ctx.lineWidth = 2.5;
                for (let d = 0; d < len; d += 14) { ctx.beginPath(); ctx.ellipse(sx + ux * d, sy + uy * d, 6, 3.5, Math.atan2(uy, ux) + (d / 14 % 2 ? 0 : Math.PI / 2), 0, Math.PI * 2); ctx.stroke(); }
            }
            for (let i = 0; i < 3; i++) bfRing(f.x, f.y, 14 + ((t * 2 + i * 14) % 42), bfA(cfg.c2, 0.6 * (1 - k)), 2);
        }
        ctx.restore();
        bfBurst(f, cfg, t, 22, 110);
    },
    // Hút sập: hạt xoắn ốc kéo vào tâm, quả cầu co lại rồi bùng nổ
    implode(f, cfg, t) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        if (t < BF_HIT) {
            const k = Math.max(0, (t - 6) / (BF_HIT - 6));
            for (let i = 0; i < 40; i++) {
                const a0 = bfR(f.seed, i) * Math.PI * 2, r0 = 70 + bfR(f.seed, i + 3) * 110;
                const kk = Math.min(1, k * (1 + bfR(f.seed, i + 7) * 0.6)), r = r0 * (1 - kk) + 4, a = a0 + kk * 5;
                const col = bfPal(cfg, i); bfGlow(col, 8);
                ctx.fillStyle = bfA(col, 0.4 + 0.6 * kk);
                ctx.beginPath(); ctx.arc(f.x + Math.cos(a) * r, f.y + Math.sin(a) * r, 1.5 + kk * 2, 0, Math.PI * 2); ctx.fill();
            }
            const R = 8 + 28 * Math.sin(k * Math.PI) ;
            bfGlow(cfg.c, 30);
            const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, R);
            g.addColorStop(0, bfA('#ffffff', 0.9)); g.addColorStop(0.5, bfA(cfg.c, 0.8)); g.addColorStop(1, bfA(cfg.c2, 0));
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x, f.y, R, 0, Math.PI * 2); ctx.fill();
            bfRing(f.x, f.y, 90 * (1 - k) + 6, bfA(cfg.c2, 0.7), 2);
            ctx.restore();
            return;
        }
        const k = Math.min(1, (t - BF_HIT) / 36);
        bfGlow(cfg.c, 30);
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 20 + k * 140);
        g.addColorStop(0, bfA('#ffffff', 0.8 * (1 - k))); g.addColorStop(0.35, bfA(cfg.c, 0.7 * (1 - k))); g.addColorStop(1, bfA(cfg.c2, 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x, f.y, 20 + k * 140, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        bfBurst(f, cfg, t, 28, 130);
    },
    // Đóng băng / gương: tinh thể mọc bao quanh rồi vỡ vụn bắn ra
    freeze(f, cfg, t) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const n = 9;
        if (t < BF_HIT) {
            const k = Math.min(1, Math.max(0, (t - 8) / 36));
            for (let i = 0; i < n; i++) {
                const a = i / n * Math.PI * 2 + bfR(f.seed, i) * 0.3, L = (18 + bfR(f.seed, i + 4) * 20) * k;
                ctx.save(); ctx.translate(f.x + Math.cos(a) * 6, f.y + Math.sin(a) * 6); ctx.rotate(a);
                bfGlow(cfg.c, 14); ctx.fillStyle = bfA(cfg.c, 0.55); ctx.strokeStyle = bfA(cfg.c2, 0.95); ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(L, 0); ctx.lineTo(0, 5); ctx.closePath(); ctx.fill(); ctx.stroke();
                ctx.restore();
            }
            ctx.fillStyle = bfA(cfg.c2, 0.35 * k); ctx.fillRect(f.x - f.vw / 2 - 4, f.y - f.vh / 2 - 4, f.vw + 8, f.vh + 8);
            if (t > 44) { // vết nứt
                ctx.strokeStyle = bfA('#ffffff', 0.9); ctx.lineWidth = 1.2;
                for (let i = 0; i < 5; i++) {
                    let x = f.x, y = f.y; ctx.beginPath(); ctx.moveTo(x, y);
                    for (let j = 0; j < 4; j++) { const a = bfR(f.seed, i * 9 + j) * Math.PI * 2; x += Math.cos(a) * 7; y += Math.sin(a) * 7; ctx.lineTo(x, y); }
                    ctx.stroke();
                }
            }
        } else {
            const k = Math.min(1, (t - BF_HIT) / 40);
            for (let i = 0; i < 22; i++) {
                const a = bfR(f.seed, i + 20) * Math.PI * 2, d = 8 + k * (40 + bfR(f.seed, i) * 120), s = 4 + bfR(f.seed, i + 5) * 7;
                ctx.save(); ctx.translate(f.x + Math.cos(a) * d, f.y + Math.sin(a) * d); ctx.rotate(a + k * 6 * (i % 2 ? 1 : -1));
                bfGlow(cfg.c, 10); ctx.fillStyle = bfA(i % 3 ? cfg.c : cfg.c2, 1 - k);
                ctx.beginPath(); ctx.moveTo(-s, 0); ctx.lineTo(0, -s * 0.5); ctx.lineTo(s, 0); ctx.lineTo(0, s * 0.6); ctx.closePath(); ctx.fill();
                ctx.restore();
            }
        }
        ctx.restore();
        bfBurst(f, cfg, t, 10, 90);
    },
    // Sét: n tia sét zig-zag từ trời giáng xuống mục tiêu
    bolt(f, cfg, t, W, H) {
        const n = cfg.n || 4, top = f.team === 1 ? -30 : H + 30;
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < n; i++) {
            const t0 = 16 + i * Math.floor(42 / n), age = t - t0;
            if (age < 0 || age > 10) continue;
            const a = 1 - age / 10, col = bfPal(cfg, i), seg = 9;
            bfGlow(col, 26);
            for (let pass = 0; pass < 2; pass++) {
                ctx.strokeStyle = pass ? bfA('#ffffff', a) : bfA(col, a); ctx.lineWidth = pass ? 1.6 : 5;
                ctx.beginPath();
                const x0 = f.x + (bfR(f.seed, i) - 0.5) * 120;
                ctx.moveTo(x0, top);
                for (let j = 1; j <= seg; j++) {
                    const k = j / seg, jit = j === seg ? 0 : (bfR(f.seed + i, j + t0) - 0.5) * 36;
                    ctx.lineTo(x0 + (f.x - x0) * k + jit, top + (f.y - top) * k);
                }
                ctx.stroke();
            }
            bfRing(f.x, f.y, 10 + age * 4, bfA(col, a), 3);
        }
        if (t >= BF_HIT) { // điện quấn mục tiêu
            const k = Math.min(1, (t - BF_HIT) / 40);
            bfGlow(cfg.c2, 12); ctx.strokeStyle = bfA(cfg.c2, 1 - k); ctx.lineWidth = 1.5;
            for (let i = 0; i < 6; i++) {
                ctx.beginPath(); let a = bfR(f.seed, i + t) * Math.PI * 2; ctx.moveTo(f.x, f.y);
                for (let j = 1; j < 5; j++) { const r = j * 9; a += (bfR(f.seed, i * 7 + j + t) - 0.5) * 1.4; ctx.lineTo(f.x + Math.cos(a) * r, f.y + Math.sin(a) * r); }
                ctx.stroke();
            }
        }
        ctx.restore();
        bfBurst(f, cfg, t, 16, 110);
    },
    // Mưa: đạn/kiếm/tên/bài/tiền bay tới tấp từ phía người ra đòn rồi nổ tung
    rain(f, cfg, t) {
        const n = cfg.n || 20, dirY = f.oy > f.y ? 1 : -1;
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        for (let i = 0; i < n; i++) {
            const t0 = 8 + Math.floor(bfR(f.seed, i) * 48), k = (t - t0) / 12;
            if (k < 0 || k > 1.25) continue;
            const sx = f.x + (bfR(f.seed, i + 40) - 0.5) * 260, sy = f.y + dirY * (200 + bfR(f.seed, i + 80) * 120);
            const tx = f.x + (bfR(f.seed, i + 120) - 0.5) * f.vw, ty = f.y + (bfR(f.seed, i + 160) - 0.5) * f.vh;
            const col = bfPal(cfg, i);
            if (k <= 1) {
                const x = sx + (tx - sx) * k, y = sy + (ty - sy) * k, px = sx + (tx - sx) * Math.max(0, k - 0.25), py = sy + (ty - sy) * Math.max(0, k - 0.25);
                bfGlow(col, 12);
                ctx.strokeStyle = bfA(col, 0.75); ctx.lineWidth = 2.5;
                ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke();
                if (cfg.p) {
                    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan2(ty - sy, tx - sx) + (cfg.p === '†' ? -Math.PI / 2 : (cfg.p === '➶' ? -Math.PI / 4 : 0)));
                    ctx.font = "900 16px 'Orbitron', Arial"; ctx.fillStyle = col; ctx.fillText(cfg.p, 0, 0); ctx.restore();
                } else { ctx.fillStyle = bfA('#ffffff', 0.95); ctx.beginPath(); ctx.arc(x, y, 2.4, 0, Math.PI * 2); ctx.fill(); }
            } else bfRing(tx, ty, 4 + (k - 1) * 60, bfA(col, 1 - (k - 1) * 4), 2);
        }
        ctx.restore();
        bfBurst(f, cfg, t, 24, 110);
    },
    // Thiêu / ăn mòn: lửa (hoặc axit) bốc lên từ mục tiêu, mục tiêu tan chảy rồi bùng lên
    burn(f, cfg, t) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const k = Math.min(1, t / BF_HIT), post = t >= BF_HIT ? Math.min(1, (t - BF_HIT) / 40) : 0;
        for (let i = 0; i < 34; i++) {
            const life = 34, ph = (t * (1 + bfR(f.seed, i) * 0.8) + i * 11) % life, a = ph / life;
            const x = f.x + (bfR(f.seed, i + 3) - 0.5) * (f.vw + 16) * (1 + post), up = f.team === 1 ? -1 : 1;
            const y = f.y + f.vh / 2 * -up + up * a * (50 + 60 * k + 40 * post);
            const r = (3 + bfR(f.seed, i + 6) * 6) * (1 - a) * (0.5 + k);
            const col = bfPal(cfg, i); bfGlow(col, 14);
            ctx.fillStyle = bfA(col, (1 - a) * 0.85 * (1 - post * 0.6));
            ctx.beginPath(); ctx.arc(x + Math.sin(t * 0.2 + i) * 4, y, Math.max(0.3, r), 0, Math.PI * 2); ctx.fill();
        }
        // mục tiêu tan chảy
        ctx.globalCompositeOperation = 'source-over'; ctx.shadowBlur = 0;
        const melt = Math.min(1, Math.max(0, (t - 20) / 50));
        ctx.fillStyle = `rgba(12,8,6,${0.85 * (1 - post)})`;
        ctx.fillRect(f.x - f.vw / 2, f.y - f.vh / 2 + f.vh * melt * 0.4, f.vw, f.vh * (1 - melt * 0.6));
        ctx.fillStyle = bfA(cfg.c, 0.6 * (1 - post));
        for (let i = 0; i < 4; i++) ctx.fillRect(f.x - f.vw / 2 + 3 + i * (f.vw - 6) / 3 - 2, f.y + f.vh / 2 - 4, 4, 4 + melt * (8 + bfR(f.seed, i) * 14));
        ctx.restore();
        bfBurst(f, cfg, t, 22, 100);
    },
    // Ấn phong: vòng phù văn xoay quanh mục tiêu, khép lại & khóa chặt
    seal(f, cfg, t) {
        const k = Math.min(1, Math.max(0, (t - 6) / 30)), close = t >= 36 ? Math.min(1, (t - 36) / (BF_HIT - 36)) : 0;
        const R = 70 - close * 34;
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(f.x, f.y);
        bfGlow(cfg.c, 18);
        ctx.save(); ctx.rotate(t * 0.04);
        bfRing(0, 0, R, bfA(cfg.c, 0.9 * k), 2.5); bfRing(0, 0, R * 0.78, bfA(cfg.c2, 0.8 * k), 1.5);
        ctx.strokeStyle = bfA(cfg.c, 0.8 * k); ctx.lineWidth = 1.5; ctx.beginPath();
        for (let i = 0; i <= 5; i++) { const a = i * Math.PI * 4 / 5 - Math.PI / 2; i ? ctx.lineTo(Math.cos(a) * R * 0.78, Math.sin(a) * R * 0.78) : ctx.moveTo(Math.cos(a) * R * 0.78, Math.sin(a) * R * 0.78); }
        ctx.stroke();
        ctx.font = "700 11px 'Orbitron', Arial"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = bfA(cfg.c2, k);
        for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ctx.save(); ctx.rotate(a); ctx.translate(0, -R - 9); ctx.fillText('ᚱᛟᚾᛉᛞᛗ'[i % 6], 0, 0); ctx.restore(); }
        ctx.restore();
        if (close > 0) { // xích / tia khóa từ 4 phía
            ctx.strokeStyle = bfA(cfg.c2, 0.9); ctx.lineWidth = 3;
            for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4, r0 = 150, r1 = 150 - close * (150 - 14); ctx.beginPath(); ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1); ctx.stroke(); }
        }
        ctx.restore();
        bfBurst(f, cfg, t, 20, 100);
    },
    // Nhiễu thời gian: dải glitch, tách màu RGB, đồng hồ tua ngược rồi xóa sổ
    glitch(f, cfg, t, W) {
        ctx.save();
        const k = Math.min(1, t / BF_HIT), post = t >= BF_HIT ? Math.min(1, (t - BF_HIT) / 40) : 0;
        for (let i = 0; i < 10; i++) {
            if (bfR(f.seed + Math.floor(t / 3), i) > 0.35 + k * 0.4) continue;
            const y = f.y + (bfR(f.seed + Math.floor(t / 3), i + 30) - 0.5) * 220, h = 2 + bfR(f.seed, i + t) * 9;
            ctx.fillStyle = bfA(i % 2 ? cfg.c : cfg.c2, 0.35 * (1 - post));
            ctx.fillRect(f.x - W * 0.6, y, W * 1.2, h);
        }
        ctx.globalCompositeOperation = 'lighter';
        const off = 3 + k * 8 * (1 - post);
        [[cfg.c, -off], [cfg.c2, off]].forEach(([c, o]) => { ctx.strokeStyle = bfA(c, 0.85 * (1 - post)); ctx.lineWidth = 2; ctx.strokeRect(f.x - f.vw / 2 + o, f.y - f.vh / 2, f.vw, f.vh); });
        // mặt đồng hồ tua ngược
        bfGlow(cfg.c, 16);
        bfRing(f.x, f.y, 48, bfA(cfg.c, 0.7 * (1 - post)), 2);
        for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ctx.fillStyle = bfA(cfg.c2, 0.8 * (1 - post)); ctx.fillRect(f.x + Math.cos(a) * 42 - 1.5, f.y + Math.sin(a) * 42 - 1.5, 3, 3); }
        const ha = -t * 0.25, ma = -t * 0.6;
        ctx.strokeStyle = bfA('#ffffff', 0.9 * (1 - post)); ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(f.x + Math.cos(ha) * 24, f.y + Math.sin(ha) * 24); ctx.stroke();
        ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(f.x + Math.cos(ma) * 38, f.y + Math.sin(ma) * 38); ctx.stroke();
        if (post > 0) { // xóa sổ: cắt thành lát rồi tan
            ctx.fillStyle = bfA(cfg.c2, 0.8 * (1 - post));
            for (let i = 0; i < 6; i++) ctx.fillRect(f.x - f.vw / 2 + (i % 2 ? 1 : -1) * post * 60, f.y - f.vh / 2 + i * f.vh / 6, f.vw, f.vh / 6 - 1);
        }
        ctx.restore();
        bfBurst(f, cfg, t, 18, 100);
    },
    // Ống ngắm: tâm ngắm thu hẹp khóa mục tiêu, viên đạn xé gió, vết nứt màn hình
    scope(f, cfg, t) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        if (t < BF_HIT) {
            const k = Math.min(1, Math.max(0, (t - 6) / 44)), R = 110 - k * 78, rot = (1 - k) * 1.2;
            ctx.translate(f.x, f.y); ctx.rotate(rot);
            bfGlow(cfg.c, 14);
            bfRing(0, 0, R, bfA(cfg.c, 0.9), 2); bfRing(0, 0, R * 0.55, bfA(cfg.c, 0.5), 1);
            ctx.strokeStyle = bfA(cfg.c, 0.9); ctx.lineWidth = 2;
            for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); ctx.beginPath(); ctx.moveTo(R * 0.35, 0); ctx.lineTo(R + 16, 0); ctx.stroke(); }
            if (k >= 1 && Math.floor(t / 4) % 2) { ctx.fillStyle = bfA(cfg.c2, 1); ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill(); }
        } else {
            const k = Math.min(1, (t - BF_HIT) / 40);
            if (k < 0.25) { // vệt đạn
                bfGlow(cfg.c2, 20); ctx.strokeStyle = bfA('#ffffff', 1 - k * 4); ctx.lineWidth = 4;
                ctx.beginPath(); ctx.moveTo(f.ox, f.oy); ctx.lineTo(f.x, f.y); ctx.stroke();
            }
            ctx.globalCompositeOperation = 'source-over'; ctx.shadowBlur = 0;
            ctx.strokeStyle = bfA('#e2e8f0', 0.85 * (1 - k * 0.5)); ctx.lineWidth = 1.4;
            for (let i = 0; i < 9; i++) {
                let x = f.x, y = f.y, a = i / 9 * Math.PI * 2 + bfR(f.seed, i) * 0.4; ctx.beginPath(); ctx.moveTo(x, y);
                for (let j = 0; j < 5; j++) { a += (bfR(f.seed, i * 5 + j) - 0.5) * 0.7; const l = 10 + j * 6; x += Math.cos(a) * l; y += Math.sin(a) * l; ctx.lineTo(x, y); }
                ctx.stroke();
            }
            ctx.fillStyle = bfA(cfg.c2, 1); ctx.beginPath(); ctx.arc(f.x, f.y, 5, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
        bfBurst(f, cfg, t, 16, 100);
    },
};

function bodyFinisherFxOver() {
    if (typeof bodyEffects === 'undefined') return;
    for (const e of bodyEffects) if (e instanceof BodyFinisher && e.active) e.drawOver();
}
