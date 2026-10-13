// ==========================================
// Nền sàn đấu & bóng đổ
// ==========================================



// ==========================================
// --- NỀN SÀN ĐẤU (Cache offscreen để tối ưu hiệu năng) ---
// ==========================================
let arenaFloorCache = null;
function getArenaFloor() {
    let w = canvas.width, h = canvas.height;
    if (arenaFloorCache && arenaFloorCache.width === w && arenaFloorCache.height === h) return arenaFloorCache;
    let off = document.createElement('canvas');
    off.width = w; off.height = h;
    let g = off.getContext('2d');

    // Nền tối dạng vignette
    let bg = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.1, w / 2, h / 2, Math.max(w, h) * 0.75);
    bg.addColorStop(0, '#121a2c');
    bg.addColorStop(1, '#05070c');
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);

    // Lưới neon mờ
    let cell = 34;
    g.lineWidth = 1;
    g.strokeStyle = 'rgba(0, 240, 255, 0.045)';
    g.beginPath();
    for (let x = (w / 2) % cell; x < w; x += cell) { g.moveTo(Math.round(x) + 0.5, 0); g.lineTo(Math.round(x) + 0.5, h); }
    for (let y = (h / 2) % cell; y < h; y += cell) { g.moveTo(0, Math.round(y) + 0.5); g.lineTo(w, Math.round(y) + 0.5); }
    g.stroke();

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
    corner(6, 6, 1, 1); corner(w - 6, 6, -1, 1); corner(6, h - 6, 1, -1); corner(w - 6, h - 6, -1, -1);

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
