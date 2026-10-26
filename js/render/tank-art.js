// ==========================================
// Khung vẽ xe hiện đại theo từng body (thay cho khối vuông + nòng trắng cũ)
// ------------------------------------------
// registerTankArt(id, fn): fn(p, k) vẽ xe trong hệ toạ độ lưới 32×32 đặt tâm (−16..16),
//   phía trước (nòng) luôn là −y (P2 tự lật trục). Mọi chi tiết phải nằm trong khung (hitbox).
//   k = { team, teamDark, teamGlow, t (giây), evo1, evo2, full, s (px / 1 đơn vị lưới) }
// Màu đội (P1 #3498db / P2 #e74c3c) chỉ làm điểm nhấn: viền, lõi, đèn; thân dùng màu đặc trưng.
// Hiệu ứng trạng thái (đóng băng, cháy, chậm, câm) được phủ chung sau khi vẽ xe.
// File vẽ từng nhóm xe: js/render/tank-art/*.js. Đạn đặc trưng: registerBulletArt (bullet-art.js).
// ==========================================

const TANK_ART = {};
function registerTankArt(id, fn) { TANK_ART[id] = fn; }

const TEAM_COLORS = {
    1: { team: '#3498db', teamDark: '#1b4f72', teamGlow: 'rgba(52,152,219,0.55)' },
    2: { team: '#e74c3c', teamDark: '#78281f', teamGlow: 'rgba(231,76,60,0.55)' },
};

// --- Tiện ích vẽ (dùng trong hệ lưới) ---
const TA = {
    rr(x, y, w, h, r) {
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
    },
    // gradient kim loại theo trục x (sáng ở giữa)
    metal(x0, x1, dark, light) {
        const g = ctx.createLinearGradient(x0, 0, x1, 0);
        g.addColorStop(0, dark); g.addColorStop(0.5, light); g.addColorStop(1, dark);
        return g;
    },
    vgrad(y0, y1, c0, c1) {
        const g = ctx.createLinearGradient(0, y0, 0, y1);
        g.addColorStop(0, c0); g.addColorStop(1, c1);
        return g;
    },
    glow(color, blur) { ctx.shadowColor = color; ctx.shadowBlur = blur; },
    noGlow() { ctx.shadowBlur = 0; },
    // Bánh xích hai bên (x = mép trái, w = bề rộng 1 dải)
    treads(x, w, y0, y1, t, color = '#1f2937', link = '#4b5563') {
        [x, -x - w].forEach(tx => {
            ctx.fillStyle = color; TA.rr(tx, y0, w, y1 - y0, 2); ctx.fill();
            ctx.fillStyle = link;
            const off = (t * 20) % 4;
            for (let yy = y0 + off; yy < y1 - 1; yy += 4) ctx.fillRect(tx + 0.6, yy, w - 1.2, 1.5);
        });
    },
    // Nòng: x giữa, dài len từ yStart lên trên
    barrel(cx, yStart, len, w, body = '#cbd5e1', tip = null) {
        ctx.fillStyle = TA.metal(cx - w / 2, cx + w / 2, '#475569', body);
        TA.rr(cx - w / 2, yStart - len, w, len, Math.min(1.5, w / 3)); ctx.fill();
        if (tip) { ctx.fillStyle = tip; ctx.fillRect(cx - w / 2 - 0.5, yStart - len, w + 1, 2); }
    },
};

function tankArtEvoState(p) {
    const list = (typeof EVOLUTIONS !== 'undefined' && EVOLUTIONS[p.weapon]) || [];
    const evo1 = !!(list[0] && p.hasUpgrade(list[0].id));
    const evo2 = !!(list[1] && p.hasUpgrade(list[1].id));
    return { evo1, evo2, full: evo1 && evo2 && (typeof hasFullEvo !== 'function' || hasFullEvo(p)) };
}

// Trả về true nếu đã vẽ xe bằng art mới
function drawTankArt(p, statusColor) {
    const fn = TANK_ART[p.weapon];
    if (!fn) return false;
    const s = p.w / 32;
    const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
    const tc = TEAM_COLORS[p.id] || TEAM_COLORS[1];
    const evo = tankArtEvoState(p);
    const k = Object.assign({ t: Date.now() / 1000, s }, tc, evo);
    ctx.save();
    // Bóng đổ
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(cx, cy + p.h * 0.08, p.w * 0.52, p.h * 0.5, 0, 0, Math.PI * 2); ctx.fill();
    // Full Evo: vầng hào quang xoay theo màu đội để dễ phân biệt
    if (evo.full) {
        ctx.save();
        ctx.translate(cx, cy); ctx.rotate(k.t * 1.4);
        ctx.strokeStyle = tc.team; ctx.globalAlpha *= 0.55; ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 5]);
        ctx.beginPath(); ctx.arc(0, 0, p.w * 0.72, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
    }
    ctx.translate(cx, cy);
    ctx.scale(s, p.id === 1 ? s : -s);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    try { fn(p, k); } catch (e) { /* lỗi vẽ không được làm sập game */ }
    ctx.restore();
    // Phủ màu trạng thái
    if (statusColor && statusColor !== p.color) {
        ctx.save();
        ctx.globalAlpha *= 0.55;
        ctx.fillStyle = statusColor;
        TA.rr(p.x, p.y, p.w, p.h, 4); ctx.fill();
        ctx.restore();
    }
    return true;
}
