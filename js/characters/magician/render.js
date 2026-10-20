// ==========================================
// magician (magician) — Hình ảnh (vẽ xe & UI riêng)
// ==========================================

// ------------------------------------------
// MƯA MŨ ẢO THUẬT: mũ chóp đen viền neon + đai màu đội rơi từ trời xuống, xoay nhẹ,
// chạm đất thì phụt khói & lấp lánh. Thực thể dữ liệu thuần trong bodyEffects (đồng bộ online).
// ------------------------------------------
const MAG_NEON = '#e056fd';
function magTeamColor(p) { return p && p.id === 2 ? '#ff2d6b' : '#00e5ff'; }
function magGuestView() { return typeof onlineManager !== 'undefined' && onlineManager && onlineManager.isOnline && onlineManager.role === 'guest'; }

// Vẽ 1 chiếc mũ chóp: (x, y) = giữa vành mũ, s = cỡ
function magDrawHat(x, y, s, rot, band, alpha, sy) {
    ctx.save();
    ctx.globalAlpha *= Math.max(0, Math.min(1, alpha));
    ctx.translate(x, y); ctx.rotate(rot); ctx.scale(1, sy || 1);
    const cw = s * 0.42, ch = s * 0.95;
    // thân mũ
    const g = ctx.createLinearGradient(-cw, 0, cw, 0);
    g.addColorStop(0, '#4a3f72'); g.addColorStop(0.35, '#1e1836'); g.addColorStop(1, '#08060f');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(-cw * 1.06, 0); ctx.lineTo(-cw, -ch); ctx.lineTo(cw, -ch); ctx.lineTo(cw * 1.06, 0); ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = MAG_NEON; ctx.lineWidth = 1.2; ctx.shadowColor = MAG_NEON; ctx.shadowBlur = 8;
    ctx.stroke();
    // đai màu đội
    ctx.shadowColor = band; ctx.shadowBlur = 8;
    ctx.fillStyle = band;
    ctx.fillRect(-cw * 1.04, -s * 0.34, cw * 2.08, s * 0.17);
    // đỉnh mũ
    ctx.shadowBlur = 5; ctx.shadowColor = MAG_NEON;
    ctx.fillStyle = '#1d1832';
    ctx.beginPath(); ctx.ellipse(0, -ch, cw, s * 0.09, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // vành mũ
    ctx.fillStyle = '#0d0b17';
    ctx.beginPath(); ctx.ellipse(0, 0, s * 0.78, s * 0.17, 0, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 1.1; ctx.stroke();
    // vệt sáng bên trái thân mũ
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(-cw * 0.62, -ch * 0.88); ctx.lineTo(-cw * 0.68, -s * 0.42); ctx.stroke();
    ctx.restore();
}

class MagHatRain {
    // cx, cy: tâm điểm rơi (trên làn của chủ); n mũ trải ngang ±spread; big = Thoát Chết
    constructor(cx, cy, n, spread, band, big) {
        this.x = cx; this.y = cy; this.band = band; this.big = !!big;
        this.t = 0; this.active = true;
        this.hats = [];
        let maxEnd = 0, first = 1e9;
        for (let i = 0; i < n; i++) {
            const off = n > 1 ? (i / (n - 1) * 2 - 1) * spread : 0;
            const h = {
                x: Math.max(8, Math.min(canvas.width - 8, cx + off + (Math.random() - 0.5) * 10)),
                d: Math.floor(Math.random() * 10 + i * 3),   // trễ
                F: Math.floor(22 + Math.random() * 8),        // thời gian rơi
                H: 150 + Math.random() * 110,                 // độ cao
                r0: (Math.random() - 0.5) * 1.0,              // nghiêng ban đầu
                ph: Math.random() * 6.28,
                s: (big ? 20 : 18) + Math.random() * 3,
                ly: (Math.random() - 0.5) * 8,
            };
            maxEnd = Math.max(maxEnd, h.d + h.F);
            first = Math.min(first, h.d + h.F);
            this.hats.push(h);
        }
        this.first = first;
        this.life = maxEnd + 26;
    }
    update() { if (++this.t >= this.life) this.active = false; }
    draw() {
        const t = this.t;
        const guest = magGuestView();
        const up = guest ? 1 : -1;       // hướng "lên trời" trên màn hình người xem
        const flipRot = guest ? Math.PI : 0;
        ctx.save();
        // Thoát Chết: vòng khói lớn khi mũ đầu tiên chạm đất
        if (this.big) {
            const k = (t - this.first) / 30;
            if (k > 0 && k < 1) {
                ctx.globalAlpha = 0.55 * (1 - k);
                ctx.fillStyle = 'rgba(150, 140, 185, 1)';
                for (let j = 0; j < 7; j++) {
                    const a = j / 7 * Math.PI * 2;
                    ctx.beginPath(); ctx.arc(this.x + Math.cos(a) * 26 * k, this.y + Math.sin(a) * 12 * k, 10 + 18 * k, 0, Math.PI * 2); ctx.fill();
                }
                ctx.globalAlpha = 0.8 * (1 - k);
                ctx.strokeStyle = MAG_NEON; ctx.lineWidth = 2; ctx.shadowColor = MAG_NEON; ctx.shadowBlur = 12;
                ctx.beginPath(); ctx.ellipse(this.x, this.y, 20 + 50 * k, 8 + 20 * k, 0, 0, Math.PI * 2); ctx.stroke();
                ctx.shadowBlur = 0;
                ctx.globalAlpha = 1;
            }
        }
        this.hats.forEach((h, i) => {
            const u = (t - h.d) / h.F;
            if (u < 0) return;
            const gy = this.y + h.ly;
            if (u < 1) {
                const hgt = h.H * (1 - u * u); // rơi tự do
                const y = gy + up * hgt;
                const rot = h.r0 * (1 - u) + Math.sin(t * 0.35 + h.ph) * 0.3 * (1 - u * 0.7);
                // vệt neon phía trên
                ctx.save();
                ctx.globalAlpha = 0.35 * Math.min(1, u * 4);
                const lg = ctx.createLinearGradient(h.x, y, h.x, y + up * 30);
                lg.addColorStop(0, MAG_NEON); lg.addColorStop(1, 'rgba(224,86,253,0)');
                ctx.strokeStyle = lg; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(h.x, y + up * h.s * 0.5); ctx.lineTo(h.x, y + up * (h.s * 0.5 + 26)); ctx.stroke();
                ctx.restore();
                magDrawHat(h.x, y, h.s, rot + flipRot, this.band, Math.min(1, u * 5));
            } else {
                const k = (t - h.d - h.F) / 22;
                if (k >= 1) return;
                // mũ bẹp nhẹ rồi tan
                if (k < 0.5) magDrawHat(h.x, gy, h.s, flipRot, this.band, 1 - k * 2, 1 - k * 0.6);
                // khói
                ctx.save();
                ctx.globalAlpha = 0.5 * (1 - k);
                ctx.fillStyle = 'rgba(175, 165, 205, 1)';
                for (let j = 0; j < 5; j++) {
                    const a = (j / 5) * Math.PI * 2 + i;
                    ctx.beginPath(); ctx.arc(h.x + Math.cos(a) * 9 * k, gy + Math.sin(a) * 5 * k + up * 6 * k, 3 + 8 * k, 0, Math.PI * 2); ctx.fill();
                }
                // lấp lánh
                ctx.globalAlpha = 1 - k;
                ctx.shadowBlur = 8;
                for (let j = 0; j < 7; j++) {
                    const a = (j / 7) * Math.PI * 2 + i * 1.7;
                    const r = 4 + 22 * k;
                    const px = h.x + Math.cos(a) * r, py = gy + Math.sin(a) * r * 0.65 + up * 8 * k;
                    const c = j % 2 ? MAG_NEON : this.band;
                    ctx.fillStyle = c; ctx.shadowColor = c;
                    const z = 2.4 * (1 - k) + 0.6;
                    ctx.beginPath();
                    ctx.moveTo(px, py - z * 1.6); ctx.lineTo(px + z * 0.45, py - z * 0.45); ctx.lineTo(px + z * 1.6, py);
                    ctx.lineTo(px + z * 0.45, py + z * 0.45); ctx.lineTo(px, py + z * 1.6); ctx.lineTo(px - z * 0.45, py + z * 0.45);
                    ctx.lineTo(px - z * 1.6, py); ctx.lineTo(px - z * 0.45, py - z * 0.45); ctx.closePath(); ctx.fill();
                }
                ctx.restore();
            }
        });
        ctx.restore();
    }
}

function magHatRain(p, cx, n, spread, big) {
    if (typeof bodyEffects === 'undefined') return;
    bodyEffects.push(new MagHatRain(cx, p.y + p.h / 2, n + (big ? 3 : 0), big ? spread * 1.6 : spread, magTeamColor(p), big));
}

// HUD: số lần Thoát Chết còn lại = mũ nhỏ cạnh thanh HP
function magDrawEscapeHats(p) {
    if (p.hp <= 0 || !(p.magEscapeMax > 0)) return;
    const flip = typeof hudTextFlip === 'function' ? hudTextFlip(p) : false;
    const cy = p.id === 1 ? p.y + p.h + 9 : p.y - 1;
    const cx = p.x + p.w / 2;
    const BW = Math.max(40, Math.min(54, p.w + 14));
    let side = -1; // bên trái thanh HP
    if (cx - BW / 2 - 8 - p.magEscapeMax * 10 < 2) side = 1;
    for (let i = 0; i < p.magEscapeMax; i++) {
        const x = cx + side * (BW / 2 + 8 + i * 10);
        const on = i < (p.magEscapeLeft || 0);
        ctx.save();
        if (!on) ctx.globalAlpha = 0.28;
        magDrawHat(x, cy, 8, flip ? Math.PI : 0, on ? magTeamColor(p) : '#555', 1);
        ctx.restore();
    }
}

// Vòng HUD cạnh xe / nút Bắn: tiến độ giữ nút & hồi chiêu Phân Ảnh Khiên
function magRegisterHUD() {
    if (typeof registerEmpowerHUD !== 'function') return;
    registerEmpowerHUD('magician', p => {
        if (p.invisTimer > 0) return null; // không lộ vị trí khi tàng hình
        const cd = p.magCloneCd || 0;
        const held = p.magicianCharge || 0;
        if (held > 0) {
            const canSwap = p.hasUpgrade('evo_mag_1') && p.illusions && p.illusions.length > 0;
            if (held >= 60 && canSwap) return { pct: 1, segments: 2, lit: 2, ready: true, color: '#e056fd', label: 'HOÁN ĐỔI', btnIcon: '🔄' };
            if (held >= 30) return cd > 0
                ? { pct: 1 - cd / MAG_CLONE_CD, ready: false, color: '#8b7aa8', label: `PHÂN ẢNH ⌛${Math.ceil(cd / 60)}s`, dim: true }
                : { pct: canSwap ? 0.5 : 1, segments: canSwap ? 2 : 1, lit: 1, ready: !canSwap, color: '#e056fd', label: 'PHÂN ẢNH', btnIcon: '🎩' };
            return { pct: Math.min(1, held / 30) * (canSwap ? 0.5 : 1), color: '#e056fd', label: cd > 0 ? `PHÂN ẢNH ⌛${Math.ceil(cd / 60)}s` : 'PHÂN ẢNH' };
        }
        // idle: hồi chiêu chỉ hiện ở nút Bắn, không vẽ vòng cạnh xe (không lộ đâu là bản thể)
        if (cd > 0) return { pct: 1 - cd / MAG_CLONE_CD, ready: false, color: '#b98cff', label: `PHÂN ẢNH ${Math.ceil(cd / 60)}s`, idle: true };
        return { pct: 1, ready: false, color: '#e056fd', label: 'PHÂN ẢNH ✓', idle: true, btnIcon: '🎩' };
    });
}
if (typeof window !== 'undefined') window.addEventListener('load', magRegisterHUD);

// ------------------------------------------
// PHÂN ẢNH KHÓ PHÂN BIỆT: vẽ bằng đúng art xe + đúng HUD chung (drawTankHUD) như bản thể.
// Phân ảnh thường hiện máu = máu bản thể; Ảo Ảnh Hoàn Hảo hiện máu riêng quy đổi theo thang máu bản thể.
// Lớp vẽ là thực thể bodyEffects (dữ liệu thuần: owner) -> vẫn vẽ khi bản thể tàng hình & đồng bộ online.
// ------------------------------------------
function magOnline() { return typeof onlineManager !== 'undefined' && onlineManager && onlineManager.isOnline; }
// Người đang xem có phải chủ xe không (chủ xe luôn thấy chỉ số thật của mình)
function magViewerOwns(p) {
    if (magOnline()) return onlineManager.role === 'host' ? p.id === 1 : p.id === 2;
    const bot = typeof botAI !== 'undefined' && botAI.enabled;
    return bot && p.id === 1;
}
function magFakeOn(p) { return p && p.weapon === 'magician' && (p.magFakeShield >= 0 || p.magFakeAmmo >= 0); }
function magShownShield(p) { return p.magFakeShield >= 0 ? p.magFakeShield : (p.shield || 0); }
function magHudView(p, over) { const v = Object.create(p); Object.assign(v, over); return v; }
function magShieldRing(x, y, w, h) {
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#3498db'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, w / 1.2, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
}

class MagIllusionLayer {
    constructor(owner) { this.owner = owner; this.active = true; }
    update() { if (!this.owner || this.owner.weapon !== 'magician') this.active = false; }
    draw() {
        const p = this.owner;
        if (!p || p.weapon !== 'magician' || p.hp <= 0) return;
        const online = magOnline();
        const mineOnline = online && magViewerOwns(p);
        const owns = magViewerOwns(p);
        // Khiên giả trên thân bản thể (địch thấy vòng khiên dù không có khiên)
        if (magFakeOn(p) && !owns && !(p.shield > 0) && !(p.invisTimer > 0) && magShownShield(p) > 0) magShieldRing(p.x, p.y, p.w, p.h);
        if (!p.illusions) return;
        for (const ill of p.illusions) {
            const hidden = ill.invisTimer > 0;
            if (hidden && online && !mineOnline) continue; // giống bản thể tàng hình: ẩn hẳn với đối thủ online
            ctx.save();
            ctx.globalAlpha = hidden ? 0.28 : 1;
            if (!(typeof coreSmallArtAt === 'function' && coreSmallArtAt(p, ill.x, ill.y, ctx.globalAlpha))) {
                ctx.fillStyle = p.color;
                ctx.fillRect(ill.x, ill.y, ill.w, ill.h);
            }
            const sh = magShownShield(p);
            if (sh > 0) magShieldRing(ill.x, ill.y, ill.w, ill.h);
            ctx.restore();
            if (hidden) continue;
            // HUD giống hệt bản thể
            if (typeof drawTankHUD === 'function') {
                const hp = ill.perfect ? Math.max(0, ill.hp) / Math.max(0.01, ill.maxHp) * p.maxHp : p.hp;
                const v = magHudView(p, {
                    x: ill.x, y: ill.y, hp, shield: sh,
                    ammo: Math.max(0, Math.min(p.maxAmmo, ill.ammo)), lastShot: ill.lastShot || p.lastShot,
                    ghostHp: ill.ghostHp === undefined ? hp : ill.ghostHp, __magView: true
                });
                try { drawTankHUD(v); magDrawEscapeHats(v); } catch (e) { }
                ill.ghostHp = v.ghostHp;
            }
        }
    }
}

// HUD bản thể: địch thấy khiên giả & số đạn giả khi có >= 2 phân ảnh
function magWrapHUD() {
    if (typeof drawTankHUD !== 'function' || drawTankHUD.__mag) return;
    const orig = drawTankHUD;
    const wrapped = function (p) {
        if (p && !p.__magView && magFakeOn(p) && !magViewerOwns(p)) {
            const v = magHudView(p, { __magView: true, ghostHp: p.ghostHp });
            if (p.magFakeShield >= 0) v.shield = p.magFakeShield;
            if (p.magFakeAmmo >= 0) v.ammo = Math.min(p.maxAmmo, p.magFakeAmmo);
            const r = orig(v);
            p.ghostHp = v.ghostHp;
            return r;
        }
        return orig(p);
    };
    wrapped.__mag = true;
    drawTankHUD = wrapped;
}
if (typeof window !== 'undefined') window.addEventListener('load', magWrapHUD);

Object.assign(Player.prototype, {
    // [draw] magician — phân ảnh do MagIllusionLayer vẽ; ở đây chỉ còn đạn ảo
    drawMagician() {
        if (this.weapon === 'magician') {
            // Bản thể thật tàng hình
            if (this.invisTimer > 0) ctx.globalAlpha = 0.2;

            // Vẽ Đạn Giả & Đạn Hù Dọa (lá bài ảo, mờ hơn)
            if (this.fakeBullets && this.fakeBullets.length > 0) {
                for (let fb of this.fakeBullets) {
                    if (typeof drawBulletArt === 'function') {
                        ctx.save(); ctx.globalAlpha *= 0.7;
                        drawBulletArt(fb, (this.id === 1) ? '#3498db' : '#e74c3c', this);
                        ctx.restore();
                    } else {
                        ctx.fillStyle = "rgba(0, 255, 255, 0.7)";
                        ctx.fillRect(fb.x, fb.y, fb.w, fb.h);
                    }
                }
            }
        }
    }
});
