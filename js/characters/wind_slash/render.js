// ==========================================
// Phong Trảm (wind_slash) — Hình ảnh (vẽ xe & UI riêng)
// ==========================================

Object.assign(Player.prototype, {
    // [draw] Phong Trảm
    drawWindSlash() {
        if (this.weapon === 'wind_slash') {
            // Thanh lực ở hàng phụ HUD (vòng 7 ô cạnh xe vẫn ở empower HUD)
            if (this.chargeLevel > 0 && typeof hudExtraBar === 'function')
                hudExtraBar(this, 0, this.chargeLevel / 7, this.chargeLevel >= 6.9 ? '#ff3b3b' : '#facc15', { h: 3, marks: [1 / 7, 2 / 7, 3 / 7, 4 / 7, 5 / 7, 6 / 7] });
        }
    }
});

// ---------- Kết liễu PHONG TRẢM: lưỡi gió khổng lồ quét ngang màn hình ----------
function wsEase(k) { return 1 - Math.pow(1 - Math.max(0, Math.min(1, k)), 3); }
function wsDrawFinisherOver(f) {
    const t = f.t, W = canvas.width, H = canvas.height;
    const tc = TEAM_COLORS[f.team] || TEAM_COLORS[1];
    ctx.save();
    const dark = t < 8 ? t / 8 : (t < 95 ? 1 : Math.max(0, 1 - (t - 95) / 35));
    if (dark > 0) { ctx.fillStyle = `rgba(2, 18, 24, ${0.5 * dark})`; ctx.fillRect(-W, -H, W * 3, H * 3); }
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    // Vệt cuồng phong chạy ngang màn hình
    for (let i = 0; i < 22; i++) {
        const sp = 9 + (i * 7) % 11, len = 60 + (i * 37) % 120;
        const x = ((i * 97 + t * sp) % (W + len * 2)) - len;
        const y = f.y + (((i * 53) % 21) - 10) * 14;
        ctx.globalAlpha = dark * (0.25 + (i % 4) * 0.12);
        ctx.strokeStyle = i % 3 ? '#a7f3d0' : '#ffffff'; ctx.lineWidth = 1 + (i % 3);
        ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + len * 0.5, y - 4, x + len, y); ctx.stroke();
    }
    // Lá bay cuộn theo gió
    for (let i = 0; i < 16; i++) {
        const x = ((i * 61 + t * (6 + i % 5)) % (W + 40)) - 20;
        const y = f.y + Math.sin(t * 0.08 + i) * 40 + ((i * 29) % 13 - 6) * 12;
        ctx.save(); ctx.translate(x, y); ctx.rotate(t * 0.2 + i);
        ctx.globalAlpha = dark * 0.85;
        ctx.fillStyle = i % 2 ? '#4ade80' : '#a7f3d0';
        ctx.beginPath(); ctx.ellipse(0, 0, 5, 2, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }
    // Lưỡi gió trăng khuyết khổng lồ (dựng đứng, quét trái -> phải; KHÔNG xoay)
    if (t < 46) {
        const k = wsEase(t / 40), x = -80 + (W + 200) * k, L = Math.min(H * 0.32, 220), bw = 70;
        const fade = t > 38 ? 1 - (t - 38) / 8 : 1;
        for (let j = 4; j >= 0; j--) { // vệt mờ phía sau
            const xx = x - j * 26;
            ctx.globalAlpha = (j === 0 ? 1 : 0.35 / j) * fade;
            const g = ctx.createLinearGradient(xx - bw, 0, xx + bw, 0);
            g.addColorStop(0, 'rgba(14, 116, 144, 0)'); g.addColorStop(0.6, 'rgba(103, 232, 249, 0.85)'); g.addColorStop(1, '#ffffff');
            ctx.fillStyle = g; ctx.shadowBlur = 24; ctx.shadowColor = '#22d3ee';
            ctx.beginPath();
            ctx.moveTo(xx - 10, f.y - L);
            ctx.quadraticCurveTo(xx + bw * 1.4, f.y, xx - 10, f.y + L);
            ctx.quadraticCurveTo(xx + bw * 0.45, f.y, xx - 10, f.y - L);
            ctx.fill();
        }
        ctx.shadowBlur = 0;
        ctx.globalAlpha = fade; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(x - 8, f.y - L * 0.95); ctx.quadraticCurveTo(x + bw * 1.3, f.y, x - 8, f.y + L * 0.95); ctx.stroke();
    }
    // Vết chém ngang qua nạn nhân + chớp sáng
    if (t >= 18 && t < 90) {
        const op = 1 - (t - 18) / 72;
        ctx.globalAlpha = op;
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4 * op + 1; ctx.shadowBlur = 18; ctx.shadowColor = tc.team;
        const half = W * 0.6 * wsEase(Math.min(1, (t - 18) / 8));
        ctx.beginPath(); ctx.moveTo(f.x - half, f.y + 6); ctx.lineTo(f.x + half, f.y - 6); ctx.stroke();
        ctx.strokeStyle = tc.team; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(f.x - half, f.y + 11); ctx.lineTo(f.x + half, f.y - 1); ctx.stroke();
        ctx.shadowBlur = 0;
        if (t < 26) { ctx.globalAlpha = 0.45 * (1 - (t - 18) / 8); ctx.fillStyle = '#e0fdf4'; ctx.fillRect(-W, -H, W * 3, H * 3); }
    }
    ctx.restore();
    // Chữ
    if (t >= 24 && t < 125) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, (t - 24) / 8) * (t > 108 ? 1 - (t - 108) / 17 : 1);
        ctx.font = "900 22px 'Orbitron', Arial"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.shadowBlur = 18; ctx.shadowColor = '#22d3ee'; ctx.fillStyle = '#ecfeff';
        const ty = Math.max(60, Math.min(H - 60, f.y + (f.team === 1 ? 92 : -88)));
        const sc = 1 + Math.max(0, 1 - (t - 24) / 8) * 0.6;
        ctx.translate(Math.max(130, Math.min(W - 130, f.x)), ty); ctx.scale(sc, sc);
        const s = '風 PHONG TRẢM 風';
        if (typeof drawWorldText === 'function') drawWorldText(ctx, s, 0, 0); else ctx.fillText(s, 0, 0);
        ctx.restore();
    }
}
function wsFxOver() {
    if (typeof bodyEffects === 'undefined') return;
    for (const e of bodyEffects) if (e instanceof WsFinisher && e.active) e.drawOver();
}
