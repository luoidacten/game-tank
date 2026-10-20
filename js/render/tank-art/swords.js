// ==========================================
// Art xe & đạn nhóm "swords" (registerTankArt / registerBulletArt)
// ------------------------------------------
// Xe: Kiếm Trận, Kiếm Sư, Kiếm Khách, Kiếm Vũ, Kiếm Tôn, Phong Trảm, Cuồng Phong.
// Kiếm bay: mỗi xe một kiểu lưỡi riêng (swBlade + SW_STYLES), có vệt bóng mờ & quầng sáng.
// Chỉ vẽ (đọc trạng thái), không tạo state mới -> an toàn khi chơi online.
// ==========================================

// ---------- 1. Bộ vẽ thanh kiếm dùng chung ----------
// Kiểu lưỡi theo từng xe / nguyên tố
const SW_STYLES = {
    // Kiếm Trận: phi kiếm mảnh bạc xanh
    van_kiem: { light: '#ffffff', mid: '#cfe6f7', dark: '#6b8fb3', edge: '#ffffff', glow: '#7dd3fc', fuller: '#5b7fa6', guard: 'crescent', guardC: '#9fc4e4', hilt: '#27384f', pommel: '#7dd3fc', tip: 2.2 },
    // Kiếm Khách: kiếm khí ngọc bích (trong suốt, có khí lưu)
    kiem_khach: { light: '#ecfdf5', mid: '#6ee7b7', dark: '#047857', edge: '#f0fdf4', glow: '#34d399', fuller: '#d1fae5', guard: 'cloud', guardC: '#10b981', hilt: '#064e3b', pommel: '#a7f3d0', tip: 1.8, qi: true, translucent: 0.82 },
    kiem_khach_gold: { light: '#fffbeb', mid: '#fde68a', dark: '#b45309', edge: '#ffffff', glow: '#ffd700', fuller: '#fef3c7', guard: 'cloud', guardC: '#f59e0b', hilt: '#78350f', pommel: '#fde047', tip: 1.8, qi: true },
    kiem_khach_focus: { light: '#f0f9ff', mid: '#a5f3fc', dark: '#0e7490', edge: '#ffffff', glow: '#7dd3fc', fuller: '#e0f2fe', guard: 'cloud', guardC: '#22d3ee', hilt: '#164e63', pommel: '#cffafe', tip: 1.8, qi: true, translucent: 0.85 },
    // Kiếm Vũ: Bản Mệnh Kiếm trắng bạc
    kiem_vu: { light: '#ffffff', mid: '#e2e8f0', dark: '#94a3b8', edge: '#ffffff', glow: '#38bdf8', fuller: '#38bdf8', guard: 'wing', guardC: '#e2e8f0', hilt: '#1e293b', pommel: '#38bdf8', tip: 2.0 },
    // Kiếm Tôn: thiên kiếm trắng – vàng, viền đen
    blade_god: { light: '#ffffff', mid: '#fef9e7', dark: '#a8a29e', edge: '#ffffff', glow: '#fde68a', fuller: '#1c1917', guard: 'wing', guardC: '#f1c40f', hilt: '#0c0a09', pommel: '#f1c40f', tip: 1.6, outline: '#0c0a09' },
    blade_god_gold: { light: '#fffbeb', mid: '#fde047', dark: '#b7791f', edge: '#ffffff', glow: '#f1c40f', fuller: '#fff7d6', guard: 'wing', guardC: '#fff3b0', hilt: '#1c1917', pommel: '#ffffff', tip: 1.8 },
    // Kiếm Tôn — Quang Kiếm (kiếm ánh sáng vàng trắng) & Ám Kiếm (kiếm hắc ám đen tím)
    quang: { light: '#ffffff', mid: '#fff6c8', dark: '#f2c53d', edge: '#ffffff', glow: '#ffe066', fuller: '#ffffff', guard: 'wing', guardC: '#f1c40f', hilt: '#92400e', pommel: '#ffffff', tip: 2.3 },
    am: { light: '#7c3aed', mid: '#2e1065', dark: '#07020f', edge: '#d8b4fe', glow: '#9333ea', fuller: '#c084fc', guard: 'thorn', guardC: '#1e1032', hilt: '#050208', pommel: '#a855f7', tip: 2.6, outline: '#a855f7' },
};
// Kiếm Sư: màu theo nguyên tố
const SW_EL = {
    white: { light: '#ffffff', mid: '#e2e8f0', dark: '#94a3b8', glow: '#f8fafc', guardC: '#cbd5e1', hilt: '#334155' },
    kim: { light: '#fffbeb', mid: '#fde047', dark: '#a16207', glow: '#facc15', guardC: '#fef08a', hilt: '#422006' },
    moc: { light: '#f0fdf4', mid: '#4ade80', dark: '#166534', glow: '#22c55e', guardC: '#86efac', hilt: '#14532d' },
    hoa: { light: '#fff7ed', mid: '#fb923c', dark: '#b91c1c', glow: '#ef4444', guardC: '#fdba74', hilt: '#450a0a' },
    tho: { light: '#fef3c7', mid: '#d97706', dark: '#78350f', glow: '#b45309', guardC: '#fbbf24', hilt: '#292524' },
    thuy: { light: '#eff6ff', mid: '#60a5fa', dark: '#1e40af', glow: '#3b82f6', guardC: '#93c5fd', hilt: '#172554' },
};
function swElStyle(el) {
    const e = SW_EL[el] || SW_EL.white;
    return { light: e.light, mid: e.mid, dark: e.dark, edge: '#ffffff', glow: e.glow, fuller: e.light, guard: 'bar', guardC: e.guardC, hilt: e.hilt, pommel: e.glow, tip: 1.9, el };
}

// Đường viền lưỡi kiếm (mũi hướng +x). gx = vị trí chắn, h = nửa chiều dài, w2 = nửa bề rộng
function swBladePath(gx, h, w2, tipL) {
    ctx.beginPath();
    ctx.moveTo(gx, -w2);
    ctx.lineTo(h - tipL, -w2 * 0.88);
    ctx.quadraticCurveTo(h - tipL * 0.3, -w2 * 0.7, h, 0);
    ctx.quadraticCurveTo(h - tipL * 0.3, w2 * 0.7, h - tipL, w2 * 0.88);
    ctx.lineTo(gx, w2);
    ctx.closePath();
}

// Vẽ 1 thanh kiếm hoàn chỉnh: (x, y) tâm, ang hướng mũi, len dài, wid rộng lưỡi
function swBlade(x, y, ang, len, wid, st, alpha = 1, glowMul = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    ctx.globalAlpha *= alpha;
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    const h = len / 2, w2 = wid / 2;
    const gx = -h + len * 0.24;                  // chắn kiếm
    const tipL = Math.min(len * 0.3, wid * (st.tip || 1.8));
    // Quầng sáng + thân lưỡi (gradient 2 mặt vát -> sống kiếm nổi)
    const g = ctx.createLinearGradient(0, -w2, 0, w2);
    g.addColorStop(0, st.light); g.addColorStop(0.46, st.mid);
    g.addColorStop(0.54, st.dark); g.addColorStop(1, st.mid);
    ctx.fillStyle = g;
    if (glowMul > 0) { ctx.shadowColor = st.glow; ctx.shadowBlur = Math.max(6, wid * 2.2) * glowMul; }
    const ta = st.translucent || 1;
    ctx.globalAlpha *= ta;
    swBladePath(gx, h, w2, tipL); ctx.fill();
    ctx.globalAlpha /= ta;
    ctx.shadowBlur = 0;
    if (st.outline) { ctx.strokeStyle = st.outline; ctx.lineWidth = Math.max(0.6, wid * 0.12); ctx.stroke(); }
    // Rãnh máu (fuller)
    ctx.strokeStyle = st.fuller; ctx.globalAlpha *= 0.85;
    ctx.lineWidth = Math.max(0.5, wid * 0.16);
    ctx.beginPath(); ctx.moveTo(gx + wid * 0.5, 0); ctx.lineTo(h - tipL * 1.25, 0); ctx.stroke();
    ctx.globalAlpha /= 0.85;
    // Viền lưỡi sáng (mặt trên)
    ctx.strokeStyle = st.edge; ctx.globalAlpha *= 0.9;
    ctx.lineWidth = Math.max(0.45, wid * 0.13);
    ctx.beginPath(); ctx.moveTo(gx + 0.5, -w2 + wid * 0.08); ctx.lineTo(h - tipL, -w2 * 0.8); ctx.quadraticCurveTo(h - tipL * 0.3, -w2 * 0.6, h - 0.2, 0); ctx.stroke();
    ctx.globalAlpha /= 0.9;
    // Khí lưu chạy dọc lưỡi (kiếm khí)
    if (st.qi) {
        const ph = ((Date.now() / 260) % 1);
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        for (let i = 0; i < 2; i++) {
            const px = gx + (h - gx) * ((ph + i * 0.5) % 1);
            ctx.beginPath(); ctx.ellipse(px, 0, wid * 0.5, wid * 0.14, 0, 0, Math.PI * 2); ctx.fill();
        }
    }
    // Chắn kiếm
    const gw = wid * 1.25;
    ctx.fillStyle = st.guardC;
    ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = Math.max(0.4, wid * 0.08);
    ctx.beginPath();
    if (st.guard === 'wing') {
        // chắn cánh vuốt về phía mũi
        ctx.moveTo(gx - wid * 0.35, 0);
        ctx.quadraticCurveTo(gx - wid * 0.3, -gw, gx + wid * 0.75, -gw * 1.25);
        ctx.quadraticCurveTo(gx + wid * 0.1, -gw * 0.55, gx + wid * 0.25, 0);
        ctx.quadraticCurveTo(gx + wid * 0.1, gw * 0.55, gx + wid * 0.75, gw * 1.25);
        ctx.quadraticCurveTo(gx - wid * 0.3, gw, gx - wid * 0.35, 0);
    } else if (st.guard === 'crescent') {
        // trăng khuyết ôm chuôi
        ctx.moveTo(gx + wid * 0.2, -gw);
        ctx.quadraticCurveTo(gx - wid * 0.7, 0, gx + wid * 0.2, gw);
        ctx.quadraticCurveTo(gx - wid * 0.2, 0, gx + wid * 0.2, -gw);
    } else if (st.guard === 'thorn') {
        // chắn gai vuốt ngược (kiếm hắc ám)
        ctx.moveTo(gx + wid * 0.3, 0);
        ctx.lineTo(gx + wid * 0.1, -gw * 0.6); ctx.lineTo(gx - wid * 0.9, -gw * 1.45);
        ctx.lineTo(gx - wid * 0.25, -gw * 0.35); ctx.lineTo(gx - wid * 0.45, 0);
        ctx.lineTo(gx - wid * 0.25, gw * 0.35); ctx.lineTo(gx - wid * 0.9, gw * 1.45);
        ctx.lineTo(gx + wid * 0.1, gw * 0.6); ctx.closePath();
    } else if (st.guard === 'cloud') {
        // chắn mây tròn kiểu kiếm cổ
        ctx.ellipse(gx, -wid * 0.55, wid * 0.42, wid * 0.42, 0, 0, Math.PI * 2);
        ctx.moveTo(gx + wid * 0.42, wid * 0.55);
        ctx.ellipse(gx, wid * 0.55, wid * 0.42, wid * 0.42, 0, 0, Math.PI * 2);
        ctx.moveTo(gx + wid * 0.3, 0);
        ctx.ellipse(gx, 0, wid * 0.3, wid * 0.62, 0, 0, Math.PI * 2);
    } else {
        ctx.rect(gx - wid * 0.22, -gw, wid * 0.44, gw * 2);
    }
    ctx.fill(); ctx.stroke();
    // Chuôi quấn dây
    const hx0 = -h + wid * 0.5, hw = Math.max(0.8, wid * 0.5);
    ctx.fillStyle = st.hilt;
    ctx.fillRect(hx0, -hw / 2, gx - wid * 0.2 - hx0, hw);
    ctx.strokeStyle = 'rgba(255,255,255,0.28)'; ctx.lineWidth = Math.max(0.35, wid * 0.08);
    ctx.beginPath();
    for (let xx = hx0 + wid * 0.25; xx < gx - wid * 0.3; xx += Math.max(0.9, wid * 0.42)) { ctx.moveTo(xx, -hw / 2); ctx.lineTo(xx + wid * 0.25, hw / 2); }
    ctx.stroke();
    // Núm chuôi (ngọc)
    ctx.fillStyle = st.pommel;
    ctx.shadowColor = st.pommel; ctx.shadowBlur = glowMul > 0 ? 6 : 0;
    ctx.beginPath(); ctx.arc(hx0, 0, Math.max(0.7, wid * 0.36), 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
}

// Vệt kiếm khí + bóng mờ phía sau thanh kiếm đang bay
function swTrail(x, y, ang, len, wid, color, power = 1, ghosts = 2, st = null) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const c = Math.cos(ang), s = Math.sin(ang);
    const bx = x - c * len * 0.25, by = y - s * len * 0.25;      // khoảng chắn kiếm
    const L = len * (0.9 + 0.9 * power);
    const ex = bx - c * L, ey = by - s * L;
    const g = ctx.createLinearGradient(bx, by, ex, ey);
    g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.globalAlpha *= 0.55;
    const nx = -s, ny = c, w = wid * 0.9;
    ctx.beginPath();
    ctx.moveTo(x + c * len * 0.45 + nx * 0.1, y + s * len * 0.45 + ny * 0.1);
    ctx.lineTo(bx + nx * w, by + ny * w);
    ctx.lineTo(ex, ey);
    ctx.lineTo(bx - nx * w, by - ny * w);
    ctx.closePath(); ctx.fill();
    // lõi trắng mảnh
    ctx.globalAlpha /= 0.55; ctx.globalAlpha *= 0.5;
    const g2 = ctx.createLinearGradient(bx, by, bx - c * L * 0.6, by - s * L * 0.6);
    g2.addColorStop(0, 'rgba(255,255,255,0.9)'); g2.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.strokeStyle = g2; ctx.lineWidth = Math.max(0.8, wid * 0.25);
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx - c * L * 0.6, by - s * L * 0.6); ctx.stroke();
    ctx.restore();
    // Bóng mờ (afterimage) của chính thanh kiếm
    if (st && ghosts > 0) {
        for (let i = ghosts; i >= 1; i--) {
            const d = len * 0.32 * i * power;
            swBlade(x - c * d, y - s * d, ang, len, wid, st, 0.22 / i, 0);
        }
    }
}

// Hạt nguyên tố bay sau kiếm Kiếm Sư
function swElementParticles(x, y, ang, len, wid, el, seed) {
    if (!el || el === 'white') return;
    const t = Date.now() / 1000;
    const c = Math.cos(ang), s = Math.sin(ang), nx = -s, ny = c;
    ctx.save();
    for (let i = 0; i < 6; i++) {
        const ph = (t * 1.7 + i / 6 + seed) % 1;
        const back = len * (0.1 + ph * 1.3);
        const lat = Math.sin(i * 2.4 + t * 6 + seed * 7) * wid * (0.6 + ph * 1.2);
        const px = x - c * back + nx * lat, py = y - s * back + ny * lat;
        ctx.globalAlpha = (1 - ph) * 0.9;
        const r = Math.max(0.9, wid * 0.32) * (1 - ph * 0.4);
        if (el === 'kim') { // tia lấp lánh vàng
            ctx.strokeStyle = '#fef08a'; ctx.lineWidth = 0.9;
            ctx.beginPath(); ctx.moveTo(px - r * 1.6, py); ctx.lineTo(px + r * 1.6, py); ctx.moveTo(px, py - r * 1.6); ctx.lineTo(px, py + r * 1.6); ctx.stroke();
        } else if (el === 'moc') { // lá non
            ctx.fillStyle = i % 2 ? '#4ade80' : '#86efac';
            ctx.beginPath(); ctx.ellipse(px, py, r * 1.5, r * 0.7, t * 3 + i, 0, Math.PI * 2); ctx.fill();
        } else if (el === 'hoa') { // đốm lửa
            ctx.fillStyle = i % 2 ? '#fbbf24' : '#f97316';
            ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 5;
            ctx.beginPath(); ctx.arc(px, py, r * (1.2 - ph * 0.6), 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
        } else if (el === 'tho') { // mảnh đá
            ctx.fillStyle = i % 2 ? '#a16207' : '#d6a35c';
            ctx.save(); ctx.translate(px, py); ctx.rotate(i + t * 2);
            ctx.fillRect(-r, -r * 0.8, r * 2, r * 1.6); ctx.restore();
        } else if (el === 'thuy') { // giọt nước
            ctx.fillStyle = i % 2 ? '#93c5fd' : '#bfdbfe';
            ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.moveTo(px - r, py); ctx.lineTo(px + c * r * 2.2, py + s * r * 2.2); ctx.lineTo(px + r * nx, py + r * ny); ctx.fill();
        }
    }
    ctx.restore();
}

// Hướng bay của đạn kiếm (nếu đứng yên: theo hướng đối thủ)
function swAng(b, dirY) {
    if ((b.vx || 0) !== 0 || (b.vy || 0) !== 0) return Math.atan2(b.vy, b.vx);
    return dirY < 0 ? -Math.PI / 2 : Math.PI / 2;
}

// Kiểu lưỡi của Kiếm Khách theo màu đạn
function swKKStyle(color) {
    if (color === '#ffd700') return SW_STYLES.kiem_khach_gold;
    if (color === '#7dd3fc') return SW_STYLES.kiem_khach_focus;
    return SW_STYLES.kiem_khach;
}

// Vẽ phi kiếm của body (đạn): x,y,w,h hộp đạn
function swDrawBulletSword(b, weapon, extra) {
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    const dirY = b.swordDir || (b.owner && b.owner.id === 1 ? -1 : 1);
    const ang = swAng(b, dirY);
    const len = Math.max(b.w, b.h), wid = Math.min(b.w, b.h);
    const sp = Math.hypot(b.vx || 0, b.vy || 0);
    const power = Math.min(1.3, 0.35 + sp / 14);
    let st;
    if (weapon === 'kiem_su') st = swElStyle(b.ksEl);
    else if (weapon === 'kiem_khach') st = swKKStyle(b.color);
    else st = SW_STYLES[weapon] || SW_STYLES.van_kiem;
    const team = b.owner && b.owner.id === 2 ? '#e74c3c' : '#3498db';
    if (weapon === 'kiem_khach' && st === SW_STYLES.kiem_khach) st = Object.assign({}, st, { pommel: team });
    if (weapon === 'van_kiem') st = Object.assign({}, st, { pommel: team });
    swTrail(cx, cy, ang, len, wid, st.glow, power, 2, st);
    if (weapon === 'kiem_su') swElementParticles(cx, cy, ang, len, wid, b.ksEl, (b.x * 0.013) % 1);
    if (weapon === 'kiem_khach') { // khí ngọc xoắn quanh kiếm
        const t = Date.now() / 1000;
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        ctx.translate(cx, cy); ctx.rotate(ang);
        ctx.strokeStyle = st.glow; ctx.globalAlpha = 0.5; ctx.lineWidth = 0.9;
        for (const sg of [-1, 1]) {
            ctx.beginPath();
            for (let i = 0; i <= 12; i++) {
                const xx = len * 0.5 - i * len * 0.13;
                const yy = sg * Math.sin(i * 0.9 + t * 14) * wid * (0.5 + i * 0.07);
                if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
            }
            ctx.stroke();
        }
        ctx.restore();
    }
    swBlade(cx, cy, ang, len * 1.05, wid * 0.78, st, 1, extra && extra.glowMul || 1);
}

// ---------- 2. Kiếm của các body ----------

// Kiếm Sư & Kiếm Khách: đạn kiếm có hook riêng
if (typeof BulletHooks !== 'undefined') {
    if (BulletHooks.registry.kiem_su) BulletHooks.registry.kiem_su.draw = function (b) { swDrawBulletSword(b, 'kiem_su'); };
    if (BulletHooks.registry.kiem_khach) BulletHooks.registry.kiem_khach.draw = function (b) { swDrawBulletSword(b, 'kiem_khach'); };
}

// Kiếm Vũ: Bản Mệnh Kiếm / Kiếm Phụ / Lưu Thủy Kiếm (giữ nguyên chữ ký hàm cũ)
// core = màu sống kiếm, glow = quầng sáng
kvDrawBlade = function (x, y, ang, len, wid, core, glow, alpha = 1) {
    const big = len >= 28;
    const st = Object.assign({}, SW_STYLES.kiem_vu, { fuller: core, pommel: glow, glow });
    if (big) {
        // Quầng sáng lớn quanh Bản Mệnh Kiếm
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha *= alpha * (0.55 + 0.15 * Math.sin(Date.now() / 220));
        ctx.translate(x, y); ctx.rotate(ang);
        const rg = ctx.createRadialGradient(len * 0.1, 0, 1, len * 0.1, 0, len * 0.62);
        rg.addColorStop(0, 'rgba(255,255,255,0.55)'); rg.addColorStop(0.4, glow + '55'); rg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = rg;
        ctx.beginPath(); ctx.ellipse(len * 0.1, 0, len * 0.62, wid * 2.6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }
    swBlade(x, y, ang, len * (big ? 1.12 : 1), wid * (big ? 1.05 : 0.95), st, alpha, big ? 1.4 : 1);
    if (big) {
        // Lõi linh khí chạy trên sống kiếm
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.translate(x, y); ctx.rotate(ang); ctx.globalAlpha *= alpha;
        const ph = (Date.now() / 500) % 1;
        const L = len * 1.12;
        const px = -L * 0.2 + L * 0.6 * ph;
        const g = ctx.createRadialGradient(px, 0, 0, px, 0, wid * 1.2);
        g.addColorStop(0, '#ffffff'); g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, 0, wid * 1.2, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }
};

// Kiếm Trận & Kiếm Tôn: kiếm bay (FloatingSword) + đạn kiếm sinh ra từ nó
function swFloatStyle(o, isGreat, color) {
    const w = o && o.weapon;
    if (w === 'blade_god') return color === '#f1c40f' ? SW_STYLES.blade_god_gold : SW_STYLES.blade_god;
    if (w === 'van_kiem') return SW_STYLES.van_kiem;
    return null;
}

// Ấn trận (vòng phù văn) dưới kiếm đang chờ phóng
function swFormationGlyph(x, y, r, color, k, rot) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(x, y); ctx.rotate(rot);
    ctx.globalAlpha *= 0.35 + 0.45 * k;
    ctx.strokeStyle = color; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([2, 3]);
    ctx.beginPath(); ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; ctx.moveTo(Math.cos(a) * r * 0.7, Math.sin(a) * r * 0.7); ctx.lineTo(Math.cos(a) * r * 1.2, Math.sin(a) * r * 1.2); }
    ctx.stroke();
    ctx.restore();
}

// Thiên kiếm (Phá Thiên / Đại Kiếm): thanh kiếm khổng lồ có tia sáng & mây
function swGreatSword(cx, cy, ang, len, wid, st, power, charging) {
    const t = Date.now() / 1000;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(cx, cy); ctx.rotate(ang);
    // tia hào quang toả ra từ chắn kiếm
    const gx = -len / 2 + len * 0.24;
    ctx.globalAlpha *= 0.35 + (charging ? 0.25 : 0);
    for (let i = 0; i < 10; i++) {
        const a = i / 10 * Math.PI * 2 + t * 0.8;
        const R = wid * (1.6 + 0.5 * Math.sin(t * 5 + i));
        const g = ctx.createLinearGradient(gx, 0, gx + Math.cos(a) * R, Math.sin(a) * R);
        g.addColorStop(0, st.glow); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.strokeStyle = g; ctx.lineWidth = Math.max(1.5, wid * 0.12);
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx + Math.cos(a) * R, Math.sin(a) * R); ctx.stroke();
    }
    // quầng sáng toàn thân
    const rg = ctx.createRadialGradient(len * 0.05, 0, 0, len * 0.05, 0, len * 0.6);
    rg.addColorStop(0, 'rgba(255,255,255,0.45)'); rg.addColorStop(0.5, st.glow + '44'); rg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = rg; ctx.globalAlpha = 0.8;
    ctx.beginPath(); ctx.ellipse(len * 0.05, 0, len * 0.6, wid * 1.3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    if (!charging) swTrail(cx, cy, ang, len, wid * 0.8, st.glow, power, 2, st);
    swBlade(cx, cy, ang, len, wid * 0.62, st, 1, 1.6);
    // phù văn khắc trên lưỡi
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(ang);
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = st.glow;
    ctx.globalAlpha *= 0.55 + 0.4 * Math.sin(t * 6);
    for (let i = 0; i < 4; i++) {
        const px = gx + wid * 0.8 + i * (len * 0.5 - wid) / 4;
        ctx.beginPath(); ctx.moveTo(px, -wid * 0.12); ctx.lineTo(px + wid * 0.12, 0); ctx.lineTo(px, wid * 0.12); ctx.lineTo(px - wid * 0.12, 0); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
}

// Kiếm Tôn: kiếm bay -> Quang Kiếm (Anh Minh, Phá Thiên) / Ám Kiếm (kiếm phản đòn Kiếm Thể Thủ)
function swDrawBladeGodFloating(fs, cx, cy, ang, len, wid, dirY, team, t) {
    const waiting = fs.delay > 0;
    if (fs.isAnhMinhMarker) {
        // Anh Minh: Quang Kiếm lơ lửng trên đầu, tụ quang trước khi bắn tia
        const k = 1 - Math.max(0, fs.delay) / 60;
        swFormationGlyph(cx, cy - dirY * len * 0.15, wid * 0.9, '#f1c40f', k, t * 2);
        drawQuangKiem(cx, cy + Math.sin(t * 4) * 1.2, ang, len / 40, 1, { charge: k, team });
        return;
    }
    if (fs.isGreatSword || wid >= 18) {
        // Phá Thiên: thiên kiếm khổng lồ
        const k = waiting ? 1 - fs.delay / 120 : 1;
        if (waiting) swFormationGlyph(cx, cy - dirY * len * 0.32, wid * 0.8, '#ffe066', k, t * 1.5);
        swGreatSword(cx, cy, ang, len, wid, SW_STYLES.quang, 1, waiting);
        return;
    }
    if (wid >= 14) { // Phá Thiên nhỏ (Evo 1)
        drawQuangKiem(cx, cy, ang, len / 40, 1, { charge: waiting ? 0.5 : 0, team });
        return;
    }
    // Kiếm phản đòn Kiếm Thể Thủ -> Ám Kiếm
    if (waiting) swFormationGlyph(cx, cy - dirY * len * 0.3, wid * 1.4, '#a855f7', 1 - fs.delay / 30, t * 3);
    drawAmKiem(cx, cy, ang, len / 40, 1, { team });
}

function swDrawFloatingSword(fs) {
    const o = fs.owner;
    const st0 = swFloatStyle(o, fs.isGreatSword, fs.color);
    const dirY = o.id === 1 ? -1 : 1;
    const cx = fs.x + fs.w / 2, cy = fs.y + fs.h / 2;
    const ang = dirY < 0 ? -Math.PI / 2 : Math.PI / 2;
    const len = Math.max(fs.w, fs.h), wid = Math.min(fs.w, fs.h);
    const team = o.id === 1 ? '#3498db' : '#e74c3c';
    const t = Date.now() / 1000;
    const st = o.weapon === 'van_kiem' ? Object.assign({}, st0, { pommel: team }) : st0;
    if (o.weapon === 'blade_god') { swDrawBladeGodFloating(fs, cx, cy, ang, len, wid, dirY, team, t); return; }
    const waiting = fs.delay > 0;
    if (fs.isGreatSword || wid >= 18) {
        const k = waiting ? 1 - fs.delay / 120 : 1;
        if (waiting) swFormationGlyph(cx, cy - dirY * len * 0.32, wid * 0.8, st.glow, k, t * 1.5);
        swGreatSword(cx, cy, ang, len, wid, st, 1, waiting);
        return;
    }
    // Kiếm thường đang chờ phóng: ấn trận nhỏ + rung
    if (waiting) swFormationGlyph(cx, cy - dirY * len * 0.3, wid * 1.4, st.glow, 1 - fs.delay / 30, t * 3);
    swBlade(cx, cy, ang, len * 1.05, Math.max(3, wid * 0.75), st, 1, 1);
}

if (typeof FloatingSword !== 'undefined') {
    const _fsDraw = FloatingSword.prototype.draw;
    FloatingSword.prototype.draw = function () {
        if (!this.active) return;
        if (!this.owner || !swFloatStyle(this.owner, this.isGreatSword, this.color)) return _fsDraw.call(this);
        try { swDrawFloatingSword(this); } catch (e) { _fsDraw.call(this); }
    };
}

// Đạn kiếm (sau khi FloatingSword phóng đi) — gọi từ js/player/render.js
function swDrawFloatingBullet(b) {
    const o = b.owner;
    const st0 = o && swFloatStyle(o, b.isGreatSword, b.color);
    if (!st0) return false;
    const team = o.id === 1 ? '#3498db' : '#e74c3c';
    const st = o.weapon === 'van_kiem' ? Object.assign({}, st0, { pommel: team }) : st0;
    const dirY = o.id === 1 ? -1 : 1;
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    const ang = swAng(b, dirY);
    const len = Math.max(b.w, b.h), wid = Math.min(b.w, b.h);
    const sp = Math.hypot(b.vx || 0, b.vy || 0);
    if (o.weapon === 'blade_god') {
        if (b.isGreatSword || wid >= 18) swGreatSword(cx, cy, ang, len, wid, SW_STYLES.quang, Math.min(1.2, sp / 18), false);
        else if (wid >= 14) drawQuangKiem(cx, cy, ang, len / 40, 1, { trail: Math.min(1.3, 0.4 + sp / 14), team });
        else drawAmKiem(cx, cy, ang, len / 40, 1, { trail: Math.min(1.3, 0.4 + sp / 14), team });
        return true;
    }
    if (b.isGreatSword || wid >= 18) { swGreatSword(cx, cy, ang, len, wid, st, Math.min(1.2, sp / 18), false); return true; }
    swTrail(cx, cy, ang, len, wid, st.glow, Math.min(1.3, 0.4 + sp / 14), 2, st);
    swBlade(cx, cy, ang, len * 1.05, Math.max(3, wid * 0.75), st, 1, 1);
    return true;
}

// Kiếm Thể Thủ: kiếm hộ thân xoay quanh xe — gọi từ js/player/render.js (đã translate về tâm quỹ đạo)
function swDrawShieldSword(p) {
    if (p.weapon === 'blade_god') { drawAmKiem(0, 0, 0, 0.58, 1, { team: p.id === 1 ? '#3498db' : '#e74c3c' }); return; }
    const st0 = swFloatStyle(p, false, null) || SW_STYLES.van_kiem;
    const st = Object.assign({}, st0, { pommel: p.id === 1 ? '#3498db' : '#e74c3c' });
    // kiếm tiếp tuyến với quỹ đạo, mũi theo chiều xoay
    swTrail(0, 0, 0, 22, 5, st.glow, 0.6, 1, st);
    swBlade(0, 0, 0, 22, 4.5, st, 1, 1.2);
}

// Kiếm Tôn: Hư Vô Kiếm (đạn hu_vo 12×35) -> Ám Kiếm bay
function swDrawHuVoSword(b) {
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    const ang = swAng(b, b.owner && b.owner.id === 1 ? -1 : 1);
    const sp = Math.hypot(b.vx || 0, b.vy || 0);
    drawAmKiem(cx, cy, ang, Math.max(b.w, b.h) / 40, 1, { trail: Math.min(1.3, 0.4 + sp / 14), team: b.owner && b.owner.id === 2 ? '#e74c3c' : '#3498db' });
}
// Cầu Hư Vô / hố đen nhỏ: drawHuVoOrb(x, y, r, vx, vy) — dùng lại cho hố đen
function drawHuVoOrb(x, y, r, vx = 0, vy = 0) { swDrawHuVo({ x: x - r, y: y - r, w: r * 2, h: r * 2, vx, vy }); }
// Cầu đen hư không có quầng câm lặng tím (b = hộp x,y,w,h + vận tốc)
function swDrawHuVo(b) {
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    const t = Date.now() / 1000;
    const R = Math.min(b.w, b.h) / 2 + 1.5;
    const sp = Math.hypot(b.vx || 0, b.vy || 0) || 1;
    ctx.save();
    // Vệt hư không phía sau
    ctx.globalCompositeOperation = 'lighter';
    const tx = cx - (b.vx || 0) / sp * R * 4, ty = cy - (b.vy || 0) / sp * R * 4;
    const tg = ctx.createLinearGradient(cx, cy, tx, ty);
    tg.addColorStop(0, 'rgba(168, 85, 247, 0.55)'); tg.addColorStop(1, 'rgba(88, 28, 135, 0)');
    ctx.strokeStyle = tg; ctx.lineWidth = R * 1.4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(tx, ty); ctx.stroke();
    // Quầng câm lặng
    const halo = ctx.createRadialGradient(cx, cy, R * 0.8, cx, cy, R * 2.3);
    halo.addColorStop(0, 'rgba(192, 132, 252, 0.6)'); halo.addColorStop(1, 'rgba(76, 29, 149, 0)');
    ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(cx, cy, R * 2.3, 0, Math.PI * 2); ctx.fill();
    // Vòng xoáy hút vào
    ctx.strokeStyle = 'rgba(216, 180, 254, 0.75)'; ctx.lineWidth = 1.2;
    for (let i = 0; i < 3; i++) {
        const a0 = t * 4 + i * Math.PI * 2 / 3;
        ctx.beginPath(); ctx.arc(cx, cy, R * 1.45, a0, a0 + 1.1); ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
    // Lõi đen tuyệt đối + chân trời sự kiện
    const core = ctx.createRadialGradient(cx - R * 0.25, cy - R * 0.25, 0, cx, cy, R);
    core.addColorStop(0, '#1e1b2e'); core.addColorStop(0.75, '#05030a'); core.addColorStop(1, '#000000');
    ctx.fillStyle = core;
    ctx.shadowColor = '#a855f7'; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#c084fc'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(233, 213, 255, 0.55)';
    ctx.beginPath(); ctx.arc(cx - R * 0.35, cy - R * 0.35, R * 0.18, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}

// ---------- Kiếm Tôn: Quang Kiếm / Ám Kiếm (hàm vẽ dùng lại được) ----------
// drawQuangKiem(x, y, ang, scale, alpha, opts): kiếm ánh sáng vàng trắng, mũi theo góc ang (rad, 0 = +x).
//   scale 1 ≈ dài 40px, rộng 7px. opts = { trail: 0..1.3 (vệt bay), charge: 0..1 (tụ quang), team: màu đội }
function drawQuangKiem(x, y, ang, scale = 1, alpha = 1, opts = {}) {
    const len = 40 * scale, wid = 7 * scale;
    const t = Date.now() / 1000;
    const charge = opts.charge || 0;
    const st = opts.team ? Object.assign({}, SW_STYLES.quang, { pommel: opts.team }) : SW_STYLES.quang;
    ctx.save();
    ctx.globalAlpha *= alpha;
    // Hào quang thân kiếm
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(x, y); ctx.rotate(ang);
    const pulse = 0.75 + 0.25 * Math.sin(t * 6);
    const rg = ctx.createRadialGradient(len * 0.08, 0, 0, len * 0.08, 0, len * 0.62);
    rg.addColorStop(0, `rgba(255,255,240,${0.5 * pulse + 0.3 * charge})`); rg.addColorStop(0.45, 'rgba(255,214,90,0.28)'); rg.addColorStop(1, 'rgba(255,200,60,0)');
    ctx.fillStyle = rg;
    ctx.beginPath(); ctx.ellipse(len * 0.08, 0, len * 0.62, wid * (2.2 + charge), 0, 0, Math.PI * 2); ctx.fill();
    // Tia sáng chữ thập tại chắn kiếm
    const gx = -len / 2 + len * 0.24;
    const R = wid * (2.2 + 1.5 * charge) * pulse;
    ctx.fillStyle = 'rgba(255,250,220,0.85)';
    ctx.beginPath();
    ctx.moveTo(gx - R, 0); ctx.lineTo(gx, -wid * 0.22); ctx.lineTo(gx + R, 0); ctx.lineTo(gx, wid * 0.22); ctx.closePath();
    ctx.moveTo(gx, -R); ctx.lineTo(gx + wid * 0.22, 0); ctx.lineTo(gx, R); ctx.lineTo(gx - wid * 0.22, 0); ctx.closePath();
    ctx.fill();
    ctx.restore();
    if (opts.trail) swTrail(x, y, ang, len, wid, '#ffe066', opts.trail, 2, st);
    swBlade(x, y, ang, len, wid, st, 1, 1.5 + charge);
    // Lõi sáng trắng + tinh quang ở mũi
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(x, y); ctx.rotate(ang);
    ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = Math.max(0.8, wid * 0.2);
    ctx.beginPath(); ctx.moveTo(gx + wid * 0.4, 0); ctx.lineTo(len / 2 - wid * 0.6, 0); ctx.stroke();
    const sp = wid * (0.9 + 0.6 * Math.sin(t * 9));
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.moveTo(len / 2 - sp, 0); ctx.lineTo(len / 2, -wid * 0.12); ctx.lineTo(len / 2 + sp, 0); ctx.lineTo(len / 2, wid * 0.12); ctx.closePath();
    ctx.moveTo(len / 2, -sp); ctx.lineTo(len / 2 + wid * 0.12, 0); ctx.lineTo(len / 2, sp); ctx.lineTo(len / 2 - wid * 0.12, 0); ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.restore();
}

// drawAmKiem(x, y, ang, scale, alpha, opts): kiếm hắc ám đen – tím, có khói hư không & vết nứt phát sáng.
//   opts = { trail: 0..1.3, team: màu đội }
function drawAmKiem(x, y, ang, scale = 1, alpha = 1, opts = {}) {
    const len = 40 * scale, wid = 7 * scale;
    const t = Date.now() / 1000;
    const st = opts.team ? Object.assign({}, SW_STYLES.am, { pommel: opts.team }) : SW_STYLES.am;
    const c = Math.cos(ang), s = Math.sin(ang), nx = -s, ny = c;
    ctx.save();
    ctx.globalAlpha *= alpha;
    // Khói tím hư không cuộn phía sau
    const puffs = opts.trail ? 7 : 4;
    for (let i = 0; i < puffs; i++) {
        const ph = (t * 1.4 + i / puffs) % 1;
        const back = len * (0.15 + ph * (opts.trail ? 1.3 : 0.6));
        const lat = Math.sin(i * 2.1 + t * 4) * wid * (0.4 + ph);
        const px = x - c * back + nx * lat, py = y - s * back + ny * lat;
        const r = wid * (0.6 + ph * 1.1);
        const g = ctx.createRadialGradient(px, py, 0, px, py, r);
        g.addColorStop(0, `rgba(88, 28, 135, ${0.55 * (1 - ph)})`); g.addColorStop(1, 'rgba(20, 5, 40, 0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
    }
    // Quầng tối viền tím
    ctx.save();
    ctx.translate(x, y); ctx.rotate(ang);
    const rg = ctx.createRadialGradient(len * 0.05, 0, 0, len * 0.05, 0, len * 0.6);
    rg.addColorStop(0, 'rgba(10, 2, 20, 0.55)'); rg.addColorStop(0.6, 'rgba(147, 51, 234, 0.22)'); rg.addColorStop(1, 'rgba(147, 51, 234, 0)');
    ctx.fillStyle = rg; ctx.beginPath(); ctx.ellipse(len * 0.05, 0, len * 0.6, wid * 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    if (opts.trail) swTrail(x, y, ang, len, wid, 'rgba(147, 51, 234, 0.9)', opts.trail, 2, st);
    swBlade(x, y, ang, len, wid, st, 1, 1.3);
    // Vết nứt năng lượng zigzag trên sống kiếm
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(x, y); ctx.rotate(ang);
    const gx = -len / 2 + len * 0.24;
    ctx.strokeStyle = `rgba(216, 180, 254, ${0.65 + 0.3 * Math.sin(t * 8)})`;
    ctx.lineWidth = Math.max(0.7, wid * 0.14);
    ctx.shadowColor = '#a855f7'; ctx.shadowBlur = 6;
    ctx.beginPath(); ctx.moveTo(gx + wid * 0.5, 0);
    const n = 6;
    for (let i = 1; i <= n; i++) ctx.lineTo(gx + wid * 0.5 + (len / 2 - wid * 1.5 - gx) * i / n, (i % 2 ? 1 : -1) * wid * 0.17);
    ctx.stroke();
    ctx.restore();
    ctx.restore();
}

// ---------- 3. Phong Trảm: lưỡi gió bán nguyệt xoay tròn ----------
// Hình bán nguyệt (lưỡi liềm) đơn: mép ngoài là cung tròn bán kính R (lồi về +x),
// mép trong là cung của đường tròn lệch tâm ra sau -> một lưỡi duy nhất, hai đầu nhọn.
const SW_BLADE_A = Math.PI * 0.64;  // nửa góc mở của lưỡi (~115°)
const SW_BLADE_O = 0.32;            // độ lệch tâm cung trong (theo R) -> độ dày lưỡi
function swCrescentInner(R) {
    const tx = R * Math.cos(SW_BLADE_A), ty = R * Math.sin(SW_BLADE_A), o = R * SW_BLADE_O;
    return { o, ri: Math.hypot(tx + o, ty), ai: Math.atan2(ty, tx + o) };
}
function swCrescentPath(R) {
    const c = swCrescentInner(R);
    ctx.beginPath();
    ctx.arc(0, 0, R, -SW_BLADE_A, SW_BLADE_A, false);   // mép ngoài (lưỡi sắc)
    ctx.arc(-c.o, 0, c.ri, c.ai, -c.ai, true);           // mép trong
    ctx.closePath();
}

function swDrawWindBlade(b) {
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    const dirY = b.vy < 0 ? -1 : 1;
    const ang = dirY < 0 ? -Math.PI / 2 : Math.PI / 2;
    const ratio = Math.max(0, Math.min(1.75, (b.w - 20) / 40)); // 0 = nhát nhẹ, 1 = full lực, 1.75 = auto-full
    const big = b.w >= 58;
    const R = b.w * 0.42;
    const t = Date.now() / 1000;
    const team = b.owner && b.owner.id === 2 ? '#e74c3c' : '#3498db';
    const acc = b.isAccelerated;
    const spin = 0;                              // người dùng: lưỡi gió không xoay
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(ang);                             // +x = hướng bay
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.globalCompositeOperation = 'lighter';

    // 1. Sợi gió cuộn phía sau (cung mảnh trôi ngược hướng bay)
    const nStreak = 4 + Math.round(ratio * 4);
    for (let i = 0; i < nStreak; i++) {
        const ph = (t * (1.8 + ratio * 0.5) + i / nStreak) % 1;
        const lane = ((i * 0.618) % 1) * 2 - 1;
        const x0 = -R * 0.4 - ph * R * (2.2 + ratio * 0.6);
        const y0 = lane * R * 0.8;
        const L = R * (0.7 + 0.5 * (1 - Math.abs(lane)));
        const curl = (i % 2 ? 1 : -1) * R * 0.18;
        ctx.globalAlpha = (1 - ph) * 0.45;
        ctx.strokeStyle = i % 3 === 0 ? '#ffffff' : '#a5f3fc';
        ctx.lineWidth = 1 + ratio * 0.5;
        ctx.beginPath(); ctx.moveTo(x0, y0);
        ctx.quadraticCurveTo(x0 - L * 0.5, y0 + curl, x0 - L, y0 + curl * 0.3);
        ctx.stroke();
    }
    // 2. Vòng xoáy gió mờ quanh lưỡi (cung xoay ngược chiều)
    ctx.lineWidth = 1 + ratio * 0.4;
    ctx.strokeStyle = '#cffafe';
    for (let i = 0; i < 2 + (big ? 1 : 0); i++) {
        const a0 = -spin * 0.6 + i * 2.1;
        ctx.globalAlpha = 0.3 - i * 0.07;
        ctx.beginPath(); ctx.arc(-i * R * 0.15, 0, R * (1.08 + i * 0.16), a0, a0 + 1.6); ctx.stroke();
    }
    // 3. Quầng sáng tròn
    ctx.globalAlpha = 0.3 + 0.12 * Math.min(1, ratio);
    const rg = ctx.createRadialGradient(0, 0, R * 0.2, 0, 0, R * 1.35);
    rg.addColorStop(0, 'rgba(165, 243, 252, 0.35)'); rg.addColorStop(1, 'rgba(34, 211, 238, 0)');
    ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(0, 0, R * 1.35, 0, Math.PI * 2); ctx.fill();

    // 4. Lưỡi xoay quanh tâm: bóng xoay (motion blur) + thân
    ctx.save();
    ctx.rotate(spin);
    const ghosts = 2 + (big ? 1 : 0);
    for (let g = ghosts; g >= 1; g--) {
        ctx.save();
        ctx.rotate(-g * 0.32);                   // các vị trí quay trước đó
        ctx.globalAlpha = 0.16 * (ghosts + 1 - g) / ghosts;
        ctx.fillStyle = g % 2 ? 'rgba(103, 232, 249, 0.85)' : 'rgba(186, 230, 253, 0.85)';
        swCrescentPath(R * (1 - g * 0.03)); ctx.fill();
        ctx.restore();
    }
    // thân: gradient tỏa tròn — trong mờ lam, ra mép ngoài trắng sáng
    ctx.globalAlpha = 0.95;
    const g1 = ctx.createRadialGradient(-R * SW_BLADE_O, 0, R * 0.45, 0, 0, R);
    g1.addColorStop(0, 'rgba(14, 165, 233, 0.1)');
    g1.addColorStop(0.55, 'rgba(103, 232, 249, 0.75)');
    g1.addColorStop(1, 'rgba(255, 255, 255, 0.95)');
    ctx.fillStyle = g1;
    ctx.shadowColor = acc ? '#ffffff' : '#22d3ee'; ctx.shadowBlur = 10 + ratio * 10;
    swCrescentPath(R); ctx.fill();
    ctx.shadowBlur = 0;
    // mép ngoài sắc trắng
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5 + ratio * 1.1;
    ctx.beginPath(); ctx.arc(0, 0, R - ctx.lineWidth * 0.4, -Math.PI * 0.58, Math.PI * 0.58); ctx.stroke();
    // nhấn màu đội ở mép trong
    const c = swCrescentInner(R);
    ctx.globalAlpha = 0.7;
    ctx.strokeStyle = team; ctx.lineWidth = 1.2 + ratio * 0.4;
    ctx.beginPath(); ctx.arc(-c.o, 0, c.ri + 0.6, c.ai * 0.55, -c.ai * 0.55, true); ctx.stroke();
    // viền gió thứ 2 ôm sát mép ngoài (nhát lực / auto-full)
    if (ratio > 0.45) {
        ctx.globalAlpha = 0.6;
        ctx.strokeStyle = '#e0f2fe'; ctx.lineWidth = 1 + ratio * 0.5;
        ctx.beginPath(); ctx.arc(R * 0.08, 0, R * 1.04, -Math.PI * 0.42, Math.PI * 0.42); ctx.stroke();
    }
    ctx.restore();

    // 5. Hạt gió nhỏ văng ra phía sau
    const nP = 5 + Math.round(ratio * 5);
    ctx.fillStyle = '#ecfeff';
    for (let i = 0; i < nP; i++) {
        const ph = (t * 1.6 + i * 0.37) % 1;
        const a = i * 2.39996 + t * 2;
        const rr = R * (0.6 + 0.5 * ((i * 0.31) % 1));
        const px = -R * 0.55 + Math.cos(a) * rr * 0.25 - ph * R * 1.8;
        const py = Math.sin(a) * rr * 0.9;
        ctx.globalAlpha = (1 - ph) * 0.8;
        ctx.beginPath(); ctx.arc(px, py, (1 + ratio * 0.5) * (1 - ph * 0.5), 0, Math.PI * 2); ctx.fill();
    }
    // 6. Full lực / auto-full: tâm lốc sáng + tia gió nhọn phía trước
    if (big || ratio >= 0.95) {
        ctx.globalAlpha = 0.3 + 0.15 * Math.sin(t * 18);
        const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 0.35);
        cg.addColorStop(0, '#ffffff'); cg.addColorStop(1, 'rgba(165, 243, 252, 0)');
        ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(0, 0, R * 0.35, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.2; ctx.globalAlpha = 0.6;
        for (let i = 0; i < 4; i++) {
            const a = -0.75 + i * 0.5 + Math.sin(t * 7 + i) * 0.08;
            const k1 = (t * 3 + i * 0.3) % 1;
            const r0 = R * 1.12, r1 = R * (1.3 + 0.3 * k1);
            ctx.beginPath(); ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1); ctx.stroke();
        }
    }
    ctx.restore();
}

// Tường Gió (Phong Trảm Full Evo): dải gió cuộn ngang
if (typeof WindWall !== 'undefined') {
    WindWall.prototype.draw = function () {
        if (!this.active) return;
        const t = Date.now() / 1000;
        const k = Math.min(1, this.lifeTime / 30);
        const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
        const hw = this.w / 2, hh = this.h / 2;
        ctx.save();
        ctx.globalAlpha = k;
        ctx.translate(cx, cy);
        const g = ctx.createLinearGradient(0, -hh * 1.6, 0, hh * 1.6);
        g.addColorStop(0, 'rgba(165,243,252,0)'); g.addColorStop(0.5, 'rgba(165,243,252,0.35)'); g.addColorStop(1, 'rgba(165,243,252,0)');
        ctx.fillStyle = g;
        TA.rr(-hw, -hh * 1.6, this.w, hh * 3.2, hh); ctx.fill();
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round';
        for (let i = 0; i < 7; i++) {
            const lane = (i / 6) * 2 - 1;
            const ph = (t * 1.6 + i * 0.29) % 1;
            ctx.strokeStyle = i % 2 ? 'rgba(255,255,255,0.75)' : 'rgba(103,232,249,0.8)';
            ctx.lineWidth = 1.5;
            const y = lane * hh * 0.85;
            const x0 = -hw + ph * this.w * 0.6;
            ctx.beginPath(); ctx.moveTo(x0, y);
            for (let s = 1; s <= 6; s++) ctx.lineTo(x0 + s * 8, y + Math.sin(t * 8 + s + i) * 2);
            ctx.stroke();
        }
        // xoáy hai đầu
        ctx.strokeStyle = '#e0f2fe'; ctx.lineWidth = 2;
        for (const sg of [-1, 1]) {
            ctx.beginPath(); ctx.arc(sg * (hw - hh * 0.6), 0, hh * 0.8, t * 6 * sg, t * 6 * sg + 4.2); ctx.stroke();
        }
        ctx.strokeStyle = this.owner && this.owner.id === 2 ? '#e74c3c' : '#3498db'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(-hw + 4, hh); ctx.lineTo(hw - 4, hh); ctx.moveTo(-hw + 4, -hh); ctx.lineTo(hw - 4, -hh); ctx.stroke();
        ctx.restore();
    };
}

// ---------- 4. Cuồng Phong: lốc xoáy (Hư Ảnh & Bóng Hư Ảnh) ----------
function swDrawVortex(cx, cy, R, team, alpha, t, spin = 1) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.globalAlpha *= alpha;
    // Quầng
    const rg = ctx.createRadialGradient(0, 0, R * 0.1, 0, 0, R * 1.1);
    rg.addColorStop(0, 'rgba(255,255,255,0.7)'); rg.addColorStop(0.35, 'rgba(45, 212, 191, 0.45)'); rg.addColorStop(1, 'rgba(13, 148, 136, 0)');
    ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(0, 0, R * 1.1, 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    // Các cánh gió xoắn ốc
    const arms = 4;
    for (let a = 0; a < arms; a++) {
        const base = a * Math.PI * 2 / arms + t * 7 * spin;
        for (let j = 0; j < 3; j++) {
            ctx.strokeStyle = j === 0 ? 'rgba(255,255,255,0.9)' : (j === 1 ? 'rgba(94, 234, 212, 0.7)' : 'rgba(45, 212, 191, 0.4)');
            ctx.lineWidth = (3.2 - j) * Math.max(0.8, R / 18);
            ctx.beginPath();
            for (let i = 0; i <= 14; i++) {
                const f = i / 14;
                const r = R * (0.12 + f * (0.92 - j * 0.08));
                const th = base + f * 2.6 * spin - j * 0.12 * spin;
                const x = Math.cos(th) * r, y = Math.sin(th) * r;
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
    }
    // Vòng ngoài màu đội
    ctx.strokeStyle = team; ctx.lineWidth = 1.6; ctx.globalAlpha *= 0.8;
    ctx.beginPath(); ctx.arc(0, 0, R * 0.98, t * 5 * spin, t * 5 * spin + 1.6); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, R * 0.98, t * 5 * spin + Math.PI, t * 5 * spin + Math.PI + 1.6); ctx.stroke();
    // Dải gió mỏng bên ngoài + mảnh vụn bay quanh
    ctx.strokeStyle = 'rgba(204, 251, 241, 0.55)'; ctx.lineWidth = 1;
    for (let a = 0; a < 3; a++) {
        const b0 = a * 2.094 - t * 9 * spin;
        ctx.beginPath(); ctx.arc(0, 0, R * 1.2, b0, b0 + 0.9); ctx.stroke();
    }
    for (let j = 0; j < 8; j++) {
        const ang = t * (6 + (j % 3)) * spin + j * 0.785, rr = R * (0.7 + (j % 4) * 0.15);
        ctx.fillStyle = j % 2 ? 'rgba(226, 232, 240, 0.85)' : 'rgba(94, 234, 212, 0.9)';
        ctx.fillRect(Math.cos(ang) * rr - 1.2, Math.sin(ang) * rr - 1.2, 2.4, 2.4);
    }
    // Mắt bão
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#f0fdfa';
    ctx.beginPath(); ctx.arc(0, 0, Math.max(1.5, R * 0.12), 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}

function swDrawStormPhantom(b) {
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    const t = Date.now() / 1000;
    const team = b.owner && b.owner.id === 2 ? '#e74c3c' : '#3498db';
    const R = Math.min(b.w, b.h) / 2;
    const dirY = (b.vy || 0) < 0 ? -1 : ((b.vy || 0) > 0 ? 1 : (b.owner && b.owner.id === 1 ? -1 : 1));
    // Vệt gió xoáy phía sau
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 1; i <= 4; i++) {
        ctx.globalAlpha = 0.28 / i;
        swDrawVortex(cx, cy - dirY * R * 0.9 * i, R * (1 - i * 0.12), team, 1, t - i * 0.05, 1);
    }
    const g = ctx.createLinearGradient(cx, cy, cx, cy - dirY * R * 6);
    g.addColorStop(0, 'rgba(94, 234, 212, 0.45)'); g.addColorStop(1, 'rgba(94, 234, 212, 0)');
    ctx.globalAlpha = 1;
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(cx - R * 0.9, cy); ctx.lineTo(cx + R * 0.9, cy); ctx.lineTo(cx, cy - dirY * R * 6); ctx.closePath(); ctx.fill();
    ctx.restore();
    swDrawVortex(cx, cy, R * 1.05, team, 1, t, 1);
}

function swDrawStormShadow(b) {
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    const t = Date.now() / 1000;
    const team = b.owner && b.owner.id === 2 ? '#e74c3c' : '#3498db';
    const R = Math.min(b.w, b.h) / 2;
    ctx.save();
    ctx.globalAlpha = 0.75;
    swDrawVortex(cx, cy, R, team, 0.85, t, -1);
    // Bóng xe mờ ở giữa (hư ảnh)
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = 'rgba(15, 118, 110, 0.8)';
    TA.rr(cx - R * 0.45, cy - R * 0.45, R * 0.9, R * 0.9, R * 0.25); ctx.fill();
    ctx.strokeStyle = team; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.restore();
}

// ---------- 5. Khung xe ----------
const SWT = {
    // viền đội phát sáng
    rim(k, lw = 1.6) { ctx.strokeStyle = k.team; ctx.lineWidth = lw; TA.glow(k.teamGlow, 6); ctx.stroke(); TA.noGlow(); },
    gem(x, y, r, c, glow) {
        const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
        g.addColorStop(0, '#ffffff'); g.addColorStop(0.35, c); g.addColorStop(1, glow || c);
        ctx.fillStyle = g; TA.glow(c, 8);
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); TA.noGlow();
    },
};

// Kiếm Trận (26): thân vuông bạc xanh, 4 phi kiếm xoay quanh theo trận đồ
registerTankArt('van_kiem', (p, k) => {
    TA.treads(-15.5, 4, -13, 14, k.t);
    // Thân
    ctx.fillStyle = TA.metal(-11.5, 11.5, '#3b5574', '#b9d3ea');
    TA.rr(-11.5, -11, 23, 24, 4); ctx.fill();
    SWT.rim(k, 1.5);
    // Trận đồ khắc trên nắp
    ctx.strokeStyle = 'rgba(125, 211, 252, 0.55)'; ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.arc(0, 1.5, 8.2, 0, Math.PI * 2); ctx.stroke();
    ctx.save(); ctx.translate(0, 1.5); ctx.rotate(-k.t * 0.8);
    ctx.beginPath();
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; ctx.moveTo(Math.cos(a) * 5, Math.sin(a) * 5); ctx.lineTo(Math.cos(a + Math.PI / 2) * 5, Math.sin(a + Math.PI / 2) * 5); }
    ctx.stroke(); ctx.restore();
    // Nòng: một lưỡi kiếm ngắn chĩa ra trước
    swBlade(0, -11.5, -Math.PI / 2, 11, 3.6, Object.assign({}, SW_STYLES.van_kiem, { pommel: k.team }), 1, 0.6);
    // Lõi trận
    SWT.gem(0, 1.5, 3.2, k.team, k.teamDark);
    // Phi kiếm xoay quanh (4 / Evo 1: 6 / Full: 8)
    const n = k.full ? 8 : (k.evo1 ? 6 : 4);
    const stance = p.isInSwordStance;
    const R = 12.6;
    const st = Object.assign({}, SW_STYLES.van_kiem, { pommel: k.team });
    for (let i = 0; i < n; i++) {
        const a = k.t * (stance ? 3.2 : 1.3) + i * Math.PI * 2 / n;
        const x = Math.cos(a) * R, y = Math.sin(a) * R + 1;
        // kiếm nằm tiếp tuyến, mũi theo chiều xoay
        swBlade(x, y, a + Math.PI / 2, n > 4 ? 7.5 : 8.5, 2.2, st, 1, stance ? 1.2 : 0.7);
    }
    if (k.evo2) { // Evo 2: vòng kiếm khí
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.45)'; ctx.lineWidth = 1;
        ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.arc(0, 1, 15, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    }
});

// Kiếm Sư (28): thân xám xanh gọn, 2 trường kiếm hai bên, lõi ngũ hành
registerTankArt('kiem_su', (p, k) => {
    const next = (p.ksQueue && p.ksQueue[0]) || 'white';
    const ec = KS_COLOR[next] || '#f8fafc';
    TA.treads(-11, 3.5, -10, 14, k.t, '#1e293b');
    // Thân thon (hình thoi bo)
    ctx.fillStyle = TA.metal(-8, 8, '#334155', '#94a3b8');
    ctx.beginPath();
    ctx.moveTo(0, -13); ctx.lineTo(7.5, -6); ctx.lineTo(7.5, 12); ctx.quadraticCurveTo(0, 15, -7.5, 12); ctx.lineTo(-7.5, -6); ctx.closePath();
    ctx.fill(); SWT.rim(k, 1.4);
    // Hai trường kiếm gắn hai bên (mũi hướng trước), lưỡi phát sáng theo nguyên tố kế tiếp
    const st = Object.assign(swElStyle(next), { pommel: k.team });
    swBlade(-12.6, -0.5, -Math.PI / 2, 29, 2.8, st, 1, 0.9);
    swBlade(12.6, -0.5, -Math.PI / 2, 29, 2.8, st, 1, 0.9);
    // Ngũ hành bàn (5 điểm nguyên tố) quanh lõi
    const els = ['kim', 'moc', 'thuy', 'hoa', 'tho'];
    ctx.strokeStyle = 'rgba(226,232,240,0.5)'; ctx.lineWidth = 0.9;
    ctx.beginPath();
    for (let i = 0; i <= 5; i++) {
        const a = -Math.PI / 2 + (i * 2 % 5) * Math.PI * 2 / 5 + k.t * 0.5;
        const x = Math.cos(a) * 5.6, y = 2 + Math.sin(a) * 5.6;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    els.forEach((e, i) => {
        const a = -Math.PI / 2 + i * Math.PI * 2 / 5 + k.t * 0.5;
        ctx.fillStyle = KS_COLOR[e]; ctx.globalAlpha = e === next ? 1 : 0.65;
        ctx.beginPath(); ctx.arc(Math.cos(a) * 5.6, 2 + Math.sin(a) * 5.6, e === next ? 1.9 : 1.3, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;
    SWT.gem(0, 2, 2.9, ec, k.teamDark);
    // Mũi phóng kiếm phía trước
    ctx.fillStyle = TA.metal(-2, 2, '#475569', '#e2e8f0');
    TA.rr(-1.8, -15, 3.6, 5, 1); ctx.fill();
    ctx.fillStyle = ec; ctx.fillRect(-1.8, -15.5, 3.6, 1.6);
    if (k.full) { // Full Evo: 2 kiếm hộ tống nhỏ trên vai
        swBlade(-5.2, -9, -Math.PI / 2, 9, 1.8, st, 0.9, 0.6);
        swBlade(5.2, -9, -Math.PI / 2, 9, 1.8, st, 0.9, 0.6);
    }
});

// Kiếm Khách (30): thân ngọc gọn, kiếm đeo chéo sau lưng, vòng khí quanh thân
registerTankArt('kiem_khach', (p, k) => {
    const d = p.kkData;
    const gold = d && d.hoaThan;
    const focus = (p.kkFocus || 0) > 0;
    const jade = gold ? '#f59e0b' : '#10b981';
    // Vòng khí
    ctx.save();
    ctx.rotate(k.t * (focus ? 2.4 : 0.9));
    ctx.strokeStyle = gold ? 'rgba(253, 224, 71, 0.7)' : (focus ? 'rgba(125, 211, 252, 0.75)' : 'rgba(52, 211, 153, 0.6)');
    ctx.lineWidth = 1.5; ctx.setLineDash([5, 3, 1.5, 3]);
    TA.glow(gold ? '#ffd700' : '#34d399', 6);
    ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]); TA.noGlow();
    ctx.restore();
    TA.treads(-13, 3.6, -10, 12, k.t, '#0f2a24', '#2f5f52');
    // Thân lục giác bo
    ctx.fillStyle = TA.metal(-9.5, 9.5, '#064e3b', gold ? '#fcd34d' : '#5eead4');
    ctx.beginPath();
    ctx.moveTo(0, -12); ctx.lineTo(9.5, -6); ctx.lineTo(9.5, 7); ctx.lineTo(0, 12.5); ctx.lineTo(-9.5, 7); ctx.lineTo(-9.5, -6); ctx.closePath();
    ctx.fill(); SWT.rim(k, 1.5);
    // Kiếm đeo chéo sau lưng (chuôi ló ra sau bên phải)
    const st = Object.assign({}, gold ? SW_STYLES.kiem_khach_gold : SW_STYLES.kiem_khach, { pommel: k.team, translucent: 1, qi: false });
    swBlade(-1, 3, -Math.PI * 0.78, 26, 3.4, st, 1, 0.7);
    // Dải đai đeo kiếm
    ctx.strokeStyle = '#3f2a14'; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(-7, 9); ctx.lineTo(6, -4); ctx.stroke();
    // Đầu/ngọc tâm
    SWT.gem(0, -3.5, 3, gold ? '#ffd700' : (focus ? '#7dd3fc' : '#6ee7b7'), k.teamDark);
    // Mũi phi kiếm
    ctx.fillStyle = TA.metal(-1.8, 1.8, '#065f46', '#d1fae5');
    ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(2, -11.5); ctx.lineTo(-2, -11.5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = k.team; ctx.fillRect(-2.2, -11.8, 4.4, 1.6);
    if (k.evo1 || k.evo2) { // tua kiếm (tassel) đung đưa
        ctx.strokeStyle = k.team; ctx.lineWidth = 1.5;
        const sw = Math.sin(k.t * 3) * 1.5;
        ctx.beginPath(); ctx.moveTo(8.5, 11); ctx.quadraticCurveTo(9 + sw, 13, 8 + sw, 15); ctx.stroke();
    }
    if (k.full) {
        ctx.fillStyle = jade;
        for (let i = 0; i < 3; i++) {
            const a = k.t * 1.8 + i * Math.PI * 2 / 3;
            ctx.beginPath(); ctx.arc(Math.cos(a) * 15, Math.sin(a) * 15, 1.4, 0, Math.PI * 2); ctx.fill();
        }
    }
});

// Kiếm Vũ (28): thân hẹp trắng bạc, kiếm lớn cắm dọc giữa thân
registerTankArt('kiem_vu', (p, k) => {
    const home = p.kvSwState === undefined || p.kvSwState === KV_SW_FLOAT;
    const blood = (p.kvSat || 0) >= 100;
    TA.treads(-12.5, 3.4, -9, 13, k.t, '#1e293b', '#64748b');
    // Cánh áo/giáp hai bên
    ctx.fillStyle = TA.metal(-9, 9, '#64748b', '#f1f5f9');
    ctx.beginPath();
    ctx.moveTo(0, -14); ctx.lineTo(6.5, -7); ctx.lineTo(8.5, 8); ctx.lineTo(4, 14); ctx.lineTo(-4, 14); ctx.lineTo(-8.5, 8); ctx.lineTo(-6.5, -7); ctx.closePath();
    ctx.fill(); SWT.rim(k, 1.4);
    // Rãnh kiếm giữa thân
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.moveTo(0, -15); ctx.lineTo(2.6, -10); ctx.lineTo(2.6, 11); ctx.lineTo(-2.6, 11); ctx.lineTo(-2.6, -10); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = blood ? KV_BLOOD : KV_WATER; ctx.lineWidth = 1;
    TA.glow(blood ? KV_BLOOD : KV_WATER, home ? 8 : 3);
    ctx.globalAlpha = home ? 1 : 0.5 + 0.3 * Math.sin(k.t * 6);
    ctx.stroke(); ctx.globalAlpha = 1; TA.noGlow();
    // Kiếm lớn cắm dọc (chỉ khi Bản Mệnh Kiếm đang ở nhà; khi phóng đi rãnh trống phát sáng)
    if (home) {
        const st = Object.assign({}, SW_STYLES.kiem_vu, { pommel: k.team, fuller: blood ? KV_BLOOD : KV_WATER, glow: blood ? KV_BLOOD : KV_WATER });
        swBlade(0, -1, -Math.PI / 2, 29, 4.2, st, 1, 0.8);
    } else {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.fillRect(-1, -9, 2, 19);
    }
    // Vai giáp + đèn đội
    ctx.fillStyle = k.team;
    TA.rr(-8, 3, 2.2, 5, 1); ctx.fill(); TA.rr(5.8, 3, 2.2, 5, 1); ctx.fill();
    if (k.evo1 || k.evo2) {
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.6)'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(-6.5, -7); ctx.lineTo(-11, -12); ctx.moveTo(6.5, -7); ctx.lineTo(11, -12); ctx.stroke();
    }
    if (k.full) {
        ctx.fillStyle = 'rgba(165, 243, 252, 0.9)';
        for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * 11, -12); ctx.lineTo(sx * 12.5, -9); ctx.lineTo(sx * 10, -10); ctx.closePath(); ctx.fill(); }
    }
});

// Kiếm Tôn (30): thân đen tuyền viền trắng, thiên kiếm ngang trên nóc, lõi Hư Vô
registerTankArt('blade_god', (p, k) => {
    TA.treads(-15, 3.8, -11, 13, k.t, '#0c0a09', '#44403c');
    // Thân bát giác obsidian
    ctx.fillStyle = TA.metal(-11, 11, '#0c0a09', '#44403c');
    ctx.beginPath();
    ctx.moveTo(-6, -12); ctx.lineTo(6, -12); ctx.lineTo(11, -7); ctx.lineTo(11, 8); ctx.lineTo(6, 13); ctx.lineTo(-6, 13); ctx.lineTo(-11, 8); ctx.lineTo(-11, -7); ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#f5f5f4'; ctx.lineWidth = 1.2; ctx.stroke();
    SWT.rim(k, 0.9);
    // Lõi Hư Vô (cầu đen quầng tím) ở thân sau
    const hv = ctx.createRadialGradient(0, 5, 0.5, 0, 5, 6);
    hv.addColorStop(0, '#000'); hv.addColorStop(0.6, '#0b0614'); hv.addColorStop(1, 'rgba(168, 85, 247, 0.0)');
    ctx.fillStyle = 'rgba(168, 85, 247, 0.35)'; ctx.beginPath(); ctx.arc(0, 5, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = hv; ctx.beginPath(); ctx.arc(0, 5, 4.3, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#c084fc'; ctx.lineWidth = 0.9;
    ctx.beginPath(); ctx.arc(0, 5, 4.3, k.t * 3, k.t * 3 + 4); ctx.stroke();
    // Nòng: hai ngạnh trắng
    ctx.fillStyle = TA.metal(-3, 3, '#a8a29e', '#ffffff');
    TA.rr(-3, -16, 2, 5, 0.8); ctx.fill(); TA.rr(1, -16, 2, 5, 0.8); ctx.fill();
    ctx.fillStyle = k.team; ctx.fillRect(-1, -14.5, 2, 3);
    // Thiên kiếm nằm ngang phía trên xe
    const st = k.evo1 ? SW_STYLES.blade_god_gold : SW_STYLES.blade_god;
    swBlade(0, -6.5, 0, 31, 4.4, Object.assign({}, st, { pommel: k.team }), 1, k.full ? 1.4 : 0.8);
    if (k.evo2) { // Evo 2: 2 kiếm nhỏ chéo hai bên
        swBlade(-8, 2, -Math.PI * 0.62, 10, 2, SW_STYLES.blade_god, 0.95, 0.5);
        swBlade(8, 2, -Math.PI * 0.38, 10, 2, SW_STYLES.blade_god, 0.95, 0.5);
    }
    if (p.swordShieldActive) {
        ctx.strokeStyle = 'rgba(253, 230, 138, 0.6)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.stroke();
    }
});

// Phong Trảm (30): thân mỏng trắng xanh, lưỡi gió cong phía trước như kiếm ngang
registerTankArt('wind_slash', (p, k) => {
    const ch = Math.min(1, (p.chargeLevel || 0) / 7);
    TA.treads(-13.5, 3.5, -4, 14, k.t, '#0f2a3a', '#3e6b80');
    // Thân mỏng
    ctx.fillStyle = TA.metal(-9.5, 9.5, '#164e63', '#e0f2fe');
    TA.rr(-9.5, -4, 19, 17, 5); ctx.fill();
    SWT.rim(k, 1.4);
    // Gân gió chạy dọc thân
    ctx.strokeStyle = 'rgba(103, 232, 249, 0.75)'; ctx.lineWidth = 1.1;
    const off = (k.t * 14) % 6;
    for (const sx of [-5, 0, 5]) {
        ctx.beginPath(); ctx.moveTo(sx, 11 - off); ctx.lineTo(sx, 7 - off); ctx.stroke();
    }
    // Lõi đội
    SWT.gem(0, 6, 2.6, k.team, k.teamDark);
    // Lưỡi cong phía trước (trăng khuyết ngang)
    ctx.save();
    ctx.translate(0, -5);
    const g = ctx.createLinearGradient(0, 2, 0, -10);
    g.addColorStop(0, '#0e7490'); g.addColorStop(0.6, '#a5f3fc'); g.addColorStop(1, '#ffffff');
    ctx.fillStyle = g;
    TA.glow('#22d3ee', 4 + ch * 14);
    ctx.beginPath();
    ctx.moveTo(-15.5, 1.5);
    ctx.quadraticCurveTo(0, -17, 15.5, 1.5);
    ctx.quadraticCurveTo(0, -8, -15.5, 1.5);
    ctx.fill(); TA.noGlow();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.moveTo(-14.5, 0.8); ctx.quadraticCurveTo(0, -16.2, 14.5, 0.8); ctx.stroke();
    // Tụ lực: lưỡi sáng dần + gió cuộn
    if (ch > 0.05) {
        ctx.globalAlpha = ch;
        ctx.strokeStyle = ch >= 0.98 ? k.team : '#67e8f9'; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(-11, -1.5); ctx.quadraticCurveTo(0, -12.5, 11, -1.5); ctx.stroke();
        ctx.globalAlpha = 1;
    }
    ctx.restore();
    // Trục đỡ lưỡi
    ctx.fillStyle = '#334155'; ctx.fillRect(-1.5, -6, 3, 3);
    if (k.evo1 || k.evo2) { // cánh gió sau đuôi
        ctx.fillStyle = 'rgba(165, 243, 252, 0.8)';
        for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * 9.5, 8); ctx.lineTo(sx * 13, 15); ctx.lineTo(sx * 8, 12.5); ctx.closePath(); ctx.fill(); }
    }
    if (k.full) {
        ctx.strokeStyle = 'rgba(224, 242, 254, 0.7)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(0, 4, 13, k.t * 4, k.t * 4 + 1.2); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 4, 13, k.t * 4 + Math.PI, k.t * 4 + Math.PI + 1.2); ctx.stroke();
    }
});

// Cuồng Phong (30): thân tròn xanh ngọc, 2 cánh quạt xoáy hai bên
registerTankArt('storm', (p, k) => {
    const ch = Math.min(1, p.stormChargeRatio || 0);
    const spin = k.t * (5 + ch * 22);
    // Lao thân: xe xoay tít, mờ dần hòa vào lốc xoáy (vẽ lốc ở drawStorm)
    if (p.stHidden) return; // ẩn trong Gió Lốc / Lôi Bão
    if (p.stormDashState === 1) { ctx.rotate(k.t * 40); ctx.globalAlpha *= 0.4; ctx.scale(0.8, 0.8); }
    // Hai cánh quạt
    for (const sx of [-1, 1]) {
        ctx.save();
        ctx.translate(sx * 10, 2);
        ctx.fillStyle = '#0f3d3a';
        ctx.beginPath(); ctx.arc(0, 0, 5.8, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = k.team; ctx.lineWidth = 1.2; ctx.stroke();
        ctx.rotate(spin * sx);
        for (let i = 0; i < 3; i++) {
            ctx.rotate(Math.PI * 2 / 3);
            const g = ctx.createLinearGradient(0, 0, 0, -5.4);
            g.addColorStop(0, '#5eead4'); g.addColorStop(1, '#f0fdfa');
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(3.6, -2.5, 1.2, -5.4); ctx.quadraticCurveTo(-0.8, -3, 0, 0); ctx.fill();
        }
        ctx.fillStyle = '#ccfbf1'; ctx.beginPath(); ctx.arc(0, 0, 1.2, 0, Math.PI * 2); ctx.fill();
        // vệt xoáy mờ khi quay nhanh
        if (ch > 0.2) {
            ctx.strokeStyle = `rgba(204, 251, 241, ${0.3 + ch * 0.4})`; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(0, 0, 5, 0, 2.5); ctx.stroke();
        }
        ctx.restore();
    }
    // Thân giữa
    ctx.fillStyle = TA.metal(-6.5, 6.5, '#115e59', '#99f6e4');
    ctx.beginPath(); ctx.ellipse(0, 1, 6.5, 11.5, 0, 0, Math.PI * 2); ctx.fill();
    SWT.rim(k, 1.4);
    // Mắt bão trên nắp
    ctx.save(); ctx.translate(0, 1.5); ctx.rotate(-k.t * 3);
    ctx.strokeStyle = 'rgba(240, 253, 250, 0.85)'; ctx.lineWidth = 1.1;
    for (let i = 0; i < 3; i++) { ctx.rotate(Math.PI * 2 / 3); ctx.beginPath(); ctx.arc(1.5, 0, 3.2, Math.PI * 0.9, Math.PI * 1.8); ctx.stroke(); }
    ctx.restore();
    SWT.gem(0, 1.5, 1.8, k.team, k.teamDark);
    // Nòng gió ngắn
    ctx.fillStyle = TA.metal(-2, 2, '#134e4a', '#ccfbf1');
    TA.rr(-2, -15.5, 4, 6, 1.2); ctx.fill();
    ctx.fillStyle = k.team; ctx.fillRect(-2.3, -15.8, 4.6, 1.5);
    if (k.evo1) { // vây đuôi
        ctx.fillStyle = 'rgba(94, 234, 212, 0.85)';
        ctx.beginPath(); ctx.moveTo(-3.5, 11); ctx.lineTo(0, 15.5); ctx.lineTo(3.5, 11); ctx.closePath(); ctx.fill();
    }
    if (k.evo2) { // ăng-ten khiên gió
        ctx.strokeStyle = 'rgba(204, 251, 241, 0.7)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(0, 1, 9, -Math.PI * 0.85, -Math.PI * 0.15); ctx.stroke();
    }
});
