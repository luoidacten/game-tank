// ==========================================
// Joker (joker) — Hình ảnh: xe hề ảo thuật neon (mũ hề 3 chóp, mặt nạ, lá bài), lá bài xoay,
// HUD tay bài cạnh xe + nút Bắn, hình nhân, Phán Quyết, kết liễu ALL IN.
// Chỉ đọc state (không tạo state mới) -> an toàn online.
// ==========================================

function jkNow() { return Date.now() / 1000; }

// Biểu tượng chất bài vector (tâm x,y, cỡ r)
function jkGlyph(s, x, y, r, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color || JK_SUIT[s].c;
    ctx.beginPath();
    if (s === 'H') {
        ctx.moveTo(0, r * 0.9);
        ctx.bezierCurveTo(-r * 1.3, -r * 0.1, -r * 0.6, -r * 1.1, 0, -r * 0.35);
        ctx.bezierCurveTo(r * 0.6, -r * 1.1, r * 1.3, -r * 0.1, 0, r * 0.9);
    } else if (s === 'D') {
        ctx.moveTo(0, -r); ctx.lineTo(r * 0.72, 0); ctx.lineTo(0, r); ctx.lineTo(-r * 0.72, 0);
    } else if (s === 'C') {
        ctx.arc(0, -r * 0.45, r * 0.42, 0, Math.PI * 2);
        ctx.moveTo(-r * 0.4 + r * 0.42, r * 0.12); ctx.arc(-r * 0.45, r * 0.12, r * 0.42, 0, Math.PI * 2);
        ctx.moveTo(r * 0.45 + r * 0.42, r * 0.12); ctx.arc(r * 0.45, r * 0.12, r * 0.42, 0, Math.PI * 2);
        ctx.moveTo(-r * 0.15, 0); ctx.lineTo(r * 0.15, 0); ctx.lineTo(r * 0.3, r); ctx.lineTo(-r * 0.3, r);
    } else if (s === 'S') {
        ctx.moveTo(0, -r);
        ctx.bezierCurveTo(r * 1.3, -r * 0.1, r * 0.6, r * 0.8, 0, r * 0.3);
        ctx.bezierCurveTo(-r * 0.6, r * 0.8, -r * 1.3, -r * 0.1, 0, -r);
        ctx.moveTo(-r * 0.12, r * 0.2); ctx.lineTo(r * 0.12, r * 0.2); ctx.lineTo(r * 0.32, r); ctx.lineTo(-r * 0.32, r);
    } else if (s === 'J') {
        // mũ hề 3 chóp + chuông
        ctx.moveTo(-r, r * 0.5); ctx.quadraticCurveTo(-r * 0.9, -r * 0.4, -r * 0.95, -r * 0.8);
        ctx.quadraticCurveTo(-r * 0.4, -r * 0.3, 0, -r); ctx.quadraticCurveTo(r * 0.4, -r * 0.3, r * 0.95, -r * 0.8);
        ctx.quadraticCurveTo(r * 0.9, -r * 0.4, r, r * 0.5); ctx.closePath();
        ctx.fill();
        ctx.fillStyle = JK_GOLD; ctx.beginPath();
        for (const [bx, by] of [[-r * 0.95, -r * 0.8], [0, -r], [r * 0.95, -r * 0.8]]) { ctx.moveTo(bx + r * 0.22, by); ctx.arc(bx, by, r * 0.22, 0, Math.PI * 2); }
        ctx.fillRect(-r, r * 0.35, r * 2, r * 0.3);
    } else {
        ctx.arc(0, 0, r * 0.25, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.restore();
}

function jkCardColor(card) {
    const s = jkSuitOf(card);
    if (s !== 'J') return JK_SUIT[s].c;
    return card[1] === 'R' ? '#f43f5e' : (card[1] === 'B' ? '#c4b5fd' : JK_PURPLE);
}

// Phong cách tay bài SAO CHÉP theo vai trò (Evo 2) — c: chủ đạo, c2: phụ, rgb: cho gradient
const JK_ROLE_FX = {
    'Đối Đầu':   { c: '#ef4444', c2: '#fb923c', rgb: '239, 68, 68',  rgb2: '251, 146, 60', bk: ['#450a0a', '#991b1b', '#1c0303'], k: 'flame' },
    'Kiểm Soát': { c: '#a855f7', c2: '#e879f9', rgb: '168, 85, 247', rgb2: '232, 121, 249', bk: ['#1e0b3a', '#5b21b6', '#0b0618'], k: 'chain' },
    'Cơ Động':   { c: '#22d3ee', c2: '#a5f3fc', rgb: '34, 211, 238', rgb2: '165, 243, 252', bk: ['#042f2e', '#0e7490', '#020617'], k: 'wind' },
    'Sinh Tồn':  { c: '#4ade80', c2: '#fde047', rgb: '74, 222, 128', rgb2: '253, 224, 71', bk: ['#052e16', '#15803d', '#020a05'], k: 'shield' },
};
function jkRoleFx(role) { return role ? JK_ROLE_FX[role] || null : null; }

// Biểu tượng vai trò nhỏ (tâm x,y, cỡ r): lửa / xích / gió / khiên
function jkRoleGlyph(k, x, y, r, col) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = Math.max(0.5, r * 0.28);
    ctx.beginPath();
    if (k === 'flame') {
        ctx.moveTo(0, -r); ctx.quadraticCurveTo(r * 0.9, -r * 0.1, r * 0.55, r * 0.6); ctx.quadraticCurveTo(0, r * 1.05, -r * 0.55, r * 0.6);
        ctx.quadraticCurveTo(-r * 0.9, -r * 0.1, 0, -r); ctx.fill();
    } else if (k === 'chain') {
        ctx.ellipse(-r * 0.38, 0, r * 0.5, r * 0.3, 0.6, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(r * 0.38, 0, r * 0.5, r * 0.3, 0.6, 0, Math.PI * 2); ctx.stroke();
    } else if (k === 'wind') {
        for (let i = -1; i <= 1; i++) { ctx.moveTo(-r, i * r * 0.5); ctx.quadraticCurveTo(0, i * r * 0.5 - r * 0.35, r, i * r * 0.5); }
        ctx.stroke();
    } else {
        ctx.moveTo(0, -r); ctx.lineTo(r * 0.85, -r * 0.55); ctx.lineTo(r * 0.7, r * 0.35); ctx.lineTo(0, r); ctx.lineTo(-r * 0.7, r * 0.35); ctx.lineTo(-r * 0.85, -r * 0.55); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
}
function jkSparkle(x, y, r, col) {
    if (r <= 0.2) return;
    ctx.fillStyle = col; ctx.beginPath();
    ctx.moveTo(x, y - r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.quadraticCurveTo(x, y, x, y + r);
    ctx.quadraticCurveTo(x, y, x - r, y); ctx.quadraticCurveTo(x, y, x, y - r); ctx.fill();
}

// Hào quang sau lá bài (vẽ trước jkCard). dirY: hướng "đuôi" (-1 = lên trên màn hình). k: cường độ 0..1
function jkCardAura(x, y, w, h, role, ace, t, dirY, k) {
    const fx = jkRoleFx(role);
    if (!fx && !ace) return;
    k = k === undefined ? 1 : k;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const R = Math.max(w, h);
    if (fx) {
        const g = ctx.createRadialGradient(x, y, 0, x, y, R * 1.05);
        g.addColorStop(0, `rgba(${fx.rgb}, ${0.42 * k})`); g.addColorStop(1, `rgba(${fx.rgb}, 0)`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, R * 1.05, 0, Math.PI * 2); ctx.fill();
        if (fx.k === 'flame') {
            // lưỡi lửa đỏ-cam liếm theo đuôi
            for (let i = 0; i < 5; i++) {
                const ph = t * 9 + i * 1.7, fl = 0.55 + 0.45 * Math.abs(Math.sin(ph));
                const fx0 = x + (i - 2) * w * 0.22, len = h * (0.55 + 0.35 * fl);
                const gy = ctx.createLinearGradient(fx0, y, fx0, y + dirY * (h * 0.4 + len));
                gy.addColorStop(0, `rgba(253, 224, 71, ${0.85 * k})`); gy.addColorStop(0.4, `rgba(${fx.rgb2}, ${0.7 * k})`); gy.addColorStop(1, `rgba(${fx.rgb}, 0)`);
                ctx.fillStyle = gy; ctx.beginPath();
                ctx.moveTo(fx0 - w * 0.17, y + dirY * h * 0.2);
                ctx.quadraticCurveTo(fx0 + Math.sin(ph) * w * 0.25, y + dirY * (h * 0.4 + len * 0.6), fx0 + Math.sin(ph * 1.3) * w * 0.15, y + dirY * (h * 0.4 + len));
                ctx.quadraticCurveTo(fx0 + w * 0.05, y + dirY * h * 0.6, fx0 + w * 0.17, y + dirY * h * 0.2);
                ctx.fill();
            }
        } else if (fx.k === 'chain') {
            // vòng xích tím xoay + lục giác trận pháp
            ctx.strokeStyle = `rgba(${fx.rgb2}, ${0.9 * k})`; ctx.lineWidth = Math.max(0.5, R * 0.05);
            const rr = R * 0.78, n = 10;
            for (let i = 0; i < n; i++) {
                const a = t * 1.6 + i * Math.PI * 2 / n;
                ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * rr, y + Math.sin(a) * rr, R * 0.12, R * 0.07, a + Math.PI / 2 + (i % 2) * 1.2, 0, Math.PI * 2); ctx.stroke();
            }
            ctx.strokeStyle = `rgba(${fx.rgb}, ${0.55 * k})`; ctx.setLineDash([R * 0.12, R * 0.08]); ctx.lineDashOffset = -t * 20;
            ctx.beginPath();
            for (let i = 0; i <= 6; i++) { const a = -t * 0.9 + i * Math.PI / 3; const px = x + Math.cos(a) * R * 0.98, py = y + Math.sin(a) * R * 0.98; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
            ctx.stroke(); ctx.setLineDash([]);
        } else if (fx.k === 'wind') {
            // vệt gió cyan lượn theo đuôi
            ctx.lineCap = 'round';
            for (let i = 0; i < 4; i++) {
                const ph = t * 7 + i * 1.9, ox = x + (i - 1.5) * w * 0.38, l = h * (0.9 + 0.5 * Math.abs(Math.sin(ph)));
                const gy = ctx.createLinearGradient(ox, y, ox, y + dirY * l * 1.4);
                gy.addColorStop(0, `rgba(${fx.rgb2}, ${0.9 * k})`); gy.addColorStop(1, `rgba(${fx.rgb}, 0)`);
                ctx.strokeStyle = gy; ctx.lineWidth = Math.max(0.6, w * (i % 2 ? 0.08 : 0.13));
                ctx.beginPath(); ctx.moveTo(ox, y + dirY * h * 0.1);
                ctx.bezierCurveTo(ox + Math.sin(ph) * w * 0.5, y + dirY * l * 0.5, ox - Math.sin(ph) * w * 0.5, y + dirY * l, ox + Math.sin(ph * 0.7) * w * 0.3, y + dirY * l * 1.4);
                ctx.stroke();
            }
        } else {
            // khiên lục giác xanh với vệt sáng vàng quét qua
            const rr = R * 0.82;
            ctx.beginPath();
            for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + i * Math.PI / 3; const px = x + Math.cos(a) * rr * 0.85, py = y + Math.sin(a) * rr; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
            ctx.closePath();
            ctx.fillStyle = `rgba(${fx.rgb}, ${0.12 * k})`; ctx.fill();
            ctx.strokeStyle = `rgba(${fx.rgb}, ${0.85 * k})`; ctx.lineWidth = Math.max(0.6, R * 0.06); ctx.stroke();
            ctx.save(); ctx.clip();
            const sw = ((t * 0.8) % 1) * rr * 4 - rr * 2;
            const gs = ctx.createLinearGradient(x + sw - rr * 0.4, y - rr, x + sw + rr * 0.4, y + rr);
            gs.addColorStop(0, 'rgba(253, 224, 71, 0)'); gs.addColorStop(0.5, `rgba(253, 224, 71, ${0.7 * k})`); gs.addColorStop(1, 'rgba(253, 224, 71, 0)');
            ctx.fillStyle = gs; ctx.fillRect(x - rr, y - rr, rr * 2, rr * 2);
            ctx.restore();
        }
    }
    if (ace) {
        // Lá Bài A: tia sáng vàng-trắng xoay + lấp lánh 4 cánh
        ctx.save(); ctx.translate(x, y); ctx.rotate(t * 1.2);
        for (let i = 0; i < 8; i++) {
            ctx.rotate(Math.PI / 4);
            const gr = ctx.createLinearGradient(0, 0, 0, -R * 1.2);
            gr.addColorStop(0, `rgba(255, 251, 235, ${0.5 * k})`); gr.addColorStop(1, 'rgba(253, 224, 71, 0)');
            ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(-R * 0.07, 0); ctx.lineTo(0, -R * (i % 2 ? 0.9 : 1.25)); ctx.lineTo(R * 0.07, 0); ctx.fill();
        }
        ctx.restore();
        for (let i = 0; i < 3; i++) {
            const a = t * 2.3 + i * 2.1, tw = Math.max(0, Math.sin(t * 6 + i * 2));
            jkSparkle(x + Math.cos(a) * R * 0.75, y + Math.sin(a) * R * 0.75, R * 0.22 * tw, `rgba(255, 255, 255, ${k})`);
        }
    }
    ctx.restore();
}

// Lá bài (tâm x,y; w,h; rot; sx = co giãn ngang để xoay lật; fx = {role, ace} kiểu tay bài)
function jkCard(x, y, w, h, rot, sx, card, alpha = 1, glow = 8, fx) {
    const s = jkSuitOf(card), J = s === 'J', col = jkCardColor(card);
    const rf = fx ? jkRoleFx(fx.role) : null, ace = !!(fx && fx.ace);
    ctx.save();
    ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sx || 1, 1);
    ctx.globalAlpha *= alpha;
    ctx.shadowBlur = glow * (rf || ace ? 1.6 : 1); ctx.shadowColor = ace ? JK_GOLD : (rf ? rf.c : col);
    const back = (sx || 1) < 0;
    const rad = Math.min(w, h) * 0.18;
    const path = () => { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(-w / 2, -h / 2, w, h, rad); else ctx.rect(-w / 2, -h / 2, w, h); };
    let face = '#f8fafc';
    if (J) { face = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2); face.addColorStop(0, '#1e0b3a'); face.addColorStop(0.5, card[1] === 'R' ? '#4c0519' : '#2e1065'); face.addColorStop(1, '#0b0618'); }
    else if (ace) { face = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2); face.addColorStop(0, '#fffbeb'); face.addColorStop(0.5, '#fef3c7'); face.addColorStop(1, '#fcd34d'); }
    else if (rf) { face = ctx.createLinearGradient(0, -h / 2, 0, h / 2); face.addColorStop(0, '#ffffff'); face.addColorStop(1, `rgba(${rf.rgb}, 0.45)`); }
    let bk = '#3b0764';
    if (back && rf) { bk = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2); bk.addColorStop(0, rf.bk[0]); bk.addColorStop(0.5, rf.bk[1]); bk.addColorStop(1, rf.bk[2]); }
    else if (back && ace) { bk = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2); bk.addColorStop(0, '#78350f'); bk.addColorStop(0.5, '#b45309'); bk.addColorStop(1, '#451a03'); }
    ctx.fillStyle = back ? bk : face;
    path(); ctx.fill();
    ctx.shadowBlur = 0;
    // viền: vai trò -> viền dày màu vai trò; A -> viền lá vàng óng ánh chạy sáng
    if (ace) {
        const fg = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2), sh = 0.15 + ((jkNow() * 0.7) % 1) * 0.7;
        fg.addColorStop(0, '#b45309'); fg.addColorStop(sh - 0.15, '#fde047'); fg.addColorStop(sh, '#ffffff'); fg.addColorStop(sh + 0.15, '#fde047'); fg.addColorStop(1, '#b45309');
        ctx.strokeStyle = fg; ctx.lineWidth = Math.max(0.8, w * 0.13); path(); ctx.stroke();
    } else if (rf) {
        ctx.strokeStyle = rf.c; ctx.lineWidth = Math.max(0.8, w * 0.13); path(); ctx.stroke();
    } else {
        ctx.strokeStyle = J ? JK_GOLD : col; ctx.lineWidth = Math.max(0.6, w * 0.08); path(); ctx.stroke();
    }
    if ((rf || ace) && w >= 7) {   // viền trong mảnh
        ctx.strokeStyle = ace ? 'rgba(180, 83, 9, 0.8)' : rf.c2; ctx.lineWidth = Math.max(0.35, w * 0.035);
        const iw = w * 0.74, ih = h * 0.78;
        ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(-iw / 2, -ih / 2, iw, ih, rad * 0.6); else ctx.rect(-iw / 2, -ih / 2, iw, ih); ctx.stroke();
    }
    if (back) {
        const bc = rf ? rf.c2 : (ace ? '#fffbeb' : JK_GOLD);
        ctx.strokeStyle = rf ? `rgba(${rf.rgb2}, 0.7)` : 'rgba(253, 224, 71, 0.6)'; ctx.lineWidth = Math.max(0.4, w * 0.05);
        ctx.strokeRect(-w * 0.32, -h * 0.34, w * 0.64, h * 0.68);
        if (rf) jkRoleGlyph(rf.k, 0, 0, Math.min(w, h) * 0.24, bc); else jkGlyph('D', 0, 0, Math.min(w, h) * 0.22, bc);
    } else {
        jkGlyph(s, 0, 0, Math.min(w * 0.36, h * 0.3), J ? col : undefined);
        if (w >= 14 && !J) { jkGlyph(s, -w * 0.3, -h * 0.34, w * 0.1); jkGlyph(s, w * 0.3, h * 0.34, w * 0.1); }
        if (rf && w >= 9) jkRoleGlyph(rf.k, w * 0.27, -h * 0.3, Math.min(w, h) * 0.13, rf.c);
        if (ace && w >= 8) {
            ctx.font = `900 ${Math.max(3, h * 0.3)}px 'Orbitron', Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillStyle = '#b45309'; ctx.fillText('A', -w * 0.27, -h * 0.29);
        }
    }
    // vệt bóng loáng chéo (holo) cho A & tay sao chép
    if (rf || ace) {
        ctx.save(); path(); ctx.clip();
        const sw = (((jkNow() * (ace ? 0.9 : 0.6)) + (x + y) * 0.003) % 1) * (w + h) * 1.6 - (w + h) * 0.8;
        const gs = ctx.createLinearGradient(sw - w * 0.4, -h / 2, sw + w * 0.4, h / 2);
        gs.addColorStop(0, 'rgba(255,255,255,0)'); gs.addColorStop(0.5, ace ? 'rgba(255,255,255,0.75)' : `rgba(${rf.rgb2}, 0.45)`); gs.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = gs; ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.restore();
    }
    ctx.restore();
}

// ---------- Xe ----------
registerTankArt('joker', (p, k) => {
    const t = k.t;
    const inv = (p.jkInvis || 0) > 0;
    if (inv) ctx.globalAlpha *= 0.35;
    const accent = k.full ? JK_GOLD : (k.evo2 ? JK_PINK : JK_PURPLE);
    // bánh xích tím đậm
    TA.treads(-14, 4, -10, 12, t, '#140a24', '#4c1d95');
    // thân: hình thoi lá bài (lớp ngoài) + viền team
    ctx.fillStyle = TA.vgrad(-13, 13, '#2e1065', '#0b0618');
    ctx.beginPath(); ctx.moveTo(0, -13.5); ctx.lineTo(10.5, -2); ctx.lineTo(9, 9); ctx.lineTo(0, 13); ctx.lineTo(-9, 9); ctx.lineTo(-10.5, -2); ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = k.team; ctx.lineWidth = 0.9; TA.glow(k.teamGlow, 6); ctx.stroke(); TA.noGlow();
    // ô quả trám đen/tím kiểu áo hề
    ctx.fillStyle = 'rgba(168, 85, 247, 0.35)';
    for (const [dx, dy] of [[-5.5, 3], [5.5, 3], [0, 8]]) {
        ctx.beginPath(); ctx.moveTo(dx, dy - 3); ctx.lineTo(dx + 2.4, dy); ctx.lineTo(dx, dy + 3); ctx.lineTo(dx - 2.4, dy); ctx.closePath(); ctx.fill();
    }
    // quạt bài phía trước (nòng = 3 lá bài xoè)
    const fan = (p.jkThrowFx || 0) > 0 ? 0.55 : 0.35;
    ['S', 'H', 'J'].forEach((s, i) => {
        const ii = [-1, 1, 0][i];
        ctx.save(); ctx.translate(0, -4); ctx.rotate(ii * fan);
        jkCard(0, -8.5, 7, 10, 0, 1, s, 1, 5);
        ctx.restore();
    });
    // mặt nạ hề
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath(); ctx.arc(0, 1, 5.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0b0618';
    ctx.beginPath(); ctx.moveTo(-4, -0.2); ctx.lineTo(-1.2, 0.6); ctx.lineTo(-3.6, 2); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(4, -0.2); ctx.lineTo(1.2, 0.6); ctx.lineTo(3.6, 2); ctx.closePath(); ctx.fill();
    // nụ cười đỏ
    ctx.strokeStyle = '#f43f5e'; ctx.lineWidth = 0.9; TA.glow('#f43f5e', 4);
    ctx.beginPath(); ctx.arc(0, 2.6, 2.6, 0.25, Math.PI - 0.25); ctx.stroke(); TA.noGlow();
    // ngôi sao má
    ctx.fillStyle = accent; ctx.fillRect(2.9, 3.4, 1, 1);
    // mũ hề 3 chóp phía sau (đong đưa)
    const sw = Math.sin(t * 4) * 0.8;
    const hatC = ['#7c3aed', '#f43f5e', '#7c3aed'];
    [[-1, -9.5], [0, 0], [1, 9.5]].forEach(([i, hx], j) => {
        ctx.fillStyle = hatC[j];
        ctx.beginPath(); ctx.moveTo(hx * 0.35 - 3, 5); ctx.lineTo(hx * 0.35 + 3, 5);
        const tx = hx + sw * (i || 0.5), ty = 13.5 - Math.abs(i) * 2;
        ctx.lineTo(tx, ty); ctx.closePath(); ctx.fill();
        ctx.fillStyle = JK_GOLD; TA.glow(JK_GOLD, 5);
        ctx.beginPath(); ctx.arc(tx, ty, 1.3, 0, Math.PI * 2); ctx.fill(); TA.noGlow();
    });
    // Evo: vòng sao quanh mặt nạ
    if (k.evo1 || k.evo2) {
        ctx.strokeStyle = accent; ctx.lineWidth = 0.5; ctx.globalAlpha *= 0.7;
        ctx.setLineDash([1.2, 2]); ctx.beginPath(); ctx.arc(0, 1, 7.8, t * 2, t * 2 + Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    }
});

// ---------- Đạn lá bài ----------
function jkDrawBullet(b) {
    const x = b.x + b.w / 2, y = b.y + b.h / 2, t = jkNow();
    const card = b.jk + (b.jkV || ''), J = b.jk === 'J';
    const rf = jkRoleFx(b.jkCopy), ace = !!b.jkAce;
    const vy = b.vy || 0, tail = vy < 0 ? 1 : -1;   // đuôi ngược hướng bay
    ctx.save();
    // vệt sáng
    const col = ace ? JK_GOLD : (rf ? rf.c : jkCardColor(card));
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = col; ctx.globalAlpha = 0.45; ctx.lineWidth = J ? 5 : (rf || ace ? 4.5 : 3);
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - (b.vx || 0) * 3, y - vy * 3); ctx.stroke();
    if (rf || ace) {
        // đuôi theo vai trò: tàn lửa / mắt xích / sợi gió / bọt khiên ; A: bụi vàng lấp lánh
        for (let i = 1; i <= 5; i++) {
            const k = 1 - i / 6;
            const px = x - (b.vx || 0) * i * 1.4 + Math.sin((b.jkT || 0) * 0.5 + i * 1.3) * 2.2 * (rf && rf.k === 'flame' ? 1 : 0.4), py = y - vy * i * 1.4;
            ctx.globalAlpha = 0.75 * k;
            if (ace) jkSparkle(px + (i % 2 ? 3 : -3), py, 2.6 * k + 0.6, i % 2 ? '#fffbeb' : JK_GOLD);
            if (rf) {
                ctx.fillStyle = i % 2 ? rf.c : rf.c2; ctx.strokeStyle = ctx.fillStyle;
                if (rf.k === 'chain') { ctx.lineWidth = 0.9; ctx.beginPath(); ctx.ellipse(px, py, 2.2 * k + 0.8, 1.3 * k + 0.5, i % 2 ? 0 : Math.PI / 2, 0, Math.PI * 2); ctx.stroke(); }
                else if (rf.k === 'shield') { ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(px, py, 2.4 * k + 0.6, 0, Math.PI * 2); ctx.stroke(); }
                else { ctx.beginPath(); ctx.arc(px, py, (rf.k === 'flame' ? 2.4 : 1.4) * k + 0.5, 0, Math.PI * 2); ctx.fill(); }
            }
        }
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    const W = J ? 13 : 10, H = J ? 18 : 14;
    if (rf || ace) jkCardAura(x, y, W * 1.5, H * 1.4, b.jkCopy, ace, t + (b.jkPh || 0), tail, 1);
    const rot = (b.jkT || 0) * (J ? 0.5 : 0.32) * (vy < 0 ? 1 : -1);
    const sx = J ? Math.cos(t * 14) : 1;
    jkCard(x, y, W, H, rot, Math.abs(sx) < 0.15 ? 0.15 * Math.sign(sx || 1) : sx, card, 1, J ? 16 : 8, (rf || ace) ? { role: b.jkCopy, ace } : null);
    ctx.restore();
}

// ---------- Entities ----------
function jkArtAt(owner, x, y, size, alpha) {
    const fn = TANK_ART.joker;
    if (!fn) return;
    const tc = TEAM_COLORS[owner.id] || TEAM_COLORS[1];
    const s = size / 32;
    const k = Object.assign({ t: jkNow(), s }, tc, tankArtEvoState(owner));
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(x, y); ctx.scale(s, owner.id === 1 ? s : -s);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    try { fn({ id: owner.id }, k); } catch (e) { /* bỏ qua */ }
    ctx.restore();
}
function jkDrawDecoy(d) {
    const cx = d.x + d.w / 2, cy = d.y + d.h / 2, t = jkNow();
    ctx.save();
    if (d.pop > 0) {
        const k = 1 - d.pop / 24;
        for (let i = 0; i < 8; i++) {
            const a = i * Math.PI / 4 + k;
            jkCard(cx + Math.cos(a) * 40 * k, cy + Math.sin(a) * 30 * k, 8, 11, a + k * 6, 1, i % 2 ? 'J' : 'S', 1 - k, 6);
        }
        ctx.restore(); return;
    }
    jkArtAt(d.owner, cx, cy, d.w * 1.15, 0.55 + 0.15 * Math.sin(t * 9));
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.7)'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.lineDashOffset = t * 20;
    ctx.beginPath(); ctx.arc(cx, cy, d.w * 0.8, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
}
// Phân Ảnh Bài (copy Cơ Động ♣): bóng hồng nhấp nháy + thanh máu; khi cảm tử -> vệt lao
function jkDrawPhantom(f) {
    const cx = f.x + f.w / 2, cy = f.y + f.h / 2, t = jkNow();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.shadowColor = JK_PINK; ctx.shadowBlur = 12;
    jkArtAt(f.owner, cx, cy, f.w * 1.1, (f.state ? 0.75 : 0.4 + 0.15 * Math.sin(t * 12)));
    ctx.globalCompositeOperation = 'source-over'; ctx.shadowBlur = 0;
    if (f.state) {
        for (let i = 0; i < 3; i++) jkCard(cx + Math.cos(t * 20 + i * 2.1) * 9, cy + Math.sin(t * 20 + i * 2.1) * 9, 6, 8, t * 10 + i, 1, ['C', 'J', 'S'][i], 0.9, 6);
    } else {
        ctx.strokeStyle = 'rgba(244, 114, 182, 0.8)'; ctx.lineWidth = 1; ctx.setLineDash([2, 3]); ctx.lineDashOffset = -t * 25;
        ctx.beginPath(); ctx.arc(cx, cy, f.w * 0.75, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
        const k = Math.max(0, f.hp / (f.maxHp || 1)), bw = f.w;
        ctx.fillStyle = 'rgba(4,8,18,0.8)'; ctx.fillRect(cx - bw / 2, cy + f.h * 0.75, bw, 3);
        ctx.fillStyle = JK_PINK; ctx.fillRect(cx - bw / 2, cy + f.h * 0.75, bw * k, 3);
        ctx.fillStyle = 'rgba(253, 224, 71, 0.8)'; ctx.fillRect(cx - bw / 2, cy + f.h * 0.75 + 3, bw * Math.max(0, f.life / 120), 1);
    }
    ctx.restore();
}
function jkDrawEscapeFx(f) {
    const t = f.t;
    ctx.save();
    if (t < 34) {           // lá Joker xoay đúng 1 vòng
        const k = t / 34, a = k * Math.PI * 2;
        const sc = 1 + Math.sin(k * Math.PI) * 0.4;
        jkCard(f.x, f.y - (f.team === 1 ? 1 : -1) * 8, 22 * sc, 32 * sc, 0, Math.cos(a), 'J', 1, 18);
    } else {                // Joker hiện ra
        const k = (t - 34) / (f.dur - 34);
        ctx.globalAlpha = 1 - k;
        ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 50);
        g.addColorStop(0, 'rgba(253, 224, 71, 0.6)'); g.addColorStop(1, 'rgba(168, 85, 247, 0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x, f.y, 50 * (0.6 + k), 0, Math.PI * 2); ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        jkGlyph('J', f.x, f.y - (f.team === 1 ? 30 : -30), 12 + 6 * k, JK_PURPLE);
        ctx.font = "bold 11px 'Orbitron', Arial"; ctx.textAlign = 'center'; ctx.fillStyle = JK_GOLD;
        ctx.shadowBlur = 8; ctx.shadowColor = JK_PURPLE;
        ctx.fillText('JOKER!', f.x, f.y + (f.team === 1 ? -48 : 56));
    }
    ctx.restore();
}
function jkDrawZone(z) {
    const t = jkNow(), a = Math.min(1, z.life / 20);
    const col = z.kind === 'silence' ? '196, 181, 253' : (z.dot ? '103, 232, 249' : (z.bleed ? '244, 63, 94' : '244, 114, 182'));
    ctx.save();
    ctx.globalAlpha = a;
    zoneRectPath(z.x, z.y, z.r);
    ctx.fillStyle = `rgba(${col}, 0.14)`; ctx.fill();
    ctx.strokeStyle = `rgba(${col}, 0.8)`; ctx.lineWidth = 1.2; ctx.setLineDash([5, 4]); ctx.lineDashOffset = -t * 20; ctx.stroke(); ctx.setLineDash([]);
    for (let i = 0; i < 4; i++) {
        const ax = z.x + Math.cos(t * 1.5 + i * 1.57) * z.r * 0.9, ay = z.y + Math.sin(t * 1.5 + i * 1.57) * z.r * 0.5;
        jkGlyph(z.kind === 'silence' ? 'J' : ['H', 'D', 'C', 'S'][i], ax, ay, 4, `rgba(${col}, 0.9)`);
    }
    ctx.restore();
}
// PHÁN QUYẾT: lá Joker khổng lồ hiện trên đầu địch, lật mặt + 5 sao đếm ngược -> nổ SHOWDOWN! & mảnh bài
function jkVerdictPos(v) { return { cx: v.x, cy: v.y + (v.tid === 1 ? -50 : 50) }; }
function jkDrawVerdict(v) {
    const t = v.t, { cx, cy } = jkVerdictPos(v);
    ctx.save();
    // chùm sáng nối lá bài xuống xe địch
    const bk = t < v.hitT ? Math.min(1, t / 10) : Math.max(0, 1 - (t - v.hitT) / 30);
    if (bk > 0) {
        ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createLinearGradient(cx, cy, cx, v.y);
        g.addColorStop(0, `rgba(253, 224, 71, ${0.55 * bk})`); g.addColorStop(1, `rgba(168, 85, 247, ${0.25 * bk})`);
        ctx.fillStyle = g; ctx.fillRect(cx - 9, Math.min(cy, v.y), 18, Math.abs(v.y - cy));
        ctx.globalCompositeOperation = 'source-over';
    }
    if (t < v.hitT) {
        const k = t / v.hitT, e = jkEase(Math.min(1, t / 14));
        ctx.globalCompositeOperation = 'lighter';
        const hg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 64);
        hg.addColorStop(0, `rgba(253, 224, 71, ${0.45 * e})`); hg.addColorStop(0.6, `rgba(168, 85, 247, ${0.25 * e})`); hg.addColorStop(1, 'rgba(168, 85, 247, 0)');
        ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(cx, cy, 64, 0, Math.PI * 2); ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        // 5 sao lấp lánh đếm ngược quanh lá
        for (let i = 0; i < 5; i++) {
            const a = -Math.PI / 2 + i * Math.PI * 2 / 5 + t * 0.12, on = k * 5 > i;
            ctx.globalAlpha = on ? 1 : 0.3;
            jkSparkle(cx + Math.cos(a) * 40, cy + Math.sin(a) * 40, on ? 5 + Math.sin(t * 0.6 + i) * 1.5 : 2.5, on ? '#fffbeb' : JK_PURPLE);
        }
        ctx.globalAlpha = 1;
        ctx.strokeStyle = JK_GOLD; ctx.lineWidth = 2.5; ctx.shadowColor = JK_GOLD; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(cx, cy, 46, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); ctx.stroke(); ctx.shadowBlur = 0;
        // lá bài rơi xuống & lật 1.5 vòng (mặt sau -> mặt Joker)
        const sx = Math.cos((1 - jkEase(k)) * Math.PI * 3);
        const sc = 1.6 - 0.6 * e;
        jkCard(cx, cy, 36 * sc, 50 * sc, v.tid === 1 ? 0 : Math.PI, Math.abs(sx) < 0.06 ? 0.06 * Math.sign(sx || 1) : sx, 'JR', e, 24, { ace: true });
    } else {
        const k = (t - v.hitT) / (v.dur - v.hitT), e = jkEase(Math.min(1, k * 1.6));
        ctx.globalCompositeOperation = 'lighter';
        if (k < 0.25) {
            const f = 1 - k / 0.25;
            const fg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 110);
            fg.addColorStop(0, `rgba(255, 255, 255, ${0.9 * f})`); fg.addColorStop(0.4, `rgba(253, 224, 71, ${0.5 * f})`); fg.addColorStop(1, 'rgba(168, 85, 247, 0)');
            ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(cx, cy, 110, 0, Math.PI * 2); ctx.fill();
        }
        for (let r = 0; r < 2; r++) {
            ctx.strokeStyle = r ? `rgba(168, 85, 247, ${0.8 * (1 - k)})` : `rgba(253, 224, 71, ${0.9 * (1 - k)})`;
            ctx.lineWidth = 3 - r;
            ctx.beginPath(); ctx.arc(cx, cy, 20 + (130 - r * 40) * e, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.globalCompositeOperation = 'source-over';
        // mảnh lá bài văng tứ phía
        const suits = ['H', 'D', 'C', 'S', 'J'];
        for (let i = 0; i < 18; i++) {
            const a = v.seed + i * Math.PI * 2 / 18, d = 10 + (70 + (i % 3) * 28) * e;
            jkCard(cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.85, 9 - (i % 3) * 1.5, 12 - (i % 3) * 2, a + t * 0.3 * (i % 2 ? 1 : -1), Math.cos(t * 0.4 + i), suits[i % 5], 1 - k, 8, i % 4 === 0 ? { ace: true } : null);
        }
    }
    ctx.restore();
}
// Chữ SHOWDOWN! vẽ trên cùng
function jkDrawVerdictOver(v) {
    const t = v.t;
    if (t < v.hitT - 2) return;
    const k = (t - v.hitT + 2) / (v.dur - v.hitT + 2);
    const W = canvas.width, H = canvas.height, pos = jkVerdictPos(v);
    const sc = 1 + Math.max(0, 1 - k * 6) * 0.8;
    ctx.save();
    ctx.font = "900 26px 'Orbitron', Arial";
    const hw = Math.min(W / 2 - 4, ctx.measureText('SHOWDOWN!').width * sc / 2 + 6);
    const y = Math.max(50, Math.min(H - 50, pos.cy)), x = Math.max(hw, Math.min(W - hw, pos.cx));
    ctx.globalAlpha = k > 0.75 ? Math.max(0, 1 - (k - 0.75) / 0.25) : 1;
    ctx.translate(x, y);
    if (typeof hudTextFlip === 'function' && v.owner && hudTextFlip(v.owner)) ctx.rotate(Math.PI);
    ctx.scale(Math.min(sc, (W - 8) / (hw * 2) * sc), Math.min(sc, (W - 8) / (hw * 2) * sc));
    ctx.font = "900 26px 'Orbitron', Arial"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const g = ctx.createLinearGradient(0, -14, 0, 14);
    g.addColorStop(0, '#fffbeb'); g.addColorStop(0.5, JK_GOLD); g.addColorStop(1, '#f59e0b');
    ctx.lineWidth = 4; ctx.strokeStyle = '#3b0764'; ctx.shadowColor = JK_PURPLE; ctx.shadowBlur = 18;
    ctx.strokeText('SHOWDOWN!', 0, 0);
    ctx.fillStyle = g; ctx.fillText('SHOWDOWN!', 0, 0);
    ctx.shadowBlur = 0;
    ctx.font = "800 10px 'Orbitron', Arial"; ctx.fillStyle = JK_PINK;
    ctx.fillText('-50% HP · XÓA KHIÊN & BUFF', 0, 20);
    ctx.restore();
}

// ---------- Kết liễu ALL IN ----------
function jkEase(k) { return 1 - Math.pow(1 - k, 3); }
function jkDrawFinisher(f) {
    if (f.t > 100) return;
    ctx.save();
    const k = f.t / 100;
    ctx.strokeStyle = `rgba(168, 85, 247, ${0.6 * (1 - k)})`; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(f.x, f.y, 20 + 120 * jkEase(k), 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
}
function jkDrawFinisherOver(f) {
    const t = f.t, W = canvas.width, H = canvas.height;
    ctx.save();
    const dark = t < 8 ? t / 8 : (t < 70 ? 1 : Math.max(0, 1 - (t - 70) / 30));
    if (dark > 0) { ctx.fillStyle = `rgba(10, 2, 24, ${0.55 * dark})`; ctx.fillRect(-W, -H, W * 3, H * 3); }
    // bài nổ tung tứ phía
    if (t < 100) {
        const k = jkEase(Math.min(1, t / 50)), fade = t > 70 ? 1 - (t - 70) / 30 : 1;
        const suits = ['H', 'D', 'C', 'S'];
        for (let i = 0; i < 20; i++) {
            const a = f.seed + i * (Math.PI * 2 / 20), d = 14 + (110 + (i % 4) * 22) * k;
            jkCard(f.x + Math.cos(a) * d, f.y + Math.sin(a) * d * 0.8, 11, 15, a + t * 0.2 * (i % 2 ? 1 : -1), Math.cos(t * 0.3 + i), i % 5 === 0 ? 'J' : suits[i % 4], fade, 8);
        }
    }
    // lá Joker khổng lồ lật mặt
    if (t >= 10 && t < 105) {
        const k = Math.min(1, (t - 10) / 26);
        const sx = Math.cos((1 - jkEase(k)) * Math.PI * 2);
        const fade = t > 85 ? 1 - (t - 85) / 20 : 1;
        const sc = 0.6 + 0.4 * jkEase(k);
        ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 110);
        g.addColorStop(0, `rgba(253, 224, 71, ${0.35 * fade})`); g.addColorStop(1, 'rgba(168, 85, 247, 0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x, f.y, 110, 0, Math.PI * 2); ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        jkCard(f.x, f.y, 70 * sc, 100 * sc, f.team === 1 ? 0 : Math.PI, Math.abs(sx) < 0.05 ? 0.05 : sx, 'JR', fade, 26);
    }
    ctx.restore();
    if (t >= 30 && t < 115) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, (t - 30) / 8) * (t > 95 ? 1 - (t - 95) / 20 : 1);
        ctx.font = "900 24px 'Orbitron', Arial"; ctx.textAlign = 'center';
        ctx.shadowBlur = 18; ctx.shadowColor = JK_PURPLE; ctx.fillStyle = JK_GOLD;
        const ty = Math.max(60, Math.min(H - 60, f.y + (f.team === 1 ? 84 : -76)));
        const sc = 1 + Math.max(0, 1 - (t - 30) / 8) * 0.5;
        ctx.translate(W / 2, ty); ctx.scale(sc, sc);
        if (typeof drawWorldText === 'function') drawWorldText(ctx, '♠ ALL IN ♠', 0, 0); else ctx.fillText('♠ ALL IN ♠', 0, 0);
        ctx.restore();
    }
}
function jkFxOver() {
    if (typeof bodyEffects === 'undefined') return;
    for (const e of bodyEffects) if ((e instanceof JkFinisher || e instanceof JkVerdict) && e.active) e.drawOver();
}

// ---------- Quanh xe + HUD ----------
Object.assign(CharHooks.registry.joker, {
    draw() {
        const cx = this.x + this.w / 2, cy = this.y + this.h / 2, t = jkNow();
        ctx.save();
        // giữ nút: vòng Tráo Bài
        const h = this.jkHold || 0;
        if (h > 5 && !this.jkHoldUsed) {
            ctx.strokeStyle = this.jkSwapCd > 0 ? '#64748b' : JK_GOLD; ctx.shadowColor = JK_GOLD; ctx.shadowBlur = 8; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(cx, cy, this.w * 0.85, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, h / JK_HOLD)); ctx.stroke();
        }
        if (this.jkSwapFx > 0) {
            const a = this.jkSwapFx / 20;
            for (let i = 0; i < 3; i++) jkCard(cx + Math.cos(t * 8 + i * 2.1) * this.w * (1.3 - a * 0.5), cy + Math.sin(t * 8 + i * 2.1) * this.h * 0.8, 7, 10, t * 6 + i, 1, ['H', 'J', 'S'][i], a, 6);
        }
        // bất tử sau Thoát Hiểm: vòng bài xoay
        if ((this.invincibleTimer || 0) > 10 && (this.jkEsc || 0) >= 0 && this.jkInvis <= 0) {
            ctx.strokeStyle = 'rgba(168, 85, 247, 0.55)'; ctx.lineWidth = 1.2; ctx.setLineDash([4, 3]); ctx.lineDashOffset = t * 30;
            ctx.beginPath(); ctx.arc(cx, cy, this.w * 0.95, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
        }
        // Tay bài sao chép: hào quang theo vai trò quanh xe
        if (this.jkCopy && jkRoleFx(this.jkCopy)) jkCardAura(cx, cy, this.w * 0.7, this.h * 0.7, this.jkCopy, false, t, this.id === 1 ? 1 : -1, 0.55);
        // Phán Quyết đang tích lũy: vòng 5 sao vàng quanh xe (Full Evo)
        if (jkFull(this) && (this.jokerHitCount || 0) > 0 && !(this.jkVerdictCd > 0)) {
            const n = this.jokerHitCount || 0;
            for (let i = 0; i < JK_VERDICT_HITS; i++) {
                const a = -Math.PI / 2 + i * Math.PI * 2 / JK_VERDICT_HITS + t * 0.8;
                ctx.globalAlpha = i < n ? 1 : 0.25;
                jkSparkle(cx + Math.cos(a) * this.w * 0.95, cy + Math.sin(a) * this.w * 0.95, i < n ? 3.2 : 2, i < n ? JK_GOLD : '#94a3b8');
            }
            ctx.globalAlpha = 1;
        }
        ctx.restore();
    },
    drawUI() {
        if (typeof hudFrame !== 'function') return;
        const F = hudFrame(this);
        const d0 = 12; // = hudRowY(p, 'extra')
        const hand = this.jkHand || [], max = jkHandMax(this);
        const cw = max > 5 ? 5 : 6.5, ch = max > 5 ? 7 : 8.5, gap = 1;
        const total = max * cw + (max - 1) * gap, bx = -total / 2;
        ctx.save();
        if (this.jkReload > 0) {
            const k = 1 - this.jkReload / jkReloadMax(this);
            ctx.fillStyle = 'rgba(4, 8, 18, 0.88)'; hudFill(F, bx - 1, d0 - 1, total + 2, 5);
            ctx.fillStyle = JK_PURPLE; ctx.shadowBlur = 6; ctx.shadowColor = JK_PURPLE;
            hudFill(F, bx, d0, total * k, 3); ctx.shadowBlur = 0;
        } else {
            const rf = jkRoleFx(this.jkCopy);
            if (rf) {   // khay bài sáng màu vai trò + biểu tượng
                const pr = hudRect(F, bx - 2, d0 - 1.5, total + 4, ch + 3), t = jkNow();
                const gp = ctx.createLinearGradient(pr[0], 0, pr[0] + pr[2], 0);
                gp.addColorStop(0, `rgba(${rf.rgb}, 0.05)`); gp.addColorStop(0.5, `rgba(${rf.rgb}, ${0.32 + 0.12 * Math.sin(t * 5)})`); gp.addColorStop(1, `rgba(${rf.rgb}, 0.05)`);
                ctx.fillStyle = gp; ctx.shadowColor = rf.c; ctx.shadowBlur = 8;
                ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(pr[0], pr[1], pr[2], pr[3], 2); else ctx.rect(pr[0], pr[1], pr[2], pr[3]); ctx.fill();
                ctx.shadowBlur = 0; ctx.strokeStyle = rf.c; ctx.lineWidth = 0.6; ctx.stroke();
                const ir = hudRect(F, -bx + 11, d0 + ch / 2, 0, 0);
                jkRoleGlyph(rf.k, ir[0], ir[1], 2.6, rf.c2);
            }
            for (let i = 0; i < max; i++) {
                const r = hudRect(F, bx + i * (cw + gap), d0, cw, ch);
                const c = hand[i];
                if (!c) {
                    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 0.6;
                    ctx.strokeRect(r[0] + 0.3, r[1] + 0.3, r[2] - 0.6, r[3] - 0.6);
                    continue;
                }
                const ace = !!(this.jkAce && (jkSuitOf(c) === this.jkAce || jkSuitOf(c) === 'J'));
                const fx = (this.jkCopy || ace) ? { role: this.jkCopy, ace } : null;
                if (fx && i === 0) jkCardAura(r[0] + r[2] / 2, r[1] + r[3] / 2, r[2], r[3], this.jkCopy, ace, jkNow(), -1, 0.8);
                jkCard(r[0] + r[2] / 2, r[1] + r[3] / 2, r[2], r[3], 0, 1, c, i === 0 ? 1 : 0.85, i === 0 ? 6 : (fx ? 3 : 0), fx);
            }
            if (this.jkAllIn) { ctx.font = "800 6px 'Orbitron', Arial"; ctx.fillStyle = JK_GOLD; hudText(F, 'ALL-IN', 0, d0 + ch + 4); }
        }
        // chấm Thoát Hiểm (bên trái) & Tráo Bài (bên phải)
        const escN = Math.max(this.jkEscMax || 1, this.jkEsc || 0);
        // Huy hiệu Lá Bài A (vd. "A♠") + vai trò sao chép tay kế
        if (this.jkAce && JK_SUIT[this.jkAce]) {
            const ax = bx - 6 - escN * 5 - 6;
            ctx.fillStyle = 'rgba(4, 8, 18, 0.85)'; hudRRect(F, ax - 6, d0 - 1, 12, 7, 2); ctx.fill();
            ctx.strokeStyle = JK_SUIT[this.jkAce].c; ctx.lineWidth = 0.7; ctx.stroke();
            ctx.font = "800 5.5px 'Orbitron', Arial"; ctx.fillStyle = JK_SUIT[this.jkAce].c;
            ctx.shadowColor = JK_SUIT[this.jkAce].c; ctx.shadowBlur = 4;
            hudText(F, 'A' + JK_SUIT[this.jkAce].g, ax, d0 + 2.6); ctx.shadowBlur = 0;
        }
        if (this.jkCopyNext) {
            ctx.font = "700 5px 'Orbitron', Arial"; ctx.fillStyle = JK_PINK;
            hudText(F, '⟳ ' + this.jkCopyNext.toUpperCase(), 0, d0 - 4);
        }
        for (let i = 0; i < escN; i++) {
            const r = hudRect(F, bx - 6 - i * 5, d0 + 2, 0, 0);
            ctx.fillStyle = i < (this.jkEsc || 0) ? JK_PURPLE : 'rgba(255,255,255,0.15)';
            ctx.beginPath(); ctx.arc(r[0], r[1], 1.8, 0, Math.PI * 2); ctx.fill();
        }
        // Phán Quyết (Full Evo): 5 ô tiến độ + vòng hồi chiêu
        if (jkFull(this)) {
            const n = this.jokerHitCount || 0, cd = this.jkVerdictCd || 0, py = d0 + ch + (this.jkAllIn ? 9 : 4);
            ctx.font = "800 4.6px 'Orbitron', Arial"; ctx.fillStyle = cd > 0 ? '#94a3b8' : JK_GOLD;
            hudText(F, cd > 0 ? 'PHÁN QUYẾT ' + Math.ceil(cd / 60) + 's' : 'PHÁN QUYẾT', -12, py);
            for (let i = 0; i < JK_VERDICT_HITS; i++) {
                const r = hudRect(F, 5 + i * 4.2, py, 0, 0);
                ctx.save(); ctx.translate(r[0], r[1]); ctx.rotate(Math.PI / 4);
                ctx.fillStyle = i < n ? JK_GOLD : 'rgba(255,255,255,0.15)';
                if (i < n) { ctx.shadowColor = JK_GOLD; ctx.shadowBlur = 5; }
                ctx.fillRect(-1.3, -1.3, 2.6, 2.6); ctx.restore();
            }
            if (cd > 0) {
                const r = hudRect(F, 5 + JK_VERDICT_HITS * 4.2 + 1, py, 0, 0);
                ctx.strokeStyle = JK_PURPLE; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.arc(r[0], r[1], 2, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - cd / JK_VERDICT_CD)); ctx.stroke();
            }
        }
        const rs = hudRect(F, -bx + 5, d0 + 2, 0, 0);
        ctx.strokeStyle = this.jkSwapCd > 0 ? 'rgba(255,255,255,0.2)' : JK_GOLD; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(rs[0], rs[1], 2.2, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - (this.jkSwapCd || 0) / 240)); ctx.stroke();
        ctx.restore();
    },
});

// Nút Bắn: lá kế tiếp / tiến độ xào bài / giữ Tráo Bài
function jkRegisterHUD() {
    if (typeof registerEmpowerHUD !== 'function') return;
    const ICON = { E: '▫', H: '♥', D: '♦', C: '♣', S: '♠', J: '🃏' };
    registerEmpowerHUD('joker', p => {
        const max = jkHandMax(p), hand = p.jkHand || [];
        if (p.jkReload > 0) return { pct: 1 - p.jkReload / jkReloadMax(p), ready: false, color: JK_PURPLE, label: 'XÀO BÀI', btnIcon: '🂠', dim: true };
        const h = p.jkHold || 0;
        if (h > 5 && !p.jkHoldUsed) return { pct: Math.min(1, h / JK_HOLD), ready: false, color: JK_GOLD, label: p.jkSwapCd > 0 ? 'TRÁO ' + Math.ceil(p.jkSwapCd / 60) + 's' : 'TRÁO BÀI', btnIcon: '⇄', dim: p.jkSwapCd > 0 };
        const c = hand[0] || 'E', s = jkSuitOf(c);
        let label = JK_SUIT[s].n;
        if (s === 'J' && c[1]) label = c[1] === 'R' ? 'JOKER ĐỎ' : 'JOKER ĐEN';
        if (p.jkCopy) label += ' · ' + p.jkCopy.toUpperCase();
        else if (p.jkAce && (s === p.jkAce)) label = 'A' + JK_SUIT[s].g + ' ' + label;
        else if (jkE1(p) && hand[1]) label += ' + ' + JK_SUIT[jkSuitOf(hand[1])].n;
        const rf = jkRoleFx(p.jkCopy);
        const out = { idle: s !== 'J', pct: hand.length / max, ready: s === 'J', color: rf ? rf.c : jkCardColor(c), label, btnIcon: ICON[s], segments: max, lit: hand.length };
        if (jkFull(p)) {
            const cd = p.jkVerdictCd || 0;
            out.label += cd > 0 ? ' · PQ ' + Math.ceil(cd / 60) + 's' : ' · PQ ' + (p.jokerHitCount || 0) + '/' + JK_VERDICT_HITS;
            out.pips = p.jokerHitCount || 0; out.pipMax = JK_VERDICT_HITS; out.pipColor = JK_GOLD;
        }
        return out;
    });
}
if (typeof window !== 'undefined') window.addEventListener('load', jkRegisterHUD);
