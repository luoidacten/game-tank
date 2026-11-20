// ==========================================
// MẢNH KÝ ỨC 1 — THE TRAIN: đồ hoạ (đường ray, toa, khói, tia lửa, HUD trùm, banner, minh hoạ thẻ)
// Chỉ đọc trạng thái (an toàn online). Vẽ toa ở lớp dưới (ngay sau nền sân: trainDrawUnder),
// khói / tia lửa / thanh máu toa ở lớp bodyEffects (trainArtOver), HUD trùm sau renderFrame (trainDrawHUD).
// ==========================================

function trainFindBoss() {
    if (typeof TrainMode !== 'undefined' && TrainMode.boss) return TrainMode.boss;
    if (typeof bodyEffects === 'undefined') return null;
    for (const e of bodyEffects) if (e && e.isTrainBoss && e.active) return e;
    return null;
}
function trainGlow() { return (typeof Quality === 'undefined') ? 1 : Quality.cfg.glow; }
function trainHex(h, a) {
    const n = parseInt(h.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
function trainShade(h, k) { // k<0 tối, k>0 sáng
    const n = parseInt(h.slice(1), 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    if (k < 0) { r *= 1 + k; g *= 1 + k; b *= 1 + k; } else { r += (255 - r) * k; g += (255 - g) * k; b += (255 - b) * k; }
    return `rgb(${r | 0},${g | 0},${b | 0})`;
}
const TRAIN_PAINT = { loco: '#5a2128', smg: '#3d4352', mortar: '#5e4a33', laser: '#1f2c48', summon: '#3a4a2d' };
function trainMix(a, b, k) {
    const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16);
    const f = (s) => Math.round(((A >> s) & 255) * (1 - k) + ((B >> s) & 255) * k);
    return '#' + ((1 << 24) + (f(16) << 16) + (f(8) << 8) + f(0)).toString(16).slice(1);
}
function trainRR(g, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    g.beginPath();
    g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r);
    g.lineTo(x + w, y + h - r); g.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r);
    g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y); g.closePath();
}

// ---------- Nền đường ray (cache theo kích thước) ----------
let trainTrackCache = null;
function trainTrackCanvas(W, G) {
    const key = W + 'x' + G.carH;
    if (trainTrackCache && trainTrackCache.key === key) return trainTrackCache.c;
    const h = G.bandY1 - G.bandY0 + 24;
    const c = document.createElement('canvas');
    c.width = Math.ceil(W); c.height = Math.ceil(h);
    const g = c.getContext('2d');
    const top = 12, bh = G.bandY1 - G.bandY0;
    // Đá ballast
    const gr = g.createLinearGradient(0, top, 0, top + bh);
    gr.addColorStop(0, '#1b1d26'); gr.addColorStop(0.5, '#2a2c36'); gr.addColorStop(1, '#1b1d26');
    g.fillStyle = gr; g.fillRect(0, top, W, bh);
    let s = 7;
    const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    for (let i = 0; i < W * bh / 26; i++) {
        const v = 40 + rnd() * 50 | 0;
        g.fillStyle = `rgba(${v},${v},${v + 8},${0.35 + rnd() * 0.4})`;
        g.fillRect(rnd() * W, top + rnd() * bh, 1.5 + rnd() * 2, 1.2 + rnd() * 1.6);
    }
    // Tà vẹt
    for (let x = 4; x < W; x += 22) {
        const tg = g.createLinearGradient(x, 0, x + 9, 0);
        tg.addColorStop(0, '#3a2f2a'); tg.addColorStop(0.5, '#54443a'); tg.addColorStop(1, '#2c231f');
        g.fillStyle = tg; g.fillRect(x, top + 2, 9, bh - 4);
        g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(x + 7, top + 2, 2, bh - 4);
    }
    // 2 thanh ray thép
    const rails = [top + 5, top + bh - 8];
    rails.forEach(ry => {
        const rg = g.createLinearGradient(0, ry, 0, ry + 4);
        rg.addColorStop(0, '#e5e9f0'); rg.addColorStop(0.5, '#8b95a7'); rg.addColorStop(1, '#3b4252');
        g.fillStyle = rg; g.fillRect(0, ry, W, 4);
        g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(0, ry, W, 1);
    });
    // Mép neon cảnh báo
    [top - 1, top + bh - 1].forEach((yy, i) => {
        for (let x = 0; x < W; x += 16) {
            g.fillStyle = (Math.floor(x / 16) % 2) ? '#ffc531' : '#14151b';
            g.beginPath(); g.moveTo(x, yy); g.lineTo(x + 8, yy); g.lineTo(x + 12, yy + 2); g.lineTo(x + 4, yy + 2); g.fill();
        }
    });
    trainTrackCache = { key, c, top };
    return c;
}

// ---------- Vẽ 1 toa (dùng chung cho sân và hình minh hoạ thẻ) ----------
// o: { t, wheel, flash, door, aimU, aimD, act, actT, dead, deathT, hpK, shield, theme }
function trainDrawCar(g, type, x, y, w, h, o) {
    o = o || {};
    const T = TRAIN_CAR_TYPES[type] || TRAIN_CAR_TYPES.smg;
    const col = T.color, t = o.t || 0, glow = trainGlow();
    const theme = TRAIN_THEMES[o.theme || 'base'] || TRAIN_THEMES.base;
    const paint = TRAIN_PAINT[type] || theme.steel;
    const steel = (o.theme && o.theme !== 'base') ? trainMix(theme.steel, paint, 0.45) : paint;
    g.save();
    // Bóng đổ
    g.fillStyle = 'rgba(0,0,0,0.45)';
    trainRR(g, x + 5, y + 6, w - 6, h, 8); g.fill();
    // Ánh neon hắt xuống nền ray
    if (!o.dead && glow > 0) {
        g.save(); g.globalCompositeOperation = 'lighter';
        const ug = g.createRadialGradient(x + w / 2, y + h / 2, 4, x + w / 2, y + h / 2, w * 0.62);
        ug.addColorStop(0, trainHex(col, 0.16)); ug.addColorStop(1, trainHex(col, 0));
        g.fillStyle = ug; g.fillRect(x - 10, y - 16, w + 20, h + 32);
        g.restore();
    }
    // Ống nối (hành lang xếp nếp) sang toa sau
    if (!o.tail) {
        g.fillStyle = '#121419'; g.fillRect(x + w - 5, y + h * 0.2, 10, h * 0.6);
        g.fillStyle = '#2b2f3a';
        for (let k = 0; k < 4; k++) g.fillRect(x + w - 4 + k * 2.4, y + h * 0.22, 1.2, h * 0.56);
    }
    // Bánh xe (2 cụm mỗi bên, quay theo quãng đường)
    const wheel = o.wheel || 0;
    for (const fx of [0.2, 0.8]) {
        for (const side of [-1, 1]) {
            for (const dx of [-9, 9]) {
                const wx = x + w * fx + dx, wy = side < 0 ? y - 5 : y + h - 2;
                g.fillStyle = '#0d0f14'; trainRR(g, wx - 7, wy, 14, 7, 2.5); g.fill();
                g.fillStyle = '#5b6474'; trainRR(g, wx - 6, wy + 1, 12, 5, 2); g.fill();
                // nan bánh: vạch chạy theo góc quay
                const ph = ((wheel + dx * 0.1) % 1 + 1) % 1;
                g.fillStyle = '#c8d0dc';
                g.fillRect(wx - 6 + ph * 11, wy + 1, 1.6, 5);
                g.fillRect(wx - 6 + ((ph + 0.5) % 1) * 11, wy + 1, 1.6, 5);
                g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(wx - 6, wy + 1, 12, 1);
            }
            // thanh giằng bánh
            g.fillStyle = '#272c36';
            g.fillRect(x + w * fx - 13, side < 0 ? y - 2 : y + h - 1, 26, 3);
        }
    }
    if (o.dead) { trainDrawWreck(g, type, x, y, w, h, o); g.restore(); return; }

    const loco = type === 'loco';
    // Thân toa
    const bx = x + 3, bw = w - 6;
    g.beginPath();
    if (loco) {
        const nose = Math.min(26, w * 0.2);
        g.moveTo(bx + nose, y); g.lineTo(bx + bw - 6, y); g.quadraticCurveTo(bx + bw, y, bx + bw, y + 6);
        g.lineTo(bx + bw, y + h - 6); g.quadraticCurveTo(bx + bw, y + h, bx + bw - 6, y + h);
        g.lineTo(bx + nose, y + h); g.lineTo(bx, y + h * 0.62); g.lineTo(bx, y + h * 0.38); g.closePath();
    } else trainRR(g, bx, y, bw, h, 7);
    const bg = g.createLinearGradient(0, y, 0, y + h);
    bg.addColorStop(0, trainShade(steel, 0.38)); bg.addColorStop(0.18, trainShade(steel, 0.1));
    bg.addColorStop(0.55, steel); bg.addColorStop(1, trainShade(steel, -0.45));
    g.fillStyle = bg; g.fill();
    g.lineWidth = 1.6; g.strokeStyle = trainShade(steel, -0.6); g.stroke();
    // Viền neon màu loại toa
    g.save();
    g.shadowColor = col; g.shadowBlur = 10 * glow;
    g.strokeStyle = trainHex(col, 0.9); g.lineWidth = 1.8;
    g.beginPath(); g.moveTo(bx + (loco ? 26 : 8), y + 2.5); g.lineTo(bx + bw - 8, y + 2.5);
    g.moveTo(bx + (loco ? 26 : 8), y + h - 2.5); g.lineTo(bx + bw - 8, y + h - 2.5); g.stroke();
    g.restore();
    // Mép hông dưới (khối 3D) + gờ sáng mép trên
    g.save();
    if (loco) { g.beginPath(); g.rect(bx + 22, y, bw - 22, h); g.clip(); }
    g.fillStyle = trainShade(steel, -0.62); trainRR(g, bx + 1, y + h - 7, bw - 2, 7, 3); g.fill();
    g.fillStyle = 'rgba(0,0,0,0.45)';
    for (let vx = bx + 16; vx < bx + bw - 14; vx += 9) g.fillRect(vx, y + h - 5, 5, 2);
    g.fillStyle = 'rgba(255,255,255,0.28)'; g.fillRect(bx + 8, y + 1, bw - 16, 1.4);
    g.restore();
    if (!loco) {
        const rg = g.createLinearGradient(0, y + 5, 0, y + h - 9);
        rg.addColorStop(0, 'rgba(255,255,255,0.10)'); rg.addColorStop(1, 'rgba(0,0,0,0.12)');
        g.fillStyle = rg; trainRR(g, bx + 6, y + 5, bw - 12, h - 13, 5); g.fill();
        g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 1; g.stroke();
    }
    // Đầu / đuôi toa (tấm thép + móc nối)
    if (!loco) {
        g.fillStyle = trainShade(steel, -0.35);
        g.fillRect(bx + 2, y + 5, 6, h - 10); g.fillRect(bx + bw - 8, y + 5, 6, h - 10);
    }
    g.fillStyle = '#1a1d24';
    g.fillRect(x - 3, y + h / 2 - 3, 7, 6); g.fillRect(x + w - 4, y + h / 2 - 3, 7, 6);
    // Đinh tán
    g.fillStyle = 'rgba(255,255,255,0.35)';
    for (let i = 0; i < 7; i++) {
        const rx = bx + (loco ? 30 : 12) + (bw - (loco ? 42 : 24)) * i / 6;
        g.beginPath(); g.arc(rx, y + 6.5, 1, 0, 7); g.arc(rx, y + h - 6.5, 1, 0, 7); g.fill();
    }

    const cx = x + w / 2, cy = y + h / 2;
    if (type === 'loco') trainRoofLoco(g, x, y, w, h, o, col, t, glow);
    else if (type === 'smg') trainRoofSmg(g, x, y, w, h, o, col, t, glow);
    else if (type === 'mortar') trainRoofMortar(g, x, y, w, h, o, col, t, glow);
    else if (type === 'laser') trainRoofLaser(g, x, y, w, h, o, col, t, glow);
    else if (type === 'summon') trainRoofSummon(g, x, y, w, h, o, col, t, glow);

    // Đèn góc nhấp nháy
    const blink = (Math.floor(t / 18 + x * 0.01) % 2) === 0;
    [[bx + 11, y + 4], [bx + bw - 11, y + h - 4]].forEach(([lx, ly], i) => {
        g.save();
        g.fillStyle = (blink ^ i) ? '#ff3b3b' : '#ffb020';
        g.shadowColor = g.fillStyle; g.shadowBlur = 8 * glow;
        g.beginPath(); g.arc(lx, ly, 1.8, 0, 7); g.fill(); g.restore();
    });
    // Hư hại: vết nứt + lửa nhỏ khi máu thấp
    if (o.hpK !== undefined && o.hpK < 0.45) {
        g.strokeStyle = 'rgba(10,10,10,0.7)'; g.lineWidth = 1.4;
        g.beginPath();
        g.moveTo(cx - w * 0.25, y + 8); g.lineTo(cx - w * 0.18, cy); g.lineTo(cx - w * 0.22, y + h - 9);
        g.moveTo(cx + w * 0.2, y + 10); g.lineTo(cx + w * 0.27, cy - 3); g.stroke();
        trainFlame(g, cx + w * 0.22, cy - 4, 6 + 3 * Math.sin(t * 0.4), t);
    }
    // Chớp trắng khi trúng đạn
    if (o.flash > 0) {
        g.globalAlpha = Math.min(0.55, o.flash * 0.1);
        g.fillStyle = '#ffffff'; trainRR(g, bx, y, bw, h, 7); g.fill();
        g.globalAlpha = 1;
    }
    if (o.stun > 0) {
        g.strokeStyle = 'rgba(125,249,255,0.8)'; g.lineWidth = 1.5; g.setLineDash([4, 4]); g.lineDashOffset = -t;
        trainRR(g, bx - 2, y - 2, bw + 4, h + 4, 8); g.stroke(); g.setLineDash([]);
    }
    if (loco && o.shield) trainDrawShield(g, x, y, w, h, t, glow);
    g.restore();
}

function trainFlame(g, x, y, s, t) {
    g.save();
    g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) {
        const k = 1 - i * 0.28, fl = Math.sin(t * 0.5 + i * 2) * 0.25;
        g.fillStyle = i === 0 ? 'rgba(255,90,20,0.75)' : (i === 1 ? 'rgba(255,170,40,0.75)' : 'rgba(255,240,180,0.8)');
        g.beginPath();
        g.moveTo(x - s * 0.6 * k, y + s * 0.4);
        g.quadraticCurveTo(x - s * 0.5 * k, y - s * (0.6 + fl) * k, x + fl * s, y - s * (1.3 + fl) * k);
        g.quadraticCurveTo(x + s * 0.5 * k, y - s * 0.5 * k, x + s * 0.6 * k, y + s * 0.4);
        g.closePath(); g.fill();
    }
    g.restore();
}

function trainRoofLoco(g, x, y, w, h, o, col, t, glow) {
    const cy = y + h / 2;
    // Đèn pha + vệt sáng phía trước (bên trái)
    g.save();
    g.globalCompositeOperation = 'lighter';
    const cone = g.createLinearGradient(x + 4, 0, x - 90, 0);
    cone.addColorStop(0, 'rgba(255,245,200,0.35)'); cone.addColorStop(1, 'rgba(255,245,200,0)');
    g.fillStyle = cone;
    g.beginPath(); g.moveTo(x + 6, cy - 5); g.lineTo(x - 90, cy - 26); g.lineTo(x - 90, cy + 26); g.lineTo(x + 6, cy + 5); g.fill();
    g.restore();
    g.save(); g.fillStyle = '#fffbe6'; g.shadowColor = '#fff3b0'; g.shadowBlur = 14 * glow;
    g.beginPath(); g.arc(x + 7, cy, 3.6, 0, 7); g.fill(); g.restore();
    // Lưới gạt (cowcatcher) vàng đen
    g.save();
    g.beginPath(); g.moveTo(x + 3 + Math.min(26, w * 0.2), y + 4); g.lineTo(x + 5, y + h * 0.4); g.lineTo(x + 5, y + h * 0.6); g.lineTo(x + 3 + Math.min(26, w * 0.2), y + h - 4); g.closePath();
    g.clip();
    for (let i = -4; i < 8; i++) { g.fillStyle = i % 2 ? '#ffc531' : '#15161c'; g.fillRect(x + i * 6, y, 3.5, h); }
    g.restore();
    // Nồi hơi hình trụ
    const b0 = x + w * 0.2, b1 = x + w * 0.64, bh = h * 0.56;
    const bg = g.createLinearGradient(0, cy - bh / 2, 0, cy + bh / 2);
    bg.addColorStop(0, '#5b1d1d'); bg.addColorStop(0.3, '#c0392b'); bg.addColorStop(0.55, '#8e1f17'); bg.addColorStop(1, '#3b0d0b');
    g.fillStyle = bg; trainRR(g, b0, cy - bh / 2, b1 - b0, bh, bh / 2); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.22)'; trainRR(g, b0 + 4, cy - bh / 2 + 2, b1 - b0 - 8, 3, 1.5); g.fill();
    // Đai vàng quanh nồi hơi
    g.fillStyle = '#e8b04a';
    for (let i = 1; i < 4; i++) g.fillRect(b0 + (b1 - b0) * i / 4 - 1.5, cy - bh / 2, 3, bh);
    // Ống khói + vòm hơi
    const sx = x + w * 0.31;
    g.fillStyle = '#111317'; g.beginPath(); g.arc(sx, cy, h * 0.17, 0, 7); g.fill();
    g.strokeStyle = '#b8c0cc'; g.lineWidth = 2; g.stroke();
    const ember = 0.6 + 0.4 * Math.sin(t * 0.3);
    g.save(); g.fillStyle = `rgba(255,${120 + 60 * ember | 0},40,${0.7 * ember})`; g.shadowColor = '#ff8c1a'; g.shadowBlur = 10 * glow;
    g.beginPath(); g.arc(sx, cy, h * 0.09, 0, 7); g.fill(); g.restore();
    g.fillStyle = '#d4a03c'; g.beginPath(); g.arc(x + w * 0.5, cy, h * 0.11, 0, 7); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.4)'; g.beginPath(); g.arc(x + w * 0.5 - 2, cy - 2, h * 0.04, 0, 7); g.fill();
    // Buồng lái + cửa kính
    const c0 = x + w * 0.67, c1 = x + w - 7;
    g.fillStyle = '#2a1414'; trainRR(g, c0, y + 6, c1 - c0, h - 12, 4); g.fill();
    g.fillStyle = '#7a1f1a'; trainRR(g, c0 + 2, y + 8, c1 - c0 - 4, h - 16, 3); g.fill();
    g.save(); g.fillStyle = '#7df9ff'; g.shadowColor = '#28e0ff'; g.shadowBlur = 8 * glow;
    g.fillRect(c0 + 4, y + 9, 6, 4); g.fillRect(c0 + 4, y + h - 13, 6, 4); g.fillRect(c1 - 9, y + 9, 5, 4); g.fillRect(c1 - 9, y + h - 13, 5, 4);
    g.restore();
    // Biểu tượng
    g.fillStyle = '#ffd166'; g.font = `bold ${Math.round(h * 0.2)}px Orbitron, Arial`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('T-01', (c0 + c1) / 2, cy + 0.5);
    // Còi tàu: hơi trắng rung
    if (o.act === 'loco') {
        g.save(); g.globalAlpha = Math.min(1, o.actT / 10) * 0.8;
        g.fillStyle = '#f8fafc';
        for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(x + w * 0.5 + Math.sin(t + i) * 6, cy - 6 + i * 3, 5 + i * 1.5 + (o.actT % 6), 0, 7); g.fill(); }
        g.restore();
    }
}

function trainRoofSmg(g, x, y, w, h, o, col, t, glow) {
    const cy = y + h / 2;
    // Sàn kim loại kẻ ô
    g.fillStyle = '#20242d'; trainRR(g, x + 12, y + 7, w - 24, h - 14, 4); g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.06)'; g.lineWidth = 1;
    for (let i = x + 16; i < x + w - 14; i += 7) { g.beginPath(); g.moveTo(i, y + 8); g.lineTo(i + 4, y + h - 8); g.stroke(); }
    // Vạch cảnh báo 2 đầu
    [x + 12, x + w - 22].forEach(sx => {
        g.save(); trainRR(g, sx, y + 7, 10, h - 14, 2); g.clip();
        for (let k = -4; k < 12; k++) { g.fillStyle = k % 2 ? '#ffc531' : '#121318'; g.fillRect(sx + k * 5 - 10, y, 3, h); }
        g.restore();
    });
    // Hòm đạn
    g.fillStyle = '#4d5b2d'; trainRR(g, x + w * 0.44, cy - 7, 14, 14, 2); g.fill();
    g.fillStyle = '#a3b36b'; g.fillRect(x + w * 0.44 + 2, cy - 1, 10, 2);
    // Dây đạn
    g.strokeStyle = '#d4a03c'; g.lineWidth = 2; g.setLineDash([2, 2]);
    g.beginPath(); g.moveTo(x + w * 0.44, cy); g.lineTo(x + w * 0.5 - 16, cy - h * 0.22); g.moveTo(x + w * 0.44 + 14, cy); g.lineTo(x + w * 0.5 + 16, cy + h * 0.22); g.stroke();
    g.setLineDash([]);
    // 2 tháp súng: trên (bắn lên) & dưới (bắn xuống)
    const firing = o.act === 'smg';
    [[-1, x + w * 0.5 + 16, y + h * 0.28, o.aimU || 0], [1, x + w * 0.5 - 16, y + h * 0.72, o.aimD || 0]].forEach(([side, tx, ty, aim]) => {
        const base = side > 0 ? Math.PI / 2 : -Math.PI / 2;
        const ang = base - aim * side;
        g.save(); g.translate(tx, ty); g.rotate(ang);
        // nòng đôi
        g.fillStyle = '#1b1e25'; trainRR(g, 0, -6.5, h * 0.24, 13, 3); g.fill();
        g.fillStyle = '#3a404c';
        g.fillRect(2, -5, h * 0.5, 3.6); g.fillRect(2, 1.4, h * 0.5, 3.6);
        g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(2, -5, h * 0.5, 1); g.fillRect(2, 1.4, h * 0.5, 1);
        g.fillStyle = '#9aa4b2'; g.fillRect(h * 0.44, -5.5, 4, 4.6); g.fillRect(h * 0.44, 0.9, 4, 4.6);
        if (firing && o.actT % 7 < 3) {
            g.save(); g.globalCompositeOperation = 'lighter';
            g.fillStyle = 'rgba(255,220,90,0.9)';
            g.beginPath(); g.moveTo(h * 0.5, -7); g.lineTo(h * 0.5 + 13, 0); g.lineTo(h * 0.5, 7); g.fill();
            g.restore();
        }
        g.restore();
        // đế tháp
        g.save();
        const rg = g.createRadialGradient(tx - 2, ty - 2, 1, tx, ty, h * 0.17);
        rg.addColorStop(0, '#6b7280'); rg.addColorStop(1, '#1f232b');
        g.fillStyle = rg; g.beginPath(); g.arc(tx, ty, h * 0.16, 0, 7); g.fill();
        g.strokeStyle = col; g.lineWidth = 1.6; g.shadowColor = col; g.shadowBlur = 6 * glow; g.stroke();
        g.restore();
    });
}

function trainRoofMortar(g, x, y, w, h, o, col, t, glow) {
    const cx = x + w / 2, cy = y + h / 2;
    // Bao cát
    g.fillStyle = '#8a7a5a';
    for (let i = 0; i < 6; i++) {
        const a = i / 6 * Math.PI * 2 + 0.3;
        g.beginPath(); g.ellipse(cx + Math.cos(a) * h * 0.38, cy + Math.sin(a) * h * 0.3, 7, 4.5, a, 0, 7); g.fill();
    }
    g.fillStyle = 'rgba(0,0,0,0.25)';
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + 0.3; g.fillRect(cx + Math.cos(a) * h * 0.38 - 1, cy + Math.sin(a) * h * 0.3 - 3, 1.5, 6); }
    // Giá đạn pháo
    for (let i = 0; i < 4; i++) {
        const sx = x + 16 + i * 7;
        g.fillStyle = '#c2551c'; trainRR(g, sx, y + 9, 5, 12, 2.5); g.fill();
        g.fillStyle = '#ffd166'; g.fillRect(sx, y + 9, 5, 3);
        const sx2 = x + w - 22 - i * 7;
        g.fillStyle = '#c2551c'; trainRR(g, sx2, y + h - 21, 5, 12, 2.5); g.fill();
        g.fillStyle = '#ffd166'; g.fillRect(sx2, y + h - 12, 5, 3);
    }
    // Ống cối lớn
    const rec = o.act === 'mortar' ? Math.max(0, 1 - o.actT / 18) : 0;
    const R = h * 0.3 * (1 - rec * 0.12);
    const rg = g.createRadialGradient(cx - R * 0.3, cy - R * 0.3, 1, cx, cy, R);
    rg.addColorStop(0, '#7b8494'); rg.addColorStop(0.7, '#3b4250'); rg.addColorStop(1, '#1d2129');
    g.fillStyle = rg; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill();
    g.save(); g.strokeStyle = col; g.lineWidth = 2.2; g.shadowColor = col; g.shadowBlur = 8 * glow; g.stroke(); g.restore();
    g.fillStyle = '#07080b'; g.beginPath(); g.arc(cx, cy, R * 0.58, 0, 7); g.fill();
    const heat = o.act === 'mortar' ? Math.max(0, 1 - o.actT / 40) : 0.15 + 0.1 * Math.sin(t * 0.1);
    g.save(); g.globalCompositeOperation = 'lighter';
    g.fillStyle = `rgba(255,120,30,${0.6 * heat})`; g.beginPath(); g.arc(cx, cy, R * 0.5, 0, 7); g.fill();
    g.restore();
    if (rec > 0) {
        g.save(); g.globalAlpha = rec; g.fillStyle = '#e5e7eb';
        for (let i = 0; i < 6; i++) { const a = i * 1.05 + t * 0.1; g.beginPath(); g.arc(cx + Math.cos(a) * R * 1.3, cy + Math.sin(a) * R * 1.1, 4 + 4 * (1 - rec), 0, 7); g.fill(); }
        g.restore();
    }
}

function trainRoofLaser(g, x, y, w, h, o, col, t, glow) {
    const cx = x + w / 2, cy = y + h / 2;
    const charge = o.act === 'laser' ? Math.min(1, o.actT / 36) : 0;
    // Ray dẫn điện dọc toa
    g.fillStyle = '#151a24'; trainRR(g, x + 14, cy - h * 0.16, w - 28, h * 0.32, 5); g.fill();
    const lg = g.createLinearGradient(x + 14, 0, x + w - 14, 0);
    lg.addColorStop(0, 'rgba(40,224,255,0.15)'); lg.addColorStop(0.5, `rgba(40,224,255,${0.45 + charge * 0.5})`); lg.addColorStop(1, 'rgba(40,224,255,0.15)');
    g.fillStyle = lg; g.fillRect(x + 16, cy - 2, w - 32, 4);
    // Cuộn tụ điện
    for (let i = 0; i < 5; i++) {
        const kx = x + 22 + (w - 44) * i / 4;
        const pulse = 0.5 + 0.5 * Math.sin(t * 0.25 - i * 0.9);
        g.save();
        g.strokeStyle = `rgba(125,249,255,${0.35 + 0.4 * pulse + charge * 0.3})`;
        g.lineWidth = 2.4; g.shadowColor = '#28e0ff'; g.shadowBlur = (6 + charge * 12) * glow;
        g.beginPath(); g.ellipse(kx, cy, 3.5, h * 0.22, 0, 0, 7); g.stroke();
        g.restore();
    }
    // Lõi năng lượng hình thoi
    g.save();
    g.translate(cx, cy); g.rotate(t * 0.04);
    g.fillStyle = charge > 0 ? '#e0fdff' : '#28e0ff';
    g.shadowColor = '#28e0ff'; g.shadowBlur = (10 + charge * 18) * glow;
    const s = h * 0.13 * (1 + charge * 0.5);
    g.beginPath(); g.moveTo(0, -s); g.lineTo(s, 0); g.lineTo(0, s); g.lineTo(-s, 0); g.closePath(); g.fill();
    g.restore();
    // Ống kính 2 mép (trên / dưới)
    [y + 5, y + h - 5].forEach(ly => {
        g.save();
        g.fillStyle = '#0b0f16'; g.beginPath(); g.ellipse(cx, ly, 9, 3.6, 0, 0, 7); g.fill();
        g.fillStyle = `rgba(125,249,255,${0.4 + charge * 0.6})`; g.shadowColor = '#7df9ff'; g.shadowBlur = (6 + charge * 14) * glow;
        g.beginPath(); g.ellipse(cx, ly, 6, 2.2, 0, 0, 7); g.fill();
        g.restore();
    });
    if (charge > 0) {
        g.save(); g.globalCompositeOperation = 'lighter';
        g.strokeStyle = `rgba(160,250,255,${0.5 * charge})`; g.lineWidth = 1.2;
        for (let i = 0; i < 4; i++) {
            g.beginPath(); let px = x + 18 + Math.random() * (w - 36), py = cy;
            g.moveTo(px, py);
            for (let k = 0; k < 3; k++) { px += (Math.random() - 0.5) * 16; py += (Math.random() - 0.5) * h * 0.4; g.lineTo(px, py); }
            g.stroke();
        }
        g.restore();
    }
}

function trainRoofSummon(g, x, y, w, h, o, col, t, glow) {
    const cx = x + w / 2, cy = y + h / 2;
    // Mái tôn sóng màu lính
    g.save(); trainRR(g, x + 10, y + 7, w - 20, h - 14, 4); g.clip();
    const rg = g.createLinearGradient(0, y, 0, y + h);
    rg.addColorStop(0, '#4f6b3a'); rg.addColorStop(0.5, '#3a5229'); rg.addColorStop(1, '#253618');
    g.fillStyle = rg; g.fillRect(x, y, w, h);
    for (let i = x + 12; i < x + w - 10; i += 5) { g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(i, y, 2, h); }
    // đốm rằn ri
    g.fillStyle = 'rgba(30,45,20,0.55)';
    [[0.25, 0.35, 9], [0.62, 0.62, 11], [0.8, 0.3, 7], [0.4, 0.72, 8]].forEach(([fx, fy, r]) => { g.beginPath(); g.ellipse(x + w * fx, y + h * fy, r, r * 0.6, fx * 3, 0, 7); g.fill(); });
    g.restore();
    // Ngôi sao quân đội
    g.save(); g.translate(cx, cy); g.fillStyle = '#e8f5d0'; g.globalAlpha = 0.85;
    g.beginPath();
    for (let i = 0; i < 10; i++) { const r = i % 2 ? h * 0.07 : h * 0.17, a = -Math.PI / 2 + i * Math.PI / 5; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    g.closePath(); g.fill(); g.restore();
    // Cửa trượt 2 bên (mở theo o.door)
    const d = o.door || 0;
    [y + 1, y + h - 8].forEach((dy, i) => {
        const dw = w * 0.34, dx = cx - dw / 2;
        g.save();
        // ánh đỏ bên trong khi mở
        if (d > 0) { g.fillStyle = `rgba(255,60,40,${0.75 * d})`; g.shadowColor = '#ff3b3b'; g.shadowBlur = 10 * glow; g.fillRect(dx, dy, dw, 7); }
        g.restore();
        g.fillStyle = '#6d8a52';
        g.fillRect(dx - dw * 0.48 * d, dy, dw / 2, 7); g.fillRect(dx + dw / 2 + dw * 0.48 * d, dy, dw / 2, 7);
        g.fillStyle = '#2b3a20'; g.fillRect(dx - dw * 0.48 * d + dw / 2 - 2, dy + 1, 1.5, 5); g.fillRect(dx + dw / 2 + dw * 0.48 * d + 1, dy + 1, 1.5, 5);
    });
    // Nắp hầm mái
    [x + w * 0.2, x + w * 0.8].forEach(hx => {
        g.fillStyle = '#2b3a20'; g.beginPath(); g.arc(hx, cy, h * 0.11, 0, 7); g.fill();
        g.strokeStyle = '#9fbf7a'; g.lineWidth = 1.4; g.stroke();
        g.fillStyle = '#9fbf7a'; g.fillRect(hx - 1, cy - h * 0.11, 2, h * 0.22);
    });
}

function trainDrawWreck(g, type, x, y, w, h, o) {
    const t = o.t || 0;
    const bx = x + 4, bw = w - 8;
    g.beginPath();
    g.moveTo(bx, y + 4);
    for (let i = 1; i <= 8; i++) g.lineTo(bx + bw * i / 8, y + 2 + ((i * 37) % 7));
    for (let i = 8; i >= 0; i--) g.lineTo(bx + bw * i / 8, y + h - 2 - ((i * 23) % 6));
    g.closePath();
    const wg = g.createLinearGradient(0, y, 0, y + h);
    wg.addColorStop(0, '#2c2725'); wg.addColorStop(0.5, '#1a1615'); wg.addColorStop(1, '#0c0a0a');
    g.fillStyle = wg; g.fill();
    g.strokeStyle = '#3e2a20'; g.lineWidth = 1.5; g.stroke();
    // khung sườn trơ ra
    g.strokeStyle = '#4b3a30'; g.lineWidth = 2;
    for (let i = 1; i < 6; i++) { g.beginPath(); g.moveTo(bx + bw * i / 6, y + 6); g.lineTo(bx + bw * i / 6 + 3, y + h - 6); g.stroke(); }
    // than hồng
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 5; i++) {
        const ex = bx + bw * ((i * 0.23 + 0.1) % 1), ey = y + h * (0.3 + ((i * 0.37) % 0.4));
        const k = 0.5 + 0.5 * Math.sin(t * 0.15 + i);
        g.fillStyle = `rgba(255,${90 + 60 * k | 0},20,${0.35 * k + 0.15})`;
        g.beginPath(); g.arc(ex, ey, 3 + 2 * k, 0, 7); g.fill();
    }
    g.restore();
    // lửa cháy (tắt dần)
    const life = Math.max(0.35, 1 - (o.deathT || 0) / 900);
    trainFlame(g, x + w * 0.35, y + h * 0.5, 10 * life + 2 * Math.sin(t * 0.3), t);
    trainFlame(g, x + w * 0.68, y + h * 0.45, 8 * life + 2 * Math.sin(t * 0.37 + 1), t + 9);
    g.fillStyle = 'rgba(255,255,255,0.35)'; g.font = `bold ${Math.round(h * 0.18)}px Orbitron, Arial`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('✖', x + w / 2, y + h / 2);
}

function trainDrawShield(g, x, y, w, h, t, glow) {
    g.save();
    const cx = x + w / 2, cy = y + h / 2;
    const rx = w / 2 + 6, ry = h / 2 + 10;
    g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, 7);
    const sg = g.createRadialGradient(cx, cy, 4, cx, cy, rx);
    sg.addColorStop(0, 'rgba(120,200,255,0)'); sg.addColorStop(0.85, 'rgba(120,200,255,0.05)'); sg.addColorStop(1, 'rgba(160,220,255,0.28)');
    g.fillStyle = sg; g.fill();
    g.strokeStyle = `rgba(186,230,253,${0.55 + 0.25 * Math.sin(t * 0.12)})`; g.lineWidth = 1.6;
    g.shadowColor = '#7dd3fc'; g.shadowBlur = 10 * glow; g.stroke();
    // lưới lục giác
    g.clip();
    g.shadowBlur = 0; g.strokeStyle = 'rgba(186,230,253,0.09)'; g.lineWidth = 1;
    const s = 9;
    for (let yy = cy - ry; yy < cy + ry; yy += s * 1.5) {
        for (let xx = cx - rx + ((Math.round((yy - cy) / (s * 1.5)) % 2) ? s : 0); xx < cx + rx; xx += s * 2) {
            g.beginPath();
            for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3 + Math.PI / 6; g.lineTo(xx + Math.cos(a) * s * 0.9, yy + Math.sin(a) * s * 0.9); }
            g.closePath(); g.stroke();
        }
    }
    g.restore();
}

// ---------- Lớp dưới: đường ray + đoàn tàu ----------
function trainDrawUnder() {
    const B = trainFindBoss();
    if (!B) return;
    const G = trainGeom();
    const g = ctx;
    const tc = trainTrackCanvas(G.W, G);
    g.drawImage(tc, 0, G.bandY0 - trainTrackCache.top);
    // Tàu đang chạy: dải chắn đạn đỏ mờ
    if (B.moving() && !B.dying) {
        g.save();
        g.fillStyle = `rgba(255,60,60,${0.06 + 0.04 * Math.sin(B.t * 0.2)})`;
        g.fillRect(0, G.bandY0 - 4, G.W, G.bandY1 - G.bandY0 + 8);
        g.restore();
    }
    // Toa
    const order = B.cars.slice().sort((a, b) => a.sx - b.sx);
    for (const c of order) {
        if (!(c.sx > -G.carW - 10 && c.sx < G.W + 10)) continue;
        // rung khi dừng / nổ
        const jit = B.moving() ? Math.sin(B.t * 0.9 + c.i) * 0.8 : (B.shake > 0 ? Math.sin(B.shake * 3) * B.shake * 0.12 : 0);
        trainDrawCar(g, c.type, c.sx, G.y0 + jit, G.carW, G.carH, {
            t: B.t, wheel: B.wheel + c.i * 0.13, flash: c.flash, door: c.door, aimU: c.aimU, aimD: c.aimD,
            act: c.act, actT: c.actT, dead: c.dead, deathT: c.deathT, hpK: c.hp / c.maxHp, stun: c.stun,
            shield: c.type === 'loco' && B.locoShielded(), theme: (TRAIN_VARIANTS[B.variant] || {}).theme,
            tail: c.i === B.cars.length - 1,
        });
    }
    // Vệt tốc độ khi chạy
    const sp = Math.abs(B.vel) * G.carW;
    if (sp > 1.5 && trainGlow() > 0) {
        g.save(); g.strokeStyle = `rgba(255,255,255,${Math.min(0.25, sp * 0.03)})`; g.lineWidth = 1.2;
        for (let i = 0; i < 8; i++) {
            const ly = G.y0 + 6 + ((i * 37 + B.t * 3) % (G.carH - 12));
            const lx = ((i * 97 - B.t * sp * 1.5) % (G.W + 80) + G.W + 80) % (G.W + 80) - 40;
            g.beginPath(); g.moveTo(lx, ly); g.lineTo(lx + 30 + sp * 4, ly); g.stroke();
        }
        g.restore();
    }
}

// ---------- Lớp trên: khói, tia lửa, mảnh vỡ, sóng âm, đạn, thanh máu toa ----------
function trainArtOver(B) {
    const G = trainGeom();
    const g = ctx, glow = trainGlow();
    g.save();
    // khói
    for (const f of B.puffs) {
        const k = f.life / f.max;
        g.fillStyle = f.dark ? `rgba(30,28,30,${0.45 * k})` : (f.white ? `rgba(248,250,252,${0.6 * k})` : `rgba(190,195,205,${0.42 * k})`);
        g.beginPath(); g.arc(f.x, f.y, f.r, 0, 7); g.fill();
    }
    // vòng sóng âm / nổ
    for (const r of B.rings) {
        const k = r.life / r.max;
        g.strokeStyle = r.fire ? `rgba(255,170,60,${k})` : `rgba(226,232,240,${0.8 * k})`;
        g.lineWidth = r.fire ? 4 * k + 1 : 3;
        g.beginPath(); g.ellipse(r.x, r.y, r.r * 1.3, r.r * 0.75, 0, 0, 7); g.stroke();
        if (!r.fire) { g.lineWidth = 1.2; g.beginPath(); g.ellipse(r.x, r.y, r.r * 1.1, r.r * 0.6, 0, 0, 7); g.stroke(); }
    }
    // mảnh vỡ
    for (const d of B.debris) {
        g.save(); g.translate(d.x, d.y); g.rotate(d.rot);
        g.globalAlpha = Math.min(1, d.life / 20);
        g.fillStyle = d.color; g.fillRect(-d.size / 2, -d.size / 3, d.size, d.size * 0.66);
        g.restore();
    }
    // tia lửa bánh xe
    g.globalCompositeOperation = 'lighter';
    for (const s of B.sparks) {
        const k = s.life / s.max;
        g.strokeStyle = `rgba(255,${200 + 55 * k | 0},${90 * k | 0},${k})`; g.lineWidth = 1.6;
        g.beginPath(); g.moveTo(s.x, s.y); g.lineTo(s.x - s.vx * 2.2, s.y - s.vy * 2.2); g.stroke();
    }
    // đạn boss
    for (const b of B.bullets) {
        if (b.kind === 'gun') { g.fillStyle = '#8dff8a'; g.shadowColor = '#5dff7a'; }
        else { g.fillStyle = '#ffd166'; g.shadowColor = '#ffb020'; }
        g.shadowBlur = 8 * glow;
        g.beginPath(); g.arc(b.x, b.y, b.r, 0, 7); g.fill();
        g.shadowBlur = 0;
        g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.arc(b.x, b.y, b.r * 0.45, 0, 7); g.fill();
        g.strokeStyle = b.kind === 'gun' ? 'rgba(93,255,122,0.35)' : 'rgba(255,176,32,0.4)'; g.lineWidth = b.r * 1.2;
        g.beginPath(); g.moveTo(b.x, b.y); g.lineTo(b.x - b.vx * 3, b.y - b.vy * 3); g.stroke();
    }
    g.globalCompositeOperation = 'source-over';
    // thanh máu từng toa (ngay trên mép toa)
    if (!B.dying) for (const c of B.cars) {
        if (c.dead || !(c.sx > -G.carW && c.sx < G.W)) continue;
        const T = TRAIN_CAR_TYPES[c.type];
        const bw = Math.min(G.carW - 26, 86), bx = c.sx + (G.carW - bw) / 2, by = G.y0 - 15;
        g.fillStyle = 'rgba(8,10,16,0.82)'; trainRR(g, bx - 2, by - 1, bw + 4, 8, 3); g.fill();
        const k = Math.max(0, c.hp / c.maxHp);
        const hg = g.createLinearGradient(bx, 0, bx + bw, 0);
        hg.addColorStop(0, trainShade(T.color, -0.2)); hg.addColorStop(1, T.color);
        g.fillStyle = (c.type === 'loco' && B.locoShielded()) ? '#7dd3fc' : hg;
        trainRR(g, bx, by + 1, Math.max(2, bw * k), 4, 2); g.fill();
        g.font = "bold 8px Orbitron, Arial"; g.textAlign = 'center'; g.textBaseline = 'bottom';
        g.fillStyle = '#e5e7eb';
        const lbl = (c.type === 'loco' && B.locoShielded()) ? `${T.icon} ${T.short} 🛡` : `${T.icon} ${T.short}`;
        g.fillText(lbl, c.sx + G.carW / 2, by - 1);
    }
    g.restore();
}

// ---------- Quả cối ----------
function trainArtShell(s) {
    const g = ctx, glow = trainGlow();
    g.save();
    if (s.delay > 0) {
        const k = 1 - s.delay / s.maxDelay;
        // vòng cảnh báo trên làn
        g.fillStyle = `rgba(255,70,40,${0.08 + 0.22 * k})`;
        g.beginPath(); g.ellipse(s.x, s.y, s.r * 1.25, s.r * 0.62, 0, 0, 7); g.fill();
        g.strokeStyle = `rgba(255,80,50,${0.6 + 0.4 * Math.sin(s.delay * 0.6)})`; g.lineWidth = 2;
        g.setLineDash([6, 5]); g.lineDashOffset = s.delay;
        g.beginPath(); g.ellipse(s.x, s.y, s.r * 1.25, s.r * 0.62, 0, 0, 7); g.stroke();
        g.setLineDash([]);
        g.strokeStyle = 'rgba(255,220,120,0.9)'; g.lineWidth = 1.5;
        g.beginPath(); g.ellipse(s.x, s.y, s.r * 1.25 * (1 - k), s.r * 0.62 * (1 - k), 0, 0, 7); g.stroke();
        // dấu thập
        g.beginPath(); g.moveTo(s.x - 6, s.y); g.lineTo(s.x + 6, s.y); g.moveTo(s.x, s.y - 4); g.lineTo(s.x, s.y + 4); g.stroke();
        // quả đạn bay vòng cung
        const px = s.fx + (s.x - s.fx) * k, py = s.fy + (s.y - s.fy) * k - Math.sin(k * Math.PI) * 60;
        g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.ellipse(px, s.fy + (s.y - s.fy) * k + 4, 5, 2.5, 0, 0, 7); g.fill();
        g.fillStyle = '#2b2f38'; g.beginPath(); g.arc(px, py, 5 + Math.sin(k * Math.PI) * 2, 0, 7); g.fill();
        g.fillStyle = '#ff7a1a'; g.shadowColor = '#ff7a1a'; g.shadowBlur = 8 * glow;
        g.beginPath(); g.arc(px, py, 2.2, 0, 7); g.fill();
    } else {
        const k = s.boom / 14;
        g.strokeStyle = `rgba(255,150,60,${1 - k})`; g.lineWidth = 3;
        g.beginPath(); g.ellipse(s.x, s.y, s.r * (1.2 + k * 0.5), s.r * (0.6 + k * 0.25), 0, 0, 7); g.stroke();
    }
    g.restore();
}

// ---------- Lính ----------
function trainArtMinion(m) {
    const g = ctx, glow = trainGlow();
    const cx = m.x + m.w / 2, cy = m.y + m.h / 2;
    g.save();
    g.fillStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.ellipse(cx, cy + 8, 9, 3.5, 0, 0, 7); g.fill();
    if (m.kind === 'runner') {
        const blink = (Math.floor(m.t / 6) % 2) === 0;
        g.fillStyle = '#3a1f1a'; g.beginPath(); g.arc(cx, cy, 8.5, 0, 7); g.fill();
        const rg = g.createRadialGradient(cx - 3, cy - 3, 1, cx, cy, 8);
        rg.addColorStop(0, '#ff9f6b'); rg.addColorStop(1, '#b3261e');
        g.fillStyle = rg; g.beginPath(); g.arc(cx, cy, 7, 0, 7); g.fill();
        g.strokeStyle = '#ffc531'; g.lineWidth = 1.5;
        for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + m.t * 0.2; g.beginPath(); g.moveTo(cx + Math.cos(a) * 7, cy + Math.sin(a) * 7); g.lineTo(cx + Math.cos(a) * 10, cy + Math.sin(a) * 10); g.stroke(); }
        g.fillStyle = blink ? '#fff' : '#ff3b3b'; g.shadowColor = '#ff3b3b'; g.shadowBlur = 8 * glow;
        g.beginPath(); g.arc(cx, cy, 2.4, 0, 7); g.fill();
    } else {
        g.translate(cx, cy);
        g.save(); g.rotate(m.face);
        g.fillStyle = '#1f2937'; g.fillRect(2, -1.8, 13, 3.6);
        g.fillStyle = '#9ca3af'; g.fillRect(13, -1.8, 2, 3.6);
        g.restore();
        g.fillStyle = '#243b1d'; g.beginPath(); g.arc(0, 0, 8.5, 0, 7); g.fill();
        const hg = g.createRadialGradient(-3, -3, 1, 0, 0, 8);
        hg.addColorStop(0, '#9fd27a'); hg.addColorStop(1, '#3d6b2a');
        g.fillStyle = hg; g.beginPath(); g.arc(0, 0, 7, 0, 7); g.fill();
        g.strokeStyle = '#5dff7a'; g.lineWidth = 1.2; g.shadowColor = '#5dff7a'; g.shadowBlur = 6 * glow;
        g.beginPath(); g.arc(0, 0, 7, 0, 7); g.stroke();
        g.shadowBlur = 0; g.fillStyle = '#e8f5d0'; g.fillRect(-3.5, -1, 7, 2);
        g.translate(-cx, -cy);
    }
    if (m.flash > 0) { g.fillStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); g.arc(cx, cy, 8, 0, 7); g.fill(); }
    if (m.hp < m.maxHp) {
        g.fillStyle = 'rgba(0,0,0,0.7)'; g.fillRect(cx - 9, m.y - 6, 18, 3);
        g.fillStyle = m.kind === 'runner' ? '#ff7a59' : '#5dff7a'; g.fillRect(cx - 9, m.y - 6, 18 * Math.max(0, m.hp / m.maxHp), 3);
    }
    g.restore();
}

// ---------- Xông Ga ----------
function trainArtDash(d) {
    const g = ctx, W = canvas.width, glow = trainGlow();
    const y = d.laneY, hh = 22;
    g.save();
    if (d.warn > 0) {
        const k = 1 - d.warn / d.maxWarn;
        g.save();
        g.beginPath(); g.rect(0, y - hh, W, hh * 2);
        d.gaps.forEach(gp => g.rect(gp.x + gp.w / 2, y - hh, -gp.w, hh * 2));
        g.clip('evenodd');
        g.fillStyle = `rgba(255,197,49,${0.10 + 0.2 * k})`; g.fillRect(0, y - hh, W, hh * 2);
        g.strokeStyle = `rgba(255,197,49,${0.35 + 0.3 * k})`; g.lineWidth = 6;
        const off = (d.t * 2) % 24;
        for (let x = -40 + off; x < W + 40; x += 24) { g.beginPath(); g.moveTo(x, y + hh); g.lineTo(x + 18, y - hh); g.stroke(); }
        g.restore();
        g.strokeStyle = `rgba(255,214,90,${0.6 + 0.4 * Math.sin(d.t * 0.5)})`; g.lineWidth = 2;
        g.beginPath(); g.moveTo(0, y - hh); g.lineTo(W, y - hh); g.moveTo(0, y + hh); g.lineTo(W, y + hh); g.stroke();
        d.gaps.forEach(gp => {
            g.save();
            g.fillStyle = 'rgba(93,255,122,0.16)'; g.fillRect(gp.x - gp.w / 2, y - hh, gp.w, hh * 2);
            g.strokeStyle = '#5dff7a'; g.lineWidth = 2; g.shadowColor = '#5dff7a'; g.shadowBlur = 10 * glow;
            g.strokeRect(gp.x - gp.w / 2, y - hh, gp.w, hh * 2);
            g.shadowBlur = 0; g.fillStyle = '#bbf7d0'; g.font = 'bold 9px Orbitron, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
            g.fillText('AN TOÀN', gp.x, y);
            g.restore();
        });
        g.fillStyle = '#ffd166'; g.font = 'bold 11px Orbitron, Arial'; g.textAlign = 'center';
        g.fillText('⚠ XÔNG GA! VÀO KHE AN TOÀN', W / 2, y - hh - 6);
    } else if (d.headX !== undefined) {
        const hx = d.headX, dir = d.dir;
        // vệt lửa phía sau
        const tg = g.createLinearGradient(hx, 0, hx - dir * 260, 0);
        tg.addColorStop(0, 'rgba(255,140,40,0.75)'); tg.addColorStop(1, 'rgba(255,60,20,0)');
        g.fillStyle = tg; g.fillRect(Math.min(hx, hx - dir * 260), y - hh * 0.8, 260, hh * 1.6);
        // đầu tàu ma
        g.save(); g.translate(hx, y); if (dir < 0) g.scale(-1, 1);
        g.shadowColor = '#ff8c1a'; g.shadowBlur = 18 * glow;
        g.fillStyle = '#ffb347';
        g.beginPath(); g.moveTo(26, 0); g.lineTo(8, -16); g.lineTo(-40, -16); g.lineTo(-40, 16); g.lineTo(8, 16); g.closePath(); g.fill();
        g.fillStyle = '#fff3d6'; g.beginPath(); g.arc(18, 0, 4, 0, 7); g.fill();
        g.fillStyle = '#7a1f1a'; g.fillRect(-34, -10, 18, 20);
        g.restore();
        d.gaps.forEach(gp => { g.strokeStyle = 'rgba(93,255,122,0.7)'; g.lineWidth = 2; g.strokeRect(gp.x - gp.w / 2, y - hh, gp.w, hh * 2); });
    }
    g.restore();
}

// ---------- Hồn Ký Ức (đồng đội bị hạ) ----------
function trainArtGhost(p) {
    const g = ctx, t = Date.now() / 300;
    const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
    g.save();
    g.strokeStyle = `rgba(165,180,252,${0.6 + 0.3 * Math.sin(t)})`; g.lineWidth = 2; g.setLineDash([5, 4]); g.lineDashOffset = -t * 6;
    g.beginPath(); g.arc(cx, cy, p.w * 0.85, 0, 7); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#c7d2fe'; g.font = 'bold 10px Orbitron, Arial'; g.textAlign = 'center';
    const ty = p.id === 1 ? p.y - 10 : p.y + p.h + 18;
    if (typeof drawWorldText === 'function') drawWorldText(g, '👻 HỒN KÝ ỨC', cx, ty); else g.fillText('👻 HỒN KÝ ỨC', cx, ty);
    g.restore();
}

// ---------- HUD trùm (màn hình) ----------
let trainHudGhost = null; // thanh máu "trễ" (trắng) cho cảm giác mất máu
function trainDrawHUD(B) {
    if (!B) return;
    const g = ctx, W = canvas.width, H = canvas.height, glow = trainGlow();
    const TM = TrainMode;
    const v = TRAIN_VARIANTS[B.variant] || TRAIN_VARIANTS.p1;
    g.save();
    // Vị trí: 1 người -> mép trên; co-op -> ngay trên đường ray (không che xe P2)
    const G = trainGeom();
    const pw = TM.coop ? Math.min(W - 120, 330) : Math.min(W - 16, 380), px = (W - pw) / 2;
    const py = TM.coop ? Math.max(70, G.bandY0 - 80) : 8;
    const ph = 40;
    // khung kính
    g.fillStyle = 'rgba(10,8,18,0.78)'; trainRR(g, px, py, pw, ph, 8); g.fill();
    g.save(); g.strokeStyle = 'rgba(255,59,59,0.85)'; g.lineWidth = 1.5; g.shadowColor = '#ff3b3b'; g.shadowBlur = 10 * glow;
    trainRR(g, px, py, pw, ph, 8); g.stroke(); g.restore();
    // tên trùm
    g.textBaseline = 'middle'; g.textAlign = 'left';
    g.font = "900 13px Orbitron, Arial"; g.fillStyle = '#ffe1e1';
    g.save(); g.shadowColor = '#ff3b3b'; g.shadowBlur = 8 * glow;
    g.fillText('THE TRAIN', px + 10, py + 11); g.restore();
    g.font = "bold 9px Orbitron, Arial"; g.fillStyle = '#fca5a5';
    let ptxt = `PHASE ${TM.phase}${v.phase > 1 ? ' · ' + v.code + ' ' + v.name : ''}`;
    const room = pw - 92 - 70;
    if (g.measureText(ptxt).width > room) ptxt = `PHASE ${TM.phase}${v.phase > 1 ? ' · ' + v.code : ''}`;
    g.fillText(ptxt, px + 92, py + 11.5);
    // số máu
    const tot = B.totalHp(), max = B.totalMax();
    g.textAlign = 'right'; g.font = "bold 10px Orbitron, Arial"; g.fillStyle = '#fff';
    g.fillText(`${tot.toFixed(1)} / ${max.toFixed(0)}`, px + pw - 10, py + 11);
    // thanh máu phân đoạn theo toa
    const bx = px + 8, bw = pw - 16, by = py + 21, bh = 12;
    g.fillStyle = '#05050a'; trainRR(g, bx - 1, by - 1, bw + 2, bh + 2, 4); g.fill();
    const k = tot / max;
    if (trainHudGhost === null || trainHudGhost < k || trainHudGhost > 1) trainHudGhost = k;
    trainHudGhost += (k - trainHudGhost) * 0.04;
    g.fillStyle = 'rgba(255,255,255,0.55)'; g.fillRect(bx, by, bw * trainHudGhost, bh);
    let acc = 0;
    B.cars.forEach(c => {
        const sw = bw * c.maxHp / max, sx = bx + bw * acc / max;
        acc += c.maxHp;
        const T = TRAIN_CAR_TYPES[c.type];
        const f = Math.max(0, c.hp / c.maxHp);
        const sg = g.createLinearGradient(0, by, 0, by + bh);
        sg.addColorStop(0, trainShade(T.color, 0.35)); sg.addColorStop(0.5, T.color); sg.addColorStop(1, trainShade(T.color, -0.4));
        g.fillStyle = c.dead ? 'rgba(60,20,20,0.8)' : sg;
        g.fillRect(sx, by, sw * (c.dead ? 1 : f), bh);
        if (c.dead) { g.fillStyle = 'rgba(255,80,80,0.6)'; g.font = 'bold 8px Arial'; g.textAlign = 'center'; g.fillText('✖', sx + sw / 2, by + bh / 2 + 0.5); }
        else if (c.type === 'loco' && B.locoShielded()) { g.fillStyle = 'rgba(125,211,252,0.45)'; g.fillRect(sx, by, sw, bh); }
        g.fillStyle = '#05050a'; g.fillRect(sx + sw - 1, by, 1.5, bh);
        if (c.vis && !c.dead && !B.moving()) { g.fillStyle = 'rgba(255,255,255,0.9)'; g.fillRect(sx, by + bh - 2, sw - 1, 2); }
    });
    g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(bx, by, bw, 2);
    // dòng trạng thái nhỏ
    g.textAlign = 'left'; g.font = "bold 8px Orbitron, Arial";
    const pow = Math.round((B.power() - 1) * 100);
    g.fillStyle = '#fbbf24';
    g.fillText(pow > 0 ? `🔥 +${pow}% SỨC MẠNH (mất ${B.lost} toa)` : '', bx, py + ph - 3);
    g.restore();

    // Gợi ý trạng thái tàu
    if (B.moving() && !B.dying && TM.state === 'fight' && B.state !== 'intro') {
        g.save();
        g.globalAlpha = 0.65 + 0.35 * Math.sin(B.t * 0.25);
        g.font = "bold 10px Orbitron, Arial"; g.textAlign = 'center'; g.fillStyle = '#ffd6d6';
        g.fillText('🚂 TÀU ĐANG CHẠY — CHẮN ĐẠN', W / 2, G.bandY1 + 22);
        g.restore();
    }
    // Banner vào Phase
    if (TM.bannerT > 0) trainDrawPhaseBanner(g, W, H, TM.bannerT, TM.phase, v);
    // Thắng / thua
    if (TM.state === 'won' || (B.dying && TM.state !== 'lost')) {
        const k = Math.min(1, (B.dying || 0) / 30);
        trainDrawCenterBanner(g, W, H, k, TM.phase >= 3 ? 'MẢNH KÝ ỨC HOÀN THÀNH' : `PHASE ${TM.phase} — PHÁ HỦY!`, 'THE TRAIN ĐÃ NGỪNG CHẠY', '#ffd166');
    } else if (TM.state === 'lost') {
        const k = Math.min(1, TM.endT / 30);
        g.save(); g.fillStyle = `rgba(80,0,0,${0.35 * k})`; g.fillRect(0, 0, W, H); g.restore();
        trainDrawCenterBanner(g, W, H, k, 'BỊ HẠ GỤC', `PHASE ${TM.phase} THẤT BẠI — giữ nguyên đồ đã mua`, '#ff5d5d');
    }
}

function trainDrawCenterBanner(g, W, H, k, title, sub, col) {
    g.save();
    g.globalAlpha = k;
    const y = H * 0.34;
    const bg = g.createLinearGradient(0, 0, W, 0);
    bg.addColorStop(0, 'rgba(0,0,0,0)'); bg.addColorStop(0.2, 'rgba(10,6,18,0.85)'); bg.addColorStop(0.8, 'rgba(10,6,18,0.85)'); bg.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = bg; g.fillRect(0, y - 34, W, 68);
    g.fillStyle = col; g.fillRect(0, y - 34, W, 2); g.fillRect(0, y + 32, W, 2);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `900 ${Math.min(26, W / 14)}px Orbitron, Arial`;
    g.fillStyle = '#fff'; g.shadowColor = col; g.shadowBlur = 16 * trainGlow();
    g.fillText(title, W / 2, y - 6);
    g.shadowBlur = 0; g.font = 'bold 11px Orbitron, Arial'; g.fillStyle = col;
    g.fillText(sub, W / 2, y + 18);
    g.restore();
}

function trainDrawPhaseBanner(g, W, H, t, phase, v) {
    const total = 170, e = total - t;
    const kin = Math.min(1, e / 18), kout = Math.min(1, t / 20);
    const k = Math.min(kin, kout);
    const y = H * 0.3;
    g.save();
    g.globalAlpha = k;
    // dải chéo
    g.translate(W / 2 + (1 - kin) * -W * 0.6, y);
    const stripeH = 74;
    const bg = g.createLinearGradient(-W / 2, 0, W / 2, 0);
    bg.addColorStop(0, 'rgba(120,10,10,0)'); bg.addColorStop(0.15, 'rgba(60,8,12,0.92)'); bg.addColorStop(0.85, 'rgba(60,8,12,0.92)'); bg.addColorStop(1, 'rgba(120,10,10,0)');
    g.fillStyle = bg; g.fillRect(-W / 2, -stripeH / 2, W, stripeH);
    g.save(); g.beginPath(); g.rect(-W / 2, -stripeH / 2, W, stripeH); g.clip();
    g.strokeStyle = 'rgba(255,197,49,0.12)'; g.lineWidth = 8;
    for (let x = -W; x < W; x += 22) { g.beginPath(); g.moveTo(x + e * 2 % 22, stripeH / 2); g.lineTo(x + 30 + e * 2 % 22, -stripeH / 2); g.stroke(); }
    g.restore();
    g.fillStyle = '#ff3b3b'; g.fillRect(-W / 2, -stripeH / 2, W, 2.5); g.fillRect(-W / 2, stripeH / 2 - 2.5, W, 2.5);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = "bold 11px Orbitron, Arial"; g.fillStyle = '#fca5a5';
    g.fillText(`MẢNH KÝ ỨC 1 · PHASE ${phase}/3`, 0, -22);
    g.font = `900 ${Math.min(30, W / 12)}px Orbitron, Arial`; g.fillStyle = '#fff';
    g.shadowColor = '#ff3b3b'; g.shadowBlur = 18 * trainGlow();
    g.fillText(v.phase > 1 ? v.name : 'THE TRAIN', 0, 3);
    g.shadowBlur = 0;
    g.font = 'bold 9.5px Orbitron, Arial'; g.fillStyle = '#ffd166';
    g.fillText(v.phase > 1 ? (v.fallback ? 'BẢN DỰ PHÒNG: Phase 1 tăng sức mạnh' : v.desc) : 'Phá 3 toa để vỡ Khiên Đầu Tàu', 0, 26);
    g.restore();
}

// ---------- Hình minh hoạ biến thể (thẻ Ký Ức, màn sảnh) ----------
function trainDrawPreview(cv, variantId, t) {
    const g = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    const v = TRAIN_VARIANTS[variantId] || TRAIN_VARIANTS.p1;
    const th = TRAIN_THEMES[v.theme] || TRAIN_THEMES.base;
    t = t || 0;
    g.clearRect(0, 0, W, H);
    const sky = g.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, th.sky); sky.addColorStop(1, '#000');
    g.fillStyle = sky; g.fillRect(0, 0, W, H);
    // lưới neon
    g.strokeStyle = trainHex(th.glow, 0.12); g.lineWidth = 1;
    for (let x = (t * 0.6) % 20; x < W; x += 20) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
    for (let y = 0; y < H; y += 20) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    const tracks = v.theme === 'speed' ? [H * 0.33, H * 0.7] : [H * 0.52];
    const ch = Math.min(40, H * 0.36), cw = W * 0.4;
    tracks.forEach((ty, ti) => {
        g.fillStyle = '#1b1d26'; g.fillRect(0, ty - ch / 2 - 7, W, ch + 14);
        for (let x = 0; x < W; x += 14) { g.fillStyle = '#3a2f2a'; g.fillRect(x, ty - ch / 2 - 5, 6, ch + 10); }
        g.fillStyle = '#8b95a7'; g.fillRect(0, ty - ch / 2 - 4, W, 2); g.fillRect(0, ty + ch / 2 + 2, W, 2);
        const types = ti === 0 ? ['loco', 'smg', 'mortar'] : ['loco', 'laser', 'summon'];
        const dir = ti === 0 ? 1 : -1;
        const off = ((t * 0.5 * dir) % cw + cw) % cw;
        types.forEach((ty2, i) => {
            const x = 8 + i * (cw + 4) - (v.theme === 'speed' ? off : 0);
            trainDrawCar(g, ty2, x, ty - ch / 2, cw, ch, { t, wheel: t * 0.02, theme: v.theme, hpK: 1, shield: false, act: ty2 === 'laser' ? 'laser' : null, actT: 30 });
        });
    });
    // hiệu ứng chủ đề
    if (v.theme === 'armor') {
        g.fillStyle = 'rgba(203,213,225,0.55)';
        for (let i = 0; i < 3; i++) { const x = 8 + i * (cw + 4); g.fillRect(x + 6, tracks[0] - ch / 2 - 3, cw - 12, 5); }
    } else if (v.theme === 'night') {
        g.fillStyle = 'rgba(0,0,10,0.62)'; g.fillRect(0, 0, W, H);
        g.save(); g.globalCompositeOperation = 'lighter';
        const cg = g.createRadialGradient(W * 0.5, H, 4, W * 0.5, H, H * 0.9);
        cg.addColorStop(0, 'rgba(196,181,253,0.55)'); cg.addColorStop(1, 'rgba(196,181,253,0)');
        g.fillStyle = cg; g.beginPath(); g.moveTo(W * 0.42, tracks[0]); g.lineTo(W * 0.15, H); g.lineTo(W * 0.85, H); g.closePath(); g.fill();
        g.restore();
        g.globalAlpha = 0.35; trainDrawCar(g, 'smg', W * 0.55, tracks[0] - ch / 2 - ch - 6, cw * 0.7, ch * 0.8, { t, theme: 'night' }); g.globalAlpha = 1;
    } else if (v.theme === 'fire') {
        for (let i = 0; i < 6; i++) trainFlame(g, 12 + i * W / 6, tracks[0] + ch / 2 + 16, 9 + 3 * Math.sin(t * 0.2 + i), t + i * 7);
        g.fillStyle = 'rgba(255,90,20,0.18)'; g.fillRect(0, tracks[0] + ch / 2 + 6, W, 18);
    } else if (v.theme === 'speed') {
        g.strokeStyle = 'rgba(103,232,249,0.4)'; g.lineWidth = 1.5;
        for (let i = 0; i < 10; i++) { const y = (i * 17) % H, x = (i * 53 + t * 4) % W; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 30, y); g.stroke(); }
    } else if (v.theme === 'fortress') {
        g.save(); g.globalCompositeOperation = 'lighter';
        const bg2 = g.createLinearGradient(W / 2 - 10, 0, W / 2 + 10, 0);
        bg2.addColorStop(0, 'rgba(244,114,182,0)'); bg2.addColorStop(0.5, 'rgba(249,168,212,0.8)'); bg2.addColorStop(1, 'rgba(244,114,182,0)');
        g.fillStyle = bg2; g.fillRect(W / 2 - 10, tracks[0] + ch / 2, 20, H);
        g.restore();
    } else if (v.theme === 'memory') {
        g.save(); g.globalAlpha = 0.5 + 0.2 * Math.sin(t * 0.1);
        g.fillStyle = '#fde68a'; g.font = `bold ${H * 0.18}px Arial`; g.textAlign = 'center';
        ['🔫', '❄️', '🩸'].forEach((e, i) => g.fillText(e, 8 + cw / 2 + i * (cw + 4), tracks[0] - ch / 2 - 10));
        g.restore();
    }
    // khung
    g.strokeStyle = trainHex(th.glow, 0.7); g.lineWidth = 2; g.strokeRect(1, 1, W - 2, H - 2);
}
