// ============================================================
// Khung ĐIỆN ẢNH dùng chung cho các màn kết liễu (CHỈ VẼ, không tạo state):
//   fcLetterbox (2 thanh đen trên/dưới), fcVignette (tối viền), fcRays (tia sáng toả),
//   fcZoomLines (vạch zoom dồn vào tâm), fcBadge (huy hiệu vàng COLLAB ở góc),
//   fcTitle (chữ tiêu đề lớn giữa màn hình, không bị xoay/zoom theo camera).
// Các hàm "màn hình" dùng toạ độ logic canvas.width × canvas.height (bỏ xoay guest / zoom / rung).
// ============================================================
function fcE(t, a, b) { return Math.max(0, Math.min(1, (t - a) / (b - a))); }
function fcOut(k) { return 1 - Math.pow(1 - k, 3); }
function fcRgba(hex, a) {
    const h = hex.replace('#', ''), n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${Math.max(0, Math.min(1, a))})`;
}
function fcScreen() { ctx.setTransform(ctx.canvas.width / canvas.width, 0, 0, ctx.canvas.height / canvas.height, 0, 0); }
// độ mở thanh letterbox theo tick: vào [a0,a1], ra [b0,b1]
function fcBarK(t, a1, b0, b1) { return fcE(t, 0, a1) * (1 - fcE(t, b0, b1)); }
function fcLetterbox(k, col) {
    if (k <= 0) return 0;
    const W = canvas.width, H = canvas.height, h = Math.round(Math.min(16, H * 0.026) * fcOut(k));
    ctx.save(); fcScreen(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.shadowBlur = 0;
    ctx.fillStyle = '#020205'; ctx.fillRect(0, 0, W, h); ctx.fillRect(0, H - h, W, h);
    // bóng mờ nối tiếp thanh (không che xe ở làn sát mép)
    const sh = 34 * k, g1 = ctx.createLinearGradient(0, h, 0, h + sh), g2 = ctx.createLinearGradient(0, H - h, 0, H - h - sh);
    g1.addColorStop(0, 'rgba(2,2,5,0.55)'); g1.addColorStop(1, 'rgba(2,2,5,0)'); g2.addColorStop(0, 'rgba(2,2,5,0.55)'); g2.addColorStop(1, 'rgba(2,2,5,0)');
    ctx.fillStyle = g1; ctx.fillRect(0, h, W, sh); ctx.fillStyle = g2; ctx.fillRect(0, H - h - sh, W, sh);
    const g = ctx.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0, fcRgba(col, 0)); g.addColorStop(0.5, fcRgba(col, 0.95 * k)); g.addColorStop(1, fcRgba(col, 0));
    ctx.fillStyle = g; ctx.fillRect(0, h - 1, W, 1.5); ctx.fillRect(0, H - h - 0.5, W, 1.5);
    ctx.restore();
    return h;
}
function fcVignette(a, col) {
    if (a <= 0) return;
    const W = canvas.width, H = canvas.height;
    ctx.save(); fcScreen(); ctx.globalCompositeOperation = 'source-over'; ctx.shadowBlur = 0;
    const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.25, W / 2, H / 2, Math.hypot(W, H) * 0.6);
    g.addColorStop(0, fcRgba(col || '#000000', 0)); g.addColorStop(1, fcRgba(col || '#000000', a));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
}
// Tia sáng toả từ (x,y) – thế giới; 1 gradient, 1 lần fill cho mọi tia
function fcRays(x, y, n, len, col, a, rot, wid) {
    if (a <= 0 || len <= 1) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.shadowBlur = 0;
    const g = ctx.createRadialGradient(x, y, 0, x, y, len);
    g.addColorStop(0, fcRgba('#ffffff', a)); g.addColorStop(0.25, fcRgba(col, a * 0.7)); g.addColorStop(1, fcRgba(col, 0));
    ctx.fillStyle = g; ctx.beginPath();
    const w = wid || 0.08;
    for (let i = 0; i < n; i++) {
        const an = rot + i / n * Math.PI * 2, ww = w * (0.6 + 0.4 * Math.sin(i * 2.3));
        ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(an - ww) * len, y + Math.sin(an - ww) * len); ctx.lineTo(x + Math.cos(an + ww) * len, y + Math.sin(an + ww) * len); ctx.closePath();
    }
    ctx.fill(); ctx.restore();
}
// Vạch zoom (manga speed lines) dồn vào tâm
function fcZoomLines(x, y, n, r0, r1, col, a, seed, t) {
    if (a <= 0) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.shadowBlur = 0; ctx.strokeStyle = fcRgba(col, a); ctx.lineCap = 'round';
    for (let i = 0; i < n; i++) {
        const r = Math.sin(seed * 9.1 + i * 12.9898 + Math.floor(t / 3) * 3.7) * 43758.5453, q = r - Math.floor(r);
        const an = i / n * Math.PI * 2 + q * 0.2, s0 = r0 + q * (r1 - r0) * 0.45;
        ctx.lineWidth = 0.8 + q * 2.2;
        ctx.beginPath(); ctx.moveTo(x + Math.cos(an) * s0, y + Math.sin(an) * s0); ctx.lineTo(x + Math.cos(an) * r1, y + Math.sin(an) * r1); ctx.stroke();
    }
    ctx.restore();
}
// Huy hiệu COLLAB vàng ở góc trên trái (màn hình) + tên nhân vật
function fcBadge(k, name, col, barH) {
    if (k <= 0) return;
    ctx.save(); fcScreen(); ctx.globalCompositeOperation = 'source-over';
    const e = fcOut(k), x = 10 - (1 - e) * 140, y = 3;
    ctx.globalAlpha = Math.min(1, k * 1.5);
    ctx.font = "900 9px 'Orbitron', Arial"; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    const bw = 58, bh = 16;
    const g = ctx.createLinearGradient(x, y, x, y + bh);
    g.addColorStop(0, '#fef9c3'); g.addColorStop(0.45, '#facc15'); g.addColorStop(1, '#b45309');
    ctx.shadowBlur = 10; ctx.shadowColor = '#facc15'; ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(x + 5, y); ctx.lineTo(x + bw, y); ctx.lineTo(x + bw - 5, y + bh); ctx.lineTo(x, y + bh); ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0; ctx.strokeStyle = '#fff7d6'; ctx.lineWidth = 0.8; ctx.stroke();
    ctx.fillStyle = '#2a1600'; ctx.fillText('✦ COLLAB', x + 6, y + bh / 2 + 0.5);
    ctx.font = "800 10px 'Orbitron', Arial"; ctx.fillStyle = '#f8fafc'; ctx.shadowBlur = 8; ctx.shadowColor = col;
    ctx.fillText(name, x + bw + 6, y + bh / 2 + 0.5);
    ctx.restore();
}
// Chữ tiêu đề điện ảnh giữa màn hình. k: 0..1 xuất hiện; o: { c, c2, y, sub, size }
function fcTitle(t1, t2, k, o) {
    if (k <= 0) return;
    const W = canvas.width, H = canvas.height, c = o.c, c2 = o.c2 || '#ffffff';
    const y = o.y !== undefined ? o.y : H * 0.75, e = fcOut(Math.min(1, k * 1.6));
    ctx.save(); fcScreen(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = Math.min(1, k * 2) * (o.alpha === undefined ? 1 : o.alpha);
    // dải tối mờ phía sau chữ
    const bh = 78, bg = ctx.createLinearGradient(0, 0, W, 0);
    bg.addColorStop(0, 'rgba(0,0,0,0)'); bg.addColorStop(0.5, `rgba(0,0,0,${0.55 * e})`); bg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = bg; ctx.fillRect(0, y - bh / 2, W, bh);
    ctx.translate(W / 2, y);
    const sc = 1 + 0.45 * (1 - e); ctx.scale(sc, sc);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    let fs = o.size || 30;
    ctx.font = `900 ${fs}px 'Orbitron', Arial`;
    const tw = ctx.measureText(t1).width; if (tw > W - 40) { fs = fs * (W - 40) / tw; ctx.font = `900 ${fs}px 'Orbitron', Arial`; }
    const ty = t2 ? -9 : 0;
    const g = ctx.createLinearGradient(0, ty - fs / 2, 0, ty + fs / 2);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.5, c2); g.addColorStop(1, c);
    ctx.lineJoin = 'round'; ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(0,0,0,0.85)'; ctx.strokeText(t1, 0, ty);
    ctx.shadowBlur = 22; ctx.shadowColor = c; ctx.fillStyle = g; ctx.fillText(t1, 0, ty);
    ctx.shadowBlur = 0; ctx.lineWidth = 1; ctx.strokeStyle = fcRgba('#ffffff', 0.6); ctx.strokeText(t1, 0, ty);
    // vệt sáng quét ngang qua chữ
    const sw = o.sw === undefined ? -1 : o.sw, wTxt = Math.min(W - 40, tw);
    if (sw > 0 && sw < 1) {
        const sx = -wTxt / 2 + wTxt * sw, sg = ctx.createLinearGradient(sx - 18, 0, sx + 18, 0);
        sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.5, 'rgba(255,255,255,0.55)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = sg; ctx.fillRect(sx - 18, ty - fs / 2, 36, fs); ctx.globalCompositeOperation = 'source-over';
    }
    if (t2) {
        ctx.font = "800 12px 'Orbitron', Arial";
        if ('letterSpacing' in ctx) ctx.letterSpacing = '3px';
        const w2 = ctx.measureText(t2).width, ly = ty + fs / 2 + 11;
        ctx.fillStyle = c2; ctx.shadowBlur = 10; ctx.shadowColor = c; ctx.fillText(t2, 0, ly);
        if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
        // 2 vạch trang trí 2 bên dòng phụ
        const lw = Math.min(70, (W - w2) / 2 - 20) * e;
        if (lw > 2) {
            ctx.shadowBlur = 6; ctx.fillStyle = c;
            for (const s of [-1, 1]) {
                const x0 = s * (w2 / 2 + 8);
                ctx.beginPath(); ctx.moveTo(x0, ly - 1.2); ctx.lineTo(x0 + s * lw, ly); ctx.lineTo(x0, ly + 1.2); ctx.closePath(); ctx.fill();
                ctx.beginPath(); ctx.arc(x0 + s * 3, ly, 1.6, 0, Math.PI * 2); ctx.fill();
            }
        }
    }
    ctx.restore();
}
