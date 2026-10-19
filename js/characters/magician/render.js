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
        if (cd > 0) return { pct: 1 - cd / MAG_CLONE_CD, ready: false, color: '#b98cff', label: `PHÂN ẢNH ${Math.ceil(cd / 60)}s` };
        return { pct: 1, ready: false, color: '#e056fd', label: 'PHÂN ẢNH ✓', idle: true, btnIcon: '🎩' };
    });
}
if (typeof window !== 'undefined') window.addEventListener('load', magRegisterHUD);

Object.assign(Player.prototype, {
    // [draw] magician
    drawMagician() {
        if (this.weapon === 'magician') {
            // Bản thể thật tàng hình
            if (this.invisTimer > 0) ctx.globalAlpha = 0.2;

            // Vẽ các phân ảnh
            for (let ill of this.illusions) {
                ctx.save();
                // Nếu bản thể thật đang tàng hình, bóng cũng tàng hình theo. Nếu không, đậm 100%
                // (Phân ảnh mồi của Thoát Chết luôn rõ nét để đánh lừa địch)
                if (ill.invisTimer > 0 || (this.invisTimer > 0 && !ill.decoy)) {
                    ctx.globalAlpha = 0.2;
                } else {
                    ctx.globalAlpha = 1.0; // KHÔNG BAO GIỜ BỊ MỜ SAU 5 GIÂY, LUÔN ĐẬM 100%
                }

                // Phân ảnh: giống hệt xe thật (art mới), fallback khối cũ
                if (!((typeof coreSmallArtAt === 'function') && coreSmallArtAt(this, ill.x, ill.y, 1))) {
                    ctx.fillStyle = this.color;
                    ctx.fillRect(ill.x, ill.y, ill.w, ill.h);
                    ctx.fillStyle = "#fff";
                    let cbx = ill.x + ill.w / 2 - 4;
                    let cby = (this.id === 1) ? ill.y - 20 : ill.y + ill.h;
                    ctx.fillRect(cbx, cby, 8, 20);
                }

                // ==========================================
                // --- VẼ THANH MÁU & ĐẠN CHO PHÂN ẢNH ---
                // ==========================================
                let isP1 = (this.id === 1);
                let hpY, ammoY;

                // 1. CĂN CHỈNH CHIỀU DỌC (TỌA ĐỘ Y)
                if (isP1) {
                    // PLAYER 1 (Bên Xanh - Nằm dưới màn hình)
                    // -> Thanh chỉ số nằm DƯỚI chân xe tăng
                    hpY = ill.y + ill.h + 6;
                    ammoY = ill.y + ill.h + 12;
                } else {
                    // PLAYER 2 (Bên Đỏ - Nằm trên màn hình)
                    // -> Thanh chỉ số nằm TRÊN đầu xe tăng (Ngược lại)
                    hpY = ill.y - 13;
                    ammoY = ill.y - 6;
                }

                let hpRatio = Math.max(0, ill.hp / ill.maxHp);
                let hpWidth = ill.w * hpRatio;

                // 2. VẼ THANH MÁU
                ctx.fillStyle = "red"; // Nền đỏ (Máu đã mất)
                ctx.fillRect(ill.x, hpY, ill.w, 4);

                ctx.fillStyle = "#0f0"; // Máu xanh
                if (isP1) {
                    // P1: Máu tụt từ phải qua trái (Căn lề trái)
                    ctx.fillRect(ill.x, hpY, hpWidth, 4);
                } else {
                    // P2: Máu tụt từ trái qua phải (Căn lề phải, đối xứng với P1)
                    ctx.fillRect(ill.x + ill.w - hpWidth, hpY, hpWidth, 4);
                }

                // 3. VẼ THANH ĐẠN
                let ammoW = ill.w / ill.maxAmmo;
                ctx.fillStyle = "yellow";
                for (let j = 0; j < ill.ammo; j++) {
                    let ammoX;
                    if (isP1) {
                        // P1: Đạn xếp từ trái sang phải
                        ammoX = ill.x + j * ammoW + 1;
                    } else {
                        // P2: Đạn xếp từ phải sang trái (Ngược lại)
                        ammoX = ill.x + ill.w - (j + 1) * ammoW + 1;
                    }
                    ctx.fillRect(ammoX, ammoY, ammoW - 1, 3);
                }
                ctx.restore(); // [FIX] thiếu restore -> độ mờ 0.2 lan ra toàn bản đồ & rò save() mỗi khung hình
            }

            // Vẽ Đạn Giả & Đạn Hù Dọa
            if (this.fakeBullets && this.fakeBullets.length > 0) {
                // Đạn ảo: cùng hình sao chổi tím như đạn thật nhưng mờ hơn
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
