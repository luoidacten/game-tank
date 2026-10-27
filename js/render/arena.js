// ==========================================
// Nền sàn đấu & bóng đổ
// ==========================================



// ==========================================
// --- NỀN SÀN ĐẤU (Cache offscreen để tối ưu hiệu năng) ---
// ==========================================
let arenaFloorCache = null;
function getArenaFloor() {
    let w = canvas.width, h = canvas.height;
    let dpr = Display.dpr;
    if (arenaFloorCache && arenaFloorCache.map === gameState.currentMap && arenaFloorCache.lw === w && arenaFloorCache.lh === h && arenaFloorCache.dpr === dpr) return arenaFloorCache;
    let off = document.createElement('canvas');
    off.width = Math.round(w * dpr); off.height = Math.round(h * dpr);
    off.lw = w; off.lh = h; off.dpr = dpr; off.map = gameState.currentMap;
    let g = off.getContext('2d');
    g.scale(dpr, dpr);

    // Nền tối dạng vignette
    let bg = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.1, w / 2, h / 2, Math.max(w, h) * 0.75);
    bg.addColorStop(0, '#121a2c');
    bg.addColorStop(1, '#05070c');
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);

    // Đồ hoạ thấp: nền giản lược (chỉ nền + làn + vạch giữa)
    const simple = typeof Quality !== 'undefined' && Quality.level === 'low';
    // Lưới neon mờ
    let cell = simple ? 1e9 : 34;
    g.lineWidth = 1;
    g.strokeStyle = 'rgba(0, 240, 255, 0.045)';
    g.beginPath();
    for (let x = (w / 2) % cell; x < w; x += cell) { g.moveTo(Math.round(x) + 0.5, 0); g.lineTo(Math.round(x) + 0.5, h); }
    for (let y = (h / 2) % cell; y < h; y += cell) { g.moveTo(0, Math.round(y) + 0.5); g.lineTo(w, Math.round(y) + 0.5); }
    g.stroke();

    drawMapFloorTheme(g, w, h, gameState.currentMap, simple);

    // Làn sân nhà của 2 phe (P2 trên - đỏ, P1 dưới - xanh)
    let laneH = 70;
    let topLane = g.createLinearGradient(0, 0, 0, laneH);
    topLane.addColorStop(0, 'rgba(255, 0, 85, 0.16)');
    topLane.addColorStop(1, 'rgba(255, 0, 85, 0)');
    g.fillStyle = topLane;
    g.fillRect(0, 0, w, laneH);
    let botLane = g.createLinearGradient(0, h - laneH, 0, h);
    botLane.addColorStop(0, 'rgba(0, 240, 255, 0)');
    botLane.addColorStop(1, 'rgba(0, 240, 255, 0.16)');
    g.fillStyle = botLane;
    g.fillRect(0, h - laneH, w, laneH);

    // Vạch giữa sân + vòng tròn trung tâm
    g.save();
    g.strokeStyle = 'rgba(255, 255, 255, 0.07)';
    g.lineWidth = 2;
    g.setLineDash([14, 10]);
    g.beginPath();
    g.moveTo(0, h / 2); g.lineTo(w, h / 2);
    g.stroke();
    g.setLineDash([]);
    g.beginPath();
    g.arc(w / 2, h / 2, Math.min(w, h) * 0.12, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = 'rgba(255, 255, 255, 0.08)';
    g.beginPath();
    g.arc(w / 2, h / 2, 3, 0, Math.PI * 2);
    g.fill();
    g.restore();

    // Ký hiệu góc sân (HUD style)
    g.strokeStyle = 'rgba(0, 240, 255, 0.18)';
    g.lineWidth = 2;
    const corner = (x, y, dx, dy) => { g.beginPath(); g.moveTo(x + dx * 18, y); g.lineTo(x, y); g.lineTo(x, y + dy * 18); g.stroke(); };
    if (!simple) corner(6, 6, 1, 1); if (!simple) { corner(w - 6, 6, -1, 1); corner(6, h - 6, 1, -1); corner(w - 6, h - 6, -1, -1); }

    arenaFloorCache = off;
    return off;
}

// Bóng đổ mềm dưới xe / vật triệu hồi giúp tách khối khỏi nền
function drawSoftShadow(o, scale = 1) {
    if (!o || o.active === false || typeof o.x !== 'number' || !o.w) return;
    let cx = o.x + o.w / 2;
    let cy = o.y + (o.h || o.w) * 0.85;
    let rx = o.w * 0.62 * scale;
    let ry = Math.max(3, (o.h || o.w) * 0.22 * scale);
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
}

// Nền riêng cho map mới (vẽ lên cache sàn, sau lưới neon)
function drawMapFloorTheme(g, w, h, map, simple) {
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    if (map === 'classic') {
        // lưới cyber sạch + chấm giao điểm
        if (!simple) {
            g.fillStyle = 'rgba(0,240,255,0.16)';
            for (let x = (w / 2) % 68; x < w; x += 68) for (let y = (h / 2) % 68; y < h; y += 68) g.fillRect(x - 1.5, y - 1.5, 3, 3);
        }
        g.strokeStyle = 'rgba(0,240,255,0.14)'; g.lineWidth = 2; g.strokeRect(10, 10, w - 20, h - 20);
    } else if (map === 'bastion') {
        g.fillStyle = 'rgba(90,100,120,0.16)'; g.fillRect(0, 0, w, h);
        const tw = simple ? 78 : 52, th = simple ? 40 : 26;
        g.strokeStyle = 'rgba(150,170,200,0.13)'; g.lineWidth = 1; g.beginPath();
        for (let y = 0, r = 0; y < h; y += th, r++) {
            g.moveTo(0, y + 0.5); g.lineTo(w, y + 0.5);
            for (let x = (r % 2) * tw / 2; x < w; x += tw) { g.moveTo(x + 0.5, y); g.lineTo(x + 0.5, y + th); }
        }
        g.stroke();
        if (!simple) for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(0,0,0,${0.08 + rnd() * 0.1})`; g.fillRect(rnd() * w, rnd() * h, 6 + rnd() * 14, 4 + rnd() * 8); }
        g.strokeStyle = 'rgba(56,189,248,0.4)'; g.lineWidth = 3; g.strokeRect(4, 4, w - 8, h - 8);
    } else if (map === 'artillery') {
        let sc = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, h * 0.7);
        sc.addColorStop(0, 'rgba(120,60,20,0.22)'); sc.addColorStop(1, 'rgba(20,8,4,0.45)');
        g.fillStyle = sc; g.fillRect(0, 0, w, h);
        for (let i = 0; i < (simple ? 5 : 16); i++) {
            const x = rnd() * w, y = 80 + rnd() * (h - 160), r = 12 + rnd() * 22;
            let cr = g.createRadialGradient(x, y, 0, x, y, r);
            cr.addColorStop(0, 'rgba(0,0,0,0.6)'); cr.addColorStop(0.75, 'rgba(10,4,2,0.4)'); cr.addColorStop(1, 'rgba(255,120,40,0)');
            g.fillStyle = cr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
            g.strokeStyle = 'rgba(255,110,40,0.28)'; g.lineWidth = 1.5; g.beginPath(); g.arc(x, y, r * 0.85, 0, 7); g.stroke();
        }
        if (!simple) for (let i = 0; i < 40; i++) { g.strokeStyle = 'rgba(255,90,30,0.15)'; g.beginPath(); const x = rnd() * w, y = rnd() * h; g.moveTo(x, y); g.lineTo(x + rnd() * 12 - 6, y + rnd() * 12 - 6); g.stroke(); }
    } else if (map === 'overdrive') {
        g.fillStyle = 'rgba(0,60,90,0.18)'; g.fillRect(0, 0, w, h);
        g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = 3;
        const step = simple ? 90 : 46;
        for (let y = 90; y < h - 90; y += step) {
            g.strokeStyle = `rgba(0,240,255,${0.07 + 0.1 * Math.abs(Math.sin(y))})`; g.beginPath();
            for (let x = 14; x < w - 14; x += 38) { g.moveTo(x, y + 8); g.lineTo(x + 10, y); g.lineTo(x, y - 8); }
            g.stroke();
        }
        g.strokeStyle = 'rgba(255,230,0,0.4)'; g.lineWidth = 2; g.strokeRect(6, 6, w - 12, h - 12);
    } else if (map === 'fast_shrink') {
        g.fillStyle = 'rgba(60,0,0,0.2)'; g.fillRect(0, 0, w, h);
        const band = 22, sw = 22;
        g.save(); g.beginPath(); g.rect(0, 0, w, h); g.rect(band, band, w - band * 2, h - band * 2); g.clip('evenodd');
        g.fillStyle = 'rgba(15,10,0,0.7)'; g.fillRect(0, 0, w, h);
        g.fillStyle = 'rgba(255,200,0,0.5)';
        for (let k = -h; k < w + h; k += sw * 2) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + sw, 0); g.lineTo(k + sw - h, h); g.lineTo(k - h, h); g.fill(); }
        g.restore();
        let ed = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.7);
        ed.addColorStop(0, 'rgba(255,0,40,0)'); ed.addColorStop(1, 'rgba(255,0,40,0.3)');
        g.fillStyle = ed; g.fillRect(0, 0, w, h);
        g.strokeStyle = 'rgba(255,40,60,0.8)'; g.lineWidth = 2; g.strokeRect(band, band, w - band * 2, h - band * 2);
    } else if (map === 'rush_hour') {
        g.fillStyle = 'rgba(30,32,40,0.6)'; g.fillRect(0, 0, w, h);
        if (!simple) for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(255,255,255,${rnd() * 0.04})`; g.fillRect(rnd() * w, rnd() * h, 2, 2); }
        g.fillStyle = 'rgba(255,200,40,0.5)'; g.fillRect(0, h / 2 - 4, w, 2); g.fillRect(0, h / 2 + 2, w, 2);
        g.fillStyle = 'rgba(255,255,255,0.22)';
        for (const f of [0.28, 0.72]) for (let x = 6; x < w; x += 46) g.fillRect(x, h * f - 1.5, 26, 3);
        g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(0, 4, w, 3); g.fillRect(0, h - 7, w, 3);
        if (!simple) { g.fillStyle = 'rgba(255,255,255,0.14)'; for (let x = w * 0.35; x < w * 0.65; x += 10) g.fillRect(x, h / 2 + 14, 6, 26); }
    } else if (map === 'supply_drop') {
        g.fillStyle = 'rgba(30,70,50,0.22)'; g.fillRect(0, 0, w, h);
        g.strokeStyle = 'rgba(120,230,150,0.12)'; g.lineWidth = 1; g.beginPath();
        for (let y = 0; y < h; y += 14) { g.moveTo(0, y + 0.5); g.lineTo(w, y + 0.5); }
        g.stroke();
        if (!simple) for (const [fx, fy] of [[0.2, 0.3], [0.78, 0.36], [0.3, 0.7], [0.72, 0.66], [0.5, 0.5]]) {
            const x = w * fx - 22, y = h * fy - 22;
            g.strokeStyle = 'rgba(250,204,21,0.38)'; g.lineWidth = 2; g.setLineDash([5, 4]); g.strokeRect(x, y, 44, 44); g.setLineDash([]);
            g.beginPath(); g.moveTo(x + 6, y + 6); g.lineTo(x + 38, y + 38); g.moveTo(x + 38, y + 6); g.lineTo(x + 6, y + 38); g.stroke();
        }
        g.strokeStyle = 'rgba(250,204,21,0.35)'; g.lineWidth = 3; g.strokeRect(4, 4, w - 8, h - 8);
    } else if (map === 'ice_rink') {
        let bg = g.createLinearGradient(0, 0, w, h);
        bg.addColorStop(0, '#a9e4ff'); bg.addColorStop(0.5, '#6fb9e8'); bg.addColorStop(1, '#8fd3f5');
        g.globalAlpha = 0.5; g.fillStyle = bg; g.fillRect(0, 0, w, h); g.globalAlpha = 1;
        // vệt trượt & vết nứt
        g.lineCap = 'round';
        for (let i = 0; i < (simple ? 6 : 26); i++) {
            const x = rnd() * w, y = rnd() * h, len = 30 + rnd() * 90, a = (rnd() - 0.5) * 0.5;
            g.strokeStyle = `rgba(255,255,255,${0.15 + rnd() * 0.3})`; g.lineWidth = 0.8 + rnd() * 1.4;
            g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + len / 2, y + len * a, x + len, y + len * a * 0.4); g.stroke();
        }
        g.strokeStyle = 'rgba(40,110,170,0.35)'; g.lineWidth = 1;
        for (let i = 0; i < (simple ? 2 : 7); i++) {
            let x = rnd() * w, y = rnd() * h; g.beginPath(); g.moveTo(x, y);
            for (let k = 0; k < 4; k++) { x += (rnd() - 0.5) * 40; y += (rnd() - 0.2) * 30; g.lineTo(x, y); }
            g.stroke();
        }
        // vạch băng xanh + vòng giữa sân
        g.strokeStyle = 'rgba(40,110,200,0.55)'; g.lineWidth = 3;
        g.beginPath(); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.stroke();
        g.beginPath(); g.arc(w / 2, h / 2, Math.min(w, h) * 0.14, 0, Math.PI * 2); g.stroke();
        let sh = g.createRadialGradient(w * 0.3, h * 0.25, 0, w * 0.3, h * 0.25, w * 0.8);
        sh.addColorStop(0, 'rgba(255,255,255,0.35)'); sh.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = sh; g.fillRect(0, 0, w, h);
    } else if (map === 'laser_field') {
        g.fillStyle = 'rgba(40,0,70,0.55)'; g.fillRect(0, 0, w, h);
        const cell = 30;
        g.lineWidth = 1; g.strokeStyle = 'rgba(255,43,214,0.22)'; g.beginPath();
        for (let x = 0; x <= w; x += cell) { g.moveTo(x + 0.5, 0); g.lineTo(x + 0.5, h); }
        g.stroke(); g.strokeStyle = 'rgba(0,240,255,0.2)'; g.beginPath();
        for (let y = 0; y <= h; y += cell) { g.moveTo(0, y + 0.5); g.lineTo(w, y + 0.5); }
        g.stroke();
        if (!simple) {
            g.fillStyle = 'rgba(255,120,240,0.7)';
            for (let x = 0; x <= w; x += cell * 3) for (let y = 0; y <= h; y += cell * 3) { g.fillRect(x - 1.5, y - 1.5, 3, 3); }
            g.fillStyle = 'rgba(0,0,0,0.12)';
            for (let y = 0; y < h; y += 4) g.fillRect(0, y, w, 1);
        }
        g.strokeStyle = 'rgba(255,43,214,0.5)'; g.lineWidth = 2;
        g.strokeRect(3, 3, w - 6, h - 6);
    } else if (map === 'wind_hill') {
        let bg = g.createLinearGradient(0, 0, 0, h);
        bg.addColorStop(0, '#3f8f3a'); bg.addColorStop(0.5, '#5fb04a'); bg.addColorStop(1, '#3a8838');
        g.globalAlpha = 0.6; g.fillStyle = bg; g.fillRect(0, 0, w, h); g.globalAlpha = 1;
        // đường đồng mức của ngọn đồi
        for (let k = 1; k <= 5; k++) {
            g.strokeStyle = `rgba(20,80,30,${0.12 + k * 0.03})`; g.lineWidth = 2;
            g.beginPath(); g.ellipse(w * 0.5, h * 0.5, w * (0.12 + k * 0.1), h * (0.05 + k * 0.07), 0, 0, Math.PI * 2); g.stroke();
        }
        let hl = g.createRadialGradient(w * 0.4, h * 0.4, 0, w * 0.4, h * 0.4, w * 0.6);
        hl.addColorStop(0, 'rgba(255,255,170,0.22)'); hl.addColorStop(1, 'rgba(255,255,170,0)');
        g.fillStyle = hl; g.fillRect(0, 0, w, h);
        // cỏ, hoa
        for (let i = 0; i < (simple ? 15 : 130); i++) {
            const x = rnd() * w, y = rnd() * h;
            g.strokeStyle = `rgba(${150 + rnd() * 60 | 0},255,${120 + rnd() * 60 | 0},0.4)`; g.lineWidth = 1.2;
            g.beginPath(); g.moveTo(x, y); g.lineTo(x - 2, y - 6); g.moveTo(x, y); g.lineTo(x + 2.5, y - 5); g.stroke();
        }
        for (let i = 0; i < (simple ? 4 : 22); i++) {
            g.fillStyle = ['#fff6a8', '#ffd1f0', '#ffffff'][i % 3];
            g.beginPath(); g.arc(rnd() * w, rnd() * h, 1.8, 0, Math.PI * 2); g.fill();
        }
    }
}
